import {AREAS, CHARACTERS, JOURNAL, journalText, knowsCharacter, playerName, characterNote} from './content.js';
import {hasRequirements} from './state.js';
import {JOURNEY_PHASES, inferredTime} from './story-time.js';
import {revealFor, CONJUROS, ESTIMATES, estimateChoiceText, estimateVerdict, WORDS, WORD_ORDER, wordsKnown} from './understanding.js';
import {renderSchematic, wordSymbol, renderColorWheel, stoneSketch} from './schematic.js';
import {weighedStones, stoneRings, stoneIn, ringWords, RING_COLORS} from './puzzle-model.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RECORDS = {
  arrival: {area:'portal'}, circuit:{area:'portal',puzzle:'awaken'}, diagnosis:{area:'workshop',puzzle:'workshop'},
  operating_window:{area:'road',puzzle:'gate'}, source_load:{area:'spring',puzzle:'pump'}, parallel:{area:'castle',puzzle:'distribution'},
  power:{area:'terraces',puzzle:'irrigation'}, return_at_scale:{area:'lake'}, tower_source:{area:'lighthouse',puzzle:'beacon_supply'},
  tower_distribution:{area:'lighthouse',puzzle:'beacon_network'}, light:{area:'lighthouse',puzzle:'beacon_lens'}, quiet_mount:{area:'spring',puzzle:null},
};

export function journalPages(state) {
  return JOURNAL.filter(entry => hasRequirements(state, entry.requires)).map(entry => {
    // A page tied to no bench (the Monte Quieto) must not borrow the trials of the one it requires.
    const puzzle = RECORDS[entry.id] && 'puzzle' in RECORDS[entry.id] ? RECORDS[entry.id].puzzle : entry.requires?.find(flag => state.puzzles?.[flag]);
    const area = RECORDS[entry.id]?.area || Object.values(AREAS).find(area => area.objects.some(obj => obj.puzzle === puzzle))?.id || 'lighthouse';
    return {...entry, text: journalText(entry, state), area, puzzle};
  });
}

/** A field reading exists only after the player actually uses Ohm's instrument. */
export function recordFieldObservation(state, object, reading) {
  if (!object?.id || !reading) return false;
  const number = value => Number.isFinite(value) ? Number(value).toLocaleString('es-AR',{maximumFractionDigits:2}) : 'sin referencia';
  const entry = {area:state.area, object:object.id, title:object.label || reading.title, text:reading.notice,
    reference:reading.reference, reading:`${number(reading.voltage)} V · ${number(reading.current)} A`};
  state.fieldNotes ||= [];
  if(state.fieldNotes.some(note => note.area===entry.area && note.object===entry.object && note.reading===entry.reading && note.text===entry.text))return false;
  state.fieldNotes.push(entry);
  if(state.fieldNotes.length>90)state.fieldNotes.splice(0,state.fieldNotes.length-90);
  return true;
}

// The nine places, as they are painted on the map sheet (3 × 3), become the photos taped to each page.
const PHOTO = {portal:[0,0], plaza:[1,0], workshop:[2,0], road:[0,1], spring:[1,1], castle:[2,1], terraces:[0,2], lake:[1,2], lighthouse:[2,2]};
// Each person's portrait on the dialogue sheets: [sheet, column].
const PORTRAIT = {edda:['main',0], lumen:['main',1], nereo:['main',2], vega:['north',1], consejera:['north',2], yesca:['village',0], marin:['village',1], tala:['village',2]};
const PEOPLE_ORDER = ['edda','ohm','lumen','marin','tala','vega','consejera','yesca','nereo'];
// Inks: a ballpoint for what happened, red pencil for numbers, green for guesses, graphite for doubts.
const INK = {observation:'obs', measurement:'measure', intervention:'change', prediction:'guess', result:'result'};
const TAB_COLORS = ['mustard','teal','coral','sage','sky','plum'];

/** When in the story a page was written: the moment its chapter happened, not when it is read. */
export function journalStamp(page) {
  const flags = Object.fromEntries((page.requires || []).map(flag => [flag, true]));
  const phase = JOURNEY_PHASES[inferredTime({flags, area: page.area, visited: [page.area]})];
  return `Día ${phase.day} · ${phase.label}`;
}

