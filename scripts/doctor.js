/**
 * VeriVoice Environment Doctor
 * Diagnostics tool to audit local setup, dependencies, provider readiness, and credentials.
 * NEVER prints secret API key values.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('====================================================');
console.log('         VeriVoice Environment Doctor               ');
console.log('====================================================\n');

// 1. Node.js & Environment
const nodeVersion = process.version;
console.log(`[+] Node.js Version:     ${nodeVersion} (PASS)`);
console.log(`[+] Node Environment:    ${process.env.NODE_ENV || 'development'}`);

// 2. Production Claims Database Check
const claimsPath = path.join(__dirname, '..', 'knowledge', 'claims.json');
let claimsCount = 0;
let claimsStatus = 'MISSING';

if (fs.existsSync(claimsPath)) {
  try {
    const claimsData = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
    claimsCount = Array.isArray(claimsData) ? claimsData.length : 0;
    claimsStatus = claimsCount > 0 ? `CONFIGURED (${claimsCount} claims)` : 'EMPTY ([]) - Awaiting Human Review';
  } catch (err) {
    claimsStatus = 'INVALID_JSON';
  }
}
console.log(`[+] Production Claims:   ${claimsStatus}`);

// 3. Provider Configurations
const speechProvider = process.env.SPEECH_PROVIDER || 'speechmatics';
const ttsProvider = process.env.TTS_PROVIDER || 'edge-tts';
const llmProvider = process.env.LLM_PROVIDER || 'groq';

console.log(`\n--- Configured System Providers ---`);
console.log(`[+] STT Provider:        ${speechProvider.toUpperCase()}`);
console.log(`[+] TTS Provider:        ${ttsProvider.toUpperCase()} (Microsoft Edge Neural TTS - No API key required)`);
console.log(`[+] LLM Provider:        ${llmProvider.toUpperCase()}`);

// 4. API Key / Credential Status (NEVER EXPOSE SECRETS)
console.log(`\n--- Credential Readiness (Secrets Hidden) ---`);

const groqKey = process.env.GROQ_API_KEY ? 'PRESENT (Configured)' : 'MISSING';
const openaiKey = process.env.OPENAI_API_KEY ? 'PRESENT (Configured)' : 'MISSING';
const speechmaticsKey = process.env.SPEECHMATICS_API_KEY ? 'PRESENT (Configured)' : 'MISSING';

console.log(`[+] GROQ_API_KEY:         ${groqKey}`);
console.log(`[+] OPENAI_API_KEY:       ${openaiKey}`);
console.log(`[+] SPEECHMATICS_API_KEY: ${speechmaticsKey}`);

// 5. Discord Prototype Integration Status
const discordToken = process.env.DISCORD_BOT_TOKEN ? 'PRESENT (Configured)' : 'MISSING';
const discordAppId = process.env.DISCORD_APPLICATION_ID ? 'PRESENT (Configured)' : 'MISSING';
const discordGuildId = process.env.DISCORD_GUILD_ID ? 'PRESENT (Configured)' : 'MISSING (Optional)';

console.log(`\n--- Discord Integration (Primary Prototype) ---`);
console.log(`[+] DISCORD_BOT_TOKEN:      ${discordToken}`);
console.log(`[+] DISCORD_APPLICATION_ID: ${discordAppId}`);
console.log(`[+] DISCORD_GUILD_ID:        ${discordGuildId}`);


// 7. Overall Readiness Summary
console.log('\n====================================================');
if (discordToken.includes('PRESENT') && discordAppId.includes('PRESENT')) {
  console.log(' STATUS: READY FOR LIVE DISCORD BOT TESTING ');
} else if (groqKey.includes('PRESENT')) {
  console.log(' STATUS: DISCORD MOCK MODE READY / BOT TOKEN PENDING ');
  console.log(' Tip: To test locally with mocks, run: npm test');
  console.log(' Tip: Add DISCORD_BOT_TOKEN to .env to connect live bot.');
} else {
  console.log(' STATUS: MOCK MODE READY / LIVE CREDENTIALS PENDING ');
}
console.log('====================================================\n');
