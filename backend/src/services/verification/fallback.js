/**
 * Centralized Safety Fallback Helper.
 * Guarantees a safe, predictable UNCERTAIN response in the user's language whenever verification cannot be responsibly completed.
 */

const FALLBACK_REASONS = {
  NO_EVIDENCE: 'NO_EVIDENCE',
  INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE',
  CONTRADICTORY_EVIDENCE: 'CONTRADICTORY_EVIDENCE',
  INVALID_MODEL_OUTPUT: 'INVALID_MODEL_OUTPUT',
  INVALID_EVIDENCE_REFERENCE: 'INVALID_EVIDENCE_REFERENCE',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE',
};

const MULTILINGUAL_FALLBACK_EXPLANATIONS = {
  en: 'Available reliable information is insufficient to reach a conclusive verdict on this claim.',
  es: 'La información confiable disponible es insuficiente para llegar a un veredicto definitivo sobre esta afirmación.',
  id: 'Informasi tepercaya yang tersedia tidak cukup untuk mencapai keputusan pasti mengenai klaim ini.',
  ur: 'اس دعوے کے بارے میں دستیاب معتبر معلومات حتمی فیصلہ کرنے کے لیے کافی نہیں ہیں۔',
  'ur-Roman': 'Is daaway ke baaray mein dastiyab muatbar maloomat hatmi faisla karnay ke liye kafi nahi hain.',
  fr: "Les informations fiables disponibles sont insuffisantes pour parvenir à un verdict concluant sur cette affirmation.",
  de: 'Die verfügbaren verlässlichen Informationen reichen nicht aus, um ein abschließendes Urteil zu fällen.',
  pt: 'As informações confiáveis disponíveis são insuficientes para chegar a um veredito conclusivo sobre esta afirmação.',
};

/**
 * Returns a standardized, schema-compliant UNCERTAIN verdict fallback payload.
 * @param {string} [reason='INSUFFICIENT_EVIDENCE'] 
 * @param {string} [customExplanation] 
 * @param {string} [langCode='ur'] 
 * @returns {object} Standardized verdict result
 */
function createUncertainFallback(reason = FALLBACK_REASONS.INSUFFICIENT_EVIDENCE, customExplanation = null, langCode = 'ur') {
  const explanation = customExplanation || MULTILINGUAL_FALLBACK_EXPLANATIONS[langCode] || MULTILINGUAL_FALLBACK_EXPLANATIONS.en;

  return {
    verdict: 'UNCERTAIN',
    confidence: 0.0,
    explanation,
    evidence: [],
    reason: FALLBACK_REASONS[reason] || reason,
  };
}

module.exports = {
  FALLBACK_REASONS,
  createUncertainFallback,
};
