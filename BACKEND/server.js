const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const nlp = require('compromise');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// GROQ proxy endpoints - use server-side API key from BACKEND/.env (process.env.API_KEY)
const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

// Proxy to list models (used for validating key from frontend)
app.get('/api/groq/models', async (req, res) => {
  try {
    const resp = await axios.get(`${GROQ_API_BASE}/models`, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`
      }
    });
    res.status(resp.status).json(resp.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: err.message };
    console.error('GROQ /models error:', err.response?.data || err.message);
    res.status(status).json(data);
  }
});

// Proxy chat completions (frontend posts body directly)
app.post('/api/groq/chat', async (req, res) => {
  try {
    const resp = await axios.post(`${GROQ_API_BASE}/chat/completions`, req.body, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    res.status(resp.status).json(resp.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { error: err.message };
    console.error('GROQ /chat error:', err.response?.data || err.message);
    res.status(status).json(data);
  }
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'), false);
    }
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TechHire';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Connect to MongoDB with retry logic. Don't exit the process on initial failure
// so the server can run in degraded mode (useful for local development).
const connectWithRetry = (retryDelay = 5000) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      console.log('📊 Database:', mongoose.connection.name);
      console.log('🔗 Host:', mongoose.connection.host);
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.log(`Retrying MongoDB connection in ${retryDelay / 1000}s...`);
      setTimeout(() => connectWithRetry(retryDelay), retryDelay);
    });
};

connectWithRetry();

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

// Resume Analysis Schema
const resumeAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String, required: true },
  analysis: {
    overallScore: { type: Number, required: true },
    sections: {
      contact: { score: Number, feedback: String },
      summary: { score: Number, feedback: String },
      experience: { score: Number, feedback: String },
      education: { score: Number, feedback: String },
      skills: { score: Number, feedback: String },
      projects: { score: Number, feedback: String }
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    keywords: {
      technical: [String],
      soft: [String],
      missing: [String]
    },
    atsScore: { type: Number, required: true },
    readabilityScore: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

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

// NLP Analysis Functions
const analyzeResumeText = (text) => {
  const doc = nlp(text);
  
  // Extract sections
  const sections = extractResumeSections(text);
  
  // Analyze each section
  const sectionScores = {
    contact: analyzeContactSection(sections.contact),
    summary: analyzeSummarySection(sections.summary),
    experience: analyzeExperienceSection(sections.experience),
    education: analyzeEducationSection(sections.education),
    skills: analyzeSkillsSection(sections.skills),
    projects: analyzeProjectsSection(sections.projects)
  };
  
  // Calculate overall score
  const overallScore = calculateOverallScore(sectionScores);
  
  // Extract keywords
  const keywords = extractKeywords(text);
  
  // Calculate ATS score
  const atsScore = calculateATSScore(text, keywords);
  
  // Calculate readability score
  const readabilityScore = calculateReadabilityScore(text);
  
  // Generate recommendations
  const { strengths, weaknesses, recommendations } = generateRecommendations(sectionScores, keywords);
  
  return {
    overallScore,
    sections: sectionScores,
    strengths,
    weaknesses,
    recommendations,
    keywords,
    atsScore,
    readabilityScore
  };
};

const extractResumeSections = (text) => {
  const sections = {
    contact: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: ''
  };
  
  const lines = text.split('\n');
  let currentSection = 'contact';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
      currentSection = 'summary';
    } else if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work')) {
      currentSection = 'experience';
    } else if (lowerLine.includes('education') || lowerLine.includes('qualification')) {
      currentSection = 'education';
    } else if (lowerLine.includes('skills') || lowerLine.includes('technical') || lowerLine.includes('competencies')) {
      currentSection = 'skills';
    } else if (lowerLine.includes('projects') || lowerLine.includes('portfolio')) {
      currentSection = 'projects';
    } else {
      sections[currentSection] += line + '\n';
    }
  }
  
  return sections;
};

const analyzeContactSection = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  
  let score = 0;
  let feedback = [];
  
  if (emailRegex.test(text)) {
    score += 30;
  } else {
    feedback.push('Add a professional email address');
  }
  
  if (phoneRegex.test(text)) {
    score += 25;
  } else {
    feedback.push('Include a contact phone number');
  }
  
  if (text.toLowerCase().includes('linkedin') || text.toLowerCase().includes('github')) {
    score += 25;
  } else {
    feedback.push('Add LinkedIn and GitHub profiles');
  }
  
  if (text.length > 50) {
    score += 20;
  } else {
    feedback.push('Provide complete contact information');
  }
  
  return { score, feedback: feedback.join('; ') };
};

const analyzeSummarySection = (text) => {
  let score = 0;
  let feedback = [];
  
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount >= 30 && wordCount <= 80) {
    score += 40;
  } else if (wordCount < 30) {
    feedback.push('Summary is too short, aim for 30-80 words');
  } else {
    feedback.push('Summary is too long, keep it concise (30-80 words)');
  }
  
  const keywordCount = (text.match(/\b(experienced|skilled|proficient|expert|specialized)\b/gi) || []).length;
  if (keywordCount > 0) {
    score += 30;
  } else {
    feedback.push('Include power words like "experienced", "skilled", "proficient"');
  }
  
  if (text.includes('years') || text.includes('experience')) {
    score += 30;
  } else {
    feedback.push('Mention your years of experience');
  }
  
  return { score, feedback: feedback.join('; ') };
};

const analyzeExperienceSection = (text) => {
  let score = 0;
  let feedback = [];
  
  const bulletPoints = (text.match(/•|·|\*|-/g) || []).length;
  if (bulletPoints >= 6) {
    score += 30;
  } else {
    feedback.push('Use more bullet points to describe achievements');
  }
  
  const actionWords = (text.match(/\b(developed|implemented|managed|led|created|improved|optimized|designed)\b/gi) || []).length;
  if (actionWords >= 5) {
    score += 35;
  } else {
    feedback.push('Use more action verbs to describe your accomplishments');
  }
  
  const numbers = (text.match(/\d+%|\d+\+|\$\d+|\d+ (users|customers|projects|team)/gi) || []).length;
  if (numbers >= 3) {
    score += 35;
  } else {
    feedback.push('Quantify your achievements with numbers and metrics');
  }
  
  return { score, feedback: feedback.join('; ') };
};

const analyzeEducationSection = (text) => {
  let score = 0;
  let feedback = [];
  
  const degreeKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certification'];
  const hasDegree = degreeKeywords.some(keyword => text.toLowerCase().includes(keyword));
  
  if (hasDegree) {
    score += 50;
  } else {
    feedback.push('Include your educational qualifications');
  }
  
  const yearPattern = /\b(19|20)\d{2}\b/;
  if (yearPattern.test(text)) {
    score += 25;
  } else {
    feedback.push('Include graduation year');
  }
  
  if (text.toLowerCase().includes('gpa') || text.toLowerCase().includes('cgpa') || text.toLowerCase().includes('grade')) {
    score += 25;
  } else {
    feedback.push('Consider adding GPA if it\'s above 3.5');
  }
  
  return { score, feedback: feedback.join('; ') };
};

const analyzeSkillsSection = (text) => {
  let score = 0;
  let feedback = [];
  
  const technicalSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'git'];
  const foundSkills = technicalSkills.filter(skill => text.toLowerCase().includes(skill));
  
  if (foundSkills.length >= 5) {
    score += 40;
  } else {
    feedback.push('Include more relevant technical skills');
  }
  
  const softSkills = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical'];
  const foundSoftSkills = softSkills.filter(skill => text.toLowerCase().includes(skill));
  
  if (foundSoftSkills.length >= 3) {
    score += 30;
  } else {
    feedback.push('Add soft skills like leadership, communication, teamwork');
  }
  
  const skillCount = text.split(',').length;
  if (skillCount >= 8 && skillCount <= 15) {
    score += 30;
  } else {
    feedback.push('Aim for 8-15 skills total');
  }
  
  return { score, feedback: feedback.join('; ') };
};

const analyzeProjectsSection = (text) => {
  let score = 0;
  let feedback = [];
  
  const projectCount = (text.match(/project|application|system|platform/gi) || []).length;
  if (projectCount >= 2) {
    score += 40;
  } else {
    feedback.push('Include at least 2-3 relevant projects');
  }
  
  const techStack = (text.match(/\b(react|angular|vue|node|express|mongodb|mysql|aws|docker)\b/gi) || []).length;
  if (techStack >= 3) {
    score += 30;
  } else {
    feedback.push('Mention technologies used in projects');
  }
  
  const links = (text.match(/github|gitlab|demo|live|url|link/gi) || []).length;
  if (links >= 1) {
    score += 30;
  } else {
    feedback.push('Include GitHub links or live demo URLs');
  }
  
  return { score, feedback: feedback.join('; ') };
};

const calculateOverallScore = (sectionScores) => {
  const weights = {
    contact: 0.1,
    summary: 0.15,
    experience: 0.3,
    education: 0.15,
    skills: 0.2,
    projects: 0.1
  };
  
  let totalScore = 0;
  for (const [section, weight] of Object.entries(weights)) {
    totalScore += (sectionScores[section]?.score || 0) * weight;
  }
  
  return Math.round(totalScore);
};

const extractKeywords = (text) => {
  const technicalKeywords = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'express',
    'mongodb', 'mysql', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes',
    'git', 'jenkins', 'ci/cd', 'agile', 'scrum', 'rest api', 'graphql'
  ];
  
  const softKeywords = [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
    'creative', 'adaptable', 'detail-oriented', 'time management', 'project management'
  ];
  
  const lowerText = text.toLowerCase();
  
  const foundTechnical = technicalKeywords.filter(keyword => lowerText.includes(keyword));
  const foundSoft = softKeywords.filter(keyword => lowerText.includes(keyword));
  
  const missingTechnical = technicalKeywords.filter(keyword => !lowerText.includes(keyword)).slice(0, 5);
  
  return {
    technical: foundTechnical,
    soft: foundSoft,
    missing: missingTechnical
  };
};

const calculateATSScore = (text, keywords) => {
  let score = 0;
  
  // Check for proper formatting
  if (text.includes('\n')) score += 20;
  
  // Check for keyword density
  const keywordCount = keywords.technical.length + keywords.soft.length;
  if (keywordCount >= 10) score += 30;
  else if (keywordCount >= 5) score += 20;
  else score += 10;
  
  // Check for standard sections
  const sections = ['experience', 'education', 'skills'];
  const foundSections = sections.filter(section => text.toLowerCase().includes(section));
  score += foundSections.length * 10;
  
  // Check for contact information
  if (text.includes('@')) score += 10;
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) score += 10;
  
  return Math.min(score, 100);
};

const calculateReadabilityScore = (text) => {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const syllables = text.split(/[aeiouAEIOU]/).length - 1;
  
  // Simplified Flesch Reading Ease formula
  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

const generateRecommendations = (sectionScores, keywords) => {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  // Analyze strengths and weaknesses
  Object.entries(sectionScores).forEach(([section, data]) => {
    if (data.score >= 70) {
      strengths.push(`Strong ${section} section`);
    } else if (data.score < 50) {
      weaknesses.push(`Weak ${section} section`);
      recommendations.push(`Improve your ${section} section: ${data.feedback}`);
    }
  });
  
  // Technical skills recommendations
  if (keywords.technical.length < 5) {
    weaknesses.push('Limited technical skills mentioned');
    recommendations.push('Add more relevant technical skills for your target role');
  }
  
  // General recommendations
  if (keywords.missing.length > 0) {
    recommendations.push(`Consider adding these trending skills: ${keywords.missing.slice(0, 3).join(', ')}`);
  }
  
  return { strengths, weaknesses, recommendations };
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

// ============= MOCK API ROUTES =============
const mockApiRoutes = require('./routes/mockApi');
app.use('/api', mockApiRoutes);

// ============= RESUME ANALYSIS ROUTES =============

// Upload and analyze resume
app.post('/api/v1/resume/analyze', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let extractedText = '';

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from the file'
      });
    }

    // Perform NLP analysis
    const analysis = analyzeResumeText(extractedText);

    // Save analysis to database
    const resumeAnalysis = new ResumeAnalysis({
      userId: req.user.id,
      fileName: req.file.originalname,
      extractedText,
      analysis
    });

    await resumeAnalysis.save();

    res.json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        id: resumeAnalysis._id,
        fileName: resumeAnalysis.fileName,
        analysis: resumeAnalysis.analysis,
        createdAt: resumeAnalysis.createdAt
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume'
    });
  }
});

// Get user's resume analyses
app.get('/api/v1/resume/analyses', authenticateToken, async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user.id })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { analyses }
    });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analyses'
    });
  }
});

// Get specific resume analysis
app.get('/api/v1/resume/analyses/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis'
    });
  }
});

// Delete resume analysis
app.delete('/api/v1/resume/analyses/:id', authenticateToken, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting analysis'
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