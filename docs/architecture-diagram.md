# VeriVoice — Detailed Technical Architecture & Execution Diagrams
**Comprehensive Engineering Flow, State Machines, and Boundary Trace**
*Version: 1.0.0 | Verified Passing: 19/19 Test Suites (132/132 Tests)*

---

## 1. End-to-End Execution Flow (Voice, Text, and Discord)

The diagram below maps every function, condition, and service boundary across the three ingress modalities:

```mermaid
flowchart TD
    subgraph IngressModality [1. Ingress Transports]
        V_In[🎤 Voice Input: Talk Sanctuary]
        T_In[⌨️ Text Input: Chat & Research]
        D_In[🤖 Discord: Voice Attachment / Mention / Slash Command]
    end

    subgraph ASR_Layer [2. Speech Recognition & Audio Normalization]
        V_Rec[Audio Recorder: WebM / OGG Chunk]
        D_Med[DiscordMedia: Buffer Extraction & Size Check]
        Whisper_ASR[Groq Whisper ASR API: Fast Multilingual]
        Speechmatics_ASR[Speechmatics Fallback ASR]
    end

    subgraph Routing_Layer [3. Conversational Routing & Intelligence]
        Conv_Mgr[ConversationManager: Session & Turn Tracker]
        Lang_Det[LanguageDetector: Script & Diacritic Analysis]
        Intent_Det[IntentDetector: VERIFY vs. RESEARCH vs. FOLLOW_UP vs. STOP]
        Domain_Det[DomainDetector: HEALTH, CLIMATE, SCIENCE, DISASTER, AI]
    end

    subgraph Retrieval_Layer [4. Information Retrieval & Source Classification]
        Query_Strat[QueryStrategy: Targeted Multi-Query Generator]
        Offline_KB[Offline Knowledge Base: claims.json]
        Live_Search[Live Google Web & News Search Scraper]
        Dedupe[EvidenceEvaluator: Syndicated Copy Deduplicator]
        Auth_Filter[SourceAuthorityFilter: 8-Tier Epistemic Classifier]
    end

    subgraph Reasoning_Layer [5. Epistemic Reasoning & Safety Guardrails]
        Evid_Eval[EvidenceEvaluator: Evidence Strength & Independence]
        LLM_Engine[Groq LPU: LLaMA 3.3 70B Versatile System Prompt]
        Zod_Val[Zod Verdict Schema Validation]
        Cite_Val[CitationValidator: Anti-Hallucination Allowlist Check]
        Fallback[createUncertainFallback: Zero-Evidence Safe Bounding]
    end

    subgraph Audio_Layer [6. Neural Audio Synthesis & Presentation]
        Eleven_TTS[ElevenLabs Multilingual v2: Sarah Studio Neural Voice]
        Edge_TTS[Microsoft Edge Neural TTS: Uzma / Ava Neural]
        Web_Speech[Browser Web SpeechSynthesis Utterance Fallback]
        UI_Player[AudioWavePlayer / Discord Audio Card]
    end

    %% Ingress connections
    V_In --> V_Rec
    V_Rec --> Whisper_ASR
    D_In -->|Voice Note| D_Med
    D_Med --> Whisper_ASR
    D_In -->|Text / Slash| Conv_Mgr
    T_In --> Conv_Mgr

    %% ASR failover
    Whisper_ASR -.->|Failover| Speechmatics_ASR
    Whisper_ASR --> Conv_Mgr
    Speechmatics_ASR --> Conv_Mgr

    %% Routing connections
    Conv_Mgr --> Lang_Det
    Conv_Mgr --> Intent_Det
    Conv_Mgr --> Domain_Det

    %% Decision branching
    Intent_Det -->|FOLLOW_UP + Active Evidence| Evid_Eval
    Intent_Det -->|VERIFY_CLAIM / GENERAL_RESEARCH| Query_Strat
    Intent_Det -->|STOP / GUIDANCE / SESSION_LIMIT| UI_Player

    %% Retrieval connections
    Query_Strat --> Offline_KB
    Query_Strat --> Live_Search
    Offline_KB --> Dedupe
    Live_Search --> Dedupe
    Dedupe --> Auth_Filter
    Auth_Filter --> Evid_Eval

    %% Reasoning connections
    Evid_Eval --> LLM_Engine
    LLM_Engine --> Zod_Val
    Zod_Val --> Cite_Val
    Cite_Val -->|Invalid Citation / Hallucination| Fallback
    Cite_Val -->|Verified Grounding| Conv_Mgr
    Fallback --> Conv_Mgr

    %% Audio synthesis
    Conv_Mgr --> Eleven_TTS
    Eleven_TTS -.->|Failover / Limit| Edge_TTS
    Edge_TTS -.->|Autoplay Blocked| Web_Speech
    Eleven_TTS --> UI_Player
    Edge_TTS --> UI_Player
    Web_Speech --> UI_Player
```

