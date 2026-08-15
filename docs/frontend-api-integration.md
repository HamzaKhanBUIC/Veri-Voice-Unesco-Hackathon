# VeriVoice Frontend API Integration & Backend Contract Specification

**Document Version:** 1.0.0  
**Phase:** Phase 0 — Read-Only Architecture Audit  
**Status:** Frozen & Approved for Frontend Implementation  
**Backend Host:** Render Node.js Express Service (`verivoice-backend`)  

---

## 1. Executive Summary

This document specifies the exact API integration contract between the VeriVoice Render Backend and the new React/Vite web frontend.

The backend is the sole source of truth for all verification intelligence, Speech-to-Text (ASR), Hybrid Retrieval, Grounded LLM Reasoning, Citation Validation, and Neural Text-to-Speech (TTS) synthesis. The frontend consumes these capabilities and does not duplicate verification intelligence in the browser.

---

## 2. Existing Backend Contract (As-Is Audit)

### 2.1 Health Check Endpoint
* **Endpoint:** `GET /health`
* **Purpose:** Liveness check, Render cold-start detection, and keep-alive polling.
* **Headers:** None required.
* **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "service": "verivoice-backend",
    "timestamp": "2026-08-15T04:20:00.000Z",
    "environment": "production"
  }
  ```
* **Error Behavior:** Standard `502`/`503` if Render free instance is cold-starting.
* **Frontend Usage:** Web shell pings `/health` upon mount to wake the instance silently and display a non-blocking status indicator.

---

### 2.2 Core Verification & Audio Processing Endpoint
* **Endpoint:** `POST /api/verify`
* **Purpose:** Handles browser audio recordings (Base64) or plain text claims, runs ASR, queries hybrid retrieval, evaluates evidence authority, verifies with Groq Llama 3.3 70B, generates Microsoft Edge neural audio, and returns full verdict + MP3 URL.
* **Headers:** `Content-Type: application/json`
* **Payload Limit:** `25MB`

#### Request Schema
```typescript
interface VerifyRequest {
  claimText?: string;      // Plain text claim (optional if audioBase64 provided)
  audioBase64?: string;    // Base64 encoded audio string (optional if claimText provided)
  fileExt?: string;        // 'webm' | 'ogg' | 'mp3' | 'wav' | 'm4a' (default: 'webm')
}
```

#### Response Schema `200 OK`
```typescript
interface VerifyResponse {
  success: boolean;
  userClaim: string;
  verdict: 'TRUE' | 'FALSE' | 'MIXED' | 'UNCERTAIN' | 'RESEARCH_RESPONSE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | number;
  explanation: string;
  evidence: Array<{
    claimId: string;
    sourceTitle: string;
    organization: string;
    url: string;
    authorityLevel?: 'PRIMARY_AUTHORITY' | 'SECONDARY_AUTHORITY' | 'REPUTABLE_NEWS' | 'GENERAL_WEB' | 'UNKNOWN';
  }>;
  retrievalMatchesCount: number;
  audioUrl: string; // e.g. "/tmp/output_1723689123456.mp3"
  timing: {
    sttMs: number;
    retrievalMs: number;
    verificationMs: number;
    ttsMs: number;
    totalMs: number;
    totalSeconds: string;
  };
  providers: {
    stt: string;
    llm: string;
    tts: string;
  };
}
```

#### Error Response Schemas
* **`400 Bad Request`:**
  ```json
  {
    "success": false,
    "error": "No valid claim text or audio transcript was provided."
  }
  ```
* **`500 Internal Server Error`:**
  ```json
  {
    "success": false,
    "error": "Detailed error message"
  }
  ```

---

### 2.3 Audio Playback Endpoint
* **Endpoint:** `GET /tmp/:filename` (e.g. `GET /tmp/output_1723689123456.mp3`)
* **Purpose:** Delivers the synthesized Edge Neural TTS MP3 audio stream for playback.
* **Content-Type:** `audio/mpeg`
* **Frontend Usage:** Loaded into HTML5 Audio element or Web Audio API `AudioContext`.

---

## 3. Existing Capabilities & Data Formats

### 3.1 Verdict Values (Strictly Controlled)
The frontend maps the backend verdict string directly to the approved semantic tokens:
* `TRUE`: Emerald Green (`#10B981`) — Claim is supported by authoritative evidence.
* `FALSE`: Crimson Red (`#EF4444`) — Claim is contradicted/debunked by authoritative evidence.
* `MIXED`: Warm Amber (`#F59E0B`) — Claim contains partial truth or requires essential qualifiers.
* `UNCERTAIN`: Neutral Slate (`#64748B`) — Available evidence is insufficient or contradictory.
* `RESEARCH_RESPONSE`: Vibrant Teal (`#7ED4D6`) — General exploratory research answer.

### 3.2 Evidence & Citation Format
Each evidence object contains:
* `claimId`: Unique alphanumeric identifier (e.g. `claim-polio-001` or generated search ID).
* `sourceTitle`: Publication or document title (e.g. *"Polio Eradication Guidance"*).
* `organization`: Authoritative body (e.g. *"World Health Organization"*).
* `url`: Direct canonical URL (e.g. `"https://www.who.int/pakistan"`).

### 3.3 Language Metadata
Backend `LanguageDetector.js` automatically classifies scripts and vocabulary:
* `ur` (Urdu - Nastaliq / Naskh script, RTL)
* `ur-Roman` (Roman Urdu - Latin script, LTR)
* `en` (English)
* `es` (Spanish)
* `id` (Indonesian)
* `ar`, `hi`, `bn`, `fr`, `de`, `pt` (Extended languages)

---

## 4. Missing Backend Capabilities vs. Frontend Requirements

| Requirement in Stitch Design | Current Backend Implementation | Frontend Mitigation / Solution |
| :--- | :--- | :--- |
| **Explicit General Research Mode** | Backend has `IntentDetector`, but `POST /api/verify` doesn't accept `mode` override parameter. | Frontend formats research query prefixes or questions naturally; backend `IntentDetector` handles intent automatically. |
| **Dynamic Multilingual Speech Synthesis** | `POST /api/verify` hardcodes `ur-PK-UzmaNeural` in `api.routes.js` (though `StandalonePipeline.js` supports dynamic voice selection). | Frontend sends language metadata, and we can submit clean PR to update `api.routes.js` to match `StandalonePipeline` without breaking Discord. |
| **Rate Limit Middleware on Web** | `RateLimiter.js` is only attached to Discord bot, not `/api/verify`. | Frontend implements client-side debouncing and request throttling while backend rate limiter can be attached. |

---

## 5. Security & Isolation Guarantee

* **Zero Client-Side Secrets:** Neither `GROQ_API_KEY`, `SPEECHMATICS_API_KEY`, nor `DISCORD_BOT_TOKEN` are exposed to the frontend.
* **Discord Bot Independence:** Discord adapter runs in its own listener lifecycle (`DiscordService.js`) and is completely decoupled from web requests.
* **Safe Audio Handling:** All recorded audio in the browser is encoded to Opus WebM/Ogg, validated on the client, and sanitized on the server before transcription.
