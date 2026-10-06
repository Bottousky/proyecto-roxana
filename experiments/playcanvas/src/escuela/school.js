// The Instituto Roxana as a diorama: a floating block of land with the school around a
// patio. Everything here is geometry; lights, particles and sprites live in diorama.js.
// Axes: x east, z south (toward the default camera), y up. The island top is y = 0.
import {Kit} from './kit.js';
import {buildArtifacts,buildNoticeBoard,segment} from './artifacts.js';

export const ISLAND={w:92,d:74,r:8};
// Four workshops of equal weight flank the patio, one per Applied World. The patio side
// (`side`) holds the door; the portal stands against the outer wall.
export const TALLERES={
  electronica:{world:'ohmdal',x:-30,z:-4,side:'e',name:'TALLER DE ELECTRÓNICA',accent:'#2f5f5a'},
  fisica:{world:'physica',x:-30,z:13,side:'e',name:'TALLER DE FÍSICA',accent:'#6a3524'},
  programacion:{world:'bitland',x:30,z:-4,side:'w',name:'TALLER DE PROGRAMACIÓN',accent:'#2c2f5c'},
  matematica:{world:'arithmos',x:30,z:13,side:'w',name:'TALLER DE MATEMÁTICA',accent:'#2c4a2e'},
};
export const WORLD_ORDER=['ohmdal','physica','bitland','arithmos'];
// Footprints of the buildings. `cut` lists the walls that drop when the camera enters.
export const BUILDINGS={
  direccion:{x:0,z:-22,w:19,d:8,h:6.4,rise:3.1,roof:'slate',cut:['s']},
  trofeos:{x:-27,z:-23,w:14,d:9,h:6.2,rise:2.8,roof:'slate',cut:['s']},
  ...Object.fromEntries(Object.entries(TALLERES).map(([id,t])=>[id,{x:t.x,z:t.z,w:11,d:14,h:5.8,rise:3,roof:'slate',alongZ:true,cut:[t.side,'s']}])),
};
export const TOWER={x:0,z:-28.6,s:4.6,shaft:14};
export const AMPHI={x:27,z:-25,screenW:9.6,screenH:5.2};
export const FOUNTAIN={x:0,z:0,r:4.2};
export const LAMPS=[[-6.5,-4.5],[6.5,-4.5],[-6.5,5.5],[6.5,5.5],[-16,-13.5],[16,-13.5],[-19.5,-2],[19.5,-2],[-19.5,12],[19.5,12],[-15,17.5],[15,17.5],[-3.6,23],[3.6,23],[-3.6,30],[3.6,30]];
export const PLANTERS=[[-9,-7.5],[9,-7.5],[-9,8],[9,8]];
// Trophy stands: one tiered stand per world, twelve places each, front row first.
export const STANDS=(()=>{const b={x:-27,z:-23,w:14,d:9},out={};WORLD_ORDER.forEach((w,wi)=>{const cx=b.x-5.1+wi*3.4,back=b.z-b.d/2+.34+.35,list=[];
  for(let t=0;t<3;t++)for(let j=0;j<4;j++)list.push([cx-1.2+j*.8,.52+t*.42,back+(2-t)*.62+.3]);out[w]=list;});return out;})();

const T=.34; // wall thickness

function roundedRect(w,d,r,seg=5){
  const pts=[],cx=[w/2-r,-(w/2-r),-(w/2-r),w/2-r],cz=[d/2-r,d/2-r,-(d/2-r),-(d/2-r)];
  for(let c=0;c<4;c++)for(let i=0;i<=seg;i++){const a=(c*90+i*90/seg)*Math.PI/180;pts.push([cx[c]+Math.cos(a)*r,cz[c]+Math.sin(a)*r]);}
  return pts;
}
function noise(i,k=1){const s=Math.sin(i*12.9898+k*78.233)*43758.5453;return s-Math.floor(s);}

export function buildSchool(){
  const k=new Kit();
  Object.assign(k.uvScale,{plaster:.3,stone:.42,stoneDark:.42,cobble:.28,slate:.45,wood:.5,woodDark:.5,floor:.36,grass:.07,earth:.16,hedge:.5,bronze:.5,iron:.5});
  island(k);grounds(k);
  building(k,'direccion');direccionDetails(k);tower(k);
  building(k,'trofeos');trofeosDetails(k);
  for(const id of Object.keys(TALLERES)){building(k,id);taller(k,id);}
  amphitheatre(k);fountain(k);patio(k);gate(k);buildArtifacts(k);buildNoticeBoard(k);
  return k;
}

// ── Land ────────────────────────────────────────────────────────────────────────
function island(k){
  // The school's lawn: a raised terrace on open land (landscape.js builds the country
  // around it). The paths and patio sit a few centimetres above the grass.
  const out=roundedRect(ISLAND.w,ISLAND.d,ISLAND.r),n=out.length;
  for(let i=0;i<n;i++){const a=out[i],b=out[(i+1)%n];k.tri('ground','grass',[0,0,0],[b[0],0,b[1]],[a[0],0,a[1]],{ao:false});}
  // A turf lip down to the surrounding land, so the terrace edge reads as a low bank.
  for(let i=0;i<n;i++){
    const i2=(i+1)%n,P=(idx,y,grow)=>{const p=out[idx],l=Math.hypot(p[0],p[1])||1;return [p[0]+p[0]/l*grow,y,p[1]+p[1]/l*grow];};
    k.facingQuad('ground','turf',P(i,0,0),P(i,-.62,.5),P(i2,-.62,.5),P(i2,0,0),[(out[i][0]+out[i2][0]),0,(out[i][1]+out[i2][1])],{ao:false,tone:[.9,.92,.86]});
  }
}

function grounds(k){
  // Patio, main path, branches. Thin cobble slabs over the grass.
  const slab=(x,z,w,d,mat='cobble')=>k.box('static',mat,{x,z,y:0,w,d,h:.07,skip:['bottom'],ao:false,jitter:.02});
  slab(0,1,42,34);             // patio
  slab(0,26,6.4,16);           // path to the gate
  for(const [id,t] of Object.entries(TALLERES))slab(t.x+(t.side==='e'?1:-1)*6.6,t.z,3,4.4); // workshop doorsteps
  slab(-27,-17,3.4,3);slab(-24,-16.2,7,2.6); // to the Sala de Trofeos
  slab(0,-16.8,7,2.2);         // to the Dirección
  slab(24,-14.6,9,2.4);        // to the Anfiteatro
  // Stone kerb around the patio.
  for(const [x,z,w,d] of [[-21.2,1,.5,34],[21.2,1,.5,34]])k.box('static','stone',{x,z,w,d,h:.22,jitter:.03});
  // Perimeter: low wall south with hedges, hedges elsewhere.
  for(const [x0,x1] of [[-43,-3.4],[3.4,43]]){const w=x1-x0;k.box('static','stone',{x:(x0+x1)/2,z:34.4,w,d:.7,h:.9,jitter:.03});k.box('static','stone',{x:(x0+x1)/2,z:34.4,y:.9,w:w+.1,d:.85,h:.16,jitter:0});}
  for(const [x,z,w,d] of [[-44.6,0,.9,60],[44.6,0,.9,60],[-24,-35.4,40,.9],[24,-35.4,40,.9]])hedge(k,x,z,w,d);
}
function hedge(k,x,z,w,d){
  const n=Math.max(1,Math.round(Math.max(w,d)/1.6));
  for(let i=0;i<n;i++){const t=(i+.5)/n-.5,px=x+(w>d?t*w:0),pz=z+(d>w?t*d:0),s=.85+noise(i+x,z)*.35;
    k.lathe('static','hedge',[[0,0],[.95*s,.1],[1.05*s,.8],[.75*s,1.35],[0,1.5]],{x:px,z:pz,seg:7,phase:noise(i,x),tone:[.95+noise(i,2)*.1,1,.95]});}
}

