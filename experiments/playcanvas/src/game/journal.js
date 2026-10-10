import {AREAS, CHARACTERS, JOURNAL, journalText, knowsCharacter, playerName, characterNote} from './content.js';
import {hasRequirements} from './state.js';
import {JOURNEY_PHASES, inferredTime} from './story-time.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RECORDS = {
  arrival: {area:'portal'}, circuit:{area:'portal',puzzle:'awaken'}, diagnosis:{area:'workshop',puzzle:'workshop'},
  operating_window:{area:'road',puzzle:'gate'}, source_load:{area:'spring',puzzle:'pump'}, parallel:{area:'castle',puzzle:'distribution'},
  power:{area:'terraces',puzzle:'irrigation'}, return_at_scale:{area:'lake'}, tower_source:{area:'lighthouse',puzzle:'beacon_supply'},
  tower_distribution:{area:'lighthouse',puzzle:'beacon_network'}, light:{area:'lighthouse',puzzle:'beacon_lens'}, quiet_mount:{area:'spring'},
};

export function journalPages(state) {
  return JOURNAL.filter(entry => hasRequirements(state, entry.requires)).map(entry => {
    const puzzle = RECORDS[entry.id]?.puzzle || entry.requires?.find(flag => state.puzzles?.[flag]);
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

export function renderCircuitSketch(puzzle, snapshot) {
  if(!puzzle || !snapshot?.wires)return '';
  const ports=new Map(puzzle.ports.map(port=>[port.id,port]));
  const wires=snapshot.wires.filter(w=>Array.isArray(w)&&ports.has(w[0])&&ports.has(w[1]));
  const path=(a,b)=>`M${a.x} ${a.y} L${b.x} ${b.y}`;
  return `<figure class="journal-sketch"><svg viewBox="0 0 1000 500" role="img" aria-label="Croquis de las conexiones que dejaste en esta instalación"><g class="sketch-wires">${wires.map(([a,b])=>`<path d="${path(ports.get(a),ports.get(b))}"/>`).join('')}</g><g class="sketch-pieces">${puzzle.components.map(c=>{
    const a=ports.get(c.a),b=ports.get(c.b);if(!a||!b)return '';
    const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
    return `<path d="${path(a,b)}"/><rect x="${x-63}" y="${y-17}" width="126" height="34"/><text x="${x}" y="${y-28}">${esc(c.label.replace(/ · .*/,''))}</text>`;
  }).join('')}</g><g class="sketch-ports">${puzzle.ports.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="7"/>${p.id==='positive'||p.id==='negative'?`<text x="${p.x}" y="${p.y-24}">${p.id==='positive'?'Fuente +':'Retorno −'}</text>`:''}`).join('')}</g></svg><figcaption>El montaje que dejé. Los trazos siguen mis conexiones.</figcaption></figure>`;
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

export function renderJournal(state, {selected, puzzles={}, evidenceFor=()=>[], turn=''}={}) {
  const pages=journalPages(state);
  // Open experiments remain a record even before their explanatory chapter exists.
  for(const [id,snapshot] of Object.entries(state.puzzles || {})) {
    if(!puzzles[id]||pages.some(page=>page.puzzle===id))continue;
    const area=Object.values(AREAS).find(area=>area.objects.some(obj=>obj.puzzle===id))?.id || state.area;
    pages.push({id:`experiment:${id}`,title:puzzles[id].title,area,puzzle:id,text:puzzles[id].observation,experiment:true});
  }
  for(const area of new Set((state.fieldNotes||[]).map(note=>note.area)))if(AREAS[area]&&!pages.some(page=>page.area===area))pages.push({id:`field:${area}`,title:AREAS[area].name,area,text:'Guardé lo que pude observar. Todavía estoy comparando sus causas.',experiment:true});
  const people=PEOPLE_ORDER.some(id=>knowsCharacter(state,id));
  if(people)pages.push({id:'people',title:'Gente que conocí',area:'plaza',people:true});
  const page=pages.find(page=>page.id===selected)||pages.filter(page=>!page.people).at(-1)||{id:'arrival',title:'La primera pregunta',area:'portal',text:'Todavía no escribí nada. Primero voy a mirar.'};
  const index=pages.indexOf(page),snapshot=state.puzzles?.[page.puzzle],evidence=page.puzzle?evidenceFor(page.puzzle,snapshot):[];
  const field=(state.fieldNotes||[]).filter(note=>note.area===page.area);
  const names={observation:'Lo que observé',measurement:'Una medición',intervention:'Lo que cambié',prediction:'Mi hipótesis',result:'Lo que ocurrió'};
  const notes=[...evidence.map(note=>({kind:note.kind,title:note.label||names[note.kind]||'Una prueba',text:note.text,reading:note.value,reference:note.reference})),...field.map(note=>({...note,kind:'measurement'}))];
  const previous=pages[index-1],next=pages[index+1];
  const owner=playerName(state);
  const tabs=`<nav class="dj-tabs" aria-label="Páginas de la Bitácora">${pages.map((item,i)=>`<button class="dj-tab dj-tab-${TAB_COLORS[i%TAB_COLORS.length]}" data-journal-page="${esc(item.id)}" aria-current="${item.id===page.id?'page':'false'}"><span>${item.people?'✎':String(i+1).padStart(2,'0')}</span>${esc(item.title)}${item.experiment?'<small>en estudio</small>':''}</button>`).join('')}</nav>`;
  const corner=(target,label,dir)=>`<button class="dj-corner dj-corner-${dir}" data-journal-page="${esc(target?.id||page.id)}" ${!target?'disabled':''} aria-label="${dir==='prev'?'Página anterior':'Página siguiente'}">${label}</button>`;
  const stain=index%3===1?'<span class="dj-stain" aria-hidden="true"></span>':'';
  let left,right;
  if(page.people){
    left=peoplePage(state);
    right=`<section class="dj-page dj-right"><div class="dj-page-body"><div class="dj-sticky dj-sticky-pink" style="--tilt:3deg"><b>Para no olvidar</b>Ohm dice que una lista de gente también es un instrumento de medida. No le discutí.</div>${routeList(state)}<div class="dj-marginalia">Preguntar los nombres primero.<br>Después, lo que necesitan.<span>— me lo dijo Edda, más o menos</span></div></div><span class="dj-folio">${index+1}</span>${corner(previous,'← Hoja anterior','prev')}${corner(next,'Hoja siguiente →','next')}</section>`;
  }else{
    const stamp=page.experiment?'En estudio':journalStamp(page);
    left=`<section class="dj-page dj-left"><div class="dj-page-body">${stain}<header class="dj-page-head"><span class="dj-stamp ${page.experiment?'dj-stamp-open':''}">${esc(stamp)}</span><span class="eyebrow dj-place">${esc(AREAS[page.area]?.name || 'Ohmdal')} · ${page.experiment?'UNA PRUEBA ABIERTA':'MEMORIA DEL ENCUENTRO'}</span><h3>${esc(page.title)}</h3>${squiggle}</header>
      ${photo(page.area, AREAS[page.area]?.name || 'Ohmdal', index%2?3:-3)}<p class="dj-ink">${esc(page.text)}</p>${renderCircuitSketch(puzzles[page.puzzle],snapshot)}
      ${page.explanation?`<details class="dj-card"><summary>La idea que pudimos explicar</summary><p>${esc(page.explanation)}</p></details>`:''}
      ${page.question?`<blockquote class="dj-sticky" style="--tilt:-2deg">${esc(page.question)}</blockquote>`:''}
      </div><span class="dj-folio">${index+1}</span>${corner(previous,'← Hoja anterior','prev')}</section>`;
    right=`<section class="dj-page dj-right"><div class="dj-page-body"><header class="dj-evidence-head"><span class="eyebrow">PRUEBAS QUE CONSERVÉ</span><h3>El rastro de mis intentos</h3></header>
      ${notes.length?`<ol class="dj-trials">${notes.map(note=>`<li class="dj-trial dj-ink-${INK[note.kind]||'obs'}"><strong>${esc(note.title)}</strong><p>${esc(note.text)}</p>${note.reading?`<span class="dj-reading">${esc(note.reading)}</span>`:''}${note.reference?`<small>${esc(note.reference)}</small>`:''}</li>`).join('')}</ol>`:'<p class="dj-pencil dj-empty">Todavía no registré una lectura aquí. Cuando use el instrumento, conservaré los puntos y el resultado.</p>'}
      <div class="dj-own-note"><label for="personal-journal-note">Mi pregunta o hipótesis</label><textarea id="personal-journal-note" data-note-for="${esc(page.id)}" maxlength="1200" rows="4" placeholder="Creo que… / Me pregunto qué pasaría si…">${esc(state.personalNotes?.[page.id]||'')}</textarea><small>Una idea puede cambiar. No hace falta tener la respuesta.</small></div>
      <div class="dj-marginalia">No borres lo que falló.<br>También cuenta el camino.<span>— anotación de Edda</span></div>
      </div><span class="dj-folio">${index+2}</span>${corner(next,'Hoja siguiente →','next')}</section>`;
  }
  return `${roughFilter}<div class="book-heading dj-heading"><span class="eyebrow">INSTITUTO ROXANA · CUADERNO DE CAMPO</span><h2>La Bitácora</h2><p>de ${esc(owner)} · Lo que vi. Lo que probé. Lo que todavía no sé.</p></div>
    <div class="dj-desk" data-journal-page="${esc(page.id)}"><div class="dj-book ${turn?`dj-turn-${turn}`:''}"><span class="dj-ribbon" aria-hidden="true"></span><span class="dj-band" aria-hidden="true"></span><div class="dj-spread">${left}<span class="dj-spine" aria-hidden="true"></span>${right}</div>${tabs}</div></div>
    <footer class="book-footer dj-footer"><button data-journal-page="${esc(previous?.id||page.id)}" ${!previous?'disabled':''} aria-label="Página anterior">← Hoja anterior</button><span>${Math.max(1,index+1)} / ${Math.max(1,pages.length)}</span><button data-journal-page="${esc(next?.id||page.id)}" ${!next?'disabled':''} aria-label="Página siguiente">Hoja siguiente →</button></footer>`;
}
