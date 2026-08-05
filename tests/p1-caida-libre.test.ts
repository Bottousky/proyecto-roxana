// P1 — Caída libre (U1 de Physica): la cinemática de la cascada que sube.
// Aproximación con tolerancia: los valores son exactos en forma cerrada.
import {
  caidaDesde,
  GRAVEDAD,
  integrar,
  posicionEn,
  tiempoDeCaida,
  velocidadEn,
} from '../src/experiences/physica/models/caidaLibre.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

// El agua de la cascada cae desde la poza (altura 4.2) hasta el piso.
const caida = caidaDesde(4.2, GRAVEDAD);
const tCaida = Math.sqrt((2 * 4.2) / GRAVEDAD);
assert(casi(tiempoDeCaida(4.2, GRAVEDAD), tCaida), 'tiempo de caída es √(2h/g)');
assert(casi(posicionEn(caida, 0), 4.2), 'en t=0 el agua todavía está arriba');
assert(casi(posicionEn(caida, tCaida), 0), 'en t de caída el agua llega al piso');

// Gravedad normal apunta hacia abajo (y hacia arriba): a = -g.
assert(caida.a < 0, 'la caída normal acelera hacia abajo');
assert(casi(posicionEn(caida, 1), 4.2 - 4.9), 'y(1) = h - ½ g = 4.2 - 4.9');

// Mundo invertido: la misma ley con a = +g hace que el agua "caiga hacia arriba".
const invertida = { y0: 0, v0: 0, a: GRAVEDAD };
assert(casi(posicionEn(invertida, 1), 4.9), 'invertida: el agua sube ½ g en 1 s');
assert(casi(posicionEn(invertida, 2), 19.6), 'invertida: ½ g·4 = 19.6 en 2 s');

// Integración por pasos exacta para a constante (equivale a la forma cerrada).
const estado0 = { y: 4.2, v: 0, t: 0 };
const estado = integrar(estado0, 0.5, -GRAVEDAD);
assert(casi(estado.y, posicionEn(caida, 0.5)), 'un paso integra igual que la forma cerrada');
assert(casi(estado.v, velocidadEn(caida, 0.5)), 'la velocidad un paso coincide con v0 + a·t');

console.log('P1 caída libre: OK');
