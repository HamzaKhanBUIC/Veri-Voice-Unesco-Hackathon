const path = require('path');
const RetrievalService = require('../services/retrieval/retrievalService');

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
VeriVoice Retrieval Service CLI (Milestone 2)

Usage:
  node backend/src/cli/runRetrieval.js "<query-text>" [options]

Options:
  --fixture    Use test-fixtures/claims.test-fixture.json instead of production knowledge base
  --limit <N>  Maximum candidate matches to return (default: 3)

Examples:
  node backend/src/cli/runRetrieval.js "زمین سورج کے گرد گردش کرتی ہے" --fixture
  npm run retrieve -- "پانی میں آکسیجن" --fixture
`);
    process.exit(0);
  }

  const useFixture = args.includes('--fixture');
  let queryText = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fixture') continue;
    if (args[i] === '--limit' && args[i + 1]) {
      i++;
      continue;
    }
    if (!queryText) queryText = args[i];
  }

  const datasetPath = useFixture
    ? path.resolve(__dirname, '../../../test-fixtures/claims.test-fixture.json')
    : path.resolve(__dirname, '../../../knowledge/claims.json');

  const retrieval = new RetrievalService({ datasetPath });

  console.log(`\n==================================================`);
  console.log(`VeriVoice Retrieval Engine (Milestone 2)`);
  console.log(`==================================================`);
  console.log(`Dataset Path: ${datasetPath}`);
  console.log(`Dataset Mode: ${useFixture ? 'TEST FIXTURE (Non-Medical)' : 'PRODUCTION KNOWLEDGE BASE'}`);
  console.log(`Query       : "${queryText}"`);
  console.log(`--------------------------------------------------`);

  try {
    const result = retrieval.search(queryText);

    console.log(`Has Evidence: ${result.hasEvidence ? 'YES' : 'NO (No Match)'}`);
    console.log(`Matches Count: ${result.matches.length} / ${result.datasetSize} total claims`);

    if (result.note) {
      console.log(`Note        : ${result.note}`);
    }

    console.log(`--------------------------------------------------`);

    if (result.matches.length > 0) {
      result.matches.forEach((match, index) => {
        console.log(`[#${index + 1}] Candidate Claim ID: ${match.claimId} (Score: ${match.score})`);
        console.log(`     Claim      : "${match.claim}"`);
        console.log(`     Verdict    : ${match.verdict}`);
        console.log(`     Explanation: "${match.explanation}"`);
        console.log(`     Sources    : ${match.sources.map((s) => `${s.organization} (${s.title})`).join(', ')}`);
        console.log(`     Matched KWs: [${match.matchedKeywords.join(', ')}]`);
        console.log(`--------------------------------------------------`);
      });
    } else {
      console.log(`No relevant candidate evidence matches found for query.`);
      console.log(`--------------------------------------------------`);
    }

    console.log(`==================================================\n`);
  } catch (err) {
    console.error(`\n❌ Retrieval Error: ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
