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
import {
  OHMDAL_VISUAL_CAMERA_PRESETS,
  isSoftwareRenderer,
  percentile,
  type OhmdalVisualCameraName,
  type OhmdalVisualStateName,
  type RoxanaVisualTestHooks,
} from './visualHarness.ts';
import { OMEGA_GATE_TUNING } from './omegaGateTuning.ts';
import { OhmdalZoneLifecycle } from './systems/zones/zoneLifecycle.ts';

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
  | 'inside_manantial';

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
  world.workshopInteriorRoot.enabled = false;
  zones.register({ id: 'plaza', setActive: (active) => { world.plazaRoot.enabled = active; } });
  zones.register({ id: 'workshop', setActive: (active) => { world.workshopInteriorRoot.enabled = active; } });
  // The existing mountain root is Plaza's accepted scenic shell. Future
  // Manantial payloads register behind this progression-gated load seam.
  zones.register({ id: 'manantial', load: () => undefined });
  void zones.initializePlaza();

  // State
  let currentMode: ToolMode = 'explore';
  let storyStep: OhmdalStoryStep = 'portal_arrived';
  let isOhmAwake = false;
  let hasJumperItem = false;
  let hasBrushItem = false;
  let activeDialogueNode: DialogueNode | null = null;
  let activeDialogueLineIndex = 0;
  let isToolEquipped = true;
  let isPointerLocked = false;
  let visualCamera: OhmdalVisualCameraName = 'active-play-desktop';
  let visualState: OhmdalVisualStateName = 'portal-arrival';
  let visualPaused = false;
  let reducedMotion = false;
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
    if (!isPointerLocked) return;
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
    if (k === 'w' || k === 'arrowup') keys.w = true;
    if (k === 's' || k === 'arrowdown') keys.s = true;
    if (k === 'a' || k === 'arrowleft') keys.a = true;
    if (k === 'd' || k === 'arrowright') keys.d = true;

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

  // Teleport helper for interior & scene transitions
  function teleportPlayer(x: number, y: number, z: number, targetYaw: number): void {
    playerPos.set(x, y, z);
    world.playerEntity.setPosition(x, y, z);
    yaw = targetYaw;
    pitch = 0;
    world.playerEntity.setEulerAngles(0, yaw, 0);
    world.cameraEntity.setLocalEulerAngles(0, 0, 0);
  }

  function closeVisualOverlays(): void {
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
  }

  function setVisualState(name: OhmdalVisualStateName): void {
    closeVisualOverlays();
    zones.deactivate('workshop');
    zones.deactivate('manantial');
    circuit = createInitialCircuit();
    isOhmAwake = false;
    storyStep = 'portal_arrived';
    world.copperJumper.enabled = false;
    world.corrosionMesh.enabled = true;
    world.ohmFilamentLight.light!.intensity = 0;
    world.relayLight.light!.intensity = 0.6;
    world.solenoidGate.setPosition(0, OMEGA_GATE_TUNING.closedY, 11.5);
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
      world.gateLightLeft.light!.color = new pc.Color(0.2, 1.0, 0.4);
      world.gateLightRight.light!.color = new pc.Color(0.2, 1.0, 0.4);
    }

    visualState = name;
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
    setPausedForScreenshot(paused) {
      visualPaused = paused;
    },
    setReducedMotion(enabled) {
      reducedMotion = enabled;
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
        shadows: {
          ...shadows,
          mobileMeaningfulLightLimit: 1,
        },
        harness: {
          camera: visualCamera,
          state: visualState,
          paused: visualPaused,
          reducedMotion,
          debugUiHidden,
          postProcessing: postProcessingEnabled,
          seed: visualSeed,
          randomSeedNote: 'No randomized scene systems are active; seed is a documented no-op.',
        },
      };
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
    audio.playDiscoveryChime();
    ui.showNotification('⚡ ¡Terminales de entrada acoplados! El filamento de Ohm se ilumina.');
    bitacora.unlock('despertar_ohm');

    setTimeout(() => {
      startDialogue('ohm_awakening_event');
    }, 500);
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
    const inManantial = playerPos.z > 14 && playerPos.x > -40;

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
          teleportPlayer(-7.0, 1.68, -4.0, 90);
          zones.deactivate('workshop');
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
    } else if (inManantial) {
      // Sendero del Manantial & Mountain Hydroelectric
      list.push({
        id: 'manantial_survey_point',
        label: 'Examinar Monolito de Cota y Caída de Agua',
        pos: new pc.Vec3(0, 1.2, 17.5),
        radius: 3.5,
        action: () => {
          startDialogue('manantial_overlook_dialog');
        },
      });
      list.push({
        id: 'manantial_turbine_housing',
        label: 'Diagnosticar Turbina Hidroeléctrica (Generador)',
        pos: new pc.Vec3(0, 2.0, 21.5),
        radius: 4.2,
        action: () => {
          bitacora.unlock('analogia_potencial');
          ui.showNotification('Generador Hidroeléctrico: Caída Δh=18m → Presión ΔP=176 kPa → Tensión inducida ΔV=24.0V.');
        },
      });
      list.push({
        id: 'gate_return_to_plaza',
        label: 'Regresar a la Plaza de Ohmdal (Sur)',
        pos: new pc.Vec3(0, 1.68, 13.0),
        radius: 3.2,
        action: () => {
          teleportPlayer(0, 1.68, 9.2, 180);
          zones.deactivate('manantial');
          ui.showNotification('Regresaste a la Plaza Central.');
        },
      });
    } else {
      // Outdoor Plaza
      list.push({
        id: 'edda_npc',
        label: isOhmAwake ? 'Hablar con Edda sobre el taller' : 'Hablar con Edda (Estudiosa)',
        pos: new pc.Vec3(1.8, 1.0, -8.0),
        radius: 3.2,
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
          if (!isOhmAwake) {
            triggerOhmAwakening();
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
            teleportPlayer(-60, 1.68, -3.8, 0);
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
          workbench.toggleKnifeSwitch();
          circuit.branches.b_ida_rele.state = 'closed';
          circuit = solveCircuit(circuit);
          updateCircuitStateVisuals();
          bitacora.unlock('lengueta_edda');
          ui.showNotification('¡La campana resonó! El relé de enclavamiento cerró su circuito.');
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
        pos: new pc.Vec3(-0.9, 0.4, -4.0),
        radius: 2.8,
        action: () => {
          if (hasBrushItem) {
            circuit.branches.b_brecha_a_oxido.state = 'closed';
            circuit.branches.b_brecha_a_oxido.resistance = 0.05;
            circuit = solveCircuit(circuit);
            world.corrosionMesh.enabled = false;
            audio.playWireScrape();
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
            teleportPlayer(0, 1.68, 16.0, 0);
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
    if (activeDialogueNode) {
      advanceDialogue();
      return;
    }

    const camPos = world.playerEntity.getPosition();

    // 1. Check proximity interactables first (Ohm pedestal, NPCs, doors)
    const currentInteractables = getActiveInteractables();
    for (const item of currentInteractables) {
      if (camPos.distance(item.pos) <= item.radius) {
        item.action();
        return;
      }
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
    if (!isPointerLocked && !activeDialogueNode && currentMode === 'explore') {
      canvas.requestPointerLock?.();
    } else {
      triggerInteraction();
    }
  });

  const isBlocked = (x: number, z: number) => {
    const r = 0.4;
    // When inside mountain area (z > 12), allow passing through the gate if open
    if (circuit.gateOpen && z > 10.0 && z < 13.0 && Math.abs(x) < 2.0) {
      return false;
    }
    for (const c of world.colliders) {
      if (x > c.minX - r && x < c.maxX + r && z > c.minZ - r && z < c.maxZ + r) {
        return true;
      }
    }
    return false;
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

    // 3. Prompt detection
    const camPos = world.playerEntity.getPosition();
    let prompt: string | null = null;
    if (currentMode === 'explore' && !activeDialogueNode) {
      const currentInteractables = getActiveInteractables();
      for (const item of currentInteractables) {
        if (camPos.distance(item.pos) <= item.radius) {
          prompt = `[E] ${item.label}`;
          break;
        }
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

  // Start with portal arrival dialogue
  setTimeout(() => {
    startDialogue('intro_portal_edda');
  }, 400);

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
      world.app.destroy();
      canvas.remove();
    },
  };
}

