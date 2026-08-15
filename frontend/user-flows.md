# VeriVoice Frontend User Flows & Interaction Architecture

**Document Version:** 1.0.0  
**Status:** UX Architecture  

---

## Flow 1: Landing → Talk → Voice Question → Verification → Spoken Response

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as Talk UI (Voice Orb)
  participant Client as Web Audio Recorder
  participant API as VeriVoice Backend
  participant TTS as Audio Player

  User->>UI: Clicks "Enter Talk" on Landing Page
  UI->>User: Displays Ambient Voice Room in IDLE state ("Tap to speak")
  User->>UI: Taps Voice Orb / Holds Mic
  UI->>Client: Request microphone stream (getUserMedia)
  Client->>UI: Visualizer pulses in LISTENING state (Real-time Audio Amplitude)
  User->>Client: Speaks: "پولیو ویکسین کے بارے میں بتائیں، کیا یہ محفوظ ہے؟"
  User->>UI: Releases Mic / Silence Detected (1.5s VAD)
  UI->>Client: Stops recording, extracts audio blob
  UI->>API: POST /api/verify (Base64 audio or FormData)
  UI->>User: State transitions to PROCESSING -> CHECKING_EVIDENCE (Orb color shifts)
  API->>API: Groq Whisper STT -> Hybrid Retrieval -> Llama 3.3 70B Grounding -> Edge TTS Synthesis
  API-->>UI: Returns JSON (verdict: TRUE, explanation, audioUrl, sources)
  UI->>TTS: Loads audioUrl into HTML5 Audio
  TTS->>User: Plays neural Urdu voice response ("عالمی ادارہ صحت کے مطابق پولیو ویکسین مکمل طور پر محفوظ ہے...")
  UI->>User: State transitions to RESPONDING; reveals Verdict Badge ("🟢 TRUE") & Key Source Card
