# VeriVoice Testing Strategy

## 1. Automated Test Suites (`npm test`)
Running `npm test` executes **59 passing tests** across 8 test suites:

- **WhatsApp Integration Layer (`tests/whatsapp.test.js`)**:
  - Webhook GET challenge verification (`200 OK` on valid token, `403` on mismatch).
  - Webhook POST event receiving and async acknowledgment (`200 EVENT_RECEIVED`).
  - Non-audio message text response ("وائس نوٹ کی صورت میں بھیجیں").
  - Idempotency message deduplication test.
  - Media security (16MB size limit, MIME type checks, path traversal protection).
  - Core boundary delegation test (verifies `WhatsAppService` calls `StandalonePipeline`).
  - Error and fallback handling (download/send failure -> safe Urdu fallback text).
- **Verification Engine & Safety (`tests/verification.test.js`)**: Deterministic pre-check, verdict semantics (`TRUE`, `FALSE`, `MIXED`, `UNCERTAIN`), and 6 adversarial attack scenarios (prompt injection, malformed JSON, invalid verdict string, fabricated evidence ID, high confidence 0 evidence, provider errors).
- **Verdict Schema (`tests/verdictSchema.test.js`)**: Zod verdict validation and URL checks.
- **Retrieval Engine (`tests/retrieval.test.js`)**: Keyword search scoring and ranking.
- **Standalone Pipeline (`tests/pipeline.test.js`)**: Offline STT, TTS, and pipeline orchestration.
- **Audio Utilities (`tests/audio.test.js`)**: Path safety and temp file cleanup.
- **Health Route (`tests/health.test.js`)**: Express server and environment validation.

## 2. Real Credential Status
- **WhatsApp Cloud API**: Credentials (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`) are unconfigured in environment. Real WhatsApp validation is blocked.
- **LLM API**: `GROQ_API_KEY` is unconfigured. `MockVerificationProvider` is used for offline tests.
