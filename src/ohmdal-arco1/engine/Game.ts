/**
 * OhmdalArcI Game — main runtime.
 *
 * Custom Canvas2D top-down RPG engine. No Phaser, no Three.js. The
 * game renders to a single canvas, with the DOM-based UI layered on
 * top.
 *
 * Responsibilities:
 *   - Bootstrap the render loop.
 *   - Hold the world, electrical graph, and player state.
 *   - Wire up input → player movement.
 *   - Wire up interaction → dialogue / puzzles.
 *   - React to electrical events (light up lamps, animate cables).
 *   - Persist state via SaveSystem.
 *
 * Architecture:
 *   Game
 *     ├── World          (tilemap, NPCs, props, interactables)
 *     ├── Player         (sprite, movement, collision)
 *     ├── ElectricalGraph
 *     ├── DialogueRunner
 *     ├── AudioBus
 *     ├── SaveSystem
 *     ├── Lighting       (per-node dynamic lights)
 *     └── Particles      (sparks, dust, water drops)
 *
 * The HUD/DOM is layered on top by main.ts.
 */

import type { SaveSystem } from './Save.ts';
import type { AudioBus } from './AudioBus.ts';
import { DialogueRunner } from './Dialogue.ts';
import { ElectricalGraph } from './ElectricalGraph.ts';
import { World } from './World.ts';
import { Player } from './Player.ts';
import { Camera } from './Camera.ts';
import { Input } from './Input.ts';
import { Lighting } from './Lighting.ts';
import { Particles } from './Particles.ts';
import { HUD } from '../ui/UI.ts';
import type { Bitacora } from '../ui/Bitacora.ts';
import type { Prompt } from '../ui/Prompt.ts';
import type { WorldTopology } from '../data/types.ts';
import type { Narrative } from '../data/narrative.ts';

export interface GameOptions {
  canvas: HTMLCanvasElement;
  save: SaveSystem;
  audio: AudioBus;
  ui: HUD;
  prompt: Prompt;
  bitacora: Bitacora;
  topology: WorldTopology;
  narrative: Narrative;
}

interface TileImageMap {
  [tileId: number]: HTMLImageElement;
}

interface SpriteImageMap {
  [name: string]: HTMLImageElement;
}

const LOGICAL_WIDTH = 480;
const LOGICAL_HEIGHT = 270;

