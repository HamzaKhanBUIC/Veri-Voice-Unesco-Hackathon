/**
 * Evidence Evaluator Service.
 * Evaluates retrieved evidence metadata independent of LLM reasoning.
 * Assesses evidenceStrength (STRONG_EVIDENCE, SUFFICIENT_EVIDENCE, WEAK_EVIDENCE, NO_EVIDENCE, CONFLICTING_EVIDENCE),
 * independentSourceCount, and qualitative confidence (HIGH, MEDIUM, LOW).
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
   * Evaluates retrieved evidence matches.
   * @param {Array<object>} matches 
   * @returns {{ evidenceStrength: string, confidence: string, independentSourceCount: number, primarySourceCount: number }}
   */
  static evaluate(matches = []) {
    if (!Array.isArray(matches) || matches.length === 0) {
      return {
        evidenceStrength: EVIDENCE_STRENGTH.NO_EVIDENCE,
        confidence: 'LOW',
        independentSourceCount: 0,
        primarySourceCount: 0,
      };
    }

    const uniqueDomains = new Set();
    let primarySourceCount = 0;
    let secondarySourceCount = 0;

    for (const m of matches) {
      if (m.sources && Array.isArray(m.sources)) {
        for (const s of m.sources) {
          if (s.domain) uniqueDomains.add(s.domain);
          if (s.authorityLevel === 'PRIMARY_AUTHORITY') primarySourceCount++;
          if (s.authorityLevel === 'SECONDARY_AUTHORITY') secondarySourceCount++;
        }
      }
      if (m.url) {
        try {
          const dom = new URL(m.url.startsWith('http') ? m.url : `https://${m.url}`).hostname;
          uniqueDomains.add(dom);
        } catch (e) {}
      }
      if (m.authorityLevel === 'PRIMARY_AUTHORITY') primarySourceCount++;
    }

    const independentSourceCount = Math.max(matches.length, uniqueDomains.size);

    let evidenceStrength = EVIDENCE_STRENGTH.WEAK_EVIDENCE;
    let confidence = 'LOW';

    if (primarySourceCount >= 2 || (primarySourceCount >= 1 && independentSourceCount >= 2)) {
      evidenceStrength = EVIDENCE_STRENGTH.STRONG_EVIDENCE;
      confidence = 'HIGH';
    } else if (primarySourceCount >= 1 || independentSourceCount >= 2 || secondarySourceCount >= 2) {
      evidenceStrength = EVIDENCE_STRENGTH.SUFFICIENT_EVIDENCE;
      confidence = 'MEDIUM';
    } else if (matches.length > 0) {
      evidenceStrength = EVIDENCE_STRENGTH.WEAK_EVIDENCE;
      confidence = 'LOW';
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
