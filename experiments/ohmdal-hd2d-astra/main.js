import './style.css';
import './journey.css';
import * as THREE from 'three';
import { createWorld } from './world.js';
import { character } from './art.js';
import { initialState, transition, electricalState, readSave, SAVE_KEY } from './circuit.js';
import { arcAction, machineReading, accessible, journeyReady, REGIONS } from './arc-state.js';
import { JOURNEY } from './journey.js';
import { apparatusView } from './apparatus.js';

const $ = id => document.getElementById(id);
let state;
try { state = readSave(localStorage.getItem(SAVE_KEY)); } catch { state = initialState(); }
const world = createWorld($('world'));
world.setRegion(state.arc.region,state.player);
if (!world.canWalk(...state.player,electricalState(state).closed)) state.player = [-6,7];
let modal = null, nearest = null, walking = [], pendingTarget = null, toastTimer, saveTimer = 0;
let lastTime = performance.now(),elapsed = 0,active = true,failedSwitch = false;
const keys = new Set(), stick = {x:0,y:0}, direction = new THREE.Vector3();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const frames=[];
let travelToken=0,ribbonTimer;
const mechanism=apparatusView($('machine'),()=>state.arc,(region,action,value)=>{state.arc=arcAction(state.arc,region,action,value);save();updateUI();tone(240,.08,.025);},region=>{
  state.arc=arcAction(state.arc,region,'verify');save();updateUI();setModal(null);chime(true);const j=JOURNEY[region];
  showDialog(j.speaker,j.npc,j.after,[{label:region==='faro'?'Volver a la plaza':'Volver al camino',action:()=>{setModal(null);if(region==='faro')travel('plaza');}}, {label:'Anotar la experiencia',action:openJournal}]);
},()=>setModal(null));

function travel(region,fromMap=false){
  if(!accessible(state.arc,region,state.crossed)){toast('Primero hay una reparación que completar en el camino.');return;}
  const firstVisit=!state.arc.visited.includes(region),token=++travelToken;
  setModal('travel');$('fade').style.opacity='1';
  setTimeout(()=>{
    if(token!==travelToken)return;
    const old=state.arc.region;state.arc.region=region;if(firstVisit)state.arc.visited.push(region);
    state.player=region==='plaza'?[6.5,4.5]:REGIONS.indexOf(old)>REGIONS.indexOf(region)?[7,6]:[...JOURNEY[region].spawn];
    world.setRegion(region,state.player);rebuildLabels();frames.length=0;save();setModal(null);updateUI();$('fade').style.opacity='0';
    $('region-ribbon').querySelector('p').textContent=JOURNEY[region].chapter;$('region-ribbon').querySelector('h2').textContent=JOURNEY[region].title;$('region-ribbon').hidden=false;clearTimeout(ribbonTimer);ribbonTimer=setTimeout(()=>$('region-ribbon').hidden=true,2200);
    if(firstVisit&&region!=='plaza')showDialog('EN EL CAMINO','player',JOURNEY[region].arrival);
    else if(region==='plaza'&&state.arc.faro.verified&&!state.arc.complete)toast('Edda espera junto a la fuente. Esta vez, quiere mostrarte algo.');
  },280);
}
function openMap(){
  if(state.lessonTime!==undefined){toast('Edda está haciendo la demostración. El camino puede esperar un momento.');return;}
  setModal('map');$('map-places').replaceChildren();
  for(const region of REGIONS){const button=document.createElement('button'),j=JOURNEY[region],allowed=accessible(state.arc,region,state.crossed);button.disabled=!allowed;button.setAttribute('aria-current',String(state.arc.region===region));button.textContent=j.name;const label=document.createElement('span');label.textContent=state.arc.region===region?'ESTÁS ACÁ':state.arc[region]?.verified?'REPARACIÓN COMPARTIDA':state.arc.visited.includes(region)?'CAMINO CONOCIDO':allowed?'CAMINO ABIERTO':'POR DESCUBRIR';button.append(label);button.onclick=()=>travel(region,true);$('map-places').append(button);}
}
$('map-button').onclick=()=>modal==='map'?setModal(null):openMap();$('map-close').onclick=()=>setModal(null);

