const { body, param, query } = require('express-validator');

const validatePayment = {
  mpesa: [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('phoneNumber')
      .notEmpty().withMessage('Phone number is required')
      .matches(/^(07\d{8}|2547\d{8}|\+2547\d{8})$/)
      .withMessage('Please enter a valid Kenyan phone number')
  ],
  
  card: [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('cardNumber')
      .notEmpty().withMessage('Card number is required')
      .isCreditCard().withMessage('Invalid card number'),
    body('expiry')
      .notEmpty().withMessage('Expiry date is required')
      .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      .withMessage('Invalid expiry date (MM/YY)'),
    body('cvc')
      .notEmpty().withMessage('CVC is required')
      .isLength({ min: 3, max: 4 })
      .withMessage('CVC must be 3 or 4 digits')
      .isNumeric().withMessage('CVC must be numeric')
  ],
  
  bank: [
    body('orderId').notEmpty().withMessage('Order ID is required')
  ]
};

const validateSchool = {
  setup: [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('schoolName')
      .notEmpty().withMessage('School name is required')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('School name must be between 3 and 100 characters'),
    body('adminEmail')
      .notEmpty().withMessage('Admin email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('adminPassword')
      .notEmpty().withMessage('Admin password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('adminFullName')
      .notEmpty().withMessage('Admin full name is required')
      .trim()
  ],
  
  update: [
    body('schoolMotto').optional().trim(),
    body('address').optional().isObject(),
    body('contact').optional().isObject(),
    body('settings').optional().isObject(),
    body('subscription.isAutoRenew').optional().isBoolean()
  ]
};

const validateBuild = {
  start: [
    body('orderId').notEmpty().withMessage('Order ID is required')
  ]
};

const validateQuery = {
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isString().trim(),
    query('fromDate').optional().isISO8601().toDate(),
    query('toDate').optional().isISO8601().toDate()
  ]
};

module.exports = {
  validatePayment,
  validateSchool,
  validateBuild,
  validateQuery
};
