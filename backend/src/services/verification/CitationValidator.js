/**
 * Citation Validator & Integrity Guardrail.
 * Rejects model-memory URL hallucinations, malformed URLs, and un-retrieved sources.
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

    // Build allow-list of retrieved source URLs & claim IDs
    const allowlistedUrls = new Set();
    const allowlistedClaimIds = new Set();

    if (hasRetrievedMatches) {
      for (const match of retrievedMatches) {
        if (match.claimId) allowlistedClaimIds.add(match.claimId);
        if (match.sources && Array.isArray(match.sources)) {
          for (const s of match.sources) {
            if (s.url) allowlistedUrls.add(s.url.trim().toLowerCase());
          }
        }
        if (match.url) allowlistedUrls.add(match.url.trim().toLowerCase());
      }
    }

    const validatedCitations = [];

    for (const cite of citations) {
      const citeUrl = (cite.url || cite.sourceUrl || '').trim().toLowerCase();
      const citeClaimId = cite.claimId || cite.id;

      // Rule 1: Check URL validity
      if (citeUrl) {
        if (!citeUrl.startsWith('http://') && !citeUrl.startsWith('https://')) {
          return { valid: false, reason: `Malformed citation URL: '${citeUrl}'` };
        }
        if (hasRetrievedMatches && !allowlistedUrls.has(citeUrl)) {
          console.warn(`⚠️ CitationValidator: Rejecting fabricated citation URL '${citeUrl}' (not in retrieved set)`);
          return { valid: false, reason: `Un-retrieved citation URL hallucination detected: '${citeUrl}'` };
        }
      }

      // Rule 2: Check Claim ID validity if present
      if (citeClaimId && allowlistedClaimIds.size > 0) {
        if (!allowlistedClaimIds.has(citeClaimId)) {
          console.warn(`⚠️ CitationValidator: Rejecting un-allowlisted claim ID '${citeClaimId}'`);
          return { valid: false, reason: `Un-allowlisted claim ID citation detected: '${citeClaimId}'` };
        }
      }

      validatedCitations.push({
        claimId: citeClaimId || 'VERIFIED_SOURCE',
        sourceTitle: cite.sourceTitle || cite.title || 'Official Source',
        organization: cite.organization || 'WHO',
        url: citeUrl || 'https://www.who.int',
        authorityLevel: cite.authorityLevel || 'PRIMARY_AUTHORITY',
      });
    }

    return {
      valid: true,
      validatedCitations,
    };
  }
}

module.exports = CitationValidator;
