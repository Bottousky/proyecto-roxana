import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {World} from '../src/world.js';

function pickingWorld(interactions){
  const world=Object.create(World.prototype);
  Object.assign(world,{
    canvas:{getBoundingClientRect:()=>({left:0,top:0,width:800,height:600})},
    camera:new THREE.OrthographicCamera(-4,4,3,-3,.1,30),
    root:new THREE.Group(),raycaster:new THREE.Raycaster(),area:{exits:[]},
    getInteractions:()=>interactions,
  });
  world.camera.position.set(0,0,10);world.camera.lookAt(0,0,0);world.camera.updateMatrixWorld(true);
  return world;
}

test('a character can be selected through its visible pixels, but transparent atlas padding remains walkable',()=>{
  const npc={id:'ivara'},world=pickingWorld([npc]),group=new THREE.Group();
  group.userData.interaction=npc;world.root.add(group);
  // The same canvas-backed texture path as the authored, normalized actor atlases.
  const image={width:8,height:8,getContext:()=>({getImageData:(x,y)=>({data:[255,255,255,x>=3&&x<=4&&y>=1&&y<=6?255:0]})})};
  const map=new THREE.CanvasTexture(image),material=new THREE.SpriteMaterial({map,transparent:true,alphaTest:.2,depthWrite:true});
  const sprite=new THREE.Sprite(material);sprite.scale.set(4,4,1);group.add(sprite);
  try{
    assert.equal(world.pickInteraction(400,300),npc,'opaque body must remain selectable');
    assert.equal(world.pickInteraction(250,300),null,'transparent left edge must not open dialogue');
    assert.equal(world.pickInteraction(400,110),null,'transparent space above the head must not open dialogue');
  }finally{material.dispose();map.dispose();}
});

test('decorative light cannot inherit a panel hitbox while its solid body and glass remain selectable',()=>{
  const panel={id:'panel'},world=pickingWorld([panel]),group=new THREE.Group();
  group.userData.interaction=panel;world.root.add(group);
  const solidMaterial=new THREE.MeshBasicMaterial(),glassMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:.75});
  const geometry=new THREE.BoxGeometry(1,1,.5),solid=new THREE.Mesh(geometry,solidMaterial),glass=new THREE.Mesh(geometry,glassMaterial);
  solid.position.set(-1,-1,0);glass.position.set(1,-1,0);group.add(solid,glass);
  const glowMaterial=new THREE.SpriteMaterial({transparent:true,opacity:.6,depthWrite:false});
  const glow=new THREE.Sprite(glowMaterial);glow.scale.set(6,6,1);glow.position.z=1;group.add(glow);
  try{
    assert.equal(world.pickInteraction(400,150),null,'the halo alone must not open a panel');
    assert.equal(world.pickInteraction(300,400),panel,'solid control body remains selectable');
    assert.equal(world.pickInteraction(500,400),panel,'physical glass remains selectable');
  }finally{geometry.dispose();solidMaterial.dispose();glassMaterial.dispose();glowMaterial.dispose();}
});
