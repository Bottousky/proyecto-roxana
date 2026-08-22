import type { InspectionState, InspectionTarget } from '../types.ts';

export class WorkbenchInspector {
  private state: InspectionState = {
    target: null,
    knifeSwitchClosed: false,
    corrosionScraped: false,
    jumperInstalled: false,
    fuseReplaced: true,
  };

  public open(target: InspectionTarget): void {
    this.state.target = target;
  }

  public close(): void {
    this.state.target = null;
  }

  public getTarget(): InspectionTarget | null {
    return this.state.target;
  }

  public getState(): InspectionState {
    return this.state;
  }

  public toggleKnifeSwitch(): boolean {
    this.state.knifeSwitchClosed = !this.state.knifeSwitchClosed;
    return this.state.knifeSwitchClosed;
  }

  public scrapeCorrosion(): boolean {
    this.state.corrosionScraped = true;
    return true;
  }

  public installJumper(): boolean {
    this.state.jumperInstalled = true;
    return true;
  }
}