---

## 2. Conversational Voice State Machine & Evidence Reuse (Talk Sanctuary)

The live Talk interface is governed by a deterministic 5-state lifecycle and an in-memory session manager that guarantees **zero search calls on follow-up dialogue turns**:

```mermaid
stateDiagram-v2
    [*] --> IDLE: Mount / Session Initialized
    
    IDLE --> LISTENING: Tap Acoustic Core (Start MediaRecorder)
    LISTENING --> PROCESSING: Tap Core Again (Stop Recording & Extract Base64)
    
    PROCESSING --> CHECKING: ASR Transcription Complete
    
    state CHECKING {
        [*] --> RouteTurn
        RouteTurn --> FreshSearch: Intent = VERIFY_CLAIM (Turn 1)
        RouteTurn --> ReuseEvidence: Intent = FOLLOW_UP (e.g. "Why?", "What did WHO say?")
        RouteTurn --> DirectResponse: Intent = CASUAL / STOP / LIMIT (Turn >= 10)
        
        FreshSearch --> LLM_Reasoning
        ReuseEvidence --> LLM_Reasoning: 0 Retrieval Calls (62% Faster)
        DirectResponse --> [*]
        LLM_Reasoning --> ValidateCitations
        ValidateCitations --> [*]
    }
    
    CHECKING --> RESPONDING: Verdict Generated & Synthesizing TTS
    
    RESPONDING --> LISTENING: Barge-in Interrupt (Tap Core while speaking)
    RESPONDING --> IDLE: Audio Playback Complete (Tap to Speak Follow-up)
    
    CHECKING --> ERROR: Network / Timeout Error
    ERROR --> IDLE: Tap Core to Retry
```

### Conversational Invariants:
* **Session Lifetime**: 5-minute inactivity TTL (`SESSION_TTL_MS = 300,000`).
* **Turn Limit Ceiling**: 10 turns per session (`MAX_TURNS_PER_SESSION = 10`) to prevent runaway resource consumption.
* **Evidence Reuse Invariant**: When `IntentDetector` identifies a referential inquiry (*"Why is that?"*, *"Explain in Spanish"*), the `activeEvidence` array in the `ConversationManager` session is injected directly into the LLM context, skipping search execution completely.

---

## 3. UNESCO 8-Tier Epistemic Source Authority Taxonomy

VeriVoice classifies every candidate source into distinct epistemic tiers, ensuring scientific consensus outweighs general web pages:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ UNESCO EPISTEMIC AUTHORITY TAXONOMY                                                    │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ TIER                       │ EPISTEMIC ROLE              │ CONCRETE EXAMPLES           │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ PRIMARY_INSTITUTIONAL      │ International Consensus     │ WHO, WMO, IPCC, UNICEF,     │
│                            │ Mandates & Treaties         │ UNESCO, PAHO, GAVI          │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ PRIMARY_SCIENTIFIC_DATA    │ Empirical Telemetry,        │ NASA, NOAA, USGS, ESA,      │
│                            │ Satellites, Sensor Arrays   │ Copernicus (ECMWF), CERN    │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ OFFICIAL_GOVERNMENT        │ National Ministries &       │ CDC (US), NIH (Pakistan),   │
│                            │ Civil Protection Bodies     │ Kemenkes (ID), NDMA, PMD    │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ SCIENTIFIC_REVIEW          │ Expert Peer-Review          │ Science Feedback, Climate   │
│                            │ Consensus & Syntheses       │ Feedback, Health Feedback   │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ FACT_CHECKING_ORGANIZATION │ IFCN-Accredited Media       │ AFP Fact Check, Reuters,    │
│                            │ Investigative Fact-Checks   │ Maldita.es, CekFakta, Soch  │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ RESEARCH_NETWORK           │ Cross-Border Research &     │ EDMO (EU), ReliefWeb,       │
│                            │ Humanitarian Observatories  │ GDACS Disaster Alerts       │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ SECONDARY_REPUTABLE        │ Prestigious Scientific      │ Nature, The Lancet, BMJ,    │
│                            │ Journals & Academic Presses │ Science, PNAS, NEJM, PubMed │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ CITIZEN_SCIENCE            │ Verified Crowd Observations │ iNaturalist, eBird, GBIF     │
└────────────────────────────┴─────────────────────────────┴─────────────────────────────┘
```

---

## 4. Safety Guardrails & Anti-Hallucination Envelope

The verification pipeline is wrapped in a multi-layered safety envelope to prevent model hallucinations, adversarial prompt injections, and data tampering:

```
[ UNTRUSTED USER INPUT ]
          │
          ▼
