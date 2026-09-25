import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS} from '../src/content.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';
import {approachInteraction,inInteractionReach} from '../src/world-interaction.js';
import {isSegmentClear} from '../src/collision.js';

test('click approaches reach every available person, control, panel and exit in every area',()=>{
  for(const area of Object.values(AREAS))for(const restored of [false,true]){
    const flags=restored?{awaken:true,workshop:true,gate:true,pump:true,distribution:true,irrigation:true,beacon_link:true,beacon_supply:true,beacon_network:true,beacon_lens:true,epilogue_shared:true}:{};
    const world=buildCollisionWorld(area.id,{flags});
    try{
      for(const object of world.getInteractions()){
        if(!restored&&object.id==='road_to_spring')continue;
        world.setPlayerPosition(area.spawn);
        const route=approachInteraction(world,object);
        assert.notEqual(route,null,`${area.id}/${object.id}: no approach`);
        let previous=world.getPlayerPosition();
        for(const point of route){
          assert.ok(isSegmentClear(previous,point,world.bounds,world.obstacles,{radius:.34,isWalkable:(x,z)=>world.walkableLand(x,z)}),`${object.id}: route crossed a solid`);
          previous=point;
        }
        assert.ok(inInteractionReach(world,object,previous),`${object.id}: stopped out of reach`);
      }
    }finally{world.dispose();}
  }
});

test('nearby interaction cannot reach through a foreign wall',()=>{
  const world=buildCollisionWorld('portal');
  try{
    const object={id:'test',kind:'panel',x:0,z:3};
    world.setPlayerPosition([0,5]);world.obstacles.push({x:0,z:4,w:2,d:.2});
    assert.equal(world.canInteractWith(object),false);
    const person={...object,inhabitant:true};assert.equal(world.canInteractWith(person),false);
  }finally{world.dispose();}
});
