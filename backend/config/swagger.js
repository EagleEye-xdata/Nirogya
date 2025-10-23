const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NIROGYA Health Scribe API',
      version: '1.0.0',
      description: 'AI-powered centralized health record platform API',
      contact: {
        name: 'Team 5-Bits',
        email: 'support@nirogya.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.nirogya.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['patient', 'doctor', 'hospital', 'admin'] },
            profile: { type: 'object' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MedicalRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            patientId: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['lab_report', 'prescription', 'imaging', 'consultation', 'other'] },
            fileUrl: { type: 'string' },
            fileType: { type: 'string' },
            fileSize: { type: 'number' },
            status: { type: 'string', enum: ['uploaded', 'processing', 'ready', 'shared', 'archived'] },
            metadata: { type: 'object' },
            aiAnalysis: { type: 'object' },
            doctorNotes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
