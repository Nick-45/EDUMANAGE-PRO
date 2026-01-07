const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  method: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'cash'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['initiated', 'pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'initiated'
  },
  transactionId: String,
  reference: String,
  receiptNumber: String,
  phoneNumber: String,
  mpesaResponse: mongoose.Schema.Types.Mixed,
  stripeResponse: mongoose.Schema.Types.Mixed,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    branch: String,
    transactionReference: String,
    proofUrl: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    checkoutId: String
  },
  processedAt: Date,
  completedAt: Date,
  refundedAt: Date,
  refundReason: String
}, {
  timestamps: true
});

// Generate payment ID before saving
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    const crypto = require('crypto');
    this.paymentId = `PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  next();
});

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
