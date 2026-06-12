export interface Flags {
  introSeen: boolean;
  talkedPreceptor: boolean;
  hasBitacora: boolean;
  vioRetrato: boolean;
  sawProjector: boolean;
  plazaSeen: boolean;
  ohmAwake: boolean;
  metLumen: boolean;
  frenoDone: boolean;
  puertaIntro: boolean;
  puertaDone: boolean;
  burnedSomething: boolean;
  finished: boolean;
  playedUnit2Intro: boolean;
  solvedBellPaths: boolean;
  metConsejera: boolean;
  enteredCastle: boolean;
  ohmRecognizedCastle: boolean;
  solvedGalleryChain: boolean;
  solvedBranches: boolean;
  burnedTrunkFuse: boolean;
  solvedDistributor: boolean;
  castleRestored: boolean;
  learnedSeriesParallel: boolean;
  fixedSchoolBell: boolean;
  sawStoredSpark: boolean;
  unit2Completed: boolean;
  heardForgeWarmth: boolean;
}

const DEFAULT_FLAGS: Flags = {
  introSeen: false,
  talkedPreceptor: false,
  hasBitacora: false,
  vioRetrato: false,
  sawProjector: false,
  plazaSeen: false,
  ohmAwake: false,
  metLumen: false,
  frenoDone: false,
  puertaIntro: false,
  puertaDone: false,
  burnedSomething: false,
  finished: false,
  playedUnit2Intro: false,
  solvedBellPaths: false,
  metConsejera: false,
  enteredCastle: false,
  ohmRecognizedCastle: false,
  solvedGalleryChain: false,
  solvedBranches: false,
  burnedTrunkFuse: false,
  solvedDistributor: false,
  castleRestored: false,
  learnedSeriesParallel: false,
  fixedSchoolBell: false,
  sawStoredSpark: false,
  unit2Completed: false,
  heardForgeWarmth: false,
};

export interface GameState {
  room: string;
  flags: Flags;
}

const KEY = 'roxana-slice-v1';

export const state: GameState = {
  room: 'hall',
  flags: { ...DEFAULT_FLAGS },
};

export function hasSave(): boolean {
  return localStorage.getItem(KEY) !== null;
}

export function save(): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function load(): void {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as GameState;
    state.room = data.room ?? 'hall';
    state.flags = { ...DEFAULT_FLAGS, ...data.flags };
  } catch {
    /* save corrupto: empezar de cero */
  }
}

export function resetSave(): void {
  localStorage.removeItem(KEY);
  state.room = 'hall';
  state.flags = { ...DEFAULT_FLAGS };
}

export function setFlag(name: keyof Flags): void {
  state.flags[name] = true;
  save();
}

/** Hooks que la escena de exploración registra para que la UI/los puzzles muevan el mundo. */
export const hooks = {
  /** recargar la sala actual (tras un cambio de flags que afecta visuales) */
  refresh: () => {},
  /** viajar a otra sala */
  goto: (_room: string, _spawn?: { x: number; y: number }) => {},
};
