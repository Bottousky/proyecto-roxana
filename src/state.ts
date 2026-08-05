export interface Flags {
  // Arc I (Ohmdal) flags
  /** introSeen: Hall monologue with the preceptor. seenIntro (below) is the opening cinematic. */
  introSeen: boolean;
  talkedPreceptor: boolean;
  hasBitacora: boolean;
  vioRetrato: boolean;
  sawProjector: boolean;
  plazaSeen: boolean;
  ohmAwake: boolean;
  metLumen: boolean;
  frenoDone: boolean;
  /** Edda llamó al jugador desde el arco norte al salir del Taller. */
  eddaGateCall: boolean;
  puertaIntro: boolean;
  puertaMecanismoIntro: boolean;
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
  playedUnit3Intro: boolean;
  metForjadora: boolean;
  solvedWarmChannel: boolean;
  solvedFuseInfirmary: boolean;
  burnedChannelDemo: boolean;
  solvedLongChannel: boolean;
  solvedForgeNetwork: boolean;
  forgeRestored: boolean;
  learnedPower: boolean;
  unit3Completed: boolean;
  playedUnit4Intro: boolean;
  metGuardiana: boolean;
  solvedVoltageSteps: boolean;
  solvedFairSplit: boolean;
  solvedSingleStone: boolean;
  predictionAttempted: boolean;
  predictionExact: boolean;
  solvedLadder: boolean;
  valleyRestored: boolean;
  learnedKVL: boolean;
  unit4Completed: boolean;
  playedUnit5Intro: boolean;
  metFarero: boolean;
  solvedStoredSpark: boolean;
  consejeraNotedAnomaly: boolean;
  solvedSleepingRiver: boolean;
  solvedClock: boolean;
  clockRestored: boolean;
  solvedLighthouse: boolean;
  lighthouseRestored: boolean;
  learnedCapacitor: boolean;
  arcOneCompleted: boolean;
  sawCrystalEye: boolean;
  unit5Completed: boolean;

  // Prologue (H1) flags
  /** Opening cinematic viewed. Different from introSeen (Hall monologue). */
  seenIntro: boolean;
  /** Bitácora menu (diegetic) opened. */
  bitacoraOpened: boolean;
  /** Second reaction from the preceptor triggered. */
  preceptorReprise: boolean;
  /** Assigned course: 'ninguno', 'electronica', or others for future worlds. */
  cursoAsignado: 'ninguno' | 'electronica';
  /** Room IDs visited by the student. */
  salasVisitadas: string[];
  /** Current objective ID. */
  objetivoActual: string;
  /** Array of past objective IDs. */
  objetivosHistorial: string[];
  /** Saw the old map in the preceptor's office (interaction). */
  vioMapaDespacho: boolean;
  /** Saw the old note (interaction). */
  vioNotaVieja: boolean;
  /** Array of student IDs talked to. */
  estudiantesHablados: string[];
  /** Cinematic was skipped. */
  cinematicaSkipped: boolean;
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
  eddaGateCall: false,
  puertaIntro: false,
  puertaMecanismoIntro: false,
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
  playedUnit3Intro: false,
  metForjadora: false,
  solvedWarmChannel: false,
  solvedFuseInfirmary: false,
  burnedChannelDemo: false,
  solvedLongChannel: false,
  solvedForgeNetwork: false,
  forgeRestored: false,
  learnedPower: false,
  unit3Completed: false,
  playedUnit4Intro: false,
  metGuardiana: false,
  solvedVoltageSteps: false,
  solvedFairSplit: false,
  solvedSingleStone: false,
  predictionAttempted: false,
  predictionExact: false,
  solvedLadder: false,
  valleyRestored: false,
  learnedKVL: false,
  unit4Completed: false,
  playedUnit5Intro: false,
  metFarero: false,
  solvedStoredSpark: false,
  consejeraNotedAnomaly: false,
  solvedSleepingRiver: false,
  solvedClock: false,
  clockRestored: false,
  solvedLighthouse: false,
  lighthouseRestored: false,
  learnedCapacitor: false,
  arcOneCompleted: false,
  sawCrystalEye: false,
  unit5Completed: false,

  // Prologue (H1) defaults
  seenIntro: false,
  bitacoraOpened: false,
  preceptorReprise: false,
  cursoAsignado: 'ninguno',
  salasVisitadas: [],
  objetivoActual: '',
  objetivosHistorial: [],
  vioMapaDespacho: false,
  vioNotaVieja: false,
  estudiantesHablados: [],
  cinematicaSkipped: false,
};

export interface GameState {
  room: string;
  flags: Flags;
}

const KEY = 'roxana-slice-v1';

// `escuela_hub` era el valor por defecto y no es una sala de ninguna experiencia montable:
// pertenecía al hub caminable de Phaser que nunca se registró en el runtime. Toda partida
// nueva arrancaba apuntando a la nada. El prólogo empieza en el hall del Instituto.
const SALA_INICIAL = 'hall';

export const state: GameState = {
  room: SALA_INICIAL,
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
    state.room = data.room ?? SALA_INICIAL;
    state.flags = { ...DEFAULT_FLAGS, ...data.flags };
  } catch {
    /* save corrupto: empezar de cero */
  }
}

export function resetSave(): void {
  localStorage.removeItem(KEY);
  state.room = SALA_INICIAL;
  state.flags = { ...DEFAULT_FLAGS };
}

export function setFlag(name: Exclude<keyof Flags, 'cursoAsignado' | 'salasVisitadas' | 'objetivoActual' | 'objetivosHistorial' | 'estudiantesHablados'>): void {
  (state.flags[name] as any) = true;
  save();
}

/** Hooks que la escena de exploración registra para que la UI/los puzzles muevan el mundo. */
export const hooks = {
  /** recargar la sala actual (tras un cambio de flags que afecta visuales) */
  refresh: () => {},
  /** viajar a otra sala */
  goto: (_room: string, _spawn?: { x: number; y: number }) => {},
  /** cruzar la frontera entre runtimes a través del shell */
  travel: (_experienceId: string, _room?: string) => {},
};
