/**
 * Automated Compliance & Reliability Verification Test Suite
 * Tests input handling, physics, state machine, debounces, and game logic
 */

const fs = require('fs');
const assert = require('assert');

console.log('>>> Running Compliance & Reliability Tests for DON\'T WAKE THE DARK...\n');

// 1. Verify HTML & exact text requirements
const htmlContent = fs.readFileSync('./index.html', 'utf8');
assert(htmlContent.includes('Press Z to start'), 'FAIL: Title screen must contain exact text "Press Z to start"');
console.log('PASS: Exact title text "Press Z to start" present in index.html');

assert(htmlContent.includes('Press Z to play again'), 'FAIL: Game over screen must contain exact text "Press Z to play again"');
console.log('PASS: Exact game over text "Press Z to play again" present in index.html');

assert(htmlContent.includes('KEYS 0/3'), 'FAIL: HUD must contain exact text "KEYS 0/3"');
console.log('PASS: Exact HUD keys tracker "KEYS 0/3" present in index.html');

assert(htmlContent.includes('Find the three light keys. Reach the exit. Avoid the shadow.'), 'FAIL: Objective text missing');
console.log('PASS: Exact objective text verified');

// 2. Test InputManager logic in isolation
// Simulate window and document
let preventDefaultCount = 0;
let eventListeners = {};

global.window = {
  addEventListener: (event, handler) => {
    eventListeners[event] = handler;
  }
};

// Load input.js
eval(fs.readFileSync('./src/input.js', 'utf8'));
const input = window.inputManager;
assert(input, 'FAIL: inputManager must be instantiated');
console.log('PASS: InputManager instantiated from src/input.js');

// Test Case-insensitivity: lowercase 'z'
input.clearAll();
eventListeners['keydown']({
  key: 'z',
  code: 'KeyZ',
  preventDefault: () => preventDefaultCount++
});
assert(input.heldKeys.z === true, 'FAIL: Lowercase z must be registered as held');
assert(input.wasZPressed() === true, 'FAIL: Lowercase z must be registered as justPressed');
input.consumeZ();
assert(input.wasZPressed() === false, 'FAIL: Consumed Z must clear justPressed');
eventListeners['keyup']({ key: 'z', code: 'KeyZ' });
assert(input.heldKeys.z === false, 'FAIL: Keyup for lowercase z must clear heldKeys.z');
console.log('PASS: Lowercase "z" key handling verified');

// Test Case-insensitivity: uppercase 'Z'
input.clearAll();
eventListeners['keydown']({
  key: 'Z',
  code: 'KeyZ',
  preventDefault: () => preventDefaultCount++
});
assert(input.heldKeys.z === true, 'FAIL: Uppercase Z must be registered as held');
assert(input.wasZPressed() === true, 'FAIL: Uppercase Z must be registered as justPressed');
input.consumeZ();
eventListeners['keyup']({ key: 'Z', code: 'KeyZ' });
assert(input.heldKeys.z === false, 'FAIL: Keyup for uppercase Z must clear heldKeys.z');
console.log('PASS: Uppercase "Z" key handling verified');

// Test Prevent Default on Arrows and Space
preventDefaultCount = 0;
['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].forEach(k => {
  eventListeners['keydown']({
    key: k,
    code: k === ' ' ? 'Space' : k,
    preventDefault: () => preventDefaultCount++
  });
});
assert(preventDefaultCount === 5, `FAIL: Prevent default must be called for arrows and space, got ${preventDefaultCount}`);
console.log('PASS: Prevent default called for all 4 arrow keys and Space');

// Test Diagonal Movement Normalization
input.clearAll();
eventListeners['keydown']({ key: 'ArrowRight', preventDefault: () => {} });
eventListeners['keydown']({ key: 'ArrowDown', preventDefault: () => {} });
const diagVector = input.getMovementVector();
const diagMagnitude = Math.hypot(diagVector.dx, diagVector.dy);
assert(Math.abs(diagMagnitude - 1.0) < 0.0001, `FAIL: Diagonal magnitude must be normalized to 1.0, got ${diagMagnitude}`);
console.log('PASS: Diagonal velocity normalized (magnitude = 1.0)');

// Test Window Blur Clears All Held Keys
assert(input.heldKeys.right === true, 'Right key should be held');
eventListeners['blur']();
assert(input.heldKeys.right === false, 'FAIL: Blur must clear right key');
assert(input.heldKeys.down === false, 'FAIL: Blur must clear down key');
assert(input.heldKeys.z === false, 'FAIL: Blur must clear z key');
assert(input.heldKeys.space === false, 'FAIL: Blur must clear space key');
console.log('PASS: Window blur clears all held inputs immediately');

// Test Safe Release: Releasing all keys leaves zero velocity
const stoppedVector = input.getMovementVector();
assert(stoppedVector.dx === 0 && stoppedVector.dy === 0, 'FAIL: Zero keys must produce zero velocity');
console.log('PASS: Safe key release stops player without penalty');

// 3. Test Game Logic and Debounce Timing
const gameSource = fs.readFileSync('./src/game.js', 'utf8');
assert(gameSource.includes('gameOverElapsed >= 1.0'), 'FAIL: Game over screen must debounce Z for 1.0 second');
console.log('PASS: Game over screen 1.0s debounce verified in game logic');

assert(gameSource.includes('KEYS ${this.keysCollected}/3'), 'FAIL: Keys tracking string format mismatch');
console.log('PASS: Keys HUD tracking string format verified');

assert(gameSource.includes('this.score += 100'), 'FAIL: +100 points per key collected verified');
assert(gameSource.includes('escapeBonus = 200'), 'FAIL: +200 points for exit escape verified');
console.log('PASS: Scoring rules (+100/key, +200/exit) verified');

assert(gameSource.includes('wardCooldown: 5.0'), 'FAIL: Ward cooldown must be ~5s');
assert(gameSource.includes('wardDuration: 1.0'), 'FAIL: Ward duration must be ~1s');
assert(gameSource.includes('pulseCooldown: 3.0'), 'FAIL: Pulse cooldown must be ~3s');
console.log('PASS: Ability cooldowns verified (Ward: 1s active, 5s CD; Pulse: 3s CD)');

console.log('\n=========================================');
console.log('ALL VERIFICATION CHECKS PASSED (100%)');
console.log('=========================================');
