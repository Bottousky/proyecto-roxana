#!/usr/bin/env node
// Audita un control plane REAL de docs/agent-runs/ contra sus propias reglas.
//
//   node automation/scripts/audit-control-plane.mjs                       (hito por defecto)
//   node automation/scripts/audit-control-plane.mjs <hito> -v
//
// Este es el script que justifica toda la capa. OI-006 dice, textual, que las fichas de los dos
// paquetes de ARC1-007 «declararon DONE el 2026-08-02 con evidencia que no existía, y B no tenía
// una sola línea implementada», y que el control plane resistió pero «nada impidió que las fichas
// afirmaran lo contrario durante una sesión entera».
//
// Una ficha no puede ser su propia prueba. Esto compara lo declarado contra el disco.

import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, AUTO, read, json, checkEvidence, globOverlaps, localModelIds, Report, dim, bold } from './lib.mjs';

const RUN = process.argv.slice(2).find((a) => !a.startsWith('-')) ?? 'ohmdal-arc1-serial-v1';
const DIR = join(ROOT, 'docs/agent-runs', RUN);
const rel = (p) => `docs/agent-runs/${RUN}/${p}`;

if (!existsSync(DIR)) { console.error(`no existe ${rel('')}`); process.exit(2); }

const tasks = json(join(DIR, 'tasks.json'));
const own = json(join(DIR, 'ownership.json'));
const telemetry = json(join(DIR, 'telemetry.json')) ?? { records: [] };
const stateMd = read(join(DIR, 'STATE.md')) ?? '';
const rep = new Report(`audit — ${RUN}`);

// ---------- 1. Un solo estado, tres archivos ----------

