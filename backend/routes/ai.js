const express = require('express');
const { body, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/ai/analyze/{recordId}:
 *   post:
 *     summary: Trigger AI analysis for medical record
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         description: Medical record ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysisType:
 *                 type: string
 *                 enum: [full, summary, specific]
 *                 default: full
 *               focusAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: AI analysis triggered successfully
 *       404:
 *         description: Medical record not found
 *       403:
 *         description: Access denied
 */
router.post('/analyze/:recordId', auth, [
  body('analysisType').optional().isIn(['full', 'summary', 'specific']).withMessage('Invalid analysis type'),
  body('focusAreas').optional().isArray().withMessage('Focus areas must be an array'),
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

    const { recordId } = req.params;
    const { analysisType = 'full', focusAreas = [] } = req.body;
    const user = req.user;

    // Find medical record
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Medical record not found',
      });
    }

    // Check access permissions
    if (record.patientId.toString() !== user._id.toString() && 
        !record.isSharedWith(user._id) && 
        user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to analyze this record',
      });
    }

    // Update record status
    record.status = 'processing';
    await record.save();

    // TODO: Implement actual AI analysis
    // This would involve calling an AI service or adding to a job queue
    // For now, we'll simulate the process

    // Simulate AI analysis based on record type
    let aiAnalysis = null;
    
    if (record.type === 'lab_report') {
      aiAnalysis = {
        summary: 'AI analysis of lab report completed successfully',
        findings: [
          {
            key: 'Hemoglobin',
            value: '14.2',
            unit: 'g/dL',
            normalRange: '12.0-16.0',
            status: 'normal',
          },
          {
            key: 'White Blood Cells',
            value: '7.5',
            unit: 'K/μL',
            normalRange: '4.5-11.0',
            status: 'normal',
          },
          {
            key: 'Glucose',
            value: '95',
            unit: 'mg/dL',
            normalRange: '70-100',
            status: 'normal',
          },
        ],
        recommendations: [
          'Continue regular monitoring',
          'Maintain healthy diet',
          'Schedule follow-up in 6 months',
        ],
        confidence: 0.92,
        analyzedAt: new Date(),
        modelVersion: '1.0',
        analysisType,
        focusAreas,
      };
    } else if (record.type === 'imaging') {
      aiAnalysis = {
        summary: 'AI analysis of imaging study completed successfully',
        findings: [
          {
            key: 'Image Quality',
            value: 'Good',
            status: 'normal',
          },
          {
            key: 'Anatomical Structures',
            value: 'Normal',
            status: 'normal',
          },
        ],
        recommendations: [
          'No immediate concerns detected',
          'Follow up with radiologist if symptoms persist',
        ],
        confidence: 0.88,
        analyzedAt: new Date(),
        modelVersion: '1.0',
        analysisType,
        focusAreas,
      };
    } else {
      aiAnalysis = {
        summary: 'AI analysis completed successfully',
        findings: [
          {
            key: 'Document Type',
            value: record.type.replace('_', ' '),
            status: 'normal',
          },
        ],
        recommendations: [
          'Review with healthcare provider',
          'Keep for medical records',
        ],
        confidence: 0.75,
        analyzedAt: new Date(),
        modelVersion: '1.0',
        analysisType,
        focusAreas,
      };
    }

    // Simulate processing delay
    setTimeout(async () => {
      try {
        record.aiAnalysis = aiAnalysis;
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

        // Notify shared users
        for (const share of record.sharedWith) {
          if (share.doctorId && share.doctorId.toString() !== record.patientId.toString()) {
            await Notification.createNotification(
              share.doctorId,
              'ai_analysis_complete',
              'AI Analysis Complete',
              `AI analysis for "${record.title}" has been completed.`,
              { recordId: record._id, actionUrl: `/medical-records/${record._id}` }
            );
          }
          if (share.hospitalId && share.hospitalId.toString() !== record.patientId.toString()) {
            await Notification.createNotification(
              share.hospitalId,
              'ai_analysis_complete',
              'AI Analysis Complete',
              `AI analysis for "${record.title}" has been completed.`,
              { recordId: record._id, actionUrl: `/medical-records/${record._id}` }
            );
          }
        }
      } catch (error) {
        console.error('AI analysis completion error:', error);
        record.status = 'uploaded';
        await record.save();
      }
    }, 3000); // 3 second delay for simulation

    res.json({
      message: 'AI analysis triggered successfully',
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 3000),
    });
  } catch (error) {
    console.error('AI analysis trigger error:', error);
    res.status(500).json({
      error: 'AI analysis failed',
      message: 'An error occurred while triggering AI analysis',
    });
  }
});

/**
 * @swagger
 * /api/ai/health-insights:
 *   get:
 *     summary: Get AI-generated health insights for patient
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Timeframe for insights
 *     responses:
 *       200:
 *         description: Health insights retrieved successfully
 *       403:
 *         description: Access denied (not a patient)
 */
