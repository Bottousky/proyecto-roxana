#!/usr/bin/env node
// Ejecuta las etapas de una tarea —o de una cola— una sesión por etapa, y para donde tiene que parar.
//
//   node automation/scripts/dispatch.mjs TASK-002              muestra el plan, NO ejecuta
//   node automation/scripts/dispatch.mjs TASK-002 --go         ejecuta
//   node automation/scripts/dispatch.mjs TASK-002 --go --from build
//   node automation/scripts/dispatch.mjs --queue               plan de toda la cola
//   node automation/scripts/dispatch.mjs --queue --go --max 3  corre hasta 3 tareas
//
// Sin `--go` no lanza un solo proceso.
//
// En modo cola: una tarea que topa con un gate humano se APARCA en review/ y la cola sigue con la
// siguiente. Así juntás varios gates y los mirás de una sentada, en vez de una interrupción por
// tarea. Una tarea que termina en BLOCKED o FAILED detiene la cola entera: si el setup está mal,
// seguir sólo multiplica el error.
//
// Lo que NO hace, y no es un pendiente:
//   - no cambia el estado de un ticket de docs/agent-runs/ ni commitea (CP-002);
//   - no mueve ninguna tarea a done/: DONE exige evidencia en disco y decisión tuya;
//   - no pasa --dangerously-skip-permissions salvo --unattended;
//   - no reintenta más allá del presupuesto de rondas de la tarea.

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, appendFileSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { join, isAbsolute, relative, extname, basename } from 'node:path';
import {
  ROOT, AUTO, json, taxonomy, routing, resolvePhase, phaseCommand,
  Report, bold, dim, green, yellow, red,
} from './lib.mjs';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const val = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };

const GO = flag('go');
const QUEUE = flag('queue');
const UNATTENDED = flag('unattended');
const FROM = val('from');
const ONLY = val('only');
const MAX = Number(val('max') ?? 0) || Infinity;

const FLAGS_WITH_VALUE = new Set(['from', 'only', 'max']);
const positional = argv.filter((a, i) => {
  if (a.startsWith('--')) return false;
  const prev = argv[i - 1];
  return !(prev?.startsWith('--') && FLAGS_WITH_VALUE.has(prev.slice(2)));
});

const tax = taxonomy();
const route = routing();
const TERMINAL = /\b(BLOCKED|FAILED|TECH_REVIEW|HUMAN_REVIEW|DONE)\b/g;
const STATE_DIRS = { QUEUE: 'queue', IN_PROGRESS: 'in-progress', TECH_REVIEW: 'review', HUMAN_REVIEW: 'review', BLOCKED: 'blocked', FAILED: 'blocked', WAITING_PROVIDER: 'waiting-provider' };

// ---------- localizar tareas ----------

function allTaskFiles(dir = join(AUTO, 'tasks')) {
  const out = [];
  (function walk(d) {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (extname(e.name) === '.json' && !e.name.startsWith('_')) out.push(p);
    }
  })(dir);
  return out;
}

function findTask(t) {
  if (t.endsWith('.json')) return isAbsolute(t) ? t : join(ROOT, t);
  const hits = allTaskFiles().filter((f) => basename(f).startsWith(t));
  if (!hits.length) { console.error(`no se encontró ninguna tarea que empiece con "${t}" en automation/tasks/`); process.exit(2); }
  if (hits.length > 1) { console.error(`"${t}" es ambiguo: ${hits.map((h) => relative(ROOT, h)).join(', ')}`); process.exit(2); }
  return hits[0];
}

// ---------- precondiciones ----------

function preflight(task, { quiet = false } = {}) {
  const rep = new Report(`dispatch — ${task.id}`);
  if (!['QUEUE', 'PLANNED', 'IN_PROGRESS', 'TECH_REVIEW'].includes(task.state)) {
    rep.fail(`state=${task.state}: sólo se despacha QUEUE, PLANNED, IN_PROGRESS o TECH_REVIEW`);
  }
  if (task.state === 'WAITING_PROVIDER') rep.fail(`espera ${task.waitingFor?.capability}: lo resuelve el Director`);
  if (task.run) rep.warn(`pertenece al hito "${task.run}": el despachador NO cambia su estado ni rota ownership`);
  if (UNATTENDED) rep.warn('--unattended: el builder auto-aprueba ediciones y comandos. Sin freno.');
  if (!quiet) rep.print();
  return rep.exitCode === 0;
}

/** Una tarea no arranca si alguna de sus dependencias no está DONE. */
function depsSatisfied(task, byId) {
  const pending = (task.dependsOn ?? []).filter((d) => (byId.get(d)?.state ?? 'DESCONOCIDA') !== 'DONE');
  return { ok: pending.length === 0, pending };
}

// ---------- plan ----------

function stagesOf(kind) {
  let s = kind.stages ?? ['build'];
  if (ONLY) return s.filter((x) => x === ONLY);
  if (FROM) { const i = s.indexOf(FROM); if (i >= 0) return s.slice(i); }
  return s;
}

