const QueryStrategy = require('../backend/src/services/retrieval/QueryStrategy');

describe('QueryStrategy Unit Tests', () => {
  it('should generate targeted search queries based on domain', () => {
    const queries = QueryStrategy.generateQueries('Is Earth flat?', 'VERIFICATION', 'EARTH_SPACE');
    expect(queries.length).toBeGreaterThanOrEqual(1);
    expect(queries.length).toBeLessThanOrEqual(3);
    expect(queries[0]).toBe('Is Earth flat?');
    expect(queries.some((q) => q.includes('NASA') || q.includes('USGS'))).toBe(true);
  });

  it('should generate clean research queries for general research mode', () => {
    const queries = QueryStrategy.generateQueries('Who discovered penicillin?', 'GENERAL_RESEARCH', 'HISTORY');
    expect(queries[0]).toBe('Who discovered penicillin?');
  });
});
