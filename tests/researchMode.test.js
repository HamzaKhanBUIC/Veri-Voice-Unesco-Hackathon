const VerificationEngine = require('../backend/src/services/verification/verificationEngine');
const MockVerificationProvider = require('../backend/src/services/verification/MockVerificationProvider');

describe('General Research Mode Unit Tests', () => {
  it('should process general research question without forcing TRUE/FALSE verdict', async () => {
    const engine = new VerificationEngine({ provider: new MockVerificationProvider() });
    const matches = [
      {
        claimId: 'CLAIM_001',
        claim: 'Penicillin was discovered by Alexander Fleming in 1928.',
        verdict: 'TRUE',
        explanation: 'Alexander Fleming discovered penicillin in 1928 at St Mary Hospital.',
        sources: [{ title: 'History of Medicine', url: 'https://www.who.int', organization: 'WHO' }],
      },
    ];

    const result = await engine.verifyClaim('Who discovered penicillin?', matches, { mode: 'GENERAL_RESEARCH' });

    expect(result.mode).toBe('GENERAL_RESEARCH');
    expect(result.verdict).toBe('RESEARCH_RESPONSE');
    expect(result.explanation).toBeDefined();
    expect(result.sources.length).toBeGreaterThan(0);
  });
});
