/**
 * Abstract SpeechProvider interface.
 * All concrete STT providers (Whisper, Speechmatics, Mock) must extend this class.
 */
class SpeechProvider {
  constructor(name = 'BaseSpeechProvider') {
    this.name = name;
  }

  /**
   * Transcribes an audio file into text.
   * @param {string} audioPath - Path to input audio file
   * @param {object} [options] - Options (e.g. language: 'ur')
   * @returns {Promise<{ text: string, language: string, durationSeconds: number, provider: string }>}
   */
  async transcribe(audioPath, options = {}) {
    throw new Error(`SpeechProvider.transcribe() is not implemented in ${this.name}`);
  }
}

module.exports = SpeechProvider;
