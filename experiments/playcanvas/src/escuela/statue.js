// Roxana's statue from a sculpted GLB that carries only positions. The diorama gives it
// the same stone as the rest of the school: smooth normals, UVs projected from world
// coordinates, and vertex colours as multipliers — dark in the folds (concavity against
// the neighbouring vertices), lighter on the edges, grime rising from the base.
import {Mesh,MeshInstance,Entity} from 'playcanvas';

/** Minimal glTF 2.0 binary reader for one mesh: positions and indices. */
export async function loadStatueGlb(url){
  const r=await fetch(url);if(!r.ok)throw new Error('Falta la estatua');
  const buf=await r.arrayBuffer(),dv=new DataView(buf);
  if(dv.getUint32(0,true)!==0x46546C67)throw new Error('La estatua no es un GLB');
  let off=12,json=null,bin=null;
  while(off<buf.byteLength){const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true),start=off+8;
    if(type===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,start,len)));else if(type===0x004E4942)bin=start;off=start+len;}
  const prim=json.meshes[0].primitives[0],read=(index,Type)=>{const a=json.accessors[index],v=json.bufferViews[a.bufferView],comps={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
    return new Type(buf.slice(bin+(v.byteOffset||0)+(a.byteOffset||0),bin+(v.byteOffset||0)+(a.byteOffset||0)+a.count*comps*Type.BYTES_PER_ELEMENT));};
  const positions=read(prim.attributes.POSITION,Float32Array),ia=json.accessors[prim.indices];
  const indices=ia.componentType===5125?read(prim.indices,Uint32Array):Uint32Array.from(read(prim.indices,Uint16Array));
  return {positions,indices};
}

/** Place the sculpture with its base at `y`, `height` metres tall, facing +z turned by `ry`. */
export function statueEntity(app,material,{positions,indices},{x=0,y=0,z=0,height=3.4,ry=0,uvScale=.9}={}){
  const n=positions.length/3;let minY=Infinity,maxY=-Infinity,cx=0,cz=0;
  for(let i=0;i<n;i++){const py=positions[i*3+1];minY=Math.min(minY,py);maxY=Math.max(maxY,py);cx+=positions[i*3];cz+=positions[i*3+2];}
  cx/=n;cz/=n;const s=height/(maxY-minY),c=Math.cos(ry*Math.PI/180),sn=Math.sin(ry*Math.PI/180);
  const pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){const lx=(positions[i*3]-cx)*s,ly=(positions[i*3+1]-minY)*s,lz=(positions[i*3+2]-cz)*s;pos[i*3]=x+lx*c+lz*sn;pos[i*3+1]=y+ly;pos[i*3+2]=z-lx*sn+lz*c;}
  // Area-weighted smooth normals and the average of each vertex's neighbours.
  const nor=new Float32Array(n*3),nb=new Float32Array(n*3),cnt=new Uint16Array(n);
  for(let t=0;t<indices.length;t+=3){
    const a=indices[t],b=indices[t+1],d=indices[t+2];
    const ux=pos[b*3]-pos[a*3],uy=pos[b*3+1]-pos[a*3+1],uz=pos[b*3+2]-pos[a*3+2],vx=pos[d*3]-pos[a*3],vy=pos[d*3+1]-pos[a*3+1],vz=pos[d*3+2]-pos[a*3+2];
    const fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;
    for(const k of [a,b,d]){nor[k*3]+=fx;nor[k*3+1]+=fy;nor[k*3+2]+=fz;}
    for(const [p,q,r] of [[a,b,d],[b,d,a],[d,a,b]]){nb[p*3]+=pos[q*3]+pos[r*3];nb[p*3+1]+=pos[q*3+1]+pos[r*3+1];nb[p*3+2]+=pos[q*3+2]+pos[r*3+2];cnt[p]+=2;}
  }
  const uv=new Float32Array(n*2),col=new Float32Array(n*4);
  // Concavity per vertex, smoothed once so the folds read as soft shadow rather than noise.
  const cav=new Float32Array(n);
  for(let i=0;i<n;i++){
    const l=Math.hypot(nor[i*3],nor[i*3+1],nor[i*3+2])||1;nor[i*3]/=l;nor[i*3+1]/=l;nor[i*3+2]/=l;
    const k=cnt[i]||1,dx=pos[i*3]-nb[i*3]/k,dy=pos[i*3+1]-nb[i*3+1]/k,dz=pos[i*3+2]-nb[i*3+2]/k;
    cav[i]=(dx*nor[i*3]+dy*nor[i*3+1]+dz*nor[i*3+2])/(s*.004);
  }
  const smooth=new Float32Array(n),sc=new Uint16Array(n);
  for(let t=0;t<indices.length;t+=3)for(let j=0;j<3;j++){const p=indices[t+j];for(let m=0;m<3;m++){smooth[p]+=cav[indices[t+m]];sc[p]++;}}
  for(let i=0;i<n;i++){
    const ax=Math.abs(nor[i*3]),ay=Math.abs(nor[i*3+1]),az=Math.abs(nor[i*3+2]),px=pos[i*3],py=pos[i*3+1],pz=pos[i*3+2];
    if(ay>=ax&&ay>=az){uv[i*2]=px*uvScale;uv[i*2+1]=pz*uvScale;}else if(ax>=az){uv[i*2]=pz*uvScale;uv[i*2+1]=py*uvScale;}else{uv[i*2]=px*uvScale;uv[i*2+1]=py*uvScale;}
    const curve=Math.max(-1,Math.min(1,smooth[i]/(sc[i]||1))),grime=.78+.22*Math.min(1,(py-y)/1.2),k=grime*(.86+curve*.3)*(nor[i*3+1]<-.4?.8:1);
    col.set([k,k*.99,k*.97,1],i*4);
  }
  const mesh=new Mesh(app.graphicsDevice);
  mesh.setPositions(pos);mesh.setNormals(nor);mesh.setUvs(0,uv);mesh.setColors(col);mesh.setIndices(indices);mesh.update();
  const e=new Entity('Estatua de Roxana'),mi=new MeshInstance(mesh,material,e);mi.castShadow=true;mi.receiveShadow=true;
  e.addComponent('render',{meshInstances:[mi]});return e;
}
