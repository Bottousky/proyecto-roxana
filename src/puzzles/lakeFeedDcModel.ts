export type LakeFeedFault = 'missing-path' | 'source-overload' | 'voltage-drop' | 'ok';
export interface LakeFeedDcInput { sourceVoltage: number; feederResistance: number; sourceLimit: number; branches: readonly { resistance: number; enabled: boolean }[]; }
export interface LakeFeedDcResult { valid: boolean; fault: LakeFeedFault; totalCurrent: number; loadVoltage: number; branchCurrents: readonly number[]; feedback: string; }

export function evaluateLakeFeedDc(input: LakeFeedDcInput): LakeFeedDcResult {
  if (!Number.isFinite(input.sourceVoltage) || input.sourceVoltage <= 0) {
    return { valid: false, fault: 'missing-path', totalCurrent: 0, loadVoltage: 0, branchCurrents: input.branches.map(() => 0), feedback: 'Hace falta un Empuje positivo para observar el reparto.' };
  }
  const active = input.branches.filter((branch) => branch.enabled && branch.resistance > 0);
  if (active.length < 2) return { valid: false, fault: 'missing-path', totalCurrent: 0, loadVoltage: 0, branchCurrents: input.branches.map(() => 0), feedback: 'Falta un camino atendido hacia el Lago.' };
  if (active.some((branch) => !Number.isFinite(branch.resistance) || branch.resistance <= 0)) {
    return { valid: false, fault: 'missing-path', totalCurrent: 0, loadVoltage: 0, branchCurrents: input.branches.map(() => 0), feedback: 'Cada camino necesita una Piedra de Freno válida.' };
  }
  const conductance = active.reduce((sum, branch) => sum + 1 / branch.resistance, 0);
  const totalCurrent = input.sourceVoltage * conductance / (1 + input.feederResistance * conductance);
  const loadVoltage = input.sourceVoltage - totalCurrent * input.feederResistance;
  const branchCurrents = input.branches.map((b) => b.enabled ? loadVoltage / b.resistance : 0);
  const fault: LakeFeedFault = totalCurrent > input.sourceLimit ? 'source-overload' : loadVoltage < input.sourceVoltage * .6 ? 'voltage-drop' : 'ok';
  return { valid: fault === 'ok', fault, totalCurrent, loadVoltage, branchCurrents, feedback: fault === 'ok' ? 'Los dos caminos reciben Empuje suficiente.' : fault === 'source-overload' ? 'El Tronco pide demasiado Río.' : 'El Empuje cae antes de llegar al Lago.' };
}
