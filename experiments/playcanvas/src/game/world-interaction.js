import {findPath} from './navigation.js';
import {isSegmentClear} from './collision.js';

export function inInteractionReach(world,object,position=world.getPlayerPosition()) {
  if(Math.hypot(object.x-position[0],object.z-position[1])>=(object.radius||2.85))return false;
  // A person can be spoken to over a railing or a low fence (thin obstacles); levers and plaques cannot.
  const blockers=world.obstacles.filter(o=>!(object.character&&Math.min(o.w,o.d)<.15)&&(object.inhabitant||!(Math.abs(o.x-object.x)<=o.w+.001&&Math.abs(o.z-object.z)<=o.d+.001)));
  // This is a sight/contact line, not the player's body. A small skin admits
  // plaques beside masonry without opening a route through the masonry itself.
  return isSegmentClear(position,[object.x,object.z],world.bounds,blockers,{radius:.02,isWalkable:(x,z)=>world.walkableLand(x,z)});
}

/** Choose reachable ground around the target, rather than a point inside its mesh. */
export function approachInteraction(world,object) {
  const start=world.getPlayerPosition();
  if(inInteractionReach(world,object,start))return [];
  const reach=object.radius||2.85,candidates=[];
  for(const radius of [Math.min(1.5,reach-.25),reach-.2])for(let i=0;i<16;i++){
    const angle=i*Math.PI/8,point=[object.x+Math.cos(angle)*radius,object.z+Math.sin(angle)*radius];
    if(world.canStand(...point)&&inInteractionReach(world,object,point))candidates.push(point);
  }
  candidates.sort((a,b)=>Math.hypot(a[0]-start[0],a[1]-start[1])-Math.hypot(b[0]-start[0],b[1]-start[1]));
  for(const point of candidates){
    const route=findPath(start,point,world.bounds,world.obstacles,{radius:.34,isWalkable:(x,z)=>world.walkableLand(x,z)});
    if(route.length&&inInteractionReach(world,object,route.at(-1)))return route;
  }
  return null;
}
