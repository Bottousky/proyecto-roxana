import { AREAS } from './content.js';
import { LIGHTHOUSE_ISLET_RADIUS, SPRING_WATERWORKS_FOOTPRINTS } from './world-waterworks.js';

// Shared by the ground renderer, vegetation placement and the local map.
// Coordinates are world X/Z; every w/d and path width is a FULL dimension.
const path = (id, width, ...points) => ({ id, width, points });
const rect = (id, x, z, w, d, label) => ({ id, x, z, w, d, ...(label ? { label } : {}) });
const circle = (id, x, z, r, label) => ({ id, x, z, r, ...(label ? { label } : {}) });
const building = (id, label, x, z, w, d, height = 4, options = {}) => ({ id, label, x, z, w, d, height, options, approach: [x, z + d / 2 + .9] });

/** The same piecewise-linear coastline used by the visible Three.js land mesh. */
export function lakeShoreX(z) {
  const edge = value => 12 + Math.sin(value * .085) * 4 + Math.cos(value * .21) * 1.1;
  const start = Math.floor(z / 3) * 3, fraction = (z - start) / 3;
  return edge(start) + (edge(start + 3) - edge(start)) * fraction;
}

export const AREA_LAYOUTS = {
  portal: {
    identity: 'Un claro entre ruinas: se llega por el arco, que mira al valle; el camino al pueblo lo rodea por el este.',
    paths: [
      path('arrival-and-arch', 2.7, [0, 4], [-1.25, 1.2], [-1.25, -2.8], [0, -3.2]),
      path('valley-road', 2.7, [0, -3.2], [3.8, -3.9], [6.2, -6.2], [6.6, -12]),
      path('ohm-approach', 2.15, [-1.25, 1.2], [1.2, 2.75], [3.5, 2.75]),
      path('western-ruins', 2.1, [0, 4], [-4, 3.4], [-5.25, 0], [-5.25, -3.65], [-8, -3.65]),
      path('keeper-house', 1.55, [-8, -3.65], [-10.36, -3.65], [-10.36, -4.3]),
      path('root-observation', 1.9, [0, 4], [5.5, 5.8], [8.5, 6.2]),
    ],
    courts: [circle('arch-court', 0, -3, 4.2), circle('ohm-court', 3.5, 0, 2.85), circle('garden-rest', 0, 5.2, 1.8)],
    buildings: [{ ...building('portal-keeper', 'Casa de los Porteros', -10.36, -7.2, 4.8, 4, 3.5, {stone:true}), composition: 'La casa de Edda y su familia, que reciben a quien cruza. Escala baja junto al arco; su puerta se abre al claro, sin invadir el pilar occidental.' }],
    landmarks: [{ id: 'portal', label: 'Portal Ω', x: 0, z: -5.7 }],
    exclusions: [rect('portal-pier-west', -3.25, -5.7, 1, 1.2), rect('portal-pier-east', 3.25, -5.7, 1, 1.2), rect('portal-surface', 0, -5.7, 5.5, .6)],
  },
  plaza: {
    identity: 'Un circuito alrededor de la fuente y calles cortas que terminan en puertas visibles.',
    paths: [
      path('south-arrival', 2.8, [0, 14], [0, 8.5], [0, 3.5]),
      path('fountain-circuit', 2.65, [0, 3.5], [-4.3, .1], [-4.3, -4.5], [0, -7.15], [4.3, -4.5], [4.3, .1], [0, 3.5]),
      path('north-road', 2.8, [0, -7.15], [0, -14]),
      path('workshop-street', 2.8, [0, 8.5], [-6.2, 8.8], [-10.5, 10], [-13.25, 10]),
      path('workshop-door', 2.25, [-13.25, 10], [-13.25, 7.9]),
      path('northwest-market', 2.2, [-4.3, .1], [-4.3, -4.5], [-5.15, -6.1]),
      path('northwest-door', 1.8, [-5.15, -6.1], [-5.15, -7.4]),
      path('statue-approach', 1.8, [-4.3, .1], [-5.7, -2.5]),
      path('northeast-street', 2.2, [4.3, .1], [7.2, -3.7]),
      path('northeast-door', 1.8, [7.2, -3.7], [7.2, -6.9]),
      path('bell-approach', 1.7, [7.2, -3.7], [10.2, -5.7]),
      path('east-market', 2.5, [0, 8.5], [7.8, 8.2], [14.8, 8.5]),
      path('east-market-door', 1.8, [14.8, 8.5], [14.8, 6.2]),
      path('neighbor-walk', 2.1, [-4.3, .1], [-5, 3.4], [0, 5.2], [8, 4.4], [7.8, 8.2]),
    ],
    courts: [circle('fountain-apron', 0, -2, 4.1), rect('arrival-square', 0, 7, 8.5, 5.6), rect('workshop-forecourt', -13.25, 10, 8.4, 3.6)],
    buildings: [
      { ...building('plaza-bakery', 'Panadería', -5.15, -10.3, 4.8, 4, 3.7, {awning:true,red:true,service:'bakery'}), composition: 'Una planta y tejado separado de la proyección del Taller; puerta hacia el circuito de la fuente.' },
      { ...building('plaza-civic-house', 'Casa de la Plaza', 7.2, -10.1, 6, 4.6, 4.2, {stone:true}), composition: 'Fachada norte desplazada al centro, con aire lateral respecto al Mercado y un acceso propio junto a la campana.' },
      { ...building('plaza-workshop', 'Taller de Lumen', -13.25, 3.8, 9.2, 6.4, 6.4, {workshop:true}), composition: 'Hito principal aprobado: mantiene tamaño, posición, porche y entrada sur; su explanada queda libre.' },
      { ...building('plaza-market', 'Mercado', 14.8, 3, 4.8, 4.6, 3.6, {awning:true,red:true}), composition: 'Pabellón bajo del este, enteramente dentro del jardín; la puerta mira al paseo sur y las provisiones quedan al costado.' },
    ],
    landmarks: [{ id: 'fountain', label: 'Fuente de Ohm', x: 0, z: -2 }],
    exclusions: [],
    adjustments: [
      { id: 'plaza-crates', reason: 'Almacén junto al costado este, fuera de la fachada y su explanada', positions: [[-7.7, 0], [-7.7, .8], [-6.9, 0], [-6.9, .8]] },
      { id: 'plaza-barrels', reason: 'Almacén al este del Mercado, entre el cimiento y el muro, fuera de su puerta y explanada', positions: [[17.8, 1.3], [17.8, 2.2], [17.8, 3.1], [17.8, 4]] },
    ],
  },
  workshop: {
    identity: 'Un pasillo de trabajo entre el hogar, las mesas y los armarios; el suelo conserva madera.',
    paths: [
      path('entry-aisle', 2.6, [0, 10], [0, 6.5], [0, 2], [0, -5.8], [0, -9.3]),
      path('controls-aisle', 2.1, [-7, 5.35], [-7, 6.4], [-4, 6.4], [-4, 3.7], [0, 3.7], [4.5, 3.7], [7, 5.35]),
      path('bench-approach', 2, [0, .4], [3, -1.25]),
      path('notes-aisle', 1.7, [0, -5.8], [-4.8, -6.05], [-7, -5.85]),
      path('cup-aisle', 1.65, [0, -5.8], [5.5, -5.25], [8, -4.65]),
    ],
    courts: [rect('working-apron', 0, 2, 7.6, 7), rect('bench-apron', 3, -1.3, 4.5, 2.1)],
    buildings: [], landmarks: [{ id: 'workbench', label: 'Mesa de Lumen', x: 3, z: -3 }],
    exclusions: [rect('hearth', -9.84, 3, 2.7, 4, 'Hogar'), rect('cabinet', -10.56, 9.12, 2.3, 2.7), rect('west-shelves', -10.5, -3, 1.4, 9), rect('east-shelves', 10.5, -3, 1.4, 9), rect('west-counter', -8.16, -8.4, 5.8, 1.8), rect('east-counter', 8.16, -8.4, 5.8, 1.8)],
  },
  road: {
    identity: 'La Calzada conduce a la reja; los puestos de reparación quedan a ambos lados de la vía.',
    paths: [
      path('gate-road', 3.0, [0, 14], [0, 8.7], [-2.5, 5.6], [-2.5, 1.1], [0, -1.8], [0, -14]),
      path('west-inn-lane', 2.35, [0, 10.7], [-6.5, 10.7], [-12.92, 10.7]),
      path('west-inn-door', 1.55, [-12.92, 10.7], [-12.92, 8.44]),
      path('electrical-service', 2.1, [-8, 2.35], [-6.5, 3.05], [-3.5, 2.8], [0, 0], [3.2, 2.4], [8, 2.4]),
      path('bypass-approach', 1.7, [-2.5, 5.6], [0, 5]),
      path('panel-approach', 2.15, [0, -3], [4.5, -4.4]),
      path('memorial-walk', 2.15, [0, -4.8], [-8, -4.8]),
      path('bank-inspection', 1.85, [3.2, 2.4], [7.8, 5.2], [9.3, 8.3]),
    ],
    courts: [rect('gate-apron', 0, -6.9, 17.6, 4.2), rect('south-forecourt', 0, 8.5, 8.5, 4)],
    buildings: [{ ...building('road-inn', 'Puesto de la Calzada', -12.92, 5.44, 4.7, 4.2, 3.8, {awning:true}), composition: 'Puesto bajo a un lado de la vía, con patio sur propio; conserva la vista central de la reja.' }],
    landmarks: [{ id: 'gate', label: 'Puerta de la Calzada', x: 0, z: -10.24 }],
    exclusions: [rect('east-river', 19.8, 0, 4.6, 34, 'Canal'), rect('west-gate-tower', -12.92, -10.24, 4.8, 4.8), rect('east-gate-tower', 12.92, -10.24, 4.8, 4.8)],
    waters: [{ id: 'road-canal', label: 'Canal exterior a la muralla', points: [[17.8, -16], [21.8, -16], [21.8, 16], [17.8, 16]] }],
  },
  spring: {
    identity: 'Un recorrido por la margen seca enlaza bomba, marcas de agua y casa de la rueda.',
    paths: [
      path('dry-bank-route', 2.7, [0, 13], [0, 8.5], [0, 3], [-4.8, 0], [-4.8, -8], [0, -9.8], [0, -13]),
      path('sluice-approach', 1.8, [-4.8, 0], [-5.1, 3.3], [-6.5, 3.3]),
      path('level-marks', 1.7, [-4.8, -3], [-6.5, -3.65]),
      path('pump-service', 2.3, [0, 5], [4.6, 1.8], [4.6, -3.1], [2.5, -3.4]),
      path('coupling-and-wheel-house', 2.1, [4.6, 1.8], [7.5, .5], [11.56, .5], [11.56, -3.7]),
      path('wheel-house-door', 1.55, [11.56, -3.7], [11.56, -5.35]),
      path('vega-garden', 2.0, [0, 5], [4, 4.5], [7, 6], [10, 7.3]),
    ],
    courts: [rect('pump-apron', 3, -2.7, 5.2, 3.6), circle('source-basin-apron', -2, -4.5, 2.8), rect('vega-work-court', 4, 4.3, 6.5, 3.6)],
    buildings: [{ ...building('wheel-house', 'Casa de la rueda', 11.56, -9, 6, 5.5, 4.2, {stone:true}), composition: 'La rueda se separa del flanco oeste para mostrar sus apoyos y eje; la puerta conserva el acceso por la margen seca.' }],
    landmarks: [{ id: 'spring-wheel', label: 'Rueda del Manantial', x: 7.82, z: -5.7 }, { id: 'aqueduct', label: 'Acueducto', x: -6, z: -12.6 }],
    exclusions: [rect('spring-water', -11.56, -2, 6.5, 25, 'Manantial'), rect('spring-wheel', 7.82, -5.7, 4.5, .75), rect('source-basin', -2, -4.5, 3.6, 3.6), ...SPRING_WATERWORKS_FOOTPRINTS],
    waters: [{ id: 'spring-channel', label: 'Manantial', points: [[-14.81, -14.5], [-8.31, -14.5], [-8.31, 10.5], [-14.81, 10.5]] }],
  },
  castle: {
    identity: 'Un patio de servicio se abre en dos recorridos antes de reunirse en la puerta del Castillo.',
    paths: [
      path('castle-arrival', 2.8, [0, 14], [0, 8], [0, 2]),
      path('west-courtyard-loop', 2.65, [0, 2], [-4.3, -1], [-4.3, -8.8], [0, -9.6]),
      path('east-courtyard-loop', 2.65, [0, 2], [4.3, -1], [4.3, -8.8], [0, -9.6]),
      path('castle-gate', 2.8, [0, -9.6], [0, -14]),
      path('west-service', 2.1, [-4.3, -1], [-8, .4], [-9.5, -2.3], [-9.5, -4.7], [-11, -7.25]),
      path('east-service', 2.1, [4.3, -1], [8, .4], [9.5, -2.3], [9.5, -5.3], [11, -7.75]),
      path('distribution-approach', 2, [-4.3, -3.9], [0, -4.45], [4.3, -3.9]),
    ],
    courts: [rect('arrival-court', 0, 4.4, 17, 7.6), rect('service-court', 0, -2.9, 18.6, 8.2), rect('gate-forecourt', 0, -9.1, 16, 2.8)],
    buildings: [], landmarks: [{ id: 'castle', label: 'Castillo de la Red', x: 0, z: -12.8 }],
    exclusions: [rect('west-castle-wall', -9.3, -12.8, 14.6, 3.5), rect('east-castle-wall', 9.3, -12.8, 14.6, 3.5), rect('west-castle-tower', -14.4, -10.88, 5.6, 5.6), rect('east-castle-tower', 14.4, -10.88, 5.6, 5.6)],
  },
  terraces: {
    identity: 'Los corredores de los bancales explican el riego; la calle alta une ambas casas.',
    paths: [
      path('terrace-spine', 2.65, [0, 16], [0, 10], [-1, 5], [-2.6, 1.5], [-2.6, -8.8], [0, -11], [0, -16]),
      path('west-work-lane', 2.1, [-1, 5], [-5.5, 5], [-6.5, 2], [-6.5, -9], [-7, -10.25]),
      path('east-work-lane', 2.1, [-1, 5], [5.5, 5], [6.5, 2], [6.5, -9], [7, -10.3]),
      path('upper-street', 2.4, [-13.6, -10.25], [-7, -10.25], [0, -10.3], [7, -10.3], [13.6, -10.3]),
      path('forge-house-door', 1.8, [-13.6, -10.25], [-13.6, -11.8]),
      path('mill-house-door', 1.8, [13.6, -10.3], [13.6, -11.9]),
      path('west-upper-bed-aisle', 1.55, [-6.5, -4.43], [-17.2, -4.43]),
      path('east-upper-bed-aisle', 1.55, [6.5, -4.43], [17.2, -4.43]),
      path('west-lower-bed-aisle', 1.55, [-6.5, 1.2], [-11.6, 1.07], [-17.2, 1.07]),
      path('east-lower-bed-aisle', 1.55, [6.5, 1.2], [11.6, 1.07], [17.2, 1.07]),
      path('control-apron', 1.8, [-8, 1.4], [-6.5, 2], [0, 2], [6.5, 2], [8, 1.4]),
      path('irrigation-panel-approach', 1.9, [-2.6, -3.6], [1, -3.9]),
      path('trial-garden', 2, [5.5, 5], [8.5, 6.6], [11, 8.8]),
    ],
    courts: [rect('shared-work-court', 0, 6.7, 14.6, 5.6), rect('upper-junction', 0, -11.7, 8, 4.4)],
    buildings: [
      { ...building('terrace-forge', 'Casa de la forja', -13.6, -14.5, 5.8, 3.6, 3.9, {awning:true,red:true,stone:true,service:'forge'}), composition: 'Volumen bajo y poco profundo: cubierta y toldo dentro del recinto, fachada completa sobre la calle alta.' },
      { ...building('terrace-mill', 'Casa del molino', 13.6, -14.6, 4.8, 3.6, 4.5, {stone:true}), composition: 'Hastial frontal y aspas adheridas al edificio; el alero se separa del borde norte y el rotor pasa por encima del dintel.' },
    ],
    landmarks: [{ id: 'irrigation', label: 'Bancales de riego', x: 14.4, z: -1.68 }],
    exclusions: [-1, 1].flatMap(side => [-7.18, -1.68, 3.82].map((z, row) => rect(`bed-${side < 0 ? 'west' : 'east'}-${row}`, side * 14.4, z, 8, 3.5, 'Bancal'))),
    adjustments: [{ id: 'terrace-rows', reason: 'Abrir las puertas norte y corredores de dos metros', rowZ: [-7.18, -1.68, 3.82] }],
  },
  lake: {
    identity: 'El paseo sigue la orilla y se desvía hacia el muelle; la casa conserva un acceso de tierra firme.',
    paths: [
      path('lakeside-arrival', 2.8, [0, 15], [-1, 10], [-1, 4], [-1, 0], [-1, -7.5], [0, -15]),
      path('shore-promenade', 2.35, [-1, 10], [3.5, 7.5], [4, 3], [4, -1.2], [5.8, -1.0], [8, -1.65]),
      { ...path('dock-walk', 2.7, [4, 3], [12.3, 3]), surface: 'wood' },
      path('reed-lamp-walk', 1.9, [3.5, 7.5], [8.8, 8.9], [11, 8.9]),
      path('western-house-lane', 2.2, [-1, -4], [-6, -4.5], [-10, -4.5], [-14, -4.5]),
      path('western-house-door', 1.55, [-14, -4.5], [-14, -6.98]),
      path('cable-service', 1.95, [-1, 2], [-4, 2], [-8, 1.3]),
      path('edda-garden', 2.0, [-4, 2], [-5, 6], [-1, 10]),
    ],
    courts: [rect('dock-landfall', 3.6, 3, 3.8, 3.6), rect('nereo-meeting', 3.3, 6.2, 5, 3.6)],
    buildings: [{ ...building('lake-house', 'Casa del lago', -14, -10.88, 7, 6, 4.4, {awning:true,service:'fishing'}), composition: 'Única vivienda junto al lago, retirada de la orilla y abierta al sendero occidental; conserva su silueta independiente.' }],
    landmarks: [{ id: 'lake-dock', label: 'Muelle', x: 9.2, z: 3 }, { id: 'distant-lighthouse', label: 'Faro', x: 15.6, z: -16.32, distant: true }],
    exclusions: [circle('lighthouse-rock-islet', 15.6, -16.32, LIGHTHOUSE_ISLET_RADIUS * 1.05, 'Islote rocoso')],
    waters: [{ id: 'lake-water', label: 'Lago', points: [...Array.from({ length: 35 }, (_, index) => { const z = index - 17; return [lakeShoreX(z), z]; }), [20, 17], [20, -17]] }],
    walkSurfaces: [{ id: 'wooden-dock', x: 9.2, z: 3, w: 9, d: 4.5, surface: 'wood' }],
    adjustments: [{ id: 'shore-rocks', reason: 'No cerrar el desembarco ni el paseo entre cañas', avoidPavingMargin: 1 }],
  },
  lighthouse: {
    identity: 'Tres galerías de servicio y la torre forman un único recinto; sus márgenes quedan libres de viviendas superpuestas.',
    paths: [
      path('gallery-arrival', 2.8, [0, 19], [0, 15], [0, 11.5]),
      path('west-gallery', 2.6, [0, 11.5], [-4.6, 11.5], [-4.6, -15.7], [0, -17.6]),
      path('east-gallery', 2.6, [0, 11.5], [4.6, 11.5], [4.6, -15.7], [0, -17.6]),
      path('supply-controls', 2.1, [-8, 8.35], [0, 8.35], [8, 8.35]),
      path('network-controls', 2.1, [-8, 1.35], [0, 1.35], [8, 1.35]),
      path('lens-controls', 2.1, [-8, -6.65], [-4.6, -7.6], [4.6, -7.6], [8, -6.65]),
      path('north-observation', 2, [-9.7, -14.7], [-4.6, -15.7], [0, -16.1], [4.6, -15.7], [9.7, -14.7]),
    ],
    courts: [rect('lower-gallery', 0, 9.6, 18.8, 7.5), rect('distribution-gallery', 0, -.25, 18.8, 8.8), rect('optical-gallery', 0, -10.8, 18.8, 8.8), rect('tower-observation-court', 0, -18.4, 6, 3.4)],
    buildings: [],
    landmarks: [{ id: 'beacon-tower', label: 'Linterna del Faro', x: 0, z: -23.94, distant: true }],
    exclusions: [rect('west-gallery-wall', -12.7, -1.2, .65, 36), rect('east-gallery-wall', 12.7, -1.2, .65, 36), rect('lighthouse-tower-basement', 0, -24.38, 11, 8, 'Basamento del Faro')],
    adjustments: [{ id: 'lighthouse-keeper-removed', reason: 'La casa decorativa anterior cruzaba el borde y se superponía al muro de la galería; no tenía interacción ni salida, y su camino se retira con ella.' }],
  },
};

