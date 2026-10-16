/**
 * Test Suite for Organizer Facial Gesture Control Integration
 * Tests keyboard translation: Head Up/Down/Left/Right, Open Mouth (Z), Blink (Space)
 */

const fs = require('fs');
const assert = require('assert');

console.log(">>> Running Organizer Face-Control Integration Tests...\n");

// 1. Mock Browser Environment for InputManager
const mockListeners = {};
global.window = {
  addEventListener: (event, handler) => {
    mockListeners[event] = handler;
  }
};

// Load input.js
eval(fs.readFileSync('./src/input.js', 'utf8'));
const input = window.inputManager;

// Helper to simulate keydown
function sendKeyDown(key, repeat = false) {
  let prevented = false;
  const event = {
    key,
    code: key === ' ' ? 'Space' : key === 'z' || key === 'Z' ? 'KeyZ' : key,
    repeat,
    preventDefault: () => { prevented = true; }
  };
  mockListeners['keydown'](event);
  return prevented;
}

// Helper to simulate keyup
function sendKeyUp(key) {
  const event = {
    key,
    code: key === ' ' ? 'Space' : key === 'z' || key === 'Z' ? 'KeyZ' : key,
    preventDefault: () => {}
  };
  mockListeners['keyup'](event);
}

// ----------------------------------------------------
// TEST 1: Head Gestures -> Continuous Arrow Movement
// ----------------------------------------------------
input.clearAll();

// Head Up
sendKeyDown('ArrowUp');
let v = input.getMovementVector();
assert.strictEqual(v.dy, -1, 'FAIL: Head Up (ArrowUp) must produce upward movement (dy = -1)');
assert.strictEqual(v.dx, 0, 'FAIL: dx must be 0 for pure Up');
sendKeyUp('ArrowUp');
v = input.getMovementVector();
assert.strictEqual(v.dy, 0, 'FAIL: Releasing Head Up must stop upward movement (dy = 0)');
console.log("PASS: Head Up continuous movement & release verified");

// Head Down
sendKeyDown('ArrowDown');
v = input.getMovementVector();
assert.strictEqual(v.dy, 1, 'FAIL: Head Down (ArrowDown) must produce downward movement (dy = 1)');
sendKeyUp('ArrowDown');
v = input.getMovementVector();
assert.strictEqual(v.dy, 0, 'FAIL: Releasing Head Down must stop downward movement');
console.log("PASS: Head Down continuous movement & release verified");

// Head Left
sendKeyDown('ArrowLeft');
v = input.getMovementVector();
assert.strictEqual(v.dx, -1, 'FAIL: Head Left (ArrowLeft) must produce leftward movement (dx = -1)');
sendKeyUp('ArrowLeft');
v = input.getMovementVector();
assert.strictEqual(v.dx, 0, 'FAIL: Releasing Head Left must stop leftward movement');
console.log("PASS: Head Left continuous movement & release verified");

// Head Right
sendKeyDown('ArrowRight');
v = input.getMovementVector();
assert.strictEqual(v.dx, 1, 'FAIL: Head Right (ArrowRight) must produce rightward movement (dx = 1)');
sendKeyUp('ArrowRight');
v = input.getMovementVector();
assert.strictEqual(v.dx, 0, 'FAIL: Releasing Head Right must stop rightward movement');
console.log("PASS: Head Right continuous movement & release verified");

// ----------------------------------------------------
// TEST 2: Diagonal Normalization (Simultaneous Head Postures)
// ----------------------------------------------------
sendKeyDown('ArrowUp');
sendKeyDown('ArrowRight');
v = input.getMovementVector();
const mag = Math.hypot(v.dx, v.dy);
assert(Math.abs(mag - 1.0) < 0.001, `FAIL: Diagonal magnitude must be normalized to 1.0, got ${mag}`);
sendKeyUp('ArrowUp');
sendKeyUp('ArrowRight');
v = input.getMovementVector();
assert.strictEqual(v.dx, 0, 'FAIL: All movement must stop after releasing diagonal');
assert.strictEqual(v.dy, 0, 'FAIL: All movement must stop after releasing diagonal');
console.log("PASS: Diagonal movement normalization verified (magnitude = 1.0)");

