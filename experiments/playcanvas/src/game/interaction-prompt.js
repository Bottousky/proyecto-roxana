const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

/** Keep the floating controls near their object without covering exits or HUD. */
export function placeInteractionPrompt({anchor,size,viewport,blocked=[]}){
  const width=Math.min(size.width,viewport.width-20),height=size.height,gap=10;
  const minX=width/2+10,maxX=viewport.width-width/2-10;
  const minY=Math.max(100,height+10),maxY=Math.max(minY,viewport.height-125);
  const original={x:clamp(anchor.x,minX,maxX),y:clamp(anchor.y,minY,maxY)};
  const overlaps=({x,y})=>blocked.filter(rect=>x+width/2>rect.left-gap&&x-width/2<rect.right+gap&&y>rect.top-gap&&y-height<rect.bottom+gap).length;
  const result=point=>({...point,shifted:Math.abs(point.x-original.x)>.5||Math.abs(point.y-original.y)>.5});
  if(!overlaps(original))return result(original);
  const xs=[...new Set([original.x,minX,maxX,...blocked.flatMap(rect=>[rect.left-gap-width/2,rect.right+gap+width/2])].map(x=>clamp(x,minX,maxX)))];
  const lateral=xs.map(x=>({x,y:original.y})).sort((a,b)=>Math.abs(a.x-original.x)-Math.abs(b.x-original.x));
  const freeSide=lateral.find(point=>!overlaps(point));
  if(freeSide)return result(freeSide);
  // Narrow viewports can require a vertical move after both sides are exhausted.
  const ys=[...new Set([original.y,minY,maxY,...blocked.flatMap(rect=>[rect.top-gap,rect.bottom+gap+height])].map(y=>clamp(y,minY,maxY)))];
  const candidates=ys.flatMap(y=>xs.map(x=>({x,y})));
  const distance=point=>Math.abs(point.x-original.x)+Math.abs(point.y-original.y)*2;
  candidates.sort((a,b)=>overlaps(a)-overlaps(b)||distance(a)-distance(b));
  return result(candidates[0]);
}
