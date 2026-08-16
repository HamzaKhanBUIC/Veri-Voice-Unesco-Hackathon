# VeriVoice — Privacy Policy & Data Architecture
**Privacy-by-Design Governance Document**
*Version: 1.0.0 | Date: August 16, 2026*

---

## 1. Executive Privacy Principles

VeriVoice operates under a strict **Privacy-by-Design** architecture. In contrast to surveillance-heavy social media applications, VeriVoice treats user verification inquiries and voice telemetry as ephemeral events with **zero permanent retention of biometric audio data**.

```
┌────────────────────────────────────────────────────────────────────────┐
│ VERIVOICE PRIVACY GUARANTEES                                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Zero Voice Retention: Audio buffers deleted within seconds of ASR.  │
│ 2. Zero Ad Tracking: Zero marketing pixels, cookies, or fingerprinters.│
│ 3. 5-Minute In-Memory TTL: Conversation sessions auto-purged quickly.  │
│ 4. Transparent Processors: Explicit accounting of all cloud providers. │
│ 5. Local Storage Minimization: Only technical language/settings stored.│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. What Information Users Provide & How It Is Processed

### A. Voice Audio (Microphone Telemetry)
* **What is Collected**: 16kHz audio stream chunk (WebM/Opus or OGG) up to 30 seconds.
* **Why**: To convert user speech into text using Speech-to-Text (ASR) engines.
* **Storage Duration**: **0 seconds permanent storage.** Ephemeral file written in volatile `/tmp` directory is unlinked inside a `finally {}` execution block immediately following transcription.
* **Biometric Profiling**: VeriVoice does **not** generate voiceprints, voice biometrics, or pitch profiles from microphone audio.

### B. Claim Text & Research Inquiries
* **What is Collected**: Transcript query or text typed into the Research Chat.
* **Why**: To search authoritative knowledge bases (WHO, NASA, IPCC, PMD, Kemenkes) and ground LLM reasoning in verified facts.
* **Storage Duration**: Kept in volatile in-memory session map for a maximum of 5 minutes (`SESSION_TTL_MS = 300,000`) for follow-up pronoun resolution.

### C. Technical Session Identifiers
* **What is Collected**: Randomized in-memory identifier (`sess_...`).
* **Why**: To maintain conversational turn counts (capped at 10 turns max) and reuse retrieved evidence across turns.
* **Storage Duration**: Automatically garbage-collected after 5 minutes of inactivity.

---

## 3. Third-Party Cloud Data Processors

| Provider | Purpose | Data Received | Retention & Encryption |
|---|---|---|---|
| **Groq LPU Cloud** | LLaMA 3.3 70B Reasoning & Whisper Large v3 ASR | Claim text and audio segment | Encrypted in transit (TLS 1.3); zero retention enterprise inference |
| **ElevenLabs** | Studio Neural Speech Synthesis (Sarah Voice) | Clean explanation string (max 250 chars) | Encrypted in transit (TLS 1.3); ephemeral TTS generation |
| **Speechmatics** | Backup Multilingual Speech Recognition | Audio buffer stream | Real-time stream processing |
| **Vercel** | Frontend Edge CDN Delivery | Static asset requests | Standard ephemeral edge server access logs |
| **Render** | Backend Express API Hosting | Encrypted HTTPS API payloads | Standard ephemeral container logs |

---

## 4. Cookies & Client Storage Inventory

VeriVoice **does not use cookies**. Browser storage is restricted exclusively to user experience preferences in `localStorage`:

| Key | Purpose | Expiry | Sensitive? |
|---|---|---|:---:|
| `verivoice_lang` | Remembers selected UI language (`en`, `ur`, `es`, `id`) | Persistent until cleared | No |
| `verivoice_user_settings` | Remembers audio autoplay and voice speed preferences | Persistent until cleared | No |
| `verivoice_privacy_ack` | Records dismissal of the first-visit privacy notice | Persistent until cleared | No |

---

## 5. Microphone Permission & Hardware Release

1. **No Automatic Prompts**: Microphone access is **never** requested on page mount or navigation.
2. **Explicit User Initiation**: Permission is requested only when the user deliberately clicks the Acoustic Core or microphone button.
3. **Immediate Hardware Release**: Every audio track is stopped via `track.stop()` as soon as recording finishes, immediately releasing the hardware microphone indicator.
4. **Text Fallback**: If microphone permission is denied, the user can use the full verification and research suite via standard text input.

---

## 6. Disclaimer

*This privacy policy describes how the current VeriVoice prototype handles data. It is provided for transparency and open-source evaluation and does not constitute formal legal counsel.*
