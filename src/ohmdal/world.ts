// Mundo HD-2D de Ohmdal como fábrica montable.
//
// Construye todo dentro del contenedor que recibe y devuelve un handle con ciclo de vida,
// que es lo que `RuntimeHost` necesita para montarlo bajo demanda.
import * as THREE from 'three';
import { createOhmdalPostFx } from './postfx.ts';
import { createOhmdalAtmosphere } from './atmosphere.ts';
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
import { createStudentActor } from './integration/spriteActors.ts';
import { createU1Cast } from './content/u1Cast.ts';
import { VS_EVIDENCE_BY_ANCHOR, anchorById, thingOf, type BenchId, type U1Anchor } from './content/u1Anchors.ts';
import { createOhmPedestalWorldBench } from './ohmPedestalBench.ts';
import { playAwakening, type AwakeningHandle } from './awakening.ts';
import {
  createPlazaObservation,
  hasObserved,
  markObservation,
  observationComplete,
} from '../puzzles/plazaEvidenceModel.ts';
import { hooks, setFlag, state } from '../state.ts';
import { uiJustClosed, uiOpen } from '../ui/overlay.ts';
import { initDialog } from '../ui/dialog.ts';
import { createOhmdalUi } from './ui.ts';
import {
  createInputModel,
  parseBindings,
  DEFAULT_BINDINGS,
  type InputAction,
  type RebindResult,
} from './inputModel.ts';

export interface OhmdalWorld {
  /** Detiene el bucle de animación. La simulación queda intacta. */
  pause(): void;
  /** Reanuda el bucle sin salto de `dt`. */
  resume(): void;
  /** Estado determinista del mundo, igual que el del harness anterior. */
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
  castle: 'Castillo',
  forge: 'Forja',
  terraces: 'Terrazas',
  lighthouse: 'Faro',
} as const;

