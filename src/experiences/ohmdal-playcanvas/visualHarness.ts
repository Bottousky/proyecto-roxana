export const OHMDAL_VISUAL_CAMERA_PRESETS = {
  'portal-arrival': { position: [0, 1.68, -9.4], yaw: 180, pitch: -4 },
  'workshop-approach': { position: [-1.2, 1.68, -4.0], yaw: 90, pitch: -3 },
  'ohm-landmark': { position: [0, 1.68, -6.2], yaw: 180, pitch: -5 },
  'omega-gate': { position: [0, 1.68, 4.2], yaw: 180, pitch: -8 },
  'plaza-wide': { position: [0, 11.5, -13.2], yaw: 180, pitch: -33 },
  'active-play-desktop': { position: [0, 1.68, -8.0], yaw: 180, pitch: 0 },
  'active-play-mobile': { position: [0, 1.68, -5.2], yaw: 180, pitch: -6 },
  'no-post': { position: [0, 1.68, -8.0], yaw: 180, pitch: 0 },
} as const;

export type OhmdalVisualCameraName = keyof typeof OHMDAL_VISUAL_CAMERA_PRESETS;
export type OhmdalVisualStateName = 'portal-arrival' | 'restored-plaza';

/**
 * Authored-pass capture names extend the stable A0 harness without changing
 * the legacy camera/state contract. Authored shots are applied through the
 * optional setCaptureShot hook because they also need zone/story/tool setup.
 */
export const OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES = [
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
] as const;

export type OhmdalVisualCaptureShotName =
  | OhmdalVisualCameraName
  | typeof OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES[number];

export type OhmdalVisualCaptureStateName =
  | OhmdalVisualStateName
  | typeof OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES[number];

export type OhmdalVisualCaptureCameraName =
  | OhmdalVisualCameraName
  | typeof OHMDAL_AUTHORED_CAPTURE_SHOT_NAMES[number];

export interface RoxanaOhmdalCaptureShot {
  id: OhmdalVisualCaptureShotName;
  state: OhmdalVisualCaptureStateName;
  camera: OhmdalVisualCaptureCameraName;
  runtimeHook: 'setCaptureShot' | 'setStateAndCamera';
  viewport: { width: number; height: number };
  hideUi: boolean;
  post: boolean;
  anchor: {
    position: readonly [number, number, number];
    yaw: number;
    pitch: number;
  } | null;
  world: {
    zone: 'plaza' | 'workshop' | 'manantial' | 'castle' | 'forge-terraces' | 'lighthouse';
    storyStep: string;
    tool?: 'galvanoscope';
    probeTarget?: string;
    interaction?: 'intake-gate' | 'bell';
    comparison?: 'before-after';
    measurementPoint?: 'generator' | 'turbine' | 'return' | 'load' | 'castle-bus' | 'forge-bus';
    plaza?: {
      bellPulls: number;
      castleGateOpened: boolean;
    };
    manantial?: {
      gateOpen: boolean;
      returnBridgeInstalled: boolean;
      excitationEnabled: boolean;
      protectiveTrip: boolean;
      restored: boolean;
    };
    castle?: {
      topology: 'unwired' | 'parallel' | 'mixed' | 'series';
      returnContinuity: boolean;
      energized: boolean;
      protectiveTrip: boolean;
    };
    forgeTerraces?: {
      allocation: { forge: number; terraces: number };
      conductor?: 'narrow' | 'medium' | 'wide';
      energized: boolean;
      protectiveTrip: boolean;
      restored: boolean;
    };
    lighthouse?: {
      mode?: 'dc';
      calibrated?: boolean;
      energized?: boolean;
      restored?: boolean;
    };
  };
  deterministic: {
    seed: number;
    reducedMotion: boolean;
    pauseBeforeCapture: boolean;
  };
}

export interface RoxanaVisualDiagnostics {
  browser: {
    renderer: string | null;
    vendor: string | null;
    deviceType: string;
    softwareRendered: boolean | null;
  };
  performance: {
    fpsP50: number | null;
    fpsP10: number | null;
    frameTimeMsP95: number | null;
    note: string | null;
  };
  render: {
    drawCalls: number | null;
    triangles: number | null;
    meshesOrGeometries: number;
    materials: number;
    textures: number;
  };
  assets: {
    transferredMb: number;
    largestAssets: { name: string; transferredMb: number }[];
  };
  zones: {
    loaded: string[];
    active: string[];
  };
  navigation: CollisionDiagnostic;
  shadows: {
    lights: number;
    castingLights: number;
    castingRenderers: number;
    mobileMeaningfulLightLimit: number;
  };
  harness: {
    camera: OhmdalVisualCameraName;
    state: OhmdalVisualStateName;
    captureShot: OhmdalVisualCaptureShotName | null;
    paused: boolean;
    reducedMotion: boolean;
    debugUiHidden: boolean;
    postProcessing: boolean;
    seed: number;
    randomSeedNote: string;
  };
}

export interface RoxanaOhmdalPlaytestSnapshot {
  storyStep: string;
  mode: string;
  position: [number, number, number];
  yaw: number;
  ohmAwake: boolean;
  inventory: { jumper: boolean; brush: boolean };
  dialogue: { id: string; lineIndex: number; lineCount: number; hasChoices: boolean } | null;
  circuit: {
    gateOpen: boolean;
    relayEnergized: boolean;
    relayClosed: boolean;
    jumperClosed: boolean;
    corrosionClosed: boolean;
    corrosionResistance: number;
  };
  galvanoscope: {
    probeA: string | null;
    probeB: string | null;
    measuredVoltage: number;
    measuredResistance: number;
    measuredCurrent: number;
  };
  nearestInteractable: string | null;
  zones: { id: string; loaded: boolean; active: boolean }[];
  arc1: Arc1GreyboxSnapshot;
}

export interface RoxanaVisualTestHooks {
  seed(value: number): void;
  setState(name: OhmdalVisualStateName): void;
  setCamera(name: OhmdalVisualCameraName): void;
  /**
   * Optional authored-pass hook. Authored capture must fail closed when this is not
   * wired; silently using a Plaza alias would invalidate the evidence.
   */
  setCaptureShot?(shot: RoxanaOhmdalCaptureShot): void | Promise<void>;
  setPausedForScreenshot(paused: boolean): void;
  setReducedMotion(enabled: boolean): void;
  hideDebugUi(hidden: boolean): void;
  setPostProcessing(enabled: boolean): void;
  getDiagnostics(): RoxanaVisualDiagnostics;
  getCollisionDiagnostics(): CollisionDiagnostic;
  getPlaytestSnapshot(): RoxanaOhmdalPlaytestSnapshot;
}

declare global {
  interface Window {
    __ROXANA_VISUAL_TEST_HOOKS__?: RoxanaVisualTestHooks;
  }
}

export function percentile(values: number[], ratio: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index] ?? null;
}

export function isSoftwareRenderer(renderer: string | null): boolean | null {
  if (!renderer) return null;
  return /(swiftshader|llvmpipe|software rasterizer|microsoft basic render)/i.test(renderer);
}
import type { Arc1GreyboxSnapshot } from './systems/campaign/arc1GreyboxModel.ts';
import type { CollisionDiagnostic } from './systems/navigation/ohmdalNavigation.ts';
