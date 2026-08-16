# VeriVoice Discord Bot — Architecture & Flow Diagrams

This document contains Mermaid diagrams and structural flowcharts representing the VeriVoice Discord Bot architecture.

---

## 1. High-Level Architecture Topology

```mermaid
flowchart TD
    subgraph DiscordPlatform["Discord Platform"]
        Slash["Slash Commands<br/>(/verify, /general, /health, /science...)"]
        Mentions["Direct Text Mentions<br/>(@VeriVoice &lt;claim&gt;)"]
        Audio["Voice Note Attachments<br/>(.ogg, .mp3, .wav, .m4a)"]
    end

    subgraph DiscordAdapter["VeriVoice Discord Adapter"]
        Gateway["Discord Gateway WebSocket<br/>(discord.js v14)"]
        Client["DiscordClient<br/>(OAuth2 & REST v10)"]
        Service["DiscordService<br/>(Event Dispatcher)"]
        Rate["RateLimiter<br/>(5 req/60s user | 20 req/60s global)"]
        Conc["ConcurrencyLimiter<br/>(Max 3 Active Audio Tasks)"]
        Media["DiscordMedia<br/>(MIME & Size Validator)"]
    end

    subgraph VeriVoiceCore["VeriVoice Core Engine"]
        Pipeline["StandalonePipeline"]
        Whisper["Whisper ASR<br/>(whisper-large-v3-turbo)"]
        QueryStrat["QueryStrategy<br/>(9 Languages Expansion)"]
        Retrieval["RetrievalService<br/>(Wikipedia + DuckDuckGo)"]
        AuthFilter["SourceAuthorityFilter<br/>(UNESCO MIL Taxonomy)"]
        Evaluator["EvidenceEvaluator<br/>(Independence & Corroboration)"]
        Groq["GroqVerificationProvider<br/>(Llama 3.3 70B Versatile)"]
        CitationVal["CitationValidator<br/>(Allowlist Verification)"]
        TTS["EdgeTTSProvider<br/>(Neural Audio Synthesis)"]
    end

    subgraph OutputDelivery["Discord Delivery"]
        Embed["Verification Card Embed<br/>(Domain, Verdict, Confidence, Sources)"]
        MP3["Playable Neural MP3 Attachment"]
    end

    Slash --> Gateway
    Mentions --> Gateway
    Audio --> Gateway

    Gateway --> Client --> Service
    Service --> Rate --> Conc
    Audio --> Media --> Conc

    Conc --> Pipeline
    Pipeline --> Whisper
    Whisper --> QueryStrat --> Retrieval
    Retrieval --> AuthFilter --> Evaluator
    Evaluator --> Groq --> CitationVal
    CitationVal --> TTS

    TTS --> Embed
    TTS --> MP3
    Embed --> DiscordPlatform
    MP3 --> DiscordPlatform

    classDef platform fill:#1e1f22,stroke:#5865f2,stroke-width:2px,color:#ffffff;
    classDef adapter fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#ffffff;
    classDef core fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef output fill:#134e4a,stroke:#14b8a6,stroke-width:2px,color:#ffffff;

    class Slash,Mentions,Audio,DiscordPlatform platform;
    class Gateway,Client,Service,Rate,Conc,Media,DiscordAdapter adapter;
    class Pipeline,Whisper,QueryStrat,Retrieval,AuthFilter,Evaluator,Groq,CitationVal,TTS,VeriVoiceCore core;
    class Embed,MP3,OutputDelivery output;
```

---

