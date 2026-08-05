// Laboratorio HD-2D de Ohmdal como fábrica montable.
//
// Antes esto era el cuerpo de `main.ts`: se ejecutaba al importarse, leía identificadores
// del HTML de su propia página y no se podía desmontar. `ARC1-007` lo convierte en una
// función que construye todo dentro del contenedor que recibe y devuelve un handle con
// ciclo de vida, que es lo que `RuntimeHost` necesita para montarlo bajo demanda.
//
// La simulación no cambió: mismos umbrales, misma aritmética, mismos textos.
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
import type { HarnessSnapshot, TimeVariant } from './contracts.ts';
import {
  SAFE_DIAGNOSIS_SEQUENCE,
  advanceSafeDiagnosis,
  createDiagnosisHarnessState,
  headingDegrees,
  updateDiagnosisUnlock,
  zoneForPosition,
} from './integration/harnessState.ts';
import { createOhmActor, createStudentActor } from './integration/spriteActors.ts';
import { createLabUi } from './labUi.ts';
import {
  createInputModel,
  parseBindings,
  DEFAULT_BINDINGS,
  type InputAction,
  type RebindResult,
} from './inputModel.ts';

export interface OhmdalLab {
  /** Detiene el bucle de animación. La simulación queda intacta. */
  pause(): void;
  /** Reanuda el bucle sin salto de `dt`. */
  resume(): void;
  /** Estado determinista del laboratorio, igual que el del harness anterior. */
  snapshot(): HarnessSnapshot;
  /** Avanza la simulación en subpasos de 60 Hz y fuerza un render sincrónico. */
  advanceTime(milliseconds: number): void;
  /** Deja el contenedor vacío y libera GPU, listeners y recursos de three. */
  dispose(): void;
}

const ZONE_NAMES = {
  portal_plaza: 'Portal · Plaza',
  taller: 'Taller · Lumen',
  puerta_manantial: 'Puerta · Manantial',
} as const;