// ── Buildings ───────────────────────────────────────────────────────────────────
function wallPart(id,side){return `${id}:wall:${side}`;}
function building(k,id){
  const b=BUILDINGS[id],{x,z,w,d,h}=b,hw=w/2,hd=d/2;
  k.box(`${id}:floor`,'floor',{x,z,w:w-T,d:d-T,y:0,h:.12,ao:false,jitter:0});
  const sides={
    n:{x,z:z-hd+T/2,w,d:T},s:{x,z:z+hd-T/2,w,d:T},
    w:{x:x-hw+T/2,z,w:T,d:d-2*T},e:{x:x+hw-T/2,z,w:T,d:d-2*T},
  };
  for(const [side,s] of Object.entries(sides)){
    const part=wallPart(id,side);
    k.box(part,'plaster',{...s,y:0,h,jitter:.03});
    // Stone plinth course and cornice.
    const grow=(v,axis)=>v+(axis?.16:0);
    k.box(part,'stoneDark',{x:s.x,z:s.z,w:grow(s.w,s.w<1),d:grow(s.d,s.d<1),y:0,h:.55,jitter:.02});
    k.box(part,'stone',{x:s.x,z:s.z,w:s.w+(s.w<1?.24:.24),d:s.d+(s.d<1?.24:.24),y:h-.32,h:.32,jitter:.02});
  }
  // Quoins at the corners.
  for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
    const side=cz>0?'s':'n';
    for(let y=.55,i=0;y<h-.4;y+=.5,i++){const long=i%2?.9:.55;k.box(wallPart(id,side),'stone',{x:x+cx*(hw-long/2+.06),z:z+cz*(hd-.2),w:long,d:.5,y,h:.46,jitter:.05});}
  }
  // Roof and its gables lift together.
  k.gable(`${id}:roof`,b.roof,{x,z,w,d,y:h,rise:b.rise,alongZ:b.alongZ,ends:'plaster',overhang:.55});
  if(b.alongZ){k.box(`${id}:roof`,'stone',{x,z,w:.5,d:d+1.2,y:h+b.rise-.05,h:.22,jitter:0});}
  else k.box(`${id}:roof`,'stone',{x,z,w:w+1.2,d:.5,y:h+b.rise-.05,h:.22,jitter:0});
}
/** A window on a wall side, `at` measured along the wall from its centre. */
function windowOn(k,id,side,at,{y=1.25,w=1.25,h=2.1,glass}={}){
  const b=BUILDINGS[id],part=wallPart(id,side),out=.03,g=glass||`glass@${id}`;
  const horiz=side==='n'||side==='s',sign=side==='s'||side==='e'?1:-1;
  const px=horiz?b.x+at:b.x+sign*(b.w/2+out),pz=horiz?b.z+sign*(b.d/2+out):b.z+at,ry=horiz?(sign>0?0:180):(sign>0?90:-90);
  k.panel(part,g,{x:px,y:y+h/2,z:pz,w,h,ry});
  const fw=horiz?w+.3:.18,fd=horiz?.18:w+.3,ox=horiz?0:sign*.05,oz=horiz?sign*.05:0;
  k.box(part,'stone',{x:px+ox,z:pz+oz,y:y-.18,w:horiz?w+.5:.3,d:horiz?.3:w+.5,h:.18,jitter:.02}); // sill
  k.box(part,'stone',{x:px+ox,z:pz+oz,y:y+h,w:horiz?w+.4:.26,d:horiz?.26:w+.4,h:.26,jitter:.02});  // lintel
  k.box(part,'woodDark',{x:px+ox,z:pz+oz,y:y+h/2-.04,w:fw,d:fd,h:.08,jitter:0});                     // transom
  k.box(part,'woodDark',{x:px+ox,z:pz+oz,y,w:horiz?.08:.12,d:horiz?.12:.08,h,jitter:0});           // mullion
  return {x:px,y:y+h/2,z:pz};
}
function doorOn(k,id,side,at,{w=1.6,h=2.7,mat='woodDark',steps=true,part=null}={}){
  const b=BUILDINGS[id],p=part||wallPart(id,side),horiz=side==='n'||side==='s',sign=side==='s'||side==='e'?1:-1;
  const px=horiz?b.x+at:b.x+sign*(b.w/2+.04),pz=horiz?b.z+sign*(b.d/2+.04):b.z+at,ry=horiz?(sign>0?0:180):(sign>0?90:-90);
  k.panel(p,mat,{x:px,y:h/2+.12,z:pz,w,h,ry});
  k.arch(p,'stone',{x:px,y:h+.12-w/2+.02,z:pz+(horiz?sign*.08:0),r:w/2+.02,thick:.32,depth:.2,seg:7,ry});
  for(const s of [-1,1])k.box(p,'stone',{x:px+(horiz?s*(w/2+.16):sign*.08),z:pz+(horiz?sign*.08:s*(w/2+.16)),y:0,w:horiz?.32:.2,d:horiz?.2:.32,h:h-w/2+.14,jitter:.02});
  if(steps)for(let i=0;i<2;i++)k.box('static','stone',{x:px+(horiz?0:sign*(.45+i*.35)),z:pz+(horiz?sign*(.45+i*.35):0),y:0,w:horiz?w+1.1-i*.3:.4,d:horiz?.4:w+1.1-i*.3,h:.22-i*.09,jitter:.03});
  return {x:px,z:pz};
}
function plaque(k,part,mat,{x,y,z,w=3.2,h=.7,ry=0}){
  k.panel(part,mat,{x,y,z,w,h,ry});
}

