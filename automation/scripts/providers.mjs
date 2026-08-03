#!/usr/bin/env node
// Observa el inventario real de modelos y lo contrasta con automation/routing.json.
//
//   node automation/scripts/providers.mjs            informe
//   node automation/scripts/providers.mjs --write    ademas escribe provider-health.json
//
// Existe porque MODEL_ROUTING.md se desactualiza en dias: entre 2026-08-02 y 2026-08-03 el
// inventario gratuito cambio tres entradas. Un routing escrito a mano miente rapido; este script
// lo detecta en vez de esperar a que falle un builder.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { AUTO, routing, Report, dim } from './lib.mjs';

const WRITE = process.argv.includes('--write');

// ---------- observacion ----------

function observeOpencode() {
  try {
    const out = execFileSync('opencode', ['models'], { encoding: 'utf8', timeout: 90_000, shell: true });
    return out.split('\n').map((l) => l.trim()).filter((l) => /^[a-z0-9-]+\/[a-zA-Z0-9._-]+$/.test(l));
  } catch (e) {
    return { error: e.shortMessage ?? e.message };
  }
}

function observeCli(bin, args) {
  try {
    return execFileSync(bin, args, { encoding: 'utf8', timeout: 30_000, shell: true }).trim().split('\n')[0];
  } catch (e) {
    return { error: e.shortMessage ?? e.message };
  }
}

const models = observeOpencode();
const modelList = Array.isArray(models) ? models : [];
const rep = new Report('provider-health — inventario observado');

if (!Array.isArray(models)) {
  rep.fail(`no se pudo ejecutar \`opencode models\`: ${models.error}`);
} else {
  rep.ok(`opencode models devolvio ${models.length} entradas`);
}

const versions = {
  opencode: observeCli('opencode', ['--version']),
  codex: observeCli('codex', ['--version']),
  claude: observeCli('claude', ['--version']),
};

// ---------- contraste con routing.json ----------

const r = routing();
const declared = new Set();
for (const [role, cfg] of Object.entries(r.roles)) {
  for (const entry of [cfg.primary, ...(cfg.fallback ?? []), ...(cfg.escalation ?? [])]) {
    if (entry?.model) declared.add(`${role}:${entry.surface}:${entry.model}`);
  }
}

const opencodeDeclared = [...declared].filter((d) => d.split(':')[1] === 'opencode');
for (const d of opencodeDeclared) {
  const model = d.split(':').slice(2).join(':');
  if (modelList.includes(model)) rep.ok(`${d} presente en el inventario`);
  else if (modelList.length) rep.fail(`${d} NO existe en \`opencode models\` — el routing apunta a un modelo que no se puede llamar`);
}

// Modelos que el routing todavia no conoce.
const known = new Set(opencodeDeclared.map((d) => d.split(':').slice(2).join(':')));
const free = modelList.filter((m) => m.startsWith('opencode/'));
const go = modelList.filter((m) => m.startsWith('opencode-go/'));
const unused = [...free, ...go].filter((m) => !known.has(m));
if (unused.length) rep.warn(`en el inventario y sin ruta asignada (${unused.length}): ${unused.join(', ')}`);

// El riesgo caro: rutas a openai/* desde OpenCode gastan el pool de ChatGPT.
const openaiAvailable = modelList.filter((m) => m.startsWith('openai/'));
if (openaiAvailable.length) {
  rep.warn(
    `OpenCode puede llamar a ${openaiAvailable.length} modelos openai/* por OAuth. ` +
    `Es el MISMO pool que Codex: un worker mal enrutado gasta la cuota del orquestador.`
  );
}

// Go: el prefijo del proveedor es lo que decide el pool, no el nombre del modelo.
// `openai/gpt-5.6-luna` es cuota de ChatGPT; `opencode-go/gpt-5.6-luna` es Go. No son lo mismo.
const goDeclared = r.pools['opencode-go']?.subscribed === true;
if (go.length && !goDeclared) rep.fail(`aparecen ${go.length} modelos opencode-go/* y routing.json dice subscribed:false`);
else if (!go.length && goDeclared) rep.fail('routing.json dice que Go esta contratado y `opencode models` no devuelve ningun opencode-go/*');
else if (go.length) rep.ok(`Go activo con ${go.length} modelos`);

const luna = ['opencode-go/gpt-5.6-luna', 'openai/gpt-5.6-luna'].filter((m) => modelList.includes(m));
if (luna.length === 2) {
  rep.warn('gpt-5.6-luna existe en los dos proveedores: `opencode-go/` no cuesta cuota de ChatGPT, `openai/` si. Verificar el prefijo antes de cada corrida.');
}

// ---------- capabilities y smokes ----------

const caps = Object.entries(r.capabilities).filter(([, c]) => c.verified === false).map(([k]) => k);
if (caps.length) rep.warn(`capabilities sin smoke local: ${caps.join(', ')} — toda tarea que las requiera nace en WAITING_PROVIDER`);

const unsmoked = Object.entries(r.roles).filter(([, c]) => c.smokeStatus === 'not-run').map(([k]) => k);
if (unsmoked.length) rep.warn(`roles sin smoke (${unsmoked.length}): ${unsmoked.join(', ')} — «disponibilidad no demuestra calidad»`);

const burn = r.pools['opencode-go']?.burnRateWarning;
if (burn && go.length) rep.warn(burn.split('.')[0] + '.');

// ---------- salida ----------

const health = {
  version: 1,
  generatedBy: 'automation/scripts/providers.mjs',
  observedOn: new Date().toISOString().slice(0, 10),
  versions,
  models: modelList,
  pools: {
    'opencode-go': { subscribed: go.length > 0, models: go },
    'opencode-free': { available: free.length > 0, models: free },
    'chatgpt-plan': { available: openaiAvailable.length > 0, models: openaiAvailable, surfaces: ['codex', 'opencode(openai/*)'] },
    'anthropic-claude': { available: typeof versions.claude === 'string' },
  },
  modelsWithoutRoute: unused,
  unverifiedCapabilities: caps,
  rolesWithoutSmoke: unsmoked,
};

rep.print({ verbose: process.argv.includes('-v') });

if (WRITE) {
  const out = join(AUTO, 'provider-health.json');
  writeFileSync(out, JSON.stringify(health, null, 2) + '\n', 'utf8');
  console.log(dim(`\nescrito: automation/provider-health.json`));
} else {
  console.log(dim('\n(usar --write para persistir provider-health.json)'));
}

process.exit(rep.exitCode);
