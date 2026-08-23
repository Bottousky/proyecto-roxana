/**
 * Immutable authored coordinates for the Plaza's conductor routes.
 *
 * This module intentionally contains data only.  The world owns the
 * PlayCanvas entities and iterates these records when wiring the route.
 */

export type PlazaConductorSide = -1 | 1;

export type PlazaConductorMainSegment = {
  readonly side: PlazaConductorSide;
  readonly x: number;
  readonly z: number;
  readonly length: number;
};

export type PlazaConductorRouteTermination = {
  readonly z: number;
};

export type PlazaConductorWorkshopBranchSegment = {
  readonly x: number;
  readonly z: number;
  readonly length: number;
};

export type PlazaConductorWorkshopJunction = {
  readonly x: number;
  readonly z: number;
};

export type PlazaConductorLayout = {
  readonly mainSegments: readonly PlazaConductorMainSegment[];
  readonly routeTerminations: readonly PlazaConductorRouteTermination[];
  readonly workshopBranchSegments: readonly PlazaConductorWorkshopBranchSegment[];
  readonly workshopJunction: PlazaConductorWorkshopJunction;
};

export const PLAZA_CONDUCTOR_LAYOUT = {
  mainSegments: [
    { side: -1, x: -0.9, z: -8.25, length: 2.7 },
    { side: -1, x: -0.9, z: -5.5, length: 2.8 },
    { side: -1, x: -0.9, z: 1.2, length: 3.0 },
    { side: -1, x: -0.9, z: 4.25, length: 3.0 },
    { side: -1, x: -0.9, z: 7.3, length: 3.0 },
    { side: -1, x: -0.9, z: 9.25, length: 1.1 },
    { side: 1, x: 0.9, z: -8.25, length: 2.7 },
    { side: 1, x: 0.9, z: -5.5, length: 2.8 },
    { side: 1, x: 0.9, z: 1.2, length: 3.0 },
    { side: 1, x: 0.9, z: 4.25, length: 3.0 },
    { side: 1, x: 0.9, z: 7.3, length: 3.0 },
    { side: 1, x: 0.9, z: 9.25, length: 1.1 },
  ],
  routeTerminations: [
    { z: -9.55 },
    { z: -6.9 },
    { z: -4.1 },
    { z: -0.25 },
    { z: 2.7 },
    { z: 5.75 },
    { z: 8.75 },
    { z: 9.75 },
  ],
  workshopBranchSegments: [
    { x: -2.5, z: -4, length: 3.2 },
    { x: -5.2, z: -4, length: 2.3 },
  ],
  workshopJunction: { x: -6.45, z: -4 },
} as const satisfies PlazaConductorLayout;
