const TTSProvider = require('./TTSProvider');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MULTILINGUAL_VOICES = {
  ur: 'ur-PK-UzmaNeural',
  'ur-Roman': 'ur-PK-UzmaNeural',
  en: 'en-US-AvaNeural',
  es: 'es-ES-ElviraNeural',
  id: 'id-ID-GadisNeural',
  ar: 'ar-SA-ZariyahNeural',
  hi: 'hi-IN-SwaraNeural',
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
  pt: 'pt-BR-FranciscaNeural',
  tr: 'tr-TR-EmelNeural',
};

/**
 * EdgeTTS Provider wrapper using Microsoft Edge TTS (free python package `edge-tts`).
 */
class EdgeTTSProvider extends TTSProvider {
  constructor(defaultVoice = process.env.TTS_VOICE_URDU || 'ur-PK-UzmaNeural') {
    super('EdgeTTSProvider');
    this.defaultVoice = defaultVoice;
  }

  /**
   * Checks if edge-tts command line tool is accessible.
   */
  isAvailable() {
    try {
      execSync('edge-tts --help', { stdio: ['pipe', 'pipe', 'ignore'] });
      return true;
    } catch (err) {
      return false;
    }
  }

  async synthesize(text, outputAudioPath, options = {}) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new Error('EdgeTTSProvider: Text to synthesize must be a non-empty string.');
    }

    if (!this.isAvailable()) {
      throw new Error(
        'EdgeTTSProvider: edge-tts CLI tool is not installed or not in system PATH. Install via `pip install edge-tts`.'
      );
    }

    const lang = options.language || 'ur';
    const voice = options.voice || MULTILINGUAL_VOICES[lang] || this.defaultVoice;
    const resolvedPath = path.resolve(outputAudioPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Escape text safely for command execution
    const safeText = text.replace(/"/g, '\\"');
    const command = `edge-tts --voice "${voice}" --text "${safeText}" --write-media "${resolvedPath}"`;

    try {
      execSync(command, { encoding: 'utf-8' });
    } catch (err) {
      throw new Error(`EdgeTTSProvider: Synthesis failed: ${err.message}`);
    }

    if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).size === 0) {
      throw new Error(`EdgeTTSProvider: Output file was not generated at ${resolvedPath}`);
    }

    return {
      outputPath: resolvedPath,
      voice,
      format: path.extname(resolvedPath).replace('.', '') || 'mp3',
      durationSeconds: 3.0,
      provider: this.name,
    };
  }
}

module.exports = EdgeTTSProvider;
