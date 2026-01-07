const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validatePayment } = require('../middleware/validation');
const upload = require('../middleware/upload');

// M-Pesa payment
router.post(
  '/mpesa/initiate',
  authenticate,
  validatePayment.mpesa,
  paymentController.initiateMpesa
);

// Card payment
router.post(
  '/card/process',
  authenticate,
  validatePayment.card,
  paymentController.processCard
);

// Bank payment verification
router.post(
  '/bank/verify',
  authenticate,
  upload.single('paymentProof'),
  validatePayment.bank,
  paymentController.verifyBank
);

// Check payment status
router.get(
  '/status/:paymentId',
  authenticate,
  paymentController.checkStatus
);

// Webhooks (no authentication required)
router.post('/mpesa/callback', paymentController.mpesaCallback);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

module.exports = router;
