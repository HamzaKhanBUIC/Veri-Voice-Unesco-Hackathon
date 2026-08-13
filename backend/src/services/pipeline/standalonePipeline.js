const { validateAudioFile } = require('../../utils/audioUtils');
const MockSpeechProvider = require('../speech/MockSpeechProvider');
const MockTTSProvider = require('../tts/MockTTSProvider');
const VerificationStub = require('../verification/VerificationStub');
const RetrievalService = require('../retrieval/retrievalService');
const VerificationEngine = require('../verification/verificationEngine');
const path = require('path');

/**
 * Standalone Audio Processing Pipeline Orchestrator.
 * Encapsulates AUDIO -> STT -> TRANSCRIPT -> RETRIEVAL -> VERIFICATION -> RESPONSE TEXT -> TTS -> OUTPUT AUDIO.
 */
class StandalonePipeline {
  constructor(options = {}) {
    this.speechProvider = options.speechProvider || new MockSpeechProvider();
    this.ttsProvider = options.ttsProvider || new MockTTSProvider();
    this.verificationStub = options.verificationStub || null;
    this.verificationEngine = options.verificationEngine || (options.verificationStub ? null : new VerificationEngine());
    this.retrievalService = options.retrievalService || new RetrievalService();
    this.process = this.processAudio.bind(this);
  }

  /**
   * Runs end-to-end audio processing pipeline.
   * @param {string} inputAudioPath - Path to input voice file (.ogg, .mp3, .wav)
   * @param {string} [outputAudioPath] - Optional custom path for output audio file
   * @returns {Promise<object>} Pipeline execution result and performance report
   */
  async processAudio(inputAudioPath, outputAudioPath) {
    const startTime = Date.now();

    // Step 0: Validate input audio file
    const validation = validateAudioFile(inputAudioPath);
    if (!validation.valid) {
      throw new Error(`Pipeline audio validation failed: ${validation.error}`);
    }

    const defaultOutputPath =
      outputAudioPath ||
      path.join(path.dirname(validation.details.path), `output_${Date.now()}.mp3`);

    // Step 1: Speech-To-Text Transcription
    const sttStart = Date.now();
    const sttResult = await this.speechProvider.transcribe(validation.details.path, { language: 'auto' });
    const sttMs = Date.now() - sttStart;

    if (!sttResult || typeof sttResult.text !== 'string') {
      throw new Error('Pipeline error: STT provider returned invalid result structure.');
    }

    let responseText = '';
    let verdict = 'UNCERTAIN';
    let confidence = 0;
    let isStub = false;
    let detectedLang = 'ur';
    const verifStart = Date.now();

    // Step 2: Verification (Engine or Stub)
    if (this.verificationStub) {
      const verifResult = await this.verificationStub.process(sttResult);
      responseText = verifResult.responseText;
      isStub = verifResult.isStub || false;
    } else {
      let matches = [];
      if (this.retrievalService) {
        const retResult = await this.retrievalService.search(sttResult.text);
        matches = retResult.matches || [];
      }
      const verifPayload = await this.verificationEngine.verifyClaim(sttResult.text, matches);
      responseText = verifPayload.explanation;
      verdict = verifPayload.verdict;
      confidence = verifPayload.confidence;
      detectedLang = verifPayload.languageMetadata?.detectedLanguage || 'ur';
    }
    const verifMs = Date.now() - verifStart;

    // Step 3: Text-To-Speech Synthesis (Uses detected language neural voice)
    const ttsStart = Date.now();
    const ttsResult = await this.ttsProvider.synthesize(responseText, defaultOutputPath, {
      language: detectedLang,
    });
    const ttsMs = Date.now() - ttsStart;

    const totalMs = Date.now() - startTime;

    return {
      success: true,
      inputAudio: validation.details.path,
      outputAudio: ttsResult.outputPath,
      audioPath: ttsResult.outputPath,
      transcript: sttResult.text,
      language: detectedLang,
      responseText,
      verdict,
      confidence,
      isStub,
      timing: {
        sttMs,
        verificationMs: verifMs,
        ttsMs,
        totalMs,
        totalSeconds: (totalMs / 1000).toFixed(2),
      },
      providers: {
        speech: this.speechProvider.name,
        tts: this.ttsProvider.name,
      },
    };
  }
}

module.exports = StandalonePipeline;
