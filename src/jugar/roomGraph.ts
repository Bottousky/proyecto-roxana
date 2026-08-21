/**
 * RoomGraph — topología de Ohmdal (modelo room-based, ADR-002).
 *
 * Este módulo responde a QUÉ conecta con QUÉ, POR DÓNDE (salida), HACIA
 * QUÉ entry y CON QUÉ transición. **No** contiene colocación física de
 * mundo: no hay `ox/oy`, no hay plano mundo, no se exige que las rooms
 * conectadas se toquen geométricamente.
 *
 * IDENTIDAD DE SALIDA (R1.1):
 * Una transición se inicia por una SALIDA concreta de la room origen.
 * `from + to` NO identifica de forma única una conexión: una room puede
 * tener dos salidas hacia el mismo destino (p. ej. `north_gate` y
 * `secret_door` → B) con entry, lock, kind y cinematic distintos.
 *
 * Fuente de identidad de salida (sin duplicar topología):
 * - `RoomSceneProfile.doors` se indexa HOY por el id de la room destino
 *   (41/41 anclas verificadas), es decir, el key ES el exit en la data
 *   actual. `DoorDef` (rooms.ts) no tiene campo `exit`/`id`.
 * - Adapter determinista mínimo: `exit = door.exit ?? door.to`.
 *   En la data actual `exit === to` (coincide con el key de
 *   `RoomSceneProfile.doors`). Si en el futuro una room declara dos salidas
 *   al mismo destino, cada door declara su `exit` (y su `entry` de destino,
 *   ver abajo) y el contrato las distingue sin tablas de topología nuevas.
 *
 * ENTRADAS DE DESTINO (R1.1):
 * Resolución por salida: 1) `door.entry` (específico de la salida, futuro)
 * → 2) `scenes[to].entries[from]` (keyed por ROOM origen, data actual)
 * → 3) `door.spawn` → 4) fallback documentado.
 *
 *   CURRENT DATA LIMITATION:
 *   destination entries are source-room keyed.
 *   `scenes[to].entries[from]` no puede distinguir dos salidas de la misma
 *   origen hacia el mismo destino. La data actual tiene exactamente una
 *   salida por (from,to), así que es suficiente. Cuando una segunda salida
 *   hacia el mismo destino aparezca, esa salida debe declarar su `entry`
 *   (o metadata equivalente) para sobrescribir la entrada keyed por room.
 *
 * BOUNDARY DE RUNTIME EXTERNO:
 * `EXTERNAL_ROOMS` lista rooms que viven en otro runtime/experiencia
 * y NO tienen perfil de escena
 * ni forman parte del grafo jugable de Ohmdal Arc 1. La validación las
 * distingue de rooms malformadas (sin perfil por error). No se crean
 * RoomSceneProfiles falsos para silenciar la validación.
 *
 * PUREZA:
 * - No importa Phaser.
 * - No importa `world.ts` (dependencia CERO de offsets).
 * - No importa `rooms.ts` de forma estática (arrastra UI/DOM y `?url`).
 * - Única dependencia: `roomScenesData.ts` (módulo limpio en Node).
 */

import {
  areaDimensions,
  type RoomSceneProfile,
  type SceneRect,
} from './roomScenesData.ts';

export type RoomId = string;

/** Identidad estable de una salida dentro de su room origen. */
export type ExitId = string;

/** Tipos de transición soportados (metadata). El runtime transicional
 *  llega en R4; aquí sólo se clasifica. */
export type TransitionKind = 'fade' | 'doorway' | 'cinematic' | 'seamless';

/** Forma mínima del resultado de `DoorDef.locked()`: `Line[] | true | null`.
 *  Se evita importar `Line` (UI) para mantener el módulo puro. */
export type RoomLockResult = unknown;

export const TRANSITION_KINDS: readonly TransitionKind[] = [
  'fade',
  'doorway',
  'cinematic',
  'seamless',
];

export const DEFAULT_TRANSITION_KIND: TransitionKind = 'doorway';

/** Fallback documentado de entry (SPATIAL_CONTRACT §3.2, paso 4). Coincide
 *  con el spawn por defecto del runtime (`{ x: W/2, y: H-90 }`). */
export const DEFAULT_ENTRY_FALLBACK_Y_OFFSET = 90;

