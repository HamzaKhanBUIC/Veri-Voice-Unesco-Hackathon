---
name: impeccable
description: >-
  Impeccable design enhancement and visual polish skill. Use to review, enhance,
  and elevate frontend code to pixel-perfect aesthetic perfection, enforcing
  4px/8px rhythm, visual hierarchy, harmonious color harmony, tactile micro-interactions,
  and zero visual clutter.
---

# Impeccable Design Enhancement & Aesthetic Polish

This skill enforces meticulous frontend design standards inspired by the highest-tier UI engineering (Apple Design Awards, Linear, Stripe, Raycast).

---

## 1. The Impeccable Checklist

When building or refining any page or component, audit against these 8 pillars:

### 1. Visual Hierarchy
* Is there exactly **one** primary call to action or focal point on the screen?
* Are secondary actions distinctly muted compared to primary actions?
* Does the eye naturally flow from Title $\rightarrow$ Subtitle $\rightarrow$ Primary Action $\rightarrow$ Supporting Content?

### 2. Geometry & Spacing (4px/8px Grid)
* All padding, margins, and gaps must be multiples of 4px (4, 8, 12, 16, 20, 24, 32, 48, 64).
* Outer card radius: `rounded-2xl` (16px) or `rounded-3xl` (24px).
* Inner child radius: $\text{Child Radius} = \text{Parent Radius} - \text{Padding}$.

### 3. Typography Rhythm & Kerning
* Heading letter-spacing tightened: `-0.02em` to `-0.025em`.
* Body line-height relaxed: `1.6` to `1.75` for effortless reading.
* Uppercase monospace badges tracked out: `tracking-wider` or `tracking-widest`.
* Font weights strictly limited to 3 per view: Regular (400), Medium (500), Semi-bold (600).

### 4. Color Restraint & Contrast
* Neutral darks instead of pure black (`#0E0E0E` vs `#000000`).
* Muted secondary text (`text-[#A0A0A0]` or `text-text-secondary` with minimum 4.5:1 contrast ratio).
* Brand accents used with extreme intention (for key verbs, active indicators, and verdicts only).

### 5. Micro-Interactions & Physicality
* Buttons have snappy tactile transitions (`transition-all duration-150 active:scale-[0.98]`).
* Dropdowns have smooth entry animations (`animate-fade-up` with `duration-200`).
* Focus rings use subtle offset rings (`focus-visible:ring-2 focus-visible:ring-brand-teal/50 focus-visible:ring-offset-2`).

### 6. Zero Layout Shifts
* Async elements have pre-allocated dimensions or skeleton loaders to prevent jarring layout jumps.
* Audio waveforms, modal drawers, and status toasts transition smoothly with CSS transforms.

### 7. Form & Input Polish
* Inputs have clear, generous padding (`px-4 py-3`), crisp placeholder contrast, and clear focus states.
* Submit buttons disable gracefully with opacity and cursor feedback while loading.

### 8. Mobile Refinement
* All interactive touch targets are at least $44 \times 44\text{px}$.
* Viewport horizontal scrolling is strictly prohibited (`overflow-x-hidden` on containers).
* Slide-out drawers and modals adapt naturally to bottom sheets on mobile screens.
