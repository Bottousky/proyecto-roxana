// P5-vector — Modelo puro de vectores: magnitud, dirección, sentido, suma (Escena 5).
import {
  alcanceConCorriente,
  anguloGrados,
  compensacionCorriente,
  direccion,
  magnitud,
 objetivoAlcanzable,
  resultante,
  sumar,
  vxParaAlcance,
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

// alcanceConCorriente y vxParaAlcance: al menos 2 soluciones válidas.
const viento: Vector2D = { x: -5, y: 0 };
const impacto = alcanceConCorriente({ x: 8, y: 1 }, viento, 2);
assert(casi(impacto.x, 6), 'alcance x con corriente: lanzamiento.x·t + corriente.x·t = 16 - 10 = 6');
assert(casi(impacto.y, 2), 'alcance y con corriente: lanzamiento.y·t (corriente no afecta y)');
const vxObjetivo = vxParaAlcance(5, viento, 2);
assert(casi(vxObjetivo, (5 - compensacionCorriente(viento, 2)) / 2), 'vxParaAlcance devuelve el vx exacto para alcanzar distancia');
// Múltiples soluciones: misma distancia con tiempos de vuelo distintos.
const vxA = vxParaAlcance(8, viento, 1);
const vxB = vxParaAlcance(8, viento, 2);
assert(vxA !== vxB, 'dos tiempos de vuelo → dos vx distintos (high arc vs low arc)');
assert(objetivoAlcanzable({ x: vxA, y: 4 }, viento, 8, 1), 'high arc (t corto, vy alto) alcanza');
assert(objetivoAlcanzable({ x: vxB, y: 1 }, viento, 8, 2), 'low arc (t largo, vy bajo) también alcanza');

// Punto final coincide para ambas soluciones:
const impactoA = alcanceConCorriente({ x: vxA, y: 4 }, viento, 1);
const impactoB = alcanceConCorriente({ x: vxB, y: 1 }, viento, 2);
assert(casi(impactoA.x, impactoB.x) && Math.abs(impactoA.x - 8) < 0.01, 'ambas soluciones aterrizan en x=8');

console.log('P5 vector: OK');