```

* **User Action:** Taps the center orb and speaks a claim.
* **System State:** `IDLE` → `LISTENING` → `PROCESSING` → `CHECKING_EVIDENCE` → `RESPONDING` → `IDLE`.
* **UI Response:** Fluid orb animation responds to audio input; glowing aura matches evidence retrieval and verdict status.
* **Loading State:** Subtle step indicator: *"Transcribing voice..."* ➔ *"Checking WHO & authoritative evidence..."* ➔ *"Preparing spoken response..."*.
* **Success State:** Spoken audio begins auto-playing; high-contrast Verdict Badge (`TRUE`) and source attribution appear smoothly.
* **Error State:** If microphone permission is denied, gentle banner appears with permission instructions and fallback to text input.
* **Recovery Path:** "Tap to try speaking again" or one-click toggle to Chat mode.

---

## Flow 2: Landing → Chat → Text Claim → Evidence → Verdict

* **User Action:** User navigates to `/chat`, types a claim: *"Garlic cures COVID-19"*, clicks **Verify Claim** or presses Enter.
* **System State:** `INPUT_RECEIVED` → `RETRIEVING_EVIDENCE` → `GROUNDING_VERDICT` → `DISPLAY_RESULT`.
* **UI Response:** Input bar disables; a pending bubble appears with animated skeleton loaders for evidence cards.
* **Loading State:** Progress steps displayed:
  - 1. Searching health & scientific knowledge bases...
  - 2. Evaluating authority of 4 discovered sources...
  - 3. Verifying claim against strict evidence boundaries...
* **Success State:** Complete Verification Card appears containing:
  - Verdict Badge: `🔴 FALSE` (Red accent, strong typography)
  - Confidence Score: `High (0.95)`
  - Grounded Explanation: Clear debunking statement citing medical evidence.
  - Evidence List: Expandable cards with publication titles, snippets, and official outbound links (`who.int`, `cdc.gov`).
  - Listen Button: Embedded neural TTS player to hear the verdict aloud.
* **Error State:** Network error shows retry button in the failed message bubble.
* **Recovery Path:** Re-run verification button or edit original query inline.

---

## Flow 3: Chat → Follow-Up Question → Additional Evidence

* **User Action:** Following the previous COVID/Garlic verification, user types: *"What foods actually help the immune system?"*
* **System State:** `SESSION_CONTINUATION` → `INTENT_DETECTION (GENERAL_RESEARCH)` → `RETRIEVAL` → `SYNTHESIS`.
* **UI Response:** System automatically detects that this is a research inquiry rather than a binary claim verification.
* **Loading State:** *"Researching authoritative nutritional guidance..."*
* **Success State:**
  - Header: `🌐 GENERAL RESEARCH`
  - Explanatory synthesis with balanced dietary facts (Vitamin C, Zinc, balanced nutrition) grounded in retrieved sources.
  - No artificial `TRUE/FALSE` verdict badge is forced onto an open-ended question.
  - Citations to reputable institutional sources (`who.int`, `nih.gov`).
* **Recovery Path:** User can switch domain or ask further deep-dive questions in the ongoing thread.

---

## Flow 4: Talk → Claim → Verification → Ask "Why?"

* **User Action:**
  1. In Talk mode, user asks: *"Does drinking ice water cause pneumonia?"*
  2. VeriVoice answers: *"That claim is false. Cold water does not cause pneumonia."*
  3. User immediately taps to speak: *"Why? What is the actual cause?"*
* **System State:** Multi-turn conversational session context is attached to the backend request (`sessionHistory` with preceding claim and verdict).
* **UI Response:** Voice Orb glows in conversational continuation mode.
* **Loading State:** *"Analyzing follow-up question in context..."*
* **Success State:** VeriVoice speaks: *"Pneumonia is an infection caused by bacteria, viruses, or fungi, not cold temperatures or cold drinks. Cold water only causes temporary throat irritation."*
* **Recovery Path:** Full session transcript is accessible via an optional slide-out "Session Log" drawer.

---

## Flow 5: Multilingual Voice Interaction (Urdu, Spanish, Indonesian, English)

* **User Action:**
  - User in Spain speaks Spanish: *"¿Es verdad que las vacunas causan autismo?"*
  - User in Indonesia speaks Indonesian: *"Apakah minum air es menyebabkan radang paru-paru?"*
  - User in Pakistan speaks Roman Urdu: *"Kya subah lehsan khanay se sugar theek hoti hai?"*
* **System State:**
  - Groq Whisper transcribes audio in native language.
  - `LanguageDetector.js` detects script and keywords, preserving `originalText` and setting `responseLanguage`.
  - Verification Engine grounds explanation in the matching native language.
  - `EdgeTTSProvider` dynamically selects the corresponding native neural voice (`es-ES-ElviraNeural`, `id-ID-GadisNeural`, `ur-PK-UzmaNeural`, `en-US-AvaNeural`).
* **UI Response:** UI typography and layout dynamically adapt (RTL for Urdu/Arabic; LTR for Spanish/Indonesian/English; appropriate font stacks: Noto Naskh Arabic for Urdu, Inter for Latin scripts).
* **Success State:** User hears fluent native neural speech in their exact language without translation distortions.

---

## Flow 6: General Research Question (Non-Verdict Mode)

* **User Action:** User asks: *"How do mRNA vaccines work?"* (or clicks `/science` shortcut).
* **System State:** `IntentDetector` flags `GENERAL_RESEARCH`. Retrieval queries scientific repositories and verified web sources.
* **UI Response:** Interface displays a dedicated **Research Card** with clean typography, clear section headers, and inline scientific citations.
* **Success State:**
  - Verdict is set to `🔬 RESEARCH RESPONSE`.
  - Explanation breaks down mRNA function, spike protein production, and immune memory.
  - Authoritative sources displayed: `Nature`, `WHO`, `CDC`.

---

## Flow 7: Verification Failure / Retrieval Failure / Search Infrastructure Timeout

* **Scenarios:**
  1. **No Evidence Found (Zero-Evidence Safe Bounding):** User asks a bizarre or unindexed rumor.
  2. **Infrastructure Search Timeout:** Web search provider times out after 10s.
  3. **Backend Service Down / Cold Start:** Render instance waking up.
* **UI Response & Honest Uncertainty:**
  - **Scenario 1:** Verdict displays `⚪ UNCERTAIN (Insufficient Evidence)`. Explanation states: *"Available reliable evidence from health authorities is insufficient to verify this claim. We avoid guessing."*
  - **Scenario 2:** Clear diagnostic notice: *"⚠️ Live web evidence search experienced a temporary network timeout. The system refused to guess from memory."* with a prominent **Retry Search** button.
  - **Scenario 3:** Friendly cold-start banner: *"⚡ Waking up the VeriVoice verification engine (Render Free Tier cold-start ~30s). Please hold on..."*

---

## Flow 8: Mobile Experience (Responsive, Touch-First, Micro-Interactions)

* **Target Constraints:** 360px–430px viewports (smartphones common in target communities).
* **Interaction Design:**
  - **Bottom-Anchored Modality Bar:** Thumb-friendly floating mic button with haptic feedback on touch start/stop.
  - **Single-Handed Talk Navigation:** Full-screen ambient canvas where tapping anywhere triggers listening.
  - **Collapsible Evidence Accordions:** Dense evidence cards default to a single-line summary with "View Sources & Grounding (3)" expansion toggle to prevent screen clutter.
  - **Native Audio Player Integration:** Lockscreen / background playback support via HTML5 Media Session API.