export function defaultEntryFallback(width: number, height: number): { x: number; y: number } {
  return { x: width / 2, y: height - DEFAULT_ENTRY_FALLBACK_Y_OFFSET };
}

/** Rooms de otro runtime/experiencia que no pertenecen al grafo jugable
 *  de Ohmdal Arc 1. Vacío: el Instituto es la home isométrica, no Phaser. */
export const EXTERNAL_ROOMS: ReadonlySet<string> = new Set();

/** ---------------------- buildLocalExitTriggers (R4.2) ---------------------- */
/**
 * Forma minima de un disparador de salida LOCAL del area activa.
 * Responsabilidad: SOLO geometria + identidad de salida.
 *  - exitId: id estable de la salida (canonico, RECORD KEY del perfil).
 *  - rect: rectangulo de disparo en coordenadas LOCALES del area activa.
 *  - doorDef: opcional, solo para presentacion sellada (vano/lock visuals).
 *
 * NO infiere destino. NO conoce adyacencia fisica. NO decide presentacion.
 * El destino y los predicados los resuelve RoomGraph via
 * requestRoomTransition(exitId) -> resolveTransition(...).
 */
export interface LocalExitTrigger {
  /** Stable identity of the source-room exit; no destination is encoded here. */
  exitId: string;
  /** Local trigger geometry. */
  rect: { x: number; y: number; w: number; h: number };
}

export interface DoorDefLike {
  to: string;
  exit?: string;
  x: number; y: number; w: number; h: number;
  spawn: { x: number; y: number };
  label: string;
  color?: number;
  visible?: () => boolean;
  locked?: () => unknown;
}

export interface BuildLocalExitTriggersInput {
  sceneProfile: Pick<RoomSceneProfile, 'doors'> | null | undefined;
}

/** Canonical presentation identity for a DoorDef. */
export function doorExitId(door: DoorDefLike): string {
  return door.exit ?? door.to;
}

/**
 * Binds local scene geometry keys to stable exit identities.
 * Destination lookup and presentation state remain separate concerns.
 */
export function buildLocalExitTriggers(input: BuildLocalExitTriggersInput): LocalExitTrigger[] {
  const profileDoors = input.sceneProfile?.doors ?? {};
  return Object.entries(profileDoors).map(([exitId, anchor]) => ({
    exitId,
    rect: { x: anchor.x, y: anchor.y, w: anchor.w, h: anchor.h },
  }));
}

/** ---------------------- Fuente del grafo (contrato de entrada) ---------------------- */

export interface RoomDoorSource {
  /** room destino (autoritativo: `DoorDef.to`). */
  to: string;
  /** id estable de la salida. Default: `to` (hoy hay exactamente una
   *  salida por (from,to) y `RoomSceneProfile.doors` se indexa por el id de
   *  la room destino). Dos salidas hacia el mismo destino requieren `exit`
   *  explícito. */
  exit?: string;
  /** entry LOCAL de destino específico de esta salida (futuro). Cuando una
   *  salida lo declara, gana sobre `scenes[to].entries[from]` (ver
   *  CURRENT DATA LIMITATION en el encabezado). */
  entry?: { x: number; y: number };
  /** spawn local de la door (`DoorDef.spawn`), fallback de entry. */
  spawn?: { x: number; y: number };
  /** predicado autoritativo (`DoorDef.visible`). Referenciado, no copiado. */
  visible?: () => boolean;
  /** predicado autoritativo (`DoorDef.locked`). Referenciado, no copiado. */
  locked?: () => RoomLockResult;
}

export interface RoomGraphRoomSource {
  id: string;
  doors: RoomDoorSource[];
}

/** Tabla de excepciones de transición por salida. Sólo se listan las que NO
 *  usan el default `'doorway'`. El matcher usa la identidad de conexión:
 *  `id ?? `${from}->${exit ?? to}``. */
export interface RoomGraphEdgeMeta {
  id?: string;
  from: string;
  /** salida. Si se omite, se usa `to` (equivalente a la data actual). */
  exit?: string;
  /** destino. Útil como alias cuando no hay `exit` explícito. */
  to?: string;
  kind?: TransitionKind;
  /** hook de cinemática a reproducir el primer cruce (sólo `kind === 'cinematic'`). */
  cinematic?: string;
}

