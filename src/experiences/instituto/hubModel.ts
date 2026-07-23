export type HubModuleId =
  | 'audiovisual'
  | 'direccion'
  | 'biblioteca'
  | 'electronica'
  | 'programacion'
  | 'fisica'
  | 'matematica'
  | 'progreso'
  | 'preceptoria'
  | 'bitacora';

export type HubModuleKind = 'service' | 'world' | 'system';
export type HubModuleState = 'attention' | 'open' | 'live' | 'quiet' | 'locked' | 'planned';

export interface HubModule {
  id: HubModuleId;
  title: string;
  eyebrow: string;
  description: string;
  kind: HubModuleKind;
  area: string;
  asset: string;
  accent: string;
  actionLabel: string;
}

export interface HubFlags {
  talkedPreceptor: boolean;
  hasBitacora: boolean;
  sawProjector: boolean;
  finished: boolean;
  unit2Completed: boolean;
  unit3Completed: boolean;
  unit4Completed: boolean;
  unit5Completed: boolean;
  objetivoActual: string;
}

export const HUB_MODULES: readonly HubModule[] = [
  {
    id: 'audiovisual', title: 'Audiovisual', eyebrow: 'Memoria de la escuela',
    description: 'Proyecciones, archivos y registros de los mundos aplicados.',
    kind: 'service', area: 'audio', asset: 'audiovisual', accent: '#7cb8d7', actionLabel: 'Explorar archivo',
  },
  {
    id: 'direccion', title: 'Dirección', eyebrow: 'Roxana',
    description: 'Un despacho abierto, una silla vacía y demasiadas preguntas sin responder.',
    kind: 'service', area: 'direction', asset: 'direccion', accent: '#d5a85e', actionLabel: 'Entrar a Dirección',
  },
  {
    id: 'biblioteca', title: 'Biblioteca', eyebrow: 'Consulta y Bitácora',
    description: 'La memoria escrita de la escuela. Sus estantes cambian con lo aprendido.',
    kind: 'service', area: 'library', asset: 'biblioteca', accent: '#d5a85e', actionLabel: 'Consultar biblioteca',
  },
  {
    id: 'electronica', title: 'Electrónica', eyebrow: 'Mundo disponible · Ohmdal',
    description: 'Circuitos, señales y caminos de energía. El primer taller que volvió a responder.',
    kind: 'world', area: 'electronics', asset: 'electronica', accent: '#41d9e6', actionLabel: 'Entrar al taller',
  },
  {
    id: 'programacion', title: 'Programación', eyebrow: 'Mundo en preparación',
    description: 'Sistemas, instrucciones y procesos que podrán recorrerse desde adentro.',
    kind: 'world', area: 'programming', asset: 'programacion', accent: '#44d9c4', actionLabel: 'Ver programa',
  },
  {
    id: 'fisica', title: 'Física', eyebrow: 'Mundo en preparación',
    description: 'Movimiento, fuerza y materia convertidos en experiencia directa.',
    kind: 'world', area: 'physics', asset: 'fisica', accent: '#d4a856', actionLabel: 'Ver laboratorio',
  },
  {
    id: 'matematica', title: 'Matemática', eyebrow: 'Mundo en preparación',
    description: 'Las estructuras invisibles que sostienen los otros mundos.',
    kind: 'world', area: 'mathematics', asset: 'matematica', accent: '#d8a557', actionLabel: 'Ver aula',
  },
  {
    id: 'progreso', title: 'Muro de progreso', eyebrow: 'Trayecto del estudiante',
    description: 'Insignias, restauraciones y preguntas que ya dejaron una marca.',
    kind: 'system', area: 'progress', asset: 'progreso', accent: '#e5bc6a', actionLabel: 'Ver mi recorrido',
  },
  {
    id: 'preceptoria', title: 'Preceptoría', eyebrow: 'Punto de partida',
    description: 'Objetivos, orientación y novedades de la escuela.',
    kind: 'service', area: 'reception', asset: 'preceptoria', accent: '#d7a757', actionLabel: 'Hablar con el preceptor',
  },
  {
    id: 'bitacora', title: 'Bitácora', eyebrow: 'Registro escolar',
    description: 'Cursos, objetivos, mapas y conocimiento recuperado.',
    kind: 'system', area: 'journal', asset: 'bitacora', accent: '#cda565', actionLabel: 'Abrir Bitácora',
  },
];

export function hubModuleById(id: HubModuleId): HubModule {
  return HUB_MODULES.find((module) => module.id === id)!;
}

export function hubModuleState(id: HubModuleId, flags: HubFlags): HubModuleState {
  if (id === 'preceptoria') return flags.talkedPreceptor ? 'open' : 'attention';
  if (id === 'direccion') return flags.talkedPreceptor ? 'open' : 'quiet';
  if (id === 'electronica') return flags.sawProjector ? 'live' : 'open';
  if (id === 'biblioteca') return flags.hasBitacora ? 'live' : 'quiet';
  if (id === 'bitacora') return flags.hasBitacora ? 'live' : 'locked';
  if (id === 'progreso') return hubProgress(flags) > 0 ? 'live' : 'quiet';
  if (id === 'audiovisual') return 'open';
  return 'planned';
}

export function hubProgress(flags: HubFlags): number {
  const milestones = [
    flags.finished,
    flags.unit2Completed,
    flags.unit3Completed,
    flags.unit4Completed,
    flags.unit5Completed,
  ];
  return Math.round((milestones.filter(Boolean).length / milestones.length) * 100);
}

export function hubOpenWorlds(flags: HubFlags): number {
  return flags.sawProjector ? 1 : 1;
}
