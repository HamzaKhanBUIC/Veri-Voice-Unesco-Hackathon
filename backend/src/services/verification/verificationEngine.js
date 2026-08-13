const MockVerificationProvider = require('./MockVerificationProvider');
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
   * @param {VerificationProvider} [options.provider] - LLM provider instance (default: MockVerificationProvider)
   */
  constructor(options = {}) {
    this.provider = options.provider || new MockVerificationProvider();
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
    const lang = languageMetadata.detectedLanguage || 'ur';

    // 2. Intent & Domain Detection
    const mode = options.mode || 'VERIFICATION';
    const domainResult = DomainDetector.detect(userText, options.requestedDomain);
    const domain = domainResult.domain;

    // 3. Domain-Aware Source Authority Classification
    const enhancedMatches = SourceAuthorityFilter.enhanceMatchesWithAuthority(evidenceMatches, domain);

    // 4. Evidence Evaluation (Evidence Strength & Source Independence)
    const evalResult = EvidenceEvaluator.evaluate(enhancedMatches);

    // Deterministic Fallback if no evidence matches
    if (!enhancedMatches || enhancedMatches.length === 0) {
      if (mode === 'GENERAL_RESEARCH') {
        return {
          mode: 'GENERAL_RESEARCH',
          domain,
          answer: 'dastiyab muatbar maloomat ke mutabiq is sawal ka jawab filhal munasib shawahid ke sath dastiyab nahi hai.',
          explanation: 'No direct evidence retrieved from authoritative sources.',
          evidenceStrength: 'NO_EVIDENCE',
          confidence: 'LOW',
          sources: [],
          languageMetadata,
          reason: 'NO_EVIDENCE',
        };
      }

      const fallback = createUncertainFallback(FALLBACK_REASONS.NO_EVIDENCE, null, lang);
      return {
        ...fallback,
        mode: 'VERIFICATION',
        domain,
        evidenceStrength: 'NO_EVIDENCE',
        confidence: 'LOW',
        languageMetadata,
        sources: [],
      };
    }

    // Build allow-list of valid Evidence IDs & Source URLs
    const allowlistedIds = new Set(enhancedMatches.map((m) => m.claimId));

    let rawResponse;
    try {
      // Invoke LLM Provider with prompt isolation
      rawResponse = await this.provider.verify(userText, enhancedMatches, { mode, targetLanguage: lang });
    } catch (err) {
      console.warn(`⚠️ Verification Engine: Provider execution error: ${err.message}`);
      const fallback = createUncertainFallback(FALLBACK_REASONS.PROVIDER_ERROR, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        confidence: 'LOW',
        languageMetadata,
        sources: [],
      };
    }

    // Safe JSON Parsing
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
        confidence: 'LOW',
        languageMetadata,
        sources: [],
      };
    }

    // Zod Schema Validation
    const validation = validateVerdict(parsed);
    if (!validation.valid) {
      console.warn(`⚠️ Verification Engine: Verdict Zod validation failed: ${validation.errors.join('; ')}`);
      const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_MODEL_OUTPUT, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        confidence: 'LOW',
        languageMetadata,
        sources: [],
      };
    }

    const verdictPayload = validation.data;

    // Evidence-ID Allow-List Check
    if (verdictPayload.evidence && verdictPayload.evidence.length > 0) {
      for (const item of verdictPayload.evidence) {
        if (!allowlistedIds.has(item.claimId)) {
          console.warn(`⚠️ Verification Engine: Rejecting un-allowlisted evidence ID reference '${item.claimId}'`);
          const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_EVIDENCE_REFERENCE, null, lang);
          return {
            ...fallback,
            mode,
            domain,
            evidenceStrength: evalResult.evidenceStrength,
            confidence: 'LOW',
            languageMetadata,
            sources: [],
          };
        }
      }
    }

    // Citation Integrity Validation (Prevents URL Hallucinations)
    const citationValidation = CitationValidator.validate(verdictPayload.evidence || [], enhancedMatches);
    if (!citationValidation.valid) {
      console.warn(`⚠️ Verification Engine: Citation validation failed: ${citationValidation.reason}`);
      const fallback = createUncertainFallback(FALLBACK_REASONS.INVALID_EVIDENCE_REFERENCE, null, lang);
      return {
        ...fallback,
        mode,
        domain,
        evidenceStrength: evalResult.evidenceStrength,
        confidence: 'LOW',
        languageMetadata,
        sources: [],
      };
    }

    // For VERIFICATION mode: Boundedness Check
    if (mode === 'VERIFICATION' && verdictPayload.verdict !== 'UNCERTAIN' && (!verdictPayload.evidence || verdictPayload.evidence.length === 0)) {
      console.warn('⚠️ Verification Engine: Non-UNCERTAIN verdict has zero evidence citations. Forcing UNCERTAIN fallback.');
      const fallback = createUncertainFallback(FALLBACK_REASONS.INSUFFICIENT_EVIDENCE, null, lang);
      return {
        ...fallback,
        mode: 'VERIFICATION',
        domain,
        evidenceStrength: 'NO_EVIDENCE',
        confidence: 'LOW',
        languageMetadata,
        sources: [],
      };
    }

    // Consolidate sources with authority levels
    const sources = citationValidation.validatedCitations.map((c) => ({
      claimId: c.claimId,
      sourceTitle: c.sourceTitle,
      organization: c.organization,
      url: c.url,
      authorityLevel: c.authorityLevel || 'PRIMARY_AUTHORITY',
    }));

    // Map numeric confidence to qualitative HIGH / MEDIUM / LOW
    let honestConfidence = evalResult.confidence;
    if (typeof verdictPayload.confidence === 'number') {
      if (verdictPayload.confidence >= 0.8) honestConfidence = 'HIGH';
      else if (verdictPayload.confidence >= 0.5) honestConfidence = 'MEDIUM';
      else honestConfidence = 'LOW';
    }

    return {
      mode,
      domain,
      verdict: mode === 'GENERAL_RESEARCH' ? 'RESEARCH_RESPONSE' : verdictPayload.verdict,
      confidence: honestConfidence,
      evidenceStrength: evalResult.evidenceStrength,
      independentSourceCount: evalResult.independentSourceCount,
      explanation: verdictPayload.explanation,
      answer: verdictPayload.explanation,
      evidence: verdictPayload.evidence,
      sources,
      languageMetadata,
      reason: verdictPayload.reason || 'EVIDENCE_GROUNDED',
      provider: this.provider.name,
    };
  }
}

module.exports = VerificationEngine;
