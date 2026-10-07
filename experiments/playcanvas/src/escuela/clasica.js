// The classic home in the browser. The page arrives already written for a first visit (vite.config.js renders it
// with clasica-render.js); here it follows the student's own progress, read from the Ohmdal save without ever
// writing it, and the news file. No 3D and no game code beyond what reads the save.
import {readOhmdal,readProfile,saveProfile,previewState,schoolStage,RESTORATIONS} from './progress.js';
import {SAVE_KEY} from '../game/state.js';
import {loadNews,renderNews,unreadCount,newestReal} from './news.js';
import {wayIn,renderWorlds,renderRecord,renderPlan,renderAboutStage,renderChanges,campusCaption,campusAlt,campusImage,renderCommunity} from './clasica-render.js';

const $=s=>document.querySelector(s);
const base=import.meta.env.BASE_URL;
const params=new URLSearchParams(location.search);
const previewStage=params.has('etapa')?Math.max(0,Math.min(10,Number(params.get('etapa'))||0)):null;
const campus=window.__campus||{hour:'tarde',stage:0};
const read=()=>previewStage!==null?previewState(previewStage):readOhmdal();

function render(){
  const profile=readProfile(),save=read(),way=wayIn(previewStage!==null?null:save),stage=schoolStage(save);
  document.documentElement.dataset.started=way.started?'1':'';
  for(const a of document.querySelectorAll('[data-way]'))a.href=way.href;
  $('#way-meta').textContent=way.meta;
  $('#brand-sub').textContent=profile.name?`Registro de ${profile.name}`:'Escuela de Mundos Aplicados';
  // The served page is the first visit: only a save (or a preview) changes what it says. If it came unwritten (the
  // build could not render it), the browser writes every part.
  const served=Boolean($('#worlds .world'));
  if(!served)$('#about-stage').insertAdjacentHTML('afterend',renderCommunity());
  if(save||!served){
    $('#worlds').innerHTML=renderWorlds(save,{way});
    $('#record').innerHTML=renderRecord(save,{way,name:profile.name,preview:previewStage});
    $('#plan').innerHTML=renderPlan(save);
    $('#about-stage').innerHTML=renderAboutStage(save);
  }
  $('#campus-caption').innerHTML=campusCaption(campus.hour,stage,{started:way.started,preview:previewStage});
  // The still follows the save if it changed after the first paint (another tab, back from a world).
  const img=$('#campus-still'),src=campusImage(campus.hour,stage);
  if(img){if(new URL(src,location.href).href!==img.src)img.src=src;img.alt=campusAlt(campus.hour);}
  const note=$('#preview-note');note.hidden=previewStage===null;
  if(previewStage!==null)note.innerHTML=`Vista previa · etapa ${previewStage}: el Instituto como si tu partida estuviera ahí. No es tu progreso y no lo modifica. <a href="${location.pathname}">Volver a mi partida</a>`;
  showChanges(save,profile);
}

/** New restorations since the last visit, presented once (the same record the 3D home's card uses). */
function showChanges(save,profile){
  const stage=schoolStage(save),seen=previewStage!==null?stage:Math.min(profile.stageSeen??0,stage);
  if(stage<=seen)return;
  profile.stageSeen=stage;saveProfile(profile);
  $('#changes-slot').innerHTML=renderChanges(RESTORATIONS.slice(seen,stage));
}

// News: the list written at build time stays if the file cannot be fetched now.
function markUnread(n){const a=$('#nav-news');a.dataset.unread=n?String(n):'';a.setAttribute('aria-label',n?`Novedades (${n} sin leer)`:'Novedades');}
loadNews(base).then(result=>{
  if(result.status!=='ok')return;
  $('#news').innerHTML=renderNews(result);
  const profile=readProfile(),n=unreadCount(result.items,profile.newsSeen),newest=newestReal(result.items);markUnread(n);
  if(!n||!newest||!('IntersectionObserver' in window))return;
  // They count as read once the news are on screen, as opening the board does in the 3D home.
  const seen=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;seen.disconnect();
    const p=readProfile();p.newsSeen=newest;saveProfile(p);markUnread(0);},{threshold:.35});
  seen.observe($('#novedades'));
});

render();
// The Ohmdal save may change in another tab, or the page may come back from a world through the browser's cache.
addEventListener('storage',e=>{if(e.key===SAVE_KEY&&previewStage===null)render();});
addEventListener('pageshow',e=>{if(e.persisted)render();});