function direccionDetails(k){
  const id='direccion',b=BUILDINGS[id],fz=b.z+b.d/2;
  for(const at of [-7,-4.6,4.6,7])windowOn(k,id,'s',at);
  for(const at of [-6.5,-2.2,2.2,6.5])windowOn(k,id,'n',at);
  windowOn(k,id,'e',0);windowOn(k,id,'w',0);
  doorOn(k,id,'s',0,{w:1.8,h:3});
  plaque(k,wallPart(id,'s'),'sign:direccion',{x:0,y:4.4,z:fz+.06,w:3.6,h:.62});
  // Portico: four columns and a pediment over the entrance.
  const pz=fz+1.6;
  k.box('static','stone',{x:0,z:pz,w:6.4,d:3.4,y:0,h:.3,jitter:.02});
  for(const cx of [-2.6,-.9,.9,2.6])column(k,'direccion:portico',cx,pz+1.2,3.6);
  k.box('direccion:portico','stone',{x:0,z:pz+.1,w:6.6,d:3.3,y:3.9,h:.42,jitter:.02});
  k.gable('direccion:portico','slate',{x:0,z:pz+.1,w:6.8,d:3.3,y:4.32,rise:1.2,alongZ:true,ends:'stone',overhang:.2});
  // Banners on the facade (hidden until the Lago is reconnected).
  for(const bx of [-5.8,5.8]){k.panel('banners','banner',{x:bx,y:3.7,z:fz+.12,w:1.3,h:2.2});k.box('banners','bronze',{x:bx,z:fz+.18,y:4.85,w:1.6,d:.08,h:.08,jitter:0});}
  // Interior: the office of the Dirección.
  const I='direccion:interior',ix=b.x,iz=b.z;
  k.box(I,'rug',{x:ix,z:iz+.5,w:7,d:4,y:.12,h:.02,ao:false,jitter:0});
  // Desk with a green lamp and papers.
  k.box(I,'wood',{x:ix+3.5,z:iz-.6,w:3,d:1.3,y:.85,h:.12,jitter:.02});
  for(const [dx,dz] of [[-1.35,-.5],[1.35,-.5],[-1.35,.5],[1.35,.5]])k.box(I,'woodDark',{x:ix+3.5+dx,z:iz-.6+dz,w:.12,d:.12,y:0,h:.85,jitter:0});
  k.box(I,'woodDark',{x:ix+2.55,z:iz-.6,w:.95,d:1.2,y:0,h:.85,jitter:.02});
  k.cylinder(I,'bronze',{x:ix+4.4,z:iz-.9,y:.97,r:.12,h:.45,seg:8});k.lathe(I,'lampShade',[[.3,0],[.12,.2],[0,.22]],{x:ix+4.4,z:iz-.9,y:1.35,seg:10});
  for(let i=0;i<4;i++)k.box(I,'paint',{x:ix+3.2+i*.05,z:iz-.5+i*.03,w:.6,d:.8,y:.97+i*.012,h:.01,tone:[.95,.92,.84],jitter:0,ao:false});
  chair(k,I,ix+3.5,iz-1.7,0);chair(k,I,ix+3.2,iz+.6,180);chair(k,I,ix+4.2,iz+.6,180);
  // Bookshelves along the north wall.
  for(const sx of [-7.2,-4.8,-2.4]){shelf(k,I,ix+sx,iz-b.d/2+.6,2.2,3.2);}
  // The Bitácora on its lectern, and Roxana's portrait.
  k.box(I,'woodDark',{x:ix-2.2,z:iz+.8,w:.5,d:.5,y:0,h:1,jitter:0});k.box(I,'wood',{x:ix-2.2,z:iz+.8,w:.9,d:.7,y:1,h:.1,rx:-18,jitter:0});
  k.box('bitacora','bitacora',{x:ix-2.2,z:iz+.82,w:.72,d:.52,y:1.14,h:.06,rx:-18,jitter:0,ao:false});
  k.box(I,'bronze',{x:ix+.4,z:iz-b.d/2+T+.02,y:2.35,w:2.02,d:.04,h:2.5,jitter:0});
  k.panel(I,'portrait',{x:ix+.4,y:3.6,z:iz-b.d/2+T+.07,w:1.7,h:2.2});
  k.lathe(I,'globe',[[0,0],[.3,.06],[.42,.35],[.3,.64],[0,.7]],{x:ix-5.6,z:iz+1.2,y:.9,seg:12});
  k.cylinder(I,'woodDark',{x:ix-5.6,z:iz+1.2,r:.05,h:.9,seg:6});k.cylinder(I,'woodDark',{x:ix-5.6,z:iz+1.2,r:.35,h:.08,seg:8});
  for(let i=0;i<3;i++)k.box(I,'iron',{x:ix-7.6,z:iz+1+i*.02,w:.9,d:.7,y:0,h:1.45-i*0,jitter:.03}) ;
  k.box(I,'woodDark',{x:ix-7.6,z:iz+2.2,w:.9,d:.7,y:0,h:1.1,jitter:.03});
}
function column(k,part,x,z,h,mat='stone'){
  k.box(part,mat,{x,z,w:.62,d:.62,y:0,h:.3,jitter:.02});
  k.cylinder(part,mat,{x,z,y:.3,r:.24,r2:.2,h:h-.62,seg:10,cap:false});
  k.box(part,mat,{x,z,w:.6,d:.6,y:h-.32,h:.32,jitter:.02});
}
function chair(k,part,x,z,ry){
  const r=ry*Math.PI/180,off=(dx,dz)=>[x+dx*Math.cos(r)+dz*Math.sin(r),z-dx*Math.sin(r)+dz*Math.cos(r)];
  const [sx,sz]=off(0,0),[bx,bz]=off(0,-.26);
  k.box(part,'wood',{x:sx,z:sz,w:.55,d:.55,y:.46,h:.07,ry,jitter:.04});k.box(part,'wood',{x:bx,z:bz,w:.55,d:.07,y:.53,h:.55,ry,jitter:.04});
  for(const [dx,dz] of [[-.23,-.23],[.23,-.23],[-.23,.23],[.23,.23]]){const [lx,lz]=off(dx,dz);k.box(part,'woodDark',{x:lx,z:lz,w:.06,d:.06,y:0,h:.46,ry,jitter:0});}
}
const BOOK_TONES=[[.55,.22,.18],[.2,.32,.42],[.3,.42,.26],[.62,.5,.28],[.4,.26,.36],[.72,.66,.52]];
/** Bookcase with its open side toward +z, or toward +x when `east`. */
function shelf(k,part,x,z,w,h,east=false){
  const B=(o)=>{const {dx=0,dz=0,...r}=o;return east?{...r,x:x+dz,z:z+dx,w:r.d,d:r.w}:{...r,x:x+dx,z:z+dz};};
  k.box(part,'woodDark',{...B({dx:0,dz:0,w,d:.45,y:0,h}),skip:[east?'e':'s'],jitter:.02});
  for(let row=0;row<4;row++){const y=.18+row*(h-.3)/4;k.box(part,'wood',{...B({dz:.03,w:w-.12,d:.42,y,h:.05}),jitter:0});
    let bx=-w/2+.14,i=row*7;while(bx<w/2-.2){const bw=.07+noise(i,2)*.08,bh=.42+noise(i,3)*.25;k.box(part,'paint',{...B({dx:bx+bw/2,dz:.05,w:bw,d:.3,y:y+.05,h:bh}),tone:BOOK_TONES[i%BOOK_TONES.length],jitter:.1,ao:false});bx+=bw+.012;i++;}}
}

function tower(k){
  const {x,z,s,shaft}=TOWER,P='tower';
  k.box(P,'stoneDark',{x,z,w:s+.4,d:s+.4,y:0,h:1,jitter:.02});
  k.box(P,'plaster',{x,z,w:s,d:s,y:1,h:shaft-1,jitter:.02});
  for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1]])for(let y=1,i=0;y<shaft-.4;y+=.55,i++){const l=i%2?.8:.5;k.box(P,'stone',{x:x+cx*(s/2-l/2+.05),z:z+cz*(s/2-.22),w:l,d:.5,y,h:.5,jitter:.05});}
  for(const y of [7.6,shaft-.4])k.box(P,'stone',{x,z,w:s+.4,d:s+.4,y,h:.4,jitter:.02});
  // The clock stands still: its story belongs to Bitland.
  k.box(P,'stone',{x,z:z+s/2+.02,y:9.3,w:3,d:.14,h:3,jitter:0});
  k.panel(P,'clock',{x,y:10.8,z:z+s/2+.1,w:2.5,h:2.5});
  const cy=10.8,cz=z+s/2+.16;
  k.pivot('clock:hour',x,cy,cz);k.box('clock:hour','iron',{x:x,z:cz,y:cy,w:.12,d:.05,h:.72,jitter:0,ao:false});
  k.pivot('clock:minute',x,cy,cz+.04);k.box('clock:minute','iron',{x:x,z:cz+.04,y:cy,w:.08,d:.05,h:1.05,jitter:0,ao:false});
  // Belfry: four columns around the bell, which swings when it rings again.
  const ly=shaft;
  k.box(P,'stone',{x,z,w:s-.4,d:s-.4,y:ly,h:.3,jitter:0});
  for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1]])k.box(P,'stone',{x:x+cx*(s/2-.55),z:z+cz*(s/2-.55),w:.42,d:.42,y:ly+.3,h:2.6,jitter:.02});
  k.box(P,'stone',{x,z,w:s-.2,d:s-.2,y:ly+2.9,h:.36,jitter:0});
  k.box(P,'woodDark',{x,z,w:s-.9,d:.22,y:ly+2.62,h:.22,jitter:0});
  k.pivot('bell',x,ly+2.62,z);
  k.lathe('bell','bronze',[[0,-1.36],[.55,-1.4],[.66,-1.5],[.62,-1.3],[.46,-.9],[.36,-.4],[.24,-.14],[0,-.08]],{x,z,y:ly+2.62,seg:14,smooth:true});
  k.lathe('bell','iron',[[0,-1.44],[.08,-1.4],[.08,-1.25],[0,-1.2]],{x,z,y:ly+2.62,seg:6});
  // The lantern crowns the tower above the belfry, then a short spire.
  const lt=ly+3.26;
  k.box(P,'stone',{x,z,w:2.4,d:2.4,y:lt,h:.3,jitter:0});
  for(const [cx,cz] of [[-1,-1],[1,-1],[1,1],[-1,1]])k.box(P,'bronze',{x:x+cx*.95,z:z+cz*.95,w:.14,d:.14,y:lt+.3,h:1.9,jitter:0});
  k.lathe('lantern','lanternGlass',[[0,0],[.82,0],[.9,.5],[.9,1.4],[.66,1.85],[0,1.95]],{x,z,y:lt+.3,seg:8});
  k.lathe(P,'slate',[[1.55,0],[1.3,.2],[.12,2.6],[0,2.75]],{x,z,y:lt+2.2,seg:8,phase:Math.PI/8,tone:[.95,.95,1]});
  k.cylinder(P,'bronze',{x,z,y:lt+4.8,r:.05,h:1.2,seg:5});k.lathe(P,'bronze',[[0,0],[.16,.1],[0,.26]],{x,z,y:lt+5.3,seg:6});
}

