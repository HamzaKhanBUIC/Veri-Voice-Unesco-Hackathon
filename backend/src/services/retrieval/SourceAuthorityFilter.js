/**
 * Granular Source Authority Taxonomy & Classification Engine.
 * Aligned with UNESCO Media and Information Literacy (MIL) principles.
 * Evaluates sources by their distinct epistemic roles (institutional, raw scientific data,
 * official government, peer review, fact-checking, research network, citizen science).
 */

const AUTHORITY_TIERS = {
  PRIMARY_INSTITUTIONAL: 'PRIMARY_INSTITUTIONAL',
  PRIMARY_SCIENTIFIC_DATA: 'PRIMARY_SCIENTIFIC_DATA',
  OFFICIAL_GOVERNMENT: 'OFFICIAL_GOVERNMENT',
  SCIENTIFIC_REVIEW: 'SCIENTIFIC_REVIEW',
  FACT_CHECKING_ORGANIZATION: 'FACT_CHECKING_ORGANIZATION',
  RESEARCH_NETWORK: 'RESEARCH_NETWORK',
  SECONDARY_REPUTABLE: 'SECONDARY_REPUTABLE',
  CITIZEN_SCIENCE: 'CITIZEN_SCIENCE',
  GENERAL_WEB: 'GENERAL_WEB',
  UNKNOWN: 'UNKNOWN',

  // Backward-compatible aliases
  PRIMARY_AUTHORITY: 'PRIMARY_INSTITUTIONAL',
  SECONDARY_AUTHORITY: 'SECONDARY_REPUTABLE',
  REPUTABLE_NEWS: 'FACT_CHECKING_ORGANIZATION',
};

