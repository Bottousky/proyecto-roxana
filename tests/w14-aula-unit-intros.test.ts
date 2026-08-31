import { pendingUnitProjector, UNIT2_PROJECTOR_LINES, UNIT3_PROJECTOR_LINES, UNIT4_PROJECTOR_LINES, UNIT5_PROJECTOR_LINES } from '../src/landing/unitProjector.ts';
import { readFileSync } from 'node:fs';
import { state } from '../src/state.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}

equal(UNIT2_PROJECTOR_LINES.some((line) => line.text.includes('UNIDAD DOS: EL RÍO SE REPARTE')), true, 'U2 conserva el título');
equal(UNIT3_PROJECTOR_LINES.some((line) => line.text.includes('UNIDAD TRES')), true, 'U3 conserva el encabezado');
equal(UNIT4_PROJECTOR_LINES.some((line) => line.text.includes('UNIDAD CUATRO')), true, 'U4 conserva el encabezado');
equal(UNIT5_PROJECTOR_LINES.some((line) => line.text.includes('UNIDAD CINCO')), true, 'U5 conserva el encabezado');
equal(UNIT5_PROJECTOR_LINES.every((line) => !line.text.includes('TODO(guion)')), true, 'U5 no inventa las líneas TODO');

state.flags.finished = true;
state.flags.playedUnit2Intro = false;
equal(pendingUnitProjector()?.unit, 2, 'tras U1 falta la intro U2');

state.flags.playedUnit2Intro = true;
state.flags.unit2Completed = true;
state.flags.playedUnit3Intro = false;
equal(pendingUnitProjector()?.unit, 3, 'tras U2 falta la intro U3');

state.flags.playedUnit3Intro = true;
state.flags.unit3Completed = true;
state.flags.playedUnit4Intro = false;
equal(pendingUnitProjector()?.unit, 4, 'tras U3 falta la intro U4');

state.flags.playedUnit4Intro = true;
state.flags.unit4Completed = true;
state.flags.playedUnit5Intro = false;
equal(pendingUnitProjector()?.unit, 5, 'tras U4 falta la intro U5');

const aulas = readFileSync(new URL('../src/landing/aulas.ts', import.meta.url), 'utf8');
equal(aulas.includes('showPendingAulaProjector'), true, 'el aula gráfica dispara la intro pendiente');
equal(aulas.includes('showUnit2ProjectorSequence'), true, 'conserva el wrapper U2');

const school = readFileSync(new URL('../src/landing/school3d.ts', import.meta.url), 'utf8');
equal(school.includes('playPendingUnitIntro'), true, 'el hub 3D dispara la intro al volver a Electrónica');

const landing = readFileSync(new URL('../src/landing/index.ts', import.meta.url), 'utf8');
equal(landing.includes('initAulas'), true, 'la landing monta el aula gráfica');

console.log('W14 aula unit intros: OK');
