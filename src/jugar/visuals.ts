import Phaser from 'phaser';
import type { ThingDef } from './rooms';

/*
 * Capa visual procedural del juego (sin assets externos).
 * Vocabulario: luz cálida sobre penumbra, siluetas limpias, sombras de contacto,
 * y profundidad por y-sort + viñeta. Todo se genera en runtime.
 */

/* ---------- color ---------- */

export function luminance(color: number): number {
  const r = ((color >> 16) & 0xff) / 255;
  const g = ((color >> 8) & 0xff) / 255;
  const b = (color & 0xff) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** oscurece (f<1) o aclara (f>1) un color */
export function shade(color: number, f: number): number {
  const ch = (c: number): number => Math.max(0, Math.min(255, Math.round(c * f)));
  return (ch((color >> 16) & 0xff) << 16) | (ch((color >> 8) & 0xff) << 8) | ch(color & 0xff);
}

/** mezcla dos colores (t=0 → a, t=1 → b) */
export function mix(a: number, b: number, t: number): number {
  const m = (x: number, y: number): number => Math.round(x + (y - x) * t);
  return (
    (m((a >> 16) & 0xff, (b >> 16) & 0xff) << 16) |
    (m((a >> 8) & 0xff, (b >> 8) & 0xff) << 8) |
    m(a & 0xff, b & 0xff)
  );
}

/* ---------- PRNG determinista (el piso no debe cambiar entre visitas) ---------- */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- texturas generadas ---------- */

export function ensureTextures(scene: Phaser.Scene, w: number, h: number): void {
  if (scene.textures.exists('vis-glow')) return;

  // glow radial blanco (para luces, halos y resaltados)
  const glow = scene.textures.createCanvas('vis-glow', 128, 128)!;
  {
    const ctx = glow.context;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    glow.refresh();
  }

  // sombra de contacto (elipse difusa)
  const sh = scene.textures.createCanvas('vis-shadow', 64, 64)!;
  {
    const ctx = sh.context;
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(8,6,14,0.5)');
    g.addColorStop(0.6, 'rgba(8,6,14,0.28)');
    g.addColorStop(1, 'rgba(8,6,14,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    sh.refresh();
  }

  // mota de polvo para pasos
  const dust = scene.textures.createCanvas('vis-dust', 16, 16)!;
  {
    const ctx = dust.context;
    const g = ctx.createRadialGradient(8, 8, 1, 8, 8, 7);
    g.addColorStop(0, 'rgba(232,220,196,0.9)');
    g.addColorStop(1, 'rgba(232,220,196,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
    dust.refresh();
  }

  // viñeta de sala (bordes oscuros suaves → profundidad)
  const vig = scene.textures.createCanvas('vis-vignette', w, h)!;
  {
    const ctx = vig.context;
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.42, w / 2, h / 2, h * 1.05);
    g.addColorStop(0, 'rgba(6,6,14,0)');
    g.addColorStop(1, 'rgba(6,6,14,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    vig.refresh();
  }
}

/* ---------- profundidades de la escena ---------- */

export const DEPTH = {
  floor: 0,
  decor: 4, // detalle del piso, umbrales
  shadow: 6,
  // cuerpos y props: depth = y (6..H) para y-sort
  ambient: 800, // penumbra de la sala
  light: 810, // halos de luz (ADD, por encima de la penumbra)
  label: 900,
  ui: 950,
} as const;

/* ---------- piso, paredes y puertas ---------- */

export interface RoomPalette {
  floor: number;
  wall: number;
}

/** aclara los colores de rooms.ts (autorados para greybox oscuro) hacia un gris cálido */
export function liftPalette(pal: RoomPalette): RoomPalette {
  return { floor: mix(pal.floor, 0x554e63, 0.38), wall: mix(pal.wall, 0x554e63, 0.2) };
}

export function drawRoomBase(
  scene: Phaser.Scene,
  add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  roomId: string,
  rawPal: RoomPalette,
  ox: number,
  oy: number,
  w: number,
  h: number,
  border: number,
): void {
  const rnd = mulberry32(hashStr(roomId));
  const pal = liftPalette(rawPal);

  // pared: base + biselado interior para que el borde tenga cuerpo
  add(scene.add.rectangle(ox + w / 2, oy + h / 2, w, h, shade(pal.wall, 0.92)).setDepth(DEPTH.floor));
  const wallG = scene.add.graphics().setDepth(DEPTH.floor);
  add(wallG);
  wallG.fillStyle(pal.wall, 1);
  wallG.fillRect(ox, oy, w, border);
  wallG.fillStyle(shade(pal.wall, 0.8), 1);
  wallG.fillRect(ox, oy + h - border, w, border);
  wallG.fillStyle(shade(pal.wall, 0.88), 1);
  wallG.fillRect(ox, oy, border, h);
  wallG.fillRect(ox + w - border, oy, border, h);
  // pilastras: ritmo arquitectónico en los muros horizontales
  for (let x = border + 34; x < w - border - 30; x += 148) {
    wallG.fillStyle(shade(pal.wall, 1.22), 1);
    wallG.fillRect(ox + x, oy + 2, 13, border - 2);
    wallG.fillRect(ox + x, oy + h - border, 13, border - 2);
    wallG.fillStyle(shade(pal.wall, 0.66), 1);
    wallG.fillRect(ox + x + 10, oy + 2, 3, border - 2);
    wallG.fillRect(ox + x + 10, oy + h - border, 3, border - 2);
  }

  // piso: lajas con leve variación tonal (determinista por sala)
  const g = scene.add.graphics().setDepth(DEPTH.floor);
  add(g);
  g.fillStyle(pal.floor, 1);
  g.fillRect(ox + border, oy + border, w - 2 * border, h - 2 * border);
  const SW = 56;
  const SH = 40;
  for (let row = 0; ; row++) {
    const y = border + row * SH;
    if (y >= h - border) break;
    const off = row % 2 === 0 ? 0 : SW / 2;
    for (let col = -1; ; col++) {
      const x = border + off + col * SW;
      if (x >= w - border) break;
      const x0 = Math.max(x + 2, border + 1);
      const y0 = y + 2;
      const x1 = Math.min(x + SW - 2, w - border - 1);
      const y1 = Math.min(y + SH - 2, h - border - 1);
      if (x1 - x0 < 6 || y1 - y0 < 6) continue;
      const jitter = 0.93 + rnd() * 0.17;
      g.fillStyle(shade(pal.floor, jitter), 1);
      g.fillRoundedRect(ox + x0, oy + y0, x1 - x0, y1 - y0, 5);
    }
  }
  // juntas: trazo sutil más oscuro
  g.lineStyle(2, shade(pal.floor, 0.82), 0.35);
  for (let row = 0; ; row++) {
    const y = border + row * SH;
    if (y >= h - border) break;
    g.lineBetween(ox + border, oy + y, ox + w - border, oy + y);
  }

  // medallón central de mosaico (cada sala con leve variación propia)
  const mr = 68 + rnd() * 26;
  const cxm = ox + w / 2;
  const cym = oy + h / 2 + 14;
  g.lineStyle(4, shade(pal.floor, 1.22), 0.55);
  g.strokeCircle(cxm, cym, mr);
  g.lineStyle(2, shade(pal.floor, 0.78), 0.55);
  g.strokeCircle(cxm, cym, mr - 12);
  g.fillStyle(shade(pal.floor, 1.16), 0.5);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + mr;
    g.fillCircle(cxm + Math.cos(a) * (mr - 6), cym + Math.sin(a) * (mr - 6), 3);
  }

  // desgaste: manchas y piedras sueltas esparcidas
  for (let i = 0; i < 16; i++) {
    const x = border + 10 + rnd() * (w - 2 * border - 20);
    const y = border + 10 + rnd() * (h - 2 * border - 20);
    g.fillStyle(shade(pal.floor, rnd() < 0.5 ? 0.84 : 1.18), 0.45);
    g.fillEllipse(ox + x, oy + y, 4 + rnd() * 6, 2.5 + rnd() * 4);
  }

  // cara sur del muro norte (vista ¾ Pokémon: los muros tienen altura, se ve su frente)
  g.fillStyle(shade(pal.wall, 0.76), 1);
  g.fillRect(ox + border, oy + border, w - 2 * border, 12);
  g.fillStyle(shade(pal.wall, 0.5), 1);
  g.fillRect(ox + border, oy + border + 12, w - 2 * border, 3);
  g.fillStyle(shade(pal.wall, 0.62), 0.8);
  for (let x = border + 22; x < w - border - 8; x += 56) {
    g.fillRect(ox + x, oy + border, 2, 12);
  }

  // sombra interior del muro (el piso se hunde respecto de la pared)
  const inset = scene.add.graphics().setDepth(DEPTH.decor);
  add(inset);
  for (let i = 0; i < 5; i++) {
    inset.lineStyle(2, 0x06060e, 0.12 - i * 0.02);
    inset.strokeRect(
      ox + border + i * 2,
      oy + border + i * 2,
      w - 2 * (border + i * 2),
      h - 2 * (border + i * 2),
    );
  }
}

/** umbral abierto entre dos chunks del mundo: piso que cruza la muralla + jambas */
export function drawThreshold(
  scene: Phaser.Scene,
  add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  rect: { x: number; y: number; w: number; h: number },
  floorColor: number,
): void {
  const f = liftPalette({ floor: floorColor, wall: floorColor }).floor;
  const g = scene.add.graphics().setDepth(DEPTH.decor);
  add(g);
  g.fillStyle(f, 1);
  g.fillRect(rect.x, rect.y, rect.w, rect.h);
  g.fillStyle(shade(f, 0.86), 0.6);
  if (rect.w >= rect.h) {
    // paso horizontal (muralla norte/sur): jambas a los costados
    g.fillRect(rect.x + 4, rect.y, rect.w - 8, 4);
    g.fillRect(rect.x + 4, rect.y + rect.h - 4, rect.w - 8, 4);
    g.fillStyle(shade(f, 1.45), 1);
    g.fillRect(rect.x - 7, rect.y - 2, 7, rect.h + 4);
    g.fillRect(rect.x + rect.w, rect.y - 2, 7, rect.h + 4);
  } else {
    g.fillRect(rect.x, rect.y + 4, 4, rect.h - 8);
    g.fillRect(rect.x + rect.w - 4, rect.y + 4, 4, rect.h - 8);
    g.fillStyle(shade(f, 1.45), 1);
    g.fillRect(rect.x - 2, rect.y - 7, rect.w + 4, 7);
    g.fillRect(rect.x - 2, rect.y + rect.h, rect.w + 4, 7);
  }
}

export interface DoorVisualSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  color?: number;
  locked: boolean;
}

export function drawDoorVisual(
  scene: Phaser.Scene,
  add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  d: DoorVisualSpec,
  wallColor: number,
): void {
  const cx = d.x + d.w / 2;
  const cy = d.y + d.h / 2;
  const base = d.color ?? shade(wallColor, 1.25);
  const g = scene.add.graphics().setDepth(DEPTH.decor);
  add(g);

  // vano: hueco oscuro con marco
  g.fillStyle(shade(base, 0.45), 1);
  g.fillRoundedRect(d.x, d.y, d.w, d.h, 4);
  g.fillStyle(d.locked ? shade(base, 0.7) : shade(base, 0.95), 1);
  g.fillRoundedRect(d.x + 3, d.y + 3, d.w - 6, d.h - 6, 3);
  g.lineStyle(2, shade(base, 1.35), 0.9);
  g.strokeRoundedRect(d.x + 1, d.y + 1, d.w - 2, d.h - 2, 4);

  if (d.locked) {
    // sello: traba visible en el centro del vano
    g.fillStyle(0x2a1f28, 1);
    g.fillCircle(cx, cy, 5);
    g.lineStyle(2, 0xb0563e, 0.9);
    g.strokeCircle(cx, cy, 5);
  } else {
    // luz que se cuela por la puerta abierta
    const slit = scene.add
      .image(cx, cy, 'vis-glow')
      .setDepth(DEPTH.light)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xffd9a0)
      .setAlpha(0.22);
    slit.setDisplaySize(Math.max(d.w, 34) * 2.2, Math.max(d.h, 34) * 2.2);
    add(slit);
  }
}

