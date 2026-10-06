// The classic home of the Instituto: the same school as a traditional page, without 3D. Semantic HTML that a
// person, a screen reader or a search engine reads without interpreting a canvas. Pure functions shared by the
// build (the first-visit page is served already written, see vite.config.js) and the browser (clasica.js
// rewrites what depends on the student's own progress, read from the Ohmdal save without ever writing it).
import {WORLDS,RESTORATIONS,schoolStage,trophies,ohmdalSummary,ohmdalPlaces,cinematics} from './progress.js';
import {ROOMS,ROOM_ORDER} from './rooms.js';
import {ISLAND,BUILDINGS,TALLERES,TOWER,AMPHI,FOUNTAIN,LAMPS,PLANTERS} from './layout.js';
import {ARTIFACTS,NOTICE_BOARD} from './artifacts.js';
import {renderNews,visibleItems} from './news.js';
import {renderCommunity} from './social.js';

export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const PLAY='./index.html',CAMPUS='./escuela.html';
/** A room of the 3D campus by its URL (the 3D home routes the same hashes). */
export const room3d=id=>`${CAMPUS}#${id==='patio'?'sobre':id}`;
const fmtTime=s=>{const m=Math.floor((s||0)/60);return m<60?`${m} min`:`${Math.floor(m/60)} h ${m%60} min`;};
const HOUR_PHRASE={manana:'de mañana',tarde:'de tarde',noche:'de noche'};

/** The still of the campus for an hour and a stage: the 3D home's first-paint pictures, in three steps (0–1, 2–6, 7–10). */
export function campusImage(hour,stage){return `./escuela/campus-${HOUR_PHRASE[hour]?hour:'tarde'}${stage>=7?'-e10':stage>=2?'-e5':''}.jpg`;}
export function campusAlt(hour){
  return `El Instituto Roxana ${HOUR_PHRASE[hour]||HOUR_PHRASE.tarde}, visto desde el sudeste: el portón y el camino, el patio con la estatua de Roxana y su fuente, dos talleres a cada lado y, al fondo, el Anfiteatro, la Dirección con su torre y la Sala de Trofeos.`;
}
export function campusCaption(hour,stage,{started=false,preview=null}={}){
  const when=HOUR_PHRASE[hour]||HOUR_PHRASE.tarde;
  const state=stage>=7?'restaurado: la fuente corre, los faroles y los canteros volvieron':stage>=2?'a medio restaurar: lo que Ohmdal ya devolvió se ve desde el portón':'casi a oscuras: la fuente seca, los faroles apagados, los canteros sin flores';
  const whose=preview!==null?`Vista previa de la etapa ${preview}`:started?'Así lo deja tu partida':'Así espera a quien llega';
  return `<b>Lámina I.</b> El Instituto ${when}. ${whose}: ${state}.`;
}

/** The way in: a returning student continues first. */
export function wayIn(save){
  const o=ohmdalSummary(save);
  return {started:o.started,href:PLAY+(o.started?'#continuar':''),label:o.started?'Continuar en Ohmdal':'Entrar a Ohmdal',short:o.started?'Continuar':'Entrar a Ohmdal',
    meta:o.started?`${o.area?o.area+' · ':''}${o.percent}% del Arco I · ${fmtTime(o.playtime)} de viaje`:'Hoy está abierta la entrada a Ohmdal · La Luz: electricidad, nueve lugares.',
    line:o.started?'Tu viaje sigue abierto. El Instituto guarda lo que trajiste.':'El conocimiento cambia los mundos. Y también este lugar.'};
}

/** Restorations the student has not been shown yet (the same record as the 3D home's «Cambió por tu aventura»). */
export function renderChanges(fresh){
  if(!fresh.length)return '';
  return `<section class="changes" aria-labelledby="changes-title"><p class="kicker">Cambió por tu aventura</p>
  <h2 id="changes-title">${fresh.length===1?'Algo volvió al Instituto':`${fresh.length} cosas volvieron al Instituto`}</h2>
  <ul>${fresh.map(r=>`<li><b>${esc(r.world)}.</b> ${esc(r.school)}</li>`).join('')}</ul>
  <p class="meta">Lo que restaurás en Ohmdal vuelve a la escuela. <a href="${CAMPUS}">Verlo en el campus 3D</a></p></section>`;
}

