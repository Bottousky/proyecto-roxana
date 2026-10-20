// The look and the traveller's appearance, without the engine: the title screen and the register
// read them before PlayCanvas is downloaded (2026-10-19, rendimiento). src/style.js re-exports them.
const KEY='ohmdal.estilo';
export const STYLE=(()=>{
  const asked=new URLSearchParams(globalThis.location?.search||'').get('estilo');
  try{if(asked==='xy'||asked==='hd2d')globalThis.localStorage?.setItem(KEY,asked);}catch{}
  let kept=null;try{kept=globalThis.localStorage?.getItem(KEY);}catch{}
  return (asked||kept)==='hd2d'?'hd2d':'xy';
})();
export const XY=STYLE==='xy';
globalThis.document?.documentElement?.setAttribute('data-estilo',STYLE);

export const PEOPLE=new URLSearchParams(globalThis.location?.search||'').get('gente');
export const PEOPLE_3D=XY&&PEOPLE!=='sprites'&&PEOPLE!=='dibujo';

export const APPEARANCE={
  pelo:{castaño:'#6a4532',oscuro:'#2c221e',rubio:'#d2a95a',pelirrojo:'#a9492a',ceniza:'#a49d95',azul:'#3d5d9a'},
  piel:{'1':'#f6d9c3','2':'#f0c7a6','3':'#d9a27c','4':'#b97a52','5':'#8c5536','6':'#5e3624'},
  ropa:{'verde azulado':'#2f6f80',granate:'#7a2f36',bosque:'#3b6a3c',azul:'#2c4e8e',mostaza:'#b4862e',grafito:'#4c5058'},
  bufanda:{mostaza:'#e5a63d',roja:'#c7413a',blanca:'#ece6da',verde:'#5e9b4f',violeta:'#7c58a8',celeste:'#6fb4d6'},
};
/** What the traveller looks like at first: the colours of the model as it was painted. */
export const APPEARANCE_DEFAULT={pelo:'castaño',piel:'2',ropa:'verde azulado',bufanda:'mostaza'};
/** The traveller's look, by name, kept in the Instituto Roxana's register beside the name. */
export function savedAppearance(){try{const a=JSON.parse(globalThis.localStorage?.getItem('roxana.escuela.v1')||'null')?.apariencia;return a&&typeof a==='object'?Object.fromEntries(Object.keys(APPEARANCE).filter(k=>APPEARANCE[k][a[k]]).map(k=>[k,a[k]])):{};}catch{return {};}}
/** Names to colours. The address can still ask for one (?pelo=rubio&piel=4&ropa=granate&bufanda=roja). */
export function appearanceColours(names){return Object.fromEntries(Object.keys(APPEARANCE).map(k=>[k,APPEARANCE[k][names?.[k]]??null]).filter(([,v])=>v));}
export function chosenAppearance(){const q=new URLSearchParams(globalThis.location?.search||'');return appearanceColours({...savedAppearance(),...Object.fromEntries(Object.keys(APPEARANCE).filter(k=>q.get(k)).map(k=>[k,q.get(k)]))});}
