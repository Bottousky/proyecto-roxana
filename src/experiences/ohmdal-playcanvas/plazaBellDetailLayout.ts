/**
 * Immutable authored detail coordinates for the Plaza's BellGantry.
 *
 * The layout is deliberately data-only.  PlayCanvas owns the entities and
 * materials; this module only fixes the small, symmetric ceramic/brass detail
 * language that hangs from the existing gantry posts.
 */

export type PlazaBellDetailPosition = readonly [number, number, number];
export type PlazaBellDetailScale = readonly [number, number, number];

export type PlazaBellDetail = {
  readonly name: string;
  readonly position: PlazaBellDetailPosition;
  readonly scale: PlazaBellDetailScale;
};

export type PlazaBellDetailLayout = {
  readonly insulators: readonly PlazaBellDetail[];
  readonly brackets: readonly PlazaBellDetail[];
};

/**
 * Four paired ceramic insulators and four small brass brackets.  The two
 * columns mirror the BellGantry posts at x=-6.15 and x=-4.25; the two rows
 * follow the existing gantry depth at z=2.15 and z=2.65.
 */
export const PLAZA_BELL_DETAIL_LAYOUT = {
  insulators: [
    { name: 'BellGantryInsulator0', position: [-6.15, 3.35, 2.15], scale: [0.14, 0.2, 0.14] },
    { name: 'BellGantryInsulator1', position: [-4.25, 3.35, 2.15], scale: [0.14, 0.2, 0.14] },
    { name: 'BellGantryInsulator2', position: [-6.15, 3.35, 2.65], scale: [0.14, 0.2, 0.14] },
    { name: 'BellGantryInsulator3', position: [-4.25, 3.35, 2.65], scale: [0.14, 0.2, 0.14] },
  ],
  brackets: [
    { name: 'BellGantryBracket0', position: [-6.15, 3.35, 2.15], scale: [0.22, 0.07, 0.12] },
    { name: 'BellGantryBracket1', position: [-4.25, 3.35, 2.15], scale: [0.22, 0.07, 0.12] },
    { name: 'BellGantryBracket2', position: [-6.15, 3.35, 2.65], scale: [0.22, 0.07, 0.12] },
    { name: 'BellGantryBracket3', position: [-4.25, 3.35, 2.65], scale: [0.22, 0.07, 0.12] },
  ],
} as const satisfies PlazaBellDetailLayout;