// ── The four workshops ───────────────────────────────────────────────────────────
// Local frame of a workshop: `u` runs from the portal wall (−) to the patio door (+), `v` along z.
function frame(id){
  const b=BUILDINGS[id],t=TALLERES[id],s=t.side==='e'?1:-1;
  return {b,t,s,door:t.side,outer:t.side==='e'?'w':'e',P:(u,v)=>[b.x+s*u,b.z+v],ry:s>0?90:-90,half:b.w/2};
}
function taller(k,id){
  const f=frame(id),{b,t,s,door,outer,P,ry,half}=f,I=`${id}:interior`;
  for(const at of [-5,-2.9,2.9,5])windowOn(k,id,door,at,{h:2.4,w:1.3});
  for(const at of [-4.6,4.6])windowOn(k,id,outer,at,{h:2.4,w:1.3});
  windowOn(k,id,'s',-2.4);windowOn(k,id,'s',2.4);windowOn(k,id,'n',-2.4);windowOn(k,id,'n',2.4);
  doorOn(k,id,door,0,{w:2.2,h:3});
  const [fx]=P(half+.07,0);
  plaque(k,wallPart(id,door),`sign:${id}`,{x:fx,y:4.55,z:b.z,w:4.6,h:.62,ry});
  // The world's banners flank the door.
  for(const v of [-1.9,1.9]){const [bx]=P(half+.1,0);k.panel(wallPart(id,door),`banner:${t.world}`,{x:bx,y:3.2,z:b.z+v,w:1,h:1.6,ry});}
  k.box(`${id}:roof`,'stoneDark',{x:P(-2.4,0)[0],z:b.z+5.3,w:1,d:1,y:b.h+.6,h:3.2,jitter:.03});
  // The world's medallion on the south gable, readable from the whole patio.
  k.panel(`${id}:roof`,`medal:${t.world}`,{x:b.x,y:b.h+1.1,z:b.z+b.d/2+.06,w:1.7,h:1.7});
  roofAccent(k,id,f);
  // Each world has its own way in, against the outer wall: only Ohmdal is a portal.
  ({ohmdal:portalEntry,bitland:vrEntry,physica:tankEntry,arithmos:boardEntry})[t.world](k,id,I,f);
  ({electronica:electronicaRoom,fisica:fisicaRoom,programacion:programacionRoom,matematica:matematicaRoom})[id](k,id,I,f);
}
/**
 * Each workshop crowns its ridge with something of its discipline, so the four roofs read apart from the
 * master camera while the architecture stays common. Static pieces ride on the roof; turning ones on `:spin`.
 */
