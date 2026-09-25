import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCollisionWorld} from './helpers/world-fixture.js';
test('the lighthouse isolation bridge connects to stage II, not the nearer supply panel',()=>{
  const world=buildCollisionWorld('lighthouse');try{
    assert.equal(world.conductors.find(c=>c.obj.id==='tower_isolated').targetId,'beacon_network_panel');
    assert.equal(world.conductors.find(c=>c.obj.id==='tower_feed').targetId,'beacon_supply_panel');
    assert.equal(world.conductors.find(c=>c.obj.id==='tower_return').targetId,'beacon_supply_panel');
  }finally{world.dispose();}
});
test('lake conductors end on the actual paired shore feeder instead of an invented nearest puzzle',()=>{
  const world=buildCollisionWorld('lake');try{assert.equal(world.conductors.length,2);for(const cable of world.conductors)assert.equal(cable.targetId,'shore-feeder');}finally{world.dispose();}
});
