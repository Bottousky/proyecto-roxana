// Utilidades compartidas de automation/. Sin dependencias: mismo criterio que scripts/arc-board.mjs.
// El validador de schema cubre a proposito un subconjunto chico de JSON Schema. Si una regla no
// entra en ese subconjunto, se escribe como chequeo explicito en el script que la necesita, no se
// agrega una dependencia.

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const AUTO = join(ROOT, 'automation');

export const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
export const json = (p) => { const t = read(p); return t === null ? null : JSON.parse(t); };

export const taxonomy = () => json(join(AUTO, 'taxonomy.json'));
export const routing = () => json(join(AUTO, 'routing.json'));

// ---------- salida ----------

const ESC = String.fromCharCode(27);
const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (COLOR ? `${ESC}[${code}m${s}${ESC}[0m` : s);
export const red = (s) => paint('31', s);
export const green = (s) => paint('32', s);
export const yellow = (s) => paint('33', s);
export const dim = (s) => paint('90', s);
export const bold = (s) => paint('1', s);

/** Acumulador de hallazgos. `fail` marca salida distinta de cero; `warn` no. */
export class Report {
  constructor(title) { this.title = title; this.fails = []; this.warns = []; this.oks = []; }
  fail(msg) { this.fails.push(msg); return this; }
  warn(msg) { this.warns.push(msg); return this; }
  ok(msg) { this.oks.push(msg); return this; }
  merge(other) { this.fails.push(...other.fails); this.warns.push(...other.warns); this.oks.push(...other.oks); return this; }
  print({ verbose = false } = {}) {
    console.log(bold(this.title));
    if (verbose) for (const m of this.oks) console.log(`  ${green('ok')}    ${dim(m)}`);
    for (const m of this.warns) console.log(`  ${yellow('warn')}  ${m}`);
    for (const m of this.fails) console.log(`  ${red('FAIL')}  ${m}`);
    const n = this.oks.length + this.warns.length + this.fails.length;
    const line = `${this.oks.length} ok · ${this.warns.length} warn · ${this.fails.length} fail  ${dim(`(${n} checks)`)}`;
    console.log(this.fails.length ? red(line) : this.warns.length ? yellow(line) : green(line));
    return this;
  }
  get exitCode() { return this.fails.length ? 1 : 0; }
}

// ---------- mini JSON Schema ----------

const typeOf = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v);

/**
 * Valida `value` contra `schema`. Devuelve un array de strings; vacio significa valido.
 * Soporta: type, required, properties, additionalProperties, enum, pattern, minLength,
 * maxLength, minItems, minimum, maximum, items.
 */
export function validateSchema(value, schema, path = '$') {
  const errs = [];
  if (!schema || typeof schema !== 'object') return errs;

  if (schema.type) {
    const want = Array.isArray(schema.type) ? schema.type : [schema.type];
    const got = typeOf(value);
    const okInt = want.includes('integer') && got === 'number' && Number.isInteger(value);
    if (!want.includes(got) && !okInt) {
      errs.push(`${path}: se esperaba ${want.join('|')}, hay ${got}`);
      return errs; // sin el tipo correcto el resto de los chequeos no aporta
    }
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errs.push(`${path}: "${value}" no esta en [${schema.enum.join(', ')}]`);
  }
  if (typeof value === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errs.push(`${path}: "${value}" no cumple /${schema.pattern}/`);
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errs.push(`${path}: ${value.length} caracteres, minimo ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errs.push(`${path}: ${value.length} caracteres, maximo ${schema.maxLength}`);
    }
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errs.push(`${path}: ${value} < minimo ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errs.push(`${path}: ${value} > maximo ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errs.push(`${path}: ${value.length} elementos, minimo ${schema.minItems}`);
    }
    if (schema.items) value.forEach((v, i) => errs.push(...validateSchema(v, schema.items, `${path}[${i}]`)));
  }
  if (value && typeOf(value) === 'object') {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errs.push(`${path}: falta el campo obligatorio "${key}"`);
    }
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) errs.push(...validateSchema(v, props[k], `${path}.${k}`));
      else if (schema.additionalProperties === false) errs.push(`${path}: campo desconocido "${k}"`);
    }
  }
  return errs;
}

// ---------- evidencia ----------

/**
 * La regla que nace de OI-006: una evidencia declarada tiene que existir y pesar algo.
 * Devuelve { missing, empty, present } con rutas relativas a ROOT.
 */
export function checkEvidence(dir, files) {
  const out = { missing: [], empty: [], present: [] };
  for (const f of files ?? []) {
    const rel = join(dir, f).replace(/\\/g, '/');
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) { out.missing.push(rel); continue; }
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (readdirSync(abs).length === 0) out.empty.push(rel); else out.present.push(rel);
    } else if (st.size === 0) out.empty.push(rel);
    else out.present.push(rel);
  }
  return out;
}

// ---------- globs ----------

/** Traduce un glob de ownership.json a RegExp. `**` cruza directorios, `*` no. */
function rx(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') { i++; out += '(?:.*/)?'; } // cero o mas directorios
        else out += '.*';                                    // cualquier cosa, incluso barras
      } else out += '[^/]*';                                 // un solo segmento
    } else if (c === '?') out += '[^/]';
    else if ('.+^${}()|[]\\'.includes(c)) out += '\\' + c;
    else out += c;
  }
  return new RegExp('^' + out + '$');
}

export const matchesGlob = (path, glob) => rx(glob).test(path.replace(/\\/g, '/'));

/**
 * True si dos globs pueden referirse al mismo archivo. No es exacto —decidirlo en general es
 * costoso— pero cubre los casos que aparecen en ownership.json: prefijos de directorio y `**`.
 */
export function globOverlaps(a, b) {
  const norm = (g) => g.replace(/\\/g, '/');
  a = norm(a); b = norm(b);
  if (a === b) return true;
  const probe = (g) => g.replace(/\/?\*\*$/, '/x');
  if (matchesGlob(probe(a), b) || matchesGlob(probe(b), a)) return true;
  const base = (g) => g.split('*')[0].replace(/\/$/, '');
  const [ba, bb] = [base(a), base(b)];
  if (!ba || !bb) return false;
  return ba === bb || ba.startsWith(bb + '/') || bb.startsWith(ba + '/');
}

/** Inventario de modelos que el CLI de OpenCode reporta de verdad. null si no se pudo leer. */
export function localModelIds() {
  const health = json(join(AUTO, 'provider-health.json'));
  return health?.models ?? null;
}
