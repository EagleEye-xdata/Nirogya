const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  type: {
    type: String,
    enum: ['lab_report', 'prescription', 'imaging', 'consultation', 'vaccination', 'other'],
    required: [true, 'Record type is required'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'ready', 'shared', 'archived'],
    default: 'uploaded',
  },
  metadata: {
    hospitalName: String,
    doctorName: String,
    testDate: Date,
    reportDate: Date,
    labName: String,
    testType: String,
    referenceRange: String,
    normalValues: String,
    equipment: String,
    technician: String,
    additionalNotes: String,
  },
  aiAnalysis: {
    summary: String,
    findings: [{
      key: String,
      value: String,
      unit: String,
      normalRange: String,
      status: {
        type: String,
        enum: ['normal', 'abnormal', 'critical'],
      },
    }],
    recommendations: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    analyzedAt: Date,
    modelVersion: String,
  },
  doctorNotes: {
    type: String,
    maxlength: [2000, 'Doctor notes cannot exceed 2000 characters'],
  },
  sharedWith: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
    accessLevel: {
      type: String,
      enum: ['view', 'comment', 'edit'],
      default: 'view',
    },
    notes: String,
  }],
  tags: [String],
  isEncrypted: {
    type: Boolean,
    default: true,
  },
  encryptionKey: String,
  version: {
    type: Number,
    default: 1,
  },
  previousVersions: [{
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
}, {
  timestamps: true,
});

// Indexes
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ type: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ 'sharedWith.doctorId': 1 });
medicalRecordSchema.index({ 'sharedWith.hospitalId': 1 });
medicalRecordSchema.index({ tags: 1 });

// Text search index
medicalRecordSchema.index({
  title: 'text',
  description: 'text',
  'metadata.hospitalName': 'text',
  'metadata.doctorName': 'text',
});

// Pre-save middleware
medicalRecordSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Method to add sharing
medicalRecordSchema.methods.addSharing = function(doctorId, hospitalId, accessLevel = 'view', notes = '') {
  const sharingEntry = {
    doctorId,
    hospitalId,
    accessLevel,
    notes,
    sharedAt: new Date(),
  };
  
  // Remove existing sharing for the same doctor/hospital
  this.sharedWith = this.sharedWith.filter(share => 
    share.doctorId?.toString() !== doctorId?.toString() && 
    share.hospitalId?.toString() !== hospitalId?.toString()
  );
  
  this.sharedWith.push(sharingEntry);
  return this.save();
};

// Method to remove sharing
medicalRecordSchema.methods.removeSharing = function(doctorId, hospitalId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.doctorId?.toString() !== doctorId?.toString() && 
    share.hospitalId?.toString() !== hospitalId?.toString()
  );
  return this.save();
};

// Method to check if shared with user
medicalRecordSchema.methods.isSharedWith = function(userId) {
  return this.sharedWith.some(share => 
    share.doctorId?.toString() === userId.toString() || 
    share.hospitalId?.toString() === userId.toString()
  );
};

// Method to get access level for user
medicalRecordSchema.methods.getAccessLevel = function(userId) {
  const share = this.sharedWith.find(share => 
    share.doctorId?.toString() === userId.toString() || 
    share.hospitalId?.toString() === userId.toString()
  );
  return share ? share.accessLevel : null;
};

// Static method to get records for user
medicalRecordSchema.statics.getRecordsForUser = function(userId, userRole, filters = {}) {
  let query = {};
  
  if (userRole === 'patient') {
    query.patientId = userId;
  } else if (userRole === 'doctor' || userRole === 'hospital') {
    query['sharedWith.doctorId'] = userId;
  } else if (userRole === 'admin') {
    // Admin can see all records
  }
  
  // Apply additional filters
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('patientId', 'email profile.firstName profile.lastName')
    .populate('sharedWith.doctorId', 'email profile.firstName profile.lastName specialization')
    .populate('sharedWith.hospitalId', 'email profile.hospitalName')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
