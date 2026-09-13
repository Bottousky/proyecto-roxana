// Snapshot the renderer-independent game into this branch. Runtime stays standalone.
import fs from 'node:fs';
const root=new URL('../../src/',import.meta.url),out=new URL('./src/game/',import.meta.url);
fs.mkdirSync(out,{recursive:true});
const modules=['main','state','content','electrical','puzzle-model','puzzles','bench-evidence','journal','field-notes','audio','world-circuits','world-feedback','world-inhabitants','world-interaction','world-audio','world-map','world-layout','kingdom-geography','story-time','travel-instrument','cinematics','cinematic-progress','interaction-prompt','navigation','collision','actor-animation'];
for(const name of modules){
 let text=fs.readFileSync(new URL(name+'.js',root),'utf8');
 if(name==='main')text=text.replace("import {ContinuousWorld as World} from './continuous-world.js';","import {PlayCanvasWorld as World} from '../world.js';\nimport '../fonts.css';").replace(/^import '@fontsource\/.*\r?\n/gm,'').replaceAll('Jugar Ohmdal.cmd','Jugar PlayCanvas.cmd');
 if(name==='state')text=text.replace("'ohmdal.la-luz.v1'","'ohmdal.playcanvas.arc1.v1'").replace("'ohmdal.settings.v1'","'ohmdal.playcanvas.settings.v1'");
 if(name==='content')text=text.replace("secret('lake_secret', 11, 7.5,", "secret('lake_secret', 3, 9.5,");
 if(name==='world-inhabitants')text=text.replace('if (actor.g === world.player || !object?.character) continue;', 'if (actor.g === world.player || !object?.character || actor.inhabitant) continue;');
 if(name==='kingdom-geography')text=text.replace('[25,-245]','[34,-245]');
 if(name==='main')text=text.replace("if(world && started && mode!=='title'", "if(world && !world.disposed && started && mode!=='title'");
 if(name==='world-map')text=text.replace('href="/assets/art-polish/map-landmarks.png"','href="./assets/art-polish/map-landmarks.png"');
 fs.writeFileSync(new URL(name+'.js',out),text);
}
// Layout only needs the footprints, never the Three.js builder.
const water=fs.readFileSync(new URL('world-waterworks.js',root),'utf8');
fs.writeFileSync(new URL('world-waterworks.js',out),water.slice(water.indexOf('export const SPRING'),water.indexOf('\nfunction water'))+'\nexport const LIGHTHOUSE_ISLET_RADIUS = 4.3;\n');
for(const name of ['style','interface','atlas','art-polish','puzzles','travel-instrument'])fs.copyFileSync(new URL(name+'.css',root),new URL(name+'.css',out));
fs.cpSync(new URL('../../public/assets/',import.meta.url),new URL('./public/assets/',import.meta.url),{recursive:true});
const fonts=new URL('./public/fonts/',import.meta.url);fs.mkdirSync(fonts,{recursive:true});let css='';
for(const [name,family] of [['inter','Inter'],['cormorant-garamond','Cormorant Garamond']])for(const weight of [400,500,600]){const filename=`${name}-latin-${weight}-normal.woff2`;fs.copyFileSync(new URL(`../../node_modules/@fontsource/${name}/files/${filename}`,import.meta.url),new URL(filename,fonts));css+=`@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url('/fonts/${filename}') format('woff2')}\n`;}
fs.writeFileSync(new URL('./src/fonts.css',import.meta.url),css);
for(const name of ['inter','cormorant-garamond'])fs.copyFileSync(new URL(`../../node_modules/@fontsource/${name}/LICENSE`,import.meta.url),new URL(name+'-LICENSE.txt',fonts));
console.log('Canon, puzzles, HUD, journal, map, audio and assets copied. No runtime renderer copied.');
