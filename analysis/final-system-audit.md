# VeriVoice — Final System & Architecture Audit Report

This audit evaluates the current state of the VeriVoice voice-first evidence verification engine before expanding into multilingual support, source authority classification, guided CLI setup diagnostics, and production-ready Discord bot deployment.

---

## 1. Current Architecture

```text
USER (Voice Note / Slash Command / Web UI)
               │
               ▼
   INTERFACE ADAPTER LAYER
   ├── Discord Bot Adapter (backend/src/services/discord/)
   ├── WhatsApp Cloud API Adapter (backend/src/services/whatsapp/)
   └── Interactive Web UI (backend/public/index.html & api.routes.js)
               │
               ▼
   STANDALONE PIPELINE ORCHESTRATOR (backend/src/services/pipeline/standalonePipeline.js)
               │
       ┌───────┴───────┐
       ▼               ▼
 SPEECH-TO-TEXT    HYBRID RETRIEVAL SERVICE (retrievalService.js)
 (Speechmatics /   ├── Layer 1: Offline Authoritative Claims (knowledge/claims.json = [])
  Whisper)         └── Layer 2: Live Web & Google Search (ChromeSearchProvider.js)
       │               │
       └───────┬───────┘
               ▼
 VERIFICATION ENGINE (verificationEngine.js)
 ├── Strict Zod Verdict Schema (TRUE / FALSE / MIXED / UNCERTAIN)
 ├── Evidence-ID Allow-List Validation
 ├── Prompt-Injection Defense Guards
 └── Forced UNCERTAIN Fallback on Zero/Unverified Evidence
               │
               ▼
 TEXT-TO-SPEECH SYNTHESIS (EdgeTTSProvider.js / ur-PK-UzmaNeural)
               │
               ▼
 AUDIO & TEXT RESPONSE DELIVERED TO USER INTERFACE
```

---

## 2. Component Readiness Matrix

| Component Layer | Implementation File | Status | Notes |
|---|---|---|---|
| **Audio Validation & Utilities** | `backend/src/utils/audioUtils.js` | ✅ COMPLETED | Path traversal guard, MIME validation, format conversion. |
| **STT Abstraction** | `SpeechmaticsProvider.js`, `WhisperProvider.js`, `MockSpeechProvider.js` | ✅ COMPLETED | Multi-provider abstraction supporting Urdu & English speech. |
| **Hybrid Retrieval Engine** | `retrievalService.js`, `ChromeSearchProvider.js`, `WebSearchProvider.js` | ✅ COMPLETED | Combines offline KB lookup + real-time Google web search fallback. |
| **Verification Engine** | `verificationEngine.js`, `GroqVerificationProvider.js`, `MockVerificationProvider.js` | ✅ COMPLETED | Enforces Zod schema, allowlist validation, and `UNCERTAIN` fallbacks. |
| **TTS Synthesis** | `EdgeTTSProvider.js`, `MockTTSProvider.js` | ✅ COMPLETED | Microsoft Edge Neural TTS (No API key required). |
| **Standalone Pipeline Core** | `standalonePipeline.js` | ✅ COMPLETED | Platform-independent pipeline runner. |
| **Discord Bot Adapter** | `backend/src/services/discord/` | ✅ COMPLETED | Handles voice notes, slash commands (`/verify`), auto-cleanup. |
| **WhatsApp Adapter** | `backend/src/services/whatsapp/` | ✅ COMPLETED | Preserved as optional future platform adapter. |
| **Interactive Web UI** | `backend/public/index.html`, `api.routes.js` | ✅ COMPLETED | Single-page browser mic recorder & response player on port 3000. |

---

## 3. Missing & Enhancement Components

1. **Multilingual Claim Preservation & Detection (`LanguageDetector.js`)**:
   - Currently, STT and text normalization assume Urdu or English.
   - We need an explicit `LanguageDetector` to preserve `originalText`, `detectedLanguage`, `normalizedText`, `verificationLanguage`, and `responseLanguage` across Spanish, Indonesian, Arabic, Hindi, French, German, Portuguese, etc.

2. **Source Authority & Reliability Classifier (`SourceAuthorityFilter.js`)**:
   - Currently, live web search returns general web snippets.
   - We must introduce a strict source authority model (`PRIMARY_AUTHORITY` e.g., WHO/PAHO/NIH, `SECONDARY_AUTHORITY`, `REPUTABLE_NEWS`, `GENERAL_WEB`, `UNKNOWN`) so search results are filtered and weighted properly before verification reasoning.

3. **Human-Understandable Structured Response Formatter**:
   - Standardize response payload format across all adapters: Verdict badge, confidence, explanation, bulleted evidence points, and validated clickable source citations.

4. **Guided System Setup CLI (`scripts/setup-check.js`)**:
   - Add `npm run setup:check` to automatically audit Node.js, dependencies, `.env` keys, TTS availability, Discord bot token readiness, and test status with clear remediation instructions for missing items.

5. **Multilingual & Citation Integrity Automated Tests (`tests/multilingual.test.js`, `tests/citation.test.js`)**:
   - Add automated test suites verifying language preservation, citation allow-list matching, source authority rating, and prompt-injection safety across non-English/non-Urdu claims.

---

## 4. API Keys & External Accounts Required

| Key / Variable | Required / Optional | Service / Account | Obtaining URL | Free-Tier Status |
|---|---|---|---|---|
| `GROQ_API_KEY` | **Required** (for live LLM reasoning) | Groq Cloud | [https://console.groq.com/keys](https://console.groq.com/keys) | 100% Free Developer Tier |
| `SPEECHMATICS_API_KEY` | **Optional** (falls back to Whisper/Mock) | Speechmatics ASR | [https://portal.speechmatics.com/](https://portal.speechmatics.com/) | Hackathon $500 Credit |
| `DISCORD_BOT_TOKEN` | **Required** (for live Discord bot) | Discord Developer Portal | [https://discord.com/developers/applications](https://discord.com/developers/applications) | 100% Free |
| `DISCORD_APPLICATION_ID` | **Required** (for live Discord bot) | Discord Developer Portal | [https://discord.com/developers/applications](https://discord.com/developers/applications) | 100% Free |
| `OPENAI_API_KEY` | Optional | OpenAI API | [https://platform.openai.com/](https://platform.openai.com/) | Paid / Optional |

---

## 5. Security & Data Governance

1. **Production Dataset Integrity**: `knowledge/claims.json` remains strictly `[]` (0 claims). No unverified or raw LLM-generated claims are added without medical review.
2. **Untrusted Web Search Data Isolation**: Web search results are treated strictly as untrusted data inputs, wrapped in boundary blocks to prevent prompt-injection attacks.
3. **Citation Integrity**: Citations are validated against actually retrieved sources. Model memory hallucinated URLs are rejected and result in `UNCERTAIN` fallbacks.
4. **Temporary File Security**: Downloaded Discord and WhatsApp audio attachments are validated for MIME and size (<15MB), written to `backend/tmp/`, and deleted in a `finally` block.

---

## 6. Current Test Suite Status
- **Automated Tests**: **76 / 76 PASS (100%)** across 9 test suites.
- **Goal**: Maintain 100% test pass rate while expanding test coverage to multilingual claim handling, source authority filtering, setup CLI diagnostics, and runbook flows.
