#!/usr/bin/env node
// Tablero del Arco I. Superficie DERIVADA: no guarda estado propio, lo lee del control plane.
// Uso: node scripts/arc-board.mjs [--open]
//
// Salida: docs/agent-runs/ohmdal-arc1-serial-v1/board.html (ignorado por git) + resumen en stdout.
// Si un dato no se puede leer, se muestra como «sin dato». Nunca se estima ni se completa a mano.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RUN = join(ROOT, 'docs/agent-runs/ohmdal-arc1-serial-v1');
const OUT = join(RUN, 'board.html');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const json = (p) => { const t = read(p); return t ? JSON.parse(t) : null; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- lectura ----------

const tasks = json(join(RUN, 'tasks.json'));
if (!tasks) { console.error('No se encontró tasks.json en', RUN); process.exit(1); }
const telemetry = json(join(RUN, 'telemetry.json')) ?? { records: [] };
const stateMd = read(join(RUN, 'STATE.md')) ?? '';
const routingMd = read(join(RUN, 'MODEL_ROUTING.md')) ?? '';
const issuesMd = read(join(RUN, 'OPEN_ISSUES.md')) ?? '';

const field = (label) => {
  const m = stateMd.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'));
  return m ? m[1].replace(/`/g, '').trim() : null;
};

const activeKey = field('Ticket activo')?.split(/\s*—\s*/)[0] ?? tasks.activeIssueKey;
const activeIssue = tasks.issues.find((i) => i.key === activeKey) ?? null;

// Rutas de modelo: se leen de MODEL_ROUTING.md, no se hardcodean.
const routes = new Map();
for (const line of routingMd.split('\n')) {
  const m = line.match(/^\|\s*`?([a-z-]+)`?\s*\|\s*`([^`]+)`\s*\|/);
  if (m) routes.set(m[1], m[2]);
}

// Paquetes del ticket activo.
const packetDir = join(RUN, 'packets', activeKey ?? '');
let packets = [];
if (activeKey && existsSync(packetDir)) {
  packets = readdirSync(packetDir)
    .filter((f) => /^ARC1-\d+-[A-Z]\.md$/.test(f))
    .sort()
    .map((f) => {
      const body = read(join(packetDir, f)) ?? '';
      const get = (label) => {
        const m = body.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'));
        if (!m) return null;
        // Las plantillas listan opciones con `|`; una ficha real tiene un solo valor.
        const raw = m[1].replace(/`/g, '').trim();
        return raw.includes(' | ') ? null : raw;
      };
      const title = (body.match(/^#\s*`?[^`]*`?\s*—\s*(.+)$/m) ?? [])[1] ?? '';
      return { id: f.replace('.md', ''), title: title.trim(), estado: get('Estado'), ruta: get('Ruta de modelo'), gate: get('Gate humano'), est: get('Estimación') };
    });
}
const activePacket = packets.find((p) => p.estado && !['DONE', 'READY'].includes(p.estado)) ?? packets.find((p) => p.estado === 'READY') ?? null;

// Hallazgos abiertos: filas reales de la tabla de registro, sin el placeholder.
const openIssues = (issuesMd.match(/^\|\s*OI-\d+\s*\|.*$/gm) ?? []).map((row) => {
  const c = row.split('|').map((s) => s.trim().replace(/`/g, ''));
  return { id: c[1], fecha: c[2], donde: c[3], que: c[4], sev: c[5], bloquea: c[6], destino: c[7] };
});

// ---------- qué sigue ----------

const NEXT = {
  null: { fase: 'PLAN', rol: 'director-plan', nota: 'el ticket todavía no tiene paquetes' },
  READY: { fase: 'PLAN', rol: 'director-plan', nota: 'contrato escrito, falta plan de ejecución' },
  ACTIVE: { fase: 'BUILD', rol: 'builder', nota: 'implementación acotada al paquete' },
  TECH_REVIEW: { fase: 'REVIEW', rol: 'reviewer', nota: 'modelo distinto del builder, read-only' },
  HUMAN_REVIEW: { fase: 'GATE', rol: 'humano', nota: 'te toca a vos: aprobar o rechazar' },
  BLOCKED: { fase: '—', rol: 'humano', nota: 'bloqueado: decide el Director' },
  FAILED: { fase: '—', rol: 'humano', nota: 'falló: decide el Director' },
  DONE: { fase: '—', rol: 'humano', nota: 'paquete cerrado; sigue el próximo o el cierre del ticket' },
};
const next = NEXT[activePacket?.estado ?? 'null'] ?? NEXT.null;
const session = activePacket ? `${activePacket.id}-${next.fase}` : `${activeKey}-PLAN`;
const model = next.rol === 'humano' ? null : routes.get(next.rol) ?? null;

// Rondas ya consumidas, contadas contra telemetría real.
const rec = telemetry.records ?? [];
const roundsPacket = activePacket ? rec.filter((r) => r.packet === activePacket.id).length : 0;
const roundsIssue = rec.filter((r) => r.ticket === activeKey).length;

// ---------- render ----------

const mins = tasks.workflow?.internalTaskMinutes ?? { min: '?', max: '?' };
const STATUS_ORDER = ['DONE', 'READY', 'ACTIVE', 'TECH_REVIEW', 'HUMAN_REVIEW', 'BLOCKED', 'FAILED'];
const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, tasks.issues.filter((i) => i.status === s).length]));
const done = counts.DONE ?? 0;

const epics = [...new Set(tasks.issues.map((i) => i.epic))];
const chain = epics.map((e) => {
  const items = tasks.issues.filter((i) => i.epic === e);
  const cells = items.map((i) => {
    const cls = i.key === activeKey ? 'cell active' : `cell ${(i.status ?? 'BLOCKED').toLowerCase()}`;
    return `<span class="${cls}" title="${esc(i.key)} — ${esc(i.title)} [${esc(i.status)}]">${esc(i.key.replace('ARC1-', ''))}</span>`;
  }).join('');
  return `<div class="epic"><h4>${esc(e)} <em>${items.filter((i) => i.status === 'DONE').length}/${items.length}</em></h4><div class="cells">${cells}</div></div>`;
}).join('');

const kv = (k, v, mono = false) => `<div class="kv"><dt>${esc(k)}</dt><dd${mono ? ' class="mono"' : ''}>${v == null ? '<span class="none">sin dato</span>' : esc(v)}</dd></div>`;

const packetRows = packets.length
  ? packets.map((p) => `<tr class="${p.id === activePacket?.id ? 'is-active' : ''}"><td class="mono">${esc(p.id)}</td><td>${esc(p.title)}</td><td><span class="tag ${(p.estado ?? '').toLowerCase()}">${esc(p.estado ?? '—')}</span></td><td class="mono">${esc(p.ruta ?? '—')}</td><td>${esc(p.gate ?? '—')}</td><td>${esc(p.est ?? '—')}</td></tr>`).join('')
  : `<tr><td colspan="6" class="none">Sin paquetes. Los define <code>/arc-plan ${esc(activeKey)}</code> — no se preparan por adelantado (PACKETS.md).</td></tr>`;

const telemetryRows = rec.length
  ? rec.map((r) => `<tr><td class="mono">${esc(r.packet ?? r.ticket)}</td><td>${esc(r.phase)}</td><td class="mono">${esc(r.modelId ?? '—')}</td><td>${r.durationMin ?? '<span class="none">not-run</span>'}</td><td>${esc(r.round)}</td><td><span class="tag ${(r.result ?? '').toLowerCase()}">${esc(r.result)}</span></td></tr>`).join('')
  : `<tr><td colspan="6" class="none">Sin registros todavía. Cada fase de paquete emite el suyo al cerrarse; hasta entonces no hay base empírica para cambiar el routing (CP-007).</td></tr>`;

const oiRows = openIssues.length
  ? openIssues.map((o) => `<tr><td class="mono">${esc(o.id)}</td><td>${esc(o.que)}</td><td><span class="tag sev-${esc((o.sev ?? '').toLowerCase())}">${esc(o.sev)}</span></td><td>${esc(o.bloquea)}</td><td>${esc(o.destino)}</td></tr>`).join('')
  : `<tr><td colspan="5" class="none">Sin hallazgos registrados.</td></tr>`;

// tasks.json mezcla arrays (prohibited) y objetos con clave (notRun, openQuestions).
const flatten = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' ? x : Object.values(x).filter((s) => typeof s === 'string').join(' · ')));
  return Object.entries(v).map(([k, o]) => {
    if (typeof o === 'string') return `${k}: ${o}`;
    const parts = Object.entries(o).map(([kk, vv]) => `${kk}=${Array.isArray(vv) ? vv.join(', ') : vv}`);
    return `${k} — ${parts.join(' · ')}`;
  });
};
const list = (v) => flatten(v).map((x) => `<li>${esc(x)}</li>`).join('') || '<li class="none">sin entradas</li>';

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Arco I — ${esc(tasks.milestone)}</title>
<style>
:root{--bg:#f6f7f9;--fg:#16181d;--dim:#6b7280;--card:#fff;--line:#e3e6eb;--accent:#3b5bdb;
--done:#2f9e44;--ready:#3b5bdb;--blocked:#adb5bd;--warn:#e8590c;--danger:#c92a2a}
@media (prefers-color-scheme:dark){:root{--bg:#0e1013;--fg:#e6e8ec;--dim:#8b929d;--card:#171a1f;--line:#272b32;
--accent:#748ffc;--done:#51cf66;--ready:#748ffc;--blocked:#495057;--warn:#ff922b;--danger:#ff6b6b}}
:root[data-theme=dark]{--bg:#0e1013;--fg:#e6e8ec;--dim:#8b929d;--card:#171a1f;--line:#272b32;
--accent:#748ffc;--done:#51cf66;--ready:#748ffc;--blocked:#495057;--warn:#ff922b;--danger:#ff6b6b}
:root[data-theme=light]{--bg:#f6f7f9;--fg:#16181d;--dim:#6b7280;--card:#fff;--line:#e3e6eb;
--accent:#3b5bdb;--done:#2f9e44;--ready:#3b5bdb;--blocked:#adb5bd;--warn:#e8590c;--danger:#c92a2a}
*{box-sizing:border-box}body{margin:0;padding:24px 20px 64px;background:var(--bg);color:var(--fg);
font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1080px;margin:0 auto}
.mono{font-family:ui-monospace,SFMono-Regular,"Cascadia Code",Consolas,monospace;font-size:.92em}
header{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:baseline;margin-bottom:6px}
h1{font-size:1.35rem;margin:0;letter-spacing:-.01em}
.sub{color:var(--dim);font-size:.85rem}
.badge{padding:2px 9px;border-radius:999px;font-size:.72rem;font-weight:600;letter-spacing:.02em}
.badge.on{background:color-mix(in srgb,var(--done) 18%,transparent);color:var(--done)}
.badge.off{background:color-mix(in srgb,var(--danger) 18%,transparent);color:var(--danger)}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin-top:18px}
h2{font-size:.78rem;text-transform:uppercase;letter-spacing:.09em;color:var(--dim);margin:0 0 14px;font-weight:600}
h3{margin:0 0 4px;font-size:1.1rem}
.now{border-left:3px solid var(--accent)}
.now .headline{font-size:1.5rem;font-weight:650;letter-spacing:-.015em;margin:0 0 2px}
.now .cmd{display:inline-block;margin:14px 0 4px;padding:9px 14px;border-radius:8px;
background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent);font-weight:600;
font-family:ui-monospace,Consolas,monospace}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:12px 20px;margin:16px 0 0}
.kv dt{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-bottom:2px}
.kv dd{margin:0;font-weight:550}
.none{color:var(--dim);font-style:italic;font-weight:400}
.bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden;margin:2px 0 14px}
.bar i{display:block;height:100%;background:var(--done)}
.epic{margin-bottom:12px}
.epic h4{margin:0 0 5px;font-size:.8rem;font-weight:600}
.epic em{color:var(--dim);font-style:normal;font-weight:400}
.cells{display:flex;flex-wrap:wrap;gap:4px}
.cell{padding:2px 7px;border-radius:5px;font-size:.72rem;font-family:ui-monospace,Consolas,monospace;
background:var(--line);color:var(--dim);cursor:default}
.cell.done{background:color-mix(in srgb,var(--done) 20%,transparent);color:var(--done)}
.cell.ready{background:color-mix(in srgb,var(--ready) 20%,transparent);color:var(--ready)}
.cell.active{background:var(--accent);color:#fff;font-weight:700;box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 35%,transparent)}
.scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.88rem;min-width:520px}
th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);
padding:0 10px 7px 0;font-weight:600;white-space:nowrap}
td{padding:7px 10px 7px 0;border-top:1px solid var(--line);vertical-align:top}
tr.is-active td{background:color-mix(in srgb,var(--accent) 7%,transparent)}
.tag{padding:1px 7px;border-radius:5px;font-size:.72rem;font-weight:600;background:var(--line);color:var(--dim)}
.tag.done{background:color-mix(in srgb,var(--done) 20%,transparent);color:var(--done)}
.tag.active,.tag.ready{background:color-mix(in srgb,var(--ready) 20%,transparent);color:var(--ready)}
.tag.blocked,.tag.failed,.tag.sev-p0,.tag.sev-p1{background:color-mix(in srgb,var(--danger) 18%,transparent);color:var(--danger)}
.tag.human_review,.tag.tech_review,.tag.sev-p2{background:color-mix(in srgb,var(--warn) 18%,transparent);color:var(--warn)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
ul{margin:0;padding-left:18px;font-size:.87rem;color:var(--dim)}li{margin-bottom:3px}
footer{margin-top:22px;font-size:.76rem;color:var(--dim);text-align:center}
code{font-family:ui-monospace,Consolas,monospace;font-size:.9em}
</style></head><body><div class="wrap">

<header>
  <h1>Arco I de Ohmdal</h1>
  <span class="badge ${tasks.executionAuthorized ? 'on">ejecución autorizada' : 'off">ejecución no autorizada'}</span>
  <span class="sub mono">${esc(tasks.branch)} · ${esc(tasks.workflow?.mode ?? tasks.workflow)} · WIP ${tasks.workflow?.globalWipLimit ?? tasks.budgets?.maxConcurrentExecutors ?? '?'} · paquete ${esc(mins.min)}–${esc(mins.max)} min · base ${esc(tasks.baseCommit ?? '—')}</span>
</header>

<section class="now">
  <h2>Ahora</h2>
  <p class="headline">${esc(activeKey)} — ${esc(activeIssue?.title ?? 'sin ficha')}</p>
  <p class="sub">${activePacket ? `Paquete ${esc(activePacket.id)} · ${esc(activePacket.title)}` : 'Sin paquete activo'} — ${esc(next.nota)}</p>
  <div class="cmd">sesión nueva → ${esc(session)}</div>
  <dl>
    ${kv('Fase', next.fase)}
    ${kv('Ruta', next.rol)}
    ${kv('Modelo', model, true)}
    ${kv('Rondas paquete', `${roundsPacket} / ${tasks.budgets?.maxRoundsPerPacket ?? '?'}`)}
    ${kv('Rondas ticket', `${roundsIssue} / ${tasks.budgets?.maxRoundsPerIssue ?? '?'}`)}
    ${kv('Gate humano', activePacket?.gate)}
  </dl>
</section>

<section>
  <h2>Paquetes de ${esc(activeKey)}</h2>
  <div class="scroll"><table><thead><tr><th>Paquete</th><th>Título</th><th>Estado</th><th>Ruta</th><th>Gate</th><th>Est.</th></tr></thead>
  <tbody>${packetRows}</tbody></table></div>
</section>

<section>
  <h2>Cadena serial — ${done}/${tasks.issues.length} cerrados</h2>
  <div class="bar"><i style="width:${((done / tasks.issues.length) * 100).toFixed(1)}%"></i></div>
  ${chain}
</section>

<section>
  <h2>Hallazgos abiertos</h2>
  <div class="scroll"><table><thead><tr><th>ID</th><th>Hallazgo</th><th>Sev.</th><th>¿Bloquea?</th><th>Destino</th></tr></thead>
  <tbody>${oiRows}</tbody></table></div>
</section>

<section>
  <h2>Telemetría</h2>
  <div class="scroll"><table><thead><tr><th>Paquete</th><th>Fase</th><th>Modelo</th><th>Min</th><th>Ronda</th><th>Resultado</th></tr></thead>
  <tbody>${telemetryRows}</tbody></table></div>
</section>

<section>
  <h2>Referencia rápida</h2>
  <div class="cols">
    <div><h3 style="font-size:.85rem">Prohibido</h3><ul>${list(tasks.prohibited)}</ul></div>
    <div><h3 style="font-size:.85rem">not-run</h3><ul>${list(tasks.notRun)}</ul></div>
    <div><h3 style="font-size:.85rem">Preguntas abiertas</h3><ul>${list(tasks.openQuestions)}</ul></div>
  </div>
</section>

<footer>Generado desde el control plane el ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · <code>node scripts/arc-board.mjs</code><br>
Archivo derivado: no editar, no commitear. La verdad vive en <code>tasks.json</code>, <code>STATE.md</code> y <code>packets/</code>.</footer>
</div></body></html>`;

writeFileSync(OUT, html, 'utf8');

// ---------- resumen en terminal ----------

console.log(`\n  ${activeKey}  ${activeIssue?.title ?? ''}`);
console.log(`  Paquete   ${activePacket ? `${activePacket.id}  ${activePacket.estado}` : 'ninguno — ' + next.nota}`);
console.log(`  Rondas    ${roundsPacket}/${tasks.budgets?.maxRoundsPerPacket ?? '?'} paquete · ${roundsIssue}/${tasks.budgets?.maxRoundsPerIssue ?? '?'} ticket`);
console.log(`  Sesión    ${session}`);
console.log(`  Ruta      ${next.rol}${model ? ` → ${model}` : ''}`);
console.log(`  Abiertos  ${openIssues.length} hallazgo(s) · ${done}/${tasks.issues.length} tickets cerrados`);
console.log(`\n  → ${OUT}\n`);

if (process.argv.includes('--open')) {
  const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', OUT]] : process.platform === 'darwin' ? ['open', [OUT]] : ['xdg-open', [OUT]];
  spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref();
}
