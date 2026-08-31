import type { CircuitState, GalvanoscopeState } from '../types.ts';
import { measureBetween } from '../simulation/circuitSolver.ts';

export class GalvanoscopeTool {
  private state: GalvanoscopeState = {
    active: false,
    probeA: null,
    probeB: null,
    measuredVoltage: 0,
    measuredResistance: 0,
    measuredCurrent: 0,
  };

  public toggle(): boolean {
    this.state.active = !this.state.active;
    if (!this.state.active) {
      this.state.probeA = null;
      this.state.probeB = null;
      this.state.measuredVoltage = 0;
      this.state.measuredResistance = 0;
      this.state.measuredCurrent = 0;
    }
    return this.state.active;
  }

  public isActive(): boolean {
    return this.state.active;
  }

  public getState(): GalvanoscopeState {
    return this.state;
  }

  public connectProbe(nodeId: string, circuit: CircuitState): {
    probeConnected: 'A' | 'B';
    ready: boolean;
    result?: ReturnType<typeof measureBetween>;
  } {
    if (!this.state.probeA || (this.state.probeA && this.state.probeB)) {
      // Connect Probe A (Red / Pos)
      this.state.probeA = nodeId;
      this.state.probeB = null;
      this.state.measuredVoltage = 0;
      this.state.measuredResistance = 0;
      this.state.measuredCurrent = 0;
      return { probeConnected: 'A', ready: false };
    } else {
      // Connect Probe B (Black / Ref)
      this.state.probeB = nodeId;
      const result = measureBetween(circuit, this.state.probeA, this.state.probeB);
      this.state.measuredVoltage = result.deltaV;
      this.state.measuredResistance = result.resistance;
      this.state.measuredCurrent = result.current;
      return { probeConnected: 'B', ready: true, result };
    }
  }

  public resetProbes(): void {
    this.state.probeA = null;
    this.state.probeB = null;
    this.state.measuredVoltage = 0;
    this.state.measuredResistance = 0;
    this.state.measuredCurrent = 0;
  }
}
