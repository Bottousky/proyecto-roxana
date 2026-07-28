import type { AulaEstado, SchoolState } from './schoolModel.ts';

export type VoxelZoneId =
  | 'hall'
  | 'programacion'
  | 'audiovisual'
  | 'electronica'
  | 'matematica'
  | 'biblioteca'
  | 'logros'
  | 'fisica'
  | 'direccion'
  | 'visitantes'
  | 'preceptoria';

export type VoxelRoomKind =
  | 'hall'
  | 'classroom'
  | 'library'
  | 'theater'
  | 'achievements'
  | 'office'
  | 'reception'
  | 'shop';

export interface VoxelRoom {
  id: VoxelZoneId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  kind: VoxelRoomKind;
  x: number;
  y: number;
  width: number;
  depth: number;
  presentationLevel: 0 | 1 | 2;
  floor: string;
  accent: string;
  embedded?: boolean;
  href?: string;
  actionLabel?: string;
}

export type VoxelZoneState = 'open' | 'active' | 'restored' | 'closed' | 'quiet';

// La grilla es la proyección exacta de scripts/blender/school_plan.py: el mapa
// 2D y el diorama 3D consumen los mismos rectángulos sobre módulos de 0,5 m.
// Conversión desde coordenadas Blender:
//   x_grilla = x_mundo + 24        y_grilla = 17 - y_mundo
// (el norte del plano queda arriba, como en pantalla).
export const SCHOOL_GRID = { width: 48, depth: 29 } as const;

export const VOXEL_ROOMS: readonly VoxelRoom[] = [
  {
    id: 'programacion', title: 'Aula de Programación', shortTitle: 'Programación', eyebrow: 'Mundo Aplicado',
    description: 'Un aula de terminales apagadas. Bitland espera detrás de una puerta todavía sellada.',
    kind: 'classroom', x: 34, y: 11, width: 14, depth: 10, presentationLevel: 1, floor: '#263442', accent: '#62a7d9', href: '#aulas', actionLabel: 'Ver las aulas',
  },
  {
    id: 'audiovisual', title: 'Sala Audiovisual', shortTitle: 'Audiovisual', eyebrow: 'Archivo audiovisual',
    description: 'La sala donde se conservan las proyecciones, escenas y testimonios recuperados durante el viaje.',
    kind: 'theater', x: 14, y: 20, width: 1, depth: 2, presentationLevel: 1, embedded: true, floor: '#342b3d', accent: '#c1779e', href: '#anfiteatro', actionLabel: 'Ir al anfiteatro',
  },
  {
    id: 'electronica', title: 'Aula de Electrónica', shortTitle: 'Electrónica', eyebrow: 'Ohmdal',
    description: 'La primera aula viva. Su proyector abre el paso a Ohmdal, el mundo de la corriente.',
    kind: 'classroom', x: 0, y: 11, width: 14, depth: 10, presentationLevel: 1, floor: '#2a3c3b', accent: '#4fd1c5', href: '#aula/electronica', actionLabel: 'Entrar al aula',
  },
  {
    id: 'matematica', title: 'Aula de Matemática', shortTitle: 'Matemática', eyebrow: 'Arithmos',
    description: 'Patrones, proporciones y estructuras aguardan detrás de una puerta aún cerrada.',
    kind: 'classroom', x: 0, y: 1, width: 14, depth: 10, presentationLevel: 2, floor: '#3d3326', accent: '#e0a84f', href: '#aulas', actionLabel: 'Ver las aulas',
  },
  {
    id: 'biblioteca', title: 'Biblioteca y Bitácora', shortTitle: 'Biblioteca', eyebrow: 'Memoria del Instituto',
    description: 'Los estantes reúnen lo vivido y la Bitácora convierte cada experiencia en conocimiento formal.',
    kind: 'library', x: 14, y: 12.5, width: 1, depth: 2, presentationLevel: 1, embedded: true, floor: '#382f2d', accent: '#c89b68', href: '#biblioteca', actionLabel: 'Ir a la biblioteca',
  },
  {
    id: 'hall', title: 'Hall central', shortTitle: 'Hall', eyebrow: 'Instituto Roxana',
    description: 'El corazón de la escuela: conecta las aulas, los servicios y los mundos que vuelven a despertar.',
    kind: 'hall', x: 14, y: 7, width: 20, depth: 22, presentationLevel: 1, floor: '#302e38', accent: '#ffd34d',
  },
  {
    id: 'logros', title: 'Sala de Logros', shortTitle: 'Logros', eyebrow: 'Progreso',
    description: 'Una vitrina que se completa con las unidades restauradas y los descubrimientos del jugador.',
    kind: 'achievements', x: 33, y: 12.5, width: 1, depth: 2, presentationLevel: 1, embedded: true, floor: '#3b3328', accent: '#efc45b', href: '#trofeos', actionLabel: 'Ver los logros',
  },
  {
    id: 'fisica', title: 'Aula de Física', shortTitle: 'Física', eyebrow: 'Physica',
    description: 'Instrumentos inmóviles esperan que alguien vuelva a preguntar cómo se mueve el mundo.',
    kind: 'classroom', x: 34, y: 1, width: 14, depth: 10, presentationLevel: 2, floor: '#2d3040', accent: '#8d91e8', href: '#aulas', actionLabel: 'Ver las aulas',
  },
  {
    id: 'direccion', title: 'Dirección', shortTitle: 'Dirección', eyebrow: 'Archivo de Roxana',
    description: 'El despacho conserva rastros de la directora y del propósito original de los Mundos Aplicados.',
    kind: 'office', x: 18.5, y: 0, width: 11, depth: 7, presentationLevel: 2, floor: '#392c2c', accent: '#d87c66',
  },
  {
    id: 'visitantes', title: 'Anfiteatro', shortTitle: 'Anfiteatro', eyebrow: 'Archivo y encuentros',
    description: 'La sala de actos conserva proyecciones y recibe a quienes regresan de otros mundos para compartir lo aprendido.',
    kind: 'theater', x: 34, y: 21, width: 12, depth: 8, presentationLevel: 0, floor: '#343028', accent: '#d6a55c', href: '#anfiteatro', actionLabel: 'Ir al anfiteatro',
  },
  {
    id: 'preceptoria', title: 'Preceptoría', shortTitle: 'Preceptoría', eyebrow: 'Punto de partida',
    description: 'El lugar de bienvenida, orientación y perfil del estudiante antes de cruzar a los mundos.',
    kind: 'reception', x: 2, y: 21, width: 12, depth: 8, presentationLevel: 0, floor: '#2d3535', accent: '#75b8a4', href: '#preceptoria', actionLabel: 'Ir a preceptoría',
  },
] as const;

