const SpeechProvider = require('./SpeechProvider');
const fs = require('fs');
const path = require('path');

/**
 * Speechmatics Speech-to-Text provider wrapper.
 * Connects to Speechmatics Batch ASR API v2 for multi-lingual and Urdu speech transcription.
 */
class SpeechmaticsProvider extends SpeechProvider {
  constructor(apiKey = process.env.SPEECHMATICS_API_KEY) {
    super('SpeechmaticsProvider');
    this.apiKey = apiKey;
    this.apiUrl = 'https://asr.api.speechmatics.com/v2/jobs';
  }

  async transcribe(audioPath, options = {}) {
    if (!fs.existsSync(audioPath)) {
      throw new Error(`SpeechmaticsProvider: Audio file not found at ${audioPath}`);
    }

    if (!this.apiKey || this.apiKey.includes('your_') || this.apiKey === 'placeholder') {
      throw new Error(
        'SpeechmaticsProvider: SPEECHMATICS_API_KEY is missing or unconfigured in .env.'
      );
    }

    const audioBuffer = fs.readFileSync(audioPath);
    const fileName = path.basename(audioPath);
    const audioBlob = new Blob([audioBuffer], { type: options.mimeType || 'audio/ogg' });

    const targetLang = (options.language && options.language !== 'auto') ? options.language : 'en';

    const jobConfig = {
      type: 'transcription',
      transcription_config: {
        language: targetLang,
      },
    };

    const formData = new FormData();
    formData.append('data_file', audioBlob, fileName);
    formData.append('config', JSON.stringify(jobConfig));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      // 1. Submit Transcription Job
      const postResponse = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
        signal: controller.signal,
      });

      if (!postResponse.ok) {
        const errText = await postResponse.text();
        throw new Error(`Speechmatics API returned HTTP ${postResponse.status}: ${errText}`);
      }

      const jobData = await postResponse.json();
      const jobId = jobData.id;

      if (!jobId) {
        throw new Error('SpeechmaticsProvider: Did not receive job ID from Speechmatics API.');
      }

      // 2. Poll Job Status until done
      let attempts = 0;
      while (attempts < 15) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        const statusResponse = await fetch(`${this.apiUrl}/${jobId}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.job?.status === 'done') {
            break;
          } else if (statusData.job?.status === 'rejected') {
            throw new Error(`SpeechmaticsProvider: Job was rejected: ${statusData.job.errors?.join('; ')}`);
          }
        }
      }

      // 3. Fetch Transcript Result
      const resultResponse = await fetch(`${this.apiUrl}/${jobId}/transcript?format=txt`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      if (!resultResponse.ok) {
        throw new Error(`SpeechmaticsProvider: Failed to fetch transcript result (HTTP ${resultResponse.status}).`);
      }

      const transcriptText = (await resultResponse.text()).trim();

      return {
        text: transcriptText,
        language: targetLang,
        provider: this.name,
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('SpeechmaticsProvider: Transcription request timed out (30s).');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = SpeechmaticsProvider;
