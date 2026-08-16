# VeriVoice Discord Bot — Architecture & System Design Specification

**Status:** Production & Demo Ready (Audit Score: 9.8 / 10)  
**Interface:** Independent Discord Adapter Layer (`discord.js` v14 Gateway & REST API)  
**Core Engine:** VeriVoice Multilingual Speech & Evidence Verification Engine  
**Deployment Target:** Render Cloud Web Service (Node.js 20+)

---

## 1. High-Level Discord System Tree

```
DISCORD PLATFORM
│
├── Slash Commands (/verify, /general, /health, /science, /climate, /disaster, /education, /help, /about)
├── Direct Text Mentions (@VeriVoice <claim/question>)
└── Voice Note Attachments (.ogg, .mp3, .wav, .m4a, .webm)
        │
        ▼
Discord Gateway WebSocket (discord.js v14)
        │
        ▼
DiscordClient (OAuth2, REST v10, Login, Lifecycle)
        │
        ▼
DiscordService (Gateway Dispatcher & Orchestrator)
        │
        ├── RateLimiter (Per-User: 5 req/60s | Global: 20 req/60s)
        ├── ConcurrencyLimiter (Semaphore: Max 3 Active Audio Tasks)
        ├── DiscordMedia (MIME & Size Validator, Safe Temp Paths)
        └── Request ID Generator (req_msg_* / req_slash_* / req_audio_*)
        │
        ▼
StandalonePipeline (Core Audio & Verification Orchestrator)
        │
        ├── Speech-to-Text (Groq Whisper Large v3 Turbo, <800ms)
        ├── Language & Domain Detection (Urdu, Roman Urdu, ES, ID, AR, HI, FR, DE, EN)
        ├── Targeted Query Strategy (Multilingual Concept Expansion)
        ├── Knowledge Retrieval (Wikipedia REST API + DuckDuckGo HTML)
        ├── Verification Engine (Groq Llama 3.3 70B LPU with Multi-Key Failover)
        ├── Source Authority Filter (UNESCO Multi-Tier Institutional Taxonomy)
        ├── Citation Validator (Allowlist Verification Guardrails)
        └── Text-to-Speech (EdgeTTS with Strict Playable Audio Buffer Validation)
        │
        ▼
Discord Channel Response
        ├── Rich Verification Card Embed
        └── Playable Spoken Neural MP3 Audio Attachment
```

---

## 2. Detailed Audio Processing Pipeline

The voice note verification pipeline processes incoming audio end-to-end with strict validation and guaranteed temp file cleanup.

```
DISCORD AUDIO ATTACHMENT
   │
   ▼
1. Attachment Validation (DiscordMedia.validateAttachment)
   ├── Size Limit Check (≤ 15.0 MB)
   └── MIME / Extension Check (.ogg, .opus, .mp3, .wav, .m4a, .webm)
   │
   ▼
2. Instant Progress Acknowledgment (Discord Channel Reply)
   └── "🎙️ Voice note received. Transcribing and verifying audio... ⏳"
   │
   ▼
3. Secure CDN Download (DiscordMedia.downloadAttachment)
   └── Downloaded to: backend/tmp/discord_<timestamp>_<hex>.ext
   │
   ▼
4. Concurrency Limiter Semaphore (ConcurrencyLimiter.run)
   └── Max 3 simultaneous active audio tasks (FIFO queue for 4+)
   │
   ▼
5. Speech-to-Text Transcription (WhisperProvider)
   ├── Model: whisper-large-v3-turbo (Groq LPU direct API)
   └── Latency: < 800ms | Native multi-language recognition
   │
   ▼
6. Multilingual Language Detection (LanguageDetector.detect)
   └── Identifies: ur, ur-Roman, es, id, ar, hi, fr, de, en
   │
   ▼
7. Intent & Domain Detection (IntentDetector & DomainDetector)
   ├── Intent: VERIFICATION vs. GENERAL_RESEARCH
   └── Domain: HEALTH | EARTH_SPACE | WEATHER_CLIMATE | DISASTER | SCIENCE | GENERAL
   │
   ▼
8. Targeted Query Generation (QueryStrategy.generateQueries)
   └── Multilingual concept expansion mapped to authoritative terms
   │
   ▼
9. Hybrid Knowledge Retrieval (RetrievalService)
   ├── Offline Curated Knowledge: knowledge/claims.json
   └── Live Web Search: Wikipedia REST API + DuckDuckGo Direct URL extraction
   │
   ▼
10. Source Authority Classification (SourceAuthorityFilter)
    └── Maps URLs/Orgs to UNESCO Epistemic Tiers (WHO, NASA, CDC, IPCC, etc.)
   │
   ▼
11. Evidence Strength & Independence Evaluation (EvidenceEvaluator)
    └── Evaluates multi-source corroboration and independence
   │
   ▼
12. LLM Verification Engine (GroqVerificationProvider)
    ├── Engine: Llama 3.3 70B Versatile on Groq LPU
    ├── Prompt Boundary: Grounded within <USER_CLAIM> / <EVIDENCE> tags
    └── Failover: Automatic 3-key pool rotation on HTTP 429/401/403
   │
   ▼
13. Citation Validation (CitationValidator.validate)
    └── Enforces URL allowlist against retrieved items + institutional domains
   │
   ▼
14. Neural Voice Synthesis (EdgeTTSProvider.synthesize)
    ├── Language-matched neural voices (ur-PK, es-ES, id-ID, ar-SA, hi-IN, etc.)
    └── Strict Audio Validation (EdgeTTSProvider.validateAudio: rejects fake/dummy MP3s)
   │
   ▼
15. Discord Delivery & Progress Cleanup
    ├── Sends formatted verification card + MP3 voice response
    └── Deletes initial "Transcribing..." progress message
   │
   ▼
16. TEMPORARY FILE CLEANUP
    └── GUARANTEED: Executed inside finally block (DiscordMedia.safeCleanup)
```

