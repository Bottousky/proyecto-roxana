import { readFileSync } from 'node:fs';
import { ARC_PANORAMA_ZONES } from '../src/ui/arcPanorama.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function includes(source: string, text: string, label: string): void {
  equal(source.includes(text), true, label);
}

const entriesSource = readFileSync(new URL('../src/content/entries.ts', import.meta.url), 'utf8');
const roomsSource = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const panoramaSource = readFileSync(new URL('../src/ui/arcPanorama.ts', import.meta.url), 'utf8');
const stylesSource = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

equal(
  ARC_PANORAMA_ZONES.map((zone) => zone.label).join(','),
  'Plaza,Castillo,Forja,Terrazas,Reloj,Faro',
  'la panorámica enciende las seis zonas en orden',
);
includes(panoramaSource, 'world-map-panel-1024.png', 'la panorámica usa el mapa canónico');
includes(panoramaSource, "root.setAttribute('role', 'dialog')", 'el overlay expone role dialog');
includes(panoramaSource, "root.setAttribute('aria-modal', 'true')", 'el overlay es modal accesible');
includes(panoramaSource, '>Continuar</button>', 'Continuar está disponible desde el inicio');
includes(panoramaSource, 'index * 450', 'la secuencia completa dura menos de cinco segundos');
includes(panoramaSource, 'prefers-reduced-motion: reduce', 'la lógica respeta reduced motion');
includes(panoramaSource, 'timers.forEach', 'el cleanup cancela todos los timers');
includes(panoramaSource, 'root.remove()', 'el cleanup elimina el DOM del overlay');
includes(panoramaSource, 'popUI()', 'el cleanup libera el bloqueo de exploración');
includes(stylesSource, 'aspect-ratio: 4 / 3', 'el mapa conserva una relación 4:3 responsive');
includes(stylesSource, '@media (max-aspect-ratio: 4 / 3)', 'el overlay se adapta a pantallas 4:3');
includes(stylesSource, '@media (prefers-reduced-motion: reduce)', 'CSS elimina animaciones reducidas');

for (const id of ['dos-caminos-lago', 'reloj-entrega-dc', 'cierre-dc-del-faro']) {
  includes(entriesSource, `id: '${id}'`, `existe la entrada ${id}`);
}

for (const gate of ['solvedLakeFeedDc', 'solvedClockDriveDc', 'solvedLighthouseDistributionDc']) {
  includes(entriesSource, `f.${gate}`, `la Bitácora usa el gate ${gate}`);
}

includes(entriesSource, 'distribución', 'la capa formal nombra la distribución');

includes(roomsSource, "prompt: 'Mirar Ohmdal de noche'", 'la linterna ofrece el cierre');
includes(
  roomsSource,
  "if (f().solvedLighthouseDistributionDc && !f().arcOneCompleted)",
  'el cierre exige comprensión y no se repite',
);
equal(
  roomsSource.indexOf('showArcPanorama(() => {') < roomsSource.indexOf("L('', 'TODO(guion): epílogo final pendiente."),
  true,
  'cerrarArcoUno muestra la panorámica antes del diálogo existente',
);

for (const place of [
  'En la plaza, la campana',
  'El Castillo sostiene sus tres distritos',
  'La Forja trabaja en ritmo',
  'Las Terrazas brillan regadas',
  'El Reloj marca y el Faro distribuye luz',
]) {
  includes(roomsSource, place, `la noche muestra: ${place}`);
}

for (const text of [
  'Yo cuidé esto cuarenta años sin entenderlo. Ustedes lo entendieron en cinco lunas.',
  '…Gracias por no decírmelo en voz alta. Mis mártires van al museo de la Forja. Que aprendan los jóvenes lo que era el miedo.',
  'Registro: red de Ohmdal completa. Estado: servicios distribuidos y documentados.',
]) {
  includes(roomsSource, text, `diálogo textual: ${text.slice(0, 42)}`);
}

for (const flag of ['arcOneCompleted', 'unit5Completed']) {
  includes(roomsSource, `setFlag('${flag}')`, `el cierre marca ${flag}`);
}

includes(
  roomsSource,
  "title: 'Fin del Arco I — Ohmdal'",
  'la pantalla final dice Arco I',
);
includes(roomsSource, "variant: 'arc'", 'el cierre usa el peso visual de arco');
includes(roomsSource, "onContinue: () => { announceCinematic('instituto-return'); window.location.href = portalExitUrl(); }", 'Continuar anuncia y vuelve al aula isométrica');

console.log('L6 arc one tests: OK');
