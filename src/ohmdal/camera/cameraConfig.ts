import * as THREE from 'three';
import { routeAnchor } from '../architecture/levelData.ts';

export type CameraVariant = 'quasi-orthographic' | 'soft-perspective';
export type CameraAnchorId =
  | 'C1_PORTAL_PLAZA'
  | 'C2_TALLER'
  | 'C3_DOOR_SPRING'
  | 'C4_CASTLE'
  | 'C5_FORGE'
  | 'C6_TERRACES'
  | 'C7_LIGHTHOUSE';
export type ViewportProfileId = 'desktop-1440x900' | 'mobile-390x844';

export interface NamedLocalBounds {
  readonly right: { readonly min: number; readonly max: number };
  readonly forward: { readonly min: number; readonly max: number };
  readonly vertical: { readonly min: number; readonly max: number };
}

export interface AuthorCameraAnchor {
  readonly id: CameraAnchorId;
  readonly focus: Readonly<THREE.Vector3>;
  readonly forward: Readonly<THREE.Vector3>;
  readonly quasiOrthographicViewOffset?: Readonly<THREE.Vector3>;
  readonly targetBounds: NamedLocalBounds;
  readonly protectedSubjects: readonly string[];
  readonly verticalSpan: Readonly<Record<'desktop' | 'mobile', number>>;
}

export interface ViewportProfile {
  readonly id: ViewportProfileId;
  readonly width: number;
  readonly height: number;
  readonly maxDpr: number;
  readonly safeRect: { readonly minX: number; readonly maxX: number; readonly minY: number; readonly maxY: number };
}

export const CAMERA_NEAR_METERS = 0.1;
export const CAMERA_FAR_METERS = 120;
export const SOFT_PERSPECTIVE_FOV_Y_DEGREES = 28;
export const ORTHOGRAPHIC_MATCH_HALF_ANGLE_DEGREES = 14;
export const CAMERA_ZOOM_MIN = 0.9;
export const CAMERA_ZOOM_MAX = 1.1;

// **Volúmenes de transición 2D (red con hub central).** La cámara cambia de ancla cuando
// el jugador cruza uno de estos umbrales. La Plaza es el hub: tiene cuatro bocas
// (N, S, E, O); el resto del arco se extiende desde ellas. Los thresholds son rectas
// (no círculos) porque las zonas son rectangulares y la cámara sigue el eje del socket.
export const CAMERA_TRANSITION_VOLUMES = Object.freeze({
  // Plaza → Taller (este): x = 9 (el socket Plaza-Taller)
  plazaToTaller: {
    id: 'VOLUME_C1_TO_C2',
    crossingX: routeAnchor('R3_TALLER_THRESHOLD').position.x,
    hysteresisMeters: 0.75,
    durationSeconds: 0.90,
  },
  // Taller → Puerta+Manantial (este, dentro del corredor U1): x = 22.5
  tallerToDoor: {
    id: 'VOLUME_C2_TO_C3',
    crossingX: routeAnchor('R5_DOOR_APPROACH').position.x,
    hysteresisMeters: 0.75,
    durationSeconds: 1.10,
  },
  // Plaza → Castillo (norte): z = -7 (el socket Plaza-Castillo)
  plazaToCastle: {
    id: 'VOLUME_PLAZA_TO_C4',
    crossingZ: routeAnchor('R8_CASTLE_APPROACH').position.z,
    hysteresisMeters: 1.5,
    durationSeconds: 1.10,
  },
  // Plaza → Forja (oeste): x = -9 (el socket Plaza-Forja)
  plazaToForge: {
    id: 'VOLUME_PLAZA_TO_C5',
    crossingX: routeAnchor('R14_FORGE_APPROACH').position.x,
    hysteresisMeters: 1.5,
    durationSeconds: 1.10,
  },
  // Plaza → Terrazas (sur): z = 7 (el socket Plaza-Terrazas)
  plazaToTerraces: {
    id: 'VOLUME_PLAZA_TO_C6',
    crossingZ: routeAnchor('R19_TERRACES_APPROACH').position.z,
    hysteresisMeters: 1.5,
    durationSeconds: 1.10,
  },
  // Terrazas → Faro (sureste): z = 18 (alineado con el socket en x = 22)
  terracesToFaro: {
    id: 'VOLUME_C6_TO_C7',
    crossingX: routeAnchor('R24_FARO_APPROACH').position.x,
    hysteresisMeters: 1.5,
    durationSeconds: 1.10,
  },
});

