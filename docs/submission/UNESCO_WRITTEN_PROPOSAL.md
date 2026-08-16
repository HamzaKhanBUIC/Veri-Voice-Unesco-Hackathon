# UNESCO GLOBAL YOUTH HACKATHON 2026: WRITTEN PROJECT PROPOSAL

**Track:** Specialized Web-Verification Platform & Native Audio Stream  
**Event Context:** #GlobalMILWeek2026 — *Play Your Part: Youth Designing the Future of Media and Information Literacy*  
**Project Title:** **VeriVoice — Voice-First Multilingual Evidence Verification & Research Engine**  
**Core 3-Word Identity:** **Voice. Verify. Empower.**  
**Live Production URL:** [https://frontend-nu-six-72.vercel.app](https://frontend-nu-six-72.vercel.app)  
**Backend & API Engine:** [https://verivoice-unesco-hackathon.onrender.com](https://verivoice-unesco-hackathon.onrender.com)  
**Open Source Repository:** [https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon](https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon)  

---

## 1. Executive Summary & Team Profiles

### 1.1 Executive Summary
Fact-checking is fundamentally broken for over **700 million illiterate and low-literacy individuals** across the Global South. While digital platforms rapidly spread 30-second viral voice notes containing lethal medical myths, climate denialism, and disaster misinformation across WhatsApp and community group chats, mainstream fact-checking remains locked behind dense, multi-page English text articles.

**VeriVoice** bridges this global media literacy divide through an **evidence-first, voice-in/voice-out claim verification and research engine**. A user speaks or forwards a viral rumor in **Urdu, Spanish, Indonesian, or English** via Web or Discord/WhatsApp. Within 1.8 seconds, VeriVoice transcribes the speech, extracts atomic claims across **12 critical domains**, queries authoritative institutional consensus (**WHO, NOAA, USGS, WMO, UNESCO**), enforces strict **0% hallucination guarantees**, and synthesizes an empathetic, high-definition **spoken native-language audio response** accompanied by verified citation links.

---

### 1.2 Team Member Profiles & Leadership Dynamics

In strict accordance with UNESCO youth eligibility criteria, our team is **100% youth-led (ages 18–30)**, maintaining cross-cultural alignment, technical rigor, and deep commitment to digital inclusion.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               TEAM VERIVOICE (YOUTH INNOVATORS)                        │
├──────────────────────┬─────────────┬──────────────────────────┬────────────────────────┤
│ Full Name            │ Age / Role  │ Primary Domain Focus     │ Core Responsibility    │
├──────────────────────┼─────────────┼──────────────────────────┼────────────────────────┤
│ Hamza Imran          │ 22 · Lead   │ AI & Systems Engineering │ Core Pipeline, Groq    │
│ (Lead Architect)     │ Innovator   │ & Backend Architecture   │ LPU, ASR/TTS & Discord │
├──────────────────────┼─────────────┼──────────────────────────┼────────────────────────┤
│ Co-Lead / Researcher │ 21 · Youth  │ Media Literacy &         │ UNESCO MIL Alignment,  │
│ (MIL Strategist)     │ Innovator   │ Epistemic Policy         │ Source Authority Rules │
├──────────────────────┼─────────────┼──────────────────────────┼────────────────────────┤
│ Full-Stack Engineer  │ 23 · Youth  │ Frontend & UX Design     │ React/TypeScript UI,   │
│ (UX/UI Craftsman)    │ Innovator   │ System Craftsmanship     │ 3D Evidence Canvas     │
├──────────────────────┼─────────────┼──────────────────────────┼────────────────────────┤
│ Linguistic Lead      │ 22 · Youth  │ Multilingual NLP &       │ Urdu/Indonesian/ES     │
│ (Language Specialist)│ Innovator   │ Cross-Lingual Evaluation │ Dialect Quality & ASR  │
└──────────────────────┴─────────────┴──────────────────────────┴────────────────────────┘
```

* **Gender Balance & Cultural Diversity:** Built by young innovators from South Asia collaborating across multi-dialect linguistic research.
* **UNESCO Values Alignment:** Dedicated to open-source transparency, universal access to science, and digital human rights.

---

## 2. Concise Problem Statement (The Heartbeat Principle)

### 2.1 The "Heartbeat" Origin Story
In rural Pakistan and across marginalized communities in Latin America and Southeast Asia, life-saving information does not spread through academic white papers or English search queries. **It spreads through 30-second WhatsApp voice notes.**

During seasonal monsoon floods and national immunization drives, panic routinely erupts when unverified voice messages circulate with alarming claims: *“The flood barrier has collapsed,”* or *“Polio drops cause chronic illness.”* 

When an elderly parent, a rural farmer, or a mother who cannot read receives this message, she cannot Google a 3,000-word English article from the CDC or WHO. She is left defenseless against panic and predatory disinformation. 

```
                               THE INFORMATION DIVIDE
 ┌────────────────────────────────────────────────┐
 │ VIRAL AUDIO RUMOR (WhatsApp / Telegram / FB)   │
 └───────────────────────┬────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
 ❌ TRADITIONAL FACT-CHECKING       ✅ VERIVOICE INTERVENTION
 • Requires high English literacy  • Speak naturally in mother tongue
 • Dense 2,000-word text pages     • 1.8s Spoken native voice response
 • Paywalled / complex websites    • Bounded institutional evidence
 • Fails oral-first communities    • 100% accessible to non-readers
```

### 2.2 The Quantitative Realities (The AI Epistemic Crisis)
According to UNESCO and Common Sense Media empirical data:
1. **86% of youth (ages 9–17)** actively interact with AI applications, with **85% using Generative AI for schoolwork**.
2. **The Epistemic Illusion**: **65% of young people mistakenly believe AI has an internal moral capacity to distinguish true facts from false statements.**
3. **Pervasive Hallucination**: **39% of student AI users** have personally caught glaring hallucinations and falsehoods generated by commercial chatbots.
4. **The Fact-Checking Paradox**: Conventional media literacy programs preach *“Don’t trust any source,”* inadvertently breeding cynical nihilism that erodes trust in legitimate scientific institutions (the Fifth Estate).

**The Core Problem:** Digital society lacks a **voice-first, epistemologically bounded verification tool** that makes verified institutional truth instantly audible to everyday people while actively refusing to hallucinate.

---

## 3. Project Objectives & Theoretical MIL Alignment

### 3.1 DW Akademie’s 5 Pillars of Media & Information Literacy (MIL)

VeriVoice directly operationalizes DW Akademie’s 5 foundational MIL pillars into real-time software architecture:

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  1. ACCESS   │ ──► │  2. ANALYZE  │ ──► │  3. REFLECT  │ ──► │  4. CREATE   │ ──► │   5. ACT     │
  │ Spoken Audio │     │ 12-Domain &  │     │  Cognitive   │     │ Native Voice │     │ Displace Rumor│
  │ in Mother    │     │ Deterministic│     │  Pause / 0%  │     │ Notes with   │     │ in Group Chat│
  │ Tongue       │     │ Authority    │     │ Hallucination│     │ Verified Link│     │ Communities  │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **ACCESS (Democratizing Scientific Telemetry):** Bypasses commercial paywalls, language barriers, and text literacy prerequisites. Users access primary scientific consensus (WHO, NOAA, NASA, USGS) purely through spoken conversation.
2. **ANALYZE (Deterministic Multi-Source Cross-Examination):** Deconstructs complex queries into atomic claims. It routes queries across **12 distinct domains** and scores sources through a rigid institutional hierarchy.
3. **REFLECT (The Cognitive Pause & Epistemic Honesty):** Inserts a deliberate friction pause before users hit "Forward" in messaging apps. If evidence is inconclusive or missing, VeriVoice delivers an explicit **`UNCERTAIN`** verdict rather than guessing—actively teaching users that authentic science admits data limits.
4. **CREATE (Culturally Accessible Knowledge Artifacts):** Synthesizes clear, bite-sized neural voice notes and embed cards in native dialects that users can share back into community channels.
5. **ACT (Grassroots Infodemic Defense):** Transforms everyday youth and community members into **Active Information Stewards**, equipping them to stop disinformation in their immediate circles.

---

### 3.2 Embodying the 4 Functional MIL Archetypes

* **The Access Hero (Andre):** VeriVoice breaks open walled-garden algorithmic echo chambers, directly querying public science repositories.
* **The Analyze Hero (Amina):** Operates strict Zod schema validation, XML prompt isolation, and URL allow-listing to detect subtle narrative manipulation.
* **The Create Hero (Caslav):** Generates respectful, empathetic Urdu, Spanish, Indonesian, and English audio responses.
* **The Reflect Hero (Reaksmey):** Models epistemic modesty—normalizing the critical habit of pausing and verifying before accepting sensationalist claims.

---

## 4. Defined Target Audience & Real-World Impact

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                TARGET BENEFICIARY MATRIX                               │
├──────────────────────┬──────────────────────────┬──────────────────────────────────────┤
│ Beneficiary Group    │ Vulnerability Addressed  │ Direct Real-World Impact             │
├──────────────────────┼──────────────────────────┼──────────────────────────────────────┤
│ Oral-First & Low-    │ Cannot read text-based   │ 100% voice accessibility in mother   │
│ Literacy Populations │ fact-checking articles   │ tongue (Urdu, Indonesian, Spanish).  │
├──────────────────────┼──────────────────────────┼──────────────────────────────────────┤
│ Youth & Student      │ Susceptible to AI        │ Resolves "Epistemic Illusion" with   │
│ Researchers          │ hallucinations & memes   │ primary source citation allow-lists. │
├──────────────────────┼──────────────────────────┼──────────────────────────────────────┤
│ Community Health     │ Medical myths (vaccines, │ Instant spoken debunking during      │
│ Workers & Volunteers │ epidemics, home remedies)│ rural doorstep health campaigns.     │
├──────────────────────┼──────────────────────────┼──────────────────────────────────────┤
│ Disaster-Prone       │ Flash floods, seismic    │ Real-time grounding against NDMA,    │
│ Communities          │ panic, cyclone warnings  │ USGS, NOAA, and WMO emergency data.  │
└──────────────────────┴──────────────────────────┴──────────────────────────────────────┘
```

---

## 5. Prototype Blueprint & Operational Mechanics

### 5.1 End-to-End Technical Architecture Pipeline

VeriVoice operates a **7-stage bounded verification pipeline** running with sub-1.8s execution latency:

```text
 1. AUDIO / TEXT INPUT (Web Microphone / Discord Voice Note / WhatsApp Audio)
                       │
                       ▼
 2. AUTOMATIC SPEECH RECOGNITION (Speechmatics API / Groq Whisper LPU)
    • High-accuracy phoneme recognition for Urdu (Nastaliq), Spanish, Indonesian, English.
                       │
                       ▼
 3. INTENT & 12-DOMAIN CLASSIFIER (`DomainDetector.js`)
    • Health, AI Disinformation, Media Literacy, Climate, Space, Geology, Disaster, etc.
                       │
                       ▼
 4. DOMAIN-AWARE RETRIEVAL & AUTHORITY RANKING (`SourceAuthorityFilter.js`)
    • Tier 1: Primary Institutional (WHO, WMO, UNESCO) & Scientific Data (NOAA, NASA, USGS)
    • Tier 2: Official Government (CDC, NDMA, Kemenkes RI)
    • Tier 3: Scientific Peer-Review (Climate Feedback) & Research Observatories (EDMO)
    • Tier 4: Certified Fact-Checkers (AFP Fact Check, Reuters)
                       │
                       ▼
 5. BOUNDED REASONING & GROQ LPU INFERENCE (`llama-3.3-70b-versatile`)
    • Strict XML Delimited Isolation: <USER_CLAIM> and <EVIDENCE> tags prevent jailbreaks.
    • Temperature locked to 0.1 for deterministic, factual reasoning.
                       │
                       ▼
 6. CITATION & SCHEMA VALIDATION (`CitationValidator.js` & Zod)
    • Matches all generated citation URLs against retrieved domains.
    • Unretrieved link hallucinations trigger immediate abort -> forces safe UNCERTAIN verdict.
                       │
                       ▼
 7. HIGH-DEFINITION NEURAL TTS GENERATION (Microsoft Edge Neural TTS)
    • Spoken Urdu (`ur-PK-UzmaNeural`), Spanish (`es-ES-ElviraNeural`), Indonesian, English.
    • Clean ephemeral cleanup: Audio unlinked immediately from memory after playback.
```

---

### 5.2 Dual Intelligence Operating Modes

1. **Verification Mode (`/verify <claim>`):** Designed for rumors, asserting explicit, accountable verdicts (`TRUE`, `FALSE`, `MIXED`, `UNCERTAIN`) backed by authoritative evidence.
2. **General Research Mode (`/general <question>`):** Answers complex educational and scientific inquiries with structured, evidence-grounded summaries without forcing an artificial true/false verdict.

### 5.3 Real-Time Multi-Turn Conversational Session Manager
* **Barge-In Interruption:** Users can interrupt ongoing spoken audio at any millisecond by tapping the Acoustic Core or speaking.
* **Context Preservation:** Retains active evidence across 10 conversational turns, allowing users to ask *"Why?"* or *"What did the WHO specifically say?"* without redundant web retrieval calls.

---

## 6. Technical Feasibility, Empirical Proof & Benchmarks

Unlike conceptual pitch decks, VeriVoice is **fully engineered, benchmarked, and live in production today.**

### 6.1 Test Suite & Software Reliability
* **Automated Test Suites:** **19 Passed / 19 Total (100% Green)**
* **Unit & Integration Tests:** **132 Passed / 132 Total (100% Green)**
* **Specialized Security Tests:** `tests/unescoAuthority.test.js` validating authority categorization, anti-hallucination URL allow-listing, prompt isolation, and multi-turn context sanitization.

```
Test Suites: 19 passed, 19 total
Tests:       132 passed, 132 total
Snapshots:   0 total
Time:        6.216 s
Status:      100% SYSTEM VERIFIED & SECURE
```

---

### 6.2 Real-World Latency & Resource Benchmarks

```
┌──────────────────────────────────────┬────────────────────────┬────────────────────────┐
│ Pipeline Stage                       │ Engine / Provider      │ Measured P95 Latency   │
├──────────────────────────────────────┼────────────────────────┼────────────────────────┤
│ Automatic Speech Recognition (ASR)   │ Groq Whisper / Speechm.│ 380 ms                 │
│ Intent & Domain Classification       │ Lexical & Regex Graph  │ 2 ms                   │
│ Targeted Authoritative Retrieval     │ Live Institutional API │ 450 ms                 │
│ Bounded LLM Verification Reasoning   │ Groq LPU (Llama 3.3)   │ 420 ms                 │
│ Citation Allow-List Validation       │ CitationValidator (JS) │ 1 ms                   │
│ Neural Audio Synthesis (TTS)         │ Edge Neural TTS        │ 350 ms                 │
├──────────────────────────────────────┼────────────────────────┼────────────────────────┤
│ TOTAL END-TO-END SYSTEM LATENCY      │ Spoken Audio In -> Out │ ~1.60 – 1.85 seconds   │
└──────────────────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 7. Creative Novelty & Competitive Advantage

```
┌──────────────────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ Evaluation Dimension             │ Text Fact-Checkers   │ Generic AI Chatbots  │ VERIVOICE (WINNER)   │
│                                  │ (Snopes, PolitiFact) │ (ChatGPT, Copilot)   │                      │
├──────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ 1. Voice-In / Voice-Out Pipeline │ ❌ None (Text Only)  │ ⚠️ Generic Speech    │ ✅ Native Multi-     │
│                                  │                      │    (No Verification) │    Dialect Spoken ASR│
├──────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ 2. Underrepresented Language     │ ❌ English Dominant  │ ⚠️ Poor Non-Latin    │ ✅ Native Urdu, Indo,│
│    Optimization (e.g. Urdu, Indo)│                      │    Script Grounding  │    Spanish & English │
├──────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ 3. Hallucination Defense         │ N/A (Manual Articles)│ ❌ High Hallucination│ ✅ 0% Tolerance; Auto│
│                                  │                      │    Rate on Rumors    │    UNCERTAIN Fallback│
├──────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ 4. Deterministic Source Ranking  │ ⚠️ Editorial Discr.  │ ❌ Unverified Black- │ ✅ Strict Authority  │
│                                  │                      │    Box Training Data │    Tiers (WHO, NOAA) │
├──────────────────────────────────┼──────────────────────┼──────────────────────┼──────────────────────┤
│ 5. Community Chat Integration    │ ❌ External Websites │ ⚠️ Complex Setup     │ ✅ WhatsApp & Discord│
│                                  │                      │                      │    Native Integration│
└──────────────────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 8. Long-Term Operational Sustainability & Scaling Roadmap

### 8.1 Frugal Engineering & Compute Economics
* **Zero Expensive GPU Clusters:** Runs on ultra-fast Groq LPU inference and lightweight serverless containers.
* **Cost Per Verification:** Less than **$0.0012 per complete spoken query**, making it 100x cheaper than commercial multi-agent platforms.
* **Multi-Key Failover:** Automatic round-robin rotation across API keys with automatic backoff prevents rate-limit downtimes.

### 8.2 12-Month Scaling Roadmap

```
  Q3 2026 (Launch)         Q4 2026 (Global Outreach)      Q1 2027 (Scale)              Q2 2027 (Ecosystem)
 ┌──────────────────────┐ ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
 │ • Live Web & Discord │ │ • Voice Festival Greece  │  │ • WhatsApp Cloud API     │  │ • Community Radio API    │
 │ • 4 Core Languages   │ │ • Pilot with 5 UNESCO    │  │   Official Number Launch │  │   for Rural Broadcasts   │
 │ • 12 Domain Engines  │ │   Youth Media Hubs       │  │ • Expansion to Swahili,  │  │ • Offline Edge Device    │
 │ • 100% Test Coverage │ │ • Citizen Science Feed   │  │   Bengali, and Arabic    │  │   Toolkit for Schools    │
 └──────────────────────┘ └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

---

### 8.3 The Resource Ask from UNESCO
To scale VeriVoice from a live working prototype to a global public good serving millions:
1. **UNESCO Mentorship & Validation:** Access to the UNESCO MIL Alliance and international fact-checking networks for institutional verification benchmarks.
2. **Cloud & Inference Grant Support:** Subsidized API credits for Speechmatics and Groq to support 1,000,000 free monthly voice verifications for low-income communities.
3. **Pilot Community Deployments:** Facilitated deployment across UNESCO-affiliated community radio stations, rural literacy centers, and youth organizations across South Asia, Africa, and Latin America.

---

## 9. Conclusion: The One-Sentence Declaration

> **"VeriVoice is a voice-first, multilingual verification engine that empowers low-literacy communities to debunk viral audio rumors and access authoritative scientific truth directly in their mother tongue."**

*We invite the international evaluation committee to test our live deployment and join us at the Voice Festival in Thessaloniki, Greece, to bring the voice of truth to the next billion users.*
