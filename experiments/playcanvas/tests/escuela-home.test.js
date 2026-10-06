import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validItem,visibleItems,sortItems,unreadCount,renderNews,newestReal} from '../src/escuela/news.js';
import {IDENTITIES,confirmed,pendingLinks,renderCommunity} from '../src/escuela/social.js';
import {readProfile,defaultQuality,freshProfile,readOhmdal,saveProfile,ohmdalPlaces,previewState} from '../src/escuela/progress.js';
import {heightAt,outside,roadX} from '../src/escuela/landscape.js';
import {ROOMS} from '../src/escuela/rooms.js';
import {ARTIFACTS} from '../src/escuela/artifacts.js';

const quiet=fn=>{const w=console.warn;console.warn=()=>{};try{return fn();}finally{console.warn=w;}};
const item=(o={})=>({id:'a',title:'Título',date:'2026-10-01',published:true,...o});

test('novedades: sólo publicadas, con fecha real y sin ejemplos fuera de desarrollo',()=>{
  const raw=[item({id:'ok'}),item({id:'borrador',published:false}),item({id:'ej',example:true}),item({id:'mala',date:'1 de octubre'}),{title:'sin id',date:'2026-10-01',published:true}];
  const shown=quiet(()=>visibleItems(raw));
  assert.deepEqual(shown.map(x=>x.id),['ok']);
  assert.deepEqual(quiet(()=>visibleItems(raw,{dev:true})).map(x=>x.id).sort(),['ej','ok']);
});
test('novedades: orden estable por fecha y luego por id',()=>{
  const list=[item({id:'b',date:'2026-09-01'}),item({id:'c',date:'2026-10-02'}),item({id:'a',date:'2026-09-01'})].map(validItem);
  assert.deepEqual(sortItems(list).map(x=>x.id),['c','a','b']);
});
test('novedades: enlaces sólo https o del propio sitio',()=>{
  assert.equal(quiet(()=>validItem(item({href:'javascript:alert(1)'}))),null);
  assert.equal(quiet(()=>validItem(item({href:'http://inseguro.example'}))),null);
  assert.ok(validItem(item({href:'./index.html'})));
  assert.equal(quiet(()=>validItem(item({href:'#'}))),null,'nunca href="#"');
  assert.ok(validItem(item({href:'#novedades'})));
});
test('novedades: el indicador de no leído cuenta sólo contenido real posterior a la última visita',()=>{
  const list=[item({id:'n',date:'2026-10-03'}),item({id:'v',date:'2026-09-01'}),item({id:'e',date:'2026-10-04',example:true})].map(validItem);
  assert.equal(unreadCount(list,'2026-10-01'),1);
  assert.equal(unreadCount(list,null),2,'primera visita: todo lo real está sin leer, los ejemplos no cuentan');
  assert.equal(newestReal([validItem(item({id:'e',date:'2026-10-09',example:true})),...list.filter(x=>!x.example)]),'2026-10-03');
});
test('novedades: estados vacío y error dignos, sin inventar contenido',()=>{
  assert.match(renderNews({status:'ok',items:[]}),/Todavía no hay novedades publicadas/);
  assert.match(renderNews({status:'error',items:[]}),/No pudimos traer las novedades/);
  const html=renderNews({status:'ok',items:[validItem(item({title:'<b>x</b>'}))]});
  assert.ok(!html.includes('<b>x</b>'),'el título se escapa');
});
test('el archivo de novedades versionado es válido y no publica nada real sin revisión',()=>{
  const data=JSON.parse(readFileSync(new URL('../public/escuela/novedades.json',import.meta.url),'utf8'));
  assert.equal(data.version,1);assert.ok(Array.isArray(data.items));
  for(const x of data.items)assert.ok(quiet(()=>validItem(x)),`entrada válida: ${x.id}`);
  assert.equal(visibleItems(data.items).length,data.items.filter(x=>x.published&&!x.example).length);
});
test('redes: proyecto y creador separados; nada sin URL confirmada se publica',()=>{
  assert.deepEqual(IDENTITIES.map(i=>i.id),['proyecto','creador']);
  assert.equal(confirmed({network:'instagram',url:null}),false);
  assert.equal(confirmed({network:'instagram',url:'#'}),false);
  assert.equal(confirmed({network:'instagram',url:'https://evil.example/roxana'}),false);
  assert.equal(confirmed({network:'youtube',url:'https://www.youtube.com/@ejemplo'}),true);
  // Hoy no hay ninguna URL confirmada en el repositorio: el rincón no aparece y lo pendiente queda listado.
  assert.equal(renderCommunity(),'');
  assert.ok(pendingLinks().length>0);
});
test('perfil: la fecha de novedades vistas sobrevive a una recarga y se descarta si es inválida',()=>{
  const store=d=>({getItem:()=>JSON.stringify({version:1,...d})});
  assert.equal(readProfile(store({newsSeen:'2026-10-01'})).newsSeen,'2026-10-01');
  assert.equal(readProfile(store({newsSeen:'ayer'})).newsSeen,null);
});
test('paisaje: el predio queda plano y la tierra baja a su alrededor; el camino sale del portón',()=>{
  assert.ok(outside(0,0)<0&&outside(60,0)>0);
  assert.equal(heightAt(10,10),-.5);
  assert.ok(heightAt(0,46)<-.4);
  assert.equal(roadX(34),0);
});
test('artefactos: cada uno queda en el césped, fuera de los edificios, y lleva a su taller',()=>{
  for(const [world,a] of Object.entries(ARTIFACTS)){
    assert.ok(ROOMS[a.room],`${world} → ${a.room}`);
    assert.ok(outside(a.x,a.z)<0,'dentro del predio');
    const [lo,hi]=ROOMS[a.room].pick;
    assert.ok(a.x<lo[0]||a.x>hi[0]||a.z<lo[2]||a.z>hi[2],`${world} fuera de su edificio`);
    assert.equal(ROOMS[a.room].picks.length,2);
  }
});
test('calidad: táctil de tamaño teléfono empieza en el perfil liviano; lo elegido se conserva',()=>{
  const env=(coarse,w,h)=>({matchMedia:q=>({matches:q.includes('coarse')&&coarse}),screen:{width:w,height:h}});
  assert.equal(defaultQuality(env(true,390,844)),'low');
  assert.equal(defaultQuality(env(false,1440,900)),'high');
  assert.equal(defaultQuality(env(true,1024,1366)),'high');
  assert.equal(defaultQuality({}),'high');
  assert.equal(freshProfile(env(true,390,844)).settings.quality,'low');
  const store={getItem:()=>JSON.stringify({version:1,settings:{quality:'high'}})};
  assert.equal(readProfile(store).settings.quality,'high');
});
test('almacenamiento bloqueado: leer y guardar no rompen la home',()=>{
  const desc=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new DOMException('bloqueado','SecurityError');}});
  try{
    assert.equal(readOhmdal(),null);
    assert.equal(readProfile().version,1);
    assert.equal(saveProfile(freshProfile()),false);
  }finally{if(desc)Object.defineProperty(globalThis,'localStorage',desc);else delete globalThis.localStorage;}
});
test('los módulos de la home compilan (main.js no lo importa ninguna otra prueba)',async()=>{
  const {transform}=await import('esbuild');const {readFileSync,readdirSync}=await import('node:fs');
  const dir=new URL('../src/escuela/',import.meta.url);
  for(const f of readdirSync(dir).filter(f=>f.endsWith('.js')))await transform(readFileSync(new URL(f,dir),'utf8'),{loader:'js',format:'esm'});
});
test('mapa del taller: cada lugar aparece sólo con su restauración real, en el orden del viaje',()=>{
  assert.deepEqual(ohmdalPlaces(null).filter(p=>p.restored),[]);
  assert.deepEqual(ohmdalPlaces(previewState(4)).filter(p=>p.restored).map(p=>p.id),['portal','plaza','workshop','road','spring']);
  assert.equal(ohmdalPlaces(previewState(10)).filter(p=>p.restored).length,9);
  assert.deepEqual(ohmdalPlaces(null).map(p=>p.id),['portal','plaza','workshop','road','spring','castle','terraces','lake','lighthouse']);
});
test('novedades: la selección es acotada y el resto queda en la misma página, sin enlaces muertos',()=>{
  const list=Array.from({length:8},(_,i)=>validItem(item({id:'n'+i,date:`2026-09-0${i+1}`})));
  const html=renderNews({status:'ok',items:sortItems(list)});
  assert.match(html,/<details class="news-more"><summary>Ver 2 novedades anteriores<\/summary>/);
  assert.equal((html.match(/news-item/g)||[]).length,8);
});
test('vista general: Trofeos y Anfiteatro se ven desde la cámara principal (techos a dos aguas, no cajas)',async()=>{
  const {OVERVIEW}=await import('../src/escuela/rooms.js');const {BUILDINGS,AMPHI}=await import('../src/escuela/school.js');
  // The master camera as placeCamera() sets it at 1440×900: distance grows until the island fits across.
  const fit=Math.max(1,50/(Math.tan(12*Math.PI/180)*1.6*OVERVIEW.distance)),y=OVERVIEW.yaw*Math.PI/180,p=OVERVIEW.pitch*Math.PI/180,d=OVERVIEW.distance*fit,t=OVERVIEW.target;
  const cam=[t[0]+Math.sin(y)*Math.cos(p)*d,t[1]+Math.sin(p)*d,t[2]+Math.cos(y)*Math.cos(p)*d];
  const roofAt=(b,x,z)=>{const ov=.55,hw=b.w/2+ov,hd=b.d/2+ov;if(Math.abs(x-b.x)>hw||Math.abs(z-b.z)>hd)return -1;const walls=Math.abs(x-b.x)<=b.w/2&&Math.abs(z-b.z)<=b.d/2,f=b.alongZ?1-Math.abs(x-b.x)/hw:1-Math.abs(z-b.z)/hd;return (walls?b.h:b.h-.2)+b.rise*f;};
  const seen=(pt,except)=>!Object.entries(BUILDINGS).some(([k,b])=>k!==except&&Array.from({length:399},(_,i)=>(i+1)/400).some(s=>cam[1]+(pt[1]-cam[1])*s<roofAt(b,cam[0]+(pt[0]-cam[0])*s,cam[2]+(pt[2]-cam[2])*s)));
  const tr=BUILDINGS.trofeos,front=[-.4,-.2,0,.2,.4].flatMap(u=>[1,2.5,3.8].map(h=>[tr.x+u*tr.w/2,h,tr.z+tr.d/2+1.6]));
  const a=AMPHI,amphi=[[a.x-4,3.6,a.z-.9],[a.x,3.6,a.z-.9],[a.x+4,3.6,a.z-.9],[a.x-6,.6,a.z+6],[a.x,.6,a.z+8],[a.x+6,.6,a.z+6]];
  // Before the move (corners behind the workshops): Trofeos 10/15, Anfiteatro 3/6.
  assert.ok(front.filter(q=>seen(q,'trofeos')).length>=12,'fachada de Trofeos tapada');
  assert.ok(amphi.filter(q=>seen(q,'anfiteatro')).length>=5,'Anfiteatro tapado');
  assert.ok(seen([a.x,3.6,a.z-.9],'anfiteatro'),'pantalla del Anfiteatro tapada');
});

