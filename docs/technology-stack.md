# VeriVoice — Complete Technology Stack & Ecosystem Map
**Comprehensive Inventory of Runtime, Libraries, Models, and Infrastructure**
*Version: 1.0.0 | Verified Passing: 19/19 Test Suites (132/132 Tests)*

---

## 1. Technology Tree Overview

```
VERIVOICE
│
├── 🌐 Frontend Layer (Vercel Edge SPA)
│   ├── Framework: React 18.3.1
│   ├── Build Tool: Vite 5.4.1 / 5.4.21
│   ├── Language: TypeScript 5.5.3
│   ├── Styling: TailwindCSS 3.4.10 + PostCSS 8.4.41 + Autoprefixer 10.4.20
│   ├── Typography: Inter 5.0.21, Literata 5.0.21, Noto Naskh Arabic 5.0.21, JetBrains Mono 5.0.21
│   ├── Icons: Lucide React 0.435.0 + Material Symbols Outlined
│   └── Audio & Canvas: HTML5 Audio API, MediaRecorder API, HTML5 2D/3D Canvas
│
├── ⚙️ Backend Layer (Node.js REST & Orchestration Engine)
│   ├── Runtime: Node.js 20+ (ES2022 / CommonJS)
│   ├── Web Server: Express 4.19.2
│   ├── Cross-Origin: CORS 2.8.5
│   ├── Schema Validation: Zod 3.23.8
│   ├── Environment Management: Dotenv 16.4.5
│   ├── Bot Adapter: Discord.js 14.27.0
│   └── Memory Management: In-Memory Map with 5-minute TTL cleanup
│
├── 🧠 AI & Cognitive Intelligence Layer
│   ├── Fast LLM Reasoning: Groq LPU API (Model: llama-3.3-70b-versatile, temp=0.1–0.2)
│   ├── Primary ASR (Speech-to-Text): Groq Whisper API (whisper-large-v3)
│   ├── Secondary ASR: Speechmatics Real-Time Multilingual ASR API
│   ├── Primary Studio TTS (Text-to-Speech): ElevenLabs API (Model: eleven_multilingual_v2, Voice: Sarah)
│   ├── Secondary Neural TTS: Microsoft Edge Neural TTS (ur-PK-UzmaNeural, en-US-AvaNeural, etc.)
│   └── Client Fallback TTS: Native Browser SpeechSynthesis API (SpeechSynthesisUtterance)
│
├── 🔍 Information Retrieval & Epistemic Grounding Layer
│   ├── Knowledge Base: Curated JSON Knowledge Base (knowledge/claims.json)
│   ├── Live Search Scraper: Google Web & News Search Engine
│   ├── Secondary News Search: WebSearchProvider (Live RSS / News Telemetry)
│   ├── Authority Filter: UNESCO 8-Tier Source Authority Classifier
│   ├── Epistemic Evaluator: EvidenceEvaluator (Token Jaccard Syndication Deduplicator)
│   └── Anti-Hallucination Guardrail: CitationValidator (Strict URL & Domain Allowlisting)
│
├── 🛡️ Safety & Quality Assurance Layer
│   ├── Unit & Integration Testing: Jest 29.7.0
│   ├── HTTP Mocking & Assertion: Supertest 7.0.0
│   ├── Hot-Reloading Development: Nodemon 3.1.4
│   └── Type Safety: Strict TypeScript Compiler (tsc)
│
└── 🚀 Deployment & Infrastructure Layer
    ├── Version Control: Git & GitHub Repository
    ├── Frontend Hosting: Vercel Edge Serverless Network (verivoice-unesco.vercel.app)
    ├── Backend Hosting: Render Web Service (render.yaml, Node.js environment)
    ├── Chatbot Gateway: Discord Gateway WebSocket API
    └── DNS & Routing: Vercel Production Aliasing & SSL Automation
```

---

## 2. Detailed Package & Dependency Inventory

### Frontend Dependencies (`frontend/package.json`)

| Package Name | Exact Version | Purpose & Architectural Role |
|---|:---:|---|
| `react` | `^18.3.1` | Declarative component UI hierarchy and reactive rendering. |
| `react-dom` | `^18.3.1` | DOM reconciliation and virtual DOM binding. |
| `vite` | `^5.4.1` | Ultra-fast development server and production bundle optimizer. |
| `typescript` | `^5.5.3` | Static type safety and strict interface checking across models and hooks. |
| `tailwindcss` | `^3.4.10` | Utility-first styling engine enforcing VeriVoice dark obsidian design system. |
| `clsx` | `^2.1.1` | Conditional CSS class constructor. |
| `tailwind-merge` | `^2.5.2` | Conflict-free Tailwind CSS class merging utility. |
| `lucide-react` | `^0.435.0` | High-clarity SVG interface iconography. |
| `@fontsource/inter` | `^5.0.21` | Self-hosted modern grotesque sans-serif for high legibility UI elements. |
| `@fontsource/literata` | `^5.0.21` | Self-hosted editorial serif typeface for verdicts and journalistic explanations. |
| `@fontsource/noto-naskh-arabic` | `^5.0.21` | Self-hosted authentic Naskh typography for native Urdu script rendering. |
| `@fontsource/jetbrains-mono` | `^5.0.21` | Self-hosted technical monospace for metadata tags, confidence scores, and sources. |

