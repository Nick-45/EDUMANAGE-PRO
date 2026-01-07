const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  package: {
    type: {
      type: String,
      enum: ['small', 'medium', 'lifetime', 'enterprise'],
      required: true
    },
    name: String,
    description: String,
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    },
    duration: String // 'per term', 'annually', 'lifetime'
  },
  payment: {
    method: {
      type: String,
      enum: ['mpesa', 'card', 'bank', 'cash'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    receiptNumber: String,
    amount: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    paymentDate: Date,
    paymentDetails: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'processing', 'completed', 'cancelled', 'failed'],
    default: 'draft'
  },
  buildStatus: {
    type: String,
    enum: ['pending', 'building', 'completed', 'failed'],
    default: 'pending'
  },
  downloadUrl: String,
  buildId: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    country: String
  },
  notes: String,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const crypto = require('crypto');
    this.orderId = `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  next();
});

// Indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', orderSchema);
