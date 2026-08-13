/**
 * Lightweight In-Memory Sliding-Window Rate Limiter.
 * Protects against request spam & API quota exhaustion without external databases.
 */
class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 5;
    this.windowMs = options.windowMs || 60000; // 60 seconds
    this.userRequests = new Map();

    // Periodically clean up expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 120000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
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
  }

  reset() {
    this.userRequests.clear();
  }
}

module.exports = RateLimiter;