### Backend Dependencies (`package.json`)

| Package Name | Exact Version | Purpose & Architectural Role |
|---|:---:|---|
| `express` | `^4.19.2` | HTTP micro-framework managing routing, middleware, and static streaming. |
| `cors` | `^2.8.5` | Cross-Origin Resource Sharing middleware enabling secure web client calls. |
| `zod` | `^3.23.8` | Declarative schema validation ensuring verdict, claim, and context runtime integrity. |
| `dotenv` | `^16.4.5` | Environment variable loader isolating API keys and server configuration. |
| `discord.js` | `^14.27.0` | Official Discord API client managing Gateway events, interactions, and voice notes. |
| `jest` | `^29.7.0` | Automated test runner executing the 19 test suites across all core services. |
| `supertest` | `^7.0.0` | HTTP assertion library testing Express API endpoints deterministically. |
| `nodemon` | `^3.1.4` | Development file watcher automatically restarting server on backend edits. |

---

## 3. AI Models & Cloud Inference Specifications

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ AI MODEL SPECIFICATIONS & PROVIDER MAPPINGS                                            │
├────────────────────┬────────────────────────────┬──────────────────────────────────────┤
│ TASK               │ MODEL & PROVIDER           │ SPECIFICATIONS / ATTRIBUTES          │
├────────────────────┼────────────────────────────┼──────────────────────────────────────┤
│ LLM Reasoning      │ Groq LPU API               │ • Model: llama-3.3-70b-versatile     │
│ & Verification     │ (Meta LLaMA 3.3 70B)       │ • Context Window: 128k tokens        │
│                    │                            │ • Speed: ~300 tokens/sec             │
│                    │                            │ • Temperature: 0.1 (Strict Truth)    │
├────────────────────┼────────────────────────────┼──────────────────────────────────────┤
│ Speech-to-Text     │ Groq Whisper API           │ • Model: whisper-large-v3            │
│ (ASR)              │ (OpenAI Whisper Large v3)  │ • Languages: 99+ World Languages     │
│                    │                            │ • Auto-detection: Native Script      │
├────────────────────┼────────────────────────────┼──────────────────────────────────────┤
│ Secondary ASR      │ Speechmatics API           │ • Real-time Speech-to-Text Engine    │
│ (Fallback)         │ (Speechmatics Engine)      │ • Accented & noisy audio resilience  │
├────────────────────┼────────────────────────────┼──────────────────────────────────────┤
│ Primary TTS        │ ElevenLabs REST API        │ • Model: eleven_multilingual_v2      │
│ (Studio Voice)     │ (Generative AI Voice)      │ • Voice ID: EXAVITQu4vr4xnSDxMaL     │
│                    │                            │ • Pacing: 0.95, Stability: 0.5       │
├────────────────────┼────────────────────────────┼──────────────────────────────────────┤
│ Secondary TTS      │ Microsoft Edge Neural TTS  │ • Voices: ur-PK-UzmaNeural (Urdu)    │
│ (Edge Neural)      │ (Edge Cloud Transcoder)    │           en-US-AvaNeural (English)  │
│                    │                            │           es-ES-ElviraNeural (Spanish)│
│                    │                            │           id-ID-GadisNeural (Indo)   │
├────────────────────┼────────────────────────────┼──────────────────────────────────────┤
│ Client Fallback    │ Browser SpeechSynthesis    │ • Filtered Female Voice Profile      │
│ (Local Engine)     │ (Web Speech API)           │ • Pitch: 1.08, Rate: 0.95            │
└────────────────────┴────────────────────────────┴──────────────────────────────────────┘
```

---

## 4. Hardware & Infrastructure Footprint

* **Compute Footprint**: Extremely lightweight — entire backend runs efficiently on a single 512MB RAM free-tier cloud container (Render / Docker).
* **Zero Heavy GPU Requirement**: All heavy neural operations (LLaMA 3.3 70B inference, Whisper Large v3 audio transcription, ElevenLabs generative synthesis) are offloaded to ultra-fast specialized LPUs and cloud clusters.
* **Storage Footprint**: Completely stateless with localized temporary file streaming (auto-purged within 10 seconds of delivery). Zero database lock-in.
