import '../fonts.css';
import './escuela.css';
import {SchoolDiorama,HOURS,hourFor} from './diorama.js';
import {ROOMS,ROOM_ORDER,OVERVIEW,TALLER_ROOMS} from './rooms.js';
import {RESTORATIONS,WORLDS,worldByRoom,readOhmdal,schoolStage,previewState,trophies,cinematics,ohmdalSummary,readProfile,saveProfile} from './progress.js';
import {SAVE_KEY,validateState} from '../game/state.js';
import {CHANNEL,EXPLICACIONES,ANIMACIONES,CINEMATIC_FILES} from './videos.js';
import {Ambience} from './ambience.js';
import {loadNews,renderNews,unreadCount} from './news.js';
import {renderCommunity} from './social.js';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base=import.meta.env.BASE_URL;
const asset=p=>base+p.replace(/^\//,'');
const I={
  close:'<path d="M6 6l12 12M18 6 6 18"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dusk:'<path d="M3 17h18M6 13a6 6 0 0 1 12 0M12 3v3M4.2 7.2l1.6 1.6M19.8 7.2l-1.6 1.6M8 21h8"/>',moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sound:'<path d="m3 9h4l5-5v16l-5-5H3zM16 8q4 4 0 8"/>',mute:'<path d="m3 9h4l5-5v16l-5-5H3zM16 9l5 6M21 9l-5 6"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',play:'<path d="M7 4v16l13-8z"/>',check:'<path d="m5 12 5 5L20 7"/>',
  home:'<path d="M3 11 12 3l9 8M5 9v12h14V9"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',upload:'<path d="M12 21V9m-5 5 5-5 5 5M4 3h16"/>',spark:'<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>',
  medal:'<circle cx="12" cy="15" r="6"/><path d="M8 3l4 6 4-6M12 12v6M9 15h6"/>',cup:'<path d="M7 3h10v5a5 5 0 0 1-10 0zM7 5H3a4 4 0 0 0 4 5M17 5h4a4 4 0 0 1-4 5M12 13v4M8 21h8M9 17h6"/>',
  crystal:'<path d="M12 2 5 9l7 13 7-13zM5 9h14M9 9l3 13 3-13"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',book:'<path d="M3 4h6q3 0 3 3v14q-1-3-4-3H3zm18 0h-6q-3 0-3 3v14q1-3 4-3h5z"/>',
};
const svg=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]||I.spark}</svg>`;
const CRESTS={omega:{label:'Ω',name:'Omega'},engranaje:{label:'⚙',name:'Engranaje'},compas:{label:'⌖',name:'Compás'},llave:{label:'⚿',name:'Llave'}};

// ── State ───────────────────────────────────────────────────────────────────────
const params=new URLSearchParams(location.search);
const previewStage=params.has('etapa')?Math.max(0,Math.min(10,Number(params.get('etapa'))||0)):null;
let profile=readProfile();
let save=previewStage!==null?previewState(previewStage):readOhmdal();
const settings=profile.settings;

document.querySelector('#escuela').insertAdjacentHTML('afterbegin',`
  <canvas id="diorama" aria-label="Campus del Instituto Roxana en 3D. Tocá un edificio para acercarte; el directorio de abajo lleva a cada sala." tabindex="0"></canvas>
  <div id="labels" class="labels" aria-hidden="true"></div>
  <div id="letterbox" class="letterbox" aria-hidden="true"><i></i><i></i></div>
  <div class="brand" role="group" aria-label="Instituto Roxana">
    <button id="home" class="crest" title="Vista general" aria-label="Volver a la vista general del Instituto">Ω</button>
    <div><p class="brand-name">Instituto Roxana</p><p class="brand-sub">Escuela de Mundos Aplicados</p></div>
    <a class="brand-cta" id="brand-cta" href="./index.html">Entrar a Ohmdal</a>
  </div>
  <nav class="tools" aria-label="Ambiente">
    <div class="hours" role="radiogroup" aria-label="Hora del día">
      ${Object.entries(HOURS).map(([id,h])=>`<button role="radio" data-hour="${id}" aria-label="${h.label}" title="${h.label}">${svg(id==='manana'?'sun':id==='tarde'?'dusk':'moon')}</button>`).join('')}
    </div>
    <button id="sound-button" class="tool" aria-pressed="false" aria-label="Sonido" title="Sonido">${svg('mute')}</button>
    <button id="settings-button" class="tool" aria-label="Ajustes" title="Ajustes">${svg('gear')}</button>
  </nav>
  <section id="settings" class="settings hidden" aria-label="Ajustes">
    <label><input type="checkbox" id="opt-motion"> Reducir movimiento</label>
    <label><input type="checkbox" id="opt-quality"> Gráficos de alta calidad</label>
    <label>Ver la escuela en otra etapa <select id="opt-stage"><option value="">Mi partida</option>${Array.from({length:11},(_,i)=>`<option value="${i}">Etapa ${i}${i?` · ${RESTORATIONS[i-1].world}`:' · abandonada'}</option>`).join('')}</select></label>
    <small>La vista previa no modifica tu partida.</small>
  </section>
  <div id="preview-banner" class="preview-banner hidden"></div>
  <footer class="dock">
    <div class="school-meter" id="school-meter"></div>
    <nav class="directory" aria-label="Salas del Instituto">
      ${ROOM_ORDER.map(id=>`<button data-room="${id}" ${TALLER_ROOMS.includes(id)?`class="taller-tab" style="--c:${worldByRoom(id).color}"`:''}><span>${esc(ROOMS[id].short)}</span></button>`).join('')}
    </nav>
  </footer>
  <aside id="panel" class="panel" aria-hidden="true" tabindex="-1"><div class="panel-inner" id="panel-inner"></div></aside>
  <div id="caption" class="caption" aria-live="polite"></div>
  <div id="changes" class="changes hidden" role="dialog" aria-labelledby="changes-title"></div>
  <section id="light" class="light-worlds hidden" aria-label="Mundos Aplicados"></section>
  <div id="portal-flash" class="portal-flash"></div>
  <div id="toast" class="toast" role="status"></div>`);

const canvas=$('#diorama');
const ambience=new Ambience();
// Without WebGL the home still works as a designed page: a quiet stand-in answers the
// diorama's calls and the light version lists the worlds, news and Roxana.
function quietDiorama(){const state={quiet:true,focusId:null,hoverId:null,hourId:'tarde',screen:null};return new Proxy(state,{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});}
let diorama;
try{diorama=new SchoolDiorama(canvas,{quality:settings.quality,reducedMotion:settings.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches});}
catch(err){console.warn('Campus 3D no disponible:',err.message);diorama=quietDiorama();}
diorama.hourId=params.get('hora')&&HOURS[params.get('hora')]?params.get('hora'):hourFor();

// ── Labels over the buildings ───────────────────────────────────────────────────
const labels=new Map();
for(const id of ROOM_ORDER){
  const el=document.createElement('button');el.className='room-label';el.dataset.room=id;el.tabIndex=-1;
  el.innerHTML=`<span class="pin"></span><span class="text"><b>${esc(ROOMS[id].name)}</b><small>${esc(ROOMS[id].eyebrow)}</small></span>`;
  el.addEventListener('click',()=>openRoom(id));el.addEventListener('pointerenter',()=>diorama.setHover(id));el.addEventListener('pointerleave',()=>diorama.setHover(null));
  $('#labels').appendChild(el);labels.set(id,el);
}
diorama.onFrame=()=>{
  const focus=diorama.focusId,hide=document.body.classList.contains('showcasing');
  // Labels never sit under the intro text nor half outside the screen.
  const intro=document.body.classList.contains('exploring')?null:$('#intro').getBoundingClientRect(),W=innerWidth;
  for(const [id,el] of labels){
    const p=diorama.project(ROOMS[id].anchor),half=el.querySelector('.text').offsetWidth/2||70;
    const clear=p&&p.x-half>8&&p.x+half<W-8&&!(intro&&p.x-half<intro.right+12&&p.y-40<intro.bottom+12&&p.x+half>intro.left);
    const visible=clear&&!hide&&!focus;
    el.style.opacity=visible?'':'0';el.style.pointerEvents=visible?'':'none';
    if(p)el.style.transform=`translate(${p.x}px,${p.y}px)`;
    el.classList.toggle('hover',diorama.hoverId===id);
  }
};
diorama.onHover=id=>{if(id)ambience.tick();document.querySelectorAll('.directory button').forEach(b=>b.classList.toggle('hover',b.dataset.room===id));};
diorama.onSelect=id=>{if(document.body.classList.contains('showcasing'))return;if(id)openRoom(id);else if(diorama.focusId)closeRoom();};

// ── Rooms ───────────────────────────────────────────────────────────────────────
function openRoom(id){
  if(id==='sobre')id='patio';
  if(id==='novedades')return openNews();
  if(!ROOMS[id])return;
  explore();
  if(diorama.focusId!==id)ambience.chime();ambience.set({room:TALLER_ROOMS.includes(id)?(worldByRoom(id).available?'taller':'dormant'):id});
  diorama.focus(id);document.body.classList.add('room-open');diorama.panelShift=panelFraction();diorama.panelShiftY=innerWidth>820?0:.6;
  document.querySelectorAll('.directory button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.room===id)));
  const panel=$('#panel');if(!panel.dataset.room)opener=document.activeElement;panel.dataset.room=id;panel.setAttribute('aria-hidden','false');
  $('#panel-inner').innerHTML=`<header class="panel-head"><button class="panel-back" id="panel-back" aria-label="Volver al Instituto">${svg('back')}<span>Instituto</span></button><span class="eyebrow">${esc(ROOMS[id].eyebrow)}</span><h2>${esc(ROOMS[id].name)}</h2></header><div class="panel-body">${renderRoom(id)}</div>`;
  $('#panel-back').addEventListener('click',closeRoom);bindRoom(id);
  if(!profile.rooms.includes(id)){profile.rooms.push(id);persistProfile();}
  history.replaceState(null,'',`${location.pathname}${location.search}#${id==='patio'?'sobre':id}`);
  requestAnimationFrame(()=>panel.focus({preventScroll:true}));
}
let opener=null;
function closeRoom({intro=false}={}){
  const was=opener;opener=null;
  stopPlayback();ambience.set({room:null});diorama.focus(null);document.body.classList.remove('room-open');
  $('#panel').setAttribute('aria-hidden','true');delete $('#panel').dataset.room;document.querySelectorAll('.directory button').forEach(b=>b.setAttribute('aria-current','false'));
  history.replaceState(null,'',location.pathname+location.search);
  if(intro)showIntro();else{diorama.panelShift=introShift();diorama.panelShiftY=introShiftY();}
  // Focus returns to what opened the panel, or to the campus.
  const back=was&&was.isConnected&&was!==document.body&&!was.closest('#panel')?was:document.body.classList.contains('light')?$('#cta-play'):canvas;back.focus({preventScroll:true});
}
function panelFraction(){return innerWidth>820?Math.min(440,innerWidth*.38)/innerWidth:0;}
addEventListener('resize',()=>{if(diorama.focusId)diorama.panelShift=panelFraction();diorama.panelShiftY=innerWidth>820?0:.6;});
function renderRoom(id){return TALLER_ROOMS.includes(id)?renderTaller(id):({direccion:renderDireccion,trofeos:renderTrofeos,anfiteatro:renderAnfiteatro,patio:renderPatio}[id])();}
function bindRoom(id){if(TALLER_ROOMS.includes(id))return bindTaller(id);if(id==='novedades')return;({direccion:bindDireccion,trofeos:bindTrofeos,anfiteatro:bindAnfiteatro,patio:()=>{}}[id])();}

