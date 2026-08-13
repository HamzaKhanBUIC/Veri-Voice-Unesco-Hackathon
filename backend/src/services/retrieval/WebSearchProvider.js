const https = require('https');

/**
 * Live Real-Time Web & Disaster News Search Provider.
 * Fetches real-time breaking news, flood/tsunami alerts, and current events.
 */
class WebSearchProvider {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.TAVILY_API_KEY || process.env.SERPER_API_KEY || null;
    this.timeoutMs = options.timeoutMs || 8000;
  }

  /**
   * Performs live real-time news & search query.
   * @param {string} queryText - Query string in Urdu or English
   * @returns {Promise<Array<{ title: string, snippet: string, source: string, url: string, isLiveNews: boolean }>>}
   */
  async searchLiveNews(queryText) {
    if (!queryText || typeof queryText !== 'string' || queryText.trim() === '') {
      return [];
    }

    const cleanQuery = queryText.trim();

    try {
      // 1. Tavily API if key exists
      if (process.env.TAVILY_API_KEY) {
        return await this.fetchTavilyNews(cleanQuery);
      }

      // 2. Free DuckDuckGo Live Search API (Zero API key required)
      return await this.fetchDuckDuckGoNews(cleanQuery);
    } catch (err) {
      console.warn(`⚠️ WebSearchProvider: Live news fetch failed: ${err.message}`);
      return [];
    }
  }

  /**
   * Tavily Search API
   */
  async fetchTavilyNews(query) {
    const payload = JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: `${query} news disaster flood tsunami alert`,
      search_depth: 'basic',
      include_answer: true,
      max_results: 5,
    });

    const responseText = await this.httpPost('https://api.tavily.com/search', payload, {
      'Content-Type': 'application/json',
    });

    const data = JSON.parse(responseText);
    const results = (data.results || []).map((r) => ({
      claimId: `LIVE_NEWS_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      claim: r.title,
      verdict: 'LIVE_NEWS',
      explanation: r.content || r.snippet,
      score: 15,
      isLiveNews: true,
      sources: [
        {
          title: r.title,
          organization: new URL(r.url).hostname.replace('www.', ''),
          url: r.url,
        },
      ],
    }));

    return results;
  }

  /**
   * Free DuckDuckGo Instant News Search (Zero API key fallback)
   */
  async fetchDuckDuckGoNews(query) {
    const encoded = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encoded}+news`;

    const html = await this.httpGet(url, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const results = [];
    const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
    const titleRegex = /<a class="result__url[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

    let match;
    let count = 0;
    while ((match = snippetRegex.exec(html)) !== null && count < 3) {
      const cleanSnippet = match[1].replace(/<[^>]+>/g, '').trim();
      if (cleanSnippet.length > 20) {
        results.push({
          claimId: `LIVE_NEWS_DDG_${Date.now()}_${count}`,
          claim: `Live News Update for: ${query}`,
          verdict: 'LIVE_NEWS',
          explanation: cleanSnippet,
          score: 12,
          isLiveNews: true,
          sources: [
            {
              title: `Live Search Alert: ${query}`,
              organization: 'Live Web News Search',
              url: 'https://news.google.com',
            },
          ],
        });
        count++;
      }
    }

    return results;
  }

  httpGet(urlStr, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = https.get(urlStr, { headers, timeout: this.timeoutMs }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Search request timed out'));
      });
    });
  }

  httpPost(urlStr, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(urlStr);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
        timeout: this.timeoutMs,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Search request timed out'));
      });
      req.write(body);
      req.end();
    });
  }
}

module.exports = WebSearchProvider;
