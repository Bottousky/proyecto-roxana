import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { surface, texture, foliage, character, glowTexture, shadowTexture, random } from './art.js';

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#94b1b0'); scene.fog = new THREE.Fog('#94b1b0', 58, 115);
  const camera = new THREE.OrthographicCamera(-22,22,14,-14,.1,180);
  const cameraFocus = new THREE.Vector3(0,1.2,0);
  const cameraOffset = new THREE.Vector3(18,27,34);
  camera.position.copy(cameraFocus).add(cameraOffset); camera.lookAt(cameraFocus);
  scene.add(new THREE.HemisphereLight('#d6e5d9','#67745c',1.65));
  const sun = new THREE.DirectionalLight('#ffddb0',2.45);sun.position.set(-16,27,8);sun.target.position.set(0,0,0);scene.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);Object.assign(sun.shadow.camera,{left:-27,right:27,top:27,bottom:-27,near:1,far:80});sun.shadow.bias=-.0007;sun.shadow.normalBias=.06;
  const mats = {};
  for(const type of ['stone','wall','roof','brick','grass','wood']) {const map=texture(surface(type));map.wrapS=map.wrapT=THREE.RepeatWrapping;mats[type]=new THREE.MeshLambertMaterial({map,vertexColors:true});}
  mats.roof.side=THREE.DoubleSide;
  mats.wall.side=THREE.DoubleSide;
  mats.solid=new THREE.MeshLambertMaterial({vertexColors:true});
  mats.solid.side=THREE.DoubleSide;
  mats.dark=new THREE.MeshBasicMaterial({vertexColors:true});
  const buckets=new Map(); const r=random(461);const matrix=new THREE.Matrix4();const q=new THREE.Quaternion();const euler=new THREE.Euler();
  const colliders=[];const decorations=[];
  function put(geo, type, color, x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
    if(geo.index){const original=geo;geo=geo.toNonIndexed();original.dispose();}
    const col=new THREE.Color(color);if(['wall','stone','brick','grass'].includes(type))col.lerp(new THREE.Color('#ffffff'),.48); const a=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=col.r;a[i+1]=col.g;a[i+2]=col.b;}geo.setAttribute('color',new THREE.BufferAttribute(a,3));
    euler.set(rx,ry,rz);q.setFromEuler(euler);matrix.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz));geo.applyMatrix4(matrix);
    if(['stone','wall','brick','wood','grass'].includes(type)){
      const positions=geo.attributes.position,normals=geo.attributes.normal,uv=geo.attributes.uv;
      const density=type==='grass'?.1:type==='stone'?.38:type==='wood'?.3:.27;
      for(let i=0;i<positions.count;i++){
        const nx=Math.abs(normals.getX(i)),ny=Math.abs(normals.getY(i)),nz=Math.abs(normals.getZ(i));
        if(ny>nx&&ny>nz)uv.setXY(i,positions.getX(i)*density,positions.getZ(i)*density);
        else if(nx>nz)uv.setXY(i,positions.getZ(i)*density,positions.getY(i)*density);
        else uv.setXY(i,positions.getX(i)*density,positions.getY(i)*density);
      }
    }
    if(!buckets.has(type))buckets.set(type,[]);buckets.get(type).push(geo);
  }
  const box=(type,color,x,y,z,w,h,d,ry=0)=>put(new THREE.BoxGeometry(1,1,1),type,color,x,y,z,w,h,d,0,ry,0);
  const cyl=(color,x,y,z,rt,rb,h,n=8,type='solid')=>put(new THREE.CylinderGeometry(rt,rb,h,n),type,color,x,y,z);
  const ball=(color,x,y,z,sx,sy=sx,sz=sx)=>put(new THREE.IcosahedronGeometry(1,1),'solid',color,x,y,z,sx,sy,sz);
  function pole(color,a,b,radius=.04,type='solid'){
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const d=bv.clone().sub(av);const geo=new THREE.CylinderGeometry(radius,radius,d.length(),5);geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));geo.translate(...av.add(bv).multiplyScalar(.5).toArray());put(geo,type,color,0,0,0);
  }
  function collision(x,z,w,d){colliders.push({x,z,w:w/2+.25,d:d/2+.25});}
  function roof(x,z,w,d,y,h,color='#b9c2a1'){
    const geo=new THREE.BufferGeometry();
    const coords=[-w/2,0,-d/2,w/2,0,-d/2,w/2,h,0, -w/2,0,-d/2,w/2,h,0,-w/2,h,0, -w/2,h,0,w/2,h,0,w/2,0,d/2, -w/2,h,0,w/2,0,d/2,-w/2,0,d/2];
    geo.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,w/2,0,w/2,d/3,0,0,w/2,d/3,0,d/3,0,0,w/2,0,w/2,d/3,0,0,w/2,d/3,0,d/3],2));geo.computeVertexNormals();put(geo,'roof',color,x,y,z);
    for(const side of [-1,1]){
      const tri=new THREE.BufferGeometry();tri.setAttribute('position',new THREE.Float32BufferAttribute([side*w/2,0,-d/2,side*w/2,h,0,side*w/2,0,d/2],3));tri.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,.5,1,1,0],2));tri.computeVertexNormals();put(tri,'wall','#bdaf91',x,y,z);
      pole('#554f3e',[x+side*w/2,y,z-d/2],[x+side*w/2,y+h,z],.085,'wood');pole('#554f3e',[x+side*w/2,y+h,z],[x+side*w/2,y,z+d/2],.085,'wood');
    }
    pole('#a7b69b',[x-w/2-.12,y+h+.05,z],[x+w/2+.12,y+h+.05,z],.12,'roof');
    for(const side of [-1,1])pole('#454e43',[x-w/2,y,z+side*d/2],[x+w/2,y,z+side*d/2],.095,'wood');
  }
  const windowLights=[];
  function windowAt(x,y,z,w=.7,h=1.1){
    box('wood','#837556',x,y,z,w+.22,h+.2,.15);
    box('dark','#3a4842',x,y,z+.095,w,h,.04);
    box('solid','#bcbd92',x,y,z+.13,.055,h,.055);
    box('solid','#bcbd92',x,y+.12,z+.13,w,.065,.055);
    box('stone','#b6ad8d',x,y-h/2-.12,z+.13,w+.4,.15,.32);
    const pane=new THREE.Mesh(new THREE.PlaneGeometry(w-.08,h-.08),new THREE.MeshBasicMaterial({color:'#ffd694',transparent:true,opacity:.08,depthWrite:false}));pane.position.set(x,y,z+.122);scene.add(pane);windowLights.push(pane);
    for(const side of [-1,1])box('wood','#526e62',x+side*(w/2+.23),y,z+.04,.28,h,.08,side*.3);
  }
  function building(x,z,w,d,h,variant=0){
    box('stone','#abb1a0',x,.3,z,w+.25,.6,d+.25);
    box('wall',variant===1?'#dbb892':'#eee4c9',x,h/2+.5,z,w,h,d);
    box('wood','#6f6850',x,.9,z+d/2+.03,w,.15,.12);
    box('wood','#776d51',x,h+.38,z+d/2+.03,w,.18,.15);
    for(let xx=-w/2;xx<=w/2;xx+=w/3){box('wood','#7a7258',x+xx,h/2+.5,z+d/2+.07,.15,h,.17);}
    roof(x,z,w+.9,d+1,h+.5,h*.48,variant===1?'#b4b6a0':'#bdccb7');
    const doorX=x-.45;box('wood','#73614a',doorX,1.45,z+d/2+.15,1.22,2.05,.16);box('wood','#9d8761',doorX,1.45,z+d/2+.245,.95,1.83,.05);
    for(let j=0;j<4;j++)box('solid','#716248',doorX-.37+j*.24,1.45,z+d/2+.28,.02,1.83,.025);
    box('solid','#bea56e',doorX+.29,1.4,z+d/2+.32,.08,.1,.07);
    box('stone','#c3baa0',doorX,.23,z+d/2+.5,1.8,.23,.9);
    if(w>4){windowAt(x+w*.3,2.1,z+d/2+.1,.8,1.05);windowAt(x-w*.31,2.15,z+d/2+.1,.7,.95);}
    box('brick','#b9a789',x-w*.3,h+1.5,z-.5,.65,2.1,.65);box('stone','#a9a893',x-w*.3,h+2.54,z-.5,.85,.17,.85);
    decorations.push({type:'smoke',x:x-w*.3,y:h+2.7,z:z-.5});
    collision(x,z,w+.2,d+.2);
  }
  // A continuous landscape, cut by a canal, extends beyond the controlled camera.
  box('grass','#b5bb88',-38,-.42,0,102,.8,150);
  box('grass','#acb986',66,-.43,0,92,.8,150);
  box('solid','#355b58',16.5,-1.15,0,7,.3,160);
  box('stone','#969f88',12.95,-.3,0,.5,1.1,110);
  box('stone','#8d9b86',20.05,-.3,0,.5,1.1,110);
  const waterUniforms={time:{value:0}};
  const waterMaterial=new THREE.ShaderMaterial({uniforms:waterUniforms,vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 p;uniform float time;void main(){float a=sin(p.x*4.5+p.y*1.3+time*.8)*sin(p.y*8.-time*.65);float b=sin(p.y*29.+p.x*8.+time*.7);vec3 c=mix(vec3(.13,.32,.32),vec3(.28,.49,.46),a*.5+.5);float light=smoothstep(.965,1.,sin(p.y*8.+p.x*2.-time*.55))*smoothstep(.1,.8,sin(p.x*11.+p.y*2.));c+=light*vec3(.27,.27,.17);c+=smoothstep(.95,1.,b)*.018;gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(6.7,150),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(16.5,-.22,0);scene.add(water);
  // Slightly irregular paving reveals the older circular foundation under the plaza.
  cyl('#c4c0a5',0,.015,1,8.8,8.8,.05,48,'stone');
  for(let i=0;i<115;i++){
    const a=r()*Math.PI*2,rad=8.9+r()*1.3;box('stone','#b7b39c',Math.cos(a)*rad,.015,1+Math.sin(a)*rad,.32+r()*.38,.05,.3+r()*.3,r());
  }
  for(let z=-19;z<29;z+=1.15)for(let x=-1;x<=1;x++)box('stone','#c5bfa3',-6+x*.95+Math.sin(z*.08),.026,z,.89,.055,1.04,.02*Math.sin(z));
  for(let x=4;x<23;x+=1.02)for(let z=0;z<3;z++)box('stone','#c1baa0',x,.027,2+z*.9,.96,.05,.83,.01);
  // The bridge carries the visible route onward, above flowing water.
  box('stone','#c4bba1',16.5,-.01,2.9,7.6,.4,3.3);
  for(const z of [1.1,4.7]){
    for(let x=13.1;x<20.3;x+=.53)box('stone','#b7af96',x,.46,z,.49,.86,.38);
    box('stone','#d0c3a2',16.55,.95,z,7.5,.15,.5);
    for(const x of [13,20])box('stone','#a8a78e',x,.65,z,.65,1.3,.65);
  }
  for(const x of [13.3,19.7])box('stone','#7b897c',x,-.52,2.9,.8,1.1,3.6);
  // Houses are individually composed around usable streets, not scattered assets.
  building(-7.1,-7.5,6.3,4.5,3.8,0);
  building(2.2,-9.1,5.3,4.8,4.3,1);
  building(8.2,-12.7,4.6,4.7,3.1,0);
  building(-14.1,-13,5.8,5,4.5,1);
  building(25,-6,5.7,4.6,4.3,1);
  building(27,7.7,4.4,4.8,3.7,0);
  building(-16,8.3,5.2,5,3.5,0);
  // Workshop canopy, exposed copper coil, bench, hanging tools and weathered sign.
  const awning=new THREE.BufferGeometry();awning.setAttribute('position',new THREE.Float32BufferAttribute([-10.1,3.2,-5.1,-4.2,3.2,-5.1,-4.2,2.8,-3.55,-10.1,3.2,-5.1,-4.2,2.8,-3.55,-10.1,2.8,-3.55],3));awning.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,3,0,3,1,0,0,3,1,0,1],2));awning.computeVertexNormals();put(awning,'solid','#a56f4d',0,0,0);
  for(const x of [-10,-4.3]){box('wood','#6e6046',x,1.45,-3.6,.12,2.9,.12);}
  box('wood','#ac936a',-7.4,1,-3.9,3.1,.2,.88);for(const x of [-8.6,-6.2])box('wood','#77684e',x,.48,-3.9,.12,.95,.65);
  for(let i=0;i<7;i++){const torus=new THREE.TorusGeometry(.3,.038,5,16);put(torus,'solid','#bb8c50',-8.1+i*.07,1.22,-3.8,1,1,1,0,Math.PI/2,0);}
  box('solid','#afaa87',-6.8,1.16,-3.87,.44,.08,.28);box('wood','#655542',-6.1,1.15,-3.9,.4,.09,.14,.45);
  pole('#454d40',[-5.7,2.3,-5.13],[-5.7,2.9,-5.13],.045);box('solid','#686e5a',-5.7,2.3,-5.13,.36,.1,.08);
  box('wood','#6c644f',-3.85,2.9,-4.45,1.1,.65,.16);pole('#655b47',[-4.4,3.5,-4.45],[-3.3,3.5,-4.45],.05);pole('#655b47',[-3.85,3.5,-4.45],[-3.85,3.2,-4.45],.025);
  put(new THREE.TorusGeometry(.19,.035,5,20),'solid','#d0b478',-3.85,2.94,-4.35);
  // Central service pedestal and an unmistakable, physically interrupted copper return.
  cyl('#acae99',.5,.17,.1,2.45,2.55,.32,12,'stone');cyl('#c9c1a0',.5,.34,.1,2.23,2.45,.08,12,'stone');
  cyl('#8d9581',1.35,.69,.2,.65,.84,.62,8,'stone');cyl('#cebc88',1.35,1.04,.2,.72,.65,.1,8,'solid');collision(1.35,.2,1.25,1.25);
  const source={x:-2.35,z:.1};
  box('stone','#a0a68f',source.x,.28,source.z,1.2,.54,.9);box('wood','#6e7255',source.x,.78,source.z,1,.48,.7);
  for(const x of [-2.6,-2.12]){cyl('#b79255',x,1.19,.1,.17,.2,.5,10);cyl('#dec38b',x,1.46,.1,.1,.13,.1,8);}
  box('dark','#38473e',-2.12,1.516,.1,.13,.008,.03);box('dark','#38473e',-2.12,1.517,.1,.03,.008,.13);box('dark','#38473e',-2.6,1.516,.1,.13,.008,.03);
  box('solid','#526b60',source.x,1.01,.1,.75,.06,.5);collision(source.x,.1,1,.8);
  box('stone','#9aa28d',-.35,.42,-1.66,1.6,.34,.85);
  box('wood','#5d6e58',-.35,.62,-1.66,1.46,.08,.67);
  for(const x of [-.87,.17]){box('solid','#c69c60',x,.71,-1.66,.28,.12,.32);cyl('#e0c68c',x,.8,-1.66,.055,.055,.04,8);}
  const strap = new THREE.Mesh(new THREE.BoxGeometry(.88,.065,.18),new THREE.MeshLambertMaterial({color:'#d8a462'}));strap.position.set(-.35,.77,-1.66);strap.visible=false;scene.add(strap);
  // Distinct knife-switch handle that physically changes angle when operated.
  box('stone','#a1a48d',-2.35,.33,2.15,1,.6,.85);box('wood','#6e745c',-2.35,.67,2.15,.86,.1,.68);
  for(const x of [-2.64,-2.06])cyl('#d0ac69',x,.84,2.15,.075,.09,.3,8);
  const switchPivot=new THREE.Group();switchPivot.position.set(-2.64,.94,2.15);scene.add(switchPivot);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.7,.06,.1),new THREE.MeshLambertMaterial({color:'#ddbb78'}));blade.position.x=.32;switchPivot.add(blade);
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.2,.14,.2),new THREE.MeshLambertMaterial({color:'#9e533b'}));handle.position.x=.66;switchPivot.add(handle);
  collision(-2.35,2.15,.9,.75);
  const paths=[[-2.1,1.05,.1,-1.5,.46,.1,-1.5,.46,2.15,-2.05,.73,2.15],[-2.62,.73,2.15,-3.3,.12,2.15,-3.3,.12,3.05,1.35,.12,3.05,1.35,.45,.6],[1.35,.5,-.4,1.35,.46,-1.66,.17,.76,-1.66],[-.87,.76,-1.66,-2.6,.12,-1.66,-2.6,.12,-.2]];
  const liveWires=[];const wireCurves=[];
  for(let i=0;i<paths.length;i++){
    const points=[];for(let j=0;j<paths[i].length;j+=3)points.push(new THREE.Vector3(...paths[i].slice(j,j+3)));
    const curve=new THREE.CurvePath();for(let j=1;j<points.length;j++)curve.add(new THREE.LineCurve3(points[j-1],points[j]));wireCurves.push(curve);
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(8,points.length*4),.042,5,false),new THREE.MeshBasicMaterial({color:i<2?'#b88a51':'#677c6b'}));scene.add(mesh);liveWires.push(mesh);
  }
  // A dry fountain retains mineral stains, buckets and a shared place to sit.
  cyl('#999f8c',5.8,.3,-3.7,1.6,1.7,.55,12,'stone');
  cyl('#566e63',5.8,.6,-3.7,1.35,1.35,.035,24,'solid');
  cyl('#a2a792',5.8,1.2,-3.7,.3,.45,1.2,8,'stone');cyl('#c3b99a',5.8,1.9,-3.7,.7,.24,.23,10,'stone');cyl('#98a68b',5.8,2.15,-3.7,.1,.2,.3,8);collision(5.8,-3.7,3,3);
  // Props make occupied edges: baskets, produce, crates, stoops, cloth and repair stock.
  function crate(x,z,s=.6){box('wood','#a18a62',x,s/2+.04,z,s,s,s);for(const y of [.15,s-.05])box('wood','#6c624b',x,y,z+s/2+.01,s,.06,.04);pole('#6c624b',[x-s/2,s,z+s/2+.04],[x+s/2,.08,z+s/2+.04],.045,'wood');}
  function pot(x,z,size=.38,flowers=false){cyl('#a77552',x,size*.55,z,size*.78,size*.55,size*1.1,9);cyl('#bf9060',x,size*1.08,z,size*.84,size*.84,.09,9);cyl('#4b5540',x,size*1.14,z,size*.65,size*.65,.025,9);for(let i=0;i<5;i++){const a=r()*6.28;pole('#4a7050',[x,size,z],[x+Math.cos(a)*size,size*2+r()*.3,z+Math.sin(a)*size],.025);if(flowers)ball(i%2?'#d5ac7c':'#b16b58',x+Math.cos(a)*size,size*2+r()*.3,z+Math.sin(a)*size,.11);}}
  for(const p of [[-10.9,-4.9],[-10.9,-4.15],[-11.6,-4.7],[4.7,-6.6],[10.7,-10],[21.5,5.2],[22.3,5.2],[-14,4.7]])crate(...p,.5+r()*.3);
  for(const p of [[-4.15,-5.2],[-9.9,-4.7],[.6,-6.45],[4.1,-6.4],[10,-9.6],[23.7,-3.5],[-13.7,5.4]])pot(...p,.3+r()*.2,true);
  for(const [x,z] of [[6.4,6.4],[-8.4,3.7],[8.8,-6.2]]){
    box('wood','#a59a70',x,.65,z,2.2,.13,.6);box('wood','#7a7754',x,1,z+.23,2.2,.55,.1);for(const dx of [-.8,.8])box('wood','#66634d',x+dx,.3,z,.14,.6,.5);
  }
  // Low garden walls enclose planted ground without closing off streets.
  for(const [x,z,w] of [[-7.5,-1.7,3.2],[7.1,8.7,4.7],[-9.9,9.3,3.8],[6.9,-7.2,2]]){
    for(let dx=-w/2;dx<w/2;dx+=.55)box('stone','#a6aa8c',x+dx,.33,z,.51,.6,.43);
    box('stone','#bfc3a0',x,.68,z,w+.35,.12,.58);
  }
  // Trees use original pixel-painted crowns, with real depth and grounded shadows.
  const treeMaterials=[0,1,2,3].map(i=>new THREE.SpriteMaterial({map:texture(foliage(41+i*32,i===3)),alphaTest:.2,transparent:true,depthWrite:true,color:'#ecedda',toneMapped:false}));
  const crowns=[];
  const shadowMat=new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,color:'#344235'});
  const shadowGeos=[];
  function shadow(x,z,w,d){const geo=new THREE.PlaneGeometry(w,d);geo.rotateX(-Math.PI/2);geo.translate(x,.041,z);shadowGeos.push(geo);}
  function tree(x,z,h=5,variant=0){
    cyl('#6a6047',x,h*.31,z,.12,.3,h*.62,7,'wood');pole('#726649',[x,h*.35,z],[x-.7,h*.63,z+.05],.105,'wood');pole('#726649',[x,h*.41,z],[x+.5,h*.7,z],.09,'wood');
    const crown=new THREE.Sprite(treeMaterials[variant%4].clone());crown.position.set(x,h*.79,z);crown.scale.set(h*1.05,h*1.07,1);scene.add(crown);crowns.push(crown);
    shadow(x+.6,z+.4,h*1.2,h*.8);collision(x,z,.6,.6);
    for(let i=0;i<3;i++)ball('#747e53',x+(r()-.5)*1.3,.12,z+(r()-.5)*1.2,.3,.2,.25);
  }
  for(const [x,z,h,v] of [[-11.8,.2,5.1,0],[-10.7,8.8,6.2,1],[8.8,7.7,5.5,3],[11,-3,4.8,1],[-1.8,-12.5,5.2,0],[-15,-5,6.7,1],[-17,0,7,0],[23,1,5.4,2],[23,10.8,6.3,0],[5.9,-16,6,1],[-10,16,6,0],[5,15,5.8,2],[-18,15,7,0],[28,-13,7,1],[-3,-20,7,0],[14,-21,7,1],[-17,-21,8,0]])tree(x,z,h,v);
  // Clumps of reeds and wild flowers stitch architecture to the land.
  for(let i=0;i<560;i++){
    const x=-21+r()*52,z=-22+r()*44;
    if(x>12.4&&x<20.7)continue;if(Math.hypot(x,z-1)<9.6)continue;if(Math.abs(x+6-Math.sin(z*.08))<1.6)continue;if(z>1&&z<5.5&&x>4&&x<24)continue;
    const h=.17+r()*.35;const col=['#7d9358','#a6aa6b','#638056','#aeba7b'][i%4];
    for(let j=0;j<3;j++){
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.12,0,0,.12,0,0,.04,h,0],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.computeVertexNormals();put(geo,'solid',col,x+j*.11,.02,z,1,1,1,0,r()*6.28,0);
    }
    if(i%7===0)ball(i%3?'#decf9a':'#b7776a',x,h,z,.065,.065,.065);
  }
  for(let i=0;i<85;i++){
    const x=i%2?12.66:20.35,z=-27+r()*56;if(z>0&&z<6)continue;
    pole('#748259',[x,-.1,z],[x+.14,.35+r()*.55,z+.1],.025);if(i%3===0)cyl('#95835a',x+.14,.7,z+.1,.047,.047,.25,5);
  }
  // Background landforms and a distant lighthouse provide a place beyond the frame.
  for(let i=0;i<18;i++){const x=-60+i*7;ball(i%2?'#718f82':'#7f9a8b',x,2+r()*3,-34-r()*24,8+r()*7,6+r()*9,7+r()*5);}
  cyl('#ced0b3',31,6,-25,1.15,1.8,12,10,'wall');cyl('#6c8378',31,12.2,-25,1.9,1.9,.35,12);cyl('#c1b783',31,13,-25,1.05,1.05,1.4,8);cyl('#486c68',31,14.1,-25,0,1.7,1,10);
  // Clothesline and flags carry small signs of everyday life across the street.
  pole('#72684d',[-1.4,3.4,-6.9],[6,3.5,-7.2],.014);
  for(let i=0;i<6;i++)box('solid',['#b59770','#b4bba2','#788e7b'][i%3],-.6+i*1.05,3.02,-7.02,.53,.78,.02,.03);
  const lamps=[],glows=[]; const glowMat=new THREE.SpriteMaterial({map:glowTexture(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const [x,z] of [[-4.5,4.6],[4.7,4.7],[-3.5,-4.8],[10.8,1.25],[21.1,4.8],[-8.6,10.6]]){
    box('stone','#8b967c',x,.15,z,.45,.3,.45);cyl('#5c6753',x,1.6,z,.047,.075,3,7);pole('#5c6753',[x,3.08,z],[x+.43,3.08,z],.045);
    box('solid','#636c53',x+.43,2.97,z,.4,.1,.4);box('solid','#636c53',x+.43,2.51,z,.3,.07,.3);
    for(const dx of [-.13,.13])for(const dz of [-.13,.13])pole('#626650',[x+.43+dx,2.53,z+dz],[x+.43+dx,2.95,z+dz],.018);
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(.25,.36,.25),new THREE.MeshBasicMaterial({color:'#a0aa7e'}));mesh.position.set(x+.43,2.74,z);scene.add(mesh);lamps.push(mesh);
    const glow=new THREE.Sprite(glowMat);glow.position.copy(mesh.position);glow.scale.set(2.6,2.6,1);glow.visible=false;scene.add(glow);glows.push(glow);
  }
  // One merge per material: authored detail has a bounded draw-call cost.
  for(const [key,geos] of buckets){const geo=mergeGeometries(geos,false);const mesh=new THREE.Mesh(geo,mats[key]);mesh.castShadow=key!=='grass'&&key!=='dark';mesh.receiveShadow=key!=='dark';scene.add(mesh);for(const g of geos)g.dispose();}
  const shadows=new THREE.Mesh(mergeGeometries(shadowGeos),shadowMat);scene.add(shadows);
  function actor(kind,x,z){
    const maps=[];for(let back=0;back<2;back++)for(let frame=0;frame<4;frame++)maps.push(texture(character(kind,frame,!!back)));
    const mat=new THREE.SpriteMaterial({map:maps[0],alphaTest:.2,transparent:true,depthWrite:true});
    const sprite=new THREE.Sprite(mat);sprite.position.set(x,kind==='ohm'?1.85:.95,z);sprite.scale.set(kind==='ohm'?1.12:1.04,kind==='ohm'?1.68:1.56,1);scene.add(sprite);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(.9,.65),shadowMat);s.rotation.x=-Math.PI/2;s.position.set(x,.06,z);scene.add(s);
    return {sprite,maps,shadow:s,kind};
  }
  const player=actor('player',-6,7),edda=actor('edda',3.1,3.2),lumen=actor('lumen',-5.2,-3.1),ohm=actor('ohm',1.35,.2);
  const targets=[{id:'ohm',name:'El autómata',x:1.35,z:.2,y:2.6,range:2.25},{id:'return',name:'Un puente partido',x:-.35,z:-1.66,y:1.5,range:1.8},{id:'source',name:'La pila del taller',x:-2.35,z:.1,y:1.8,range:1.7},{id:'switch',name:'La palanca',x:-2.35,z:2.15,y:1.5,range:1.7},{id:'lumen',name:'Maese Lumen',x:-5.2,z:-3.1,y:2.4,range:2},{id:'edda',name:'Edda',x:3.1,z:3.2,y:2.3,range:2},{id:'fountain',name:'La fuente',x:5.8,z:-3.7,y:2.6,range:2.4},{id:'bridge',name:'Hacia La Calzada',x:11.6,z:2.9,y:1.8,range:2.1}];
  const pointer=new THREE.Mesh(new THREE.RingGeometry(.18,.25,24),new THREE.MeshBasicMaterial({color:'#f2d393',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));pointer.rotation.x=-Math.PI/2;pointer.position.y=.065;pointer.visible=false;scene.add(pointer);
  const particleGeo=new THREE.BufferGeometry();const motes=new Float32Array(90*3);for(let i=0;i<90;i++){motes[i*3]=-17+r()*40;motes[i*3+1]=.5+r()*7;motes[i*3+2]=-12+r()*28;}particleGeo.setAttribute('position',new THREE.BufferAttribute(motes,3));const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:'#f2d79b',size:.05,transparent:true,opacity:.5,depthWrite:false}));scene.add(particles);
  const flowDots=[];for(let i=0;i<12;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.055,5,4),new THREE.MeshBasicMaterial({color:'#ffe0a0'}));scene.add(dot);flowDots.push(dot);}
  const smokeMap=glowTexture();const smoke=[];
  for(const d of decorations)for(let i=0;i<3;i++){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeMap,color:'#aeb9a7',transparent:true,opacity:.3,depthWrite:false}));scene.add(sprite);smoke.push({sprite,d,phase:i/3});}
  let width=1,height=1,lastFrame=0,lastPowered=null,frame=0;
  function resize(){width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);const aspect=width/height;const h=aspect<.8?26:aspect<1.25?25:25;camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();}
  window.addEventListener('resize',resize);resize();
  function canWalk(x,z,powered){
    if(!Number.isFinite(x)||!Number.isFinite(z))return false;
    if(x< -12.4||x>22.4||z< -6.1||z>12.2)return false;
    if(x>12.15&&x<20.55&&(!powered||z<1.75||z>4.05))return false;
    if(colliders.some(c=>Math.abs(x-c.x)<c.w&&Math.abs(z-c.z)<c.d))return false;
    // Keep the player on the near side of low walls and workshop furniture.
    if(z< -2.7&&x< -6&&x> -9.1)return false;
    if(Math.abs(z+1.7)<.43&&x> -9.5&&x< -5.5)return false;
    if(Math.abs(z-8.7)<.43&&x>4.3&&x<9.8)return false;
    if(Math.abs(z-9.3)<.43&&x> -12.2&&x< -7.65)return false;
    return true;
  }
  const raycaster=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  function groundPoint(clientX,clientY){raycaster.setFromCamera(new THREE.Vector2(clientX/width*2-1,-clientY/height*2+1),camera);const p=new THREE.Vector3();return raycaster.ray.intersectPlane(ground,p);}
  function screenPoint(x,y,z){const v=new THREE.Vector3(x,y,z).project(camera);return{x:(v.x+1)*width/2,y:(1-v.y)*height/2};}
  const viewRight=new THREE.Vector3(cameraOffset.z,0,-cameraOffset.x).normalize();
  const viewDown=new THREE.Vector3(cameraOffset.x,0,cameraOffset.z).normalize();
  function update(time,dt,state,moving,dir){
    const powered=state.returnRepaired&&state.switchClosed;
    targets.find(t=>t.id==='return').name=state.returnRepaired?'La unión de cobre':'Un puente partido';
    targets.find(t=>t.id==='bridge').name=state.verified?'Cruzar el puente':'Hacia La Calzada';
    if(powered!==lastPowered){strap.visible=state.returnRepaired;for(const lamp of lamps)lamp.material.color.set(powered?'#ffe0a1':'#a0aa7e');for(const glow of glows)glow.visible=powered;for(const p of windowLights)p.material.opacity=powered?.63:.08;for(const wire of liveWires)wire.material.color.set(powered?'#dcb370':'#9b8861');lastPowered=powered;}
    strap.visible=state.returnRepaired;switchPivot.rotation.z=THREE.MathUtils.damp(switchPivot.rotation.z,state.switchClosed?0:.95,12,dt);
    player.sprite.position.set(state.player[0],.98+(moving?Math.sin(time*13)*.026:0),state.player[1]);player.shadow.position.set(state.player[0],.065,state.player[1]);
    if(moving){frame=Math.floor(time*8)%4;lastFrame=dir.z<-.1?4:0;}else frame=0;player.sprite.material.map=player.maps[lastFrame+frame];player.sprite.material.rotation=moving?Math.sin(time*9)*.018:0;
    ohm.sprite.material.color.set(powered?'#fff6d9':'#9ca38e');ohm.sprite.position.y=1.85+(powered?Math.sin(time*2)*.028:0);
    edda.sprite.position.y=.98+Math.sin(time*1.8)*.018;lumen.sprite.position.y=.98+Math.sin(time*1.4)*.014;
    const targetFocus=new THREE.Vector3(THREE.MathUtils.clamp(state.player[0]*.52,-3.4,12),1.2,THREE.MathUtils.clamp(state.player[1]*.42,-1.7,4));
    if(width/height<.8){targetFocus.set(state.player[0]*.88,1.2,state.player[1]*.83-1);}
    if(!state.started)targetFocus.set(1,1.5,-.5);
    cameraFocus.lerp(targetFocus,1-Math.exp(-dt*2));camera.position.copy(cameraFocus).add(cameraOffset);camera.lookAt(cameraFocus);
    camera.zoom=THREE.MathUtils.damp(camera.zoom,state.started?1:.88,3,dt);camera.updateProjectionMatrix();
    const playerScreen=screenPoint(state.player[0],1,state.player[1]);
    for(const crown of crowns){
      const p=screenPoint(...crown.position.toArray());const pixelScale=height/(camera.top-camera.bottom)*camera.zoom;
      const closer=(crown.position.x-state.player[0])*cameraOffset.x+(crown.position.z-state.player[1])*cameraOffset.z>0;
      const obscures=closer&&Math.abs(p.x-playerScreen.x)<crown.scale.x*pixelScale*.4&&Math.abs(p.y-playerScreen.y)<crown.scale.y*pixelScale*.4;
      crown.material.opacity=THREE.MathUtils.damp(crown.material.opacity,obscures?.32:1,7,dt);
    }
    waterUniforms.time.value=time;particles.position.y=Math.sin(time*.3)*.2;
    for(let i=0;i<flowDots.length;i++){const curve=wireCurves[i%4];flowDots[i].visible=powered;if(powered)flowDots[i].position.copy(curve.getPoint((time*.19+Math.floor(i/4)/3)%1));}
    for(const s of smoke){const f=(time*.07+s.phase)%1;s.sprite.position.set(s.d.x+f*.75,s.d.y+f*2.3,s.d.z+f*.1);s.sprite.scale.setScalar(.9+f*2);s.sprite.material.opacity=Math.sin(f*Math.PI)*.16;}
    renderer.render(scene,camera);
  }
  renderer.shadowMap.needsUpdate=true;
  return {renderer,scene,camera,player,targets,canWalk,groundPoint,screenPoint,viewRight,viewDown,update,pointer};
}
