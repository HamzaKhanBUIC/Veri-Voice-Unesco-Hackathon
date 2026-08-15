const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const EdgeTTSProvider = require('../backend/src/services/tts/EdgeTTSProvider');

const tmpDir = path.join(__dirname, '../tmp/bench');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const TEST_SENTENCES = {
  en: "The World Health Organization confirms that vaccines undergo rigorous clinical testing and do not cause autism.",
  ur: "عالمی ادارہ صحت کے مطابق پولیو کے قطرے مکمل طور پر محفوظ ہیں اور بچوں کو عمر بھر کی معذوری سے بچاتے ہیں۔",
  es: "La Organización Mundial de la Salud confirma que las vacunas son seguras y no causan autismo.",
  id: "Organisasi Kesehatan Dunia menegaskan bahwa vaksinasi aman dan melindungi anak-anak dari penyakit berbahaya."
};

async function benchmarkSingle(provider, text, lang, id) {
  const outputPath = path.join(tmpDir, `bench_${lang}_${id}.mp3`);
  const t0 = performance.now();
  const startMem = process.memoryUsage().heapUsed;

  try {
    const result = await provider.synthesize(text, outputPath, { language: lang });
    const t1 = performance.now();
    const endMem = process.memoryUsage().heapUsed;
    const stat = fs.statSync(outputPath);

    return {
      success: true,
      lang,
      latencyMs: Math.round(t1 - t0),
      fileSizeBytes: stat.size,
      memoryDeltaBytes: endMem - startMem,
      outputPath: result.outputPath,
      provider: result.provider,
    };
  } catch (err) {
    const t1 = performance.now();
    return {
      success: false,
      lang,
      latencyMs: Math.round(t1 - t0),
      error: err.message,
    };
  }
}

async function runBenchmark() {
  console.log('===============================================================');
  console.log('🔬 VERIVOICE TTS FEASIBILITY & CONCURRENCY BENCHMARK');
  console.log('===============================================================\n');

  const provider = new EdgeTTSProvider();
  const report = {
    singleRequests: {},
    concurrency2: {},
    concurrency3: {},
    audioValidation: {},
  };

  // 1. Single Request Latency & Audio Output Validation across EN, UR, ES, ID
  console.log('--- 1. Single Request Benchmarks (EN, UR, ES, ID) ---');
  for (const [lang, text] of Object.entries(TEST_SENTENCES)) {
    console.log(`Testing Language: ${lang.toUpperCase()} ...`);
    const res = await benchmarkSingle(provider, text, lang, 'single');
    report.singleRequests[lang] = res;
    console.log(`  -> Status: ${res.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  -> Latency: ${res.latencyMs} ms`);
    console.log(`  -> Output Size: ${res.fileSizeBytes} bytes`);
    console.log(`  -> Provider Engine: ${res.provider}\n`);
  }

  // 2. Concurrency Level 2 (Simultaneous Requests)
  console.log('--- 2. Concurrency Level 2 Benchmark (Simultaneous UR + EN) ---');
  const c2Start = performance.now();
  const c2Promises = [
    benchmarkSingle(provider, TEST_SENTENCES.ur, 'ur', 'c2_1'),
    benchmarkSingle(provider, TEST_SENTENCES.en, 'en', 'c2_2'),
  ];
  const c2Results = await Promise.all(c2Promises);
  const c2TotalMs = Math.round(performance.now() - c2Start);
  report.concurrency2 = {
    totalWallTimeMs: c2TotalMs,
    results: c2Results,
  };
  console.log(`  -> 2 Concurrent Requests Total Wall Time: ${c2TotalMs} ms`);
  c2Results.forEach((r, idx) => console.log(`     Req #${idx + 1} (${r.lang}): ${r.latencyMs} ms, ${r.fileSizeBytes} bytes`));
  console.log();

  // 3. Concurrency Level 3 (Simultaneous Requests)
  console.log('--- 3. Concurrency Level 3 Benchmark (Simultaneous UR + ES + ID) ---');
  const c3Start = performance.now();
  const c3Promises = [
    benchmarkSingle(provider, TEST_SENTENCES.ur, 'ur', 'c3_1'),
    benchmarkSingle(provider, TEST_SENTENCES.es, 'es', 'c3_2'),
    benchmarkSingle(provider, TEST_SENTENCES.id, 'id', 'c3_3'),
  ];
  const c3Results = await Promise.all(c3Promises);
  const c3TotalMs = Math.round(performance.now() - c3Start);
  report.concurrency3 = {
    totalWallTimeMs: c3TotalMs,
    results: c3Results,
  };
  console.log(`  -> 3 Concurrent Requests Total Wall Time: ${c3TotalMs} ms`);
  c3Results.forEach((r, idx) => console.log(`     Req #${idx + 1} (${r.lang}): ${r.latencyMs} ms, ${r.fileSizeBytes} bytes`));
  console.log();

  console.log('===============================================================');
  console.log('BENCHMARK RUN SUMMARY:');
  console.log(JSON.stringify(report, null, 2));
  console.log('===============================================================');

  return report;
}

runBenchmark().catch((e) => console.error(e));
