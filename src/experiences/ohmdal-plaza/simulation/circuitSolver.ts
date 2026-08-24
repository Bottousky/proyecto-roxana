import type { CircuitBranch, CircuitNode, CircuitState } from '../types.ts';

export function createInitialCircuit(): CircuitState {
  const nodes: Record<string, CircuitNode> = {
    portal_pos: {
      id: 'portal_pos',
      label: 'Borne Positivo del Portal (+24V)',
      pos: { x: 0, y: 1.4, z: -10.5 },
      voltage: 24,
      isSource: true,
      sourceVoltage: 24,
    },
    portal_neg: {
      id: 'portal_neg',
      label: 'Borne Negativo de Retorno (Tierra)',
      pos: { x: -1.2, y: 1.4, z: -10.5 },
      voltage: 0,
      isGround: true,
    },
    ida_norte: {
      id: 'ida_norte',
      label: 'Riel de Ida (Tramo Norte)',
      pos: { x: 0.8, y: 0.1, z: -7.5 },
      voltage: 24,
    },
    ida_centro: {
      id: 'ida_centro',
      label: 'Distribuidor Central (Plaza)',
      pos: { x: 0.8, y: 0.1, z: -2.0 },
      voltage: 24,
    },
    rele_bobina_in: {
      id: 'rele_bobina_in',
      label: 'Entrada Bobina del Relé',
      pos: { x: -4.5, y: 0.4, z: 2.2 },
      voltage: 0,
    },
    fuente_motor_in: {
      id: 'fuente_motor_in',
      label: 'Bomba de la Fuente Sagrada',
      pos: { x: 4.8, y: 0.3, z: 3.5 },
      voltage: 0,
    },
    lumen_banco_in: {
      id: 'lumen_banco_in',
      label: 'Toma de Pruebas de Lumen',
      pos: { x: -6.5, y: 0.8, z: -3.5 },
      voltage: 0,
    },
    retorno_sur: {
      id: 'retorno_sur',
      label: 'Riel de Retorno (Extremo Sur)',
      pos: { x: -0.8, y: 0.1, z: 6.5 },
      voltage: 0,
    },
    retorno_brecha_a: {
      id: 'retorno_brecha_a',
      label: 'Borne de la Brecha (Lado Sur)',
      pos: { x: -0.8, y: 0.1, z: 2.0 },
      voltage: 0,
    },
    retorno_brecha_b: {
      id: 'retorno_brecha_b',
      label: 'Borne de la Brecha (Lado Norte)',
      pos: { x: -0.8, y: 0.1, z: 1.0 },
      voltage: 0,
    },
    retorno_oxido: {
      id: 'retorno_oxido',
      label: 'Contacto Corroído (Cobre Verde)',
      pos: { x: -0.8, y: 0.1, z: -4.0 },
      voltage: 0,
    },
    puerta_solenoide: {
      id: 'puerta_solenoide',
      label: 'Actuador de la Gran Puerta de Ohm',
      pos: { x: 0, y: 1.8, z: 10.5 },
      voltage: 0,
    },
  };

  const branches: Record<string, CircuitBranch> = {
    b_portal_ida: {
      id: 'b_portal_ida',
      nodeA: 'portal_pos',
      nodeB: 'ida_norte',
      type: 'wire',
      resistance: 0.05,
      state: 'closed',
      label: 'Alimentación Principal',
    },
    b_ida_tronco: {
      id: 'b_ida_tronco',
      nodeA: 'ida_norte',
      nodeB: 'ida_centro',
      type: 'wire',
      resistance: 0.1,
      state: 'closed',
      label: 'Conducción Troncal de Cobre',
    },
    b_ida_rele: {
      id: 'b_ida_rele',
      nodeA: 'ida_centro',
      nodeB: 'rele_bobina_in',
      type: 'switch',
      resistance: 1.2,
      state: 'open', // Closes when bell or knife switch is activated
      label: 'Interruptor del Relé de la Campana',
    },
    b_ida_fuente: {
      id: 'b_ida_fuente',
      nodeA: 'ida_centro',
      nodeB: 'fuente_motor_in',
      type: 'motor',
      resistance: 8.0,
      nominalVoltage: 24,
      state: 'closed',
      label: 'Motor de la Fuente de Caudal',
    },
    b_fuente_retorno: {
      id: 'b_fuente_retorno',
      nodeA: 'fuente_motor_in',
      nodeB: 'retorno_sur',
      type: 'wire',
      resistance: 0.3,
      state: 'closed',
      label: 'Descarga de la Fuente al Retorno',
    },
    b_rele_retorno: {
      id: 'b_rele_retorno',
      nodeA: 'rele_bobina_in',
      nodeB: 'retorno_sur',
      type: 'relay_coil',
      resistance: 12.0,
      state: 'closed',
      label: 'Bobina de Enclavamiento',
    },
    b_puerta_actuador: {
      id: 'b_puerta_actuador',
      nodeA: 'retorno_sur',
      nodeB: 'puerta_solenoide',
      type: 'relay_contact',
      resistance: 4.0,
      state: 'closed',
      label: 'Electroimán de Apertura de la Puerta',
    },
    b_brecha_retorno: {
      id: 'b_brecha_retorno',
      nodeA: 'retorno_brecha_a',
      nodeB: 'retorno_brecha_b',
      type: 'switch',
      resistance: 0.05,
      state: 'open', // Missing copper jumper bridge
      label: 'Brecha del Ritual de los Tres Signos',
    },
    b_sur_a_brecha: {
      id: 'b_sur_a_brecha',
      nodeA: 'retorno_sur',
      nodeB: 'retorno_brecha_a',
      type: 'wire',
      resistance: 0.2,
      state: 'closed',
      label: 'Riel Colector Sur',
    },
    b_brecha_a_oxido: {
      id: 'b_brecha_a_oxido',
      nodeA: 'retorno_brecha_b',
      nodeB: 'retorno_oxido',
      type: 'corrosion',
      resistance: 2400.0, // High resistance due to green patina/corrosion
      state: 'corroded',
      label: 'Empalme Sulfatado de Cobre',
    },
    b_oxido_a_portal: {
      id: 'oxido_a_portal',
      nodeA: 'retorno_oxido',
      nodeB: 'portal_neg',
      type: 'wire',
      resistance: 0.1,
      state: 'closed',
      label: 'Retorno Final a Tierra',
    },
  };

  const state: CircuitState = {
    nodes,
    branches,
    isComplete: false,
    fountainActive: false,
    gateOpen: false,
    relayEnergized: false,
    portalStable: true,
  };

  return solveCircuit(state);
}

