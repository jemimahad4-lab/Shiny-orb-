export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'square' | 'sparkle' | 'ring' | 'star';
  rotation?: number;
  vRot?: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  private maxParticles: number = 220;

  constructor(quality: 'high' | 'medium' | 'low' = 'high') {
    if (quality === 'low') this.maxParticles = 80;
    else if (quality === 'medium') this.maxParticles = 140;
    else this.maxParticles = 240;
  }

  public setQuality(quality: 'high' | 'medium' | 'low') {
    if (quality === 'low') this.maxParticles = 80;
    else if (quality === 'medium') this.maxParticles = 140;
    else this.maxParticles = 240;
  }

  public update(dt: number) {
    const timeScale = Math.min(2, Math.max(0.2, dt / 16.666));

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.alpha -= p.decay * timeScale;
      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * timeScale;
      }

      if (p.alpha <= 0.02) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.shape === 'square') {
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (p.shape === 'sparkle') {
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.3, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // default circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public emitCoinBurst(x: number, y: number) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 2.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.3 ? '#facc15' : '#fef08a',
        alpha: 1,
        decay: 0.03 + Math.random() * 0.02,
        shape: 'sparkle',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  public emitHit(x: number, y: number, color: string = '#ef4444') {
    const count = 18;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 0.04 + Math.random() * 0.03,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3
      });
    }

    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#ffffff',
      alpha: 0.8,
      decay: 0.05,
      shape: 'ring'
    });
  }

  public emitPowerUp(x: number, y: number, color: string) {
    const count = 16;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.025 + Math.random() * 0.02,
        shape: 'sparkle',
        rotation: Math.random() * Math.PI,
        vRot: 0.1
      });
    }
  }

  public emitComboDodge(x: number, y: number, combo: number) {
    const count = Math.min(10, 4 + Math.floor(combo / 5));
    const colors = ['#38bdf8', '#818cf8', '#ec4899', '#f59e0b'];
    const chosenColor = colors[Math.min(colors.length - 1, Math.floor(combo / 10))];

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 2 + Math.random() * 3,
        color: chosenColor,
        alpha: 0.9,
        decay: 0.035,
        shape: 'sparkle'
      });
    }
  }

  public emitPlayerTrail(x: number, y: number, color: string) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 1.5 + Math.random() * 1.5,
      size: 4 + Math.random() * 3,
      color,
      alpha: 0.65,
      decay: 0.045
    });
  }

  public emitCelebration(width: number, height: number) {
    const count = 40;
    const colors = ['#facc15', '#38bdf8', '#f43f5e', '#a855f7', '#22c55e', '#fb923c'];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        x: Math.random() * width,
        y: -10,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.015,
        shape: 'square',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.15
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
