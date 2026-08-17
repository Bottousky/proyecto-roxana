/**
 * Lighting — dynamic lights per node, ambient darkening.
 *
 * Each lamp / fountain / device has a light that:
 *   - turns on when its node is energised
 *   - turns off otherwise
 *   - has a falloff radius (in tiles)
 *
 * We render a separate additive pass over the scene with radial
 * gradients. The overall scene also has a slight darkening
 * ("dormant" feel) when no nodes are energised.
 */

import type { ElectricalGraph } from './ElectricalGraph.ts';
import type { World } from './World.ts';
import type { Camera } from './Camera.ts';

export class Lighting {
  private world: World;
  private intensities: Map<string, number> = new Map();
  private targetIntensities: Map<string, number> = new Map();
  private lampPositions: Map<string, { x: number; y: number; radius: number; color: string }> = new Map();

  constructor(_electrical: ElectricalGraph, world: World) {
    this.world = world;
    this.buildLamps();
  }

  private buildLamps(): void {
    // Map node ids to lamp positions and colors. Pulled from interactables.
    for (const inter of this.world.interactables) {
      if (inter.node && (inter.type === 'lamp' || inter.type === 'fountain')) {
        const isWarm = inter.id.includes('plaza') || inter.id.includes('taller') || inter.id === 'plaza_fountain';
        this.lampPositions.set(inter.node, {
          x: inter.x + 0.5,
          y: inter.y + 0.5,
          radius: 4.5,
          color: isWarm ? '#ffd28a' : '#a8e8ff',
        });
      }
    }
    // Add the Manantial node as a special lamp
    this.lampPositions.set('node_manantial_gate', {
      x: 47.5,
      y: 14,
      radius: 3.5,
      color: '#a8e8ff',
    });
    // Add a soft portal glow when source is energised
    this.lampPositions.set('src_portal', {
      x: 48,
      y: 64,
      radius: 3,
      color: '#e8a050',
    });
  }

  setNodeIntensity(nodeId: string, intensity: number): void {
    this.targetIntensities.set(nodeId, intensity);
  }

  update(dt: number): void {
    // Smoothly approach target intensities
    for (const [id, target] of this.targetIntensities) {
      const cur = this.intensities.get(id) ?? 0;
      const next = cur + (target - cur) * Math.min(1, dt * 4);
      this.intensities.set(id, next);
    }
  }

  render(ctx: CanvasRenderingContext2D, _cam: Camera): void {
    // Use additive blending
    ctx.globalCompositeOperation = 'lighter';
    for (const [id, info] of this.lampPositions) {
      const intensity = this.intensities.get(id) ?? 0;
      if (intensity <= 0.01) continue;
      const r = info.radius * intensity;
      const grad = ctx.createRadialGradient(info.x, info.y, 0, info.x, info.y, r);
      grad.addColorStop(0, this.colorWithAlpha(info.color, 0.5 * intensity));
      grad.addColorStop(0.5, this.colorWithAlpha(info.color, 0.2 * intensity));
      grad.addColorStop(1, this.colorWithAlpha(info.color, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(info.x - r, info.y - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private colorWithAlpha(hex: string, alpha: number): string {
    // Hex like '#rrggbb'
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
