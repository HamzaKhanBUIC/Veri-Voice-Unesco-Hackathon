/**
 * Intent Detector Service.
 * Categorizes user intent into VERIFY_CLAIM, GENERAL_RESEARCH, GUIDANCE, or EXPLANATION.
 */

const INTENTS = {
  VERIFY_CLAIM: 'VERIFY_CLAIM',
  GENERAL_RESEARCH: 'GENERAL_RESEARCH',
  GUIDANCE: 'GUIDANCE',
  EXPLANATION: 'EXPLANATION',
};

class IntentDetector {
  /**
   * Detects intent from text and optional requested mode.
   * @param {string} text 
   * @param {string} [requestedMode] - 'VERIFICATION' | 'GENERAL_RESEARCH'
   * @returns {{ intent: string, mode: string, confidence: string }}
   */
  static detect(text, requestedMode = null) {
    if (requestedMode === 'VERIFICATION') {
      return { intent: INTENTS.VERIFY_CLAIM, mode: 'VERIFICATION', confidence: 'HIGH' };
    }
    if (requestedMode === 'GENERAL_RESEARCH') {
      return { intent: INTENTS.GENERAL_RESEARCH, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }

    if (!text || typeof text !== 'string') {
      return { intent: INTENTS.GUIDANCE, mode: 'GENERAL_RESEARCH', confidence: 'LOW' };
    }

    const trimmed = text.trim();

    // Guidance patterns
    if (/\b(how to use|help|commands|what can you do|gui me)\b/i.test(trimmed)) {
      return { intent: INTENTS.GUIDANCE, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
    }

    // Verification claim patterns (Question phrases asking whether something is true / false / safe / effective)
    const verificationPatterns = [
      /\b(is|are|can|does|do|will|should|true|false|fake|real|myth|hoax|safe|prevent|cause|cure)\b.*\?/i,
      /^(is|are|can|does|do|will|should|is it true that|is it safe to)\b/i,
      /(کیا|کیا یہ سچ ہے|کیا یہ محفوظ ہے|کیا واقعی|سچ یا جھوٹ)/i,
      /^(apakah|benarkah|bisakah|dapatkah)\b/i,
      /^(¿|es cierto|es verdad|puede|es seguro)\b/i,
    ];

    for (const pattern of verificationPatterns) {
      if (pattern.test(trimmed)) {
        return { intent: INTENTS.VERIFY_CLAIM, mode: 'VERIFICATION', confidence: 'HIGH' };
      }
    }

    // Research patterns (Who, What, Where, When, Why, How)
    const researchPatterns = [
      /\b(who|what|where|when|why|how|explain|describe|list|tell me about|history of|discovery of)\b/i,
      /(کون|کیا|کہاں|کب|کیوں|کیسے|وضاحت کریں|تفصیل)/i,
      /(siapa|apa|dimana|kapan|mengapa|bagaimana|jelaskan)/i,
      /(quién|qué|dónde|cuándo|por qué|cómo|explicar)/i,
    ];

    for (const pattern of researchPatterns) {
      if (pattern.test(trimmed)) {
        return { intent: INTENTS.GENERAL_RESEARCH, mode: 'GENERAL_RESEARCH', confidence: 'HIGH' };
      }
    }

    // Default to VERIFICATION for declarative statements that sound like claims, or GENERAL_RESEARCH if ambiguous
    if (trimmed.length > 15 && !trimmed.endsWith('?')) {
      return { intent: INTENTS.VERIFY_CLAIM, mode: 'VERIFICATION', confidence: 'MEDIUM' };
    }

    return { intent: INTENTS.GENERAL_RESEARCH, mode: 'GENERAL_RESEARCH', confidence: 'LOW' };
  }
}

module.exports = {
  INTENTS,
  IntentDetector,
};
