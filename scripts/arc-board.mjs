#!/usr/bin/env node
// Consola de ejecución del Arco I. Superficie DERIVADA: no guarda estado propio, lo lee del
// control plane. Lo único que escribe son dos cosas que YA son verdad del control plane:
// el `Estado:` de la ficha del paquete y un record de telemetry.json. Nada más.
//
//   node scripts/arc-board.mjs              genera board.html y un resumen en stdout
//   node scripts/arc-board.mjs --open       lo mismo, y abre el archivo
//   node scripts/arc-board.mjs --serve      levanta la consola en http://127.0.0.1:7311
//   node scripts/arc-board.mjs --serve --open   la levanta y abre el navegador
//
// El modo --serve es el que usa el acceso directo del escritorio: sin servidor, los botones
// que escriben no pueden funcionar (un file:// no toca el disco).
//
// Lo que NO hace, y no es un pendiente:
//   - no lanza agentes ni encadena fases: vos abrís la sesión y pegás el prompt (fusible);
//   - no decide si un paquete cumple: te obliga a tildar la checklist antes de habilitar DONE;
//   - no estima duraciones ni completa datos: lo no medido se guarda como null («not-run»);
//   - no commitea, no toca git, no mueve tickets a DONE (eso es /arc-close).
//
// Si un dato no se puede leer, se muestra como «sin dato». Nunca se estima ni se completa a mano.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RUN = join(ROOT, 'docs/agent-runs/ohmdal-arc1-serial-v1');
const OUT = join(RUN, 'board.html');
const PORT = Number(process.env.ARC_BOARD_PORT ?? 7311);

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const json = (p) => { const t = read(p); return t ? JSON.parse(t) : null; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Fecha y hora LOCALES. Con `toISOString()` una sesión cerrada a las 22:00 en Buenos Aires
// (UTC-3) se registraría con la fecha del día siguiente, y la telemetría es un diario de trabajo:
// tiene que decir el día en que trabajaste.
const local = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return { fecha: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, hora: `${p(d.getHours())}:${p(d.getMinutes())}` };
};

const PACKET_RE = /^ARC1-\d{3}-[A-Z]$/;
const ESTADOS = ['READY', 'ACTIVE', 'TECH_REVIEW', 'HUMAN_REVIEW', 'BLOCKED', 'FAILED', 'DONE'];
const FASES = ['plan', 'build', 'review', 'fix'];

// Etiqueta corta de cada pool de `automation/routing.json`. Es formato, no dato: si aparece un
// pool nuevo se muestra su id crudo en vez de inventarle un nombre.
const POOL_LABEL = {
  'opencode-go': 'OpenCode Go',
  'opencode-free': 'OpenCode (gratis)',
  'chatgpt-plan': 'ChatGPT · Codex',
  'anthropic-claude': 'Claude Code',
};

// ---------- lectura ----------

