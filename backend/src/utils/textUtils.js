/**
 * Text normalization and keyword tokenization for Urdu and English search queries.
 */

// Urdu character normalization map
const URDU_CHAR_MAP = {
  'ك': 'ک',
  'ي': 'ی',
  'ے': 'ی',
  'آ': 'ا',
  'أ': 'ا',
  'إ': 'ا',
  'ۃ': 'ہ',
  'ں': 'ن', // Normalize noon ghunna to noon
  'ٹ': 'ٹ',
  'ڈ': 'ڈ',
  'ڑ': 'ڑ',
};

/**
 * Normalizes text for keyword matching.
 * @param {string} text 
 * @returns {string} Normalized string
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  let str = text.trim().toLowerCase();

  // Remove Urdu diacritics / harakat (e.g., Zabar, Zer, Pesh, Tanween)
  str = str.replace(/[\u064B-\u0652\u0670]/g, '');

  // Normalize specific Urdu/Arabic character variants
  let normalized = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    normalized += URDU_CHAR_MAP[char] || char;
  }

  // Remove punctuation marks
  normalized = normalized.replace(/[؟!.,؛:;—_"\-'()\[\]{}‹›«»]/g, ' ');

  // Normalize whitespace
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Tokenizes text into unique normalized keywords (length > 1).
 * @param {string} text 
 * @returns {string[]} Array of normalized keyword tokens
 */
function extractKeywords(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  // Extended Urdu and English stopwords list
  const stopwords = new Set([
    'کیا', 'یہ', 'ہے', 'ہوا', 'ہوں', 'ہیں', 'تھا', 'تھی', 'تھے', 'کا', 'کی', 'کے', 'کو',
    'میں', 'پر', 'سے', 'نے', 'اور', 'یا', 'ان', 'اس', 'کس', 'جو', 'جی', 'بھی', 'نہیں', 'نہی',
    'نہ', 'ہو', 'ہوتا', 'ہوتی', 'ہوتے', 'کرتا', 'کرتی', 'کرتے', 'کرنا', 'کرنے', 'ایک', 'دو',
    'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'does', 'do', 'did', 'not'
  ]);

  const tokens = normalized.split(' ');
  const keywords = new Set();

  for (const token of tokens) {
    if (token.length > 1 && !stopwords.has(token)) {
      keywords.add(token);
    }
  }

  return Array.from(keywords);
}

module.exports = {
  normalizeText,
  extractKeywords,
};
