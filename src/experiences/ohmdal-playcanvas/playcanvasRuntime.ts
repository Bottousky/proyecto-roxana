import * as pc from 'playcanvas';
import { createPlayerControls } from './systems/controls/playerControls.ts';
import './systems/controls/playerControls.css';
import { buildPlayCanvasOhmdalWorld, type PlayCanvasWorldElements } from './playcanvasWorld.ts';
import { CONTACT_AFFORDANCE_CENTER } from './world/plaza/contactAffordance.ts';
import {
  createContactTargetLabel,
  getContactTargetLabelText,
  projectContactTargetLabel,
  shouldShowContactTargetLabel,
  type ContactTargetLabelHandle,
} from './systems/controls/contactTargetLabel.ts';
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
import { Arc1WorldAmbience } from './systems/audio/arc1WorldAmbience.ts';
import { OhmContinuityPuzzle } from './systems/puzzles/ohmContinuityPuzzle.ts';
import { ARC1_COMMUNITY_DIALOGUES } from './systems/story/arc1CommunityScenes.ts';
import { createFirstClassDemonstration } from './world/arc1/firstClassDemonstration.ts';
import { createRegionalMaintenancePanel, type RegionPanelKind } from './systems/puzzles/regionalMaintenancePanel.ts';
import { applyRegionalIntervention } from './systems/puzzles/regionalInterventions.ts';
import './systems/puzzles/regionalMaintenancePanel.css';
import {
  ARC1_SAVE_STORAGE_KEY,
  applyArc1CircuitSave,
  captureArc1CircuitState,
  createArc1SaveData,
  readArc1Save,
  writeArc1Save,
  type Arc1SafeAnchorId,
  type Arc1SafeZone,
} from './systems/campaign/arc1Save.ts';
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
  isCastleRestored,
  isForgeTerracesRestored,
  isLighthouseRestored,
  isLighthouseEmitting,
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
  const contactLabelHost = host.parentElement ?? host;
  const contactTargetLabel: ContactTargetLabelHandle = createContactTargetLabel(contactLabelHost);
  const touchInteractionButton = document.getElementById('touch-interact');
  const contactLabelWorldPosition = new pc.Vec3(
    CONTACT_AFFORDANCE_CENTER[0],
    CONTACT_AFFORDANCE_CENTER[1] + 0.2,
    CONTACT_AFFORDANCE_CENTER[2],
  );
  const contactLabelScreenPosition = new pc.Vec3();
  const worldAmbience = new Arc1WorldAmbience({ visibilityTarget: document });
  const audio = new PlazaAudioEngine({ ambientBed: false, worldAmbience });
  const audioToggle = document.getElementById('ohmdal-audio-toggle');
  try { if (localStorage.getItem('ohmdal.audio.muted') === 'true') audio.toggleMute(); } catch { /* Optional preference storage. */ }
  const syncAudioToggle = () => {
    const label = audio.isMuted ? 'Activar sonido' : 'Silenciar sonido';
    audioToggle?.setAttribute('aria-label', label);
    audioToggle?.setAttribute('title', label);
    audioToggle?.setAttribute('aria-pressed', String(audio.isMuted));
    const waves = audioToggle?.querySelector<SVGElement>('[data-sound-waves]');
    const muted = audioToggle?.querySelector<SVGElement>('[data-sound-muted]');
    if (waves) waves.style.display = audio.isMuted ? 'none' : '';
    if (muted) muted.style.display = audio.isMuted ? '' : 'none';
  };
  const toggleWorldSound = (event: Event) => {
    event.stopPropagation();
    audio.toggleMute(); syncAudioToggle();
    try { localStorage.setItem('ohmdal.audio.muted', String(audio.isMuted)); } catch { /* Optional preference storage. */ }
  };
  syncAudioToggle();
  audioToggle?.addEventListener('click', toggleWorldSound);
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
  zones.register({ id: 'workshop', load: () => world.characterVisuals.ensure('lumen'), setActive: (active) => setZoneActive('workshop', active, () => { world.workshopInteriorRoot.enabled = active; }) });
  // The existing mountain root is Plaza's accepted scenic shell. Future
  // Manantial payloads register behind this progression-gated load seam.
  zones.register({
    id: 'manantial',
    load: () => world.regionalHeroVisuals.ensure('manantial'),
    setActive: (active) => setZoneActive('manantial', active, () => {
      world.manantialGameplayRoot.enabled = active;
      world.turbineMesh.enabled = !active;
      world.manantialScenicTurbineRotor.enabled = !active;
    }),
  });
  zones.register({
    id: 'castle',
    load: () => Promise.all([world.characterVisuals.ensure('consejera'), world.regionalHeroVisuals.ensure('castle')]).then(() => undefined),
    setActive: (active) => setZoneActive('castle', active, () => { world.arc1Greybox.roots.castle.enabled = active; }),
  });
  zones.register({
    id: 'forge-terraces',
    load: () => Promise.all([world.characterVisuals.ensure('yesca'), world.characterVisuals.ensure('vega'), world.regionalHeroVisuals.ensure('forge')]).then(() => undefined),
    setActive: (active) => setZoneActive('forge-terraces', active, () => { world.arc1Greybox.roots['forge-terraces'].enabled = active; }),
  });
  zones.register({
    id: 'lighthouse',
    load: () => Promise.all([world.characterVisuals.ensure('nereo'), world.regionalHeroVisuals.ensure('lighthouse')]).then(() => undefined),
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
  let visualHarnessActive = false;
  let visualPaused = false;
  let reducedMotion = false;
  let runtimeDestroyed = false;
  let campaignHydrating = false;
  let campaignLoadFailed = false;
  let transitionPending = false;
  let campaignResumed = false;
  let startupDialogueTimer: number | null = null;
  let campaignSaveTimer: number | null = null;
  let safeAnchorId: Arc1SafeAnchorId = 'portal-to-plaza';

  const campaignStorage = {
    getItem(key: string): string | null {
      return localStorage.getItem(key);
    },
    setItem(key: string, value: string): void {
      localStorage.setItem(key, value);
    },
  };

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
    if (!isCinematicActive || runtimeDestroyed || campaignResumed) return;
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
  let viewmodelLayoutKey = '';
  const frameTimeSamples: number[] = [];

  // First-person Controls
  let yaw = 180;
  let pitch = 0;
  const playerPos = new pc.Vec3(0, 1.68, -8.0);
  const keys = { w: false, a: false, s: false, d: false };

  // The authored GLB faces south after its calibrated 180° yaw (the visible
  // emitter is on +Z in the asset). Keep the inspection on the clear east
  // side, slightly behind the body, outside the real pedestal collider.
  const ohmBodyCenter = new pc.Vec3(0, 1.16, -2.0);
  const ohmInspectionPosition = new pc.Vec3(1.7, 1.25, -1.1);
  const ohmPuzzle = new OhmContinuityPuzzle();
  let isOhmInspecting = false;
  let ohmCompletionPending = false;
  let ohmCompletionTimer: number | null = null;
  let ohmAwakeningDialogueTimer: number | null = null;
  let firstClassVisible = false;
  let firstClassLessonTime = 0;
  const firstClassEddaOrigin = world.eddaEntity.getPosition().clone();
  let firstClassCameraRestore: { position: pc.Vec3; rotation: pc.Quat; yaw: number; pitch: number } | null = null;
  const firstClassEddaHead = world.eddaEntity.findByName('EddaHead') as pc.Entity | null;
  const firstClassLumenHead = world.lumenNpcEntity.findByName('LumenHead') as pc.Entity | null;
  const firstClassRecord = new pc.Entity('LumenFirstClassRecord');
  const firstClassRecordMaterial = (world.lumenNpcEntity.findByName('LumenGoggles') as pc.Entity | null)
    ?.render?.meshInstances[0]?.material;
  if (firstClassRecordMaterial) {
    firstClassRecord.addComponent('render', { type: 'box', material: firstClassRecordMaterial });
    firstClassRecord.setLocalScale(0.42, 0.62, 0.08);
    firstClassRecord.setLocalPosition(0.48, 1.12, 0.2);
    firstClassRecord.setLocalEulerAngles(10, 0, -16);
    firstClassRecord.render!.castShadows = false;
    firstClassRecord.render!.receiveShadows = true;
  }
  world.lumenNpcEntity.addChild(firstClassRecord);
  firstClassRecord.enabled = false;
  const firstClassDemonstration = createFirstClassDemonstration(world.app, world.plazaRoot);
  firstClassDemonstration.root.enabled = false;
  const inspectionPrevPos = new pc.Vec3();
  let inspectionPrevYaw = 180;
  let inspectionPrevPitch = 0;

  function clearCampaignSaveTimer(): void {
    if (campaignSaveTimer !== null) {
      window.clearTimeout(campaignSaveTimer);
      campaignSaveTimer = null;
    }
  }

  /** Save only campaign sources; visual harness mutations never enter this path. */
  function saveCampaign(): boolean {
    if (runtimeDestroyed || campaignHydrating || campaignLoadFailed || visualHarnessActive) return false;
    const circuitSave = captureArc1CircuitState(circuit);
    const transition = OHMDAL_TRANSITION_ANCHORS[safeAnchorId];
    if (!circuitSave || !transition) return false;
    try {
      const save = createArc1SaveData({
        storyStep,
        ohmAwake: isOhmAwake,
        inventory: { jumper: hasJumperItem, brush: hasBrushItem },
        arc1: arc1State,
        circuit: circuitSave,
        bitacora: bitacora.getStatuses(),
        safeAnchor: {
          zone: transition.to as Arc1SafeZone,
          anchorId: safeAnchorId,
        },
        b2: { coveredIds: [...ohmPuzzle.getCovered()] },
      });
      return writeArc1Save(campaignStorage, save, ARC1_SAVE_STORAGE_KEY);
    } catch {
      return false;
    }
  }

  /** Coalesce accepted interactions so a save does not occur each frame. */
  function queueCampaignSave(): void {
    if (runtimeDestroyed || campaignHydrating || visualHarnessActive) return;
    clearCampaignSaveTimer();
    campaignSaveTimer = window.setTimeout(() => {
      campaignSaveTimer = null;
      if (!activeDialogueNode) saveCampaign();
    }, 80);
  }

  async function hydrateCampaign(save: ReturnType<typeof readArc1Save>): Promise<boolean> {
    if (!save) return false;
    campaignHydrating = true;
    campaignLoadFailed = false;
    try {
      const hydratedCircuit = applyArc1CircuitSave(createInitialCircuit(), save.circuit);
      if (!hydratedCircuit) return false;
      const anchor = OHMDAL_TRANSITION_ANCHORS[save.safeAnchor.anchorId];
      if (!anchor || anchor.to !== save.safeAnchor.zone) return false;
      const resumeZones = save.safeAnchor.zone === 'manantial'
        ? ['plaza', 'manantial'] as const : [save.safeAnchor.zone];
      // Fetch before modifying any campaign source or moving the player.
      for (const zone of resumeZones) await zones.preload(zone);
      if (runtimeDestroyed) return false;

      closeVisualOverlays();
      clearCampaignSaveTimer();
      clearOhmCompletionTimer();
      ohmCompletionPending = false;
      circuit = solveCircuit(hydratedCircuit);
      arc1State = save.arc1;
      storyStep = save.storyStep;
      isOhmAwake = save.ohmAwake;
      hasJumperItem = save.inventory.jumper;
      hasBrushItem = save.inventory.brush;
      bitacora.restoreStatuses(save.bitacora);
      safeAnchorId = save.safeAnchor.anchorId;

      // OhmContinuityPuzzle intentionally has immutable topology; rebuild its
      // source coverage through its public reducer rather than restoring a
      // snapshot or reaching into private state.
      ohmPuzzle.reset();
      for (const gapId of save.b2?.coveredIds ?? (isOhmAwake ? ['g1', 'g5', 'g4'] : [])) ohmPuzzle.toggleGap(gapId);

      const inspectorState = workbench.getState();
      inspectorState.knifeSwitchClosed = circuit.branches.b_ida_rele.state === 'closed';
      inspectorState.corrosionScraped = circuit.branches.b_brecha_a_oxido.state === 'closed'
        || circuit.branches.b_brecha_a_oxido.resistance < 1;
      inspectorState.jumperInstalled = circuit.branches.b_brecha_retorno.state === 'closed';
      workbench.close();

      world.copperJumper.enabled = inspectorState.jumperInstalled;
      world.corrosionMesh.enabled = !inspectorState.corrosionScraped;
      world.ohmFilamentLight.light!.intensity = isOhmAwake ? 2.8 : 0;
      updateArc1WorldVisuals();
      updateCircuitStateVisuals({ showDialogue: false, deriveStory: false });
      ui.setInventoryItem(hasJumperItem || hasBrushItem ? 'Puente de Cobre + Cepillo' : '');

      spawnAtAnchor(anchor.anchor);

      // Manantial is reached along the open northern path and keeps Plaza
      // visible behind it during normal play. Resume that same composition.
      for (const zone of resumeZones) await zones.activate(zone);
      if (runtimeDestroyed) return false;
      for (const zone of ['plaza', 'workshop', 'manantial', 'castle', 'forge-terraces', 'lighthouse'] as const) {
        if (!(resumeZones as readonly string[]).includes(zone)) zones.deactivate(zone);
      }
      if (storyStep === 'arc1_complete' || (storyStep === 'returning' && safeAnchorId === 'castle-to-plaza')) {
        placeFirstClassActors();
      } else {
        restoreLumenToWorkshop();
      }
      updateArc1WorldVisuals();
      // A pagehide may flush the closed circuit during its 700ms settling
      // animation. Resume its earned awakening rather than a stranded panel.
      if (!isOhmAwake && ohmPuzzle.isComplete()) triggerOhmAwakening();
      else if (isOhmAwake && storyStep === 'ohm_awakened') startDialogue('ohm_awakening_event');
      else if (isOhmAwake && storyStep === 'edda_surprised') startDialogue('edda_surprised_awakening');
      return true;
    } catch {
      campaignLoadFailed = true;
      return false;
    } finally {
      campaignHydrating = false;
    }
  }

  function clearHeldMovement(): void {
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;
    window.dispatchEvent(new Event('ohmdal:release-controls'));
  }

  function restoreLumenToWorkshop(): void {
    world.characterVisuals.setAction('edda', 'Idle');
    world.characterVisuals.setAction('lumen', 'Idle');
    if (world.lumenNpcEntity.parent !== world.workshopInteriorRoot) {
      world.lumenNpcEntity.reparent(world.workshopInteriorRoot);
    }
    world.lumenNpcEntity.setLocalPosition(0, 0, 2.4);
    world.lumenNpcEntity.setLocalEulerAngles(0, 180, 0);
    world.eddaEntity.setLocalEulerAngles(0, 20, 0);
    world.eddaEntity.setPosition(firstClassEddaOrigin);
    firstClassEddaHead?.setLocalEulerAngles(0, 0, 0);
    firstClassLumenHead?.setLocalEulerAngles(0, 0, 0);
    firstClassRecord.setLocalEulerAngles(10, 0, -16);
    firstClassVisible = false;
    firstClassLessonTime = 0;
    firstClassRecord.enabled = false;
    firstClassDemonstration.reset();
    firstClassDemonstration.root.enabled = false;
  }

  function placeFirstClassActors(): void {
    void world.characterVisuals.ensure('lumen').catch((error) => console.error('Lumen character load failed', error));
    if (world.lumenNpcEntity.parent !== world.plazaRoot) {
      world.lumenNpcEntity.reparent(world.plazaRoot);
    }
    world.lumenNpcEntity.setPosition(3.8, 0, -5.5);
    world.lumenNpcEntity.setEulerAngles(0, 90, 0);
    world.eddaEntity.setPosition(1.55, 0, -5.05);
    world.eddaEntity.setEulerAngles(0, -90, 0);
    world.characterVisuals.setAction('edda', 'Explain');
    world.characterVisuals.setAction('lumen', 'Record');
    firstClassVisible = true;
    firstClassLessonTime = 0;
    firstClassRecord.enabled = true;
    firstClassDemonstration.root.enabled = true;
    if (storyStep === 'arc1_complete') {
      firstClassDemonstration.setPhase('operate');
      firstClassDemonstration.update(0, true);
      firstClassDemonstration.setPhase('verify');
    }
  }

  function firstClassReady(): boolean {
    return storyStep === 'returning'
      && arc1State.currentRegion === 'retorno'
      && isLighthouseRestored(arc1State);
  }

  function startCommunityDialogue(actor: 'councillor' | 'yesca' | 'vega' | 'nereo', restored: boolean): void {
    const root = world.communityActors.roots[actor];
    const player = world.playerEntity.getPosition();
    root.lookAt(player.x, root.getPosition().y, player.z);
    faceConversation(root.getPosition().clone().add(new pc.Vec3(0, 1.4, 0)));
    world.characterVisuals.setAction(actor === 'councillor' ? 'consejera' : actor, 'Explain');
    const nodeId = {
      councillor: restored ? 'castle_councillor_restored' : 'castle_councillor_arrival',
      yesca: restored ? 'forge_yesca_restored' : 'forge_yesca_arrival',
      vega: restored ? 'terraces_vega_restored' : 'terraces_vega_arrival',
      nereo: restored ? 'lighthouse_nereo_restored' : 'lighthouse_nereo_arrival',
    }[actor];
    startDialogue(nodeId);
  }

  function syncViewmodelVisibility(): void {
    // Keep the equipment choice in `isToolEquipped`, but hide the camera child
    // while authored dialogue/cinematics own the frame.
    world.viewmodelRoot.enabled = isToolEquipped && !isCinematicActive && !activeDialogueNode && currentMode !== 'inspect';
  }

  canvas.style.touchAction = 'none';
  const playerControls = createPlayerControls({
    lookSurface: canvas,
    initialYaw: yaw,
    initialPitch: pitch,
    // Existing directional buttons retain their cancellation-safe listeners;
    // only the camera and browser presentation are owned by this adapter.
    isEnabled: () => !runtimeDestroyed && !campaignHydrating && !campaignLoadFailed && !transitionPending && !isCinematicActive
      && !activeDialogueNode && currentMode === 'explore' && !visualPaused,
    onLook: ({ deltaYaw, deltaPitch }) => {
      yaw = (yaw + deltaYaw + 360) % 360;
      pitch = Math.max(-80, Math.min(80, pitch + deltaPitch));
      world.playerEntity.setEulerAngles(0, yaw, 0);
      world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
      playerControls.setLook({ yaw, pitch });
    },
    pointerLock: {
      element: canvas,
      onChange: (locked) => {
        isPointerLocked = locked;
        if (!locked) clearHeldMovement();
      },
    },
    compass: { mount: document.getElementById('plaza-hud') ?? host.parentElement ?? host },
    orientationGate: {
      mount: host.parentElement ?? host,
      onChange: (blocked) => { if (blocked) clearHeldMovement(); },
    },
  });
  function restoreMouseCapture(): void {
    if (!visualHarnessActive && !runtimeDestroyed && !activeDialogueNode
      && currentMode === 'explore' && !playerControls.orientationGate?.isBlocked()) {
      playerControls.pointerLock?.restoreFromGesture();
    }
  }

  let regionalInspection: { kind: RegionPanelKind; yaw: number; pitch: number } | null = null;
  const regionalPanel = createRegionalMaintenancePanel(host.parentElement ?? host, {
    onAction: (action) => {
      if (!regionalInspection || runtimeDestroyed) return;
      arc1State = applyRegionalIntervention(arc1State, action);
      if (action.type === 'lighthouse-trim') audio.playGalvanometerClick();
      else audio.playSwitchClunk();
      updateArc1WorldVisuals();
      regionalPanel.refresh(arc1State);
      queueCampaignSave();
    },
    onClose: () => closeRegionalInspection(),
  });

  function openRegionalInspection(kind: RegionPanelKind, target: readonly [number, number, number]): void {
    if (currentMode !== 'explore' || activeDialogueNode) return;
    regionalInspection = { kind, yaw, pitch };
    currentMode = 'inspect';
    clearHeldMovement();
    document.exitPointerLock?.();
    // Keep the feet at the collision-validated approach. Only turn the view to
    // put the physical cabinet on the exposed left side of the maintenance UI.
    yaw = Math.atan2(-(target[0] - playerPos.x), -(target[2] - playerPos.z)) * 180 / Math.PI - 24;
    pitch = kind === 'forge' ? -12 : -8;
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    world.cameraEntity.setLocalPosition(0, 0, kind === 'forge' ? 2.5 : 1.6);
    regionalPanel.open(kind, arc1State);
    syncViewmodelVisibility();
  }

  function closeRegionalInspection(): void {
    if (!regionalInspection) return;
    yaw = regionalInspection.yaw;
    pitch = regionalInspection.pitch;
    regionalInspection = null;
    regionalPanel.close();
    currentMode = 'explore';
    clearHeldMovement();
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    world.cameraEntity.setLocalPosition(0, 0, 0);
    syncViewmodelVisibility();
    restoreMouseCapture();
  }

  const onWindowBlur = () => {
    clearHeldMovement();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState !== 'visible') clearHeldMovement();
  };

  const onAudioGesture = () => {
    audio.unlockForGesture();
  };

  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pointerdown', onAudioGesture, { passive: true });
  window.addEventListener('keydown', onAudioGesture);

  // Key Handlers
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (campaignHydrating || transitionPending || playerControls.orientationGate?.isBlocked()) return;
    if (campaignLoadFailed) {
      if (!e.repeat && ['e', 'f', 'enter', ' '].includes(k)) void resumeCampaign();
      return;
    }
    if (isCinematicActive) {
      if (!e.repeat && (k === ' ' || k === 'enter' || k === 'e' || k === 'f' || k === 'escape')) {
        e.preventDefault();
        finishArrivalCinematic();
      }
      return;
    }

    if (isOhmInspecting) {
      if (!e.repeat && k === 'escape') {
        e.preventDefault();
        closeOhmInspection();
      } else if (!e.repeat) {
        const gapMap: Record<string, string> = { '1': 'g1', '2': 'g2', '3': 'g3', '4': 'g5', '5': 'g4' };
        const gapId = gapMap[k];
        if (gapId) {
          e.preventDefault();
          handleOhmPuzzleToggle(gapId);
        }
      }
      return;
    }

    if (regionalInspection) {
      if (!e.repeat && k === 'escape') {
        e.preventDefault();
        closeRegionalInspection();
      }
      return;
    }

    if (activeDialogueNode) {
      if (!e.repeat && (k === 'e' || k === 'f' || k === 'enter' || k === ' ')) {
        e.preventDefault();
        triggerInteraction();
      }
      return;
    }

    if (currentMode === 'bitacora') {
      if (!e.repeat && (k === 'tab' || k === 'escape')) {
        e.preventDefault();
        toggleBitacora();
      }
      return;
    }

    if (currentMode === 'inspect') {
      if (!e.repeat && k === 'escape') {
        e.preventDefault();
        handleWorkbenchAction('close');
      }
      return;
    }

    if (k === 'w' || k === 'arrowup') keys.w = true;
    if (k === 's' || k === 'arrowdown') keys.s = true;
    if (k === 'a' || k === 'arrowleft') keys.a = true;
    if (k === 'd' || k === 'arrowright') keys.d = true;
    if (k === 'q' || k === 'r') {
      yaw = (yaw + (k === 'q' ? 7 : -7) + 360) % 360;
      world.playerEntity.setEulerAngles(0, yaw, 0);
      playerControls.setLook({ yaw, pitch });
    }

    if (!e.repeat && (k === 'e' || k === 'f' || k === 'enter' || k === ' ')) {
      triggerInteraction();
    }
    if (!e.repeat && k === 'm') {
      isToolEquipped = !isToolEquipped;
      syncViewmodelVisibility();
      ui.showNotification(isToolEquipped ? 'Galvanoscopio equipado' : 'Galvanoscopio guardado');
    }
    if (!e.repeat && k === 'tab') {
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
    safeAnchorId = transitionId as Arc1SafeAnchorId;
    spawnAtAnchor(transition.anchor);
  }

  async function enterLoadedZone(
    destination: Parameters<typeof zones.activate>[0],
    commit: () => void,
  ): Promise<void> {
    if (transitionPending || runtimeDestroyed) return;
    transitionPending = true;
    clearHeldMovement();
    try {
      // Keep the current room and progression intact until every payload is ready.
      await zones.preload(destination);
      if (runtimeDestroyed) return;
      await zones.activate(destination);
      if (runtimeDestroyed) return;
      commit();
      queueCampaignSave();
    } catch {
      if (!runtimeDestroyed) ui.showNotification('No se pudo cargar la siguiente zona. Acércate de nuevo al acceso para reintentar.');
    } finally {
      transitionPending = false;
      clearHeldMovement();
    }
  }

  // Portal arrival is an actual destination anchor, including its facing.
  spawnAtAnchor(OHMDAL_TRANSITION_ANCHORS['portal-to-plaza'].anchor);

  function closeVisualOverlays(): void {
    restoreFirstClassCamera();
    world.cameraEntity.setLocalPosition(0, 0, 0);
    clearHeldMovement();
    if (isOhmInspecting) closeOhmInspection();
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
    syncViewmodelVisibility();
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
    visualHarnessActive = true;
    closeVisualOverlays();
    restoreLumenToWorkshop();
    zones.deactivate('workshop');
    zones.deactivate('manantial');
    zones.deactivate('castle');
    zones.deactivate('forge-terraces');
    zones.deactivate('lighthouse');
    void zones.activate('plaza');
    circuit = createInitialCircuit();
    arc1State = createArc1GreyboxState();
    clearOhmCompletionTimer();
    ohmCompletionPending = false;
    ohmPuzzle.reset();
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
    visualHarnessActive = true;
    restoreLumenToWorkshop();
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
    syncViewmodelVisibility();

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
      world.characterVisuals.setPaused(paused || reducedMotion);
      world.setAmbientMotionPaused(paused || reducedMotion);
    },
    setReducedMotion(enabled) {
      reducedMotion = enabled;
      world.characterVisuals.setPaused(visualPaused || enabled);
      world.setAmbientMotionPaused(visualPaused || enabled);
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
      world.setPostProcessing(enabled);
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
        characters: world.characterVisuals.diagnostics(),
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
          // Authored captures use their own camera ids; keep diagnostics from
          // reporting the previous base camera after a regional shot.
          camera: (visualCaptureShot ?? visualCamera) as OhmdalVisualCameraName,
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
        ohmInspecting: isOhmInspecting,
        regionalInspection: regionalInspection?.kind ?? null,
        ohmPuzzle: ohmPuzzle.getSnapshot(),
        firstClass: {
          ...firstClassDemonstration.getReadout(),
          readyToVerify: firstClassDemonstration.readyToVerify,
          verified: firstClassDemonstration.verified,
        },
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

  function clearOhmCompletionTimer(): void {
    if (ohmCompletionTimer !== null) {
      window.clearTimeout(ohmCompletionTimer);
      ohmCompletionTimer = null;
    }
  }

  function setOhmInspectionCamera(): boolean {
    const safePosition: readonly [number, number, number] = [
      ohmInspectionPosition.x,
      ohmInspectionPosition.y,
      ohmInspectionPosition.z,
    ];
    if (!world.navigation.isSpawnSafe(safePosition)) {
      ui.showNotification('El panel de contactos no está accesible desde este lado.');
      return false;
    }

    playerPos.copy(ohmInspectionPosition);
    const dx = ohmBodyCenter.x - playerPos.x;
    const dz = ohmBodyCenter.z - playerPos.z;
    yaw = (Math.atan2(-dx, -dz) * 180) / Math.PI;
    yaw = (yaw + 360 - 32) % 360;
    pitch = -4;
    world.playerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    return true;
  }

  function openOhmInspection(): void {
    if (isOhmAwake || isOhmInspecting || ohmCompletionPending) return;
    inspectionPrevPos.copy(playerPos);
    inspectionPrevYaw = yaw;
    inspectionPrevPitch = pitch;
    if (!setOhmInspectionCamera()) return;

    isOhmInspecting = true;
    currentMode = 'inspect';
    clearHeldMovement();
    // The camera is intentionally tied to the real Ohm body and collider.
    // Save the exploration pose before applying the inspection pose.
    document.exitPointerLock?.();
    syncViewmodelVisibility();
    audio.playSwitchClunk();
    ui.setOhmInspectionView?.(
      true,
      ohmPuzzle,
      handleOhmPuzzleToggle,
      handleOhmPuzzleReset,
      closeOhmInspection,
    );
  }

  function closeOhmInspection(options: { commit?: boolean } = {}): void {
    if (!options.commit) {
      clearOhmCompletionTimer();
      ohmCompletionPending = false;
    }
    if (!isOhmInspecting) return;

    isOhmInspecting = false;
    currentMode = 'explore';
    clearHeldMovement();
    ui.setOhmInspectionView?.(false);

    const previous: readonly [number, number, number] = [inspectionPrevPos.x, inspectionPrevPos.y, inspectionPrevPos.z];
    if (world.navigation.isSpawnSafe(previous)) {
      playerPos.copy(inspectionPrevPos);
      yaw = inspectionPrevYaw;
      pitch = inspectionPrevPitch;
    } else {
      // A transition may have changed active solids while the panel was open;
      // keep the player in the validated side waypoint rather than restoring
      // into geometry.
      setOhmInspectionCamera();
    }
    world.playerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    syncViewmodelVisibility();
    if (!options.commit) restoreMouseCapture();
  }

  function handleOhmPuzzleToggle(gapId: string): void {
    if (!isOhmInspecting) return;
    if (ohmCompletionPending) {
      ui.showNotification('El contacto está estabilizándose; espera un momento.');
      return;
    }

    const result = ohmPuzzle.toggleGap(gapId);
    if (result.success) {
      if (result.action === 'placed') {
        audio.playRelayEngage();
        vfx.triggerContactSnap([ohmBodyCenter.x, ohmBodyCenter.y - 0.16, ohmBodyCenter.z]);
      } else {
        audio.playSwitchClunk();
      }
    } else {
      audio.playSwitchClunk();
      if (result.reason === 'broken') {
        vfx.triggerTerminalArc([ohmBodyCenter.x, ohmBodyCenter.y - 0.16, ohmBodyCenter.z], 0.5);
      }
    }
    ui.showNotification(result.message);
    ui.setOhmInspectionView?.(
      true,
      ohmPuzzle,
      handleOhmPuzzleToggle,
      handleOhmPuzzleReset,
      closeOhmInspection,
    );
    if (result.success) queueCampaignSave();

    if (ohmPuzzle.isComplete()) {
      ohmCompletionPending = true;
      audio.playRelayEngage();
      audio.playDiscoveryChime();
      vfx.triggerConductorPulse([ohmBodyCenter.x, ohmBodyCenter.y - 0.36, ohmBodyCenter.z], [ohmBodyCenter.x, ohmBodyCenter.y + 0.62, ohmBodyCenter.z]);
      clearOhmCompletionTimer();
      ohmCompletionTimer = window.setTimeout(() => {
        ohmCompletionTimer = null;
        if (runtimeDestroyed || !ohmCompletionPending || !ohmPuzzle.isComplete()) return;
        ohmCompletionPending = false;
        closeOhmInspection({ commit: true });
        triggerOhmAwakening();
      }, 700);
    }
  }

  function handleOhmPuzzleReset(): void {
    if (!isOhmInspecting) return;
    clearOhmCompletionTimer();
    ohmCompletionPending = false;
    ohmPuzzle.reset();
    audio.playSwitchClunk();
    ui.showNotification('Puentes retirados a la bandeja de material.');
    ui.setOhmInspectionView?.(
      true,
      ohmPuzzle,
      handleOhmPuzzleToggle,
      handleOhmPuzzleReset,
      closeOhmInspection,
    );
    queueCampaignSave();
  }

  // Awakening Sequence for Ohm
  function triggerOhmAwakening(): void {
    if (isOhmAwake || !ohmPuzzle.isComplete()) return;
    isOhmAwake = true;
    storyStep = 'ohm_awakened';
    world.ohmFilamentLight.light!.intensity = 2.8;
    vfx.triggerConductorPulse([ohmBodyCenter.x, ohmBodyCenter.y - 0.36, ohmBodyCenter.z], [ohmBodyCenter.x, ohmBodyCenter.y + 0.62, ohmBodyCenter.z]);
    vfx.triggerTerminalArc([ohmBodyCenter.x, ohmBodyCenter.y - 0.06, ohmBodyCenter.z], 1.2);
    audio.playDiscoveryChime();
    ui.showNotification('⚡ ¡Lazo de corriente cerrado! El filamento de Ohm despierta.');
    bitacora.unlock('despertar_ohm');
    queueCampaignSave();

    if (ohmAwakeningDialogueTimer !== null) window.clearTimeout(ohmAwakeningDialogueTimer);
    ohmAwakeningDialogueTimer = window.setTimeout(() => {
      ohmAwakeningDialogueTimer = null;
      if (runtimeDestroyed) return;
      startDialogue('ohm_awakening_event');
    }, 450);
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

  function getWorldAmbienceRegion(): Arc1GreyboxState['currentRegion'] {
    const active = new Set(zones.snapshot().filter((zone) => zone.active).map((zone) => zone.id));
    if (active.has('lighthouse')) return 'faro';
    if (active.has('forge-terraces')) return playerPos.z >= 8 ? 'terrazas' : 'forja';
    if (active.has('castle')) return 'castillo';
    if (active.has('manantial')) return 'manantial';
    if (active.has('workshop')) return 'taller';
    if (active.has('plaza')) {
      return arc1State.currentRegion === 'retorno' ? 'retorno'
        : arc1State.currentRegion === 'portal' ? 'portal' : 'plaza';
    }
    return 'portal';
  }

  function getWorldAmbienceElectricalState() {
    const manantial = evaluateManantial(arc1State);
    const forge = evaluateForgeTerraces(arc1State);
    const forgePowered = arc1State.forgeTerraces.energized && forge.structurallyValid;
    return {
      // CircuitState is the source of truth for this physical Plaza load.
      fountainPowered: circuit.fountainActive,
      manantialWaterFlow: manantial.flowRate / 10,
      // The turbine hum requires the complete gated output, not merely an
      // excitation switch left on while the return path is open.
      manantialMachinePower: manantial.usefulOutput > 0 ? 1 : 0,
      forgeHeaterPower: forgePowered ? Math.max(0, Math.min(1, arc1State.forgeTerraces.allocation.forge / 5)) : 0,
      terracesPumpPower: forgePowered ? Math.max(0, Math.min(1, arc1State.forgeTerraces.allocation.terraces / 5)) : 0,
      lighthouseBeaconPower: isLighthouseEmitting(arc1State) ? 1 : 0,
    };
  }

  let worldAmbienceAccumulator = 0;
  function updateWorldAmbience(dt: number): void {
    worldAmbienceAccumulator += Number.isFinite(dt) ? Math.max(0, dt) : 0;
    if (worldAmbienceAccumulator < 1 / 12) return;
    worldAmbienceAccumulator = 0;
    audio.updateWorldAmbience({
      position: [playerPos.x, playerPos.y, playerPos.z],
      headingDegrees: yaw,
      region: getWorldAmbienceRegion(),
      electrical: getWorldAmbienceElectricalState(),
      paused: visualPaused || isCinematicActive || isOhmInspecting || regionalInspection !== null
        || Boolean(playerControls.orientationGate?.isBlocked()),
      hidden: document.visibilityState !== 'visible',
      reducedMotion,
    });
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
    const waterActive = arc1State.forgeTerraces.energized && forgeTerraces.structurallyValid
      && arc1State.forgeTerraces.allocation.terraces > 0;
    vfx.setWaterMist('terraces', waterActive, [114.0, 4.5, 10.0]);
    if (world.arc1Greybox.terracesWaterChannels) {
      for (const channel of world.arc1Greybox.terracesWaterChannels) {
        channel.enabled = waterActive;
      }
    }

    const lighthouseLamp = world.arc1Greybox.lighthouseBeacon.findByName('LighthouseBeaconLamp') as pc.Entity | null;
    const beaconWorking = isLighthouseEmitting(arc1State);
    world.regionalHeroVisuals.setPower(arc1State.forgeTerraces.energized && forgeTerraces.structurallyValid
      ? arc1State.forgeTerraces.allocation.forge / 5 : 0, beaconWorking);
    const thermalSpill = world.arc1Greybox.forgeHeater.findByName('ForgeThermalSpill') as pc.Entity | null;
    if (thermalSpill?.light) thermalSpill.light.intensity = arc1State.forgeTerraces.energized && forgeTerraces.structurallyValid
      ? arc1State.forgeTerraces.allocation.forge * 0.8 : 0;
    if (lighthouseLamp) lighthouseLamp.enabled = beaconWorking;
    setEntityLightsEnabled(world.arc1Greybox.lighthouseBeacon, beaconWorking);
    world.arc1Greybox.lighthouseSignal.enabled = beaconWorking;

    // Legacy global calls remain for the shared API, but PlayCanvas creates
    // PlazaAudioEngine with ambientBed:false; Arc1WorldAmbience owns the
    // spatial water/machine bed without doubling these layers.
    audio.setWaterFlow(arc1State.manantial.gateOpen ? (manantial.restored ? 1.0 : 0.6) : 0);
    audio.setTurbineHum(arc1State.manantial.gateOpen ? 0.9 : 0);
    const loadFactor = (arc1State.castle.energized ? 0.35 : 0) + (arc1State.forgeTerraces.energized ? 0.35 : 0) + (beaconWorking ? 0.3 : 0);
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
          void enterLoadedZone('plaza', () => {
          teleportPlayer('workshop-to-plaza');
          zones.deactivate('workshop');
          arc1State = enterArc1Region(arc1State, 'taller');
          storyStep = 'returned_to_plaza';
          ui.showNotification('Saliste a la Plaza Central de Ohmdal.');
          });
        },
      });
      list.push({
        id: 'workshop_inspect_bench',
        label: 'Examinar banco de relés y esquemas',
        pos: new pc.Vec3(-60, 1.0, 0.4),
        radius: 2.8,
        action: () => {
          clearHeldMovement();
          currentMode = 'inspect';
          document.exitPointerLock?.();
          workbench.open('cuadro_rele');
          ui.setWorkbenchView(true, workbench, handleWorkbenchAction);
          syncViewmodelVisibility();
        },
      });
    } else if (inLighthouse) {
      const nereo = world.communityActors.actors.nereo.root;
      const lighthouseVerificationPoints = arc1State.lighthouse.verificationPoints ?? [];
      const lighthouseNeedsFeedVerification = arc1State.lighthouse.energized
        && !lighthouseVerificationPoints.includes('feed');
      const lighthouseNeedsBeaconVerification = arc1State.lighthouse.energized
        && !lighthouseVerificationPoints.includes('beacon');
      list.push({
        id: 'community_nereo',
        label: isLighthouseRestored(arc1State) ? 'Hablar con Nereo sobre el Faro restaurado' : 'Hablar con Nereo sobre la alimentación del Faro',
        pos: nereo.getPosition().clone(),
        radius: 2.4,
        action: () => startCommunityDialogue('nereo', isLighthouseRestored(arc1State)),
      });
      list.push({
        id: 'lighthouse_bus_measure',
        label: lighthouseNeedsFeedVerification
          ? 'Verificar alimentación DC con la baliza encendida'
          : 'Medir alimentación DC del Faro',
        pos: new pc.Vec3(180, 1.1, -8),
        radius: 2.2,
        action: () => {
          arc1State = measureLighthouse(arc1State);
          if (arc1State.lighthouse.energized) arc1State = synchronizeLighthouse(arc1State, 0, 'feed');
          const evaluation = evaluateLighthouse(arc1State);
          showArc1Measurement('Faro · barra DC', evaluation.sourceVoltage, evaluation.sourceCurrent,
            arc1State.lighthouse.energized ? 'alimentación comprobada con la baliza encendida' : 'medición registrada con la baliza apagada');
        },
      });
      list.push({
        id: 'lighthouse_calibration_panel',
        label: arc1State.lighthouse.protectiveTrip ? 'Rearmar protección del Faro' : 'Examinar ajuste de referencia del Faro',
        pos: new pc.Vec3(180, 1.2, 0),
        radius: 2.4,
        action: () => {
          if (arc1State.lighthouse.protectiveTrip) {
            arc1State = repairLighthouse(arc1State);
            audio.playBreakerReset();
            vfx.triggerTerminalArc([180, 1.2, 0], 1.0);
            ui.showNotification('Protección del Faro rearmada; la evidencia de la falla se conserva.');
          } else {
            openRegionalInspection('lighthouse', [180, 1.2, 0]);
          }
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'lighthouse_beacon_control',
        label: arc1State.lighthouse.energized
          ? lighthouseNeedsBeaconVerification ? 'Verificar tensión en la baliza' : 'Repetir verificación de la baliza'
          : 'Energizar baliza calibrada',
        pos: new pc.Vec3(180, 1.25, 8),
        radius: 2.8,
        action: () => {
          arc1State = arc1State.lighthouse.energized
            ? synchronizeLighthouse(arc1State, 0, 'beacon')
            : energizeLighthouse(arc1State);
          const evaluation = evaluateLighthouse(arc1State);
          if (arc1State.lighthouse.protectiveTrip) {
            audio.playBreakerTrip();
            vfx.triggerTerminalArc([180, 1.25, 8], 1.6);
          } else {
            audio.playBeaconSync();
            vfx.triggerConductorPulse([180, 1.25, 8], [180, 5.0, 8]);
          }
          const verificationPoints = arc1State.lighthouse.verificationPoints ?? [];
          const missingFeedVerification = !verificationPoints.includes('feed');
          const missingBeaconVerification = !verificationPoints.includes('beacon');
          ui.showNotification(arc1State.lighthouse.protectiveTrip
            ? 'La protección actuó: mide y calibra antes de sincronizar.'
              : arc1State.lighthouse.synchronizationSamples >= 2
                ? 'Alimentación y baliza comprobadas. El registro puede repetirse.'
                : missingFeedVerification && missingBeaconVerification
                  ? 'La baliza recibe energía. Verifica la tensión junto a la baliza y repite la medición en la barra de alimentación.'
                  : missingFeedVerification
                    ? 'La baliza está verificada. Repite la medición en la barra de alimentación con la baliza encendida.'
                    : missingBeaconVerification
                      ? 'La alimentación está verificada. Contrasta ahora la tensión junto a la baliza.'
                      : 'La baliza recibe energía. Contrasta la lectura aquí y en la barra de alimentación.');
          if (evaluation.restored) storyStep = 'lighthouse_restored';
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'lighthouse_return_marker',
        label: isLighthouseRestored(arc1State)
          ? 'Iniciar regreso por la red restaurada'
          : lighthouseNeedsFeedVerification && lighthouseNeedsBeaconVerification
            ? 'Registrar: verificar alimentación y baliza'
            : lighthouseNeedsFeedVerification
              ? 'Registrar: verificar alimentación DC'
              : lighthouseNeedsBeaconVerification
                ? 'Registrar: verificar tensión en la baliza'
                : 'Registrar calibración validada',
        pos: new pc.Vec3(180, 1.0, 14),
        radius: 2.4,
        action: () => {
          if (!isLighthouseRestored(arc1State)) {
            arc1State = documentLighthouse(arc1State);
            if (!isLighthouseRestored(arc1State)) {
              ui.showNotification('Comprueba la alimentación y la baliza encendida antes de registrar el Faro.');
              return;
            }
          }
          void enterLoadedZone('forge-terraces', () => {
          arc1State = enterArc1Region(arc1State, 'retorno');
          zones.deactivate('lighthouse');
          teleportPlayer('lighthouse-to-forge-terraces');
          storyStep = 'returning';
          ui.showNotification('Regresa por Terrazas, Castillo y Plaza; la red sigue restaurada.');
          });
        },
      });
    } else if (inForgeTerraces) {
      const yesca = world.communityActors.actors.yesca.root;
      const vega = world.communityActors.actors.vega.root;
      list.push({
        id: 'community_yesca',
        label: isForgeTerracesRestored(arc1State) ? 'Hablar con Yesca sobre la Forja estable' : 'Hablar con Yesca sobre la carga de la Forja',
        pos: yesca.getPosition().clone(),
        radius: 2.4,
        action: () => startCommunityDialogue('yesca', isForgeTerracesRestored(arc1State)),
      });
      list.push({
        id: 'community_vega',
        label: isForgeTerracesRestored(arc1State) ? 'Hablar con Vega sobre el riego restablecido' : 'Hablar con Vega sobre los niveles de riego',
        pos: vega.getPosition().clone(),
        radius: 2.4,
        action: () => startCommunityDialogue('vega', isForgeTerracesRestored(arc1State)),
      });
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
        label: 'Examinar regulación de la Forja',
        pos: new pc.Vec3(124.2, 1.2, -8),
        radius: 3.1,
        action: () => {
          openRegionalInspection('forge', [124.2, 1.2, -8]);
        },
      });
      list.push({
        id: 'forge_distribution_panel',
        label: arc1State.forgeTerraces.protectiveTrip ? 'Rearmar protección de Forja/Terrazas' : 'Energizar las cargas configuradas',
        pos: new pc.Vec3(120, 1.2, 0),
        radius: 2.5,
        action: () => {
          if (arc1State.forgeTerraces.protectiveTrip) {
            arc1State = repairForgeTerraces(arc1State);
            audio.playBreakerReset();
            vfx.triggerTerminalArc([120, 1.2, 0], 1.2);
            ui.showNotification('Protecciones rearmadas; ajusta la asignación antes de energizar.');
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
              ? 'La protección actuó: revisa carga, conductor y medición.'
              : 'Forja y riego reciben energía dentro del límite.');
          }
          updateArc1WorldVisuals();
        },
      });
      list.push({
        id: 'terraces_pump_control',
        label: arc1State.forgeTerraces.energized ? 'Registrar el servicio de riego observado' : 'Examinar regulación de la bomba',
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
            openRegionalInspection('forge', [120, 1.2, 16]);
          }
          ui.showNotification(isForgeTerracesRestored(arc1State)
            ? 'Servicio documentado: calor y riego se sostienen dentro de los límites.'
            : arc1State.forgeTerraces.energized ? 'La evidencia aún no permite documentar ambas cargas.' : 'Observa cuánto reciben la Forja y las Terrazas antes de repartir la energía.');
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
            void enterLoadedZone('castle', () => {
            zones.deactivate('forge-terraces');
            teleportPlayer('forge-terraces-to-castle');
            });
            return;
          }
          if (!isForgeTerracesRestored(arc1State) || !arc1State.visitedRegions.includes('terrazas')) {
            ui.showNotification('Forja y Terrazas deben quedar estables y documentadas antes del Faro.');
            return;
          }
          void enterLoadedZone('lighthouse', () => {
          arc1State = enterArc1Region(arc1State, 'faro');
          zones.deactivate('forge-terraces');
          teleportPlayer('forge-terraces-to-lighthouse');
          storyStep = 'inside_lighthouse';
          });
        },
      });
    } else if (inCastle) {
      const councillor = world.communityActors.actors.councillor.root;
      list.push({
        id: 'community_councillor',
        label: isCastleRestored(arc1State) ? 'Hablar con la Consejera sobre el Castillo estable' : 'Hablar con la Consejera sobre la distribución',
        pos: councillor.getPosition().clone(),
        radius: 2.4,
        action: () => startCommunityDialogue('councillor', isCastleRestored(arc1State)),
      });
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
        label: 'Examinar conexiones de los ramales',
        pos: new pc.Vec3(53.8, 1.15, 0),
        radius: 2.4,
        action: () => {
          openRegionalInspection('castle', [53.8, 1.15, 0]);
        },
      });
      list.push({
        id: 'castle_mixed_layout',
        label: 'Examinar conexiones desde la galería',
        pos: new pc.Vec3(60, 1.15, 5.8),
        radius: 1.5,
        action: () => {
          openRegionalInspection('castle', [60, 1.15, 5.8]);
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
            : arc1State.castle.energized ? 'Distribución energizada; verifica y documenta.' : 'Protección rearmada.');
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
            ? 'Esquema publicado: los barrios reciben suministro y las lecturas quedan disponibles para mantenimiento.'
            : 'Mide y energiza una configuración válida antes de documentarla.');
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
            void enterLoadedZone('plaza', () => {
            zones.deactivate('castle');
            teleportPlayer('castle-to-plaza');
            placeFirstClassActors();
            ui.showNotification('Volviste a la Plaza por la red restaurada.');
            });
            return;
          }
          if (!isCastleRestored(arc1State)) {
            ui.showNotification('La distribución debe quedar medida, energizada y documentada.');
            return;
          }
          void enterLoadedZone('forge-terraces', () => {
          arc1State = enterArc1Region(arc1State, 'forja');
          zones.deactivate('castle');
          teleportPlayer('castle-to-forge-terraces');
          storyStep = 'inside_forge_terraces';
          });
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
            ? 'Primero mide la salida para localizar la discontinuidad.'
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
            : 'El generador entrega energía; verifica la salida con una segunda medición.');
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
      if (firstClassReady() && !firstClassVisible) placeFirstClassActors();
      list.push({
        id: 'edda_npc',
        label: firstClassReady()
          ? 'Asistir a la primera clase de Edda y Lumen'
          : isOhmAwake ? 'Hablar con Edda sobre el taller' : 'Hablar con Edda (Estudiosa)',
        pos: world.eddaEntity.getPosition(),
        radius: 2.0,
        action: () => {
          if (firstClassReady()) {
            placeFirstClassActors();
            startDialogue('arc1_first_class');
          } else if (!isOhmAwake) {
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

      if (!isOhmAwake) {
        // The GLB exposes a top hatch node but no rear panel mesh. Keep the
        // interaction grounded in the authored body and call it a contact
        // panel rather than claiming an unbuilt hatch or cable puzzle.
        list.push({
          id: 'ohm_contact_panel',
          label: 'Inspeccionar panel de contactos de Ohm',
          pos: new pc.Vec3(1.7, 1.0, -1.1),
          radius: 1.9,
          action: openOhmInspection,
        });
        list.push({
          id: 'ohm_front_inert',
          label: 'Examinar a Ohm (Inerte)',
          pos: new pc.Vec3(0, 1.0, -2.95),
          radius: 1.65,
          action: () => {
            audio.playSwitchClunk();
            ui.showNotification('Ohm está completamente inerte. Observa el panel de contactos del pedestal.');
          },
        });
      } else {
        list.push({
          id: 'ohm_automaton_pedestal',
          label: 'Consultar telemetría con Ohm',
          pos: new pc.Vec3(0, 1.0, -2.0),
          radius: 3.6,
          action: () => {
            if (firstClassReady()) {
              placeFirstClassActors();
              startDialogue('arc1_first_class');
            } else if (storyStep === 'arc1_complete') {
              ui.showNotification('La red del Arco I está restaurada.');
            } else if (arc1State.currentRegion === 'retorno' && isLighthouseRestored(arc1State)) {
              storyStep = 'returning';
              placeFirstClassActors();
              startDialogue('arc1_first_class');
            } else {
              startDialogue('ohm_awakening_event');
            }
          },
        });
      }

      list.push({
        id: 'workshop_exterior_door',
        label: 'Entrar al Taller de Lumen (Interior)',
        pos: new pc.Vec3(-7.4, 1.2, -4.0),
        radius: 3.0,
        action: () => {
          void enterLoadedZone('workshop', () => {
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
          clearHeldMovement();
          currentMode = 'inspect';
          document.exitPointerLock?.();
          workbench.open('cuadro_rele');
          ui.setWorkbenchView(true, workbench, handleWorkbenchAction);
          syncViewmodelVisibility();
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

      if (circuit.branches.b_brecha_a_oxido.state === 'corroded') list.push({
        id: 'moho_oxido',
        label: hasBrushItem
          ? 'Limpiar contacto sulfatado con el cepillo'
          : 'Examinar contacto sulfatado · necesita cepillo de alambre',
        pos: new pc.Vec3(CONTACT_AFFORDANCE_CENTER[0], 0.4, CONTACT_AFFORDANCE_CENTER[2]),
        radius: 2.8,
        action: () => {
          // Examining a low floor fitting should show the fitting being
          // discussed, including when it begins below the player's view.
          faceConversation(world.probeTargets['retorno_oxido']);
          if (hasBrushItem) {
            circuit.branches.b_brecha_a_oxido.state = 'closed';
            circuit.branches.b_brecha_a_oxido.resistance = 0.05;
            circuit = solveCircuit(circuit);
            world.corrosionMesh.enabled = false;
            audio.playWireScrape();
            vfx.triggerDustWake([CONTACT_AFFORDANCE_CENTER[0], 0.2, CONTACT_AFFORDANCE_CENTER[2]], 0.8);
            bitacora.unlock('moho_verde');
            bitacora.unlock('ley_retorno');
            ui.showNotification('¡Contacto limpio! Cobre expuesto (0.05Ω).');
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
            void enterLoadedZone('castle', () => {
            arc1State = enterArc1Region(arc1State, 'castillo');
            zones.deactivate('plaza');
            teleportPlayer('plaza-to-castle');
            storyStep = 'inside_castle';
            });
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
            void enterLoadedZone('manantial', () => {
            arc1State = enterArc1Region(arc1State, 'manantial');
            teleportPlayer('plaza-to-manantial');
            storyStep = 'inside_manantial';
            bitacora.unlock('manantial_central_hidraulica', 'investigating');
            ui.showNotification('Avanzaste por el sendero hacia la montaña y el Manantial.');
            });
          } else {
            ui.showNotification('Los solenoides magnéticos de la Gran Puerta necesitan corriente de retorno activa.');
          }
        },
      });
    }

    return list;
  }

  function hideContactTargetLabel(): void {
    contactTargetLabel.update({ visible: false });
  }

  function renderContactTargetLabel(nearestInteractable: string | null): boolean {
    const camera = world.cameraEntity.camera;
    if (!camera) {
      hideContactTargetLabel();
      return false;
    }

    const probeState = galvanoscope.getState();
    const toContact = contactLabelWorldPosition.clone().sub(world.cameraEntity.getPosition());
    const pointInFront = toContact.dot(world.cameraEntity.forward) > 0.05;
    const allowed = shouldShowContactTargetLabel({
      nearestInteractable,
      // The campaign still calls the opening chapter 'portal'. Visibility
      // follows the active rendered zone, including that first Plaza visit.
      currentRegion: world.plazaRoot.enabled ? 'plaza' : arc1State.currentRegion,
      currentMode,
      dialogueOpen: activeDialogueNode !== null,
      loading: campaignHydrating || campaignLoadFailed || transitionPending || isCinematicActive,
      modalOpen: isOhmInspecting || regionalInspection !== null || Boolean(playerControls.orientationGate?.isBlocked()),
        // A connected probe is retained in the Galvanoscope state after the
        // player puts the tool away. Only an equipped tool should suppress the
        // contact affordance while the player is actively probing.
        probeActive: isToolEquipped && Boolean(probeState.probeA || probeState.probeB),
      residueVisible: world.corrosionMesh.enabled,
      pointInFront,
    });
    if (!allowed) {
      hideContactTargetLabel();
      return false;
    }

    contactTargetLabel.setText(getContactTargetLabelText(hasBrushItem));
    const labelSize = contactTargetLabel.measure();
    const canvasRect = canvas.getBoundingClientRect();
    const overlayRect = contactLabelHost.getBoundingClientRect();
    const deviceRect = world.app.graphicsDevice.clientRect;
    if (canvasRect.width <= 0 || canvasRect.height <= 0 || deviceRect.width <= 0 || deviceRect.height <= 0) {
      hideContactTargetLabel();
      return false;
    }
    camera.worldToScreen(contactLabelWorldPosition, contactLabelScreenPosition);
    const cssX = canvasRect.left - overlayRect.left
      + contactLabelScreenPosition.x * (canvasRect.width / deviceRect.width);
    const cssY = canvasRect.top - overlayRect.top
      + contactLabelScreenPosition.y * (canvasRect.height / deviceRect.height);
    const projection = projectContactTargetLabel({
      screenX: cssX,
      screenY: cssY,
      viewportWidth: overlayRect.width,
      viewportHeight: overlayRect.height,
      labelWidth: labelSize.width || 280,
      labelHeight: labelSize.height || 28,
    });
    if (!projection) {
      hideContactTargetLabel();
      return false;
    }
    contactTargetLabel.update({ visible: true, left: projection.left, top: projection.top });
    return true;
  }

  function faceConversation(target: pc.Vec3, backoff = 0): void {
    const dx = target.x - playerPos.x, dz = target.z - playerPos.z;
    yaw = Math.atan2(-dx, -dz) * 180 / Math.PI;
    pitch = Math.atan2(target.y - playerPos.y, Math.hypot(dx, dz) + backoff) * 180 / Math.PI;
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    world.cameraEntity.setLocalPosition(0, 0, backoff);
    playerControls.setLook({ yaw, pitch });
  }

  function faceCharacterToPlayer(root: pc.Entity): void {
    // Character GLBs are wrapped with a 180° local heading so their authored
    // +Z face follows the gameplay root's semantic -Z.  Keep that wrapper
    // untouched and rotate only the semantic root toward the player.
    const position = root.getPosition();
    root.lookAt(playerPos.x, position.y, playerPos.z);
  }

  function frameFirstClass(): void {
    if (!firstClassCameraRestore) firstClassCameraRestore = {
      position: world.cameraEntity.getLocalPosition().clone(),
      rotation: world.cameraEntity.getLocalRotation().clone(), yaw, pitch,
    };
    // A scene camera brings the instrument and both faces into view without
    // teleporting the player's feet or changing their resume anchor.
    yaw = 0;
    pitch = Math.atan2(1.05 - 1.7, 2.55) * 180 / Math.PI;
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
    world.cameraEntity.setPosition(2.45, 1.7, -2.65);
    playerControls.setLook({ yaw, pitch });
  }

  function restoreFirstClassCamera(): void {
    if (!firstClassCameraRestore) return;
    const previous = firstClassCameraRestore;
    firstClassCameraRestore = null;
    yaw = previous.yaw; pitch = previous.pitch;
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalPosition(previous.position);
    world.cameraEntity.setLocalRotation(previous.rotation);
    playerControls.setLook({ yaw, pitch });
  }

  function startDialogue(nodeId: string): void {
    const node = ARC1_COMMUNITY_DIALOGUES[nodeId] ?? DIALOGUE_DATABASE[nodeId];
    if (!node) return;
    // Keep the ordinary Edda/Lumen conversations readable after a cinematic
    // or zone transition.  The first-class scene owns its own choreography
    // and community dialogues already face their selected actor before this
    // function is called.
    if (nodeId !== 'arc1_first_class') {
      const speakerRoot = nodeId === 'lumen_workshop_interior'
        ? world.lumenNpcEntity
        : nodeId === 'intro_portal_edda'
          || nodeId === 'edda_surprised_awakening'
          || nodeId === 'circuit_solved_dialog'
          ? world.eddaEntity
          : null;
      if (speakerRoot) {
        faceCharacterToPlayer(speakerRoot);
        faceConversation(speakerRoot.getPosition().clone().add(new pc.Vec3(0, 1.45, 0)));
      }
    }
    activeDialogueNode = node;
    document.getElementById('plaza-dialog')?.toggleAttribute('data-first-class', nodeId === 'arc1_first_class');
    if (nodeId === 'arc1_first_class') {
      firstClassDemonstration.reset();
      firstClassDemonstration.root.enabled = true;
      frameFirstClass();
    }
    activeDialogueLineIndex = 0;
    clearHeldMovement();
    document.exitPointerLock?.();
    syncViewmodelVisibility();
    renderCurrentDialogueLine();
  }

  function renderCurrentDialogueLine(): void {
    if (!activeDialogueNode) return;
    if (activeDialogueNode.id === 'arc1_first_class') {
      const phase = (['observe', 'operate', 'verify'] as const)[activeDialogueLineIndex]!;
      firstClassDemonstration.setPhase(phase);
      world.characterVisuals.setAction('edda', phase === 'operate' ? 'Operate' : 'Observe');
      world.characterVisuals.setAction('lumen', phase === 'observe' ? 'Listen' : 'Record');
    }
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
    const hint = document.querySelector<HTMLElement>('#plaza-dialog .dialog-hint');
    if (hint) hint.textContent = window.matchMedia('(pointer: coarse)').matches
      ? 'Toca para continuar' : '[E / Clic para continuar]';
  }

  function advanceDialogue(): void {
    if (!activeDialogueNode) return;
    if (activeDialogueNode.id === 'arc1_first_class' && activeDialogueLineIndex === 1
      && !firstClassDemonstration.readyToVerify) return;
    if (activeDialogueLineIndex < activeDialogueNode.lines.length - 1) {
      activeDialogueLineIndex += 1;
      renderCurrentDialogueLine();
    } else {
      if (!activeDialogueNode.choices) {
        if (activeDialogueNode.id === 'arc1_first_class') {
          if (!firstClassDemonstration.verified) return;
          restoreFirstClassCamera();
          arc1State = enterArc1Region(arc1State, 'portal');
          storyStep = 'arc1_complete';
          ui.showNotification('La red del Arco I está restaurada.');
        }
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
          storyStep = 'edda_surprised';
          saveCampaign();
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
        syncViewmodelVisibility();
        restoreMouseCapture();
        queueCampaignSave();
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
      queueCampaignSave();
    } else if (actionName === 'scrape_corrosion') {
      workbench.scrapeCorrosion();
      circuit.branches.b_brecha_a_oxido.state = 'closed';
      circuit.branches.b_brecha_a_oxido.resistance = 0.05;
      circuit = solveCircuit(circuit);
      world.corrosionMesh.enabled = false;
      audio.playWireScrape();
      bitacora.unlock('moho_verde');
      updateCircuitStateVisuals();
      queueCampaignSave();
    } else if (actionName === 'install_jumper') {
      workbench.installJumper();
      circuit.branches.b_brecha_retorno.state = 'closed';
      circuit = solveCircuit(circuit);
      world.copperJumper.enabled = true;
      audio.playSwitchClunk();
      bitacora.unlock('brecha_sagrada');
      updateCircuitStateVisuals();
      queueCampaignSave();
    } else if (actionName === 'close') {
      workbench.close();
      clearHeldMovement();
      currentMode = 'explore';
      ui.setWorkbenchView(false);
      syncViewmodelVisibility();
      restoreMouseCapture();
    }
  }

  function updateCircuitStateVisuals(options: { showDialogue?: boolean; deriveStory?: boolean } = {}): void {
    const showDialogue = options.showDialogue ?? true;
    const deriveStory = options.deriveStory ?? true;
    if (circuit.relayEnergized) {
      world.relayLight.light!.intensity = 2.4;
    } else {
      world.relayLight.light!.intensity = 0.6;
    }

    if (circuit.gateOpen) {
      void zones.preload('manantial');
      world.solenoidGate.setPosition(0, OMEGA_GATE_TUNING.openY, 11.5);
      world.navigation.setSolidEnabled('plaza.omega-gate', false);
      world.navigation.setPortalOpen('plaza-to-manantial', true);
      world.gateLightLeft.light!.color = new pc.Color(0.2, 1.0, 0.4);
      world.gateLightRight.light!.color = new pc.Color(0.2, 1.0, 0.4);
      bitacora.unlock('puerta_ohm');
      if (deriveStory) storyStep = 'gate_opened';
      if (showDialogue && !campaignHydrating && activeDialogueNode === null) {
        startDialogue('circuit_solved_dialog');
        audio.playDiscoveryChime();
      }
    } else {
      world.solenoidGate.setPosition(0, OMEGA_GATE_TUNING.closedY, 11.5);
      world.navigation.setSolidEnabled('plaza.omega-gate', true);
      world.navigation.setPortalOpen('plaza-to-manantial', false);
    }
  }

  function toggleBitacora(): void {
    if (currentMode === 'bitacora') {
      clearHeldMovement();
      currentMode = 'explore';
      ui.setBitacoraView(false);
      syncViewmodelVisibility();
      restoreMouseCapture();
      return;
    }

    if (currentMode !== 'explore' || activeDialogueNode || isCinematicActive) return;

    clearHeldMovement();
    currentMode = 'bitacora';
    document.exitPointerLock?.();
    ui.setBitacoraView(true, bitacora);
    syncViewmodelVisibility();
  }

  function triggerInteraction(): void {
    if (campaignHydrating || transitionPending || playerControls.orientationGate?.isBlocked()) return;
    if (campaignLoadFailed) { void resumeCampaign(); return; }
    if (isCinematicActive) {
      finishArrivalCinematic();
      return;
    }

    if (activeDialogueNode) {
      advanceDialogue();
      return;
    }

    if (currentMode !== 'explore') return;

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
      queueCampaignSave();
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

  const onCanvasClick = (event: MouseEvent) => {
    // Touch look gestures must never become a synthesized world interaction.
    if ('pointerType' in event && event.pointerType && event.pointerType !== 'mouse') return;
    if (playerControls.orientationGate?.isBlocked() || campaignHydrating || transitionPending) return;
    if (isCinematicActive) {
      finishArrivalCinematic();
      return;
    }
    if (!isPointerLocked && !activeDialogueNode && currentMode === 'explore') {
      playerControls.pointerLock?.requestFromGesture(event);
    } else {
      triggerInteraction();
    }
  };
  canvas.addEventListener('click', onCanvasClick);

  const isBlocked = (x: number, z: number) => {
    return world.navigation.collides(x, z, 0.4);
  };

  // PlayCanvas Engine Update Loop
  let currentNeedleAngle = 60;
  let needleTarget = 60;
  let dormantPilotTime = 0;

  world.app.on('update', (dt: number) => {
    world.updateFountain(dt, circuit.fountainActive, visualPaused, reducedMotion);
    updateWorldAmbience(dt);
    if (!isOhmAwake && !isCinematicActive && !activeDialogueNode && !visualPaused && !reducedMotion) {
      dormantPilotTime += dt;
      // Approved B2 failed-life cue: the existing pilot briefly tries to light.
      world.ohmFilamentLight.light!.intensity = dormantPilotTime % 5 < 0.25 ? 0.55 : 0;
    }
    const controlsLook = playerControls.getLook();
    if (controlsLook.yaw !== ((yaw % 360) + 360) % 360 || controlsLook.pitch !== pitch) {
      playerControls.setLook({ yaw, pitch });
    }
    const frameMs = world.app.stats.frame.ms || dt * 1000;
    if (frameMs > 0 && Number.isFinite(frameMs)) {
      frameTimeSamples.push(frameMs);
      if (frameTimeSamples.length > 240) frameTimeSamples.shift();
    }

    // 0. Arrival Cinematic Camera Progression
    if (isCinematicActive && !visualPaused && !playerControls.orientationGate?.isBlocked()) {
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
      hideContactTargetLabel();
      return;
    }

    if (isOhmInspecting) {
      // Freeze the exploration camera while the contact panel owns input.
      world.playerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
      world.playerEntity.setEulerAngles(0, yaw, 0);
      world.cameraEntity.setLocalEulerAngles(pitch, 0, 0);
      ui.setPrompt(null);
      hideContactTargetLabel();
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
    if (currentMode === 'explore' && !activeDialogueNode && isMoving && !visualPaused
      && !campaignHydrating && !campaignLoadFailed && !transitionPending && !playerControls.orientationGate?.isBlocked()) {
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

    // 2. Rest at the edge while exploring; bring the dial up when a probe is
    // attached. CSS width, rather than DPR-scaled pixels, defines touch layout.
    const compact = world.app.graphicsDevice.canvas.clientWidth <= 900;
    const measuring = Boolean(galvanoscope.getState().probeA || galvanoscope.getState().probeB);
    const layoutKey = `${compact}:${measuring}`;
    if (viewmodelLayoutKey !== layoutKey) {
      viewmodelLayoutKey = layoutKey;
      const scale = compact ? (measuring ? 0.72 : 0.64) : (measuring ? 0.92 : 0.82);
      world.viewmodelRoot.setLocalPosition(
        compact ? 0.14 : 0.30,
        measuring ? -0.20 : -0.25,
        measuring ? -0.58 : -0.62,
      );
      world.viewmodelRoot.setLocalEulerAngles(8, -12, 3);
      world.viewmodelRoot.setLocalScale(scale, scale, scale);
    }

    const gState = galvanoscope.getState();
    const vFraction = Math.max(0, Math.min(1.0, gState.measuredVoltage / 30));
    needleTarget = 60 - vFraction * 120;
    if (!visualPaused && !reducedMotion) currentNeedleAngle += (needleTarget - currentNeedleAngle) * dt * 12.0;
    world.viewmodelNeedle.setLocalEulerAngles(0, 0, currentNeedleAngle);

    if (!visualPaused && !reducedMotion) {
      if (arc1State.manantial.gateOpen) world.regionalHeroVisuals.animateManantial(dt);
      if (arc1State.forgeTerraces.energized && evaluateForgeTerraces(arc1State).structurallyValid) {
        const pumpWheel = world.arc1Greybox.terracesPump.findByName('TerracesPumpWheel') as pc.Entity | null;
        pumpWheel?.rotateLocal(0, 0, dt * arc1State.forgeTerraces.allocation.terraces * 22);
      }
      if (isLighthouseEmitting(arc1State)) world.arc1Greybox.lighthouseSignal.rotateLocal(0, dt * 22, 0);
    }
    if (firstClassVisible && !visualPaused) firstClassDemonstration.update(dt, reducedMotion);
    if (firstClassVisible && !visualPaused && !reducedMotion) {
      firstClassLessonTime += dt;
      const gesture = Math.sin(firstClassLessonTime * 2.4) * 9;
      // Loading fallbacks use a simple nod. Loaded GLBs perform the authored
      // Explain/Record clips; never overwrite their animated Head transforms.
      if (!world.eddaEntity.findByName('CharacterVisual-edda')) firstClassEddaHead?.setLocalEulerAngles(0, gesture, 0);
      if (!world.lumenNpcEntity.findByName('CharacterVisual-lumen')) firstClassLumenHead?.setLocalEulerAngles(0, -gesture * 0.55, 0);
      firstClassRecord.setLocalEulerAngles(10, 0, -16 + Math.sin(firstClassLessonTime * 1.7) * 3);
    }
    manantialActivationVfx.update(dt);
    vfx.update(dt);

    // 3. Prompt detection
    const camPos = world.playerEntity.getPosition();
    let nearestInteractableId: string | null = null;
    let prompt: string | null = campaignLoadFailed ? '[E] Reintentar carga de tu partida'
      : transitionPending || campaignHydrating ? 'Preparando la siguiente zona…' : null;
    if (currentMode === 'explore' && !activeDialogueNode && !transitionPending && !campaignLoadFailed && !campaignHydrating) {
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
        nearestInteractableId = bestItem.id;
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
    const contactLabelVisible = renderContactTargetLabel(nearestInteractableId);
    // On a short touch viewport the duplicate bottom prompt covered the
    // fitting. Keep the localized text and name the actual touch action.
    ui.setPrompt(contactLabelVisible && window.matchMedia('(pointer: coarse)').matches ? null : prompt);
    const touchAction = nearestInteractableId === 'moho_oxido' ? (hasBrushItem ? 'Limpiar' : 'Examinar') : 'Conectar';
    if (touchInteractionButton && touchInteractionButton.textContent !== touchAction) {
      touchInteractionButton.textContent = touchAction;
      touchInteractionButton.setAttribute('aria-label', touchAction);
    }
  });

  function clearStartupDialogueTimer(): void {
    if (startupDialogueTimer !== null) {
      window.clearTimeout(startupDialogueTimer);
      startupDialogueTimer = null;
    }
  }

  function startInitialPresentation(): void {
    if (runtimeDestroyed || campaignResumed || visualHarnessActive) return;
    // Start with the portal arrival cinematic on first entry or the intro
    // dialogue for returning players from before campaign saves existed.
    if (!isIntroSeen()) {
      isCinematicActive = true;
      cinematicTime = 0;
      announceCinematic('portal-arrival');
      ui.setCinematicOverlay?.(true);
      syncViewmodelVisibility();
      return;
    }
    isCinematicActive = false;
    ui.setCinematicOverlay?.(false);
    clearStartupDialogueTimer();
    startupDialogueTimer = window.setTimeout(() => {
      startupDialogueTimer = null;
      if (runtimeDestroyed || campaignResumed || visualHarnessActive) return;
      startDialogue('intro_portal_edda');
    }, 350);
  }

  const savedCampaign = readArc1Save(campaignStorage, ARC1_SAVE_STORAGE_KEY);
  const onPageHide = () => {
    clearCampaignSaveTimer();
    saveCampaign();
  };
  window.addEventListener('pagehide', onPageHide);
  async function resumeCampaign(): Promise<void> {
    if (campaignHydrating) return;
    const resumed = await hydrateCampaign(savedCampaign);
    if (runtimeDestroyed) return;
    campaignResumed = resumed;
    if (campaignLoadFailed) ui.showNotification('No se pudo cargar tu partida. Se conserva el guardado; pulsa interactuar para reintentar.');
    else if (!resumed) startInitialPresentation();
  }
  void resumeCampaign();

  return {
    press(key: string) {
      onKeyDown(new KeyboardEvent('keydown', { key }));
    },
    clickAt(_x: number, _y: number) {
      triggerInteraction();
    },
    destroy() {
      clearCampaignSaveTimer();
      saveCampaign();
      runtimeDestroyed = true;
      audioToggle?.removeEventListener('click', toggleWorldSound);
      clearStartupDialogueTimer();
      clearOhmCompletionTimer();
      ohmCompletionPending = false;
      if (ohmAwakeningDialogueTimer !== null) {
        window.clearTimeout(ohmAwakeningDialogueTimer);
        ohmAwakeningDialogueTimer = null;
      }
      if (isOhmInspecting) closeOhmInspection();
      else ui.setOhmInspectionView?.(false);
      playerControls.dispose();
      regionalPanel.dispose();
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointerdown', onAudioGesture);
      window.removeEventListener('keydown', onAudioGesture);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onCanvasClick);
      clearHeldMovement();
      if (window.__ROXANA_VISUAL_TEST_HOOKS__ === visualHooks) delete window.__ROXANA_VISUAL_TEST_HOOKS__;
      document.documentElement.classList.remove('roxana-visual-ui-hidden');
      contactTargetLabel.dispose();
      manantialActivationVfx.dispose();
      vfx.dispose();
      firstClassDemonstration.dispose();
      audio.dispose();
      world.app.destroy();
      canvas.remove();
    },
  };
}

