import * as THREE from 'three';
import {World} from './world.js';
import {AREAS} from './content.js';
import {KINGDOM,isExterior,passagesFor,passageGeometry,toKingdom,fromKingdom,geographicDelta} from './kingdom-geography.js';
import {buildKingdomLandscape} from './kingdom-landscape.js';
import {updateDaylight,updateWaterLight} from './world-time.js';
import {journeyPhase} from './story-time.js';
import {worldFeedbackSignature} from './world-feedback.js';

/** The finite first act stays resident; only neighbouring regions are rendered.
 * Region builders keep their local coordinates. Promotion rebases camera and actors by
 * the exact same displacement as the landscape, so it never moves the visible world.
 */
export class ContinuousWorld {
  constructor(canvas){
    this.engine=new World(canvas);this.active=this.engine;this.regions=new Map();this.landscape=null;this.preloadTimer=null;this.generation=0;this.journeyPrepared=false;this.preparingJourney=false;
    this.engine.renderer.localClippingEnabled=true;
    this.engine.renderer.info.autoReset=false;
    return new Proxy(this,{get:(manager,key)=>{if(key in manager){const value=manager[key];return typeof value==='function'?value.bind(manager):value;}const value=manager.active[key];return typeof value==='function'?value.bind(manager.active):value;},set:(manager,key,value)=>{if(key in manager)manager[key]=value;else manager.active[key]=value;return true;}});
  }
  createRegion(id,state){
    const region=Object.assign(Object.create(World.prototype),this.engine,{root:null,sharedMaterials:new Set(),localGeometries:[],scene:new THREE.Scene(),focus:new THREE.Vector3(),cameraOffset:new THREE.Vector3(0,13.5,25),daylight:null});
    region.loadArea(AREAS[id],state,AREAS[id].spawn,{deferRender:true,continuous:true});
    this.engine.scene.background??=region.scene.background.clone();this.engine.scene.fog??=region.scene.fog.clone();region.scene=this.engine.scene;
    region.clipPlanes=[new THREE.Plane(new THREE.Vector3(0,0,1),AREAS[id].bounds[1]/2),new THREE.Plane(new THREE.Vector3(0,0,-1),AREAS[id].bounds[1]/2)];
    if(isExterior(id))region.root.traverse(mesh=>{
      if(!mesh.isMesh||(!mesh.userData.terrain&&mesh.name!=='road-canal-bank'&&mesh.name!=='road-continuous-canal'))return;
      const clip=material=>{
        if(material.isShaderMaterial){
          material.uniforms.clipMinZ={value:-1e6};material.uniforms.clipMaxZ={value:1e6};
          material.fragmentShader=material.fragmentShader.replace('void main(){','uniform float clipMinZ;uniform float clipMaxZ;void main(){if(vPos.z<clipMinZ||vPos.z>clipMaxZ)discard;');
          return material;
        }
        if(id==='lighthouse'&&mesh.userData.terrain)return material;
        const clone=material.clone();clone.onBeforeCompile=material.onBeforeCompile;clone.customProgramCacheKey=material.customProgramCacheKey;clone.clippingPlanes=id==='portal'&&mesh.userData.terrain?[region.clipPlanes[0]]:region.clipPlanes;clone.clipShadows=true;region.sharedMaterials.add(clone);return clone;
      };
      mesh.material=Array.isArray(mesh.material)?mesh.material.map(clip):clip(mesh.material);
    });
    this.regions.set(id,region);this.engine.scene.add(region.root);return region;
  }
  ensureLandscape(){
    if(this.landscape)return;
    const owner=Object.assign(Object.create(World.prototype),this.engine,{root:new THREE.Group(),sharedMaterials:new Set(),localGeometries:[],waterMaterials:[]});
    owner.root.name='Ohmdal-shared-landscape';owner.details=buildKingdomLandscape(owner);this.landscape=owner;this.engine.scene.add(owner.root);
  }
  loadArea(area,state,spawn,{continuous=false}={}){
    const old=this.active,was=old.area?.id;
    const preserve=continuous&&passageGeometry(was,area.id);
    const pose=preserve?old.cameraPose():null,position=preserve?toKingdom(was,old.getPlayerPosition()):null;
    const companion=preserve?toKingdom(was,[old.ohm.position.x,old.ohm.position.z]):null;
    const oldAnimation=preserve?old.actors.find(a=>a.g===old.player)?.animation:null;
    this.active=this.regions.get(area.id)||this.createRegion(area.id,state);
    const active=this.active;active.state=state;active.clock=old.clock;active.updateFlags(state);
    active.setPlayerPosition(position?fromKingdom(area.id,position):spawn||area.spawn);
    if(preserve){
      const delta=geographicDelta(was,area.id);
      active.focus.set(pose.focus[0]-delta[0],pose.focus[1],pose.focus[2]-delta[1]);active.cameraOffset.fromArray(pose.offset);active.currentZoom=pose.zoom;
      const cp=fromKingdom(area.id,companion);active.ohm.position.set(cp[0],old.ohm.position.y,cp[1]);active.ohm.userData.direction=old.ohm.userData.direction;
      const actor=active.actors.find(a=>a.g===active.player);if(actor&&oldAnimation){actor.animation={...oldAnimation};active.animateActor(actor,0,0,0);}
      if(old.travelIntent===area.id){active.setTarget(area.spawn);old.travelIntent=null;}
    }else active.cancelCinematic();
    if(isExterior(area.id))this.ensureLandscape();
    this.arrangeRegions();if(preserve)active._quality=old._quality;else active.resize();
    if(!preserve){if(area.id==='workshop'){this.engine.scene.background.set(active.palette.sky);this.engine.scene.fog.color.set(active.palette.fog);}updateDaylight(active,state,1,true);}
    else {active.sun.intensity=old.sun.intensity;active.sun.color.copy(old.sun.color);active.hemi.intensity=old.hemi.intensity;active.daylight={...old.daylight};}
    this.scheduleNeighbours();
  }
  arrangeRegions(){
    const active=this.active,id=active.area.id;
    for(const [other,region] of this.regions){
      const exterior=isExterior(id)&&isExterior(other),[dx,dz]=exterior?geographicDelta(id,other):[0,0];
      region.root.position.set(dx,0,dz);
      region.root.visible=other===id||exterior&&passagesFor(id).some(e=>e.target===other);
      region.sun.visible=region.hemi.visible=other===id;
      region.player.visible=other===id;region.ohm.visible=other===id&&!!region.state.flags.awaken;
      if(region.clipPlanes){region.clipPlanes[0].constant=AREAS[other].bounds[1]/2-dz;region.clipPlanes[1].constant=AREAS[other].bounds[1]/2+dz;}
      for(const material of region.waterMaterials)if(material.uniforms?.clipMinZ){material.uniforms.clipMinZ.value=dz-AREAS[other].bounds[1]/2;material.uniforms.clipMaxZ.value=dz+AREAS[other].bounds[1]/2;}
    }
    if(this.landscape){this.landscape.root.visible=isExterior(id);this.landscape.root.position.set(-KINGDOM[id].x,0,-KINGDOM[id].z);}
    this.engine.worldTextureOffset?.set(KINGDOM[id].x,0,KINGDOM[id].z);
    for(const region of [...this.regions.values(),...(this.landscape?[this.landscape]:[])])for(const water of region.waterMaterials||[])water.uniforms?.worldOffset?.value.set(KINGDOM[id].x,KINGDOM[id].z);
    this.engine.renderer.shadowMap.needsUpdate=true;
  }
  scheduleNeighbours(){
    clearTimeout(this.preloadTimer);const generation=++this.generation;
    if(this.journeyPrepared||this.preparingJourney)return;
    const ids=this.active.area.id==='workshop'?['plaza']:passagesFor(this.active.area.id).map(e=>e.target);
    // Cache revisits even in diagnostic callers that have not prepared the full act.
    const prepare=()=>{
      if(generation!==this.generation)return;
      const id=ids.find(id=>!this.regions.has(id));if(!id)return;
      this.createRegion(id,this.active.state);this.arrangeRegions();
      this.preloadTimer=setTimeout(prepare,80);
    };
    this.preloadTimer=setTimeout(prepare,80);
  }
  warmNeighbours(){
    const ids=this.active.area.id==='workshop'?['plaza']:passagesFor(this.active.area.id).map(e=>e.target);
    for(const id of ids)if(!this.regions.has(id))this.createRegion(id,this.active.state);
    this.arrangeRegions();
  }
  async prepareJourney(onProgress=()=>{}){
    if(this.journeyPrepared)return;
    if(this.preparation)return this.preparation;
    this.preparingJourney=true;clearTimeout(this.preloadTimer);++this.generation;
    this.preparation=this.prepareResidentJourney(onProgress);
    try{await this.preparation;this.journeyPrepared=true;}finally{this.preparingJourney=false;this.preparation=null;}
  }
  async prepareResidentJourney(onProgress=()=>{}){
    const active=this.active,renderer=this.engine.renderer,camera=this.engine.camera,savedCamera=camera.clone();
    const yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0));
    const target=new THREE.WebGLRenderTarget(64,64),previousTarget=renderer.getRenderTarget();
    let completed=0;const total=Object.keys(AREAS).length*2;
    try{
      // Construction and GPU first use belong to the initial loading curtain,
      // never to the frame in which the player crosses a geographical boundary.
      for(const id of Object.keys(AREAS)){
        if(!this.regions.has(id))this.createRegion(id,active.state);
        onProgress(++completed,total);
        await yieldFrame();
      }
      this.ensureLandscape();
      for(const region of this.regions.values()){
        this.active=region;this.arrangeRegions();region.cancelCinematic();
        const culled=[];this.engine.scene.traverseVisible(object=>{if(object.isMesh||object.isPoints||object.isSprite){culled.push([object,object.frustumCulled]);object.frustumCulled=false;}});
        try{
          await renderer.compileAsync(this.engine.scene,camera);
          renderer.setRenderTarget(target);renderer.render(this.engine.scene,camera);
        }finally{for(const [object,value] of culled)object.frustumCulled=value;renderer.setRenderTarget(previousTarget);}
        onProgress(++completed,total);
        await yieldFrame();
      }
    }finally{
      this.active=active;this.arrangeRegions();camera.copy(savedCamera);camera.updateMatrixWorld();
      renderer.setRenderTarget(previousTarget);target.dispose();
    }
  }
  update(dt,state,input){
    if(!this.active.area||this.preparingJourney)return;
    this.active.update(dt,state,{...input,suppressRender:true});
    for(const region of this.regions.values())if(region!==this.active&&region.root.visible){
      const signature=worldFeedbackSignature(region.area,state);
      if(signature!==region._lastFlags){region._lastFlags=signature;region.state=state;region.updateFlags(state);region.ohm.visible=false;}
      // Neighbouring installations and lamps share the same hour and repaired state.
      region.daylight={...this.active.daylight};updateDaylight(region,state,dt);
      for(const water of region.waterMaterials)if(water.uniforms?.time)water.uniforms.time.value=this.active.clock;
      region.player.visible=false;region.ohm.visible=false;
    }
    if(this.landscape){for(const water of this.landscape.waterMaterials)water.uniforms.time.value=this.active.clock;updateWaterLight(this.landscape.waterMaterials,journeyPhase(state),this.active.daylight.lamps);}
    this.engine.renderer.info.reset();this.engine.composer.render();
  }
  getTravelEvent(){
    const active=this.active,id=active.area?.id;if(!isExterior(id)||!active.walking)return null;
    const position=toKingdom(id,active.getPlayerPosition());
    for(const exit of passagesFor(id)){
      const p=passageGeometry(id,exit.target),direction=Math.sign(p.b[1]-p.a[1]);
      if(!(exit.requires||[]).every(f=>active.state.flags[f])){
        const threshold=KINGDOM[id].z+exit.z;
        if((position[1]-threshold)*direction>0&&Math.abs(position[0]-KINGDOM[id].x-exit.x)<3){active.setPlayerPosition([exit.x,exit.z-direction*.6]);return {locked:exit};}
      }else if((position[1]-p.mid[1])*direction>.02)return {target:exit.target};
    }
    return null;
  }
  followPassage(exit){
    const p=passageGeometry(this.active.area.id,exit.target);if(!p)return false;
    const direction=Math.sign(p.b[1]-p.a[1]);
    this.active.travelIntent=exit.target;this.active.setTarget(fromKingdom(this.active.area.id,[p.mid[0],p.mid[1]+direction*.65]));return true;
  }
  isInsidePlace(){return !this.active.continuous||Math.abs(this.active.player.position.z)<this.active.coreBounds[1]/2-3;}
  getAudioScene(){
    const active=this.active;if(!active.continuous)return active.getAudioScene();
    const [x,z]=toKingdom(active.area.id,active.getPlayerPosition()),emitters=[];
    for(const region of this.regions.values())if(region.root.visible&&region.continuous){
      const scene=region.getAudioScene();
      for(const emitter of scene.emitters){const [ex,ez]=toKingdom(region.area.id,[emitter.x,emitter.z]);emitters.push({...emitter,id:`${region.area.id}:${emitter.id}`,x:ex,z:ez});}
    }
    return {area:'kingdom',listener:{x,z},emitters:emitters.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)).slice(0,12)};
  }
  dispose(){clearTimeout(this.preloadTimer);this.generation++;for(const region of this.regions.values())region.clearArea();this.regions.clear();if(this.landscape){this.engine.scene.remove(this.landscape.root);this.landscape.root.traverse(o=>{if(o.isInstancedMesh)o.dispose();});this.landscape.localGeometries.forEach(g=>g.dispose());this.landscape.sharedMaterials.forEach(m=>m.dispose());}this.engine.dispose();}
}
