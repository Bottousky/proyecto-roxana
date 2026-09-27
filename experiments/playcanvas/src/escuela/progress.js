// What the Instituto knows about the student: read from the Ohmdal save without ever
// writing it, and turned into the school's stage, its trophies and its film catalogue.
// Pure functions so the tests and the diorama agree on what each restoration changes.
import {AREAS,JOURNAL,TOTAL_SECRETS,getObjective} from '../game/content.js';
import {SAVE_KEY,AREA_IDS,validateState} from '../game/state.js';
import {CINEMATIC_DEFINITIONS} from '../game/cinematics.js';

export const SCHOOL_KEY='roxana.escuela.v1';

// Each restoration in Ohmdal returns something to the school. Order follows the arc.
export const RESTORATIONS=[
  {flag:'awaken',world:'Portal Ω',title:'Una pequeña luz',school:'Se enciende el farol a los pies de Roxana y una ventana del Taller de Electrónica. Ohm espera en el patio.'},
  {flag:'workshop',world:'Taller de Lumen',title:'El oficio de preguntar',school:'Las lámparas del Taller de Electrónica funcionan otra vez.'},
  {flag:'gate',world:'Puerta de Ohm',title:'El otro lado de la puerta',school:'Se abre el portón del Instituto.'},
  {flag:'pump',world:'Manantial',title:'Donde empieza el agua',school:'La fuente del patio vuelve a correr.'},
  {flag:'distribution',world:'Castillo de la Red',title:'Una red que se puede comprender',school:'Los faroles del patio se encienden, rama por rama.'},
  {flag:'irrigation',world:'Terrazas',title:'Lo que compartimos',school:'Los canteros del patio florecen.'},
  {flag:'beacon_link',world:'Lago de las Señales',title:'La orilla de la señal',school:'Los estandartes de Ohmdal cuelgan de la galería.'},
  {flag:'beacon_network',world:'Faro · II',title:'El ruido que faltaba',school:'La campana de la torre vuelve a sonar.'},
  {flag:'beacon_lens',world:'Faro · III',title:'La Luz',school:'La linterna de la torre se enciende sobre la escuela.'},
  {flag:'epilogue_shared',world:'Epílogo',title:'La primera clase',school:'Vecinos de Ohmdal visitan el patio del Instituto.'},
];

// The four Applied Worlds share the school on equal footing: one workshop each.
export const WORLDS=[
  {id:'ohmdal',name:'Ohmdal',verb:'conectar',discipline:'Electricidad y electrónica',room:'electronica',taller:'Taller de Electrónica',glyph:'Ω',color:'#6fd6cf',available:true,
    entry:{name:'El Portal Ω',detail:'Se entra cruzando el arco del taller: una pared que deja pasar a quien pregunta.'},
    premise:'Un reino que fue apagándose cuando sus habitantes dejaron de preguntarse por qué había luz. Recuperar ese conocimiento transforma sus lugares, sus oficios y sus relaciones.'},
  {id:'physica',name:'Physica',verb:'experimentar',discipline:'Física',room:'fisica',taller:'Taller de Física',glyph:'Φ',color:'#f2a860',available:false,
    entry:{name:'La pecera',detail:'Un mundo subatómico, casi cuántico, contenido en una pecera. Desde su consola se regulan las leyes de la física a gusto.',preview:true},
    premise:'El Instituto alteró condiciones para aislar fenómenos; las configuraciones superpuestas dejaron consecuencias que hay que comprender mediante observación y experimentación.'},
  {id:'bitland',name:'Bitland',verb:'programar',discipline:'Programación',room:'programacion',taller:'Taller de Programación',glyph:'λ',color:'#a595ff',available:false,
    entry:{name:'El casco de realidad virtual',detail:'Bitland es una ciudad simulada dentro de un microcontrolador. Se entra colocándose el casco.',preview:true},
    premise:'Una ciudad donde la computación sostiene la infraestructura. Su historia sobre el reloj central y la última intervención del Instituto está por contarse; el reloj de la torre de la escuela sigue detenido.'},
  {id:'arithmos',name:'Arithmos',verb:'transformar',discipline:'Matemática',room:'matematica',taller:'Taller de Matemática',glyph:'∑',color:'#86e0a8',available:false,
    entry:{name:'El pizarrón',detail:'La tiza traza una puerta; quien la cruza se vuelve parte del dibujo y, del otro lado, lo espera un plano de ecuaciones que no termina.',preview:true},
    premise:'Un mundo vinculado a reconocer equivalencias entre representaciones, fracturado por la pérdida de esa capacidad.'},
];
export const worldById=id=>WORLDS.find(w=>w.id===id);
export const worldByRoom=room=>WORLDS.find(w=>w.room===room);