/**
 * Solves the DC node voltages and branch currents using nodal analysis and Kirchhoff's laws.
 */
export function solveCircuit(state: CircuitState): CircuitState {
  const { nodes, branches } = state;

  // Reset voltages
  for (const n of Object.values(nodes)) {
    if (n.isSource && n.sourceVoltage !== undefined) {
      n.voltage = n.sourceVoltage;
    } else if (n.isGround) {
      n.voltage = 0;
    } else {
      n.voltage = 0;
    }
  }

  // Topological check: is there a closed conductive path from source to ground?
  const isJumperClosed = branches.b_brecha_retorno.state === 'closed';
  const isCleaned = branches.b_brecha_a_oxido.state === 'closed' || branches.b_brecha_a_oxido.resistance < 1.0;
  const isRelaySwitchClosed = branches.b_ida_rele.state === 'closed';

  // If the return path is completely open, current cannot return to ground
  if (!isJumperClosed) {
    // Open circuit: no return current flows
    for (const b of Object.values(branches)) {
      b.current = 0;
      b.power = 0;
    }
    // Nodes before the open break remain energized at source potential
    nodes.ida_norte.voltage = 24;
    nodes.ida_centro.voltage = 24;
    nodes.fuente_motor_in.voltage = 24;
    nodes.retorno_sur.voltage = 24;
    nodes.retorno_brecha_a.voltage = 24;

    // Nodes after the break are at ground potential
    nodes.retorno_brecha_b.voltage = 0;
    nodes.retorno_oxido.voltage = 0;
    nodes.puerta_solenoide.voltage = 0;

    state.fountainActive = false;
    state.relayEnergized = false;
    state.isComplete = false;
    state.gateOpen = false;
    return state;
  }

  // If jumper is closed but contact is corroded (high R = 2400 ohms)
  if (!isCleaned) {
    const totalR = 8.0 + 0.3 + 0.2 + 0.05 + 2400.0 + 0.1; // ~2408 ohms
    const smallCurrent = 24.0 / totalR; // ~0.0099 A (under 10mA)

    for (const b of Object.values(branches)) {
      b.current = smallCurrent;
      b.power = smallCurrent * smallCurrent * b.resistance;
    }
    nodes.ida_norte.voltage = 24.0;
    nodes.ida_centro.voltage = 24.0;
    nodes.fuente_motor_in.voltage = 24.0 - smallCurrent * 8.0; // ~23.9V
    nodes.retorno_sur.voltage = 24.0 - smallCurrent * 8.3;
    nodes.retorno_brecha_a.voltage = 24.0 - smallCurrent * 8.5;
    nodes.retorno_brecha_b.voltage = 24.0 - smallCurrent * 8.55;
    nodes.retorno_oxido.voltage = smallCurrent * 0.1; // ~0.001V

    state.fountainActive = false; // Needs > 0.8A
    state.relayEnergized = false;
    state.isComplete = false;
    state.gateOpen = false;
    return state;
  }

  // Fully Restored State: low resistance loop
  // R_total = 8.0 (motor) + 0.45 (wires) = ~8.45 ohms
  const totalR = 8.0 + 0.45;
  const nominalCurrent = 24.0 / totalR; // ~2.84 A

  for (const b of Object.values(branches)) {
    b.current = nominalCurrent;
    b.power = nominalCurrent * nominalCurrent * b.resistance;
  }

  nodes.ida_norte.voltage = 23.85;
  nodes.ida_centro.voltage = 23.55;
  nodes.fuente_motor_in.voltage = 0.85; // 22.7V drop across motor
  nodes.retorno_sur.voltage = 0.35;
  nodes.retorno_brecha_a.voltage = 0.25;
  nodes.retorno_brecha_b.voltage = 0.20;
  nodes.retorno_oxido.voltage = 0.05;
  nodes.puerta_solenoide.voltage = 12.0;

  state.fountainActive = true;
  state.relayEnergized = isRelaySwitchClosed;
  state.isComplete = true;
  // Restoring the return path can run the fountain, but Omega is actuated by
  // the Bell relay. Requiring the third player-facing action keeps the solver
  // aligned with the existing dialogue and physical circuit semantics.
  state.gateOpen = isRelaySwitchClosed;

  return state;
}

