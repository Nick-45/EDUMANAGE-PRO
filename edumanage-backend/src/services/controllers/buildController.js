const BuildService = require('../services/buildService');
const Build = require('../models/Build');
const Order = require('../models/Order');
const School = require('../models/School');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const queue = require('../utils/queue');

class BuildController {
  // Get build status
  async getBuildStatus(req, res, next) {
    try {
      const { buildId } = req.params;
      const userId = req.user.id;

      // Check if user has access to this build
      const build = await Build.findOne({ buildId })
        .populate({
          path: 'order',
          match: { user: userId }
        })
        .populate({
          path: 'school',
          match: { createdBy: userId }
        });

      if (!build || !build.order || !build.school) {
        return res.status(404).json({ 
          success: false, 
          message: 'Build not found or access denied' 
        });
      }

      const status = await BuildService.getBuildStatus(buildId);
      
      res.status(200).json({
        success: true,
        data: status
      });

    } catch (error) {
      logger.error('Get build status error:', error);
      next(error);
    }
  }

  // Start build process
  async startBuild(req, res, next) {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;

      // Validate order
      const order = await Order.findOne({ 
        orderId,
        user: userId,
        'payment.status': 'completed',
        status: 'confirmed'
      }).populate('school');

      if (!order) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order not found or payment not completed' 
        });
      }

      if (!order.school) {
        return res.status(400).json({ 
          success: false, 
          message: 'School not set up for this order' 
        });
      }

      // Check if build already exists
      const existingBuild = await Build.findOne({ order: order._id });
      if (existingBuild) {
        return res.status(400).json({ 
          success: false, 
          message: 'Build already exists for this order',
          data: { buildId: existingBuild.buildId }
        });
      }

      // Add build to queue
      const build = await BuildService.createBuild(order._id, order.school._id, userId);
      
      // Process build in background
      queue.add('process-build', {
        buildId: build.buildId
      });

      res.status(200).json({
        success: true,
        message: 'Build process started',
        data: build
      });

    } catch (error) {
      logger.error('Start build error:', error);
      next(error);
    }
  }

  // Retry failed build
  async retryBuild(req, res, next) {
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

      if (build.status !== 'failed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only failed builds can be retried' 
        });
      }

      // Reset build status
      build.status = 'queued';
      build.progress = 0;
      build.stages = [];
      build.error = null;
      build.startedAt = null;
      build.completedAt = null;
      await build.save();

      // Add to queue
      queue.add('process-build', { buildId });

      res.status(200).json({
        success: true,
        message: 'Build retry queued',
        data: { buildId }
      });

    } catch (error) {
      logger.error('Retry build error:', error);
      next(error);
    }
  }

  // Cancel build
  async cancelBuild(req, res, next) {
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

      if (!['queued', 'processing'].includes(build.status)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Only queued or processing builds can be cancelled' 
        });
      }

      // Update build status
      build.status = 'cancelled';
      build.completedAt = new Date();
      await build.save();

      // Update order
      await Order.findByIdAndUpdate(build.order._id, {
        buildStatus: 'cancelled',
        status: 'cancelled'
      });

      res.status(200).json({
        success: true,
        message: 'Build cancelled successfully'
      });

    } catch (error) {
      logger.error('Cancel build error:', error);
      next(error);
    }
  }

  // Get build logs
  async getBuildLogs(req, res, next) {
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

      res.status(200).json({
        success: true,
        data: {
          buildId: build.buildId,
          status: build.status,
          logs: build.buildLogs,
          stages: build.stages,
          error: build.error
        }
      });

    } catch (error) {
      logger.error('Get build logs error:', error);
      next(error);
    }
  }

  // List user's builds
  async listBuilds(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status 
      } = req.query;
      
      const userId = req.user.id;

      const skip = (page - 1) * limit;
      const filter = { user: userId };
      
      if (status) filter.status = status;

      const [builds, total] = await Promise.all([
        Build.find(filter)
          .populate('school', 'name')
          .populate('order', 'orderId package')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Build.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        data: {
          builds,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('List builds error:', error);
      next(error);
    }
  }

  // Admin: Get all builds
  async getAllBuilds(req, res, next) {
    try {
      const user = await require('../models/User').findById(req.user.id);
      
      if (user.role !== 'superadmin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Permission denied' 
        });
      }

      const { 
        page = 1, 
        limit = 50, 
        status,
        fromDate,
        toDate
      } = req.query;

      const skip = (page - 1) * limit;
      const filter = {};

      if (status) filter.status = status;
      
      if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = new Date(fromDate);
        if (toDate) filter.createdAt.$lte = new Date(toDate);
      }

      const [builds, total] = await Promise.all([
        Build.find(filter)
          .populate('school', 'name')
          .populate('order', 'orderId package')
          .populate('user', 'email fullName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Build.countDocuments(filter)
      ]);

      // Build statistics
      const stats = await Build.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalSize: { $sum: '$metadata.fileSize' },
            avgBuildTime: { $avg: '$metadata.buildTime' }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          builds,
          stats,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get all builds error:', error);
      next(error);
    }
  }
}

module.exports = new BuildController();
