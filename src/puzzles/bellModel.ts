export type BellSegment = 'left' | 'right' | 'trunk';
export type BellState = 'both-closed' | 'one-open' | 'both-open';

export function bellState(leftClosed: boolean, rightClosed: boolean): BellState {
  if (leftClosed && rightClosed) return 'both-closed';
  if (leftClosed || rightClosed) return 'one-open';
  return 'both-open';
}

export function bellReading(
  leftClosed: boolean,
  rightClosed: boolean,
  segment: BellSegment,
): string {
  if (segment === 'trunk') {
    return leftClosed || rightClosed ? 'Río entero.' : 'Río: cero.';
  }
  if (segment === 'left') {
    if (!leftClosed) return 'Río: cero.';
    return rightClosed ? 'Medio río.' : 'Río entero.';
  }
  if (!rightClosed) return 'Río: cero.';
  return leftClosed ? 'Medio río.' : 'Río entero.';
}

export interface BellProgress {
  visited: Record<BellState, boolean>;
  solved: boolean;
}

export function createBellProgress(): BellProgress {
  return {
    visited: {
      'both-closed': true,
      'one-open': false,
      'both-open': false,
    },
    solved: false,
  };
}

export function visitBellState(progress: BellProgress, state: BellState): BellProgress {
  const visited = { ...progress.visited, [state]: true };
  return {
    visited,
    solved:
      progress.solved ||
      (state === 'both-closed' &&
        visited['both-closed'] &&
        visited['one-open'] &&
        visited['both-open']),
  };
}
