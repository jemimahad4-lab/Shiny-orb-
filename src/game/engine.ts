import { 
  GameMode, 
  ThemeId, 
  CharacterId, 
  PowerUpType, 
  PowerUpActive, 
  ObstacleType, 
  LevelConfig, 
  DailyChallengeInfo,
  GameOverStats,
  LevelStats
} from '../types/game';
import { CHARACTERS } from '../data/cosmetics';
import { ParticleSystem } from './particles';
import { ThemeRenderer } from './themeRenderer';
import { sound } from '../utils/audio';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width?: number;
  height?: number;
  angle: number;
  vRot?: number;
  gapX?: number; // for spikeWall
  gapWidth?: number;
  state?: 'charging' | 'firing' | 'cooldown'; // for laser
  timer?: number;
  isTelegraph?: boolean;
  color?: string;
  dodged?: boolean;
}

export interface CollectibleCoin {
  id: string;
  x: number;
  y: number;
  vy: number;
  radius: number;
  wobble: number;
}

export interface PowerUpItem {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
  radius: number;
  color: string;
}

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, combo: number) => void;
  onCoinCollected?: (totalRunCoins: number) => void;
  onLivesUpdate: (lives: number, maxLives: number) => void;
  onPowerUpsUpdate: (activePowerUps: PowerUpActive[]) => void;
  onObjectiveUpdate: (current: number, target: number) => void;
  onGameOver: (stats: GameOverStats) => void;
  onLevelComplete: (stats: LevelStats) => void;
  onDailyComplete?: (stats: GameOverStats) => void;
  onDashCooldownUpdate: (cooldownRatio: number) => void;
  onTimeAttackTick?: (remaining: number) => void;
  onAchievementTrigger?: (achId: string) => void;
}

export interface GameEngineOptions extends Partial<GameEngineCallbacks> {
  selectedCharacter?: CharacterId;
  selectedTheme?: ThemeId;
  reducedMotion?: boolean;
  graphicsQuality?: 'high' | 'medium' | 'low';
  soundEnabled?: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Viewport
  public width: number = 400;
  public height: number = 700;
  private dpr: number = 1;

  // Systems
  public particles: ParticleSystem;
  public themeRenderer: ThemeRenderer;

  // State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;

  // Game Settings
  public mode: GameMode = 'classic';
  public currentLevel: LevelConfig | null = null;
  public dailyChallenge: DailyChallengeInfo | null = null;
  public characterId: CharacterId = 'classic';
  public reducedMotion: boolean = false;

  // Player
  public player = {
    x: 200,
    y: 560,
    targetX: 200,
    targetY: 560,
    radius: 18,
    speed: 6.5,
    lives: 3,
    maxLives: 3,
    invincibleTimer: 0,
    dashCooldown: 0,
    dashDuration: 0,
    isDashing: false,
    dashVx: 0,
    dashVy: 0,
    hasShield: false,
    trailTimer: 0
  };

  // Input
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private keysPressed: Record<string, boolean> = {};

  // Entities
  private obstacles: Obstacle[] = [];
  private coins: CollectibleCoin[] = [];
  private powerUps: PowerUpItem[] = [];
  private activePowerUps: Map<PowerUpType, { remaining: number; duration: number }> = new Map();
  private floatingTexts: FloatingText[] = [];

  // Progression & Stats
  public score: number = 0;
  public combo: number = 0;
  public maxCombo: number = 0;
  public comboDecayTimer: number = 0;
  public coinsCollectedThisRun: number = 0;
  public elapsedTime: number = 0;
  public timeAttackRemaining: number = 60;
  public objectiveProgress: number = 0;
  public hitsTakenInRun: number = 0;

  // Spawner timers
  private obstacleSpawnTimer: number = 0;
  private coinSpawnTimer: number = 0;
  private powerUpSpawnTimer: number = 0;
  private difficultyMultiplier: number = 1.0;

  // Camera Shake
  private screenShakeIntensity: number = 0;

  public isAttractMode: boolean = false;

  constructor(canvas: HTMLCanvasElement, options: GameEngineOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.callbacks = {
      onScoreUpdate: options.onScoreUpdate || (() => {}),
      onCoinCollected: options.onCoinCollected,
      onLivesUpdate: options.onLivesUpdate || (() => {}),
      onPowerUpsUpdate: options.onPowerUpsUpdate || (() => {}),
      onObjectiveUpdate: options.onObjectiveUpdate || (() => {}),
      onGameOver: options.onGameOver || (() => {}),
      onLevelComplete: options.onLevelComplete || (() => {}),
      onDailyComplete: options.onDailyComplete,
      onDashCooldownUpdate: options.onDashCooldownUpdate || (() => {}),
      onTimeAttackTick: options.onTimeAttackTick,
      onAchievementTrigger: options.onAchievementTrigger
    };

    if (options.selectedCharacter) this.characterId = options.selectedCharacter;
    if (options.reducedMotion !== undefined) this.reducedMotion = options.reducedMotion;

    this.particles = new ParticleSystem(options.graphicsQuality || 'high');
    this.themeRenderer = new ThemeRenderer();
    if (options.selectedTheme) this.themeRenderer.setTheme(options.selectedTheme);

    this.resize();
    this.setupListeners();
  }

  public setQuality(quality: 'high' | 'medium' | 'low') {
    this.particles.setQuality(quality);
  }

  public setTheme(theme: ThemeId) {
    this.themeRenderer.setTheme(theme);
  }

  public setCharacter(character: CharacterId) {
    this.characterId = character;
  }

  public updateCosmetics(character: CharacterId, theme: ThemeId) {
    this.characterId = character;
    this.themeRenderer.setTheme(theme);
  }

