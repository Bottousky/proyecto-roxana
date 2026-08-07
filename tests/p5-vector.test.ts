// P5-vector — Modelo puro de vectores: magnitud, dirección, sentido, suma (Escena 5).
import {
  anguloGrados,
  compensacionCorriente,
  direccion,
  magnitud,
 objetivoAlcanzable,
  resultante,
  sumar,
  type Vector2D,
} from '../src/experiences/physica/models/vector.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

// Magnitud y dirección.
const v: Vector2D = { x: 3, y: 4 };
assert(casi(magnitud(v), 5), 'magnitud de (3,4) = 5');
const dir = direccion(v);
assert(casi(dir.x, 0.6) && casi(dir.y, 0.8), 'dirección normalizada correcta');

// Ángulo.
assert(casi(anguloGrados({ x: 1, y: 0 }), 0), 'ángulo eje +x = 0°');
assert(casi(anguloGrados({ x: 0, y: 1 }), 90), 'ángulo eje +y = 90°');

// Suma vectorial (resultante nula → equilibrio).
const a: Vector2D = { x: 4, y: 0 };
const b: Vector2D = { x: -4, y: 0 };
const r = resultante(a, b);
assert(casi(r.x, 0) && casi(r.y, 0), 'vectores opuestos → resultante nula');

// Corriente transversal: compensación lateral.
const corriente: Vector2D = { x: 5, y: 0 };
const tVuelo = 2;
const comp = compensacionCorriente(corriente, tVuelo);
assert(casi(comp, 10), 'corriente 5 m/s × 2 s = 10 m de desvío');

// Apuntar contra la corriente permite alcanzar el objetivo.
// Corriente va a la izquierda (-5): el jugador debe lanzar más a la derecha.
const lanzamientoCompensado: Vector2D = { x: 8, y: 0 }; // 8×2=16, menos 5×2=10 → 6 ≥ 5 ✓
assert(objetivoAlcanzable(lanzamientoCompensado, { x: -5, y: 0 }, 5, 2), 'compensar corriente → objetivo alcanzable');
assert(!objetivoAlcanzable(lanzamientoCompensado, { x: -5, y: 0 }, 20, 2), 'compensado pero objetivo muy lejos → no alcanza');

console.log('P5 vector: OK');
