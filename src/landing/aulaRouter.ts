import type { AulaId } from './schoolModel.ts';

const AULA_IDS: AulaId[] = ['electronica', 'programacion', 'fisica', 'matematica'];

/** Función pura: parsea el hash de ubicación a un AulaId, o null si no aplica. */
export function parseAulaHash(hash: string): AulaId | null {
  if (!hash) return null;
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  const parts = clean.split('/');
  if (parts.length !== 2 || parts[0] !== 'aula') return null;
  const candidate = parts[1];
  return (AULA_IDS as string[]).includes(candidate) ? (candidate as AulaId) : null;
}
