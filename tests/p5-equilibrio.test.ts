// P5-equilibrio — Modelo puro de fuerzas opuestas y resultante nula (Escena 3).
import {
  aceleracionNetas,
  enEquilibrio,
  integrarInstrumento,
  type FuerzasOpuestas,
  type InstrumentoEstado,
} from '../src/experiences/physica/models/equilibrio.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

// Dos corrientes simétricas: el instrumento está en equilibrio (a = 0).
const simetricas: FuerzasOpuestas = { upAcc: 9.8, downAcc: 9.8, upCover: 1.0 };
assert(casi(aceleracionNetas(simetricas), 0), 'fuerzas simétricas → resultante nula');
assert(enEquilibrio(simetricas), 'en equilibrio con cubierta completa');

// Cubrir la corriente ascendente un 60 %: la fuerza descendente gana → baja.
const cubiertaParcial: FuerzasOpuestas = { upAcc: 9.8, downAcc: 9.8, upCover: 0.6 };
assert(aceleracionNetas(cubiertaParcial) < 0, 'cubrir 60% de la corriente → descenso');

// Integración: en equilibrio, la posición no cambia.
const estado0: InstrumentoEstado = { y: 5, v: 0, t: 0 };
const integrado = integrarInstrumento(estado0, simetricas, 1);
assert(casi(integrado.y, 5), 'en equilibrio: posición constante');
assert(casi(integrado.v, 0), 'en equilibrio: velocidad constante');

// Sin equilibrio: la posición cambia con el tiempo.
const integradoBajo = integrarInstrumento(estado0, cubiertaParcial, 1);
assert(integradoBajo.y < 5, 'descenso: y disminuye');
assert(integradoBajo.v < 0, 'descenso: v negativa');

console.log('P5 equilibrio: OK');
