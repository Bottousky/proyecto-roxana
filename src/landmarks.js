import * as THREE from 'three';

function lathe(world,profile,material,parent,name){
  const geometry=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),48);
  world.localGeometries.push(geometry);
  const mesh=world.mesh(geometry,material,0,0,0,1,1,1,parent);mesh.name=name;return mesh;
}

function waterMaterial(world){
  const material=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{time:{value:0},deep:{value:new THREE.Color('#235257')},shallow:{value:new THREE.Color('#688f7e')},light:{value:new THREE.Color('#c9d9bc')}},
    vertexShader:'varying vec2 basin;void main(){basin=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 basin;uniform float time;uniform vec3 deep;uniform vec3 shallow;uniform vec3 light;void main(){float rings=sin(length(basin)*25.-time*2.4);float ripples=sin(basin.x*17.+basin.y*12.+time)*sin(basin.y*21.-time*.7);vec3 water=mix(deep,shallow,.42+rings*.08);water+=light*pow(max(0.,ripples),10.)*.08;gl_FragColor=vec4(water,.94);}',
  });
  world.sharedMaterials.add(material);world.waterMaterials.push(material);return material;
}

function waterDisk(world,parent,radius,y,material,name,active){
  const geometry=new THREE.CircleGeometry(radius,64);world.localGeometries.push(geometry);
  const disk=world.mesh(geometry,material,0,y,0,1,1,1,parent);
  disk.name=name;disk.rotation.x=-Math.PI/2;disk.castShadow=false;disk.receiveShadow=false;disk.visible=active;
  world.fountainWater.push(disk);return disk;
}

/** Visual geometry and water hooks. The World wrapper registers the footprint. */
export function buildFountain(world,x,z,r=1.5){
  const g=world.group(x,0,z);g.name='public-fountain';
  const stone=world.m.stone,edge=world.m.cream,bronze=world.m.brass;
  const active=Boolean(world.state?.flags?.pump),inner=r-.30;
  world.cylinder(0,.12,0,r+.3,.24,world.m.stoneDark,g).name='fountain-foundation';
  world.cylinder(0,.29,0,r+.15,.14,stone,g);
  // An open masonry basin has an inner wall, a dry floor and a broad coping.
  world.cylinder(0,.36,0,inner+.07,.10,world.m.stoneDark,g).name='dry-basin-floor';
  lathe(world,[[r-.10,.30],[r,.44],[r,.76],[r-.04,.87],[r-.18,.90],[inner,.79],[inner,.38],[r-.10,.30]],stone,g,'fountain-basin');
  world.torus(0,.88,0,r-.105,.115,edge,[Math.PI/2,0,0],g);
  world.torus(0,.45,0,r-.015,.025,world.m.stoneDark,[Math.PI/2,0,0],g);
  for(let i=0;i<20;i++){
    const a=i*Math.PI/10,xx=Math.sin(a)*(r+.004),zz=Math.cos(a)*(r+.004);
    world.beam([xx,.47,zz],[xx,.76,zz],.014,world.m.stoneDark,g);
  }
  // The short, wide upper bowl reads as a fountain even before water returns.
  world.cylinder(0,.80,0,.28,.84,stone,g);
  world.cylinder(0,1.18,0,.37,.15,edge,g);
  lathe(world,[[.28,1.18],[.47,1.23],[.66,1.36],[.73,1.50],[.68,1.56],[.57,1.51],[.45,1.35],[.20,1.29],[.28,1.18]],stone,g,'upper-fountain-bowl');
  world.torus(0,1.53,0,.665,.065,bronze,[Math.PI/2,0,0],g);
  world.cylinder(0,1.47,0,.13,.25,bronze,g);world.sphere(0,1.64,0,.14,bronze,g);
  const water=waterMaterial(world);
  waterDisk(world,g,inner-.025,.72,water,'basin-water',active);
  waterDisk(world,g,.54,1.49,water,'upper-bowl-water',active);
  const streamMaterial=world.mat('#8bd3ce',null,{transparent:true,opacity:.76,roughness:.22,metalness:.15,emissive:'#285e5c',emissiveIntensity:.18});
  for(let i=0;i<4;i++){
    const a=Math.PI/4+i*Math.PI/2,dx=Math.sin(a),dz=Math.cos(a);
    world.beam([dx*.57,1.46,dz*.57],[dx*.79,1.41,dz*.79],.105,bronze,g);
    const end=inner*.88;
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(dx*.79,1.41,dz*.79),new THREE.Vector3(dx*(end+.06),1.52,dz*(end+.06)),new THREE.Vector3(dx*end,.73,dz*end));
    const geometry=new THREE.TubeGeometry(curve,24,.026,6,false);world.localGeometries.push(geometry);
    const stream=world.mesh(geometry,streamMaterial,0,0,0,1,1,1,g);stream.name='fountain-water-arc';stream.castShadow=false;stream.visible=active;
    world.fountainStreams.push(stream);
  }
  g.userData.landmark={kind:'fountain',footprint:{x,z,w:2*(r+.3),d:2*(r+.3)},basinRadius:r,waterRadius:inner-.025};
  return g;
}

