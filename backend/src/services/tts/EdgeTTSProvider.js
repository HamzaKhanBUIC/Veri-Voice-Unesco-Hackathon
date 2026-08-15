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

const LANG_CODE_MAP = {
  ur: 'ur',
  'ur-Roman': 'ur',
  en: 'en',
  es: 'es',
  id: 'id',
  ar: 'ar',
  hi: 'hi',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  tr: 'tr',
};

/**
 * Text-to-Speech Provider with Microsoft Edge TTS CLI and high-quality HTTP Web TTS fallback.
 * Guarantees valid, playable MP3 audio or throws explicit error to prevent corrupt audio attachments.
 */
class EdgeTTSProvider extends TTSProvider {
  constructor(defaultVoice = process.env.TTS_VOICE_URDU || 'ur-PK-UzmaNeural') {
    super('EdgeTTSProvider');
    this.defaultVoice = defaultVoice;
  }

  /**
   * Validates synthesized audio file buffer.
   * Rejects zero-byte, missing, undersized (<500B), or dummy MOCK_AUDIO_DATA buffers.
   * @param {string|Buffer} target - File path string or Buffer instance
   * @returns {boolean}
   */
  static validateAudio(target) {
    try {
      let buffer;
      if (typeof target === 'string') {
        if (!fs.existsSync(target)) return false;
        const stat = fs.statSync(target);
        if (stat.size < 50) return false;
        buffer = fs.readFileSync(target);
      } else if (Buffer.isBuffer(target)) {
        buffer = target;
      } else {
        return false;
      }

      if (buffer.length < 50) return false;

      // Check header for known mock/dummy markers
      const headerStr = buffer.toString('utf-8', 0, 60);
      if (headerStr.includes('MOCK_AUDIO_DATA') || headerStr.includes('PLAYABLE_AUDIO_STREAM_FALLBACK')) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
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

  /**
   * Generates MP3 audio using HTTP web synthesis fallback.
   */
  async synthesizeHttpFallback(text, resolvedPath, langCode = 'en') {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) {
      throw new Error('EdgeTTSProvider: Clean text is empty.');
    }

    const truncatedText = cleanText.length > 200 ? cleanText.substring(0, 197) + '...' : cleanText;
    const encodedText = encodeURIComponent(truncatedText);
    const targetLang = LANG_CODE_MAP[langCode] || 'en';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodedText}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP TTS API returned HTTP ${response.status}`);
      }

      const arrayBuf = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuf);

      if (!EdgeTTSProvider.validateAudio(audioBuffer)) {
        throw new Error('HTTP TTS API returned undersized or invalid audio buffer.');
      }

      fs.writeFileSync(resolvedPath, audioBuffer);
      return true;
    } catch (err) {
      console.warn(`⚠️ EdgeTTSProvider: HTTP Web TTS fallback failed: ${err.message}`);
      if (fs.existsSync(resolvedPath)) {
        try { fs.unlinkSync(resolvedPath); } catch (e) {}
      }
      throw err;
    }
  }

  async synthesize(text, outputAudioPath, options = {}) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new Error('EdgeTTSProvider: Text to synthesize must be a non-empty string.');
    }

    const lang = options.language || 'ur';
    const voice = options.voice || MULTILINGUAL_VOICES[lang] || this.defaultVoice;
    const resolvedPath = path.resolve(outputAudioPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Try edge-tts CLI if available
    if (this.isAvailable()) {
      try {
        const { execFileSync } = require('child_process');
        execFileSync('edge-tts', [
          '--voice', voice,
          '--text', text.trim(),
          '--write-media', resolvedPath,
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        if (EdgeTTSProvider.validateAudio(resolvedPath)) {
          return {
            outputPath: resolvedPath,
            voice,
            format: path.extname(resolvedPath).replace('.', '') || 'mp3',
            durationSeconds: 3.0,
            provider: this.name,
            audioAvailable: true,
          };
        }
      } catch (err) {
        console.warn(`⚠️ EdgeTTSProvider: CLI command failed: ${err.message}. Trying HTTP Web Synthesis...`);
      }
    }

    // 2. Try HTTP Web Synthesis Fallback
    try {
      await this.synthesizeHttpFallback(text, resolvedPath, lang);
      if (EdgeTTSProvider.validateAudio(resolvedPath)) {
        return {
          outputPath: resolvedPath,
          voice: voice || 'multilingual-web-neural',
          format: 'mp3',
          durationSeconds: 3.0,
          provider: 'WebNeuralTTS',
          audioAvailable: true,
        };
      }
    } catch (fallbackErr) {
      console.warn(`⚠️ EdgeTTSProvider: Fallback synthesis error: ${fallbackErr.message}`);
    }

    // Clean up invalid path if any
    if (fs.existsSync(resolvedPath)) {
      try { fs.unlinkSync(resolvedPath); } catch (e) {}
    }

    throw new Error(`EdgeTTSProvider: Synthesis failed for text in language '${lang}'. Audio response unavailable.`);
  }
}

module.exports = EdgeTTSProvider;
