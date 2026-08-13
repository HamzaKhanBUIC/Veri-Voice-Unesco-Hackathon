const path = require('path');
const fs = require('fs');
const { validateAudioFile, checkFFmpegAvailability, cleanupTempFile } = require('../backend/src/utils/audioUtils');

describe('Milestone 1 — Audio Handling & Validation Utility', () => {
  const sampleAudio = path.join(__dirname, '../test-fixtures/audio/sample_claim_ur.ogg');
  const emptyAudio = path.join(__dirname, '../test-fixtures/audio/empty_audio.ogg');
  const txtFile = path.join(__dirname, '../test-fixtures/audio/unsupported_format.txt');
  const nonExistentFile = path.join(__dirname, '../test-fixtures/audio/does_not_exist.ogg');

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
});