// Global Domain-Specific Source Registry across all 5 Key UNESCO Domains
const DOMAIN_AUTHORITY_MAP = {
  HEALTH: {
    PRIMARY_INSTITUTIONAL: ['who.int', 'paho.org', 'unicef.org', 'gavi.org', 'ema.europa.eu'],
    OFFICIAL_GOVERNMENT: ['cdc.gov', 'nih.gov', 'fda.gov', 'kemkes.go.id', 'nih.org.pk', 'gov.uk', 'moh.gov.sa'],
    SECONDARY_REPUTABLE: ['thelancet.com', 'bmj.com', 'ncbi.nlm.nih.gov', 'pubmed.ncbi.nlm.nih.gov', 'nejm.org', 'nature.com'],
    FACT_CHECKING_ORGANIZATION: ['factcheck.afp.com', 'reuters.com', 'factcheck.org', 'healthfeedback.org', 'maldita.es', 'cekfakta.com'],
  },
  WEATHER_CLIMATE: {
    PRIMARY_INSTITUTIONAL: ['wmo.int', 'ipcc.ch', 'unep.org'],
    PRIMARY_SCIENTIFIC_DATA: ['noaa.gov', 'climate.gov', 'nasa.gov', 'climate.nasa.gov', 'copernicus.eu', 'climate.copernicus.eu'],
    OFFICIAL_GOVERNMENT: ['pmd.gov.pk', 'bmkg.go.id', 'metoffice.gov.uk', 'bom.gov.au'],
    SCIENTIFIC_REVIEW: ['climatefeedback.org', 'sciencefeedback.co'],
    SECONDARY_REPUTABLE: ['nature.com', 'science.org', 'pnas.org'],
  },
  EARTH_SPACE: {
    PRIMARY_SCIENTIFIC_DATA: ['nasa.gov', 'jpl.nasa.gov', 'noaa.gov', 'usgs.gov', 'esa.int', 'earthquake.usgs.gov', 'cern.ch', 'home.cern'],
    OFFICIAL_GOVERNMENT: ['suparco.gov.pk', 'brin.go.id'],
    SECONDARY_REPUTABLE: ['nature.com', 'science.org', 'astronomy.com', 'space.com', 'agu.org'],
  },
  GEOLOGY: {
    PRIMARY_SCIENTIFIC_DATA: ['usgs.gov', 'earthquake.usgs.gov', 'emsc-csem.org'],
    OFFICIAL_GOVERNMENT: ['pmd.gov.pk', 'bmkg.go.id', 'bgr.bund.de'],
    SECONDARY_REPUTABLE: ['geology.com', 'nature.com/ngeo'],
  },
  DISASTER: {
    PRIMARY_INSTITUTIONAL: ['unocha.org', 'undrr.org', 'unicef.org', 'wmo.int', 'who.int', 'icrc.org', 'ifrc.org', 'gadrrres.net'],
    OFFICIAL_GOVERNMENT: ['ndma.gov.pk', 'bnpb.go.id', 'fema.gov', 'pmd.gov.pk', 'bmkg.go.id'],
    RESEARCH_NETWORK: ['reliefweb.int', 'gdacs.org'],
  },
  AI_DISINFORMATION: {
    RESEARCH_NETWORK: ['edmo.eu', 'disinfo.eu', 'firstdraftnews.org', 'witness.org', 'ox.ac.uk', 'stanford.edu'],
    PRIMARY_INSTITUTIONAL: ['unesco.org', 'coe.int', 'itu.int'],
    OFFICIAL_GOVERNMENT: ['pta.gov.pk', 'kominfo.go.id'],
    FACT_CHECKING_ORGANIZATION: ['factcheck.afp.com', 'reuters.com', 'apnews.com', 'snopes.com', 'fullfact.org', 'cekfakta.com', 'maldita.es', 'newtral.es', 'chequeado.com', 'sochfactcheck.com'],
    SECONDARY_REPUTABLE: ['arxiv.org', 'nature.com/machine-intelligence', 'acm.org', 'ieee.org'],
  },
  MEDIA_INFORMATION_LITERACY: {
    PRIMARY_INSTITUTIONAL: ['unesco.org', 'unicef.org', 'itu.int'],
    RESEARCH_NETWORK: ['edmo.eu', 'dw-akademie.com', 'commonsensemedia.org', 'firstdraftnews.org'],
    SECONDARY_REPUTABLE: ['harvard.edu', 'ox.ac.uk', 'mit.edu'],
  },
  BIODIVERSITY: {
    PRIMARY_INSTITUTIONAL: ['iucn.org', 'cbd.int', 'ipbes.net'],
    CITIZEN_SCIENCE: ['inaturalist.org', 'ebird.org', 'gbif.org'],
    SECONDARY_REPUTABLE: ['nature.com', 'science.org', 'kew.org'],
  },
  SCIENCE: {
    PRIMARY_SCIENTIFIC_DATA: ['nasa.gov', 'noaa.gov', 'esa.int', 'cern.ch', 'home.cern'],
    PRIMARY_INSTITUTIONAL: ['unesco.org'],
    SCIENTIFIC_REVIEW: ['sciencefeedback.co', 'climatefeedback.org'],
    SECONDARY_REPUTABLE: ['nature.com', 'science.org', 'sciencedirect.com', 'pnas.org', 'cell.com', 'arxiv.org'],
  },
  EDUCATION: {
    PRIMARY_INSTITUTIONAL: ['unesco.org', 'worldbank.org', 'unicef.org', 'oecd.org'],
    SECONDARY_REPUTABLE: ['britannica.com', 'cambridge.org', 'oxford.org'],
  },
};

const FACT_CHECKING_DOMAINS = new Set([
  'factcheck.afp.com',
  'reuters.com',
  'apnews.com',
  'factcheck.org',
  'snopes.com',
  'fullfact.org',
  'afp.com',
  'climatefeedback.org',
  'healthfeedback.org',
  'sciencefeedback.co',
  'cekfakta.com',
  'maldita.es',
  'newtral.es',
  'chequeado.com',
  'sochfactcheck.com',
]);

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

class SourceAuthorityFilter {
  /**
   * Checks whether a given domain is recognized in our authoritative institutional registry.
   */
  static isKnownAuthorityDomain(domainStr) {
    if (!domainStr || typeof domainStr !== 'string') return false;
    const domain = domainStr.toLowerCase().replace(/^www\./, '');

    for (const config of Object.values(DOMAIN_AUTHORITY_MAP)) {
      for (const domains of Object.values(config)) {
        if (domains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
          return true;
        }
      }
    }

    if (FACT_CHECKING_DOMAINS.has(domain) || REPUTABLE_NEWS_DOMAINS.has(domain)) {
      return true;
    }

    if (domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.includes('wikipedia.org')) {
      return true;
    }

    return false;
  }

