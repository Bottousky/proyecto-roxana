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
import { ROOT, json, taxonomy, routing, resolveRoute, resolvePhase, phaseCommand, bold, dim, green, yellow, red } from './lib.mjs';

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

// La resolución vive en lib.mjs, compartida con dispatch.mjs: si el que imprime el comando y el
// que lo ejecuta calcularan la ruta distinto, lo que leés no sería lo que corre.
const resolve = (task) => resolveRoute(task, { tax, route });

/** Primera etapa ejecutable del kind: la que arranca el ciclo. */
function firstStage(task, r) {
  for (const s of r.kind.stages ?? ['build']) {
    const ph = resolvePhase(task, s, { tax, route });
    if (ph.exec && !ph.error) return ph;
  }
  return null;
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
    const ph = firstStage(task, r);
    if (!ph) console.log(`  ${yellow('sin etapa ejecutable')}`);
    else {
      const c = phaseCommand(task, ph, relative(ROOT, task.__file).replace(/\\/g, '/'));
      console.log(`  sesion      ${ph.session}  ${dim('(sesion NUEVA — PACKETS.md, frontera de sesion)')}`);
      console.log(`\n  ${green(`ejecutar la etapa «${ph.stage}»:`)}\n  ${c.line}`);
      console.log(`\n  ${dim('o el ciclo entero:')}\n  node automation/scripts/dispatch.mjs ${task.id}        ${dim('(muestra el plan)')}`);
      console.log(`  node automation/scripts/dispatch.mjs ${task.id} --go   ${dim('(lo ejecuta)')}`);
    }
  }
  console.log('');
}
