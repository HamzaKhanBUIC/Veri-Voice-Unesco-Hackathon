const LanguageDetector = require('../backend/src/services/language/LanguageDetector');

describe('Multilingual Claim Preservation & Detection Layer', () => {
  it('should detect Urdu claim and preserve original text', () => {
    const text = 'کیا پولیو کے قطرے محفوظ ہیں؟';
    const res = LanguageDetector.detect(text);

    expect(res.originalText).toBe(text);
    expect(res.detectedLanguage).toBe('ur');
    expect(res.verificationLanguage).toBe('ur');
    expect(res.responseLanguage).toBe('ur');
  });

  it('should detect English claim', () => {
    const text = 'Are polio vaccines safe for children?';
    const res = LanguageDetector.detect(text);

    expect(res.originalText).toBe(text);
    expect(res.detectedLanguage).toBe('en');
    expect(res.verificationLanguage).toBe('en');
  });

  it('should detect Spanish claim', () => {
    const text = '¿Las vacunas causan autismo en los niños?';
    const res = LanguageDetector.detect(text);

    expect(res.originalText).toBe(text);
    expect(res.detectedLanguage).toBe('es');
    expect(res.responseLanguage).toBe('es');
  });

  it('should detect Indonesian claim', () => {
    const text = 'Apakah vaksin aman untuk anak anak di indonesia?';
    const res = LanguageDetector.detect(text);

    expect(res.originalText).toBe(text);
    expect(res.detectedLanguage).toBe('id');
  });

  it('should detect Roman Urdu claim and preserve original text', () => {
    const text = 'kya polio ke qatray mahfooz hain?';
    const res = LanguageDetector.detect(text);

    expect(res.originalText).toBe(text);
    expect(res.detectedLanguage).toBe('ur-Roman');
    expect(res.verificationLanguage).toBe('ur');
  });

  it('should handle empty or null text gracefully', () => {
    const res = LanguageDetector.detect('');
    expect(res.detectedLanguage).toBe('en');
  });
});
