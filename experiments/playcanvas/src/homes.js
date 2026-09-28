import {Entity,StandardMaterial,Color,Vec2} from 'playcanvas';
import {surface} from './art.ts';
import props from './data/props.json';
import {footprint} from './dressing.js';
import {DIALOGUES} from './game/content.js';

// Interiores de las casas con puerta: cruzar la puerta funde a negro y lleva a su cuarto,
// como en los RPG clásicos; al volver a salir, se aparece frente a la misma puerta.
// Cada casa usa un oficio (hogar, panadería, tienda, molino, forja, posada, pescador) que
// decide sus muebles; todos son piezas del kit de Blender (scripts/blender/props-kit.py).
import {ROOM,HOMES,placements} from './home-layouts.js';
export {ROOM};
const n=(speaker,text)=>({speaker,text});
Object.assign(DIALOGUES,{
  home_porteros_book:[n('narrator','Cuarenta años de firmas: profesores del Instituto Roxana, alumnos que llegaron con miedo y se fueron con un circuito en la mano.'),n('ohm','La última página está en blanco. Tu nombre cabría en la primera línea.')],
  home_bakery_oven:[n('narrator','El horno sigue tibio. Marin lo enciende antes del alba y lo cuida como a un vecino más.'),n('ohm','La bóveda guarda el calor: por eso el pan se cuece parejo aunque la leña ya no arda.')],
  home_civic_books:[n('narrator','Actas del consejo, atadas con hilo. En los márgenes, alguien dibujó los caminos de cobre de todo el reino.')],
  home_market_ledger:[n('narrator','Una libreta de cuentas: harina, manzanas, cera. Al pie de cada hoja, lo que se fió a quien no podía pagar.'),n('ohm','La suma de lo que se debe no cambia lo que se comparte. Anoto la diferencia.')],
  home_inn_counter:[n('narrator','Sobre el mostrador, una jarra y un mapa manchado de viajeros que siguieron la Calzada hacia el norte.')],
  home_wheel_stone:[n('narrator','La piedra de moler descansa. Cuando la rueda gira, el grano cae por el ojo del centro y sale harina por los bordes.')],
  home_forge_anvil:[n('narrator','El yunque tiene la cara lisa de tanto golpe. A su lado, un balde de agua para templar.'),n('ohm','El hierro caliente conduce peor. Yesca lo sabe sin haberlo medido nunca.')],
  home_mill_stone:[n('narrator','Harina en el aire, fina como niebla. Las aspas de afuera mueven esta piedra.')],
  home_lake_nets:[n('narrator','Redes colgadas a secar, remendadas con hilo de otro color. Huelen a lago y a sol.')],
});

const WALLS={stone:['stone','#ffffff',4],plaster:['plaster','#fffaf0',3],timber:['timber','#ffffff',4.5]};
async function textured(app,name,tint,repeat){const m=new StandardMaterial();m.diffuseMap=await surface(app,name);m.diffuse=new Color().fromString(tint);m.diffuseMapTiling=new Vec2(...repeat);m.update();return m;}
function flat(hex,emissive=0){const m=new StandardMaterial();m.diffuse=new Color().fromString(hex);if(emissive){m.emissive=new Color().fromString(hex);m.emissiveIntensity=emissive;}m.update();return m;}
function slab(parent,material,x,y,z,sx,sy,sz){const e=new Entity();e.addComponent('render',{type:'box',castShadows:true,receiveShadows:true});e.render.material=material;e.setLocalPosition(x,y,z);e.setLocalScale(sx,sy,sz);parent.addChild(e);return e;}

// Construye un cuarto por puerta, lejos del reino (x ≥ 600): nunca se ve desde afuera.
export async function buildHomes(world,template){
  const app=world.app,[w,d]=ROOM,h=5.4;world.homes=new Map();let index=0;
  for(const [areaId,area] of Object.entries(world.data.areas)){
    for(const door of area.entrances||[]){
      const def=HOMES[door.id];if(!def)continue;
      const region='home:'+door.id,offset=[600+index++*40,0],root=new Entity('Interior · '+door.label);app.root.addChild(root);root.setLocalPosition(offset[0],0,offset[1]);root.enabled=false;
      const [wall,tint,tile]=WALLS[def.walls];
      slab(root,await textured(app,'wood','#e8d8c0',[w/2.4,d/2.4]),0,-.1,0,w,.2,d);
      slab(root,await textured(app,wall,tint,[w/tile,h/tile]),0,h/2,-d/2,w+.6,h,.3);
      for(const side of [-1,1])slab(root,await textured(app,wall,tint,[d/tile,h/tile]),side*w/2,h/2,0,.3,h,d);
      const low=await textured(app,wall,tint,[w/2/tile,.9/tile]);for(const side of [-1,1])slab(root,low,side*(w/4+.75),.45,d/2,w/2-1.5,.9,.3);
      const beam=flat('#4a3526');for(const x of [-3.5,3.5])slab(root,beam,x,h/2,-d/2+.2,.35,h,.25);slab(root,beam,0,h-.2,-d/2+.22,w,.3,.3);slab(root,beam,0,.08,-d/2+.17,w,.16,.08);
      const pane=flat('#e4ecd6',.9),frame=flat('#5a4230');for(const x of [-1.9,1.9]){slab(root,frame,x,3.55,-d/2+.16,1.35,1.55,.1);slab(root,pane,x,3.55,-d/2+.2,1.1,1.3,.04);}
      // Luz de día que entra por las ventanas: fría, suave, desde arriba.
      for(const x of [-1.9,1.9]){const l=new Entity('Ventana');l.addComponent('light',{type:'omni',color:new Color(.75,.85,1),intensity:1.1,range:9,castShadows:false});l.setLocalPosition(x,3.4,-d/2+1.6);root.addChild(l);}
      const obstacles=[];
      for(const [kind,x,z,rotation,y] of placements(def.kind,props)){
        const source=template.findByName(kind);if(!source)continue;const e=source.clone();e.setLocalPosition(x,y,z);e.setLocalEulerAngles(0,rotation,0);root.addChild(e);
        if(kind==='candle'||kind==='hearth'||kind==='oven'){const l=new Entity('Vela');l.addComponent('light',{type:'omni',color:new Color(1,.7,.38),intensity:kind==='candle'?1.6:2.4,range:kind==='candle'?6:8,castShadows:false});l.setLocalPosition(x,y+(kind==='candle'?.5:1.2),z+(kind==='candle'?0:.9));root.addChild(l);}
        if(y>0||kind==='rug'||kind==='candle')continue;const f=footprint(kind,rotation,props);if(f)obstacles.push({x:x+f.x,z:z+f.z,w:f.w,d:f.d});
      }
      const [lx,lz,label,dialogue]=def.look;
      world.data.areas[region]={offset,obstacles:[],walkSurfaces:[]};world.regions.set(region,{root,actors:[]});
      world.homes.set(door.id,{id:door.id,region,area:areaId,door,label:door.label,bounds:[w,d],obstacles,root,
        objects:[{id:region+':look',kind:'inspect',x:lx,z:lz,label:'Mirar · '+label,dialogue,radius:1.6},{id:region+':leave',kind:'exit',x:0,z:d/2-.9,label:'Salir',door:{leave:true},radius:1.3}]});
    }
  }
}