// ── Los Mundos Aplicados ──────────────────────────────────────────────────────
// Plates are stills of each workshop's artifact on the lawn, rendered from the 3D campus (scripts/home-shots.mjs).
const PLATES={
  ohmdal:{src:'./escuela/clasica/mundo-ohmdal.jpg',lit:'./escuela/clasica/mundo-ohmdal-luz.jpg',alt:'El Faro de Ohmdal en miniatura, sobre su pedestal junto al Taller de Electrónica, con la lente apagada.',litAlt:'El Faro de Ohmdal en miniatura junto al Taller de Electrónica, con la lente encendida.'},
  physica:{src:'./escuela/clasica/mundo-physica.jpg',alt:'La columna de vidrio del Taller de Física: adentro el agua sube y una piedra flota; afuera cae, como siempre.'},
  bitland:{src:'./escuela/clasica/mundo-bitland.jpg',alt:'Una ciudad cian sobre un chip, bajo una lupa inclinada, frente al Taller de Programación.'},
  arithmos:{src:'./escuela/clasica/mundo-arithmos.jpg',alt:'Un pizarrón sobre su caballete frente al Taller de Matemática, con una misma cantidad escrita de varias formas.'},
};
const ARTIFACT_LINE={
  physica:'En el césped, una columna de vidrio donde el agua sube: adentro rige otra regla.',
  bitland:'En el césped, una ciudad sobre un chip, bajo una lupa: una sola instrucción se repite.',
  arithmos:'En el césped, un pizarrón donde la misma cantidad cambia de forma de escribirse, no de valor.',
};
// `way` is the real way in: a preview of another stage never offers to continue a journey that is not the student's.
export function renderWorlds(save,{way=wayIn(save)}={}){
  const o=ohmdalSummary(save),lit=schoolStage(save)>=9;
  return WORLDS.map((w,i)=>{
    const p=PLATES[w.id],src=w.id==='ohmdal'&&lit?p.lit:p.src,alt=w.id==='ohmdal'&&lit?p.litAlt:p.alt;
    const figure=`<figure class="plate"><img src="${src}" alt="${esc(alt)}" width="1200" height="800" loading="lazy" decoding="async"><figcaption><b>Lámina ${['II','III','IV','V'][i]}.</b> ${esc(w.taller)}.</figcaption></figure>`;
    const kicker=`<p class="world-kicker"><span class="glyph" aria-hidden="true">${esc(w.glyph)}</span>${esc(w.taller)} · ${esc(w.verb)}</p>`;
    const entry=`<dl class="entry"><dt>Cómo se entra</dt><dd><b>${esc(w.entry.name)}.</b> ${esc(w.entry.detail)}</dd></dl>`;
    if(w.id==='ohmdal')return `<article class="world featured" id="mundo-ohmdal" style="--c:${w.color}" aria-labelledby="w-ohmdal">${figure}<div class="world-body">${kicker}
      <h3 id="w-ohmdal">Ohmdal <span>· La Luz</span></h3><p class="discipline">${esc(w.discipline)} · <span class="open">abierto</span></p>
      <p class="tagline">El mundo no perdió su luz. Olvidó cómo encenderla.</p><p>${esc(w.premise)}</p>${entry}
      ${o.started?`<div class="journey"><div class="bar" role="img" aria-label="${o.percent}% del Arco I"><i style="width:${o.percent}%"></i></div><p class="meta">${esc(wayIn(save).meta)}</p></div>`:'<p class="meta">Arco I · nueve lugares, de un Portal a un Faro.</p>'}
      <p class="artifact-line">En el césped, junto al taller, un Faro en miniatura: ${lit?'lo encendiste en tu viaje; su luz también vive acá.':'su lente sigue apagada. Se enciende acá cuando la enciendas allá.'}</p>
      <div class="actions"><a class="cta" href="${way.href}" data-way>${esc(way.label)}</a><a class="text-link" href="${room3d(w.room)}">Ver el taller en el campus 3D</a></div></div></article>`;
    return `<article class="world" id="mundo-${w.id}" style="--c:${w.color}" aria-labelledby="w-${w.id}">${figure}<div class="world-body">${kicker}
      <h3 id="w-${w.id}">${esc(w.name)}</h3><p class="discipline">${esc(w.discipline)} · <span>en preparación</span></p>
      <p>${esc(w.premise)}</p>${entry}<p class="artifact-line">${esc(ARTIFACT_LINE[w.id])}</p>
      <p class="status">Entrada en preparación: todavía no se puede entrar ni guarda progreso.</p>
      <a class="text-link" href="${room3d(w.room)}">Ver el taller en el campus 3D</a></div></article>`;
  }).join('');
}

