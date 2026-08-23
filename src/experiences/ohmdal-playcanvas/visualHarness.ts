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
  harness: {
    camera: OhmdalVisualCameraName;
    state: OhmdalVisualStateName;
    paused: boolean;
    reducedMotion: boolean;
    debugUiHidden: boolean;
    postProcessing: boolean;
    seed: number;
    randomSeedNote: string;
  };
}

export interface RoxanaVisualTestHooks {
  seed(value: number): void;
  setState(name: OhmdalVisualStateName): void;
  setCamera(name: OhmdalVisualCameraName): void;
  setPausedForScreenshot(paused: boolean): void;
  setReducedMotion(enabled: boolean): void;
  hideDebugUi(hidden: boolean): void;
  setPostProcessing(enabled: boolean): void;
  getDiagnostics(): RoxanaVisualDiagnostics;
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
