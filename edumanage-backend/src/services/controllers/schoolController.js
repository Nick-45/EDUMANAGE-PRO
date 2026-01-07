const School = require('../models/School');
const User = require('../models/User');
const BuildService = require('../services/buildService');
const EmailService = require('../services/emailService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class SchoolController {
  // Setup school after payment
  async setupSchool(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        orderId,
        schoolName, 
        schoolMotto, 
        schoolAddress,
        adminEmail,
        adminPassword,
        adminFullName 
      } = req.body;

      const userId = req.user.id;
      const logoFile = req.file;

      // Validate order exists and payment is completed
      const Order = require('../models/Order');
      const order = await Order.findOne({ 
        orderId,
        user: userId,
        'payment.status': 'completed',
        status: 'confirmed'
      });

      if (!order) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order not found or payment not completed' 
        });
      }

      // Check if school already exists for this order
      let school = await School.findOne({ order: order._id });
      if (school) {
        return res.status(400).json({ 
          success: false, 
          message: 'School already set up for this order' 
        });
      }

      // Upload logo if provided
      let logoData = null;
      if (logoFile) {
        const s3Service = require('../services/s3Service');
        const logoKey = `schools/logos/${orderId}-${Date.now()}${logoFile.originalname.substring(logoFile.originalname.lastIndexOf('.'))}`;
        const logoUrl = await s3Service.uploadFile(logoFile.path, logoKey, logoFile.mimetype);
        
        logoData = {
          url: logoUrl,
          key: logoKey
        };
      }

      // Create school
      school = await School.create({
        name: schoolName,
        motto: schoolMotto,
        address: schoolAddress,
        logo: logoData,
        package: order.package.type,
        status: 'pending',
        subscription: {
          startDate: new Date(),
          endDate: order.package.duration === 'lifetime' ? null : 
                   new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          renewDate: order.package.duration === 'lifetime' ? null : 
                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          isAutoRenew: true
        },
        features: this.getPackageFeatures(order.package.type),
        createdBy: userId
      });

      // Create admin user
      const adminUser = await User.create({
        email: adminEmail,
        password: adminPassword,
        fullName: adminFullName,
        role: 'school_admin',
        school: school._id,
        phone: req.body.adminPhone || '',
        emailVerified: true
      });

      // Update order with school reference
      order.school = school._id;
      await order.save();

      // Start build process
      const buildResult = await BuildService.createBuild(order._id, school._id, userId);

      // Send welcome email
      await EmailService.sendWelcomeEmail(school, adminUser);

      logger.info(`School setup completed: ${school.name} (${school._id})`);

      res.status(201).json({
        success: true,
        message: 'School setup completed successfully',
        data: {
          schoolId: school._id,
          schoolName: school.name,
          buildId: buildResult.buildId,
          adminUser: {
            email: adminUser.email,
            fullName: adminUser.fullName
          }
        }
      });

    } catch (error) {
      logger.error('School setup error:', error);
      next(error);
    }
  }

  // Get package features based on type
  getPackageFeatures(packageType) {
    const features = {
      small: {
        maxStudents: 100,
        maxTeachers: 15,
        maxParents: 200,
        modules: {
          studentManagement: true,
          teacherManagement: true,
          attendance: true,
          timetable: true,
          grading: true,
          finance: true,
          library: false,
          inventory: false,
          transport: false,
          hostel: false,
          reports: true,
          parentPortal: true,
          mobileApp: true,
          biometric: false,
          cctv: false
        }
      },
      medium: {
        maxStudents: 500,
        maxTeachers: 40,
        maxParents: 1000,
        modules: {
          studentManagement: true,
          teacherManagement: true,
          attendance: true,
          timetable: true,
          grading: true,
          finance: true,
          library: true,
          inventory: true,
          transport: false,
          hostel: false,
          reports: true,
          parentPortal: true,
          mobileApp: true,
          biometric: true,
          cctv: false
        }
      },
      lifetime: {
        maxStudents: 10000,
        maxTeachers: 200,
        maxParents: 20000,
        modules: {
          studentManagement: true,
          teacherManagement: true,
          attendance: true,
          timetable: true,
          grading: true,
          finance: true,
          library: true,
          inventory: true,
          transport: true,
          hostel: true,
          reports: true,
          parentPortal: true,
          mobileApp: true,
          biometric: true,
          cctv: true
        }
      },
      enterprise: {
        maxStudents: 50000,
        maxTeachers: 500,
        maxParents: 100000,
        modules: {
          studentManagement: true,
          teacherManagement: true,
          attendance: true,
          timetable: true,
          grading: true,
          finance: true,
          library: true,
          inventory: true,
          transport: true,
          hostel: true,
          reports: true,
          parentPortal: true,
          mobileApp: true,
          biometric: true,
          cctv: true
        }
      }
    };

    return features[packageType] || features.small;
  }

  // Get school details
  async getSchool(req, res, next) {
    try {
      const { schoolId } = req.params;
      const userId = req.user.id;

      const school = await School.findOne({
        _id: schoolId,
        $or: [
          { createdBy: userId },
          { _id: { $in: await this.getUserSchools(userId) } }
        ]
      })
      .populate('createdBy', 'email fullName');

      if (!school) {
        return res.status(404).json({ 
          success: false, 
          message: 'School not found or access denied' 
        });
      }

      res.status(200).json({
        success: true,
        data: school
      });

    } catch (error) {
      logger.error('Get school error:', error);
      next(error);
    }
  }

  // Get user's schools
  async getUserSchools(userId) {
    const user = await User.findById(userId);
    if (!user) return [];
    
    if (user.role === 'superadmin') {
      const allSchools = await School.find({});
      return allSchools.map(s => s._id);
    }
    
    return user.school ? [user.school] : [];
  }

  // Update school settings
  async updateSchool(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { schoolId } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      // Check if user has permission
      const school = await School.findOne({
        _id: schoolId,
        createdBy: userId
      });

      if (!school) {
        return res.status(403).json({ 
          success: false, 
          message: 'Permission denied' 
        });
      }

      // Filter allowed updates
      const allowedUpdates = [
        'motto', 'address', 'contact', 'settings',
        'subscription.isAutoRenew'
      ];
      
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      // Handle logo upload
      if (req.file) {
        const s3Service = require('../services/s3Service');
        
        // Delete old logo if exists
        if (school.logo?.key) {
          await s3Service.deleteFile(school.logo.key).catch(() => {});
        }

        // Upload new logo
        const logoKey = `schools/logos/${schoolId}-${Date.now()}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`;
        const logoUrl = await s3Service.uploadFile(req.file.path, logoKey, req.file.mimetype);
        
        filteredUpdates.logo = {
          url: logoUrl,
          key: logoKey
        };
      }

      // Update school
      const updatedSchool = await School.findByIdAndUpdate(
        schoolId,
        { $set: filteredUpdates },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'School updated successfully',
        data: updatedSchool
      });

    } catch (error) {
      logger.error('Update school error:', error);
      next(error);
    }
  }

  // Get school statistics
  async getSchoolStats(req, res, next) {
    try {
      const { schoolId } = req.params;
      const userId = req.user.id;

      // Check permission
      const school = await School.findOne({
        _id: schoolId,
        $or: [
          { createdBy: userId },
          { _id: { $in: await this.getUserSchools(userId) } }
        ]
      });

      if (!school) {
        return res.status(403).json({ 
          success: false, 
          message: 'Permission denied' 
        });
      }

      // Get statistics from the built system (this would typically call the school's API)
      const stats = {
        totalStudents: 0,
        totalTeachers: 0,
        activeStudents: 0,
        feeCollection: 0,
        attendanceRate: 0,
        recentActivities: []
      };

      // For now, return placeholder stats
      // In production, you would connect to the school's database or API

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Get school stats error:', error);
      next(error);
    }
  }

  // List all schools (for admin)
  async listSchools(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        package: packageType 
      } = req.query;
      
      const userId = req.user.id;
      const user = await User.findById(userId);

      let filter = {};

      // Non-superadmins can only see their schools
      if (user.role !== 'superadmin') {
        filter = { createdBy: userId };
      }

      if (status) filter.status = status;
      if (packageType) filter.package = packageType;

      const skip = (page - 1) * limit;

      const [schools, total] = await Promise.all([
        School.find(filter)
          .populate('createdBy', 'email fullName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        School.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        data: {
          schools,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('List schools error:', error);
      next(error);
    }
  }
}

module.exports = new SchoolController();
