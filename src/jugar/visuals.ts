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
  if (scene.textures.exists('ohmdal-forest-objects')) {
    const objects = scene.textures.get('ohmdal-forest-objects');
    if (!objects.has('tree-copper')) objects.add('tree-copper', 0, 48, 16, 64, 80);
    if (!objects.has('tree-violet')) objects.add('tree-violet', 0, 144, 16, 64, 80);
  }
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
  return { floor: mix(pal.floor, 0x695f64, 0.24), wall: mix(pal.wall, 0x62525f, 0.14) };
}

function authoredPalette(roomId: string, raw: RoomPalette): RoomPalette {
  if (roomId === 'plaza') return { floor: 0x59654a, wall: 0x6b4b39 };
  if (roomId === 'puerta' || roomId === 'manantial_ohm') return { floor: 0x526052, wall: 0x51465d };
  if (roomId.startsWith('castle_')) return { floor: 0x493e58, wall: 0x30283f };
  if (roomId.startsWith('forge_')) return { floor: 0x654737, wall: 0x493026 };
  if (roomId.startsWith('terraces_')) return { floor: 0x426459, wall: 0x355049 };
  if (roomId.startsWith('lighthouse_') || roomId === 'clock_tower') return { floor: 0x40566b, wall: 0x314252 };
  return liftPalette(raw);
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
  texturedFloor = false,
  continuousWorld = false,
): void {
  const rnd = mulberry32(hashStr(roomId));
  const pal = authoredPalette(roomId, rawPal);

  const visualBorder = continuousWorld ? 0 : border;
  // Un interior tiene marco. En el exterior continuo el borde es angosto y
  // deja de delatar el rectángulo completo de cada chunk.
  add(scene.add.rectangle(ox + w / 2, oy + h / 2, w, h, shade(pal.wall, 0.92)).setDepth(DEPTH.floor));
  const wallG = scene.add.graphics().setDepth(continuousWorld ? DEPTH.decor : DEPTH.floor);
  add(wallG);
  wallG.fillStyle(pal.wall, 1);
  wallG.fillRect(ox, oy, w, visualBorder);
  wallG.fillStyle(shade(pal.wall, 0.8), 1);
  wallG.fillRect(ox, oy + h - visualBorder, w, visualBorder);
  wallG.fillStyle(shade(pal.wall, 0.88), 1);
  wallG.fillRect(ox, oy, visualBorder, h);
  wallG.fillRect(ox + w - visualBorder, oy, visualBorder, h);
  // pilastras: ritmo arquitectónico en los muros horizontales
  for (let x = border + 34; !continuousWorld && x < w - border - 30; x += 148) {
    wallG.fillStyle(shade(pal.wall, 1.22), 1);
    wallG.fillRect(ox + x, oy + 2, 13, border - 2);
    wallG.fillRect(ox + x, oy + h - border, 13, border - 2);
    wallG.fillStyle(shade(pal.wall, 0.66), 1);
    wallG.fillRect(ox + x + 10, oy + 2, 3, border - 2);
    wallG.fillRect(ox + x + 10, oy + h - border, 3, border - 2);
  }

  // piso: lajas con leve variación tonal (determinista por sala)
  // Con tiles, este graphics conserva caminos, canales, relieves y desgaste
  // por encima de la textura; la base repetida la aporta decorData.ts.
  const g = scene.add.graphics().setDepth(texturedFloor ? DEPTH.decor - 1 : DEPTH.floor);
  add(g);
  if (!texturedFloor) {
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
        g.fillRect(ox + x0, oy + y0, x1 - x0, y1 - y0);
      }
    }
    // juntas: trazo sutil más oscuro
    g.lineStyle(2, shade(pal.floor, 0.82), 0.35);
    for (let row = 0; ; row++) {
      const y = border + row * SH;
      if (y >= h - border) break;
      g.lineBetween(ox + border, oy + y, ox + w - border, oy + y);
    }
  }

  // medallón central de mosaico (cada sala con leve variación propia)
  // Motivos autorados por región: el suelo funciona como identidad y orientación.
  if (roomId === 'plaza') {
    g.fillStyle(0x85806b, 0.9);
    g.fillRect(ox + w / 2 - 76, oy + border, 152, h - border * 2);
    g.fillRect(ox + border, oy + h / 2 - 54, w - border * 2, 108);
    // Calzada legible: adoquines chicos y bordes dorados, no una cruz plana.
    g.lineStyle(2, 0x555746, 0.55);
    for (let y = border + 18, row = 0; y < h - border; y += 26, row++) {
      g.lineBetween(ox + w / 2 - 74, oy + y, ox + w / 2 + 74, oy + y);
      const seam = row % 2 ? w / 2 - 18 : w / 2 + 24;
      g.lineBetween(ox + seam, oy + y - 25, ox + seam, oy + y);
    }
    for (let x = border + 20, col = 0; x < w - border; x += 34, col++) {
      g.lineBetween(ox + x, oy + h / 2 - 52, ox + x, oy + h / 2 + 52);
      if (col % 2 === 0) g.fillStyle(0xb6a36d, 0.25), g.fillRect(ox + x + 3, oy + h / 2 - 48, 25, 18);
    }
    g.lineStyle(4, 0xc5ae70, 0.65);
    g.strokeCircle(ox + w / 2, oy + h / 2, 58);
    g.lineStyle(2, 0x314b50, 0.9);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.lineBetween(ox + w / 2, oy + h / 2, ox + w / 2 + Math.cos(a) * 52, oy + h / 2 + Math.sin(a) * 52);
    }
  } else if (roomId.startsWith('castle_')) {
    g.fillStyle(0x701f45, 0.92);
    g.fillRect(ox + w / 2 - 64, oy + border, 128, h - border * 2);
    g.fillStyle(0xd0a34a, 0.82);
    g.fillRect(ox + w / 2 - 64, oy + border, 5, h - border * 2);
    g.fillRect(ox + w / 2 + 59, oy + border, 5, h - border * 2);
    // Rombos heráldicos convierten el corredor en una secuencia ceremonial.
    for (let y = border + 38; y < h - border; y += 62) {
      g.fillStyle(0x351a35, 0.95);
      g.fillTriangle(ox + w / 2, oy + y - 17, ox + w / 2 + 20, oy + y, ox + w / 2, oy + y + 17);
      g.fillTriangle(ox + w / 2, oy + y - 17, ox + w / 2 - 20, oy + y, ox + w / 2, oy + y + 17);
      g.fillStyle(0xe0b75f, 0.8);
      g.fillCircle(ox + w / 2, oy + y, 3);
    }
  } else if (roomId.startsWith('forge_')) {
    g.fillStyle(0x2e2726, 0.8);
    for (let x = border + 60; x < w - border; x += 120) g.fillRect(ox + x, oy + border, 12, h - border * 2);
    g.fillStyle(0xd46b2f, 0.65);
    for (let x = border + 66; x < w - border; x += 120) g.fillRect(ox + x, oy + border, 3, h - border * 2);
    // Placas remachadas y rejillas: el piso entero parece parte de una máquina.
    g.lineStyle(2, 0x241f22, 0.7);
    for (let y = border + 64; y < h - border; y += 82) g.lineBetween(ox + border, oy + y, ox + w - border, oy + y);
    for (let y = border + 24; y < h - border; y += 82) {
      for (let x = border + 28; x < w - border; x += 60) {
        g.fillStyle(0xb06a42, 0.85); g.fillCircle(ox + x, oy + y, 2.5);
      }
    }
    for (const x of [border + 18, w - border - 38]) {
      for (let y = border + 18; y < h - border - 12; y += 28) {
        g.fillStyle((Math.floor(y / 28) % 2) ? 0xe2933e : 0x2c2626, 0.8);
        g.fillRect(ox + x, oy + y, 20, 12);
      }
    }
  } else if (roomId.startsWith('terraces_')) {
    for (let y = border + 44; y < h - border; y += 92) {
      // Frente de contención: una sombra vertical hace leer cada nivel como altura.
      g.fillStyle(0x243f39, 0.9);
      g.fillRect(ox + border, oy + y + 22, w - border * 2, 12);
      g.fillStyle(0x6d8b66, 0.75);
      g.fillRect(ox + border, oy + y - 7, w - border * 2, 7);
      g.fillStyle(0x246d70, 0.78);
      g.fillRect(ox + border, oy + y, w - border * 2, 22);
      g.fillStyle(0x77d0b9, 0.46);
      for (let x = border + 18; x < w - border; x += 52) g.fillRect(ox + x, oy + y + 5, 24, 3);
      g.fillStyle(0xd5f3d4, 0.5);
      for (let x = border + 31; x < w - border; x += 88) g.fillCircle(ox + x, oy + y + 17, 2);
    }
  } else if (roomId.startsWith('lighthouse_') || roomId === 'clock_tower') {
    g.lineStyle(3, 0x88a8c5, 0.38);
    for (let r = 46; r < 220; r += 38) g.strokeCircle(ox + w / 2, oy + h / 2, r);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.lineStyle(i % 3 === 0 ? 3 : 1, i % 3 === 0 ? 0xd1b16a : 0x88a8c5, i % 3 === 0 ? 0.55 : 0.25);
      g.lineBetween(ox + w / 2 + Math.cos(a) * 42, oy + h / 2 + Math.sin(a) * 42, ox + w / 2 + Math.cos(a) * 216, oy + h / 2 + Math.sin(a) * 216);
    }
    g.fillStyle(0x8bdcff, 0.28);
    g.fillCircle(ox + w / 2, oy + h / 2, 34);
  } else if (roomId === 'puerta' || roomId === 'manantial_ohm') {
    // Río de chispa: une visualmente el manantial, la Puerta y la plaza.
    g.fillStyle(0x304d57, 0.88);
    g.fillRect(ox + w / 2 - 34, oy + border, 68, h - border * 2);
    g.fillStyle(0x67b8b0, 0.48);
    g.fillRect(ox + w / 2 - 17, oy + border, 34, h - border * 2);
    g.fillStyle(0xe6cf75, 0.7);
    for (let y = border + 20; y < h - border; y += 46) g.fillRect(ox + w / 2 - 4, oy + y, 8, 19);
  }

  const specializedFloor = roomId === 'plaza' || roomId === 'puerta' || roomId === 'manantial_ohm' || roomId.startsWith('castle_') || roomId.startsWith('forge_') || roomId.startsWith('terraces_') || roomId.startsWith('lighthouse_') || roomId === 'clock_tower';
  if (!specializedFloor) {
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
  }

  // desgaste: manchas y piedras sueltas esparcidas
  for (let i = 0; i < 16; i++) {
    const x = border + 10 + rnd() * (w - 2 * border - 20);
    const y = border + 10 + rnd() * (h - 2 * border - 20);
    g.fillStyle(shade(pal.floor, rnd() < 0.5 ? 0.84 : 1.18), 0.45);
    g.fillEllipse(ox + x, oy + y, 4 + rnd() * 6, 2.5 + rnd() * 4);
  }

  if (!continuousWorld) {
    // cara sur del muro norte (vista ¾ Pokémon: los muros tienen altura)
    g.fillStyle(shade(pal.wall, 0.76), 1);
    g.fillRect(ox + border, oy + border, w - 2 * border, 12);
    g.fillStyle(shade(pal.wall, 0.5), 1);
    g.fillRect(ox + border, oy + border + 12, w - 2 * border, 3);
    g.fillStyle(shade(pal.wall, 0.62), 0.8);
    for (let x = border + 22; x < w - border - 8; x += 56) {
      g.fillRect(ox + x, oy + border, 2, 12);
    }
  }

  // sombra interior del muro (el piso se hunde respecto de la pared)
  if (!continuousWorld) {
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

  // Escenografía no interactiva en los márgenes: densidad de mapa sin tapar rutas.
  const deco = scene.add.graphics().setDepth(DEPTH.decor + 1);
  add(deco);
  const planter = (x: number, y: number, foliage: number): void => {
    deco.fillStyle(0x2a1d20, 0.6); deco.fillEllipse(x + 3, y + 15, 50, 18);
    deco.fillStyle(0x8a5a37, 1); deco.fillRect(x - 18, y + 4, 36, 18);
    deco.fillStyle(0xb77b49, 1); deco.fillRect(x - 21, y, 42, 7);
    deco.fillStyle(shade(foliage, 0.65), 1); deco.fillRect(x - 20, y - 18, 40, 22);
    deco.fillStyle(foliage, 1); deco.fillRect(x - 14, y - 27, 28, 30);
    deco.fillStyle(shade(foliage, 1.45), 0.75); deco.fillRect(x - 10, y - 23, 8, 14);
  };
  const lamp = (x: number, y: number, glowColor: number): void => {
    deco.fillStyle(0x241e2b, 1); deco.fillRect(x - 3, y, 6, 31);
    deco.fillStyle(0x5c4930, 1); deco.fillRect(x - 7, y - 5, 14, 9);
    deco.fillStyle(glowColor, 1); deco.fillRect(x - 5, y - 16, 10, 12);
    deco.fillStyle(0xfff1a4, 0.9); deco.fillRect(x - 2, y - 14, 4, 7);
  };
  const vendorTree = (x: number, y: number, violet = false): void => {
    if (!scene.textures.exists('ohmdal-forest-objects')) return;
    const tree = scene.add
      .image(x, y, 'ohmdal-forest-objects', violet ? 'tree-violet' : 'tree-copper')
      .setOrigin(0.5, 1)
      .setDisplaySize(88, 110)
      .setDepth(DEPTH.decor + 2);
    add(tree);
  };
  if (roomId === 'plaza' || roomId === 'puerta' || roomId === 'manantial_ohm') {
    vendorTree(ox + 104, oy + h - 54, roomId !== 'plaza');
    vendorTree(ox + w - 104, oy + h - 54, roomId === 'puerta');
    lamp(ox + 168, oy + h - 93, 0xffcc57);
    lamp(ox + w - 168, oy + 116, 0xffcc57);
  } else if (roomId.startsWith('castle_')) {
    for (const x of [ox + 125, ox + w - 125]) {
      deco.fillStyle(0x241c30, 1); deco.fillRect(x - 18, oy + 48, 36, 92);
      deco.fillStyle(0x8e2c5c, 1); deco.fillRect(x - 13, oy + 58, 26, 65);
      deco.fillStyle(0xd0a34a, 1); deco.fillRect(x - 13, oy + 58, 26, 5);
    }
    lamp(ox + 205, oy + 105, 0xc78cff);
    lamp(ox + w - 205, oy + 105, 0xc78cff);
  } else if (roomId.startsWith('forge_')) {
    for (const x of [ox + 120, ox + w - 120]) {
      deco.fillStyle(0x292126, 1); deco.fillRect(x - 42, oy + 62, 84, 66);
      deco.fillStyle(0x9a4b2c, 1); deco.fillRect(x - 25, oy + 82, 50, 29);
      deco.fillStyle(0xff9d3d, 0.9); deco.fillRect(x - 17, oy + 91, 34, 15);
    }
  } else if (roomId.startsWith('terraces_')) {
    vendorTree(ox + 112, oy + 148);
    vendorTree(ox + w - 112, oy + 148, true);
    planter(ox + 178, oy + 112, 0x54a66d);
  } else if (roomId.startsWith('lighthouse_') || roomId === 'clock_tower') {
    lamp(ox + 130, oy + 105, 0x87d9ff);
    lamp(ox + w - 130, oy + 105, 0x87d9ff);
  }

  // Hitos regionales: cada distrito tiene una silueta que permite reconocerlo
  // antes de leer el nombre de la sala.
  const plaque = (name: string, ink: string): void => {
    deco.fillStyle(0x201a24, 0.92);
    deco.fillRect(ox + w / 2 - 74, oy + 34, 148, 28);
    deco.fillStyle(0xb58a52, 1);
    deco.fillRect(ox + w / 2 - 70, oy + 38, 140, 3);
    const label = scene.add.text(ox + w / 2, oy + 49, name, {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: ink,
      letterSpacing: 2, stroke: '#17121b', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(DEPTH.decor + 2);
    add(label);
  };
  if (roomId === 'plaza') {
    plaque('PLAZA DE OHMDAL', '#f4d895');
    // Toldos de mercado al borde: población y color sin invadir la ruta central.
    for (const x of [ox + 96, ox + w - 96]) {
      deco.fillStyle(0x38262d, 1); deco.fillRect(x - 42, oy + 64, 84, 40);
      deco.fillStyle(0xa94c55, 1); deco.fillRect(x - 46, oy + 61, 92, 12);
      deco.fillStyle(0xf0c66c, 1);
      for (let s = -38; s <= 30; s += 17) deco.fillRect(x + s, oy + 61, 8, 12);
    }
  } else if (roomId.startsWith('castle_')) {
    plaque('PALACIO DEL CIRCUITO', '#e2bf6f');
    const cx = ox + w / 2;
    deco.fillStyle(0x171422, 1); deco.fillRect(cx - 25, oy + 68, 50, 48);
    deco.lineStyle(3, 0xd0a34a, 1); deco.strokeRect(cx - 22, oy + 71, 44, 42);
    deco.lineStyle(4, 0xb64a71, 1);
    deco.lineBetween(cx, oy + 78, cx, oy + 106);
    deco.lineBetween(cx - 15, oy + 91, cx + 15, oy + 91);
    deco.fillStyle(0xf4cf72, 1); deco.fillCircle(cx, oy + 91, 5);
  } else if (roomId.startsWith('forge_')) {
    plaque('FORJAS DE COBRE', '#ffbd72');
    // Tuberías, remaches y manómetros convierten cada nave en una máquina.
    deco.fillStyle(0x713d2c, 1); deco.fillRect(ox + 54, oy + 57, w - 108, 9);
    deco.fillStyle(0xc06b3c, 1);
    for (let x = ox + 75; x < ox + w - 60; x += 74) {
      deco.fillRect(x, oy + 54, 7, 15);
      deco.fillCircle(x + 3, oy + 75, 10);
      deco.fillStyle(0x241d23, 1); deco.fillCircle(x + 3, oy + 75, 6);
      deco.fillStyle(0xf0a54d, 1); deco.fillRect(x + 2, oy + 69, 2, 7);
      deco.fillStyle(0xc06b3c, 1);
    }
  } else if (roomId.startsWith('terraces_')) {
    plaque('TERRAZAS DEL CAUDAL', '#a9efce');
    const wx = ox + w - 86; const wy = oy + h - 70;
    deco.lineStyle(5, 0x8f6743, 1); deco.strokeCircle(wx, wy, 30);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      deco.lineBetween(wx, wy, wx + Math.cos(a) * 27, wy + Math.sin(a) * 27);
    }
    deco.fillStyle(0xc69b62, 1); deco.fillCircle(wx, wy, 7);
  } else if (roomId.startsWith('lighthouse_') || roomId === 'clock_tower') {
    plaque('FARO DEL NORTE', '#bde8ff');
    const tx = ox + w - 112; const ty = oy + h - 77;
    deco.fillStyle(0x241f2c, 1); deco.fillRect(tx - 3, ty, 6, 38);
    deco.lineStyle(7, 0x9db2c4, 1); deco.lineBetween(tx - 24, ty - 9, tx + 22, ty - 22);
    deco.lineStyle(3, 0x4b6075, 1); deco.lineBetween(tx - 24, ty - 9, tx + 22, ty - 22);
    deco.fillStyle(0x89dcff, 1); deco.fillCircle(tx + 23, ty - 22, 5);
  } else if (roomId === 'manantial_ohm') {
    plaque('MANANTIAL DE OHM', '#d8c8ff');
    for (const x of [ox + 110, ox + w - 110]) {
      deco.fillStyle(0x4a3f68, 1); deco.fillTriangle(x - 18, oy + 112, x, oy + 62, x + 18, oy + 112);
      deco.fillStyle(0xa996e8, 0.9); deco.fillTriangle(x - 7, oy + 103, x, oy + 73, x + 6, oy + 103);
    }
  }

  // Movimiento ambiental mínimo por región: la sala respira incluso en reposo.
  if (roomId.startsWith('forge_')) {
    for (let i = 0; i < 7; i++) {
      const ember = scene.add
        .rectangle(ox + 120 + rnd() * (w - 240), oy + h - 70 - rnd() * 120, 3, 3, i % 2 ? 0xffc257 : 0xe86732)
        .setDepth(DEPTH.decor + 3)
        .setAlpha(0.75);
      add(ember);
      scene.tweens.add({
        targets: ember,
        y: ember.y - 64 - rnd() * 42,
        x: ember.x + (rnd() - 0.5) * 24,
        alpha: 0,
        duration: 1300 + rnd() * 1000,
        delay: rnd() * 900,
        repeat: -1,
      });
    }
  } else if (roomId.startsWith('terraces_')) {
    for (let i = 0; i < 6; i++) {
      const glint = scene.add
        .rectangle(ox + border + 22 + rnd() * (w - border * 2 - 80), oy + border + 49 + (i % 4) * 92, 22, 2, 0xb9f3dc)
        .setDepth(DEPTH.decor + 3)
        .setAlpha(0.18 + rnd() * 0.25);
      add(glint);
      scene.tweens.add({ targets: glint, x: glint.x + 48, alpha: 0.05, duration: 1600 + rnd() * 900, yoyo: true, repeat: -1 });
    }
  } else if (roomId.startsWith('lighthouse_') || roomId === 'clock_tower') {
    const pulse = scene.add
      .image(ox + w / 2, oy + h / 2, 'vis-glow')
      .setTint(0x8bdcff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDisplaySize(360, 260)
      .setDepth(DEPTH.decor + 2)
      .setAlpha(0.06);
    add(pulse);
    scene.tweens.add({ targets: pulse, alpha: 0.16, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
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
  sprite?: 'hero' | 'ohm';
  /** Textura que contiene la fila direccional del PNJ. */
  npcTexture?: 'ohmdal-npc-core' | 'ohmdal-npc-secondary';
  /** Fila del atlas direccional de PNJ: sur, oeste, este, norte. */
  npcRow?: number;
}

const CHAR_LOOKS: Array<[RegExp, CharLook]> = [
  [/^player$/, { body: 0x4d7d92, head: 0xe9c9a2, hair: 0x33303d, sprite: 'hero', scale: 1.6 }],
  [/^edda/, { body: 0xa85f78, head: 0xeccaa5, hair: 0x6e3448, npcRow: 0, scale: 1.4 }],
  [/^lumen/, { body: 0x8a6a3a, head: 0xe2c29a, hair: 0xd9d2e0, lantern: 0xffc966, npcRow: 1, scale: 1.4 }],
  [/^(pedestal$|ohm-)/, { body: 0xc9a437, head: 0xc9a437, hair: 0xc9a437, orb: true, sprite: 'ohm' }],
  [/^consejera/, { body: 0x5b4a75, head: 0xe0c2a0, hair: 0x2f2a3a, npcRow: 2, scale: 1.4 }],
  [/^guardiana/, { body: 0x58755f, head: 0xd9b894, hair: 0x4a3a2e, npcTexture: 'ohmdal-npc-secondary', npcRow: 0, scale: 1.4 }],
  [/^forjadora/, { body: 0xa8562e, head: 0xdfb48c, hair: 0x3a2620, npcRow: 3, scale: 1.4 }],
  [/^farero/, { body: 0x496978, head: 0xd9b894, hair: 0x9aa4ac, lantern: 0x9adcff, npcTexture: 'ohmdal-npc-secondary', npcRow: 1, scale: 1.4 }],
  [/^preceptor/, { body: 0x55505e, head: 0xe3c39b, hair: 0x8d8496, npcTexture: 'ohmdal-npc-secondary', npcRow: 2, scale: 1.4 }],
  [/^ciudadano-nino/, { body: 0x7a6a50, head: 0xeccaa5, hair: 0x4a3a2e, scale: 1.1, npcTexture: 'ohmdal-npc-secondary', npcRow: 4 }],
  [/^ciudadano/, { body: 0x6b5d4f, head: 0xdfc09c, hair: 0x3f3630, npcTexture: 'ohmdal-npc-secondary', npcRow: 3, scale: 1.4 }],
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
  private walkSprite: Phaser.GameObjects.Sprite | null = null;
  private idleSprite: Phaser.GameObjects.Sprite | null = null;
  private ohmSprite: Phaser.GameObjects.Sprite | null = null;
  private npcSprite: Phaser.GameObjects.Sprite | null = null;
  private walkFrameBase = 0;
  private idleFrameBase = 0;
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
    this.shadowImg = scene.add.image(0, 16, 'vis-shadow').setScale(0.56, 0.2).setAlpha(0.82);
    this.add(this.shadowImg);
    this.g = scene.add.graphics();
    this.add(this.g);
    if (look.sprite === 'hero') {
      const groundedSprite = (texture: string): Phaser.GameObjects.Sprite => scene.add
        .sprite(0, 15, texture, 0)
        .setScale(0.72)
        // Las hojas de producción comparten la línea de suela y=91.
        .setOrigin(0.5, 91 / 96);
      this.walkSprite = groundedSprite('ohmdal-student-walk').setVisible(false);
      this.idleSprite = groundedSprite('ohmdal-student-idle');
      this.add([this.walkSprite, this.idleSprite]);
    } else if (look.sprite === 'ohm') {
      this.orbGlow = scene.add
        .image(0, -4, 'vis-glow')
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDisplaySize(84, 84);
      this.addAt(this.orbGlow, 1);
      this.ohmSprite = scene.add
        .sprite(0, 15, 'ohmdal-ohm-atlas', 0)
        .setOrigin(0.5, 90 / 96);
      this.add(this.ohmSprite);
    } else if (look.npcRow !== undefined) {
      this.npcSprite = scene.add
        .sprite(0, 15, look.npcTexture ?? 'ohmdal-npc-core', look.npcRow * 4)
        .setScale(0.72)
        .setOrigin(0.5, 92 / 96);
      this.add(this.npcSprite);
    } else if (look.orb) {
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
    if (!m && this.npcSprite) {
      this.npcSprite.setPosition(0, 15).setRotation(0).setScale(0.72);
      this.shadowImg.setScale(0.56, 0.2);
    }
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
    if (this.walkSprite && this.idleSprite) {
      this.walkSprite.setVisible(this.moving);
      this.idleSprite.setVisible(!this.moving);
      if (this.moving) this.walkSprite.setFrame(this.walkFrameBase + Math.floor(this.phase * 10) % 6);
      else this.idleSprite.setFrame(this.idleFrameBase + Math.floor(this.phase * 2.2) % 4);
      // La zancada comunica el movimiento; el punto de apoyo no rebota.
      this.shadowImg.setScale(this.moving ? 0.6 : 0.56, this.moving ? 0.18 : 0.2);
      return;
    }
    if (this.npcSprite) {
      const stride = Math.sin(this.phase * 10);
      if (this.moving) {
        const lift = Math.abs(stride);
        this.npcSprite
          .setPosition(0, 15 - lift * 1.5)
          .setRotation(stride * 0.025)
          .setScale(0.72);
        this.shadowImg.setScale(0.6 + lift * 0.03, 0.18 - lift * 0.015);
      } else {
        // Escala alrededor del origen en la suela: respira sin deslizar los pies.
        const breath = Math.sin(this.phase * 2.2) * 0.004;
        this.npcSprite
          .setPosition(0, 15)
          .setRotation(0)
          .setScale(0.72 - breath * 0.35, 0.72 + breath);
        this.shadowImg.setScale(0.56 + breath * 0.4, 0.2);
      }
      return;
    }
    if (this.ohmSprite) {
      const f = Math.sin(this.phase * 2.2);
      this.ohmSprite.y = 15 + f * 2;
      if (this.orbGlow) this.orbGlow.setAlpha(0.48 + Math.sin(this.phase * 3.1) * 0.1);
      this.shadowImg.setScale(0.68 - f * 0.04, 0.28 - f * 0.02);
      return;
    }
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

    if (this.walkSprite && this.idleSprite) {
      const row = this.facing === 'south' ? 0 : this.facing === 'west' ? 1 : this.facing === 'east' ? 2 : 3;
      this.walkFrameBase = row * 6;
      this.idleFrameBase = row * 4;
      this.walkSprite.setFrame(this.walkFrameBase);
      this.idleSprite.setFrame(this.idleFrameBase);
      return;
    }

    if (this.npcSprite && look.npcRow !== undefined) {
      const column = this.facing === 'south' ? 0 : this.facing === 'west' ? 1 : this.facing === 'east' ? 2 : 3;
      this.npcSprite.setFrame(look.npcRow * 4 + column);
      return;
    }

    if (this.ohmSprite) {
      const frame = this.facing === 'south' ? 0 : this.facing === 'west' ? 1 : this.facing === 'east' ? 2 : 3;
      const c = this.stateColor ?? look.body;
      const asleep = luminance(c) <= 0.3;
      this.ohmSprite.setFrame(frame).setTint(asleep ? 0x666674 : 0xffffff).setAlpha(asleep ? 0.72 : 1);
      if (this.orbGlow) {
        this.orbGlow.setTint(asleep ? 0x333344 : c);
        this.orbGlow.setAlpha(asleep ? 0.12 : 0.5);
      }
      return;
    }

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
    g.fillStyle(outline, 1);
    g.fillRect(-10, -9, 20, 24);
    g.fillStyle(shade(look.body, 0.7), 1);
    g.fillRect(-8, 7, 6, 9);
    g.fillRect(2, 7, 6, 9);
    g.fillStyle(look.body, 1);
    g.fillRect(-8, -7, 16, 17);
    g.fillStyle(shade(look.body, 1.28), 1);
    g.fillRect(-6, -5, 5, 13);
    g.fillStyle(shade(look.body, 0.72), 1);
    g.fillRect(flip > 0 ? 4 : -8, -7, 4, 17);
    if (dir === 'east' || dir === 'west') {
      g.fillStyle(look.head, 1);
      g.fillRect(flip * 7 - 2, -3, 4, 10);
    }

    // cabeza
    const hy = -18;
    g.fillStyle(outline, 1);
    g.fillRect(-10, hy - 9, 20, 20);
    g.fillStyle(look.head, 1);
    g.fillRect(-8, hy - 7, 16, 16);
    g.fillStyle(shade(look.head, 0.82), 1);
    g.fillRect(flip > 0 ? 5 : -8, hy - 5, 3, 13);

    // pelo direccional: define la lectura de orientación
    g.fillStyle(look.hair, 1);
    if (dir === 'north') {
      g.fillRect(-8, hy - 7, 16, 15);
      g.fillRect(-6, hy + 7, 12, 4);
    } else if (dir === 'south') {
      g.fillRect(-8, hy - 7, 16, 6);
      g.fillRect(-8, hy - 1, 4, 5);
      g.fillRect(1, hy - 1, 4, 4);
    } else {
      g.fillRect(-8, hy - 7, 16, 6);
      g.fillRect(flip > 0 ? -8 : 4, hy - 2, 4, 9);
    }

    // ojos (solo si se le ve la cara)
    if (dir !== 'north') {
      g.fillStyle(0x201d28, 1);
      if (dir === 'south') {
        g.fillRect(-5, hy + 2, 3, 3);
        g.fillRect(3, hy + 2, 3, 3);
      } else {
        g.fillRect(flip > 0 ? 3 : -6, hy + 2, 3, 3);
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
  const esPortal = t.id === 'lapuerta' || t.id === 'puerta-castillo' || t.id === 'portal-aula';
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
  } else if (t.id === 'lapuerta' || t.id === 'puerta-castillo' || t.id === 'portal-aula') {
    // portal monumental: el color del thing cuenta su estado (oscuro = sellado,
    // claro = abierto). Cerrado: dos hojas bajo el arco. Abierto: las hojas
    // quedan plegadas contra las jambas y el vano deja pasar el río de chispa.
    const w = t.w;
    const h = t.h;
    const arc = Math.min(w * 0.24, 40);
    const open = t.id === 'portal-aula' || luminance(color) > 0.35;
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
  } else if (/^campana$/.test(t.id)) {
    // La campana es un hito narrativo, no un cajón rectangular.
    const w = t.w;
    const h = t.h;
    g.fillStyle(0x4a2d1d, 1);
    g.fillRect(-w * 0.42, -h * 0.44, 7, h * 0.82);
    g.fillRect(w * 0.3, -h * 0.44, 7, h * 0.82);
    g.fillStyle(0x7c4d27, 1);
    g.fillRect(-w * 0.48, -h * 0.48, w * 0.96, 7);
    g.fillStyle(shade(color, 0.62), 1);
    g.fillCircle(0, -h * 0.08, w * 0.34);
    g.fillStyle(color, 1);
    g.fillTriangle(-w * 0.31, -h * 0.1, w * 0.31, -h * 0.1, w * 0.4, h * 0.29);
    g.fillStyle(shade(color, 1.55), 0.8);
    g.fillEllipse(-w * 0.09, -h * 0.08, w * 0.11, h * 0.2);
    g.fillStyle(0x251b18, 1);
    g.fillCircle(0, h * 0.34, 5);
    g.lineStyle(2, 0x3b2519, 1);
    g.strokeEllipse(0, h * 0.28, w * 0.82, 10);
  } else if (/^banco-|^tablero-/.test(t.id)) {
    // Banco de trabajo JRPG: tapa, bastidor, cajones y piezas legibles.
    const w = t.w;
    const h = t.h;
    const top = Math.max(15, h * 0.3);
    g.fillStyle(0x241b1a, 1);
    g.fillRect(-w / 2 + 10, h * 0.16, 12, h * 0.48);
    g.fillRect(w / 2 - 22, h * 0.16, 12, h * 0.48);
    g.fillStyle(shade(color, 0.58), 1);
    g.fillRoundedRect(-w / 2 - 3, -h / 2 + 8, w + 6, h * 0.62, 5);
    g.fillStyle(shade(color, 1.25), 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, top, 5);
    g.fillStyle(color, 1);
    g.fillRect(-w / 2 + 7, -h / 2 + top, w - 14, h * 0.34);
    g.lineStyle(2, shade(color, 0.42), 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h * 0.66, 5);
    const drawers = Math.max(2, Math.floor(w / 68));
    for (let i = 0; i < drawers; i++) {
      const x = -w / 2 + 12 + i * ((w - 24) / drawers);
      const dw = (w - 30) / drawers;
      g.lineStyle(1.5, shade(color, 0.5), 0.9);
      g.strokeRect(x, -h * 0.05, dw, h * 0.22);
      g.fillStyle(0xd0a34a, 1);
      g.fillCircle(x + dw / 2, h * 0.06, 2.5);
    }
    // Herramientas y dos engastes sobre la tapa.
    g.lineStyle(3, 0xc47b45, 1);
    g.lineBetween(-w * 0.3, -h * 0.32, -w * 0.08, -h * 0.39);
    g.fillStyle(0x62d1c4, 1);
    g.fillCircle(w * 0.24, -h * 0.33, 5);
    g.fillStyle(0xa94c55, 1);
    g.fillCircle(w * 0.34, -h * 0.33, 5);
  } else if (/(repartidor|maquina|reloj|martillo|fuelle|lumbre|horno|tronco|fusible|lamparas|pared-fusibles)/.test(t.id)) {
    // Maquinaria antigua: paneles de hierro, conducciones de cobre y medidores.
    const w = t.w;
    const h = t.h;
    g.fillStyle(0x171923, 1);
    g.fillRoundedRect(-w / 2 - 3, -h / 2 + 5, w + 6, h, 10);
    g.fillStyle(shade(color, 0.62), 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 4, 8);
    g.fillStyle(shade(color, 0.9), 1);
    g.fillRoundedRect(-w / 2 + 9, -h / 2 + 10, w - 18, h - 24, 5);
    g.lineStyle(4, 0xb8733f, 0.95);
    g.strokeRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 16, 7);
    const gauges = Math.max(2, Math.min(5, Math.floor(w / 85)));
    for (let i = 0; i < gauges; i++) {
      const x = -w * 0.36 + i * (w * 0.72 / Math.max(1, gauges - 1));
      const y = -h * 0.08;
      const r = Math.max(8, Math.min(16, h * 0.16));
      g.fillStyle(0x202534, 1);
      g.fillCircle(x, y, r);
      g.lineStyle(2, 0xd0a34a, 1);
      g.strokeCircle(x, y, r);
      g.lineStyle(2, i % 2 ? 0x62d1c4 : 0xf3c765, 1);
      g.lineBetween(x, y, x + r * 0.55, y - r * 0.42);
    }
    g.fillStyle(0x2b2020, 1);
    g.fillRect(-w * 0.4, h * 0.25, w * 0.8, 8);
    g.fillStyle(0xe6753f, 0.9);
    for (let x = -w * 0.34; x < w * 0.35; x += 24) g.fillCircle(x, h * 0.29, 3);
  } else if (/(estantes|pedestales|bocas)/.test(t.id)) {
    const w = t.w;
    const h = t.h;
    g.fillStyle(0x241a1d, 1);
    g.fillRect(-w / 2, -h / 2, w, h);
    for (let row = 0; row < 2; row++) {
      const y = -h / 2 + 7 + row * (h * 0.42);
      g.fillStyle(shade(color, 0.72 + row * 0.15), 1);
      g.fillRect(-w / 2 + 7, y, w - 14, h * 0.32);
      g.fillStyle(0xc88a4e, 0.9);
      for (let x = -w / 2 + 18; x < w / 2 - 8; x += 28) {
        g.fillRect(x, y + 4, 8, h * 0.22);
      }
    }
    g.lineStyle(2, shade(color, 1.35), 0.8);
    g.strokeRect(-w / 2, -h / 2, w, h);
  } else if (/^lente-/.test(t.id)) {
    const r = t.w / 2;
    g.fillStyle(0x263847, 1);
    g.fillCircle(0, 2, r);
    g.fillStyle(color, 1);
    g.fillCircle(0, -r * 0.08, r * 0.86);
    g.fillStyle(0xbff5ff, 0.72);
    g.fillCircle(-r * 0.23, -r * 0.32, r * 0.32);
    g.lineStyle(Math.max(3, r * 0.06), 0x91b6c7, 1);
    g.strokeCircle(0, -r * 0.08, r * 0.9);
    g.lineStyle(2, 0xeafcff, 0.5);
    g.lineBetween(-r * 0.55, r * 0.18, r * 0.5, -r * 0.34);
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
    g.fillRect(-w / 2 - 2, -h / 2 + 4, w + 4, h);
    g.fillStyle(color, 1);
    g.fillRect(-w / 2, -h / 2, w, h - 3);
    g.fillStyle(shade(color, 1.3), 1);
    g.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, top);
    g.fillStyle(shade(color, 0.78), 0.8);
    for (let x = -w / 2 + 8; x < w / 2 - 4; x += 18) g.fillRect(x, -h / 2 + top + 7, 3, Math.max(3, h - top - 15));
    g.lineStyle(2, shade(color, 0.38), 1);
    g.strokeRect(-w / 2, -h / 2, w, h - 3);
    g.lineStyle(2, shade(color, 1.55), 0.7);
    g.lineBetween(-w / 2 + 2, -h / 2 + 2, w / 2 - 2, -h / 2 + 2);
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
