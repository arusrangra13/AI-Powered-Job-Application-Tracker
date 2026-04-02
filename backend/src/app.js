require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const reminderRoutes = require('./routes/reminders');
const analyzeRoutes = require('./routes/analyze');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API root helper
app.get('/api', (req, res) => {
  res.json({
    service: 'JobTracker API',
    status: 'ok',
    note: 'Use /api/auth, /api/jobs, /api/applications, /api/reminders, /api/dashboard, /api/analyze',
  })
})

// 404
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use(errorHandler);

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend server running on ${HOST}:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