export const CAMERA_FORWARD = new THREE.Vector3(1, 0, 0);
export const CAMERA_UP = new THREE.Vector3(0, 1, 0);
export const CAMERA_RIGHT = new THREE.Vector3().crossVectors(CAMERA_FORWARD, CAMERA_UP).normalize();

// La camara HD-2D es FRONTAL, no isometrica: `right` vale 0. Mires la sala del trono o el
// overworld del remake de DQ III, siempre estas mirando de frente por el eje de la escena —
// la alfombra se va derecho al fondo y las columnas quedan simetricas. El giro lateral de 0.55
// que habia antes ponia la camara en diagonal (38 grados) y daba un aire de Diablo, no de HD-2D.
//
// La inclinacion sale de descomponer 50 grados sobre el horizonte: cos(50) hacia atras y
// sin(50) hacia arriba. Es el rango en el que las referencias muestran el piso sin aplastar
// las fachadas. El vector se normaliza despues, asi que estos numeros ya salen unitarios.
// 42° en vez de 50°: con 50° la cámara se vuelve cenital y el mundo pierde horizonte. DQ III
// HD-2D se ve a ~40-45°, que es el rango que mantiene la profundidad del suelo sin aplastar
// las fachadas. Sigue dentro del assert del test (40-60°), que es lo que protege el contrato.
export const CAMERA_PITCH_DEGREES = 42;

const PITCH_RADIANS = (CAMERA_PITCH_DEGREES * Math.PI) / 180;

export const VIEW_OFFSET_COMPONENTS = Object.freeze({
  backward: -Math.cos(PITCH_RADIANS),
  right: 0,
  up: Math.sin(PITCH_RADIANS),
});

export interface ViewOffsetComponents {
  readonly backward: number;
  readonly right: number;
  readonly up: number;
}

export function viewOffsetFromComponents(components: ViewOffsetComponents): THREE.Vector3 {
  return CAMERA_FORWARD.clone()
    .multiplyScalar(components.backward)
    .addScaledVector(CAMERA_RIGHT, components.right)
    .addScaledVector(CAMERA_UP, components.up)
    .normalize();
}

export const CAMERA_VIEW_OFFSET = viewOffsetFromComponents(VIEW_OFFSET_COMPONENTS);

/**
 * Devuelve el vector de offset world para un anchor: la cámara se coloca a `distance`
 * del focus siguiendo este vector, así que la cámara queda "detrás y arriba" del focus
 * en el frame del anchor. `right` siempre vale 0 — la cámara HD-2D es frontal, no lateral.
 *
 * El cálculo es: `(-backward * forward + up * world_up)` normalizado. Para anchors con
 * `forward = CAMERA_FORWARD (+x)`, el resultado coincide con `viewOffsetFromComponents`
 * porque `CAMERA_RIGHT = cross(forward, up) = (0, 0, 1)`. Para anchors con otra
 * `forward` (Norte, Sur, Oeste, diagonal), el resultado rota con el frame.
 */
export function viewOffsetForAnchor(
  anchor: Pick<AuthorCameraAnchor, 'forward'>,
  pitchDegrees: number = CAMERA_PITCH_DEGREES,
): THREE.Vector3 {
  const pitchRad = (pitchDegrees * Math.PI) / 180;
  const backward = -Math.cos(pitchRad);
  const up = Math.sin(pitchRad);
  return anchor.forward.clone()
    .multiplyScalar(backward)
    .addScaledVector(CAMERA_UP, up)
    .normalize();
}

