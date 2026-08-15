# VeriVoice Frontend Performance & Latency Optimization Plan

**Document Version:** 1.0.0  
**Status:** Performance Engineering Strategy  

---

## 1. Latency Budgets & Target Metrics

| Phase | Metric | Budget Target | Optimization Strategy |
| :--- | :--- | :--- | :--- |
| **Initial Page Load** | First Contentful Paint (FCP) | `< 800 ms` | Static HTML/CSS generation, preconnected Google Fonts (`Noto Naskh Arabic`, `Inter`), zero heavy client JS bundles. |
| **Voice Capture** | MediaRecorder Finalization | `< 50 ms` | 16kHz Mono Opus encoding (lightweight ~12kbps audio payload). |
| **Network Transfer** | Audio Upload | `< 120 ms` | Compressed payload via FormData or optimized Base64. |
| **ASR (STT)** | Audio-to-Text | `< 400 ms` | Groq Whisper Large v3 Turbo (LPU accelerated inference). |
| **Retrieval & Grounding** | Knowledge & Web Search | `< 400 ms` | Parallel targeted queries, in-memory domain classification. |
| **LLM Verification** | Reasoning & JSON Output | `< 700 ms` | Groq Llama 3.3 70B Versatile (`temperature: 0.0`, `max_tokens: 500`). |
| **TTS Synthesis** | Spoken Audio Generation | `< 550 ms` | Edge Neural TTS direct stream to temporary disk cache. |
| **Audio Playback** | Time-to-First-Sound (TTFS) | `< 100 ms` | Native HTML5 Audio auto-play upon URL reception. |
| **TOTAL TURNAROUND** | **Mic Release to Spoken Output** | **< 2.40 seconds** | Optimized parallel pipeline with zero intermediate serial bottlenecks. |

---

## 2. Key Optimization Strategies

### 2.1 Render Free-Tier Cold Start Mitigation
* **The Problem:** Free instances spin down after 15 minutes of inactivity; wake-up takes 25–45 seconds.
* **Mitigation Protocol:**
  1. **Background Keep-Alive Ping:** Client triggers a silent `GET /health` ping immediately on landing page load.
  2. **Intelligent UI Loader:** If `/health` response exceeds 2 seconds, UI displays a status banner: *"⚡ Waking up verification engine... Ready in a few moments."* with a subtle pulse, preventing user confusion.

### 2.2 Client-Side Audio Optimization
* **Encoding Settings:** Capture audio at `16,000 Hz` sample rate, `1 channel` (mono), `16 kbps` bitrate. A 5-second voice note occupies only **~10 KB** of data.
* **Lightweight Visualizer:** Audio amplitude visualizer runs via `requestAnimationFrame` reading from `AnalyserNode.getByteFrequencyData()`, consuming `< 1%` CPU on mobile devices.

### 2.3 Typography & Asset Delivery
* Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`.
* `font-display: swap` prevents layout shifts (CLS = 0) and invisible text flash during font loading.
* Zero heavy icon libraries: Use inline SVGs for verified badges, audio waves, and control buttons.

### 2.4 Audio Caching & Memory Management
* Ephemeral audio blobs are cleaned up via `URL.revokeObjectURL()` immediately when playback ends or when the user begins a new turn to prevent memory leaks in long sessions.
