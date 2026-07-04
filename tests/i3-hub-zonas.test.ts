import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseZonas, zonaEn, muroRects, type Zona } from '../src/experiences/instituto/zonaModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function ok(cond: boolean, label: string): void {
  if (!cond) throw new Error(`${label}: condición falsa`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.resolve(__dirname, '../assets/hub/escuela.json');
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const MAP_W = 1280;
const MAP_H = 1024;

const { spawn, zonas } = parseZonas(map);
ok(spawn.x >= 0 && spawn.x <= MAP_W, 'spawn dentro del mapa (x)');
ok(spawn.y >= 0 && spawn.y <= MAP_H, 'spawn dentro del mapa (y)');

ok(zonas.length >= 10, 'hay al menos 10 zonas (sin contar el spawn)');

const NOMBRES_ESPERADOS = [
  'preceptoria',
  'direccion',
  'biblioteca',
  'audiovisual',
  'muro_progreso',
  'puerta_electronica',
  'puerta_bitland',
  'puerta_physica',
  'puerta_arithmos',
  'escalera',
];
const porNombre = new Map<string, Zona>(zonas.map((z) => [z.nombre, z]));
for (const nombre of NOMBRES_ESPERADOS) {
  ok(porNombre.has(nombre), `falta la zona "${nombre}"`);
}

const TIPOS_VALIDOS = new Set(['overlay', 'mundo', 'dialogo', 'bloqueado']);
const TRIGGERS_VALIDOS = new Set(['enter', 'interact']);
for (const z of zonas) {
  ok(TIPOS_VALIDOS.has(z.tipo), `zona "${z.nombre}": tipo válido`);
  ok(TRIGGERS_VALIDOS.has(z.trigger), `zona "${z.nombre}": trigger válido`);
}

equal(porNombre.get('biblioteca')!.trigger, 'enter', 'biblioteca es trigger enter');
equal(porNombre.get('audiovisual')!.trigger, 'enter', 'audiovisual es trigger enter');
equal(porNombre.get('puerta_electronica')!.tipo, 'mundo', 'puerta_electronica es tipo mundo');
equal(porNombre.get('puerta_electronica')!.target, 'aula', 'puerta_electronica target aula');

const bibRect = porNombre.get('biblioteca')!.rect;
const bibCx = bibRect.x + bibRect.w / 2;
const bibCy = bibRect.y + bibRect.h / 2;
const zonaBib = zonaEn(zonas, bibCx, bibCy);
ok(zonaBib !== null && zonaBib.nombre === 'biblioteca', 'zonaEn en el centro de biblioteca devuelve biblioteca');

const zonaSpawn = zonaEn(zonas, spawn.x, spawn.y);
ok(
  zonaSpawn === null || zonaSpawn.tipo !== 'overlay',
  'el spawn no cae dentro de una zona overlay',
);

const muros = muroRects(map);
ok(muros.length > 0, 'muroRects devuelve al menos un rect');
for (const r of muros) {
  ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= MAP_W && r.y + r.h <= MAP_H, 'rect de muro dentro del mapa');
}

for (const z of zonas) {
  const { rect } = z;
  ok(
    rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= MAP_W && rect.y + rect.h <= MAP_H,
    `zona "${z.nombre}" dentro de los límites del mapa`,
  );
}

console.log('I3 hub zonas tests: OK');
