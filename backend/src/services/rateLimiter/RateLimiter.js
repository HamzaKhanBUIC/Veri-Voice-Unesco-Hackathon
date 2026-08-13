/**
 * Lightweight In-Memory Sliding-Window Rate Limiter.
 * Supports Per-User rate limits AND Global system-wide request rate limits.
 */
class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 5;
    this.windowMs = options.windowMs || 60000; // 60 seconds per user
    this.userRequests = new Map();

    // Global Rate Protection (Default: 20 requests per 60 seconds across all users)
    this.globalMaxRequests = options.globalMaxRequests || 20;
    this.globalWindowMs = options.globalWindowMs || 60000;
    this.globalTimestamps = [];

    // Periodically clean up expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 120000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Checks whether global system-wide request rate limit is allowed.
   * @returns {{ allowed: boolean, resetMs: number }}
   */
  checkGlobal() {
    const now = Date.now();
    const valid = this.globalTimestamps.filter((ts) => now - ts < this.globalWindowMs);

    if (valid.length >= this.globalMaxRequests) {
      const oldest = valid[0];
      const resetMs = this.globalWindowMs - (now - oldest);
      return { allowed: false, resetMs };
    }

    valid.push(now);
    this.globalTimestamps = valid;
    return { allowed: true, resetMs: this.globalWindowMs };
  }

  /**
   * Checks whether a request from key (userId/IP) is allowed.
   * @param {string} key - User ID or IP address
   * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
   */
  check(key) {
    if (!key || typeof key !== 'string') {
      return { allowed: true, remaining: this.maxRequests, resetMs: 0 };
    }

    const now = Date.now();
    const timestamps = this.userRequests.get(key) || [];
    const validTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const resetMs = this.windowMs - (now - oldest);
      return { allowed: false, remaining: 0, resetMs };
    }

    validTimestamps.push(now);
    this.userRequests.set(key, validTimestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - validTimestamps.length,
      resetMs: this.windowMs,
    };
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, timestamps] of this.userRequests.entries()) {
      const valid = timestamps.filter((ts) => now - ts < this.windowMs);
      if (valid.length === 0) {
        this.userRequests.delete(key);
      } else {
        this.userRequests.set(key, valid);
      }
    }

    this.globalTimestamps = this.globalTimestamps.filter((ts) => now - ts < this.globalWindowMs);
  }

  reset() {
    this.userRequests.clear();
    this.globalTimestamps = [];
  }
}

module.exports = RateLimiter;
