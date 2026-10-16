/**
 * In-Browser Webcam Facial Gesture Controller for DON'T WAKE THE DARK
 * Pure Vanilla JavaScript (Zero External Dependencies, 100% Offline)
 * 
 * Translates Head and Facial Gestures into 6-Key Input Actions:
 * - Head Up    -> ArrowUp    (Continuous Movement)
 * - Head Down  -> ArrowDown  (Continuous Movement)
 * - Head Left  -> ArrowLeft  (Continuous Movement / Menu Previous)
 * - Head Right -> ArrowRight (Continuous Movement / Menu Next)
 * - Open Mouth -> Z          (Start Game / Protective Ward / Restart)
 * - Eye Blink  -> Space      (Light Pulse Ability)
 */

class FaceTrackerController {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.stream = null;
    this.isActive = false;

    // Working internal resolution for PiP display & vision
    this.cw = 160;
    this.ch = 120;

    // Calibration baselines
    this.isCalibrating = false;
    this.calibrationFrames = 0;
    this.calibrationTarget = 25;
    this.calibData = {
      rSum: 0,
      gSum: 0,
      bSum: 0,
      lumSum: 0,
      xSum: 0,
      ySum: 0,
      mouthSum: 0,
      eyeSum: 0
    };

    this.calib = {
      neutralX: 80,
      neutralY: 60,
      rRatio: 0.42,
      gRatio: 0.33,
      meanLum: 110,
      mouthDarkness: 0.05,
      eyeBrightness: 95
    };

    // Filtered / smoothed position
    this.smoothedX = 80;
    this.smoothedY = 60;
    this.prevSmoothedX = 80;
    this.prevSmoothedY = 60;

    // Sensitivity profiles: NORMAL, HIGH, ULTRA
    this.sensitivity = 'HIGH';
    this.deadzones = {
      NORMAL: { x: 3.2, y: 2.6, mouthMult: 1.45, alpha: 0.28 },
      HIGH:   { x: 2.0, y: 1.6, mouthMult: 1.30, alpha: 0.38 },
      ULTRA:  { x: 1.4, y: 1.1, mouthMult: 1.20, alpha: 0.48 }
    };

    // State tracking for 6 game inputs
    this.heldStates = {
      up: false,
      down: false,
      left: false,
      right: false,
      z: false,
      space: false
    };

    // Blink detection
    this.prevEyeBrightness = 95;
    this.blinkCooldown = 0;

    // DOM UI elements
    this.ui = {
      btnToggle: null,
      statusPill: null,
      pipContainer: null,
      btnClose: null,
      btnCalibrate: null,
      btnSens: null,
      feedbackText: null,
      indUp: null,
      indDown: null,
      indLeft: null,
      indRight: null,
      indMouth: null,
      indBlink: null
    };

