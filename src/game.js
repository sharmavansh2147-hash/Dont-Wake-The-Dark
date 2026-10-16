/**
 * DON'T WAKE THE DARK — Core Game Engine
 * 
 * Signature Mechanics:
 * 1. The Observatory Remembers:
 *    - Light Pulse reveals shadow's past as fading ethereal afterimages.
 *    - Progressive restoration of the 12-star celestial constellation with each key.
 *    - Completed constellation casts a luminous guiding path to the exit.
 * 2. Third-Key Finale:
 *    - One-time cinematic event: ambient eclipse, shadow silhouette reveal,
 *      constellation flare, and exit unlocking with zero player control loss.
 * 3. Polished Feedback:
 *    - Ward hexagonal forcefield, pulse shockwave & knockback, damage i-frames,
 *      key collection dissolution, and exit portal vortex.
 * 4. Atmospheric Observatory Environment:
 *    - Circular astrolabe star charts, telescope silhouettes, drifting fog, and tier themes.
 * 5. Player-Controlled Chamber Progression:
 *    - Reaching the exit presents Chamber Cleared modal; player decides when to press Z to advance!
 * 6. Strictly Six Keys: ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Z, Space.
 */

// --- Difficulty Tiers Definition (100 Total Levels) ---
const TIERS = [
  {
    id: 'EASY',
    name: 'EASY',
    title: 'The Courtyard',
    totalLevels: 30,
    shadowCount: 1,
    keyCount: 3,
    color: '#00f0ff',
    baseEnemySpeed: 82,
    maxEnemySpeed: 108,
    playerLightRadius: 155,
    floorColor: '#05121c',
    gridColor: 'rgba(0, 240, 255, 0.06)',
    wallColor: 'rgba(0, 240, 255, 0.5)'
  },
  {
    id: 'MEDIUM',
    name: 'MEDIUM',
    title: 'The Archives',
    totalLevels: 25,
    shadowCount: 1,
    keyCount: 4,
    color: '#ffaa00',
    baseEnemySpeed: 112,
    maxEnemySpeed: 142,
    playerLightRadius: 140,
    floorColor: '#090e1b',
    gridColor: 'rgba(255, 170, 0, 0.05)',
    wallColor: 'rgba(255, 170, 0, 0.5)'
  },
  {
    id: 'HARD',
    name: 'HARD',
    title: 'The Void Rotunda',
    totalLevels: 25,
    shadowCount: 2,
    keyCount: 4,
    color: '#ff2a4b',
    baseEnemySpeed: 88,
    maxEnemySpeed: 114,
    playerLightRadius: 125,
    floorColor: '#120509',
    gridColor: 'rgba(255, 42, 75, 0.06)',
    wallColor: 'rgba(255, 42, 75, 0.5)'
  },
  {
    id: 'ULTRA_HARD',
    name: 'ULTRA HARD',
    title: 'Singularity Core',
    totalLevels: 20,
    shadowCount: 2,
    keyCount: 5,
    color: '#c026d3',
    baseEnemySpeed: 124,
    maxEnemySpeed: 154,
    playerLightRadius: 110,
    floorColor: '#0f0417',
    gridColor: 'rgba(192, 38, 211, 0.07)',
    wallColor: 'rgba(192, 38, 211, 0.6)'
  }
];

if (typeof window !== 'undefined') {
  window.TIERS = TIERS;
}

// --- Procedural Web Audio Synthesizer ---
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.droneOsc = null;
    this.droneGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startAmbientDrone();
  }

  startAmbientDrone() {
    if (!this.ctx || this.droneOsc) return;
    try {
      this.droneOsc = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();
      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1 sub-bass
      this.droneGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
      this.droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);
      this.droneOsc.start();
    } catch (_) {}
  }

  stopAmbientDrone() {
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (_) {}
      this.droneOsc = null;
    }
  }

  playBlip() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (_) {}
  }

  playKeyCollect() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (_) {}
  }

  playWard() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch (_) {}
  }

  playPulse() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (_) {}
  }

  playHit() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (_) {}
  }

  playUnlock() {
    if (!this.ctx) return;
    try {
      [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.22, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.45);
      });
    } catch (_) {}
  }

  playChamberClear() {
    if (!this.ctx) return;
    try {
      [587.33, 739.99, 880, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch (_) {}
  }

  playVictory() {
    if (!this.ctx) return;
    try {
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.15);
        osc.stop(this.ctx.currentTime + idx * 0.15 + 0.6);
      });
    } catch (_) {}
  }
}

