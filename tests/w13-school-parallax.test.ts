import { readFileSync } from 'node:fs';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/landing/school3d.css', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../src/landing/school3d.ts', import.meta.url), 'utf8');
const backdrop = readFileSync(new URL('../src/landing/school3dBackdrop.ts', import.meta.url), 'utf8');
const terraces = readFileSync(new URL('../src/landing/school3dTerraces.ts', import.meta.url), 'utf8');

for (const motif of ['formula', 'triangle', 'ohm', 'bits', 'axes', 'sum', 'resistor', 'function', 'roxana', 'wave']) {
  assert(backdrop.includes(`'${motif}'`), `el patrón incluye el motivo ${motif}`);
}

assert(html.includes('rx-school3d__parallax'), 'existe el fondo negro previo a WebGL');
assert(backdrop.includes('TILE_WIDTH = 1200'), 'el patrón usa un módulo compacto');
assert(backdrop.includes('THREE.RepeatWrapping'), 'el módulo se repite sin cortes');
assert(backdrop.includes('layers: layers.length'), 'el fondo informa sus tres capas');
assert(backdrop.includes('setCompact(compact: boolean)'), 'el patrón conserva una escala legible en pantallas angostas');
assert(backdrop.includes('if (reducedMotion) return'), 'el fondo respeta movimiento reducido');
assert(runtime.includes('createSchoolBackdrop(this.camera, prefersReducedMotion())'), 'el runtime monta el patrón en la cámara');
assert(runtime.includes('this.backdrop.update(elapsed)'), 'el patrón avanza independientemente del puntero');
assert(runtime.includes('installSchoolRoomTerrace(object, roomDefinition)'), 'el runtime monta las terrazas por sala');
assert(terraces.includes('SCHOOL_TIER_RISE = 2.4'), 'cada nivel conserva una altura explícita');
assert(terraces.includes('__terrace_foundation'), 'las salas elevadas reciben un zócalo y no flotan');
assert(runtime.includes('schoolRoomOccludes(candidate, selectedRoom)'), 'el foco detecta obstáculos desde la planta');
assert(runtime.includes('alphaHash: true'), 'las salas usan transparencia tramada sin problemas de orden');
assert(runtime.includes('OCCLUDER_OPACITY = 0'), 'los obstáculos se disuelven sin dejar una placa tramada');
assert(runtime.includes('material.userData.roomBaseColor'), 'el tinte conserva el color oscuro de los basamentos');
assert(runtime.includes("getObjectByName('SCHOOL__campus')"), 'el runtime identifica la ambientación exterior');
assert(runtime.includes('exterior.visible = false'), 'la ambientación exterior queda oculta');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'el fondo respeta movimiento reducido');
assert(!css.includes('--parallax-pointer'), 'el parallax no depende del puntero');

console.log('W13 patrón parallax escolar: OK');
