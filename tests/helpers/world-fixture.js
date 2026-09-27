import * as THREE from 'three';
import {World} from '../../src/world.js';
import {AREAS} from '../../src/content.js';
import {HUMAN_ACTORS} from '../../src/actor-animation.js';
import {freshState} from '../../src/state.js';

/** Build the actual area and props; only GPU rendering and image pixels are absent. */
export function buildCollisionWorld(id,{flags={},spawn,state:savedState,continuous=false}={}){
  const world=Object.create(World.prototype),state=savedState||freshState();
  if(!savedState){state.area=id;state.flags={...AREAS[id].initialFlags,...flags};}
  const art=new THREE.Texture();
  const textures=Object.fromEntries(['stone','wood','roof','ground','cobble','glow','foliage','fern'].map(key=>[key,new THREE.Texture()]));
  const geo={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,12,8),ico:new THREE.IcosahedronGeometry(1,1),cylinder:new THREE.CylinderGeometry(1,1,1,16),cone:new THREE.ConeGeometry(1,1,12),plane:new THREE.PlaneGeometry(1,1),torus:new THREE.TorusGeometry(1,.1,8,40)};
  Object.assign(world,{
    state,clock:0,inspect:false,area:null,scene:new THREE.Scene(),
    camera:new THREE.OrthographicCamera(-20,20,15,-15,.1,150),
    focus:new THREE.Vector3(),cameraOffset:new THREE.Vector3(0,13.5,25),
    sharedGeometries:new Set(Object.values(geo)),sharedMaterials:new Set(),geo,textures,
    treeTextures:Array(6).fill(art),ohmFrames:Array.from({length:4},()=>Array(6).fill(art)),
    atlasFrames:Object.fromEntries(HUMAN_ACTORS.map(name=>[name,Array.from({length:4},()=>Array(5).fill(art))])),
    lastAssetResult:{ok:true,missing:[]},renderer:{shadowMap:{},dispose(){}},composer:{dispose(){}},
    resize(){},update(){},
  });
  const buildings=[];
  world.building=function(...args){
    const group=World.prototype.building.apply(this,args);
    buildings.push({x:args[0],z:args[1],width:args[2]??6,depth:args[3]??5,group});
    return group;
  };
  world.loadArea(AREAS[id],state,spawn??savedState?.position,{continuous});
  world.root.updateMatrixWorld(true);
  // Backdrop houses beyond the playable ground are scenery, not audited buildings.
  world.auditBuildings=buildings.filter(b=>b.group.userData.architecture);
  return world;
}