  /**
   * Classifies source authority level based on URL, organization name, and domain context.
   * @param {string} urlStr 
   * @param {string} orgName 
   * @param {string} [domainCategory='GENERAL'] 
   * @returns {string} One of AUTHORITY_TIERS
   */
  static classifyAuthority(urlStr = '', orgName = '', domainCategory = 'GENERAL') {
    const domain = this.extractDomain(urlStr);
    const org = (orgName || '').toLowerCase();

    // 1. Direct Domain Category lookup in structured registry
    const categoryConfig = DOMAIN_AUTHORITY_MAP[domainCategory];
    if (categoryConfig) {
      for (const [tier, domains] of Object.entries(categoryConfig)) {
        if (domains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
          return tier;
        }
      }
    }

    // 2. Global registry lookup across all domains
    for (const config of Object.values(DOMAIN_AUTHORITY_MAP)) {
      for (const [tier, domains] of Object.entries(config)) {
        if (domains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
          return tier;
        }
      }
    }

    // 3. Organization-level heuristics
    if (org.includes('who') && !org.includes('whole')) return 'PRIMARY_INSTITUTIONAL';
    if (org.includes('wmo') || org.includes('unesco') || org.includes('unicef') || org.includes('paho')) return 'PRIMARY_INSTITUTIONAL';
    if (org.includes('nasa') || org.includes('noaa') || org.includes('usgs') || org.includes('esa')) return 'PRIMARY_SCIENTIFIC_DATA';
    if (org.includes('cdc') || org.includes('ndma') || org.includes('kemenkes') || org.includes('kemkes') || org.includes('nih')) return 'OFFICIAL_GOVERNMENT';
    if (org.includes('climate feedback') || org.includes('science feedback')) return 'SCIENTIFIC_REVIEW';
    if (org.includes('edmo') || org.includes('disinfo')) return 'RESEARCH_NETWORK';
    if (org.includes('afp fact check') || org.includes('factcheck') || org.includes('snopes') || org.includes('full fact')) return 'FACT_CHECKING_ORGANIZATION';
    if (org.includes('inaturalist') || domain.includes('inaturalist')) return 'CITIZEN_SCIENCE';

    // 4. Academic & Vetted Journals (.edu, .ac.uk, academic databases)
    if (
      domain.endsWith('.edu') ||
      domain.endsWith('.ac.uk') ||
      domain.includes('wikipedia.org') ||
      org.includes('journal') ||
      org.includes('university')
    ) {
      return 'SECONDARY_REPUTABLE';
    }

    // 5. Fact Checkers & Reputable News
    if (FACT_CHECKING_DOMAINS.has(domain)) {
      return 'FACT_CHECKING_ORGANIZATION';
    }
    if (REPUTABLE_NEWS_DOMAINS.has(domain) || org.includes('reuters') || org.includes('bbc') || org.includes('ap news')) {
      return 'FACT_CHECKING_ORGANIZATION';
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
   * Helper to check if an authority tier is considered Tier-1 / Primary
   */
  static isPrimaryTier(tier) {
    return (
      tier === 'PRIMARY_INSTITUTIONAL' ||
      tier === 'PRIMARY_SCIENTIFIC_DATA' ||
      tier === 'OFFICIAL_GOVERNMENT' ||
      tier === 'PRIMARY_AUTHORITY'
    );
  }

  /**
   * Enhances evidence matches with granular authority metadata and sorts by epistemic rank.
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
          relevance: match.score ? Math.min(1.0, match.score / 20) : 0.85,
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

    // Granular ranking weight
    const rankMap = {
      PRIMARY_INSTITUTIONAL: 8,
      PRIMARY_SCIENTIFIC_DATA: 8,
      OFFICIAL_GOVERNMENT: 7,
      SCIENTIFIC_REVIEW: 6,
      FACT_CHECKING_ORGANIZATION: 5,
      RESEARCH_NETWORK: 5,
      SECONDARY_REPUTABLE: 4,
      PRIMARY_AUTHORITY: 8,
      SECONDARY_AUTHORITY: 4,
      REPUTABLE_NEWS: 5,
      CITIZEN_SCIENCE: 3,
      GENERAL_WEB: 2,
      UNKNOWN: 1,
    };

    enhanced.sort((a, b) => (rankMap[b.authorityLevel] || 0) - (rankMap[a.authorityLevel] || 0));

    return enhanced;
  }
}

module.exports = SourceAuthorityFilter;
