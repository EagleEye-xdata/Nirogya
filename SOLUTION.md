# 🔧 **SOLUTION: Fix "Failed to Fetch" Authentication Error**

## 🎯 **The Problem**
Your frontend is showing "Failed to fetch" because it cannot connect to the backend API. This happens when:
1. Backend is not running
2. Backend is running on wrong port
3. CORS issues
4. Environment configuration missing

## ✅ **The Solution (Step by Step)**

### **Step 1: Start the Backend**

#### **Option A: Use the Batch File (Easiest)**
```bash
# Double-click this file or run in terminal:
start_backend.bat
```

#### **Option B: Manual Setup**
```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create environment file
copy env.example .env

# 6. Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Step 2: Configure Frontend Environment**

1. **Create `.env` file in the root directory** (same level as package.json):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Nirogya Health Scribe
VITE_DEBUG=true
```

2. **Copy the content from `frontend.env`** to your `.env` file

### **Step 3: Start Frontend**
```bash
# Install dependencies (if not done)
npm install

# Start the frontend
npm run dev
```

## 🔍 **How to Verify It's Working**

### **1. Check Backend is Running**
- Open browser and go to: http://localhost:8000/docs
- You should see the API documentation
- If you see "This site can't be reached" → Backend is not running

### **2. Check Frontend Environment**
- Open browser console (F12)
- Look for logs like: "🔗 Attempting to connect to: http://localhost:8000/api/v1"
- If you see "Failed to fetch" → Backend is not running or wrong URL

### **3. Test Authentication**
- Go to http://localhost:5173
- Try to register a new user
- Check browser console for detailed error messages

## 🚨 **Common Issues & Solutions**

### **Issue 1: "ModuleNotFoundError: No module named 'requests'"**
**Solution:**
```bash
cd backend
pip install requests
# Or install all requirements:
pip install -r requirements.txt
```

### **Issue 2: "Cannot connect to server"**
**Solution:**
1. Make sure backend is running on http://localhost:8000
2. Check if port 8000 is free:
```bash
# Windows:
netstat -an | findstr :8000
# If something is using it, kill it:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### **Issue 3: "CORS error"**
**Solution:** The backend is configured to allow all origins in development mode. If you still get CORS errors:
1. Make sure you're using the correct API URL
2. Check that the backend is actually running

### **Issue 4: "Environment variable not found"**
**Solution:**
1. Create `.env` file in the root directory (not in backend folder)
2. Make sure it contains: `VITE_API_BASE_URL=http://localhost:8000/api/v1`
3. Restart the frontend after creating the file

## 🎯 **Expected Behavior After Fix**

### **Backend Console Should Show:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### **Frontend Console Should Show:**
```
🔗 Attempting to connect to: http://localhost:8000/api/v1
📡 Login response status: 200
✅ Login successful, tokens received
✅ User authenticated successfully
```

### **Browser Network Tab Should Show:**
- Successful requests to `http://localhost:8000/api/v1/auth/login`
- Status: 200 OK
- Response with access_token and refresh_token

## 🆘 **Still Not Working?**

### **Debug Steps:**
1. **Check Backend**: Visit http://localhost:8000/docs
2. **Check Frontend**: Open browser console (F12) and look for errors
3. **Check Environment**: Make sure `.env` file exists and has correct URL
4. **Check Ports**: Make sure 8000 and 5173 are not blocked

### **Quick Test:**
```bash
# Test if backend is responding
curl http://localhost:8000/health
# Should return: {"status": "healthy", "service": "nirogya-backend"}
```

### **Reset Everything:**
```bash
# Stop all processes (Ctrl+C in each terminal)
# Then restart:
# 1. Backend: start_backend.bat
# 2. Frontend: npm run dev
```

## 📞 **Need More Help?**

If you're still stuck:
1. **Check the browser console** (F12) for detailed error messages
2. **Check the backend terminal** for error messages
3. **Make sure all files are in the right places**:
   - Backend code in `backend/` folder
   - Frontend code in root folder
   - `.env` file in root folder (not in backend)

The key is making sure the backend is running on http://localhost:8000 and the frontend knows to connect to http://localhost:8000/api/v1
