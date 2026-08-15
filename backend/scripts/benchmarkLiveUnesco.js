/**
 * Compact Live Benchmark Test for UNESCO / MIL Source Expansion
 * Evaluates 6 representative queries without mock shortcuts.
 */

const { DomainDetector } = require('../src/services/domain/DomainDetector');
const QueryStrategy = require('../src/services/retrieval/QueryStrategy');
const SourceAuthorityFilter = require('../src/services/retrieval/SourceAuthorityFilter');

const BENCHMARK_CASES = [
  {
    category: 'Health',
    input: 'Are polio drops safe for young children?',
    expectedDomain: 'HEALTH',
  },
  {
    category: 'Climate & Atmosphere',
    input: 'Is global temperature rising according to NOAA and satellite records?',
    expectedDomain: 'WEATHER_CLIMATE',
  },
  {
    category: 'Science',
    input: 'Does the Earth orbit the Sun in a gravitational orbit?',
    expectedDomain: 'EARTH_SPACE',
  },
  {
    category: 'AI / Disinformation',
    input: 'How can users identify deepfake videos and coordinated disinformation?',
    expectedDomain: 'AI_DISINFORMATION',
  },
  {
    category: 'Media Information Literacy',
    input: 'What are the core UNESCO Media and Information Literacy principles?',
    expectedDomain: 'MEDIA_INFORMATION_LITERACY',
  },
  {
    category: 'Multilingual (Urdu)',
    input: 'کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟',
    expectedDomain: 'HEALTH',
  },
];

console.log('=== UNESCO & MIL SOURCE EXPANSION BENCHMARK ===\n');

for (const testCase of BENCHMARK_CASES) {
  const start = Date.now();
  const detection = DomainDetector.detect(testCase.input);
  const queries = QueryStrategy.generateQueries(testCase.input, 'VERIFICATION', detection.domain);
  const latencyMs = Date.now() - start;

  console.log(`[${testCase.category}]`);
  console.log(`Input: "${testCase.input}"`);
  console.log(`Detected Domain: ${detection.domain} (Confidence: ${detection.confidence})`);
  console.log(`Generated Targeted Queries (${queries.length}): ${JSON.stringify(queries)}`);
  console.log(`Processing Latency: ${latencyMs}ms\n`);
}

console.log('=== BENCHMARK COMPLETED SUCCESSFULLY ===');
