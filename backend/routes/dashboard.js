const express = require('express');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const user = req.user;
    const stats = {};

    if (user.role === 'patient') {
      // Patient dashboard stats
      const totalRecords = await MedicalRecord.countDocuments({ patientId: user._id });
      const recordsByType = await MedicalRecord.aggregate([
        { $match: { patientId: user._id } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      
      const recentRecords = await MedicalRecord.find({ patientId: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type status createdAt');

      const unreadNotifications = await Notification.getUnreadCount(user._id);

      stats.totalRecords = totalRecords;
      stats.recordsByType = recordsByType;
      stats.recentRecords = recentRecords;
      stats.unreadNotifications = unreadNotifications;

    } else if (user.role === 'doctor') {
      // Doctor dashboard stats
      const sharedRecords = await MedicalRecord.countDocuments({
        'sharedWith.doctorId': user._id,
      });
      
      const recordsByType = await MedicalRecord.aggregate([
        { $match: { 'sharedWith.doctorId': user._id } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recentSharedRecords = await MedicalRecord.find({
        'sharedWith.doctorId': user._id,
      })
        .populate('patientId', 'profile.firstName profile.lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type status createdAt patientId');

      const unreadNotifications = await Notification.getUnreadCount(user._id);

      stats.sharedRecords = sharedRecords;
      stats.recordsByType = recordsByType;
      stats.recentSharedRecords = recentSharedRecords;
      stats.unreadNotifications = unreadNotifications;

    } else if (user.role === 'hospital') {
      // Hospital dashboard stats
      const sharedRecords = await MedicalRecord.countDocuments({
        'sharedWith.hospitalId': user._id,
      });
      
      const recordsByType = await MedicalRecord.aggregate([
        { $match: { 'sharedWith.hospitalId': user._id } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recentSharedRecords = await MedicalRecord.find({
        'sharedWith.hospitalId': user._id,
      })
        .populate('patientId', 'profile.firstName profile.lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type status createdAt patientId');

      const unreadNotifications = await Notification.getUnreadCount(user._id);

      stats.sharedRecords = sharedRecords;
      stats.recordsByType = recordsByType;
      stats.recentSharedRecords = recentSharedRecords;
      stats.unreadNotifications = unreadNotifications;

    } else if (user.role === 'admin') {
      // Admin dashboard stats
      const totalUsers = await User.countDocuments({ isActive: true });
      const usersByRole = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const totalRecords = await MedicalRecord.countDocuments();
      const recordsByType = await MedicalRecord.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recordsByStatus = await MedicalRecord.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const recentRecords = await MedicalRecord.find()
        .populate('patientId', 'profile.firstName profile.lastName email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title type status createdAt patientId');

      const unreadNotifications = await Notification.getUnreadCount(user._id);

      stats.totalUsers = totalUsers;
      stats.usersByRole = usersByRole;
      stats.totalRecords = totalRecords;
      stats.recordsByType = recordsByType;
      stats.recordsByStatus = recordsByStatus;
      stats.recentRecords = recentRecords;
      stats.unreadNotifications = unreadNotifications;
    }

    res.json({
      stats,
      user: {
        id: user._id,
        name: user.getFullName(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard statistics',
      message: 'An error occurred while fetching dashboard statistics',
    });
  }
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of activities to retrieve
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 */
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = req.user;

    // Get recent notifications as activity
    const activities = await Notification.getUserNotifications(user._id, {
      limit: parseInt(limit),
    })
      .populate('data.doctorId', 'profile.firstName profile.lastName')
      .populate('data.hospitalId', 'profile.hospitalName')
      .populate('data.recordId', 'title type')
      .sort({ createdAt: -1 });

    res.json({
      activities,
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      error: 'Failed to retrieve recent activity',
      message: 'An error occurred while fetching recent activity',
    });
  }
});

/**
 * @swagger
 * /api/dashboard/health-summary:
 *   get:
 *     summary: Get health summary for patient
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health summary retrieved successfully
 *       403:
 *         description: Access denied (not a patient)
 */
router.get('/health-summary', auth, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'patient') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Health summary is only available for patients',
      });
    }

    // Get health summary data
    const totalRecords = await MedicalRecord.countDocuments({ patientId: user._id });
    const recordsWithAI = await MedicalRecord.countDocuments({
      patientId: user._id,
      'aiAnalysis.summary': { $exists: true },
    });

    // Get recent lab reports
    const recentLabReports = await MedicalRecord.find({
      patientId: user._id,
      type: 'lab_report',
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title aiAnalysis metadata createdAt');

    // Get health trends (simplified)
    const healthTrends = await MedicalRecord.aggregate([
      { $match: { patientId: user._id, type: 'lab_report' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    const healthSummary = {
      totalRecords,
      recordsWithAI,
      recentLabReports,
      healthTrends,
      lastUpdated: new Date(),
    };

    res.json({
      healthSummary,
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({
      error: 'Failed to retrieve health summary',
      message: 'An error occurred while fetching health summary',
    });
  }
});

/**
 * @swagger
 * /api/dashboard/doctor-stats:
 *   get:
 *     summary: Get doctor statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor statistics retrieved successfully
 *       403:
 *         description: Access denied (not a doctor)
 */
router.get('/doctor-stats', auth, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'doctor') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Doctor statistics are only available for doctors',
      });
    }

    // Get doctor-specific statistics
    const sharedRecords = await MedicalRecord.countDocuments({
      'sharedWith.doctorId': user._id,
    });

    const recordsByType = await MedicalRecord.aggregate([
      { $match: { 'sharedWith.doctorId': user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentPatients = await MedicalRecord.aggregate([
      { $match: { 'sharedWith.doctorId': user._id } },
      {
        $group: {
          _id: '$patientId',
          lastShared: { $max: '$createdAt' },
          recordCount: { $sum: 1 },
        },
      },
      { $sort: { lastShared: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'patient',
        },
      },
      {
        $project: {
          patient: { $arrayElemAt: ['$patient', 0] },
          lastShared: 1,
          recordCount: 1,
        },
      },
    ]);

    const doctorStats = {
      sharedRecords,
      recordsByType,
      recentPatients,
      specialization: user.profile.specialization,
      yearsOfExperience: user.profile.yearsOfExperience,
    };

    res.json({
      doctorStats,
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve doctor statistics',
      message: 'An error occurred while fetching doctor statistics',
    });
  }
});

module.exports = router;
