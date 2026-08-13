# VeriVoice System Architecture

## 1. System Overview
VeriVoice is an automated voice-based claim verification prototype for Urdu health rumors received via WhatsApp.

```
+------------------+     +-------------------+     +------------------+
| WhatsApp User    | --> | Express Webhook   | --> | WhatsAppService  |
| (Voice Note .ogg)|     | GET/POST /webhook |     | (Idempotency Check)
+------------------+     +-------------------+     +------------------+
                                                            |
                                                            v
+------------------+     +-------------------+     +------------------+
| WhatsApp User    | <-- | WhatsAppClient    | <-- | Standalone       |
| (Audio Reply)    |     | (Upload & Send)   |     | Core Pipeline    |
+------------------+     +-------------------+     +------------------+
                                                            |
                                           +----------------+----------------+
                                           |                |                |
                                           v                v                v
                                     +-----------+    +-----------+    +-----------+
                                     | STT       |    | Retrieval |    | Verification|
                                     | Service   |    | Service   |    | Engine    |
                                     +-----------+    +-----------+    +-----------+
```

## 2. Decoupled Pipeline & WhatsApp Layer

### WhatsApp Integration Layer (`backend/src/services/whatsapp/`)
- **Strict Boundary Decoupling**: WhatsApp code acts strictly as an interface adapter around `StandalonePipeline`. It contains 0 verification, STT, retrieval, or TTS logic internally.
- **Webhook Controller (`whatsappController.js`)**:
  - `GET /webhook/whatsapp`: Meta challenge token verification (`hub.mode`, `hub.verify_token`, `hub.challenge`).
  - `POST /webhook/whatsapp`: Meta event receiver. Responds HTTP 200 `EVENT_RECEIVED` immediately and processes pipeline asynchronously.
- **API Client (`WhatsAppClient.js`)**: Meta Cloud API wrapper for fetching temporary media URLs, downloading media binary, uploading audio MP3s, and sending WhatsApp messages.
- **Media Security (`WhatsAppMedia.js`)**: Enforces 16MB file size limit, supported audio MIME types (`audio/ogg`, `audio/mpeg`, `audio/wav`), path traversal safety, and `finally` temp file cleanup.
- **Message Deduplication (`WhatsAppIdempotency.js`)**: In-memory LRU/TTL deduplication store preventing double-processing on Meta webhook retries.
