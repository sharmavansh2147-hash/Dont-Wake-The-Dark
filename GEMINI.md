# GEMINI.md — GAME JAM INSTRUCTIONS FOR DON'T WAKE THE DARK

## Project Governance
- **Title:** DON'T WAKE THE DARK
- **Format:** 2D Top-Down Survival Horror / Arcade Escape
- **Core Directive:** Follow `AGENTS.md` exactly. All rules, checklists, and gates in `AGENTS.md` are mandatory.

## Approval Gate & Phases
- **Approval Gate:** Present complete build plan. Do NOT write game implementation code or install dependencies until explicit user approval is granted.
- **Milestone Order:**
  - Milestone 1: Playable prototype
  - Milestone 2: Complete core game
  - Milestone 3: Presentation & aesthetic polish
  - Milestone 4: Reliability and compliance testing
  - Milestone 5: Demo verification & launch documentation
- **Compliance Statuses:** Only use `PASS`, `FAIL`, or `NOT YET IMPLEMENTED` based on verified testing.

## Six-Key Input System (`src/input.js`)
- **Allowed Keys:** ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Z (case-insensitive 'z'/'Z'), Space.
- **Centralized:** All listeners in `src/input.js`.
- **Behaviors:** Normalized diagonals, window blur clearing, prevent default scrolling, safe key release, 1s debounce on Game Over before Z restart, fresh-press enforcement.

## Game Constants & Mechanics
- **3 Keys:** Golden glow, collect all 3 to unlock exit.
- **1 Exit:** Unlocks after 3 keys, triggers victory on contact.
- **1 Enemy:** Shadow creature with pursuit, >=1s reaction window, invulnerability frames on damage.
- **Light Ward (Z):** ~1s duration, ~5s cooldown. Unlimited uses.
- **Light Pulse (Space):** ~3s cooldown, repels shadow, reveals keys. Optional for survival.
- **HUD & Typography:** Large, high-contrast, readable from 2 meters. Neon horror theme.
