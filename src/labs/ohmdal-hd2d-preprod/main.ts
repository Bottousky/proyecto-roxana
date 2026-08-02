import * as THREE from 'three';
import {
  AuthorCameraController,
  CameraOcclusionController,
  ROUTE_ANCHORS,
  createOhmdalBlockout,
  moveOnGameplayPlane,
  readRendererInfo,
  findBlockedOccluderIds,
  selectCameraAnchor,
  type CameraAnchorId,
  type CameraVariant,
  type MetricPoint,
  type ViewportProfileId,
} from './architecture/index.ts';
import type { DirectionVariant, HarnessSnapshot, OhmVariant, TimeVariant } from './contracts.ts';
import {
  SAFE_DIAGNOSIS_SEQUENCE,
  advanceSafeDiagnosis,
  createDiagnosisHarnessState,
  headingDegrees,
  zoneForPosition,
} from './integration/harnessState.ts';
import { createOhmActor, createStudentActor } from './integration/spriteActors.ts';

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing harness element #${id}`);
  return element as T;
}

const container = requireElement<HTMLDivElement>('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202534);
const blockout = createOhmdalBlockout(scene);
const occlusionController = new CameraOcclusionController(blockout.occlusionBindings);
const student = createStudentActor();
scene.add(student.root);
const ohm = createOhmActor();
ohm.root.position.set(0.7, 0, -1.45);
scene.add(ohm.root);

const markerGeometry = new THREE.CylinderGeometry(0.14, 0.2, 0.42, 12);
const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xd6a84c, emissive: 0x382004 });
const markerGroup = new THREE.Group();
markerGroup.name = 'measurement_markers';
for (const anchorId of ['R6_TALLER_MEASURE', 'R8_DOOR_MEASURE'] as const) {
  const anchor = ROUTE_ANCHORS.find(({ id }) => id === anchorId);
  if (!anchor) throw new Error(`Missing measurement anchor ${anchorId}`);
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.name = `${anchorId}_MARKER`;
  marker.position.set(anchor.position.x, 0.21, anchor.position.z);
  marker.castShadow = true;
  markerGroup.add(marker);
}
scene.add(markerGroup);

let player: MetricPoint = { ...ROUTE_ANCHORS[0].position };
let directionVariant: DirectionVariant = 4;
let ohmVariant: OhmVariant = 'sprite';
let cameraVariant: CameraVariant = 'quasi-orthographic';
let timeVariant: TimeVariant = 'afternoon';
let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let autoRoute = false;
let routeIndex = 1;
let elapsedSeconds = 0;
let currentHeading = 90;
let moving = false;
let diagnosis = createDiagnosisHarnessState();
let currentAnchor: CameraAnchorId = 'C1_PORTAL_PLAZA';

function viewportProfile(): ViewportProfileId {
  return window.innerWidth <= 720 ? 'mobile-390x844' : 'desktop-1440x900';
}

let cameraController = new AuthorCameraController({
  variant: cameraVariant,
  viewport: viewportProfile(),
  initialAnchor: currentAnchor,
  reducedMotion,
});

function rebuildCamera(): void {
  cameraController.dispose();
  currentAnchor = player.x >= 9.5 ? 'C3_DOOR_SPRING' : player.x >= -3 ? 'C2_TALLER' : 'C1_PORTAL_PLAZA';
  cameraController = new AuthorCameraController({
    variant: cameraVariant,
    viewport: viewportProfile(),
    initialAnchor: currentAnchor,
    reducedMotion,
  });
  cameraController.setLookTarget(new THREE.Vector3(player.x, 1, player.z));
}

const pressed = new Set<string>();
const keyMap: Readonly<Record<string, string>> = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
};
window.addEventListener('keydown', (event) => {
  const mapped = keyMap[event.code];
  if (!mapped) return;
  event.preventDefault();
  pressed.add(mapped);
  autoRoute = false;
  requireElement<HTMLButtonElement>('route-toggle').textContent = 'Recorrido automático';
});
window.addEventListener('keyup', (event) => {
  const mapped = keyMap[event.code];
  if (mapped) pressed.delete(mapped);
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-move]')) {
  const move = button.dataset.move;
  if (!move) continue;
  const begin = (event: PointerEvent): void => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    pressed.add(move);
    autoRoute = false;
  };
  const end = (): void => { pressed.delete(move); };
  button.addEventListener('pointerdown', begin);
  button.addEventListener('pointerup', end);
  button.addEventListener('pointercancel', end);
}

