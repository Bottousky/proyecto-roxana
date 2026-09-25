import * as THREE from 'three';
import {WATERCOURSE} from './kingdom-geography.js';

/** One authored watercourse, including the stretches visible across region boundaries. */
export function buildWatersideArt(owner){
  const stones=[],wet=[],plants=[[],[],[]];
  for(let j=1;j<WATERCOURSE.length;j++){
    const a=WATERCOURSE[j-1],b=WATERCOURSE[j],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    const count=Math.ceil(len/1.15),step=len/count;
    for(let i=0;i<count;i++){
      const t=(i+.5)/count,x=a[0]+dx*t,z=a[1]+dz*t;
      for(const side of [-1,1]){
        const variation=Math.sin(i*3.7+j*11+side)*.025;
        stones.push([x+nx*side*2.18,.23+variation,z+nz*side*2.18,.44,.46+variation,step+.035,Math.atan2(dx,dz)]);
        wet.push([x+nx*side*1.975,.11,z+nz*side*1.975,.065,.20,step+.02,Math.atan2(dx,dz)]);
        // Gaps are deliberate: the bank remains visible and maintenance is plausible.
        if((i*7+j*3+(side>0?2:0))%11<2){
          const type=(i+j+(side>0?1:0))%3,size=1.1+(Math.sin(i*4.1+j)+1)*.28;
          plants[type].push([x+nx*side*2.6,.08+size*.40,z+nz*side*2.6,size,size,1,0]);
        }
      }
    }
  }
  const stone=owner.mat('#b0aa8b','stone'),damp=owner.mat('#354c3c','stone');
  owner.wallMapped(stone,3.2);
  const batch=(name,rows,geometry,material)=>{
    const mesh=new THREE.InstancedMesh(geometry,material,rows.length),dummy=new THREE.Object3D();
    rows.forEach(([x,y,z,w,h,d,angle],i)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,angle,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
    mesh.name=name;mesh.receiveShadow=true;mesh.castShadow=false;owner.root.add(mesh);return mesh;
  };
  batch('canal-coping-stones',stones,owner.geo.box,stone);
  batch('canal-damp-waterline',wet,owner.geo.box,damp);
  for(let i=0;i<3;i++)if(owner.bankTextures?.[i])batch(`illustrated-water-plants-${i}`,plants[i],owner.geo.plane,owner.mat('#d2d6bd',null,{map:owner.bankTextures[i],alphaTest:.4,side:THREE.DoubleSide}));
}
