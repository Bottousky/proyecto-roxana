import {Application,Entity,Mesh,MeshInstance,StandardMaterial,Color,Vec3,Vec2,Quat,Script,PROJECTION_ORTHOGRAPHIC,FILLMODE_FILL_WINDOW,RESOLUTION_AUTO,CULLFACE_NONE,CULLFACE_BACK,BLEND_NORMAL,BLEND_ADDITIVEALPHA,TONEMAP_ACES} from 'playcanvas';
import {surface,actorArt} from './art.ts';
import {AREAS} from './game/content.js';
import {KINGDOM,isExterior,inKingdomWater,inTravelCorridor,travelBounds,passagesFor,passageGeometry,toKingdom,fromKingdom} from './game/kingdom-geography.js';
import {lakeShoreX} from './game/world-layout.js';
import {findPath} from './game/navigation.js';
import {moveWithCollisions,isPositionClear} from './game/collision.js';
import {advanceActor,idleActor} from './game/actor-animation.js';
import {initializeInhabitants,updateInhabitants,getInhabitantInteractions,beginInhabitantConversation,faceInhabitantSpeaker,endInhabitantConversation} from './game/world-inhabitants.js';
import {inInteractionReach,approachInteraction} from './game/world-interaction.js';
import {describeWorldAudio} from './game/world-audio.js';
import {journeyPhase} from './game/story-time.js';
import {readReceiverFeedback,readControlFeedback} from './game/world-feedback.js';
import {createCinematic,sampleCinematic,returningCinematic,gameplayCameraPose} from './game/cinematics.js';
import sceneUrl from './data/scene.json?url';
import geometryUrl from './data/geometry.bin.gz?url';
import {walkableTerrain} from './terrain.js';
import {makeWater,updateWater,loadShore,bindShore} from './water.js';
import {makeGround} from './ground.js';

// Small coordinate value adapter for the existing renderer-independent game rules.
class Position extends Vec3 {
  toArray(){return [this.x,this.y,this.z];}
  fromArray(p){return this.set(...p);}
  distanceToSquared(p){return (this.x-p.x)**2+(this.y-p.y)**2+(this.z-p.z)**2;}
}
class ActorSprite extends Script {
  showFrame(state,ohm,clock){this.entity.sprite.frame=state.direction*(ohm?6:5)+(ohm?(state.moving?Math.floor(clock*8)%6:0):state.frame);}
}
const color=s=>new Color().fromString(s);
const power={portal:'awaken',plaza:'workshop',workshop:'workshop',road:'gate',spring:'pump',castle:'distribution',terraces:'irrigation',lake:'beacon_link',lighthouse:'beacon_network'};
const DRY_CROP=new Color(1.5,1.02,.4); // multiplies the green leaf cards toward straw
const waitFrame=()=>new Promise(r=>requestAnimationFrame(r));