┌────────────────────────────────────────────────────────────────┐
│ INGRESS GUARDRAIL: Input Sanitization & XML Delimiters         │
│ • Validates audio format magic bytes and restricts size <= 15MB│
│ • Escapes user text into strict <USER_CLAIM> tags              │
│ • Injects prompt isolation delimiters ignoring user directives │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│ RETRIEVAL GUARDRAIL: Source Validation & Scheme Check          │
│ • Rejects any non-HTTP/HTTPS protocol (e.g. javascript:, data:)│
│ • Deduplicates syndicated wire copies (Token Jaccard > 0.70)   │
│ • Embeds search results into strict <EVIDENCE> tags            │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│ CORE REASONING: Groq LPU LLaMA 3.3 70B (Low Temp = 0.1)        │
│ • LLM acts strictly as a reasoner over provided evidence       │
│ • Outputs structured JSON adhering to Zod Schema               │
└──────────────────────────────┬─────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│ EGRESS GUARDRAIL: Citation Allowlist & Boundedness Check       │
│ • CitationValidator: Every citation URL MUST exist in the      │
│   retrieved search candidate set or known authority registry   │
│ • Boundedness Rule: If verdict != UNCERTAIN and evidence citations│
│   count == 0, system AUTOMATICALLY coerces verdict to UNCERTAIN│
│ • createUncertainFallback: Catches timeouts, schema errors, or │
│   hallucinations and produces a graceful, safe response        │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Deployment & Infrastructure Architecture

```mermaid
flowchart TD
    subgraph Source_Control [GitHub Source Repository]
        Git_Main[branch: main]
    end

    subgraph Vercel_Platform [Vercel Edge Network]
        V_Edge[Vercel Serverless CDN]
        V_Static[Static SPA Assets: HTML / JS / CSS]
        V_Domain[Domain: verivoice-unesco.vercel.app]
    end

    subgraph Render_Platform [Render Cloud Infrastructure]
        R_App[Docker / Node.js 20 Web Service]
        R_API[Express REST API: /health, /api/verify, /api/tts]
        R_Discord[Background Discord Gateway Worker]
    end

    subgraph External_Cloud [External AI & Gateway Infrastructure]
        Groq_API[Groq LPU: LLaMA 3.3 70B & Whisper]
        Speech_API[Speechmatics ASR API]
        Eleven_API[ElevenLabs Neural TTS API]
        Disc_Gateway[Discord Gateway WebSocket]
    end

    Git_Main -->|Auto Deploy Web| V_Edge
    Git_Main -->|Auto Deploy Backend| R_App

    V_Edge --> V_Static
    V_Static --> V_Domain

    R_App --> R_API
    R_App --> R_Discord

    V_Static -.->|Direct Edge Mode| Groq_API
    V_Static -.->|Direct Edge Mode| Eleven_API
    V_Static -->|REST Backend Mode| R_API

    R_API --> Groq_API
    R_API --> Speech_API
    R_API --> Eleven_API
    R_Discord <--> Disc_Gateway
```

---

## 6. Discord Gateway Adapter Architecture

The Discord bot runs as an independent interface adapter wrapped with dedicated rate-limiting and concurrency controls:

```
[ DISCORD USER ]
       │
       │  (Voice Note Attachment / Slash Command / @VeriVoice Mention)
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ DiscordGateway (discord.js v14.27.0 Client)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ DiscordService Adapter                                          │
│  ├─ Global Rate Limiter: 20 req / 60s system-wide               │
│  ├─ User Rate Limiter: 5 req / 60s per user ID                  │
│  └─ Concurrency Limiter: Max 3 active processing jobs           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ StandalonePipeline (Headless Execution)                         │
│  1. Extract and validate audio attachment (DiscordMedia)        │
│  2. Transcribe via Groq Whisper                                 │
│  3. Retrieve and evaluate evidence (RetrievalService)           │
│  4. Reason and verify claim (VerificationEngine)                │
│  5. Synthesize spoken response MP3 (EdgeTTSProvider)            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Output Dispatcher                                               │
│  • Sends rich Markdown card with Verdict Badge & Citations      │
│  • Attaches synthesized MP3 audio note to Discord channel       │
└─────────────────────────────────────────────────────────────────┘
```