const PUZZLE_FLAGS=['awaken','workshop','gate','pump','distribution','irrigation','beacon_supply','beacon_network','beacon_lens'];

/** Read the Ohmdal save. Never throws, never writes. */
export function readOhmdal(storage=globalThis.localStorage){
  try{const raw=storage?.getItem(SAVE_KEY);if(!raw)return null;return validateState(JSON.parse(raw));}catch{return null;}
}

/** 0 = the school as the student found it; RESTORATIONS.length = fully restored. */
export function schoolStage(state){
  if(!state)return 0;let stage=0;
  for(const r of RESTORATIONS){if(state.flags?.[r.flag])stage++;else break;}
  return stage;
}

/** A stage as a stand-in save, for previews that must not touch the real one. */
export function previewState(stage){
  const flags={};RESTORATIONS.slice(0,stage).forEach(r=>flags[r.flag]=true);
  if(flags.beacon_lens){flags.beacon_supply=true;flags.finale_seen=true;}
  if(flags.beacon_network)flags.beacon_supply=true;
  const visited=AREA_IDS.slice(0,Math.min(AREA_IDS.length,Math.ceil(stage*AREA_IDS.length/RESTORATIONS.length)));
  const secrets=allSecrets().slice(0,Math.floor(stage*TOTAL_SECRETS/RESTORATIONS.length));
  return {version:1,area:visited.at(-1)||'portal',flags,seen:[],secrets,visited,puzzles:{},fieldNotes:[],personalNotes:stage>3?{circuit:'El retorno también es camino.'}:{},playtime:stage*540,createdAt:Date.now()-stage*864e5,savedAt:Date.now()};
}

export function allSecrets(){return Object.values(AREAS).flatMap(a=>a.objects).filter(o=>o.secret).map(o=>o.secret);}

export function journalCount(state){
  if(!state)return 0;return JOURNAL.filter(e=>e.requires.every(f=>state.flags?.[f])).length;
}

/** Trophies of the Sala de Trofeos. `progress` is 0..1 for the partial ones. */
export function trophies(state){
  const f=state?.flags||{},secrets=state?.secrets?.length||0,visited=state?.visited?.length||0,notes=Object.values(state?.personalNotes||{}).filter(v=>String(v||'').trim()).length;
  const has=flag=>Boolean(f[flag]);
  const list=[
    {id:'despertar',title:'Una pequeña luz',detail:'Despertaste a Ohm con un circuito cerrado.',kind:'medal',earned:has('awaken')},
    {id:'taller',title:'El oficio de preguntar',detail:'Encontraste el corte bajo la tela del taller de Lumen.',kind:'medal',earned:has('workshop')},
    {id:'puerta',title:'La Puerta de Ohm',detail:'Invertiste la polaridad del cerrojo y abriste la Calzada.',kind:'medal',earned:has('gate')},
    {id:'manantial',title:'Donde empieza el agua',detail:'Una unión que pasaba… y perdía. El agua volvió a la Plaza.',kind:'medal',earned:has('pump')},
    {id:'castillo',title:'Cerrar una rama sin cerrar el reino',detail:'Aislaste el archivo del Castillo sin apagar a sus vecinos.',kind:'medal',earned:has('distribution')},
    {id:'terrazas',title:'Azadas y tomates',detail:'Repartiste la potencia entre la forja y el riego.',kind:'medal',earned:has('irrigation')},
    {id:'orilla',title:'La orilla de la señal',detail:'Completaste alimentación y retorno bajo el lago.',kind:'medal',earned:has('beacon_link')},
    {id:'faro',title:'La Luz',detail:'Encendiste el Faro de Ohmdal. Desde la Plaza, una campana respondió.',kind:'cup',earned:has('beacon_lens')},
    {id:'recuerdos',title:'Memoria de Ohmdal',detail:`Encontraste los recuerdos escondidos del reino (${secrets}/${TOTAL_SECRETS}).`,kind:'crystal',earned:secrets>=TOTAL_SECRETS,progress:TOTAL_SECRETS?secrets/TOTAL_SECRETS:0},
    {id:'cartografia',title:'Cartografía completa',detail:`Recorriste los lugares del Arco I (${visited}/${AREA_IDS.length}).`,kind:'globe',earned:visited>=AREA_IDS.length,progress:visited/AREA_IDS.length},
    {id:'hipotesis',title:'Letra propia',detail:'Escribiste una hipótesis personal en la Bitácora.',kind:'book',earned:notes>0},
    {id:'primera-clase',title:'La primera clase',detail:'Compartiste lo aprendido con Edda, Lumen y Tala.',kind:'cup',earned:has('epilogue_shared')},
  ];
  return list.map(t=>({...t,world:'ohmdal',progress:t.progress??(t.earned?1:0)}));
}

