import { createInitialCircuit, solveCircuit, measureBetween } from '../src/experiences/ohmdal-plaza/simulation/circuitSolver.ts';
import { BitacoraManager } from '../src/experiences/ohmdal-plaza/journal/bitacora.ts';
import { WorkbenchInspector } from '../src/experiences/ohmdal-plaza/inspect/workbench.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

// 1. Initial Circuit State
const initialCircuit = createInitialCircuit();
assert(!initialCircuit.isComplete, 'Circuito inicial debe estar incompleto (brecha abierta y óxido)');
assert(!initialCircuit.fountainActive, 'La fuente de agua debe estar inerte al inicio');
assert(!initialCircuit.gateOpen, 'La Gran Puerta de Ohm debe estar cerrada al inicio');
assert(!initialCircuit.relayEnergized, 'El relé de la campana empieza desenergizado');

// 2. Galvanoscope Measurements in Initial State
const mSourceToGround = measureBetween(initialCircuit, 'portal_pos', 'portal_neg');
assert(Math.abs(mSourceToGround.deltaV - 24) < 0.1, 'Diferencia de potencial en bornes del Portal debe ser 24V');

const mBreach = measureBetween(initialCircuit, 'retorno_brecha_a', 'retorno_brecha_b');
assert(mBreach.resistance > 10000, 'La brecha sin puente debe medir resistencia infinita / circuito abierto');

// 3. Step-by-Step Restoration
// Step A: Close bell relay switch
initialCircuit.branches.b_ida_rele.state = 'closed';
let stateA = solveCircuit(initialCircuit);
assert(stateA.relayEnergized === false, 'El relé no se enclava si el lazo de retorno sigue abierto');

// Step B: Install copper jumper bridge
initialCircuit.branches.b_brecha_retorno.state = 'closed';
let stateB = solveCircuit(initialCircuit);
assert(!stateB.isComplete, 'Cerrar la brecha aún no completa el circuito debido a la capa de óxido de 2400Ω');

// Step C: Scrape oxide / corrosion off contacts
initialCircuit.branches.b_brecha_a_oxido.state = 'closed';
initialCircuit.branches.b_brecha_a_oxido.resistance = 0.05;
let stateFinal = solveCircuit(initialCircuit);

assert(stateFinal.isComplete, 'Con puente y óxido limpio, el camino está completo');
assert(stateFinal.fountainActive, 'La bomba de la fuente debe activarse con corriente nominal');
assert(stateFinal.gateOpen, 'El actuador solenoide debe abrir la Gran Puerta de Ohm');

// Step D: Galvanoscope Measurement in Restored State
const mBreachFixed = measureBetween(stateFinal, 'retorno_brecha_a', 'retorno_brecha_b');
assert(mBreachFixed.resistance < 0.2, 'Con la barra colocada, la resistencia de la brecha debe ser cercana a 0.05Ω');

// 4. Bitacora Rumor Graph
const bitacora = new BitacoraManager();
const rumors = bitacora.getRumors();
assert(rumors.portal_origen.status === 'discovered', 'El Portal inicia descubierto');
assert(rumors.brecha_sagrada.status === 'unknown', 'La brecha inicia desconocida');

bitacora.unlock('brecha_sagrada', 'discovered');
bitacora.unlock('moho_verde', 'discovered');
bitacora.unlock('ley_retorno', 'discovered');

const progress = bitacora.getProgress();
assert(progress.discovered >= 4, 'Progreso de misterios descubiertos debe actualizarse');
assert(progress.percentage >= Math.round((4 / progress.total) * 100), 'Porcentaje debe reflejar misterios comprendidos');

// 5. Workbench Inspector
const workbench = new WorkbenchInspector();
assert(workbench.getTarget() === null, 'Workbench inicia cerrado');
workbench.open('cuadro_rele');
assert(workbench.getTarget() === 'cuadro_rele', 'Workbench abre el cuadro de relé');

const sw1 = workbench.toggleKnifeSwitch();
assert(sw1 === true, 'Interruptor de cuchilla conmuta a cerrado');
assert(workbench.getState().knifeSwitchClosed === true, 'Estado del inspector refleja interruptor cerrado');

workbench.scrapeCorrosion();
assert(workbench.getState().corrosionScraped === true, 'Estado refleja óxido limpiado');

workbench.installJumper();
assert(workbench.getState().jumperInstalled === true, 'Estado refleja puente instalado');

workbench.close();
assert(workbench.getTarget() === null, 'Workbench cierra correctamente');

console.log('hd2d-plaza-greenfield tests: OK');
