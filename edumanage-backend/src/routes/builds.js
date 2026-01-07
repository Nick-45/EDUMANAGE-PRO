const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController');
const { authenticate } = require('../middleware/auth');
const { validateBuild } = require('../middleware/validation');

// Get build status
router.get(
  '/status/:buildId',
  authenticate,
  buildController.getBuildStatus
);

// Start build
router.post(
  '/start',
  authenticate,
  validateBuild.start,
  buildController.startBuild
);

// Retry failed build
router.post(
  '/:buildId/retry',
  authenticate,
  buildController.retryBuild
);

// Cancel build
router.post(
  '/:buildId/cancel',
  authenticate,
  buildController.cancelBuild
);

// Get build logs
router.get(
  '/:buildId/logs',
  authenticate,
  buildController.getBuildLogs
);

// List user's builds
router.get(
  '/',
  authenticate,
  buildController.listBuilds
);

// Admin: Get all builds
router.get(
  '/admin/all',
  authenticate,
  buildController.getAllBuilds
);

module.exports = router;