function load() {
  const tasks = json(join(RUN, 'tasks.json'));
  if (!tasks) throw new Error(`No se encontró tasks.json en ${RUN}`);
  const telemetry = json(join(RUN, 'telemetry.json')) ?? { records: [] };
  const routing = json(join(ROOT, 'automation/routing.json')) ?? { roles: {}, pools: {} };
  const stateMd = read(join(RUN, 'STATE.md')) ?? '';
  const routingMd = read(join(RUN, 'MODEL_ROUTING.md')) ?? '';
  const issuesMd = read(join(RUN, 'OPEN_ISSUES.md')) ?? '';

  const field = (label) => {
    const m = stateMd.match(new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'));
    return m ? m[1].replace(/`/g, '').trim() : null;
  };

  const activeKey = field('Ticket activo')?.split(/\s*—\s*/)[0] ?? tasks.activeIssueKey;
  const activeIssue = tasks.issues.find((i) => i.key === activeKey) ?? null;

  // Rutas de modelo por rol: se leen de MODEL_ROUTING.md, no se hardcodean.
  const routes = new Map();
  for (const line of routingMd.split('\n')) {
    const m = line.match(/^\|\s*`?([a-z0-9-]+)`?\s*\|\s*`([^`]+)`\s*\|/);
    if (m) routes.set(m[1], m[2]);
  }

  // Pool (= proveedor y cuota que se quema) de cada rol, desde routing.json.
  // Los dos archivos nombran los roles distinto: routing.json expone `opencodeAgent`, que es
  // el nombre que usa MODEL_ROUTING.md. Se cruza por ahí antes de caer a la clave.
  const poolByRole = new Map();
  for (const [key, role] of Object.entries(routing.roles ?? {})) {
    const pool = role?.primary?.pool ?? null;
    if (!pool) continue;
    poolByRole.set(key, pool);
    if (role.opencodeAgent) poolByRole.set(role.opencodeAgent, pool);
  }
  // Un modelId también delata su pool por prefijo, que es la trampa que advierte MODEL_ROUTING.md:
  // `opencode-go/gpt-5.6-luna` y `openai/gpt-5.6-luna` son el mismo modelo y distinta factura.
  const poolByModel = (id) => {
    if (!id) return null;
    if (id.startsWith('opencode-go/')) return 'opencode-go';
    if (id.startsWith('opencode/')) return 'opencode-free';
    if (id.startsWith('openai/')) return 'chatgpt-plan';
    if (id.startsWith('claude')) return 'anthropic-claude';
    return null;
  };

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
          // El énfasis de markdown se saca: en la tarjeta se lee texto, no fuente.
          const raw = m[1].replace(/`/g, '').replace(/\*\*/g, '').trim();
          return raw.includes(' | ') ? null : raw;
        };
        // La línea de ruta puede traer rol, modelo y la decisión que lo justifica.
        // Se parte en rol y modelo; lo demás es prosa y no va a la tarjeta.
        const rutaRaw = (body.match(/^\*\*Ruta de modelo:\*\*\s*(.+)$/m) ?? [])[1] ?? '';
        const ticks = [...rutaRaw.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
        const rol = ticks[0] ?? null;
        const modelo = ticks.slice(1).find((t) => t.includes('/') || /^(claude|gpt|glm|kimi|deepseek|qwen|mimo|nemotron)/.test(t)) ?? null;
        const title = (body.match(/^#\s*`?[^`]*`?\s*—\s*(.+)$/m) ?? [])[1] ?? '';
        return {
          id: f.replace('.md', ''),
          rel: `packets/${activeKey}/${f}`,
          title: title.trim(),
          estado: get('Estado'),
          rol,
          modelo,
          gate: get('Gate humano'),
          est: get('Estimación'),
          effort: get('Effort'),
        };
      });
  }
  const activePacket = packets.find((p) => p.estado && !['DONE', 'READY'].includes(p.estado))
    ?? packets.find((p) => p.estado === 'READY') ?? null;

  // Hallazgos abiertos: sólo la tabla de registro. Todo lo que va después de «## Cerrados»
  // está resuelto y no debe contarse como abierto.
  const openSection = issuesMd.split(/^##\s+Cerrados\s*$/m)[0];
  const openIssues = (openSection.match(/^\|\s*OI-\d+\s*\|.*$/gm) ?? []).map((row) => {
    const c = row.split('|').map((s) => s.trim().replace(/`/g, ''));
    return { id: c[1], fecha: c[2], donde: c[3], que: c[4], sev: c[5], bloquea: c[6], destino: c[7] };
  });

  // ---------- qué sigue ----------

  const NEXT = {
    null: { fase: 'PLAN', tel: 'plan', rol: 'director-plan', nota: 'el ticket todavía no tiene paquetes' },
    READY: { fase: 'PLAN', tel: 'plan', rol: 'director-plan', nota: 'contrato escrito, falta plan de ejecución' },
    ACTIVE: { fase: 'BUILD', tel: 'build', rol: 'builder', nota: 'implementación acotada al paquete' },
    TECH_REVIEW: { fase: 'REVIEW', tel: 'review', rol: 'reviewer', nota: 'modelo distinto del builder, read-only' },
    HUMAN_REVIEW: { fase: 'GATE', tel: null, rol: 'humano', nota: 'te toca a vos: aprobar o rechazar' },
    BLOCKED: { fase: '—', tel: null, rol: 'humano', nota: 'bloqueado: decide el Director' },
    FAILED: { fase: '—', tel: null, rol: 'humano', nota: 'falló: decide el Director' },
    DONE: { fase: '—', tel: null, rol: 'humano', nota: 'paquete cerrado; sigue el próximo o el cierre del ticket' },
  };
  const next = NEXT[activePacket?.estado ?? 'null'] ?? NEXT.null;
  const session = activePacket ? `${activePacket.id}-${next.fase}` : `${activeKey}-PLAN`;

  // La ficha del paquete manda sobre la tabla: un paquete puede declarar una ruta propia
  // (p. ej. `CP-028` sube ARC1-009 a claude por tocar un módulo compartido).
  const esHumano = next.rol === 'humano';
  const rol = esHumano ? null : (activePacket?.rol ?? next.rol);
  const model = esHumano ? null : (activePacket?.modelo ?? routes.get(rol) ?? null);
  const pool = esHumano ? null : (poolByModel(model) ?? poolByRole.get(rol) ?? null);
  const proveedor = pool ? (POOL_LABEL[pool] ?? pool) : null;

  // Rondas ya consumidas, contadas contra telemetría real.
  const rec = telemetry.records ?? [];
  const roundsPacket = activePacket ? rec.filter((r) => r.packet === activePacket.id).length : 0;
  const roundsIssue = rec.filter((r) => r.ticket === activeKey).length;

  // Un gate visual exige capturas; uno que no lo es, no. La checklist se arma según eso
  // para que no haya casillas que se tilden por inercia. Se ancla el «sí» al principio de la
  // línea: un «no — …» que mencione algo con «si» adentro no puede pedir capturas.
  // El corte va por lookahead y no por `\b`: `\b` no dispara después de una `í`, que no es
  // carácter de palabra para el motor, y un gate que diga sólo «sí» quedaría sin capturas.
  const gate = activePacket?.gate ?? '';
  const gateVisual = /^\W*s[ií](?![a-záéíóúñ])/i.test(gate) || /visual/i.test(gate);

  return {
    tasks, telemetry, rec, activeKey, activeIssue, packets, activePacket, openIssues,
    next, session, rol, model, pool, proveedor, roundsPacket, roundsIssue, gateVisual,
    prompt: buildPrompt({ activeKey, activePacket, next, session, model, rol }),
  };
}

// ---------- el prompt que pegás en la sesión ----------

// Todas las líneas salen de EXECUTION_PROTOCOL.md y PACKETS.md. No se inventa ninguna regla acá:
// si el protocolo cambia, este prompt tiene que cambiar con él.
function buildPrompt({ activeKey, activePacket, next, session, model, rol }) {
  const RUNREL = 'docs/agent-runs/ohmdal-arc1-serial-v1';
  const spec = activePacket ? `${RUNREL}/${activePacket.rel}` : null;
  const cabecera = [
    `Sesión: ${session}`,
    `Ruta: ${rol ?? 'humano'}${model ? ` — ${model}` : ''}`,
    '',
  ].join('\n');

  if (next.fase === 'PLAN') {
    return cabecera + [
      `Planificá exclusivamente ${activeKey}.`,
      `Leé AGENTS.md, ${RUNREL}/STATE.md, ${RUNREL}/EXECUTION_PROTOCOL.md, ${RUNREL}/PACKETS.md,`,
      `${RUNREL}/ACCEPTANCE_GATES.md, ${RUNREL}/ownership.json y la ficha ${RUNREL}/tickets/${activeKey}.md.`,
      'No leas fichas ni paquetes de otros tickets. No explores el sucesor.',
      '',
      'No escribas código. Decidí si el ticket se subdivide según los cuatro criterios de PACKETS.md',
      'y escribí el contrato del paquete activo ÚNICAMENTE; del siguiente sólo el título tentativo.',
      'Si el plan supera 10 pasos, el paquete es demasiado grande: subdividí en vez de ejecutarlo.',
      '',
      'Detenete cuando el contrato esté escrito.',
    ].join('\n');
  }

  if (next.fase === 'BUILD') {
    return cabecera + [
      `Ejecutá exclusivamente ${activePacket.id}.`,
      `Leé AGENTS.md, ${RUNREL}/STATE.md y su spec: ${spec}`,
      'No uses subagentes. No amplíes alcance fuera de la sección `Permitido` de la spec.',
      '',
      'Una sola estrategia técnica. Si la primera no es viable, detenete y reportá:',
      'no pruebes la segunda en esta sesión.',
      'Todo hallazgo ajeno al paquete se registra en OPEN_ISSUES.md y NO se arregla.',
      '',
      'Generá la evidencia que pide la sección `Evidencia` y detenete.',
      'Cerrá con la salida obligatoria del builder (los 12 puntos de EXECUTION_PROTOCOL.md),',
      'terminando en una recomendación: TECH_REVIEW, HUMAN_REVIEW, BLOCKED o DONE.',
      'No commitees.',
    ].join('\n');
  }

  if (next.fase === 'REVIEW') {
    return cabecera + [
      `Revisá exclusivamente ${activePacket.id}. Read-only: no edites ningún archivo.`,
      `Leé AGENTS.md, su spec (${spec}) y el diff contra la base del ticket.`,
      '',
      'Verificá criterio por criterio la sección `Terminado cuando`, y que el diff no salga',
      'de la sección `Permitido`. Clasificá los hallazgos en P0/P1/P2/sugerencia:',
      'sólo P0 y P1 bloquean; un P2 no habilita ampliar alcance.',
      '',
      'Detenete con el veredicto. No arregles lo que encuentres.',
    ].join('\n');
  }

  return cabecera + [
    activePacket
      ? `${activePacket.id} está en ${activePacket.estado}: la decisión es tuya, no de un agente.`
      : `${activeKey} no tiene paquete activo.`,
    next.nota,
  ].join('\n');
}

// ---------- escritura (lo único que esta consola toca del disco) ----------

function packetPath(id) {
  if (!PACKET_RE.test(id)) throw new Error(`Id de paquete inválido: ${id}`);
  const ticket = id.slice(0, id.lastIndexOf('-'));
  const p = join(RUN, 'packets', ticket, `${id}.md`);
  if (!existsSync(p)) throw new Error(`No existe la ficha ${id}.md`);
  return p;
}

function setEstado(id, estado) {
  if (!ESTADOS.includes(estado)) throw new Error(`Estado inválido: ${estado}`);
  const p = packetPath(id);
  const body = readFileSync(p, 'utf8');
  if (!/^\*\*Estado:\*\*.*$/m.test(body)) throw new Error(`La ficha ${id}.md no tiene línea **Estado:**`);
  writeFileSync(p, body.replace(/^\*\*Estado:\*\*.*$/m, `**Estado:** \`${estado}\``), 'utf8');
  return estado;
}

// Append-only, por la regla 3 de telemetry.json: un record cerrado no se edita ni se borra.
function appendTelemetry(r) {
  const p = join(RUN, 'telemetry.json');
  const t = JSON.parse(readFileSync(p, 'utf8'));
  t.records.push(r);
  writeFileSync(p, `${JSON.stringify(t, null, 2)}\n`, 'utf8');
  return t.records.length;
}

function abrir(target) {
  const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', target]]
    : process.platform === 'darwin' ? ['open', [target]] : ['xdg-open', [target]];
  spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref();
}

// ---------- render ----------

function render(d, { live }) {
  const { tasks, activeKey, activeIssue, packets, activePacket, openIssues, next, session,
    rol, model, proveedor, roundsPacket, roundsIssue, gateVisual, rec } = d;

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

  const kv = (k, v, mono = false) => `<div class="kv"><dt>${esc(k)}</dt><dd${mono ? ' class="mono"' : ''}>${v == null || v === '' ? '<span class="none">sin dato</span>' : esc(v)}</dd></div>`;

  const packetRows = packets.length
    ? packets.map((p) => `<tr class="${p.id === activePacket?.id ? 'is-active' : ''}"><td class="mono">${esc(p.id)}</td><td>${esc(p.title)}</td><td><span class="tag ${(p.estado ?? '').toLowerCase()}">${esc(p.estado ?? '—')}</span></td><td class="mono">${esc(p.rol ?? '—')}</td><td>${esc(p.gate ?? '—')}</td><td>${esc(p.est ?? '—')}</td></tr>`).join('')
    : `<tr><td colspan="6" class="none">Sin paquetes. Los define <code>/arc-plan ${esc(activeKey)}</code> — no se preparan por adelantado (PACKETS.md).</td></tr>`;

  const telemetryRows = rec.length
    ? [...rec].reverse().map((r) => `<tr><td class="mono">${esc(r.packet ?? r.ticket)}</td><td>${esc(r.phase)}</td><td class="mono">${esc(r.modelId ?? '—')}</td><td>${esc(r.effort ?? '—')}</td><td>${r.durationMin ?? '<span class="none">not-run</span>'}</td><td>${esc(r.round)}</td><td><span class="tag ${(r.result ?? '').toLowerCase()}">${esc(r.result)}</span></td><td>${r.metExpectation == null ? '<span class="none">—</span>' : (r.metExpectation ? 'sí' : '<b>no</b>')}</td><td>${esc(r.burn ?? '—')}</td><td class="note">${esc(r.problem ?? '')}</td></tr>`).join('')
    : `<tr><td colspan="10" class="none">Sin registros todavía. Cada fase de paquete emite el suyo al cerrarse; hasta entonces no hay base empírica para cambiar el routing (CP-007).</td></tr>`;

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

  // Checklist: las capturas sólo aparecen si el gate del paquete es visual.
  const checks = [
    ['build', '<code>npm run build</code> PASS'],
    ['tests', '<code>npm test</code> PASS'],
    ['diff', '<code>git diff --check</code> PASS'],
    ...(gateVisual ? [['desktop', 'Captura desktop 1440×900'], ['mobile', 'Captura mobile 390×844']] : []),
    ['evidencia', 'Evidencia escrita donde pide la spec'],
    ['revisado', 'Diff revisado por mí'],
    ['objetivo', 'Cumple el objetivo del paquete'],
  ];
  const checkBoxes = checks.map(([id, label]) =>
    `<label class="chk"><input type="checkbox" data-chk="${id}"> <span>${label}</span></label>`).join('');

  const ejecutable = live && activePacket && next.tel;
  const puedeCerrar = live && activePacket;

  const acciones = live
    ? `<div class="acts">
        ${activePacket ? `<button class="btn" data-abrir="${esc(activePacket.rel)}">📄 ABRIR SPEC</button>` : ''}
        <button class="btn primary" id="copiar">📋 COPIAR PROMPT</button>
        ${activePacket && activePacket.estado === 'READY' ? '<button class="btn" data-estado="ACTIVE">▶ MARCAR ACTIVE</button>' : ''}
        <button class="btn ghost" id="ver-prompt">ver prompt</button>
      </div>`
    : `<div class="acts"><span class="warn-inline">Botones desactivados: estás viendo el HTML estático.
        Para operar, abrí la consola con <code>node scripts/arc-board.mjs --serve --open</code>.</span></div>`;

  const cierre = puedeCerrar
    ? `<section id="cierre">
  <h2>Al terminar la sesión</h2>
  <p class="sub">Esta consola no decide si el paquete cumple. Lo comprobás vos: <b>${esc(activePacket.id)}</b>,
  fase <b>${esc(next.fase)}</b>. Tildar todo habilita <code>DONE</code> y <code>TECH_REVIEW</code>;
  <code>BLOCKED</code> y <code>FAILED</code> no lo necesitan.</p>
  <div class="checks">${checkBoxes}</div>
  <div class="form">
    ${['modelId|Modelo realmente usado|text|' + esc(model ?? ''),
      'durationMin|Minutos medidos (reloj)|number|',
      'effort|Effort|text|' + esc(activePacket.effort ?? ''),
      'burn|Consumo de cuota|select|bajo,medio,alto',
      'problem|Problema principal (una línea)|text|',
      'notes|Notas para telemetría|text|'].map((f) => {
      const [id, label, type, extra] = f.split('|');
      const input = type === 'select'
        ? `<select id="f-${id}"><option value="">sin dato</option>${extra.split(',').map((o) => `<option>${o}</option>`).join('')}</select>`
        : `<input id="f-${id}" type="${type}" value="${type === 'number' ? '' : extra}" placeholder="${type === 'number' ? 'vacío = not-run' : 'vacío = sin dato'}">`;
      return `<div class="fld"><label for="f-${id}">${label}</label>${input}</div>`;
    }).join('')}
    <div class="fld"><label>¿Cumplió el objetivo?</label>
      <select id="f-met"><option value="">sin dato</option><option value="true">sí</option><option value="false">no</option></select></div>
  </div>
  <div class="acts">
    <button class="btn res needs-checks" data-res="DONE">DONE</button>
    <button class="btn res needs-checks" data-res="TECH_REVIEW">TECH REVIEW</button>
    <button class="btn res" data-res="HUMAN_REVIEW">HUMAN REVIEW</button>
    <button class="btn res danger" data-res="BLOCKED">BLOCKED</button>
    <button class="btn res danger" data-res="FAILED">FAILED</button>
  </div>
  <p class="sub small">Escribe un record en <code>telemetry.json</code> (append-only) y pone
  <code>Estado:</code> en la ficha del paquete. Lo que dejes vacío se guarda como <code>null</code>
  y cuenta como <code>not-run</code>: nunca se estima.</p>
</section>`
    : '';

  return `<!doctype html>
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
.sub{color:var(--dim);font-size:.85rem}.sub.small{font-size:.78rem;margin-top:12px}
.badge{padding:2px 9px;border-radius:999px;font-size:.72rem;font-weight:600;letter-spacing:.02em}
.badge.on{background:color-mix(in srgb,var(--done) 18%,transparent);color:var(--done)}
.badge.off{background:color-mix(in srgb,var(--danger) 18%,transparent);color:var(--danger)}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 20px;margin-top:18px}
h2{font-size:.78rem;text-transform:uppercase;letter-spacing:.09em;color:var(--dim);margin:0 0 14px;font-weight:600}
h3{margin:0 0 4px;font-size:1.1rem}
.now{border-left:3px solid var(--accent)}
.now .headline{font-size:1.5rem;font-weight:650;letter-spacing:-.015em;margin:0 0 2px}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px 20px;margin:16px 0 0}
.kv dt{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-bottom:2px}
.kv dd{margin:0;font-weight:550}
.none{color:var(--dim);font-style:italic;font-weight:400}
.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;align-items:center}
.btn{font:inherit;font-size:.85rem;font-weight:600;padding:8px 14px;border-radius:8px;cursor:pointer;
border:1px solid var(--line);background:var(--card);color:var(--fg)}
.btn:hover{border-color:var(--accent)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.ghost{border:none;background:none;color:var(--dim);font-weight:500;text-decoration:underline}
.btn.danger{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 35%,var(--line))}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn:disabled:hover{border-color:var(--line)}
.warn-inline{font-size:.82rem;color:var(--warn)}
pre.prompt{display:none;margin:14px 0 0;padding:14px 16px;background:var(--bg);border:1px solid var(--line);
border-radius:8px;white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:.82rem;line-height:1.5}
pre.prompt.on{display:block}
.checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:6px 18px}
.chk{display:flex;gap:8px;align-items:baseline;font-size:.88rem;cursor:pointer;padding:3px 0}
.chk input{width:16px;height:16px;accent-color:var(--accent);cursor:pointer;flex:none}
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px 16px;margin-top:18px}
.fld label{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-bottom:4px}
.fld input,.fld select{width:100%;font:inherit;font-size:.86rem;padding:7px 9px;border-radius:7px;
border:1px solid var(--line);background:var(--bg);color:var(--fg)}
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
td.note{font-size:.8rem;color:var(--dim);max-width:260px}
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
#toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(80px);
background:var(--fg);color:var(--bg);padding:10px 18px;border-radius:9px;font-size:.86rem;font-weight:600;
transition:transform .22s ease;z-index:9}
#toast.on{transform:translateX(-50%) translateY(0)}
</style></head><body><div class="wrap">

<header>
  <h1>Arco I de Ohmdal</h1>
  <span class="badge ${tasks.executionAuthorized ? 'on">ejecución autorizada' : 'off">ejecución no autorizada'}</span>
  <span class="sub mono">${esc(tasks.branch)} · ${esc(tasks.workflow?.mode ?? tasks.workflow)} · WIP ${tasks.workflow?.globalWipLimit ?? tasks.budgets?.maxConcurrentExecutors ?? '?'} · paquete ${esc(mins.min)}–${esc(mins.max)} min · base ${esc(tasks.baseCommit ?? '—')}</span>
</header>

<section class="now">
  <h2>Siguiente acción</h2>
  <p class="headline">${esc(activePacket?.id ?? activeKey)}</p>
  <p class="sub">${esc(activePacket?.title || activeIssue?.title || 'sin ficha')} — ${esc(next.nota)}</p>
  <dl>
    ${kv('Estado', activePacket?.estado ?? '—')}
    ${kv('Fase', next.fase)}
    ${kv('Modelo', model, true)}
    ${kv('Proveedor', proveedor)}
    ${kv('Effort', activePacket?.effort)}
    ${kv('Duración esperada', activePacket?.est)}
    ${kv('Ronda', `${roundsPacket + (next.tel ? 1 : 0)} / ${tasks.budgets?.maxRoundsPerPacket ?? '?'} paquete · ${roundsIssue} / ${tasks.budgets?.maxRoundsPerIssue ?? '?'} ticket`)}
    ${kv('Gate posterior', activePacket?.gate)}
  </dl>
  ${acciones}
  <pre class="prompt" id="prompt">${esc(d.prompt)}</pre>
</section>

${cierre}

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
  <h2>Telemetría — ${rec.length} fase(s) registrada(s)</h2>
  <p class="sub" style="margin:-6px 0 12px">Con 10–15 paquetes acá adentro vas a saber qué modelo, qué effort
  y qué duración funcionan de verdad. Recién entonces tiene sentido automatizar el clic.</p>
  <div class="scroll"><table><thead><tr><th>Paquete</th><th>Fase</th><th>Modelo</th><th>Effort</th><th>Min</th><th>Ronda</th><th>Resultado</th><th>Cumplió</th><th>Consumo</th><th>Problema</th></tr></thead>
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

<footer>Generado desde el control plane el ${local().fecha} ${local().hora} · <code>node scripts/arc-board.mjs${live ? ' --serve' : ''}</code><br>
Superficie derivada: la verdad vive en <code>tasks.json</code>, <code>STATE.md</code>, <code>packets/</code> y <code>telemetry.json</code>.</footer>
</div>
<div id="toast"></div>
<script>
const PROMPT = ${JSON.stringify(d.prompt)};
const PACKET = ${JSON.stringify(activePacket?.id ?? null)};
const PHASE  = ${JSON.stringify(next.tel)};
const TICKET = ${JSON.stringify(activeKey)};
const SESSION= ${JSON.stringify(session)};
const ROUTE  = ${JSON.stringify(rol)};
const ROUND  = ${roundsPacket + 1};
const LIVE   = ${live ? 'true' : 'false'};

const toast = (m) => { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('on');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); };

document.getElementById('ver-prompt')?.addEventListener('click', () =>
  document.getElementById('prompt').classList.toggle('on'));

document.getElementById('copiar')?.addEventListener('click', async (e) => {
  try { await navigator.clipboard.writeText(PROMPT); }
  catch { const ta = document.createElement('textarea'); ta.value = PROMPT; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); }
  const b = e.currentTarget, o = b.textContent;
  b.textContent = '✓ copiado'; setTimeout(() => { b.textContent = o; }, 1600);
});

async function api(ruta, cuerpo) {
  const r = await fetch('/api/' + ruta, { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-arc-board': '1' }, body: JSON.stringify(cuerpo) });
  const j = await r.json().catch(() => ({ error: 'respuesta ilegible' }));
  if (!r.ok) throw new Error(j.error ?? r.statusText);
  return j;
}

document.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () =>
  api('abrir', { rel: b.dataset.abrir }).then(() => toast('abriendo la spec…')).catch((e) => toast('✗ ' + e.message))));

document.querySelectorAll('[data-estado]').forEach((b) => b.addEventListener('click', () =>
  api('estado', { packet: PACKET, estado: b.dataset.estado })
    .then(() => location.reload()).catch((e) => toast('✗ ' + e.message))));

// La checklist se guarda en el navegador, no en disco: recargar no la borra, pero tampoco
// inventa estado del control plane.
const CLAVE = 'arc-check:' + PACKET + ':' + PHASE;
const cajas = [...document.querySelectorAll('[data-chk]')];
const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? '{}');
cajas.forEach((c) => { c.checked = !!guardado[c.dataset.chk]; });

function sincronizar() {
  const todo = cajas.every((c) => c.checked);
  localStorage.setItem(CLAVE, JSON.stringify(Object.fromEntries(cajas.map((c) => [c.dataset.chk, c.checked]))));
  document.querySelectorAll('.needs-checks').forEach((b) => {
    b.disabled = !todo;
    b.title = todo ? '' : 'Tildá la checklist completa para habilitarlo';
  });
}
cajas.forEach((c) => c.addEventListener('change', sincronizar));
sincronizar();

const v = (id) => { const el = document.getElementById('f-' + id); const s = el ? el.value.trim() : ''; return s === '' ? null : s; };

document.querySelectorAll('[data-res]').forEach((b) => b.addEventListener('click', async () => {
  const res = b.dataset.res;
  if (!confirm('Cerrar ' + PACKET + ' fase ' + PHASE + ' como ' + res + '?\\n\\nSe agrega un record a telemetry.json (no se puede editar después) y se escribe el Estado en la ficha.')) return;
  const min = v('durationMin');
  const met = v('met');
  try {
    await api('cierre', {
      packet: PACKET, ticket: TICKET, phase: PHASE, session: SESSION, route: ROUTE, round: ROUND,
      result: res, modelId: v('modelId'), durationMin: min === null ? null : parseInt(min, 10),
      effort: v('effort'), burn: v('burn'), problem: v('problem'), notes: v('notes'),
      metExpectation: met === null ? null : met === 'true',
    });
    localStorage.removeItem(CLAVE);
    location.reload();
  } catch (e) { toast('✗ ' + e.message); }
}));
</script>
</body></html>`;
}

// ---------- servidor ----------

function leerCuerpo(req) {
  return new Promise((ok, no) => {
    let b = ''; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > 64_000) { no(new Error('cuerpo demasiado grande')); req.destroy(); } b += c; });
    req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch { no(new Error('JSON inválido')); } });
    req.on('error', no);
  });
}

