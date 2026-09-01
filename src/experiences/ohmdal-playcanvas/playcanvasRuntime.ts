import * as pc from 'playcanvas';
import { buildPlayCanvasOhmdalWorld, type PlayCanvasWorldElements } from './playcanvasWorld.ts';
import { PlazaAudioEngine } from '../ohmdal-plaza/audio/soundscape.ts';
import { createInitialCircuit, solveCircuit } from '../ohmdal-plaza/simulation/circuitSolver.ts';
import { GalvanoscopeTool } from '../ohmdal-plaza/tools/galvanoscope.ts';
import { BitacoraManager } from '../ohmdal-plaza/journal/bitacora.ts';
import { WorkbenchInspector } from '../ohmdal-plaza/inspect/workbench.ts';
import { DIALOGUE_DATABASE } from '../ohmdal-plaza/story/dialogueData.ts';
import type { CircuitState, DialogueLine, DialogueNode, ToolMode } from '../ohmdal-plaza/types.ts';
import type { PlazaUi, PlazaHandle } from '../ohmdal-plaza/plazaRuntime.ts';
import { announceCinematic } from '../../jugar/cinematics.ts';
import {
  OHMDAL_VISUAL_CAMERA_PRESETS,
  isSoftwareRenderer,
  percentile,
  type OhmdalVisualCameraName,
  type OhmdalVisualStateName,
  type RoxanaOhmdalCaptureShot,
  type OhmdalVisualCaptureShotName,
  type RoxanaVisualTestHooks,
} from './visualHarness.ts';
import { OMEGA_GATE_TUNING } from './omegaGateTuning.ts';
import { OhmdalZoneLifecycle } from './systems/zones/zoneLifecycle.ts';
import { OHMDAL_TRANSITION_ANCHORS, yawForAnchor, type SpawnAnchor } from './systems/navigation/ohmdalSpawnAnchors.ts';
import type { CollisionDiagnostic } from './systems/navigation/ohmdalNavigation.ts';
import { createManantialActivationVfx } from './world/manantial/manantialActivationVfx.ts';
import { OhmdalVfxSystem } from './systems/vfx/ohmdalVfxSystem.ts';
import { PEDESTAL_RING, readCircuit, toggleCover } from '../../puzzles/ohmModel.ts';
import {
  type Arc1GreyboxState,
  type CastleNetworkConfiguration,
  ARC1_ROUTE,
  calibrateLighthouse,
  configureCastleNetwork,
  createArc1GreyboxState,
  documentCastleNetwork,
  documentForgeTerraces,
  documentLighthouse,
  energizeCastleNetwork,
  energizeForgeTerraces,
  energizeLighthouse,
  energizeManantial,
  enterArc1Region,
  evaluateCastleNetwork,
  evaluateForgeTerraces,
  evaluateLighthouse,
  evaluateManantial,
  getArc1Progress,
  isArcComplete,
  isCastleRestored,
  isForgeTerracesRestored,
  isLighthouseRestored,
  isManantialRestored,
  measureCastleNetwork,
  measureForgeTerraces,
  measureLighthouse,
  measureManantial,
  openCastleGate,
  pullCampana,
  repairCastleNetwork,
  repairForgeTerraces,
  repairLighthouse,
  repairManantial,
  setForgeTerracesConductor,
  setForgeTerracesPriority,
  setForgeTerracesProtection,
  setManantialGate,
  snapshotArc1Greybox,
  synchronizeLighthouse,
} from './systems/campaign/arc1GreyboxModel.ts';

export type OhmdalStoryStep =
  | 'portal_arrived'
  | 'ohm_awakened'
  | 'edda_surprised'
  | 'invited_to_workshop'
  | 'inside_workshop'
  | 'tools_received'
  | 'returned_to_plaza'
  | 'circuit_solved'
  | 'gate_opened'
  | 'inside_manantial'
  | 'manantial_restored'
  | 'restored_plaza'
  | 'inside_castle'
  | 'castle_restored'
  | 'inside_forge_terraces'
  | 'forge_terraces_restored'
  | 'inside_lighthouse'
  | 'lighthouse_restored'
  | 'returning'
  | 'arc1_complete';

const CASTLE_PARALLEL_CONFIGURATION: CastleNetworkConfiguration = {
  topology: 'parallel',
  returnContinuity: true,
  branches: {
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
    'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
    'district-c': { wiring: 'parallel', priority: 'support', protectionRating: 2 },
  },
};

const CASTLE_MIXED_CONFIGURATION: CastleNetworkConfiguration = {
  topology: 'mixed',
  returnContinuity: true,
  branches: {
    'district-a': { wiring: 'parallel', priority: 'essential', protectionRating: 4 },
    'district-b': { wiring: 'parallel', priority: 'essential', protectionRating: 5 },
    'district-c': { wiring: 'series', priority: 'support', protectionRating: 2 },
  },
};

