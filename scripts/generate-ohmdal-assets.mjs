// Generador procedural de assets del slice de Ohmdal.
// Paleta electric-fantasy: mundo medieval + "magia" que es electricidad (teal/cobre).
// Salida: assets/ohmdal/generated/*.png  (registrados luego por audit-assets.mjs)
//
// Correr:  node scripts/generate-ohmdal-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Canvas } from './png.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../assets/ohmdal/generated');
mkdirSync(OUT, { recursive: true });

// ---- paleta ----
const C = {
  clear: [0, 0, 0, 0],
  ink: [20, 17, 28, 255],
  grass: [92, 138, 74, 255], grassHi: [118, 166, 92, 255], grassLo: [64, 104, 56, 255],
  flower: [232, 214, 120, 255],
  dirt: [150, 118, 74, 255], dirtHi: [176, 142, 92, 255], dirtLo: [120, 92, 58, 255],
  stone: [128, 122, 138, 255], stoneHi: [158, 152, 168, 255], stoneLo: [92, 88, 104, 255],
  water: [60, 128, 176, 255], waterHi: [96, 168, 208, 255],
  ruin: [96, 90, 100, 255], ruinLo: [70, 66, 78, 255],
  teal: [53, 224, 208, 255], tealLo: [31, 143, 136, 255], tealDim: [40, 80, 82, 255],
  copper: [208, 163, 74, 255], copperLo: [150, 110, 52, 255],
  lampOn: [255, 211, 77, 255], off: [74, 74, 82, 255],
  white: [238, 240, 236, 255], warm: [233, 201, 165, 255],
  eddaCoat: [168, 95, 120, 255], eddaHair: [110, 52, 72, 255],
  lumenCoat: [138, 106, 58, 255], lumenHair: [217, 210, 224, 255],
  heroCoat: [77, 125, 146, 255], heroHair: [51, 48, 61, 255], skin: [233, 201, 162, 255],
  spark: [255, 246, 216, 255],
};

const save = (name, canvas) => writeFileSync(resolve(OUT, name + '.png'), canvas.toPNG());

// ---------- TILES 16x16 (strip horizontal) ----------
// indices: 0 grass 1 grass2 2 path 3 floor 4 water 5 wall 6 ruin 7 rune 8 hedge 9 void
function tiles() {
  const N = 10, S = 16;
  const c = new Canvas(N * S, S);
  const tile = (idx, fn) => fn(idx * S, 0);

  // 0 grass
  tile(0, (ox) => { c.rect(ox, 0, S, S, C.grass); c.noise(ox, 0, S, S, C.grassHi, 0.12, 7); c.noise(ox, 0, S, S, C.grassLo, 0.10, 13); });
  // 1 grass + flores
  tile(1, (ox) => { c.rect(ox, 0, S, S, C.grass); c.noise(ox, 0, S, S, C.grassLo, 0.10, 5); c.px(ox + 4, 5, C.flower); c.px(ox + 11, 9, C.flower); c.px(ox + 7, 12, C.flower); });
  // 2 path
  tile(2, (ox) => { c.rect(ox, 0, S, S, C.dirt); c.noise(ox, 0, S, S, C.dirtHi, 0.14, 9); c.noise(ox, 0, S, S, C.dirtLo, 0.14, 21); });
  // 3 floor interior
  tile(3, (ox) => { c.rect(ox, 0, S, S, C.stone); c.frame(ox, 0, S, S, C.stoneLo); c.rect(ox + 1, 1, 7, 7, C.stoneHi); c.rect(ox + 8, 8, 7, 7, C.stoneHi); c.frame(ox, 0, S, S, C.stoneLo); });
  // 4 water
  tile(4, (ox) => { c.rect(ox, 0, S, S, C.water); c.line(ox + 2, 5, ox + 6, 5, C.waterHi); c.line(ox + 9, 11, ox + 13, 11, C.waterHi); });
  // 5 wall exterior (bloqueo)
  tile(5, (ox) => { c.rect(ox, 0, S, S, C.stoneLo); for (let r = 0; r < 4; r++){ const y = r*4; const off = r%2?4:0; for(let x=-1;x<S;x+=8){ c.frame(ox+x+off,y,8,4,C.ink);} } c.noise(ox,0,S,S,C.stone,0.10,3); });
  // 6 ruina piso
  tile(6, (ox) => { c.rect(ox, 0, S, S, C.ruin); c.noise(ox, 0, S, S, C.ruinLo, 0.2, 11); c.line(ox + 3, 2, ox + 6, 9, C.ink); c.line(ox + 10, 4, ox + 12, 13, C.ink); });
  // 7 rune floor (glow teal)
  tile(7, (ox) => { c.rect(ox, 0, S, S, C.ruinLo); c.frame(ox + 2, 2, 12, 12, C.tealLo); c.ring(ox + 8, 8, 4, C.teal, 1); c.px(ox + 8, 8, C.teal); });
  // 8 hedge (bloqueo)
  tile(8, (ox) => { c.rect(ox, 0, S, S, C.grassLo); c.disc(ox + 5, 6, 4, C.grass); c.disc(ox + 11, 7, 4, C.grass); c.disc(ox + 8, 11, 4, C.grassHi); c.noise(ox, 0, S, S, C.grassHi, 0.08, 4); });
  // 9 void
  tile(9, (ox) => { c.rect(ox, 0, S, S, C.ink); });

  save('tiles16', c);
}

