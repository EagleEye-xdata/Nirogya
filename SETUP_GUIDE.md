# 🚀 NIROGYA Health Scribe - Complete Setup Guide

## 🎯 **Quick Start (5 Minutes)**

### **Step 1: Start the Backend**
```bash
# Windows
cd backend
start.bat

# Mac/Linux
cd backend
./start.sh
```

### **Step 2: Start the Frontend**
```bash
# In a new terminal
npm install
npm run dev
```

### **Step 3: Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

---

## 🏗️ **Complete Setup Guide**

### **Prerequisites**

1. **Node.js 18+** - [Download here](https://nodejs.org)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use Docker
3. **Git** - [Download here](https://git-scm.com)

### **Backend Setup**

#### **1. Navigate to Backend Directory**
```bash
cd backend
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Configure Environment**
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings
```

**Required Environment Variables:**
```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/nirogya

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloud Storage (Choose one)
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

#### **4. Start MongoDB**
```bash
# Option A: Local MongoDB
mongod

# Option B: Docker MongoDB
docker run -d -p 27017:27017 --name mongodb mongo

# Option C: MongoDB Atlas (Cloud)
# Use connection string in MONGODB_URI
```

#### **5. Start the Backend**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### **Frontend Setup**

#### **1. Navigate to Root Directory**
```bash
cd ..
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Configure Environment**
```bash
# Create .env file
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
```

#### **4. Start the Frontend**
```bash
npm run dev
```

---

## 🔧 **Configuration Details**

### **Database Configuration**

#### **MongoDB Local Setup**
```bash
# Install MongoDB
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/your/db
```

#### **MongoDB Docker Setup**
```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Check if running
docker ps
```

#### **MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### **Email Configuration**

#### **Gmail Setup**
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in `SMTP_PASS`

#### **Other SMTP Providers**
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

### **Cloud Storage Configuration**

#### **Cloudinary Setup**
1. Create account at [Cloudinary](https://cloudinary.com)
2. Get API credentials
3. Update `.env` with Cloudinary settings

#### **AWS S3 Setup**
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Update `.env` with AWS credentials

---

## 🧪 **Testing the Setup**

### **1. Backend Health Check**
```bash
curl http://localhost:5000/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "service": "nirogya-backend",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### **2. API Documentation**
Visit: http://localhost:5000/api-docs

### **3. Frontend Connection**
Visit: http://localhost:5173

### **4. Test Authentication**
1. Go to http://localhost:5173
2. Try to register a new user
3. Check browser console for any errors

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. "Cannot connect to MongoDB"**
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod

# Docker
docker start mongodb
```

#### **2. "Port 5000 already in use"**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID_NUMBER> /F

# Kill process (Mac/Linux)
kill -9 <PID_NUMBER>
```

#### **3. "Module not found" errors**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **4. "CORS error" in browser**
- Check `CORS_ORIGIN` in backend `.env`
- Make sure frontend URL is included
- Restart backend after changing CORS settings

#### **5. "Failed to fetch" in frontend**
- Check if backend is running on http://localhost:5000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check browser console for detailed errors

### **Debug Commands**

#### **Check Backend Logs**
```bash
# Backend should show:
# ✅ Connected to MongoDB
# 🚀 NIROGYA Backend Server running on http://localhost:5000
```

#### **Check Frontend Logs**
```bash
# Frontend should show:
# Local: http://localhost:5173/
# Network: http://192.168.1.100:5173/
```

#### **Test API Endpoints**
```bash
# Health check
curl http://localhost:5000/health

# API root
curl http://localhost:5000/api

# Auth endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"patient"}'
```

---

## 🚀 **Production Deployment**

### **Environment Variables for Production**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nirogya
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### **PM2 Process Manager**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name nirogya-backend

# Monitor
pm2 monit
```

---

## 📚 **Additional Resources**

### **API Documentation**
- **Swagger UI**: http://localhost:5000/api-docs
- **OpenAPI Spec**: http://localhost:5000/api-docs.json

### **Database Management**
- **MongoDB Compass**: GUI for MongoDB
- **Studio 3T**: Advanced MongoDB GUI

### **Development Tools**
- **Postman**: API testing
- **Insomnia**: API client
- **MongoDB Atlas**: Cloud database

---

## 🆘 **Getting Help**

### **Check Logs**
```bash
# Backend logs
npm run dev

# Frontend logs
npm run dev
```

### **Common Solutions**
1. **Restart everything**: Stop all processes and restart
2. **Clear cache**: Delete node_modules and reinstall
3. **Check ports**: Make sure 5000 and 5173 are free
4. **Check environment**: Verify all .env files are correct

### **Still Having Issues?**
1. Check the browser console (F12) for errors
2. Check the backend terminal for error messages
3. Verify all services are running on correct ports
4. Make sure all environment variables are set correctly

---

## ✅ **Success Checklist**

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected successfully
- [ ] API documentation accessible at http://localhost:5000/api-docs
- [ ] Health check returns 200 OK
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] No CORS errors in browser console
- [ ] No "Failed to fetch" errors

**🎉 Congratulations! Your NIROGYA Health Scribe application is ready to use!**
