# GitHub Copilot Instructions — DON'T WAKE THE DARK

## Governance
- AGENTS.md defines all project rules and constraints.
- Timed 3-hour game jam project.
- Mandatory approval gate: Plan must be approved before implementation begins.

## Controls & Input Architecture
- Six-key system: ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Z (case-insensitive), Space.
- Centralized in `src/input.js`.
- Prevent default on Arrow keys and Space.
- Blur event clears all keys.
- Normalized diagonal movement.

## Gameplay & Game States
- States: TITLE, PLAYING, VICTORY, GAME_OVER.
- Exact text on TITLE: `Press Z to start`.
- Exact text on GAME_OVER: `Press Z to play again` (with 1s delay before accepting Z).
- 3 collectible keys (`KEYS 0/3`), 1 exit, 1 shadow pursuer.
- Z: Protective Ward (~1s duration, ~5s cooldown).
- Space: Light Pulse (~3s cooldown, pushes shadow, reveals keys).
- Scoring: +100/key, +200/escape. 180s timer.
- High-contrast neon horror aesthetic with large typography.
