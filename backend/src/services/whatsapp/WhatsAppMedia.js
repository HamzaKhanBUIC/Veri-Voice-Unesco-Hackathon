const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_AUDIO_SIZE_BYTES = 16 * 1024 * 1024; // 16 MB max
const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  'audio/ogg',
  'audio/ogg; codecs=opus',
  'audio/opus',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/amr',
  'audio/aac',
  'audio/m4a',
  'audio/mp4',
]);

/**
 * Media Security & Temporary Storage Utility for WhatsApp Audio.
 */
class WhatsAppMedia {
  /**
   * Validates metadata before downloading audio.
   * @param {object} mediaMeta - Metadata object from WhatsApp API
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateMetadata(mediaMeta) {
    if (!mediaMeta) {
      return { valid: false, error: 'Media metadata is null or undefined.' };
    }

    if (mediaMeta.file_size && mediaMeta.file_size > MAX_AUDIO_SIZE_BYTES) {
      return {
        valid: false,
        error: `Audio file size (${mediaMeta.file_size} bytes) exceeds 16MB safety limit.`,
      };
    }

    const mime = (mediaMeta.mime_type || '').toLowerCase();
    const isSupported = Array.from(SUPPORTED_AUDIO_MIME_TYPES).some((t) => mime.includes(t));

    if (!isSupported) {
      return {
        valid: false,
        error: `Unsupported audio MIME type '${mediaMeta.mime_type}'. Supported: ogg, mp3, wav, amr, m4a.`,
      };
    }

    return { valid: true };
  }

  /**
   * Generates a safe, sanitized temporary file path inside tmp directory.
   * Prevents path traversal attacks.
   * @param {string} [extension='.ogg'] 
   * @returns {string} Absolute safe temp path
   */
  static generateSafeTempPath(extension = '.ogg') {
    const sanitizedExt = extension.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase() || '.ogg';
    const randomName = `wa_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${sanitizedExt}`;

    const tempDir = path.resolve(__dirname, '../../../tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fullPath = path.resolve(tempDir, randomName);

    // Path traversal safety check
    if (!fullPath.startsWith(tempDir)) {
      throw new Error(`Security Violation: Path traversal detected in temp path '${fullPath}'`);
    }

    return fullPath;
  }

  /**
   * Cleans up a temporary file safely.
   * @param {string} filePath 
   */
  static safeCleanup(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`⚠️ WhatsAppMedia: Failed to delete temp file ${filePath}: ${err.message}`);
      }
    }
  }
}

module.exports = WhatsAppMedia;
