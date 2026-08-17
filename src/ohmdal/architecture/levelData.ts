/**
 * Blockout autoral de H2. Todas las medidas estan expresadas en metros.
 * El plano jugable es Y=0 y cada modulo arquitectonico conserva su pivote en el suelo.
 */

export const LEVEL_ID = 'ohmdal-hd2d-preprod-v1' as const;
export const LEVEL_SEED = 'ohmdal-hd2d-preprod-v1' as const;
export const GAMEPLAY_PLANE_Y = 0;
export const METRIC_GRID = 0.5;
export const MANNEQUIN_HEIGHT_METERS = 1.72;

export interface MetricPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface MetricBounds2 {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export type ZoneId =
  | 'portal_plaza'
  | 'taller'
  | 'puerta_manantial'
  | 'castle'
  | 'forge'
  | 'terraces'
  | 'lighthouse';

export interface LevelZone {
  readonly id: ZoneId;
  readonly purpose:
    | 'arrival-orientation'
    | 'diagnosis-workspace'
    | 'objective-consequence'
    | 'exploration-circuit'
    | 'craft-workspace'
    | 'ascent-observation'
    | 'summit-culmination';
  readonly bounds: MetricBounds2;
  readonly landmarkId: string;
}

export type RouteAnchorId =
  // Plaza (hub central)
  | 'R0_PORTAL_SPAWN'
  | 'R1_PLAZA_ENTRY'
  | 'R2_PLAZA_DIAGONAL'
  // Salidas del hub: este (taller+puerta+manantial), norte (castillo), sur (terrazas)
  | 'R3_TALLER_THRESHOLD'
  | 'R4_LUMEN_STOP'
  | 'R5_DOOR_APPROACH'
  | 'R6_DOOR_MEASURE'
  | 'R6_5_PILARES_S'
  | 'R7_SPRING_EDGE'
  | 'R7_5_BASIN_NORTH'
  | 'R7_6_PLAZA_BRIDGE_E'
  | 'R7_55_BASIN_S'
  | 'R8_CASTLE_APPROACH'
  // Castillo (U2)
  | 'R10_CASTLE_GATE'
  | 'R11_CASTLE_GALLERY'
  | 'R12_CASTLE_BRANCHES'
  | 'R13_CASTLE_HEART'
  // Forja (U3) — se entra desde el oeste de la Plaza
  | 'R13_5_PLAZA_BRIDGE_W'
  | 'R14_FORGE_APPROACH'
  | 'R15_FORGE_YARD'
  | 'R16_FORGE_INFIRMARY'
  | 'R17_FORGE_LONGCHANNEL'
  | 'R18_FORGE_HALL'
  // Terrazas (U4) — se entra desde el sur de la Plaza
  | 'R18_5_PLAZA_BRIDGE_S'
  | 'R19_TERRACES_APPROACH'
  | 'R20_TERRACES_LOW'
  | 'R21_TERRACES_MID'
  | 'R22_TERRACES_MURAL'
  | 'R23_TERRACES_TOP'
  // Faro (U5) — se entra desde el sureste
  | 'R23_5_PLAZA_BRIDGE_SE'
  | 'R24_FARO_APPROACH'
  | 'R25_FARO_HALL'
  | 'R26_FARO_BENCH'
  | 'R27_CLOCK_TOWER'
  | 'R28_FARO_LANTERN';

export interface RouteAnchor {
  readonly id: RouteAnchorId;
  readonly position: MetricPoint;
  readonly purpose: string;
}

export interface ArchitectureSocket {
  readonly id: string;
  readonly from: ZoneId;
  readonly to: ZoneId;
  readonly position: MetricPoint;
  readonly width: number;
}

export interface BoxModuleDefinition {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly family: 'stone' | 'copper' | 'wood' | 'water' | 'glass';
  readonly centerX: number;
  readonly centerZ: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  readonly baseY?: number;
  readonly rotationX?: number;
  readonly rotationY?: number;
  readonly rotationZ?: number;
  readonly pivotY: typeof GAMEPLAY_PLANE_Y;
  readonly tags: readonly ('floor' | 'structure' | 'landmark' | 'cameraOccluder' | 'cameraRoof' | 'emitter')[];
}

export interface ColliderDefinition {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly bounds: MetricBounds2;
  readonly height: number;
  readonly planeY: typeof GAMEPLAY_PLANE_Y;
}

// **Layout HD-2D (red con hub central).** La Plaza es el centro (origen, 18×14m) y las
// otras seis zonas se distribuyen a su alrededor en distintas direcciones y orientaciones,
// no en una línea E-O continua como en la grilla legacy de chunks 960×540 pensada para
// el topdown Phaser. Las cuatro unidades de U1 (Plaza, Taller, Puerta+Manantial) están
// cerca y conectadas por arcos de socket; las cuatro zonas de U2–U5 (Castillo, Forja,
// Terrazas, Faro) son dioramas más grandes que crecen hacia afuera del hub.
//
// Cada zona tiene su landmark dominante. **Las zonas se solapan 1.5 m en cada socket**
// (extremo este de una zona cubre el socket, extremo oeste de la siguiente también) para
// que la navegación plana sea continua: ningún segmento entre ancla y ancla queda fuera
// de toda región.
export const LEVEL_ZONES: readonly LevelZone[] = [
  {
    id: 'portal_plaza',
    purpose: 'arrival-orientation',
    // La Plaza cubre x ∈ [-9, 10.5] (se extiende 1.5 m al este del socket) y
    // z ∈ [-8.5, 8.5] (1.5 m al norte y sur) para que los cuatro sockets de la Plaza
    // queden dentro de su región.
    bounds: { minX: -9, maxX: 10.5, minZ: -8.5, maxZ: 8.5 },
    landmarkId: 'PLAZA_PORTAL_GATE',
  },
  // Taller al este de la Plaza (la dirección natural desde donde el protagonista viene
  // por la Calzada). Mismo Y, huella más angosta (13×10m) porque es una nave.
  // Se solapa 1.5 m con la Plaza (x ∈ [9, 11]) y 1.5 m con la Puerta (x ∈ [21, 24]).
  {
    id: 'taller',
    purpose: 'diagnosis-workspace',
    bounds: { minX: 9, maxX: 24, minZ: -5, maxZ: 5 },
    landmarkId: 'TALLER_KIT',
  },
  // Puerta+Manantial siguen al Taller, en la misma línea. Se solapa 1.5 m con el Taller
  // (x ∈ [22.5, 24]) y se extiende hasta x = 40 (un poco más allá de los anchors).
  {
    id: 'puerta_manantial',
    purpose: 'objective-consequence',
    bounds: { minX: 22.5, maxX: 40, minZ: -5, maxZ: 5 },
    landmarkId: 'PUERTA_KIT',
  },
  // Castillo al NORTE de la Plaza. Se solapa 1.5 m con la Plaza (z ∈ [-8.5, -7]) y se
  // extiende hasta z = -40. La huella cubre 30 m en X y 32 m en Z.
  {
    id: 'castle',
    purpose: 'exploration-circuit',
    bounds: { minX: -10, maxX: 20, minZ: -40, maxZ: -7 },
    landmarkId: 'CASTLE_KIT',
  },
  // Forja al OESTE de la Plaza. Se solapa 1.5 m con la Plaza (x ∈ [-10.5, -9]) y se
  // extiende hasta x = -45.
  {
    id: 'forge',
    purpose: 'craft-workspace',
    bounds: { minX: -45, maxX: -7.5, minZ: -5, maxZ: 5 },
    landmarkId: 'FORGE_KIT',
  },
  // Terrazas al SUR de la Plaza. Se solapa 1.5 m con la Plaza (z ∈ [7, 8.5]) y con el
  // Faro (x ∈ [21, 24]). La huella cubre 32 m en X y 30 m en Z.
  {
    id: 'terraces',
    purpose: 'ascent-observation',
    bounds: { minX: -11, maxX: 21, minZ: 7, maxZ: 37 },
    landmarkId: 'TERRACES_KIT',
  },
  // Faro al SURESTE. Se solapa 1.5 m con las Terrazas (x ∈ [21, 24] y z ∈ [14, 22]).
  {
    id: 'lighthouse',
    purpose: 'summit-culmination',
    bounds: { minX: 21, maxX: 56, minZ: 14, maxZ: 22 },
    landmarkId: 'LIGHTHOUSE_KIT',
  },
] as const;

// **Recorrido coherente con la red con hub central.** Cada zona tiene su entrada desde la
// Plaza: el segmento entre el último anchor de una zona y el primero de la siguiente
// pasa por un anchor de la Plaza (un "puente") para evitar cruzar colliders de
// pasillo. Si la validación falla, casi siempre es porque alguien metió un anchor
// nuevo sin respetar el flujo del hub.
export const ROUTE_ANCHORS: readonly RouteAnchor[] = [
  // — Plaza (hub central) ————————————————————————————————————————————————————
  { id: 'R0_PORTAL_SPAWN', position: { x: -8, y: 0, z: 0 }, purpose: 'spawn at Portal (west of Plaza)' },
  { id: 'R1_PLAZA_ENTRY', position: { x: -3, y: 0, z: -3.2 }, purpose: 'enter Plaza from north' },
  { id: 'R2_PLAZA_DIAGONAL', position: { x: -3, y: 0, z: 6.2 }, purpose: 'read Plaza diagonal (pedestal + campana), south of the bell; the R2→R3 line stays below the Terrazas north wall buffer (z<6.3) and above the bell pier south buffer (z>2.68 at x=3.95)' },
  // — Salidas del hub: este (taller) ————————————————————————————————————————————
  { id: 'R3_TALLER_THRESHOLD', position: { x: 9.25, y: 0, z: 0 }, purpose: 'cross Plaza→Taller socket' },
  { id: 'R4_LUMEN_STOP', position: { x: 14, y: 0, z: 0 }, purpose: 'stop before Lumen workbench' },
  // — Taller → Puerta+Manantial —————————————————————————————————————————————————
  { id: 'R5_DOOR_APPROACH', position: { x: 22.5, y: 0, z: 0 }, purpose: 'cross Taller→Puerta socket' },
  { id: 'R6_DOOR_MEASURE', position: { x: 25, y: 0, z: 0 }, purpose: 'Door measurement (jambs in front of player)' },
  { id: 'R6_5_PILARES_S', position: { x: 30, y: 0, z: -3 }, purpose: 'go around the door jambs on the south' },
  { id: 'R7_SPRING_EDGE', position: { x: 38, y: 0, z: -3 }, purpose: 'observe Manantial edge (east, south of basin)' },
  { id: 'R7_5_BASIN_NORTH', position: { x: 35, y: 0, z: 4.0 }, purpose: 'go around the basin on the north (above basin buffer, below south wall buffer, inside the puerta_manantial region)' },
  { id: 'R7_6_PLAZA_BRIDGE_E', position: { x: 20, y: 0, z: -1.2 }, purpose: 'bridge inside the Taller; the R7_5→R7_6 line passes below the Taller east wall south buffer (z<1.3) and above the basin buffer (z>2.4 at x=30.6)' },
  { id: 'R7_55_BASIN_S', position: { x: -2, y: 0, z: -0.6 }, purpose: 'bridge in the Plaza, west of the pedestal; the R7_6→R7_55 line passes above the Taller west wall buffer (z>-1.3) and above the bell pier north buffer (z>-0.83); the R7_55→R8 line passes west of the pedestal and through the Castillo south wall gap' },
  { id: 'R8_CASTLE_APPROACH', position: { x: 0, y: 0, z: -7.5 }, purpose: 'cross Plaza→Castillo socket (north)' },
  // — Castillo (U2) ——————————————————————————————————————————————————————————
  { id: 'R10_CASTLE_GATE', position: { x: -5, y: 0, z: -27 }, purpose: 'enter Castillo (south gate)' },
  { id: 'R11_CASTLE_GALLERY', position: { x: 0, y: 0, z: -31 }, purpose: 'cross Castillo gallery' },
  { id: 'R12_CASTLE_BRANCHES', position: { x: 10, y: 0, z: -34 }, purpose: 'observe Castillo branches' },
  { id: 'R13_CASTLE_HEART', position: { x: 17, y: 0, z: -36 }, purpose: 'stand before throne' },
  // — Plaza-bridge de regreso a la Forja ——————————————————————————————————————————
  { id: 'R13_5_PLAZA_BRIDGE_W', position: { x: -3, y: 0, z: -3 }, purpose: 'bridge: return from Castillo through Plaza, west of the bell and north of pedestal; the R13→R13_5 line passes through the Castillo south gap and the Plaza north gap' },
  { id: 'R14_FORGE_APPROACH', position: { x: -8, y: 0, z: 0 }, purpose: 'cross Plaza→Forja socket (west), east of Forja gate' },
  { id: 'R15_FORGE_YARD', position: { x: -20, y: 0, z: -2 }, purpose: 'enter Forja yard' },
  { id: 'R16_FORGE_INFIRMARY', position: { x: -27, y: 0, z: 2 }, purpose: 'pass infirmary' },
  { id: 'R17_FORGE_LONGCHANNEL', position: { x: -35, y: 0, z: -2 }, purpose: 'walk the long channel' },
  { id: 'R18_FORGE_HALL', position: { x: -42, y: 0, z: 0 }, purpose: 'stand in the Forja hall' },
  // — Plaza-bridge de regreso a las Terrazas ——————————————————————————————————————
  { id: 'R18_5_PLAZA_BRIDGE_S', position: { x: -5, y: 0, z: 0 }, purpose: 'bridge: return from Forja through Plaza, west of the pedestal; the R18→R18_5 line is horizontal at z=0 and passes through the Plaza west wall gap; the R18_5→R19 line goes north-east to the Terrazas socket without crossing the bell or pedestal' },
  { id: 'R19_TERRACES_APPROACH', position: { x: 0, y: 0, z: 7.5 }, purpose: 'cross Plaza→Terrazas socket (south)' },
  { id: 'R20_TERRACES_LOW', position: { x: 0, y: 0, z: 25 }, purpose: 'ascend from Plaza' },
  { id: 'R21_TERRACES_MID', position: { x: 5, y: 0, z: 29 }, purpose: 'reach the middle terrace' },
  { id: 'R22_TERRACES_MURAL', position: { x: 0, y: 0, z: 33 }, purpose: 'observe the mural' },
  { id: 'R23_TERRACES_TOP', position: { x: -5, y: 0, z: 35 }, purpose: 'reach the top terrace' },
  // — Faro (U5) —————————————————————————————————————————————————————————————
  { id: 'R23_5_PLAZA_BRIDGE_SE', position: { x: 5, y: 0, z: 18 }, purpose: 'bridge: return from Terrazas through Plaza, ready to head SE' },
  { id: 'R24_FARO_APPROACH', position: { x: 21.5, y: 0, z: 18 }, purpose: 'cross Terrazas→Faro socket (SE)' },
  { id: 'R25_FARO_HALL', position: { x: 28, y: 0, z: 18 }, purpose: 'enter Faro hall' },
  { id: 'R26_FARO_BENCH', position: { x: 35, y: 0, z: 18 }, purpose: 'pass the bench' },
  { id: 'R27_CLOCK_TOWER', position: { x: 42, y: 0, z: 18 }, purpose: 'stand at clock tower' },
  { id: 'R28_FARO_LANTERN', position: { x: 52, y: 0, z: 18 }, purpose: 'reach the lantern: end of arc' },
] as const;

// **Sockets del hub.** La Plaza es el centro, no un eslabón de la cadena. Cuatro
// conexiones directas (N al Castillo, S a las Terrazas, E al Taller, O a la Forja) más
// la cadena Taller→Puerta y el puente Terrazas→Faro. Ancho 3 m para que la cámara
// no cierre el paso con el encuadre.
export const ARCHITECTURE_SOCKETS: readonly ArchitectureSocket[] = [
  // Portal dentro de la propia Plaza (no es transición entre zonas, es el spawn).
  {
    id: 'S_PORTAL_TO_PLAZA',
    from: 'portal_plaza',
    to: 'portal_plaza',
    position: { x: -8, y: 0, z: 0 },
    width: 3,
  },
  // Hub: Plaza → Taller (este, en el borde x=9 de la Plaza)
  {
    id: 'S_PLAZA_TO_TALLER',
    from: 'portal_plaza',
    to: 'taller',
    position: { x: 9, y: 0, z: 0 },
    width: 3,
  },
  // Cadena: Taller → Puerta/Manantial (en el borde x=22.5 del Taller)
  {
    id: 'S_TALLER_TO_DOOR',
    from: 'taller',
    to: 'puerta_manantial',
    position: { x: 22.5, y: 0, z: 0 },
    width: 3,
  },
  // Hub: Plaza → Castillo (norte, en el borde z=-7 de la Plaza)
  {
    id: 'S_PLAZA_TO_CASTLE',
    from: 'portal_plaza',
    to: 'castle',
    position: { x: 0, y: 0, z: -7 },
    width: 3,
  },
  // Hub: Plaza → Forja (oeste, en el borde x=-9 de la Plaza)
  {
    id: 'S_PLAZA_TO_FORGE',
    from: 'portal_plaza',
    to: 'forge',
    position: { x: -9, y: 0, z: 0 },
    width: 3,
  },
  // Hub: Plaza → Terrazas (sur, en el borde z=7 de la Plaza)
  {
    id: 'S_PLAZA_TO_TERRACES',
    from: 'portal_plaza',
    to: 'terraces',
    position: { x: 0, y: 0, z: 7 },
    width: 3,
  },
  // Puente: Terrazas → Faro (SE, sobre la costa del lago)
  {
    id: 'S_TERRACES_TO_LIGHTHOUSE',
    from: 'terraces',
    to: 'lighthouse',
    position: { x: 22, y: 0, z: 18 },
    width: 3,
  },
] as const;

export const BOX_MODULES: readonly BoxModuleDefinition[] = [
  // Ninguna de las tres zonas declara modulos: las construyen `plazaKit`, `tallerKit` y
  // `puertaKit` con geometria fusionada, pintada y texturada. Dejar aca las cajas de prueba
  // seria dato muerto, y los tests las leerian como si dibujaran algo. Lo unico que sobrevive
  // son los dos emisores, que es lo que el rig de luz busca por nombre para colgarles su luz.


  { id: 'workshop-lantern-emitter', zoneId: 'taller', family: 'glass', centerX: 3.2, centerZ: -3.9, width: 0.3, height: 0.35, depth: 0.3, baseY: 2.55, pivotY: 0, tags: ['emitter'] },

  { id: 'door-conduit-emitter', zoneId: 'puerta_manantial', family: 'glass', centerX: 16.7, centerZ: -3, width: 0.25, height: 0.4, depth: 0.25, baseY: 4.3, pivotY: 0, tags: ['emitter'] },
] as const;

// **Colliders de la red con hub central.** Cada zona tiene 4 paredes perimetrales, y
// las paredes en el lado del socket tienen un hueco central de 3.4 m (socket width
// 3 m + 0.2 m de buffer a cada lado). Las paredes son bajas (0.4 m en greybox) para
// no tapar la lectura del mundo de al lado — el jugador puede ver el siguiente diorama
// desde el actual.
//
// El patrón es siempre el mismo: muro de 0.6 m de espesor centrado en el borde de la
// zona, con dos machones a los lados del socket. El jugador atraviesa la zona caminando
// por el hueco (que es parte de la región de navegación de las dos zonas adyacentes).
//
// Además de los muros perimetrales, hay colliders interiores para los landmarks del
// Plaza (pedestal de Ohm, machones de la campana y del Portal) y para los obstáculos
// del Taller (banco de Lumen) y de la Puerta+Manantial (jambas y pileta).
const PLAZA_WALL_HEIGHT = 0.4;
const TALLER_WALL_HEIGHT = 0.4;
const PUERTA_WALL_HEIGHT = 0.4;
const CASTLE_WALL_HEIGHT = 0.4;
const FORGE_WALL_HEIGHT = 0.4;
const TERRACES_WALL_HEIGHT = 0.4;
const LIGHTHOUSE_WALL_HEIGHT = 0.4;

export const COLLIDERS: readonly ColliderDefinition[] = [
  // — Interiores del Plaza (landmarks) ——————————————————————————————————————————
  // El pedestal de Ohm está en el centro del Plaza. Frena de la segunda grada para arriba
  // (1.06 m), no de la base — los dos escalones de 22 cm se pisan.
  { id: 'C_OHM_PEDESTAL', zoneId: 'portal_plaza', bounds: { minX: -1.28, maxX: 1.28, minZ: -1.28, maxZ: 1.28 }, height: 1.06, planeY: 0 },
  // El Portal queda al oeste, donde estaba el spawn original. Los machones delimitan el
  // arco.
  { id: 'C_PORTAL_PIER_NORTH', zoneId: 'portal_plaza', bounds: { minX: -8.6, maxX: -7.4, minZ: -3.15, maxZ: -1.65 }, height: 5.2, planeY: 0 },
  { id: 'C_PORTAL_PIER_SOUTH', zoneId: 'portal_plaza', bounds: { minX: -8.6, maxX: -7.4, minZ: 1.65, maxZ: 3.15 }, height: 5.2, planeY: 0 },
  // La campana al este del pedestal. Los machones delimitan el monumento.
  { id: 'C_BELL_PIER_NORTH', zoneId: 'portal_plaza', bounds: { minX: 2.45, maxX: 3.55, minZ: -2.28, maxZ: -1.23 }, height: 5.1, planeY: 0 },
  { id: 'C_BELL_PIER_SOUTH', zoneId: 'portal_plaza', bounds: { minX: 2.45, maxX: 3.55, minZ: 1.23, maxZ: 2.28 }, height: 5.1, planeY: 0 },
  // — Perimetrales del Plaza (x=-9..10.5, z=-8.5..8.5) ——————————————————————————
  // Oeste: gap en z=-1.7..1.7 para S_PLAZA_TO_FORGE. El Portal (R0_PORTAL_SPAWN) está
  // a 1 m al este del muro, en x=-8, no bloquea el socket.
  { id: 'C_PLAZA_WEST_N', zoneId: 'portal_plaza', bounds: { minX: -9.3, maxX: -8.7, minZ: -8.8, maxZ: -1.7 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  { id: 'C_PLAZA_WEST_S', zoneId: 'portal_plaza', bounds: { minX: -9.3, maxX: -8.7, minZ: 1.7, maxZ: 8.8 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  // Norte: gap en x=-1.7..1.7 para S_PLAZA_TO_CASTLE
  { id: 'C_PLAZA_NORTH_W', zoneId: 'portal_plaza', bounds: { minX: -9.3, maxX: -1.7, minZ: -8.8, maxZ: -8.2 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  { id: 'C_PLAZA_NORTH_E', zoneId: 'portal_plaza', bounds: { minX: 1.7, maxX: 10.8, minZ: -8.8, maxZ: -8.2 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  // Sur: gap en x=-1.7..1.7 para S_PLAZA_TO_TERRACES
  { id: 'C_PLAZA_SOUTH_W', zoneId: 'portal_plaza', bounds: { minX: -9.3, maxX: -1.7, minZ: 8.2, maxZ: 8.8 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  { id: 'C_PLAZA_SOUTH_E', zoneId: 'portal_plaza', bounds: { minX: 1.7, maxX: 10.8, minZ: 8.2, maxZ: 8.8 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  // Este: gap en z=-1.7..1.7 para S_PLAZA_TO_TALLER
  { id: 'C_PLAZA_EAST_N', zoneId: 'portal_plaza', bounds: { minX: 10.2, maxX: 10.8, minZ: -8.8, maxZ: -1.7 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  { id: 'C_PLAZA_EAST_S', zoneId: 'portal_plaza', bounds: { minX: 10.2, maxX: 10.8, minZ: 1.7, maxZ: 8.8 }, height: PLAZA_WALL_HEIGHT, planeY: 0 },
  // — Interiores del Taller (Lumen) —————————————————————————————————————————————
  // El banco de Lumen, al sur del Taller.
  { id: 'C_WORKBENCH', zoneId: 'taller', bounds: { minX: 15, maxX: 17, minZ: -2.3, maxZ: -1.7 }, height: 1, planeY: 0 },
  // — Perimetrales del Taller (x=9..24, z=-5..5) ——————————————————————————————
  // Norte y sur: cerrados (no hay socket en el norte ni sur del Taller)
  { id: 'C_TALLER_NORTH', zoneId: 'taller', bounds: { minX: 9, maxX: 24, minZ: -5.3, maxZ: -4.7 }, height: TALLER_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TALLER_SOUTH', zoneId: 'taller', bounds: { minX: 9, maxX: 24, minZ: 4.7, maxZ: 5.3 }, height: TALLER_WALL_HEIGHT, planeY: 0 },
  // Oeste y este: cerrados a los lados; el gap está en z=-1.7..1.7 (Plaza-Taller y
  // Taller-Puerta). El muro occidental se comparte con el gap de la Plaza este.
  { id: 'C_TALLER_WEST_N', zoneId: 'taller', bounds: { minX: 8.7, maxX: 9.3, minZ: -5.3, maxZ: -1.7 }, height: TALLER_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TALLER_WEST_S', zoneId: 'taller', bounds: { minX: 8.7, maxX: 9.3, minZ: 1.7, maxZ: 5.3 }, height: TALLER_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TALLER_EAST_N', zoneId: 'taller', bounds: { minX: 23.7, maxX: 24.3, minZ: -5.3, maxZ: -1.7 }, height: TALLER_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TALLER_EAST_S', zoneId: 'taller', bounds: { minX: 23.7, maxX: 24.3, minZ: 1.7, maxZ: 5.3 }, height: TALLER_WALL_HEIGHT, planeY: 0 },
  // — Interiores de la Puerta+Manantial ————————————————————————————————————————————
  // Las jambas de la Puerta monumental, al oeste de la zona.
  { id: 'C_DOOR_JAMB_NORTH', zoneId: 'puerta_manantial', bounds: { minX: 24, maxX: 26, minZ: -3.5, maxZ: -1.5 }, height: 5.4, planeY: 0 },
  { id: 'C_DOOR_JAMB_SOUTH', zoneId: 'puerta_manantial', bounds: { minX: 24, maxX: 26, minZ: 1.5, maxZ: 3.5 }, height: 5.4, planeY: 0 },
  // La pileta del Manantial, al este.
  { id: 'C_SPRING_BASIN', zoneId: 'puerta_manantial', bounds: { minX: 31, maxX: 35, minZ: -1.5, maxZ: 2 }, height: 0.9, planeY: 0 },
  // — Perimetrales de la Puerta+Manantial (x=22.5..40, z=-5..5) ————————————————
  // Norte y sur: cerrados
  { id: 'C_PUERTA_NORTH', zoneId: 'puerta_manantial', bounds: { minX: 22.5, maxX: 40, minZ: -5.3, maxZ: -4.7 }, height: PUERTA_WALL_HEIGHT, planeY: 0 },
  { id: 'C_PUERTA_SOUTH', zoneId: 'puerta_manantial', bounds: { minX: 22.5, maxX: 40, minZ: 4.7, maxZ: 5.3 }, height: PUERTA_WALL_HEIGHT, planeY: 0 },
  // Oeste: gap en z=-1.7..1.7 para S_TALLER_TO_DOOR
  { id: 'C_PUERTA_WEST_N', zoneId: 'puerta_manantial', bounds: { minX: 22.2, maxX: 22.8, minZ: -5.3, maxZ: -1.7 }, height: PUERTA_WALL_HEIGHT, planeY: 0 },
  { id: 'C_PUERTA_WEST_S', zoneId: 'puerta_manantial', bounds: { minX: 22.2, maxX: 22.8, minZ: 1.7, maxZ: 5.3 }, height: PUERTA_WALL_HEIGHT, planeY: 0 },
  // Este: cerrado (la zona termina acá — no hay transición al este)
  { id: 'C_PUERTA_EAST', zoneId: 'puerta_manantial', bounds: { minX: 39.7, maxX: 40.3, minZ: -5.3, maxZ: 5.3 }, height: PUERTA_WALL_HEIGHT, planeY: 0 },
  // — Perimetrales del Castillo (x=-10..20, z=-40..-7) ————————————————————————————
  // Norte, este y oeste: cerrados
  { id: 'C_CASTLE_NORTH', zoneId: 'castle', bounds: { minX: -10, maxX: 20, minZ: -40.3, maxZ: -39.7 }, height: CASTLE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_CASTLE_EAST', zoneId: 'castle', bounds: { minX: 19.7, maxX: 20.3, minZ: -40, maxZ: -7 }, height: CASTLE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_CASTLE_WEST', zoneId: 'castle', bounds: { minX: -10.3, maxX: -9.7, minZ: -40, maxZ: -7 }, height: CASTLE_WALL_HEIGHT, planeY: 0 },
  // Sur: gap en x=-1.7..1.7 para S_PLAZA_TO_CASTLE
  { id: 'C_CASTLE_SOUTH_W', zoneId: 'castle', bounds: { minX: -10.3, maxX: -1.7, minZ: -7.3, maxZ: -6.7 }, height: CASTLE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_CASTLE_SOUTH_E', zoneId: 'castle', bounds: { minX: 1.7, maxX: 20.3, minZ: -7.3, maxZ: -6.7 }, height: CASTLE_WALL_HEIGHT, planeY: 0 },
  // — Perimetrales de la Forja (x=-45..-7.5, z=-5..5) ——————————————————————————————
  // Norte, sur y oeste: cerrados
  { id: 'C_FORGE_NORTH', zoneId: 'forge', bounds: { minX: -45, maxX: -7.5, minZ: -5.3, maxZ: -4.7 }, height: FORGE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_FORGE_SOUTH', zoneId: 'forge', bounds: { minX: -45, maxX: -7.5, minZ: 4.7, maxZ: 5.3 }, height: FORGE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_FORGE_WEST', zoneId: 'forge', bounds: { minX: -45.3, maxX: -44.7, minZ: -5.3, maxZ: 5.3 }, height: FORGE_WALL_HEIGHT, planeY: 0 },
  // Este: gap en z=-1.7..1.7 para S_PLAZA_TO_FORGE
  { id: 'C_FORGE_EAST_N', zoneId: 'forge', bounds: { minX: -7.8, maxX: -7.2, minZ: -5.3, maxZ: -1.7 }, height: FORGE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_FORGE_EAST_S', zoneId: 'forge', bounds: { minX: -7.8, maxX: -7.2, minZ: 1.7, maxZ: 5.3 }, height: FORGE_WALL_HEIGHT, planeY: 0 },
  // — Perimetrales de las Terrazas (x=-11..21, z=7..37) ——————————————————————————
  // Sur y oeste: cerrados
  { id: 'C_TERRACES_SOUTH', zoneId: 'terraces', bounds: { minX: -11, maxX: 21, minZ: 36.7, maxZ: 37.3 }, height: TERRACES_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TERRACES_WEST', zoneId: 'terraces', bounds: { minX: -11.3, maxX: -10.7, minZ: 7, maxZ: 37 }, height: TERRACES_WALL_HEIGHT, planeY: 0 },
  // Norte: gap en x=-1.7..1.7 para S_PLAZA_TO_TERRACES
  { id: 'C_TERRACES_NORTH_W', zoneId: 'terraces', bounds: { minX: -11.3, maxX: -1.7, minZ: 6.7, maxZ: 7.3 }, height: TERRACES_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TERRACES_NORTH_E', zoneId: 'terraces', bounds: { minX: 1.7, maxX: 21.3, minZ: 6.7, maxZ: 7.3 }, height: TERRACES_WALL_HEIGHT, planeY: 0 },
  // Este: gap en z=16.3..19.7 para S_TERRACES_TO_LIGHTHOUSE
  { id: 'C_TERRACES_EAST_N', zoneId: 'terraces', bounds: { minX: 20.7, maxX: 21.3, minZ: 7, maxZ: 16.3 }, height: TERRACES_WALL_HEIGHT, planeY: 0 },
  { id: 'C_TERRACES_EAST_S', zoneId: 'terraces', bounds: { minX: 20.7, maxX: 21.3, minZ: 19.7, maxZ: 37 }, height: TERRACES_WALL_HEIGHT, planeY: 0 },
  // — Perimetrales del Faro (x=21..56, z=14..22) ————————————————————————————————————
  // Norte, sur y este: cerrados
  { id: 'C_FARO_NORTH', zoneId: 'lighthouse', bounds: { minX: 21, maxX: 56, minZ: 13.7, maxZ: 14.3 }, height: LIGHTHOUSE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_FARO_SOUTH', zoneId: 'lighthouse', bounds: { minX: 21, maxX: 56, minZ: 21.7, maxZ: 22.3 }, height: LIGHTHOUSE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_FARO_EAST', zoneId: 'lighthouse', bounds: { minX: 55.7, maxX: 56.3, minZ: 14, maxZ: 22 }, height: LIGHTHOUSE_WALL_HEIGHT, planeY: 0 },
  // Oeste: gap en z=16.3..19.7 para S_TERRACES_TO_LIGHTHOUSE
  { id: 'C_FARO_WEST_N', zoneId: 'lighthouse', bounds: { minX: 20.7, maxX: 21.3, minZ: 14, maxZ: 16.3 }, height: LIGHTHOUSE_WALL_HEIGHT, planeY: 0 },
  { id: 'C_FARO_WEST_S', zoneId: 'lighthouse', bounds: { minX: 20.7, maxX: 21.3, minZ: 19.7, maxZ: 22 }, height: LIGHTHOUSE_WALL_HEIGHT, planeY: 0 },
] as const;

export function routeAnchor(id: RouteAnchorId): RouteAnchor {
  const anchor = ROUTE_ANCHORS.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Unknown route anchor: ${id}`);
  return anchor;
}
