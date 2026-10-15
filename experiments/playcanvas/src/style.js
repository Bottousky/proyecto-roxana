import {ShaderChunks,SHADERLANGUAGE_GLSL,StandardMaterial,Quat,Vec3,Texture,PIXELFORMAT_RGBA8,FILTER_NEAREST,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';

// Two looks for the same kingdom. «hd2d» is the original: pixel-art surfaces, a long lens and a
// miniature blur. «xy» follows Pokémon X and Y as an upscaled emulator shows them: a closer camera,
// smooth painted surfaces, soft two-tone (cel) light, ink outlines and a clean, saturated palette.
// «xy» is the kingdom's look; ?estilo=hd2d brings back the original, remembered in this browser.
const KEY='ohmdal.estilo';
export const STYLE=(()=>{
  const asked=new URLSearchParams(globalThis.location?.search||'').get('estilo');
  try{if(asked==='xy'||asked==='hd2d')globalThis.localStorage?.setItem(KEY,asked);}catch{}
  let kept=null;try{kept=globalThis.localStorage?.getItem(KEY);}catch{}
  return (asked||kept)==='hd2d'?'hd2d':'xy';
})();
export const XY=STYLE==='xy';
globalThis.document?.documentElement?.setAttribute('data-estilo',STYLE);

// Cel light: the sun's Lambert term in two soft bands, lit and shade, with a narrow warm terminator.
// The shade band keeps 38 % of the light so forms stay readable and never go black.
const celDiffuse=`
float getLightDiffuse(vec3 worldNormal, vec3 viewDir, vec3 lightDirNorm) {
	float d = max(dot(worldNormal, -lightDirNorm), 0.0);
	return mix(0.38, 1.0, smoothstep(0.16, 0.30, d));
}
`;
/** Every lit standard material in the scene gets the cel light (sprites and unlit materials keep theirs). */
export function celShade(app){
  if(!XY)return;
  const seen=new Set();
  for(const r of app.root.findComponents('render'))for(const mi of r.meshInstances){
    const m=mi.material;if(!(m instanceof StandardMaterial)||seen.has(m)||m.useLighting===false)continue;seen.add(m);
    m.shaderChunksVersion='2.22';m.getShaderChunks(SHADERLANGUAGE_GLSL).set('lightDiffuseLambertPS',celDiffuse);m.update();
  }
}

// Ink outlines, the emulator-shader way: a final pass that reads the scene depth and darkens where
// the depth jumps (silhouettes, roof edges, a person against a wall). The ink takes the colour under
// it, darker and cooler, never pure black; far away it fades so the horizon stays soft.
const outlineDeclarations=`
uniform highp sampler2D uInkDepth;
uniform vec4 uInkCamera;
uniform float uInkLinear;
float inkDepth(vec2 uv){
	float z = texture2D(uInkDepth, uv).r;
	if (uInkLinear > 0.5) return z;
	return (uInkCamera.z * uInkCamera.y) / (uInkCamera.y + z * (uInkCamera.z - uInkCamera.y));
}
float inkAt(vec2 uv){
	float d = inkDepth(uv);
	vec2 px = sceneTextureInvRes * 1.25;
	float n = inkDepth(uv + vec2(0.0, -px.y)), s = inkDepth(uv + vec2(0.0, px.y));
	float e = inkDepth(uv + vec2(px.x, 0.0)), w = inkDepth(uv + vec2(-px.x, 0.0));
	float jump = max(max(abs(n - d), abs(s - d)), max(abs(e - d), abs(w - d)));
	// A jump counts relative to how far it is: one metre matters close by, not at the horizon.
	float edge = smoothstep(0.035, 0.09, jump / max(d, 1.0));
	return edge * (1.0 - smoothstep(70.0, 140.0, d));
}
`;
const INK_DEBUG=new URLSearchParams(globalThis.location?.search||'').get('tinta')==='ver';
const outlineEnd=INK_DEBUG?`
	result = vec3(fract(inkDepth(uv) / 10.0), inkAt(uv), 0.0);
`:`
	result = mix(result, result * vec3(0.30, 0.31, 0.40), inkAt(uv));
`;
export function xyFrame(frame,app,cameraComponent){
  if(!XY)return;
  const device=app.graphicsDevice,chunks=ShaderChunks.get(device,SHADERLANGUAGE_GLSL);
  chunks.set('composeDeclarationsPS',outlineDeclarations);chunks.set('composeMainEndPS',outlineEnd);
  frame.rendering.sceneDepthMap=true;
  frame.dof.enabled=false;
  frame.vignette.intensity=.12;frame.vignette.inner=.75;frame.vignette.outer=1.6;
  frame.bloom.intensity=.03;frame.bloom.blurLevel=10;
  frame.colorEnhance.enabled=true;frame.colorEnhance.vibrance=.18;frame.colorEnhance.shadows=.3;frame.colorEnhance.highlights=-.08;
  frame.update();
  // The compose pass does not bind the scene depth by itself: the ink reads it every frame.
  const params=new Float32Array(4),depth=device.scope.resolve('uInkDepth'),camera=device.scope.resolve('uInkCamera'),linear=device.scope.resolve('uInkLinear');
  // Before the first depth pass (and while a place is swapped) the ink reads a flat stand-in: no edges.
  const flat=new Texture(device,{name:'tinta-vacia',width:1,height:1,format:PIXELFORMAT_RGBA8,mipmaps:false});flat.lock().set([0,0,0,255]);flat.unlock();
  depth.setValue(flat);linear.setValue(1);
  app.on('prerender',()=>{const internal=cameraComponent.camera;if(!internal.sceneDepthMap){depth.setValue(flat);linear.setValue(1);return;}depth.setValue(internal.sceneDepthMap);camera.setValue(internal.fillShaderParams(params));linear.setValue(internal.shaderParams.sceneDepthMapLinear?1:0);});
}

/** The X and Y camera: nearer and steeper than the HD-2D long lens. */
export const XY_LENS={fov:true,distance:.6,pitch:43};

// The X and Y light through the day: clean and saturated by day, a warm but still colourful sunset,
// a blue dusk and night that keep their hues. [saturation, tint r, g, b, brightness]
export const XY_GRADES={morning:[1.06,.97,1,1.06,1.05],afternoon:[1.06,1,1,1.03,1.04],sunset:[1.02,1.05,.97,.95,1.02],dusk:[.96,.94,.95,1.08,1.02],night:[.82,.86,.93,1.14,1.0],'next-morning':[1.08,.97,1,1.05,1.06],inside:[1.02,1,1,1,1.02]};

/** X and Y sunlight is nearly white, the warmth of the hour only a hint: colour comes from the world. */
export function xySun(c){if(!XY)return c;c.r=c.r*.45+.55;c.g=c.g*.45+.55*.98;c.b=c.b*.45+.55*.93;return c;}

/** Surfaces repainted for the X and Y look (public/assets/xy, from art-src/xy via scripts/xy-textures.mjs). */
export const XY_SURFACES=new Set(['meadow','cobble','roof','stone','wood','plaster','timber','flagstone','rock','moss']);

// ── People in 3D ───────────────────────────────────────────────────────────────────────────
// A chunky 3D figure (scripts/blender/chibi.py) replaces a sprite: it hangs from the sprite's entity,
// undoing its tilt toward the camera, turns toward where it walks and swings legs and arms with the
// walk phase the game already keeps. On in the X and Y look; ?gente=sprites brings back the sprites.
const PEOPLE=new URLSearchParams(globalThis.location?.search||'').get('gente');
export const PEOPLE_3D=XY&&PEOPLE!=='sprites'&&PEOPLE!=='dibujo';
/** ?gente=dibujo: the traveller's sprite sheet redrawn in the X and Y style (option 2 of the prototype). */
export const DRAWN_PLAYER=XY&&PEOPLE==='dibujo';
const PARTS=['cadera','cuerpo','cabeza','pierna-izq','pierna-der','brazo-izq','brazo-der'];
// A skinned figure (scripts/blender/viajero-3d.py) swings its bones about the model's own axes:
// each bone keeps its rest rotation and turns by a delta around the model's X (forward swing) or Z
// (arms toward the body), expressed in the bone's rest frame.
const SKIN_BONES=['cadera','cuerpo','cuello','cabeza','brazo-izq','brazo-der','antebrazo-izq','antebrazo-der','pierna-izq','pierna-der','canilla-izq','canilla-der','pie-izq','pie-der'];
// ?figura=tsg: the traveller's shape made with TripoSG (MIT) instead of Hunyuan3D, to compare (ciclo 30).
export const FIGURE_URL={bloques:'./assets/xy/viajero.glb',tsg:'./assets/xy/viajero-tsg.glb'}[new URLSearchParams(globalThis.location?.search||'').get('figura')]??'./assets/xy/viajero-hy.glb';
/** The people that already have a 3D figure (public/assets/xy), by sprite name. */
// size: the figure's height relative to a person (Ohm is a small robot).
export const FIGURES={edda:{url:'./assets/xy/edda-3d.glb'},lumen:{url:'./assets/xy/lumen-3d.glb',size:.92},marin:{url:'./assets/xy/marin-3d.glb'},vega:{url:'./assets/xy/vega-3d.glb'},nereo:{url:'./assets/xy/nereo-3d.glb',size:.95},tala:{url:'./assets/xy/tala-3d.glb',size:.9},yesca:{url:'./assets/xy/yesca-3d.glb'},consejera:{url:'./assets/xy/consejera-3d.glb'},ohm:{url:'./assets/xy/ohm-3d.glb',size:.42}};
export async function attachFigure(app,actor,url,pitch,{chosen,size=1}={}){
  const asset=await new Promise((resolve,reject)=>app.assets.loadFromUrl(url,'container',(error,a)=>error?reject(error):resolve(a)));
  const model=asset.resource.instantiateRenderEntity();model.name='figura 3D';
  actor.entity.addChild(model);actor.entity.sprite.enabled=false;
  actor.figure={seed:Math.random(),cheer:-1,talking:false,model,pitch,parts:Object.fromEntries(PARTS.map(n=>[n,model.findByName(n)])),heading:0,time:0,tilt:new Quat(),turn:new Quat(),q:new Quat()};
  actor.figure.tilt.setFromEulerAngles(pitch,0,0);
  // Skinned: remember each bone's rest rotation and the model's X and Z axes in its rest frame.
  const skinned=SKIN_BONES.map(n=>model.findByName(n)).filter(Boolean);
  if(skinned.length>2){
    model.setLocalScale(1.36*size,1.36*size,1.36*size);
    // X and Y heads are big: a fifth larger than the model's, which also shows the face to a camera above.
    model.findByName('cabeza')?.setLocalScale(1.22,1.22,1.22);
    actor.figure.size=size;
    const inv=new Quat(),root=model.getRotation().clone().invert();
    actor.figure.bones=Object.fromEntries(skinned.map(b=>{const rest=b.getLocalRotation().clone(),world=new Quat().mul2(root,b.getRotation());inv.copy(world).invert();
      return [b.name,{entity:b,rest,x:inv.transformVector(new Vec3(1,0,0)),z:inv.transformVector(new Vec3(0,0,1)),rotation:new Quat(),delta:new Quat(),delta2:new Quat(),restPos:b.getLocalPosition().clone()}];}));
  }
  // Matte painted materials, like the world's: no glossy highlight washing the colours out.
  for(const r of model.findComponents('render'))for(const mi of r.meshInstances){const m=mi.material;if(!(m instanceof StandardMaterial))continue;m.useMetalness=true;m.metalness=0;m.metalnessMap=null;m.glossInvert=false;m.glossMap=null;m.gloss=.1;m.specularityFactor=0;m.ambient.set(.42,.42,.46);m.diffuse.set(.74,.72,.72);m.update();} // its texture already carries painted light: the sky's fill and full sun would wash it
  if(actor.figure.bones)actor.figure.setAppearance=await applyAppearance(app,model,url.replace(/\.glb$/,'').replace('-hy','')+'-regiones.json',url.replace(/\.glb$/,'').replace('-hy','')+'-regiones.png',chosen??{});
  celShade(app);updateFigure(actor,0,0,0);
}
export function updateFigure(actor,dx,dz,dt){
  const f=actor.figure;if(!f)return;const a=actor.animation;f.time+=dt;
  if(Math.hypot(dx,dz)>1e-4){const want=Math.atan2(dx,dz)*180/Math.PI;let d=want-f.heading;d-=360*Math.round(d/360);f.heading+=d*Math.min(1,dt*12);}
  f.turn.setFromEulerAngles(0,f.heading,0);f.q.mul2(f.tilt,f.turn);f.model.setLocalRotation(f.q);
  if(f.bones){(f.bones['pie-izq']?robotPose:skinnedPose)(f,a);return;}
  // Walk: a stride per two phase units; idle: a slow breath.
  const walk=a.moving?Math.sin(a.phase*Math.PI):0,breath=a.moving?0:Math.sin(f.time*2.2)*.012,P=f.parts;
  P['pierna-izq']?.setLocalEulerAngles(walk*32,0,0);P['pierna-der']?.setLocalEulerAngles(-walk*32,0,0);
  P['brazo-izq']?.setLocalEulerAngles(-walk*28,0,a.moving?6:3);P['brazo-der']?.setLocalEulerAngles(walk*28,0,a.moving?-6:-3);
  P['cadera']?.setLocalPosition(0,.62+(a.moving?Math.abs(Math.cos(a.phase*Math.PI))*.05:0)+breath,0);
  P['cabeza']?.setLocalEulerAngles(a.moving?3:Math.sin(f.time*.9)*2,0,0);
}

function turn(f,name,swing,lower=0){
  const b=f.bones[name];if(!b)return;
  b.delta.setFromAxisAngle(b.x,swing*57.2958);b.delta2.setFromAxisAngle(b.z,lower*57.2958); // PlayCanvas takes degrees
  b.rotation.mul2(b.rest,b.delta).mul(b.delta2);b.entity.setLocalRotation(b.rotation);
}
// Shared animations for every skinned figure (the same twelve bones): walking, an idle that breathes
// and now and then looks around, talking with a hand and the head, and a cheer with both arms up.
function skinnedPose(f,a){
  const t=f.time,walking=a.moving,s=walking?Math.sin(a.phase*Math.PI):0,c=walking?Math.cos(a.phase*Math.PI):0;
  const calm=f.reduced?0:1,breath=Math.sin(t*2.2)*calm;
  // A slow glance left or right every few seconds while standing.
  const glanceCycle=(t*.11+f.seed)%1,glance=walking||f.talking?0:Math.sin(Math.min(1,Math.max(0,(glanceCycle-.7)/.3))*Math.PI)*(f.seed>.5?1:-1)*calm;
  const cheer=f.cheer>=0&&f.cheer<1.4?Math.sin(Math.min(1,f.cheer/1.4)*Math.PI):0;
  const talk=f.talking&&!walking?1:0,beat=Math.sin(t*5.2),beat2=Math.sin(t*2.7+1);
  turn(f,'pierna-izq',-s*.5);turn(f,'pierna-der',s*.5);
  turn(f,'canilla-izq',Math.max(0,s)*.7);turn(f,'canilla-der',Math.max(0,-s)*.7);
  // Arms: swing when walking; the right one gestures while talking; both go up in a cheer.
  const gesture=talk*(.55+.25*beat2)*calm;
  turn(f,'brazo-izq',s*.45-cheer*2.1,-.3+cheer*.6);
  turn(f,'brazo-der',-s*.45-gesture-cheer*2.1,.3-cheer*.6-talk*.15);
  turn(f,'antebrazo-izq',-.25-Math.max(0,-s)*.3-cheer*.3);
  turn(f,'antebrazo-der',-.25-Math.max(0,s)*.3-talk*(.9+.25*beat)*calm-cheer*.3);
  turn(f,'cuerpo',walking?0:-.05+breath*.012+talk*beat2*.03*calm);
  // The head looks up a little (the camera is above), nods while talking, glances when idle.
  const head=f.bones.cabeza;
  if(head){head.delta.setFromAxisAngle(head.x,(walking?-.3:-.34+talk*beat*.08*calm-cheer*.2)*57.2958);head.delta2.setFromAxisAngle(head.z,0);
    f.q2??=new Quat();f.yaw??=new Quat();f.yaw.setFromAxisAngle(head.up??=(()=>{const v=new Vec3();v.cross(head.x,head.z);return v;})(),glance*28);
    head.rotation.mul2(head.rest,head.delta).mul(f.yaw);head.entity.setLocalRotation(head.rotation);}
  const hips=f.bones.cadera;if(hips){const p=hips.restPos,hop=cheer*.12;hips.entity.setLocalPosition(p.x,p.y+(walking?Math.abs(c)*.035:breath*.006*calm)+hop,p.z);}
}

// ── Appearance: hair, skin and clothes tinted by region ─────────────────────────────────────
// The figure carries a region map (scripts/blender/regiones.py → viajero-3d.py): one value per region.
// A tinted region keeps the painted light (each point's brightness relative to the region's own
// sample colour) and takes the chosen colour. Palettes are chosen by hand so every mix looks right.
export const APPEARANCE={
  pelo:{castaño:'#6a4532',oscuro:'#2c221e',rubio:'#d2a95a',pelirrojo:'#a9492a',ceniza:'#a49d95',azul:'#3d5d9a'},
  piel:{'1':'#f6d9c3','2':'#f0c7a6','3':'#d9a27c','4':'#b97a52','5':'#8c5536','6':'#5e3624'},
  ropa:{'verde azulado':'#2f6f80',granate:'#7a2f36',bosque:'#3b6a3c',azul:'#2c4e8e',mostaza:'#b4862e',grafito:'#4c5058'},
  bufanda:{mostaza:'#e5a63d',roja:'#c7413a',blanca:'#ece6da',verde:'#5e9b4f',violeta:'#7c58a8',celeste:'#6fb4d6'},
};
/** What the traveller looks like at first: the colours of the model as it was painted. */
export const APPEARANCE_DEFAULT={pelo:'castaño',piel:'2',ropa:'verde azulado',bufanda:'mostaza'};
/** The traveller's look, by name, kept in the Instituto Roxana's register beside the name. */
export function savedAppearance(){try{const a=JSON.parse(globalThis.localStorage?.getItem('roxana.escuela.v1')||'null')?.apariencia;return a&&typeof a==='object'?Object.fromEntries(Object.keys(APPEARANCE).filter(k=>APPEARANCE[k][a[k]]).map(k=>[k,a[k]])):{};}catch{return {};}}
/** Names to colours. The address can still ask for one (?pelo=rubio&piel=4&ropa=granate&bufanda=roja). */
export function appearanceColours(names){return Object.fromEntries(Object.keys(APPEARANCE).map(k=>[k,APPEARANCE[k][names?.[k]]??null]).filter(([,v])=>v));}
export function chosenAppearance(){const q=new URLSearchParams(globalThis.location?.search||'');return appearanceColours({...savedAppearance(),...Object.fromEntries(Object.keys(APPEARANCE).filter(k=>q.get(k)).map(k=>[k,q.get(k)]))});}
const linear=hex=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);return c.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);};
const tintPS=`
uniform vec3 material_diffuse;
uniform sampler2D uRegionMap;
uniform vec3 uRegionBase[16];
uniform vec3 uRegionTint[16];
void getAlbedo() {
	dAlbedo = material_diffuse.rgb;
	#ifdef STD_DIFFUSE_TEXTURE
		vec3 tex = {STD_DIFFUSE_TEXTURE_DECODE}(texture2DBias({STD_DIFFUSE_TEXTURE_NAME}, {STD_DIFFUSE_TEXTURE_UV}, textureBias)).{STD_DIFFUSE_TEXTURE_CHANNEL};
		int region = int(texture2D(uRegionMap, {STD_DIFFUSE_TEXTURE_UV}).r * 16.0);
		vec3 base = vec3(1.0), tint = vec3(-1.0);
		for (int i = 0; i < 16; i++) if (i == region) { base = uRegionBase[i]; tint = uRegionTint[i]; }
		if (tint.x >= 0.0) {
			float lb = max(dot(base, vec3(0.2126, 0.7152, 0.0722)), 0.02);
			float l = dot(tex, vec3(0.2126, 0.7152, 0.0722));
			tex = tint * clamp(l / lb, 0.0, 2.2);
		}
		dAlbedo *= tex;
	#endif
}
`;
export async function applyAppearance(app,figureModel,regionsUrl,mapUrl,chosen=chosenAppearance()){
  const info=await fetch(regionsUrl).then(r=>r.json()).catch(()=>null);if(!info)return;
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=mapUrl;});
  const map=new Texture(app.graphicsDevice,{name:'regiones',width:img.width,height:img.height,format:PIXELFORMAT_RGBA8,mipmaps:false,minFilter:FILTER_NEAREST,magFilter:FILTER_NEAREST,addressU:ADDRESS_CLAMP_TO_EDGE,addressV:ADDRESS_CLAMP_TO_EDGE,flipY:false});map.setSource(img);
  const base=new Float32Array(48),tint=new Float32Array(48),materials=[];
  info.regiones.forEach((r,i)=>base.set(linear(r.muestra),i*3));
  for(const r of figureModel.findComponents('render'))for(const mi of r.meshInstances){const m=mi.material;if(!(m instanceof StandardMaterial)||!m.diffuseMap)continue;
    m.shaderChunksVersion='2.22';m.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',tintPS);
    m.setParameter('uRegionMap',map);m.setParameter('uRegionBase[0]',base);m.update();materials.push(m);}
  // Returned so the look can change while playing (the register's chooser): only the tints move.
  const set=look=>{tint.fill(-1);info.regiones.forEach((r,i)=>{
    // Skin is always drawn from its sample: the pictures painted coat colour on some fingertips.
    const want=r.tenible&&look[r.tenible]?look[r.tenible]:r.tenible==='piel'?r.muestra:null;if(want)tint.set(linear(want),i*3);});
    for(const m of materials)m.setParameter('uRegionTint[0]',tint);};
  set(chosen);return set;
}

