const express = require('express');
const { verifyWebhook, handleWebhook } = require('../controllers/whatsappController');

const router = express.Router();

// GET /webhook/whatsapp & GET /webhook (Meta Verification Challenge)
router.get('/webhook/whatsapp', verifyWebhook);
router.get('/webhook', verifyWebhook);

// POST /webhook/whatsapp & POST /webhook (Meta Event Notifications)
router.post('/webhook/whatsapp', handleWebhook);
router.post('/webhook', handleWebhook);

module.exports = router;