// ── Tu registro ───────────────────────────────────────────────────────────────
const KIND={medal:'Medalla',cup:'Copa',crystal:'Cristal',globe:'Mapa',book:'Bitácora'};
export function renderRecord(save,{name='',preview=null,way=wayIn(save)}={}){
  const o=ohmdalSummary(save),stage=schoolStage(save),t=trophies(save),earned=t.filter(x=>x.earned).length,places=ohmdalPlaces(save).filter(p=>p.restored).length,films=cinematics(save).filter(c=>c.unlocked).length;
  const ledger=`<h3>Lo que Ohmdal devuelve al Instituto</h3>
  <ol class="ledger">${RESTORATIONS.map((r,i)=>`<li class="${i<stage?'done':i===stage?'next':''}"><span class="mark" aria-hidden="true">${i<stage?'✓':i+1}</span><div><b>${esc(r.world)} · ${esc(r.title)}</b><p>${i<stage?esc(r.school):i===stage?'Lo próximo que puede volver.':'Todavía en silencio.'}</p></div><span class="visually-hidden">${i<stage?'(restaurado)':i===stage?'(lo próximo)':'(pendiente)'}</span></li>`).join('')}</ol>`;
  const others='<p class="meta note">Physica, Bitland y Arithmos todavía no comparten su progreso con el Instituto: sus gradas y sus funciones esperan a que abran sus entradas.</p>';
  const owner=preview!==null?`<p class="meta">Vista previa de la etapa ${preview}: no es tu partida y no la modifica.</p>`:name?`<p class="meta">A nombre de <b>${esc(name)}</b>.</p>`:'';
  if(!o.started)return `${owner}<div class="record-empty"><p class="lead">Todavía no hay un viaje guardado en este navegador.</p>
    <p>Cuando entres a Ohmdal, cada lugar que restaures devuelve algo al Instituto: el farol a los pies de Roxana, la fuente, los faroles del patio, la linterna de la torre. Este registro lo va anotando.</p>
    <a class="cta" href="${way.href}" data-way>${esc(way.label)}</a></div>${ledger}${others}`;
  return `${owner}<dl class="stats">
    <div><dt>Ohmdal</dt><dd>${o.percent}<small>%</small></dd></div>
    <div><dt>Restauraciones</dt><dd>${stage}<small>/${RESTORATIONS.length}</small></dd></div>
    <div><dt>Lugares en el mapa</dt><dd>${places}<small>/9</small></dd></div>
    <div><dt>Trofeos</dt><dd>${earned}<small>/${t.length}</small></dd></div>
    <div><dt>Funciones</dt><dd>${films}<small>/${cinematics(save).length}</small></dd></div>
    <div><dt>De viaje</dt><dd class="time">${esc(fmtTime(o.playtime))}</dd></div></dl>
  ${o.objective?`<section class="objective"><p class="kicker">Una pregunta abierta</p><b>${esc(o.objective.title)}</b><p>${esc(o.objective.detail)}</p><a class="cta" href="${way.href}" data-way>${esc(way.label)}</a></section>`:''}
  ${ledger}
  <h3>Sala de Trofeos · Ohmdal</h3>
  <ul class="trophies">${t.map(x=>`<li class="${x.earned?'earned':x.progress>0?'':'locked'}"><span class="kind">${KIND[x.kind]||'Trofeo'}</span><b>${esc(x.earned||x.progress>0?x.title:'???')}</b>${x.earned||x.progress>0?`<p>${esc(x.detail)}</p>`:'<span class="visually-hidden">Un lugar espera bajo el vidrio.</span>'}${!x.earned&&x.progress>0?`<div class="bar small" role="img" aria-label="${Math.round(x.progress*100)}%"><i style="width:${Math.round(x.progress*100)}%"></i></div>`:''}</li>`).join('')}</ul>
  ${others}
  <p class="meta">Tu registro y tu partida viven en este navegador. Para cambiar tu nombre o tu emblema, o exportar una copia de la Bitácora, pasá por la <a href="${room3d('direccion')}">Dirección</a>.</p>`;
}