const fmtDate=t=>t?new Date(t).toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'}):'—';
const fmtTime=s=>{const m=Math.floor((s||0)/60);return m<60?`${m} min`:`${Math.floor(m/60)} h ${m%60} min`;};

function renderDireccion(){
  const o=ohmdalSummary(save),t=trophies(save),earned=t.filter(x=>x.earned).length,crest=CRESTS[profile.crest];
  return `
  <section class="card student-card">
    <div class="crest-big" aria-hidden="true">${crest.label}</div>
    <div class="student-fields">
      <label class="field"><span>Nombre en el registro</span><input id="student-name" maxlength="40" autocomplete="nickname" placeholder="¿Cómo te llamamos?" value="${esc(profile.name)}"></label>
      <p class="meta">Estudiante desde el ${fmtDate(profile.createdAt)}</p>
    </div>
    <fieldset class="crests"><legend>Emblema</legend>${Object.entries(CRESTS).map(([k,c])=>`<label title="${c.name}"><input type="radio" name="crest" value="${k}" ${k===profile.crest?'checked':''}><span>${c.label}</span></label>`).join('')}</fieldset>
  </section>
  <section class="stats">
    <div><b>${o.percent}%</b><span>Ohmdal</span></div>
    <div><b>${earned}<small>/${t.length}</small></b><span>Trofeos</span></div>
    <div><b>${profile.rooms.length}<small>/${ROOM_ORDER.length}</small></b><span>Salas visitadas</span></div>
  </section>
  <h3>Bitácoras</h3>
  <section class="card save-card">
    <div class="save-row"><div><b>Ohmdal · La Luz</b><p class="meta">${o.started?`${esc(o.area||'')} · ${fmtTime(o.playtime)} de viaje · guardada el ${fmtDate(o.savedAt)}`:'Todavía sin comenzar.'}</p></div><span class="pill">${o.started?`${o.percent}%`:'Nueva'}</span></div>
    <div class="progress"><i style="width:${o.percent}%"></i></div>
    <div class="row-buttons">
      <button class="quiet" id="export-save" ${o.started&&previewStage===null?'':'disabled'}>${svg('download')} Exportar copia</button>
      <label class="quiet file-button">${svg('upload')} Importar copia<input type="file" id="import-save" accept="application/json,.json"></label>
      <button class="danger" id="reset-save" ${o.started&&previewStage===null?'':'disabled'}>Borrar partida</button>
    </div>
    ${previewStage!==null?'<p class="meta note">Estás viendo una vista previa. Las acciones sobre la partida real están en pausa.</p>':''}
  </section>
  ${WORLDS.filter(w=>!w.available).map(w=>`<section class="card save-card muted-card"><div class="save-row"><div><b>${esc(w.name)}</b><p class="meta">${esc(w.taller)} · entrada en preparación</p></div><span class="pill muted">Sin bitácora</span></div></section>`).join('')}
  <h3>Preferencias</h3>
  <section class="card prefs">
    <label class="switch"><input type="checkbox" id="pref-sound" ${settings.muted?'':'checked'}><span>Sonido del Instituto y de los videos</span></label>
    <label class="switch"><input type="checkbox" id="pref-motion" ${settings.reducedMotion?'checked':''}><span>Reducir movimiento</span></label>
    <label class="switch"><input type="checkbox" id="pref-quality" ${settings.quality==='high'?'checked':''}><span>Gráficos de alta calidad</span></label>
  </section>
  <p class="meta note">Tu registro vive en este navegador. Exportá una copia para llevar tu Bitácora a otro equipo.</p>`;
}
function bindDireccion(){
  $('#student-name').addEventListener('input',e=>{profile.name=e.target.value.trim().slice(0,40);persistProfile();refreshGreeting();});
  document.querySelectorAll('input[name=crest]').forEach(r=>r.addEventListener('change',()=>{profile.crest=r.value;persistProfile();$('.crest-big').textContent=CRESTS[r.value].label;}));
  $('#export-save')?.addEventListener('click',()=>{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Ohmdal-La-Luz-bitacora.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Copia de la Bitácora descargada.');});
  $('#import-save')?.addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{const state=validateState(JSON.parse(await file.text()));if(previewStage!==null)throw new Error('Salí de la vista previa para importar.');localStorage.setItem(SAVE_KEY,JSON.stringify(state));save=state;refreshProgress();openRoom('direccion');toast('Bitácora importada. La escuela se actualiza.');}
    catch(err){toast(err.message||'No se pudo leer la copia.');}
  });
  $('#reset-save')?.addEventListener('click',()=>{
    if(!confirm('¿Borrar la partida de Ohmdal de este navegador? Exportá una copia antes si querés conservarla.'))return;
    localStorage.removeItem(SAVE_KEY);save=null;refreshProgress();openRoom('direccion');toast('Partida borrada.');
  });
  $('#pref-sound').addEventListener('change',e=>setSound(e.target.checked));
  $('#pref-motion').addEventListener('change',e=>{settings.reducedMotion=e.target.checked;persistProfile();applySettings();});
  $('#pref-quality').addEventListener('change',e=>{settings.quality=e.target.checked?'high':'low';persistProfile();applySettings();});
}

