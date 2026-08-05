import * as THREE from 'three';
import {
  CAMERA_ANCHORS,
  CAMERA_RIGHT,
  CAMERA_TRANSITION_VOLUMES,
  CAMERA_VIEW_OFFSET,
  CAMERA_ZOOM_MAX,
  CAMERA_ZOOM_MIN,
  VIEWPORT_PROFILES,
  cameraDistanceForSpan,
  clampTargetToAnchor,
  createCamera,
  deadZoneExcess,
  followDeadZone,
  verticalSpan,
  type CameraAnchorId,
  type CameraVariant,
  type FollowDeadZoneExtents,
  type ViewportProfileId,
} from './cameraConfig.ts';

const POSITION_HALF_LIFE_SECONDS = 0.32;
const TARGET_HALF_LIFE_SECONDS = 0.16;

const TRANSITION_SECONDS: Readonly<Record<string, number>> = {
  'C1_PORTAL_PLAZA>C2_TALLER': 0.9,
  'C2_TALLER>C3_DOOR_SPRING': 1.1,
};

interface TransitionState {
  readonly duration: number;
  elapsed: number;
  readonly fromPosition: THREE.Vector3;
  readonly fromTarget: THREE.Vector3;
}
export interface CameraControllerOptions {
  readonly variant: CameraVariant;
  readonly viewport: ViewportProfileId;
  readonly initialAnchor?: CameraAnchorId;
  readonly reducedMotion?: boolean;
  /** Tamano real del canvas. Sin el, se usa el nominal del perfil hasta el primer resize. */
  readonly viewportSize?: { readonly width: number; readonly height: number };
}

export interface CameraControllerSnapshot {
  readonly variant: CameraVariant;
  readonly viewport: ViewportProfileId;
  readonly anchor: CameraAnchorId;
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly desiredPosition: readonly [number, number, number];
  readonly desiredTarget: readonly [number, number, number];
  readonly zoomFactor: number;
  readonly transitioning: boolean;
  readonly reducedMotion: boolean;
  readonly disposed: boolean;
  /** Alto visible en metros: el perfil manda, el resize nunca lo toca. */
  readonly visibleSpan: number;
  readonly aspect: number;
  readonly viewportSize: readonly [number, number];
  readonly followDeadZone: FollowDeadZoneExtents;
}

