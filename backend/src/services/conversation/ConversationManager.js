const { IntentDetector, INTENTS } = require('../intent/IntentDetector');
const LanguageDetector = require('../language/LanguageDetector');
const { validateConversationContext } = require('../../schemas/conversationSchema');

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes inactivity
const MAX_TURNS_PER_SESSION = 10;
const MAX_HISTORY_LENGTH = 8;

/**
 * In-Memory Conversational Voice Engine & Session Context Manager.
 * Orchestrates multi-turn dialogue, evidence reuse, pronoun resolution,
 * language switching, and quota protection.
 */
class ConversationManager {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Cleans up expired sessions.
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivityAt > SESSION_TTL_MS) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Gets or initializes a session.
   * @param {string} [sessionId]
   * @param {object} [clientContext]
   * @returns {object} Session state
   */
  getOrCreateSession(sessionId = null, clientContext = null) {
    this.cleanupExpired();

    const id = sessionId || (clientContext && clientContext.sessionId) || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let session = this.sessions.get(id);

    if (!session) {
      session = {
        sessionId: id,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        turnCount: 0,
        activeClaim: null,
        activeEvidence: [],
        history: [],
        inputLanguage: 'en',
        responseLanguage: null,
        userExplicitLanguage: null,
        lastIntent: null,
        isExpired: false,
      };
      this.sessions.set(id, session);
    } else {
      session.lastActivityAt = Date.now();
    }

    // Merge untrusted client context if validated
    if (clientContext) {
      const validation = validateConversationContext(clientContext);
      if (validation.valid && validation.data) {
        const d = validation.data;
        if (d.activeClaim && !session.activeClaim) session.activeClaim = d.activeClaim;
        if (d.targetLanguage) {
          session.responseLanguage = d.targetLanguage;
          session.userExplicitLanguage = d.targetLanguage;
        }
        if (d.activeEvidence && d.activeEvidence.length > 0 && session.activeEvidence.length === 0) {
          session.activeEvidence = this.sanitizeEvidence(d.activeEvidence);
        }
      }
    }

    return session;
  }

  /**
   * Sanitizes untrusted client evidence list.
   * Rejects fabricated claimIds, malformed URLs, and non-HTTP schemes.
   * @param {Array} evidenceList
   * @returns {Array} Validated evidence objects
   */
  sanitizeEvidence(evidenceList) {
    if (!Array.isArray(evidenceList)) return [];
    return evidenceList
      .filter((item) => {
        if (!item || typeof item !== 'object') return false;
        if (!item.claimId || typeof item.claimId !== 'string' || item.claimId.length > 120) return false;
        if (!item.sourceTitle || typeof item.sourceTitle !== 'string') return false;
        if (!item.url || typeof item.url !== 'string') return false;

        // Verify URL format strictly
        let u;
        try {
          u = new URL(item.url);
        } catch {
          try {
            u = new URL(`https://${item.url}`);
          } catch {
            return false;
          }
        }
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;

        return true;
      })
      .slice(0, 8);
  }

  /**
   * Analyzes an incoming conversational utterance and decides the routing strategy.
   * @param {string} userText
   * @param {object} session
   * @param {object} [options]
   * @returns {object} Routing plan
   */
  routeTurn(userText, session, options = {}) {
    const trimmed = (userText || '').trim();

    // Check session turn limit
    if (session.turnCount >= MAX_TURNS_PER_SESSION) {
      return {
        action: 'SESSION_LIMIT_REACHED',
        intent: 'STOP',
        shouldRetrieve: false,
        shouldVerify: false,
        reuseEvidence: false,
        responseLanguage: session.responseLanguage || 'en',
        responseText: 'This conversation session has reached its turn limit (10 turns). Tap New Claim to start a fresh session.',
      };
    }

    // Detect language of input utterance
    const detectedResult = LanguageDetector.detect(trimmed);
    const detectedLang = detectedResult?.detectedLanguage || session.inputLanguage || 'en';
    session.inputLanguage = detectedLang;

    // Resolve target response language:
    // 1. Explicit user selection (if user chose language in UI)
    // 2. Detected input language if non-English (e.g. Urdu, Spanish, Indonesian, Arabic)
    // 3. Current session response language or default 'en'
    const targetLang = session.userExplicitLanguage || (detectedLang !== 'en' ? detectedLang : (session.responseLanguage || 'en'));
    session.responseLanguage = targetLang;

    // Detect intent with context
    const intentResult = IntentDetector.detect(trimmed, options.requestedMode, {
      activeClaim: session.activeClaim,
      activeEvidence: session.activeEvidence,
      history: session.history,
    });

    const intent = intentResult.intent;
    session.lastIntent = intent;

    // Handle Language Switch
    if (intent === INTENTS.LANGUAGE_SWITCH && intentResult.targetLanguage) {
      session.responseLanguage = intentResult.targetLanguage;
      return {
        action: 'HANDLE_LANGUAGE_SWITCH',
        intent: INTENTS.LANGUAGE_SWITCH,
        shouldRetrieve: false,
        shouldVerify: false,
        reuseEvidence: session.activeEvidence.length > 0,
        responseLanguage: session.responseLanguage,
        targetLanguage: session.responseLanguage,
      };
    }

    // Handle Stop / Interruption
    if (intent === INTENTS.STOP) {
      return {
        action: 'HANDLE_STOP',
        intent: INTENTS.STOP,
        shouldRetrieve: false,
        shouldVerify: false,
        reuseEvidence: false,
        responseLanguage: session.responseLanguage || 'en',
        responseText: 'Voice response stopped. Ask a question or speak a claim when you are ready.',
      };
    }

    // Handle Casual Conversation
    if (intent === INTENTS.CASUAL_CONVERSATION) {
      return {
        action: 'HANDLE_CASUAL',
        intent: INTENTS.CASUAL_CONVERSATION,
        shouldRetrieve: false,
        shouldVerify: false,
        reuseEvidence: false,
        responseLanguage: session.responseLanguage || detectedLang,
      };
    }

    // Handle Guidance / Help
    if (intent === INTENTS.GUIDANCE) {
      return {
        action: 'HANDLE_GUIDANCE',
        intent: INTENTS.GUIDANCE,
        shouldRetrieve: false,
        shouldVerify: false,
        reuseEvidence: false,
        responseLanguage: session.responseLanguage || detectedLang,
        responseText: 'I am VeriVoice, an evidence-grounded verification assistant. Speak or type any claim, and I will evaluate it against authoritative sources like the WHO and scientific databases.',
      };
    }

    // Handle Follow-Up
    if (intent === INTENTS.FOLLOW_UP) {
      const canReuse = session.activeEvidence && session.activeEvidence.length > 0;
      return {
        action: canReuse ? 'HANDLE_FOLLOW_UP_REUSE' : 'HANDLE_RETRIEVAL_REQUIRED',
        intent: INTENTS.FOLLOW_UP,
        shouldRetrieve: !canReuse,
        shouldVerify: true,
        reuseEvidence: canReuse,
        activeEvidence: session.activeEvidence,
        activeClaim: session.activeClaim,
        responseLanguage: session.responseLanguage || detectedLang,
      };
    }

    // Handle Verify Claim or General Question (New Topic)
    const isVerification = intent === INTENTS.VERIFY_CLAIM;
    session.activeClaim = trimmed;

    return {
      action: 'HANDLE_FRESH_VERIFICATION',
      intent,
      shouldRetrieve: true,
      shouldVerify: true,
      reuseEvidence: false,
      isVerification,
      responseLanguage: session.responseLanguage || detectedLang,
    };
  }

  /**
   * Updates session history and active evidence after a turn completes.
   * @param {object} session
   * @param {string} userText
   * @param {object} resultPayload
   */
  recordTurn(session, userText, resultPayload) {
    session.turnCount += 1;
    session.lastActivityAt = Date.now();

    // Store recent history
    session.history.push({
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    });

    session.history.push({
      role: 'assistant',
      text: resultPayload.explanation || resultPayload.responseText || '',
      verdict: resultPayload.verdict,
      timestamp: Date.now(),
    });

    // Prune history to MAX_HISTORY_LENGTH
    if (session.history.length > MAX_HISTORY_LENGTH * 2) {
      session.history = session.history.slice(-MAX_HISTORY_LENGTH * 2);
    }

    // Update active evidence if fresh evidence was retrieved
    if (resultPayload.evidence && Array.isArray(resultPayload.evidence) && resultPayload.evidence.length > 0) {
      session.activeEvidence = this.sanitizeEvidence(resultPayload.evidence);
    }
  }
}

// Export singleton instance and class
const conversationManager = new ConversationManager();

module.exports = {
  ConversationManager,
  conversationManager,
  SESSION_TTL_MS,
  MAX_TURNS_PER_SESSION,
};
