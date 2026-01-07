const BuildService = require('../services/buildService');
const Build = require('../models/Build');
const s3Service = require('../services/s3Service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class DownloadController {
  // Download school system
  async downloadSystem(req, res, next) {
    try {
      const { buildId } = req.params;
      const userId = req.user.id;

      // Check if user has access
      const build = await Build.findOne({ buildId })
        .populate({
          path: 'order',
          match: { user: userId }
        })
        .populate('school');

      if (!build || !build.order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Build not found or access denied' 
        });
      }

      if (build.status !== 'completed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Build is not yet completed' 
        });
      }

      if (!build.downloadUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'Download URL not available' 
        });
      }

      // Increment download count
      await BuildService.incrementDownloadCount(buildId);

      // Log download
      logger.info(`System downloaded: ${buildId} by user ${userId}`, {
        school: build.school?.name,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Redirect to signed URL
      res.redirect(build.downloadUrl);

    } catch (error) {
      logger.error('Download system error:', error);
      next(error);
    }
  }

  // Get download info
  async getDownloadInfo(req, res, next) {
    try {
      const { buildId } = req.params;
      const userId = req.user.id;

      // Check if user has access
      const build = await Build.findOne({ buildId })
        .populate({
          path: 'order',
          match: { user: userId }
        })
        .populate('school', 'name package');

      if (!build || !build.order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Build not found or access denied' 
        });
      }

      const downloadInfo = {
        buildId: build.buildId,
        schoolName: build.school?.name,
        package: build.school?.package,
        status: build.status,
        downloadUrl: build.status === 'completed' ? build.downloadUrl : null,
        downloadCount: build.downloadCount,
        lastDownloadAt: build.lastDownloadAt,
        fileSize: build.metadata?.fileSize,
        version: build.metadata?.version,
        expiresAt: build.expiresAt,
        installationGuide: this.getInstallationGuide(build.school?.package)
      };

      res.status(200).json({
        success: true,
        data: downloadInfo
      });

    } catch (error) {
      logger.error('Get download info error:', error);
      next(error);
    }
  }

  // Generate new download link
  async generateNewLink(req, res, next) {
    try {
      const { buildId } = req.params;
      const userId = req.user.id;

      // Check if user has access
      const build = await Build.findOne({ buildId })
        .populate({
          path: 'order',
          match: { user: userId }
        });

      if (!build || !build.order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Build not found or access denied' 
        });
      }

      if (build.status !== 'completed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Build is not yet completed' 
        });
      }

      // Check if download has expired
      if (build.expiresAt && new Date() > build.expiresAt) {
        return res.status(400).json({ 
          success: false, 
          message: 'Download link has expired. Please contact support.' 
        });
      }

      // Generate new signed URL
      const fileKey = `builds/${buildId}/school-system.zip`;
      const newUrl = await s3Service.generateSignedUrl(fileKey, 24 * 60 * 60); // 24 hours

      // Update build with new URL
      build.downloadUrl = newUrl;
      await build.save();

      logger.info(`New download link generated for build ${buildId}`);

      res.status(200).json({
        success: true,
        message: 'New download link generated',
        data: { downloadUrl: newUrl }
      });

    } catch (error) {
      logger.error('Generate new link error:', error);
      next(error);
    }
  }

  // Get installation guide
  getInstallationGuide(packageType) {
    const guides = {
      small: `
        # Installation Guide - Small School Package
        
        1. **Extract the ZIP file** to your web server directory
        2. **Upload files** to your hosting server (cPanel, Plesk, or FTP)
        3. **Create MySQL database** from your hosting control panel
        4. **Configure .env file** with your database credentials
        5. **Run installation**: Access https://yourdomain.com/install
        6. **Follow the setup wizard** to complete installation
        7. **Login** with the admin credentials you provided
        
        **System Requirements:**
        - PHP 7.4 or higher
        - MySQL 5.7 or higher
        - Apache/Nginx web server
        - 100MB disk space
      `,
      medium: `
        # Installation Guide - Medium School Package
        
        1. **Extract the ZIP file** to your server
        2. **Upload all files** to your web hosting
        3. **Create database** and user with full privileges
        4. **Edit config/database.php** with your credentials
        5. **Run setup script**: Navigate to /setup in your browser
        6. **Complete the installation wizard**
        7. **Configure SMTP** for email notifications
        8. **Set up cron jobs** for automated tasks
        
        **Additional Features:**
        - Advanced reporting module
        - Library management
        - Inventory tracking
        - Biometric integration support
      `,
      lifetime: `
        # Installation Guide - Lifetime Package
        
        1. **Extract the package** to your preferred directory
        2. **Upload to your VPS/Cloud Server**
        3. **Set up environment**: Node.js, MongoDB, Redis
        4. **Configure .env** with all required settings
        5. **Install dependencies**: npm install
        6. **Build frontend**: npm run build
        7. **Initialize database**: npm run db:seed
        8. **Start the application**: npm start
        9. **Set up PM2/Nginx** for production
        
        **Full System Features:**
        - Complete source code access
        - All modules enabled
        - White-label customization
        - API documentation included
      `,
      enterprise: `
        # Installation Guide - Enterprise Package
        
        **For Enterprise Deployment:**
        
        1. **Docker Deployment** (Recommended):
           docker-compose up -d
        
        2. **Kubernetes Deployment**:
           kubectl apply -f k8s/
        
        3. **Manual Deployment**:
           - Set up load balancer
           - Configure multiple app servers
           - Set up MongoDB cluster
           - Configure Redis cluster
           - Set up file storage (S3/MinIO)
           - Configure CDN
        
        **Support Included:**
        - 24/7 technical support
        - Dedicated account manager
        - Custom development hours
        - Priority updates and patches
      `
    };

    return guides[packageType] || guides.small;
  }

  // Verify download availability
  async verifyDownload(req, res, next) {
    try {
      const { buildId } = req.params;

      const build = await Build.findOne({ buildId });
      if (!build) {
        return res.status(404).json({ 
          success: false, 
          message: 'Build not found' 
        });
      }

      const isAvailable = 
        build.status === 'completed' && 
        build.downloadUrl && 
        (!build.expiresAt || new Date() < build.expiresAt);

      res.status(200).json({
        success: true,
        data: {
          available: isAvailable,
          status: build.status,
          expiresAt: build.expiresAt,
          downloadCount: build.downloadCount
        }
      });

    } catch (error) {
      logger.error('Verify download error:', error);
      next(error);
    }
  }
}

module.exports = new DownloadController();