export function gridToIso(x: number, y: number, z = 0, tileWidth = 32, tileHeight = 16, voxelHeight = 12): { x: number; y: number } {
  return {
    x: (x - y) * (tileWidth / 2),
    y: (x + y) * (tileHeight / 2) - z * voxelHeight,
  };
}

export function isoToGrid(screenX: number, screenY: number, tileWidth = 32, tileHeight = 16): { x: number; y: number } {
  return {
    x: screenX / tileWidth + screenY / tileHeight,
    y: screenY / tileHeight - screenX / tileWidth,
  };
}

export function zoneAtCell(x: number, y: number): VoxelRoom | null {
  const contains = (room: VoxelRoom) =>
    x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.depth;
  return VOXEL_ROOMS.find((room) => room.embedded && contains(room))
    ?? VOXEL_ROOMS.find(contains)
    ?? null;
}

/**
 * Devuelve true cuando `candidate` queda entre la cámara frontal y `target`.
 * Como la planta es ortogonal, el solape horizontal y una fila más cercana
 * bastan para derivar el obstáculo sin mantener pares manuales.
 */
export function schoolRoomOccludes(candidate: VoxelRoom, target: VoxelRoom): boolean {
  if (candidate.id === target.id || candidate.embedded) return false;
  const horizontalOverlap =
    Math.min(candidate.x + candidate.width, target.x + target.width)
    - Math.max(candidate.x, target.x);
  return horizontalOverlap > .5 && candidate.y > target.y + .5;
}

function stateForAula(state: AulaEstado): VoxelZoneState {
  if (state === 'completada') return 'restored';
  if (state === 'enCurso') return 'active';
  if (state === 'off') return 'open';
  return 'closed';
}

export function voxelZoneState(id: VoxelZoneId, school: SchoolState): VoxelZoneState {
  if (id === 'electronica') return stateForAula(school.aulas.electronica);
  if (id === 'programacion') return stateForAula(school.aulas.programacion);
  if (id === 'fisica') return stateForAula(school.aulas.fisica);
  if (id === 'matematica') return stateForAula(school.aulas.matematica);
  if (id === 'logros') return school.electronica.unidadesCompletadas > 0 ? 'active' : 'quiet';
  if (id === 'biblioteca') return school.electronica.unidadesCompletadas > 0 ? 'open' : 'quiet';
  return 'open';
}

export function voxelStateLabel(state: VoxelZoneState): string {
  return {
    open: 'Abierta', active: 'En restauración', restored: 'Restaurada', closed: 'Cerrada', quiet: 'En silencio',
  }[state];
}

export function schoolRoomFromHash(hash: string): VoxelZoneId | null {
  const match = hash.match(/^#sala\/([a-z]+)$/);
  const id = match?.[1] as VoxelZoneId | undefined;
  return id && VOXEL_ROOMS.some((room) => room.id === id) ? id : null;
}