// The Anfiteatro shows a restoration scene only after the student has lived it.
export const CINEMATICS=[
  {id:'awaken',title:'Una pequeña luz',area:'Portal Ω'},
  {id:'workshop',title:'La lámpara era la misma',area:'Taller de Lumen'},
  {id:'gate',title:'La Puerta de Ohm',area:'Calzada'},
  {id:'pump',title:'El agua vuelve a la Plaza',area:'Manantial'},
  {id:'irrigation',title:'El último bancal',area:'Terrazas'},
  {id:'beacon_network',title:'El viejo sonido de la torre',area:'Faro'},
  {id:'beacon_lens',title:'La Luz',area:'Faro'},
].map(c=>({...c,world:'ohmdal',duration:CINEMATIC_DEFINITIONS[c.id].duration,captions:CINEMATIC_DEFINITIONS[c.id].captions.map(x=>x.text)}));

export function cinematics(state){return CINEMATICS.map(c=>({...c,unlocked:Boolean(state?.flags?.[c.id])}));}

export function ohmdalSummary(state){
  if(!state)return {started:false,percent:0,stage:0,objective:null,playtime:0,savedAt:null,area:null};
  const done=PUZZLE_FLAGS.filter(f=>state.flags?.[f]).length+(state.flags?.epilogue_shared?1:0);
  return {started:true,percent:Math.round(done/(PUZZLE_FLAGS.length+1)*100),stage:schoolStage(state),objective:getObjective(state),playtime:state.playtime||0,savedAt:state.savedAt||null,area:AREAS[state.area]?.name||null,journal:journalCount(state),journalTotal:JOURNAL.length};
}

// The student's own record at the school: separate from any world save.
export function freshProfile(){return {version:1,name:'',crest:'omega',createdAt:Date.now(),rooms:[],watched:[],stageSeen:0,welcomed:false,settings:{muted:true,reducedMotion:false,quality:'high'}};}
export function readProfile(storage=globalThis.localStorage){
  const base=freshProfile();
  try{const data=JSON.parse(storage?.getItem(SCHOOL_KEY)||'null');if(!data||data.version!==1)return base;
    return {...base,name:typeof data.name==='string'?data.name.slice(0,40):'',crest:['omega','engranaje','compas','llave'].includes(data.crest)?data.crest:'omega',
      createdAt:Number.isFinite(data.createdAt)?data.createdAt:base.createdAt,
      rooms:Array.isArray(data.rooms)?[...new Set(data.rooms.filter(x=>typeof x==='string'))]:[],
      watched:Array.isArray(data.watched)?[...new Set(data.watched.filter(x=>typeof x==='string'))]:[],
      stageSeen:Number.isInteger(data.stageSeen)&&data.stageSeen>=0?Math.min(10,data.stageSeen):0,welcomed:data.welcomed===true,
      settings:{...base.settings,...(data.settings&&typeof data.settings==='object'?{muted:data.settings.muted!==false,reducedMotion:data.settings.reducedMotion===true,quality:data.settings.quality==='low'?'low':'high'}:{})}};
  }catch{return base;}
}
export function saveProfile(profile,storage=globalThis.localStorage){try{storage?.setItem(SCHOOL_KEY,JSON.stringify(profile));return true;}catch{return false;}}
