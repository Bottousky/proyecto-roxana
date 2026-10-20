import * as THREE from 'three';

/** The same territorial gate, with its lifting gear exposed above the lintel. */
export function buildGateway(world,width,depth){
  const z=-depth*.32,group=world.group(0,0,z);group.name='puerta-de-ohm';
  const box=(name,x,y,zz,w,h,d,material=world.m.stone,parent=group)=>{const mesh=world.box(x,y,zz,w,h,d,material,parent);mesh.name=name;return mesh;};
  for(const side of [-1,1]){
    box('gateway-wing',side*16.1,2.4,0,2.6,4.8,1.6);
    world.solid(side*16.1,z,2.6,1.6,'road-wing-wall');
    const x=side*width*.38;
    box('bastion-foundation',x,.17,0,4.8,.34,4.8,world.m.stoneDark);
    world.solid(x,z,4.8,4.8,'bastion-foundation');
    world.cylinder(x,3.6,0,2.1,7.2,world.m.stone,group);
    for(const y of [.28,3.15,7.25])world.cylinder(x,y,0,y===7.25?2.35:2.18,y===3.15?.22:.4,world.m.stoneDark,group);
    world.mesh('cone',world.m.roof,x,8.85,0,2.65,3.3,2.65,group);
    world.window(x,4.5,2.08,group,true);world.solid(x,z,4.2,4.2,'gateway-tower');
    // Continuous masonry carries the arch; guide rails read as installed hardware.
    box('portcullis-guide',side*10.65,5.35,.10,.44,10.7,.6,world.m.metal);
    world.solid(side*10.65,z+.10,.44,.6,'portcullis-guide');
    box('guide-footing',side*10.65,.23,.10,.7,.46,.86,world.m.stoneDark);
    world.solid(side*10.65,z+.10,.7,.86,'portcullis-footing');
    for(const y of [1.7,4.7,7.7,10.3])box('rail-clamp',side*10.65,y,.45,.7,.17,.15,world.m.brass);
    box('counterweight-guide',side*9.65,4.25,-.2,.14,8.3,.14,world.m.metal);
    world.solid(side*9.65,z-.2,.72,.72,'gateway-counterweight');
  }
  box('gateway-lintel',0,6.45,0,width*.75,.9,1.6);
  box('gateway-cornice',0,6.97,0,width*.77,.15,1.8,world.m.cream);
  for(let x=-width*.36;x<width*.37;x+=1.4)box('gateway-merlon',x,7.4,0,.65,.8,1.5);
  // The emblem belongs to the working span of the gate, rather than a floating sign.
  box('omega-stone-plaque',0,7.65,1,2.8,2.25,.28,world.m.stoneDark);
  const omegaGeometry=new THREE.TorusGeometry(.77,.085,8,42,Math.PI*1.55);world.localGeometries.push(omegaGeometry);
  const omega=world.mesh(omegaGeometry,world.m.brass,0,7.85,1.19,1,1,1,group);omega.rotation.z=-Math.PI*.275;omega.name='gate-omega-emblem';
  for(const side of [-1,1])box('omega-foot',side*.65,7.23,1.2,.5,.15,.14,world.m.brass);

  const leaf=world.group(0,0,0,group);leaf.name='ohm-portcullis';
  for(let x=-10;x<=10;x+=.85){
    box('portcullis-bar',x,2.7,.05,.10,5.4,.18,world.m.metal,leaf);
    world.mesh('cone',world.m.brass,x,.05,.05,.17,.32,.17,leaf).rotation.z=Math.PI;
    for(const y of [1.25,3.1,4.9])world.sphere(x,y,.18,.075,world.m.brass,leaf);
  }
  for(const y of [1.25,3.1,4.9])box('portcullis-crossbar',0,y,.05,20.5,.14,.26,world.m.metal,leaf);
  world.gateLeaf=leaf;world.gateObstacle={x:0,z,w:10.25,d:.3};
  // While the gate is shut its lifting chains hang to the ground in front of it: they stop a
  // walker too. Opened, the chains wind up above head height and the passage is free.
  world.gateObstacles=[world.gateObstacle,...[-1,1].map(side=>({x:side*8.8,z:z+.9,w:.16,d:.16}))];world.obstacles.push(...world.gateObstacles);

  const drives=[],chains=[],weights=[],signals=[];
  world.beam([-9.65,8.35,.85],[9.65,8.35,.85],.16,world.m.metal,group);
  for(const side of [-1,1]){
    const drive=world.gear(side*8.8,8.35,.9,.86,group);world.animations.at(-1).kind='gateway-drive';drives.push({mesh:drive,side});
    const chain=world.mesh('cylinder',world.m.metal,side*8.8,4.5,.9,.065,7,.065,group);chain.name='portcullis-lifting-chain';chains.push(chain);
    const weight=box('gate-counterweight',side*9.65,6.8,-.2,.68,1.2,.68,world.m.stoneDark);weights.push(weight);
    for(let i=0;i<5;i++)world.torus(side*8.8,7.1+i*.22,.9,.22,.06,world.m.brass,[Math.PI/2,0,0],group);
    const material=world.mat('#746c4d',null,{emissive:'#000000',emissiveIntensity:0});
    const light=world.sphere(side*7.1,5.75,1.03,.14,material,group);light.name='gate-current-indicator';signals.push(light);
    for(let i=0;i<3;i++)world.torus(side*7.1,5.36+i*.12,1.03,.18,.035,world.m.cream,[Math.PI/2,0,0],group);
  }
  const controller={group,leaf,progress:world.state.flags?.gate?1:0,drives,weights,chains,
    setPose(progress,powered=false,overloaded=false){
      this.progress=THREE.MathUtils.clamp(progress,0,1);leaf.position.y=this.progress*5.8;
      for(const {mesh,side} of drives)mesh.rotation.z=side*this.progress*Math.PI*2.3;
      for(const weight of weights)weight.position.y=6.8-this.progress*5;
      const bottom=leaf.position.y+.55,top=8.35;
      for(const chain of chains){chain.position.y=(bottom+top)/2;chain.scale.y=Math.max(.01,top-bottom);}
      for(const light of signals){light.material.color.set(overloaded?'#af7657':powered?'#cfdd9d':'#746c4d');light.material.emissive.set(powered?'#d1c675':'#000000');light.material.emissiveIntensity=powered?.8:0;}
    },
  };
  controller.setPose(controller.progress);
  return controller;
}
