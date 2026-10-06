// The living artifact of each workshop, outside on the lawn where the master camera sees
// it. They share the school's materials and scale, invite a look and lead to their room:
//   Ohmdal   — a miniature of the Faro on a plinth and the line that feeds the patio lamps.
//              Its lantern lights only after the Faro is lit in the student's real save.
//   Physica  — a glass column where water climbs; outside the glass it falls as usual.
//   Bitland  — a city on a microcontroller under a lens; one instruction repeats its loop.
//   Arithmos — a blackboard on an easel where one quantity keeps changing representation.
export const ARTIFACTS={
  ohmdal:{room:'electronica',x:-22.4,z:-9.4},
  physica:{room:'fisica',x:-22.2,z:22},
  bitland:{room:'programacion',x:39.6,z:-5.2},
  arithmos:{room:'matematica',x:29.2,z:24},
};
// Pick boxes, so touching an artifact enters its workshop.
export const ARTIFACT_PICKS=Object.fromEntries(Object.values(ARTIFACTS).map(a=>[a.room,[[a.x-1.6,0,a.z-1.6],[a.x+1.6,4.8,a.z+1.6]]]));

/** A thin square prism between two points: wires, rods, stays. */
function segment(k,part,mat,a,b,r=.03,o={}){
  const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...d)||1,u=d.map(v=>v/l);
  let p=Math.abs(u[1])<.9?[0,1,0]:[1,0,0];
  const c1=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]],n1=Math.hypot(...c1);const s=c1.map(v=>v/n1*r);
  const t=[u[1]*s[2]-u[2]*s[1],u[2]*s[0]-u[0]*s[2],u[0]*s[1]-u[1]*s[0]].map(v=>v/r*r);
  const off=(q,f1,f2)=>[q[0]+s[0]*f1+t[0]*f2,q[1]+s[1]*f1+t[1]*f2,q[2]+s[2]*f1+t[2]*f2];
  const ring=[[1,1],[-1,1],[-1,-1],[1,-1]];
  for(let i=0;i<4;i++){const [f1,f2]=ring[i],[g1,g2]=ring[(i+1)%4],mid=[(f1+g1)/2,(f2+g2)/2];
    k.facingQuad(part,mat,off(a,f1,f2),off(a,g1,g2),off(b,g1,g2),off(b,f1,f2),[s[0]*mid[0]+t[0]*mid[1],s[1]*mid[0]+t[1]*mid[1],s[2]*mid[0]+t[2]*mid[1]],{ao:false,...o});}
}
/** A wire that sags between two points. */
function wire(k,part,mat,a,b,sag=.5,n=10,r=.025){
  let prev=a;for(let i=1;i<=n;i++){const t=i/n,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*sag,a[2]+(b[2]-a[2])*t];segment(k,part,mat,prev,p,r);prev=p;}
}
function insulator(k,part,x,y,z){
  k.lathe(part,'ceramic',[[0,0],[.07,0],[.13,.04],[.13,.08],[.07,.1],[.12,.14],[.12,.18],[.06,.2],[.06,.26],[0,.27]],{x,y,z,seg:10,smooth:true,ao:false});
}

