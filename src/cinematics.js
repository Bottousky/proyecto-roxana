export const GAME_CAMERA_OFFSET = [0,13.5,25];
export const CINEMATIC_DEFINITIONS = {
  awaken:{area:'portal',duration:5.3,returnAt:4.2,captions:[{at:0,text:'Una pequeña luz despierta bajo el vidrio.'}]},
  workshop:{area:'workshop',duration:5.2,returnAt:4.1,captions:[{at:0,text:'La misma lámpara ilumina otra vez la mesa.'}]},
  gate:{area:'road',duration:6,returnAt:4.8,captions:[{at:0,text:'El cerrojo libera la Puerta de Ohm.'},{at:2.3,text:'La Calzada vuelve a abrirse al valle.'}]},
  pump:{area:'spring',duration:9,returnAt:7.6,captions:[{at:0,text:'La bomba vuelve a empujar el agua.'},{at:4.4,text:'Más abajo, el agua vuelve a encontrar la Plaza.'}]},
  irrigation:{area:'terraces',duration:5.8,returnAt:4.7,captions:[{at:0,text:'El agua alcanza el último bancal.'}]},
  beacon_network:{area:'lighthouse',duration:5.5,returnAt:4.4,captions:[{at:0,text:'La torre recupera su viejo sonido.'}]},
  beacon_lens:{area:'lighthouse',duration:19.6,returnAt:17.6,captions:[{at:0,text:'La luz se sostiene detrás del cristal.'},{at:3,text:'Una vuelta. Una pausa.'},{at:7.6,text:'El haz cruza el lago y sube por las Terrazas.'},{at:11.6,text:'Desde la Plaza, una campana responde.'},{at:14.4,text:'Al oeste, en el Monte Quieto, una luz responde.'}]},
};

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const copyPose=p=>({focus:[...p.focus],offset:[...p.offset],zoom:p.zoom});
const pose=(focus,zoom,offset=GAME_CAMERA_OFFSET)=>({focus:[...focus],zoom,offset:[...offset]});
const key=(at,p)=>({at,pose:copyPose(p)});

// Interiors are framed as a whole diorama that only drifts with the player; exteriors follow.
export function gameplayCameraPose(areaId,player){
  if(areaId==='workshop')return pose([player[0]*.35,0,-5.5+player[2]*.15],1.2);
  return pose([player[0],1.5,player[2]-5.5],.93);
}

