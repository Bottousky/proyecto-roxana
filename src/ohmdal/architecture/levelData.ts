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
  | 'R0_PORTAL_SPAWN'
  | 'R1_PLAZA_ENTRY'
  | 'R2_PLAZA_DIAGONAL'
  | 'R3_TALLER_THRESHOLD'
  | 'R4_LUMEN_STOP'
  | 'R5_FOREGROUND_BYPASS'
  | 'R6_TALLER_MEASURE'
  | 'R7_DOOR_APPROACH'
  | 'R8_DOOR_MEASURE'
  | 'R9_SPRING_EDGE'
  | 'R9_5_BASIN_BYPASS'
  | 'R10_CASTLE_GATE'
  | 'R11_CASTLE_GALLERY'
  | 'R12_CASTLE_BRANCHES'
  | 'R13_CASTLE_HEART'
  | 'R14_FORGE_YARD'
  | 'R15_FORGE_INFIRMARY'
  | 'R16_FORGE_LONGCHANNEL'
  | 'R17_FORGE_HALL'
  | 'R18_TERRACES_LOW'
  | 'R19_TERRACES_MID'
  | 'R20_TERRACES_MURAL'
  | 'R21_TERRACES_TOP'
  | 'R22_LIGHTHOUSE_HALL'
  | 'R23_LIGHTHOUSE_BENCH'
  | 'R24_CLOCK_TOWER'
  | 'R25_LIGHTHOUSE_LANTERN';

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

export const LEVEL_ZONES: readonly LevelZone[] = [
  {
    id: 'portal_plaza',
    purpose: 'arrival-orientation',
    bounds: { minX: -21, maxX: -4, minZ: -6, maxZ: 6 },
    landmarkId: 'PLAZA_PORTAL_GATE',
  },
  {
    id: 'taller',
    purpose: 'diagnosis-workspace',
    bounds: { minX: -4.5, maxX: 8.5, minZ: -5, maxZ: 4.5 },
    landmarkId: 'TALLER_KIT',
  },
  {
    id: 'puerta_manantial',
    purpose: 'objective-consequence',
    bounds: { minX: 8, maxX: 22.75, minZ: -5, maxZ: 5.5 },
    landmarkId: 'PUERTA_KIT',
  },
  // Las cuatro unidades siguientes son el resto del Arco I, servidas por `createBasicUnitKit`
  // en el look HD-2D básico. Cada una cubre 4 sub-salas del manifiesto y la landmark que
  // declara es el nodo raíz del kit, igual que TALLER_KIT y PUERTA_KIT. Las zonas se
  // superponen 1.5 m en cada socket — el extremo este de una zona cubre el socket, y el
  // extremo oeste de la siguiente también — para que la navegación plana sea continua:
  // ningún segmento entre ancla y ancla queda fuera de toda región.
  {
    id: 'castle',
    purpose: 'exploration-circuit',
    bounds: { minX: 22.25, maxX: 52.75, minZ: -5, maxZ: 9 },
    landmarkId: 'CASTLE_KIT',
  },
  {
    id: 'forge',
    purpose: 'craft-workspace',
    bounds: { minX: 51.25, maxX: 82.75, minZ: -7, maxZ: 3 },
    landmarkId: 'FORGE_KIT',
  },
  {
    id: 'terraces',
    purpose: 'ascent-observation',
    bounds: { minX: 81.25, maxX: 118.75, minZ: -5, maxZ: 7 },
    landmarkId: 'TERRACES_KIT',
  },
  {
    id: 'lighthouse',
    purpose: 'summit-culmination',
    bounds: { minX: 117.25, maxX: 152, minZ: -5, maxZ: 3 },
    landmarkId: 'LIGHTHOUSE_KIT',
  },
] as const;

