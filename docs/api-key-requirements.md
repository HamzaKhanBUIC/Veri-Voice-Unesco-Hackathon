# VeriVoice — API Key & Environment Credential Requirements

This document details all external service credentials, environment variables, free-tier availability, and setup instructions for VeriVoice.

---

## 1. Credential Matrix

| Service | Environment Variable | Required for Live Demo? | Purpose | Free Tier / Hackathon Credit Availability | Where Credentials Are Obtained |
|---|---|---|---|---|---|
| **Groq Cloud** | `GROQ_API_KEY` | **YES** | LLM evidence-grounded verification reasoning (Llama 3.3 70B) | 100% Free Developer Tier | [https://console.groq.com/keys](https://console.groq.com/keys) |
| **Discord Bot** | `DISCORD_BOT_TOKEN` | **YES** | Discord bot authentication & connection | 100% Free Developer Account | [https://discord.com/developers/applications](https://discord.com/developers/applications) (Bot tab) |
| **Discord App** | `DISCORD_APPLICATION_ID` | **YES** | Slash commands registration & OAuth2 invite link | 100% Free Developer Account | [https://discord.com/developers/applications](https://discord.com/developers/applications) (General Info) |
| **Speechmatics** | `SPEECHMATICS_API_KEY` | Optional | High-accuracy Urdu Batch STT transcription | $500 UNESCO Hackathon Credit | [https://portal.speechmatics.com/](https://portal.speechmatics.com/) |
| **Microsoft Edge TTS** | *None required* | **No key needed** | Natural Urdu & multilingual neural voice synthesis (`ur-PK-UzmaNeural`, `es-ES-ElviraNeural`, etc.) | 100% Free (Microsoft Edge Open API) | Built-in via `EdgeTTSProvider` |

---

## 2. Environment Diagnostics & Setup Assistant

Run the built-in diagnostic tool to audit your local setup:

```bash
npm run setup:check
```

Outputs clear, actionable next steps for missing items without exposing API key values.

---

## 3. Security Rules
- **NEVER** commit `.env` to Git.
- **NEVER** expose API key strings in chat, screenshots, logs, or source code.
- Always use `process.env.<VAR_NAME>` to access credentials inside backend services.
