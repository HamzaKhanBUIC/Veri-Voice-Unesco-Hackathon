# VeriVoice Live — Architecture, Retrieval & Emergency-Information Audit Report

**Auditor Roles:** Principal Product Architect, Live Information / Retrieval Engineer, Emergency UX Lead, Source Authority Specialist  
**Audit Scope:** Time-Sensitive Information Retrieval, Official Alert Classification, Freshness Modeling, Location Scoping & Emergency Safety Guardrails  
**Date:** August 2026  
**Status:** PHASE 0 READ-ONLY AUDIT COMPLETE

---

## 1. Executive Summary & Readiness Assessment

This audit evaluates the feasibility, architectural readiness, and safety requirements for introducing **"VeriVoice Live"**—a dedicated live information and public safety awareness capability spanning official weather alerts, flood warnings, disaster advisories, and current news reporting.

VeriVoice Live complements the existing **Verify** ("Is this claim true?") and **Research** ("Explain this topic.") workflows by introducing **Live** ("What is happening now?").

---

## 2. Core Audit Findings & Architectural Answers

### A. Can Current Retrieval Support Time-Sensitive Information?
- **Current State**: Retrieval relies on `QueryStrategy.js`, `ChromeSearchProvider.js` (DuckDuckGo), and Wikipedia REST. While capable of general web retrieval, queries are not structured with temporal freshness markers, alert keywords, or targeted emergency agency routing.
- **Required Extension**: Implement a dedicated `LiveInformationService` with targeted query strategies that prioritize official alerting bodies (e.g., NDMA, PMD Flood Forecasting Division, BMKG, WMO, USGS, GDACS).

### B. How Are Publication Dates Represented?
- **Current State**: `EvidenceItem` has an optional unstructured `publicationDate` string.
- **Required Extension**: Define structured temporal fields:
  - `publishedAt` (ISO 8601 string or null)
  - `updatedAt` (ISO 8601 string or null)
  - `retrievedAt` (Timestamp of retrieval)
  - `validUntil` (Explicit expiration date for active advisories)
  - **Rule**: Never invent timestamps. If unprovided by the source, set `null` and classify as `UNKNOWN_FRESHNESS`.

### C. Can Source Freshness Be Represented?
- **Current State**: No explicit freshness states.
- **Required Extension**: Introduce an explicit 5-tier freshness lifecycle:
  1. `LIVE` (< 6 hours old or actively valid)
  2. `RECENT` (< 48 hours old)
  3. `OUTDATED` (> 48 hours old without active validity)
  4. `EXPIRED` (Past `validUntil` timestamp)
  5. `UNKNOWN_FRESHNESS` (Timestamp missing)

### D. Can Source Types Distinguish OFFICIAL ALERT from NEWS?
- **Current State**: `SourceAuthorityFilter.js` classifies into `PRIMARY_INSTITUTIONAL`, `OFFICIAL_GOVERNMENT`, `SECONDARY_REPUTABLE`, etc.
- **Required Extension**: Add specific live source types:
  - `OFFICIAL_ALERT` (NDMA, BNPB, FEMA, GDACS, ReliefWeb warnings)
  - `OFFICIAL_WEATHER` (PMD, BMKG, NOAA, Met Office forecasts & severe alerts)
  - `OFFICIAL_DISASTER` (PMD FFD flood bulletins, USGS earthquakes)
  - `OFFICIAL_GOVERNMENT_UPDATE` (NIH, CDC, WHO health bulletins)
  - `NEWS_REPORT` (Reuters, AP, AFP, reputable local journalism)
  - `RESEARCH_UPDATE`
  - `BACKGROUND`
  - `UNKNOWN`
  - **Hierarchy**: In active emergencies, `OFFICIAL_ALERT` is presented above `NEWS_REPORT`.

### E. Can the Frontend Show Timestamps and Freshness Badges?
- **Current State**: Frontend renders clean source cards with authority level badges.
- **Required Extension**: Build `LivePage.tsx` and rich `LiveCard` components showing severity, region, status (`ACTIVE` vs `EXPIRED`), timestamp, and direct official advisory links.

### F. Can the Backend Safely Return Live Links?
- **Current State**: `CitationValidator.js` validates that all returned links are safe HTTPS/HTTP URLs belonging to retrieved search results or recognized institutional registries.
- **Readiness**: 100% compatible.

### G. Does Current Caching Create Stale-Data Risk?
- **Current State**: Curated claims are static; web searches are un-cached per request.
- **Required Extension**: Ensure live alert queries use ultra-short ephemeral caching (max 3–5 minutes) with mandatory `retrievedAt` stamps so stale yesterday advisories are never returned as active warnings.

### H. Are There Existing APIs and Sources to Integrate?
- **Pakistan Official Authorities**:
  - Pakistan Meteorological Department (PMD) (`pmd.gov.pk`)
  - PMD Flood Forecasting Division (FFD) (`ffd.pmd.gov.pk`)
  - National Disaster Management Authority (NDMA) (`ndma.gov.pk`)
- **International Authorities**:
  - USGS Earthquakes GeoJSON API (`earthquake.usgs.gov`)
  - World Meteorological Organization (`wmo.int`)
  - GDACS & ReliefWeb (`reliefweb.int`, `gdacs.org`)
  - NOAA / Copernicus ECMWF (`noaa.gov`, `copernicus.eu`)

---

## 3. Emergency Language & Safety Guardrails

1. **Absolute Safety Principle**: VeriVoice Live is an **information discovery tool**, NOT an emergency response or dispatch system.
2. **Negative Evidence Rule**: Never state *"There is no emergency."* Instead state: *"No current official alert was found in the sources checked. That does not guarantee that no local emergency exists."*
3. **Emergency Disclaimer Banner**:
   > *"⚠️ For immediate safety decisions, follow the latest instructions from local emergency authorities."*
4. **Location Model**: Privacy-first manual selection (Country ➔ Province/Region ➔ City/District). Never trigger browser geolocation without explicit user action.

---

## 4. Phase Plan for Implementation

- **PHASE 1**: Live Source Adapters & Query Strategy
- **PHASE 2**: Intent Detection (`LIVE`) & Freshness Model
- **PHASE 3**: Live Item Schema (`liveSchema.js` & TypeScript interfaces)
- **PHASE 4**: Backend `LiveInformationService` & API Endpoint (`GET /api/live`, `POST /api/live`)
- **PHASE 5**: Frontend `LivePage.tsx`, Region Selector, Navigation Tabs & Live Cards
- **PHASE 6**: Discord Bot `/live` command & voice note live-intent awareness
- **PHASE 7**: Automated Tests (`tests/liveInformation.test.js`)
- **PHASE 8**: Controlled Live Benchmark & Documentation Updates
