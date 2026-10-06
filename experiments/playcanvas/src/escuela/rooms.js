import {ARTIFACT_PICKS,NOTICE_BOARD as NB} from './artifacts.js';
import {BUILDINGS,AMPHI} from './school.js';
const TR=BUILDINGS.trofeos,AM=AMPHI;
// The places of the Instituto that the diorama can open. Poses are orbit parameters
// around `target`: yaw (degrees, positive = camera to the east), pitch, distance.
// The label's pin sits on the workshop's south gable, by its medallion: the face the master camera sees (the
// east workshops' doors face west, away from it), so it marks that building and covers none behind it.
const taller=(x,z,yaw,world)=>({world,anchor:[x,7.6,z+7.2],pick:[[x-5.9,0,z-7.3],[x+5.9,9.6,z+7.3]],pose:{target:[x,1.8,z-.2],yaw,pitch:46,distance:44}});
export const ROOMS={
  novedades:{name:'Cartelera',short:'Novedades',eyebrow:'Del Instituto',anchor:[NB.x,4.1,NB.z],pick:[[NB.x-2,0,NB.z-1.2],[NB.x+2,3.6,NB.z+1.2]],
    pose:{target:[NB.x,1.9,NB.z],yaw:NB.ry-6,pitch:10,distance:17}},
  patio:{name:'Patio de Roxana',short:'Sobre Roxana',eyebrow:'El centro de la escuela',anchor:[0,7.4,0],pick:[[-5,0,-5],[5,7.5,5]],
    pose:{target:[0,2.4,0],yaw:12,pitch:34,distance:45}},
  direccion:{name:'Dirección',short:'Dirección',eyebrow:'Tu cuenta',anchor:[0,10.4,-18.6],pick:[[-9.8,0,-31.5],[9.8,11,-16]],
    pose:{target:[0,2.2,-22],yaw:0,pitch:44,distance:46}},
  electronica:{name:'Taller de Electrónica',short:'Electrónica',eyebrow:'Ohmdal · conectar',...taller(-30,-4,40,'ohmdal')},
  fisica:{name:'Taller de Física',short:'Física',eyebrow:'Physica · experimentar',...taller(-30,13,40,'physica')},
  programacion:{name:'Taller de Programación',short:'Programación',eyebrow:'Bitland · programar',...taller(30,-4,-40,'bitland')},
  matematica:{name:'Taller de Matemática',short:'Matemática',eyebrow:'Arithmos · transformar',...taller(30,13,-40,'arithmos')},
  // Both follow their buildings' coordinates in school.js.
  trofeos:{name:'Sala de Trofeos',short:'Trofeos',eyebrow:'Tus logros',anchor:[TR.x,10.8,TR.z+2],pick:[[TR.x-7.3,0,TR.z-5],[TR.x+7.3,10,TR.z+7.4]],
    pose:{target:[TR.x,1.8,TR.z-.6],yaw:0,pitch:40,distance:38}},
  anfiteatro:{name:'Anfiteatro',short:'Anfiteatro',eyebrow:'Cinemáticas y videos',anchor:[AM.x,9.4,AM.z-1.2],pick:[[AM.x-AM.r0-AM.tiers*1.15+.2,0,AM.z-2.6],[AM.x+AM.r0+AM.tiers*1.15,8,AM.z+1.6+AM.r0+AM.tiers*1.15]],
    pose:{target:[AM.x,3.2,AM.z+2.4],yaw:-6,pitch:24,distance:42}},
};
// Each workshop can also be entered from its artifact on the lawn.
for(const [id,box] of Object.entries(ARTIFACT_PICKS))ROOMS[id].picks=[ROOMS[id].pick,box];
export const OVERVIEW={target:[0,3.5,-3],yaw:32,pitch:20,distance:108};
export const ROOM_ORDER=['direccion','electronica','fisica','programacion','matematica','trofeos','anfiteatro','novedades','patio'];
export const TALLER_ROOMS=['electronica','fisica','programacion','matematica'];

// Where the camera goes to show each restoration returning to the school.
export const SHOWCASE=[
  {target:[-23,2,-3],yaw:50,pitch:30,distance:30},       // awaken: the Taller window and Ohm
  {target:[-26,2.4,-4],yaw:55,pitch:34,distance:38},     // workshop
  {target:[0,2.2,33.5],yaw:-8,pitch:22,distance:26},     // gate
  {target:[0,2.2,0],yaw:15,pitch:30,distance:24},        // pump
  {target:[0,1.5,2],yaw:0,pitch:52,distance:72},         // distribution: lamps
  {target:[0,1,0],yaw:-20,pitch:44,distance:40},         // irrigation: planters
  {target:[0,4,-17.5],yaw:8,pitch:18,distance:30},       // beacon_link: banners
  {target:[0,15.6,-28.6],yaw:0,pitch:12,distance:26},    // beacon_network: the bell
  {target:[0,16,-26],yaw:10,pitch:24,distance:62},       // beacon_lens: lantern
  {target:[0,1.5,3],yaw:-10,pitch:30,distance:32},       // epilogue: visitors
];
