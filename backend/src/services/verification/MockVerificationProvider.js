const VerificationProvider = require('./VerificationProvider');

/**
 * Isolated MockVerificationProvider for deterministic automated unit & adversarial tests.
 */
class MockVerificationProvider extends VerificationProvider {
  constructor(options = {}) {
    super('MockVerificationProvider');
    this.shouldFail = options.shouldFail || false;
    this.failureMessage = options.failureMessage || 'Mock Verification Provider Error';
    this.mockResponse = options.mockResponse || null;
    this.returnMalformedJson = options.returnMalformedJson || false;
    this.returnInvalidVerdict = options.returnInvalidVerdict || false;
    this.returnFabricatedEvidenceId = options.returnFabricatedEvidenceId || false;
  }

  async verify(userClaim, evidenceMatches, options = {}) {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    if (this.returnMalformedJson) {
      return '{ "verdict": "TRUE", "confidence": 0.9, explanation: UNCLOSED_JSON_STRING...';
    }

    if (this.returnInvalidVerdict) {
      return JSON.stringify({
        verdict: 'PROBABLY_TRUE',
        confidence: 0.8,
        explanation: 'Invalid verdict string test',
        evidence: [],
      });
    }

    if (this.returnFabricatedEvidenceId) {
      return JSON.stringify({
        verdict: 'TRUE',
        confidence: 0.9,
        explanation: 'Fabricated evidence ID test',
        evidence: [
          {
            claimId: 'FABRICATED_CLAIM_ID_9999',
            sourceTitle: 'Invented Source',
            organization: 'Fake Org',
            url: 'https://example.org/fake',
          },
        ],
      });
    }

    if (this.mockResponse) {
      return typeof this.mockResponse === 'object'
        ? JSON.stringify(this.mockResponse)
        : this.mockResponse;
    }

    // Default evidence-grounded logic for mock test execution:
    if (!evidenceMatches || evidenceMatches.length === 0) {
      return JSON.stringify({
        verdict: 'UNCERTAIN',
        confidence: 0.0,
        explanation: 'اس دعوے کے لیے کوئی معتبر مواد موجود نہیں ہے۔',
        evidence: [],
      });
    }

    const topMatch = evidenceMatches[0];

    return JSON.stringify({
      verdict: options.mode === 'GENERAL_RESEARCH' ? 'RESEARCH_RESPONSE' : (topMatch.verdict || 'TRUE'),
      confidence: 0.95,
      explanation: topMatch.explanation || 'طبی تصدیق شدہ معلومات۔',
      evidence: [
        {
          claimId: topMatch.claimId,
          sourceTitle: topMatch.sources?.[0]?.title || 'Authoritative Source',
          organization: topMatch.sources?.[0]?.organization || 'Health Organization',
          url: topMatch.sources?.[0]?.url || 'https://www.who.int',
        },
      ],
    });
  }
}

module.exports = MockVerificationProvider;
