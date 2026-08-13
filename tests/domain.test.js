const { DomainDetector, DOMAINS } = require('../backend/src/services/domain/DomainDetector');

describe('DomainDetector Unit Tests', () => {
  it('should detect EARTH_SPACE domain for astronomy claims', () => {
    const res = DomainDetector.detect('Is Earth flat?');
    expect(res.domain).toBe(DOMAINS.EARTH_SPACE);
  });

  it('should detect HEALTH domain for vaccine claims', () => {
    const res = DomainDetector.detect('Can vaccines cause autism?');
    expect(res.domain).toBe(DOMAINS.HEALTH);
  });

  it('should detect WEATHER_CLIMATE domain for heatwave claims', () => {
    const res = DomainDetector.detect('Does climate change affect extreme heatwaves?');
    expect(res.domain).toBe(DOMAINS.WEATHER_CLIMATE);
  });

  it('should default to GENERAL domain when text is ambiguous', () => {
    const res = DomainDetector.detect('Random statement without domain keywords');
    expect(res.domain).toBe(DOMAINS.GENERAL);
  });

  it('should respect explicit requestedDomain hint', () => {
    const res = DomainDetector.detect('Random query', 'HEALTH');
    expect(res.domain).toBe(DOMAINS.HEALTH);
    expect(res.confidence).toBe('HIGH');
  });
});
