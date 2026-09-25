import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS,resolveDialogue} from '../src/content.js';
import {updateInhabitants} from '../src/world-inhabitants.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';
import {expectedPresent} from './helpers/expected-inhabitants.js';
import {isSegmentClear} from '../src/collision.js';
import {renderWorldMap} from '../src/world-map.js';

const restored={awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true,beacon_supply:true,beacon_network:true,beacon_lens:true};
for(const [stage,flags] of Object.entries({arrival:{},restored,epilogue:{...restored,epilogue_shared:true}})){
  test(`${stage}: every expected resident is visible, responsive and follows solid-safe errands`,()=>{
    for(const area of Object.values(AREAS)){
      const world=buildCollisionWorld(area.id,{flags});
      try{
        const expected=area.objects.filter(o=>o.kind==='npc'&&expectedPresent(o,world.state.flags)).map(o=>o.id).sort();
        const registered=world.getInteractions().filter(o=>o.kind==='npc'&&o.id!=='ohm_companion').map(o=>o.id).sort();
        assert.deepEqual(registered,expected,`${area.id}: incorrect presence`);
        const origins=new Map(world.actors.filter(a=>a.inhabitant&&a.g.visible).map(a=>[a,a.g.position.clone()]));
        const moved=new Set();
        for(let tick=0;tick<500;tick++){
          const before=new Map([...origins.keys()].map(a=>[a,a.g.position.clone()]));
          updateInhabitants(world,.1,world.state);
          for(const actor of origins.keys()){
            const p=actor.g.position,old=before.get(actor),id=actor.inhabitant.id;
            assert.ok(world.canStand(p.x,p.z),`${area.id}/${id}: inside a solid`);
            assert.ok(p.distanceTo(old)<=.12001,`${area.id}/${id}: teleport`);
            assert.ok(isSegmentClear([old.x,old.z],[p.x,p.z],world.bounds,world.obstacles,{radius:.34,isWalkable:(x,z)=>world.walkableLand(x,z)}),`${area.id}/${id}: crossed a solid`);
            if(p.distanceTo(origins.get(actor))>.25)moved.add(actor);
            const object=world.getInteractions().find(o=>o.id===id);
            assert.equal(object.x,p.x);assert.equal(object.z,p.z);
            assert.ok(resolveDialogue(object.dialogue,world.state)?.length,`${area.id}/${id}: no dialogue`);
          }
        }
        for(const actor of origins.keys())assert.ok(moved.has(actor),`${area.id}/${actor.inhabitant.id}: errand never moved`);
      }finally{world.dispose();}
    }
  });
}

test('conversations pause inhabitants in neutral, face the player and resume without jumps',()=>{
  const world=buildCollisionWorld('plaza',{flags:{awaken:true}});
  try{
    const edda=world.actors.find(a=>a.inhabitant?.id==='edda_plaza');
    world.setPlayerPosition([edda.g.position.x+1,edda.g.position.z]);
    world.beginInhabitantConversation('edda_plaza');
    assert.equal(edda.animation.direction,1);
    const before=edda.g.position.clone();
    for(let i=0;i<160;i++)updateInhabitants(world,.05,world.state,{paused:true});
    assert.ok(edda.g.position.equals(before));assert.equal(edda.animation.frame,0);
    world.endInhabitantConversation();updateInhabitants(world,.05,world.state);
    assert.ok(edda.g.position.distanceTo(before)<=.06001);
  }finally{world.dispose();}
});

test('Edda leaves through a real exit; reduced motion also respects her absence',()=>{
  for(const reducedMotion of [false,true]){
    const world=buildCollisionWorld('plaza',{flags:{awaken:true}});
    try{
      const edda=world.actors.find(a=>a.inhabitant?.id==='edda_plaza');
      world.state.flags.workshop=true;
      for(let i=0;i<600&&edda.g.visible;i++)updateInhabitants(world,.05,world.state,{reducedMotion});
      assert.equal(edda.g.visible,false);
      assert.equal(world.getInteractions().some(o=>o.id==='edda_plaza'),false);
      const markup=renderWorldMap(world.state,{inhabitants:world.getInteractions().filter(o=>o.kind==='npc')});
      assert.equal(markup.includes('data-map-object="edda_plaza"'),false);
    }finally{world.dispose();}
  }
});