// ----------------------------------------------------
// TEST 3: Open Mouth (Z) - Single Leading-Edge Trigger
// ----------------------------------------------------
input.clearAll();
// Leading edge
sendKeyDown('z');
assert.strictEqual(input.wasZPressed(), true, 'FAIL: First open mouth must set wasZPressed to true');
assert.strictEqual(input.isZHeld(), true, 'FAIL: Z must be held');
input.consumeZ();
assert.strictEqual(input.wasZPressed(), false, 'FAIL: Consumed Z must be false');

// Repeated keydown while mouth remains open (OS key-repeat simulation)
sendKeyDown('z', true); // repeat = true
assert.strictEqual(input.wasZPressed(), false, 'FAIL: Repeated keydown while Z held must NOT re-trigger wasZPressed');
assert.strictEqual(input.isZHeld(), true, 'FAIL: Z must remain held');

// Mouth closed
sendKeyUp('z');
assert.strictEqual(input.isZHeld(), false, 'FAIL: Mouth closed must clear held state');
assert.strictEqual(input.wasZPressed(), false, 'FAIL: Mouth closed must not trigger fresh press');
console.log("PASS: Open mouth (Z) leading-edge trigger & repeat-ignoring verified");

// ----------------------------------------------------
// TEST 4: Blink (Space) - Single Leading-Edge Trigger
// ----------------------------------------------------
input.clearAll();
// Leading edge
sendKeyDown(' ');
assert.strictEqual(input.wasSpacePressed(), true, 'FAIL: Initial blink must set wasSpacePressed to true');
assert.strictEqual(input.isSpaceHeld(), true, 'FAIL: Space must be held');
input.consumeSpace();
assert.strictEqual(input.wasSpacePressed(), false, 'FAIL: Consumed Space must be false');

// Repeated keydown while eyes closed (prolonged blink simulation)
sendKeyDown(' ', true); // repeat = true
assert.strictEqual(input.wasSpacePressed(), false, 'FAIL: Prolonged blink must NOT re-trigger fresh pulse');
assert.strictEqual(input.isSpaceHeld(), true, 'FAIL: Space must remain held');

// Eyes open
sendKeyUp(' ');
assert.strictEqual(input.isSpaceHeld(), false, 'FAIL: Eyes open must clear held state');
console.log("PASS: Blink (Space) leading-edge trigger & prolonged blink safety verified");

// ----------------------------------------------------
// TEST 5: Window Blur Safety (Window Focus Loss)
// ----------------------------------------------------
sendKeyDown('ArrowUp');
sendKeyDown('ArrowLeft');
sendKeyDown('z');
sendKeyDown(' ');
assert.strictEqual(input.heldKeys.up, true);
assert.strictEqual(input.heldKeys.left, true);
assert.strictEqual(input.heldKeys.z, true);
assert.strictEqual(input.heldKeys.space, true);

// Window blur event fires
mockListeners['blur']();

v = input.getMovementVector();
assert.strictEqual(v.dx, 0, 'FAIL: Blur must zero dx');
assert.strictEqual(v.dy, 0, 'FAIL: Blur must zero dy');
assert.strictEqual(input.isZHeld(), false, 'FAIL: Blur must clear Z held state');
assert.strictEqual(input.isSpaceHeld(), false, 'FAIL: Blur must clear Space held state');
assert.strictEqual(input.wasZPressed(), false, 'FAIL: Blur must clear justPressed Z');
assert.strictEqual(input.wasSpacePressed(), false, 'FAIL: Blur must clear justPressed Space');
console.log("PASS: Window blur safety clears all held and fresh inputs");

// ----------------------------------------------------
// TEST 6: Screen Transition Held-Key Guard in Game Logic
// ----------------------------------------------------
const gameSource = fs.readFileSync('./src/game.js', 'utf8');
assert(gameSource.includes("this.zMustReleaseBeforeStart") || gameSource.includes("this.zMustReleaseBeforeAction"),
  "FAIL: Game state transitions must guard against held Z carryover");
