const path = require('path');
const StandalonePipeline = require('../services/pipeline/standalonePipeline');
const MockSpeechProvider = require('../services/speech/MockSpeechProvider');
const WhisperProvider = require('../services/speech/WhisperProvider');
const SpeechmaticsProvider = require('../services/speech/SpeechmaticsProvider');
const MockTTSProvider = require('../services/tts/MockTTSProvider');
const EdgeTTSProvider = require('../services/tts/EdgeTTSProvider');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
VeriVoice Standalone Pipeline CLI (Milestone 1)

Usage:
  node backend/src/cli/runPipeline.js <path-to-audio-file> [options]

Options:
  --speech-provider <mock|whisper|speechmatics> (default: mock)
  --tts-provider    <mock|edge-tts>             (default: edge-tts if available, else mock)
  --output          <path-to-output-audio>      (default: output_<timestamp>.mp3)

Examples:
  node backend/src/cli/runPipeline.js ./test-fixtures/audio/sample_claim_ur.ogg
  npm run pipeline -- ./test-fixtures/audio/sample_claim_ur.ogg
`);
    process.exit(0);
  }

  const inputAudioPath = args[0];

  // Parse provider flags
  let speechProviderName = 'mock';
  let ttsProviderName = 'auto';
  let outputAudioPath = null;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--speech-provider' && args[i + 1]) {
      speechProviderName = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--tts-provider' && args[i + 1]) {
      ttsProviderName = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputAudioPath = args[i + 1];
      i++;
    }
  }

  // Select Speech Provider
  let speechProvider;
  if (speechProviderName === 'whisper') {
    speechProvider = new WhisperProvider();
  } else if (speechProviderName === 'speechmatics') {
    speechProvider = new SpeechmaticsProvider();
  } else {
    speechProvider = new MockSpeechProvider();
  }

  // Select TTS Provider
  let ttsProvider;
  if (ttsProviderName === 'edge-tts') {
    ttsProvider = new EdgeTTSProvider();
  } else if (ttsProviderName === 'mock') {
    ttsProvider = new MockTTSProvider();
  } else {
    // Auto-detect EdgeTTS
    const edgeTTS = new EdgeTTSProvider();
    if (edgeTTS.isAvailable()) {
      ttsProvider = edgeTTS;
    } else {
      console.log('ℹ️ Note: edge-tts CLI tool not detected. Falling back to MockTTSProvider.');
      ttsProvider = new MockTTSProvider();
    }
  }

  console.log(`\n==================================================`);
  console.log(`VeriVoice Standalone Audio Pipeline (Milestone 1)`);
  console.log(`==================================================`);
  console.log(`Input Audio : ${inputAudioPath}`);
  console.log(`STT Provider: ${speechProvider.name}`);
  console.log(`TTS Provider: ${ttsProvider.name}`);
  console.log(`--------------------------------------------------`);

  try {
    const pipeline = new StandalonePipeline({ speechProvider, ttsProvider });
    const result = await pipeline.processAudio(inputAudioPath, outputAudioPath);

    console.log(`Status      : COMPLETED (${result.timing.totalSeconds}s)`);
    console.log(`Language    : ${result.language}`);
    console.log(`Transcript  : "${result.transcript}"`);
    console.log(`--------------------------------------------------`);
    console.log(`Response    : "${result.responseText}"`);
    console.log(`Verification: TEST STUB (Milestone 1)`);
    console.log(`--------------------------------------------------`);
    console.log(`Output Audio: ${result.outputAudio}`);
    console.log(`--------------------------------------------------`);
    console.log(`TIMING BREAKDOWN:`);
    console.log(`  - STT Latency         : ${result.timing.sttMs} ms`);
    console.log(`  - Verification Latency: ${result.timing.verificationMs} ms`);
    console.log(`  - TTS Latency         : ${result.timing.ttsMs} ms`);
    console.log(`  - Total Pipeline Time : ${result.timing.totalMs} ms (${result.timing.totalSeconds}s)`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error(`\n❌ Pipeline Processing Error: ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
