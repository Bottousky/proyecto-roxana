import Phaser from 'phaser';
import { ROOMS, type ThingDef, type DoorDef } from './rooms';
import { state, hooks, save } from '../state';
import { uiOpen, el } from '../ui/overlay';
import { say } from '../ui/dialog';
import { initJoystick, getJoystickDir } from '../ui/joystick';

export const W = 960;
export const H = 540;
const B = 26; // grosor del borde
const SPEED = 250;
const PLAYER_R = 12;
const INTERACT_DIST = 72;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlacedThing {
  def: ThingDef;
  bounds: Rect;
}

interface PlacedDoor {
  def: DoorDef;
  bounds: Rect;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class ExplorationScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private roomObjects: Phaser.GameObjects.GameObject[] = [];
  private things: PlacedThing[] = [];
  private doors: PlacedDoor[] = [];
  private solids: Rect[] = [];
  private moveTarget: { x: number; y: number } | null = null;
  private doorCooldown = 0;
  private nearThing: PlacedThing | null = null;
  private lastX = 0;
  private lastY = 0;
  private stuckMs = 0;

  constructor() {
    super('explore');
  }

  create(): void {
    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      e: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };

    this.player = this.add.circle(W / 2, H - 90, PLAYER_R, 0xe8dcc0);
    this.player.setStrokeStyle(2, 0x8a7c50);
    this.player.setDepth(10);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointer(p));

    initJoystick();

    const actionBtn = el<HTMLButtonElement>('action-btn');
    actionBtn.addEventListener('click', () => {
      if (this.nearThing && !uiOpen()) this.nearThing.def.onInteract();
    });
    actionBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.nearThing && !uiOpen()) this.nearThing.def.onInteract();
    });

    hooks.goto = (room, spawn) => this.loadRoom(room, spawn, true);
    hooks.refresh = () =>
      this.loadRoom(state.room, { x: this.player.x, y: this.player.y }, false);

    this.loadRoom(state.room, undefined, true);
  }

  private playerBounds(x = this.player.x, y = this.player.y): Rect {
    return { x: x - PLAYER_R, y: y - PLAYER_R, w: PLAYER_R * 2, h: PLAYER_R * 2 };
  }

  private collides(x: number, y: number): boolean {
    const pb = this.playerBounds(x, y);
    if (pb.x < B || pb.y < B || pb.x + pb.w > W - B || pb.y + pb.h > H - B) {
      // dentro del borde, salvo que esté sobre una puerta ABIERTA:
      // las trabadas son sólidas (si no, el jugador puede meterse en la puerta
      // y terminar empujado fuera del mapa)
      const sobrePuertaAbierta = this.doors.some(
        (d) => !d.def.locked?.() && rectsOverlap(pb, d.bounds),
      );
      if (!sobrePuertaAbierta) return true;
    }
    return this.solids.some((s) => rectsOverlap(pb, s));
  }

  private loadRoom(
    id: string,
    spawn: { x: number; y: number } | undefined,
    fireEnter: boolean,
  ): void {
    const def = ROOMS[id];
    if (!def) return;
    state.room = id;
    save();

    for (const o of this.roomObjects) o.destroy();
    this.roomObjects = [];
    this.things = [];
    this.doors = [];
    this.solids = [];
    this.moveTarget = null;
    this.nearThing = null;

    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.roomObjects.push(o);
      return o;
    };

    // piso y paredes
    add(this.add.rectangle(W / 2, H / 2, W, H, def.wall()));
    add(this.add.rectangle(W / 2, H / 2, W - 2 * B, H - 2 * B, def.floor()));
    add(
      this.add
        .text(36, 34, def.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '15px',
          color: '#9a92a8',
          fontStyle: 'italic',
        })
        .setDepth(20),
    );

    // puertas
    for (const d of def.doors) {
      const cx = d.x + d.w / 2;
      const cy = d.y + d.h / 2;
      add(this.add.rectangle(cx, cy, d.w, d.h, d.color ?? 0x50465e));
      const horizontal = d.w > d.h;
      const lx = Math.min(Math.max(cx, 90), W - 90);
      const ly = horizontal ? (cy < H / 2 ? cy + 28 : cy - 24) : cy - d.h / 2 - 14;
      add(
        this.add
          .text(lx, ly, d.label, {
            fontFamily: 'Segoe UI, sans-serif',
            fontSize: '12px',
            color: '#8d84a0',
          })
          .setOrigin(0.5),
      );
      // zona de activación inflada: la puerta visual vive dentro del borde,
      // el jugador debe poder dispararla al tocarla desde el interior de la sala
      this.doors.push({
        def: d,
        bounds: { x: d.x - 14, y: d.y - 14, w: d.w + 28, h: d.h + 28 },
      });
    }

    // objetos y personajes
    for (const t of def.things) {
      if (t.visible && !t.visible()) continue;
      const color = typeof t.color === 'function' ? t.color() : t.color;
      if (t.shape === 'circle') {
        const c = add(this.add.circle(t.x, t.y, t.w / 2, color));
        c.setStrokeStyle(2, 0x141119);
      } else {
        const r = add(this.add.rectangle(t.x, t.y, t.w, t.h, color));
        r.setStrokeStyle(2, 0x141119);
      }
      if (t.label) {
        add(
          this.add
            .text(t.x, t.y - t.h / 2 - 14, t.label, {
              fontFamily: 'Segoe UI, sans-serif',
              fontSize: '12px',
              color: '#cfc7da',
            })
            .setOrigin(0.5),
        );
      }
      const bounds: Rect = { x: t.x - t.w / 2, y: t.y - t.h / 2, w: t.w, h: t.h };
      this.things.push({ def: t, bounds });
      if (t.solid !== false) this.solids.push(bounds);
    }

    // posicionar al jugador
    const sp = spawn ?? { x: W / 2, y: H - 90 };
    this.player.setPosition(sp.x, sp.y);
    // si quedó dentro de algo sólido (spawn junto a una puerta), empujar hacia el centro
    let guard = 0;
    while (this.collides(this.player.x, this.player.y) && guard++ < 60) {
      const dx = W / 2 - this.player.x;
      const dy = H / 2 - this.player.y;
      const len = Math.hypot(dx, dy) || 1;
      this.player.setPosition(this.player.x + (dx / len) * 8, this.player.y + (dy / len) * 8);
    }
    this.doorCooldown = 700;

    if (fireEnter) def.onEnter?.();
  }

  private onPointer(p: Phaser.Input.Pointer): void {
    if (uiOpen()) return;
    const wx = p.worldX;
    const wy = p.worldY;
    for (const t of this.things) {
      const b = t.bounds;
      if (wx >= b.x - 8 && wx <= b.x + b.w + 8 && wy >= b.y - 8 && wy <= b.y + b.h + 8) {
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, cx, cy) <= INTERACT_DIST + b.w / 2) {
          t.def.onInteract();
        } else {
          this.moveTarget = { x: cx, y: cy };
        }
        return;
      }
    }
    this.moveTarget = { x: wx, y: wy };
  }

  update(_time: number, delta: number): void {
    const prompt = el('prompt');
    const actionBtn = el<HTMLButtonElement>('action-btn');
    if (uiOpen()) {
      prompt.classList.add('hidden');
      actionBtn.classList.add('hidden');
      return;
    }
    const dt = delta / 1000;
    this.doorCooldown = Math.max(0, this.doorCooldown - delta);

    // dirección de movimiento — teclado, joystick, o tap-to-move (en ese orden)
    let vx = 0;
    let vy = 0;
    const k = this.keys;
    if (k.up.isDown || k.w.isDown) vy -= 1;
    if (k.down.isDown || k.s.isDown) vy += 1;
    if (k.left.isDown || k.a.isDown) vx -= 1;
    if (k.right.isDown || k.d.isDown) vx += 1;

    if (vx === 0 && vy === 0) {
      const joy = getJoystickDir();
      if (joy.vx !== 0 || joy.vy !== 0) {
        vx = joy.vx;
        vy = joy.vy;
        this.moveTarget = null;
      }
    }

    if (vx !== 0 || vy !== 0) {
      this.moveTarget = null;
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) this.moveTarget = null;
      else {
        vx = dx / dist;
        vy = dy / dist;
      }
    }

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      const stepX = (vx / len) * SPEED * dt;
      const stepY = (vy / len) * SPEED * dt;
      if (!this.collides(this.player.x + stepX, this.player.y)) this.player.x += stepX;
      if (!this.collides(this.player.x, this.player.y + stepY)) this.player.y += stepY;
    }

    // si el tap-to-move quedó trabado contra algo, soltarlo
    if (this.moveTarget) {
      const moved = Math.hypot(this.player.x - this.lastX, this.player.y - this.lastY);
      this.stuckMs = moved < 0.4 ? this.stuckMs + delta : 0;
      if (this.stuckMs > 320) {
        this.moveTarget = null;
        this.stuckMs = 0;
      }
    }
    this.lastX = this.player.x;
    this.lastY = this.player.y;

    // puertas
    if (this.doorCooldown <= 0) {
      const pb = this.playerBounds();
      for (const d of this.doors) {
        if (!rectsOverlap(pb, d.bounds)) continue;
        const lockedLines = d.def.locked?.() ?? null;
        if (lockedLines) {
          // empujar al jugador SIEMPRE hacia el interior de la sala
          // (alejarlo "de la puerta" puede mandarlo fuera del mapa)
          const cx = d.bounds.x + d.bounds.w / 2;
          const cy = d.bounds.y + d.bounds.h / 2;
          const dx = W / 2 - cx;
          const dy = H / 2 - cy;
          const len = Math.hypot(dx, dy) || 1;
          this.player.setPosition(cx + (dx / len) * 80, cy + (dy / len) * 80);
          this.moveTarget = null;
          this.doorCooldown = 900;
          say(lockedLines);
        } else {
          this.loadRoom(d.def.to, d.def.spawn, true);
        }
        return;
      }
    }

    // red de seguridad: si el jugador quedó en una posición ilegal
    // (empujones, cambios de flags, etc.), devolverlo al piso
    let guard = 0;
    while (this.collides(this.player.x, this.player.y) && guard++ < 60) {
      const dx = W / 2 - this.player.x;
      const dy = H / 2 - this.player.y;
      const len = Math.hypot(dx, dy) || 1;
      this.player.setPosition(this.player.x + (dx / len) * 8, this.player.y + (dy / len) * 8);
    }

    // objeto interactuable más cercano
    this.nearThing = null;
    let best = Infinity;
    for (const t of this.things) {
      const cx = t.bounds.x + t.bounds.w / 2;
      const cy = t.bounds.y + t.bounds.h / 2;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, cx, cy);
      const reach = INTERACT_DIST + Math.max(t.bounds.w, t.bounds.h) / 2;
      if (dist < reach && dist < best) {
        best = dist;
        this.nearThing = t;
      }
    }

    if (this.nearThing) {
      prompt.textContent = `E · ${this.nearThing.def.prompt}`;
      prompt.classList.remove('hidden');
      actionBtn.textContent = this.nearThing.def.emoji ?? '👆';
      actionBtn.classList.remove('hidden');
      if (Phaser.Input.Keyboard.JustDown(k.e)) this.nearThing.def.onInteract();
    } else {
      prompt.classList.add('hidden');
      actionBtn.classList.add('hidden');
    }
  }
}
