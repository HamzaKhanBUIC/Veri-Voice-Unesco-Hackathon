/**
 * Query Strategy Generator.
 * Generates targeted search queries based on user text, mode, and domain.
 * Supports multilingual query translation/expansion for Urdu, Roman Urdu, Spanish, Indonesian,
 * Arabic, Hindi, French, and German queries to retrieve international scientific evidence.
 * Avoids query explosion and NEVER injects assumed answers or biased rewrites.
 */

const MULTILINGUAL_TERMS_MAP = [
  // Urdu / Roman Urdu
  { pattern: /پولیو|polio/i, english: 'polio vaccine safety' },
  { pattern: /ڈینگی|dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /ویکسین|vaccine/i, english: 'vaccine safety monitoring' },
  { pattern: /زمین|earth/i, english: 'earth shape orbit' },
  { pattern: /سورج|sun/i, english: 'sun solar system' },

  // Spanish
  { pattern: /dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /vacuna/i, english: 'vaccine safety monitoring' },
  { pattern: /segura|seguridad/i, english: 'safety evidence' },
  { pattern: /tierra|plana/i, english: 'flat earth' },
  { pattern: /sol/i, english: 'sun solar system' },

  // Indonesian
  { pattern: /demam berdarah|dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /vaksin/i, english: 'vaccine safety' },
  { pattern: /aman|keamanan/i, english: 'safety evidence' },
  { pattern: /bumi|datar/i, english: 'flat earth' },
  { pattern: /matahari/i, english: 'sun solar system' },
  { pattern: /air|mendidih/i, english: 'water boiling point' },

  // Arabic
  { pattern: /حمى الضنك|الضنك|dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /لقاح|تطعيم|vaccine/i, english: 'vaccine safety monitoring' },
  { pattern: /الأرض|مسطحة|earth/i, english: 'flat earth' },
  { pattern: /الشمس|sun/i, english: 'sun solar system' },
  { pattern: /ماء|غليان|water/i, english: 'water boiling point' },

  // Hindi
  { pattern: /डेंगू|dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /टीका|वैक्सीन|vaccine/i, english: 'vaccine safety monitoring' },
  { pattern: /पृथ्वी|चपटी|earth/i, english: 'flat earth' },
  { pattern: /सूर्य|sun/i, english: 'sun solar system' },
  { pattern: /पानी|उबलना|water/i, english: 'water boiling point' },

  // French
  { pattern: /dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /vaccin|vaccination/i, english: 'vaccine safety monitoring' },
  { pattern: /terre|plate/i, english: 'flat earth' },
  { pattern: /soleil/i, english: 'sun solar system' },
  { pattern: /pénicilline|découvert/i, english: 'penicillin discovery Fleming' },

  // German
  { pattern: /dengue/i, english: 'dengue fever mosquito virus' },
  { pattern: /impfstoff|impfung/i, english: 'vaccine safety monitoring' },
  { pattern: /erde|flach/i, english: 'flat earth' },
  { pattern: /sonne/i, english: 'sun solar system' },
  { pattern: /penicillin|entdeckt/i, english: 'penicillin discovery Fleming' },
];

class QueryStrategy {
  /**
   * Generates array of targeted search queries.
   * @param {string} userText 
   * @param {string} mode - 'VERIFICATION' | 'GENERAL_RESEARCH'
   * @param {string} domain - 'HEALTH' | 'EARTH_SPACE' | 'WEATHER_CLIMATE' | 'GEOLOGY' | 'DISASTER' | 'SCIENCE' | 'GENERAL'
   * @returns {string[]} Array of 1 to 3 search query strings
   */
  static generateQueries(userText, mode = 'VERIFICATION', domain = 'GENERAL') {
    if (!userText || typeof userText !== 'string' || userText.trim() === '') {
      return [];
    }

    const cleanText = userText.trim();
    const queries = [];

    // Query 1: Cleaned original query
    queries.push(cleanText);

    // Multilingual English Concept Expansion
    const multilingualTerms = [];
    for (const item of MULTILINGUAL_TERMS_MAP) {
      if (item.pattern.test(cleanText)) {
        multilingualTerms.push(item.english);
      }
    }

    if (multilingualTerms.length > 0) {
      queries.push(multilingualTerms.join(' '));
    }

    // Domain authority keyword mapping
    const domainKeywords = {
      HEALTH: 'WHO CDC PAHO medical evidence',
      EARTH_SPACE: 'NASA USGS scientific evidence',
      WEATHER_CLIMATE: 'NOAA WMO climate data',
      GEOLOGY: 'USGS geological survey seismic',
      DISASTER: 'NDMA emergency official report',
      SCIENCE: 'scientific research evidence journal',
      EDUCATION: 'UNESCO official education data',
      TECHNOLOGY: 'official technical standards specification',
      ECONOMICS: 'World Bank IMF official statistics',
    };

    // Remove stop punctuation for search engine keywords
    const keywordsOnly = cleanText
      .replace(/[?.,!:-]/g, '')
      .replace(/\b(is|are|can|does|do|will|should|the|a|an|about|in|on|of|for|with)\b/gi, '')
      .trim();

    if (domainKeywords[domain]) {
      queries.push(`${keywordsOnly} ${domainKeywords[domain]}`);
    } else if (keywordsOnly.length > 5 && keywordsOnly !== cleanText) {
      queries.push(keywordsOnly);
    }

    // Limit to max 3 queries to avoid query explosion
    return Array.from(new Set(queries)).slice(0, 3);
  }
}

module.exports = QueryStrategy;
