#!/usr/bin/env node
// Valida una Task Spec contra el schema, la taxonomia y el routing, y —lo importante—
// contra el disco.
//
//   node automation/scripts/validate-task.mjs automation/tasks/queue/TASK-001.json
//   node automation/scripts/validate-task.mjs automation/tasks          (recursivo)
//
// La regla que justifica el script esta en OI-006: dos fichas de ARC1-007 declararon DONE con
// evidencia que no existia, y ninguna capa del control plane lo impidio durante una sesion entera.
// Una ficha no puede ser su propia prueba. Aca DONE exige que los archivos de `evidence` existan
// y pesen algo.

import { readdirSync, statSync } from 'node:fs';
import { join, relative, extname, isAbsolute } from 'node:path';
import { ROOT, AUTO, json, taxonomy, routing, validateSchema, checkEvidence, globOverlaps, localModelIds, Report, dim } from './lib.mjs';

const schema = json(join(AUTO, 'schemas', 'task.schema.json'));
const tax = taxonomy();
const route = routing();
const inventory = localModelIds();

function collect(target) {
  const abs = isAbsolute(target) ? target : join(ROOT, target);
  const st = statSync(abs);
  if (st.isFile()) return [abs];
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (extname(e.name) === '.json' && !e.name.startsWith('_')) out.push(p);
    }
  };
  walk(abs);
  return out;
}

