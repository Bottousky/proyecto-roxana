// Geometry by code for the Instituto diorama, after the approved Ohmdal recipe:
// flat-shaded facets, UVs projected from world coordinates on each face's dominant
// axis, and vertex colours as multipliers (grime low, wear on edges, per-piece jitter).
// Pieces accumulate by (part, material) and become one mesh each, so a building is a
// handful of draw calls and a part (a roof, a wall, a gate leaf) can move as a whole.
import {Mat4,Vec3,Quat,Mesh,MeshInstance,Entity} from 'playcanvas';

const tmp=new Vec3(),tmpN=new Vec3(),m4=new Mat4(),q=new Quat(),nm=new Mat4();

function hash(n){n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return ((n^(n>>>16))>>>0)/4294967296;}

export class Kit {
  constructor(){this.parts=new Map();this.piece=0;this.uvScale={};this.pivots=new Map();}
  /** Geometry of a moving part is stored relative to its pivot. */
  pivot(part,x,y,z){this.pivots.set(part,[x,y,z]);return part;}
  bucket(part,mat){
    if(!this.parts.has(part))this.parts.set(part,new Map());
    const p=this.parts.get(part);if(!p.has(mat))p.set(mat,{pos:[],nor:[],uv:[],col:[]});return p.get(mat);
  }
  // Emit one triangle in world space. `tone` multiplies the vertex colour.
  tri(part,mat,a,b,c,{tone=[1,1,1],uv=null,ao=true,local=null,normals=null}={}){
    const bk=this.bucket(part,mat),piv=this.pivots.get(part)||[0,0,0];
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    const s=this.uvScale[mat]||.33,ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);
    [a,b,c].forEach((p,i)=>{
      bk.pos.push(p[0]-piv[0],p[1]-piv[1],p[2]-piv[2]);if(normals)bk.nor.push(...normals[i]);else bk.nor.push(nx,ny,nz);
      if(uv)bk.uv.push(uv[i][0],uv[i][1]);
      else if(ay>=ax&&ay>=az)bk.uv.push(p[0]*s,p[2]*s);
      else if(ax>=az)bk.uv.push(p[2]*s*(nx>0?-1:1),p[1]*s);
      else bk.uv.push(p[0]*s*(nz>0?1:-1),p[1]*s);
      // Grime rises from the ground; faces pointing down sit in their own shadow.
      const h=local?p[1]-local:p[1],grime=ao?.66+.34*Math.min(1,Math.max(0,h/1.6)):1,under=ny<-.5?.72:1;
      const k=grime*under;bk.col.push(tone[0]*k,tone[1]*k,tone[2]*k,1);
    });
  }
  quad(part,mat,a,b,c,d,o={}){
    if(o.uv){const [u0,u1,u2,u3]=o.uv;this.tri(part,mat,a,b,c,{...o,uv:[u0,u1,u2]});this.tri(part,mat,a,c,d,{...o,uv:[u0,u2,u3]});return;}
    this.tri(part,mat,a,b,c,o);this.tri(part,mat,a,c,d,o);
  }
  jitter(amount=.08){const r=hash(++this.piece*9973+17);return 1-amount+r*amount*2;}
  toneFor(o){const j=o.jitter===0?1:this.jitter(o.jitter??.06),t=o.tone||[1,1,1];return [t[0]*j,t[1]*j,t[2]*j];}
  transform(o){
    q.setFromEulerAngles(o.rx||0,o.ry||0,o.rz||0);m4.setTRS(new Vec3(o.x||0,o.y||0,o.z||0),q,Vec3.ONE);return m4;
  }
  /** Box centred on x,z with its base at y. Faces in `skip` ('top','bottom','n','s','e','w') are omitted. */
  box(part,mat,{x=0,y=0,z=0,w=1,h=1,d=1,rx=0,ry=0,rz=0,skip=[],tone,jitter,ao=true}={}){
    const m=this.transform({x,y,z,rx,ry,rz}),t=this.toneFor({tone,jitter});
    const X=w/2,Z=d/2,P=(px,py,pz)=>{m.transformPoint(tmp.set(px,py,pz),tmp);return [tmp.x,tmp.y,tmp.z];};
    const v=[P(-X,0,-Z),P(X,0,-Z),P(X,0,Z),P(-X,0,Z),P(-X,h,-Z),P(X,h,-Z),P(X,h,Z),P(-X,h,Z)];
    const o={tone:t,ao,local:ao==='local'?y:null};
    if(!skip.includes('top'))this.quad(part,mat,v[4],v[7],v[6],v[5],o);
    if(!skip.includes('bottom'))this.quad(part,mat,v[0],v[1],v[2],v[3],o);
    if(!skip.includes('s'))this.quad(part,mat,v[3],v[2],v[6],v[7],o);
    if(!skip.includes('n'))this.quad(part,mat,v[1],v[0],v[4],v[5],o);
    if(!skip.includes('e'))this.quad(part,mat,v[2],v[1],v[5],v[6],o);
    if(!skip.includes('w'))this.quad(part,mat,v[0],v[3],v[7],v[4],o);
  }
  /** Surface of revolution from a profile of [radius,height] pairs (bottom to top). */
  lathe(part,mat,profile,{x=0,y=0,z=0,seg=12,rx=0,ry=0,rz=0,tone,jitter,ao=true,phase=0,sx=1,sz=1,smooth=false}={}){
    const m=this.transform({x,y,z,rx,ry,rz}),t=this.toneFor({tone,jitter}),o={tone:t,ao,local:ao==='local'?y:null};
    const P=(r,h,i)=>{const a=(i/seg)*Math.PI*2+phase;m.transformPoint(tmp.set(Math.cos(a)*r*sx,h,Math.sin(a)*r*sz),tmp);return [tmp.x,tmp.y,tmp.z];};
    // Smooth normals follow the profile's slope at each ring, around the axis.
    const slope=k=>{const a=profile[Math.max(0,k-1)],b=profile[Math.min(profile.length-1,k+1)],dr=b[0]-a[0],dh=b[1]-a[1],l=Math.hypot(dr,dh)||1;return [dh/l,-dr/l];};
    const N=(k,i)=>{const [nr,ny]=slope(k),a=(i/seg)*Math.PI*2+phase;m.transformVector(tmpN.set(Math.cos(a)*nr/sx,ny,Math.sin(a)*nr/sz),tmpN).normalize();return [tmpN.x,tmpN.y,tmpN.z];};
    for(let k=0;k<profile.length-1;k++){
      const [r0,h0]=profile[k],[r1,h1]=profile[k+1];
      for(let i=0;i<seg;i++){
        const a=P(r0,h0,i),b=P(r0,h0,i+1),c=P(r1,h1,i+1),d=P(r1,h1,i);
        const nn=smooth?{a:N(k,i),b:N(k,i+1),c:N(k+1,i+1),d:N(k+1,i)}:null;
        if(r0>1e-4&&r1>1e-4){if(nn){this.tri(part,mat,a,d,c,{...o,normals:[nn.a,nn.d,nn.c]});this.tri(part,mat,a,c,b,{...o,normals:[nn.a,nn.c,nn.b]});}else this.quad(part,mat,a,d,c,b,o);}
        else if(r0>1e-4)this.tri(part,mat,a,d,b,nn?{...o,normals:[nn.a,nn.d,nn.b]}:o);else if(r1>1e-4)this.tri(part,mat,a,d,c,nn?{...o,normals:[nn.a,nn.d,nn.c]}:o);
      }
    }
  }
  cylinder(part,mat,{r=.5,r2,h=1,cap=true,...o}={}){
    const top=r2??r;this.lathe(part,mat,cap?[[0,0],[r,0],[top,h],[0,h]]:[[r,0],[top,h]],o);
  }
  /** Gable roof: two sloped slabs and optional gable ends. Ridge runs along x unless `alongZ`. */
  gable(part,mat,{x=0,y=0,z=0,w=6,d=4,rise=2,overhang=.45,thick=.22,alongZ=false,ends=null,endsPart=null,tone,ry=0}={}){
    const half=(alongZ?w:d)/2+overhang,len=(alongZ?d:w)+overhang*2,slope=Math.hypot(half,rise),angle=Math.atan2(rise,half)*180/Math.PI;
    const t=this.toneFor({tone,jitter:.04});
    for(const side of [-1,1]){
      const cx=alongZ?x+side*half/2:x,cz=alongZ?z:z+side*half/2,cy=y+rise/2-thick/2;
      if(alongZ)this.box(part,mat,{x:cx,y:cy,z:cz,w:slope,h:thick,d:len,rz:side*angle*-1,ry,tone:t,jitter:0,ao:false});
      else this.box(part,mat,{x:cx,y:cy,z:cz,w:len,h:thick,d:slope,rx:side*angle,ry,tone:t,jitter:0,ao:false});
    }
    if(ends){ // triangular gables under the roof, flush with the walls
      const hw=(alongZ?w:d)/2,hl=(alongZ?d:w)/2,p=endsPart||part;
      for(const s of [-1,1]){
        const A=alongZ?[x-hw,y,z+s*hl]:[x+s*hl,y,z-hw],B=alongZ?[x+hw,y,z+s*hl]:[x+s*hl,y,z+hw],C=alongZ?[x,y+rise-thick,z+s*hl]:[x+s*hl,y+rise-thick,z];
        this.facing(p,ends,A,B,C,alongZ?[0,0,s]:[s,0,0],{ao:false});
      }
    }
  }
  /** Semicircular arch of voussoirs standing on y, its face turned by ry (degrees). */
  arch(part,mat,{x=0,y=0,z=0,r=1.4,thick=.45,depth=.6,seg=9,ry=0,tone}={}){
    const t=this.toneFor({tone,jitter:.03}),rad=ry*Math.PI/180,ax=[Math.cos(rad),0,-Math.sin(rad)],dz=[Math.sin(rad)*depth/2,0,Math.cos(rad)*depth/2];
    const P=(a,rr,f)=>[x+ax[0]*Math.cos(a)*rr+f*dz[0],y+Math.sin(a)*rr,z+ax[2]*Math.cos(a)*rr+f*dz[2]];
    for(let i=0;i<seg;i++){
      const a0=Math.PI*i/seg,a1=Math.PI*(i+1)/seg,o={tone:[t[0]*this.jitter(.06),t[1],t[2]],ao:false},R=r+thick,c=[x,y,z];
      const fi0=P(a0,r,1),fi1=P(a1,r,1),fo0=P(a0,R,1),fo1=P(a1,R,1),bi0=P(a0,r,-1),bi1=P(a1,r,-1),bo0=P(a0,R,-1),bo1=P(a1,R,-1);
      const mid=(a,rr)=>{const p=P(a,rr,0);return [p[0]-c[0],p[1]-c[1],p[2]-c[2]];};
      this.facingQuad(part,mat,fi0,fo0,fo1,fi1,[dz[0],0,dz[2]],o);
      this.facingQuad(part,mat,bi0,bi1,bo1,bo0,[-dz[0],0,-dz[2]],o);
      this.facingQuad(part,mat,fo0,bo0,bo1,fo1,mid((a0+a1)/2,1),o);
      const inward=mid((a0+a1)/2,1);this.facingQuad(part,mat,fi0,fi1,bi1,bi0,[-inward[0],-inward[1],-inward[2]],o);
      if(i===0)this.facingQuad(part,mat,fi0,bi0,bo0,fo0,[0,-1,0],o);
      if(i===seg-1)this.facingQuad(part,mat,fi1,fo1,bo1,bi1,[0,-1,0],o);
    }
  }
  /** A triangle or quad wound so its normal agrees with `dir`. */
  facing(part,mat,a,b,c,dir,o={}){
    const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(n[0]*dir[0]+n[1]*dir[1]+n[2]*dir[2]<0)this.tri(part,mat,a,c,b,o);else this.tri(part,mat,a,b,c,o);
  }
  facingQuad(part,mat,a,b,c,d,dir,o={}){this.facing(part,mat,a,b,c,dir,o);this.facing(part,mat,a,c,d,dir,o);}
  /** Flat quad with 0..1 UVs, for panes, signs and screens. Normal faces +z before rotation. */
  panel(part,mat,{x=0,y=0,z=0,w=1,h=1,rx=0,ry=0,rz=0,tone=[1,1,1],flipU=false}={}){
    const m=this.transform({x,y,z,rx,ry,rz}),P=(px,py)=>{m.transformPoint(tmp.set(px,py,0),tmp);return [tmp.x,tmp.y,tmp.z];};
    const u0=flipU?1:0,u1=flipU?0:1;
    this.quad(part,mat,P(-w/2,-h/2),P(w/2,-h/2),P(w/2,h/2),P(-w/2,h/2),{tone,ao:false,uv:[[u0,0],[u1,0],[u1,1],[u0,1]]});
  }
  /** Turn every accumulated part into an entity with one mesh instance per material. */
  build(app,materials,root,{shadows=true}={}){
    const entities=new Map();
    for(const [part,mats] of this.parts){
      const e=new Entity(part),instances=[];const piv=this.pivots.get(part);if(piv)e.setLocalPosition(...piv);
      for(const [mat,b] of mats){
        const material=materials[mat];if(!material)throw new Error('Material sin definir: '+mat);
        const mesh=new Mesh(app.graphicsDevice),n=b.pos.length/3,idx=new Uint32Array(n);for(let i=0;i<n;i++)idx[i]=i;
        mesh.setPositions(new Float32Array(b.pos));mesh.setNormals(new Float32Array(b.nor));mesh.setUvs(0,new Float32Array(b.uv));mesh.setColors(new Float32Array(b.col));mesh.setIndices(idx);mesh.update();
        const mi=new MeshInstance(mesh,material,e);mi.castShadow=shadows&&!material.noShadow&&material.opacity===1&&material.useLighting!==false;mi.receiveShadow=material.useLighting!==false;
        instances.push(mi);
      }
      e.addComponent('render',{meshInstances:instances});root.addChild(e);entities.set(part,e);
    }
    return entities;
  }
}
