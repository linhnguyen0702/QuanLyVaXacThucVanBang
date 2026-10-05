const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hệ thống Quản lý và Xác thực Văn bằng, Chứng chỉ số API',
    version: '1.0.0',
    status: 'running',
    database: 'MySQL 8.0 (' + (process.env.DB_NAME || 'certificate_verification') + ')'
  });
});

// Import route files
const authRoutes = require('./routes/auth.routes');
const certificateRoutes = require('./routes/certificate.routes');
const verificationRoutes = require('./routes/verification.routes');
const schoolRoutes = require('./routes/school.routes');
const studentRoutes = require('./routes/student.routes');
const programRoutes = require('./routes/program.routes');
const userRoutes = require('./routes/user.routes');
const reportRoutes = require('./routes/report.routes');
const logRoutes = require('./routes/log.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend is running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${process.env.DB_NAME} (User: ${process.env.DB_USER})`);
});

module.exports = app;
