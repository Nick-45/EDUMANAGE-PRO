const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { authenticate } = require('../middleware/auth');
const { validateSchool } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Setup new school
router.post(
  '/setup',
  authenticate,
  upload.single('schoolLogo'),
  validateSchool.setup,
  schoolController.setupSchool
);

// Get school details
router.get(
  '/:schoolId',
  authenticate,
  schoolController.getSchool
);

// Update school
router.put(
  '/:schoolId',
  authenticate,
  upload.single('schoolLogo'),
  validateSchool.update,
  schoolController.updateSchool
);

// Get school statistics
router.get(
  '/:schoolId/stats',
  authenticate,
  schoolController.getSchoolStats
);

// List schools (with pagination)
router.get(
  '/',
  authenticate,
  schoolController.listSchools
);

module.exports = router;
