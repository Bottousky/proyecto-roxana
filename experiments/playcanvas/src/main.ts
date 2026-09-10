import {Application,Entity,Mesh,MeshInstance,StandardMaterial,Color,Vec3,Vec2,Script,Sprite,PROJECTION_ORTHOGRAPHIC,FILLMODE_FILL_WINDOW,RESOLUTION_AUTO,CULLFACE_NONE,CULLFACE_BACK,BLEND_NORMAL,TONEMAP_ACES} from 'playcanvas';
import {surface,actorArt} from './art';
import {findPath} from './navigation.js';
import {moveWithCollisions,isPositionClear} from './collision.js';
import {advanceActor,idleActor} from './actor-animation.js';
import {isSliceLand} from './rules';
import sceneUrl from './data/scene.json?url';
import './style.css';
type Point=[number,number];type Obstacle={x:number,z:number,w:number,d:number,id?:string};
type Actor={entity:Entity,name:string,area:string,animation:SpriteAnimator};
type Batch={area:string,owner?:string,material:{texture?:string,color:string,emissive:string,emission:number,alpha:number,opacity:number,double:boolean,unlit:boolean,shadow:boolean},positions:number[],normals:number[],uvs:number[],colors:number[],indices:number[]};
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id)! as T;
const canvas=$<HTMLCanvasElement>('world'),options=$<HTMLDialogElement>('options'),held=new Set<string>();
const SAVE='ohmdal-playcanvas-slice-v1',app=new Application(canvas,{graphicsDeviceOptions:{alpha:false,antialias:true}});
app.graphicsDevice.maxPixelRatio=Math.min(devicePixelRatio,1.7);app.setCanvasFillMode(FILLMODE_FILL_WINDOW);app.setCanvasResolution(RESOLUTION_AUTO);
app.scene.ambientLight=new Color(.58,.64,.59);
const camera=new Entity('Orthographic travel camera');camera.addComponent('camera',{projection:PROJECTION_ORTHOGRAPHIC,orthoHeight:12/.93,nearClip:.1,farClip:240,clearColor:new Color(.22,.33,.31)});app.root.addChild(camera);
camera.camera!.toneMapping=TONEMAP_ACES;
const sun=new Entity('Sol de Ohmdal');sun.addComponent('light',{type:'directional',color:new Color(1,.92,.74),intensity:1.6,castShadows:true,shadowResolution:2048,shadowDistance:100,normalOffsetBias:.04,shadowBias:.2});sun.setEulerAngles(50,-35,0);app.root.addChild(sun);
const outdoor=new Entity('Ohmdal · exterior continuo'),indoor=new Entity('Taller · interior');app.root.addChild(outdoor);app.root.addChild(indoor);indoor.enabled=false;
let inside=false,night=false,ready=false,route:number[][]=[],companionRoute:number[][]=[],companionAge=0,tour:Point[]=[],tourIndex=0,tourRunning=false,dialogueIndex=0,dialogueLines:string[]=[],frames:number[]=[],worst=0,slow=0,last=performance.now(),loadMs=0,elapsed=0;
let player:Actor,ohm:Actor,obstacles:Obstacle[]=[],indoorObstacles:Obstacle[]=[],actors:Actor[]=[],waters:StandardMaterial[]=[],spawn:Point=[0,10],savedInside=false,drawCalls=0,crossings=0,lastArea='plaza';
const focus=new Vec3(0,1.5,4.5),look=new Vec3(),position=new Vec3();
class SpriteAnimator extends Script{
  state=idleActor();isOhm=false;
  animate(dx:number,dz:number,dt:number){this.state=advanceActor(this.state,dx,dz,dt);const {direction,frame,phase}=this.state;this.entity.sprite!.frame=direction*(this.isOhm?6:5)+(this.isOhm?(frame?Math.floor(phase*1.5)%6:0):frame);}
}
const sprites=new Map<string,Sprite>();
async function makeActor(name:string,x:number,z:number,area:string){
  if(!sprites.has(name))sprites.set(name,await actorArt(app,name));
  const e=new Entity(name);e.addComponent('sprite',{type:'simple',sprite:sprites.get(name),frame:0});e.sprite!.material=e.sprite!.material.clone();e.sprite!.material.depthWrite=true;e.sprite!.material.alphaTest=.22;e.setEulerAngles(-28.37,0,0);e.setPosition(x,.055,z);app.root.addChild(e);e.addComponent('script');const animation=e.script!.create(SpriteAnimator) as unknown as SpriteAnimator;animation.isOhm=name==='ohm';return {entity:e,name,area,animation};
}
function currentObstacles(){return inside?indoorObstacles:obstacles;}
function land(x:number,z:number){
  return isSliceLand(inside,x,z);
}
function point(e:Entity):Point{const p=e.getPosition();return [p.x,p.z];}
function go(target:Point){route=findPath(point(player.entity),target,[64,144],currentObstacles(),{radius:.34,cell:.6,isWalkable:land});}
function safe(p:Point){return isPositionClear(p,[64,144],currentObstacles(),{radius:.34,isWalkable:land});}
function save(){if(!ready)return;try{localStorage.setItem(SAVE,JSON.stringify({version:1,position:point(player.entity),inside,night}));}catch{$('objective').textContent='El navegador no permite guardar esta prueba.';}}
function changeInterior(value:boolean){inside=value;outdoor.enabled=!value;indoor.enabled=value;route=[];companionRoute=[];tourRunning=false;const p:Point=value?[0,9.6]:[-13.25,8.1];player.entity.setPosition(p[0],.055,p[1]);ohm.entity.setPosition(p[0]-.8,.055,p[1]+.4);focus.set(p[0],value?0:1.5,p[1]-5.5);refreshActors();lighting();save();}
function refreshActors(){for(const a of actors)a.entity.enabled=inside?a.area==='workshop':a.area!=='workshop';}
function lighting(){app.scene.ambientLight.set(night?.26:.58,night?.35:.64,night?.47:.59);sun.light!.intensity=inside?.9:night?.4:1.6;sun.light!.color=night?new Color(.58,.73,1):new Color(1,.92,.74);$('hour').textContent=night?'☾ Noche · prueba de luz':'☀ Mañana · Día 1';}
const words:Record<string,string[]>={lumen:['Primero, la mesa despejada. Después, las manos quietas. Cada cosa en su lugar.','Traé tu pregunta. La receta nos ayuda a empezar; entenderla lleva un poco más.'],edda:['El agua sigue hacia la Puerta de Ohm. Creo que ese recorrido puede decirnos algo.','Creo, dije. Prefiero mirar de cerca antes de darlo por cierto.'],marin:['El pan no espera a que uno termine de hacerse preguntas. Pero siempre queda un rato para escuchar.'],tala:['Estoy juntando preguntas. Las respuestas ocupan más lugar del que parece.']};
const names:Record<string,string>={lumen:'Maese Lumen',edda:'Edda',marin:'Marín',tala:'Tala'};
function talk(a:Actor){route=[];tourRunning=false;held.clear();dialogueLines=words[a.name]||[];dialogueIndex=0;$('speaker').textContent=names[a.name]||a.name;const main=a.name==='lumen'||a.name==='edda';$('portrait').style.backgroundSize='300% 100%';$('portrait').style.backgroundImage=`url('/assets/art-polish/portraits-${main?'main':'village'}.png')`;$('portrait').style.backgroundPosition=`${a.name==='edda'?0:a.name==='tala'?100:50}% 0`;showLine();}
function showLine(){const line=dialogueLines[dialogueIndex];$('dialogue').hidden=!line;if(line)$('line').textContent=line;else{canvas.focus();save();}}
type Interaction={label:string,run:()=>void};
function nearby():Interaction|null{
  const [x,z]=point(player.entity);
  if(inside&&Math.hypot(x,z-10)<2.2)return {label:'E · Volver a la Plaza',run:()=>changeInterior(false)};
  if(!inside&&Math.hypot(x+13.25,z-8)<2.3)return {label:'E · Entrar al taller de Lumen',run:()=>changeInterior(true)};
  const a=actors.filter(a=>a.entity.enabled).sort((a,b)=>a.entity.getPosition().distance(player.entity.getPosition())-b.entity.getPosition().distance(player.entity.getPosition()))[0];
  if(a&&a.entity.getPosition().distance(player.entity.getPosition())<3)return {label:'E · Hablar con '+names[a.name],run:()=>talk(a)};
  if(!inside&&z< -49&&Math.abs(x-6)<8)return {label:'E · Puerta de Ohm',run:()=>{dialogueLines=['Hasta aquí llega esta prueba del recorrido. La Puerta conserva su escala y sus obstáculos; el circuito completo sigue en la versión principal.'];dialogueIndex=0;$('speaker').textContent='La Calzada';$('portrait').style.backgroundImage="url('/assets/art-polish/portrait-ohm.png')";$('portrait').style.backgroundSize='cover';showLine();}};
  return null;
}
function closeOptions(){options.close();held.clear();canvas.focus();}
$('menu').onclick=()=>{held.clear();options.showModal();};$('resume').onclick=closeOptions;$('light').onclick=()=>{night=!night;lighting();save();};$('metrics-toggle').onclick=()=>{$('metrics').hidden=!$('metrics').hidden;};
$('route').onclick=()=>{closeOptions();if(inside)changeInterior(false);go([0,8.5]);tour=[[0,8.5],[0,-12],[6,-38],[3.5,-44],[6,-38],[0,-12],[0,8.5]];tourIndex=0;tourRunning=true;frames=[];worst=0;slow=0;crossings=0;last=performance.now();$('metrics').hidden=false;};
$('workshop-route').onclick=()=>{closeOptions();if(!inside)go([-13.25,8.1]);};$('interact').onclick=()=>nearby()?.run();$('next').onclick=()=>{dialogueIndex++;showLine();};
function keydown(e:KeyboardEvent){const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();if(key==='escape'){if(!$('dialogue').hidden){dialogueIndex=dialogueLines.length;showLine();}else if(options.open)closeOptions();else options.showModal();held.clear();return;}if(e.repeat&&key==='e')return;if(key==='e'&&!options.open&&$('dialogue').hidden){nearby()?.run();return;}held.add(key);}
function keyup(e:KeyboardEvent){held.delete(e.key.toLowerCase());}
function blur(){held.clear();save();}
function resize(){app.resizeCanvas();}
function click(e:PointerEvent){if(!ready||options.open||!$('dialogue').hidden)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,a=camera.camera!.screenToWorld(x,y,0),b=camera.camera!.screenToWorld(x,y,150),t=-a.y/(b.y-a.y);tourRunning=false;go([a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t]);}
addEventListener('keydown',keydown);addEventListener('keyup',keyup);addEventListener('blur',blur);addEventListener('resize',resize);canvas.addEventListener('pointerdown',click);
document.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(button=>{button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(button.dataset.key!);};button.onpointerup=button.onpointercancel=()=>{held.delete(button.dataset.key!);};});
async function boot(){
  const begin=performance.now(),data=await fetch(sceneUrl).then(r=>{if(!r.ok)throw new Error('No se pudo cargar el escenario');return r.json();});
  obstacles=[...data.areas.plaza.obstacles,...data.areas.road.obstacles];indoorObstacles=data.areas.workshop.obstacles;
  const needed=[...new Set<string>((data.meshes as Batch[]).flatMap(m=>m.material.texture?[m.material.texture]:[]))];for(const name of needed)await surface(app,name);
  const valley=new Entity('Continuidad del terreno');valley.addComponent('render',{type:'plane'});const turf=new StandardMaterial();turf.diffuse=new Color().fromString('#c1c9a9');turf.diffuseMap=await surface(app,'ground');turf.diffuseMapTiling=new Vec2(25,25);turf.update();valley.render!.material=turf;valley.setPosition(0,-.09,-20);valley.setLocalScale(150,1,150);outdoor.addChild(valley);
  const owners=new Map<string,Entity>();let n=0;for(const b of data.meshes as Batch[]){
    const entity=new Entity(`${b.area} · material ${n}`),material=new StandardMaterial(),d=b.material;
    material.diffuse=new Color().fromString('#'+d.color);material.emissive=new Color().fromString('#'+d.emissive);material.emissiveIntensity=d.emission;material.shininess=15;material.useMetalness=true;material.metalness=0;material.diffuseVertexColor=true;material.alphaTest=d.alpha;material.opacity=d.opacity;material.cull=d.double?CULLFACE_NONE:CULLFACE_BACK;
    if(d.texture){material.diffuseMap=await surface(app,d.texture);if(d.alpha){material.opacityMap=material.diffuseMap;material.opacityMapChannel='a';}}
    if(d.opacity<1){material.blendType=BLEND_NORMAL;material.depthWrite=false;}
    if(d.texture==='water'){material.diffuse.set(.8,1,1);material.diffuseMapTiling=new Vec2(3,10);waters.push(material);}
    material.update();const mesh=new Mesh(app.graphicsDevice);mesh.setPositions(b.positions);mesh.setNormals(b.normals);mesh.setUvs(0,b.uvs);mesh.setColors(b.colors);mesh.setIndices(b.indices);mesh.update();const instance=new MeshInstance(mesh,material,entity);instance.castShadow=d.shadow&&d.opacity===1;instance.receiveShadow=true;entity.addComponent('render',{meshInstances:[instance]});let parent=b.area==='workshop'?indoor:outdoor;if(b.owner){if(!owners.has(b.owner)){const owner=new Entity(b.owner);parent.addChild(owner);owners.set(b.owner,owner);}parent=owners.get(b.owner)!;}parent.addChild(entity);
    $('loading-text').textContent=`Preparando el recorrido · ${Math.round(++n/data.meshes.length*100)}%`;if(n%10===0)await new Promise(r=>setTimeout(r,0));
  }
  for(const a of data.actors)actors.push(await makeActor(a.name,a.x,a.z,a.area));
  try{const s=JSON.parse(localStorage.getItem(SAVE)||'null');if(s?.version===1&&Array.isArray(s.position)&&s.position.length===2&&s.position.every(Number.isFinite)){spawn=s.position;savedInside=!!s.inside;night=!!s.night;}}catch{/* Keep the default spawn if the isolated save is unavailable. */}
  inside=savedInside;outdoor.enabled=!inside;indoor.enabled=inside;if(!safe(spawn))spawn=inside?[0,9.6]:[0,10];
  player=await makeActor('player',...spawn,'player');ohm=await makeActor('ohm',spawn[0]-.8,spawn[1]+.5,'companion');focus.set(spawn[0],inside?0:1.5,spawn[1]-5.5);refreshActors();lighting();
  // Submit both static sets while the curtain is still up, so entering the workshop
  // doesn't introduce its materials for the first time during play.
  outdoor.enabled=true;indoor.enabled=true;camera.setPosition(focus.x,focus.y+27,focus.z+50);camera.lookAt(focus);app.start();
  await new Promise(r=>setTimeout(r,350));outdoor.enabled=!inside;indoor.enabled=inside;
  loadMs=performance.now()-begin;ready=true;last=performance.now();$('loading').hidden=true;$('loading').style.display='none';canvas.focus();
}
function update(rawDt:number){
  if(!ready)return;const now=performance.now(),ms=now-last;last=now;const dt=Math.min(rawDt,.05);elapsed+=dt;frames.push(ms);if(frames.length>600)frames.shift();worst=Math.max(worst,ms);if(ms>50)slow++;
  const paused=options.open||!$('dialogue').hidden;let dx=0,dz=0;
  if(!paused){dx=Number(held.has('d')||held.has('arrowright'))-Number(held.has('a')||held.has('arrowleft'));dz=Number(held.has('s')||held.has('arrowdown'))-Number(held.has('w')||held.has('arrowup'));
    if(dx||dz){route=[];tourRunning=false;}
    if(tourRunning&&!route.length){if(tourIndex>=tour.length){tourRunning=false;$('objective').textContent='Recorrido completado · Plaza ↔ Calzada';}else go(tour[tourIndex++]);}
    const p=point(player.entity);if(!dx&&!dz&&route.length){const target=route[0],x=target[0]-p[0],z=target[1]-p[1],dist=Math.hypot(x,z);if(dist<.13)route.shift();else{dx=x/dist;dz=z/dist;}}
    const length=Math.hypot(dx,dz),speed=held.has('shift')||tourRunning?6.2:3.4;if(length){dx=dx/length*speed*dt;dz=dz/length*speed*dt;const next=moveWithCollisions(p,[dx,dz],[64,144],currentObstacles(),{radius:.34,isWalkable:land});dx=next[0]-p[0];dz=next[1]-p[1];player.entity.setPosition(next[0],.055,next[1]);}
    const o=point(ohm.entity),pp=point(player.entity),distance=Math.hypot(pp[0]-o[0],pp[1]-o[1]);companionAge+=dt;
    if(distance>1.3){
      if(companionAge>.8||!companionRoute.length){companionRoute=findPath(o,pp,[64,144],currentObstacles(),{radius:.25,cell:.6,isWalkable:land});companionAge=0;}
      while(companionRoute.length&&Math.hypot(companionRoute[0][0]-o[0],companionRoute[0][1]-o[1])<.12)companionRoute.shift();
      const goal=companionRoute[0]||pp,d=Math.hypot(goal[0]-o[0],goal[1]-o[1]),step=Math.min(d,distance-1.1,5.6*dt),delta:Point=d>0?[(goal[0]-o[0])/d*step,(goal[1]-o[1])/d*step]:[0,0],next=moveWithCollisions(o,delta,[64,144],currentObstacles(),{radius:.25,isWalkable:land});ohm.entity.setPosition(next[0],.055,next[1]);ohm.animation.animate(next[0]-o[0],next[1]-o[1],dt);
    }else{companionRoute=[];ohm.animation.animate(0,0,dt);}
  }
  player.animation.animate(dx,dz,dt);if(paused)ohm.animation.animate(0,0,dt);
  const p=player.entity.getPosition();look.set(p.x,inside?0:1.5,p.z-5.5);focus.lerp(focus,look,1-Math.exp(-dt*3.6));position.set(focus.x,focus.y+27,focus.z+50);camera.setPosition(position);camera.lookAt(focus);sun.setPosition(focus.x-12,28,focus.z+7);
  const area=inside?'workshop':p.z< -24?'road':'plaza';if(area!==lastArea){crossings++;lastArea=area;save();}$('place').textContent=inside?'El taller de Lumen':area==='road'?'La Calzada':'Plaza de Ohm';
  const interaction=paused?null:nearby();$('interact').hidden=!interaction;if(interaction)$('interact').textContent=interaction.label;
  for(const mat of waters)mat.diffuseMapOffset=new Vec2(0,elapsed*.008);
  if(Math.floor(elapsed*2)!==Math.floor((elapsed-dt)*2)){const sorted=[...frames].sort((a,b)=>a-b);drawCalls=app.stats.drawCalls.total;$('metrics').textContent=`PlayCanvas ${app.graphicsDevice.deviceType}\nCarga: ${(loadMs/1000).toFixed(2)} s\nCuadro p99: ${Math.round(sorted[Math.floor(sorted.length*.99)]||0)} ms\nMáximo: ${Math.round(worst)} ms · >50 ms: ${slow}\nDibujados: ${drawCalls} · Cruces: ${crossings}\nPosición: ${p.x.toFixed(1)}, ${p.z.toFixed(1)}\nSuelo: ${safe(point(player.entity))?'seguro':'COLISIÓN'}\n${tourRunning?'Recorrido en curso':route.length?'Caminando':'En reposo'}\nEscala: ${(canvas.width/canvas.clientWidth).toFixed(2)}×`;}
  if(Math.floor(elapsed/5)!==Math.floor((elapsed-dt)/5))save();
}
app.on('update',update);addEventListener('beforeunload',()=>{save();removeEventListener('keydown',keydown);removeEventListener('keyup',keyup);removeEventListener('resize',resize);removeEventListener('blur',blur);canvas.removeEventListener('pointerdown',click);app.off('update',update);app.destroy();},{once:true});
boot().catch(error=>{$('loading-text').textContent='No se pudo abrir la prueba: '+error.message;console.error(error);});


