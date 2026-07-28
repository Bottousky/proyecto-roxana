import { readFileSync } from 'node:fs';

type PlanRoom = {
  id: string;
  bounds: [number, number, number, number];
};

type PlanReport = {
  gridUnitMeters: number;
  rooms: PlanRoom[];
  sharedBoundaries: unknown[];
  issues: string[];
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const report = JSON.parse(
  readFileSync(new URL('../artifacts/validation/school-plan-validation.json', import.meta.url), 'utf8'),
) as PlanReport;

assert(report.gridUnitMeters === 0.5, 'la planta usa módulos absolutos de 0,5 m');
assert(report.rooms.length === 8, 'la planta contiene ocho recintos primarios');
assert(report.sharedBoundaries.length === 11, 'la planta deriva once límites compartidos');
assert(report.issues.length === 0, 'el validador no reporta errores');

for (const room of report.rooms) {
  for (const coordinate of room.bounds) {
    assert(Number.isInteger(coordinate * 2), `${room.id} cae sobre la grilla de 0,5 m`);
  }
}

for (let index = 0; index < report.rooms.length; index += 1) {
  const a = report.rooms[index];
  for (const b of report.rooms.slice(index + 1)) {
    const [ax0, ay0, ax1, ay1] = a.bounds;
    const [bx0, by0, bx1, by1] = b.bounds;
    const overlapX = Math.min(ax1, bx1) - Math.max(ax0, bx0);
    const overlapY = Math.min(ay1, by1) - Math.max(ay0, by0);
    assert(overlapX <= 0 || overlapY <= 0, `${a.id} y ${b.id} no se superponen`);
  }
}

console.log('W12 planta modular de la escuela: OK');
