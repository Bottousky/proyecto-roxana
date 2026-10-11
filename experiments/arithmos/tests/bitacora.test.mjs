import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bitacoraPages, bookSections, ownerName, renderBitacora, schoolName, setSchoolName, SCHOOL_KEY} from '../src/engine/bitacora.js';
import {jpegPdf} from '../src/engine/pdf.js';

const store = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m};
};
const entry = (n, extra = {}) => ({id: `c${n}`, title: `Título ${n}`, abbr: `Idea ${n}`, body: [`Dice ${n}`], seen: [`Pasó ${n}`], ...extra});
const titles = {1: '¿Están todos?', 2: 'Demasiados para marcar', 3: 'Menos que nada'};

test('dueño: manda el nombre del registro de Dirección; si no hay escuela, el que se dio al empezar', () => {
  assert.equal(ownerName({owner: 'Ana'}, 'Manuel'), 'Manuel');
  assert.equal(ownerName({owner: ' Ana '}, ''), 'Ana');
  assert.equal(ownerName({}, ''), '');
});

test('el registro de la escuela se lee sin romperse y sólo se escribe si ya existe', () => {
  assert.equal(schoolName(store()), '');
  assert.equal(schoolName(store({[SCHOOL_KEY]: '{roto'})), '');
  assert.equal(schoolName(store({[SCHOOL_KEY]: JSON.stringify({version: 2, name: 'X'})})), '');
  const s = store({[SCHOOL_KEY]: JSON.stringify({version: 1, name: 'Manu', crest: 'compas', rooms: ['direccion']})});
  assert.equal(schoolName(s), 'Manu');
  assert.ok(setSchoolName('Manuel', s));
  assert.deepEqual(JSON.parse(s.map.get(SCHOOL_KEY)), {version: 1, name: 'Manuel', crest: 'compas', rooms: ['direccion']}, 'cambia sólo el nombre');
  const empty = store();
  assert.equal(setSchoolName('Manuel', empty), false);
  assert.equal(empty.map.size, 0, 'no crea el registro de la escuela');
});

test('hojas: la portadilla primero y los capítulos en su orden, aunque se hayan anotado en otro', () => {
  const ids = bitacoraPages({journal: [entry(10), entry(2), entry(1)]}).map(p => p.id);
  assert.deepEqual(ids, ['portada', 'c1', 'c2', 'c10']);
});

test('la portadilla lleva el nombre y el índice marca lo anotado', () => {
  const html = renderBitacora({journal: [entry(2)], createdAt: '2026-10-11T12:00:00Z'}, {selected: 'portada', owner: 'Manuel <b>', titles});
  assert.match(html, /Este cuaderno es de/);
  assert.match(html, /Manuel &lt;b&gt;/, 'el nombre se escapa');
  assert.match(html, /class="is-done"><span class="bt-index-n">2</);
  assert.match(html, /class="is-ahead"><span class="bt-index-n">3</);
  assert.match(html, /Tomo 1/);
});

test('hoja de capítulo: foto de su pizarra, números en lápiz rojo, volver a ver y la pregunta propia', () => {
  const state = {journal: [entry(1, {seen: ['Contaste 14 marcas.'], moments: [{id: 'c1.todos', label: 'Desplegar: emparejar'}]})], notes: {c1: 'Me pregunto si </textarea>'}};
  const html = renderBitacora(state, {selected: 'c1', photos: {c1: 'data:image/jpeg;base64,AAAA'}, titles});
  assert.match(html, /<img src="data:image\/jpeg;base64,AAAA"/);
  assert.match(html, /Contaste <span class="bt-num">14<\/span> marcas\./);
  assert.match(html, /data-moment="c1.todos">emparejar</);
  assert.match(html, /data-note-for="c1"/);
  assert.match(html, /Me pregunto si &lt;\/textarea&gt;/, 'la nota se escapa');
  assert.match(html, /aria-current="page"[^>]*><span>1</);
});

test('para imprimir: sin botones ni campos; la pregunta propia queda como tinta', () => {
  const sections = bookSections({journal: [entry(1), entry(2)], notes: {c2: 'Creo que sí'}}, {owner: 'Manuel', titles});
  assert.equal(sections.length, 6, 'dos páginas por hoja: portadilla y dos capítulos');
  const all = sections.join('');
  assert.doesNotMatch(all, /<button|<textarea|data-moment/);
  assert.match(all, /<p class="bt-own-text">Creo que sí<\/p>/);
});

test('PDF: una página por imagen, referencias cruzadas exactas y metadatos con tildes', () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const bytes = jpegPdf([{jpeg, width: 10, height: 20}, {jpeg, width: 10, height: 20}], {w: 148, h: 210}, {title: 'Bitácora de Ñandú', author: 'Ana'});
  const text = Buffer.from(bytes).toString('latin1');
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.match(text, /\/Count 2/);
  assert.match(text, /\/MediaBox \[0 0 419\.53 595\.28\]/);
  assert.match(text, /\/Title <FEFF/);
  assert.match(text, /\/Author \(Ana\)/);
  const startxref = Number(text.match(/startxref\n(\d+)/)[1]);
  assert.ok(text.slice(startxref).startsWith('xref\n0 10\n'));
  const offsets = [...text.slice(startxref).matchAll(/^(\d{10}) 00000 n $/gm)].map(m => Number(m[1]));
  assert.equal(offsets.length, 9);
  offsets.forEach((off, k) => assert.ok(text.startsWith(`${k + 1} 0 obj`, off), `objeto ${k + 1} en su lugar`));
  assert.ok(text.includes('\xff\xd8\xff\xe0'), 'los bytes del JPEG van tal cual');
});
