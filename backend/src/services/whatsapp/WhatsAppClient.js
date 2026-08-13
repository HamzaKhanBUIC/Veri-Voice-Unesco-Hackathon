const fs = require('fs');
const path = require('path');
const { env } = require('../../config/env');

/**
 * Isolated WhatsApp Cloud API Client using native Node fetch.
 */
class WhatsAppClient {
  constructor(options = {}) {
    this.token = options.token || env.WHATSAPP_TOKEN;
    this.phoneNumberId = options.phoneNumberId || env.WHATSAPP_PHONE_NUMBER_ID;
    this.apiVersion = options.apiVersion || env.WHATSAPP_API_VERSION;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Retrieves temporary media download URL from Meta API given a media ID.
   * @param {string} mediaId 
   * @returns {Promise<{ id: string, url: string, mime_type: string, file_size: number }>}
   */
  async getMediaUrl(mediaId) {
    if (!this.token || this.token.includes('your_')) {
      throw new Error('WhatsAppClient: WHATSAPP_TOKEN is missing or unconfigured.');
    }

    const response = await fetch(`${this.baseUrl}/${mediaId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`WhatsApp API error fetching media URL (${response.status}): ${errText}`);
    }

    return await response.json();
  }

  /**
   * Downloads temporary media binary into target local file path.
   * @param {string} downloadUrl 
   * @param {string} targetPath 
   * @returns {Promise<string>} Target file path
   */
  async downloadMedia(downloadUrl, targetPath) {
    if (!this.token || this.token.includes('your_')) {
      throw new Error('WhatsAppClient: WHATSAPP_TOKEN is missing or unconfigured.');
    }

    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error downloading media binary (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(targetPath, buffer);
    return targetPath;
  }

  /**
   * Uploads local audio file to WhatsApp Media endpoint.
   * @param {string} audioPath 
   * @param {string} [mimeType='audio/mpeg'] 
   * @returns {Promise<string>} Generated WhatsApp Media ID
   */
  async uploadMedia(audioPath, mimeType = 'audio/mpeg') {
    if (!this.token || !this.phoneNumberId || this.token.includes('your_')) {
      throw new Error('WhatsAppClient: WHATSAPP_TOKEN or PHONE_NUMBER_ID is unconfigured.');
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error(`WhatsAppClient: Audio file not found at ${audioPath}`);
    }

    const fileBuffer = fs.readFileSync(audioPath);
    const blob = new Blob([fileBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append('file', blob, path.basename(audioPath));
    formData.append('type', mimeType);
    formData.append('messaging_product', 'whatsapp');

    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`WhatsApp API error uploading media (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.id) {
      throw new Error('WhatsApp API upload response did not contain media ID.');
    }

    return data.id;
  }

  /**
   * Sends a plain text message to recipient phone number.
   * @param {string} recipientPhone 
   * @param {string} text 
   * @returns {Promise<object>} API response object
   */
  async sendTextMessage(recipientPhone, text) {
    if (!this.token || !this.phoneNumberId || this.token.includes('your_')) {
      throw new Error('WhatsAppClient: WHATSAPP_TOKEN or PHONE_NUMBER_ID is unconfigured.');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: { body: text },
    };

    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`WhatsApp API error sending text message (${response.status}): ${errText}`);
    }

    return await response.json();
  }

  /**
   * Sends an audio message (by Media ID) to recipient phone number.
   * @param {string} recipientPhone 
   * @param {string} mediaId 
   * @returns {Promise<object>} API response object
   */
  async sendAudioMessage(recipientPhone, mediaId) {
    if (!this.token || !this.phoneNumberId || this.token.includes('your_')) {
      throw new Error('WhatsAppClient: WHATSAPP_TOKEN or PHONE_NUMBER_ID is unconfigured.');
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'audio',
      audio: { id: mediaId },
    };

    const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`WhatsApp API error sending audio message (${response.status}): ${errText}`);
    }

    return await response.json();
  }
}

module.exports = WhatsAppClient;
