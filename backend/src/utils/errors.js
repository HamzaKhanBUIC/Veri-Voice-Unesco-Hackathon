/**
 * VeriVoice Standardized Backend Error Taxonomy
 */

const ErrorCategory = {
  USER_INPUT_FAILURE: 'USER_INPUT_FAILURE',
  DEVICE_FAILURE: 'DEVICE_FAILURE',
  PERMISSION_FAILURE: 'PERMISSION_FAILURE',
  CLIENT_FAILURE: 'CLIENT_FAILURE',
  NETWORK_FAILURE: 'NETWORK_FAILURE',
  TIMEOUT: 'TIMEOUT',
  PROVIDER_FAILURE: 'PROVIDER_FAILURE',
  SEARCH_FAILURE: 'SEARCH_FAILURE',
  PARTIAL_EVIDENCE: 'PARTIAL_EVIDENCE',
  VALIDATION_FAILURE: 'VALIDATION_FAILURE',
  RATE_LIMIT: 'RATE_LIMIT',
  CONCURRENCY_LIMIT: 'CONCURRENCY_LIMIT',
  SESSION_LIMIT: 'SESSION_LIMIT',
  AUDIO_FAILURE: 'AUDIO_FAILURE',
  INTERNAL_FAILURE: 'INTERNAL_FAILURE',
};

class VeriVoiceError extends Error {
  constructor({
    message,
    category = ErrorCategory.INTERNAL_FAILURE,
    statusCode = 500,
    requestId = null,
    retryable = false,
    technicalDetails = null,
  }) {
    super(message);
    this.name = 'VeriVoiceError';
    this.category = category;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.retryable = retryable;
    this.technicalDetails = technicalDetails;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      category: this.category,
      statusCode: this.statusCode,
      requestId: this.requestId,
      retryable: this.retryable,
      timestamp: this.timestamp,
    };
  }
}

module.exports = {
  ErrorCategory,
  VeriVoiceError,
};