## 2. Detailed Voice Note Audio Pipeline Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Discord User
    participant DC as Discord Gateway
    participant DS as DiscordService
    participant DM as DiscordMedia
    participant CL as ConcurrencyLimiter
    participant SP as StandalonePipeline
    participant STT as Groq Whisper ASR
    participant RT as RetrievalService
    participant VE as Groq Llama 3.3 70B
    participant CV as CitationValidator
    participant TTS as EdgeTTSProvider

    User->>DC: Uploads Voice Note (.ogg / .mp3)
    DC->>DS: messageCreate (Attachment payload)
    
    DS->>DM: validateAttachment(size <= 15MB, MIME)
    DM-->>DS: Validation Valid (true)

    DS->>DC: Reply: "🎙️ Voice note received... ⏳"
    DS->>DM: downloadAttachment(CDN URL -> tmp/discord_*.ogg)
    
    DS->>CL: run(semaphore.maxConcurrent = 3)
    activate CL
    
    CL->>SP: processAudio(tmp/discord_*.ogg)
    activate SP
    
    SP->>STT: transcribe(audioBuffer) [<800ms]
    STT-->>SP: Transcript ("Is Earth flat?") + Language ('en')
    
    SP->>RT: search(queries, domain, mode)
    RT-->>SP: candidateMatches [NASA, USGS, Wiki]
    
    SP->>VE: verify(userClaim, evidenceMatches)
    VE-->>SP: Verdict: FALSE, Confidence: HIGH, Citations
    
    SP->>CV: validate(citations, candidateMatches)
    CV-->>SP: Validated Citations [NASA, USGS]
    
    SP->>TTS: synthesize(explanationText, voice='en-US-AvaNeural')
    TTS-->>SP: Output MP3 file path + validateAudio: true
    
    SP-->>CL: Pipeline Result Payload
    deactivate SP
    
    CL-->>DS: Completed Task
    deactivate CL
    
    DS->>DC: Send Verification Card + MP3 Attachment
    DS->>DC: Delete initial "Transcribing..." progress message
    
    DS->>DM: safeCleanup(tmp/discord_*.ogg) [finally block]
    DC-->>User: Delivers Card Embed + Audio Voice Note
```

---

## 3. Slash Command & Text Verification Flow

```mermaid
flowchart TD
    A["User triggers Slash Command (/verify &lt;claim&gt;)"] --> B["Discord Gateway interactionCreate"]
    B --> C["RateLimiter Check<br/>(User ≤ 5/60s & Global ≤ 20/60s)"]
    
    C -- "Limit Exceeded" --> C1["Reply Ephemeral: '⚠️ Rate limit exceeded'"]
    C -- "Allowed" --> D["interaction.deferReply() &lt; 500ms"]
    
    D --> E["Domain & Intent Detection<br/>(HEALTH, EARTH_SPACE, WEATHER_CLIMATE...)"]
    E --> F["RetrievalService<br/>(Wikipedia + DuckDuckGo Live Search)"]
    F --> G["SourceAuthorityFilter<br/>(UNESCO Institutional Epistemic Classification)"]
    G --> H["Groq Llama 3.3 70B LPU Verification"]
    H --> I["CitationValidator Allowlist Check"]
    
    I -- "Valid Citations" --> J["Format Product Verification Card"]
    I -- "Hallucinated Citations" --> K["Fallback: UNCERTAIN (INVALID_CITATION_URL)"]
    
    J --> L["interaction.editReply(content)"]
    K --> L
    L --> M["Delivered in Discord Channel"]

    classDef startNode fill:#1e1f22,stroke:#5865f2,stroke-width:2px,color:#ffffff;
    classDef processNode fill:#0f172a,stroke:#0ea5e9,stroke-width:2px,color:#ffffff;
    classDef safeNode fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef alertNode fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#ffffff;

    class A,B startNode;
    class C,D,E,F,G,H,I processNode;
    class J,L,M safeNode;
    class C1,K alertNode;
