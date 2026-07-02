import Phaser from 'phaser';
import { ROOMS, type ThingDef, type DoorDef } from './rooms';
import { state, hooks, save } from '../state';
import { uiOpen, el } from '../ui/overlay';
import { say } from '../ui/dialog';
import { initJoystick, getJoystickDir } from '../ui/joystick';
import { setAmbience, sfxStep, sfxDoor, sfxLocked, type Ambience } from '../audio';
import {
  ensureTextures,
  drawRoomBase,
  drawDoorVisual,
  drawThreshold,
  makePropVisual,
  addLight,
  CharacterRig,
  charLookFor,
  facingOf,
  luminance,
  DEPTH,
} from './visuals';
import { worldOf } from './world';
import { activateExperienceForRoom } from '../experiences/registry';

export const W = 960;
export const H = 540;

// penumbra por atmósfera: cuánta oscuridad cubre la sala (la luz vuelve al progresar)
const AMBIENT: Record<Ambience, number> = {
  ohmdal: 0.2,
  'ohmdal-on': 0.06,
  castle: 0.16,
  instituto: 0.12,
  taller: 0.15,
  forge: 0.1,
  terraces: 0.08,
  lighthouse: 0.18,
};
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
  /** abertura sellada entre chunks del mundo: avisa pero nunca teletransporta */
  boundary?: boolean;
  /** punto seguro hacia el interior del chunk dueño */
  pushTo: { x: number; y: number };
}

