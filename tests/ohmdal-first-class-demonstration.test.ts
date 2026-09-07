import assert from 'node:assert/strict';
import { createInitialCircuit } from '../src/experiences/ohmdal-plaza/simulation/circuitSolver.ts';
import { createFirstClassPracticeModel } from '../src/experiences/ohmdal-playcanvas/systems/story/firstClassPracticeModel.ts';

const campaignCircuit = createInitialCircuit();
const campaignBefore = JSON.stringify(campaignCircuit);
const model = createFirstClassPracticeModel();

const observed = model.getReadout();
assert.equal(model.phase, 'observe');
assert.equal(model.sourceSnapshot.relayClosed, true, 'la réplica arranca con relé cerrado');
assert.equal(model.sourceSnapshot.contactClean, true, 'la réplica arranca con contacto limpio');
assert.equal(model.sourceSnapshot.returnOpen, true, 'la observación arranca con retorno abierto');
assert.equal(Object.isFrozen(model.sourceSnapshot), true, 'la evidencia inicial es inmutable');
assert.equal(observed.bridgeClosed, false);
assert.equal(observed.current, 0, 'el retorno abierto no conduce');
assert.equal(observed.lightOn, false, 'la práctica permanece apagada con el retorno abierto');
assert.equal(model.verified, false);

model.setPhase('verify');
assert.equal(model.verified, false, 'verificar sin intervención no acepta una solución');
assert.equal(model.getReadout().current, 0);

model.setPhase('operate');
const operated = model.getReadout();
assert.equal(operated.bridgeClosed, true, 'operar cierra el puente visible');
assert.equal(operated.complete, true, 'el solver local reconoce el lazo cerrado');
assert.ok(operated.current > 0, 'el solver produce corriente tras cerrar el retorno');
assert.equal(operated.lightOn, true, 'la luz de práctica deriva del estado resuelto');
assert.equal(model.sourceSnapshot.current, 0, 'la evidencia de observación no se reescribe al operar');
assert.equal(model.sourceSnapshot.returnOpen, true);

model.setPhase('verify');
assert.equal(model.verified, true, 'la verificación sólo pasa después de resolver la réplica');
assert.equal(model.getReadout().status, 'Continuidad Excelente (Baja R)');

model.reset();
assert.equal(model.phase, 'observe');
assert.equal(model.getReadout().bridgeClosed, false);
assert.equal(model.getReadout().current, 0);
assert.equal(model.verified, false);
assert.equal(JSON.stringify(campaignCircuit), campaignBefore, 'la réplica no muta el circuito de campaña');

console.log('Ohmdal first-class demonstration model: OK');