export interface RoomGraphSource {
  rooms: Record<string, RoomGraphRoomSource>;
  scenes: Record<string, RoomSceneProfile>;
  edgeMeta?: RoomGraphEdgeMeta[];
}

/** Seed de `kind` desde `ARC1_ROOM_GRAPH.md` §4.1, mapeado a las rooms de
 *  runtime actuales. Default para el resto: `'doorway'`.
 *
 *  - `area-plaza-cuenca ↔ area-taller` → `fade` (doorway + fade 220ms).
 *  - `area-plaza-cuenca ↔ area-calzada` → `cinematic` (Puerta monumental;
 *    primera vez tras unlock; metadata por ahora).
 *  - `area-castillo-ext ↔ area-castillo-int` → `fade` (interior).
 *  - Toda otra arista (castillo int, forja, terrazas, faro, hub) → `doorway`.
 */
export const OHMDAL_EDGE_META: RoomGraphEdgeMeta[] = [
  { from: 'plaza', to: 'taller', kind: 'fade' },
  { from: 'taller', to: 'plaza', kind: 'fade' },
  { from: 'plaza', to: 'puerta', kind: 'cinematic' },
  { from: 'puerta', to: 'manantial_ohm', kind: 'cinematic', cinematic: 'puerta-apertura' },
  { from: 'terraces_aqueduct', to: 'lighthouse_hall', kind: 'cinematic', cinematic: 'faro-reveal' },
  { from: 'puerta', to: 'plaza', kind: 'cinematic' },
  { from: 'castle_gate', to: 'castle_gallery', kind: 'fade' },
  { from: 'castle_gallery', to: 'castle_gate', kind: 'fade' },
];

/** ---------------------- Grafo derivado ---------------------- */

export interface RoomConnection {
  /** id determinista: `${from}->${exit}`. */
  id: string;
  from: RoomId;
  /** identidad estable de la salida en la room origen. */
  exit: ExitId;
  to: RoomId;
  kind: TransitionKind;
  cinematic?: string;
  /** referencia al predicado de la door fuente (si existe). */
  visible?: () => boolean;
  /** referencia al predicado de la door fuente (si existe). */
  locked?: () => RoomLockResult;
}

/** Origen de la entry resuelta, para trazabilidad. */
export type EntrySource = 'exit-entry' | 'scene-entries' | 'door-spawn' | 'default';

export interface ResolvedRoomConnection {
  connection: RoomConnection;
  /** rect local de la salida en la room origen
   *  (`scenes[from].doors[conn.exit]`); null si la room origen no tiene perfil. */
  exit: SceneRect | null;
  /** entry local de la room destino. */
  entry: { x: number; y: number };
  entrySource: EntrySource;
  /** dimensiones LOCALES de la room destino (derivadas). */
  targetSize: { width: number; height: number };
}

export interface RoomGraph {
  readonly source: RoomGraphSource;
  /** ids de todas las rooms del grafo (orden de la fuente). */
  readonly rooms: RoomId[];
  /** todas las conexiones derivadas (una por door de cada room). */
  connections(): RoomConnection[];
  /** conexión por identidad de salida: `connection(from, exit)`. */
  connection(from: RoomId, exit: ExitId): RoomConnection | undefined;
  /** resolución completa por salida: `resolve(from, exit)`. */
  resolve(from: RoomId, exit: ExitId): ResolvedRoomConnection | null;
  /** TODAS las conexiones `from → to` (puede haber varias salidas hacia el
   *  mismo destino; nunca asume unicidad). */
  connectionsBetween(from: RoomId, to: RoomId): RoomConnection[];
  /** conexiones que salen de una room. */
  outgoing(from: RoomId): RoomConnection[];
  /** conexiones que llegan a una room. */
  incoming(to: RoomId): RoomConnection[];
  /** disponibilidad según predicados (visible/locked). Sin predicados → true. */
  isAvailable(connection: RoomConnection): boolean;
  /** entry local resuelto de `from` por salida `exit` (null si no existe). */
  entryFor(from: RoomId, exit: ExitId): { x: number; y: number } | null;
  /** dimensiones locales de una room (derivadas, default 960×540). */
  targetSizeOf(roomId: RoomId): { width: number; height: number };
}

/** ---------------------- Construcción ---------------------- */

function edgeId(from: string, exit: string): string {
  return `${from}->${exit}`;
}