const MACHINE_FOOTPRINTS = { awaken: [2.9, 2.9], workshop: [3.35, 1.7], gate: [2.5, 1.3], pump: [3.3, 2.3], distribution: [4.3, 1.3], irrigation: [3.3, 2.3], beacon_supply: [5, 3.2], beacon_network: [4.1, 4.5], beacon_lens: [3.5, 3.3] };
for (const [id, layout] of Object.entries(AREA_LAYOUTS)) {
  const area = AREAS[id];
  layout.id = id;
  layout.name = area.name;
  layout.bounds = [...area.bounds];
  layout.spawn = [...area.spawn];
  layout.waters ??= [];
  layout.walkSurfaces ??= [];
  layout.exits = area.exits.map(({ id, x, z, target, label }) => ({ id, x, z, target, label }));
  layout.exclusions.push(...layout.buildings.map(b => rect(`${b.id}-footprint`, b.x, b.z, b.w + .3, b.d + .3)));
  for (const object of area.objects) {
    if (object.kind === 'npc' || object.character) continue;
    const size = object.kind === 'well' ? [4.2, 4.2] : object.kind === 'lever' ? [1.2, .9] : MACHINE_FOOTPRINTS[object.puzzle] || [1.25, .95];
    layout.exclusions.push(rect(object.id, object.x, object.z, ...size));
  }
}

