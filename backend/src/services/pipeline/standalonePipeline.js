const { validateAudioFile } = require('../../utils/audioUtils');
const path = require('path');
const fs = require('fs');
const WhisperProvider = require('../speech/WhisperProvider');
const SpeechmaticsProvider = require('../speech/SpeechmaticsProvider');
const MockSpeechProvider = require('../speech/MockSpeechProvider');
const VerificationEngine = require('../verification/verificationEngine');
const RetrievalService = require('../retrieval/retrievalService');
const EdgeTTSProvider = require('../tts/EdgeTTSProvider');

/**
 * Standalone Audio Processing Pipeline.
 * Orchestrates full lifecycle: STT -> Language Detection -> Retrieval -> Verification -> TTS.
 * Can run independently in CLI, Tests, WhatsApp, Discord, or Web without external framework lock-in.
 */
class StandalonePipeline {
  constructor(options = {}) {
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

    // Prioritize Groq Whisper for fast multi-language ASR (Urdu, Spanish, Indonesian, English, etc.)
    const defaultSpeech = (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY) && !isTestEnv
      ? new WhisperProvider()
      : (process.env.SPEECHMATICS_API_KEY && !isTestEnv ? new SpeechmaticsProvider() : new MockSpeechProvider());

    this.speechProvider = options.speechProvider || defaultSpeech;
    this.verificationEngine = options.verificationEngine || new VerificationEngine();
    this.retrievalService = options.retrievalService || new RetrievalService();
    this.ttsProvider = options.ttsProvider || new EdgeTTSProvider();
    this.verificationStub = options.verificationStub || null;
  }

  /**
   * Processes an incoming audio file through the complete pipeline.
   * @param {string} inputAudioPath - Path to input voice file (.ogg, .wav, .mp3, etc.)
   * @param {string} [outputAudioPath] - Optional custom path for synthesized response audio
   * @param {object} [options] - Options passed to verification / STT
   * @returns {Promise<object>} Complete verification result with timing metrics
   */
  async processAudio(inputAudioPath, outputAudioPath = null, options = {}) {
    const startTime = Date.now();
    const requestId = options.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate safe default output path if not provided
    const tmpDir = path.resolve(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const defaultOutputPath = outputAudioPath || path.join(tmpDir, `pipeline_res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.mp3`);

    // Step 0: Input Audio Validation
    const validation = validateAudioFile(inputAudioPath);
    if (!validation.valid) {
      throw new Error(`StandalonePipeline: Pipeline audio validation failed: ${validation.error}`);
    }

    // Step 1: Speech-To-Text Transcription
    // Use WhisperProvider when available for reliable multilingual ASR
    const sttEngine = (this.speechProvider.name === 'WhisperProvider' || process.env.GROQ_API_KEY)
      ? (this.speechProvider.name === 'WhisperProvider' ? this.speechProvider : new WhisperProvider())
      : this.speechProvider;

    const sttStart = Date.now();
    let sttResult;
    try {
      sttResult = await sttEngine.transcribe(inputAudioPath, options);
    } catch (sttErr) {
      console.warn(`⚠️ [${requestId}] StandalonePipeline: Primary STT failed (${sttErr.message}). Attempting fallback STT...`);
      sttResult = await this.speechProvider.transcribe(inputAudioPath, options);
    }
    const sttMs = Date.now() - sttStart;

    if (!sttResult || !sttResult.text || sttResult.text.trim() === '') {
      throw new Error('StandalonePipeline: Transcription resulted in empty text.');
    }

    // Step 2: Verification Engine & Knowledge Retrieval
    const verifStart = Date.now();
    let responseText = '';
    let verdict = 'UNCERTAIN';
    let confidence = 'LOW';
    let detectedLang = 'ur';
    let domain = 'GENERAL';
    let sources = [];
    let evidence = [];
    let isStub = false;

    if (this.verificationStub) {
      const verifResult = await this.verificationStub.process(sttResult.text || sttResult);
      responseText = verifResult.responseText;
      isStub = verifResult.isStub || false;
      verdict = verifResult.verdict || 'UNCERTAIN';
      confidence = verifResult.confidence || 'LOW';
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
      domain = verifPayload.domain || 'GENERAL';
      sources = verifPayload.sources || [];
      evidence = verifPayload.evidence || [];
      detectedLang = verifPayload.languageMetadata?.detectedLanguage || 'ur';
    }
    const verifMs = Date.now() - verifStart;

    // Step 3: Text-To-Speech Synthesis (Uses detected language neural voice)
    const ttsStart = Date.now();
    let ttsResult = null;
    let audioAvailable = false;
    let outputAudio = null;

    try {
      ttsResult = await this.ttsProvider.synthesize(responseText, defaultOutputPath, {
        language: detectedLang,
      });
      outputAudio = ttsResult?.outputPath || null;
      audioAvailable = Boolean(outputAudio);
    } catch (ttsErr) {
      console.warn(`⚠️ [${requestId}] StandalonePipeline: TTS synthesis unavailable: ${ttsErr.message}`);
      audioAvailable = false;
      outputAudio = null;
    }
    const ttsMs = Date.now() - ttsStart;

    const totalMs = Date.now() - startTime;

    return {
      success: true,
      requestId,
      inputAudio: validation.details.path,
      outputAudio,
      audioPath: outputAudio,
      audioAvailable,
      transcript: sttResult.text,
      language: detectedLang,
      verdict,
      confidence,
      domain,
      sources,
      evidence,
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