// ---------- HERO 16x24, 4 dir x 4 frames ----------
function figure(c, ox, oy, coat, hair, step, dir) {
  // dir: 0 down 1 left 2 right 3 up ; step: -1,0,1 desplazamiento de piernas
  const cx = ox + 8;
  // sombra
  c.disc(cx, oy + 22, 4, [0, 0, 0, 90]);
  // piernas
  c.rect(cx - 3 + (step < 0 ? -1 : 0), oy + 17, 2, 5, C.ink);
  c.rect(cx + 1 + (step > 0 ? 1 : 0), oy + 17, 2, 5, C.ink);
  // abrigo
  c.rect(cx - 4, oy + 9, 8, 9, coat);
  c.rect(cx - 4, oy + 9, 8, 2, [coat[0] + 20, coat[1] + 20, coat[2] + 20, 255]);
  // brazos
  c.rect(cx - 5, oy + 10, 1, 6, coat);
  c.rect(cx + 4, oy + 10, 1, 6, coat);
  // cabeza
  c.disc(cx, oy + 5, 4, C.skin);
  // pelo por dirección
  if (dir === 3) c.rect(cx - 4, oy + 1, 8, 5, hair);
  else { c.rect(cx - 4, oy + 1, 8, 3, hair); c.rect(cx - 4, oy + 3, 1, 3, hair); c.rect(cx + 3, oy + 3, 1, 3, hair); }
  // cara (ojos) salvo de espaldas
  if (dir === 0) { c.px(cx - 2, oy + 6, C.ink); c.px(cx + 2, oy + 6, C.ink); }
  if (dir === 1) c.px(cx - 2, oy + 6, C.ink);
  if (dir === 2) c.px(cx + 2, oy + 6, C.ink);
}
function hero() {
  const FW = 16, FH = 24, FR = 4, DIRS = 4;
  const c = new Canvas(FW * FR, FH * DIRS);
  for (let d = 0; d < DIRS; d++)
    for (let f = 0; f < FR; f++) {
      const step = f === 1 ? -1 : f === 3 ? 1 : 0;
      figure(c, f * FW, d * FH, C.heroCoat, C.heroHair, step, d);
    }
  save('hero', c);
}

