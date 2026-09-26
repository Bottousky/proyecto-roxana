import {CameraFrame,Texture,PIXELFORMAT_RGBA8,ADDRESS_CLAMP_TO_EDGE,Application,Entity,Mesh,MeshInstance,StandardMaterial,Color,Vec3,Vec2,Quat,Script,PROJECTION_ORTHOGRAPHIC,FILLMODE_FILL_WINDOW,RESOLUTION_AUTO,CULLFACE_NONE,CULLFACE_BACK,BLEND_NORMAL,BLEND_ADDITIVEALPHA,TONEMAP_ACES} from 'playcanvas';
import {surface,actorArt} from './art.ts';
import {AREAS} from './game/content.js';
import {KINGDOM,isExterior,inKingdomWater,inTravelCorridor,travelBounds,passagesFor,passageGeometry,toKingdom,fromKingdom} from './game/kingdom-geography.js';
import {lakeShoreX,AREA_LAYOUTS,pointOnPaving} from './game/world-layout.js';
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
import {makeGround,makeRock,updateClouds} from './ground.js';
import {makeWind,updateWind,windKind} from './wind.js';
import {makePortalSurface} from './portal.js';

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
// Colour grade per moment of the journey: [saturation, r, g, b tint, brightness].
const GRADES={morning:[1,1,1,1,1],afternoon:[1.02,1.02,1,.97,1],sunset:[.95,1.08,.95,.85,1],dusk:[.8,.94,.9,1.04,.97],night:[.66,.8,.9,1.1,.96],'next-morning':[1.03,1,1.01,1.02,1.02],inside:[1,1,1,1,1]};
const DRY_CROP=new Color(1.5,1.02,.4); // multiplies the green leaf cards toward straw
let paneMap=null;
function paneTexture(app){
  // Dark glass that catches the sky: a cool gradient and two diagonal streaks of light.
  if(paneMap)return paneMap;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,64);
  g.addColorStop(0,'#9fb4ba');g.addColorStop(.55,'#56707a');g.addColorStop(1,'#2e434c');x.fillStyle=g;x.fillRect(0,0,64,64);
  x.globalAlpha=.55;x.fillStyle='#e8f1ee';x.beginPath();x.moveTo(8,64);x.lineTo(22,64);x.lineTo(50,0);x.lineTo(36,0);x.fill();x.globalAlpha=.3;x.beginPath();x.moveTo(26,64);x.lineTo(31,64);x.lineTo(59,0);x.lineTo(54,0);x.fill();
  paneMap=new Texture(app.graphicsDevice,{width:64,height:64,format:PIXELFORMAT_RGBA8,mipmaps:true});paneMap.setSource(c);return paneMap;
}
function beamTexture(app){
  // Bright at the lens, fading with distance; soft across its width.
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d'),img=x.createImageData(256,64);
  for(let j=0;j<64;j++)for(let i=0;i<256;i++){const u=i/255,v=Math.abs(j/63-.5)*2,edge=Math.max(0,1-v/(.25+u*.75)),a=Math.pow(1-u,1.4)*Math.pow(edge,1.6),k=(j*256+i)*4;img.data[k]=img.data[k+1]=img.data[k+2]=255;img.data[k+3]=Math.round(a*255);}
  x.putImageData(img,0,0);const t=new Texture(app.graphicsDevice,{width:256,height:64,format:PIXELFORMAT_RGBA8,mipmaps:true,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});t.setSource(c);return t;
}
const waitFrame=()=>new Promise(r=>requestAnimationFrame(r));

