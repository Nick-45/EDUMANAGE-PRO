const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { authenticate } = require('../middleware/auth');

// Download school system
router.get(
  '/system/:buildId',
  authenticate,
  downloadController.downloadSystem
);

// Get download info
router.get(
  '/info/:buildId',
  authenticate,
  downloadController.getDownloadInfo
);

// Generate new download link
router.post(
  '/:buildId/regenerate',
  authenticate,
  downloadController.generateNewLink
);

// Verify download availability
router.get(
  '/verify/:buildId',
  downloadController.verifyDownload
);

module.exports = router;