function serve() {
  const srv = createServer(async (req, res) => {
    const responder = (code, tipo, cuerpo) => { res.writeHead(code, { 'content-type': tipo, 'cache-control': 'no-store' }); res.end(cuerpo); };
    const jsonRes = (code, o) => responder(code, 'application/json; charset=utf-8', JSON.stringify(o));

    try {
      if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?'))) {
        const d = load();
        return responder(200, 'text/html; charset=utf-8', render(d, { live: true }));
      }

      if (req.method === 'POST' && req.url.startsWith('/api/')) {
        // Cabecera propia: obliga a preflight CORS, así una página cualquiera no puede escribir acá.
        if (req.headers['x-arc-board'] !== '1') return jsonRes(403, { error: 'origen no permitido' });
        const cuerpo = await leerCuerpo(req);
        const ruta = req.url.slice(5);

        if (ruta === 'estado') {
          setEstado(cuerpo.packet, cuerpo.estado);
          console.log(`  ${cuerpo.packet} → ${cuerpo.estado}`);
          return jsonRes(200, { ok: true });
        }

        if (ruta === 'abrir') {
          const destino = resolve(RUN, String(cuerpo.rel ?? ''));
          if (!destino.startsWith(RUN + sep)) return jsonRes(400, { error: 'ruta fuera de la corrida' });
          if (!existsSync(destino)) return jsonRes(404, { error: 'no existe ese archivo' });
          abrir(destino);
          return jsonRes(200, { ok: true });
        }

        if (ruta === 'cierre') {
          const { packet, ticket, phase, session, route, round, result } = cuerpo;
          if (!PACKET_RE.test(packet ?? '')) return jsonRes(400, { error: 'paquete inválido' });
          if (!FASES.includes(phase)) return jsonRes(400, { error: `fase inválida: ${phase}` });
          if (!['TECH_REVIEW', 'HUMAN_REVIEW', 'BLOCKED', 'FAILED', 'DONE'].includes(result))
            return jsonRes(400, { error: `resultado inválido: ${result}` });
          const min = cuerpo.durationMin;
          if (min !== null && (!Number.isInteger(min) || min <= 0)) return jsonRes(400, { error: 'los minutos tienen que ser un entero positivo, o vacío' });

          const n = appendTelemetry({
            ticket, packet, phase, session, route: route ?? null,
            modelId: cuerpo.modelId ?? null,
            date: local().fecha,
            durationMin: min, round: round ?? 1,
            filesTouched: null, ownershipRespected: null, firstArtifactMin: null,
            effort: cuerpo.effort ?? null,
            result,
            metExpectation: cuerpo.metExpectation ?? null,
            burn: cuerpo.burn ?? null,
            problem: cuerpo.problem ?? null,
            notes: cuerpo.notes ?? null,
          });
          setEstado(packet, result);
          console.log(`  ${packet} ${phase} → ${result}  ·  telemetry #${n}`);
          return jsonRes(200, { ok: true, records: n });
        }

        return jsonRes(404, { error: 'ruta desconocida' });
      }

      return responder(404, 'text/plain; charset=utf-8', 'no está acá');
    } catch (e) {
      console.error('  ✗', e.message);
      return jsonRes(400, { error: e.message });
    }
  });

  srv.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      // Ya hay una consola levantada: no se abre una segunda, se usa esa.
      console.log(`\n  La consola ya estaba corriendo en http://127.0.0.1:${PORT}\n`);
      if (process.argv.includes('--open')) abrir(`http://127.0.0.1:${PORT}/`);
      process.exit(0);
    }
    throw e;
  });

  srv.listen(PORT, '127.0.0.1', () => {
    console.log(`\n  Consola del Arco I  →  http://127.0.0.1:${PORT}\n`);
    console.log('  Cerrá esta ventana (o Ctrl+C) para apagarla.\n');
    if (process.argv.includes('--open')) abrir(`http://127.0.0.1:${PORT}/`);
  });
}