function manualIntent(): { x: number; z: number } {
  return {
    x: Number(pressed.has('up')) - Number(pressed.has('down')),
    z: Number(pressed.has('right')) - Number(pressed.has('left')),
  };
}

function routeIntent(): { x: number; z: number } {
  const target = ROUTE_ANCHORS[routeIndex];
  if (!target) {
    autoRoute = false;
    requireElement<HTMLButtonElement>('route-toggle').textContent = 'Repetir recorrido';
    return { x: 0, z: 0 };
  }
  const dx = target.position.x - player.x;
  const dz = target.position.z - player.z;
  if (Math.hypot(dx, dz) < 0.12) {
    player = { ...target.position };
    routeIndex += 1;
    return routeIntent();
  }
  return { x: dx, z: dz };
}

function updateGame(dtSeconds: number): void {
  const dt = Math.min(Math.max(dtSeconds, 0), 0.05);
  elapsedSeconds += dt;
  const intent = autoRoute ? routeIntent() : manualIntent();
  moving = Math.hypot(intent.x, intent.z) > 0.001;
  if (moving) {
    currentHeading = headingDegrees(intent.x, intent.z);
    player = moveOnGameplayPlane(player, intent, dt);
  }
  student.root.position.set(player.x, 0, player.z);
  student.update(currentHeading, moving, elapsedSeconds);

  const nextAnchor = selectCameraAnchor(currentAnchor, player.x);
  if (nextAnchor !== currentAnchor) {
    currentAnchor = nextAnchor;
    cameraController.setAnchor(nextAnchor);
  }
  cameraController.setLookTarget(new THREE.Vector3(player.x, 1, player.z));
  cameraController.update(dt);
  const protectedSockets = [
    new THREE.Vector3(player.x, 0.08, player.z),
    new THREE.Vector3(player.x, 1.72, player.z),
  ];
  const blockedIds = findBlockedOccluderIds(
    cameraController.camera.position,
    protectedSockets,
    blockout.occlusionBindings.map(({ object }) => object),
  );
  occlusionController.update(blockedIds, dt, reducedMotion);
  blockout.lighting.syncEmitterState();
}

const zoneNames = {
  portal_plaza: 'Portal · Plaza',
  taller: 'Taller · Lumen',
  puerta_manantial: 'Puerta · Manantial',
} as const;

function snapshot(): HarnessSnapshot {
  const info = readRendererInfo(renderer);
  return {
    seed: 'ohmdal-hd2d-preprod-v1',
    player: { x: player.x, y: 0, z: player.z, headingDegrees: currentHeading },
    zone: zoneForPosition(player),
    camera: cameraVariant,
    directionVariant,
    ohmVariant,
    time: timeVariant,
    autoRoute,
    reducedMotion,
    diagnosis: diagnosis.state,
    renderer: {
      calls: info.calls,
      triangles: info.triangles,
      geometries: info.geometries,
      textures: info.textures,
    },
  };
}

let hudElapsed = 0;
function updateHud(dt: number): void {
  hudElapsed += dt;
  if (hudElapsed < 0.2) return;
  hudElapsed = 0;
  const state = snapshot();
  requireElement('zone-label').textContent = zoneNames[state.zone];
  requireElement('status-label').textContent = `${state.camera} · ${state.directionVariant} dir · Ohm ${state.ohmVariant} · ${state.time}`;
  requireElement('metrics-label').textContent = `${state.renderer.calls} llamadas · ${state.renderer.triangles} triángulos · ruta ${routeIndex}/${ROUTE_ANCHORS.length}`;
  const next = SAFE_DIAGNOSIS_SEQUENCE[diagnosis.nextIndex];
  requireElement('diagnosis-label').textContent = diagnosis.state.documented
    ? 'Evidencia verificada y documentada. La Puerta conserva la transferencia; la aventura sigue libre.'
    : `Estado: ${diagnosis.state.power}. Próxima acción: ${next ?? 'completo'}. Evidencias: ${diagnosis.state.evidence.join(', ') || 'ninguna'}.`;
}

