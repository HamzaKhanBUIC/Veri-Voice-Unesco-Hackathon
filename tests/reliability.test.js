const RateLimiter = require('../backend/src/services/rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../backend/src/services/concurrency/ConcurrencyLimiter');
const { EvidenceEvaluator } = require('../backend/src/services/verification/EvidenceEvaluator');
const VerificationEngine = require('../backend/src/services/verification/verificationEngine');
const RetrievalService = require('../backend/src/services/retrieval/retrievalService');
const StandalonePipeline = require('../backend/src/services/pipeline/standalonePipeline');
const DiscordService = require('../backend/src/services/discord/DiscordService');

describe('VeriVoice Reliability Controls & Stress Resilience Suite', () => {
  describe('CR-2: RateLimiter Sliding-Window Protection', () => {
    it('should allow up to maxRequests within window and block excessive spam', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
      const userId = 'spam_user_123';

      expect(limiter.check(userId).allowed).toBe(true);
      expect(limiter.check(userId).allowed).toBe(true);
      expect(limiter.check(userId).allowed).toBe(true);

      // 4th request must be blocked
      const blocked = limiter.check(userId);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
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

      // Launch 5 tasks concurrently
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

  describe('CR-1: Search Infrastructure Failure Distinction', () => {
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
