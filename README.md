# TechHire Analytics - Full-Stack Hiring Assessment Platform

A comprehensive, production-ready hiring assessment platform with secure code execution, real-time analytics, and role-based access control.

## 🌟 Overview

TechHire Analytics is a modern full-stack application designed to streamline the technical hiring process. It provides a complete assessment ecosystem with DSA coding challenges, aptitude tests, and interview simulations, backed by powerful analytics and secure infrastructure.

## ✨ Key Features

### 🔐 **Authentication & Security**
- **JWT-based Authentication** with refresh token rotation
- **Role-based Access Control** (Candidate, Recruiter, Admin)
- **Email Verification** and secure password reset
- **Rate Limiting** and comprehensive security headers
- **Audit Logging** for compliance and monitoring

### 💻 **Assessment Modules**

#### **DSA Assessment**
- **Secure Code Execution** in Docker-sandboxed environments
- **Multi-language Support** (JavaScript, Python, Java, C++)
- **Real-time Code Editor** with Monaco Editor (VS Code experience)
- **Automated Test Case Validation** with detailed feedback
- **Performance Metrics** (execution time, memory usage)

#### **Aptitude Testing**
- **Timed Assessments** with category-wise scoring
- **Question Navigation** with mark-for-review functionality
- **Negative Marking** system with configurable penalties
- **Progress Tracking** and auto-save functionality

#### **Interview Simulation**
- **Voice Recording** with Web Speech API integration
- **Transcript Generation** and analysis
- **Response Quality Scoring** based on clarity and pace
- **Behavioral and Technical** question categories

### 📊 **Analytics & Insights**
- **Real-time Performance Dashboards** with interactive charts
- **Weakness Identification** with personalized recommendations
- **Progress Tracking** and historical performance analysis
- **Recruiter Analytics** for candidate evaluation
- **Comprehensive Reporting** with export capabilities

### 🏗️ **Technical Architecture**
- **Microservices-Ready** modular backend architecture
- **Database Optimization** with Prisma ORM and PostgreSQL
- **Caching Layer** with Redis for improved performance
- **Real-time Updates** via Socket.IO
- **File Storage** with AWS S3 integration
- **Email Service** with customizable templates

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **React Router v6** for navigation
- **Recharts** for data visualization
- **Monaco Editor** for code editing
- **Socket.IO Client** for real-time features

### **Backend**
- **Node.js 18+** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and sessions
- **Docker** for secure code execution
- **JWT** for authentication
- **Winston** for logging
- **Jest** for testing

### **Infrastructure**
- **Docker & Docker Compose** for containerization
- **GitHub Actions** for CI/CD
- **AWS S3** for file storage
- **Nginx** for reverse proxy
- **PostgreSQL** for data persistence
- **Redis** for caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for code execution)

### 1. Clone Repository
```bash
git clone <repository-url>
cd techhire-analytics
```

### 2. Backend Setup
```bash
cd BACKEND
npm install
cp .env.example .env
# Edit .env with your configuration

# Database setup
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start backend
npm run dev
```