function renderTaller(id){
  const w=worldByRoom(id);
  const hero=w.id==='ohmdal'
    ?`<section class="world-hero" style="--cover:url('${asset('/assets/cover.webp')}')"><div class="hero-shade"></div><div class="hero-text"><span class="eyebrow">Mundo aplicado · ${esc(w.verb)}</span><h3>OHMDAL</h3><p class="rule">LA LUZ</p><p>El mundo no perdió su luz. Olvidó cómo encenderla.</p></div></section>`
    :`<section class="world-hero generated" style="--c:${w.color}"><span class="hero-glyph" aria-hidden="true">${esc(w.glyph)}</span><div class="hero-shade"></div><div class="hero-text"><span class="eyebrow">Mundo aplicado · ${esc(w.verb)}</span><h3>${esc(w.name.toUpperCase())}</h3><p class="rule">${esc(w.discipline.toUpperCase())}</p><p>${esc(w.entry.name)}: todavía en preparación.</p></div></section>`;
  if(w.id!=='ohmdal')return `${hero}
  <div class="cta-row"><button class="primary" disabled>${svg('lock')} Entrada en preparación</button>${w.entry.preview?`<button class="quiet" id="preview-entry">${svg('play')} Ver la entrada</button>`:`<span class="meta">Verbo central: ${esc(w.verb)}</span>`}</div>
  <section class="card"><span class="eyebrow">Cómo se entra</span><b class="entry-name">${esc(w.entry.name)}</b><p>${esc(w.entry.detail)}</p></section>
  <section class="card"><span class="eyebrow">El mundo</span><p>${esc(w.premise)}</p></section>
  <h3>Lo que ${esc(w.name)} devuelve a la escuela</h3>
  <p class="meta empty">Cuando se abra esta entrada, sus restauraciones también van a cambiar el Instituto: este taller, su grada en la Sala de Trofeos y sus funciones en el Anfiteatro.</p>`;
  const o=ohmdalSummary(save),stage=schoolStage(save);
  return `${hero}
  <div class="cta-row"><button class="primary" id="enter-portal">${o.started?'Continuar el viaje':'Cruzar el Portal'} ${svg('arrow')}</button><span class="meta">${o.started?`${o.percent}% · ${fmtTime(o.playtime)}`:'Arco I · nueve lugares'}</span></div>
  ${o.started&&o.objective?`<section class="card objective"><span class="eyebrow">Una pregunta abierta</span><b>${esc(o.objective.title)}</b><p>${esc(o.objective.detail)}</p></section>`:''}
  <h3>Lo que Ohmdal devuelve a la escuela</h3>
  <ol class="timeline">${RESTORATIONS.map((r,i)=>`<li class="${i<stage?'done':i===stage?'next':''}"><span class="dot">${i<stage?svg('check'):i+1}</span><div><b>${esc(r.world)} · ${esc(r.title)}</b><p>${i<stage?esc(r.school):i===stage?'Lo próximo que puede volver.':'Todavía en silencio.'}</p></div></li>`).join('')}</ol>`;
}
function bindTaller(id){$('#enter-portal')?.addEventListener('click',enterPortal);$('#preview-entry')?.addEventListener('click',()=>previewEntry(id));}
// A preview of how a world still in preparation will be entered. Only Arithmos has one so far.
const PREVIEWS={
  arithmos:{flash:'chalk',lines:{door:'La tiza traza una puerta.',walk:'Quien la cruza se vuelve parte del dibujo.',plane:'Del otro lado, un plano que no termina.',dive:'Una misma idea, muchas formas de escribirla.'}},
  physica:{flash:'quantum',lines:{a:'Una pecera con un mundo adentro.',b:'Desde la consola se regulan sus leyes.',c:'Quien se acerca se vuelve del tamaño de un átomo.',dive:'Un mundo donde las leyes se pueden regular.'}},
  bitland:{flash:'vr',lines:{a:'Un casco conectado a un microcontrolador.',b:'El visor se enciende.',c:'Adentro del chip, una ciudad corre sobre instrucciones.',dive:'Bitland.'}},
};
function previewEntry(id){
  const w=worldByRoom(id),plan=PREVIEWS[w?.id];
  if(!plan||document.body.classList.contains('showcasing'))return;
  document.body.classList.add('showcasing','previewing');diorama.panelShift=0;diorama.panelShiftY=0;ambience.chime([392,523.3,659.3]);
  const flash=$('#portal-flash');
  diorama.playEntryPreview(w.id,{
    onLine:key=>caption(w.name,plan.lines[key]||''),
    onDive:()=>{ambience.chime([523.3,784,1046.5,1318.5]);flash.classList.add('on',plan.flash);setTimeout(()=>flash.classList.remove('on'),900);},
    onEnd:()=>{caption('');document.body.classList.remove('showcasing','previewing');setTimeout(()=>flash.classList.remove(plan.flash),600);diorama.panelShift=panelFraction();diorama.panelShiftY=innerWidth>820?0:.6;toast(`Así se va a entrar a ${w.name}. El mundo todavía está en preparación.`);},
  });
}
function enterPortal(){
  diorama.flyTo({target:[-34.2,2.25,-4],yaw:90,pitch:6,distance:9});
  document.body.classList.add('entering');$('#portal-flash').classList.add('on');
  setTimeout(()=>{location.href=base+'index.html'+(save&&previewStage===null?'#continuar':'');},settings.reducedMotion?50:1500);
}