// ── El campus: a site plan drawn from the same coordinates as the 3D school ──────
const PLACE_TEXT={
  direccion:'Tu registro, tu emblema y la copia de tu Bitácora.',
  electronica:'La entrada a Ohmdal: el Portal Ω y el mapa del reino en la pared.',
  fisica:'La entrada a Physica, todavía en preparación.',
  programacion:'La entrada a Bitland, todavía en preparación.',
  matematica:'La entrada a Arithmos, todavía en preparación.',
  trofeos:'Una grada por mundo. La de Ohmdal se llena con tus logros.',
  anfiteatro:'Las escenas que viviste en Ohmdal, proyectadas otra vez.',
  novedades:'La cartelera junto al camino: lo que anuncia el Instituto.',
  patio:'La estatua de la fundadora, la fuente y los faroles.',
};
const MARK={direccion:[BUILDINGS.direccion.x-5,BUILDINGS.direccion.z],trofeos:[BUILDINGS.trofeos.x,BUILDINGS.trofeos.z],anfiteatro:[AMPHI.x,AMPHI.z+3.4],novedades:[NOTICE_BOARD.x+3.2,NOTICE_BOARD.z],patio:[0,-10.5],
  ...Object.fromEntries(Object.keys(TALLERES).map(id=>[id,[BUILDINGS[id].x,BUILDINGS[id].z]]))};
const r1=v=>Math.round(v*10)/10;
export function renderPlan(save){
  const stage=schoolStage(save),t=trophies(save).filter(x=>x.earned).length,films=cinematics(save).filter(c=>c.unlocked).length;
  const {w,d,r}=ISLAND,box=b=>`x="${r1(b.x-b.w/2)}" y="${r1(b.z-b.d/2)}" width="${b.w}" height="${b.d}"`;
  const amphiR=AMPHI.r0+AMPHI.tiers*1.15,ax=AMPHI.x,az=AMPHI.z;
  const rings=Array.from({length:AMPHI.tiers+1},(_,k)=>AMPHI.r0+k*1.15).map(rr=>`<path class="tier" d="M${r1(ax-rr)} ${az}A${rr} ${rr} 0 0 0 ${r1(ax+rr)} ${az}"/>`).join('');
  const lit=stage>=5,water=stage>=4,bloom=stage>=6,gateOpen=stage>=3;
  const svg=`<svg class="plan" viewBox="${-w/2-3} ${-d/2-6} ${w+6} ${d+12}" aria-hidden="true" focusable="false">
    <rect class="lawn" x="${-w/2}" y="${-d/2}" width="${w}" height="${d}" rx="${r}"/>
    <rect class="paving" x="-21" y="-16" width="42" height="34"/><rect class="paving" x="-3.2" y="18" width="6.4" height="16.4"/><rect class="paving" x="-3.5" y="-17.9" width="7" height="2.2"/>
    ${Object.entries(TALLERES).map(([id,tt])=>`<rect class="paving" x="${r1(tt.x+(tt.side==='e'?1:-1)*6.6-1.5)}" y="${r1(tt.z-2.2)}" width="3" height="4.4"/>`).join('')}
    <path class="wall" d="M-43 34.4H-3.4M3.4 34.4H43"/>${gateOpen?'<path class="gate open" d="M-3.4 34.4l1.2 2.6M3.4 34.4l-1.2 2.6"/>':'<path class="gate" d="M-3.4 34.4H3.4"/>'}
    <path class="hedge" d="M-44.6 -30V30M44.6 -30V30M-44 -35.4H-4M4 -35.4H44"/>
    <g class="amphi"><path class="seats" d="M${r1(ax-amphiR)} ${az}A${amphiR} ${amphiR} 0 0 0 ${r1(ax+amphiR)} ${az}Z"/>${rings}<rect class="screen" x="${r1(ax-AMPHI.screenW/2)}" y="${r1(az-1.2)}" width="${AMPHI.screenW}" height=".7"/></g>
    <rect class="building" ${box(BUILDINGS.direccion)}/><rect class="building" ${box(BUILDINGS.trofeos)}/>
    <rect class="building tower" x="${r1(TOWER.x-TOWER.s/2)}" y="${r1(TOWER.z-TOWER.s/2)}" width="${TOWER.s}" height="${TOWER.s}"/>
    ${Object.entries(TALLERES).map(([id,tt])=>{const b=BUILDINGS[id],c=WORLDS.find(x=>x.id===tt.world).color;return `<rect class="building" ${box(b)}/><rect class="accent" style="fill:${c}" x="${r1(tt.side==='e'?b.x+b.w/2-1.1:b.x-b.w/2+.3)}" y="${r1(b.z-b.d/2+.6)}" width=".8" height="${b.d-1.2}"/>`;}).join('')}
    <circle class="fountain${water?' water':''}" cx="${FOUNTAIN.x}" cy="${FOUNTAIN.z}" r="${FOUNTAIN.r}"/><circle class="statue" cx="0" cy="0" r="1.1"/>
    ${PLANTERS.map(([x,z])=>`<rect class="planter${bloom?' bloom':''}" x="${x-1.7}" y="${z-.9}" width="3.4" height="1.8" rx=".3"/>`).join('')}
    ${LAMPS.map(([x,z])=>`<circle class="lamp${lit?' lit':''}" cx="${x}" cy="${z}" r=".55"/>`).join('')}
    ${Object.values(ARTIFACTS).map(a=>{const c=WORLDS.find(x=>x.room===a.room).color;return `<path class="artifact" style="fill:${c}" d="M${a.x} ${r1(a.z-1.3)}l1.3 1.3-1.3 1.3-1.3-1.3z"/>`;}).join('')}
    <rect class="board" x="${NOTICE_BOARD.x-1.4}" y="${NOTICE_BOARD.z-.4}" width="2.8" height=".8" transform="rotate(${-NOTICE_BOARD.ry} ${NOTICE_BOARD.x} ${NOTICE_BOARD.z})"/>
    ${ROOM_ORDER.map((id,i)=>{const [x,z]=MARK[id];return `<a href="${room3d(id)}" tabindex="-1"><circle class="num" cx="${x}" cy="${z}" r="2.5"/><text x="${x}" y="${r1(z+1)}">${i+1}</text></a>`;}).join('')}
    <g class="compass" transform="translate(${w/2-4} ${-d/2+5})"><path d="M0 -3.6l1.6 4.2h-3.2z"/><text y="4.6">N</text></g>
    <g class="scale" transform="translate(${-w/2} ${d/2+3.6})"><path d="M0 0h10M0 -.8v1.6M10 -.8v1.6"/><text x="12" y="1">10 m</text></g>
    <text class="gate-label" x="0" y="${d/2+3.9}">Portón</text>
  </svg>`;
  const extra={trofeos:` <span class="count">${t} de ${trophies(save).length} trofeos de Ohmdal.</span>`,anfiteatro:` <span class="count">${films} de ${cinematics(save).length} funciones de Ohmdal.</span>`};
  const legend=`<ol class="legend">${ROOM_ORDER.map((id,i)=>`<li><a href="${room3d(id)}"><span class="n" aria-hidden="true">${i+1}</span><b>${esc(ROOMS[id].name)}</b><span class="visually-hidden"> (en el campus 3D)</span></a><p>${esc(PLACE_TEXT[id])}${extra[id]||''}</p></li>`).join('')}</ol>`;
  const shows=[lit?'los faroles encendidos':'los faroles apagados',water?'la fuente con agua':'la fuente seca',bloom?'los canteros en flor':'los canteros sin flores',gateOpen?'el portón abierto':'el portón cerrado'];
  return `<figure class="plan-figure">${svg}<figcaption><b>Plano del Instituto.</b> Dibujado con las medidas del campus 3D; los números son también sus atajos de teclado. Hoy muestra ${shows.slice(0,-1).join(', ')} y ${shows.at(-1)}.</figcaption></figure>${legend}`;
}