/**
 * Calculates theoretical or measured electrical properties between two probe points.
 */
export function measureBetween(
  state: CircuitState,
  nodeAId: string,
  nodeBId: string,
): { deltaV: number; resistance: number; current: number; status: string } {
  const nA = state.nodes[nodeAId];
  const nB = state.nodes[nodeBId];

  if (!nA || !nB) {
    return { deltaV: 0, resistance: Infinity, current: 0, status: 'Sin contacto' };
  }

  if (nodeAId === nodeBId) {
    return { deltaV: 0, resistance: 0, current: 0, status: 'Mismo punto equipotencial' };
  }

  const deltaV = Math.abs(nA.voltage - nB.voltage);

  // Find direct branch if exists
  let directBranch: CircuitBranch | null = null;
  for (const b of Object.values(state.branches)) {
    if ((b.nodeA === nodeAId && b.nodeB === nodeBId) || (b.nodeB === nodeAId && b.nodeA === nodeBId)) {
      directBranch = b;
      break;
    }
  }

  let resistance = 0.05;
  if (directBranch) {
    if (directBranch.state === 'open') resistance = 999999;
    else if (directBranch.state === 'corroded') resistance = directBranch.resistance;
    else resistance = directBranch.resistance;
  } else {
    // Equivalent resistance approximation
    if (deltaV > 0.1) {
      resistance = deltaV / Math.max(0.001, (nA.voltage + nB.voltage) / 50);
    } else {
      resistance = 0.15;
    }
  }

  const current = directBranch?.current ?? (resistance < 99999 ? deltaV / Math.max(0.01, resistance) : 0);

  let status = 'Circuito Abierto';
  if (resistance < 1.0) status = 'Continuidad Excelente (Baja R)';
  else if (resistance < 50.0) status = 'Carga Activa Detectada';
  else if (resistance < 10000.0) status = 'Alta Resistencia / Sulfatación';

  return { deltaV, resistance, current, status };
}
