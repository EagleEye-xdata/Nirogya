#!/usr/bin/env python3
"""
Quick start script for Nirogya Backend
This script will help you get the backend running quickly
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import motor
        import pymongo
        import redis
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Installing dependencies...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False

def check_environment():
    """Check and create environment file"""
    print("🔍 Checking environment configuration...")
    
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("📝 Creating .env file from template...")
            with open(env_example, 'r') as f:
                content = f.read()
            with open(env_file, 'w') as f:
                f.write(content)
            print("✅ .env file created")
        else:
            print("❌ No env.example file found")
            return False
    else:
        print("✅ .env file exists")
    
    return True

def check_database_connection():
    """Check if MongoDB and Redis are accessible"""
    print("🔍 Checking database connections...")
    
    # Check MongoDB
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print("✅ MongoDB connection: OK")
        mongodb_ok = True
    except Exception as e:
        print(f"❌ MongoDB connection: FAILED - {e}")
        print("   Please start MongoDB: mongod")
        mongodb_ok = False
    
    # Check Redis
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0, socket_connect_timeout=2)
        r.ping()
        print("✅ Redis connection: OK")
        redis_ok = True
    except Exception as e:
        print(f"❌ Redis connection: FAILED - {e}")
        print("   Please start Redis: redis-server")
        redis_ok = False
    
    return mongodb_ok and redis_ok

def start_backend():
    """Start the FastAPI backend"""
    print("🚀 Starting Nirogya Backend...")
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🏥 Nirogya Health Scribe Backend - Quick Start")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("app").exists():
        print("❌ Please run this script from the backend directory")
        print("   cd backend && python quick_start.py")
        return False
    
    # Step 1: Check dependencies
    if not check_dependencies():
        return False
    
    # Step 2: Check environment
    if not check_environment():
        return False
    
    # Step 3: Check database connections
    if not check_database_connection():
        print("\n⚠️  Database connections failed!")
        print("Please start MongoDB and Redis, then run this script again.")
        print("\nTo start databases with Docker:")
        print("  docker-compose up -d mongodb redis")
        return False
    
    print("\n✅ All checks passed!")
    print("🎯 Starting backend server...")
    print("📖 API Documentation will be available at: http://localhost:8000/docs")
    print("🔗 API Base URL: http://localhost:8000/api/v1")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    # Start the backend
    return start_backend()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
