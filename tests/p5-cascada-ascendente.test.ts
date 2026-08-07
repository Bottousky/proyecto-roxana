// P5 — La cascada ascendente (Escena 2 del slice v0.2): un mismo lugar, dos leyes.
// El agua sube con a = +g mientras la piedra cae con a = -g: no hay inversión global.
import {
  GRAVEDAD,
  avatarCercaDeCascada,
  chorroAscendente,
  enColumna,
  observacionCompleta,
  piedraDescendiendo,
  posicionChorro,
  resultadoPrediccion,
  tiroPiedra,
  tiempoDeVueloPiedra,
  velocidadChorro,
  type Columna,
} from '../src/experiences/physica/models/cascadaAscendente.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

// El chorro sube con aceleración +g desde el lago.
const chorro = chorroAscendente();
assert(chorro.a === GRAVEDAD, 'el chorro acelera hacia arriba con +g');
assert(casi(posicionChorro(chorro, 1), 4.9), 'el agua sube ½·g·1² = 4.9 m en 1 s');
assert(casi(posicionChorro(chorro, 2), 19.6), 'el agua sube 19.6 m en 2 s');
assert(casi(velocidadChorro(chorro, 1), GRAVEDAD), 'la velocidad del agua es +g en t=1');

// La piedra cae con gravedad normal (a = -g): parábola de cualquier mundo sano.
const piedra = tiroPiedra(0, 1.5, 5, 4.5);
assert(piedra.a === -GRAVEDAD, 'la piedra acelera hacia abajo con -g');
assert(piedraDescendiendo(piedra, 1), 'en t=1 la piedra ya desciende (v = 4.5 - 9.8 < 0)');
assert(casi(posicionChorro(chorro, 1), 4.9), 'sanity: el chorro sigue en 4.9');

// No es una inversión global simple: en el mismo instante y lugar, el agua sube
// y la piedra cae. Las dos leyes conviven sin cancelarse.
assert(velocidadChorro(chorro, 1) > 0, 'agua: v > 0 en t=1');
assert(piedraDescendiendo(piedra, 1), 'piedra: v < 0 en t=1 (mismo t, leyes opuestas)');

// Columna de la cascada: estar dentro, en el borde, o fuera.
const columna: Columna = { x0: 8.6, x1: 11.4 };
assert(enColumna(9, columna), 'x=9 está en la columna');
assert(enColumna(11.4, columna), 'el borde derecho de la columna cuenta');
assert(!enColumna(8.5, columna), 'x=8.5 está fuera de la columna');

// Cercanía del avatar: la columna extendida por el umbral.
const umbral = 2;
assert(avatarCercaDeCascada(6.7, columna, umbral), 'x=6.7 está a un paso de la columna');
assert(!avatarCercaDeCascada(6.5, columna, umbral), 'x=6.5 está fuera del alcance de la observación');
assert(avatarCercaDeCascada(13.4, columna, umbral), 'x=13.4 sigue contando desde el otro lado');
assert(!avatarCercaDeCascada(13.5, columna, umbral), 'x=13.5 ya está lejos');

// La predicción se compara contra lo observado: ambas expectativas son válidas
// como intento, pero sólo "cae" coincide con el tiro parabólico normal.
assert(resultadoPrediccion('cae') === 'acierto', 'esperar caída coincide con la piedra');
assert(resultadoPrediccion('sube') === 'error', 'esperar ascenso revela el contraste sin castigar');

// La observación se registra por CONDICIONES, no por un clic: exige predicción,
// evidencia de caída y presencia en el lugar.
const sinPrediccion = { piedraAterrizada: true, avatarCerca: true, prediccionComprometida: false };
assert(!observacionCompleta(sinPrediccion), 'arrojar sin predicción no alcanza');
assert(!observacionCompleta({ ...sinPrediccion, piedraAterrizada: false, prediccionComprometida: true }), 'predecir sin observar caída no alcanza');
assert(!observacionCompleta({ ...sinPrediccion, avatarCerca: false, prediccionComprometida: true }), 'arrojar lejos no alcanza');
assert(observacionCompleta({ ...sinPrediccion, prediccionComprometida: true }), 'predicción + caída + lugar registran la observación');

// La piedra vuelve al suelo: tiempo de vuelo finito y positivo.
const tVuelo = tiempoDeVueloPiedra(tiroPiedra(0, 1.5, 5, 4.5));
assert(tVuelo !== null && tVuelo > 0, 'la piedra tiene un tiempo de vuelo finito');

console.log('P5 cascada ascendente: OK');
