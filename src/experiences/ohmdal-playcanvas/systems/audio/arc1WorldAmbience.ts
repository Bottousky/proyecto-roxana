import type { Arc1Region } from '../campaign/arc1GreyboxModel.ts';

/**
 * Regional layers that are missing from PlazaAudioEngine's global bed. The
 * existing engine remains the owner of the electrical hum and event
 * stingers. Its global Manantial water/turbine controls are the pre-existing
 * fallback; when these two spatial layers are wired, runtime should stop
 * driving those global controls so the beds are replaced rather than doubled.
 */
export type Arc1WorldAmbienceLayer =
  | 'plaza-wind'
  | 'plaza-fountain'
  | 'manantial-water'
  | 'manantial-machine'
  | 'forge-heat'
  | 'terraces-water'
  | 'lighthouse-wind'
  | 'lighthouse-lake'
  | 'lighthouse-beacon';

export const ARC1_WORLD_AMBIENCE_LAYERS: readonly Arc1WorldAmbienceLayer[] = [
  'plaza-wind',
  'plaza-fountain',
  'manantial-water',
  'manantial-machine',
  'forge-heat',
  'terraces-water',
  'lighthouse-wind',
  'lighthouse-lake',
  'lighthouse-beacon',
];

export type Arc1WorldPosition = readonly [number, number, number];

/**
 * The runtime maps real model outputs to 0..1 here. A value of zero means
 * that the corresponding physical service is silent. This keeps the module
 * independent from renderer state and prevents a visual flag from inventing
 * an audible service.
 */
export interface Arc1WorldAmbienceElectricalState {
  readonly fountainPowered?: boolean;
  readonly manantialWaterFlow?: number;
  readonly manantialMachinePower?: number;
  readonly forgeHeaterPower?: number;
  readonly terracesPumpPower?: number;
  readonly lighthouseBeaconPower?: number;
}

export interface Arc1WorldAmbienceFrame {
  readonly position: Arc1WorldPosition;
  readonly region: Arc1Region;
  readonly electrical?: Arc1WorldAmbienceElectricalState;
  /** Player yaw in degrees; zero looks toward world -Z, matching runtime controls. */
  readonly headingDegrees?: number;
  readonly paused?: boolean;
  readonly hidden?: boolean;
  readonly reducedMotion?: boolean;
  readonly muted?: boolean;
}

export type Arc1WorldAmbienceSourcePositions = Readonly<
  Record<Arc1WorldAmbienceLayer, Arc1WorldPosition>
>;

/** Authored world anchors, expressed in the same world coordinates as Arc 1. */
export const DEFAULT_ARC1_WORLD_AMBIENCE_SOURCES: Arc1WorldAmbienceSourcePositions = Object.freeze({
  'plaza-wind': [0, 1, 0],
  'plaza-fountain': [5.5, 0.8, 3.8],
  'manantial-water': [-4.2, 1.8, 20.5],
  'manantial-machine': [0, 1.4, 20],
  'forge-heat': [124.2, 2.4, -8],
  'terraces-water': [120, 1.2, 16],
  'lighthouse-wind': [180, 3, 0],
  'lighthouse-lake': [189, 0.4, 5],
  'lighthouse-beacon': [180, 6.5, 8],
});

export interface Arc1WorldAmbiencePlan {
  readonly levels: Readonly<Record<Arc1WorldAmbienceLayer, number>>;
  readonly pans: Readonly<Record<Arc1WorldAmbienceLayer, number>>;
}

interface LayerDefinition {
  readonly radius: number;
  readonly maxGain: number;
  readonly smoothing: number;
  readonly filterType: BiquadFilterType;
  readonly filterFrequency: number;
  readonly filterQ: number;
  readonly toneHz?: number;
  readonly toneMix?: number;
}