```

---

## 4. Multi-Layer Failure & Degradation Tree

```mermaid
flowchart LR
    subgraph Inputs["Potential Failure Points"]
        F1["Malformed / Giant Audio (&gt;15MB)"]
        F2["Traffic Spike (&gt;20 req/60s)"]
        F3["High Audio Concurrency (&gt;3 tasks)"]
        F4["Garbled Noise / ASR Failure"]
        F5["Live Web Search Timeout (&gt;3.5s)"]
        F6["Primary Groq API Key Rate-Limit (429)"]
        F7["Fabricated Citation URL Hallucination"]
        F8["Cloud TTS Synthesis Failure"]
    end

    subgraph Defense["Guardrail / Handling Engine"]
        D1["DiscordMedia.validateAttachment"]
        D2["RateLimiter.checkGlobal"]
        D3["ConcurrencyLimiter FIFO Queue"]
        D4["WhisperProvider Error Trap"]
        D5["ChromeSearchProvider Timeout Catch"]
        D6["Groq Multi-Key Pool Rotation"]
        D7["CitationValidator Allowlist Check"]
        D8["EdgeTTSProvider Audio Validation"]
    end

    subgraph Outcomes["Graceful System Behavior"]
        O1["Safe Error: 'Attachment exceeds limit'"]
        O2["User Notice: 'System busy under high traffic'"]
        O3["Sequentially executes as slots free"]
        O4["Safe Verdict: UNCERTAIN (No ASR)"]
        O5["Bounded Verdict: SEARCH_TIMEOUT"]
        O6["Transparent Failover to Key #2 / Key #3"]
        O7["Safe Fallback: UNCERTAIN (Invalid URL)"]
        O8["Degrades to Text Card + '🔊 Voice unavailable'"]
    end

    F1 --> D1 --> O1
    F2 --> D2 --> O2
    F3 --> D3 --> O3
    F4 --> D4 --> O4
    F5 --> D5 --> O5
    F6 --> D6 --> O6
    F7 --> D7 --> O7
    F8 --> D8 --> O8

    classDef fail fill:#450a0a,stroke:#dc2626,stroke-width:2px,color:#ffffff;
    classDef defn fill:#0c4a6e,stroke:#0284c7,stroke-width:2px,color:#ffffff;
    classDef outc fill:#064e3b,stroke:#059669,stroke-width:2px,color:#ffffff;

    class F1,F2,F3,F4,F5,F6,F7,F8 fail;
    class D1,D2,D3,D4,D5,D6,D7,D8 defn;
    class O1,O2,O3,O4,O5,O6,O7,O8 outc;
```

---

## 5. Security & Input Sanitization Architecture

```mermaid
flowchart TD
    subgraph Untrusted["Untrusted External Data Sources"]
        U1["Discord Chat Messages"]
        U2["Spoken Audio Bytes"]
        U3["Slash Command Parameters"]
        U4["Circulating Misinformation Audio"]
        U5["Live Web Search HTML Snippets"]
    end

    subgraph Boundary["Sanitization & Security Defense Perimeter"]
        B1["Media Validation (MIME &lt;= 15MB)"]
        B2["Path Traversal Defense (Resolved tmp/ check)"]
        B3["Prompt Tag Boundary (&lt;USER_CLAIM&gt; encapsulation)"]
        B4["Adversarial Prompt Override Neutralizer"]
        B5["Evidence ID Match Allowlist"]
        B6["CitationValidator URL Guardrail"]
        B7["Zod Verdict Schema Bounding"]
    end

    subgraph Core["Hardened Verification Pipeline"]
        C1["Evidence-Grounded Verdict Execution"]
        C2["Verified Institutional Source Links"]
        C3["Guaranteed Temporary File Erasure (finally)"]
    end

    U1 & U2 & U3 & U4 & U5 --> Boundary
    Boundary --> Core

    classDef untrusted fill:#3b0764,stroke:#a855f7,stroke-width:2px,color:#ffffff;
    classDef boundary fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef core fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#ffffff;

    class U1,U2,U3,U4,U5 untrusted;
    class B1,B2,B3,B4,B5,B6,B7 boundary;
    class C1,C2,C3 core;