/** Eje "right" del frame de un anchor: perpendicular a forward y a world_up. */
export function rightVecForAnchor(anchor: Pick<AuthorCameraAnchor, 'forward'>): THREE.Vector3 {
  return new THREE.Vector3().crossVectors(anchor.forward, CAMERA_UP).normalize();
}

// C3 abre un poco el angulo para que la Puerta no tape el Manantial que hay detras. Sigue
// siendo frontal —`right` en 0— porque romper la simetria en una sola camara se lee como un
// error de montaje al cruzar el umbral, no como intencion. 38° está por debajo del default
// (42°): la Puerta-Manantial necesita ver la fuente detrás del muro, no el techo.
export const C3_PITCH_DEGREES = 38;

const C3_PITCH_RADIANS = (C3_PITCH_DEGREES * Math.PI) / 180;

export const C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS = Object.freeze({
  backward: -Math.cos(C3_PITCH_RADIANS),
  right: 0,
  up: Math.sin(C3_PITCH_RADIANS),
});

export const C3_QUASI_ORTHOGRAPHIC_VIEW_OFFSET = viewOffsetFromComponents(
  C3_QUASI_ORTHOGRAPHIC_VIEW_COMPONENTS,
);

function point(id: Parameters<typeof routeAnchor>[0]): THREE.Vector3 {
  const { position } = routeAnchor(id);
  return new THREE.Vector3(position.x, position.y, position.z);
}

function lerpRoute(from: Parameters<typeof routeAnchor>[0], to: Parameters<typeof routeAnchor>[0], alpha: number): THREE.Vector3 {
  return point(from).lerp(point(to), alpha);
}