function planOf(task) {
  const kind = tax.kinds[task.kind];
  if (!kind) return { error: `kind "${task.kind}" no existe en taxonomy.json` };
  return { kind, phases: stagesOf(kind).map((s) => resolvePhase(task, s, { tax, route })) };
}

function printPlan(task, file, { kind, phases }) {
  console.log(bold(`\nplan — ${task.id} · ${task.kind}`));
  console.log(dim(`contrato: ${file}   timebox: ${task.limits.timeboxMinutes} min/etapa   rondas: ${task.limits.maxRounds ?? kind.maxRounds ?? 2}\n`));
  for (const ph of phases) {
    if (!ph.exec) { console.log(`  ${yellow('■')} ${ph.stage.padEnd(15)} ${dim('PARA — ' + (ph.stop ?? ph.error))}`); continue; }
    if (ph.blockers?.length) { console.log(`  ${red('■')} ${ph.stage.padEnd(15)} ${red('bloqueada: ' + ph.blockers.join('; '))}`); continue; }
    console.log(`  ${green('▸')} ${ph.stage.padEnd(15)} ${ph.roleName} · ${ph.model} ${dim('· ' + ph.session)}`);
    // Silenciar un override declarado sería peor que ignorarlo: la tarea diría una cosa y correría otra.
    if (task.route?.role && task.route.role !== ph.roleName) {
      console.log(`    ${yellow(`la tarea declara route.role="${task.route.role}" y la etapa "${ph.stage}" usa "${ph.roleName}" — manda la etapa`)}`);
    }
    console.log(`    ${dim(phaseCommand(task, ph, file).line)}`);
  }
}

// ---------- ejecución ----------

function runPhase(task, ph, file, runDir) {
  const c = phaseCommand(task, ph, file);
  if (!c.bin) return Promise.resolve({ result: 'SKIPPED', durationMin: 0 });

  const args = [...c.args];
  if (UNATTENDED && ph.surface === 'opencode' && !ph.readOnly) args.push('--dangerously-skip-permissions');

  const logPath = join(runDir, `dispatch-${ph.stage}.log`);
  writeFileSync(logPath, `$ ${c.line}\n\n--- prompt ---\n${c.prompt}\n\n--- salida ---\n`, 'utf8');

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

    const timer = setTimeout(() => {
      appendFileSync(logPath, `\n\n[dispatch] timebox de ${task.limits.timeboxMinutes} min agotado — proceso terminado\n`, 'utf8');
      child.kill();
    }, (task.limits.timeboxMinutes ?? 60) * 60_000);

    child.on('close', (code) => {
      clearTimeout(timer);
      const found = [...tail.matchAll(TERMINAL)].map((m) => m[1]);
      resolve({
        result: code !== 0 ? 'FAILED' : (found.at(-1) ?? 'TECH_REVIEW'),
        code,
        durationMin: Math.round((Date.now() - t0) / 6000) / 10,
        log: relative(ROOT, logPath).replace(/\\/g, '/'),
      });
    });
  });
}

async function dispatchTask(file) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const task = json(file);
  const plan = planOf(task);
  if (plan.error) return { task, error: plan.error };

  printPlan(task, rel, plan);
  if (!GO) return { task, dryRun: true, plan };

  const runDir = join(ROOT, task.evidence?.dir ?? `automation/runs/${task.id}`);
  mkdirSync(runDir, { recursive: true });

  const records = [];
  let stopped = null;
  console.log(bold(`\n─── ejecutando ${task.id} ───\n`));

  for (const ph of plan.phases) {
    if (!ph.exec || ph.blockers?.length) { stopped = { stage: ph.stage, why: ph.stop ?? ph.error ?? ph.blockers.join('; '), kind: 'gate' }; break; }
    console.log(bold(`\n▸ ${ph.stage}  ${dim(`${ph.roleName} · ${ph.model} · ${ph.session}`)}\n`));
    const r = await runPhase(task, ph, rel, runDir);
    records.push({
      task: task.id, stage: ph.stage, session: ph.session, role: ph.roleName,
      surface: ph.surface, modelId: ph.model ?? null, pool: ph.pool ?? null,
      date: new Date().toISOString().slice(0, 10),
      durationMin: r.durationMin ?? null, exitCode: r.code ?? null, result: r.result, log: r.log ?? null,
    });
    const paint = r.result === 'DONE' ? green : ['BLOCKED', 'FAILED'].includes(r.result) ? red : yellow;
    console.log(`\n  ${paint(r.result)}  ${dim(`${r.durationMin} min · exit ${r.code} · ${r.log}`)}`);

    if (['BLOCKED', 'FAILED'].includes(r.result)) { stopped = { stage: ph.stage, why: `terminó en ${r.result}`, kind: 'fail' }; break; }
    if (r.result === 'HUMAN_REVIEW') { stopped = { stage: ph.stage, why: 'pide gate humano', kind: 'gate' }; break; }
  }

  const summary = { task: task.id, kind: task.kind, contract: rel, dispatchedOn: new Date().toISOString(), unattended: UNATTENDED, stoppedAt: stopped, records };
  writeFileSync(join(runDir, 'dispatch.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');
  return { task, file, records, stopped };
}

