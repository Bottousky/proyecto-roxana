import {
  SCHOOL_LAYOUT,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  movePlayer,
  nearestInteractable,
} from '../src/experiences/instituto/schoolModel.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

// 1. Diagonal normalizada: mover 1 s (en pasos de dt<=0.05, como en el loop real)
// con input (1,1) recorre ~PLAYER_SPEED (±1%), no ×√2.
{
  const start = { x: 0, z: 0 };
  let pos = { ...start };
  const dt = 0.05;
  const steps = 20; // 20 * 0.05 = 1 s
  for (let i = 0; i < steps; i++) {
    pos = movePlayer(pos, { x: 1, z: 1 }, dt);
  }
  const dist = Math.hypot(pos.x - start.x, pos.z - start.z);
  const tolerance = PLAYER_SPEED * 0.01;
  assert(
    Math.abs(dist - PLAYER_SPEED) <= tolerance,
    `la diagonal debe recorrer ~PLAYER_SPEED, no ${dist} (esperado ${PLAYER_SPEED})`,
  );
}

// 2. Pared: desde spawn, empujar contra la pared sur nunca deja z > bounds.maxZ - PLAYER_RADIUS.
{
  let pos = { ...SCHOOL_LAYOUT.spawn };
  for (let i = 0; i < 200; i++) {
    pos = movePlayer(pos, { x: 0, z: 1 }, 0.05);
  }
  assert(
    pos.z <= SCHOOL_LAYOUT.bounds.maxZ - PLAYER_RADIUS + 1e-9,
    `no debe atravesar la pared sur: z=${pos.z}`,
  );
}

// 3. Deslizamiento: avanzar en diagonal contra una pared sigue moviendo en el eje libre.
{
  // Empujar en diagonal (0,1) sur-nulo + (1,0): usamos la pared sur (z+) y
  // avance en x simultáneo para verificar que x sigue progresando.
  let pos = { ...SCHOOL_LAYOUT.spawn };
  // Primero llevar al jugador contra la pared sur.
  for (let i = 0; i < 200; i++) {
    pos = movePlayer(pos, { x: 0, z: 1 }, 0.05);
  }
  const beforeX = pos.x;
  const next = movePlayer(pos, { x: 1, z: 1 }, 0.05);
  assert(next.x > beforeX, `debe deslizar en el eje libre (x) contra la pared: ${next.x} vs ${beforeX}`);
}

// 4. Obstáculo: el jugador no puede atravesar el AABB del escritorio (probar cruce directo).
{
  const desk = SCHOOL_LAYOUT.obstacles.find(
    (box) => box.minX === 3.2 && box.maxX === 5.2 && box.minZ === -1.4 && box.maxZ === -0.4,
  );
  assert(desk !== undefined, 'debe existir el AABB del escritorio en el layout');

  // Arrancar del lado sur del escritorio e intentar cruzarlo hacia el norte.
  let pos = { x: 4.2, z: 0.5 };
  for (let i = 0; i < 400; i++) {
    pos = movePlayer(pos, { x: 0, z: -1 }, 0.05);
  }
  assert(
    pos.z >= desk!.maxZ + PLAYER_RADIUS - 1e-6,
    `no debe atravesar el escritorio: z=${pos.z}, límite=${desk!.maxZ + PLAYER_RADIUS}`,
  );
}

// 5. nearestInteractable(spawn) es null; a menos de 1.4 de la puerta devuelve puerta_ohmdal.
{
  assert(
    nearestInteractable(SCHOOL_LAYOUT.spawn) === null,
    'en spawn no debe haber interactuable cercano',
  );
  const door = SCHOOL_LAYOUT.interactables.find((i) => i.id === 'puerta_ohmdal')!;
  const near = nearestInteractable({ x: door.x, z: door.z + 1.0 });
  assert(near?.id === 'puerta_ohmdal', 'a menos de 1.4 de la puerta debe detectarla');
}

// 6. Camino jugable: desde spawn se llega al radio de puerta_ohmdal, preceptor y bitacora.
{
  function walkTowards(from: { x: number; z: number }, to: { x: number; z: number }, maxSteps: number) {
    let pos = { ...from };
    for (let i = 0; i < maxSteps; i++) {
      const dx = to.x - pos.x;
      const dz = to.z - pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.05) break;
      const input = { x: dx / dist, z: dz / dist };
      pos = movePlayer(pos, input, 0.05);
    }
    return pos;
  }

  const door = SCHOOL_LAYOUT.interactables.find((i) => i.id === 'puerta_ohmdal')!;
  const preceptor = SCHOOL_LAYOUT.interactables.find((i) => i.id === 'preceptor')!;
  const bitacora = SCHOOL_LAYOUT.interactables.find((i) => i.id === 'bitacora')!;

  const atDoor = walkTowards(SCHOOL_LAYOUT.spawn, { x: door.x, z: door.z }, 2000);
  assert(
    nearestInteractable(atDoor)?.id === 'puerta_ohmdal',
    `debe poder llegar al radio de la puerta: pos=${JSON.stringify(atDoor)}`,
  );

  const atPreceptor = walkTowards(SCHOOL_LAYOUT.spawn, { x: preceptor.x, z: preceptor.z }, 2000);
  assert(
    nearestInteractable(atPreceptor)?.id === 'preceptor',
    `debe poder llegar al radio del preceptor: pos=${JSON.stringify(atPreceptor)}`,
  );

  const atBitacora = walkTowards(SCHOOL_LAYOUT.spawn, { x: bitacora.x, z: bitacora.z }, 2000);
  assert(
    nearestInteractable(atBitacora)?.id === 'bitacora',
    `debe poder llegar al radio de la bitácora: pos=${JSON.stringify(atBitacora)}`,
  );
}

console.log('I0 school model tests: OK');
