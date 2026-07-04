import { HUB_MODULES, hubModuleById, hubModuleState, hubProgress } from '../src/experiences/instituto/hubModel.ts';

function assert(value: unknown, label: string): void {
  if (!value) throw new Error(label);
}

const ids = new Set(HUB_MODULES.map((module) => module.id));
assert(HUB_MODULES.length === 10, 'el hub declara diez módulos');
assert(ids.size === HUB_MODULES.length, 'cada módulo tiene id único');
assert(HUB_MODULES.every((module) => module.area && module.asset), 'cada módulo define layout y asset');

const base = {
  talkedPreceptor: false, hasBitacora: false, sawProjector: false, finished: false,
  unit2Completed: false, unit3Completed: false, unit4Completed: false, unit5Completed: false,
  objetivoActual: '',
};
assert(hubModuleState('preceptoria', base) === 'attention', 'preceptoría llama la atención al inicio');
assert(hubModuleState('bitacora', base) === 'locked', 'Bitácora empieza bloqueada');
assert(hubModuleState('electronica', base) === 'open', 'Electrónica es el mundo inicial');
assert(hubModuleById('programacion').kind === 'world', 'Programación es un mundo modular');
assert(hubProgress({ ...base, finished: true }) === 20, 'un hito de cinco equivale al 20%');

console.log('I4 web hub model tests: OK');
