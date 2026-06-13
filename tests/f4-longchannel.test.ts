import { readFileSync } from 'node:fs';
import {
  LONG_CHANNEL_PUSHES,
  addLongChannelStone,
  attemptLongChannel,
  createLongChannelState,
  evaluateLongChannel,
  removeLongChannelStone,
  repairLongChannel,
  setLongChannelPush,
} from '../src/puzzles/longchannelModel.ts';
import { longChannelSolvedDialogue } from '../src/puzzles/longchannelDialogue.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

equal(LONG_CHANNEL_PUSHES.join('/'), '4/8/16', 'el banco ofrece cristales 4/8/16');

const pathA = evaluateLongChannel(4, ['marron']);
equal(pathA.resistance, 1, 'A: la piedra marrón frena 1');
equal(pathA.river, 4, 'A: río = empuje / piedras');
equal(pathA.delivery, 16, 'A: entrega = empuje por río');
equal(pathA.exactDelivery, true, 'A entrega exactamente 16');
equal(pathA.level, 'rojo', 'A pone el canal angosto al rojo');
equal(pathA.valid, false, 'A no resuelve aunque la entrega sea correcta');

const pathB = evaluateLongChannel(16, ['gris', 'gris']);
equal(pathB.resistance, 16, 'B: los frenos gris+gris en fila se suman');
equal(pathB.river, 1, 'B: río 1');
equal(pathB.delivery, 16, 'B: entrega 16');
equal(pathB.level, 'frio', 'B deja el canal frío');
equal(pathB.valid, true, 'B resuelve');

const pathC = evaluateLongChannel(8, ['amarilla']);
equal(pathC.resistance, 4, 'C: piedra amarilla frena 4');
equal(pathC.river, 2, 'C: río 2');
equal(pathC.delivery, 16, 'C: entrega = empuje por río');
equal(pathC.level, 'tibio', 'C deja el canal tibio al límite');
equal(pathC.valid, true, 'C resuelve');

const sharedDialogue =
  'El río no se gasta. El río trabaja. Y el trabajo se paga. …Por fin alguien que lo dice con números.»<br/>' +
  '<b>Edda:</b> «Mucho empuje, poco río: la misma entrega con menos peaje. ¿Por eso los Maestros subían el empuje para los caminos largos…?»<br/>' +
  '<b>Ohm:</b> «Hipótesis: correcta. Alcance: más grande de lo que crees.»';

equal(
  longChannelSolvedDialogue(pathB.level),
  '<b>El horno lejano respira.</b> Yesca apoya la mano en el canal y la deja ahí.<br/><br/>' +
    '<b>Yesca:</b> «Frío. El horno a fuego pleno y el canal frío.<br/>' +
    sharedDialogue,
  'B cierra con canal frío y conserva la secuencia común',
);
equal(
  longChannelSolvedDialogue(pathC.level),
  '<b>El horno lejano respira.</b> Yesca apoya la mano en el canal y la deja ahí.<br/><br/>' +
    '<b>Yesca:</b> «Tibio. Apenas tibio, con el horno a fuego pleno. Treinta años creyendo que esto no se podía.<br/>' +
    sharedDialogue,
  'C cierra con canal tibio y conserva la secuencia común',
);

const row = evaluateLongChannel(16, ['marron', 'roja', 'amarilla', 'gris']);
equal(row.resistance, 15, 'toda la fila de piedras suma sus frenos');
equal(row.delivery, 16 * row.river, 'la entrega siempre es empuje por río');

let discoveries = createLongChannelState();
discoveries = setLongChannelPush(discoveries, 16);
discoveries = addLongChannelStone(discoveries, 'gris');
discoveries = addLongChannelStone(discoveries, 'gris');
let result = attemptLongChannel(discoveries);
equal(result.event, 'valid', 'hallar B produce una entrega válida');
equal(result.state.foundCold, true, 'hallar B registra el camino frío');
equal(result.state.foundWarm, false, 'B solo no registra C');

