/**
 * Centralized Input Management for DON'T WAKE THE DARK
 * Strictly handles exactly six keys:
 * - ArrowUp, ArrowDown, ArrowLeft, ArrowRight (and standard direction/WASD aliases)
 * - Z / z (Case-insensitive 'z' / 'Z' and Enter start/confirm)
 * - Space
 */

class InputManager {
  constructor() {
    this.heldKeys = {
      up: false,
      down: false,
      left: false,
      right: false,
      z: false,
      space: false
    };

    // Tracks single-frame / unconsumed fresh presses
    this.justPressed = {
      z: false,
      space: false,
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.initListeners();
  }

  initListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => this.handleKeyDown(e), { passive: false });
      window.addEventListener('keyup', (e) => this.handleKeyUp(e), { passive: false });
      window.addEventListener('blur', () => this.clearAll());
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (e) => this.handleKeyDown(e), { passive: false });
      document.addEventListener('keyup', (e) => this.handleKeyUp(e), { passive: false });
    }
  }

  isKeyUp(e) {
    const k = e.key;
    const c = e.code;
    const kc = e.keyCode;
    return k === 'ArrowUp' || k === 'Up' || c === 'ArrowUp' || kc === 38 ||
           k === 'w' || k === 'W' || c === 'KeyW' || c === 'Numpad8';
  }

  isKeyDown(e) {
    const k = e.key;
    const c = e.code;
    const kc = e.keyCode;
    return k === 'ArrowDown' || k === 'Down' || c === 'ArrowDown' || kc === 40 ||
           k === 's' || k === 'S' || c === 'KeyS' || c === 'Numpad2';
  }

  isKeyLeft(e) {
    const k = e.key;
    const c = e.code;
    const kc = e.keyCode;
    return k === 'ArrowLeft' || k === 'Left' || c === 'ArrowLeft' || kc === 37 ||
           k === 'a' || k === 'A' || c === 'KeyA' || c === 'Numpad4';
  }

  isKeyRight(e) {
    const k = e.key;
    const c = e.code;
    const kc = e.keyCode;
    return k === 'ArrowRight' || k === 'Right' || c === 'ArrowRight' || kc === 39 ||
           k === 'd' || k === 'D' || c === 'KeyD' || c === 'Numpad6';
  }

  isKeyZ(e) {
    const k = e.key;
    const c = e.code;
    const kc = e.keyCode;
    const w = e.which;
    return k === 'z' || k === 'Z' || c === 'KeyZ' || kc === 90 || w === 90 ||
           k === 'Enter' || c === 'Enter' || kc === 13;
  }

  isKeySpace(e) {
    const k = e.key;
    const c = e.code;
    const kc = e.keyCode;
    return k === ' ' || k === 'Spacebar' || c === 'Space' || kc === 32;
  }

  handleKeyDown(e) {
    if (!e) return;
    if (e._darkHandled) return;
    e._darkHandled = true;

    let prevent = false;
    const isRepeat = !!e.repeat;

    if (this.isKeyUp(e)) {
      if (!this.heldKeys.up && !isRepeat) {
        this.justPressed.up = true;
      }
      this.heldKeys.up = true;
      prevent = true;
    } else if (this.isKeyDown(e)) {
      if (!this.heldKeys.down && !isRepeat) {
        this.justPressed.down = true;
      }
      this.heldKeys.down = true;
      prevent = true;
    } else if (this.isKeyLeft(e)) {
      if (!this.heldKeys.left && !isRepeat) {
        this.justPressed.left = true;
      }
      this.heldKeys.left = true;
      prevent = true;
    } else if (this.isKeyRight(e)) {
      if (!this.heldKeys.right && !isRepeat) {
        this.justPressed.right = true;
      }
      this.heldKeys.right = true;
      prevent = true;
    } else if (this.isKeySpace(e)) {
      if (!this.heldKeys.space && !isRepeat) {
        this.justPressed.space = true;
      }
      this.heldKeys.space = true;
      prevent = true;
    } else if (this.isKeyZ(e)) {
      if (!this.heldKeys.z && !isRepeat) {
        this.justPressed.z = true;
      }
      this.heldKeys.z = true;
      prevent = true;
    }

    if (prevent && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    if (!e) return;
    if (e._darkUpHandled) return;
    e._darkUpHandled = true;

    if (this.isKeyUp(e)) {
      this.heldKeys.up = false;
    }
    if (this.isKeyDown(e)) {
      this.heldKeys.down = false;
    }
    if (this.isKeyLeft(e)) {
      this.heldKeys.left = false;
    }
    if (this.isKeyRight(e)) {
      this.heldKeys.right = false;
    }
    if (this.isKeySpace(e)) {
      this.heldKeys.space = false;
    }
    if (this.isKeyZ(e)) {
      this.heldKeys.z = false;
    }
  }

  /**
   * Resets all key states on window blur or screen transition.
   */
  clearAll() {
    this.heldKeys.up = false;
    this.heldKeys.down = false;
    this.heldKeys.left = false;
    this.heldKeys.right = false;
    this.heldKeys.z = false;
    this.heldKeys.space = false;

    this.justPressed.z = false;
    this.justPressed.space = false;
    this.justPressed.left = false;
    this.justPressed.right = false;
    this.justPressed.up = false;
    this.justPressed.down = false;
  }

  /**
   * Returns normalized movement vector (dx, dy) with magnitude <= 1.
   */
  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.heldKeys.left) dx -= 1;
    if (this.heldKeys.right) dx += 1;
    if (this.heldKeys.up) dy -= 1;
    if (this.heldKeys.down) dy += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const invMag = 1 / Math.SQRT2;
      dx *= invMag;
      dy *= invMag;
    }

    return { dx, dy };
  }

  /**
   * Checks if Z was freshly pressed since last consume.
   */
  wasZPressed() {
    return this.justPressed.z;
  }

  /**
   * Consumes the Z press so it cannot trigger multiple actions.
   */
  consumeZ() {
    this.justPressed.z = false;
  }

  /**
   * Checks if Space was freshly pressed since last consume.
   */
  wasSpacePressed() {
    return this.justPressed.space;
  }

  /**
   * Consumes the Space press.
   */
  consumeSpace() {
    this.justPressed.space = false;
  }

  wasLeftPressed() {
    return this.justPressed.left;
  }

  consumeLeft() {
    this.justPressed.left = false;
  }

  wasRightPressed() {
    return this.justPressed.right;
  }

  consumeRight() {
    this.justPressed.right = false;
  }

  wasUpPressed() {
    return this.justPressed.up;
  }

  consumeUp() {
    this.justPressed.up = false;
  }

  wasDownPressed() {
    return this.justPressed.down;
  }

  consumeDown() {
    this.justPressed.down = false;
  }

  /**
   * Checks if Z is currently held down.
   */
  isZHeld() {
    return this.heldKeys.z;
  }

  /**
   * Checks if Space is currently held down.
   */
  isSpaceHeld() {
    return this.heldKeys.space;
  }
}

// Global input singleton
if (typeof window !== 'undefined') {
  window.inputManager = new InputManager();
}

