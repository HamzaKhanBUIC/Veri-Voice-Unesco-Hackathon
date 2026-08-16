# VeriVoice Verified Project Facts & Architectural Baseline

Every statement in this document is directly verifiable by inspecting source code, test execution logs, or cloud deployment endpoints.

---

## 1. Verified Live Deployment Endpoints
- **Primary Web Application**: `https://verivoice-ten.vercel.app` (Hosted on Vercel Production Edge)
- **Secondary Web Alias**: `https://frontend-nu-six-72.vercel.app`
- **Cloud Backend API**: `https://verivoice-unesco-hackathon.onrender.com` (Render Web Service with `/health`)
- **Open-Source Repository**: `https://github.com/HamzaKhanBUIC/Veri-Voice-Unesco-Hackathon`
- **Discord Bot**: Registered Application ID `1537205576809840702` (Operating on Render 24/7 gateway)

---

## 2. Verified Technical Stack & Models
- **Frontend Architecture**: React 18, TypeScript, Vite, Vanilla CSS + Tailwind utility tokens, Canvas 2D 3D Evidence Constellation.
- **Backend Architecture**: Node.js (ESM/CommonJS), Express.js, Zod Schema Validation, In-memory Idempotency Cache.
- **LLM Reasoning Provider**: Groq Cloud LPU (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) with 5-key rotation pool.
- **Speech Recognition (ASR)**: Groq Whisper Large v3 (`whisper-large-v3-turbo`) with Speechmatics failover.
- **Speech Synthesis (TTS)**: ElevenLabs Multilingual v2 (`EXAVITQu4vr4xnSDxMaL` / Sarah) with 5-key rotation pool + Microsoft Edge-TTS (`ur-PK-UzmaNeural`, `es-ES-ElviraNeural`, `id-ID-GadisNeural`) + Browser Web SpeechSynthesis.
- **Testing Framework**: Jest with 22 suites and 180 passing automated unit/integration/chaos tests.

---

## 3. Verified Multilingual Capabilities
- **Urdu (اردو)**: Authentic Nastaliq script detection, bidirectional Arabic script rendering, and Urdu neural voice synthesis (`ur-PK-UzmaNeural`).
- **Spanish (Español)**: Accurate Latin accent detection, Spanish Socratic reasoning, and Spanish neural voice synthesis (`es-ES-ElviraNeural`).
- **Indonesian (Bahasa Indonesia)**: Indonesian vocabulary detection, Indonesian institutional grounding (Kemenkes, BMKG, Kominfo), and Indonesian neural voice (`id-ID-GadisNeural`).
- **English (EN)**: Global lingua franca mode with WHO, NASA, IPCC, and CDC citations.

---

## 4. Verified Knowledge & Domain Classification
`DomainDetector.js` classifies inquiries into **15 deterministic domains**:
1. `HEALTH`
2. `EARTH_SPACE`
3. `WEATHER_CLIMATE`
4. `GEOLOGY`
5. `DISASTER`
6. `TECHNOLOGY`
7. `ECONOMICS`
8. `LAW_POLICY`
9. `SCIENCE`
10. `EDUCATION`
11. `MEDIA_INFORMATION_LITERACY`
12. `AI_DISINFORMATION`
13. `BIODIVERSITY`
14. `HISTORY`
15. `GENERAL`

---

## 5. Verified Security & Privacy Guarantees
- **Prompt Injection Defense**: Untrusted user inputs are strictly isolated within `<USER_CLAIM>` XML tags.
- **Citation Hallucination Elimination**: `CitationValidator.js` rejects any source URL not present in the retrieved institutional evidence set.
- **Dangerous Protocol Rejection**: Rejects `javascript:`, `data:`, `file:`, `vbscript:` URI schemes.
- **Zero Audio Retention**: Voice audio streams are processed in-memory or in ephemeral temp storage and unlinked immediately after verification.
- **Zero API Key Leakage**: 100% of API keys are `.gitignore` protected and injected via Vercel Edge / Render environment variables.
