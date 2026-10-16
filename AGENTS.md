# AGENTS.md — GAME JAM MANDATORY ORGANIZER INSTRUCTIONS

## 1. Project Governance & Operating Principles
This document establishes non-negotiable rules, constraints, compliance gates, and workflow standards for this timed 3-hour game jam project (**DON'T WAKE THE DARK**). These instructions override any conflicting brief instructions.

All autonomous agents and coding partners must strictly abide by these rules.

---

## 2. Mandatory Approval Gate & Workflow

### Phase 1: Rule Files & Environment Setup
- Create and verify all rule files: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`, and `.cursor/rules/game-jam.mdc`.
- Ensure directory structures `.cursor/rules/` and `.github/` are created and verified.
- Do not overwrite unrelated files or project work.
- Re-read all rules and verify contents.

### Phase 2: Build-Plan Approval Gate
- Produce and present a complete build plan covering:
  1. Concept & theme
  2. Core loop
  3. Six-key mapping across every screen (Title, Gameplay, Victory, Game Over)
  4. Tech stack & constraints
  5. File structure & system architecture
  6. Milestone breakdown & time targets
  7. Risk management & anti-frustration measures
  8. Acceptance criteria
- **MANDATORY STOP:** The agent MUST pause and wait for explicit user approval. **No game implementation code, placeholder scaffolding, or dependency installation is permitted prior to explicit approval.**

### Phase 3: Milestone Implementation
Work sequentially through the approved milestones. After each milestone:
- Keep the project runnable and testable.
- Run the mandatory compliance checklist and report statuses as `PASS`, `FAIL`, or `NOT YET IMPLEMENTED`. Never claim a test has passed without verification.

---

## 3. Strict Input Scheme — Six-Key Mapping
The game interface is strictly designed around **exactly six keys**:
1. **Arrow Up** — Upward movement
2. **Arrow Down** — Downward movement
3. **Arrow Left** — Leftward movement
4. **Arrow Right** — Rightward movement
5. **Z / z** — Start / Confirm / Restart / Protective Ward (Case-insensitive)
6. **Space** — Light Pulse (Optional ability, expands light ring, repels shadow, reveals keys)

### Input Implementation Rules
- **Centralized Input**: All keyboard handling must reside exclusively in `src/input.js`. No scattered listeners or inline event handling.
- **State Tracking**: Track raw keydown, keyup, held state, and distinct fresh-press (unconsumed) states.
- **Diagonal Normalization**: Normalize diagonal velocity (vector magnitude $\leq 1$) so diagonal movement is not faster than cardinal movement.
- **Prevent Default**: Prevent default browser scrolling behavior for Arrow Keys and Space.
- **Window Blur Safety**: Clear all held keys immediately on `window.onblur`.
- **No Instant Loss on Release**: Releasing all movement keys stops movement smoothly and safely without damage or penalty.
- **Game Over Restart Safety**: Ignore Z presses during the first 1.0 second of the Game Over screen. Require Z to be released and then pressed freshly to restart.
- **No Held-Through Transitions**: Holding Z across screen transitions must never immediately trigger an action on the next screen; a fresh press is strictly required.

---

## 4. Screen-by-Screen State Machine & Mapping

| Screen | Arrow Keys | Z Key | Space Key | UI Requirements |
|---|---|---|---|---|
| **TITLE** | Inactive | Fresh press: Start Game (`Press Z to start`) | Inactive | Title, objective, controls list, exact text `Press Z to start`. No clickable buttons. |
| **PLAYING** | Continuous normalized arena movement | Protective Ward (approx 1s duration, ~5s cooldown) | Light Pulse (reveals items, repels shadow, ~3s cooldown) | HUD: 3 Health indicators, `KEYS 0/3`, Score, Timer, Cooldown indicators. |
| **VICTORY** | Inactive | Fresh press: Restart round | Inactive | Prominent victory banner, final score, unlock/escape feedback, restart prompt. |
| **GAME_OVER** | Inactive | Fresh press: Restart round (debounced by 1s) | Inactive | Cause of death, final score, exact text `Press Z to play again`. |

---

## 5. Core Gameplay & Technical Constraints
- **Tech Stack**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3, HTML5 Canvas. No third-party game engines, frameworks, or external runtime dependencies.
- **Scope Limit**: Exactly 1 compact arena, 1 primary shadow enemy, exactly 3 collectible keys, 1 sealed exit.
- **Networking**: Completely offline. No external APIs, multiplayer, telemetry, or remote assets.
- **Visual Style**: Atmospheric neon horror. High-contrast deep navy/black backgrounds, glowing cyan player, golden keys, magenta-violet shadow creature, warm exit illumination. Large typography readable from 2 meters.
- **Enemy Design**: Fair pursuit speed, visible silhouette/glow/warning ring, minimum 1-second reaction time, invulnerability frames on hit. Never multi-hit per frame.
- **Ability Design**: Unlimited uses, cooldown-governed, no resource depletion or punishment for accidental use. Game must be beatable without relying on rapid Space presses.
- **Timer & Score**: 180s countdown timer. +100 points per key collected, +200 points for exit escape. Clean state reset on restart.

---

## 6. Milestone Order
1. **Milestone 1 — Playable Prototype**: Movement, arena, shadow pursuit, health, collision, keys, score, timer, game over, restart.
2. **Milestone 2 — Complete Core Game**: 3 keys, locked/unlocked exit, victory sequence, protective ward, light pulse, damage recovery, gradual difficulty.
3. **Milestone 3 — Presentation**: Atmospheric lighting, fog overlays, glow effects, particle systems, smooth transitions, high-visibility HUD.
4. **Milestone 4 — Reliability & Compliance**: Exhaustive edge-case testing (held keys, window blur, case-insensitivity, debounces, simultaneous keys).
5. **Milestone 5 — Demo Verification**: Full game loop run, launch command verification in `README.md`, demo walkthrough documentation.

---

## 7. Mandatory Compliance Checklist
After every milestone and test pass, verify and record the status (`PASS`, `FAIL`, `NOT YET IMPLEMENTED`):
- [x] Rule files verified and unmodified except by approved instructions — PASS
- [x] Centralized input exclusively in `src/input.js` — PASS
- [x] Exactly six keys mapped and documented for all 4 screens — PASS
- [x] Case-insensitive Z ('z' and 'Z') support — PASS
- [x] Prevent default for Arrow keys and Space — PASS
- [x] Window blur clears all inputs — PASS
- [x] Diagonal movement normalized — PASS
- [x] Player contained within arena boundaries — PASS
- [x] Shadow pursuit fair with >=1s reaction window and i-frames — PASS
- [x] 3 keys collectible with HUD tracking (`KEYS 0/3`) — PASS
- [x] Exit locked until 3 keys collected, triggers victory upon contact — PASS
- [x] Protective Ward functional (~1s active, ~5s cooldown) — PASS
- [x] Light Pulse functional (~3s cooldown, repels shadow, reveals keys) — PASS
- [x] Game beatable without Space — PASS
- [x] 180s timer with score (+100/key, +200/exit) — PASS
- [x] Title screen has exact text `Press Z to start` — PASS
- [x] Game over screen has 1-second debounce and exact text `Press Z to play again` — PASS
- [x] No held-key carryover between screens — PASS
- [x] High contrast visuals readable from 2m away — PASS
- [x] Verified local launch command in `README.md` — PASS
