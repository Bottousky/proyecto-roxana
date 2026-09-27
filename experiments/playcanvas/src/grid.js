import {Entity,Mesh,MeshInstance,StandardMaterial,Color,Texture,PIXELFORMAT_RGBA8,SHADERLANGUAGE_GLSL} from 'playcanvas';
import {EXTERIORS,passagesFor,passageGeometry} from './game/kingdom-geography.js';

// The kingdom's forgotten grid: poles and copper along every road between two places.
// A span comes back to life, with pulses running along the copper, once both places it
// joins have been restored — the journey reconnects the valley piece by piece.
const POWER={portal:'awaken',plaza:'workshop',road:'gate',spring:'pump',castle:'distribution',terraces:'irrigation',lake:'beacon_link',lighthouse:'beacon_network'};
const SPACING=9,OFFSET=2.9,POLE=4.1,SAG=.5;

const emissivePS=`
uniform float uGridTime;
uniform float uGridGlow;
void getEmission(){
  float pulse=smoothstep(0.86,1.0,fract(vUv0.x*0.06-uGridTime*0.45));
  dEmission=vec3(1.0,0.6,0.24)*uGridGlow*(0.12+1.8*pulse);
}`;

function tube(device,points,radius){
  // A four-sided tube along the points; uv.x is the distance travelled, for the pulses.
  const pos=[],nor=[],uv=[],idx=[];let run=0;
  for(let i=0;i<points.length;i++){
    const p=points[i],q=points[Math.min(i+1,points.length-1)],o=points[Math.max(i-1,0)];
    if(i)run+=Math.hypot(p[0]-o[0],p[1]-o[1],p[2]-o[2]);
    const t=[q[0]-o[0],q[1]-o[1],q[2]-o[2]],l=Math.hypot(...t)||1;t[0]/=l;t[1]/=l;t[2]/=l;
    let a=[-t[2],0,t[0]];const al=Math.hypot(...a)||1;a=a.map(v=>v/al);const b=[t[1]*a[2]-t[2]*a[1],t[2]*a[0]-t[0]*a[2],t[0]*a[1]-t[1]*a[0]];
    for(let k=0;k<4;k++){const c=Math.cos(k*Math.PI/2),s=Math.sin(k*Math.PI/2),n=[a[0]*c+b[0]*s,a[1]*c+b[1]*s,a[2]*c+b[2]*s];pos.push(p[0]+n[0]*radius,p[1]+n[1]*radius,p[2]+n[2]*radius);nor.push(...n);uv.push(run,k/4);}
  }
  for(let i=0;i<points.length-1;i++)for(let k=0;k<4;k++){const a=i*4+k,b=i*4+(k+1)%4,c=a+4,d=b+4;idx.push(a,c,b,b,c,d);}
  const mesh=new Mesh(device);mesh.setPositions(pos);mesh.setNormals(nor);mesh.setUvs(0,uv);mesh.setIndices(idx);mesh.update();return mesh;
}

export function buildGrid(app,parent,groundHeight=()=>0){
  const device=app.graphicsDevice,white=new Texture(device,{width:2,height:2,format:PIXELFORMAT_RGBA8});white.lock().fill(255);white.unlock();
  const wood=new StandardMaterial();wood.diffuse=new Color(.30,.22,.15);wood.update();
  const ceramic=new StandardMaterial();ceramic.diffuse=new Color(.86,.82,.72);ceramic.gloss=.7;ceramic.update();
  const spans=[],seen=new Set();
  for(const id of EXTERIORS)for(const exit of passagesFor(id)){
    const p=passageGeometry(id,exit.target);if(!p||seen.has(p.id))continue;seen.add(p.id);
    // Poles every SPACING metres along the road, on its outer side.
    const pts=p.points,tops=[];let carry=SPACING/2;
    for(let i=1;i<pts.length;i++){
      const [ax,az]=pts[i-1],[bx,bz]=pts[i],seg=Math.hypot(bx-ax,bz-az);if(!seg)continue;
      const nx=(bz-az)/seg,nz=-(bx-ax)/seg;let along=carry;
      while(along<=seg){const t=along/seg,x=ax+(bx-ax)*t+nx*OFFSET,z=az+(bz-az)*t+nz*OFFSET,y=p.bridge?.13:groundHeight(x,z);tops.push([x,y+POLE,z]);
        const pole=new Entity('Poste del tendido');pole.addComponent('render',{type:'cylinder',material:wood});pole.setPosition(x,y+POLE/2,z);pole.setLocalScale(.16,POLE,.16);parent.addChild(pole);
        const arm=new Entity('Cruceta');arm.addComponent('render',{type:'box',material:wood});arm.setPosition(x,y+POLE-.25,z);arm.setLocalScale(.9,.1,.1);arm.lookAt(x+nx,y+POLE-.25,z+nz);parent.addChild(arm);
        const cup=new Entity('Aislador');cup.addComponent('render',{type:'sphere',material:ceramic});cup.setPosition(x,y+POLE,z);cup.setLocalScale(.2,.22,.2);parent.addChild(cup);
        for(const e of [pole,arm,cup])e.render.castShadows=true;
        along+=SPACING;}
      carry=along-seg;
    }
    if(tops.length<2)continue;
    const line=[];for(let i=1;i<tops.length;i++){const a=tops[i-1],b=tops[i];for(let k=i===1?0:1;k<=8;k++){const t=k/8;line.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-SAG*4*t*(1-t),a[2]+(b[2]-a[2])*t]);}}
    const m=new StandardMaterial();m.diffuse=new Color(.42,.27,.16);m.diffuseMap=white;m.gloss=.5;m.metalness=.3;m.useMetalness=true;m.shaderChunksVersion='2.22';
    m.getShaderChunks(SHADERLANGUAGE_GLSL).set('emissivePS',emissivePS);m.setParameter('uGridTime',0);m.setParameter('uGridGlow',0);m.update();
    const e=new Entity('Cable del tendido');e.addComponent('render',{meshInstances:[new MeshInstance(tube(device,line,.045),m)]});e.render.castShadows=false;parent.addChild(e);
    spans.push({material:m,areas:[p.from,p.to],glow:0});
  }
  return spans;
}

export function updateGrid(spans,flags,time,dt,reduced){
  for(const s of spans){
    const live=s.areas.every(a=>flags[POWER[a]])?1:0;s.glow+=(live-s.glow)*Math.min(1,dt*.8);
    s.material.setParameter('uGridGlow',s.glow);s.material.setParameter('uGridTime',reduced?0:time);
  }
}
