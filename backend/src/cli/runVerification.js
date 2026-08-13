const path = require('path');
const RetrievalService = require('../services/retrieval/retrievalService');
const VerificationEngine = require('../services/verification/verificationEngine');
const GroqVerificationProvider = require('../services/verification/GroqVerificationProvider');
const MockVerificationProvider = require('../services/verification/MockVerificationProvider');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
VeriVoice Verification Engine CLI (Milestone 3)

Usage:
  node backend/src/cli/runVerification.js "<user-claim>" [options]

Options:
  --fixture             Use test-fixtures/claims.test-fixture.json instead of production dataset
  --provider <mock|groq> Select LLM verification provider (default: groq if API key exists, else mock)

Examples:
  node backend/src/cli/runVerification.js "زمین سورج کے گرد گردش کرتی ہے" --fixture
  npm run verify -- "پانی میں آکسیجن" --fixture
`);
    process.exit(0);
  }

  const useFixture = args.includes('--fixture');
  let providerName = 'auto';
  let userClaim = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fixture') continue;
    if (args[i] === '--provider' && args[i + 1]) {
      providerName = args[i + 1].toLowerCase();
      i++;
      continue;
    }
    if (!userClaim) userClaim = args[i];
  }

  const datasetPath = useFixture
    ? path.resolve(__dirname, '../../../test-fixtures/claims.test-fixture.json')
    : path.resolve(__dirname, '../../../knowledge/claims.json');

  // Select LLM Provider
  let llmProvider;
  if (providerName === 'groq') {
    llmProvider = new GroqVerificationProvider();
  } else if (providerName === 'mock') {
    llmProvider = new MockVerificationProvider();
  } else {
    // Auto-detect Groq API key
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
      llmProvider = new GroqVerificationProvider();
    } else {
      console.log('ℹ️ Note: GROQ_API_KEY not configured. Using MockVerificationProvider for testing.');
      llmProvider = new MockVerificationProvider();
    }
  }

  console.log(`\n==================================================`);
  console.log(`VeriVoice Verification Engine (Milestone 3)`);
  console.log(`==================================================`);
  console.log(`Claim Text   : "${userClaim}"`);
  console.log(`Dataset Mode : ${useFixture ? 'TEST FIXTURE (Non-Medical)' : 'PRODUCTION KNOWLEDGE BASE'}`);
  console.log(`LLM Provider : ${llmProvider.name}`);
  console.log(`--------------------------------------------------`);

  try {
    // Step 1: Retrieval
    const retrieval = new RetrievalService({ datasetPath });
    const retrievalResult = retrieval.search(userClaim);

    console.log(`Retrieval    : ${retrievalResult.hasEvidence ? 'EVIDENCE FOUND' : 'NO EVIDENCE MATCH'}`);
    console.log(`Matches Count: ${retrievalResult.matches.length} candidate claim(s)`);
    console.log(`--------------------------------------------------`);

    // Step 2: Verification Engine
    const engine = new VerificationEngine({ provider: llmProvider });
    const verdictResult = await engine.verifyClaim(userClaim, retrievalResult.matches);

    console.log(`VERDICT      : ${verdictResult.verdict}`);
    console.log(`CONFIDENCE   : ${(verdictResult.confidence * 100).toFixed(0)}% (${verdictResult.confidence})`);
    console.log(`REASON CODE  : ${verdictResult.reason}`);
    console.log(`--------------------------------------------------`);
    console.log(`EXPLANATION  : "${verdictResult.explanation}"`);
    console.log(`--------------------------------------------------`);
    console.log(`EVIDENCE CITATIONS (${verdictResult.evidence.length}):`);
    if (verdictResult.evidence.length > 0) {
      verdictResult.evidence.forEach((e, idx) => {
        console.log(`  [${idx + 1}] ID: ${e.claimId} | ${e.organization} ("${e.sourceTitle}")`);
        console.log(`      URL: ${e.url}`);
      });
    } else {
      console.log(`  None (0 citations)`);
    }
    console.log(`==================================================\n`);
  } catch (err) {
    console.error(`\n❌ Verification Error: ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
