const VerificationEngine = require('../backend/src/services/verification/verificationEngine');
const MockVerificationProvider = require('../backend/src/services/verification/MockVerificationProvider');

describe('Milestone 3 — Verification Engine & Safety Guardrails', () => {
  const sampleCandidateMatches = [
    {
      claimId: 'fixture-earth-001',
      claim: 'زمین سورج کے گرد 365 دن میں ایک چکر پورا کرتی ہے۔',
      verdict: 'TRUE',
      explanation: 'سائنسی معلومات کے مطابق زمین کا مدار بیضوی ہے۔',
      sources: [
        {
          title: 'Solar System Data',
          organization: 'Test Space Agency',
          url: 'https://example.org/space',
          authorityLevel: 'PRIMARY_AUTHORITY',
        },
      ],
    },
  ];

  describe('Deterministic Pre-Check (No Evidence Path)', () => {
    it('should skip LLM execution and return UNCERTAIN when 0 evidence matches exist', async () => {
      let providerInvoked = false;
      const customProvider = {
        name: 'SpyProvider',
        verify: async () => {
          providerInvoked = true;
          return { verdict: 'TRUE', confidence: 0.9, explanation: 'LLM generated without evidence' };
        },
      };

      const engine = new VerificationEngine({ provider: customProvider });
      const result = await engine.verifyClaim('کسی بھی سوال کا دعویٰ', []);

      expect(providerInvoked).toBe(false);
      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('NO_EVIDENCE');
      expect(result.confidence).toBeDefined();
    });
  });

  describe('Verdict Semantics (TRUE, FALSE, MIXED, UNCERTAIN)', () => {
    it('should return TRUE when evidence supports claim', async () => {
      const provider = new MockVerificationProvider({
        mockResponse: {
          verdict: 'TRUE',
          confidence: 0.95,
          explanation: 'دعوے کی طبی تصدیق ہو گئی ہے۔',
          evidence: [
            {
              claimId: 'fixture-earth-001',
              sourceTitle: 'Solar System Data',
              organization: 'Test Space Agency',
              url: 'https://example.org/space',
            },
          ],
        },
      });

      const engine = new VerificationEngine({ provider });
      const result = await engine.verifyClaim('زمین سورج کے گرد گردش کرتی ہے', sampleCandidateMatches);

      expect(result.verdict).toBe('TRUE');
      expect(result.confidence).toBe('HIGH');
      expect(result.evidence.length).toBe(1);
    });

    it('should return FALSE when evidence contradicts claim', async () => {
      const provider = new MockVerificationProvider({
        mockResponse: {
          verdict: 'FALSE',
          confidence: 0.98,
          explanation: 'دعوے کی طبی نفی کی جاتی ہے۔',
          evidence: [
            {
              claimId: 'fixture-earth-001',
              sourceTitle: 'Solar System Data',
              organization: 'Test Space Agency',
              url: 'https://example.org/space',
            },
          ],
        },
      });

      const engine = new VerificationEngine({ provider });
      const result = await engine.verifyClaim('چاند پنیر کا بنا ہے', sampleCandidateMatches);

      expect(result.verdict).toBe('FALSE');
      expect(result.confidence).toBe('HIGH');
    });

    it('should return MIXED when evidence partially supports and qualifies claim', async () => {
      const provider = new MockVerificationProvider({
        mockResponse: {
          verdict: 'MIXED',
          confidence: 0.85,
          explanation: 'دعوے کا کچھ حصہ درست ہے جبکہ دیگر اہم شرائط موجود ہیں۔',
          evidence: [
            {
              claimId: 'fixture-earth-001',
              sourceTitle: 'Solar System Data',
              organization: 'Test Space Agency',
              url: 'https://example.org/space',
            },
          ],
        },
      });

      const engine = new VerificationEngine({ provider });
      const result = await engine.verifyClaim('مخلوط دعویٰ', sampleCandidateMatches);

      expect(result.verdict).toBe('MIXED');
      expect(result.confidence).toBe('HIGH');
    });

    it('should return UNCERTAIN when evidence is insufficient or contradictory', async () => {
      const provider = new MockVerificationProvider({
        mockResponse: {
          verdict: 'UNCERTAIN',
          confidence: 0.2,
          explanation: 'دستیاب شواہد حتمی فیصلے کے لیے کافی نہیں ہیں۔',
          evidence: [],
        },
      });

      const engine = new VerificationEngine({ provider });
      const result = await engine.verifyClaim('مشکوک دعویٰ', sampleCandidateMatches);

      expect(result.verdict).toBe('UNCERTAIN');
    });
  });

  describe('Adversarial Security & Attack Immunity Tests', () => {
    it('Attack 1 (Malformed JSON): Malformed LLM JSON string MUST return UNCERTAIN fallback', async () => {
      const engine = new VerificationEngine({
        provider: {
          name: 'MalformedProvider',
          verify: async () => 'INVALID_JSON_{{verdict: TRUE}',
        },
      });

      const result = await engine.verifyClaim('ٹیسٹ', sampleCandidateMatches);

      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('INVALID_MODEL_OUTPUT');
    });

    it('Attack 2 (Schema Violation): Invalid Zod verdict string MUST return UNCERTAIN fallback', async () => {
      const engine = new VerificationEngine({
        provider: {
          name: 'InvalidSchemaProvider',
          verify: async () => JSON.stringify({ verdict: 'MOSTLY_TRUE', confidence: 0.9, explanation: 'Bad schema' }),
        },
      });

      const result = await engine.verifyClaim('ٹیسٹ', sampleCandidateMatches);

      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('INVALID_MODEL_OUTPUT');
    });

    it('Attack 3 (Citation Hallucination): Evidence ID not in candidate list MUST return UNCERTAIN fallback', async () => {
      const engine = new VerificationEngine({
        provider: {
          name: 'HallucinatingProvider',
          verify: async () => JSON.stringify({
            verdict: 'TRUE',
            confidence: 0.95,
            explanation: 'Fake evidence citation',
            evidence: [{ claimId: 'FABRICATED_CLAIM_ID_9999', claimText: 'Fake text', sourceTitle: 'Fake', url: 'https://fake.org' }],
          }),
        },
      });

      const result = await engine.verifyClaim('ٹیسٹ', sampleCandidateMatches);

      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('INVALID_EVIDENCE_REFERENCE');
    });

    it('Attack 4 (Provider Exception): Provider network crash MUST return UNCERTAIN fallback', async () => {
      const engine = new VerificationEngine({
        provider: {
          name: 'CrashingProvider',
          verify: async () => {
            throw new Error('API Request Timeout (504)');
          },
        },
      });

      const result = await engine.verifyClaim('ٹیسٹ', sampleCandidateMatches);

      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('PROVIDER_ERROR');
    });

    it('Attack 5 (High Confidence Zero Evidence): verdict !== UNCERTAIN with 0 evidence citations MUST be forced to UNCERTAIN', async () => {
      const engine = new VerificationEngine({
        provider: {
          name: 'UngroundedProvider',
          verify: async () => JSON.stringify({
            verdict: 'TRUE',
            confidence: 0.99,
            explanation: 'Claim is true but zero evidence cited',
            evidence: [],
          }),
        },
      });

      const result = await engine.verifyClaim('ٹیسٹ', sampleCandidateMatches);

      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('INSUFFICIENT_EVIDENCE');
    });
  });
});