const LAYER_DEFINITIONS: Readonly<Record<Arc1WorldAmbienceLayer, LayerDefinition>> = {
  'plaza-wind': {
    radius: 24,
    maxGain: 0.018,
    smoothing: 0.45,
    filterType: 'lowpass',
    filterFrequency: 260,
    filterQ: 0.6,
  },
  'plaza-fountain': {
    radius: 11,
    maxGain: 0.024,
    smoothing: 0.35,
    filterType: 'lowpass',
    filterFrequency: 720,
    filterQ: 0.7,
  },
  'manantial-water': {
    radius: 17,
    maxGain: 0.026,
    smoothing: 0.4,
    filterType: 'lowpass',
    filterFrequency: 620,
    filterQ: 0.75,
  },
  'manantial-machine': {
    radius: 14,
    maxGain: 0.017,
    smoothing: 0.3,
    filterType: 'bandpass',
    filterFrequency: 155,
    filterQ: 1.2,
    toneHz: 72,
    toneMix: 0.12,
  },
  'forge-heat': {
    radius: 12,
    maxGain: 0.016,
    smoothing: 0.35,
    filterType: 'lowpass',
    filterFrequency: 180,
    filterQ: 0.8,
    toneHz: 58,
    toneMix: 0.1,
  },
  'terraces-water': {
    radius: 15,
    maxGain: 0.022,
    smoothing: 0.4,
    filterType: 'lowpass',
    filterFrequency: 680,
    filterQ: 0.65,
  },
  'lighthouse-wind': {
    radius: 25,
    maxGain: 0.018,
    smoothing: 0.45,
    filterType: 'lowpass',
    filterFrequency: 220,
    filterQ: 0.55,
  },
  'lighthouse-lake': {
    radius: 22,
    maxGain: 0.02,
    smoothing: 0.45,
    filterType: 'lowpass',
    filterFrequency: 430,
    filterQ: 0.65,
  },
  'lighthouse-beacon': {
    radius: 12,
    maxGain: 0.014,
    smoothing: 0.3,
    filterType: 'bandpass',
    filterFrequency: 118,
    filterQ: 1.1,
    toneHz: 52,
    toneMix: 0.2,
  },
};