function metaFor(source: RoomGraphSource, from: string, exit: string): RoomGraphEdgeMeta | undefined {
  return source.edgeMeta?.find(
    (e) => (e.id ?? edgeId(e.from, e.exit ?? e.to ?? '')) === edgeId(from, exit),
  );
}

function kindFor(source: RoomGraphSource, from: string, exit: string): TransitionKind {
  return metaFor(source, from, exit)?.kind ?? DEFAULT_TRANSITION_KIND;
}

function cinematicFor(source: RoomGraphSource, from: string, exit: string): string | undefined {
  return metaFor(source, from, exit)?.cinematic;
}

export function buildRoomGraph(source: RoomGraphSource): RoomGraph {
  const rooms = Object.keys(source.rooms);
  const derived: RoomConnection[] = [];
  for (const [fromId, room] of Object.entries(source.rooms)) {
    for (const door of room.doors) {
      const exit = door.exit ?? door.to;
      derived.push({
        id: edgeId(fromId, exit),
        from: fromId,
        exit,
        to: door.to,
        kind: kindFor(source, fromId, exit),
        cinematic: cinematicFor(source, fromId, exit),
        visible: door.visible,
        locked: door.locked,
      });
    }
  }

  const byId = new Map<string, RoomConnection>();
  for (const conn of derived) {
    if (!byId.has(conn.id)) byId.set(conn.id, conn);
  }

  const sizeOf = (roomId: string): { width: number; height: number } => {
    const d = areaDimensions(roomId);
    return { width: d.width, height: d.height };
  };

  const doorOf = (from: string, exit: string): RoomDoorSource | undefined =>
    source.rooms[from]?.doors.find((d) => (d.exit ?? d.to) === exit);

  const resolveEntry = (conn: RoomConnection): { entry: { x: number; y: number }; source: EntrySource } => {
    const door = doorOf(conn.from, conn.exit);
    // 1) entry específico de la salida (futuro; no existe en la data actual).
    if (door?.entry) return { entry: door.entry, source: 'exit-entry' };
    // 2) entries keyed por ROOM origen (data actual). CURRENT DATA LIMITATION:
    //    no puede distinguir dos salidas de la misma origen al mismo destino.
    const target = source.scenes[conn.to];
    const fromSceneEntry = target?.entries?.[conn.from];
    if (fromSceneEntry) return { entry: fromSceneEntry, source: 'scene-entries' };
    // 3) spawn de la door.
    if (door?.spawn) return { entry: door.spawn, source: 'door-spawn' };
    // 4) fallback documentado.
    const size = sizeOf(conn.to);
    return { entry: defaultEntryFallback(size.width, size.height), source: 'default' };
  };

  return {
    source,
    rooms,
    connections: () => [...derived],
    connection: (from, exit) => byId.get(edgeId(from, exit)),
    resolve(from, exit) {
      const conn = byId.get(edgeId(from, exit));
      if (!conn) return null;
      const resolvedEntry = resolveEntry(conn);
      return {
        connection: conn,
        exit: source.scenes[from]?.doors?.[conn.exit] ?? null,
        entry: resolvedEntry.entry,
        entrySource: resolvedEntry.source,
        targetSize: sizeOf(conn.to),
      };
    },
    connectionsBetween: (from, to) => derived.filter((c) => c.from === from && c.to === to),
    outgoing: (from) => derived.filter((c) => c.from === from),
    incoming: (to) => derived.filter((c) => c.to === to),
    isAvailable: (conn) => {
      if (conn.visible && conn.visible() === false) return false;
      if (conn.locked) return !conn.locked();
      return true;
    },
    entryFor: (from, exit) => {
      const conn = byId.get(edgeId(from, exit));
      if (!conn) return null;
      return resolveEntry(conn).entry;
    },
    targetSizeOf: sizeOf,
  };
}

/** ---------------------- Adaptador desde datos reales ---------------------- */

/** Mapea `ROOMS` + `ROOM_SCENES` reales (o cualquier fuente con la misma
 *  forma) al `RoomGraphSource`. Preserva las referencias a los predicados
 *  `visible`/`locked` de cada door — no los copia. */
