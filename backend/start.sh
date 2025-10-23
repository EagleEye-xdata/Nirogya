#!/bin/bash

echo "🏥 Starting NIROGYA Health Scribe Backend..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nirogya').then(() => { console.log('✅ MongoDB connected'); process.exit(0); }).catch(() => { console.log('❌ MongoDB connection failed'); process.exit(1); });" 2>/dev/null; then
    echo "❌ MongoDB is not running"
    echo "Please start MongoDB: mongod"
    echo "Or use Docker: docker run -d -p 27017:27017 mongo"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration"
    echo
fi

# Start the server
echo "🚀 Starting Node.js backend..."
echo "📖 API Documentation: http://localhost:5000/api-docs"
echo "🔗 API Base URL: http://localhost:5000/api"
echo "🏥 Health Check: http://localhost:5000/health"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev
