const express = require('express');
const cors = require('cors');
const path = require('path');
const healthRoutes = require('./routes/health.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static audio files from backend/tmp/
app.use('/tmp', express.static(path.join(__dirname, '../tmp')));

// Serve temporary testing web frontend from backend/public/
app.use(express.static(path.join(__dirname, '../public')));

// Core API routes
app.use('/', healthRoutes);
app.use('/', whatsappRoutes);
app.use('/', apiRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

module.exports = app;