// ---------- NPCs (2 frames idle) ----------
function npc(name, coat, hair, lantern) {
  const FW = 16, FH = 24;
  const c = new Canvas(FW * 2, FH);
  for (let f = 0; f < 2; f++) {
    figure(c, f * FW, f === 1 ? 1 : 0, coat, hair, 0, 0); // leve bob vertical
    if (lantern) { c.disc(f * FW + 13, 15 + (f === 1 ? 1 : 0), 2, C.lampOn); c.px(f * FW + 13, 13 + (f === 1 ? 1 : 0), C.copper); }
  }
  save(name, c);
}
function ohm() {
  const FW = 16, FH = 16;
  const c = new Canvas(FW * 2, FH);
  for (let f = 0; f < 2; f++) {
    const ox = f * FW, cy = 8 + (f === 1 ? -1 : 0);
    c.disc(ox + 8, cy, 6, C.tealLo);
    c.disc(ox + 8, cy, 4, C.teal);
    c.disc(ox + 8, cy, 2, C.white);
    // ojos
    c.px(ox + 6, cy - 1, C.ink); c.px(ox + 10, cy - 1, C.ink);
  }
  save('npc_ohm', c);
}

// ---------- INTERACTABLES (base blanca para tintar en runtime) ----------
function node() {
  const c = new Canvas(16, 16);
  c.ring(8, 8, 6, C.white, 2);
  c.disc(8, 8, 3, C.white);
  save('node', c);
}
function lamp() {
  const c = new Canvas(16, 16);
  c.rect(6, 12, 4, 3, C.white);        // base
  c.disc(8, 7, 5, C.white);            // bombilla
  c.rect(7, 2, 2, 2, C.white);         // colgante
  save('lamp', c);
}
function switchTile(on) {
  const c = new Canvas(16, 16);
  c.rect(3, 10, 10, 4, C.white);       // base
  if (on) c.line(8, 11, 12, 4, C.white); else c.line(8, 11, 4, 4, C.white); // palanca
  c.disc(on ? 12 : 4, 4, 2, C.white);
  save(on ? 'switch_on' : 'switch_off', c);
}
function pathPiece(name, drawer) {
  const c = new Canvas(16, 16);
  drawer(c);
  save(name, c);
}
function door() {
  const c = new Canvas(16, 32);
  c.frame(1, 1, 14, 30, C.white);
  c.rect(3, 3, 10, 26, [255, 255, 255, 140]);
  // barras de energía
  for (let y = 6; y < 28; y += 5) c.rect(3, y, 10, 2, C.white);
  save('door', c);
}
function portal() {
  const c = new Canvas(32, 32);
  c.ring(16, 18, 12, C.white, 3);       // arco
  c.rect(4, 18, 24, 12, [0, 0, 0, 0]);  // (recorte inferior visual lo da el ring)
  c.ring(16, 18, 8, [255, 255, 255, 120], 6);
  save('portal', c);
}
function marker() {
  const c = new Canvas(16, 16);
  c.rect(6, 1, 4, 7, C.lampOn);
  c.rect(6, 10, 4, 3, C.lampOn);
  save('marker', c);
}
function spark() {
  const c = new Canvas(8, 8);
  c.disc(4, 4, 2, C.spark);
  c.px(4, 0, C.spark); c.px(4, 7, C.spark); c.px(0, 4, C.spark); c.px(7, 4, C.spark);
  save('spark', c);
}
function glow() {
  const c = new Canvas(32, 32);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const d = Math.hypot(x - 16, y - 16);
    const a = Math.max(0, 1 - d / 16);
    if (a > 0) c.px(x, y, [255, 255, 255, Math.round(a * a * 220)]);
  }
  save('glow', c);
}
function journal() {
  const c = new Canvas(16, 16);
  c.rect(3, 2, 10, 12, C.copperLo);
  c.rect(4, 3, 8, 10, C.warm);
  c.line(8, 3, 8, 12, C.copperLo);
  c.rect(2, 2, 2, 12, C.copper);
  save('journal_icon', c);
}
// ---- Props de jugar (48px, para el mundo continuo de src/jugar) ----
// Base clara para tintar en runtime: gris = apagado, cálido = encendido.
function propLampPost() {
  const c = new Canvas(24, 48);
  c.disc(12, 45, 6, [0, 0, 0, 70]);         // sombra de contacto
  c.rect(11, 20, 2, 25, C.copperLo);        // poste
  c.rect(9, 44, 6, 3, C.copperLo);          // base
  c.rect(8, 8, 8, 12, C.copper);            // farol (marco)
  c.frame(8, 8, 8, 12, C.copperLo);
  c.rect(10, 10, 4, 8, C.white);            // vidrio (recibe el tinte)
  c.rect(9, 5, 6, 3, C.copperLo);           // sombrerete
  c.rect(11, 3, 2, 2, C.copperLo);          // colgador
  save('prop_lamp_post', c);
}
function propBell() {
  const c = new Canvas(40, 44);
  c.disc(20, 41, 10, [0, 0, 0, 70]);
  c.rect(6, 4, 28, 3, C.copperLo);          // travesaño
  c.rect(19, 4, 2, 6, C.copperLo);          // colgador
  // campana
  for (let y = 0; y < 22; y++) {
    const w = 6 + Math.round((y / 22) * 12);
    c.rect(20 - w, 10 + y, w * 2, 1, C.copper);
  }
  c.rect(10, 31, 20, 3, C.copperLo);        // labio
  c.rect(19, 33, 2, 4, C.copperLo);         // badajo
  c.rect(14, 14, 3, 10, C.white);           // brillo (recibe el tinte)
  save('prop_bell', c);
}
function propPedestal() {
  const c = new Canvas(56, 40);
  c.disc(28, 34, 20, [0, 0, 0, 60]);
  c.rect(10, 20, 36, 14, C.stoneLo);        // tambor
  c.rect(10, 20, 36, 4, C.stone);
  c.rect(6, 30, 44, 6, C.stoneLo);          // base
  c.rect(6, 30, 44, 2, C.stone);
  // nudo de canales de cobre convergiendo
  c.rect(2, 26, 8, 3, C.copper); c.rect(46, 26, 8, 3, C.copper);
  c.disc(28, 22, 5, C.copperLo); c.disc(28, 22, 3, C.copper);
  save('prop_pedestal', c);
}

