const SpeechProvider = require('./SpeechProvider');
const fs = require('fs');
const path = require('path');

/**
 * Whisper Speech-to-Text provider wrapper.
 * Supports Groq Whisper API or OpenAI Whisper API for fast, accurate Urdu audio transcription.
 */
class WhisperProvider extends SpeechProvider {
  constructor(apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY, model = 'whisper-large-v3-turbo') {
    super('WhisperProvider');
    this.apiKey = apiKey;
    this.model = model;
    this.apiUrl = process.env.GROQ_API_KEY
      ? 'https://api.groq.com/openai/v1/audio/transcriptions'
      : 'https://api.openai.com/v1/audio/transcriptions';
  }

  async transcribe(audioPath, options = {}) {
    if (!fs.existsSync(audioPath)) {
      throw new Error(`WhisperProvider: Audio file not found at ${audioPath}`);
    }

    if (!this.apiKey || this.apiKey.includes('your_') || this.apiKey === 'placeholder') {
      throw new Error(
        'WhisperProvider: Valid GROQ_API_KEY or OPENAI_API_KEY is required for real transcription.'
      );
    }

    const audioBuffer = fs.readFileSync(audioPath);
    const fileName = path.basename(audioPath);

    // Create a Blob from the file buffer for Node.js native fetch FormData
    const audioBlob = new Blob([audioBuffer], { type: options.mimeType || 'audio/ogg' });

    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('model', this.model);
    formData.append('language', options.language || 'ur');
    formData.append('response_format', 'json');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
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
      if (err.name === 'AbortError') {
        throw new Error('WhisperProvider: Transcription request timed out (15s).');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = WhisperProvider;