export class OhmdalGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private save: SaveSystem;
  private audio: AudioBus;
  private hud: HUD;
  private prompt: Prompt;
  private bitacora: Bitacora;
  private topology: WorldTopology;
  private narrative: Narrative;

  private world!: World;
  private player!: Player;
  private electrical!: ElectricalGraph;
  private dialogue!: DialogueRunner;
  private camera!: Camera;
  private input!: Input;
  private lighting!: Lighting;
  private particles!: Particles;

  private tileImages: TileImageMap = {};
  private spriteImages: SpriteImageMap = {};
  private assetsReady: boolean = false;
  private readyPromise: Promise<void>;
  private readyResolve!: () => void;

  private lastFrame: number = 0;
  private region: string = 'sendero_s';
  private time: number = 0;
  private rafHandle: number = 0;

  // Cooldowns / state
  private lastInteractAt: number = 0;
  private nearInteractableId: string | null = null;
  private isInteracting: boolean = false;
  private state: 'dormant' | 'awakening' | 'powered_basic' | 'powered_full' = 'dormant';
  private entrancePan: { t: number; duration: number; done: boolean } = { t: 0, duration: 3.0, done: false };

  constructor(opts: GameOptions) {
    this.canvas = opts.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
    this.save = opts.save;
    this.audio = opts.audio;
    this.hud = opts.ui;
    this.prompt = opts.prompt;
    this.bitacora = opts.bitacora;
    this.topology = opts.topology;
    this.narrative = opts.narrative;

    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });

    // Set canvas internal resolution
    this.canvas.width = LOGICAL_WIDTH;
    this.canvas.height = LOGICAL_HEIGHT;
    // Size to fit the wrap immediately
    this.fitCanvas();
    // Also fit on window resize
    window.addEventListener('resize', () => this.fitCanvas());

    this.bootstrap();
  }

  private bootstrap(): void {
    // Build world
    this.world = new World(this.topology, this.tileImages);

    // Build electrical graph from topology, with initial broken edges
    // from save (or topology default).
    const saveState = this.save.get();
    const initialBroken = saveState.brokenEdges.length > 0
      ? saveState.brokenEdges
      : this.topology.electrical.edges.filter((e) => e.state === 'broken').map((e) => e.id);
    this.electrical = new ElectricalGraph(
      this.topology.electrical.nodes,
      this.topology.electrical.edges,
      this.topology.electrical.source,
      initialBroken,
    );
    this.world.setElectrical(this.electrical);

    // Build systems
    this.camera = new Camera(LOGICAL_WIDTH, LOGICAL_HEIGHT, this.topology);
    this.input = new Input();
    this.player = new Player(this.topology.playerStart, this.world, this.input);
    this.lighting = new Lighting(this.electrical, this.world);
    this.particles = new Particles();
    // Wire sprite provider once assets are loaded
    this.player.setSpriteProvider((name) => this.spriteImages[name]);
    this.world.setSpriteProvider((name) => this.spriteImages[name]);

    // Dialogue
    this.dialogue = new DialogueRunner({
      container: document.getElementById('ohmdal-ui')!,
      onHook: (name) => this.handleHook(name),
      setFlag: (flag, value) => {
        this.save.setFlag(flag, value);
        this.onFlagChange(flag, value);
      },
      resolvePortrait: (name) => this.resolvePortrait(name),
      onEnd: () => this.onDialogueEnd(),
    });

    // Subscribe to electrical events → lighting, audio, particles
    this.electrical.on((ev) => this.onElectricalEvent(ev));

    // Hook UI handlers
    this.hud.setAudioToggleHandler(() => this.toggleAudio());
    this.hud.setBitacoraToggleHandler(() => this.bitacora.toggle());

    // B keyboard for bitácora
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyB' && !this.dialogue.isPlaying()) {
        this.bitacora.toggle();
      }
    });

    // Initial state
    this.updateHUDForState();
    this.startEntrancePan();

    // Start the dormant music
    this.audio.playMusic('ohmdal_dormant', '../../assets/ohmdal-arco1/audio/ohmdal_dormant.mp3');

    // Bitacora flag provider
    this.bitacora.setFlagProvider((f) => this.save.hasFlag(f));

    // Inject live system state into Bitacora each frame
    this.bitacora.setSistemaState(this.renderSistemaState());

    // Initial Bitácora entry
    this.bitacora.addEntry({
      id: 'opening',
      title: 'Antes de entrar',
      vivencia: 'Crucé el Portal. No sé cuándo lo hice. Lo único que sé es que ahora estoy en una plaza que no reconozco y no hay nadie.',
      evidencia: 'Cables de cobre en el suelo. Agua detenida. Cuatro faroles apagados. Al norte, una puerta monumental con un símbolo que no es una letra.',
      formalizacion: undefined,
      unlockedAt: Date.now(),
    });

    // Load assets then start the loop
    this.loadAssets().then(() => {
      this.assetsReady = true;
      this.readyResolve();
      this.lastFrame = performance.now();
      this.rafHandle = requestAnimationFrame(this.tick);
    });
  }

  destroy(): void {
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
    this.input.destroy();
  }

  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  private async loadAssets(): Promise<void> {
    // Tileset
    await this.loadImage('tiles', '../../assets/ohmdal-arco1/tiles/world.png');
    // Sprites
    await this.loadImage('player', '../../assets/ohmdal-arco1/sprites/player.png');
    await this.loadImage('npcs', '../../assets/ohmdal-arco1/sprites/npcs.png');
    await this.loadImage('ohm', '../../assets/ohmdal-arco1/sprites/ohm.png');
    await this.loadImage('props', '../../assets/ohmdal-arco1/sprites/props.png');
    // Portraits
    await this.loadImage('edda', '../../assets/ohmdal-arco1/portraits/edda.png');
    await this.loadImage('lumen', '../../assets/ohmdal-arco1/portraits/lumen.png');
    await this.loadImage('ohm_portrait', '../../assets/ohmdal-arco1/portraits/ohm.png');
  }

  /**
   * Public: get a loaded image by key.
   */
  getImage(name: string): HTMLImageElement | undefined {
    return this.spriteImages[name];
  }

  private loadImage(name: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.spriteImages[name] = img;
        resolve(img);
      };
      img.onerror = () => {
        // On error, generate a placeholder image so the game still runs.
        const placeholder = this.createPlaceholderImage(name);
        this.spriteImages[name] = placeholder;
        resolve(placeholder);
      };
      img.src = src;
    });
  }

  private createPlaceholderImage(_name: string): HTMLImageElement {
    // Create a 16x16 solid-color placeholder. The engine will fall back
    // to procedural drawing when the sprite is not available.
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#7a5232';
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = '#3a2a1c';
    ctx.strokeRect(0, 0, 16, 16);
    const dataUrl = canvas.toDataURL();
    const img = new Image();
    img.src = dataUrl;
    return img;
  }

  private resolvePortrait(name: string): string | null {
    const key = name.toLowerCase();
    if (this.spriteImages[key]) return (this.spriteImages[key] as HTMLImageElement).src;
    if (this.spriteImages[`${key}_portrait`]) {
      return (this.spriteImages[`${key}_portrait`] as HTMLImageElement).src;
    }
    // Fallback: try the named asset
    if (key === 'edda' || key === 'lumen' || key === 'ohm') {
      return `../../assets/ohmdal-arco1/portraits/${key}.png`;
    }
    return null;
  }

  /* ============================================================== */
  /* Loop                                                            */
  /* ============================================================== */

  private tick = (now: number): void => {
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    this.time += dt;
    this.update(dt);
    this.render();
    this.fitCanvas();
    this.rafHandle = requestAnimationFrame(this.tick);
  };

  /**
   * Scale the canvas to fit the window, using integer scale for crisp
   * pixel art. The internal resolution stays at 480x270.
   */
  private fitCanvas(): void {
    if (this.canvas.width !== LOGICAL_WIDTH) {
      this.canvas.width = LOGICAL_WIDTH;
      this.canvas.height = LOGICAL_HEIGHT;
    }
    const wrap = this.canvas.parentElement;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    // Integer scale: largest that fits, capped at 5x
    const scale = Math.min(5, Math.floor(Math.min(w / LOGICAL_WIDTH, h / LOGICAL_HEIGHT)));
    if (scale < 1) {
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    } else {
      this.canvas.style.width = `${LOGICAL_WIDTH * scale}px`;
      this.canvas.style.height = `${LOGICAL_HEIGHT * scale}px`;
    }
  }

  private update(dt: number): void {
    if (!this.assetsReady) return;

    // Entrance pan
    if (!this.entrancePan.done) {
      this.entrancePan.t += dt;
      if (this.entrancePan.t >= this.entrancePan.duration) {
        this.entrancePan.done = true;
        // Trigger opening dialogue
        this.dialogue.play(this.narrative.scripts.opening_intro);
      }
    }

    // Dialogue blocks player movement but not world
    const playerCanMove = !this.dialogue.isPlaying() && !this.isInteracting && this.entrancePan.done;

    // Player update
    this.player.update(dt, playerCanMove);
    this.save.setLastPosition(this.player.x, this.player.y, this.region);

    // Camera follow
    const prevRegion = this.region;
    this.camera.follow(this.player.x, this.player.y, dt);
    this.region = this.camera.getCurrentRegion();
    if (this.region !== prevRegion) {
      this.onRegionChange(prevRegion, this.region);
    }

    // NPC update
    this.world.updateNPCs(dt, this.time);

    // Particles
    this.particles.update(dt);

    // Lighting follow
    this.lighting.update(dt);

    // Update HUD
    this.hud.setRegion(this.camera.getRegionName());
    this.updateNearInteractable();
    this.hud.setState(this.stateLabel(), this.state !== 'dormant');

    // Periodic system state refresh
    if (Math.floor(this.time * 4) % 4 === 0) {
      this.bitacora.setSistemaState(this.renderSistemaState());
    }
  }

  private onRegionChange(_prev: string, next: string): void {
    // Pick music based on region
    const musicMap: Record<string, string> = {
      sendero_s: this.state === 'powered_full' ? 'ohmdal_powered' : 'ohmdal_dormant',
      camino: this.state === 'powered_full' ? 'ohmdal_powered' : 'ohmdal_dormant',
      plaza: this.state === 'awakening' ? 'ohmdal_awakening' :
             this.state === 'powered_full' ? 'ohmdal_powered' : 'ohmdal_dormant',
      puerta: this.state === 'powered_full' ? 'ohmdal_powered' : 'ohmdal_awakening',
      manantial: this.state === 'powered_full' ? 'ohmdal_powered' : 'ohmdal_awakening',
      taller: this.state === 'powered_full' ? 'ohmdal_powered' : 'ohmdal_dormant',
    };
    const track = musicMap[next] || 'ohmdal_dormant';
    this.audio.playMusic(track, `../../assets/ohmdal-arco1/audio/${track}.mp3`);
  }

  private render(): void {
    if (!this.assetsReady) return;
    const ctx = this.ctx;
    const W = LOGICAL_WIDTH;
    const H = LOGICAL_HEIGHT;
    const TILE_PX = 16; // pixels per world unit (1 tile = 1 world unit)

    // Clear
    ctx.fillStyle = '#0a1018';
    ctx.fillRect(0, 0, W, H);

    // Camera transform: each world unit = TILE_PX canvas pixels * zoom
    const cam = this.camera.getTransform();
    const scale = cam.zoom * TILE_PX;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-cam.x + W / scale / 2, -cam.y + H / scale / 2);

    // World base (tilemap)
    this.world.renderFloor(ctx, this.camera);

    // Cables
    this.world.renderCables(ctx, this.electrical, this.camera);

    // Props back layer
    this.world.renderPropsBack(ctx, this.camera);

    // NPCs
    this.world.renderNPCs(ctx, this.camera, this.time);

    // Player
    this.player.render(ctx, this.time);

    // Props front layer
    this.world.renderPropsFront(ctx, this.camera);

    // Foreground (occlusion)
    this.world.renderForeground(ctx, this.camera);

    // Particles
    this.particles.render(ctx, this.camera);

    // Lighting overlay (additive)
    this.lighting.render(ctx, this.camera);

    ctx.restore();

    // Vignette
    this.renderVignette(ctx, W, H);

    // Entrance pan fade
    if (!this.entrancePan.done) {
      const alpha = 1 - Math.min(1, this.entrancePan.t / this.entrancePan.duration);
      ctx.fillStyle = `rgba(10, 16, 24, ${alpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private renderVignette(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  /* ============================================================== */
  /* Interactables & input                                           */
  /* ============================================================== */

  private updateNearInteractable(): void {
    const playerX = this.player.x;
    const playerY = this.player.y;
    let best: { id: string; dist: number } | null = null;
    for (const inter of this.world.interactables) {
      const cx = inter.x + (inter.w ?? 1) / 2;
      const cy = inter.y + (inter.h ?? 1) / 2;
      const dx = cx - playerX;
      const dy = cy - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1.6) {
        if (!best || dist < best.dist) {
          best = { id: inter.id, dist };
        }
      }
    }
    // Also check NPCs
    for (const npc of this.world.npcs) {
      if (npc.id === 'ohm' && !this.electrical.isEnergizedNode('node_ohm')) continue;
      const dx = npc.x - playerX;
      const dy = npc.y - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1.6) {
        if (!best || dist < best.dist) {
          best = { id: npc.id, dist };
        }
      }
    }

    if (best) {
      const inter = this.world.findInteractable(best.id);
      const npc = this.world.findNPC(best.id);
      if (inter) {
        this.hud.setFocus(inter.id, inter.verb);
        this.prompt.show(inter.verb, 'E');
        this.nearInteractableId = inter.id;
      } else if (npc) {
        const verb = npc.id === 'ohm' ? 'Hablar con Ohm' : `Hablar con ${npc.name}`;
        this.hud.setFocus(npc.name, verb);
        this.prompt.show(verb, 'E');
        this.nearInteractableId = npc.id;
      }
    } else {
      this.hud.setFocus(null);
      this.prompt.hide();
      this.nearInteractableId = null;
    }
  }

  private tryInteract(): void {
    if (this.dialogue.isPlaying() || this.isInteracting) return;
    if (Date.now() - this.lastInteractAt < 200) return;
    if (!this.nearInteractableId) return;
    this.lastInteractAt = Date.now();

    const inter = this.world.findInteractable(this.nearInteractableId);
    const npc = this.world.findNPC(this.nearInteractableId);

    if (inter) {
      this.interactWith(inter);
    } else if (npc) {
      this.interactWithNPC(npc);
    }
  }

  private interactWith(inter: typeof this.world.interactables[number]): void {
    // Some interactions depend on state. We branch on type.
    switch (inter.type) {
      case 'wire':
        this.openWireInteraction(inter);
        break;
      case 'lamp':
        this.inspectLamp(inter);
        break;
      case 'monolith':
        this.inspectMonolith(inter);
        break;
      case 'fountain':
        this.inspectFountain(inter);
        break;
      case 'bell':
        this.ringBell();
        break;
      case 'gate':
        this.inspectGate(inter);
        break;
      case 'workbench':
        this.inspectBench();
        break;
      case 'device':
        if (inter.id === 'ohm_pedestal') this.inspectOhm();
        break;
      default:
        // Generic: open script if any
        if (inter.script && this.narrative.scripts[inter.script]) {
          this.dialogue.play(this.narrative.scripts[inter.script]);
        }
    }
  }

  private interactWithNPC(npc: typeof this.world.npcs[number]): void {
    if (npc.id === 'ohm' && this.electrical.isEnergizedNode('node_ohm')) {
      this.dialogue.play(this.narrative.scripts.ohm_awakening);
      return;
    }
    const script = this.narrative.scripts[npc.script];
    if (script) this.dialogue.play(script);
  }

  /* ============================================================== */
  /* Specific interaction handlers                                   */
  /* ============================================================== */

  private openWireInteraction(inter: typeof this.world.interactables[number]): void {
    if (inter.id === 'cable_break_main') {
      // Show the script. The script will fire the 'openContinuityPuzzle' hook.
      this.dialogue.play(this.narrative.scripts.cable_broken_main);
    } else if (inter.id === 'cable_break_puerta') {
      this.dialogue.play(this.narrative.scripts.cable_broken_puerta);
    } else {
      const script = this.narrative.scripts[inter.script];
      if (script) this.dialogue.play(script);
    }
  }

  private inspectLamp(inter: typeof this.world.interactables[number]): void {
    if (this.electrical.isEnergizedNode(inter.node!)) {
      this.dialogue.play(this.narrative.scripts.lamp_on);
    } else {
      this.dialogue.play(this.narrative.scripts.lamp_off);
    }
  }

  private inspectMonolith(_inter: typeof this.world.interactables[number]): void {
    this.dialogue.play(this.narrative.scripts.portal_inert);
  }

  private inspectFountain(_inter: typeof this.world.interactables[number]): void {
    if (this.electrical.isEnergizedNode('node_fountain')) {
      this.dialogue.play(this.narrative.scripts.fountain_flowing);
    } else {
      this.dialogue.play(this.narrative.scripts.fountain_dry);
    }
  }

  private ringBell(): void {
    this.dialogue.play(this.narrative.scripts.bell_inert);
  }

  private inspectGate(_inter: typeof this.world.interactables[number]): void {
    if (this.electrical.isEnergizedNode('node_manantial_gate')) {
      this.dialogue.play(this.narrative.scripts.manantial_gate_open);
    } else {
      this.dialogue.play(this.narrative.scripts.manantial_gate_closed);
    }
  }

  private inspectBench(): void {
    // Only meaningful if Lumen is nearby. For simplicity we trigger if
    // the player is in the Taller region.
    if (this.camera.getCurrentRegion() === 'taller') {
      this.dialogue.play(this.narrative.scripts.lumen_bench);
    } else {
      this.dialogue.play(this.narrative.scripts.lumen_workshop);
    }
  }

  private inspectOhm(): void {
    if (this.electrical.isEnergizedNode('node_ohm')) {
      this.dialogue.play(this.narrative.scripts.ohm_awakening);
    } else {
      this.dialogue.play(this.narrative.scripts.ohm_inert);
    }
  }

  /* ============================================================== */
  /* Hooks fired by dialogue                                         */
  /* ============================================================== */

  private handleHook(name: string): void {
    switch (name) {
      case 'entrancePan':
        // Already started in bootstrap
        break;
      case 'eddaHintTrail':
        this.bitacora.addEntry({
          id: 'edda_first',
          title: 'Una explicación local',
          vivencia: 'Edda apareció. Me dijo que no le diga qué creo, sino qué veo. Le marqué el cable del suelo.',
          evidencia: 'Cable de cobre con una interrupción visible. Agua detenida en la fuente. Cuatro faroles apagados.',
          unlockedAt: Date.now(),
        });
        break;
      case 'openContinuityPuzzle':
        this.openContinuityPuzzle();
        break;
      case 'openDiagnosisPuzzle':
        this.openDiagnosisPuzzle();
        break;
      case 'openDistributionPuzzle':
        this.openDistributionPuzzle();
        break;
      case 'hintCableMain':
        this.particles.spark(this.player.x, this.player.y, 12);
        break;
      case 'ohmsVoiceStart':
        // Play Ohm's voice
        this.audio.playVoice('ohm_awake', '../../assets/ohmdal-arco1/audio/ohm_awake.mp3');
        this.particles.burst(this.player.x, this.player.y - 2, 30, '#fff4d8');
        break;
      case 'showCredits':
        this.bitacora.addEntry({
          id: 'ohmdal_powered',
          title: 'Ohmdal encendido',
          vivencia: 'Las lámparas se encendieron. El agua corre. Edda me dijo la frase que no voy a olvidar: "No volvió la luz. Volvió la pregunta."',
          evidencia: 'Cuatro faroles encendidos en la Plaza, agua en la fuente, compuerta del Manantial abierta, dos lámparas del Manantial encendidas, el taller de Lumen funcionando.',
          formalizacion: 'La luz vuelve porque la pregunta vuelve. La red es un instrumento, no una propiedad. Ohm ahora mide; yo interpreto; Lumen enseña; Edda puede hacerlo sola.',
          formalizacionFlag: 'ohmdal_powered',
          unlockedAt: Date.now(),
        });
        this.save.setFlag('ohmdal_powered', true);
        this.state = 'powered_full';
        this.audio.playMusic('ohmdal_powered', '../../assets/ohmdal-arco1/audio/ohmdal_powered.mp3');
        this.audio.playSfx('success', '../../assets/ohmdal-arco1/audio/success.mp3');
        this.startWaterFlow();
        break;
    }
  }

  private openContinuityPuzzle(): void {
    // Find the broken edge nearest to the player. Show a prompt to repair.
    const brokenEdges = this.electrical.getBrokenEdges();
    if (brokenEdges.length === 0) {
      this.dialogue.play({
        id: 'puzzle_already_solved',
        lines: [
          {
            speaker: 'Ohm',
            portrait: 'ohm',
            text: 'No hay cables rotos en mi sistema. La trayectoria ya está completa.',
            end: true,
          },
        ],
      });
      return;
    }

    // The player can repair either of the two broken edges. We'll show
    // a small choice UI.
    const choices = brokenEdges.map((id) => {
      const edge = this.electrical.getEdge(id);
      const from = edge?.from ?? '';
      const to = edge?.to ?? '';
      return {
        text: `Reparar el cable entre "${from}" y "${to}"`,
        hook: `repair:${id}`,
        end: false,
      };
    });

    this.dialogue.play({
      id: 'continuity_choice',
      lines: [
        {
          speaker: 'Ohm',
          portrait: 'ohm',
          text: 'Hay cables con trayectoria abierta. ¿Cuál querés reparar primero?',
          choices,
        },
      ],
    });
  }

  private openDiagnosisPuzzle(): void {
    // Show a measurement choice UI: pick which module to test
    this.dialogue.play({
      id: 'diagnosis_choose_module',
      lines: [
        {
          speaker: 'Maese Lumen',
          portrait: 'lumen',
          text: 'Vamos a medir los tres módulos. ¿Por cuál querés empezar?',
          choices: [
            { text: 'Módulo A — el ritual', hook: 'measure:mod_a', end: false },
            { text: 'Módulo B — el que toco poco', hook: 'measure:mod_b', end: false },
            { text: 'Módulo C — el que no toco', hook: 'measure:mod_c', end: false },
          ],
        },
      ],
    });
  }

  private openDistributionPuzzle(): void {
    this.dialogue.play({
      id: 'distribution_choose',
      lines: [
        {
          speaker: 'Ohm',
          portrait: 'ohm',
          text: 'Ya energizaste la Plaza y el Taller. La compuerta del Manantial sigue cerrada. ¿Qué hacés?',
          choices: [
            { text: 'Abrir el Manantial (el agua corre, el Taller queda esperando).', hook: 'decision:manantial', end: false },
            { text: 'Reforzar la Plaza (la Plaza queda terminada, el Manantial espera).', hook: 'decision:plaza', end: false },
            { text: 'Sellar el Taller (Lumen enseña, el Manantial espera).', hook: 'decision:taller', end: false },
          ],
        },
      ],
    });
  }

  /* ============================================================== */
  /* State transitions and the wow moment                           */
  /* ============================================================== */

  private onElectricalEvent(ev: import('./ElectricalGraph.ts').ElectricalEvent): void {
    switch (ev.type) {
      case 'nodeEnergized':
        this.onNodeEnergized(ev.id);
        break;
      case 'edgeEnergized':
        this.onEdgeEnergized(ev.id);
        break;
      case 'edgeRepaired':
        this.audio.playSfx('cable_repair', '../../assets/ohmdal-arco1/audio/cable.mp3');
        this.save.removeBrokenEdge(ev.id);
        this.bitacora.addEntry({
          id: `repair_${ev.id}`,
          title: 'Cable reparado',
          vivencia: 'Cerré la juntura del cable. El cobre vuelve a hacer contacto.',
          evidencia: `Tramo: ${ev.id}. Comprobé continuidad antes de tocar.`,
          unlockedAt: Date.now(),
        });
        break;
      case 'edgeBroken':
        this.save.addBrokenEdge(ev.id);
        break;
      case 'nodeDeenergized':
        // If a key node loses power, dim its light
        this.lighting.setNodeIntensity(ev.id, 0);
        break;
      case 'edgeDeenergized':
        // dim the edge
        break;
    }
  }

  private onNodeEnergized(id: string): void {
    // Light the node
    this.lighting.setNodeIntensity(id, 1);
    // Visual particles
    const node = this.electrical.getNode(id);
    if (node && node.x != null && node.y != null) {
      this.particles.burst(node.x, node.y, 8, '#ffd28a');
    }
    // Audio
    this.audio.playSfx('lamp_on', '../../assets/ohmdal-arco1/audio/lamp_on.mp3', 0.4);

    // State transitions
    if (id === 'node_fountain' && this.state === 'dormant') {
      this.state = 'awakening';
      this.audio.playMusic('ohmdal_awakening', '../../assets/ohmdal-arco1/audio/ohmdal_awakening.mp3');
      this.startWaterFlow();
    }
    if (id === 'node_ohm' && this.state === 'awakening') {
      this.state = 'powered_basic';
      this.audio.playSfx('ohm_awake', '../../assets/ohmdal-arco1/audio/ohm_awake.mp3', 0.8);
      this.save.markPuzzleComplete('p1_continuity');
      this.save.setAwakeningTime(Date.now());
      this.bitacora.addEntry({
        id: 'ohm_awake',
        title: 'Ohm despierto',
        vivencia: 'Ohm abrió los ojos. La fuente está goteando. La Plaza está respirando.',
        evidencia: 'Trayectoria completa desde el Portal. Cuatro faroles de la Plaza encendidos.',
        formalizacion: 'El circuito se cerró. Hay continuidad, hay magnitud, hay una diferencia de potencial. Ohm ahora mide.',
        formalizacionFlag: 'ohm_awake',
        unlockedAt: Date.now(),
      });
    }
    if (id === 'node_manantial_gate' && this.state === 'powered_basic') {
      this.state = 'powered_full';
      this.save.markPuzzleComplete('p3_distribution');
      this.bitacora.addEntry({
        id: 'manantial_open',
        title: 'Manantial abierto',
        vivencia: 'La compuerta se desliza. El agua del Manantial empieza a caer por la calzada.',
        evidencia: 'Agua fluyendo desde el norte. Dos lámparas del Manantial encendidas. Fuente central llena.',
        unlockedAt: Date.now(),
      });
      // The showCredits hook is fired after the player has fully read.
      setTimeout(() => this.handleHook('showCredits'), 5000);
    }
  }

  private onEdgeEnergized(id: string): void {
    // Pulse the edge
    const path = this.electrical.getEdgePath(id);
    if (path.length > 0) {
      this.particles.travel(path, '#e8a050', 0.6);
    }
  }

  private startWaterFlow(): void {
    // Spawn a stream of water particles flowing from the Manantial southward
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        if (this.electrical.isEnergizedNode('node_manantial_gate')) {
          this.particles.waterDrop(48 + (Math.random() - 0.5) * 6, 12 + Math.random() * 4);
        }
      }, i * 200);
    }
  }

  private startEntrancePan(): void {
    // Pan camera from south to north over 3 seconds
    this.camera.panTo(48, 30, 3.0);
  }

  private stateLabel(): string {
    switch (this.state) {
      case 'dormant': return 'Apagado';
      case 'awakening': return 'Despertando';
      case 'powered_basic': return 'Encendido (parcial)';
      case 'powered_full': return 'Encendido';
    }
  }

  private updateHUDForState(): void {
    this.hud.setState(this.stateLabel(), this.state !== 'dormant');
    this.hud.setRegion('Sendero Sur');
  }

  /* ============================================================== */
  /* Misc                                                            */
  /* ============================================================== */

  private onFlagChange(flag: string, _value: boolean): void {
    if (flag === 'edda_hypothesis_a') {
      this.bitacora.addEntry({
        id: 'hypothesis_a',
        title: 'Hipótesis A: no hay fuerza',
        vivencia: 'Le dije a Edda que creía que la fuerza se gastó. No me corrigió, me pidió ver.',
        evidencia: 'El cable del Portal tiene energía. La fuente no responde. Las hipótesis de Edda son locales, no verificadas.',
        unlockedAt: Date.now(),
      });
    }
    if (flag === 'edda_hypothesis_b') {
      this.bitacora.addEntry({
        id: 'hypothesis_b',
        title: 'Hipótesis B: la fuerza no vuelve',
        vivencia: 'Le dije a Edda que la fuerza estaba pero no volvía.',
        evidencia: 'El cobre del suelo tiene corriente, pero no llega a la fuente. Hay algo en el medio.',
        unlockedAt: Date.now(),
      });
    }
    if (flag === 'edda_hypothesis_c') {
      this.bitacora.addEntry({
        id: 'hypothesis_c',
        title: 'Hipótesis C: solo veo cables',
        vivencia: 'Le dije a Edda que no sabía. Solo veía cables.',
        evidencia: 'Cables, sí. Pero también agua detenida, faroles apagados, una puerta con un símbolo que no reconozco.',
        unlockedAt: Date.now(),
      });
    }
  }

  private onDialogueEnd(): void {
    // After certain scripts, fire their post-script logic.
    // This is called by DialogueRunner when a script ends.
  }

  private toggleAudio(): void {
    const newMuted = !this.audio.isMuted();
    this.audio.setMuted(newMuted);
    this.hud.setAudioButtonState(newMuted);
  }

  private renderSistemaState(): string {
    const nodes = this.electrical.getAllNodes();
    const edges = this.electrical.getAllEdges();
    const broken = new Set(this.electrical.getBrokenEdges());
    const reachable = this.electrical.getResult().reachable;
    const energizedEdges = this.electrical.getResult().energizedEdges;

    const nodeLines = nodes
      .map((n) => {
        const on = reachable[n.id];
        return `<div>${on ? '🟢' : '⚫'} <code>${n.id}</code> <small>(${n.type})</small></div>`;
      })
      .join('');
    const edgeLines = edges
      .map((e) => {
        const isBroken = broken.has(e.id);
        const isEnergized = !!energizedEdges[e.id];
        const icon = isBroken ? '✕' : isEnergized ? '🟢' : '·';
        return `<div>${icon} <code>${e.id}</code> ${e.from} → ${e.to}</div>`;
      })
      .join('');
    return `
      <div><strong>Nodos (${nodes.length})</strong></div>
      ${nodeLines}
      <div style="margin-top:8px"><strong>Cables (${edges.length})</strong></div>
      ${edgeLines}
    `;
  }

  /**
   * Public API used by the Input layer.
   */
  onInteractKey(): void {
    this.tryInteract();
  }

  /**
   * Public API used by the Input layer for movement.
   */
  onMoveKey(dx: number, dy: number, pressed: boolean): void {
    this.input.setMove(dx, dy, pressed);
  }

  /**
   * Public API used by the Input layer for "open the puzzle" type actions.
   */
  onHook(name: string): void {
    this.handleHook(name);
  }
}
