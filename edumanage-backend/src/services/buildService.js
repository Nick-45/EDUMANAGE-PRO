const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const util = require('util');
const crypto = require('crypto');
const logger = require('../utils/logger');
const Build = require('../models/Build');
const School = require('../models/School');
const Order = require('../models/Order');
const s3Service = require('./s3Service');
const config = require('../config/env');

const execPromise = util.promisify(exec);

class BuildService {
  constructor() {
    this.templateDir = path.join(__dirname, '../../templates');
    this.buildsDir = path.join(__dirname, '../../builds');
  }

  // Initialize build directory
  async initBuildDirectory() {
    try {
      await fs.mkdir(this.buildsDir, { recursive: true });
      logger.info('Build directory initialized');
    } catch (error) {
      logger.error('Failed to initialize build directory:', error);
      throw error;
    }
  }

  // Create a new build
  async createBuild(orderId, schoolId, userId) {
    try {
      // Fetch order and school
      const order = await Order.findById(orderId);
      const school = await School.findById(schoolId);
      
      if (!order || !school) {
        throw new Error('Order or school not found');
      }

      // Create build record
      const build = await Build.create({
        order: orderId,
        school: schoolId,
        user: userId,
        package: order.package.type,
        status: 'queued',
        progress: 0
      });

      logger.info(`Build created: ${build.buildId} for order ${order.orderId}`);

      return {
        success: true,
        buildId: build.buildId,
        message: 'Build queued successfully'
      };

    } catch (error) {
      logger.error('Failed to create build:', error);
      throw error;
    }
  }

  // Process build
  async processBuild(buildId) {
    let build;
    
    try {
      // Fetch build
      build = await Build.findOne({ buildId });
      if (!build) {
        throw new Error('Build not found');
      }

      // Update build status
      build.status = 'processing';
      build.startedAt = new Date();
      build.stages = [];
      await build.save();

      logger.info(`Starting build ${buildId}`);

      // Fetch school and order data
      const school = await School.findById(build.school)
        .populate('createdBy', 'email fullName');
      const order = await Order.findById(build.order);

      // Create build directory
      const buildPath = path.join(this.buildsDir, buildId);
      await fs.mkdir(buildPath, { recursive: true });

      // Stage 1: Copy template
      await this.addBuildStage(build, 'copy_template', 'Copying template files...');
      await this.copyTemplate(build.package, buildPath);
      build.progress = 20;
      await build.save();

      // Stage 2: Configure system
      await this.addBuildStage(build, 'configuration', 'Configuring system...');
      await this.configureSystem(buildPath, school, order);
      build.progress = 40;
      await build.save();

      // Stage 3: Generate database
      await this.addBuildStage(build, 'database', 'Generating database...');
      const dbFile = await this.generateDatabase(buildPath, school, order);
      build.progress = 60;
      await build.save();

      // Stage 4: Install dependencies
      await this.addBuildStage(build, 'dependencies', 'Installing dependencies...');
      await this.installDependencies(buildPath);
      build.progress = 80;
      await build.save();

      // Stage 5: Create package
      await this.addBuildStage(build, 'packaging', 'Creating package...');
      const packageFile = await this.createPackage(buildId, buildPath);
      build.progress = 90;
      await build.save();

      // Stage 6: Upload to storage
      await this.addBuildStage(build, 'upload', 'Uploading to storage...');
      const downloadUrl = await this.uploadToStorage(buildId, packageFile, dbFile);
      build.progress = 100;
      await build.save();

      // Update build with success
      build.status = 'completed';
      build.completedAt = new Date();
      build.downloadUrl = downloadUrl;
      build.metadata = {
        buildTime: build.completedAt - build.startedAt,
        fileSize: await this.getFileSize(packageFile),
        version: '1.0.0',
        dependencies: await this.getDependencies(buildPath)
      };
      await build.save();

      // Update order
      await Order.findByIdAndUpdate(build.order, {
        buildStatus: 'completed',
        downloadUrl: downloadUrl,
        status: 'completed'
      });

      // Update school
      await School.findByIdAndUpdate(build.school, {
        'metadata.buildId': buildId,
        'metadata.downloadUrl': downloadUrl,
        'metadata.lastUpdate': new Date(),
        status: 'active'
      });

      // Send completion email
      const emailService = require('./emailService');
      await emailService.sendBuildCompletionNotification({
        buildId,
        schoolName: school.name,
        downloadUrl,
        userEmail: school.createdBy.email
      });

      logger.info(`Build completed successfully: ${buildId}`);

      // Clean up local files
      await this.cleanupBuild(buildPath);

      return {
        success: true,
        buildId,
        downloadUrl,
        message: 'Build completed successfully'
      };

    } catch (error) {
      logger.error(`Build ${buildId} failed:`, error);
      
      if (build) {
        build.status = 'failed';
        build.error = error.message;
        build.completedAt = new Date();
        await build.save();

        // Update order
        await Order.findByIdAndUpdate(build.order, {
          buildStatus: 'failed',
          status: 'failed'
        });
      }

      throw error;
    }
  }