const ZERO_LEVELS: Arc1WorldAmbiencePlan = {
  levels: Object.freeze(Object.fromEntries(ARC1_WORLD_AMBIENCE_LAYERS.map((layer) => [layer, 0])) as Record<Arc1WorldAmbienceLayer, number>),
  pans: Object.freeze(Object.fromEntries(ARC1_WORLD_AMBIENCE_LAYERS.map((layer) => [layer, 0])) as Record<Arc1WorldAmbienceLayer, number>),
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function finitePower(value: number | undefined): number {
  return Number.isFinite(value) ? clamp(value as number) : 0;
}

function finiteCoordinate(value: number | undefined): number {
  return Number.isFinite(value) ? (value as number) : 0;
}

function copyPosition(position: Arc1WorldPosition): Arc1WorldPosition {
  return [position[0], position[1], position[2]];
}

function mergeSources(
  overrides?: Partial<Record<Arc1WorldAmbienceLayer, Arc1WorldPosition>>,
): Arc1WorldAmbienceSourcePositions {
  return Object.freeze({
    ...DEFAULT_ARC1_WORLD_AMBIENCE_SOURCES,
    ...overrides,
  });
}

function distanceToSource(
  position: Arc1WorldPosition,
  source: Arc1WorldPosition,
): number {
  return Math.hypot(
    source[0] - position[0],
    source[1] - position[1],
    source[2] - position[2],
  );
}

function isPlazaRegion(region: Arc1Region): boolean {
  return region === 'portal' || region === 'plaza' || region === 'retorno';
}

function setLayer(
  levels: Record<Arc1WorldAmbienceLayer, number>,
  pans: Record<Arc1WorldAmbienceLayer, number>,
  layer: Arc1WorldAmbienceLayer,
  requestedLevel: number,
  frame: Arc1WorldAmbienceFrame,
  sources: Arc1WorldAmbienceSourcePositions,
): void {
  const definition = LAYER_DEFINITIONS[layer];
  const source = sources[layer];
  const distance = distanceToSource(frame.position, source);
  const spatial = Math.pow(clamp(1 - distance / definition.radius), 1.15);
  const motionScale = frame.reducedMotion && (
    layer === 'manantial-machine' || layer === 'forge-heat' || layer === 'lighthouse-beacon'
  ) ? 0.45 : 1;
  levels[layer] = clamp(requestedLevel) * spatial * motionScale;
  const headingRadians = ((frame.headingDegrees ?? 0) * Math.PI) / 180;
  const rightX = Math.cos(headingRadians);
  const rightZ = -Math.sin(headingRadians);
  const lateral = (source[0] - frame.position[0]) * rightX
    + (source[2] - frame.position[2]) * rightZ;
  pans[layer] = clamp(lateral / definition.radius, -1, 1) * 0.72;
}

/**
 * Pure state-to-mix projection. It is intentionally independent of WebAudio
 * so model tests can prove quiet/off behavior without mocks or a browser.
 */
export function planArc1WorldAmbience(
  frame: Arc1WorldAmbienceFrame,
  sourceOverrides?: Partial<Record<Arc1WorldAmbienceLayer, Arc1WorldPosition>>,
): Arc1WorldAmbiencePlan {
  if (frame.paused || frame.hidden || frame.muted) return ZERO_LEVELS;

  const levels = {} as Record<Arc1WorldAmbienceLayer, number>;
  const pans = {} as Record<Arc1WorldAmbienceLayer, number>;
  for (const layer of ARC1_WORLD_AMBIENCE_LAYERS) {
    levels[layer] = 0;
    pans[layer] = 0;
  }

  const sources = sourceOverrides ? mergeSources(sourceOverrides) : DEFAULT_ARC1_WORLD_AMBIENCE_SOURCES;
  const safeFrame: Arc1WorldAmbienceFrame = {
    ...frame,
    position: [
      finiteCoordinate(frame.position[0]),
      finiteCoordinate(frame.position[1]),
      finiteCoordinate(frame.position[2]),
    ],
    headingDegrees: finiteCoordinate(frame.headingDegrees),
  };
  const electrical = frame.electrical ?? {};

  if (isPlazaRegion(safeFrame.region)) {
    setLayer(levels, pans, 'plaza-wind', 0.8, safeFrame, sources);
    setLayer(levels, pans, 'plaza-fountain', electrical.fountainPowered ? 0.95 : 0, safeFrame, sources);
  } else if (safeFrame.region === 'manantial') {
    setLayer(levels, pans, 'manantial-water', finitePower(electrical.manantialWaterFlow), safeFrame, sources);
    setLayer(levels, pans, 'manantial-machine', finitePower(electrical.manantialMachinePower), safeFrame, sources);
  } else if (safeFrame.region === 'forja') {
    setLayer(levels, pans, 'forge-heat', finitePower(electrical.forgeHeaterPower), safeFrame, sources);
  } else if (safeFrame.region === 'terrazas') {
    setLayer(levels, pans, 'terraces-water', finitePower(electrical.terracesPumpPower), safeFrame, sources);
  } else if (safeFrame.region === 'faro') {
    setLayer(levels, pans, 'lighthouse-wind', 0.85, safeFrame, sources);
    setLayer(levels, pans, 'lighthouse-lake', 0.8, safeFrame, sources);
    setLayer(levels, pans, 'lighthouse-beacon', finitePower(electrical.lighthouseBeaconPower), safeFrame, sources);
  }

  return {
    levels: Object.freeze(levels),
    pans: Object.freeze(pans),
  };
}

export interface Arc1WorldAmbienceVisibilityTarget {
  readonly hidden: boolean;
  addEventListener(type: 'visibilitychange', listener: () => void): void;
  removeEventListener(type: 'visibilitychange', listener: () => void): void;
}

export interface Arc1WorldAmbienceOptions {
  readonly sources?: Partial<Record<Arc1WorldAmbienceLayer, Arc1WorldPosition>>;
  readonly visibilityTarget?: Arc1WorldAmbienceVisibilityTarget;
}

interface LayerNodes {
  readonly source: AudioBufferSourceNode;
  readonly filter: BiquadFilterNode;
  readonly gain: GainNode;
  readonly panner: StereoPannerNode;
  readonly tone: OscillatorNode | null;
  readonly toneFilter: BiquadFilterNode | null;
  readonly toneGain: GainNode | null;
}

function createBrownNoiseBuffer(context: AudioContext): AudioBuffer {
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * 2));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = buffer.getChannelData(0);
  let last = 0;
  for (let index = 0; index < output.length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.025 * white) / 1.025;
    output[index] = last * 3.2;
  }
  return buffer;
}

