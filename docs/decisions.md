# VeriVoice Architecture Decision Records (ADR)

## ADR-001: Initial Focus on Urdu
- **Decision**: Prototype will initially target Urdu (`ur`).
- **Rationale**: Community impact focus, high prevalence of voice-based WhatsApp rumors in Pakistan.
- **Status**: Approved.

## ADR-002: Keyword Retrieval over Vector DB
- **Decision**: Use structured JSON (`knowledge/claims.json`) with keyword matching for 15-20 claims.
- **Rationale**: Minimal latency, zero vector DB overhead, predictable & transparent matching for hackathon scale.
- **Status**: Approved.

## ADR-003: Isolated Core Verification Pipeline
- **Decision**: Core pipeline (`VOICE -> STT -> CLAIM -> RETRIEVAL -> VERDICT -> TTS -> VOICE`) built as standalone service.
- **Rationale**: Allows 100% automated testing without live WhatsApp API credentials or network tunneling.
- **Status**: Approved.

## ADR-004: Decoupled SpeechProvider & TTSProvider Interfaces
- **Decision**: Abstract STT (`SpeechProvider`) and TTS (`TTSProvider`) behind interface boundaries.
- **Rationale**: Allows switching seamlessly between local mocks, Whisper, Speechmatics, and Edge TTS without rewriting pipeline orchestration code.
- **Status**: Approved (Milestone 1).

## ADR-005: Edge TTS for Urdu Speech Synthesis
- **Decision**: Use Microsoft Edge TTS (`ur-PK-UzmaNeural` voice via `edge-tts` python package).
- **Rationale**: Zero cost, natural high-quality Urdu neural voice output, fast processing (~4s latency).
- **Status**: Approved (Milestone 1).

## ADR-006: Deterministic Token-Based Keyword Scoring
- **Decision**: Implement a transparent, rule-based keyword matching algorithm (Exact Keyword Match +10, Claim Match +5, Explanation Match +2).
- **Rationale**: Guarantees 100% deterministic ranking, zero hallucinated evidence, zero vector database complexity.
- **Status**: Approved (Milestone 2).

## ADR-007: Isolation of Test Fixtures from Production Dataset
- **Decision**: Keep production dataset `knowledge/claims.json` empty until authoritative claims are provided. Use separate `test-fixtures/claims.test-fixture.json` labeled `TEST FIXTURE — NOT MEDICAL EVIDENCE` for testing.
- **Rationale**: Prevents accidental exposure of fake/synthetic health claims to production users.
- **Status**: Approved (Milestone 2).

## ADR-008: Deterministic Pre-Check Skipping LLM Execution
- **Decision**: If retrieval returns 0 candidate matches, skip LLM execution entirely and return `UNCERTAIN` (`reason: NO_EVIDENCE`).
- **Rationale**: When no evidence is retrieved, the verification engine does not call the LLM and returns UNCERTAIN, eliminating parametric memory hallucination.
- **Status**: Approved (Milestone 3).

## ADR-009: Strict Evidence-ID Allow-List Validation
- **Decision**: Validate that every evidence ID returned by the model exists in the retrieved candidate matches; trigger `UNCERTAIN` fallback if un-allowlisted.
- **Rationale**: Strictly prevents the LLM from inventing or referencing unsupplied evidence IDs or citations.
- **Status**: Approved (Milestone 3).

## ADR-010: Delimited Prompt Architecture for Injection Resistance
- **Decision**: Wrap user text inside `<USER_CLAIM>` and evidence inside `<EVIDENCE>` tags.
- **Rationale**: Treats untrusted content strictly as data, preventing prompt injection command overrides.
- **Status**: Approved (Milestone 3).

## ADR-011: Decoupled WhatsApp Interface Wrapper
- **Decision**: Build WhatsApp layer strictly as an interface adapter around `StandalonePipeline`.
- **Rationale**: Prevents duplicating STT, retrieval, verification, or TTS logic inside webhooks or controllers.
- **Status**: Approved (Milestone 4).

## ADR-012: In-Memory Message Deduplication Store
- **Decision**: Implement a lightweight LRU/TTL Map (`WhatsAppIdempotency.js`) to deduplicate incoming Meta webhook message IDs.
- **Rationale**: Avoids processing duplicate retries from Meta Cloud API without introducing external database dependencies like Redis or MongoDB for the prototype.
- **Status**: Approved (Milestone 4).
