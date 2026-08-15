# VeriVoice Voice Architecture & Speech Pipeline Research

**Document Version:** 1.0.0  
**Status:** Voice Engineering Evaluation & Benchmarking  
**Infrastructure Target:** Render Free Tier (512MB RAM, shared CPU) + Modern Web Browsers  

---

## 1. Executive Summary & Problem Statement

To deliver an instant, natural conversational voice experience in **VeriVoice Talk**, the voice pipeline must balance three competing constraints:
1. **Zero Cost / Open-Source / Free-Tier Friendly:** No paid enterprise API dependencies or unsustainable billing.
2. **Strict Multi-lingual Fidelity:** Crystal-clear Urdu (complex phonetics & Naskh script), Spanish, Indonesian, and English.
3. **Ultra-Low Latency:** Target total round-trip voice latency under 2.5 seconds on commodity hardware and standard internet connections.

---

## 2. Comprehensive Technology Evaluation

### 2.1 Speech-to-Text (ASR) Comparison

| Engine | Deployment Mode | Urdu Quality | Latency | RAM / CPU Footprint | Cost / Limits | Verdict / Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Groq Cloud Whisper (`whisper-large-v3-turbo`)** | Server Cloud API | ⭐⭐⭐⭐⭐ Exceptional (state-of-the-art Urdu & multilingual) | **200–450 ms** | Zero server RAM (hosted on Groq LPUs) | Free tier: 20 req/min, 2000 req/day | **RANK 1 (PRIMARY RECOMMENDED)** — Fastest ASR available; zero server load. |
| **Speechmatics Batch ASR v2** | Server Cloud API | ⭐⭐⭐⭐ Very Good (robust in noise) | 2,000–4,000 ms (job polling) | Zero server RAM | Free tier: 4 hours/month | **RANK 2 (SECONDARY FALLBACK)** — Reliable fallback for accented audio. |
| **Browser Web Speech API (`webkitSpeechRecognition`)** | Client In-Browser | ⭐⭐ Poor in Urdu; Good in English/Spanish | 100–300 ms | 0 MB (uses OS speech engine) | Free (Built-in) | **REJECTED AS PRIMARY** — Fragmented browser support (no Firefox), completely unreliable Urdu recognition. |
| **Transformers.js (In-Browser Whisper Small/Base)** | Client WebAssembly / WebGPU | ⭐⭐⭐ Moderate in Urdu | 3,000–8,000 ms on mobile | 150MB–400MB browser RAM | Free / Local | **REJECTED FOR DEMO** — 200MB model download freezes mobile browsers; high battery drain. |

---

### 2.2 Text-to-Speech (TTS) Comparison

| TTS Engine | Runtime & Deployment | Model Size | Urdu Quality | Multilingual (ES, ID, EN) | Latency | Server Footprint | Licensing | Rank & Suitability |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Microsoft Edge Neural TTS (`edge-tts` CLI / HTTP)** | Node.js Server / Render | 0 MB (Cloud-hosted Microsoft Cognitive Voices) | ⭐⭐⭐⭐⭐ Broadcast-grade natural human voice (`ur-PK-UzmaNeural`, `ur-PK-AsadNeural`) | ⭐⭐⭐⭐⭐ Perfect native voices (`es-ES-ElviraNeural`, `id-ID-GadisNeural`, `en-US-AvaNeural`) | **400–800 ms** (fast streaming) | < 15MB RAM | Open free endpoint (MIT wrapper) | **RANK 1 (TOP RECOMMENDED)** — Free, zero local RAM, best Urdu prosody in existence. |
| **Sherpa-ONNX / Piper TTS (Small ~25–50MB ONNX model)** | Server CPU or Client WebAssembly | ~25MB–60MB | ⭐⭐⭐ Robotic in Urdu (limited Urdu phoneme datasets) | ⭐⭐⭐ Good English/Spanish, Weak Indonesian | 600–1,200 ms (CPU) | 80MB RAM per worker | MIT / Apache 2.0 | **RANK 2 (LOCAL FALLBACK)** — Useful for offline edge, but Urdu voice timbre is significantly less natural. |
| **Pocket TTS / MeloTTS** | Python / Node.js Server | ~80MB–180MB | ⭐⭐ Very limited Urdu support | ⭐⭐⭐⭐ Strong EN, ES, FR, ZH | 1,000–2,500 ms (CPU) | 350MB RAM (Risks Render 512MB limit OOM) | MIT | **REJECTED FOR PRODUCTION** — Excessive RAM consumption on Render free tier; poor Urdu phonetics. |
| **Browser `window.speechSynthesis`** | Client In-Browser Native | 0 MB | ⭐ Unusable in Urdu (most OS lack Urdu neural TTS) | ⭐⭐⭐ OS-dependent | 50 ms | 0 MB | Native API | **REJECTED AS PRIMARY** — Fails on 90% of Android/Windows devices for Urdu script. |
| **Google Translate Web TTS (`translate.google.com/translate_tts`)** | HTTP Web Stream Fallback | 0 MB | ⭐⭐⭐ Acceptable robotic tone | ⭐⭐⭐ Basic coverage | 300–600 ms | 0 MB | Public fallback | **RANK 3 (EMERGENCY FALLBACK)** — Already implemented in `EdgeTTSProvider.js` as fallback. |

