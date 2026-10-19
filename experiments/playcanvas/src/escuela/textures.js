// Surfaces of the Instituto. The photographic sheets are reduced to grain (luminance,
// 55 % contrast, mean 0.95) so that the palette of each material decides its colour.
import {Texture,PIXELFORMAT_RGBA8,FILTER_LINEAR_MIPMAP_LINEAR,FILTER_LINEAR,ADDRESS_REPEAT,ADDRESS_CLAMP_TO_EDGE} from 'playcanvas';

const cache=new Map(),images=new Map();
function image(url){
  if(!images.has(url))images.set(url,new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('No se pudo cargar '+url));i.src=new URL('.'+url,document.baseURI).href;}));
  return images.get(url);
}
const canvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
function upload(app,name,source,{repeat=true,srgb=true}={}){
  const t=new Texture(app.graphicsDevice,{name,width:source.width,height:source.height,format:PIXELFORMAT_RGBA8,srgb,flipY:true,mipmaps:true,minFilter:FILTER_LINEAR_MIPMAP_LINEAR,magFilter:FILTER_LINEAR,addressU:repeat?ADDRESS_REPEAT:ADDRESS_CLAMP_TO_EDGE,addressV:repeat?ADDRESS_REPEAT:ADDRESS_CLAMP_TO_EDGE,anisotropy:8});
  t.setSource(source);cache.set(name,t);return t;
}
function toGrain(c,contrast=.55,mean=.95){
  const x=c.getContext('2d',{willReadFrequently:true}),d=x.getImageData(0,0,c.width,c.height),p=d.data;let sum=0;
  for(let i=0;i<p.length;i+=4)sum+=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)/255;
  const avg=sum/(p.length/4);
  for(let i=0;i<p.length;i+=4){const l=(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722)/255,v=Math.max(0,Math.min(1,(l-avg)*contrast+mean))*255;p[i]=p[i+1]=p[i+2]=v;p[i+3]=255;}
  x.putImageData(d,0,0);return c;
}
const CELLS={cobble:[0,0],stone:[1,0],wood:[2,0],slate:[0,1],grass:[1,1],copper:[2,1]};
export async function grain(app,name,{contrast=.55}={}){
  const key=`grain:${name}:${contrast}`;if(cache.has(key))return cache.get(key);
  const img=await image('/assets/materials.webp'),[cx,cy]=CELLS[name],w=img.width/3,h=img.height/2,c=canvas(512,512);
  c.getContext('2d').drawImage(img,cx*w+2,cy*h+2,w-4,h-4,0,0,512,512);
  return upload(app,key,toGrain(c,contrast));
}
/** A project picture as a texture (loaded once, on demand). */
export async function picture(app,url,{repeat=false}={}){
  const key='pic:'+url;if(cache.has(key))return cache.get(key);
  return upload(app,key,await image(url),{repeat});
}
export async function meadow(app){
  if(cache.has('meadow'))return cache.get('meadow');
  return upload(app,'meadow',await image('/assets/art-polish/meadow.webp'));
}
export async function tree(app,i){
  const key='tree'+i;if(cache.has(key))return cache.get(key);
  const img=await image('/assets/trees.webp'),w=img.width/3,h=img.height/2,c=canvas(Math.round(w),Math.round(h)),x=c.getContext('2d',{willReadFrequently:true});
  x.drawImage(img,(i%3)*w,Math.floor(i/3)*h,w,h,0,0,c.width,c.height);
  // Chroma key the magenta backdrop, as the game's crop() does.
  const d=x.getImageData(0,0,c.width,c.height),p=d.data;
  for(let k=0;k<p.length;k+=4){const m=Math.min(p[k],p[k+2])-p[k+1];if(m>50&&p[k]>95&&p[k+2]>90)p[k+3]=Math.min(p[k+3],Math.max(0,255-(m-50)*5));if(p[k+3]<30)p[k+3]=0;}
  x.putImageData(d,0,0);return upload(app,key,c,{repeat:false});
}
export function glow(app){
  if(cache.has('glow'))return cache.get('glow');
  const c=canvas(128,128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,1,64,64,64);
  g.addColorStop(0,'#ffffff');g.addColorStop(.25,'#ffffffa8');g.addColorStop(.6,'#ffffff2a');g.addColorStop(1,'#ffffff00');x.fillStyle=g;x.fillRect(0,0,128,128);
  return upload(app,'glow',c,{repeat:false});
}
// Soil strata for the sides of the island: bands, pebbles and roots, tileable in x.
export function earth(app){
  if(cache.has('earth'))return cache.get('earth');
  const c=canvas(512,512),x=c.getContext('2d');let seed=7;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const bands=[['#6d5a44',0],['#5c4a39',.12],['#735f48',.3],['#54443a',.46],['#665545',.62],['#4a3d34',.8],['#5a4a3e',1]];
  for(let i=0;i<bands.length-1;i++){x.fillStyle=bands[i][0];x.fillRect(0,bands[i][1]*512,512,(bands[i+1][1]-bands[i][1])*512+1);}
  for(let i=0;i<900;i++){const px=r()*512,py=r()*512,s=1+r()*4.5,v=90+r()*80;x.fillStyle=`rgba(${v},${v*.88},${v*.72},${.35+r()*.4})`;x.beginPath();x.ellipse(px,py,s*1.4,s,r()*3,0,Math.PI*2);x.fill();}
  x.strokeStyle='rgba(40,30,22,.5)';x.lineWidth=1.2;for(let i=0;i<30;i++){let px=r()*512,py=r()*80;x.beginPath();x.moveTo(px,py);for(let k=0;k<6;k++){px+=(r()-.5)*30;py+=10+r()*18;x.lineTo(px,py);}x.stroke();}
  return upload(app,'earth',toGrain(c,.9,.92));
}
export function sky(app){
  if(cache.has('sky'))return cache.get('sky');
  const c=canvas(4,256),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
  g.addColorStop(0,'#ffffff');g.addColorStop(.48,'#ffffff');g.addColorStop(1,'#ffffff');x.fillStyle=g;x.fillRect(0,0,4,256);
  return upload(app,'sky',c,{repeat:false});
}
/** Painted signs and plaques, drawn once on a canvas. */
export function sign(app,key,draw,w=512,h=128){
  if(cache.has('sign:'+key))return cache.get('sign:'+key);
  const c=canvas(w,h);draw(c.getContext('2d'),w,h);return upload(app,'sign:'+key,c,{repeat:false});
}
export function dynamicCanvas(app,key,w,h){
  const c=canvas(w,h),t=upload(app,'canvas:'+key,c,{repeat:false});return {canvas:c,ctx:c.getContext('2d'),texture:t,refresh(){t.setSource(c);}};
}

