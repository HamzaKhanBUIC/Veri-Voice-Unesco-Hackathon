# VeriVoice Frontend API Contract & Integration Specification

**Document Version:** 1.0.0  
**Status:** Discovery & Architectural Review  
**Target Environment:** Render Node.js Backend (`verivoice-backend`) & Browser Client  

---

## 1. Executive Summary

This document specifies the exact API contract between the VeriVoice Render Backend and the upcoming Web Client (encompassing **VeriVoice Talk** and **VeriVoice Chat**). 

The backend is the sole source of truth for:
- Speech recognition (ASR / STT)
- Language detection and metadata preservation
- Hybrid retrieval (Curated Knowledge Base + Real-time Live Web / Chrome search)
- Source authority classification and evidence evaluation
- Evidence-grounded claim verification and general research LLM execution
- Citation validation and anti-hallucination guardrails
- Neural Text-to-Speech (TTS) audio synthesis

---

## 2. Existing Backend APIs (As-Is Inspection)

### 2.1 Health Check Endpoint
* **Route:** `GET /health`
* **Purpose:** Service liveness, Render keep-alive monitoring, and deployment validation.
* **Headers:** None required.
* **Request Body:** None.
* **Response `200 OK` (JSON):**
  ```json
  {
    "status": "ok",
    "service": "verivoice-backend",
    "timestamp": "2026-08-15T03:12:00.000Z",
    "environment": "production"
  }
  ```
* **Error States:** `502 Bad Gateway` / `503 Service Unavailable` if the Render instance is spinning up or terminated.
* **Frontend Implication:** Web client should ping `/health` on landing or app mount to detect Render cold-starts and show a graceful "Waking up verification engine..." indicator.

---

### 2.2 Core Verification Endpoint
* **Route:** `POST /api/verify`
* **Purpose:** Processes incoming audio recording (Base64) or plain text claim, conducts retrieval, verifies with Groq Llama 3.3 70B, synthesizes Urdu neural audio with Edge TTS, and returns full verdict + audio URL.
* **Headers:** `Content-Type: application/json`
* **Payload Size Limit:** `25MB` (configured in Express `json({ limit: '25mb' })`).

#### Request Schema
```json
{
  "claimText": "پولیو کے قطرے بچوں کے لیے محفوظ اور ضروری ہیں",
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "fileExt": "webm"
}
```
* **Field Rules:**
  * `claimText` (*optional* if `audioBase64` provided): Raw text claim.
  * `audioBase64` (*optional* if `claimText` provided): Base64 encoded audio buffer.
  * `fileExt` (*optional*, default: `"webm"`): `"webm"` | `"ogg"` | `"mp3"` | `"wav"` | `"m4a"`.

#### Response Schema `200 OK` (JSON)
```json
{
  "success": true,
  "userClaim": "پولیو کے قطرے بچوں کے لیے محفوظ اور ضروری ہیں",
  "verdict": "TRUE",
  "confidence": "HIGH",
  "explanation": "عالمی ادارہ صحت (WHO) کے مطابق پولیو ویکسین محفوظ اور مؤثر ہے اور بچوں کو عمر بھر کی معذوری سے بچاتی ہے۔",
  "evidence": [
    {
      "claimId": "claim-polio-001",
      "sourceTitle": "Polio Eradication Factsheet",
      "organization": "WHO Pakistan",
      "url": "https://www.who.int/pakistan"
    }
  ],
  "retrievalMatchesCount": 2,
  "audioUrl": "/tmp/output_1723689123456.mp3",
  "timing": {
    "sttMs": 420,
    "retrievalMs": 310,
    "verificationMs": 740,
    "ttsMs": 650,
    "totalMs": 2120,
    "totalSeconds": "2.12"
  },
  "providers": {
    "stt": "Groq Whisper API",
    "llm": "Groq Llama 3.3 70B",
    "tts": "Microsoft Edge Neural TTS (ur-PK-UzmaNeural)"
  }
}
```

#### Error Response Schemas
* **`400 Bad Request`** (Missing input):
  ```json
  {
    "success": false,
    "error": "No valid claim text or audio transcript was provided."
  }
  ```
* **`500 Internal Server Error`** (Execution exception):
  ```json
  {
    "success": false,
    "error": "Detailed error string (or generic message in production)"
  }
  ```

---

### 2.3 Static Audio File Serving
* **Route:** `GET /tmp/:filename` (e.g. `GET /tmp/output_1723689123456.mp3`)
* **Purpose:** Serves the generated TTS speech audio response.
* **Content-Type:** `audio/mpeg`
* **Cache Headers:** None explicitly set.
* **Frontend Implication:** The audio player can directly stream `/tmp/:filename` via HTML5 Audio element.

---

### 2.4 WhatsApp Webhook Endpoints
* **Routes:** `GET /webhook/whatsapp`, `POST /webhook/whatsapp`, `GET /webhook`, `POST /webhook`
* **Purpose:** Meta WhatsApp Business Cloud API webhook challenges and inbound messages.
* **Status:** Independent adapter. Not used by Web frontend.

---

## 3. Discovered Limitations & Gaps in Existing API