router.get('/health-insights', auth, async (req, res) => {
  try {
    const user = req.user;
    const { timeframe = 'month' } = req.query;

    if (user.role !== 'patient') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Health insights are only available for patients',
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get records with AI analysis in timeframe
    const records = await MedicalRecord.find({
      patientId: user._id,
      'aiAnalysis.analyzedAt': { $gte: startDate },
      'aiAnalysis.summary': { $exists: true },
    }).sort({ 'aiAnalysis.analyzedAt': -1 });

    // TODO: Implement actual AI insights generation
    // This would involve analyzing the AI analysis data and generating insights
    // For now, we'll provide mock insights

    const insights = {
      overallHealth: {
        status: 'Good',
        score: 85,
        trend: 'stable',
        summary: 'Your overall health indicators are within normal ranges.',
      },
      keyFindings: [
        {
          category: 'Blood Work',
          status: 'Normal',
          details: 'All blood markers are within healthy ranges.',
          recommendation: 'Continue current lifestyle habits.',
        },
        {
          category: 'Vital Signs',
          status: 'Good',
          details: 'Blood pressure and heart rate are optimal.',
          recommendation: 'Maintain regular exercise routine.',
        },
      ],
      recommendations: [
        'Continue regular health monitoring',
        'Maintain balanced diet',
        'Stay physically active',
        'Schedule annual checkup',
      ],
      riskFactors: [
        {
          factor: 'Family History',
          level: 'Low',
          description: 'No significant family history of chronic conditions.',
        },
      ],
      nextSteps: [
        'Schedule follow-up appointment',
        'Continue medication as prescribed',
        'Monitor symptoms and report changes',
      ],
      generatedAt: new Date(),
      timeframe,
      recordCount: records.length,
    };

    res.json({
      insights,
    });
  } catch (error) {
    console.error('Get health insights error:', error);
    res.status(500).json({
      error: 'Failed to retrieve health insights',
      message: 'An error occurred while generating health insights',
    });
  }
});

/**
 * @swagger
 * /api/ai/predictions:
 *   get:
 *     summary: Get AI health predictions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: horizon
 *         schema:
 *           type: string
 *           enum: [short, medium, long]
 *         description: Prediction horizon
 *     responses:
 *       200:
 *         description: Health predictions retrieved successfully
 *       403:
 *         description: Access denied (not a patient)
 */
router.get('/predictions', auth, async (req, res) => {
  try {
    const user = req.user;
    const { horizon = 'medium' } = req.query;

    if (user.role !== 'patient') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Health predictions are only available for patients',
      });
    }

    // TODO: Implement actual AI predictions
    // This would involve analyzing historical data and generating predictions
    // For now, we'll provide mock predictions

    const predictions = {
      horizon,
      predictions: [
        {
          category: 'Cardiovascular Health',
          prediction: 'Low risk of cardiovascular issues in the next 6 months',
          confidence: 0.85,
          factors: ['Normal blood pressure', 'Good cholesterol levels'],
          recommendations: ['Continue current lifestyle', 'Regular exercise'],
        },
        {
          category: 'Metabolic Health',
          prediction: 'Stable blood sugar levels expected',
          confidence: 0.78,
          factors: ['Normal glucose levels', 'Healthy diet'],
          recommendations: ['Maintain balanced diet', 'Regular monitoring'],
        },
      ],
      riskFactors: [
        {
          factor: 'Age-related changes',
          probability: 0.15,
          timeframe: '1-2 years',
          mitigation: 'Regular health screenings',
        },
      ],
      generatedAt: new Date(),
      modelVersion: '1.0',
    };

    res.json({
      predictions,
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve predictions',
      message: 'An error occurred while generating predictions',
    });
  }
});

/**
 * @swagger
 * /api/ai/reminders:
 *   get:
 *     summary: Get AI-generated health reminders
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health reminders retrieved successfully
 */
router.get('/reminders', auth, async (req, res) => {
  try {
    const user = req.user;

    // TODO: Implement actual AI reminder generation
    // This would involve analyzing user data and generating personalized reminders
    // For now, we'll provide mock reminders

    const reminders = {
      medication: [
        {
          medication: 'Vitamin D',
          frequency: 'Daily',
          time: 'Morning',
          reason: 'Based on your lab results',
          priority: 'medium',
        },
      ],
      appointments: [
        {
          type: 'Annual Checkup',
          suggestedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          reason: 'Due for annual health assessment',
          priority: 'high',
        },
      ],
      lifestyle: [
        {
          activity: 'Exercise',
          frequency: '3-4 times per week',
          reason: 'Maintain cardiovascular health',
          priority: 'high',
        },
        {
          activity: 'Blood pressure monitoring',
          frequency: 'Weekly',
          reason: 'Track cardiovascular health',
          priority: 'medium',
        },
      ],
      screenings: [
        {
          test: 'Cholesterol Panel',
          suggestedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          reason: 'Annual cholesterol screening',
          priority: 'medium',
        },
      ],
      generatedAt: new Date(),
    };

    res.json({
      reminders,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      error: 'Failed to retrieve reminders',
      message: 'An error occurred while generating reminders',
    });
  }
});

module.exports = router;
