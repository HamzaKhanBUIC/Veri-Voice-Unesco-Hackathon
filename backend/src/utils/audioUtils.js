const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPPORTED_EXTENSIONS = ['.ogg', '.mp3', '.wav', '.m4a', '.aac', '.flac'];

/**
 * Validates audio file existence, extension, size, and security boundaries.
 * @param {string} filePath - Path to audio file
 * @returns {{ valid: boolean, error?: string, details?: object }}
 */
function validateAudioFile(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return { valid: false, error: 'Audio file path must be a non-empty string.' };
  }

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    return { valid: false, error: `File does not exist (Audio file not found): ${filePath}` };
  }

  let stats;
  try {
    stats = fs.statSync(resolvedPath);
  } catch (err) {
    return { valid: false, error: `Unable to read file status: ${err.message}` };
  }

  if (!stats.isFile()) {
    return { valid: false, error: `Target path is not a file: ${filePath}` };
  }

  if (stats.size === 0) {
    return { valid: false, error: `Empty audio file — Audio file is empty (0 bytes): ${filePath}` };
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported audio extension '${ext}'. Supported extensions: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    };
  }

  return {
    valid: true,
    details: {
      path: resolvedPath,
      extension: ext,
      sizeBytes: stats.size,
    },
  };
}

/**
 * Checks if ffmpeg binary is installed and accessible on system PATH.
 * @returns {{ available: boolean, version?: string, note?: string }}
 */
function checkFFmpegAvailability() {
  try {
    const output = execSync('ffmpeg -version', { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' });
    const match = output.match(/ffmpeg version ([^\s]+)/i);
    return {
      available: true,
      version: match ? match[1] : 'detected',
    };
  } catch (err) {
    return {
      available: false,
      note: 'ffmpeg binary is not available in system PATH. Audio conversion will rely on native format support or external provider capabilities.',
    };
  }
}

/**
 * Safely removes a file if it exists.
 * @param {string} filePath 
 */
function cleanupTempFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`⚠️ Warning: Failed to clean up temp file ${filePath}: ${err.message}`);
    }
  }
}

module.exports = {
  SUPPORTED_EXTENSIONS,
  validateAudioFile,
  checkFFmpegAvailability,
  cleanupTempFile,
};
