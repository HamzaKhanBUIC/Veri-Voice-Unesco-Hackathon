# VERIVOICE — UNESCO / MIL SOURCE EXPANSION FINAL REPORT
**Evidence Authority Upgrade, Domain Expansion & Media Literacy Alignment**

---

## 1. Executive Summary
This upgrade successfully expands VeriVoice’s source authority scope, domain taxonomy, and educational narrative to align directly with the **UNESCO Global Youth Hackathon 2026** and **DW Akademie Media & Information Literacy (MIL)** principles without destabilizing any existing architectural guarantees or verification safety pipelines.

---

## 2. Organizations Reviewed & Authority Taxonomy

| Organization | Domain(s) | Assigned Tier | Epistemic Weight | Role in VeriVoice |
| :--- | :--- | :--- | :--- | :--- |
| **WHO** | `who.int`, `paho.org` | `PRIMARY_INSTITUTIONAL` | Very High | UN health agency; global clinical consensus, disease fact sheets, immunization safety. |
| **WMO** | `wmo.int` | `PRIMARY_INSTITUTIONAL` | Very High | UN weather/climate observation standards across 193 member states. |
| **UNESCO** | `unesco.org` | `PRIMARY_INSTITUTIONAL` | Very High | Global policy, Media and Information Literacy frameworks, and cultural preservation. |
| **NASA** | `nasa.gov`, `climate.nasa.gov` | `PRIMARY_SCIENTIFIC_DATA` | Very High | Satellite observations, Earth science telemetry, planetary orbital physics. |
| **NOAA** | `noaa.gov`, `climate.gov` | `PRIMARY_SCIENTIFIC_DATA` | Very High | Atmospheric CO₂ metrics, ocean heat data, paleoclimate empirical records. |
| **USGS** | `usgs.gov`, `earthquake.usgs.gov`| `PRIMARY_SCIENTIFIC_DATA` | Very High | Seismic sensor networks, tectonic fault line telemetry, volcanic surveillance. |
| **CDC** | `cdc.gov` | `OFFICIAL_GOVERNMENT` | High (Regional/Surveillance) | Disease surveillance, multi-cohort vaccine trials, epidemiologic advisories. |
| **NDMA** | `ndma.gov.pk` | `OFFICIAL_GOVERNMENT` | High (Regional Emergency) | Apex disaster body; flood alerts, evacuation mandates, emergency directives. |
| **Kemenkes RI** | `kemkes.go.id` | `OFFICIAL_GOVERNMENT` | High (Regional Health) | Indonesian health ministry; national vaccination protocols, tropical disease alerts. |
| **Climate Feedback** | `climatefeedback.org` | `SCIENTIFIC_REVIEW` | High (Contextual Review) | Accredited network of PhD scientists peer-reviewing media claims. |
| **EDMO** | `edmo.eu` | `RESEARCH_NETWORK` | Medium-High (Media Research) | Cross-border observatory analyzing disinformation campaigns, deepfakes, and synthetic media. |
| **AFP Fact Check** | `factcheck.afp.com` | `FACT_CHECKING_ORGANIZATION` | Medium-High (Investigative) | IFCN-certified investigative journalism debunking viral claims in 20+ languages. |
| **iNaturalist** | `inaturalist.org` | `CITIZEN_SCIENCE` | Contextual (Ecological) | Crowdsourced observational species tracking (does not outrank peer-reviewed biological literature). |

---

## 3. Epistemic Principle: Authority ≠ Truth
VeriVoice adheres to the core epistemic rule:
A source possessing high institutional authority does not automatically prove a user's claim. The verification engine independently evaluates:
1. **Topical Relevance**: Direct semantic alignment with the exact claim.
2. **Empirical Directness**: Raw measurement data and clinical consensus vs. passing commentary.
3. **Source Independence**: Deduplication of syndicated wire news to prevent artificial source inflation.
4. **Recency & Scope**: Ensuring historical guidelines are not applied out of context.
5. **Consensus vs. Conflict**: Conflicting credible sources automatically produce an explicit `UNCERTAIN` verdict.

---

## 4. Media and Information Literacy (MIL) Product Alignment
VeriVoice maps its product experience to the **5 Pillars of Media and Information Literacy (MIL)**:
- **ACCESS**: Direct retrieval from authoritative scientific repositories (WHO, NOAA, NASA, EDMO, CDC) bypassing algorithmic echo chambers.
- **ANALYZE**: Strict claim deconstruction and source evaluation using XML-bounded reasoning.
- **REFLECT**: Enforcing cognitive pause and honest uncertainty when evidence is inconclusive.
- **CREATE**: Spoken synthesis in native dialects (Urdu, English, Spanish, Indonesian) for accessible understanding.
- **ACT**: Empowering users with verifiable source links to prevent viral infodemics in messaging groups.

