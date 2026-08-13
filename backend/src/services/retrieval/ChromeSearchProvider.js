const https = require('https');

/**
 * Chrome / Live Web Search Provider.
 * Queries live encyclopedic and web search APIs (Wikipedia REST API & DuckDuckGo) for real-time evidence retrieval.
 */
class ChromeSearchProvider {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 8000;
  }

  /**
   * Searches live web and encyclopedic sources for evidence snippets.
   * @param {string} queryText 
   * @returns {Promise<Array<{ claimId: string, claim: string, verdict: string, explanation: string, score: number, isLiveWeb: boolean, sources: Array }>>}
   */
  async searchGoogleWeb(queryText) {
    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      return [];
    }

    const cleanQuery = queryText.trim();
    const results = [];

    // 1. Query Wikipedia REST Search API (High Authority Encyclopedic Science & General Knowledge)
    try {
      const wikiResults = await this.searchWikipedia(cleanQuery);
      if (wikiResults && wikiResults.length > 0) {
        results.push(...wikiResults);
      }
    } catch (err) {
      console.warn(`⚠️ ChromeSearchProvider Wikipedia search failed: ${err.message}`);
    }

    // 2. Query DuckDuckGo HTML Search
    try {
      const ddgResults = await this.searchDuckDuckGo(cleanQuery);
      if (ddgResults && ddgResults.length > 0) {
        results.push(...ddgResults);
      }
    } catch (err) {
      console.warn(`⚠️ ChromeSearchProvider DuckDuckGo search failed: ${err.message}`);
    }

    return results;
  }

  /**
   * Wikipedia REST Search API
   */
  async searchWikipedia(query) {
    const encoded = encodeURIComponent(query);
    const urlStr = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json`;

    const jsonText = await this.fetchUrl(urlStr, {
      'User-Agent': 'VeriVoiceBot/1.0 (UNESCO Hackathon Verification Assistant; contact@verivoice.org)',
    });

    const parsed = JSON.parse(jsonText);
    const searchItems = parsed?.query?.search || [];
    const results = [];

    for (let i = 0; i < Math.min(searchItems.length, 3); i++) {
      const item = searchItems[i];
      const cleanSnippet = (item.snippet || '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      const pageTitle = item.title;
      const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;

      if (cleanSnippet.length > 20) {
        results.push({
          claimId: `WIKI_SEARCH_${item.pageid}_${i}`,
          claim: `Wikipedia Evidence (${pageTitle}): ${cleanSnippet.slice(0, 120)}...`,
          verdict: 'LIVE_WEB_SEARCH',
          explanation: cleanSnippet,
          score: 16,
          isLiveWeb: true,
          sources: [
            {
              title: pageTitle,
              organization: 'Wikipedia / Reference Knowledge',
              url: pageUrl,
              authorityLevel: 'PRIMARY_AUTHORITY',
            },
          ],
        });
      }
    }

    return results;
  }

  /**
   * DuckDuckGo HTML Search
   */
  async searchDuckDuckGo(query) {
    const encoded = encodeURIComponent(query);
    const urlStr = `https://html.duckduckgo.com/html/?q=${encoded}`;

    const html = await this.fetchUrl(urlStr, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });

    const results = [];
    const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi;
    let snippetMatch;
    let count = 0;

    while ((snippetMatch = snippetRegex.exec(html)) !== null && count < 2) {
      const cleanSnippet = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
      if (cleanSnippet.length > 25) {
        results.push({
          claimId: `DDG_SEARCH_${Date.now()}_${count}`,
          claim: `Live Search Evidence (${query}): ${cleanSnippet.slice(0, 100)}...`,
          verdict: 'LIVE_WEB_SEARCH',
          explanation: cleanSnippet,
          score: 12,
          isLiveWeb: true,
          sources: [
            {
              title: `Live Search Result for ${query}`,
              organization: 'DuckDuckGo Live Web Search',
              url: `https://duckduckgo.com/?q=${encoded}`,
            },
          ],
        });
        count++;
      }
    }

    return results;
  }

  fetchUrl(urlStr, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = https.get(urlStr, { headers, timeout: this.timeoutMs }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Web search request timed out'));
      });
    });
  }
}

module.exports = ChromeSearchProvider;