function stopAndDisconnect(node: AudioNode | null): void {
  if (!node) return;
  try {
    if ('stop' in node && typeof node.stop === 'function') {
      node.stop();
    }
  } catch {
    // A source may already have stopped; disposal remains best effort.
  }
  try {
    node.disconnect();
  } catch {
    // Disconnecting an already detached node is harmless.
  }
}

/**
 * Optional WebAudio realization for the pure plan above. It never constructs
 * or closes an AudioContext: runtime supplies the shared context after an
 * existing user gesture. This avoids competing with PlazaAudioEngine's
 * unlock/mute policy.
 */
export class Arc1WorldAmbience {
  private readonly sources: Arc1WorldAmbienceSourcePositions;
  private readonly layers = new Map<Arc1WorldAmbienceLayer, LayerNodes>();
  private context: AudioContext | null = null;
  private destination: AudioNode | null = null;
  private masterGain: GainNode | null = null;
  private latestFrame: Arc1WorldAmbienceFrame = {
    position: [0, 1, 0],
    region: 'plaza',
    electrical: {},
  };
  private latestPlan: Arc1WorldAmbiencePlan = planArc1WorldAmbience(this.latestFrame);
  private visibilityTarget: Arc1WorldAmbienceVisibilityTarget | null = null;
  private visibilityHidden = false;
  private mutedOverride: boolean | undefined;
  private started = false;
  private disposed = false;
  private readonly onVisibilityChange = (): void => {
    if (!this.visibilityTarget) return;
    this.visibilityHidden = this.visibilityTarget.hidden;
    this.applyPlan();
  };

  public constructor(options: Arc1WorldAmbienceOptions = {}) {
    this.sources = mergeSources(options.sources);
    if (options.visibilityTarget) this.bindVisibility(options.visibilityTarget);
  }

  /** Attaches the already-created shared context; it does not start audio. */
  public attachContext(context: AudioContext, destination?: AudioNode): boolean {
    if (this.disposed || context.state === 'closed') return false;
    if (this.context === context) return true;
    this.teardownGraph();
    this.context = context;
    this.destination = destination ?? context.destination;
    return true;
  }

  /**
   * Call only from the existing input gesture that unlocked PlazaAudioEngine.
   * A missing context is a quiet no-op rather than an implicit new context.
   */
  public unlockFromGesture(context?: AudioContext, destination?: AudioNode): boolean {
    if (context && !this.attachContext(context, destination)) return false;
    if (this.disposed || !this.context || this.context.state === 'closed') return false;
    if (!this.started && !this.buildGraph()) return false;
    this.started = true;
    void this.context.resume().catch(() => undefined);
    this.applyPlan();
    return true;
  }

  public update(frame: Arc1WorldAmbienceFrame): Arc1WorldAmbiencePlan {
    if (this.disposed) return this.latestPlan;
    this.latestFrame = {
      ...frame,
      position: copyPosition(frame.position),
    };
    this.applyPlan();
    return this.latestPlan;
  }

  public setMuted(muted: boolean): void {
    if (this.disposed) return;
    this.mutedOverride = muted;
    this.applyPlan();
  }

  public setHidden(hidden: boolean): void {
    if (this.disposed) return;
    this.visibilityHidden = hidden;
    this.applyPlan();
  }

