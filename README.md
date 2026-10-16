# DON'T WAKE THE DARK

A 2D Top-Down Survival Horror / Arcade Escape built for the timed 3-hour game jam using HTML5 Canvas, CSS3, and Vanilla JavaScript with **zero external dependencies**.

---

## 1. Verified Local Launch Instructions

The game requires **zero external runtime dependencies** and is completely self-contained for offline play.

### Option 1: Built-in Python Server (Verified & Recommended)
```bash
python3 -m http.server 8080
```
Then open your browser to:
```
http://localhost:8080
```

### Option 2: Direct Browser Launch
Open `index.html` directly in any modern browser:
```bash
open index.html
```

### Option 3: Automated Test Verification
Run the complete regression, tier progression, signature features, and face-control test suites:
```bash
node tests/test_compliance.js && node tests/test_tier_progression.js && node tests/test_signature_features.js && node tests/test_face_controls.js
```

---

## 2. Organizer Facial Gesture Controls Integration

The game fully supports the organizer's external facial gesture listener script. The listener runs as a separate background process, capturing webcam input and dispatching standard OS keyboard events to the focused browser window.

### Facial Gesture Mappings

| Facial Gesture | Keyboard Event | In-Game Behavior |
|---|---|---|
| **Head Up** | `ArrowUp` | Move upward continuously while held |
| **Head Down** | `ArrowDown` | Move downward continuously while held |
| **Head Left** | `ArrowLeft` | Move left continuously while held (Title: Previous Tier) |
| **Head Right** | `ArrowRight` | Move right continuously while held (Title: Next Tier) |
| **Open Mouth** | `Z` / `z` | Start game, activate Protective Ward, or restart (single leading-edge action) |
| **Blink** | `Space` | Activate Light Pulse (single leading-edge action, 3s cooldown) |

### Required Launch Order & Setup
1. **Step 1 — Launch the Game:**
   Start the local HTTP server (`python3 -m http.server 8080`) and navigate to `http://localhost:8080` in your browser.
2. **Step 2 — Keep Game Window Focused:**
   Click inside the game window so that the browser tab retains active keyboard focus. If focus is lost, all movements safely halt via the `window.onblur` protection.
3. **Step 3 — Start Organizer Listener Script:**
   Launch the organizer-supplied listener script in a separate terminal. *(Note: The listener script runs externally outside this repository. Please run the script command provided by the event organizers).*

### Integration Status & Known Limitations
- **Game Engine & Input Reception:** **VERIFIED (100% PASS)** via `tests/test_face_controls.js`. The centralized input manager in `src/input.js` correctly processes held state, diagonal vector normalization, leading-edge triggers for Z/Space, and ignores synthetic OS key-repeat events.
- **End-to-End Live Camera Feed:** **UNVERIFIED (Awaiting Organizer Script)**. The external listener script is hosted outside this repository; actual facial tracking accuracy depends on the organizer's external computer-vision listener.

---

---

## 3. Objective & Narrative
You are **The Lantern Keeper**, trapped inside a ruined celestial observatory cloaked in dark malevolence. 

To escape:
1. **Choose Your Tier (100 Chambers Total):**
   - **EASY (The Courtyard):** 30 Chambers • 1 Shadow • 3 Keys • Medium Stalker Speed (82–108 px/s)
   - **MEDIUM (The Archives):** 25 Chambers • 1 Shadow • 4 Keys • High Stalker Speed (112–142 px/s)
   - **HARD (The Void Rotunda):** 25 Chambers • 2 Shadows • 4 Keys • Medium Stalker Speed (88–114 px/s)
   - **ULTRA HARD (Singularity Core):** 20 Chambers • 2 Shadows • 5 Keys • High Lethal Speed (124–154 px/s)
2. **Recover the Ancient Light Keys:** Gather all required luminous keys scattered across each chamber (3 in Easy, 4 in Medium & Hard, 5 in Ultra Hard) to unlock the exit portal.
3. **Survive with Light Abilities:**
   - **Protective Ward (Z):** Hexagonal forcefield ring deflecting damage for 1.0s (~5.0s cooldown).
   - **Light Pulse (Space):** Expanding cyan shockwave repelling the shadow enemy (~3.0s cooldown).
