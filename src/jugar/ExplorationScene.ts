import Phaser from 'phaser';
import { ROOMS, type ThingDef, type DoorDef } from './rooms';
import { currentField, paintField } from './field/index.ts';
import { state, hooks, save } from '../state';
import { uiOpen, el } from '../ui/overlay';
import { say, type Line } from '../ui/dialog';
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
import { mapSchematicOf } from './mapSchematic';
import { activateExperienceForRoom } from '../experiences/registry';
import { preloadDecorAtlases, applyNearestFilter, renderDecor } from './tiles';
import { hasRoomDecor } from './decorData';
import {
  ROOM_BACKGROUND_FILES,
  ROOM_SCENES,
  backgroundKey,
  rectContainsRect,
  roomScene,
  scaleAt,
  type RoomSceneProfile,
  type SceneEffect,
} from './roomScenes';
import { areaDimensions } from './roomScenesData';
import {
  createActiveRoom,
  clampLocal,
  defaultLocalSpawn,
  activeRoomLocalBounds,
  type ActiveRoom,
} from './activeRoom';
import { cameraBounds } from './cameraDirector';
import {
  buildRoomGraph,
  sourceFromRoomsAndScenes,
  OHMDAL_EDGE_META,
  EXTERNAL_ROOMS,
  type RoomGraph,
} from './roomGraph';
import {
  evaluateExit,
  resolveTransition,
  createTransitionLock,
  type TransitionLock,
  type ResolvedTransition,
} from './roomTransitions';
import { isCinematicId, type CinematicId } from './cinematics';

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
  /** R5: def + bounds locales. Mantenido sólo para presentación visual
   *  (sello del muro) y feedback de lock. NO inicia transiciones. */
  def: DoorDef;
  bounds: Rect;
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
  // R6: chunks/currentChunk del mundo continuo fueron extirpados. La
  // autoridad de placement es local (ActiveRoom) y la presentación del
  // mapa M consulta `mapSchematicOf` (sin offsets).
  private activeActorChunks = new Map<string, string>();
  private actorBodies = new Map<string, CharacterRig>();
  private actorLabels = new Map<string, Phaser.GameObjects.Text>();
  /** R4: lock determinista para impedir transiciones concurrentes. Reemplaza al
   *  antiguo `transitioning` booleano: `transitioning` se deriva como
   *  `this.transitionLock.phase === 'transitioning'`. */
  private transitionLock: TransitionLock = createTransitionLock();
  private incomingActorKeys = new Set<string>();
  private incomingFromRoom: string | null = null;
  private darkness!: Phaser.GameObjects.Rectangle;
  private roomName!: Phaser.GameObjects.Text;
  private objectiveGuide!: Phaser.GameObjects.Text;
  private mapLayer!: Phaser.GameObjects.Container;
  private mapOpen = false;
  private hitboxesOpen = false;
  private activeScene?: RoomSceneProfile;
  /** Metadata consumida por la transición; la presentación la anuncia la room
   *  dueña del estado semántico para no adelantar ni duplicar un one-shot. */
  private pendingCinematic?: CinematicId;

  /** Cierra el consumo de metadata sin convertirla en presentación: los
   *  hooks de room mantienen la autoridad de flags y anuncios one-shot. */
  private consumePendingCinematic(): CinematicId | undefined {
    const pending = this.pendingCinematic;
    this.pendingCinematic = undefined;
    return pending;
  }
  // R2 / R3 / R6: autoridad de gameplay room-local. La cámara, navegación
  // y colisión se evalúan contra esto. Las dimensiones se derivan del
  // perfil activo; `playerLocal` es la única posición de gameplay
  // autoritativa y coincide con el sprite de Phaser (`player.x`, `player.y`).
  private activeRoom: ActiveRoom = createActiveRoom('', { x: W / 2, y: H - 90 });
  // R1/R4: grafo lazy. Se construye la primera vez que se necesita (en
  // `roomGraph()`). Permite re-entrar sin reconstruir.
  private graph: RoomGraph | null = null;
  // R4: triggers de salida natural (bounds locales de cada salida, dentro de
  // la room activa). Se rellena en `loadRoom` y se consume en `update`.
  private exitTriggers: Array<{ exitId: string; rect: Rect }> = [];
  // R4: estado de armado por exit. Evita disparar una transición si el
  // jugador ya estaba dentro del trigger en el frame anterior.
  private exitArmed = new Map<string, boolean>();

  constructor() {
    super('explore');
  }

  /** R4: getter derivado del transitionLock. El código heredado sigue
   *  leyendo `this.transitioning` como booleano. */
  get transitioning(): boolean {
    return this.transitionLock.phase === 'transitioning';
  }

  /** R1: grafo lazy, memoizado en `this.graph`. */
  private roomGraph(): RoomGraph {
    if (!this.graph) this.graph = buildRoomGraph(sourceFromRoomsAndScenes(ROOMS, ROOM_SCENES, OHMDAL_EDGE_META));
    return this.graph;
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
      .setAlpha(0.32);
    this.darkness = this.add
      .rectangle(W / 2, H / 2, W, H, 0x10122a)
      .setScrollFactor(0)
      .setDepth(DEPTH.ambient)
      .setAlpha(0);
    this.roomName = this.add
      .text(20, H - 50, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        color: '#fff1bd',
        fontStyle: 'bold',
        stroke: '#171321',
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.ui);
    this.objectiveGuide = this.add
      .text(20, 20, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#fff1bd',
        backgroundColor: '#171321cc',
        padding: { x: 10, y: 7 },
        stroke: '#171321',
        strokeThickness: 2,
      })
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.ui)
      .setVisible(false);
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

  /**
   * R5: autoridad de colisión LOCAL. Evalúa el cuerpo del jugador contra
   * la geometría LOCAL de la room activa:
   *   - `walkable` (RoomSceneProfile.walkable) define el piso pisable;
   *   - `solids` (puertas selladas, colisiones decorativas, cuerpos sólidos)
   *     son obstáculos locales — ya no se empujan sólidos de muro.
   *
   * No consulta `chunks` ni offsets de mundo. Cambiar la geometría de
   * otra room NO altera la colisión de la room activa.
   */
  private collidesLocal(localX: number, localY: number): boolean {
    const r = PLAYER_R * Math.max(0.5, this.player?.scale ?? 1);
    const pb: Rect = { x: localX - r, y: localY - r, w: r * 2, h: r * 2 };
    if (this.activeScene?.walkable.length && !this.activeScene.walkable.some((r) => rectContainsRect(r, pb))) return true;
    return this.solids.some((s) => rectsOverlap(pb, s));
  }

  /** Punto legal más cercano; evita rescatar al jugador hacia centros ocupados.
   *  R5: SOLO considera geometría LOCAL de la room activa (walkable + entries
   *  locales). Ya no compensa adyacencia entre chunks ni consulta world.ts. */
  private nearestLegalPoint(localX: number, localY: number): { x: number; y: number } {
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
      if (this.collidesLocal(p.x, p.y)) continue;
      const distance = Math.hypot(p.x - localX, p.y - localY);
      if (distance < bestDist) { best = p; bestDist = distance; }
    }
    // R5: el último recurso es el centro LOCAL del room activo, no un
    // chunk del mundo continuo.
    if (best) return best;
    return { x: this.activeRoom.width / 2, y: this.activeRoom.height - 90 };
  }

  /** Un exit bloqueado devuelve al jugador al punto legal anterior al cruce.
   *  Esto evita dejar el cuerpo dentro del trigger/sello mientras el diálogo
   *  está abierto y corta la inercia que podría empujarlo otra vez al vano. */
  private retreatFromBlockedExit(previousLocal: { x: number; y: number }): void {
    let retreat = clampLocal(this.activeRoom, previousLocal);
    if (this.collidesLocal(retreat.x, retreat.y)) {
      retreat = clampLocal(this.activeRoom, this.nearestLegalPoint(retreat.x, retreat.y));
    }
    this.activeRoom.playerLocal = retreat;
    this.player.setPosition(retreat.x, retreat.y);
    this.velX = 0;
    this.velY = 0;
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
   * R6: una persona solo puede existir una vez en la room activa. Antes
   * este método consultaba `chunks` para resolver la "más cercana" entre
   * varios chunks del mundo continuo; en R6 ya no hay varios chunks: la
   * autoridad de placement es local a la room activa. Devuelve el mapa
   * de actores presentes en la room activa (filtrado por etapa narrativa).
   *
   * Se conserva la firma porque el resto del runtime consume un
   * `Map<actorKey, roomId>` para saber qué actor mostrar en esta room.
   */
  private resolveActorChunks(activeId: string): Map<string, string> {
    const chosen = new Map<string, { roomId: string; score: number }>();
    const things = ROOMS[activeId]?.things ?? [];
    for (const thing of things) {
      const key = this.actorKey(thing.id);
      if (!key || thing.visible?.() === false) continue;
      // Despierto, Ohm deja de ser una copia estática por sala y pasa a ser
      // el compañero persistente del HUD. El pedestal sólo existe antes.
      if (key === 'ohm' && state.flags.ohmAwake) continue;
      chosen.set(key, { roomId: activeId, score: -1 });
    }
    return new Map([...chosen].map(([key, value]) => [key, value.roomId]));
  }

  /** Cartel breve de llegada: informa la zona y luego libera la escena. */
  private showRoomBanner(name: string): void {
    this.tweens.killTweensOf(this.roomName);
    this.roomName.setText(name).setAlpha(0).setY(H - 60);
    this.tweens.add({
      targets: this.roomName,
      alpha: 1,
      y: H - 50,
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
    this.exitTriggers = [];
    this.solids = [];
    // Una transición no debe arrastrar la inercia del movimiento anterior a la sala nueva.
    this.velX = 0;
    this.velY = 0;
    this.nearThing = null;

    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.roomObjects.push(o);
      return o;
    };

    // R2: ActiveRoom es la autoridad de gameplay. Sus dimensiones vienen
    // del perfil de escena (width/height propias de la room) y su
    // `playerLocal` se inicializa en el spawn pedido o en el default local.
    // Plaza: el default es la llegada por el portal (SW), no el centro del
    // viewport 960×540 — ese número dejaba al jugador en un cuadrante vacío.
    const dims = areaDimensions(id);
    const initialSpawn = spawn
      ?? (id === 'plaza' ? { x: 300, y: 840 } : undefined)
      ?? defaultLocalSpawn(dims);
    this.activeRoom = createActiveRoom(id, initialSpawn);

    // R3 / R6: la room activa es la única construida. Su rect local
    // coincide con el rect Phaser; no hay bridge a un plano world.
    this.activeActorChunks = this.resolveActorChunks(id);

    // R2 / R6: cámara = bounds LOCALES de la room activa. Phaser recibe
    // directamente `(0, 0, width, height)` — no se proyecta nada.
    const localBounds = activeRoomLocalBounds(this.activeRoom);
    const camBounds = cameraBounds(localBounds, { width: W, height: H });
    this.cameras.main.setBounds(camBounds.x, camBounds.y, camBounds.w, camBounds.h);
    this.cameras.main.startFollow(this.player, false, 0.12, 0.12);

    // R3 / R6: construyo la room activa en su origen local. No hay
    // chunks adyacentes; la autoridad de colisión es la geometría LOCAL
    // de la room activa y la autoridad de cambio de room es la
    // transición de grafo (R4) por exitTrigger.
    this.buildChunk(id, prevNPCs, fireEnter, add);
    if (this.activeScene) {
      this.buildSceneEffects(this.activeScene, add);
      if (this.hitboxesOpen) this.drawHitboxDebug(this.activeScene, add);
    }

    // R4: poblar `exitTriggers` con las salidas LOCALES de la room
    // activa. Cada `RoomSceneProfile[from].doors[exitId]` se traduce a un
    // `Rect` local (sin offsets), y el `exitId` se guarda para que
    // `requestRoomTransition` pueda resolver destino + entry.
    if (this.activeScene?.doors) {
      for (const [exitId, doorRect] of Object.entries(this.activeScene.doors)) {
        this.exitTriggers.push({
          exitId,
          rect: { x: doorRect.x, y: doorRect.y, w: doorRect.w, h: doorRect.h },
        });
      }
    }

    // penumbra y HUD
    this.darkness.setAlpha(AMBIENT[mood]);
    this.objectiveGuide
      .setText(id === 'plaza' && state.flags.ohmAwake && !state.flags.metLumen
        ? 'Taller de Lumen · al este →'
        : '')
      .setVisible(id === 'plaza' && state.flags.ohmAwake && !state.flags.metLumen);
    if (fireEnter) this.showRoomBanner(def.name);
    if (fireEnter) this.cameras.main.fadeIn(240, 7, 8, 16);

    // Posicionar al jugador. R6: el sprite de Phaser vive en coords
    // LOCALES directamente — `player.x/y` ES `activeRoom.playerLocal`.
    const sp = this.activeRoom.playerLocal;
    this.player.setPosition(sp.x, sp.y);
    this.player.setScale(scaleAt(this.activeScene, sp.y));
    // si quedó dentro de algo sólido (spawn junto a una puerta), empujar al piso.
    if (this.collidesLocal(this.activeRoom.playerLocal.x, this.activeRoom.playerLocal.y)) {
      const safe = this.nearestLegalPoint(
        this.activeRoom.playerLocal.x,
        this.activeRoom.playerLocal.y,
      );
      this.activeRoom.playerLocal = clampLocal(this.activeRoom, { x: safe.x, y: safe.y });
      this.player.setPosition(this.activeRoom.playerLocal.x, this.activeRoom.playerLocal.y);
    }
    this.doorCooldown = 700;
    // R4 / TEST 6: pre-armar todos los exitTriggers nuevos como "ya dentro"
    // para evitar re-trigger inmediato cuando el spawn cae dentro de un
    // trigger (rising-edge detection vería false→true en el siguiente frame).
    // El primer frame de update() setea el armed con el `inside` real;
    // si el jugador sale y vuelve, la rising-edge dispara correctamente.
    this.exitArmed.clear();
    for (const trig of this.exitTriggers) {
      this.exitArmed.set(trig.exitId, true);
    }

    if (fireEnter) def.onEnter?.();
    // R4: liberamos el lock que `requestRoomTransition` tomó al iniciar
    // la coreografía. La fase vuelve a 'idle' hasta el próximo cruce.
    this.transitionLock.finish();
    this.incomingActorKeys.clear();
    this.incomingFromRoom = null;
    const field = currentField();
    if (field && field.roomId === id && field.active()) paintField(false);
    else if (field && field.roomId !== id) {
      const dock = document.getElementById('field-dock');
      dock?.classList.add('hidden');
    }
  }

  /** construye la room activa: base, puertas visuales, cosas y personajes.
   *  R6: la room activa vive en su origen local; ya no hay parámetros
   *  `ox/oy`. Las colisiones, las puertas y las cosas se almacenan en
   *  coordenadas LOCALES (== coordenadas Phaser del sprite). */
  private buildChunk(
    id: string,
    prevNPCs: Set<string>,
    fireEnter: boolean,
    add: <T extends Phaser.GameObjects.GameObject>(o: T) => T,
  ): void {
    const def = ROOMS[id];
    const sceneProfile = roomScene(id);
    const paintedKey = sceneProfile
      ? backgroundKey(sceneProfile, state.flags as unknown as Record<string, unknown>)
      : def.background;

    const roomW = this.activeRoom.width;
    const roomH = this.activeRoom.height;

    // sala pintada: el fondo cubre el rect LOCAL de la room, no el viewport.
    // Plaza 1920×1080 y cualquier área mayor al canvas 960×540 se panean con la cámara.
    if (paintedKey && this.textures.exists(paintedKey)) {
      const bg = this.add.image(roomW / 2, roomH / 2, paintedKey).setDepth(DEPTH.shadow - 4);
      bg.setDisplaySize(roomW, roomH);
      if (
        paintedKey === 'room-plaza' ||
        paintedKey === 'room-plaza-castle-open' ||
        paintedKey === 'room-puerta-closed' ||
        paintedKey === 'room-puerta-open' ||
        paintedKey === 'room-manantial'
      ) {
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      add(bg);
      for (const c of sceneProfile?.collision ?? def.collision ?? [])
        this.solids.push({ x: c.x, y: c.y, w: c.w, h: c.h });
    } else {
      drawRoomBase(
        this,
        add,
        id,
        { floor: def.floor(), wall: def.wall() },
        0,
        0,
        roomW,
        roomH,
        B,
        hasRoomDecor(id) && id !== 'plaza',
        false, // R6: ya no existe el modo "mundo continuo"
      );
      // vestido pixel opcional por sala (M1): sala sin entrada en DECOR no cambia.
      // Plaza usa el set pintado 1920×1080; el tileset medieval genérico no es Ohmdal.
      if (id !== 'plaza') {
        for (const o of renderDecor(this, id, 0, 0)) add(o);
      }
      // R6: NO se empujan sólidos de muro. La autoridad de "el jugador no
      // sale del room" la da (a) `walkable` (cubre el área pisable) y
      // (b) `clampLocal` (en update). Los muros visuales (procedurales o
      // pintados) son decorativos; un exitTrigger del grafo se dispara
      // cuando el jugador pisa el rect local de la salida — sin necesidad
      // de cortar un hueco en el muro.
    }

    // puertas con transición (locales y remotas). Cada `def.doors` se
    // trata como una PUERTA local de la room activa.
    for (const d of def.doors) {
      const anchor = sceneProfile?.doors?.[d.to];
      const sd: DoorDef = anchor
        ? { ...d, ...anchor, x: anchor.x, y: anchor.y }
        : { ...d, x: d.x, y: d.y };
      // vano sellado: una puerta trabada u oculta es muro mientras dure su estado.
      // El rebuild por flags retira la barrera cuando la puerta se abre.
      const hidden = !!(d.visible && !d.visible());
      if (hidden || d.locked?.()) this.solids.push({ x: sd.x, y: sd.y, w: sd.w, h: sd.h });
      if (hidden) continue;
      const cy = sd.y + sd.h / 2;
      // los vanos del muro norte atraviesan también su cara vista (¾)
      const extraH = sd.w > sd.h && cy < roomH / 2 ? 15 : 0;
      // en salas con fondo pintado los arcos ya están dibujados: no dibujar puerta procedural
      if (!paintedKey)
        drawDoorVisual(
          this,
          add,
          { x: sd.x, y: sd.y, w: sd.w, h: sd.h + extraH, color: sd.color, locked: !!sd.locked?.() },
          def.wall(),
        );
      // R6: la entrada en `this.doors` es SÓLO para presentación
      // (sello/lock) y feedback; el cambio de room lo dispara el
      // exitTrigger del grafo, NO esta lista.
      this.doors.push({
        def: sd,
        bounds: { x: sd.x - 14, y: sd.y - 14, w: sd.w + 28, h: sd.h + 28 },
      });
    }

    // objetos y personajes (coordenadas locales)
    const localDoor = (to: string | undefined): DoorDef | undefined => {
      if (!to) return undefined;
      const dd = def.doors.find((d) => d.to === to);
      if (!dd) return undefined;
      const anchor = sceneProfile?.doors?.[to];
      return anchor ? { ...dd, ...anchor, x: anchor.x, y: anchor.y } : { ...dd, x: dd.x, y: dd.y };
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
        x: placed?.x ?? effectiveThing.x,
        y: placed?.y ?? effectiveThing.y,
      };
      if (st.visible && !st.visible()) {
        // se fue durante este refresh: sale caminando hasta su puerta
        if (!fireEnter && st.walksTo && prevNPCs.has(st.id)) {
          const door = localDoor(st.walksTo);
          if (door) this.walkOut(st, door);
        }
        continue;
      }
      if (actor && this.activeActorChunks.get(actor) !== id) continue;
      const color = typeof st.color === 'function' ? st.color() : st.color;
      const body = add(this.makeThingVisual(st));
      if (body instanceof CharacterRig) body.setScale(body.scale * scaleAt(sceneProfile, st.y));
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
        ? localDoor(this.incomingFromRoom)
        : undefined;
      const doorIn = carriedDoor
        ?? (!fireEnter && st.walksTo && !prevNPCs.has(st.id) ? localDoor(st.walksTo) : undefined);
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

  /** y-sort LOCAL: la profundidad crece monótonamente con y. R6: ya no
   *  hace falta un offset (worldMinY) porque la room activa vive en
   *  `[0, activeRoom.height)` y su origen local es (0, 0). */
  private bodyDepth(y: number): number {
    return DEPTH.shadow + y * 0.25;
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
      // La campana pintada ya trae cobre/madera; un tint de estado la ensucia.
      if (t.sprite !== 'prop_plaza_bell') img.setTint(color);
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
    // R6: el mapa M consulta `mapSchematicOf` (topología del sector + accent
    // + name) en vez del antiguo `worldOf` (que vivía del plano mundo).
    const schematic = mapSchematicOf(this.activeRoom.id);
    const accent = schematic?.accent ?? 0xd0a34a;
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

    const title = this.add.text(208, 76, (schematic?.name ?? 'Ohmdal').toLocaleUpperCase('es'), {
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
    const location = this.add.text(154, 103, `UBICACIÓN · ${ROOMS[this.activeRoom.id]?.name ?? this.activeRoom.id}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '11px',
      color: '#d6def4',
      letterSpacing: 1,
    });
    hint.setPosition(752, 79);
    location.setPosition(208, 103);
    this.mapLayer.add([title, hint, location]);

    // R6: el catálogo que pinta el mapa sale de `mapSchematicOf` (rooms
    // del sector) + RoomGraph (conexiones). No hay `chunks` con offsets
    // físicos; el mapa M es puramente esquemático.
    const mapRoomIds = new Set(schematic?.rooms ?? Object.keys(ROOM_SCENES));
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
    const entries = Array.from(mapRoomIds);
    const map = this.add.graphics();
    // Red de caminos primero: el mapa cuenta continuidad, no una lista de cajas.
    // R6: la conectividad sale de RoomGraph (grafo de salas, no plano world).
    const graph = this.roomGraph();
    const linked = new Set<string>();
    for (const conn of graph.connections()) {
      if (!mapRoomIds.has(conn.from) || !mapRoomIds.has(conn.to)) continue;
      const edge = [conn.from, conn.to].sort().join('|');
      if (linked.has(edge)) continue;
      linked.add(edge);
      const fromNode = nodeFor(conn.from);
      const toNode = nodeFor(conn.to);
      map.lineStyle(6, 0x071020, 0.9);
      map.lineBetween(fromNode.x, fromNode.y, toNode.x, toNode.y);
      map.lineStyle(2, accent, 0.85);
      map.lineBetween(fromNode.x, fromNode.y, toNode.x, toNode.y);
    }
    const visited = new Set(state.flags.salasVisitadas);
    for (const id of entries) {
      const node = nodeFor(id);
      const x = node.x - nodeW / 2;
      const y = node.y - nodeH / 2;
      const cw = nodeW;
      const ch = nodeH;
      const active = id === this.activeRoom.id;
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
    const activeNode = nodeFor(this.activeRoom.id);
    // R6: el sprite del jugador vive en coords locales; la posición del
    // marcador en el mapa se proyecta como `localX = (player.x - roomW/2) / roomW`.
    const roomW = this.activeRoom.width || W;
    const localX = Math.max(-0.35, Math.min(0.35, (this.player.x - roomW / 2) / roomW));
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
    // R5: colisión LOCAL; la room activa vive en (0,0) del legacy world,
    // por lo que `start`/`exit` (en legacy world) son tratados como locales.
    const goal = this.nearestLegalPoint(exit.x, exit.y);
    const startSafe = this.collidesLocal(start.x, start.y) ? this.nearestLegalPoint(start.x, start.y) : start;
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
        if (parent.has(nextKey) || next.x < 0 || next.x > W || next.y < 0 || next.y > H || this.collidesLocal(next.x, next.y)) continue;
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
   * R5: NO existe un pipeline de "door transition" independiente. El único
   * camino para cambiar de room es:
   *
   *   exitTrigger (geometría local) → requestRoomTransition(exitId)
   *     → evaluateExit (grafo) → resolveTransition → performTransition
   *
   * `this.doors` se conserva SÓLO para presentación (sello/lock) y para el
   * feedback diegético de "puerta trabada" en el update(); nunca inicia
   * un cambio de ActiveRoom. (Ver `requestRoomTransition` y `performTransition`.)
   */

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
    const previousLocal = { ...this.activeRoom.playerLocal };
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
    // R6: la colisión es LOCAL. `player.x`/`player.y` SON las coordenadas
    // locales de la room activa — no se proyecta nada.
    if (stepX !== 0 && !this.collidesLocal(this.player.x + stepX, this.player.y)) this.player.x += stepX;
    if (stepY !== 0 && !this.collidesLocal(this.player.x, this.player.y + stepY)) this.player.y += stepY;

    // R6: el sistema local es la única autoridad de gameplay. El sprite
    // de Phaser y `activeRoom.playerLocal` son la misma posición; el
    // clamp la reescribe en los dos para mantenerlos sincronizados.
    const clamped = clampLocal(this.activeRoom, { x: this.player.x, y: this.player.y });
    this.activeRoom.playerLocal = clamped;
    if (clamped.x !== this.player.x || clamped.y !== this.player.y) {
      this.player.setPosition(clamped.x, clamped.y);
    }

    // vida de los rigs: orientación, trote, respiración, y-sort, luz que acompaña
    if (vx !== 0 || vy !== 0) this.player.setFacing(facingOf(vx, vy));
    this.player.setScale(scaleAt(this.activeScene, this.activeRoom.playerLocal.y));
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

    // R4: transiciones naturales. Cada `exitTrigger` representa una salida
    // LOCAL de la room activa (rect expandido para que el jugador entre
    // cómodamente). Se arma cuando el jugador entra y se dispara cuando
    // pasa de "no dentro" a "dentro" (evita rebotes por estar parado
    // encima).
    const lp = this.activeRoom.playerLocal;
    const playerRect = this.playerBoundsLocal(lp.x, lp.y);
    for (const trig of this.exitTriggers) {
      const expanded = { x: trig.rect.x - 14, y: trig.rect.y - 14, w: trig.rect.w + 28, h: trig.rect.h + 28 };
      const inside = rectsOverlap(playerRect, expanded);
      const wasArmed = this.exitArmed.get(trig.exitId) ?? false;
      this.exitArmed.set(trig.exitId, inside);
      if (!inside || wasArmed) continue;
      if (this.doorCooldown > 0) this.doorCooldown = 0;
      sfxDoor();
      const outcome = this.requestRoomTransition(trig.exitId);
      if (outcome === 'blocked') this.retreatFromBlockedExit(previousLocal);
      this.doorCooldown = 700;
      return;
    }

    // R6: `this.doors` ya NO inicia transiciones. Sólo aporta feedback
    // diegético cuando el jugador toca un sello de muro trabado. La
    // autoridad de cambio de room es exclusivamente el exitTrigger +
    // requestRoomTransition (ver bloque anterior).
    if (this.doorCooldown <= 0) {
      const pb = this.playerBounds();
      for (const d of this.doors) {
        if (!rectsOverlap(pb, d.bounds)) continue;
        const lockedLines = d.def.locked?.() ?? null;
        if (lockedLines) {
          this.retreatFromBlockedExit(previousLocal);
          this.doorCooldown = 900;
          if (Array.isArray(lockedLines) && lockedLines.length > 0) {
            sfxLocked();
            say(lockedLines as Line[]);
          }
        }
        return;
      }
    }

    // red de seguridad: si el jugador quedó en una posición ilegal
    // (empujones, cambios de flags, etc.), devolverlo al piso pisable
    // de la room activa (R6: colisión LOCAL pura, sin proyección).
    if (this.collidesLocal(this.activeRoom.playerLocal.x, this.activeRoom.playerLocal.y)) {
      const safe = this.nearestLegalPoint(
        this.activeRoom.playerLocal.x,
        this.activeRoom.playerLocal.y,
      );
      this.activeRoom.playerLocal = clampLocal(this.activeRoom, { x: safe.x, y: safe.y });
      this.player.setPosition(this.activeRoom.playerLocal.x, this.activeRoom.playerLocal.y);
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

  // ──────────────────────────────────────────────────────────────────────
  // R2 / R4: authority + natural transitions
  // ──────────────────────────────────────────────────────────────────────

  /** R2: playerBounds en coordenadas LOCALES de la room activa. */
  private playerBoundsLocal(localX: number, localY: number): Rect {
    const r = PLAYER_R * Math.max(0.5, this.player?.scale ?? 1);
    return { x: localX - r, y: localY - r, w: r * 2, h: r * 2 };
  }

  /**
   * R4: pide una transición por SALIDA (no por destino). El grafo resuelve
   * destino + entry; `evaluateExit` aplica visible/locked con los predicados
   * de la door fuente. `requestStart` del `transitionLock` impide disparar
   * dos a la vez. Devuelve `'transitioned' | 'blocked'`.
   */
  private requestRoomTransition(exitId: string): 'transitioned' | 'blocked' {
    const evaluation = evaluateExit(this.roomGraph(), this.activeRoom.id, exitId);
    if (!evaluation.block.ok) {
      // La barrera la evalúa el grafo. Si está trabada, reproducimos el
      // feedback diegético que el door.locked() declaró; si está oculta
      // o no existe, el silencio es la respuesta correcta (no inventamos
      // diálogo en runtime).
      if (evaluation.block.reason === 'locked') {
        const lines = evaluation.block.lines;
        if (Array.isArray(lines) && lines.length > 0) {
          sfxLocked();
          say(lines as Line[]);
        }
      }
      this.doorCooldown = 900;
      return 'blocked';
    }
    if (!this.transitionLock.requestStart()) return 'blocked';
    const resolved = resolveTransition(this.roomGraph(), this.activeRoom, exitId);
    if (resolved) {
      this.performTransition(resolved);
      return 'transitioned';
    }
    this.transitionLock.finish();
    return 'blocked';
  }

  /**
   * R4: ejecuta la coreografía de salida, el fade según `kind`, y carga la
   * room destino vía `loadRoom` con el `playerLocal` resuelto por el grafo.
   */
  private performTransition(connection: ResolvedTransition): void {
    this.player.setMoving(false);
    const toId = connection.connection.to;
    const fromId = this.activeRoom.id;
    // Consumimos y tipamos la metadata, pero no la anunciamos aquí: la room
    // dueña confirma primero su flag semántico y emite su único one-shot.
    const cinematic = connection.connection.cinematic;
    this.pendingCinematic = isCinematicId(cinematic) ? cinematic : undefined;
    if (!ROOMS[toId]) {
      this.transitionLock.finish();
      return;
    }
    if (EXTERNAL_ROOMS.has(toId)) {
      this.routeExternalRoom(toId);
      this.transitionLock.finish();
      return;
    }
    // Determinar qué actores deben reaparecer (no fijos al HUD ni a flags)
    const next = new Set<string>();
    for (const thing of ROOMS[toId]?.things ?? []) {
      const key = this.actorKey(thing.id);
      if (
        key &&
        !(key === 'ohm' && state.flags.ohmAwake) &&
        this.actorFitsNarrativeStage(key, toId) &&
        thing.visible?.() !== false
      ) {
        next.add(key);
      }
    }
    this.incomingActorKeys = new Set([...this.actorBodies.keys()].filter((k) => next.has(k)));
    this.incomingFromRoom = fromId;

    // Spawn local derivado de la salida resuelta; fallback al centro-sur
    // local de la room destino. R6: la posición vive en coords LOCALES.
    const exitRect = connection.resolved.exit;
    const localSpawn = exitRect
      ? { x: exitRect.x + exitRect.w / 2, y: exitRect.y + exitRect.h / 2 }
      : { x: this.activeRoom.width / 2, y: Math.max(0, this.activeRoom.height - 60) };

    // Coreografía de comitiva: mandar a los actores al exit antes de cambiar
    // de room. Si no hay nadie caminando, esto termina en ~180ms.
    let t = 180;
    let offset = 0;
    for (const key of this.incomingActorKeys) {
      const body = this.actorBodies.get(key);
      if (!body) continue;
      const label = this.actorLabels.get(key);
      const path = this.navigationPath(body, localSpawn);
      const dur = this.animateActorPath(body, label, path, undefined, offset);
      offset += 240;
      t = Math.max(t, dur);
    }

    const kind = connection.kind;
    const isFadeOrCinematic = kind === 'fade' || kind === 'cinematic';
    const wait = Math.min(isFadeOrCinematic ? 900 : 40, t + 40);
    if (isFadeOrCinematic) {
      this.time.delayedCall(Math.max(0, wait - 220), () => {
        this.cameras.main.fadeOut(220, 7, 8, 16);
      });
    }
    this.time.delayedCall(wait, () => {
      void this.consumePendingCinematic();
      this.loadRoom(toId, { ...connection.target.playerLocal }, true);
    });
  }

  /** Destino fuera de Ohmdal: volver a la home isométrica del Instituto. */
  private routeExternalRoom(_target: string): void {
    window.location.href = '/';
  }
}
