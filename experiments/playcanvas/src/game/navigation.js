// Small deterministic navigation grid, with continuous collision checks to smooth
// the route. Obstacle w/d are half-extents, matching the world collision model.
import { isPositionClear, isSegmentClear } from './collision.js';

export function findPath(start,goal,bounds,obstacles=[],{radius=.36,cell=.6,isWalkable=()=>true}={}){
  const collision={radius,isWalkable};
  if(!Number.isFinite(cell)||cell<=0||!isPositionClear(start,bounds,obstacles,collision)||!goal?.every(Number.isFinite))return [];
  const margin=.6,minX=-bounds[0]/2+margin,minZ=-bounds[1]/2+margin,maxX=-minX,maxZ=-minZ;
  const cols=Math.ceil((maxX-minX)/cell)+1,rows=Math.ceil((maxZ-minZ)/cell)+1;
  const clear=(x,z)=>isPositionClear([x,z],bounds,obstacles,collision);
  const point=id=>[Math.min(maxX,minX+(id%cols)*cell),Math.min(maxZ,minZ+Math.floor(id/cols)*cell)];
  const index=(x,z)=>Math.max(0,Math.min(rows-1,Math.round((z-minZ)/cell)))*cols+Math.max(0,Math.min(cols-1,Math.round((x-minX)/cell)));
  const walkable=new Int8Array(cols*rows);
  const safe=id=>{if(id<0||id>=walkable.length)return false;if(!walkable[id])walkable[id]=clear(...point(id))?1:-1;return walkable[id]===1;};
  const segment=(a,b)=>isSegmentClear(a,b,bounds,obstacles,collision);
  const clamp=p=>[Math.max(minX,Math.min(maxX,p[0])),Math.max(minZ,Math.min(maxZ,p[1]))];
  start=[...start];goal=clamp(goal);
  if(segment(start,goal))return [goal];
  const nearest=(p,connected)=>{const usable=id=>safe(id)&&(!connected||segment(p,point(id)));const id=index(...p);if(usable(id))return id;const cx=id%cols,cz=Math.floor(id/cols);let best=-1,distance=Infinity;for(let r=1;r<12;r++){for(let z=Math.max(0,cz-r);z<=Math.min(rows-1,cz+r);z++)for(let x=Math.max(0,cx-r);x<=Math.min(cols-1,cx+r);x++){if(Math.abs(x-cx)!==r&&Math.abs(z-cz)!==r)continue;const id=z*cols+x;if(!usable(id))continue;const q=point(id),d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<distance){best=id;distance=d;}}if(best>=0)return best;}return -1;};
  const goalClear=clear(...goal),source=nearest(start,true);let target=nearest(goal,goalClear);if(source<0||target<0)return [];
  const g=new Float64Array(cols*rows);g.fill(Infinity);g[source]=0;
  const parent=new Int32Array(cols*rows);parent.fill(-1);
  const closed=new Uint8Array(cols*rows),heap=[];
  const heuristic=id=>Math.hypot(id%cols-target%cols,Math.floor(id/cols)-Math.floor(target/cols));
  const push=(id,score)=>{let i=heap.length;heap.push({id,score});while(i>0){const p=(i-1)>>1;if(heap[p].score<=score)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){const l=i*2+1,r=l+1;let n=i;if(l<heap.length&&heap[l].score<heap[n].score)n=l;if(r<heap.length&&heap[r].score<heap[n].score)n=r;if(n===i)break;[heap[i],heap[n]]=[heap[n],heap[i]];i=n;}}return top.id;};
  push(source,heuristic(source));
  let found=false,approach=source,approachDistance=Infinity;
  while(heap.length){const id=pop();if(closed[id])continue;if(id===target){found=true;break;}closed[id]=1;const x=id%cols,z=Math.floor(id/cols);
    if(!goalClear){const p=point(id),distance=Math.hypot(p[0]-goal[0],p[1]-goal[1]);if(distance<approachDistance){approach=id;approachDistance=distance;}}
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
      if((!dx&&!dz)||x+dx<0||x+dx>=cols||z+dz<0||z+dz>=rows)continue;
      const next=(z+dz)*cols+x+dx;if(closed[next]||!safe(next))continue;
      if(dx&&dz&&(!safe(z*cols+x+dx)||!safe((z+dz)*cols+x)))continue;
      if(!segment(point(id),point(next)))continue;
      const score=g[id]+(dx&&dz?Math.SQRT2:1);if(score>=g[next])continue;
      g[next]=score;parent[next]=id;push(next,score+heuristic(next));
    }
  }
  if(!found){if(goalClear)return [];target=approach;}
  const route=[];let at=target;while(at>=0){route.push(point(at));if(at===source)break;at=parent[at];}route.reverse();
  if(clear(...goal)&&segment(point(target),goal))route.push(goal);
  const smooth=[];let from=start,i=0;
  while(i<route.length){if(!segment(from,route[i]))return [];let last=i;for(let j=i+1;j<route.length;j++){if(segment(from,route[j]))last=j;else break;}if(Math.hypot(from[0]-route[last][0],from[1]-route[last][1])>1e-9)smooth.push(route[last]);from=route[last];i=last+1;}
  return smooth;
}