function firstTeacher(world,obj){
  const g=world.group(obj.x,0,obj.z);g.name='first-teacher-statue';
  const bronze=world.mat('#b0b39a','stone',{metalness:0,roughness:.96}),patina=world.mat('#748577','stone',{metalness:0,roughness:1});
  world.box(0,.10,0,1.25,.20,.95,world.m.stoneDark,g);
  world.box(0,.54,0,1.02,.72,.77,world.m.stone,g);
  world.box(0,.95,0,1.16,.14,.88,world.m.cream,g);
  world.box(0,.58,.395,.70,.29,.035,world.m.brass,g).name='teacher-dedication';
  for(let i=0;i<3;i++)world.box(0,.65-i*.07,.417,.48-i*.05,.013,.012,patina,g);
  for(const side of [-1,1])world.box(side*.16,1.09,.08,.18,.15,.30,bronze,g);
  lathe(world,[[0,1.15],[.37,1.15],[.33,1.33],[.27,1.70],[.30,1.95],[.25,2.14],[.16,2.19],[0,2.19]],bronze,g,'teacher-robed-figure');
  world.cylinder(0,2.20,0,.11,.17,bronze,g);
  world.sphere(0,2.47,0,.215,bronze,g,1.17).name='teacher-head';
  const hair=world.sphere(0,2.54,-.035,.226,patina,g,.82);hair.scale.z*=.78;
  world.sphere(0,2.46,.202,.042,bronze,g,1.5);
  for(const side of [-1,1])world.sphere(side*.066,2.52,.185,.022,patina,g,.6);
  world.beam([-.27,2.10,0],[-.43,1.86,.20],.17,bronze,g);
  world.beam([-.43,1.86,.20],[-.23,1.88,.32],.14,bronze,g);
  world.beam([.27,2.10,0],[.43,1.96,.15],.17,bronze,g);
  world.beam([.43,1.96,.15],[.24,1.89,.32],.14,bronze,g);
  const book=world.group(0,1.87,.25,g);book.name='teacher-open-book';
  for(const side of [-1,1]){
    const cover=world.box(side*.165,0,0,.33,.065,.32,patina,book);cover.rotation.z=side*.14;
    const pages=world.box(side*.16,.043,0,.29,.045,.28,world.m.cream,book);pages.rotation.z=side*.14;
    for(let i=0;i<3;i++){const mark=world.box(side*.16,.074,-.07+i*.06,.20,.01,.012,patina,book);mark.rotation.z=side*.14;}
  }
  return g;
}

function plazaBell(world,obj){
  const g=world.group(obj.x,0,obj.z);g.name='plaza-bell';
  world.box(0,.10,0,1.25,.20,.95,world.m.stoneDark,g);
  for(const side of [-1,1]){
    world.box(side*.49,1.35,0,.16,2.50,.22,world.m.darkwood,g);
    world.box(side*.49,.29,0,.23,.25,.32,world.m.stone,g);
    world.beam([side*.49,2.0,0],[side*.23,2.40,0],.09,world.m.wood,g);
    for(const y of [.50,2.25])world.sphere(side*.49,y,.125,.035,world.m.brass,g);
  }
  world.box(0,2.49,0,1.22,.18,.29,world.m.wood,g);
  const left=world.box(-.32,2.69,0,.72,.09,.80,world.m.roof,g);left.rotation.z=.29;
  const right=world.box(.32,2.69,0,.72,.09,.80,world.m.roof,g);right.rotation.z=-.29;
  world.box(0,2.80,0,.10,.10,.86,world.m.brass,g);
  world.torus(0,2.28,0,.12,.055,world.m.brass,null,g);
  lathe(world,[[.37,1.34],[.44,1.38],[.35,1.46],[.25,1.69],[.22,1.98],[.15,2.13],[0,2.18],[0,2.10],[.11,2.07],[.16,1.96],[.18,1.67],[.28,1.45],[.37,1.34]],world.m.brass,g,'bell-shell');
  world.torus(0,1.39,0,.40,.045,world.m.brass,[Math.PI/2,0,0],g);
  for(const y of [1.52,1.94])world.torus(0,y,0,y<1.6?.313:.229,.014,world.m.metal,[Math.PI/2,0,0],g);
  const marks=world.group(0,0,0,g);marks.name='forty-marks-inside-bell';
  for(let i=0;i<40;i++){
    const angle=i*Math.PI/20,xx=Math.sin(angle)*.306,zz=Math.cos(angle)*.306;
    world.beam([xx,1.39,zz],[xx,1.44,zz],.006,world.m.metal,marks);
  }
  world.cylinder(0,1.62,0,.035,.77,world.m.metal,g);world.sphere(0,1.23,0,.09,world.m.metal,g).name='bell-clapper';
  world.beam([.15,2.30,.16],[.16,.63,.19],.023,world.m.cloth,g).name='bell-rope';
  return g;
}

/** Return null for objects still handled by World's existing generic builder. */
export function buildCuriosity(world,obj){
  const group=obj.id==='statue'?firstTeacher(world,obj):obj.id==='plaza_bell'?plazaBell(world,obj):null;
  if(group)group.userData.landmark={kind:obj.id,footprint:{x:obj.x,z:obj.z,w:1.25,d:.95}};
  return group;
}
