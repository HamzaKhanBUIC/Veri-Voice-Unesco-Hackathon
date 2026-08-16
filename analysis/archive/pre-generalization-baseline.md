# VeriVoice — Pre-Generalization Baseline Report (Phase 1 Audit)

**Date**: 2026-08-13  
**Project Mode**: Empire Speed / Hackathon Prototype  
**Baseline Test Suite**: 12 / 12 Test Suites Passing (90 / 90 Unit Tests Pass)  
**Dataset Status**: `knowledge/claims.json` = `[]` (0 claims, strictly preserved)

---

## 1. Executive Summary & Problem Diagnosis

When executing the claim **"Is Earth flat?"** through the current pipeline:

```text
USER CLAIM: "Is Earth flat?"
       │
       ▼
1. RetrievalService.search("Is Earth flat?")
   ├── Local DB (knowledge/claims.json = []) ──► 0 matches
   └── ChromeSearchProvider.searchGoogleWeb("Is Earth flat?")
       └── Executes literal raw string search: "Is Earth flat?"
       └── DuckDuckGo / Web Scraper output: 0 structured matches parsed
       │
       ▼
2. SourceAuthorityFilter.enhanceMatchesWithAuthority([])
   └── Enhanced Matches: [] (Empty array)
       │
       ▼
3. VerificationEngine.verifyClaim("Is Earth flat?", [])
   └── Safety Control 1 Triggers:
       if (!enhancedMatches || enhancedMatches.length === 0) {
         return createUncertainFallback(NO_EVIDENCE);
       }
   └── Skipping LLM reasoning completely.
       │
       ▼
4. FINAL VERDICT RETURNED TO USER:
   Verdict: UNCERTAIN
   Confidence: 0%
   Explanation: "Available reliable information is insufficient to reach a conclusive verdict on this claim."
```

---

## 2. Exact Architectural Bottlenecks Identified

| Layer | Component | Current State | Root Cause Failure |
|---|---|---|---|
| 1 | **Domain Detector** | *Non-Existent* | System does not classify claims into domains (`HEALTH`, `EARTH_SPACE`, `WEATHER_CLIMATE`, `GEOLOGY`, `DISASTER`, `TECHNOLOGY`, `ECONOMICS`, `LAW_POLICY`, `SCIENCE`, `GENERAL`). |
| 2 | **Query Strategy** | *Raw Sentence Search* | Passes literal raw user sentence (`"Is Earth flat?"`) to search engine instead of generating targeted verification queries (`"Earth shape spherical NASA USGS"`). |
| 3 | **Source Authority Classifier** | *Health-Only (9 Domains)* | Only checks 9 hardcoded health/disaster domains (`who.int`, `paho.org`, `cdc.gov`, `nih.gov`, `ndma.gov.pk`, etc.). Lacks space, geology, climate, physics, and university domains (`nasa.gov`, `usgs.gov`, `noaa.gov`, `esa.int`, `nature.com`, `.edu`, `.ac.uk`). |
| 4 | **Evidence Evaluator** | *Non-Existent* | System lacks explicit evidence sufficiency assessment (`STRONG_EVIDENCE`, `SUFFICIENT_EVIDENCE`, `WEAK_EVIDENCE`, `NO_EVIDENCE`, `CONFLICTING_EVIDENCE`). |
| 5 | **Discord Presentation** | *Too Basic* | Shows plain text verdict without domain badges, evidence strength badges, or "How VeriVoice Verified This" metadata. |

---

## 3. Baseline Metrics Summary

```text
Automated Tests:               90 / 90 PASSING (12 Test Suites)
Local Knowledge Base:          [] (0 claims, strictly preserved)
"Is Earth flat?" Matches:       0 matches retrieved
"Is Earth flat?" Verdict:       UNCERTAIN (0% confidence)
Safety Controls Triggered:     Control 1 (NO_EVIDENCE fallback)
```

---

## 4. Phase 1 Audit Conclusion

The current system's failure on general non-health claims is **NOT** caused by the safety model being wrong, nor by LLM hallucination. It is caused by **retrieval tunnel-vision**:
1. No domain detection to guide authority rules.
2. Raw literal search queries failing to retrieve structured evidence.
3. Authority filtering restricting authority tags strictly to WHO/PAHO/NDMA.

Phase 1 Baseline Audit is **COMPLETE**. Ready for Lead Architect review before Phase 2 implementation.