export function mountPlayCanvasOhmdal(host: HTMLElement, ui: PlazaUi): PlazaHandle {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  host.appendChild(canvas);

  const world: PlayCanvasWorldElements = buildPlayCanvasOhmdalWorld(canvas);
  const audio = new PlazaAudioEngine();
  let circuit: CircuitState = createInitialCircuit();
  const galvanoscope = new GalvanoscopeTool();
  const bitacora = new BitacoraManager();
  const workbench = new WorkbenchInspector();
  const zones = new OhmdalZoneLifecycle();
  const setZoneActive = (id: Parameters<typeof world.navigation.setZoneActive>[0], active: boolean, apply: () => void) => {
    world.navigation.setZoneActive(id, active);
    apply();
  };
  world.workshopInteriorRoot.enabled = false;
  zones.register({ id: 'plaza', setActive: (active) => setZoneActive('plaza', active, () => { world.plazaRoot.enabled = active; }) });
  zones.register({ id: 'workshop', setActive: (active) => setZoneActive('workshop', active, () => { world.workshopInteriorRoot.enabled = active; }) });
  // The existing mountain root is Plaza's accepted scenic shell. Future
  // Manantial payloads register behind this progression-gated load seam.
  zones.register({
    id: 'manantial',
    load: () => undefined,
    setActive: (active) => setZoneActive('manantial', active, () => {
      world.manantialGameplayRoot.enabled = active;
      world.turbineMesh.enabled = !active;
      world.manantialScenicTurbineRotor.enabled = !active;
    }),
  });
  zones.register({
    id: 'castle',
    setActive: (active) => setZoneActive('castle', active, () => { world.arc1Greybox.roots.castle.enabled = active; }),
  });
  zones.register({
    id: 'forge-terraces',
    setActive: (active) => setZoneActive('forge-terraces', active, () => { world.arc1Greybox.roots['forge-terraces'].enabled = active; }),
  });
  zones.register({
    id: 'lighthouse',
    setActive: (active) => setZoneActive('lighthouse', active, () => { world.arc1Greybox.roots.lighthouse.enabled = active; }),
  });
  void zones.initializePlaza();

  // State
  let currentMode: ToolMode = 'explore';
  let storyStep: OhmdalStoryStep = 'portal_arrived';
  let arc1State: Arc1GreyboxState = createArc1GreyboxState();
  let isOhmAwake = false;
  let hasJumperItem = false;
  let hasBrushItem = false;
  let activeDialogueNode: DialogueNode | null = null;
  let activeDialogueLineIndex = 0;
  let isToolEquipped = true;
  let isPointerLocked = false;
  let visualCamera: OhmdalVisualCameraName = 'active-play-desktop';
  let visualState: OhmdalVisualStateName = 'portal-arrival';
  let visualCaptureShot: OhmdalVisualCaptureShotName | null = null;
  let visualPaused = false;
  let reducedMotion = false;
  let ohmPuzzleCovered = new Set<string>();

  // Arrival Cinematic State & Persistence
  const INTRO_SEEN_KEY = 'ohmdal_intro_seen';
  function isIntroSeen(): boolean {
    try {
      return localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    } catch {
      return false;
    }
  }
  function markIntroSeen(): void {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {}
  }

  let isCinematicActive = false;
  let cinematicTime = 0;
  let lastCinematicTimestamp = performance.now();
  const CINEMATIC_DURATION = 2.4;

  function finishArrivalCinematic(): void {
    if (!isCinematicActive) return;
    isCinematicActive = false;
    markIntroSeen();
    ui.setCinematicOverlay?.(false);
    spawnAtAnchor(OHMDAL_TRANSITION_ANCHORS['portal-to-plaza'].anchor);
    startDialogue('intro_portal_edda');
  }

  const manantialActivationVfx = createManantialActivationVfx({
    generatorLight: world.manantialGeneratorLight,
    activationTrace: world.manantialActivationTrace,
    restoredOutputMarker: world.manantialRestoredOutputMarker,
    reducedMotion: () => reducedMotion,
    paused: () => visualPaused,
  });
  const vfx = new OhmdalVfxSystem({
    app: world.app,
    vfxRoot: world.vfxRoot,
    reducedMotion: () => reducedMotion,
    paused: () => visualPaused,
    isMobile: () => world.app.graphicsDevice.width <= 600,
  });
  let debugUiHidden = false;
  let postProcessingEnabled = true;
  let visualSeed = 1;
  let compactViewmodelLayout: boolean | null = null;
  const frameTimeSamples: number[] = [];

  // First-person Controls
  let yaw = 180;
  let pitch = 0;
  const playerPos = new pc.Vec3(0, 1.68, -8.0);
  const keys = { w: false, a: false, s: false, d: false };

  // Mouse Look
  const onMouseMove = (e: MouseEvent) => {
    if (!isPointerLocked || isCinematicActive) return;
    yaw -= e.movementX * 0.15;
    pitch -= e.movementY * 0.15;
    pitch = Math.max(-80, Math.min(80, pitch));

    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
  };

  const onPointerLockChange = () => {
    isPointerLocked = document.pointerLockElement === canvas;
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  // Key Handlers
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'ohm-puzzle-close') {
      currentMode = 'explore';
      ui.setOhmPuzzleView(false);
      return;
    }
    if (isCinematicActive) {
      if (k === ' ' || k === 'enter' || k === 'e' || k === 'f' || k === 'escape') {
        e.preventDefault();
        finishArrivalCinematic();
        return;
      }
    }
    if (k === 'w' || k === 'arrowup') keys.w = true;
    if (k === 's' || k === 'arrowdown') keys.s = true;
    if (k === 'a' || k === 'arrowleft') keys.a = true;
    if (k === 'd' || k === 'arrowright') keys.d = true;
    if (k === 'q') yaw += 7;
    if (k === 'r') yaw -= 7;

    if (k === 'e' || k === 'f' || k === 'enter' || k === ' ') {
      triggerInteraction();
    }
    if (k === 'm') {
      isToolEquipped = !isToolEquipped;
      world.viewmodelRoot.enabled = isToolEquipped;
      ui.showNotification(isToolEquipped ? 'Galvanoscopio equipado' : 'Galvanoscopio guardado');
    }
    if (k === 'tab') {
      e.preventDefault();
      toggleBitacora();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keys.w = false;
    if (k === 's' || k === 'arrowdown') keys.s = false;
    if (k === 'a' || k === 'arrowleft') keys.a = false;
    if (k === 'd' || k === 'arrowright') keys.d = false;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Semantic transition helper. Position and destination-facing direction live
  // in the anchor table; callers cannot accidentally memorize a target yaw.
  function spawnAtAnchor(anchor: SpawnAnchor): void {
    if (!world.navigation.isSpawnSafe(anchor.position)) {
      throw new Error(`Unsafe Ohmdal spawn anchor in ${anchor.zone}: ${anchor.position.join(',')}`);
    }
    const [x, y, z] = anchor.position;
    playerPos.set(x, y, z);
    world.playerEntity.setPosition(x, y, z);
    yaw = yawForAnchor(anchor);
    pitch = 0;
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(0, 0, 0);
  }

  function teleportPlayer(transitionId: keyof typeof OHMDAL_TRANSITION_ANCHORS): void {
    const transition = OHMDAL_TRANSITION_ANCHORS[transitionId];
    if (!transition) throw new Error(`Unknown Ohmdal transition anchor: ${transitionId}`);
    spawnAtAnchor(transition.anchor);
  }

  // Portal arrival is an actual destination anchor, including its facing.
  spawnAtAnchor(OHMDAL_TRANSITION_ANCHORS['portal-to-plaza'].anchor);

  function closeVisualOverlays(): void {
    if (isCinematicActive) {
      isCinematicActive = false;
      ui.setCinematicOverlay?.(false);
    }
    activeDialogueNode = null;
    activeDialogueLineIndex = 0;
    currentMode = 'explore';
    ui.setDialog(null, null);
    ui.setBitacoraView(false);
    ui.setWorkbenchView(false);
    ui.setPrompt(null);
  }

  function setVisualCamera(name: OhmdalVisualCameraName): void {
    const preset = OHMDAL_VISUAL_CAMERA_PRESETS[name];
    const [x, y, z] = preset.position;
    playerPos.set(x, y, z);
    yaw = preset.yaw;
    pitch = preset.pitch;
    world.playerEntity.setPosition(x, y, z);
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    visualCamera = name;
    visualCaptureShot = null;
  }

  function setVisualState(name: OhmdalVisualStateName): void {
    closeVisualOverlays();
    zones.deactivate('workshop');
    zones.deactivate('manantial');
    zones.deactivate('castle');
    zones.deactivate('forge-terraces');
    zones.deactivate('lighthouse');
    circuit = createInitialCircuit();
    arc1State = createArc1GreyboxState();
    isOhmAwake = false;
    storyStep = 'portal_arrived';
    world.copperJumper.enabled = false;
    world.corrosionMesh.enabled = true;
    world.ohmFilamentLight.light!.intensity = 0;
    world.relayLight.light!.intensity = 0.6;
    world.solenoidGate.setPosition(0, OMEGA_GATE_TUNING.closedY, 11.5);
    world.navigation.setSolidEnabled('plaza.omega-gate', true);
    world.navigation.setPortalOpen('plaza-to-manantial', false);
    world.gateLightLeft.light!.color = new pc.Color(1.0, 0.4, 0.2);
    world.gateLightRight.light!.color = new pc.Color(1.0, 0.4, 0.2);

    if (name === 'restored-plaza') {
      void zones.preload('manantial');
      isOhmAwake = true;
      storyStep = 'gate_opened';
      circuit.branches.b_ida_rele.state = 'closed';
      circuit.branches.b_brecha_retorno.state = 'closed';
      circuit.branches.b_brecha_a_oxido.state = 'closed';
      circuit.branches.b_brecha_a_oxido.resistance = 0.05;
      circuit = solveCircuit(circuit);
      world.copperJumper.enabled = true;
      world.corrosionMesh.enabled = false;
      world.ohmFilamentLight.light!.intensity = 2.8;
      world.relayLight.light!.intensity = 2.4;
      world.solenoidGate.setPosition(0, OMEGA_GATE_TUNING.openY, 11.5);
      world.navigation.setSolidEnabled('plaza.omega-gate', false);
      world.navigation.setPortalOpen('plaza-to-manantial', true);
      world.gateLightLeft.light!.color = new pc.Color(0.2, 1.0, 0.4);
      world.gateLightRight.light!.color = new pc.Color(0.2, 1.0, 0.4);
    }

    visualState = name;
    visualCaptureShot = null;
  }

  async function setVisualCaptureShot(shot: RoxanaOhmdalCaptureShot): Promise<void> {
    if (!shot.anchor) throw new Error(`Ohmdal authored capture shot needs an anchor: ${shot.id}`);
    if (![
      'workshop-exterior',
      'workshop-interior-tools',
      'galvanoscope-first-person',
      'manantial-approach',
      'hydro-central-wide',
      'sluice-gate-interaction',
      'generator-platform',
      'restored-manantial',
      'restored-plaza-wide',
      'bell-activation',
      'castle-gate-open',
      'castle-distribution-hall',
      'forge-core',
      'terraces-irrigation',
      'forge-terraces-overview',
      'lighthouse-approach',
      'lighthouse-lake-wide',
      'final-return-plaza',
      'arc1-final-pedestal',
    ].includes(shot.id)) {
      throw new Error(`Unknown Ohmdal authored capture shot: ${shot.id}`);
    }

    const isA4Shot = ['restored-plaza-wide', 'bell-activation', 'castle-gate-open', 'castle-distribution-hall'].includes(shot.id);
    const isA5Shot = ['forge-core', 'terraces-irrigation', 'forge-terraces-overview'].includes(shot.id);
    const isA6Shot = ['lighthouse-approach', 'lighthouse-lake-wide', 'final-return-plaza', 'arc1-final-pedestal'].includes(shot.id);
    if (isA4Shot || shot.id === 'final-return-plaza' || shot.id === 'arc1-final-pedestal') setVisualState('restored-plaza');
    else closeVisualOverlays();
    for (const zone of ['workshop', 'manantial', 'castle', 'forge-terraces', 'lighthouse'] as const) {
      zones.deactivate(zone);
    }
    await zones.activate('plaza');
    if (shot.world.zone === 'workshop') {
      await zones.activate('workshop');
      zones.deactivate('plaza');
    }
    if (shot.world.zone === 'manantial') {
      await zones.activate('manantial');
      zones.deactivate('plaza');
    }
    if (shot.world.zone === 'castle') {
      await zones.activate('castle');
      zones.deactivate('plaza');
    }
    if (shot.world.zone === 'forge-terraces' || isA5Shot) {
      await zones.activate('forge-terraces');
      zones.deactivate('plaza');
    }
    if (shot.world.zone === 'lighthouse') {
      await zones.activate('lighthouse');
      zones.deactivate('plaza');
    }

    visualSeed = shot.deterministic.seed;
    reducedMotion = shot.deterministic.reducedMotion;
    storyStep = shot.world.storyStep as OhmdalStoryStep;
    isToolEquipped = shot.world.tool === 'galvanoscope';
    world.viewmodelRoot.enabled = isToolEquipped;

    arc1State = createArc1GreyboxState();
    if (shot.world.zone === 'manantial' || isA4Shot || isA5Shot || isA6Shot) {
      arc1State = enterArc1Region(arc1State, 'manantial');
      const manantialState = shot.world.manantial;
      if (manantialState?.gateOpen || isA4Shot || isA5Shot || isA6Shot) arc1State = setManantialGate(arc1State, true);
      if (manantialState?.returnBridgeInstalled || isA4Shot || isA5Shot || isA6Shot) {
        arc1State = measureManantial(arc1State, 'generator');
        arc1State = repairManantial(arc1State);
      }
      if (manantialState?.excitationEnabled || isA4Shot || isA5Shot || isA6Shot) arc1State = energizeManantial(arc1State);
      if (manantialState?.restored || isA4Shot || isA5Shot || isA6Shot) arc1State = measureManantial(arc1State, 'load');
    }
    if (isA4Shot || isA5Shot || isA6Shot) {
      arc1State = enterArc1Region(arc1State, 'plaza');
      if ((shot.world.plaza?.bellPulls ?? 0) > 0 || shot.world.zone === 'castle' || isA5Shot || isA6Shot) arc1State = pullCampana(arc1State);
      if (shot.world.plaza?.castleGateOpened || shot.world.zone === 'castle' || isA5Shot || isA6Shot) arc1State = openCastleGate(arc1State);
      if (shot.world.zone === 'castle' || isA5Shot || isA6Shot) {
        arc1State = enterArc1Region(arc1State, 'castillo');
        if (shot.world.castle?.topology === 'parallel' || isA5Shot || isA6Shot) arc1State = configureCastleNetwork(arc1State, CASTLE_PARALLEL_CONFIGURATION);
        if (shot.world.castle?.topology === 'mixed') arc1State = configureCastleNetwork(arc1State, CASTLE_MIXED_CONFIGURATION);
        if (shot.world.castle?.energized || isA5Shot || isA6Shot) {
          arc1State = measureCastleNetwork(arc1State);
          arc1State = energizeCastleNetwork(arc1State);
          arc1State = documentCastleNetwork(arc1State);
        }
      }
    }
    if (isA5Shot || isA6Shot || shot.world.zone === 'forge-terraces') {
      arc1State = enterArc1Region(arc1State, 'forja');
      const ft = shot.world.forgeTerraces;
      const forgeAlloc = ft?.allocation?.forge ?? 5;
      const terracesAlloc = ft?.allocation?.terraces ?? 3;
      arc1State = setForgeTerracesPriority(arc1State, forgeAlloc >= terracesAlloc ? 'forge-priority' : 'terraces-priority');
      arc1State = setForgeTerracesConductor(arc1State, ft?.conductor ?? 'medium');
      arc1State = setForgeTerracesProtection(arc1State, 'forge', forgeAlloc);
      arc1State = setForgeTerracesProtection(arc1State, 'terraces', terracesAlloc);
      arc1State = measureForgeTerraces(arc1State);
      if (ft?.energized ?? true) {
        arc1State = energizeForgeTerraces(arc1State);
      }
      if (ft?.restored || isA6Shot) {
        arc1State = enterArc1Region(arc1State, 'terrazas');
        arc1State = documentForgeTerraces(arc1State);
      }
      if (ft?.protectiveTrip) {
        arc1State = { ...arc1State, forgeTerraces: { ...arc1State.forgeTerraces, protectiveTrip: true } };
      }
    }
    if (isA6Shot || shot.world.zone === 'lighthouse') {
      arc1State = enterArc1Region(arc1State, 'faro');
      const lh = shot.world.lighthouse;
      arc1State = measureLighthouse(arc1State);
      if (lh?.calibrated ?? (shot.id !== 'lighthouse-approach')) {
        arc1State = calibrateLighthouse(arc1State, { voltageTrim: 0, phaseOffset: 0 });
      }
      if (lh?.energized ?? (shot.id !== 'lighthouse-approach')) {
        arc1State = energizeLighthouse(arc1State);
        arc1State = synchronizeLighthouse(arc1State, 0);
        arc1State = synchronizeLighthouse(arc1State, 0);
      }
      if (lh?.restored ?? (shot.id !== 'lighthouse-approach')) {
        arc1State = documentLighthouse(arc1State);
      }
      if (shot.id === 'final-return-plaza') {
        arc1State = enterArc1Region(arc1State, 'plaza');
        arc1State = { ...arc1State, returnedToPlaza: true, finalReturnReached: true };
      }
      if (shot.id === 'arc1-final-pedestal') {
        arc1State = enterArc1Region(arc1State, 'plaza');
        arc1State = {
          ...arc1State,
          returnedToPlaza: true,
          finalReturnReached: true,
          visitedRegions: [...ARC1_ROUTE],
        };
      }
    }
    updateArc1WorldVisuals();

    const [x, y, z] = shot.anchor.position;
    playerPos.set(x, y, z);
    yaw = shot.anchor.yaw;
    pitch = shot.anchor.pitch;
    world.playerEntity.setPosition(x, y, z);
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    visualCaptureShot = shot.id;
  }

  function collectRenderCounts(): { meshes: number; materials: number; textures: number } {
    const meshes = new Set<pc.Mesh>();
    const materials = new Set<pc.Material>();
    const textures = new Set<pc.Texture>();
    const renderComponents = world.app.root.findComponents('render') as pc.RenderComponent[];

    for (const component of renderComponents) {
      for (const meshInstance of component.meshInstances ?? []) {
        meshes.add(meshInstance.mesh);
        materials.add(meshInstance.material);
        for (const value of Object.values(meshInstance.material)) {
          if (value instanceof pc.Texture) textures.add(value);
        }
      }
    }

    for (const asset of world.app.assets.list()) {
      if (asset.type === 'texture' && asset.resource instanceof pc.Texture) textures.add(asset.resource);
    }

    return { meshes: meshes.size, materials: materials.size, textures: textures.size };
  }

  function collectTransferredAssets(): { transferredMb: number; largestAssets: { name: string; transferredMb: number }[] } {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resources = entries
      .map((entry) => ({
        name: new URL(entry.name, window.location.href).pathname,
        transferredMb: entry.transferSize / (1024 * 1024),
      }))
      .filter((entry) => entry.transferredMb > 0)
      .sort((a, b) => b.transferredMb - a.transferredMb);
    return {
      transferredMb: resources.reduce((total, entry) => total + entry.transferredMb, 0),
      largestAssets: resources.slice(0, 5),
    };
  }

  function collectShadowCounts(): { lights: number; castingLights: number; castingRenderers: number } {
    const lights = world.app.root.findComponents('light') as pc.LightComponent[];
    const renders = world.app.root.findComponents('render') as pc.RenderComponent[];
    const isEnabled = (component: pc.Component) => component.enabled && component.entity.enabled;
    return {
      lights: lights.filter(isEnabled).length,
      castingLights: lights.filter((light) => isEnabled(light) && light.castShadows).length,
      castingRenderers: renders.filter((render) => isEnabled(render) && render.castShadows).length,
    };
  }

  const visualHooks: RoxanaVisualTestHooks = {
    seed(value) {
      visualSeed = value;
    },
    setState(name) {
      if (name !== 'portal-arrival' && name !== 'restored-plaza') throw new Error(`Unknown Ohmdal visual state: ${name}`);
      setVisualState(name);
    },
    setCamera(name) {
      if (!(name in OHMDAL_VISUAL_CAMERA_PRESETS)) throw new Error(`Unknown Ohmdal visual camera: ${name}`);
      setVisualCamera(name);
    },
    async setCaptureShot(shot) {
      await setVisualCaptureShot(shot);
    },
    setPausedForScreenshot(paused) {
      visualPaused = paused;
    },
    setReducedMotion(enabled) {
      reducedMotion = enabled;
      if (enabled && isCinematicActive) {
        finishArrivalCinematic();
      }
    },
    hideDebugUi(hidden) {
      debugUiHidden = hidden;
      document.documentElement.classList.toggle('roxana-visual-ui-hidden', hidden);
    },
    setPostProcessing(enabled) {
      postProcessingEnabled = enabled;
      world.cameraEntity.camera!.toneMapping = enabled ? pc.TONEMAP_ACES : pc.TONEMAP_LINEAR;
    },
    getDiagnostics() {
      const device = world.app.graphicsDevice as pc.GraphicsDevice & { unmaskedRenderer?: string; unmaskedVendor?: string };
      const renderer = device.unmaskedRenderer ?? null;
      const vendor = device.unmaskedVendor ?? null;
      const softwareRendered = isSoftwareRenderer(renderer);
      const counts = collectRenderCounts();
      const assets = collectTransferredAssets();
      const zoneSnapshot = zones.snapshot();
      const shadows = collectShadowCounts();
      const fpsSamples = frameTimeSamples.filter((ms) => ms > 0).map((ms) => 1000 / ms);
      return {
        browser: {
          renderer,
          vendor,
          deviceType: device.deviceType,
          softwareRendered,
        },
        performance: {
          fpsP50: percentile(fpsSamples, 0.5),
          fpsP10: percentile(fpsSamples, 0.1),
          frameTimeMsP95: percentile(frameTimeSamples, 0.95),
          note: softwareRendered ? 'Software renderer: FPS is informational and not a GPU benchmark.' : null,
        },
        render: {
          drawCalls: world.app.stats.drawCalls.total,
          triangles: world.app.stats.frame.triangles,
          meshesOrGeometries: counts.meshes,
          materials: counts.materials,
          textures: counts.textures,
        },
        assets,
        zones: {
          loaded: zoneSnapshot.filter((zone) => zone.loaded).map((zone) => zone.id),
          active: zoneSnapshot.filter((zone) => zone.active).map((zone) => zone.id),
        },
        navigation: world.navigation.diagnostics(0.4),
        shadows: {
          ...shadows,
          mobileMeaningfulLightLimit: 1,
        },
        harness: {
          camera: visualCamera,
          state: visualState,
          captureShot: visualCaptureShot,
          paused: visualPaused,
          reducedMotion,
          debugUiHidden,
          postProcessing: postProcessingEnabled,
          seed: visualSeed,
          randomSeedNote: 'No randomized scene systems are active; seed is a documented no-op.',
        },
      };
    },
    getCollisionDiagnostics(): CollisionDiagnostic {
      return world.navigation.diagnostics(0.4);
    },
    getPlaytestSnapshot() {
      const interactables = getActiveInteractables();
      const nearest = interactables
        .map((item) => ({ item, distance: playerPos.distance(item.pos) }))
        .filter(({ item, distance }) => distance <= item.radius)
        .sort((a, b) => a.distance - b.distance)[0]?.item.id ?? null;
      const galvanoscopeState = galvanoscope.getState();
      return {
        storyStep,
        mode: currentMode,
        position: [playerPos.x, playerPos.y, playerPos.z],
        yaw,
        ohmAwake: isOhmAwake,
        inventory: { jumper: hasJumperItem, brush: hasBrushItem },
        dialogue: activeDialogueNode
          ? {
              id: activeDialogueNode.id,
              lineIndex: activeDialogueLineIndex,
              lineCount: activeDialogueNode.lines.length,
              hasChoices: Boolean(activeDialogueNode.choices?.length),
            }
          : null,
        circuit: {
          gateOpen: circuit.gateOpen,
          relayEnergized: circuit.relayEnergized,
          relayClosed: circuit.branches.b_ida_rele.state === 'closed',
          jumperClosed: circuit.branches.b_brecha_retorno.state === 'closed',
          corrosionClosed: circuit.branches.b_brecha_a_oxido.state === 'closed',
          corrosionResistance: circuit.branches.b_brecha_a_oxido.resistance,
        },
        galvanoscope: {
          probeA: galvanoscopeState.probeA,
          probeB: galvanoscopeState.probeB,
          measuredVoltage: galvanoscopeState.measuredVoltage,
          measuredResistance: galvanoscopeState.measuredResistance,
          measuredCurrent: galvanoscopeState.measuredCurrent,
        },
        nearestInteractable: nearest,
        zones: zones.snapshot(),
        arc1: snapshotArc1Greybox(arc1State),
      };
    },
  };

  void world.ready.then(
    () => {
      window.__ROXANA_VISUAL_TEST_HOOKS__ = visualHooks;
    },
    (error: unknown) => {
      console.error('[Ohmdal] No se pudieron cargar todos los materiales del art pass.', error);
      window.__ROXANA_VISUAL_TEST_HOOKS__ = visualHooks;
    },
  );

  // Awakening Sequence for Ohm
  function triggerOhmAwakening(): void {
    if (isOhmAwake) return;
    isOhmAwake = true;
    storyStep = 'ohm_awakened';
    world.ohmFilamentLight.light!.intensity = 2.8;
    vfx.triggerConductorPulse([0, 1.2, -6.2], [0, 2.5, -6.2]);
    vfx.triggerTerminalArc([0, 1.4, -6.2], 1.2);
    audio.playDiscoveryChime();
    ui.showNotification('⚡ ¡Terminales de entrada acoplados! El filamento de Ohm se ilumina.');
    bitacora.unlock('despertar_ohm');

    setTimeout(() => {
      startDialogue('ohm_awakening_event');
    }, 500);
  }

  function openOhmInspection(): void {
    if (isOhmAwake) { startDialogue('ohm_awakening_event'); return; }
    currentMode = 'inspect'; document.exitPointerLock?.();
    const render = () => ui.setOhmPuzzleView(true, PEDESTAL_RING, readCircuit(PEDESTAL_RING, ohmPuzzleCovered), ohmPuzzleCovered, (id) => {
      ohmPuzzleCovered = new Set(toggleCover(PEDESTAL_RING, ohmPuzzleCovered, id));
      const reading = readCircuit(PEDESTAL_RING, ohmPuzzleCovered);
      audio.playSwitchClunk();
      if (reading.complete) { ui.setOhmPuzzleView(false); currentMode = 'explore'; triggerOhmAwakening(); }
      else render();
    });
    render();
  }

  function setEntityLightsEnabled(entity: pc.Entity, enabled: boolean): void {
    for (const light of entity.findComponents('light') as pc.LightComponent[]) {
      light.enabled = enabled;
    }
  }

  function showArc1Measurement(label: string, voltage: number, current: number, status: string): void {
    ui.setGalvanoscopeHud(
      true,
      voltage,
      current > 0 ? voltage / current : Number.POSITIVE_INFINITY,
      current,
      status,
      label,
      'retorno',
    );
    ui.showNotification(`${label}: ${voltage.toFixed(1)} V · ${current.toFixed(1)} A · ${status}`);
  }

  function updateArc1WorldVisuals(): void {
    const manantial = evaluateManantial(arc1State);
    manantialActivationVfx.setRestored(manantial.restored);
    vfx.setWaterMist('manantial', arc1State.manantial.gateOpen, [-4.2, 1.8, 20.5]);
    world.manantialIntakeGate.setLocalEulerAngles(0, 0, arc1State.manantial.gateOpen ? -55 : 0);
    world.manantialSluiceLeaf.setLocalPosition(-4.2, arc1State.manantial.gateOpen ? 4.15 : 2.45, 20.55);
    world.manantialDormantWater.enabled = !arc1State.manantial.gateOpen;
    world.manantialActiveWater.enabled = arc1State.manantial.gateOpen;
    world.manantialExciterBridge.setLocalPosition(4.2, arc1State.manantial.returnBridgeInstalled ? 1.25 : 1.55, 18.4);
    world.manantialOutputBreaker.setLocalEulerAngles(0, 0, arc1State.manantial.protectiveTrip ? 40 : -18);

    const castle = evaluateCastleNetwork(arc1State);
    const castleProgress = getArc1Progress(arc1State);
    const castleDeliveries = Object.values(castle.branchDelivery);
    world.arc1Greybox.castleServiceLights.forEach((marker, index) => {
      const enabled = arc1State.castle.energized && (castleDeliveries[index] ?? 0) > 0;
      marker.enabled = enabled;
      setEntityLightsEnabled(marker, enabled && index === 0);
    });
    const castleBranchIds = ['district-a', 'district-b', 'district-c'] as const;
    world.arc1Greybox.castleBranchIsolators.forEach((isolator, index) => {
      const wiring = arc1State.castle.branches[castleBranchIds[index]!].wiring;
      isolator.setLocalEulerAngles(0, 0, wiring === 'isolated' ? -58 : wiring === 'series' ? 32 : 0);
    });
    world.arc1Greybox.castleTripPin.setLocalPosition(0.72, arc1State.castle.protectiveTrip ? 0.92 : 1.12, -0.85);
    world.arc1Greybox.castleReturnLink.enabled = arc1State.castle.returnContinuity;
    world.arc1Greybox.castleEntranceGateRail.enabled = !castleProgress.castleGateOpen;
    world.navigation.setSolidEnabled('castle.entrance-gate', !castleProgress.castleGateOpen);
    world.navigation.setSolidEnabled('castle.exit-gate', !castle.restored);
    const castleRail = world.arc1Greybox.castleGate.findByName('CastleGateRail') as pc.Entity | null;
    if (castleRail) castleRail.enabled = !castle.restored;

    const forgeTerraces = evaluateForgeTerraces(arc1State);
    const forgeCore = world.arc1Greybox.forgeHeater.findByName('ForgeHeaterCore') as pc.Entity | null;
    if (forgeCore) forgeCore.enabled = forgeTerraces.restored || (arc1State.forgeTerraces.energized && arc1State.forgeTerraces.allocation.forge > 0);
    world.arc1Greybox.forgeProtectionLight.light!.enabled = arc1State.forgeTerraces.protectiveTrip;
    if (world.arc1Greybox.forgeTripPin) {
      world.arc1Greybox.forgeTripPin.setLocalPosition(0.85, arc1State.forgeTerraces.protectiveTrip ? 0.92 : 1.15, -0.86);
    }
    const waterActive = forgeTerraces.restored || (arc1State.forgeTerraces.energized && arc1State.forgeTerraces.allocation.terraces > 0);
    vfx.setWaterMist('terraces', waterActive, [114.0, 4.5, 10.0]);
    if (world.arc1Greybox.terracesWaterChannels) {
      for (const channel of world.arc1Greybox.terracesWaterChannels) {
        channel.enabled = waterActive;
      }
    }

    const lighthouse = evaluateLighthouse(arc1State);
    const lighthouseLamp = world.arc1Greybox.lighthouseBeacon.findByName('LighthouseBeaconLamp') as pc.Entity | null;
    if (lighthouseLamp) lighthouseLamp.enabled = lighthouse.restored;
    setEntityLightsEnabled(world.arc1Greybox.lighthouseBeacon, lighthouse.restored);
    world.arc1Greybox.lighthouseSignal.enabled = lighthouse.restored;

    // Environmental soundscape updates based on active physical systems
    audio.setWaterFlow(arc1State.manantial.gateOpen ? (manantial.restored ? 1.0 : 0.6) : 0);
    audio.setTurbineHum(arc1State.manantial.gateOpen ? 0.9 : 0);
    const loadFactor = (arc1State.castle.energized ? 0.35 : 0) + (arc1State.forgeTerraces.energized ? 0.35 : 0) + (arc1State.lighthouse.energized ? 0.3 : 0);
    audio.updateElectricalHum(loadFactor);
  }

  // Proximity Interactables
  interface Interactable {
    id: string;
    label: string;
    pos: pc.Vec3;
    radius: number;
    action: () => void;
  }

  function getActiveInteractables(): Interactable[] {
    const list: Interactable[] = [];
    const inWorkshop = playerPos.x < -40;
    const inCastle = playerPos.x > 40 && playerPos.x < 90;
    const inForgeTerraces = playerPos.x > 100 && playerPos.x < 150;
    const inLighthouse = playerPos.x > 160;
    const inManantial = playerPos.z > 12 && playerPos.x > -20 && playerPos.x < 20;

    if (inWorkshop) {
      // Inside Lumen's Workshop Interior
      list.push({
        id: 'lumen_npc_inside',
        label: hasJumperItem ? 'Hablar con Lumen sobre el circuito' : 'Hablar con el Maestro Lumen en su banco',
        pos: new pc.Vec3(-60, 1.0, 1.4),
        radius: 3.5,
        action: () => {
          startDialogue('lumen_workshop_interior');
        },
      });
      list.push({
        id: 'workshop_exit_door',
        label: 'Salir a la Plaza Central',
        pos: new pc.Vec3(-60, 1.0, -4.6),
        radius: 2.8,
        action: () => {
          teleportPlayer('workshop-to-plaza');
          void zones.activate('plaza').then(() => zones.deactivate('workshop'));
          arc1State = enterArc1Region(arc1State, 'taller');
          storyStep = 'returned_to_plaza';
          ui.showNotification('Saliste a la Plaza Central de Ohmdal.');
        },
      });
      list.push({
        id: 'workshop_inspect_bench',
        label: 'Examinar banco de relés y esquemas',
        pos: new pc.Vec3(-60, 1.0, 0.4),
        radius: 2.8,
        action: () => {
          currentMode = 'inspect';
          document.exitPointerLock?.();
          workbench.open('cuadro_rele');
          ui.setWorkbenchView(true, workbench, handleWorkbenchAction);
        },
      });
    } else if (inLighthouse) {
      list.push({
        id: 'lighthouse_bus_measure',
        label: 'Medir alimentación DC del Faro',
        pos: new pc.Vec3(180, 1.1, -8),
        radius: 2.2,
        action: () => {
          arc1State = measureLighthouse(arc1State);
          const evaluation = evaluateLighthouse(arc1State);
          showArc1Measurement('Faro · barra DC', evaluation.sourceVoltage, evaluation.sourceCurrent, 'medición registrada');
        },
      });
      list.push({
        id: 'lighthouse_calibration_panel',
        label: arc1State.lighthouse.protectiveTrip ? 'Rearmar protección del Faro' : 'Calibrar referencia DC del Faro',
        pos: new pc.Vec3(180, 1.2, 0),
        radius: 2.4,
        action: () => {
          if (arc1State.lighthouse.protectiveTrip) {
            arc1State = repairLighthouse(arc1State);
            audio.playBreakerReset();
            vfx.triggerTerminalArc([180, 1.2, 0], 1.0);
            ui.showNotification('Protección del Faro rearmada; la evidencia de la falla se conserva.');
          } else {
            arc1State = calibrateLighthouse(arc1State, { voltageTrim: 0, phaseOffset: 0 });
            audio.playGalvanometerClick();
            vfx.triggerTerminalArc([180, 1.2, 0], 0.8);
            ui.showNotification('Referencia DC alineada con la red restaurada.');
          }
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'lighthouse_beacon_control',
        label: arc1State.lighthouse.energized ? 'Registrar pulso de sincronización' : 'Energizar baliza calibrada',
        pos: new pc.Vec3(180, 1.25, 8),
        radius: 2.8,
        action: () => {
          arc1State = arc1State.lighthouse.energized
            ? synchronizeLighthouse(arc1State)
            : energizeLighthouse(arc1State);
          const evaluation = evaluateLighthouse(arc1State);
          if (arc1State.lighthouse.protectiveTrip) {
            audio.playBreakerTrip();
            vfx.triggerTerminalArc([180, 1.25, 8], 1.6);
          } else {
            audio.playBeaconSync();
            vfx.triggerConductorPulse([180, 1.25, 8], [180, 5.0, 8]);
          }
          ui.showNotification(arc1State.lighthouse.protectiveTrip
            ? 'La protección actuó: medí y calibrá antes de sincronizar.'
            : `Sincronización observada: ${arc1State.lighthouse.synchronizationSamples}/2.`);
          if (evaluation.restored) storyStep = 'lighthouse_restored';
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'lighthouse_return_marker',
        label: isLighthouseRestored(arc1State) ? 'Iniciar regreso por la red restaurada' : 'Registrar calibración validada',
        pos: new pc.Vec3(180, 1.0, 14),
        radius: 2.4,
        action: () => {
          if (!isLighthouseRestored(arc1State)) {
            arc1State = documentLighthouse(arc1State);
            if (!isLighthouseRestored(arc1State)) {
              ui.showNotification('Falta observar dos sincronizaciones estables antes de registrar el Faro.');
              return;
            }
          }
          arc1State = enterArc1Region(arc1State, 'retorno');
          zones.deactivate('lighthouse');
          void zones.activate('forge-terraces');
          teleportPlayer('lighthouse-to-forge-terraces');
          storyStep = 'returning';
          ui.showNotification('Regresá por Terrazas, Castillo y Plaza; los estados restaurados persisten.');
        },
      });
    } else if (inForgeTerraces) {
      list.push({
        id: 'forge_bus_measure',
        label: 'Medir potencia asignada en la barra compartida',
        pos: new pc.Vec3(120, 1.1, -8),
        radius: 2.0,
        action: () => {
          arc1State = measureForgeTerraces(arc1State);
          const evaluation = evaluateForgeTerraces(arc1State);
          showArc1Measurement('Forja/Terrazas', 24, evaluation.allocatedCurrent, `${evaluation.totalPower.toFixed(0)} W`);
        },
      });
      list.push({
        id: 'forge_heater_allocation',
        label: 'Priorizar Forja sin cortar riego',
        pos: new pc.Vec3(124.2, 1.2, -8),
        radius: 2.3,
        action: () => {
          arc1State = setForgeTerracesPriority(arc1State, 'forge-priority');
          audio.playForgeRoar(0.8);
          vfx.triggerConductorPulse([120, 1.1, -8], [124.2, 1.2, -8]);
          ui.showNotification('Asignación física: Forja 5 A · Terrazas 3 A.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'forge_distribution_panel',
        label: arc1State.forgeTerraces.protectiveTrip ? 'Rearmar protección de Forja/Terrazas' : 'Configurar conductor, protecciones y energizar',
        pos: new pc.Vec3(120, 1.2, 0),
        radius: 2.5,
        action: () => {
          if (arc1State.forgeTerraces.protectiveTrip) {
            arc1State = repairForgeTerraces(arc1State);
            audio.playBreakerReset();
            vfx.triggerTerminalArc([120, 1.2, 0], 1.2);
            ui.showNotification('Protecciones rearmadas; ajustá la asignación antes de energizar.');
          } else if (arc1State.forgeTerraces.conductor === 'narrow') {
            arc1State = setForgeTerracesConductor(arc1State, 'medium');
            arc1State = setForgeTerracesProtection(arc1State, 'forge', arc1State.forgeTerraces.allocation.forge);
            arc1State = setForgeTerracesProtection(arc1State, 'terraces', arc1State.forgeTerraces.allocation.terraces);
            audio.playSwitchClunk();
            vfx.triggerContactSnap([120, 1.2, 0]);
            ui.showNotification('Conductor medio y protecciones ajustadas a las cargas físicas.');
          } else {
            arc1State = energizeForgeTerraces(arc1State);
            if (arc1State.forgeTerraces.protectiveTrip) {
              audio.playBreakerTrip();
              vfx.triggerTerminalArc([120, 1.2, 0], 1.8);
            } else {
              audio.playHeavyBreakerClunk();
              audio.playForgeRoar(0.9);
              vfx.triggerConductorPulse([120, 1.2, 0], [120, 1.2, 16]);
            }
            ui.showNotification(arc1State.forgeTerraces.protectiveTrip
              ? 'La protección actuó: revisá carga, conductor y medición.'
              : 'Forja y riego reciben energía dentro del límite.');
          }
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'terraces_pump_control',
        label: arc1State.forgeTerraces.energized ? 'Registrar el trade-off observado' : 'Priorizar Terrazas sin apagar la Forja',
        pos: new pc.Vec3(120, 1.2, 16),
        radius: 2.7,
        action: () => {
          if (!arc1State.visitedRegions.includes('terrazas')) arc1State = enterArc1Region(arc1State, 'terrazas');
          audio.playPumpRhythm();
          vfx.triggerContactSnap([120, 1.2, 16]);
          if (arc1State.forgeTerraces.energized) {
            arc1State = documentForgeTerraces(arc1State);
            if (isForgeTerracesRestored(arc1State)) storyStep = 'forge_terraces_restored';
          } else {
            arc1State = setForgeTerracesPriority(arc1State, 'terraces-priority');
          }
          ui.showNotification(isForgeTerracesRestored(arc1State)
            ? 'Trade-off documentado: ambas cargas operan dentro de límites.'
            : 'Asignación física: Forja 3 A · Terrazas 5 A.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'terraces_exit',
        label: arc1State.currentRegion === 'retorno' ? 'Regresar al Castillo restaurado' : 'Continuar hacia el Faro',
        pos: new pc.Vec3(120, 1.2, 24),
        radius: 2.6,
        action: () => {
          if (arc1State.currentRegion === 'retorno') {
            zones.deactivate('forge-terraces');
            void zones.activate('castle');
            teleportPlayer('forge-terraces-to-castle');
            return;
          }
          if (!isForgeTerracesRestored(arc1State) || !arc1State.visitedRegions.includes('terrazas')) {
            ui.showNotification('Forja y Terrazas deben quedar estables y documentadas antes del Faro.');
            return;
          }
          arc1State = enterArc1Region(arc1State, 'faro');
          zones.deactivate('forge-terraces');
          void zones.activate('lighthouse');
          teleportPlayer('forge-terraces-to-lighthouse');
          storyStep = 'inside_lighthouse';
        },
      });
    } else if (inCastle) {
      list.push({
        id: 'castle_bus_measure',
        label: 'Medir la barra de distribución',
        pos: new pc.Vec3(60, 1.1, -8),
        radius: 2.2,
        action: () => {
          arc1State = measureCastleNetwork(arc1State);
          const evaluation = evaluateCastleNetwork(arc1State);
          showArc1Measurement('Castillo · barra', 24, evaluation.totalCurrent, evaluation.topology);
        },
      });
      list.push({
        id: 'castle_parallel_layout',
        label: 'Conectar tres servicios en paralelo',
        pos: new pc.Vec3(53.8, 1.15, 0),
        radius: 2.4,
        action: () => {
          arc1State = configureCastleNetwork(arc1State, CASTLE_PARALLEL_CONFIGURATION);
          audio.playBranchSwitch();
          vfx.triggerContactSnap([53.8, 1.15, 0]);
          ui.showNotification('Topología paralela: tres servicios, aislamiento local disponible.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'castle_mixed_layout',
        label: 'Conectar red mixta con servicio secundario',
        pos: new pc.Vec3(60, 1.15, 5.8),
        radius: 1.5,
        action: () => {
          arc1State = configureCastleNetwork(arc1State, CASTLE_MIXED_CONFIGURATION);
          audio.playBranchSwitch();
          vfx.triggerContactSnap([60, 1.15, 5.8]);
          ui.showNotification('Topología mixta: servicio secundario acoplado con coste de mantenimiento.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'castle_distribution_panel',
        label: arc1State.castle.protectiveTrip ? 'Rearmar protección del Castillo' : 'Energizar configuración medida',
        pos: new pc.Vec3(60, 1.1, 0),
        radius: 2.2,
        action: () => {
          if (arc1State.castle.protectiveTrip) {
            arc1State = repairCastleNetwork(arc1State);
            audio.playBreakerReset();
            vfx.triggerTerminalArc([60, 1.1, 0], 1.2);
          } else {
            arc1State = energizeCastleNetwork(arc1State);
            if (arc1State.castle.protectiveTrip) {
              audio.playBreakerTrip();
              vfx.triggerTerminalArc([60, 1.1, 0], 1.8);
            } else {
              audio.playHeavyBreakerClunk();
              vfx.triggerConductorPulse([51.5, 6, -10], [60, 1.1, 0]);
            }
          }
          ui.showNotification(arc1State.castle.protectiveTrip
            ? 'La protección actuó: la configuración no cumple condiciones.'
            : arc1State.castle.energized ? 'Distribución energizada; verificá y documentá.' : 'Protección rearmada.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'castle_document_station',
        label: 'Registrar esquema medido para mantenimiento',
        pos: new pc.Vec3(66.2, 1.15, 0),
        radius: 2.4,
        action: () => {
          arc1State = documentCastleNetwork(arc1State);
          if (isCastleRestored(arc1State)) storyStep = 'castle_restored';
          ui.showNotification(isCastleRestored(arc1State)
            ? 'Esquema publicado: el Castillo puede aislar y mantener sus ramas.'
            : 'Medí y energizá una configuración válida antes de documentarla.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'castle_exit_gate',
        label: arc1State.currentRegion === 'retorno' ? 'Regresar a la Plaza restaurada' : 'Continuar hacia Forja y Terrazas',
        pos: new pc.Vec3(60, 1.2, 8),
        radius: 2.6,
        action: () => {
          if (arc1State.currentRegion === 'retorno') {
            zones.deactivate('castle');
            void zones.activate('plaza');
            teleportPlayer('castle-to-plaza');
            ui.showNotification('Volviste a la Plaza por la red restaurada.');
            return;
          }
          if (!isCastleRestored(arc1State)) {
            ui.showNotification('La distribución debe quedar medida, energizada y documentada.');
            return;
          }
          arc1State = enterArc1Region(arc1State, 'forja');
          zones.deactivate('castle');
          void zones.activate('forge-terraces');
          teleportPlayer('castle-to-forge-terraces');
          storyStep = 'inside_forge_terraces';
        },
      });
    } else if (inManantial) {
      list.push({
        id: 'manantial_survey_point',
        label: 'Medir salida del generador con el Galvanoscopio',
        pos: new pc.Vec3(0, 1.2, 17.5),
        radius: 1.7,
        action: () => {
          arc1State = measureManantial(arc1State, isManantialRestored(arc1State) ? 'load' : 'generator');
          const evaluation = evaluateManantial(arc1State);
          showArc1Measurement('Manantial · generador', evaluation.generatorVoltage, evaluation.usefulOutput / 24, evaluation.continuity ? 'retorno continuo' : 'retorno abierto');
          if (isManantialRestored(arc1State)) storyStep = 'manantial_restored';
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'manantial_intake_gate',
        label: 'Abrir compuerta de admisión hidráulica',
        pos: new pc.Vec3(-4.2, 1.35, 18.4),
        radius: 1.8,
        action: () => {
          arc1State = setManantialGate(arc1State, true);
          audio.playHeavyBreakerClunk();
          vfx.triggerDustWake([-4.2, 2.0, 18.4], 0.9);
          ui.showNotification('La compuerta abre: el agua mueve la turbina, pero la salida aún depende del retorno.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'manantial_exciter_bridge',
        label: arc1State.manantial.protectiveTrip ? 'Rearmar protección y revisar retorno' : 'Restablecer continuidad del excitador',
        pos: new pc.Vec3(4.2, 1.35, 18.4),
        radius: 1.8,
        action: () => {
          const before = arc1State;
          arc1State = repairManantial(arc1State);
          audio.playSwitchClunk();
          vfx.triggerTerminalArc([4.2, 1.35, 18.4], 1.0);
          vfx.triggerContactSnap([4.2, 1.35, 18.4]);
          ui.showNotification(before === arc1State
            ? 'Primero medí la salida para localizar la discontinuidad.'
            : 'Retorno del excitador reparado; la protección quedó rearmada.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'manantial_output_breaker',
        label: 'Energizar salida hidroeléctrica',
        pos: new pc.Vec3(2.2, 1.35, 16),
        radius: 1.5,
        action: () => {
          arc1State = energizeManantial(arc1State);
          if (arc1State.manantial.protectiveTrip) {
            audio.playBreakerTrip();
            vfx.triggerTerminalArc([2.2, 1.35, 16], 1.8);
          } else {
            audio.playBreakerReset();
            vfx.triggerConductorPulse([2.2, 1.35, 16], [0, 1.68, 13.0]);
          }
          ui.showNotification(arc1State.manantial.protectiveTrip
            ? 'La protección actuó: falta caudal, continuidad o una medición previa.'
            : 'El generador entrega energía; verificá la salida con una segunda medición.');
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'gate_return_to_plaza',
        label: 'Regresar a la Plaza con la central restaurada',
        pos: new pc.Vec3(0, 1.68, 13.0),
        radius: 2.2,
        action: () => {
          if (!isManantialRestored(arc1State)) {
            ui.showNotification('La Plaza todavía no recibe salida útil verificada.');
            return;
          }
          arc1State = enterArc1Region(arc1State, 'plaza');
          teleportPlayer('manantial-to-plaza');
          zones.deactivate('manantial');
          storyStep = 'restored_plaza';
          ui.showNotification('La energía vuelve a la Plaza; la Campana puede accionar la apertura del Castillo.');
        },
      });
    } else {
      // Outdoor Plaza
      list.push({
        id: 'edda_npc',
        label: isOhmAwake ? 'Hablar con Edda sobre el taller' : 'Hablar con Edda (Estudiosa)',
        pos: world.eddaEntity.getPosition(),
        radius: 2.0,
        action: () => {
          if (!isOhmAwake) {
            startDialogue('intro_portal_edda');
          } else if (storyStep === 'ohm_awakened' || storyStep === 'edda_surprised') {
            startDialogue('edda_surprised_awakening');
          } else if (circuit.gateOpen) {
            startDialogue('circuit_solved_dialog');
          } else {
            startDialogue('edda_surprised_awakening');
          }
        },
      });

      list.push({
        id: 'ohm_automaton_pedestal',
        label: isOhmAwake ? 'Consultar telemetría con Ohm' : 'Acoplar contactos y Despertar a Ohm',
        pos: new pc.Vec3(0, 1.0, -2.0),
        radius: 3.6,
        action: () => {
          if (arc1State.currentRegion === 'retorno' && isLighthouseRestored(arc1State)) {
            arc1State = enterArc1Region(arc1State, 'portal');
            storyStep = 'arc1_complete';
            ui.showNotification(isArcComplete(arc1State)
              ? 'Arco I greybox completo. TODO(guion): cierre final y transferencia.'
              : 'El retorno aún no refleja todas las intervenciones del Arco I.');
          } else if (!isOhmAwake) {
            openOhmInspection();
          } else {
            startDialogue('ohm_awakening_event');
          }
        },
      });

      list.push({
        id: 'workshop_exterior_door',
        label: 'Entrar al Taller de Lumen (Interior)',
        pos: new pc.Vec3(-7.4, 1.2, -4.0),
        radius: 3.0,
        action: () => {
          void zones.activate('workshop').then(() => {
            zones.deactivate('plaza');
            arc1State = enterArc1Region(arc1State, 'taller');
            teleportPlayer('plaza-to-workshop');
            storyStep = 'inside_workshop';
            bitacora.unlock('taller_lumen', 'investigating');
            ui.showNotification('Entraste al Taller de Lumen.');
          });
        },
      });

      list.push({
        id: 'campana',
        label: 'Hacer sonar la Campana Sagrada',
        pos: new pc.Vec3(-5.2, 1.5, 2.4),
        radius: 3.5,
        action: () => {
          audio.playBellChime();
          audio.playRelayEngage();
          vfx.triggerContactSnap([-5.2, 0.8, 2.4]);
          vfx.triggerDustWake([-4.8, 2.2, 0.5], 1.2);
          workbench.toggleKnifeSwitch();
          circuit.branches.b_ida_rele.state = 'closed';
          circuit = solveCircuit(circuit);
          if (isManantialRestored(arc1State)) {
            arc1State = pullCampana(arc1State);
            arc1State = openCastleGate(arc1State);
            updateArc1WorldVisuals();
          } else {
            updateCircuitStateVisuals();
          }
          bitacora.unlock('lengueta_edda');
          ui.showNotification(isManantialRestored(arc1State)
            ? 'La Campana cerró el relé alimentado por Manantial; la ruta al Castillo está abierta.'
            : '¡La campana resonó! El relé de enclavamiento cerró su circuito.');
        },
      });

      list.push({
        id: 'cuadro_rele',
        label: 'Examinar el Relé de cerca',
        pos: new pc.Vec3(-5.2, 0.8, 2.4),
        radius: 3.0,
        action: () => {
          currentMode = 'inspect';
          document.exitPointerLock?.();
          workbench.open('cuadro_rele');
          ui.setWorkbenchView(true, workbench, handleWorkbenchAction);
        },
      });

      list.push({
        id: 'brecha_retorno',
        label: hasJumperItem ? 'Instalar Barra Puente de Cobre' : 'Examinar la Brecha Sagrada (Riel Cortado)',
        pos: new pc.Vec3(-0.9, 0.4, 1.5),
        radius: 2.8,
        action: () => {
          if (hasJumperItem) {
            circuit.branches.b_brecha_retorno.state = 'closed';
            circuit = solveCircuit(circuit);
            world.copperJumper.enabled = true;
            audio.playSwitchClunk();
            vfx.triggerTerminalArc([-0.9, 0.4, 1.5], 1.0);
            vfx.triggerContactSnap([-0.9, 0.4, 1.5]);
            bitacora.unlock('brecha_sagrada');
            bitacora.unlock('ley_retorno');
            ui.showNotification('¡Barra puente instalada! Continuidad física restablecida.');
            updateCircuitStateVisuals();
          } else {
            bitacora.unlock('brecha_sagrada', 'rumor');
            ui.showNotification('La brecha está abierta. Necesitas la barra puente del taller de Lumen.');
          }
        },
      });

      list.push({
        id: 'moho_oxido',
        label: hasBrushItem ? 'Limpiar el Moho Verde con el Cepillo' : 'Examinar el Contacto Sulfatado',
        pos: new pc.Vec3(-2.2, 0.4, -4.4),
        radius: 2.8,
        action: () => {
          if (hasBrushItem) {
            circuit.branches.b_brecha_a_oxido.state = 'closed';
            circuit.branches.b_brecha_a_oxido.resistance = 0.05;
            circuit = solveCircuit(circuit);
            world.corrosionMesh.enabled = false;
            audio.playWireScrape();
            vfx.triggerDustWake([-0.9, 0.4, -4.0], 0.8);
            bitacora.unlock('moho_verde');
            bitacora.unlock('ley_retorno');
            ui.showNotification('¡Óxido retirado! Cobre limpio (0.05Ω).');
            updateCircuitStateVisuals();
          } else {
            bitacora.unlock('moho_verde', 'rumor');
            ui.showNotification('El contacto está sulfatado. Necesitas el cepillo de alambre del taller de Lumen.');
          }
        },
      });

      list.push({
        id: 'mural',
        label: 'Examinar Mural de la Ley de Retorno',
        pos: new pc.Vec3(7.8, 1.6, -4.2),
        radius: 3.2,
        action: () => {
          startDialogue('mural_inspect_dialog');
        },
      });

      if (arc1State.returnedToPlaza) {
        list.push({
          id: 'castle_route',
          label: getArc1Progress(arc1State).castleGateOpen
            ? 'Cruzar la apertura hacia el Castillo de la Red'
            : 'Examinar la ruta cerrada del Castillo',
          pos: new pc.Vec3(0, 1.2, 9.2),
          radius: 2.0,
          action: () => {
            if (!getArc1Progress(arc1State).castleGateOpen) {
              ui.showNotification('La apertura depende de Manantial restaurado y de la Campana física.');
              return;
            }
            arc1State = enterArc1Region(arc1State, 'castillo');
            zones.deactivate('plaza');
            void zones.activate('castle');
            teleportPlayer('plaza-to-castle');
            storyStep = 'inside_castle';
          },
        });
      }

      list.push({
        id: 'puerta_ohm',
        label: circuit.gateOpen
          ? 'Cruzar la Gran Puerta de Ohm (Ω) hacia el Manantial'
          : 'Examinar la Gran Puerta de Ohm (Ω) [Bloqueada]',
        pos: new pc.Vec3(0, 2.0, 10.5),
        radius: 3.8,
        action: () => {
          if (circuit.gateOpen) {
            void zones.activate('manantial');
            arc1State = enterArc1Region(arc1State, 'manantial');
            teleportPlayer('plaza-to-manantial');
            storyStep = 'inside_manantial';
            bitacora.unlock('manantial_central_hidraulica', 'investigating');
            ui.showNotification('Avanzaste por el sendero hacia la montaña y el Manantial.');
          } else {
            ui.showNotification('Los solenoides magnéticos de la Gran Puerta necesitan corriente de retorno activa.');
          }
        },
      });
    }

    return list;
  }

  function startDialogue(nodeId: string): void {
    const node = DIALOGUE_DATABASE[nodeId];
    if (!node) return;
    activeDialogueNode = node;
    activeDialogueLineIndex = 0;
    document.exitPointerLock?.();
    renderCurrentDialogueLine();
  }

  function renderCurrentDialogueLine(): void {
    if (!activeDialogueNode) return;
    const line: DialogueLine = activeDialogueNode.lines[activeDialogueLineIndex]!;
    audio.playVocalChirp(line.who);

    const isLastLine = activeDialogueLineIndex >= activeDialogueNode.lines.length - 1;
    let choices: { label: string; action: () => void }[] | undefined;

    if (isLastLine && activeDialogueNode.choices) {
      choices = activeDialogueNode.choices.map((c) => ({
        label: c.label,
        action: () => startDialogue(c.nextStepId),
      }));
    }

    ui.setDialog(line.who, line.text, line.portrait, choices);
  }

  function advanceDialogue(): void {
    if (!activeDialogueNode) return;
    if (activeDialogueLineIndex < activeDialogueNode.lines.length - 1) {
      activeDialogueLineIndex += 1;
      renderCurrentDialogueLine();
    } else {
      if (!activeDialogueNode.choices) {
        if (activeDialogueNode.onComplete === 'grant_jumper_item') {
          hasJumperItem = true;
          hasBrushItem = true;
          storyStep = 'tools_received';
          ui.setInventoryItem('Puente de Cobre + Cepillo');
          ui.showNotification('Obtuviste: Barra Puente de Cobre y Cepillo de Alambre.');
          bitacora.unlock('taller_lumen', 'discovered');
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_portal') {
          bitacora.unlock('portal_origen');
        } else if (activeDialogueNode.onComplete === 'complete_ohm_awakening') {
          bitacora.unlock('despertar_ohm');
          startDialogue('edda_surprised_awakening');
          return;
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_taller') {
          bitacora.unlock('asombro_edda');
          bitacora.unlock('taller_lumen', 'rumor');
          storyStep = 'invited_to_workshop';
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_mural') {
          bitacora.unlock('ley_retorno');
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_manantial') {
          bitacora.unlock('manantial_central_hidraulica');
          bitacora.unlock('analogia_potencial');
        }

        activeDialogueNode = null;
        ui.setDialog(null, null);
      }
    }
  }

  function handleWorkbenchAction(actionName: string): void {
    if (actionName === 'knife_switch') {
      const closed = workbench.toggleKnifeSwitch();
      circuit.branches.b_ida_rele.state = closed ? 'closed' : 'open';
      circuit = solveCircuit(circuit);
      audio.playSwitchClunk();
      if (closed) audio.playRelayEngage();
      updateCircuitStateVisuals();
    } else if (actionName === 'scrape_corrosion') {
      workbench.scrapeCorrosion();
      circuit.branches.b_brecha_a_oxido.state = 'closed';
      circuit.branches.b_brecha_a_oxido.resistance = 0.05;
      circuit = solveCircuit(circuit);
      world.corrosionMesh.enabled = false;
      audio.playWireScrape();
      bitacora.unlock('moho_verde');
      updateCircuitStateVisuals();
    } else if (actionName === 'install_jumper') {
      workbench.installJumper();
      circuit.branches.b_brecha_retorno.state = 'closed';
      circuit = solveCircuit(circuit);
      world.copperJumper.enabled = true;
      audio.playSwitchClunk();
      bitacora.unlock('brecha_sagrada');
      updateCircuitStateVisuals();
    } else if (actionName === 'close') {
      workbench.close();
      currentMode = 'explore';
      ui.setWorkbenchView(false);
    }
  }

  function updateCircuitStateVisuals(): void {
    if (circuit.relayEnergized) {
      world.relayLight.light!.intensity = 2.4;
    } else {
      world.relayLight.light!.intensity = 0.6;
    }

    if (circuit.gateOpen) {
      void zones.preload('manantial');
      world.solenoidGate.setPosition(0, OMEGA_GATE_TUNING.openY, 11.5);
      world.gateLightLeft.light!.color = new pc.Color(0.2, 1.0, 0.4);
      world.gateLightRight.light!.color = new pc.Color(0.2, 1.0, 0.4);
      bitacora.unlock('puerta_ohm');
      storyStep = 'gate_opened';
      if (activeDialogueNode === null) {
        startDialogue('circuit_solved_dialog');
        audio.playDiscoveryChime();
      }
    }
  }

  function toggleBitacora(): void {
    if (currentMode === 'bitacora') {
      currentMode = 'explore';
      ui.setBitacoraView(false);
    } else {
      currentMode = 'bitacora';
      document.exitPointerLock?.();
      ui.setBitacoraView(true, bitacora);
    }
  }

  function triggerInteraction(): void {
    if (currentMode === 'inspect') return;
    if (isCinematicActive) {
      finishArrivalCinematic();
      return;
    }

    if (activeDialogueNode) {
      advanceDialogue();
      return;
    }

    const camPos = world.playerEntity.getPosition();

    // 1. Check proximity interactables first (find closest within radius)
    const currentInteractables = getActiveInteractables();
    let bestItem: typeof currentInteractables[0] | null = null;
    let minItemDist = Number.POSITIVE_INFINITY;
    for (const item of currentInteractables) {
      const d = camPos.distance(item.pos);
      if (d <= item.radius && d < minItemDist) {
        minItemDist = d;
        bestItem = item;
      }
    }
    if (bestItem) {
      bestItem.action();
      return;
    }

    // 2. Check probe targets if Galvanoscope tool is equipped or near terminals
    if (isToolEquipped) {
      let closestNodeId: string | null = null;
      let minDist = 3.2;

      for (const [nodeId, pos] of Object.entries(world.probeTargets)) {
        const d = camPos.distance(pos);
        if (d < minDist) {
          minDist = d;
          closestNodeId = nodeId;
        }
      }

      if (closestNodeId) {
        const probeRes = galvanoscope.connectProbe(closestNodeId, circuit);
        const gState = galvanoscope.getState();
        audio.playProbeContact(gState.measuredVoltage);
        vfx.triggerTerminalArc([camPos.x, camPos.y - 0.2, camPos.z], 0.6);
        ui.setGalvanoscopeHud(
          true,
          gState.measuredVoltage,
          gState.measuredResistance,
          gState.measuredCurrent,
          probeRes.result?.status ?? 'Conectado',
          gState.probeA,
          gState.probeB,
        );
        ui.showNotification(`Punta ${probeRes.probeConnected} conectada a: ${circuit.nodes[closestNodeId]?.label ?? closestNodeId}`);
        return;
      }
    }
  }

  canvas.addEventListener('click', () => {
    if (isCinematicActive) {
      finishArrivalCinematic();
      return;
    }
    if (!isPointerLocked && !activeDialogueNode && currentMode === 'explore') {
      canvas.requestPointerLock?.();
    } else {
      triggerInteraction();
    }
  });

  const isBlocked = (x: number, z: number) => {
    return world.navigation.collides(x, z, 0.4);
  };

  // PlayCanvas Engine Update Loop
  let currentNeedleAngle = 60;
  let needleTarget = 60;

  world.app.on('update', (dt: number) => {
    const frameMs = world.app.stats.frame.ms || dt * 1000;
    if (frameMs > 0 && Number.isFinite(frameMs)) {
      frameTimeSamples.push(frameMs);
      if (frameTimeSamples.length > 240) frameTimeSamples.shift();
    }

    // 0. Arrival Cinematic Camera Progression
    if (isCinematicActive && !visualPaused) {
      const now = performance.now();
      const wallDt = Math.max(0, (now - lastCinematicTimestamp) / 1000);
      lastCinematicTimestamp = now;
      cinematicTime += Math.max(dt, Math.min(0.5, wallDt));

      if (cinematicTime >= CINEMATIC_DURATION) {
        finishArrivalCinematic();
      } else {
        if (cinematicTime < 0.7) {
          const t = Math.min(1, cinematicTime / 0.7);
          const ease = t * t * (3 - 2 * t);
          playerPos.set(0, 1.8 + ease * 0.3, -7.2 + ease * 0.4);
          yaw = 0; // facing north toward portal
          pitch = 4 - ease * 4;
        } else if (cinematicTime < 1.7) {
          const t = Math.min(1, (cinematicTime - 0.7) / 1.0);
          const ease = t * t * (3 - 2 * t);
          playerPos.set(Math.sin(ease * Math.PI) * 0.5, 2.0 + Math.sin(ease * Math.PI) * 0.3, -6.8 - ease * 1.2);
          yaw = ease * 180; // smoothly rotate south
          pitch = Math.sin(ease * Math.PI) * 6;
        } else {
          const t = Math.min(1, (cinematicTime - 1.7) / 0.7);
          playerPos.set(0, 1.68, -8.0);
          yaw = 180;
          pitch = 0;
          world.eddaEntity.setLocalEulerAngles(0, -156 + Math.sin(t * Math.PI * 2) * 5, 0);
        }
        world.playerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
        world.playerEntity.setEulerAngles(0, yaw, 0);
        world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
      }
      return;
    }

    // 1. Movement
    let forward = 0;
    let strafe = 0;
    if (keys.w) forward += 1;
    if (keys.s) forward -= 1;
    if (keys.a) strafe -= 1;
    if (keys.d) strafe += 1;

    const isMoving = forward !== 0 || strafe !== 0;
    if (isMoving && !visualPaused) {
      const rad = (yaw * Math.PI) / 180;
      const fwdX = -Math.sin(rad);
      const fwdZ = -Math.cos(rad);
      const rgtX = Math.cos(rad);
      const rgtZ = -Math.sin(rad);

      const speed = 4.8 * dt;
      let moveX = (forward * fwdX + strafe * rgtX);
      let moveZ = (forward * fwdZ + strafe * rgtZ);
      const len = Math.hypot(moveX, moveZ);
      if (len > 0.001) {
        moveX = (moveX / len) * speed;
        moveZ = (moveZ / len) * speed;
      }

      if (!isBlocked(playerPos.x + moveX, playerPos.z)) {
        playerPos.x += moveX;
      }
      if (!isBlocked(playerPos.x, playerPos.z + moveZ)) {
        playerPos.z += moveZ;
      }
    }

    world.playerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);

    // 2. Viewmodel calibration and needle animation. Portrait keeps the
    // complete instrument inside the horizontal safe area instead of showing
    // only a clipped probe at the right edge.
    const useCompactViewmodelLayout = world.app.graphicsDevice.width <= 600;
    if (compactViewmodelLayout !== useCompactViewmodelLayout) {
      compactViewmodelLayout = useCompactViewmodelLayout;
      if (useCompactViewmodelLayout) {
        world.viewmodelRoot.setLocalPosition(0.10, -0.20, -0.65);
        world.viewmodelRoot.setLocalEulerAngles(8, -10, 3);
        world.viewmodelRoot.setLocalScale(0.72, 0.72, 0.72);
      } else {
        world.viewmodelRoot.setLocalPosition(0.25, -0.22, -0.48);
        world.viewmodelRoot.setLocalEulerAngles(8, -12, 3);
        world.viewmodelRoot.setLocalScale(1, 1, 1);
      }
    }

    const gState = galvanoscope.getState();
    const vFraction = Math.max(0, Math.min(1.0, gState.measuredVoltage / 30));
    needleTarget = 60 - vFraction * 120;
    if (!visualPaused && !reducedMotion) currentNeedleAngle += (needleTarget - currentNeedleAngle) * dt * 12.0;
    world.viewmodelNeedle.setLocalEulerAngles(0, 0, currentNeedleAngle);

    if (!visualPaused && !reducedMotion) {
      if (arc1State.manantial.gateOpen) world.turbineRotor.rotateLocal(0, 0, dt * 150);
      if (isForgeTerracesRestored(arc1State)) {
        const pumpWheel = world.arc1Greybox.terracesPump.findByName('TerracesPumpWheel') as pc.Entity | null;
        pumpWheel?.rotateLocal(0, 0, dt * 110);
      }
      if (isLighthouseRestored(arc1State)) world.arc1Greybox.lighthouseSignal.rotateLocal(0, dt * 22, 0);
    }
    manantialActivationVfx.update(dt);
    vfx.update(dt);

    // 3. Prompt detection
    const camPos = world.playerEntity.getPosition();
    let prompt: string | null = null;
    if (currentMode === 'explore' && !activeDialogueNode) {
      const currentInteractables = getActiveInteractables();
      let bestItem: typeof currentInteractables[0] | null = null;
      let minItemDist = Number.POSITIVE_INFINITY;
      for (const item of currentInteractables) {
        const d = camPos.distance(item.pos);
        if (d <= item.radius && d < minItemDist) {
          minItemDist = d;
          bestItem = item;
        }
      }
      if (bestItem) {
        prompt = `[E] ${bestItem.label}`;
      }
      if (!prompt && isToolEquipped) {
        for (const [nodeId, pos] of Object.entries(world.probeTargets)) {
          if (camPos.distance(pos) < 3.2) {
            prompt = `[Clic / E] Conectar punta a: ${circuit.nodes[nodeId]?.label ?? nodeId}`;
            break;
          }
        }
      }
    }
    ui.setPrompt(prompt);
  });

  // Start with portal arrival cinematic (first entry) or direct dialogue
  if (!isIntroSeen()) {
    isCinematicActive = true;
    cinematicTime = 0;
    announceCinematic('portal-arrival');
    ui.setCinematicOverlay?.(true);
  } else {
    isCinematicActive = false;
    ui.setCinematicOverlay?.(false);
    setTimeout(() => {
      startDialogue('intro_portal_edda');
    }, 350);
  }

  return {
    press(key: string) {
      onKeyDown(new KeyboardEvent('keydown', { key }));
    },
    clickAt(_x: number, _y: number) {
      triggerInteraction();
    },
    destroy() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (window.__ROXANA_VISUAL_TEST_HOOKS__ === visualHooks) delete window.__ROXANA_VISUAL_TEST_HOOKS__;
      document.documentElement.classList.remove('roxana-visual-ui-hidden');
      manantialActivationVfx.dispose();
      vfx.dispose();
      world.app.destroy();
      canvas.remove();
    },
  };
}

