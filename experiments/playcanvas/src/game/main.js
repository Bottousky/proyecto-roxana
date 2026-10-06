import { renderKingdomMap, bindKingdomMap } from './kingdom-map.js';
import './style.css';
import './interface.css';
import './atlas.css';
import {PlayCanvasWorld as World} from '../world.js';
import '../fonts.css';
import {mountTravelInstrument,updateTravelInstrument} from './travel-instrument.js';
import {advanceJourneyTime,journeyPhase} from './story-time.js';
import './travel-instrument.css';
import './art-polish.css';
import './journey-ui.css';
import './hud.css';
import {renderJourneyGuide} from './journey-guide.js';
import {PuzzleWorkbench,PUZZLES,getBenchEvidence} from './puzzles.js';
import {renderJournal,recordFieldObservation} from './journal.js';
import {AREAS,CHARACTERS,DIALOGUES,JOURNAL,PUZZLE_STORY,WORLD_SYSTEMS,OHM_CHATTER,DIALOGUE_EFFECTS,LESSON_GIFTS,lessonGift,getObjective,resolveDialogue,resolveDialogueId,evaluateWorld} from './content.js';
import {AudioDirector} from './audio.js';
import {measureWorld} from './world-circuits.js';
import {freshState,loadState,saveState,loadSettings,SETTINGS_KEY,hasRequirements,minutes,validateState} from './state.js';
import {prepareCinematic,recordCinematicComplete,recordEndingDismissed} from './cinematic-progress.js';
import {placeInteractionPrompt} from './interaction-prompt.js';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon={ohm:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2"/>',book:'<path d="M3 4h6q3 0 3 3v14q-1-3-4-3H3zm18 0h-6q-3 0-3 3v14q1-3 4-3h5z"/>',map:'<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2zM9 3v15M15 6v15"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',sound:'<path d="m3 9 4 0 5-5v16l-5-5H3zM16 8q5 4 0 8M19 4q9 8 0 16"/>',star:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
const svg=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[name]||icon.star}</svg>`;
document.querySelector('#app').innerHTML=`
  <canvas id="world" aria-label="Mundo de Ohmdal. Movete con WASD o flechas, e interactuá con E." tabindex="0"></canvas>
  <div id="vignette"></div><div id="transition" class="curtain hidden"><span>Ω</span><p id="transition-name"></p></div>
  <section id="title-screen" class="title-screen">
    <div class="title-art"></div><div class="title-shade"></div><div class="title-dust"></div>
    <div class="title-content"><div class="eyebrow title-eyebrow">UNA AVENTURA EN LOS MUNDOS APLICADOS</div><div class="title-sigil">Ω</div><h1>OHMDAL</h1><div class="title-rule"><span></span>LA LUZ<span></span></div><p class="title-tagline">El mundo no perdió su luz.<br>Olvidó cómo encenderla.</p>
    <nav class="title-menu" aria-label="Menú principal"><button id="continue" class="primary hidden">Continuar el viaje ${svg('arrow')}</button><button id="new-game" class="primary">Cruzar el Portal ${svg('arrow')}</button><button id="title-settings" class="quiet">Opciones</button></nav>
    <p id="save-description" class="save-description"></p><p class="rotate-hint"><span aria-hidden="true">⟳</span>Ohmdal se juega mejor con el teléfono apaisado.</p></div><div class="title-foot"><span>ARCO I · LA PREGUNTA OLVIDADA</span><span>Explorá. Escuchá. Experimentá.</span></div>
  </section>
  <div id="hud" class="hidden"><header class="hud-top"><div class="place"><span class="eyebrow" id="chapter-label">OHMDAL · LA LUZ</span><h2 id="area-name"></h2><p id="area-subtitle"></p></div><nav class="hud-tools" aria-label="Herramientas de viaje"><button id="ohm-button" class="icon-button" hidden aria-label="Hablar con Ohm (O)" title="Hablar con Ohm · O">${svg('ohm')}<span class="tool-label">Ohm</span><kbd>O</kbd></button><button id="journal-button" class="icon-button" aria-label="Bitácora (J)" title="Bitácora · J">${svg('book')}<span class="tool-label">Bitácora</span><kbd>J</kbd><i id="journal-dot" class="hidden"></i></button><button id="map-button" class="icon-button" aria-label="Mapa (M)" title="Mapa · M">${svg('map')}<span class="tool-label">Mapa</span><kbd>M</kbd></button><button id="guide-button" class="icon-button" aria-label="Guía de viaje (H)" title="Guía de viaje · H">${svg('star')}<span class="tool-label">Guía</span></button><button id="pause-button" class="icon-button" aria-label="Pausa y opciones (Escape)">${svg('menu')}<span class="tool-label">Pausa</span><kbd>Esc</kbd></button></nav></header>
    <div class="objective" id="objective"><span class="objective-glyph" aria-hidden="true">◇</span><div><button id="objective-toggle" aria-expanded="true" aria-controls="objective-detail"><span class="eyebrow">UNA PREGUNTA ABIERTA</span><span id="objective-title"></span><span class="objective-fold" aria-hidden="true">⌄</span></button><small id="objective-detail"></small></div></div>
    <div id="interaction" class="interaction hidden"><button id="interact-button"><kbd>E</kbd><span id="interaction-label"></span></button><button id="field-measure" class="field-measure hidden"><kbd>Q</kbd> Mirar con Ohm</button></div>
    <aside id="field-meter" class="field-meter hidden" aria-label="Observación de Ohm" aria-live="polite"><button id="close-field-meter" aria-label="Guardar instrumento">×</button><span class="eyebrow">OHM · UNA OBSERVACIÓN</span><h3 id="field-title"></h3><p id="field-observation"></p><details id="field-details"><summary>Ver las lecturas</summary><div class="field-readings"><div><strong id="field-voltage"></strong><small>V · TENSIÓN</small></div><div><strong id="field-current"></strong><small>A · CORRIENTE</small></div></div><p id="field-reference" class="field-reference"></p><p class="field-guide">La tensión compara dos puntos. La corriente indica cuánto circula por un camino. Una raya significa que Ohm no puede fijar esa lectura; no significa cero.</p></details></aside>
    <div id="ohm-bubble" class="ohm-bubble hidden"><span class="ohm-eye"></span><p></p></div>
    <div class="hud-bottom"><span id="control-reminder"><kbd>W A S D</kbd> caminar <span>·</span> <kbd>Shift</kbd> correr <span>·</span> <kbd>E</kbd> usar</span><span id="save-indicator" role="status">◈ Bitácora al día</span></div>
    <div id="touch-controls"><div class="dpad"><button data-dir="up" aria-label="Caminar hacia arriba">↑</button><button data-dir="left" aria-label="Caminar a la izquierda">←</button><button data-dir="down" aria-label="Caminar hacia abajo">↓</button><button data-dir="right" aria-label="Caminar a la derecha">→</button></div><button id="touch-interact" aria-label="Interactuar" disabled>Acercate</button></div>
  </div>
  <div id="arrival" class="arrival hidden"><div class="eyebrow">OHMDAL</div><h2></h2><p></p><div class="arrival-line"></div></div>
  <section id="dialogue" class="dialogue hidden" aria-label="Conversación"><div id="portrait" class="portrait"><span></span></div><div class="dialogue-copy"><div class="dialogue-who"><h3 id="speaker"></h3><span id="speaker-role"></span></div><p id="dialogue-text"></p><button id="dialogue-next" aria-label="Continuar conversación">Continuar <kbd>↵</kbd><span>▾</span></button></div></section>
  <div id="dialogue-announcement" class="screen-reader-only" aria-live="polite" aria-atomic="true"></div><div id="workbench" class="hidden"></div><div id="modal-layer" class="modal-layer hidden"></div>
  <div id="toast" class="toast hidden" role="status"></div>
  <section id="cinematic" class="cinematic hidden" aria-label="Escena" aria-describedby="cinematic-caption"><div class="cinematic-bar cinematic-top" aria-hidden="true"></div><div class="cinematic-bar cinematic-bottom" aria-hidden="true"></div><p id="cinematic-caption" role="status" aria-live="polite" aria-atomic="true"></p><button id="skip-cinematic">Saltar escena <kbd>Esc</kbd></button></section>
