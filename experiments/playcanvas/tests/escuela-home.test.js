import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validItem,visibleItems,sortItems,unreadCount,renderNews} from '../src/escuela/news.js';
import {IDENTITIES,confirmed,pendingLinks,renderCommunity} from '../src/escuela/social.js';
import {readProfile,defaultQuality,freshProfile,readOhmdal,saveProfile} from '../src/escuela/progress.js';
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
});
test('novedades: el indicador de no leído cuenta sólo contenido real posterior a la última visita',()=>{
  const list=[item({id:'n',date:'2026-10-03'}),item({id:'v',date:'2026-09-01'}),item({id:'e',date:'2026-10-04',example:true})].map(validItem);
  assert.equal(unreadCount(list,'2026-10-01'),1);
  assert.equal(unreadCount(list,null),0);
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
