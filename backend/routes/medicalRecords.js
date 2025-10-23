const express = require('express');
const { body, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const { auth, authorize, canAccessRecord, canModifyRecord } = require('../middleware/auth');
const { uploadSingle, cleanupFile } = require('../middleware/upload');
const { uploadToCloudinary, uploadToS3 } = require('../utils/cloudStorage');

const router = express.Router();

/**
 * @swagger
 * /api/medical-records:
 *   get:
 *     summary: Get medical records for current user
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lab_report, prescription, imaging, consultation, vaccination, other]
 *         description: Filter by record type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [uploaded, processing, ready, shared, archived]
 *         description: Filter by record status
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
 *         description: Records per page
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const user = req.user;

    // Build filters
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    // Get records for user
    const records = await MedicalRecord.getRecordsForUser(user._id, user.role, filters)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get total count
    const total = await MedicalRecord.getRecordsForUser(user._id, user.role, filters).countDocuments();

    res.json({
      records,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      error: 'Failed to retrieve medical records',
      message: 'An error occurred while fetching medical records',
    });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   get:
 *     summary: Get specific medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     responses:
 *       200:
 *         description: Medical record retrieved successfully
 *       404:
 *         description: Medical record not found
 *       403:
 *         description: Access denied
 */
router.get('/:id', auth, canAccessRecord, async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await MedicalRecord.findById(id)
      .populate('patientId', 'email profile.firstName profile.lastName')
      .populate('sharedWith.doctorId', 'email profile.firstName profile.lastName specialization')
      .populate('sharedWith.hospitalId', 'email profile.hospitalName');

    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    res.json({ record });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({
      error: 'Failed to retrieve medical record',
      message: 'An error occurred while fetching the medical record',
    });
  }
});

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     summary: Upload new medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [lab_report, prescription, imaging, consultation, vaccination, other]
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Medical record uploaded successfully
 *       400:
 *         description: Validation error
 */
router.post('/', auth, authorize('patient'), uploadSingle('file'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['lab_report', 'prescription', 'imaging', 'consultation', 'vaccination', 'other']).withMessage('Invalid record type'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file
      if (req.file) {
        cleanupFile(req.file.path);
      }
      return res.status(400).json({
        error: 'Validation failed',
        message: errors.array()[0].msg,
        details: errors.array(),
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'File required',
        message: 'Please upload a file',
      });
    }

    const { title, type, description, metadata } = req.body;
    const user = req.user;

    // Upload file to cloud storage
    let fileUrl;
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        fileUrl = await uploadToCloudinary(req.file.path);
      } else if (process.env.AWS_ACCESS_KEY_ID) {
        fileUrl = await uploadToS3(req.file.path, `medical-records/${user._id}/${req.file.filename}`);
      } else {
        // Local storage fallback
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      cleanupFile(req.file.path);
      return res.status(500).json({
        error: 'File upload failed',
        message: 'An error occurred while uploading the file',
      });
    }

    // Clean up local file
    cleanupFile(req.file.path);

    // Parse metadata if provided
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (parseError) {
        console.error('Metadata parsing error:', parseError);
      }
    }

    // Create medical record
    const record = new MedicalRecord({
      patientId: user._id,
      title,
      type,
      description,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      metadata: parsedMetadata,
      status: 'uploaded',
    });

    await record.save();

    // Create notification
    await Notification.createNotification(
      user._id,
      'record_uploaded',
      'Medical Record Uploaded',
      `Your ${type.replace('_', ' ')} has been uploaded successfully.`,
      { recordId: record._id, actionUrl: `/medical-records/${record._id}` }
    );

    // TODO: Trigger AI analysis
    // This would be implemented with a job queue or direct AI service call

    res.status(201).json({
      message: 'Medical record uploaded successfully',
      record,
    });
  } catch (error) {
    console.error('Upload medical record error:', error);
    // Clean up file if upload failed
    if (req.file) {
      cleanupFile(req.file.path);
    }
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the medical record',
    });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   put:
 *     summary: Update medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               doctorNotes:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Medical record updated successfully
 *       404:
 *         description: Medical record not found
 *       403:
 *         description: Access denied
 */