// Quiet, synthesized ambient sound: no downloads, samples, or external services.
let audioContext, master, audioOn=false, musicTimer, ambientSources=[];
function tone(frequency,duration=.18,volume=.1,delay=0,type='sine'){
  if(!audioOn||!audioContext)return;
  const osc=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime+delay;
  osc.type=type;osc.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.025);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain).connect(master);osc.start(start);osc.stop(start+duration+.02);
}
function chime(success=false){[261.63,329.63,success?523.25:392].forEach((f,i)=>tone(f,.75,.07,i*.13));}
function soundToggle(){
  audioOn=!audioOn;
  if(audioOn){
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();
    if(!master){master=audioContext.createGain();master.gain.value=.35;master.connect(audioContext.destination);
      const noise=audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate),data=noise.getChannelData(0);let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.018)/1.02;data[i]=brown;}
      const src=audioContext.createBufferSource();src.buffer=noise;src.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=850;const gain=audioContext.createGain();gain.gain.value=.28;src.connect(filter).connect(gain).connect(master);src.start();ambientSources.push(src);
    }
    master.gain.setTargetAtTime(.35,audioContext.currentTime,.2);
    let measure=0;const melody=()=>{if(!audioOn||!active||modal==='pause')return;const chords=[[146.83,220,293.66,349.23],[130.81,196,261.63,329.63],[164.81,220,293.66,440],[130.81,196,293.66,392]];chords[measure++%4].forEach((f,i)=>tone(f,4,.03,i*.7));};melody();musicTimer=setInterval(melody,6500);
  }else{clearInterval(musicTimer);if(master)master.gain.setTargetAtTime(0,audioContext.currentTime,.1);}
  $('sound-button').setAttribute('aria-pressed',String(audioOn));$('sound-button').setAttribute('aria-label',audioOn?'Desactivar sonido':'Activar sonido');$('sound-button').innerHTML=`${audioOn?'♫':'♪'}<span class="button-word"> Sonido</span>`;
}
$('sound-button').onclick=soundToggle;

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{/* Storage can be unavailable; the current session remains playable. */}}
function dispatch(action){const before=state.awakened;state=transition(state,action);save();updateUI();if(!before&&state.awakened){chime(true);toast('Algo responde. La corriente encontró el camino de vuelta.');setTimeout(()=>{if(!modal)interact('ohm');},850);}}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4400);}
function setModal(value){
  modal=value;keys.clear();stick.x=stick.y=0;walking=[];pendingTarget=null;$('joystick-knob').style.transform='';
  for(const id of ['dialog','journal','pause','machine','map'])$(id).hidden=value!==id;
  $('prompt').hidden=true;
  if(value==='pause'&&master)master.gain.setTargetAtTime(.05,audioContext.currentTime,.1);
  if(value===null&&master&&audioOn)master.gain.setTargetAtTime(.35,audioContext.currentTime,.2);
  if(value)requestAnimationFrame(()=>$(value)?.querySelector('button')?.focus({preventScroll:true}));
  else $('world').focus({preventScroll:true});
}
let dialogPages=[],dialogIndex=0,dialogEnd=null;
function showDialog(speaker,kind,pages,choices=null){
  setModal('dialog');$('speaker').textContent=speaker;
  const ctx=$('portrait').getContext('2d');ctx.clearRect(0,0,64,80);ctx.imageSmoothingEnabled=false;ctx.drawImage(character(kind),5,0,54,81);
  dialogPages=pages;dialogIndex=0;dialogEnd=choices;showDialogPage();
}
function showDialogPage(){
  $('dialog-text').textContent=dialogPages[dialogIndex];$('dialog-actions').replaceChildren();
  const choices=dialogIndex<dialogPages.length-1?[{label:'Seguir leyendo →',action:()=>{dialogIndex++;showDialogPage();}}]:(dialogEnd||[{label:'Volver a la plaza',action:()=>setModal(null)}]);
  for(const choice of choices){const button=document.createElement('button');button.textContent=choice.label;button.onclick=()=>{tone(440,.09,.025);choice.action();};$('dialog-actions').append(button);}
  requestAnimationFrame(()=>$('dialog-actions button')?.focus({preventScroll:true}));
}
const closeChoice={label:'Volver a la plaza',action:()=>setModal(null)};
function interact(id){
  if(modal||!state.started)return;
  const region=state.arc.region;
  if(region!=='plaza'){
    const j=JOURNEY[region],s=state.arc[region],r=machineReading(state.arc,region);
    if(id==='machine'){setModal('machine');mechanism.open(region);return;}
    if(id==='resident'){showDialog(j.speaker,j.npc,s.verified?j.after:j.before,s.verified&&region==='faro'?[{label:'Volver a la plaza',action:()=>travel('plaza')},closeChoice]:null);return;}
    if(id==='clue'){showDialog('LAS MARCAS DEL OFICIO','ohm',j.clue);return;}
    if(id==='memory'){showDialog('LO QUE QUEDÓ A LA VISTA','player',[j.observation]);return;}
    if(id==='previous'){travel(j.previous);return;}
    if(id==='next'){
      if(!s.verified||!r.ready){showDialog(j.speaker,j.npc,[!s.verified?'Antes de seguir, probemos la reparación juntos. Tiene que funcionar con su carga conectada.':'Antes de irte, dejá el mecanismo en funcionamiento. Ya sabemos cómo hacerlo.']);return;}
      travel(j.next||'plaza');return;
    }
    return;
  }
  const powered=electricalState(state).closed;
  if(id==='ohm'){
    if(!state.awakened){dispatch('inspect');showDialog('UN AUTÓMATA EN SILENCIO','ohm',[
      'La placa dice «Ohm». Alguien pulió las letras hace poco. Los ojos siguen apagados.',
      'Dos cables llegan al pedestal: uno viene de la pila; el otro rodea la base y termina en un puente de cobre partido. La rotura brilla entre los bordes verdes.'
    ]);}
    else if(!powered)showDialog('OHM','ohm',state.crossed?['Mi celda conserva la carga del viaje. Esta palanca abre el circuito de las lámparas; ahora tengo mi propia fuente.']:['La luz de sus ojos se apaga cuando levantás la palanca. El recorrido volvió a quedar abierto.']);
    else if(!state.verified)showDialog('OHM','ohm',[
      '…Continuidad restablecida. Cuarenta años sin una conversación nueva. Eso explica el polvo.',
      'Antes había energía en la pila. Ahora también hay corriente por mi circuito. ¿Qué cambió entre las dos observaciones?'
    ],[{label:'Mostrarle el puente que reparaste',action:()=>{dispatch('verify');showDialog('OHM','ohm',['Registrado: la reparación cerró el camino de vuelta. No agregaste energía a la pila. Le devolviste un recorrido.','Edda se agacha junto a la unión. Esta vez mira ambos cables. Del otro lado del canal, la Calzada sigue en silencio.'],[{label:'Anotarlo en la bitácora',action:()=>{setModal(null);openJournal();}},closeChoice]);}}]);
    else showDialog('OHM','ohm',['Dato nuevo: alguien se quedó a comprobar la reparación. Me parece un buen comienzo.','La Calzada está del otro lado del puente. Lumen dice que allí también dejaron de responder las cosas.']);
  }
  if(id==='edda'){
    if(state.arc.faro.verified&&!state.arc.complete&&!journeyReady(state.arc)){const pending=REGIONS.slice(1).find(r=>!state.arc[r].verified||!machineReading(state.arc,r).ready);showDialog('EDDA','edda',[`Antes de empezar, dejemos funcionando lo que vamos a contar. En ${JOURNEY[pending].name} todavía hay un mecanismo pendiente de comprobar.`,`La bitácora conserva lo que probamos. Podemos volver, repetirlo y después mostrarlo acá.`]);return;}
    if(state.arc.faro.verified&&!state.arc.complete){showDialog('EDDA','edda',['Lumen me pidió que se lo explique a alguien que no estuvo cuando llegaste. ¿Te quedás a mirar?','Esta vez no me digas dónde está la falla. Quiero mostrarle qué cambia cuando el camino se abre.'],[{label:'Observar la primera clase',action:()=>{setModal('lesson');state.lessonTime=0;state.switchClosed=true;toast('Edda se acerca a la palanca. Su aprendiz sigue los dos cables.');}}]);return;}
    if(state.arc.complete){showDialog('EDDA','edda',['Ahora sabemos por dónde empezar. Y si aparece algo distinto, sabemos qué comparar.','No volvió solamente la luz. Volvió la pregunta.']);return;}
    dispatch('edda');
    showDialog('EDDA','edda',state.verified?['Pensé que la pila se había gastado. Estaba siguiendo un solo cable.','Dejá la unión a la vista. Quiero probar la palanca yo también… y después mostrársela a Lumen.']:state.awakened?['¡Se movió! Esperá… no cambiamos la pila. Entonces era el recorrido.','Preguntale qué pudo observar. Quiero estar segura antes de contarlo.']:['Lo limpiamos todas las semanas. Lumen dice que antes saludaba a quien cruzaba la plaza.','Yo pensé en cambiar la pila. Pero él la probó en el taller y todavía sirve. ¿Vos qué mirarías?']);
  }
  if(id==='lumen'){
    if(state.returnRepaired)showDialog('MAESE LUMEN','lumen',state.awakened?['Escuché la palanca. Y después… una voz.','No tapes esa unión todavía. Quiero ver qué cambiaste y anotarlo antes de olvidarme.']:['El cobre está en su lugar. Falta comprobar qué pasa cuando bajás la palanca.']);
    else if(state.hasStrap)showDialog('MAESE LUMEN','lumen',['La tira es tuya. Los dos tornillos del puente sujetan los extremos. El hueco tiene que desaparecer.']);
    else showDialog('MAESE LUMEN','lumen',[
      'Esa rotura no es de hoy. La humedad fue comiendo el cobre. Le dábamos brillo a lo de afuera; nadie miraba por abajo.',
      'Guardé esta tira del mismo ancho. Probala entre los dos tornillos. Después contame qué hace Ohm, no solamente si quedó lindo.'
    ],[{label:'Tomar la tira de cobre',action:()=>{dispatch('lumen');setModal(null);chime();toast('Tira de cobre guardada · la unión rota está junto a Ohm.');}},closeChoice]);
  }
  if(id==='return'){
    dispatch('inspect');
    if(state.returnRepaired)showDialog('EL PUENTE DE COBRE','player',[powered?'La tira une los dos extremos. Una vibración suave llega desde el pedestal. La reparación conserva los tornillos y las marcas de antes.':'La tira ya une los dos extremos. La palanca es otro lugar donde el camino puede quedar abierto.']);
    else if(!state.hasStrap)showDialog('UN PUENTE PARTIDO','player',['Dos tornillos sujetan los restos de una tira. En medio hay un hueco: por acá el cable deja de ser un camino.','En el banco de Lumen, bajo el toldo rojizo, hay recortes de cobre del mismo ancho.']);
    else showDialog('UN PUENTE PARTIDO','player',['La tira de Lumen alcanza ambos tornillos. Al apoyarla, el hueco queda cubierto.'],[{label:'Ajustar la tira de cobre',action:()=>{setModal(null);dispatch('repair');tone(220,.12,.08);tone(330,.12,.05,.15);if(!state.switchClosed)toast('La unión está reparada. Probá la palanca.');}},closeChoice]);
  }
  if(id==='switch'){
    dispatch('switch');tone(state.switchClosed?180:130,.17,.1);
    if(electricalState(state).closed)toast('La palanca cierra el recorrido. Las lámparas responden.');
    else if(state.switchClosed){failedSwitch=true;toast('La palanca baja. Ohm sigue apagado: el hueco del puente continúa ahí.');}
    else toast(state.returnRepaired?'Al abrir el camino, la corriente se interrumpe.':'La palanca deja separados sus contactos.');
  }
  if(id==='source')showDialog('LA PILA DEL TALLER','player',['Dos bornes, dos cables. Una marca grabada distingue el positivo del negativo.','La etiqueta de Lumen dice «probada». La pila puede dar energía, pero eso solo no alcanza para que Ohm responda.']);
  if(id==='fountain')showDialog('LA FUENTE','player',machineReading(state.arc,'calzada').ready?['El agua vuelve a tocar las mismas piedras. Los surcos de los baldes siguen ahí.','Ahora el vaso de lata puede llenarse en la plaza. Una reparación del otro lado del canal cambió una costumbre de este lado.']:['El borde tiene surcos de baldes y manchas de agua. Alguien sigue dejando un vaso de lata al alcance de los chicos.',state.arc.calzada.verified?'La bomba del manantial está detenida. El conducto trae hasta acá sus consecuencias.':'El conducto sigue hacia La Calzada. El silencio de la fuente también tiene un camino.']);
  if(id==='bridge'){
    if(state.crossed){travel('calzada');return;}
    if(!state.awakened)showDialog('EL PUENTE DE LA CALZADA','player',['Desde aquí se ve el camino que sigue el canal. Antes de irte, el autómata de la plaza merece una segunda mirada.']);
    else if(!powered)showDialog('EL PUENTE DE LA CALZADA','player',['La plaza volvió a quedar apagada. Dejá cerrado el recorrido para que Ohm pueda acompañarte.']);
    else if(!state.verified)showDialog('EDDA','edda',['Antes de irnos, hablá con Ohm. Quiero entender qué acabamos de cambiar.']);
    else{routeTo(21.3,2.9);toast('El canal sigue hacia La Calzada.');}
  }
  if(id==='calzada'){
    dispatch('cross');showDialog('LA PREGUNTA VUELVE','edda',[
      'Lumen ya está dibujando la unión en un pedazo de papel. Me pidió que le muestre cómo supimos dónde mirar.',
      'Andá. Esta vez, si vuelve a apagarse, no vamos a empezar de cero.'
    ],[{label:'Seguir hacia La Calzada',action:()=>travel('calzada')},{label:'Seguir explorando la plaza',action:()=>setModal(null)}, {label:'Leer lo que aprendimos',action:()=>{setModal(null);openJournal();}}]);
  }
}
function updateUI(){
  const j=JOURNEY[state.arc.region];$('chapter-title').textContent=j.title;$('chapter-caption').textContent=j.chapter;$('location-label').textContent=`${j.name.toUpperCase()} · OHMDAL`;
  $('arrival').hidden=state.started;document.body.classList.toggle('arriving',!state.started);
  if(state.arc.region!=='plaza'){$('objective').textContent=state.arc[state.arc.region].verified?state.arc.region==='faro'?'Volvé a la plaza para escuchar a Edda.':`El camino hacia ${JOURNEY[j.next].name} está abierto.`:machineReading(state.arc,state.arc.region).ready?j.done:j.objective;return;}
  $('objective').textContent=state.arc.complete?'La luz volvió. La pregunta quedó en otras manos.':state.arc.faro.verified?'Edda quiere mostrarte la primera clase.':state.crossed?'El camino hacia La Calzada está abierto.':state.verified?'Seguí el canal hacia La Calzada.':state.awakened?'Ohm tiene algo que decir.':state.returnRepaired?'El camino está unido. Probá la palanca.':state.hasStrap?'La tira de cobre puede cubrir la rotura.':state.inspected?'Buscá a Lumen bajo el toldo del taller.':'Un autómata espera junto a la fuente.';
}
function openJournal(){
  setModal('journal');const entries=[];
  if(!state.inspected&&!state.awakened)entries.push(['Una plaza que cuida','Todavía no anoté ninguna reparación. Hay un autómata junto a la fuente y herramientas bajo el toldo.','']);
  if(state.inspected)entries.push(['01 · Una interrupción pequeña','La pila estaba probada. Un puente de cobre tenía un hueco. Mirar el camino completo cambió dónde buscábamos.','pila ─── Ohm ──╴ ╶── vuelta']);
  if(state.hasStrap||state.returnRepaired)entries.push(['02 · Una pieza, una consecuencia','Lumen conservaba una tira del mismo ancho. La reparación usa los tornillos que ya estaban ahí; sus marcas permiten recordar qué cambió.','']);
  if(state.awakened)entries.push(['03 · Un camino de ida y vuelta','Con la unión reparada y la palanca cerrada, Ohm respondió. Si abrimos la palanca, la corriente se interrumpe. La pila sigue siendo la misma.','pila ─── Ohm ─── regreso ↩']);
  if(state.verified)entries.push(['Lo que ahora podemos nombrar','Un circuito cerrado permite que circule corriente. La fuente aporta energía; el recorrido tiene que volver a ella. No basta con conectar un solo cable.','']);
  if(state.crossed)entries.push(['La primera explicación compartida','Edda se queda para mostrarle a Lumen el recorrido. La reparación deja de depender de quien llegó de afuera.','']);
  for(const region of REGIONS.slice(1))if(state.arc[region].verified)entries.push([...JOURNEY[region].journal,'']);
  if(state.arc.complete)entries.push(['La primera clase','Edda abrió el circuito, dejó observar el cambio y volvió a cerrarlo. Su aprendiz pudo seguir la corriente de ida y vuelta. Una reparación que otros pueden explicar ya no depende de quien llegó de afuera.','']);
  $('journal-entries').replaceChildren();for(const [title,body,sketch]of entries){const entry=document.createElement('div');entry.className='journal-entry';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=body;entry.append(h,p);if(sketch){const s=document.createElement('div');s.className='sketch';s.textContent=sketch;entry.append(s);}$('journal-entries').append(entry);}
}
$('journal-button').onclick=()=>modal==='journal'?setModal(null):openJournal();$('journal-close').onclick=()=>setModal(null);
$('pause-button').onclick=()=>modal==='pause'?setModal(null):setModal('pause');$('resume-button').onclick=()=>setModal(null);
let resetArmed=false;
$('reset-button').onclick=()=>{if(!resetArmed){resetArmed=true;$('reset-button').textContent='Borrar este recorrido y comenzar';return;}travelToken++;state=initialState();world.setRegion('plaza',state.player);rebuildLabels();failedSwitch=false;resetArmed=false;$('reset-button').textContent='Comenzar un recorrido nuevo';save();setModal(null);updateUI();};
$('begin-button').onclick=()=>{dispatch('start');$('world').focus();toast('Acercate al autómata, o hablá con Edda.');};
$('interact-button').onclick=()=>nearest&&interact(nearest.id);