// --- Main Game Engine ---
class DarkGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Overlays & UI Elements
    this.ui = {
      hud: document.getElementById('hud'),
      titleScreen: document.getElementById('screen-title'),
      victoryScreen: document.getElementById('screen-victory'),
      gameoverScreen: document.getElementById('screen-gameover'),
      chamberClearedScreen: document.getElementById('screen-chamber-cleared'),
      hearts: document.querySelectorAll('.heart'),
      levelDisplay: document.getElementById('level-display'),
      levelProgressFill: document.getElementById('level-progress-fill'),
      keysDisplay: document.getElementById('keys-display'),
      timerDisplay: document.getElementById('timer-display'),
      scoreDisplay: document.getElementById('score-display'),
      wardMeter: document.getElementById('ward-meter'),
      wardStatus: document.getElementById('ward-status'),
      wardCard: document.getElementById('ward-card'),
      pulseMeter: document.getElementById('pulse-meter'),
      pulseStatus: document.getElementById('pulse-status'),
      pulseCard: document.getElementById('pulse-card'),
      gameoverCause: document.getElementById('gameover-cause'),
      gameoverScore: document.getElementById('gameover-final-score'),
      gameoverLevelReached: document.getElementById('gameover-level-reached'),
      gameoverPrompt: document.getElementById('gameover-prompt'),
      vicTierBadge: document.getElementById('vic-tier-badge'),
      vicTierName: document.getElementById('vic-tier-name'),
      vicKeysScore: document.getElementById('vic-keys-score'),
      vicEscapeBonus: document.getElementById('vic-escape-bonus'),
      vicTimeBonus: document.getElementById('vic-time-bonus'),
      vicFinalScore: document.getElementById('vic-final-score'),
      clearedTitle: document.getElementById('cleared-title'),
      clearedSub: document.getElementById('cleared-sub'),
      clearedBonus: document.getElementById('cleared-bonus'),
      clearedPrompt: document.getElementById('cleared-prompt'),
      tierCards: document.querySelectorAll('.tier-card')
    };

    this.sound = new SoundSynth();

    // States: TITLE, PLAYING, CHAMBER_CLEARED, VICTORY, GAME_OVER
    this.state = 'TITLE';
    this.gameOverElapsed = 0; // 1.0s debounce on Game Over
    this.titleDebounce = 0; // Initial load: 0 so first Z press starts instantly!
    this.zMustReleaseBeforeStart = false;

    // Window focus tracking & anti-frustration
    this.isWindowFocused = true;

    // Tier & Level Progression
    this.selectedTierIndex = 0;
    this.currentTier = TIERS[0];
    this.currentLevel = 1;

    // Arena Boundaries
    this.arena = {
      x: 40,
      y: 40,
      width: this.width - 80,
      height: this.height - 80
    };

    // Constellation Center
    this.constellationCenter = {
      x: this.arena.x + this.arena.width * 0.48,
      y: this.arena.y + this.arena.height * 0.5
    };

    // Systems
    this.particles = [];
    this.floatingTexts = [];
    this.initFogParticles();
    this.initConstellationNodes();

    // Shadow Past History (Feature 1-A)
    this.enemyHistory = [];
    this.enemyHistoryTimer = 0;
    this.shadowTrailTimer = 0;

    // Third-Key Finale System (Feature 2)
    this.thirdKeyFinaleTriggered = false;
    this.finaleTimer = 0;

    // Exit Level / Abandon Chamber (Hold Z for 2.0s)
    this.exitHoldTimer = 0;
    this.zHeldTime = 0;

    // Screen Shake
    this.screenShakeTime = 0;
    this.screenShakeMagnitude = 0;

    // Focus & click handling
    this.initFocusAndClickHandling();

    // Reset Game State variables
    this.resetGameState();

    // Game loop timing
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initFocusAndClickHandling() {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => { this.isWindowFocused = true; });
      window.addEventListener('blur', () => { this.isWindowFocused = false; });
      window.addEventListener('click', () => {
        this.isWindowFocused = true;
        if (this.canvas && this.canvas.focus) this.canvas.focus();
        if (this.state === 'TITLE') {
          // Allow clicking anywhere to start game
          window.inputManager.justPressed.z = true;
        }
      });
      window.addEventListener('pointerdown', () => {
        this.isWindowFocused = true;
        if (this.canvas && this.canvas.focus) this.canvas.focus();
      });
    }

    if (this.canvas) {
      this.canvas.setAttribute('tabindex', '0');
      if (this.canvas.focus) this.canvas.focus();
    }

    // Enable clicking directly on Tier Cards
    if (this.ui && this.ui.tierCards) {
      this.ui.tierCards.forEach((card, idx) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectedTierIndex = idx;
          this.sound.init();
          this.sound.playBlip();
          this.updateTierSelectionUI();
        });
      });
    }

    // Enable clicking on Chamber Cleared action cards
    const nextCard = document.getElementById('cleared-next-card');
    if (nextCard) {
      nextCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.state === 'CHAMBER_CLEARED') {
          window.inputManager.justPressed.z = true;
        }
      });
    }

    const menuCard = document.getElementById('cleared-menu-card');
    if (menuCard) {
      menuCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.state === 'CHAMBER_CLEARED') {
          this.sound.playBlip();
          this.switchState('TITLE');
        }
      });
    }
  }

  initFogParticles() {
    this.ambientFog = [];
    for (let i = 0; i < 45; i++) {
      this.ambientFog.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 12 + Math.random() * 26,
        alpha: 0.05 + Math.random() * 0.1,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8
      });
    }
  }

  initConstellationNodes() {
    const cx = this.constellationCenter.x;
    const cy = this.constellationCenter.y;

    // 12 Stars arranged in 3 celestial clusters
    this.constellationStars = [
      // Cluster 1 (Key 1: The Northern Wing)
      { id: 0, cluster: 1, x: cx - 110, y: cy - 65, size: 4 },
      { id: 1, cluster: 1, x: cx - 55, y: cy - 105, size: 5 },
      { id: 2, cluster: 1, x: cx + 25, y: cy - 85, size: 4.5 },
      { id: 3, cluster: 1, x: cx - 35, y: cy - 35, size: 4 },

      // Cluster 2 (Key 2: The Celestial Cross)
      { id: 4, cluster: 2, x: cx + 75, y: cy - 45, size: 4.5 },
      { id: 5, cluster: 2, x: cx + 120, y: cy + 10, size: 5 },
      { id: 6, cluster: 2, x: cx + 65, y: cy + 75, size: 4 },
      { id: 7, cluster: 2, x: cx + 20, y: cy + 20, size: 4 },

      // Cluster 3 (Key 3: The Astral Anchor & Core)
      { id: 8, cluster: 3, x: cx - 75, y: cy + 45, size: 4 },
      { id: 9, cluster: 3, x: cx - 40, y: cy + 100, size: 4.5 },
      { id: 10, cluster: 3, x: cx + 15, y: cy + 90, size: 5 },
      { id: 11, cluster: 3, x: cx, y: cy, size: 6 } // Alpha Core Star
    ];

    // Astrological connecting lines
    this.constellationLines = [
      // Cluster 1 lines
      { from: 0, to: 1, cluster: 1 },
      { from: 1, to: 2, cluster: 1 },
      { from: 2, to: 3, cluster: 1 },
      { from: 3, to: 0, cluster: 1 },

      // Cluster 2 lines
      { from: 4, to: 5, cluster: 2 },
      { from: 5, to: 6, cluster: 2 },
      { from: 6, to: 7, cluster: 2 },
      { from: 7, to: 4, cluster: 2 },

      // Cluster 3 lines
      { from: 8, to: 9, cluster: 3 },
      { from: 9, to: 10, cluster: 3 },
      { from: 10, to: 11, cluster: 3 },
      { from: 11, to: 8, cluster: 3 },

      // Inter-cluster bridges (complete constellation)
      { from: 3, to: 11, cluster: 3 },
      { from: 7, to: 11, cluster: 3 }
    ];
  }

  resetGameState() {
    this.floatingTexts = [];
    this.enemyHistory = [];
    this.enemyHistoryTimer = 0;
    this.shadowTrailTimer = 0;
    this.thirdKeyFinaleTriggered = false;
    this.finaleTimer = 0;
    this.exitHoldTimer = 0;
    this.zHeldTime = 0;

    // Player: Lantern Keeper
    this.player = {
      x: this.arena.x + 90,
      y: this.arena.y + this.arena.height - 70,
      radius: 16,
      speed: 185,
      health: 3,
      maxHealth: 3,
      invulnTime: 0,
      invulnDuration: 1.2,
      lightRadius: this.currentTier.playerLightRadius,
      wardActive: false,
      wardDuration: 1.0, // 1s active duration
      wardTimer: 0,
      wardCooldown: 5.0, // 5s cooldown
      wardCooldownTimer: 0,
      pulseActive: false,
      pulseRadius: 0,
      pulseMaxRadius: 230,
      pulseSpeed: 420,
      pulseCooldown: 3.0, // 3s cooldown
      pulseCooldownTimer: 0
    };

    // Shadow Creature(s)
    this.enemy = {
      id: 0,
      x: this.arena.x + this.arena.width - 90,
      y: this.arena.y + 70,
      radius: 22,
      baseSpeed: this.currentTier.baseEnemySpeed,
      currentSpeed: this.currentTier.baseEnemySpeed,
      maxSpeed: this.currentTier.maxEnemySpeed,
      repelVx: 0,
      repelVy: 0,
      stunTimer: 0,
      pulseAngle: 0,
      smokeTimer: 0
    };
    this.enemies = [this.enemy];

    // Metrics
    this.keysCollected = 0;
    this.score = 0;
    this.timeRemaining = 180.0;
    this.deathCause = '';
    this.particles = [];
    this.gameOverElapsed = 0;
    this.screenShakeTime = 0;

    this.initLevel(this.currentLevel);
  }

  initLevel(levelNumber) {
    this.keysCollected = 0;
    this.thirdKeyFinaleTriggered = false;
    this.finaleTimer = 0;
    this.exitHoldTimer = 0;
    this.zHeldTime = 0;

    // Single Exit Portal
    this.exit = {
      x: this.arena.x + this.arena.width - 40,
      y: this.arena.y + this.arena.height / 2,
      width: 44,
      height: 64,
      unlocked: false,
      unlockAnimationTimer: 0
    };

    // Position player safely in bottom-left
    this.player.x = this.arena.x + 90;
    this.player.y = this.arena.y + this.arena.height - 70;

    // Scale enemy speed according to current level progress within the tier
    const tierProgress = (levelNumber - 1) / Math.max(1, this.currentTier.totalLevels - 1);
    const calculatedSpeed = this.currentTier.baseEnemySpeed + (this.currentTier.maxEnemySpeed - this.currentTier.baseEnemySpeed) * tierProgress;

    // Position primary shadow safely in top-right
    this.enemy.x = this.arena.x + this.arena.width - 90;
    this.enemy.y = this.arena.y + 70;
    this.enemy.repelVx = 0;
    this.enemy.repelVy = 0;
    this.enemy.stunTimer = 0;
    this.enemy.baseSpeed = calculatedSpeed;
    this.enemy.currentSpeed = this.enemy.baseSpeed;
    this.enemy.id = 0;

    // Build enemies array: 1 shadow for Easy & Medium, 2 shadows for Hard & Ultra Hard
    const shadowCount = this.currentTier.shadowCount || 1;
    this.enemies = [this.enemy];

    if (shadowCount >= 2) {
      this.enemies.push({
        id: 1,
        x: this.arena.x + 90,
        y: this.arena.y + 70, // Top-left: safely distant from player in bottom-left
        radius: 22,
        baseSpeed: calculatedSpeed,
        currentSpeed: calculatedSpeed,
        maxSpeed: this.currentTier.maxEnemySpeed,
        repelVx: 0,
        repelVy: 0,
        stunTimer: 0,
        pulseAngle: Math.PI,
        smokeTimer: 0.02
      });
    }

    // Clear and seed enemy history
    this.enemyHistory = [];
    this.enemyHistory.push({ x: this.enemy.x, y: this.enemy.y, timestamp: performance.now() });

    // Procedural key placements seeded by levelNumber across fair quadrants
    const keyCount = this.currentTier ? (this.currentTier.keyCount || 3) : 3;
    const a1 = (levelNumber * 1.35) % (Math.PI * 2);
    const a2 = (levelNumber * 2.12 + 2.1) % (Math.PI * 2);
    const a3 = (levelNumber * 1.74 + 4.2) % (Math.PI * 2);
    const a4 = (levelNumber * 2.45 + 1.1) % (Math.PI * 2);
    const a5 = (levelNumber * 1.88 + 3.3) % (Math.PI * 2);

    const k1x = Math.max(this.arena.x + 45, Math.min(this.arena.x + this.arena.width * 0.45, this.arena.x + this.arena.width * 0.28 + Math.cos(a1) * 60));
    const k1y = Math.max(this.arena.y + 45, Math.min(this.arena.y + this.arena.height * 0.48, this.arena.y + this.arena.height * 0.28 + Math.sin(a1) * 50));

    const k2x = Math.max(this.arena.x + this.arena.width * 0.55, Math.min(this.arena.x + this.arena.width - 55, this.arena.x + this.arena.width * 0.78 + Math.cos(a2) * 55));
    const k2y = Math.max(this.arena.y + 45, Math.min(this.arena.y + this.arena.height * 0.5, this.arena.y + this.arena.height * 0.3 + Math.sin(a2) * 50));

    const k3x = Math.max(this.arena.x + 60, Math.min(this.arena.x + this.arena.width - 60, this.arena.x + this.arena.width * 0.5 + Math.cos(a3) * 110));
    const k3y = Math.max(this.arena.y + this.arena.height * 0.65, Math.min(this.arena.y + this.arena.height - 45, this.arena.y + this.arena.height * 0.82 + Math.sin(a3) * 35));

    const k4x = Math.max(this.arena.x + 55, Math.min(this.arena.x + this.arena.width - 55, this.arena.x + this.arena.width * 0.52 + Math.cos(a4) * 75));
    const k4y = Math.max(this.arena.y + 55, Math.min(this.arena.y + this.arena.height - 55, this.arena.y + this.arena.height * 0.46 + Math.sin(a4) * 60));

    const k5x = Math.max(this.arena.x + 55, Math.min(this.arena.x + this.arena.width - 55, this.arena.x + this.arena.width * 0.74 + Math.cos(a5) * 65));
    const k5y = Math.max(this.arena.y + 55, Math.min(this.arena.y + this.arena.height - 55, this.arena.y + this.arena.height * 0.70 + Math.sin(a5) * 45));

    const allKeyDefs = [
      { id: 1, x: k1x, y: k1y, radius: 14, collected: false, bobPhase: 0, revealedTimer: 0 },
      { id: 2, x: k2x, y: k2y, radius: 14, collected: false, bobPhase: 2.1, revealedTimer: 0 },
      { id: 3, x: k3x, y: k3y, radius: 14, collected: false, bobPhase: 4.2, revealedTimer: 0 },
      { id: 4, x: k4x, y: k4y, radius: 14, collected: false, bobPhase: 1.4, revealedTimer: 0 },
      { id: 5, x: k5x, y: k5y, radius: 14, collected: false, bobPhase: 3.5, revealedTimer: 0 }
    ];

    this.keys = allKeyDefs.slice(0, keyCount);

    this.updateHUD();
  }

  updateTierSelectionUI() {
    this.ui.tierCards.forEach((card, idx) => {
      card.classList.toggle('active', idx === this.selectedTierIndex);
    });
  }

  switchState(newState) {
    this.state = newState;
    window.inputManager.clearAll();

    this.ui.titleScreen.classList.toggle('hidden', newState !== 'TITLE');
    this.ui.hud.classList.toggle('hidden', newState !== 'PLAYING');
    this.ui.victoryScreen.classList.toggle('hidden', newState !== 'VICTORY');
    this.ui.gameoverScreen.classList.toggle('hidden', newState !== 'GAME_OVER');
    this.ui.chamberClearedScreen.classList.toggle('hidden', newState !== 'CHAMBER_CLEARED');

    if (newState === 'TITLE') {
      this.titleDebounce = 0.8;
      this.zMustReleaseBeforeStart = window.inputManager.isZHeld();
      this.sound.stopAmbientDrone();
      this.updateTierSelectionUI();
    } else if (newState === 'GAME_OVER') {
      this.gameOverElapsed = 0;
      this.ui.gameoverCause.textContent = this.deathCause;
      this.ui.gameoverScore.textContent = this.score;
      this.ui.gameoverLevelReached.textContent = `${this.currentTier.name} Chamber ${this.currentLevel} of ${this.currentTier.totalLevels}`;
      this.ui.gameoverPrompt.style.opacity = '0.4';
    } else if (newState === 'CHAMBER_CLEARED') {
      this.sound.playChamberClear();
      this.ui.clearedTitle.textContent = `CHAMBER ${String(this.currentLevel).padStart(2, '0')} CLEARED!`;
      this.ui.clearedSub.textContent = `All 3 Light Keys Restored. Observatory Astrolabe Realigned.`;
      this.ui.clearedBonus.textContent = `+200 ESCAPE BONUS • +1 HP RESTORED • +35s TIME`;
      this.ui.clearedPrompt.textContent = `Press Z to enter Chamber ${this.currentLevel + 1}`;
    } else if (newState === 'VICTORY') {
      this.ui.vicTierBadge.textContent = `${this.currentTier.name} ESCAPE CONQUERED`;
      this.ui.vicTierName.textContent = `${this.currentTier.name} (${this.currentTier.totalLevels}/${this.currentTier.totalLevels} Chambers Cleared)`;
      this.ui.vicKeysScore.textContent = `+${this.keysCollected * 100}`;
      this.ui.vicEscapeBonus.textContent = `+200`;
      this.ui.vicTimeBonus.textContent = `+${Math.floor(this.timeRemaining)}`;
      this.ui.vicFinalScore.textContent = `${this.score}`;
      this.sound.playVictory();
    }
  }

  // --- Main Animation Frame Loop ---
  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // --- Update Logic by State ---
  update(dt) {
    // Ambient fog particles
    for (const fog of this.ambientFog) {
      fog.x += fog.vx * dt;
      fog.y += fog.vy * dt;
      if (fog.x < 0) fog.x = this.width;
      if (fog.x > this.width) fog.x = 0;
      if (fog.y < 0) fog.y = this.height;
      if (fog.y > this.height) fog.y = 0;
    }

    // Screen shake
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    // Dynamic particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / ft.maxLife);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Light Pulse Shadow Trail timer (Feature 1-A)
    if (this.shadowTrailTimer > 0) {
      this.shadowTrailTimer -= dt;
    }

    // Third-Key Finale timer (Feature 2)
    if (this.finaleTimer > 0) {
      this.finaleTimer -= dt;
    }

    switch (this.state) {
      case 'TITLE':
        this.updateTitle(dt);
        break;
      case 'PLAYING':
        this.updatePlaying(dt);
        break;
      case 'CHAMBER_CLEARED':
        this.updateChamberCleared();
        break;
      case 'VICTORY':
        this.updateVictory();
        break;
      case 'GAME_OVER':
        this.updateGameOver(dt);
        break;
    }
  }

  updateTitle(dt) {
    this.titleTime = (this.titleTime || 0) + dt;
    if (this.titleDebounce > 0) {
      this.titleDebounce -= dt;
    }

    // Require physical release of Z if held from previous screen
    if (this.zMustReleaseBeforeStart) {
      if (!window.inputManager.isZHeld()) {
        this.zMustReleaseBeforeStart = false;
      }
      window.inputManager.consumeZ();
    }

    // Roaming shadow creature in background
    const cx = this.arena.x + this.arena.width / 2;
    const cy = this.arena.y + this.arena.height / 2;
    const orbitT = this.titleTime * 0.45;
    this.enemy.x = cx + Math.cos(orbitT) * (this.arena.width * 0.38);
    this.enemy.y = cy + Math.sin(orbitT * 1.3) * (this.arena.height * 0.32);
    this.enemy.pulseAngle += dt * 3;

    // Center lantern
    this.player.x = cx;
    this.player.y = cy;

    // Arrow Left / Right / Up / Down to cycle difficulty tier
    if (window.inputManager.wasLeftPressed() || window.inputManager.wasUpPressed()) {
      window.inputManager.consumeLeft();
      window.inputManager.consumeUp();
      this.selectedTierIndex = (this.selectedTierIndex - 1 + TIERS.length) % TIERS.length;
      this.sound.init();
      this.sound.playBlip();
      this.updateTierSelectionUI();
    }
    if (window.inputManager.wasRightPressed() || window.inputManager.wasDownPressed()) {
      window.inputManager.consumeRight();
      window.inputManager.consumeDown();
      this.selectedTierIndex = (this.selectedTierIndex + 1) % TIERS.length;
      this.sound.init();
      this.sound.playBlip();
      this.updateTierSelectionUI();
    }

    // Z to start - strictly debounced & release-protected
    if (!this.zMustReleaseBeforeStart && (!this.titleDebounce || this.titleDebounce <= 0)) {
      if (window.inputManager.wasZPressed()) {
        window.inputManager.consumeZ();
        this.sound.init();
        this.currentTier = TIERS[this.selectedTierIndex];
        this.currentLevel = 1;
        this.resetGameState();
        this.switchState('PLAYING');
      }
    } else {
      window.inputManager.consumeZ();
    }
  }

  // --- User Controls Chamber Advance (NOT Automatic!) ---
  updateChamberCleared() {
    // Arrow Keys or Space to return to Title / Main Menu!
    if (window.inputManager.wasLeftPressed() || window.inputManager.wasRightPressed() ||
        window.inputManager.wasUpPressed() || window.inputManager.wasDownPressed() ||
        window.inputManager.wasSpacePressed()) {
      window.inputManager.consumeLeft();
      window.inputManager.consumeRight();
      window.inputManager.consumeUp();
      window.inputManager.consumeDown();
      window.inputManager.consumeSpace();
      this.sound.playBlip();
      this.switchState('TITLE');
      return;
    }

    if (window.inputManager.wasZPressed()) {
      window.inputManager.consumeZ();
      // Heal 1 HP if damaged
      if (this.player.health < 3) {
        this.player.health += 1;
      }
      // Grant bonus survival time
      this.timeRemaining = Math.min(180, this.timeRemaining + 35);

      this.currentLevel += 1;
      this.initLevel(this.currentLevel);
      this.switchState('PLAYING');
    }
  }

  updateVictory() {
    // Arrow Left / Right to return to Title / Difficulty Menu
    if (window.inputManager.wasLeftPressed() || window.inputManager.wasRightPressed()) {
      window.inputManager.consumeLeft();
      window.inputManager.consumeRight();
      this.switchState('TITLE');
      return;
    }

    if (window.inputManager.wasZPressed()) {
      window.inputManager.consumeZ();
      this.resetGameState();
      this.switchState('PLAYING');
    }
  }

  updateGameOver(dt) {
    this.gameOverElapsed += dt;

    if (this.gameOverElapsed >= 1.0) {
      this.ui.gameoverPrompt.style.opacity = '1.0';

      // Arrow Left / Right to return to Title / Difficulty Selection Menu!
      if (window.inputManager.wasLeftPressed() || window.inputManager.wasRightPressed()) {
        window.inputManager.consumeLeft();
        window.inputManager.consumeRight();
        this.switchState('TITLE');
        return;
      }

      if (window.inputManager.wasZPressed()) {
        window.inputManager.consumeZ();
        this.resetGameState();
        this.switchState('PLAYING');
      }
    } else {
      if (window.inputManager.wasZPressed()) {
        window.inputManager.consumeZ();
      }
    }
  }

  updatePlaying(dt) {
    // 1. Timer Countdown
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.deathCause = 'The darkness consumed the observatory. Time expired.';
      this.sound.playHit();
      this.switchState('GAME_OVER');
      return;
    }

    // 2. Player Movement
    const { dx, dy } = window.inputManager.getMovementVector();
    this.player.x += dx * this.player.speed * dt;
    this.player.y += dy * this.player.speed * dt;

    const minX = this.arena.x + this.player.radius;
    const maxX = this.arena.x + this.arena.width - this.player.radius;
    const minY = this.arena.y + this.player.radius;
    const maxY = this.arena.y + this.arena.height - this.player.radius;
    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
    this.player.y = Math.max(minY, Math.min(maxY, this.player.y));

    if (dx !== 0 || dy !== 0) {
      if (Math.random() < 0.25) {
        this.spawnParticle(this.player.x, this.player.y, this.currentTier.color, 0.45, 3);
      }
    }

    // 3. Invulnerability frames
    if (this.player.invulnTime > 0) {
      this.player.invulnTime -= dt;
    }

    // 4. Ability: Protective Ward (Z) & Exit Level (Hold Z for 1.5s)
    // Clean Separation: Quick tap (<0.3s) triggers Shield on release;
    // Holding (>0.3s) charges Exit to Title WITHOUT activating the Shield!
    if (window.inputManager.wasZPressed()) {
      window.inputManager.consumeZ();
    }

    if (window.inputManager.isZHeld()) {
      this.zHeldTime = (this.zHeldTime || 0) + dt;
      if (this.zHeldTime >= 0.3) {
        this.exitHoldTimer = this.zHeldTime;
        if (this.exitHoldTimer >= 1.5) {
          this.zHeldTime = 0;
          this.exitHoldTimer = 0;
          this.sound.playBlip();
          this.sound.stopAmbientDrone();
          this.switchState('TITLE');
          return;
        }
      }
    } else {
      // Key was released! Check if it was a quick tap (< 0.3s)
      if (this.zHeldTime > 0 && this.zHeldTime < 0.3) {
        // Quick tap: activate Protective Ward!
        if (this.player.wardCooldownTimer <= 0 && !this.player.wardActive) {
          this.player.wardActive = true;
          this.player.wardTimer = this.player.wardDuration;
          this.player.wardCooldownTimer = this.player.wardCooldown;
          this.sound.playWard();
          this.triggerWardVFX();
        }
      }
      this.zHeldTime = 0;
      this.exitHoldTimer = 0;
    }

    if (this.player.wardCooldownTimer > 0) {
      this.player.wardCooldownTimer -= dt;
    }

    if (this.player.wardActive) {
      this.player.wardTimer -= dt;
      if (this.player.wardTimer <= 0) {
        this.player.wardActive = false;
      }
    }

    // 5. Ability: Light Pulse (Space) -> Reveals Shadow Trail (Feature 1-A)
    if (this.player.pulseCooldownTimer > 0) {
      this.player.pulseCooldownTimer -= dt;
    }

    if (this.player.pulseActive) {
      this.player.pulseRadius += this.player.pulseSpeed * dt;
      if (this.player.pulseRadius >= this.player.pulseMaxRadius) {
        this.player.pulseActive = false;
      }

      for (const enemy of this.enemies) {
        const distToEnemy = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        if (distToEnemy <= this.player.pulseRadius + enemy.radius) {
          const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
          enemy.repelVx = Math.cos(angle) * 380;
          enemy.repelVy = Math.sin(angle) * 380;
          enemy.stunTimer = 0.75;
          this.spawnImpactParticles(enemy.x, enemy.y, this.currentTier.color, 16);
        }
      }
    } else if (window.inputManager.wasSpacePressed()) {
      window.inputManager.consumeSpace();
      if (this.player.pulseCooldownTimer <= 0) {
        this.player.pulseActive = true;
        this.player.pulseRadius = this.player.radius;
        this.player.pulseCooldownTimer = this.player.pulseCooldown;
        this.sound.playPulse();

        // Signature Feature 1-A: Reveal shadow's past trail
        this.shadowTrailTimer = 1.8;

        for (const k of this.keys) {
          k.revealedTimer = 3.5;
        }
      }
    }

    // 6. Record Shadow Movement History (Bounded queue for Feature 1-A)
    this.enemyHistoryTimer += dt;
    if (this.enemyHistoryTimer >= 0.04) {
      this.enemyHistoryTimer = 0;
      for (const enemy of this.enemies) {
        this.enemyHistory.push({
          x: enemy.x,
          y: enemy.y,
          timestamp: performance.now()
        });
      }
      // Keep only positions from last 1.8s (bounded at max 45 points)
      if (this.enemyHistory.length > 45) {
        this.enemyHistory.shift();
      }
    }

    // 7. Enemy Movement & AI (Loop over all active shadows)
    for (let eIdx = 0; eIdx < this.enemies.length; eIdx++) {
      const enemy = this.enemies[eIdx];

      if (enemy.stunTimer > 0) {
        enemy.stunTimer -= dt;
      } else {
        const edx = this.player.x - enemy.x;
        const edy = this.player.y - enemy.y;
        const dist = Math.hypot(edx, edy);

        if (dist > 1) {
          const moveX = (edx / dist) * enemy.currentSpeed * dt;
          const moveY = (edy / dist) * enemy.currentSpeed * dt;
          enemy.x += moveX;
          enemy.y += moveY;
        }

        // Mutual soft avoidance between multiple enemies so they flank instead of stacking
        if (this.enemies.length > 1) {
          for (let oIdx = 0; oIdx < this.enemies.length; oIdx++) {
            if (eIdx === oIdx) continue;
            const other = this.enemies[oIdx];
            const sepDist = Math.hypot(enemy.x - other.x, enemy.y - other.y);
            const minSep = enemy.radius + other.radius + 18;
            if (sepDist < minSep && sepDist > 0.001) {
              const pushAngle = Math.atan2(enemy.y - other.y, enemy.x - other.x);
              const pushStrength = (minSep - sepDist) * 1.8 * dt;
              enemy.x += Math.cos(pushAngle) * pushStrength;
              enemy.y += Math.sin(pushAngle) * pushStrength;
            }
          }
        }
      }

      // Decay repel momentum
      enemy.x += enemy.repelVx * dt;
      enemy.y += enemy.repelVy * dt;
      enemy.repelVx *= Math.pow(0.04, dt);
      enemy.repelVy *= Math.pow(0.04, dt);

      enemy.x = Math.max(this.arena.x + enemy.radius, Math.min(this.arena.x + this.arena.width - enemy.radius, enemy.x));
      enemy.y = Math.max(this.arena.y + enemy.radius, Math.min(this.arena.y + this.arena.height - enemy.radius, enemy.y));

      // Enemy aura & smoke tendrils
      enemy.pulseAngle += dt * 3.5;
      enemy.smokeTimer += dt;
      if (enemy.smokeTimer >= 0.04) {
        enemy.smokeTimer = 0;
        this.spawnParticle(
          enemy.x + (Math.random() - 0.5) * 18,
          enemy.y + (Math.random() - 0.5) * 18,
          Math.random() > 0.4 ? '#ff007f' : '#7900b8',
          0.55,
          2.5 + Math.random() * 3
        );
      }
    }

    // 8. Collision Check for all enemies
    for (const enemy of this.enemies) {
      const distToPlayer = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      const hitDistance = this.player.radius + enemy.radius;

      if (distToPlayer < hitDistance) {
        if (this.player.wardActive) {
          const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
          enemy.repelVx = Math.cos(angle) * 320;
          enemy.repelVy = Math.sin(angle) * 320;
          this.spawnImpactParticles(this.player.x, this.player.y, '#ffd700', 12);
          this.spawnFloatingText(this.player.x, this.player.y - 20, 'WARD DEFLECT!', '#00f0ff');
        } else if (this.player.invulnTime <= 0) {
          // Take 1 damage + gentle knockback away from creature
          this.player.health -= 1;
          this.player.invulnTime = this.player.invulnDuration;
          this.screenShakeTime = 0.35;
          this.screenShakeMagnitude = 8;
          this.sound.playHit();
          this.spawnImpactParticles(this.player.x, this.player.y, '#ff2a4b', 24);
          this.spawnFloatingText(this.player.x, this.player.y - 20, '-1 HP', '#ff2a4b');

          // Gentle knockback
          const hitAngle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
          this.player.x += Math.cos(hitAngle) * 22;
          this.player.y += Math.sin(hitAngle) * 22;

          if (this.player.health <= 0) {
            this.deathCause = this.enemies.length > 1
              ? 'The twin shadow stalkers claimed your soul.'
              : 'The shadow creature claimed your soul.';
            this.switchState('GAME_OVER');
            return;
          }
        }
      }
    }

    // 9. Key Collection & Constellation Progression (Feature 1-B & 2)
    for (const k of this.keys) {
      if (k.revealedTimer > 0) k.revealedTimer -= dt;
      k.bobPhase += dt * 2.8;

      if (!k.collected) {
        const keyDist = Math.hypot(this.player.x - k.x, this.player.y - k.y);
        if (keyDist <= this.player.radius + k.radius + 16) {
          k.collected = true;
          this.keysCollected += 1;
          this.score += 100;
          this.sound.playKeyCollect();
          this.spawnImpactParticles(k.x, k.y, '#ffd700', 25);
          this.spawnFloatingText(k.x, k.y - 18, '+100', '#ffd700');

          // Constellation section restored visual flare
          this.triggerConstellationClusterFlare(this.keysCollected);

          // FEATURE 2: Memorable Key Finale (Triggers when all chamber keys are collected)
          const requiredKeys = this.currentTier ? (this.currentTier.keyCount || 3) : 3;
          if (this.keysCollected >= requiredKeys && !this.thirdKeyFinaleTriggered) {
            this.thirdKeyFinaleTriggered = true;
            this.finaleTimer = 1.4;
            this.exit.unlocked = true;
            this.sound.playUnlock();
            this.spawnExitUnlockParticles();
            this.spawnFloatingText(this.exit.x, this.exit.y - 45, 'CONSTELLATION RESTORED! EXIT UNLOCKED!', '#ffaa00');
          }
        }
      }
    }

    // 10. Exit Interaction Check
    if (this.exit.unlocked) {
      this.exit.unlockAnimationTimer += dt;
      const exitLeft = this.exit.x - this.exit.width / 2;
      const exitRight = this.exit.x + this.exit.width / 2;
      const exitTop = this.exit.y - this.exit.height / 2;
      const exitBottom = this.exit.y + this.exit.height / 2;

      if (
        this.player.x + this.player.radius >= exitLeft &&
        this.player.x - this.player.radius <= exitRight &&
        this.player.y + this.player.radius >= exitTop &&
        this.player.y - this.player.radius <= exitBottom
      ) {
        // Chamber cleared! Award escape bonus
        const escapeBonus = 200;
        this.score += escapeBonus;

        if (this.currentLevel >= this.currentTier.totalLevels) {
          // Completed all chambers of this tier!
          this.switchState('VICTORY');
          return;
        } else {
          // USER-CONTROLLED ADVANCE: Present Chamber Cleared screen, wait for user's Z press!
          this.switchState('CHAMBER_CLEARED');
          return;
        }
      }
    }

    this.updateHUD();
  }

  // --- Visual Particles & VFX ---
  spawnParticle(x, y, color, life, radius) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 35,
      vy: (Math.random() - 0.5) * 35,
      color,
      life,
      maxLife: life,
      radius
    });
  }

  spawnImpactParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        radius: 2 + Math.random() * 3
      });
    }
  }

  spawnFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      vy: -35,
      life: 1.1,
      maxLife: 1.1,
      alpha: 1.0
    });
  }

  triggerWardVFX() {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 70;
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#00f0ff',
        life: 0.5,
        maxLife: 0.5,
        radius: 3
      });
    }
  }

  spawnExitUnlockParticles() {
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 160;
      this.particles.push({
        x: this.exit.x,
        y: this.exit.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffaa00',
        life: 1.3,
        maxLife: 1.3,
        radius: 3.5
      });
    }
  }

  triggerConstellationClusterFlare(clusterId) {
    for (const star of this.constellationStars) {
      if (star.cluster === clusterId) {
        this.spawnImpactParticles(star.x, star.y, '#ffd700', 10);
      }
    }
  }

  // --- Update UI HUD Elements ---
  updateHUD() {
    this.ui.hearts.forEach((heart, idx) => {
      heart.classList.toggle('lost', idx >= this.player.health);
    });

    this.ui.levelDisplay.textContent = `${this.currentTier.name} • ${String(this.currentLevel).padStart(2, '0')}/${this.currentTier.totalLevels}`;
    this.ui.levelDisplay.style.color = this.currentTier.color;
    this.ui.levelDisplay.style.textShadow = `0 0 12px ${this.currentTier.color}`;

    const progressPct = (this.currentLevel / this.currentTier.totalLevels) * 100;
    this.ui.levelProgressFill.style.width = `${progressPct}%`;
    this.ui.levelProgressFill.style.background = `linear-gradient(90deg, ${this.currentTier.color}, #ffd700)`;

    const totalKeys = this.currentTier ? (this.currentTier.keyCount || 3) : 3;
    this.ui.keysDisplay.textContent = totalKeys === 3 ? `KEYS ${this.keysCollected}/3` : `KEYS ${this.keysCollected}/${totalKeys}`;

    const sec = Math.ceil(this.timeRemaining);
    this.ui.timerDisplay.textContent = `${sec}s`;
    this.ui.timerDisplay.classList.toggle('low-time', sec <= 30);

    this.ui.scoreDisplay.textContent = String(this.score).padStart(4, '0');

    // Ward Cooldown
    const wardPct = this.player.wardCooldownTimer > 0 
      ? 1 - (this.player.wardCooldownTimer / this.player.wardCooldown) 
      : 1;
    this.ui.wardMeter.style.width = `${wardPct * 100}%`;
    this.ui.wardCard.classList.toggle('on-cooldown', this.player.wardCooldownTimer > 0);
    this.ui.wardCard.classList.toggle('active-ability', this.player.wardActive);
    this.ui.wardStatus.textContent = this.player.wardActive ? 'ACTIVE' : (this.player.wardCooldownTimer > 0 ? `${this.player.wardCooldownTimer.toFixed(1)}s` : 'READY');

    // Pulse Cooldown
    const pulsePct = this.player.pulseCooldownTimer > 0
      ? 1 - (this.player.pulseCooldownTimer / this.player.pulseCooldown)
      : 1;
    this.ui.pulseMeter.style.width = `${pulsePct * 100}%`;
    this.ui.pulseCard.classList.toggle('on-cooldown', this.player.pulseCooldownTimer > 0);
    this.ui.pulseCard.classList.toggle('active-ability', this.player.pulseActive);
    this.ui.pulseStatus.textContent = this.player.pulseActive ? 'PULSING' : (this.player.pulseCooldownTimer > 0 ? `${this.player.pulseCooldownTimer.toFixed(1)}s` : 'READY');
  }

  // --- Rendering Pipeline ---
  render() {
    this.ctx.save();

    // Screen Shake effect
    if (this.screenShakeTime > 0) {
      const offsetX = (Math.random() - 0.5) * this.screenShakeMagnitude;
      const offsetY = (Math.random() - 0.5) * this.screenShakeMagnitude;
      this.ctx.translate(offsetX, offsetY);
    }

    // Clear background
    this.ctx.fillStyle = '#03060c';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 1. Render Arena Floor & Architectural Observatory Elements
    this.renderArenaFloor();

    // 2. Render Celestial Constellation Star Chart (Feature 1-B)
    this.renderCelestialConstellation();

    // 3. Render Luminous Path to Exit (Feature 1-C)
    if (this.exit.unlocked) {
      this.renderLuminousExitPath();
    }

    // 4. Render Exit Portal
    this.renderExit();

    // 5. Render Keys
    this.renderKeys();

    // 6. Render Shadow Past History Afterimages (Feature 1-A)
    if (this.shadowTrailTimer > 0) {
      this.renderShadowAfterimages();
    }

    // 7. Render Shadow Creature
    this.renderShadowEnemy();

    // 8. Render Player
    this.renderPlayer();

    // 9. Render Particles
    this.renderParticles();

    // 10. Render Atmospheric Darkness & Lighting Mask
    this.renderDarknessLighting();

    // 11. Render Floating Text overlays
    this.renderFloatingTexts();

    // 12. Render Proximity Danger Vignette
    this.renderDangerVignette();

    // 13. Render Unfocused Tab Indicator (Anti-Frustration)
    if (this.state === 'PLAYING' && !this.isWindowFocused) {
      this.renderUnfocusedBanner();
    }

    this.ctx.restore();
  }

  renderUnfocusedBanner() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
    this.ctx.fillRect(0, this.height / 2 - 36, this.width, 72);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, this.height / 2 - 36, this.width, 72);

    this.ctx.font = 'bold 18px Orbitron, Rajdhani, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 12;
    this.ctx.fillText('CLICK WINDOW TO RESTORE KEYBOARD CONTROLS', this.width / 2, this.height / 2);
    this.ctx.restore();
  }

  renderArenaFloor() {
    this.ctx.fillStyle = this.currentTier.floorColor;
    this.ctx.fillRect(this.arena.x, this.arena.y, this.arena.width, this.arena.height);

    // Stone tile grid
    this.ctx.strokeStyle = this.currentTier.gridColor;
    this.ctx.lineWidth = 1;
    const tileSize = 48;
    for (let x = this.arena.x; x <= this.arena.x + this.arena.width; x += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.arena.y);
      this.ctx.lineTo(x, this.arena.y + this.arena.height);
      this.ctx.stroke();
    }
    for (let y = this.arena.y; y <= this.arena.y + this.arena.height; y += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.arena.x, y);
      this.ctx.lineTo(this.arena.x + this.arena.width, y);
      this.ctx.stroke();
    }

    // Subtle Observatory Architectural Silhouettes (Feature 4)
    const cx = this.arena.x + this.arena.width / 2;
    const cy = this.arena.y + this.arena.height / 2;

    // Central Astrolabe Meridian Circle
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    this.ctx.stroke();

    // Broken Telescope Dome Silhouette on upper wall
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
    this.ctx.beginPath();
    this.ctx.arc(cx, this.arena.y + 10, 60, 0, Math.PI);
    this.ctx.fill();

    // 4 Quadrant Stone Pillars with Brass Caps
    const pillars = [
      { x: this.arena.x + 140, y: this.arena.y + 110 },
      { x: this.arena.x + this.arena.width - 140, y: this.arena.y + 110 },
      { x: this.arena.x + 140, y: this.arena.y + this.arena.height - 110 },
      { x: this.arena.x + this.arena.width - 140, y: this.arena.y + this.arena.height - 110 }
    ];

    for (const p of pillars) {
      this.ctx.fillStyle = '#0a101d';
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Outer boundary walls
    this.ctx.strokeStyle = this.currentTier.wallColor;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.arena.x, this.arena.y, this.arena.width, this.arena.height);

    // Decorative corner brackets
    const bracketSize = 24;
    this.ctx.strokeStyle = this.currentTier.color;
    this.ctx.lineWidth = 2;
    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(this.arena.x, this.arena.y + bracketSize);
    this.ctx.lineTo(this.arena.x, this.arena.y);
    this.ctx.lineTo(this.arena.x + bracketSize, this.arena.y);
    this.ctx.stroke();
    // Top-right
    this.ctx.beginPath();
    this.ctx.moveTo(this.arena.x + this.arena.width - bracketSize, this.arena.y);
    this.ctx.lineTo(this.arena.x + this.arena.width, this.arena.y);
    this.ctx.lineTo(this.arena.x + this.arena.width, this.arena.y + bracketSize);
    this.ctx.stroke();
    // Bottom-left
    this.ctx.beginPath();
    this.ctx.moveTo(this.arena.x, this.arena.y + this.arena.height - bracketSize);
    this.ctx.lineTo(this.arena.x, this.arena.y + this.arena.height);
    this.ctx.lineTo(this.arena.x + bracketSize, this.arena.y + this.arena.height);
    this.ctx.stroke();
    // Bottom-right
    this.ctx.beginPath();
    this.ctx.moveTo(this.arena.x + this.arena.width - bracketSize, this.arena.y + this.arena.height);
    this.ctx.lineTo(this.arena.x + this.arena.width, this.arena.y + this.arena.height);
    this.ctx.lineTo(this.arena.x + this.arena.width, this.arena.y + this.arena.height - bracketSize);
    this.ctx.stroke();
  }

  // --- FEATURE 1-B: Celestial Constellation Restoration ---
  renderCelestialConstellation() {
    this.ctx.save();
    const keys = this.state === 'TITLE'
      ? (1 + (Math.floor((this.titleTime || 0) * 0.75) % 3))
      : this.keysCollected;
    const now = performance.now();

    // 1. Draw Connecting Lines
    for (const line of this.constellationLines) {
      const fromStar = this.constellationStars[line.from];
      const toStar = this.constellationStars[line.to];
      const isRestored = keys >= line.cluster;

      this.ctx.beginPath();
      this.ctx.moveTo(fromStar.x, fromStar.y);
      this.ctx.lineTo(toStar.x, toStar.y);

      if (isRestored) {
        this.ctx.strokeStyle = keys >= 3 ? '#ffd700' : '#00f0ff';
        this.ctx.lineWidth = keys >= 3 ? 2.5 : 1.8;
        this.ctx.shadowColor = keys >= 3 ? '#ffd700' : '#00f0ff';
        this.ctx.shadowBlur = keys >= 3 ? 12 : 8;
        this.ctx.globalAlpha = 0.85 + Math.sin(now * 0.004) * 0.15;
      } else {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 0.3;
      }
      this.ctx.stroke();
    }

    // 2. Draw Constellation Stars
    for (const star of this.constellationStars) {
      const isRestored = keys >= star.cluster;
      const pulse = Math.sin(now * 0.005 + star.id) * 1.5;
      const r = star.size + (isRestored ? pulse : 0);

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, r, 0, Math.PI * 2);

      if (isRestored) {
        this.ctx.fillStyle = keys >= 3 ? '#ffffff' : '#e0f2fe';
        this.ctx.shadowColor = keys >= 3 ? '#ffd700' : '#00f0ff';
        this.ctx.shadowBlur = keys >= 3 ? 16 : 10;
        this.ctx.globalAlpha = 1.0;
        this.ctx.fill();

        // Pulsating outer star halo
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, r * 2.2, 0, Math.PI * 2);
        this.ctx.fillStyle = keys >= 3 ? 'rgba(255, 215, 0, 0.25)' : 'rgba(0, 240, 255, 0.2)';
        this.ctx.fill();
      } else {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 0.4;
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  // --- FEATURE 1-C: Restored Constellation Luminous Path to Exit ---
  renderLuminousExitPath() {
    this.ctx.save();
    const cx = this.constellationCenter.x;
    const cy = this.constellationCenter.y;
    const ex = this.exit.x;
    const ey = this.exit.y;
    const now = performance.now();

    // Flowing luminous stardust beacons
    const dist = Math.hypot(ex - cx, ey - cy);
    const numPoints = 14;

    this.ctx.lineWidth = 2;
    for (let i = 1; i <= numPoints; i++) {
      const t = (i / numPoints + (now * 0.0006)) % 1;
      const px = cx + (ex - cx) * t;
      const py = cy + (ey - cy) * t;

      const alpha = Math.sin(t * Math.PI) * 0.85;
      this.ctx.fillStyle = '#ffd700';
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 10;
      this.ctx.globalAlpha = alpha;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 4 + Math.sin(t * 10) * 1.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Directional arrow chevron pointing to exit
      if (i % 3 === 0) {
        const angle = Math.atan2(ey - cy, ex - cx);
        this.ctx.strokeStyle = '#fffbeb';
        this.ctx.beginPath();
        this.ctx.moveTo(px - Math.cos(angle - 0.5) * 8, py - Math.sin(angle - 0.5) * 8);
        this.ctx.lineTo(px, py);
        this.ctx.lineTo(px - Math.cos(angle + 0.5) * 8, py - Math.sin(angle + 0.5) * 8);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  // --- FEATURE 1-A: Light Pulse Reveals Shadow's Past Afterimages ---
  renderShadowAfterimages() {
    this.ctx.save();
    const progress = this.shadowTrailTimer / 1.8; // 1 -> 0
    const points = this.enemyHistory;

    if (points.length < 2) {
      this.ctx.restore();
      return;
    }

    // 1. Draw Ethereal Connecting Ribbon
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#a855f7';
    this.ctx.shadowBlur = 12;
    this.ctx.globalAlpha = progress * 0.65;
    this.ctx.stroke();

    // 2. Draw Ghostly Afterimages at each historical waypoint
    const step = Math.max(1, Math.floor(points.length / 9));
    for (let i = 0; i < points.length; i += step) {
      const pt = points[i];
      const ageRatio = i / points.length; // 0 (oldest) to 1 (newest)
      const afterimageAlpha = progress * ageRatio * 0.65;
      const r = this.enemy.radius * (0.65 + ageRatio * 0.35);

      this.ctx.save();
      this.ctx.globalAlpha = afterimageAlpha;

      // Cyan-Violet chromatic glow
      const haze = this.ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, r * 1.6);
      haze.addColorStop(0, 'rgba(0, 240, 255, 0.7)');
      haze.addColorStop(0.6, 'rgba(168, 85, 247, 0.4)');
      haze.addColorStop(1, 'rgba(168, 85, 247, 0)');
      this.ctx.fillStyle = haze;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, r * 1.6, 0, Math.PI * 2);
      this.ctx.fill();

      // Phantom silhouette body
      this.ctx.fillStyle = '#08051a';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Ghost eyes
      this.ctx.fillStyle = '#ff007f';
      this.ctx.beginPath();
      this.ctx.arc(pt.x - 5, pt.y - 2, 2, 0, Math.PI * 2);
      this.ctx.arc(pt.x + 5, pt.y - 2, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    this.ctx.restore();
  }

  renderExit() {
    this.ctx.save();
    const ex = this.exit.x;
    const ey = this.exit.y;
    const hw = this.exit.width / 2;
    const hh = this.exit.height / 2;

    if (this.exit.unlocked) {
      const t = this.exit.unlockAnimationTimer * 1.6;
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const rayAngle = t + (i * Math.PI / 4);
        this.ctx.beginPath();
        this.ctx.moveTo(ex, ey);
        this.ctx.lineTo(ex + Math.cos(rayAngle) * 58, ey + Math.sin(rayAngle) * 58);
        this.ctx.stroke();
      }

      const glowGrad = this.ctx.createRadialGradient(ex, ey, 5, ex, ey, 60);
      glowGrad.addColorStop(0, 'rgba(255, 170, 0, 0.9)');
      glowGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.45)');
      glowGrad.addColorStop(1, 'rgba(255, 170, 0, 0)');
      this.ctx.fillStyle = glowGrad;
      this.ctx.fillRect(ex - 70, ey - 70, 140, 140);

      this.ctx.fillStyle = '#ffaa00';
      this.ctx.strokeStyle = '#fffbeb';
      this.ctx.lineWidth = 3;
      this.ctx.fillRect(ex - hw, ey - hh, this.exit.width, this.exit.height);
      this.ctx.strokeRect(ex - hw, ey - hh, this.exit.width, this.exit.height);

      this.ctx.beginPath();
      this.ctx.arc(ex, ey - hh, hw, Math.PI, 0);
      this.ctx.fillStyle = '#ffe066';
      this.ctx.fill();
      this.ctx.stroke();

      const coreR = 10 + Math.sin(t * 3) * 3;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 12;
      this.ctx.beginPath();
      this.ctx.arc(ex, ey, coreR, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.fillStyle = '#1e293b';
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(ex - hw, ey - hh, this.exit.width, this.exit.height);
      this.ctx.strokeRect(ex - hw, ey - hh, this.exit.width, this.exit.height);

      this.ctx.strokeStyle = '#94a3b8';
      this.ctx.beginPath();
      this.ctx.arc(ex, ey - 6, 8, Math.PI, 0);
      this.ctx.stroke();
      this.ctx.strokeRect(ex - 10, ey - 6, 20, 16);
    }
    this.ctx.restore();
  }

  renderKeys() {
    for (const k of this.keys) {
      if (k.collected) continue;

      this.ctx.save();
      const bobY = k.y + Math.sin(k.bobPhase) * 5;

      const auraGrad = this.ctx.createRadialGradient(k.x, bobY, 2, k.x, bobY, 28);
      auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.75)');
      auraGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      this.ctx.fillStyle = auraGrad;
      this.ctx.beginPath();
      this.ctx.arc(k.x, bobY, 28, 0, Math.PI * 2);
      this.ctx.fill();

      const orbAngle = k.bobPhase * 1.6;
      const orb1X = k.x + Math.cos(orbAngle) * 18;
      const orb1Y = bobY + Math.sin(orbAngle) * 12;
      const orb2X = k.x + Math.cos(orbAngle + Math.PI) * 18;
      const orb2Y = bobY + Math.sin(orbAngle + Math.PI) * 12;

      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(orb1X, orb1Y, 2.5, 0, Math.PI * 2);
      this.ctx.arc(orb2X, orb2Y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffd700';
      this.ctx.strokeStyle = '#fffbeb';
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      this.ctx.arc(k.x, bobY - 6, 7, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(k.x, bobY + 1);
      this.ctx.lineTo(k.x, bobY + 15);
      this.ctx.moveTo(k.x, bobY + 10);
      this.ctx.lineTo(k.x + 5, bobY + 10);
      this.ctx.moveTo(k.x, bobY + 14);
      this.ctx.lineTo(k.x + 4, bobY + 14);
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  renderShadowEnemy() {
    this.ctx.save();
    for (const enemy of this.enemies) {
      const pulseOffset = Math.sin(enemy.pulseAngle) * 3;
      const r = enemy.radius + pulseOffset;

      // Distant Danger Warning Ring
      const warningRingRadius = 90 + Math.sin(enemy.pulseAngle * 1.5) * 8;
      this.ctx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([6, 6]);
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, warningRingRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Third-key Finale Silhouette Flare (Feature 2)
      if (this.finaleTimer > 0) {
        const flareGrad = this.ctx.createRadialGradient(enemy.x, enemy.y, 10, enemy.x, enemy.y, 80);
        flareGrad.addColorStop(0, 'rgba(255, 0, 127, 0.9)');
        flareGrad.addColorStop(0.5, 'rgba(155, 0, 232, 0.6)');
        flareGrad.addColorStop(1, 'rgba(155, 0, 232, 0)');
        this.ctx.fillStyle = flareGrad;
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, 80, 0, Math.PI * 2);
        this.ctx.fill();
      }

      const haze = this.ctx.createRadialGradient(enemy.x, enemy.y, 10, enemy.x, enemy.y, 45);
      haze.addColorStop(0, 'rgba(255, 0, 127, 0.6)');
      haze.addColorStop(0.6, 'rgba(155, 0, 232, 0.3)');
      haze.addColorStop(1, 'rgba(155, 0, 232, 0)');
      this.ctx.fillStyle = haze;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, 45, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#0f051d';
      this.ctx.strokeStyle = '#ff007f';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      const eyeOffsetX = 6;
      const eyeOffsetY = -3;
      this.ctx.fillStyle = '#ff007f';
      this.ctx.shadowColor = '#ff007f';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x - eyeOffsetX, enemy.y + eyeOffsetY, 3, 0, Math.PI * 2);
      this.ctx.arc(enemy.x + eyeOffsetX, enemy.y + eyeOffsetY, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  renderPlayer() {
    this.ctx.save();

    if (this.player.invulnTime > 0) {
      const flash = Math.floor(this.player.invulnTime * 10) % 2 === 0;
      if (flash) {
        this.ctx.globalAlpha = 0.4;
      }
    }

    // Protective Ward forcefield bubble (Feature 3)
    if (this.player.wardActive) {
      this.ctx.save();
      const wardR = this.player.radius + 14;
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 18;

      // Hexagonal barrier segments
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + performance.now() * 0.003;
        const hx = this.player.x + Math.cos(ang) * wardR;
        const hy = this.player.y + Math.sin(ang) * wardR;
        if (i === 0) this.ctx.moveTo(hx, hy);
        else this.ctx.lineTo(hx, hy);
      }
      this.ctx.closePath();
      this.ctx.stroke();

      const wardFill = this.ctx.createRadialGradient(this.player.x, this.player.y, 4, this.player.x, this.player.y, wardR);
      wardFill.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      wardFill.addColorStop(1, 'rgba(0, 240, 255, 0.06)');
      this.ctx.fillStyle = wardFill;
      this.ctx.fill();
      this.ctx.restore();
    }

    this.ctx.fillStyle = '#0284c7';
    this.ctx.strokeStyle = this.currentTier.color;
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = this.currentTier.color;
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Render Hold-Z Exit Progress Ring (activates when holding Z past 0.3s)
    if (this.exitHoldTimer >= 0.3) {
      const progress = Math.min(1.0, (this.exitHoldTimer - 0.3) / 1.2);
      const ringR = this.player.radius + 22;

      this.ctx.save();
      // Background guide ring
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y, ringR, 0, Math.PI * 2);
      this.ctx.stroke();

      // Active progress arc
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.shadowBlur = 12;
      this.ctx.lineWidth = 4.5;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y, ringR, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      this.ctx.stroke();

      // Floating retreat text above player
      this.ctx.font = 'bold 12px "Orbitron", monospace';
      this.ctx.fillStyle = '#ffd700';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 6;
      const remaining = Math.max(0, 1.5 - this.exitHoldTimer).toFixed(1);
      this.ctx.fillText(`EXITING TO MENU (${remaining}s)`, this.player.x, this.player.y - ringR - 8);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  renderParticles() {
    this.ctx.save();
    for (const p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  renderDarknessLighting() {
    this.ctx.save();

    if (!this.darkCanvas || this.darkCanvas.width !== this.width || this.darkCanvas.height !== this.height) {
      this.darkCanvas = document.createElement('canvas');
      this.darkCanvas.width = this.width;
      this.darkCanvas.height = this.height;
      this.darkCtx = this.darkCanvas.getContext('2d');
    }
    const darkCanvas = this.darkCanvas;
    const darkCtx = this.darkCtx;
    darkCtx.globalCompositeOperation = 'source-over';

    // Deep atmospheric black/navy darkness
    // Dim briefly on Third-Key Finale (Feature 2)
    const darknessAlpha = this.finaleTimer > 0 ? 0.98 : 0.94;
    darkCtx.fillStyle = `rgba(2, 4, 10, ${darknessAlpha})`;
    darkCtx.fillRect(0, 0, this.width, this.height);

    darkCtx.globalCompositeOperation = 'destination-out';

    const now = performance.now();
    const torchR = this.player.lightRadius + Math.sin(now * 0.007) * 4 + Math.cos(now * 0.017) * 2;
    const playerLight = darkCtx.createRadialGradient(this.player.x, this.player.y, 20, this.player.x, this.player.y, torchR);
    playerLight.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    playerLight.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
    playerLight.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    darkCtx.fillStyle = playerLight;
    darkCtx.beginPath();
    darkCtx.arc(this.player.x, this.player.y, torchR, 0, Math.PI * 2);
    darkCtx.fill();

    // Expanding Light Pulse ring (Feature 3)
    if (this.player.pulseActive) {
      const pulseLight = darkCtx.createRadialGradient(
        this.player.x, this.player.y,
        Math.max(0, this.player.pulseRadius - 30),
        this.player.x, this.player.y,
        this.player.pulseRadius
      );
      pulseLight.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
      pulseLight.addColorStop(0.6, 'rgba(0, 0, 0, 0.95)');
      pulseLight.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      darkCtx.fillStyle = pulseLight;
      darkCtx.beginPath();
      darkCtx.arc(this.player.x, this.player.y, this.player.pulseRadius, 0, Math.PI * 2);
      darkCtx.fill();
    }

    // Keys faint glow in the dark
    for (const k of this.keys) {
      if (k.collected) continue;
      const keyGlowR = k.revealedTimer > 0 ? 90 : 38;
      const keyGrad = darkCtx.createRadialGradient(k.x, k.y, 5, k.x, k.y, keyGlowR);
      keyGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      keyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      darkCtx.fillStyle = keyGrad;
      darkCtx.beginPath();
      darkCtx.arc(k.x, k.y, keyGlowR, 0, Math.PI * 2);
      darkCtx.fill();
    }

    // Constellation Center glow (Feature 1-B)
    if (this.keysCollected > 0) {
      const requiredKeys = this.currentTier ? (this.currentTier.keyCount || 3) : 3;
      const constGlowR = this.keysCollected >= requiredKeys ? 160 : 90;
      const constGrad = darkCtx.createRadialGradient(this.constellationCenter.x, this.constellationCenter.y, 10, this.constellationCenter.x, this.constellationCenter.y, constGlowR);
      constGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      constGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      darkCtx.fillStyle = constGrad;
      darkCtx.beginPath();
      darkCtx.arc(this.constellationCenter.x, this.constellationCenter.y, constGlowR, 0, Math.PI * 2);
      darkCtx.fill();
    }

    // Exit portal glow
    const exitGlowR = this.exit.unlocked ? 150 : 50;
    const exitGrad = darkCtx.createRadialGradient(this.exit.x, this.exit.y, 10, this.exit.x, this.exit.y, exitGlowR);
    exitGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    exitGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    darkCtx.fillStyle = exitGrad;
    darkCtx.beginPath();
    darkCtx.arc(this.exit.x, this.exit.y, exitGlowR, 0, Math.PI * 2);
    darkCtx.fill();

    // Shadow enemies silhouette auras
    for (const enemy of this.enemies) {
      const enemyGlow = darkCtx.createRadialGradient(enemy.x, enemy.y, 8, enemy.x, enemy.y, 45);
      enemyGlow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      enemyGlow.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      darkCtx.fillStyle = enemyGlow;
      darkCtx.beginPath();
      darkCtx.arc(enemy.x, enemy.y, 45, 0, Math.PI * 2);
      darkCtx.fill();
    }

    this.ctx.drawImage(darkCanvas, 0, 0);

    this.ctx.restore();
  }

  renderFloatingTexts() {
    this.ctx.save();
    this.ctx.font = 'bold 18px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 10;
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    }
    this.ctx.restore();
  }

  renderDangerVignette() {
    if (this.state !== 'PLAYING') return;
    let minDistToEnemy = Infinity;
    for (const enemy of this.enemies) {
      const d = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (d < minDistToEnemy) minDistToEnemy = d;
    }
    if (minDistToEnemy < 260) {
      const dangerFactor = Math.max(0, 1 - (minDistToEnemy / 260));
      const pulse = 0.5 + Math.sin(performance.now() * 0.009) * 0.5;
      const alpha = dangerFactor * 0.45 * pulse;

      this.ctx.save();
      const vignette = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, this.width * 0.28,
        this.width / 2, this.height / 2, this.width * 0.65
      );
      vignette.addColorStop(0, 'rgba(255, 0, 127, 0)');
      vignette.addColorStop(1, `rgba(255, 0, 80, ${alpha.toFixed(3)})`);
      this.ctx.fillStyle = vignette;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
  }
}

// Bulletproof instantiation: handle both already-loaded and pending DOM
function initGame() {
  if (typeof window !== 'undefined' && !window.darkGame) {
    window.darkGame = new DarkGame();
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
    window.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
}
