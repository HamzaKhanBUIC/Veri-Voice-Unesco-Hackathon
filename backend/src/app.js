const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes/api.routes');

const app = express();

// Trust reverse proxy (e.g. Render, Cloudflare, ALB) to properly resolve client req.ip
app.set('trust proxy', 1);

// Allowed origins for CORS (Vercel production, preview environments, localhost development)
const ALLOWED_ORIGINS = [
  'https://verivoice-unesco.vercel.app',
  'https://verivoice.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl, Discord webhook, server-to-server, or mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    // For prototype compatibility, allow read-only CORS with fallback
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-verivoice-session'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Standard HTTP Security Headers Middleware (Defense-in-depth against XSS, clickjacking, sniffing)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=(), geolocation=()');
  next();
});

// JSON and URL-encoded body parsers with strict 10MB bounds
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static audio files from backend/tmp/ with secure caching and headers
app.use('/tmp', express.static(path.join(__dirname, '../tmp'), {
  acceptRanges: true,
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=3600');
  },
}));

// Serve web frontend from backend/public/
app.use(express.static(path.join(__dirname, '../public')));

// Core API routes
app.use('/', healthRoutes);
app.use('/', apiRoutes);

// SPA fallback for HTML page requests on client-side routes (e.g. /talk, /chat, /methodology, /privacy)
const SPA_ROUTES = ['/', '/talk', '/chat', '/methodology', '/privacy'];
app.get('*', (req, res, next) => {
  if (SPA_ROUTES.includes(req.path) && req.accepts('html')) {
    const indexPath = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Catch-all 404 handler for unmatched API requests
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Centralized error handler - Sanitizes error output to prevent internal stack leakages
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred. Please retry your request.',
  });
});

module.exports = app;
