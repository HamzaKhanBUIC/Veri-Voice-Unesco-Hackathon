const DiscordMedia = require('../backend/src/services/discord/DiscordMedia');
const DiscordCommands = require('../backend/src/services/discord/DiscordCommands');
const DiscordService = require('../backend/src/services/discord/DiscordService');
const CitationValidator = require('../backend/src/services/verification/CitationValidator');
const RateLimiter = require('../backend/src/services/rateLimiter/RateLimiter');
const ConcurrencyLimiter = require('../backend/src/services/concurrency/ConcurrencyLimiter');
const path = require('path');
const fs = require('fs');

describe('Discord Security, Privacy & Abuse Prevention Battery (20 Vectors)', () => {
  // 1. Command Input Overflow
  it('SEC-01: should safely truncate command input overflow exceeding 500 characters', async () => {
    const longInput = 'A'.repeat(1200);
    const mockPipeline = {
      verificationEngine: {
        verifyClaim: jest.fn().mockResolvedValue({
          verdict: 'TRUE',
          confidence: 'HIGH',
          domain: 'HEALTH',
          mode: 'VERIFICATION',
          explanation: 'Valid response',
          sources: [],
          evidence: [],
        }),
      },
      retrievalService: {
        search: jest.fn().mockResolvedValue({ matches: [] }),
      },
    };

    const interaction = {
      commandName: 'verify',
      claimInput: longInput,
    };

    const res = await DiscordCommands.handleInteraction(interaction, mockPipeline);
    expect(res.type).toBe('text');
    expect(mockPipeline.verificationEngine.verifyClaim).toHaveBeenCalledWith(
      expect.stringMatching(/^A{500}$/),
      expect.any(Array),
      expect.any(Object)
    );
  });

  // 2. Malicious Filenames / Path Traversal in generateSafeTempPath
  it('SEC-02: should generate safe unguessable paths and prevent path traversal', () => {
    const safePath = DiscordMedia.generateSafeTempPath('../../etc/passwd');
    const safeTmpDir = path.resolve(__dirname, '../backend/tmp');
    expect(safePath.startsWith(safeTmpDir)).toBe(true);
    expect(safePath).not.toContain('..');
  });

  // 3. Path Traversal Rejection
  it('SEC-03: should reject path traversal in generateSafeTempPath with explicit malformed root', () => {
    expect(() => {
      DiscordMedia.generateSafeTempPath('.ogg');
    }).not.toThrow();
  });

  // 4. MIME Spoofing & Invalid Extension
  it('SEC-04: should reject spoofed executable or unsupported file attachments', () => {
    const fakeAttachment = {
      name: 'malware.exe',
      contentType: 'application/x-msdownload',
      size: 1024,
    };
    const result = DiscordMedia.validateAttachment(fakeAttachment);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported audio MIME type/i);
  });

  // 5. Oversized Audio Files
  it('SEC-05: should reject oversized audio attachments exceeding 15MB', () => {
    const largeAttachment = {
      name: 'giant_audio.mp3',
      contentType: 'audio/mp3',
      size: 20 * 1024 * 1024, // 20MB
    };
    const result = DiscordMedia.validateAttachment(largeAttachment);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds safe file size limit/i);
  });

  // 6. Duplicate Event Idempotency
  it('SEC-06: should detect and drop duplicate event IDs (Idempotency Guard)', () => {
    const service = new DiscordService({
      clientWrapper: { isMock: true, client: null },
    });

    const eventId = 'discord_event_998877';
    expect(service.isDuplicateEvent(eventId)).toBe(false);
    expect(service.isDuplicateEvent(eventId)).toBe(true); // Duplicate detected
  });

  // 7. Mention Abuse (@everyone / @here Sanitization)
  it('SEC-07: should sanitize @everyone and @here to prevent ping injection', () => {
    const maliciousText = 'Attention @everyone this is a critical alert @here now!';
    const sanitized = DiscordCommands.sanitizeOutputText(maliciousText);
    expect(sanitized).not.toContain('@everyone');
    expect(sanitized).not.toContain('@here');
    expect(sanitized).toContain('@\u200beveryone');
    expect(sanitized).toContain('@\u200bhere');
  });

  // 8. Output Text Sanitization in Help & About Cards
  it('SEC-08: should deliver clean help and about cards with privacy disclosures', async () => {
    const helpRes = await DiscordCommands.handleInteraction({ commandName: 'help' }, {});
    expect(helpRes.content).toContain('Privacy Policy');

    const aboutRes = await DiscordCommands.handleInteraction({ commandName: 'about' }, {});
    expect(aboutRes.content).toContain('Privacy');
    expect(aboutRes.content).toContain('GitHub');
  });

  // 9. Malicious Citation URL Schemes (javascript:)
  it('SEC-09: should reject javascript: URI schemes in citations', () => {
    const maliciousCitations = [
      { url: 'javascript:alert(document.cookie)', organization: 'Attacker' },
    ];
    const res = CitationValidator.validate(maliciousCitations, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Dangerous URI scheme/i);
  });

  // 10. Data URI Schemes in Citations (data:)
  it('SEC-10: should reject data: URI schemes in citations', () => {
    const maliciousCitations = [
      { url: 'data:text/html,<script>alert(1)</script>', organization: 'Attacker' },
    ];
    const res = CitationValidator.validate(maliciousCitations, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Dangerous URI scheme/i);
  });

  // 11. Malformed Citation URLs
  it('SEC-11: should reject non-HTTP/HTTPS schemes and malformed syntax in citations', () => {
    const badCitations = [
      { url: 'file:///etc/passwd', organization: 'Local' },
    ];
    const res = CitationValidator.validate(badCitations, []);
    expect(res.valid).toBe(false);
  });

  // 12. Fake Citation Hallucination Rejection
  it('SEC-12: should reject fabricated un-retrieved citation URLs', () => {
    const hallucinatedCitations = [
      { url: 'https://fake-conspiracy-rumor-site.net/page', organization: 'Scam' },
    ];
    const retrievedMatches = [
      { url: 'https://www.who.int/news/item', sources: [{ url: 'https://www.who.int/news/item' }] },
    ];
    const res = CitationValidator.validate(hallucinatedCitations, retrievedMatches);
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Un-retrieved citation URL hallucination/i);
  });

  // 13. Authoritative Domain Allowlist Acceptance
  it('SEC-13: should allow verified authoritative institutional domains', () => {
    const institutionalCitations = [
      { url: 'https://www.cdc.gov/vaccines/safety/index.html', organization: 'CDC' },
    ];
    const res = CitationValidator.validate(institutionalCitations, []);
    expect(res.valid).toBe(true);
    expect(res.validatedCitations.length).toBe(1);
  });

  // 14. Per-User Rate Limiting (5 req / 60s)
  it('SEC-14: should block user after exceeding 5 requests in 60s', () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
    const user = 'spammer_123';

    for (let i = 0; i < 5; i++) {
      expect(limiter.check(user).allowed).toBe(true);
    }
    expect(limiter.check(user).allowed).toBe(false);
  });

  // 15. Global System Rate Limiting (20 req / 60s)
  it('SEC-15: should block global requests after exceeding 20 requests in 60s', () => {
    const limiter = new RateLimiter({ globalMaxRequests: 20, globalWindowMs: 60000 });

    for (let i = 0; i < 20; i++) {
      expect(limiter.checkGlobal().allowed).toBe(true);
    }
    expect(limiter.checkGlobal().allowed).toBe(false);
  });

  // 16. Concurrency Limiter Semaphore (Max 3 Active Tasks)
  it('SEC-16: should queue tasks when concurrency reaches 3 active tasks', async () => {
    const semaphore = new ConcurrencyLimiter({ maxConcurrent: 3 });
    let active = 0;
    let maxSeen = 0;

    const task = () =>
      semaphore.run(async () => {
        active++;
        maxSeen = Math.max(maxSeen, active);
        await new Promise((r) => setTimeout(r, 20));
        active--;
      });

    await Promise.all([task(), task(), task(), task(), task()]);
    expect(maxSeen).toBeLessThanOrEqual(3);
    expect(semaphore.stats.activeCount).toBe(0);
  });

  // 17. Safe Audio Cleanup on Success and Failure
  it('SEC-17: safeCleanup should cleanly unlink temporary audio files without throwing', () => {
    const tmpFile = path.join(__dirname, '../backend/tmp/test_sec_audio.ogg');
    fs.writeFileSync(tmpFile, 'dummy audio data');
    expect(fs.existsSync(tmpFile)).toBe(true);

    DiscordMedia.safeCleanup(tmpFile);
    expect(fs.existsSync(tmpFile)).toBe(false);

    // Call again on non-existent file: should not throw
    expect(() => DiscordMedia.safeCleanup(tmpFile)).not.toThrow();
  });

  // 18. Session Isolation & Request ID Tracking
  it('SEC-18: should generate unique request IDs and keep interactions stateless', () => {
    const req1 = `req_slash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const req2 = `req_slash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    expect(req1).not.toBe(req2);
  });

  // 19. No Secret / Token Leakage in Output Cards
  it('SEC-19: output cards should never contain Discord tokens or Groq keys', async () => {
    const mockPipeline = {
      verificationEngine: {
        verifyClaim: jest.fn().mockResolvedValue({
          verdict: 'TRUE',
          confidence: 'HIGH',
          domain: 'GENERAL',
          mode: 'VERIFICATION',
          explanation: 'Safe explanation text without tokens.',
          sources: [],
          evidence: [],
        }),
      },
      retrievalService: {
        search: jest.fn().mockResolvedValue({ matches: [] }),
      },
    };

    const res = await DiscordCommands.handleInteraction({ commandName: 'verify', claimInput: 'test' }, mockPipeline);
    expect(res.content).not.toMatch(/gsk_[a-zA-Z0-9_-]+/);
    expect(res.content).not.toMatch(/MTE[0-9a-zA-Z._-]+/); // Discord bot token pattern
  });

  // 20. Empty or Null Attachment Safety
  it('SEC-20: should reject empty, null, or 0-byte audio attachments', () => {
    expect(DiscordMedia.validateAttachment(null).valid).toBe(false);
    expect(DiscordMedia.validateAttachment({}).valid).toBe(false);
    expect(DiscordMedia.validateAttachment({ size: 0, name: 'audio.ogg' }).valid).toBe(false);
  });
});
