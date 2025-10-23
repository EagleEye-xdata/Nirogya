const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: 'An error occurred while fetching your profile',
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                   address:
 *                     type: object
 *                   medicalHistory:
 *                     type: array
 *                     items:
 *                       type: string
 *                   allergies:
 *                     type: array
 *                     items:
 *                       type: string
 *                   bloodType:
 *                     type: string
 *                     enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/profile', auth, [
  body('profile.firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
  body('profile.lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  body('profile.phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('profile.dateOfBirth').optional().isISO8601().withMessage('Please provide a valid date of birth'),
  body('profile.gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('profile.bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
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

    const { profile } = req.body;
    const user = req.user;

    // Update profile
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating your profile',
    });
  }
});

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid current password
 */
router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
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

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing your password',
    });
  }
});

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    res.json({
      preferences: req.user.preferences,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Failed to retrieve preferences',
      message: 'An error occurred while fetching your preferences',
    });
  }
});

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   shareData:
 *                     type: boolean
 *                   allowResearch:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/preferences', auth, [
  body('notifications.email').optional().isBoolean().withMessage('Email notification preference must be boolean'),
  body('notifications.push').optional().isBoolean().withMessage('Push notification preference must be boolean'),
  body('notifications.sms').optional().isBoolean().withMessage('SMS notification preference must be boolean'),
  body('privacy.shareData').optional().isBoolean().withMessage('Data sharing preference must be boolean'),
  body('privacy.allowResearch').optional().isBoolean().withMessage('Research participation preference must be boolean'),
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

    const { notifications, privacy } = req.body;
    const user = req.user;

    // Update preferences
    if (notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    }
    if (privacy) {
      user.preferences.privacy = { ...user.preferences.privacy, ...privacy };
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Preferences update failed',
      message: 'An error occurred while updating your preferences',
    });
  }
});

/**
 * @swagger
 * /api/users/doctors:
 *   get:
 *     summary: Get list of doctors
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or specialization
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 */
router.get('/doctors', auth, async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = { role: 'doctor', isActive: true };

    if (specialization) {
      query['profile.specialization'] = new RegExp(specialization, 'i');
    }

    if (search) {
      query.$or = [
        { 'profile.firstName': new RegExp(search, 'i') },
        { 'profile.lastName': new RegExp(search, 'i') },
        { 'profile.specialization': new RegExp(search, 'i') },
      ];
    }

    const doctors = await User.find(query)
      .select('email profile.firstName profile.lastName profile.specialization profile.licenseNumber profile.yearsOfExperience profile.consultationFee')
      .sort({ 'profile.firstName': 1 });

    res.json({
      doctors,
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Failed to retrieve doctors',
      message: 'An error occurred while fetching doctors',
    });
  }
});

/**
 * @swagger
 * /api/users/hospitals:
 *   get:
 *     summary: Get list of hospitals
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by hospital name
 *     responses:
 *       200:
 *         description: Hospitals retrieved successfully
 */
router.get('/hospitals', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'hospital', isActive: true };

    if (search) {
      query['profile.hospitalName'] = new RegExp(search, 'i');
    }

    const hospitals = await User.find(query)
      .select('email profile.hospitalName profile.hospitalType profile.address')
      .sort({ 'profile.hospitalName': 1 });

    res.json({
      hospitals,
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      error: 'Failed to retrieve hospitals',
      message: 'An error occurred while fetching hospitals',
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    res.json({
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: 'An error occurred while fetching user information',
    });
  }
});

module.exports = router;
