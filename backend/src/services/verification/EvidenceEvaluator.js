/**
 * Evidence Evaluator Service.
 * Evaluates retrieved evidence metadata independent of LLM reasoning.
 * Assesses evidenceStrength (STRONG_EVIDENCE, SUFFICIENT_EVIDENCE, WEAK_EVIDENCE, NO_EVIDENCE, CONFLICTING_EVIDENCE),
 * independentSourceCount, and qualitative confidence (HIGH, MEDIUM, LOW).
 * Enforces strict confidence capping when search execution is SEARCH_PARTIAL.
 */

const EVIDENCE_STRENGTH = {
  STRONG_EVIDENCE: 'STRONG_EVIDENCE',
  SUFFICIENT_EVIDENCE: 'SUFFICIENT_EVIDENCE',
  WEAK_EVIDENCE: 'WEAK_EVIDENCE',
  NO_EVIDENCE: 'NO_EVIDENCE',
  CONFLICTING_EVIDENCE: 'CONFLICTING_EVIDENCE',
};

class EvidenceEvaluator {
  /**
   * Deduplicates syndicated news wire copy or identical text content across domains.
   * @param {Array<object>} matches 
   * @returns {Array<object>} Deduplicated matches array
   */
  static deduplicateMatches(matches = []) {
    if (!Array.isArray(matches) || matches.length === 0) return [];
    const uniqueMatches = [];
    const seenTexts = [];

    for (const m of matches) {
      const text = (m.explanation || m.claim || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (!text || text.length < 15) {
        uniqueMatches.push(m);
        continue;
      }

      let isDuplicate = false;
      const tokensA = new Set(text.split(/\s+/).filter((t) => t.length > 3));

      for (const seen of seenTexts) {
        const tokensB = new Set(seen.split(/\s+/).filter((t) => t.length > 3));
        const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
        const union = new Set([...tokensA, ...tokensB]);
        const similarity = union.size > 0 ? intersection.size / union.size : 0;

        if (similarity > 0.70) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        seenTexts.push(text);
        uniqueMatches.push(m);
      }
    }

    return uniqueMatches;
  }

  /**
   * Evaluates retrieved evidence matches.
   * @param {Array<object>} matches 
   * @param {object} [options] - Options including searchStatus
   * @returns {{ evidenceStrength: string, confidence: string, independentSourceCount: number, primarySourceCount: number }}
   */
  static evaluate(matches = [], options = {}) {
    if (!Array.isArray(matches) || matches.length === 0) {
      return {
        evidenceStrength: EVIDENCE_STRENGTH.NO_EVIDENCE,
        confidence: 'LOW',
        independentSourceCount: 0,
        primarySourceCount: 0,
      };
    }

    const deduplicated = EvidenceEvaluator.deduplicateMatches(matches);

    const uniqueDomains = new Set();
    let primarySourceCount = 0;
    let secondarySourceCount = 0;

    const isPrimary = (lvl) =>
      lvl === 'PRIMARY_INSTITUTIONAL' ||
      lvl === 'PRIMARY_SCIENTIFIC_DATA' ||
      lvl === 'OFFICIAL_GOVERNMENT' ||
      lvl === 'PRIMARY_AUTHORITY';

    const isSecondary = (lvl) =>
      lvl === 'SCIENTIFIC_REVIEW' ||
      lvl === 'FACT_CHECKING_ORGANIZATION' ||
      lvl === 'RESEARCH_NETWORK' ||
      lvl === 'SECONDARY_REPUTABLE' ||
      lvl === 'SECONDARY_AUTHORITY';

    for (const m of deduplicated) {
      if (m.sources && Array.isArray(m.sources)) {
        for (const s of m.sources) {
          if (s.domain) uniqueDomains.add(s.domain);
          if (isPrimary(s.authorityLevel)) primarySourceCount++;
          if (isSecondary(s.authorityLevel)) secondarySourceCount++;
        }
      }
      if (m.url) {
        try {
          const dom = new URL(m.url.startsWith('http') ? m.url : `https://${m.url}`).hostname;
          uniqueDomains.add(dom);
        } catch (e) {}
      }
      if (isPrimary(m.authorityLevel)) primarySourceCount++;
    }

    const independentSourceCount = Math.max(deduplicated.length, uniqueDomains.size);

    let evidenceStrength = EVIDENCE_STRENGTH.WEAK_EVIDENCE;
    let confidence = 'LOW';

    if (primarySourceCount >= 2 || (primarySourceCount >= 1 && independentSourceCount >= 2)) {
      evidenceStrength = EVIDENCE_STRENGTH.STRONG_EVIDENCE;
      confidence = 'HIGH';
    } else if (primarySourceCount >= 1 || independentSourceCount >= 2 || secondarySourceCount >= 2) {
      evidenceStrength = EVIDENCE_STRENGTH.SUFFICIENT_EVIDENCE;
      confidence = 'MEDIUM';
    } else if (deduplicated.length > 0) {
      evidenceStrength = EVIDENCE_STRENGTH.WEAK_EVIDENCE;
      confidence = 'LOW';
    }

    // Strict Rule for SEARCH_PARTIAL: Partial search results CANNOT produce a HIGH confidence verdict automatically
    if (options.searchStatus === 'SEARCH_PARTIAL') {
      if (confidence === 'HIGH') {
        confidence = 'MEDIUM';
      }
      if (evidenceStrength === EVIDENCE_STRENGTH.STRONG_EVIDENCE) {
        evidenceStrength = EVIDENCE_STRENGTH.SUFFICIENT_EVIDENCE;
      }
    }

    return {
      evidenceStrength,
      confidence,
      independentSourceCount,
      primarySourceCount,
    };
  }
}

module.exports = {
  EVIDENCE_STRENGTH,
  EvidenceEvaluator,
};
