import * as THREE from 'three';
import { PlazaAudioEngine } from './audio/soundscape.ts';
import { DIALOGUE_DATABASE } from './story/dialogueData.ts';
import { createInitialCircuit, solveCircuit } from './simulation/circuitSolver.ts';
import { buildPlazaPbrDiorama, type PbrDioramaElements } from './rendering/dioramaPbr.ts';
import { buildPbrActorSystem, type PbrActorSystem } from './entities/actorsPbr.ts';
import { createPostProcessingPipeline, type PostPipeline } from './rendering/postProcessing.ts';
import { createFpsController, type FpsController } from './controls/fpsController.ts';
import { createGalvanoscopeViewmodel, type GalvanoscopeViewmodel } from './viewmodel/galvanoscopeViewmodel.ts';
import { GalvanoscopeTool } from './tools/galvanoscope.ts';
import { BitacoraManager } from './journal/bitacora.ts';
import { WorkbenchInspector } from './inspect/workbench.ts';
import type { CircuitState, DialogueLine, DialogueNode, ToolMode } from './types.ts';

export interface PlazaUi {
  setDialog(who: string | null, text: string | null, portrait?: string, choices?: { label: string; action: () => void }[]): void;
  setPrompt(text: string | null): void;
  setCaption(text: string | null): void;
  setGalvanoscopeHud(visible: boolean, v: number, r: number, i: number, status: string, probeA: string | null, probeB: string | null): void;
  setBitacoraView(visible: boolean, manager?: BitacoraManager): void;
  setWorkbenchView(visible: boolean, inspector?: WorkbenchInspector, onAction?: (action: string) => void): void;
  setInventoryItem(name: string | null): void;
  showNotification(text: string): void;
  setCinematicOverlay?(visible: boolean): void;
}

export interface PlazaHandle {
  press(key: string): void;
  clickAt(screenX: number, screenY: number): void;
  destroy(): void;
}

