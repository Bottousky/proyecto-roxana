// Escena de mundo tile-based: carga de mapa, jugador, colisión, cámara,
// interacción, warps y puente con los puzzles. Todo el contenido viene de datos.
import Phaser from 'phaser';
import { MAPS } from '../data/maps.ts';
import { TILE, ZOOM, PLAYER_SPEED, INTERACT_DIST, SOLID_TILES, LAMP_ON, OFF_GRAY } from '../config.ts';
import { slice, saveSlice, setFlag } from '../save.ts';
import { say, toast, isDialogOpen } from '../dialog.ts';
import { getDialogue } from '../content.ts';
import { setObjective, refreshObjective } from '../quests.ts';
import { isHudBlocking, showPrompt, hidePrompt } from '../hud.ts';
import { createPuzzles, type PuzzleApi } from '../puzzles.ts';
import type { MapDef, ObjDef, Facing } from '../types.ts';

interface Placed {
  def: Extract<ObjDef, { kind: 'npc' | 'sign' | 'prop' | 'interact' }>;
  sprite: Phaser.GameObjects.Image;
  glow?: Phaser.GameObjects.Image;
}
interface Warp {
  def: Extract<ObjDef, { kind: 'warp' }>;
  door?: Phaser.GameObjects.Image;
}

const LOCK_MSG: Record<string, string> = {
  solvedClosedCircuit: 'El paso a la plaza sigue muerto. Primero devolvé la luz a la lámpara de la arboleda.',
  hasProbe: 'Sin la Sonda de Continuidad no vas a cruzar el Camino de los Conductores. Buscá a Maese Lumen en su taller.',
  solvedConductor: 'El puente está cortado en la ranura. Cerrá el paso antes de seguir a la ruina.',
  solvedSeries: 'La puerta sellada no cede. Despertá los tres nodos en fila para alimentarla.',
};

export class WorldScene extends Phaser.Scene {
  private def!: MapDef;
  private blocked: boolean[][] = [];
  private objects = new Map<string, Placed>();
  private warps: Warp[] = [];
  private player!: Phaser.GameObjects.Sprite;
  private facing: Facing = 'down';
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private near: Placed | null = null;
  private warpCooldown = 0;
  private puzzles!: ReturnType<typeof createPuzzles>;
  private layer!: Phaser.GameObjects.Container;
  private lockedNotified = new Set<string>();

  constructor() { super('world'); }

  create(): void {
    this.cameras.main.setZoom(ZOOM);
    this.cameras.main.setBackgroundColor('#0d0b13');
    const kb = this.input.keyboard!;
    this.keys = {
      up: kb.addKey('UP'), down: kb.addKey('DOWN'), left: kb.addKey('LEFT'), right: kb.addKey('RIGHT'),
      w: kb.addKey('W'), a: kb.addKey('A'), s: kb.addKey('S'), d: kb.addKey('D'), e: kb.addKey('E'),
    };
    kb.on('keydown-E', () => this.tryInteract());
    this.puzzles = createPuzzles(this.makeApi());
    this.loadMap(slice.map, slice.x, slice.y);
    if (import.meta.env.DEV) {
      // handle de pruebas E2E: mover el héroe a un tile e interactuar
      (window as unknown as Record<string, unknown>).__oh = {
        goto: (tx: number, ty: number) => { this.player.setPosition(tx * TILE + TILE / 2, ty * TILE + TILE / 2); this.refreshNear(); },
        act: () => this.tryInteract(),
        warp: (tx: number, ty: number) => { this.player.setPosition(tx * TILE + TILE / 2, ty * TILE + TILE / 2); this.refreshNear(); this.tryInteract(); },
        near: () => this.near?.def.id ?? null,
        map: () => this.def.id,
      };
    }
  }

