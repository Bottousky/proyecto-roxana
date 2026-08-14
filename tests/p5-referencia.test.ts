// P5-referencia — Modelo puro de sistema de referencia móvil (Escena 4).
import {
  type PlataformaMovil,
  type SistemaReferencia,
  posicionPlataforma,
  velocidadPlataforma,
  separacionRelativa,
  posicionRelativa,
  separacionConstante,
  velocidadRelativa,
  velocidadMarcoAnclado,
} from '../src/experiences/physica/models/referenciaMovil.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}
function casi(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

// Plataforma con vaivén senoidal mantiene separación constante consigo misma.
const p: PlataformaMovil = { x0: 10, amplitude: 3, omega: 1, phase: 0 };
assert(casi(posicionPlataforma(p, 0), 10), 'en t=0: posición = x0');
assert(casi(posicionPlataforma(p, Math.PI / 2), 13), 'en t=π/2: amplitud desplazada');
assert(casi(velocidadPlataforma(p, 0), 3), 'en t=0: v = A·ω = 3');

// Sistema con 3 plataformas: la separación entre pares es constante.
const sis: SistemaReferencia = {
  plataformas: [
    { x0: 10, amplitude: 3, omega: 1, phase: 0 },
    { x0: 20, amplitude: 3, omega: 1, phase: 0 },
    { x0: 30, amplitude: 3, omega: 1, phase: 0 },
  ],
  anclajeIdx: -1,
};
assert(separacionConstante(sis, 0, 1), 'separación constante entre plataformas 0 y 1');
assert(separacionConstante(sis, 1, 2), 'separación constante entre plataformas 1 y 2');
assert(casi(separacionRelativa(sis, 0, 1, 0), 10), 'separación inicial = 10');
assert(casi(separacionRelativa(sis, 0, 1, 2), 10), 'separación sigue 10 en t=2');

// Anclar una plataforma: las coordenadas relativas se anulan.
const anclado: SistemaReferencia = { ...sis, anclajeIdx: 1 };
const xPlataforma = posicionPlataforma(sis.plataformas[1], 1);
assert(casi(posicionRelativa(anclado, xPlataforma, 1), 0), 'plataforma anclada → posición relativa 0');

// Velocidad relativa y velocidad del marco anclado.
const tPrueba = 0;
assert(casi(velocidadRelativa(anclado, 1, tPrueba), 0), 'plataforma anclada: velocidad relativa = 0');
assert(casi(velocidadRelativa(anclado, 0, tPrueba), 0), 'plataforma vecina en marco anclado: velocidad relativa = 0 (separación constante)');
assert(casi(velocidadRelativa(sis, 0, tPrueba), 3), 'sin anclaje: velocidad relativa = velocidad absoluta');
assert(casi(velocidadMarcoAnclado(sis, tPrueba), 0), 'sin anclaje: marco anclado = 0 (inercial)');
assert(casi(velocidadMarcoAnclado(anclado, tPrueba), -velocidadPlataforma(anclado.plataformas[1], tPrueba)), 'marco anclado: velocidad = -vAnclada');

console.log('P5 referencia: OK');