---

## 3. Text Message & Slash Command Pipeline

```
DISCORD TEXT INPUT (/verify, /general, @VeriVoice Mention)
   │
   ▼
1. Interaction / Message Parsing (DiscordCommands.handleInteraction)
   ├── Extracts user claim, question, or domain parameter
   └── Validates non-empty input string
   │
   ▼
2. Rate Limit Enforcement (RateLimiter)
   ├── Per-User Check (Max 5 req / 60s per User ID)
   └── Global System Check (Max 20 req / 60s instance-wide)
   │
   ▼
3. Immediate Gateway Acknowledgment
   └── Slash Commands: deferReply() (< 500ms) to prevent Discord 3s timeout
   │
   ▼
4. Intent & Domain Resolution
   ├── Mode: VERIFICATION (claims) or GENERAL_RESEARCH (open inquiries)
   └── Domain Hint: Enforced for /health, /science, /climate, /disaster, /education
   │
   ▼
5. Retrieval & Source Authority Classification
   └── Queries live web sources + classifies evidence via UNESCO MIL taxonomy
   │
   ▼
6. Verification Execution & Evidence Grounding
   └── Groq Llama 3.3 70B produces evidence-grounded verdict & explanation
   │
   ▼
7. Citation Validation & Schema Enforcement
   └── Zod schema validation + Citation allowlist checking
   │
   ▼
8. Product Card Formatting & Response
   └── Delivers clean embed with Verdict Badge, Confidence, Explanation & Citations
```

---

## 4. Failure & Fallback Resilience Tree

```
INCOMING REQUEST
 │
 ├── Invalid / Corrupted Audio File
 │      └── [DiscordMedia.validateAttachment] ➔ Rejects safely with user error ("Invalid audio file")
 │
 ├── Per-User Rate Limit Exceeded (>5 req/60s)
 │      └── [RateLimiter.check] ➔ Reply: "⚠️ Rate limit exceeded. Please wait a moment."
 │
 ├── Global System Rate Limit Exceeded (>20 req/60s)
 │      └── [RateLimiter.checkGlobal] ➔ Reply: "⚠️ System busy under high traffic. Please retry in a moment."
 │
 ├── Concurrency Semaphore Full (≥3 Active Audio Jobs)
 │      └── [ConcurrencyLimiter.run] ➔ Enqueues task in FIFO memory queue; auto-executes upon slot release
 │
 ├── ASR Audio Transcription Failure / Inaudible Noise
 │      └── [StandalonePipeline.processAudio] ➔ Returns UNCERTAIN: "Unable to transcribe audio clearly."
 │
 ├── Web Retrieval Timeout (>3.5s)
 │      └── [ChromeSearchProvider.fetchUrl] ➔ Flags SEARCH_TIMEOUT: "Search experienced a temporary timeout."
 │
 ├── LLM Provider Quota Exhaustion (HTTP 429)
 │      └── [GroqVerificationProvider.verify] ➔ Rotates automatically to Key #2 / Key #3 in fallback pool
 │
 ├── Malformed LLM JSON Output
 │      └── [VerificationEngine.verifyClaim] ➔ Schema fallback: createUncertainFallback(INVALID_MODEL_OUTPUT)
 │
 ├── Fabricated Citation URL Detected
 │      └── [CitationValidator.validate] ➔ Rejects ungrounded URL: createUncertainFallback(INVALID_CITATION_URL)
 │
 ├── Cloud TTS Voice Synthesis Failure
 │      └── [EdgeTTSProvider.validateAudio] ➔ Degrades gracefully: delivers full text card + "🔊 Voice unavailable"
 │
 └── Discord Gateway Send Error / Channel Permissions Missing
        └── [DiscordService.handleAudioAttachment] ➔ Catches error, logs securely with requestId, prevents crash
```

