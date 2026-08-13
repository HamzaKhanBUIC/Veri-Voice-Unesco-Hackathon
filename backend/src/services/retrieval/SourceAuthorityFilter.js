const DOMAIN_AUTHORITY_MAP = {
  HEALTH: new Set([
    'who.int',
    'paho.org',
    'unicef.org',
    'nih.gov',
    'cdc.gov',
    'ncbi.nlm.nih.gov',
    'pubmed.ncbi.nlm.nih.gov',
    'thelancet.com',
    'bmj.com',
    'fda.gov',
    'ema.europa.eu',
  ]),
  EARTH_SPACE: new Set([
    'nasa.gov',
    'usgs.gov',
    'noaa.gov',
    'esa.int',
    'jpl.nasa.gov',
    'nature.com',
    'science.org',
    'astronomy.com',
    'space.com',
  ]),
  WEATHER_CLIMATE: new Set([
    'wmo.int',
    'noaa.gov',
    'nasa.gov',
    'pmd.gov.pk',
    'ipcc.ch',
    'climate.gov',
  ]),
  GEOLOGY: new Set([
    'usgs.gov',
    'geology.com',
    'emsc-csem.org',
    'earthquake.usgs.gov',
  ]),
  DISASTER: new Set([
    'ndma.gov.pk',
    'pmd.gov.pk',
    'bnpb.go.id',
    'undrr.org',
    'unicef.org',
    'gadrrres.net',
  ]),
  EDUCATION: new Set([
    'unesco.org',
    'worldbank.org',
  ]),
  SCIENCE: new Set([
    'nature.com',
    'science.org',
    'sciencedirect.com',
    'arxiv.org',
    'pnas.org',
  ]),
};

const REPUTABLE_NEWS_DOMAINS = new Set([
  'reuters.com',
  'bbc.com',
  'bbc.co.uk',
  'apnews.com',
  'afp.com',
  'dawn.com',
  'tribune.com.pk',
  'geo.tv',
]);

/**
 * Source Authority Classification Adapter.
 * Categorizes and ranks sources based on domain, organization, relevance, and authority.
 */
class SourceAuthorityFilter {
  /**
   * Classifies source authority level
   * @param {string} urlStr 
   * @param {string} orgName 
   * @param {string} [domainCategory='GENERAL'] 
   * @returns {'PRIMARY_AUTHORITY' | 'SECONDARY_AUTHORITY' | 'REPUTABLE_NEWS' | 'GENERAL_WEB' | 'UNKNOWN'}
   */
  static classifyAuthority(urlStr = '', orgName = '', domainCategory = 'GENERAL') {
    const domain = this.extractDomain(urlStr);
    const org = (orgName || '').toLowerCase();

    // Check specific domain category authority map
    const categorySet = DOMAIN_AUTHORITY_MAP[domainCategory];
    if (categorySet && categorySet.has(domain)) {
      return 'PRIMARY_AUTHORITY';
    }

    // Check general primary authority across all categories
    for (const set of Object.values(DOMAIN_AUTHORITY_MAP)) {
      if (set.has(domain)) {
        return 'PRIMARY_AUTHORITY';
      }
    }

    // Check organization keywords for primary institutional authority
    if (
      (org.includes('who') && !org.includes('whole')) ||
      org.includes('paho') ||
      org.includes('nasa') ||
      org.includes('usgs') ||
      org.includes('noaa') ||
      org.includes('ndma') ||
      org.includes('unicef') ||
      org.includes('unesco') ||
      org.includes('cdc')
    ) {
      return 'PRIMARY_AUTHORITY';
    }

    // Wikipedia & Encyclopedic references are Secondary Authority
    if (domain.includes('wikipedia.org') || org.includes('wikipedia')) {
      return 'SECONDARY_AUTHORITY';
    }

    // Secondary authority (.edu, .ac.uk, academic journals)
    if (
      domain.endsWith('.edu') ||
      domain.endsWith('.ac.uk') ||
      org.includes('journal') ||
      org.includes('university')
    ) {
      return 'SECONDARY_AUTHORITY';
    }

    // Reputable News
    if (REPUTABLE_NEWS_DOMAINS.has(domain) || org.includes('reuters') || org.includes('bbc') || org.includes('ap news')) {
      return 'REPUTABLE_NEWS';
    }

    if (domain) {
      return 'GENERAL_WEB';
    }

    return 'UNKNOWN';
  }

  /**
   * Extracts clean domain name from URL string
   */
  static extractDomain(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return '';
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.hostname.replace(/^www\./, '').toLowerCase();
    } catch (e) {
      return '';
    }
  }

  /**
   * Enhances evidence matches with authority metadata and sorts primary sources first.
   * @param {Array<object>} matches 
   * @param {string} [domainCategory='GENERAL'] 
   * @returns {Array<object>} Matches with authority metadata attached and sorted by authority
   */
  static enhanceMatchesWithAuthority(matches, domainCategory = 'GENERAL') {
    if (!Array.isArray(matches)) return [];

    const enhanced = matches.map((match) => {
      const sources = (match.sources || []).map((src) => {
        const authorityLevel = this.classifyAuthority(src.url, src.organization, domainCategory);
        return {
          url: src.url || 'https://www.who.int',
          domain: this.extractDomain(src.url),
          title: src.title || 'Official Document',
          organization: src.organization || 'Official Source',
          authorityLevel,
          publicationDate: src.publicationDate || null,
          retrievedAt: new Date().toISOString(),
          relevance: match.score ? Math.min(1.0, match.score / 20) : 0.8,
        };
      });

      const topAuthority = sources.length > 0
        ? sources[0].authorityLevel
        : this.classifyAuthority(match.url, match.organization, domainCategory);

      return {
        ...match,
        authorityLevel: topAuthority,
        sources,
      };
    });

    // Sort so PRIMARY_AUTHORITY matches rank before SECONDARY_AUTHORITY
    const rankMap = {
      PRIMARY_AUTHORITY: 4,
      SECONDARY_AUTHORITY: 3,
      REPUTABLE_NEWS: 2,
      GENERAL_WEB: 1,
      UNKNOWN: 0,
    };

    enhanced.sort((a, b) => (rankMap[b.authorityLevel] || 0) - (rankMap[a.authorityLevel] || 0));

    return enhanced;
  }
}

module.exports = SourceAuthorityFilter;
