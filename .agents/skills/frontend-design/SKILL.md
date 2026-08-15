---
name: frontend-design
description: >-
  Anthropic's official frontend design system skill. Use when creating, refining,
  or polishing web user interfaces, components, typography, responsive layouts,
  color systems, micro-interactions, and visual hierarchy to achieve world-class,
  bespoke frontend craftsmanship without generic AI design patterns.
---

# Frontend Design System & Craftsmanship Guidelines

This skill provides comprehensive architectural and aesthetic principles for building state-of-the-art, bespoke web interfaces inspired by world-class software design (Apple, Stripe, Linear, Vercel).

---

## 1. Core Design Philosophy: Function & Authenticity

1. **Content-First Hierarchy**: Every pixel, component, and spacing decision must serve the user's primary intent. Never use decorative fluff or arbitrary visual noise.
2. **Eliminate "AI Slop" & Generic Tropes**:
   * ❌ No generic purple/violet glow accents on dark backgrounds.
   * ❌ No icon-stuffed bento boxes without functional necessity.
   * ❌ No headline biscuit/pill badges with pulsing dots placed arbitrarily above headers.
   * ❌ No gradient text fills on main headlines.
   * ❌ No grid line / particle mesh backgrounds.
   * ❌ No over-nested rounded cards (cards inside cards inside cards).
3. **Bespoke Craftsmanship**: Treat every interface as a custom piece of industrial design.

---

## 2. Typographic Mastery

* **Font Pairing Strategy**:
  * **Primary Sans**: Clean, high-legibility system sans (`-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif`).
  * **Editorial Display / Serif**: Editorial serif for authoritative headlines (`'Literata'`, `'Newsreader'`, `'Charter'`).
  * **Technical Monospace**: Monospaced font for statuses, telemetry, code, metrics, and metadata (`'JetBrains Mono'`, `'SF Mono'`).
  * **Multilingual Script**: Native script fonts (e.g. `'Noto Naskh Arabic'` for Urdu/Arabic with line-height $\ge 1.85$).
* **Typography Details**:
  * **Letter-Spacing (Tracking)**: Tighten headings (`-0.02em` to `-0.03em`), neutral tracking on body (`-0.011em`), tracked-out uppercase labels (`+0.05em` to `+0.1em`).
  * **Subpixel Antialiasing**: Always enforce `-webkit-font-smoothing: antialiased` and `text-rendering: optimizeLegibility`.

---

## 3. Color, Depth & Glass Surfaces

* **Surface Hierarchy**:
  * `surface-base`: Deepest background canvas (`#0A0A0A` to `#0E0E0E`).
  * `surface-container`: Recessed groupings (`#141414`).
  * `surface-elevated`: Floating interactive cards (`#181818` to `#1C1C1C`).
  * `surface-highlight`: Active/hover highlights (`#242424`).
* **Borders & Outlines**:
  * Use subtle translucent borders (`border-white/[0.06]` to `border-white/[0.12]`) rather than solid high-contrast borders.
* **Glassmorphism**:
  * `backdrop-blur-xl` with high opacity backing (`rgba(14, 14, 14, 0.85)`) to preserve legibility while giving tactile depth.

---

## 4. Micro-Interactions & Motion

* **Custom Easing**:
  * `transition: all 180ms cubic-bezier(0.2, 0, 0, 1)` for snappy, mechanical responsiveness.
* **Tactile Feedback**:
  * Buttons should slightly depress on `:active` (`scale(0.98)` or `translate-y-px`).
  * Hover states should illuminate or deepen slightly without jarring layout shifts.
* **Loading & Progressive Disclosure**:
  * Never leave users guessing during async tasks: provide smooth, progressive loading bars with descriptive stage text.

---

## 5. Responsive Architecture

* **Mobile (375px–430px)**: Touch-friendly targets ($\ge 44\text{px}$), accessible drawer navigation, sticky bottom composers.
* **Tablet (768px–1024px)**: Fluid two-column grids, collapsible side rails.
* **Desktop (1280px–1920px)**: Ergonomic centered containers ($\le 1280\text{px}$ reading width) with high-density sidebars.
