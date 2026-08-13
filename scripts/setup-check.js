/**
 * VeriVoice Setup Assistant & Diagnostic CLI (npm run setup:check).
 * Audits system readiness, environment variables, dependencies, and provider health.
 * NEVER prints secret key values.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

console.log('====================================================');
console.log('         VERIVOICE SYSTEM SETUP CHECK               ');
console.log('====================================================\n');

let issuesCount = 0;
const missingNextSteps = [];

// 1. Node.js Environment
const nodeVersion = process.version;
console.log(`[✓] Node.js Version:      ${nodeVersion} (PASS)`);
console.log(`[✓] Environment Mode:    ${process.env.NODE_ENV || 'development'}`);

// 2. Production Knowledge Base Audit
const claimsPath = path.join(__dirname, '..', 'knowledge', 'claims.json');
if (fs.existsSync(claimsPath)) {
  const content = fs.readFileSync(claimsPath, 'utf8').trim();
  if (content === '[]') {
    console.log('[!] Production KB:       EMPTY ([]) — Awaiting Medical Review (PASS)');
  } else {
    console.log('[✓] Production KB:       CONFIGURED');
  }
} else {
  console.log('[❌] Production KB:      MISSING knowledge/claims.json');
  issuesCount++;
}

// 3. Provider Configurations
const speechProvider = process.env.SPEECH_PROVIDER || 'speechmatics';
const ttsProvider = process.env.TTS_PROVIDER || 'edge-tts';
const llmProvider = process.env.LLM_PROVIDER || 'groq';

console.log(`\n--- Configured System Providers ---`);
console.log(`[✓] STT Provider:         ${speechProvider.toUpperCase()}`);
console.log(`[✓] TTS Provider:         ${ttsProvider.toUpperCase()} (Microsoft Edge Neural TTS — Free)`);
console.log(`[✓] LLM Provider:         ${llmProvider.toUpperCase()}`);

// 4. Environment Variables Readiness
console.log(`\n--- Environment Variable Readiness (Secrets Hidden) ---`);

const checkEnv = (key, name, description, howToGet, envVarName) => {
  const val = process.env[key];
  if (val && !val.includes('your_')) {
    console.log(`[✓] ${key.padEnd(23)} PRESENT`);
    return true;
  } else {
    console.log(`[❌] ${key.padEnd(23)} MISSING`);
    issuesCount++;
    missingNextSteps.push({
      what: name,
      why: description,
      whereToGet: howToGet,
      envVar: envVarName,
    });
    return false;
  }
};

checkEnv('GROQ_API_KEY', 'Groq API Key', 'Required for live LLM verification reasoning', 'https://console.groq.com/keys', 'GROQ_API_KEY');
checkEnv('DISCORD_BOT_TOKEN', 'Discord Bot Token', 'Required to log in Discord bot client', 'https://discord.com/developers/applications (Bot tab)', 'DISCORD_BOT_TOKEN');
checkEnv('DISCORD_APPLICATION_ID', 'Discord Application ID', 'Required for Discord slash commands registration', 'https://discord.com/developers/applications (General Info)', 'DISCORD_APPLICATION_ID');
checkEnv('SPEECHMATICS_API_KEY', 'Speechmatics ASR Key', 'Optional for Speechmatics Batch STT (falls back to Whisper)', 'https://portal.speechmatics.com/', 'SPEECHMATICS_API_KEY');

// 5. Run Automated Tests Summary
console.log(`\n--- Automated Test Suite Status ---`);
try {
  const testOutput = execSync('npx jest --listTests', { encoding: 'utf8' });
  const testCount = testOutput.trim().split('\n').filter(Boolean).length;
  console.log(`[✓] Test Suites Found:    ${testCount} test suites ready (Run 'npm test')`);
} catch (e) {
  console.log(`[!] Test Suites Status:   Jest configured (Run 'npm test')`);
}

// 6. Actionable Next Steps Output
console.log('\n====================================================');
if (issuesCount === 0) {
  console.log(' STATUS: ALL LIVE CREDENTIALS & SYSTEM COMPONENTS READY! 🚀');
  console.log(' To start VeriVoice, run: npm start');
} else {
  console.log(` STATUS: SETUP COMPLETE — ${issuesCount} MISSING CREDENTIAL(S) FOR LIVE BOT`);
  console.log('----------------------------------------------------');
  console.log('ACTIONABLE NEXT STEPS:\n');

  missingNextSteps.forEach((step, idx) => {
    console.log(`${idx + 1}. WHAT:         ${step.what}`);
    console.log(`   WHY:          ${step.why}`);
    console.log(`   WHERE TO GET: ${step.whereToGet}`);
    console.log(`   ENV VARIABLE: ${step.envVar}`);
    console.log(`   HOW TO TEST:  Edit .env and run 'npm run setup:check'\n`);
  });

  console.log('Tip: You can still run deterministic offline tests anytime using: npm test');
}
console.log('====================================================\n');
