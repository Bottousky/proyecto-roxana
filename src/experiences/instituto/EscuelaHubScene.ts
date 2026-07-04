// Hall del Instituto — Hito 1 del hub escolar: greybox jugable a pie con el mismo
// rig/hero que ExplorationScene, movimiento y colisión calcados de ese motor, y el
// mapa de assets/hub/escuela.json (Tiled) como única fuente de verdad del layout.
// Las zonas sólo loguean por consola en este hito: hooks.goto/travel es Hito 2.
import Phaser from 'phaser';
import { W, H } from '../../jugar/ExplorationScene.ts';
import { ensureTextures, CharacterRig, charLookFor, facingOf, DEPTH } from '../../jugar/visuals.ts';
import { uiOpen, el } from '../../ui/overlay.ts';
import { parseZonas, zonaEn, muroRects, decoracionSolida, type Zona, type ZonaRect } from './zonaModel.ts';

const SPEED = 250;
const PLAYER_R = 12;
const MAP_W = 1280;
const MAP_H = 1024;

// colores planos del tileset greybox generado en runtime (celdas de 16px, ver preload)
const GREYBOX_COLORS = [
  0x000000, // 0 (sin usar; gid 0 = vacío)
  0x6b6656, // 1 piso hall
  0x585240, // 2 piso de salas
  0x8a7a3a, // 3 mosaico (ocre)
  0x2b2822, // 4 muro
  0x7a3b34, // 5 alfombra de entrada (rojiza)
  0x000000, // 6 reservado
  0x000000, // 7 reservado
  0x000000, // 8 reservado
];

