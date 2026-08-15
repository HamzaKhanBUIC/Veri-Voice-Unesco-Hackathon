const RateLimiter = require('../backend/src/services/rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../backend/src/services/concurrency/ConcurrencyLimiter');
const { EvidenceEvaluator } = require('../backend/src/services/verification/EvidenceEvaluator');
const VerificationEngine = require('../backend/src/services/verification/verificationEngine');
const StandalonePipeline = require('../backend/src/services/pipeline/standalonePipeline');

describe('VeriVoice Reliability Controls & Stress Resilience Suite', () => {
  jest.setTimeout(25000);
  describe('CR-2: RateLimiter Per-User & Global Protection', () => {
    it('should allow up to maxRequests per user and block excessive spam', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
      const userId = 'spam_user_123';

      expect(limiter.check(userId).allowed).toBe(true);
      expect(limiter.check(userId).allowed).toBe(true);
      expect(limiter.check(userId).allowed).toBe(true);

      const blocked = limiter.check(userId);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });

    it('should enforce GLOBAL_REQUEST_LIMIT (20 req / 60s) across all users', () => {
      const limiter = new RateLimiter({ globalMaxRequests: 3, globalWindowMs: 1000 });

      expect(limiter.checkGlobal().allowed).toBe(true);
      expect(limiter.checkGlobal().allowed).toBe(true);
      expect(limiter.checkGlobal().allowed).toBe(true);

      const globalBlocked = limiter.checkGlobal();
      expect(globalBlocked.allowed).toBe(false);
      expect(globalBlocked.resetMs).toBeGreaterThan(0);
    });
  });

  describe('HR-2: ConcurrencyLimiter Semaphore', () => {
    it('should limit active concurrent executions to maxConcurrent limit', async () => {
      const limiter = new ConcurrencyLimiter({ maxConcurrent: 2 });
      let activeTasks = 0;
      let maxObservedActive = 0;

      const mockTask = async () => {
        return await limiter.run(async () => {
          activeTasks++;
          maxObservedActive = Math.max(maxObservedActive, activeTasks);
          await new Promise((resolve) => setTimeout(resolve, 50));
          activeTasks--;
          return 'done';
        });
      };

      const results = await Promise.all([
        mockTask(),
        mockTask(),
        mockTask(),
        mockTask(),
        mockTask(),
      ]);

      expect(results).toEqual(['done', 'done', 'done', 'done', 'done']);
      expect(maxObservedActive).toBeLessThanOrEqual(2);
    });
  });

  describe('CR-1 & SEARCH_PARTIAL Confidence Bounding', () => {
    it('should return SEARCH_INFRASTRUCTURE_FAILURE when searchStatus is SEARCH_TIMEOUT', async () => {
      const engine = new VerificationEngine();
      const result = await engine.verifyClaim('Is Earth flat.', [], {
        searchStatus: 'SEARCH_TIMEOUT',
      });

      expect(result.verdict).toBe('UNCERTAIN');
      expect(result.reason).toBe('SEARCH_INFRASTRUCTURE_FAILURE');
      expect(result.evidenceStrength).toBe('INFRASTRUCTURE_FAILURE');
      expect(result.explanation).toContain('temporary network timeout');
    });

    it('should cap confidence to MEDIUM when searchStatus is SEARCH_PARTIAL', () => {
      const matches = [
        {
          claimId: 'W1',
          claim: 'Test claim',
          explanation: 'Explanation snippet',
          authorityLevel: 'PRIMARY_AUTHORITY',
          url: 'https://nasa.gov/1',
          sources: [{ domain: 'nasa.gov', authorityLevel: 'PRIMARY_AUTHORITY' }],
        },
        {
          claimId: 'W2',
          claim: 'Test claim 2',
          explanation: 'Explanation snippet 2',
          authorityLevel: 'PRIMARY_AUTHORITY',
          url: 'https://nasa.gov/2',
          sources: [{ domain: 'nasa.gov', authorityLevel: 'PRIMARY_AUTHORITY' }],
        },
      ];

      const evalFull = EvidenceEvaluator.evaluate(matches, { searchStatus: 'SEARCH_SUCCESS' });
      expect(evalFull.confidence).toBe('HIGH');

      const evalPartial = EvidenceEvaluator.evaluate(matches, { searchStatus: 'SEARCH_PARTIAL' });
      expect(evalPartial.confidence).toBe('MEDIUM');
    });
  });

  describe('Source Independence & Syndication Deduplication', () => {
    it('should deduplicate near-identical syndicated news wire articles', () => {
      const syndicatedMatches = [
        {
          claimId: 'NEWS_1',
          claim: 'Earth is spherical',
          explanation: 'Official NASA scientific measurement proves Earth is an oblate spheroid.',
          url: 'https://news1.com/earth',
        },
        {
          claimId: 'NEWS_2',
          claim: 'Earth is spherical',
          explanation: 'Official NASA scientific measurement proves Earth is an oblate spheroid.',
          url: 'https://news2.com/earth',
        },
        {
          claimId: 'NEWS_3',
          claim: 'Earth is spherical',
          explanation: 'Official NASA scientific measurement proves Earth is an oblate spheroid.',
          url: 'https://news3.com/earth',
        },
      ];

      const deduplicated = EvidenceEvaluator.deduplicateMatches(syndicatedMatches);
      expect(deduplicated.length).toBe(1);
    });
  });

  describe('Request Correlation Tracking (requestId)', () => {
    it('should attach unique requestId to pipeline execution results', async () => {
      const mockSpeech = {
        transcribe: jest.fn().mockResolvedValue({ text: 'Is Earth flat.', language: 'en' }),
      };
      const mockTts = {
        synthesize: jest.fn().mockResolvedValue({ outputPath: '/tmp/out.mp3' }),
      };
      const mockVerification = {
        verifyClaim: jest.fn().mockResolvedValue({
          verdict: 'FALSE',
          confidence: 'HIGH',
          explanation: 'Earth is spherical',
          languageMetadata: { detectedLanguage: 'en' },
        }),
      };

      const pipeline = new StandalonePipeline({
        speechProvider: mockSpeech,
        ttsProvider: mockTts,
        verificationEngine: mockVerification,
      });

      const fs = require('fs');
      const path = require('path');
      const tmpAudio = path.join(process.cwd(), 'backend', 'tmp', `test_req_${Date.now()}.ogg`);
      fs.writeFileSync(tmpAudio, Buffer.from('OggS_MOCK_AUDIO_DATA'));

      const res = await pipeline.processAudio(tmpAudio, null, { requestId: 'req_test_999' });

      expect(res.success).toBe(true);
      expect(res.requestId).toBe('req_test_999');

      if (fs.existsSync(tmpAudio)) fs.unlinkSync(tmpAudio);
    });
  });
});
