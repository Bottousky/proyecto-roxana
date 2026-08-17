/**
 * Player — sprite, movement, collision, animation.
 *
 * Movement: tile-based with sub-tile resolution. Player position is
 * stored as float tile coordinates. Collision is checked against the
 * world's collision grid. Movement is integrated with damping.
 *
 * The player is drawn at 24x32 sprite size, with simple idle/walk
 * animation. Four directions, 2 frames each. Falls back to procedural
 * if sprite not loaded.
 */

import type { World } from './World.ts';
import type { Input } from './Input.ts';

export type Facing = 'down' | 'up' | 'left' | 'right';

export type SpriteProvider = (name: string) => HTMLImageElement | undefined;

export class Player {
  public x: number;
  public y: number;
  public facing: Facing = 'down';
  public speed: number = 3.2; // tiles per second
  private world: World;
  private input: Input;
  private walkFrame: number = 0;
  private walkTimer: number = 0;
  private walkFrameTime: number = 0.18;
  private spriteProvider: SpriteProvider = () => undefined;

  constructor(start: { x: number; y: number }, world: World, input: Input) {
    this.x = start.x;
    this.y = start.y;
    this.world = world;
    this.input = input;
  }

  setSpriteProvider(provider: SpriteProvider): void {
    this.spriteProvider = provider;
  }

  update(dt: number, canMove: boolean): void {
    if (!canMove) {
      this.walkFrame = 0;
      this.walkTimer = 0;
      return;
    }
    const ix = this.input.getMoveX();
    const iy = this.input.getMoveY();
    let dx = ix;
    let dy = iy;
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }
    // Update facing
    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }
    }
    // Try to move
    const stepX = dx * this.speed * dt;
    const stepY = dy * this.speed * dt;
    const newX = this.x + stepX;
    const newY = this.y + stepY;
    if (this.canMoveTo(newX, this.y)) this.x = newX;
    if (this.canMoveTo(this.x, newY)) this.y = newY;
    // Animation
    if (dx !== 0 || dy !== 0) {
      this.walkTimer += dt;
      if (this.walkTimer >= this.walkFrameTime) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
      }
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
    }
  }

  /**
   * Check if the player can stand at the given position. The player is
   * a circle of radius 0.3 tiles; we check the 4 cardinal points.
   */
  private canMoveTo(x: number, y: number): boolean {
    const r = 0.3;
    const points = [
      { x: x, y: y },
      { x: x - r, y: y },
      { x: x + r, y: y },
      { x: x, y: y - r },
      { x: x, y: y + r },
    ];
    for (const p of points) {
      const tx = Math.floor(p.x);
      const ty = Math.floor(p.y);
      if (this.world.isSolid(tx, ty)) return false;
    }
    return true;
  }

  render(ctx: CanvasRenderingContext2D, _time: number): void {
    const sprite = this.spriteProvider('player');
    const w = 24 / 16; // 1.5 tiles wide (sprite is 24x32, tile is 16)
    const h = 32 / 16; // 2 tiles tall
    const px = this.x - w / 2;
    const py = this.y - h / 2;

    // Shadow (always)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + h * 0.45, w * 0.35, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    if (sprite && sprite.naturalWidth > 0) {
      // Determine row in sprite sheet (4 rows: down, up, left, right)
      const dirMap: Record<Facing, number> = { down: 0, up: 1, left: 2, right: 3 };
      const row = dirMap[this.facing];
      // Determine column (3 frames per row: idle, walk1, walk2)
      // We use walkFrame 0 = idle, 1 = walk1, 2 = walk2.
      const col = this.walkFrame;
      // Sprite is laid out in a 12x4 grid (12 cols x 4 rows) of 24x32 each.
      // If the sprite is 288x128, we have 12x4. If 96x128, we have 4x4.
      // We assume 4x4 layout to be safe: 4 cols (idle, walk1, walk2, + 1) x 4 rows.
      // Let's try 3-col layout first: total width = 72, height = 128.
      const cellW = sprite.naturalWidth / 4; // assume 4 cols (1 idle + 2 walk + buffer)
      const cellH = sprite.naturalHeight / 4;
      const sx = col * cellW;
      const sy = row * cellH;
      // Walk animation: bob the sprite vertically
      const bob = (this.walkFrame === 1 || this.walkFrame === 2) ? -0.05 : 0;
      ctx.drawImage(
        sprite,
        sx, sy, cellW, cellH,
        px, py + bob, w, h
      );
      return;
    }

    // Procedural fallback — make the player VERY visible for debugging
    const colors: Record<Facing, { body: string; hair: string; pack: string }> = {
      down: { body: '#e8a050', hair: '#3a2818', pack: '#a04030' },
      up: { body: '#e8a050', hair: '#3a2818', pack: '#a04030' },
      left: { body: '#d08840', hair: '#3a2818', pack: '#a04030' },
      right: { body: '#d08840', hair: '#3a2818', pack: '#a04030' },
    };
    const c = colors[this.facing];
    // Body
    ctx.fillStyle = c.body;
    ctx.fillRect(px + w * 0.25, py + h * 0.35, w * 0.5, h * 0.5);
    // Head
    ctx.fillStyle = c.hair;
    ctx.fillRect(px + w * 0.3, py + h * 0.1, w * 0.4, h * 0.3);
    // Backpack (Instituto detail)
    ctx.fillStyle = c.pack;
    ctx.fillRect(px + w * 0.4, py + h * 0.4, w * 0.2, h * 0.35);
    // Eyes
    if (this.facing === 'down') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(px + w * 0.4, py + h * 0.4, w * 0.06, w * 0.06);
      ctx.fillRect(px + w * 0.55, py + h * 0.4, w * 0.06, w * 0.06);
    } else if (this.facing === 'left') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(px + w * 0.36, py + h * 0.4, w * 0.06, w * 0.06);
    } else if (this.facing === 'right') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(px + w * 0.58, py + h * 0.4, w * 0.06, w * 0.06);
    }
  }
}
