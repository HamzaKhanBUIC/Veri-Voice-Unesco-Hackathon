const MockVerificationProvider = require('./MockVerificationProvider');
const GroqVerificationProvider = require('./GroqVerificationProvider');
const { validateVerdict } = require('../../models/verdictSchema');
const { createUncertainFallback, FALLBACK_REASONS } = require('./fallback');
const LanguageDetector = require('../language/LanguageDetector');
const CitationValidator = require('./CitationValidator');
const SourceAuthorityFilter = require('../retrieval/SourceAuthorityFilter');
const { DomainDetector } = require('../domain/DomainDetector');
const { IntentDetector } = require('../intent/IntentDetector');
const { EvidenceEvaluator } = require('./EvidenceEvaluator');

/**
 * Core Verification & Research Engine Orchestrator with Strict Safety Guardrails & Evidence-Grounding.
 */
class VerificationEngine {
  /**
   * @param {object} [options]
   * @param {VerificationProvider} [options.provider] - LLM provider instance (default: GroqVerificationProvider if GROQ_API_KEY present, else MockVerificationProvider)
   */
  constructor(options = {}) {
    if (options.provider) {
      this.provider = options.provider;
    } else {
      const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
      const apiKey = process.env.GROQ_API_KEY;
      const hasValidKey = apiKey && !apiKey.includes('your_') && apiKey !== 'placeholder' && !isTestEnv;
      this.provider = hasValidKey ? new GroqVerificationProvider() : new MockVerificationProvider();
    }
  }

  /**
   * Performs evidence-grounded verification or research over retrieved candidate evidence.
   * @param {string} userText - User's transcript claim or research question
   * @param {array} evidenceMatches - List of candidate evidence claim objects from RetrievalService
   * @param {object} [options] - Mode, requestedDomain, etc.
   * @returns {Promise<object>} Validated, safe verdict or research payload
   */
  async verifyClaim(userText, evidenceMatches = [], options = {}) {
    // 1. Language Preservation & Detection
    const languageMetadata = LanguageDetector.detect(userText);
    const lang = options.targetLanguage || languageMetadata.verificationLanguage || 'ur';

    // 2. Intent & Domain Detection
    const mode = options.mode || IntentDetector.detect(userText);
    const domainResult = DomainDetector.detect(userText, options.requestedDomain);
    const domain = domainResult.domain;

    // 3. Domain-Aware Source Authority Classification
    const enhancedMatches = SourceAuthorityFilter.enhanceMatchesWithAuthority(evidenceMatches, domain);

    // 4. Evidence Evaluation (Evidence Strength & Source Independence)
    const evalResult = EvidenceEvaluator.evaluate(enhancedMatches);

    // Check if evidence retrieval failed due to infrastructure search timeout or failure
    if (options && (options.searchStatus === 'SEARCH_TIMEOUT' || options.searchStatus === 'SEARCH_FAILED')) {
      return {
        verdict: 'UNCERTAIN',
        confidence: 'LOW',
        explanation: 'Verification search service experienced a temporary network timeout while fetching live web evidence. Please retry your request.',
        evidence: [],
        reason: 'SEARCH_INFRASTRUCTURE_FAILURE',
        mode,
        domain,
        evidenceStrength: 'INFRASTRUCTURE_FAILURE',
        languageMetadata,
        sources: [],
      };
    }

    // 5. Zero-Evidence Safe Bounding Rule
    if (evalResult.evidenceStrength === 'NO_EVIDENCE' || !enhancedMatches || enhancedMatches.length === 0) {
      const fallback = createUncertainFallback(FALLBACK_REASONS.NO_EVIDENCE, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: 'NO_EVIDENCE',
        languageMetadata,
        sources: [],
      };
    }

    // 6. Provider LLM Verification Execution
    let rawResponse;
    try {
      rawResponse = await this.provider.verify(userText, enhancedMatches, { mode, targetLanguage: lang });
    } catch (err) {
      console.warn(`⚠️ Verification Engine: Provider execution error: ${err.message}`);
      const fallback = createUncertainFallback(FALLBACK_REASONS.PROVIDER_ERROR, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        languageMetadata,
        sources: [],
      };
    }

    // 7. Schema Validation & Parsing
    let parsed;
    try {
      parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
    } catch (err) {
      console.warn('⚠️ Verification Engine: Malformed JSON output from provider.');
      const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_MODEL_OUTPUT, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        languageMetadata,
        sources: [],
      };
    }

