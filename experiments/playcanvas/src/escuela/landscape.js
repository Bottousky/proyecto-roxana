// The land around the Instituto: the school no longer floats. It stands on a low rise
// in open country, with a road that arrives at its gate, patchwork fields, tree belts
// and a ring of hills that the haze turns blue. One terrain mesh, one road ribbon and
// the distant trees merged per sprite, so the whole surround costs a handful of draws.
import {Mesh,MeshInstance,Entity,StandardMaterial,Color,CULLFACE_NONE} from 'playcanvas';
import {ISLAND} from './school.js';

const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
function hash2(i,j){let n=Math.imul(i,374761393)+Math.imul(j,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function vnoise(x,z){const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  return (hash2(i,j)*(1-u)+hash2(i+1,j)*u)*(1-v)+(hash2(i,j+1)*(1-u)+hash2(i+1,j+1)*u)*v;}
const fbm=(x,z)=>vnoise(x,z)*.55+vnoise(x*2.03+7.1,z*2.03-3.4)*.3+vnoise(x*4.1-2,z*4.1+5)*.15;

/** Distance outside the school's rounded rectangle (0 on its edge, negative inside). */
export function outside(x,z){
  const hw=ISLAND.w/2-ISLAND.r,hd=ISLAND.d/2-ISLAND.r,qx=Math.abs(x)-hw,qz=Math.abs(z)-hd;
  return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0)-ISLAND.r;
}
// The road leaves the gate southward and wanders toward the hills.
const ROAD=[[0,34],[0,46],[2,70],[10,105],[6,150],[-14,210],[-8,280],[22,360],[30,460],[12,600],[-20,760]];
export function roadX(z){
  if(z<=ROAD[0][1])return 0;for(let i=0;i<ROAD.length-1;i++){const [x0,z0]=ROAD[i],[x1,z1]=ROAD[i+1];if(z<=z1){const t=smooth(0,1,(z-z0)/(z1-z0));return x0+(x1-x0)*t;}}return ROAD.at(-1)[0];
}
/** Height of the land. The school's lawn is y = 0; the land falls away gently from it. */
export function heightAt(x,z){
  const d=outside(x,z);if(d<=0)return -.5;
  const r=Math.hypot(x,z);
  const bank=-.42-smooth(0,14,d)*1.3;
  // The road keeps to calmer ground so its ribbon lies flat on the land.
  const calm=z>30?1-smooth(12,3,Math.abs(x-roadX(z)))*.85:1;
  const roll=(fbm(x/70,z/70)-.45)*7*smooth(8,70,d)*calm;
  const hills=Math.pow(fbm(x/150+11,z/150-4),1.6)*90*smooth(170,430,r)+smooth(380,700,r)*40;
  return bank+roll+hills;
}
// Fields: large irregular plots of wheat, meadow, fallow and pasture tones.
const PLOTS=[[1.12,1.02,.66],[.84,.98,.62],[.98,.96,.7],[.74,.86,.56],[1.02,.88,.62],[.9,1.02,.7]];
function fieldTone(x,z){
  const a=.42,u=(x*Math.cos(a)-z*Math.sin(a))/62,v=(x*Math.sin(a)+z*Math.cos(a))/44,i=Math.floor(u+vnoise(x/40,z/40)*.6),j=Math.floor(v+vnoise(z/40,x/40)*.6);
  const t=PLOTS[Math.floor(hash2(i,j)*PLOTS.length)],n=.9+fbm(x/9,z/9)*.2;return [t[0]*n,t[1]*n,t[2]*n];
}

export function buildLandscape(app,root,{meadow,trees}){
  const out={};
  // ── Terrain: a polar grid, dense near the school and coarse at the horizon. ──
  const rings=[0,8,16,24,32,38,42,45,48,51,54,58,62,67,73,80,88,97,108,120,135,152,172,196,225,260,300,350,410,480,560,650,760,860];
  const seg=256,pos=[],nor=[],uv=[],col=[],idx=[];
  for(const r of rings)for(let i=0;i<=seg;i++){
    const a=i/seg*Math.PI*2,x=Math.cos(a)*r,z=Math.sin(a)*r,y=heightAt(x,z);pos.push(x,y,z);
    const e=.6,hx=heightAt(x+e,z)-heightAt(x-e,z),hz=heightAt(x,z+e)-heightAt(x,z-e),l=Math.hypot(hx,2*e,hz);nor.push(-hx/l,2*e/l,-hz/l);
    uv.push(x*.07,z*.07);
    const d=outside(x,z),near=smooth(4,30,d),f=fieldTone(x,z),lawn=[.95,1,.86],t=lawn.map((v,k)=>v+(f[k]-v)*near);
    // The road is packed earth painted into the grass, worn soft at its shoulders.
    const off=Math.abs(x-roadX(z)),w=z<60?3.4:2.6+smooth(200,700,z)*2,road=z>34.6?smooth(w+2.2,w*.55,off):0,shade=.92+.08*Math.min(1,Math.max(0,y/40));
    const dirt=[1.05,.78,.52];for(let k=0;k<3;k++)t[k]=t[k]+(dirt[k]-t[k])*road;
    col.push(t[0]*shade,t[1]*shade,t[2]*shade,1);
  }
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;idx.push(a,a+1,b,b,a+1,b+1);}
  const mesh=new Mesh(app.graphicsDevice);mesh.setPositions(new Float32Array(pos));mesh.setNormals(new Float32Array(nor));mesh.setUvs(0,new Float32Array(uv));mesh.setColors(new Float32Array(col));mesh.setIndices(new Uint32Array(idx));mesh.update();
  const ground=new StandardMaterial();ground.diffuseMap=meadow;ground.diffuse=new Color().fromString('#cfd6a2');ground.diffuseVertexColor=true;ground.useMetalness=true;ground.metalness=0;ground.gloss=.18;ground.update();
  out.terrain=entity('Campiña',mesh,ground,root,{cast:false});
  out.groundMaterial=ground;
  // ── Trees: belts along plot edges and copses, crossed planes merged per sprite. ──
  {
    const buckets=trees.map(()=>({p:[],n:[],u:[],c:[]}));let placed=0;
    for(let k=0;k<2600&&placed<170;k++){
      const a=hash2(k,3)*Math.PI*2,r=52+Math.pow(hash2(k,5),1.4)*300,x=Math.cos(a)*r,z=Math.sin(a)*r;
      if(outside(x,z)<5)continue;if(z>30&&Math.abs(x-roadX(z))<8)continue;
      // Copses where a slow noise is high, a few lone trees elsewhere.
      const dense=fbm(x/55+3,z/55-8);if(dense<.56&&hash2(k,9)>.05)continue;
      // Keep the view toward the gate and the patio open from the master camera.
      if(z>36&&z<110&&x>-30&&x<60)continue;
      // Behind the school the haze does the work: only a few trees there, so the roofline reads.
      if(z<-40&&x>-110&&x<150&&hash2(k,23)>.3)continue;
      const type=Math.floor(hash2(k,11)*trees.length),s=(.8+hash2(k,13)*.7)*(r>200?1.5:1),h=(type===1?8.2:7.2)*s,w=h*(type===1?.62:1.05),y=heightAt(x,z)-.1,rot=hash2(k,17)*Math.PI;
      const b=buckets[type],tint=.85+hash2(k,19)*.2;
      for(const q of [0,Math.PI/2]){const ca=Math.cos(rot+q)*w/2,sa=Math.sin(rot+q)*w/2,base=b.p.length/3;
        b.p.push(x-ca,y,z-sa,x+ca,y,z+sa,x+ca,y+h,z+sa,x-ca,y+h,z-sa);for(let v=0;v<4;v++){b.n.push(0,1,0);b.c.push(tint,tint,tint,1);}b.u.push(0,0,1,0,1,1,0,1);void base;}
      placed++;
    }
    out.trees=buckets.map((b,t)=>{if(!b.p.length)return null;const n=b.p.length/3,ix=[];for(let i=0;i<n;i+=4)ix.push(i,i+1,i+2,i,i+2,i+3);
      const m=new Mesh(app.graphicsDevice);m.setPositions(new Float32Array(b.p));m.setNormals(new Float32Array(b.n));m.setUvs(0,new Float32Array(b.u));m.setColors(new Float32Array(b.c));m.setIndices(new Uint32Array(ix));m.update();
      const mat=trees[t].clone();mat.diffuseVertexColor=true;mat.cull=CULLFACE_NONE;mat.update();return entity('Arboleda',m,mat,root,{cast:true});}).filter(Boolean);
    out.treeCount=placed;
  }
  return out;
}
function entity(name,mesh,material,root,{cast}){
  const e=new Entity(name),mi=new MeshInstance(mesh,material,e);mi.castShadow=cast;mi.receiveShadow=true;e.addComponent('render',{meshInstances:[mi]});root.addChild(e);return e;
}
