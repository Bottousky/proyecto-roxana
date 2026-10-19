// Where everything stands on the campus, as plain data with no imports: the 3D school (school.js), its rooms
// (rooms.js) and the classic home's site plan read the same numbers, so a page without 3D draws the real campus.
// Axes: x east, z south (toward the default camera), y up. The island top is y = 0.
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
  // The north range faces the patio and the master camera: the Anfiteatro (low, seen whole across the open
  // patio) west of the Dirección, the Sala de Trofeos (tall, clear of Programación's roof) east of it.
  // In the back corners the workshops hid them.
  trofeos:{x:19,z:-23.5,w:14,d:9,h:6.2,rise:2.8,roof:'slate',cut:['s']},
  ...Object.fromEntries(Object.entries(TALLERES).map(([id,t])=>[id,{x:t.x,z:t.z,w:11,d:14,h:5.8,rise:3,roof:'slate',alongZ:true,cut:[t.side,'s']}])),
};
export const TOWER={x:0,z:-28.6,s:4.6,shaft:14};
export const AMPHI={x:-19.6,z:-27.2,screenW:9.6,screenH:5.2,tiers:4,r0:4};
export const FOUNTAIN={x:0,z:0,r:4.2};
export const LAMPS=[[-6.5,-4.5],[6.5,-4.5],[-6.5,5.5],[6.5,5.5],[-16,-13.5],[16,-13.5],[-19.5,-2],[19.5,-2],[-19.5,12],[19.5,12],[-15,17.5],[15,17.5],[-3.6,23],[3.6,23],[-3.6,30],[3.6,30]];
export const PLANTERS=[[-9,-7.5],[9,-7.5],[-9,8],[9,8]];
// Trophy stands: one tiered stand per world, twelve places each, front row first.
export const STANDS=(()=>{const b=BUILDINGS.trofeos,out={};WORLD_ORDER.forEach((w,wi)=>{const cx=b.x-5.1+wi*3.4,back=b.z-b.d/2+.34+.35,list=[];
  for(let t=0;t<3;t++)for(let j=0;j<4;j++)list.push([cx-1.2+j*.8,.52+t*.42,back+(2-t)*.62+.3]);out[w]=list;});return out;})();