export class PlayCanvasWorld {
  constructor(canvas){
    this.canvas=canvas;this.state={flags:{},settings:{}};this.clock=0;this.route=[];this.target=null;this.actors=[];this.regions=new Map();this.allActors=[];this.dynamics=[];this.waters=[];this.glasses=[];this.lights=[];this.sprites=new Map();this.focus=new Position();this.cameraOffset=new Position(0,13.5,25);this.currentZoom=.93;this.companionRoute=[];this.companionAge=0;this.walking=false;
    this.app=new Application(canvas,{graphicsDeviceOptions:{alpha:false,antialias:true}});
    this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW);this.app.setCanvasResolution(RESOLUTION_AUTO);
    this.camera=new Entity('Cámara de viaje');this.camera.addComponent('camera',{projection:PROJECTION_ORTHOGRAPHIC,orthoHeight:12/.93,nearClip:.1,farClip:250,clearColor:color('#8fa5a6')});this.camera.camera.toneMapping=TONEMAP_ACES;this.app.root.addChild(this.camera);this.buildFrame();
    this.sun=new Entity('Sol de Ohmdal');this.sun.addComponent('light',{type:'directional',color:color('#ffe6bc'),intensity:1.6,castShadows:true,shadowResolution:2048,shadowDistance:100,normalOffsetBias:.04,shadowBias:.2});this.sun.setEulerAngles(50,-35,0);this.app.root.addChild(this.sun);
    this.app.scene.ambientLight=color('#8eaaad');this.resize();this.assetsReady=this.loadArtAssets();
    this.destroy=()=>this.dispose();addEventListener('beforeunload',this.destroy,{once:true});
  }
  // HD-2D finish: depth of field focused on the player reads as tilt-shift on the tilted
  // orthographic view, with a soft bloom on lamps and water glints and a gentle vignette.
  buildFrame(){
    const f=this.frame=new CameraFrame(this.app,this.camera.camera);
    f.rendering.toneMapping=TONEMAP_ACES;f.rendering.samples=4;
    f.bloom.intensity=.018;f.bloom.blurLevel=12;
    f.vignette.intensity=.32;f.vignette.inner=.6;f.vignette.outer=1.35;f.vignette.curvature=.7;
    f.colorEnhance.enabled=true;f.colorEnhance.vibrance=.12;f.colorEnhance.shadows=.15;
    f.grading.enabled=true;this.grade=[...GRADES.morning];
    f.dof.enabled=true;f.dof.nearBlur=true;f.dof.focusDistance=57;f.dof.focusRange=12;f.dof.blurRadius=3.5;f.dof.blurRings=4;f.dof.blurRingPoints=5;f.dof.highQuality=true;
    f.update();
  }
  focusFrame(){
    if(!this.frame?.enabled||!this.player)return;
    const [ox,oz]=this.data.areas[this.area.id].offset,p=this.player.position,wanted=this.camera.getPosition().distance(new Vec3(p.x+ox,p.y+1,p.z+oz));
    const range=this.inspect||this.cinematic?16:this.area.id==='workshop'?18:12;
    if(Math.abs(wanted-this.frame.dof.focusDistance)>.05||range!==this.frame.dof.focusRange){this.frame.dof.focusDistance=wanted;this.frame.dof.focusRange=range;this.frame.update();}
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
      if(d.texture==='water'){makeWater(m);bindShore(m,shore,!b.dynamic,{lighthouse:1,lake:.6}[b.area]||0);this.waters.push(m);}
      if(d.texture==='ground')(this.grounds??=[]).push(makeGround(m,{shoreMap:shore,meadow:m.diffuseMap,cobble}));
      m.update();const mesh=new Mesh(this.app.graphicsDevice),attr=key=>new (key==='indices'?Uint32Array:Float32Array)(binary,b[key].offset,b[key].length);
      mesh.setPositions(attr('positions'));mesh.setNormals(attr('normals'));mesh.setUvs(0,attr('uvs'));mesh.setColors(attr('colors'));mesh.setIndices(attr('indices'));mesh.update();
      const instance=new MeshInstance(mesh,m,e);instance.castShadow=d.shadow&&d.opacity===1;instance.receiveShadow=true;e.addComponent('render',{meshInstances:[instance]});let parent=this.regions.get(b.area).root;
      if(b.owner&&!b.dynamic){if(!owners.has(b.owner)){const owner=new Entity(b.owner);parent.addChild(owner);owners.set(b.owner,owner);}parent=owners.get(b.owner);}
      parent.addChild(e);
      if(b.dynamic){e.setPosition(...b.dynamic.pivot);this.dynamics.push({...b.dynamic,area:b.area,entity:e,material:m,angle:0,progress:0,rotation:new Quat(),axle:new Vec3(...(b.dynamic.spinAxis||[0,0,1]))});}
      if(d.glass)this.glasses.push({area:b.area,material:m});
      if(d.crop)(this.crops??=[]).push({material:m,lush:m.diffuse.clone()});
      if(d.rock)makeRock(m);
      if(windKind(d.texture)&&!b.dynamic)(this.windy??=[]).push(makeWind(m,windKind(d.texture)));
      if(d.pane){m.diffuse=color('#5d7780');m.diffuseMap=paneTexture(this.app);m.gloss=.8;m.metalness=.1;m.update();}
      if(d.receiver)this.receivers.push({area:b.area,material:m,...d.receiver});
      if(++count%15===0){const text=document.getElementById('transition-name');if(text)text.textContent=`Tejiendo Ohmdal · ${Math.round(count/data.meshes.length*100)}%`;await new Promise(r=>setTimeout(r,0));}
    }
    // The far countryside continues behind the authored region surfaces.
    // Eastern slopes south of the lake, so the valley never ends in the clear colour.
    {const e=new Entity('Laderas del este'),m=new StandardMaterial();m.diffuse=color('#b5bba0');m.diffuseMap=await surface(this.app,'ground');m.diffuseMapTiling=new Vec2(37,78);m.update();e.addComponent('render',{type:'plane'});e.render.material=m;e.setPosition(122.5,-.15,-63);e.setLocalScale(155,1,326);this.regions.get('landscape').root.addChild(e);}
    for(const [z,depth] of [[-95,390]]){const e=new Entity('Laderas del reino');e.addComponent('render',{type:'plane'});const m=new StandardMaterial();m.diffuse=color('#b5bba0');m.diffuseMap=await surface(this.app,'ground');m.diffuseMapTiling=new Vec2(42,65);m.update();e.render.material=m;e.setPosition(-42.5,-.15,z);e.setLocalScale(175,1,depth);this.regions.get('landscape').root.addChild(e);}
    // Open sea to the horizon north of the Faro: the authored planes stop 20 m past the islet.
    {const e=new Entity('Mar abierto'),m=makeWater(new StandardMaterial());bindShore(m,shore,true,1);e.addComponent('render',{type:'plane'});e.render.material=m;e.render.castShadows=false;e.setPosition(75,-.45,-540);e.setLocalScale(760,1,530);this.regions.get('landscape').root.addChild(e);this.waters.push(m);}
    for(const [id,area] of Object.entries(AREAS))for(const object of area.objects.filter(o=>o.character&&o.character!=='ohm')){
      const a=await this.makeActor(object.character,object.x,object.z,id,object);this.allActors.push(a);this.regions.get(id).actors.push(a);
    }
    this.playerActor=await this.makeActor('player',0,0,'player');this.player=this.playerActor.g;this.ohmActor=await this.makeActor('ohm',-1,.7,'companion');this.ohm=this.ohmActor.g;
    this.sleeping=await this.makeActor('ohm',3.5,0,'portal');this.sleeping.g.position.y=1.1;
    for(const lamp of data.lights){const e=new Entity('Farol · '+lamp.area);e.addComponent('light',{type:'omni',color:color('#ffd399'),intensity:0,range:6,castShadows:false});e.setPosition(...lamp.position);this.regions.get(lamp.area).root.addChild(e);this.lights.push({area:lamp.area,entity:e});}
    this.buildAtmosphere();await this.buildLightEffects();this.buildFocusRing();this.buildBurst();await this.buildDust();this.app.start();
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
    if(preserve){let p=fromKingdom(area.id,global);const o=fromKingdom(area.id,companion);
      // A point walkable on one side of a boundary can sit in the other place's wall skin; step out of it.
      if(!this.canStand(...p))p=this.nearestWalkable(p);this.player.position.set(p[0],0,p[1]);this.ohm.position.set(o[0],0,o[1]);this.route=[];this.target=null;this.companionRoute=[];if(this.travelIntent===area.id){this.setTarget(area.spawn);this.travelIntent=null;}}
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
  // What the player stands on, for footsteps and dust: wood, stone paving or grass/earth.
  groundKind(){
    if(!this.area||!this.player)return 'stone';if(this.area.id==='workshop')return 'wood';
    const [x,z]=this.getPlayerPosition();if(this.area.id==='lake'&&Math.abs(x-9.2)<4.5&&Math.abs(z-3)<2.25)return 'wood';
    if(Math.abs(z)>this.area.bounds[1]/2-.2)return 'stone';
    return pointOnPaving(AREA_LAYOUTS[this.area.id],x,z)?'stone':'grass';
  }
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
  faceInhabitantSpeaker(s){faceInhabitantSpeaker(this,s);const a=this.speakerActor(s);if(a)this.speaking={actor:a,t:0};}
  speakerActor(s){if(!s||s==='narrator')return null;if(s==='player')return this.playerActor;if(s==='ohm'||s==='ohm_companion')return this.ohm.visible?this.ohmActor:null;return this.regions.get(this.area.id)?.actors.find(a=>a.name===s&&a.entity.enabled)||null;}
  endInhabitantConversation(){endInhabitantConversation(this);this.speaking=null;}
  updateFlags(state){this.state=state;if(this.area)this.obstacles=this.localObstacles(this.area.id);this.ohm&&(this.ohm.visible=!!state.flags.awaken);this.wakeOhm(state);this.signature=JSON.stringify([state.flags,state.puzzles]);for(const d of this.dynamics){if(d.kind==='visible')d.entity.enabled=!!(state.flags[d.flag]??state.flags[d.or]);if(d.kind==='indicator'){const active=!!state.flags[d.flag];d.material.emissive=color(active?'#62d7ae':'#675430');d.material.emissiveIntensity=active?1.1:.25;d.material.update();}if(d.receiver)d.feedback=readReceiverFeedback(d.area,state,d.receiver);}for(const r of this.receivers||[]){r.material.emissiveIntensity=r.intensity*readReceiverFeedback(r.area,state,r.object).level;r.material.update();}}
  // Ohm wakes where he slept: he stays on the pedestal through the scene, then hops down.
  wakeOhm(state){
    const awake=!!state.flags.awaken,was=this.ohmWasAwake;this.ohmWasAwake=awake;
    if(was!==false||!awake||this.area?.id!=='portal'||!this.sleeping)return;
    const p=this.sleeping.g.position;this.ohm.position.set(p.x,p.y,p.z);this.ohmHop={t:0,from:[p.x,p.y,p.z],to:this.nearestWalkable([p.x,p.z+1])};this.companionRoute=[];
  }
  setInspection(v){this.inspect=v;if(v){this.target=null;this.route=[];}}
  cameraPose(){const [ox,oz]=this.data.areas[this.area.id].offset;return {focus:[this.focus.x-ox,this.focus.y,this.focus.z-oz],offset:this.cameraOffset.toArray(),zoom:this.currentZoom};}
  startCinematic(id,{reducedMotion=false}={}){const p=this.area.objects.find(o=>o.puzzle===id);if(!p)return false;const timeline=createCinematic(id,{areaId:this.area.id,flags:this.state.flags,player:this.player.position.toArray(),companion:this.ohm.position.toArray(),puzzle:[p.x,1.4,p.z],bounds:this.area.bounds,start:this.cameraPose()},{reducedMotion});if(!timeline)return false;this.cinematic={timeline,elapsed:0};this.target=null;this.route=[];return true;}
  getCinematicState(){if(!this.cinematic)return null;return sampleCinematic(this.cinematic.timeline,this.cinematic.elapsed);}
  skipCinematic(){if(!this.cinematic)return false;this.cinematic={timeline:returningCinematic(this.cinematic.timeline.id,this.cameraPose(),gameplayCameraPose(this.area.id,this.player.position.toArray())),elapsed:0};return true;}
  cancelCinematic(){this.cinematic=null;this.inspect=false;this.route=[];this.target=null;if(!this.area||!this.player)return;const p=gameplayCameraPose(this.area.id,this.player.position.toArray()),[ox,oz]=this.data.areas[this.area.id].offset;this.focus.set(p.focus[0]+ox,p.focus[1],p.focus[2]+oz);this.cameraOffset.fromArray(p.offset);this.currentZoom=p.zoom;this.positionCamera();}
  endCinematic(){this.cancelCinematic();}
  // The moment an installation returns: a ring of light runs over the ground, sparks rise
  // from the object and the bloom swells, then everything settles over three seconds.
  playRestoration(id){
    this.updateFlags(this.state);this.restoration=3;
    const objects=(this.area?.objects||[]).filter(o=>!o.character&&o.kind!=='npc'),o=objects.find(o=>o.puzzle===id)||objects.find(o=>o.id===id||o.action?.flag===id)||objects.find(o=>o.flag===id);if(!o||!this.burst)return;
    const [ox,oz]=this.data.areas[this.area.id].offset,y=this.groundHeight(o.x,o.z);this.burst.origin=[o.x+ox,y,o.z+oz];this.burst.t=0;this.burst.root.enabled=true;
    this.burst.sparks.forEach((p,i)=>{p.angle=i*2.399;p.radius=.2+(i%7)*.12;p.speed=1.2+(i%5)*.35;p.delay=(i%10)*.05;});
  }
  buildBurst(){
    const root=new Entity('Restauración');root.enabled=false;this.app.root.addChild(root);
    const wm=this.focusRingMaterial.clone();wm.emissiveIntensity=3;wm.opacity=1;wm.update();const wave=new Entity('Onda');wave.addComponent('render',{type:'plane'});wave.render.material=wm;wave.render.castShadows=false;root.addChild(wave);
    const m=new StandardMaterial();m.diffuse=color('#000000');m.emissive=color('#ffd98f');m.emissiveIntensity=2.4;m.blendType=BLEND_ADDITIVEALPHA;m.opacity=.9;m.depthWrite=false;m.useLighting=false;m.update();
    const sparks=Array.from({length:36},()=>{const e=new Entity('Chispa');e.addComponent('render',{type:'sphere'});e.render.material=m;e.render.castShadows=false;root.addChild(e);return {entity:e};});
    this.burst={root,wave,sparks,t:9};
  }
  updateBurst(dt,reduced){
    const b=this.burst;if(!b||b.t>3.2)return;b.t+=dt;const t=b.t,[x,y,z]=b.origin;
    if(this.frame?.enabled){this.frame.bloom.intensity=.018+.045*Math.max(0,1-t/2.4)*Math.min(1,t*4);this.frame.update();}
    if(t>3.2){b.root.enabled=false;return;}
    const w=reduced?2.5:1.5+t*9,k=Math.max(0,1-t/1.6);b.wave.setPosition(x,y+.05,z);b.wave.setLocalScale(w*k+.001,1,w*k+.001);
    for(const p of b.sparks){const u=Math.max(0,t-p.delay),life=Math.max(0,1-u/2.4),r=p.radius+u*.35,s=reduced?0:.17*life*(.6+.4*Math.sin(u*9+p.angle)**2);
      p.entity.setPosition(x+Math.cos(p.angle+u*.8)*r,y+.4+u*p.speed,z+Math.sin(p.angle+u*.8)*r);p.entity.setLocalScale(s,s,s);}
  }
  positionCamera(){this.camera.setPosition(this.focus.x+this.cameraOffset.x*2,this.focus.y+this.cameraOffset.y*2,this.focus.z+this.cameraOffset.z*2);this.camera.lookAt(this.focus);this.camera.camera.orthoHeight=12/this.currentZoom;}
  syncActors(){
    const inside=this.area.id==='workshop';for(const a of [...this.allActors,this.playerActor,this.ohmActor,this.sleeping]){const active=a===this.playerActor||a===this.ohmActor,id=active?this.area.id:a.area,[ox,oz]=this.data.areas[id].offset,p=a.g.position;
      a.entity.enabled=a.g.visible&&(active||(inside?id==='workshop':id!=='workshop'))&&(a!==this.sleeping||!this.state.flags.awaken);
      a.entity.setPosition(p.x+ox,p.y,p.z+oz);
      // Idle breathing: feet stay planted (bottom pivot), each actor on its own phase.
      const breathe=this.state.settings?.reducedMotion||a.animation?.moving?0:Math.sin(this.clock*2.1+a.phase)*.014;a.entity.setLocalScale(1-breathe*.4,1+breathe,1);
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
    this.updateDust(dt,!!input.run&&this.walking&&!paused,reduced);
    this.updateCompanion(dt,paused,reduced);updateInhabitants(this,dt,state,{paused,reducedMotion:reduced});
    // Neighbours share time and state; errands continue without resetting at a boundary.
    for(const [id,r] of this.regions)if(id!==this.area.id&&id!=='landscape'&&r.actors.length&&Math.abs((KINGDOM[id]?.z||0)-(KINGDOM[this.area.id]?.z||0))<80){const ctx=this.context(id);updateInhabitants(ctx,dt,state,{paused,reducedMotion:reduced});}
    this.syncActors();this.speakingBounce(dt,reduced);this.updateFocusRing(dt,paused,reduced);this.updateBurst(dt,reduced);this.updateEnvironment(dt,reduced);const [ox,oz]=this.data.areas[this.area.id].offset;
    if(this.cinematic){this.cinematic.elapsed+=dt;const s=sampleCinematic(this.cinematic.timeline,this.cinematic.elapsed);this.focus.set(s.pose.focus[0]+ox,s.pose.focus[1],s.pose.focus[2]+oz);this.cameraOffset.fromArray(s.pose.offset);this.currentZoom=s.pose.zoom;if(s.done)this.cinematic=null;}
    else{const rest=gameplayCameraPose(this.area.id,p.toArray()),wanted=new Vec3(rest.focus[0]+ox,rest.focus[1],rest.focus[2]+oz);
      // Conversations: frame both speakers above the dialogue panel and lean in slightly.
      const talk=this.inhabitantConversation&&this.area.id!=='workshop'&&!this.inspect?this.speaking?.actor||this.speakerActor(this.inhabitantConversation.target):null;
      if(talk&&talk!==this.playerActor){const q=talk.g.position;wanted.set((p.x+q.x)/2+ox,1.5,(p.z+q.z)/2+2.4+oz);rest.zoom=1.1;}this.focus.lerp(this.focus,wanted,1-Math.exp(-dt*3.6));this.currentZoom+=((this.inspect?1.45:rest.zoom)-this.currentZoom)*(1-Math.exp(-dt*2.6));this.cameraOffset.lerp(this.cameraOffset,new Vec3(0,13.5,25),1-Math.exp(-dt*2.6));}
    this.positionCamera();this.focusFrame();
  }
  // The current speaker gives a small hop as each of their lines begins.
  speakingBounce(dt,reduced){const s=this.speaking;if(!s||reduced)return;s.t+=dt;if(s.t>.32)return;const e=s.actor.entity,pos=e.getPosition();e.setPosition(pos.x,pos.y+Math.sin(s.t/.32*Math.PI)*.12,pos.z);}
  // Running kicks up small puffs that swell and settle behind the player.
  async buildDust(){
    const texture=await surface(this.app,'glow'),m=new StandardMaterial();m.diffuse=color('#efe4c8');m.emissive=color('#6d6450');m.diffuseMap=texture;m.opacityMap=texture;m.opacityMapChannel='a';m.opacity=.7;m.blendType=BLEND_NORMAL;m.depthWrite=false;m.update();
    this.dust=Array.from({length:12},()=>{const e=new Entity('Polvo');e.addComponent('render',{type:'plane'});e.render.material=m;e.render.castShadows=false;e.enabled=false;this.app.root.addChild(e);return {entity:e,t:9};});this.dustClock=0;
  }
  updateDust(dt,running,reduced){
    if(!this.dust)return;const [ox,oz]=this.data.areas[this.area.id].offset;this.dustClock+=dt;
    if(running&&!reduced&&this.groundKind()!=='wood'&&this.dustClock>.11){this.dustClock=0;const d=this.dust.find(d=>d.t>.7);if(d){const p=this.player.position;d.t=0;d.x=p.x+ox+(Math.random()-.5)*.3;d.z=p.z+oz+.1+(Math.random()-.5)*.2;d.y=p.y+.06;d.entity.enabled=true;}}
    for(const d of this.dust){if(d.t>.7)continue;d.t+=dt;const k=d.t/.7,size=(.45+k*.9)*(1-k*k);d.entity.setPosition(d.x,d.y+.12+k*.25,d.z);d.entity.setLocalScale(size,1,size);if(d.t>.7)d.entity.enabled=false;}
  }
  updateCompanion(dt,paused,reduced){
    const o=this.ohm.position,p=this.player.position,old=[o.x,o.z],distance=Math.hypot(p.x-o.x,p.z-o.z);this.companionAge+=dt;
    if(this.ohmHop){if(paused)return this.animateActor(this.ohmActor,0,0,dt,{paused,reducedMotion:reduced});
      const h=this.ohmHop,k=Math.min(1,(h.t+=dt)/.55),ground=this.groundHeight(...h.to);o.x=h.from[0]+(h.to[0]-h.from[0])*k;o.z=h.from[2]+(h.to[1]-h.from[2])*k;o.y=ground+(h.from[1]-ground)*(1-k)+Math.sin(k*Math.PI)*.45;
      if(k>=1){o.y=ground;this.ohmHop=null;}return this.animateActor(this.ohmActor,0,.01,dt,{paused,reducedMotion:reduced});}
    if(!paused&&this.ohm.visible&&distance>1.4){if(this.companionAge>.7||!this.companionRoute.length){this.companionRoute=findPath(old,[p.x,p.z],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});this.companionAge=0;}while(this.companionRoute.length&&Math.hypot(this.companionRoute[0][0]-o.x,this.companionRoute[0][1]-o.z)<.12)this.companionRoute.shift();const q=this.companionRoute[0];if(q){const d=Math.hypot(q[0]-o.x,q[1]-o.z),step=Math.min(d,distance-1.15,7.5*dt),next=moveWithCollisions(old,[(q[0]-o.x)/d*step,(q[1]-o.z)/d*step],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});o.set(next[0],this.groundHeight(...next),next[1]);}}
    this.animateActor(this.ohmActor,o.x-old[0],o.z-old[1],dt,{paused,reducedMotion:reduced});
  }
  buildAtmosphere(){
    const m=new StandardMaterial();m.diffuse=color('#e8c994');m.emissive=color('#d6be82');m.emissiveIntensity=.65;m.blendType=BLEND_ADDITIVEALPHA;m.opacity=.26;m.depthWrite=false;m.update();this.motes=[];
    for(let i=0;i<45;i++){const e=new Entity('Polen en la luz');e.addComponent('render',{type:'sphere'});e.render.material=m;e.render.castShadows=false;e.setLocalScale(.025,.025,.025);this.app.root.addChild(e);this.motes.push({entity:e,phase:i*2.399,x:(i*7.33)%38-19,z:(i*11.27)%40-20,y:.4+(i%9)*.42});}
    // The restored Faro sweeps a soft wedge of light across land and sea.
    this.beacon=new Entity('Señal del Faro');const m2=new StandardMaterial(),ray=beamTexture(this.app);m2.diffuse=color('#000000');m2.emissive=color('#ffe3a8');m2.emissiveMap=ray;m2.opacityMap=ray;m2.opacityMapChannel='a';m2.emissiveIntensity=1.6;m2.opacity=.5;m2.blendType=BLEND_ADDITIVEALPHA;m2.depthWrite=false;m2.cull=CULLFACE_NONE;m2.useLighting=false;m2.update();this.beaconMaterial=m2;
    const sweep=new Entity('Haz');sweep.addComponent('render',{type:'plane'});sweep.render.material=m2;sweep.render.castShadows=false;sweep.setLocalPosition(32,0,0);sweep.setLocalScale(64,1,14);this.beacon.addChild(sweep);this.app.root.addChild(this.beacon);
  }
  // A soft golden ring on the ground under the object the player can use right now.
  buildFocusRing(){
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,34,64,64,62);
    g.addColorStop(0,'#ffe2a000');g.addColorStop(.35,'#ffe2a0ff');g.addColorStop(.55,'#ffe2a0aa');g.addColorStop(1,'#ffe2a000');x.fillStyle=g;x.fillRect(0,0,128,128);
    const t=new Texture(this.app.graphicsDevice,{width:128,height:128,format:PIXELFORMAT_RGBA8,mipmaps:true,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});t.setSource(c);
    const m=new StandardMaterial();m.diffuse=color('#000000');m.emissive=color('#ffd98f');m.emissiveMap=t;m.opacityMap=t;m.opacityMapChannel='a';m.emissiveIntensity=1.3;m.opacity=.6;m.blendType=BLEND_ADDITIVEALPHA;m.depthWrite=false;m.useLighting=false;m.update();
    this.focusRing=new Entity('Anillo de interacción');this.focusRing.addComponent('render',{type:'plane'});this.focusRing.render.material=m;this.focusRing.render.castShadows=false;this.focusRing.enabled=false;this.app.root.addChild(this.focusRing);this.focusRingMaterial=m;this.focusRingLevel=0;
  }
  updateFocusRing(dt,paused,reduced){
    if(!this.focusRing)return;const near=paused||this.cinematic?null:this.getNearby(),[ox,oz]=this.data.areas[this.area.id].offset;
    if(near&&near!==this.focusTarget){this.focusTarget=near;this.focusRingLevel=0;}
    this.focusRingLevel+=((near?1:0)-this.focusRingLevel)*Math.min(1,dt*8);
    this.focusRing.enabled=this.focusRingLevel>.02&&!!this.focusTarget;if(!this.focusRing.enabled){if(!near)this.focusTarget=null;return;}
    // Fade by scale: changing the material every frame is costly on slow devices.
    const o=this.focusTarget,size=(o.character?1.5:1.9)*(.6+.4*this.focusRingLevel)*(reduced?1:1+Math.sin(this.clock*3.2)*.06);
    this.focusRing.setPosition(o.x+ox,this.groundHeight(o.x,o.z)+.04,o.z+oz);this.focusRing.setLocalScale(size,1,size);
  }
  async buildLightEffects(){
    const texture=await surface(this.app,'glow');
    const contact=new StandardMaterial();contact.diffuse=color('#081817');contact.diffuseMap=texture;contact.opacityMap=texture;contact.opacityMapChannel='a';contact.opacity=.4;contact.blendType=BLEND_NORMAL;contact.depthWrite=false;contact.update();
    for(const actor of [...this.allActors,this.playerActor,this.ohmActor,this.sleeping]){const e=new Entity('Sombra de '+actor.name);e.addComponent('render',{type:'plane'});e.render.material=contact;e.render.castShadows=false;e.setLocalScale(actor.name==='ohm'?1.3:.95,1,.65);this.app.root.addChild(e);actor.shadow=e;}
    const glow=(name,position,scale,tint,parent)=>{const e=new Entity(name),m=new StandardMaterial();m.diffuse=color(tint);m.emissive=color(tint);m.emissiveIntensity=1.2;m.diffuseMap=texture;m.opacityMap=texture;m.opacityMapChannel='a';m.blendType=BLEND_ADDITIVEALPHA;m.depthWrite=false;m.cull=CULLFACE_NONE;m.update();e.addComponent('render',{type:'plane'});e.render.material=m;e.render.castShadows=false;e.setPosition(...position);e.setEulerAngles(62,0,0);e.setLocalScale(scale,1,scale);parent.addChild(e);return {entity:e,material:m};};
    {const e=new Entity('Superficie del Portal Ω');this.portalSurface=makePortalSurface(texture);e.addComponent('render',{type:'plane'});e.render.material=this.portalSurface;e.render.castShadows=false;e.setPosition(KINGDOM.portal.x,3.5,KINGDOM.portal.z-5.65);e.setEulerAngles(90,0,0);e.setLocalScale(5.5,1,5.5);this.regions.get('portal').root.addChild(e);}
    this.portalGlow=glow('La luz del Portal Ω',[KINGDOM.portal.x,2.8,KINGDOM.portal.z-5.45],5.2,'#73cbd3',this.regions.get('portal').root);
    this.lampGlows=[];for(const l of this.data.lights)this.lampGlows.push({...glow('Resplandor de farol',l.position,2.2,'#ffd092',this.regions.get(l.area).root),area:l.area});
    this.beaconGlow=glow('Cristal del Faro',[KINGDOM.lighthouse.x,18,KINGDOM.lighthouse.z-25.08],9,'#ffe2a7',this.regions.get('lighthouse').root);
    this.beaconLight=new Entity('Luz restaurada del Faro');this.beaconLight.addComponent('light',{type:'omni',range:55,color:color('#ffdf9f'),intensity:0});this.beaconLight.setPosition(KINGDOM.lighthouse.x,18,KINGDOM.lighthouse.z-25.08);this.regions.get('lighthouse').root.addChild(this.beaconLight);
  }
  updateEnvironment(dt,reduced){
    const f=this.state.flags,phase=journeyPhase(this.state),inside=this.area.id==='workshop',mix=1-Math.exp(-dt*.8);this.lampLevel??=phase.lamps;this.lampLevel+=(phase.lamps-this.lampLevel)*mix;
    const n=this.lampLevel;if(this.wasInside!==inside){this.wasInside=inside;if(inside)this.camera.camera.clearColor=color('#000000');}this.sun.light.intensity+=((inside?.85:phase.intensity*.5)-this.sun.light.intensity)*mix;this.sun.light.color.lerp(this.sun.light.color,color(phase.sun),mix);this.app.scene.ambientLight.lerp(this.app.scene.ambientLight,color(inside?'#7c7967':n>.7?'#687f9b':'#92a7a0'),mix);this.camera.camera.clearColor.lerp(this.camera.camera.clearColor,color(inside?'#000000':phase.sky),mix);
    // A place nobody has restored yet is literally dimmer: muted and cool. Its colour floods
    // back with the restoration, and crossing into a forgotten place drains it again.
    const alive=inside||f[power[this.area.id]]?1:0;this.vitality??=alive;
    this.restoration=Math.max(0,(this.restoration||0)-dt);this.vitality+=(alive-this.vitality)*Math.min(1,dt*(this.restoration>0?.75:alive?.5:1.2));const v=this.vitality;
    if(this.frame?.enabled){const base=GRADES[inside?'inside':phase.id]||GRADES.morning,g=this.grade,target=[base[0]*(.58+.42*v),base[1]*(.94+.06*v),base[2]*(.97+.03*v),base[3]*(1.05-.05*v),base[4]*(.93+.07*v)];let moved=0;for(let i=0;i<5;i++){const d=(target[i]-g[i])*mix;g[i]+=d;moved+=Math.abs(d);}
      if(moved>.0005||!this.gradeApplied){this.gradeApplied=true;const f=this.frame.grading;f.saturation=g[0];f.tint=new Color(g[1],g[2],g[3]);f.brightness=g[4];this.frame.update();}}
    for(const light of this.lights){const active=f[power[light.area]]||f.beacon_lens;light.entity.light.intensity=active?(light.area==='workshop'?1.6:n*2.2):0;}
    for(const glow of this.lampGlows||[]){const active=f[power[glow.area]]||f.beacon_lens;glow.entity.enabled=!!active&&(glow.area==='workshop'||n>.01);glow.material.opacity=(glow.area==='workshop'?.4:n*.42)*(reduced?1:.97+Math.sin(this.clock*1.8)*.03);glow.material.update();}
    this.portalSurface?.setParameter('uPortalTime',reduced?0:this.clock);
    if(this.portalGlow){this.portalGlow.material.opacity=.14+(reduced?0:Math.sin(this.clock*.9)*.04);this.portalGlow.material.update();}
    if(this.beaconGlow){this.beaconGlow.entity.enabled=!!f.beacon_lens;this.beaconLight.light.intensity=f.beacon_lens?1.5+2.2*n:0;}
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
    // Clouds only cast shadows under a real sun: none indoors or at night.
    updateClouds(this.grounds||[],reduced?0:this.clock,inside?0:.36*(1-n)*Math.min(1,this.sun.light.intensity));
    updateWind(this.windy||[],this.clock,reduced);
    for(const p of this.motes){p.entity.enabled=!reduced&&(!inside||Math.abs(p.x)<11&&p.z<16);p.entity.setPosition(this.focus.x+p.x+Math.sin(this.clock*.2+p.phase)*.5,p.y+Math.sin(this.clock*.6+p.phase)*.15,this.focus.z+p.z);}
    this.beacon.enabled=!!f.beacon_lens&&!inside;const a=this.clock*(reduced?.05:.18);this.beacon.setPosition(KINGDOM.lighthouse.x,17.2,KINGDOM.lighthouse.z-25.08);this.beacon.setEulerAngles(0,-a*57.3,0);this.beaconMaterial.opacity=.1+.5*n;this.beaconMaterial.update();
  }
  resize(){const low=this.state.settings?.quality==='low';this.app.graphicsDevice.maxPixelRatio=Math.min(devicePixelRatio,low?1:1.7);this.app.resizeCanvas();if(this.sun)this.sun.light.castShadows=!low;if(this.frame)this.frame.enabled=!low;}
  dispose(){if(this.disposed)return;this.disposed=true;removeEventListener('beforeunload',this.destroy);this.app.destroy();}
}
