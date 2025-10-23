const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided or invalid format',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User account is deactivated',
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token has expired',
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed',
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

// Check if user can access medical record
const canAccessRecord = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const user = req.user;

    // Admin can access all records
    if (user.role === 'admin') {
      return next();
    }

    // Import MedicalRecord model
    const MedicalRecord = require('../models/MedicalRecord');
    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Patient can access their own records
    if (user.role === 'patient' && record.patientId.toString() === user._id.toString()) {
      return next();
    }

    // Doctor/Hospital can access shared records
    if ((user.role === 'doctor' || user.role === 'hospital') && record.isSharedWith(user._id)) {
      return next();
    }

    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this record',
    });
  } catch (error) {
    console.error('Record access check error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify record access',
    });
  }
};

// Check if user can modify record
const canModifyRecord = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const user = req.user;

    // Admin can modify all records
    if (user.role === 'admin') {
      return next();
    }

    // Import MedicalRecord model
    const MedicalRecord = require('../models/MedicalRecord');
    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Patient can modify their own records
    if (user.role === 'patient' && record.patientId.toString() === user._id.toString()) {
      return next();
    }

    // Doctor/Hospital can modify if they have edit access
    if ((user.role === 'doctor' || user.role === 'hospital') && record.isSharedWith(user._id)) {
      const accessLevel = record.getAccessLevel(user._id);
      if (accessLevel === 'edit') {
        return next();
      }
    }

    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to modify this record',
    });
  } catch (error) {
    console.error('Record modify check error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify record modification access',
    });
  }
};

module.exports = {
  auth,
  authorize,
  canAccessRecord,
  canModifyRecord,
};