function rectsOverlap(a: ZonaRect, b: ZonaRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class EscuelaHubScene extends Phaser.Scene {
  private player!: CharacterRig;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private solids: ZonaRect[] = [];
  private zonas: Zona[] = [];
  private zonaActual: Zona | null = null;

  constructor() {
    super('escuela');
  }

  preload(): void {
    this.load.spritesheet('ohmdal-student-walk', new URL('../../../assets/ohmdal/hero-student-walk-solid-64.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.spritesheet('ohmdal-student-idle', new URL('../../../assets/ohmdal/hero-student-idle-solid-64.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.json('escuela-map', new URL('../../../assets/hub/escuela.json', import.meta.url).href);
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

    ensureTextures(this, W, H);
    this.ensureGreyboxTexture();

    const map = this.cache.json.get('escuela-map');
    const { spawn, zonas } = parseZonas(map);
    this.zonas = zonas;
    this.solids = [...muroRects(map), ...decoracionSolida(map)];

    this.buildTilemap(map);
    this.buildDecoracion(map);

    this.player = new CharacterRig(this, spawn.x, spawn.y, charLookFor('player')!);
    this.player.setDepth(spawn.y);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, MAP_W, MAP_H);
    this.cameras.main.setZoom(2);

    this.add
      .text(36, 34, 'Escuela Roxana — Hall', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#fff1bd',
        fontStyle: 'bold',
        stroke: '#171321',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);
  }

  /** genera la textura greybox (128x16, 8 celdas de 16px) usada por el tilemap */
  private ensureGreyboxTexture(): void {
    if (this.textures.exists('escuela-greybox')) return;
    const tex = this.textures.createCanvas('escuela-greybox', 128, 16)!;
    const ctx = tex.context;
    for (let i = 1; i <= 8; i++) {
      ctx.fillStyle = `#${GREYBOX_COLORS[i].toString(16).padStart(6, '0')}`;
      ctx.fillRect((i - 1) * 16, 0, 16, 16);
    }
    tex.refresh();
    for (let i = 1; i <= 8; i++) {
      tex.add(i - 1, 0, (i - 1) * 16, 0, 16, 16);
    }
  }

  /** construye suelo y muros a partir del JSON Tiled, tile a tile (fallback simple y robusto) */
  private buildTilemap(map: any): void {
    const layers: Record<string, { data: number[]; width: number; height: number }> = {};
    for (const l of map.layers) {
      if (l.type === 'tilelayer') layers[l.name] = { data: l.data, width: l.width, height: l.height };
    }
    const tw = map.tilewidth as number;
    const th = map.tileheight as number;
    for (const name of ['suelo', 'muros']) {
      const layer = layers[name];
      if (!layer) continue;
      for (let y = 0; y < layer.height; y++) {
        for (let x = 0; x < layer.width; x++) {
          const gid = layer.data[y * layer.width + x];
          if (!gid) continue;
          this.add
            .image(x * tw + tw / 2, y * th + th / 2, 'escuela-greybox', gid - 1)
            .setDisplaySize(tw, th)
            .setDepth(name === 'muros' ? DEPTH.decor : DEPTH.floor);
        }
      }
    }
  }

  /** rectángulos con borde + etiqueta para cada objeto de la capa `decoracion` */
  private buildDecoracion(map: any): void {
    const layer = map.layers.find((l: any) => l.type === 'objectgroup' && l.name === 'decoracion');
    if (!layer) return;
    for (const obj of layer.objects) {
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      this.add
        .rectangle(cx, cy, obj.width, obj.height)
        .setStrokeStyle(2, 0xd8c98a, 0.8)
        .setFillStyle(0x000000, 0)
        .setDepth(DEPTH.decor + 1);
      this.add
        .text(cx, cy, obj.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '11px',
          color: '#e4d9b8',
          stroke: '#171321',
          strokeThickness: 3,
          align: 'center',
          wordWrap: { width: obj.width - 4 },
        })
        .setOrigin(0.5)
        .setAlpha(0.85)
        .setDepth(DEPTH.decor + 2);
    }
  }

  private playerBounds(x: number, y: number): ZonaRect {
    return { x: x - PLAYER_R, y: y - PLAYER_R, w: PLAYER_R * 2, h: PLAYER_R * 2 };
  }

  private collides(x: number, y: number): boolean {
    const pb = this.playerBounds(x, y);
    return this.solids.some((s) => rectsOverlap(pb, s));
  }

  update(_time: number, delta: number): void {
    const prompt = el('prompt');
    if (uiOpen()) {
      prompt.classList.add('hidden');
      this.player.setMoving(false);
      this.player.tick(delta);
      return;
    }
    const dt = delta / 1000;
    const k = this.keys;
    let vx = 0;
    let vy = 0;
    if (k.up.isDown || k.w.isDown) vy -= 1;
    if (k.down.isDown || k.s.isDown) vy += 1;
    if (k.left.isDown || k.a.isDown) vx -= 1;
    if (k.right.isDown || k.d.isDown) vx += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      const stepX = (vx / len) * SPEED * dt;
      const stepY = (vy / len) * SPEED * dt;
      if (!this.collides(this.player.x + stepX, this.player.y)) this.player.x += stepX;
      if (!this.collides(this.player.x, this.player.y + stepY)) this.player.y += stepY;
      this.player.setFacing(facingOf(vx, vy));
    }
    this.player.setMoving(vx !== 0 || vy !== 0);
    this.player.setDepth(this.player.y);
    this.player.tick(delta);

    const z = zonaEn(this.zonas, this.player.x, this.player.y);
    if (z !== this.zonaActual) {
      if (z && z.trigger === 'enter') {
        console.log('[zona] enter', z.nombre, z.tipo, z.target);
      }
      this.zonaActual = z;
    }

    if (z && z.trigger === 'interact') {
      prompt.textContent = `E — ${z.nombre}`;
      prompt.classList.remove('hidden');
      if (Phaser.Input.Keyboard.JustDown(k.e) && !uiOpen()) {
        console.log('[zona] interact', z.nombre, z.tipo, z.target);
      }
    } else {
      prompt.classList.add('hidden');
    }
  }
}