export function createCinematic(id,context,{reducedMotion=false}={}){
  const definition=CINEMATIC_DEFINITIONS[id];
  if(!definition||reducedMotion||context.areaId!==definition.area||!context.flags?.[id])return null;
  const player=context.player,puzzle=context.puzzle;
  if(!player||!puzzle||!context.start)return null;
  const game=context.game||gameplayCameraPose(context.areaId,player);
  let shots;
  if(id==='awaken'){
    if(!context.companion)return null;
    const companion=context.companion,points=[player,companion,puzzle],xs=points.map(p=>p[0]),zs=points.map(p=>p[2]);
    const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2,span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs));
    // Close enough to see the light come on under the glass.
    const close=pose([x,1.1+companion[1]*.5,z],clamp(20/(span+6),1.35,1.75),[0,18,25]);
    const reveal=pose([x*.8,1.6,z-.7],1.28,[0,16.5,25]);
    shots=[key(1,close),key(2.4,close),key(3.5,reveal),key(definition.returnAt,reveal)];
  }else if(id==='workshop'){
    const lamp=pose([puzzle[0],1.8,puzzle[2]],1.68),room=pose([.3,1.7,-1],1.22);
    shots=[key(1,lamp),key(2.3,lamp),key(3.5,room),key(definition.returnAt,room)];
  }else if(id==='gate'){
    // The latch, then the Ω over the open gate up close, then the valley it opens onto.
    const mechanism=pose([puzzle[0],2,puzzle[2]],1.45),gateZ=-(context.bounds?.[1]||32)*.32,sign=pose([0,4.8,gateZ-1.5],1.4,[0,15,25]),gateway=pose([0,4.3,gateZ],.94,[0,15,25]);
    shots=[key(.85,mechanism),key(1.4,mechanism),key(2.6,sign),key(3.4,sign),key(definition.returnAt,gateway)];
  }else if(id==='pump'){
    // The water travels: from the pump down the canal it really runs in (the Manantial's east bank,
    // the Calzada's canal, the Plaza's) to the fountain, 95 m south. Spring-local coordinates.
    const pump=pose([puzzle[0],1.7,puzzle[2]],1.48),water=pose([2,1.4,-3.8],1.62,[0,16,25]),fountain=pose([-12,1.2,92.2],1.35,[0,15,25]);
    const springCanal=pose([20,.6,6],1.12,[0,16,25]),roadCanal=pose([41.8,.6,47],1.05,[0,16,25]),plazaCanal=pose([10,.6,86],1.12,[0,16,25]);
    // Back from the Plaza by a cut to the wheel, not a 95 m flight over the treetops.
    shots=[key(1,pump),key(2,pump),key(2.9,water),key(3.3,water),key(4,springCanal),key(4.8,roadCanal),key(5.6,plazaCanal),key(6.3,fountain),key(definition.returnAt,fountain),key(definition.returnAt+.04,water)];
  }else if(id==='irrigation'){
    const panel=pose([puzzle[0],1.7,puzzle[2]],1.38),canal=pose([(context.bounds?.[0]||40)*.36,1.5,-(context.bounds?.[1]||36)*.28+6.1],1.28,[0,17,25]);
    shots=[key(.9,panel),key(1.5,panel),key(3.3,canal),key(definition.returnAt,canal)];
  }else if(id==='beacon_network'){
    const crown=pose([puzzle[0],2.2,puzzle[2]],1.55),gallery=pose([0,3,-3],1.03,[1.5,15,25]);
    shots=[key(1,crown),key(2.4,crown),key(3.5,gallery),key(definition.returnAt,gallery)];
  }else{
    const lens=pose([puzzle[0],3,puzzle[2]],1.55,[0,15,25]),rise=pose([0,7.8,-18],.93,[2.3,16,25]),beacon=pose([0,9,-14],.65,[7,13.5,24]);
    // The beam leaves the island: the camera follows it over the night lake and up the terraces,
    // whose lamps are lit again, before the bell answers from the Plaza.
    const lake=pose([-38,1.5,50],.82,[0,15,25]),terraces=pose([-80,2,98],.7,[0,17,25]);
    // Last, the Casa de Compuertas on the Monte Quieto, seen from the Manantial's side (from the east),
    // so the mountain rises behind its lit window instead of standing between it and the lens.
    const mount=pose([-92.2,2.6,211],1.05,[24,14,4]);
    shots=[key(1.3,lens),key(2.4,lens),key(4.5,rise),key(5.1,rise),key(7,beacon),key(7.6,beacon),key(9.6,lake),key(10.6,lake),key(12.8,terraces),key(13.5,terraces),key(15.3,mount),key(definition.returnAt,mount)];
  }
  return{id,duration:definition.duration,returnAt:definition.returnAt,captions:definition.captions.map(c=>({...c})),frames:[key(0,context.start),...shots,key(definition.duration,game)]};
}

export function sampleCinematic(timeline,elapsed){
  const time=clamp(Number.isFinite(elapsed)?elapsed:0,0,timeline.duration),done=time>=timeline.duration,returning=time>=timeline.returnAt;
  let index=1;while(index<timeline.frames.length-1&&timeline.frames[index].at<time)index++;
  const from=timeline.frames[index-1],to=timeline.frames[index],fraction=clamp((time-from.at)/(to.at-from.at),0,1),ease=fraction*fraction*(3-2*fraction);
  const blend=(a,b)=>a.map((value,i)=>value+(b[i]-value)*ease);
  const camera=done?copyPose(timeline.frames.at(-1).pose):fraction===1?copyPose(to.pose):fraction===0?copyPose(from.pose):{focus:blend(from.pose.focus,to.pose.focus),offset:blend(from.pose.offset,to.pose.offset),zoom:from.pose.zoom+(to.pose.zoom-from.pose.zoom)*ease};
  const caption=returning?'':timeline.captions.filter(c=>c.at<=time).at(-1)?.text||'';
  return{id:timeline.id,caption,returning,done,pose:camera};
}

export function returningCinematic(id,current,game,duration=.7){
  return{id,duration,returnAt:0,captions:[],frames:[key(0,current),key(duration,game)]};
}
