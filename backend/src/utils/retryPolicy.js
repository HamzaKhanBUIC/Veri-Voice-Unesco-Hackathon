/**
 * VeriVoice Bounded Retry Policy with Exponential Backoff and Jitter
 */

/**
 * Executes a function with bounded exponential backoff and jitter.
 * Never retries non-retryable errors (e.g. 400 Bad Request, Validation, 401 Unauthorized).
 *
 * @param {Function} fn - Async operation to execute
 * @param {object} options - Retry configuration
 * @param {number} [options.maxAttempts=3] - Maximum retry attempts
 * @param {number} [options.baseDelayMs=300] - Base delay in milliseconds
 * @param {number} [options.maxDelayMs=3000] - Maximum delay ceiling
 * @param {string} [options.operationName='operation'] - Name for logs
 * @param {Function} [options.isRetryable] - Optional custom predicate
 * @returns {Promise<any>} Result of fn
 */
async function withBoundedRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelayMs = 300,
    maxDelayMs = 3000,
    operationName = 'operation',
    isRetryable = (err) => {
      // Don't retry client errors (4xx except 429) or explicit validation errors
      if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500 && err.statusCode !== 429) {
        return false;
      }
      if (err.category === 'VALIDATION_FAILURE' || err.category === 'USER_INPUT_FAILURE') {
        return false;
      }
      return true;
    },
  } = options;

  let attempt = 1;
  let lastError;

  while (attempt <= maxAttempts) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts || !isRetryable(err)) {
        throw err;
      }

      // Calculate exponential backoff with full jitter
      const expDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      const jitter = Math.random() * expDelay;
      const totalDelay = Math.round(expDelay / 2 + jitter / 2);

      console.warn(
        `[RetryPolicy] ${operationName} failed (attempt ${attempt}/${maxAttempts}): ${err.message}. Retrying in ${totalDelay}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
      attempt++;
    }
  }

  throw lastError;
}

/**
 * In-memory Idempotency Cache for Verification & TTS results.
 * Prevents duplicate expensive LLM / search executions when a client repeats a request.
 */
class IdempotencyCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
  }

  get(key) {
    if (!key) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    if (!key) return;
    // Cap memory usage (max 500 cached queries)
    if (this.cache.size > 500) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  has(key) {
    return this.get(key) !== null;
  }
}

const globalIdempotencyCache = new IdempotencyCache();

module.exports = {
  withBoundedRetry,
  IdempotencyCache,
  globalIdempotencyCache,
};
