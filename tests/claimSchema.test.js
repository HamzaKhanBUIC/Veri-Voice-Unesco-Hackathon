const { validateClaim, validateClaimsDataset } = require('../backend/src/models/claimSchema');

describe('Milestone 2 — Claim Schema & Source Validation', () => {
  const validClaim = {
    id: 'claim-test-001',
    language: 'ur',
    claim: 'ٹیسٹ طبی دعویٰ',
    verdict: 'TRUE',
    explanation: 'تفصیلی طبی وضاحت',
    keywords: ['ٹیسٹ', 'طبی'],
    sources: [
      {
        title: 'WHO Health Report',
        organization: 'World Health Organization',
        url: 'https://www.who.int/report',
        accessedAt: '2026-08-10',
      },
    ],
  };

  it('should validate a complete valid claim object', () => {
    const result = validateClaim(validClaim);
    expect(result.valid).toBe(true);
    expect(result.data.id).toBe('claim-test-001');
    expect(result.data.verdict).toBe('TRUE');
  });

  it('should reject a claim missing an ID', () => {
    const invalid = { ...validClaim, id: '' };
    const result = validateClaim(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Claim ID is required'))).toBe(true);
  });

  it('should reject an invalid verdict enum value', () => {
    const invalid = { ...validClaim, verdict: 'INVALID_VERDICT' };
    const result = validateClaim(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Verdict must be one of'))).toBe(true);
  });

  it('should reject a claim missing sources', () => {
    const invalid = { ...validClaim, sources: [] };
    const result = validateClaim(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('At least one source citation is required'))).toBe(true);
  });

  it('should reject a source with an invalid URL', () => {
    const invalid = {
      ...validClaim,
      sources: [
        {
          title: 'Title',
          organization: 'Org',
          url: 'invalid-url-string',
        },
      ],
    };
    const result = validateClaim(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('valid HTTP/HTTPS URL'))).toBe(true);
  });

  it('should validate a list of claim objects', () => {
    const dataset = [validClaim];
    const result = validateClaimsDataset(dataset);
    expect(result.valid).toBe(true);
    expect(result.data.length).toBe(1);
  });
});
