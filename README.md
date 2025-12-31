# 🏥 Nirogya Health Scribe

An AI-powered centralized health record management system that connects patients, doctors, and healthcare providers through a secure, intelligent platform.

Demo:- https://nirogya-three.vercel.app/

## 🌟 Features

### 🔐 Security & Privacy
- **End-to-end encryption** for all sensitive health data
- **HIPAA-compliant** data handling and storage
- **Role-based access control** (Patient, Doctor, Admin)
- **JWT authentication** with refresh tokens
- **Audit logging** for complete compliance tracking

### 🧠 AI-Powered Intelligence
- **Automated medical report analysis** with AI insights
- **Health trend analysis** and predictive analytics
- **Smart recommendations** based on medical history
- **Prescription reminders** and medication tracking
- **Risk assessment** and early warning systems

### 📋 Medical Record Management
- **Secure file upload** with cloud storage (AWS S3)
- **Multiple file format support** (PDF, images, documents)
- **AI-powered report analysis** and insights
- **Doctor-patient sharing** with temporary access tokens
- **Version control** and audit trails

### 📅 Appointment System
- **Smart scheduling** with availability management
- **Telemedicine support** with video conferencing
- **Automated reminders** via email and SMS
- **Waitlist management** and rescheduling
- **Doctor availability** and slot management

### 🔔 Communication & Notifications
- **Real-time notifications** for all activities
- **Email and SMS alerts** for important updates
- **In-app messaging** between patients and doctors
- **Prescription reminders** and follow-up alerts
- **Customizable notification preferences**

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Modern React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Query** for state management
- **Axios** for API communication
- **Responsive design** for all devices

### Backend (FastAPI + Python)
- **FastAPI** for high-performance API
- **MongoDB** for document storage
- **Redis** for caching and sessions
- **JWT authentication** with refresh tokens
- **AWS S3** for file storage
- **Docker** for containerization

### Database Schema
- **Users**: Patient, Doctor, Admin profiles
- **Medical Records**: Reports, prescriptions, images
- **Appointments**: Scheduling and management
- **Notifications**: Real-time communication
- **Audit Logs**: Compliance and tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB 7.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Nirogya-main
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Start MongoDB and Redis
docker-compose up -d mongodb redis

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your configuration

# Start the frontend
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🐳 Docker Deployment

### Complete Stack with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included
- **Frontend**: React app on port 3000
- **Backend**: FastAPI on port 8000
- **MongoDB**: Database on port 27017
- **Redis**: Cache on port 6379
- **Nginx**: Reverse proxy on port 80

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register     # Register new user
POST /api/v1/auth/login        # Login user
POST /api/v1/auth/refresh       # Refresh token
GET  /api/v1/auth/me           # Get current user
```

### Medical Records
```
POST /api/v1/medical-records/upload           # Upload report
GET  /api/v1/medical-records/                # Get user records
GET  /api/v1/medical-records/{id}            # Get specific record
POST /api/v1/medical-records/{id}/send-to-doctor  # Share with doctor
```

### Appointments
```
POST /api/v1/appointments/                   # Create appointment
GET  /api/v1/appointments/                  # Get user appointments
PUT  /api/v1/appointments/{id}              # Update appointment
POST /api/v1/appointments/{id}/cancel       # Cancel appointment
```

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Nirogya Health Scribe
VITE_DEBUG=true
```

#### Backend (.env)
```env
# Database
MONGODB_URL=mongodb://localhost:27017/nirogya
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloud Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=nirogya-medical-reports

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app  # With coverage
```

### Frontend Tests
```bash
npm test
npm run test:coverage
```

## 📊 Monitoring & Logging

### Health Checks
- Backend: `GET /health`
- Database connectivity
- Redis connectivity
- File storage access

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking
- Audit trail for compliance

## 🔒 Security Features

### Data Protection
- **Encryption at rest** for all sensitive data
- **Secure file uploads** with virus scanning
- **Temporary access tokens** for sharing
- **Role-based permissions** for all operations

### Authentication
- **JWT tokens** with short expiration
- **Refresh token rotation**
- **Email verification** required
- **Password reset** with secure tokens

### API Security
- **Rate limiting** to prevent abuse
- **CORS protection** with configurable origins
- **Input validation** and sanitization
- **SQL injection protection**

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment
export DEBUG=False
export SECRET_KEY=your-production-secret
export MONGODB_URL=mongodb://prod-mongo:27017/nirogya
```

### Docker Production
```bash
# Build production images
docker build -t nirogya-frontend:latest ./frontend
docker build -t nirogya-backend:latest ./backend

# Deploy with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling
- **Horizontal scaling** with multiple backend instances
- **Load balancing** with Nginx
- **Database clustering** for MongoDB
- **Redis clustering** for cache

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📖 Check the [documentation](backend/README.md)
- 🐛 Report issues in the [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Join our [Discord community](https://discord.gg/your-discord)
- 📧 Email support: support@nirogya.com

### Common Issues
- **MongoDB connection failed**: Ensure MongoDB is running on port 27017
- **Redis connection failed**: Ensure Redis is running on port 6379
- **File upload failed**: Check AWS S3 configuration
- **Authentication failed**: Verify JWT secret key configuration

## 🔄 Roadmap

### Version 2.0 (Coming Soon)
- [ ] **Mobile app** (React Native)
- [ ] **Advanced AI features** (predictive analytics)
- [ ] **Telemedicine integration** (video calls)
- [ ] **Wearable device integration** (fitness trackers)
- [ ] **Multi-language support**

### Version 3.0 (Future)
- [ ] **Blockchain integration** for data integrity
- [ ] **Advanced ML models** for diagnosis assistance
- [ ] **IoT device integration** (smart health monitors)
- [ ] **Global healthcare network** integration

## 🙏 Acknowledgments

- **FastAPI** for the amazing Python web framework
- **React** team for the excellent frontend library
- **MongoDB** for the flexible document database
- **Tailwind CSS** for the utility-first CSS framework
- **Shadcn/ui** for the beautiful component library

---

**Built with ❤️ for better healthcare management**

*Nirogya Health Scribe - Empowering patients and doctors with intelligent health record management.*
