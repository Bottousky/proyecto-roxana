import test from 'node:test';
import assert from 'node:assert/strict';
import {RESTORATION_SCENES,prepareCinematic,recordCinematicComplete,recordEndingDismissed,validatePendingCinematic} from '../src/game/cinematic-progress.js';
import {freshState,saveState,loadState,validateState} from '../src/game/state.js';
import {AREAS,PUZZLE_STORY,DIALOGUES} from '../src/game/content.js';

const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
function repaired(id){const state=freshState();state.area=RESTORATION_SCENES[id].area;state.flags[id]=true;state.puzzles[id]={id,version:1,completed:true,wires:[['positive','load']]};return state;}

test('each restoration scene continues the canonical story in its mechanism area',()=>{
  assert.equal(Object.keys(RESTORATION_SCENES).length,7);
  for(const [id,scene] of Object.entries(RESTORATION_SCENES)){
    assert.equal(scene.dialogue,PUZZLE_STORY[id].complete);
    assert.ok(DIALOGUES[scene.dialogue].length>0);
    assert.ok(AREAS[scene.area].objects.some(object=>object.puzzle===id));
  }
});

for(const id of Object.keys(RESTORATION_SCENES)){
  test(`${id}: reload during the camera resumes pending restoration without losing the repaired mechanism`,()=>{
    const state=repaired(id),db=storage();
    assert.equal(prepareCinematic(state,id),true);
    assert.equal(prepareCinematic(state,id),true,'preparing the same active scene is idempotent');
    saveState(state,db);
    const restored=loadState(db).state;
    assert.deepEqual(restored.activeCinematic,{id});
    assert.equal(restored.flags[id],true);
    assert.deepEqual(restored.puzzles[id],state.puzzles[id]);
    assert.equal(restored.activeDialogue,null);
    assert.ok(!restored.seen.includes(`cinematic:${id}`));
  });
}

test('completion atomically replaces the camera with a resumable conversation and is once-only',()=>{
  const state=repaired('pump'),db=storage();
  prepareCinematic(state,'pump');
  assert.equal(recordCinematicComplete(state),'pump_complete');
  assert.equal(state.activeCinematic,null);
  assert.deepEqual(state.activeDialogue,{id:'pump_complete',index:0});
  assert.equal(state.seen.filter(id=>id==='cinematic:pump').length,1);
  saveState(state,db);
  const resumed=loadState(db).state;
  assert.deepEqual(resumed.activeDialogue,{id:'pump_complete',index:0});
  resumed.activeDialogue.index=2;
  assert.equal(recordCinematicComplete(resumed),null);
  assert.deepEqual(resumed.activeDialogue,{id:'pump_complete',index:2},'a late duplicate finish cannot restart dialogue');
  assert.equal(prepareCinematic(resumed,'pump'),false);
  assert.equal(resumed.flags.pump,true);
});

test('a different pending scene cannot replace an unfinished one',()=>{
  const state=repaired('beacon_network');state.flags.beacon_lens=true;
  assert.equal(prepareCinematic(state,'beacon_network'),true);
  assert.equal(prepareCinematic(state,'beacon_lens'),false);
  assert.deepEqual(state.activeCinematic,{id:'beacon_network'});
});

test('malformed imports cannot invent scenes, bypass area/repair checks or replay completed scenes',()=>{
  const state=repaired('workshop');
  for(const pending of [undefined,null,[],true,'workshop',{}, {id:3},{id:'unknown'},{id:'__proto__'},{id:'constructor'},{id:'gate'}]){
    assert.equal(validatePendingCinematic(pending,state),null);
    assert.equal(validateState({...state,activeCinematic:pending}).activeCinematic,null);
  }
  assert.equal(validatePendingCinematic({id:'workshop'},{...state,area:'portal'}),null);
  assert.equal(validatePendingCinematic({id:'workshop'},{...state,flags:{workshop:'false'}}),null);
  assert.equal(validatePendingCinematic({id:'workshop'},{...state,flags:{}}),null);
  assert.equal(validatePendingCinematic({id:'workshop'},{...state,seen:['cinematic:workshop']}),null);
  assert.deepEqual(validatePendingCinematic({id:'workshop',dialogue:'bad',elapsed:Infinity},state),{id:'workshop'});
});

test('old saves preserve progress without inferring six retrospective camera scenes',()=>{
  const old={version:1,area:'lighthouse',flags:{awaken:true,workshop:true,pump:true,irrigation:true,beacon_network:true,beacon_lens:true,finale_seen:true},seen:['beacon_lens_complete']};
  const restored=validateState(old);
  assert.equal(restored.activeCinematic,null);
  assert.equal(restored.endingPending,false);
  assert.deepEqual(restored.flags,old.flags);
  const pendingLegacyFinal=validateState({...old,flags:{...old.flags,finale_seen:false}});
  assert.equal(pendingLegacyFinal.activeCinematic,null,'only the controller explicitly requests the legacy final fallback');
  assert.equal(pendingLegacyFinal.flags.beacon_lens,true);
});

test('the ending remains resumable through final dialogue and the final card until dismissed',()=>{
  const state=repaired('beacon_lens'),db=storage();
  prepareCinematic(state,'beacon_lens');
  assert.equal(recordCinematicComplete(state),'beacon_lens_complete');
  assert.equal(state.flags.finale_seen,true);
  assert.equal(state.endingPending,true);
  state.activeDialogue.index=3;saveState(state,db);
  let restored=loadState(db).state;
  assert.deepEqual(restored.activeDialogue,{id:'beacon_lens_complete',index:3});
  assert.equal(restored.endingPending,true);
  restored.activeDialogue=null;saveState(restored,db);
  restored=loadState(db).state;
  assert.equal(restored.activeDialogue,null);
  assert.equal(restored.endingPending,true,'after the last line, a reload still knows to show the ending card');
  recordEndingDismissed(restored);saveState(restored,db);
  assert.equal(loadState(db).state.endingPending,false);
  assert.equal(loadState(db).state.flags.beacon_lens,true);
});

test('ending requests must be booleans backed by a completed Lighthouse camera',()=>{
  const state=repaired('beacon_lens');
  assert.equal(validateState({...state,endingPending:true}).endingPending,false);
  state.flags.finale_seen=true;
  for(const value of ['true',1,[],{}])assert.equal(validateState({...state,endingPending:value}).endingPending,false);
  assert.equal(validateState({...state,endingPending:true}).endingPending,true);
});