export const ROUTE_ANCHORS: readonly RouteAnchor[] = [
  { id: 'R0_PORTAL_SPAWN', position: { x: -18, y: 0, z: 0 }, purpose: 'spawn at Portal' },
  // La entrada a la Plaza se corrió a z = −3,2. Con la Plaza construida, el eje z = 0 lo
  // ocupan el pedestal de Ohm y el monumento de la campana: el anclaje caía adentro de la
  // piedra. Entrar bordeando también compone mejor —los dos monumentos se ven de costado en
  // vez de venírsele encima al jugador— y encadena con R2, que ya leía la Plaza en diagonal.
  // SCENE_INVENTORY §4.2 obliga a volver a medir `route-timing.json` por este cambio.
  { id: 'R1_PLAZA_ENTRY', position: { x: -13, y: 0, z: -3.2 }, purpose: 'enter Plaza' },
  { id: 'R2_PLAZA_DIAGONAL', position: { x: -7.5, y: 0, z: -2.5 }, purpose: 'read Plaza diagonal' },
  { id: 'R3_TALLER_THRESHOLD', position: { x: -3, y: 0, z: -2.5 }, purpose: 'cross Taller threshold' },
  { id: 'R4_LUMEN_STOP', position: { x: 0, y: 0, z: -2.5 }, purpose: 'stop before Lumen' },
  { id: 'R5_FOREGROUND_BYPASS', position: { x: 2.5, y: 0, z: 1.5 }, purpose: 'bypass foreground' },
  { id: 'R6_TALLER_MEASURE', position: { x: 5, y: 0, z: 1 }, purpose: 'Taller measurement' },
  { id: 'R7_DOOR_APPROACH', position: { x: 9.5, y: 0, z: 0 }, purpose: 'enter Door set' },
  { id: 'R8_DOOR_MEASURE', position: { x: 13.5, y: 0, z: -0.5 }, purpose: 'Door measurement' },
  { id: 'R9_SPRING_EDGE', position: { x: 16.5, y: 0, z: 1.5 }, purpose: 'observe spring edge' },
  // El Manantial (basin) ocupa el centro del set: para salir al Castillo hay que rodearlo
  // por el sur. R9.5 es el waypoint que dobla la ruta antes de seguir al este.
  { id: 'R9_5_BASIN_BYPASS', position: { x: 16, y: 0, z: -2.5 }, purpose: 'go around the basin' },
  // Anclas del resto del Arco I. El recorrido automático las visita en orden: atraviesa el
  // Castillo por la galería hasta el corazón, baja a la Forja por el patio, sale por el canal
  // largo, sube a las Terrazas por el mirador del mural hasta el acueducto alto, y termina
  // en la linterna del Faro. Cada ancla está sobre el plano jugable (Y=0).
  //
  // Las unidades están desplazadas en Z: el Castillo al norte, la Forja al sur, las Terrazas
  // al norte, el Faro al sur. El camino entra por el oeste a z=0 (en el hueco del muro),
  // meandrea dentro de la unidad siguiendo el centro del footprint, y vuelve a z=0 antes
  // de salir al este. Desde arriba el mundo serpentea en vez de ir derecho.
  { id: 'R10_CASTLE_GATE', position: { x: 25.5, y: 0, z: 0 }, purpose: 'enter Castle' },
  { id: 'R11_CASTLE_GALLERY', position: { x: 32.5, y: 0, z: 4 }, purpose: 'cross Castle gallery (north)' },
  { id: 'R12_CASTLE_BRANCHES', position: { x: 39.5, y: 0, z: -3 }, purpose: 'observe Castle branches (south)' },
  { id: 'R13_CASTLE_HEART', position: { x: 46.5, y: 0, z: 0 }, purpose: 'stand before throne' },
  { id: 'R14_FORGE_YARD', position: { x: 54.5, y: 0, z: 0 }, purpose: 'enter Forge yard' },
  { id: 'R15_FORGE_INFIRMARY', position: { x: 61, y: 0, z: -4 }, purpose: 'pass infirmary (south)' },
  { id: 'R16_FORGE_LONGCHANNEL', position: { x: 68, y: 0, z: 2 }, purpose: 'walk the long channel (north)' },
  { id: 'R17_FORGE_HALL', position: { x: 76.5, y: 0, z: 0 }, purpose: 'stand in the Forge hall' },
  { id: 'R18_TERRACES_LOW', position: { x: 84.5, y: 0, z: 0 }, purpose: 'ascend from Forge' },
  { id: 'R19_TERRACES_MID', position: { x: 95, y: 0, z: 3 }, purpose: 'reach the middle terrace (north)' },
  { id: 'R20_TERRACES_MURAL', position: { x: 105, y: 0, z: -3 }, purpose: 'observe the mural (south)' },
  { id: 'R21_TERRACES_TOP', position: { x: 113, y: 0, z: 0 }, purpose: 'reach the top terrace' },
  { id: 'R22_LIGHTHOUSE_HALL', position: { x: 120.5, y: 0, z: 0 }, purpose: 'enter Lighthouse hall' },
  { id: 'R23_LIGHTHOUSE_BENCH', position: { x: 128, y: 0, z: -3 }, purpose: 'pass the bench (south)' },
  { id: 'R24_CLOCK_TOWER', position: { x: 137, y: 0, z: 2 }, purpose: 'stand at clock tower (north)' },
  { id: 'R25_LIGHTHOUSE_LANTERN', position: { x: 149, y: 0, z: 0 }, purpose: 'reach the lantern: end of arc' },
] as const;

