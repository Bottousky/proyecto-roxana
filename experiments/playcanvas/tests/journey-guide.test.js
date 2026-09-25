import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState} from '../src/game/state.js';
import {journeyGuidance,renderJourneyGuide,bindMapViews} from '../src/game/journey-guide.js';
import {renderWorldMap} from '../src/game/world-map.js';

test('guidance follows story progress without exposing later installations',()=>{
  const state=freshState();
  assert.equal(journeyGuidance(state).area,'portal');
  assert.match(renderJourneyGuide(state),/Una pequeña luz/);
  assert.doesNotMatch(renderJourneyGuide(state),/manivelas|obturador|Nereo/);
  state.flags.awaken=true;
  assert.equal(journeyGuidance(state).area,'workshop');
  assert.match(renderJourneyGuide(state),/Mirar con Ohm/);
});

test('guidance points to the next access instead of skipping intermediate places',()=>{
  const state=freshState();state.flags.awaken=true;
  assert.match(journeyGuidance(state).direction,/acceso a .*Pueblo|acceso a .*Plaza/i);
  state.area='workshop';
  assert.match(journeyGuidance(state).direction,/esta zona/);
});

test('after the epilogue the guide encourages exploration without a stale target',()=>{
  const state=freshState();state.area='lighthouse';
  state.flags={awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true,beacon_supply:true,beacon_network:true,beacon_lens:true,epilogue_shared:true};
  assert.match(journeyGuidance(state).direction,/explorar a tu ritmo/);
});

test('map opens local view, separates kingdom view, and contains only visited travel buttons',()=>{
  const state=freshState();state.visited=['portal'];const html=renderWorldMap(state);
  assert.match(html,/id="map-panel-kingdom"[^>]*hidden/);
  assert.match(html,/id="map-tab-local"[^>]*aria-selected="true"/);
  assert.match(html,/data-area="portal" disabled aria-current="location"/);
  assert.doesNotMatch(html,/data-area="lighthouse"/);
  assert.match(html,/data-map-guide/);
  assert.match(html,/data-map-objective="ohm_pedestal"/);
});

test('map tabs support keyboard navigation, one selected panel and one tab stop',()=>{
  const panels={local:{hidden:false},kingdom:{hidden:true}};
  const buttons=Object.keys(panels).map(id=>({id,attrs:{'aria-controls':id},tabIndex:id==='local'?0:-1,setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},focus(){this.focused=true;}}));
  bindMapViews({querySelectorAll:()=>buttons,querySelector:selector=>panels[selector.slice(1)]});
  buttons[0].onkeydown({key:'ArrowRight',preventDefault(){}});
  assert.equal(panels.local.hidden,true);assert.equal(panels.kingdom.hidden,false);
  assert.deepEqual(buttons.map(b=>b.tabIndex),[-1,0]);assert.equal(buttons[1].focused,true);
  buttons[1].onkeydown({key:'Home',preventDefault(){}});
  assert.equal(panels.local.hidden,false);assert.equal(panels.kingdom.hidden,true);
});
