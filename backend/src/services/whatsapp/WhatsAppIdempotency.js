/**
 * Lightweight In-Memory Message Deduplication / Idempotency Store.
 * Prevents duplicate processing when Meta retries webhook deliveries.
 * NOTE: Suitable for prototype single-instance deployment.
 */
class WhatsAppIdempotency {
  /**
   * @param {number} [ttlMs=600000] - Time to live in ms (default: 10 minutes)
   * @param {number} [maxSize=1000] - Maximum capacity
   */
  constructor(ttlMs = 600000, maxSize = 1000) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.processedMessages = new Map(); // messageId -> timestamp
  }

  /**
   * Checks if message ID has already been processed. If not, marks it as seen.
   * @param {string} messageId 
   * @returns {boolean} True if duplicate (already processed), False if new
   */
  isDuplicate(messageId) {
    if (!messageId) return false;

    this._cleanupExpired();

    if (this.processedMessages.has(messageId)) {
      return true;
    }

    if (this.processedMessages.size >= this.maxSize) {
      const oldestKey = this.processedMessages.keys().next().value;
      this.processedMessages.delete(oldestKey);
    }

    this.processedMessages.set(messageId, Date.now());
    return false;
  }

  _cleanupExpired() {
    const now = Date.now();
    for (const [id, timestamp] of this.processedMessages.entries()) {
      if (now - timestamp > this.ttlMs) {
        this.processedMessages.delete(id);
      } else {
        break; // Map maintains insertion order
      }
    }
  }

  clear() {
    this.processedMessages.clear();
  }
}

module.exports = WhatsAppIdempotency;
