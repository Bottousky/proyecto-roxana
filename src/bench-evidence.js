// Entries describe actions the player actually took. Unlocking a chapter or
// restoring a legacy save must not manufacture measurements or experiments.
const KINDS = new Set(['observation', 'measurement', 'intervention', 'prediction', 'result']);
const clean = (value, limit) => typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, limit) : '';
export function normalizeBenchEvidence(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.slice(-80).flatMap(entry => {
    if (!entry || !KINDS.has(entry.kind)) return [];
    const text = clean(entry.text, 280);
    if (!text) return [];
    const result = { kind: entry.kind, text };
    for (const key of ['value', 'reference']) {
      const value = clean(entry[key], key === 'value' ? 100 : 240);
      if (value) result[key] = value;
    }
    return [result];
  }).slice(-40);
}
export function getBenchEvidence(id, snapshot) {
  return snapshot?.id === id ? normalizeBenchEvidence(snapshot.evidence) : [];
}
export function appendBenchEvidence(snapshot, entry) {
  const normalized = normalizeBenchEvidence([entry])[0];
  if (!normalized) return;
  const entries = normalizeBenchEvidence(snapshot.evidence);
  if (JSON.stringify(entries.at(-1)) !== JSON.stringify(normalized)) entries.push(normalized);
  snapshot.evidence = entries.slice(-40);
}
