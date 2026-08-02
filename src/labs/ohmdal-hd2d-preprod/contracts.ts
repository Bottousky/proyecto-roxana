import type { CameraVariant, ZoneId } from './architecture/index.ts';
import type { DiagnosisState } from './education/diagnosisModel.ts';

export type DirectionVariant = 4 | 8;
export type OhmVariant = 'sprite' | 'procedural';
export type TimeVariant = 'afternoon' | 'twilight';

export interface HarnessSnapshot {
  readonly seed: 'ohmdal-hd2d-preprod-v1';
  readonly player: { readonly x: number; readonly y: 0; readonly z: number; readonly headingDegrees: number };
  readonly zone: ZoneId;
  readonly camera: CameraVariant;
  readonly directionVariant: DirectionVariant;
  readonly ohmVariant: OhmVariant;
  readonly time: TimeVariant;
  readonly autoRoute: boolean;
  readonly reducedMotion: boolean;
  readonly diagnosis: DiagnosisState;
  readonly renderer: {
    readonly calls: number;
    readonly triangles: number;
    readonly geometries: number;
    readonly textures: number;
  };
  readonly occlusion: {
    readonly blockedIds: readonly string[];
    readonly targets: readonly { readonly id: string; readonly opacity: number }[];
  };
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (milliseconds: number) => void;
  }
}
