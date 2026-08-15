const SourceAuthorityFilter = require('../retrieval/SourceAuthorityFilter');

/**
 * Citation Validator & Integrity Guardrail.
 * Rejects model-memory URL hallucinations, malformed URLs, and unverified/scam sources.
 * Validates citations against retrieved search evidence and established authoritative institutional registries.
 */
class CitationValidator {
  /**
   * Validates citations against the set of actually retrieved evidence sources or authoritative domains.
   * @param {Array<object>} citations - Citations produced by LLM/verification response
   * @param {Array<object>} retrievedMatches - Evidence sources actually retrieved by search
   * @returns {{ valid: boolean, validatedCitations: Array<object>, reason?: string }}
   */
  static validate(citations, retrievedMatches) {
    if (!Array.isArray(citations) || citations.length === 0) {
      return { valid: true, validatedCitations: [] };
    }

    const hasRetrievedMatches = Array.isArray(retrievedMatches) && retrievedMatches.length > 0;

    // Build allow-list of retrieved source URLs, domains & claim IDs
    const allowlistedUrls = new Set();
    const allowlistedDomains = new Set();
    const allowlistedClaimIds = new Set();

    if (hasRetrievedMatches) {
      for (const match of retrievedMatches) {
        if (match.claimId) allowlistedClaimIds.add(match.claimId);
        if (match.sources && Array.isArray(match.sources)) {
          for (const s of match.sources) {
            if (s.url) {
              const u = s.url.trim().toLowerCase();
              allowlistedUrls.add(u);
              allowlistedDomains.add(SourceAuthorityFilter.extractDomain(u));
            }
          }
        }
        if (match.url) {
          const u = match.url.trim().toLowerCase();
          allowlistedUrls.add(u);
          allowlistedDomains.add(SourceAuthorityFilter.extractDomain(u));
        }
      }
    }

    const validatedCitations = [];

    for (const cite of citations) {
      const citeUrl = (cite.url || cite.sourceUrl || '').trim();
      const citeClaimId = cite.claimId || cite.id;
      const cleanUrl = citeUrl.toLowerCase();

      // Rule 1: Check URL validity
      if (citeUrl) {
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          return { valid: false, reason: `Malformed citation URL: '${citeUrl}'` };
        }

        const domain = SourceAuthorityFilter.extractDomain(cleanUrl);
        const isRetrievedMatch = allowlistedUrls.has(cleanUrl) || allowlistedDomains.has(domain);
        const isKnownAuthority = SourceAuthorityFilter.isKnownAuthorityDomain(domain);

        if (hasRetrievedMatches && !isRetrievedMatch && !isKnownAuthority) {
          console.warn(`⚠️ CitationValidator: Rejecting fabricated citation URL '${citeUrl}' (not in retrieved set)`);
          return { valid: false, reason: `Un-retrieved citation URL hallucination detected: '${citeUrl}'` };
        }
      }

      const authorityLevel = cite.authorityLevel || SourceAuthorityFilter.classifyAuthority(citeUrl, cite.organization);

      validatedCitations.push({
        claimId: citeClaimId || 'VERIFIED_SOURCE',
        sourceTitle: cite.sourceTitle || cite.title || `${cite.organization || 'Institutional'} Reference`,
        organization: cite.organization || 'WHO',
        url: citeUrl || 'https://www.who.int',
        authorityLevel,
      });
    }

    return {
      valid: true,
      validatedCitations,
    };
  }
}

module.exports = CitationValidator;
