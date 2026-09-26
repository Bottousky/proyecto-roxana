// Entries describe actions the player actually took. Unlocking a chapter or
// restoring a legacy save must not manufacture measurements or experiments.
const KINDS = new Set(['observation', 'measurement', 'intervention', 'prediction', 'result']);
const clean = (value, limit) => typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, limit) : '';
export function normalizeBenchEvidence(entries) {
  if (!Array.isArray(entries)) return [];
  return trimEvidence(entries.slice(-120).flatMap(entry => {
    if (!entry || !KINDS.has(entry.kind)) return [];
    const text = clean(entry.text, 280);
    if (!text) return [];
    const result = { kind: entry.kind, text };
    for (const key of ['value', 'reference']) {
      const value = clean(entry[key], key === 'value' ? 100 : 240);
      if (value) result[key] = value;
    }
    return [result];
  }));
}
const LIMIT = 40;
// Keep what explains a repair: the first observation, every measurement and every
// written idea. Routine steps and intermediate results are dropped first.
function trimEvidence(entries) {
  const kept = [...entries];
  while (kept.length > LIMIT) {
    const i = kept.findIndex((e, index) => index > 0 && !['measurement', 'prediction'].includes(e.kind));
    kept.splice(i > 0 ? i : 1, 1);
  }
  return kept;
}
const KNOB_MOVE = /^(.+): pasé de la posición (\d+) a la (\d+)\.$/;
export function getBenchEvidence(id, snapshot) {
  return snapshot?.id === id ? normalizeBenchEvidence(snapshot.evidence) : [];
}
export function appendBenchEvidence(snapshot, entry) {
  const normalized = normalizeBenchEvidence([entry])[0];
  if (!normalized) return;
  const entries = normalizeBenchEvidence(snapshot.evidence);
  // Turning one knob step by step is a single intervention: from where it started to where it stopped.
  const move = normalized.kind === 'intervention' && normalized.text.match(KNOB_MOVE);
  const previous = move && entries.at(-1)?.kind === 'result' && entries.at(-2)?.kind === 'intervention' && entries.at(-2).text.match(KNOB_MOVE);
  if (previous && previous[1] === move[1]) {
    entries.splice(-2, 2);
    normalized.text = previous[2] === move[3] ? `${move[1]}: probé otras posiciones y volví a la ${move[3]}.` : `${move[1]}: pasé de la posición ${previous[2]} a la ${move[3]}.`;
  }
  if (JSON.stringify(entries.at(-1)) !== JSON.stringify(normalized)) entries.push(normalized);
  snapshot.evidence = trimEvidence(entries);
}
