/**
 * Query Strategy Generator.
 * Generates natural and targeted search queries based on user text, mode, and domain.
 * Supports arbitrary multilingual questions and claims in Urdu, Spanish, Indonesian, English, etc.
 * Avoids query explosion and NEVER injects assumed answers or rigid distorted rewrites.
 */

class QueryStrategy {
  /**
   * Generates array of targeted search queries for any arbitrary user question or claim.
   * @param {string} userText 
   * @param {string} mode - 'VERIFICATION' | 'GENERAL_RESEARCH'
   * @param {string} domain - 'HEALTH' | 'EARTH_SPACE' | 'WEATHER_CLIMATE' | 'GEOLOGY' | 'DISASTER' | 'SCIENCE' | 'AI_DISINFORMATION' | 'GENERAL'
   * @returns {string[]} Array of 1 to 3 search query strings
   */
  static generateQueries(userText, mode = 'VERIFICATION', domain = 'GENERAL') {
    if (!userText || typeof userText !== 'string' || userText.trim() === '') {
      return [];
    }

    const cleanText = userText.trim();
    const queries = [];

    // Query 1: Exact original user query (preserves complete semantic intent in any language)
    queries.push(cleanText);

    // Remove stop punctuation and conversational filler for keyword query
    const keywordsOnly = cleanText
      .replace(/[?.,!:-]/g, '')
      .replace(/\b(is|are|can|does|do|will|should|the|a|an|about|in|on|of|for|with|tell me|explain)\b/gi, '')
      .trim();

    if (keywordsOnly.length > 3 && keywordsOnly !== cleanText) {
      queries.push(keywordsOnly);
    }

    // Domain authority keyword mapping for targeted verification grounding
    const domainKeywords = {
      HEALTH: 'WHO CDC PAHO medical evidence',
      EARTH_SPACE: 'NASA USGS scientific evidence',
      WEATHER_CLIMATE: 'NOAA WMO climate data atmospheric records',
      GEOLOGY: 'USGS geological survey seismic',
      DISASTER: 'NDMA emergency official report',
      SCIENCE: 'scientific research evidence journal',
      AI_DISINFORMATION: 'EDMO fact check media literacy disinformation analysis',
      MEDIA_INFORMATION_LITERACY: 'UNESCO MIL digital media literacy verification',
      BIODIVERSITY: 'iNaturalist biodiversity species conservation data',
      EDUCATION: 'UNESCO official education data',
      TECHNOLOGY: 'official technical standards specification',
      ECONOMICS: 'World Bank IMF official statistics',
    };

    if (domainKeywords[domain]) {
      const baseForDomain = keywordsOnly.length > 3 ? keywordsOnly : cleanText;
      queries.push(`${baseForDomain} ${domainKeywords[domain]}`);
    }

    // Limit to max 3 queries and remove duplicates
    return Array.from(new Set(queries)).slice(0, 3);
  }
}

module.exports = QueryStrategy;