function photo(area, caption, tilt = -3) {
  const at = PHOTO[area];
  if (!at) return '';
  return `<figure class="dj-photo" style="--sx:${at[0] * 50}%;--sy:${at[1] * 50}%;--tilt:${tilt}deg"><span class="dj-photo-img" role="img" aria-label="${esc(AREAS[area]?.name || '')}"></span><figcaption>${esc(caption)}</figcaption></figure>`;
}
const squiggle = '<svg class="dj-underline" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C 40 2, 70 11, 110 6 S 190 3, 230 7 S 280 9, 298 4"/></svg>';
const roughFilter = '<svg class="dj-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="dj-rough"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></svg>';

function peoplePage(state) {
  const known = PEOPLE_ORDER.filter(id => knowsCharacter(state, id));
  return `<section class="dj-page dj-left dj-people-page"><div class="dj-page-body"><header class="dj-page-head"><span class="dj-stamp">Personas</span><span class="eyebrow dj-place">Ohmdal · GENTE QUE CONOCÍ</span><h3>Gente que conocí</h3>${squiggle}</header>
    <p class="dj-ink dj-intro">Los anoto para no olvidarme de nadie. Uno arregla mejor cuando sabe para quién.</p>
    <ul class="dj-people">${known.map((id, i) => {
      const [sheet, col] = PORTRAIT[id] || [];
      const face = id === 'ohm' ? 'dj-face-ohm' : `dj-face-${sheet}`;
      return `<li class="dj-person" style="--tilt:${(i % 2 ? 2.5 : -2.2)}deg"><span class="dj-face ${face}" style="--col:${(col ?? 0) * 50}%" role="img" aria-label="${esc(CHARACTERS[id].name)}"></span><div><strong>${esc(CHARACTERS[id].name)}</strong><span class="dj-role">${esc(CHARACTERS[id].role)}</span><p>${esc(characterNote(id, state))}</p></div></li>`;
    }).join('')}</ul>
    ${known.length < PEOPLE_ORDER.length ? `<p class="dj-pencil dj-more">Quedan hojas para la gente que todavía no conozco.</p>` : ''}
  </div></section>`;
}

// The places of the journey, ticked off in pencil as they are reached.
const ROUTE = ['portal','plaza','workshop','road','spring','castle','terraces','lake','lighthouse'];
function routeList(state) {
  const seen = new Set([state.area, ...(state.visited || [])]);
  const reached = ROUTE.filter(id => seen.has(id)), ahead = ROUTE.length - reached.length;
  return `<div class="dj-route"><h4>Por dónde pasé</h4><ol>${reached.map(id => `<li><span aria-hidden="true">✓</span>${esc(AREAS[id].name)}</li>`).join('')}${ahead ? `<li class="dj-route-ahead"><span aria-hidden="true">…</span>${ahead === 1 ? 'un lugar más' : `${ahead} lugares más`}, según el mapa del Instituto</li>` : ''}</ol></div>`;
}