| Area | Current Implementation in `POST /api/verify` | Limitation for Web Client | Required Backend Adjustment |
| :--- | :--- | :--- | :--- |
| **Language Support** | Hardcoded `{ language: 'ur' }` in STT and `ur-PK-UzmaNeural` in TTS | Multi-language claims (English, Spanish, Indonesian) get forced into Urdu TTS | Expose `language` override or rely on dynamic `LanguageDetector` output (already in `StandalonePipeline`) |
| **Mode Selection** | Hardcoded to Verification mode | Cannot explicitly invoke `GENERAL_RESEARCH` mode via web API | Accept `mode: "VERIFICATION" \| "GENERAL_RESEARCH"` in request payload |
| **Domain Hints** | Not accepted in `req.body` | Users cannot filter by `/health`, `/science`, `/climate`, `/disaster`, `/education` | Accept optional `domain: "HEALTH" \| "SCIENCE" \| ...` in request payload |
| **Conversational Context** | Single-turn request-response only | VeriVoice Talk follow-ups ("Why?") require context of previous turn | Accept `history: Array<{ role: 'user'\|'assistant', content: string, verdict?: string }>` |
| **Rate Limiting** | `RateLimiter.js` is only attached to Discord bot, NOT Express web routes | Web endpoint is vulnerable to bot flooding and exhausting Groq keys | Mount `RateLimiter` middleware on `/api/*` endpoints |
| **Audio Upload** | Only accepts JSON Base64 string | Base64 adds 33% payload bloat and memory overhead in browser | Accept `multipart/form-data` as an alternative upload format |
| **Citation Metadata** | Returns basic `{ claimId, sourceTitle, organization, url }` | Missing `authorityLevel` and `publicationDate` on root response | Expose enhanced `sources: Array<{ authorityLevel, domain, url, title, organization }>` |

---

## 4. Proposed Extended Web API Contract (Future Upgrade)

> [!IMPORTANT]
> The existing `POST /api/verify` remains 100% backward-compatible. The following additions will be introduced to power VeriVoice Talk, VeriVoice Chat, and multilingual verification.

### 4.1 Enhanced Verification & Research Endpoint
* **Route:** `POST /api/process` (or enhanced `POST /api/verify`)
* **HTTP Method:** `POST`
* **Purpose:** Unified endpoint handling single-turn verification, multi-turn conversational follow-ups, general research, and multilingual audio/text.

#### Request Schema
```typescript
interface ProcessRequest {
  // Input modality (at least one required)
  claimText?: string;
  audioBase64?: string;
  fileExt?: 'webm' | 'ogg' | 'mp3' | 'wav' | 'm4a';

  // Execution parameters (optional)
  mode?: 'VERIFICATION' | 'GENERAL_RESEARCH' | 'AUTO';
  domain?: 'HEALTH' | 'EARTH_SPACE' | 'WEATHER_CLIMATE' | 'GEOLOGY' | 'DISASTER' | 'SCIENCE' | 'EDUCATION' | 'GENERAL';
  targetLanguage?: 'ur' | 'ur-Roman' | 'en' | 'es' | 'id' | 'ar' | 'hi' | 'fr' | 'de' | 'pt' | 'auto';
  
  // Conversational session context for Talk / follow-up mode (optional)
  conversationId?: string;
  sessionHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    verdict?: string;
  }>;

  // Options
  synthesizeSpeech?: boolean; // Default: true. Set false to save TTS latency for text-only Chat
}
```

#### Response Schema
```typescript
interface ProcessResponse {
  success: boolean;
  requestId: string;
  conversationId?: string;

  // Modality & Processing Data
  userTranscript: string;
  detectedLanguage: {
    languageCode: string; // 'ur', 'en', 'es', 'id', etc.
    originalScript: string;
    responseLanguage: string;
  };
  mode: 'VERIFICATION' | 'GENERAL_RESEARCH';
  domain: string;

  // Verdict & Core Knowledge Output
  verdict: 'TRUE' | 'FALSE' | 'MIXED' | 'UNCERTAIN' | 'RESEARCH_RESPONSE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  evidenceStrength: 'STRONG_EVIDENCE' | 'SUFFICIENT_EVIDENCE' | 'WEAK_EVIDENCE' | 'NO_EVIDENCE' | 'CONFLICTING_EVIDENCE' | 'INFRASTRUCTURE_FAILURE';
  independentSourceCount: number;
  
  // Spoken / Written Output
  explanation: string; // Primary answer/explanation
  audioUrl?: string | null; // e.g. "/tmp/output_1723689123456.mp3"
  audioAvailable: boolean;

  // Evidence & Grounding
  evidence: Array<{
    claimId: string;
    statement: string;
    sourceTitle: string;
    organization: string;
    url: string;
  }>;
  sources: Array<{
    claimId: string;
    sourceTitle: string;
    organization: string;
    url: string;
    domain: string;
    authorityLevel: 'PRIMARY_AUTHORITY' | 'SECONDARY_AUTHORITY' | 'REPUTABLE_NEWS' | 'GENERAL_WEB' | 'UNKNOWN';
  }>;

  // Reliability & Diagnostics
  reason: 'EVIDENCE_GROUNDED' | 'NO_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'SEARCH_INFRASTRUCTURE_FAILURE' | 'PROVIDER_ERROR';
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

---

## 5. Security & Network Considerations

1. **CORS:** Backend currently uses `app.use(cors())`. For production, we will support standard browser origins (`localhost:3000`, `localhost:5173`, custom production domain).
2. **Payload Protection:** Audio uploads are limited to max 15MB audio / 25MB total body.
3. **MIME Whitelist:** `.webm`, `.ogg`, `.mp3`, `.wav`, `.m4a` with format validation in `audioUtils.js`.
4. **Secret Isolation:** Zero backend API keys (`GROQ_API_KEY`, `SPEECHMATICS_API_KEY`, etc.) are sent to or readable by the frontend.
