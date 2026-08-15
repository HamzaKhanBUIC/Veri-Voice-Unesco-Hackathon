# VeriVoice Google Stitch Design Master Plan & Prompts

**Document Version:** 1.0.0  
**Status:** Stitch Prompting & Design Generation Specification  
**Tooling Target:** Google Stitch (UI Prompt Engine & Screen Synthesis)  

---

## 1. Design Direction & Global Style Rules

All Stitch prompts must adhere strictly to these global stylistic instructions:

* **Theme:** Refined Dark Mode (Obsidian slate `#090D16`, elevated zinc cards `#111726`, hairline borders `rgba(255, 255, 255, 0.08)`).
* **Typography:** Modern clean sans-serif (`Inter`) paired with authentic Arabic/Urdu typography (`Noto Naskh Arabic`) and crisp tabular figures (`Outfit`).
* **Aesthetics:** Apple Health / Linear / Perplexity-inspired evidence workspace. Clean, spacious, high information-density without clutter.
* **FORBIDDEN:** No generic purple gradient blobs, no floating cliché AI badges, no headline pill tags with pulsing dots, no neon mesh grids.

---

## 2. Stitch Screen Prompts (1 to 10)

### Prompt 1: Landing Page (Hero & Experience Switcher)
```text
A world-class, premium dark-mode web landing page for "VeriVoice" — an evidence-grounded multilingual voice verification platform for UNESCO infodemic mitigation.
Layout: Minimalist top navigation bar with VeriVoice logo (shield + soundwave mark), Language Switcher (Urdu, English, Spanish, Indonesian), and Status Pill (All Systems Operational).
Hero Section: Strong, high-contrast headline: "Speak a claim. We check the evidence." with subtle subtitle: "Voice-first rumor verification and authoritative research across 10+ languages."
Dual Experience Cards below hero:
1. "VeriVoice Talk" Card: Highlighted as conversational ambient voice room. Shows an organic glowing voice orb with "Tap to start voice session" call to action.
2. "VeriVoice Chat" Card: Highlighted as structured evidence workspace. Shows a preview of a verified claim card with "Open Research Workspace" call to action.
Footer: Trust badges citing WHO, UNESCO, and authoritative fact-checking standards.
Style: Deep obsidian slate background (#090D16), subtle 1px border cards (#111726), razor-sharp typography, zero messy AI gradients.
```

---

### Prompt 2: VeriVoice Talk Interface (The Ambient Voice Room)
```text
A serene, full-screen conversational voice interface for "VeriVoice Talk".
Centerpiece: A fluid, breathing central Voice Orb / soundwave resonator with subtle emerald and slate accents.
Current State: "LISTENING" — with real-time dynamic soundwave frequency rings expanding around the orb.
Top Bar: Minimal back button, session timer (01:24), and active language pill ("اردو / Urdu").
Bottom Canvas: Discreet bottom bar with "Hold Space or Tap Orb to Speak", Mute toggle, and "Switch to Evidence Chat".
A subtle floating card below the orb shows the live transcript appearing in real-time Urdu script: "پولیو ویکسین کے بارے میں بتائیں، کیا یہ محفوظ ہے؟".
Style: Clean, focused, distraction-free ambient canvas, deep obsidian dark theme.
```

---

### Prompt 3: VeriVoice Chat Interface (The Evidence Workspace)
```text
A professional research and verification workspace for "VeriVoice Chat".
Header: VeriVoice brand, Mode Selector Tabs ("Claim Verification" with shield icon vs "General Research" with globe icon), Domain Filter Pills (Health, Science, Climate, Disasters, Education).
Main Chat Canvas: Conversation stream with high-contrast message cards.
User Query Bubble: Showing user's voice transcript and audio waveform snippet.
System Response Card: Complete verification dossier showing Verdict Badge ("TRUE"), Confidence Score (95%), Grounded Explanation in Urdu and English, Expandable Evidence Drawer, and an embedded audio player with play/pause and scrub bar.
Bottom Input Bar: Floating dock containing a large rounded input field ("Type a claim or question..."), an prominent Voice Note Record Button, and an Audio File Upload attachment icon.
```

---

