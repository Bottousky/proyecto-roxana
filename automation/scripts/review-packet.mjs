#!/usr/bin/env node
// Arma el Review Packet: lo MINIMO que un reviewer necesita para juzgar, sin la novela entera.
//
//   node automation/scripts/review-packet.mjs ARC1-007-B
//   node automation/scripts/review-packet.mjs automation/tasks/queue/TASK-002.json
//   node automation/scripts/review-packet.mjs ARC1-007-B --out automation/runs/review-ARC1-007-B.md
//
// El reviewer que hereda el contexto del builder hereda tambien sus supuestos y sus callejones
// descartados, y termina revisando la intencion en vez del resultado. Por eso PACKETS.md exige
// sesion nueva. Este script produce el unico insumo que deberia cruzar esa frontera: objetivo,
// criterios, diff y artefactos. No el razonamiento.

import { writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, isAbsolute, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, read, json, taxonomy, dim, green } from './lib.mjs';

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('-'));
const outIdx = args.indexOf('--out');
const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
const RUN = args.includes('--run') ? args[args.indexOf('--run') + 1] : 'ohmdal-arc1-serial-v1';

if (!target) {
  console.error('uso: node automation/scripts/review-packet.mjs <ARC1-NNN-X | tarea.json> [--out archivo.md]');
  process.exit(2);
}

const git = (a) => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { return null; } };
const section = (body, name) => body?.split(new RegExp(`^## ${name}\\s*$`, 'm'))[1]?.split(/^## /m)[0]?.trim() ?? null;

/** Items de una lista markdown, uniendo las lineas continuadas: un criterio partido a la mitad
 *  hace que el reviewer juzgue medio criterio. */
function listItems(text) {
  const out = [];
  for (const raw of (text ?? '').split('\n')) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) out.push(line.replace(/^\s*[-*]\s+/, ''));
    else if (out.length && line.trim()) out[out.length - 1] += ' ' + line.trim();
  }
  return out;
}

let packet;

if (target.endsWith('.json')) {
  // ---------- Task Spec de automation/ ----------
  const file = isAbsolute(target) ? target : join(ROOT, target);
  const t = json(file);
  const kind = taxonomy().kinds[t.kind];
  packet = {
    id: t.id,
    title: t.title,
    goal: t.goal,
    kind: `${t.kind} — ${kind?.pipeline ?? '?'}`,
    criteria: t.acceptanceCriteria,
    mustNotDo: t.scope.mustNotDo,
    allowed: t.scope.allowedPaths,
    evidenceDir: t.evidence.dir,
    gates: t.gates?.length ? t.gates : (kind?.gates ?? []),
  };
} else {
  // ---------- Ficha de paquete del control plane ----------
  const ticket = target.replace(/-[A-Z]$/, '');
  const file = join(ROOT, 'docs/agent-runs', RUN, 'packets', ticket, `${target}.md`);
  const body = read(file);
  if (!body) { console.error(`no existe ${file}`); process.exit(2); }
  packet = {
    id: target,
    title: body.match(/^# `[^`]+` — (.+)$/m)?.[1] ?? target,
    goal: section(body, 'Objetivo'),
    kind: body.match(/^\*\*Ruta de modelo:\*\*\s*`([^`]+)`/m)?.[1] ?? null,
    criteria: listItems(section(body, 'Terminado cuando')),
    mustNotDo: (section(body, 'Prohibido') ?? '').replace(/```\w*\n?|```/g, '').trim().split('\n').filter(Boolean),
    allowed: (section(body, 'Permitido') ?? '').replace(/```\w*\n?|```/g, '').trim().split('\n').filter(Boolean),
    evidenceDir: `docs/agent-runs/${RUN}/evidence/${ticket}`,
    gates: [],
  };
}

// ---------- artefactos reales, no declarados ----------

const evAbs = join(ROOT, packet.evidenceDir);
const artifacts = existsSync(evAbs)
  ? readdirSync(evAbs).map((f) => {
      const s = statSync(join(evAbs, f));
      return `${f}  ${dim(s.isDirectory() ? '(dir)' : `${s.size} B`)}`;
    })
  : [];

const diffStat = git(['diff', '--stat']) || git(['show', '--stat', '--format=', 'HEAD']) || '(sin diff)';

// ---------- salida ----------

const md = `# Review Packet — ${packet.id}

**Contexto:** este paquete es TODO lo que necesitás. No leas el historial del builder ni su razonamiento.
**Tu salida es exactamente una de tres:** \`SHIP\` · \`FIX_FIRST\` · \`RETHINK\`, con una justificacion breve
y concreta. No implementes cambios. Clasifica cada hallazgo P0, P1 o P2; solo P0 y P1 bloquean.

## Objetivo declarado

${packet.goal ?? '(sin objetivo declarado — eso ya es un hallazgo)'}

## Criterios de aceptacion

${packet.criteria?.length ? packet.criteria.map((c) => `- [ ] ${c}`).join('\n') : '- (ninguno declarado — hallazgo P1)'}

## Fuera de alcance

${packet.mustNotDo?.length ? packet.mustNotDo.map((c) => `- ${c}`).join('\n') : '- (no declarado)'}

## Rutas permitidas

\`\`\`text
${packet.allowed?.join('\n') || '(no declaradas)'}
\`\`\`

## Gates

${packet.gates?.length ? packet.gates.map((g) => `- \`${g}\``).join('\n') : '- (heredados del kind)'}

## Artefactos presentes en disco

${artifacts.length ? artifacts.map((a) => `- ${a}`).join('\n') : '- **ninguno** — si el paquete se declara terminado, esto es P0'}

## Diff

\`\`\`text
${diffStat}
\`\`\`

## Preguntas que el veredicto tiene que responder

1. ¿Cada criterio esta cubierto por una prueba observable, o por una afirmacion?
2. ¿El diff se salio de las rutas permitidas?
3. ¿Hay algo declarado que no existe en disco?
4. ¿Se arreglo algo ajeno al paquete en vez de registrarlo en OPEN_ISSUES.md?
5. ¿Alguna medicion se presenta como PASS sin metodo reproducible?
`;

if (outFile) {
  const p = isAbsolute(outFile) ? outFile : join(ROOT, outFile);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, md, 'utf8');
  console.log(green(`escrito: ${outFile}`));
} else {
  console.log(md);
}
