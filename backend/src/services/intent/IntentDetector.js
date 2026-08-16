/**
 * Intent Detector Service.
 * Categorizes user intent into VERIFY_CLAIM, GENERAL_RESEARCH, LIVE_INFORMATION,
 * CASUAL_CONVERSATION, FOLLOW_UP, LANGUAGE_SWITCH, GUIDANCE, or STOP.
 */

const INTENTS = {
  VERIFY_CLAIM: 'VERIFY_CLAIM',
  GENERAL_RESEARCH: 'GENERAL_RESEARCH',
  GENERAL_QUESTION: 'GENERAL_RESEARCH', // Backwards compatible alias
  LIVE_INFORMATION: 'LIVE_INFORMATION',
  LIVE_ALERT: 'LIVE_INFORMATION',
  CASUAL_CONVERSATION: 'CASUAL_CONVERSATION',
  FOLLOW_UP: 'FOLLOW_UP',
  LANGUAGE_SWITCH: 'LANGUAGE_SWITCH',
  CLARIFICATION: 'CLARIFICATION',
  GUIDANCE: 'GUIDANCE',
  HELP: 'GUIDANCE',
  EXPLANATION: 'EXPLANATION',
  STOP: 'STOP',
};

class IntentDetector {
  /**
   * Detects intent from text, optional requested mode, and conversation context.
   * @param {string} text 
   * @param {string} [requestedMode] - 'VERIFICATION' | 'GENERAL_RESEARCH' | 'LIVE'
   * @param {object} [context] - Optional conversation context { activeClaim, hasEvidence, turnCount }
   * @returns {{ intent: string, mode: string, confidence: string, targetLanguage?: string }}
   */
  static detect(text, requestedMode = null, context = null) {
    if (requestedMode === 'VERIFICATION') {
      return { intent: INTENTS.VERIFY_CLAIM, mode: 'VERIFICATION', confidence: 'HIGH' };
    }
    if (requestedMode === 'GENERAL_RESEARCH') {
      return { intent: INTENTS.GENERAL_RESEARCH, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }
    if (requestedMode === 'LIVE' || requestedMode === 'LIVE_INFORMATION') {
      return { intent: INTENTS.LIVE_INFORMATION, mode: 'LIVE', confidence: 'HIGH' };
    }

    if (!text || typeof text !== 'string') {
      return { intent: INTENTS.GUIDANCE, mode: 'GENERAL_RESEARCH', confidence: 'LOW' };
    }

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Stop / Interruption Intent
    if (/^(stop|cancel|quit|enough|pause|shut up|quiet|ruk jao|bas karo|khatam|parar|berhenti)\b/i.test(trimmed)) {
      return { intent: INTENTS.STOP, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }

    // 2. Language Switch Intent
    const langSwitchMatch = this.detectLanguageSwitch(trimmed);
    if (langSwitchMatch) {
      return {
        intent: INTENTS.LANGUAGE_SWITCH,
        mode: 'GENERAL_RESEARCH',
        confidence: 'HIGH',
        targetLanguage: langSwitchMatch,
      };
    }

    // 3. Casual Conversation / Salutations
    if (
      /^(hi|hello|hey|salam|assalam o alaikum|kya haal hai|how are you|good morning|good evening|thanks|thank you|shukriya|gracias|terima kasih|who are you|what is your name)\b/i.test(trimmed) &&
      trimmed.length < 40
    ) {
      return { intent: INTENTS.CASUAL_CONVERSATION, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }

    // 4. Live Alerts & Emergency Awareness Intent ("What is happening now?", "flood warning", "current weather")
    const livePatterns = [
      /\b(what is happening (now|today|right now)|what's happening (now|today|right now)|live updates?|breaking news)\b/i.test(trimmed),
      /\b(flood warning|flood alert|flash flood|heavy rain alert|monsoon alert|ndma alert|pmd alert|cyclone alert|earthquake alert|glof alert|landslide alert)\b/i.test(trimmed),
      /\b(is there (a|any) (flood|weather|cyclone|disaster|emergency|severe weather) (warning|alert|advisory))\b/i.test(trimmed),
      /\b(current weather|weather (today|now|forecast)|temperature (today|now)|is it raining (today|now|in))\b/i.test(trimmed),
      /\b(disaster advisories|official alerts?|emergency updates?|active warnings?|evacuation orders?)\b/i.test(trimmed),
      /(سیلاب کا الرٹ|بارش کا الرٹ|موسم کا حال|تازہ ترین صورتحال|ہنگامی الرٹ|این ڈی ایم اے الرٹ|پی ایم ڈی الرٹ)/i.test(trimmed),
      /(peringatan banjir|info cuaca terkini|gempa bumi sekarang|peringatan bmkg|berita terkini|situasi darurat)/i.test(trimmed),
      /(alerta de inundación|clima actual|alerta meteorológica|noticias de última hora|terremoto ahora)/i.test(trimmed),
    ];

    if (livePatterns.some(Boolean)) {
      return { intent: INTENTS.LIVE_INFORMATION, mode: 'LIVE', confidence: 'HIGH' };
    }

    // 5. Follow-up intent (If previous activeClaim or activeEvidence exists, or short referential query)
    const hasContext = context && (context.activeClaim || (context.activeEvidence && context.activeEvidence.length > 0) || (context.history && context.history.length > 0));
    const isShortReferential = /^(why\??|why is that\??|kyun\??|کیوں\??|por qué\??|mengapa\??|explain more|tell me more|what about the (first|second|third|who|cdc|nasa) source\??|what did (who|cdc|nasa|the scientists?) say\??|is it contagious\??|how come\??|how so\??)$/i.test(trimmed);

    if (isShortReferential || (hasContext && /^(why|what about|how about|explain|tell me more|can you explain|and)\b/i.test(trimmed) && trimmed.length < 60)) {
      return { intent: INTENTS.FOLLOW_UP, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }

    // 6. Guidance / Help patterns
    if (/\b(how to use|help|commands|what can you do|gui me|madad|ayuda|bantuan)\b/i.test(trimmed)) {
      return { intent: INTENTS.GUIDANCE, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }

    // 7. Explicit Verification Claim patterns
    const verificationPatterns = [
      /\b(is it true that|is it fact that|verify this|check this claim|fact check|rumor|myth|hoax|fake news)\b/i.test(trimmed),
      /\b(is|are|can|does|do|will|should|true|false|fake|real|myth|hoax|safe|prevent|cause|cure)\b.*\?/i.test(trimmed),
      /^(is|are|can|does|do|will|should|is it true that|is it safe to)\b/i.test(trimmed),
      /(کیا یہ سچ ہے|کیا یہ محفوظ ہے|کیا واقعی|سچ یا جھوٹ|تصدیق کریں|کیا یہ افواہ ہے)/i.test(trimmed),
      /^(apakah|benarkah|bisakah|dapatkah)\b/i.test(trimmed),
      /^(¿|es cierto|es verdad|puede|es seguro)\b/i.test(trimmed),
    ];

    if (verificationPatterns.some(Boolean)) {
      return { intent: INTENTS.VERIFY_CLAIM, mode: 'VERIFICATION', confidence: 'HIGH' };
    }

    // 8. General Research patterns (Who, What, Where, When, Why, How)
    const researchPatterns = [
      /\b(who|what|where|when|why|how|explain|describe|list|tell me about|history of|discovery of)\b/i.test(trimmed),
      /(کون|کیا|کہاں|کب|کیوں|کیسے|وضاحت کریں|تفصیل)/i.test(trimmed),
      /(siapa|apa|dimana|kapan|mengapa|bagaimana|jelaskan)/i.test(trimmed),
      /(quién|qué|dónde|cuándo|por qué|cómo|explicar)/i.test(trimmed),
    ];

    if (researchPatterns.some(Boolean)) {
      return { intent: INTENTS.GENERAL_RESEARCH, mode: 'GENERAL_RESEARCH', confidence: 'MEDIUM' };
    }

    // Default to VERIFY_CLAIM if statement appears to assert a fact
    if (trimmed.length > 20 && !trimmed.endsWith('?')) {
      return { intent: INTENTS.VERIFY_CLAIM, mode: 'VERIFICATION', confidence: 'LOW' };
    }

    return { intent: INTENTS.GENERAL_RESEARCH, mode: 'GENERAL_RESEARCH', confidence: 'LOW' };
  }

  /**
   * Helper to detect language switch requests.
   * @param {string} text 
   * @returns {string|null}
   */
  static detectLanguageSwitch(text) {
    if (/\b(speak (in )?urdu|urdu me(in)? (batao|bolo|samjhao|samjhaiye)|urdu language|اردو میں بولو|اردو)\b/i.test(text)) return 'ur';
    if (/\b(speak (in )?english|english me(in)? (bolo|samjhao)|english please|in english)\b/i.test(text)) return 'en';
    if (/\b(speak (in )?spanish|habla en español|en español|spanish language)\b/i.test(text)) return 'es';
    if (/\b(speak (in )?indonesian|bahasa indonesia|bicara bahasa indonesia)\b/i.test(text)) return 'id';
    return null;
  }
}

module.exports = {
  IntentDetector,
  INTENTS,
};
