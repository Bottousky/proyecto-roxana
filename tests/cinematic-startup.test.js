import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {freshState,loadState,saveState} from '../src/state.js';
import {CHARACTERS,DIALOGUES,PUZZLE_STORY,resolveDialogue,resolveDialogueId} from '../src/content.js';

// Execute the real controller functions with delayed browser services. This
// exercises startup/save ordering without requiring a WebGL or audio device.
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
function controllerBlock(begin,end){
  const from=main.indexOf(begin),to=main.indexOf(end,from);
  if(from<0||to<0)throw new Error(`Missing controller block: ${begin}`);
  return main.slice(from,to);
}
const controller=[
  controllerBlock('function persist(){','\nfunction refreshWorldSystems'),
  controllerBlock('async function startGame(','\nfunction wait('),
  controllerBlock('function linesFor(','\nconst portraits='),
  controllerBlock('function renderLine(){','\nfunction bubble('),
].join('\n');

function deferred(){let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};}
function finalConversation(){
  const state=freshState();
  state.area='lighthouse';state.position=[2,3];state.visited.push('lighthouse');
  state.flags.beacon_lens=true;state.flags.finale_seen=true;
  state.journeyTime.phase=4;
  state.seen.push('cinematic:beacon_lens','beacon_lens_complete');
  state.activeDialogue={id:'beacon_lens_complete',index:3};state.endingPending=true;
  return state;
}
function startupHarness(imported){
  const data=new Map(),nodes=new Map(),audio=deferred(),art=deferred();
  const db={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  saveState(imported,db);
  let position=[-9,-8],endingCalls=0,lessonCalls=0;
  const context={
    state:freshState(),settings:{...freshState().settings},started:true,startingGame:false,
    mode:'world',held:new Set(['ArrowRight']),assetLoadFailed:false,
    playingCinematic:false,pendingPuzzleResult:null,dialogue:null,dialogueEnd:null,
    dialogueQueue:[],typing:0,typed:0,portraits:{},CHARACTERS,DIALOGUES,PUZZLE_STORY,resolveDialogue,resolveDialogueId,
    audio:{unlock:()=>audio.promise},
    world:{assetsReady:art.promise,cancelCinematic(){},getPlayerPosition:()=>[...position]},
    loadState:()=>loadState(db),saveState:value=>saveState(value,db),freshState,
    storeSettings(){},initWorld(){},refreshWorldSystems(){},show(){},sound(){},toast(){},
    console,
    $:selector=>{
      if(!nodes.has(selector))nodes.set(selector,{textContent:'',innerHTML:'',className:'',style:{setProperty(){}},focus(){}});
      return nodes.get(selector);
    },
    enterArea:async (area,spawn)=>{position=[...spawn];},
    showEnding:()=>{endingCalls++;context.mode='modal';},
    startLesson:()=>{lessonCalls++;},
  };
  vm.createContext(context);vm.runInContext(controller,context,{filename:'main-controller-startup.js'});
  return {context,db,audio,art,get endingCalls(){return endingCalls;},get lessonCalls(){return lessonCalls;}};
}

test('importing during a running journey preserves the final conversation through deferred audio and art loading',async()=>{
  const imported=finalConversation(),h=startupHarness(imported),{context}=h;
  const starting=context.startGame(true);

  // Blur, visibility changes and autosave all call this same controller path.
  context.persist();context.persist();
  assert.deepEqual(loadState(h.db).state,imported,'the old journey cannot overwrite the imported save while audio resumes');
  assert.equal(context.held.size,0,'keys held in the previous journey are released');

  h.audio.resolve(true);await Promise.resolve();
  context.persist();
  assert.deepEqual(loadState(h.db).state.position,imported.position,'loading art cannot save the old renderer position into the new journey');
  h.art.resolve({ok:true});await starting;

  const restored=loadState(h.db).state;
  assert.equal(restored.area,'lighthouse');
  assert.deepEqual(restored.position,imported.position);
  assert.deepEqual(restored.activeDialogue,imported.activeDialogue);
  assert.equal(restored.endingPending,true);
  assert.equal(context.mode,'dialogue');
  assert.equal(context.dialogue.index,3);

  while(context.dialogue){context.typed=Infinity;context.nextLine();}
  // The arc now closes after the first lesson: the Faro conversation leads into it.
  assert.equal(h.lessonCalls,1,'the restored final conversation continues into the first lesson');
  assert.equal(h.endingCalls,0,'the arc card waits for the lesson');
  assert.equal(loadState(h.db).state.activeDialogue,null);
  assert.equal(loadState(h.db).state.endingPending,true,'the card is still recoverable until the player dismisses it');
});

test('resume uses the selected save even if another writer changes storage while audio resumes',async()=>{
  const imported=finalConversation(),h=startupHarness(imported);
  const starting=h.context.startGame(true);
  const other=freshState();other.area='plaza';other.position=[5,6];
  saveState(other,h.db);
  h.audio.resolve(true);h.art.resolve({ok:true});await starting;
  const restored=loadState(h.db).state;
  assert.equal(restored.area,'lighthouse');
  assert.deepEqual(restored.activeDialogue,imported.activeDialogue);
  assert.equal(restored.endingPending,true);
});
