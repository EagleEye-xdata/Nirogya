# 🏥 NIROGYA Health Scribe Backend

AI-powered centralized health record platform backend built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **📁 Medical Records Management**: Upload, store, and manage medical documents
- **🤖 AI Integration**: AI analysis of medical records and health insights
- **🔗 Secure Sharing**: Token-based sharing system for doctors and hospitals
- **📧 Notifications**: Email and in-app notifications
- **📊 Dashboard**: Role-specific dashboards with statistics
- **☁️ Cloud Storage**: AWS S3 and Cloudinary integration
- **🔒 Security**: Rate limiting, CORS, helmet, input validation
- **📚 API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **File Upload**: Multer
- **Cloud Storage**: AWS S3, Cloudinary
- **Email**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Validation**: express-validator, Joi

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- MongoDB 4.4+
- Redis (optional, for caching)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nirogya-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   HOST=localhost

   # Database
   MONGODB_URI=mongodb://localhost:27017/nirogya

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key
   JWT_REFRESH_EXPIRE=30d

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Cloud Storage (choose one)
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # OR AWS S3
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=nirogya-medical-files

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🏗️ Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── database.js         # Database connection
│   └── swagger.js         # API documentation config
├── middleware/             # Custom middleware
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Global error handler
│   └── upload.js          # File upload middleware
├── models/                 # Database models
│   ├── User.js            # User model
│   ├── MedicalRecord.js   # Medical record model
│   ├── Notification.js    # Notification model
│   └── SharingToken.js    # Sharing token model
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── users.js           # User management routes
│   ├── medicalRecords.js  # Medical record routes
│   ├── sharing.js         # Sharing routes
│   ├── notifications.js   # Notification routes
│   ├── dashboard.js       # Dashboard routes
│   └── ai.js              # AI routes
├── utils/                  # Utility functions
│   ├── jwtUtils.js        # JWT utilities
│   ├── emailService.js    # Email service
│   └── cloudStorage.js    # Cloud storage utilities
├── uploads/               # Local file storage (fallback)
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Medical Records
- `GET /api/medical-records` - Get user's medical records
- `GET /api/medical-records/:id` - Get specific medical record
- `POST /api/medical-records` - Upload new medical record
- `PUT /api/medical-records/:id` - Update medical record
- `DELETE /api/medical-records/:id` - Delete medical record
- `POST /api/medical-records/:id/share` - Share medical record
- `POST /api/medical-records/:id/ai-analysis` - Trigger AI analysis

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/doctors` - Get list of doctors
- `GET /api/users/hospitals` - Get list of hospitals

### Sharing
- `GET /api/sharing/tokens` - Get sharing tokens
- `POST /api/sharing/create-token` - Create sharing token
- `GET /api/sharing/access/:token` - Access shared record
- `DELETE /api/sharing/revoke/:tokenId` - Revoke sharing token

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/:id` - Get specific notification
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity
- `GET /api/dashboard/health-summary` - Get health summary (patients)
- `GET /api/dashboard/doctor-stats` - Get doctor statistics

### AI
- `POST /api/ai/analyze/:recordId` - Trigger AI analysis
- `GET /api/ai/health-insights` - Get health insights
- `GET /api/ai/predictions` - Get health predictions
- `GET /api/ai/reminders` - Get health reminders

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **patient**: Can upload and manage their own medical records
- **doctor**: Can access shared medical records and add notes
- **hospital**: Can access shared medical records for their patients
- **admin**: Full system access

## 📁 File Upload

The API supports file uploads for medical records:

- **Supported formats**: PDF, JPG, JPEG, PNG, TIFF, DOC, DOCX
- **Max file size**: 10MB (configurable)
- **Storage**: AWS S3 or Cloudinary (configurable)

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Request validation with express-validator
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Security**: Secure token generation and validation

## 📧 Email Notifications

The system sends email notifications for:

- Account verification
- Password reset
- Medical record sharing
- AI analysis completion

Configure SMTP settings in your `.env` file.

## 🤖 AI Integration

The AI module provides:

- **Medical Record Analysis**: Automated analysis of uploaded documents
- **Health Insights**: Personalized health recommendations
- **Predictions**: Health trend predictions
- **Reminders**: Medication and appointment reminders

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Comprehensive error handling and logging
- **Health Check**: `/health` endpoint for monitoring

## 🚀 Deployment

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t nirogya-backend .
   docker run -p 5000:5000 nirogya-backend
   ```

### Environment Variables

Ensure all required environment variables are set in production:

- Database connection string
- JWT secrets
- Email configuration
- Cloud storage credentials
- CORS origins

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@nirogya.com

## 🔄 Version History

- **v1.0.0**: Initial release with core features
  - Authentication system
  - Medical record management
  - AI integration
  - Sharing system
  - Notifications
  - Dashboard