import Phaser from 'phaser';
import { ROOMS, type ThingDef, type DoorDef } from './rooms';
import { state, hooks, save } from '../state';
import { uiOpen, el } from '../ui/overlay';
import { say } from '../ui/dialog';
import { initJoystick, getJoystickDir } from '../ui/joystick';
import { touchControlsEnabled } from '../ui/inputMode.ts';
import { setAmbience, sfxStep, sfxDoor, sfxLocked, type Ambience } from '../audio';
import {
  ensureTextures,
  drawRoomBase,
  drawDoorVisual,
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
import { preloadDecorAtlases, applyNearestFilter, renderDecor } from './tiles';
import { hasRoomDecor } from './decorData';
import {
  ROOM_BACKGROUND_FILES,
  backgroundKey,
  rectContainsRect,
  roomScene,
  scaleAt,
  type RoomSceneProfile,
  type SceneEffect,
} from './roomScenes';

export const W = 960;
export const H = 540;

// penumbra por atmósfera: cuánta oscuridad cubre la sala (la luz vuelve al progresar)
const AMBIENT: Record<Ambience, number> = {
  ohmdal: 0.1,
  'ohmdal-on': 0.025,
  castle: 0.1,
  instituto: 0.12,
  taller: 0.07,
  forge: 0.055,
  terraces: 0.035,
  lighthouse: 0.1,
};
const B = 26; // grosor del borde
// Ritmo de exploracion deliberadamente mas sereno: a escala 960x540, 250 px/s
// hacia que los personajes cruzaran casi cuatro cuerpos por segundo.
export const PLAYER_MOVE_SPEED = 170;
export const NPC_MOVE_SPEED = 145;
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
  private doorCooldown = 0;
  private nearThing: PlacedThing | null = null;
  private lastX = 0;
  private lastY = 0;
  private stepDist = 0;
  // generación de sala: invalida los tweens de NPCs caminantes si la sala cambia
  private roomGen = 0;
  // mundo continuo: chunks cargados (sala → offset en el plano) y chunk activo
  private chunks: Record<string, { ox: number; oy: number }> = {};
  private currentChunk = '';
  private activeActorChunks = new Map<string, string>();
  private actorBodies = new Map<string, CharacterRig>();
  private actorLabels = new Map<string, Phaser.GameObjects.Text>();
  private transitioning = false;
  private incomingActorKeys = new Set<string>();
  private incomingFromRoom: string | null = null;
  private darkness!: Phaser.GameObjects.Rectangle;
  private roomName!: Phaser.GameObjects.Text;
  private mapLayer!: Phaser.GameObjects.Container;
  private mapOpen = false;
  private hitboxesOpen = false;
  private activeScene?: RoomSceneProfile;
  // el mundo puede extenderse hacia y negativo: el y-sort se normaliza con este mínimo
  private worldMinY = 0;

  constructor() {
    super('explore');
  }

  preload(): void {
    this.load.spritesheet('ohmdal-student-walk', new URL('../../assets/ohmdal/hero-student-walk-solid-64.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.spritesheet('ohmdal-student-idle', new URL('../../assets/ohmdal/hero-student-idle-solid-64.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.spritesheet('ohmdal-npc-core', new URL('../../assets/ohmdal/npc-core-atlas-64.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.spritesheet('ohmdal-npc-secondary', new URL('../../assets/ohmdal/characters/npc-secondary-atlas-64.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.spritesheet('ohmdal-ohm-atlas', new URL('../../assets/ohmdal/characters/ohm-atlas-64-v2.png', import.meta.url).href, {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.image('ohmdal-forest-objects', new URL('../../assets/vendor/tiny-rpg-forest/environment/objects.png', import.meta.url).href);
    this.load.image('ohmdal-map-panel', new URL('../../assets/ohmdal/world-map-panel-1024.png', import.meta.url).href);
    // props pixel del mundo (reemplazan props procedurales vía ThingDef.sprite)
    for (const p of ['prop_lamp_post', 'prop_bell', 'prop_pedestal']) {
      this.load.image(p, new URL(`../../assets/ohmdal/generated/${p}.png`, import.meta.url).href);
    }
    this.load.image('prop_plaza_bell', new URL('../../assets/ohmdal/rooms/pilot-arco1/prop_plaza_bell.png', import.meta.url).href);
    this.load.image('prop_forge_barrel', new URL('../../assets/ohmdal/rooms/pilot-arco1/prop_forge_barrel_runtime.png', import.meta.url).href);
    this.load.image('prop_forge_crate', new URL('../../assets/ohmdal/rooms/pilot-arco1/prop_forge_crate_runtime.png', import.meta.url).href);
    this.load.image('prop_forge_ingots', new URL('../../assets/ohmdal/rooms/pilot-arco1/prop_forge_ingots_runtime.png', import.meta.url).href);
    for (const [key, url] of Object.entries(ROOM_BACKGROUND_FILES)) {
      this.load.image(key, url);
    }
    preloadDecorAtlases(this);
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
      m: kb.addKey(Phaser.Input.Keyboard.KeyCodes.M),
      h: kb.addKey(Phaser.Input.Keyboard.KeyCodes.H),
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
        fontSize: '14px',
        color: '#fff1bd',
        fontStyle: 'bold',
        stroke: '#171321',
        strokeThickness: 4,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);
    this.mapLayer = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui + 30)
      .setVisible(false);
    kb.on('keydown-M', () => {
      if (!uiOpen()) this.toggleMap();
    });
    kb.on('keydown-ESC', () => {
      if (this.mapOpen) this.toggleMap(false);
    });
    kb.on('keydown-H', () => {
      if (uiOpen()) return;
      this.hitboxesOpen = !this.hitboxesOpen;
      this.loadRoom(state.room, { x: this.player.x, y: this.player.y }, false);
    });
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

    applyNearestFilter(this);
    this.loadRoom(state.room, undefined, true);
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('roxana:game-ready')));
  }

  private playerBounds(x = this.player.x, y = this.player.y): Rect {
    const r = PLAYER_R * Math.max(0.5, this.player?.scale ?? 1);
    return { x: x - r, y: y - r, w: r * 2, h: r * 2 };
  }

  private collides(x: number, y: number): boolean {
    // las murallas de cada chunk ya son sólidos (con los pasos abiertos recortados)
    const pb = this.playerBounds(x, y);
    if (this.activeScene?.walkable.length && !this.activeScene.walkable.some((r) => rectContainsRect(r, pb))) return true;
    return this.solids.some((s) => rectsOverlap(pb, s));
  }

  /** Punto legal más cercano; evita rescatar al jugador hacia centros ocupados. */
  private nearestLegalPoint(x: number, y: number): { x: number; y: number } {
    const candidates: { x: number; y: number }[] = [];
    for (const p of Object.values(this.activeScene?.entries ?? {})) candidates.push(p);
    for (const r of this.activeScene?.walkable ?? []) {
      for (let cy = r.y + 16; cy <= r.y + r.h - 16; cy += 16) {
        for (let cx = r.x + 16; cx <= r.x + r.w - 16; cx += 16) candidates.push({ x: cx, y: cy });
      }
    }
    let best: { x: number; y: number } | null = null;
    let bestDist = Infinity;
    for (const p of candidates) {
      if (this.collides(p.x, p.y)) continue;
      const distance = Math.hypot(p.x - x, p.y - y);
      if (distance < bestDist) { best = p; bestDist = distance; }
    }
    return best ?? this.chunkCenter(this.currentChunk);
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

  /** Identidad persistente de los personajes de la comitiva. */
  private actorKey(id: string): string | null {
    if (/^edda/.test(id)) return 'edda';
    if (/^lumen/.test(id)) return 'lumen';
    if (/^(pedestal$|ohm-)/.test(id)) return 'ohm';
    if (/^consejera/.test(id)) return 'consejera';
    if (/^guardiana/.test(id)) return 'guardiana';
    if (/^forjadora/.test(id)) return 'forjadora';
    if (/^farero/.test(id)) return 'farero';
    return null;
  }

  /** Evita que flags históricos vuelvan a poblar unidades ya terminadas. */
  private actorFitsNarrativeStage(actor: string, roomId: string): boolean {
    const party = actor === 'edda' || actor === 'lumen' || actor === 'ohm' || actor === 'consejera';
    if (!party) return true;
    const flags = state.flags;
    if (roomId.startsWith('castle_')) return flags.enteredCastle && !flags.unit2Completed;
    if (roomId.startsWith('forge_')) return flags.unit2Completed && !flags.unit3Completed;
    if (roomId.startsWith('terraces_')) return flags.unit3Completed && !flags.unit4Completed;
    if (roomId.startsWith('lighthouse_') || roomId === 'clock_tower') {
      return flags.unit4Completed && !flags.unit5Completed;
    }
    return true;
  }

  /**
   * Una persona solo puede existir una vez dentro del mundo continuo. Se elige
   * su puesta en escena del chunk activo o, si no tiene una, la más cercana.
   */
  private resolveActorChunks(activeId: string): Map<string, string> {
    const chosen = new Map<string, { roomId: string; score: number }>();
    const origin = this.chunks[activeId] ?? { ox: 0, oy: 0 };
    for (const [roomId, offset] of Object.entries(this.chunks)) {
      for (const thing of ROOMS[roomId]?.things ?? []) {
        const key = this.actorKey(thing.id);
        if (!key || thing.visible?.() === false) continue;
        // Despierto, Ohm deja de ser una copia estática por sala y pasa a ser
        // el compañero persistente del HUD. El pedestal sólo existe antes.
        if (key === 'ohm' && state.flags.ohmAwake) continue;
        const score = roomId === activeId
          ? -1
          : Math.abs(offset.ox - origin.ox) + Math.abs(offset.oy - origin.oy);
        const previous = chosen.get(key);
        if (!previous || score < previous.score) chosen.set(key, { roomId, score });
      }
    }
    return new Map([...chosen].map(([key, value]) => [key, value.roomId]));
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
    const position = { x: this.player.x, y: this.player.y };
    // Reconstruye solo la puesta en escena: la cámara y la posición global se
    // conservan, pero la comitiva adopta una única ubicación en el nuevo sector.
    this.loadRoom(id, position, false);
    const mood = this.moodOf(id);
    setAmbience(mood);
    this.tweens.add({ targets: this.darkness, alpha: AMBIENT[mood], duration: 700 });
    this.showRoomBanner(ROOMS[id].name);
    ROOMS[id].onEnter?.();
  }

  /** Cartel breve de llegada: informa la zona y luego libera la escena. */
  private showRoomBanner(name: string): void {
    this.tweens.killTweensOf(this.roomName);
    this.roomName.setText(name).setAlpha(0).setY(26);
    this.tweens.add({
      targets: this.roomName,
      alpha: 1,
      y: 34,
      duration: 260,
      ease: 'Sine.Out',
      hold: 1700,
      yoyo: true,
      completeDelay: 150,
    });
  }

  private loadRoom(
    id: string,
    spawn: { x: number; y: number } | undefined,
    fireEnter: boolean,
  ): void {
    const def = ROOMS[id];
    if (!def) return;
    this.activeScene = roomScene(id);
    state.room = id;
    if (!state.flags.salasVisitadas.includes(id)) state.flags.salasVisitadas.push(id);
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
    this.actorBodies.clear();
    this.actorLabels.clear();
    this.things = [];
    this.doors = [];
    this.solids = [];
    // Una transición no debe arrastrar la inercia del movimiento anterior a la sala nueva.
    this.velX = 0;
    this.velY = 0;
    this.nearThing = null;

    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.roomObjects.push(o);
      return o;
    };

    // el mundo continuo al que pertenece la sala (o la sala sola, si es interior
    // o si es una sala cerrada con fondo pintado: esas nunca son continuas)
    const world = def.background || this.activeScene ? null : worldOf(id);
    this.chunks = world ? world.rooms : { [id]: { ox: 0, oy: 0 } };
    this.currentChunk = id;
    this.activeActorChunks = this.resolveActorChunks(id);

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

    // El plano irregular del reino no puede dejar ver el vacío entre distritos.
    // Una única tesela repetida funciona como campo/monte de fondo y mantiene
    // la lectura de un mundo, aunque esas zonas no sean transitables todavía.
    if (world) {
      add(
        this.add
          .tileSprite(
            minX + (maxX - minX) / 2,
            minY + (maxY - minY) / 2,
            maxX - minX,
            maxY - minY,
            'decor-medieval-ground',
            0,
          )
          .setDepth(-5)
          .setTint(0x71814d),
      );
    }

    const boundaries = this.computeBoundaries();
    for (const [cid, off] of Object.entries(this.chunks)) {
      this.buildChunk(cid, off.ox, off.oy, prevNPCs, fireEnter, add, boundaries);
    }
    if (this.activeScene) {
      this.buildSceneEffects(this.activeScene, add);
      if (this.hitboxesOpen) this.drawHitboxDebug(this.activeScene, add);
    }

    // penumbra y HUD
    this.darkness.setAlpha(AMBIENT[mood]);
    if (fireEnter) this.showRoomBanner(def.name);
    if (fireEnter) this.cameras.main.fadeIn(240, 7, 8, 16);

    // posicionar al jugador (spawns de puertas/goto son locales a la sala destino)
    const profileSpawn = this.activeScene?.entries ? Object.values(this.activeScene.entries)[0] : undefined;
    const sp = spawn ?? profileSpawn ?? { x: W / 2, y: H - 90 };
    const fo = this.chunks[id];
    this.player.setPosition(
      fireEnter ? sp.x + fo.ox : sp.x,
      fireEnter ? sp.y + fo.oy : sp.y,
    );
    this.player.setScale(scaleAt(this.activeScene, this.player.y - fo.oy));
    // si quedó dentro de algo sólido (spawn junto a una puerta), empujar hacia el centro
    if (this.collides(this.player.x, this.player.y)) {
      const safe = this.nearestLegalPoint(this.player.x, this.player.y);
      this.player.setPosition(safe.x, safe.y);
    }
    this.doorCooldown = 700;

    if (fireEnter) def.onEnter?.();
    this.transitioning = false;
    this.incomingActorKeys.clear();
    this.incomingFromRoom = null;
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
    const sceneProfile = roomScene(id);
    const paintedKey = sceneProfile
      ? backgroundKey(sceneProfile, state.flags as unknown as Record<string, unknown>)
      : def.background;

    // sala cerrada pintada: el fondo llena el chunk y la colisión es manual.
    if (paintedKey && this.textures.exists(paintedKey)) {
      const bg = this.add.image(ox + W / 2, oy + H / 2, paintedKey).setDepth(DEPTH.shadow - 4);
      bg.setDisplaySize(W, H);
      add(bg);
      for (const c of sceneProfile?.collision ?? def.collision ?? [])
        this.solids.push({ x: ox + c.x, y: oy + c.y, w: c.w, h: c.h });
    } else {
      drawRoomBase(
        this,
        add,
        id,
        { floor: def.floor(), wall: def.wall() },
        ox,
        oy,
        W,
        H,
        B,
        hasRoomDecor(id),
        Object.keys(this.chunks).length > 1,
      );
      // vestido pixel opcional por sala (M1): sala sin entrada en DECOR no cambia.
      for (const o of renderDecor(this, id, ox, oy)) add(o);

      // murallas sólidas con pasos abiertos recortados
      const openGaps = boundaries
        .filter((bd) => !bd.door.locked?.())
        .map((bd) => {
          const from = this.chunks[bd.from];
          return bd.rect.w >= bd.rect.h
            ? { x: from.ox, y: bd.rect.y, w: W, h: bd.rect.h }
            : { x: bd.rect.x, y: from.oy, w: bd.rect.w, h: H };
        });
      this.pushWallSolids(ox, oy, openGaps);
    }

    // aberturas hacia chunks vecinos (se dibujan una sola vez, desde su lado canónico)
    for (const bd of boundaries) {
      if (bd.from !== id) continue;
      const locked = !!bd.door.locked?.();
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
      }
    }

    // puertas con transición (interiores y regiones lejanas)
    for (const d of def.doors) {
      if (d.to in this.chunks) continue; // es una abertura del mundo, ya tratada
      const anchor = sceneProfile?.doors?.[d.to];
      const sd: DoorDef = anchor
        ? { ...d, ...anchor, x: anchor.x + ox, y: anchor.y + oy }
        : { ...d, x: d.x + ox, y: d.y + oy };
      // vano sellado: una puerta trabada u oculta es muro mientras dure su estado.
      // El rebuild por flags retira la barrera cuando la puerta se abre.
      const hidden = !!(d.visible && !d.visible());
      if (hidden || d.locked?.()) this.solids.push({ x: sd.x, y: sd.y, w: sd.w, h: sd.h });
      if (hidden) continue;
      const cy = sd.y + sd.h / 2;
      // los vanos del muro norte atraviesan también su cara vista (¾)
      const extraH = sd.w > sd.h && cy < oy + H / 2 ? 15 : 0;
      // en salas con fondo pintado los arcos ya están dibujados: no dibujar puerta procedural
      if (!paintedKey)
        drawDoorVisual(
          this,
          add,
          { x: sd.x, y: sd.y, w: sd.w, h: sd.h + extraH, color: sd.color, locked: !!sd.locked?.() },
          def.wall(),
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
      if (!dd) return undefined;
      const anchor = sceneProfile?.doors?.[to];
      return anchor ? { ...dd, ...anchor, x: anchor.x + ox, y: anchor.y + oy } : { ...dd, x: dd.x + ox, y: dd.y + oy };
    };
    const aliasedSources = new Set(Object.values(sceneProfile?.interactionAliases ?? {}));
    let walkInStagger = 0;
    for (const t of def.things) {
      if (sceneProfile?.hiddenThings?.includes(t.id) || aliasedSources.has(t.id)) continue;
      const interactionSourceId = sceneProfile?.interactionAliases?.[t.id];
      const interactionSource = interactionSourceId
        ? def.things.find((candidate) => candidate.id === interactionSourceId)
        : undefined;
      const effectiveThing: ThingDef = interactionSource
        ? {
            ...t,
            prompt: sceneProfile?.interactionPrompts?.[t.id] ?? interactionSource.prompt,
            emoji: interactionSource.emoji,
            onInteract: interactionSource.onInteract,
          }
        : t;
      const actor = this.actorKey(effectiveThing.id);
      if (actor && !this.actorFitsNarrativeStage(actor, id)) continue;
      if (actor === 'ohm' && state.flags.ohmAwake) continue;
      const placed = sceneProfile?.things?.[effectiveThing.id];
      const baked = placed?.baked
        ?? effectiveThing.baked
        ?? (sceneProfile ? !!sceneProfile.bakedThings?.includes(effectiveThing.id) : false);
      const st: ThingDef = {
        ...effectiveThing,
        baked,
        solid: baked ? false : effectiveThing.solid,
        x: (placed?.x ?? effectiveThing.x) + ox,
        y: (placed?.y ?? effectiveThing.y) + oy,
      };
      if (st.visible && !st.visible()) {
        // se fue durante este refresh: sale caminando hasta su puerta
        // Esto debe evaluarse antes de deduplicar actores: al quedar invisible,
        // el actor ya no figura en activeActorChunks, pero su cuerpo anterior
        // sigue siendo precisamente el que tiene que despedirse caminando.
        if (!fireEnter && st.walksTo && prevNPCs.has(st.id)) {
          const door = shiftedDoor(st.walksTo);
          if (door) this.walkOut(st, door);
        }
        continue;
      }
      if (actor && this.activeActorChunks.get(actor) !== id) continue;
      const color = typeof st.color === 'function' ? st.color() : st.color;
      const body = add(this.makeThingVisual(st));
      if (body instanceof CharacterRig) body.setScale(body.scale * scaleAt(sceneProfile, st.y - oy));
      // Los nombres aparecen en el prompt contextual al acercarse; no flotan
      // permanentemente sobre todos los habitantes.
      const label: Phaser.GameObjects.Text | null = null;
      if (actor && body instanceof CharacterRig) {
        this.actorBodies.set(actor, body);
        if (label) this.actorLabels.set(actor, label);
      }
      const bounds: Rect = { x: st.x - st.w / 2, y: st.y - st.h / 2, w: st.w, h: st.h };
      // El sprite ocupa alto visual, pero físicamente el personaje sólo bloquea
      // una pequeña zona en los pies. Así se puede circular entre grupos.
      const solidBounds: Rect = body instanceof CharacterRig
        ? { x: st.x - 8, y: st.y - 5, w: 16, h: 10 }
        : bounds;
      // llegó durante este refresh: entra caminando desde su puerta
      const carriedDoor = actor && this.incomingActorKeys.has(actor) && this.incomingFromRoom
        ? shiftedDoor(this.incomingFromRoom)
        : undefined;
      const doorIn = carriedDoor
        ?? (!fireEnter && st.walksTo && !prevNPCs.has(st.id) ? shiftedDoor(st.walksTo) : undefined);
      if (doorIn) {
        this.walkIn(st, doorIn, body, label, bounds, solidBounds, walkInStagger);
        walkInStagger += 240;
      } else {
        if (st.interactive !== false) this.things.push({ def: st, bounds });
        if (st.solid !== false) this.solids.push(solidBounds);
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
    // prop ya pintado en el fondo: cuerpo invisible (conserva hotspot/luz/colisión)
    if (t.baked) {
      const empty = this.add.container(t.x, t.y);
      empty.setDepth(this.bodyDepth(t.y));
      return empty;
    }
    const look = charLookFor(t.id);
    if (look) {
      const rig = new CharacterRig(this, t.x, t.y, look, look.orb ? color : undefined);
      rig.setDepth(this.bodyDepth(t.y));
      this.rigs.push(rig);
      return rig;
    }
    // prop pixel: una textura reemplaza el dibujo procedural (mismo tinte por color/flag)
    if (t.sprite && this.textures.exists(t.sprite)) {
      const container = this.add.container(t.x, t.y);
      const img = this.add.image(0, 0, t.sprite).setOrigin(0.5, 0.88);
      if (t.spriteFit === 'bounds') img.setDisplaySize(t.w, t.h);
      else img.setScale(t.spriteScale ?? 1);
      img.setTint(color);
      container.add(img);
      container.setDepth(this.bodyDepth(t.y));
      return container;
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
    if (body instanceof CharacterRig) {
      this.animateActorPath(
        body,
        undefined,
        this.navigationPath({ x: t.x, y: t.y }, { x: dx, y: dy }),
        () => body.destroy(),
      );
      return;
    }
    const dur = (Math.hypot(dx - t.x, dy - t.y) / NPC_MOVE_SPEED) * 1000;
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
  }

  /** el NPC entra caminando desde la puerta; recién al llegar se vuelve sólido e interactuable */
  private walkIn(
    t: ThingDef,
    door: DoorDef,
    body: Phaser.GameObjects.Container,
    label: Phaser.GameObjects.Text | null,
    bounds: Rect,
    solidBounds: Rect,
    startDelay = 0,
  ): void {
    const { x: sx, y: sy } = this.doorCenter(door);
    body.setPosition(sx, sy);
    const rig = body instanceof CharacterRig ? body : null;
    const gen = this.roomGen;
    const finish = (): void => {
      if (rig) {
        rig.setMoving(false);
        rig.setFacing('south');
        rig.setDepth(this.bodyDepth(t.y));
      }
      if (label) label.setPosition(t.x, t.y - t.h / 2 - 14);
      if (gen !== this.roomGen) return;
      if (t.interactive !== false) this.things.push({ def: t, bounds });
      if (t.solid !== false) this.solids.push(solidBounds);
    };
    if (label) label.setPosition(sx, sy - t.h / 2 - 14);
    if (rig) {
      this.animateActorPath(
        rig,
        label ?? undefined,
        this.navigationPath({ x: sx, y: sy }, { x: t.x, y: t.y }),
        finish,
        startDelay,
      );
      return;
    }
    const duration = (Math.hypot(t.x - sx, t.y - sy) / NPC_MOVE_SPEED) * 1000;
    const step = this.npcStepper(body);
    this.tweens.add({
      targets: body, x: t.x, y: t.y, duration, delay: startDelay,
      onUpdate: () => { step(); body.setDepth(this.bodyDepth(body.y)); },
      onComplete: finish,
    });
    if (label) this.tweens.add({ targets: label, x: t.x, y: t.y - t.h / 2 - 14, duration, delay: startDelay });
  }

  private toggleMap(force?: boolean): void {
    this.mapOpen = force ?? !this.mapOpen;
    this.mapLayer.setVisible(this.mapOpen);
    if (!this.mapOpen) return;

    this.mapLayer.removeAll(true);
    const world = worldOf(this.currentChunk);
    const accent = world?.accent ?? 0xd0a34a;
    const accentCss = `#${accent.toString(16).padStart(6, '0')}`;
    const backdrop = this.add
      .image(480, 270, 'ohmdal-map-panel')
      // El PNG del pergamino es 4:3. Mantener esa proporción evita deformar
      // el marco y da al diagrama una caja de lectura más serena.
      .setDisplaySize(640, 480)
      .setAlpha(0.98);
    const panel = this.add.graphics();
    panel.fillStyle(0x071026, 0.3);
    panel.fillRoundedRect(176, 49, 608, 442, 8);
    panel.lineStyle(2, accent, 0.9);
    panel.strokeRoundedRect(192, 64, 576, 398, 5);
    this.mapLayer.add([backdrop, panel]);

    const title = this.add.text(208, 76, (world?.name ?? 'Ohmdal').toLocaleUpperCase('es'), {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: accentCss,
      fontStyle: 'bold',
      letterSpacing: 2,
    });
    const hint = this.add.text(806, 78, 'M / ESC · cerrar', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '12px',
      color: '#aebbe8',
    }).setOrigin(1, 0);
    const location = this.add.text(154, 103, `UBICACIÓN · ${ROOMS[this.currentChunk]?.name ?? this.currentChunk}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '11px',
      color: '#d6def4',
      letterSpacing: 1,
    });
    hint.setPosition(752, 79);
    location.setPosition(208, 103);
    this.mapLayer.add([title, hint, location]);

    // Las salas pintadas se renderizan de a una, pero el mapa siempre cuenta
    // la geografía completa del mundo al que pertenecen.
    const mapChunks = world?.rooms ?? this.chunks;
    // Esquema de lectura: conserva conexiones, pero no copia literalmente las
    // distancias del mundo. Así evita que el ferry o los extremos del valle
    // aplasten el resto del mapa dentro del pergamino.
    const mapNodes: Record<string, { x: number; y: number }> = {
      plaza: { x: 510, y: 255 }, taller: { x: 610, y: 255 }, puerta: { x: 510, y: 205 }, manantial_ohm: { x: 510, y: 155 },
      castle_gate: { x: 390, y: 245 }, castle_gallery: { x: 390, y: 205 }, castle_branches: { x: 390, y: 165 }, castle_heart: { x: 390, y: 125 },
      forge_yard: { x: 440, y: 305 }, forge_infirmary: { x: 370, y: 305 }, forge_longchannel: { x: 300, y: 305 }, forge_hall: { x: 230, y: 305 },
      terraces_top: { x: 510, y: 305 }, terraces_mid: { x: 510, y: 340 }, terraces_mural: { x: 510, y: 375 }, terraces_aqueduct: { x: 510, y: 410 },
      lighthouse_hall: { x: 590, y: 410 }, lighthouse_bench: { x: 645, y: 375 }, clock_tower: { x: 700, y: 340 }, lighthouse_lantern: { x: 735, y: 305 },
    };
    const mapNames: Record<string, string> = {
      plaza: 'Plaza', taller: 'Taller', puerta: 'Puerta', manantial_ohm: 'Manantial',
      castle_gate: 'Castillo', castle_gallery: 'Galería', castle_branches: 'Ramales', castle_heart: 'Corazón',
      forge_yard: 'Patio', forge_infirmary: 'Fusibles', forge_longchannel: 'Canal largo', forge_hall: 'Nave mayor',
      terraces_top: 'Terraza alta', terraces_mid: 'Reparto', terraces_mural: 'Mural', terraces_aqueduct: 'Acueducto',
      lighthouse_hall: 'Faro', lighthouse_bench: 'Taller', clock_tower: 'Reloj', lighthouse_lantern: 'Linterna',
    };
    const nodeFor = (id: string): { x: number; y: number } => mapNodes[id] ?? { x: 480, y: 300 };
    const nodeW = 68;
    const nodeH = 28;
    const entries = Object.entries(mapChunks);
    const map = this.add.graphics();
    // Red de caminos primero: el mapa cuenta continuidad, no una lista de cajas.
    const linked = new Set<string>();
    for (const [id] of entries) {
      for (const door of ROOMS[id]?.doors ?? []) {
        if (door.visible && !door.visible()) continue;
        const target = mapChunks[door.to];
        if (!target) continue;
        const edge = [id, door.to].sort().join('|');
        if (linked.has(edge)) continue;
        linked.add(edge);
        const fromNode = nodeFor(id);
        const toNode = nodeFor(door.to);
        const ax = fromNode.x;
        const ay = fromNode.y;
        const bx = toNode.x;
        const by = toNode.y;
        map.lineStyle(6, 0x071020, 0.9);
        map.lineBetween(ax, ay, bx, by);
        map.lineStyle(2, accent, 0.85);
        map.lineBetween(ax, ay, bx, by);
      }
    }
    const visited = new Set(state.flags.salasVisitadas);
    for (const [id] of entries) {
      const node = nodeFor(id);
      const x = node.x - nodeW / 2;
      const y = node.y - nodeH / 2;
      const cw = nodeW;
      const ch = nodeH;
      const active = id === this.currentChunk;
      const known = active || visited.has(id);
      map.fillStyle(active ? accent : known ? 0x293765 : 0x111a35, active ? 0.98 : 0.9);
      map.fillRoundedRect(x + 5, y + 5, cw - 10, ch - 10, 6);
      map.lineStyle(active ? 3 : 1.5, active ? 0xfff0b0 : known ? 0x8296ca : 0x435170, 1);
      map.strokeRoundedRect(x + 5, y + 5, cw - 10, ch - 10, 6);
      // Marca de arquitectura: pequeñas losas, canales o placas según el plano.
      map.lineStyle(1, active ? 0x271b22 : 0x9aabd8, active ? 0.35 : 0.2);
      for (let stripe = 14; stripe < cw - 12; stripe += 17) {
        map.lineBetween(x + stripe, y + 10, x + stripe, y + ch - 10);
      }
      const label = this.add.text(x + cw / 2, y + ch / 2, ROOMS[id]?.name.split('—').pop()?.trim() ?? id, {
        fontFamily: 'Georgia, serif',
        fontSize: `${Math.max(9, Math.min(12, ch * 0.18))}px`,
        color: active ? '#171321' : known ? '#edf0fa' : '#7180a5',
        align: 'center',
        wordWrap: { width: Math.max(64, cw - 10) },
      }).setOrigin(0.5);
      label.setText(mapNames[id] ?? id);
      label.setFontSize(8);
      label.setWordWrapWidth(cw - 8);
      this.mapLayer.add(label);
    }
    const activeNode = nodeFor(this.currentChunk);
    const localX = Math.max(-0.35, Math.min(0.35, (this.player.x - W / 2) / W));
    const px = activeNode.x + localX * nodeW;
    // La marca se apoya bajo el nodo activo para no tapar su nombre.
    const py = activeNode.y + nodeH / 2 + 7;
    map.fillStyle(0xfff1a4, 1);
    map.fillCircle(px, py, 6);
    map.lineStyle(2, 0x20142c, 1);
    map.strokeCircle(px, py, 6);
    map.lineStyle(1, 0xffffff, 0.8);
    map.lineBetween(px, py - 10, px, py + 10);
    map.lineBetween(px - 10, py, px + 10, py);

    const legend = this.add.text(154, 456, '◆ POSICIÓN ACTUAL     ━ CAMINO CONTINUO     SALAS OSCURAS · AÚN NO VISITADAS', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '10px',
      color: '#b9c5e6',
      letterSpacing: 0.5,
    });
    legend.setPosition(208, 438);
    this.mapLayer.addAt(map, 2);
    this.mapLayer.add(legend);
  }

  private effectEnabled(effect: SceneEffect): boolean {
    return !effect.flag || !!(state.flags as unknown as Record<string, unknown>)[effect.flag];
  }

  private buildSceneEffects(
    profile: RoomSceneProfile,
    add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  ): void {
    for (const effect of profile.effects ?? []) {
      if (!this.effectEnabled(effect)) continue;
      if (effect.kind === 'sprite') {
        add(
          this.add.image(effect.x, effect.y, effect.texture)
            .setDisplaySize(effect.w, effect.h)
            .setDepth(DEPTH.decor + 3),
        );
        continue;
      }
      if (effect.kind === 'glow' || effect.kind === 'pulse') {
        const glow = add(
          this.add.image(effect.x, effect.y, 'vis-glow')
            .setTint(effect.color)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDisplaySize(effect.radius * 2, effect.radius * 2)
            .setDepth(DEPTH.light)
            .setAlpha(effect.kind === 'pulse' ? 0.2 : 0.3),
        );
        this.tweens.add({ targets: glow, alpha: effect.kind === 'pulse' ? 0.42 : 0.2, duration: effect.kind === 'pulse' ? 1250 : 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        continue;
      }
      if (effect.kind === 'beam') {
        const beam = add(
          this.add.image(effect.x, effect.y, 'vis-glow')
            .setOrigin(0.08, 0.5)
            .setTint(effect.color)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDisplaySize(effect.radius, 55)
            .setDepth(DEPTH.light)
            .setAlpha(0.34),
        );
        this.tweens.add({ targets: beam, angle: 360, alpha: { from: 0.3, to: 0.46 }, duration: 10500, repeat: -1, yoyo: false, ease: 'Linear' });
        continue;
      }
      if (!('w' in effect) || !('h' in effect)) continue;

      const count = effect.kind === 'embers' ? 18 : effect.kind === 'water' ? 12 : 10;
      for (let i = 0; i < count; i++) {
        const color = effect.color ?? (effect.kind === 'embers' ? 0xff8b45 : 0xd7e5de);
        const mote = add(
          this.add.rectangle(
            effect.x + Math.random() * effect.w,
            effect.y + Math.random() * effect.h,
            effect.kind === 'water' ? 18 + Math.random() * 24 : 2 + Math.random() * 3,
            effect.kind === 'water' ? 2 : 2 + Math.random() * 3,
            color,
          ).setDepth(effect.kind === 'water' ? DEPTH.decor + 2 : DEPTH.light)
            .setBlendMode(effect.kind === 'embers' || effect.kind === 'water' ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL)
            .setAlpha(effect.kind === 'water' ? 0.16 : 0.2),
        );
        const dx = effect.kind === 'water' ? 55 : (Math.random() - 0.5) * 35;
        const dy = effect.kind === 'embers' ? -70 - Math.random() * 70 : effect.kind === 'mist' ? -8 : -18;
        this.tweens.add({ targets: mote, x: mote.x + dx, y: mote.y + dy, alpha: 0, duration: 1300 + Math.random() * 2200, delay: Math.random() * 1400, repeat: -1 });
      }
    }
  }

  private drawHitboxDebug(
    profile: RoomSceneProfile,
    add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  ): void {
    const g = add(this.add.graphics().setDepth(DEPTH.ui - 2));
    g.fillStyle(0x38e37a, 0.12);
    g.lineStyle(2, 0x38e37a, 0.8);
    for (const r of profile.walkable) { g.fillRect(r.x, r.y, r.w, r.h); g.strokeRect(r.x, r.y, r.w, r.h); }
    g.fillStyle(0xff4d5a, 0.18);
    g.lineStyle(2, 0xff4d5a, 0.9);
    for (const r of profile.collision ?? []) { g.fillRect(r.x, r.y, r.w, r.h); g.strokeRect(r.x, r.y, r.w, r.h); }
    g.fillStyle(0x4aa8ff, 0.2);
    g.lineStyle(2, 0x4aa8ff, 0.95);
    for (const r of Object.values(profile.doors ?? {})) { g.fillRect(r.x, r.y, r.w, r.h); g.strokeRect(r.x, r.y, r.w, r.h); }
  }

  private onPointer(p: Phaser.Input.Pointer): void {
    if (this.mapOpen) {
      this.toggleMap(false);
      return;
    }
    if (uiOpen()) return;
    // El canvas no es un point-and-click en escritorio: E es la única acción.
    // En táctil se admite tocar el hotspot además del botón de acción.
    if (!touchControlsEnabled()) return;
    const wx = p.worldX;
    const wy = p.worldY;
    for (const t of this.things) {
      const b = t.bounds;
      if (wx >= b.x - 8 && wx <= b.x + b.w + 8 && wy >= b.y - 8 && wy <= b.y + b.h + 8) {
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, cx, cy) <= INTERACT_DIST + b.w / 2) {
          t.def.onInteract();
        }
        return;
      }
    }
  }

  /** Ruta ortogonal corta sobre el mismo mapa de colisiones que usa el jugador. */
  private navigationPath(start: { x: number; y: number }, exit: { x: number; y: number }): { x: number; y: number }[] {
    const step = 24;
    const goal = this.nearestLegalPoint(exit.x, exit.y);
    const startSafe = this.collides(start.x, start.y) ? this.nearestLegalPoint(start.x, start.y) : start;
    const key = (x: number, y: number) => `${Math.round(x / step)},${Math.round(y / step)}`;
    const queue = [{ x: startSafe.x, y: startSafe.y }];
    const parent = new Map<string, string | null>([[key(startSafe.x, startSafe.y), null]]);
    const points = new Map<string, { x: number; y: number }>([[key(startSafe.x, startSafe.y), startSafe]]);
    const goalKey = key(goal.x, goal.y);
    let found: string | null = null;
    for (let index = 0; index < queue.length && index < 2400; index++) {
      const current = queue[index];
      const currentKey = key(current.x, current.y);
      if (currentKey === goalKey || Math.hypot(current.x - goal.x, current.y - goal.y) < step) { found = currentKey; break; }
      for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
        const next = { x: current.x + dx, y: current.y + dy };
        const nextKey = key(next.x, next.y);
        if (parent.has(nextKey) || next.x < 0 || next.x > W || next.y < 0 || next.y > H || this.collides(next.x, next.y)) continue;
        parent.set(nextKey, currentKey);
        points.set(nextKey, next);
        queue.push(next);
      }
    }
    if (!found) return [goal, exit];
    const reversed: { x: number; y: number }[] = [];
    for (let cursor: string | null = found; cursor; cursor = parent.get(cursor) ?? null) reversed.push(points.get(cursor)!);
    reversed.reverse();
    const corners: { x: number; y: number }[] = [];
    let lastDirection = '';
    for (let i = 1; i < reversed.length; i++) {
      const previous = reversed[i - 1];
      const current = reversed[i];
      const direction = Math.abs(current.x - previous.x) > Math.abs(current.y - previous.y) ? 'h' : 'v';
      if (i > 1 && direction !== lastDirection) corners.push(previous);
      lastDirection = direction;
    }
    corners.push(goal, exit);
    return corners;
  }

  private animateActorPath(
    body: CharacterRig,
    label: Phaser.GameObjects.Text | undefined,
    points: { x: number; y: number }[],
    onComplete?: () => void,
    startDelay = 0,
  ): number {
    let total = 0;
    let previous = { x: body.x, y: body.y };
    const run = (index: number): void => {
      const target = points[index];
      if (!target) { body.setMoving(false); onComplete?.(); return; }
      const duration = Math.max(90, (Math.hypot(target.x - body.x, target.y - body.y) / NPC_MOVE_SPEED) * 1000);
      body.setFacing(facingOf(target.x - body.x, target.y - body.y));
      body.setMoving(true);
      this.tweens.add({
        targets: body, x: target.x, y: target.y, duration, ease: 'Linear',
        onUpdate: () => body.setDepth(this.bodyDepth(body.y)),
        onComplete: () => run(index + 1),
      });
      if (label) this.tweens.add({ targets: label, x: target.x, y: target.y - 42, duration, ease: 'Linear' });
    };
    for (const point of points) {
      total += Math.max(90, (Math.hypot(point.x - previous.x, point.y - previous.y) / NPC_MOVE_SPEED) * 1000);
      previous = point;
    }
    if (startDelay > 0) {
      // la comitiva sale en fila, no superpuesta: cada actor espera su turno
      const gen = this.roomGen;
      this.time.delayedCall(startDelay, () => { if (gen === this.roomGen) run(0); });
    } else run(0);
    return startDelay + total;
  }

  /**
   * Cruce diegético entre salas pintadas: la comitiva camina hasta el umbral,
   * hay un fundido corto y los mismos actores entran por el vano de destino.
   */
  private beginDoorTransition(door: PlacedDoor): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.player.setMoving(false);

    const from = this.currentChunk;
    const to = door.def.to;
    const targetActors = new Set<string>();
    for (const thing of ROOMS[to]?.things ?? []) {
      const key = this.actorKey(thing.id);
      if (key && !(key === 'ohm' && state.flags.ohmAwake)
        && this.actorFitsNarrativeStage(key, to) && thing.visible?.() !== false) targetActors.add(key);
    }
    this.incomingActorKeys = new Set(
      [...this.actorBodies.keys()].filter((key) => targetActors.has(key)),
    );
    this.incomingFromRoom = from;

    const exitX = door.bounds.x + door.bounds.w / 2;
    const exitY = door.bounds.y + door.bounds.h / 2;
    let travelMs = 180;
    let stagger = 0;
    for (const key of this.incomingActorKeys) {
      const body = this.actorBodies.get(key);
      if (!body) continue;
      const label = this.actorLabels.get(key);
      const duration = this.animateActorPath(
        body,
        label,
        this.navigationPath(body, { x: exitX, y: exitY }),
        undefined,
        stagger,
      );
      stagger += 240;
      travelMs = Math.max(travelMs, duration);
    }

    const fadeDelay = Math.min(900, travelMs + 40);
    this.time.delayedCall(Math.max(0, fadeDelay - 220), () => this.cameras.main.fadeOut(220, 7, 8, 16));
    this.time.delayedCall(fadeDelay, () => {
      const targetScene = roomScene(to);
      const entry = targetScene?.entries?.[from] ?? door.def.spawn;
      this.loadRoom(to, entry, true);
    });
  }

  update(time: number, delta: number): void {
    const prompt = el('prompt');
    const actionBtn = el<HTMLButtonElement>('action-btn');
    if (uiOpen() || this.mapOpen) {
      prompt.classList.add('hidden');
      actionBtn.classList.add('hidden');
      this.player.setMoving(false);
      this.player.tick(delta);
      return;
    }
    if (this.transitioning) {
      this.player.setMoving(false);
      this.player.tick(delta);
      for (const rig of this.rigs) rig.tick(delta);
      return;
    }
    const dt = delta / 1000;
    this.doorCooldown = Math.max(0, this.doorCooldown - delta);

    // dirección de movimiento — teclado o joystick
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
      }
    }

    // movimiento con aceleración y frenado (fluidez), colisión por eje
    let tx = 0;
    let ty = 0;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      tx = (vx / len) * PLAYER_MOVE_SPEED;
      ty = (vy / len) * PLAYER_MOVE_SPEED;
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
    this.player.setScale(scaleAt(this.activeScene, this.player.y));
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

    this.lastX = this.player.x;
    this.lastY = this.player.y;

    // puertas
    if (this.doorCooldown <= 0) {
      const pb = this.playerBounds();
      for (const d of this.doors) {
        if (!rectsOverlap(pb, d.bounds)) continue;
        const lockedLines = d.def.locked?.() ?? null;
        if (lockedLines) {
          // la barrera del vano ya impide entrar; solo rescatar si quedó en posición ilegal
          if (this.collides(this.player.x, this.player.y)) {
            const safe = this.nearestLegalPoint(this.player.x, this.player.y);
            this.player.setPosition(safe.x, safe.y);
          }
          this.doorCooldown = 900;
          if (Array.isArray(lockedLines) && lockedLines.length > 0) {
            sfxLocked();
            say(lockedLines);
          }
        } else {
          sfxDoor();
          this.beginDoorTransition(d);
        }
        return;
      }
    }

    // red de seguridad: si el jugador quedó en una posición ilegal
    // (empujones, cambios de flags, etc.), devolverlo al piso
    if (this.collides(this.player.x, this.player.y)) {
      const safe = this.nearestLegalPoint(this.player.x, this.player.y);
      this.player.setPosition(safe.x, safe.y);
    }

    // objeto interactuable más cercano
    this.nearThing = null;
    let best = Infinity;
    for (const t of this.things) {
      // Distancia al borde del hotspot, no a su centro. Un prop grande como la
      // Campana debe ganar prioridad cuando el jugador toca su perímetro, aun
      // si hay un NPC cuyo centro está algo más cerca.
      const dx = Math.max(t.bounds.x - this.player.x, 0, this.player.x - (t.bounds.x + t.bounds.w));
      const dy = Math.max(t.bounds.y - this.player.y, 0, this.player.y - (t.bounds.y + t.bounds.h));
      const dist = Math.hypot(dx, dy);
      if (dist < INTERACT_DIST && dist < best) {
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