function roofAccent(k,id,{b,t}){
  const R=`${id}:roof`,top=b.h+b.rise+.15,x=b.x;
  if(t.world==='ohmdal'){
    // A copper lightning rod with a glass bulb that lights when the workshop's lamps work again.
    const z=b.z-4.6;k.box(R,'bronze',{x,z,y:top-.05,w:.5,d:.5,h:.12,jitter:0});k.cylinder(R,'copper',{x,z,y:top,r:.06,r2:.045,h:2.1,seg:8});
    for(const y of [.5,1.05])k.lathe(R,'ceramic',[[0,0],[.12,.02],[.14,.08],[.1,.12],[0,.13]],{x,z,y:top+y,seg:10,smooth:true,ao:false});
    k.lathe(`bulb:${id}`,'bulbOhm',[[0,0],[.12,.03],[.22,.2],[.2,.36],[.1,.44],[0,.46]],{x,z,y:top+2.05,seg:12,smooth:true,ao:false});
    k.lathe(R,'copper',[[.08,0],[.1,.05],[0,.08]],{x,z,y:top+2.5,seg:8});
    // Its down conductor follows the slope to the eave.
    segment(k,R,'copper',[x,top,z],[x+b.w/2+.3,b.h+.15,z],.025);
  }else if(t.world==='physica'){
    // An anemometer: the wind is measured, not guessed.
    // Sized for the master camera: it has to read as a silhouette from across the fields.
    const z=b.z+3.2;k.box(R,'stone',{x,z,y:top-.05,w:.9,d:.9,h:.25,jitter:0});k.cylinder(R,'iron',{x,z,y:top+.15,r:.09,r2:.07,h:2.6,seg:8});
    const y=top+2.8;k.pivot(`${id}:spin`,x,y,z);k.cylinder(`${id}:spin`,'bronze',{x,z,y:y-.12,r:.18,h:.26,seg:10});
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2,ex=x+Math.cos(a)*1.4,ez=z+Math.sin(a)*1.4;segment(k,`${id}:spin`,'iron',[x,y,z],[ex,y,ez],.04);
      k.lathe(`${id}:spin`,'bronze',[[0,-.32],[.24,-.24],[.34,0],[.3,.04]],{x:ex,z:ez,y,rz:90,ry:-a*57.3,seg:12,smooth:true,ao:false});}
    k.box(R,'iron',{x,z,y:top+1.9,w:1.6,d:.07,h:.07,jitter:0,ao:false});k.box(R,'iron',{x,z,y:top+1.9,w:.07,d:1.6,h:.07,jitter:0,ao:false});
  }else if(t.world==='bitland'){
    // A ridge lantern of glass: the city in the chip below spills a contained cyan light through it.
    const z0=b.z-5,z1=b.z+2.2,zc=(z0+z1)/2,L=z1-z0;
    k.box(R,'bronze',{x,z:zc,y:top-.12,w:1.4,d:L+.3,h:.14,jitter:0});
    k.box(R,'skylight',{x,z:zc,y:top,w:1.1,d:L,h:.5,jitter:0,ao:false});
    for(let i=0;i<=6;i++)k.box(R,'iron',{x,z:z0+i*L/6,y:top,w:1.16,d:.06,h:.54,jitter:0,ao:false});
    k.gable(R,'iron',{x,z:zc,y:top+.5,w:1.3,d:L+.2,rise:.28,overhang:.04,thick:.05,alongZ:true});
    // A thin mast at the north end.
    const zm=b.z-6;k.cylinder(R,'iron',{x,z:zm,y:top,r:.05,h:2.6,seg:6});for(const y of [1.4,2.1])k.box(R,'iron',{x,z:zm,y:top+y,w:.7,d:.04,h:.04,jitter:0,ao:false});
    k.lathe(R,'skylight',[[0,0],[.07,.04],[0,.12]],{x,z:zm,y:top+2.6,seg:8,ao:false});
  }else if(t.world==='arithmos'){
    // A finial that is a solid of chalk, turning slowly inside a brass ring.
    const z=b.z-3.4;k.box(R,'stone',{x,z,y:top-.05,w:1,d:1,h:.4,jitter:0});k.cylinder(R,'bronze',{x,z,y:top+.35,r:.11,h:1.6,seg:8});
    const y=top+2.9;k.pivot(`${id}:spin`,x,y,z);
    k.lathe(`${id}:spin`,'chalkWhite',[[0,-.95],[.84,0],[0,.95]],{x,z,y,seg:5,ao:false});
    const ring=Array.from({length:9},(_,i)=>{const a=-Math.PI/2+i/8*Math.PI*2;return [1.25+Math.cos(a)*.05,Math.sin(a)*.05];});
    k.lathe(R,'bronze',ring,{x,z,y,rx:90,seg:28,ao:false});k.lathe(R,'bronze',ring,{x,z,y,rz:90,seg:28,ao:false});
  }
}
function portalEntry(k,id,I,{b,s,P,ry,half}){
  const [px]=P(-half+1.25,0);
  k.box(I,'stoneDark',{x:px,z:b.z,w:1.6,d:5,y:.12,h:.4,jitter:.02});
  k.arch(I,'stone',{x:px,y:2.25,z:b.z,r:1.75,thick:.5,depth:.8,seg:11,ry});
  for(const v of [-2,2])k.box(I,'stone',{x:px,z:b.z+v,w:.8,d:.5,y:.52,h:1.75,jitter:.03});
  k.panel(`portal:${id}`,`portal@${id}`,{x:px+s*.03,y:2.25,z:b.z,w:3.5,h:3.5,ry});
}
// Bitland: a city simulated inside a microcontroller, entered by putting on a VR headset.
function vrEntry(k,id,I,{b,s,P}){
  const [bx,bz]=P(-4.3,-1.7);
  k.box(I,'wood',{x:bx,z:bz,w:1.5,d:3.4,y:.9,h:.1,jitter:.02});
  for(const dx of [-.6,.6])for(const dz of [-1.5,1.5])k.box(I,'woodDark',{x:bx+dx,z:bz+dz,w:.1,d:.1,y:0,h:.9,jitter:0});
  k.box(I,'paint',{x:bx,z:bz,w:1.3,d:3.1,y:1,h:.05,tone:[.1,.3,.18],jitter:0,ao:false});
  for(let i=0;i<9;i++)k.box(I,'bronze',{x:bx-.55+i*.14,z:bz,w:.025,d:2.9,y:1.05,h:.006,jitter:0,ao:false});
  for(let i=0;i<5;i++)k.box(I,'bronze',{x:bx,z:bz-1.2+i*.6,w:1.2,d:.025,y:1.05,h:.006,jitter:0,ao:false});
  // The chip, with its city of light on top.
  k.box(I,'iron',{x:bx,z:bz,w:1.05,d:1.05,y:1.05,h:.1,jitter:0});
  for(let i=0;i<8;i++)for(const side of [-1,1]){k.box(I,'bronze',{x:bx+side*.43,z:bz-.35+i*.1,w:.08,d:.03,y:1.06,h:.02,jitter:0,ao:false});k.box(I,'bronze',{x:bx-.35+i*.1,z:bz+side*.43,w:.03,d:.08,y:1.06,h:.02,jitter:0,ao:false});}
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){const r=noise(i*7+j,4),core=Math.max(0,1-Math.hypot(i-3.5,j-3.5)/5.2),h=.03+r*r*.75*core+.04*core,g=.3+noise(j*5+i,9)*.7;k.box(`city:${id}`,`city@${id}`,{x:bx-.42+i*.12,z:bz-.42+j*.12,y:1.15,w:.07,d:.07,h,tone:[g,g,g],jitter:0,ao:false});}
  k.box(I,'iron',{x:bx,z:bz+1.1,w:.5,d:.4,y:1.05,h:.14,jitter:0});k.box(I,'iron',{x:bx,z:bz-1.15,w:.3,d:.6,y:1.05,h:.1,jitter:0});
  // Reclining chair and the headset hanging over it.
  const [cx,cz]=P(-3.3,2.4);
  k.box(I,'iron',{x:cx,z:cz,w:.3,d:.3,y:0,h:.45,jitter:0});
  k.box(I,'curtain',{x:cx,z:cz,w:.9,d:.8,y:.45,h:.16,jitter:0,tone:[.55,.5,.75]});
  k.box(I,'curtain',{x:cx-s*.55,z:cz,w:.16,d:.8,y:.5,h:1.1,rz:s*28,jitter:0,tone:[.55,.5,.75]});
  const [px]=P(-4.6,0);k.box(I,'iron',{x:px,z:cz,w:.1,d:.1,y:0,h:2.3,jitter:0});k.box(I,'iron',{x:(px+cx)/2-s*.25,z:cz,w:Math.abs(px-cx)+.2,d:.08,h:.08,y:2.3,jitter:0});
  const hx=cx-s*.55,hy=1.72;k.box(I,'iron',{x:hx,z:cz,w:.03,d:.03,y:hy+.3,h:.3,jitter:0,ao:false});
  k.lathe(I,'iron',[[0,0],[.3,0],[.33,.14],[.3,.3],[.18,.42],[0,.45]],{x:hx,z:cz,y:hy,seg:14,smooth:true});
  k.box(`visor:${id}`,`visor@${id}`,{x:hx+s*.24,z:cz,y:hy+.06,w:.14,d:.5,h:.2,jitter:0,ao:false});
  // Cable from the headset to the board.
  const pts=[[hx,hy+.1,cz],[hx-s*.2,1.2,cz-.4],[bx+s*.3,1.1,bz+1.3],[bx,1.1,bz+1.1]];
  for(let i=0;i<pts.length-1;i++){const [x0,y0,z0]=pts[i],[x1,y1,z1]=pts[i+1];for(let t=0;t<6;t++){const u=t/6;k.box(I,'iron',{x:x0+(x1-x0)*u,y:y0+(y1-y0)*u-.02,z:z0+(z1-z0)*u,w:.05,d:.05,h:.05,jitter:0,ao:false});}}
}
// Physica: a subatomic, almost quantum world inside a tank, whose laws can be tuned.
function tankEntry(k,id,I,{b,s,P,ry}){
  const [tx,tz]=P(-3.9,0),cy=2.25;
  k.lathe(I,'bronze',[[0,0],[1.05,0],[1.1,.14],[.8,.3],[.66,.85],[.9,1],[0,1]],{x:tx,z:tz,seg:16,smooth:true});
  const bowl=[[0,-1.2],[.55,-1.05],[1,-.62],[1.2,0],[1.1,.55],[.86,.92],[.84,1]];
  k.lathe('tank','tank',bowl.map(([r,h])=>[r,h+cy]),{x:tx,z:tz,seg:24,smooth:true,ao:false});
  k.lathe('tank','tank',bowl.slice().reverse().map(([r,h])=>[r*.97,h+cy]),{x:tx,z:tz,seg:24,smooth:true,ao:false});
  k.lathe('fluid:fisica','fluid@fisica',[[0,-1.12],[.52,-.98],[.94,-.58],[1.13,0],[1.05,.45],[0,.45]].map(([r,h])=>[r,h+cy]),{x:tx,z:tz,seg:24,smooth:true,ao:false});
  k.lathe(I,'bronze',[[.84,0],[.92,.03],[.9,.08],[.82,.08]],{x:tx,z:tz,y:cy+.98,seg:24});
  k.pivot(`world:${id}`,tx,cy,tz);
  k.lathe(`world:${id}`,`world@${id}`,Array.from({length:9},(_,i)=>{const a=-Math.PI/2+i/8*Math.PI;return [Math.cos(a)*.36,Math.sin(a)*.36+cy];}),{x:tx,z:tz,seg:28,smooth:true,ao:false});
  const torus=(R,r)=>Array.from({length:9},(_,i)=>{const a=-Math.PI/2+i/8*Math.PI*2;return [R+Math.cos(a)*r,Math.sin(a)*r];});
  [[.62,0,0],[.78,55,0],[.9,0,62]].forEach(([R,rx,rz],i)=>{k.lathe(`world:${id}`,'bronze',torus(R,.018).map(([r,h])=>[r,h]),{x:tx,z:tz,y:cy,seg:32,rx,rz,ao:false});
    const a=i*2.1,px=Math.cos(a)*R,pz=Math.sin(a)*R;k.lathe(`world:${id}`,`world@${id}`,[[0,-.06],[.06,0],[0,.06]],{x:tx+px,z:tz+pz*Math.cos(rx*Math.PI/180),y:cy+pz*Math.sin(rx*Math.PI/180),seg:8,smooth:true,ao:false});});
  // The console of laws, facing the room.
  const [lx,lz]=P(-2.3,2.1);
  k.box(I,'woodDark',{x:lx,z:lz,w:.7,d:1.4,y:0,h:1,jitter:.02});
  k.panel(I,'leyes',{x:lx+s*.36,y:1.3,z:lz,w:1.3,h:.5,ry});
  for(let i=0;i<4;i++)k.cylinder(I,'bronze',{x:lx+s*.2,z:lz-.45+i*.3,y:1,r:.06,h:.1,seg:8});
}
// Arithmos: an immersion into a blackboard. Its exact form is still being designed.
function boardEntry(k,id,I,{b,s,P,ry,half}){
  const [wx]=P(-half+.36,0),w=5.2,h=3.1,y=2.35;
  k.panel(`board:${id}`,`board@${id}`,{x:wx+s*.02,y,z:b.z,w,h,ry});
  for(const dz of [-w/2-.08,w/2+.08])k.box(I,'woodDark',{x:wx,z:b.z+dz,w:.14,d:.16,y:y-h/2-.08,h:h+.16,jitter:0});
  for(const dy of [-h/2-.16,h/2])k.box(I,'woodDark',{x:wx,z:b.z,w:.14,d:w+.32,y:y+dy,h:.16,jitter:0});
  k.box(I,'woodDark',{x:wx+s*.16,z:b.z,w:.22,d:w,y:y-h/2-.2,h:.06,jitter:0});
  for(let i=0;i<5;i++)k.box(I,'paint',{x:wx+s*.18,z:b.z-1.4+i*.55,y:y-h/2-.13,w:.04,d:.16,h:.04,tone:[.95,.93,.88],jitter:0,ao:false});
  k.box(I,'stoneDark',{x:P(-half+1.3,0)[0],z:b.z,w:1.4,d:4.4,y:.12,h:.12,jitter:.02});
}
function bench(k,I,x,z,{w=3.4,d=1.3}={}){
  k.box(I,'wood',{x,z,w,d,y:.9,h:.12,jitter:.02});
  for(const dx of [-w/2+.15,w/2-.15])for(const dz of [-d/2+.12,d/2-.12])k.box(I,'woodDark',{x:x+dx,z:z+dz,w:.12,d:.12,y:0,h:.9,jitter:0});
  k.box(I,'woodDark',{x,z,w:w-.4,d:d-.2,y:.3,h:.06,jitter:0});
}
function electronicaRoom(k,id,I,{b,P}){
  for(const v of [-4,-.5,3]){
    const [x,z]=P(1.4,v);bench(k,I,x,z);
    k.box(I,'iron',{x:x-1,z:z-.25,w:.9,d:.6,y:1.02,h:.55,jitter:.05});k.panel(I,`screen@${id}`,{x:x-1,y:1.32,z:z+.06,w:.5,h:.34});
    k.box(I,'paint',{x:x,z:z-.3,w:.6,d:.45,y:1.02,h:.35,tone:[.28,.36,.3],jitter:.05});
    k.cylinder(I,'bronze',{x:x+.9,z:z-.2,y:1.02,r:.2,h:.35,seg:10});
    k.box(I,'paint',{x:x+1,z:z+.3,w:.9,d:.5,y:1.02,h:.03,tone:[.2,.42,.3],jitter:0,ao:false});
    for(let i=0;i<5;i++)k.box(I,'paint',{x:x+.7+i*.14,z:z+.25+(i%2)*.12,w:.08,d:.05,y:1.05,h:.06,tone:BOOK_TONES[i],jitter:0,ao:false});
    chair(k,I,x,z+1.05,180);
  }
  for(const u of [-2.4,.4,3.2])shelf(k,I,P(u,0)[0],b.z-b.d/2+.62,2.4,3);
  for(let i=0;i<3;i++){const [x,z]=P(3.8,5.4-i*1.05);k.lathe(I,'copper',[[0,0],[.42,0],[.42,.08],[.28,.1],[.28,.5],[.42,.52],[.42,.6],[0,.6]],{x,z,rx:90,y:.43,seg:10});}
}
function fisicaRoom(k,id,I,{b,s,P}){
  // A pendulum on its frame, an inclined plane, a Newton's cradle and an orrery.
  const [px,pz]=P(1,-4.4);
  for(const dz of [-1,1])k.box(I,'woodDark',{x:px,z:pz+dz,w:.16,d:.16,y:0,h:3.6,jitter:0});
  k.box(I,'woodDark',{x:px,z:pz,w:.18,d:2.3,y:3.6,h:.16,jitter:0});
  k.pivot(`pendulum:${id}`,px,3.6,pz);k.cylinder(`pendulum:${id}`,'iron',{x:px,z:pz,y:.95,r:.02,h:2.65,seg:5,cap:false});
  k.lathe(`pendulum:${id}`,'bronze',[[0,0],[.2,.06],[.24,.24],[.2,.42],[0,.48]],{x:px,z:pz,y:.5,seg:12,smooth:true});
  const [rx,rz]=P(1.4,-.6);bench(k,I,rx,rz,{w:3.6});
  k.box(I,'wood',{x:rx,z:rz,y:1.02,w:2.6,d:.5,h:.08,rz:s*9,jitter:0});k.lathe(I,'iron',[[0,0],[.12,.03],[.14,.14],[.1,.25],[0,.28]],{x:rx-s*.8,z:rz,y:1.32,seg:10,smooth:true});
  for(let i=0;i<5;i++)k.lathe(I,'bronze',[[0,0],[.09,.02],[.1,.1],[.08,.18],[0,.2]],{x:rx+s*.7,z:rz-.36+i*.18,y:1.18,seg:10,smooth:true});
  k.box(I,'iron',{x:rx+s*.7,z:rz,y:1.6,w:.05,d:1.1,h:.05,jitter:0});
  const [ox,oz]=P(1.6,3.6);bench(k,I,ox,oz,{w:2.4,d:2});
  k.lathe(I,'gold',[[0,0],[.3,.05],[.36,.3],[.3,.56],[0,.62]],{x:ox,z:oz,y:1.25,seg:14,smooth:true});
  k.cylinder(I,'bronze',{x:ox,z:oz,y:1.02,r:.05,h:.25,seg:6});
  k.pivot(`orrery:${id}`,ox,1.5,oz);
  [[.8,.12,[.4,.55,.8]],[1.1,.16,[.75,.45,.3]],[1.4,.1,[.6,.7,.5]]].forEach(([r,size,tone],i)=>{const a=i*2.1;
    k.box(`orrery:${id}`,'bronze',{x:ox+Math.cos(a)*r/2,z:oz+Math.sin(a)*r/2,y:1.5,w:r,d:.03,h:.03,ry:-a*180/Math.PI,jitter:0,ao:false});
    k.lathe(`orrery:${id}`,'paint',[[0,-size],[size*.7,-size*.7],[size,0],[size*.7,size*.7],[0,size]],{x:ox+Math.cos(a)*r,z:oz+Math.sin(a)*r,y:1.5,seg:10,tone,smooth:true,ao:false});});
  // Optics along the north wall: a rail with lenses.
  const [lx]=P(.6,0),lz=b.z-b.d/2+.9;k.box(I,'woodDark',{x:lx,z:lz,w:4,d:.5,y:0,h:.95,jitter:.02});k.box(I,'iron',{x:lx,z:lz,w:3.8,d:.08,y:.95,h:.06,jitter:0});
  for(let i=0;i<4;i++)k.lathe(I,'lanternGlass',[[0,0],[.18,.02],[.18,.04],[0,.06]],{x:lx-1.4+i*.95,z:lz,y:1.3,rx:90,seg:12});
  k.panel(I,'chalk3',{x:P(.4,0)[0],y:2.6,z:b.z+b.d/2-.38,w:4.4,h:1.8,ry:180});
}
function programacionRoom(k,id,I,{b,P}){
  // Terminals on desks, racks with blinking lights, a wall of code.
  for(const v of [-4.2,-1,2.2]){
    const [x,z]=P(1.6,v);bench(k,I,x,z,{w:3,d:1.2});
    for(const du of [-.7,.7]){k.box(I,'iron',{x:x+du,z:z-.2,w:.8,d:.7,y:.96,h:.62,jitter:.03});k.panel(I,`screen@${id}`,{x:x+du,y:1.3,z:z+.17,w:.62,h:.46});k.box(I,'iron',{x:x+du,z:z+.36,w:.7,d:.26,y:.96,h:.04,jitter:0});}
    chair(k,I,x,z+1,180);
  }
  for(let i=0;i<3;i++){const [x]=P(-.6+i*1.3,0),z=b.z+b.d/2-.8;k.box(I,'iron',{x,z,w:1.1,d:.9,y:0,h:2.4,jitter:.03});k.panel(I,`leds@${id}`,{x,y:1.3,z:z-.46,w:.8,h:1.8,ry:180});}
  k.panel(I,'code',{x:P(.6,0)[0],y:2.8,z:b.z-b.d/2+.38,w:5,h:2.3});
  for(let i=0;i<6;i++)k.box(I,'iron',{x:P(-3.2+i*.2,0)[0],z:b.z+4.8-i*.4,y:.13,w:.08,d:.8,h:.04,ry:i*23,jitter:0,ao:false});
}
function matematicaRoom(k,id,I,{b,P}){
  // Blackboards, desks and a collection of solids; a compass and an abacus.
  k.panel(I,'chalk',{x:P(.6,0)[0],y:2.4,z:b.z-b.d/2+.38,w:5.4,h:2.2});
  k.panel(I,'chalk2',{x:P(.6,0)[0],y:2.4,z:b.z+b.d/2-.38,w:5.4,h:2.2,ry:180});
  for(const v of [-3,-.6])for(const u of [.6,2.8]){const [x,z]=P(u,v);k.box(I,'wood',{x,z,w:1.4,d:.7,y:.72,h:.07,jitter:.03});for(const dx of [-.6,.6])k.box(I,'woodDark',{x:x+dx,z,w:.07,d:.6,y:0,h:.72,jitter:0});chair(k,I,x,z+.7,180);}
  const shapes=[[[[0,0],[.42,0],[0,.7]],3],[[[.001,0],[.42,0],[.42,.6],[.001,.6]],4],[[[0,0],[.36,.36],[0,.72]],4],[[[0,0],[.24,.1],[.38,.36],[.24,.62],[0,.72]],5],[[[.001,0],[.3,0],[.3,.7],[.001,.7]],14],[[[.001,0],[.34,0],[0,.8]],14]];
  const tones=[[.85,.52,.4],[.45,.6,.8],[.9,.8,.5],[.55,.75,.55],[.8,.78,.74],[.7,.55,.75]];
  shapes.forEach(([profile,seg],i)=>{const [x,z]=P(-.8+(i%3)*1.3,2.6+Math.floor(i/3)*1.5);
    k.box(I,'plaster',{x,z,w:.7,d:.7,y:0,h:.8,jitter:.02});k.lathe(I,'paint',profile,{x,z,y:.8,seg,phase:Math.PI/seg,tone:tones[i],ao:false});});
  // Compass and abacus near the portal.
  const [cx,cz]=P(-2.6,-4.8);k.box(I,'bronze',{x:cx,z:cz,y:0,w:.08,d:.08,h:2.2,rz:12,jitter:0});k.box(I,'bronze',{x:cx+.45,z:cz,y:0,w:.08,d:.08,h:2.2,rz:-12,jitter:0});k.lathe(I,'bronze',[[0,0],[.12,.05],[0,.14]],{x:cx+.22,z:cz,y:2.15,seg:8});
  const [ax,az]=P(-2.5,4.6);k.box(I,'woodDark',{x:ax,z:az,w:.1,d:1.6,y:0,h:1.6,jitter:0});k.box(I,'woodDark',{x:ax,z:az,w:.1,d:1.6,y:1.6,h:.1,jitter:0});
  for(let r=0;r<5;r++){k.box(I,'iron',{x:ax,z:az,w:.03,d:1.5,y:.3+r*.28,h:.03,jitter:0,ao:false});for(let j=0;j<6;j++)k.lathe(I,'paint',[[0,-.07],[.09,0],[0,.07]],{x:ax,z:az-.55+j*.13+(r%2)*.2,y:.315+r*.28,rz:90,seg:8,tone:BOOK_TONES[(r+j)%6],ao:false});}
}

