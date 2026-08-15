# VeriVoice Frontend Design System Specification

**Document Version:** 1.0.0  
**Design Philosophy:** Restrained Institutional Trust + Organic Voice Dynamics  
**Inspirations:** Apple Health, Linear, Gov.uk, Perplexity Evidence Cards, UNESCO Design Guidelines  

---

## 1. Visual Philosophy & Design Principles

### Forbidden Tropes (Strict Compliance)
* ❌ NO neon glowing purple blobs or purple-on-dark backgrounds.
* ❌ NO headline biscuit pills with pulsing colored dots.
* ❌ NO multi-color gradient keyword text fills.
* ❌ NO generic AI grid line patterns or particle mesh overlays.
* ❌ NO over-nested cards (cards inside cards inside cards).
* ❌ NO cliché "AI-powered revolutionary platform" marketing fluff.

### Core Principles
1. **Evidence-First Hierarchy:** The verdict, confidence score, and primary source must be immediately legible within 200ms of viewing.
2. **Subtle Surface Depth:** Tactile dark mode using calibrated zinc/slate tones (`#090D16` canvas, `#111726` elevated card, `#1E293B` stroke borders) with 1px hairline borders rather than heavy drop shadows.
3. **Typography-Driven Credibility:** Professional editorial fonts with generous line height and proper tracking.
4. **Fluid Voice Motion:** Audio visualization is purposeful and tactile (responding to actual audio amplitude and state changes), not arbitrary decorative loop animations.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Base Surfaces
* **Canvas Background:** `--surface-canvas`: `#090D16` (Deep Obsidian Slate)
* **Subtle Elevation Layer:** `--surface-elevated`: `#111726` (Muted Zinc Slate)
* **Interactive Element Surface:** `--surface-interactive`: `#1A2234`
* **Card Border / Divider:** `--border-subtle`: `rgba(255, 255, 255, 0.08)`
* **Active Focus Border:** `--border-focus`: `rgba(255, 255, 255, 0.22)`

### 2.2 Semantic Verdict Colors
* **TRUE (Supported):**
  * Badge Background: `rgba(16, 185, 129, 0.12)`
  * Border: `rgba(16, 185, 129, 0.4)`
  * Text / Accent: `#10B981` (Emerald Green)
* **FALSE (Debunked / Contradicted):**
  * Badge Background: `rgba(225, 29, 72, 0.12)`
  * Border: `rgba(225, 29, 72, 0.4)`
  * Text / Accent: `#E11D48` (Crimson Rose)
* **MIXED (Partially True / Qualified):**
  * Badge Background: `rgba(245, 158, 11, 0.12)`
  * Border: `rgba(245, 158, 11, 0.4)`
  * Text / Accent: `#F59E0B` (Warm Amber)
* **UNCERTAIN (Insufficient Evidence):**
  * Badge Background: `rgba(6, 182, 212, 0.12)`
  * Border: `rgba(6, 182, 212, 0.4)`
  * Text / Accent: `#06B6D4` (Cyan Slate)
* **RESEARCH RESPONSE (Exploratory):**
  * Badge Background: `rgba(99, 102, 241, 0.12)`
  * Border: `rgba(99, 102, 241, 0.4)`
  * Text / Accent: `#6366F1` (Indigo / Slate Blue)

### 2.3 Typography Colors
* **Primary Text:** `--text-primary`: `#F8FAFC` (Slate 50)
* **Secondary / Body Text:** `--text-secondary`: `#94A3B8` (Slate 400)
* **Muted / Metadata Text:** `--text-muted`: `#64748B` (Slate 500)
* **Link / Accent Text:** `--text-accent`: `#38BDF8` (Sky 400)

---

## 3. Typography Architecture

VeriVoice supports RTL (Urdu, Arabic) and LTR (English, Spanish, Indonesian) with distinct typographic standards:

```css
/* Urdu & Arabic Typography */
font-family: 'Noto Naskh Arabic', 'Urdu Typesetting', serif;
line-height: 1.85; /* Essential for Urdu ligatures and diacritics */
letter-spacing: 0;

/* Primary UI & Latin Script Typography */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
letter-spacing: -0.015em;
line-height: 1.5;

/* Telemetry, Confidence Numbers & Timers */
font-family: 'Outfit', 'JetBrains Mono', monospace;
font-feature-settings: 'tnum' on, 'zero' on; /* Tabular numbers */
```

### Scale Hierarchy
* **Display (Hero Headline):** `32px / 2rem` (Desktop: `40px / 2.5rem`), SemiBold 600
* **Section Header (H2):** `22px / 1.375rem`, Medium 500
* **Card Title (H3):** `18px / 1.125rem`, Medium 500
* **Body Regular:** `15px / 0.9375rem`, Regular 400
* **Caption / Metadata:** `12px / 0.75rem`, Medium 500

---

## 4. Spacing, Grid, & Elevation

* **Base Unit:** `4px`
* **Spacing Scale:**
  * `xs`: 4px | `sm`: 8px | `md`: 16px | `lg`: 24px | `xl`: 32px | `2xl`: 48px
* **Card Border Radius:**
  * Container / Card: `16px` (`1rem`)
  * Buttons / Modality Bar: `12px` (`0.75rem`)
  * Badges / Status Pills: `9999px` (Full pill)
* **Breakpoints:**
  * Mobile: `< 640px`
  * Tablet: `640px – 1024px`
  * Desktop: `> 1024px` (Max container width: `1100px` for Chat, `760px` for Talk)

---

## 5. Interaction States & Motion System

### 5.1 Voice Orb Interaction States
* **IDLE:** Calm, translucent breathing sphere with gentle 4-second sinusoidal scale oscillation (0.98 to 1.02).
* **LISTENING:** Fluid multi-band ring expanding proportionally to microphone input amplitude (Web Audio `AnalyserNode`).
* **PROCESSING / RETRIEVING:** Subtle orbiting particle halo rotating at 60 RPM.
* **RESPONDING:** Glowing radial aura synchronized to TTS audio playback frequency.

### 5.2 Micro-Interactions
* **Card Expansion:** Smooth CSS spring transition (`cubic-bezier(0.16, 1, 0.3, 1)`, 250ms).
* **Button Hover:** 2% background lightness increase + 1px border brighten; no drastic scale jumps.
* **Audio Waveform:** Interactive seeking canvas with hover timestamp preview.