let previous = performance.now();
let frameRequest = 0;
function frame(now: number): void {
  const dt = Math.min((now - previous) / 1000, 0.1);
  previous = now;
  updateGame(dt);
  renderer.render(scene, cameraController.camera);
  updateHud(dt);
  frameRequest = requestAnimationFrame(frame);
}

function resize(): void {
  const previousProfile = cameraController.snapshot().viewport;
  const nextProfile = viewportProfile();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, nextProfile === 'mobile-390x844' ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (previousProfile !== nextProfile) rebuildCamera();
}
window.addEventListener('resize', resize);
resize();

requireElement<HTMLSelectElement>('camera-variant').addEventListener('change', (event) => {
  cameraVariant = (event.currentTarget as HTMLSelectElement).value as CameraVariant;
  rebuildCamera();
});
requireElement<HTMLSelectElement>('direction-variant').addEventListener('change', (event) => {
  directionVariant = Number((event.currentTarget as HTMLSelectElement).value) as DirectionVariant;
  student.setDirectionVariant(directionVariant);
});
requireElement<HTMLSelectElement>('ohm-variant').addEventListener('change', (event) => {
  ohmVariant = (event.currentTarget as HTMLSelectElement).value as OhmVariant;
  ohm.setVariant(ohmVariant);
});
requireElement<HTMLButtonElement>('time-toggle').addEventListener('click', (event) => {
  timeVariant = timeVariant === 'afternoon' ? 'twilight' : 'afternoon';
  blockout.setTimeOfDay(timeVariant);
  scene.background = new THREE.Color(timeVariant === 'twilight' ? 0x151929 : 0x202534);
  (event.currentTarget as HTMLButtonElement).textContent = timeVariant === 'afternoon' ? 'Crepúsculo' : 'Tarde';
});
requireElement<HTMLButtonElement>('route-toggle').addEventListener('click', (event) => {
  if (routeIndex >= ROUTE_ANCHORS.length) {
    player = { ...ROUTE_ANCHORS[0].position };
    routeIndex = 1;
    rebuildCamera();
  }
  autoRoute = !autoRoute;
  (event.currentTarget as HTMLButtonElement).textContent = autoRoute ? 'Pausar recorrido' : 'Recorrido automático';
});
const reducedMotionInput = requireElement<HTMLInputElement>('reduced-motion');
reducedMotionInput.checked = reducedMotion;
reducedMotionInput.addEventListener('change', () => {
  reducedMotion = reducedMotionInput.checked;
  cameraController.setReducedMotion(reducedMotion);
  ohm.setState(diagnosis.state.verified ? 'measurement_valid' : 'idle', reducedMotion);
});
requireElement<HTMLButtonElement>('diagnosis-next').addEventListener('click', () => {
  diagnosis = advanceSafeDiagnosis(diagnosis);
  if (diagnosis.state.evidence.length > 0) ohm.setState('sensor_deployed', reducedMotion);
  if (diagnosis.state.verified) {
    ohm.setState('measurement_valid', reducedMotion);
    markerMaterial.emissive.setHex(0x1f7b72);
    markerMaterial.color.setHex(0x72e0d7);
  }
  updateHud(1);
});

window.render_game_to_text = () => JSON.stringify(snapshot(), null, 2);
window.advanceTime = (milliseconds: number) => {
  const steps = Math.max(1, Math.ceil(milliseconds / (1000 / 60)));
  const dt = milliseconds / 1000 / steps;
  for (let index = 0; index < steps; index += 1) updateGame(dt);
  renderer.render(scene, cameraController.camera);
  updateHud(1);
};

function dispose(): void {
  cancelAnimationFrame(frameRequest);
  window.removeEventListener('resize', resize);
  cameraController.dispose();
  occlusionController.dispose();
  student.dispose();
  ohm.dispose();
  markerGroup.removeFromParent();
  markerGeometry.dispose();
  markerMaterial.dispose();
  blockout.dispose();
  renderer.renderLists.dispose();
  renderer.dispose();
  renderer.domElement.remove();
}
window.addEventListener('beforeunload', dispose, { once: true });

updateHud(1);
frameRequest = requestAnimationFrame(frame);