function trofeosDetails(k){
  const id='trofeos',b=BUILDINGS[id],fz=b.z+b.d/2;
  for(const at of [-5,-1.8,1.8,5])windowOn(k,id,'n',at,{h:2.6});
  windowOn(k,id,'w',0,{h:2.6});windowOn(k,id,'e',0,{h:2.6});
  windowOn(k,id,'s',-4.6,{h:2.6});windowOn(k,id,'s',4.6,{h:2.6});
  doorOn(k,id,'s',0,{w:2,h:3});
  plaque(k,wallPart(id,'s'),'sign:trofeos',{x:b.x,y:4.9,z:fz+.07,w:4,h:.62});
  // A portico of four columns toward the patio.
  const pz=fz+1.5;
  k.box('static','stone',{x:b.x,z:pz,w:7,d:3,y:0,h:.3,jitter:.02});
  for(const cx of [-2.8,-.95,.95,2.8])column(k,'trofeos:colonnade',b.x+cx,pz+1,3.9);
  k.box('trofeos:colonnade','stone',{x:b.x,z:pz+.1,w:7.2,d:3,y:3.9,h:.4,jitter:.02});
  k.gable('trofeos:colonnade','slate',{x:b.x,z:pz+.1,w:7.4,d:3,y:4.3,rise:1.1,alongZ:true,ends:'stone',overhang:.2});
  // Skylight lantern on the ridge.
  k.box(`${id}:roof`,'lanternGlass',{x:b.x,z:b.z,w:7,d:2.2,y:b.h+b.rise-.2,h:.9,jitter:0});
  k.gable(`${id}:roof`,'bronze',{x:b.x,z:b.z,w:7.3,d:2.5,y:b.h+b.rise+.7,rise:.6,overhang:.05,thick:.08});
  // One tiered stand per world under its banner; trophies are separate parts.
  const I='trofeos:interior',back=b.z-b.d/2+T;
  WORLD_ORDER.forEach((w,wi)=>{
    const cx=b.x-5.1+wi*3.4;
    for(let t=0;t<3;t++){const depth=.62*(3-t);k.box(I,t%2?'stone':'stoneDark',{x:cx,z:back+.35+depth/2,w:3.1,d:depth,y:0,h:.52+t*.42,jitter:.02});}
    k.panel(I,`banner:${w}`,{x:cx,y:3.9,z:back+.04,w:1.3,h:2.1});
  });
  k.box(I,'rug',{x:b.x,z:b.z+2.4,w:11,d:1.4,y:.12,h:.02,jitter:0,ao:false});
}

