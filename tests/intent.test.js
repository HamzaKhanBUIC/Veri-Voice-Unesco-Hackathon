const { IntentDetector, INTENTS } = require('../backend/src/services/intent/IntentDetector');

describe('IntentDetector Unit Tests', () => {
  it('should detect VERIFY_CLAIM for question claims', () => {
    const res = IntentDetector.detect('Is Earth flat?');
    expect(res.intent).toBe(INTENTS.VERIFY_CLAIM);
    expect(res.mode).toBe('VERIFICATION');
  });

  it('should detect GENERAL_RESEARCH for research questions', () => {
    const res = IntentDetector.detect('Who discovered penicillin?');
    expect(res.intent).toBe(INTENTS.GENERAL_RESEARCH);
    expect(res.mode).toBe('GENERAL_RESEARCH');
  });

  it('should detect GUIDANCE for help phrases', () => {
    const res = IntentDetector.detect('how to use this bot');
    expect(res.intent).toBe(INTENTS.GUIDANCE);
  });

  it('should respect explicit requestedMode hint', () => {
    const res = IntentDetector.detect('Some text', 'GENERAL_RESEARCH');
    expect(res.mode).toBe('GENERAL_RESEARCH');
  });
});