// ---------- main ----------

const d = load();

if (process.argv.includes('--serve')) {
  // El HTML estático se deja igual escrito: si el servidor no arranca, el tablero sigue leíble.
  writeFileSync(OUT, render(d, { live: false }), 'utf8');
  serve();
} else {
  writeFileSync(OUT, render(d, { live: false }), 'utf8');

  console.log(`\n  ${d.activeKey}  ${d.activeIssue?.title ?? ''}`);
  console.log(`  Paquete   ${d.activePacket ? `${d.activePacket.id}  ${d.activePacket.estado}` : 'ninguno — ' + d.next.nota}`);
  console.log(`  Rondas    ${d.roundsPacket}/${d.tasks.budgets?.maxRoundsPerPacket ?? '?'} paquete · ${d.roundsIssue}/${d.tasks.budgets?.maxRoundsPerIssue ?? '?'} ticket`);
  console.log(`  Sesión    ${d.session}`);
  console.log(`  Ruta      ${d.rol ?? 'humano'}${d.model ? ` → ${d.model}` : ''}${d.proveedor ? ` (${d.proveedor})` : ''}`);
  console.log(`  Abiertos  ${d.openIssues.length} hallazgo(s) · ${d.tasks.issues.filter((i) => i.status === 'DONE').length}/${d.tasks.issues.length} tickets cerrados`);
  console.log(`\n  → ${OUT}`);
  console.log('  Los botones que escriben sólo funcionan con --serve.\n');

  if (process.argv.includes('--open')) abrir(OUT);
}