/* ---------- personajes ---------- */

interface CharLook {
  body: number;
  head: number;
  hair: number;
  /** color del farol/embellecedor luminoso, si lo lleva */
  lantern?: number;
  /** criatura orbe (Ohm): ignora cuerpo humanoide */
  orb?: boolean;
  scale?: number;
}

const CHAR_LOOKS: Array<[RegExp, CharLook]> = [
  [/^player$/, { body: 0x4d7d92, head: 0xe9c9a2, hair: 0x33303d }],
  [/^edda/, { body: 0xa85f78, head: 0xeccaa5, hair: 0x6e3448 }],
  [/^lumen/, { body: 0x8a6a3a, head: 0xe2c29a, hair: 0xd9d2e0, lantern: 0xffc966 }],
  [/^(pedestal$|ohm-)/, { body: 0xc9a437, head: 0xc9a437, hair: 0xc9a437, orb: true }],
  [/^consejera/, { body: 0x5b4a75, head: 0xe0c2a0, hair: 0x2f2a3a }],
  [/^guardiana/, { body: 0x58755f, head: 0xd9b894, hair: 0x4a3a2e }],
  [/^forjadora/, { body: 0xa8562e, head: 0xdfb48c, hair: 0x3a2620 }],
  [/^farero/, { body: 0x496978, head: 0xd9b894, hair: 0x9aa4ac, lantern: 0x9adcff }],
  [/^preceptor/, { body: 0x55505e, head: 0xe3c39b, hair: 0x8d8496 }],
  [/^ciudadano-nino/, { body: 0x7a6a50, head: 0xeccaa5, hair: 0x4a3a2e, scale: 0.8 }],
  [/^ciudadano/, { body: 0x6b5d4f, head: 0xdfc09c, hair: 0x3f3630 }],
];

