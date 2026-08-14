// P5-plano-inclinado — Modelo puro de rampa y fuerza reducida (Escena 6).
import {
  crearPlano,
  crearPlanoPorLongitud,
  fuerzaTangencial,
  recorridoBase,
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

// crearPlanoPorLongitud: el jugador puede construir por longitud y deducir el ángulo.
const rampaPorLongitud = crearPlanoPorLongitud(1, 4);
assert(casi(rampaPorLongitud.height, 1), 'altura conservada');
assert(Math.abs(rampaPorLongitud.length - 4) < 1e-9, 'longitud conservada');
assert(sintesisPlanoInclinado(rampaPorLongitud), 'rampa por longitud sigue cumpliendo la síntesis');
const rampaCorta = crearPlanoPorLongitud(2, 2);
assert(rampaCorta.angleDeg < 90, 'longitud ≤ altura no produce ángulo ≥ 90°');
assert(sintesisPlanoInclinado(rampaCorta), 'caso degenerado sigue cumpliendo la síntesis (ángulo < 90°)');

// ≥2 soluciones válidas para alcanzar la misma altura.
const rampa30Alta = crearPlano(2, 30);
const rampa45 = crearPlano(2, 45);
assert(sintesisPlanoInclinado(rampa30Alta), 'solución 1: rampa 30° cumple síntesis');
assert(sintesisPlanoInclinado(rampa45), 'solución 2: rampa 45° cumple síntesis');
assert(fuerzaTangencial(rampa30Alta) < fuerzaTangencial(rampa45), 'rampa 30° requiere menos fuerza que 45°');
assert(recorridoBase(rampa30Alta) > recorridoBase(rampa45), 'rampa 30° requiere más recorrido que 45°');
// El trabajo (energía) es el mismo para ambas:
assert(casi(trabajoNecesario(rampa30Alta), trabajoNecesario(rampa45)), 'trabajo idéntico entre soluciones (no crea energía)');

console.log('P5 plano inclinado: OK');
