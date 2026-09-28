import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { findPath } from './navigation.js';
import { buildArchitecture } from './architecture.js';
import { buildFountain, buildCuriosity as buildLandmark } from './landmarks.js';
import { AREA_LAYOUTS, pointOnPaving, lakeShoreX } from './world-layout.js';
import { buildPaving, buildPlayableBoundary } from './world-ground.js';
import { buildSpringWaterworks, buildLighthouseIslet } from './world-waterworks.js';
import { moveWithCollisions, isPositionClear, isSegmentClear } from './collision.js';
import { HUMAN_ACTORS, ACTOR_ATLAS, idleActor, advanceActor, opaqueBounds, actorFrameLayout, isolateFigure } from './actor-animation.js';
import { createCinematic, sampleCinematic, returningCinematic, gameplayCameraPose } from './cinematics.js';
import { isMechanicalControl, readControlFeedback, readReceiverFeedback, worldFeedbackSignature } from './world-feedback.js';
import { buildGateway } from './world-gateway.js';
import { initializeInhabitants, updateInhabitants, getInhabitantInteractions, beginInhabitantConversation, faceInhabitantSpeaker, endInhabitantConversation } from './world-inhabitants.js';
import {describeWorldAudio} from './world-audio.js';
import {inInteractionReach,approachInteraction} from './world-interaction.js';
import {inTravelCorridor,travelBounds,inKingdomWater,ROAD_CANAL_X} from './kingdom-geography.js';
import {conductorTarget,WATER_HANDLES} from './installation-art.js';
import {waterVertex,waterFragment} from './water-art.js';
import {buildGardenArt} from './environment-art.js';
import {updateDaylight} from './world-time.js';

const UP = new THREE.Vector3(0, 1, 0);
const PALETTES = {
  portal: { sky: '#617e91', fog: '#718c98', grass: '#566e54', sun: '#ffdbad', stone: '#9a9a80' },
  plaza: { sky: '#89a7ac', fog: '#8ca6a2', grass: '#6c8050', sun: '#ffe0a4', stone: '#b6a782' },
  workshop: { sky: '#293b43', fog: '#45565a', grass: '#534b3b', sun: '#ffbc6b', stone: '#a39780' },
  road: { sky: '#77959d', fog: '#80989a', grass: '#668044', sun: '#ffdb9e', stone: '#a9a180' },
  spring: { sky: '#6d9099', fog: '#729b9c', grass: '#4b7d5a', sun: '#dcf4ba', stone: '#9caa91' },
  castle: { sky: '#788c9d', fog: '#84959d', grass: '#586e51', sun: '#ffdaa7', stone: '#adb0a0' },
  terraces: { sky: '#b4aba0', fog: '#abae9a', grass: '#829049', sun: '#ffce81', stone: '#b8a583' },
  lake: { sky: '#788c9f', fog: '#7896a5', grass: '#5a7861', sun: '#ffd4a0', stone: '#a5a28c' },
  lighthouse: { sky: '#344e69', fog: '#4f7185', grass: '#537668', sun: '#ffd2a0', stone: '#a9b3a8' },
};

function seeded(seed) {
  let n = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 17);
  return () => { n |= 0; n = n + 0x6D2B79F5 | 0; let t = Math.imul(n ^ n >>> 15, 1 | n); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function canvasTexture(size, draw, repeat = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 8;
  return t;
}

function textureSet() {
  const rand = seeded('Ohmdal masonry');
  const stone = canvasTexture(512, (c, s) => {
    c.fillStyle = '#554f42'; c.fillRect(0, 0, s, s);
    for (let y = 0; y < 8; y++) for (let x = -1; x < 8; x++) {
      const px = x * 72 + (y % 2) * 36, py = y * 64;
      const v = 125 + Math.floor(rand() * 40); c.fillStyle = `rgb(${v + 8},${v + 3},${v - 10})`;
      c.beginPath(); c.roundRect(px + 2, py + 2, 69, 60, 4); c.fill();
      c.fillStyle = 'rgba(255,241,212,.18)'; c.fillRect(px + 5, py + 4, 63, 2);
      c.fillStyle = 'rgba(27,33,27,.2)'; c.fillRect(px + 5, py + 58, 63, 3);
      for (let k = 0; k < 65; k++) { const a = rand() * .14; c.fillStyle = `rgba(15,28,18,${a})`; c.fillRect(px + rand() * 68, py + rand() * 60, rand() * 8, 1 + rand() * 3); }
    }
  }, 2);
  const wood = canvasTexture(256, (c,s) => {
    c.fillStyle = '#8b7150'; c.fillRect(0,0,s,s);
    for(let i=0;i<900;i++){ c.strokeStyle = `rgba(${rand()>.5?'39,23,16':'225,196,146'},${rand()*.22})`; c.beginPath(); const x=rand()*s,y=rand()*s; c.moveTo(x,y); c.bezierCurveTo(x+4,y+20,x-3,y+40,x+rand()*8-4,y+rand()*150); c.stroke(); }
    for(let i=0;i<4;i++){c.fillStyle='#43382c';c.fillRect(i*64,0,2,s);}
  });
  const roof = canvasTexture(256, (c,s)=>{
    c.fillStyle='#283b41';c.fillRect(0,0,s,s);
    for(let y=0;y<8;y++)for(let x=-1;x<9;x++){const px=x*32+(y%2)*16,py=y*32;const v=Math.floor(54+rand()*35); c.fillStyle=`rgb(${v},${v+20},${v+21})`;c.beginPath();c.roundRect(px+1,py,30,33,[0,0,12,12]);c.fill();c.strokeStyle='#8a9d96';c.globalAlpha=.25;c.stroke();c.globalAlpha=1;}
  }, 3);
  const ground = canvasTexture(512, (c,s)=>{
    c.fillStyle='#75806a';c.fillRect(0,0,s,s);
    for(let i=0;i<18000;i++){const light=rand()>.5;c.fillStyle=light?'rgba(224,219,161,.075)':'rgba(25,52,34,.09)';c.fillRect(rand()*s,rand()*s,1+rand()*9,1+rand()*5);}
  }, 12);
  const cobble = canvasTexture(512,(c,s)=>{
    c.fillStyle='#686854';c.fillRect(0,0,s,s);
    for(let y=0;y<13;y++)for(let x=-1;x<12;x++){const px=x*47+(y%2)*23,py=y*40,v=125+rand()*50;c.fillStyle=`rgb(${v+12},${v+7},${v-9})`;c.beginPath();c.roundRect(px+2+rand()*2,py+2,42,35,6);c.fill();c.strokeStyle='rgba(229,224,196,.23)';c.stroke();}
  }, 4);
  const glow = canvasTexture(128,(c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.16,'rgba(255,248,204,.9)');g.addColorStop(.45,'rgba(255,205,116,.18)');g.addColorStop(1,'rgba(255,188,89,0)');c.fillStyle=g;c.fillRect(0,0,s,s);});
  const foliage=canvasTexture(256,(c,s)=>{
    const branches=[];c.strokeStyle='#626b3d';c.lineWidth=2;
    for(let i=0;i<21;i++){const angle=i*2.4,r=35+rand()*66,x=128+Math.cos(angle)*r,y=136+Math.sin(angle)*r;c.beginPath();c.moveTo(128,158);c.quadraticCurveTo(120+(x-128)*.5,145+(y-145)*.5,x,y);c.stroke();branches.push([x,y]);}
    for(let i=0;i<640;i++){const b=branches[Math.floor(rand()*branches.length)],x=b[0]+(rand()-.5)*55,y=b[1]+(rand()-.5)*46;const v=80+rand()*75;c.fillStyle=`rgb(${v+13},${v+34},${v*.63})`;c.save();c.translate(x,y);c.rotate(rand()*6);c.beginPath();c.ellipse(0,0,2.5+rand()*4.5,1.5+rand()*2.5,0,0,Math.PI*2);c.fill();if(i%4===0){c.strokeStyle='rgba(220,222,133,.36)';c.lineWidth=.8;c.beginPath();c.moveTo(-3,0);c.lineTo(3,0);c.stroke();}c.restore();}
  });
  const fern=canvasTexture(128,(c,s)=>{c.strokeStyle='#536d43';c.lineWidth=2;for(let k=0;k<9;k++){const a=-Math.PI*.95+k*Math.PI*.115,endX=64+Math.cos(a)*55,endY=102+Math.sin(a)*90;c.beginPath();c.moveTo(64,120);c.quadraticCurveTo(64,82,endX,endY);c.stroke();for(let j=1;j<10;j++){const f=j/10,x=64+(endX-64)*f,y=120+(endY-120)*f,w=(1-f)*15;c.fillStyle=k%2?'#91a773':'#638c58';for(const side of [-1,1]){c.beginPath();c.ellipse(x+side*w*.4,y-2,w*.7,2,-side*.4,0,Math.PI*2);c.fill();}}}});
  // Entramado: paneles de revoque claro entre vigas oscuras (la versión PlayCanvas usa la textura pixel art).
  const timber=canvasTexture(256,(c,s)=>{c.fillStyle='#e8dfc9';c.fillRect(0,0,s,s);c.fillStyle='#4a3526';for(const x of [0,s/3,2*s/3])c.fillRect(x,0,14,s);for(const y of [0,s/2])c.fillRect(0,y,s,14);c.strokeStyle='#4a3526';c.lineWidth=12;c.beginPath();c.moveTo(14,s/2);c.lineTo(s/3,14);c.moveTo(2*s/3+14,14);c.lineTo(s,s/2);c.stroke();});
  return {stone,wood,roof,ground,cobble,glow,foliage,fern,timber};
}

