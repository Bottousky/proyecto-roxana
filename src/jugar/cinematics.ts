/** Named Arc I cinematic orchestration points. Presentation remains owned by existing helpers. */
export const CINEMATIC_IDS = ['portal-arrival','awakening','puerta-apertura','faro-reveal','faro-closing','instituto-return'] as const;
export type CinematicId = typeof CINEMATIC_IDS[number];
export function isCinematicId(value: string | undefined): value is CinematicId { return CINEMATIC_IDS.includes(value as CinematicId); }
/** Observable, no-op outside browsers; presentation remains owned by callers. */
export function announceCinematic(id: CinematicId): void {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('roxana:cinematic', { detail: { id } }));
}
/** A skip/fallback must always release the lock acquired by its owner. */
export function completeCinematic(release: () => void, after?: () => void): void { release(); after?.(); }