export const CAMERA_ANCHORS: Readonly<Record<CameraAnchorId, AuthorCameraAnchor>> = {
  // C1: Portal + Plaza (origen del mundo). Foco en el spawn, mira hacia el pedestal.
  C1_PORTAL_PLAZA: {
    id: 'C1_PORTAL_PLAZA',
    focus: lerpRoute('R0_PORTAL_SPAWN', 'R1_PLAZA_ENTRY', 0.58).add(new THREE.Vector3(0, 0.95, 0)),
    forward: CAMERA_FORWARD,
    targetBounds: {
      right: { min: -3, max: 3 },
      forward: { min: -3, max: 4 },
      vertical: { min: 0.8, max: 1.8 },
    },
    protectedSubjects: ['player-feet', 'player-head', 'portal-landmark'],
    verticalSpan: { desktop: 13.5, mobile: 20 },
  },
  // C2: Taller (este de la Plaza, x = 9..22.5). Foco sobre el banco de Lumen.
  C2_TALLER: {
    id: 'C2_TALLER',
    focus: point('R3_TALLER_THRESHOLD').addScaledVector(CAMERA_FORWARD, 3).add(new THREE.Vector3(0, 1.10, 0)),
    forward: CAMERA_FORWARD,
    targetBounds: {
      right: { min: -2, max: 2 },
      forward: { min: -2, max: 2 },
      vertical: { min: 0.9, max: 1.6 },
    },
    protectedSubjects: ['player-feet', 'player-head', 'lumen-head', 'ohm-head', 'taller-measure', 'taller-response'],
    verticalSpan: { desktop: 9, mobile: 14.5 },
  },
  // C3: Puerta + Manantial (este, x = 22.5..38.5). Casi ortográfica: ver la fuente
  // detrás del muro. Foco en R5 (el socket Taller→Puerta) + offset hacia la pileta.
  C3_DOOR_SPRING: {
    id: 'C3_DOOR_SPRING',
    focus: lerpRoute('R5_DOOR_APPROACH', 'R7_SPRING_EDGE', 0.45).add(new THREE.Vector3(0, 1, 0)),
    forward: CAMERA_FORWARD,
    quasiOrthographicViewOffset: C3_QUASI_ORTHOGRAPHIC_VIEW_OFFSET,
    targetBounds: {
      right: { min: -3, max: 3 },
      forward: { min: -2.5, max: 3 },
      vertical: { min: 0.8, max: 1.8 },
    },
    protectedSubjects: ['player-feet', 'player-head', 'ohm-head', 'door-measure', 'spring-consequence'],
    verticalSpan: { desktop: 12, mobile: 18 },
  },
  // C4: Castillo (NORTE de la Plaza, z = -25..-7). Foco en la galería, mira hacia el
  // corazón. El forward real (N) lo da `R8_CASTLE_APPROACH → R13_CASTLE_HEART`.
  C4_CASTLE: {
    id: 'C4_CASTLE',
    focus: new THREE.Vector3(0, 1, -16),
    forward: new THREE.Vector3(0, 0, -1),
    targetBounds: {
      right: { min: -3, max: 3 },
      forward: { min: -3, max: 3 },
      vertical: { min: 0.8, max: 1.8 },
    },
    protectedSubjects: ['player-feet', 'player-head'],
    verticalSpan: { desktop: 13, mobile: 19 },
  },
  // C5: Forja (OESTE de la Plaza, x = -45..-9). Foco en la nave. Forward real (O).
  C5_FORGE: {
    id: 'C5_FORGE',
    focus: new THREE.Vector3(-25, 1, 0),
    forward: new THREE.Vector3(-1, 0, 0),
    targetBounds: {
      right: { min: -3, max: 3 },
      forward: { min: -3, max: 3 },
      vertical: { min: 0.8, max: 1.8 },
    },
    protectedSubjects: ['player-feet', 'player-head'],
    verticalSpan: { desktop: 13, mobile: 19 },
  },
  // C6: Terrazas (SUR de la Plaza, z = 7..37). La unidad trepa 4.5 m hacia el sur; el
  // foco se queda a la altura del suelo del patio bajo y la cámara sube al encuadrar.
  C6_TERRACES: {
    id: 'C6_TERRACES',
    focus: new THREE.Vector3(0, 1, 20),
    forward: new THREE.Vector3(0, 0, 1),
    targetBounds: {
      right: { min: -3, max: 3 },
      forward: { min: -3, max: 3 },
      vertical: { min: 0.8, max: 1.8 },
    },
    protectedSubjects: ['player-feet', 'player-head'],
    verticalSpan: { desktop: 14, mobile: 20 },
  },
  // C7: Faro (SURESTE, x = 21..56, z = 14..22). Forward mixto: la línea Terrazas→Faro
  // va por +x, no por +z. Lo derivamos del socket `R24_FARO_APPROACH → R28_FARO_LANTERN`.
  C7_LIGHTHOUSE: {
    id: 'C7_LIGHTHOUSE',
    focus: point('R25_FARO_HALL'),
    forward: point('R28_FARO_LANTERN').sub(point('R24_FARO_APPROACH')).normalize(),
    targetBounds: {
      right: { min: -3, max: 3 },
      forward: { min: -3, max: 3 },
      vertical: { min: 0.8, max: 1.8 },
    },
    protectedSubjects: ['player-feet', 'player-head'],
    verticalSpan: { desktop: 13, mobile: 19 },
  },
};

export const VIEWPORT_PROFILES: Readonly<Record<ViewportProfileId, ViewportProfile>> = {
  'desktop-1440x900': {
    id: 'desktop-1440x900',
    width: 1440,
    height: 900,
    maxDpr: 2,
    safeRect: { minX: 0.08, maxX: 0.92, minY: 0.08, maxY: 0.88 },
  },
  'mobile-390x844': {
    id: 'mobile-390x844',
    width: 390,
    height: 844,
    maxDpr: 1.5,
    safeRect: { minX: 0.08, maxX: 0.92, minY: 0.08, maxY: 0.70 },
  },
};