// ── Sobre Roxana ──────────────────────────────────────────────────────────────
export function renderAboutStage(save){
  const stage=schoolStage(save);
  return `<p class="kicker">Lo que Ohmdal devolvió al Instituto</p><p class="big">${stage} <small>de ${RESTORATIONS.length}</small></p><div class="bar" role="img" aria-label="${stage} de ${RESTORATIONS.length} restauraciones"><i style="width:${stage/RESTORATIONS.length*100}%"></i></div>
  <p class="meta">Cada restauración en Ohmdal devuelve algo al Instituto. Physica, Bitland y Arithmos esperan en sus talleres: su progreso todavía no llega a la escuela.</p>`;
}
export {renderCommunity};

/** News as the 3D home shows it, from the same versioned file. */
export function renderNewsList(raw,{dev=false}={}){return renderNews({status:'ok',items:visibleItems(raw,{dev})});}

/** The page as served: the first visit (no save), written into the HTML at build time. */
export function renderStatic(html,{news=[],dev=false}={}){
  const parts={changes:'',worlds:renderWorlds(null),record:renderRecord(null),plan:renderPlan(null),news:renderNewsList(news,{dev}),about:renderAboutStage(null),community:renderCommunity()};
  return html.replace(/<!--clasica:(\w+)-->/g,(m,k)=>k in parts?parts[k]:m);
}
