import * as THREE from 'three';
import {journeyPhase} from './story-time.js';

export function updateDaylight(world,state,dt=1,immediate=false){
  if(!world.scene)return;
  const phase=journeyPhase(state),inside=world.area.id==='workshop';
  const mix=immediate?1:1-Math.exp(-dt*.45);
  world.daylight??={lamps:phase.lamps};
  world.daylight.lamps=THREE.MathUtils.lerp(world.daylight.lamps,inside?1:phase.lamps,mix);
  if(!inside){
    world.scene.background?.lerp?.(new THREE.Color(phase.sky),mix);
    world.scene.fog?.color.lerp(new THREE.Color(phase.fog),mix);
    if(world.sun){world.sun.color.lerp(new THREE.Color(phase.sun),mix);world.sun.intensity=THREE.MathUtils.lerp(world.sun.intensity,phase.intensity,mix);}
    if(world.hemi){world.hemi.intensity=THREE.MathUtils.lerp(world.hemi.intensity,phase.ambient,mix);world.hemi.color.lerp(new THREE.Color(phase.lamps>.7?'#9ab9db':'#c6e4e7'),mix);world.hemi.groundColor.lerp(new THREE.Color(phase.lamps>.7?'#283d57':'#8b845d'),mix);}
  }
  updateWaterLight(world.waterMaterials,phase,world.daylight.lamps);
  if(world.grade?.uniforms.night)world.grade.uniforms.night.value=world.daylight.lamps;
  // Candlelight inside the workshop belongs to the place; street lights need power.
  const glow=(world.areaEnergized?1:0)*world.daylight.lamps;
  for(const lamp of world.lamps||[]){
    lamp.glow.material.opacity=glow*(.67+(state.settings?.reducedMotion?0:Math.sin(world.clock*2+lamp.phase)*.025));
    if(lamp.light)lamp.light.intensity=6*glow;
  }
  if(world.m?.glass){world.m.glass.emissiveIntensity=inside?(world.areaEnergized?1.1:.12):glow*1.25;world.m.glass.color.set(glow>.1?'#efd093':'#a2b5ae');}
}
export function updateWaterLight(materials,phase,lamps){
  for(const material of materials||[]){
    if(!material.uniforms?.deep||!material.uniforms?.shallow||!material.uniforms?.light)continue;
    const night=lamps;
    material.uniforms.deep.value.set('#235257').lerp(new THREE.Color('#132f48'),night*.8);
    material.uniforms.shallow.value.set('#688f7e').lerp(new THREE.Color('#48667f'),night*.8);
    material.uniforms.light.value.set(phase.lamps>.7?'#8eaccc':'#e5cb8b');
  }
}
