/**
 * Lightweight In-Memory Concurrency Limiter & Semaphore.
 * Controls maximum active simultaneous executions to prevent RAM spikes and socket starvation.
 */
class ConcurrencyLimiter {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3;
    this.activeCount = 0;
    this.queue = [];
  }

  /**
   * Executes an async task within the concurrency limits.
   * @param {Function} fn - Async task function
   * @returns {Promise<any>} Task execution result
   */
  async run(fn) {
    if (this.activeCount >= this.maxConcurrent) {
      await new Promise((resolve) => this.queue.push(resolve));
    }

    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }

  get stats() {
    return {
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

module.exports = ConcurrencyLimiter;