const GradeShader={uniforms:{tDiffuse:{value:null},time:{value:0},restored:{value:0},night:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,fragmentShader:`uniform sampler2D tDiffuse; uniform float time; uniform float restored; uniform float night; varying vec2 vUv;
void main(){vec2 uv=vUv;vec3 col=texture2D(tDiffuse,uv).rgb;float edge=smoothstep(.21,.77,distance(uv,vec2(.5,.47)));col*=1.-edge*.22;float grain=fract(sin(dot(uv+fract(time*.0001),vec2(12.9898,78.233)))*43758.5453)-.5;col+=grain*.003;col=mix(col,col*vec3(1.04,1.005,.96),.6);col=mix(col,col*vec3(.86,.94,1.14),night*.65);col+=vec3(.045,.031,.004)*restored*(1.-night*.8);gl_FragColor=vec4(col,1.);}`};

export class World {
  constructor(canvas) {
    this.canvas=canvas;this.clock=0;this.target=null;this.inspect=false;this.area=null;this.state={flags:{},settings:{}};
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.13;
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-20,20,15,-15,.1,240);this.camera.position.set(0,13.5,25);this.camera.lookAt(0,0,0);
    this.focus=new THREE.Vector3();this.cameraOffset=new THREE.Vector3(0,13.5,25);this.raycaster=new THREE.Raycaster();this.groundPlane=new THREE.Plane(UP,0);
    this.worldTextureOffset=new THREE.Vector3();this.textures=textureSet();this.textures.cobble.repeat.set(1,1);this.sharedGeometries=new Set();this.sharedMaterials=new Set();
    this.geo={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,12,8),ico:new THREE.IcosahedronGeometry(1,1),cylinder:new THREE.CylinderGeometry(1,1,1,16),cone:new THREE.ConeGeometry(1,1,12),plane:new THREE.PlaneGeometry(1,1),torus:new THREE.TorusGeometry(1,.1,8,40)};
    Object.values(this.geo).forEach(g=>this.sharedGeometries.add(g));
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));
    this.bloom=new UnrealBloomPass(new THREE.Vector2(800,600),.25,.7,.9);this.composer.addPass(this.bloom);this.grade=new ShaderPass(GradeShader);this.composer.addPass(this.grade);this.composer.addPass(new OutputPass());
    this.resize();this.loadArtAssets();
  }
  loadArtAssets(){
    if(this._artLoading||this.lastAssetResult?.ok)return this.assetsReady;
    this._artLoading=true;this._loadedArtAssets??=new Set();
    const pending=[];
    const load=(url,callback=()=>{})=>{
      if(this._loadedArtAssets.has(url))return;
      pending.push(new Promise(resolve=>{
        const img=new Image(),allocated=[];let settled=false;
        const own=texture=>{allocated.push(texture);return texture;};
        const finish=missing=>{if(settled)return;settled=true;clearTimeout(timer);img.onload=null;img.onerror=null;resolve(missing);};
        const timer=setTimeout(()=>finish(url),20000);
        img.onload=()=>{
          if(this.disposed){finish(url);return;}
          try{callback(img,own);this._loadedArtAssets.add(url);finish(null);}
          catch(error){allocated.forEach(texture=>texture.dispose());console.error(`Could not prepare required artwork: ${url}`,error);finish(url);}
        };
        img.onerror=()=>finish(url);
        img.src=url;
      }));
    };
    const crop=(img,col,row,cols,rows,key=false)=>{const width=Math.floor(img.width/cols),height=Math.floor(img.height/rows),c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,col*width,row*height,width,height,0,0,width,height);if(key){const data=ctx.getImageData(0,0,width,height),p=data.data;for(let i=0;i<p.length;i+=4){const magenta=Math.min(p[i],p[i+2])-p[i+1];if(magenta>50&&p[i]>95&&p[i+2]>90){p[i+3]=Math.max(0,255-(magenta-50)*5);if(p[i+3]<30)p[i+3]=0;}}ctx.putImageData(data,0,0);}return c;};
    load('/assets/materials.webp',(img,own)=>{
      const prepared=[];
      for(const [key,col,row] of [['cobble',0,0],['stone',1,0],['wood',2,0],['roof',0,1]]){
        const tile=crop(img,col,row,3,2),height=document.createElement('canvas');height.width=height.height=512;
        const c=height.getContext('2d',{willReadFrequently:true});c.drawImage(tile,0,0,512,512);
        const pixels=c.getImageData(0,0,512,512),data=pixels.data;
        for(let i=0;i<data.length;i+=4){const v=Math.max(0,Math.min(255,(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722-128)*1.35+128));data[i]=data[i+1]=data[i+2]=v;}
        c.putImageData(pixels,0,0);const t=own(new THREE.CanvasTexture(height));t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.copy(this.textures[key].repeat);t.anisotropy=8;
        prepared.push({key,tile,t});
      }
      this.bumpTextures??={};
      for(const {key,tile,t} of prepared){
        this.textures[key].dispose();this.textures[key].image=tile;this.textures[key].needsUpdate=true;this.bumpTextures[key]=t;
        for(const m of this.sharedMaterials){if(m.bumpMap===this.textures[key]){m.bumpMap=t;m.bumpScale={stone:.10,wood:.03,roof:.08,cobble:.045,ground:.015}[key];m.needsUpdate=true;}}
      }
    });
    load('/assets/art-polish/meadow.webp',img=>{this.textures.ground.image=img;this.textures.ground.needsUpdate=true;});
    load('/assets/art-polish/workshop-rug.webp',(img,own)=>{const t=own(new THREE.Texture(img));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;this.textures.workshopRug=t;});
    load('/assets/art-polish/kingdom-banner.webp',(img,own)=>{const t=own(new THREE.Texture(img));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.needsUpdate=true;this.textures.kingdomBanner=t;});
    load('/assets/trees.webp',(img,own)=>{const textures=[];for(let i=0;i<6;i++){const t=own(new THREE.CanvasTexture(crop(img,i%3,Math.floor(i/3),3,2,true)));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;textures.push(t);}this.treeTextures=textures;for(const entry of this.treeModels||[])this.applyTreeArt(entry);});
    for(const set of ['main','north','village'])load(`/assets/art-polish/portraits-${set}.webp`);
    load('/assets/art-polish/waterside-plants.webp',(img,own)=>{this.bankTextures=[];for(let i=0;i<3;i++){const t=own(new THREE.CanvasTexture(crop(img,i,0,3,1)));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;this.bankTextures.push(t);}});
    load('/assets/ohm.webp',(img,own)=>{
      const directions=[];
      for(let row=0;row<4;row++){
        const frames=[];
        for(let col=0;col<6;col++){
          const tile=crop(img,col,row,6,4,true),ctx=tile.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,tile.width,tile.height).data;
          let minX=tile.width,minY=tile.height,maxX=0,maxY=0;
          for(let y=0;y<tile.height;y++)for(let x=0;x<tile.width;x++)if(pixels[(y*tile.width+x)*4+3]>48){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
          if(minX>maxX||minY>maxY)throw new Error(`Ohm frame ${row}:${col} is empty`);
          // Preserve atlas scale while aligning the broad feet across all directions.
          const aligned=document.createElement('canvas');aligned.width=aligned.height=256;
          const width=maxX-minX+1,height=maxY-minY+1;
          aligned.getContext('2d').drawImage(tile,minX,minY,width,height,128-width/2,244-height,width,height);
          const t=own(new THREE.CanvasTexture(aligned));t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearFilter;frames.push(t);
        }
        directions.push(frames);
      }
      this.ohmFrames=directions;
    });
    load('/assets/art-polish/portrait-ohm.webp');
    for(const name of HUMAN_ACTORS)load(`/assets/actors/${name}.webp`,(img,own)=>{
      const tiles=[],bounds=[],width=img.naturalWidth||img.width,height=img.naturalHeight||img.height;
      for(let row=0;row<ACTOR_ATLAS.rows;row++)for(let col=0;col<ACTOR_ATLAS.columns;col++){
        // Cut a window wider than the cell and keep only this cell's figure: sheets are drawn loosely.
        const cx0=Math.round(col*width/ACTOR_ATLAS.columns),cy0=Math.round(row*height/ACTOR_ATLAS.rows),cx1=Math.round((col+1)*width/ACTOR_ATLAS.columns),cy1=Math.round((row+1)*height/ACTOR_ATLAS.rows);
        const x=Math.max(0,cx0-48),y=Math.max(0,cy0-48),w=Math.min(width,cx1+48)-x,h=Math.min(height,cy1+48)-y;
        const tile=document.createElement('canvas');tile.width=w;tile.height=h;const ctx=tile.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,x,y,w,h,0,0,w,h);
        const data=ctx.getImageData(0,0,w,h),pixels=data.data;
        for(let i=0;i<pixels.length;i+=4){const magenta=Math.min(pixels[i],pixels[i+2])-pixels[i+1];if(magenta>50&&pixels[i]>95&&pixels[i+2]>90){pixels[i+3]=Math.min(pixels[i+3],Math.max(0,255-(magenta-50)*5));if(pixels[i+3]<30)pixels[i+3]=0;}}
        isolateFigure(pixels,w,h,{x0:cx0-x,x1:cx1-x,y0:cy0-y,y1:cy1-y});
        ctx.putImageData(data,0,0);tiles.push(tile);bounds.push(opaqueBounds(pixels,w,h));
      }
      const {placements}=actorFrameLayout(bounds),directions=Array.from({length:4},()=>[]);
      for(let i=0;i<tiles.length;i++){
        const b=bounds[i],p=placements[i],canvas=document.createElement('canvas');canvas.width=canvas.height=ACTOR_ATLAS.size;
        canvas.getContext('2d').drawImage(tiles[i],b.x,b.y,b.width,b.height,p.x,p.y,p.width,p.height);
        const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearFilter;directions[Math.floor(i/ACTOR_ATLAS.columns)].push(texture);
      }
      this.atlasFrames??={};this.atlasFrames[name]=directions;
      for(const actor of this.actors||[])if(actor.name===name)this.applyCharacterArt(actor);
    });
    this.assetsReady=Promise.all(pending).then(results=>{
      const missing=results.filter(Boolean);this._artLoading=false;
      this.lastAssetResult={ok:missing.length===0,missing};return this.lastAssetResult;
    });
    return this.assetsReady;
  }
  applyTreeArt(entry){if(!this.treeTextures)return;for(const child of [...entry.g.children])entry.g.remove(child);const mat=new THREE.MeshStandardMaterial({map:this.treeTextures[entry.type],color:'#e4e6d3',alphaTest:.3,side:THREE.DoubleSide,roughness:1,transparent:false});this.sharedMaterials.add(mat);const plane=this.mesh('plane',mat,0,3.6*entry.size,0,5.7*entry.size,7.2*entry.size,1,entry.g);plane.rotation.y=Math.atan2(this.cameraOffset.x,this.cameraOffset.z);entry.g.userData.treePlane=plane;this.renderer.shadowMap.needsUpdate=true;}
  applyCharacterArt(actor){const directions=this.atlasFrames?.[actor.name];if(!directions)throw new Error(`Required actor atlas is not ready: ${actor.name}`);actor.directions=directions;actor.animation??=idleActor();actor.frames=directions[actor.animation.direction];actor.sprite.material.map=actor.frames[actor.animation.frame];actor.sprite.center.set(.5,1-ACTOR_ATLAS.feet/ACTOR_ATLAS.size);actor.sprite.scale.set(2.95,2.95,1);actor.sprite.position.y=.025;actor.art=true;}
  animateActor(actor,dx,dz,dt,options){actor.animation=advanceActor(actor.animation,dx,dz,dt,options);actor.frames=actor.directions[actor.animation.direction];actor.sprite.material.map=actor.frames[actor.animation.frame];actor.sprite.material.rotation=0;}
  mat(color,texture=null,extra={}) {
    const m=new THREE.MeshStandardMaterial({color,roughness:.92,metalness:0,...(texture?{map:this.textures[texture],bumpMap:this.bumpTextures?.[texture]||this.textures[texture],bumpScale:{stone:.10,wood:.03,roof:.08,cobble:.045,ground:.015}[texture]||.04}:{}),...extra});this.sharedMaterials.add(m);return m;
  }
  mesh(geo,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1,parent=this.root){const m=new THREE.Mesh(typeof geo==='string'?this.geo[geo]:geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;(parent||this.root).add(m);return m;}
  box(x,y,z,w,h,d,mat,parent=this.root){return this.mesh('box',mat,x,y,z,w,h,d,parent);}
  cylinder(x,y,z,r,h,mat,parent=this.root){return this.mesh('cylinder',mat,x,y,z,r,h,r,parent);}
  sphere(x,y,z,r,mat,parent=this.root,sy=1){return this.mesh('sphere',mat,x,y,z,r,r*sy,r,parent);}
  beam(a,b,width,mat,parent=this.root){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),mid=v1.clone().add(v2).multiplyScalar(.5);const m=this.box(mid.x,mid.y,mid.z,width,v1.distanceTo(v2),width,mat,parent);m.quaternion.setFromUnitVectors(UP,v2.sub(v1).normalize());return m;}
  torus(x,y,z,r,t,mat,rotation=null,parent=this.root){const geo=new THREE.TorusGeometry(r,t,8,48);this.localGeometries.push(geo);const m=this.mesh(geo,mat,x,y,z,1,1,1,parent);if(rotation)m.rotation.set(...rotation);return m;}
  group(x=0,y=0,z=0,parent=this.root){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
  // Interactions reserve room when placing decoration; they never erase a wall.
  solid(x,z,w,d,id){const obstacle={x,z,w:w/2,d:d/2,...(id?{id}:{})};this.obstacles.push(obstacle);return obstacle;}
  nearObject(x,z,r=2.2){return [...(this.area?.objects||[]),...(this.area?.exits||[])].some(o=>Math.hypot(o.x-x,o.z-z)<r);}

  loadArea(area,state={},spawn,{deferRender=false,continuous=false}={}) {
    if(!this.lastAssetResult?.ok)throw new Error(`Required artwork is not ready. Await assetsReady and retry loadArtAssets if needed. Missing: ${(this.lastAssetResult?.missing||[]).join(', ')}`);
    this.clearArea();this.area=area;this.layout=AREA_LAYOUTS[area.id];this.pavingGrid=null;this.boundaryObstacles=[];this.state=state;this.rand=seeded(area.id);this.root=new THREE.Group();this.scene.add(this.root);this.localGeometries=[];this.obstacles=[];this.walkSurfaces=[];this.animations=[];this.lamps=[];this.machines=[];this.actors=[];this.waterMaterials=[];this.restorationParticles=[];this.objectModels=new Map();this.levers=[];this.conductors=[];this.treeModels=[];this.fountainStreams=[];this.fountainWater=[];this.irrigationWater=[];this.springWaterworks=null;this.dormantOhm=null;this.gateLeaf=null;this.gateObstacle=null;this.gateway=null;this.cinematic=null;this.target=null;
    this.continuous=continuous&&area.id!=='workshop';this.coreBounds=area.bounds;
    const p=PALETTES[area.id]||PALETTES.plaza;this.palette=p;this.scene.background=new THREE.Color(p.sky);this.scene.fog=new THREE.FogExp2(p.fog,area.id==='workshop'?.0015:.004);
    this.m={stone:this.mat(p.stone,'stone'),stoneDark:this.mat('#6d786c','stone'),cream:this.mat('#d5c2a0','stone'),timber:this.mat('#ffffff','timber'),wood:this.mat('#ad8150','wood'),darkwood:this.mat('#5e4837','wood'),roof:this.mat('#648b89','roof'),roofRed:this.mat('#ba7858','roof'),metal:this.mat('#4c655f',null,{metalness:.72,roughness:.5}),brass:this.mat('#bc9857',null,{metalness:.65,roughness:.36}),grass:this.mat(p.grass,'ground'),path:this.mat('#d0bd96','cobble'),leaf:this.mat('#518557'),leafLight:this.mat('#8c9a52'),flower:this.mat('#e0c27c'),blue:this.mat('#56c7c6',null,{emissive:'#42bdbc',emissiveIntensity:.75}),dark:this.mat('#233d41'),cloth:this.mat('#c6a365',null,{side:THREE.DoubleSide}),redcloth:this.mat('#a85f4d',null,{side:THREE.DoubleSide}),glass:this.mat('#edca8a',null,{emissive:'#fdb966',emissiveIntensity:.45}),white:this.mat('#e3d2a1')};
    const groundTones={portal:'#bac4ab',plaza:'#c1c9a9',road:'#c4c4aa',spring:'#b4c5b7',castle:'#b7bcba',terraces:'#c8c3a6',lake:'#b4c4bf',lighthouse:'#b2c2bf'};
    const pavingTones={spring:'#a6b4aa',castle:'#b4afa6',terraces:'#b8ac8c',lake:'#a6b3ae',lighthouse:'#a9b7b5'};
    this.m.grass.color.set(groundTones[area.id]||'#c1c9a9');this.m.path.color.set(pavingTones[area.id]||'#aba78c');
    this.m.contact=new THREE.MeshBasicMaterial({map:this.textures.glow,color:'#15201c',transparent:true,opacity:.32,depthWrite:false});this.sharedMaterials.add(this.m.contact);
    this.worldMapped(this.m.path,5);this.worldMapped(this.m.grass,6);this.wallMapped(this.m.stone,4);this.wallMapped(this.m.stoneDark,4);this.wallMapped(this.m.cream,4);this.wallMapped(this.m.timber,4.5);
    this.m.foliage=this.mat('#b4c99c',null,{map:this.textures.foliage,alphaTest:.45,side:THREE.DoubleSide,roughness:1});
    this.m.fern=this.mat('#a7c17e',null,{map:this.textures.fern,alphaTest:.4,side:THREE.DoubleSide,roughness:1});
    const hemi=new THREE.HemisphereLight('#c6e4e7','#8b845d',1.65);this.hemi=hemi;this.root.add(hemi);
    this.sun=new THREE.DirectionalLight(p.sun,3.5);this.sun.position.set(-12,28,7);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);this.sun.shadow.camera.left=-33;this.sun.shadow.camera.right=33;this.sun.shadow.camera.top=33;this.sun.shadow.camera.bottom=-33;this.sun.shadow.camera.near=.1;this.sun.shadow.camera.far=90;this.sun.shadow.bias=-.0005;this.sun.shadow.normalBias=.025;this.sun.shadow.radius=3;this.root.add(this.sun);
    const [w,d]=area.bounds||[36,30];this.bounds=[w,d];
    if(area.id==='workshop')this.buildWorkshop(w,d);else{
      this.buildGround(w,d);
      this.buildAuthoredBuildings();
      ({portal:()=>this.buildPortal(w,d),plaza:()=>this.buildPlaza(w,d),road:()=>this.buildRoad(w,d),spring:()=>this.buildSpring(w,d),castle:()=>this.buildCastle(w,d),terraces:()=>this.buildTerraces(w,d),lake:()=>this.buildLake(w,d),lighthouse:()=>this.buildLighthouse(w,d) }[area.id]||(()=>this.buildPlaza(w,d)))();

    }
    this.buildObjects();buildPaving(this);buildPlayableBoundary(this);
    if(area.id!=='workshop'){this.buildNature(w,d);if(!this.continuous)this.buildHorizon(w,d);}
    this.buildWorldConductors();this.buildExitMarkers();this.buildAtmosphere(w,d);
    this.player=this.character('player',0,0);this.ohm=this.automaton(0,0,true);this.root.add(this.player,this.ohm);
    if(this.continuous)this.bounds=travelBounds(area.id);
    const pos=spawn||area.spawn||[0,d*.3];this.setPlayerPosition(pos);initializeInhabitants(this);this.focus.set(this.player.position.x*.45,0,this.player.position.z*.45);
    this.currentZoom=1;this.cameraOffset.set(0,13.5,25);this.restoration=0;this.route=[];this.renderer.shadowMap.needsUpdate=true;this._lastFlags=JSON.stringify(state.flags||{});this.updateFlags(state);updateDaylight(this,state,1,true);if(!deferRender){this.resize();this.update(.016,state,{x:0,z:0});}
  }

  buildGround(w,d){
    const before=new Set(this.root.children);
    const coastal=['lake','lighthouse'].includes(this.area.id);this.coastal=coastal;
    if(coastal){const points=[];if(this.area.id==='lighthouse'){for(let i=0;i<96;i++){const a=i/96*Math.PI*2,r=1+Math.sin(a*5)*.045+Math.cos(a*9)*.025;points.push(new THREE.Vector2(Math.cos(a)*w*.70*r,-Math.sin(a)*d*.84*r));}}else{points.push(new THREE.Vector2(-90,90));for(let z=-90;z<=90;z+=3)points.push(new THREE.Vector2(this.lakeShoreX(z),-z));points.push(new THREE.Vector2(-90,-90));}const shape=new THREE.Shape(points),geo=new THREE.ExtrudeGeometry(shape,{depth:1.5,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.5,bevelThickness:.25});this.localGeometries.push(geo);const land=this.mesh(geo,[this.m.grass,this.m.stoneDark],0,-1.65,0);land.rotation.x=-Math.PI/2;this.water(0,-.42,0,190,190);}
    else{this.box(0,-.7,0,150,1.3,150,this.m.stoneDark);this.box(0,-.025,0,150,.1,150,this.m.grass);}
    if(!coastal)this.water(0,-.67,0,140,140);
    for(const child of this.root.children)if(!before.has(child))child.userData.terrain=true;
  }
  lakeShoreX(z){return lakeShoreX(z);}
  onLand(x,z){if(this.continuous&&inKingdomWater(this.area.id,x,z))return false;if(this.continuous&&Math.abs(z)>this.coreBounds[1]/2-.2)return inTravelCorridor(this.area.id,x,z);if(this.area.id==='spring'&&x>-14.81&&x<-8.31&&z>-14.5&&z<10.5)return false;if(this.area.id==='road'&&x>ROAD_CANAL_X-2&&x<ROAD_CANAL_X+2)return false;if(this.area.id==='lighthouse')return Math.hypot(x/((this.coreBounds||this.bounds)[0]*.68),z/((this.coreBounds||this.bounds)[1]*.82))<.95;if(this.area.id==='lake')return x<this.lakeShoreX(z)-.4;return true;}
  walkableLand(x,z){
    if(this.continuous&&Math.abs(z)>this.coreBounds[1]/2-.2)return inTravelCorridor(this.area.id,x,z);
    if(this.continuous&&Math.abs(x)>this.coreBounds[0]/2-.45)return false;
    return this.onLand(x,z)||(this.area.id==='lake'&&Math.abs(z-3)<2.1&&x<13.8);
  }
  canStand(x,z,radius=.34){return isPositionClear([x,z],this.bounds,this.obstacles,{radius,isWalkable:(x,z)=>this.walkableLand(x,z)});}
  nearestWalkable(pos,radius=.34){
    const x=THREE.MathUtils.clamp(pos[0],-this.bounds[0]/2+.6,this.bounds[0]/2-.6),z=THREE.MathUtils.clamp(pos[1],-this.bounds[1]/2+.6,this.bounds[1]/2-.6);
    if(this.canStand(x,z,radius))return[x,z];
    for(let distance=.1;distance<=Math.max(...this.bounds);distance+=.1){const samples=Math.max(16,Math.ceil(distance*Math.PI*2/.18));for(let i=0;i<samples;i++){const angle=i/samples*Math.PI*2,xx=x+Math.cos(angle)*distance,zz=z+Math.sin(angle)*distance;if(this.canStand(xx,zz,radius))return[xx,zz];}}
    return this.area.spawn||[0,0];
  }
  groundHeight(x,z){
    if(this.area.id==='lake'&&Math.abs(x-9.2)<4.5&&Math.abs(z-3)<2.25)return .22;
    if(this.area.id!=='portal')return 0;
    let height=.025;
    if(Math.abs(x)<2.75)height=Math.max(height,.06);
    for(const surface of this.walkSurfaces||[]){const inside=surface.r!=null?Math.hypot(x-surface.x,z-surface.z)<=surface.r:Math.abs(x-surface.x)<=surface.w/2&&Math.abs(z-surface.z)<=surface.d/2;if(inside)height=Math.max(height,surface.y);}
    return height;
  }
  worldMapped(material,size){const origin=this.worldTextureOffset||new THREE.Vector3();material.onBeforeCompile=shader=>{shader.uniforms.territoryOrigin={value:origin};shader.vertexShader='uniform vec3 territoryOrigin;varying vec3 worldSurface;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nworldSurface=(modelMatrix*vec4(transformed,1.)).xyz+territoryOrigin;');shader.fragmentShader='varying vec3 worldSurface;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP\n vec4 surfaceSample=texture2D(map,worldSurface.xz/${size.toFixed(1)}); diffuseColor*=surfaceSample;\n#endif`);};material.customProgramCacheKey=()=>`worldsurface-${size}`;}
  contact(x,z,w,d){const m=this.mesh('plane',this.m.contact,x,.086,z,w,d,1);m.rotation.x=-Math.PI/2;m.castShadow=false;m.receiveShadow=false;}
  wallMapped(material,size){const origin=this.worldTextureOffset||new THREE.Vector3();material.onBeforeCompile=shader=>{shader.uniforms.territoryOrigin={value:origin};shader.vertexShader='uniform vec3 territoryOrigin;varying vec3 stoneSurface; varying vec3 stoneNormal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nstoneSurface=(modelMatrix*vec4(transformed,1.)).xyz+territoryOrigin; stoneNormal=normalize(mat3(modelMatrix)*normal);');shader.fragmentShader='varying vec3 stoneSurface; varying vec3 stoneNormal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP\n vec3 sWeights=pow(abs(stoneNormal),vec3(6.));sWeights/=max(.001,sWeights.x+sWeights.y+sWeights.z); vec4 stoneSample=texture2D(map,stoneSurface.zy/${size.toFixed(1)})*sWeights.x+texture2D(map,stoneSurface.xz/${size.toFixed(1)})*sWeights.y+texture2D(map,stoneSurface.xy/${size.toFixed(1)})*sWeights.z; diffuseColor*=stoneSample;\n#endif`);};material.customProgramCacheKey=()=>`worldstone-${size}`;}
  water(x,y,z,w,d){
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},channel:{value:w<5&&d>10?1:0},worldOffset:{value:new THREE.Vector2()},deep:{value:new THREE.Color('#235257')},shallow:{value:new THREE.Color('#688f7e')},light:{value:new THREE.Color('#c9d9bc')}},vertexShader:waterVertex,fragmentShader:waterFragment});
    this.sharedMaterials.add(material);this.waterMaterials.push(material);const geo=new THREE.PlaneGeometry(w,d,12,12);this.localGeometries.push(geo);const mesh=this.mesh(geo,material,x,y,z);mesh.rotation.x=-Math.PI/2;mesh.castShadow=false;mesh.receiveShadow=false;return mesh;
  }
  building(x,z,w=6,d=5,h=4.5,opts={}){
    const group=buildArchitecture(this,x,z,w,d,h,opts);
    const {footprint,blockers}=group.userData.architecture;
    for(const b of [footprint,...blockers])this.solid(b.x,b.z,b.w,b.d,b.kind||'building');
    return group;
  }
  buildAuthoredBuildings(){
    // Backdrop houses: no interaction, only a yard fence and a tree so each reads as someone's home.
    for(const b of this.layout.backdrop||[]){
      const g=this.building(b.x,b.z,b.w,b.d,b.h,{...b.options,noDoor:true});g.name='village-backdrop-house';delete g.userData.architecture;const r=b.options.rotation||0,fx=Math.sin(r),fz=Math.cos(r),reach=b.d/2+1.6;
      this.fence(b.x+fx*reach,b.z+fz*reach,b.w*.7,!r);this.tree(b.x-fx*(b.d/2+2)+fz*(b.w/2+1.2),b.z-fz*(b.d/2+2)-fx*(b.w/2+1.2),.9+(Math.abs(b.x)%3)*.12);
    }
    for(const b of this.layout.buildings){
      const group=this.building(b.x,b.z,b.w,b.d,b.height,b.options);
      Object.assign(group.userData.architecture,{id:b.id,label:b.label});
    }
  }
  door(x,y,z,g){this.box(x,y+1.23,z+.02,1.28,2.4,.15,this.m.darkwood,g);this.box(x,y+1.15,z+.12,.92,2.18,.12,this.m.wood,g);for(let k=-.4;k<.5;k+=.18)this.box(x+k,y+1.15,z+.19,.018,2.13,.012,this.m.darkwood,g);this.torus(x+.3,y+1.1,z+.23,.065,.022,this.m.brass,null,g);this.box(x,y+.07,z+.35,1.7,.14,.75,this.m.stone,g);this.box(x,y+2.45,z+.1,1.5,.2,.25,this.m.darkwood,g);}
  window(x,y,z,g,small=false){const w=small?.8:1.05,h=small?1.15:1.25;this.box(x,y,z,w+.22,h+.22,.12,this.m.darkwood,g);this.box(x,y,z+.08,w,h,.06,this.m.glass,g).name='window-pane';this.box(x,y,z+.13,.07,h,.05,this.m.darkwood,g);this.box(x,y,z+.13,w,.07,.05,this.m.darkwood,g);for(const side of [-1,1]){this.box(x+side*(w/2+.24),y,z+.02,.28,h+.08,.12,this.m.wood,g);this.box(x+side*(w/2+.24),y-h*.3,z+.09,.32,.07,.08,this.m.darkwood,g);}this.box(x,y-h/2-.15,z+.2,w+.6,.16,.5,this.m.stone,g);}
  marketProps(x,z,w){this.solid(x,z,w+.15,.85);this.box(x,.75,z,w,1.4,.65,this.m.darkwood);this.box(x,1.47,z,w+.15,.12,.85,this.m.wood);for(let k=0;k<12;k++)this.sphere(x+(this.rand()-.5)*w*.9,1.62,z+(this.rand()-.5)*.55,.12,this.rand()>.5?this.m.flower:this.m.redcloth);}
  pot(x,z,r=.3){this.solid(x,z,r*2,r*2);this.cylinder(x,r*.62,z,r,r*1.3,this.m.roofRed);this.torus(x,r*1.25,z,r*.85,.06,this.m.roofRed,[Math.PI/2,0,0]);for(let i=0;i<5;i++){const a=i*2.4;this.sphere(x+Math.cos(a)*r*.6,r*1.5+this.rand()*.3,z+Math.sin(a)*r*.6,r*.6,i%2?this.m.leafLight:this.m.leaf,null,.55);}}
  barrel(x,z,scale=1){this.solid(x,z,.8*scale,.8*scale);const g=this.group(x,0,z);this.cylinder(0,.55*scale,0,.39*scale,1.05*scale,this.m.wood,g);for(let y of [.16,.85])this.torus(0,y*scale,0,.4*scale,.045*scale,this.m.metal,[Math.PI/2,0,0],g);this.cylinder(0,1.08*scale,0,.38*scale,.05,this.m.darkwood,g);return g;}
  crate(x,z,scale=.75){this.solid(x,z,scale,scale+.12);this.box(x,scale/2,z,scale,scale,scale,this.m.wood);for(const side of [-1,1])this.box(x+side*scale*.4,scale/2,z+scale*.51,.1,scale,.06,this.m.darkwood);this.beam([x-scale*.36,.1,z+scale*.53],[x+scale*.36,scale-.1,z+scale*.53],.09,this.m.darkwood);}
  lamp(x,z,h=3.4){this.solid(x,z,.7,.7);const g=this.group(x,0,z);this.cylinder(0,.16,0,.35,.3,this.m.stone,g);this.cylinder(0,h*.46,0,.09,h*.9,this.m.metal,g);this.beam([0,h-.3,0],[.6,h-.15,0],.075,this.m.metal,g);this.box(.6,h-.42,0,.4,.6,.36,this.m.brass,g);const bulb=this.box(.6,h-.4,0,.29,.4,.26,this.m.glass,g);this.mesh('cone',this.m.metal,.6,h-.04,0,.38,.35,.38,g);const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:this.textures.glow,color:'#ffca75',transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.set(.6,h-.4,0);glow.scale.set(2.5,2.5,1);g.add(glow);this.sharedMaterials.add(glow.material);this.lamps.push({bulb,glow,phase:this.rand()*6});if(this.lamps.length<5){const light=new THREE.PointLight('#ffc079',3.0,6,2);light.position.set(x+.6,h-.45,z);this.root.add(light);this.lamps.at(-1).light=light;}return g;}
  fence(x,z,length,alongX=true){this.solid(x,z,alongX?length+.16:.16,alongX?.16:length+.16);const steps=Math.ceil(length/1.5);for(let i=0;i<=steps;i++){const t=(i/steps-.5)*length;this.box(x+(alongX?t:0),.6,z+(alongX?0:t),.16,1.2,.16,this.m.darkwood);}for(const h of [.45,.95])this.box(x,h,z,alongX?length:.1,.13,alongX?.1:length,this.m.wood);}
  sceneryBlocksFacade(x,z,size=1){
    // The straight gameplay camera projects height against depth at 13.5 / 25.
    // Reserve the facade and its immediate approach, not merely the tree trunk.
    const halfWidth=2.85*size*.86,height=7.2*size*.86,slope=13.5/25;
    const bottom=-z*slope,top=height-z*slope;
    return this.layout.buildings.some(b=>{
      const front=b.z+b.d/2,facadeBottom=-front*slope;
      return z>front&&Math.abs(x-b.x)<halfWidth+b.w*.45+.35&&top>facadeBottom-.8&&bottom<facadeBottom+b.height;
    });
  }
  tree(x,z,size=1,autumn=false){
    if(!this.onLand(x,z)||this.sceneryBlocksFacade(x,z,size))return this.group();
    const g=this.group(x,0,z);const entry={g,size:size*.86,type:Math.floor(this.rand()*6)};this.treeModels.push(entry);if(this.treeTextures){this.applyTreeArt(entry);this.solid(x,z,.7,.7);return g;}const bend=(this.rand()-.5)*.4;this.cylinder(0,1.35*size,0,.18*size,2.7*size,this.m.darkwood,g);for(let k=0;k<3;k++){const a=k*2.15;this.beam([0,size,0],[Math.cos(a)*size,2.65*size,Math.sin(a)*size],.15*size,this.m.wood,g);}
    const foliage=new THREE.InstancedMesh(this.geo.plane,this.m.foliage,38),dummy=new THREE.Object3D();
    for(let i=0;i<38;i++){const a=i*2.4,r=Math.sqrt(this.rand())*1.25*size,y=(2.5+this.rand()*1.8)*size;dummy.position.set(Math.cos(a)*r+bend,y,Math.sin(a)*r);dummy.rotation.set((this.rand()-.5)*1.6,this.rand()*Math.PI,0);dummy.scale.set((1.65+this.rand()*.65)*size,(1.25+this.rand()*.4)*size,1);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,new THREE.Color().setHSL(autumn?.16:.22+this.rand()*.06,.25+this.rand()*.15,.58+this.rand()*.18));}foliage.castShadow=true;foliage.receiveShadow=true;g.add(foliage);
    for(let k=0;k<4;k++){const a=k*1.57;this.beam([0,.17,0],[Math.cos(a)*.5*size,.03,Math.sin(a)*.5*size],.15*size,this.m.darkwood,g);}
    this.animations.push({kind:'tree',obj:g,phase:this.rand()*6,speed:.4});this.solid(x,z,.7,.7);return g;
  }
  pine(x,z,size=1){const g=this.group(x,0,z);if(!this.onLand(x,z)||this.sceneryBlocksFacade(x,z,size))return g;this.solid(x,z,.35*size,.35*size);this.cylinder(0,2.4*size,0,.13*size,4.8*size,this.m.darkwood,g);const leaves=new THREE.InstancedMesh(this.geo.plane,this.m.foliage,32),dummy=new THREE.Object3D();for(let i=0;i<32;i++){const tier=Math.floor(i/8),angle=i*2.4,r=(1.2-tier*.24)*size;dummy.position.set(Math.cos(angle)*r*.35,(1.35+tier*.9)*size,Math.sin(angle)*r*.35);dummy.rotation.set(-.35,angle,0);dummy.scale.set(r*2.3,r*1.35,1);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new THREE.Color('#79a097'));}leaves.castShadow=true;leaves.receiveShadow=true;g.add(leaves);return g;}
  rock(x,z,size=1){
    this.solid(x,z,size*1.7,size*1.7);
    // Each boulder gets its own faceted shape: shared vertices pushed in and out.
    const geo=new THREE.IcosahedronGeometry(1,1),pos=geo.attributes.position,seen=new Map(),jitter=seeded(`rock ${x.toFixed(2)} ${z.toFixed(2)}`);
    for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>v.toFixed(3)).join();if(!seen.has(key))seen.set(key,.82+jitter()*.3);const k=seen.get(key);pos.setXYZ(i,pos.getX(i)*k,pos.getY(i)*k,pos.getZ(i)*k);}
    geo.computeVertexNormals();this.localGeometries.push(geo);
    const m=this.mesh(geo,this.m.stoneDark,x,.32*size,z,size,.65*size,.8*size);m.rotation.set(this.rand()*.5,this.rand()*6,this.rand()*.2);m.name='field-rock';return m;
  }
  gear(x,y,z,r=.7,parent=this.root,axis='z') {const g=this.group(x,y,z,parent);this.cylinder(0,0,0,r*.78,.14,this.m.brass,g).rotation.x=Math.PI/2;this.torus(0,0,0,r*.65,r*.13,this.m.metal,null,g);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const tooth=this.box(Math.cos(a)*r,Math.sin(a)*r,0,r*.28,r*.28,.18,this.m.brass,g);tooth.rotation.z=a;}this.cylinder(0,0,0,r*.2,.22,this.m.metal,g).rotation.x=Math.PI/2;if(axis==='y')g.rotation.x=Math.PI/2;this.animations.push({kind:'gear',obj:g,speed:(this.rand()>.5?1:-1)*.18});return g;}
  cable(points,color=this.m.brass,parent=this.root){const curve=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));const geo=new THREE.TubeGeometry(curve,Math.max(8,points.length*6),.04,5,false);this.localGeometries.push(geo);return this.mesh(geo,color,0,0,0,1,1,1,parent);}
  sign(x,z){this.solid(x,z,.2,.2);this.cylinder(x,1.0,z,.07,2,this.m.darkwood);this.box(x,1.7,z,1.45,.45,.16,this.m.wood);this.box(x+.15,1.12,z,1.1,.38,.15,this.m.darkwood);}

  buildPortal(w,d){
    this.box(0,.04,-2,10,.1,9,this.m.path);this.walkSurfaces.push({x:0,z:-2,w:10,d:9,y:.09});
    for(let i=0;i<3;i++){const y=.10+i*.09,r=4.5-i*.3;this.cylinder(0,y,-3,r,.14,this.m.stone);this.walkSurfaces.push({x:0,z:-3,r,y:y+.07});}
    const arch=this.group(0,0,-5.7);this.torus(0,3.5,0,3.15,.5,this.m.stone,null,arch);this.torus(0,3.5,.22,2.83,.08,this.m.brass,null,arch);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const block=this.box(Math.cos(a)*3.15,3.5+Math.sin(a)*3.15,0,.54,.64,1.1,i%3?this.m.stone:this.m.stoneDark,arch);block.rotation.z=a;this.sphere(Math.cos(a)*2.85,3.5+Math.sin(a)*2.85,.35,.065,this.m.blue,arch);}
    const mat=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float swirl=sin(a*4.+r*14.-time)*.5+.5;vec3 col=mix(vec3(.12,.37,.57),vec3(.36,.86,.91),swirl*.6+pow(r,4.)*.5);float edge=1.-smoothstep(.94,1.,r);gl_FragColor=vec4(col,edge*(.28+.45*pow(r,3.)));}`});
    this.sharedMaterials.add(mat);this.waterMaterials.push(mat);const disk=this.mesh('plane',mat,0,3.5,.05,5.5,5.5,1,arch);disk.castShadow=false;
    this.box(-3.25,1.5,0,.85,3,1.25,this.m.stone,arch);this.box(3.25,1.5,0,.85,3,1.25,this.m.stone,arch);this.solid(-3.25,-5.7,1,1.2);this.solid(3.25,-5.7,1,1.2);this.solid(0,-5.7,5.5,.6,'portal-surface');
    for(const x of [-9.2,9.2]){this.ruinPillar(x,-5,3.2);this.ruinPillar(x,5,2.1);this.lamp(x*.8,1,2.8);}
    // The Porteros' punt, moored on the canal that once carried visitors down to the village.
    this.portersLanding(15.2,1.6);
    for(const [x,z,s] of [[11.6,-8.6,1.25],[12.2,8.8,1.1],[20.4,-10.5,1.5],[20.8,9.5,1.6]])this.tree(x,z,s);
    for(let side of [-1,1]){for(let j=0;j<4;j++){this.box(side*(6.9+j*.9),.35,-2.4+j*.13,.75,.6+this.rand()*.35,.9,this.m.stoneDark);this.solid(side*(6.9+j*.9),-2.4+j*.13,.75,.9);this.rock(side*(7.5+j*.9),-1.5,.3+this.rand()*.35);}this.tree(side*9,d*.64,1.7);this.tree(side*14,d*.7,1.9);}
  }
  portersLanding(x,z){
    const g=this.group(x,.16,z);g.name='porteros-punt';
    // Hull outline seen from above: a pointed bow upstream, a square stern.
    const outline=(k)=>{const s=new THREE.Shape();s.moveTo(0,-1.75*k);s.quadraticCurveTo(.55*k,-1.05*k,.55*k,-.2*k);s.lineTo(.5*k,1.25*k);s.lineTo(-.5*k,1.25*k);s.lineTo(-.55*k,-.2*k);s.quadraticCurveTo(-.55*k,-1.05*k,0,-1.75*k);return s;};
    const hull=new THREE.ExtrudeGeometry(outline(1),{depth:.3,bevelEnabled:false}),deck=new THREE.ExtrudeGeometry(outline(.84),{depth:.05,bevelEnabled:false});this.localGeometries.push(hull,deck);
    const h=this.mesh(hull,this.m.darkwood,0,-.12,0,1,1,1,g);h.rotation.x=Math.PI/2;h.position.y=.18;const k=this.mesh(deck,this.m.wood,0,.17,0,1,1,1,g);k.rotation.x=Math.PI/2;k.position.y=.2;
    for(const zz of [-.55,.6])this.box(0,.24,zz,.9,.07,.26,this.m.cream,g);
    this.beam([.3,.35,-1.2],[-.1,.5,1.5],.035,this.m.darkwood,g);
    this.animations.push({kind:'boat',obj:g,phase:1.3});
    // A short plank landing on the west bank, with its mooring post and a coil of rope.
    for(let i=0;i<5;i++)this.box(x-1.15,.5,z-.8+i*.4,1.3,.07,.34,i%2?this.m.darkwood:this.m.wood);
    for(const zz of [-.95,.95])this.cylinder(x-.55,.2,z+zz,.07,.7,this.m.darkwood);
    this.cylinder(x-1.55,.55,z+1.15,.08,.8,this.m.darkwood);this.torus(x-1.55,.36,z+1.15,.16,.045,this.m.cream,[Math.PI/2,0,0]);
    this.cable([[x-1.55,.8,z+1.15],[x-.9,.4,z+.9],[x-.3,.42,z+.4]],this.m.cream);
  }
  ruinPillar(x,z,h){this.solid(x,z,1.3,1.3);this.box(x,.18,z,1.3,.35,1.3,this.m.stoneDark);this.cylinder(x,h/2+.35,z,.42,h,this.m.stone);this.box(x,h+.38,z,1.05,.3,1.05,this.m.stone);for(let i=0;i<3;i++)this.box(x+.45+this.rand()*.7,.1,z+.4+this.rand(),.4,.2,.4,this.m.stone);}
  buildPlaza(w,d){
    
    for(const [x,z] of [[-7.5,-5.2],[10.6,-2.8],[-7.6,11.7],[10,8.5]])this.lamp(x,z);
    this.banner(-2.65,-15.2,3.2);this.banner(2.65,-15.2,3.2);
    const festoon=t=>[-7.5+18.1*t,3.2-Math.sin(t*Math.PI)*.5,-5.2+2.4*t];
    for(let i=0;i<7;i++){const a=festoon(i/7),b=festoon((i+.5)/7),c=festoon((i+1)/7);this.cable([a,b,c],this.m.darkwood);const bulb=this.sphere(b[0],b[1]-.12,b[2],.11,this.m.glass);bulb.castShadow=false;}
    for(const [x,z] of this.layout.adjustments.find(a=>a.id==='plaza-crates').positions)this.crate(x,z,.6);
    for(const [x,z] of this.layout.adjustments.find(a=>a.id==='plaza-barrels').positions)this.barrel(x,z,.7);
  }
  fountain(x,z,r=1.5){const g=buildFountain(this,x,z,r),b=g.userData.landmark.footprint;this.solid(b.x,b.z,b.w,b.d,'fountain');return g;}
  banner(x,z,h=4){
    this.solid(x,z,.2,.2);this.cylinder(x,h/2,z,.08,h,this.m.brass);this.sphere(x,h+.05,z,.14,this.m.brass);
    this.beam([x,h-.08,z],[x+1.22,h-.08,z],.06,this.m.brass);
    const material=this.textures.kingdomBanner?this.mat('#e1d8ba',null,{map:this.textures.kingdomBanner,side:THREE.DoubleSide}):this.m.redcloth;
    const b=this.mesh('plane',material,x+.59,h-1,z,1.12,1.75,1);b.name='embroidered-ohmdal-standard';
    this.animations.push({kind:'banner',obj:b,phase:this.rand()*6});
  }
  buildWorkshop(w,d){
    this.solid(0,-d/2,w,.7,"workshop-back-wall");this.solid(-w/2,0,.6,d,"workshop-west-wall");this.solid(w/2,0,.6,d,"workshop-east-wall");
    this.solid(-w*.41,3,2.7,4,"workshop-hearth");this.solid(-w*.41,2,1.25,1.2);
    this.solid(-w*.44,d*.38,2.3,2.7,"workshop-entry-cabinet");
    const floor=this.mat('#ac946f','wood');this.worldMapped(floor,4);this.box(0,-.18,0,w+2,.4,d+2,this.m.darkwood);this.box(0,.02,0,w,.06,d,floor).name='workshop-wood-floor';
    this.box(0,3.4,-d/2,w,6.8,.7,this.m.stone);this.box(-w/2,2.7,0,.6,5.4,d,this.m.stone);this.box(w/2,2.7,0,.6,5.4,d,this.m.stone);
    // A waist-high cutaway front wall frames the room as a diorama; the door gap stays on the exit.
    for(const side of [-1,1]){const inner=1.6,outer=w/2+.3,cx=side*(inner+outer)/2,len=outer-inner;this.box(cx,.4,d/2+.35,len,.8,.7,this.m.stone).name='workshop-front-cutaway';this.box(cx,.84,d/2+.35,len+.1,.09,.82,this.m.darkwood);this.box(side*(inner+.12),.5,d/2+.35,.26,1,.84,this.m.darkwood);}
    for(let x=-w/2+1;x<w/2;x+=4){this.box(x,3.2,-d/2+.4,.35,6.4,.35,this.m.darkwood);this.beam([x,5.8,-d/2+.6],[x,6.8,-d/2+3],.22,this.m.darkwood);}
    for(let x of [-w*.32,0,w*.32])this.window(x,4.35,-d/2+.45,this.root);
    for(let x of [-w*.32,0,w*.32])this.windowRay(x,4.35,-d/2+.7);
    for(let x of [-w*.34,w*.34]){
      this.solid(x,-d*.35,5.8,1.8,"workshop-counter");
      this.box(x,1.3,-d*.35,5.5,2.5,1.6,this.m.darkwood);this.box(x,2.6,-d*.35,5.8,.18,1.8,this.m.wood);
      for(let k=0;k<9;k++){this.cylinder(x-2.3+k*.55,2.85,-d*.35,.16,.3+this.rand()*.4,k%3?this.m.brass:this.m.glass);}
      this.box(x,4,-d/2+.65,5.5,.15,.7,this.m.darkwood);for(let k=0;k<15;k++)this.box(x-2.4+k*.34,4.35,-d/2+.65,.22,.6+this.rand()*.3,.42,k%3===0?this.m.redcloth:k%3===1?this.m.leaf:this.m.brass);
    }
    this.box(-w*.41,1.1,3,2.7,2.2,4,this.m.stone);this.box(-w*.4,1.6,4,1.5,1.8,.15,this.m.dark);this.sphere(-w*.4,1.1,4.25,.5,this.m.glass,null,.6);this.box(-w*.41,4,2,1.25,4,1.2,this.m.stone);this.gear(-w*.4,2.7,4.2,.8);
    const rug=this.mesh('plane',this.mat('#d9ccb1',null,{map:this.textures.workshopRug||this.textures.ground}),0,.091,2,6,7,1);rug.rotation.x=-Math.PI/2;rug.name='woven-workshop-rug';rug.castShadow=false;
    for(let i=0;i<4;i++){this.barrel(w*.41,-d*.1+i*1.2,.8);this.crate(-w*.42,d*.32+i*.3,.8);}
    this.hangingLamp(-3,0,5.5);this.hangingLamp(5,-4,5.6);this.hangingLamp(-7,6,5.2);
    for(const side of [-1,1]){const x=side*(w/2-1.5);this.solid(x,-3,1.4,9,"workshop-shelves");for(let y=1.2;y<4.4;y+=1.0){this.box(x,y,-3.0,1.4,.14,9,this.m.darkwood);for(let k=0;k<11;k++){const z=-6.8+k*.76;this.box(x+(this.rand()-.5)*.55,y+.2,z,.18+this.rand()*.2,.25+this.rand()*.35,.32,k%4===0?this.m.leaf:k%3?this.m.redcloth:this.m.brass);}}}
    for(let k=0;k<4;k++){const x=-5.5+k*2.1;this.box(x,2.45,-d/2+.75,1.6,1.0,.06,this.m.darkwood);for(let j=0;j<4;j++){this.beam([x-.5+j*.3,2.5,-d/2+.88],[x-.5+j*.3,2.12,-d/2+.88],.05,this.m.metal);this.torus(x-.5+j*.3,2.65,-d/2+.9,.1,.025,this.m.brass);}}
    for(const pos of [[-3,-4],[5,0],[-6,5],[6,6]])this.stool(...pos);
    for(let i=0;i<6;i++){const x=-8+i*2.5;this.cable([[x,5.6,-11],[x,5.4,-7],[x+.7,4.8,-5]],i%2?this.m.metal:this.m.brass);}
    const warm=new THREE.PointLight('#ffd4a1',17,20,1.5);warm.position.set(-7,4,3);this.root.add(warm);
    this.box(-w*.44,2.2,d*.38,1.6,4.4,2.5,this.m.darkwood);for(let y of [1,2.1,3.2,4.3]){this.box(-w*.42,y,d*.38,1.9,.13,2.7,this.m.wood);for(let k=0;k<4;k++)this.box(-w*.42,y+.22,d*.30+k*.5,.6,.4,.28,k%2?this.m.brass:this.m.roofRed);}
    this.sun.intensity=1.4;this.sun.position.set(5,12,-16);
  }
  hangingLamp(x,z,y=5){this.cylinder(x,y+.65,z,.035,1.3,this.m.metal);this.torus(x,y,z,.63,.075,this.m.brass,[Math.PI/2,0,0]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,xx=x+Math.cos(a)*.55,zz=z+Math.sin(a)*.55;this.cylinder(xx,y+.2,zz,.085,.36,this.m.cream);this.sphere(xx,y+.45,zz,.09,this.m.glass);}const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:this.textures.glow,color:'#ffce8b',transparent:true,depthWrite:false,opacity:.65,blending:THREE.AdditiveBlending}));glow.position.set(x,y+.2,z);glow.scale.set(3.5,3.5,1);this.root.add(glow);this.sharedMaterials.add(glow.material);const light=new THREE.PointLight('#ffce91',12,10,2);light.position.set(x,y-.3,z);this.root.add(light);}
  windowRay(x,y,z){const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float edge=pow(sin(vUv.x*3.14159),2.);float lengthFade=smoothstep(0.,.35,vUv.y);gl_FragColor=vec4(.56,.72,.78,edge*lengthFade*.022);}'});this.sharedMaterials.add(mat);const start=new THREE.Vector3(x,y,z),end=new THREE.Vector3(x-2.2,.1,z+9),mid=start.clone().add(end).multiplyScalar(.5),geo=new THREE.ConeGeometry(1.45,start.distanceTo(end),20,1,true);this.localGeometries.push(geo);const ray=this.mesh(geo,mat,mid.x,mid.y,mid.z);ray.quaternion.setFromUnitVectors(UP,start.sub(end).normalize());ray.castShadow=false;ray.receiveShadow=false;const cool=new THREE.PointLight('#9fcbde',7,11,2);cool.position.set(x-1,2,z+3);this.root.add(cool);}
  stool(x,z){this.solid(x,z,.86,.86);this.cylinder(x,.85,z,.43,.18,this.m.wood);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;this.beam([x+Math.cos(a)*.3,.79,z+Math.sin(a)*.3],[x+Math.cos(a)*.4,.05,z+Math.sin(a)*.4],.1,this.m.darkwood);}}
  buildRoad(w,d){
    this.gateway=buildGateway(this,w,d);
    this.banner(-4,-d*.31,5.4);this.banner(4,-d*.31,5.4);
    for(let z=-3;z<d*.43;z+=8)this.lamp(-5.4,z);
    // The canal continues into the landscape; its water cannot end as a rectangle on grass.
    this.water(ROAD_CANAL_X,.065,0,4,150).name='road-continuous-canal';
    for(const side of [-1,1]){
      const bank=ROAD_CANAL_X+side*2.14;
      if(!this.continuous)this.box(bank,.15,0,.44,.4,150,this.m.stoneDark).name='road-canal-bank';
      this.solid(bank,0,.28,d,'road-canal-bank');
    }
  }
  buildSpring(w,d){
    this.springWaterworks=buildSpringWaterworks(this);
    this.cable([[3,3.5,-10],[3,3.5,-4],[6,.6,-4]],this.m.metal);
    this.fountain(-2,-4.5,1.5);this.lamp(5,7,3);this.lamp(-5,7,3);
  }
  buildCastle(w,d){
    
    for(const side of [-1,1]){this.box(side*(w*.2075+1),4,-d*.4,w*.415-2,8,3.5,this.m.stone);this.solid(side*(w*.2075+1),-d*.4,w*.415-2,3.5,"castle-wall");}this.box(0,6.65,-d*.4,4,2.7,3.5,this.m.stone);this.box(0,8.1,-d*.4,w*.85,.32,3.8,this.m.cream);
    for(let x=-w*.4;x<w*.41;x+=1.25)this.box(x,8.7,-d*.4,.65,1.0,3.7,this.m.stone);
    for(let x of [-w*.36,w*.36]){this.cylinder(x,5,-d*.34,2.8,10,this.m.stone);this.cylinder(x,10.0,-d*.34,3.1,.55,this.m.stoneDark);this.mesh('cone',this.m.roof,x,12,-d*.34,3.5,4,3.5);this.window(x,6.5,-d*.34+2.8,this.root);this.banner(x-1,-d*.34+2.9,9);this.solid(x,-d*.34,5.6,5.6,"castle-tower");}
    for(let x of [-7,7]){this.window(x,5.7,-d*.4+1.8,this.root);this.banner(x,-d*.4+2,7);}
    // Gatehouse: an arched passage (spandrels fill the square opening) with a raised portcullis.
    {const shape=new THREE.Shape();shape.moveTo(-2,3.3);shape.lineTo(-2,5.35);shape.lineTo(2,5.35);shape.lineTo(2,3.3);shape.absarc(0,3.3,2,0,Math.PI,false);
      const arch=new THREE.ExtrudeGeometry(shape,{depth:3.5,bevelEnabled:false,curveSegments:16});this.localGeometries.push(arch);this.mesh(arch,this.m.stone,0,0,-d*.4-1.75).name='castle-gate-arch';
      for(let i=0;i<=8;i++){const a=Math.PI*i/8,v=this.box(Math.cos(a)*2.12,3.3+Math.sin(a)*2.12,-d*.4+1.78,.34,.5,.1,this.m.cream);v.rotation.z=a-Math.PI/2;}
      const grid=this.group(0,0,-d*.4+.6);grid.name='castle-portcullis';for(let x=-1.75;x<=1.76;x+=.5){this.box(x,4.55,0,.09,1.5,.09,this.m.metal,grid);this.mesh('cone',this.m.metal,x,3.72,0,.07,.18,.07,grid).rotation.x=Math.PI;}for(const y of [4.15,4.75])this.box(0,y,0,3.7,.08,.08,this.m.metal,grid);}
    this.box(-2.2,2,-d*.4+1.8,.3,4,.4,this.m.brass);this.box(2.2,2,-d*.4+1.8,.3,4,.4,this.m.brass);this.gear(-3,3.2,-d*.4+1.9,.7);this.gear(3,3.2,-d*.4+1.9,.7);
    for(const x of [-11,11]){this.lamp(x,6,4);this.lamp(x,-4,4);this.pot(x,9,.65);}
    this.banner(-6,8,4);this.banner(6,8,4);this.cable([[-12,.17,-5],[0,.17,-5],[12,.17,-5]],this.m.brass);
  }
  buildTerraces(w,d){
    this.irrigationWater=[];
    for(const side of [-1,1])for(let row=0;row<3;row++){
      const x=side*w*.36,z=-d*.28+2.9+row*5.5,lift=row*.42;this.solid(x,z,8,3.5,"terrace-bed");this.box(x,(.65+lift)/2,z,8,.65+lift,3.5,this.m.stone).name='terrace-retaining-wall';this.box(x,.67+lift,z,7.6,.1,3.1,this.m.darkwood);
      for(let k=0;k<20;k++){const xx=x-3.3+(k%10)*.72,zz=z-.8+Math.floor(k/10)*1.5;this.beam([xx,.8,zz],[xx,1.55+lift,zz],.025,this.m.darkwood);const leaf=this.mesh('plane',row%2?this.m.foliage:this.m.fern,xx,1.25+lift,zz,.72,.85,1);leaf.rotation.y=.3;leaf.name='terrace-crop';const leaf2=this.mesh('plane',this.m.fern,xx,1.1+lift,zz,.75,.65,1);leaf2.rotation.y=1.8;leaf2.name='terrace-crop';if(row===1&&k%2===0)this.sphere(xx+.1,1.1+lift,zz+.2,.065,this.m.roofRed);}
      for(let k=0;k<5;k++){this.cylinder(x-3.3+k*1.65,1.45+lift,z-.7,.035,1.7,this.m.wood);}for(let y of [1.4,2.0])this.beam([x-3.5,y+lift,z-.7],[x+3.5,y+lift,z-.7],.025,this.m.darkwood);
      const channel=this.water(x,.73+lift,z+1.1,7.6,.35);this.irrigationWater.push(channel);
    }
    for(const [x,z] of [[-4.7,-10.8],[4.7,-2.8],[-4.7,5.2],[4.7,13.2]])this.lamp(x,z,2.8);
    const mill=this.layout.buildings.find(b=>b.id==='terrace-mill');
    this.beam([mill.x,mill.height+1.05,mill.z+mill.d/2-.1],[mill.x,mill.height+1.05,mill.z+mill.d/2+.52],.18,this.m.metal).name='mill-drive-shaft';
    const blades=this.group(mill.x,mill.height+1.05,mill.z+mill.d/2+.45);blades.name='mill-sails';blades.scale.setScalar(.68);this.cylinder(0,0,0,.22,.35,this.m.brass,blades).rotation.x=Math.PI/2;for(let i=0;i<4;i++){const g=this.group(0,0,0,blades);g.rotation.z=i*Math.PI/2;this.box(0,1.9,0,.15,3.8,.14,this.m.darkwood,g);this.box(.43,2.65,-.05,.82,1.5,.045,this.m.cloth,g);for(let j=0;j<6;j++)this.box(.45,.7+j*.45,0,.85,.2,.08,this.m.wood,g);}this.animations.push({kind:'wheel',obj:blades,speed:.23});
  }
  buildLake(w,d){
    this.box(w*.23,.10,3,9,.24,4.5,this.m.wood);this.fence(w*.23,5.1,9,true);this.fence(w*.23,.9,9,true);
    // Rocks follow the real shoreline, irregularly, and leave the dock's landfall free.
    for(let z=-d*.45,k=0;z<d*.46;z+=1.7+(k%3)*.6,k++){const x=lakeShoreX(z)-.7-(k%4)*.35;if(Math.abs(z-3)<3.2||pointOnPaving(this.layout,x,z,1))continue;this.rock(x,z,.35+(k%5)*.1);}
    if(!this.continuous){buildLighthouseIslet(this,w*.39,-d*.48,1.05);this.lighthouse(w*.39,-d*.48,1.05,false);}
    for(let x of [-6,5])this.lamp(x,6,3.6);this.boat(w*.37,6,1.2);this.boat(w*.38,-6,.9);
    for(let i=0;i<3;i++){this.barrel(-12+i*.95,7,.9);this.crate(-13+i*.8,9,.7);}

  }
  boat(x,z,s){const g=this.group(x,.18,z);const hull=this.mesh('sphere',this.m.darkwood,0,0,0,s*1.0,.3*s,s*2.3,g);this.box(0,.2,0,1.3*s,.15,3.5*s,this.m.wood,g);for(let zz of [-1,0,1])this.box(0,.37,zz*s,1.2*s,.13,.27*s,this.m.wood,g);this.cylinder(0,1.65,0,.055,3.3,this.m.darkwood,g);// A bellied triangular sail on a boom, cut from the kingdom's standard cloth.
    const cols=8,rows=10,pos=[],uv=[],idx=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const v=j/rows,u=i/cols*(1-v),x=u*1.55,y=.55+v*2.75;pos.push(x+.06,y,Math.sin(Math.PI*u/(1-v+1e-4))*Math.sin(Math.PI*Math.min(1,v*1.2+.1))*.28);uv.push(x/1.55,v);}
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;idx.push(a,b,c,b,d,c);}
    const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sailGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sailGeo.setIndex(idx);sailGeo.computeVertexNormals();this.localGeometries.push(sailGeo);
    const cloth=this.textures.kingdomBanner?this.mat('#efe6cc',null,{map:this.textures.kingdomBanner,side:THREE.DoubleSide}):this.m.cloth;
    const sail=this.mesh(sailGeo,cloth,0,0,0,1,1,1,g);sail.rotation.y=.25;sail.name='boat-sail';this.beam([0,.55,0],[1.5,.6,.35],.05,this.m.darkwood,g);this.animations.push({kind:'boat',obj:g,phase:this.rand()*6});}
  buildLighthouse(w,d){
    this.lighthouse(0,-d*.57,1.5,true);
    
    this.solid(-12.7,-1.2,.65,36,"lighthouse-west-wall");this.solid(12.7,-1.2,.65,36,"lighthouse-east-wall");
    this.box(-12.7,1.8,-1.2,.65,3.6,36,this.m.stone);this.box(12.7,.6,-1.2,.65,1.2,36,this.m.stone);
    for(const z of [15,6,-2,-10,-18]){for(const side of [-1,1]){const x=side*11.9;this.solid(x,z,1.6,1.6,"lighthouse-column");this.box(x,.25,z,1.6,.5,1.6,this.m.stoneDark);this.cylinder(x,2.7,z,.48,4.8,this.m.stone);this.box(x,5.15,z,1.2,.32,1.2,this.m.cream);this.gear(x,3.4,z+.54,.43);}
      if(z<14){const geom=new THREE.TorusGeometry(11.9,.22,8,48,Math.PI);this.localGeometries.push(geom);this.mesh(geom,this.m.stone,-0,5.3,z,1,.28,1);}
    }
    for(const side of [-1,1]){for(let z=-16;z<15;z+=5){this.box(side*12.35,2.45,z,.12,2.8,2.6,this.m.darkwood);this.box(side*12.25,2.45,z,.1,2.5,2.3,this.m.glass);for(let y=1.4;y<3.8;y+=.8)this.box(side*12.17,y,z,.12,.07,2.4,this.m.brass);}
      this.cable([[side*10.8,.45,15],[side*10.8,.45,6],[side*10.8,.45,-2],[side*10.8,.45,-10],[side*10.8,.45,-18]],this.m.brass);
      for(let z of [10,2,-6,-13]){this.cylinder(side*10.9,1.6,z,.13,2.7,this.m.brass);this.solid(side*10.9,z,.26,.26);}
    }
    this.hangingLamp(0,9,6.5);this.hangingLamp(0,-7,6.5);
    for(const side of [-1,1]){
      this.box(side*7,.1,2,2.5,.25,16,this.m.stone);this.cable([[side*7,.3,9],[side*7,.3,0],[side*7,.3,-9],[side*3,.3,-d*.34]],this.m.brass);
      this.ruinPillar(side*14,-6,3);
      for(let k=0;k<7;k++)this.rock(side*(w*.61+Math.sin(k)*.5),-d*.45+k*5,1.0+this.rand()*.5);
    }
    this.fence(w*.42,d*.35,7);this.banner(-14.5,18,4.5);this.banner(14.5,18,4.5);
  }
  lighthouse(x,z,s=1,main=false){
    const g=this.group(x,0,z);
    if(main){
      const base={x,z:z-.44,w:11,d:8};
      this.box(0,.15,-.44,base.w,1.1,base.d,this.m.stoneDark,g).name='lighthouse-retaining-base';
      this.box(0,.74,-.44,base.w,.08,base.d,this.m.stone,g).name='lighthouse-base-cap';
      g.userData.boundaryFootprints=[base];this.solid(base.x,base.z,base.w,base.d,'lighthouse-retaining-base');
    }else this.cylinder(0,.25,0,3.5*s,.5*s,this.m.stoneDark,g);
    this.cylinder(0,5.0*s,0,2.2*s,10*s,this.m.stone,g);for(let y of [1.0,4.1,7.1,9.9])this.cylinder(0,y*s,0,2.28*s,.22*s,this.m.cream,g);
    for(let y of [3,6.3]){this.window(0,y*s,2.19*s,g,true);this.cable([[-.6*s,y*s-1,2.2*s],[-.6*s,y*s+1,2.2*s]],this.m.brass,g).name='lighthouse-window-pipe';}
    this.cylinder(0,10.25*s,0,3*s,.4*s,this.m.stoneDark,g);this.cylinder(0,10.6*s,0,2.7*s,.16*s,this.m.brass,g);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;this.cylinder(Math.cos(a)*2.6*s,11.0*s,Math.sin(a)*2.6*s,.045*s,.9*s,this.m.metal,g);}
    this.torus(0,11.4*s,0,2.6*s,.055*s,this.m.metal,[Math.PI/2,0,0],g);
    const beacon=this.sphere(0,12*s,0,.9*s,this.mat('#d2e4bd',null,{emissive:'#ffe9a3',emissiveIntensity:.03,roughness:.2}),g,1.2);this.torus(0,12*s,0,1.3*s,.12*s,this.m.brass,[0,Math.PI/2,0],g);this.torus(0,12*s,0,1.3*s,.08*s,this.m.brass,[Math.PI/2,0,0],g);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:this.textures.glow,color:'#ffdc91',transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,opacity:0}));halo.position.set(0,12*s,.8*s);halo.scale.set(8*s,8*s,1);g.add(halo);this.sharedMaterials.add(halo.material);
    let beaconLight;if(main){beaconLight=new THREE.PointLight('#ffe0a0',0,30,1.5);beaconLight.position.set(0,12*s,0);g.add(beaconLight);}
    for(const xx of [-1.8,1.8])for(const zz of [-1.8,1.8])this.cylinder(xx*s,12*s,zz*s,.11*s,2.8*s,this.m.metal,g);
    this.mesh('cone',this.m.roof,0,14*s,0,2.9*s,1.7*s,2.9*s,g);this.cylinder(0,15.1*s,0,.08*s,1.5*s,this.m.brass,g);
    if(main){
      const vent=this.group(0,1.9,2.2*s,g);vent.name='lighthouse-service-vent';this.box(0,0,0,1.3,1.35,.12,this.m.darkwood,vent);this.box(0,0,.08,1.05,1.1,.08,this.m.dark,vent);for(let xx=-.42;xx<=.43;xx+=.21)this.box(xx,0,.15,.045,1.1,.08,this.m.brass,vent);
      this.gear(-2.6*s,2.2,1.5*s,1,g);this.gear(2.6*s,2.2,1.5*s,1,g);this.solid(x,z,4.56*s,4.56*s,"lighthouse-tower");
    }
    const beamMat=new THREE.ShaderMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{strength:{value:0}},vertexShader:'varying vec2 vUv;varying vec3 vLightNormal;void main(){vUv=uv;vLightNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float strength;varying vec2 vUv;varying vec3 vLightNormal;void main(){float softEdge=pow(abs(normalize(vLightNormal).z),.85);float farFade=smoothstep(0.,.28,vUv.y);float density=mix(.25,1.,vUv.y);gl_FragColor=vec4(1.,.91,.63,strength*softEdge*farFade*density);}'});this.sharedMaterials.add(beamMat);
    const beamGeo=new THREE.ConeGeometry(6*s,35*s,32,1,true);this.localGeometries.push(beamGeo);const pivot=this.group(0,12*s,0,g);const bm=this.mesh(beamGeo,beamMat,17.5*s,0,0,1,1,1,pivot);bm.rotation.z=Math.PI/2;bm.castShadow=false;this.animations.push({kind:'beacon',obj:pivot,material:beamMat,beacon,halo,light:beaconLight,baseScale:beacon.scale.clone(),phase:0,main});
    return g;
  }
  buildHorizon(w,d){
    for(let layer=0;layer<2;layer++){const geo=new THREE.PlaneGeometry(180,55,90,24),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),zz=pos.getY(i),edge=Math.sin((zz/55+.5)*Math.PI);const h=edge*(9+Math.sin(x*.11+layer)*4+Math.cos(x*.23+layer)*2+Math.sin(x*.47)*1.4);pos.setXYZ(i,x,h,zz-80-layer*26);}geo.computeVertexNormals();this.localGeometries.push(geo);const m=this.mesh(geo,this.mat(layer?'#92aaae':'#728e8f'));m.castShadow=false;m.receiveShadow=false;}
    if(!['lighthouse','lake','workshop'].includes(this.area.id))this.lighthouse(w*.53,-d*.66-8,.55,false);
    for(let i=0;i<18;i++){const x=(this.rand()-.5)*(w+32),z=-d*.54-5-this.rand()*10;this.pine(x,z,.8+this.rand());}
  }
  buildNature(w,d){
    const footprints=[];this.root.traverse(o=>{if(o.userData.architecture)footprints.push(o.userData.architecture.footprint)});
    const clearScenery=(x,z,r)=>(!this.continuous||Math.abs(z)<d/2-1&&!inTravelCorridor(this.area.id,x,z,-r))&&!inKingdomWater(this.area.id,x,z,Math.min(r,1))&&!pointOnPaving(this.layout,x,z,r)&&!this.nearObject(x,z,Math.max(1.4,r))&&!footprints.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);
    const positions=[];
    buildGardenArt(this,clearScenery);
    for(let i=0;i<24;i++){const side=i%2?-1:1,x=side*(w*.4+this.rand()*5),z=(this.rand()-.5)*(d+7);if((this.area.id==='portal'&&side>0)||!clearScenery(x,z,3.4))continue;positions.push([x,z]);if(i%4===0)this.pine(x,z,.85+this.rand()*.45);else this.tree(x,z,.72+this.rand()*.5,this.area.id==='terraces');}
    for(let i=0;i<22;i++){const side=i%2?-1:1,x=side*(w*.48+4+this.rand()*9),z=(this.rand()-.5)*(d+21);if(((this.area.id==='lake'||this.area.id==='portal')&&side>0)||!clearScenery(x,z,2.6))continue;this.tree(x,z,1.15+this.rand()*.7,this.area.id==='terraces');}
    const ferns=new THREE.InstancedMesh(this.geo.plane,this.m.fern,220),fernDummy=new THREE.Object3D();
    for(let i=0;i<220;i++){let x=(this.rand()-.5)*(w+15),z=(this.rand()-.5)*(d+15);const s=this.onLand(x,z)&&clearScenery(x,z,.45)?.7+this.rand()*.8:0;fernDummy.position.set(x,s*.42,z);fernDummy.rotation.set(-.14,this.rand()*6,0);fernDummy.scale.set(s,s,1);fernDummy.updateMatrix();ferns.setMatrixAt(i,fernDummy.matrix);}ferns.receiveShadow=true;this.root.add(ferns);
    // Dense instanced undergrowth, with open navigation lanes and clear interactables.
    const count=3400,dummy=new THREE.Object3D();const blades=new THREE.ConeGeometry(.035,.30,3);this.localGeometries.push(blades);const mat=this.mat('#829559',null,{side:THREE.DoubleSide});const grass=new THREE.InstancedMesh(blades,mat,count);const flowerGeo=new THREE.IcosahedronGeometry(.055,0);this.localGeometries.push(flowerGeo);const flowers=new THREE.InstancedMesh(flowerGeo,this.m.flower,380);let f=0;
    for(let i=0;i<count;i++){let x=(this.rand()-.5)*(w+7),z=(this.rand()-.5)*(d+7);
      dummy.position.set(x,.15,z);dummy.scale.setScalar(this.onLand(x,z)&&clearScenery(x,z,.18)?.7+this.rand():0);dummy.rotation.set(0,this.rand()*6,(this.rand()-.5)*.4);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,new THREE.Color().setHSL(.2+this.rand()*.07,.25+this.rand()*.25,.25+this.rand()*.22));
      if(f<380&&this.rand()>.7&&this.onLand(x,z)&&clearScenery(x,z,.25)){dummy.position.y=.28;dummy.scale.setScalar(.6+this.rand()*.7);dummy.updateMatrix();flowers.setMatrixAt(f++,dummy.matrix);}
    }flowers.count=f;grass.receiveShadow=true;grass.castShadow=false;this.root.add(grass,flowers);
    for(let i=0;i<18;i++){const x=(i%2?-1:1)*(w*.42+this.rand()*4),z=(this.rand()-.5)*d;if(clearScenery(x,z,1.3))this.rock(x,z,.3+this.rand()*.6);}
  }

  buildObjects(){
    for(const obj of this.area.objects||[]){let model;const kind=obj.kind||'';
      if(obj.character||kind==='npc'||kind==='character'){
        const name=(obj.character||obj.id||'tala').toLowerCase();model=name.includes('ohm')?this.automaton(obj.x,obj.z):this.character(HUMAN_ACTORS.find(k=>name.includes(k))||'tala',obj.x,obj.z);
      }else if(kind==='portal'){model=this.group(obj.x,0,obj.z);}
      else if(kind==='well'){model=this.fountain(obj.x,obj.z,1.8);}
      else if(kind==='lever'||obj.action?.type==='toggle'){model=this.lever(obj);}
      else if(obj.puzzle||['machine','panel','mechanism','switch','pump','generator','circuit','workbench'].includes(kind)){model=this.machine(obj);}
      else {model=this.curiosity(obj);}
      this.root.add(model);model.userData.interaction=obj;this.objectModels.set(obj.id,model);
    }
  }
  lever(obj){
    this.solid(obj.x,obj.z,1.2,.9,obj.id);
    const g=this.group(obj.x,0,obj.z);this.box(0,.16,0,1.2,.32,.9,this.m.stoneDark,g);this.box(0,.72,0,.8,.9,.6,this.m.wood,g);this.box(0,1.2,0,1.04,.12,.75,this.m.brass,g);
    const material=this.mat('#c3a664',null,{emissive:'#4b3a19',emissiveIntensity:.2});const indicator=this.sphere(0,.85,.34,.13,material,g);
    const waterHandle=WATER_HANDLES.has(obj.id),mechanical=isMechanicalControl(obj);
    const pivot=this.group(0,waterHandle?1.75:1.27,0,g);
    if(waterHandle){this.torus(0,0,.08,.43,.065,this.m.brass,null,pivot);for(let i=0;i<4;i++){const a=i*Math.PI/2;this.beam([0,0,.08],[Math.cos(a)*.4,Math.sin(a)*.4,.08],.045,this.m.brass,pivot);}this.cylinder(0,-.3,-.1,.10,.8,this.m.metal,g);}
    else{this.cylinder(0,.38,0,.055,.76,this.m.brass,pivot);this.cylinder(0,.82,0,.095,.4,mechanical?this.m.brass:this.m.darkwood,pivot).rotation.z=Math.PI/2;}
    // Ceramic contact pair for electricity, a shaft collar for mechanical drives.
    if(mechanical)this.torus(0,.72,.34,.25,.05,this.m.brass,null,g);
    else for(const side of [-1,1]){this.cylinder(side*.26,1.35,0,.10,.13,this.m.cream,g);this.sphere(side*.26,1.44,0,.065,side<0?this.m.redcloth:this.m.blue,g);}
    for(const x of [-.32,.32])this.cylinder(x,1.32,0,.07,.15,this.m.brass,g);
    this.box(0,.06,.75,.8,.035,.32,this.m.cream,g);this.box(0,.08,.75,.14,.025,.24,this.m.brass,g);
    this.levers.push({obj,g,pivot,indicator,waterHandle});return g;
  }
  buildWorldConductors(){
    for(const lever of this.levers){const obj=lever.obj;if(isMechanicalControl(obj))continue;const target=conductorTarget(this.area,obj);if(!target)continue;
      const isReturn=/return|retorno/.test(obj.flag||obj.id),mat=this.mat(isReturn?'#73999a':'#ba844d',null,{metalness:.6,roughness:.45,emissive:'#142b25',emissiveIntensity:.1});
      const points=obj.id==='road_bypass'?[[-8,.16,1],[-7,.16,3.5],[0,.16,3.5],[7,.16,3.5],[8,.16,1]]:[[obj.x,.16,obj.z],[obj.x,.16,target.z+1.2],[target.x+(isReturn?.8:-.8),.16,target.z+1.2],[target.x+(isReturn?.8:-.8),.16,target.z+.3]];
      const line=this.cable(points,mat);const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
      const particle=this.sphere(obj.x,.18,obj.z,.085,this.m.blue);particle.castShadow=false;
      this.conductors.push({obj,line,mat,curve,particle,isReturn,targetId:target.id});
      if(target.id==='shore-feeder'){const x=target.x+(isReturn?.8:-.8);this.box(x,.35,target.z+.3,.35,.7,.35,this.m.stone);this.cylinder(x,.75,target.z+.3,.13,.18,this.m.cream);}
      // Low ceramic insulators visibly keep each route distinct from the stone floor.
      for(let i=1;i<5;i++){const p=curve.getPoint(i/5);this.cylinder(p.x,.085,p.z,.095,.14,this.m.cream);}
    }
  }
  machine(obj){
    this.contact(obj.x,obj.z,4.5,3.7);
    if(['awaken','gate','pump','distribution','irrigation','beacon_supply','beacon_network','beacon_lens'].includes(obj.puzzle))return this.bespokeMachine(obj);
    this.solid(obj.x,obj.z,3.35,1.7,obj.id);
    const g=this.group(obj.x,0,obj.z),kind=(obj.id+' '+obj.kind+' '+obj.puzzle).toLowerCase();
    this.box(0,.12,0,2.45,.24,1.6,this.m.stoneDark,g);this.box(0,.72,0,1.9,1.2,1.15,this.m.darkwood,g);this.box(0,1.37,0,2.2,.18,1.35,this.m.brass,g);
    const panel=this.box(0,1.51,.02,1.8,.09,1.13,this.m.metal,g);panel.rotation.x=.18;
    for(const x of [-.7,.7]){this.cylinder(x,1.59,.3,.13,.09,this.m.brass,g);this.sphere(x,1.68,.3,.085,x<0?this.m.redcloth:this.m.blue,g);}
    this.cylinder(-.3,1.65,-.15,.24,.2,this.m.brass,g);this.cylinder(-.3,1.76,-.15,.18,.04,this.m.cream,g);
    this.box(.3,1.66,-.14,.4,.2,.4,this.m.darkwood,g);this.box(.3,1.79,-.14,.25,.06,.24,this.m.glass,g);
    this.cable([[obj.x-.7,1.68,obj.z+.3],[obj.x-.5,1.73,obj.z+.55],[obj.x+.2,1.68,obj.z+.5],[obj.x+.7,1.68,obj.z+.3]],this.m.brass);
    this.gear(0,.85,.63,.3,g);this.box(-.7,.72,.62,.2,.46,.09,this.m.blue,g);
    if(/pump|spring|water|riego|bomba/.test(kind)){this.cylinder(-1.25,1.1,-.1,.22,1.8,this.m.metal,g);this.torus(-1.25,2,-.1,.45,.14,this.m.brass,null,g);}
    if(/generator|power|source|faro|lighthouse|lente/.test(kind)){for(let i=0;i<3;i++){this.cylinder(-.6+i*.6,2,-.3,.16,.8,this.m.brass,g);for(let j=0;j<4;j++)this.torus(-.6+i*.6,1.7+j*.16,-.3,.19,.035,this.m.metal,[Math.PI/2,0,0],g);}}
    if(/gate|puerta/.test(kind)){this.box(0,2,-.5,1.9,.9,.25,this.m.wood,g);this.gear(.5,2,-.3,.28,g);}
    const ring=this.torus(0,.04,0,1.6,.025,this.m.brass,[Math.PI/2,0,0],g);ring.material=this.mat('#d7b46d',null,{emissive:'#886b25',emissiveIntensity:.35});
    for(let side of [-1,1]){this.box(side*1.35,.75,0,.55,1.4,1.5,this.m.darkwood,g);this.box(side*1.35,1.53,0,.65,.15,1.7,this.m.wood,g);for(let k=0;k<4;k++)this.cylinder(side*1.35,1.76,-.5+k*.3,.06,.3,this.m.metal,g);}
    this.box(0,2.13,-.62,2.2,.12,.24,this.m.wood,g);for(let k=0;k<6;k++)this.box(-.85+k*.3,2.35,-.63,.2,.37,.19,k%2?this.m.redcloth:this.m.brass,g);
    this.machines.push({obj,g,ring});return g;
  }
  bespokeMachine(obj){
    const g=this.group(obj.x,0,obj.z),type=obj.puzzle,animationStart=this.animations?.length||0,receiverMaterials=[];const pedestal=(r=.9,h=.8)=>{this.cylinder(0,.15,0,r+.35,.3,this.m.stoneDark,g);this.cylinder(0,h/2+.2,0,r,h,this.m.stone,g);this.cylinder(0,h+.25,0,r+.12,.15,this.m.brass,g);};
    const gauge=(x,y,z,r=.27)=>{this.cylinder(x,y,z,r,.10,this.m.brass,g).rotation.x=Math.PI/2;this.cylinder(x,y,z+.06,r*.81,.045,this.m.cream,g).rotation.x=Math.PI/2;this.beam([x,y,z+.1],[x+r*.5,y+r*.3,z+.1],.025,this.m.darkwood,g);for(let i=0;i<9;i++){const a=i/8*Math.PI*1.5-Math.PI*.25;this.sphere(x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65,z+.1,.014,this.m.darkwood,g);}};
    const terminal=(x,y,z,col=this.m.blue)=>{this.cylinder(x,y,z,.13,.3,this.m.brass,g);for(let i=0;i<3;i++)this.torus(x,y-.1+i*.1,z,.15,.03,this.m.cream,[Math.PI/2,0,0],g);this.sphere(x,y+.2,z,.095,col,g);};
    const footprints={gate:[2.5,1.3],distribution:[4.3,1.3],pump:[3.3,2.3],irrigation:[3.3,2.3],beacon_supply:[5,3.2],beacon_network:[4.1,4.5],beacon_lens:[3.5,3.3]};
    if(footprints[type])this.solid(obj.x,obj.z,...footprints[type],obj.id);
    if(type==='awaken'){
      this.obstacles.push({x:obj.x,z:obj.z,w:1.45,d:1.45,id:obj.id});
      pedestal(1.1,.72);this.torus(0,1.1,0,.84,.09,this.m.brass,[Math.PI/2,0,0],g);this.cylinder(0,1.04,0,.7,.1,this.m.dark,g);for(const side of [-1,1])terminal(side*.85,1.2,.15,side<0?this.m.redcloth:this.m.blue);
      const sleeping=this.automaton(0,0);sleeping.position.y=1.1;sleeping.userData.baseY=1.1;sleeping.rotation.z=.1;g.add(sleeping);this.dormantOhm=sleeping;this.box(0,1.0,.95,1.1,.14,.55,this.m.metal,g);
    }else if(type==='gate'||type==='distribution'){
      const wide=type==='distribution';this.box(0,.15,0,wide?3.8:2.1,.3,1.3,this.m.stoneDark,g);this.box(0,1.85,0,wide?3.4:1.7,3.4,.7,this.m.darkwood,g);this.box(0,1.9,.4,wide?3.1:1.4,3.08,.12,this.m.metal,g);
      const xs=wide?[-1.1,0,1.1]:[0];for(const x of xs){gauge(x,2.65,.51,.32);for(let y of [.8,1.3,1.8]){this.box(x,y,.55,.5,.2,.2,this.m.brass,g);this.box(x,y+.06,.72,.22,.12,.24,this.m.blue,g);}this.beam([x-.22,.7,.55],[x-.22,2.2,.55],.045,this.m.brass,g);}
      this.gear(wide?1.8:1.0,1.5,0,wide?.5:.65,g);this.box(0,3.65,0,wide?3.8:2.1,.22,1.0,this.m.brass,g);
    }else if(type==='pump'||type==='irrigation'){
      this.box(0,.15,0,3.3,.3,2.1,this.m.stoneDark,g);this.cylinder(-.3,1.1,0,.6,1.7,this.m.metal,g).rotation.z=Math.PI/2;this.torus(.45,1.1,0,.58,.16,this.m.brass,[0,Math.PI/2,0],g);
      for(const side of [-1,1]){this.cylinder(side*1.25,1.2,0,.19,2.25,this.m.brass,g);for(let y of [.4,1.3,2.0])this.torus(side*1.25,y,0,.23,.055,this.m.metal,[Math.PI/2,0,0],g);}
      this.cylinder(0,2.25,0,.18,2.5,this.m.brass,g).rotation.z=Math.PI/2;this.gear(.5,1.15,.65,.48,g);gauge(-.65,1.75,.46,.29);
      this.box(0,1.1,1.0,1.45,.8,.3,this.m.darkwood,g);terminal(-.45,1.68,1);terminal(.45,1.68,1,this.m.redcloth);this.torus(1.25,2.25,.45,.4,.05,this.m.redcloth,null,g);
    }else if(type==='beacon_supply'){
      this.box(0,.18,0,5,.36,3.2,this.m.stoneDark,g);this.box(0,1.1,-.25,3.8,1.7,1.5,this.m.metal,g);this.cylinder(0,1.25,-.15,.86,2.9,this.m.brass,g).rotation.z=Math.PI/2;
      for(const x of [-1.6,1.6]){this.cylinder(x,1.5,-.25,.5,2.5,this.m.darkwood,g);for(let k=0;k<10;k++)this.torus(x,.45+k*.22,-.25,.56,.085,this.m.brass,[Math.PI/2,0,0],g);terminal(x,3,-.25);}
      this.box(0,1.05,1,2.8,1.45,.7,this.m.darkwood,g);gauge(-.6,1.45,1.42,.32);gauge(.6,1.45,1.42,.32);this.box(0,.65,1.4,2.3,.12,.1,this.m.brass,g);
      this.gear(0,1.7,.8,.72,g);for(const side of [-1,1])this.beam([side*2.1,.3,-.8],[side*2.1,2.7,-.8],.14,this.m.metal,g);
    }else if(type==='beacon_network'){
      pedestal(1.7,.65);this.gear(0,1.05,0,1.65,g,'y');this.cylinder(0,1.9,0,.35,1.7,this.m.brass,g);this.gear(0,2.7,0,1.1,g,'y');
      for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.cos(a)*1.5,z=Math.sin(a)*1.5;this.cylinder(x,1.8,z,.11,2.6,this.m.metal,g);terminal(x,3.3,z);this.beam([x,2.6,z],[0,2.6,0],.09,this.m.brass,g);}
      this.box(0,1.0,1.8,2.4,1.5,.7,this.m.darkwood,g);gauge(-.65,1.35,2.2);gauge(.65,1.35,2.2);for(let x of [-.45,0,.45])this.box(x,.65,2.2,.16,.25,.17,this.m.brass,g);
    }else if(type==='beacon_lens'){
      pedestal(1.3,1.1);const optic=this.group(0,2.8,0,g);this.torus(0,0,0,1.4,.12,this.m.brass,null,optic);this.torus(0,0,0,1.5,.11,this.m.brass,[0,Math.PI/2,0],optic);this.torus(0,0,0,1.45,.09,this.m.brass,[Math.PI/2,0,0],optic);
      const glass=this.mat('#b1e0ce',null,{metalness:.35,roughness:.06,emissive:'#73d5c9',emissiveIntensity:0,transparent:true,opacity:.75});receiverMaterials.push({material:glass,intensity:.4});this.sphere(0,0,0,1,glass,optic,1.15);for(let i=0;i<7;i++)this.torus(0,-.9+i*.3,0,Math.sqrt(Math.max(.05,1-Math.pow((-.9+i*.3)/1.15,2))),.035,this.m.brass,[Math.PI/2,0,0],optic);
      this.animations.push({kind:'optic',obj:optic});for(const side of [-1,1])this.cylinder(side*1.6,1.8,0,.1,3.5,this.m.metal,g);gauge(0,1.35,1.35,.32);
    }
    if(type.startsWith('beacon')||type==='pump'||type==='irrigation'){
      let indicatorMaterial;
      g.traverse(node=>{if(node.material===this.m.blue){if(!indicatorMaterial){indicatorMaterial=this.m.blue.clone();indicatorMaterial.emissiveIntensity=0;this.sharedMaterials.add(indicatorMaterial);receiverMaterials.push({material:indicatorMaterial,intensity:.75});}node.material=indicatorMaterial;}});
      for(const animation of this.animations.slice(animationStart))if(animation.kind==='gear'||animation.kind==='optic')animation.receiverId=type==='beacon_network'?'tower_motor':obj.id;
    }
    if(type==='pump'||type==='irrigation')for(const animation of this.animations.slice(animationStart))if(animation.kind==='gear')animation.receiverId=obj.id;
    if(type.startsWith('beacon')){const stage=['beacon_supply','beacon_network','beacon_lens'].indexOf(type)+1;this.box(0,.065,2.85,2.1,.08,.7,this.m.stoneDark,g);for(let i=0;i<stage;i++)this.box((i-(stage-1)/2)*.3,.115,2.85,.11,.025,.42,this.m.brass,g);}
    if(type==='beacon_network')for(const animation of (this.animations||[]).slice(animationStart))if(animation.kind==='gear')animation.activationFlag='beacon_network';
    const ring=this.torus(0,.05,0,type.startsWith('beacon')?2.4:1.65,.025,this.mat('#d7b46d',null,{emissive:'#886b25',emissiveIntensity:.35}),[Math.PI/2,0,0],g);this.machines.push({obj,g,ring,receiverMaterials});return g;
  }
  curiosity(obj){const landmark=buildLandmark(this,obj);if(landmark){const b=landmark.userData.landmark.footprint;this.solid(b.x,b.z,b.w,b.d,obj.id);return landmark;}this.solid(obj.x,obj.z,1.25,.95,obj.id);const g=this.group(obj.x,0,obj.z);const kind=(obj.kind+' '+obj.id).toLowerCase();
    if(/note|book|journal|lore|plaque|sign|notice|observation/.test(kind)){this.box(0,.9,0,.9,1.8,.35,this.m.darkwood,g);const p=this.box(0,1.28,.22,.78,.7,.05,this.m.cream,g);p.rotation.x=-.1;for(let i=0;i<4;i++)this.box(0,1.5-i*.13,.26,.5-(i%2)*.1,.017,.01,this.m.darkwood,g);this.box(0,1.88,0,1.15,.16,.65,this.m.roof,g);}
    else if(/bench/.test(kind)){this.box(0,.55,0,2,.15,.7,this.m.wood,g);for(let x of [-.7,.7])this.box(x,.28,0,.16,.56,.65,this.m.darkwood,g);this.box(0,1.03,-.3,2,.5,.1,this.m.wood,g);}
    else{this.cylinder(0,.55,0,.5,1.1,this.m.stone,g);this.box(0,1.15,0,1.25,.15,.95,this.m.brass,g);this.box(0,1.35,0,.65,.15,.5,this.m.cream,g);this.torus(0,1.55,0,.3,.055,this.m.brass,[.5,0,0],g);}
    return g;
  }
  character(name,x,z,ambient=false){const g=new THREE.Group();g.position.set(x,this.groundHeight(x,z),z);
    const material=new THREE.SpriteMaterial({color:'#ffffff',transparent:true,depthWrite:true,alphaTest:.2});this.sharedMaterials.add(material);const sprite=new THREE.Sprite(material);g.add(sprite);const shadowMat=new THREE.MeshBasicMaterial({color:'#233c36',transparent:true,opacity:.23,depthWrite:false});this.sharedMaterials.add(shadowMat);const shadow=this.mesh('plane',shadowMat,0,.025,0,.86,.52,1,g);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
    const actor={g,sprite,name,phase:this.rand()*6,ambient,ambientTime:0,ambientRest:2,ambientStep:0,ambientTarget:null,animation:idleActor(),origin:new THREE.Vector3(x,0,z)};this.actors.push(actor);this.applyCharacterArt(actor);if(ambient){actor.ambientRest=1.5+actor.phase*.2;g.position.x+=Math.sin(actor.phase)*.8;g.position.z+=Math.cos(actor.phase)*.3;g.position.y=this.groundHeight(g.position.x,g.position.z);this.root.add(g);}return g;}
  moveAmbientActor(actor,dt){
    actor.ambientTime+=dt;
    if(actor.ambientRest>0){actor.ambientRest=Math.max(0,actor.ambientRest-dt);return;}
    const position=actor.g.position;
    if(!actor.ambientTarget){
      for(let attempt=0;attempt<8;attempt++){
        const angle=actor.phase+(actor.ambientStep%2)*Math.PI+attempt*Math.PI/4,x=actor.origin.x+Math.cos(angle)*.85,z=actor.origin.z+Math.sin(angle)*.85,dx=x-position.x,dz=z-position.z,distance=Math.hypot(dx,dz);
        if(distance<.65)continue;
        const samples=Math.ceil(distance/.1);let clear=true;
        for(let i=1;i<=samples;i++)if(!this.canStand(position.x+dx*i/samples,position.z+dz*i/samples)){clear=false;break;}
        if(clear){actor.ambientTarget=[x,z];actor.ambientStep++;break;}
      }
      if(!actor.ambientTarget){actor.ambientRest=2.5;return;}
    }
    const dx=actor.ambientTarget[0]-position.x,dz=actor.ambientTarget[1]-position.z,distance=Math.hypot(dx,dz);
    if(distance<.001){actor.ambientTarget=null;actor.ambientRest=2.5+(actor.phase%1)*1.2;return;}
    const step=Math.min(distance,1.4*dt),x=position.x+dx/distance*step,z=position.z+dz/distance*step;
    if(isSegmentClear([position.x,position.z],[x,z],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)}))position.set(x,this.groundHeight(x,z),z);
    else{actor.ambientTarget=null;actor.ambientRest=1.5;return;}
    if(step===distance){actor.ambientTarget=null;actor.ambientRest=2.5+(actor.phase%1)*1.2;}
  }
  automaton(x,z,companion=false){
    const g=new THREE.Group();g.position.set(x,0,z);
    if(companion&&this.ohmFrames){
      const material=new THREE.SpriteMaterial({map:this.ohmFrames[0][0],color:'#ffffff',transparent:true,depthWrite:true,alphaTest:.2});this.sharedMaterials.add(material);
      const sprite=new THREE.Sprite(material);sprite.center.set(.5,12/256);sprite.position.y=.025;sprite.scale.set(2.35,2.35,1);g.add(sprite);
      const shadowMaterial=new THREE.MeshBasicMaterial({map:this.textures.glow,color:'#152b2a',transparent:true,opacity:.36,depthWrite:false});this.sharedMaterials.add(shadowMaterial);
      const shadow=this.mesh('plane',shadowMaterial,0,.022,0,1.1,.76,1,g);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
      g.userData.ohmSprite=sprite;g.userData.direction=0;return g;
    }
    // One continuous instrument housing; the broad skids overlap its flat underside.
    const profile=[[0,.13],[.33,.13],[.46,.23],[.55,.44],[.56,.68],[.50,.97],[.35,1.22],[.16,1.34],[0,1.37]].map(p=>new THREE.Vector2(...p));
    const shell=new THREE.LatheGeometry(profile,32);this.localGeometries.push(shell);this.mesh(shell,this.m.brass,0,0,0,1,1,.83,g);
    const base=new THREE.LatheGeometry(profile.slice(1,4),32);this.localGeometries.push(base);this.mesh(base,this.mat('#2e6565',null,{metalness:.55,roughness:.4}),0,0,0,1.005,1,.834,g);
    const outline=new THREE.Shape();outline.moveTo(-.12,-.43);outline.lineTo(.12,-.43);outline.quadraticCurveTo(.19,-.43,.19,-.36);outline.lineTo(.19,.36);outline.quadraticCurveTo(.19,.43,.12,.43);outline.lineTo(-.12,.43);outline.quadraticCurveTo(-.19,.43,-.19,.36);outline.lineTo(-.19,-.36);outline.quadraticCurveTo(-.19,-.43,-.12,-.43);
    const skid=new THREE.ExtrudeGeometry(outline,{depth:.13,bevelEnabled:true,bevelThickness:.03,bevelSize:.025,bevelSegments:2,steps:1,curveSegments:4});skid.center();skid.rotateX(-Math.PI/2);this.localGeometries.push(skid);
    for(const side of [-1,1])this.mesh(skid,this.m.brass,side*.25,.095,.03,1,1,1,g);
    this.cylinder(0,.81,.432,.235,.075,this.m.dark,g).rotation.x=Math.PI/2;
    this.torus(0,.81,.473,.219,.035,this.m.brass,null,g);
    this.cylinder(0,.81,.474,.177,.015,this.m.blue,g).rotation.x=Math.PI/2;
    this.sphere(-.052,.87,.489,.026,this.m.white,g);
    this.animations.push({kind:'ohm',obj:g,phase:this.rand()*6,companion});return g;
  }
  buildExitMarkers(){for(const exit of this.area.exits||[]){const g=this.group(exit.x,0,exit.z);if(this.continuous&&exit.target!=='workshop'){const sign=this.group(exit.x+2.6,0,exit.z);this.box(0,.7,0,.13,1.4,.13,this.m.darkwood,sign);this.box(0,1.25,0,.85,.28,.14,this.m.wood,sign);this.box(0,1.26,.081,.35,.035,.025,this.m.cream,sign);sign.userData.interaction=exit;this.solid(exit.x+2.6,exit.z,.25,.25,"waypost");this.objectModels.set(exit.id,sign);continue;}const ring=this.torus(0,.052,0,.72,.035,this.m.brass,[Math.PI/2,0,0],g);for(let i=0;i<3;i++){const arrow=this.box(0,.06,.3-i*.32,.24,.025,.24,this.m.cream,g);arrow.rotation.y=Math.PI/4;}if(Math.abs(exit.x)>4)this.sign(exit.x+(exit.x>0?1:-1),exit.z-1.1);this.animations.push({kind:'exit',obj:ring,phase:this.rand()*6});this.objectModels.set(exit.id,g);}}
  smoke(x,y,z){const group=this.group(x,y,z);const material=new THREE.SpriteMaterial({map:this.textures.glow,color:'#bbc5b0',transparent:true,opacity:.06,depthWrite:false});this.sharedMaterials.add(material);for(let i=0;i<4;i++){const s=new THREE.Sprite(material);s.position.set(i*.1,i*.6,0);s.scale.setScalar(.8+i*.3);group.add(s);}this.animations.push({kind:'smoke',obj:group,phase:this.rand()*6});}
  buildAtmosphere(w,d){
    const count=220,positions=new Float32Array(count*3),colors=new Float32Array(count*3);for(let i=0;i<count;i++){positions[i*3]=(this.rand()-.5)*(w+12);positions[i*3+1]=.4+this.rand()*9;positions[i*3+2]=(this.rand()-.5)*(d+12);const c=new THREE.Color(i%5===0?'#ffda83':'#e6e5ba');c.toArray(colors,i*3);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));this.localGeometries.push(geo);const mat=new THREE.PointsMaterial({size:.08,map:this.textures.glow,transparent:true,opacity:.63,depthWrite:false,vertexColors:true,blending:THREE.AdditiveBlending});this.sharedMaterials.add(mat);this.dust=new THREE.Points(geo,mat);this.root.add(this.dust);
    const mistMat=new THREE.SpriteMaterial({map:this.textures.glow,color:'#b8d1ce',transparent:true,opacity:.038,depthWrite:false});this.sharedMaterials.add(mistMat);for(let i=0;i<(this.area.id==='workshop'?0:5);i++){const s=new THREE.Sprite(mistMat);s.position.set((this.rand()-.5)*w,.5+this.rand(),(this.rand()-.5)*d);s.scale.set(13+this.rand()*6,1.5+this.rand()*2,1);this.root.add(s);this.animations.push({kind:'mist',obj:s,phase:this.rand()*6,baseX:s.position.x});}
  }

  updateFlags(state){const f=state.flags||{};this.restored=!!(f.beacon_lens||f.lighthouse_restored||f.lighthouseRestored||f.faro_restaurado||f.arc_complete||f.lighthouse);for(const m of this.machines){const active=!!(f[m.obj.flag]||f[m.obj.puzzle]||f[`${m.obj.puzzle}_solved`]||f[`${m.obj.id}_solved`]);m.active=active;m.ring.material.color.set(active?'#6fcdb4':'#d7b46d');m.ring.material.emissive.set(active?'#39b38a':'#886b25');m.ring.material.emissiveIntensity=active?1.2:.35;}
    for(const machine of this.machines)if(machine.receiverMaterials?.length){machine.receiverFeedback=readReceiverFeedback(this.area.id,state,machine.obj.id);for(const receiver of machine.receiverMaterials)receiver.material.emissiveIntensity=receiver.intensity*machine.receiverFeedback.level;}
    for(const animation of this.animations||[])if(animation.receiverId)animation.receiverFeedback=readReceiverFeedback(this.area.id,state,animation.receiverId);
    const feedback=new Map();
    for(const lever of this.levers){const signal=readControlFeedback(this.area.id,state,lever.obj);feedback.set(lever.obj.id,signal);lever.feedback=signal;lever.active=signal.engaged;lever.indicator.material.color.set(signal.mechanical?'#bfac81':signal.overloaded?'#ae7351':signal.flowing?'#8dd5b0':'#8e8b70');lever.indicator.material.emissive.set(signal.flowing?'#71d6a8':'#000000');lever.indicator.material.emissiveIntensity=signal.flowing?.85:0;}
    for(const wire of this.conductors){const signal=feedback.get(wire.obj.id)||readControlFeedback(this.area.id,state,wire.obj);wire.active=signal.flowing;wire.current=signal.current;wire.overloaded=signal.overloaded;wire.mat.emissive.set(wire.active?(wire.isReturn?'#498fa8':'#d5943f'):'#000000');wire.mat.emissiveIntensity=wire.active?.2+Math.min(Math.abs(signal.current),2)*.18:0;wire.particle.visible=wire.active;}
    const powerFlags={portal:'awaken',plaza:'workshop',workshop:'workshop',road:'gate',spring:'pump',castle:'distribution',terraces:'irrigation',lake:'beacon_link',lighthouse:'beacon_network'};this.areaEnergized=!!(f[powerFlags[this.area.id]]||(this.area.id==='lighthouse'&&f.beacon_lens));
    if(this.ohm)this.ohm.visible=!!(f.awaken||f.ohm_awake||f.ohmAwake||f.ohm_restored||f.ohm||this.area.id!=='portal');
    if(this.dormantOhm)this.dormantOhm.visible=!f.awaken;
    this.springWaterworks?.update(f);
    for(const water of this.irrigationWater||[])water.visible=!!f.irrigation;
    for(const stream of this.fountainStreams)stream.visible=!!f.pump;
    for(const water of this.fountainWater)water.visible=!!f.pump;
    if(this.gateObstacle){const present=this.obstacles.includes(this.gateObstacle);if(f.gate&&present)this.obstacles.splice(this.obstacles.indexOf(this.gateObstacle),1);if(!f.gate&&!present)this.obstacles.push(this.gateObstacle);}
    this.renderer.shadowMap.needsUpdate=true;
  }
  update(dt,state=this.state,input={x:0,z:0,run:false}){
    if(!this.area)return;const elapsed=Number.isFinite(dt)?Math.max(0,dt):.016;dt=Math.min(elapsed,.05);this.clock+=dt;this.state=state;if(this._quality!==(state.settings?.quality||'high'))this.resize();const reduced=!!state.settings?.reducedMotion;const flags=worldFeedbackSignature(this.area,state);if(flags!==this._lastFlags){this._lastFlags=flags;this.updateFlags(state);}
    const playerX=this.player.position.x,playerZ=this.player.position.z;
    const controlsPaused=!!input.paused||!!this.cinematic;
    let mx=input.x||0,mz=input.z||0,walking=false;
    if(controlsPaused){this.target=null;this.route=[];}
    if(!this.inspect&&!controlsPaused){
      let vx=0,vz=0;const speed=input.run?7:4.2;
      if(mx||mz){this.target=null;this.route=[];const len=Math.hypot(mx,mz);mx/=Math.max(1,len);mz/=Math.max(1,len);vx=mx*speed*dt;vz=mz*speed*dt;}
      else if(this.target){const dx=this.target[0]-this.player.position.x,dz=this.target[1]-this.player.position.z,dist=Math.hypot(dx,dz);if(dist<.16)this.target=this.route?.shift()||null;else{vx=dx/dist*Math.min(speed*dt,dist);vz=dz/dist*Math.min(speed*dt,dist);}}
      if(vx||vz){const old=this.player.position.clone();this.move(vx,vz);walking=this.player.position.distanceToSquared(old)>.000001;if(!walking&&this.target){this._blocked=(this._blocked||0)+dt;if(this._blocked>.25)this.target=null;}else this._blocked=0;}
    }
    this.player.position.y=this.groundHeight(this.player.position.x,this.player.position.z);
    this.walking=walking;const actor=this.actors.find(a=>a.g===this.player);if(actor)this.animateActor(actor,this.player.position.x-playerX,this.player.position.z-playerZ,dt,{paused:controlsPaused||this.inspect,reducedMotion:reduced});
    this.updateCompanion(dt,!controlsPaused&&!this.inspect,reduced);
    updateInhabitants(this,dt,state,{paused:controlsPaused||this.inspect,reducedMotion:reduced});
    const motion=reduced?0:1;
    for(const a of this.animations){const t=this.clock;
      if(a.kind==='gear')a.obj.rotation.z+=dt*a.speed*motion*(a.receiverId?(a.receiverFeedback?.moving?Math.min(1.2,a.receiverFeedback.level):0):a.activationFlag?(state.flags?.[a.activationFlag]?1:0):this.area.id==='spring'?(state.flags?.spring_drive||state.flags?.pump?1:0):this.restored?2:1);
      if(a.kind==='optic')a.obj.rotation.y+=dt*.2*motion*(a.receiverId?(a.receiverFeedback?.moving?Math.min(1.2,a.receiverFeedback.level):0):this.restored?1.2:(state.flags?.beacon_network&&state.flags?.tower_lens_free?.45:0));
      if(a.kind==='wheel')a.obj.rotation.z+=dt*a.speed*motion*(this.area.id==='spring'?(state.flags?.spring_sluice||state.flags?.pump?1:0):this.area.id==='terraces'?(state.flags?.irrigation?1:.15):1);
      if(a.kind==='tree')a.obj.rotation.z=Math.sin(t*.55+a.phase)*.009*motion;
      if(a.kind==='banner')a.obj.rotation.y=Math.sin(t*1.3+a.phase)*.07*motion;
      if(a.kind==='boat'){a.obj.position.y=.18+Math.sin(t*.8+a.phase)*.06*motion;a.obj.rotation.z=Math.sin(t*.65+a.phase)*.02*motion;}
      if(a.kind==='smoke'){a.obj.rotation.y=Math.sin(t*.1+a.phase)*.3;a.obj.position.x+=Math.sin(t*.3+a.phase)*dt*.02*motion;}
      if(a.kind==='ohm'){a.obj.position.y=(a.obj.userData.baseY||0)+Math.sin(t*2+a.phase)*.025*motion;}
      if(a.kind==='mist')a.obj.position.x=a.baseX+Math.sin(t*.045+a.phase)*2*motion;
      if(a.kind==='exit')a.obj.scale.setScalar(1+Math.sin(t*2+a.phase)*.035*motion);
      if(a.kind==='beacon'){if(this.cinematic?.timeline.id==='beacon_lens'&&a.main)a.obj.rotation.y=-Math.PI*.13+Math.sin(t*.22)*.12*motion;else a.obj.rotation.y+=dt*.17*motion;a.material.opacity=THREE.MathUtils.lerp(a.material.opacity,this.restored?.15:.0,dt*1.5);a.material.uniforms.strength.value=a.material.opacity;a.beacon.scale.copy(a.baseScale).multiplyScalar((this.restored?1.12:1)*(.99+Math.sin(t*2)*.02*motion));a.beacon.material.emissiveIntensity=THREE.MathUtils.lerp(a.beacon.material.emissiveIntensity,this.restored?4:.03,dt);a.halo.material.opacity=THREE.MathUtils.lerp(a.halo.material.opacity,this.restored?.75:0,dt);if(a.light)a.light.intensity=THREE.MathUtils.lerp(a.light.intensity,this.restored?80:0,dt);}
    }
    if(this.gateway){const scene=this.cinematic?.timeline,opening=scene?.id==='gate'&&scene.returnAt>0;const t=opening?THREE.MathUtils.clamp((this.cinematic.elapsed+elapsed-.65)/2.6,0,1):state.flags?.gate?1:0;const progress=opening?t*t*(3-2*t):t;const signal=this.levers.find(lever=>lever.obj.id==='road_send')?.feedback;this.gateway.setPose(progress,!!signal?.flowing,!!signal?.overloaded);}
    else if(this.gateLeaf)this.gateLeaf.position.y=state.flags?.gate?5.8:0;
    this._shadowTick=(this._shadowTick||0)+dt;if(this._shadowTick>.3){this.renderer.shadowMap.needsUpdate=true;this._shadowTick=0;}
    this.waterMaterials.forEach(m=>{if(m.uniforms?.time)m.uniforms.time.value=this.clock*motion;});
    for(const lever of this.levers){const axis=lever.waterHandle?'z':'x';lever.pivot.rotation[axis]=THREE.MathUtils.lerp(lever.pivot.rotation[axis],lever.active?-.65:.65,Math.min(1,dt*8));}
    for(const wire of this.conductors){if(wire.active){const t=reduced?.5:(this.clock*(.1+Math.min(Math.abs(wire.current),2)*.1))%1;wire.particle.position.copy(wire.curve.getPoint(wire.isReturn?1-t:t));}}
    updateDaylight(this,state,dt);
    if(this.dust){this.dust.rotation.y=Math.sin(this.clock*.02)*.025*motion;this.dust.position.y=Math.sin(this.clock*.2)*.1*motion;}
    const rest=gameplayCameraPose(this.area.id,this.player.position.toArray()),wanted=new THREE.Vector3().fromArray(rest.focus);let zoom=rest.zoom;
    if(this.inspect){const near=this.getNearby();if(near){wanted.set(near.x,1,near.z);zoom=1.55;}}
    if(this.cinematic){const active=this.cinematic;active.elapsed+=elapsed;const sample=sampleCinematic(active.timeline,active.elapsed);this.focus.fromArray(sample.pose.focus);this.cameraOffset.fromArray(sample.pose.offset);this.currentZoom=sample.pose.zoom;if(sample.done)this.cinematic=null;}
    else{this.focus.lerp(wanted,1-Math.exp(-dt*(this.inspect?2:3.6)));this.currentZoom=THREE.MathUtils.lerp(this.currentZoom,zoom,1-Math.exp(-dt*2.6));this.cameraOffset.lerp(new THREE.Vector3(0,13.5,25),1-Math.exp(-dt*2.6));}
    this.camera.position.copy(this.focus).addScaledVector(this.cameraOffset,2);this.camera.lookAt(this.focus.x,this.focus.y,this.focus.z);this.camera.zoom=this.currentZoom;this.camera.updateProjectionMatrix();
    const treeYaw=Math.atan2(this.cameraOffset.x,this.cameraOffset.z);for(const entry of this.treeModels){if(entry.g.userData.treePlane)entry.g.userData.treePlane.rotation.y=treeYaw;}
    this.grade.uniforms.time.value=this.clock;this.grade.uniforms.restored.value=THREE.MathUtils.lerp(this.grade.uniforms.restored.value,this.restored?1:0,dt*.5);
    if(this.restoration>0){this.restoration-=dt;this.bloom.strength=.38+Math.max(0,this.restoration/3)*.35;}
    if(!input.suppressRender)this.composer.render();
  }
  updateCompanion(dt,canMove,reduced){
    const p=this.ohm.position,player=this.player.position,sprite=this.ohm.userData.ohmSprite,radius=.42;
    if(!this.canStand(p.x,p.z,radius)){const safe=this.nearestWalkable([p.x,p.z],radius);p.set(safe[0],0,safe[1]);this.companionRoute=[];}
    const distance=Math.hypot(player.x-p.x,player.z-p.z);let moving=false;
    this.companionRouteAge=(this.companionRouteAge||0)+dt;
    if(canMove&&distance>1.5){
      if(this.companionRouteAge>=.4||!this.companionRoute?.length){this.companionRoute=findPath([p.x,p.z],[player.x,player.z],this.bounds,this.obstacles,{radius,isWalkable:(x,z)=>this.walkableLand(x,z)});this.companionRouteAge=0;}
      while(this.companionRoute.length&&Math.hypot(this.companionRoute[0][0]-p.x,this.companionRoute[0][1]-p.z)<.08)this.companionRoute.shift();
      const target=this.companionRoute[0];
      if(target){const dx=target[0]-p.x,dz=target[1]-p.z,length=Math.hypot(dx,dz),step=Math.min(length,dt*(distance>4?7.5:4.6)),x=p.x+dx/length*step,z=p.z+dz/length*step;
        if(isSegmentClear([p.x,p.z],[x,z],this.bounds,this.obstacles,{radius,isWalkable:(x,z)=>this.walkableLand(x,z)})){p.x=x;p.z=z;moving=true;if(sprite)this.ohm.userData.direction=Math.abs(dx)>Math.abs(dz)?(dx>0?1:3):(dz>0?0:2);else this.ohm.rotation.y=Math.atan2(dx,dz);}else this.companionRoute=[];
      }
    }else if(distance<=1.5)this.companionRoute=[];
    p.y=this.groundHeight(p.x,p.z);
    if(sprite)sprite.material.map=this.ohmFrames[this.ohm.userData.direction||0][moving&&!reduced?Math.floor(this.clock*8)%6:0];
  }
  move(dx,dz){const p=this.player.position;[p.x,p.z]=moveWithCollisions([p.x,p.z],[dx,dz],this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});}
  getPlayerPosition(){return this.player?[this.player.position.x,this.player.position.z]:[0,0];}
  setPlayerPosition(pos){if(!this.player)return;const safe=this.nearestWalkable(pos);this.player.position.set(safe[0],this.groundHeight(...safe),safe[1]);this.target=null;this.route=[];this.companionRoute=[];this.companionRouteAge=0;if(this.ohm){const companion=this.nearestWalkable([safe[0]-1,safe[1]+.7],.42);this.ohm.position.set(companion[0],this.groundHeight(...companion),companion[1]);}}
  getInteractions(){if(!this.area)return [];return [...(this.area.objects||[]).filter(o=>o.kind!=='npc'&&!o.character),...(this.area.exits||[]),...getInhabitantInteractions(this)].filter(o=>!o.hidden&&(!o.requiresFlag||this.state.flags?.[o.requiresFlag]));}
  getAudioScene(){return describeWorldAudio(this);}
  canInteractWith(object){return !!object&&inInteractionReach(this,object);}
  approachInteraction(object){const route=approachInteraction(this,object);if(route===null)return false;this.route=route;this.target=this.route.shift()||null;this._blocked=0;return true;}
  pickInteraction(clientX,clientY){
    const rect=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),this.camera);
    const interactions=this.getInteractions(),available=new Map(interactions.map(o=>[o.id,o]));
    this.root.updateMatrixWorld(true);
    for(const hit of this.raycaster.intersectObjects(this.root.children,true)){
      let node=hit.object,visible=true,target=null;
      const material=Array.isArray(node.material)?node.material[hit.face?.materialIndex||0]:node.material;
      // Light halos, mist and contact shadows do not extend their owner's hitbox.
      if(material&&(!material.visible||material.opacity<=0||material.transparent&&material.depthWrite===false))continue;
      // Sprite raycasts cover the whole atlas rectangle, including empty padding.
      if(node.isSprite&&material?.alphaTest>0&&material.map?.image?.getContext&&hit.uv){
        const map=material.map,image=map.image,uv=map.transformUv(hit.uv.clone());
        const x=Math.min(image.width-1,Math.max(0,Math.floor(uv.x*image.width))),y=Math.min(image.height-1,Math.max(0,Math.floor(uv.y*image.height)));
        const pixel=image.getContext('2d').getImageData(x,y,1,1).data;
        if(pixel[3]/255*material.opacity<material.alphaTest)continue;
      }
      for(let parent=node;parent;parent=parent.parent){if(!parent.visible)visible=false;if(parent.userData.interaction)target=available.get(parent.userData.interaction.id);if(parent===this.ohm)target=available.get('ohm_companion');}
      if(!visible)continue;
      if(target)return target;
      if(node===this.player||node.material?.transparent||node.material?.alphaTest>0)continue;
      break;
    }
    // Doorway rings are painted on the walkable threshold, and have no solid mesh.
    for(const exit of this.area.exits){const p=this.getScreenPosition(exit);if(p.visible&&Math.hypot(clientX-rect.left-p.x,clientY-rect.top-p.y)<23)return exit;}
    return null;
  }
  getNearby(){
    if(!this.area||!this.player)return null;const p=this.player.position;let best=null,dist=Infinity,priority=-Infinity;
    for(const o of this.getInteractions()){
      const d=Math.hypot(o.x-p.x,o.z-p.z),rank=o.interactionPriority||0;
      if(d>=(o.radius||2.85)||rank<priority||rank===priority&&d>=dist)continue;
      if(!inInteractionReach(this,o,[p.x,p.z]))continue;
      best=o;dist=d;priority=rank;
    }return best;
  }
  beginInhabitantConversation(target){beginInhabitantConversation(this,target);}
  faceInhabitantSpeaker(speaker){faceInhabitantSpeaker(this,speaker);}
  endInhabitantConversation(){endInhabitantConversation(this);}
  getScreenPosition(obj){const rect=this.canvas.getBoundingClientRect();const pos=new THREE.Vector3(obj.x||0,obj.target?.35:obj.character==='ohm'?1.25:obj.character||obj.kind==='npc'?2.8:1.8,obj.z||0);pos.project(this.camera);return{x:(pos.x*.5+.5)*rect.width,y:(-.5*pos.y+.5)*rect.height,visible:pos.z>-1&&pos.z<1&&Math.abs(pos.x)<1&&Math.abs(pos.y)<1};}
  pick(clientX,clientY){const rect=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),this.camera);const hit=new THREE.Vector3();if(this.raycaster.ray.intersectPlane(this.groundPlane,hit)){return[THREE.MathUtils.clamp(hit.x,-this.bounds[0]/2+.6,this.bounds[0]/2-.6),THREE.MathUtils.clamp(hit.z,-this.bounds[1]/2+.6,this.bounds[1]/2-.6)];}return null;}
  setTarget(pos){if(pos){this.route=findPath(this.getPlayerPosition(),pos,this.bounds,this.obstacles,{radius:.34,isWalkable:(x,z)=>this.walkableLand(x,z)});this.target=this.route.shift()||null;this._blocked=0;}}
  setInspection(value){this.inspect=!!value;if(value){this.target=null;this.route=[];}}
  cameraPose(){return{focus:this.focus.toArray(),offset:this.cameraOffset.toArray(),zoom:this.currentZoom};}
  startCinematic(id,{reducedMotion=false}={}){
    if(this.cinematic||!this.area||!this.player||this.disposed||reducedMotion||this.state.settings?.reducedMotion)return false;
    const puzzle=(this.area.objects||[]).find(o=>o.puzzle===id);if(!puzzle)return false;
    const timeline=createCinematic(id,{areaId:this.area.id,flags:this.state.flags,player:this.player.position.toArray(),companion:this.ohm?.position.toArray(),puzzle:[puzzle.x,1.4,puzzle.z],bounds:this.coreBounds||this.bounds,start:this.cameraPose()});
    if(!timeline)return false;
    this.updateFlags(this.state);this.inspect=false;this.target=null;this.route=[];this.walking=false;
    if(id==='awaken'&&this.ohm?.userData.ohmSprite&&this.ohmFrames){this.ohm.userData.direction=0;this.ohm.userData.ohmSprite.material.map=this.ohmFrames[0][0];}
    if(id==='gate'&&this.gateway)this.gateway.setPose(0,true);
    this.cinematic={timeline,elapsed:0};return true;
  }
  getCinematicState(){if(!this.cinematic)return null;const {id,caption,returning}=sampleCinematic(this.cinematic.timeline,this.cinematic.elapsed);return{id,caption,returning};}
  skipCinematic(){if(!this.cinematic||this.getCinematicState().returning)return false;const id=this.cinematic.timeline.id,game=gameplayCameraPose(this.area.id,this.player.position.toArray());this.cinematic={timeline:returningCinematic(id,this.cameraPose(),game),elapsed:0};return true;}
  cancelCinematic(){this.cinematic=null;this.inspect=false;this.target=null;this.route=[];this.walking=false;if(!this.area||!this.player)return;const pose=gameplayCameraPose(this.area.id,this.player.position.toArray());this.focus.fromArray(pose.focus);this.cameraOffset.fromArray(pose.offset);this.currentZoom=pose.zoom;this.camera.position.copy(this.focus).addScaledVector(this.cameraOffset,2);this.camera.lookAt(this.focus);this.camera.zoom=this.currentZoom;this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();for(const entry of this.treeModels||[])if(entry.g.userData.treePlane)entry.g.userData.treePlane.rotation.y=0;}
  endCinematic(){this.cancelCinematic();}
  playRestoration(flag){this.restoration=3;this.updateFlags(this.state);if(flag)this._lastFlags='';}
  resize(){const w=this.canvas.clientWidth||window.innerWidth,h=this.canvas.clientHeight||window.innerHeight;this._quality=this.state.settings?.quality||'high';const low=this._quality==='low';this.renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.7));this.renderer.shadowMap.enabled=!low;this.renderer.shadowMap.needsUpdate=true;this.bloom.enabled=!low;this.renderer.setSize(w,h,false);this.composer.setPixelRatio(this.renderer.getPixelRatio());this.composer.setSize(w,h);const aspect=w/h,height=24;this.camera.left=-height*aspect/2;this.camera.right=height*aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();}
  clearArea(){this.cinematic=null;this.gateway=null;this.springWaterworks=null;if(this.root){this.root.traverse(obj=>{if(obj.isInstancedMesh)obj.dispose();if(obj.isLight){obj.shadow?.map?.dispose();obj.shadow?.mapPass?.dispose();}});this.scene.remove(this.root);for(const geo of this.localGeometries||[])geo.dispose();for(const mat of this.sharedMaterials)mat.dispose();this.sharedMaterials.clear();this.root=null;}}
  dispose(){this.disposed=true;this.clearArea();for(const g of this.sharedGeometries)g.dispose();Object.values(this.textures).forEach(t=>t.dispose());Object.values(this.bumpTextures||{}).forEach(t=>t.dispose());this.bankTextures?.forEach(t=>t.dispose());this.treeTextures?.forEach(t=>t.dispose());Object.values(this.atlasFrames||{}).flat(2).forEach(t=>t.dispose());this.ohmFrames?.flat().forEach(t=>t.dispose());this.composer.dispose();this.renderer.dispose();}
}