### 3. Frontend Setup
```bash
cd FRONTEND
npm install
cp .env.example .env
# Edit .env with your configuration

# Start frontend
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

### Default Credentials
- **Admin**: admin@techhire.com / Admin123!
- **Recruiter**: recruiter@techhire.com / Recruiter123!

## 📁 Project Structure

```
techhire-analytics/
├── FRONTEND/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── config/          # Configuration files
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
├── BACKEND/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── config/          # Configuration
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema & migrations
│   └── __tests__/           # Test files
└── docs/                    # Documentation
```

## 🔒 Security Features

### **Code Execution Security**
- **Sandboxed Environments**: All code runs in isolated Docker containers
- **Resource Limits**: CPU and memory constraints prevent abuse
- **Network Isolation**: No external network access during execution
- **Timeout Protection**: Prevents infinite loops and long-running processes

### **Data Protection**
- **Encryption**: Passwords hashed with bcrypt (12 rounds)
- **JWT Security**: Short-lived tokens with refresh rotation
- **Input Validation**: Comprehensive validation and sanitization
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy and input sanitization

### **Infrastructure Security**
- **HTTPS Enforcement**: SSL/TLS encryption for all communications
- **Rate Limiting**: API endpoint protection against abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: Helmet.js for security headers
- **Audit Logging**: Comprehensive activity logging

## 🧪 Testing

### Backend Testing
```bash
cd BACKEND
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd FRONTEND
npm test                   # Run all tests
npm run test:coverage      # Coverage report
```

### Integration Testing
```bash
# Run full test suite
npm run test:integration
```

## 📊 Monitoring & Analytics

### **Application Monitoring**
- **Health Checks**: Endpoint monitoring and alerting
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Comprehensive error logging
- **Resource Usage**: CPU, memory, and database metrics

### **User Analytics**
- **Assessment Performance**: Success rates and completion times
- **User Engagement**: Feature usage and retention metrics
- **System Usage**: Peak times and resource utilization

## 🚀 Deployment

### **Development**
```bash
docker-compose up -d
```

### **Production**
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Or use individual containers
docker build -t techhire-backend ./BACKEND
docker build -t techhire-frontend ./FRONTEND
```

### **Environment Variables**
Key production environment variables:

```bash
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_NODE_ENV=production
```

## 📈 Scalability Considerations

### **Horizontal Scaling**
- **Stateless Backend**: Easy horizontal scaling with load balancers
- **Database Optimization**: Connection pooling and query optimization
- **Caching Strategy**: Redis for session and data caching
- **CDN Integration**: Static asset delivery optimization

### **Performance Optimization**
- **Code Splitting**: Lazy loading for frontend components
- **Database Indexing**: Optimized queries and indexes
- **Compression**: Gzip compression for API responses
- **Image Optimization**: Automatic image compression and resizing

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run the test suite (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Test Coverage**: Minimum 80% coverage required

## 📄 API Documentation

### **Authentication**
```bash
POST /api/v1/auth/register      # User registration
POST /api/v1/auth/login         # User login
POST /api/v1/auth/refresh-token # Token refresh
POST /api/v1/auth/logout        # User logout
```

### **Assessments**
```bash
GET  /api/v1/assessments        # List assessments
POST /api/v1/assessments        # Create assessment
GET  /api/v1/assessments/:id    # Get assessment
POST /api/v1/assessments/:id/start # Start assessment
```

### **Code Execution**
```bash
POST /api/v1/submissions/execute # Execute code
GET  /api/v1/submissions/:id     # Get submission
```

## 🆘 Support & Documentation

- **API Documentation**: Available at `/api/docs` when running
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Wiki**: Comprehensive documentation in the repository wiki
- **Community**: Discussions and Q&A in GitHub Discussions

## 📊 Performance Benchmarks

### **Code Execution**
- **JavaScript**: ~50ms average execution time
- **Python**: ~100ms average execution time
- **Java**: ~200ms average execution time (includes compilation)
- **C++**: ~150ms average execution time (includes compilation)

### **API Performance**
- **Authentication**: <100ms response time
- **Assessment Loading**: <200ms response time
- **Analytics Queries**: <500ms response time
- **File Uploads**: <2s for 5MB files

## 🔮 Roadmap

### **Phase 1** (Current)
- ✅ Core assessment functionality
- ✅ Secure code execution
- ✅ Basic analytics dashboard
- ✅ User management system

### **Phase 2** (Next Quarter)
- 🔄 Advanced analytics with ML insights
- 🔄 Video interview capabilities
- 🔄 Advanced proctoring features
- 🔄 Mobile application

### **Phase 3** (Future)
- 📋 AI-powered question generation
- 📋 Advanced plagiarism detection
- 📋 Integration with ATS systems
- 📋 White-label solutions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** for the excellent code editing experience
- **Prisma** for the fantastic database toolkit
- **React** and **Express** communities for excellent documentation
- **Docker** for enabling secure code execution
- **All contributors** who have helped improve this project

---

**Built with ❤️ by the TechHire Analytics Team**

For more information, visit our [documentation](docs/) or [create an issue](issues/new) for support.