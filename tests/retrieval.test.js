const path = require('path');
const RetrievalService = require('../backend/src/services/retrieval/retrievalService');

describe('Milestone 2 — Deterministic Retrieval Engine', () => {
  const fixturePath = path.resolve(__dirname, '../test-fixtures/claims.test-fixture.json');
  const emptyProductionPath = path.resolve(__dirname, '../test-fixtures/empty.json');

  describe('Retrieval with Test Fixtures (Non-Medical)', () => {
    let retrieval;

    beforeEach(() => {
      retrieval = new RetrievalService({ datasetPath: fixturePath, enableLiveSearch: false });
    });

    it('should find exact keyword match (زمین سورج)', async () => {
      const result = await retrieval.search('زمین سورج کے گرد گردش کرتی ہے');

      expect(result.hasEvidence).toBe(true);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].claimId).toBe('fixture-earth-001');
      expect(result.matches[0].score).toBeGreaterThanOrEqual(10);
      expect(result.matches[0].verdict).toBe('TRUE');
    });

    it('should find normalized keyword match (چاند)', async () => {
      const result = await retrieval.search('کیا چاند پنیر کا بنا ہے؟');

      expect(result.hasEvidence).toBe(true);
      expect(result.matches[0].claimId).toBe('fixture-moon-002');
      expect(result.matches[0].verdict).toBe('FALSE');
    });

    it('should return hasEvidence: false for completely unrelated queries', async () => {
      const result = await retrieval.search('کمپیوٹر اور انٹرنیٹ');

      expect(result.hasEvidence).toBe(false);
      expect(result.matches.length).toBe(0);
    });

    it('should enforce deterministic ranking order (score descending, ID ascending)', async () => {
      const customDataset = [
        {
          id: 'b-claim',
          claim: 'ٹیسٹ دعویٰ بی',
          verdict: 'TRUE',
          explanation: 'وضاحت',
          keywords: ['ٹیسٹ'],
          sources: [{ title: 'T', organization: 'O', url: 'https://example.org' }],
        },
        {
          id: 'a-claim',
          claim: 'ٹیسٹ دعویٰ اے',
          verdict: 'TRUE',
          explanation: 'وضاحت',
          keywords: ['ٹیسٹ'],
          sources: [{ title: 'T', organization: 'O', url: 'https://example.org' }],
        },
      ];

      const customRetrieval = new RetrievalService({ customDataset, enableLiveSearch: false });
      const result = await customRetrieval.search('ٹیسٹ');

      expect(result.hasEvidence).toBe(true);
      expect(result.matches[0].claimId).toBe('a-claim');
      expect(result.matches[1].claimId).toBe('b-claim');
    });

    it('should respect maxResults limit', async () => {
      const result = await retrieval.search('زمین چاند پانی', { maxResults: 1 });
      expect(result.matches.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Empty Production Dataset Guardrail', () => {
    it('should return hasEvidence: false when production dataset is empty', async () => {
      const retrieval = new RetrievalService({ datasetPath: emptyProductionPath, enableLiveSearch: false });
      const result = await retrieval.search('کیا پولیو کے قطرے محفوظ ہیں؟');

      expect(result.hasEvidence).toBe(false);
      expect(result.matches.length).toBe(0);
    });
  });

  describe('Safety Guardrails', () => {
    it('retrieval should NEVER fabricate candidate claims or sources', async () => {
      const retrieval = new RetrievalService({ datasetPath: fixturePath, enableLiveSearch: false });
      const result = await retrieval.search('غیر متعلقہ سوال جو ڈیٹا سیٹ میں موجود نہیں ہے');

      expect(result.hasEvidence).toBe(false);
      expect(result.matches).toEqual([]);
    });
  });
});
