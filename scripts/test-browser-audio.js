const http = require('http');
const fs = require('fs');
const path = require('path');

// Let's create a minimal valid audio test or use an existing test audio sample
async function testVoiceUpload() {
  console.log('Testing voice verification via POST /api/verify with Whisper STT...');

  // If a sample audio exists in fixtures or tests, load it; otherwise test text fallback
  const sampleAudioPath = path.join(__dirname, '../tests/fixtures/sample_urdu.ogg');
  let audioBase64 = null;
  let fileExt = 'ogg';

  if (fs.existsSync(sampleAudioPath)) {
    audioBase64 = fs.readFileSync(sampleAudioPath).toString('base64');
  }

  const payload = JSON.stringify({
    claimText: audioBase64 ? undefined : 'Polio drops protect children against lifelong paralysis',
    audioBase64: audioBase64 || undefined,
    fileExt: fileExt,
    context: { voiceMode: true },
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Accept': 'application/json',
    },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('HTTP Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        console.log('Response Success:', json.success);
        console.log('User Claim:', json.userClaim);
        console.log('Verdict:', json.verdict);
        console.log('Explanation:', json.explanation);
        console.log('STT Provider:', json.providers?.stt);
        console.log('Audio URL:', json.audioUrl);
      } catch (e) {
        console.log('Raw output:', data);
      }
    });
  });

  req.on('error', (e) => console.error('Request error:', e.message));
  req.write(payload);
  req.end();
}

testVoiceUpload();