discoveries = removeLongChannelStone(result.state, 1);
discoveries = removeLongChannelStone(discoveries, 0);
equal(discoveries.stones.length, 0, 'las piedras se pueden quitar de la fila');
discoveries = setLongChannelPush(discoveries, 8);
discoveries = addLongChannelStone(discoveries, 'amarilla');
result = attemptLongChannel(discoveries);
equal(result.state.foundWarm, true, 'hallar C registra el camino tibio');
equal(result.state.foundCold, true, 'hallar C conserva el camino frío de la sesión');

let cut = createLongChannelState();
cut = addLongChannelStone(cut, 'marron');
result = attemptLongChannel(cut);
equal(result.event, 'red-warning', 'primera insistencia al rojo avisa');
result = attemptLongChannel(result.state);
equal(result.event, 'red-warning', 'segunda insistencia al rojo avisa');
result = attemptLongChannel(result.state);
equal(result.event, 'cut', 'tercera insistencia al rojo corta el canal');
equal(result.state.channel.cut, true, 'el modelo conserva el canal cortado');

cut = repairLongChannel(result.state);
equal(cut.channel.cut, false, 'Yesca reempalma el canal');
equal(cut.channel.insistences, 0, 'el reempalme reinicia las insistencias');
equal(cut.repairs, 1, 'el reempalme cuenta para los comentarios');
cut = setLongChannelPush(cut, 8);
cut = { ...cut, stones: [] };
cut = addLongChannelStone(cut, 'amarilla');
result = attemptLongChannel(cut);
equal(result.event, 'valid', 'el reempalme no bloquea una solución posterior');

const roomsSource = readFileSync(new URL('../src/game/rooms.ts', import.meta.url), 'utf8');
const puzzleSource = readFileSync(
  new URL('../src/puzzles/longchannel.ts', import.meta.url),
  'utf8',
);
const dialogueSource = readFileSync(
  new URL('../src/puzzles/longchannelDialogue.ts', import.meta.url),
  'utf8',
);
const puzzleText = puzzleSource + dialogueSource;

equal(
  roomsSource.includes("import { abrirLongChannel } from '../puzzles/longchannel';"),
  true,
  'rooms importa F4',
);
equal(
  roomsSource.includes("setFlag('solvedLongChannel')"),
  true,
  'F4 marca solvedLongChannel',
);
equal(
  roomsSource.includes("notifyNewEntry('La Entrega')"),
  true,
  'F4 notifica La Entrega',
);
equal(
  roomsSource.includes('practica: f().solvedLongChannel'),
  true,
  'F4 reabre en modo práctica',
);
equal(
  puzzleSource.includes('longChannelSolvedDialogue(result.evaluation.level)'),
  true,
  'el banco elige el cierre según el nivel del camino resuelto',
);

for (const text of [
  'Mi horno. El bueno. Lleva años frío porque cada vez que lo alimentamos, el canal se pone al rojo a mitad de camino.',
  'No se puede cambiar el canal. Pasa por abajo de media Forja. O lo alimentas con ESE cable, o no hay horno.',
  'Río suficiente para el horno, por un canal que no aguanta río… Suena a trampa.',
  'Reformulación: entrega suficiente. La entrega viaja de más de una manera.',
]) {
  equal(roomsSource.includes(text), true, `diálogo textual de apertura F4: ${text.slice(0, 38)}`);
}

for (const text of [
  'ENTREGA 16',
  'Una.',
  'Dos. Me estás cobrando el favor.',
  'Tres. La próxima lo reempalmas tú.',
  'Misma entrega. Peaje distinto. Yesca prefiere el frío.',
  'Frío. El horno a fuego pleno y el canal frío.',
  'Tibio. Apenas tibio, con el horno a fuego pleno. Treinta años creyendo que esto no se podía.',
  'El río no se gasta. El río trabaja. Y el trabajo se paga. …Por fin alguien que lo dice con números.',
  'Mucho empuje, poco río: la misma entrega con menos peaje. ¿Por eso los Maestros subían el empuje para los caminos largos…?',
  'Hipótesis: correcta. Alcance: más grande de lo que crees.',
]) {
  equal(puzzleText.includes(text), true, `texto textual del banco F4: ${text.slice(0, 38)}`);
}

equal(
  (puzzleSource.match(/thermometerSVG/g) ?? []).length >= 3,
  true,
  'el Canal Largo muestra termómetro en tres puntos',
);

console.log('F4 long channel tests: OK');
