const path = require('path');
// Ensure environment variables are loaded in serverless context
if (!process.env.GROQ_API_KEY) {
  process.env.GROQ_API_KEY = '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';
}
if (!process.env.SPEECH_PROVIDER) {
  process.env.SPEECH_PROVIDER = 'whisper';
}
if (!process.env.LLM_PROVIDER) {
  process.env.LLM_PROVIDER = 'groq';
}
if (!process.env.TTS_PROVIDER) {
  process.env.TTS_PROVIDER = 'edge-tts';
}

const app = require('../../backend/src/app');

module.exports = (req, res) => {
  return app(req, res);
};
