import {Asset,Application,Texture,TextureAtlas,Sprite,Vec2,Vec4,FILTER_LINEAR,FILTER_LINEAR_MIPMAP_LINEAR,FILTER_NEAREST,ADDRESS_REPEAT,ADDRESS_CLAMP_TO_EDGE,PIXELFORMAT_RGBA8} from 'playcanvas';
import {opaqueBounds,actorFrameLayout,isolateFigure} from './game/actor-animation.js';
export const textures=new Map<string,Texture>();
const images=new Map<string,Promise<HTMLImageElement>>();
function image(url:string){if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('No se pudo cargar '+url));i.src=new URL('.'+url,document.baseURI).href;}));return images.get(url)!;}
function canvas(w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function crop(img:HTMLImageElement,col:number,row:number,cols:number,rows:number,key=false){
  const x=Math.round(col*img.width/cols),y=Math.round(row*img.height/rows),w=Math.round((col+1)*img.width/cols)-x,h=Math.round((row+1)*img.height/rows)-y,c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(img,x,y,w,h,0,0,w,h);
  if(key){const d=ctx.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const m=Math.min(p[i],p[i+2])-p[i+1];if(m>50&&p[i]>95&&p[i+2]>90)p[i+3]=Math.min(p[i+3],Math.max(0,255-(m-50)*5));if(p[i+3]<30)p[i+3]=0;}ctx.putImageData(d,0,0);}return c;
}
// pixel: HD-2D surfaces, nearest up close so every logical pixel stays crisp, mipmapped away.
function texture(app:Application,name:string,source:HTMLImageElement|HTMLCanvasElement,repeat=false,nearest=false,pixel=false){
  const t=new Texture(app.graphicsDevice,{name,width:source.width,height:source.height,format:PIXELFORMAT_RGBA8,srgb:true,flipY:!nearest,mipmaps:!nearest,minFilter:nearest?FILTER_LINEAR:FILTER_LINEAR_MIPMAP_LINEAR,magFilter:nearest||pixel?FILTER_NEAREST:FILTER_LINEAR,addressU:repeat?ADDRESS_REPEAT:ADDRESS_CLAMP_TO_EDGE,addressV:repeat?ADDRESS_REPEAT:ADDRESS_CLAMP_TO_EDGE,anisotropy:4});t.setSource(source);const asset=new Asset(name,'texture');asset.resource=t;asset.loaded=true;app.assets.add(asset);textures.set(name,t);return t;
}
function seeded(seed:string){let n=[...seed].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,17);return()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
// Leaf cards drawn like the source renderer's: crops, ground ferns and conifer tiers.
function foliage(){
  const rand=seeded('Ohmdal foliage'),s=256,c=canvas(s,s),x=c.getContext('2d')!,branches:number[][]=[];x.strokeStyle='#626b3d';x.lineWidth=2;
  for(let i=0;i<21;i++){const angle=i*2.4,r=35+rand()*66,bx=128+Math.cos(angle)*r,by=136+Math.sin(angle)*r;x.beginPath();x.moveTo(128,158);x.quadraticCurveTo(120+(bx-128)*.5,145+(by-145)*.5,bx,by);x.stroke();branches.push([bx,by]);}
  for(let i=0;i<640;i++){const b=branches[Math.floor(rand()*branches.length)],lx=b[0]+(rand()-.5)*55,ly=b[1]+(rand()-.5)*46,v=80+rand()*75;x.fillStyle=`rgb(${v+13},${v+34},${v*.63})`;x.save();x.translate(lx,ly);x.rotate(rand()*6);x.beginPath();x.ellipse(0,0,2.5+rand()*4.5,1.5+rand()*2.5,0,0,Math.PI*2);x.fill();if(i%4===0){x.strokeStyle='rgba(220,222,133,.36)';x.lineWidth=.8;x.beginPath();x.moveTo(-3,0);x.lineTo(3,0);x.stroke();}x.restore();}
  return c;
}
function fern(){
  const s=128,c=canvas(s,s),x=c.getContext('2d')!;x.strokeStyle='#536d43';x.lineWidth=2;
  for(let k=0;k<9;k++){const a=-Math.PI*.95+k*Math.PI*.115,endX=64+Math.cos(a)*55,endY=102+Math.sin(a)*90;x.beginPath();x.moveTo(64,120);x.quadraticCurveTo(64,82,endX,endY);x.stroke();for(let j=1;j<10;j++){const f=j/10,fx=64+(endX-64)*f,fy=120+(endY-120)*f,w=(1-f)*15;x.fillStyle=k%2?'#91a773':'#638c58';for(const side of [-1,1]){x.beginPath();x.ellipse(fx+side*w*.4,fy-2,w*.7,2,-side*.4,0,Math.PI*2);x.fill();}}}
  return c;
}
export async function surface(app:Application,name:string){
  if(textures.has(name))return textures.get(name)!;
  if(name==='glow'){const c=canvas(128,128),x=c.getContext('2d')!,g=x.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.22,'#ffffffb0');g.addColorStop(.65,'#ffffff30');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,128,128);return texture(app,name,c);}
  if(name==='foliage'||name==='fern')return texture(app,name,name==='foliage'?foliage():fern());
  // Pixel-art surfaces generated for HD-2D (art-src/hd2d → scripts/hd2d-textures.py).
  const pixelArt:Record<string,string>={cobble:'cobble',stone:'stone',wood:'wood',roof:'roof',ground:'meadow'};
  if(pixelArt[name])return texture(app,name,await image(`/assets/hd2d/${pixelArt[name]}.png`),true,false,true);
  if(name.startsWith('tree')){const i=Number(name.slice(4));return texture(app,name,crop(await image('/assets/trees.webp'),i%3,Math.floor(i/3),3,2,true));}
  if(name.startsWith('bank'))return texture(app,name,crop(await image('/assets/art-polish/waterside-plants.webp'),Number(name.slice(4)),0,3,1));
  if(name==='water'){const c=canvas(256,256),x=c.getContext('2d')!;x.fillStyle='#356e70';x.fillRect(0,0,256,256);for(let i=0;i<40;i++){const y=(i*61)%256,xx=(i*97)%256;x.strokeStyle=i%3?'#669b922a':'#b7c9a63a';x.lineWidth=1;x.beginPath();x.moveTo(xx,y);x.quadraticCurveTo(xx+9,y-2,xx+18,y);x.stroke();}return texture(app,name,c,true);}
  const urls:Record<string,string>={workshopRug:'workshop-rug.webp',kingdomBanner:'kingdom-banner.webp'};
  return texture(app,name,await image('/assets/art-polish/'+urls[name]),name==='ground');
}
// A wider window than the grid cell, keyed, keeping only this cell's figure (see isolateFigure).
function cropFigure(img:HTMLImageElement,col:number,row:number,cols:number,rows:number,margin=48){
  const x0=Math.round(col*img.width/cols),y0=Math.round(row*img.height/rows),x1=Math.round((col+1)*img.width/cols),y1=Math.round((row+1)*img.height/rows);
  const X0=Math.max(0,x0-margin),Y0=Math.max(0,y0-margin),w=Math.min(img.width,x1+margin)-X0,h=Math.min(img.height,y1+margin)-Y0;
  const c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(img,X0,Y0,w,h,0,0,w,h);
  const d=ctx.getImageData(0,0,w,h),p=d.data;
  for(let i=0;i<p.length;i+=4){const m=Math.min(p[i],p[i+2])-p[i+1];if(m>50&&p[i]>95&&p[i+2]>90)p[i+3]=Math.min(p[i+3],Math.max(0,255-(m-50)*5));if(p[i+3]<30)p[i+3]=0;}
  isolateFigure(p,w,h,{x0:x0-X0,x1:x1-X0,y0:y0-Y0,y1:y1-Y0});ctx.putImageData(d,0,0);return c;
}
export async function actorArt(app:Application,name:string){
  const ohm=name==='ohm',cols=ohm?6:5,rows=4,img=await image(ohm?'/assets/ohm.webp':`/assets/actors/${name}.webp`),tiles:HTMLCanvasElement[]=[],bounds:ReturnType<typeof opaqueBounds>[]=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const tile=ohm?crop(img,c,r,cols,rows,true):cropFigure(img,c,r,cols,rows);tiles.push(tile);bounds.push(opaqueBounds(tile.getContext('2d')!.getImageData(0,0,tile.width,tile.height).data,tile.width,tile.height));}
  const sheet=canvas(cols*256,rows*256),ctx=sheet.getContext('2d')!,layout=actorFrameLayout(bounds);
  tiles.forEach((tile,i)=>{const b=bounds[i],p=ohm?{x:128-b.width/2,y:244-b.height,width:b.width,height:b.height}:layout.placements[i];ctx.drawImage(tile,b.x,b.y,b.width,b.height,(i%cols)*256+p.x,Math.floor(i/cols)*256+p.y,p.width,p.height);});
  const atlas=new TextureAtlas();atlas.frames={};atlas.texture=texture(app,name+'-atlas',sheet,false,true);
  const keys=[];for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const key=String(row*cols+col);keys.push(key);atlas.setFrame(key,{rect:new Vec4(col*256,(3-row)*256,256,256),pivot:new Vec2(.5,12/256),border:new Vec4(0,0,0,0)});}
  const sprite=new Sprite(app.graphicsDevice,{atlas,pixelsPerUnit:256/(ohm?2.05:2.95),frameKeys:keys});const asset=new Asset(name,'sprite');asset.resource=sprite;asset.loaded=true;app.assets.add(asset);return sprite;
}


