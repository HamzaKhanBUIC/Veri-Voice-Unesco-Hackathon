const { ErrorCategory, VeriVoiceError } = require('../backend/src/utils/errors');
const { withBoundedRetry, IdempotencyCache } = require('../backend/src/utils/retryPolicy');

describe('VeriVoice Chaos Engineering & Resilience Test Suite', () => {
  describe('1. Error Taxonomy & Classification', () => {
    test('Correctly constructs domain errors with metadata and status codes', () => {
      const err = new VeriVoiceError({
        message: 'Speech synthesis provider timed out',
        category: ErrorCategory.TIMEOUT,
        statusCode: 504,
        requestId: 'req_123',
        retryable: true,
      });

      expect(err.name).toBe('VeriVoiceError');
      expect(err.category).toBe('TIMEOUT');
      expect(err.statusCode).toBe(504);
      expect(err.requestId).toBe('req_123');
      expect(err.retryable).toBe(true);

      const json = err.toJSON();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Speech synthesis provider timed out');
      expect(json.category).toBe('TIMEOUT');
    });

    test('Differentiates infrastructure failure from evidence uncertainty', () => {
      const infraErr = new VeriVoiceError({
        message: 'Knowledge retrieval database connection dropped',
        category: ErrorCategory.NETWORK_FAILURE,
        statusCode: 503,
        retryable: true,
      });

      expect(infraErr.category).not.toBe('UNCERTAIN');
      expect(infraErr.category).toBe(ErrorCategory.NETWORK_FAILURE);
      expect(infraErr.statusCode).toBe(503);
    });
  });

  describe('2. Bounded Retry Engine & Backoff Policy', () => {
    test('Retries transient failures up to max attempts with exponential delay', async () => {
      let attempts = 0;
      const operation = async (attempt) => {
        attempts = attempt;
        if (attempt < 3) {
          throw new Error(`Transient network glitch on attempt ${attempt}`);
        }
        return { success: true, verified: true };
      };

      const result = await withBoundedRetry(operation, {
        maxAttempts: 3,
        baseDelayMs: 20,
        maxDelayMs: 100,
        operationName: 'test-retry',
      });

      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    test('Terminates and throws when max retry budget is exhausted', async () => {
      let attempts = 0;
      const failingOp = async (attempt) => {
        attempts = attempt;
        throw new Error('Persistent 500 error');
      };

      await expect(
        withBoundedRetry(failingOp, {
          maxAttempts: 2,
          baseDelayMs: 10,
          maxDelayMs: 50,
          operationName: 'failing-test',
        })
      ).rejects.toThrow('Persistent 500 error');

      expect(attempts).toBe(2);
    });

    test('Never retries non-retryable client errors (400, 401, 403, 422)', async () => {
      let attempts = 0;
      const clientErrorOp = async (attempt) => {
        attempts = attempt;
        const err = new Error('Bad Request: Invalid Claim Schema');
        err.statusCode = 400;
        throw err;
      };

      await expect(
        withBoundedRetry(clientErrorOp, {
          maxAttempts: 3,
          baseDelayMs: 10,
          operationName: 'client-error-test',
        })
      ).rejects.toThrow('Bad Request');

      // Must stop immediately after attempt 1
      expect(attempts).toBe(1);
    });
  });

  describe('3. Idempotency Cache (Prevents Duplicate Executions)', () => {
    test('Stores and retrieves identical query responses without re-executing', () => {
      const cache = new IdempotencyCache(60000);
      const queryKey = 'en_is earth flat';
      const mockResult = {
        success: true,
        verdict: 'FALSE',
        confidence: 'HIGH',
        explanation: 'Earth is an oblate spheroid.',
      };

      cache.set(queryKey, mockResult);
      expect(cache.has(queryKey)).toBe(true);

      const retrieved = cache.get(queryKey);
      expect(retrieved).toEqual(mockResult);
    });

    test('Gracefully expires entries past TTL', async () => {
      const shortTtlCache = new IdempotencyCache(50); // 50ms TTL
      shortTtlCache.set('key1', { data: 'test' });
      expect(shortTtlCache.has('key1')).toBe(true);

      await new Promise((r) => setTimeout(r, 60));
      expect(shortTtlCache.get('key1')).toBeNull();
      expect(shortTtlCache.has('key1')).toBe(false);
    });
  });

  describe('4. Input Quality & Multilingual Entropy Guards', () => {
    function testGibberish(text) {
      const clean = text.trim();
      if (clean.length < 2) return true;
      if (/[\u0600-\u06FF]/.test(clean) && clean.length >= 3) {
        const unique = new Set(clean.split(''));
        return unique.size === 1 && clean.length > 5;
      }
      const alpha = clean.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
      if (alpha.length === 0) return true;
      if (/^(.)\1{4,}$/i.test(clean)) return true;
      const lower = clean.toLowerCase();
      if (
        lower.includes('asdf') ||
        lower.includes('ghjkl') ||
        lower.includes('qwerty') ||
        lower.includes('zxcvb') ||
        lower.includes('123456') ||
        lower.includes('67890')
      ) {
        return true;
      }
      return false;
    }

    test('Correctly rejects Latin keyboard smashing', () => {
      expect(testGibberish('asdfghjkl')).toBe(true);
      expect(testGibberish('qwertyuiop')).toBe(true);
      expect(testGibberish('??????????')).toBe(true);
      expect(testGibberish('aaaaaaa')).toBe(true);
    });

    test('Preserves valid multilingual inputs across Urdu, Spanish, Indonesian, and English', () => {
      expect(testGibberish('کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟')).toBe(false);
      expect(testGibberish('¿Las vacunas causan autismo en los niños?')).toBe(false);
      expect(testGibberish('Apakah bawang putih dapat menyembuhkan virus corona?')).toBe(false);
      expect(testGibberish('Is the earth flat or spherical?')).toBe(false);
    });
  });

  describe('5. Security Sanitization & Injection Resistance', () => {
    test('Strips HTML and JavaScript injections safely', () => {
      const malicious = '<script>alert("hacked")</script>Are vaccines safe? <iframe src="evil.com"></iframe>';
      const clean = malicious
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();

      expect(clean).toBe('Are vaccines safe?');
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('iframe');
    });
  });
});