export function charLookFor(id: string): CharLook | null {
  for (const [re, look] of CHAR_LOOKS) if (re.test(id)) return look;
  return null;
}

export type Facing = 'south' | 'north' | 'east' | 'west';

export function facingOf(dx: number, dy: number): Facing {
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : dy > 0 ? 'south' : 'north';
}

/**
 * Rig humanoide vectorial: sombra + cuerpo capsular + cabeza con pelo direccional.
 * update(delta) da vida: respiración en reposo, trote al moverse.
 */
export class CharacterRig extends Phaser.GameObjects.Container {
  readonly isRig = true;
  private g: Phaser.GameObjects.Graphics;
  private shadowImg: Phaser.GameObjects.Image;
  private lanternImg: Phaser.GameObjects.Image | null = null;
  private orbGlow: Phaser.GameObjects.Image | null = null;
  private orbSign: Phaser.GameObjects.Text | null = null;
  private look: CharLook;
  private moving = false;
  private phase = Math.random() * 100;
  private facing: Facing = 'south';
  /** color de estado (Ohm cambia con los flags); null = colores del look */
  private stateColor: number | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, look: CharLook, stateColor?: number) {
    super(scene, x, y);
    this.look = look;
    this.stateColor = stateColor ?? null;
    this.shadowImg = scene.add.image(0, 16, 'vis-shadow').setScale(0.9, 0.42).setAlpha(0.9);
    this.add(this.shadowImg);
    this.g = scene.add.graphics();
    this.add(this.g);
    if (look.orb) {
      this.orbGlow = scene.add
        .image(0, -4, 'vis-glow')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDisplaySize(84, 84);
      this.addAt(this.orbGlow, 1);
      this.orbSign = scene.add
        .text(0, -5, 'Ω', { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#141119' })
        .setOrigin(0.5);
      this.add(this.orbSign);
    } else if (look.lantern) {
      this.lanternImg = scene.add
        .image(9, 2, 'vis-glow')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(look.lantern)
        .setDisplaySize(46, 46)
        .setAlpha(0.55);
      this.add(this.lanternImg);
    }
    this.setScale(look.scale ?? 1);
    this.redraw();
    scene.add.existing(this);
  }

  setFacing(f: Facing): void {
    if (f !== this.facing) {
      this.facing = f;
      this.redraw();
    }
  }

  setMoving(m: boolean): void {
    this.moving = m;
  }

  setStateColor(c: number): void {
    if (c !== this.stateColor) {
      this.stateColor = c;
      this.redraw();
    }
  }

  /** halo del rig (para que la sala lo dibuje como luz real, sobre la penumbra) */
  lightSpec(): { color: number; radius: number; alpha: number } | null {
    if (this.look.orb) {
      const c = this.stateColor ?? this.look.body;
      const lit = luminance(c) > 0.3;
      return { color: c, radius: lit ? 120 : 50, alpha: lit ? 0.4 : 0.12 };
    }
    if (this.look.lantern) return { color: this.look.lantern, radius: 90, alpha: 0.3 };
    return null;
  }

  tick(deltaMs: number): void {
    if (!this.active) return; // los rigs que salieron caminando ya fueron destruidos
    this.phase += deltaMs / 1000;
    if (this.look.orb) {
      // Ohm flota: vaivén lento + pulso de luz
      const f = Math.sin(this.phase * 2.2);
      this.g.y = f * 2.5;
      if (this.orbSign) this.orbSign.y = -5 + f * 2.5;
      if (this.orbGlow) this.orbGlow.setAlpha(0.5 + Math.sin(this.phase * 3.1) * 0.12);
      this.shadowImg.setScale(0.8 - f * 0.06, 0.36 - f * 0.03);
      return;
    }
    if (this.moving) {
      // trote: rebote corto y sombra que respira al ritmo
      const b = Math.abs(Math.sin(this.phase * 11));
      this.g.y = -b * 3;
      this.g.rotation = Math.sin(this.phase * 11) * 0.04;
      this.shadowImg.setScale(0.9 + b * 0.08, 0.42 - b * 0.05);
    } else {
      // respiración
      const b = Math.sin(this.phase * 2.4) * 0.5;
      this.g.y = -b;
      this.g.rotation = 0;
      this.shadowImg.setScale(0.9, 0.42);
    }
    if (this.lanternImg) {
      this.lanternImg.y = 2 + this.g.y * 0.6;
      this.lanternImg.setAlpha(0.5 + Math.sin(this.phase * 7.3) * 0.08);
    }
  }

  private redraw(): void {
    const g = this.g;
    const look = this.look;
    g.clear();

    if (look.orb) {
      const c = this.stateColor ?? look.body;
      const asleep = luminance(c) <= 0.3;
      const core = asleep ? 0x4a4a52 : c;
      if (this.orbGlow) {
        this.orbGlow.setTint(asleep ? 0x334 : c);
        this.orbGlow.setAlpha(asleep ? 0.15 : 0.55);
      }
      // criatura-orbe: cuerpo redondo con anillo
      g.fillStyle(shade(core, 0.6), 1);
      g.fillCircle(0, -3, 13);
      g.fillStyle(core, 1);
      g.fillCircle(0, -5, 11);
      g.fillStyle(shade(core, 1.5), asleep ? 0.25 : 0.8);
      g.fillCircle(-3.5, -8.5, 3.5);
      g.lineStyle(2, shade(core, 0.5), 1);
      g.strokeCircle(0, -5, 11);
      if (this.orbSign) this.orbSign.setColor(asleep ? '#2c2a33' : '#141119');
      return;
    }

    const dir = this.facing;
    const flip = dir === 'west' ? -1 : 1;
    const outline = 0x17141d;

    // cuerpo capsular con falda levemente más ancha (silueta legible)
    g.fillStyle(shade(look.body, 0.72), 1);
    g.fillEllipse(0, 12, 17, 7); // pies/base
    g.fillStyle(look.body, 1);
    g.fillRoundedRect(-9, -8, 18, 21, { tl: 9, tr: 9, bl: 6, br: 6 });
    // sombreado lateral del cuerpo (volumen)
    g.fillStyle(shade(look.body, 0.8), 1);
    g.fillRoundedRect(flip > 0 ? 3 : -9, -8, 6, 21, { tl: 6, tr: 6, bl: 4, br: 4 });
    // brazo insinuado
    g.fillStyle(shade(look.body, 0.9), 1);
    if (dir === 'east' || dir === 'west') g.fillRoundedRect(flip * 5 - 2.5, -4, 5, 12, 3);
    g.lineStyle(1.5, outline, 0.85);
    g.strokeRoundedRect(-9, -8, 18, 21, { tl: 9, tr: 9, bl: 6, br: 6 });

    // cabeza
    const hy = -16;
    g.fillStyle(look.head, 1);
    g.fillCircle(0, hy, 8.5);
    g.lineStyle(1.5, outline, 0.85);
    g.strokeCircle(0, hy, 8.5);

    // pelo direccional: define la lectura de orientación
    g.fillStyle(look.hair, 1);
    if (dir === 'north') {
      g.fillCircle(0, hy, 7.5); // de espaldas: pelo cubre la cara
      g.fillEllipse(0, hy + 5, 12, 6);
    } else if (dir === 'south') {
      g.slice(0, hy, 8, Math.PI * 1.02, Math.PI * 1.98, false);
      g.fillPath(); // flequillo
    } else {
      g.slice(0, hy, 8, Math.PI * (flip > 0 ? 0.62 : 1.38), Math.PI * (flip > 0 ? 1.98 : 0.02), false);
      g.fillPath();
    }

    // ojos (solo si se le ve la cara)
    if (dir !== 'north') {
      g.fillStyle(0x201d28, 1);
      if (dir === 'south') {
        g.fillCircle(-3, hy + 1.5, 1.3);
        g.fillCircle(3, hy + 1.5, 1.3);
      } else {
        g.fillCircle(flip * 4, hy + 1.5, 1.3);
      }
    }
  }
}

/* ---------- props ---------- */

/** prop rectangular con bisel, sombra de contacto y brillo si está "encendido" */
export function makePropVisual(
  scene: Phaser.Scene,
  add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  t: ThingDef,
  color: number,
): Phaser.GameObjects.Container {
  const c = scene.add.container(t.x, t.y);
  // rasgo de suelo (cauce, canal, terraza…): área transitable grande y no sólida,
  // se dibuja plana a nivel de piso, sin sombra de mueble ni bisel.
  // Los portales monumentales también son cruzables pero se alzan, no se acuestan.
  const esPortal = t.id === 'lapuerta' || t.id === 'puerta-castillo';
  const flat = t.solid === false && t.w * t.h > 15000 && !esPortal;
  // Los elementos murales no proyectan la sombra elíptica de un mueble apoyado en el piso.
  if (t.id !== 'retrato' && !flat) {
    const shadow = scene.add
      .image(0, t.h / 2 - 2, 'vis-shadow')
      .setScale((t.w * 1.5) / 64, (t.h * 0.5) / 64)
      .setAlpha(0.8);
    c.add(shadow);
  }
  const g = scene.add.graphics();
  c.add(g);

  if (flat) {
    const w = t.w;
    const h = t.h;
    g.fillStyle(shade(color, 0.62), 0.9);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    g.fillStyle(color, 0.85);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 11);
    // vetas del flujo a lo largo del eje mayor
    g.fillStyle(shade(color, 1.35), 0.55);
    const vertical = h > w;
    for (let i = 0; i < 4; i++) {
      const o = (i - 1.5) * (vertical ? w : h) * 0.19;
      if (vertical) g.fillRoundedRect(o - 2, -h / 2 + 12 + i * 7, 4, h - 24 - i * 14, 2);
      else g.fillRoundedRect(-w / 2 + 12 + i * 7, o - 2, w - 24 - i * 14, 4, 2);
    }
    g.lineStyle(2, shade(color, 0.5), 0.5);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
  } else if (t.id === 'retrato') {
    const w = t.w;
    const h = t.h;
    // Dos anclajes cortos continúan visualmente hasta el muro norte.
    g.lineStyle(2, shade(color, 1.45), 0.7);
    g.lineBetween(-w * 0.3, -h / 2, -w * 0.3, -h / 2 - 17);
    g.lineBetween(w * 0.3, -h / 2, w * 0.3, -h / 2 - 17);
    // Sombra de contacto casi plana: profundidad contra la pared, no contra el suelo.
    g.fillStyle(0x0b0910, 0.42);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 3);
    // Marco, paspartú y lienzo.
    g.fillStyle(shade(color, 0.52), 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    g.fillStyle(shade(color, 1.38), 1);
    g.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
    g.fillStyle(shade(color, 0.78), 1);
    g.fillRect(-w / 2 + 10, -h / 2 + 9, w - 20, h - 18);
    // Silueta sobria de Roxana, suficiente para leer "retrato" en vista cenital.
    g.fillStyle(shade(color, 1.7), 0.9);
    g.fillCircle(0, -7, 8);
    g.fillRoundedRect(-15, 2, 30, 16, { tl: 12, tr: 12, bl: 2, br: 2 });
    g.lineStyle(1.5, shade(color, 0.35), 0.9);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
  } else if (t.id === 'lapuerta' || t.id === 'puerta-castillo') {
    // portal monumental: el color del thing cuenta su estado (oscuro = sellado,
    // claro = abierto). Cerrado: dos hojas bajo el arco. Abierto: las hojas
    // quedan plegadas contra las jambas y el vano deja pasar el río de chispa.
    const w = t.w;
    const h = t.h;
    const arc = Math.min(w * 0.24, 40);
    const open = luminance(color) > 0.35;
    if (!open) {
      g.fillStyle(shade(color, 0.45), 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, { tl: arc, tr: arc, bl: 4, br: 4 });
      g.fillStyle(color, 1);
      g.fillRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 11, { tl: arc - 5, tr: arc - 5, bl: 3, br: 3 });
      g.fillStyle(shade(color, 1.25), 0.5);
      g.fillRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, 12, { tl: arc - 5, tr: arc - 5, bl: 0, br: 0 });
      g.lineStyle(2, shade(color, 0.5), 1);
      g.lineBetween(0, -h / 2 + 14, 0, h / 2 - 6);
      g.lineStyle(2, shade(color, 1.35), 0.7);
      g.strokeRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 11, { tl: arc - 5, tr: arc - 5, bl: 3, br: 3 });
      const sign = scene.add
        .text(0, -h * 0.14, 'Ω', {
          fontFamily: 'Georgia, serif',
          fontSize: `${Math.round(h * 0.24)}px`,
          color: '#8d84a0',
        })
        .setOrigin(0.5)
        .setAlpha(0.9);
      c.add(sign);
    } else {
      // marco y arco en pie
      g.fillStyle(shade(color, 0.5), 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, { tl: arc, tr: arc, bl: 4, br: 4 });
      // vano abierto: se ve la calzada del otro lado
      g.fillStyle(0x0f0d16, 1);
      g.fillRoundedRect(-w / 2 + 11, -h / 2 + 9, w - 22, h - 12, { tl: arc - 7, tr: arc - 7, bl: 2, br: 2 });
      // río de chispa cruzando el vano hacia la plaza
      g.fillStyle(0xc99f45, 0.85);
      g.fillRect(-10, -h / 2 + 9, 20, h - 3);
      g.fillStyle(0xffe9b0, 0.95);
      g.fillRect(-4, -h / 2 + 9, 8, h - 3);
      // hojas plegadas contra las jambas
      g.fillStyle(color, 1);
      g.fillRect(-w / 2 + 3, -h / 2 + 12, 11, h - 16);
      g.fillRect(w / 2 - 14, -h / 2 + 12, 11, h - 16);
      g.lineStyle(1.5, shade(color, 0.55), 0.9);
      g.strokeRect(-w / 2 + 3, -h / 2 + 12, 11, h - 16);
      g.strokeRect(w / 2 - 14, -h / 2 + 12, 11, h - 16);
      g.lineStyle(2, shade(color, 1.35), 0.85);
      g.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, { tl: arc - 2, tr: arc - 2, bl: 3, br: 3 });
      // el vano irradia (respira dentro del contenedor)
      const inner = scene.add
        .image(0, 2, 'vis-glow')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setTint(0xffd9a0)
        .setDisplaySize(w * 1.15, h * 1.5)
        .setAlpha(0.5);
      c.add(inner);
      scene.tweens.add({
        targets: inner,
        alpha: 0.34,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      // el emblema queda en el arco, encendido
      const sign = scene.add
        .text(0, -h / 2 + 10, 'Ω', {
          fontFamily: 'Georgia, serif',
          fontSize: `${Math.round(h * 0.18)}px`,
          color: '#ffe9c0',
        })
        .setOrigin(0.5)
        .setAlpha(0.95);
      c.add(sign);
    }
  } else if (t.shape === 'circle') {
    const r = t.w / 2;
    g.fillStyle(shade(color, 0.62), 1);
    g.fillCircle(0, 2, r);
    g.fillStyle(color, 1);
    g.fillCircle(0, -r * 0.18, r * 0.92);
    g.fillStyle(shade(color, 1.45), 0.75);
    g.fillCircle(-r * 0.3, -r * 0.45, r * 0.3);
    g.lineStyle(2, shade(color, 0.5), 0.9);
    g.strokeCircle(0, -r * 0.18, r * 0.92);
  } else {
    const w = t.w;
    const h = t.h;
    // cara frontal + tapa superior más clara (lectura ¾)
    const top = Math.min(10, h * 0.28);
    g.fillStyle(shade(color, 0.55), 1);
    g.fillRoundedRect(-w / 2, -h / 2 + 2, w, h, 6);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 3, 6);
    g.fillStyle(shade(color, 1.3), 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, top, { tl: 6, tr: 6, bl: 0, br: 0 });
    g.lineStyle(1.5, shade(color, 0.45), 0.9);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h - 3, 6);
  }

  scene.add.existing(c);
  add(c);
  return c;
}

/** halo de luz independiente (va por encima de la penumbra de la sala) */
export function addLight(
  scene: Phaser.Scene,
  add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  x: number,
  y: number,
  color: number,
  radius: number,
  alpha: number,
): Phaser.GameObjects.Image {
  const img = scene.add
    .image(x, y, 'vis-glow')
    .setBlendMode(Phaser.BlendModes.ADD)
    .setTint(color)
    .setDisplaySize(radius * 2, radius * 2)
    .setAlpha(alpha)
    .setDepth(DEPTH.light);
  add(img);
  scene.tweens.add({
    targets: img,
    alpha: alpha * 0.72,
    duration: 1400 + Math.random() * 700,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  return img;
}