/** Mueve el archivo de tarea al directorio de su estado. Nunca a done/: eso lo decide el Director. */
function park(file, result) {
  const dir = STATE_DIRS[result];
  const tasksRoot = join(AUTO, 'tasks');
  if (!dir || !file.startsWith(tasksRoot)) return null; // sólo mueve tareas de automation/tasks/
  const dest = join(tasksRoot, dir, basename(file));
  if (dest === file) return null;
  mkdirSync(join(AUTO, 'tasks', dir), { recursive: true });
  renameSync(file, dest);
  return relative(ROOT, dest).replace(/\\/g, '/');
}

// ---------- main ----------

if (!QUEUE && !positional.length) {
  console.error('uso: dispatch.mjs <TASK-ID | ruta.json> [--go] | dispatch.mjs --queue [--go] [--max N]');
  process.exit(2);
}

if (!QUEUE) {
  const file = findTask(positional[0]);
  const task = json(file);
  if (!preflight(task)) process.exit(1);
  const out = await dispatchTask(file);
  if (out.error) { console.error(red(out.error)); process.exit(2); }
  if (out.dryRun) { console.log(dim(`\nnada se ejecutó. Agregá --go para correr.`)); process.exit(0); }
  console.log(bold('\n─── resumen ───'));
  for (const r of out.records) console.log(`  ${r.stage.padEnd(15)} ${String(r.durationMin).padStart(5)} min  ${r.result.padEnd(13)} ${dim(r.modelId ?? '')}`);
  if (out.stopped) console.log(`\n  ${yellow('detenido en')} ${bold(out.stopped.stage)} — ${out.stopped.why}`);
  console.log(dim('\n  Duraciones de reloj de pared, medidas. Copialas a telemetry.json.'));
  console.log(dim('  El estado del ticket y el commit siguen siendo tuyos (CP-002).'));
  process.exit(out.records.some((r) => ['BLOCKED', 'FAILED'].includes(r.result)) ? 1 : 0);
}

// --- modo cola ---

const files = allTaskFiles().filter((f) => /[\\/](queue|in-progress)[\\/]/.test(f)).sort();
const byId = new Map(allTaskFiles().map((f) => { const t = json(f); return [t.id, t]; }));

console.log(bold(`cola — ${files.length} tarea(s) en queue/ e in-progress/`));
if (!GO) console.log(dim('modo plan: no se ejecuta nada.\n'));

const results = [];
let ran = 0;

for (const file of files) {
  const task = json(file);
  const dep = depsSatisfied(task, byId);
  if (!dep.ok) { console.log(`\n${yellow('○')} ${task.id} ${dim('— espera a ' + dep.pending.join(', '))}`); results.push({ id: task.id, outcome: 'ESPERA' }); continue; }
  if (!preflight(task, { quiet: true })) { console.log(`\n${yellow('○')} ${task.id} ${dim('— no despachable en state=' + task.state)}`); results.push({ id: task.id, outcome: 'NO-DESPACHABLE' }); continue; }
  if (ran >= MAX) { console.log(`\n${dim('○ ' + task.id + ' — --max ' + MAX + ' alcanzado')}`); results.push({ id: task.id, outcome: 'SIN-CORRER' }); continue; }

  const out = await dispatchTask(file);
  if (out.error) { console.log(red(`  ${out.error}`)); results.push({ id: task.id, outcome: 'ERROR' }); continue; }
  if (out.dryRun) { results.push({ id: task.id, outcome: 'PLAN' }); continue; }

  ran++;
  const last = out.records.at(-1)?.result ?? 'SIN-ETAPAS';
  const moved = park(file, last);
  results.push({ id: task.id, outcome: last, stopped: out.stopped?.why, moved, min: out.records.reduce((a, r) => a + (r.durationMin ?? 0), 0) });

  // Un gate humano aparca la tarea y la cola sigue. Un fallo la detiene entera.
  if (out.stopped?.kind === 'fail') { console.log(`\n${red('cola detenida')}: ${task.id} terminó en fallo. Si el setup está mal, seguir multiplica el error.`); break; }
}

console.log(bold('\n═══ resumen de cola ═══'));
for (const r of results) {
  const paint = r.outcome === 'DONE' ? green : ['BLOCKED', 'FAILED', 'ERROR'].includes(r.outcome) ? red : yellow;
  console.log(`  ${r.id.padEnd(12)} ${paint(String(r.outcome).padEnd(15))} ${r.min ? String(r.min).padStart(5) + ' min ' : '          '} ${dim(r.moved ? '→ ' + r.moved : (r.stopped ?? ''))}`);
}
const total = results.reduce((a, r) => a + (r.min ?? 0), 0);
if (total) console.log(dim(`\n  ${Math.round(total * 10) / 10} min de reloj en total, medidos.`));
const gates = results.filter((r) => r.outcome === 'HUMAN_REVIEW' || r.outcome === 'TECH_REVIEW');
if (gates.length) console.log(`\n  ${yellow(`${gates.length} tarea(s) esperando tu revisión en automation/tasks/review/`)}`);
process.exit(results.some((r) => ['BLOCKED', 'FAILED', 'ERROR'].includes(r.outcome)) ? 1 : 0);
