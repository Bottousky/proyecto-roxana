import {measureWorld} from './world-circuits.js';

/** Sound is located at the visible installation, and follows its physical state. */
export function describeWorldAudio(world) {
  const area=world.area?.id,flags=world.state?.flags||{},p=world.player?.position;
  const bounds=world.coreBounds||world.bounds;
  const scene={area,listener:{x:p?.x||0,z:p?.z||0},emitters:[]};
  const add=(id,kind,x,z,intensity=1,range=12)=>scene.emitters.push({id,kind,x,z,intensity,range});
  const running=(id)=>{const r=measureWorld(area,world.state,id);return r?.sourceAvailable&&!r.overloaded&&Math.abs(r.current||0)>.001;};
  if(area==='portal')add('portal-field','electrical',0,-5.7,.3,10);
  if(area==='plaza'&&flags.pump)add('fountain','fountain',0,-2,1,14);
  if(area==='workshop'){
    add('workshop-hearth','forge',-bounds[0]*.4,3,.25,10);
    if(running('workbench'))add('bench','electrical',3,-3,.7,11);
  }
  if(area==='road'){
    add('canal','water',bounds[0]*.4,p?.z||0,.32,11);
    if(running('gate_panel'))add('gate','electrical',0,-bounds[1]*.32,.35,12);
  }
  if(area==='spring'){
    add('source','water',-14,-12.6,.65,22);
    if(flags.spring_sluice||flags.pump){add('water-on-wheel','water',7.82,-5.7,.65,16);add('wheel','wheel',7.82,-5.7,1,14);}
    if(running('pump_panel'))add('pump','pump',2.5,-5.5,flags.pump?1:.45,12);
  }
  if(area==='castle'&&running('castle_service'))add('services','electrical',0,-6,.55,12);
  if(area==='terraces'){
    add('forge','forge',-8,0,flags.forge_limited?.38:.85,12);
    if(flags.irrigation_open)add('canal','water',8,0,flags.irrigation?.7:.35,15);
  }
  if(area==='lake'){add('water','lake',9,p?.z||0,.7,20);if(running('lake_cable'))add('beacons','electrical',5,-10,.3,9);}
  if(area==='lighthouse'){
    add('shore','lake',-14,p?.z||0,.7,25);
    if(running('beacon_supply_panel'))add('generator','electrical',0,4,.65,14);
    if(running('tower_motor'))add('crown','motor',0,-4,.9,15);
  }
  return scene;
}
