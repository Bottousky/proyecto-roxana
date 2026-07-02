import { ARITHMOS, BITLAND, INSTITUTO, OHMDAL, PHYSICA } from './manifests.ts';
import type { ExperienceId, ExperienceManifest } from './types.ts';

export const EXPERIENCES: readonly ExperienceManifest[] = [
  INSTITUTO,
  OHMDAL,
  BITLAND,
  PHYSICA,
  ARITHMOS,
];

const BY_ID = new Map<ExperienceId, ExperienceManifest>(
  EXPERIENCES.map((experience) => [experience.id, experience]),
);

const BY_ROOM = new Map<string, ExperienceManifest>();
for (const experience of EXPERIENCES) {
  for (const room of experience.rooms) {
    if (BY_ROOM.has(room)) throw new Error(`La sala ${room} pertenece a más de una experiencia`);
    BY_ROOM.set(room, experience);
  }
}

export function experienceById(id: ExperienceId): ExperienceManifest {
  return BY_ID.get(id)!;
}

export function experienceOfRoom(roomId: string): ExperienceManifest | null {
  return BY_ROOM.get(roomId) ?? null;
}

/**
 * Publica la experiencia activa en el shell web. Hoy habilita estilos y pruebas;
 * mañana será la señal de frontera para descargar/cambiar de runtime.
 */
export function activateExperienceForRoom(roomId: string): ExperienceManifest | null {
  const experience = experienceOfRoom(roomId);
  document.documentElement.dataset.experience = experience?.id ?? 'unknown';
  document.documentElement.dataset.runtime = experience?.runtime ?? 'unknown';
  window.dispatchEvent(
    new CustomEvent('roxana:experiencechange', {
      detail: { roomId, experienceId: experience?.id ?? null, runtime: experience?.runtime ?? null },
    }),
  );
  return experience;
}