router.put('/:id', auth, canModifyRecord, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('doctorNotes').optional().isLength({ max: 2000 }).withMessage('Doctor notes cannot exceed 2000 characters'),
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

    const { id } = req.params;
    const { title, description, doctorNotes, tags } = req.body;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Update record
    if (title) record.title = title;
    if (description) record.description = description;
    if (doctorNotes) record.doctorNotes = doctorNotes;
    if (tags) record.tags = tags;

    await record.save();

    // Create notification
    await Notification.createNotification(
      record.patientId,
      'record_updated',
      'Medical Record Updated',
      `Your medical record "${record.title}" has been updated.`,
      { recordId: record._id, actionUrl: `/medical-records/${record._id}` }
    );

    res.json({
      message: 'Medical record updated successfully',
      record,
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'An error occurred while updating the medical record',
    });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}:
 *   delete:
 *     summary: Delete medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     responses:
 *       200:
 *         description: Medical record deleted successfully
 *       404:
 *         description: Medical record not found
 *       403:
 *         description: Access denied
 */
router.delete('/:id', auth, canModifyRecord, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // TODO: Delete file from cloud storage
    // This would involve calling the cloud storage service to delete the file

    await MedicalRecord.findByIdAndDelete(id);

    res.json({
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: 'An error occurred while deleting the medical record',
    });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}/share:
 *   post:
 *     summary: Share medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *             properties:
 *               doctorId:
 *                 type: string
 *               hospitalId:
 *                 type: string
 *               accessLevel:
 *                 type: string
 *                 enum: [view, comment, edit]
 *                 default: view
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medical record shared successfully
 *       404:
 *         description: Medical record not found
 *       403:
 *         description: Access denied
 */
router.post('/:id/share', auth, canModifyRecord, [
  body('doctorId').optional().isMongoId().withMessage('Invalid doctor ID'),
  body('hospitalId').optional().isMongoId().withMessage('Invalid hospital ID'),
  body('accessLevel').optional().isIn(['view', 'comment', 'edit']).withMessage('Invalid access level'),
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

    const { id } = req.params;
    const { doctorId, hospitalId, accessLevel = 'view', notes } = req.body;

    if (!doctorId && !hospitalId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Either doctorId or hospitalId is required',
      });
    }

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Add sharing
    await record.addSharing(doctorId, hospitalId, accessLevel, notes);

    // Create notification for the shared user
    const sharedUserId = doctorId || hospitalId;
    await Notification.createNotification(
      sharedUserId,
      'record_shared',
      'Medical Record Shared',
      `A medical record "${record.title}" has been shared with you.`,
      { recordId: record._id, actionUrl: `/medical-records/${record._id}` }
    );

    res.json({
      message: 'Medical record shared successfully',
      record,
    });
  } catch (error) {
    console.error('Share medical record error:', error);
    res.status(500).json({
      error: 'Share failed',
      message: 'An error occurred while sharing the medical record',
    });
  }
});

/**
 * @swagger
 * /api/medical-records/{id}/ai-analysis:
 *   post:
 *     summary: Trigger AI analysis for medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     responses:
 *       200:
 *         description: AI analysis triggered successfully
 *       404:
 *         description: Medical record not found
 *       403:
 *         description: Access denied
 */
router.post('/:id/ai-analysis', auth, canAccessRecord, async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Update status to processing
    record.status = 'processing';
    await record.save();

    // TODO: Implement AI analysis
    // This would involve calling an AI service or adding to a job queue
    // For now, we'll simulate the process

    // Simulate AI analysis (remove this in production)
    setTimeout(async () => {
      try {
        record.aiAnalysis = {
          summary: 'AI analysis completed successfully',
          findings: [
            {
              key: 'Blood Pressure',
              value: '120/80',
              unit: 'mmHg',
              normalRange: '90-140/60-90',
              status: 'normal',
            },
          ],
          recommendations: ['Continue regular monitoring', 'Maintain healthy lifestyle'],
          confidence: 0.85,
          analyzedAt: new Date(),
          modelVersion: '1.0',
        };
        record.status = 'ready';
        await record.save();

        // Create notification
        await Notification.createNotification(
          record.patientId,
          'ai_analysis_complete',
          'AI Analysis Complete',
          `AI analysis for "${record.title}" has been completed.`,
          { recordId: record._id, actionUrl: `/medical-records/${record._id}` }
        );
      } catch (error) {
        console.error('AI analysis simulation error:', error);
        record.status = 'uploaded';
        await record.save();
      }
    }, 5000); // 5 second delay for simulation

    res.json({
      message: 'AI analysis triggered successfully',
      status: 'processing',
    });
  } catch (error) {
    console.error('AI analysis trigger error:', error);
    res.status(500).json({
      error: 'AI analysis failed',
      message: 'An error occurred while triggering AI analysis',
    });
  }
});

module.exports = router;