function smootherstep(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function smoothstep(value: number): number {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function dampingAlpha(dt: number, halfLife: number): number {
  return 1 - Math.exp(-Math.LN2 * Math.max(0, dt) / halfLife);
}

function tuple(vector: THREE.Vector3): readonly [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

/** Devuelve el tamano sólo si es utilizable; un canvas oculto reporta 0 y no debe proyectarse. */
function usableViewportSize(width?: number, height?: number): [number, number] | null {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if ((width as number) <= 0 || (height as number) <= 0) return null;
  return [width as number, height as number];
}

export class AuthorCameraController {
  readonly camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  private readonly variant: CameraVariant;
  private readonly viewportId: ViewportProfileId;
  private anchorId: CameraAnchorId;
  private readonly currentTarget = new THREE.Vector3();
  private readonly desiredTarget = new THREE.Vector3();
  private readonly desiredPosition = new THREE.Vector3();
  private transition: TransitionState | null = null;
  private zoomFactor = 1;
  private reducedMotion: boolean;
  private disposed = false;
  private viewportWidth: number;
  private viewportHeight: number;

  constructor(options: CameraControllerOptions) {
    this.variant = options.variant;
    this.viewportId = options.viewport;
    this.anchorId = options.initialAnchor ?? 'C1_PORTAL_PLAZA';
    this.reducedMotion = options.reducedMotion ?? false;
    const profile = VIEWPORT_PROFILES[this.viewportId];
    const size = usableViewportSize(options.viewportSize?.width, options.viewportSize?.height)
      ?? [profile.width, profile.height];
    this.viewportWidth = size[0];
    this.viewportHeight = size[1];
    const anchor = CAMERA_ANCHORS[this.anchorId];
    this.camera = createCamera(this.variant, anchor, profile);
    this.desiredTarget.copy(anchor.focus);
    this.currentTarget.copy(anchor.focus);
    this.recomputeDesiredPosition();
    this.camera.position.copy(this.desiredPosition);
    this.camera.lookAt(this.currentTarget);
  }

  private assertActive(): void {
    if (this.disposed) throw new Error('Camera controller is disposed');
  }

  /** Alto visible del perfil: sólo depende de anclaje, perfil y zoom, nunca del resize. */
  private visibleSpan(): number {
    return verticalSpan(CAMERA_ANCHORS[this.anchorId], VIEWPORT_PROFILES[this.viewportId], this.zoomFactor);
  }

  private aspect(): number {
    return this.viewportWidth / this.viewportHeight;
  }

  /**
   * La ortografica conserva `verticalSpan` y deriva `left/right` del aspect real: un viewport
   * angosto recorta a los lados y uno ancho revela mas, nunca estira. La perspectiva sólo
   * actualiza su `aspect`, aunque hoy no sea la variante promovida.
   */
  private applyProjection(): void {
    const span = this.visibleSpan();
    if (this.camera instanceof THREE.OrthographicCamera) {
      const halfHeight = span / 2;
      const halfWidth = halfHeight * this.aspect();
      this.camera.left = -halfWidth;
      this.camera.right = halfWidth;
      this.camera.top = halfHeight;
      this.camera.bottom = -halfHeight;
    } else {
      this.camera.aspect = this.aspect();
    }
    this.camera.updateProjectionMatrix();
  }

  private recomputeDesiredPosition(): void {
    const anchor = CAMERA_ANCHORS[this.anchorId];
    const distance = cameraDistanceForSpan(this.visibleSpan());
    const viewOffset = this.variant === 'quasi-orthographic'
      ? anchor.quasiOrthographicViewOffset ?? CAMERA_VIEW_OFFSET
      : CAMERA_VIEW_OFFSET;
    this.desiredPosition.copy(this.desiredTarget).addScaledVector(viewOffset, distance);
    this.applyProjection();
  }

  /**
   * Redimensiona con el tamano real disponible. Un tamano degenerado (0 o no finito, tipico de
   * un canvas oculto) se ignora para no destruir la proyeccion vigente.
   */
  setViewportSize(width: number, height: number): void {
    this.assertActive();
    const size = usableViewportSize(width, height);
    if (!size) return;
    [this.viewportWidth, this.viewportHeight] = size;
    this.applyProjection();
  }

  setReducedMotion(enabled: boolean): void {
    this.assertActive();
    this.reducedMotion = enabled;
    if (enabled && this.transition) this.snapToDesired();
  }

  setZoomFactor(value: number): void {
    this.assertActive();
    this.zoomFactor = THREE.MathUtils.clamp(value, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX);
    this.recomputeDesiredPosition();
    if (this.reducedMotion) this.snapToDesired();
  }

  setLookTarget(target: Readonly<THREE.Vector3>): void {
    this.assertActive();
    this.desiredTarget.copy(clampTargetToAnchor(target, CAMERA_ANCHORS[this.anchorId]));
    this.recomputeDesiredPosition();
    if (this.reducedMotion) this.snapToDesired();
  }

  /** Semiejes vigentes de la zona muerta, en metros. */
  followDeadZone(): FollowDeadZoneExtents {
    return followDeadZone(this.visibleSpan());
  }

  /**
   * Seguimiento jugable: mientras el sujeto permanece dentro de la zona muerta el encuadre no
   * cambia; al salir, el objetivo se desplaza lo minimo para dejarlo justo sobre el borde y
   * despues se recorta con los bounds del anclaje. `setLookTarget` sigue disponible para
   * encuadre autoral directo, que ignora la zona muerta a proposito.
   */
  followSubject(subject: Readonly<THREE.Vector3>): void {
    this.assertActive();
    const anchor = CAMERA_ANCHORS[this.anchorId];
    const zone = this.followDeadZone();
    const relative = new THREE.Vector3().subVectors(subject, this.desiredTarget);
    const rightExcess = deadZoneExcess(relative.dot(CAMERA_RIGHT), zone.right);
    const forwardExcess = deadZoneExcess(relative.dot(anchor.forward), zone.forward);
    const verticalExcess = deadZoneExcess(relative.y, zone.vertical);
    if (rightExcess === 0 && forwardExcess === 0 && verticalExcess === 0) return;
    const corrected = this.desiredTarget.clone()
      .addScaledVector(CAMERA_RIGHT, rightExcess)
      .addScaledVector(anchor.forward, forwardExcess);
    corrected.y += verticalExcess;
    this.setLookTarget(corrected);
  }

  setAnchor(nextAnchor: CameraAnchorId): void {
    this.assertActive();
    if (nextAnchor === this.anchorId) return;
    const previous = this.anchorId;
    this.anchorId = nextAnchor;
    this.desiredTarget.copy(CAMERA_ANCHORS[nextAnchor].focus);
    this.recomputeDesiredPosition();
    if (this.reducedMotion) {
      this.snapToDesired();
      return;
    }
    const forwardKey = `${previous}>${nextAnchor}`;
    const reverseKey = `${nextAnchor}>${previous}`;
    this.transition = {
      duration: TRANSITION_SECONDS[forwardKey] ?? TRANSITION_SECONDS[reverseKey] ?? 0.9,
      elapsed: 0,
      fromPosition: this.camera.position.clone(),
      fromTarget: this.currentTarget.clone(),
    };
  }

  private snapToDesired(): void {
    this.transition = null;
    this.camera.position.copy(this.desiredPosition);
    this.currentTarget.copy(this.desiredTarget);
    this.camera.lookAt(this.currentTarget);
  }

  update(dtSeconds: number): void {
    this.assertActive();
    const dt = Math.min(Math.max(dtSeconds, 0), 0.1);
    if (this.transition) {
      this.transition.elapsed += dt;
      const progress = Math.min(1, this.transition.elapsed / this.transition.duration);
      this.camera.position.lerpVectors(this.transition.fromPosition, this.desiredPosition, smootherstep(progress));
      this.currentTarget.lerpVectors(this.transition.fromTarget, this.desiredTarget, smoothstep(progress));
      if (progress >= 1) this.transition = null;
    } else {
      this.camera.position.lerp(this.desiredPosition, dampingAlpha(dt, POSITION_HALF_LIFE_SECONDS));
      this.currentTarget.lerp(this.desiredTarget, dampingAlpha(dt, TARGET_HALF_LIFE_SECONDS));
    }
    this.camera.lookAt(this.currentTarget);
  }

  snapshot(): CameraControllerSnapshot {
    return {
      variant: this.variant,
      viewport: this.viewportId,
      anchor: this.anchorId,
      position: tuple(this.camera.position),
      target: tuple(this.currentTarget),
      desiredPosition: tuple(this.desiredPosition),
      desiredTarget: tuple(this.desiredTarget),
      zoomFactor: this.zoomFactor,
      transitioning: this.transition !== null,
      reducedMotion: this.reducedMotion,
      disposed: this.disposed,
      visibleSpan: this.visibleSpan(),
      aspect: this.aspect(),
      viewportSize: [this.viewportWidth, this.viewportHeight],
      followDeadZone: this.followDeadZone(),
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.transition = null;
    this.camera.clear();
    this.disposed = true;
  }
}

/** Seleccion por volumen con histeresis; nunca depende del render ni del pathfinding. */
export function selectCameraAnchor(
  current: CameraAnchorId,
  playerX: number,
): CameraAnchorId {
  const workshop = CAMERA_TRANSITION_VOLUMES.tallerThreshold;
  const door = CAMERA_TRANSITION_VOLUMES.doorApproach;
  if (current === 'C1_PORTAL_PLAZA') {
    return playerX >= workshop.crossingX ? 'C2_TALLER' : current;
  }
  if (current === 'C2_TALLER') {
    if (playerX < workshop.crossingX - workshop.hysteresisMeters) return 'C1_PORTAL_PLAZA';
    if (playerX >= door.crossingX) return 'C3_DOOR_SPRING';
    return current;
  }
  return playerX < door.crossingX - door.hysteresisMeters ? 'C2_TALLER' : current;
}
