/**
 * VeriVoice Standardized Error Taxonomy & Failure Classification
 */

export type ErrorCategory =
  | 'USER_INPUT_FAILURE'
  | 'DEVICE_FAILURE'
  | 'PERMISSION_FAILURE'
  | 'CLIENT_FAILURE'
  | 'NETWORK_FAILURE'
  | 'TIMEOUT'
  | 'PROVIDER_FAILURE'
  | 'SEARCH_FAILURE'
  | 'PARTIAL_EVIDENCE'
  | 'VALIDATION_FAILURE'
  | 'RATE_LIMIT'
  | 'CONCURRENCY_LIMIT'
  | 'SESSION_LIMIT'
  | 'AUDIO_FAILURE'
  | 'INTERNAL_FAILURE';

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface VeriVoiceErrorContext {
  requestId?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userTitle: string;
  userMessage: string;
  technicalDetails?: string;
  retryable: boolean;
  maxRetries?: number;
  retryAttempt?: number;
  fallbackAction?: 'TYPE_INSTEAD' | 'USE_SAMPLE' | 'PLAY_AGAIN' | 'RETRY_PROXY' | 'DESCRIBE_LINK' | 'NONE';
  suggestedAction?: 'RETRY' | 'EDIT' | 'REFRESH' | 'REPORT' | 'DISMISS';
  timestamp: number;
}

export class VeriVoiceAppError extends Error {
  public readonly context: VeriVoiceErrorContext;

  constructor(context: Omit<VeriVoiceErrorContext, 'timestamp'>) {
    super(context.userMessage);
    this.name = 'VeriVoiceAppError';
    this.context = {
      ...context,
      timestamp: Date.now(),
    };
  }
}

/**
 * Common Factory Helpers for Domain Specific Errors
 */
export const createDeviceError = (details?: string): VeriVoiceAppError =>
  new VeriVoiceAppError({
    category: 'DEVICE_FAILURE',
    severity: 'WARNING',
    userTitle: 'Audio Device Changed',
    userMessage: 'Your microphone or audio headset was disconnected or switched during recording.',
    technicalDetails: details,
    retryable: true,
    fallbackAction: 'TYPE_INSTEAD',
    suggestedAction: 'RETRY',
  });

export const createPermissionError = (details?: string): VeriVoiceAppError =>
  new VeriVoiceAppError({
    category: 'PERMISSION_FAILURE',
    severity: 'WARNING',
    userTitle: 'Microphone Permission Required',
    userMessage: 'Microphone access is blocked in your browser. Please allow microphone access or type your claim directly.',
    technicalDetails: details,
    retryable: false,
    fallbackAction: 'TYPE_INSTEAD',
    suggestedAction: 'EDIT',
  });

export const createNetworkTimeoutError = (requestId?: string): VeriVoiceAppError =>
  new VeriVoiceAppError({
    requestId,
    category: 'TIMEOUT',
    severity: 'WARNING',
    userTitle: 'Verification Timed Out',
    userMessage: 'Connecting to institutional archives took longer than expected due to network congestion.',
    retryable: true,
    maxRetries: 2,
    fallbackAction: 'RETRY_PROXY',
    suggestedAction: 'RETRY',
  });

export const createLowEntropyError = (): VeriVoiceAppError =>
  new VeriVoiceAppError({
    category: 'USER_INPUT_FAILURE',
    severity: 'INFO',
    userTitle: 'No Factual Claim Detected',
    userMessage: "We couldn't identify a clear question or factual claim in your message. Try asking about a specific health, climate, or scientific topic.",
    retryable: false,
    fallbackAction: 'USE_SAMPLE',
    suggestedAction: 'EDIT',
  });

export const createUrlOnlyError = (url: string): VeriVoiceAppError =>
  new VeriVoiceAppError({
    category: 'USER_INPUT_FAILURE',
    severity: 'INFO',
    userTitle: 'Link Submitted',
    userMessage: 'You shared a link. What specific claim or rumor from this link would you like VeriVoice to verify?',
    technicalDetails: `URL: ${url}`,
    retryable: false,
    fallbackAction: 'DESCRIBE_LINK',
    suggestedAction: 'EDIT',
  });

export const createAudioPlaybackError = (details?: string): VeriVoiceAppError =>
  new VeriVoiceAppError({
    category: 'AUDIO_FAILURE',
    severity: 'INFO',
    userTitle: "Audio Playback Didn't Start",
    userMessage: "The spoken voice answer couldn't play automatically on your device. You can tap Play again or read the full text verdict.",
    technicalDetails: details,
    retryable: true,
    fallbackAction: 'PLAY_AGAIN',
    suggestedAction: 'RETRY',
  });

export const createRateLimitError = (): VeriVoiceAppError =>
  new VeriVoiceAppError({
    category: 'RATE_LIMIT',
    severity: 'WARNING',
    userTitle: 'High Request Volume',
    userMessage: "You're sending queries a little quickly. Please wait a moment before asking your next claim.",
    retryable: true,
    suggestedAction: 'RETRY',
  });
