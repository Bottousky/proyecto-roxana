import { readFileSync } from 'node:fs';

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(label);
}

const puzzle = readFileSync(new URL('../src/puzzles/despertar.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

assert(puzzle.includes('class="gap-slot-hit"'), 'cada hueco tiene una capa de activación separada');
assert(puzzle.includes('width="44" height="44"'), 'el hueco tiene objetivo táctil de 44×44 en el lienzo');
assert(puzzle.includes("querySelectorAll<SVGRectElement>('.gap-slot-hit')"), 'la capa táctil es la única que recibe activación');
assert(puzzle.includes("slot.addEventListener('click'"), 'mouse, touch y teclado convergen en el click nativo');
assert(puzzle.includes("actions['Continuar'].classList.add('hidden')"), 'Continuar inicia indisponible');
assert(puzzle.includes("actions['Continuar'].classList.remove('hidden')"), 'Continuar sólo aparece tras completar el circuito');
assert(styles.includes("body:not(.touch-device) #bench button,") && styles.includes('pointer-events: auto;'), 'los controles del banco no quedan anulados en escritorio');
assert(styles.includes('.gap-slot-hit { fill: transparent; pointer-events: all; touch-action: manipulation; cursor: pointer; }'), 'el hitbox SVG acepta puntero y touch sin capa decorativa interceptora');

console.log('M25 pedestal pointer controls: OK');