### Prompt 4: Evidence Result Card (Inspection Drawer)
```text
An expanded evidence inspector card within the VeriVoice fact-checking interface.
Header: "Retrieved Primary Evidence (3 Sources Checked)" with an "Evidence Strength: STRONG" badge.
Source 1 Card (Primary Authority): "World Health Organization (WHO) — Polio Eradication Guidance", verified checkmark badge, direct URL link (who.int/pakistan), exact matching evidence snippet highlighted in emerald box.
Source 2 Card (Government Authority): "National Emergency Operations Centre (NEOC) Pakistan — Vaccine Safety Factsheet", verified badge, publication date "June 2024".
Source 3 Card (Scientific Journal): "The Lancet Global Health — Longitudinal Immunization Analysis".
Footer: Independent Source Count metric ("3 Independent Institutional Sources Grounded"), anti-hallucination guarantee watermark.
```

---

### Prompt 5: Verification Verdict Display Variants
```text
A UI component showcase displaying the 4 core verification verdict states of VeriVoice:
1. TRUE Card: Emerald Green theme (#10B981), bold "🟢 TRUE" badge, "Claim is fully supported by authoritative health guidelines."
2. FALSE Card: Crimson Red theme (#E11D48), bold "🔴 FALSE" badge, "Claim is debunked by clinical evidence and health authorities."
3. MIXED Card: Warm Amber theme (#F59E0B), bold "🟡 MIXED" badge, "Claim contains partial truth but lacks essential context."
4. UNCERTAIN Card: Cyan Slate theme (#06B6D4), bold "⚪ UNCERTAIN" badge, "Available reliable evidence is insufficient to verify. VeriVoice refuses to hallucinate."
Each card includes confidence score, source count, and audio playback button.
```

---

### Prompt 6: General Research Result Card (Exploratory Mode)
```text
A research result card for "General Research Mode" (non-verdict exploratory answers).
Header: "🌐 Research Summary" with Domain Tag "Health & Immunology".
Query: "How do mRNA vaccines train the human immune system?"
Body: Structured, clear explanatory breakdown with numbered key takeaways and bolded terms.
Sources Section: Clean list of cited scientific papers with journal badges (Nature, ScienceDirect, NIH).
Action Bar: "Listen to Spoken Summary (1:15)", "Copy Summary", "Explore Related Questions".
```

---

### Prompt 7: Mobile Web Experience (Responsive 390px Viewport)
```text
Mobile smartphone UI (iPhone 15 screen layout) for VeriVoice Talk and Chat.
Layout: Responsive 390px width.
Top App Bar: Compact VeriVoice shield logo, language toggle badge ("UR"), and session menu.
Body: Centered Voice Orb in active listening state with glowing waveform rings.
Floating Bottom Bar: Large thumb-friendly circular microphone button with haptic pulse ring, quick text keyboard expander button, and switch to evidence drawer.
Card UI: Compact collapsible verdict card showing "🔴 FALSE" badge and 1-line audio preview with tap to expand full WHO citations.
```

---

### Prompt 8: Error, Timeout & Fallback States
```text
A high-fidelity error and system status modal for VeriVoice:
1. State A (Live Search Timeout): "⚠️ Search Service Timeout — Live web search experienced high network latency. To protect truth, VeriVoice refused to guess from memory." with a clear "Retry Evidence Search" primary button.
2. State B (Microphone Denied): "🎙️ Microphone Access Required — Please enable mic permissions in your browser settings to use voice verification." with "Switch to Text Input" button.
3. State C (Render Cold Start): "⚡ Waking up verification engine... Ready in 20s" with animated progress ring.
```

---

### Prompt 9: Multilingual Selector & Localization Modal
```text
A polished language switcher modal for VeriVoice:
Title: "Select Verification Language / زبان منتخب کریں"
Grid of language cards:
1. اردو (Urdu) — Flag / Nastaliq & Naskh script preview, "مکمل صوتی معاونت (Full Voice Support)"
2. English — "Global Standard Voice & Citations"
3. Español (Spanish) — "Verificación de voz en español"
4. Bahasa Indonesia — "Verifikasi suara bahasa Indonesia"
5. العربية (Arabic) — "التحقق الصوتي من الحقائق"
Each card highlights ASR accuracy, Neural TTS voice name, and auto-detect option.
```

---

### Prompt 10: Voice Interaction State Progression (Step-by-Step)
```text
A sequence infographic / UI state diagram showing the 5 progressive states of VeriVoice Talk:
1. IDLE: Translucent breathing orb with text "Tap to Speak"
2. LISTENING: Expanding audio frequency rings reacting to user's voice
3. PROCESSING: Orb spinning into an analytical particle ring ("Transcribing voice...")
4. CHECKING EVIDENCE: Dual orb pulses with text ("Searching WHO & authoritative sources...")
5. RESPONDING: Full glowing resonance playing neural audio with Spoken Verdict Card emerging below.
```
