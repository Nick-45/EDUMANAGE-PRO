const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    url: String,
    key: String,
    thumbnail: String
  },
  motto: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    county: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Kenya'
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  package: {
    type: String,
    enum: ['small', 'medium', 'lifetime', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'expired'],
    default: 'pending'
  },
  subscription: {
    startDate: Date,
    endDate: Date,
    renewDate: Date,
    isAutoRenew: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    academicYear: {
      start: Date,
      end: Date
    },
    terms: {
      term1: { start: Date, end: Date },
      term2: { start: Date, end: Date },
      term3: { start: Date, end: Date }
    },
    gradingSystem: {
      type: String,
      enum: ['percentage', 'letter', 'points'],
      default: 'percentage'
    },
    currency: {
      type: String,
      default: 'KES'
    },
    timezone: {
      type: String,
      default: 'Africa/Nairobi'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'sw']
    }
  },
  features: {
    maxStudents: {
      type: Number,
      default: 100
    },
    maxTeachers: {
      type: Number,
      default: 15
    },
    maxParents: {
      type: Number,
      default: 200
    },
    modules: {
      studentManagement: { type: Boolean, default: true },
      teacherManagement: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      timetable: { type: Boolean, default: true },
      grading: { type: Boolean, default: true },
      finance: { type: Boolean, default: true },
      library: { type: Boolean, default: false },
      inventory: { type: Boolean, default: false },
      transport: { type: Boolean, default: false },
      hostel: { type: Boolean, default: false },
      reports: { type: Boolean, default: true },
      parentPortal: { type: Boolean, default: true },
      mobileApp: { type: Boolean, default: true },
      biometric: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false }
    }
  },
  metadata: {
    buildId: String,
    downloadUrl: String,
    installedVersion: String,
    lastBackup: Date,
    lastUpdate: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for current term
schoolSchema.virtual('currentTerm').get(function() {
  const now = new Date();
  const terms = this.settings.terms;
  
  if (!terms) return null;
  
  for (const [term, dates] of Object.entries(terms)) {
    if (dates.start && dates.end && now >= dates.start && now <= dates.end) {
      return term;
    }
  }
  
  return null;
});

// Virtual for days until subscription ends
schoolSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.subscription.endDate) return null;
  
  const endDate = new Date(this.subscription.endDate);
  const now = new Date();
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Generate slug before saving
schoolSchema.pre('save', function(next) {
  if (!this.isModified('name')) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
    
  next();
});

// Indexes
schoolSchema.index({ slug: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ 'subscription.endDate': 1 });
schoolSchema.index({ createdBy: 1 });
schoolSchema.index({ createdAt: 1 });

module.exports = mongoose.model('School', schoolSchema);
