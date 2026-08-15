# VeriVoice Frontend Product Architecture

**Document Version:** 1.0.0  
**Status:** Architectural Discovery & UX Blueprint  

---

## 1. Product Identity & Differentiators

VeriVoice is **NOT a generic AI chatbot**. Its core value proposition is:
> **"Speak a claim. We check the evidence."**

### Core Pillars
1. **Evidence-Grounded Verification:** VeriVoice never relies on ungrounded model memory or generative hallucinations. If authoritative evidence cannot be retrieved, it honestly returns `UNCERTAIN`.
2. **Voice-First Interaction:** Audio in, neural speech out. Designed for natural human voice communication across languages and literacy levels.
3. **Multilingual Inclusivity:** True native support for Urdu (primary focus for infodemic mitigation in South Asia), Spanish, Indonesian, English, and extended language recognition.
4. **Source Authority Transparency:** Distinct visual hierarchy for `PRIMARY_AUTHORITY` (WHO, NASA, WMO, NDMA), `SECONDARY_AUTHORITY`, and `REPUTABLE_NEWS`.
5. **Dual Interface Paradigm:** Tailored modalities for different user needs:
   - **VeriVoice Talk:** Ambient, conversational voice room for dynamic verbal inquiry and follow-up.
   - **VeriVoice Chat:** Serious, high-density research and evidence inspection workspace.

---

## 2. Global System Topology

```
                              ┌─────────────────────────────────────────┐
                              │            VERIVOICE BACKEND            │
                              │     (Node.js / Express on Render)       │
                              │                                         │
                              │  • Groq Whisper / Speechmatics ASR     │
                              │  • LanguageDetector & DomainDetector    │
                              │  • Hybrid Retrieval + Source Filter     │
                              │  • Groq Llama 3.3 70B Grounded LLM     │
                              │  • CitationValidator & Evidence Eval    │
                              │  • Edge Neural TTS Engine               │
                              └────────────────────┬────────────────────┘
                                                   │
                       ┌───────────────────────────┴───────────────────────────┐
                       │                                                       │
         ┌─────────────▼─────────────┐                           ┌─────────────▼─────────────┐
         │      DISCORD BOT          │                           │      WEB FRONTEND         │
         │   (Independent Client)    │                           │    (New Web Experience)   │
         │                           │                           │                           │
         │ • Voice attachments       │                           │ ┌───────────────────────┐ │
         │ • Slash commands          │                           │ │    VERIVOICE TALK     │ │
         │ • Mentions & replies      │                           │ │ (Ambient Voice Room)  │ │
         │                           │                           │ └───────────────────────┘ │
         │                           │                           │ ┌───────────────────────┐ │
         │                           │                           │ │    VERIVOICE CHAT     │ │
         │                           │                           │ │  (Evidence Workspace) │ │
         │                           │                           │ └───────────────────────┘ │
         └───────────────────────────┘                           └───────────────────────────┘
```

---

## 3. Web Client Experiences

### 3.1 Experience A: VeriVoice Talk (The Ambient Voice Room)
* **Target Scenario:** Spoken rumor checking, rapid audio verification, audio-first conversations, hands-free operation.
* **Mental Model:** A living voice interface. A serene, focused canvas with an organic, dynamic orb / sound-wave visualization that reflects state transitions.
* **Primary Interaction Loop:**
  1. User initiates session ("Tap or hold to speak" / "Start conversation").
  2. User speaks a rumor, claim, or curiosity: *"I heard drinking cold water causes pneumonia. Is that true?"*
  3. UI transitions from `LISTENING` → `PROCESSING` → `CHECKING_EVIDENCE`.
  4. Ambient audio feedback or gentle visual pulse informs user of progress.
  5. VeriVoice delivers a crisp spoken neural verdict: *"That claim is not supported by WHO or medical evidence. Cold water does not cause pneumonia."*
  6. The visual canvas reveals a minimal, high-impact Verdict Pill (`🔴 FALSE`) and a concise Spoken Card.
  7. The user can immediately ask a natural follow-up: *"Why? What actually causes it?"*
  8. Conversation maintains session context and verifies the follow-up without losing state.