export function mountPlaza(host: HTMLElement, ui: PlazaUi): PlazaHandle {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x221812);
  scene.fog = new THREE.FogExp2(0x2c1f18, 0.022);

  // 1st Person Camera (75 deg FOV for atmospheric perspective)
  const camera = new THREE.PerspectiveCamera(72, host.clientWidth / host.clientHeight, 0.08, 120);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.appendChild(renderer.domElement);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x302018, 0.95);
  scene.add(hemiLight);

  const sun = new THREE.DirectionalLight(0xffb870, 2.0);
  sun.position.set(-14, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  const fillLight = new THREE.DirectionalLight(0x80a0c0, 0.55);
  fillLight.position.set(14, 12, -10);
  scene.add(fillLight);

  // First-Person Player Flashlight / Inspection Beam
  const playerFlashlight = new THREE.SpotLight(0xffe8c8, 1.2, 14, Math.PI / 5, 0.4, 1.5);
  playerFlashlight.position.set(0, 0, 0);
  camera.add(playerFlashlight);
  const flashTarget = new THREE.Object3D();
  flashTarget.position.set(0, 0, -5);
  camera.add(flashTarget);
  playerFlashlight.target = flashTarget;

  // Build Systems
  const diorama: PbrDioramaElements = buildPlazaPbrDiorama(scene);
  const actors: PbrActorSystem = buildPbrActorSystem(scene);
  const audio = new PlazaAudioEngine();
  let circuit: CircuitState = createInitialCircuit();
  const galvanoscope = new GalvanoscopeTool();
  const bitacora = new BitacoraManager();
  const workbench = new WorkbenchInspector();

  // First-Person Controller & Handheld Viewmodel
  const fpsController: FpsController = createFpsController(camera, renderer.domElement, new THREE.Vector3(0, 1.68, -8.0));
  const viewmodel: GalvanoscopeViewmodel = createGalvanoscopeViewmodel(camera);

  // Post-Processing Pipeline
  const postPipeline: PostPipeline = createPostProcessingPipeline(
    renderer,
    scene,
    camera,
    host.clientWidth,
    host.clientHeight,
  );

  // State
  let currentMode: ToolMode = 'explore';
  let hasJumperItem = false;
  let hasBrushItem = false;
  let activeDialogueNode: DialogueNode | null = null;
  let activeDialogueLineIndex = 0;
  let isToolEquipped = true;

  const onResize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    postPipeline.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // Interactables
  interface Interactable {
    id: string;
    label: string;
    pos: THREE.Vector3;
    radius: number;
    action: () => void;
  }

  const interactables: Interactable[] = [
    {
      id: 'lumen',
      label: 'Hablar con Lumen (Taller)',
      pos: new THREE.Vector3(-5.5, 1.0, -3.5),
      radius: 3.2,
      action: () => startDialogue('lumen_workshop_interior'),
    },
    {
      id: 'edda',
      label: 'Hablar con Edda (Estudiosa)',
      pos: new THREE.Vector3(4.2, 1.0, -2.5),
      radius: 3.2,
      action: () => startDialogue('edda_surprised_awakening'),
    },
    {
      id: 'campana',
      label: 'Hacer sonar la Campana Sagrada',
      pos: new THREE.Vector3(-5.2, 1.5, 2.4),
      radius: 3.4,
      action: () => {
        audio.playBellChime();
        audio.playRelayEngage();
        workbench.toggleKnifeSwitch();
        circuit.branches.b_ida_rele.state = 'closed';
        circuit = solveCircuit(circuit);
        updateCircuitVisuals();
        bitacora.unlock('lengueta_edda');
        ui.showNotification('¡Tiraste de la cuerda! La campana vibró y el relé cerró su contacto.');
      },
    },
    {
      id: 'cuadro_rele',
      label: 'Examinar el Relé de la Campana de cerca',
      pos: new THREE.Vector3(-5.2, 0.8, 2.4),
      radius: 3.0,
      action: () => {
        currentMode = 'inspect';
        fpsController.unlock();
        workbench.open('cuadro_rele');
        ui.setWorkbenchView(true, workbench, handleWorkbenchAction);
      },
    },
    {
      id: 'mural',
      label: 'Examinar el Mural de los Cuarenta Años',
      pos: new THREE.Vector3(7.8, 1.5, -4.2),
      radius: 3.5,
      action: () => {
        currentMode = 'inspect';
        fpsController.unlock();
        workbench.open('mural_esquema');
        ui.setWorkbenchView(true, workbench, handleWorkbenchAction);
      },
    },
    {
      id: 'brecha_retorno',
      label: hasJumperItem ? 'Instalar Barra Puente de Cobre en la Brecha' : 'Examinar la Brecha Sagrada (Riel Cortado)',
      pos: new THREE.Vector3(-0.9, 0.4, 1.5),
      radius: 2.8,
      action: () => {
        if (hasJumperItem) {
          circuit.branches.b_brecha_retorno.state = 'closed';
          circuit = solveCircuit(circuit);
          diorama.copperJumperMesh.visible = true;
          audio.playSwitchClunk();
          bitacora.unlock('brecha_sagrada');
          bitacora.unlock('ley_retorno');
          ui.showNotification('¡Colocaste la barra puente! El riel oeste vuelve a ser continuo.');
          updateCircuitVisuals();
        } else {
          bitacora.unlock('brecha_sagrada', 'rumor');
          startDialogue('lumen_initial');
        }
      },
    },
    {
      id: 'moho_oxido',
      label: hasBrushItem ? 'Limpiar el Moho Verde con el Cepillo' : 'Examinar el Contacto Sulfatado',
      pos: new THREE.Vector3(-0.9, 0.4, -4.0),
      radius: 2.8,
      action: () => {
        if (hasBrushItem) {
          circuit.branches.b_brecha_a_oxido.state = 'closed';
          circuit.branches.b_brecha_a_oxido.resistance = 0.05;
          circuit = solveCircuit(circuit);
          diorama.corrosionMesh.visible = false;
          audio.playWireScrape();
          bitacora.unlock('moho_verde');
          bitacora.unlock('ley_retorno');
          ui.showNotification('¡Raspaste el óxido verde! Cobre brillante al descubierto (0.05Ω).');
          updateCircuitVisuals();
        } else {
          bitacora.unlock('moho_verde', 'rumor');
          ui.showNotification('El contacto está cubierto de carbonato verde. Necesitás un cepillo de alambre.');
        }
      },
    },
    {
      id: 'puerta_ohm',
      label: circuit.gateOpen ? 'Cruzar hacia las Terrazas de Ohmdal' : 'Examinar la Gran Puerta de Ohm',
      pos: new THREE.Vector3(0, 2.0, 9.8),
      radius: 3.5,
      action: () => {
        if (circuit.gateOpen) {
          ui.showNotification('¡La Gran Puerta de Ohm está abierta! Has restaurado el camino de retorno.');
        } else {
          ui.showNotification('El electroimán de la puerta necesita que el lazo de corriente esté cerrado y activo.');
        }
      },
    },
  ];

  function startDialogue(nodeId: string): void {
    const node = DIALOGUE_DATABASE[nodeId];
    if (!node) return;
    activeDialogueNode = node;
    activeDialogueLineIndex = 0;
    fpsController.unlock();
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
          ui.setInventoryItem('Puente de Cobre + Cepillo');
          ui.showNotification('Obtuviste: Barra Puente de Cobre y Cepillo de Alambre.');
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_portal') {
          bitacora.unlock('portal_origen');
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_lumen') {
          bitacora.unlock('ritual_lumen');
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_edda') {
          bitacora.unlock('lengueta_edda');
        } else if (activeDialogueNode.onComplete === 'unlock_rumor_mural') {
          bitacora.unlock('ley_retorno');
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
      updateCircuitVisuals();
    } else if (actionName === 'scrape_corrosion') {
      workbench.scrapeCorrosion();
      circuit.branches.b_brecha_a_oxido.state = 'closed';
      circuit.branches.b_brecha_a_oxido.resistance = 0.05;
      circuit = solveCircuit(circuit);
      diorama.corrosionMesh.visible = false;
      audio.playWireScrape();
      bitacora.unlock('moho_verde');
      updateCircuitVisuals();
    } else if (actionName === 'install_jumper') {
      workbench.installJumper();
      circuit.branches.b_brecha_retorno.state = 'closed';
      circuit = solveCircuit(circuit);
      diorama.copperJumperMesh.visible = true;
      audio.playSwitchClunk();
      bitacora.unlock('brecha_sagrada');
      updateCircuitVisuals();
    } else if (actionName === 'close') {
      workbench.close();
      currentMode = 'explore';
      ui.setWorkbenchView(false);
    }
  }

  function updateCircuitVisuals(): void {
    if (circuit.fountainActive) {
      diorama.waterMaterial.uniforms.uFlowActive.value = 1.0;
    } else {
      diorama.waterMaterial.uniforms.uFlowActive.value = 0.0;
    }

    if (circuit.relayEnergized) {
      diorama.relayIndicatorLight.intensity = 2.4;
      (diorama.relayIndicatorMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6;
    } else {
      diorama.relayIndicatorLight.intensity = 0.4;
      (diorama.relayIndicatorMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
    }

    const returnCurrent = circuit.branches.b_oxido_a_portal?.current ?? 0;
    if (returnCurrent > 0.5) {
      (diorama.chargeParticles.material as THREE.PointsMaterial).opacity = 0.95;
      audio.updateElectricalHum(returnCurrent);
    } else {
      (diorama.chargeParticles.material as THREE.PointsMaterial).opacity = 0.0;
      audio.updateElectricalHum(0);
    }

    if (circuit.gateOpen) {
      diorama.gateMesh.position.y = 2.4;
      bitacora.unlock('puerta_ohm');
      if (activeDialogueNode === null) {
        startDialogue('circuit_solved_dialog');
        audio.playDiscoveryChime();
      }
    }
  }

  // First-Person Raycasting for Reticle / Probe Touching
  const centerVec = new THREE.Vector2(0, 0); // Center of screen reticle
  const raycaster = new THREE.Raycaster();

  function triggerReticleAction(): void {
    if (activeDialogueNode) {
      advanceDialogue();
      return;
    }

    raycaster.setFromCamera(centerVec, camera);

    // 1. Check if looking at an electrical node (Galvanoscope probe touch)
    let closestNodeId: string | null = null;
    let minDistance = 1.8;

    for (const [nodeId, pos] of Object.entries(diorama.probeTargets)) {
      const dist = raycaster.ray.distanceToPoint(pos);
      if (dist < minDistance && camera.position.distanceTo(pos) < 5.0) {
        minDistance = dist;
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
        probeRes.result?.status ?? 'Punta de prueba conectada',
        gState.probeA,
        gState.probeB,
      );
      ui.showNotification(`Punta ${probeRes.probeConnected} conectada a: ${circuit.nodes[closestNodeId]?.label ?? closestNodeId}`);
      return;
    }

    // 2. Check nearby interactables
    for (const item of interactables) {
      if (camera.position.distanceTo(item.pos) <= item.radius) {
        item.action();
        return;
      }
    }
  }

  // Click handler on canvas
  renderer.domElement.addEventListener('click', () => {
    if (!fpsController.isLocked() && !activeDialogueNode && currentMode === 'explore') {
      fpsController.lock();
    } else {
      triggerReticleAction();
    }
  });

  // Keyboard Handlers
  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === 'e' || k === 'f' || k === 'enter' || k === ' ') {
      triggerReticleAction();
    }
    if (k === 'm') {
      isToolEquipped = !isToolEquipped;
      ui.showNotification(isToolEquipped ? 'Galvanoscopio equipado' : 'Galvanoscopio guardado');
    }
    if (k === 'tab') {
      e.preventDefault();
      toggleBitacora();
    }
  };

  window.addEventListener('keydown', onKeyDown);

  function toggleBitacora(): void {
    if (currentMode === 'bitacora') {
      currentMode = 'explore';
      ui.setBitacoraView(false);
    } else {
      currentMode = 'bitacora';
      fpsController.unlock();
      ui.setBitacoraView(true, bitacora);
    }
  }

  // Animation Loop
  let lastTime = performance.now();
  let animClock = 0;
  let isDestroyed = false;

  function animate() {
    if (isDestroyed) return;
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    animClock += delta;

    // 1. Update First-Person Controller
    const isMoving = fpsController.update(delta, diorama.colliders);

    // 2. Update Handheld Tool Viewmodel
    const gState = galvanoscope.getState();
    const targetV = gState.measuredVoltage;
    const targetI = gState.measuredCurrent;
    viewmodel.update(delta, isMoving, targetV, targetI, isToolEquipped);

    // 3. Update Ohm Companion (Hovering at player's side)
    actors.update(delta, camera.position, isMoving, camera.rotation.y, isToolEquipped);

    // 4. Update Water Shader & Atmosphere
    diorama.waterMaterial.uniforms.uTime.value = animClock;
    diorama.atmosphere.update(animClock, delta);

    // 5. Update Conduit Plasma Charge Particles
    if (circuit.branches.b_oxido_a_portal?.current && circuit.branches.b_oxido_a_portal.current > 0.5) {
      const chargeArray = diorama.chargePositions;
      for (let i = 0; i < chargeArray.length / 3; i += 1) {
        chargeArray[i * 3 + 2] += delta * 14.0;
        if (chargeArray[i * 3 + 2] > 11.0) {
          chargeArray[i * 3 + 2] = -11.0;
        }
      }
      diorama.chargeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Raycast Reticle for Context Prompt
    raycaster.setFromCamera(centerVec, camera);
    let nearestPrompt: string | null = null;

    if (currentMode === 'explore' && !activeDialogueNode) {
      // Check node probe targeting first
      for (const [nodeId, pos] of Object.entries(diorama.probeTargets)) {
        if (raycaster.ray.distanceToPoint(pos) < 1.6 && camera.position.distanceTo(pos) < 4.5) {
          nearestPrompt = `[Clic / E] Conectar punta a: ${circuit.nodes[nodeId]?.label ?? nodeId}`;
          break;
        }
      }

      if (!nearestPrompt) {
        for (const item of interactables) {
          if (camera.position.distanceTo(item.pos) <= item.radius) {
            nearestPrompt = `[E] ${item.label}`;
            break;
          }
        }
      }
    }
    ui.setPrompt(nearestPrompt);

    // 7. Post-Processing Pipeline Render
    postPipeline.render();
  }

  setTimeout(() => {
    startDialogue('intro_portal_edda');
  }, 400);

  animate();

  return {
    press(key: string) {
      onKeyDown(new KeyboardEvent('keydown', { key }));
    },
    clickAt(_screenX: number, _screenY: number) {
      triggerReticleAction();
    },
    destroy() {
      isDestroyed = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      fpsController.destroy();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