// ── The circuit pages ────────────────────────────────────────────────────────────────────
// What a bench left in the notebook: the montage drawn twice (found / left), what Ohm saw behind it,
// the conjuro its keeper inherited and what the copper answered, and the trials, the ones that decided first.
function schematics(id, snapshot, puzzles) {
  if (!id || !puzzles[id] || !snapshot?.wires) return '';
  return `<div class="dj-schematics">${renderSchematic(id, snapshot, {mode: 'before'})}${renderSchematic(id, snapshot, {mode: 'after', caption: snapshot.completed ? 'Así lo dejé' : 'Así va, por ahora'})}</div>`;
}
function behind(id, snapshot) {
  const reveal = snapshot?.completed ? revealFor(id, snapshot) : null;
  if (!reveal) return '';
  const words = WORD_ORDER.filter(key => WORDS[key].from === id);
  return `<section class="dj-behind"><h4>Lo que hay detrás <small>lo que vio Ohm</small></h4><ol>${reveal.cards.map((card, i) => `<li><span class="dj-num" aria-hidden="true">${i + 1}</span><b>${esc(card.title)}.</b> ${esc(card.text)}</li>`).join('')}</ol>
    ${words.length ? `<ul class="dj-words-mini" aria-label="Palabras del oficio que aparecieron acá">${words.map(key => `<li>${wordSymbol(WORDS[key].symbol)}<span><b>${esc(WORDS[key].term)}</b>${WORDS[key].unit ? ` · ${esc(WORDS[key].unit)}` : ''}</span></li>`).join('')}</ul>` : ''}
    <blockquote class="dj-sticky dj-sticky-question" style="--tilt:2deg"><b>Para pensar</b>${esc(reveal.question)}</blockquote></section>`;
}
function conjuro(id, snapshot) {
  const spell = CONJUROS[id];
  if (!spell || !snapshot?.wires) return '';
  const tested = snapshot.conjuro === true || snapshot.completed === true;
  return `<div class="dj-conjuro"><span class="dj-conjuro-label">✦ El conjuro <small>${esc(spell.heir)}</small></span><p class="dj-conjuro-words">«${esc(spell.words)}»</p><p class="dj-conjuro-copper">${tested ? `<b>Lo que dijo el cobre:</b> ${esc(spell.copper)}` : 'Todavía no lo puse a prueba.'}</p></div>`;
}
function keepersBook(id, snapshot) {
  const book = ESTIMATES[id], mark = snapshot?.estimate;
  if (!book || !mark || mark.choice === 'skip') return '';
  return `<div class="dj-conjuro dj-mark"><span class="dj-conjuro-label">⌖ ${esc(book.book)} <small>marca esperada</small></span><p class="dj-mark-ask">${esc(book.noted)}</p><p class="dj-conjuro-words">«${esc(estimateChoiceText(id, mark.choice))}»</p><p class="dj-conjuro-copper">${mark.settled ? esc(estimateVerdict(id, mark.choice, mark.measured)) : 'Todavía no lo medimos.'}</p></div>`;
}
// The keeper's sum, as it was written down: each part, a line, the total, and the source beside it.
function tallyBlock(id, snapshot, puzzles) {
  const t = puzzles[id]?.tally, r = snapshot?.tally?.readings;
  if (!t || !snapshot?.tally?.closed || !r || !t.parts.every(k => Number.isFinite(r[k]))) return '';
  const current = t.kind === 'current', unit = current ? 'A' : 'V', round = v => Math.round(v * 100) / 100, n = v => round(v).toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const name = k => puzzles[id].components.find(c => c.id === k)?.label.replace(/ · .*/, '') ?? k;
  const parts = t.parts.filter(k => k !== 'source'), sum = parts.reduce((a, k) => a + round(r[k]), 0);
  return `<div class="dj-tally"><span class="dj-conjuro-label">Σ ${esc(t.title)} <small>anotada por ${esc(t.who)}</small></span><table>${parts.map((k, i) => `<tr><td>${i ? '+' : ''}</td><td>${esc(name(k))}</td><td>${n(r[k])} ${unit}</td></tr>`).join('')}<tr class="dj-tally-total"><td>=</td><td></td><td>${n(sum)} ${unit}</td></tr></table><p>${current ? `De la fuente salen ${n(r.source)} A: lo que llega al nudo, sale.` : `La fuente empuja ${puzzles[id].voltage} V: el resto se quedó en los cables.`}</p></div>`;
}
const KEY_TRIALS = new Set(['measurement']);
function trials(notes) {
  if (!notes.length) return '<p class="dj-pencil dj-empty">Todavía no registré una lectura aquí. Cuando use el instrumento, conservaré los puntos y el resultado.</p>';
  const item = note => `<li class="dj-trial dj-ink-${INK[note.kind] || 'obs'}"><strong>${esc(note.title)}</strong><p>${esc(note.text)}</p>${note.reading ? `<span class="dj-reading">${esc(note.reading)}</span>` : ''}${note.reference ? `<small>${esc(note.reference)}</small>` : ''}</li>`;
  // What decided: every measurement, and how it ended. Routine «what happened» notes stay in the full log.
  const last = notes.filter(note => note.kind === 'result').at(-1);
  const key = notes.filter(note => KEY_TRIALS.has(note.kind) || note === last).slice(-6), shown = key.length ? key : notes.slice(-4);
  return `<ol class="dj-trials">${shown.map(item).join('')}</ol>${notes.length > shown.length ? `<details class="dj-all-trials"><summary>Todos mis intentos, en orden (${notes.length})</summary><ol class="dj-trials">${notes.map(item).join('')}</ol></details>` : ''}`;
}