// ── Anfiteatro ──────────────────────────────────────────────────────────────────
function amphitheatre(k){
  const {x,z,screenW,screenH}=AMPHI,P='anfiteatro';
  // Stage and screen, facing south.
  k.box(P,'stone',{x,z,w:12,d:3.4,y:0,h:.6,jitter:.02});k.box(P,'wood',{x,z:z+.2,w:11.6,d:3,y:.6,h:.08,jitter:.02});
  k.box(P,'woodDark',{x,z:z-1.2,w:screenW+1,d:.35,y:.68,h:screenH+1.1,jitter:.02});
  k.panel('screen','screen',{x,y:.68+.55+screenH/2,z:z-1.0,w:screenW,h:screenH});
  k.box(P,'woodDark',{x,z:z-1.1,w:screenW+1.8,d:.6,y:screenH+1.7,h:.4,jitter:.02});
  for(const s of [-1,1]){k.box(P,'curtain',{x:x+s*(screenW/2+.55),z:z-.8,w:.9,d:.35,y:.68,h:screenH+1.05,jitter:.03});k.box(P,'bronze',{x:x+s*(screenW/2+1.1),z:z-1.1,w:.25,d:.25,y:.68,h:screenH+1.5,jitter:0});}
  // Stepped seating in a half ring opening north.
  for(let t=0;t<5;t++){
    const r0=4.4+t*1.15,r1=r0+1.15,y=.08+t*.42,seg=16;
    for(let i=0;i<seg;i++){
      const a0=Math.PI*i/seg,a1=Math.PI*(i+1)/seg,o={tone:[1-t*.02,1-t*.02,1-t*.015],ao:false},cz=z+1.6;
      const V=(a,r,h)=>[x+Math.cos(a)*r,h,cz+Math.sin(a)*r];
      const top=[V(a0,r0,y+.42),V(a1,r0,y+.42),V(a1,r1,y+.42),V(a0,r1,y+.42)];
      k.facingQuad(P,'stone',...top,[0,1,0],o);
      k.facingQuad(P,'stone',V(a0,r0,0),V(a1,r0,0),V(a1,r0,y+.42),V(a0,r0,y+.42),[-Math.cos((a0+a1)/2),0,-Math.sin((a0+a1)/2)],o);
      if(t===4)k.facingQuad(P,'stone',V(a0,r1,0),V(a1,r1,0),V(a1,r1,y+.42),V(a0,r1,y+.42),[Math.cos((a0+a1)/2),0,Math.sin((a0+a1)/2)],o);
      // Wooden seat boards on each tier.
      k.facingQuad(P,'wood',V(a0,r0+.1,y+.44),V(a1,r0+.1,y+.44),V(a1,r0+.6,y+.44),V(a0,r0+.6,y+.44),[0,1,0],{ao:false,tone:[.95,.95,.95]});
    }
    for(const a of [0,Math.PI])k.facingQuad(P,'stone',[x+Math.cos(a)*r0,0,z+1.6],[x+Math.cos(a)*r1,0,z+1.6],[x+Math.cos(a)*r1,y+.42,z+1.6],[x+Math.cos(a)*r0,y+.42,z+1.6],[0,0,-1],{ao:false});
  }
  plaque(k,P,'sign:anfiteatro',{x,y:screenH+2.35,z:z-.78,w:4.4,h:.6});
}

