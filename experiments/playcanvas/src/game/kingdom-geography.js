import {AREAS} from './content.js';

// Metres in a shared, north-up territory. Workshops are interiors of real buildings.
export const KINGDOM = Object.freeze({
  portal:{x:0,z:44,region:'El umbral del valle'},
  plaza:{x:0,z:0,region:'Pueblo de Ohm'},
  workshop:{x:-13.25,z:3.8,region:'Pueblo de Ohm · interior'},
  road:{x:6,z:-48,region:'Calzada del agua'},
  spring:{x:0,z:-95,region:'Cabecera del agua'},
  castle:{x:-10,z:-142,region:'Loma de la Red'},
  terraces:{x:6,z:-192,region:'Ladera de los bancales'},
  lake:{x:18,z:-243,region:'Ribera de las Señales'},
  lighthouse:{x:30,z:-297,region:'Espigón del Faro'},
});
export const EXTERIORS=Object.keys(KINGDOM).filter(id=>id!=='workshop');
// The gate stands on the western embankment; the canal passes OUTSIDE its bastion.
export const ROAD_CANAL_X=19.8;
export const WATERCOURSE=[[22,110],[22,16],[22,-16],[25.8,-32],[25.8,-64],[20,-80],[20,-110],[18,-126],[18,-158],[28,-174],[28,-210],[28,-226],[34,-245]];
export function inKingdomWater(id,x,z,margin=0){
  if(!isExterior(id))return false;const [wx,wz]=toKingdom(id,[x,z]);
  for(let i=1;i<WATERCOURSE.length;i++){const a=WATERCOURSE[i-1],b=WATERCOURSE[i];if(wz>Math.max(a[1],b[1])||wz<Math.min(a[1],b[1]))continue;const t=(wz-a[1])/(b[1]-a[1]),cx=a[0]+(b[0]-a[0])*t;if(Math.abs(wx-cx)<2.3+margin)return true;}
  return false;
}
export const isExterior=id=>EXTERIORS.includes(id);
export const toKingdom=(id,[x,z])=>[KINGDOM[id].x+x,KINGDOM[id].z+z];
export const fromKingdom=(id,[x,z])=>[x-KINGDOM[id].x,z-KINGDOM[id].z];
export const geographicDelta=(from,to)=>[KINGDOM[to].x-KINGDOM[from].x,KINGDOM[to].z-KINGDOM[from].z];
export function passagesFor(id){return isExterior(id)?AREAS[id].exits.filter(e=>isExterior(e.target)):[];}
export function passageGeometry(id,target){
  if(!isExterior(id)||!isExterior(target))return null;
  const exit=AREAS[id].exits.find(e=>e.target===target),back=AREAS[target].exits.find(e=>e.target===id);
  if(!exit||!back)return null;
  const a=toKingdom(id,[exit.x,Math.sign(exit.z)*AREAS[id].bounds[1]/2]);
  const b=toKingdom(target,[back.x,Math.sign(back.z)*AREAS[target].bounds[1]/2]);
  return {id:[id,target].sort().join(':'),from:id,to:target,a,b,mid:[(a[0]+b[0])/2,(a[1]+b[1])/2],exit,back,bridge:[id,target].includes('lighthouse')};
}
export function corridorX(p,z){
  const t=Math.max(0,Math.min(1,(z-p.a[1])/(p.b[1]-p.a[1])));
  return p.a[0]+(p.b[0]-p.a[0])*t*t*(3-2*t);
}
export function inTravelCorridor(id,x,z,margin=0){
  const pos=toKingdom(id,[x,z]);
  return passagesFor(id).some(e=>{const p=passageGeometry(id,e.target);return pos[1]>=Math.min(p.a[1],p.b[1])-3&&pos[1]<=Math.max(p.a[1],p.b[1])+3&&Math.abs(pos[0]-corridorX(p,pos[1]))<2.05-margin;});
}
export function travelBounds(id){const [w,d]=AREAS[id].bounds;return isExterior(id)?[w+12,d+24]:[w,d];}
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
