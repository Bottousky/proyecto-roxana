// Modelo puro de la escuela (landing). Sin DOM. Deriva estado de la web a partir
// de dos fuentes de localStorage crudas: el save del juego (read-only) y el
// estado propio de la web.

export type AulaId = 'electronica' | 'programacion' | 'fisica' | 'matematica';
export type AulaEstado = 'cerrada' | 'off' | 'enCurso' | 'completada';

export interface SchoolState {
  introVista: boolean;
  perfilNombre: string | null;
  aulas: Record<AulaId, AulaEstado>;
  electronica: {
    unidadesCompletadas: number;
    totalUnidades: number;
    arcoCompleto: boolean;
  };
}

/** Forma esperada (parcial) del save crudo del juego, roxana-slice-v1. Ver src/state.ts. */
interface GameSaveShape {
  room?: string;
  flags?: {
    finished?: boolean;
    unit2Completed?: boolean;
    unit3Completed?: boolean;
    unit4Completed?: boolean;
    unit5Completed?: boolean;
    arcOneCompleted?: boolean;
    [key: string]: unknown;
  };
}

/** Forma del estado propio de la web, roxana-web-v1. Definida por la landing. */
interface WebStateShape {
  introVista?: boolean;
  perfil?: { nombre?: string };
  cinematicasVistas?: string[];
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const TOTAL_UNIDADES_ELECTRONICA = 5;

export function deriveSchoolState(saveRaw: string | null, webRaw: string | null): SchoolState {
  const save = safeParse<GameSaveShape>(saveRaw);
  const web = safeParse<WebStateShape>(webRaw);

  const flags = save?.flags;
  const tieneSaveValido = save !== null && flags !== undefined;

  const ordenUnidades: Array<boolean | undefined> = [
    flags?.finished, // U1
    flags?.unit2Completed,
    flags?.unit3Completed,
    flags?.unit4Completed,
    flags?.unit5Completed,
  ];
  const unidadesCompletadas = ordenUnidades.filter((f) => f === true).length;
  const arcoCompleto = flags?.arcOneCompleted === true;

  let electronicaEstado: AulaEstado;
  if (!tieneSaveValido) {
    electronicaEstado = 'off';
  } else if (arcoCompleto) {
    electronicaEstado = 'completada';
  } else {
    electronicaEstado = 'enCurso';
  }

  return {
    introVista: web?.introVista === true,
    perfilNombre: web?.perfil?.nombre ?? null,
    aulas: {
      electronica: electronicaEstado,
      programacion: 'cerrada',
      fisica: 'cerrada',
      matematica: 'cerrada',
    },
    electronica: {
      unidadesCompletadas,
      totalUnidades: TOTAL_UNIDADES_ELECTRONICA,
      arcoCompleto,
    },
  };
}

const SAVE_KEY = 'roxana-slice-v1';
const WEB_KEY = 'roxana-web-v1';

/** Único punto de lectura de localStorage para el estado de la escuela. */
export function readSchoolState(): SchoolState {
  const saveRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(SAVE_KEY) : null;
  const webRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(WEB_KEY) : null;
  return deriveSchoolState(saveRaw, webRaw);
}