const field = (label) => {
  const m = stateMd.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'));
  return m ? m[1].replace(/`/g, '').trim() : null;
};
const stateActive = field('Ticket activo')?.split(/\s*—\s*/)[0] ?? null;
const keys = { 'tasks.json': tasks?.activeIssueKey, 'ownership.json': own?.activeIssueKey, 'STATE.md': stateActive };
const distinct = [...new Set(Object.values(keys).filter(Boolean))];
if (distinct.length > 1) {
  rep.fail(`ticket activo distinto segun cada archivo: ${Object.entries(keys).map(([k, v]) => `${k}=${v}`).join(', ')}`);
} else if (distinct.length === 1) {
  rep.ok(`ticket activo coherente en los tres archivos: ${distinct[0]}`);
} else rep.fail('no se pudo leer el ticket activo en ningun archivo');
const ACTIVE = distinct[0];

// ---------- 2. WIP y precedencia ----------

const issues = tasks?.issues ?? [];
const idx = issues.findIndex((i) => i.key === ACTIVE);
if (idx < 0) rep.fail(`el ticket activo ${ACTIVE} no figura en tasks.json`);
else {
  const notDone = issues.slice(0, idx).filter((i) => i.status !== 'DONE');
  if (notDone.length) rep.fail(`WIP: hay predecesores sin DONE: ${notDone.map((i) => `${i.key}=${i.status}`).join(', ')}`);
  else rep.ok(`los ${idx} predecesores de ${ACTIVE} estan DONE`);

  const after = issues.slice(idx + 1).filter((i) => ['IN_PROGRESS', 'TECH_REVIEW', 'DONE'].includes(i.status));
  if (after.length) rep.fail(`WIP 1 roto: tickets posteriores ya avanzados: ${after.map((i) => i.key).join(', ')}`);
}

// ---------- 3. Todo DONE tiene evidencia en disco ----------

for (const i of issues.filter((x) => x.status === 'DONE')) {
  if (!i.evidence) { rep.warn(`${i.key} DONE sin campo evidence en tasks.json`); continue; }
  const d = join(DIR, i.evidence);
  if (!existsSync(d)) rep.fail(`${i.key} DONE y su carpeta de evidencia no existe: ${rel(i.evidence)}`);
  else if (readdirSync(d).length === 0) rep.fail(`${i.key} DONE con carpeta de evidencia VACIA: ${rel(i.evidence)}`);
  else rep.ok(`${i.key} evidencia presente (${readdirSync(d).length} archivos)`);
}

// ---------- 4. La regla de OI-006, sobre las fichas de paquete ----------

const packetsDir = join(DIR, 'packets');
const packetDirs = existsSync(packetsDir)
  ? readdirSync(packetsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : [];

const statusOf = (body) => body.match(/^\*\*Estado:\*\*\s*`([A-Z_]+)`/m)?.[1] ?? null;

/** Extrae las rutas del bloque ```text que sigue a `## Evidencia`. */
function declaredEvidence(body) {
  const sec = body.split(/^## Evidencia\s*$/m)[1];
  if (!sec) return [];
  const block = sec.match(/```text\n([\s\S]*?)```/);
  if (!block) return [];
  const out = [];
  let base = '';
  for (const line of block[1].split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const first = t.split(/\s{2,}|\s+#/)[0].trim();
    if (first.endsWith('/')) { base = first; continue; }
    if (/^[\w./-]+\.\w+$/.test(first)) out.push(base + first);
  }
  return out;
}

let packetCount = 0;
for (const key of packetDirs) {
  const files = readdirSync(join(packetsDir, key)).filter((f) => /^[A-Z0-9]+-\d+-[A-Z]\.md$/.test(f)).sort();
  const issue = issues.find((i) => i.key === key);
  if (!issue) rep.fail(`hay paquetes de ${key} pero el ticket no existe en tasks.json`);
  else if (issue.status !== 'DONE' && key !== ACTIVE) {
    rep.fail(`paquetes de ${key} presentes y el ticket no esta ni activo ni DONE (PACKETS.md: no se preparan paquetes de tickets futuros)`);
  }

  for (const f of files) {
    packetCount++;
    const body = read(join(packetsDir, key, f));
    const id = f.replace('.md', '');
    const st = statusOf(body);
    if (!st) { rep.fail(`${id}: no se pudo leer **Estado:**`); continue; }
    if (st !== 'DONE') { rep.ok(`${id} en ${st}`); continue; }

    const declared = declaredEvidence(body);
    if (!declared.length) { rep.warn(`${id} DONE y su seccion Evidencia no declara archivos parseables`); continue; }
    // Las fichas mezclan rutas relativas al hito (`evidence/ARC1-007/x.png`) con rutas de repo
    // (`docs/agent-runs/<hito>/SCENE_BUDGETS.md`). Se aceptan las dos.
    const ev = checkEvidence('.', declared.map((d) => (d.startsWith('docs/') ? d : `docs/agent-runs/${RUN}/${d}`)));
    for (const m of ev.missing) rep.fail(`${id} declara DONE y esta evidencia NO existe: ${m}`);
    for (const m of ev.empty) rep.fail(`${id} declara DONE y esta evidencia esta VACIA: ${m}`);
    if (!ev.missing.length && !ev.empty.length) rep.ok(`${id} DONE con ${ev.present.length}/${declared.length} evidencias verificadas`);

    // Un paquete cerrado sin telemetria no esta cerrado (EXECUTION_PROTOCOL.md §E).
    const recs = (telemetry.records ?? []).filter((r) => r.packet === id);
    if (!recs.length) rep.fail(`${id} DONE sin ningun record en telemetry.json`);
    else if (!recs.some((r) => r.phase === 'build')) rep.warn(`${id} DONE sin record de fase build`);
  }
}
rep.ok(`${packetCount} fichas de paquete revisadas`);

// ---------- 5. Telemetria honesta ----------

const inventory = localModelIds();
const seenPhases = new Map();
for (const r of telemetry.records ?? []) {
  const tag = `${r.packet ?? r.ticket}/${r.phase}`;
  if (r.modelId && Array.isArray(inventory) && inventory.length) {
    const known = inventory.includes(r.modelId) || /^claude-/.test(r.modelId) || /^gpt-/.test(r.modelId);
    if (!known) rep.fail(`telemetry: modelId "${r.modelId}" en ${tag} no existe en el inventario local`);
  }
  if (r.result === 'DONE' && r.ownershipRespected === false) rep.fail(`telemetry: ${tag} cerro DONE con ownershipRespected=false`);
  if ((r.round ?? 1) > (tasks?.budgets?.maxRoundsPerPacket ?? 2)) {
    rep.fail(`telemetry: ${tag} ronda ${r.round} supera maxRoundsPerPacket`);
  }
  seenPhases.set(tag, (seenPhases.get(tag) ?? 0) + 1);
}

// Frontera de sesion: mismo nombre de sesion para dos fases distintas = se continuo el contexto.
const bySession = new Map();
for (const r of telemetry.records ?? []) {
  if (!r.session) continue;
  const set = bySession.get(r.session) ?? new Set();
  set.add(r.phase);
  bySession.set(r.session, set);
}
for (const [s, phases] of bySession) {
  if (phases.size > 1) rep.fail(`sesion "${s}" registra ${phases.size} fases distintas: PACKETS.md exige una sesion nueva por fase`);
}

// Review independiente: build y review del mismo paquete con el mismo modelo.
const byPacket = new Map();
for (const r of telemetry.records ?? []) {
  const k = r.packet ?? r.ticket;
  const m = byPacket.get(k) ?? {};
  m[r.phase] = r.modelId;
  byPacket.set(k, m);
}
// Desviaciones ya declaradas por el Director: bajan a warn, nunca desaparecen.
const deviations = json(join(AUTO, 'known-deviations.json'))?.accepted ?? [];
const accepted = (check, packet) => deviations.find((d) => d.check === check && d.scope.includes(packet));
let applied = 0;

for (const [k, m] of byPacket) {
  if (m.build && m.review && m.build === m.review) {
    const dev = accepted('same-model-build-review', k);
    const msg = `${k}: build y review corrieron con el mismo modelo (${m.build}) — no es review independiente`;
    if (dev) { rep.warn(`${msg}  [${dev.id} aceptada, resuelta por ${dev.decision ?? '?'}]`); applied++; }
    else rep.fail(msg);
  }
  if (m.build && !m.review) {
    const dev = accepted('build-without-review', k);
    const msg = `${k}: hay build y no hay review registrado`;
    if (dev) { rep.warn(`${msg}  [${dev.id} aceptada, resuelta por ${dev.decision ?? '?'}]`); applied++; }
    else rep.warn(msg);
  }
}

// Una lista de excepciones que crece sin control deja de ser un registro y pasa a ser una alfombra.
const scoped = new Set(deviations.flatMap((d) => d.scope));
const stale = [...scoped].filter((p) => !byPacket.has(p));
if (stale.length) rep.warn(`known-deviations.json cubre paquetes que ya no existen: ${stale.join(', ')}`);
if (applied) rep.ok(`${applied} desviaciones declaradas aplicadas de ${deviations.length} entradas`);

// ---------- 6. Ownership ----------

if (own) {
  const doneKeys = issues.filter((i) => i.status === 'DONE').map((i) => i.key);
  const prot = own.protected ?? [];
  for (const k of doneKeys) {
    const artifacts = [`docs/agent-runs/${RUN}/tickets/${k}.md`, `docs/agent-runs/${RUN}/evidence/${k}/**`];
    for (const a of artifacts) {
      if (!existsSync(join(ROOT, a.replace('/**', '')))) continue;
      if (!prot.some((p) => globOverlaps(a, p))) rep.warn(`${k} esta DONE y ${a} no figura en protected (EXECUTION_PROTOCOL.md §E, paso 2)`);
    }
  }
  const writers = Object.values(own.owners ?? {}).flatMap((o) => o.write ?? []);
  const clash = writers.filter((w) => prot.some((p) => globOverlaps(w, p)));
  if (clash.length) rep.fail(`rutas simultaneamente escribibles y protegidas: ${[...new Set(clash)].join(', ')}`);
  else rep.ok('ningun owner escribe sobre una ruta protegida');
}

// ---------- salida ----------

rep.print({ verbose: process.argv.includes('-v') });
console.log(dim(`\n${bold('nota')}: este script comprueba lo declarado contra el disco. No juzga calidad:\nun paquete puede pasar todo esto y aun asi no servir. Para eso estan el reviewer y el gate humano.`));
process.exit(rep.exitCode);
