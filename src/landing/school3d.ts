// Diorama del Instituto Roxana.
//
// La iluminación NO se calcula acá: viene horneada en los vertex colors del GLB
// (Cycles, ver scripts/blender/build_school.py). El runtime dibuja esos colores
// tal cual con MeshBasicMaterial, sin una sola luz en tiempo real ni shadow
// maps, y reserva la GPU para el post-procesado. La cámara permanece fija salvo
// durante las transiciones predeterminadas entre la vista general y cada sala.
// La única excepción es la talla de Roxana, que sí es un objeto iluminado.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import schoolUrl from '../../assets/school3d/instituto-roxana.glb?url';
import roxanaStatueUrl from '../../assets/school3d/roxana-statue.glb?url';
import { readSchoolState, type SchoolState } from './schoolModel.ts';
import {
  installRoxanaStatue,
  ROXANA_HALL_MONUMENT,
} from './sculpts/installRoxanaStatue.ts';
import { startPortalTransition } from './portal.ts';
import { portalGateUrl } from '../shared/portalLink.ts';
import { playPendingUnitProjector, projectorSequenceBusy } from './unitProjector.ts';
import { createPostFx, type PostFx } from './school3dPostFx.ts';
import { createRoomLabels, type LabelLayer } from './school3dLabels.ts';
import { createSchoolBackdrop, type SchoolBackdrop } from './school3dBackdrop.ts';
import { installSchoolRoomTerrace, SCHOOL_TIER_RISE } from './school3dTerraces.ts';
import {
  VOXEL_ROOMS,
  schoolRoomOccludes,
  schoolRoomFromHash,
  voxelStateLabel,
  voxelZoneState,
  type VoxelRoom,
  type VoxelZoneId,
} from './voxelSchoolModel.ts';

const OVERVIEW_TARGET = new THREE.Vector3(0, 4.8, 1.0);
// Axonometría a 45°: entrada, estatua y reloj conservan el eje central, mientras
// la componente cenital expone las terrazas sin alterar sus huellas X/Z.
const CAMERA_DIRECTION = new THREE.Vector3(0, 1, 1).normalize();
const CAMERA_DISTANCE = 90;

// Tintes multiplicados sobre el color horneado. El blanco devuelve el bake
// exacto; por encima de 1 el material se "enciende" sin necesidad de luz.
const TINT_IDLE = new THREE.Color(1, 1, 1);
const TINT_HOVER = new THREE.Color(1.24, 1.15, 1.0);
const TINT_SELECTED = new THREE.Color(1.14, 1.09, 1.0);
const TINT_DIMMED = new THREE.Color(0.34, 0.36, 0.46);
const TINT_SLEEPING = new THREE.Color(0.34, 0.37, 0.44);
const TINT_QUIET = new THREE.Color(0.58, 0.58, 0.62);
const TINT_ELECTRONICS_IDLE = new THREE.Color(0.76, 0.80, 0.76);

const LIFT_HOVER = 0.42;
const LIFT_SELECTED = 0.6;
// Las salas que se interponen se disuelven por completo. alphaHash conserva
// la transición tramada durante el fundido, pero evita dejar una placa de
// píxeles permanente delante del aula enfocada.
const OCCLUDER_OPACITY = 0;

type CameraTween = {
  startedAt: number;
  duration: number;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromZoom: number;
  toZoom: number;
};

interface RoomVisual {
  root: THREE.Object3D;
  materials: THREE.MeshBasicMaterial[];
  baseY: number;
  tint: THREE.Color;
  targetTint: THREE.Color;
  lift: number;
  targetLift: number;
  opacity: number;
  targetOpacity: number;
}

interface PickTarget {
  roomId: VoxelZoneId;
  interactiveId: string | null;
}

type SchoolDebugMetrics = {
  fps: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  rooms: number;
  progress: 'initial' | 'electronics-arc-1-complete';
  ambience: {
    exteriorVisible: boolean;
    parallaxLayers: number;
  };
  terraces: {
    tierRise: number;
    maxLevel: number;
  };
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
  };
};

declare global {
  interface Window {
    __roxanaSchool3D?: SchoolDebugMetrics;
    render_game_to_text?: () => string;
  }
}

const ELECTRONICS_OBJECTS: Record<string, { title: string; body: string }> = {
  portal: {
    title: 'Portal de Ohmdal',
    body: 'El anillo conserva la primera ruta de corriente. Cada arco recuperado enciende una sección nueva.',
  },
  pizarron: {
    title: 'Pizarrón técnico',
    body: 'El diagrama cambia con lo aprendido: tensión, corriente y resistencia dejan de ser símbolos aislados.',
  },
  mesa: {
    title: 'Banco de trabajo',
    body: 'Instrumentos, placas y resistencias forman una estación práctica. El segundo banco despierta al completar el arco.',
  },
  instrumento: {
    title: 'Instrumentación',
    body: 'El osciloscopio traduce el comportamiento del circuito en una señal que puede leerse y compararse.',
  },
  robot: {
    title: 'Artefacto aprendido',
    body: 'Un pequeño robot construido con lo recuperado en Ohmdal. Sus ojos verdes marcan el circuito estable.',
  },
  proyector: {
    title: 'Proyector del aula',
    body: 'Conecta la práctica del aula con el mundo aplicado y conserva las escenas recuperadas.',
  },
};

