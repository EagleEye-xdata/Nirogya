#!/bin/bash

# Nirogya Backend Startup Script

echo "🚀 Starting Nirogya Health Scribe Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from env.example..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
python -c "
import pymongo
try:
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    client.admin.command('ping')
    print('✅ MongoDB is running')
except Exception as e:
    print('❌ MongoDB is not running. Please start MongoDB first.')
    exit(1)
"

# Check if Redis is running
echo "🔍 Checking Redis connection..."
python -c "
import redis
try:
    r = redis.Redis(host='localhost', port=6379, db=0)
    r.ping()
    print('✅ Redis is running')
except Exception as e:
    print('❌ Redis is not running. Please start Redis first.')
    exit(1)
"

# Start the application
echo "🎯 Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