// ── Palabras del oficio ───────────────────────────────────────────────────────────────────
function wordsPages(state) {
  const known = wordsKnown(state), half = Math.ceil(known.length / 2);
  const entry = key => { const w = WORDS[key]; return `<li class="dj-word">${wordSymbol(w.symbol)}<div><strong>${esc(w.term)}</strong>${w.unit ? `<span class="dj-word-unit">${esc(w.unit)}</span>` : ''}<em>En Ohmdal: ${esc(w.world.toLowerCase())}</em><p>${esc(w.text)}</p></div></li>`; };
  return [`<section class="dj-page dj-left dj-words-page"><div class="dj-page-body"><header class="dj-page-head"><span class="dj-stamp">Glosario</span><span class="eyebrow dj-place">INSTITUTO ROXANA · PALABRAS DEL OFICIO</span><h3>Palabras del oficio</h3>${squiggle}</header>
    <p class="dj-ink dj-intro">Acá las cosas tienen nombres de taller. En el Instituto, otros. Los anoto juntos para poder hablar con los dos.</p><ul class="dj-words">${known.slice(0, half).map(entry).join('')}</ul></div>`,
    `<section class="dj-page dj-right dj-words-page"><div class="dj-page-body"><ul class="dj-words">${known.slice(half).map(entry).join('')}</ul>${known.length < WORD_ORDER.length ? '<p class="dj-pencil dj-more">Quedan renglones para las palabras que todavía no usé.</p>' : ''}<div class="dj-marginalia">Ohmio viene de Ohm.<br>Ohm dice que es casualidad.<span>— no le creo</span></div></div>`];
}

// ── La rueda de colores: Lumen's stones, weighed one by one ─────────────────────────────────
const zerosSaid = z => z === 0 ? 'ningún cero' : z === 1 ? 'un cero' : `${z} ceros`;
/** The digits the weighed stones taught: each ring colour that appeared on one of them. */
export function knownRingDigits(snapshot) {
  return new Set(weighedStones(snapshot).flatMap(v => stoneRings(v).slice(0, 3).map(c => RING_COLORS.indexOf(c))));
}
function stoneList(snapshot, puzzles) {
  const tray = puzzles.drawer?.knobs?.[0], weighed = weighedStones(snapshot);
  if (!weighed.length) return '';
  const item = v => { const [a, b, z] = stoneRings(v).map(c => RING_COLORS.indexOf(c)), actual = stoneIn(tray, v)?.actual;
    return `<li class="dj-stone">${stoneSketch(v)}<div><strong>${esc(ringWords(v))}</strong><span>${a} · ${b} · ${zerosSaid(z)} = ${v} Ω</span>${Number.isFinite(actual) ? `<em>Pesó ${actual.toLocaleString('es-AR', {maximumFractionDigits: 1})} Ω${Math.abs(actual - v) > .01 ? `: se corrió un ${(Math.abs(actual - v) / v * 100).toLocaleString('es-AR', {maximumFractionDigits: 1})} %` : ''}</em>` : ''}</div></li>`; };
  return `<header class="dj-evidence-head"><span class="eyebrow">PIEDRAS QUE PESÉ</span><h3>Lo que dicen los anillos</h3></header><ul class="dj-stones">${weighed.map(item).join('')}</ul>`;
}

/** Every page of the book, in order: chapters, open experiments, field notes, people and words. */
function bookPages(state,puzzles={}){
  const pages=journalPages(state);
  // Lumen's drawer is its own page, beside the workshop's chapter: the colour wheel fills stone by stone.
  if(puzzles.drawer&&weighedStones(state.puzzles?.drawer).length){
    const at=pages.findIndex(page=>page.puzzle==='workshop');
    pages.splice(at<0?pages.length:at+1,0,{id:'stones',title:'La rueda de colores',area:'workshop',puzzle:'drawer',wheel:true,requires:['workshop'],
      text:'Lumen elige sus piedras de freno «por temperamento». Las pesé una por una con el instrumento de Ohm. Los anillos no hablan de temperamento: escriben un número.'});
  }
  // Open experiments remain a record even before their explanatory chapter exists.
  for(const [id,snapshot] of Object.entries(state.puzzles || {})) {
    if(!puzzles[id]||pages.some(page=>page.puzzle===id))continue;
    const area=Object.values(AREAS).find(area=>area.objects.some(obj=>obj.puzzle===id))?.id || state.area;
    pages.push({id:`experiment:${id}`,title:puzzles[id].title,area,puzzle:id,text:puzzles[id].observation,experiment:true});
  }
  for(const area of new Set((state.fieldNotes||[]).map(note=>note.area)))if(AREAS[area]&&!pages.some(page=>page.area===area))pages.push({id:`field:${area}`,title:AREAS[area].name,area,text:'Guardé lo que pude observar. Todavía estoy comparando sus causas.',experiment:true});
  const people=PEOPLE_ORDER.some(id=>knowsCharacter(state,id));
  if(people)pages.push({id:'people',title:'Gente que conocí',area:'plaza',people:true});
  if(wordsKnown(state).length)pages.push({id:'words',title:'Palabras del oficio',area:'workshop',words:true});
  return pages;
}

