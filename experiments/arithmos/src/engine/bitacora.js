// La Bitácora de Arithmos como cuaderno: «Arithmos · Tomo 1», un cuaderno de matemática cuadriculado a nombre de quien
// juega. Cada capítulo es una doble página: a la izquierda lo que pasó (en lápiz) con la foto de su propia pizarra
// pegada; a la derecha la idea en un recuadro, lo que eso dice (en birome) y su propia pregunta. Lo mismo que se lee en
// pantalla es lo que se descarga en PDF (bitacora-pdf.js) y lo que, más adelante, se imprimiría como tomo.
// Funciones puras (sin DOM): se prueban en Node.

export const TOMO = {world: 'Arithmos', number: 1, subject: 'Matemática', publisher: 'Instituto Roxana · Taller de Matemática'};
// El perfil del alumno en la escuela 3D (Dirección): el nombre del registro es el dueño del tomo.
export const SCHOOL_KEY = 'roxana.escuela.v1';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
// los números en lápiz rojo, como se marcan en un cuaderno de matemática (sin tocar los de las entidades HTML)
const ink = text => esc(text).replace(/(&[#a-z0-9]+;)|(\d+(?:[.,]\d+)*)/gi, (m, ent, num) => (ent ? ent : `<span class="bt-num">${num}</span>`));
const TAB_COLORS = ['lima', 'cielo', 'coral', 'mostaza', 'lila', 'menta'];

/** Nombre del registro de la escuela (mismo origen), o '' si no hay perfil o no se puede leer. Nunca escribe. */
export function schoolName(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage?.getItem(SCHOOL_KEY) || 'null');
    return data?.version === 1 && typeof data.name === 'string' ? data.name.trim().slice(0, 40) : '';
  } catch {
    return '';
  }
}

/** Guarda el nombre en el registro de la escuela si ese registro ya existe (no lo crea: es de la escuela). */
export function setSchoolName(name, storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage?.getItem(SCHOOL_KEY) || 'null');
    if (data?.version !== 1) return false;
    data.name = String(name ?? '').trim().slice(0, 40);
    storage.setItem(SCHOOL_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Dueño del tomo: el nombre de Dirección manda; si no hay escuela, el que se dio al empezar. */
export function ownerName(state, school = '') {
  return (school || (typeof state?.owner === 'string' ? state.owner : '')).trim().slice(0, 40);
}

const chapterOf = id => Number(String(id).match(/^c(\d+)$/)?.[1]) || 99;

/** Las hojas del tomo, en orden: la portadilla con el índice y una doble página por capítulo anotado. */
export function bitacoraPages(state) {
  const chapters = [...(state?.journal || [])].sort((a, b) => chapterOf(a.id) - chapterOf(b.id))
    .map(e => ({...e, chapter: chapterOf(e.id)}));
  return [{id: 'portada', title: 'Este cuaderno', cover: true}, ...chapters];
}

const squiggle = '<svg class="bt-underline" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C 40 3, 70 10, 110 6 S 190 4, 230 7 S 280 8, 298 5"/></svg>';
// Punto en el margen: un punto de tiza con sus rayitas de movimiento, como lo dibujaría el alumno.
const puntoDoodle = '<svg class="bt-punto" viewBox="0 0 60 40" aria-hidden="true"><circle cx="40" cy="20" r="7"/><path d="M6 14 h18 M2 21 h20 M8 28 h16"/></svg>';

function fmtDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(+d) ? '' : d.toLocaleDateString('es-AR', {day: 'numeric', month: 'long', year: 'numeric'});
}

function coverPages(state, {owner, titles, pages}) {
  const done = new Set(pages.filter(p => !p.cover).map(p => p.chapter));
  const nums = Object.keys(titles).map(Number).sort((a, b) => a - b);
  const left = `<header class="bt-page-head"><span class="bt-eyebrow">${esc(TOMO.publisher.toUpperCase())}</span></header>
    <div class="bt-owner"><p class="bt-pencil">Este cuaderno es de</p><p class="bt-owner-name">${owner ? esc(owner) : '<span class="bt-blank" aria-label="sin nombre todavía"></span>'}</p>
    ${state?.createdAt ? `<p class="bt-pencil">Empezado el ${esc(fmtDate(state.createdAt))}</p>` : ''}</div>
    <div class="bt-tomo"><span>${esc(TOMO.world)}</span><b>Tomo ${TOMO.number}</b><small>${esc(TOMO.subject)}</small></div>
    <p class="bt-ink bt-motto">Lo que vi. Lo que probé. Lo que todavía no sé.</p>${puntoDoodle}`;
  const right = `<header class="bt-page-head"><span class="bt-eyebrow">ÍNDICE</span><h3>Lo que hay adentro</h3>${squiggle}</header>
    <ol class="bt-index">${nums.map(n => `<li class="${done.has(n) ? 'is-done' : 'is-ahead'}"><span class="bt-index-n">${n}</span><span class="bt-index-t">${esc(titles[n])}</span><span class="bt-index-mark" aria-label="${done.has(n) ? 'anotado' : 'todavía no'}">${done.has(n) ? '✓' : '…'}</span></li>`).join('')}</ol>
    ${done.size < nums.length ? '<p class="bt-pencil bt-more">Quedan hojas cuadriculadas para lo que falta.</p>' : ''}`;
  return [left, right];
}

function chapterPages(page, {photo, note, mode}) {
  const seen = page.seen || [], body = page.body || [];
  const left = `<header class="bt-page-head"><span class="bt-stamp">Capítulo ${page.chapter}</span><span class="bt-eyebrow">ARITHMOS · TOMO ${TOMO.number}</span><h3>${esc(page.title)}</h3>${squiggle}</header>
    ${photo ? `<figure class="bt-photo" style="--tilt:${page.chapter % 2 ? 2.5 : -2.5}deg"><img src="${esc(photo)}" alt="La pizarra al terminar el capítulo ${page.chapter}"><figcaption>Mi pizarra</figcaption></figure>` : ''}
    ${seen.length ? `<h4 class="bt-label">Lo que pasó</h4><ul class="bt-seen">${seen.map(s => `<li>${ink(s)}</li>`).join('')}</ul>` : '<p class="bt-pencil">Todavía no anoté lo que pasó.</p>'}`;
  const moments = mode === 'screen' && page.moments?.length
    ? `<div class="bt-sticky"><b>Volver a ver</b>${page.moments.map(m => `<button type="button" data-moment="${esc(m.id)}">${esc(m.label.replace(/^Desplegar:\s*/, ''))}</button>`).join('')}</div>` : '';
  const own = mode === 'screen'
    ? `<div class="bt-own"><label for="bt-note-${esc(page.id)}">Mi pregunta</label><textarea id="bt-note-${esc(page.id)}" data-note-for="${esc(page.id)}" maxlength="1200" rows="4" placeholder="Me pregunto si… / Creo que…">${esc(note)}</textarea><small>Una idea puede cambiar. No hace falta tener la respuesta.</small></div>`
    : note ? `<div class="bt-own"><span class="bt-own-label">Mi pregunta</span><p class="bt-own-text">${esc(note)}</p></div>` : '';
  const right = `<div class="bt-rule"><span class="bt-label">La idea, en una línea</span><p>${ink(page.abbr)}</p></div>
    ${body.length ? `<h4 class="bt-label">Lo que eso dice</h4>${body.map(p => `<p class="bt-ink">${ink(p)}</p>`).join('')}` : ''}
    ${moments}${own}<div class="bt-margin">${puntoDoodle}<span>Punto estuvo acá.</span></div>`;
  return [left, right];
}

/**
 * Las dos páginas de una hoja del tomo como HTML (cuerpo de cada página). `mode`: 'screen' (con botones y la nota
 * editable) o 'print' (la nota como tinta, sin botones).
 */
export function spreadPages(state, page, {owner = '', titles = {}, photos = {}, mode = 'screen'} = {}) {
  const pages = bitacoraPages(state);
  if (page.cover) return coverPages(state, {owner, titles, pages});
  return chapterPages(page, {photo: photos[page.id], note: state?.notes?.[page.id] || '', mode});
}

/** El cuaderno abierto en `selected` (o en el último capítulo anotado), con pestañas y botones de descarga. */
export function renderBitacora(state, {selected, owner = '', titles = {}, photos = {}} = {}) {
  const pages = bitacoraPages(state);
  const page = pages.find(p => p.id === selected) || pages.at(-1);
  const i = pages.indexOf(page), prev = pages[i - 1], next = pages[i + 1];
  const [left, right] = spreadPages(state, page, {owner, titles, photos, mode: 'screen'});
  const corner = (target, label, dir) => `<button type="button" class="bt-corner bt-corner-${dir}" data-bt-page="${esc(target?.id || page.id)}" ${target ? '' : 'disabled'} aria-label="${dir === 'prev' ? 'Hoja anterior' : 'Hoja siguiente'}">${label}</button>`;
  const tabs = `<nav class="bt-tabs" aria-label="Hojas de la Bitácora">${pages.map((p, k) => `<button type="button" class="bt-tab bt-tab-${TAB_COLORS[k % TAB_COLORS.length]}" data-bt-page="${esc(p.id)}" aria-current="${p.id === page.id ? 'page' : 'false'}" title="${esc(p.cover ? 'Portadilla e índice' : p.title)}"><span>${p.cover ? '∑' : p.chapter}</span>${esc(p.cover ? 'Índice' : p.title)}</button>`).join('')}</nav>`;
  return `<div class="bt-heading"><span class="bt-eyebrow">${esc(TOMO.world.toUpperCase())} · TOMO ${TOMO.number} · ${esc(TOMO.subject.toUpperCase())}</span><h2>La Bitácora</h2><p>${owner ? `de ${esc(owner)}` : 'Lo que vi. Lo que probé. Lo que todavía no sé.'}</p>
    <span class="bt-download"><button type="button" data-bt-download="pliegos" title="Un PDF para leer o imprimir en casa en hojas A4: el cuaderno abierto, dos páginas por hoja">Descargar la Bitácora</button><button type="button" data-bt-download="libro" title="Un PDF página por página en tamaño A5, como un cuaderno, para llevar a una imprenta">Versión libro A5</button></span></div>
    <div class="bt-desk"><div class="bt-book"><span class="bt-elastic" aria-hidden="true"></span><div class="bt-spread">
      <section class="bt-page bt-left"><div class="bt-page-body">${left}</div><span class="bt-folio">${2 * i + 1}</span>${corner(prev, '← Hoja anterior', 'prev')}</section>
      <span class="bt-spine" aria-hidden="true"></span>
      <section class="bt-page bt-right"><div class="bt-page-body">${right}</div><span class="bt-folio">${2 * i + 2}</span>${corner(next, 'Hoja siguiente →', 'next')}</section>
    </div>${tabs}</div></div>`;
}

/** Todas las páginas del tomo, en orden de lectura, como se imprimen: [{html}], dos por hoja del cuaderno. */
export function bookSections(state, opts = {}) {
  return bitacoraPages(state).flatMap(page => spreadPages(state, page, {...opts, mode: 'print'}));
}
