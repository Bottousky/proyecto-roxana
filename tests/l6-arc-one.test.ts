import { readFileSync } from 'node:fs';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function includes(source: string, text: string, label: string): void {
  equal(source.includes(text), true, label);
}

const entriesSource = readFileSync(new URL('../src/content/entries.ts', import.meta.url), 'utf8');
const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');

for (const id of [
  'la-chispa-que-se-queda',
  'el-rio-que-se-duerme',
  'el-tic',
  'el-arco-del-rio',
]) {
  includes(entriesSource, `id: '${id}'`, `existe la entrada ${id}`);
}

for (const gate of ['solvedStoredSpark', 'solvedSleepingRiver', 'solvedClock', 'learnedCapacitor']) {
  includes(entriesSource, `f.${gate}`, `la Bitácora usa el gate ${gate}`);
}

includes(entriesSource, 'El capacitor', 'la capa formal nombra el capacitor');
includes(entriesSource, 'circuito RC', 'la capa formal incluye la nota RC');
includes(entriesSource, 'Las cinco reglas del Arco del Río', 'la entrada mayor reúne las reglas');
includes(
  entriesSource,
  'El río ya no es un misterio. Ahora es una herramienta.',
  'la entrada mayor conserva su última reflexión',
);
includes(entriesSource, 'El ojo de cristal', 'la página en blanco planta el Arco II');

includes(roomsSource, "prompt: 'Mirar Ohmdal de noche'", 'la linterna ofrece el cierre');
includes(
  roomsSource,
  "if (f().learnedCapacitor && !f().arcOneCompleted)",
  'el cierre exige comprensión y no se repite',
);

for (const place of [
  'En la plaza, la campana',
  'El Castillo sostiene sus tres distritos',
  'La Forja trabaja en ritmo',
  'Las Terrazas brillan regadas',
  'El Reloj marca y el Faro late',
]) {
  includes(roomsSource, place, `la noche muestra: ${place}`);
}

for (const text of [
  'Cinco lugares. Cinco lecciones. Y la chispa que «se estaba acabando» encendió todo, sin gastarse.',
  '…Quiero estar del otro lado, alguna vez. Quiero que alguien me lo pregunte a MÍ. Con las manos, como hiciste vos.',
  'Yo cuidé esto cuarenta años sin entenderlo. Ustedes lo entendieron en cinco lunas.',
  '…Gracias por no decírmelo en voz alta. Mis mártires van al museo de la Forja. Que aprendan los jóvenes lo que era el miedo.',
  'Inventario final del Consejo: la chispa no disminuyó en cuarenta años. La estábamos guardando para nadie. Caso cerrado.',
  'Registro: red de Ohmdal completa. Estado: viva en el tiempo. Promesa de la primera lección: cumplida.',
  '¿Y a ESE quién lo empuja? Un rayo de luz… ¿empujando un río?',
  'Eso, jóvenes, es de otra noche. La materia que decide. Yo ya tengo bastante con mi latido.',
]) {
  includes(roomsSource, text, `diálogo textual: ${text.slice(0, 42)}`);
}

for (const flag of ['arcOneCompleted', 'sawCrystalEye', 'unit5Completed']) {
  includes(roomsSource, `setFlag('${flag}')`, `el cierre marca ${flag}`);
}

includes(
  roomsSource,
  "title: 'Fin del Arco I — «El Río» · Ohmdal, cinco unidades'",
  'la pantalla final dice Arco I',
);
includes(roomsSource, "variant: 'arc'", 'el cierre usa el peso visual de arco');
includes(roomsSource, "onContinue: () => hooks.goto('hall', { x: 480, y: 300 })", 'Continuar vuelve al hall');

console.log('L6 arc one tests: OK');
