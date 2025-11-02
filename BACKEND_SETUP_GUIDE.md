# Backend Setup Guide

## ✅ Backend Status: FIXED

The backend has been improved with better error handling, configuration management, and helpful debugging information.

## 🚀 Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd BACKEND
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run setup script:**
   ```bash
   npm run setup
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` even if MongoDB is not connected.

## 🔧 What Was Fixed

### 1. **MongoDB Connection Issues**
- ✅ Added graceful error handling for MongoDB connection failures
- ✅ Server continues running even without database connection
- ✅ Clear error messages and troubleshooting steps
- ✅ Proper connection timeout settings

### 2. **Environment Configuration**
- ✅ Created `.env` and `.env.example` files
- ✅ Added setup script for easy configuration
- ✅ Better default values and validation

### 3. **Error Handling**
- ✅ Database connection middleware
- ✅ Proper error responses for database unavailability
- ✅ Improved logging and debugging information

### 4. **API Documentation**
- ✅ Enhanced health check endpoint
- ✅ API documentation endpoint at `/api/v1`
- ✅ Better status reporting

## 📊 Testing the Backend

### 1. **Health Check**
```bash
curl http://localhost:5000/api/v1/health
```

### 2. **API Documentation**
```bash
curl http://localhost:5000/api/v1
```

### 3. **Test Registration (requires MongoDB)**
```bash
npm test
```

## 🗄️ Database Setup Options

### Option A: MongoDB Atlas (Recommended - Free)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free account
3. Create cluster
4. Get connection string
5. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/TechHire?retryWrites=true&w=majority
   ```

### Option B: Local MongoDB

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Keep default `.env` setting:
   ```env
   MONGODB_URI=mongodb://localhost:27017/TechHire
   ```

## 🔍 Troubleshooting

### Server won't start
- Check if port 5000 is available
- Run `npm install` to ensure dependencies are installed

### Database connection fails
- Verify MongoDB is running (if local)
- Check connection string in `.env`
- Test with health check endpoint

### API requests fail
- Check if server is running on port 5000
- Verify CORS settings
- Check browser console for errors

## 📝 Available Scripts

```bash
npm start          # Start server
npm run dev        # Start with auto-reload
npm run setup      # Run setup script
npm test           # Test registration
npm run health     # Check server health
```

## 🔗 Integration with Frontend

The frontend is already configured to connect to `http://localhost:5000/api/v1`. Once the backend is running, the frontend authentication and user management features will work.

## 🛡️ Security Notes

- JWT secrets are configurable in `.env`
- Passwords are hashed with bcrypt
- CORS is enabled for development
- For production, update JWT secrets and configure CORS properly

## ✨ Next Steps

1. **Start the backend:** `npm start`
2. **Configure MongoDB** (optional for basic testing)
3. **Test API endpoints** using the health check
4. **Start the frontend** and test full integration

The backend is now robust and will provide helpful error messages if any issues occur!