function validateOne(file) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const rep = new Report(rel);
  let task;
  try { task = json(file); } catch (e) { return rep.fail(`JSON invalido: ${e.message}`); }

  // 1. Forma.
  const errs = validateSchema(task, schema);
  if (errs.length) { errs.forEach((e) => rep.fail(e)); return rep; }
  rep.ok('schema');

  // 2. El kind existe y la tarea es coherente con el.
  const kind = tax.kinds[task.kind];
  if (!kind) {
    rep.fail(`kind "${task.kind}" no existe en taxonomy.json — no se inventa un kind, se agrega con decision CP`);
    return rep;
  }
  rep.ok(`kind ${task.kind} (${kind.family} · ${kind.pipeline})`);

  if (kind.reviewRequired && task.reviewRequired === false) {
    rep.fail(`${task.kind} exige review y la tarea lo desactiva`);
  }
  if (kind.humanGate === 'always' && task.humanGate === 'no') {
    rep.fail(`${task.kind} exige gate humano siempre y la tarea lo desactiva`);
  }
  if (kind.blockedByDefault && task.state !== 'BLOCKED' && task.state !== 'WAITING_PROVIDER') {
    rep.fail(`${task.kind} esta bloqueado por defecto: requiere ${(kind.unblockRequires ?? []).join(', ')}`);
  }
  for (const req of kind.requires ?? []) {
    if (!(task.dependsOn ?? []).length) rep.fail(`${task.kind} requiere una tarea previa de tipo ${req} y dependsOn esta vacio`);
  }

  // 3. Routing: el rol existe, sirve para el kind y el modelo es real.
  const roleName = task.route.role;
  const role = route.roles[roleName];
  if (!role) rep.fail(`rol "${roleName}" no existe en routing.json`);
  else {
    if (kind.role && kind.role !== roleName) {
      rep.warn(`taxonomy.json enruta ${task.kind} a "${kind.role}" y la tarea usa "${roleName}"`);
    }
    for (const cap of kind.requiredCapabilities ?? []) {
      const c = route.capabilities[cap];
      if (!c) rep.fail(`la capability "${cap}" que exige ${task.kind} no esta declarada en routing.json`);
      else if (c.verified === false && task.state !== 'WAITING_PROVIDER' && task.state !== 'QUEUE') {
        rep.fail(`"${cap}" no tiene smoke local: la tarea no puede estar en ${task.state}, corresponde WAITING_PROVIDER`);
      }
    }
    if (task.route.model && Array.isArray(inventory) && inventory.length) {
      if (task.route.surface === 'opencode' && !inventory.includes(task.route.model)) {
        rep.fail(`modelo "${task.route.model}" no aparece en el inventario local — correr providers.mjs`);
      } else rep.ok(`modelo ${task.route.model}`);
    } else if (task.route.model) {
      rep.warn('no hay provider-health.json: el modelo no se pudo contrastar contra el inventario');
    }
    const pools = route.pools;
    if (task.route.pool && !pools[task.route.pool]) rep.fail(`pool "${task.route.pool}" no existe`);
    if (task.route.surface === 'opencode' && task.route.model?.startsWith('openai/')) {
      rep.fail('enrutar openai/* desde OpenCode gasta el pool de ChatGPT: usar la superficie `codex` o un modelo gratuito');
    }
  }

  // 4. Limites: la tarea no puede darse mas presupuesto que el contrato.
  const lim = tax.limits;
  if (task.limits.maxAttempts > lim.maxAttempts) rep.fail(`maxAttempts ${task.limits.maxAttempts} > ${lim.maxAttempts}`);
  if (task.limits.maxSteps > lim.maxStepsPerPacket) rep.fail(`maxSteps ${task.limits.maxSteps} > ${lim.maxStepsPerPacket}`);
  if (task.limits.timeboxMinutes > lim.timeboxMinutes.max) rep.fail(`timebox ${task.limits.timeboxMinutes} min > ${lim.timeboxMinutes.max}`);
  if (task.limits.timeboxMinutes < lim.timeboxMinutes.min) rep.warn(`timebox ${task.limits.timeboxMinutes} min < ${lim.timeboxMinutes.min}: probablemente no es un paquete sino un paso`);

  // 5. Estados que exigen su propio informe.
  if ((task.state === 'BLOCKED' || task.state === 'FAILED') && !task.blockedReport) {
    rep.fail(`state=${task.state} sin blockedReport: un bloqueo sin informe no es un bloqueo, es un abandono`);
  }
  if (task.state === 'WAITING_PROVIDER' && !task.waitingFor) {
    rep.fail('state=WAITING_PROVIDER sin waitingFor: falta declarar capability, proveedor y condicion de reanudacion');
  }
  if (task.state === 'DONE' && !task.closure) {
    rep.fail('state=DONE sin closure: falta declarar quien la cerro, cuando y con que veredicto (CP-023)');
  }
  // El archivo vive en un directorio que ES una afirmacion de estado. Si no coinciden, una de las dos
  // miente: TASK-003 estuvo cerrada en queue/ una sesion entera y un `dispatch --queue --go` la habria
  // vuelto a correr, gastando la ventana de Go en repetir un smoke ya pagado.
  const DIR_STATE = { queue: 'QUEUE', 'in-progress': 'IN_PROGRESS', review: ['TECH_REVIEW', 'HUMAN_REVIEW'], blocked: ['BLOCKED', 'FAILED'], 'waiting-provider': 'WAITING_PROVIDER', done: 'DONE' };
  const dirName = file.replace(/\\/g, '/').split('/').at(-2);
  const expected = DIR_STATE[dirName];
  if (expected) {
    const ok = Array.isArray(expected) ? expected.includes(task.state) : expected === task.state;
    if (!ok) rep.fail(`state=${task.state} y el archivo esta en tasks/${dirName}/, que significa ${[expected].flat().join(' o ')}`);
    else rep.ok(`state=${task.state} coincide con tasks/${dirName}/`);
  }

  // 6. La regla de OI-006. Sin esto todo lo anterior es decoracion.
  const ev = checkEvidence(task.evidence.dir, task.evidence.files);
  if (task.state === 'DONE') {
    if (!task.evidence.files?.length) rep.fail('state=DONE sin archivos de evidencia declarados');
    for (const m of ev.missing) rep.fail(`evidencia declarada que NO existe: ${m}`);
    for (const m of ev.empty) rep.fail(`evidencia declarada que esta vacia: ${m}`);
    if (!ev.missing.length && !ev.empty.length && ev.present.length) {
      rep.ok(`${ev.present.length} archivos de evidencia verificados en disco`);
    }
  } else if (ev.missing.length) {
    rep.warn(`${ev.missing.length} de ${task.evidence.files.length} evidencias todavia no existen (esperable en ${task.state})`);
  }

  // 7. Ownership: allowedPaths no puede pisar lo que el hito declara protegido.
  if (task.run) {
    const own = json(join(ROOT, 'docs/agent-runs', task.run, 'ownership.json'));
    if (!own) rep.warn(`run "${task.run}" sin ownership.json legible: el alcance no se pudo contrastar`);
    else {
      const hits = (task.scope.allowedPaths ?? []).filter((p) => (own.protected ?? []).some((g) => globOverlaps(p, g)));
      if (hits.length) rep.fail(`allowedPaths pisa rutas protegidas de ${task.run}: ${hits.join(', ')} — se abre en la ficha del ticket, no en la tarea`);
      else rep.ok(`allowedPaths no colisiona con protected de ${task.run}`);
      if (own.activeIssueKey && task.id.startsWith('ARC1-') && !task.id.startsWith(own.activeIssueKey)) {
        rep.fail(`WIP 1: el ticket activo es ${own.activeIssueKey} y esta tarea es ${task.id}`);
      }
    }
  }

  // 8. Criterios verificables.
  const vague = /^(que quede|mejorar|pulir|optimizar|que se vea (bien|lindo)|quedar bien)/i;
  for (const c of task.acceptanceCriteria) {
    if (vague.test(c.trim())) rep.warn(`criterio no verificable: "${c}"`);
  }

  return rep;
}

const targets = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (!targets.length) {
  console.error('uso: node automation/scripts/validate-task.mjs <archivo.json | directorio>');
  process.exit(2);
}

const files = targets.flatMap(collect);
if (!files.length) { console.log(dim('no hay tareas para validar')); process.exit(0); }

let code = 0;
for (const f of files) {
  const rep = validateOne(f);
  rep.print({ verbose: process.argv.includes('-v') });
  console.log('');
  code = Math.max(code, rep.exitCode);
}
process.exit(code);
