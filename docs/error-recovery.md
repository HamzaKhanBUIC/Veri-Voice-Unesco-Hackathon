# VeriVoice Production Error Recovery & Resilience Architecture

This document specifies the failure detection, taxonomy classification, and bounded recovery policies implemented across the VeriVoice system.

---

## 1. Error Classification Taxonomy

VeriVoice classifies all failures into unambiguous domain categories. System infrastructure failures are strictly decoupled from evidence uncertainty conclusions (`UNCERTAIN`).

```
                              ┌────────────────────────┐
                              │    Failure Detected    │
                              └───────────┬────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
          ┌───────────────────────────┐       ┌───────────────────────────┐
          │  Infrastructure / Network │       │     Input / User / HW     │
          │         Failures          │       │          Failures         │
          └─────────────┬─────────────┘       └─────────────┬─────────────┘
                        │                                   │
       ┌────────────────┼────────────────┐ ┌────────────────┼────────────────┐
       ▼                ▼                ▼ ▼                ▼                ▼
  [ TIMEOUT ]    [ NETWORK_FAIL ]  [ RATE_LIMIT ] [ DEVICE_FAIL ] [ GIBBERISH ]  [ URL_ONLY ]
```

### Taxonomy Categories

| Category | Trigger Cause | Retryable? | Fallback / Recovery UX |
|---|---|---|---|
| `USER_INPUT_FAILURE` | Gibberish, low-entropy spam, URL without claim | **No** | Prompt user: *"No factual claim detected"* or *"What claim from this link should we check?"* |
| `DEVICE_FAILURE` | Bluetooth/headset disconnects during recording | **Yes (1x)** | Graceful capture of partial audio + *"Your audio device changed. [ Retry recording ] [ Type instead ]"* |
| `PERMISSION_FAILURE` | Microphone permission blocked in browser | **No** | In-place text input reveal + *"Microphone access required. Type question directly."* |
| `CLIENT_FAILURE` | Audio playback blocked by browser autoplay policy | **Yes** | User-gesture audio unlock or inline *"▶ Listen to Spoken Verdict"* |
| `TIMEOUT` | Cloud API or backend cold start exceeds budget | **Yes (Bounded)** | Automatic proxy/edge rotation + *"Taking longer than usual [ Retry ] [ Report ]"* |
| `PROVIDER_FAILURE` | Single Groq or ElevenLabs API key error | **Yes (Rotate)** | Instant zero-latency rotation across the 5-key pool |
| `SEARCH_FAILURE` | Primary retrieval connection dropped | **Yes (Bounded)** | Fallback to verified offline institutional archive catalog |
| `AUDIO_FAILURE` | MediaRecorder codec or audio buffer corrupt | **Yes** | Automatic fallback to native browser Web Speech API (`SpeechSynthesis`) |
| `RATE_LIMIT` | Request volume threshold reached | **Yes (Backoff)** | Exponential backoff + calm user notice: *"High request volume. Please wait a moment."* |

---

## 2. Bounded Retry Engine & Idempotency Cache

### Retry Policy Configuration
- **Max Retry Budget**: 3 attempts max.
- **Backoff Algorithm**: Bounded exponential backoff with full randomized jitter ($Delay = \min(MaxDelay, BaseDelay \times 2^{attempt-1}) + Jitter$).
- **Non-Retryable Errors**: HTTP 400, 401, 403, Schema Validation Violations, and Low-Entropy Gibberish are **never** retried to conserve tokens and prevent retry storms.

### Request Idempotency
- Incoming queries are hashed by `(targetLanguage, normalizedClaimText)`.
- If an exact identical query is repeated within a 10-minute window, the verified verdict and synthesized audio are returned immediately from the in-memory idempotency cache without consuming LLM, search, or TTS quota.

---

## 3. Hardware & Audio Resilience Matrix

### 1. Rapid Button Mashing (Double-Tap Lock)
- **Problem**: Accidental double-click spawns duplicate `MediaRecorder` instances and 0-byte corrupt submissions.
- **Solution**: 300ms hardware debounce state lock on the microphone trigger.

### 2. Audio Device Swapping Mid-Recording
- **Problem**: Bluetooth earbuds disconnect mid-sentence.
- **Solution**: `MediaStreamTrack.onended` listener safely captures available audio or transitions state to `ErrorRecoveryCard` with `[ Retry recording ]` and `[ Type instead ]`.

### 3. Mobile Backgrounding
- **Problem**: Mobile OS pauses audio when user switches apps.
- **Solution**: `document.visibilitychange` listener preserves conversation context and provides a clear *"Session Resumed"* state on foreground return.

---

## 4. Dispute & Feedback Governance

Every assistant message and verdict dossier provides a 1-tap **`[ 🚩 Report / Suggest Correction ]`** trigger.
- **Sanitized Payload**: Logs `requestId`, `verdict`, `claimSnippet`, and user note.
- **Spam Protection**: Client-side rate limiting prevents report flood (max 3 reports per 2 minutes).
- **Zero Leakage**: Never includes API keys, tokens, or audio streams in feedback submissions.
