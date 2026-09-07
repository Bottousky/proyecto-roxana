import {
  createInitialCircuit,
  measureBetween,
  solveCircuit,
} from '../../../ohmdal-plaza/simulation/circuitSolver.ts';
import type { CircuitState } from '../../../ohmdal-plaza/types.ts';

export type FirstClassDemonstrationPhase = 'observe' | 'operate' | 'verify';

export interface FirstClassSourceSnapshot {
  readonly relayClosed: boolean;
  readonly contactClean: boolean;
  readonly returnOpen: boolean;
  readonly voltage: number;
  readonly resistance: number;
  readonly current: number;
  readonly status: string;
}

export interface FirstClassPracticeReadout {
  readonly phase: FirstClassDemonstrationPhase;
  readonly voltage: number;
  readonly resistance: number;
  readonly current: number;
  readonly status: string;
  readonly bridgeClosed: boolean;
  readonly lightOn: boolean;
  readonly complete: boolean;
}

export interface FirstClassPracticeModel {
  readonly sourceSnapshot: FirstClassSourceSnapshot;
  readonly phase: FirstClassDemonstrationPhase;
  readonly verified: boolean;
  getReadout(): FirstClassPracticeReadout;
  setPhase(phase: FirstClassDemonstrationPhase): void;
  reset(): void;
}

function buildPracticeCircuit(): CircuitState {
  const circuit = createInitialCircuit();
  // This fixture teaches the already-known return path locally. It does not
  // reuse or receive the campaign circuit reference.
  circuit.branches.b_ida_rele.state = 'closed';
  circuit.branches.b_brecha_a_oxido.state = 'closed';
  circuit.branches.b_brecha_a_oxido.resistance = 0.05;
  circuit.branches.b_brecha_retorno.state = 'open';
  return solveCircuit(circuit);
}

function readPracticeCircuit(
  circuit: CircuitState,
  phase: FirstClassDemonstrationPhase,
): FirstClassPracticeReadout {
  const gap = measureBetween(circuit, 'retorno_brecha_a', 'retorno_brecha_b');
  const bridgeClosed = circuit.branches.b_brecha_retorno.state === 'closed';
  const complete = Boolean(circuit.isComplete && circuit.fountainActive && gap.current > 0);
  return {
    phase,
    voltage: gap.deltaV,
    resistance: gap.resistance,
    current: gap.current,
    status: gap.status,
    bridgeClosed,
    lightOn: complete,
    complete,
  };
}

function snapshotSource(circuit: CircuitState): FirstClassSourceSnapshot {
  const readout = readPracticeCircuit(circuit, 'observe');
  return Object.freeze({
    relayClosed: circuit.branches.b_ida_rele.state === 'closed',
    contactClean: circuit.branches.b_brecha_a_oxido.state === 'closed'
      && circuit.branches.b_brecha_a_oxido.resistance < 1,
    returnOpen: circuit.branches.b_brecha_retorno.state === 'open',
    voltage: readout.voltage,
    resistance: readout.resistance,
    current: readout.current,
    status: readout.status,
  });
}

/**
 * Renderer-agnostic C4 fixture model. It deliberately owns a copy of the
 * Plaza circuit, so the scene can demonstrate an open return and its repair
 * without granting campaign progress or mutating the player's circuit.
 */
export function createFirstClassPracticeModel(): FirstClassPracticeModel {
  let circuit = buildPracticeCircuit();
  const sourceSnapshot = snapshotSource(circuit);
  let phase: FirstClassDemonstrationPhase = 'observe';
  let verified = false;

  const reset = (): void => {
    circuit = buildPracticeCircuit();
    phase = 'observe';
    verified = false;
  };

  const setPhase = (nextPhase: FirstClassDemonstrationPhase): void => {
    phase = nextPhase;
    if (nextPhase === 'observe') {
      reset();
      return;
    }

    if (nextPhase === 'operate') {
      circuit.branches.b_brecha_retorno.state = 'closed';
      circuit = solveCircuit(circuit);
      verified = false;
      return;
    }

    const readout = readPracticeCircuit(circuit, nextPhase);
    verified = readout.complete;
  };

  return {
    sourceSnapshot,
    get phase() { return phase; },
    get verified() { return verified; },
    getReadout: () => readPracticeCircuit(circuit, phase),
    setPhase,
    reset,
  };
}
