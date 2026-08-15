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
const { conversationManager } = require('../services/conversation/ConversationManager');
const { validateConversationContext } = require('../schemas/conversationSchema');

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
 * Handles live browser voice audio, text claims, and multi-turn conversational Talk queries.
 */
router.post('/api/verify', async (req, res) => {
  const startTime = Date.now();
  let inputAudioPath = null;
  let userClaimText = req.body.claimText || null;

  try {
    // 0. Validate Conversation Context if provided
    let clientContext = null;
    if (req.body.context) {
      const validation = validateConversationContext(req.body.context);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: `Invalid conversation context: ${validation.errors.join('; ')}`,
        });
      }
      clientContext = validation.data;
    }

    // 1. Process Input Audio if Base64 provided
    let sttMs = 0;
    let transcriptText = userClaimText;

    if (req.body.audioBase64) {
      const audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      const ext = req.body.fileExt || 'webm';
      inputAudioPath = path.join(tmpDir, `input_${Date.now()}.${ext}`);
      fs.writeFileSync(inputAudioPath, audioBuffer);

      const sttStart = Date.now();
      let sttResult = null;

      // 1. Primary STT: Groq Whisper (Ultra-fast, natively supports browser webm, auto language detection)
      const hasGroqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      if (hasGroqKey && !hasGroqKey.includes('your_') && hasGroqKey !== 'placeholder') {
        try {
          const whisper = new WhisperProvider();
          sttResult = await whisper.transcribe(inputAudioPath, { language: null });
        } catch (whisperErr) {
          console.warn(`⚠️ [API] Groq Whisper STT failed (${whisperErr.message}). Attempting Speechmatics fallback...`);
        }
      }

      // 2. Secondary STT: Speechmatics fallback
      if (!sttResult && process.env.SPEECHMATICS_API_KEY && !process.env.SPEECHMATICS_API_KEY.includes('your_')) {
        try {
          const SpeechmaticsProvider = require('../services/speech/SpeechmaticsProvider');
          const speechmatics = new SpeechmaticsProvider();
          sttResult = await speechmatics.transcribe(inputAudioPath, { language: 'en' });
        } catch (smErr) {
          console.warn(`⚠️ [API] Speechmatics STT fallback failed: ${smErr.message}`);
        }
      }

      // 3. Fallback to Mock if in test or offline
      if (!sttResult) {
        const mock = new MockSpeechProvider();
        sttResult = await mock.transcribe(inputAudioPath, { language: 'ur' });
      }

      transcriptText = sttResult?.text;
      sttMs = Date.now() - sttStart;
    }

    if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid claim text or audio transcript was provided.',
      });
    }

    // 2. Multi-Turn Conversation Routing & Context Resolution
    const session = conversationManager.getOrCreateSession(clientContext?.sessionId, clientContext);
    const plan = conversationManager.routeTurn(transcriptText, session, {
      requestedMode: req.body.mode,
    });

    let retrievalMs = 0;
    let retrievalMatches = [];
    let verificationPayload = null;
    let verifMs = 0;

    // Fast-path for direct conversational responses (Session limit, Stop, Guidance)
    if (plan.action === 'SESSION_LIMIT_REACHED' || plan.action === 'HANDLE_STOP' || plan.action === 'HANDLE_GUIDANCE') {
      verificationPayload = {
        verdict: plan.action === 'SESSION_LIMIT_REACHED' ? 'UNCERTAIN' : 'RESEARCH_RESPONSE',
        confidence: 'HIGH',
        explanation: plan.responseText,
        evidence: [],
      };
    } else if (plan.reuseEvidence && plan.activeEvidence && plan.activeEvidence.length > 0) {
      // Evidence Reuse Path: 0 new retrieval calls!
      retrievalMatches = plan.activeEvidence.map((e) => ({
        id: e.claimId,
        claim: e.statement || e.sourceTitle,
        verdict: 'TRUE',
        explanation: e.excerpt || e.statement || e.sourceTitle,
        sources: [{ title: e.sourceTitle, organization: e.organization, url: e.url }],
        authorityLevel: e.authorityLevel || 'PRIMARY_AUTHORITY',
      }));

      const verifStart = Date.now();
      const llmProviderInstance = process.env.GROQ_API_KEY
        ? new GroqVerificationProvider()
        : new MockVerificationProvider();
      const engine = new VerificationEngine({ provider: llmProviderInstance });

      verificationPayload = await engine.verifyClaim(transcriptText, retrievalMatches, {
        targetLanguage: plan.responseLanguage,
        voiceMode: clientContext?.voiceMode || false,
      });
      verifMs = Date.now() - verifStart;
    } else if (plan.shouldRetrieve) {
      // Fresh Verification / Retrieval Path
      const retrievalStart = Date.now();
      const retrievalService = new RetrievalService();
      let retrievalResult = await retrievalService.search(transcriptText);

      if ((!retrievalResult.matches || retrievalResult.matches.length === 0) && stagingEvidence.length > 0) {
        const stagingService = new RetrievalService({ customDataset: stagingEvidence, minScoreThreshold: 1, enableLiveSearch: true });
        retrievalResult = await stagingService.search(transcriptText);
      }
      retrievalMatches = retrievalResult.matches || [];
      retrievalMs = Date.now() - retrievalStart;

      const verifStart = Date.now();
      const llmProviderInstance = process.env.GROQ_API_KEY
        ? new GroqVerificationProvider()
        : new MockVerificationProvider();
      const engine = new VerificationEngine({ provider: llmProviderInstance });

      verificationPayload = await engine.verifyClaim(transcriptText, retrievalMatches, {
        targetLanguage: plan.responseLanguage,
        voiceMode: clientContext?.voiceMode || false,
      });
      verifMs = Date.now() - verifStart;
    } else {
      // Casual Conversational Response (0 retrieval calls)
      const verifStart = Date.now();
      verificationPayload = {
        verdict: 'RESEARCH_RESPONSE',
        confidence: 'HIGH',
        explanation: 'Hello! I am VeriVoice. How can I help you check evidence or explore facts today?',
        evidence: [],
      };
      verifMs = Date.now() - verifStart;
    }

    // 3. Record turn in session context
    conversationManager.recordTurn(session, transcriptText, verificationPayload);

    // 4. Text-To-Speech Synthesis (Gracefully handled)
    const ttsStart = Date.now();
    const outputAudioFilename = `output_${Date.now()}.mp3`;
    const outputAudioPath = path.join(tmpDir, outputAudioFilename);
    let audioUrl = null;

    let ttsProvider;
    if (process.env.TTS_PROVIDER !== 'mock') {
      ttsProvider = new EdgeTTSProvider();
    } else {
      ttsProvider = new MockTTSProvider();
    }

    try {
      const ttsResult = await ttsProvider.synthesize(verificationPayload.explanation, outputAudioPath, {
        language: plan.responseLanguage || 'ur',
      });
      if (ttsResult && ttsResult.outputPath) {
        audioUrl = `/tmp/${outputAudioFilename}`;
      }
    } catch (ttsErr) {
      console.warn(`⚠️ [API] Edge TTS synthesis fallback: ${ttsErr.message}`);
      audioUrl = null;
    }
    const ttsMs = Date.now() - ttsStart;

    const totalMs = Date.now() - startTime;

    // Return complete interactive verification response with conversation metadata
    return res.json({
      success: true,
      userClaim: transcriptText,
      verdict: verificationPayload.verdict,
      confidence: verificationPayload.confidence,
      explanation: verificationPayload.explanation,
      evidence: verificationPayload.evidence || [],
      retrievalMatchesCount: retrievalMatches.length,
      audioUrl,
      conversation: {
        sessionId: session.sessionId,
        turnCount: session.turnCount,
        intent: plan.intent,
        evidenceReused: plan.reuseEvidence || false,
        responseLanguage: plan.responseLanguage,
      },
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
        tts: `Microsoft Edge Neural TTS (${plan.responseLanguage || 'ur'})`,
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
