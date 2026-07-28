import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const manifestsDirectory = path.join(repositoryRoot, 'assets', 'manifests');
const schemaPath = path.join(manifestsDirectory, 'assets.schema.json');

function valueType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function matchesType(value, expected) {
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'null') return value === null;
  return typeof value === expected;
}

function resolveReference(rootSchema, reference) {
  if (!reference.startsWith('#/')) {
    throw new Error(`Sólo se admiten referencias internas; recibida: ${reference}`);
  }

  return reference
    .slice(2)
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'))
    .reduce((current, part) => current?.[part], rootSchema);
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

function validateValue(value, schema, rootSchema, location = '$') {
  const errors = [];

  if (schema.$ref) {
    const target = resolveReference(rootSchema, schema.$ref);
    if (!target) return [`${location}: referencia de schema inexistente ${schema.$ref}`];
    return validateValue(value, target, rootSchema, location);
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${location}: debe ser ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${location}: valor ${JSON.stringify(value)} fuera de ${JSON.stringify(schema.enum)}`);
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${location}: se esperaba ${schema.type}, se recibió ${valueType(value)}`);
    return errors;
  }

  if (schema.type === 'object') {
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push(`${location}.${required}: propiedad requerida`);
    }

    for (const [key, child] of Object.entries(value)) {
      const childSchema = schema.properties?.[key];
      if (childSchema) {
        errors.push(...validateValue(child, childSchema, rootSchema, `${location}.${key}`));
      } else if (schema.additionalProperties === false) {
        errors.push(`${location}.${key}: propiedad no permitida`);
      }
    }
  }

  if (schema.type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${location}: requiere al menos ${schema.minItems} elemento(s)`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${location}: admite como máximo ${schema.maxItems} elemento(s)`);
    }
    if (schema.uniqueItems) {
      const unique = new Set(value.map((item) => JSON.stringify(item)));
      if (unique.size !== value.length) errors.push(`${location}: contiene elementos duplicados`);
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateValue(item, schema.items, rootSchema, `${location}[${index}]`));
      });
    }
  }

  if (schema.type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${location}: requiere al menos ${schema.minLength} carácter(es)`);
    }
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      errors.push(`${location}: no cumple el patrón ${schema.pattern}`);
    }
    if (schema.format === 'date' && !isIsoDate(value)) {
      errors.push(`${location}: debe usar fecha ISO YYYY-MM-DD`);
    }
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${location}: debe ser >= ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${location}: debe ser <= ${schema.maximum}`);
    }
  }

  return errors;
}

async function defaultManifestFiles() {
  const entries = await readdir(manifestsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(manifestsDirectory, entry.name))
    .filter((file) => file.endsWith('.json'))
    .filter((file) => !file.endsWith('assets.schema.json'))
    .filter((file) => !file.endsWith('assets.index.json'))
    .sort();
}

async function expandInputs(inputs) {
  if (inputs.length === 0) return defaultManifestFiles();
  const files = [];

  for (const input of inputs) {
    const absolute = path.resolve(repositoryRoot, input);
    const info = await stat(absolute);
    if (info.isDirectory()) {
      const entries = await readdir(absolute, { withFileTypes: true });
      files.push(
        ...entries
          .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
          .map((entry) => path.join(absolute, entry.name))
          .filter((file) => !file.endsWith('assets.schema.json'))
          .filter((file) => !file.endsWith('assets.index.json')),
      );
    } else {
      files.push(absolute);
    }
  }

  return files.sort();
}

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const inputFiles = await expandInputs(process.argv.slice(2));

if (inputFiles.length === 0) {
  console.error('No se encontraron manifiestos JSON para validar.');
  process.exit(2);
}

let failed = false;

for (const file of inputFiles) {
  const displayPath = path.relative(repositoryRoot, file).replaceAll('\\', '/');
  try {
    const manifest = JSON.parse(await readFile(file, 'utf8'));
    const errors = validateValue(manifest, schema, schema);
    if (errors.length === 0) {
      console.log(`OK ${displayPath}`);
    } else {
      failed = true;
      console.error(`ERROR ${displayPath}`);
      for (const error of errors) console.error(`  - ${error}`);
    }
  } catch (error) {
    failed = true;
    console.error(`ERROR ${displayPath}`);
    console.error(`  - ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) process.exitCode = 1;