let trophyWorld='ohmdal';
function renderTrofeos(){
  const w=WORLDS.find(x=>x.id===trophyWorld),list=w.available?trophies(save):Array.from({length:12},()=>({title:'???',detail:'',earned:false,progress:0,kind:'medal'})),earned=list.filter(t=>t.earned).length;
  return `
  <div class="tabs" role="tablist">${WORLDS.map(x=>`<button role="tab" data-world="${x.id}" aria-selected="${x.id===trophyWorld}" style="--c:${x.color}"><span class="tab-glyph">${esc(x.glyph)}</span>${esc(x.name)}</button>`).join('')}</div>
  <p class="count"><b>${earned}</b> de ${list.length} trofeos de ${esc(w.name)}</p>
  ${w.available?'':`<p class="meta empty">La grada de ${esc(w.name)} espera sus doce trofeos. Llegan cuando se abra la entrada del ${esc(w.taller)}.</p>`}
  <div class="trophies">${list.map(t=>`<article class="trophy ${t.earned?'earned':''}"><div class="trophy-icon">${svg(t.kind==='medal'?'medal':t.kind)}</div><div><b>${esc(t.earned||t.progress>0?t.title:'???')}</b><p>${esc(t.earned?t.detail:t.progress>0?t.detail:'Un lugar espera bajo el vidrio.')}</p>${!t.earned&&t.progress>0?`<div class="progress small"><i style="width:${Math.round(t.progress*100)}%"></i></div>`:''}</div></article>`).join('')}</div>`;
}
function bindTrofeos(){document.querySelectorAll('[data-world]').forEach(b=>b.addEventListener('click',()=>{trophyWorld=b.dataset.world;$('.panel-body').innerHTML=renderTrofeos();bindTrofeos();$(`[data-world="${trophyWorld}"]`)?.focus();}));}

