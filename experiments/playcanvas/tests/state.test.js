import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,validateState,loadState,saveState,loadSettings,hasRequirements,SETTINGS_KEY} from '../src/game/state.js';
const storage=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)}};
test('save roundtrip preserves unfinished puzzles and world systems',()=>{const s=freshState();s.area='spring';s.flags.awaken=true;s.puzzles.pump={wires:[['a','b']],sourceOn:false};s.position=[2,-4];const db=storage();assert.equal(saveState(s,db),true);const restored=loadState(db).state;assert.deepEqual(restored.puzzles,s.puzzles);assert.deepEqual(restored.position,[2,-4]);assert.ok(hasRequirements(restored,['awaken']));assert.ok(!hasRequirements(restored,['pump']));});
test('invalid saves cannot place player into nonexistent area or invalid coordinates',()=>{assert.throws(()=>validateState({version:1,area:'missing'}));const s=freshState();s.position=[Infinity,2];assert.equal(validateState(s).position,null);});
test('unavailable storage returns a recoverable result',()=>{const db={getItem:()=>{throw new Error('disabled')},setItem:()=>{throw new Error('full')}};assert.equal(loadState(db).state,null);assert.equal(saveState(freshState(),db),false);});
test('malformed imported destinations and settings cannot break map, audio or reading',()=>{
  const s=freshState();s.visited=['portal','unknown','plaza','plaza'];s.settings={volume:'loud',muted:'false',quality:'ultra',textSpeed:-1};
  const loaded=validateState(s);assert.deepEqual(loaded.visited,['portal','plaza']);assert.deepEqual(loaded.settings,freshState().settings);
  const db=storage();db.setItem(SETTINGS_KEY,JSON.stringify({volume:8,textSpeed:0,reducedMotion:[] }));const prefs=loadSettings(db);assert.equal(prefs.volume,1);assert.equal(prefs.textSpeed,36);assert.equal(prefs.reducedMotion,false);
});
