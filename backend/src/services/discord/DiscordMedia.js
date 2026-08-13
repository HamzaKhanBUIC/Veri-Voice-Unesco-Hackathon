const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const SUPPORTED_AUDIO_MIMES = new Set([
  'audio/ogg',
  'audio/opus',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/amr',
  'audio/webm',
  'application/ogg',
]);

const MAX_FILE_SIZE_BYTES = (parseInt(process.env.DISCORD_MAX_FILE_SIZE_MB, 10) || 15) * 1024 * 1024;
const SAFE_TMP_DIR = path.resolve(__dirname, '../../../tmp');

/**
 * Discord Media Security & File Downloader Utility.
 */
class DiscordMedia {
  /**
   * Validates Discord attachment metadata against safety rules.
   * @param {object} attachment - Discord attachment object
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateAttachment(attachment) {
    if (!attachment || typeof attachment !== 'object') {
      return { valid: false, error: 'Invalid attachment object' };
    }

    const size = attachment.size || 0;
    if (size <= 0) {
      return { valid: false, error: 'Attachment file is empty (0 bytes)' };
    }

    if (size > MAX_FILE_SIZE_BYTES) {
      const maxMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `Attachment exceeds safe file size limit of ${maxMb}MB` };
    }

    const mimeType = (attachment.contentType || attachment.mimeType || '').toLowerCase().split(';')[0].trim();
    const fileName = (attachment.name || attachment.filename || '').toLowerCase();

    const isSupportedMime = SUPPORTED_AUDIO_MIMES.has(mimeType);
    const hasAudioExtension = /\.(ogg|opus|mp3|wav|m4a|amr|webm)$/i.test(fileName);

    if (!isSupportedMime && !hasAudioExtension) {
      return { valid: false, error: `Unsupported audio MIME type '${mimeType || fileName}'. Supported: .ogg, .mp3, .wav, .m4a, .webm` };
    }

    return { valid: true };
  }

  /**
   * Generates a safe, unguessable temporary file path inside backend/tmp/.
   * Prevents path traversal vulnerabilities.
   * @param {string} [extension='.ogg']
   * @returns {string} Safe absolute file path
   */
  static generateSafeTempPath(extension = '.ogg') {
    if (!fs.existsSync(SAFE_TMP_DIR)) {
      fs.mkdirSync(SAFE_TMP_DIR, { recursive: true });
    }

    const ext = extension.startsWith('.') ? extension : `.${extension}`;
    const safeFilename = `discord_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
    const fullPath = path.join(SAFE_TMP_DIR, safeFilename);

    // Path traversal check
    if (!fullPath.startsWith(SAFE_TMP_DIR)) {
      throw new Error('DiscordMedia: Path traversal attempt detected');
    }

    return fullPath;
  }

  /**
   * Downloads media file securely from Discord CDN URL or file URI to local temp path.
   * @param {string} mediaUrl 
   * @param {string} targetPath 
   * @returns {Promise<string>} Downloaded target path
   */
  static downloadAttachment(mediaUrl, targetPath) {
    return new Promise((resolve, reject) => {
      if (!mediaUrl || typeof mediaUrl !== 'string') {
        return reject(new Error('DiscordMedia: Media URL is required'));
      }

      if (mediaUrl.startsWith('file://')) {
        const localPath = mediaUrl.replace('file://', '');
        try {
          fs.copyFileSync(localPath, targetPath);
          return resolve(targetPath);
        } catch (e) {
          return reject(new Error(`DiscordMedia: Failed to copy local test file: ${e.message}`));
        }
      }

      if (!mediaUrl.startsWith('https://')) {
        return reject(new Error('DiscordMedia: Only HTTPS URLs are allowed for downloading attachments'));
      }

      const fileStream = fs.createWriteStream(targetPath);

      const request = https.get(mediaUrl, { timeout: 15000 }, (response) => {
        if (response.statusCode !== 200) {
          fileStream.close();
          fs.unlinkSync(targetPath);
          return reject(new Error(`DiscordMedia download failed with HTTP ${response.statusCode}`));
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(targetPath);
        });
      });

      request.on('error', (err) => {
        fileStream.close();
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
        reject(err);
      });

      request.on('timeout', () => {
        request.destroy();
        fileStream.close();
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
        reject(new Error('DiscordMedia: Download connection timed out (15s)'));
      });
    });
  }

  /**
   * Safely deletes temporary media file if it exists.
   * @param {string} filePath 
   */
  static safeCleanup(filePath) {
    if (filePath && typeof filePath === 'string' && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        // Ignore deletion errors
      }
    }
  }
}

module.exports = DiscordMedia;
