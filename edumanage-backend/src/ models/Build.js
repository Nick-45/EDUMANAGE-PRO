const mongoose = require('mongoose');

const buildSchema = new mongoose.Schema({
  buildId: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: String,
    enum: ['small', 'medium', 'lifetime', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  stages: [{
    name: String,
    status: String,
    startedAt: Date,
    completedAt: Date,
    error: String
  }],
  files: {
    sourceCode: {
      url: String,
      key: String,
      size: Number,
      checksum: String
    },
    database: {
      url: String,
      key: String,
      size: Number
    },
    documentation: {
      url: String,
      key: String
    }
  },
  downloadUrl: String,
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadAt: Date,
  buildLogs: [String],
  error: String,
  startedAt: Date,
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  metadata: {
    buildTime: Number,
    fileSize: Number,
    version: String,
    dependencies: [String]
  }
}, {
  timestamps: true
});

// Generate build ID before saving
buildSchema.pre('save', function(next) {
  if (!this.buildId) {
    const crypto = require('crypto');
    this.buildId = `BLD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  next();
});

// Virtual for estimated time remaining
buildSchema.virtual('estimatedTimeRemaining').get(function() {
  if (this.status !== 'processing') return 0;
  
  const averageTimePerPercent = 2000; // 2 seconds per percent
  return ((100 - this.progress) * averageTimePerPercent) / 1000; // in seconds
});

// Indexes
buildSchema.index({ buildId: 1 });
buildSchema.index({ order: 1 });
buildSchema.index({ school: 1 });
buildSchema.index({ user: 1 });
buildSchema.index({ status: 1 });
buildSchema.index({ createdAt: 1 });
buildSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Build', buildSchema);