  // Add build stage
  async addBuildStage(build, name, description) {
    const stage = {
      name,
      status: 'processing',
      startedAt: new Date()
    };

    build.stages.push(stage);
    await build.save();

    logger.info(`Build stage started: ${name} - ${description}`);

    return stage;
  }

  // Complete build stage
  async completeBuildStage(build, name) {
    const stage = build.stages.find(s => s.name === name && !s.completedAt);
    if (stage) {
      stage.status = 'completed';
      stage.completedAt = new Date();
      await build.save();
      logger.info(`Build stage completed: ${name}`);
    }
  }

  // Copy template files
  async copyTemplate(packageType, destination) {
    const templatePath = path.join(this.templateDir, packageType);
    
    try {
      await fs.access(templatePath);
    } catch {
      // Use base template if specific template doesn't exist
      templatePath = path.join(this.templateDir, 'base-system');
    }

    await this.copyDirectory(templatePath, destination);
  }

  // Configure system with school data
  async configureSystem(buildPath, school, order) {
    const configPath = path.join(buildPath, 'config');
    
    // Create config directory if it doesn't exist
    await fs.mkdir(configPath, { recursive: true });

    // Create school configuration
    const schoolConfig = {
      school: {
        id: school._id.toString(),
        name: school.name,
        motto: school.motto,
        address: school.address,
        contact: school.contact,
        logo: school.logo?.url || '',
        settings: school.settings,
        features: school.features
      },
      package: {
        type: order.package.type,
        name: order.package.name,
        expires: order.package.duration === 'lifetime' ? null : school.subscription.endDate
      },
      admin: {
        email: school.createdBy.email,
        fullName: school.createdBy.fullName
      },
      system: {
        version: '1.0.0',
        buildDate: new Date().toISOString(),
        apiBaseUrl: config.SERVER_URL,
        supportEmail: config.SMTP_FROM
      }
    };

    // Write configuration files
    await fs.writeFile(
      path.join(configPath, 'school.json'),
      JSON.stringify(schoolConfig, null, 2)
    );

    // Update environment variables
    const envContent = `
# School Management System - ${school.name}
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school_${school._id}
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
JWT_EXPIRE=7d
CLIENT_URL=https://${school.slug}.schoolsystem.com
API_URL=${config.SERVER_URL}
EMAIL_HOST=${config.SMTP_HOST}
EMAIL_PORT=${config.SMTP_PORT}
EMAIL_USER=${config.SMTP_USER}
EMAIL_PASS=${config.SMTP_PASS}
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
    `.trim();

    await fs.writeFile(path.join(buildPath, '.env.example'), envContent);

    // Update package.json with school name
    const packageJsonPath = path.join(buildPath, 'package.json');
    if (await fs.access(packageJsonPath).then(() => true).catch(() => false)) {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      packageJson.name = `school-system-${school.slug}`;
      packageJson.description = `School Management System for ${school.name}`;
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  // Generate initial database
  async generateDatabase(buildPath, school, order) {
    const dbPath = path.join(buildPath, 'database');
    await fs.mkdir(dbPath, { recursive: true });

    const dbData = {
      users: [
        {
          email: school.createdBy.email,
          fullName: school.createdBy.fullName,
          role: 'admin',
          school: school._id.toString(),
          createdAt: new Date().toISOString()
        }
      ],
      school: {
        ...school.toObject(),
        _id: school._id.toString(),
        createdBy: school.createdBy._id.toString()
      },
      settings: {
        academicYear: school.settings.academicYear,
        terms: school.settings.terms,
        gradingSystem: school.settings.gradingSystem
      },
      system: {
        package: order.package.type,
        installedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const dbFile = path.join(dbPath, 'initial-data.json');
    await fs.writeFile(dbFile, JSON.stringify(dbData, null, 2));

    return dbFile;
  }

  // Install dependencies
  async installDependencies(buildPath) {
    const packageJsonPath = path.join(buildPath, 'package.json');
    
    if (await fs.access(packageJsonPath).then(() => true).catch(() => false)) {
      try {
        await execPromise('npm install --production', { cwd: buildPath });
        logger.info('Dependencies installed successfully');
      } catch (error) {
        logger.warn('Failed to install dependencies:', error.message);
        // Continue without dependencies
      }
    }
  }

  // Create package (zip file)
  async createPackage(buildId, buildPath) {
    const outputPath = path.join(this.buildsDir, `${buildId}.zip`);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        logger.info(`Package created: ${outputPath} (${archive.pointer()} bytes)`);
        resolve(outputPath);
      });

      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(buildPath, false);
      archive.finalize();
    });
  }

