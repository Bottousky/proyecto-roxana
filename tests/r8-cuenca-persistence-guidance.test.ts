import { readFileSync } from 'node:fs';
import { migrateLoadedFlags } from '../src/state.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(`FAIL: ${label}`);
}

const migrated = migrateLoadedFlags({
  playedPortalArrival: true,
  plazaSeen: false,
  ohmAwake: true,
});
assert(migrated.ohmAwake, 'el despertar persiste');
assert(migrated.plazaSeen, 'un save post-despertar no repite la presentación inicial');

const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const portalArrival = rooms.slice(
  rooms.indexOf("if (esLlegadaPorPortal(location.search)"),
  rooms.indexOf("} else if (!f().plazaSeen)", rooms.indexOf("if (esLlegadaPorPortal(location.search)")),
);
assert(portalArrival.includes("setFlag('plazaSeen')"), 'la llegada por Portal consume la presentación semántica');

const edda = rooms.slice(rooms.indexOf("id: 'edda', x: 1100"), rooms.indexOf("id: 'edda-campana'"));
assert(edda.includes("(!f().frenoDone || f().puertaDone)"), 'Edda sigue accesible después de despertar a Ohm');

const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
assert(scene.includes("'Taller de Lumen · al este →'"), 'el HUD señala el Taller sin mapa ni diálogo');
assert(scene.includes("state.flags.ohmAwake && !state.flags.metLumen"), 'la guía cubre sólo la etapa post-despertar');
const guideLayout = scene.slice(scene.indexOf('this.objectiveGuide ='), scene.indexOf('this.mapLayer ='));
assert(guideLayout.includes('.text(20, 20,'), 'la guía se ancla al margen superior izquierdo del canvas lógico');
assert(guideLayout.includes('.setOrigin(0, 0)'), 'la guía crece hacia el centro y no debajo del HUD derecho');
assert(!guideLayout.includes('.text(W - 20'), 'la guía no comparte el anclaje superior derecho del HUD');

console.log('R8 persistencia y guía post-despertar de Cuenca: OK');
