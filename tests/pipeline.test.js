const path = require('path');
const fs = require('fs');
const MockSpeechProvider = require('../backend/src/services/speech/MockSpeechProvider');
const MockTTSProvider = require('../backend/src/services/tts/MockTTSProvider');
const VerificationStub = require('../backend/src/services/verification/VerificationStub');
const StandalonePipeline = require('../backend/src/services/pipeline/standalonePipeline');
const { cleanupTempFile } = require('../backend/src/utils/audioUtils');

describe('Milestone 1 — Standalone Audio Pipeline Orchestration', () => {
  const fixturesDir = path.join(__dirname, '../test-fixtures/audio');
  const sampleAudio = path.join(fixturesDir, 'sample_claim_ur.ogg');
  const tempOutputAudio = path.join(fixturesDir, 'test_output_generated.mp3');

  beforeAll(() => {
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    if (!fs.existsSync(sampleAudio)) {
      fs.writeFileSync(sampleAudio, Buffer.alloc(2048, 0x55));
    }
  });

  afterEach(() => {
    cleanupTempFile(tempOutputAudio);
  });

  describe('STT Provider Abstraction', () => {
    it('MockSpeechProvider should return structured transcription payload', async () => {
      const provider = new MockSpeechProvider('ٹیسٹ اردو آڈیو');
      const result = await provider.transcribe(sampleAudio, { language: 'ur' });

      expect(result.text).toBe('ٹیسٹ اردو آڈیو');
      expect(result.language).toBe('ur');
      expect(result.provider).toBe('MockSpeechProvider');
      expect(result.durationSeconds).toBeGreaterThan(0);
    });

    it('MockSpeechProvider should throw error on simulated failure', async () => {
      const provider = new MockSpeechProvider('text', { shouldFail: true, failureMessage: 'STT Network Timeout' });
      await expect(provider.transcribe(sampleAudio)).rejects.toThrow('STT Network Timeout');
    });
  });

  describe('TTS Provider Abstraction', () => {
    it('MockTTSProvider should generate audio file and metadata', async () => {
      const provider = new MockTTSProvider();
      const result = await provider.synthesize('اردو جواب', tempOutputAudio);

      expect(fs.existsSync(result.outputPath)).toBe(true);
      expect(result.voice).toBe('ur-PK-UzmaNeural');
      expect(result.provider).toBe('MockTTSProvider');
    });

    it('MockTTSProvider should throw error on empty text', async () => {
      const provider = new MockTTSProvider();
      await expect(provider.synthesize('', tempOutputAudio)).rejects.toThrow(/empty text/i);
    });
  });

  describe('Verification Stub (Milestone 1)', () => {
    it('VerificationStub should generate Urdu test stub response and set isStub flag', async () => {
      const stub = new VerificationStub();
      const result = await stub.process('کیا یہ دعویٰ درست ہے؟');

      expect(result.transcript).toBe('کیا یہ دعویٰ درست ہے؟');
      expect(result.isStub).toBe(true);
      expect(result.responseText).toContain('آزمائشی جواب');
    });
  });

  describe('StandalonePipeline Orchestrator', () => {
    it('should process audio file end-to-end and calculate timing metrics', async () => {
      const pipeline = new StandalonePipeline({
        speechProvider: new MockSpeechProvider('پولیو ڈراپس ٹیسٹ آڈیو'),
        ttsProvider: new MockTTSProvider(),
        verificationStub: new VerificationStub(),
      });

      const result = await pipeline.processAudio(sampleAudio, tempOutputAudio);

      expect(result.success).toBe(true);
      expect(result.transcript).toBe('پولیو ڈراپس ٹیسٹ آڈیو');
      expect(result.responseText).toContain('آزمائشی جواب');
      expect(result.isStub).toBe(true);
      expect(fs.existsSync(result.outputAudio)).toBe(true);

      // Verify timing metrics
      expect(result.timing).toHaveProperty('sttMs');
      expect(result.timing).toHaveProperty('verificationMs');
      expect(result.timing).toHaveProperty('ttsMs');
      expect(result.timing).toHaveProperty('totalMs');
      expect(parseFloat(result.timing.totalSeconds)).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when processing invalid or empty audio file', async () => {
      const pipeline = new StandalonePipeline();
      const emptyAudio = path.join(__dirname, '../test-fixtures/audio/empty_audio.ogg');

      await expect(pipeline.processAudio(emptyAudio)).rejects.toThrow(/Pipeline audio validation failed/i);
    });
  });
});
