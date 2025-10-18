const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TechHire';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Host:', mongoose.connection.host);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Add connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: 'candidate' },
  experienceLevel: { 
    type: String, 
    enum: ['fresher', '1-3', '3+'],
    default: 'fresher'
  },
  preferredRole: { type: String },
  avatar: { type: String },
  refreshTokens: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Assessment Schema
const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['dsa', 'aptitude', 'interview', 'full'], required: true },
  score: { type: Number },
  totalQuestions: { type: Number },
  answeredQuestions: { type: Number },
  timeSpent: { type: Number },
  answers: { type: Map, of: mongoose.Schema.Types.Mixed },
  completed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

// ============= AUTH ROUTES =============

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, experienceLevel, preferredRole } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      experienceLevel,
      preferredRole
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          experienceLevel: user.experienceLevel,
          preferredRole: user.preferredRole
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          experienceLevel: user.experienceLevel,
          preferredRole: user.preferredRole
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Refresh Token
app.post('/api/v1/auth/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    // Verify refresh token
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid refresh token' 
        });
      }

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.id);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid refresh token' 
        });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during token refresh' 
    });
  }
});

// Logout
app.post('/api/v1/auth/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
});

// ============= USER ROUTES =============

// Get Profile
app.get('/api/v1/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          experienceLevel: user.experienceLevel,
          preferredRole: user.preferredRole,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update Profile
app.put('/api/v1/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, experienceLevel, preferredRole, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (experienceLevel) user.experienceLevel = experienceLevel;
    if (preferredRole) user.preferredRole = preferredRole;
    if (avatar) user.avatar = avatar;
    user.updatedAt = Date.now();

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          experienceLevel: user.experienceLevel,
          preferredRole: user.preferredRole,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Change Password
app.post('/api/v1/users/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password are required' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ============= ASSESSMENT ROUTES =============

// Get all assessments for user
app.get('/api/v1/assessments', authenticateToken, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id })
      .sort({ startedAt: -1 });

    res.json({
      success: true,
      data: { assessments }
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Start assessment
app.post('/api/v1/assessments/:id/start', authenticateToken, async (req, res) => {
  try {
    const { type, totalQuestions } = req.body;

    const assessment = new Assessment({
      userId: req.user.id,
      type: type || 'full',
      totalQuestions: totalQuestions || 43,
      answeredQuestions: 0,
      timeSpent: 0,
      answers: new Map()
    });

    await assessment.save();

    res.json({
      success: true,
      message: 'Assessment started',
      data: { assessment }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Submit assessment
app.put('/api/v1/assessments/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers, score, timeSpent } = req.body;

    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assessment not found' 
      });
    }

    assessment.answers = answers;
    assessment.score = score;
    assessment.timeSpent = timeSpent;
    assessment.answeredQuestions = Object.keys(answers).length;
    assessment.completed = true;
    assessment.completedAt = Date.now();

    await assessment.save();

    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: { assessment }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api/v1`);
});