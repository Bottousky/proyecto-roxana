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

// Character sheets are drawn loosely on a 5×4 grid: a head can rise into the cell above.
// Given a window wider than the cell, keep only the connected parts whose centre lies inside
// the cell (in window pixels), so no pose carries a neighbour's hair or loses its own.
export function isolateFigure(pixels,width,height,cell){
  const count=width*height,label=new Int32Array(count),keep=[0],stack=[];
  for(let start=0;start<count;start++){if(label[start]||pixels[start*4+3]<=48)continue;
    const id=keep.length;let n=0,sx=0,sy=0;label[start]=id;stack.push(start);
    while(stack.length){const i=stack.pop(),x=i%width,y=(i-x)/width;n++;sx+=x;sy+=y;
      if(x>0&&!label[i-1]&&pixels[(i-1)*4+3]>48){label[i-1]=id;stack.push(i-1);}
      if(x<width-1&&!label[i+1]&&pixels[(i+1)*4+3]>48){label[i+1]=id;stack.push(i+1);}
      if(y>0&&!label[i-width]&&pixels[(i-width)*4+3]>48){label[i-width]=id;stack.push(i-width);}
      if(y<height-1&&!label[i+width]&&pixels[(i+width)*4+3]>48){label[i+width]=id;stack.push(i+width);}}
    const cx=sx/n,cy=sy/n;keep.push(n>=12&&cx>=cell.x0&&cx<cell.x1&&cy>=cell.y0&&cy<cell.y1?1:0);}
  // Faint edges (alpha ≤ 48) survive only within two pixels of a kept figure.
  const kept=i=>label[i]&&keep[label[i]];
  for(let i=0;i<count;i++){if(label[i]){if(!keep[label[i]])pixels[i*4+3]=0;continue;}if(!pixels[i*4+3])continue;
    const x=i%width;let near=false;for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,j=i+dy*width+dx;if(xx>=0&&xx<width&&j>=0&&j<count&&kept(j)){near=true;break;}}
    if(!near)pixels[i*4+3]=0;}
  return pixels;
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
