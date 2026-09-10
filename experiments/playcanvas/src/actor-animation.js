export const HUMAN_ACTORS = ['player','edda','lumen','nereo','vega','consejera','yesca','marin','tala'];
export const ACTOR_ATLAS = {columns:5,rows:4,size:256,feet:244,content:224};

export function idleActor(direction=0){return{direction,frame:0,phase:0,moving:false};}

// Rows: front (+Z), right (+X), back (-Z), left (-X).
// Retain the current axis near diagonals so small path corrections do not flicker.
export function actorDirection(dx,dz,previous=0){
  const x=Math.abs(dx),z=Math.abs(dz);if(x+z<1e-8)return previous;
  let horizontal=previous===1||previous===3;
  if(x>z*1.2)horizontal=true;else if(z>x*1.2)horizontal=false;
  return horizontal?(dx>=0?1:3):(dz>=0?0:2);
}

export function advanceActor(previous,dx,dz,dt,{paused=false,reducedMotion=false}={}){
  const distance=Math.hypot(dx,dz),moving=!paused&&dt>0&&distance/dt>.015;
  if(!moving)return idleActor(previous.direction);
  const direction=actorDirection(dx,dz,previous.direction);
  if(reducedMotion)return{...idleActor(direction),moving:true};
  // Four walk poses per stride; travel advances the cycle, including click paths.
  const phase=previous.frame>0?(previous.phase+distance*2.2)%4:0;
  return{direction,frame:1+Math.floor(phase),phase,moving:true};
}

export function opaqueBounds(pixels,width,height){
  let minX=width,minY=height,maxX=-1,maxY=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]>48){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
  if(maxX<0)throw new Error('Actor atlas contains an empty pose');
  let footLeft=width,footRight=-1;
  for(let y=Math.floor(minY+(maxY-minY)*.75);y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(pixels[(y*width+x)*4+3]>48){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x);}
  return{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1,anchorX:(footLeft+footRight+1)/2};
}

export function actorFrameLayout(bounds){
  const left=b=>(b.anchorX??((b.x||0)+b.width/2))-(b.x||0);
  const extent=Math.max(...bounds.map(b=>Math.max(left(b),b.width-left(b))));
  const scale=Math.min((ACTOR_ATLAS.size-16)/(extent*2),ACTOR_ATLAS.content/Math.max(...bounds.map(b=>b.height)));
  return{scale,placements:bounds.map(b=>({x:ACTOR_ATLAS.size/2-left(b)*scale,y:ACTOR_ATLAS.feet-b.height*scale,width:b.width*scale,height:b.height*scale}))};
}
