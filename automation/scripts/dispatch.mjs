#!/usr/bin/env node
// Ejecuta las etapas de UNA tarea, una sesión por etapa, y para donde tiene que parar.
//
//   node automation/scripts/dispatch.mjs TASK-002              muestra el plan, NO ejecuta
//   node automation/scripts/dispatch.mjs TASK-002 --go         ejecuta
//   node automation/scripts/dispatch.mjs TASK-002 --go --from build
//   node automation/scripts/dispatch.mjs TASK-002 --go --only plan
//
// Sin `--go` no lanza un solo proceso. Es el freno: podés ver exactamente qué se va a correr
// antes de que corra.
//
// Lo que NO hace, y no es un pendiente:
//   - no toma la cola entera: una tarea por invocación;
//   - no cambia el estado de un ticket ni commitea (CP-002: eso es del Director);
//   - no pasa --dangerously-skip-permissions salvo que se lo pidas con --unattended;
//   - no reintenta por su cuenta más allá del presupuesto de rondas de la tarea.
//
// Efecto lateral que sí importa: mide la duración real de cada etapa. Los ocho records de
// telemetry.json tienen `durationMin: null` porque nadie cronometró. Esto cronometra gratis.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, appendFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, isAbsolute, relative, extname } from 'node:path';
import {
  ROOT, AUTO, json, taxonomy, routing, resolvePhase, phaseCommand,
  Report, bold, dim, green, yellow, red,
} from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const val = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
const target = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1]?.startsWith('--') !== true);

const GO = flag('go');
const UNATTENDED = flag('unattended');
const FROM = val('from');
const ONLY = val('only');

if (!target) {
  console.error('uso: node automation/scripts/dispatch.mjs <TASK-ID | ruta.json> [--go] [--from <etapa>] [--only <etapa>] [--unattended]');
  process.exit(2);
}

// ---------- localizar la tarea ----------

function findTask(t) {
  if (t.endsWith('.json')) return isAbsolute(t) ? t : join(ROOT, t);
  const base = join(AUTO, 'tasks');
  const hits = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (extname(e.name) === '.json' && e.name.startsWith(t)) hits.push(p);
    }
  })(base);
  if (!hits.length) { console.error(`no se encontró ninguna tarea que empiece con "${t}" en automation/tasks/`); process.exit(2); }
  if (hits.length > 1) { console.error(`"${t}" es ambiguo: ${hits.map((h) => relative(ROOT, h)).join(', ')}`); process.exit(2); }
  return hits[0];
}

const file = findTask(target);
const relFile = relative(ROOT, file).replace(/\\/g, '/');
const task = json(file);
const tax = taxonomy();
const route = routing();
const kind = tax.kinds[task.kind];

if (!kind) { console.error(`kind "${task.kind}" no existe en taxonomy.json`); process.exit(2); }

// ---------- precondiciones ----------

const pre = new Report(`dispatch — ${task.id}`);

if (!['QUEUE', 'PLANNED', 'IN_PROGRESS', 'TECH_REVIEW'].includes(task.state)) {
  pre.fail(`state=${task.state}: sólo se despacha QUEUE, PLANNED, IN_PROGRESS o TECH_REVIEW`);
}
if (task.state === 'WAITING_PROVIDER') pre.fail(`espera ${task.waitingFor?.capability}: no se despacha hasta que el Director lo resuelva`);
if (task.run) pre.warn(`la tarea pertenece al hito "${task.run}": el despachador NO cambia su estado ni rota ownership`);
if (UNATTENDED) pre.warn('--unattended: el builder va a auto-aprobar ediciones y comandos. Sin freno.');

pre.print();
if (pre.exitCode) process.exit(1);

// ---------- plan de etapas ----------

let stages = kind.stages ?? ['build'];
if (ONLY) stages = stages.filter((s) => s === ONLY);
else if (FROM) { const i = stages.indexOf(FROM); if (i >= 0) stages = stages.slice(i); }
if (!stages.length) { console.error(`ninguna etapa coincide (kind ${task.kind}: ${(kind.stages ?? []).join(', ')})`); process.exit(2); }

const plan = stages.map((s) => resolvePhase(task, s, { tax, route }));

console.log(bold(`\nplan de ejecución — ${task.id} · ${task.kind}`));
console.log(dim(`contrato: ${relFile}   timebox: ${task.limits.timeboxMinutes} min por etapa   rondas: ${task.limits.maxRounds ?? kind.maxRounds ?? 2}\n`));

for (const ph of plan) {
  if (!ph.exec) { console.log(`  ${yellow('■')} ${ph.stage.padEnd(15)} ${dim('PARA — ' + (ph.stop ?? ph.error))}`); continue; }
  if (ph.blockers?.length) { console.log(`  ${red('■')} ${ph.stage.padEnd(15)} ${red('bloqueada: ' + ph.blockers.join('; '))}`); continue; }
  const c = phaseCommand(task, ph, relFile);
  console.log(`  ${green('▸')} ${ph.stage.padEnd(15)} ${ph.roleName} · ${ph.model} ${dim('· sesión ' + ph.session)}`);
  console.log(`    ${dim(c.line)}`);
}

