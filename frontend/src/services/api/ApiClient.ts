import { VerifyResponse, ConversationContext } from '../../types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  /**
   * Health check to detect backend liveness & wake up Render cold starts.
   */
  async checkHealth(): Promise<{ status: string; service: string; environment: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('ApiClient: Health check ping failed (instance may be sleeping):', err);
      return null;
    }
  }

  /**
   * Submits a claim verification or conversational query (Text or Audio Base64).
   */
  async verifyClaim(params: {
    claimText?: string;
    audioBase64?: string;
    fileExt?: string;
    mode?: 'VERIFICATION' | 'GENERAL_RESEARCH';
    targetLanguage?: string;
    context?: ConversationContext;
  }): Promise<VerifyResponse> {
    const payload: {
      claimText?: string;
      audioBase64?: string;
      fileExt?: string;
      mode?: string;
      targetLanguage?: string;
      context?: ConversationContext;
    } = {};

    if (params.audioBase64) {
      payload.audioBase64 = params.audioBase64;
      payload.fileExt = params.fileExt || 'webm';
    } else if (params.claimText) {
      payload.claimText = params.claimText.trim();
    } else {
      throw new Error('Either claimText or audioBase64 must be provided.');
    }

    if (params.mode) {
      payload.mode = params.mode;
    }

    if (params.targetLanguage) {
      payload.targetLanguage = params.targetLanguage;
    }

    if (params.context) {
      payload.context = {
        ...params.context,
        targetLanguage: params.targetLanguage || params.context.targetLanguage,
      };
    } else if (params.targetLanguage) {
      payload.context = {
        targetLanguage: params.targetLanguage,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for cold starts

    try {
      const response = await fetch(`${this.baseUrl}/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Verification failed with HTTP ${response.status}`);
      }

      return data as VerifyResponse;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Search and verification timed out. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Resolves static audio URL path.
   */
  resolveAudioUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}

export const apiClient = new ApiClient();
