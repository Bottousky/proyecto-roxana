// The Instituto Roxana rendered in PlayCanvas: a diorama the student explores by
// clicking. The camera orbits a floating island; entering a room lifts its roof and
// lowers the walls toward the camera. The school's stage (from the Ohmdal save)
// switches on what each restoration returned: light, water, flowers, the tower lamp.
import {Application,Entity,StandardMaterial,Color,Vec3,Quat,Mesh,MeshInstance,CameraFrame,Curve,CurveSet,Texture,
  FILLMODE_FILL_WINDOW,RESOLUTION_AUTO,TONEMAP_ACES,BLEND_NORMAL,BLEND_ADDITIVE,CULLFACE_NONE,CULLFACE_FRONT,
  EMITTERSHAPE_BOX,EMITTERSHAPE_SPHERE,EnvLighting,FOG_LINEAR,TEXTUREPROJECTION_EQUIRECT,SHADOW_PCF5_16F,SSAOTYPE_LIGHTING,SSAOTYPE_NONE,PIXELFORMAT_RGBA8,FILTER_LINEAR,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';
import {buildSchool,BUILDINGS,TOWER,LAMPS,STANDS,FOUNTAIN,AMPHI,ISLAND,TALLERES,WORLD_ORDER} from './school.js';
import {makeWorldPortal,PORTAL_COLORS} from './portalfx.js';
import {loadStatueGlb,statueEntity} from './statue.js';
import {buildLandscape} from './landscape.js';
const statueUrl=import.meta.env.BASE_URL+'escuela/modelos/roxana-estatua.glb';
import {grain,meadow,tree,glow,earth,sign,dynamicCanvas,marble} from './textures.js';
import {makeWater,updateWater,bindShore} from '../water.js';
import {actorArt} from '../art.ts';
import {ROOMS,OVERVIEW,SHOWCASE} from './rooms.js';

const col=s=>new Color().fromString(s);
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const mixColor=(a,b,t)=>new Color(lerp(a.r,b.r,t),lerp(a.g,b.g,t),lerp(a.b,b.b,t));
const linear=c=>new Color(Math.pow(c.r,2.2),Math.pow(c.g,2.2),Math.pow(c.b,2.2));

// Light of the hour. Sun: [pitch, yaw, colour, intensity]; sky: zenith and horizon.
export const HOURS={
  manana:{label:'Mañana',sun:[52,-30,'#fff1d6',1.75],ambient:'#a9b8c2',zenith:'#5f8fbf',horizon:'#d6e6ea',below:'#87a6b4',lamps:.15,windows:.1,grade:[1.02,1,1,1.01,1.02],cloud:'#ffffff',env:.85},
  tarde:{label:'Tarde',sun:[30,-58,'#ffd49a',1.9],ambient:'#a59c9e',zenith:'#5a7fae',horizon:'#f6c894',below:'#c79c80',lamps:.55,windows:.45,grade:[1.04,1.05,1,.9,1],cloud:'#fff0dc',env:.8},
  noche:{label:'Noche',sun:[46,40,'#9fb4ff',.38],ambient:'#3c4a66',zenith:'#070d20',horizon:'#2a3a5e',below:'#10182c',lamps:1,windows:1,grade:[.85,.86,.92,1.12,.95],cloud:'#8795b8',env:.45},
};
export function hourFor(date=new Date()){const h=date.getHours();return h>=7&&h<15?'manana':h>=15&&h<20?'tarde':'noche';}

const MATERIALS={
  grass:{map:'meadow',color:'#d2d8a8'},turf:{map:'grass',color:'#7f9353'},earth:{map:'earth',color:'#b09274'},soil:{color:'#4b3b2d'},
  stone:{map:'stone',color:'#d3c6ac'},stoneDark:{map:'stone',color:'#9a9080'},cobble:{map:'cobble',color:'#c0b49d'},
  plaster:{map:'stone',contrast:.28,color:'#ecdfc4'},statue:{map:'stone',contrast:.35,color:'#dcd6ca'},
  slate:{map:'slate',color:'#5f737b'},roofPhysica:{map:'slate',color:'#a0624c'},roofBitland:{map:'slate',color:'#5f6c92'},roofArithmos:{map:'slate',color:'#6d8559'},
  wood:{map:'wood',color:'#a4744c'},woodDark:{map:'wood',color:'#5c3f2c'},floor:{map:'wood',color:'#b88b62'},hedge:{map:'grass',color:'#6a8a4a'},
  bronze:{map:'copper',color:'#c79c5c',metal:.8,gloss:.55},copper:{map:'copper',color:'#c47f4c',metal:.7,gloss:.5},iron:{color:'#393e43',metal:.55,gloss:.45},
  paint:{color:'#ffffff'},curtain:{map:'wood',contrast:.25,color:'#8a2f31'},lampShade:{color:'#3f7a55',emissive:'#78d69a',glow:.15},
  gold:{map:'copper',contrast:.2,color:'#ffd873',metal:.55,gloss:.72,emissive:'#b0801c',glow:.55},
  dim:{map:'stone',contrast:.2,color:'#8c8a86',opacity:.55},
  lampGlass:{color:'#6c6556',emissive:'#ffd08a',glow:0},lanternGlass:{color:'#57636a',emissive:'#fff0c4',glow:0,gloss:.8},
  glass:{color:'#344b55',emissive:'#ffcb7c',glow:0,gloss:.85},screen:{color:'#10231a',emissive:'#6cf0a2',glow:0},
  flame:{color:'#ffd9a0',emissive:'#ffcf7a',glow:0},roxanaLamp:{color:'#6c6556',emissive:'#ffd08a',glow:0},bitacora:{color:'#e9dfc6',emissive:'#ffe3a6',glow:.6},
};

export class SchoolDiorama {
  constructor(canvas,{quality='high',reducedMotion=false}={}){
    this.canvas=canvas;this.quality=quality;this.reducedMotion=reducedMotion;this.clock=0;
    this.stage=0;this.levels=new Array(10).fill(0);this.focusId=null;this.hoverId=null;this.hourId='tarde';this.hourMix=null;
    this.onHover=()=>{};this.onSelect=()=>{};this.onFrame=()=>{};
    const app=this.app=new Application(canvas,{graphicsDeviceOptions:{alpha:false,antialias:false,powerPreference:'high-performance'}});
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);app.setCanvasResolution(RESOLUTION_AUTO);
    app.graphicsDevice.maxPixelRatio=Math.min(window.devicePixelRatio||1,quality==='high'?2:1.25);
    this.cam={yaw:OVERVIEW.yaw,pitch:OVERVIEW.pitch,distance:OVERVIEW.distance,target:new Vec3(...OVERVIEW.target)};
    this.goal={...this.cam,target:this.cam.target.clone()};
    this.camera=new Entity('Cámara del diorama');
    this.camera.addComponent('camera',{fov:24,nearClip:1,farClip:1400,clearColor:col('#d9b99a')});
    app.root.addChild(this.camera);
    this.sun=new Entity('Sol');this.sun.addComponent('light',{type:'directional',color:col('#ffd49a'),intensity:1.9,castShadows:true,shadowResolution:quality==='high'?4096:2048,shadowDistance:190,shadowType:SHADOW_PCF5_16F,normalOffsetBias:.05,shadowBias:.25});
    app.root.addChild(this.sun);
    this.buildFrame();
    addEventListener('resize',()=>app.resizeCanvas());
  }
  buildFrame(){
    const f=this.frame=new CameraFrame(this.app,this.camera.camera);
    f.rendering.toneMapping=TONEMAP_ACES;f.rendering.samples=this.quality==='high'?4:1;
    f.bloom.intensity=.022;f.bloom.blurLevel=14;
    f.vignette.intensity=.24;f.vignette.inner=.55;f.vignette.outer=1.4;f.vignette.curvature=.6;
    f.colorEnhance.enabled=true;f.colorEnhance.vibrance=.14;f.colorEnhance.shadows=.1;f.colorEnhance.highlights=-.05;
    f.grading.enabled=true;
    if(this.quality==='high'){f.ssao.type=SSAOTYPE_LIGHTING;f.ssao.intensity=.45;f.ssao.radius=12;f.ssao.samples=12;f.ssao.blurEnabled=true;}
    // Tilt-shift: a narrow focus band on the target reads as a miniature.
    f.dof.enabled=true;f.dof.nearBlur=true;f.dof.focusDistance=OVERVIEW.distance;f.dof.focusRange=60;f.dof.blurRadius=4;f.dof.blurRings=4;f.dof.blurRingPoints=5;f.dof.highQuality=this.quality==='high';
    f.update();
  }

  async build(onProgress=()=>{}){
    const app=this.app;await document.fonts?.ready;
    onProgress(.1,'Preparando superficies');
    this.materials=await this.makeMaterials();
    onProgress(.35,'Levantando el Instituto');
    const kit=buildSchool();this.addTrophyParts(kit);
    const needed=new Set();for(const mats of kit.parts.values())for(const m of mats.keys())needed.add(m);
    for(const key of needed)if(!this.materials[key])this.materials[key]=this.materialFor(key);
    this.root=new Entity('Instituto Roxana');app.root.addChild(this.root);
    this.parts=kit.build(app,this.materials,this.root);
    this.basePos=new Map([...this.parts].map(([k,e])=>[k,e.getLocalPosition().clone()]));
    // The sculpted statue of Roxana replaces the lathe figure; the latter stays as fallback.
    try{const glb=await loadStatueGlb(statueUrl);const stone=new StandardMaterial();stone.diffuse=col('#cfc8ba');stone.diffuseMap=marble(app);stone.diffuseVertexColor=true;stone.useMetalness=true;stone.metalness=0;stone.gloss=.42;stone.update();
      this.statue=statueEntity(app,stone,glb,{x:FOUNTAIN.x,y:2.7,z:FOUNTAIN.z,height:3.5});this.root.addChild(this.statue);
      for(const part of ['statue','statue:flame'])this.parts.get(part).enabled=false;}catch(error){console.warn('Estatua esculpida no disponible:',error.message);}
    onProgress(.6,'Plantando árboles');
    await this.buildTrees();this.buildSky();this.buildClouds();
    this.landscape=buildLandscape(app,this.root,{meadow:this.materials.grass.diffuseMap,trees:this.treeMaterials});
    app.scene.fog.type=FOG_LINEAR;app.scene.fog.start=165;app.scene.fog.end=410;
    onProgress(.75,'Encendiendo la escuela');
    this.buildLights();this.buildParticles();this.buildHighlight();this.buildBeam();
    onProgress(.88,'Llegan los habitantes');
    await this.buildSprites();
    this.bindInput();this.setHour(this.hourId,true);this.applyStage(true);
    app.on('update',dt=>this.update(dt));app.start();
    onProgress(1,'Listo');
  }

  // ── Materials ───────────────────────────────────────────────────────────────
  async makeMaterials(){
    const app=this.app,out={},maps={meadow:await meadow(app),earth:earth(app)};
    for(const [name,spec] of Object.entries(MATERIALS)){
      const m=new StandardMaterial();m.diffuse=col(spec.color);m.diffuseVertexColor=true;m.useMetalness=true;m.metalness=spec.metal||0;m.gloss=spec.gloss??.25;
      if(spec.map)m.diffuseMap=maps[spec.map]||await grain(app,spec.map,{contrast:spec.contrast??.55});
      if(spec.emissive){m.emissive=col(spec.emissive);m.emissiveIntensity=spec.glow??0;}
      if(spec.opacity){m.opacity=spec.opacity;m.blendType=BLEND_NORMAL;m.depthWrite=false;}
      m.update();out[name]=m;
    }
    out.grass.diffuseMapTiling.set(1,1);
    const g=glow(app);
    out['portal@electronica']=makeWorldPortal(g,'ohmdal');
    out.water=makeWater(new StandardMaterial());const blank=new Texture(app.graphicsDevice,{width:1,height:1,format:PIXELFORMAT_RGBA8,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});bindShore(out.water,blank,false,0);out.water.noShadow=true;
    const unlit=(tex,{blend=false,tint='#ffffff'}={})=>{const m=new StandardMaterial();m.useLighting=false;m.diffuse=col('#000000');m.emissive=col(tint);m.emissiveMap=tex;if(blend){m.opacityMap=tex;m.opacityMapChannel='a';m.blendType=BLEND_NORMAL;m.depthWrite=false;}m.cull=CULLFACE_NONE;m.update();return m;};
    const lit=(tex,{alpha=false,color='#ffffff',gloss=.2}={})=>{const m=new StandardMaterial();m.diffuseMap=tex;m.diffuse=col(color);m.gloss=gloss;m.useMetalness=true;m.metalness=0;if(alpha){m.opacityMap=tex;m.opacityMapChannel='a';m.alphaTest=.45;}m.cull=CULLFACE_NONE;m.update();return m;};
    // The other ways in: a city on a chip, a headset visor, a world in a tank, a living blackboard.
    const glowMat=(color,{base='#101216',intensity=1}={})=>{const m=new StandardMaterial();m.diffuse=col(base);m.emissive=col(color);m.emissiveIntensity=intensity;m.useMetalness=true;m.gloss=.6;m.update();return m;};
    out['city@programacion']=glowMat('#9a7dff',{base:'#1a1630'});out['city@programacion'].emissiveVertexColor=true;out['city@programacion'].update();out['visor@programacion']=glowMat('#c7b8ff',{base:'#120f22'});
    out['world@fisica']=glowMat('#ffc070',{base:'#3a1a08'});
    {const m=new StandardMaterial();m.diffuse=col('#6fd0c8');m.emissive=col('#ff9a4a');m.emissiveIntensity=.35;m.opacity=.32;m.blendType=BLEND_NORMAL;m.depthWrite=false;m.useMetalness=true;m.gloss=.8;m.update();m.noShadow=true;out['fluid@fisica']=m;}
    {const m=new StandardMaterial();m.diffuse=col('#d8eef0');m.opacity=.24;m.blendType=BLEND_NORMAL;m.depthWrite=false;m.useMetalness=true;m.metalness=0;m.gloss=.95;m.cull=CULLFACE_NONE;m.emissive=col('#ffb35c');m.emissiveIntensity=.05;m.update();m.noShadow=true;out.tank=m;}
    this.leyes=dynamicCanvas(app,'leyes',512,200);this.drawLeyes([.3,.67,1.04,.41]);out.leyes=lit(this.leyes.texture,{gloss:.4});
    this.board=dynamicCanvas(app,'board',640,384);this.drawBoard(0);
    {const m=new StandardMaterial();m.diffuse=col('#1d2b22');m.diffuseMap=this.board.texture;m.emissive=col('#ffffff');m.emissiveMap=this.board.texture;m.emissiveIntensity=.35;m.update();out['board@matematica']=m;}
    const serif='"Cormorant Garamond", Georgia, serif';
    const plaqueSign=(key,text,{bg='#2c3b36',fg='#e5c98c',size=64,w=768,h=128,border='#b89455'}={})=>lit(sign(app,key,(x,W,H)=>{
      x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle=border;x.lineWidth=6;x.strokeRect(8,8,W-16,H-16);x.lineWidth=2;x.strokeRect(18,18,W-36,H-36);
      x.fillStyle=fg;x.font=`600 ${size}px ${serif}`;x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=4;x.fillText(text,W/2,H/2+4);
    },w,h),{gloss:.45});
    out['sign:direccion']=plaqueSign('direccion','DIRECCIÓN');
    for(const [id,t] of Object.entries(TALLERES))out[`sign:${id}`]=plaqueSign(id,t.name,{size:50,w:1024,bg:t.accent});
    out['sign:trofeos']=plaqueSign('trofeos','SALA DE TROFEOS',{size:60,w:1024});
    out['sign:anfiteatro']=plaqueSign('anfiteatro','ANFITEATRO',{size:60,w:1024});
    out['sign:instituto']=lit(sign(app,'instituto',(x,W,H)=>{
      x.clearRect(0,0,W,H);x.fillStyle='#1d2422';x.beginPath();x.roundRect(6,20,W-12,H-40,18);x.fill();x.strokeStyle='#c9a45f';x.lineWidth=5;x.stroke();
      x.fillStyle='#e6c886';x.font=`600 92px ${serif}`;x.textAlign='center';x.textBaseline='middle';x.fillText('INSTITUTO  ROXANA',W/2,H/2+4);
      x.font=`500 30px ${serif}`;x.fillStyle='#b99b63';x.fillText('Ω',38+12,H/2);x.fillText('Ω',W-50,H/2);
    },1024,192),{alpha:true,gloss:.5});
    out.banner=lit(await this.bannerTexture(),{alpha:true});out['banner:ohmdal']=out.banner;
    for(const w of ['physica','bitland','arithmos'])out[`banner:${w}`]=lit(this.worldBanner(w),{alpha:true});
    const glyphs={ohmdal:['#1f4d4a','\u03a9'],physica:['#6a2f1e','\u03a6'],bitland:['#28295a','\u03bb'],arithmos:['#244a2c','\u2211']};
    for(const [w,[bg,gl]] of Object.entries(glyphs))out[`medal:${w}`]=lit(sign(app,'medal-'+w,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='#c9a45f';x.beginPath();x.arc(W/2,H/2,W/2-4,0,Math.PI*2);x.fill();x.fillStyle=bg;x.beginPath();x.arc(W/2,H/2,W/2-22,0,Math.PI*2);x.fill();
      x.strokeStyle='#e6c886';x.lineWidth=3;x.beginPath();x.arc(W/2,H/2,W/2-32,0,Math.PI*2);x.stroke();x.fillStyle='#ecd191';x.font='600 150px "Cormorant Garamond", serif';x.textAlign='center';x.textBaseline='middle';x.fillText(gl,W/2,H/2+8);},256,256),{alpha:true,gloss:.5});
    const screens={electronica:'#6cf0a2',programacion:'#7dffb0'};
    for(const id of Object.keys(TALLERES)){const sm=new StandardMaterial();sm.diffuse=col('#10231a');sm.emissive=col(screens[id]||'#9fd4ff');sm.emissiveIntensity=0;sm.useMetalness=true;sm.gloss=.8;sm.update();out[`screen@${id}`]=sm;}
    {const t=sign(app,'leds',(x,W,H)=>{x.fillStyle='#07090b';x.fillRect(0,0,W,H);for(let r=0;r<22;r++)for(let c=0;c<6;c++){const on=Math.random()>.45;x.fillStyle=on?['#7dff9a','#ffcf6b','#8fb8ff'][(r+c)%3]:'#1c2226';x.fillRect(12+c*20,10+r*23,9,6);}},128,512);const m=new StandardMaterial();m.diffuse=col('#101216');m.emissive=col('#ffffff');m.emissiveMap=t;m.emissiveIntensity=0;m.update();out['leds@programacion']=m;}
    out.code=lit(sign(app,'code',(x,W,H)=>{x.fillStyle='#0c1512';x.fillRect(0,0,W,H);x.strokeStyle='#6b5234';x.lineWidth=14;x.strokeRect(0,0,W,H);x.font='20px ui-monospace, Consolas, monospace';
      const lines=['función encender(red):','  para cada nodo en red:','    si nodo.tensión > 0:','      nodo.luz = verdadero','  devolver red','','mientras reloj.detenido:','  esperar(1)','# ¿quién detuvo el reloj central?','','lista = [0, 1, 1, 2, 3, 5, 8]','para i en rango(2, n):','  lista[i] = lista[i-1] + lista[i-2]'];
      lines.forEach((l,i)=>{x.fillStyle=l.startsWith('#')?'#8a9a7a':i%4===0?'#ffc46b':'#9ff0b8';x.fillText(l,28,44+i*27);});},512,400),{gloss:.3});
    out.chalk2=lit(sign(app,'chalk2',(x,W,H)=>{x.fillStyle='#233629';x.fillRect(0,0,W,H);x.strokeStyle='#8a6a45';x.lineWidth=12;x.strokeRect(0,0,W,H);x.strokeStyle='rgba(240,240,225,.85)';x.fillStyle='rgba(240,240,225,.85)';x.lineWidth=2.5;
      x.beginPath();x.moveTo(50,180);x.lineTo(190,180);x.lineTo(50,70);x.closePath();x.stroke();x.font='italic 26px "Cormorant Garamond", serif';x.fillText('a² + b² = c²',210,110);x.fillText('a',30,130);x.fillText('b',110,205);x.fillText('c',130,115);
      x.beginPath();x.arc(420,120,55,0,Math.PI*2);x.stroke();x.beginPath();x.moveTo(420,120);x.lineTo(475,120);x.stroke();x.fillText('r',440,112);x.fillText('A = π r²',370,205);},512,220));
    out.chalk3=lit(sign(app,'chalk3',(x,W,H)=>{x.fillStyle='#24362c';x.fillRect(0,0,W,H);x.strokeStyle='#8a6a45';x.lineWidth=12;x.strokeRect(0,0,W,H);x.strokeStyle='rgba(240,240,225,.85)';x.fillStyle='rgba(240,240,225,.85)';x.lineWidth=2.5;x.font='italic 26px "Cormorant Garamond", serif';
      x.fillText('F = m · a',40,60);x.fillText('T = 2π √(L / g)',40,120);x.beginPath();x.moveTo(330,30);x.lineTo(380,150);x.stroke();x.beginPath();x.arc(380,158,10,0,Math.PI*2);x.stroke();x.setLineDash([5,5]);x.beginPath();x.moveTo(330,30);x.lineTo(330,165);x.stroke();x.setLineDash([]);
      x.beginPath();for(let i=0;i<=200;i++){const px=40+i*1.6,py=180+Math.sin(i/12)*18;i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();},512,220));
    out.rug=lit(sign(app,'rug',(x,W,H)=>{x.fillStyle='#6d2a24';x.fillRect(0,0,W,H);x.strokeStyle='#c8a05a';x.lineWidth=10;x.strokeRect(14,14,W-28,H-28);x.strokeStyle='#2f4a44';x.lineWidth=16;x.strokeRect(40,40,W-80,H-80);x.fillStyle='#c8a05a';for(let i=0;i<6;i++){x.beginPath();x.arc(W/2,H/2,20+i*18,0,Math.PI*2);x.globalAlpha=.25;x.stroke();}x.globalAlpha=1;},256,256),{color:'#ffffff'});
    out.portrait=lit(this.portraitTexture(),{gloss:.5});
    out.clock=lit(this.clockTexture(),{alpha:true,gloss:.4});
    out.chalk=lit(sign(app,'chalk',(x,W,H)=>{x.fillStyle='#24382d';x.fillRect(0,0,W,H);x.strokeStyle='#8a6a45';x.lineWidth=12;x.strokeRect(0,0,W,H);x.fillStyle='rgba(240,240,225,.85)';x.font=`italic 38px ${serif}`;x.fillText('a/b = c/d',40,70);x.fillText('∑ 1/2ⁿ = 1',260,120);x.fillText('x² − 1 = (x−1)(x+1)',50,180);x.fillText('π ≈ 3,1416',320,50);},512,220));
    out.globe=lit(sign(app,'globe',(x,W,H)=>{x.fillStyle='#2f5a6a';x.fillRect(0,0,W,H);x.fillStyle='#b99a5c';for(let i=0;i<14;i++){x.beginPath();x.ellipse(Math.random()*W,Math.random()*H,10+Math.random()*30,6+Math.random()*18,Math.random()*3,0,Math.PI*2);x.fill();}},256,128));
    this.screen=dynamicCanvas(app,'screen',1024,556);this.drawScreenCard();
    out.screen=unlit(this.screen.texture);out.screen.emissiveIntensity=1;out.screen.noShadow=true;
    this.treeMaterials=[];for(let i=0;i<6;i++)this.treeMaterials.push(lit(await tree(app,i),{alpha:true,gloss:.1}));
    this.glowTexture=g;
    return out;
  }
  /** The console of Physica's laws: four dials, needles at 0..1.4 turns of their arc. */
  drawLeyes(values){
    const {ctx:x,canvas:c}=this.leyes,W=c.width,H=c.height;
    x.fillStyle='#1b1712';x.fillRect(0,0,W,H);x.strokeStyle='#b08d52';x.lineWidth=6;x.strokeRect(4,4,W-8,H-8);
    ['GRAVEDAD','CARGA','ESCALA','TIEMPO'].forEach((l,i)=>{const cx=64+i*128;x.strokeStyle='#d8bd80';x.lineWidth=3;x.beginPath();x.arc(cx,86,38,Math.PI*.8,Math.PI*2.2);x.stroke();
      const a=Math.PI*(.8+(values[i]%1.4));x.beginPath();x.moveTo(cx,86);x.lineTo(cx+Math.cos(a)*32,86+Math.sin(a)*32);x.strokeStyle='#ffb35c';x.lineWidth=4;x.stroke();
      x.fillStyle='#e9dcc0';x.font='600 17px Inter, sans-serif';x.textAlign='center';x.fillText(l,cx,168);});
    this.leyes.refresh();
  }
  /**
   * Previews of how the worlds in preparation will be entered. Arithmos draws itself on its
   * board; Physica shrinks the camera into the tank; Bitland lights the headset and dives
   * into the city on the chip.
   */
  playEntryPreview(world,cb={}){
    if(world==='arithmos')return this.playBoardEntry(cb);
    const plans={
      physica:{end:7.8,lines:[[0,'a'],[1.6,'b'],[3.6,'c'],[5.6,'dive']],shots:[[0,{target:[-33.9,2.3,13],yaw:90,pitch:8,distance:7.5}],[3.6,{target:[-33.9,2.25,13],yaw:90,pitch:4,distance:2.6}],[5.6,{target:[-33.9,2.25,13],yaw:90,pitch:2,distance:.4}]]},
      bitland:{end:7.8,lines:[[0,'a'],[1.8,'b'],[3.4,'c'],[5.4,'dive']],shots:[[0,{target:[33.85,1.85,-1.6],yaw:-75,pitch:8,distance:4.2}],[3.4,{target:[34.3,1.35,-5.7],yaw:-62,pitch:32,distance:3.6}],[5.4,{target:[34.3,1.3,-5.7],yaw:-62,pitch:24,distance:.7}]]},
    };
    this.entrySeq={world,plan:plans[world],t:0,cb,fired:new Set()};this.camera.camera.nearClip=.05;this.frame.dof.focusRange=4;this.frame.update();
  }
  stepEntry(dt){
    const q=this.entrySeq,{plan,cb}=q;q.t+=dt;const t=q.t,ramp=(a,b)=>clamp((t-a)/(b-a),0,1);
    for(const [at,key] of plan.lines)if(t>=at&&!q.fired.has('l'+key)){q.fired.add('l'+key);cb.onLine?.(key);if(key==='dive')cb.onDive?.();}
    for(const [at,pose] of plan.shots)if(t>=at&&!q.fired.has('s'+at)){q.fired.add('s'+at);this.flyTo(pose,{instant:at===0&&this.reducedMotion});}
    if(q.world==='physica'){
      // The dials turn by themselves and the world answers: faster, brighter, pulsing.
      const k=ramp(1.6,3.6);this.drawLeyes([.3+Math.sin(t*2.1)*.5*k,.67+Math.sin(t*1.3+1)*.6*k,1.04-k*.6+Math.sin(t*3)*.2*k,.41+k*.8]);
      this.worldSpin=14+k*160+ramp(3.6,5.6)*200;const w=this.parts.get('world:physica')||this.parts.get('world:fisica');w?.setLocalScale(1+Math.sin(t*6)*.08*k,1+Math.sin(t*6)*.08*k,1+Math.sin(t*6)*.08*k);
      const wm=this.materials['world@fisica'];wm.emissiveIntensity=1.2+k*2.5+ramp(5,6.2)*4;wm.update();
      const f=this.materials['fluid@fisica'];f.emissiveIntensity=.35+k*.8;f.update();
    }else{
      const v=this.materials['visor@programacion'];v.emissiveIntensity=.35+ramp(1.8,3)*(3+Math.sin(t*9)*.6);v.update();
      const c=this.materials['city@programacion'],on=ramp(2.4,3.6);c.emissiveIntensity=.3+on*(2.2+(Math.random()<.08?-.8:0))+ramp(5,6.2)*3;c.update();
      this.rooms['portal:programacion'].light.intensity=.4+on*2.4;
    }
    if(t>=plan.end){
      this.entrySeq=null;this.worldSpin=14;this.parts.get('world:fisica')?.setLocalScale(1,1,1);this.drawLeyes([.3,.67,1.04,.41]);
      this.camera.camera.nearClip=1;this.flyTo(ROOMS[q.world==='physica'?'fisica':'programacion'].pose,{instant:true});this.frame.dof.focusRange=16;this.frame.update();this.stageDirty=true;cb.onEnd?.();
    }
  }
  /** Arithmos' board draws itself: figures in chalk that keep transforming into each other. */
  drawBoard(t){
    const {ctx:x,canvas:c}=this.board,W=c.width,H=c.height;
    x.fillStyle='#22332a';x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(235,240,225,.07)';x.lineWidth=1;for(let i=0;i<W;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();}for(let j=0;j<H;j+=32){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke();}
    const chalk=a=>`rgba(240,242,230,${a})`;x.lineWidth=3;x.lineCap='round';
    // A polygon that morphs from triangle to circle, a travelling wave, a spiral.
    const sides=3+((t*.25)%1)*9,cx=150,cy=190,r=90;x.strokeStyle=chalk(.85);x.beginPath();
    for(let i=0;i<=64;i++){const a=i/64*Math.PI*2-Math.PI/2,k=Math.cos(Math.PI/sides)/Math.cos((a+Math.PI/2)%(2*Math.PI/sides)-Math.PI/sides),rr=r*(sides>11.5?1:k);i?x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):x.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.stroke();
    x.strokeStyle=chalk(.75);x.beginPath();for(let i=0;i<=180;i++){const px=290+i*1.8,py=120+Math.sin(i/14+t*1.6)*34*Math.cos(t*.4);i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();
    x.strokeStyle=chalk(.6);x.beginPath();for(let i=0;i<=220;i++){const a=i/220*Math.PI*6+t*.5,rr=4+i*.32;const px=470+Math.cos(a)*rr,py=270+Math.sin(a)*rr*.8;i?x.lineTo(px,py):x.moveTo(px,py);}x.stroke();
    x.fillStyle=chalk(.8);x.font='italic 30px "Cormorant Garamond", serif';x.fillText('f(x) = sen(x + t)',300,215);x.fillText('n → ∞',110,330);
    // Where the board could open: a soft glow that breathes.
    const g=x.createRadialGradient(W*.5,H*.5,4,W*.5,H*.5,W*.34),b=.1+.06*Math.sin(t*1.3);g.addColorStop(0,`rgba(160,240,190,${b})`);g.addColorStop(1,'rgba(160,240,190,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
    this.board.refresh();
  }
  /**
   * The way into Arithmos, as a preview: chalk traces a door, a chalk student walks to it
   * and shrinks into the drawing, the door opens onto an endless plane of equations that
   * grows to fill the board, and the camera dives in.
   */
  playBoardEntry({onDive=()=>{},onEnd=()=>{},onLine=()=>{}}={}){
    this.boardSeq={t:0,onDive,onEnd,onLine,dived:false,lines:new Set()};
    this.flyTo({target:[35.1,2.35,13],yaw:-90,pitch:4,distance:9.5});this.frame.dof.focusRange=8;this.frame.update();this.camera.camera.nearClip=.05;
    const m=this.materials['board@matematica'];m.emissiveIntensity=.85;m.update();
  }
  stepBoardEntry(dt){
    const q=this.boardSeq;q.t+=dt;const t=q.t;
    for(const [at,key] of [[0,'door'],[2.5,'walk'],[4.6,'plane'],[6.3,'dive']])if(t>=at&&!q.lines.has(key)){q.lines.add(key);q.onLine(key);}
    this.drawBoardEntry(t);
    if(t>=6.3&&!q.dived){q.dived=true;if(!this.reducedMotion)this.flyTo({target:[35.1,2.35,13],yaw:-90,pitch:0,distance:.6});q.onDive();}
    if(t>=7.9){this.boardSeq=null;this.camera.camera.nearClip=1;const m=this.materials['board@matematica'];m.emissiveIntensity=.35;m.update();
      this.flyTo(ROOMS.matematica.pose,{instant:true});this.frame.dof.focusRange=16;this.frame.update();this.drawBoard(this.clock);q.onEnd();}
  }
  drawBoardEntry(t){
    const {ctx:x,canvas:c}=this.board,W=c.width,H=c.height,cl=v=>Math.max(0,Math.min(1,v)),sm=v=>{v=cl(v);return v*v*(3-2*v);};
    const chalk=a=>`rgba(240,242,230,${a})`;
    x.fillStyle='#22332a';x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(235,240,225,.06)';x.lineWidth=1;for(let i=0;i<W;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();}
    const dw=112,dh=196,dx=W*.56-dw/2,dy=H*.88-dh,vx=dx+dw/2,vy=dy+dh*.45;
    // 3 · The plane beyond the door: clipped to the doorway, then to the whole board.
    const open=sm((t-3.6)/1),grow=sm((t-4.6)/1.8);
    if(open>0){
      const rx=dx*(1-grow),ry=dy*(1-grow),rw=dw+(W-dw)*grow,rh=dh+(H-dh)*grow;
      x.save();x.beginPath();x.rect(rx,ry,rw,rh);x.clip();
      const g=x.createRadialGradient(vx,vy,2,vx,vy,W*.7);g.addColorStop(0,'#3e6a52');g.addColorStop(1,'#15241c');x.fillStyle=g;x.fillRect(0,0,W,H);
      x.strokeStyle=chalk(.35);x.lineWidth=1.4;
      for(let i=-14;i<=14;i++){x.beginPath();x.moveTo(vx,vy);x.lineTo(vx+i*70,H+260);x.stroke();}
      for(let k=0;k<14;k++){const z=k+1-((t*1.4)%1),y=vy+230/z;if(y>H+10)continue;x.globalAlpha=Math.min(1,z/3);x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();x.globalAlpha=1;}
      const eqs=['x² + y² = r²','e^(iπ) + 1 = 0','a/b = c/d','∑ 1/2ⁿ = 1','f(g(x))','√2','π','∞','3 + 4 = 7','A = b·h / 2','y = mx + b','n! ','0,999… = 1','φ = (1+√5)/2'];
      eqs.forEach((e,i)=>{const p=((t*.32+i/eqs.length)%1),a=i*2.4,rr=Math.pow(p,2.2)*W*.75,size=8+p*46,al=Math.sin(p*Math.PI)*.95*open;
        x.fillStyle=chalk(al);x.font=`italic ${size}px "Cormorant Garamond", serif`;x.textAlign='center';x.fillText(e,vx+Math.cos(a)*rr,vy+Math.sin(a)*rr*.55-p*30);});
      x.textAlign='start';x.restore();
    }
    // 2 · The door, traced in chalk; its leaf swings open on the left hinge.
    const trace=cl((t-.3)/2.1),per=dh*2+dw;
    if(grow<.98){
      x.lineWidth=3.4;x.lineCap='round';x.lineJoin='round';x.strokeStyle=chalk(.9*(1-grow));
      x.setLineDash([per*trace,per]);x.beginPath();x.moveTo(dx,dy+dh);x.lineTo(dx,dy);x.lineTo(dx+dw,dy);x.lineTo(dx+dw,dy+dh);x.stroke();x.setLineDash([]);
      if(trace<1){const d=per*trace,px=d<dh?dx:d<dh+dw?dx+(d-dh):dx+dw,py=d<dh?dy+dh-d:d<dh+dw?dy:dy+(d-dh-dw);
        for(let i=0;i<6;i++){x.fillStyle=chalk(.5*Math.random());x.fillRect(px+(Math.random()-.5)*14,py+(Math.random()-.5)*14,2,2);}}
      if(trace>=1){
        const a=open*Math.PI*.46,lw=dw*Math.cos(a),sk=Math.sin(a)*16;
        x.globalAlpha=1-sm(grow*2.2);x.fillStyle='#22332a';x.beginPath();x.moveTo(dx,dy);x.lineTo(dx+lw,dy-sk);x.lineTo(dx+lw,dy+dh+sk);x.lineTo(dx,dy+dh);x.closePath();x.fill();
        x.strokeStyle=chalk(.9*(1-grow));x.stroke();
        x.beginPath();x.arc(dx+lw*.82,dy+dh*.55,4,0,Math.PI*2);x.stroke();x.globalAlpha=1;
      }
    }
    // 1 · A chalk student with a yellow scarf walks to the door and shrinks into the drawing.
    const walk=cl((t-2.5)/2.3),inside=cl((t-4.8)/.7),appear=cl((t-2.4)/.4);
    if(appear>0&&inside<1){
      const e=sm(walk),fx=W*.14+(vx-W*.14)*e,s=(1-e*.7)*(1-inside),fy=H*.9+((dy+dh*.8)-H*.9)*e-inside*dh*.35,al=appear*(1-inside);
      const ph=t*7,leg=Math.sin(ph)*.45*(walk<1?1:.2);
      x.save();x.globalAlpha=al;x.strokeStyle=chalk(.95);x.lineWidth=3*Math.max(.4,s);x.lineCap='round';
      const u=v=>v*s,hy=fy-u(62);
      x.beginPath();x.arc(fx,hy,u(9),0,Math.PI*2);x.stroke();
      x.beginPath();x.moveTo(fx,hy+u(9));x.lineTo(fx,fy-u(26));
      x.moveTo(fx,fy-u(26));x.lineTo(fx+Math.sin(leg)*u(20),fy);x.moveTo(fx,fy-u(26));x.lineTo(fx-Math.sin(leg)*u(20),fy);
      x.moveTo(fx,hy+u(18));x.lineTo(fx-Math.sin(leg)*u(15),hy+u(36));x.moveTo(fx,hy+u(18));x.lineTo(fx+Math.sin(leg)*u(15),hy+u(36));x.stroke();
      x.strokeStyle='rgba(240,200,90,.95)';x.beginPath();x.moveTo(fx-u(6),hy+u(12));x.lineTo(fx+u(6),hy+u(12));x.quadraticCurveTo(fx-u(8),hy+u(16),fx-u(18)-Math.sin(ph*.5)*u(4),hy+u(22));x.stroke();
      x.restore();
    }
    // The dive: the plane brightens into chalk light.
    const flash=sm((t-6.2)/1);if(flash>0){x.fillStyle=`rgba(210,245,220,${flash*.85})`;x.fillRect(0,0,W,H);}
    this.board.refresh();
  }
  /** Banners of the worlds still to open, woven like Ohmdal's: colour, border, glyph. */
  worldBanner(w){
    const spec={physica:['#6a2f1e','Φ'],bitland:['#28295a','λ'],arithmos:['#244a2c','∑']}[w];
    return sign(this.app,'banner-'+w,(x,W,H)=>{
      x.fillStyle=spec[0];x.fillRect(0,0,W,H-60);for(let i=0;i<5000;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;x.fillRect(Math.random()*W,Math.random()*(H-60),2,1);}
      x.fillStyle=spec[0];x.beginPath();x.moveTo(0,H-62);x.lineTo(W/2,H);x.lineTo(W,H-62);x.fill();
      x.strokeStyle='#c9a45f';x.lineWidth=5;x.strokeRect(22,22,W-44,H-110);x.lineWidth=2;x.strokeRect(34,34,W-68,H-134);
      x.fillStyle='#d8b56a';x.font='600 300px "Cormorant Garamond", serif';x.textAlign='center';x.textBaseline='middle';x.fillText(spec[1],W/2,H*.48);
      x.font='600 44px "Cormorant Garamond", serif';x.fillText('✦',W/2,H*.18);x.beginPath();x.moveTo(90,H*.74);x.quadraticCurveTo(W/2,H*.7,W-90,H*.74);x.stroke();
    },512,828);
  }
  /** `glass@electronica` → its own clone of `glass`, so each building can light alone. */
  materialFor(key){
    const [base]=key.split('@'),src=this.materials[base];if(!src)throw new Error('Material sin definir: '+key);
    const m=src.clone();m.noShadow=src.noShadow;m.update();this.materials[key]=m;return m;
  }
  async bannerTexture(){
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=new URL('./assets/art-polish/kingdom-banner.webp',document.baseURI).href;});
    return sign(this.app,'banner',(x,W,H)=>{x.drawImage(img,0,0,W,H-60);x.fillStyle='#1c4b4a';x.beginPath();x.moveTo(0,H-60);x.lineTo(W/2,H);x.lineTo(W,H-60);x.fill();},512,828);
  }
  portraitTexture(){
    return sign(this.app,'portrait',(x,W,H)=>{
      const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2e3d35');g.addColorStop(1,'#141c19');x.fillStyle=g;x.fillRect(0,0,W,H);
      x.fillStyle='#c9a45f';x.fillRect(0,0,W,14);x.fillRect(0,H-14,W,14);x.fillRect(0,0,14,H);x.fillRect(W-14,0,14,H);
      // Roxana: three-quarter figure, hair gathered, a lamp in her hand.
      x.fillStyle='#d9c3a0';x.beginPath();x.ellipse(W*.5,H*.34,W*.13,H*.1,0,0,Math.PI*2);x.fill();
      x.fillStyle='#5a3a2a';x.beginPath();x.ellipse(W*.5,H*.27,W*.15,H*.07,0,Math.PI,0);x.fill();x.beginPath();x.arc(W*.5,H*.2,W*.07,0,Math.PI*2);x.fill();
      x.fillStyle='#2f4f5a';x.beginPath();x.moveTo(W*.18,H);x.quadraticCurveTo(W*.24,H*.5,W*.5,H*.46);x.quadraticCurveTo(W*.76,H*.5,W*.82,H);x.fill();
      x.fillStyle='#e8d6ae';x.beginPath();x.moveTo(W*.44,H*.47);x.lineTo(W*.5,H*.56);x.lineTo(W*.56,H*.47);x.fill();
      const lg=x.createRadialGradient(W*.72,H*.62,2,W*.72,H*.62,W*.18);lg.addColorStop(0,'#fff2c0');lg.addColorStop(1,'rgba(255,220,140,0)');x.fillStyle=lg;x.beginPath();x.arc(W*.72,H*.62,W*.18,0,Math.PI*2);x.fill();
      x.fillStyle='#c9a45f';x.font='600 30px "Cormorant Garamond", serif';x.textAlign='center';x.fillText('ROXANA',W/2,H-34);
    },256,332);
  }
  clockTexture(){
    return sign(this.app,'clock',(x,W,H)=>{
      x.clearRect(0,0,W,H);x.fillStyle='#efe4c8';x.beginPath();x.arc(W/2,H/2,W/2-6,0,Math.PI*2);x.fill();x.strokeStyle='#8a6a3a';x.lineWidth=10;x.stroke();
      x.fillStyle='#2b2620';x.font='600 34px "Cormorant Garamond", serif';x.textAlign='center';x.textBaseline='middle';
      ['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'].forEach((n,i)=>{const a=i/12*Math.PI*2-Math.PI/2;x.fillText(n,W/2+Math.cos(a)*(W/2-40),H/2+Math.sin(a)*(W/2-40));});
      x.fillStyle='#8a6a3a';x.beginPath();x.arc(W/2,H/2,10,0,Math.PI*2);x.fill();
    },256,256);
  }
  drawScreenCard(title='Instituto Roxana',subtitle='Anfiteatro · Cinemáticas y videos',eyebrow='FUNCIÓN DE HOY'){
    const {ctx:x,canvas:c}=this.screen,W=c.width,H=c.height;
    const g=x.createRadialGradient(W/2,H*.45,20,W/2,H/2,W*.7);g.addColorStop(0,'#24413c');g.addColorStop(1,'#0b1413');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(216,189,128,.5)';x.lineWidth=3;x.strokeRect(24,24,W-48,H-48);
    x.fillStyle='#d8bd80';x.textAlign='center';x.font='600 26px Inter, sans-serif';x.fillText(eyebrow.split('').join(' '),W/2,H*.3);
    x.font='600 92px "Cormorant Garamond", serif';x.fillStyle='#f3e6c4';x.fillText(title,W/2,H*.53);
    x.font='500 34px "Cormorant Garamond", serif';x.fillStyle='#bfae8a';x.fillText(subtitle,W/2,H*.68);
    x.font='600 60px "Cormorant Garamond", serif';x.fillStyle='rgba(216,189,128,.35)';x.fillText('Ω',W/2,H*.86);
    this.screen.refresh();
  }

  // ── Trophies ────────────────────────────────────────────────────────────────
  addTrophyParts(k){
    // Ohmdal's twelve on its stand; every place of every stand has a glass dome.
    const kinds=['medal','medal','medal','medal','medal','medal','medal','cup','crystal','globe','book','cup'],S=.52,sc=pr=>pr.map(([r,h])=>[r*S,h*S]);
    STANDS.ohmdal.forEach(([x,y,z],i)=>{
      const p=`trophy:ohmdal:${i}`,kind=kinds[i];
      if(kind==='cup'){k.lathe(p,'gold',sc([[0,0],[.3,0],[.3,.08],[.08,.14],[.06,.42],[.26,.5],[.36,.78],[.38,1.02],[.3,1.05],[.2,.8],[0,.74]]),{x,z,y,seg:14,smooth:true});for(const s of [-1,1])k.box(p,'gold',{x:x+s*.42*S,z,y:y+.62*S,w:.08*S,d:.06*S,h:.34*S,jitter:0,ao:false});}
      else if(kind==='crystal'){k.lathe(p,'bronze',sc([[0,0],[.28,0],[.24,.16],[0,.18]]),{x,z,y,seg:8});k.lathe(p,'lanternGlass',sc([[0,0],[.2,.25],[.18,.7],[0,1]]),{x,z,y:y+.16*S,seg:6});}
      else if(kind==='globe'){k.cylinder(p,'bronze',{x,z,y,r:.22*S,h:.1*S,seg:8});k.lathe(p,'gold',sc([[0,0],[.28,.06],[.36,.34],[.28,.64],[0,.7]]),{x,z,y:y+.2*S,seg:12,smooth:true});}
      else if(kind==='book'){k.box(p,'woodDark',{x,z,y,w:.6*S,d:.46*S,h:.1*S,jitter:0});k.box(p,'gold',{x,z,y:y+.1*S,w:.56*S,d:.42*S,h:.14*S,rx:-6,jitter:0});}
      else{k.box(p,'woodDark',{x,z,y,w:.5*S,d:.3*S,h:.12*S,jitter:0});k.lathe(p,'gold',sc([[0,0],[.32,0],[.34,.04],[.3,.08],[0,.08]]),{x,z:z+.02,y:y+.72*S,rx:90,seg:16});k.box(p,'curtain',{x,z,y:y+.12*S,w:.22*S,d:.05*S,h:.62*S,jitter:0,ao:false});}
    });
    for(const w of WORLD_ORDER)STANDS[w].forEach(([x,y,z],i)=>k.lathe(`dome:${w}:${i}`,'dim',sc([[.34,0],[.34,.7],[.26,.95],[0,1.02]]),{x,z,y,seg:10}));
  }

  // ── Scenery ─────────────────────────────────────────────────────────────────
  async buildTrees(){
    const spots=[[-40,-31,0,1.2],[40,-31,4,1.2],[-40,-13,1,1],[40,-13,1,1],[-40.5,4,3,1.1],[40.5,4,3,1.1],[-40,22,0,1.15],[40,22,0,1.15],[-31,28,5,1],[31,28,5,1],[-17,28.5,2,.9],[17,28.5,2,.9],[-12,-32,1,.85],[12,-32,1,.85],[-8,26,5,.8],[8,26,5,.8],[-38,-24,2,1],[38.5,-22,1,.95],[-23,26,4,.95],[23,26,4,.95],[-15,-33,1,.8],[15,-33,1,.8]];
    this.trees=[];
    const shadow=new StandardMaterial();shadow.diffuse=col('#000000');shadow.useLighting=false;shadow.opacityMap=this.glowTexture;shadow.opacity=.5;shadow.blendType=BLEND_NORMAL;shadow.depthWrite=false;shadow.update();
    for(const [x,z,type,s] of spots){
      const h=(type===1?8.2:7.2)*s,w=h*(type===1?.62:1.05);
      const e=new Entity('Árbol');const mi=new MeshInstance(this.quadMesh(w,h),this.treeMaterials[type],e);mi.castShadow=true;
      e.addComponent('render',{meshInstances:[mi]});e.setPosition(x,-.05,z);this.root.addChild(e);this.trees.push({e,phase:x*.37+z*.11});
      const blob=new Entity('Sombra del árbol');const bm=new MeshInstance(this.quadMesh(w*.8,w*.8),shadow,blob);bm.castShadow=false;blob.addComponent('render',{meshInstances:[bm]});
      blob.setEulerAngles(-90,0,0);blob.setPosition(x,.1,z+w*.4);this.root.addChild(blob);
    }
  }
  quadMesh(w,h){
    const m=new Mesh(this.app.graphicsDevice);
    m.setPositions(new Float32Array([-w/2,0,0,w/2,0,0,w/2,h,0,-w/2,h,0]));m.setNormals(new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1]));
    m.setUvs(0,new Float32Array([0,0,1,0,1,1,0,1]));m.setIndices(new Uint32Array([0,1,2,0,2,3]));m.update();return m;
  }
  buildSky(){
    // A dome with vertex colours; recoloured when the hour changes.
    const seg=32,rings=16,R=900,pos=[],idx=[];
    for(let j=0;j<=rings;j++){const v=j/rings,phi=v*Math.PI;for(let i=0;i<=seg;i++){const th=i/seg*Math.PI*2;pos.push(Math.cos(th)*Math.sin(phi)*R,Math.cos(phi)*R,Math.sin(th)*Math.sin(phi)*R);}}
    for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;idx.push(a,b,a+1,b,b+1,a+1);}
    const mesh=this.skyMesh=new Mesh(this.app.graphicsDevice);mesh.setPositions(new Float32Array(pos));mesh.setNormals(new Float32Array(pos.map(v=>-v/R)));mesh.setColors(new Float32Array(pos.length/3*4).fill(1));mesh.setIndices(new Uint32Array(idx));mesh.update();
    this.skyY=pos.filter((_,i)=>i%3===1).map(y=>y/R);
    const m=new StandardMaterial();m.useLighting=false;m.diffuse=col('#000000');m.emissive=col('#ffffff');m.emissiveVertexColor=true;m.cull=CULLFACE_NONE;m.depthWrite=false;m.useFog=false;m.update();
    const e=new Entity('Cielo');const mi=new MeshInstance(mesh,m,e);mi.castShadow=false;mi.receiveShadow=false;e.addComponent('render',{meshInstances:[mi]});e.render.layers=[...e.render.layers];this.root.addChild(e);this.sky=e;
  }
  paintSky(z,h,b){
    const cols=new Float32Array(this.skyY.length*4);
    this.skyY.forEach((y,i)=>{let c;if(y>0){const t=Math.pow(y,.55);c=mixColor(h,z,t);}else{const t=Math.min(1,-y*2.2);c=mixColor(h,b,t);}const l=linear(c);cols.set([l.r,l.g,l.b,1],i*4);});
    this.skyMesh.setColors(cols);this.skyMesh.update();
  }
  buildClouds(){
    // High, slow banks of cloud over the far country; the haze softens them at the horizon.
    this.clouds=[];const m=new StandardMaterial();m.useLighting=false;m.useFog=false;m.diffuse=col('#000000');m.emissive=col('#ffffff');m.emissiveMap=this.glowTexture;m.opacityMap=this.glowTexture;m.opacity=.5;m.blendType=BLEND_NORMAL;m.depthWrite=false;m.cull=CULLFACE_NONE;m.update();m.noShadow=true;this.cloudMaterial=m;
    for(let i=0;i<16;i++){
      const a=i/16*Math.PI*2+Math.sin(i*3)*.25,r=430+((i*137)%260),y=95+(i%5)*26,s=90+(i*53)%80;
      const e=new Entity('Nube');const mi=new MeshInstance(this.quadMesh(s*2.2,s),m,e);mi.castShadow=false;mi.receiveShadow=false;e.addComponent('render',{meshInstances:[mi]});
      e.setPosition(Math.cos(a)*r,y,Math.sin(a)*r*.8);this.root.addChild(e);this.clouds.push({e,a,r,y,speed:.0012+(i%5)*.0005});
    }
  }
  buildLights(){
    const omni=(name,pos,color,range,parent=this.root)=>{const e=new Entity(name);e.addComponent('light',{type:'omni',color:col(color),intensity:0,range,castShadows:false});e.setPosition(...pos);parent.addChild(e);return e;};
    this.lampLights=LAMPS.map(([x,z])=>omni('Farol',[x,3.7,z],'#ffcf8a',11));
    this.rooms={
      ...Object.fromEntries(Object.entries(TALLERES).flatMap(([id,t])=>{const s=t.side==='e'?1:-1;return [[`taller:${id}`,omni('Luz del '+id,[t.x+s*1,4,t.z],'#ffd9a0',16)],[`portal:${id}`,omni('Portal '+id,[t.x-s*3.6,2.4,t.z],PORTAL_COLORS[t.world][2],9)]];})),
      direccion:omni('Luz de Dirección',[3.5,3.8,BUILDINGS.direccion.z],'#ffd7a0',13),
      trofeos:omni('Luz de Trofeos',[BUILDINGS.trofeos.x,4.8,BUILDINGS.trofeos.z],'#ffe4b0',14),
      lantern:omni('Linterna',[TOWER.x,TOWER.shaft+4.5,TOWER.z],'#fff0c4',62),
      screen:omni('Pantalla',[AMPHI.x,3.5,AMPHI.z+2.5],'#a8c8d8',14),
      statue:omni('Farol de Roxana',[FOUNTAIN.x,3.3,FOUNTAIN.z+1.1],'#ffd08a',8),
    };
  }
  particle(name,pos,opts){
    const e=new Entity(name);e.setPosition(...pos);
    e.addComponent('particlesystem',{autoPlay:true,loop:true,colorMap:this.glowTexture,lighting:false,depthWrite:false,blendType:BLEND_ADDITIVE,...opts});
    this.root.addChild(e);return e;
  }
  buildParticles(){
    const reduce=this.reducedMotion,n=v=>reduce?Math.ceil(v/3):v;
    this.fx={};
    this.fx.dust=this.particle('Polvo dorado',[0,5,0],{numParticles:n(160),lifetime:9,rate:.06,rate2:.12,emitterShape:EMITTERSHAPE_BOX,emitterExtents:new Vec3(62,9,44),
      velocityGraph:new CurveSet([[0,-.05,1,.1],[0,.05,1,.18],[0,.05,1,-.05]]),velocityGraph2:new CurveSet([[0,.1,1,-.1],[0,.12,1,.05],[0,-.05,1,.12]]),
      scaleGraph:new Curve([0,.1,1,.12]),alphaGraph:new Curve([0,0,.3,.55,.7,.45,1,0]),colorGraph:new CurveSet([[0,1],[0,.86],[0,.6]])});
    // Eight spouts, each arcing out and down into the basin.
    this.jets=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;const e=this.particle('Caño',[FOUNTAIN.x+Math.cos(a)*1.1,1.78,FOUNTAIN.z+Math.sin(a)*1.1],{numParticles:n(60),lifetime:.7,rate:.012,rate2:.016,emitterShape:EMITTERSHAPE_BOX,emitterExtents:new Vec3(.04,.04,.04),
      localVelocityGraph:new CurveSet([[0,1.35,1,1.1],[0,.7,1,-2.2],[0,0]]),localVelocityGraph2:new CurveSet([[0,1.5,1,1.25],[0,.8,1,-2.4],[0,.05]]),scaleGraph:new Curve([0,.045,1,.07]),alphaGraph:new Curve([0,.5,.85,.35,1,0]),colorGraph:new CurveSet([[0,.82],[0,.93],[0,1]]),blendType:BLEND_NORMAL,alignToMotion:true,stretch:.35});
      e.setEulerAngles(0,-a*180/Math.PI,0);e.particlesystem.enabled=false;this.jets.push(e);}
    this.fx.splash=this.particle('Espuma',[FOUNTAIN.x,.66,FOUNTAIN.z],{numParticles:n(90),lifetime:.6,rate:.01,rate2:.02,emitterShape:EMITTERSHAPE_SPHERE,emitterRadius:2.4,emitterRadiusInner:2.1,
      velocityGraph:new CurveSet([[0,0],[0,.35,1,0],[0,0]]),scaleGraph:new Curve([0,.1,1,.3]),alphaGraph:new Curve([0,.35,1,0]),colorGraph:new CurveSet([[0,.92],[0,.96],[0,1]]),blendType:BLEND_NORMAL});
    this.fx.smoke=this.particle('Humo del Taller',[TALLERES.electronica.x-2.4,BUILDINGS.electronica.h+4.1,TALLERES.electronica.z+5.3],{numParticles:n(40),lifetime:5,rate:.18,rate2:.3,emitterShape:EMITTERSHAPE_SPHERE,emitterRadius:.2,
      velocityGraph:new CurveSet([[0,.2,1,.9],[0,1.1,1,.7],[0,0,1,.2]]),scaleGraph:new Curve([0,.4,1,2]),alphaGraph:new Curve([0,0,.15,.22,1,0]),colorGraph:new CurveSet([[0,.62],[0,.6],[0,.6]]),blendType:BLEND_NORMAL});
    this.fx.portal=this.particle('Chispas del Portal',[TALLERES.electronica.x-3.9,2.3,TALLERES.electronica.z],{numParticles:n(50),lifetime:2.2,rate:.05,rate2:.09,emitterShape:EMITTERSHAPE_SPHERE,emitterRadius:1.7,emitterRadiusInner:1.5,
      velocityGraph:new CurveSet([[0,-.1,1,.1],[0,.2,1,.5],[0,.3,1,.6]]),scaleGraph:new Curve([0,.12,1,.02]),alphaGraph:new Curve([0,0,.2,1,1,0]),colorGraph:new CurveSet([[0,.5],[0,1],[0,1]])});
    {const t=TALLERES.fisica,sx=t.side==='e'?1:-1;this.fx.quantum=this.particle('Chispas cuánticas',[t.x-sx*3.9,2.25,t.z],{numParticles:n(80),lifetime:2.4,rate:.03,rate2:.06,emitterShape:EMITTERSHAPE_SPHERE,emitterRadius:.95,
      velocityGraph:new CurveSet([[0,-.2,1,.2],[0,.15,1,-.15],[0,.2,1,-.2]]),scaleGraph:new Curve([0,.05,1,.02]),alphaGraph:new Curve([0,0,.3,1,1,0]),colorGraph:new CurveSet([[0,1],[0,.75],[0,.4]])});}
    this.fx.fireflies=this.particle('Luciérnagas',[0,1.6,-1],{numParticles:n(70),lifetime:6,rate:.08,rate2:.16,emitterShape:EMITTERSHAPE_BOX,emitterExtents:new Vec3(34,2.4,26),
      velocityGraph:new CurveSet([[0,-.3,.5,.3,1,-.2],[0,.1,.5,-.1,1,.15],[0,.3,.5,-.3,1,.2]]),scaleGraph:new Curve([0,.12,1,.12]),alphaGraph:new Curve([0,0,.2,1,.4,.2,.6,1,.8,.3,1,0]),colorGraph:new CurveSet([[0,1],[0,.95],[0,.55]])});
    this.fx.lantern=this.particle('Brillo de la linterna',[TOWER.x,TOWER.shaft+4.5,TOWER.z],{numParticles:n(14),lifetime:3,rate:.2,rate2:.3,emitterShape:EMITTERSHAPE_SPHERE,emitterRadius:.9,
      velocityGraph:new CurveSet([[0,0],[0,.3],[0,0]]),scaleGraph:new Curve([0,.3,1,.05]),alphaGraph:new Curve([0,0,.3,.8,1,0]),colorGraph:new CurveSet([[0,1],[0,.95],[0,.75]])});
    for(const e of Object.values(this.fx))e.particlesystem.enabled=false;
  }
  buildHighlight(){
    const m=new StandardMaterial();m.useLighting=false;m.diffuse=col('#000000');m.emissive=col('#ffd98f');m.emissiveMap=this.glowTexture;m.opacityMap=this.glowTexture;m.opacity=0;m.blendType=BLEND_ADDITIVE;m.depthWrite=false;m.update();
    const e=new Entity('Resplandor de sala');const mi=new MeshInstance(this.quadMesh(1,1),m,e);mi.castShadow=false;e.addComponent('render',{meshInstances:[mi]});e.setEulerAngles(-90,0,0);this.root.addChild(e);
    this.highlight={e,m,alpha:0};
  }
  buildBeam(){
    // Two cones of light turning from the lantern, like the Faro it now answers.
    const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d'),img=x.createImageData(256,64);
    for(let j=0;j<64;j++)for(let i=0;i<256;i++){const u=i/255,v=Math.abs(j/63-.5)*2,edge=Math.max(0,1-v/(.25+u*.75)),a=Math.pow(1-u,1.3)*Math.pow(edge,1.5),k=(j*256+i)*4;img.data[k]=255;img.data[k+1]=244;img.data[k+2]=210;img.data[k+3]=Math.round(a*255);}
    x.putImageData(img,0,0);const t=new Texture(this.app.graphicsDevice,{width:256,height:64,format:PIXELFORMAT_RGBA8,mipmaps:true,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});t.setSource(c);
    const m=new StandardMaterial();m.useLighting=false;m.diffuse=col('#000000');m.emissive=col('#fff1cc');m.emissiveMap=t;m.opacityMap=t;m.opacityMapChannel='a';m.blendType=BLEND_ADDITIVE;m.depthWrite=false;m.cull=CULLFACE_NONE;m.opacity=0;m.update();
    const pivot=new Entity('Haz');void 0;pivot.setPosition(TOWER.x,TOWER.shaft+4.5,TOWER.z);this.root.addChild(pivot);
    for(const s of [0,180])for(const tilt of [0,60,120]){const e=new Entity('Haz · cono');const mesh=new Mesh(this.app.graphicsDevice),L=60,W=6;
      mesh.setPositions(new Float32Array([0,0,-.3,L,0,-W/2,L,0,W/2,0,0,.3]));mesh.setUvs(0,new Float32Array([0,0,1,0,1,1,0,1]));mesh.setNormals(new Float32Array(12).fill(0));mesh.setIndices(new Uint32Array([0,1,2,0,2,3]));mesh.update();
      const mi=new MeshInstance(mesh,m,e);mi.castShadow=false;e.addComponent('render',{meshInstances:[mi]});e.setLocalEulerAngles(tilt,s,-4);pivot.addChild(e);}
    this.beam={pivot,m};
  }
  async buildSprites(){
    const place=async(name,x,z,stage)=>{
      const sprite=await actorArt(this.app,name);const e=new Entity(name);
      e.addComponent('sprite',{type:'simple',sprite,frame:0});e.sprite.material=e.sprite.material.clone();e.sprite.material.depthWrite=true;e.sprite.material.alphaTest=.22;e.sprite.material.update();
      e.setPosition(x,.08,z);this.root.addChild(e);e.enabled=false;return {e,stage,name,phase:x};
    };
    this.sprites=[
      await place('ohm',-22.4,-1.4,1),
      await place('edda',-3.6,5,10),await place('lumen',4,4.8,10),await place('tala',7,-6.4,10),await place('nereo',-7,-6.2,10),
    ];
    try{this.sprites.push(await place('player',-1.2,25,0));}catch{}
  }

  // ── Input: click to enter, drag to turn, wheel to approach ────────────────────
  bindInput(){
    const c=this.canvas;let down=null,moved=0;const pointers=new Map();let pinch=null;
    c.addEventListener('pointerdown',e=>{c.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);down={x:e.clientX,y:e.clientY,yaw:this.goal.yaw,pitch:this.goal.pitch};moved=0;
      if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),dist:this.goal.distance};}});
    c.addEventListener('pointermove',e=>{
      if(pointers.has(e.pointerId))pointers.set(e.pointerId,[e.clientX,e.clientY]);
      if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);this.goal.distance=clamp(pinch.dist*pinch.d/d,this.minDistance(),this.maxDistance());moved=99;return;}
      if(down){const dx=e.clientX-down.x,dy=e.clientY-down.y;moved=Math.max(moved,Math.hypot(dx,dy));
        if(moved>5){this.goal.yaw=clamp(down.yaw-dx*.18,this.yawLimits()[0],this.yawLimits()[1]);this.goal.pitch=clamp(down.pitch+dy*.14,14,68);this.userMoved=true;c.style.cursor='grabbing';}return;}
      this.hoverAt(e.clientX,e.clientY);
    });
    const up=e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!down)return;const was=down;down=null;c.style.cursor='';
      if(moved<=5&&e.type==='pointerup'){const id=this.pick(e.clientX,e.clientY);this.onSelect(id,{x:e.clientX,y:e.clientY});}void was;};
    c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
    c.addEventListener('pointerleave',()=>{if(!down)this.setHover(null);});
    c.addEventListener('wheel',e=>{e.preventDefault();this.goal.distance=clamp(this.goal.distance*Math.exp(e.deltaY*.0012),this.minDistance(),this.maxDistance());this.userMoved=true;},{passive:false});
  }
  minDistance(){return this.focusId?16:48;}
  maxDistance(){return this.focusId?70:200;}
  yawLimits(){const base=this.focusId?ROOMS[this.focusId].pose.yaw:OVERVIEW.yaw;return [base-50,base+50];}
  hoverAt(x,y){this.setHover(this.pick(x,y));}
  setHover(id){if(id===this.hoverId)return;this.hoverId=id;this.canvas.style.cursor=id?'pointer':'';this.onHover(id);}
  pick(sx,sy){
    const r=this.canvas.getBoundingClientRect(),cam=this.camera.camera,x=sx-r.left,y=sy-r.top;
    const from=cam.screenToWorld(x,y,cam.nearClip),to=cam.screenToWorld(x,y,cam.farClip),dir=to.clone().sub(from).normalize();
    let best=null,bestT=Infinity;
    for(const [id,room] of Object.entries(ROOMS)){
      const [lo,hi]=room.pick;let t0=0,t1=Infinity,hit=true;
      for(let a=0;a<3;a++){const o=[from.x,from.y,from.z][a],d=[dir.x,dir.y,dir.z][a];
        if(Math.abs(d)<1e-6){if(o<lo[a]||o>hi[a]){hit=false;break;}continue;}
        let ta=(lo[a]-o)/d,tb=(hi[a]-o)/d;if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb);if(t0>t1){hit=false;break;}}
      if(hit&&t0<bestT){bestT=t0;best=id;}
    }
    return best;
  }

  // ── Camera ──────────────────────────────────────────────────────────────────
  flyTo(pose,{instant=false}={}){
    this.goal={yaw:pose.yaw,pitch:pose.pitch,distance:pose.distance,target:new Vec3(...pose.target)};
    if(instant||this.reducedMotion){this.cam={...this.goal,target:this.goal.target.clone()};}
    this.userMoved=false;
  }
  focus(id,{instant=false}={}){
    this.focusId=id&&ROOMS[id]?id:null;this.closeUp=false;
    this.flyTo(this.focusId?ROOMS[id].pose:OVERVIEW,{instant});
    this.frame.dof.focusRange=this.focusId?16:60;this.frame.update();
  }
  showcase(i){this.focusId=null;this.closeUp=true;this.flyTo(SHOWCASE[i]);this.frame.dof.focusRange=14;this.frame.update();}
  placeCamera(dt){
    const k=this.reducedMotion?1:1-Math.exp(-dt*3.2),c=this.cam,g=this.goal;
    c.yaw=lerp(c.yaw,g.yaw,k);c.pitch=lerp(c.pitch,g.pitch,k);c.distance=lerp(c.distance,g.distance,k);c.target.lerp(c.target,g.target,k);
    // A slow breathing drift in the overview keeps the miniature alive.
    const drift=!this.focusId&&!this.userMoved&&!this.reducedMotion?Math.sin(this.clock*.07)*4:0;
    const r=this.canvas.getBoundingClientRect(),aspect=r.width/Math.max(1,r.height),cam=this.camera.camera;
    // Portrait screens widen the lens and step back so the whole island fits across.
    const fov=aspect<1?Math.min(40,24/Math.max(aspect,.5)*.8):24;if(Math.abs(cam.fov-fov)>.01)cam.fov=fov;
    const tanH=Math.tan(fov*Math.PI/360),fit=this.focusId||this.closeUp?(aspect<1?1.25:1):Math.max(1,(aspect<1?40:50)/(tanH*aspect*c.distance));
    const yaw=(c.yaw+drift)*Math.PI/180,p=(c.pitch+(!this.focusId&&!this.closeUp&&aspect<1?8:0))*Math.PI/180,d=c.distance*fit;
    this.shift=lerp(this.shift||0,this.panelShift||0,k);this.shiftY=lerp(this.shiftY||0,this.panelShiftY||0,k);
    const sx=this.shift*tanH*d*aspect,sy=this.shiftY*tanH*d;
    // Move the look point right (panel on the side) or down (panel below) so the room sits in the free area.
    const tx=c.target.x+Math.cos(yaw)*sx+Math.sin(yaw)*Math.sin(p)*sy,ty=c.target.y-Math.cos(p)*sy,tz=c.target.z-Math.sin(yaw)*sx+Math.cos(yaw)*Math.sin(p)*sy;
    this.camera.setPosition(tx+Math.sin(yaw)*Math.cos(p)*d,ty+Math.sin(p)*d,tz+Math.cos(yaw)*Math.cos(p)*d);
    this.camera.lookAt(tx,ty,tz);
    const want=d;if(Math.abs(this.frame.dof.focusDistance-want)>.2){this.frame.dof.focusDistance=want;this.frame.update();}
    const fog=this.app.scene.fog;fog.start=d+18;fog.end=d*1.9+120;
  }

  // ── Hour and stage ──────────────────────────────────────────────────────────
  setHour(id,instant=false){
    if(!HOURS[id])return;this.hourId=id;const h=HOURS[id];
    const from=this.hourMix?.to||h;this.hourMix={from:instant?h:this.currentHour||from,to:h,t:instant?1:0};
  }
  applyHour(dt){
    const m=this.hourMix;if(!m)return;m.t=Math.min(1,m.t+dt/1.6);const t=ease(m.t),a=m.from,b=m.to;
    const c=k=>mixColor(col(a[k]),col(b[k]),t);
    this.currentHour={...b,sun:[lerp(a.sun[0],b.sun[0],t),lerp(a.sun[1],b.sun[1],t),b.sun[2],lerp(a.sun[3],b.sun[3],t)],lamps:lerp(a.lamps,b.lamps,t),windows:lerp(a.windows,b.windows,t),grade:a.grade.map((v,i)=>lerp(v,b.grade[i],t))};
    const s=this.currentHour.sun;this.sun.setEulerAngles(s[0]+90,s[1],0);this.sun.light.color=mixColor(col(a.sun[2]),col(b.sun[2]),t);this.sun.light.intensity=s[3];
    this.app.scene.ambientLight=c('ambient');this.camera.camera.clearColor=linear(c('below'));
    this.paintSky(c('zenith'),c('horizon'),c('below'));
    this.cloudMaterial.emissive=c('cloud');this.cloudMaterial.update();
    // Haze toward the horizon colour turns the far hills blue and the night ones into silhouettes.
    const night=lerp(a.lamps,b.lamps,t);this.app.scene.fog.color=mixColor(c('horizon'),col('#fff8ec'),.42*(1-clamp((night-.6)/.4,0,1)));
    this.skyColors={zenith:c('zenith'),horizon:c('horizon')};
    if(m.t>=1){this.hourMix=null;this.buildEnvironment(b);}this.stageDirty=true;
  }
  /** Image-based light from the hour's sky, so brass and gold have something to reflect. */
  buildEnvironment(h){
    const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
    g.addColorStop(0,h.zenith);g.addColorStop(.47,h.horizon);g.addColorStop(.53,h.horizon);g.addColorStop(.62,h.below);g.addColorStop(1,'#2a2622');x.fillStyle=g;x.fillRect(0,0,512,256);
    const sy=128-h.sun[0]/90*128,sx=((h.sun[1]+180)%360)/360*512,sg=x.createRadialGradient(sx,sy,1,sx,sy,60);sg.addColorStop(0,'#ffffff');sg.addColorStop(.2,h.sun[2]+'aa');sg.addColorStop(1,h.sun[2]+'00');x.fillStyle=sg;x.fillRect(0,0,512,256);
    const src=new Texture(this.app.graphicsDevice,{width:512,height:256,format:PIXELFORMAT_RGBA8,projection:TEXTUREPROJECTION_EQUIRECT,mipmaps:false,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE,srgb:true});src.setSource(c);
    const lighting=EnvLighting.generateLightingSource(src),atlas=EnvLighting.generateAtlas(lighting);
    const old=this.app.scene.envAtlas;this.app.scene.envAtlas=atlas;this.app.scene.skyboxIntensity=h.env??.9;src.destroy();lighting.destroy();old?.destroy();
  }
  /** Set the school's stage (0..10) from the Ohmdal save. */
  setStage(stage,{instant=false}={}){this.stage=clamp(stage,0,10);if(instant)this.levels=this.levels.map((_,i)=>i<this.stage?1:0);this.stageDirty=true;}
  setTrophies(list){this.trophyState=list;this.stageDirty=true;}
  show(part,on){const e=this.parts.get(part);if(e)e.enabled=on;}
  applyStage(force=false){
    const L=i=>this.levels[i]||0,h=this.currentHour||HOURS[this.hourId],night=h.lamps;
    const glass=(id,v)=>{const m=this.materials[`glass@${id}`];if(m){m.emissiveIntensity=v;m.update();}};
    // 1 awaken, 2 workshop: the Taller comes back.
    // Each workshop wakes with its own world. Worlds still in preparation keep an ember.
    const wake={ohmdal:Math.max(L(0)*.45,L(1))};
    for(const [id,t] of Object.entries(TALLERES)){
      const w=wake[t.world]||0,awake=t.world==='ohmdal'?.25+L(0)*.75:.12;
      glass(id,(.06+w)*(.5+h.windows*2.2));this.rooms[`taller:${id}`].light.intensity=w*(1.4+night*1.2);
      this.rooms[`portal:${id}`].light.intensity=(t.world==='ohmdal'?.6+L(0)*1.4:.35+night*.3);
      this.materials[`portal@${id}`]?.setParameter('uAwake',awake);
      const sc=this.materials[`screen@${id}`];if(sc){sc.emissiveIntensity=t.world==='ohmdal'?L(1)*2.2:.7+night*.6;sc.update();}
    }
    const leds=this.materials['leds@programacion'];leds.emissiveIntensity=.35+night*.3;leds.update();
    this.fx.smoke.particlesystem.enabled=L(1)>.5&&!this.reducedMotion;this.fx.portal.particlesystem.enabled=true;this.fx.quantum.particlesystem.enabled=!this.reducedMotion;
    // Dirección is where the student started: always a little lit.
    glass('direccion',.25+h.windows*1.6);this.rooms.direccion.light.intensity=.8+night*1.1;
    const trophies=this.trophyState||[],earned=trophies.filter(t=>t.earned).length;
    glass('trofeos',(.2+earned/12*.8)*(.5+h.windows*1.8));this.rooms.trofeos.light.intensity=(.25+earned/12)*(1.2+night);
    // 3 gate: the leaves swing open, the chain falls.
    const g=ease(L(2));this.parts.get('gate:w')?.setLocalEulerAngles(0,-105*g,0);this.parts.get('gate:e')?.setLocalEulerAngles(0,105*g,0);this.show('gate:chain',L(2)<.5);
    // 4 pump: water returns to the fountain.
    const water=this.parts.get('fountain:water');if(water){water.enabled=L(3)>.01;water.setLocalScale(1,1,1);water.setLocalPosition(0,(L(3)-1)*.45,0);}
    this.show('fountain:leaves',L(3)<.5);for(const j of this.jets)j.particlesystem.enabled=L(3)>.6;this.fx.splash.particlesystem.enabled=L(3)>.6;
    // 5 distribution: lamps light branch by branch.
    const lampMat=this.materials.lampGlass;lampMat.emissiveIntensity=L(4)*(.8+night*2.6);lampMat.update();
    this.lampLights.forEach((e,i)=>{const on=clamp(L(4)*LAMPS.length-i,0,1);e.light.intensity=on*(.3+night*2.3);});
    this.fx.fireflies.particlesystem.enabled=L(4)>.5&&night>.7;
    // 6 irrigation: flowers, no weeds, a greener lawn.
    this.show('planters:dry',L(5)<.5);this.show('planters:green',L(5)>.05);this.show('planters:flowers',L(5)>.5);this.show('weeds',L(5)<.5);
    const green=this.parts.get('planters:green');if(green)green.setLocalScale(1,Math.max(.05,L(5)),1);
    const grass=this.materials.grass,lush=clamp(this.stage/10+L(5)*.5,0,1);grass.diffuse=mixColor(col('#d4c996'),col('#cfdcA2'),lush);grass.update();
    const hedge=this.materials.hedge;hedge.diffuse=mixColor(col('#7f8a55'),col('#62894a'),lush);hedge.update();
    // 7 beacon_link: banners unroll.
    const banners=this.parts.get('banners');if(banners){banners.enabled=L(6)>.01;banners.setLocalScale(1,Math.max(.01,ease(L(6))),1);banners.setLocalPosition(0,4.85*(1-ease(L(6))),0);}
    // 8 beacon_network: the bell swings (see update). 9 beacon_lens: the lantern.
    const lantern=this.materials.lanternGlass;lantern.emissiveIntensity=L(8)*(1.6+night*3);lantern.update();
    this.rooms.lantern.light.intensity=L(8)*(.6+night*1.4);this.beam.m.opacity=L(8)*clamp((night-.75)/.25,0,1)*.2*(1-(this.focusFade||0));this.beam.m.update();this.beam.pivot.enabled=L(8)>.01;
    this.fx.lantern.particlesystem.enabled=L(8)>.5;
    // Roxana's lamp burns from the first light; the screen glows with the evening.
    const flame=this.materials.flame;flame.emissiveIntensity=.4+L(0)*1.4+night*1.2;flame.update();
    const lamp=this.materials.roxanaLamp;lamp.emissiveIntensity=L(0)*(1.2+night*2.4);lamp.update();this.rooms.statue.light.intensity=L(0)*(.5+night*1.8);
    const city=this.materials['city@programacion'];if(!this.entrySeq){city.emissiveIntensity=.3+night*.8;city.update();}
    const world=this.materials['world@fisica'];if(!this.entrySeq){world.emissiveIntensity=1.2+night*.9;world.update();}
    const visor=this.materials['visor@programacion'];if(!this.entrySeq){visor.emissiveIntensity=.35+night*.5;visor.update();}
    this.materials.screen.emissiveIntensity=.55+night*.55;this.materials.screen.update();this.rooms.screen.light.intensity=.2+night*.9;
    this.materials.lampShade.emissiveIntensity=.2+night*1.2;this.materials.lampShade.update();
    this.fx.dust.particlesystem.enabled=!this.reducedMotion&&night<.9;
    // Trophies.
    trophies.forEach((t,i)=>{this.show(`trophy:ohmdal:${i}`,t.earned);this.show(`dome:ohmdal:${i}`,!t.earned);});
    // Visitors.
    for(const s of this.sprites||[])s.e.enabled=s.stage===0?this.stage<10:this.stage>=s.stage;
    // Grade: the abandoned school is cooler and flatter.
    const warm=this.stage/10,gr=h.grade;this.frame.grading.saturation=gr[0]*lerp(.78,1.02,warm);this.frame.grading.tint=new Color(gr[1]*lerp(.95,1,warm),gr[2],gr[3]*lerp(1.06,1,warm));this.frame.grading.brightness=gr[4];this.frame.update();
    this.stageDirty=false;void force;
  }

  // ── Frame ───────────────────────────────────────────────────────────────────
  update(dt){
    dt=Math.min(dt,.1);this.clock+=dt;
    this.applyHour(dt);
    // Levels chase the stage one after another, so a return plays like a sequence.
    for(let i=0;i<this.levels.length;i++){const want=i<this.stage?1:0;if(this.levels[i]!==want){const prevDone=i===0||this.levels[i-1]>=.999||want===0;if(prevDone){this.levels[i]=want>this.levels[i]?Math.min(1,this.levels[i]+dt/(this.reducedMotion?.01:.9)):Math.max(0,this.levels[i]-dt/.5);this.stageDirty=true;}}}
    if(this.stageDirty)this.applyStage();
    this.placeCamera(dt);
    const camPos=this.camera.getPosition(),camRot=this.camera.getRotation();
    // Trees and sprites turn toward the camera on the vertical axis.
    const yaw=Math.atan2(camPos.x-0,camPos.z-0);
    for(const t of this.trees){const p=t.e.getPosition(),a=Math.atan2(camPos.x-p.x,camPos.z-p.z)*180/Math.PI,sway=this.reducedMotion?0:Math.sin(this.clock*.9+t.phase)*.9;t.e.setEulerAngles(0,a,sway);}
    for(const s of this.sprites||[])if(s.e.enabled){s.e.setRotation(camRot);if(!this.reducedMotion)s.e.setLocalScale(1,1+Math.sin(this.clock*2+s.phase)*.012,1);}
    for(const c of this.clouds){c.a+=dt*c.speed*(this.reducedMotion?0:1);c.e.setPosition(Math.cos(c.a)*c.r,c.y,Math.sin(c.a)*c.r*.8);c.e.setRotation(camRot);}
    void yaw;
    // Rooms: roofs lift and walls lower toward the camera when a room is open.
    for(const [id,b] of Object.entries(BUILDINGS)){
      const open=this.focusId===id?1:0,hover=this.hoverId===id&&!open?1:0;
      const st=(this.cut??={})[id]??={open:0,hover:0};st.open=lerp(st.open,open,1-Math.exp(-dt*(this.reducedMotion?60:3.5)));st.hover=lerp(st.hover,hover,1-Math.exp(-dt*8));
      const roof=this.parts.get(`${id}:roof`),rb=this.basePos.get(`${id}:roof`);
      if(roof){const lift=ease(clamp(st.open,0,1))*16+st.hover*.55;roof.setLocalPosition(rb.x,rb.y+lift,rb.z);roof.enabled=st.open<.97;}
      for(const side of ['n','s','e','w']){const w=this.parts.get(`${id}:wall:${side}`);if(!w)continue;const drop=b.cut.includes(side)?ease(clamp(st.open,0,1)):0;w.setLocalScale(1,1-drop*.88,1);}
      if(id==='direccion'){const p=this.parts.get('direccion:portico');if(p){p.setLocalScale(1,Math.max(.001,1-ease(clamp(st.open,0,1))),1);p.enabled=st.open<.97;}const bn=this.parts.get('banners');if(bn&&st.open>.02)bn.setLocalScale(1,Math.max(.01,ease(this.levels[6])*(1-st.open)),1);}
      if(id==='trofeos'){const p=this.parts.get('trofeos:colonnade');if(p){p.setLocalScale(1,Math.max(.001,1-ease(clamp(st.open,0,1))),1);p.enabled=st.open<.97;}}
    }
    const fade=this.focusId?1:0;if(Math.abs((this.focusFade||0)-fade)>.01){this.focusFade=lerp(this.focusFade||0,fade,1-Math.exp(-dt*4));this.stageDirty=true;}
    // Hover glow on the ground under the room.
    const hl=this.highlight,target=this.hoverId&&this.hoverId!==this.focusId?1:0;hl.alpha=lerp(hl.alpha,target,1-Math.exp(-dt*8));
    if(this.hoverId){const [lo,hi]=ROOMS[this.hoverId].pick;hl.e.setPosition((lo[0]+hi[0])/2,.12,(lo[2]+hi[2])/2+(hi[2]-lo[2])*.75);hl.e.setLocalScale((hi[0]-lo[0])*1.5,(hi[2]-lo[2])*1.5,1);hl.e.setPosition(hl.e.getPosition().x,.12,(lo[2]+hi[2])/2+(hi[2]-lo[2])*.75);}
    hl.m.opacity=hl.alpha*(.55+Math.sin(this.clock*3)*.1);hl.m.update();hl.e.enabled=hl.alpha>.01;
    // Clock hands: stopped at ten to three until the Faro's network runs.
    // The clock stays at ten to three; the bell swings once the Faro's network sings.
    this.parts.get('clock:minute')?.setLocalEulerAngles(0,0,120);this.parts.get('clock:hour')?.setLocalEulerAngles(0,0,-85);
    const motion=this.reducedMotion?0:1;
    this.parts.get('bell')?.setLocalEulerAngles(Math.sin(this.clock*2.4)*16*this.levels[7]*motion,0,0);
    this.parts.get('pendulum:fisica')?.setLocalEulerAngles(Math.sin(this.clock*1.7)*14*motion,0,0);
    this.parts.get('orrery:fisica')?.setLocalEulerAngles(0,this.clock*6*motion,0);
    if(this.beam.pivot.enabled&&!this.reducedMotion)this.beam.pivot.setEulerAngles(0,this.clock*22,0);
    this.materials['portal@electronica'].setParameter('uPortalTime',this.clock);
    this.worldAngle=(this.worldAngle||0)+dt*(this.worldSpin??14);
    if(!this.reducedMotion){this.parts.get('world:fisica')?.setLocalEulerAngles(0,this.worldAngle,Math.sin(this.clock*.4)*6);
      this.boardClock=(this.boardClock||0)+dt;if(!this.boardSeq&&this.boardClock>.1){this.boardClock=0;this.drawBoard(this.clock);}}
    if(this.boardSeq)this.stepBoardEntry(dt);
    if(this.entrySeq)this.stepEntry(dt);
    const sky=this.skyColors||{zenith:col('#6d8fb0'),horizon:col('#f2d3a8')};
    updateWater([this.materials.water],{time:this.clock,motion:this.reducedMotion?0:1,sky:sky.zenith,horizon:sky.horizon,sunDir:this.sun.forward.clone().mulScalar(-1),sunColor:this.sun.light.color,night:clamp((this.currentHour?.lamps||0)-.5,0,.5)*2});
    if(this.video&&this.video.readyState>=2&&this.materials.screen.emissiveMap===this.videoTexture)this.videoTexture.upload();
    this.onFrame(dt);
  }
  /** Screen position of a world point in CSS pixels, or null when behind the camera. */
  project(p,out=new Vec3()){
    const cam=this.camera.camera;cam.worldToScreen(new Vec3(...p),out);
    const fwd=this.camera.forward,cp=this.camera.getPosition();if((p[0]-cp.x)*fwd.x+(p[1]-cp.y)*fwd.y+(p[2]-cp.z)*fwd.z<0)return null;return out;
  }

  // ── The Anfiteatro screen ───────────────────────────────────────────────────
  playOnScreen(video){
    this.stopScreen();if(!video)return;
    this.video=video;this.videoTexture=new Texture(this.app.graphicsDevice,{format:PIXELFORMAT_RGBA8,mipmaps:false,minFilter:FILTER_LINEAR,magFilter:FILTER_LINEAR,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE});
    const attach=()=>{if(this.video!==video)return;this.videoTexture.setSource(video);this.materials.screen.emissiveMap=this.videoTexture;this.materials.screen.emissiveIntensity=.8;this.materials.screen.update();};
    if(video.readyState>=2)attach();else video.addEventListener('loadeddata',attach,{once:true});
  }
  stopScreen(){
    if(this.videoTexture){this.videoTexture.destroy();this.videoTexture=null;}this.video=null;
    this.materials.screen.emissiveMap=this.screen.texture;this.materials.screen.update();
  }
  setQuality(q){this.quality=q;this.app.graphicsDevice.maxPixelRatio=Math.min(window.devicePixelRatio||1,q==='high'?2:1.25);this.frame.rendering.samples=q==='high'?4:1;this.frame.ssao.type=q==='high'?SSAOTYPE_LIGHTING:SSAOTYPE_NONE;this.frame.dof.highQuality=q==='high';this.frame.update();this.sun.light.shadowResolution=q==='high'?4096:2048;}
  setReducedMotion(v){this.reducedMotion=v;this.stageDirty=true;}
}
void CULLFACE_FRONT;void Quat;void ISLAND;