export const ARCHITECTURE_SOCKETS: readonly ArchitectureSocket[] = [
  {
    id: 'S_PORTAL_TO_PLAZA',
    from: 'portal_plaza',
    to: 'portal_plaza',
    position: { x: -15, y: 0, z: 0 },
    width: 3,
  },
  {
    id: 'S_PLAZA_TO_TALLER',
    from: 'portal_plaza',
    to: 'taller',
    position: { x: -4, y: 0, z: -2.5 },
    width: 3,
  },
  {
    id: 'S_TALLER_TO_DOOR',
    from: 'taller',
    to: 'puerta_manantial',
    position: { x: 8.25, y: 0, z: 0 },
    width: 3,
  },
  // Sockets del arco completo. Conectan unidades contiguas por el centro del muro este-oeste
  // de cada una. Ancho 3 m, igual que los del slice original, para que la cámara no cierre
  // el paso con el encuadre.
  {
    id: 'S_DOOR_TO_CASTLE',
    from: 'puerta_manantial',
    to: 'castle',
    position: { x: 22, y: 0, z: 0 },
    width: 3,
  },
  {
    id: 'S_CASTLE_TO_FORGE',
    from: 'castle',
    to: 'forge',
    position: { x: 52, y: 0, z: 0 },
    width: 3,
  },
  {
    id: 'S_FORGE_TO_TERRACES',
    from: 'forge',
    to: 'terraces',
    position: { x: 82, y: 0, z: 0 },
    width: 3,
  },
  {
    id: 'S_TERRACES_TO_LIGHTHOUSE',
    from: 'terraces',
    to: 'lighthouse',
    position: { x: 118, y: 0, z: 0 },
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

// Los colliders de la Plaza siguen a la geometría que construye `plazaKit`. Los del blockout
// viejo quedaron un tiempo como muros invisibles en medio de la nada: nadie los ve, y el
// jugador choca contra piezas que ya no existen.
export const COLLIDERS: readonly ColliderDefinition[] = [
  { id: 'C_PORTAL_PIER_NORTH', zoneId: 'portal_plaza', bounds: { minX: -21.15, maxX: -19.65, minZ: -3.15, maxZ: -1.65 }, height: 5.2, planeY: 0 },
  { id: 'C_PORTAL_PIER_SOUTH', zoneId: 'portal_plaza', bounds: { minX: -21.15, maxX: -19.65, minZ: 1.65, maxZ: 3.15 }, height: 5.2, planeY: 0 },
  // Del monumento frenan los machones, no el basamento: los dos escalones miden 22 cm y se
  // pisan. Del pedestal frena de la segunda grada para arriba, por lo mismo. Bloquear la
  // huella entera cerraba el eje de la Plaza y dejaba la ruta canonica sin paso.
  { id: 'C_BELL_PIER_NORTH', zoneId: 'portal_plaza', bounds: { minX: -11.13, maxX: -10.08, minZ: -2.28, maxZ: -1.23 }, height: 5.1, planeY: 0 },
  { id: 'C_BELL_PIER_SOUTH', zoneId: 'portal_plaza', bounds: { minX: -11.13, maxX: -10.08, minZ: 1.23, maxZ: 2.28 }, height: 5.1, planeY: 0 },
  { id: 'C_OHM_PEDESTAL', zoneId: 'portal_plaza', bounds: { minX: -14.78, maxX: -12.22, minZ: -1.28, maxZ: 1.28 }, height: 1.06, planeY: 0 },
  { id: 'C_TALLER_BACK', zoneId: 'taller', bounds: { minX: -4.6, maxX: 8.6, minZ: -5.2, maxZ: -4.5 }, height: 2.8, planeY: 0 },
  // El muro este se abre en el medio: por ahi sale el socket S_TALLER_TO_DOOR hacia la Puerta.
  { id: 'C_TALLER_EAST_NORTH', zoneId: 'taller', bounds: { minX: 8.25, maxX: 8.6, minZ: -5.2, maxZ: -1.7 }, height: 2.8, planeY: 0 },
  { id: 'C_TALLER_EAST_SOUTH', zoneId: 'taller', bounds: { minX: 8.25, maxX: 8.6, minZ: 1.7, maxZ: 4.7 }, height: 2.8, planeY: 0 },
  { id: 'C_WORKBENCH', zoneId: 'taller', bounds: { minX: 3.5, maxX: 6.1, minZ: -3.03, maxZ: -1.97 }, height: 1, planeY: 0 },
  // Las jambas de la Puerta. El vano entre ellas queda libre: GF-06 registra que la ronda 1
  // fallo justo aca por falta de separacion entre el estudiante y los pilares.
  { id: 'C_DOOR_JAMB_NORTH', zoneId: 'puerta_manantial', bounds: { minX: 13.95, maxX: 15.25, minZ: -3.15, maxZ: -1.4 }, height: 5.4, planeY: 0 },
  { id: 'C_DOOR_JAMB_SOUTH', zoneId: 'puerta_manantial', bounds: { minX: 13.95, maxX: 15.25, minZ: 1.8, maxZ: 3.55 }, height: 5.4, planeY: 0 },
  { id: 'C_SPRING_BASIN', zoneId: 'puerta_manantial', bounds: { minX: 16.9, maxX: 20.3, minZ: -0.2, maxZ: 3.2 }, height: 0.9, planeY: 0 },
  // Muros perimetrales de las cuatro unidades básicas. Cada unidad tiene 4 tramos —norte,
  // sur, este, oeste— y el jugador choca con todos menos por donde está el socket de
  // transición. Los muros laterales (este y oeste) se cortan en dos machones con un hueco
  // central de 3 m a la altura de z=0, donde está el socket. Mismo principio que el muro
  // este del Taller (C_TALLER_EAST_NORTH + C_TALLER_EAST_SOUTH).
  //
  // Cada unidad está desplazada en Z: el Castillo al norte, la Forja al sur, las Terrazas
  // al norte, el Faro al sur. Eso hace que el mundo serpentee desde arriba, en vez de ir
  // derecho. El collider va contra el borde de cada footprint.
  // CASTLE (x = 22.25..52.75, z = -5..9, shifted +2 north)
  { id: 'C_CASTLE_NORTH', zoneId: 'castle', bounds: { minX: 22.25, maxX: 52.75, minZ: 8.7, maxZ: 9.3 }, height: 3.4, planeY: 0 },
  { id: 'C_CASTLE_SOUTH', zoneId: 'castle', bounds: { minX: 22.25, maxX: 52.75, minZ: -5.3, maxZ: -4.7 }, height: 3.4, planeY: 0 },
  { id: 'C_CASTLE_WEST', zoneId: 'castle', bounds: { minX: 21.95, maxX: 22.55, minZ: -4.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_CASTLE_WEST_S', zoneId: 'castle', bounds: { minX: 21.95, maxX: 22.55, minZ: 1.7, maxZ: 8.7 }, height: 3.4, planeY: 0 },
  { id: 'C_CASTLE_EAST', zoneId: 'castle', bounds: { minX: 52.45, maxX: 53.05, minZ: -4.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_CASTLE_EAST_S', zoneId: 'castle', bounds: { minX: 52.45, maxX: 53.05, minZ: 1.7, maxZ: 8.7 }, height: 3.4, planeY: 0 },
  // FORGE (x = 51.25..82.75, z = -7..3, shifted -2 south)
  { id: 'C_FORGE_NORTH', zoneId: 'forge', bounds: { minX: 51.25, maxX: 82.75, minZ: 2.7, maxZ: 3.3 }, height: 3.4, planeY: 0 },
  { id: 'C_FORGE_SOUTH', zoneId: 'forge', bounds: { minX: 51.25, maxX: 82.75, minZ: -7.3, maxZ: -6.7 }, height: 3.4, planeY: 0 },
  { id: 'C_FORGE_WEST', zoneId: 'forge', bounds: { minX: 50.95, maxX: 51.55, minZ: -6.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_FORGE_WEST_S', zoneId: 'forge', bounds: { minX: 50.95, maxX: 51.55, minZ: 1.7, maxZ: 2.7 }, height: 3.4, planeY: 0 },
  { id: 'C_FORGE_EAST', zoneId: 'forge', bounds: { minX: 82.45, maxX: 83.05, minZ: -6.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_FORGE_EAST_S', zoneId: 'forge', bounds: { minX: 82.45, maxX: 83.05, minZ: 1.7, maxZ: 2.7 }, height: 3.4, planeY: 0 },
  // TERRACES (x = 81.25..118.75, z = -5..7, shifted +1 north)
  { id: 'C_TERRACES_NORTH', zoneId: 'terraces', bounds: { minX: 81.25, maxX: 118.75, minZ: 6.7, maxZ: 7.3 }, height: 3.4, planeY: 0 },
  { id: 'C_TERRACES_SOUTH', zoneId: 'terraces', bounds: { minX: 81.25, maxX: 118.75, minZ: -5.3, maxZ: -4.7 }, height: 3.4, planeY: 0 },
  { id: 'C_TERRACES_WEST', zoneId: 'terraces', bounds: { minX: 80.95, maxX: 81.55, minZ: -4.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_TERRACES_WEST_S', zoneId: 'terraces', bounds: { minX: 80.95, maxX: 81.55, minZ: 1.7, maxZ: 6.7 }, height: 3.4, planeY: 0 },
  { id: 'C_TERRACES_EAST', zoneId: 'terraces', bounds: { minX: 118.45, maxX: 119.05, minZ: -4.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_TERRACES_EAST_S', zoneId: 'terraces', bounds: { minX: 118.45, maxX: 119.05, minZ: 1.7, maxZ: 6.7 }, height: 3.4, planeY: 0 },
  // LIGHTHOUSE (x = 117.25..152, z = -5..3, shifted -1 south)
  { id: 'C_LIGHTHOUSE_NORTH', zoneId: 'lighthouse', bounds: { minX: 117.25, maxX: 152, minZ: 2.7, maxZ: 3.3 }, height: 3.4, planeY: 0 },
  { id: 'C_LIGHTHOUSE_SOUTH', zoneId: 'lighthouse', bounds: { minX: 117.25, maxX: 152, minZ: -5.3, maxZ: -4.7 }, height: 3.4, planeY: 0 },
  { id: 'C_LIGHTHOUSE_WEST', zoneId: 'lighthouse', bounds: { minX: 116.95, maxX: 117.55, minZ: -4.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_LIGHTHOUSE_WEST_S', zoneId: 'lighthouse', bounds: { minX: 116.95, maxX: 117.55, minZ: 1.7, maxZ: 2.7 }, height: 3.4, planeY: 0 },
  { id: 'C_LIGHTHOUSE_EAST', zoneId: 'lighthouse', bounds: { minX: 151.7, maxX: 152.3, minZ: -4.7, maxZ: -1.7 }, height: 3.4, planeY: 0 },
  { id: 'C_LIGHTHOUSE_EAST_S', zoneId: 'lighthouse', bounds: { minX: 151.7, maxX: 152.3, minZ: 1.7, maxZ: 2.7 }, height: 3.4, planeY: 0 },
] as const;

export function routeAnchor(id: RouteAnchorId): RouteAnchor {
  const anchor = ROUTE_ANCHORS.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Unknown route anchor: ${id}`);
  return anchor;
}
