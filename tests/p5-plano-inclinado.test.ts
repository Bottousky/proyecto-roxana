// P5-plano-inclinado — Modelo puro de rampa y fuerza reducida (Escena 6).
import {
  fuerzaTangencial,
  recorridoBase,
  crearPlano,
  sintesisPlanoInclinado,
  trabajoNecesario,
  FUERZA_LEVANTAR,
  type PlanoInclinado,
} from '../src/experiences/physica/models/planoInclinado.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

// Una rampa de 30° reduce la fuerza tangencial a la mitad.
const rampa30 = crearPlano(1, 30);
assert(casi(fuerzaTangencial(rampa30), FUERZA_LEVANTAR * Math.sin(Math.PI / 6)), '30° → fuerza = peso·sin(30°) = peso/2');
assert(fuerzaTangencial(rampa30) < FUERZA_LEVANTAR, 'plano inclinado requiere menos fuerza que levantar directamente');
assert(sintesisPlanoInclinado(rampa30), 'síntesis: el plano inclinado reduce la fuerza requerida');

// Recorrido horizontal es mayor que el vertical.
assert(recorridoBase(rampa30) > 1, 'recorrido base > altura');
assert(casi(trabajoNecesario(rampa30), FUERZA_LEVANTAR * 1), 'trabajo = peso × altura (energía conservada)');

// Rampas más suaves reducen aún más la fuerza.
const rampa15 = crearPlano(1, 15);
assert(fuerzaTangencial(rampa15) < fuerzaTangencial(rampa30), '15° requiere menos fuerza que 30°');
assert(recorridoBase(rampa15) > recorridoBase(rampa30), '15° requiere más recorrido que 30°');
assert(casi(trabajoNecesario(rampa15), FUERZA_LEVANTAR * 1), 'el trabajo es el mismo (energía no crece)');

console.log('P5 plano inclinado: OK');
