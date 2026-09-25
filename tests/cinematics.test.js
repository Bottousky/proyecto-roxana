import test from 'node:test';
import assert from 'node:assert/strict';
import {CINEMATIC_DEFINITIONS,createCinematic,sampleCinematic,returningCinematic,gameplayCameraPose} from '../src/cinematics.js';

function context(id){const areaId=CINEMATIC_DEFINITIONS[id].area,player=[4,0,2];return{areaId,flags:{[id]:true},player,companion:[2,0,2.7],puzzle:[3.5,1.4,0],bounds:[36,36],start:gameplayCameraPose(areaId,player)};}

test('all restoration timelines include a complete return to the gameplay camera',()=>{
  for(const [id,definition] of Object.entries(CINEMATIC_DEFINITIONS)){
    const ctx=context(id),original=JSON.stringify(ctx),timeline=createCinematic(id,ctx);
    assert.equal(timeline.duration,definition.duration);assert.deepEqual(sampleCinematic(timeline,0).pose,ctx.start);
    if(id==='beacon_lens')assert.equal(timeline.duration,12);else assert.ok(timeline.duration>=4&&timeline.duration<=6);
    const returning=sampleCinematic(timeline,timeline.returnAt+.1);assert.equal(returning.returning,true);assert.equal(returning.done,false);
    const end=sampleCinematic(timeline,timeline.duration+20);assert.equal(end.done,true);assert.deepEqual(end.pose,gameplayCameraPose(ctx.areaId,ctx.player));assert.equal(end.caption,'');assert.equal(JSON.stringify(ctx),original);
    for(let t=0;t<=timeline.duration;t+=.1){const sample=sampleCinematic(timeline,t);assert.ok([...sample.pose.focus,...sample.pose.offset,sample.pose.zoom].every(Number.isFinite));assert.ok(sample.pose.zoom>=.65&&sample.pose.zoom<1.8);}
  }
});

test('cinematics require the current area, restored result and allowed motion',()=>{
  const ctx=context('awaken');assert.equal(createCinematic('unknown',ctx),null);assert.equal(createCinematic('awaken',ctx,{reducedMotion:true}),null);
  assert.equal(createCinematic('awaken',{...ctx,areaId:'plaza'}),null);assert.equal(createCinematic('awaken',{...ctx,flags:{}}),null);assert.equal(createCinematic('awaken',{...ctx,companion:null}),null);
});

test('awakening frames the current companion with the pedestal instead of an empty fixed anchor',()=>{
  const ctx=context('awaken');ctx.player=[5,0,1];ctx.companion=[8,.35,1.7];ctx.puzzle=[3.5,1.4,0];
  const close=sampleCinematic(createCinematic('awaken',ctx),1).pose;
  assert.equal(close.focus[0],(8+3.5)/2);assert.equal(close.focus[2],1.7/2);assert.ok(close.offset[1]>=18);assert.equal(close.offset[0],0);
});

test('the Faro follows its three captions and shows the existing tower/beam framing before returning',()=>{
  const timeline=createCinematic('beacon_lens',context('beacon_lens'));
  assert.equal(sampleCinematic(timeline,.5).caption,'La luz se sostiene detrás del cristal.');assert.equal(sampleCinematic(timeline,4).caption,'Una vuelta. Una pausa.');assert.equal(sampleCinematic(timeline,8).caption,'Desde la Plaza, una campana responde.');
  assert.deepEqual(sampleCinematic(timeline,8).pose.focus,[0,9,-14]);assert.deepEqual(sampleCinematic(timeline,8).pose.offset,[7,13.5,24]);
});

test('skip returns from the actual current camera without a first-frame jump',()=>{
  const ctx=context('beacon_lens'),current=sampleCinematic(createCinematic('beacon_lens',ctx),5.7).pose,game=gameplayCameraPose(ctx.areaId,ctx.player),timeline=returningCinematic('beacon_lens',current,game);
  assert.equal(sampleCinematic(timeline,0).returning,true);assert.deepEqual(sampleCinematic(timeline,0).pose,current);assert.equal(sampleCinematic(timeline,.35).done,false);assert.deepEqual(sampleCinematic(timeline,.7).pose,game);assert.equal(sampleCinematic(timeline,.7).done,true);
});
