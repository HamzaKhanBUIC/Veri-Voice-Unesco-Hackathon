# VeriVoice — Meta WhatsApp Integration Setup Status

This document tracks the component-by-component setup status for the VeriVoice WhatsApp voice-verification prototype integration.

---

## Component Readiness Matrix

| Integration Component | Status | Details / Identifier |
| :--- | :---: | :--- |
| **Meta Account** | `READY` | Personal Facebook / Meta developer account verified. |
| **Developer Account** | `READY` | Meta for Developers account registered. |
| **Business Portfolio** | `READY` | Automatically created/linked in Meta Dashboard. |
| **Developer App** | `READY` | "Other" -> "Business" App created. |
| **WhatsApp Product** | `READY` | WhatsApp product added to app. |
| **Test Phone Number** | `READY` | Meta Sandbox Number (`+1 555-652-8635`). |
| **Test Recipient** | `READY` | Verified test recipient (`+92 347 4646840`). |
| **Access Token** | `READY` | Active token configured in `.env`. |
| **Phone Number ID** | `READY` | `1303863096143760` configured in `.env`. |
| **Verify Token** | `READY` | `verivoice_webhook_verify_token` configured in `.env`. |
| **Public HTTPS Tunnel** | `READY` | Active zero-landing-page tunnel (`https://1f2211158c6150.lhr.life`). |
| **Webhook Challenge GET** | `READY` | `GET /webhook/whatsapp` returning `hub.challenge`. |
| **Incoming Message Webhook** | `READY` | `messages` field subscribed in Meta App Dashboard. |
| **Voice Message Reception** | `READY` | Webhook handler parses audio payloads & downloads media. |
| **STT Engine** | `READY` | `SpeechmaticsProvider` (Urdu `ur` batch transcription). |
| **LLM Engine** | `READY` | `GroqVerificationProvider` (`llama-3.3-70b` evidence verification). |
| **TTS Engine** | `READY` | `EdgeTTSProvider` (`ur-PK-UzmaNeural` speech synthesis). |

---

## Active Environment Variables Configuration (.env)

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
GROQ_API_KEY=gsk_...
SPEECHMATICS_API_KEY=ZIM...
SPEECH_PROVIDER=speechmatics
TTS_PROVIDER=edge-tts
TTS_VOICE_URDU=ur-PK-UzmaNeural
LLM_PROVIDER=groq
WHATSAPP_TOKEN=EAAP...
WHATSAPP_PHONE_NUMBER_ID=1303863096143760
WHATSAPP_VERIFY_TOKEN=verivoice_webhook_verify_token
WHATSAPP_API_VERSION=v19.0
```