assert(gameSource.includes("this.titleDebounce"),
  "FAIL: Title screen must debounce Z to prevent held-key skip");
console.log("PASS: Screen transition held-key guard verified in game logic");

// ----------------------------------------------------
// TEST 7: UI Facial Gesture Legend in index.html
// ----------------------------------------------------
const indexHtml = fs.readFileSync('./index.html', 'utf8');
assert(indexHtml.includes("Raise Head"), "FAIL: UI must explain Raise Head gesture");
assert(indexHtml.includes("Lower Head"), "FAIL: UI must explain Lower Head gesture");
assert(indexHtml.includes("Turn Left"), "FAIL: UI must explain Turn Left gesture");
assert(indexHtml.includes("Turn Right"), "FAIL: UI must explain Turn Right gesture");
assert(indexHtml.includes("Open Mouth"), "FAIL: UI must explain Open Mouth gesture");
assert(indexHtml.includes("Blink"), "FAIL: UI must explain Blink gesture");
assert(indexHtml.includes("Press Z to start"), "FAIL: Exact required text 'Press Z to start' missing");
assert(indexHtml.includes("Press Z to play again"), "FAIL: Exact required text 'Press Z to play again' missing");
console.log("PASS: All six facial gesture explanations and exact prompt strings verified in HTML");

// ----------------------------------------------------
// TEST 8: FaceTrackerController Methods & Multi-Tier Sensitivity
// ----------------------------------------------------
global.document = {
  getElementById: (id) => ({
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    style: {}
  })
};
global.window.inputManager = input;
global.window.dispatchEvent = () => {};

eval(fs.readFileSync('./src/face_tracker.js', 'utf8'));
const tracker = window.faceTracker;
assert(tracker, 'FAIL: window.faceTracker must be instantiated');
assert.strictEqual(tracker.sensitivity, 'HIGH', 'FAIL: Default sensitivity must be HIGH');
tracker.cycleSensitivity();
assert.strictEqual(tracker.sensitivity, 'ULTRA', 'FAIL: Sensitivity after cycle must be ULTRA');
tracker.cycleSensitivity();
assert.strictEqual(tracker.sensitivity, 'NORMAL', 'FAIL: Sensitivity after cycle must be NORMAL');
tracker.cycleSensitivity();
assert.strictEqual(tracker.sensitivity, 'HIGH', 'FAIL: Sensitivity after cycle must return to HIGH');

// Test updateKeyHold
input.clearAll();
tracker.updateKeyHold('up', true, 'ArrowUp');
assert.strictEqual(tracker.heldStates.up, true, 'FAIL: tracker.heldStates.up must be true');
assert.strictEqual(input.heldKeys.up, true, 'FAIL: inputManager.heldKeys.up must be true');

tracker.updateKeyHold('up', false, 'ArrowUp');
assert.strictEqual(tracker.heldStates.up, false, 'FAIL: tracker.heldStates.up must be false');
assert.strictEqual(input.heldKeys.up, false, 'FAIL: inputManager.heldKeys.up must be false');

// Test releaseAllHeldKeys
tracker.heldStates.up = true;
tracker.heldStates.down = true;
tracker.heldStates.left = true;
tracker.heldStates.right = true;
tracker.heldStates.z = true;
tracker.releaseAllHeldKeys();
assert.strictEqual(tracker.heldStates.up, false);
assert.strictEqual(tracker.heldStates.down, false);
assert.strictEqual(tracker.heldStates.left, false);
assert.strictEqual(tracker.heldStates.right, false);
assert.strictEqual(tracker.heldStates.z, false);
console.log("PASS: FaceTrackerController lifecycle, sensitivity cycling, and key dispatching verified");

console.log("\n=========================================");
console.log("ALL FACE-CONTROL INTEGRATION TESTS PASSED");
console.log("=========================================\n");
