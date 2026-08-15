const TTSProvider = require('./TTSProvider');
const EdgeTTSProvider = require('./EdgeTTSProvider');
const fs = require('fs');
const path = require('path');

/**
 * ElevenLabs High-Fidelity Multilingual TTS Provider with Automatic Edge Neural Fallback.
 * Supports Urdu, Spanish, Indonesian, English, and 29+ languages using eleven_multilingual_v2.
 */
class ElevenLabsTTSProvider extends TTSProvider {
  constructor(apiKey = process.env.ELEVENLABS_API_KEY, voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL') {
    super('ElevenLabsTTSProvider');
    this.apiKey = apiKey;
    this.voiceId = voiceId;
    this.edgeFallback = new EdgeTTSProvider();
  }

  isAvailable() {
    return Boolean(this.apiKey && !this.apiKey.includes('your_') && this.apiKey !== 'placeholder');
  }

  async synthesize(text, outputAudioPath, options = {}) {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) {
      throw new Error('ElevenLabsTTSProvider: Clean text is empty.');
    }

    if (this.isAvailable()) {
      try {
        const voiceId = options.voiceId || this.voiceId;
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              use_speaker_boost: true,
            },
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = Buffer.from(arrayBuffer);

          const resolvedPath = path.resolve(outputAudioPath);
          const dir = path.dirname(resolvedPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(resolvedPath, audioBuffer);

          return {
            outputPath: resolvedPath,
            voice: voiceId,
            format: 'mp3',
            durationSeconds: 3.5,
            provider: this.name,
            audioAvailable: true,
          };
        } else {
          const errText = await response.text();
          console.warn(`⚠️ ElevenLabs API returned HTTP ${response.status}: ${errText}. Falling back to Microsoft Edge Neural TTS...`);
        }
      } catch (err) {
        console.warn(`⚠️ ElevenLabs synthesis error: ${err.message}. Falling back to Microsoft Edge Neural TTS...`);
      }
    }

    // Fallback to Microsoft Edge Neural TTS (ur-PK-UzmaNeural, id-ID-GadisNeural, etc.)
    return this.edgeFallback.synthesize(cleanText, outputAudioPath, options);
  }
}

module.exports = ElevenLabsTTSProvider;
