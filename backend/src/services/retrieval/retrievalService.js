const fs = require('fs');
const path = require('path');
const { validateClaimsDataset } = require('../../models/claimSchema');
const { normalizeText, extractKeywords } = require('../../utils/textUtils');
const WebSearchProvider = require('./WebSearchProvider');
const ChromeSearchProvider = require('./ChromeSearchProvider');
const QueryStrategy = require('./QueryStrategy');

const DEFAULT_PRODUCTION_DATASET_PATH = path.join(process.cwd(), 'knowledge', 'claims.json');

/**
 * Hybrid Retrieval Service (Offline Authoritative Knowledge + Live Real-Time Web & Google Chrome Search).
 * Searches curated claims dataset AND live web/Google search for relevant candidate evidence.
 */
class RetrievalService {
  /**
   * @param {object} [options]
   * @param {string} [options.datasetPath] - Path to claims JSON file (default: knowledge/claims.json)
   * @param {array} [options.customDataset] - Direct in-memory array of claim objects
   * @param {number} [options.minScoreThreshold] - Minimum score required to qualify as a match (default: 5)
   * @param {number} [options.maxResults] - Maximum candidates to return (default: 3)
   * @param {boolean} [options.enableLiveSearch] - Enable real-time live news & web search fallback (default: true)
   */
  constructor(options = {}) {
    this.datasetPath = options.datasetPath || DEFAULT_PRODUCTION_DATASET_PATH;
    this.minScoreThreshold = options.minScoreThreshold !== undefined ? options.minScoreThreshold : 5;
    this.maxResults = options.maxResults || 3;
    this.customDataset = options.customDataset || null;
    this.enableLiveSearch = options.enableLiveSearch !== undefined ? options.enableLiveSearch : true;
    this.webSearchProvider = new WebSearchProvider();
    this.chromeSearchProvider = new ChromeSearchProvider();
  }

  /**
   * Loads and validates the claims dataset.
   * @returns {array} Validated list of claim objects
   */
  loadDataset() {
    if (this.customDataset && Array.isArray(this.customDataset)) {
      const validation = validateClaimsDataset(this.customDataset);
      if (!validation.valid) {
        throw new Error(`RetrievalService: Custom in-memory dataset validation failed: ${validation.errors.join('; ')}`);
      }
      return validation.data;
    }

    if (!fs.existsSync(this.datasetPath)) {
      throw new Error(`RetrievalService: Dataset file not found at ${this.datasetPath}`);
    }

    try {
      const rawContent = fs.readFileSync(this.datasetPath, 'utf-8');
      const parsed = JSON.parse(rawContent);
      const validation = validateClaimsDataset(parsed);
      if (!validation.valid) {
        throw new Error(`RetrievalService: Dataset validation failed for ${this.datasetPath}: ${validation.errors.join('; ')}`);
      }
      return validation.data;
    } catch (err) {
      if (err.name === 'SyntaxError') {
        throw new Error(`RetrievalService: Malformed JSON syntax in dataset file ${this.datasetPath}`);
      }
      throw err;
    }
  }

  /**
   * Searches the dataset AND live Google/web search for candidate matches.
   * @param {string} queryText - User's transcript query string
   * @param {object} [searchOptions] - Override maxResults, mode, or domain
   * @returns {Promise<{ query: string, matches: array, hasEvidence: boolean, datasetSize: number, isLiveNewsSearch: boolean }>}
   */
  async search(queryText, searchOptions = {}) {
    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      return {
        query: queryText || '',
        matches: [],
        hasEvidence: false,
        datasetSize: 0,
      };
    }

    const dataset = this.loadDataset();
    const queryKeywords = extractKeywords(queryText);
    const minThreshold = searchOptions.minScoreThreshold !== undefined ? searchOptions.minScoreThreshold : this.minScoreThreshold;
    const limit = searchOptions.maxResults || this.maxResults;

    const scoredCandidates = [];

    if (dataset.length > 0 && queryKeywords.length > 0) {
      for (const item of dataset) {
        let score = 0;
        let primaryMatched = false;
        const matchedKeywords = new Set();

        const itemKeywordsTokens = new Set((item.keywords || []).map((k) => normalizeText(k)));
        const itemClaimTokens = new Set(extractKeywords(item.claim));
        const itemExplanationTokens = new Set(extractKeywords(item.explanation));

        for (const token of queryKeywords) {
          let tokenMatched = false;

          // Rule 1: Exact match against keywords list (+10 points)
          if (itemKeywordsTokens.has(token)) {
            score += 10;
            tokenMatched = true;
            primaryMatched = true;
          }
          // Rule 2: Word token match inside claim statement text (+5 points)
          else if (itemClaimTokens.has(token)) {
            score += 5;
            tokenMatched = true;
            primaryMatched = true;
          }

          if (tokenMatched) {
            matchedKeywords.add(token);
          }
        }

        // Rule 3: Bonus match inside explanation text (+2 points per keyword) - ONLY if primary match exists
        if (primaryMatched) {
          for (const token of queryKeywords) {
            if (!matchedKeywords.has(token) && itemExplanationTokens.has(token)) {
              score += 2;
              matchedKeywords.add(token);
            }
          }
        }

        if (primaryMatched && score >= minThreshold) {
          scoredCandidates.push({
            claimId: item.id,
            score,
            matchedKeywords: Array.from(matchedKeywords),
            claim: item.claim,
            verdict: item.verdict,
            explanation: item.explanation,
            sources: item.sources || [],
          });
        }
      }
    }

    // Sort offline candidates deterministically
    scoredCandidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.claimId.localeCompare(b.claimId);
    });

    let matches = scoredCandidates.slice(0, limit);
    let isLiveNewsSearch = false;

    // Fallback to Google Chrome Live Web Search if offline dataset yields no match
    if (matches.length === 0 && this.enableLiveSearch) {
      const targetedQueries = searchOptions.queries || QueryStrategy.generateQueries(queryText, searchOptions.mode, searchOptions.domain);
      console.log(`🌐 RetrievalService: Querying Live Search with strategy: [${targetedQueries.join(' | ')}]...`);

      const liveResultsMap = new Map();

      for (const q of targetedQueries) {
        const liveResults = await this.chromeSearchProvider.searchGoogleWeb(q);
        if (liveResults && liveResults.length > 0) {
          for (const res of liveResults) {
            if (!liveResultsMap.has(res.explanation)) {
              liveResultsMap.set(res.explanation, res);
            }
          }
        }
      }

      if (liveResultsMap.size === 0) {
        const fallbackResults = await this.webSearchProvider.searchLiveNews(queryText);
        if (fallbackResults && fallbackResults.length > 0) {
          for (const res of fallbackResults) {
            liveResultsMap.set(res.explanation || res.claim, res);
          }
        }
      }

      const combinedLiveMatches = Array.from(liveResultsMap.values());
      if (combinedLiveMatches.length > 0) {
        matches = combinedLiveMatches.slice(0, limit);
        isLiveNewsSearch = true;
      }
    }

    return {
      query: queryText.trim(),
      matches,
      hasEvidence: matches.length > 0,
      datasetSize: dataset.length,
      isLiveNewsSearch,
    };
  }
}

module.exports = RetrievalService;
