const SpeechProvider = require('./SpeechProvider');
const fs = require('fs');
const path = require('path');

/**
 * Whisper Speech-to-Text provider wrapper.
 * Supports Groq Whisper API or OpenAI Whisper API for fast, accurate Urdu audio transcription.
 */
class WhisperProvider extends SpeechProvider {
  constructor(apiKey = null, model = 'whisper-large-v3-turbo') {
    super('WhisperProvider');
    this.model = model;
    this.apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';

    const keys = [];
    if (apiKey) keys.push(apiKey);
    if (process.env.GROQ_API_KEYS) {
      keys.push(...process.env.GROQ_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean));
    }
    if (process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY.trim());
    if (process.env.GROQ_API_KEY_1) keys.push(process.env.GROQ_API_KEY_1.trim());
    if (process.env.GROQ_API_KEY_2) keys.push(process.env.GROQ_API_KEY_2.trim());
    if (process.env.GROQ_API_KEY_3) keys.push(process.env.GROQ_API_KEY_3.trim());
    if (process.env.GROQ_API_KEY_4) keys.push(process.env.GROQ_API_KEY_4.trim());
    keys.push(
      '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',
      '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',
      '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',
      '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',
      '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'
    );
    this.apiKeys = [...new Set(keys.filter((k) => k && !k.includes('your_') && k !== 'placeholder'))];
  }

  async transcribe(audioPath, options = {}) {
    if (!fs.existsSync(audioPath)) {
      throw new Error(`WhisperProvider: Audio file not found at ${audioPath}`);
    }

    if (!this.apiKeys || this.apiKeys.length === 0) {
      throw new Error(
        'WhisperProvider: Valid GROQ_API_KEY is required for real transcription.'
      );
    }

    const audioBuffer = fs.readFileSync(audioPath);
    const fileName = path.basename(audioPath);

    let lastError = null;

    for (let i = 0; i < this.apiKeys.length; i++) {
      const currentKey = this.apiKeys[i];
      const audioBlob = new Blob([audioBuffer], { type: options.mimeType || 'audio/ogg' });
      const formData = new FormData();
      formData.append('file', audioBlob, fileName);
      formData.append('model', this.model);
      if (options.language) {
        formData.append('language', options.language);
      }
      formData.append('response_format', 'json');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentKey}`,
          },
          body: formData,
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 429 || response.status === 401 || response.status === 403) {
            console.warn(`⚠️ Whisper Groq Key [${i + 1}/${this.apiKeys.length}] rate limited (HTTP ${response.status}). Rotating key...`);
            lastError = new Error(`Whisper API HTTP ${response.status}: ${errText}`);
            continue;
          }
          throw new Error(`Whisper API returned HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const text = data?.text?.trim();

        if (!text) {
          throw new Error('WhisperProvider: Received empty transcription text from API.');
        }

        return {
          text,
          language: options.language || 'ur',
          provider: this.name,
        };
      } catch (err) {
        lastError = err;
        if (err.name === 'AbortError') {
          console.warn(`⚠️ Whisper request timed out on key [${i + 1}]. Trying next key...`);
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw lastError || new Error('WhisperProvider: All Whisper API keys exhausted.');
  }
}

module.exports = WhisperProvider;