`;

mountTravelInstrument(document);
let settings=loadSettings();
let loaded=loadState();
let state=loaded.state||freshState(settings);
let world,audio=new AudioDirector(),workbench;
let lessonStarting=false,mode='title',started=false,nearby=null,dialogue=null,dialogueEnd=null,typing=0,typed=0,transitioning=false,startingGame=false,assetLoadFailed=false;
let lastTime=performance.now(),autosave=0,bubbleUntil=0,arrivalTimeout,toastTimeout,modalReturn='world',modalFocus=null;
const held=new Set();
let activePointer=null;
let pendingPuzzleResult=null;
let playingCinematic=false;
let chatterClock=0;
let objectiveSignature='',objectiveUntil=0,hudUntil=0,travelTick=0;
let intendedInteraction=null;
// The key that closes a conversation must not reopen it: talking again to whoever was in reach
// needs a short pause, and every press during that pause (a hurried reader) extends it.
// Anything else in reach can be used at once.
let interactAfter=0,interactAfterId=null;
let activeMeasurement=null,measurementAvailable=false,lastMeasuredFlags='',lastMeasurementCandidate='';
const dialogueQueue=[];
function queueDialogue(id,delay=0,area=state.area){if(id)dialogueQueue.push({id,due:performance.now()+delay,area});}

function show(node,value=true){(typeof node==='string'?$(node):node).classList.toggle('hidden',!value);if(node==='#dialogue')$('#hud').classList.toggle('conversing',value);}
function toast(text,duration=3600){$('#toast').textContent=text;show('#toast');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>show('#toast',false),duration);}
function sound(name){try{audio.play(name);}catch{}}
function storeSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{}state.settings={...settings};audio.setVolume(settings.volume);audio.setMuted(settings.muted);document.documentElement.classList.toggle('reduced-motion',settings.reducedMotion);}
storeSettings();

function refreshTitle(){
  loaded=loadState();
  show('#continue',!!loaded.state);
  $('#new-game').className=loaded.state?'quiet':'primary';
  $('#new-game').innerHTML=loaded.state?'Comenzar otro viaje':`Cruzar el Portal ${svg('arrow')}`;
  // The saved journey in one line: where, when, and how much of the kingdom already shines.
  const describe=s=>{const lit=Object.keys(PUZZLE_STORY).filter(id=>s.flags?.[id]).length,phase=journeyPhase(s);
    return [AREAS[s.area]?.name||'Ohmdal',`${phase.label}, día ${phase.day}`,s.flags?.epilogue_shared?'Arco completo':`${lit} de ${Object.keys(PUZZLE_STORY).length} luces encendidas`,`${minutes(s.playtime)} min de viaje`].join(' · ');};
  $('#save-description').textContent=loaded.state?describe(loaded.state):loaded.error||'Sin prisa. Sin combate. Con curiosidad.';
}
refreshTitle();

function persist(){
  if(!started)return;
  if(world)state.position=world.getSavePosition?.()||world.getPlayerPosition();
  state.settings={...settings};
  const ok=saveState(state);
  $('#save-indicator').textContent=ok?'◈ Bitácora al día':'Guardado no disponible · exportá tu bitácora';
  return ok;
}

function refreshWorldSystems(silent=false){
  const changes=evaluateWorld(state)||[];
  for(const change of changes){
    const before=Boolean(state.flags[change.flag]);
    state.flags[change.flag]=Boolean(change.active);
    if(!silent && change.active && !before){
      world?.playRestoration?.(change.flag);sound('restore');toast(change.label||'La instalación responde.');
      if(change.dialogue && !state.seen.includes(`world:${change.flag}`)){
        state.seen.push(`world:${change.flag}`);queueDialogue(change.dialogue,1000);
      }
    }
  }
  refreshHUD();
}

function refreshHUD(){
  const a=AREAS[state.area];if(!a)return;
  $('#area-name').textContent=a.name;$('#area-subtitle').textContent=a.subtitle||'';
  const objective=getObjective(state)||{title:'Un mundo que vuelve a preguntar',detail:'Todavía quedan historias por descubrir.'};
  $('#objective-title').textContent=objective.title;$('#objective-detail').textContent=objective.detail||'';
  const signature=objective.title+'|'+objective.detail;
  if(signature!==objectiveSignature){objectiveSignature=signature;objectiveUntil=performance.now()+12000;$('#objective').classList.remove('folded');$('#objective-toggle').setAttribute('aria-expanded','true');}
  $('#chapter-label').textContent=state.flags.beacon_lens?'OHMDAL · LA PRIMERA LUZ':'OHMDAL · LA LUZ';
  updateTravelInstrument(document,state,world?.getPlayerPosition?.()||state.position||a.spawn,objective);
  if(activeMeasurement)renderFieldMeasurement();
}

function renderFieldMeasurement(){
  if(!activeMeasurement)return;
  const reading=measureWorld(state.area,state,activeMeasurement.id);
  if(!reading){activeMeasurement=null;show('#field-meter',false);return;}
  const fmt=v=>v===null?'— —':Number(v).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
  $('#field-title').textContent=AREAS[state.area].objects.find(o=>o.id===activeMeasurement.id)?.label||reading.title;$('#field-voltage').textContent=fmt(reading.voltage);$('#field-current').textContent=fmt(reading.current);
  $('#field-reference').textContent=reading.reference;$('#field-observation').textContent=reading.notice;
  $('#field-meter').classList.toggle('fault',Boolean(reading.overloaded));
}
function fieldMeasure(){
  if(mode!=='world'||!state.flags.awaken||!nearby)return;
  if(activeMeasurement?.id===nearby.id){activeMeasurement=null;show('#field-meter',false);return;}
  const reading=measureWorld(state.area,state,nearby.id);if(!reading)return;
  activeMeasurement={id:nearby.id,x:nearby.x,z:nearby.z};$('#field-details').open=false;renderFieldMeasurement();show('#ohm-bubble',false);show('#field-meter');sound('measure');
  if(recordFieldObservation(state,nearby,reading)){show('#journal-dot');persist();}
}

function initWorld(){
  if(world)return;
  world=new World($('#world'));
  workbench=new PuzzleWorkbench($('#workbench'),{
    onChange:(id,snapshot)=>{state.puzzles[id]=snapshot;persist();},
    onSound:sound,
    onClose:()=>{
      show('#workbench',false);world.setInspection(false);mode='world';show('#hud');held.clear();persist();$('#world').focus({preventScroll:true});
      const solved=pendingPuzzleResult;pendingPuzzleResult=null;
      if(solved){if(solved==='beacon_lens')runFinale();else if(state.activeCinematic?.id===solved)playPendingCinematic();else{world.playRestoration?.(solved);audio.playRestoration?.(solved);queueDialogue(PUZZLE_STORY[solved]?.complete,500);}}
    },
    onSolve:(id,result)=>{
      state.flags[id]=true;
      prepareCinematic(state,id);
      if(result?.snapshot)state.puzzles[id]=result.snapshot;
      pendingPuzzleResult=id;refreshWorldSystems();persist();show('#journal-dot');sound('switch');
    }
  });
}

async function startGame(resume=false){
  if(startingGame)return;
  startingGame=true;
  try{
  // Capture the imported/resumed journey before audio can yield to an old autosave.
  let resumeState=null;
  if(resume){const result=loadState();if(!result.state){toast('No hay una bitácora disponible.');return;}resumeState=result.state;}
  started=false;held.clear();
  await audio.unlock();
  if(resume){state=resumeState;settings={...state.settings};storeSettings();}
  else state=freshState(settings);
  try{initWorld();}catch(error){console.error(error);modalReturn='title';modal('<div class="eyebrow">OHMDAL</div><h2>El mundo no pudo abrirse</h2><p class="modal-intro">El navegador no pudo iniciar los gráficos. Activá la aceleración gráfica del navegador y volvé a intentar, o abrí el juego en Chrome o Edge actualizados.</p>','options-modal');return;}
  $('#transition-name').textContent='Abriendo los caminos de Ohmdal';show('#transition');
  const art=await (assetLoadFailed?world.loadArtAssets():world.assetsReady);
  assetLoadFailed=!art.ok;
  if(assetLoadFailed){
    show('#transition',false);show('#title-screen');show('#hud',false);show('#dialogue',false);started=false;mode='title';
    console.warn('Ohmdal: no se pudieron cargar las imágenes',art.missing);
    modal('<div class="eyebrow">LOS CAMINOS ESTÁN ESPERANDO</div><h2>Falta cargar el arte</h2><p class="modal-intro">No se pudieron abrir todas las imágenes de Ohmdal. Abrí «Jugar PlayCanvas.cmd» para iniciar el servidor local y volvé a intentar.<br>Tu bitácora guardada sigue disponible.</p><div class="options-actions"><button class="primary" id="retry-art">Volver a intentar</button></div>','options-modal');
    $('#retry-art').onclick=()=>{closeModal();startGame(resume);};
    return;
  }
  world.cancelCinematic();playingCinematic=false;pendingPuzzleResult=null;dialogue=null;dialogueEnd=null;show('#cinematic',false);show('#dialogue',false);
  dialogueQueue.length=0;started=true;mode='world';show('#title-screen',false);show('#hud');held.clear();
  refreshWorldSystems(true);
  await enterArea(state.area,state.position,{initial:true});
  persist();
  if(state.activeCinematic)playPendingCinematic();
  else if(state.flags.beacon_lens&&!state.flags.finale_seen)runFinale();
  else if(resume&&state.activeDialogue){const saved={...state.activeDialogue};speak(saved.id,saved.id===PUZZLE_STORY.beacon_lens.complete?startLesson:saved.id==='lighthouse_epilogue'&&!state.flags.epilogue_shared?showEnding:null);if(dialogue){dialogue.index=Math.min(saved.index,dialogue.lines.length-1);renderLine();}}
  else if(state.flags.finale_seen&&!state.flags.epilogue_shared)startLesson();
  else if(state.endingPending)showEnding();
  }finally{startingGame=false;}
}

function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function enterArea(id,spawn=null,{initial=false,continuous=false}={}){
  if(transitioning||!AREAS[id])return;
  transitioning=true;if(!continuous){mode='transition';held.clear();world.cancelCinematic();}
  show('#interaction',false);show('#dialogue',false);show('#arrival',false);
  playingCinematic=false;show('#cinematic',false);
  if(!continuous){$('#transition-name').textContent=AREAS[id].name;show('#transition');if(!initial)await wait(settings.reducedMotion?0:110);}
  state.area=id;state.position=spawn||AREAS[id].spawn;
  activeMeasurement=null;show('#field-meter',false);
  chatterClock=0;
  hudUntil=performance.now()+11000;objectiveUntil=performance.now()+12000;
  $('#hud').classList.remove('settled');$('#objective').classList.remove('folded');$('#objective-toggle').setAttribute('aria-expanded','true');
  for(const [key,value] of Object.entries(AREAS[id].initialFlags||{}))if(!(key in state.flags))state.flags[key]=value;
  refreshWorldSystems(true);
  const first=!state.visited.includes(id);if(first)state.visited.push(id);
  advanceJourneyTime(state);
  world.loadArea(AREAS[id],state,state.position,{continuous});audio.restored=Boolean(state.flags.beacon_lens);audio.setArea(id,{continuous});refreshHUD();
  if(!continuous){await world.prepareJourney((done,total)=>{$('#transition-name').textContent=`Abriendo los caminos · ${Math.round(done/total*100)}%`;});await wait(settings.reducedMotion?0:110);}show('#transition',false);transitioning=false;mode='world';
  clearTimeout(arrivalTimeout);
  if(initial&&first&&id==='portal'){world.playPortalArrival();sound('portal');}
  if(initial&&first){$('#arrival h2').textContent=AREAS[id].name;$('#arrival p').textContent=AREAS[id].subtitle||'';show('#arrival');arrivalTimeout=setTimeout(()=>show('#arrival',false),2400);}
  $('#world').focus({preventScroll:true});persist();
  if(first && AREAS[id].entryDialogue)queueDialogue(AREAS[id].entryDialogue,initial?(id==='portal'?2500:1400):1200,id);
}

function linesFor(id){
  if(Array.isArray(id))return id;
  try{return resolveDialogue(id,state)||DIALOGUES[id]||[];}catch{return DIALOGUES[id]||[];}
}
function speak(id,onEnd=null,target=null){
  if(typeof id==='string')id=resolveDialogueId(id,state);
  if(id==='lighthouse_epilogue'){advanceJourneyTime(state,{epilogue:true});refreshHUD();}
  const lines=linesFor(id);if(!lines.length){onEnd?.();return;}
  held.clear();show('#interaction',false);show('#arrival',false);show('#ohm-bubble',false);
  mode='dialogue';dialogue={lines,index:0,id};dialogueEnd=onEnd;show('#dialogue');
  world?.beginInhabitantConversation?.(target||lines.find(line=>!['player','narrator'].includes(line.speaker))?.speaker);
  renderLine();$('#dialogue-next').focus({preventScroll:true});
  if(typeof id==='string'&&!state.seen.includes(id))state.seen.push(id);
}
const portraits={edda:'edda',ohm:'ohm',lumen:'lumen',nereo:'nereo',vega:'vega',consejera:'consejera',yesca:'yesca',marin:'marin',tala:'tala',player:'player'};
function renderLine(){
  const line=dialogue.lines[dialogue.index];const character=CHARACTERS[line.speaker]||{name:line.speaker||'Ohmdal',role:''};
  $('#speaker').textContent=character.name;$('#speaker-role').textContent=character.role||'';
  $('#portrait').className=`portrait ${portraits[line.speaker]?'portrait-'+portraits[line.speaker]:'portrait-symbol'}`;
  $('#portrait span').textContent=portraits[line.speaker]?'':line.speaker==='narrator'?'Ω':character.name.slice(0,1);
  $('#portrait').style.setProperty('--character-color',character.color||'#c9b084');
  world?.faceInhabitantSpeaker?.(line.speaker);
  $('#dialogue-text').textContent='';typing=0;typed=0;
  $('#dialogue-announcement').textContent=`${character.name}: ${line.text}`;
  $('#dialogue-next').innerHTML=`${dialogue.index===dialogue.lines.length-1?'Seguir':'Continuar'} <kbd>↵</kbd><span>▾</span>`;
  removeChoices();$('#dialogue-next').hidden=!!line.choices;
  if(line.choices){const box=document.createElement('div');box.id='dialogue-choices';box.className='dialogue-choices';box.setAttribute('role','group');box.setAttribute('aria-label',line.text);
    line.choices.forEach((choice,i)=>{const b=document.createElement('button');b.innerHTML=`<kbd>${i+1}</kbd>${choice.label}`;b.onclick=()=>chooseInDialogue(choice.id);box.append(b);});
    $('#dialogue-text').after(box);setTimeout(()=>box.querySelector('button')?.focus({preventScroll:true}),0);}
  sound('voice');
  state.activeDialogue=typeof dialogue.id==='string'?{id:dialogue.id,index:dialogue.index}:null;persist();
}
function removeChoices(){if(typeof document!=='undefined')document.getElementById('dialogue-choices')?.remove();}
function chooseInDialogue(id){
  if(!dialogue?.lines[dialogue.index]?.choices)return;
  if(LESSON_GIFTS.some(g=>g.id===id)){for(const g of LESSON_GIFTS)delete state.flags[`lesson_gift_${g.id}`];state.flags[`lesson_gift_${id}`]=true;}
  sound('click');dialogue.lines=linesFor(dialogue.id);removeChoices();$('#dialogue-next').hidden=false;renderLine();$('#dialogue-next').focus({preventScroll:true});persist();
}
function nextLine(){
  if(!dialogue)return;
  if(dialogue.lines[dialogue.index]?.choices){const focused=document.activeElement?.closest?.('#dialogue-choices button');if(focused)focused.click();return;}
  const text=dialogue.lines[dialogue.index].text;
  if(typed<text.length){typed=text.length;typing=typed;$('#dialogue-text').textContent=text;return;}
  if(++dialogue.index<dialogue.lines.length){renderLine();return;}
  if(dialogue.id==='lighthouse_epilogue'){state.flags.epilogue_shared=true;refreshHUD();}
  world?.endInhabitantConversation?.();
  const effect=typeof dialogue.id==='string'&&DIALOGUE_EFFECTS[dialogue.id];if(effect){for(const f of effect.flags)state.flags[f]=true;world?.updateFlags?.(state);refreshWorldSystems();}
  show('#dialogue',false);dialogue=null;state.activeDialogue=null;mode='world';interactAfter=performance.now()+450;interactAfterId=nearby?.id??null;$('#world').focus({preventScroll:true});persist();const cb=dialogueEnd;dialogueEnd=null;cb?.();
}

function bubble(text){if(mode!=='world'||!$('#field-meter').classList.contains('hidden'))return;$('#ohm-bubble p').textContent=text;show('#ohm-bubble');bubbleUntil=performance.now()+6500;}

// Doors of the houses: a short curtain, then the room (or the street) on the other side.
async function useDoor(door){
  if(transitioning||!world||mode!=='world')return;transitioning=true;mode='transition';held.clear();sound('interact');
  $('#transition-name').textContent=door.leave?(door.label||AREAS[state.area].name):door.label;show('#transition');await wait(settings.reducedMotion?0:260);
  if(door.leave)world.leaveHome();else world.enterHome(door.enter);
  await wait(settings.reducedMotion?0:120);show('#transition',false);transitioning=false;mode='world';persist();
}
function talkToOhm(){if(mode!=='world')return;const ohm=world?.getCompanion?.();if(ohm)interact(ohm);}
function interact(obj=nearby){
  if(mode!=='world'||!obj)return;
  intendedInteraction=null;
  sound('interact');held.clear();
  if(obj.door){useDoor(obj.door.leave?{leave:true,label:AREAS[state.area].name}:obj.door);return;}
  if(!hasRequirements(state,obj.requires)){
    if(obj.lockedDialogue)speak(obj.lockedDialogue);else bubble('Todavía hay algo que observar antes de seguir.');return;
  }
  if(obj.target){if(world.followPassage(obj))return;enterArea(obj.target,obj.spawn);return;}
  if(obj.secret){
    if(!state.secrets.includes(obj.secret)){state.secrets.push(obj.secret);show('#journal-dot');toast('Un recuerdo recuperado · Bitácora [J]');sound('discovery');}
    if(obj.flag)state.flags[obj.flag]=true;
    speak(obj.dialogue);persist();return;
  }
  if(obj.action){
    const action=obj.action;
    if(action.type==='toggle'){
      const latched=WORLD_SYSTEMS.find(system=>(system.requires?.includes(action.flag)||system.off?.includes(action.flag))&&state.flags[system.latch]);
      if(latched){bubble('Los mandos quedaron asegurados al poner esta instalación en servicio.');return;}
      state.flags[action.flag]=!state.flags[action.flag];sound('switch');
      toast(state.flags[action.flag]?(action.onText||'Contacto cerrado'):(action.offText||'Contacto abierto'));
      refreshWorldSystems();persist();return;
    }
    if(action.type==='inspect'){
      const first=!state.flags[action.flag];state.flags[action.flag]=true;refreshWorldSystems();persist();
      if(first)show('#journal-dot');
      speak(!first&&obj.afterDialogue?obj.afterDialogue:obj.dialogue);return;
    }
    if(action.type==='finale'){runFinale();return;}
  }
  if(obj.puzzle){
    const open=()=>openPuzzle(obj.puzzle);
    if(state.flags[obj.puzzle]){const after=obj.afterDialogue||PUZZLE_STORY[obj.puzzle]?.complete;if(after&&!state.seen.includes(after))speak(after,open);else open();return;}
    const arrival=obj.dialogue||PUZZLE_STORY[obj.puzzle]?.arrival;
    if(arrival&&!state.seen.includes(arrival))speak(arrival,open);else open();return;
  }
  const id=obj.flag&&state.flags[obj.flag]&&obj.afterDialogue?obj.afterDialogue:obj.dialogue;
  if(id)speak(id,null,obj.id);
}
function openPuzzle(id){mode='puzzle';held.clear();show('#hud',false);show('#arrival',false);world.setInspection(true);show('#workbench');workbench.open(id,state.puzzles[id]);}

function closeModal(){for(const node of [$('#hud'),$('#world'),$('#title-screen')])node.inert=false;if($('.ending-modal')){recordEndingDismissed(state);persist();}show('#modal-layer',false);$('#modal-layer').innerHTML='';mode=modalReturn;held.clear();if(modalFocus?.isConnected&&!modalFocus.closest('.hidden'))modalFocus.focus({preventScroll:true});else if(mode==='world')$('#world').focus({preventScroll:true});}
function modal(html,kind='standard'){
  if(mode!=='modal'){modalReturn=mode;modalFocus=document.activeElement;}
  mode='modal';held.clear();show('#interaction',false);for(const node of [$('#hud'),$('#world'),$('#title-screen')])node.inert=true;
  $('#modal-layer').innerHTML=`<section class="modal ${kind}" role="dialog" aria-modal="true"><button class="modal-close icon-button" aria-label="Cerrar">${svg('close')}</button>${html}</section>`;
  const heading=$('.modal h2');if(heading){heading.id='modal-title';$('.modal').setAttribute('aria-labelledby','modal-title');}
  show('#modal-layer');$('.modal-close').onclick=closeModal;$('.modal-close').focus();
}
function openJournal(selected){
  if(!started||!['world','modal'].includes(mode))return;
  show('#journal-dot',false);
  modal(renderJournal(state,{selected:typeof selected==='string'?selected:undefined,puzzles:PUZZLES,evidenceFor:getBenchEvidence}),'journal-modal');
  const current=document.querySelector('.book-index [aria-current=page]');if(current){const list=current.parentElement;list.scrollTop=current.offsetTop-list.clientHeight/2+current.offsetHeight/2;}
  document.querySelectorAll('button[data-journal-page]').forEach(button=>button.onclick=()=>{openJournal(button.dataset.journalPage);$('.book-leaf')?.scrollIntoView({block:'nearest'});});
  $('#personal-journal-note')?.addEventListener('input',event=>{state.personalNotes||={};state.personalNotes[event.target.dataset.noteFor]=event.target.value.slice(0,1200);persist();});
}

function openGuide(){
  if(!started||!['world','modal'].includes(mode))return;
  modal(renderJourneyGuide(state),'guide-modal');
  $('[data-guide-map]').onclick=openMap;
  $('[data-guide-journal]').onclick=openJournal;
}

function openMap(){
  if(!started||!['world','modal'].includes(mode))return;
  // The kingdom map: the world painted from above, with the journey drawn over it.
  modal(renderKingdomMap(state,{position:world.getPlayerPosition(),facing:world.lastStep,inhabitants:world.getInteractions().filter(o=>o.kind==='npc')}),'kingdom-map');
  sound('map');
  bindKingdomMap($('#modal-layer'),{onTravel:id=>{if(!state.visited.includes(id)||!AREAS[id])return;closeModal();if(id!==state.area)enterArea(id);}});
  $('[data-map-guide]').onclick=openGuide;
}

function openOptions(){
  const titleMode=mode==='title';
  modal(`<div class="eyebrow">${titleMode?'OHMDAL · LA LUZ':'UN MOMENTO EN EL CAMINO'}</div><h2>${titleMode?'Preparar el viaje':'Tomá un respiro'}</h2><div class="options-list"><label><span>Sonido<span class="setting-note">Música y ambiente originales</span></span><input id="volume" type="range" min="0" max="1" step="0.05" value="${settings.volume}" aria-label="Volumen"/></label><label><span>Silenciar</span><input id="mute" type="checkbox" ${settings.muted?'checked':''}/></label><label><span>Movimiento suave<span class="setting-note">Reduce transiciones y efectos de cámara</span></span><input id="motion" aria-label="Movimiento suave" type="checkbox" ${settings.reducedMotion?'checked':''}/></label><label><span>Detalle visual</span><select id="quality" aria-label="Detalle visual"><option value="high" ${settings.quality==='high'?'selected':''}>Alto</option><option value="low" ${settings.quality==='low'?'selected':''}>Ligero</option></select></label><label><span>Lectura instantánea</span><input id="text-speed" type="checkbox" ${settings.textSpeed>=999?'checked':''}/></label><label><span>Caminar con clic<span class="setting-note">Con el mouse. En pantallas táctiles siempre se puede tocar para ir</span></span><input id="click-walk" aria-label="Caminar con clic" type="checkbox" ${settings.clickToWalk?'checked':''}/></label></div><div class="controls-guide"><p><kbd>W A S D</kbd> o <kbd>↑ ← ↓ →</kbd> Caminar</p><p><kbd>E</kbd> Interactuar <span>·</span> <kbd>O</kbd> Hablar con Ohm <span>·</span> <kbd>Shift</kbd> Correr</p><p><kbd>J</kbd> Bitácora <span>·</span> <kbd>M</kbd> Mapa <span>·</span> <kbd>H</kbd> Guía</p><p><kbd>Q</kbd> Medir junto a una instalación <span>·</span> <kbd>Esc</kbd> Pausa</p><p>Clic sobre algo cercano para usarlo. <kbd>↵</kbd> para seguir una conversación.</p></div><div class="options-actions"><button class="primary" id="resume-option">${titleMode?'Volver':'Continuar el viaje'} ${svg('arrow')}</button><button class="quiet" id="fullscreen">Pantalla completa</button>${started?'<button class="quiet" id="export-save">Exportar bitácora</button><button class="quiet" id="return-title">Guardar y volver al inicio</button>':''}<button class="quiet import-label" id="import-open">Importar bitácora</button><input id="import-save" type="file" accept=".json" hidden/></div>`,'options-modal');
  $('#volume').oninput=e=>{settings.volume=Number(e.target.value);storeSettings();};
  $('#mute').onchange=e=>{settings.muted=e.target.checked;storeSettings();};
  $('#motion').onchange=e=>{settings.reducedMotion=e.target.checked;storeSettings();};
  $('#click-walk').onchange=e=>{settings.clickToWalk=e.target.checked;storeSettings();};
  $('#quality').onchange=e=>{settings.quality=e.target.value;storeSettings();world?.resize();};
  $('#text-speed').onchange=e=>{settings.textSpeed=e.target.checked?9999:36;storeSettings();};
  $('#resume-option').onclick=closeModal;
  $('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Podés usar F11 para ampliar la ventana.');}};
  $('#export-save')?.addEventListener('click',()=>{persist();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Ohmdal-La-Luz-bitacora.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Bitácora exportada.');});
  $('#return-title')?.addEventListener('click',()=>{persist();closeModal();mode='title';show('#hud',false);show('#title-screen');show('#arrival',false);refreshTitle();});
  $('#import-open').onclick=()=>$('#import-save').click();
  $('#import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const imported=validateState(JSON.parse(await file.text()));if(!saveState(imported))throw new Error('No se pudo guardar la bitácora importada en este navegador.');closeModal();refreshTitle();await startGame(true);toast('Tu viaje está de vuelta.');}catch(error){toast(error.message||'No se pudo importar la bitácora.');}};
}

function playPendingCinematic(){
  const pending=state.activeCinematic;if(!pending||playingCinematic)return;
  playingCinematic=true;mode='cinematic';held.clear();activePointer=null;
  world.target=null;world.route=[];world.setInspection(false);world.updateFlags(state);
  clearTimeout(arrivalTimeout);show('#hud',false);show('#arrival',false);show('#dialogue',false);show('#interaction',false);show('#ohm-bubble',false);show('#toast',false);
  world.playRestoration(pending.id);
  if(pending.id!=='beacon_lens')audio.playRestoration?.(pending.id);
  if(pending.id==='beacon_lens'){dialogueQueue.length=0;audio.finale();}
  persist();
  if(!world.startCinematic(pending.id,{reducedMotion:settings.reducedMotion})){finishCinematic();return;}
  $('#cinematic-caption').textContent=world.getCinematicState()?.caption||'';
  $('#skip-cinematic').disabled=false;$('#skip-cinematic').innerHTML='Saltar escena <kbd>Esc</kbd>';
  show('#cinematic');$('#skip-cinematic').focus({preventScroll:true});
}
function skipCinematic(){
  if(mode!=='cinematic'||!playingCinematic)return;
  world.skipCinematic();$('#skip-cinematic').disabled=true;$('#skip-cinematic').textContent='Volviendo al viaje…';
}
function finishCinematic(){
  if(!playingCinematic)return;
  playingCinematic=false;const next=recordCinematicComplete(state);
  show('#cinematic',false);show('#hud');mode='world';held.clear();chatterClock=0;persist();
  if(next){for(let i=dialogueQueue.length-1;i>=0;i--)if(dialogueQueue[i].id===next)dialogueQueue.splice(i,1);speak(next,next===PUZZLE_STORY.beacon_lens.complete?startLesson:null);}
  else $('#world').focus({preventScroll:true});
}
function runFinale(){
  if(state.flags.finale_seen){speak('lighthouse_epilogue');return;}
  state.flags.beacon_lens=true;refreshWorldSystems(true);prepareCinematic(state,'beacon_lens');
  if(state.activeCinematic)playPendingCinematic();
  else {state.flags.finale_seen=true;persist();speak(PUZZLE_STORY.beacon_lens.complete,startLesson);}
}
// The Faro is lit, but the arc ends with the first lesson: a night passes, the three of
// them gather at the lantern and the player decides what to leave Tala.
async function startLesson(){
  if(lessonStarting||state.flags.epilogue_shared)return;lessonStarting=true;
  try{
    mode='lesson';held.clear();show('#hud',false);show('#interaction',false);
    $('#transition-name').textContent='A la mañana siguiente';show('#transition');await wait(1700);
    advanceJourneyTime(state,{epilogue:true});
    if(state.area!=='lighthouse'){mode='world';await enterArea('lighthouse',[-2.2,-9.4]);}else world.setPlayerPosition([-2.2,-9.4]);
    state.position=world.getPlayerPosition();refreshHUD();persist();await wait(500);
    show('#transition',false);show('#hud');mode='world';
    speak('lighthouse_epilogue',showEnding);
  }finally{lessonStarting=false;}
}
function showEnding(){
    state.endingPending=true;persist();
    modalReturn='world';modal(`<div class="eyebrow">ARCO I · COMPLETO</div><div class="end-sigil">Ω</div><h2>La primera luz</h2><p class="end-copy">El Faro vuelve a orientar a quienes lo necesitan.<br>Ahora el conocimiento también sabe encontrar el camino de vuelta.</p>${lessonGift(state)?`<p class="end-gift">A Tala le dejaste ${lessonGift(state).memory}.</p>`:''}<div class="end-stats"><span><strong>${state.visited.length}</strong>lugares compartidos</span><span><strong>${JOURNAL.filter(e=>hasRequirements(state,e.requires)).length}</strong>observaciones</span><span><strong>${state.secrets.length}</strong>recuerdos recuperados</span></div><button class="primary" id="keep-exploring">Seguir en Ohmdal ${svg('arrow')}</button><p class="end-note">Todavía quedan conversaciones, rincones y preguntas.<br>Tu viaje está guardado.</p>`,'ending-modal');$('#keep-exploring').onclick=()=>{world.endCinematic?.();closeModal();bubble('No voy a olvidar esto. Hice una copia. Y otra por si acaso.');};
}

$('#new-game').onclick=()=>{
  if(loadState().state){modal('<div class="eyebrow">UN NUEVO COMIENZO</div><h2>Volver a cruzar</h2><p class="modal-intro">El nuevo viaje reemplazará la bitácora de este navegador. Podés exportar una copia desde Opciones antes de comenzar.</p><button class="primary" id="confirm-new">Comenzar un nuevo viaje</button><button class="quiet" id="cancel-new">Conservar mi viaje</button>','options-modal');$('#confirm-new').onclick=()=>{closeModal();startGame(false);};$('#cancel-new').onclick=closeModal;}
  else startGame(false);
};
$('#continue').onclick=()=>startGame(true);$('#title-settings').onclick=openOptions;$('#pause-button').onclick=openOptions;
$('#ohm-button').onclick=()=>talkToOhm();$('#guide-button').onclick=openGuide;$('#journal-button').onclick=openJournal;$('#map-button').onclick=openMap;$('#interact-button').onclick=()=>interact();$('#touch-interact').onclick=()=>interact();$('#dialogue-next').onclick=nextLine;
$('#field-measure').onclick=fieldMeasure;$('#close-field-meter').onclick=()=>{activeMeasurement=null;show('#field-meter',false);};
$('#objective-toggle').onclick=()=>{const folded=$('#objective').classList.toggle('folded');$('#objective-toggle').setAttribute('aria-expanded',String(!folded));objectiveUntil=folded?0:Infinity;};
$('#dialogue-text').onclick=nextLine;
$('#skip-cinematic').onclick=skipCinematic;
$('#world').addEventListener('pointerdown',event=>{
  if(mode!=='world'||event.button!==0)return;
  const object=world.pickInteraction(event.clientX,event.clientY);
  intendedInteraction=null;
  // With a mouse the keyboard walks; a click only uses what is within reach. Touch keeps tap-to-go.
  const walk=event.pointerType!=='mouse'||settings.clickToWalk;
  if(object){if(world.canInteractWith(object))interact(object);else if(walk&&world.approachInteraction(object))intendedInteraction=object.id;return;}
  if(!walk)return;
  const point=world.pick(event.clientX,event.clientY);if(point)world.setTarget(point);activePointer={x:event.clientX,y:event.clientY};
});
document.querySelectorAll('[data-dir]').forEach(button=>{
  const key={up:'ArrowUp',left:'ArrowLeft',down:'ArrowDown',right:'ArrowRight'}[button.dataset.dir];
  button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(key);};
  button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>held.delete(key);
});
window.addEventListener('keydown',event=>{
  if(mode==='cinematic'){
    if(['Escape','Enter',' '].includes(event.key)){event.preventDefault();if(!event.repeat)skipCinematic();}
    else if(event.key==='Tab'){event.preventDefault();$('#skip-cinematic').focus({preventScroll:true});}
    return;
  }
  if(mode==='puzzle')return;
  if(mode==='modal'){
    if(event.key==='Escape'){event.preventDefault();if(!event.repeat)closeModal();return;}
    if(event.key==='Tab'){
      const controls=[...$('#modal-layer').querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex]')].filter(x=>!x.disabled&&x.tabIndex>=0&&x.getClientRects().length);
      if(controls.length){const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
    }
    return;
  }
  if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)||mode==='title')return;
  if(mode==='world'&&event.target.closest?.('button')&&['Enter',' '].includes(event.key))return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','Escape'].includes(event.key))event.preventDefault();
  if(event.key==='Escape'){
    if(event.repeat)return;
    if(mode==='dialogue')nextLine();else if(mode==='world')openOptions();return;
  }
  if(mode==='dialogue'){const pick=dialogue?.lines[dialogue.index]?.choices?.[Number(event.key)-1];if(pick&&!event.repeat){chooseInDialogue(pick.id);return;}if(['Enter','e','E',' '].includes(event.key)&&!event.repeat)nextLine();return;}
  if(mode!=='world')return;
  if(['e','E','Enter',' '].includes(event.key)){if(performance.now()<interactAfter&&nearby&&nearby.id===interactAfterId)interactAfter=performance.now()+450;else if(!event.repeat)interact();return;}
  if(['h','H','?'].includes(event.key)){if(!event.repeat)openGuide();return;}
  if(['j','J'].includes(event.key)){openJournal();return;}
  if(['m','M'].includes(event.key)){openMap();return;}
  if(['q','Q'].includes(event.key)){fieldMeasure();return;}
  if(['o','O'].includes(event.key)&&!event.repeat){talkToOhm();return;}
  held.add(event.key);
});
window.addEventListener('keyup',event=>held.delete(event.key));
window.addEventListener('blur',()=>{held.clear();persist();});
document.addEventListener('visibilitychange',()=>{held.clear();persist();audio.setMuted(document.hidden||settings.muted);});
window.addEventListener('beforeunload',persist);
window.addEventListener('resize',()=>world?.resize());

function loop(now){
  const dt=document.hidden?0:Math.min((now-lastTime)/1000,0.05);lastTime=now;
  if(world && !world.disposed && started && mode!=='title'&&!document.hidden&&!world.preparingJourney){
    const x=mode==='world'?Number(held.has('d')||held.has('D')||held.has('ArrowRight'))-Number(held.has('a')||held.has('A')||held.has('ArrowLeft')):0;
    const z=mode==='world'?Number(held.has('s')||held.has('S')||held.has('ArrowDown'))-Number(held.has('w')||held.has('W')||held.has('ArrowUp')):0;
    if(x||z||mode!=='world')intendedInteraction=null;
    world.update(dt,state,{x,z,run:held.has('Shift'),paused:mode!=='world'});
    if(world.getAudioScene)audio.updateWorld?.(world.getAudioScene());
    if(mode==='cinematic'){
      const scene=world.getCinematicState();
      if(!scene)finishCinematic();
      else if($('#cinematic-caption').textContent!==scene.caption)$('#cinematic-caption').textContent=scene.caption;
    }
    if(world.walking&&mode==='world')sound(`step:${world.groundKind?.()||'stone'}${held.has('Shift')?':run':''}`);
    if(mode==='world'){
      if(now-travelTick>250){travelTick=now;updateTravelInstrument(document,state,world.getPlayerPosition(),getObjective(state));}
      const crossing=world.getTravelEvent();
      if(crossing?.locked)interact(crossing.locked);
      else if(crossing?.target)enterArea(crossing.target,null,{continuous:true});
      $('#hud').classList.toggle('settled',now>hudUntil);
      if(objectiveUntil&&now>objectiveUntil){objectiveUntil=0;$('#objective').classList.add('folded');$('#objective-toggle').setAttribute('aria-expanded','false');}
      while(dialogueQueue.length&&dialogueQueue[0].area!==state.area)dialogueQueue.shift();
      if(dialogueQueue.length&&dialogueQueue[0].due<=now&&world.isInsidePlace())speak(dialogueQueue.shift().id);
    }
    if(mode==='world'){
      state.playtime+=dt;autosave+=dt;
      {const door=world.getDoorEvent?.();if(door){useDoor(door.leave?{leave:true,label:AREAS[state.area].name}:door);}}
      nearby=world.getNearby();$('#ohm-button').hidden=!world.getCompanion();
      $('#touch-interact').disabled=!nearby;$('#touch-interact').textContent=nearby?'Interactuar':'Acercate';
      $('#touch-interact').setAttribute('aria-label',nearby?.label||'Acercate a una persona o instalación');
      if(intendedInteraction){const object=world.getInteractions().find(o=>o.id===intendedInteraction);if(!object)intendedInteraction=null;else if(world.canInteractWith(object)){intendedInteraction=null;world.target=null;world.route=[];interact(object);}else if(!world.target&&!world.route.length){if(!world.approachInteraction(object))intendedInteraction=null;}}
      show('#interaction',mode==='world'&&!!nearby);
      if(nearby&&mode==='world'){
        $('#interaction').classList.toggle('companion-prompt',nearby.id==='ohm_companion');
        let label=nearby.label||'Observar';
        if(nearby.action?.type==='toggle')label=(state.flags[nearby.action.flag]?nearby.action.offLabel:nearby.action.onLabel)||label;
        $('#interaction-label').textContent=label;
        const candidate=state.area+nearby.id+JSON.stringify(state.flags);if(candidate!==lastMeasurementCandidate){lastMeasurementCandidate=candidate;measurementAvailable=Boolean(state.flags.awaken&&measureWorld(state.area,state,nearby.id));}show('#field-measure',measurementAvailable);
        const pos=world.getScreenPosition(nearby),prompt=$('#interaction');
        const blocked=world.area.exits.map(exit=>world.getScreenPosition({...exit,target:true})).filter(point=>point.visible).map(point=>({left:point.x-30,right:point.x+30,top:point.y-24,bottom:point.y+24}));
        for(const selector of ['#travel-instrument','#field-meter','#ohm-bubble','.dpad','#touch-interact']){
          const element=$(selector);if(element.getClientRects().length)blocked.push(element.getBoundingClientRect());
        }
        const placement=placeInteractionPrompt({anchor:{x:pos.x,y:pos.y-32},size:{width:prompt.offsetWidth,height:prompt.offsetHeight},viewport:{width:innerWidth,height:innerHeight},blocked});
        prompt.classList.toggle('offset-prompt',placement.shifted);
        prompt.style.left=`${placement.x}px`;prompt.style.top=`${placement.y}px`;
      }
      if(activeMeasurement){const position=world.getPlayerPosition();const inReach=Math.hypot(position[0]-activeMeasurement.x,position[1]-activeMeasurement.z)<4;show('#field-meter',inReach);const flags=JSON.stringify(state.flags);if(flags!==lastMeasuredFlags){lastMeasuredFlags=flags;renderFieldMeasurement();if(inReach){const object=AREAS[state.area].objects.find(o=>o.id===activeMeasurement.id);if(recordFieldObservation(state,object,measureWorld(state.area,state,activeMeasurement.id)))show('#journal-dot');}}}
      if(autosave>5){autosave=0;persist();}
      chatterClock+=dt;
      if(state.flags.awaken&&chatterClock>38&&$('#field-meter').classList.contains('hidden')){
        chatterClock=0;
        const line=(OHM_CHATTER[state.area]||[]).find(c=>!state.seen.includes(c.id)&&hasRequirements(state,c.requires)&&!(c.unless||[]).some(f=>state.flags[f]));
        if(line){state.seen.push(line.id);bubble(line.text);}
      }
    }else {show('#interaction',false);show('#field-meter',false);}
  }
  if(mode==='dialogue'&&dialogue){
    const line=dialogue.lines[dialogue.index];typing+=dt*settings.textSpeed;const amount=Math.min(line.text.length,Math.floor(typing));
    if(amount>typed){typed=amount;$('#dialogue-text').textContent=line.text.slice(0,typed);}
  }
  if(now>bubbleUntil)show('#ohm-bubble',false);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
// Development-only inspection of the actual game; excluded from production.
// Read-only inspection for tests: development, or a measurement build (VITE_INSPECT=1), never the shipped one.
if(import.meta.env.DEV||import.meta.env.VITE_INSPECT==='1')window.__ohmdal={get state(){return state},get world(){return world},get mode(){return mode},get nearby(){return nearby},get workbench(){return workbench}};
