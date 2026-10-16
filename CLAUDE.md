# CLAUDE.md — GAME JAM INSTRUCTIONS FOR DON'T WAKE THE DARK

## Project Overview
- **Game Title:** DON'T WAKE THE DARK
- **Genre:** 2D Top-Down Survival Horror / Arcade Escape
- **Tech Stack:** HTML5, CSS3, Vanilla JavaScript, HTML Canvas (No engines/frameworks)
- **Time Constraint:** 3-Hour Game Jam

## Mandatory Workflow & Build-Plan Approval Gate
1. **Organizer Instructions & AGENTS.md are Mandatory:** All instructions in `AGENTS.md` override any conflicting requests.
2. **Phase 1 Setup:** Ensure all rule files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.github/copilot-instructions.md`, `.cursor/rules/game-jam.mdc`) are created and verified.
3. **Phase 2 Build-Plan Approval Gate:** Present concept, core loop, 6-key mapping for every screen, tech stack, file structure, milestones, risks, and acceptance criteria. STOP and wait for explicit user approval before writing any game code.
4. **Milestone Order:** Milestone 1 (Playable prototype) -> Milestone 2 (Core game) -> Milestone 3 (Presentation) -> Milestone 4 (Reliability & compliance) -> Milestone 5 (Demo verification).
5. **Compliance Checklist:** Update the checklist after every milestone using PASS, FAIL, or NOT YET IMPLEMENTED based strictly on verified execution.

## Strict Input Rules (Centralized in `src/input.js`)
- Only six keys are recognized: ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Z (both 'z' and 'Z'), and Space.
- Arrow keys: continuous movement, normalized diagonals, bounded in arena. Releasing keys stops player safely.
- Z key: Start / Confirm / Restart; during gameplay: Protective Ward (~1s active, ~5s cooldown).
- Space key: Light pulse (~3s cooldown, pushes enemy, reveals keys). Optional for beating the game.
- Prevent default page scrolling for Arrows and Space.
- Clear held state on window blur.
- Ignore Z for the first second on Game Over screen. Require release + fresh press to restart.

## Architecture & File Structure
- `index.html`: Canvas container & HUD markup
- `style.css`: High-contrast neon horror aesthetic, large typography readable from 2m away
- `src/input.js`: Centralized keyboard input system
- `src/game.js`: Game loop, state machine (TITLE, PLAYING, VICTORY, GAME_OVER), physics, rendering, collisions
- `README.md`: Verified local launch command, controls, mechanics, test instructions