---

## 3. Recommended Voice Architecture Pipeline

```
[ Browser Client ]
  │
  ├─ 1. MediaRecorder API captures 16kHz mono audio (.webm / .ogg)
  │    (Optional: Web Audio AnalyserNode displays real-time live wave visualization)
  │
  ├─ 2. Client sends lightweight Base64 / FormData to Backend
  │
[ Render Backend ]
  │
  ├─ 3. Groq Whisper API transcribes audio in ~350ms (Auto-detects language)
  │
  ├─ 4. Hybrid Retrieval + Llama 3.3 70B grounds verification in ~700ms
  │
  ├─ 5. Edge Neural TTS synthesizes detected-language MP3 in ~500ms
  │    (Saves to backend/tmp/output_<id>.mp3)
  │
[ Response Delivery ]
  │
  └─ 6. Returns JSON payload + audioUrl
       (HTML5 Audio / Web Audio API plays response with animated waveform)
```

### End-to-End Latency Profile:
* **Audio Capture & Upload:** ~150 ms
* **Groq Whisper ASR:** ~350 ms
* **Retrieval & Evidence Grounding:** ~400 ms
* **Groq Llama 3.3 70B Verification:** ~650 ms
* **Edge Neural TTS Synthesis:** ~550 ms
* **Network Payload Transfer:** ~100 ms
* **TOTAL LATENCY:** **~2.20 seconds** (Well within the golden conversational benchmark for an evidence-grounded verification system).

---

## 4. Audio Streaming vs. Chunked Audio Response

* **Chunked MP3 File (Current Implementation):** Complete MP3 is written in ~500ms and returned via static URL.
  * *Advantage:* Simple, 100% reliable across mobile Safari, Chrome, and Firefox; zero complex WebSocket state synchronization.
  * *Verdict:* **Best for Hackathon Demo.**
* **HTTP Chunked Audio Streaming (`Transfer-Encoding: chunked`):** Stream TTS chunks as generated.
  * *Advantage:* Saves ~200ms of initial playback delay.
  * *Verdict:* Optional Stage 2 enhancement.

---

## 5. Conversation Limits for Free-Tier Longevity

To protect the Render instance (512MB RAM) and Groq Free Tier API quota (20 req/min, 2000 req/day):

| Metric | Recommended Limit | Rationale |
| :--- | :--- | :--- |
| **Max Audio Input Duration** | **30 seconds** | Ample for speaking any rumor or claim; prevents audio buffer overflow. |
| **Max Conversational Turns in Talk** | **6 turns per session** | Sufficient for Claim ➔ Verdict ➔ "Why?" ➔ Deep-dive ➔ Summary. |
| **Max Concurrent Audio Sessions** | **3 simultaneous tasks** | Enforced by `ConcurrencyLimiter.js` to eliminate server RAM spikes. |
| **User Rate Limit** | **5 requests / 60 seconds** | Enforced by `RateLimiter.js` per client IP. |
| **Global System Rate Limit** | **20 requests / 60 seconds** | Keeps traffic within Groq's 20 RPM free allowance. |