function sign() {
  const c = new Canvas(16, 16);
  c.rect(7, 10, 2, 5, C.copperLo);       // poste
  c.rect(2, 2, 12, 9, C.stone);          // losa
  c.frame(2, 2, 12, 9, C.stoneLo);
  c.line(4, 5, 11, 5, C.stoneLo);        // renglones grabados
  c.line(4, 7, 10, 7, C.stoneLo);
  c.line(4, 9, 11, 9, C.stoneLo);
  save('sign', c);
}
function crystal(name, col) {
  const c = new Canvas(16, 16);
  c.line(8, 2, 12, 8, col); c.line(12, 8, 8, 14, col);
  c.line(8, 14, 4, 8, col); c.line(4, 8, 8, 2, col);
  c.disc(8, 8, 3, [col[0], col[1], col[2], 200]);
  save(name, c);
}

// ---- ejecutar ----
tiles();
hero();
npc('npc_edda', C.eddaCoat, C.eddaHair, false);
npc('npc_lumen', C.lumenCoat, C.lumenHair, true);
ohm();
node();
lamp();
switchTile(true);
switchTile(false);
pathPiece('path_straight', (c) => c.rect(0, 6, 16, 4, C.white));
pathPiece('path_corner', (c) => { c.rect(6, 6, 4, 10, C.white); c.rect(6, 6, 10, 4, C.white); });
pathPiece('path_cross', (c) => { c.rect(6, 0, 4, 16, C.white); c.rect(0, 6, 16, 4, C.white); });
pathPiece('path_tee', (c) => { c.rect(0, 6, 16, 4, C.white); c.rect(6, 6, 4, 10, C.white); });
door();
portal();
marker();
spark();
glow();
journal();
sign();
propLampPost();
propBell();
propPedestal();
crystal('crystal_conductor', C.copper);
crystal('crystal_insulator', C.off);

console.log('Assets generados en assets/ohmdal/generated/');
