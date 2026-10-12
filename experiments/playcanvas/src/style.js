import {ShaderChunks,SHADERLANGUAGE_GLSL,StandardMaterial,Quat} from 'playcanvas';

// Two looks for the same kingdom. «hd2d» is the original: pixel-art surfaces, a long lens and a
// miniature blur. «xy» follows Pokémon X and Y as an upscaled emulator shows them: a closer camera,
// smooth painted surfaces, soft two-tone (cel) light, ink outlines and a clean, saturated palette.
// Chosen with ?estilo=xy (or ?estilo=hd2d), remembered in this browser.
const KEY='ohmdal.estilo';
export const STYLE=(()=>{
  const asked=new URLSearchParams(globalThis.location?.search||'').get('estilo');
  try{if(asked==='xy'||asked==='hd2d')globalThis.localStorage?.setItem(KEY,asked);}catch{}
  let kept=null;try{kept=globalThis.localStorage?.getItem(KEY);}catch{}
  return (asked||kept)==='xy'?'xy':'hd2d';
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
  app.on('prerender',()=>{const internal=cameraComponent.camera;if(!internal.sceneDepthMap)return;depth.setValue(internal.sceneDepthMap);camera.setValue(internal.fillShaderParams(params));linear.setValue(internal.shaderParams.sceneDepthMapLinear?1:0);});
}

/** The X and Y camera: nearer and steeper than the HD-2D long lens. */
export const XY_LENS={fov:true,distance:.52,pitch:40};

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
// walk phase the game already keeps. ?gente=3d turns it on in the X and Y look (the prototype).
export const PEOPLE_3D=XY&&new URLSearchParams(globalThis.location?.search||'').get('gente')==='3d';
const PARTS=['cadera','cuerpo','cabeza','pierna-izq','pierna-der','brazo-izq','brazo-der'];
export async function attachFigure(app,actor,url,pitch){
  const asset=await new Promise((resolve,reject)=>app.assets.loadFromUrl(url,'container',(error,a)=>error?reject(error):resolve(a)));
  const model=asset.resource.instantiateRenderEntity();model.name='figura 3D';
  actor.entity.addChild(model);actor.entity.sprite.enabled=false;
  actor.figure={model,pitch,parts:Object.fromEntries(PARTS.map(n=>[n,model.findByName(n)])),heading:0,time:0,tilt:new Quat(),turn:new Quat(),q:new Quat()};
  actor.figure.tilt.setFromEulerAngles(pitch,0,0);
  // Matte painted materials, like the world's: no glossy highlight washing the colours out.
  for(const r of model.findComponents('render'))for(const mi of r.meshInstances){const m=mi.material;if(!(m instanceof StandardMaterial))continue;m.useMetalness=true;m.metalness=0;m.gloss=.12;m.specularityFactor=0;m.diffuse.mulScalar(.88);m.update();}
  celShade(app);updateFigure(actor,0,0,0);
}
export function updateFigure(actor,dx,dz,dt){
  const f=actor.figure;if(!f)return;const a=actor.animation;f.time+=dt;
  if(Math.hypot(dx,dz)>1e-4){const want=Math.atan2(dx,dz)*180/Math.PI;let d=want-f.heading;d-=360*Math.round(d/360);f.heading+=d*Math.min(1,dt*12);}
  f.turn.setFromEulerAngles(0,f.heading,0);f.q.mul2(f.tilt,f.turn);f.model.setLocalRotation(f.q);
  // Walk: a stride per two phase units; idle: a slow breath.
  const walk=a.moving?Math.sin(a.phase*Math.PI):0,breath=a.moving?0:Math.sin(f.time*2.2)*.012,P=f.parts;
  P['pierna-izq']?.setLocalEulerAngles(walk*32,0,0);P['pierna-der']?.setLocalEulerAngles(-walk*32,0,0);
  P['brazo-izq']?.setLocalEulerAngles(-walk*28,0,a.moving?6:3);P['brazo-der']?.setLocalEulerAngles(walk*28,0,a.moving?-6:-3);
  P['cadera']?.setLocalPosition(0,.62+(a.moving?Math.abs(Math.cos(a.phase*Math.PI))*.05:0)+breath,0);
  P['cabeza']?.setLocalEulerAngles(a.moving?3:Math.sin(f.time*.9)*2,0,0);
}