export function createOhmdalLab(container: HTMLElement): OhmdalLab {
  const ui = createLabUi(container);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  ui.root.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202534);
  const blockout = createOhmdalBlockout(scene);
  const occlusionController = new CameraOcclusionController(blockout.occlusionBindings);
  const student = createStudentActor();
  scene.add(student.root);
  const ohm = createOhmActor();
  ohm.root.position.set(0.7, 0, -1.45);
  scene.add(ohm.root);

  const lumenRoot = new THREE.Group();
  lumenRoot.name = 'lumen_spatial_presence';
  lumenRoot.position.set(-0.75, 0, -2.7);
  const lumenBaseGeometry = new THREE.CylinderGeometry(0.26, 0.34, 0.72, 10);
  const lumenOrbGeometry = new THREE.SphereGeometry(0.24, 12, 8);
  const lumenBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x635546, roughness: 0.82 });
  const lumenOrbMaterial = new THREE.MeshStandardMaterial({
    color: 0xe1b45a,
    emissive: 0x4b2708,
    emissiveIntensity: 0.7,
    roughness: 0.38,
  });
  const lumenBase = new THREE.Mesh(lumenBaseGeometry, lumenBaseMaterial);
  lumenBase.position.y = 0.36;
  lumenBase.castShadow = true;
  const lumenOrb = new THREE.Mesh(lumenOrbGeometry, lumenOrbMaterial);
  lumenOrb.name = 'lumen_indicator';
  lumenOrb.position.y = 0.94;
  lumenOrb.castShadow = true;
  lumenRoot.add(lumenBase, lumenOrb);
  scene.add(lumenRoot);

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
  const directionVariant = 4 as const;
  const ohmVariant = 'sprite' as const;
  const cameraVariant: CameraVariant = 'quasi-orthographic';
  let timeVariant: TimeVariant = 'afternoon';
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let autoRoute = false;
  let routeIndex = 1;
  let elapsedSeconds = 0;
  let currentHeading = 90;
  let moving = false;
  let diagnosis = createDiagnosisHarnessState();
  let diagnosisUnlocked = false;
  let currentAnchor: CameraAnchorId = 'C1_PORTAL_PLAZA';
  let lastBlockedIds = new Set<string>();

  function viewportProfile(): ViewportProfileId {
    return window.innerWidth <= 720 ? 'mobile-390x844' : 'desktop-1440x900';
  }

  let cameraController = new AuthorCameraController({
    variant: cameraVariant,
    viewport: viewportProfile(),
    viewportSize: { width: window.innerWidth, height: window.innerHeight },
    initialAnchor: currentAnchor,
    reducedMotion,
  });

  function rebuildCamera(): void {
    cameraController.dispose();
    currentAnchor = player.x >= 9.5 ? 'C3_DOOR_SPRING' : player.x >= -3 ? 'C2_TALLER' : 'C1_PORTAL_PLAZA';
    cameraController = new AuthorCameraController({
      variant: cameraVariant,
      viewport: viewportProfile(),
      viewportSize: { width: window.innerWidth, height: window.innerHeight },
      initialAnchor: currentAnchor,
      reducedMotion,
    });
    cameraController.setLookTarget(new THREE.Vector3(player.x, 1, player.z));
  }

  const PERSIST_KEY = 'roxana-lab-input-v1';

  function loadPersistedBindings(): Record<string, readonly string[]> | undefined {
    try {
      const parsed = parseBindings(window.localStorage.getItem(PERSIST_KEY));
      return parsed.fellBackToDefaults ? undefined : parsed.bindings;
    } catch {
      return undefined;
    }
  }

  const inputModel = createInputModel(loadPersistedBindings());
  let captureTarget: InputAction | null = null;

  const ACTIONS = Object.keys(DEFAULT_BINDINGS) as InputAction[];
  const ACTION_LABELS: Record<InputAction, string> = {
    up: 'Arriba',
    down: 'Abajo',
    left: 'Izquierda',
    right: 'Derecha',
    action: 'Acción',
    cancel: 'Cancelar',
  };

  function persistInput(): void {
    try {
      window.localStorage.setItem(PERSIST_KEY, inputModel.serialize());
    } catch {
      // localStorage bloqueado: la reasignación vale para la sesión, no sobrevive a la recarga.
    }
  }

  function reasonText(result: RebindResult): string {
    switch (result.reason) {
      case 'reserved-key':
        return 'Esa tecla es del navegador y no se puede reasignar.';
      case 'duplicate-binding':
        return `Esa tecla ya es de ${result.conflictsWith ? ACTION_LABELS[result.conflictsWith] : 'otra acción'}.`;
      case 'orphan-action':
        return 'Cada acción necesita al menos una tecla.';
      default:
        return 'No se pudo cambiar la tecla.';
    }
  }

  function renderKeys(): void {
    ui.keysRows.textContent = '';
    for (const action of ACTIONS) {
      const row = document.createElement('div');
      row.className = 'keys-row';
      const name = document.createElement('span');
      name.className = 'keys-action';
      name.textContent = ACTION_LABELS[action];
      const chips = document.createElement('div');
      chips.className = 'keys-chips';
      for (const code of inputModel.bindingsFor(action)) {
        const chip = document.createElement('span');
        chip.className = 'keys-chip';
        chip.textContent = code;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.setAttribute('aria-label', `Quitar ${code} de ${ACTION_LABELS[action]}`);
        remove.textContent = '×';
        remove.addEventListener('click', () => {
          const result = inputModel.unbind(action, code);
          if (result.ok) {
            persistInput();
            renderKeys();
            ui.setKeysStatus(`Tecla ${code} quitada de ${ACTION_LABELS[action]}.`);
          } else {
            ui.setKeysStatus(reasonText(result));
          }
        });
        chip.append(remove);
        chips.append(chip);
      }
      const change = document.createElement('button');
      change.type = 'button';
      change.setAttribute('aria-label', `Reasignar ${ACTION_LABELS[action]}`);
      change.textContent = 'Cambiar';
      change.addEventListener('click', () => {
        captureTarget = action;
        ui.setKeysStatus(`Apretá una tecla para ${ACTION_LABELS[action]}…`);
      });
      row.append(name, chips, change);
      ui.keysRows.append(row);
    }
  }

  function openKeys(): void {
    captureTarget = null;
    renderKeys();
    ui.setKeysOpen(true);
    ui.setKeysStatus('Elegí una acción y apretá «Cambiar» para reasignar la próxima tecla.');
  }

  function closeKeys(): void {
    captureTarget = null;
    ui.setKeysOpen(false);
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (ui.isKeysOpen()) {
      if (captureTarget !== null) {
        event.preventDefault();
        const target = captureTarget;
        captureTarget = null;
        const result = inputModel.rebind(target, event.code);
        renderKeys();
        if (result.ok) {
          persistInput();
          ui.setKeysStatus(`Tecla ${event.code} asignada a ${ACTION_LABELS[target]}.`);
        } else {
          ui.setKeysStatus(reasonText(result));
        }
        return;
      }
      if (inputModel.actionFor(event.code) === 'cancel') {
        event.preventDefault();
        closeKeys();
        return;
      }
    }
    const action = inputModel.actionFor(event.code);
    const wasDown = action !== null && inputModel.isDown(action);
    if (inputModel.press(event.code)) event.preventDefault();
    if (action === null) return;
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      autoRoute = false;
      ui.routeToggle.textContent = 'Recorrido automático';
    } else if (action === 'action' && !wasDown) {
      triggerSafeDiagnosis();
    }
  };
  const onKeyUp = (event: KeyboardEvent): void => {
    if (inputModel.release(event.code)) event.preventDefault();
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  for (const moveButton of ui.moveButtons) {
    const move = moveButton.dataset.move as InputAction | undefined;
    if (!move) continue;
    const begin = (event: PointerEvent): void => {
      event.preventDefault();
      moveButton.setPointerCapture(event.pointerId);
      inputModel.pressAction(move);
      autoRoute = false;
    };
    const end = (): void => { inputModel.releaseAction(move); };
    moveButton.addEventListener('pointerdown', begin);
    moveButton.addEventListener('pointerup', end);
    moveButton.addEventListener('pointercancel', end);
  }
  const actionBegin = (event: PointerEvent): void => {
    event.preventDefault();
    ui.actionButton.setPointerCapture(event.pointerId);
    inputModel.pressAction('action');
    triggerSafeDiagnosis();
  };
  const actionEnd = (): void => { inputModel.releaseAction('action'); };
  ui.actionButton.addEventListener('pointerdown', actionBegin);
  ui.actionButton.addEventListener('pointerup', actionEnd);
  ui.actionButton.addEventListener('pointercancel', actionEnd);

  function routeIntent(): { x: number; z: number } {
    const target = ROUTE_ANCHORS[routeIndex];
    if (!target) {
      autoRoute = false;
      ui.routeToggle.textContent = 'Repetir recorrido';
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
    const intent = autoRoute ? routeIntent() : inputModel.movementIntent();
    moving = Math.hypot(intent.x, intent.z) > 0.001;
    if (moving) {
      currentHeading = headingDegrees(intent.x, intent.z);
      player = moveOnGameplayPlane(player, intent, dt);
    }
    student.root.position.set(player.x, 0, player.z);
    student.update(currentHeading, moving, elapsedSeconds);
    diagnosisUnlocked = updateDiagnosisUnlock(diagnosisUnlocked, zoneForPosition(player));

    const nextAnchor = selectCameraAnchor(currentAnchor, player.x);
    if (nextAnchor !== currentAnchor) {
      currentAnchor = nextAnchor;
      cameraController.setAnchor(nextAnchor);
    }
    cameraController.followSubject(new THREE.Vector3(player.x, 1, player.z));
    cameraController.update(dt);
    const protectedSockets = [
      new THREE.Vector3(player.x, 0.08, player.z),
      new THREE.Vector3(player.x, 1.72, player.z),
    ];
    if (currentAnchor === 'C2_TALLER') {
      protectedSockets.push(
        new THREE.Vector3(ohm.root.position.x, 0.12, ohm.root.position.z),
        new THREE.Vector3(ohm.root.position.x, 1.05, ohm.root.position.z),
        new THREE.Vector3(lumenRoot.position.x, 0.2, lumenRoot.position.z),
        new THREE.Vector3(lumenRoot.position.x, 1.2, lumenRoot.position.z),
        new THREE.Vector3(5, 0.55, 1),
      );
    } else if (currentAnchor === 'C3_DOOR_SPRING') {
      protectedSockets.push(new THREE.Vector3(13.5, 0.55, -0.5));
    }
    lastBlockedIds = findBlockedOccluderIds(
      cameraController.camera.position,
      protectedSockets,
      blockout.occlusionBindings.map(({ object }) => object),
    );
    occlusionController.update(lastBlockedIds, dt, reducedMotion);
    blockout.lighting.syncEmitterState();
  }

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
      diagnosisUnlocked,
      renderer: {
        calls: info.calls,
        triangles: info.triangles,
        geometries: info.geometries,
        textures: info.textures,
      },
      occlusion: {
        blockedIds: [...lastBlockedIds].sort(),
        targets: occlusionController.diagnostics().targets.map(({ id, opacity }) => ({ id, opacity })),
      },
    };
  }

  let hudElapsed = 0;
  function updateHud(dt: number): void {
    hudElapsed += dt;
    if (hudElapsed < 0.2) return;
    hudElapsed = 0;
    const state = snapshot();
    ui.zoneLabel.textContent = ZONE_NAMES[state.zone];
    ui.statusLabel.textContent = `${state.camera} · ${state.directionVariant} dir · Ohm ${state.ohmVariant} · ${state.time}`;
    ui.metricsLabel.textContent = `${state.renderer.calls} llamadas · ${state.renderer.triangles} triángulos · ruta ${routeIndex}/${ROUTE_ANCHORS.length}`;
    const next = SAFE_DIAGNOSIS_SEQUENCE[diagnosis.nextIndex];
    ui.diagnosisNext.disabled = !diagnosisUnlocked || diagnosis.state.documented;
    ui.actionButton.disabled = ui.diagnosisNext.disabled;
    ui.diagnosisLabel.textContent = !diagnosisUnlocked
      ? 'Lumen está en el Taller. Visitá ese set para habilitar la experiencia; el recorrido permanece libre.'
      : diagnosis.state.documented
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

  function startLoop(): void {
    if (frameRequest) return;
    // Reanudar tras una pausa larga no puede producir un salto de simulación.
    previous = performance.now();
    frameRequest = requestAnimationFrame(frame);
  }

  function stopLoop(): void {
    if (!frameRequest) return;
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
  }

  function resize(): void {
    const previousProfile = cameraController.snapshot().viewport;
    const nextProfile = viewportProfile();
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, nextProfile === 'mobile-390x844' ? 1.5 : 2));
    renderer.setSize(width, height, false);
    if (previousProfile !== nextProfile) {
      rebuildCamera();
    } else {
      cameraController.setViewportSize(width, height);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  ui.timeToggle.addEventListener('click', (event) => {
    timeVariant = timeVariant === 'afternoon' ? 'twilight' : 'afternoon';
    blockout.setTimeOfDay(timeVariant);
    scene.background = new THREE.Color(timeVariant === 'twilight' ? 0x151929 : 0x202534);
    (event.currentTarget as HTMLButtonElement).textContent = timeVariant === 'afternoon' ? 'Crepúsculo' : 'Tarde';
  });
  ui.routeToggle.addEventListener('click', (event) => {
    if (routeIndex >= ROUTE_ANCHORS.length) {
      player = { ...ROUTE_ANCHORS[0].position };
      routeIndex = 1;
      rebuildCamera();
    }
    autoRoute = !autoRoute;
    (event.currentTarget as HTMLButtonElement).textContent = autoRoute ? 'Pausar recorrido' : 'Recorrido automático';
  });
  ui.reducedMotion.checked = reducedMotion;
  ui.reducedMotion.addEventListener('change', () => {
    reducedMotion = ui.reducedMotion.checked;
    cameraController.setReducedMotion(reducedMotion);
    ohm.setState(diagnosis.state.verified ? 'measurement_valid' : 'idle', reducedMotion);
  });
  function triggerSafeDiagnosis(): void {
    if (!diagnosisUnlocked || diagnosis.state.documented) return;
    diagnosis = advanceSafeDiagnosis(diagnosis);
    if (diagnosis.state.evidence.length > 0) {
      ohm.setState('sensor_deployed', reducedMotion);
      lumenOrbMaterial.emissive.setHex(0x69410b);
      lumenOrbMaterial.emissiveIntensity = 1.2;
    }
    if (diagnosis.state.verified) {
      ohm.setState('measurement_valid', reducedMotion);
      lumenOrbMaterial.color.setHex(0x8ee6d9);
      lumenOrbMaterial.emissive.setHex(0x1f7b72);
      markerMaterial.emissive.setHex(0x1f7b72);
      markerMaterial.color.setHex(0x72e0d7);
    }
    updateHud(1);
  }
  ui.diagnosisNext.addEventListener('click', () => { triggerSafeDiagnosis(); });
  ui.keysToggle.addEventListener('click', () => {
    if (ui.isKeysOpen()) {
      closeKeys();
    } else {
      openKeys();
    }
  });
  ui.keysClose.addEventListener('click', closeKeys);
  ui.keysReset.addEventListener('click', () => {
    inputModel.reset();
    persistInput();
    renderKeys();
    ui.setKeysStatus('Teclas restablecidas a los valores por defecto.');
  });

  updateHud(1);
  startLoop();

  return {
    pause: stopLoop,
    resume: startLoop,
    snapshot,
    advanceTime(milliseconds: number): void {
      const steps = Math.max(1, Math.ceil(milliseconds / (1000 / 60)));
      const dt = milliseconds / 1000 / steps;
      for (let index = 0; index < steps; index += 1) updateGame(dt);
      renderer.render(scene, cameraController.camera);
      updateHud(1);
    },
    dispose(): void {
      stopLoop();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      cameraController.dispose();
      occlusionController.dispose();
      student.dispose();
      ohm.dispose();
      lumenRoot.removeFromParent();
      lumenBaseGeometry.dispose();
      lumenOrbGeometry.dispose();
      lumenBaseMaterial.dispose();
      lumenOrbMaterial.dispose();
      markerGroup.removeFromParent();
      markerGeometry.dispose();
      markerMaterial.dispose();
      blockout.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      // Sin esto el contexto WebGL sobrevive al desmontaje y unos pocos ciclos
      // mount→destroy agotan el límite de contextos del navegador (ARC1-008).
      renderer.forceContextLoss();
      renderer.domElement.remove();
      ui.dispose();
    },
  };
}
