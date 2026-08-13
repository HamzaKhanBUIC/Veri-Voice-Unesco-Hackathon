# VeriVoice — Voice-First Multilingual Evidence Verification & Research Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js CI](https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon/actions/workflows/test.yml/badge.svg)](https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon/actions/workflows/test.yml)
[![Render Deployment](https://img.shields.io/badge/Render-Deployed-brightgreen.svg)](https://render.com)
[![UNESCO Hackathon](https://img.shields.io/badge/UNESCO-Infodemic%20Challenge-blue.svg)](https://unesco.org)

> **VeriVoice** is an evidence-first, voice-first multilingual assistant that empowers communities to verify rumors, research complex questions, understand authoritative scientific evidence, and receive spoken responses in their native languages.

---

## 📌 Executive Summary

Fact-checking tools often fail vulnerable communities because they rely on dense written text, assume high media literacy, and prioritize major global languages. When rumors spread via voice notes in group chats, users—especially those with lower literacy or limited internet confidence—have no simple way to verify what they hear.

**VeriVoice** solves this by establishing a **voice-in, voice-out claim verification & research engine**. Users can speak a claim or question in **Urdu, Spanish, Indonesian, or English** (or send a voice note via Discord/WhatsApp) and receive a clear, spoken explanation backed by transparent, verified institutional citations.

---

## 🌟 Key Features

1. **Voice-First Pipeline (ASR + TTS)**: Accepts audio recordings (`.ogg`, `.mp3`, `.wav`), transcribes speech via **Speechmatics ASR**, and synthesizes natural native spoken responses via **Microsoft Edge Neural TTS**.
2. **Dual Intelligence Modes**:
   - **Verification Mode (`/verify`)**: Evaluates rumors against live authoritative web evidence (`TRUE`, `FALSE`, `MIXED`, `UNCERTAIN`).
   - **General Research Mode (`/general`)**: Answers research questions directly with evidence-grounded summaries without forcing artificial true/false verdicts.
3. **12 Domain Classifiers**: Routes queries across `HEALTH`, `EARTH_SPACE`, `WEATHER_CLIMATE`, `GEOLOGY`, `DISASTER`, `TECHNOLOGY`, `ECONOMICS`, `LAW_POLICY`, `SCIENCE`, `EDUCATION`, `HISTORY`, and `GENERAL`.
4. **Domain-Aware Source Authority**: Prioritizes primary institutional authorities (WHO, PAHO, CDC, NASA, USGS, NOAA, WMO, UNDRR) over secondary encyclopedic entries.
5. **Multilingual Processing**: Supports Urdu, Spanish, Indonesian, and English with automatic cross-lingual concept expansion for targeted live retrieval.
6. **Multi-Key API Rotation**: Built-in round-robin rotation and fallback across multiple Groq API keys to prevent rate limits (`HTTP 429`).
7. **Security & Prompt Injection Defenses**: Strictly isolates untrusted inputs within XML prompt boundaries and enforces URL citation validation to prevent hallucinated references.
8. **Ephemeral Storage & Privacy**: Temporary audio files are unlinked immediately after response generation using `safeCleanup()`.

---

## 📐 Architecture & Core Loop

```text
               VOICE / TEXT INPUT (Discord / WhatsApp / CLI)
                                   │
                                   ▼
                       Language & Intent Detection
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
            VERIFICATION MODE           GENERAL RESEARCH MODE
            (/verify <claim>)            (/general <query>)
                     │                           │
                     └─────────────┬─────────────┘
                                   ▼
                      Domain-Aware Web Retrieval
              (Wikipedia REST + Live Targeted Search)
                                   │
                                   ▼
                        Source Authority Ranking
            (Primary Authorities > Secondary Authorities)
                                   │
                                   ▼
                      Evidence Evaluator & Groq LLM
                                   │
                                   ▼
                    Citation Validation & Schema Check
                                   │
                                   ▼
                       Microsoft Edge Neural TTS
                                   │
                                   ▼
              DISCORD EMBED CARD + SPOKEN URDU MP3 RESPONSE
```

---

## 💻 Supported Interfaces

### 🤖 Discord Bot Workspace (Primary Live Interface)
VeriVoice runs 24/7 on Discord with 9 interactive slash commands:
- `/verify <claim>` — Verify a rumor or statement against live evidence.
- `/general <question>` — Research a question with evidence grounding.
- `/health <input>` — Health and medical claims.
- `/science <input>` — Science and astronomy claims.
- `/climate <input>` — Climate and weather information.
- `/disaster <input>` — Disaster risk and emergency management.
- `/education <input>` — Educational policy and information literacy.
- `/help` — Interactive onboarding card.
- `/about` — Platform background and UNESCO infodemic mitigation identity.

*Sending a voice note in a channel automatically triggers Speech-to-Text transcription, verification, and a spoken voice response!*

---

## 🔧 Technology Stack

- **Runtime & Backend**: Node.js, Express.js
- **Discord Integration**: `discord.js` v14 (WebSocket Gateway + REST Commands)
- **Speech-to-Text (ASR)**: Speechmatics API
- **Text-to-Speech (TTS)**: Microsoft Edge Neural TTS (`edge-tts`)
- **LLM Engine**: Groq API (`llama-3.3-70b-versatile`)
- **Validation**: Zod schema validation & Citation URL matching
- **Testing**: Jest (17 test suites, 99 unit & integration tests)
- **Hosting**: Render (Node.js Persistent Web Service)

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 18.0.0 or higher
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon.git
cd Veri-Voice-Unesco-Hackathon

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Environment Variables
Edit `.env` and fill in your credentials:
```env
PORT=3000
NODE_ENV=development
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_APPLICATION_ID=1537205576809840702
GROQ_API_KEY=gsk_your_groq_key
SPEECHMATICS_API_KEY=your_speechmatics_key
SPEECH_PROVIDER=speechmatics
TTS_PROVIDER=edge-tts
LLM_PROVIDER=groq
```

### 4. Running the App
```bash
# Run backend server & Discord bot locally
npm start

# Run local development with auto-reload
npm run dev
```

---

## 🧪 Testing

Run the full automated test suite (17 suites, 99 tests):
```bash
npm test
```

Run CLI verification tool offline:
```bash
# Test standalone pipeline
npm run pipeline -- ./test-fixtures/audio/sample_claim_ur.ogg

# Test offline retrieval
npm run retrieve -- "زمین سورج کے گرد گردش کرتی ہے" --fixture
```

---

## 🛡️ Governance & Safety

- **Production Dataset Integrity**: `knowledge/claims.json` remains strictly `[]` (0 claims). Medically unverified claims are never automatically promoted.
- **Parametric Memory Fallback**: Claims lacking direct, authoritative evidence evaluate to `UNCERTAIN` to prevent AI hallucination.
- **Privacy & Audio Deletion**: Audio files in `backend/tmp/` are deleted immediately after response generation.

---

## 📄 License & Hackathon Context

Developed for the **UNESCO Infodemic Mitigation Challenge**.  
Licensed under the [MIT License](LICENSE).