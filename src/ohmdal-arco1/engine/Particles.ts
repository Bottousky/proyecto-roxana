/**
 * Particles — small visual effects.
 *
 * Used for: cable sparks, lamp ignition, water drops, dust, travel
 * pulses along cables. Each particle has position, velocity, lifetime,
 * and color.
 */

import type { Camera } from './Camera.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Particles {
  private particles: Particle[] = [];
  private maxParticles = 500;

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // Light gravity / drag
      p.vy += 0.3 * dt;
      p.vx *= 0.98;
    }
  }

  render(ctx: CanvasRenderingContext2D, _cam: Camera): void {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      const alpha = Math.min(1, p.life / p.maxLife);
      ctx.fillStyle = this.colorWithAlpha(p.color, alpha);
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Burst of particles at a point.
   */
  burst(x: number, y: number, count: number, color: string, speed: number = 1.5): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const s = Math.random() * speed + 0.3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s - 0.5,
        life: 0.5 + Math.random() * 0.6,
        maxLife: 0.5 + Math.random() * 0.6,
        color,
        size: 0.15 + Math.random() * 0.15,
      });
    }
  }

  /**
   * A quick spark (e.g. when a player examines a wire).
   */
  spark(x: number, y: number, count: number = 8): void {
    this.burst(x, y, count, '#fff4d8', 2.0);
  }

  /**
   * A water drop falling from the Manantial area.
   */
  waterDrop(x: number, y: number): void {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 0.4,
      y: y + (Math.random() - 0.5) * 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 1.5 + Math.random() * 1.0,
      life: 1.5,
      maxLife: 1.5,
      color: '#7ab0c8',
      size: 0.2,
    });
  }

  /**
   * Travel pulse along a path (a line of particles).
   */
  travel(path: { x: number; y: number }[], color: string, duration: number = 0.5): void {
    if (path.length < 2) return;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
      const n = Math.ceil(dist * 2);
      for (let j = 0; j < n; j++) {
        const t = j / n;
        const x = a.x + (b.x - a.x) * t + 0.5;
        const y = a.y + (b.y - a.y) * t + 0.5;
        this.particles.push({
          x, y, vx: 0, vy: 0,
          life: duration,
          maxLife: duration,
          color,
          size: 0.18,
        });
      }
    }
  }

  private colorWithAlpha(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
