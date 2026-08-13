const SpeechProvider = require('./SpeechProvider');

/**
 * Isolated MockSpeechProvider for deterministic automated testing without external APIs.
 */
class MockSpeechProvider extends SpeechProvider {
  constructor(mockText = 'کیا پولیو کے قطرے بچوں کی صحت کے لیے محفوظ ہیں؟', options = {}) {
    super('MockSpeechProvider');
    this.mockText = mockText;
    this.shouldFail = options.shouldFail || false;
    this.failureMessage = options.failureMessage || 'Mock STT processing error';
    this.malformedOutput = options.malformedOutput || false;
  }

  async transcribe(audioPath, options = {}) {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    if (this.malformedOutput) {
      return { invalidField: true };
    }

    return {
      text: this.mockText,
      language: options.language || 'ur',
      durationSeconds: 3.5,
      provider: this.name,
    };
  }
}

module.exports = MockSpeechProvider;
