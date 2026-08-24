import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialCircuit, solveCircuit, measureBetween } from '../src/experiences/ohmdal-plaza/simulation/circuitSolver.ts';
import { GalvanoscopeTool } from '../src/experiences/ohmdal-plaza/tools/galvanoscope.ts';
import { BitacoraManager } from '../src/experiences/ohmdal-plaza/journal/bitacora.ts';
import { WorkbenchInspector } from '../src/experiences/ohmdal-plaza/inspect/workbench.ts';
import { DIALOGUE_DATABASE } from '../src/experiences/ohmdal-plaza/story/dialogueData.ts';

describe('Ohmdal PlayCanvas · Outer Wilds Architecture Tests', () => {
  it('Pilar II: Simulación de circuito determinista en reposo (Lazo abierto)', () => {
    const circuit = createInitialCircuit();
    const solved = solveCircuit(circuit);

    // Initial state: Knife switch open, breach open, verdigris corrosion high
    assert.equal(solved.fountainActive, false);
    assert.equal(solved.relayEnergized, false);
    assert.equal(solved.gateOpen, false);
    assert.equal(solved.nodes['portal_pos'].voltage, 24.0);
    assert.equal(solved.nodes['portal_neg'].voltage, 0.0);
  });

  it('Pilar II: Resolución física de circuito al cerrar lazo (Restauración de corriente)', () => {
    let circuit = createInitialCircuit();

    // 1. Close bell latching relay
    circuit.branches.b_ida_rele.state = 'closed';
    // 2. Install copper jumper in the breach
    circuit.branches.b_brecha_retorno.state = 'closed';
    // 3. Scrape corrosion (drop parasitic resistance to 0.05 ohms)
    circuit.branches.b_brecha_a_oxido.state = 'closed';
    circuit.branches.b_brecha_a_oxido.resistance = 0.05;

    const solved = solveCircuit(circuit);

    assert.equal(solved.fountainActive, true, 'La fuente de Ohm debe activarse');
    assert.equal(solved.relayEnergized, true, 'El relé debe estar energizado');
    assert.equal(solved.gateOpen, true, 'El solenoide de la puerta debe activarse');
    assert.ok(solved.branches.b_oxido_a_portal.current > 1.0, 'La corriente de retorno debe ser > 1A');
  });

  it('Pilar II: Omega permanece cerrada hasta energizar el relé de la Campana', () => {
    const circuit = createInitialCircuit();
    circuit.branches.b_brecha_retorno.state = 'closed';
    circuit.branches.b_brecha_a_oxido.state = 'closed';
    circuit.branches.b_brecha_a_oxido.resistance = 0.05;

    const returnRestored = solveCircuit(circuit);
    assert.equal(returnRestored.fountainActive, true, 'el lazo restaurado puede alimentar la fuente');
    assert.equal(returnRestored.relayEnergized, false, 'el relé sigue abierto antes de la Campana');
    assert.equal(returnRestored.gateOpen, false, 'Omega no omite la tercera acción del circuito');

    returnRestored.branches.b_ida_rele.state = 'closed';
    const relayLatched = solveCircuit(returnRestored);
    assert.equal(relayLatched.relayEnergized, true);
    assert.equal(relayLatched.gateOpen, true, 'Omega abre cuando el relé queda energizado');
  });

  it('Pilar III: Galvanoscopio de Lumen mide diferencias de potencial y resistencia', () => {
    const circuit = createInitialCircuit();
    const tool = new GalvanoscopeTool();

    // Measure across portal power source (+ and -)
    const resA = tool.connectProbe('portal_pos', circuit);
    assert.equal(resA.probeConnected, 'A');

    const resB = tool.connectProbe('portal_neg', circuit);
    assert.equal(resB.probeConnected, 'B');
    assert.equal(resB.result?.deltaV, 24.0);
    assert.equal(tool.getState().measuredVoltage, 24.0);

    const m = measureBetween(circuit, 'portal_pos', 'portal_neg');
    assert.equal(m.deltaV, 24.0);
  });

  it('Pilar IV: Cuaderno de Edda registra rumores y deducciones científicas del viaje', () => {
    const bitacora = new BitacoraManager();
    const rumors = bitacora.getRumors();
    assert.equal(rumors['portal_origen']?.status, 'discovered');

    // Despertar de Ohm
    bitacora.unlock('despertar_ohm', 'discovered');
    assert.equal(bitacora.getRumors()['despertar_ohm']?.status, 'discovered');

    // Asombro de Edda y Taller de Lumen
    bitacora.unlock('asombro_edda', 'discovered');
    bitacora.unlock('taller_lumen', 'discovered');
    assert.equal(bitacora.getRumors()['taller_lumen']?.status, 'discovered');

    // Manantial y Paralelismo Hidráulico-Eléctrico
    bitacora.unlock('manantial_central_hidraulica', 'discovered');
    bitacora.unlock('analogia_potencial', 'discovered');
    assert.equal(bitacora.getRumors()['manantial_central_hidraulica']?.status, 'discovered');
    assert.equal(bitacora.getRumors()['analogia_potencial']?.status, 'discovered');

    const progress = bitacora.getProgress();
    assert.ok(progress.discovered >= 5);
  });

  it('Narrativa: Grafo de diálogos contiene toda la secuencia del viaje de Ohmdal', () => {
    assert.ok(DIALOGUE_DATABASE['intro_portal_edda'], 'Debe existir diálogo de recepción de Edda');
    assert.ok(DIALOGUE_DATABASE['ohm_awakening_event'], 'Debe existir diálogo del despertar de Ohm');
    assert.ok(DIALOGUE_DATABASE['edda_surprised_awakening'], 'Debe existir diálogo de asombro de Edda');
    assert.ok(DIALOGUE_DATABASE['lumen_workshop_interior'], 'Debe existir diálogo en el interior del taller de Lumen');
    assert.ok(DIALOGUE_DATABASE['circuit_solved_dialog'], 'Debe existir diálogo de apertura de la Gran Puerta');
    assert.ok(DIALOGUE_DATABASE['manantial_overlook_dialog'], 'Debe existir diálogo de la central hidroeléctrica del Manantial');

    // Verify dialogue structure
    assert.equal(DIALOGUE_DATABASE['intro_portal_edda']?.lines[0]?.who, 'Edda');
    assert.equal(DIALOGUE_DATABASE['ohm_awakening_event']?.lines[0]?.who, 'Ohm');
    assert.equal(DIALOGUE_DATABASE['edda_surprised_awakening']?.lines[0]?.who, 'Edda');
    assert.equal(DIALOGUE_DATABASE['lumen_workshop_interior']?.lines[0]?.who, 'Lumen');
  });

  it('Física: Paralelismo Hidráulico-Eléctrico (Altura = Potencial, Caudal = Corriente)', () => {
    const rho = 1000; // kg/m^3 (agua)
    const g = 9.8; // m/s^2
    const deltaH = 18.0; // metros de caída desde la montaña
    const deltaP = rho * g * deltaH; // Presión hidrostática en Pa

    assert.equal(deltaP, 176400, 'La presión hidrostática debe ser 176.4 kPa');

    // Analogía: La diferencia de presión deltaP mueve caudal Q (m^3/s) con resistencia hidráulica R_h
    // La diferencia de potencial deltaV mueve corriente I (A) con resistencia eléctrica R
    const deltaV = 24.0; // Voltios del generador hidroeléctrico
    const rLazo = 8.45; // Ohmios de la red restaurada
    const corrienteRegimen = deltaV / rLazo;

    assert.ok(corrienteRegimen > 2.8 && corrienteRegimen < 2.9, 'La corriente debe ser aprox 2.84 A');
  });

  it('Relic Workbench: Cuchilla, cepillo de alambre y barra puente', () => {
    const wb = new WorkbenchInspector();
    wb.open('cuadro_rele');
    assert.equal(wb.getTarget(), 'cuadro_rele');

    const closed = wb.toggleKnifeSwitch();
    assert.equal(closed, true);
    assert.equal(wb.getState().knifeSwitchClosed, true);
  });
});
