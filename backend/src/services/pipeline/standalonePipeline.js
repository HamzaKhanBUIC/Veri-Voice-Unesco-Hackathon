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
   * @param {object} [options] - Options including requestId and captionText
   * @returns {Promise<object>} Pipeline execution result and performance report
   */
  async processAudio(inputAudioPath, outputAudioPath, options = {}) {
    const startTime = Date.now();
    const requestId = options.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

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
    let sttResult = null;

    // Use WhisperProvider as the primary ASR engine when GROQ_API_KEY is available (fastest multi-language ASR)
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey && !apiKey.includes('your_') && apiKey !== 'placeholder') {
      try {
        const WhisperProvider = require('../speech/WhisperProvider');
        const whisper = new WhisperProvider(apiKey);
        sttResult = await whisper.transcribe(validation.details.path, { language: null });
      } catch (err) {
        console.warn(`⚠️ [${requestId}] Groq Whisper ASR failed: ${err.message}. Switching to secondary ASR provider...`);
      }
    }

    // Fallback to configured secondary STT provider (e.g. Speechmatics or MockSpeech)
    if (!sttResult || !sttResult.text || sttResult.text.trim() === '') {
      if (this.speechProvider) {
        try {
          sttResult = await this.speechProvider.transcribe(validation.details.path, { language: 'auto' });
        } catch (err) {
          console.warn(`⚠️ [${requestId}] Secondary STT provider failed: ${err.message}`);
        }
      }
    }

    const sttMs = Date.now() - sttStart;

    if (!sttResult || typeof sttResult.text !== 'string' || sttResult.text.trim() === '') {
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
      let searchStatus = 'SEARCH_SUCCESS';
      if (this.retrievalService) {
        const retResult = await this.retrievalService.search(sttResult.text, options);
        matches = retResult.matches || [];
        searchStatus = retResult.searchStatus || 'SEARCH_SUCCESS';
      }
      const verifPayload = await this.verificationEngine.verifyClaim(sttResult.text, matches, {
        ...options,
        searchStatus,
      });
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
      requestId,
      inputAudio: validation.details.path,
      outputAudio: ttsResult.outputPath,
      audioPath: ttsResult.outputPath,
      transcript: sttResult.text,
      language: detectedLang,
      verdict,
      confidence,
      responseText,
      isStub,
      timing: {
        sttMs,
        verificationMs: verifMs,
        verifMs,
        ttsMs,
        totalMs,
        totalSeconds: parseFloat((totalMs / 1000).toFixed(2)),
      },
    };
  }
}

module.exports = StandalonePipeline;