    this.initUI();
  }

  initUI() {
    if (typeof document === 'undefined') return;

    this.ui.btnToggle = document.getElementById('btn-toggle-cam');
    this.ui.btnQuickCam = document.getElementById('btn-quick-cam');
    this.ui.quickCamText = document.getElementById('quick-cam-text');
    this.ui.statusPill = document.getElementById('cam-status-pill');
    this.ui.pipContainer = document.getElementById('face-tracker-pip');
    this.ui.btnClose = document.getElementById('btn-pip-close');
    this.ui.btnCalibrate = document.getElementById('btn-pip-calibrate');
    this.ui.btnSens = document.getElementById('btn-pip-sens');
    this.ui.feedbackText = document.getElementById('pip-feedback');

    this.ui.indUp = document.getElementById('ind-up');
    this.ui.indDown = document.getElementById('ind-down');
    this.ui.indLeft = document.getElementById('ind-left');
    this.ui.indRight = document.getElementById('ind-right');
    this.ui.indMouth = document.getElementById('ind-mouth');
    this.ui.indBlink = document.getElementById('ind-blink');

    this.video = document.getElementById('face-video');
    this.canvas = document.getElementById('face-canvas');
    if (this.canvas && typeof this.canvas.getContext === 'function') {
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    if (this.ui.btnToggle) {
      this.ui.btnToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCamera();
      });
    }

    if (this.ui.btnQuickCam) {
      this.ui.btnQuickCam.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCamera();
      });
    }

    if (this.ui.btnClose) {
      this.ui.btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stopCamera();
      });
    }

    if (this.ui.btnCalibrate) {
      this.ui.btnCalibrate.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startCalibration();
      });
    }

    if (this.ui.btnSens) {
      this.ui.btnSens.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleSensitivity();
      });
    }

    // Interactive clickable testing on PiP indicators
    const makeClickable = (el, key, isHold = false) => {
      if (!el) return;
      el.style.cursor = 'pointer';
      el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.dispatchKey(key, true);
      });
      el.addEventListener('mouseup', (e) => {
        e.stopPropagation();
        this.dispatchKey(key, false);
      });
    };

    makeClickable(this.ui.indUp, 'ArrowUp', true);
    makeClickable(this.ui.indDown, 'ArrowDown', true);
    makeClickable(this.ui.indLeft, 'ArrowLeft', true);
    makeClickable(this.ui.indRight, 'ArrowRight', true);
    makeClickable(this.ui.indMouth, 'z', false);
    makeClickable(this.ui.indBlink, ' ', false);

    // Window blur safety
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', () => this.releaseAllHeldKeys());
    }
  }

  cycleSensitivity() {
    if (this.sensitivity === 'NORMAL') this.sensitivity = 'HIGH';
    else if (this.sensitivity === 'HIGH') this.sensitivity = 'ULTRA';
    else this.sensitivity = 'NORMAL';

    if (this.ui.btnSens) {
      this.ui.btnSens.textContent = `SENS: ${this.sensitivity}`;
    }
    this.setFeedback(`Sensitivity: ${this.sensitivity}`);
  }

  async toggleCamera() {
    if (this.isActive) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera() {
    // Protocol / origin check
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      this.setFeedback('Camera blocked on file:// URL. Please open http://localhost:8080', true);
      alert("Notice: Browsers block camera access on file:// URLs.\nPlease open http://localhost:8080 in your browser to use webcam face controls.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setFeedback('Camera API unavailable in this browser.', true);
      return;
    }

    try {
      this.setFeedback('Requesting camera permission...');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320, max: 640 },
          height: { ideal: 240, max: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (!this.video) {
        this.video = document.getElementById('face-video');
      }
      this.video.srcObject = this.stream;
      await this.video.play();

      this.isActive = true;
      if (this.ui.pipContainer) this.ui.pipContainer.classList.remove('hidden');
      if (this.ui.statusPill) {
        this.ui.statusPill.textContent = 'CAMERA ACTIVE';
        this.ui.statusPill.classList.add('active');
      }
      if (this.ui.btnToggle) {
        this.ui.btnToggle.classList.add('active');
        const textSpan = document.getElementById('cam-btn-text');
        if (textSpan) textSpan.textContent = 'STOP WEBCAM TRACKING';
      }
      if (this.ui.btnQuickCam) {
        this.ui.btnQuickCam.classList.add('active');
      }
      if (this.ui.quickCamText) {
        this.ui.quickCamText.textContent = 'FACE TRACKING: ON';
      }

      this.startCalibration();
      this.loop();
    } catch (err) {
      console.warn('Face tracker camera error:', err);
      let errMsg = 'Camera permission denied or camera in use.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Permission denied. Please allow camera in browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No webcam detected on your device.';
      }
      this.setFeedback(errMsg, true);
      if (this.ui.statusPill) {
        this.ui.statusPill.textContent = 'ACCESS DENIED';
        this.ui.statusPill.classList.remove('active');
      }
    }
  }

  stopCamera() {
    this.isActive = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.releaseAllHeldKeys();

    if (this.ui.pipContainer) this.ui.pipContainer.classList.add('hidden');
    if (this.ui.statusPill) {
      this.ui.statusPill.textContent = 'OFFLINE';
      this.ui.statusPill.classList.remove('active');
    }
    if (this.ui.btnToggle) {
      this.ui.btnToggle.classList.remove('active');
      const textSpan = document.getElementById('cam-btn-text');
      if (textSpan) textSpan.textContent = 'START WEBCAM FACE TRACKING';
    }
    if (this.ui.btnQuickCam) {
      this.ui.btnQuickCam.classList.remove('active');
    }
    if (this.ui.quickCamText) {
      this.ui.quickCamText.textContent = 'FACE CONTROLS: OFF';
    }
    this.setFeedback('Camera offline');
  }

  startCalibration() {
    this.isCalibrating = true;
    this.calibrationFrames = 0;
    this.calibData = {
      rSum: 0,
      gSum: 0,
      bSum: 0,
      lumSum: 0,
      xSum: 0,
      ySum: 0,
      mouthSum: 0,
      eyeSum: 0
    };
    this.setFeedback('Calibrating... Look directly at screen.');
  }

  setFeedback(msg, isError = false) {
    if (this.ui.feedbackText) {
      this.ui.feedbackText.textContent = msg;
      this.ui.feedbackText.style.color = isError ? '#ff2a4b' : '#38bdf8';
    }
  }

  loop() {
    if (!this.isActive) return;

    this.processFrame();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  processFrame() {
    if (!this.video || this.video.readyState < 2) return;
    if (!this.canvas || !this.ctx) return;

    const cw = this.cw;
    const ch = this.ch;

    // 1. Draw mirrored camera frame to Canvas
    this.ctx.save();
    this.ctx.translate(cw, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.video, 0, 0, cw, ch);
    this.ctx.restore();

    // 2. Read pixel buffer
    const frame = this.ctx.getImageData(0, 0, cw, ch);
    const data = frame.data;

    // 3. Multi-Cue Adaptive Centroid Estimation
    let weightedX = 0;
    let weightedY = 0;
    let totalWeight = 0;

    const minX = Math.floor(cw * 0.12);
    const maxX = Math.floor(cw * 0.88);
    const minY = Math.floor(ch * 0.10);
    const maxY = Math.floor(ch * 0.90);

    const refX = this.calib.neutralX;
    const refY = this.calib.neutralY;

    // Subsample step 2 for 60fps responsiveness
    for (let y = minY; y < maxY; y += 2) {
      for (let x = minX; x < maxX; x += 2) {
        const idx = (y * cw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const sum = r + g + b + 1;
        const lum = (r * 299 + g * 587 + b * 114) / 1000;

        if (sum > 40 && sum < 730) {
          const rn = r / sum;
          const gn = g / sum;

          // Color similarity against calibrated profile (skin-tone invariant)
          const dr = rn - this.calib.rRatio;
          const dg = gn - this.calib.gRatio;
          const colorDist = Math.sqrt(dr * dr + dg * dg);
          const colorMatch = Math.max(0, 1.0 - colorDist * 4.8);

          // Luminance closeness
          const lumDiff = Math.abs(lum - this.calib.meanLum);
          const lumMatch = Math.max(0.1, 1.0 - lumDiff / 170);

          // Spatial center Gaussian prior
          const dx = (x - refX) / (cw * 0.5);
          const dy = (y - refY) / (ch * 0.5);
          const spatialWeight = Math.max(0.12, 1.0 - (dx * dx + dy * dy) * 0.45);

          const w = (colorMatch * 0.65 + lumMatch * 0.35) * spatialWeight;
          if (w > 0.18) {
            weightedX += x * w;
            weightedY += y * w;
            totalWeight += w;
          }
        }
      }
    }

    let rawX = this.smoothedX;
    let rawY = this.smoothedY;
    if (totalWeight > 20) {
      rawX = weightedX / totalWeight;
      rawY = weightedY / totalWeight;
    }

    // Sensitivity-tuned temporal filter
    const currentCfg = this.deadzones[this.sensitivity] || this.deadzones.HIGH;
    const alpha = currentCfg.alpha;

    this.smoothedX = this.smoothedX * (1 - alpha) + rawX * alpha;
    this.smoothedY = this.smoothedY * (1 - alpha) + rawY * alpha;

    // 4. Measure Lower-Face / Mouth Zone Darkness
    const mouthX = Math.floor(this.smoothedX - 14);
    const mouthY = Math.floor(this.smoothedY + 12);
    let mouthDarkPixels = 0;
    let mouthTotalPixels = 0;
    const mouthLumCutoff = Math.max(25, this.calib.meanLum * 0.56);

    for (let my = mouthY; my < mouthY + 14 && my < ch; my++) {
      for (let mx = mouthX; mx < mouthX + 28 && mx < cw; mx++) {
        if (mx >= 0 && my >= 0) {
          const idx = (my * cw + mx) * 4;
          const lum = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
          if (lum < mouthLumCutoff) {
            mouthDarkPixels++;
          }
          mouthTotalPixels++;
        }
      }
    }
    const currentMouthDarkness = mouthTotalPixels > 0 ? (mouthDarkPixels / mouthTotalPixels) : 0;

    // 5. Measure Upper-Face / Eye Region Brightness
    const eyeX = Math.floor(this.smoothedX - 22);
    const eyeY = Math.floor(this.smoothedY - 14);
    let eyeLumSum = 0;
    let eyeTotalPixels = 0;

    for (let ey = eyeY; ey < eyeY + 10 && ey < ch; ey++) {
      for (let ex = eyeX; ex < eyeX + 44 && ex < cw; ex++) {
        if (ex >= 0 && ey >= 0) {
          const idx = (ey * cw + ex) * 4;
          eyeLumSum += (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
          eyeTotalPixels++;
        }
      }
    }
    const currentEyeBrightness = eyeTotalPixels > 0 ? (eyeLumSum / eyeTotalPixels) : 100;

    // 6. Handle Calibration Phase
    if (this.isCalibrating) {
      // Sample central ellipse
      const cx = Math.floor(cw / 2);
      const cy = Math.floor(ch / 2);
      let cr = 0, cg = 0, cb = 0, count = 0;

      for (let sy = cy - 14; sy <= cy + 14; sy++) {
        for (let sx = cx - 18; sx <= cx + 18; sx++) {
          const idx = (sy * cw + sx) * 4;
          cr += data[idx];
          cg += data[idx + 1];
          cb += data[idx + 2];
          count++;
        }
      }

      if (count > 0) {
        this.calibData.rSum += cr / count;
        this.calibData.gSum += cg / count;
        this.calibData.bSum += cb / count;
      }

      this.calibData.xSum += this.smoothedX;
      this.calibData.ySum += this.smoothedY;
      this.calibData.mouthSum += currentMouthDarkness;
      this.calibData.eyeSum += currentEyeBrightness;
      this.calibrationFrames++;

      if (this.calibrationFrames >= this.calibrationTarget) {
        const n = this.calibrationTarget;
        const meanR = this.calibData.rSum / n;
        const meanG = this.calibData.gSum / n;
        const meanB = this.calibData.bSum / n;
        const sumRGB = meanR + meanG + meanB + 1;

        this.calib.rRatio = meanR / sumRGB;
        this.calib.gRatio = meanG / sumRGB;
        this.calib.meanLum = (meanR * 299 + meanG * 587 + meanB * 114) / 1000;
        this.calib.neutralX = this.calibData.xSum / n;
        this.calib.neutralY = this.calibData.ySum / n;
        this.calib.mouthDarkness = Math.max(0.04, this.calibData.mouthSum / n);
        this.calib.eyeBrightness = this.calibData.eyeSum / n;
        this.prevEyeBrightness = this.calib.eyeBrightness;

        this.isCalibrating = false;
        this.setFeedback(`Calibrated! Steering Ready (${this.sensitivity})`);
      }

      this.renderOverlay(cw, ch, true, 0, 0, false, false);
      return;
    }

    // 7. Translate Head Displacements to Continuous Direction Keys
    const deltaX = this.smoothedX - this.calib.neutralX;
    const deltaY = this.smoothedY - this.calib.neutralY;

    const isHeadUp = deltaY < -currentCfg.y;
    const isHeadDown = deltaY > currentCfg.y;
    const isHeadLeft = deltaX < -currentCfg.x;
    const isHeadRight = deltaX > currentCfg.x;

    this.updateKeyHold('up', isHeadUp, 'ArrowUp');
    this.updateKeyHold('down', isHeadDown, 'ArrowDown');
    this.updateKeyHold('left', isHeadLeft, 'ArrowLeft');
    this.updateKeyHold('right', isHeadRight, 'ArrowRight');

    // 8. Open Mouth Detection (Z Key: Start / Ward / Restart)
    const mouthThreshold = Math.max(0.10, this.calib.mouthDarkness * currentCfg.mouthMult);
    const isMouthOpen = currentMouthDarkness > mouthThreshold;

    if (isMouthOpen && !this.heldStates.z) {
      this.heldStates.z = true;
      this.dispatchKey('z', true);
    } else if (!isMouthOpen && this.heldStates.z) {
      this.heldStates.z = false;
      this.dispatchKey('z', false);
    }

    // 9. Eye Blink Detection (Space Key: Light Pulse)
    let isBlinking = false;
    if (this.blinkCooldown > 0) {
      this.blinkCooldown--;
    } else {
      const eyeDiff = this.prevEyeBrightness - currentEyeBrightness;
      if (eyeDiff > 9 && currentEyeBrightness < this.calib.eyeBrightness * 0.92) {
        isBlinking = true;
        this.blinkCooldown = 18; // ~300ms debounce
        this.dispatchKey(' ', true);
        setTimeout(() => this.dispatchKey(' ', false), 140);
        if (this.ui.indBlink) {
          this.ui.indBlink.classList.add('active');
          setTimeout(() => this.ui.indBlink && this.ui.indBlink.classList.remove('active'), 250);
        }
      }
    }
    this.prevEyeBrightness = this.prevEyeBrightness * 0.75 + currentEyeBrightness * 0.25;

    // 10. Update UI Indicators
    this.updateIndicatorUI(isHeadUp, isHeadDown, isHeadLeft, isHeadRight, isMouthOpen);

    // 11. Render PiP Visual Reticle & Guidance
    this.renderOverlay(cw, ch, false, deltaX, deltaY, isMouthOpen, isBlinking);
  }

  dispatchKey(key, isDown) {
    const code = key === ' ' ? 'Space' : key === 'z' || key === 'Z' ? 'KeyZ' : key;

    // Send directly to centralized InputManager
    if (window.inputManager) {
      if (isDown) {
        window.inputManager.handleKeyDown({ key, code, repeat: false, preventDefault: () => {} });
      } else {
        window.inputManager.handleKeyUp({ key, code, preventDefault: () => {} });
      }
    }

    // Also dispatch synthetic KeyboardEvent on window
    try {
      const evt = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
        key,
        code,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(evt);
    } catch (_) {}
  }

  updateKeyHold(direction, isPressed, eventKey) {
    if (isPressed && !this.heldStates[direction]) {
      this.heldStates[direction] = true;
      this.dispatchKey(eventKey, true);
    } else if (!isPressed && this.heldStates[direction]) {
      this.heldStates[direction] = false;
      this.dispatchKey(eventKey, false);
    }
  }

  releaseAllHeldKeys() {
    ['up', 'down', 'left', 'right', 'z'].forEach((dir) => {
      if (this.heldStates[dir]) {
        this.heldStates[dir] = false;
        const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', z: 'z' };
        this.dispatchKey(keyMap[dir], false);
      }
    });
  }

  updateIndicatorUI(up, down, left, right, mouth) {
    if (this.ui.indUp) this.ui.indUp.classList.toggle('active', up);
    if (this.ui.indDown) this.ui.indDown.classList.toggle('active', down);
    if (this.ui.indLeft) this.ui.indLeft.classList.toggle('active', left);
    if (this.ui.indRight) this.ui.indRight.classList.toggle('active', right);
    if (this.ui.indMouth) this.ui.indMouth.classList.toggle('active', mouth);
  }

  renderOverlay(cw, ch, calibrating, deltaX, deltaY, mouthOpen, blinking) {
    if (!this.ctx) return;

    this.ctx.save();

    // 1. Neutral Anchor Crosshair
    const nx = this.calib.neutralX;
    const ny = this.calib.neutralY;

    this.ctx.strokeStyle = calibrating ? '#fbbf24' : 'rgba(255, 255, 255, 0.35)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([3, 3]);
    this.ctx.beginPath();
    this.ctx.moveTo(nx - 14, ny);
    this.ctx.lineTo(nx + 14, ny);
    this.ctx.moveTo(nx, ny - 14);
    this.ctx.lineTo(nx, ny + 14);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 2. Active Motion Vector Line
    const fx = this.smoothedX;
    const fy = this.smoothedY;

    if (!calibrating && (Math.abs(deltaX) > 1.5 || Math.abs(deltaY) > 1.5)) {
      this.ctx.strokeStyle = '#22c55e';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(nx, ny);
      this.ctx.lineTo(fx, fy);
      this.ctx.stroke();
    }

    // 3. Live Face Reticle
    const reticleColor = calibrating ? '#fbbf24' : mouthOpen ? '#ffd700' : blinking ? '#c084fc' : '#00f0ff';
    this.ctx.strokeStyle = reticleColor;
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = reticleColor;
    this.ctx.shadowBlur = 8;

    const rw = 28;
    const rh = 36;
    this.ctx.strokeRect(fx - rw / 2, fy - rh / 2, rw, rh);

    // Center Tracking Dot
    this.ctx.fillStyle = reticleColor;
    this.ctx.beginPath();
    this.ctx.arc(fx, fy, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Directional HUD Hints on Canvas
    if (!calibrating) {
      this.ctx.font = '9px "Rajdhani", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';

      if (mouthOpen) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillText('MOUTH (Z)', fx, fy + rh / 2 + 12);
      } else if (blinking) {
        this.ctx.fillStyle = '#c084fc';
        this.ctx.fillText('BLINK (SPC)', fx, fy - rh / 2 - 6);
      }
    } else {
      this.ctx.font = '10px "Rajdhani", sans-serif';
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('CALIBRATING...', cw / 2, 20);
    }

    this.ctx.restore();
  }
}

// Global Face Tracker Singleton
if (typeof window !== 'undefined') {
  window.faceTracker = new FaceTrackerController();
}
