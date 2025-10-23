#!/usr/bin/env python3
"""
Simple test script to check if the Nirogya backend API is working
"""

import requests
import json
import sys

def test_api_connection():
    """Test basic API connectivity"""
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Nirogya Backend API Connection...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: PASSED")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Health check: FAILED - Cannot connect to API")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Health check: FAILED - {str(e)}")
        return False
    
    # Test 2: Root endpoint
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint: PASSED")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Root endpoint: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Root endpoint: FAILED - {str(e)}")
    
    # Test 3: API documentation
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API Documentation: AVAILABLE")
            print(f"   Visit: {base_url}/docs")
        else:
            print(f"❌ API Documentation: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API Documentation: FAILED - {str(e)}")
    
    # Test 4: CORS headers
    try:
        response = requests.options(f"{base_url}/api/v1/auth/login", timeout=5)
        if "Access-Control-Allow-Origin" in response.headers:
            print("✅ CORS: CONFIGURED")
            print(f"   CORS Headers: {dict(response.headers)}")
        else:
            print("⚠️  CORS: Headers not found")
    except Exception as e:
        print(f"❌ CORS test: FAILED - {str(e)}")
    
    print("=" * 50)
    print("🎯 Next steps:")
    print("1. If all tests passed, your backend is working!")
    print("2. Check the frontend configuration in .env file")
    print("3. Make sure VITE_API_BASE_URL is set to http://localhost:8000/api/v1")
    
    return True

if __name__ == "__main__":
    success = test_api_connection()
    sys.exit(0 if success else 1)
