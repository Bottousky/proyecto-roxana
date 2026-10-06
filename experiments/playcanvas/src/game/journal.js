import {AREAS, JOURNAL, journalText} from './content.js';
import {hasRequirements} from './state.js';

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

export function renderJournal(state, {selected, puzzles={}, evidenceFor=()=>[]}={}) {
  const pages=journalPages(state);
  // Open experiments remain a record even before their explanatory chapter exists.
  for(const [id,snapshot] of Object.entries(state.puzzles || {})) {
    if(!puzzles[id]||pages.some(page=>page.puzzle===id))continue;
    const area=Object.values(AREAS).find(area=>area.objects.some(obj=>obj.puzzle===id))?.id || state.area;
    pages.push({id:`experiment:${id}`,title:puzzles[id].title,area,puzzle:id,text:puzzles[id].observation,experiment:true});
  }
  for(const area of new Set((state.fieldNotes||[]).map(note=>note.area)))if(AREAS[area]&&!pages.some(page=>page.area===area))pages.push({id:`field:${area}`,title:AREAS[area].name,area,text:'Guardé lo que pude observar. Todavía estoy comparando sus causas.',experiment:true});
  const page=pages.find(page=>page.id===selected)||pages.at(-1)||{id:'arrival',title:'La primera pregunta',area:'portal',text:'Todavía no escribí nada. Primero voy a mirar.'};
  const index=pages.indexOf(page),snapshot=state.puzzles?.[page.puzzle],evidence=page.puzzle?evidenceFor(page.puzzle,snapshot):[];
  const field=(state.fieldNotes||[]).filter(note=>note.area===page.area);
  const names={observation:'Lo que observé',measurement:'Una medición',intervention:'Lo que cambié',prediction:'Mi hipótesis',result:'Lo que ocurrió'};
  const notes=[...evidence.map(note=>({title:note.label||names[note.kind]||'Una prueba',text:note.text,reading:note.value,reference:note.reference})),...field];
  const previous=pages[index-1],next=pages[index+1];
  return `<div class="book-heading"><span class="eyebrow">INSTITUTO ROXANA · CUADERNO DE CAMPO</span><h2>La Bitácora</h2><p>Lo que vi. Lo que probé. Lo que todavía no sé.</p></div>
    <div class="fieldbook" data-journal-page="${esc(page.id)}"><nav class="book-index" aria-label="Páginas de la Bitácora"><span class="book-binding-mark">Ω</span><span class="book-index-title">Rastros del viaje</span>${pages.map((item,i)=>`<button data-journal-page="${esc(item.id)}" aria-current="${item.id===page.id?'page':'false'}"><span>${String(i+1).padStart(2,'0')}</span>${esc(item.title)}${item.experiment?'<small>en estudio</small>':''}</button>`).join('')}</nav>
    <article class="book-leaf"><header><span class="eyebrow">${esc(AREAS[page.area]?.name || 'Ohmdal')} · ${page.experiment?'UNA PRUEBA ABIERTA':'MEMORIA DEL ENCUENTRO'}</span><h3>${esc(page.title)}</h3></header><p class="book-experience">${esc(page.text)}</p>${renderCircuitSketch(puzzles[page.puzzle],snapshot)}${page.explanation?`<details class="book-explanation"><summary>La idea que pudimos explicar</summary><p>${esc(page.explanation)}</p></details>`:''}${page.question?`<blockquote>${esc(page.question)}</blockquote>`:''}<details class="book-own-note" ${state.personalNotes?.[page.id]?'open':''}><summary>Dejar mi pregunta o hipótesis</summary><label class="screen-reader-only" for="personal-journal-note">Mi pregunta o hipótesis</label><textarea id="personal-journal-note" data-note-for="${esc(page.id)}" maxlength="1200" rows="3" placeholder="Creo que… / Me pregunto qué pasaría si…">${esc(state.personalNotes?.[page.id]||'')}</textarea><small>Una idea puede cambiar. No hace falta tener la respuesta.</small></details></article>
    <aside class="book-evidence"><span class="eyebrow">PRUEBAS QUE CONSERVÉ</span><h3>El rastro de mis intentos</h3>${notes.length?`<ol>${notes.map(note=>`<li><strong>${esc(note.title)}</strong><p>${esc(note.text)}</p>${note.reading?`<span class="book-reading">${esc(note.reading)}</span>`:''}${note.reference?`<small>${esc(note.reference)}</small>`:''}</li>`).join('')}</ol>`:'<p class="book-empty">Todavía no registré una lectura aquí. Cuando use el instrumento, conservaré los puntos y el resultado.</p>'}<div class="book-marginalia">No borres lo que falló.<br>También cuenta el camino.<span>— anotación de Edda</span></div></aside></div>
    <footer class="book-footer"><button data-journal-page="${esc(previous?.id||page.id)}" ${!previous?'disabled':''} aria-label="Página anterior">← Hoja anterior</button><span>${Math.max(1,index+1)} / ${Math.max(1,pages.length)}</span><button data-journal-page="${esc(next?.id||page.id)}" ${!next?'disabled':''} aria-label="Página siguiente">Hoja siguiente →</button></footer>`;
}
