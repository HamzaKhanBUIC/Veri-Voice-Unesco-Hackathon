const TTSProvider = require('./TTSProvider');
const fs = require('fs');
const path = require('path');

/**
 * Isolated MockTTSProvider for deterministic automated testing without external dependencies.
 */
class MockTTSProvider extends TTSProvider {
  constructor(options = {}) {
    super('MockTTSProvider');
    this.shouldFail = options.shouldFail || false;
    this.failureMessage = options.failureMessage || 'Mock TTS generation error';
  }

  async synthesize(text, outputAudioPath, options = {}) {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new Error('TTSProvider: Cannot synthesize empty text.');
    }

    const resolvedPath = path.resolve(outputAudioPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write dummy audio header content for mock file verification
    const mockAudioBuffer = Buffer.from('MOCK_URDU_AUDIO_DATA_MP3_HEADER');
    fs.writeFileSync(resolvedPath, mockAudioBuffer);

    return {
      outputPath: resolvedPath,
      voice: options.voice || 'ur-PK-UzmaNeural',
      format: path.extname(resolvedPath).replace('.', '') || 'mp3',
      durationSeconds: 2.0,
      provider: this.name,
    };
  }
}

module.exports = MockTTSProvider;