  public bindVisibility(target: Arc1WorldAmbienceVisibilityTarget): void {
    if (this.visibilityTarget) {
      this.visibilityTarget.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
    this.visibilityTarget = target;
    this.visibilityHidden = target.hidden;
    target.addEventListener('visibilitychange', this.onVisibilityChange);
    this.applyPlan();
  }

  public getPlan(): Arc1WorldAmbiencePlan {
    return this.latestPlan;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.visibilityTarget) {
      this.visibilityTarget.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.visibilityTarget = null;
    }
    this.teardownGraph();
    this.context = null;
    this.destination = null;
  }

  private buildGraph(): boolean {
    if (!this.context || !this.destination || this.masterGain) return Boolean(this.masterGain);
    try {
      const context = this.context;
      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(this.destination);
      this.masterGain = masterGain;
      const noiseBuffer = createBrownNoiseBuffer(context);

      for (const layer of ARC1_WORLD_AMBIENCE_LAYERS) {
        const definition = LAYER_DEFINITIONS[layer];
        const source = context.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = definition.filterType;
        filter.frequency.value = definition.filterFrequency;
        filter.Q.value = definition.filterQ;
        const gain = context.createGain();
        gain.gain.value = 0;
        const panner = context.createStereoPanner();
        panner.pan.value = 0;
        source.connect(filter);
        filter.connect(gain);

        let tone: OscillatorNode | null = null;
        let toneFilter: BiquadFilterNode | null = null;
        let toneGain: GainNode | null = null;
        if (definition.toneHz !== undefined) {
          tone = context.createOscillator();
          tone.type = 'triangle';
          tone.frequency.value = definition.toneHz;
          toneFilter = context.createBiquadFilter();
          toneFilter.type = 'lowpass';
          toneFilter.frequency.value = definition.toneHz * 2.2;
          toneGain = context.createGain();
          toneGain.gain.value = definition.toneMix ?? 0.1;
          tone.connect(toneFilter);
          toneFilter.connect(toneGain);
          toneGain.connect(gain);
        }

        gain.connect(panner);
        panner.connect(masterGain);
        source.start();
        tone?.start();
        this.layers.set(layer, { source, filter, gain, panner, tone, toneFilter, toneGain });
      }
      return true;
    } catch {
      this.teardownGraph();
      return false;
    }
  }

  private applyPlan(): void {
    const frame: Arc1WorldAmbienceFrame = {
      ...this.latestFrame,
      hidden: this.latestFrame.hidden || this.visibilityHidden,
      muted: this.latestFrame.muted || this.mutedOverride,
    };
    this.latestPlan = planArc1WorldAmbience(frame, this.sources);
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain || !this.started) return;

    const now = context.currentTime;
    let hasSignal = false;
    for (const layer of ARC1_WORLD_AMBIENCE_LAYERS) {
      const nodes = this.layers.get(layer);
      if (!nodes) continue;
      const definition = LAYER_DEFINITIONS[layer];
      const level = this.latestPlan.levels[layer] ?? 0;
      hasSignal ||= level > 0.0001;
      nodes.gain.gain.setTargetAtTime(level * definition.maxGain, now, definition.smoothing);
      nodes.panner.pan.setTargetAtTime(this.latestPlan.pans[layer] ?? 0, now, 0.35);
    }
    masterGain.gain.setTargetAtTime(hasSignal ? 1 : 0, now, 0.4);
  }

  private teardownGraph(): void {
    for (const nodes of this.layers.values()) {
      stopAndDisconnect(nodes.source);
      stopAndDisconnect(nodes.tone);
      try {
        nodes.filter.disconnect();
        nodes.gain.disconnect();
        nodes.panner.disconnect();
        nodes.toneFilter?.disconnect();
        nodes.toneGain?.disconnect();
      } catch {
        // Node teardown is intentionally idempotent across context loss.
      }
    }
    this.layers.clear();
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Already detached.
      }
    }
    this.masterGain = null;
    this.started = false;
  }
}