export function sourceFromRoomsAndScenes(
  rooms: Record<string, { doors: RoomDoorSource[] }>,
  scenes: Record<string, RoomSceneProfile>,
  edgeMeta?: RoomGraphEdgeMeta[],
): RoomGraphSource {
  const mapped: Record<string, RoomGraphRoomSource> = {};
  for (const [id, room] of Object.entries(rooms)) {
    mapped[id] = {
      id,
      doors: room.doors.map((d) => ({
        to: d.to,
        exit: d.exit,
        entry: d.entry,
        spawn: d.spawn,
        visible: d.visible,
        locked: d.locked,
      })),
    };
  }
  return { rooms: mapped, scenes, edgeMeta: edgeMeta ?? OHMDAL_EDGE_META };
}

/** ---------------------- Validación ---------------------- */

export type ValidationSeverity = 'error' | 'warning';

export interface GraphIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  connectionId?: string;
}

export interface ValidateOptions {
  /** Raíz de la que partir para la comprobación de alcanzabilidad. Default `'plaza'`. */
  reachabilityRoot?: string;
  /** Rooms que deben ser alcanzables desde la raíz (critical path Arc 1).
   *  Default: todas las rooms con perfil de escena (excluye EXTERNAL_ROOMS). */
  mustReach?: string[];
}

/** Radio del cuerpo del jugador para la comprobación de "entry legal". */
const PLAYER_INSET = 12;
/** Tolerancia de proximidad a un rect de walkable para no falsear entradas
 *  pegadas al borde de un vano. */
const WALKABLE_TOLERANCE = 24;

function rectContainsPoint(rect: SceneRect, x: number, y: number, inset: number): boolean {
  return (
    x - inset >= rect.x &&
    x + inset <= rect.x + rect.w &&
    y - inset >= rect.y &&
    y + inset <= rect.y + rect.h
  );
}

function rectOverlaps(rect: SceneRect, x: number, y: number, inset: number): boolean {
  return (
    x - inset < rect.x + rect.w &&
    x + inset > rect.x &&
    y - inset < rect.y + rect.h &&
    y + inset > rect.y
  );
}

/** Valida el grafo contra los invariantes de `SPATIAL_CONTRACT.md` §3.6.
 *  Devuelve la lista de issues (vacía si está todo correcto). */
