const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const WhisperProvider = require('../services/speech/WhisperProvider');
const MockSpeechProvider = require('../services/speech/MockSpeechProvider');
const EdgeTTSProvider = require('../services/tts/EdgeTTSProvider');
const MockTTSProvider = require('../services/tts/MockTTSProvider');
const RetrievalService = require('../services/retrieval/retrievalService');
const VerificationEngine = require('../services/verification/verificationEngine');
const GroqVerificationProvider = require('../services/verification/GroqVerificationProvider');
const MockVerificationProvider = require('../services/verification/MockVerificationProvider');

const tmpDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Staging evidence fallback when knowledge/claims.json is empty
const stagingCandidatesPath = path.join(process.cwd(), 'analysis', 'validated-candidate-health-evidence.json');
let stagingEvidence = [];
if (fs.existsSync(stagingCandidatesPath)) {
  try {
    const rawStaging = JSON.parse(fs.readFileSync(stagingCandidatesPath, 'utf8'));
    stagingEvidence = rawStaging
      .filter((c) => c.verificationSuitability === 'SUITABLE')
      .map((c) => ({
        id: c.candidateId,
        language: 'ur',
        claim: c.claimOrFact,
        verdict: c.candidateVerdict,
        explanation: c.explanation,
        keywords: c.keywords || ['ویکسین', 'پولیو', 'ڈینگی', 'صحت'],
        sources: [
          {
            title: c.provenance.documentTitle,
            organization: c.provenance.organization,
            url: c.provenance.sourceUrl || 'https://www.who.int',
          },
        ],
      }));
  } catch (e) {
    // Ignore staging fallback errors
  }
}

/**
 * POST /api/verify
 * Handles live browser voice audio & text claim verification.
 */
router.post('/api/verify', async (req, res) => {
  const startTime = Date.now();
  let inputAudioPath = null;
  let userClaimText = req.body.claimText || null;

  try {
    // 1. Process Input Audio if Base64 provided
    let sttMs = 0;
    let transcriptText = userClaimText;

    if (req.body.audioBase64) {
      const audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      const ext = req.body.fileExt || 'webm';
      inputAudioPath = path.join(tmpDir, `input_${Date.now()}.${ext}`);
      fs.writeFileSync(inputAudioPath, audioBuffer);

      const sttStart = Date.now();
      let speechProvider;

      if (process.env.SPEECH_PROVIDER === 'speechmatics' && process.env.SPEECHMATICS_API_KEY) {
        const SpeechmaticsProvider = require('../services/speech/SpeechmaticsProvider');
        speechProvider = new SpeechmaticsProvider();
      } else if (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY) {
        speechProvider = new WhisperProvider();
      } else {
        speechProvider = new MockSpeechProvider();
      }

      const sttResult = await speechProvider.transcribe(inputAudioPath, { language: 'ur' });
      transcriptText = sttResult.text;
      sttMs = Date.now() - sttStart;
    }

    if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid claim text or audio transcript was provided.',
      });
    }

    // 2. Hybrid Evidence & Live Web Search Retrieval
    const retrievalStart = Date.now();
    const retrievalService = new RetrievalService();

    // Use production claims database + live web search
    let retrievalResult = await retrievalService.search(transcriptText);

    // If production claims database is empty ([]), search staging evidence fixtures for demo
    if ((!retrievalResult.matches || retrievalResult.matches.length === 0) && stagingEvidence.length > 0) {
      const stagingService = new RetrievalService({ customDataset: stagingEvidence, minScoreThreshold: 1, enableLiveSearch: true });
      retrievalResult = await stagingService.search(transcriptText);
    }
    const retrievalMs = Date.now() - retrievalStart;

    // 3. Evidence-Grounded LLM Verification
    const verifStart = Date.now();
    let llmProviderInstance;

    if (process.env.GROQ_API_KEY) {
      llmProviderInstance = new GroqVerificationProvider();
    } else {
      llmProviderInstance = new MockVerificationProvider();
    }

    const engine = new VerificationEngine({ provider: llmProviderInstance });
    const verificationPayload = await engine.verifyClaim(transcriptText, retrievalResult.matches);
    const verifMs = Date.now() - verifStart;

    // 4. Text-To-Speech Synthesis (Urdu Voice Response)
    const ttsStart = Date.now();
    const outputAudioFilename = `output_${Date.now()}.mp3`;
    const outputAudioPath = path.join(tmpDir, outputAudioFilename);

    let ttsProvider;
    if (process.env.TTS_PROVIDER !== 'mock') {
      ttsProvider = new EdgeTTSProvider();
    } else {
      ttsProvider = new MockTTSProvider();
    }

    const ttsResult = await ttsProvider.synthesize(verificationPayload.explanation, outputAudioPath, {
      voice: 'ur-PK-UzmaNeural',
    });
    const ttsMs = Date.now() - ttsStart;

    const totalMs = Date.now() - startTime;

    // Return complete interactive verification response
    return res.json({
      success: true,
      userClaim: transcriptText,
      verdict: verificationPayload.verdict,
      confidence: verificationPayload.confidence,
      explanation: verificationPayload.explanation,
      evidence: verificationPayload.evidence || [],
      retrievalMatchesCount: retrievalResult.matches ? retrievalResult.matches.length : 0,
      audioUrl: `/tmp/${outputAudioFilename}`,
      timing: {
        sttMs,
        retrievalMs,
        verificationMs: verifMs,
        ttsMs,
        totalMs,
        totalSeconds: (totalMs / 1000).toFixed(2),
      },
      providers: {
        stt: process.env.GROQ_API_KEY ? 'Groq Whisper API' : 'Mock STT',
        llm: process.env.GROQ_API_KEY ? 'Groq Llama 3.3 70B' : 'Mock Verification',
        tts: 'Microsoft Edge Neural TTS (ur-PK-UzmaNeural)',
      },
    });
  } catch (err) {
    console.error('API Verification Error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    // Cleanup temporary input file
    if (inputAudioPath && fs.existsSync(inputAudioPath)) {
      try {
        fs.unlinkSync(inputAudioPath);
      } catch (e) {
        // Ignore unlink error
      }
    }
  }
});

module.exports = router;