  // Upload to storage
  async uploadToStorage(buildId, packageFile, dbFile) {
    try {
      // Upload main package
      const packageKey = `builds/${buildId}/school-system.zip`;
      await s3Service.uploadFile(packageFile, packageKey);

      // Upload database file
      const dbKey = `builds/${buildId}/database.json`;
      await s3Service.uploadFile(dbFile, dbKey);

      // Generate download URL (with CloudFront)
      const downloadUrl = `${config.AWS_CLOUDFRONT_URL}/${packageKey}`;

      // Generate signed URL for temporary access
      const signedUrl = await s3Service.generateSignedUrl(packageKey, 24 * 60 * 60); // 24 hours

      logger.info(`Build uploaded to storage: ${downloadUrl}`);

      return signedUrl;

    } catch (error) {
      logger.error('Failed to upload build to storage:', error);
      throw error;
    }
  }

  // Utility: Copy directory recursively
  async copyDirectory(source, destination) {
    await fs.mkdir(destination, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  // Utility: Get file size
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  // Utility: Get dependencies
  async getDependencies(buildPath) {
    const packageJsonPath = path.join(buildPath, 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      return Object.keys(packageJson.dependencies || {});
    } catch {
      return [];
    }
  }

  // Clean up build directory
  async cleanupBuild(buildPath) {
    try {
      await fs.rm(buildPath, { recursive: true, force: true });
      logger.info(`Cleaned up build directory: ${buildPath}`);
    } catch (error) {
      logger.warn('Failed to clean up build directory:', error.message);
    }
  }

  // Get build status
  async getBuildStatus(buildId) {
    const build = await Build.findOne({ buildId })
      .populate('school', 'name')
      .populate('order', 'orderId package')
      .populate('user', 'email fullName');

    if (!build) {
      throw new Error('Build not found');
    }

    return {
      buildId: build.buildId,
      status: build.status,
      progress: build.progress,
      stages: build.stages,
      downloadUrl: build.downloadUrl,
      downloadCount: build.downloadCount,
      createdAt: build.createdAt,
      startedAt: build.startedAt,
      completedAt: build.completedAt,
      estimatedTimeRemaining: build.estimatedTimeRemaining,
      school: build.school,
      order: build.order
    };
  }

  // Increment download count
  async incrementDownloadCount(buildId) {
    const build = await Build.findOneAndUpdate(
      { buildId },
      { 
        $inc: { downloadCount: 1 },
        lastDownloadAt: new Date()
      },
      { new: true }
    );

    return build;
  }
}

module.exports = new BuildService();
