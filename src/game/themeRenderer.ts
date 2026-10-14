import { ThemeId } from '../types/game';
import { THEMES } from '../data/cosmetics';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  active: boolean;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  wobbleSpeed: number;
}

interface Snowflake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  wobble: number;
}

interface CyberNode {
  x: number;
  y: number;
  size: number;
  speed: number;
  char: string;
}

export class ThemeRenderer {
  private theme: ThemeId = 'classic';
  private targetTheme: ThemeId = 'classic';
  private transitionAlpha: number = 0; // 0 = fully target, 1 = transitioning

  // Theme-specific state caches
  private stars: Star[] = [];
  private shootingStars: ShootingStar[] = [];
  private embers: Ember[] = [];
  private snowflakes: Snowflake[] = [];
  private cyberNodes: CyberNode[] = [];
  private gridOffset: number = 0;
  private time: number = 0;

  constructor() {
    this.initElements();
  }

  public setTheme(newTheme: ThemeId) {
    if (newTheme === this.theme) return;
    this.targetTheme = newTheme;
    this.transitionAlpha = 1.0;
  }

  public getTheme(): ThemeId {
    return this.targetTheme;
  }

  private initElements() {
    // Night Stars
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * 800,
        y: Math.random() * 1000,
        size: 0.8 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.8,
        twinkleSpeed: 0.02 + Math.random() * 0.04
      });
    }

    // Embers for Fire
    this.embers = [];
    for (let i = 0; i < 35; i++) {
      this.embers.push({
        x: Math.random() * 800,
        y: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1 - Math.random() * 2.5,
        size: 1.5 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.7,
        wobbleSpeed: 0.03 + Math.random() * 0.05
      });
    }

    // Snowflakes for Ice
    this.snowflakes = [];
    for (let i = 0; i < 45; i++) {
      this.snowflakes.push({
        x: Math.random() * 800,
        y: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 1.2 + Math.random() * 2,
        size: 1.5 + Math.random() * 3.5,
        alpha: 0.3 + Math.random() * 0.7,
        wobble: Math.random() * Math.PI
      });
    }

    // Cyber Nodes
    const chars = ['0', '1', '<', '>', '/', '#', '$', '+', '='];
    this.cyberNodes = [];
    for (let i = 0; i < 30; i++) {
      this.cyberNodes.push({
        x: Math.random() * 800,
        y: Math.random() * 1000,
        size: 10 + Math.random() * 6,
        speed: 1.5 + Math.random() * 2.5,
        char: chars[Math.floor(Math.random() * chars.length)]
      });
    }
  }

  public update(dt: number, width: number, height: number) {
    this.time += dt * 0.001;
    this.gridOffset = (this.gridOffset + dt * 0.04) % 40;

    // Transition progress
    if (this.transitionAlpha > 0) {
      this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 0.0035);
      if (this.transitionAlpha === 0) {
        this.theme = this.targetTheme;
      }
    }

    const activeTheme = this.targetTheme;

    // Update Night
    if (activeTheme === 'night' || this.theme === 'night') {
      for (const star of this.stars) {
        star.alpha = 0.3 + Math.sin(this.time * 2 + star.twinkleSpeed * 100) * 0.4;
      }
      // Occasional shooting star
      if (Math.random() < 0.008 && this.shootingStars.length < 2) {
        this.shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          vx: 7 + Math.random() * 5,
          vy: 4 + Math.random() * 3,
          length: 50 + Math.random() * 50,
          alpha: 1,
          active: true
        });
      }
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const ss = this.shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= 0.03;
        if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
          this.shootingStars.splice(i, 1);
        }
      }
    }

    // Update Fire Embers
    if (activeTheme === 'fire' || this.theme === 'fire') {
      for (const e of this.embers) {
        e.y += e.vy;
        e.x += e.vx + Math.sin(this.time * 3 + e.wobbleSpeed) * 0.8;
        if (e.y < -10) {
          e.y = height + 10;
          e.x = Math.random() * width;
        }
      }
    }

    // Update Snowflakes
    if (activeTheme === 'ice' || this.theme === 'ice') {
      for (const s of this.snowflakes) {
        s.y += s.vy;
        s.wobble += 0.03;
        s.x += s.vx + Math.sin(s.wobble) * 0.6;
        if (s.y > height + 10) {
          s.y = -10;
          s.x = Math.random() * width;
        }
      }
    }

    // Update Cyber
    if (activeTheme === 'cyber' || this.theme === 'cyber') {
      for (const c of this.cyberNodes) {
        c.y += c.speed;
        if (c.y > height + 20) {
          c.y = -20;
          c.x = Math.random() * width;
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // If transitioning, render current and blend target
    if (this.transitionAlpha > 0 && this.theme !== this.targetTheme) {
      this.drawSingleTheme(ctx, this.theme, width, height, 1);
      this.drawSingleTheme(ctx, this.targetTheme, width, height, 1 - this.transitionAlpha);
    } else {
      this.drawSingleTheme(ctx, this.targetTheme, width, height, 1);
    }
  }

  private drawSingleTheme(
    ctx: CanvasRenderingContext2D,
    themeId: ThemeId,
    width: number,
    height: number,
    globalAlpha: number
  ) {
    const config = THEMES.find(t => t.id === themeId) || THEMES[0];
    ctx.save();
    ctx.globalAlpha = globalAlpha;

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, config.bgGradient[0]);
    bgGrad.addColorStop(1, config.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    switch (themeId) {
      case 'classic':
        this.renderClassic(ctx, width, height, config.gridColor);
        break;
      case 'night':
        this.renderNight(ctx, width, height);
        break;
      case 'fire':
        this.renderFire(ctx, width, height);
        break;
      case 'ice':
        this.renderIce(ctx, width, height);
        break;
      case 'neon':
        this.renderNeon(ctx, width, height);
        break;
      case 'cyber':
        this.renderCyber(ctx, width, height);
        break;
    }

    ctx.restore();
  }

  private renderClassic(ctx: CanvasRenderingContext2D, width: number, height: number, gridColor: string) {
    // Subtle arcade moving grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const spacing = 40;

    // Vertical lines
    for (let x = 0; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal moving lines
    for (let y = this.gridOffset; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Floating subtle geometric diamonds
    ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
    const size = 60;
    const t = this.time * 0.5;
    for (let i = 0; i < 4; i++) {
      const cx = (width * (i + 1)) / 5 + Math.sin(t + i) * 20;
      const cy = (height * (i + 1)) / 5 + Math.cos(t + i) * 20;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.5 + i);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  private renderNight(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Crescent Moon
    const moonX = width - 50;
    const moonY = 55;
    const moonR = 24;

    // Moon soft glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 65);
    moonGlow.addColorStop(0, 'rgba(165, 180, 252, 0.18)');
    moonGlow.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.fillStyle = '#e0e7ff';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    // Inner shadow cutout for crescent
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(moonX + 9, moonY - 5, moonR * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling Stars
    for (const star of this.stars) {
      const sx = (star.x / 800) * width;
      const sy = (star.y / 1000) * height;
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shooting stars
    for (const ss of this.shootingStars) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${ss.alpha})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - (ss.vx / 8) * ss.length, ss.y - (ss.vy / 8) * ss.length);
      ctx.stroke();
    }
  }

  private renderFire(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Bottom heat shimmer / volcanic glow
    const bottomGlow = ctx.createLinearGradient(0, height - 120, 0, height);
    bottomGlow.addColorStop(0, 'rgba(234, 88, 12, 0)');
    bottomGlow.addColorStop(0.7, 'rgba(234, 88, 12, 0.25)');
    bottomGlow.addColorStop(1, 'rgba(239, 68, 68, 0.45)');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, height - 120, width, 120);

    // Rising animated flame curves
    ctx.fillStyle = 'rgba(249, 115, 22, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 30) {
      const wave = Math.sin(x * 0.03 + this.time * 4) * 20;
      ctx.lineTo(x, height - 40 + wave);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Rising glowing embers
    for (const e of this.embers) {
      const ex = (e.x / 800) * width;
      const ey = (e.y / 1000) * height;
      ctx.fillStyle = `rgba(251, 146, 60, ${e.alpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, e.size, 0, Math.PI * 2);
      ctx.fill();

      // Mini glow
      ctx.fillStyle = `rgba(239, 68, 68, ${e.alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(ex, ey, e.size * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderIce(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Top frost vignette
    const topGlow = ctx.createLinearGradient(0, 0, 0, 100);
    topGlow.addColorStop(0, 'rgba(103, 232, 249, 0.25)');
    topGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, 100);

    // Falling crystalline snowflakes
    for (const s of this.snowflakes) {
      const sx = (s.x / 800) * width;
      const sy = (s.y / 1000) * height;
      ctx.fillStyle = `rgba(224, 242, 254, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();

      // Subtle sparkle arms
      if (s.size > 2.5) {
        ctx.strokeStyle = `rgba(165, 243, 252, ${s.alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - s.size * 1.5, sy);
        ctx.lineTo(sx + s.size * 1.5, sy);
        ctx.moveTo(sx, sy - s.size * 1.5);
        ctx.lineTo(sx, sy + s.size * 1.5);
        ctx.stroke();
      }
    }
  }

  private renderNeon(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Horizon perspective grid
    const horizon = height * 0.75;

    // Horizon glowing sun/pulse
    const sunGrad = ctx.createRadialGradient(width / 2, horizon, 20, width / 2, horizon, 140);
    sunGrad.addColorStop(0, 'rgba(217, 70, 239, 0.25)');
    sunGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.08)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width / 2, horizon, 140, 0, Math.PI * 2);
    ctx.fill();

    // Perspective lines from horizon to bottom
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.18)';
    ctx.lineWidth = 1;
    const rayCount = 14;
    for (let i = 0; i <= rayCount; i++) {
      const bottomX = (width * i) / rayCount;
      ctx.beginPath();
      ctx.moveTo(width / 2, horizon);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    // Moving horizontal grid lines accelerating toward bottom
    const gridSpeed = (this.time * 60) % 30;
    for (let i = 0; i < 6; i++) {
      const progress = ((i * 30 + gridSpeed) % 180) / 180;
      const y = horizon + Math.pow(progress, 2.2) * (height - horizon);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Top vertical synth lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, horizon);
      ctx.stroke();
    }
  }

  private renderCyber(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Subtle digital matrix grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    const cyberGrid = 32;
    for (let x = 0; x <= width; x += cyberGrid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = this.gridOffset; y <= height; y += cyberGrid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Digital matrix particles / characters streaming downwards
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
    for (const c of this.cyberNodes) {
      const cx = (c.x / 800) * width;
      const cy = (c.y / 1000) * height;
      ctx.fillText(c.char, cx, cy);
    }
  }
}
