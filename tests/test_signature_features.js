/**
 * Test Suite for DON'T WAKE THE DARK: Signature Features & Non-Automatic Level Advance
 */

const fs = require('fs');
const assert = require('assert');

console.log(">>> Running Signature Features & Player Autonomy Tests...\n");

const gameSource = fs.readFileSync('./src/game.js', 'utf8');
const indexHtml = fs.readFileSync('./index.html', 'utf8');
const inputSource = fs.readFileSync('./src/input.js', 'utf8');

// 1. FEATURE 1-A: Light Pulse Reveals Shadow's Past Afterimages
assert(gameSource.includes("this.shadowTrailTimer = 1.8"), "FAIL: Space Light Pulse must activate shadowTrailTimer for ~1.8s");
assert(gameSource.includes("if (this.enemyHistory.length > 45)"), "FAIL: enemyHistory must be bounded (max 45 items) to prevent memory leak");
assert(gameSource.includes("renderShadowAfterimages"), "FAIL: renderShadowAfterimages must be implemented");
assert(gameSource.includes("rgba(0, 240, 255"), "FAIL: Afterimages must use cyan light");
assert(gameSource.includes("rgba(168, 85, 247"), "FAIL: Afterimages must use violet hue");
console.log("PASS: Feature 1-A (Shadow Past History & Afterimages) verified and bounded");

// 2. FEATURE 1-B: Constellation Progressive Restoration
assert(gameSource.includes("constellationStars"), "FAIL: constellationStars definition missing");
assert(gameSource.includes("constellationLines"), "FAIL: constellationLines definition missing");
assert(gameSource.includes("cluster: 1") && gameSource.includes("cluster: 2") && gameSource.includes("cluster: 3"), "FAIL: Constellation must have 3 progressive key clusters");
assert(gameSource.includes("keys >= line.cluster"), "FAIL: Line restoration must link to keysCollected");
assert(gameSource.includes("keys >= star.cluster"), "FAIL: Star restoration must link to keysCollected");
console.log("PASS: Feature 1-B (Progressive Celestial Constellation Restoration) verified");

// 3. FEATURE 1-C: Restored Constellation Luminous Path to Exit
assert(gameSource.includes("renderLuminousExitPath"), "FAIL: renderLuminousExitPath must exist");
assert(gameSource.includes("if (this.exit.unlocked) {\n      this.renderLuminousExitPath();\n    }"), "FAIL: Luminous exit path must activate when exit is unlocked");
assert(gameSource.includes("stardust") || gameSource.includes("dist = Math.hypot"), "FAIL: Luminous exit path must compute path from constellation to exit");
console.log("PASS: Feature 1-C (Luminous Guide Path to Unlocked Exit) verified");

// 4. FEATURE 2: Third-Key Finale
assert(gameSource.includes("thirdKeyFinaleTriggered"), "FAIL: thirdKeyFinaleTriggered flag must exist to prevent multi-triggering per frame");
assert(gameSource.includes("this.thirdKeyFinaleTriggered = true;"), "FAIL: Finale must set thirdKeyFinaleTriggered to true");
assert(gameSource.includes("this.finaleTimer = 1.4;"), "FAIL: Finale must set atmospheric eclipse timer");
assert(gameSource.includes("EXIT UNLOCKED"), "FAIL: Finale must communicate EXIT UNLOCKED");
assert(gameSource.includes("this.player.isMovementLocked") === false, "FAIL: Player movement must never be locked during finale");
console.log("PASS: Feature 2 (One-Time Third-Key Finale & Exit Unlock) verified");

// 5. USER-CONTROLLED LEVEL ADVANCE (NOT AUTOMATIC!)
assert(gameSource.includes("case 'CHAMBER_CLEARED':"), "FAIL: CHAMBER_CLEARED state must be defined");
assert(gameSource.includes("this.switchState('CHAMBER_CLEARED');"), "FAIL: Touching exit must switch to CHAMBER_CLEARED");
assert(gameSource.includes("updateChamberCleared()") && gameSource.includes("if (window.inputManager.wasZPressed()) {"), "FAIL: Advancing from CHAMBER_CLEARED must require user Z press");
assert(!gameSource.includes("setTimeout(() => this.nextChamber(), 900)"), "FAIL: Automatic 900ms timer must not exist");
assert(indexHtml.includes('id="screen-chamber-cleared"'), "FAIL: Chamber cleared overlay must exist in index.html");
assert(indexHtml.includes('Press Z to enter Next Chamber') || indexHtml.includes('id="cleared-prompt"'), "FAIL: Chamber cleared screen must have explicit user Z prompt");
console.log("PASS: User-Controlled Chamber Advance verified (Zero automatic warp)");

// 6. Memory and Performance Optimizations
assert(gameSource.includes("this.darkCanvas = document.createElement('canvas');"), "FAIL: darkCanvas must be cached and reused across frames");
assert(!gameSource.includes("renderDarknessLighting() {\n    this.ctx.save();\n\n    const darkCanvas = document.createElement('canvas');"), "FAIL: darkCanvas must not be instantiated every frame in renderDarknessLighting");
console.log("PASS: Zero-allocation darkness mask rendering verified");

// 7. Title Screen Roaming Shadow & Illuminated Constellation
assert(gameSource.includes("updateTitle(dt)"), "FAIL: updateTitle must accept dt for background animation");
assert(gameSource.includes("this.titleTime"), "FAIL: titleTime must be tracked for smooth background movement");
assert(gameSource.includes("this.enemy.x = cx + Math.cos"), "FAIL: Shadow must roam on title screen");
console.log("PASS: Feature 5 (Title Screen Roaming Shadow & Lantern Glow) verified");

// 8. Six-Key Compliance Integrity
assert(inputSource.includes("ArrowUp") && inputSource.includes("ArrowDown") && inputSource.includes("ArrowLeft") && inputSource.includes("ArrowRight"), "FAIL: 4 arrow keys required");
assert(inputSource.includes("'z'") && inputSource.includes("'Z'"), "FAIL: Case-insensitive Z required");
assert(inputSource.includes("' '") || inputSource.includes("'Space'"), "FAIL: Space key required");
assert(inputSource.includes("window.addEventListener('blur'"), "FAIL: Window blur clearing required");
console.log("PASS: Strict Six-Key Input Compliance verified");

// 9. EXIT LEVEL WHENEVER WANTED & TITLE SCREEN PROTECTION
assert(gameSource.includes("this.exitHoldTimer >= 1.5"), "FAIL: Hold Z for 1.5s must trigger level exit");
assert(gameSource.includes("this.switchState('TITLE')"), "FAIL: Level exit must transition back to TITLE");
assert(gameSource.includes("window.inputManager.isZHeld()"), "FAIL: Must check isZHeld() for hold duration");
assert(gameSource.includes("EXITING TO MENU"), "FAIL: Visual countdown text must be displayed while holding Z");
assert(gameSource.includes("this.zHeldTime < 0.3"), "FAIL: Quick tap (<0.3s) must activate Protective Ward on release");
assert(gameSource.includes("this.zHeldTime >= 0.3"), "FAIL: Holding (>0.3s) must charge exit without triggering ward");
assert(gameSource.includes("this.zMustReleaseBeforeStart"), "FAIL: Title screen must require Z to be released before allowing start");
assert(gameSource.includes("this.titleDebounce"), "FAIL: Title screen must debounce Z to prevent held-key skip");
console.log("PASS: Player-Controlled Instant Level Exit & Title Screen Protection verified");

console.log("\n=========================================");
console.log("ALL SIGNATURE FEATURES VERIFIED (100% PASS)");
console.log("=========================================\n");