export function createOhmdalWorld(container: HTMLElement): OhmdalWorld {
  // Los diálogos del Arco I son los mismos que en `/jugar` y usan sus mismos controles.
  initDialog();
  const ui = createOhmdalUi(container);

  const renderer = new THREE.WebGLRenderer({
    // El antialias del contexto se apaga: con composer no hace nada, porque el mundo se dibuja
    // a un render target y no al canvas. El antialiasing real lo pone SMAA al final del pipeline.
    antialias: false,
    powerPreference: 'high-performance',
    // Sólo en desarrollo: sin esto `canvas.toDataURL()` devuelve negro y no se puede capturar
    // el encuadre para compararlo contra las referencias.
    preserveDrawingBuffer: import.meta.env.DEV,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // ACES comprime los altos en vez de recortarlos: sin esto el bloom sobre las velas y el
  // conducto de la Puerta se empasta en blanco puro y pierde el color de la llama.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Con composer, cada pasada resetea `renderer.info` por su cuenta y el presupuesto termina
  // midiendo el quad de la ultima pasada: 1 llamada, 1 triangulo. Reseteando a mano al abrir
  // el frame, los contadores acumulan escena mas post-procesado, que es el costo real.
  renderer.info.autoReset = false;
  ui.root.append(renderer.domElement);

  const scene = new THREE.Scene();
  // El fondo y la niebla son de la atmósfera, que se monta más abajo: un color plano detrás de
  // un diorama iluminado lo deja recortado contra el vacío.
  const blockout = createOhmdalBlockout(scene);
  const atmosphere = createOhmdalAtmosphere(scene);
  const occlusionController = new CameraOcclusionController(blockout.occlusionBindings);
  const student = createStudentActor();
  scene.add(student.root);

  // El reparto de la Unidad 1. Los diálogos, la visibilidad por flags y las consecuencias
  // salen de `src/jugar/rooms.ts`: acá sólo se dibujan y se resuelve a cuál se está mirando.
  const cast = createU1Cast((bench, anchor) => openWorldBench(bench, anchor));
  scene.add(cast.root);
  const ohm = cast.ohm;
  const PEDESTAL = anchorById('pedestal');

  /**
   * Los tres bancos de la Unidad 1 ocurren en el mundo cuando tienen sentido.
   *
   * `ohm` se juega en 3D: cinco huecos del anillo del pedestal se dibujan como puntos
   * luminosos sobre el suelo alrededor del pedestal; el jugador los cubre caminando hasta
   * ellos y pulsando la tecla de acción. La validación sale del mismo modelo que usa
   * `/jugar` (`PEDESTAL_RING`), así que las dos versiones cuentan la misma lección.
   *
   * `lumen` y `gate` siguen cayendo al banco modal de `/jugar` hasta que les toque. El
   * andamiaje queda declarado para no perderlos.
   */
  const ohmPedestalWorld = createOhmPedestalWorldBench({
    scene,
    pedestal: PEDESTAL.position,
    onSolved: () => {
      setFlag('ohmAwake');
      ohm.setState('idle', reducedMotion);
      closeOhmBench();
      cast.refresh();
      // El WOW moment: destello, chispas, cámara, música. Dura ~2.4 s y se
      // acopla al `update` del bucle principal. Dispone solo.
      if (!activeAwakening && !state.flags.ohmAwakeEverSeen) {
        setFlag('ohmAwakeEverSeen');
        activeAwakening = playAwakening({
          scene,
          camera: cameraController.camera,
          origin: new THREE.Vector3(PEDESTAL.position.x, 0.9, PEDESTAL.position.z),
          reducedMotion,
        });
      }
    },
  });
  let activeAwakening: AwakeningHandle | null = null;

  function openWorldBench(bench: BenchId, anchor: U1Anchor): void {
    if (bench === 'ohm') {
      if (state.flags.ohmAwake) {
        // Ya está despierto: el banco se cierra solo y se habla con él desde el pedestal.
        thingOf(anchor).onInteract();
        return;
      }
      if (ohmPedestalWorld.isOpen()) return;
      openOhmBench();
      return;
    }
    // Los otros dos bancos siguen en `/jugar` hasta que les toque. El texto y el resultado
    // son los mismos: lo que cambia es dónde se manipula, no qué se aprende (H3 / diseno-
    // bancos-ohm-lumen.md §1).
    thingOf(anchor).onInteract();
  }

  function openOhmBench(): void {
    setFlag('ohmBenchOpenedInWorld');
    ohmPedestalWorld.open();
  }

  function closeOhmBench(): void {
    ohmPedestalWorld.close();
  }

  /**
   * Estado del beat VS01 en el mundo HD-2D. Vive acá y no en `state.ts` porque es
   * **transversal** a las tres evidencias: el modelo es puro, pero el almacenamiento
   * concreto del progreso (qué observaciones se hicieron y en qué orden) le pertenece
   * a esta escena, no al save global.
   */
  let plazaObservations = createPlazaObservation();

  /** Si el anclaje activa cuenta como observación del beat VS01, la marca. */
  function maybeObserve(anchor: U1Anchor): void {
    const evidence = VS_EVIDENCE_BY_ANCHOR[anchor.id];
    if (!evidence) return;
    if (hasObserved(plazaObservations, evidence)) return;
    plazaObservations = markObservation(plazaObservations, evidence);
    if (observationComplete(plazaObservations)) {
      setFlag('plazaObservedComplete');
    }
  }

  /** El anclaje al alcance del jugador, o `null`. Lo recalcula cada cuadro. */
  let activeAnchor: U1Anchor | null = null;

  /** La primera tecla de acción, con nombre legible: el prompt tiene que decir la verdad. */
  function actionKeyLabel(): string {
    const [code] = inputModel.bindingsFor('action');
    if (!code) return 'Acción';
    return code === 'Space' ? 'Espacio' : code.replace(/^Key|^Digit/, '');
  }

  // E4 y E5: la Puerta abre y el Manantial vuelve a correr cuando `/jugar` marca `puertaDone`.
  // `abrirPuerta` (src/puzzles/puerta.ts) es quien pone la flag; acá sólo se lee y se dibuja.
  function syncPuertaCausality(): void {
    const open = state.flags.puertaDone;
    blockout.setDoorOpening(open ? 1 : 0);
    blockout.setSpringWaterState(open ? 'estable' : 'detenida');
  }

  // Un cambio de flags cambia quién está en la Plaza y cómo se ve cada prop. `/jugar` avisa
  // por este mismo hook; el mundo HD-2D se limita a registrarse.
  const previousRefresh = hooks.refresh;
  hooks.refresh = () => { cast.refresh(); syncPuertaCausality(); };
  syncPuertaCausality();

  const lumenRoot = new THREE.Group();
  lumenRoot.name = 'lumen_spatial_presence';
  // El sprite "lumen" del taller se para junto al banco, en su nuevo anchor
  // (`R4_LUMEN_STOP` ≈ x=14, z=0). El resto de los sprites de lumen se sirven desde
  // `cast` y siguen `u1Anchors.ts`.
  lumenRoot.position.set(14, 0, -0.4);
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
  for (const anchorId of ['R4_LUMEN_STOP', 'R6_DOOR_MEASURE'] as const) {
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
  // Si el usuario interactuó (movió al estudiante o presionó una tecla) antes del delay,
  // el auto-start del recorrido se cancela. Así el recorrido solo se inicia solo cuando
  // el usuario abre la página y se queda mirando — el caso en que más lo necesita.
  let userInteracted = false;
  let elapsedSeconds = 0;
  let currentHeading = 90;
  let moving = false;
  let diagnosis = createDiagnosisHarnessState();
  let diagnosisUnlocked = false;
  let currentAnchor: CameraAnchorId = 'C1_PORTAL_PLAZA';
  let lastBlockedIds = new Set<string>();
  /** Reusado cada cuadro: el bucle no puede permitirse un `Vector3` nuevo por actualización. */
  const atmosphereFocus = new THREE.Vector3();

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
    // Selector compartido: la misma funcion decide la ancla tanto en el cambio de
    // viewport como en el frame de update. Mantiene la cinematica del slice y del arco
    // largo bajo un mismo contrato: `selectCameraAnchor(current, x, z) -> siguiente`.
    // En la red con hub central, la Plaza reparte a las seis zonas alrededor, así que el
    // selector usa X para E/O y Z para N/S.
    const next: CameraAnchorId = selectCameraAnchor(currentAnchor, player.x, player.z);
    currentAnchor = next;
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
      userInteracted = true;
      autoRoute = false;
      ui.routeToggle.textContent = 'Recorrido automático';
    } else if (action === 'action' && !wasDown) {
      triggerAction();
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
      userInteracted = true;
      autoRoute = false;
    };
    const end = (): void => { inputModel.releaseAction(move); };
    moveButton.addEventListener('pointerdown', begin);
    moveButton.addEventListener('pointerup', end);
    moveButton.addEventListener('pointercancel', end);
  }
  const actionTap = (): void => { triggerAction(); };
  ui.actionButton.addEventListener('click', actionTap);
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
    // Mientras hay un overlay abierto —diálogo, banco, Bitácora— el mundo no se mueve.
    // Es la misma regla que en `/jugar`, y el contador es el mismo.
    const intent = uiOpen() ? { x: 0, z: 0 } : autoRoute ? routeIntent() : inputModel.movementIntent();
    moving = Math.hypot(intent.x, intent.z) > 0.001;
    if (moving) {
      currentHeading = headingDegrees(intent.x, intent.z);
      player = moveOnGameplayPlane(player, intent, dt);
    }
    student.root.position.set(player.x, 0, player.z);
    student.update(currentHeading, moving, elapsedSeconds);
    diagnosisUnlocked = updateDiagnosisUnlock(diagnosisUnlocked, zoneForPosition(player));

    activeAnchor = cast.update(player.x, player.z, elapsedSeconds);
    ui.setPrompt(activeAnchor ? cast.promptFor(activeAnchor) : null, actionKeyLabel());

    const nextAnchor = selectCameraAnchor(currentAnchor, player.x, player.z);
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
    if (currentAnchor === 'C1_PORTAL_PLAZA') {
      // Ohm dejó de ser geometría de prueba y pasó a ser un actor de la Plaza, así que la
      // cámara tiene que protegerlo: es el sujeto del primer acto causal del slice.
      protectedSockets.push(
        new THREE.Vector3(PEDESTAL.position.x, 0.12, PEDESTAL.position.z),
        new THREE.Vector3(PEDESTAL.position.x, 1.9, PEDESTAL.position.z),
      );
    } else if (currentAnchor === 'C2_TALLER') {
      protectedSockets.push(
        new THREE.Vector3(lumenRoot.position.x, 0.2, lumenRoot.position.z),
        new THREE.Vector3(lumenRoot.position.x, 1.2, lumenRoot.position.z),
        new THREE.Vector3(5, 0.55, 1),
      );
    } else if (currentAnchor === 'C3_DOOR_SPRING') {
      protectedSockets.push(new THREE.Vector3(13.5, 0.55, -0.5));
    } else if (currentAnchor === 'C4_CASTLE') {
      // El corazón del Castillo protege el trono: la silueta distintiva del heart, a la
      // altura del pecho, para que el oclusor del fondo no se lo coma en cámara.
      protectedSockets.push(new THREE.Vector3(46.5, 0.3, 0), new THREE.Vector3(46.5, 2.0, 0));
    } else if (currentAnchor === 'C5_FORGE') {
      protectedSockets.push(new THREE.Vector3(76.5, 0.4, 0), new THREE.Vector3(76.5, 1.8, 0));
    } else if (currentAnchor === 'C6_TERRACES') {
      // El foco de la cámara está en y=2.5 (la unidad trepa): protegemos un punto a la
      // altura del mirador para que la silueta del mural no se desvanezca.
      protectedSockets.push(new THREE.Vector3(108.5, 1.5, 0), new THREE.Vector3(108.5, 3.5, 0));
    } else if (currentAnchor === 'C7_LIGHTHOUSE') {
      protectedSockets.push(new THREE.Vector3(149.5, 0.3, 0), new THREE.Vector3(149.5, 2.5, 0));
    }
    lastBlockedIds = findBlockedOccluderIds(
      cameraController.camera.position,
      protectedSockets,
      blockout.occlusionBindings.map(({ object }) => object),
    );
    occlusionController.update(lastBlockedIds, dt, reducedMotion);
    // La ventana de sombra viaja con el jugador: es lo que la mantiene chica y nítida en un
    // mundo de 38 metros.
    blockout.lighting.focusShadowOn(player.x, player.z);
    blockout.lighting.syncEmitterState();
    // El polvo se envuelve alrededor del jugador por la misma razón que la ventana de sombra:
    // es el centro del encuadre, y repartirlo por los 38 metros del mundo dejaría en cuadro una
    // décima parte de las motas.
    atmosphereFocus.set(player.x, 0, player.z);
    atmosphere.update(dt, atmosphereFocus);
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

  // El acabado fotografico va por composer, no por `renderer.render`: bloom, tilt-shift y
  // grado de color son la mitad del look HD-2D (ver `postfx.ts`).
  const postfx = createOhmdalPostFx(renderer, scene, cameraController.camera, {
    width: Math.max(1, window.innerWidth),
    height: Math.max(1, window.innerHeight),
    mobile: viewportProfile() === 'mobile-390x844',
  });

  let previous = performance.now();
  let frameRequest = 0;
  function frame(now: number): void {
    const dt = Math.min((now - previous) / 1000, 0.1);
    previous = now;
    updateGame(dt);
    if (activeAwakening) {
      const stillRunning = activeAwakening.update(dt);
      if (!stillRunning) activeAwakening = null;
    }
    renderer.info.reset();
    postfx.render();
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
      // `rebuildCamera` construye un controlador nuevo: sin esto el composer seguiria
      // renderizando la camara que acaba de morir.
      postfx.setCamera(cameraController.camera);
    } else {
      cameraController.setViewportSize(width, height);
    }
    postfx.setSize(width, height, nextProfile === 'mobile-390x844');
  }
  window.addEventListener('resize', resize);
  resize();

  ui.timeToggle.addEventListener('click', (event) => {
    timeVariant = timeVariant === 'afternoon' ? 'twilight' : 'afternoon';
    blockout.setTimeOfDay(timeVariant);
    atmosphere.setTimeOfDay(timeVariant);
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
  /**
   * La tecla de acción es una sola y el mundo manda: si hay algo al alcance, se interactúa
   * con eso. El paso de diagnóstico del harness queda como lo que siempre fue —una sonda de
   * medición— y sólo corre cuando no hay nada delante.
   */
  function triggerAction(): void {
    // El diálogo y los bancos avanzan con sus propios controles: el mundo no compite, ni
    // mientras están abiertos ni en la pulsación que acaba de cerrarlos.
    if (uiOpen() || uiJustClosed()) return;
    // Banco diegético de Ohm: si está abierto, la tecla de acción opera sobre los huecos
    // del pedestal antes de cualquier otra cosa. La cámara no dispara el diagnóstico.
    if (ohmPedestalWorld.isOpen()) {
      if (ohmPedestalWorld.tryActivateGap(player)) return;
      // Sin hueco al alcance y banco abierto: la tecla hace las veces de "salir del
      // primer plano" para no atrapar al jugador si decide abandonar.
      closeOhmBench();
      return;
    }
    if (activeAnchor) {
      maybeObserve(activeAnchor);
      cast.interact(activeAnchor);
      return;
    }
    triggerSafeDiagnosis();
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

  // Sonda de escena. Mirar una captura no alcanza para saber si un negro es sombra, es un
  // hueco en la geometría o es el fondo: hay que poder preguntarle al grafo qué hay y dónde.
  // Sólo en desarrollo, como el resto de las sondas.
  if (import.meta.env.DEV) {
    const scope = window as unknown as Record<string, unknown>;
    // Los numeros del acabado se aprueban mirando. Con esto se mueven en caliente:
    // `ohmdalTune({ bloomStrength: 0.8, vignette: 0.7 })`.
    scope.ohmdalTune = (values: Parameters<typeof postfx.tune>[0]): void => { postfx.tune(values); };
    scope.dumpOhmdalScene = (): string => {
      const box = new THREE.Box3();
      const size = new THREE.Vector3();
      const rows: string[] = [];
      scene.traverse((object) => {
        if (!(object as THREE.Mesh).isMesh && !(object as THREE.Sprite).isSprite) return;
        box.setFromObject(object);
        if (box.isEmpty()) return;
        box.getSize(size);
        const round = (value: number): number => Math.round(value * 100) / 100;
        rows.push(
          `${object.visible ? ' ' : '·'} ${object.name || '(sin nombre)'}  ` +
            `x[${round(box.min.x)}, ${round(box.max.x)}] ` +
            `y[${round(box.min.y)}, ${round(box.max.y)}] ` +
            `z[${round(box.min.z)}, ${round(box.max.z)}]`,
        );
      });
      return rows.join('\n');
    };
  }

  updateHud(1);
  startLoop();

  // El recorrido automático se inicia solo 3 segundos después de cargar, salvo que el
  // usuario haya movido al estudiante o presionado una tecla. Es el caso del usuario que
  // abre la página y se queda mirando: la Plaza sola en un vacío azul no cuenta la historia
  // del arco, y la R la cuenta. Cualquier interacción cancela el auto-start y deja al
  // usuario explorar a su ritmo.
  window.setTimeout(() => {
    if (!userInteracted && !autoRoute) {
      autoRoute = true;
      ui.routeToggle.textContent = 'Pausar recorrido';
    }
  }, 3000);

  return {
    pause: stopLoop,
    resume: startLoop,
    snapshot,
    advanceTime(milliseconds: number): void {
      const steps = Math.max(1, Math.ceil(milliseconds / (1000 / 60)));
      const dt = milliseconds / 1000 / steps;
      for (let index = 0; index < steps; index += 1) updateGame(dt);
      renderer.info.reset();
      postfx.render();
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
      ohmPedestalWorld.dispose();
      // El mundo no es dueño del hook: lo tomó prestado y lo devuelve como estaba.
      hooks.refresh = previousRefresh;
      cast.dispose();
      lumenRoot.removeFromParent();
      lumenBaseGeometry.dispose();
      lumenOrbGeometry.dispose();
      lumenBaseMaterial.dispose();
      lumenOrbMaterial.dispose();
      markerGroup.removeFromParent();
      markerGeometry.dispose();
      markerMaterial.dispose();
      atmosphere.dispose();
      blockout.dispose();
      postfx.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      // Sin esto el contexto WebGL sobrevive al desmontaje y unos pocos ciclos
      // mount→destroy agotan el límite de contextos del navegador (ARC1-008).
      renderer.forceContextLoss();
      renderer.domElement.remove();
      ui.actionButton.removeEventListener('click', actionTap);
      ui.dispose();
    },
  };
}
