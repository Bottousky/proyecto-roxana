import test from 'node:test';
import assert from 'node:assert/strict';
import {WebGLObjects} from 'three/src/renderers/webgl/WebGLObjects.js';
import {AREAS} from '../src/content.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';

test('revisiting an outdoor area releases its instance buffers while shared geometry survives',()=>{
  const world=buildCollisionWorld('plaza'),allocated=new Set(),sharedDisposed=new Set();
  const info={render:{frame:0}};
  // Exercise Three's actual InstancedMesh disposal listener without requiring a GPU.
  const objects=WebGLObjects({ARRAY_BUFFER:34962},{get:(_,geometry)=>geometry,update(){}},{
    update(attribute){allocated.add(attribute);},
    remove(attribute){allocated.delete(attribute);},
  },info);
  for(const geometry of world.sharedGeometries)geometry.addEventListener('dispose',()=>sharedDisposed.add(geometry));
  try{
    for(let visit=0;visit<3;visit++){
      if(visit)world.loadArea(AREAS.plaza,world.state);
      info.render.frame++;
      world.root.traverse(object=>{if(object.isInstancedMesh)objects.update(object);});
      assert.ok(allocated.size>20,'real Plaza vegetation must allocate instance attributes');
      world.loadArea(AREAS.workshop,world.state);
      assert.equal(allocated.size,0,`visit ${visit+1}: abandoned instance buffers remain allocated`);
      assert.equal(sharedDisposed.size,0,'area changes must retain shared mesh geometry');
    }
  }finally{world.dispose();objects.dispose();}
  assert.equal(sharedDisposed.size,world.sharedGeometries.size,'final disposal releases shared geometry');
});
