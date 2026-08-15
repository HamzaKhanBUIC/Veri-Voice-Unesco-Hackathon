/**
 * Text normalization and keyword tokenization for multilingual search queries (Urdu, Spanish, Indonesian, English).
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

const RAW_STOPWORDS = [
  // Urdu Conversational & Question Stopwords
  'کیا', 'یہ', 'ہے', 'ہوا', 'ہوں', 'ہیں', 'تھا', 'تھی', 'تھے', 'کا', 'کی', 'کے', 'کو',
  'میں', 'پر', 'سے', 'نے', 'اور', 'یا', 'ان', 'اس', 'کس', 'جو', 'جی', 'بھی', 'نہیں', 'نہی',
  'نہ', 'ہو', 'ہوتا', 'ہوتی', 'ہوتے', 'کرتا', 'کرتی', 'کرتے', 'کرنا', 'کرنے', 'ایک', 'دو',
  'کہ', 'آپ', 'مجھے', 'بتائیں', 'بتا', 'سکتے', 'سکتا', 'سکتی', 'ہیلو', 'سلام', 'اسلام', 'علیکم', 'والسلام',
  'بارے', 'معلومات', 'پوچھنا', 'چاہتا', 'چاہتی', 'پتہ', 'کیسے', 'کیوں', 'کون', 'کتنا', 'کتنے',

  // English Stopwords
  'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'does', 'do', 'did', 'not', 'can', 'you', 'tell', 'me', 'about', 'hello', 'hi', 'please', 'know', 'how', 'what', 'why', 'who', 'where', 'when',

  // Spanish Stopwords
  'el', 'la', 'los', 'las', 'un', 'una', 'es', 'son', 'por', 'para', 'con', 'que', 'como', 'cual', 'donde', 'hola', 'puedes', 'decirme', 'saber',

  // Indonesian Stopwords
  'yang', 'di', 'dan', 'ini', 'itu', 'dengan', 'untuk', 'pada', 'adalah', 'apakah', 'bisa', 'beri', 'tahu', 'saya', 'halo', 'bagaimana', 'kenapa'
];

const NORMALIZED_STOPWORDS = new Set(RAW_STOPWORDS.map((s) => normalizeText(s)));

/**
 * Tokenizes text into unique normalized keywords (length > 1).
 * @param {string} text 
 * @returns {string[]} Array of normalized keyword tokens
 */
function extractKeywords(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const tokens = normalized.split(' ');
  const keywords = new Set();

  for (const token of tokens) {
    if (token.length > 1 && !NORMALIZED_STOPWORDS.has(token)) {
      keywords.add(token);
    }
  }

  return Array.from(keywords);
}

module.exports = {
  normalizeText,
  extractKeywords,
};