  // ---------------- carga de mapa ----------------
  private loadMap(id: string, px: number, py: number): void {
    this.objects.clear();
    this.warps = [];
    this.lockedNotified.clear();
    this.children.removeAll();
    this.near = null;
    hidePrompt();

    const def = MAPS[id];
    this.def = def;
    slice.map = id;
    const { w, h } = def;

    // grilla de suelo
    const grid: number[][] = Array.from({ length: h }, () => Array(w).fill(def.base));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) grid[y][x] = def.border ?? 5;
    for (const f of def.fills ?? []) {
      const [rx, ry, rw, rh] = f.rect;
      for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++)
        if (grid[y]?.[x] !== undefined) grid[y][x] = f.tile;
    }
    for (const p of def.points ?? []) for (const [x, y] of p.at)
      if (grid[y]?.[x] !== undefined) grid[y][x] = p.tile;

    // warps: su celda es transitable (sendero)
    for (const o of def.objects) if (o.kind === 'warp' && grid[o.y]?.[o.x] !== undefined) grid[o.y][o.x] = 2;

    // dibujo de suelo + colisión base
    this.layer = this.add.container(0, 0);
    this.blocked = Array.from({ length: h }, () => Array(w).fill(false));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const frame = grid[y][x];
      const t = this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, 'tiles16', frame).setDepth(0);
      this.layer.add(t);
      if (SOLID_TILES.has(frame)) this.blocked[y][x] = true;
    }

    // objetos
    for (const o of def.objects) this.placeObject(o);

    // jugador
    this.player = this.add.sprite(px, py, 'hero', 0).setOrigin(0.5, 0.85).setDepth(py);
    this.player.play('hero-idle-' + this.facing);

    // cámara
    this.cameras.main.setBounds(0, 0, w * TILE, h * TILE);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.fadeIn(260);
    this.warpCooldown = 320;

    slice.x = px; slice.y = py; saveSlice();
    refreshObjective();
    this.onEnter(id);
  }

  private placeObject(o: ObjDef): void {
    if (o.kind === 'spawn') return;
    const cx = o.x * TILE + TILE / 2;
    const cy = o.y * TILE + TILE / 2;

    if (o.kind === 'warp') {
      const locked = o.lockedBy ? !slice.flags[o.lockedBy] : false;
      let door: Phaser.GameObjects.Image | undefined;
      if (locked && o.blockSprite) {
        door = this.add.image(cx, cy, o.blockSprite).setTint(OFF_GRAY).setDepth(cy);
      }
      // marca de salida (flechita tenue) cuando está abierta
      if (!locked) this.add.image(cx, cy - 2, 'marker').setAlpha(0.5).setDepth(1).setScale(0.6);
      this.warps.push({ def: o, door });
      return;
    }

    // npc visible/oculto por flag
    if (o.kind === 'npc') {
      if (o.visibleIf && !slice.flags[o.visibleIf]) return;
      if (o.hideIf && slice.flags[o.hideIf]) return;
    }

    const spriteKey = o.kind === 'sign' ? 'sign' : o.sprite;
    const sprite = this.add.image(cx, cy, spriteKey).setDepth(cy);
    // props lámpara de la plaza: encendidas si el arco se completó
    let tint = 'tint' in o ? o.tint : undefined;
    if (o.kind === 'prop' && o.sprite === 'lamp' && o.id.startsWith('plaza_lamp'))
      tint = slice.flags.arcComplete ? LAMP_ON : OFF_GRAY;
    if (tint !== undefined) sprite.setTint(tint);
    if ('solid' in o && o.solid) this.blocked[o.y][o.x] = true;

    const placed: Placed = { def: o as Placed['def'], sprite };
    if ('glow' in o && o.glow) placed.glow = this.addGlow(cx, cy, tint ?? 0xffffff);
    // props lámpara encendidas → glow
    if (o.kind === 'prop' && o.sprite === 'lamp' && o.id.startsWith('plaza_lamp') && slice.flags.arcComplete)
      placed.glow = this.addGlow(cx, cy, LAMP_ON);
    this.objects.set(o.id, placed);
  }

  private addGlow(x: number, y: number, color: number): Phaser.GameObjects.Image {
    return this.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(color).setAlpha(0.6).setScale(1.4).setDepth(y - 1);
  }

  // ---------------- API para puzzles ----------------
  private makeApi(): PuzzleApi {
    return {
      setTexture: (id, key) => this.objects.get(id)?.sprite.setTexture(key),
      setTint: (id, color) => {
        const s = this.objects.get(id)?.sprite;
        if (!s) return;
        if (color === null) s.clearTint(); else s.setTint(color);
      },
      setGlow: (id, on) => {
        const p = this.objects.get(id);
        if (!p) return;
        if (on && !p.glow) p.glow = this.addGlow(p.sprite.x, p.sprite.y, (p.sprite.tintTopLeft ?? 0xffffff) as number);
        else if (!on && p.glow) { p.glow.destroy(); p.glow = undefined; }
      },
      move: (id, tx, ty) => {
        const p = this.objects.get(id);
        if (!p) return;
        p.sprite.setPosition(tx * TILE + TILE / 2, ty * TILE + TILE / 2).setDepth(ty * TILE);
      },
      sparkAt: (id) => {
        const p = this.objects.get(id);
        if (!p) return;
        this.burst(p.sprite.x, p.sprite.y);
      },
      refreshWarps: () => {
        for (const wrp of this.warps) {
          const locked = wrp.def.lockedBy ? !slice.flags[wrp.def.lockedBy] : false;
          if (!locked && wrp.door) {
            const d = wrp.door;
            this.tweens.add({ targets: d, alpha: 0, duration: 300, onComplete: () => d.destroy() });
            wrp.door = undefined;
            this.add.image(wrp.def.x * TILE + TILE / 2, wrp.def.y * TILE + TILE / 2 - 2, 'marker').setAlpha(0.5).setDepth(1).setScale(0.6);
          }
        }
      },
      onArcComplete: () => this.arcFlash(),
    };
  }

  private burst(x: number, y: number): void {
    const p = this.add.particles(x, y, 'spark', {
      speed: { min: 20, max: 60 }, lifespan: 500, quantity: 12,
      scale: { start: 1, end: 0 }, blendMode: 'ADD', emitting: false,
    }).setDepth(9999);
    p.explode(12);
    this.time.delayedCall(700, () => p.destroy());
  }

  private arcFlash(): void {
    const cam = this.cameras.main;
    cam.flash(600, 255, 246, 216);
    toast('La red despierta. Muy lejos, la plaza recupera sus luces.');
  }

  // ---------------- entrada a cada mapa ----------------
  private onEnter(id: string): void {
    if (id === 'MAP_OHMDAL_01_PORTAL_GLADE' && !slice.flags.arrived) {
      say(getDialogue('arrival'), () => { setFlag('arrived'); setObjective('obj_light_glade'); });
    } else if (id === 'MAP_OHMDAL_02_DIM_PLAZA' && !slice.flags.metEdda) {
      setObjective('obj_talk_edda');
    }
  }

  // ---------------- interacción ----------------
  private tryInteract(): void {
    if (isDialogOpen() || isHudBlocking()) return;
    // warp cercano (bloqueado) → mensaje; abierto → viajar
    const wrp = this.warpUnderPlayer(INTERACT_DIST);
    if (wrp) { this.useWarp(wrp); return; }
    if (!this.near) return;
    const o = this.near.def;
    if (o.kind === 'sign') { say(getDialogue(o.dialogue)); return; }
    if (o.kind === 'npc') { this.talkNpc(o.id); return; }
    if (o.kind === 'interact') { this.puzzles.interact(o); return; }
    if (o.kind === 'prop') { toast(this.propFlavor(o.id)); return; }
  }

  private propFlavor(id: string): string {
    if (id === 'fountain') return 'La fuente de la plaza está muda. Ni un hilo de chispa.';
    if (id.startsWith('plaza_lamp')) return slice.flags.arcComplete ? 'La lámpara vuelve a arder. La plaza respira.' : 'Una lámpara fría. Lleva años sin encenderse.';
    if (id === 'portal') return 'El portal por el que llegaste. Ahora está apagado y no vuelve a abrirse.';
    return '…';
  }

  private talkNpc(id: string): void {
    if (id === 'edda') {
      if (!slice.flags.metEdda) {
        say(getDialogue('edda_intro'), () => { setFlag('metEdda'); setObjective('obj_find_lumen'); });
      } else if (slice.flags.arcComplete) {
        say(getDialogue('edda_after_arc'));
      } else if (slice.flags.metLumen) {
        say(getDialogue('edda_after_lumen'), () => { if (slice.flags.hasProbe) setObjective('obj_conductor_path'); });
      } else {
        say(getDialogue('edda_intro'));
      }
    } else if (id === 'lumen') {
      if (!slice.flags.metLumen) {
        say(getDialogue('lumen_intro'), () => {
          setFlag('metLumen'); setFlag('hasProbe'); setObjective('obj_conductor_path');
        });
      } else {
        say(getDialogue('lumen_after'));
      }
    }
  }

  private useWarp(wrp: Warp): void {
    const locked = wrp.def.lockedBy ? !slice.flags[wrp.def.lockedBy] : false;
    if (locked) {
      const key = wrp.def.lockedBy as string;
      if (!this.lockedNotified.has(key)) {
        this.lockedNotified.add(key);
        say([{ who: '', text: LOCK_MSG[key] ?? 'Sellado. Todavía te falta algo para cruzar.' }]);
      } else {
        toast(LOCK_MSG[key] ?? 'Sellado.');
      }
      return;
    }
    const [sx, sy] = wrp.def.spawn;
    this.cameras.main.fadeOut(220);
    this.warpCooldown = 500;
    this.time.delayedCall(230, () =>
      this.loadMap(wrp.def.to, sx * TILE + TILE / 2, sy * TILE + TILE / 2),
    );
  }

  private warpUnderPlayer(dist: number): Warp | null {
    for (const wrp of this.warps) {
      const wx = wrp.def.x * TILE + TILE / 2;
      const wy = wrp.def.y * TILE + TILE / 2;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, wx, wy) <= dist) return wrp;
    }
    return null;
  }

  // ---------------- update ----------------
  update(_t: number, dtMs: number): void {
    if (!this.player) return;
    const dt = dtMs / 1000;
    if (this.warpCooldown > 0) this.warpCooldown -= dtMs;

    const busy = isDialogOpen() || isHudBlocking();
    let dx = 0, dy = 0;
    if (!busy) {
      if (this.keys.left.isDown || this.keys.a.isDown) dx -= 1;
      if (this.keys.right.isDown || this.keys.d.isDown) dx += 1;
      if (this.keys.up.isDown || this.keys.w.isDown) dy -= 1;
      if (this.keys.down.isDown || this.keys.s.isDown) dy += 1;
    }

    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      const step = PLAYER_SPEED * dt;
      const nx = this.player.x + dx * step;
      const ny = this.player.y + dy * step;
      if (!this.blockedAt(nx, this.player.y)) this.player.x = nx;
      if (!this.blockedAt(this.player.x, ny)) this.player.y = ny;
      this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      this.player.play('hero-walk-' + this.facing, true);
      this.player.setDepth(this.player.y);
      // auto-warp al pisar la celda de salida
      if (this.warpCooldown <= 0) {
        const wrp = this.warpUnderPlayer(8);
        if (wrp && !(wrp.def.lockedBy && !slice.flags[wrp.def.lockedBy])) this.useWarp(wrp);
      }
    } else {
      this.player.play('hero-idle-' + this.facing, true);
    }

    this.refreshNear();
  }

  private blockedAt(px: number, py: number): boolean {
    // caja a los pies del héroe (~10x6)
    const pts: [number, number][] = [
      [px - 4, py - 2], [px + 4, py - 2], [px - 4, py - 8], [px + 4, py - 8],
    ];
    for (const [x, y] of pts) {
      const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
      if (ty < 0 || tx < 0 || ty >= this.def.h || tx >= this.def.w) return true;
      if (this.blocked[ty][tx]) return true;
    }
    return false;
  }

  private refreshNear(): void {
    let best: Placed | null = null;
    let bestD = INTERACT_DIST;
    for (const p of this.objects.values()) {
      if (p.def.kind === 'prop' && !['fountain', 'portal'].includes(p.def.id) && !p.def.id.startsWith('plaza_lamp')) {
        // props decorativos sin flavor propio no muestran prompt
      }
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.sprite.x, p.sprite.y);
      if (d < bestD) { bestD = d; best = p; }
    }
    // warp bloqueado/abierto cercano también da prompt
    const wrp = this.warpUnderPlayer(INTERACT_DIST);
    if (this.near !== best) this.near = best;
    if (isDialogOpen() || isHudBlocking()) { hidePrompt(); return; }
    if (best) showPrompt(this.promptFor(best.def));
    else if (wrp) showPrompt(`E · ${wrp.def.label ?? 'Ir'}`);
    else hidePrompt();
  }

  private promptFor(o: Placed['def']): string {
    const label =
      o.kind === 'npc' ? `Hablar con ${o.id === 'edda' ? 'Edda' : o.id === 'lumen' ? 'Maese Lumen' : o.id}` :
      o.kind === 'sign' ? 'Leer la inscripción' :
      'label' in o && o.label ? o.label :
      'Mirar';
    return `E · ${label}`;
  }
}
