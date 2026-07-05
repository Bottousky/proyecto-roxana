/** Resuelve el retrato sin depender del DOM; es auditable por tests. */
export function portraitKey(who: string): string {
  const name = who.toLocaleLowerCase('es');
  if (!name) return '';
  if (name.includes('edda')) return 'edda';
  if (name.includes('lumen')) return 'lumen';
  if (name.includes('preceptor')) return 'preceptor';
  if (name.includes('consejera')) return 'consejera';
  if (name.includes('guardiana')) return 'guardiana';
  if (name.includes('forjadora') || name.includes('yesca')) return 'yesca';
  if (name.includes('farero')) return 'farero';
  if (name.includes('ohm')) return 'ohm';
  if (name.includes('proyector')) return 'proyector';
  if (name.includes('niño') || name.includes('nino')) return 'nino';
  if (name.includes('ciudadano')) return 'ciudadano';
  if (name.includes('estudiante') || name.includes('protagonista') || name.includes('jugador')) return 'student';
  // Un nombre nuevo nunca debe heredar por accidente la cara del protagonista.
  return '';
}
