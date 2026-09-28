import {AREAS} from './content.js';

// Metres in a shared, north-up territory. Workshops are interiors of real buildings.
export const KINGDOM = Object.freeze({
  portal:{x:-24,z:44,region:'El umbral del valle'},
  plaza:{x:0,z:0,region:'Pueblo de Ohm'},
  workshop:{x:-13.25,z:3.8,region:'Pueblo de Ohm · interior'},
  road:{x:34,z:-48,region:'Calzada del agua'},
  spring:{x:12,z:-95,region:'Cabecera del agua'},
  castle:{x:-40,z:-142,region:'Loma de la Red'},
  terraces:{x:-8,z:-192,region:'Ladera de los bancales'},
  lake:{x:38,z:-243,region:'Ribera de las Señales'},
  lighthouse:{x:76,z:-297,region:'Espigón del Faro'},
});
export const EXTERIORS=Object.keys(KINGDOM).filter(id=>id!=='workshop');
// The gate stands on the western embankment; the canal passes OUTSIDE its bastion.
export const ROAD_CANAL_X=19.8;
// Keep the canal on the east bank of each settlement, including the river mouth.
export const WATERCOURSE_BENDS=[[-8,110],[-8,56],[-8,32],[22,16],[22,-16],[53.8,-32],[53.8,-64],[32,-80],[32,-110],[-12,-126],[-12,-158],[14,-174],[14,-210],[54,-226],[54,-245]];
// A river never turns on a set square: every bend becomes an arc of up to 6 m radius. The
// rounded course is the one drawn AND the one that stops a walker, so both always agree.
// The Calzada builds its own straight canal between bends 5 and 6: those two stay exact.
function roundBends(points,radius=6,steps=5,exact=new Set([5,6])){
  const out=[points[0]];
  for(let i=1;i<points.length-1;i++){
    if(exact.has(i)){out.push(points[i]);continue;}
    const [a,b,c]=[points[i-1],points[i],points[i+1]],l1=Math.hypot(b[0]-a[0],b[1]-a[1]),l2=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(radius,l1*.45,l2*.45);
    const p=[b[0]+(a[0]-b[0])/l1*r,b[1]+(a[1]-b[1])/l1*r],q=[b[0]+(c[0]-b[0])/l2*r,b[1]+(c[1]-b[1])/l2*r];
    for(let k=0;k<=steps;k++){const t=k/steps,u=1-t;out.push([+(u*u*p[0]+2*u*t*b[0]+t*t*q[0]).toFixed(3),+(u*u*p[1]+2*u*t*b[1]+t*t*q[1]).toFixed(3)]);}
  }
  out.push(points.at(-1));return out;
}
export const WATERCOURSE=roundBends(WATERCOURSE_BENDS);
// The irrigation run begins at bend 6; the village canal ends at bend 5 (see kingdom-landscape).
export const WATERCOURSE_SPLIT=WATERCOURSE.findIndex(p=>p[0]===WATERCOURSE_BENDS[6][0]&&p[1]===WATERCOURSE_BENDS[6][1]);
export function inKingdomWater(id,x,z,margin=0){
  if(!isExterior(id))return false;const [wx,wz]=toKingdom(id,[x,z]);
  for(let i=1;i<WATERCOURSE.length;i++)if(segmentDistance([wx,wz],WATERCOURSE[i-1],WATERCOURSE[i])<2.3+margin)return true;
  return false;
}
export const isExterior=id=>EXTERIORS.includes(id);
export const toKingdom=(id,[x,z])=>[KINGDOM[id].x+x,KINGDOM[id].z+z];
export const fromKingdom=(id,[x,z])=>[x-KINGDOM[id].x,z-KINGDOM[id].z];
export const geographicDelta=(from,to)=>[KINGDOM[to].x-KINGDOM[from].x,KINGDOM[to].z-KINGDOM[from].z];
export function passagesFor(id){return isExterior(id)?AREAS[id].exits.filter(e=>isExterior(e.target)):[];}
const passageCache=new Map();
export function passageGeometry(id,target){
  const key=id+':'+target;if(passageCache.has(key))return passageCache.get(key);
  if(!isExterior(id)||!isExterior(target))return null;
  const exit=AREAS[id].exits.find(e=>e.target===target),back=AREAS[target].exits.find(e=>e.target===id);
  if(!exit||!back)return null;
  const a=toKingdom(id,[exit.x,Math.sign(exit.z)*AREAS[id].bounds[1]/2]);
  const b=toKingdom(target,[back.x,Math.sign(back.z)*AREAS[target].bounds[1]/2]);
  const p={id:[id,target].sort().join(':'),from:id,to:target,a,b,exit,back,bridge:[id,target].includes('lighthouse')};
  const z=(a[1]+b[1])/2;p.mid=[corridorX(p,z),z];
  p.points=Array.from({length:41},(_,i)=>{const z=a[1]+(b[1]-a[1])*i/40;return [corridorX(p,z),z];});
  p.routes=[{id:'main',width:4.1,points:p.points}];
  if(['plaza:portal','castle:terraces'].includes(p.id))p.routes.push({id:'woodland-loop',width:2.7,points:p.points.map(([x,z],i)=>[x-9*Math.sin(Math.PI*i/40)**2,z])});
  passageCache.set(key,p);return p;
}
export function corridorX(p,z){
  const t=Math.max(0,Math.min(1,(z-p.a[1])/(p.b[1]-p.a[1])));
  return p.a[0]+(p.b[0]-p.a[0])*t*t*(3-2*t);
}
function segmentDistance(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
export function inTravelCorridor(id,x,z,margin=0){
  const pos=toKingdom(id,[x,z]);
  return passagesFor(id).some(e=>passageGeometry(id,e.target).routes.some(route=>route.points.some((b,i)=>i>0&&segmentDistance(pos,route.points[i-1],b)<route.width/2-margin)));
}
export function travelBounds(id){const [w,d]=AREAS[id].bounds;if(!isExterior(id))return [w,d];const points=passagesFor(id).flatMap(e=>passageGeometry(id,e.target).routes.flatMap(route=>route.points.slice(0,23).map(p=>fromKingdom(id,p))));return [Math.max(w+12,...points.map(p=>Math.abs(p[0])*2+6)),Math.max(d+24,...points.map(p=>Math.abs(p[1])*2+6))];}
export function nextPassage(from,to){
  const queue=[[from,[]]],seen=new Set([from]);
  while(queue.length){const [id,path]=queue.shift();if(id===to)return path[0]||null;
    for(const exit of AREAS[id]?.exits||[])if(!seen.has(exit.target)){seen.add(exit.target);queue.push([exit.target,[...path,exit]]);}}
  return null;
}
export function travelBearing(state,position,objective){
  const exit=nextPassage(state.area,objective?.area);
  const target=exit||AREAS[state.area]?.objects.find(o=>o.id===objective?.object);
  if(!target)return {angle:0,label:'Explorar los alrededores'};
  const dx=target.x-position[0],dz=target.z-position[1];
  return {angle:Math.atan2(dx,-dz)*180/Math.PI,label:exit?`Hacia ${AREAS[exit.target].name}`:'Tu pregunta está en este lugar'};
}
