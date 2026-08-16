# API Key & Live Provider Readiness Audit

> **SECURITY NOTICE**: This audit evaluates environment variable configuration. **NO Secret values or API tokens are printed or logged.**

---

## 1. Provider & Credential Readiness Matrix

| Provider / Service | Environment Variable | Required for Live Demo? | Configured Status | Used By | Notes |
|---|---|:---:|:---:|---|---|
| **Speech-To-Text (STT)** | GROQ_API_KEY | **YES** | MISSING | WhisperProvider (Groq Whisper API) | Primary cloud STT provider for fast Urdu audio transcription |
| **Speech-To-Text (STT)** | OPENAI_API_KEY | **NO** | MISSING | WhisperProvider (OpenAI API) | Alternative cloud STT provider |
| **Speech-To-Text (STT)** | SPEECHMATICS_API_KEY | **NO** | MISSING | SpeechmaticsProvider | Alternative cloud STT provider |
| **LLM Verification Engine** | GROQ_API_KEY | **YES** | MISSING | GroqVerificationProvider | Primary LLM provider (Llama 3.3 70B) for evidence-grounded verification |
| **Meta WhatsApp Cloud API** | WHATSAPP_TOKEN | **YES** | MISSING | WhatsAppClient | Permanent/System User Access Token for Meta Graph API |
| **Meta WhatsApp Cloud API** | WHATSAPP_PHONE_NUMBER_ID | **YES** | MISSING | WhatsAppClient | Meta Business Phone Number ID |
| **Meta WhatsApp Webhook** | WHATSAPP_VERIFY_TOKEN | **YES** | **CONFIGURED** | whatsappController.js | Webhook verification token (Default: verivoice_webhook_verify_token) |
| **Meta WhatsApp Webhook** | WHATSAPP_API_VERSION | **YES** | **CONFIGURED** | WhatsAppClient.js | Meta Graph API Version (Default: v19.0) |
| **Text-To-Speech (TTS)** | N/A (Edge TTS) | **YES** | **API KEY NOT REQUIRED** | EdgeTTSProvider.js | Microsoft Edge Neural TTS (ur-PK-UzmaNeural) verified real & functional |

---

## 2. Summary of Missing Production Credentials
1. **GROQ_API_KEY**: Required for both Groq Whisper STT and Groq Llama 3.3 70B verification.
2. **WHATSAPP_TOKEN**: Required for Meta Cloud API audio/text message sending and media downloads.
3. **WHATSAPP_PHONE_NUMBER_ID**: Required for Meta Cloud API messaging endpoints.
