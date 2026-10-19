// Filma las escenas de restauración para el Anfiteatro del Instituto.
// Usa la página de revisión (estado en memoria, sin partidas), el screencast de Chrome
// y ffmpeg. Deja en public/escuela/cine/ un .mp4, un póster .webp y subtítulos .vtt.
// Uso: node scripts/film-cinematics.mjs [id,id…]   (ESCUELA_URL, por defecto :4192)
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,rmSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {CINEMATIC_DEFINITIONS} from '../src/game/cinematics.js';

const base=process.env.ESCUELA_URL||'http://127.0.0.1:4192/';
const ids=(process.argv[2]||Object.keys(CINEMATIC_DEFINITIONS).join(',')).split(',');
const out=fileURLToPath(new URL('../public/escuela/cine/',import.meta.url));
mkdirSync(out,{recursive:true});
const PHASE={awaken:0,workshop:0,gate:0,pump:0,irrigation:3,beacon_network:4,beacon_lens:4};
const W=1280,H=720,FPS=30;
const stamp=s=>{const m=Math.floor(s/60),r=(s%60).toFixed(3).padStart(6,'0');return `00:${String(m).padStart(2,'0')}:${r}`;};

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
page.on('pageerror',e=>console.log('pageerror:',e.message));
await page.goto(base+'scripts/qa-direction.html');
await page.waitForFunction(()=>!document.querySelector('#visit').disabled,null,{timeout:180000});
await page.evaluate(()=>document.body.classList.add('qa-controls-hidden'));
const cdp=await page.context().newCDPSession(page);

for(const id of ids){
  const def=CINEMATIC_DEFINITIONS[id];if(!def){console.log('sin definición:',id);continue;}
  await page.evaluate(([area,phase])=>{
    const set=(sel,v)=>{const s=document.querySelector(sel);s.value=v;s.dispatchEvent(new Event('change'));};
    set('#area',area);set('#phase',String(phase));set('#condition','ready');document.querySelector('#visit').click();
  },[def.area,PHASE[id]??0]);
  await page.waitForTimeout(4500);
  const frames=[];let recording=true;
  const onFrame=async f=>{if(recording)frames.push({data:f.data,t:f.metadata.timestamp});try{await cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId});}catch{}};
  cdp.on('Page.screencastFrame',onFrame);
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:W,maxHeight:H,everyNthFrame:1});
  await page.waitForTimeout(500);
  const started=await page.evaluate(id=>{const w=window.__qaWorld;w.state.flags[id]=true;if(id==='beacon_lens')w.state.flags.finale_seen=true;w.updateFlags(w.state);w.playRestoration(id);return w.startCinematic(id);},id);
  if(!started){console.log('no se pudo iniciar',id);}
  await page.waitForTimeout((def.returnAt+.35)*1000+500);
  recording=false;await cdp.send('Page.stopScreencast');cdp.off('Page.screencastFrame',onFrame);
  if(frames.length<10){console.log('muy pocos cuadros',id,frames.length);continue;}
  const dir=join(tmpdir(),'roxana-cine-'+id);rmSync(dir,{recursive:true,force:true});mkdirSync(dir,{recursive:true});
  let list='ffconcat version 1.0\n';
  frames.forEach((f,i)=>{const file=join(dir,`f${String(i).padStart(5,'0')}.jpg`);writeFileSync(file,Buffer.from(f.data,'base64'));const next=frames[i+1]?.t??f.t+1/FPS;list+=`file '${file.replace(/\\/g,'/')}'\nduration ${Math.max(.001,next-f.t).toFixed(4)}\n`;});
  list+=`file '${join(dir,`f${String(frames.length-1).padStart(5,'0')}.jpg`).replace(/\\/g,'/')}'\n`;
  writeFileSync(join(dir,'list.txt'),list);
  const mp4=join(out,id+'.mp4'),total=frames.at(-1).t-frames[0].t;
  execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',join(dir,'list.txt'),'-vf',`fps=${FPS},scale=${W}:${H}:flags=lanczos,fade=t=in:st=0:d=0.45,fade=t=out:st=${(total-.6).toFixed(2)}:d=0.6,format=yuv420p`,'-c:v','libx264','-preset','slow','-crf','27','-movflags','+faststart',mp4]);
  execFileSync('ffmpeg',['-y','-loglevel','error','-ss',String(Math.min(def.returnAt*.72,total-1)),'-i',mp4,'-frames:v','1','-vf','scale=640:-2','-c:v','libwebp','-quality','80',join(out,id+'.webp')]);
  // Captions from the game's own definition, ending where the camera returns.
  const caps=def.captions.map((c,i)=>{const end=def.captions[i+1]?.at??def.returnAt;return `${stamp(c.at+.5)} --> ${stamp(end+.5)}\n${c.text}`;});
  writeFileSync(join(out,id+'.vtt'),'WEBVTT\n\n'+caps.join('\n\n')+'\n');
  rmSync(dir,{recursive:true,force:true});
  console.log(id,frames.length,'cuadros',(statSync(mp4).size/1024).toFixed(0)+' kB');
}
await browser.close();