// Ohm: a round body on two feet. It waddles (the body rocks side to side over the stepping foot),
// bounces when it talks and hops in a celebration.
function robotPose(f,a){
  const t=f.time,walking=a.moving,s=walking?Math.sin(a.phase*Math.PI):0,calm=f.reduced?0:1;
  const cheer=f.cheer>=0&&f.cheer<1.4?Math.abs(Math.sin(f.cheer/.7*Math.PI)):0,talk=f.talking&&!walking?Math.abs(Math.sin(t*6)):0;
  const lift=k=>Math.max(0,k)*.12;
  for(const [n,k] of [['pie-izq',s],['pie-der',-s]]){const b=f.bones[n];if(!b)continue;b.entity.setLocalPosition(b.restPos.x,b.restPos.y+lift(k),b.restPos.z);turn(f,n,-k*.25);}
  const body=f.bones.cuerpo;if(body){b2(body,f,s*.12*calm,Math.sin(t*1.7)*.03*calm-talk*.08);}
  const hips=f.bones.cadera;if(hips){const p=hips.restPos;hips.entity.setLocalPosition(p.x,p.y+(walking?Math.abs(Math.cos(a.phase*Math.PI))*.05:Math.sin(t*2.4)*.01*calm)+talk*.05+cheer*.35,p.z);}
}
function b2(b,f,roll,pitch){b.delta.setFromAxisAngle(b.z,roll*57.2958);b.delta2.setFromAxisAngle(b.x,pitch*57.2958);b.rotation.mul2(b.rest,b.delta).mul(b.delta2);b.entity.setLocalRotation(b.rotation);}

/** X and Y skies: clear blue by day, a coral sunset, a blue dusk and a deep blue night. */
export const XY_SKIES={morning:'#3d9ae2',afternoon:'#4a9edc','next-morning':'#3f9de4',sunset:'#de7a58',dusk:'#3b55a6',night:'#13284f'}; // deep: tone mapping lightens them
