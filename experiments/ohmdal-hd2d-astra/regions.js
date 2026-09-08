import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { surface, texture, foliage, character, random, glowTexture, shadowTexture } from './art.js';
import { machineReading } from './arc-state.js';
import { JOURNEY } from './journey.js';

const textureCache=new Map();
function cached(key,make){if(!textureCache.has(key))textureCache.set(key,make());return textureCache.get(key);}
export function createRegionScene(region){
  const group=new THREE.Group(),buckets=new Map(),materials={},colliders=[],movingParts=[],lights=[],crowns=[],actors=[];
  const randomValue=random(731+region.length*13),night=region==='faro',warm=region==='forja';
  const coast=[[-21,-45],[14,-45],[15,-15],[11,-8],[13,-3],[10,6],[6,12],[-6,13],[-14,7],[-18,-5]];
  for(const kind of ['stone','wall','roof','wood','grass','brick']){
    const map=cached(kind,()=>{const t=texture(surface(kind));t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;});
    materials[kind]=new THREE.MeshLambertMaterial({map,vertexColors:true,side:THREE.DoubleSide});
  }
  materials.solid=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  materials.dark=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
  function add(geometry,kind,color,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
    if(geometry.index){const old=geometry;geometry=geometry.toNonIndexed();old.dispose();}
    geometry.scale(sx,sy,sz);geometry.rotateX(rx);geometry.rotateY(ry);geometry.rotateZ(rz);geometry.translate(x,y,z);
    const c=new THREE.Color(color);if(['stone','wall','grass'].includes(kind))c.lerp(new THREE.Color('#ffffff'),.4);
    const positions=geometry.attributes.position,normals=geometry.attributes.normal,uv=geometry.attributes.uv,colors=new Float32Array(positions.count*3);
    for(let i=0;i<positions.count;i++){
      colors.set([c.r,c.g,c.b],i*3);
      if(uv&&kind!=='solid'&&kind!=='dark'){
        const nx=Math.abs(normals.getX(i)),ny=Math.abs(normals.getY(i)),nz=Math.abs(normals.getZ(i)),d=kind==='grass'?.1:.35;
        uv.setXY(i,(ny>nx&&ny>nz?positions.getX(i):nx>nz?positions.getZ(i):positions.getX(i))*d,(ny>nx&&ny>nz?positions.getZ(i):positions.getY(i))*d);
      }
    }
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));if(!buckets.has(kind))buckets.set(kind,[]);buckets.get(kind).push(geometry);
  }
  const box=(kind,color,x,y,z,w,h,d,ry=0)=>add(new THREE.BoxGeometry(1,1,1),kind,color,x,y,z,w,h,d,0,ry);
  const cyl=(kind,color,x,y,z,rt,rb,h,n=10)=>add(new THREE.CylinderGeometry(rt,rb,h,n),kind,color,x,y,z);
  const ball=(color,x,y,z,w,h=w,d=w)=>add(new THREE.IcosahedronGeometry(1,1),'solid',color,x,y,z,w,h,d);
  function pole(color,a,b,r=.055,kind='solid'){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
    const geo=new THREE.CylinderGeometry(r,r,delta.length(),6);geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));geo.translate(...start.add(end).multiplyScalar(.5).toArray());add(geo,kind,color);
  }
  function block(x,z,w,d){colliders.push({x,z,w:w/2+.27,d:d/2+.27});}
  function path(x,z,w,d,color='#d5c9a8'){box('stone',color,x,.022,z,w,.045,d);}
  function house(x,z,w,d,h,roofColor='#aec6ad'){
    box('stone','#a2a78e',x,.3,z,w+.3,.6,d+.3);box('wall','#e7d7b4',x,h/2+.4,z,w,h,d);
    for(const xx of [-w/2,0,w/2])box('wood','#72624a',x+xx,h/2+.4,z+d/2+.04,.14,h,.16);
    for(const yy of [.65,h+.25])box('wood','#7c684b',x,yy,z+d/2+.05,w,.15,.18);
    const shape=new THREE.Shape();shape.moveTo(-d/2-.4,0);shape.lineTo(0,h*.47);shape.lineTo(d/2+.4,0);shape.closePath();const roof=new THREE.ExtrudeGeometry(shape,{depth:w+.65,bevelEnabled:false});roof.rotateY(Math.PI/2);roof.translate(-(w+.65)/2,0,0);add(roof,'roof',roofColor,x,h+.4,z);
    box('wood','#725a3c',x-.4,1.37,z+d/2+.13,1.05,1.9,.12);box('solid','#c0a368',x-.1,1.4,z+d/2+.22,.07,.11,.06);
    window(x+w*.29,2,z+d/2+.14,.85,1);window(x-w*.3,2,z+d/2+.14,.7,.9);block(x,z,w,d);
  }
  function window(x,y,z,w=.8,h=1.1){
    box('wood','#625c49',x,y,z,w+.2,h+.2,.12);box('dark',night?'#cfb985':'#516656',x,y,z+.075,w,h,.05);
    box('solid','#b0a47c',x,y,z+.12,.045,h,.04);box('solid','#b0a47c',x,y,z+.12,w,.045,.04);box('stone','#b4b497',x,y-h/2-.1,z+.15,w+.3,.12,.3);
  }
  const shadowMap=cached('shadow',shadowTexture),shadowMat=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,color:'#334734'}),shadowGeometry=[];
  function groundShadow(x,z,w,d){const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);g.translate(x,.049,z);shadowGeometry.push(g);}
  function tree(x,z,h=5,autumn=warm){
    cyl('wood','#6c5a40',x,h*.3,z,.1,.25,h*.6,7);pole('#746345',[x,h*.35,z],[x-.6,h*.6,z],.09,'wood');
    const map=cached(`leaves-${autumn}`,()=>texture(foliage(82,autumn)));
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,alphaTest:.18,transparent:true,depthWrite:true,toneMapped:false,color:night?'#667e83':'#e4ead1'}));sprite.position.set(x,h*.8,z);sprite.scale.set(h,h,1);group.add(sprite);crowns.push(sprite);groundShadow(x+.3,z+.3,h,h*.7);block(x,z,.45,.45);
  }
  function fence(x,z,w){for(let dx=-w/2;dx<w/2;dx+=1){box('wood','#817456',x+dx,.55,z,.12,1.1,.12);}for(const y of [.4,.9])box('wood','#a0926b',x,y,z,w,.09,.09);}
  function crate(x,z,size=.7){box('wood','#ad9163',x,size/2,z,size,size,size);for(const y of [.1,size-.1])box('wood','#6c6044',x,y,z+size/2+.02,size,.07,.06);}
  function pot(x,z,flowers=false){cyl('solid','#b1855a',x,.25,z,.3,.22,.5,8);cyl('dark','#455c42',x,.52,z,.26,.26,.03);for(let i=0;i<5;i++){const a=i*1.3;pole('#738c54',[x,.5,z],[x+Math.cos(a)*.22,.9,z+Math.sin(a)*.22],.02);if(flowers)ball('#d9b381',x+Math.cos(a)*.22,.9,z+Math.sin(a)*.22,.09);}}
  function water(x,z,w,d,y=-.25){
    const geometry=new THREE.PlaneGeometry(w,d);geometry.rotateX(-Math.PI/2);geometry.translate(x,y,z);
    const material=new THREE.ShaderMaterial({uniforms:{time:{value:0},base:{value:new THREE.Color(night?'#26475d':'#669a8c')}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float time;uniform vec3 base;varying vec3 p;void main(){float wave=sin(p.x*1.1+p.z*3.-time*.5)*sin(p.z*8.+time*.4);float glint=smoothstep(.985,1.,sin(p.z*12.+p.x*4.+time*.7))*smoothstep(.6,.9,sin(p.x*6.-p.z));gl_FragColor=vec4(base*(.85+wave*.15)+vec3(glint*.055),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});const mesh=new THREE.Mesh(geometry,material);group.add(mesh);
    const glints=new Float32Array(110*3);for(let i=0;i<110;i++)glints.set([x+(randomValue()-.5)*w,y+.035,z+(randomValue()-.5)*d],i*3);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(glints,3));const points=new THREE.Points(g,new THREE.PointsMaterial({color:night?'#88a9ba':'#c8d9b4',size:.065,transparent:true,opacity:.5,depthWrite:false}));group.add(points);movingParts.push({type:'water',mesh,points});return mesh;
  }
  function pipe(points,color='#758d79',radius=.1){for(let i=1;i<points.length;i++)pole(color,points[i-1],points[i],radius);}
  function wheel(x,y,z,radius=1.6){
    const root=new THREE.Group();root.position.set(x,y,z);group.add(root);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(radius,.13,6,32),new THREE.MeshLambertMaterial({color:'#88714d'}));root.add(rim);
    const inner=new THREE.Mesh(new THREE.TorusGeometry(radius*.76,.06,5,24),rim.material);root.add(inner);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const spoke=new THREE.Mesh(new THREE.BoxGeometry(.09,radius*2,.11),rim.material);spoke.rotation.z=a;root.add(spoke);const paddle=new THREE.Mesh(new THREE.BoxGeometry(.46,.2,.6),rim.material);paddle.position.set(Math.sin(a)*radius,Math.cos(a)*radius,0);paddle.rotation.z=-a;root.add(paddle);}
    return root;
  }
  function arch(x,z,w,h){for(const side of [-1,1])box('stone','#a8b69d',x+side*w/2,h*.4,z,.6,h*.8,.85);box('stone','#c2c5a5',x,h*.84,z,w+.7,.55,.85);}
  const glowMap=cached('glow',glowTexture);
  function glow(x,y,z,size,color='#f5cb7e',opacity=.6){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity}));sprite.position.set(x,y,z);sprite.scale.setScalar(size);group.add(sprite);return sprite;}
  function lamp(x,z){cyl('solid','#69745b',x,1.25,z,.055,.09,2.5,6);cyl('solid','#5e6f61',x,2.94,z,0,.35,.18,6);const core=new THREE.Mesh(new THREE.BoxGeometry(.27,.35,.27),new THREE.MeshBasicMaterial({color:'#b4a975'}));core.position.set(x,2.65,z);group.add(core);const l=glow(x,2.65,z,2.8);l.userData.core=core;lights.push(l);}
  // Broad land reaches the edge of the camera; only the lighthouse has a shaped shoreline.
  if(region==='calzada'){box('grass','#c0c8a1',-35,-.45,0,50,.9,110);box('grass','#c0c8a1',27,-.45,0,66,.9,110);box('grass','#c0c8a1',-8,-.45,29,4,.9,62);}
  else if(!night)box('grass',warm?'#ada081':'#c0c8a1',0,-.45,0,95,.9,110);
  else{
    water(0,0,130,130,-.7);
    const shape=new THREE.Shape();coast.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const land=new THREE.ExtrudeGeometry(shape,{depth:.9,bevelEnabled:false});land.rotateX(-Math.PI/2);land.translate(0,-.9,0);add(land,'grass','#8c9b96');
    for(let i=0;i<coast.length;i++){const a=coast[i],b=coast[(i+1)%coast.length],n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/1.6);for(let j=0;j<n;j++){const x=THREE.MathUtils.lerp(a[0],b[0],j/n),z=THREE.MathUtils.lerp(a[1],b[1],j/n);if(z>-25)ball('#5d7880',x,-.5,z,.65+randomValue()*.6,.65,.9);}}
  }
  path(0,2,20,7,warm?'#a99b81':'#d0c9af');path(-6,5,3,15);path(6,-4,3,14);
  if(!night){path(-6,20,3,26);path(20,5.2,26,2.8);for(const p of [[-14,2],[-13,12],[-4,14],[13,9],[17,-3]])tree(...p,4.8+randomValue()*1.2);}
  // The shared interaction area sits on the same level as the player in every region.
  box('stone','#b2bca0',-1,.26,0,3.4,.5,1.55);box('wood','#927852',-1,.62,0,3.2,.2,1.4);block(-1,0,3.3,1.5);
  for(const x of [-2.2,.2])cyl('solid','#c0a46b',x,.91,0,.13,.15,.45,8);
  for(const x of [-1.7,-1,-.3])box('solid','#98a791',x,.83,0,.37,.14,.45);
  pipe([[-2.2,.98,0],[-2.9,.2,0],[-2.9,.15,2],[.7,.15,2],[.7,.9,0]],'#b19a64',.035);
  const switchRoot=new THREE.Group();switchRoot.position.set(.2,1.1,0);group.add(switchRoot);const switchBlade=new THREE.Mesh(new THREE.BoxGeometry(.48,.065,.12),new THREE.MeshLambertMaterial({color:'#d5b777'}));switchBlade.position.x=.2;switchRoot.add(switchBlade);
  const switchHandle=new THREE.Mesh(new THREE.BoxGeometry(.17,.15,.22),new THREE.MeshLambertMaterial({color:'#ac6750'}));switchHandle.position.x=.45;switchRoot.add(switchHandle);
  let wheelPart,flowPart,gate,heatGlow,beam,lensGlow,beaconPivot;
  if(region==='calzada'){
    water(-8,-18,4,32,-.15);block(-8,-12,4,20);house(-5,-7,6,5,3.7);wheelPart=wheel(-1.4,1.75,-4.25,1.8);
    for(const x of [-1.85,-.95])box('wood','#8e8864',x,3.63,-8.6,.12,.35,8.8);box('wood','#827c5c',-1.4,3.43,-8.6,1,.12,8.8);water(-1.4,-8.6,.72,8.7,3.5);
    const fall=new THREE.Mesh(new THREE.PlaneGeometry(.65,3.3),new THREE.MeshBasicMaterial({color:'#bbd2b8',transparent:true,opacity:.45,side:THREE.DoubleSide}));fall.position.set(-1.4,1.76,-4.13);group.add(fall);block(-1.4,-4.25,2.4,1.3);
    for(let z=-23;z<-5;z+=2)box('stone','#a9b695',-10.2,.35,z,.7,.7,1.9);
    box('stone','#a8b499',3,.2,-3,4.5,.4,2.5);cyl('solid','#658776',2,1.1,-3,.68,.68,1.6,12);cyl('solid','#b2ac7d',2,1.9,-3,.8,.8,.15,12);block(2,-3,1.5,1.5);
    pipe([[2,1.45,-3],[4,1.45,-3],[4,.4,-1],[8,.4,-1]],'#729b87',.17);
    box('stone','#b5bea0',7,.07,-1.7,6,.14,1.7);flowPart=water(7,-1.7,6,1.2,.15);flowPart.visible=false;
    for(let x=-17;x<19;x+=4){arch(x,-13,3.4,3.8);}box('stone','#b6bca0',0,3.6,-13,39,.5,1.4);water(0,-13,39,.8,3.89);
    for(const p of [[-11,0],[-10,9],[9,-7],[12,1],[5,-14],[-14,-12]])tree(...p,5+randomValue()*2);
    for(const p of [[-7,-3],[-7.8,-2.8],[5,-3.5]])crate(...p);pot(-3.4,-4.2,true);fence(7,8,7);
  }
  if(region==='castillo'){
    path(0,-1,22,17,'#c9c4ad');
    for(const x of [-9,9]){
      cyl('wall','#c2c5b3',x,3.5,-7.5,2.25,2.55,7,12);cyl('stone','#c3c8ad',x,7,-7.5,2.55,2.55,.45,12);cyl('roof','#829e91',x,8.7,-7.5,0,2.85,3,12);window(x,4,-5.23,.65,1.5);block(x,-7.5,4.6,4.6);
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2;box('stone','#b7bea5',x+Math.cos(a)*2.3,7.5,-7.5+Math.sin(a)*2.3,.5,.8,.5);}
    }
    for(const x of [-4.2,4.2])box('wall','#c4c5ad',x,2.8,-8.5,5.5,5.6,1.2);
    box('stone','#b3bda5',0,5.2,-8.5,4,1.2,1.6);box('roof','#8faaa0',0,6.1,-8.5,13,.6,2.1);
    gate=new THREE.Mesh(new THREE.BoxGeometry(2.5,4.6,.2),new THREE.MeshLambertMaterial({color:'#65785d'}));gate.position.set(0,2.3,-7.8);group.add(gate);
    for(const x of [-4,4]){box('solid','#3e7278',x,3.1,-7.78,1,2.3,.055);box('solid','#d6b778',x,3.1,-7.74,.2,1.4,.055);}
    house(-13,-1,4.5,5,3.2);house(13,-1,4.5,5,3.2);
    for(const [x,name] of [[-4,'bomba'],[1,'taller'],[6,'torre']]){
      block(x,-3.5,1.3,1);
      box('stone','#99a992',x,.55,-3.5,1.3,1.1,1);cyl('solid','#bcab75',x,1.4,-3.5,.25,.3,.6,8);pipe([[x,1,-3.5],[x,.12,-1.8],[-1,.12,-1.8],[-1,.8,0]],'#a49268',.045);const l=glow(x,1.4,-3.5,2);l.userData.branch=name;lights.push(l);
    }
    for(const x of [-8,8]){pot(x,1,true);pot(x,2,true);fence(x,8,4);}tree(-13,9,6);tree(13,9,5.5);
  }
  if(region==='forja'){
    house(-5,-6.5,6.5,5,3.6,'#929383');house(7,-9,4.3,4,3,'#b0b29a');
    for(const x of [-6.8,-4]){box('brick','#8e7961',x,4.5,-6.3,.95,9,.95);box('stone','#88897d',x,9,-6.3,1.3,.25,1.3);}
    box('brick','#b48761',-4.3,1.1,-3.5,2.9,2.2,1.6);box('dark','#332f2b',-4.3,1,-2.68,1.85,1.4,.04);block(-4.3,-3.5,2.9,1.6);
    heatGlow=glow(-4.3,1,-2.5,4.5,'#ff9e56',.18);for(let i=0;i<7;i++)ball('#a75c39',-4.9+i*.2,.6,-2.58,.18,.25,.15);
    box('wood','#877355',4,1.1,-2.5,3.8,.2,1.5);for(const x of [2.5,5.5])box('wood','#625a45',x,.53,-2.5,.2,1.1,1.2);
    box('solid','#82938e',3.5,1.44,-2.5,1,.5,.6);box('solid','#aab4a4',3.5,1.73,-2.5,1.5,.16,.5);block(4,-2.5,3.8,1.5);
    for(let i=0;i<5;i++)box('solid','#7d9290',5+i*.2,.2,5,.12,.12,2.2,-.2);crate(7,5,.9);crate(7.8,5,.6);
    cyl('wood','#928565',8,1.1,-5,1.3,1.3,2.2,12);cyl('solid','#647e72',8,2.25,-5,1.2,1.2,.08,16);pipe([[8,.7,-5],[8,.7,-1],[6,.7,-1]],'#7b9c84',.14);block(8,-5,2.6,2.6);
    wheelPart=wheel(7,.8,-.6,.6);for(const p of [[-11,3],[-11,-8],[12,8],[13,-8]])tree(...p,5,true);fence(-5,9,8);
  }
  if(region==='terrazas'){
    block(0,-8,26,6);
    for(let tier=0;tier<4;tier++){
      const z=-6.3-tier*3.1,y=tier*.85;box('stone','#bdc19c',0,y+.3,z,26,.6,2.8);box('grass','#9bba7b',0,y+.66,z,25.5,.12,2.4);
      for(let x=-11;x<=11;x+=.6)for(const dz of [-.7,.2]){ball(tier%2?'#7d9b59':'#98ad68',x,y+.94,z+dz,.2,.3,.25);if(tier===1)ball('#bb9470',x,y+1.05,z+dz,.11);}
    }
    for(let x=-17;x<19;x+=3.8)arch(x,-19,3.2,6);box('stone','#c2c8ac',0,5.7,-19,39,.5,1.5);
    house(-10,-3,4,4,3.2);cyl('solid','#92a99b',5.8,1,-3.5,.8,1,1.7,12);wheelPart=wheel(5.8,1.1,-2.57,.65);block(5.8,-3.5,2.2,2);
    pipe([[6.3,1.3,-3.5],[8,1.3,-3.5],[8,3.2,-8.5],[6,3.2,-8.5]],'#809d89',.14);
    box('stone','#b0bda4',6,2.7,-8.8,3,.7,2);flowPart=water(6,-8.8,2.6,1.6,3.08);flowPart.visible=false;
    for(let x=-3;x<10;x+=1.5){box('wood','#978568',x,.6,8,.07,1.2,.07);pole('#ab9b75',[x,.9,8],[x+1.4,.9,8],.014);}
    for(const p of [[-12,9],[12,3],[15,-11],[-15,-13]])tree(...p,5.5);for(const p of [[-7,-1],[7,6],[-5,5]])pot(...p,true);
  }
  if(region==='faro'){
    const tx=3,tz=-5.8;
    cyl('stone','#aab9b2',tx,4.5,tz,1.65,2.5,9,16);cyl('stone','#a9b8ac',tx,9,tz,2.5,2.5,.45,16);cyl('roof','#8fa89d',tx,11.45,tz,0,2.1,1.2,12);block(tx,tz,4.7,4.7);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;pole('#83a098',[tx+Math.cos(a)*1.25,9.2,tz+Math.sin(a)*1.25],[tx+Math.cos(a)*1.25,10.95,tz+Math.sin(a)*1.25],.055);}
    for(const y of [2.8,5.6,7.6])window(tx,y,tz+1.86,.45,.85);
    box('wood','#6b7162',tx,1.2,tz+2.3,1.1,2.3,.13);
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2;pole('#667f7a',[tx+Math.cos(a)*2.35,9.2,tz+Math.sin(a)*2.35],[tx+Math.cos(a)*2.35,9.95,tz+Math.sin(a)*2.35],.027);}
    add(new THREE.TorusGeometry(2.35,.03,5,40),'solid','#8ba196',tx,9.95,tz,1,1,1,Math.PI/2);
    lensGlow=glow(tx,10.05,tz,6,'#ffdb97',.1);lensGlow.material.depthTest=false;
    const lampCore=new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,1.05,10),new THREE.MeshBasicMaterial({color:'#ffe5b0'}));lampCore.position.set(tx,10.05,tz);group.add(lampCore);lensGlow.userData.core=lampCore;
    beaconPivot=new THREE.Group();beaconPivot.position.set(tx,10.05,tz);group.add(beaconPivot);
    beam=new THREE.Mesh(new THREE.ConeGeometry(4.5,32,32,1,true),new THREE.MeshBasicMaterial({color:'#f9d698',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));beam.rotation.z=Math.PI/2;beam.position.x=16;beaconPivot.add(beam);
    house(-7,-8,5,4,3.4,'#859d97');box('wood','#968771',7.8,.06,4.5,2,.12,8);for(let z=1;z<9;z+=.7)box('wood','#b1a78c',7.8,.14,z,2,.1,.08);
    for(const x of [6.9,8.7])for(const z of [1,4,8])cyl('wood','#647875',x,-.5,z,.1,.12,1.3,6);
    // A small clinker-built boat rests beside the landing, with a visible mooring line.
    const hull=new THREE.SphereGeometry(1,12,7,0,Math.PI*2,0,Math.PI/2);hull.rotateX(Math.PI);add(hull,'wood','#ac8e63',10,-.2,5.5,1.05,.55,2.2);box('dark','#536966',10,-.15,5.5,1.5,.05,3.3);for(const z of [4.6,5.6,6.6])box('wood','#b19c78',10,.04,z,1.6,.12,.22);pole('#baa982',[9.8,.12,3.6],[8.7,.14,2],.025);
    pipe([[-1,.8,0],[1,.15,0],[3,.15,-2],[3,9.8,-3.9]],'#a89d7a',.05);
    for(const p of [[-12,3],[-10,-13],[-3,-15]])tree(...p,4.5);fence(-6,9,8);
  }
  // Small occupied edges: tools, flowers, benches and shared paths.
  for(const [x,z] of [[-4.6,5],[5.2,5.6]]){box('wood','#a59b75',x,.65,z,2,.15,.6);for(const dx of [-.7,.7])box('wood','#82795a',x+dx,.3,z,.13,.6,.55);block(x,z,2,.6);}
  for(const p of [[-3.5,-2.8],[3.8,7.5]])pot(...p,true);
  for(const p of [[-8,4],[7,3],[1,-3]])lamp(...p);
  for(let i=0;i<110;i++){
    const x=-18+randomValue()*36,z=-22+randomValue()*40;
    if(Math.abs(x)<10&&z>-6&&z<7)continue;
    if(night)continue;
    for(let j=0;j<3;j++){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.1,0,0,.1,0,0,0,.25+randomValue()*.2,0],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.computeVertexNormals();add(geo,'solid',warm?'#9a9c69':'#849a60',x+j*.07,.04,z,1,1,1,0,j*1.2);}
    if(i%5===0)ball('#cdb984',x,.3,z,.07,.06,.06);
  }
  for(const [kind,geometries] of buckets){const geometry=mergeGeometries(geometries);const mesh=new THREE.Mesh(geometry,materials[kind]);mesh.castShadow=kind!=='grass'&&kind!=='dark';mesh.receiveShadow=kind!=='dark';group.add(mesh);for(const g of geometries)g.dispose();}
  if(shadowGeometry.length){const mesh=new THREE.Mesh(mergeGeometries(shadowGeometry),shadowMat);group.add(mesh);for(const g of shadowGeometry)g.dispose();}
  function actor(kind,x,z){
    const maps=Array.from({length:16},(_,i)=>cached(`${kind}-${i}`,()=>texture(character(kind,i%4,['front','back','left','right'][Math.floor(i/4)]))));
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:maps[0],alphaTest:.18,transparent:true,depthWrite:true,color:night?'#bcd3d0':'#ffffff'}));sprite.position.set(x,1,z);sprite.scale.set(1.13,1.7,1);group.add(sprite);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.85,.58),shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.055,z);group.add(shadow);const result={kind,sprite,maps,shadow,direction:0};actors.push(result);return result;
  }
  const player=actor('player',-7,7),companion=actor('ohm',-8,7.5),resident=actor(JOURNEY[region].npc,3.2,2.1);
  if(region==='forja')actor('edda',5.4,2.8);
  const targets=[{id:'machine',name:JOURNEY[region].machine,x:-1,z:0,y:1.8,range:2.35},{id:'resident',name:JOURNEY[region].speaker,x:3.2,z:2.1,y:2.4,range:2},{id:'clue',name:'Las marcas del oficio',x:-4.3,z:-1.6,y:1.1,range:1.8},{id:'memory',name:'Una huella de estos años',x:5.5,z:5.5,y:1.2,range:1.7},{id:'previous',name:`Volver a ${JOURNEY[JOURNEY[region].previous].name}`,x:-9.6,z:7.8,y:1.5,range:1.8},{id:'next',name:region==='faro'?'El camino de regreso':`Hacia ${JOURNEY[JOURNEY[region].next].name}`,x:9.4,z:5.4,y:1.5,range:1.9}];
  function canWalk(x,z){
    if(night){let inside=false;for(let i=0,j=coast.length-1;i<coast.length;j=i++){const a=coast[i],b=coast[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}if(!inside)return false;}
    return Number.isFinite(x)&&Number.isFinite(z)&&x>=-11.2&&x<=11.2&&z>=-5.7&&z<=10.5&&!(night&&z>7&&(x>7||x< -9))&&!colliders.some(c=>Math.abs(x-c.x)<c.w&&Math.abs(z-c.z)<c.d);
  }
  let lastDirection=0,beaconAge=0;
  function update(time,dt,state,moving,dir,camera,screenPoint,viewRight,viewDown){
    const s=state.arc[region],r=machineReading(state.arc,region);
    player.sprite.position.set(state.player[0],1+(moving?Math.sin(time*12)*.025:0),state.player[1]);player.shadow.position.set(state.player[0],.055,state.player[1]);
    if(moving){const horizontal=dir.dot(viewRight),vertical=dir.dot(viewDown);lastDirection=Math.abs(horizontal)>Math.abs(vertical)?horizontal>0?12:8:vertical<0?4:0;}
    player.sprite.material.map=player.maps[lastDirection+(moving?Math.floor(time*8)%4:0)];
    const destination=player.sprite.position.clone().add(new THREE.Vector3(-.8,0,.8));companion.sprite.position.lerp(destination,1-Math.exp(-dt*3));companion.sprite.position.y=.95+Math.sin(time*2)*.02;companion.shadow.position.set(companion.sprite.position.x,.055,companion.sprite.position.z);companion.sprite.material.map=companion.maps[moving?Math.floor(time*7)%4:0];
    resident.sprite.position.y=1+Math.sin(time*1.8)*.016;
    switchRoot.rotation.z=THREE.MathUtils.damp(switchRoot.rotation.z,s.on?0:1.1,10,dt);
    if(wheelPart){const speed=region==='calzada'?.55:region==='terrazas'?r.current*(s.reversed?-1:1):r.water/24;wheelPart.rotation.z+=speed*dt;}
    if(flowPart)flowPart.visible=r.ready;
    if(gate)gate.position.y=THREE.MathUtils.damp(gate.position.y,r.ready?5.8:2.3,2,dt);
    if(heatGlow)heatGlow.material.opacity=THREE.MathUtils.damp(heatGlow.material.opacity,.12+(r.heat||0)/70,3,dt);
    if(beam){beaconAge=r.ready?beaconAge+dt:0;beaconPivot.rotation.y=4.1+beaconAge*.18;beam.material.opacity=THREE.MathUtils.damp(beam.material.opacity,r.ready?.15:r.running?.022:0,2,dt);lensGlow.material.opacity=r.running?1:.08;lensGlow.userData.core.visible=r.running;}
    for(const light of lights){let powered=r.ready;if(light.userData.branch){const index=['bomba','taller','torre'].indexOf(light.userData.branch);powered=s.parallel&&(r.currents?.[index]||0)>.1;}light.material.opacity=night?.65:powered?.85:.12;if(light.userData.core)light.userData.core.material.color.set(night||powered?'#ffe4a3':'#9fa68a');}
    for(const part of movingParts){part.mesh.material.uniforms.time.value=time;part.points.position.z=Math.sin(time*.25)*.12;part.points.material.opacity=.3+Math.sin(time*.5)*.08;}
    const p=screenPoint(state.player[0],1,state.player[1]),pixelScale=innerHeight/(camera.top-camera.bottom)*camera.zoom;
    for(const crown of crowns){const q=screenPoint(...crown.position.toArray());const nearer=(crown.position.x-state.player[0])*18+(crown.position.z-state.player[1])*34>0;const overlap=nearer&&Math.abs(p.x-q.x)<crown.scale.x*pixelScale*.4&&Math.abs(p.y-q.y)<crown.scale.y*pixelScale*.4;crown.material.opacity=THREE.MathUtils.damp(crown.material.opacity,overlap?.28:1,7,dt);}
  }
  function dispose(){const geometries=new Set(),mats=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}
  return {group,targets,canWalk,update,dispose,night,warm};
}