  public updateSettings(settings: { reducedMotion?: boolean; graphicsQuality?: 'high' | 'medium' | 'low'; soundEnabled?: boolean }) {
    if (settings.reducedMotion !== undefined) this.reducedMotion = settings.reducedMotion;
    if (settings.graphicsQuality) this.particles.setQuality(settings.graphicsQuality);
  }

  public resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(rect.width || 400, 300);
    this.height = Math.max(rect.height || 700, 400);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private boundKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;
    if (e.code === 'Space') {
      this.triggerDash();
    }
  };

  private boundKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private boundPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastPointerX = e.clientX - rect.left;
    this.lastPointerY = e.clientY - rect.top;
    this.player.targetX = this.lastPointerX;
    this.player.targetY = this.lastPointerY;
  };

  private boundPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown || this.isPaused || !this.isRunning) return;
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - this.lastPointerX;
    const dy = currentY - this.lastPointerY;
    this.lastPointerX = currentX;
    this.lastPointerY = currentY;

    // Relative smooth offset control
    this.player.targetX = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.targetX + dx));
    this.player.targetY = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.targetY + dy));
  };

  private boundPointerUp = () => {
    this.isPointerDown = false;
  };

  private boundResize = () => {
    this.resize();
  };

  private setupListeners() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    window.addEventListener('pointermove', this.boundPointerMove);
    window.addEventListener('pointerup', this.boundPointerUp);
    window.addEventListener('pointercancel', this.boundPointerUp);
    window.addEventListener('resize', this.boundResize);
  }

  public destroy() {
    this.isRunning = false;
    this.isAttractMode = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('pointercancel', this.boundPointerUp);
    window.removeEventListener('resize', this.boundResize);
  }

  public startAttractMode() {
    this.isAttractMode = true;
    this.isRunning = false;
    this.isPaused = false;
    this.obstacles = [];
    this.coins = [];
    this.powerUps = [];
    this.lastTime = performance.now();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.attractLoop(this.lastTime);
  }

  public pauseAttractMode() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resumeAttractMode() {
    if (this.isAttractMode && !this.animFrameId && !this.isRunning) {
      this.lastTime = performance.now();
      this.animFrameId = requestAnimationFrame(this.attractLoop);
    }
  }

  private attractLoop = (time: number) => {
    if (!this.isAttractMode) return;
    const dt = Math.min(time - this.lastTime, 50);
    this.lastTime = time;

    // Ambient floating obstacles in background
    if (Math.random() < 0.02 && this.obstacles.length < 5) {
      this.obstacles.push({
        id: `attract_${Date.now()}_${Math.random()}`,
        type: 'spike',
        x: Math.random() * this.width,
        y: -30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.2 + Math.random() * 1.0,
        radius: 12 + Math.random() * 8,
        angle: 0,
        vRot: (Math.random() - 0.5) * 0.04
      });
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.y += o.vy;
      o.x += o.vx;
      o.angle += o.vRot || 0.02;
      if (o.y > this.height + 50) {
        this.obstacles.splice(i, 1);
      }
    }

    this.particles.update(dt);
    this.themeRenderer.update(dt, this.width, this.height);
    this.draw();

    this.animFrameId = requestAnimationFrame(this.attractLoop);
  };

  public startNewGame(
    mode: GameMode,
    level?: LevelConfig | null,
    daily?: DailyChallengeInfo | null
  ) {
    this.isAttractMode = false;
    this.start(mode, level || undefined, daily || undefined);
  }

  public triggerDash() {
    if (this.player.dashCooldown > 0 || !this.isRunning || this.isPaused) return;

    sound.playDash();
    this.player.isDashing = true;
    this.player.dashDuration = 0.22; // 220ms invincible dash
    this.player.dashCooldown = 1.0; // 1s cooldown

    // Direction calculation
    let dirX = 0;
    let dirY = 0;
    if (this.keysPressed['ArrowUp'] || this.keysPressed['KeyW']) dirY -= 1;
    if (this.keysPressed['ArrowDown'] || this.keysPressed['KeyS']) dirY += 1;
    if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) dirX -= 1;
    if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) dirX += 1;

    // If no keys, dash towards target or upwards
    if (dirX === 0 && dirY === 0) {
      const dx = this.player.targetX - this.player.x;
      const dy = this.player.targetY - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 5) {
        dirX = dx / dist;
        dirY = dy / dist;
      } else {
        dirY = -1; // Default dash upwards
      }
    } else {
      const len = Math.hypot(dirX, dirY);
      dirX /= len;
      dirY /= len;
    }

    const dashSpeed = 16;
    this.player.dashVx = dirX * dashSpeed;
    this.player.dashVy = dirY * dashSpeed;

    // Emit dash dust
    const charConfig = CHARACTERS.find(c => c.id === this.characterId) || CHARACTERS[0];
    this.particles.emitPowerUp(this.player.x, this.player.y, charConfig.colors.glow);
  }

  public start(
    mode: GameMode,
    level?: LevelConfig,
    daily?: DailyChallengeInfo
  ) {
    this.mode = mode;
    this.currentLevel = level || null;
    this.dailyChallenge = daily || null;

    if (this.currentLevel) {
      this.themeRenderer.setTheme(this.currentLevel.theme);
    } else if (this.dailyChallenge) {
      this.themeRenderer.setTheme(this.dailyChallenge.theme);
    }

    this.resetGameState();
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public restart() {
    this.start(this.mode, this.currentLevel || undefined, this.dailyChallenge || undefined);
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private resetGameState() {
    this.player.x = this.width / 2;
    this.player.y = this.height * 0.78;
    this.player.targetX = this.player.x;
    this.player.targetY = this.player.y;
    this.player.lives = 3;
    this.player.invincibleTimer = 1.0; // 1s starter shield
    this.player.dashCooldown = 0;
    this.player.dashDuration = 0;
    this.player.isDashing = false;
    this.player.hasShield = false;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboDecayTimer = 0;
    this.coinsCollectedThisRun = 0;
    this.elapsedTime = 0;
    this.timeAttackRemaining = 60;
    this.objectiveProgress = 0;
    this.hitsTakenInRun = 0;

    this.obstacles = [];
    this.coins = [];
    this.powerUps = [];
    this.activePowerUps.clear();
    this.floatingTexts = [];
    this.particles.clear();

    this.obstacleSpawnTimer = 0;
    this.coinSpawnTimer = 400;
    this.powerUpSpawnTimer = 2500;
    this.difficultyMultiplier = 1.0;
    this.screenShakeIntensity = 0;

    this.callbacks.onScoreUpdate(0, 0);
    this.callbacks.onCoinCollected?.(0);
    this.callbacks.onLivesUpdate(3, this.player.maxLives);
    this.callbacks.onPowerUpsUpdate([]);
    this.callbacks.onDashCooldownUpdate(0);
    this.callbacks.onObjectiveUpdate(0, this.getObjectiveTarget());
  }

  private getObjectiveTarget(): number {
    if (this.mode === 'levels' && this.currentLevel) {
      return this.currentLevel.objective.target;
    }
    if (this.mode === 'daily' && this.dailyChallenge) {
      return this.dailyChallenge.targetObjective.target;
    }
    if (this.mode === 'timeAttack') {
      return 60;
    }
    return 100;
  }

  // MAIN GAME LOOP
  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    if (this.isPaused) {
      this.draw();
      return;
    }

    const dt = Math.min(timestamp - this.lastTime, 40); // Cap frame delta to prevent physics jumps
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  // UPDATE ENGINE STATE
  private update(dt: number) {
    const dtSeconds = dt / 1000;
    this.elapsedTime += dtSeconds;

    // Time attack countdown
    if (this.mode === 'timeAttack') {
      this.timeAttackRemaining = Math.max(0, this.timeAttackRemaining - dtSeconds);
      this.callbacks.onObjectiveUpdate(Math.floor(60 - this.timeAttackRemaining), 60);
      if (this.timeAttackRemaining <= 0) {
        sound.playLevelComplete();
        this.triggerGameOver(true);
        return;
      }
    }

    // Level objective: survive_time check
    if (this.mode === 'levels' && this.currentLevel?.objective.type === 'survive_time') {
      this.objectiveProgress = Math.min(this.currentLevel.objective.target, Math.floor(this.elapsedTime));
      this.callbacks.onObjectiveUpdate(this.objectiveProgress, this.currentLevel.objective.target);
      if (this.elapsedTime >= this.currentLevel.objective.target) {
        this.triggerLevelComplete();
        return;
      }
    } else if (this.mode === 'daily' && this.dailyChallenge?.targetObjective.type === 'survive_time') {
      this.objectiveProgress = Math.min(this.dailyChallenge.targetObjective.target, Math.floor(this.elapsedTime));
      this.callbacks.onObjectiveUpdate(this.objectiveProgress, this.dailyChallenge.targetObjective.target);
      if (this.elapsedTime >= this.dailyChallenge.targetObjective.target) {
        this.triggerLevelComplete();
        return;
      }
    }

    if (this.mode === 'timeAttack') {
      this.timeAttackRemaining -= dtSeconds;
      this.callbacks.onTimeAttackTick?.(Math.max(0, Math.ceil(this.timeAttackRemaining)));
      if (this.timeAttackRemaining <= 0) {
        this.triggerGameOver(true);
        return;
      }
    }

    // Passive score accumulation (Surviving rewards points)
    const doubleScoreActive = this.activePowerUps.has('doubleScore');
    const scoreRate = (10 + this.combo * 2) * (doubleScoreActive ? 2 : 1);
    this.score += Math.floor(scoreRate * dtSeconds);

    // Difficulty scaling
    if (this.mode === 'classic') {
      this.difficultyMultiplier = 1.0 + Math.min(1.6, this.elapsedTime * 0.022);
    } else if (this.mode === 'levels' && this.currentLevel) {
      this.difficultyMultiplier = this.currentLevel.speedMultiplier;
    } else if (this.mode === 'daily') {
      this.difficultyMultiplier = this.dailyChallenge?.modifier === 'hyperSpeed' ? 1.5 : 1.25;
    }

    // Combo decay timer
    if (this.combo > 0) {
      this.comboDecayTimer -= dtSeconds;
      if (this.comboDecayTimer <= 0) {
        this.combo = 0;
        this.callbacks.onScoreUpdate(this.score, 0);
      }
    }

    // Active power-ups countdown
    const powerUpsList: PowerUpActive[] = [];
    this.activePowerUps.forEach((data, type) => {
      data.remaining -= dtSeconds;
      if (data.remaining <= 0) {
        this.activePowerUps.delete(type);
        sound.playPowerUpExpire();
        if (type === 'shield') this.player.hasShield = false;
      } else {
        powerUpsList.push({
          type,
          remainingTime: data.remaining,
          duration: data.duration
        });
      }
    });
    this.callbacks.onPowerUpsUpdate(powerUpsList);

    // Update Player & Controls
    this.updatePlayer(dt, dtSeconds);

    // Spawn & update Entities
    this.updateSpawners(dt);
    this.updateObstacles(dt, dtSeconds);
    this.updateCoins(dt, dtSeconds);
    this.updatePowerUps(dt, dtSeconds);
    this.updateFloatingTexts(dt);

    // Systems
    this.particles.update(dt);
    this.themeRenderer.update(dt, this.width, this.height);

    // Screen Shake damping
    if (this.screenShakeIntensity > 0) {
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - dt * 0.03);
    }
  }

  private updatePlayer(dt: number, dtSeconds: number) {
    // Keyboard input translation
    let moveX = 0;
    let moveY = 0;
    if (this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA']) moveX -= 1;
    if (this.keysPressed['ArrowRight'] || this.keysPressed['KeyD']) moveX += 1;
    if (this.keysPressed['ArrowUp'] || this.keysPressed['KeyW']) moveY -= 1;
    if (this.keysPressed['ArrowDown'] || this.keysPressed['KeyS']) moveY += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const kSpeed = this.player.speed * (this.activePowerUps.has('invincibility') ? 1.25 : 1.0);
      this.player.targetX += (moveX / len) * kSpeed * 1.5;
      this.player.targetY += (moveY / len) * kSpeed * 1.5;
    }

    // Clamp Target
    this.player.targetX = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.targetX));
    this.player.targetY = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.targetY));

    // Handle Dash
    if (this.player.isDashing) {
      this.player.x += this.player.dashVx;
      this.player.y += this.player.dashVy;
      this.player.dashDuration -= dtSeconds;
      if (this.player.dashDuration <= 0) {
        this.player.isDashing = false;
      }
    } else {
      // Smooth lerp to target
      const lerpFactor = 0.28;
      this.player.x += (this.player.targetX - this.player.x) * lerpFactor;
      this.player.y += (this.player.targetY - this.player.y) * lerpFactor;
    }

    // Bounds clamp
    this.player.x = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.y));

    // Dash cooldown
    if (this.player.dashCooldown > 0) {
      this.player.dashCooldown = Math.max(0, this.player.dashCooldown - dtSeconds);
      this.callbacks.onDashCooldownUpdate(this.player.dashCooldown / 1.0);
    }

    // Invincible timer
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer = Math.max(0, this.player.invincibleTimer - dtSeconds);
    }

    // Particle Trail
    this.player.trailTimer += dt;
    if (this.player.trailTimer >= 35 && !this.reducedMotion) {
      this.player.trailTimer = 0;
      const charConfig = CHARACTERS.find(c => c.id === this.characterId) || CHARACTERS[0];
      this.particles.emitPlayerTrail(this.player.x, this.player.y, charConfig.colors.trail);
    }
  }

  // SPAWNER LOGIC
  private updateSpawners(dt: number) {
    const isSlowMo = this.activePowerUps.has('slowmo');
    const timeScale = isSlowMo ? 0.5 : 1.0;

    // Obstacle Spawning
    this.obstacleSpawnTimer += dt * timeScale;
    let baseInterval = 1000;
    if (this.mode === 'levels' && this.currentLevel) {
      baseInterval = this.currentLevel.spawnInterval;
    } else if (this.mode === 'daily') {
      baseInterval = this.dailyChallenge?.modifier === 'hyperSpeed' ? 550 : 800;
    } else {
      // Classic mode progressive acceleration
      baseInterval = Math.max(380, 1100 - this.elapsedTime * 12);
    }

    if (this.obstacleSpawnTimer >= baseInterval) {
      this.obstacleSpawnTimer = 0;
      this.spawnObstacle();
    }

    // Coin Spawning
    this.coinSpawnTimer += dt;
    const isCoinFrenzy = this.dailyChallenge?.modifier === 'coinFrenzy';
    const coinInterval = isCoinFrenzy ? 800 : 2200;
    if (this.coinSpawnTimer >= coinInterval) {
      this.coinSpawnTimer = 0;
      this.spawnCoin();
    }

    // PowerUp Spawning (Every 12-16 seconds)
    this.powerUpSpawnTimer += dt;
    if (this.powerUpSpawnTimer >= 14000) {
      this.powerUpSpawnTimer = 0;
      this.spawnPowerUp();
    }
  }

  private spawnObstacle() {
    let allowed: ObstacleType[] = ['spike', 'movingSpike', 'fallingSpike', 'rotatingSpike', 'spikeWall', 'laser'];
    if (this.mode === 'levels' && this.currentLevel) {
      allowed = this.currentLevel.allowedObstacles;
    } else if (this.mode === 'daily') {
      if (this.dailyChallenge?.modifier === 'laserZone') allowed = ['laser', 'spike', 'spikeWall'];
      else if (this.dailyChallenge?.modifier === 'heavyRain') allowed = ['fallingSpike', 'spike'];
      else if (this.dailyChallenge?.modifier === 'reverseGravity') allowed = ['rotatingSpike', 'movingBlock', 'patternHazard'];
    }

    const type = allowed[Math.floor(Math.random() * allowed.length)];
    const speed = (2.6 + Math.random() * 1.8) * this.difficultyMultiplier;

    if (type === 'spikeWall') {
      // Horizontal wall with an opening for player to slip through
      const gapWidth = 75;
      const gapX = 30 + Math.random() * (this.width - 60 - gapWidth);
      this.obstacles.push({
        id: `wall_${Date.now()}_${Math.random()}`,
        type: 'spikeWall',
        x: 0,
        y: -30,
        vx: 0,
        vy: speed * 0.75,
        radius: 14,
        gapX,
        gapWidth,
        angle: 0
      });
    } else if (type === 'laser') {
      // Laser beam: telegraphed indicator line across screen, then triggers lethal beam
      const isHorizontal = Math.random() > 0.4;
      const x = isHorizontal ? 0 : 40 + Math.random() * (this.width - 80);
      const y = isHorizontal ? 60 + Math.random() * (this.height - 140) : 0;
      this.obstacles.push({
        id: `laser_${Date.now()}_${Math.random()}`,
        type: 'laser',
        x,
        y,
        vx: 0,
        vy: 0,
        width: isHorizontal ? this.width : 22,
        height: isHorizontal ? 22 : this.height,
        radius: 12,
        angle: isHorizontal ? 0 : Math.PI / 2,
        state: 'charging',
        timer: 0.75 // 750ms charging warning, then 400ms firing
      });
    } else if (type === 'rotatingSpike') {
      const x = 40 + Math.random() * (this.width - 80);
      this.obstacles.push({
        id: `rot_${Date.now()}_${Math.random()}`,
        type: 'rotatingSpike',
        x,
        y: -40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: speed * 0.8,
        radius: 22,
        angle: 0,
        vRot: 0.05 + Math.random() * 0.05
      });
    } else if (type === 'fallingSpike') {
      // Fast dropping spike telegraphed at top
      const x = 30 + Math.random() * (this.width - 60);
      this.obstacles.push({
        id: `fall_${Date.now()}_${Math.random()}`,
        type: 'fallingSpike',
        x,
        y: -30,
        vx: 0,
        vy: speed * 1.5,
        radius: 15,
        angle: 0,
        isTelegraph: true,
        timer: 0.4
      });
    } else if (type === 'movingSpike') {
      const x = 30 + Math.random() * (this.width - 60);
      this.obstacles.push({
        id: `move_${Date.now()}_${Math.random()}`,
        type: 'movingSpike',
        x,
        y: -30,
        vx: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 1.8),
        vy: speed * 0.9,
        radius: 16,
        angle: 0
      });
    } else {
      // Standard spike
      const x = 30 + Math.random() * (this.width - 60);
      this.obstacles.push({
        id: `spike_${Date.now()}_${Math.random()}`,
        type: 'spike',
        x,
        y: -30,
        vx: (Math.random() - 0.5) * 0.8,
        vy: speed,
        radius: 15,
        angle: 0
      });
    }
  }

  private spawnCoin() {
    this.coins.push({
      id: `coin_${Date.now()}_${Math.random()}`,
      x: 35 + Math.random() * (this.width - 70),
      y: -20,
      vy: 1.8 + Math.random() * 1.2,
      radius: 11,
      wobble: Math.random() * Math.PI
    });
  }

  private spawnPowerUp() {
    const types: PowerUpType[] = ['shield', 'slowmo', 'magnet', 'doubleScore', 'coinMultiplier', 'invincibility'];
    const chosen = types[Math.floor(Math.random() * types.length)];
    const colorMap: Record<PowerUpType, string> = {
      shield: '#38bdf8',
      slowmo: '#a855f7',
      magnet: '#f97316',
      doubleScore: '#eab308',
      coinMultiplier: '#22c55e',
      dash: '#ec4899',
      invincibility: '#facc15'
    };

    this.powerUps.push({
      id: `pw_${Date.now()}_${Math.random()}`,
      type: chosen,
      x: 40 + Math.random() * (this.width - 80),
      y: -30,
      vy: 2.0,
      radius: 16,
      color: colorMap[chosen]
    });
  }

  // ENTITY UPDATES & COLLISIONS
  private updateObstacles(dt: number, dtSeconds: number) {
    const isSlowMo = this.activePowerUps.has('slowmo');
    const timeScale = isSlowMo ? 0.5 : 1.0;
    const isInvincible = this.activePowerUps.has('invincibility') || this.player.isDashing;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Laser handling
      if (obs.type === 'laser') {
        obs.timer = (obs.timer || 0) - dtSeconds;
        if (obs.state === 'charging' && (obs.timer || 0) <= 0) {
          obs.state = 'firing';
          obs.timer = 0.45; // Fires lethal beam for 450ms
          sound.playHit(); // audio warning zap
        } else if (obs.state === 'firing') {
          // Check collision with laser beam
          const inLaser = (obs.angle === 0)
            ? Math.abs(this.player.y - obs.y) < (obs.radius + this.player.radius)
            : Math.abs(this.player.x - obs.x) < (obs.radius + this.player.radius);

          if (inLaser && !isInvincible && this.player.invincibleTimer <= 0) {
            this.handlePlayerHit(obs.x || this.player.x, obs.y || this.player.y);
          }

          if ((obs.timer || 0) <= 0) {
            // Laser done
            this.obstacles.splice(i, 1);
            this.registerDodge();
            continue;
          }
        }
        continue;
      }

      // Moving spikes horizontal bounce
      if (obs.type === 'movingSpike') {
        obs.x += obs.vx * timeScale;
        if (obs.x <= obs.radius || obs.x >= this.width - obs.radius) {
          obs.vx = -obs.vx;
        }
      }

      // Rotating spikes
      if (obs.vRot !== undefined) {
        obs.angle += obs.vRot * timeScale;
      }

      // Advance obstacle vertically
      obs.y += obs.vy * timeScale;

      // SpikeWall collision
      if (obs.type === 'spikeWall') {
        const wallY = obs.y;
        const thickness = 24;
        const playerY = this.player.y;
        const playerX = this.player.x;

        if (Math.abs(playerY - wallY) < (thickness / 2 + this.player.radius)) {
          // Check if player is NOT inside the gap
          const inGap = obs.gapX !== undefined && obs.gapWidth !== undefined &&
            (playerX - this.player.radius > obs.gapX) &&
            (playerX + this.player.radius < obs.gapX + obs.gapWidth);

          if (!inGap) {
            if (isInvincible) {
              // Destroy wall
              this.particles.emitHit(playerX, wallY, '#facc15');
              this.obstacles.splice(i, 1);
              continue;
            } else if (this.player.invincibleTimer <= 0) {
              this.handlePlayerHit(playerX, wallY);
            }
          }
        }

        // Passed screen bottom
        if (obs.y > this.height + 50) {
          this.obstacles.splice(i, 1);
          this.registerDodge();
          continue;
        }
        continue;
      }

      // Circular collision check for standard/moving/rotating/falling spikes
      const dx = this.player.x - obs.x;
      const dy = this.player.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const hitDist = (this.player.radius * 0.75) + (obs.radius * 0.75); // Slightly forgiving hitbox

      if (dist < hitDist) {
        if (isInvincible) {
          // Smash obstacle
          sound.playHit();
          this.particles.emitHit(obs.x, obs.y, '#facc15');
          this.addScore(50);
          this.createFloatingText('+50 SMASH!', obs.x, obs.y, '#facc15');
          this.obstacles.splice(i, 1);
          continue;
        } else if (this.player.invincibleTimer <= 0) {
          this.handlePlayerHit(obs.x, obs.y);
          this.obstacles.splice(i, 1);
          continue;
        }
      }

      // Check near-miss dodge award
      if (!obs.dodged && obs.y > this.player.y + 10) {
        obs.dodged = true;
        this.registerDodge();
      }

      // Offscreen despawn
      if (obs.y > this.height + 50) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private registerDodge() {
    this.combo++;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    this.comboDecayTimer = 3.2; // 3.2s to maintain combo
    sound.playCombo(this.combo);

    const points = 10 * Math.min(10, Math.floor(1 + this.combo * 0.5));
    const doubleScoreActive = this.activePowerUps.has('doubleScore');
    const finalPoints = points * (doubleScoreActive ? 2 : 1);

    this.addScore(finalPoints);
    this.particles.emitComboDodge(this.player.x, this.player.y, this.combo);

    if (this.combo % 5 === 0) {
      this.createFloatingText(`COMBO x${this.combo}!`, this.player.x, this.player.y - 25, '#38bdf8');
    }

    // Objective checks: dodge_spikes or reach_combo
    if (this.mode === 'levels' && this.currentLevel) {
      if (this.currentLevel.objective.type === 'dodge_spikes') {
        this.objectiveProgress++;
        this.callbacks.onObjectiveUpdate(this.objectiveProgress, this.currentLevel.objective.target);
        if (this.objectiveProgress >= this.currentLevel.objective.target) {
          this.triggerLevelComplete();
        }
      } else if (this.currentLevel.objective.type === 'reach_combo') {
        this.objectiveProgress = Math.max(this.objectiveProgress, this.combo);
        this.callbacks.onObjectiveUpdate(this.objectiveProgress, this.currentLevel.objective.target);
        if (this.combo >= this.currentLevel.objective.target) {
          this.triggerLevelComplete();
        }
      }
    }
  }

  private handlePlayerHit(hitX: number, hitY: number) {
    this.hitsTakenInRun++;
    sound.playHit();
    this.screenShakeIntensity = this.reducedMotion ? 3 : 14;

    // Reset combo
    if (this.combo > 0) {
      this.createFloatingText('COMBO LOST!', this.player.x, this.player.y - 30, '#ef4444');
      this.combo = 0;
      this.callbacks.onScoreUpdate(this.score, 0);
    }

    if (this.player.hasShield) {
      // Shield absorbs the blow!
      this.player.hasShield = false;
      this.activePowerUps.delete('shield');
      this.player.invincibleTimer = 1.2; // Brief invincibility
      this.particles.emitHit(hitX, hitY, '#38bdf8');
      this.createFloatingText('SHIELD BROKEN!', this.player.x, this.player.y - 30, '#38bdf8');
      return;
    }

    this.player.lives--;
    this.player.invincibleTimer = 1.6; // 1.6s invincibility frames
    this.particles.emitHit(hitX, hitY, '#ef4444');
    this.callbacks.onLivesUpdate(this.player.lives, this.player.maxLives);

    if (this.player.lives <= 0) {
      sound.playGameOver();
      this.triggerGameOver(false);
    }
  }

  private updateCoins(dt: number, dtSeconds: number) {
    const hasMagnet = this.activePowerUps.has('magnet');
    const hasCoinMult = this.activePowerUps.has('coinMultiplier');

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.wobble += 0.08;

      if (hasMagnet) {
        // Pull towards player
        const dx = this.player.x - coin.x;
        const dy = this.player.y - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 260) {
          coin.x += (dx / dist) * 7.5;
          coin.y += (dy / dist) * 7.5;
        } else {
          coin.y += coin.vy;
        }
      } else {
        coin.y += coin.vy;
      }

      // Collect coin
      const dist = Math.hypot(this.player.x - coin.x, this.player.y - coin.y);
      if (dist < this.player.radius + coin.radius + 6) {
        sound.playCoin();
        const earned = hasCoinMult ? 2 : 1;
        this.coinsCollectedThisRun += earned;
        this.addScore(earned * 25);
        this.particles.emitCoinBurst(coin.x, coin.y);
        this.createFloatingText(`+${earned} COIN`, coin.x, coin.y, '#facc15');
        this.callbacks.onCoinCollected?.(this.coinsCollectedThisRun);
        this.coins.splice(i, 1);

        // Level objective: collect_coins
        if (this.mode === 'levels' && this.currentLevel?.objective.type === 'collect_coins') {
          this.objectiveProgress = this.coinsCollectedThisRun;
          this.callbacks.onObjectiveUpdate(this.objectiveProgress, this.currentLevel.objective.target);
          if (this.coinsCollectedThisRun >= this.currentLevel.objective.target) {
            this.triggerLevelComplete();
          }
        }
        continue;
      }

      if (coin.y > this.height + 30) {
        this.coins.splice(i, 1);
      }
    }
  }

  private updatePowerUps(dt: number, dtSeconds: number) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pw = this.powerUps[i];
      pw.y += pw.vy;

      const dist = Math.hypot(this.player.x - pw.x, this.player.y - pw.y);
      if (dist < this.player.radius + pw.radius + 6) {
        sound.playPowerUp();
        this.applyPowerUp(pw.type);
        this.particles.emitPowerUp(pw.x, pw.y, pw.color);
        this.createFloatingText(pw.type.toUpperCase() + '!', pw.x, pw.y, pw.color);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (pw.y > this.height + 30) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  private applyPowerUp(type: PowerUpType) {
    const durationMap: Record<PowerUpType, number> = {
      shield: 999, // until broken
      slowmo: 7.0,
      magnet: 8.0,
      doubleScore: 8.0,
      coinMultiplier: 8.0,
      dash: 5.0,
      invincibility: 5.0
    };

    if (type === 'shield') {
      this.player.hasShield = true;
    } else if (type === 'dash') {
      this.player.dashCooldown = 0; // immediate refresh
    }

    this.activePowerUps.set(type, {
      remaining: durationMap[type],
      duration: durationMap[type]
    });
  }

  private addScore(amount: number) {
    this.score += amount;
    this.callbacks.onScoreUpdate(this.score, this.combo);
  }

  private createFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale: 1.0,
      vy: -1.2
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.022;
      ft.scale = Math.min(1.2, ft.scale + 0.01);
      if (ft.alpha <= 0.05) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private triggerGameOver(timeOutSuccess: boolean = false) {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    const stats: GameOverStats = {
      score: this.score,
      highScore: this.score,
      isNewHighScore: false,
      coinsEarned: this.coinsCollectedThisRun,
      survivalTime: Math.floor(this.elapsedTime),
      maxCombo: this.maxCombo,
      spikesDodged: Math.max(0, Math.floor(this.score / 15)),
      nearMisses: Math.max(0, Math.floor(this.maxCombo * 1.5)),
      mode: this.mode,
      levelId: this.currentLevel?.id
    };
    this.callbacks.onGameOver(stats);
  }

  private triggerLevelComplete() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.playLevelComplete();
    this.particles.emitCelebration(this.width, this.height);

    let stars = 1;
    if (this.score >= (this.currentLevel ? this.currentLevel.rewardCoins * 6 : 400)) {
      stars++;
    }
    if (this.hitsTakenInRun === 0) {
      stars = 3;
    }

    const bonusScore = stars * 100;
    const levelStats: LevelStats = {
      levelId: this.currentLevel?.id || 1,
      score: this.score,
      stars,
      bonusScore,
      coinsEarned: this.coinsCollectedThisRun
    };

    this.callbacks.onLevelComplete(levelStats);
  }

  // RENDER GAME CANVAS
  public draw() {
    const ctx = this.ctx;

    // Reset transform momentarily to clear entire physical backing buffer
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    ctx.save();

    // Screen Shake offset
    if (this.screenShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Environmental Animated Theme Background
    this.themeRenderer.render(ctx, this.width, this.height);

    // 2. Draw Obstacles
    this.drawObstacles(ctx);

    // 3. Draw Coins
    this.drawCoins(ctx);

    // 4. Draw Power-Ups
    this.drawPowerUps(ctx);

    // 5. Draw Particles
    this.particles.render(ctx);

    // 6. Draw Player
    this.drawPlayer(ctx);

    // 7. Draw Floating Texts
    this.drawFloatingTexts(ctx);

    // 8. Draw Vignette & Danger border when low lives
    this.drawVignette(ctx);

    ctx.restore();
  }

  private drawPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const isInvincible = p.invincibleTimer > 0;
    const char = CHARACTERS.find(c => c.id === this.characterId) || CHARACTERS[0];

    // Invincibility flashing
    if (isInvincible && Math.floor(Date.now() / 80) % 2 === 0) {
      return; // Skip drawing every other frame for classic arcade flash
    }

    ctx.save();
    ctx.translate(p.x, p.y);

    // Shield Aura
    if (p.hasShield || this.activePowerUps.has('invincibility')) {
      ctx.save();
      const auraColor = this.activePowerUps.has('invincibility') ? '#facc15' : '#38bdf8';
      ctx.strokeStyle = auraColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = auraColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 8, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating shield energy arcs
      const rot = Date.now() * 0.003;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 12, rot, rot + Math.PI * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 12, rot + Math.PI, rot + Math.PI * 1.7);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Character Shape
    ctx.shadowColor = char.colors.glow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = char.colors.primary;
    ctx.strokeStyle = char.colors.secondary;
    ctx.lineWidth = 2;

    const r = p.radius;

    if (char.shape === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.2);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r * 1.2);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.shape === 'shield') {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.lineTo(r, -r * 0.5);
      ctx.lineTo(r * 0.8, r * 0.8);
      ctx.lineTo(0, r * 1.3);
      ctx.lineTo(-r * 0.8, r * 0.8);
      ctx.lineTo(-r, -r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.shape === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * r * 1.2, -Math.sin((18 + i * 72) * Math.PI / 180) * r * 1.2);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (r * 0.6), -Math.sin((54 + i * 72) * Math.PI / 180) * (r * 0.6));
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.shape === 'cube') {
      ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
      ctx.strokeRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
    } else {
      // Circle default
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Inner glowing core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawObstacles(ctx: CanvasRenderingContext2D) {
    for (const obs of this.obstacles) {
      ctx.save();

      if (obs.type === 'laser') {
        if (obs.state === 'charging') {
          // Warning laser indicator line
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          if (obs.angle === 0) {
            ctx.moveTo(0, obs.y);
            ctx.lineTo(this.width, obs.y);
          } else {
            ctx.moveTo(obs.x, 0);
            ctx.lineTo(obs.x, this.height);
          }
          ctx.stroke();
        } else if (obs.state === 'firing') {
          // Blazing laser beam with core & aura
          const beamWidth = 20;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 18;

          // Outer beam
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          if (obs.angle === 0) {
            ctx.fillRect(0, obs.y - beamWidth / 2, this.width, beamWidth);
          } else {
            ctx.fillRect(obs.x - beamWidth / 2, 0, beamWidth, this.height);
          }

          // Hot white center core
          ctx.fillStyle = '#ffffff';
          if (obs.angle === 0) {
            ctx.fillRect(0, obs.y - 3, this.width, 6);
          } else {
            ctx.fillRect(obs.x - 3, 0, 6, this.height);
          }
        }
        ctx.restore();
        continue;
      }

      if (obs.type === 'spikeWall') {
        // Red spike wall barrier with gap
        const wallH = 22;
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;

        const gapX = obs.gapX || 80;
        const gapW = obs.gapWidth || 75;

        // Left chunk
        if (gapX > 0) {
          ctx.fillRect(0, obs.y - wallH / 2, gapX, wallH);
          ctx.strokeRect(0, obs.y - wallH / 2, gapX, wallH);
        }
        // Right chunk
        const rightStart = gapX + gapW;
        if (rightStart < this.width) {
          ctx.fillRect(rightStart, obs.y - wallH / 2, this.width - rightStart, wallH);
          ctx.strokeRect(rightStart, obs.y - wallH / 2, this.width - rightStart, wallH);
        }

        // Draw warning stripes on wall
        ctx.fillStyle = '#facc15';
        for (let sx = 0; sx < gapX; sx += 20) {
          ctx.beginPath();
          ctx.moveTo(sx, obs.y - wallH / 2);
          ctx.lineTo(sx + 10, obs.y - wallH / 2);
          ctx.lineTo(sx + 4, obs.y + wallH / 2);
          ctx.lineTo(sx - 6, obs.y + wallH / 2);
          ctx.fill();
        }
        for (let sx = rightStart; sx < this.width; sx += 20) {
          ctx.beginPath();
          ctx.moveTo(sx, obs.y - wallH / 2);
          ctx.lineTo(sx + 10, obs.y - wallH / 2);
          ctx.lineTo(sx + 4, obs.y + wallH / 2);
          ctx.lineTo(sx - 6, obs.y + wallH / 2);
          ctx.fill();
        }

        ctx.restore();
        continue;
      }

      // Rotating spike wheel
      if (obs.type === 'rotatingSpike') {
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.angle);

        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#e11d48';

        // 6-bladed star saw
        const blades = 6;
        ctx.beginPath();
        for (let b = 0; b < blades; b++) {
          const a = (b * Math.PI * 2) / blades;
          const tipX = Math.cos(a) * obs.radius * 1.3;
          const tipY = Math.sin(a) * obs.radius * 1.3;
          const midX = Math.cos(a + Math.PI / blades) * (obs.radius * 0.45);
          const midY = Math.sin(a + Math.PI / blades) * (obs.radius * 0.45);
          if (b === 0) ctx.moveTo(tipX, tipY);
          else ctx.lineTo(tipX, tipY);
          ctx.lineTo(midX, midY);
        }
        ctx.closePath();
        ctx.fill();

        // Inner metallic hub
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        continue;
      }

      // Falling spike telegraph warning
      if (obs.type === 'fallingSpike' && obs.isTelegraph && obs.y < 40) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️', obs.x, 26);
      }

      // Standard / Moving / Falling Triangular Spike
      ctx.translate(obs.x, obs.y);
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 1.5;

      const r = obs.radius;
      ctx.beginPath();
      ctx.moveTo(0, r * 1.2); // Pointing downward towards player
      ctx.lineTo(r, -r);
      ctx.lineTo(-r, -r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sharp central highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.9);
      ctx.lineTo(0, -r * 0.6);
      ctx.stroke();

      ctx.restore();
    }
  }

  private drawCoins(ctx: CanvasRenderingContext2D) {
    for (const coin of this.coins) {
      ctx.save();
      ctx.translate(coin.x, coin.y);

      // Rotating wobble perspective
      const scaleX = Math.cos(coin.wobble);
      ctx.scale(scaleX, 1);

      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner golden rim
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Star stamp
      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 0);

      ctx.restore();
    }
  }

  private drawPowerUps(ctx: CanvasRenderingContext2D) {
    for (const pw of this.powerUps) {
      ctx.save();
      ctx.translate(pw.x, pw.y);

      // Glowing orb
      ctx.shadowColor = pw.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = pw.color;
      ctx.beginPath();
      ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing outer ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, pw.radius + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Icon initial letter
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = pw.type[0].toUpperCase();
      ctx.fillText(initial, 0, 1);

      ctx.restore();
    }
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '800 13px "Chakra Petch", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  private drawVignette(ctx: CanvasRenderingContext2D) {
    // Red pulse danger when down to 1 life
    if (this.player.lives === 1) {
      const pulse = Math.sin(Date.now() * 0.008) * 0.15 + 0.15;
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}
