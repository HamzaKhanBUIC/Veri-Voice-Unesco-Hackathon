const { env } = require('../config/env');
const WhatsAppService = require('../services/whatsapp/WhatsAppService');

const whatsappService = new WhatsAppService();

/**
 * Handles Meta Webhook GET Verification Request.
 * Meta sends GET request to verify endpoint during webhook configuration.
 */
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (!mode || !token) {
    return res.status(400).json({ error: 'Missing required webhook verification parameters.' });
  }

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook verification challenge passed.');
    return res.status(200).send(challenge);
  } else {
    console.warn('⚠️ WhatsApp Webhook verification token mismatch.');
    return res.status(403).json({ error: 'Forbidden: Verification token mismatch.' });
  }
}

/**
 * Handles Meta Webhook POST Event Notifications.
 * Quickly acknowledges webhook HTTP 200 and processes asynchronously.
 */
function handleWebhook(req, res) {
  // Quickly acknowledge webhook receipt to Meta to prevent retries
  res.status(200).send('EVENT_RECEIVED');

  // Asynchronous background execution
  setImmediate(() => {
    whatsappService.handleIncomingPayload(req.body).catch((err) => {
      console.error(`❌ Unhandled background error in handleIncomingPayload: ${err.message}`);
    });
  });
}

module.exports = {
  verifyWebhook,
  handleWebhook,
  setWhatsAppServiceInstance: (instance) => {
    // Helper for dependency injection during testing
    Object.assign(whatsappService, instance);
  },
};
