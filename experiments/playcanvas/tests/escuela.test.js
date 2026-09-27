import test from 'node:test';
import assert from 'node:assert/strict';
import {RESTORATIONS,schoolStage,previewState,trophies,cinematics,readOhmdal,readProfile,ohmdalSummary,freshProfile} from '../src/escuela/progress.js';
import {ROOMS,ROOM_ORDER,SHOWCASE} from '../src/escuela/rooms.js';
import {SAVE_KEY,freshState} from '../src/game/state.js';

const store=(data={})=>({getItem:k=>k in data?data[k]:null,setItem(k,v){data[k]=v;}});

test('cada etapa de vista previa produce su propia etapa de la escuela',()=>{
  for(let n=0;n<=RESTORATIONS.length;n++)assert.equal(schoolStage(previewState(n)),n);
});
test('las restauraciones cuentan en orden: una laguna detiene la escuela',()=>{
  const state=freshState();state.flags={awaken:true,workshop:true,pump:true};
  assert.equal(schoolStage(state),2);assert.equal(schoolStage(null),0);
});
test('la escuela lee la partida de Ohmdal sin romperse con datos ajenos',()=>{
  assert.equal(readOhmdal(store()),null);
  assert.equal(readOhmdal(store({[SAVE_KEY]:'{no es json'})),null);
  assert.equal(readOhmdal(store({[SAVE_KEY]:JSON.stringify({version:9})})),null);
  const state=freshState();state.flags.awaken=true;state.area='plaza';
  assert.equal(schoolStage(readOhmdal(store({[SAVE_KEY]:JSON.stringify(state)}))),1);
});
test('los trofeos siguen a la partida y la sala completa entrega los doce',()=>{
  assert.equal(trophies(null).filter(t=>t.earned).length,0);
  const all=trophies(previewState(10));assert.equal(all.length,12);assert.ok(all.every(t=>t.earned),all.filter(t=>!t.earned).map(t=>t.id).join());
  const partial=trophies(previewState(3)).find(t=>t.id==='cartografia');assert.ok(partial.progress>0&&partial.progress<1);
});
test('el Anfiteatro sólo proyecta escenas vividas',()=>{
  const state=freshState();state.flags={awaken:true,gate:true};
  assert.deepEqual(cinematics(state).filter(c=>c.unlocked).map(c=>c.id),['awaken','gate']);
  assert.ok(cinematics(null).every(c=>!c.unlocked));
});
test('el resumen de Ohmdal distingue un viaje sin comenzar',()=>{
  assert.equal(ohmdalSummary(null).started,false);
  const s=ohmdalSummary(previewState(10));assert.equal(s.percent,100);assert.ok(s.objective);
});
test('el registro del estudiante se sanea al leerlo',()=>{
  const p=readProfile(store({'roxana.escuela.v1':JSON.stringify({version:1,name:'x'.repeat(90),crest:'dragón',rooms:['taller','taller',3],settings:{muted:false,quality:'ultra'}})}));
  assert.equal(p.name.length,40);assert.equal(p.crest,'omega');assert.deepEqual(p.rooms,['taller']);assert.equal(p.settings.muted,false);assert.equal(p.settings.quality,'high');
  assert.deepEqual(readProfile(store({'roxana.escuela.v1':'{'})).rooms,freshProfile().rooms);
});
test('cada sala tiene un encuadre, un rótulo y una zona de selección válida',()=>{
  assert.deepEqual([...ROOM_ORDER].sort(),Object.keys(ROOMS).sort());
  for(const [id,r] of Object.entries(ROOMS)){
    const [lo,hi]=r.pick;for(let a=0;a<3;a++)assert.ok(lo[a]<hi[a],id);
    assert.ok(r.pose.distance>0&&r.pose.pitch>0,id);assert.equal(r.anchor.length,3,id);
  }
  assert.equal(SHOWCASE.length,RESTORATIONS.length);
});