/** paso entre dos chunks vecinos del mundo continuo */
interface Boundary {
  /** sala dueña de la puerta canónica (la que tiene el candado, si hay) */
  from: string;
  door: DoorDef;
  /** rect del paso en coordenadas de mundo, cubriendo ambos muros */
  rect: Rect;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class ExplorationScene extends Phaser.Scene {
  private player!: CharacterRig;
  private velX = 0;
  private velY = 0;
  private rigs: CharacterRig[] = [];
  private playerHalo!: Phaser.GameObjects.Image;
  private hlRing!: Phaser.GameObjects.Image;
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;
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
  private stepDist = 0;
  // generación de sala: invalida los tweens de NPCs caminantes si la sala cambia
  private roomGen = 0;
  // mundo continuo: chunks cargados (sala → offset en el plano) y chunk activo
  private chunks: Record<string, { ox: number; oy: number }> = {};
  private currentChunk = '';
  private darkness!: Phaser.GameObjects.Rectangle;
  private roomName!: Phaser.GameObjects.Text;
  // el mundo puede extenderse hacia y negativo: el y-sort se normaliza con este mínimo
  private worldMinY = 0;

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

    ensureTextures(this, W, H);
    this.player = new CharacterRig(this, W / 2, H - 90, charLookFor('player')!);
    this.player.setDepth(H - 90);
    // capa fija a cámara: viñeta, penumbra de atmósfera y nombre de zona
    this.add
      .image(W / 2, H / 2, 'vis-vignette')
      .setScrollFactor(0)
      .setDepth(DEPTH.ambient - 2)
      .setAlpha(0.55);
    this.darkness = this.add
      .rectangle(W / 2, H / 2, W, H, 0x10122a)
      .setScrollFactor(0)
      .setDepth(DEPTH.ambient)
      .setAlpha(0);
    this.roomName = this.add
      .text(36, 34, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: '#9a92a8',
        fontStyle: 'italic',
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);
    // la chispa que acompaña al protagonista: mantiene legible la penumbra
    this.playerHalo = this.add
      .image(this.player.x, this.player.y, 'vis-glow')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xffe9c0)
      .setDisplaySize(260, 260)
      .setAlpha(0.14)
      .setDepth(DEPTH.light);
    // anillo que respira sobre el objeto interactuable más cercano
    this.hlRing = this.add
      .image(0, 0, 'vis-glow')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xffe2a8)
      .setAlpha(0)
      .setDepth(DEPTH.light);
    // polvo de pasos
    this.dust = this.add
      .particles(0, 0, 'vis-dust', {
        speed: { min: 6, max: 26 },
        angle: { min: 220, max: 320 },
        lifespan: 380,
        alpha: { start: 0.3, end: 0 },
        scale: { start: 0.7, end: 0.15 },
        emitting: false,
      })
      .setDepth(DEPTH.shadow);

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
    // las murallas de cada chunk ya son sólidos (con los pasos abiertos recortados)
    const pb = this.playerBounds(x, y);
    return this.solids.some((s) => rectsOverlap(pb, s));
  }

  /** atmósfera musical por zona (la plaza y la Puerta cambian al encenderse Ohmdal) */
  private moodOf(id: string): Ambience {
    return id.startsWith('forge_')
      ? 'forge'
      : id.startsWith('lighthouse_') || id === 'clock_tower'
        ? 'lighthouse'
      : id.startsWith('terraces_')
        ? 'terraces'
      : id.startsWith('castle_')
        ? 'castle'
      : id === 'taller'
        ? 'taller'
        : id === 'plaza' || id === 'puerta' || id === 'manantial_ohm'
          ? state.flags.puertaDone
            ? 'ohmdal-on'
            : 'ohmdal'
          : 'instituto';
  }

  private chunkRect(id: string): Rect {
    const o = this.chunks[id];
    return { x: o.ox, y: o.oy, w: W, h: H };
  }

  private chunkCenter(id: string): { x: number; y: number } {
    const r = this.chunkRect(id);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  }

  private chunkAt(x: number, y: number): string | null {
    for (const id of Object.keys(this.chunks)) {
      const r = this.chunkRect(id);
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return id;
    }
    return null;
  }

  /** rect del paso en la muralla compartida (cubre el grosor de ambos muros) */
  private gapRect(d: DoorDef, ox: number, oy: number): Rect {
    if (d.w >= d.h) {
      const edgeY = d.y < H / 2 ? oy : oy + H;
      return { x: ox + d.x, y: edgeY - B, w: d.w, h: 2 * B };
    }
    const edgeX = d.x < W / 2 ? ox : ox + W;
    return { x: edgeX - B, y: oy + d.y, w: 2 * B, h: d.h };
  }

  /** aberturas entre chunks vecinos; canónica = la puerta con candado si solo una lo tiene */
  private computeBoundaries(): Boundary[] {
    const res: Boundary[] = [];
    const seen = new Set<string>();
    for (const [roomId, off] of Object.entries(this.chunks)) {
      for (const d of ROOMS[roomId].doors) {
        if (!(d.to in this.chunks)) continue;
        const key = [roomId, d.to].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        let door = d;
        let from = roomId;
        let o = off;
        const back = ROOMS[d.to].doors.find((b) => b.to === roomId);
        if (!d.locked && back?.locked) {
          door = back;
          from = d.to;
          o = this.chunks[d.to];
        }
        res.push({ from, door, rect: this.gapRect(door, o.ox, o.oy) });
      }
    }
    return res;
  }

  /** murallas del chunk como sólidos, recortando los pasos abiertos */
  private pushWallSolids(ox: number, oy: number, gaps: Rect[]): void {
    const strips: Rect[] = [
      { x: ox, y: oy, w: W, h: B },
      { x: ox, y: oy + H - B, w: W, h: B },
      { x: ox, y: oy, w: B, h: H },
      { x: ox + W - B, y: oy, w: B, h: H },
    ];
    for (const s of strips) {
      let segs: Rect[] = [s];
      const horizontal = s.w > s.h;
      for (const gap of gaps) {
        const next: Rect[] = [];
        for (const seg of segs) {
          if (!rectsOverlap(seg, gap)) {
            next.push(seg);
            continue;
          }
          if (horizontal) {
            if (gap.x > seg.x) next.push({ x: seg.x, y: seg.y, w: gap.x - seg.x, h: seg.h });
            const gr = gap.x + gap.w;
            if (gr < seg.x + seg.w) next.push({ x: gr, y: seg.y, w: seg.x + seg.w - gr, h: seg.h });
          } else {
            if (gap.y > seg.y) next.push({ x: seg.x, y: seg.y, w: seg.w, h: gap.y - seg.y });
            const gb = gap.y + gap.h;
            if (gb < seg.y + seg.h) next.push({ x: seg.x, y: gb, w: seg.w, h: seg.y + seg.h - gb });
          }
        }
        segs = next;
      }
      this.solids.push(...segs);
    }
  }

  /** el jugador cruzó una abertura: la "sala" activa cambia sin recargar el mundo */
  private enterChunk(id: string): void {
    this.currentChunk = id;
    state.room = id;
    save();
    activateExperienceForRoom(id);
    const def = ROOMS[id];
    const mood = this.moodOf(id);
    setAmbience(mood);
    this.tweens.add({ targets: this.darkness, alpha: AMBIENT[mood], duration: 700 });
    this.roomName.setText(def.name);
    this.roomName.setAlpha(0);
    this.tweens.add({ targets: this.roomName, alpha: 1, duration: 600 });
    def.onEnter?.();
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
    activateExperienceForRoom(id);
    this.roomGen++;

    // NPCs caminantes que estaban visibles antes de este refresh
    // (sirve para detectar quién se va y quién llega)
    const prevNPCs = new Set<string>();
    if (!fireEnter) {
      for (const t of this.things) if (t.def.walksTo) prevNPCs.add(t.def.id);
    }

    const mood = this.moodOf(id);
    setAmbience(mood);

    for (const o of this.roomObjects) {
      this.tweens.killTweensOf(o);
      o.destroy();
    }
    this.roomObjects = [];
    this.rigs = [];
    this.things = [];
    this.doors = [];
    this.solids = [];
    this.moveTarget = null;
    this.nearThing = null;

    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.roomObjects.push(o);
      return o;
    };

    // el mundo continuo al que pertenece la sala (o la sala sola, si es interior)
    const world = worldOf(id);
    this.chunks = world ? world.rooms : { [id]: { ox: 0, oy: 0 } };
    this.currentChunk = id;

    // cámara: límites = unión de chunks; sigue al jugador con suavidad
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const cid of Object.keys(this.chunks)) {
      const r = this.chunkRect(cid);
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.w);
      maxY = Math.max(maxY, r.y + r.h);
    }
    this.worldMinY = minY;
    this.cameras.main.setBounds(minX, minY, maxX - minX, maxY - minY);
    this.cameras.main.startFollow(this.player, false, 0.12, 0.12);

    const boundaries = this.computeBoundaries();
    for (const [cid, off] of Object.entries(this.chunks)) {
      this.buildChunk(cid, off.ox, off.oy, prevNPCs, fireEnter, add, boundaries);
    }

    // penumbra y HUD
    this.darkness.setAlpha(AMBIENT[mood]);
    this.roomName.setText(def.name);
    this.roomName.setAlpha(1);
    if (fireEnter) this.cameras.main.fadeIn(240, 7, 8, 16);

    // posicionar al jugador (spawns de puertas/goto son locales a la sala destino)
    const sp = spawn ?? { x: W / 2, y: H - 90 };
    const fo = this.chunks[id];
    this.player.setPosition(
      fireEnter ? sp.x + fo.ox : sp.x,
      fireEnter ? sp.y + fo.oy : sp.y,
    );
    // si quedó dentro de algo sólido (spawn junto a una puerta), empujar hacia el centro
    const cc = this.chunkCenter(id);
    let guard = 0;
    while (this.collides(this.player.x, this.player.y) && guard++ < 60) {
      const dx = cc.x - this.player.x;
      const dy = cc.y - this.player.y;
      const len = Math.hypot(dx, dy) || 1;
      this.player.setPosition(this.player.x + (dx / len) * 8, this.player.y + (dy / len) * 8);
    }
    this.doorCooldown = 700;

    if (fireEnter) def.onEnter?.();
  }

  /** construye un chunk del mundo: base, murallas, puertas/aberturas, cosas y personajes */
  private buildChunk(
    id: string,
    ox: number,
    oy: number,
    prevNPCs: Set<string>,
    fireEnter: boolean,
    add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
    boundaries: Boundary[],
  ): void {
    const def = ROOMS[id];
    drawRoomBase(this, add, id, { floor: def.floor(), wall: def.wall() }, ox, oy, W, H, B);

    // murallas sólidas con pasos abiertos recortados
    const openGaps = boundaries.filter((bd) => !bd.door.locked?.()).map((bd) => bd.rect);
    this.pushWallSolids(ox, oy, openGaps);

    // aberturas hacia chunks vecinos (se dibujan una sola vez, desde su lado canónico)
    for (const bd of boundaries) {
      if (bd.from !== id) continue;
      const locked = !!bd.door.locked?.();
      const horizontal = bd.rect.w >= bd.rect.h;
      // si un portal monumental (thing) cubre el paso, él cuenta el estado con su
      // propio arte: no se dibuja el sello genérico ni la etiqueta duplicada
      const monument = def.things.some(
        (t) =>
          (t.id === 'lapuerta' || t.id === 'puerta-castillo') &&
          rectsOverlap({ x: t.x + ox - t.w / 2, y: t.y + oy - t.h / 2, w: t.w, h: t.h }, bd.rect),
      );
      if (locked) {
        if (!monument) {
          drawDoorVisual(
            this,
            add,
            { ...bd.rect, color: bd.door.color, locked: true },
            def.wall(),
          );
        }
        this.doors.push({
          def: bd.door,
          bounds: { x: bd.rect.x - 14, y: bd.rect.y - 14, w: bd.rect.w + 28, h: bd.rect.h + 28 },
          boundary: true,
          pushTo: this.chunkCenter(id),
        });
      } else {
        // el umbral atraviesa también la cara vista del muro norte (¾)
        const rect = horizontal ? { ...bd.rect, h: bd.rect.h + 15 } : bd.rect;
        drawThreshold(this, add, rect, def.floor());
      }
      if (!monument) {
        add(
          this.add
            .text(
              bd.rect.x + bd.rect.w / 2 + (horizontal ? 0 : bd.rect.x < ox + W / 2 ? 56 : -56),
              bd.rect.y + bd.rect.h / 2 + (horizontal ? (bd.rect.y < oy + H / 2 ? 42 : -38) : 0),
              bd.door.label,
              { fontFamily: 'Segoe UI, sans-serif', fontSize: '12px', color: '#8d84a0' },
            )
            .setOrigin(0.5)
            .setAlpha(0.9)
            .setDepth(DEPTH.label),
        );
      }
    }

    // puertas con transición (interiores y regiones lejanas)
    for (const d of def.doors) {
      if (d.visible && !d.visible()) continue;
      if (d.to in this.chunks) continue; // es una abertura del mundo, ya tratada
      const sd: DoorDef = { ...d, x: d.x + ox, y: d.y + oy };
      const cx = sd.x + sd.w / 2;
      const cy = sd.y + sd.h / 2;
      // los vanos del muro norte atraviesan también su cara vista (¾)
      const extraH = sd.w > sd.h && cy < oy + H / 2 ? 15 : 0;
      drawDoorVisual(
        this,
        add,
        { x: sd.x, y: sd.y, w: sd.w, h: sd.h + extraH, color: sd.color, locked: !!sd.locked?.() },
        def.wall(),
      );
      const horizontal = sd.w > sd.h;
      const lx = Math.min(Math.max(cx, ox + 90), ox + W - 90);
      const ly = horizontal ? (cy < oy + H / 2 ? cy + 28 : cy - 24) : cy - sd.h / 2 - 14;
      add(
        this.add
          .text(lx, ly, sd.label, {
            fontFamily: 'Segoe UI, sans-serif',
            fontSize: '12px',
            color: '#8d84a0',
          })
          .setOrigin(0.5)
          .setAlpha(0.9)
          .setDepth(DEPTH.label),
      );
      // zona de activación inflada: la puerta visual vive dentro del muro,
      // el jugador debe poder dispararla al tocarla desde el interior de la sala
      this.doors.push({
        def: sd,
        bounds: { x: sd.x - 14, y: sd.y - 14, w: sd.w + 28, h: sd.h + 28 },
        pushTo: this.chunkCenter(id),
      });
    }

    // objetos y personajes (coordenadas trasladadas al plano del mundo)
    const shiftedDoor = (to: string | undefined): DoorDef | undefined => {
      if (!to) return undefined;
      const dd = def.doors.find((d) => d.to === to);
      return dd ? { ...dd, x: dd.x + ox, y: dd.y + oy } : undefined;
    };
    for (const t of def.things) {
      const st: ThingDef = { ...t, x: t.x + ox, y: t.y + oy };
      if (st.visible && !st.visible()) {
        // se fue durante este refresh: sale caminando hasta su puerta
        if (!fireEnter && st.walksTo && prevNPCs.has(st.id)) {
          const door = shiftedDoor(st.walksTo);
          if (door) this.walkOut(st, door);
        }
        continue;
      }
      const color = typeof st.color === 'function' ? st.color() : st.color;
      const body = add(this.makeThingVisual(st));
      let label: Phaser.GameObjects.Text | null = null;
      if (st.label) {
        const halfH = body instanceof CharacterRig ? 30 * body.scale : st.h / 2;
        label = add(
          this.add
            .text(st.x, st.y - halfH - 12, st.label, {
              fontFamily: 'Segoe UI, sans-serif',
              fontSize: '12px',
              color: '#cfc7da',
            })
            .setOrigin(0.5)
            .setAlpha(0.85)
            .setDepth(DEPTH.label),
        );
      }
      const bounds: Rect = { x: st.x - st.w / 2, y: st.y - st.h / 2, w: st.w, h: st.h };
      // llegó durante este refresh: entra caminando desde su puerta
      const doorIn =
        !fireEnter && st.walksTo && !prevNPCs.has(st.id) ? shiftedDoor(st.walksTo) : undefined;
      if (doorIn) {
        this.walkIn(st, doorIn, body, label, bounds);
      } else {
        this.things.push({ def: st, bounds });
        if (st.solid !== false) this.solids.push(bounds);
        // luz real de lo encendido (lámparas, portal, farol de Lumen, Ohm despierto…)
        const portalAbierto =
          (st.id === 'lapuerta' || st.id === 'puerta-castillo') && luminance(color) > 0.35;
        const spec =
          body instanceof CharacterRig
            ? body.lightSpec()
            : portalAbierto
              ? { color: 0xffce7a, radius: Math.max(st.w, st.h) * 1.6, alpha: 0.42 }
              : luminance(color) > 0.55
                ? { color, radius: Math.max(st.w, st.h) * 1.7, alpha: 0.32 }
                : null;
        if (spec) addLight(this, add, st.x, st.y - 6, spec.color, spec.radius, spec.alpha);
      }
    }
  }

  /** centro de una puerta (a donde caminan los NPC que se van/llegan) */
  private doorCenter(d: DoorDef): { x: number; y: number } {
    return { x: d.x + d.w / 2, y: d.y + d.h / 2 };
  }

  /** y-sort normalizado: el plano puede tener y negativo, la profundidad nunca */
  private bodyDepth(y: number): number {
    return DEPTH.shadow + (y - this.worldMinY) * 0.25;
  }

  /** cuerpo visual de un thing: rig de personaje si su id es conocido, prop biselado si no */
  private makeThingVisual(t: ThingDef): Phaser.GameObjects.Container {
    const color = typeof t.color === 'function' ? t.color() : t.color;
    const look = charLookFor(t.id);
    if (look) {
      const rig = new CharacterRig(this, t.x, t.y, look, look.orb ? color : undefined);
      rig.setDepth(this.bodyDepth(t.y));
      this.rigs.push(rig);
      return rig;
    }
    const noop = <T extends Phaser.GameObjects.GameObject>(o: T): T => o;
    const prop = makePropVisual(this, noop, t, color);
    // rasgos de suelo (no sólidos y grandes) van a nivel de piso, no al y-sort;
    // los portales monumentales se alzan y sí participan del y-sort
    const esPortal = t.id === 'lapuerta' || t.id === 'puerta-castillo';
    const flat = t.solid === false && t.w * t.h > 15000 && !esPortal;
    prop.setDepth(t.id === 'retrato' || flat ? DEPTH.decor + 1 : this.bodyDepth(t.y));
    return prop;
  }

  /** onUpdate de tween: pasos suaves cada tanto trecho recorrido por el NPC */
  private npcStepper(body: Phaser.GameObjects.Container): () => void {
    let lx = body.x;
    let ly = body.y;
    let acc = 0;
    return () => {
      acc += Math.hypot(body.x - lx, body.y - ly);
      lx = body.x;
      ly = body.y;
      if (acc > 38) {
        acc = 0;
        sfxStep(0.45);
      }
    };
  }

  /** el NPC sale caminando hasta la puerta y desaparece (mientras tanto no es sólido ni interactuable) */
  private walkOut(t: ThingDef, door: DoorDef): void {
    const { x: dx, y: dy } = this.doorCenter(door);
    const body = this.makeThingVisual(t);
    if (body instanceof CharacterRig) {
      body.setFacing(facingOf(dx - t.x, dy - t.y));
      body.setMoving(true);
    }
    this.roomObjects.push(body);
    const dur = (Math.hypot(dx - t.x, dy - t.y) / SPEED) * 1000;
    const step = this.npcStepper(body);
    this.tweens.add({
      targets: body,
      x: dx,
      y: dy,
      duration: dur,
      onUpdate: () => {
        step();
        body.setDepth(this.bodyDepth(body.y));
      },
      onComplete: () => body.destroy(),
    });
    if (t.label) {
      const label = this.add
        .text(t.x, t.y - t.h / 2 - 14, t.label, {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '12px',
          color: '#cfc7da',
        })
        .setOrigin(0.5);
      this.roomObjects.push(label);
      this.tweens.add({
        targets: label,
        x: dx,
        y: dy - t.h / 2 - 14,
        alpha: 0,
        duration: dur,
        onComplete: () => label.destroy(),
      });
    }
  }

  /** el NPC entra caminando desde la puerta; recién al llegar se vuelve sólido e interactuable */
  private walkIn(
    t: ThingDef,
    door: DoorDef,
    body: Phaser.GameObjects.Container,
    label: Phaser.GameObjects.Text | null,
    bounds: Rect,
  ): void {
    const { x: sx, y: sy } = this.doorCenter(door);
    const dur = (Math.hypot(t.x - sx, t.y - sy) / SPEED) * 1000;
    body.setPosition(sx, sy);
    const rig = body instanceof CharacterRig ? body : null;
    if (rig) {
      rig.setFacing(facingOf(t.x - sx, t.y - sy));
      rig.setMoving(true);
    }
    const gen = this.roomGen;
    const step = this.npcStepper(body);
    this.tweens.add({
      targets: body,
      x: t.x,
      y: t.y,
      duration: dur,
      onUpdate: () => {
        step();
        body.setDepth(this.bodyDepth(body.y));
      },
      onComplete: () => {
        if (rig) {
          rig.setMoving(false);
          rig.setFacing('south');
          rig.setDepth(this.bodyDepth(t.y));
        }
        if (gen !== this.roomGen) return; // la sala cambió mientras caminaba
        this.things.push({ def: t, bounds });
        if (t.solid !== false) this.solids.push(bounds);
      },
    });
    if (label) {
      label.setPosition(sx, sy - t.h / 2 - 14);
      this.tweens.add({ targets: label, x: t.x, y: t.y - t.h / 2 - 14, duration: dur });
    }
  }

  private onPointer(p: Phaser.Input.Pointer): void {
    if (uiOpen()) return;
    if (document.body.classList.contains('touch-device')) return;
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

  update(time: number, delta: number): void {
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

    // movimiento con aceleración y frenado (fluidez), colisión por eje
    let tx = 0;
    let ty = 0;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      tx = (vx / len) * SPEED;
      ty = (vy / len) * SPEED;
    }
    const smooth = Math.min(1, dt * (tx !== 0 || ty !== 0 ? 14 : 18));
    this.velX += (tx - this.velX) * smooth;
    this.velY += (ty - this.velY) * smooth;
    if (tx === 0 && Math.abs(this.velX) < 6) this.velX = 0;
    if (ty === 0 && Math.abs(this.velY) < 6) this.velY = 0;
    const stepX = this.velX * dt;
    const stepY = this.velY * dt;
    if (stepX !== 0 && !this.collides(this.player.x + stepX, this.player.y)) this.player.x += stepX;
    if (stepY !== 0 && !this.collides(this.player.x, this.player.y + stepY)) this.player.y += stepY;

    // cruzar entre chunks cambia la zona activa, pero no reconstruye ni corta el movimiento
    const entered = this.chunkAt(this.player.x, this.player.y);
    if (entered && entered !== this.currentChunk) this.enterChunk(entered);

    // vida de los rigs: orientación, trote, respiración, y-sort, luz que acompaña
    if (vx !== 0 || vy !== 0) this.player.setFacing(facingOf(vx, vy));
    this.player.setMoving(Math.hypot(this.velX, this.velY) > 30);
    this.player.setDepth(this.bodyDepth(this.player.y));
    this.player.tick(delta);
    for (const r of this.rigs) r.tick(delta);
    this.playerHalo.setPosition(this.player.x, this.player.y - 4);

    // pasos: sonar (y levantar polvo) cada tanto trecho efectivamente recorrido
    this.stepDist += Math.hypot(this.player.x - this.lastX, this.player.y - this.lastY);
    if (this.stepDist > 38) {
      this.stepDist = 0;
      sfxStep();
      this.dust.emitParticleAt(this.player.x, this.player.y + 14, 2);
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
          const dx = d.pushTo.x - cx;
          const dy = d.pushTo.y - cy;
          const len = Math.hypot(dx, dy) || 1;
          this.player.setPosition(cx + (dx / len) * 80, cy + (dy / len) * 80);
          this.moveTarget = null;
          this.doorCooldown = 900;
          sfxLocked();
          say(lockedLines);
        } else {
          sfxDoor();
          // una frontera abierta no llega a esta lista: se cruza caminando.
          // Las puertas restantes conectan interiores o regiones lejanas.
          this.loadRoom(d.def.to, d.def.spawn, true);
        }
        return;
      }
    }

    // red de seguridad: si el jugador quedó en una posición ilegal
    // (empujones, cambios de flags, etc.), devolverlo al piso
    let guard = 0;
    while (this.collides(this.player.x, this.player.y) && guard++ < 60) {
      const safe = this.chunkCenter(this.currentChunk);
      const dx = safe.x - this.player.x;
      const dy = safe.y - this.player.y;
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
      // anillo de luz que respira sobre lo interactuable
      const b = this.nearThing.bounds;
      const s = Math.max(b.w, b.h) * 2.6;
      this.hlRing.setPosition(b.x + b.w / 2, b.y + b.h / 2);
      this.hlRing.setDisplaySize(s, s);
      this.hlRing.setAlpha(0.13 + Math.sin(time / 280) * 0.05);
      prompt.textContent = `E · ${this.nearThing.def.prompt}`;
      prompt.classList.remove('hidden');
      actionBtn.textContent = this.nearThing.def.emoji ?? '👆';
      actionBtn.classList.remove('hidden');
      if (Phaser.Input.Keyboard.JustDown(k.e)) this.nearThing.def.onInteract();
    } else {
      this.hlRing.setAlpha(0);
      prompt.classList.add('hidden');
      actionBtn.classList.add('hidden');
    }
  }
}
