#!/usr/bin/env node
// El router. Dada una Task Spec, imprime a que rol va, con que modelo, en que sesion y —lo que
// realmente importa— el COMANDO EXACTO a ejecutar.
//
//   node automation/scripts/route.mjs automation/tasks/queue/TASK-002.json
//   node automation/scripts/route.mjs automation/tasks --queue     tablero de la cola
//
// Deliberadamente NO ejecuta nada. Un router que dispara workers solo es util cuando las rutas
// ya estan medidas; hoy `imagegen` y `vision` no tienen smoke y tres modelos gratuitos son
// desconocidos. Disparar a ciegas es como se pierden cuatro horas. Este script imprime, el
// humano pega. Cuando telemetry.json tenga datos suficientes, agregar --exec es un cambio chico.

import { readdirSync, statSync } from 'node:fs';
import { join, relative, extname, isAbsolute } from 'node:path';
import { ROOT, json, taxonomy, routing, bold, dim, green, yellow, red } from './lib.mjs';

const tax = taxonomy();
const route = routing();

function collect(target) {
  const abs = isAbsolute(target) ? target : join(ROOT, target);
  if (statSync(abs).isFile()) return [abs];
  const out = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (extname(e.name) === '.json' && !e.name.startsWith('_')) out.push(p);
    }
  })(abs);
  return out;
}

/** Resuelve la ruta efectiva: lo que dice la tarea, y si no, lo que deriva de kind + routing. */
function resolve(task) {
  const kind = tax.kinds[task.kind];
  if (!kind) return { error: `kind desconocido: ${task.kind}` };
  const roleName = task.route?.role ?? kind.role;
  const role = route.roles[roleName];
  if (!role) return { error: `rol desconocido: ${roleName}` };

  const blockers = [];
  for (const cap of kind.requiredCapabilities ?? []) {
    const c = route.capabilities[cap];
    if (!c) blockers.push(`capability "${cap}" no declarada`);
    else if (c.verified === false) blockers.push(`capability "${cap}" sin smoke local`);
  }
  if (kind.blockedByDefault) blockers.push(`${task.kind} bloqueado por defecto: ${(kind.unblockRequires ?? []).join(', ')}`);

  const surface = task.route?.surface ?? role.primary.surface;
  const model = task.route?.model ?? role.primary.model;
  const pool = task.route?.pool ?? role.primary.pool;
  return { kind, roleName, role, surface, model, pool, blockers };
}

/** El comando literal. Es todo el valor del script: elimina el 'con que modelo era esto'. */
function command(task, r) {
  const stage = task.state === 'QUEUE' ? 'plan' : task.state === 'PLANNED' ? 'build' : task.state === 'TECH_REVIEW' ? 'review' : 'build';
  const session = task.route?.session ?? `${task.id}-${stage.toUpperCase()}`;
  const prompt = `Ejecuta ${task.id}. Contrato: ${relative(ROOT, task.__file).replace(/\\/g, '/')}. ` +
    `Respeta scope.allowedPaths, limits y acceptanceCriteria. Al terminar, emiti el reporte de ` +
    `EXECUTION_PROTOCOL.md y detenete en TECH_REVIEW, HUMAN_REVIEW o BLOCKED.`;

  if (r.surface === 'opencode') {
    const agent = r.role.opencodeAgent ? ` --agent ${r.role.opencodeAgent}` : '';
    return { session, cmd: `opencode run${agent} --model ${r.model} --title ${session} "${prompt}"` };
  }
  if (r.surface === 'codex') return { session, cmd: `codex exec "${prompt}"` };
  if (r.surface === 'claude') return { session, cmd: `claude -p "${prompt}"` };
  return { session, cmd: `(rol humano — no hay comando)` };
}

const args = process.argv.slice(2);
const targets = args.filter((a) => !a.startsWith('-'));
const QUEUE = args.includes('--queue');

if (!targets.length) {
  console.error('uso: node automation/scripts/route.mjs <archivo.json | directorio> [--queue]');
  process.exit(2);
}

const tasks = targets.flatMap(collect).map((f) => { const t = json(f); t.__file = f; return t; });

// Se dice en pantalla y no solo en el README: el nombre «route» sugiere que despacha, y no despacha.
console.log(dim('route.mjs sólo IMPRIME. No ejecuta nada, no abre sesiones, no llama a ningún modelo\ny no gasta cuota. Los comandos que muestra los corrés vos.\n'));

if (QUEUE) {
  const order = tax.states;
  const byState = new Map(order.map((s) => [s, []]));
  for (const t of tasks) (byState.get(t.state) ?? byState.set(t.state, []).get(t.state)).push(t);
  console.log(bold('cola de tareas\n'));
  for (const s of order) {
    const list = byState.get(s) ?? [];
    if (!list.length) continue;
    const paint = s === 'DONE' ? green : s === 'BLOCKED' || s === 'FAILED' ? red : s === 'WAITING_PROVIDER' ? yellow : (x) => x;
    console.log(paint(`  ${s}`));
    for (const t of list) {
      const r = resolve(t);
      const where = r.error ? red(r.error) : dim(`${r.roleName} · ${r.surface}${r.model ? ' · ' + r.model : ''}`);
      console.log(`    ${t.id}  ${t.title}`);
      console.log(`             ${where}`);
      if (t.waitingFor) console.log(`             ${yellow('espera:')} ${t.waitingFor.capability} — ${t.waitingFor.resumeWhen}`);
    }
    console.log('');
  }
  process.exit(0);
}

for (const task of tasks) {
  const r = resolve(task);
  console.log(bold(`${task.id} — ${task.title}`));
  if (r.error) { console.log(`  ${red(r.error)}\n`); continue; }

  console.log(`  kind        ${task.kind}  ${dim(`(${r.kind.family} · pipeline ${r.kind.pipeline})`)}`);
  console.log(`  etapas      ${r.kind.stages.join(' → ')}`);
  console.log(`  estado      ${task.state}`);
  console.log(`  rol         ${r.roleName}`);
  console.log(`  superficie  ${r.surface}${r.model ? `  ${dim(r.model)}` : ''}`);
  console.log(`  pool        ${r.pool}  ${dim(route.pools[r.pool]?.exhaustionPolicy ? `politica al agotarse: ${route.pools[r.pool].exhaustionPolicy}` : '')}`);
  console.log(`  review      ${r.kind.reviewRequired ? 'obligatorio' : 'no'}  ·  gate humano: ${r.kind.humanGate}`);
  console.log(`  limites     ${task.limits.maxAttempts} intentos · ${task.limits.maxSteps} pasos · ${task.limits.timeboxMinutes} min`);

  if (r.pool === 'chatgpt-plan') {
    console.log(`  ${yellow('cuidado')}     ${route.pools['chatgpt-plan'].warning}`);
  }
  if (r.blockers.length) {
    console.log(`  ${yellow('no despachable')}`);
    for (const b of r.blockers) console.log(`              · ${b}`);
    console.log(`  ${dim('estado correcto: WAITING_PROVIDER hasta resolverlo')}`);
  } else {
    const { session, cmd } = command(task, r);
    console.log(`  sesion      ${session}  ${dim('(sesion NUEVA — PACKETS.md, frontera de sesion)')}`);
    console.log(`\n  ${green('ejecutar:')}\n  ${cmd}`);
  }
  console.log('');
}