export class PlayCanvasWorld {
  constructor(canvas){
    this.canvas=canvas;this.state={flags:{},settings:{}};this.clock=0;this.route=[];this.target=null;this.actors=[];this.regions=new Map();this.allActors=[];this.dynamics=[];this.waters=[];this.glasses=[];this.lights=[];this.sprites=new Map();this.focus=new Position();this.cameraOffset=new Position(0,13.5,25);this.currentZoom=.93;this.companionRoute=[];this.companionAge=0;this.walking=false;
    this.app=new Application(canvas,{graphicsDeviceOptions:{alpha:false,antialias:true}});
    this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW);this.app.setCanvasResolution(RESOLUTION_AUTO);
    this.camera=new Entity('Cámara de viaje');this.camera.addComponent('camera',{projection:PROJECTION_ORTHOGRAPHIC,orthoHeight:12/.93,nearClip:.1,farClip:250,clearColor:color('#8fa5a6')});this.camera.camera.toneMapping=TONEMAP_ACES;this.app.root.addChild(this.camera);
    this.sun=new Entity('Sol de Ohmdal');this.sun.addComponent('light',{type:'directional',color:color('#ffe6bc'),intensity:1.6,castShadows:true,shadowResolution:2048,shadowDistance:100,normalOffsetBias:.04,shadowBias:.2});this.sun.setEulerAngles(50,-35,0);this.app.root.addChild(this.sun);
    this.app.scene.ambientLight=color('#8eaaad');this.resize();this.assetsReady=this.loadArtAssets();
    this.destroy=()=>this.dispose();addEventListener('beforeunload',this.destroy,{once:true});
  }
  async loadArtAssets(){
    if(this.booted)return {ok:true,missing:[]};
    try{await this.build();this.booted=true;return {ok:true,missing:[]};}catch(error){console.error(error);return {ok:false,missing:[error.message]};}
  }
  async build(){
    const [data,binary]=await Promise.all([fetch(sceneUrl).then(r=>{if(!r.ok)throw new Error('Falta el mundo');return r.json();}),fetch(geometryUrl).then(async r=>{if(!r.ok)throw new Error('Falta la geometría');const buffer=await r.arrayBuffer(),magic=new Uint8Array(buffer,0,2);return magic[0]===31&&magic[1]===139?new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():buffer;})]);this.data=data;
    for(const id of [...Object.keys(AREAS),'landscape']){const root=new Entity(id==='landscape'?'Ohmdal · geografía compartida':AREAS[id].name);this.app.root.addChild(root);this.regions.set(id,{root,actors:[]});}
    const needed=[...new Set(data.meshes.flatMap(m=>m.material.texture?[m.material.texture]:[]))];for(const name of needed)await surface(this.app,name);
    const owners=new Map(),shore=await loadShore(this.app);this.receivers=[];let count=0;
    const cobble=await surface(this.app,'cobble');
    for(const b of data.meshes){
      if(b.material.paving)continue; // painted by the ground shader
      const d=b.material,e=new Entity(b.owner||`${b.area} · ${count}`),m=new StandardMaterial();m.diffuse=color('#'+d.color);m.emissive=color('#'+d.emissive);m.emissiveIntensity=d.emission;m.shininess=10;m.useMetalness=true;m.metalness=0;m.diffuseVertexColor=true;m.alphaTest=d.alpha;m.opacity=d.opacity;m.cull=d.double?CULLFACE_NONE:CULLFACE_BACK;
      if(d.texture){m.diffuseMap=await surface(this.app,d.texture);if(d.alpha){m.opacityMap=m.diffuseMap;m.opacityMapChannel='a';}}
      if(d.opacity<1){m.blendType=BLEND_NORMAL;m.depthWrite=false;}
      if(d.texture==='water'){makeWater(m);bindShore(m,shore,!b.dynamic);this.waters.push(m);}
      if(d.texture==='ground')makeGround(m,{shoreMap:shore,meadow:m.diffuseMap,cobble});
      m.update();const mesh=new Mesh(this.app.graphicsDevice),attr=key=>new (key==='indices'?Uint32Array:Float32Array)(binary,b[key].offset,b[key].length);
      mesh.setPositions(attr('positions'));mesh.setNormals(attr('normals'));mesh.setUvs(0,attr('uvs'));mesh.setColors(attr('colors'));mesh.setIndices(attr('indices'));mesh.update();
      const instance=new MeshInstance(mesh,m,e);instance.castShadow=d.shadow&&d.opacity===1;instance.receiveShadow=true;e.addComponent('render',{meshInstances:[instance]});let parent=this.regions.get(b.area).root;
      if(b.owner&&!b.dynamic){if(!owners.has(b.owner)){const owner=new Entity(b.owner);parent.addChild(owner);owners.set(b.owner,owner);}parent=owners.get(b.owner);}
      parent.addChild(e);
      if(b.dynamic){e.setPosition(...b.dynamic.pivot);this.dynamics.push({...b.dynamic,area:b.area,entity:e,material:m,angle:0,progress:0,rotation:new Quat(),axle:new Vec3(...(b.dynamic.spinAxis||[0,0,1]))});}
      if(d.glass)this.glasses.push({area:b.area,material:m});
      if(d.crop)(this.crops??=[]).push({material:m,lush:m.diffuse.clone()});
      if(d.receiver)this.receivers.push({area:b.area,material:m,...d.receiver});
      if(++count%15===0){const text=document.getElementById('transition-name');if(text)text.textContent=`Tejiendo Ohmdal · ${Math.round(count/data.meshes.length*100)}%`;await new Promise(r=>setTimeout(r,0));}
    }
    // The far countryside continues behind the authored region surfaces.
    for(const [z,depth] of [[-95,390]]){const e=new Entity('Laderas del reino');e.addComponent('render',{type:'plane'});const m=new StandardMaterial();m.diffuse=color('#b5bba0');m.diffuseMap=await surface(this.app,'ground');m.diffuseMapTiling=new Vec2(42,65);m.update();e.render.material=m;e.setPosition(-42.5,-.15,z);e.setLocalScale(175,1,depth);this.regions.get('landscape').root.addChild(e);}
    for(const [id,area] of Object.entries(AREAS))for(const object of area.objects.filter(o=>o.character&&o.character!=='ohm')){
      const a=await this.makeActor(object.character,object.x,object.z,id,object);this.allActors.push(a);this.regions.get(id).actors.push(a);
    }
    this.playerActor=await this.makeActor('player',0,0,'player');this.player=this.playerActor.g;this.ohmActor=await this.makeActor('ohm',-1,.7,'companion');this.ohm=this.ohmActor.g;
    this.sleeping=await this.makeActor('ohm',3.5,0,'portal');this.sleeping.g.position.y=1.1;
    for(const lamp of data.lights){const e=new Entity('Farol · '+lamp.area);e.addComponent('light',{type:'omni',color:color('#ffd399'),intensity:0,range:6,castShadows:false});e.setPosition(...lamp.position);this.regions.get(lamp.area).root.addChild(e);this.lights.push({area:lamp.area,entity:e});}
    this.buildAtmosphere();await this.buildLightEffects();this.app.start();
  }
  async makeActor(name,x,z,area,object){
    if(!this.sprites.has(name))this.sprites.set(name,await actorArt(this.app,name));
    const e=new Entity(name);e.addComponent('sprite',{type:'simple',sprite:this.sprites.get(name),frame:0});e.sprite.material=e.sprite.material.clone();e.sprite.material.depthWrite=true;e.sprite.material.alphaTest=.22;e.setEulerAngles(-28.37,0,0);this.app.root.addChild(e);e.addComponent('script');const script=e.script.create(ActorSprite);
    return {name,area,entity:e,script,phase:this.allActors.length*.71,animation:idleActor(),g:{position:new Position(x,0,z),visible:true,userData:{interaction:object}}};
  }
  animateActor(a,dx,dz,dt,{paused=false,reducedMotion=false}={}){
    a.animation=advanceActor(a.animation,paused?0:dx,paused?0:dz,dt,{reducedMotion});a.script.showFrame(a.animation,a.name==='ohm',this.clock);
  }
  context(id){
    const context=Object.create(this);context.area=AREAS[id];context.coreBounds=context.area.bounds;context.bounds=travelBounds(id);context.obstacles=this.localObstacles(id);context.actors=this.regions.get(id).actors;return context;
  }
  localObstacles(id){const [ox,oz]=this.data.areas[id].offset;return this.data.areas[id].obstacles.filter(o=>!o.gate||!this.state.flags.gate).map(o=>({...o,x:o.x-ox,z:o.z-oz}));}
  loadArea(area,state,spawn,{continuous=false}={}){
    const old=this.area?.id,preserve=continuous&&old&&isExterior(old)&&isExterior(area.id),global=preserve?toKingdom(old,this.getPlayerPosition()):null,companion=preserve?toKingdom(old,[this.ohm.position.x,this.ohm.position.z]):null;
    this.area=area;this.state=state;this.coreBounds=area.bounds;this.bounds=travelBounds(area.id);this.obstacles=this.localObstacles(area.id);this.actors=[this.playerActor,...this.regions.get(area.id).actors];
    if(preserve){const p=fromKingdom(area.id,global),o=fromKingdom(area.id,companion);this.player.position.set(p[0],0,p[1]);this.ohm.position.set(o[0],0,o[1]);this.route=[];this.target=null;this.companionRoute=[];if(this.travelIntent===area.id){this.setTarget(area.spawn);this.travelIntent=null;}}
    else{this.setPlayerPosition(spawn||area.spawn);this.cancelCinematic();}
    initializeInhabitants(this);this.updateFlags(state);this.arrange();this.syncActors();
  }
  arrange(){
    const inside=this.area?.id==='workshop';
    for(const [id,r] of this.regions)r.root.enabled=inside?id==='workshop':id!=='workshop';
    for(const a of this.allActors){if(a.area!==this.area?.id){const ctx=this.context(a.area);ctx.actors=[a];if(!a.inhabitant)initializeInhabitants(ctx);}}
  }
  async prepareJourney(progress=()=>{}){
    if(this.prepared)return;this.preparingJourney=true;
    const prior=this.area?.id,pose=this.camera.getPosition().clone(),savedRotation=this.camera.getRotation().clone();let n=0;
    // Warm each place under the first curtain; crossings never create assets.
    for(const id of Object.keys(AREAS)){for(const [name,r] of this.regions)r.root.enabled=id==='workshop'?name==='workshop':name!=='workshop';const [x,z]=this.data.areas[id].offset;this.camera.setPosition(x,28,z+50);this.camera.lookAt(x,1,z);await waitFrame();await waitFrame();progress(++n,9);}
    this.camera.setPosition(pose);this.camera.setRotation(savedRotation);if(prior)this.arrange();this.prepared=true;this.preparingJourney=false;
  }
  walkableLand(x,z){
    return walkableTerrain(this.area.id,x,z);
  }
  canStand(x,z,radius=.34){return isPositionClear([x,z],this.bounds,this.obstacles,{radius,isWalkable:(x,z)=>this.walkableLand(x,z)});}
  nearestWalkable(p,radius=.34){if(this.canStand(...p,radius))return [...p];for(let d=.15;d<15;d+=.15)for(let i=0;i<32;i++){const x=p[0]+Math.cos(i*Math.PI/16)*d,z=p[1]+Math.sin(i*Math.PI/16)*d;if(this.canStand(x,z,radius))return [x,z];}return [...this.area.spawn];}
  groundHeight(x,z){if(this.area.id==='lake'&&Math.abs(x-9.2)<4.5&&Math.abs(z-3)<2.25)return .24;let height=.08;for(const s of this.data.areas[this.area.id].walkSurfaces||[]){if(s.r!=null?Math.hypot(x-s.x,z-s.z)<=s.r:Math.abs(x-s.x)<=s.w/2&&Math.abs(z-s.z)<=s.d/2)height=Math.max(height,s.y+.02);}return height;}
  getPlayerPosition(){return this.player?[this.player.position.x,this.player.position.z]:[0,0];}
  setPlayerPosition(p){const q=this.nearestWalkable(p);this.player.position.set(q[0],this.groundHeight(...q),q[1]);const o=this.nearestWalkable([q[0]-1,q[1]+.7]);this.ohm.position.set(o[0],this.groundHeight(...o),o[1]);this.route=[];this.target=null;this.companionRoute=[];}
  setTarget(p){this.route=findPath(this.getPlayerPosition(),p,this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});this.target=this.route.shift()||null;}
  getInteractions(){if(!this.area)return [];return [...this.area.objects.filter(o=>!o.character&&o.kind!=='npc'),...this.area.exits,...getInhabitantInteractions(this)].filter(o=>!o.hidden&&(!o.requiresFlag||this.state.flags[o.requiresFlag]));}
  canInteractWith(o){return !!o&&inInteractionReach(this,o);}
  planInteraction(o){return approachInteraction(this,o);}
  approachInteraction(o){const path=approachInteraction(this,o);if(path===null)return false;this.route=path;this.target=this.route.shift()||null;return true;}
  getNearby(){return this.getInteractions().filter(o=>this.canInteractWith(o)).sort((a,b)=>(b.interactionPriority||0)-(a.interactionPriority||0)||Math.hypot(a.x-this.player.position.x,a.z-this.player.position.z)-Math.hypot(b.x-this.player.position.x,b.z-this.player.position.z))[0]||null;}
  getScreenPosition(o){if(this.disposed||!this.camera.camera)return {x:0,y:0,visible:false};const [ox,oz]=this.data.areas[this.area.id].offset,p=this.camera.camera.worldToScreen(new Vec3(o.x+ox,o.ground?0:o.target?.35:o.character?2.5:1.6,o.z+oz)),r=this.canvas.getBoundingClientRect();return {x:p.x,y:p.y,visible:p.x>0&&p.x<r.width&&p.y>0&&p.y<r.height};}
  pick(x,y){const r=this.canvas.getBoundingClientRect(),a=this.camera.camera.screenToWorld(x-r.left,y-r.top,0),b=this.camera.camera.screenToWorld(x-r.left,y-r.top,200),t=-a.y/(b.y-a.y),[ox,oz]=this.data.areas[this.area.id].offset;return [a.x+(b.x-a.x)*t-ox,a.z+(b.z-a.z)*t-oz];}
  pickInteraction(x,y){const r=this.canvas.getBoundingClientRect();return this.getInteractions().map(o=>({o,p:this.getScreenPosition(o)})).filter(({o,p})=>p.visible&&Math.hypot(p.x-(x-r.left),p.y-(y-r.top))<(o.character?24:20)).sort((a,b)=>Math.hypot(a.p.x-x+r.left,a.p.y-y+r.top)-Math.hypot(b.p.x-x+r.left,b.p.y-y+r.top))[0]?.o||null;}
  followPassage(exit){const p=passageGeometry(this.area.id,exit.target);if(!p)return false;this.travelIntent=exit.target;this.setTarget(fromKingdom(this.area.id,[p.mid[0],p.mid[1]+Math.sign(p.b[1]-p.a[1])*.7]));return true;}
  getTravelEvent(){if(!isExterior(this.area.id)||!this.walking)return null;const global=toKingdom(this.area.id,this.getPlayerPosition());for(const exit of passagesFor(this.area.id)){const p=passageGeometry(this.area.id,exit.target),direction=Math.sign(p.b[1]-p.a[1]);if(!(exit.requires||[]).every(f=>this.state.flags[f])){const threshold=KINGDOM[this.area.id].z+exit.z;if((global[1]-threshold)*direction>0&&Math.abs(global[0]-KINGDOM[this.area.id].x-exit.x)<3){this.setPlayerPosition([exit.x,exit.z-direction*.6]);return {locked:exit};}}else if((global[1]-p.mid[1])*direction>.02)return {target:exit.target};}return null;}
  isInsidePlace(){return !isExterior(this.area.id)||Math.abs(this.player.position.z)<this.area.bounds[1]/2-3;}
  getAudioScene(){
    if(this.audioSnapshot&&this.clock-this.audioAt<.16)return this.audioSnapshot;
    this.audioAt=this.clock;
    if(!isExterior(this.area.id))return describeWorldAudio(this);
    const [x,z]=toKingdom(this.area.id,this.getPlayerPosition()),emitters=[];
    for(const id of Object.keys(AREAS)){if(!isExterior(id)||Math.abs(KINGDOM[id].z-z)>65)continue;const ctx=this.context(id),p=fromKingdom(id,[x,z]);ctx.player={position:{x:p[0],z:p[1]}};for(const e of describeWorldAudio(ctx).emitters){const [ex,ez]=toKingdom(id,[e.x,e.z]);emitters.push({...e,id:id+':'+e.id,x:ex,z:ez});}}
    return this.audioSnapshot={area:'kingdom',listener:{x,z},emitters:emitters.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)).slice(0,12)};
  }
  beginInhabitantConversation(t){beginInhabitantConversation(this,t);}
  faceInhabitantSpeaker(s){faceInhabitantSpeaker(this,s);}
  endInhabitantConversation(){endInhabitantConversation(this);}
  updateFlags(state){this.state=state;if(this.area)this.obstacles=this.localObstacles(this.area.id);this.ohm&&(this.ohm.visible=!!state.flags.awaken);this.signature=JSON.stringify([state.flags,state.puzzles]);for(const d of this.dynamics){if(d.kind==='visible')d.entity.enabled=!!(state.flags[d.flag]??state.flags[d.or]);if(d.kind==='indicator'){const active=!!state.flags[d.flag];d.material.emissive=color(active?'#62d7ae':'#675430');d.material.emissiveIntensity=active?1.1:.25;d.material.update();}if(d.receiver)d.feedback=readReceiverFeedback(d.area,state,d.receiver);}for(const r of this.receivers||[]){r.material.emissiveIntensity=r.intensity*readReceiverFeedback(r.area,state,r.object).level;r.material.update();}}
  setInspection(v){this.inspect=v;if(v){this.target=null;this.route=[];}}
  cameraPose(){const [ox,oz]=this.data.areas[this.area.id].offset;return {focus:[this.focus.x-ox,this.focus.y,this.focus.z-oz],offset:this.cameraOffset.toArray(),zoom:this.currentZoom};}
  startCinematic(id,{reducedMotion=false}={}){const p=this.area.objects.find(o=>o.puzzle===id);if(!p)return false;const timeline=createCinematic(id,{areaId:this.area.id,flags:this.state.flags,player:this.player.position.toArray(),companion:this.ohm.position.toArray(),puzzle:[p.x,1.4,p.z],bounds:this.area.bounds,start:this.cameraPose()},{reducedMotion});if(!timeline)return false;this.cinematic={timeline,elapsed:0};this.target=null;this.route=[];return true;}
  getCinematicState(){if(!this.cinematic)return null;return sampleCinematic(this.cinematic.timeline,this.cinematic.elapsed);}
  skipCinematic(){if(!this.cinematic)return false;this.cinematic={timeline:returningCinematic(this.cinematic.timeline.id,this.cameraPose(),gameplayCameraPose(this.area.id,this.player.position.toArray())),elapsed:0};return true;}
  cancelCinematic(){this.cinematic=null;this.inspect=false;this.route=[];this.target=null;if(!this.area||!this.player)return;const p=gameplayCameraPose(this.area.id,this.player.position.toArray()),[ox,oz]=this.data.areas[this.area.id].offset;this.focus.set(p.focus[0]+ox,p.focus[1],p.focus[2]+oz);this.cameraOffset.fromArray(p.offset);this.currentZoom=p.zoom;this.positionCamera();}
  endCinematic(){this.cancelCinematic();}
  playRestoration(){this.updateFlags(this.state);this.restoration=3;}
  positionCamera(){this.camera.setPosition(this.focus.x+this.cameraOffset.x*2,this.focus.y+this.cameraOffset.y*2,this.focus.z+this.cameraOffset.z*2);this.camera.lookAt(this.focus);this.camera.camera.orthoHeight=12/this.currentZoom;}
  syncActors(){
    const inside=this.area.id==='workshop';for(const a of [...this.allActors,this.playerActor,this.ohmActor,this.sleeping]){const active=a===this.playerActor||a===this.ohmActor,id=active?this.area.id:a.area,[ox,oz]=this.data.areas[id].offset,p=a.g.position;
      a.entity.enabled=a.g.visible&&(active||(inside?id==='workshop':id!=='workshop'))&&(a!==this.sleeping||!this.state.flags.awaken);
      a.entity.setPosition(p.x+ox,p.y,p.z+oz);
      const night=inside?0:(this.lampLevel||0),sleep=a===this.sleeping?.52:1;a.entity.sprite.color=new Color((1-night*.22)*sleep,(1-night*.14)*sleep,(1-night*.03)*sleep);
      if(a.shadow){a.shadow.enabled=a.entity.enabled;a.shadow.setPosition(p.x+ox,.105,p.z+oz+.06);}
    }
  }
  update(dt,state,input={}){
    if(this.disposed||!this.booted||!this.area||this.preparingJourney)return;dt=Math.min(.05,Math.max(0,dt));this.clock+=dt;this.state=state;
    if(JSON.stringify([state.flags,state.puzzles])!==this.signature)this.updateFlags(state);
    const paused=input.paused||!!this.cinematic||this.inspect,reduced=state.settings?.reducedMotion,p=this.player.position,old=[p.x,p.z];
    let dx=input.x||0,dz=input.z||0,stepLimit=Infinity;if(paused){this.target=null;this.route=[];dx=dz=0;}else if(dx||dz){this.target=null;this.route=[];const l=Math.hypot(dx,dz);dx/=Math.max(1,l);dz/=Math.max(1,l);}else if(this.target){const x=this.target[0]-p.x,z=this.target[1]-p.z,d=Math.hypot(x,z);if(d<.04)this.target=this.route.shift()||null;else{dx=x/d;dz=z/d;stepLimit=d;}}
    if(dx||dz){const step=Math.min((input.run?7:4.2)*dt,stepLimit),next=moveWithCollisions([p.x,p.z],[dx*step,dz*step],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});p.set(next[0],this.groundHeight(...next),next[1]);}
    this.walking=Math.hypot(p.x-old[0],p.z-old[1])>.0001;this.animateActor(this.playerActor,p.x-old[0],p.z-old[1],dt,{paused,reducedMotion:reduced});
    this.updateCompanion(dt,paused,reduced);updateInhabitants(this,dt,state,{paused,reducedMotion:reduced});
    // Neighbours share time and state; errands continue without resetting at a boundary.
    for(const [id,r] of this.regions)if(id!==this.area.id&&id!=='landscape'&&r.actors.length&&Math.abs((KINGDOM[id]?.z||0)-(KINGDOM[this.area.id]?.z||0))<80){const ctx=this.context(id);updateInhabitants(ctx,dt,state,{paused,reducedMotion:reduced});}
    this.syncActors();this.updateEnvironment(dt,reduced);const [ox,oz]=this.data.areas[this.area.id].offset;
    if(this.cinematic){this.cinematic.elapsed+=dt;const s=sampleCinematic(this.cinematic.timeline,this.cinematic.elapsed);this.focus.set(s.pose.focus[0]+ox,s.pose.focus[1],s.pose.focus[2]+oz);this.cameraOffset.fromArray(s.pose.offset);this.currentZoom=s.pose.zoom;if(s.done)this.cinematic=null;}
    else{const rest=gameplayCameraPose(this.area.id,p.toArray()),wanted=new Vec3(rest.focus[0]+ox,rest.focus[1],rest.focus[2]+oz);this.focus.lerp(this.focus,wanted,1-Math.exp(-dt*3.6));this.currentZoom+=((this.inspect?1.45:rest.zoom)-this.currentZoom)*(1-Math.exp(-dt*2.6));this.cameraOffset.lerp(this.cameraOffset,new Vec3(0,13.5,25),1-Math.exp(-dt*2.6));}
    this.positionCamera();
  }
  updateCompanion(dt,paused,reduced){
    const o=this.ohm.position,p=this.player.position,old=[o.x,o.z],distance=Math.hypot(p.x-o.x,p.z-o.z);this.companionAge+=dt;
    if(!paused&&this.ohm.visible&&distance>1.4){if(this.companionAge>.7||!this.companionRoute.length){this.companionRoute=findPath(old,[p.x,p.z],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});this.companionAge=0;}while(this.companionRoute.length&&Math.hypot(this.companionRoute[0][0]-o.x,this.companionRoute[0][1]-o.z)<.12)this.companionRoute.shift();const q=this.companionRoute[0];if(q){const d=Math.hypot(q[0]-o.x,q[1]-o.z),step=Math.min(d,distance-1.15,7.5*dt),next=moveWithCollisions(old,[(q[0]-o.x)/d*step,(q[1]-o.z)/d*step],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});o.set(next[0],this.groundHeight(...next),next[1]);}}
    this.animateActor(this.ohmActor,o.x-old[0],o.z-old[1],dt,{paused,reducedMotion:reduced});
  }
  buildAtmosphere(){
    const m=new StandardMaterial();m.diffuse=color('#e8c994');m.emissive=color('#d6be82');m.emissiveIntensity=.65;m.blendType=BLEND_ADDITIVEALPHA;m.opacity=.26;m.depthWrite=false;m.update();this.motes=[];
    for(let i=0;i<45;i++){const e=new Entity('Polen en la luz');e.addComponent('render',{type:'sphere'});e.render.material=m;e.render.castShadows=false;e.setLocalScale(.025,.025,.025);this.app.root.addChild(e);this.motes.push({entity:e,phase:i*2.399,x:(i*7.33)%38-19,z:(i*11.27)%40-20,y:.4+(i%9)*.42});}
    this.beacon=new Entity('Señal del Faro');const m2=new StandardMaterial();m2.diffuse=color('#ffe1a5');m2.emissive=color('#ffe1a5');m2.emissiveIntensity=2;m2.opacity=.11;m2.blendType=BLEND_ADDITIVEALPHA;m2.depthWrite=false;m2.cull=CULLFACE_NONE;m2.update();this.beacon.addComponent('render',{type:'cone'});this.beacon.render.material=m2;this.beacon.render.castShadows=false;this.beacon.setLocalScale(12,55,12);this.app.root.addChild(this.beacon);
  }
  async buildLightEffects(){
    const texture=await surface(this.app,'glow');
    const contact=new StandardMaterial();contact.diffuse=color('#081817');contact.diffuseMap=texture;contact.opacityMap=texture;contact.opacityMapChannel='a';contact.opacity=.4;contact.blendType=BLEND_NORMAL;contact.depthWrite=false;contact.update();
    for(const actor of [...this.allActors,this.playerActor,this.ohmActor,this.sleeping]){const e=new Entity('Sombra de '+actor.name);e.addComponent('render',{type:'plane'});e.render.material=contact;e.render.castShadows=false;e.setLocalScale(actor.name==='ohm'?1.3:.95,1,.65);this.app.root.addChild(e);actor.shadow=e;}
    const glow=(name,position,scale,tint,parent)=>{const e=new Entity(name),m=new StandardMaterial();m.diffuse=color(tint);m.emissive=color(tint);m.emissiveIntensity=1.2;m.diffuseMap=texture;m.opacityMap=texture;m.opacityMapChannel='a';m.blendType=BLEND_ADDITIVEALPHA;m.depthWrite=false;m.cull=CULLFACE_NONE;m.update();e.addComponent('render',{type:'plane'});e.render.material=m;e.render.castShadows=false;e.setPosition(...position);e.setEulerAngles(62,0,0);e.setLocalScale(scale,1,scale);parent.addChild(e);return {entity:e,material:m};};
    this.portalGlow=glow('La luz del Portal Ω',[KINGDOM.portal.x,2.8,KINGDOM.portal.z-5.45],5.2,'#73cbd3',this.regions.get('portal').root);
    this.lampGlows=[];for(const l of this.data.lights)this.lampGlows.push({...glow('Resplandor de farol',l.position,2.2,'#ffd092',this.regions.get(l.area).root),area:l.area});
    this.beaconGlow=glow('Cristal del Faro',[KINGDOM.lighthouse.x,18,KINGDOM.lighthouse.z-25.08],9,'#ffe2a7',this.regions.get('lighthouse').root);
    this.beaconLight=new Entity('Luz restaurada del Faro');this.beaconLight.addComponent('light',{type:'omni',range:40,color:color('#ffdf9f'),intensity:0});this.beaconLight.setPosition(KINGDOM.lighthouse.x,18,KINGDOM.lighthouse.z-25.08);this.regions.get('lighthouse').root.addChild(this.beaconLight);
  }
  updateEnvironment(dt,reduced){
    const f=this.state.flags,phase=journeyPhase(this.state),inside=this.area.id==='workshop',mix=1-Math.exp(-dt*.8);this.lampLevel??=phase.lamps;this.lampLevel+=(phase.lamps-this.lampLevel)*mix;
    const n=this.lampLevel;this.sun.light.intensity+=((inside?.85:phase.intensity*.5)-this.sun.light.intensity)*mix;this.sun.light.color.lerp(this.sun.light.color,color(phase.sun),mix);this.app.scene.ambientLight.lerp(this.app.scene.ambientLight,color(inside?'#7c7967':n>.7?'#687f9b':'#92a7a0'),mix);this.camera.camera.clearColor.lerp(this.camera.camera.clearColor,color(inside?'#0f0c09':phase.sky),mix);
    for(const light of this.lights){const active=f[power[light.area]]||f.beacon_lens;light.entity.light.intensity=active?(light.area==='workshop'?1.6:n*2.2):0;}
    for(const glow of this.lampGlows||[]){const active=f[power[glow.area]]||f.beacon_lens;glow.entity.enabled=!!active&&(glow.area==='workshop'||n>.01);glow.material.opacity=(glow.area==='workshop'?.55:n*.7)*(reduced?1:.97+Math.sin(this.clock*1.8)*.03);glow.material.update();}
    if(this.portalGlow){this.portalGlow.material.opacity=.4+(reduced?0:Math.sin(this.clock*.9)*.08);this.portalGlow.material.update();}
    if(this.beaconGlow){this.beaconGlow.entity.enabled=!!f.beacon_lens;this.beaconLight.light.intensity=f.beacon_lens?4:0;}
    for(const g of this.glasses){const active=f[power[g.area]]||f.beacon_lens,level=active?(g.area==='workshop'?.8:n):.02;g.material.emissive=color('#ffc57d');g.material.emissiveIntensity=level;g.material.update();}
    for(const d of this.dynamics){const e=d.entity,flag=!!f[d.flag],motion=reduced?0:1;
      if(d.kind==='gate'){const wanted=f.gate?1:0;d.progress+=(wanted-d.progress)*Math.min(1,dt*1.2);e.setPosition(d.pivot[0],d.pivot[1]+d.progress*5.8,d.pivot[2]);}
      if(d.kind==='lever'){d.angle+=((flag?-37:37)-d.angle)*Math.min(1,dt*8);e.setEulerAngles(d.axis==='z'?0:d.angle,0,d.axis==='z'?d.angle:0);}
      if(['wheel','gear','optic'].includes(d.kind)){const enabled=d.receiver?d.feedback?.moving:d.flag?flag:d.area==='spring'?(d.kind==='wheel'?(f.spring_sluice??f.pump):(f.spring_sluice??f.pump)&&(f.spring_coupling??f.pump)):d.kind==='optic'?f.beacon_network&&f.tower_lens_free:true;if(enabled)d.angle+=dt*d.speed*57.3*motion;e.setRotation(d.rotation.setFromAxisAngle(d.axle,d.angle));}
      if(d.kind==='boat'){e.setPosition(d.pivot[0],d.pivot[1]+Math.sin(this.clock*.8)*.055*motion,d.pivot[2]);}
      if(d.kind==='banner')e.setEulerAngles(0,Math.sin(this.clock*1.1+d.pivot[0])*3*motion,0);
      if(d.kind==='control'||d.kind==='conductor'){
        if(d.lastSignature!==this.signature){const object=AREAS[d.area].objects.find(o=>o.id===d.object),signal=readControlFeedback(d.area,this.state,object);d.lastSignature=this.signature;d.material.emissive=color(signal.flowing?(d.return?'#609ebd':'#d9a252'):'#000000');d.material.emissiveIntensity=signal.flowing?.5:0;d.material.diffuse=color(d.kind==='conductor'?(d.return?'#73999a':'#ba844d'):signal.mechanical?'#b6a075':signal.overloaded?'#b5724d':signal.flowing?'#abc59b':'#968666');d.material.update();}
      }
    }
    const sky=this.camera.camera.clearColor,horizon=new Color().lerp(sky,color('#f3e7cf'),inside?0:.45);
    updateWater(this.waters,{time:this.clock,motion:reduced?.15:1,sky,horizon,sunDir:this.sun.up,sunColor:this.sun.light.color,night:n});
    // Terrace crops wilt without irrigation and green up over a few seconds once it runs.
    this.cropLife??=f.irrigation?1:0;const life=this.cropLife+=((f.irrigation?1:0)-this.cropLife)*Math.min(1,dt*(reduced?4:.6));
    if(this.crops&&Math.abs(life-(this.cropShown??-1))>.002){this.cropShown=life;for(const c of this.crops){c.material.diffuse.lerp(DRY_CROP,c.lush,life);c.material.update();}}
    for(const p of this.motes){p.entity.enabled=!reduced&&(!inside||Math.abs(p.x)<11&&p.z<16);p.entity.setPosition(this.focus.x+p.x+Math.sin(this.clock*.2+p.phase)*.5,p.y+Math.sin(this.clock*.6+p.phase)*.15,this.focus.z+p.z);}
    this.beacon.enabled=!!f.beacon_lens&&!inside;const a=this.clock*.18;this.beacon.setPosition(KINGDOM.lighthouse.x+Math.cos(a)*27.5,18,KINGDOM.lighthouse.z-25.08+Math.sin(a)*27.5);this.beacon.setEulerAngles(0,-a*57.3,90);
  }
  resize(){const low=this.state.settings?.quality==='low';this.app.graphicsDevice.maxPixelRatio=Math.min(devicePixelRatio,low?1:1.7);this.app.resizeCanvas();if(this.sun)this.sun.light.castShadows=!low;}
  dispose(){if(this.disposed)return;this.disposed=true;removeEventListener('beforeunload',this.destroy);this.app.destroy();}
}
