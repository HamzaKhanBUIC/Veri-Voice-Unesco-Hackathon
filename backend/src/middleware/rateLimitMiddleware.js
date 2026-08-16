const RateLimiter = require('../services/rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../services/concurrency/ConcurrencyLimiter');

/**
 * Express Rate Limiting & Concurrency Middleware.
 * Provides granular endpoint-specific request budgets, global system throttles,
 * and concurrency semaphores to protect AI provider quotas and backend compute.
 */

// Dedicated limiter instances
const verifyRateLimiter = new RateLimiter({ maxRequests: 8, windowMs: 60000, globalMaxRequests: 40, globalWindowMs: 60000 });
const ttsRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000, globalMaxRequests: 50, globalWindowMs: 60000 });
const healthRateLimiter = new RateLimiter({ maxRequests: 60, windowMs: 60000, globalMaxRequests: 200, globalWindowMs: 60000 });

// Dedicated concurrency semaphores
const verifyConcurrencyLimiter = new ConcurrencyLimiter({ maxConcurrent: 4 });
const ttsConcurrencyLimiter = new ConcurrencyLimiter({ maxConcurrent: 4 });

/**
 * Extracts a robust client key using IP address and optional session context.
 * @param {import('express').Request} req
 * @returns {string} Client identifier
 */
function getClientKey(req) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const sessionId = req.body?.context?.sessionId || req.headers['x-verivoice-session'] || '';
  return sessionId ? `${ip}_${sessionId}` : ip;
}

/**
 * Rate limit & concurrency middleware for POST /api/verify.
 */
function verifyProtectionMiddleware(req, res, next) {
  // 1. Global System Budget Check
  const globalCheck = verifyRateLimiter.checkGlobal();
  if (!globalCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'System busy under high verification traffic. Please try again shortly.',
      retryAfterSeconds: Math.ceil(globalCheck.resetMs / 1000),
    });
  }

  // 2. Client Identity Rate Limit Check
  const clientKey = getClientKey(req);
  const clientCheck = verifyRateLimiter.check(clientKey);
  if (!clientCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: "You're making verification requests a little too quickly. Please wait a moment before trying again.",
      retryAfterSeconds: Math.ceil(clientCheck.resetMs / 1000),
    });
  }

  // 3. Concurrency Semaphore
  verifyConcurrencyLimiter
    .run(async () => {
      return new Promise((resolve) => {
        // Intercept response finish/close to release concurrency semaphore
        res.on('finish', resolve);
        res.on('close', resolve);
        next();
      });
    })
    .catch((err) => {
      console.error('Verify concurrency error:', err.message);
      if (!res.headersSent) {
        res.status(503).json({ success: false, error: 'Verification worker busy. Please retry.' });
      }
    });
}

/**
 * Rate limit & concurrency middleware for GET /api/tts.
 */
function ttsProtectionMiddleware(req, res, next) {
  const globalCheck = ttsRateLimiter.checkGlobal();
  if (!globalCheck.allowed) {
    return res.status(429).json({
      error: 'System audio synthesis capacity reached. Please try again shortly.',
      retryAfterSeconds: Math.ceil(globalCheck.resetMs / 1000),
    });
  }

  const clientKey = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const clientCheck = ttsRateLimiter.check(clientKey);
  if (!clientCheck.allowed) {
    return res.status(429).json({
      error: 'Audio synthesis rate limit exceeded. Please wait a moment before generating more voice responses.',
      retryAfterSeconds: Math.ceil(clientCheck.resetMs / 1000),
    });
  }

  ttsConcurrencyLimiter
    .run(async () => {
      return new Promise((resolve) => {
        res.on('finish', resolve);
        res.on('close', resolve);
        next();
      });
    })
    .catch((err) => {
      console.error('TTS concurrency error:', err.message);
      if (!res.headersSent) {
        res.status(503).json({ error: 'Audio worker busy. Please retry.' });
      }
    });
}

/**
 * Rate limit middleware for GET /health.
 */
function healthProtectionMiddleware(req, res, next) {
  const clientKey = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const check = healthRateLimiter.check(clientKey);
  if (!check.allowed) {
    return res.status(429).json({ error: 'Too many health check requests.', retryAfterSeconds: Math.ceil(check.resetMs / 1000) });
  }
  next();
}

module.exports = {
  verifyProtectionMiddleware,
  ttsProtectionMiddleware,
  healthProtectionMiddleware,
  verifyRateLimiter,
  ttsRateLimiter,
  getClientKey,
};
