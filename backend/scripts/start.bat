@echo off
echo 🚀 Starting Nirogya Health Scribe Backend...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Copying from env.example...
    copy env.example .env
    echo 📝 Please edit .env file with your configuration before running again.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist venv (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Check if MongoDB is running
echo 🔍 Checking MongoDB connection...
python -c "import pymongo; client = pymongo.MongoClient('mongodb://localhost:27017/'); client.admin.command('ping'); print('✅ MongoDB is running')" 2>nul || (
    echo ❌ MongoDB is not running. Please start MongoDB first.
    pause
    exit /b 1
)

REM Check if Redis is running
echo 🔍 Checking Redis connection...
python -c "import redis; r = redis.Redis(host='localhost', port=6379, db=0); r.ping(); print('✅ Redis is running')" 2>nul || (
    echo ❌ Redis is not running. Please start Redis first.
    pause
    exit /b 1
)

REM Start the application
echo 🎯 Starting FastAPI application...
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
