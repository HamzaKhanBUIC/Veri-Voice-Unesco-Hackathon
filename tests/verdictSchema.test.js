const { validateVerdict } = require('../backend/src/models/verdictSchema');

describe('Milestone 3 — Verdict Schema Validation', () => {
  const validVerdict = {
    verdict: 'TRUE',
    confidence: 0.95,
    explanation: 'طبی تصدیق شدہ معلومات۔',
    evidence: [
      {
        claimId: 'fixture-earth-001',
        sourceTitle: 'Astronomy Data',
        organization: 'Space Agency',
        url: 'https://example.org/astronomy',
      },
    ],
    reason: 'EVIDENCE_GROUNDED',
  };

  it('should validate a complete valid verdict payload', () => {
    const result = validateVerdict(validVerdict);
    expect(result.valid).toBe(true);
    expect(result.data.verdict).toBe('TRUE');
    expect(result.data.confidence).toBe(0.95);
  });

  it('should accept all 4 canonical verdict enums (TRUE, FALSE, MIXED, UNCERTAIN)', () => {
    ['TRUE', 'FALSE', 'MIXED', 'UNCERTAIN'].forEach((v) => {
      const result = validateVerdict({ ...validVerdict, verdict: v });
      expect(result.valid).toBe(true);
    });
  });

  it('should reject an invalid verdict string', () => {
    const invalid = { ...validVerdict, verdict: 'PROBABLY_TRUE' };
    const result = validateVerdict(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Verdict must be one of'))).toBe(true);
  });

  it('should reject confidence less than 0.0 or greater than 1.0', () => {
    const low = validateVerdict({ ...validVerdict, confidence: -0.1 });
    const high = validateVerdict({ ...validVerdict, confidence: 1.5 });

    expect(low.valid).toBe(false);
    expect(high.valid).toBe(false);
  });

  it('should reject an invalid URL in evidence item', () => {
    const invalid = {
      ...validVerdict,
      evidence: [
        {
          claimId: 'claim-1',
          url: 'not-a-valid-url-string',
        },
      ],
    };
    const result = validateVerdict(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('valid HTTP/HTTPS URL'))).toBe(true);
  });
});
