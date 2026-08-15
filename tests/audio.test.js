const path = require('path');
const fs = require('fs');
const { validateAudioFile, checkFFmpegAvailability, cleanupTempFile } = require('../backend/src/utils/audioUtils');
const EdgeTTSProvider = require('../backend/src/services/tts/EdgeTTSProvider');

describe('Milestone 1 — Audio Handling & Validation Utility', () => {
  const fixturesDir = path.join(__dirname, '../test-fixtures/audio');
  const sampleAudio = path.join(fixturesDir, 'sample_claim_ur.ogg');
  const emptyAudio = path.join(fixturesDir, 'empty_audio.ogg');
  const txtFile = path.join(fixturesDir, 'unsupported_format.txt');
  const nonExistentFile = path.join(fixturesDir, 'does_not_exist.ogg');

  beforeAll(() => {
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    if (!fs.existsSync(sampleAudio)) {
      // Create a valid dummy audio file (> 1000 bytes with non-mock header)
      const buf = Buffer.alloc(2048, 0x55);
      fs.writeFileSync(sampleAudio, buf);
    }
    if (!fs.existsSync(emptyAudio)) {
      fs.writeFileSync(emptyAudio, Buffer.alloc(0));
    }
    if (!fs.existsSync(txtFile)) {
      fs.writeFileSync(txtFile, 'plain text content');
    }
  });

  it('should validate a valid audio file (.ogg)', () => {
    const result = validateAudioFile(sampleAudio);
    expect(result.valid).toBe(true);
    expect(result.details.extension).toBe('.ogg');
    expect(result.details.sizeBytes).toBeGreaterThan(0);
  });

  it('should reject a non-existent file', () => {
    const result = validateAudioFile(nonExistentFile);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/does not exist/i);
  });

  it('should reject an empty 0-byte audio file', () => {
    const result = validateAudioFile(emptyAudio);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty \(0 bytes\)/i);
  });

  it('should reject unsupported file extension (.txt)', () => {
    const result = validateAudioFile(txtFile);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported audio extension/i);
  });

  it('should reject null/undefined path', () => {
    const result = validateAudioFile(null);
    expect(result.valid).toBe(false);
  });

  it('should check ffmpeg availability without crashing', () => {
    const ffmpegCheck = checkFFmpegAvailability();
    expect(ffmpegCheck).toHaveProperty('available');
    expect(typeof ffmpegCheck.available).toBe('boolean');
  });

  it('should safely clean up temp files', () => {
    const tempFile = path.join(__dirname, '../test-fixtures/audio/temp_to_delete.tmp');
    fs.writeFileSync(tempFile, 'TEMP_CONTENT');
    expect(fs.existsSync(tempFile)).toBe(true);

    cleanupTempFile(tempFile);
    expect(fs.existsSync(tempFile)).toBe(false);
  });

  describe('EdgeTTSProvider.validateAudio (Cloud Reliability Guardrail)', () => {
    it('should validate a valid audio file path', () => {
      expect(EdgeTTSProvider.validateAudio(sampleAudio)).toBe(true);
    });

    it('should reject 0-byte audio file', () => {
      expect(EdgeTTSProvider.validateAudio(emptyAudio)).toBe(false);
    });

    it('should reject undersized audio buffer (<500 bytes)', () => {
      const tinyBuffer = Buffer.from('SHORT_AUDIO_CLIP');
      expect(EdgeTTSProvider.validateAudio(tinyBuffer)).toBe(false);
    });

    it('should reject dummy MOCK_AUDIO_DATA fallback header buffer', () => {
      const mockBuffer = Buffer.alloc(1000);
      mockBuffer.write('MOCK_AUDIO_DATA_MP3_HEADER_PLAYABLE_AUDIO_STREAM_FALLBACK');
      expect(EdgeTTSProvider.validateAudio(mockBuffer)).toBe(false);
    });
  });
});
