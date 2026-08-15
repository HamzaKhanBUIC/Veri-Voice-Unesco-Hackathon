const SourceAuthorityFilter = require('../backend/src/services/retrieval/SourceAuthorityFilter');
const { DomainDetector, DOMAINS } = require('../backend/src/services/domain/DomainDetector');
const QueryStrategy = require('../backend/src/services/retrieval/QueryStrategy');
const { EvidenceEvaluator, EVIDENCE_STRENGTH } = require('../backend/src/services/verification/EvidenceEvaluator');
const CitationValidator = require('../backend/src/services/verification/CitationValidator');

describe('UNESCO & MIL Source Authority & Domain Expansion Tests', () => {
  describe('1. Granular Source Authority Classification', () => {
    test('classifies Primary Institutional authorities correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://who.int/news', 'WHO')).toBe('PRIMARY_INSTITUTIONAL');
      expect(SourceAuthorityFilter.classifyAuthority('https://wmo.int/climate', 'WMO')).toBe('PRIMARY_INSTITUTIONAL');
      expect(SourceAuthorityFilter.classifyAuthority('https://unesco.org/mil', 'UNESCO')).toBe('PRIMARY_INSTITUTIONAL');
      expect(SourceAuthorityFilter.classifyAuthority('https://paho.org/en', 'PAHO')).toBe('PRIMARY_INSTITUTIONAL');
    });

    test('classifies Primary Scientific Data authorities correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://noaa.gov/ocean', 'NOAA')).toBe('PRIMARY_SCIENTIFIC_DATA');
      expect(SourceAuthorityFilter.classifyAuthority('https://climate.nasa.gov', 'NASA')).toBe('PRIMARY_SCIENTIFIC_DATA');
      expect(SourceAuthorityFilter.classifyAuthority('https://earthquake.usgs.gov', 'USGS')).toBe('PRIMARY_SCIENTIFIC_DATA');
    });

    test('classifies Official Government health & emergency bodies correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://cdc.gov/vaccines', 'CDC')).toBe('OFFICIAL_GOVERNMENT');
      expect(SourceAuthorityFilter.classifyAuthority('https://ndma.gov.pk/alerts', 'NDMA')).toBe('OFFICIAL_GOVERNMENT');
      expect(SourceAuthorityFilter.classifyAuthority('https://kemkes.go.id/berita', 'Kemenkes RI')).toBe('OFFICIAL_GOVERNMENT');
    });

    test('classifies Scientific Review networks correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://climatefeedback.org/evaluation', 'Climate Feedback')).toBe('SCIENTIFIC_REVIEW');
      expect(SourceAuthorityFilter.classifyAuthority('https://sciencefeedback.co', 'Science Feedback')).toBe('SCIENTIFIC_REVIEW');
    });

    test('classifies Research Networks and Observatories correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://edmo.eu/disinformation-brief', 'EDMO')).toBe('RESEARCH_NETWORK');
    });

    test('classifies Fact-Checking organizations correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://factcheck.afp.com/article', 'AFP Fact Check')).toBe('FACT_CHECKING_ORGANIZATION');
      expect(SourceAuthorityFilter.classifyAuthority('https://reuters.com/fact-check', 'Reuters')).toBe('FACT_CHECKING_ORGANIZATION');
    });

    test('classifies Citizen Science networks correctly', () => {
      expect(SourceAuthorityFilter.classifyAuthority('https://inaturalist.org/observations', 'iNaturalist')).toBe('CITIZEN_SCIENCE');
    });

    test('isPrimaryTier recognizes institutional, scientific data, and official government', () => {
      expect(SourceAuthorityFilter.isPrimaryTier('PRIMARY_INSTITUTIONAL')).toBe(true);
      expect(SourceAuthorityFilter.isPrimaryTier('PRIMARY_SCIENTIFIC_DATA')).toBe(true);
      expect(SourceAuthorityFilter.isPrimaryTier('OFFICIAL_GOVERNMENT')).toBe(true);
      expect(SourceAuthorityFilter.isPrimaryTier('CITIZEN_SCIENCE')).toBe(false);
      expect(SourceAuthorityFilter.isPrimaryTier('GENERAL_WEB')).toBe(false);
    });
  });

  describe('2. Expanded Domain Detection', () => {
    test('detects AI_DISINFORMATION in English and Urdu', () => {
      const enRes = DomainDetector.detect('This viral video is a deepfake AI generation spread by botnets');
      expect(enRes.domain).toBe('AI_DISINFORMATION');

      const urRes = DomainDetector.detect('یہ جعلی خبر اور ڈیپ فیک ویڈیو سوشل میڈیا پر وائرل ہے');
      expect(urRes.domain).toBe('AI_DISINFORMATION');
    });

    test('detects MEDIA_INFORMATION_LITERACY', () => {
      const milRes = DomainDetector.detect('UNESCO media literacy and critical source verification');
      expect(milRes.domain).toBe('MEDIA_INFORMATION_LITERACY');
    });

    test('detects BIODIVERSITY across languages', () => {
      const bioRes = DomainDetector.detect('Endangered plant species recorded on iNaturalist in the forest ecosystem');
      expect(bioRes.domain).toBe('BIODIVERSITY');

      const idRes = DomainDetector.detect('Keanekaragaman hayati dan spesies satwa liar yang terancam');
      expect(idRes.domain).toBe('BIODIVERSITY');
    });

    test('detects WEATHER_CLIMATE with NOAA / global warming signals', () => {
      const climRes = DomainDetector.detect('Global warming emissions and NOAA atmospheric telemetry');
      expect(climRes.domain).toBe('WEATHER_CLIMATE');
    });
  });

  describe('3. Query Strategy for Expanded Domains', () => {
    test('generates targeted queries for AI_DISINFORMATION', () => {
      const queries = QueryStrategy.generateQueries('Is this deepfake video real?', 'VERIFICATION', 'AI_DISINFORMATION');
      expect(queries.length).toBeGreaterThanOrEqual(1);
      expect(queries.length).toBeLessThanOrEqual(3);
      expect(queries.some((q) => q.includes('EDMO') || q.includes('disinformation') || q.includes('deepfake'))).toBe(true);
    });

    test('generates targeted queries for WEATHER_CLIMATE', () => {
      const queries = QueryStrategy.generateQueries('Ocean temperature rise this year', 'VERIFICATION', 'WEATHER_CLIMATE');
      expect(queries.some((q) => q.includes('NOAA') || q.includes('WMO'))).toBe(true);
    });

    test('avoids query explosion and deduplicates queries', () => {
      const queries = QueryStrategy.generateQueries('polio drops vaccine', 'VERIFICATION', 'HEALTH');
      expect(queries.length).toBeLessThanOrEqual(3);
      const unique = new Set(queries);
      expect(unique.size).toBe(queries.length);
    });
  });

  describe('4. Evidence Evaluation & Source Independence', () => {
    test('recognizes granular authority tiers in evidence strength evaluation', () => {
      const matches = [
        {
          claim: 'Vaccines prevent paralysis',
          score: 18,
          sources: [
            { url: 'https://who.int/polio', organization: 'WHO', authorityLevel: 'PRIMARY_INSTITUTIONAL', domain: 'who.int' },
          ],
        },
        {
          claim: 'Clinical surveillance report',
          score: 16,
          sources: [
            { url: 'https://cdc.gov/surveillance', organization: 'CDC', authorityLevel: 'OFFICIAL_GOVERNMENT', domain: 'cdc.gov' },
          ],
        },
      ];

      const result = EvidenceEvaluator.evaluate(matches);
      expect(result.evidenceStrength).toBe(EVIDENCE_STRENGTH.STRONG_EVIDENCE);
      expect(result.confidence).toBe('HIGH');
      expect(result.primarySourceCount).toBeGreaterThanOrEqual(2);
    });

    test('deduplicates identical syndicated wire text across matches', () => {
      const duplicateMatches = [
        { claim: 'Scientists confirm global temperatures reach record high in 2026', url: 'https://news1.com' },
        { claim: 'Scientists confirm global temperatures reach record high in 2026', url: 'https://news2.com' },
      ];

      const deduplicated = EvidenceEvaluator.deduplicateMatches(duplicateMatches);
      expect(deduplicated.length).toBe(1);
    });

    test('enforces SEARCH_PARTIAL confidence capping', () => {
      const matches = [
        {
          claim: 'Climate records indicate sea level rise',
          sources: [
            { url: 'https://noaa.gov/data', organization: 'NOAA', authorityLevel: 'PRIMARY_SCIENTIFIC_DATA', domain: 'noaa.gov' },
            { url: 'https://wmo.int/climate', organization: 'WMO', authorityLevel: 'PRIMARY_INSTITUTIONAL', domain: 'wmo.int' },
          ],
        },
      ];

      const result = EvidenceEvaluator.evaluate(matches, { searchStatus: 'SEARCH_PARTIAL' });
      // In partial search, HIGH is capped to MEDIUM
      expect(result.confidence).toBe('MEDIUM');
      expect(result.evidenceStrength).toBe(EVIDENCE_STRENGTH.SUFFICIENT_EVIDENCE);
    });
  });

  describe('5. Citation Validation', () => {
    test('allows valid citations matching retrieved sources', () => {
      const retrieved = [
        { claimId: 'src_1', sources: [{ url: 'https://noaa.gov/data' }] },
      ];
      const citations = [
        { claimId: 'src_1', url: 'https://noaa.gov/data', organization: 'NOAA' },
      ];

      const res = CitationValidator.validate(citations, retrieved);
      expect(res.valid).toBe(true);
      expect(res.validatedCitations.length).toBe(1);
    });

    test('rejects unretrieved fabricated citations', () => {
      const retrieved = [
        { claimId: 'src_1', sources: [{ url: 'https://noaa.gov/data' }] },
      ];
      const fakeCitations = [
        { claimId: 'fake_99', url: 'https://fake-blog-news.com/hoax', organization: 'Fake' },
      ];

      const res = CitationValidator.validate(fakeCitations, retrieved);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Un-retrieved citation URL hallucination');
    });
  });
});
