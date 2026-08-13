const { EvidenceEvaluator, EVIDENCE_STRENGTH } = require('../backend/src/services/verification/EvidenceEvaluator');

describe('EvidenceEvaluator Unit Tests', () => {
  it('should return NO_EVIDENCE when matches array is empty', () => {
    const res = EvidenceEvaluator.evaluate([]);
    expect(res.evidenceStrength).toBe(EVIDENCE_STRENGTH.NO_EVIDENCE);
    expect(res.confidence).toBe('LOW');
  });

  it('should return STRONG_EVIDENCE when multiple primary sources are present', () => {
    const matches = [
      { url: 'https://www.nasa.gov/earth', authorityLevel: 'PRIMARY_AUTHORITY' },
      { url: 'https://www.usgs.gov/earth', authorityLevel: 'PRIMARY_AUTHORITY' },
    ];
    const res = EvidenceEvaluator.evaluate(matches);
    expect(res.evidenceStrength).toBe(EVIDENCE_STRENGTH.STRONG_EVIDENCE);
    expect(res.confidence).toBe('HIGH');
  });
});
