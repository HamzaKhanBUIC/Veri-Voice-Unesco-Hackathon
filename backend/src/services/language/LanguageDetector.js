const { normalizeText } = require('../../utils/textUtils');

// Script detection regexes
const URDU_ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const HINDI_DEVANA_REGEX = /[\u0900-\u097F]/;
const BENGALI_REGEX = /[\u0980-\u09FF]/;

// Keyword dictionaries for Latin-script languages
const SPANISH_INDICATORS = new Set(['que', 'el', 'la', 'los', 'las', 'un', 'una', 'es', 'son', 'por', 'para', 'con', 'vacuna', 'salud', 'inundacion', 'terremoto', 'noticia']);
const INDONESIAN_INDICATORS = new Set(['yang', 'di', 'dan', 'ini', 'itu', 'dengan', 'untuk', 'pada', 'adalah', 'banjir', 'tsunami', 'gempa', 'kesehatan', 'vaksin']);
const ROMAN_URDU_INDICATORS = new Set(['kya', 'hai', 'hain', 'mein', 'par', 'ko', 'se', 'ya', 'nahi', 'raha', 'rahi', 'syed', 'saal', 'paani', 'seelao', 'subah', 'ka']);
const FRENCH_INDICATORS = new Set(['est', 'les', 'des', 'une', 'dans', 'pour', 'pas', 'sur', 'plus', 'par']);
const GERMAN_INDICATORS = new Set(['ist', 'das', 'die', 'der', 'und', 'in', 'zu', 'den', 'mit', 'nicht']);
const PORTUGUESE_INDICATORS = new Set(['que', 'com', 'para', 'nao', 'como', 'mais', 'uma', 'sobre']);

/**
 * Language Detector & Metadata Preservation Service.
 * Preserves original user claim without overwriting translations.
 */
class LanguageDetector {
  /**
   * Detects claim language and produces language metadata payload.
   * @param {string} rawText - User's original claim transcript
   * @returns {{ originalText: string, detectedLanguage: string, normalizedText: string, verificationLanguage: string, responseLanguage: string }}
   */
  static detect(rawText) {
    if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
      return {
        originalText: rawText || '',
        detectedLanguage: 'en',
        normalizedText: '',
        verificationLanguage: 'en',
        responseLanguage: 'en',
      };
    }

    const text = rawText.trim();
    let detectedLanguage = 'en';

    // 1. Script-based detection
    if (URDU_ARABIC_REGEX.test(text)) {
      // Check for Urdu specific characters
      if (/[\u067E\u0686\u0698\u06AF\u06BA\u06D2]/.test(text) || text.includes('ہے') || text.includes('کا') || text.includes('کی') || text.includes('کے')) {
        detectedLanguage = 'ur';
      } else {
        detectedLanguage = 'ar';
      }
    } else if (HINDI_DEVANA_REGEX.test(text)) {
      detectedLanguage = 'hi';
    } else if (BENGALI_REGEX.test(text)) {
      detectedLanguage = 'bn';
    } else {
      // 2. Token-based detection for Latin scripts
      const tokens = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      let esScore = 0, idScore = 0, romanUrScore = 0, frScore = 0, deScore = 0, ptScore = 0;

      for (const token of tokens) {
        if (SPANISH_INDICATORS.has(token)) esScore++;
        if (INDONESIAN_INDICATORS.has(token)) idScore++;
        if (ROMAN_URDU_INDICATORS.has(token)) romanUrScore++;
        if (FRENCH_INDICATORS.has(token)) frScore++;
        if (GERMAN_INDICATORS.has(token)) deScore++;
        if (PORTUGUESE_INDICATORS.has(token)) ptScore++;
      }

      const maxScore = Math.max(esScore, idScore, romanUrScore, frScore, deScore, ptScore);
      if (maxScore > 0) {
        if (maxScore === romanUrScore) detectedLanguage = 'ur-Roman';
        else if (maxScore === esScore) detectedLanguage = 'es';
        else if (maxScore === idScore) detectedLanguage = 'id';
        else if (maxScore === frScore) detectedLanguage = 'fr';
        else if (maxScore === deScore) detectedLanguage = 'de';
        else if (maxScore === ptScore) detectedLanguage = 'pt';
      }
    }

    const normalizedText = normalizeText(text);

    return {
      originalText: text,
      detectedLanguage,
      normalizedText,
      verificationLanguage: detectedLanguage === 'ur-Roman' ? 'ur' : detectedLanguage,
      responseLanguage: detectedLanguage,
    };
  }
}

module.exports = LanguageDetector;
