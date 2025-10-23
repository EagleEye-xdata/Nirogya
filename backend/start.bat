@echo off
echo 🏥 Starting NIROGYA Health Scribe Backend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if MongoDB is running
echo 🔍 Checking MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nirogya').then(() => { console.log('✅ MongoDB connected'); process.exit(0); }).catch(() => { console.log('❌ MongoDB connection failed'); process.exit(1); });" 2>nul
if errorlevel 1 (
    echo ❌ MongoDB is not running
    echo Please start MongoDB: mongod
    echo Or use Docker: docker run -d -p 27017:27017 mongo
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration
    echo.
)

REM Start the server
echo 🚀 Starting FastAPI backend...
echo 📖 API Documentation: http://localhost:5000/api-docs
echo 🔗 API Base URL: http://localhost:5000/api
echo 🏥 Health Check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
