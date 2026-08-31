export type CharacterId = 'estudiante' | 'ohm' | 'edda' | 'lumen' | 'aldeano' | 'nino';

export interface DialogueLine {
  who: string;
  portrait?: string;
  text: string;
  emotion?: 'neutral' | 'curious' | 'concerned' | 'eureka' | 'grumpy';
  voCue?: string;
}

export interface DialogueChoice {
  label: string;
  nextStepId: string;
}

export interface DialogueNode {
  id: string;
  lines: DialogueLine[];
  choices?: DialogueChoice[];
  onComplete?: string; // Action trigger
}

// Circuit Network Types (Outer Wilds physical grounding)
export interface CircuitNode {
  id: string;
  label: string;
  pos: { x: number; y: number; z: number };
  voltage: number;
  isGround?: boolean;
  isSource?: boolean;
  sourceVoltage?: number;
}

export interface CircuitBranch {
  id: string;
  nodeA: string;
  nodeB: string;
  type: 'wire' | 'resistor' | 'switch' | 'relay_coil' | 'relay_contact' | 'lamp' | 'motor' | 'corrosion';
  resistance: number; // in Ohms
  state: 'closed' | 'open' | 'corroded' | 'blown';
  nominalVoltage?: number;
  current?: number;
  power?: number;
  label: string;
}

export interface CircuitState {
  nodes: Record<string, CircuitNode>;
  branches: Record<string, CircuitBranch>;
  isComplete: boolean;
  fountainActive: boolean;
  gateOpen: boolean;
  relayEnergized: boolean;
  portalStable: boolean;
}

// Rumor Graph for Bitácora (Outer Wilds inspired)
export type RumorStatus = 'unknown' | 'rumor' | 'investigating' | 'discovered';

export interface RumorNode {
  id: string;
  title: string;
  category: 'misterio' | 'persona' | 'mecanismo' | 'ley_fisica';
  description: string;
  superstition: string;
  physicalTruth?: string;
  status: RumorStatus;
  connections: string[];
  x: number;
  y: number;
  icon: string;
}

// Close-up Inspection (Broken Sword inspired)
export type InspectionTarget = 'cuadro_rele' | 'mural_esquema' | 'banco_lumen' | 'foso_manantial';

export interface InspectionState {
  target: InspectionTarget | null;
  knifeSwitchClosed: boolean;
  corrosionScraped: boolean;
  jumperInstalled: boolean;
  fuseReplaced: boolean;
}

// Player / Tool Modes
export type ToolMode = 'explore' | 'galvanoscope' | 'inspect' | 'bitacora';

export interface GalvanoscopeState {
  active: boolean;
  probeA: string | null; // Node id
  probeB: string | null; // Node id
  measuredVoltage: number;
  measuredResistance: number;
  measuredCurrent: number;
  probeAPos?: { x: number; y: number; z: number };
  probeBPos?: { x: number; y: number; z: number };
}