export function verticalSpan(anchor: AuthorCameraAnchor, viewport: ViewportProfile, zoomFactor = 1): number {
  const base = viewport.id === 'mobile-390x844' ? anchor.verticalSpan.mobile : anchor.verticalSpan.desktop;
  return base * THREE.MathUtils.clamp(zoomFactor, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX);
}

export function cameraDistanceForSpan(span: number): number {
  return span / (2 * Math.tan(THREE.MathUtils.degToRad(ORTHOGRAPHIC_MATCH_HALF_ANGLE_DEGREES)));
}

/**
 * Zona muerta de seguimiento, expresada como fraccion del alto visible (`verticalSpan`).
 * Al escalar con el encuadre, la misma banda se percibe igual en desktop y en mobile:
 * el jugador recorre casi un tercio del alto visible antes de que la camara reaccione.
 * Los ejes usan la base ortonormal del anclaje (CAMERA_RIGHT / anchor.forward / mundo Y).
 */
export const CAMERA_FOLLOW_DEAD_ZONE = Object.freeze({
  rightFraction: 0.16,
  forwardFraction: 0.10,
  verticalFraction: 0.04,
});

export interface FollowDeadZoneExtents {
  readonly right: number;
  readonly forward: number;
  readonly vertical: number;
}

/** Semiejes en metros de la zona muerta para un alto visible dado. */
export function followDeadZone(span: number): FollowDeadZoneExtents {
  return {
    right: span * CAMERA_FOLLOW_DEAD_ZONE.rightFraction,
    forward: span * CAMERA_FOLLOW_DEAD_ZONE.forwardFraction,
    vertical: span * CAMERA_FOLLOW_DEAD_ZONE.verticalFraction,
  };
}

/** Excedente firmado fuera de la banda; 0 cuando el valor esta dentro. */
export function deadZoneExcess(value: number, halfExtent: number): number {
  if (value > halfExtent) return value - halfExtent;
  if (value < -halfExtent) return value + halfExtent;
  return 0;
}

export function clampTargetToAnchor(target: Readonly<THREE.Vector3>, anchor: AuthorCameraAnchor): THREE.Vector3 {
  const relative = new THREE.Vector3().subVectors(target, anchor.focus);
  const right = rightVecForAnchor(anchor);
  const forward = anchor.forward;
  const rightAmount = THREE.MathUtils.clamp(relative.dot(right), anchor.targetBounds.right.min, anchor.targetBounds.right.max);
  const forwardAmount = THREE.MathUtils.clamp(relative.dot(forward), anchor.targetBounds.forward.min, anchor.targetBounds.forward.max);
  const worldY = THREE.MathUtils.clamp(target.y, anchor.targetBounds.vertical.min, anchor.targetBounds.vertical.max);
  return new THREE.Vector3(anchor.focus.x, worldY, anchor.focus.z)
    .addScaledVector(right, rightAmount)
    .addScaledVector(forward, forwardAmount);
}

export function createCamera(
  variant: CameraVariant,
  anchor: AuthorCameraAnchor,
  viewport: ViewportProfile,
): THREE.OrthographicCamera | THREE.PerspectiveCamera {
  const aspect = viewport.width / viewport.height;
  const span = verticalSpan(anchor, viewport);
  if (variant === 'quasi-orthographic') {
    const camera = new THREE.OrthographicCamera(
      -span * aspect / 2,
      span * aspect / 2,
      span / 2,
      -span / 2,
      CAMERA_NEAR_METERS,
      CAMERA_FAR_METERS,
    );
    camera.name = 'CAMERA_QUASI_ORTHOGRAPHIC';
    return camera;
  }
  const camera = new THREE.PerspectiveCamera(
    SOFT_PERSPECTIVE_FOV_Y_DEGREES,
    aspect,
    CAMERA_NEAR_METERS,
    CAMERA_FAR_METERS,
  );
  camera.name = 'CAMERA_SOFT_PERSPECTIVE';
  return camera;
}
