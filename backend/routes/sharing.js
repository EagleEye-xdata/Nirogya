const express = require('express');
const { body, validationResult } = require('express-validator');
const SharingToken = require('../models/SharingToken');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

const router = express.Router();

/**
 * @swagger
 * /api/sharing/tokens:
 *   get:
 *     summary: Get sharing tokens for current user
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sharing tokens retrieved successfully
 */
router.get('/tokens', auth, async (req, res) => {
  try {
    const tokens = await SharingToken.find({ createdBy: req.user._id, isActive: true })
      .populate('recordId', 'title type createdAt')
      .populate('sharedWith.doctorId', 'email profile.firstName profile.lastName')
      .populate('sharedWith.hospitalId', 'email profile.hospitalName')
      .sort({ createdAt: -1 });

    res.json({
      tokens,
    });
  } catch (error) {
    console.error('Get sharing tokens error:', error);
    res.status(500).json({
      error: 'Failed to retrieve sharing tokens',
      message: 'An error occurred while fetching sharing tokens',
    });
  }
});

/**
 * @swagger
 * /api/sharing/create-token:
 *   post:
 *     summary: Create sharing token for medical record
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recordId
 *               - sharedWith
 *             properties:
 *               recordId:
 *                 type: string
 *               sharedWith:
 *                 type: object
 *                 properties:
 *                   doctorId:
 *                     type: string
 *                   hospitalId:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *               accessLevel:
 *                 type: string
 *                 enum: [view, comment, edit]
 *                 default: view
 *               permissions:
 *                 type: object
 *                 properties:
 *                   canView:
 *                     type: boolean
 *                   canDownload:
 *                     type: boolean
 *                   canComment:
 *                     type: boolean
 *                   canEdit:
 *                     type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               maxUsage:
 *                 type: integer
 *                 minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sharing token created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Medical record not found
 */
router.post('/create-token', auth, [
  body('recordId').isMongoId().withMessage('Invalid record ID'),
  body('sharedWith.doctorId').optional().isMongoId().withMessage('Invalid doctor ID'),
  body('sharedWith.hospitalId').optional().isMongoId().withMessage('Invalid hospital ID'),
  body('sharedWith.email').optional().isEmail().withMessage('Invalid email address'),
  body('accessLevel').optional().isIn(['view', 'comment', 'edit']).withMessage('Invalid access level'),
  body('maxUsage').optional().isInt({ min: 1 }).withMessage('Max usage must be at least 1'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
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

    const { recordId, sharedWith, accessLevel = 'view', permissions = {}, expiresAt, maxUsage = 1, notes } = req.body;

    // Validate that either doctorId, hospitalId, or email is provided
    if (!sharedWith.doctorId && !sharedWith.hospitalId && !sharedWith.email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Either doctorId, hospitalId, or email must be provided',
      });
    }

    // Check if record exists and user has access
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Check if user can share this record
    if (record.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to share this record',
      });
    }

    // Create sharing token
    const token = await SharingToken.createToken(
      recordId,
      req.user._id,
      sharedWith,
      {
        accessLevel,
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        maxUsage,
        notes,
      }
    );

    // Send email notification if email is provided
    if (sharedWith.email) {
      try {
        const record = await MedicalRecord.findById(recordId).populate('patientId');
        const patientName = record.patientId.getFullName() || record.patientId.email;

        await sendEmail({
          to: sharedWith.email,
          subject: 'Medical record shared with you',
          template: 'recordShared',
          data: {
            doctorName: sharedWith.email,
            patientName,
            recordType: record.type.replace('_', ' '),
            recordTitle: record.title,
            accessLink: `${process.env.FRONTEND_URL}/shared/${token.token}`,
            sharedBy: req.user.getFullName() || req.user.email,
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Create notification for the shared user if they have an account
    if (sharedWith.doctorId || sharedWith.hospitalId) {
      const sharedUserId = sharedWith.doctorId || sharedWith.hospitalId;
      await Notification.createNotification(
        sharedUserId,
        'record_shared',
        'Medical Record Shared',
        `A medical record "${record.title}" has been shared with you.`,
        { recordId, actionUrl: `/shared/${token.token}` }
      );
    }

    res.status(201).json({
      message: 'Sharing token created successfully',
      token,
    });
  } catch (error) {
    console.error('Create sharing token error:', error);
    res.status(500).json({
      error: 'Failed to create sharing token',
      message: 'An error occurred while creating the sharing token',
    });
  }
});

/**
 * @swagger
 * /api/sharing/access/{token}:
 *   get:
 *     summary: Access shared medical record using token
 *     tags: [Sharing]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Sharing token
 *     responses:
 *       200:
 *         description: Medical record accessed successfully
 *       404:
 *         description: Token not found or expired
 */
router.get('/access/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { ipAddress, userAgent } = req;

    // Find valid token
    const sharingToken = await SharingToken.findValidToken(token);
    if (!sharingToken) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sharing token not found or expired',
      });
    }

    // Use token (increment usage count)
    await sharingToken.useToken(null, { ipAddress, userAgent });

    // Get medical record
    const record = await MedicalRecord.findById(sharingToken.recordId)
      .populate('patientId', 'email profile.firstName profile.lastName')
      .populate('sharedWith.doctorId', 'email profile.firstName profile.lastName specialization')
      .populate('sharedWith.hospitalId', 'email profile.hospitalName');

    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    res.json({
      record,
      accessLevel: sharingToken.accessLevel,
      permissions: sharingToken.permissions,
      expiresAt: sharingToken.expiresAt,
      usageCount: sharingToken.usageCount,
      maxUsage: sharingToken.maxUsage,
    });
  } catch (error) {
    console.error('Access shared record error:', error);
    res.status(500).json({
      error: 'Failed to access shared record',
      message: 'An error occurred while accessing the shared record',
    });
  }
});

/**
 * @swagger
 * /api/sharing/revoke/{tokenId}:
 *   delete:
 *     summary: Revoke sharing token
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: Token ID
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       404:
 *         description: Token not found
 *       403:
 *         description: Access denied
 */
router.delete('/revoke/:tokenId', auth, async (req, res) => {
  try {
    const { tokenId } = req.params;

    const token = await SharingToken.findById(tokenId);
    if (!token) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Sharing token not found',
      });
    }

    // Check if user can revoke this token
    if (token.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to revoke this token',
      });
    }

    // Revoke token
    await token.revoke();

    res.json({
      message: 'Sharing token revoked successfully',
    });
  } catch (error) {
    console.error('Revoke token error:', error);
    res.status(500).json({
      error: 'Failed to revoke token',
      message: 'An error occurred while revoking the token',
    });
  }
});

/**
 * @swagger
 * /api/sharing/cleanup:
 *   post:
 *     summary: Cleanup expired tokens
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 */
router.post('/cleanup', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await SharingToken.cleanupExpired();
    
    res.json({
      message: 'Cleanup completed successfully',
      result,
    });
  } catch (error) {
    console.error('Cleanup tokens error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      message: 'An error occurred during cleanup',
    });
  }
});

module.exports = router;
