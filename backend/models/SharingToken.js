const mongoose = require('mongoose');
const crypto = require('crypto');

const sharingTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
    required: [true, 'Record ID is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user ID is required'],
  },
  sharedWith: {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: String,
  },
  accessLevel: {
    type: String,
    enum: ['view', 'comment', 'edit'],
    default: 'view',
  },
  permissions: {
    canView: { type: Boolean, default: true },
    canDownload: { type: Boolean, default: false },
    canComment: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: Date,
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  maxUsage: {
    type: Number,
    default: 1,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
  },
  notes: String,
}, {
  timestamps: true,
});

// Indexes
sharingTokenSchema.index({ token: 1 });
sharingTokenSchema.index({ recordId: 1 });
sharingTokenSchema.index({ createdBy: 1 });
sharingTokenSchema.index({ expiresAt: 1 });
sharingTokenSchema.index({ isActive: 1 });

// Pre-save middleware to generate token
sharingTokenSchema.pre('save', function(next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Method to check if token is valid
sharingTokenSchema.methods.isValid = function() {
  return this.isActive && 
         !this.isUsed && 
         this.usageCount < this.maxUsage && 
         this.expiresAt > new Date();
};

// Method to use token
sharingTokenSchema.methods.useToken = function(userId, metadata = {}) {
  if (!this.isValid()) {
    throw new Error('Token is not valid or has expired');
  }
  
  this.isUsed = true;
  this.usedAt = new Date();
  this.usedBy = userId;
  this.usageCount += 1;
  
  if (metadata.ipAddress) this.metadata.ipAddress = metadata.ipAddress;
  if (metadata.userAgent) this.metadata.userAgent = metadata.userAgent;
  if (metadata.referrer) this.metadata.referrer = metadata.referrer;
  
  return this.save();
};

// Method to revoke token
sharingTokenSchema.methods.revoke = function() {
  this.isActive = false;
  return this.save();
};

// Static method to create sharing token
sharingTokenSchema.statics.createToken = async function(recordId, createdBy, sharedWith, options = {}) {
  const tokenData = {
    recordId,
    createdBy,
    sharedWith,
    accessLevel: options.accessLevel || 'view',
    permissions: options.permissions || {},
    expiresAt: options.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    maxUsage: options.maxUsage || 1,
    notes: options.notes,
  };
  
  const token = new this(tokenData);
  return await token.save();
};

// Static method to find valid token
sharingTokenSchema.statics.findValidToken = function(tokenString) {
  return this.findOne({
    token: tokenString,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).populate('recordId').populate('createdBy');
};

// Static method to cleanup expired tokens
sharingTokenSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { expiresAt: { $lt: new Date() } },
    { isActive: false }
  );
};

// Static method to get tokens for record
sharingTokenSchema.statics.getTokensForRecord = function(recordId) {
  return this.find({ recordId, isActive: true })
    .populate('sharedWith.doctorId', 'email profile.firstName profile.lastName')
    .populate('sharedWith.hospitalId', 'email profile.hospitalName')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('SharingToken', sharingTokenSchema);