// ── Patio, fountain, gate ───────────────────────────────────────────────────────
function fountain(k){
  const {x,z,r}=FOUNTAIN,P='fountain';
  // Octagonal basin, the statue of Roxana on a tall pedestal in its centre.
  k.lathe(P,'stone',[[r+.3,0],[r+.3,.75],[r+.05,.85],[r-.3,.85],[r-.3,.2],[0,.2]],{x,z,seg:8,phase:Math.PI/8});
  k.lathe(P,'stoneDark',[[0,0],[1.1,0],[1.1,1.2],[.85,1.3],[.85,2.3],[1.05,2.45],[1.05,2.7],[0,2.7]],{x,z,seg:8,phase:Math.PI/8});
  // Roxana: a robed figure, hair gathered, a lamp raised in her right hand, a book at her side.
  const S='statue',y=2.7,o={x,z,y,seg:18,smooth:true};
  k.lathe(S,'statue',[[0,0],[.7,0],[.72,.12],[.66,.2],[.6,.6],[.52,1.1],[.44,1.55],[.38,1.85],[.4,2.1],[.44,2.3],[.36,2.48],[.18,2.58],[.12,2.62],[0,2.64]],{...o,sz:.82});
  k.lathe(S,'statue',[[0,0],[.13,.02],[.2,.14],[.22,.3],[.2,.44],[.14,.54],[0,.58]],{...o,y:y+2.6,z:z+.03});
  k.lathe(S,'statue',[[0,0],[.14,.04],[.16,.12],[.1,.22],[0,.25]],{...o,y:y+3.02,z:z-.1,seg:12});
  // Raised arm: upper arm, forearm, the lamp with its glass.
  k.lathe(S,'statue',[[.1,0],[.09,.5],[.075,.9],[0,.95]],{...o,x:x+.36,y:y+2.25,rz:-28,seg:10});
  k.lathe(S,'statue',[[.08,0],[.065,.55],[0,.6]],{...o,x:x+.66,y:y+2.95,rz:-6,seg:10});
  k.lathe(S,'statue',[[.0,0],[.12,.02],[.14,.1],[.08,.14],[.1,.34],[.05,.4],[0,.42]],{...o,x:x+.72,y:y+3.45,seg:10});
  k.box(S,'statue',{x:x-.3,z:z+.36,y:y+1.25,w:.46,d:.12,h:.62,rx:-12,rz:8,jitter:0});
  k.lathe(S,'statue',[[.08,0],[.075,.5],[0,.55]],{...o,x:x-.36,y:y+1.8,z:z+.2,rx:-150,rz:14,seg:10});
  k.lathe('statue:flame','flame',[[0,0],[.1,.06],[.08,.18],[0,.3]],{x:x+.72,z,y:y+3.8,seg:8,smooth:true});
  // A bronze lantern at Roxana's feet, lit by Ohmdal's first light.
  k.box('static','bronze',{x,z:z+.84,y:2.7,w:.26,d:.26,h:.06,jitter:0});
  k.cylinder('static','bronze',{x,z:z+.84,y:2.76,r:.035,h:.28,seg:6});
  k.lathe('roxana:lamp','roxanaLamp',[[.09,0],[.14,.08],[.14,.3],[.09,.36],[0,.37]],{x,z:z+.84,y:3.02,seg:6});
  k.lathe('static','bronze',[[.17,0],[.1,.08],[.02,.16],[0,.2]],{x,z:z+.84,y:3.39,seg:6});
  for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])k.box('static','bronze',{x:x+dx*.1,z:z+.84+dz*.1,y:3.02,w:.02,d:.02,h:.37,jitter:0,ao:false});
  // Water, dry basin leaves.
  k.lathe('fountain:water','water',[[r-.28,0],[0,0]],{x,z,y:.62,seg:8,phase:Math.PI/8});
  // Eight bronze spouts around the pedestal feed the basin.
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;k.cylinder(P,'bronze',{x:x+Math.cos(a)*1.02,z:z+Math.sin(a)*1.02,y:1.72,r:.07,h:.12,seg:6});}
  for(let i=0;i<24;i++){const a=noise(i,4)*Math.PI*2,rr=1.4+noise(i,5)*(r-1.9);k.box('fountain:leaves','paint',{x:x+Math.cos(a)*rr,z:z+Math.sin(a)*rr,y:.21,w:.18,d:.1,h:.015,ry:noise(i,6)*180,tone:[.5+noise(i,7)*.2,.34,.16],jitter:.1,ao:false});}
}
function patio(k){
  // Lampposts: iron shafts, glass heads lit by the Castillo's restoration.
  for(const [x,z] of LAMPS){
    k.cylinder('static','iron',{x,z,r:.18,r2:.14,h:.35,seg:8});k.cylinder('static','iron',{x,z,y:.35,r:.07,h:3.1,seg:6});
    k.box('static','iron',{x,z,y:3.4,w:.5,d:.5,h:.08,jitter:0});
    k.lathe('lamps','lampGlass',[[.16,0],[.24,.35],[.2,.5],[0,.52]],{x,z,y:3.48,seg:6});
    k.lathe('static','iron',[[.3,0],[.1,.26],[0,.3]],{x,z,y:3.98,seg:6});
  }
  // Planters: dry stalks until the Terrazas share their water, then flowers.
  PLANTERS.forEach(([x,z],n)=>{
    k.box('static','stone',{x,z,w:3.4,d:1.8,y:0,h:.55,jitter:.03});k.box('static','soil',{x,z,w:3.1,d:1.5,y:.55,h:.02,ao:false});
    for(let i=0;i<22;i++){const px=x-1.4+noise(i,n)*2.8,pz=z-.6+noise(i,n+3)*1.2,h=.25+noise(i,n+6)*.45;
      k.box('planters:dry','paint',{x:px,z:pz,y:.55,w:.05,d:.05,h,rz:(noise(i,n+8)-.5)*30,tone:[.62,.52,.32],jitter:.1,ao:false});
      k.lathe('planters:green','hedge',[[0,0],[.22,.1],[.18,.3],[0,.36]],{x:px,z:pz,y:.55,seg:5,tone:[.9,1.1,.85]});
      const flower=[[.9,.35,.3],[.95,.8,.35],[.9,.9,.85],[.65,.45,.8]][(i+n)%4];
      k.lathe('planters:flowers','paint',[[0,0],[.1,.02],[.08,.08],[0,.1]],{x:px+.04,z:pz,y:.85+noise(i,n+2)*.2,seg:5,tone:flower,ao:false});
    }
  });
  // Benches.
  for(const [x,z,ry] of [[-6,-13.5,0],[6,-13.5,0],[-18,5,90],[18,5,90]]){
    const along=ry===0;k.box('static','wood',{x,z,w:along?2.4:.6,d:along?.6:2.4,y:.45,h:.08});k.box('static','wood',{x:along?x:x+(x>0?.26:-.26),z:along?z-.26:z,w:along?2.4:.08,d:along?.08:2.4,y:.53,h:.5});
    for(const s of [-1,1])k.box('static','iron',{x:along?x+s*1:x,z:along?z:z+s*1,w:along?.08:.6,d:along?.6:.08,y:0,h:.45});
  }
  // Weeds through the cobbles while the school is abandoned.
  for(let i=0;i<90;i++){const x=(noise(i,11)-.5)*38,z=-14+noise(i,12)*30;if(Math.hypot(x,z)<5)continue;for(let j=0;j<5;j++)k.box('weeds','hedge',{x:x+(noise(i,j)-.5)*.3,z:z+(noise(j,i)-.5)*.3,y:.06,w:.03,d:.05,h:.18+noise(i+j,3)*.28,rx:(noise(i,j+5)-.5)*50,rz:(noise(j,i+5)-.5)*50,tone:[1.1,1.02,.72],jitter:.15,ao:false});}
}
function gate(k){
  const z=34.4,P='static';
  for(const s of [-1,1]){
    const x=s*3.4;k.box(P,'stoneDark',{x,z,w:1.3,d:1.3,y:0,h:.5,jitter:.02});k.box(P,'stone',{x,z,w:1.1,d:1.1,y:.5,h:3.9,jitter:.03});k.box(P,'stone',{x,z,w:1.35,d:1.35,y:4.4,h:.3,jitter:0});
    k.lathe(P,'bronze',[[0,0],[.3,.05],[.36,.35],[.12,.6],[0,.7]],{x,z,y:4.7,seg:8});
    // Gate leaves hinge on the pillars.
    const leaf=k.pivot(`gate:${s<0?'w':'e'}`,x-s*.55,0,z);
    for(let i=0;i<7;i++)k.box(leaf,'iron',{x:x-s*(.85+i*.38),z,y:.25,w:.06,d:.06,h:2.3+Math.sin(i/6*Math.PI)*.35,jitter:0,ao:false});
    for(const y of [.45,1.4,2.2])k.box(leaf,'iron',{x:x-s*1.7,z,y,w:2.25,d:.07,h:.07,jitter:0,ao:false});
  }
  // Arch sign over the entrance.
  k.box(P,'iron',{x:0,z,y:5.3,w:7.9,d:.12,h:.12,jitter:0});
  k.panel(P,'sign:instituto',{x:0,y:5.95,z:z+.07,w:5.6,h:1.05});k.panel(P,'sign:instituto',{x:0,y:5.95,z:z-.07,w:5.6,h:1.05,ry:180});
  k.box(P,'iron',{x:0,z,y:6.5,w:7.9,d:.12,h:.1,jitter:0});
  // A chain hangs across the leaves until the Puerta de Ohm opens.
  for(let i=0;i<9;i++){const t=i/8-.5;k.box('gate:chain','iron',{x:t*1.6,z:z+.12,y:1.25-Math.cos(t*Math.PI)*.2+.2,w:.16,d:.05,h:.1,rz:i%2?0:90,jitter:0,ao:false});}
  k.box('gate:chain','bronze',{x:0,z:z+.14,y:.8,w:.28,d:.1,h:.36,jitter:0,ao:false});
}
