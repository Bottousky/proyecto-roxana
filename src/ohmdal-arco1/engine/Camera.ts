/**
 * Camera — top-down 3/4 view, follows the player with damping, with
 * region-based zoom and pan targets.
 *
 * Coordinates: world space is in tiles (1 tile = 1 m). The camera
 * operates in tile units. The renderer converts to pixels.
 */

import type { WorldTopology, CameraRegion } from '../data/types.ts';

export interface CameraTransform {
  x: number;
  y: number;
  zoom: number;
}

export class Camera {
  private width: number;
  private height: number;
  private topology: WorldTopology;

  private targetX: number;
  private targetY: number;
  private currentX: number;
  private currentY: number;
  private targetZoom: number;
  private currentZoom: number;

  private followX: number = 48;
  private followY: number = 30;

  // Pan target (for scripted cinematic moves like the entrance pan)
  private panTarget: { x: number; y: number; t: number; duration: number } | null = null;
  private panStart: { x: number; y: number; t: number; duration: number } | null = null;

  // Smoothing
  private damping: number = 0.12; // higher = snappier
  private zoomDamping: number = 0.06;

  private currentRegion: CameraRegion | null = null;

  constructor(width: number, height: number, topology: WorldTopology) {
    this.width = width;
    this.height = height;
    this.topology = topology;
    this.targetX = topology.playerStart.x;
    this.targetY = topology.playerStart.y;
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.targetZoom = topology.camera.defaultZoom;
    this.currentZoom = this.targetZoom;
  }

  follow(x: number, y: number, dt: number): void {
    this.followX = x;
    this.followY = y;

    // Update pan if active
    if (this.panTarget && this.panStart) {
      this.panStart.t += dt;
      const a = Math.min(1, this.panStart.t / this.panStart.duration);
      const eased = this.easeInOutCubic(a);
      this.currentX = this.panStart.x + (this.panTarget.x - this.panStart.x) * eased;
      this.currentY = this.panStart.y + (this.panTarget.y - this.panStart.y) * eased;
      if (a >= 1) {
        this.panTarget = null;
        this.panStart = null;
      }
    } else {
      // Smooth follow
      this.currentX += (this.followX - this.currentX) * this.damping;
      this.currentY += (this.followY - this.currentY) * this.damping;
    }

    // Determine current region
    this.currentRegion = this.findRegion(this.currentX, this.currentY);
    if (this.currentRegion) {
      this.targetZoom = this.currentRegion.zoom;
    } else {
      this.targetZoom = this.topology.camera.defaultZoom;
    }
    this.currentZoom += (this.targetZoom - this.currentZoom) * this.zoomDamping;

    // Clamp to world bounds. The viewport in world units is (width /
    // zoom / tileSize) tiles. The camera must be at least halfW from
    // each edge.
    const tileSize = this.topology.tileSize;
    const halfW = (this.width / this.currentZoom / tileSize) / 2;
    const halfH = (this.height / this.currentZoom / tileSize) / 2;
    const minX = Math.min(halfW, this.topology.width / 2);
    const maxX = Math.max(this.topology.width - halfW, this.topology.width / 2);
    const minY = Math.min(halfH, this.topology.height / 2);
    const maxY = Math.max(this.topology.height - halfH, this.topology.height / 2);
    this.currentX = Math.max(minX, Math.min(maxX, this.currentX));
    this.currentY = Math.max(minY, Math.min(maxY, this.currentY));
  }

  getTransform(): CameraTransform {
    return { x: this.currentX, y: this.currentY, zoom: this.currentZoom };
  }

  getCurrentRegion(): string {
    return this.currentRegion?.name ?? 'unknown';
  }

  getRegionName(): string {
    if (!this.currentRegion) return '—';
    const map: Record<string, string> = {
      sendero_s: 'Sendero Sur',
      camino: 'Camino',
      plaza: 'Plaza de Ohm',
      puerta: 'Puerta de Ohm',
      manantial: 'Manantial',
      taller: 'Taller de Lumen',
    };
    return map[this.currentRegion.name] ?? this.currentRegion.name;
  }

  getZoom(): number {
    return this.currentZoom;
  }

  getViewportInTiles(): { w: number; h: number } {
    const tileSize = this.topology.tileSize;
    return {
      w: this.width / this.currentZoom / tileSize,
      h: this.height / this.currentZoom / tileSize,
    };
  }

  /**
   * Pan the camera to a target world position over `duration` seconds.
   * Used for the entrance pan and other cinematic beats.
   */
  panTo(x: number, y: number, duration: number): void {
    this.panStart = { x: this.currentX, y: this.currentY, t: 0, duration };
    this.panTarget = { x, y, t: 0, duration };
  }

  private findRegion(x: number, y: number): CameraRegion | null {
    for (const r of this.topology.camera.regions) {
      const b = r.bounds;
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        return r;
      }
    }
    return null;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