export function validateRoomGraph(
  graph: RoomGraph,
  options: ValidateOptions = {},
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const { source } = graph;

  const connections = graph.connections();

  // 1. source room exists
  for (const conn of connections) {
    if (!source.rooms[conn.from]) {
      issues.push({
        severity: 'error',
        code: 'source-room-missing',
        connectionId: conn.id,
        message: `La room origen «${conn.from}» no existe en el grafo.`,
      });
    }
  }

  // 2. destination room exists
  for (const conn of connections) {
    if (!source.rooms[conn.to]) {
      issues.push({
        severity: 'error',
        code: 'destination-room-missing',
        connectionId: conn.id,
        message: `La room destino «${conn.to}» de «${conn.from}» (salida «${conn.exit}») no existe en el grafo.`,
      });
    }
  }

  // Rooms sin perfil de escena: malformadas si no son EXTERNAL_ROOMS.
  for (const roomId of graph.rooms) {
    if (EXTERNAL_ROOMS.has(roomId)) continue;
    if (!source.scenes[roomId]) {
      issues.push({
        severity: 'warning',
        code: 'room-sin-perfil-escena',
        message: `La room «${roomId}» no tiene perfil de escena. Si es un runtime externo intencional, añadirla a EXTERNAL_ROOMS; si no, es una room malformada.`,
      });
    }
  }

  // 7. duplicate conflicting edge identifiers (por `from -> exit`)
  const seen = new Map<string, number>();
  for (const conn of connections) {
    seen.set(conn.id, (seen.get(conn.id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) {
      issues.push({
        severity: 'error',
        code: 'duplicate-connection',
        connectionId: id,
        message: `La conexión «${id}» aparece ${count} veces (dos doors con la misma salida en la misma room).`,
      });
    }
  }

  // 8. transition kind valid
  for (const conn of connections) {
    if (!TRANSITION_KINDS.includes(conn.kind)) {
      issues.push({
        severity: 'error',
        code: 'invalid-transition-kind',
        connectionId: conn.id,
        message: `«${conn.id}» tiene kind «${conn.kind}» (válidos: ${TRANSITION_KINDS.join(', ')}).`,
      });
    }
  }

  // 3/4/5/6 — exit, entry, bounds, legalidad
  for (const conn of connections) {
    const resolved = graph.resolve(conn.from, conn.exit);
    if (!resolved) continue;

    // 3. exit anchor exists (sólo cuando la room origen tiene perfil de escena)
    const fromScene = source.scenes[conn.from];
    if (fromScene && !fromScene.doors?.[conn.exit]) {
      issues.push({
        severity: 'warning',
        code: 'exit-missing',
        connectionId: conn.id,
        message: `«${conn.from}» tiene perfil de escena pero no declara el rect de la salida «${conn.exit}».`,
      });
    }

    // 4. entry resolves (el fallback 'default' queda señalado)
    if (resolved.entrySource === 'default') {
      issues.push({
        severity: 'warning',
        code: 'entry-uses-default-fallback',
        connectionId: conn.id,
        message: `«${conn.id}» no resuelve entry por perfil de escena ni por spawn; usa el fallback documentado.`,
      });
    }

    // 5. resolved entry inside destination LOCAL bounds
    const { width, height } = resolved.targetSize;
    const e = resolved.entry;
    if (e.x < 0 || e.x >= width || e.y < 0 || e.y >= height) {
      issues.push({
        severity: 'error',
        code: 'entry-outside-bounds',
        connectionId: conn.id,
        message: `Entry (${e.x},${e.y}) de «${conn.id}» fuera de los límites locales de «${conn.to}» (${width}×${height}).`,
      });
      continue;
    }

    // 6. entry legal según la geometría local del destino (cuando es
    //    determinísticamente testeable)
    const targetScene = source.scenes[conn.to];
    if (targetScene?.walkable?.length) {
      const onWalkable = targetScene.walkable.some(
        (r) => rectContainsPoint(r, e.x, e.y, PLAYER_INSET),
      );
      const nearWalkable = !onWalkable &&
        targetScene.walkable.some(
          (r) =>
            r.x - WALKABLE_TOLERANCE <= e.x &&
            e.x <= r.x + r.w + WALKABLE_TOLERANCE &&
            r.y - WALKABLE_TOLERANCE <= e.y &&
            e.y <= r.y + r.h + WALKABLE_TOLERANCE,
        );
      if (!onWalkable && !nearWalkable) {
        issues.push({
          severity: 'warning',
          code: 'entry-not-in-walkable',
          connectionId: conn.id,
          message: `Entry (${e.x},${e.y}) de «${conn.id}» no cae en ningún walkable de «${conn.to}» (ni a ${WALKABLE_TOLERANCE}px de uno).`,
        });
      }
      if (onWalkable) {
        const inCollision = (targetScene.collision ?? []).some((r) =>
          rectOverlaps(r, e.x, e.y, PLAYER_INSET),
        );
        if (inCollision) {
          issues.push({
            severity: 'warning',
            code: 'entry-overlaps-collision',
            connectionId: conn.id,
            message: `Entry (${e.x},${e.y}) de «${conn.id}» se solapa con una colisión de «${conn.to}».`,
          });
        }
      }
    }
  }

  // Orphans: toda room (salvo la raíz de inicio del Prólogo) tiene entrada
  const orphanRoots = new Set<string>([options.reachabilityRoot ?? 'plaza']);
  for (const roomId of graph.rooms) {
    if (orphanRoots.has(roomId)) continue;
    const hasIncoming = connections.some((c) => c.to === roomId);
    if (!hasIncoming) {
      issues.push({
        severity: 'warning',
        code: 'orphan-room',
        message: `La room «${roomId}» no tiene ninguna conexión de entrada.`,
      });
    }
  }

  // 9. critical Arc 1 topology reachable ignoring locks
  const root = options.reachabilityRoot ?? 'plaza';
  const mustReach = options.mustReach ?? Object.keys(source.scenes);
  const reachable = new Set<string>();
  const queue = [root];
  reachable.add(root);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const conn of connections) {
      if (conn.from === current && !reachable.has(conn.to)) {
        reachable.add(conn.to);
        queue.push(conn.to);
      }
    }
  }
  for (const target of mustReach) {
    if (source.rooms[target] && !reachable.has(target)) {
      issues.push({
        severity: 'error',
        code: 'unreachable-room',
        message: `La room «${target}» no es alcanzable desde «${root}» ignorando locks.`,
      });
    }
  }

  return issues;
}
