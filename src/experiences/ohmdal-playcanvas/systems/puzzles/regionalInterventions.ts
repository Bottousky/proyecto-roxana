import {
  calibrateLighthouse, setCastleBranch, setCastleReturnContinuity, setCastleTopology,
  setForgeTerracesAllocation, setForgeTerracesConductor, setForgeTerracesProtection,
  type Arc1GreyboxState,
} from '../campaign/arc1GreyboxModel.ts';
import type { RegionalMaintenanceAction } from './regionalMaintenancePanel.ts';

/** One physical intervention at a time. No action selects a complete solution. */
export function applyRegionalIntervention(
  state: Arc1GreyboxState, action: RegionalMaintenanceAction,
): Arc1GreyboxState {
  switch (action.type) {
    case 'castle-branch': {
      const next = setCastleBranch(state, action.id, {
        ...state.castle.branches[action.id], ...action.patch,
      });
      const wiring = Object.values(next.castle.branches).map((branch) => branch.wiring);
      // Topology describes the actual connections, never a second answer switch.
      const topology = wiring.every((value) => value === 'parallel') ? 'parallel'
        : wiring.every((value) => value === 'series') ? 'series'
          : wiring.every((value) => value === 'isolated') ? 'unwired' : 'mixed';
      return setCastleTopology(next, topology);
    }
    case 'castle-return': return setCastleReturnContinuity(state, action.connected);
    case 'forge-allocation': return setForgeTerracesAllocation(state, {
      ...state.forgeTerraces.allocation, [action.load]: action.amps,
    });
    case 'forge-conductor': return setForgeTerracesConductor(state, action.conductor);
    case 'forge-protection': return setForgeTerracesProtection(state, action.load, action.amps);
    case 'lighthouse-trim': return calibrateLighthouse(state, {
      voltageTrim: action.value, phaseOffset: 0,
    });
  }
}