/** Euclidean distance to a finite segment, including degenerate one-point paths. */
export function distanceToPathSegment(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], square = dx * dx + dz * dz;
  const t = square ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / square)) : 0;
  return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
}

export function pointInLayoutShape(shape, x, z, margin = 0) {
  if (shape.r != null) return Math.hypot(x - shape.x, z - shape.z) <= Math.max(0, shape.r + margin);
  return Math.abs(x - shape.x) <= Math.max(0, shape.w / 2 + margin) && Math.abs(z - shape.z) <= Math.max(0, shape.d / 2 + margin);
}

export function pointInLayoutPolygon(points, x, z) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i], b = points[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** Positive margin reserves a planting setback; fixed exclusions never grow paving. */
export function pointOnPaving(layout, x, z, margin = 0) {
  if (!layout || !Number.isFinite(x) || !Number.isFinite(z)) return false;
  if (Math.abs(x) > layout.bounds[0] / 2 - .45 || Math.abs(z) > layout.bounds[1] / 2 - .45) return false;
  if (layout.exclusions.some(shape => pointInLayoutShape(shape, x, z))) return false;
  if (layout.waters.some(water => pointInLayoutPolygon(water.points, x, z)) && !layout.walkSurfaces.some(surface => pointInLayoutShape(surface, x, z))) return false;
  if (layout.courts.some(shape => pointInLayoutShape(shape, x, z, margin))) return true;
  return layout.paths.some(path => {
    if (path.points.length === 1) return Math.hypot(x - path.points[0][0], z - path.points[0][1]) <= path.width / 2 + margin;
    return path.points.slice(1).some((point, i) => distanceToPathSegment(x, z, path.points[i], point) <= path.width / 2 + margin);
  });
}