    const validation = validateVerdict(parsed);
    if (!validation.valid) {
      console.warn(`⚠️ Verification Engine: Verdict Zod validation failed: ${validation.errors.join('; ')}`);
      const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_MODEL_OUTPUT, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        languageMetadata,
        sources: [],
      };
    }

    const verdictPayload = validation.data;

    // 8. Citation & Evidence Grounding Verification
    const allowlistedIds = new Set(enhancedMatches.map((m) => m.claimId));
    if (verdictPayload.evidence && Array.from(verdictPayload.evidence).length > 0) {
      for (const item of verdictPayload.evidence) {
        if (!allowlistedIds.has(item.claimId)) {
          console.warn(`⚠️ Verification Engine: Rejecting un-allowlisted evidence ID reference '${item.claimId}'`);
          const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_EVIDENCE_REFERENCE, null, lang);
          return {
            ...fallback,
            mode,
            domain,
            evidenceStrength: evalResult.evidenceStrength,
            languageMetadata,
            sources: [],
          };
        }
      }
    }

    // Strict URL citation validation against retrieved matches
    const citationCheck = CitationValidator.validate(verdictPayload, enhancedMatches);
    if (!citationCheck.valid) {
      console.warn(`⚠️ Verification Engine: Citation validation failed: ${citationCheck.reason}`);
      const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_CITATION_URL, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        languageMetadata,
        sources: [],
      };
    }

    // 9. Boundedness Check: Non-UNCERTAIN verification verdict with zero evidence citations -> UNCERTAIN
    if (verdictPayload.verdict !== 'UNCERTAIN' && verdictPayload.verdict !== 'RESEARCH_RESPONSE' && (!verdictPayload.evidence || verdictPayload.evidence.length === 0)) {
      console.warn('⚠️ Verification Engine: Non-UNCERTAIN verdict has zero evidence citations. Forcing UNCERTAIN fallback.');
      const fallback = createUncertainFallback(FALLBACK_REASONS.INSUFFICIENT_EVIDENCE, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        languageMetadata,
        sources: [],
      };
    }

    // Convert numeric confidence score to string enum (HIGH, MEDIUM, LOW, NONE)
    let finalConfidence = 'HIGH';
    if (typeof verdictPayload.confidence === 'number') {
      finalConfidence = verdictPayload.confidence >= 0.8 ? 'HIGH' :
                        verdictPayload.confidence >= 0.5 ? 'MEDIUM' :
                        verdictPayload.confidence > 0 ? 'LOW' : 'NONE';
    } else if (typeof verdictPayload.confidence === 'string') {
      finalConfidence = verdictPayload.confidence;
    }

    // Bound verdict confidence if search returned only partial results
    if (options && options.searchStatus === 'SEARCH_PARTIAL' && finalConfidence === 'HIGH') {
      finalConfidence = 'MEDIUM';
    }

    // Build verified response sources metadata
    const verifiedSources = (verdictPayload.evidence || []).map((ev) => {
      const matchObj = enhancedMatches.find((m) => m.claimId === ev.claimId);
      const firstSource = matchObj?.sources?.[0] || {};
      return {
        claimId: ev.claimId,
        sourceTitle: ev.sourceTitle || firstSource.title || 'Official Primary Source',
        organization: ev.organization || firstSource.organization || 'Government/Scientific Authority',
        url: ev.url || firstSource.url || '',
        authorityLevel: firstSource.authorityLevel || 'PRIMARY_AUTHORITY',
      };
    });

    return {
      mode,
      domain,
      verdict: verdictPayload.verdict,
      confidence: finalConfidence,
      evidenceStrength: evalResult.evidenceStrength,
      independentSourceCount: evalResult.independentSourceCount,
      explanation: verdictPayload.explanation,
      answer: verdictPayload.explanation,
      evidence: verdictPayload.evidence || [],
      sources: verifiedSources,
      languageMetadata,
      reason: 'EVIDENCE_GROUNDED',
    };
  }
}

module.exports = VerificationEngine;
