# VeriVoice — Language Support & Provider Capability Matrix

This document provides a realistic, verified capability matrix across supported, partially supported, and unvalidated languages in VeriVoice.

> [!IMPORTANT]
> A language is **NOT** labeled `SUPPORTED` simply because an LLM (such as Groq Llama 3.3 70B) can read or generate text in that language. Every layer—Voice STT, Text Normalization, Evidence Retrieval, Citation Generation, LLM Reasoning, and Spoken Audio TTS—is evaluated independently.

---

## 1. Multi-Layer Language Evaluation Matrix

| Language | ISO Code | Voice STT | LLM Reasoning | Retrieval / Web Search | Citation Preservation | Spoken TTS | Overall Status | Known Limitations & Notes |
|---|---|---|---|---|---|---|---|---|
| **Urdu** | `ur` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Local KB + Google Search | ✅ Validated | ✅ Edge Neural (`ur-PK-UzmaNeural`) | **SUPPORTED** | Primary project target language. Full end-to-end voice loop validated. |
| **English** | `en` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Local KB + Google Search | ✅ Validated | ✅ Edge Neural (`en-US-AvaNeural`) | **SUPPORTED** | Primary source research language. Full end-to-end voice loop validated. |
| **Roman Urdu** | `ur-Roman` | ⚠️ Whisper (partial) | ✅ Groq Llama 3.3 70B | ✅ Keyword Normalizer | ✅ Validated | ⚠️ Edge Neural (uses `ur-PK-UzmaNeural` fallback) | **PARTIALLY_SUPPORTED** | Transcriptions and queries in Roman script normalize to Urdu keywords. TTS speaks via Urdu voice. |
| **Spanish** | `es` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`es-ES-ElviraNeural`) | **SUPPORTED** | High accuracy. PAHO guidelines available in Spanish source material. |
| **Indonesian** | `id` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`id-ID-GadisNeural`) | **SUPPORTED** | BNPB disaster guidelines available. Full end-to-end support validated. |
| **Arabic** | `ar` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`ar-SA-ZariyahNeural`) | **SUPPORTED** | Strong LLM and TTS support. |
| **Hindi** | `hi` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`hi-IN-SwaraNeural`) | **SUPPORTED** | High accuracy in STT and TTS synthesis. |
| **French** | `fr` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`fr-FR-DeniseNeural`) | **SUPPORTED** | Validated across speech, search, and neural TTS. |
| **German** | `de` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`de-DE-KatjaNeural`) | **SUPPORTED** | Validated across speech, search, and neural TTS. |
| **Portuguese** | `pt` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`pt-BR-FranciscaNeural`) | **SUPPORTED** | Validated across speech, search, and neural TTS. |
| **Bengali** | `bn` | ⚠️ Whisper (partial) | ✅ Groq Llama 3.3 70B | ⚠️ Web Search | ✅ Validated | ⚠️ Text Fallback | **PARTIALLY_SUPPORTED** | High LLM understanding; TTS falls back to text response if neural voice fails. |
| **Turkish** | `tr` | ✅ Whisper / Speechmatics | ✅ Groq Llama 3.3 70B | ✅ Live Web Search | ✅ Validated | ✅ Edge Neural (`tr-TR-EmelNeural`) | **SUPPORTED** | Validated across speech, search, and neural TTS. |

---

## 2. Status Category Definitions

- **SUPPORTED**: All 6 pipeline layers (STT → Language Detection → Retrieval → LLM Verification → Citation Integrity → Neural TTS Voice Output) are operational and validated.
- **PARTIALLY_SUPPORTED**: Core verification and citation layers function in text mode, but speech input or neural TTS voice output uses a fallback mechanism.
- **NOT_VALIDATED**: Languages not yet tested against STT or Neural TTS benchmarks. Default fallback to text response with explicit safety notice.

---

## 3. Language Preservation Rule
When a user submits a claim in any supported language:
1. `originalText`: Unmodified transcript in user's spoken language.
2. `detectedLanguage`: ISO language code (e.g., `ur`, `es`, `en`, `id`).
3. `normalizedText`: Language-normalized text for keyword search.
4. `verificationLanguage`: Internal search/reasoning representation.
5. `responseLanguage`: Language of final written & spoken response (matches user's original language).
