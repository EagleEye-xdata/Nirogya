# 🚀 Nirogya Health Scribe - Quick Startup Guide

## ❌ **"Failed to Fetch" Error - How to Fix**

The "Failed to fetch" error means your frontend cannot connect to the backend. Here's how to fix it:

## 🔧 **Step 1: Start the Backend**

### Option A: Quick Start (Recommended)
```bash
cd backend
python quick_start.py
```

### Option B: Manual Start
```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Create environment file
cp env.example .env

# 3. Start MongoDB and Redis (if not running)
# On Windows with Docker:
docker-compose up -d mongodb redis

# On Linux/Mac:
# Start MongoDB: mongod
# Start Redis: redis-server

# 4. Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔧 **Step 2: Configure Frontend**

Create a `.env` file in the root directory with:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Nirogya Health Scribe
VITE_DEBUG=true
```

## 🔧 **Step 3: Start Frontend**
```bash
npm install
npm run dev
```

## ✅ **Step 4: Test Connection**

1. **Backend should be running on**: http://localhost:8000
2. **API Documentation**: http://localhost:8000/docs
3. **Frontend should be running on**: http://localhost:5173

## 🔍 **Troubleshooting**

### If Backend Won't Start:
```bash
# Check if port 8000 is free
netstat -an | findstr :8000

# Kill process using port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### If MongoDB/Redis Won't Start:
```bash
# Use Docker Compose
cd backend
docker-compose up -d mongodb redis

# Check if they're running
docker-compose ps
```

### If Frontend Shows "Failed to Fetch":
1. Make sure backend is running on http://localhost:8000
2. Check browser console for errors
3. Verify `.env` file has correct API URL
4. Try accessing http://localhost:8000/docs in browser

## 🧪 **Test the API**

Open your browser and go to:
- **Backend Health**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

You should see JSON responses.

## 📱 **Test Authentication**

1. Go to http://localhost:5173
2. Try to register a new user
3. Check browser console for detailed error messages
4. If successful, try logging in

## 🆘 **Still Having Issues?**

### Check These:
1. **Backend is running**: Visit http://localhost:8000/docs
2. **Frontend environment**: Check `.env` file exists
3. **CORS errors**: Backend should allow all origins in development
4. **Port conflicts**: Try different ports if 8000/5173 are busy

### Common Solutions:
```bash
# Clear browser cache
Ctrl+Shift+R (hard refresh)

# Restart everything
# 1. Stop backend (Ctrl+C)
# 2. Stop frontend (Ctrl+C)
# 3. Start backend again
# 4. Start frontend again

# Check logs
# Backend logs will show in terminal
# Frontend logs in browser console (F12)
```

## 🎯 **Expected Flow**

1. **Backend starts** → Shows "Uvicorn running on http://0.0.0.0:8000"
2. **Frontend starts** → Shows "Local: http://localhost:5173"
3. **User registers** → Backend creates user, frontend shows success
4. **User logs in** → Backend returns JWT tokens, frontend stores them
5. **User accesses app** → Frontend uses tokens for API calls

## 📞 **Need Help?**

If you're still stuck:
1. Check the browser console (F12) for detailed errors
2. Check the backend terminal for error messages
3. Make sure all services are running on the correct ports
4. Try the test script: `cd backend && python test_api.py`
