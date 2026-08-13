/**
 * Real Provider Verification Diagnostic CLI
 * Usage: npm run verify:real -- "پولیو قطرے کے فائدے"
 * Safe diagnostic script that tests live LLM verification without mutating production data or leaking keys.
 */

require('dotenv').config();
const VerificationEngine = require('../backend/src/services/verification/verificationEngine');

async function runRealVerification() {
  const args = process.argv.slice(2);
  const claimText = args.length > 0 ? args.join(' ') : 'پولیو کے قطرے بچوں کو شل ہونے سے بچاتے ہیں';

  console.log('====================================================');
  console.log('       VeriVoice Real Verification Diagnostic       ');
  console.log('====================================================\n');
  console.log(`[+] Input Claim:         "${claimText}"`);
  console.log(`[+] Configured Provider: ${process.env.LLM_PROVIDER || 'groq'}`);

  const hasGroqKey = Boolean(process.env.GROQ_API_KEY);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

  if (!hasGroqKey && !hasOpenAIKey && process.env.LLM_PROVIDER !== 'mock') {
    console.log('\n⚠️ NOTICE: No live LLM API key detected in .env.');
    console.log('  Running in Safe Standalone / Fallback Mode.');
    console.log('  To enable live verification, add GROQ_API_KEY to your .env file.\n');
  }

  // Staging evidence fixtures for diagnostic testing
  const sampleEvidence = [
    {
      claimId: 'claim-polio-test-001',
      claim: 'پولیو کے قطرے بچوں کے لیے محفوظ اور ضروری ہیں',
      verdict: 'TRUE',
      explanation: 'عالمی ادارہ صحت کے مطابق پولیو قطرے بچوں کو عمر بھر کی معذوری سے محفوظ رکھتے ہیں۔',
      score: 0.92,
      sources: [
        {
          title: 'WHO Polio Eradication Guidance',
          organization: 'WHO',
          url: 'https://www.who.int/pakistan',
        },
      ],
    },
  ];

  const GroqVerificationProvider = require('../backend/src/services/verification/GroqVerificationProvider');
  
  try {
    let provider;
    if (hasGroqKey) {
      console.log('[+] Initializing Live Groq Llama 3.3 70B Provider...');
      provider = new GroqVerificationProvider();
    }
    const engine = new VerificationEngine({ provider });
    console.log('[+] Executing Verification Engine...');
    const result = await engine.verifyClaim(claimText, sampleEvidence);

    console.log('\n--- VERIFICATION RESULT ---');
    console.log(`Verdict:     ${result.verdict}`);
    console.log(`Confidence:  ${result.confidence}`);
    console.log(`Explanation: ${result.explanation}`);
    console.log(`Evidence Cited: ${result.evidence ? result.evidence.length : 0} items`);
    console.log('---------------------------\n');
    console.log('✅ Real verification diagnostic executed successfully.');
  } catch (err) {
    console.error(`❌ Verification Execution Error: ${err.message}`);
  }
}

runRealVerification();
