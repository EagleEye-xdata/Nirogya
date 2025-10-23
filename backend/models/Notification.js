const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  type: {
    type: String,
    enum: ['record_uploaded', 'record_shared', 'record_updated', 'appointment_reminder', 'system_alert', 'ai_analysis_complete', 'password_reset', 'email_verification'],
    required: [true, 'Notification type is required'],
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  data: {
    recordId: mongoose.Schema.Types.ObjectId,
    appointmentId: mongoose.Schema.Types.ObjectId,
    doctorId: mongoose.Schema.Types.ObjectId,
    hospitalId: mongoose.Schema.Types.ObjectId,
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  channels: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String,
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String,
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String,
    },
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to set expiration
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set default expiration to 30 days
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}, priority = 'medium') {
  const notification = new this({
    userId,
    type,
    title,
    message,
    data,
    priority,
  });
  
  return await notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, filters = {}) {
  let query = { userId, isActive: true };
  
  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query)
    .populate('data.doctorId', 'email profile.firstName profile.lastName specialization')
    .populate('data.hospitalId', 'email profile.hospitalName')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false, isActive: true });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { expiresAt: { $lt: new Date() } },
    { isActive: false }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
