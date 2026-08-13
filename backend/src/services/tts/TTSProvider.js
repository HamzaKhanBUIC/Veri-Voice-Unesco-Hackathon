/**
 * Abstract TTSProvider interface.
 * All concrete TTS providers (EdgeTTS, Mock) must extend this class.
 */
class TTSProvider {
  constructor(name = 'BaseTTSProvider') {
    this.name = name;
  }

  /**
   * Synthesizes Urdu text into spoken audio.
   * @param {string} text - Urdu text to synthesize
   * @param {string} outputAudioPath - Target path to save output audio file
   * @param {object} [options] - Options (e.g. voice: 'ur-PK-UzmaNeural')
   * @returns {Promise<{ outputPath: string, voice: string, format: string, durationSeconds: number, provider: string }>}
   */
  async synthesize(text, outputAudioPath, options = {}) {
    throw new Error(`TTSProvider.synthesize() is not implemented in ${this.name}`);
  }
}

module.exports = TTSProvider;
