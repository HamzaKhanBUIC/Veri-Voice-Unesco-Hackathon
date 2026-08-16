# VeriVoice Discord Bot — Privacy & Data Retention Policy

**Effective Date:** August 2026  
**Governance Framework:** UNESCO Media and Information Literacy (MIL) & Epistemic Privacy Standards  
**System Scope:** VeriVoice Discord Adapter (`DiscordClient`, `DiscordService`, `DiscordMedia`)

---

## 1. Core Privacy Principle: Ephemeral Processing by Design

VeriVoice operates as a **zero-retention, privacy-preserving factual verification assistant**. User voice notes, speech transcripts, and verification requests are processed entirely in memory or in isolated temporary file sandboxes, and are **immediately purged** upon delivery of the verification response.

---

## 2. What Data Is Collected & Processed

| Data Category | Purpose | Processing Lifecycle | Storage Location | Retention Time |
|---|---|---|---|---|
| **Discord User ID** | Rate-limiting (5 req/60s) to prevent system abuse | In-Memory Sliding Window | RAM (`RateLimiter.js`) | Auto-purged after **2 minutes** |
| **Discord Message / Interaction ID** | Idempotency deduplication (prevents duplicate runs) | In-Memory Sliding Window | RAM (`DiscordService.js`) | Auto-purged after **2 minutes** |
| **Incoming Voice Audio (.ogg/.mp3)** | Speech-to-text transcription via Whisper | Temporary File Sandbox | `backend/tmp/discord_<uuid>.ext` | **Deleted immediately** in `finally` block (<3 seconds) |
| **Speech Transcripts & Query Text** | Live knowledge retrieval & claim verification | In-Memory Pipeline | Volatile RAM | Discarded immediately upon request completion |
| **Synthesized Voice Response (.mp3)** | Spoken voice delivery in Discord channel | Temporary File Attachment | `backend/tmp/pipeline_res_<uuid>.mp3` | Uploaded to Discord CDN and unlinked from local storage |
| **System Diagnostics / Logs** | Health monitoring and error diagnosis | Server Console Stream | Standard Output (stdout) | Contains `requestId`, `latency`, `domain` (zero secrets or PII) |

---

## 3. What VeriVoice NEVER Collects or Stores

- ❌ **No Persistent Databases**: VeriVoice maintains zero user databases, MongoDB, PostgreSQL, or persistent message tables.
- ❌ **No User Profiling or Tracking**: No user behavioral tracking, cookie tracking, or Discord profile harvesting.
- ❌ **No Audio Archiving**: User voice recordings are never archived, retained for model training, or sold.
- ❌ **No DM / Channel Scraping**: VeriVoice only processes messages where the bot is explicitly mentioned (`@VeriVoice`), slash commands triggered, or voice notes uploaded directly.

---

## 4. Third-Party Provider Data Flow & Subprocessors

To execute real-time speech-to-text, fact retrieval, and neural voice synthesis, VeriVoice coordinates with the following external processors:

```
[ Discord User Voice ]
         │
         ├──► [ Groq Whisper API (whisper-large-v3-turbo) ]: Ephemeral ASR transcription. Zero data retention by VeriVoice.
         ├──► [ Groq LPU (Llama 3.3 70B Versatile) ]: Factual reasoning and evidence verification.
         ├──► [ Wikipedia REST & DuckDuckGo ]: Anonymous public knowledge search queries.
         └──► [ Microsoft Edge Neural TTS ]: Audio waveform synthesis.
```

- **Data Minimization**: Only the claim/question text is sent to retrieval providers. User Discord IDs, guild names, and channel metadata are stripped before external API calls.
- **Provider Policy Transparency**: External APIs are invoked via HTTPS TLS 1.3 endpoints.

---

## 5. User Disclosures & Transparency Commands

Users can inspect VeriVoice’s architecture, methodology, and privacy policies directly within Discord using:

- `/help` — Onboarding guide with privacy disclosure and command usage.
- `/about` — Full UNESCO MIL epistemic grounding, dataset transparency, and source authority hierarchies.