*Note: In accordance with Section 4 & 30, all copy accurately states "Engineered in alignment with Media and Information Literacy principles" with zero false endorsement claims.*

---

## 5. Domain Expansion & Query Strategy

### Added Domains
- `AI_DISINFORMATION`: Detects deepfakes, synthetic media, botnets, and disinformation campaigns (in English, Urdu, Spanish, and Indonesian).
- `MEDIA_INFORMATION_LITERACY`: Detects MIL inquiries, source verification techniques, and educational questions.
- `BIODIVERSITY`: Detects species occurrence, ecosystem conservation, and wildlife inquiries.

### Query Strategies
Targeted query expansion generates 1–3 scoped search terms (e.g. `NOAA WMO climate data atmospheric records`, `EDMO fact check media literacy disinformation analysis`) without query explosion.

---

## 6. Frontend Presentation & 3D Evidence Convergence
- **EvidenceConstellation3D (`EvidenceConstellation3D.tsx`)**:
  - Dynamically renders **only the sources actually considered for the active claim**.
  - Distinct C3 color tokens: Teal (`PRIMARY_INSTITUTIONAL`), Cyan (`PRIMARY_SCIENTIFIC_DATA`), Emerald (`OFFICIAL_GOVERNMENT`), Sky (`SCIENTIFIC_REVIEW`), Amber (`FACT_CHECKING_ORGANIZATION`), Indigo (`RESEARCH_NETWORK`), Lime (`CITIZEN_SCIENCE`).
  - Subtle depth, thin telemetry beams, and smooth parallax.
  - Supports `prefers-reduced-motion` and contains a complete fallback if Canvas/WebGL is unavailable.
- **Granular Quality Badges (`SourceCard.tsx`)**:
  - Replaced ambiguous "Trusted" labels with clear badges: *Primary Institutional*, *Scientific Data*, *Official Government*, *Scientific Review*, *Fact-Checking Network*, *Research Observatory*, *Citizen Science*.
- **Compact Domain Filter Toolbar (`ChatPage.tsx`)**:
  - 5 concise routing chips: *All*, *Health & Medicine*, *Climate & Atmosphere*, *AI & Deepfakes*, *Science & Space*.
- **Methodology Page (`MethodologyPage.tsx`)**:
  - Detailed breakdown of the MIL 5 Pillars and the 7-Layer Engineering Pipeline.

---

## 7. Automated Test Results
- **Test Suites**: 19 passed, 19 total (100% GREEN)
- **Individual Tests**: 132 passed, 132 total (100% GREEN)
- **New Test Suite**: `tests/unescoAuthority.test.js` verifying authority taxonomy, domain regexes, query strategies, evidence strength calculation, and citation guardrails.

---

## 8. Live Benchmark Results

| Domain | Test Query | Detected Domain | Confidence | Generated Queries | Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Health** | "Are polio drops safe for young children?" | `HEALTH` | HIGH | 3 targeted queries | 2ms |
| **Climate** | "Is global temperature rising according to NOAA?" | `WEATHER_CLIMATE` | HIGH | 2 targeted queries | 1ms |
| **Science** | "Does the Earth orbit the Sun in a gravitational orbit?" | `EARTH_SPACE` | HIGH | 3 targeted queries | 0ms |
| **AI / Disinfo**| "How can users identify deepfake videos?" | `AI_DISINFORMATION` | HIGH | 2 targeted queries | 0ms |
| **MIL** | "What are the core UNESCO MIL principles?" | `MEDIA_INFORMATION_LITERACY` | HIGH | 2 targeted queries | 0ms |
| **Multilingual**| "کیا پولیو کے قطرے بچوں کے لیے محفوظ ہیں؟" | `HEALTH` | HIGH | 3 targeted queries | 1ms |

---

## 9. Security & Integrity Review
- **Prompt Injection Defense**: Preserved strict XML delimiters (`<USER_CLAIM>`, `<EVIDENCE>`) across all prompts.
- **Citation Guardrails**: `CitationValidator` rejects all unretrieved URL hallucinations and enforces domain verification.
- **Bounded Verification**: Temperature locked to `0.1` on Groq LPU models (`llama-3.3-70b-versatile`).

---

## 10. Deployment Status
- **Vercel Production**: [https://frontend-nu-six-72.vercel.app](https://frontend-nu-six-72.vercel.app) (Status: READY & LIVE).
- **Backend / Discord**: Completely unaffected, green tests.
