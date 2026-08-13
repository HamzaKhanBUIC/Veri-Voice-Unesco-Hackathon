/**
 * MILESTONE 1 VERIFICATION TEST STUB.
 * 
 * ⚠️ IMPORTANT GOVERNANCE NOTICE:
 * This module is exclusively a temporary verification response stub for Milestone 1.
 * IT DOES NOT PERFORM REAL FACTUAL VERIFICATION OR RETRIEVE EVIDENCE.
 * The real LLM-based evidence-grounded verification engine will be implemented in Milestone 3.
 */
class VerificationStub {
  constructor() {
    this.isStub = true;
  }

  /**
   * Generates a temporary test response for a transcribed claim.
   * @param {object|string} transcriptInput - STT result object or raw transcript string
   * @returns {Promise<{ transcript: string, responseText: string, isStub: boolean, note: string }>}
   */
  async process(transcriptInput) {
    const transcriptText = typeof transcriptInput === 'object' ? transcriptInput.text : transcriptInput;

    if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim() === '') {
      throw new Error('VerificationStub: Transcript text is empty or invalid.');
    }

    const stubResponseText =
      'یہ ایک آزمائشی جواب ہے (ٹیسٹ ورژن)۔ حتمی تصدیق اگلے مرحلے میں معتبر طبی معلومات کی بنیاد پر کی جائے گی۔';

    return {
      transcript: transcriptText.trim(),
      responseText: stubResponseText,
      isStub: true,
      note: 'MILESTONE_1_TEST_STUB: Factual verification engine not invoked.',
    };
  }
}

module.exports = VerificationStub;
