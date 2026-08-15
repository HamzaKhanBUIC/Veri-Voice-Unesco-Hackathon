const CitationValidator = require('../backend/src/services/verification/CitationValidator');
const SourceAuthorityFilter = require('../backend/src/services/retrieval/SourceAuthorityFilter');

describe('Citation Integrity & Source Authority Classification Unit Tests', () => {
  const mockRetrievedMatches = [
    {
      claimId: 'WHO_POLIO_001',
      claim: 'Polio vaccine safety',
      url: 'https://www.who.int/news-room/fact-sheets/detail/poliomyelitis',
      sources: [
        {
          title: 'WHO Poliomyelitis Factsheet',
          organization: 'World Health Organization',
          url: 'https://www.who.int/news-room/fact-sheets/detail/poliomyelitis',
        },
      ],
    },
  ];

  describe('Citation Validation', () => {
    it('should validate citation present in retrieved evidence set', () => {
      const citations = [
        {
          claimId: 'WHO_POLIO_001',
          sourceTitle: 'WHO Poliomyelitis Factsheet',
          organization: 'WHO',
          url: 'https://www.who.int/news-room/fact-sheets/detail/poliomyelitis',
        },
      ];

      const res = CitationValidator.validate(citations, mockRetrievedMatches);
      expect(res.valid).toBe(true);
      expect(res.validatedCitations.length).toBe(1);
    });

    it('should reject fabricated URL citation not present in retrieved set', () => {
      const fabricatedCitations = [
        {
          claimId: 'WHO_POLIO_001',
          url: 'https://www.fake-medical-scam-site.com/fake-news',
        },
      ];

      const res = CitationValidator.validate(fabricatedCitations, mockRetrievedMatches);
      expect(res.valid).toBe(false);
      expect(res.reason).toMatch(/hallucination detected/i);
    });

    it('should reject malformed URL string', () => {
      const malformedCitations = [{ url: 'not-a-valid-url' }];
      const res = CitationValidator.validate(malformedCitations, mockRetrievedMatches);
      expect(res.valid).toBe(false);
      expect(res.reason).toMatch(/malformed citation url/i);
    });
  });

  describe('Source Authority Classification', () => {
    it('should classify WHO domain as PRIMARY_INSTITUTIONAL', () => {
      const auth = SourceAuthorityFilter.classifyAuthority('https://www.who.int/health-topics', 'World Health Organization');
      expect(auth).toBe('PRIMARY_INSTITUTIONAL');
      expect(SourceAuthorityFilter.isPrimaryTier(auth)).toBe(true);
    });

    it('should classify PAHO domain as PRIMARY_INSTITUTIONAL', () => {
      const auth = SourceAuthorityFilter.classifyAuthority('https://www.paho.org/en/topics', 'PAHO');
      expect(auth).toBe('PRIMARY_INSTITUTIONAL');
      expect(SourceAuthorityFilter.isPrimaryTier(auth)).toBe(true);
    });

    it('should classify Reuters as FACT_CHECKING_ORGANIZATION', () => {
      const auth = SourceAuthorityFilter.classifyAuthority('https://www.reuters.com/world/news', 'Reuters');
      expect(auth).toBe('FACT_CHECKING_ORGANIZATION');
    });

    it('should classify unknown blog domain as GENERAL_WEB', () => {
      const auth = SourceAuthorityFilter.classifyAuthority('https://some-random-blog.com/post', 'Random Blog');
      expect(auth).toBe('GENERAL_WEB');
    });
  });
});