4. **User-Controlled Chamber Advance (Zero Auto-Warp):** 
   - When you step into the unlocked exit portal, the chamber is secured and the **Chamber Cleared Screen** appears with dual interactive options:
     - **Next Chamber:** Press **Z** (or click card) to enter the next chamber (+200 bonus, +1 HP, +35s time).
     - **Exit to Main Menu:** Press **Arrow Keys** or **Space** (or click card) to exit back to the Main Menu.

---

## 4. Signature Features ("The Observatory Remembers")

### Feature 1-A: Shadow's Past Trail (Space Pulse)
- Emits an expanding circular pulse of cyan light.
- Reveals the shadow creature's recent movement history as a sequence of chromatic cyan-violet afterimages fading over 1.8 seconds.
- Uses a strictly bounded 45-sample historical ring buffer to prevent memory leaks.

### Feature 1-B: Restoring the Celestial Constellation
- The arena floor features an abandoned celestial astrolabe with 12 stars and interconnected geometric constellations.
- Dimmed at start (`KEYS 0/3`).
- Collecting Key 1 restores Quadrant I with a cyan flare.
- Collecting Key 2 restores Quadrant II.
- Collecting Key 3 fully illuminates all 12 stars with a radiant golden bloom.

### Feature 1-C: Restored Constellation Luminous Guide Path
- As soon as all 3 keys are claimed, the completed constellation emits an animated golden stardust beacon path and glowing directional chevrons leading directly to the unlocked exit portal.

### Feature 2: Memorable Third-Key Finale
- Claiming the final key triggers a dramatic sequence:
  1. Particle burst and key disappearance.
  2. Brief ambient eclipse dimming.
  3. Ultraviolet silhouette flare revealing the shadow stalker's full form.
  4. Radial golden bloom across the completed constellation.
  5. Directional stardust pathway illuminating the unlocked exit.
  6. Floating `EXIT UNLOCKED` announcement.
  7. **100% Player Control:** The player retains full movement and control without any freezes or unavoidable collisions.

### Feature 3 & 4: Atmospheric Environment & Feedback
- Deep obsidian and navy observatory arena floor.
- Astrolabe meridian rings, 4 quadrant architectural pillars, and broken telescope dome silhouette.
- Layered drifting dust/fog motes.
- Hexagonal ward forcefield ring, pulse shockwave knockback, and proximity danger vignette.

### Feature 5: Title Screen & Ending Polish
- Title screen features a subtle shadow stalking in orbit, a glowing center lantern, and a slowly illuminating constellation.
- Exact required prompt: `Press Z to start`.
- Game Over screen displays score, chamber reached, cause of death, 1.0s debounce, and exact text: `Press Z to play again`.

### Feature 6: Procedural Web Audio Engine
- Built-in Web Audio synthesizer generating real-time ambient drones, key collection chimes, ward hums, pulse whooshes, damage warning cues, and victory fanfares without any external audio downloads.

---

## 5. Strict Six-Key Controls Scheme

The game is strictly mapped to **exactly six keys**:

| Key | Title / Menu | Gameplay | Chamber Cleared | Victory / Game Over |
|---|---|---|---|---|
| **Arrow Up** (&uarr;) | Inactive | Move Upward | Inactive | Inactive |
| **Arrow Down** (&darr;) | Inactive | Move Downward | Inactive | Inactive |
| **Arrow Left** (&larr;) | Cycle Tier Left | Move Leftward | **Return to Difficulty Menu** | **Return to Difficulty Menu** |
| **Arrow Right** (&rarr;) | Cycle Tier Right | Move Rightward | **Return to Difficulty Menu** | **Return to Difficulty Menu** |
| **Z / z** (Case-Insensitive) | Start Game (`Press Z to start`) | Tap: Ward (~1s, 5s CD)<br>• **Hold (1.5s): Exit Level to Title** | Enter Next Chamber | Restart (`Press Z to play again`, 1s debounce on Game Over) |
| **Space** | Inactive | Light Pulse (Reveals shadow trail & keys, repels shadow, 3s CD) | Inactive | Inactive |

