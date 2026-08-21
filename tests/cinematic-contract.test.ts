import { readFileSync } from 'node:fs';
import { buildRoomGraph, OHMDAL_EDGE_META } from '../src/jugar/roomGraph.ts';
import { CINEMATIC_IDS, isCinematicId } from '../src/jugar/cinematics.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const rooms = readFileSync(new URL('../src/jugar/rooms.ts', import.meta.url), 'utf8');
const scene = readFileSync(new URL('../src/jugar/ExplorationScene.ts', import.meta.url), 'utf8');
const awakening = readFileSync(new URL('../src/jugar/awakening.ts', import.meta.url), 'utf8');
const end = readFileSync(new URL('../src/ui/end.ts', import.meta.url), 'utf8');

assert(CINEMATIC_IDS.length === 6, 'se declaran las seis cinemáticas del contrato');
for (const id of CINEMATIC_IDS) assert(isCinematicId(id), `ID válido: ${id}`);
for (const id of ['portal-arrival', 'awakening', 'puerta-apertura', 'faro-reveal', 'faro-closing', 'instituto-return']) {
  assert(rooms.includes(`'${id}'`) || end.includes(`'${id}'`), `la cinemática ${id} tiene referencia runtime`);
}

function stateBeforeAnnouncement(flag: string, id: string): void {
  const commit = rooms.indexOf(`setFlag('${flag}')`);
  const announce = rooms.indexOf(`announceCinematic('${id}')`);
  assert(commit >= 0 && announce > commit, `${id} anuncia después del estado ${flag}`);
}
stateBeforeAnnouncement('ohmAwake', 'awakening');
stateBeforeAnnouncement('puertaDone', 'puerta-apertura');
stateBeforeAnnouncement('playedFaroReveal', 'faro-reveal');
stateBeforeAnnouncement('arcOneCompleted', 'faro-closing');
for (const id of ['portal-arrival', 'awakening', 'puerta-apertura', 'faro-reveal', 'faro-closing'] as const) {
  const matches = rooms.match(new RegExp(`announceCinematic\\('${id}'\\)`, 'g')) ?? [];
  assert(matches.length === 1, `${id} tiene un único hook semántico en rooms`);
}

assert(scene.includes('this.pendingCinematic = isCinematicId(cinematic) ? cinematic : undefined;'), 'performTransition consume metadata cinematográfica válida sin presentarla');
assert(scene.includes('void this.consumePendingCinematic();'), 'performTransition completa el consumo de metadata sin anuncio duplicado');
assert(awakening.includes('if (settled) return;'), 'awakening limpia una sola vez');
assert(awakening.includes('cam.zoom = startZoom;'), 'awakening restaura zoom de cámara');
assert(awakening.includes('pushUI();') && awakening.includes('popUI();'), 'awakening balancea la propiedad del input');
assert(awakening.includes("scene.input.keyboard?.once('keydown-ESC', cancel)"), 'awakening admite omitir con teclado');
assert(awakening.includes("scene.input.once('pointerdown', cancel)"), 'awakening admite omitir por toque');
assert(awakening.includes('scene.time.delayedCall(1600, restoreAndResolve)'), 'awakening agenda el cierre al final de la secuencia completa');
assert(!awakening.includes('lastTween.once'), 'awakening no confunde el último tween añadido con la duración total');
assert(rooms.includes("esLlegadaPorPortal(location.search) && !f().playedPortalArrival"), 'la llegada de Portal sólo se presenta una vez');
assert(rooms.includes("setFlag('playedPortalArrival')") && rooms.includes("announceCinematic('portal-arrival')"), 'Portal confirma estado antes de anunciar la llegada');
assert(end.includes("announceCinematic('instituto-return')") && end.includes('portalExitUrl()'), 'Home anuncia retorno y usa URL compartida');
assert(rooms.includes("announceCinematic('instituto-return'); window.location.href = portalExitUrl()"), 'Continuar usa el mismo retorno compartido');

const graph = buildRoomGraph({
  rooms: {
    puerta: { id: 'puerta', doors: [{ to: 'manantial_ohm' }] },
    terraces_aqueduct: { id: 'terraces_aqueduct', doors: [{ to: 'lighthouse_hall' }] },
    manantial_ohm: { id: 'manantial_ohm', doors: [] },
    lighthouse_hall: { id: 'lighthouse_hall', doors: [] },
  },
  scenes: {},
  edgeMeta: OHMDAL_EDGE_META,
});
assert(graph.connections().some((edge) => edge.cinematic === 'puerta-apertura'), 'grafo resuelve metadata de apertura');
assert(graph.connections().some((edge) => edge.cinematic === 'faro-reveal'), 'grafo resuelve metadata de revelación');
console.log('cinematic contract: OK');
