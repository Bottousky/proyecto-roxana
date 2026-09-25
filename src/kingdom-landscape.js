import * as THREE from 'three';
import {EXTERIORS,KINGDOM,WATERCOURSE,passageGeometry,corridorX} from './kingdom-geography.js';
import {buildWatersideArt} from './waterside-art.js';

function ribbon(owner,points,width,material,y=.073){
  const positions=[];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const nx=-(b[1]-a[1])/length*width/2,nz=(b[0]-a[0])/length*width/2;
    positions.push(a[0]+nx,y,a[1]+nz,b[0]+nx,y,b[1]+nz,a[0]-nx,y,a[1]-nz,b[0]+nx,y,b[1]+nz,b[0]-nx,y,b[1]-nz,a[0]-nx,y,a[1]-nz);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(positions.flatMap((_,i)=>i%3===0?[positions[i]/5,positions[i+2]/5]:[]),2));geo.computeVertexNormals();owner.localGeometries.push(geo);
  if(material.uniforms?.channel){const uv=[];for(let i=1;i<points.length;i++)uv.push(0,0,0,1,1,0,0,1,1,1,1,0);geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}
  const mesh=owner.mesh(geo,material);mesh.castShadow=false;return mesh;
}

/** Low-cost common landscape. Its coordinates never depend on the current room. */
export function buildKingdomLandscape(owner){
  const root=owner.root;
  const turf=owner.mat('#c1c9a9','ground'),path=owner.mat('#aba78c','cobble'),stone=owner.mat('#9aa08b','stone'),dark=owner.mat('#657565','stone'),wood=owner.mat('#735b3b','wood'),leaf=owner.mat('#657946');
  owner.worldMapped(turf,6);owner.worldMapped(path,5);owner.wallMapped(stone,4);
  const trees=owner.treeTextures.map(map=>owner.mat('#e4e6d3',null,{map,alphaTest:.3,side:THREE.DoubleSide}));
  const fern=owner.mat('#b4c796',null,{map:owner.textures.fern,alphaTest:.4,side:THREE.DoubleSide});
  const connections=[];
  for(let i=1;i<EXTERIORS.length;i++){
    const p=passageGeometry(EXTERIORS[i-1],EXTERIORS[i]);if(!p)continue;
    const low=Math.min(p.a[1],p.b[1]),high=Math.max(p.a[1],p.b[1]);
    const group=owner.group();group.name=`landscape-${p.id}`;connections.push({group,p});
    const previous=owner.root;owner.root=group;
    if(!p.bridge){owner.box((p.a[0]+p.b[0])/2,-.025,(low+high)/2,100,.1,high-low,turf).name='shared-valley-ground';}
    else owner.water((p.a[0]+p.b[0])/2,-.42,(low+high)/2,110,high-low);
    const points=p.points;
    const highland=[p.from,p.to].includes('castle'),orchard=[p.from,p.to].includes('terraces');
    const routeMaterial=p.bridge?stone:owner.mat(highland?'#b5a18b':orchard?'#b8ad87':'#b5b29a','cobble');owner.worldMapped(routeMaterial,5);
    ribbon(owner,points,4.1,routeMaterial,p.bridge?.13:.073).name=p.bridge?'faro-causeway':'continuous-road';
    const detour=p.routes.find(route=>route.id==='woodland-loop');
    const nearDetour=(x,z,margin=0)=>detour?.points.some(point=>Math.hypot(point[0]-x,point[1]-z)<detour.width/2+margin);
    if(detour){const trail=owner.mat('#afaa8d','ground');owner.worldMapped(trail,5);ribbon(owner,detour.points,detour.width,trail,.075).name='woodland-loop';
      for(let j=5;j<36;j+=5){const [x,z]=detour.points[j],next=detour.points[j+1],dx=next[0]-x,dz=next[1]-z,len=Math.hypot(dx,dz);owner.box(x-Math.abs(dz)/len*1.9,.12,z+Math.sign(dz)*dx/len*1.9,.42,.22,.5,stone).name='trail-waystone';}
    }
    // Cover the two metres between each authored pavement and the shared verge.
    for(const [id,exit,edge] of [[p.from,p.exit,p.a],[p.to,p.back,p.b]]){
      const a=[KINGDOM[id].x+exit.x,KINGDOM[id].z+exit.z];
      ribbon(owner,[a,edge],3.5,path,.132).name='road-threshold';
    }
    // Sample by distance, so diagonal bends retain the same railing and planting density.
    const samples=[];let carry=0;
    for(let j=1;j<points.length;j++){const a=points[j-1],b=points[j],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);for(;carry<length;carry+=1.25)samples.push([a[0]+dx*carry/length,a[1]+dz*carry/length,-dz/length,dx/length]);carry-=length;}
    for(let k=0;k<samples.length;k++){
      const [x,z,nx,nz]=samples[k];
      for(const side of [-1,1]){
        if(p.bridge){owner.box(x+nx*side*2.3,.58,z+nz*side*2.3,.22,1.15,.22,stone);const next=samples[k+1];if(next)owner.beam([x+nx*side*2.3,.92,z+nz*side*2.3],[next[0]+next[2]*side*2.3,.92,next[1]+next[3]*side*2.3],.13,wood);}
        else{
          const offset=distance=>[x+nx*side*distance,z+nz*side*distance];
          const [kx,kz]=offset(2.22);
          if((k+i+(side>0?2:0))%5<3&&!nearDetour(kx,kz,.5)){const kerb=owner.box(kx,.11,kz,.28,.22,.8,dark);kerb.rotation.y=Math.atan2(-nz,nx);}
          const [fx,fz]=offset(3.1);
          if((k*3+i+(side>0?1:0))%7===0&&!nearDetour(fx,fz,1)){const plants=owner.mesh('plane',fern,fx,.5,fz,1.55,1.05,1);plants.rotation.y=(k%3)*.35;}
          const [tx,tz]=offset(6+k%3),size=highland?4.8:6.6;
          if((k+i+(side>0?3:0))%9===0&&!nearDetour(tx,tz,3)){const tree=owner.mesh('plane',trees[(i+k)%trees.length],tx,size/2,tz,size*.78,size,1);tree.name='shared-copse';}
          const [rx,rz]=offset(4.3);
          if(highland&&k%6===0&&!nearDetour(rx,rz,1.2)){const rock=owner.mesh('ico',stone,rx,.4,rz,1.5,.85,1.1);rock.rotation.y=k*.8;rock.name='upland-outcrop';}
        }
      }
    }
    // A repeated brass-banded milestone is a recognisable route marker, not a portal.
    const z=(low+high)/2,x=corridorX(p,z)+3.7;
    owner.box(x,.55,z,.5,1.1,.45,stone);owner.box(x,.78,z+.235,.36,.13,.04,owner.mat('#ba9a58',null,{metalness:.4}));
    owner.root=previous;
  }
  // The source feeds the southern village canal and the northern irrigation run.
  const river=WATERCOURSE;
  const bed=ribbon(owner,river,4.6,dark,.032);bed.name='kingdom-watercourse-bed';
  const waterTemplate=owner.water(0,0,0,.01,.01),water=waterTemplate.material;owner.root.remove(waterTemplate);
  water.uniforms.channel.value=1;
  ribbon(owner,river.slice(0,6),3.95,water,.065).name='kingdom-village-canal';
  ribbon(owner,river.slice(6),3.95,water,.065).name='kingdom-irrigation-channel';
  // The aqueduct is elevated. Its wheel discharges through the LOWER basin,
  // into a covered culvert under the house's approach and then the valley canal.
  const drainZ=KINGDOM.spring.z-5.58;
  ribbon(owner,[[KINGDOM.spring.x+10.2,drainZ],[KINGDOM.spring.x+20,drainZ]],.94,dark,.04).name='spring-discharge-bed';
  ribbon(owner,[[KINGDOM.spring.x+10.2,drainZ],[KINGDOM.spring.x+20,drainZ]],.6,water,.06).name='spring-discharge-water';
  for(let x=10.25;x<18.1;x+=.22)owner.box(KINGDOM.spring.x+x,.087,drainZ,.095,.055,.85,wood).name='walkable-culvert-grate';
  buildWatersideArt(owner);
  // The Portal's garden is surrounded by the valley, rather than perched on a level edge.
  for(const [x,z,type,size] of [[-13,66,0,6.2],[-20,70,2,7.4],[12,69,1,6.5],[16,62,4,5.5]]){
    const tree=owner.mesh('plane',trees[type],KINGDOM.portal.x+x,size*.5,z,size*.85,size,1);tree.name='portal-foreground-grove';
  }
  // One distant mountain range, fixed in the same territory for every viewpoint.
  for(let i=0;i<14;i++){
    const mountain=owner.mesh('cone',dark,-68+i*12,6,-347-(i%3)*8,14,16+i%4*3,17);mountain.castShadow=false;mountain.name='kingdom-distant-mountain';
  }
  owner.root=root;
  return {connections,water};
}
