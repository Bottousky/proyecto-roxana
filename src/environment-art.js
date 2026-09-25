import * as THREE from 'three';

// Small maintained gardens, spring ferns and coastal mint. No scatter in walking lanes.
const GARDENS={
  portal:[[-7,4,1,1.7],[7,-3,2,1.4],[-8,-6,1,1.8]],
  plaza:[[-8.4,7.2,2,1.4],[-16.5,8,1,1.5],[6.4,5.4,2,1.3],[11,-7.1,2,1.4]],
  road:[[8.2,-5.8,1,1.6],[-8.1,-7,2,1.4],[7.7,10,2,1.4]],
  spring:[[-7.7,6,0,1.8],[-7.4,-1,1,2],[-6.9,-6.5,1,1.7],[10.5,-3.8,2,1.4],[14,3,1,1.8]],
  castle:[[-7,7,2,1.3],[7,7,2,1.3],[-11,-8,1,1.7]],
  terraces:[[-9,8,2,1.8],[9,7,1,1.5],[-9,-10,2,1.5]],
  lake:[[5,9,0,1.7],[5.2,-3,0,1.5],[-7,7,2,1.8]],
  lighthouse:[[-8,11,2,1.5],[8,7,2,1.2],[-8,-8,2,1.5]],
};
export function buildGardenArt(world,clear){
  if(!world.bankTextures)return;
  for(const [x,z,type,size] of GARDENS[world.area.id]||[]){
    if(!world.onLand(x,z)||!clear(x,z,.45))continue;
    const material=world.mat('#e0e4c8',null,{map:world.bankTextures[type],alphaTest:.4,side:THREE.DoubleSide});
    const plant=world.mesh('plane',material,x,.06+size*.40,z,size,size,1);
    plant.name='authored-illustrated-garden';plant.castShadow=false;plant.receiveShadow=true;
  }
}