#### Talk State Machine
```
[ IDLE ] ──(User Mic Click / Speak)──► [ LISTENING ]
                                              │
                                      (Silence / Stop)
                                              ▼
                                       [ PROCESSING ]
                                              │
                                     (Audio Transcribed)
                                              ▼
                                    [ CHECKING_EVIDENCE ]
                                              │
                                     (Evidence Verified)
                                              ▼
                                       [ RESPONDING ] (TTS Playback + Spoken Card)
                                              │
                                     (Playback Complete)
                                              ▼
                                       [ LISTENING ] or [ IDLE ]
```

---

### 3.2 Experience B: VeriVoice Chat (The Evidence Workspace)
* **Target Scenario:** Journalists, researchers, fact-checkers, students, and users requiring structured evidence inspection, source auditing, and deep dive verification.
* **Mental Model:** A high-precision research workbench (inspired by Linear, Perplexity, Apple Health, and institutional fact-check dashboards).
* **Key Capabilities:**
  * **Multimodal Input:** Text prompt, voice note recording, or audio file drag-and-drop.
  * **Explicit Mode Toggle:** `🔎 Claim Verification` (Strict True/False/Mixed/Uncertain verdict) vs. `🌐 General Research` (Evidence-synthesized exploratory answer).
  * **Domain Quick-Filters:** Filter queries into Health, Climate, Earth & Space, Disasters, Education.
  * **Evidence Drawer / Inspector:** Expandable source cards showing:
    * Primary Authority badge (`WHO`, `NASA`, `WMO`, `NDMA`)
    * Publication URL with domain trust score
    * Grounding snippets & matching keywords
    * Evidence Strength rating (`STRONG`, `SUFFICIENT`, `WEAK`, `NO_EVIDENCE`)
    * Independent source count
  * **Audio Synchronized Playback:** In-line wave-player allowing the user to hear the explanation in any detected language.
  * **Shareable Verification Record:** Generate a structured claim summary card to copy or share.

---

## 4. Frontend Component Hierarchy & Module Boundaries

```
frontend/
├── src/
│   ├── app/                    # Routing & Application Shell
│   │   ├── layout.tsx          # Global Shell, Font Providers, Theme Context
│   │   ├── page.tsx            # Hero Landing & Experience Switcher
│   │   ├── talk/page.tsx       # VeriVoice Talk (Ambient Voice Interface)
│   │   └── chat/page.tsx       # VeriVoice Chat (Evidence Workspace)
│   ├── components/
│   │   ├── voice/              # Audio Capture, Orb Visualizer, Waveforms, Speech Synthesis
│   │   │   ├── VoiceOrb.tsx
│   │   │   ├── AudioWaveform.tsx
│   │   │   ├── MicButton.tsx
│   │   │   └── VoiceSessionController.tsx
│   │   ├── evidence/           # Evidence Cards, Badges, Citations, Source Links
│   │   │   ├── VerdictBadge.tsx
│   │   │   ├── EvidenceStrengthMeter.tsx
│   │   │   ├── SourceAuthorityCard.tsx
│   │   │   ├── CitationList.tsx
│   │   │   └── GroundingInspector.tsx
│   │   ├── chat/               # Conversation Thread, Bubble Cards, Modality Bar
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ModalityInputBar.tsx
│   │   │   └── DomainFilterPills.tsx
│   │   └── common/             # UI Tokens, Tooltips, Modals, Language Dropdown
│   │       ├── Header.tsx
│   │       ├── LanguageSelector.tsx
│   │       ├── DiagnosticDrawer.tsx
│   │       └── Toast.tsx
│   ├── hooks/                  # Custom Web Audio, Speech, & API Hooks
│   │   ├── useVoiceRecorder.ts
│   │   ├── useAudioPlayer.ts
│   │   ├── useVerificationEngine.ts
│   │   └── useLanguage.ts
│   ├── lib/                    # API client, audio utilities, schema types
│   └── styles/                 # Design system tokens & typography
```