// ── Versión clásica (escuela-clasica.html) ─────────────────────────────────────
const here=p=>new URL(p,import.meta.url);
test('versión clásica: la página servida trae todo el Instituto escrito, sin partida ni enlaces muertos',async()=>{
  const {renderStatic}=await import('../src/escuela/clasica-render.js');const {existsSync}=await import('node:fs');
  const news=JSON.parse(readFileSync(here('../public/escuela/novedades.json'),'utf8')).items;
  const html=quiet(()=>renderStatic(readFileSync(here('../escuela-clasica.html'),'utf8'),{news}));
  assert.ok(!html.includes('<!--clasica:'),'quedan marcas sin completar');
  assert.equal((html.match(/<article class="world/g)||[]).length,4,'cuatro mundos');
  assert.equal((html.match(/<ol class="ledger">/g)||[]).length,1);
  assert.equal((html.match(/<li><a href="\.\/escuela\.html#/g)||[]).length,9,'nueve lugares en el plano');
  assert.ok(!/href="#"|href=""/.test(html),'sin enlaces vacíos');
  assert.ok(!html.includes('#continuar'),'una primera visita no ofrece continuar');
  assert.ok(!html.includes('Ejemplo: así se ve'),'el ejemplo de desarrollo no se publica');
  for(const [,src] of html.matchAll(/src="\.\/(escuela\/[^"]+)"/g))assert.ok(existsSync(here('../public/'+src)),src);
  // Every room it links to opens in the 3D home (rooms.js, plus the routes #sobre and #novedades).
  for(const [,h] of html.matchAll(/href="\.\/escuela\.html#([\w-]+)"/g))assert.ok(ROOMS[h]||h==='sobre',h);
  for(const [,id] of html.matchAll(/href="#([\w-]+)"/g))assert.ok(html.includes(`id="${id}"`),`ancla #${id}`);
});
test('versión clásica: el primer pintado elige la misma lámina que la home 3D (hora × tramo de la partida)',async()=>{
  const {campusImage}=await import('../src/escuela/clasica-render.js');const {runInNewContext}=await import('node:vm');
  const run=(file,{search='',save=null,hour=16})=>{
    const code=readFileSync(here(file),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],props={},win={};
    const document={documentElement:{dataset:{},style:{setProperty:(k,v)=>{props[k]=v;}}},createElement:()=>({}),head:{appendChild:()=>{}}};
    runInNewContext(code,{URLSearchParams,location:{search},Date:class extends Date{getHours(){return hour;}},localStorage:{getItem:()=>save},matchMedia:()=>({matches:false}),document,window:win,JSON,Number,Math,Boolean});
    return {poster:props['--poster'],campus:win.__campus};
  };
  for(const [hora,hour] of [['manana',9],['tarde',16],['noche',22]])for(let n=0;n<=10;n++){
    const want=campusImage(hora,n);
    assert.equal(run('../escuela-clasica.html',{search:`?etapa=${n}`,hour}).campus.src,want,`clásica ${hora} ${n}`);
    assert.equal(run('../escuela.html',{search:`?etapa=${n}`,hour}).poster,`url("${want}")`,`3D ${hora} ${n}`);
  }
  const save=JSON.stringify(previewState(6));
  assert.equal(run('../escuela-clasica.html',{save}).campus.src,campusImage('tarde',6));
  assert.equal(run('../escuela.html',{save}).poster,`url("${campusImage('tarde',6)}")`);
});
test('versión clásica: registro, láminas y plano siguen la partida real; la vista previa no ofrece continuar',async()=>{
  const {renderRecord,renderPlan,renderWorlds,wayIn}=await import('../src/escuela/clasica-render.js');
  const lit=h=>(h.match(/class="lamp lit"/g)||[]).length;
  assert.equal(lit(renderPlan(null)),0);assert.equal(lit(renderPlan(previewState(4))),0);assert.equal(lit(renderPlan(previewState(5))),16);
  assert.ok(renderPlan(previewState(4)).includes('fountain water')&&!renderPlan(previewState(3)).includes('fountain water'));
  assert.match(renderRecord(previewState(6)),/Continuar en Ohmdal/);
  assert.doesNotMatch(renderRecord(previewState(6),{way:wayIn(null),preview:6}),/Continuar/);
  assert.match(renderRecord(previewState(6),{way:wayIn(null),preview:6}),/Vista previa de la etapa 6/);
  assert.match(renderWorlds(previewState(9)),/mundo-ohmdal-luz\.jpg/);assert.doesNotMatch(renderWorlds(previewState(8)),/mundo-ohmdal-luz/);
  // Worlds without integration never get counts or trophies of their own.
  const rec=renderRecord(previewState(10));assert.match(rec,/Physica, Bitland y Arithmos todavía no comparten su progreso/);
  assert.doesNotMatch(rec,/(Physica|Bitland|Arithmos)[^<]{0,40}\d+\s*\/\s*\d+/);
  assert.match(renderRecord(null),/Todavía no hay un viaje guardado/);
});
test('versión clásica: no carga el motor 3D ni el campus',async()=>{
  const {build}=await import('esbuild');const {fileURLToPath}=await import('node:url');
  const r=await build({entryPoints:[fileURLToPath(here('../src/escuela/clasica.js'))],bundle:true,minify:true,write:false,metafile:true,format:'esm',logLevel:'silent'});
  const inputs=Object.keys(r.metafile.inputs);
  assert.ok(!inputs.some(f=>f.includes('node_modules/playcanvas')),'playcanvas en la versión clásica');
  assert.ok(!inputs.some(f=>/escuela\/(school|diorama|kit|landscape|statue)\.js$/.test(f)),'geometría 3D en la versión clásica');
  assert.ok(r.outputFiles[0].contents.length<160_000,`script de ${r.outputFiles[0].contents.length} bytes`);
});