export function buildArtifacts(k){
  // ── Ohmdal: the Faro in miniature and the line to the patio. ──
  {const {x,z}=ARTIFACTS.ohmdal,P='faro:ohmdal';
    k.box(P,'stoneDark',{x,z,w:1.5,d:1.5,y:0,h:.3,jitter:.02});k.box(P,'stone',{x,z,w:1.2,d:1.2,y:.3,h:.75,jitter:.02});k.box(P,'stone',{x,z,w:1.36,d:1.36,y:1.05,h:.12,jitter:0});
    // Rock of the headland, then the tapering tower with two painted bands.
    k.lathe(P,'stoneDark',[[.58,0],[.6,.12],[.5,.28],[.44,.34],[0,.36]],{x,z,y:1.17,seg:7,phase:.4,tone:[.92,.9,.88]});
    const tower=[[.4,0],[.36,.6],[.32,1.2],[.28,1.8],[.26,2.1]],y0=1.5;
    k.lathe(P,'plaster',tower,{x,z,y:y0,seg:14,smooth:true});
    for(const [b0,b1] of [[.45,.72],[1.25,1.52]]){const r0=.4-b0*.067,r1=.4-b1*.067;k.lathe(P,'curtain',[[r0+.012,0],[r1+.012,b1-b0]],{x,z,y:y0+b0,seg:14,smooth:true,ao:false});}
    for(const a of [0,1.6,3.3])k.box(P,'woodDark',{x:x+Math.cos(a)*.31,z:z+Math.sin(a)*.31,y:y0+.9+a*.12,w:.1,d:.1,h:.16,ry:-a*57.3,jitter:0,ao:false});
    const gy=y0+2.1;k.lathe(P,'bronze',[[.4,0],[.42,.05],[.38,.08],[0,.08]],{x,z,y:gy,seg:16});
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2;k.box(P,'iron',{x:x+Math.cos(a)*.38,z:z+Math.sin(a)*.38,y:gy+.08,w:.02,d:.02,h:.18,jitter:0,ao:false});}
    k.lathe('faro:lamp','faroGlass',[[.22,0],[.22,.42],[0,.42]],{x,z,y:gy+.08,seg:10});
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;k.box(P,'bronze',{x:x+Math.cos(a)*.23,z:z+Math.sin(a)*.23,y:gy+.08,w:.03,d:.03,h:.42,jitter:0,ao:false});}
    k.lathe(P,'copper',[[.3,0],[.24,.1],[.1,.26],[0,.3]],{x,z,y:gy+.5,seg:12,smooth:true});k.cylinder(P,'bronze',{x,z,y:gy+.8,r:.02,h:.22,seg:5});
    // Brass plate on the plinth: the Faro of Ohmdal.
    k.panel(P,'sign:faro',{x,z:z+.61,y:.68,w:.9,h:.28});
    // A pole with porcelain insulators: the line from the workshop to the patio lamps.
    const px=-20.8,pz=-12.2;k.cylinder('line:ohmdal','woodDark',{x:px,z:pz,r:.13,r2:.1,h:5.2,seg:7});
    k.box('line:ohmdal','woodDark',{x:px,z:pz,y:4.7,w:1.4,d:.12,h:.12,jitter:0});
    for(const dx of [-.55,.55])insulator(k,'line:ohmdal',px+dx,4.82,pz);
    const roof=[-24.7,6.1,-10.2];k.box('line:ohmdal','iron',{x:roof[0]+.1,z:roof[2],y:roof[1]-.5,w:.08,d:.08,h:.6,jitter:0,ao:false});insulator(k,'line:ohmdal',roof[0],roof[1]-.02,roof[2]);
    wire(k,'line:ohmdal','copper',[roof[0],roof[1]+.22,roof[2]],[px-.55,5.06,pz],.35,10);
    wire(k,'line:ohmdal','copper',[px+.55,5.06,pz],[-16,4.02,-13.5],.45,12);
  }
  // ── Physica: a glass column where water climbs. ──
  {const {x,z}=ARTIFACTS.physica,P='column:physica';
    k.lathe(P,'stone',[[1.25,0],[1.25,.48],[1.1,.55],[.95,.55],[.95,.2],[0,.2]],{x,z,seg:16,smooth:false});
    k.lathe('basin:physica','water',[[.93,0],[0,0]],{x,z,y:.44,seg:16});
    k.lathe(P,'bronze',[[.62,0],[.68,.06],[.68,.18],[.62,.24],[0,.24]],{x,z,y:.44,seg:20,smooth:true});
    k.lathe('glass:physica','tank',[[.56,0],[.56,3.0]],{x,z,y:.66,seg:24,smooth:true,ao:false});
    k.lathe('glass:physica','tank',[[.54,3.0],[.54,0]],{x,z,y:.66,seg:24,smooth:true,ao:false});
    k.lathe(P,'bronze',[[.6,0],[.66,.05],[.66,.16],[.6,.2],[0,.2]],{x,z,y:3.62,seg:20,smooth:true});
    // The dish that receives the climbing water and lets it spill outside, where it falls.
    k.lathe(P,'bronze',[[.12,0],[.5,.08],[.92,.2],[.98,.26],[.9,.27],[0,.18]],{x,z,y:3.82,seg:20,smooth:true});
    k.lathe('dish:physica','water',[[.86,0],[0,0]],{x,z,y:4.04,seg:18});
    // Four brass stays tie dish and base: the column is an instrument, not a vase.
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;segment(k,P,'bronze',[x+Math.cos(a)*.82,.55,z+Math.sin(a)*.82],[x+Math.cos(a)*.72,3.86,z+Math.sin(a)*.72],.025);}
    // The stone that floats inside, where up is not where it is outside.
    k.pivot('float:physica',x,2.1,z);k.lathe('float:physica','stoneDark',[[0,-.2],[.12,-.17],[.2,-.06],[.19,.06],[.12,.16],[0,.19]],{x,z,y:2.1,seg:12,smooth:true,tone:[1.05,1,.95]});
    k.panel(P,'sign:physica',{x,z:z+1.27,y:.3,w:1.1,h:.22,rx:-10});
  }
  // ── Bitland: a city on a microcontroller, under a lens. ──
  {const {x,z}=ARTIFACTS.bitland,P='chip:bitland';
    k.box(P,'stone',{x,z,w:2.4,d:2.4,y:0,h:.85,jitter:.02});k.box(P,'stoneDark',{x,z,w:2.6,d:2.6,y:.85,h:.1,jitter:0});
    k.box(P,'iron',{x,z,w:1.9,d:1.9,y:.95,h:.16,jitter:0});
    for(let i=0;i<10;i++)for(const s of [-1,1]){const t=-.81+i*.18;
      k.box(P,'bronze',{x:x+s*1.0,z:z+t,w:.16,d:.06,y:.96,h:.04,jitter:0,ao:false});k.box(P,'bronze',{x:x+t,z:z+s*1.0,w:.06,d:.16,y:.96,h:.04,jitter:0,ao:false});}
    k.panel('die:bitland','chip',{x,z,y:1.115,w:1.7,h:1.7,rx:-90});
    // The city: blocks of light that rise toward the core, cyan held inside the chip.
    for(let i=0;i<9;i++)for(let j=0;j<9;j++){const cx=i-4,cz=j-4,core=Math.max(0,1-Math.hypot(cx,cz)/5.4),r=Math.abs(Math.sin(i*12.9898+j*78.233)*43758.5453)%1;
      if(r<.32&&core<.8)continue;const h=.03+core*core*.5*(.4+r*.8);const g=.35+r*.65;
      k.box('city:bitland','cityCyan',{x:x+cx*.16,z:z+cz*.16,y:1.12,w:.09,d:.09,h,tone:[g,g,g],jitter:0,ao:false});}
    // The lens on its arm.
    const ax=x+1.05,az=z-1.05;k.cylinder(P,'iron',{x:ax,z:az,y:.95,r:.07,h:1.9,seg:6});
    // Lens tilted toward the usual point of view, low over the die: the city is seen through it.
    segment(k,P,'iron',[ax,2.8,az],[x+.5,2.05,z-.5],.04);
    k.lathe(P,'bronze',[[.62,0],[.66,.03],[.66,.09],[.62,.12],[.56,.06]],{x:x+.1,z:z-.1,y:1.78,rx:22,rz:-16,seg:24,smooth:true,ao:false});
    k.lathe('lens:bitland','lensGlass',[[0,.07],[.58,.05],[.58,.07],[0,.09]],{x:x+.1,z:z-.1,y:1.78,rx:22,rz:-16,seg:24,smooth:true,ao:false});
    k.panel(P,'sign:bitland',{x,z:z+1.22,y:.45,w:1.1,h:.22});
  }
  // ── Arithmos: a blackboard on an easel, turned toward the patio and the gate. ──
  {const {x,z}=ARTIFACTS.arithmos,P='easel:arithmos',ry=24,r=ry*Math.PI/180,ca=Math.cos(r),sa=Math.sin(r);
    const L=(u,v)=>[x+u*ca+v*sa,z-u*sa+v*ca];
    for(const u of [-1.35,1.35]){const [bx,bz]=L(u,.25),[tx,tz]=L(u*.93,-.05);segment(k,P,'woodDark',[bx,0,bz],[tx,3.05,tz],.06);}
    {const [bx,bz]=L(0,-1.2),[tx,tz]=L(0,-.15);segment(k,P,'woodDark',[bx,0,bz],[tx,2.95,tz],.05);}
    const [cx,cz]=L(0,.02);k.panel('board:arithmos','yard',{x:cx,z:cz,y:1.9,w:2.5,h:1.55,ry,rx:-6});
    for(const dy of [-.82,.82]){const [fx,fz]=L(0,.04+(dy<0?-.06:.06)*.1);k.box(P,'wood',{x:fx,z:fz,y:1.9+dy-.05,w:2.66,d:.08,h:.1,ry,jitter:0});}
    {const [fx,fz]=L(0,.15);k.box(P,'wood',{x:fx,z:fz,y:1.02,w:2.4,d:.18,h:.05,ry,jitter:0});for(let i=0;i<3;i++){const [sx,sz]=L(-.6+i*.35,.18);k.box(P,'paint',{x:sx,z:sz,y:1.07,w:.16,d:.04,h:.04,ry,tone:[.96,.95,.9],jitter:0,ao:false});}}
  }
}
