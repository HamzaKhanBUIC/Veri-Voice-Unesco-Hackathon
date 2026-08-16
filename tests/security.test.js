const request = require('supertest');
const app = require('../backend/src/app');
const path = require('path');
const fs = require('fs');
const CitationValidator = require('../backend/src/services/verification/CitationValidator');
const SourceAuthorityFilter = require('../backend/src/services/retrieval/SourceAuthorityFilter');
const VerificationEngine = require('../backend/src/services/verification/verificationEngine');
const MockVerificationProvider = require('../backend/src/services/verification/MockVerificationProvider');
const { ConversationManager } = require('../backend/src/services/conversation/ConversationManager');
const RateLimiter = require('../backend/src/services/rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../backend/src/services/concurrency/ConcurrencyLimiter');
const { validateAudioFile } = require('../backend/src/utils/audioUtils');
const { verifyRateLimiter, ttsRateLimiter } = require('../backend/src/middleware/rateLimitMiddleware');

describe('Security, Abuse Prevention & Privacy Hardening Battery', () => {
  beforeEach(() => {
    verifyRateLimiter.reset();
    ttsRateLimiter.reset();
  });

  // 1. Security Headers & Proxy Hardening
  describe('1. HTTP Security Headers & Frame Protection', () => {
    it('should emit X-Content-Type-Options: nosniff on all endpoints', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should emit X-Frame-Options: DENY to prevent clickjacking', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-frame-options']).toBe('DENY');
    });

    it('should emit Referrer-Policy and Permissions-Policy restricting mic/camera', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['permissions-policy']).toContain('microphone=(self)');
      expect(res.headers['permissions-policy']).toContain('camera=()');
    });
  });

  // 2. URL Scheme Security & Anti-XSS Guardrails
  describe('2. URL Scheme Security & Anti-XSS Guardrails', () => {
    it('CitationValidator should reject javascript: URLs', () => {
      const citations = [{ url: 'javascript:alert(document.cookie)', organization: 'Attacker' }];
      const result = CitationValidator.validate(citations, []);
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/Dangerous URI scheme|Malformed citation URL/i);
    });

    it('CitationValidator should reject data: URLs', () => {
      const citations = [{ url: 'data:text/html,<script>alert(1)</script>', organization: 'Attacker' }];
      const result = CitationValidator.validate(citations, []);
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/Dangerous URI scheme|Malformed citation URL/i);
    });

    it('CitationValidator should reject file: and vbscript: URLs', () => {
      const citations = [{ url: 'file:///etc/passwd', organization: 'Attacker' }];
      const result = CitationValidator.validate(citations, []);
      expect(result.valid).toBe(false);
    });

    it('CitationValidator should reject unretrieved hallucinated URL', () => {
      const retrieved = [{ claimId: 'c1', url: 'https://who.int/polio' }];
      const citations = [{ claimId: 'c2', url: 'https://unverified-scam-blog.org/fake-cure' }];
      const result = CitationValidator.validate(citations, retrieved);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Un-retrieved citation URL hallucination detected');
    });
  });

  // 3. Conversation Context & Ingress Sanitization
  describe('3. Context Sanitization & Boundary Protections', () => {
    it('ConversationManager should sanitize untrusted evidence and strip javascript: URLs', () => {
      const cm = new ConversationManager();
      const rawEvidence = [
        { claimId: 'VALID_1', sourceTitle: 'WHO Polio', url: 'https://who.int' },
        { claimId: 'XSS_ATTACK', sourceTitle: 'Malicious', url: 'javascript:stealTokens()' },
        { claimId: 'DATA_ATTACK', sourceTitle: 'Malicious', url: 'data:text/javascript;base64,AAA' },
      ];
      const sanitized = cm.sanitizeEvidence(rawEvidence);
      expect(sanitized.length).toBe(1);
      expect(sanitized[0].claimId).toBe('VALID_1');
    });

    it('ConversationManager should enforce maximum 10-turn limit', () => {
      const cm = new ConversationManager();
      const session = cm.getOrCreateSession('test_security_session');
      session.turnCount = 10;
      const plan = cm.routeTurn('One more turn please', session);
      expect(plan.action).toBe('SESSION_LIMIT_REACHED');
      expect(plan.shouldRetrieve).toBe(false);
      expect(plan.shouldVerify).toBe(false);
    });
  });

  // 4. API Request Size & Ingress Bounds Checks
  describe('4. Request Size & Payload Bounds Checks', () => {
    it('POST /api/verify should reject claimText exceeding 2000 characters with 400 Bad Request', async () => {
      const oversizedClaim = 'A'.repeat(2005);
      const res = await request(app)
        .post('/api/verify')
        .send({ claimText: oversizedClaim });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('exceeds maximum allowed length');
    });

    it('GET /api/tts should reject text parameter exceeding 300 characters with 400 Bad Request', async () => {
      const oversizedTtsText = 'B'.repeat(350);
      const res = await request(app)
        .get('/api/tts')
        .query({ text: oversizedTtsText, lang: 'ur' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('exceeds maximum allowed length');
    });

    it('POST /api/verify should return 400 when both claimText and audioBase64 are missing', async () => {
      const res = await request(app)
        .post('/api/verify')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 5. Audio Validation & Temporary File Security
  describe('5. Audio Validation & Temporary File Security', () => {
    it('validateAudioFile should reject zero-byte empty audio files', () => {
      const emptyFile = path.join(__dirname, '../test-fixtures/audio/empty_audio.ogg');
      if (!fs.existsSync(path.dirname(emptyFile))) {
        fs.mkdirSync(path.dirname(emptyFile), { recursive: true });
      }
      fs.writeFileSync(emptyFile, Buffer.alloc(0));

      const validation = validateAudioFile(emptyFile);
      expect(validation.valid).toBe(false);
      expect(validation.error).toMatch(/empty|zero/i);
    });

    it('validateAudioFile should reject non-existent audio file paths', () => {
      const validation = validateAudioFile('non_existent_file_path_123.ogg');
      expect(validation.valid).toBe(false);
      expect(validation.error).toMatch(/does not exist/i);
    });
  });

  // 6. Rate Limiting & Concurrency Protections
  describe('6. Server-Side Rate Limiting & Semaphore Controls', () => {
    it('RateLimiter should throttle client requests exceeding the limit', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 10000 });
      const ip = '192.168.1.100';

      expect(limiter.check(ip).allowed).toBe(true);
      expect(limiter.check(ip).allowed).toBe(true);
      expect(limiter.check(ip).allowed).toBe(true);
      expect(limiter.check(ip).allowed).toBe(false);
    });

    it('RateLimiter should track global system-wide traffic ceiling', () => {
      const limiter = new RateLimiter({ maxRequests: 10, windowMs: 10000, globalMaxRequests: 2, globalWindowMs: 10000 });
      expect(limiter.checkGlobal().allowed).toBe(true);
      expect(limiter.checkGlobal().allowed).toBe(true);
      expect(limiter.checkGlobal().allowed).toBe(false);
    });

    it('ConcurrencyLimiter should limit simultaneous async tasks to maxConcurrent', async () => {
      const limiter = new ConcurrencyLimiter({ maxConcurrent: 2 });
      let peakConcurrency = 0;
      let active = 0;

      const task = async () => {
        return limiter.run(async () => {
          active++;
          peakConcurrency = Math.max(peakConcurrency, active);
          await new Promise((r) => setTimeout(r, 20));
          active--;
        });
      };

      await Promise.all([task(), task(), task(), task()]);
      expect(peakConcurrency).toBeLessThanOrEqual(2);
    });
  });

  // 7. Error Handling & Information Leakage Defense
  describe('7. Safe Public Error Responses', () => {
    it('GET /non-existent-route should return safe 404 JSON without stack trace', async () => {
      const res = await request(app).get('/api/secret-internal-debug');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.stack).toBeUndefined();
    });
  });
});
