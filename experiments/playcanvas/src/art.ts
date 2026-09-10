import {Asset,Application,Texture,TextureAtlas,Sprite,Vec2,Vec4,FILTER_LINEAR,FILTER_LINEAR_MIPMAP_LINEAR,FILTER_NEAREST,ADDRESS_REPEAT,ADDRESS_CLAMP_TO_EDGE,PIXELFORMAT_RGBA8} from 'playcanvas';
import {opaqueBounds,actorFrameLayout} from './game/actor-animation.js';
export const textures=new Map<string,Texture>();
const images=new Map<string,Promise<HTMLImageElement>>();
function image(url:string){if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('No se pudo cargar '+url));i.src=url;}));return images.get(url)!;}
function canvas(w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function crop(img:HTMLImageElement,col:number,row:number,cols:number,rows:number,key=false){
  const x=Math.round(col*img.width/cols),y=Math.round(row*img.height/rows),w=Math.round((col+1)*img.width/cols)-x,h=Math.round((row+1)*img.height/rows)-y,c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(img,x,y,w,h,0,0,w,h);
  if(key){const d=ctx.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const m=Math.min(p[i],p[i+2])-p[i+1];if(m>50&&p[i]>95&&p[i+2]>90)p[i+3]=Math.min(p[i+3],Math.max(0,255-(m-50)*5));if(p[i+3]<30)p[i+3]=0;}ctx.putImageData(d,0,0);}return c;
}
function texture(app:Application,name:string,source:HTMLImageElement|HTMLCanvasElement,repeat=false,nearest=false){
  const t=new Texture(app.graphicsDevice,{name,width:source.width,height:source.height,format:PIXELFORMAT_RGBA8,srgb:true,flipY:!nearest,mipmaps:!nearest,minFilter:nearest?FILTER_LINEAR:FILTER_LINEAR_MIPMAP_LINEAR,magFilter:nearest?FILTER_NEAREST:FILTER_LINEAR,addressU:repeat?ADDRESS_REPEAT:ADDRESS_CLAMP_TO_EDGE,addressV:repeat?ADDRESS_REPEAT:ADDRESS_CLAMP_TO_EDGE,anisotropy:4});t.setSource(source);const asset=new Asset(name,'texture');asset.resource=t;asset.loaded=true;app.assets.add(asset);textures.set(name,t);return t;
}
export async function surface(app:Application,name:string){
  if(textures.has(name))return textures.get(name)!;
  if(name==='glow'){const c=canvas(128,128),x=c.getContext('2d')!,g=x.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.22,'#ffffffb0');g.addColorStop(.65,'#ffffff30');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,128,128);return texture(app,name,c);}
  const cells:Record<string,number[]>={cobble:[0,0],stone:[1,0],wood:[2,0],roof:[0,1]};
  if(cells[name]){const [x,y]=cells[name];return texture(app,name,crop(await image('/assets/materials.png'),x,y,3,2),true);}
  if(name.startsWith('tree')){const i=Number(name.slice(4));return texture(app,name,crop(await image('/assets/trees.png'),i%3,Math.floor(i/3),3,2,true));}
  if(name.startsWith('bank'))return texture(app,name,crop(await image('/assets/art-polish/waterside-plants.png'),Number(name.slice(4)),0,3,1));
  if(name==='water'){const c=canvas(256,256),x=c.getContext('2d')!;x.fillStyle='#356e70';x.fillRect(0,0,256,256);for(let i=0;i<40;i++){const y=(i*61)%256,xx=(i*97)%256;x.strokeStyle=i%3?'#669b922a':'#b7c9a63a';x.lineWidth=1;x.beginPath();x.moveTo(xx,y);x.quadraticCurveTo(xx+9,y-2,xx+18,y);x.stroke();}return texture(app,name,c,true);}
  const urls:Record<string,string>={ground:'meadow.png',workshopRug:'workshop-rug.png',kingdomBanner:'kingdom-banner.png'};
  return texture(app,name,await image('/assets/art-polish/'+urls[name]),name==='ground');
}
export async function actorArt(app:Application,name:string){
  const ohm=name==='ohm',cols=ohm?6:5,rows=4,img=await image(ohm?'/assets/ohm.png':`/assets/actors/${name}.png`),tiles:HTMLCanvasElement[]=[],bounds:ReturnType<typeof opaqueBounds>[]=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const tile=crop(img,c,r,cols,rows,true);tiles.push(tile);bounds.push(opaqueBounds(tile.getContext('2d')!.getImageData(0,0,tile.width,tile.height).data,tile.width,tile.height));}
  const sheet=canvas(cols*256,rows*256),ctx=sheet.getContext('2d')!,layout=actorFrameLayout(bounds);
  tiles.forEach((tile,i)=>{const b=bounds[i],p=ohm?{x:128-b.width/2,y:244-b.height,width:b.width,height:b.height}:layout.placements[i];ctx.drawImage(tile,b.x,b.y,b.width,b.height,(i%cols)*256+p.x,Math.floor(i/cols)*256+p.y,p.width,p.height);});
  const atlas=new TextureAtlas();atlas.frames={};atlas.texture=texture(app,name+'-atlas',sheet,false,true);
  const keys=[];for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const key=String(row*cols+col);keys.push(key);atlas.setFrame(key,{rect:new Vec4(col*256,(3-row)*256,256,256),pivot:new Vec2(.5,12/256),border:new Vec4(0,0,0,0)});}
  const sprite=new Sprite(app.graphicsDevice,{atlas,pixelsPerUnit:256/(ohm?2.05:2.95),frameKeys:keys});const asset=new Asset(name,'sprite');asset.resource=sprite;asset.loaded=true;app.assets.add(asset);return sprite;
}


