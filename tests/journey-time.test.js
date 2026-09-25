import test from 'node:test';import assert from 'node:assert/strict';
import {freshState,validateState} from '../src/state.js';
import {advanceJourneyTime,journeyPhase} from '../src/story-time.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';import {updateDaylight} from '../src/world-time.js';
test('the story day advances at arrivals and never rewinds on returning or waiting',()=>{
  const s=freshState();s.flags.workshop=true;s.area='plaza';assert.equal(advanceJourneyTime(s).id,'morning');
  for(const [place,phase] of [['spring','afternoon'],['terraces','sunset'],['lake','dusk'],['lighthouse','night']]){s.area=place;assert.equal(advanceJourneyTime(s).id,phase);}
  s.area='plaza';s.playtime=360000;assert.equal(advanceJourneyTime(s).id,'night');
  s.flags.beacon_lens=true;assert.equal(advanceJourneyTime(s).id,'night');assert.equal(advanceJourneyTime(s,{epilogue:true}).day,2);
  s.area='portal';assert.equal(advanceJourneyTime(s).id,'next-morning');
});
test('old and interrupted saves infer the canonical hour without resetting progress',()=>{
  const s=freshState();delete s.journeyTime;s.area='plaza';s.visited=['portal','plaza','lighthouse'];s.flags.awaken=true;
  const migrated=validateState(s);assert.equal(journeyPhase(migrated).id,'night');assert.ok(migrated.flags.awaken);
  s.activeDialogue={id:'lighthouse_epilogue',index:2};s.flags.beacon_lens=true;assert.equal(journeyPhase(validateState(s)).day,2);
  s.activeDialogue=null;s.visited=[];s.journeyTime={phase:900};assert.equal(journeyPhase(validateState(s)).id,'night');
});
test('outdoor lamps need darkness and restored power; daylight remains legible',()=>{
  const w=buildCollisionWorld('plaza',{flags:{workshop:true}});
  try{
    w.state.journeyTime={phase:0};updateDaylight(w,w.state,1,true);
    assert.ok(w.lamps.every(l=>l.glow.material.opacity===0));assert.equal(w.m.glass.emissiveIntensity,0);const day=w.sun.intensity;
    w.state.journeyTime.phase=4;updateDaylight(w,w.state,1,true);
    assert.ok(w.lamps.every(l=>l.glow.material.opacity>.6));assert.ok(w.sun.intensity<day);assert.ok(w.hemi.intensity>.7);
    w.state.flags.workshop=false;w.updateFlags(w.state);updateDaylight(w,w.state,1,true);assert.ok(w.lamps.every(l=>l.glow.material.opacity===0));
  }finally{w.dispose();}
});
