const express = require('express');
const { query, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [record_uploaded, record_shared, record_updated, appointment_reminder, system_alert, ai_analysis_complete, password_reset, email_verification]
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Notifications per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, [
  query('isRead').optional().isBoolean().withMessage('isRead must be boolean'),
  query('type').optional().isIn(['record_uploaded', 'record_shared', 'record_updated', 'appointment_reminder', 'system_alert', 'ai_analysis_complete', 'password_reset', 'email_verification']).withMessage('Invalid notification type'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: errors.array()[0].msg,
        details: errors.array(),
      });
    }

    const { isRead, type, priority, page = 1, limit = 20 } = req.query;
    const user = req.user;

    // Build filters
    const filters = {};
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    // Get notifications
    const notifications = await Notification.getUserNotifications(user._id, {
      ...filters,
      limit: parseInt(limit),
    })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Notification.getUserNotifications(user._id, filters).countDocuments();

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(user._id);

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to retrieve notifications',
      message: 'An error occurred while fetching notifications',
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Access denied
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const notification = await Notification.findOne({
      _id: id,
      userId: user._id,
    })
      .populate('data.doctorId', 'email profile.firstName profile.lastName specialization')
      .populate('data.hospitalId', 'email profile.hospitalName')
      .populate('data.recordId', 'title type');

    if (!notification) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Notification not found',
      });
    }

    res.json({
      notification,
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({
      error: 'Failed to retrieve notification',
      message: 'An error occurred while fetching the notification',
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   post:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Access denied
 */
router.post('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const notification = await Notification.findOne({
      _id: id,
      userId: user._id,
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Notification not found',
      });
    }

    await notification.markAsRead();

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An error occurred while marking the notification as read',
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/unread:
 *   post:
 *     summary: Mark notification as unread
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as unread
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Access denied
 */
router.post('/:id/unread', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const notification = await Notification.findOne({
      _id: id,
      userId: user._id,
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Notification not found',
      });
    }

    await notification.markAsUnread();

    res.json({
      message: 'Notification marked as unread',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as unread error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as unread',
      message: 'An error occurred while marking the notification as unread',
    });
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const user = req.user;

    const result = await Notification.markAllAsRead(user._id);

    res.json({
      message: 'All notifications marked as read',
      result,
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: 'An error occurred while marking all notifications as read',
    });
  }
});

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const user = req.user;

    const unreadCount = await Notification.getUnreadCount(user._id);

    res.json({
      unreadCount,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      message: 'An error occurred while fetching the unread count',
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Access denied
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const notification = await Notification.findOne({
      _id: id,
      userId: user._id,
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Notification not found',
      });
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: 'An error occurred while deleting the notification',
    });
  }
});

/**
 * @swagger
 * /api/notifications/cleanup:
 *   post:
 *     summary: Cleanup expired notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 */
router.post('/cleanup', auth, async (req, res) => {
  try {
    const result = await Notification.cleanupExpired();
    
    res.json({
      message: 'Cleanup completed successfully',
      result,
    });
  } catch (error) {
    console.error('Cleanup notifications error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      message: 'An error occurred during cleanup',
    });
  }
});

module.exports = router;
