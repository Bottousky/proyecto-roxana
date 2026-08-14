// P5-equilibrio — Modelo puro de fuerzas opuestas y resultante nula (Escena 3).
import {
  aceleracionNetas,
  coberturaUmbral,
  crearEstadoInstrumento,
  desplazamientoDesdeCentro,
  descensoPredecible,
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

// Helpers nuevos: coberturaUmbral y estado canónico.
assert(casi(coberturaUmbral(simetricas), 1), 'umbral de cobertura = down/up = 1 cuando simétricas');
assert(casi(coberturaUmbral({ upAcc: 20, downAcc: 10, upCover: 1 }), 0.5), 'umbral = down/up cuando fuerzas asimétricas');
const inicial = crearEstadoInstrumento(7);
assert(casi(inicial.y, 7) && casi(inicial.v, 0) && casi(inicial.t, 0), 'crearEstadoInstrumento produce (y, 0, 0)');
assert(casi(desplazamientoDesdeCentro({ y: 4, v: 0, t: 0 }, 5), -1), 'desplazamientoDesdeCentro = y - centro');
// Descenso predecible reutiliza aceleracionNetas:
assert(descensoPredecible(cubiertaParcial) === true, 'descensoPredecible coincide con aceleración negativa');

// ≥2 soluciones válidas: dos coberturas distintas producen descenso predecible.
const cub70: FuerzasOpuestas = { upAcc: 9.8, downAcc: 9.8, upCover: 0.3 }; // ~70% cubierta
const cub50: FuerzasOpuestas = { upAcc: 9.8, downAcc: 9.8, upCover: 0.5 }; //  50% cubierta
assert(descensoPredecible(cub70), 'solución 1: cobertura 70% → descensoPredecible');
assert(descensoPredecible(cub50), 'solución 2: cobertura 50% → descensoPredecible (alta arc)');
assert(!descensoPredecible(simetricas), 'sin cobertura → no desciende (equilibrio conservado)');
// Las dos soluciones integradas producen descenso cuantitativo distinto pero el mismo signo.
const estadoBase: InstrumentoEstado = { y: 5, v: 0, t: 0 };
const desc70 = integrarInstrumento(estadoBase, cub70, 1);
const desc50 = integrarInstrumento(estadoBase, cub50, 1);
assert(desc70.y < 5 && desc50.y < 5, 'ambas soluciones producen descenso real');
assert(desc70.y < desc50.y, 'cobertura 70% produce descenso más rápido (mayor |a|)');

console.log('P5 equilibrio: OK');