### Input Architecture Guarantees
- **Exit Level Whenever You Want:** Hold **Z** continuously for 1.5 seconds while in gameplay to safely abort the chamber and return to the Title / Difficulty Selection menu. An on-screen radial countdown ring guides the action. Releasing before 1.5s cancels without penalty.
- **Return to Difficulty Menu from Anywhere:** Pressing **Arrow Left** or **Arrow Right** on the Chamber Cleared, Victory, or Game Over screens returns you straight to the Easy / Medium / Hard / Ultra Hard selection cards.
- **Title Screen Protection:** Returning to the Title screen enforces an 0.8s debounce and requires the Z key to be physically released first, preventing held keys from accidentally skipping the difficulty selection screen.
- **Normalized Diagonal Movement:** Diagonal vector magnitude is mathematically normalized ($\le 1$) so diagonal movement speed equals cardinal speed.
- **Safe Key Release:** Releasing all movement keys stops player motion safely without damage.
- **Scroll Prevention:** Arrow keys and Space default browser scrolling is prevented.
- **Window Blur Protection:** Switching tabs or blurring focus immediately clears all held keys.
- **Fresh Press Enforcement:** Holding Z across screen transitions never auto-triggers actions on the next screen.

---

## 6. Scoring & Rules
- **Keys:** +100 points per key (+300 points total per chamber).
- **Escape Bonus:** +200 points upon stepping into the unlocked portal.
- **Survival Time Bonus:** +1 point for each second remaining on the timer.
- **Health:** 3 Health points. Contact with shadow creature inflicts 1 damage and triggers 1.2s of invulnerability frames (i-frames).
- **Abilities:** Unlimited uses governed by cooldowns. Accidental use during cooldown is a harmless no-op and wastes zero resources.
- **Space is Optional:** The game is beatable without using Light Pulse.

---

## 7. Facial Gesture Control Integration

The game features dual support for facial gesture controls:

### A. Integrated Zero-Install In-Browser Webcam Controller (`src/face_tracker.js`)
- **100% Client-Side & Offline:** Pure Vanilla JavaScript using HTML5 Canvas & `getUserMedia`. No external Python packages, CDN scripts, or remote servers required.
- **How to Use:**
  1. Open `http://localhost:8080` in your web browser.
  2. Click **📹 START WEBCAM FACE TRACKING** on the Title screen.
  3. Allow webcam access when prompted by the browser.
  4. The floating PiP HUD activates in the top-right corner. Keep your head centered for ~1 second while it auto-calibrates to your resting posture and room lighting.
  5. Steer your player by tilting your head, open your mouth to trigger **Z** (Start/Ward/Restart), and blink to fire **Space** (Light Pulse).
  6. Click **SENS: HIGH** to toggle between `HIGH`, `ULTRA`, and `NORMAL` gesture sensitivity at any time.

### B. Standalone Organizer Python Listener (`organizer_face_listener.py`)
- For external terminal/OS-level testing, a dedicated listener is provided:
  ```bash
  python3 organizer_face_listener.py
  ```
- Translates face movements directly into system keystrokes using OpenCV and PyAutoGUI. If packages are missing, it provides clear installation commands (`pip install opencv-python pyautogui`) and opens an interactive keyboard emulation mode.

---

## 8. File Structure
- `index.html` — Canvas viewport, high-contrast HUD, chamber cleared modal, tier selector cards, live webcam PiP HUD, facial gesture legend.
- `style.css` — Atmospheric neon horror aesthetic, typography readable from 2m away, floating PiP styling.
- `src/input.js` — Centralized input manager (strictly 6 keys, keyrepeat-ignoring, case-insensitivity, normalization, blur safety).
- `src/face_tracker.js` — Zero-dependency adaptive in-browser webcam facial tracker (head posture, mouth opening, blink detection).
- `src/game.js` — Core game engine (state machine, enemy AI, signature afterimages, constellation restoration, exit guidance, third-key finale, Web Audio SFX).
- `organizer_face_listener.py` — Standalone Python listener script for external facial gesture translation.
- `tests/test_compliance.js` — Automated verification suite for organizer rules.
- `tests/test_tier_progression.js` — Automated verification suite for 4 tiers and 100 levels.
- `tests/test_signature_features.js` — Automated verification suite for signature features and user-controlled level advance.
- `tests/test_face_controls.js` — Automated verification suite for organizer facial gesture control mappings and repeat-ignoring.
- `AGENTS.md` — Mandatory game jam governance, rules, checklist, and approval gate.
- `README.md` — Complete documentation, launch instructions, controls, and organizer listener integration.