const runnable = plan.filter((p) => p.exec && !p.blockers?.length);
const firstStop = plan.find((p) => !p.exec || p.blockers?.length);
if (firstStop) console.log(`\n  ${yellow('el ciclo se detiene en')} ${bold(firstStop.stage)} ${dim('— ' + (firstStop.stop ?? firstStop.error ?? firstStop.blockers?.join('; ')))}`);

if (!GO) {
  console.log(dim(`\nnada se ejecutó. Agregá --go para correr las ${runnable.length} etapas ejecutables.`));
  process.exit(0);
}
if (!runnable.length) { console.log(dim('\nno hay etapas ejecutables.')); process.exit(0); }

// ---------- ejecución ----------

const runDir = join(ROOT, task.evidence?.dir ?? `automation/runs/${task.id}`);
mkdirSync(runDir, { recursive: true });

const records = [];
const TERMINAL = /\b(BLOCKED|FAILED|TECH_REVIEW|HUMAN_REVIEW|DONE)\b/g;

function runPhase(ph) {
  const c = phaseCommand(task, ph, relFile);
  if (!c.bin) return { result: 'SKIPPED', note: 'sin comando' };

  const args = [...c.args];
  if (UNATTENDED && ph.surface === 'opencode' && !ph.readOnly) args.push('--dangerously-skip-permissions');

  const logPath = join(runDir, `dispatch-${ph.stage}.log`);
  writeFileSync(logPath, `$ ${c.bin} ${c.line}\n\n--- prompt ---\n${c.prompt}\n\n--- salida ---\n`, 'utf8');

  const t0 = Date.now();
  return new Promise((resolve) => {
    const child = spawn(c.bin, args, { cwd: ROOT, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = '';
    const onData = (buf) => {
      const s = buf.toString();
      process.stdout.write(s);
      appendFileSync(logPath, s, 'utf8');
      tail = (tail + s).slice(-4000);
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    const ms = (task.limits.timeboxMinutes ?? 60) * 60_000;
    const timer = setTimeout(() => {
      appendFileSync(logPath, `\n\n[dispatch] timebox de ${task.limits.timeboxMinutes} min agotado — proceso terminado\n`, 'utf8');
      child.kill();
    }, ms);

    child.on('close', (code) => {
      clearTimeout(timer);
      const durationMin = Math.round((Date.now() - t0) / 60_000 * 10) / 10;
      const found = [...tail.matchAll(TERMINAL)].map((m) => m[1]);
      const result = code !== 0 ? 'FAILED' : (found.at(-1) ?? 'TECH_REVIEW');
      resolve({ result, code, durationMin, log: relative(ROOT, logPath).replace(/\\/g, '/') });
    });
  });
}

console.log(bold(`\n─── ejecutando ${runnable.length} etapa(s) ───\n`));

let stopped = null;
for (const ph of plan) {
  if (!ph.exec || ph.blockers?.length) {
    stopped = { stage: ph.stage, why: ph.stop ?? ph.error ?? ph.blockers?.join('; ') };
    break;
  }
  console.log(bold(`\n▸ ${ph.stage}  ${dim(`${ph.roleName} · ${ph.model} · ${ph.session}`)}\n`));
  const r = await runPhase(ph);
  records.push({
    task: task.id, stage: ph.stage, session: ph.session, role: ph.roleName,
    surface: ph.surface, modelId: ph.model ?? null, pool: ph.pool ?? null,
    date: new Date().toISOString().slice(0, 10),
    durationMin: r.durationMin ?? null, exitCode: r.code ?? null,
    result: r.result, log: r.log ?? null,
  });

  const paint = r.result === 'DONE' ? green : ['BLOCKED', 'FAILED'].includes(r.result) ? red : yellow;
  console.log(`\n  ${paint(r.result)}  ${dim(`${r.durationMin} min · exit ${r.code} · ${r.log}`)}`);

  if (['BLOCKED', 'FAILED'].includes(r.result)) { stopped = { stage: ph.stage, why: `la etapa terminó en ${r.result}` }; break; }
  if (r.result === 'HUMAN_REVIEW') { stopped = { stage: ph.stage, why: 'la etapa pide gate humano' }; break; }
}

// ---------- cierre ----------

const summary = {
  task: task.id, kind: task.kind, contract: relFile,
  dispatchedOn: new Date().toISOString(),
  unattended: UNATTENDED,
  stoppedAt: stopped ?? null,
  records,
};
const outPath = join(runDir, 'dispatch.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');

console.log(bold('\n─── resumen ───'));
for (const r of records) console.log(`  ${r.stage.padEnd(15)} ${String(r.durationMin).padStart(5)} min  ${r.result.padEnd(13)} ${dim(r.modelId ?? '')}`);
if (stopped) console.log(`\n  ${yellow('detenido en')} ${bold(stopped.stage)} — ${stopped.why}`);
console.log(dim(`\n  ${relative(ROOT, outPath).replace(/\\/g, '/')}`));
console.log(dim('  Las duraciones son de reloj de pared, medidas, no estimadas. Copialas a telemetry.json.'));
console.log(dim('  El estado del ticket y el commit siguen siendo tuyos (CP-002).'));

process.exit(records.some((r) => ['BLOCKED', 'FAILED'].includes(r.result)) ? 1 : 0);