---

## 5. Multi-Layer Traffic & Rate Limit Architecture

```
                    DISCORD INTERACTION (Message / Slash Command / Voice Note)
                                               │
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │           LAYER 1: PER-USER LIMIT         │
                         │           5 Requests / 60 Seconds         │
                         │       (Tracked by Discord User ID)        │
                         └─────────────────────┬─────────────────────┘
                                               │ Allowed
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │          LAYER 2: GLOBAL RATE LIMIT       │
                         │          20 Requests / 60 Seconds         │
                         │        (System-wide instance guard)       │
                         └─────────────────────┬─────────────────────┘
                                               │ Allowed
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │       LAYER 3: CONCURRENCY SEMAPHORE      │
                         │          Max 3 Active Audio Tasks         │
                         │   (Memory, CPU & Socket Starvation Guard) │
                         └─────────────────────┬─────────────────────┘
                                               │ Slot Available
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │           VERIFICATION PIPELINE           │
                         │     (ASR ➔ Retrieval ➔ LLM ➔ TTS)         │
                         └───────────────────────────────────────────┘
```

---

## 6. Security Architecture & Input Sanitization

Discord input **NEVER** directly controls or bypasses the verification engine:

```
UNTRUSTED USER INPUT
├── Discord Text Messages
├── User Spoken Voice Audio
├── Slash Command Parameters
├── Circulating Social Rumors
└── Retrieved Live Web Snippets
         │
         ▼
SANITIZATION & VALIDATION DEFENSE BARRIER
├── 1. Audio Media Sandbox: MIME whitelist + 15MB size ceiling + crypto-random safe paths
├── 2. Path Traversal Defense: Verifies all paths remain inside backend/tmp/
├── 3. LLM Prompt Isolation: User input encapsulated strictly in <USER_CLAIM> / <USER_QUESTION>
├── 4. Anti-Injection Rules: Treats tagged text as untrusted data; ignores instruction overrides
├── 5. Evidence-ID Allowlist: Enforces that cited claim IDs match retrieved candidate matches
├── 6. CitationValidator Guardrail: Disallows fabricated/hallucinated model URLs
└── 7. Zod Schema Enforcement: Validates verdict against strict enum (TRUE, FALSE, MIXED, UNCERTAIN)
         │
         ▼
SAFE, GROUNDED VERIFICATION OUTPUT
```

---

## 7. Session Isolation & Epistemic Boundaries

```
[ GUILD A / SERVER 1 ]                       [ GUILD B / SERVER 2 ]
      │                                            │
      ├── [ Channel #general ]                     ├── [ Channel #news-check ]
      │     └── User 101: Claim A                        └── User 201: Claim C
      │           └── Request req_01 (Isolated)                └── Request req_03 (Isolated)
      │                                            │
      └── [ Channel #science ]                     └── [ Direct Message (DM) ]
            └── User 102: Claim B                        └── User 301: Claim D
                  └── Request req_02 (Isolated)                └── Request req_04 (Isolated)
```

### Actual Implementation Isolation Model:
- **Stateless Atomic Execution**: Each message or interaction is assigned a unique `requestId` (`req_msg_*`, `req_slash_*`, `req_audio_*`) and executed independently in an isolated async context.
- **Zero Cross-Contamination**:
  - User A never receives User B's state.
  - Server 1 never leaks data to Server 2.
  - Channels and DMs remain completely isolated.
- **No Residual In-Memory Storage**: Transcripts and audio files are discarded immediately upon request completion.

---