// ── Anfiteatro ─────────────────────────────────────────────────────────────────
const available=new Map();
async function probe(url){if(available.has(url))return available.get(url);const p=fetch(asset(url),{method:'HEAD'}).then(r=>r.ok&&!(r.headers.get('content-type')||'').includes('text/html')).catch(()=>false);available.set(url,p);return p;}
function renderAnfiteatro(){
  const cine=cinematics(save);
  return `
  <div class="player" id="player"><div class="player-idle"><span class="eyebrow">En pantalla</span><b>Elegí una función</b><p>Las escenas de restauración aparecen acá después de vivirlas en Ohmdal.</p></div></div>
  <h3 class="world-title" style="--c:#6fd6cf"><span>Ω</span>Cinemáticas de Ohmdal</h3>
  <div class="films">${cine.map(c=>`<button class="film ${c.unlocked?'':'locked'}" data-film="${c.id}" ${c.unlocked?'':'disabled'}>
      <span class="thumb" style="--poster:url('${asset(`/escuela/cine/${c.id}.webp`)}')">${c.unlocked?svg('play','play'):svg('lock','play')}</span>
      <span class="film-text"><b>${esc(c.unlocked?c.title:'Escena por vivir')}</b><small>${esc(c.area)} · ${Math.round(c.duration)} s</small></span></button>`).join('')}</div>
  ${WORLDS.filter(w=>!w.available).map(w=>`<h3 class="world-title" style="--c:${w.color}"><span>${esc(w.glyph)}</span>Cinemáticas de ${esc(w.name)}</h3><p class="meta empty">Sin funciones todavía: se proyectan cuando la entrada del ${esc(w.taller)} esté abierta.</p>`).join('')}
  <h3>Explicaciones${CHANNEL.name?` · ${esc(CHANNEL.name)}`:''}</h3>
  ${EXPLICACIONES.length?`<div class="films">${EXPLICACIONES.map((v,i)=>`<button class="film" data-yt="${i}"><span class="thumb yt" style="--poster:url('https://i.ytimg.com/vi/${esc(v.youtube)}/hqdefault.jpg')">${svg('play','play')}</span><span class="film-text"><b>${esc(v.title)}</b><small>${esc(v.detail||'YouTube')}</small></span></button>`).join('')}</div>`:`<p class="meta empty">Las explicaciones del canal del Instituto van a proyectarse acá.</p>`}
  ${ANIMACIONES.length?`<h3>Animaciones</h3><div class="films">${ANIMACIONES.map((v,i)=>`<button class="film" data-anim="${i}"><span class="thumb" style="--poster:url('${asset(v.poster||'')}')">${svg('play','play')}</span><span class="film-text"><b>${esc(v.title)}</b><small>Animación</small></span></button>`).join('')}</div>`:''}
  ${CHANNEL.url?`<a class="quiet channel" href="${esc(CHANNEL.url)}" target="_blank" rel="noopener">Ver el canal completo ${svg('arrow')}</a>`:''}`;
}
function bindAnfiteatro(){
  const cine=cinematics(save);
  document.querySelectorAll('[data-film]').forEach(async b=>{
    const c=cine.find(x=>x.id===b.dataset.film);if(!c.unlocked)return;
    const has=await probe(CINEMATIC_FILES[c.id]);if(!has){b.classList.add('unfilmed');b.querySelector('small').textContent=`${c.area} · por filmar`;}
    b.addEventListener('click',()=>has?playLocal(asset(CINEMATIC_FILES[c.id]),c.title,c.captions,c.id):playStoryboard(c));
  });
  document.querySelectorAll('[data-yt]').forEach(b=>b.addEventListener('click',()=>playYouTube(EXPLICACIONES[Number(b.dataset.yt)])));
  document.querySelectorAll('[data-anim]').forEach(b=>b.addEventListener('click',()=>{const v=ANIMACIONES[Number(b.dataset.anim)];playLocal(asset(v.src),v.title,[],v.src);}));
}
function markWatched(id){if(!profile.watched.includes(id)){profile.watched.push(id);persistProfile();}}
function playLocal(src,title,captions,id){
  stopPlayback();const player=$('#player');
  const vtt=src.replace(/\.mp4$/,'.vtt');
  player.innerHTML=`<video id="film" src="${esc(src)}" playsinline controls autoplay muted crossorigin="anonymous"><track kind="captions" srclang="es" label="Español" src="${esc(vtt)}" default></video><p class="now">${esc(title)}</p>`;
  const video=$('#film');video.muted=settings.muted;video.play().catch(()=>{video.muted=true;video.play().catch(()=>{});});diorama.playOnScreen(video);video.addEventListener('ended',()=>markWatched(id));
  diorama.drawScreenCard(title,'Ohmdal · La Luz','EN PANTALLA');
}
function playStoryboard(c){
  // Without a filmed version, the screen tells the scene in title cards.
  stopPlayback();const player=$('#player');player.innerHTML=`<div class="storyboard"><span class="eyebrow">${esc(c.area)}</span><b>${esc(c.title)}</b><p id="story-line"></p></div>`;
  const lines=[...c.captions];let i=0;const step=()=>{const text=lines[i]||'';$('#story-line')&&($('#story-line').textContent=text);diorama.drawScreenCard(c.title,text||c.area,'CINEMÁTICA');i++;if(i<=lines.length)storyTimer=setTimeout(step,2800);else markWatched(c.id);};step();
}
let storyTimer=0;
function playYouTube(v){
  stopPlayback();const player=$('#player');
  player.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtube)}?autoplay=1&rel=0${settings.muted?'&mute=1':''}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><p class="now">${esc(v.title)}</p>`;
  diorama.drawScreenCard(v.title,CHANNEL.name||'Explicación','EN PANTALLA');markWatched('yt:'+v.youtube);
}
function stopPlayback(){clearTimeout(storyTimer);const v=$('#film');if(v){v.pause();v.removeAttribute('src');v.load();}diorama.stopScreen?.();if(diorama.screen)diorama.drawScreenCard();}

function renderPatio(){
  const stage=schoolStage(save);
  return `<p class="eyebrow">Sobre Roxana</p><p class="lead">Roxana es una antigua escuela técnica que enseñaba mediante los Mundos Aplicados: lugares donde comprender una disciplina permite intervenir sobre consecuencias reales.</p>
  <p>La directora fundadora del programa permanece en la memoria de la escuela a través de esta estatua, documentos y relatos incompletos. Mira hacia el portón y sostiene un libro cerrado contra el pecho.</p>
  <section class="card"><span class="eyebrow">La escuela recupera su luz</span><b class="big">${stage} de ${RESTORATIONS.length*WORLDS.length}</b><div class="progress"><i style="width:${stage/(RESTORATIONS.length*WORLDS.length)*100}%"></i></div><p class="meta">Cada restauración en un Mundo Aplicado devuelve algo al Instituto. Hoy está abierto el portal de Ohmdal; Physica, Bitland y Arithmos esperan en sus talleres.</p></section>
  <p class="meta">Quién fue Roxana, qué es realmente la Bitácora y qué relación tuvo el Instituto con cada mundo son preguntas que la escuela todavía conserva.</p>
  ${renderCommunity()}`;
}

// ── Progress, meter, news ──────────────────────────────────────────────────────
function refreshProgress({instant=false}={}){
  const stage=schoolStage(save);diorama.setStage(stage,{instant});diorama.setTrophies(trophies(save));ambience.set({stage});
  // Four worlds, ten lamps each: the school's light is shared among them.
  $('#school-meter').innerHTML=`<span class="meter-label">La escuela recupera su luz</span>${WORLDS.map(w=>{const n=w.id==='ohmdal'?stage:0;return `<span class="meter-world ${w.available?'':'off'}" style="--c:${w.color}" title="${esc(w.name)}${w.available?` · ${n}/${RESTORATIONS.length}`:' · en preparación'}"><i class="glyph">${esc(w.glyph)}</i><span class="lamps">${RESTORATIONS.map((r,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span></span>`;}).join('')}<b>${stage}/${RESTORATIONS.length*WORLDS.length}</b>`;
  $('#preview-banner').classList.toggle('hidden',previewStage===null);
  if(previewStage!==null)$('#preview-banner').innerHTML=`Vista previa · etapa ${previewStage}. <a href="${location.pathname}">Volver a mi partida</a>`;
  refreshGreeting();
}
function refreshGreeting(){$('.brand-sub').textContent=profile.name?`Registro de ${profile.name}`:'Escuela de Mundos Aplicados';}
function persistProfile(){saveProfile(profile);}
function applySettings(){diorama.setReducedMotion(settings.reducedMotion);diorama.setQuality(settings.quality);$('#opt-motion').checked=settings.reducedMotion;$('#opt-quality').checked=settings.quality==='high';document.documentElement.classList.toggle('reduced-motion',settings.reducedMotion);}
function setSound(on){
  settings.muted=!on;persistProfile();if(on)ambience.start();else ambience.stop();
  const b=$('#sound-button');b.setAttribute('aria-pressed',String(on));b.innerHTML=svg(on?'sound':'mute');
  const v=$('#film');if(v)v.muted=!on;const pref=$('#pref-sound');if(pref)pref.checked=on;
}
function toast(text){const t=$('#toast');t.textContent=text;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),3200);}

/** When the student returns with new restorations, the school offers to show them one by one. */
async function showChanges(){
  const stage=schoolStage(save),seen=previewStage!==null?stage:(profile.stageSeen??0);
  if(stage<=seen){diorama.setStage(stage,{instant:true});return;}
  diorama.setStage(seen,{instant:true});
  const fresh=RESTORATIONS.slice(seen,stage),news=$('#changes');
  news.innerHTML=`<span class="eyebrow">Cambió por tu aventura</span><h2 id="changes-title">Algo volvió al Instituto</h2><p>${fresh.length===1?'Una restauración volvió a la escuela.':`${fresh.length} restauraciones volvieron a la escuela.`}</p><div class="row-buttons"><button class="primary" id="news-show">Recorrerlas ${svg('arrow')}</button><button class="quiet" id="news-skip">Más tarde</button></div>`;
  news.classList.remove('hidden');
  const finish=()=>{news.classList.add('hidden');profile.stageSeen=stage;persistProfile();diorama.setStage(stage);};
  $('#news-skip').addEventListener('click',()=>{finish();diorama.setStage(stage,{instant:true});});
  $('#news-show').addEventListener('click',async()=>{
    news.classList.add('hidden');document.body.classList.add('showcasing');
    for(let i=seen;i<stage;i++){
      diorama.showcase(i);ambience.chime([523.3,659.3,784,1046.5]);caption(`${RESTORATIONS[i].world} · ${RESTORATIONS[i].title}`,RESTORATIONS[i].school);
      await wait(settings.reducedMotion?600:1700);diorama.setStage(i+1);await wait(settings.reducedMotion?900:2600);
    }
    caption('');document.body.classList.remove('showcasing');diorama.focus(null);finish();
  });
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function caption(title,text=''){const c=$('#caption');if(!title){c.classList.remove('on');return;}c.innerHTML=`<b>${esc(title)}</b><span>${esc(text)}</span>`;c.classList.add('on');}

// ── Controls ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.directory button').forEach(b=>b.addEventListener('click',()=>diorama.focusId===b.dataset.room?closeRoom():openRoom(b.dataset.room)));
$('#home').addEventListener('click',()=>closeRoom({intro:true}));
document.querySelectorAll('[data-hour]').forEach(b=>b.addEventListener('click',()=>{
  // On narrow screens only the current hour shows: tapping it moves to the next one.
  const ids=Object.keys(HOURS),narrow=innerWidth<=560,next=narrow&&b.dataset.hour===diorama.hourId?ids[(ids.indexOf(diorama.hourId)+1)%ids.length]:b.dataset.hour;
  diorama.setHour(next);syncHour();ambience.set({hour:next});}));
function syncHour(){document.querySelectorAll('[data-hour]').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.hour===diorama.hourId)));}
$('#sound-button').addEventListener('click',()=>setSound(settings.muted));
// Browsers need a gesture before audio: a saved preference resumes on the first touch.
addEventListener('pointerdown',()=>{if(!settings.muted&&!ambience.on)setSound(true);},{once:true});
$('#settings-button').addEventListener('click',()=>{$('#settings').classList.toggle('hidden');});
$('#opt-motion').addEventListener('change',e=>{settings.reducedMotion=e.target.checked;persistProfile();applySettings();});
$('#opt-quality').addEventListener('change',e=>{settings.quality=e.target.checked?'high':'low';persistProfile();applySettings();});
$('#opt-stage').value=previewStage??'';
$('#opt-stage').addEventListener('change',e=>{const v=e.target.value;const u=new URL(location.href);if(v==='')u.searchParams.delete('etapa');else u.searchParams.set('etapa',v);location.href=u.toString();});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!$('#settings').classList.contains('hidden'))$('#settings').classList.add('hidden');else if(diorama.focusId)closeRoom();}
  if(e.target.closest?.('input,select,textarea'))return;
  const n=Number(e.key);if(n>=1&&n<=ROOM_ORDER.length)openRoom(ROOM_ORDER[n-1]);
});
// The Ohmdal save may change in another tab: the school follows.
addEventListener('storage',e=>{if(e.key===SAVE_KEY&&previewStage===null){save=readOhmdal();refreshProgress();}});

// ── Intro, way in, news ────────────────────────────────────────────────────────
// The intro is plain HTML in escuela.html: identity, one sentence and a way in before
// any 3D. Once the student looks around, it folds into the compact brand.
function explore(){
  if(document.body.classList.contains('exploring'))return;
  document.body.classList.add('exploring');diorama.panelShift=0;diorama.panelShiftY=0;
  if(!profile.welcomed){profile.welcomed=true;persistProfile();}
}
function showIntro(){
  document.body.classList.remove('exploring');diorama.panelShift=introShift();diorama.panelShiftY=introShiftY();
}
// On wide screens the campus steps right of the intro text.
function introShift(){return innerWidth>1000&&!document.body.classList.contains('exploring')?-.17:0;}
function introShiftY(){return innerWidth<=820&&innerHeight>innerWidth&&!document.body.classList.contains('exploring')?-.22:0;}
function setupWayIn(){
  const o=ohmdalSummary(previewStage===null?save:null),href=base+'index.html'+(o.started?'#continuar':'');
  const label=o.started?'Continuar en Ohmdal':'Entrar a Ohmdal';
  for(const a of [$('#cta-play'),$('#brand-cta')]){a.href=href;}
  $('#cta-play-label').textContent=label;$('#brand-cta').textContent=o.started?'Continuar':'Entrar a Ohmdal';
  $('#cta-meta').textContent=o.started?`${o.area?o.area+' · ':''}${o.percent}% del Arco I · ${fmtTime(o.playtime)} de viaje`:'Hoy está abierta la entrada a Ohmdal · La Luz: electricidad, nueve lugares.';
  // A returning student continues first; the intro line says so.
  if(o.started){$('#intro-line').textContent='Tu viaje sigue abierto. El Instituto guarda lo que trajiste.';}
}
function openNews(){
  explore();opener=document.activeElement;
  const panel=$('#panel');panel.dataset.room='novedades';panel.setAttribute('aria-hidden','false');document.body.classList.add('room-open');
  diorama.focus(null);diorama.panelShift=panelFraction();diorama.panelShiftY=innerWidth>820?0:.6;
  document.querySelectorAll('.directory button').forEach(b=>b.setAttribute('aria-current','false'));
  $('#panel-inner').innerHTML=`<header class="panel-head"><button class="panel-back" id="panel-back" aria-label="Volver al Instituto">${svg('back')}<span>Instituto</span></button><span class="eyebrow">Del Instituto</span><h2>Novedades</h2></header><div class="panel-body" id="news-body" aria-busy="true"><p class="meta">Cargando novedades…</p></div>`;
  $('#panel-back').addEventListener('click',()=>closeRoom());
  history.replaceState(null,'',`${location.pathname}${location.search}#novedades`);
  requestAnimationFrame(()=>panel.focus({preventScroll:true}));
  loadNews(base).then(result=>{
    const body=$('#news-body');if(!body)return;body.removeAttribute('aria-busy');body.innerHTML=renderNews(result,{dev:import.meta.env.DEV});
    if(result.items.length){profile.newsSeen=result.items[0].date;persistProfile();markUnread(0);}
  });
}
function markUnread(n){const a=$('#link-news');a.dataset.unread=n?String(n):'';a.setAttribute('aria-label',n?`Novedades (${n} sin leer)`:'Novedades');}
function route(){
  const hash=decodeURIComponent(location.hash.slice(1));
  if(hash==='novedades')openNews();else if(hash==='sobre'||ROOMS[hash])openRoom(hash);
}
document.querySelectorAll('.intro-links a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openRoom(a.getAttribute('href').slice(1));}));
addEventListener('hashchange',route);
$('#cta-explore').addEventListener('click',()=>{explore();canvas.focus({preventScroll:true});toast('Tocá un edificio para acercarte. El directorio de abajo lleva a cada sala.');});
canvas.addEventListener('pointerdown',()=>explore(),{passive:true});
addEventListener('resize',()=>{if(!diorama.focusId){diorama.panelShift=introShift();diorama.panelShiftY=introShiftY();}});

// The light version: the same home without 3D (no WebGL, failed load).
function lightVersion(reason){
  document.body.classList.add('light');canvas.hidden=true;
  $('#cta-explore').hidden=true;
  const el=$('#light');el.classList.remove('hidden');
  el.innerHTML=`<h2>Los Mundos Aplicados</h2><p class="meta">${esc(reason)}</p><ul>${WORLDS.map(w=>`<li style="--c:${w.color}"><span class="glyph" aria-hidden="true">${esc(w.glyph)}</span><div><b>${esc(w.name)}</b><small>${esc(w.discipline)} · ${esc(w.taller)}</small></div>${w.available?`<a class="cta small" href="${$('#cta-play').getAttribute('href')}">${esc($('#cta-play-label').textContent)}</a>`:'<span class="pill muted">En preparación</span>'}</li>`).join('')}</ul>`;
}

// ── Boot ───────────────────────────────────────────────────────────────────────
setupWayIn();refreshGreeting();
loadNews(base).then(r=>markUnread(unreadCount(r.items,profile.newsSeen)));
(async()=>{
  if(diorama.quiet){lightVersion('Este navegador no puede mostrar el campus en 3D. Todo lo demás está acá.');$('#intro-load').hidden=true;route();return;}
  try{
    await diorama.build(p=>{$('#loading-bar').style.width=`${Math.round(p*100)}%`;});
    syncHour();applySettings();refreshProgress({instant:true});
    diorama.panelShift=introShift();diorama.panelShiftY=introShiftY();
    diorama.flyTo({...OVERVIEW,distance:OVERVIEW.distance*1.25,pitch:OVERVIEW.pitch+10,yaw:OVERVIEW.yaw-24},{instant:true});
    requestAnimationFrame(()=>{diorama.flyTo(OVERVIEW);document.body.classList.add('ready');});
    const ex=$('#cta-explore');ex.disabled=false;ex.textContent='Explorar el campus';
    await wait(900);
    if(location.hash.length>1)route();else await showChanges();
    window.__escuela={diorama,openRoom,closeRoom,refreshProgress,openNews};
  }catch(err){
    console.error(err);lightVersion('No se pudo abrir el campus en 3D en este navegador. Todo lo demás está acá.');$('#intro-load').hidden=true;route();
  }
})();
