/** DC drive: the clock advances when available power meets the mechanism demand. */
export interface ClockDriveDcInput { voltage: number; resistance: number; gearLoad: number; dividerResistance?: number; motorResistance?: number; currentLimit?: number; }
export interface ClockDriveDcResult { valid: boolean; current: number; power: number; motorVoltage: number; rhythm: 'quieto' | 'lento' | 'parejo' | 'forzado'; feedback: string; }

export function evaluateClockDriveDc(input: ClockDriveDcInput): ClockDriveDcResult {
  if (![input.voltage, input.resistance, input.gearLoad].every(Number.isFinite) || input.voltage <= 0 || input.resistance <= 0 || input.gearLoad <= 0) return { valid: false, current: 0, power: 0, motorVoltage: 0, rhythm: 'quieto', feedback: 'El reloj necesita Empuje, Camino y una carga de engranajes válidos.' };
  const motorResistance = input.motorResistance ?? 12;
  const seriesResistance = input.resistance + (input.dividerResistance ?? 0);
  const current = input.voltage / (seriesResistance + motorResistance);
  const motorVoltage = current * motorResistance;
  const power = motorVoltage * current;
  if (current > (input.currentLimit ?? 1.2) || motorVoltage > 10) return { valid: false, current, power, motorVoltage, rhythm: 'forzado', feedback: 'El mecanismo recibe demasiado Río: mantén la entrega sin forzar el Camino.' };
  if (power < input.gearLoad || motorVoltage < 7) return { valid: false, current, power, motorVoltage, rhythm: 'quieto', feedback: 'El péndulo no recibe entrega suficiente: sube el Empuje o reduce el Freno.' };
  const rhythm = motorVoltage < 8 ? 'lento' : 'parejo';
  return { valid: rhythm === 'parejo', current, power, motorVoltage, rhythm, feedback: rhythm === 'parejo' ? 'El péndulo avanza parejo: la entrega alcanza y el Camino se mantiene seguro.' : 'El reloj avanza, pero todavía es lento: ajusta el divisor.' };
}