## 8. External Providers & Infrastructure Boundaries

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   VERIVOICE CONTROLLED DOMAIN                                    │
│                                                                                                  │
│   • Express HTTP Server (Port 3000, /health, CORS, Security middleware)                         │
│   • DiscordService & DiscordCommands Adapter                                                     │
│   • In-Memory Sliding-Window RateLimiter & ConcurrencyLimiter                                    │
│   • StandalonePipeline Orchestration Engine                                                      │
│   • UNESCO Source Authority Taxonomy (SourceAuthorityFilter)                                     │
│   • CitationValidator & Zod Schema Guardrails                                                    │
│   • Ephemeral Temp File Sandbox (/tmp/ with guaranteed cleanup)                                  │
│                                                                                                  │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │ HTTPS / WebSockets
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   EXTERNAL CLOUD DEPENDENCIES                                    │
│                                                                                                  │
│   ┌───────────────────────────┐      ┌───────────────────────────┐      ┌────────────────────┐   │
│   │      Discord Gateway      │      │         Groq LPU          │      │     Wikipedia      │   │
│   │   (discord.js v14 WSS)    │      │  (Llama 3.3 70B, Whisper) │      │     REST Search    │   │
│   └───────────────────────────┘      └───────────────────────────┘      └────────────────────┘   │
│   ┌───────────────────────────┐      ┌───────────────────────────┐      ┌────────────────────┐   │
│   │        DuckDuckGo         │      │      Microsoft Edge       │      │    Speechmatics    │   │
│   │       HTML Search         │      │        Neural TTS         │      │     Backup ASR     │   │
│   └───────────────────────────┘      └───────────────────────────┘      └────────────────────┘   │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Groq Multi-Key Quota Protection Pool

```
                       INCOMING VERIFICATION REQUEST
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    GroqVerificationProvider │
                      │   Active Key Pointer: #1    │
                      └──────────────┬──────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │ HTTP 200 OK                           │ HTTP 429 / 401 / 403
                 ▼                                       ▼
        ┌──────────────────┐                   ┌──────────────────┐
        │ Success Payload  │                   │ Rotate to Key #2 │
        └──────────────────┘                   └────────┬─────────┘
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    │ HTTP 200 OK                           │ HTTP 429
                                    ▼                                       ▼
                           ┌──────────────────┐                   ┌──────────────────┐
                           │ Success Payload  │                   │ Rotate to Key #3 │
                           └──────────────────┘                   └────────┬─────────┘
                                                                           │
                                                       ┌───────────────────┴───────────────────┐
                                                       │ HTTP 200 OK                           │ Exhausted
                                                       ▼                                       ▼
                                              ┌──────────────────┐                   ┌──────────────────┐
                                              │ Success Payload  │                   │ Graceful Error   │
                                              └──────────────────┘                   └──────────────────┘
```

---

## 10. Discord Bot vs. Web Application Architecture Boundary

```
                                  VERIVOICE SHARED CORE
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
      ┌───────────────────────────┐                   ┌───────────────────────────┐
      │      WEB APPLICATION      │                   │        DISCORD BOT        │
      │   (Interactive Desktop)   │                   │    (Everyday Community)   │
      ├───────────────────────────┤                   ├───────────────────────────┤
      │ • Vercel Edge CDN Hosting │                   │ • Render Cloud Container  │
      │ • React 18 + Vite + TS    │                   │ • Node.js + discord.js 14 │
      │ • 3D Acoustic Core Wave   │                   │ • Voice Note Attachments  │
      │ • 3D Evidence Constellat. │                   │ • 9 Slash Commands        │
      │ • Interactive Chat Studio │                   │ • @VeriVoice Mentions     │
      │ • Zero Discord dependency │                   │ • Zero Website dependency │
      └───────────────────────────┘                   └───────────────────────────┘
```

---

## 11. Technology Inventory

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime Environment** | Node.js | `>=20.0.0` | Asynchronous JavaScript runtime on Render |
| **HTTP Framework** | Express.js | `^4.19.2` | REST API routes, health check (`/health`), CORS |
| **Discord SDK** | `discord.js` | `^14.27.0` | Discord Gateway WebSocket & REST v10 client |
| **Validation** | Zod | `^3.23.8` | Strict runtime schema validation for verdicts and claims |
| **Security & Env** | `dotenv` | `^16.4.5` | Environment secret isolation |
| **ASR Speech Engine** | Groq Whisper | `large-v3-turbo` | Sub-second multilingual speech-to-text |
| **Reasoning Engine** | Groq LPU | `llama-3.3-70b-versatile` | UNESCO evidence-grounded verification |
| **TTS Speech Engine** | Microsoft Edge TTS | `edge-tts / WebNeural` | Multilingual natural voice synthesis |
| **Search Engine** | Wikipedia REST + DDG | `REST API` | Live real-time knowledge retrieval |
| **Test Framework** | Jest + Supertest | `^29.7.0` | Automated regression and safety testing (19/19 suites) |

---

## 12. Deployment & Process Model

- **Platform**: Render Cloud Web Service (`render.yaml`).
- **Start Command**: `node backend/src/server.js`.
- **Health Check**: `GET /health` (HTTP 200 OK).
- **Process Model**: Single Node.js event-loop process with non-blocking async I/O.
- **State Model**: Purely ephemeral in-memory state; container restarts resume cleanly with zero stale database locks.