function isCompact(): boolean {
  return window.matchMedia('(max-width: 720px)').matches;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function easeInOut(t: number): number {
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function damp(current: number, target: number, lambda: number, delta: number): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

function roomFromObject(object: THREE.Object3D | null): THREE.Object3D | null {
  let current = object;
  while (current) {
    if (current.name.startsWith('ROOM_') && !current.name.includes('__')) return current;
    current = current.parent;
  }
  return null;
}

function zoneIdFromRoot(root: THREE.Object3D | null): VoxelZoneId | null {
  if (!root) return null;
  const id = (root.userData.roomId as string | undefined) ?? root.name.replace(/^ROOM_/, '');
  return VOXEL_ROOMS.some((room) => room.id === id) ? id as VoxelZoneId : null;
}

function interactiveIdFromObject(object: THREE.Object3D | null): string | null {
  let current = object;
  while (current) {
    const id = current.userData.interactiveId;
    if (typeof id === 'string') return id;
    if (current.name.startsWith('ROOM_') && !current.name.includes('__')) break;
    current = current.parent;
  }
  return null;
}

function stateOverride(saved: SchoolState, preview: 'save' | 'initial' | 'complete'): SchoolState {
  if (preview === 'save') return saved;
  const completed = preview === 'complete';
  return {
    ...saved,
    aulas: {
      ...saved.aulas,
      electronica: completed ? 'completada' : 'off',
      programacion: 'cerrada',
      fisica: 'cerrada',
      matematica: 'cerrada',
    },
    electronica: {
      ...saved.electronica,
      unidadesCompletadas: completed ? saved.electronica.totalUnidades : 0,
      arcoCompleto: completed,
    },
  };
}

function setOhmdalAction(action: HTMLAnchorElement, label: string): void {
  action.href = portalGateUrl();
  action.textContent = label;
  action.dataset.portal = 'ohmdal';
}

/** El panel reusa el mismo botón para todas las salas: hay que limpiar la marca al salir. */
function clearOhmdalAction(action: HTMLAnchorElement): void {
  delete action.dataset.portal;
}

/**
 * La puerta WIP del laboratorio Three ya no existe: Ohmdal se juega en `/jugar`.
 */
function setWipDoor(_visible: boolean): void {
  const door = document.querySelector<HTMLAnchorElement>('#school3d-action-wip');
  if (door) door.hidden = true;
}

class School3DExperience {
  private readonly canvas: HTMLCanvasElement;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly backdrop: SchoolBackdrop;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cameraTarget = OVERVIEW_TARGET.clone();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2(2, 2);
  private readonly clock = new THREE.Clock();
  private readonly rooms = new Map<VoxelZoneId, RoomVisual>();
  private readonly anchors = new Map<VoxelZoneId, THREE.Object3D>();
  private readonly npcs: Array<{ object: THREE.Object3D; phase: number; baseY: number }> = [];
  private savedSchoolState = readSchoolState();
  private progressPreview: 'save' | 'initial' | 'complete' =
    new URLSearchParams(location.search).get('progress') === 'complete' ? 'complete' : 'save';
  private readonly progressionRoots = new Map<string, THREE.Object3D>();
  private postFx: PostFx | null = null;
  private labels: LabelLayer | null = null;
  private interactiveRoots: THREE.Object3D[] = [];
  private selected: VoxelZoneId | null = null;
  private hovered: VoxelZoneId | null = null;
  private tween: CameraTween | null = null;
  private panelRevealTimer: number | undefined;
  private pointerDown = { x: 0, y: 0 };
  private running = true;
  private animationFrame = 0;
  private overviewZoom = 1;
  private portal: THREE.Object3D | null = null;
  private portalMaterial: THREE.MeshBasicMaterial | null = null;
  private statueBounce: THREE.PointLight | null = null;
  private metricsStartedAt = performance.now();
  private metricsFrames = 0;
  private exteriorVisible = true;

  private get schoolState(): SchoolState {
    return stateOverride(this.savedSchoolState, this.progressPreview);
  }

  private get arcOneComplete(): boolean {
    return this.schoolState.electronica.arcoCompleto;
  }

  snapshot(): string {
    return JSON.stringify({
      mode: this.selected ? 'room' : 'overview',
      selectedRoom: this.selected,
      hoveredRoom: this.hovered,
      progressPreview: this.progressPreview,
      rooms: VOXEL_ROOMS.map((room) => ({
        id: room.id,
        state: voxelZoneState(room.id, this.schoolState),
        selected: room.id === this.selected,
      })),
      metrics: window.__roxanaSchool3D ?? null,
      coordinateSystem: 'Three.js world coordinates: +X right, +Y up, +Z toward the entrance',
    });
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.camera = new THREE.OrthographicCamera(-20, 20, 20, -20, .1, 400);
    this.camera.position.copy(CAMERA_DIRECTION).multiplyScalar(CAMERA_DISTANCE);
    this.camera.lookAt(OVERVIEW_TARGET);
    this.scene.add(this.camera);
    this.backdrop = createSchoolBackdrop(this.camera, prefersReducedMotion());

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(this.pixelRatio());
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // El bake ES el look: Blender exportó con view transform "Standard", así que
    // cualquier tone mapping acá rompería la correspondencia con el render de
    // control. Sombras apagadas porque ya están horneadas.
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = false;
    // EffectComposer renders several passes. Keeping one manual reset per
    // frame makes renderer.info report the scene plus post-FX instead of only
    // the final fullscreen quad.
    this.renderer.info.autoReset = false;

    this.scene.fog = new THREE.Fog(0x0a0c16, CAMERA_DISTANCE * 1.15, CAMERA_DISTANCE * 2.4);

    this.setupEvents();
    this.populateRoomMenu();
    this.setupProgressToggle();
    const stage = document.querySelector<HTMLElement>('#school-experience');
    if (stage) stage.dataset.mode = 'overview';
    this.resize();
  }

  private pixelRatio(): number {
    return Math.min(window.devicePixelRatio, isCompact() ? 1.5 : 1.85);
  }

  private setupProgressToggle(): void {
    const button = document.querySelector<HTMLButtonElement>('#school3d-progress-preview');
    if (!button) return;
    const refresh = () => {
      const complete = this.progressPreview === 'complete';
      button.textContent = complete ? 'Ver estado inicial' : 'Simular Arco 1';
      button.setAttribute('aria-pressed', String(complete));
      button.dataset.state = complete ? 'complete' : 'initial';
    };
    refresh();
    button.addEventListener('click', () => {
      this.progressPreview = this.progressPreview === 'complete' ? 'initial' : 'complete';
      this.applyProgressionState();
      this.populateRoomMenu();
      this.refreshRoomTargets();
      if (this.selected) {
        const room = VOXEL_ROOMS.find((candidate) => candidate.id === this.selected);
        if (room) this.renderRoomDetails(room);
      }
      refresh();
    });
  }

  private tintForRoom(id: VoxelZoneId): THREE.Color {
    const state = voxelZoneState(id, this.schoolState);
    if (state === 'closed') return TINT_SLEEPING;
    if (state === 'quiet') return TINT_QUIET;
    if (id === 'electronica' && state === 'open') return TINT_ELECTRONICS_IDLE;
    return TINT_IDLE;
  }

  private applyProgressionState(): void {
    for (const root of this.progressionRoots.values()) {
      root.visible = this.arcOneComplete;
    }
    const electronicaState = this.schoolState.aulas.electronica;
    if (this.portalMaterial) {
      const level = this.arcOneComplete ? .74 : electronicaState === 'enCurso' ? .62 : .38;
      this.portalMaterial.color.setScalar(level);
    }
    for (const room of VOXEL_ROOMS) {
      const state = voxelZoneState(room.id, this.schoolState);
      this.labels?.setState(room.id, state, voxelStateLabel(state));
    }
    const stage = document.querySelector<HTMLElement>('#school-experience');
    if (stage) stage.dataset.progress = this.arcOneComplete ? 'electronics-arc-1-complete' : 'initial';
    this.refreshRoomTargets();
  }

  private setupSceneEditor(model: THREE.Object3D): void {
    const editable = new Map<string, THREE.Object3D>();
    model.traverse((object) => {
      const isRoom = object.name.startsWith('ROOM_') && !object.name.includes('__');
      const isSemanticObject =
        typeof object.userData.interactiveId === 'string'
        || object.userData.progressState === 'electronics-arc-1-complete';
      if (isRoom || isSemanticObject) editable.set(object.name, object);
    });
    const first = editable.get('ROOM_electronica') ?? editable.values().next().value;
    if (!first) return;

    const transform = new TransformControls(this.camera, this.canvas);
    transform.setSpace('world');
    transform.setSize(.72);
    transform.attach(first);
    this.scene.add(transform.getHelper());

    const panel = document.createElement('aside');
    panel.className = 'rx-scene-editor';
    panel.innerHTML = `
      <strong>Scene editor</strong>
      <small>Transformaciones en metros · no modifica el GLB fuente</small>
      <label>Objeto<select id="scene-editor-object"></select></label>
      <div>
        <button type="button" data-mode="translate">Mover</button>
        <button type="button" data-mode="rotate">Rotar</button>
        <button type="button" data-mode="scale">Escalar</button>
      </div>
      <button type="button" id="scene-editor-export">Copiar transformaciones JSON</button>
      <pre id="scene-editor-output"></pre>
    `;
    document.querySelector('#school-experience')?.append(panel);
    const select = panel.querySelector<HTMLSelectElement>('#scene-editor-object');
    const output = panel.querySelector<HTMLElement>('#scene-editor-output');
    if (!select || !output) return;
    for (const name of [...editable.keys()].sort()) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      option.selected = name === first.name;
      select.append(option);
    }
    const renderTransform = () => {
      const object = transform.object;
      if (!object) return;
      output.textContent = JSON.stringify({
        name: object.name,
        position: object.position.toArray().map((value) => Number(value.toFixed(4))),
        rotation: [object.rotation.x, object.rotation.y, object.rotation.z].map((value) => Number(value.toFixed(4))),
        scale: object.scale.toArray().map((value) => Number(value.toFixed(4))),
      }, null, 2);
    };
    select.addEventListener('change', () => {
      const object = editable.get(select.value);
      if (object) transform.attach(object);
      renderTransform();
    });
    panel.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        transform.setMode(button.dataset.mode as 'translate' | 'rotate' | 'scale');
      });
    });
    transform.addEventListener('change', renderTransform);
    panel.querySelector('#scene-editor-export')?.addEventListener('click', async () => {
      const transforms = Object.fromEntries([...editable].map(([name, object]) => [name, {
        position: object.position.toArray().map((value) => Number(value.toFixed(4))),
        rotation: [object.rotation.x, object.rotation.y, object.rotation.z].map((value) => Number(value.toFixed(4))),
        scale: object.scale.toArray().map((value) => Number(value.toFixed(4))),
      }]));
      const json = JSON.stringify(transforms, null, 2);
      await navigator.clipboard?.writeText(json);
      output.textContent = json;
    });
    renderTransform();
  }

  async load(): Promise<void> {
    const draco = new DRACOLoader();
    draco.setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
    draco.setDecoderConfig({ type: 'wasm' });
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    const loadingBar = document.querySelector<HTMLElement>('#school3d-loading-bar');
    const loadingLabel = document.querySelector<HTMLElement>('#school3d-loading-label');
    try {
      const gltf = await loader.loadAsync(schoolUrl, (event) => {
        const ratio = event.total > 0 ? event.loaded / event.total : Math.min(.88, event.loaded / 2_000_000);
        if (loadingBar) loadingBar.style.width = `${Math.round(ratio * 100)}%`;
        if (loadingLabel) loadingLabel.textContent = ratio > .82 ? 'Encendiendo las salas…' : 'Construyendo la escuela…';
      });
      let roxanaStatue: THREE.Object3D | null = null;
      try {
        if (loadingLabel) loadingLabel.textContent = 'Montando la estatua de Roxana…';
        roxanaStatue = (await loader.loadAsync(roxanaStatueUrl)).scene;
      } catch (error) {
        // El GLB del instituto conserva la estatua base como fallback: una falla
        // del hero asset no debe impedir que el usuario entre a la escuela.
        console.warn('No se pudo montar la estatua de Roxana', error);
      }

      this.prepareModel(gltf.scene, roxanaStatue);
      this.scene.add(gltf.scene);
      if (location.pathname === '/dev/scene-editor') this.setupSceneEditor(gltf.scene);
      draco.dispose();

      this.postFx = createPostFx(this.renderer, this.scene, this.camera, {
        compact: isCompact(),
        width: this.canvas.clientWidth || window.innerWidth,
        height: this.canvas.clientHeight || window.innerHeight,
      });
      this.buildLabels();

      if (loadingBar) loadingBar.style.width = '100%';
      document.querySelector('#school3d-loading')?.classList.add('is-ready');
      this.animate();
      window.setTimeout(() => this.syncRoomFromLocation(), 120);
    } catch (error) {
      console.error('No se pudo abrir la escuela 3D', error);
      document.querySelector<HTMLElement>('#school3d-loading')?.classList.add('is-ready');
      const fallback = document.querySelector<HTMLElement>('#school3d-fallback');
      if (fallback) fallback.hidden = false;
    }
  }

  /**
   * Rig exclusivo de la talla de Roxana: es el único objeto con material que
   * responde a la luz. Todo lo demás usa MeshBasicMaterial, que ignora las
   * luces, así que estas tres no cuestan nada en el resto de la escena.
   */
  private setupStatueLights(statue: THREE.Object3D): void {
    const group = new THREE.Group();
    group.name = 'RX_statue_light_rig';

    group.add(new THREE.AmbientLight(0xa9b6d8, 1.15));

    const key = new THREE.DirectionalLight(0xffd7a8, 2.4);
    key.position.set(-6, 9, 7);
    group.add(key);

    const rim = new THREE.DirectionalLight(0x7fa6ff, 1.5);
    rim.position.set(5, 5, -6);
    group.add(rim);

    const bounce = new THREE.PointLight(0xffb066, 6, 12, 2);
    statue.getWorldPosition(bounce.position);
    bounce.position.y += 0.6;
    group.add(bounce);

    this.scene.add(group);
    this.statueBounce = bounce;
  }

  private prepareModel(model: THREE.Object3D, roxanaStatue: THREE.Object3D | null): void {
    // La presentación actual conserva sólo los recintos. El plinto, senderos,
    // árboles, arbustos y portal exterior siguen dentro del GLB fuente para
    // poder recuperarlos, pero no participan de esta vista.
    const exterior = model.getObjectByName('SCHOOL__campus');
    if (exterior) {
      exterior.visible = false;
      exterior.userData.presentationState = 'hidden-exterior-ambience';
      this.exteriorVisible = false;
    }

    // Un material propio por sala permite teñir y atenuar cada una por separado
    // sin tocar a las demás.
    const roomMaterials = new Map<string, THREE.MeshBasicMaterial[]>();

    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const roomRoot = roomFromObject(object);
        const key = roomRoot?.name ?? '__world';
        const baked = new THREE.MeshBasicMaterial({
          vertexColors: true,
          color: 0xffffff,
          fog: true,
          alphaHash: true,
        });
        baked.name = `RX_baked_${key}`;
        object.material = baked;
        object.castShadow = false;
        object.receiveShadow = false;
        const bucket = roomMaterials.get(key) ?? [];
        bucket.push(baked);
        roomMaterials.set(key, bucket);
      }
      if (object.name.startsWith('ANCHOR_')) {
        const id = object.name.replace(/^ANCHOR_/, '') as VoxelZoneId;
        if (VOXEL_ROOMS.some((room) => room.id === id)) this.anchors.set(id, object);
      }
      if (object.name.startsWith('NPC_') && object.children.length > 0) {
        this.npcs.push({ object, phase: this.npcs.length * .83, baseY: object.position.y });
      }
      if (object.name === 'ELECTRO__ohmdal_portal') this.portal = object;
      if (object.userData.progressState === 'electronics-arc-1-complete') {
        this.progressionRoots.set(object.name, object);
      }
    });

    model.traverse((object) => {
      if (object.name.startsWith('ROOM_') && !object.name.includes('__')) {
        const id = zoneIdFromRoot(object);
        if (!id) return;
        const roomDefinition = VOXEL_ROOMS.find((room) => room.id === id);
        if (!roomDefinition) return;
        const terrace = installSchoolRoomTerrace(object, roomDefinition);
        this.rooms.set(id, {
          root: object,
          materials: [
            ...(roomMaterials.get(object.name) ?? []),
            ...terrace.materials,
          ],
          baseY: terrace.baseY,
          tint: TINT_IDLE.clone(),
          targetTint: TINT_IDLE.clone(),
          lift: 0,
          targetLift: 0,
          opacity: 1,
          targetOpacity: 1,
        });
      }
    });

    if (this.portal instanceof THREE.Mesh && this.portal.material instanceof THREE.MeshBasicMaterial) {
      this.portalMaterial = this.portal.material;
    }

    // La talla entra después del reparto de materiales: es el único objeto que
    // conserva MeshStandardMaterial y necesita su propio rig de luces.
    if (roxanaStatue) {
      const installed = installRoxanaStatue(model, roxanaStatue, {
        ...ROXANA_HALL_MONUMENT,
        castShadow: false,
        receiveShadow: false,
      });
      if (installed) this.setupStatueLights(installed.statue);
    }

    this.interactiveRoots = [...this.rooms.values()].map((room) => room.root);
    model.position.y = .12;
    this.applyProgressionState();
  }

  private buildLabels(): void {
    const container = document.querySelector<HTMLElement>('#school3d-labels');
    if (!container) return;
    this.labels = createRoomLabels(
      container,
      VOXEL_ROOMS,
      this.anchors,
      (id) => this.selectRoom(id),
      (id) => this.setHover(id),
    );
    for (const room of VOXEL_ROOMS) {
      const state = voxelZoneState(room.id, this.schoolState);
      this.labels.setState(room.id, state, voxelStateLabel(state));
    }
  }

  private setupEvents(): void {
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.running = !document.hidden;
      if (this.running && !this.animationFrame) this.animate();
    });
    this.canvas.addEventListener('pointerdown', (event) => {
      this.pointerDown = { x: event.clientX, y: event.clientY };
    });
    this.canvas.addEventListener('pointerup', (event) => {
      const distance = Math.hypot(event.clientX - this.pointerDown.x, event.clientY - this.pointerDown.y);
      if (distance < 7) {
        const target = this.pickTarget(event);
        if (
          target?.roomId === 'electronica'
          && this.selected === 'electronica'
          && target.interactiveId
        ) {
          this.showObjectDetail(target.interactiveId);
        } else if (target?.roomId) {
          this.selectRoom(target.roomId);
        }
        else if (this.selected) this.showOverview();
      }
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (event.buttons) return;
      const target = this.pickTarget(event);
      if (target?.roomId !== this.hovered) this.setHover(target?.roomId ?? null);
      this.canvas.classList.toggle(
        'is-object-hovered',
        this.selected === 'electronica' && Boolean(target?.interactiveId),
      );
    });
    this.canvas.addEventListener('pointerleave', () => {
      this.setHover(null);
    });

    // El cruce a Ohmdal usa la misma transición que la landing clásica, en vez de saltar de
    // documento en seco. El listener va una sola vez sobre el botón del panel, que se reusa
    // para todas las salas: quién cruza y quién no lo dice `dataset.portal`.
    const panelAction = document.querySelector<HTMLAnchorElement>('#school3d-action');
    panelAction?.addEventListener('click', (event) => {
      if (panelAction.dataset.portal !== 'ohmdal') return;
      // Un click con modificador es «abrilo aparte»: ahí el href hace su trabajo y la
      // transición sobraría, porque esta pestaña no se va a ninguna parte.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      startPortalTransition(panelAction);
    });

    document.querySelector('#school3d-home')?.addEventListener('click', () => this.showOverview());
    document.querySelector('#school3d-panel-close')?.addEventListener('click', () => this.showOverview());
    window.addEventListener('popstate', () => this.syncRoomFromLocation());
    window.addEventListener('keydown', (event) => this.onKeyDown(event));

    const roomsToggle = document.querySelector<HTMLButtonElement>('#school3d-rooms-toggle');
    const roomList = document.querySelector<HTMLElement>('#school3d-room-list');
    roomsToggle?.addEventListener('click', () => {
      const open = roomList?.classList.toggle('is-open') ?? false;
      roomsToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /** Escape sale de la sala; las flechas recorren el plano sin usar el ratón. */
  private onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

    if (event.key === 'Escape' && this.selected) {
      this.showOverview();
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = VOXEL_ROOMS.map((room) => room.id);
    const current = this.selected ? order.indexOf(this.selected) : -1;
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = current < 0
      ? (step > 0 ? 0 : order.length - 1)
      : (current + step + order.length) % order.length;
    this.selectRoom(order[next]);
  }

  private populateRoomMenu(): void {
    const list = document.querySelector<HTMLElement>('#school3d-room-list');
    if (!list) return;
    list.replaceChildren();
    for (const room of VOXEL_ROOMS) {
      const state = voxelZoneState(room.id, this.schoolState);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rx-school3d__room-button';
      button.dataset.room = room.id;
      button.dataset.state = state;
      button.innerHTML = `<i></i><strong>${room.shortTitle}</strong><small>${voxelStateLabel(state)}</small>`;
      button.addEventListener('click', () => {
        this.selectRoom(room.id);
        list.classList.remove('is-open');
        document.querySelector('#school3d-rooms-toggle')?.setAttribute('aria-expanded', 'false');
      });
      button.addEventListener('pointerenter', () => this.setHover(room.id));
      button.addEventListener('pointerleave', () => this.setHover(null));
      list.append(button);
    }
  }

  private pickTarget(event: PointerEvent): PickTarget | null {
    const bounds = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveRoots, true);
    const object = hits[0]?.object ?? null;
    const roomId = zoneIdFromRoot(roomFromObject(object));
    return roomId ? { roomId, interactiveId: interactiveIdFromObject(object) } : null;
  }

  private setHover(id: VoxelZoneId | null): void {
    if (this.hovered === id) return;
    this.hovered = id;
    this.canvas.style.cursor = id ? 'pointer' : 'default';
    this.labels?.setHovered(id);
    this.refreshRoomTargets();
  }

  /** Un único punto donde se decide cómo se ve cada sala. */
  private refreshRoomTargets(): void {
    const selectedRoom = VOXEL_ROOMS.find((candidate) => candidate.id === this.selected);
    for (const [id, room] of this.rooms) {
      let tint = this.tintForRoom(id);
      let lift = 0;
      let opacity = 1;
      if (this.selected === id) {
        tint = this.tintForRoom(id).clone().multiply(TINT_SELECTED);
        lift = LIFT_SELECTED;
      } else if (this.selected !== null) {
        tint = TINT_DIMMED;
        const candidate = VOXEL_ROOMS.find((definition) => definition.id === id);
        if (candidate && selectedRoom && schoolRoomOccludes(candidate, selectedRoom)) {
          opacity = OCCLUDER_OPACITY;
        }
      } else if (this.hovered === id) {
        tint = this.tintForRoom(id).clone().multiply(TINT_HOVER);
        lift = LIFT_HOVER;
      }
      room.targetTint.copy(tint);
      room.targetLift = lift;
      room.targetOpacity = opacity;
    }
  }

  private selectRoom(id: VoxelZoneId, updateHistory = true): void {
    const visual = this.rooms.get(id);
    const room = VOXEL_ROOMS.find((candidate) => candidate.id === id);
    if (!visual || !room) return;
    this.selected = id;
    this.hovered = null;
    this.labels?.setHovered(null);
    this.refreshRoomTargets();
    const stage = document.querySelector<HTMLElement>('#school-experience');
    if (stage) {
      stage.dataset.mode = 'room';
      stage.dataset.room = id;
    }
    document.querySelector('#school3d-intro')?.classList.add('is-hidden');
    const panel = document.querySelector<HTMLElement>('#school3d-panel');
    panel?.classList.remove('is-open');
    window.clearTimeout(this.panelRevealTimer);
    this.panelRevealTimer = window.setTimeout(() => {
      panel?.classList.add('is-open');
      panel?.setAttribute('aria-hidden', 'false');
    }, prefersReducedMotion() ? 0 : 310);
    this.renderRoomDetails(room);
    if (id === 'electronica') {
      window.setTimeout(() => this.playPendingUnitIntro(), prefersReducedMotion() ? 80 : 420);
    }
    document.querySelectorAll<HTMLElement>('[data-room]').forEach((button) => button.classList.toggle('is-selected', button.dataset.room === id));

    const bounds = new THREE.Box3().setFromObject(visual.root);
    const target = bounds.getCenter(new THREE.Vector3());
    target.y = Math.max(.42, target.y * .34);
    const size = bounds.getSize(new THREE.Vector3());
    const desiredZoom = Math.min(isCompact() ? 3.0 : 3.8, Math.max(isCompact() ? 2.4 : 2.95, 36 / Math.max(size.x, size.z)));
    this.startTween(target, desiredZoom);
    if (updateHistory && location.hash !== `#sala/${id}`) history.pushState({ room: id }, '', `#sala/${id}`);
  }

  private playPendingUnitIntro(): void {
    if (projectorSequenceBusy()) return;
    const host = document.querySelector<HTMLElement>('#school-experience') ?? document.body;
    playPendingUnitProjector(host, () => {
      this.savedSchoolState = readSchoolState();
      const room = VOXEL_ROOMS.find((candidate) => candidate.id === 'electronica');
      if (room && this.selected === 'electronica') this.renderRoomDetails(room);
    });
  }

  private renderRoomDetails(room: VoxelRoom): void {
    document.querySelector('#school3d-panel')?.classList.remove('is-object');
    const state = voxelZoneState(room.id, this.schoolState);
    const eyebrow = document.querySelector<HTMLElement>('#school3d-eyebrow');
    const title = document.querySelector<HTMLElement>('#school3d-title');
    const status = document.querySelector<HTMLElement>('#school3d-status');
    const description = document.querySelector<HTMLElement>('#school3d-description');
    const action = document.querySelector<HTMLAnchorElement>('#school3d-action');
    const activity = document.querySelector<HTMLElement>('#school3d-activity');
    const progressLabel = document.querySelector<HTMLElement>('#school3d-progress-label');
    const progressBar = document.querySelector<HTMLElement>('#school3d-progress-bar');
    if (eyebrow) eyebrow.textContent = room.eyebrow;
    if (title) title.textContent = room.title;
    if (status) {
      status.textContent = voxelStateLabel(state);
      status.dataset.state = state;
    }
    if (description) description.textContent = room.description;
    const completed = this.schoolState.electronica.unidadesCompletadas;
    const total = this.schoolState.electronica.totalUnidades;
    let progress = state === 'restored' ? 1 : state === 'active' ? .62 : state === 'open' ? .24 : 0;
    let progressText = state === 'closed' ? 'Próximamente' : voxelStateLabel(state);
    if (room.id === 'electronica') {
      progress = total > 0 ? completed / total : 0;
      progressText = `${completed} de ${total} unidades`;
    } else if (room.id === 'logros' || room.id === 'biblioteca' || room.id === 'visitantes') {
      progress = total > 0 ? completed / total : 0;
      progressText = `${completed} recuerdos recuperados`;
    }
    if (activity) activity.textContent = room.kind === 'classroom' ? 'Aula aplicada' : room.eyebrow;
    if (progressLabel) progressLabel.textContent = progressText;
    if (progressBar) progressBar.style.width = `${Math.round(progress * 100)}%`;
    if (action) {
      setWipDoor(room.id === 'electronica');
      if (room.id === 'electronica') {
        // «Viajar a Ohmdal» tiene que llegar a Ohmdal. Con `/jugar` a secas el destino se
        // pierde y caés donde diga el save. `portalGateUrl()` lleva a la Plaza.
        setOhmdalAction(action, 'Viajar a Ohmdal');
      } else if (room.id === 'hall') {
        // «Continuar el viaje» sí retoma la partida donde haya quedado: destino correcto.
        clearOhmdalAction(action);
        action.href = '/jugar';
        action.textContent = 'Continuar el viaje';
      } else {
        clearOhmdalAction(action);
        action.href = room.href ?? '#';
        action.textContent = room.actionLabel ?? 'Explorar';
      }
    }
  }

  private showObjectDetail(interactiveId: string): void {
    const detail = ELECTRONICS_OBJECTS[interactiveId];
    if (!detail) return;
    const panel = document.querySelector<HTMLElement>('#school3d-panel');
    const eyebrow = document.querySelector<HTMLElement>('#school3d-eyebrow');
    const title = document.querySelector<HTMLElement>('#school3d-title');
    const status = document.querySelector<HTMLElement>('#school3d-status');
    const description = document.querySelector<HTMLElement>('#school3d-description');
    const activity = document.querySelector<HTMLElement>('#school3d-activity');
    const action = document.querySelector<HTMLAnchorElement>('#school3d-action');
    if (eyebrow) eyebrow.textContent = 'Aula de Electrónica · objeto';
    if (title) title.textContent = detail.title;
    if (status) {
      status.textContent = this.arcOneComplete ? 'Arco 1 recuperado' : 'En restauración';
      status.dataset.state = this.arcOneComplete ? 'restored' : 'active';
    }
    if (description) description.textContent = detail.body;
    if (activity) activity.textContent = 'Seleccionable';
    // Los objetos del aula son parte del aula de Electrónica: la puerta de obra sigue puesta.
    setWipDoor(true);
    if (action) {
      setOhmdalAction(action, 'Practicar en Ohmdal');
    }
    panel?.classList.add('is-open', 'is-object');
    panel?.setAttribute('aria-hidden', 'false');
  }

  private showOverview(updateHistory = true): void {
    this.selected = null;
    this.refreshRoomTargets();
    window.clearTimeout(this.panelRevealTimer);
    const stage = document.querySelector<HTMLElement>('#school-experience');
    if (stage) {
      stage.dataset.mode = 'overview';
      delete stage.dataset.room;
    }
    document.querySelector('#school3d-intro')?.classList.remove('is-hidden');
    const panel = document.querySelector<HTMLElement>('#school3d-panel');
    panel?.classList.remove('is-open', 'is-object');
    panel?.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('[data-room]').forEach((button) => button.classList.remove('is-selected'));
    this.startTween(OVERVIEW_TARGET, this.overviewZoom);
    if (updateHistory && location.hash.startsWith('#sala/')) {
      const url = new URL(location.href);
      url.hash = '';
      history.pushState({}, '', url);
    }
  }

  private syncRoomFromLocation(): void {
    const id = schoolRoomFromHash(location.hash);
    if (id) this.selectRoom(id, false);
    else if (this.selected) this.showOverview(false);
  }

  private startTween(target: THREE.Vector3, zoom: number): void {
    this.tween = {
      startedAt: performance.now(),
      duration: prefersReducedMotion() ? 1 : 760,
      fromTarget: this.cameraTarget.clone(),
      toTarget: target.clone(),
      fromZoom: this.camera.zoom,
      toZoom: zoom,
    };
  }

  private resize(): void {
    const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
    const aspect = width / height;
    const viewHeight = isCompact() ? 64 : 58;
    this.backdrop.setCompact(isCompact());
    this.camera.left = -viewHeight * aspect / 2;
    this.camera.right = viewHeight * aspect / 2;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -viewHeight / 2;
    // Las terrazas amplían la silueta vertical; esta apertura conserva reloj,
    // zócalos y acceso completo sin modificar los zooms de cada sala.
    this.overviewZoom = isCompact() ? Math.min(.86, (viewHeight * aspect) / 58) : 1.42;
    if (!this.selected && !this.tween) this.camera.zoom = this.overviewZoom;
    this.camera.updateProjectionMatrix();
    const ratio = this.pixelRatio();
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.postFx?.composer.setPixelRatio(ratio);
    this.postFx?.setSize(width, height);
  }

  private animate = (): void => {
    if (!this.running) {
      this.animationFrame = 0;
      return;
    }
    this.animationFrame = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), .1);
    const elapsed = this.clock.getElapsedTime();
    this.backdrop.update(elapsed);

    this.npcs.forEach(({ object, phase, baseY }, index) => {
      object.position.y = baseY + Math.sin(elapsed * (1.15 + index % 3 * .08) + phase) * .035;
      object.rotation.y = Math.sin(elapsed * .32 + phase) * .035;
    });

    // El rebote cálido a los pies de la talla respira: es lo único iluminado en
    // tiempo real, y quieto delataría que el resto está horneado.
    if (this.statueBounce) {
      this.statueBounce.intensity = 6 + Math.sin(elapsed * .9) * 1.4;
    }

    if (this.portal && this.schoolState.aulas.electronica !== 'off') {
      this.portal.rotation.z += this.arcOneComplete ? .004 : .0015;
      const pulse = 1 + Math.sin(elapsed * 2.2) * (this.arcOneComplete ? .035 : .012);
      this.portal.scale.setScalar(pulse);
      if (this.portalMaterial) {
        const base = this.arcOneComplete ? .78 : .60;
        const glow = base + Math.sin(elapsed * 2.2) * (this.arcOneComplete ? .18 : .08);
        this.portalMaterial.color.setRGB(glow, glow, glow);
      }
    } else if (this.portal) {
      this.portal.scale.setScalar(1);
      this.portalMaterial?.color.setScalar(.38);
    }

    // Salas: tinte y elevación siempre van hacia su objetivo, nunca saltan.
    for (const room of this.rooms.values()) {
      room.tint.r = damp(room.tint.r, room.targetTint.r, 9, delta);
      room.tint.g = damp(room.tint.g, room.targetTint.g, 9, delta);
      room.tint.b = damp(room.tint.b, room.targetTint.b, 9, delta);
      room.lift = damp(room.lift, room.targetLift, 9, delta);
      room.opacity = damp(room.opacity, room.targetOpacity, 7, delta);
      room.root.position.y = room.baseY + room.lift;
      for (const material of room.materials) {
        const baseColor = material.userData.roomBaseColor;
        if (typeof baseColor === 'number') {
          material.color.setHex(baseColor).multiply(room.tint);
        } else {
          material.color.copy(room.tint);
        }
        material.opacity = room.opacity;
      }
    }

    if (this.tween) {
      const progress = Math.min(1, (performance.now() - this.tween.startedAt) / this.tween.duration);
      const eased = easeInOut(progress);
      this.cameraTarget.lerpVectors(this.tween.fromTarget, this.tween.toTarget, eased);
      this.camera.zoom = THREE.MathUtils.lerp(this.tween.fromZoom, this.tween.toZoom, eased);
      this.camera.updateProjectionMatrix();
      if (progress >= 1) this.tween = null;
    }

    this.camera.position.copy(this.cameraTarget).add(
      CAMERA_DIRECTION.clone().multiplyScalar(CAMERA_DISTANCE),
    );
    this.camera.lookAt(this.cameraTarget);

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.labels?.update(this.camera, width, height, this.selected);

    this.renderer.info.reset();
    if (this.postFx) this.postFx.composer.render(delta);
    else this.renderer.render(this.scene, this.camera);

    this.metricsFrames += 1;
    const metricsElapsed = performance.now() - this.metricsStartedAt;
    if (metricsElapsed >= 1000) {
      window.__roxanaSchool3D = {
        fps: Math.round(this.metricsFrames * 1000 / metricsElapsed),
        drawCalls: this.renderer.info.render.calls,
        triangles: this.renderer.info.render.triangles,
        points: this.renderer.info.render.points,
        lines: this.renderer.info.render.lines,
        rooms: this.rooms.size,
        progress: this.arcOneComplete ? 'electronics-arc-1-complete' : 'initial',
        ambience: {
          exteriorVisible: this.exteriorVisible,
          parallaxLayers: this.backdrop.layers,
        },
        terraces: {
          tierRise: SCHOOL_TIER_RISE,
          maxLevel: Math.max(...VOXEL_ROOMS.map((room) => room.presentationLevel)),
        },
        camera: {
          position: [
            Number(this.camera.position.x.toFixed(4)),
            Number(this.camera.position.y.toFixed(4)),
            Number(this.camera.position.z.toFixed(4)),
          ],
          target: [
            Number(this.cameraTarget.x.toFixed(4)),
            Number(this.cameraTarget.y.toFixed(4)),
            Number(this.cameraTarget.z.toFixed(4)),
          ],
          zoom: Number(this.camera.zoom.toFixed(4)),
        },
      };
      this.metricsFrames = 0;
      this.metricsStartedAt = performance.now();
    }
  };
}

export async function initSchool3D(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#school3d-canvas');
  if (!canvas) return;
  try {
    const experience = new School3DExperience(canvas);
    await experience.load();
    window.render_game_to_text = () => experience.snapshot();
  } catch (error) {
    console.error('WebGL no está disponible', error);
    document.querySelector<HTMLElement>('#school3d-loading')?.classList.add('is-ready');
    const fallback = document.querySelector<HTMLElement>('#school3d-fallback');
    if (fallback) fallback.hidden = false;
  }
}