// A small grid routes clicks around buildings and machinery; keyboard movement uses the same collision rules.
function routeTo(x,z,interaction=null){
  const step=.42,xmin=-12.6,zmin=-6.3,nx=85,nz=46;
  const index=(gx,gz)=>gz*nx+gx;
  const toGrid=(v,min,max)=>Math.max(0,Math.min(max-1,Math.round((v-min)/step)));
  const sx=toGrid(state.player[0],xmin,nx),sz=toGrid(state.player[1],zmin,nz);
  const powered=electricalState(state).closed && state.verified;
  const pass=(gx,gz)=>gx>=0&&gx<nx&&gz>=0&&gz<nz&&world.canWalk(xmin+gx*step,zmin+gz*step,powered);
  let gx=toGrid(x,xmin,nx),gz=toGrid(z,zmin,nz);
  if(interaction||!pass(gx,gz)){
    let best=Infinity,bestCell=null;
    for(let dz=-6;dz<=6;dz++)for(let dx=-6;dx<=6;dx++){
      const xx=gx+dx,zz=gz+dz;if(!pass(xx,zz))continue;const wx=xmin+xx*step,wz=zmin+zz*step,d=Math.hypot(wx-x,wz-z);
      if(interaction&&d>interaction.range*.77)continue;
      const score=d*.5+Math.hypot(wx-state.player[0],wz-state.player[1]);if(score<best){best=score;bestCell=[xx,zz];}
    }
    if(!bestCell){toast('No hay un paso libre hasta ahí.');return;}[gx,gz]=bestCell;
  }
  const start=index(sx,sz),goal=index(gx,gz),frontier=[start],came=new Map(),cost=new Map([[start,0]]),closed=new Set();let found=false;
  const heuristic=i=>Math.hypot(i%nx-gx,Math.floor(i/nx)-gz);
  for(let iterations=0;frontier.length&&iterations<5000;iterations++){
    let best=0;for(let j=1;j<frontier.length;j++)if(cost.get(frontier[j])+heuristic(frontier[j])<cost.get(frontier[best])+heuristic(frontier[best]))best=j;
    const current=frontier.splice(best,1)[0];if(current===goal){found=true;break;}closed.add(current);const cx=current%nx,cz=Math.floor(current/nx);
    for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const xx=cx+dx,zz=cz+dz;if(!pass(xx,zz)||dx&&dz&&(!pass(cx+dx,cz)||!pass(cx,cz+dz)))continue;const ni=index(xx,zz);if(closed.has(ni))continue;
      const nc=cost.get(current)+Math.hypot(dx,dz);if(nc<(cost.get(ni)??Infinity)){came.set(ni,current);cost.set(ni,nc);if(!frontier.includes(ni))frontier.push(ni);}
    }
  }
  if(!found){toast('Ese camino todavía no está libre.');return;}
  const path=[];let current=goal;while(current!==start){path.unshift([xmin+(current%nx)*step,zmin+Math.floor(current/nx)*step]);current=came.get(current);if(current===undefined)break;}
  walking=path;pendingTarget=interaction?.id||null;world.pointer.position.set(xmin+gx*step,.075,zmin+gz*step);world.pointer.visible=true;
}
let pointerStart;
$('world').addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
$('world').addEventListener('pointerup',e=>{
  if(modal||!state.started||!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>12)return;
  let target=null,best=Infinity;
  for(const t of world.targets){const p=world.screenPoint(t.x,t.y*.65,t.z);const d=Math.hypot(p.x-e.clientX,p.y-e.clientY);if(d<45&&d<best){best=d;target=t;}}
  if(target){if(Math.hypot(state.player[0]-target.x,state.player[1]-target.z)<target.range)interact(target.id);else routeTo(target.x,target.z,target);}
  else{const p=world.groundPoint(e.clientX,e.clientY);if(p)routeTo(p.x,p.z);}
});
document.addEventListener('keydown',e=>{
  if(e.code==='Tab'&&modal&&$(modal)){const controls=[...$(modal).querySelectorAll('button:not(:disabled),input')];if(controls.length){const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}
  if(e.code==='Escape'){e.preventDefault();if(!state.started)return;setModal(modal?null:'pause');return;}
  if(e.code==='KeyB'&&state.started){e.preventDefault();if(!e.repeat){if(modal==='journal')setModal(null);else if(!modal)openJournal();}return;}
  if(e.code==='KeyM'&&state.started&&!e.repeat){e.preventDefault();if(modal==='map')setModal(null);else if(!modal)openMap();return;}
  if(modal||!state.started)return;
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE'].includes(e.code)){e.preventDefault();if(!e.repeat&&(e.code==='KeyE'||e.code==='Space')){if(nearest)interact(nearest.id);}else keys.add(e.code);}
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();stick.x=stick.y=0;save();});
document.addEventListener('visibilitychange',()=>{active=!document.hidden;lastTime=performance.now();keys.clear();save();if(master)master.gain.setTargetAtTime(active&&audioOn ? .35 : 0,audioContext.currentTime,.1);});
const joystick=$('joystick');let stickPointer=null;
function moveStick(e){const b=joystick.getBoundingClientRect(),x=(e.clientX-b.left-b.width/2)/36,y=(e.clientY-b.top-b.height/2)/36,l=Math.max(1,Math.hypot(x,y));stick.x=x/l;stick.y=y/l;$('joystick-knob').style.transform=`translate(${stick.x*29}px,${stick.y*29}px)`;}
joystick.addEventListener('pointerdown',e=>{if(modal)return;e.preventDefault();stickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveStick(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,()=>{stickPointer=null;stick.x=stick.y=0;$('joystick-knob').style.transform='';});

const labels=new Map();function rebuildLabels(){labels.clear();$('world-labels').replaceChildren();for(const t of world.targets){const el=document.createElement('div');el.className='world-label';el.innerHTML='<span class="marker"></span><small></small>';el.querySelector('small').textContent=t.name;$('world-labels').append(el);labels.set(t.id,el);}}rebuildLabels();
function updateLabels(){
  nearest=null;let best=Infinity;
  for(const t of world.targets){const d=Math.hypot(state.player[0]-t.x,state.player[1]-t.z);if(d<t.range&&d<best){nearest=t;best=d;}}
  for(const t of world.targets){
    const important=t.id===(state.arc.region!=='plaza'?state.arc[state.arc.region].verified?'next':'machine':state.arc.faro.verified?'edda':state.verified?'bridge':state.awakened?'ohm':state.returnRepaired?'switch':state.hasStrap?'return':state.inspected?'lumen':'ohm');
    const visible=state.started&&!modal&&(nearest?.id===t.id||important);
    const label=labels.get(t.id);label.hidden=!visible;if(visible){const p=world.screenPoint(t.x,t.y,t.z);const offLeft=p.x<65,offRight=p.x>innerWidth-65;label.style.left=`${Math.max(65,Math.min(innerWidth-65,p.x))}px`;label.style.top=`${Math.max(230,Math.min(innerHeight-190,p.y))}px`;label.style.opacity=nearest?.id===t.id?'1':'.78';label.querySelector('small').textContent=`${offLeft?'← ':''}${t.id==='ohm'&&state.awakened?'Ohm':t.name}${offRight?' →':''}`;}
  }
  $('prompt').hidden=!!modal||!state.started||!nearest;
  if(nearest)$('prompt-label').textContent=nearest.id==='switch'?(state.switchClosed?'Levantar la palanca':'Bajar la palanca'):nearest.id==='return'&&state.hasStrap?'Reparar el puente de cobre':nearest.id==='ohm'&&state.awakened?'Hablar con Ohm':nearest.name;
}
function tick(now){
  requestAnimationFrame(tick);if(!active)return;
  const rawDt=(now-lastTime)/1000,dt=Math.min(rawDt,.05);lastTime=now;elapsed+=dt;
  if(rawDt>0&&rawDt<.5){frames.push(rawDt*1000);if(frames.length>600)frames.shift();}
  let moving=false;direction.set(0,0,0);
  if(state.started&&!modal&&state.lessonTime===undefined){
    const dx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x;
    const dz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+stick.y;
    if(Math.hypot(dx,dz)>.12){walking=[];pendingTarget=null;world.pointer.visible=false;direction.copy(world.viewRight).multiplyScalar(dx).addScaledVector(world.viewDown,dz).normalize();}
    else if(walking.length){const next=walking[0];direction.set(next[0]-state.player[0],0,next[1]-state.player[1]);if(direction.length()<.1){walking.shift();if(!walking.length){world.pointer.visible=false;if(pendingTarget){const id=pendingTarget;pendingTarget=null;interact(id);}}}else direction.normalize();}
    const powered=electricalState(state).closed&&state.verified;
    if(direction.lengthSq()>.1&&!modal){
      const speed=3.65*dt,x=state.player[0]+direction.x*speed,z=state.player[1]+direction.z*speed;
      if(world.canWalk(x,z,powered)){state.player=[x,z];moving=true;}
      else{if(world.canWalk(x,state.player[1],powered)){state.player[0]=x;moving=true;}if(world.canWalk(state.player[0],z,powered)){state.player[1]=z;moving=true;}}
    }
  }
  saveTimer+=dt;if(saveTimer>2){save();saveTimer=0;}
  if(state.lessonTime!==undefined&&(!modal||modal==='lesson')){
    const before=state.lessonTime;state.lessonTime+=dt;
    if(before<2.4&&state.lessonTime>=2.4){state.switchClosed=false;toast('La palanca abre el camino. Las lámparas del circuito se apagan.');}
    if(before<5.5&&state.lessonTime>=5.5){state.switchClosed=true;toast('Edda cierra el recorrido. La misma pila; una consecuencia distinta.');chime(true);}
    if(state.lessonTime>=8){delete state.lessonTime;state.arc.complete=true;state.switchClosed=true;save();updateUI();showDialog('EDDA','edda',['No le dije qué tenía que contestar. Le mostré algo que podía cambiar, y esperamos a ver qué pasaba.','En el taller ya guardaron el dibujo de la unión. En el faro, Nereo dejó la calibración al lado de la manivela.','No volvió solamente la luz. Volvió la pregunta.'],[{label:'Seguir habitando Ohmdal',action:()=>setModal(null)},{label:'Leer la bitácora del viaje',action:openJournal}]);}
  }
  if(state.arc.region==='plaza'&&!modal&&state.verified&&!state.crossed&&state.player[0]>20.4&&Math.abs(state.player[1]-2.9)<1.5)interact('calzada');
  world.update(reducedMotion?0:elapsed,dt,state,moving,direction);updateLabels();
}
updateUI();requestAnimationFrame(tick);
// Read-only observability for reproducible visual and interaction checks.
Object.defineProperty(window,'__ohmdal',{value:Object.freeze({
  snapshot(){const sorted=[...frames].sort((a,b)=>a-b);return{state:structuredClone(state),modal,nearest:nearest?.id||null,walking:walking.length,electrical:electricalState(state),machine:machineReading(state.arc,state.arc.region),render:{calls:world.renderer.info.render.calls,triangles:world.renderer.info.render.triangles,textures:world.renderer.info.memory.textures,frameMsMedian:sorted[Math.floor(sorted.length*.5)]||0,frameMsP95:sorted[Math.floor(sorted.length*.95)]||0,samples:sorted.length,pixelRatio:world.renderer.getPixelRatio()},targets:world.targets.map(t=>({...t,screen:world.screenPoint(t.x,t.y*.65,t.z)}))};}
}),writable:false});
