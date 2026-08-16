/**
 * VeriVoice Input Quality & Boundary Validator
 */

export interface InputValidationResult {
  valid: boolean;
  sanitizedText: string;
  category?: 'GIBBERISH' | 'URL_ONLY' | 'OVERSIZED' | 'MULTIPLE_CLAIMS' | 'EMPTY' | 'VALID';
  message?: string;
  detectedUrl?: string;
  wordCount: number;
}

/**
 * Strips HTML tags and potential script injections safely.
 */
export function sanitizeInputText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Checks if input is low-entropy gibberish, spam, or repetitive characters.
 * Multilingual safe: accurately respects Urdu script, Spanish accents, and Indonesian vocabulary.
 */
export function isGibberish(text: string): boolean {
  const clean = text.trim();
  if (clean.length < 2) return true;

  // If input contains authentic Arabic/Urdu Unicode, it is not gibberish
  if (/[\u0600-\u06FF]/.test(clean) && clean.length >= 3) {
    const uniqueChars = new Set(clean.split(''));
    return uniqueChars.size === 1 && clean.length > 5;
  }

  // Pure punctuation / symbol spam (e.g. '??????', '!!!!', '🔥🔥🔥')
  const alphanumericChars = clean.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
  if (alphanumericChars.length === 0) return true;

  // Repetitive identical characters (e.g. 'aaaaaaa', '111111')
  if (/^(.)\1{4,}$/i.test(clean)) return true;

  // Common keyboard sequence smashing (e.g. 'asdfghjkl', 'qwertyuiop', 'zxcvbnm')
  const lower = clean.toLowerCase();
  if (
    lower.includes('asdf') ||
    lower.includes('ghjkl') ||
    lower.includes('qwerty') ||
    lower.includes('zxcvb') ||
    lower.includes('123456') ||
    lower.includes('67890')
  ) {
    return true;
  }

  // Long consonant cluster test for latin words
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length >= 7 && !/[aeiouyáéíóú]/i.test(w) && !/[\u0600-\u06FF]/.test(w)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates text before executing verification queries.
 */
export function validateClaimInput(text: string): InputValidationResult {
  const sanitized = sanitizeInputText(text);
  const words = sanitized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (!sanitized || sanitized.length === 0) {
    return {
      valid: false,
      sanitizedText: '',
      category: 'EMPTY',
      message: 'Please enter or speak a claim to verify.',
      wordCount: 0,
    };
  }

  // 1. URL Only Detection
  const urlMatch = sanitized.match(/^(https?:\/\/[^\s]+)$/i);
  if (urlMatch) {
    return {
      valid: false,
      sanitizedText: sanitized,
      category: 'URL_ONLY',
      detectedUrl: urlMatch[1],
      message: 'You shared a web link. What specific claim from this link should VeriVoice check?',
      wordCount,
    };
  }

  // 2. Gibberish / Low-entropy
  if (isGibberish(sanitized)) {
    return {
      valid: false,
      sanitizedText: sanitized,
      category: 'GIBBERISH',
      message: "We couldn't identify a clear question or factual claim. Please try asking a specific question.",
      wordCount,
    };
  }

  // 3. Oversized Input Guard (> 250 words)
  if (wordCount > 250) {
    return {
      valid: true,
      sanitizedText: sanitized.substring(0, 1500),
      category: 'OVERSIZED',
      message: 'Your message is long. VeriVoice will evaluate the primary central claim.',
      wordCount,
    };
  }

  // 4. Multiple Claims Detection (e.g. multiple question marks)
  const questionCount = (sanitized.match(/\?|؟/g) || []).length;
  if (questionCount > 2 && wordCount > 40) {
    return {
      valid: true,
      sanitizedText: sanitized,
      category: 'MULTIPLE_CLAIMS',
      message: 'Multiple questions detected. VeriVoice will focus on the first major claim.',
      wordCount,
    };
  }

  return {
    valid: true,
    sanitizedText: sanitized,
    category: 'VALID',
    wordCount,
  };
}