// Carved stone for sculpture: soft cloudy grain with faint veins, no masonry joints.
export function marble(app){
  if(cache.has('marble'))return cache.get('marble');
  const S=256,c=canvas(S,S),x=c.getContext('2d'),img=x.createImageData(S,S);let seed=11;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const grid=Array.from({length:17*17},r),n=(u,v,f)=>{u*=f/S*16;v*=f/S*16;const i=Math.floor(u)%16,j=Math.floor(v)%16,fu=u%1,fv=v%1,g=(a,b)=>grid[((b%16)*17)+(a%16)],s=t=>t*t*(3-2*t);
    return (g(i,j)*(1-s(fu))+g(i+1,j)*s(fu))*(1-s(fv))+(g(i,j+1)*(1-s(fu))+g(i+1,j+1)*s(fu))*s(fv);};
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const cloud=n(i,j,1)*.5+n(i,j,2)*.3+n(i,j,4)*.2,vein=Math.pow(1-Math.abs(Math.sin((i*.03+j*.012+cloud*3.2)*Math.PI)),18),v=.93+(cloud-.5)*.08-vein*.1,k=(j*S+i)*4;img.data[k]=img.data[k+1]=img.data[k+2]=Math.round(Math.min(1,v)*255);img.data[k+3]=255;}
  x.putImageData(img,0,0);return upload(app,'marble',c);
}
