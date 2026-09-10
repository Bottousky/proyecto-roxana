import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,validateState} from '../src/game/state.js';
import {renderJournal,journalPages,recordFieldObservation,renderCircuitSketch} from '../src/game/journal.js';
import {PUZZLES,initialPuzzleSnapshot} from '../src/game/puzzle-model.js';
import {getBenchEvidence} from '../src/game/bench-evidence.js';

test('journal explains only experienced chapters and draws the saved wiring, never a supplied solution',()=>{
  const state=freshState();state.visited=['portal'];
  assert.deepEqual(journalPages(state).map(page=>page.id),['arrival']);
  state.puzzles.workshop=initialPuzzleSnapshot('workshop');
  const html=renderJournal(state,{selected:'experiment:workshop',puzzles:PUZZLES,evidenceFor:getBenchEvidence});
  assert.match(html,/UNA PRUEBA ABIERTA/);
  assert.doesNotMatch(html,/La idea que pudimos explicar/);
  assert.match(html,/Todavía no registré una lectura/);
  assert.doesNotMatch(renderCircuitSketch(PUZZLES.workshop,state.puzzles.workshop),/M310 160 L545 160\"\/>.*<\/g><g class="sketch-pieces">/);
  const before=renderCircuitSketch(PUZZLES.awaken,initialPuzzleSnapshot('awaken'));
  const after=renderCircuitSketch(PUZZLES.awaken,{...initialPuzzleSnapshot('awaken'),wires:[['heartOut','negative']]});
  assert.match(before,/M85 125 L540 210/);
  assert.doesNotMatch(before,/M790 210 L85 375/);
  assert.match(after,/M790 210 L85 375/);
});

test('real field readings are bounded, deduplicated, persisted, and distinguish floating from zero',()=>{
  const state=freshState();state.area='spring';
  const obj={id:'coupling',label:'Acople del generador'},r={title:'Prueba',notice:'La rueda gira. El eje sigue separado.',reference:'Entre el generador y el retorno',voltage:null,current:0};
  assert.equal(recordFieldObservation(state,obj,r),true);
  assert.equal(recordFieldObservation(state,obj,r),false);
  assert.match(state.fieldNotes[0].reading,/sin referencia V · 0 A/);
  for(let i=0;i<100;i++)recordFieldObservation(state,obj,{...r,voltage:i});
  assert.equal(state.fieldNotes.length,90);
  const loaded=validateState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(loaded.fieldNotes,state.fieldNotes);
  const html=renderJournal(loaded,{selected:'field:spring',puzzles:PUZZLES,evidenceFor:getBenchEvidence});
  assert.match(html,/99 V · 0 A/);assert.match(html,/Entre el generador y el retorno/);
});

test('personal hypotheses survive load, remain optional, and untrusted imported text is escaped',()=>{
  const state=freshState();state.personalNotes.arrival='Creo que <el cobre> quedó suelto.';
  const loaded=validateState(JSON.parse(JSON.stringify(state)));
  assert.equal(loaded.personalNotes.arrival,state.personalNotes.arrival);
  assert.match(renderJournal(loaded),/Creo que &lt;el cobre&gt; quedó suelto/);
  state.fieldNotes=[{area:'road',object:'post',title:'<img src=x onerror=alert(1)>',text:'<script>bad</script>',reference:'A → B',reading:'0 V'}];
  const html=renderJournal(state,{selected:'field:road'});
  assert.doesNotMatch(html,/<img src=x|<script>bad/);
  assert.match(html,/&lt;script&gt;bad/);
  const broken=validateState({...state,fieldNotes:[null,{area:'absent',object:'x'}],personalNotes:{a:'x'.repeat(5000),b:34}});
  assert.deepEqual(broken.fieldNotes,[]);assert.equal(broken.personalNotes.a.length,1200);assert.equal(broken.personalNotes.b,undefined);
});

test('old completed saves never invent trials or wiring, and the lake note belongs to the lake',()=>{
  const state=freshState();state.flags={awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true};
  assert.equal(journalPages(state).find(page=>page.id==='return_at_scale').area,'lake');
  const html=renderJournal(state,{selected:'diagnosis',puzzles:PUZZLES,evidenceFor:getBenchEvidence});
  assert.match(html,/La idea que pudimos explicar/);assert.match(html,/Todavía no registré/);
  assert.doesNotMatch(html,/Croquis de las conexiones/);
});