export function renderJournal(state, {selected, puzzles={}, evidenceFor=()=>[], turn=''}={}) {
  const pages=bookPages(state,puzzles);
  const page=pages.find(page=>page.id===selected)||pages.filter(page=>!page.people&&!page.words).at(-1)||{id:'arrival',title:'La primera pregunta',area:'portal',text:'Todavía no escribí nada. Primero voy a mirar.'};
  const index=pages.indexOf(page),snapshot=state.puzzles?.[page.puzzle],evidence=page.puzzle?evidenceFor(page.puzzle,snapshot):[];
  // Field readings belong to the chapter of their place, not to a side page that shares it.
  const field=page.wheel?[]:(state.fieldNotes||[]).filter(note=>note.area===page.area);
  const names={observation:'Lo que observé',measurement:'Una medición',intervention:'Lo que cambié',prediction:'Mi hipótesis',result:'Lo que ocurrió'};
  const notes=[...evidence.map(note=>({kind:note.kind,title:note.label||names[note.kind]||'Una prueba',text:note.text,reading:note.value,reference:note.reference})),...field.map(note=>({...note,kind:'measurement'}))];
  const previous=pages[index-1],next=pages[index+1];
  const owner=playerName(state);
  const tabs=`<nav class="dj-tabs" aria-label="Páginas de la Bitácora">${pages.map((item,i)=>`<button class="dj-tab dj-tab-${TAB_COLORS[i%TAB_COLORS.length]}" data-journal-page="${esc(item.id)}" title="${esc(item.title)}" aria-current="${item.id===page.id?'page':'false'}"><span>${item.people?'✎':item.words?'Ω':String(i+1).padStart(2,'0')}</span>${esc(item.title)}${item.experiment?'<small>en estudio</small>':''}</button>`).join('')}</nav>`;
  const corner=(target,label,dir)=>`<button class="dj-corner dj-corner-${dir}" data-journal-page="${esc(target?.id||page.id)}" ${!target?'disabled':''} aria-label="${dir==='prev'?'Página anterior':'Página siguiente'}">${label}</button>`;
  const stain=index%3===1?'<span class="dj-stain" aria-hidden="true"></span>':'';
  let left,right;
  if(page.words){
    const [l,r]=wordsPages(state);
    left=`${l}<span class="dj-folio">${index+1}</span>${corner(previous,'← Hoja anterior','prev')}</section>`;
    right=`${r}<span class="dj-folio">${index+2}</span>${corner(next,'Hoja siguiente →','next')}</section>`;
  }else if(page.people){
    left=peoplePage(state);
    right=`<section class="dj-page dj-right"><div class="dj-page-body"><div class="dj-sticky dj-sticky-pink" style="--tilt:3deg"><b>Para no olvidar</b>Ohm dice que una lista de gente también es un instrumento de medida. No le discutí.</div>${routeList(state)}<div class="dj-marginalia">Preguntar los nombres primero.<br>Después, lo que necesitan.<span>— me lo dijo Edda, más o menos</span></div></div><span class="dj-folio">${index+1}</span>${corner(previous,'← Hoja anterior','prev')}${corner(next,'Hoja siguiente →','next')}</section>`;
  }else{
    const stamp=page.experiment?'En estudio':journalStamp(page);
    left=`<section class="dj-page dj-left"><div class="dj-page-body">${stain}<header class="dj-page-head"><span class="dj-stamp ${page.experiment?'dj-stamp-open':''}">${esc(stamp)}</span><span class="eyebrow dj-place">${esc(AREAS[page.area]?.name || 'Ohmdal')} · ${page.experiment?'UNA PRUEBA ABIERTA':'MEMORIA DEL ENCUENTRO'}</span><h3>${esc(page.title)}</h3>${squiggle}</header>
      ${photo(page.area, AREAS[page.area]?.name || 'Ohmdal', index%2?3:-3)}<p class="dj-ink">${esc(page.text)}</p>${page.wheel?`${renderColorWheel(knownRingDigits(snapshot))}${knownRingDigits(snapshot).size<10?'<p class="dj-pencil dj-more">Quedan colores sin número: otra piedra, otro día.</p>':''}`:schematics(page.puzzle,snapshot,puzzles)}
      ${page.question?`<blockquote class="dj-sticky" style="--tilt:-2deg">${esc(page.question)}</blockquote>`:''}
      </div><span class="dj-folio">${index+1}</span>${corner(previous,'← Hoja anterior','prev')}</section>`;
    right=`<section class="dj-page dj-right"><div class="dj-page-body">${conjuro(page.puzzle,snapshot)}${keepersBook(page.puzzle,snapshot)}${tallyBlock(page.puzzle,snapshot,puzzles)}${page.wheel?stoneList(snapshot,puzzles):''}${behind(page.puzzle,snapshot)}<header class="dj-evidence-head"><span class="eyebrow">PRUEBAS QUE CONSERVÉ</span><h3>El rastro de mis intentos</h3></header>
      ${trials(notes)}
      ${page.explanation?`<details class="dj-card"><summary>La idea que pudimos explicar</summary><p>${esc(page.explanation)}</p></details>`:''}
      <div class="dj-own-note"><label for="personal-journal-note">Mi pregunta o hipótesis</label><textarea id="personal-journal-note" data-note-for="${esc(page.id)}" maxlength="1200" rows="4" placeholder="Creo que… / Me pregunto qué pasaría si…">${esc(state.personalNotes?.[page.id]||'')}</textarea><small>Una idea puede cambiar. No hace falta tener la respuesta.</small></div>
      <div class="dj-marginalia">No borres lo que falló.<br>También cuenta el camino.<span>— anotación de Edda</span></div>
      </div><span class="dj-folio">${index+2}</span>${corner(next,'Hoja siguiente →','next')}</section>`;
  }
  return `${roughFilter}<div class="book-heading dj-heading"><span class="eyebrow">INSTITUTO ROXANA · CUADERNO DE CAMPO</span><h2>La Bitácora</h2><p>de ${esc(owner)} · Lo que vi. Lo que probé. Lo que todavía no sé.</p><span class="dj-download"><button class="dj-print-button" data-journal-download="spreads" title="Un PDF para leer o imprimir en casa en hojas A4: el cuaderno abierto, dos páginas por hoja">Descargar la Bitácora</button><button class="dj-download-book" data-journal-download="book" title="Un PDF página por página, en tamaño A5, para llevar a una imprenta">Versión libro A5</button></span></div>
    <div class="dj-desk" data-journal-page="${esc(page.id)}"><div class="dj-book ${turn?`dj-turn-${turn}`:''}"><span class="dj-ribbon" aria-hidden="true"></span><span class="dj-band" aria-hidden="true"></span><div class="dj-spread">${left}<span class="dj-spine" aria-hidden="true"></span>${right}</div>${tabs}</div></div>
    <footer class="book-footer dj-footer"><button data-journal-page="${esc(previous?.id||page.id)}" ${!previous?'disabled':''} aria-label="Página anterior">← Hoja anterior</button><span>${Math.max(1,index+1)} / ${Math.max(1,pages.length)}</span><button data-journal-page="${esc(next?.id||page.id)}" ${!next?'disabled':''} aria-label="Página siguiente">Hoja siguiente →</button></footer>`;
}

/**
 * The whole book as loose notebook pages, for the downloadable PDF: the owner's name for the cover,
 * then every page of every spread, in reading order, exactly as the player reads them on screen.
 */
export function journalSheets(state, opts = {}) {
  const pages = bookPages(state, opts.puzzles);
  const sections = pages.flatMap(page => {
    const spread = renderJournal(state, {...opts, selected: page.id, turn: ''}).match(/<div class="dj-spread">([\s\S]*)<\/div><nav class="dj-tabs"/)?.[1] ?? '';
    return spread.split('<span class="dj-spine" aria-hidden="true"></span>').filter(Boolean);
  });
  return {owner: playerName(state), sections};
}
