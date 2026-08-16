const express = require('express');
const router = express.Router();
const { healthProtectionMiddleware } = require('../middleware/rateLimitMiddleware');

router.get('/health', healthProtectionMiddleware, (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'verivoice-backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