```

---

## 6. Multi-Tenant Session & Channel Isolation Model

```mermaid
flowchart TD
    subgraph Server1["Discord Server 1 (Healthcare Guild)"]
        S1C1["Channel #general<br/>User A: 'Vaccine safe?'<br/><b>req_msg_101 (Isolated)</b>"]
        S1C2["Channel #alerts<br/>User B: 'Dengue remedy'<br/><b>req_msg_102 (Isolated)</b>"]
    end

    subgraph Server2["Discord Server 2 (Education Guild)"]
        S2C1["Channel #science<br/>User C: 'Earth is flat'<br/><b>req_msg_201 (Isolated)</b>"]
        S2DM["Direct Message (DM)<br/>User D: 'Polio drops'<br/><b>req_msg_202 (Isolated)</b>"]
    end

    subgraph StatelessCore["VeriVoice Backend Process"]
        P1["StandalonePipeline Instance (Stateless Async Execution)"]
    end

    S1C1 -->|No Shared Memory| P1
    S1C2 -->|No Shared Memory| P1
    S2C1 -->|No Shared Memory| P1
    S2DM -->|No Shared Memory| P1

    classDef guild fill:#1e1f22,stroke:#5865f2,stroke-width:2px,color:#ffffff;
    classDef core fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#ffffff;

    class Server1,Server2,S1C1,S1C2,S2C1,S2DM guild;
    class StatelessCore,P1 core;
```

---

## 7. Groq Multi-Key Quota Protection & Failover Pool

```mermaid
stateDiagram-v2
    [*] --> PrimaryKey : Incoming Verification Request
    
    PrimaryKey --> Success : HTTP 200 OK
    PrimaryKey --> FallbackKey1 : HTTP 429 / 401 / 403 Rate Limit
    
    FallbackKey1 --> Success : HTTP 200 OK
    FallbackKey1 --> FallbackKey2 : HTTP 429 / 401 / 403 Rate Limit
    
    FallbackKey2 --> Success : HTTP 200 OK
    FallbackKey2 --> GracefulFallback : All Keys Rate-Limited
    
    Success --> [*] : Deliver Grounded Verdict
    GracefulFallback --> [*] : Deliver Safe UNCERTAIN Card
```

---

## 8. VeriVoice Ecosystem: Discord vs. Web Application

```mermaid
flowchart TD
    subgraph SharedCore["VeriVoice Shared Core Intelligence"]
        Engine["VerificationEngine (Groq Llama 3.3 70B LPU)"]
        Taxonomy["SourceAuthorityFilter (UNESCO MIL Multi-Tier Taxonomy)"]
        ASR["WhisperProvider (Sub-second Multilingual ASR)"]
        Defense["CitationValidator & Zod Schemas"]
    end

    subgraph WebApp["Web Application Interface"]
        Vercel["Vercel Edge CDN Hosting"]
        React["React 18 + Vite + TypeScript"]
        Acoustic["3D Acoustic Core & Wave Visualizer"]
        Constellation["3D Evidence Constellation Graph"]
        ChatStudio["Multi-turn Chat & Methodology Studio"]
    end

    subgraph DiscordBot["Discord Bot Interface"]
        Render["Render Cloud 24/7 Web Service"]
        DiscordJS["Node.js + discord.js v14 Gateway"]
        VoiceNotes["Native Mobile Voice Note Attachments"]
        SlashCmds["9 Native Slash Commands (/verify, /health...)"]
        Mentions["@VeriVoice Group Chat Mentions"]
    end

    SharedCore <--> WebApp
    SharedCore <--> DiscordBot

    classDef core fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef web fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#ffffff;
    classDef bot fill:#1e1f22,stroke:#5865f2,stroke-width:2px,color:#ffffff;

    class SharedCore,Engine,Taxonomy,ASR,Defense core;
    class WebApp,Vercel,React,Acoustic,Constellation,ChatStudio web;
    class DiscordBot,Render,DiscordJS,VoiceNotes,SlashCmds,Mentions bot;
```
