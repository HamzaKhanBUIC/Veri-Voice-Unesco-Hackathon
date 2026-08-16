const TTSProvider = require('./TTSProvider');
const EdgeTTSProvider = require('./EdgeTTSProvider');
const fs = require('fs');
const path = require('path');

/**
 * ElevenLabs High-Fidelity Multilingual TTS Provider with Automatic Edge Neural Fallback.
 * Supports Urdu, Spanish, Indonesian, English, and 29+ languages using eleven_multilingual_v2.
 */
class ElevenLabsTTSProvider extends TTSProvider {
  constructor(apiKey = null, voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL') {
    super('ElevenLabsTTSProvider');
    this.voiceId = voiceId;
    this.edgeFallback = new EdgeTTSProvider();
    
    // Resolve all configured ElevenLabs API keys for automatic quota failover & rotation
    const keys = [];
    if (apiKey) keys.push(apiKey);
    if (process.env.ELEVENLABS_API_KEYS) {
      keys.push(...process.env.ELEVENLABS_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean));
    }
    if (process.env.ELEVENLABS_API_KEY) keys.push(process.env.ELEVENLABS_API_KEY.trim());
    if (process.env.ELEVENLABS_API_KEY_1) keys.push(process.env.ELEVENLABS_API_KEY_1.trim());
    if (process.env.ELEVENLABS_API_KEY_2) keys.push(process.env.ELEVENLABS_API_KEY_2.trim());
    if (process.env.ELEVENLABS_API_KEY_3) keys.push(process.env.ELEVENLABS_API_KEY_3.trim());
    if (process.env.ELEVENLABS_API_KEY_4) keys.push(process.env.ELEVENLABS_API_KEY_4.trim());
    
    this.apiKeys = [...new Set(keys.filter((k) => k && !k.includes('your_') && k !== 'placeholder'))];
  }

  isAvailable() {
    return this.apiKeys.length > 0;
  }

  async synthesize(text, outputAudioPath, options = {}) {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) {
      throw new Error('ElevenLabsTTSProvider: Clean text is empty.');
    }

    if (this.isAvailable()) {
      const voiceId = options.voiceId || this.voiceId;
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      for (let i = 0; i < this.apiKeys.length; i++) {
        const currentKey = this.apiKeys[i];
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': currentKey,
              'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
              text: cleanText.length > 250 ? cleanText.substring(0, 247) + '...' : cleanText,
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
            const errText = await response.text().catch(() => '');
            console.warn(`⚠️ ElevenLabs API Key [${i + 1}/${this.apiKeys.length}] returned HTTP ${response.status}: ${errText}. Attempting next key...`);
          }
        } catch (err) {
          console.warn(`⚠️ ElevenLabs synthesis error with key [${i + 1}]: ${err.message}. Attempting next key...`);
        }
      }
      console.warn('⚠️ All ElevenLabs API keys exhausted or failed. Falling back to Microsoft Edge Neural TTS...');
    }

    // Fallback to Microsoft Edge Neural TTS (ur-PK-UzmaNeural, id-ID-GadisNeural, etc.)
    return this.edgeFallback.synthesize(cleanText, outputAudioPath, options);
  }
}

module.exports = ElevenLabsTTSProvider;
