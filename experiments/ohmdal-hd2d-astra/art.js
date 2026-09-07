import * as THREE from 'three';

export function random(seed = 31) { return () => { seed = Math.imul(seed ^ seed >>> 15, 1 | seed); seed ^= seed + Math.imul(seed ^ seed >>> 7, 61 | seed); return ((seed ^ seed >>> 14) >>> 0) / 4294967296; }; }
function canvas(w, h = w) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
export function texture(c, repeat = 1) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipmapLinearFilter; if (repeat !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); } return t; }

export function surface(kind) {
  const [c, g] = canvas(128); const r = random(kind.length * 953);
  const palettes = {
    stone: ['#bdb79f','#c9c0a6','#a8afa0','#d1c7a9','#a0a893'],
    wall: ['#ddc59a','#e6d2a8','#d5bc93','#ceb78f','#e0cca5'],
    roof: ['#557b73','#64857a','#729186','#466c69','#7c9483'],
    brick: ['#ad7554','#b5845d','#95705c','#ba8c66','#926c55'],
    grass: ['#839675','#91a17c','#889b74','#7a906c','#a0ab84'],
    wood: ['#8a6950','#997859','#a68964','#755e4d','#b09671'],
  };
  const p = palettes[kind] || palettes.stone;
  g.fillStyle = p[0]; g.fillRect(0,0,128,128);
  if (['stone','wall','brick','roof'].includes(kind)) {
    const h = kind === 'roof' ? 12 : kind === 'stone' ? 16 : 20;
    const w = kind === 'roof' ? 16 : kind === 'stone' ? 23 : 35;
    for (let y = -h; y < 128; y += h) for (let x = -w; x < 128; x += w) {
      const xx = x + ((y / h) % 2 ? w / 2 : 0);
      g.fillStyle = p[Math.floor(r() * p.length)]; g.fillRect(xx + 1,y + 1,w - 2,h - 2);
      g.fillStyle = kind === 'roof' ? '#b5b49138' : '#f3e5be38'; g.fillRect(xx+2,y+1,w-4,1);
      g.fillStyle = '#343f3d35'; g.fillRect(xx+1,y+h-2,w-2,1);
      if(r()>.6){g.fillStyle='#414d4028';g.fillRect(xx+4+r()*w*.4,y+4,3,2);}
    }
  }
  for(let i=0;i<950;i++){g.fillStyle=p[Math.floor(r()*p.length)];g.globalAlpha=.35;g.fillRect(Math.floor(r()*128),Math.floor(r()*128),kind==='wood'?1:2,kind==='wood'?15:1);}
  g.globalAlpha=1;
  return c;
}

export function foliage(seed = 2, autumn = false) {
  const [c,g] = canvas(128,128); const r = random(seed);
  const p = autumn ? ['#51543a','#707044','#979152','#b5a966','#cfc184','#ded198'] : ['#263f35','#35533e','#4d704e','#6f8b59','#92a86e','#b5bf83'];
  const clusters=[{x:62,y:35,r:26},{x:37,y:48,r:24},{x:85,y:49,r:27},{x:59,y:65,r:32},{x:28,y:72,r:20},{x:96,y:72,r:20},{x:40,y:88,r:23},{x:76,y:91,r:24}];
  for(const q of clusters){
    q.x+=(r()-.5)*9;q.y+=(r()-.5)*8;
    for(let yy=-q.r;yy<q.r;yy+=2)for(let xx=-q.r;xx<q.r;xx+=2){
      const boundary=xx*xx/(q.r*q.r)+yy*yy/(q.r*q.r*.83);
      if(boundary>.92+r()*.16)continue;
      const lighting=(-xx*.44-yy*.83)/q.r;
      const index=Math.max(0,Math.min(5,Math.floor(2.1+lighting*2+r()*.65)));
      g.fillStyle=p[index];g.fillRect(Math.round((q.x+xx)/2)*2,Math.round((q.y+yy)/2)*2,2,2);
    }
    // Small leaf pairs follow the light over each larger, readable cluster.
    for(let i=0;i<75;i++){
      const a=r()*Math.PI*2,rad=Math.sqrt(r())*q.r*.88,x=q.x+Math.cos(a)*rad,y=q.y+Math.sin(a)*rad*.88;
      const index=Math.max(1,Math.min(5,Math.floor(3+(-(x-q.x)*.44-(y-q.y)*.83)/q.r*2)));
      g.fillStyle=p[index];g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,3,1);if(i%3===0)g.fillRect(Math.round(x/2)*2+1,Math.round(y/2)*2-1,2,1);
    }
  }
  return c;
}

export function character(kind, step = 0, back = false) {
  const [c,g]=canvas(32,48);
  const rect=(color,x,y,w,h)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
  const dark='#23383c', skin='#dfb78b', light='#f1d1a0';
  const palettes={player:['#466f78','#67989a','#d5b779','#4c3c34'],edda:['#a55e4b','#cd8461','#e7b377','#624638'],lumen:['#6a7060','#92907a','#b99d72','#b7aba0'],ohm:['#9a784e','#c2a673','#ebe0a7','#516661']};
  const p=palettes[kind]||palettes.player;
  const bob=step===1||step===3?1:0;
  g.translate(0,bob);
  if(kind==='ohm'){
    rect(dark,7,10,18,31);rect(p[0],9,23,14,15);rect(p[1],10,25,12,10);rect('#72604b',12,30,8,4);
    rect(dark,7,7,18,17);rect(p[0],9,8,15,14);rect(p[1],9,8,13,11);rect(p[2],10,9,10,2);
    rect('#364b4a',10,14,11,5);rect('#99c0af',11,15,3,2);rect('#99c0af',18,15,3,2);
    rect(dark,4,25,5,13);rect(p[1],5,26,4,8);rect(dark,23,25,5,13);rect(p[1],23,26,3,8);
    rect(p[0],10,37,5,7);rect(p[0],18,37,5,7);rect(dark,8,43,8,3);rect(dark,18,43,8,3);
    rect(p[2],14,3,3,5);rect('#6f9684',13,2,5,2);return c;
  }
  const stride=step===1?2:step===3?-2:0;
  rect(dark,9,36,6,9-stride);rect(dark,18,36,5,9+stride);rect('#4d4b49',10,36,4,6-stride);rect('#4d4b49',18,36,4,6+stride);
  rect('#342f32',8,43-stride,7,3);rect('#342f32',18,43+stride,7,3);
  rect(dark,7,23,18,15);rect(p[0],9,22,14,14);rect(p[1],10,24,5,11);rect(p[2],8,34,17,3);rect('#685538',17,34,3,3);
  rect(dark,5,24,4,11);rect(p[1],6,25,3,7);rect(skin,6,32,3,5);rect(dark,23,24,4,11);rect(p[0],23,25,3,7);rect(light,23,32,3,4);
  rect(dark,9,9,15,15);rect(p[3],8,7,16,14);rect(p[3],11,5,11,3);
  if(!back){rect(skin,11,12,12,10);rect(light,12,13,9,7);rect('#b08665',13,21,7,3);rect(dark,13,15,2,2);rect(dark,20,15,2,2);rect(p[3],9,9,15,4);rect(p[3],9,12,3,6);}
  else{rect(p[3],10,10,13,11);rect('#ffffff15',11,9,8,3);rect(p[2],10,25,12,9);rect('#80694f',11,26,10,2);}
  if(kind==='player'){rect('#253f48',6,8,21,5);rect('#36535a',9,3,15,7);rect('#5f7a73',10,4,12,2);rect(p[2],9,8,16,2);rect('#c19c61',23,4,2,5);rect('#d2b473',7,21,15,3);rect('#b1905b',8,24,3,10);}
  if(kind==='edda'){rect('#583b30',8,7,4,18);rect('#7e5238',7,20,4,8);rect('#d1a663',7,20,5,2);rect('#d8b782',12,23,9,2);}
  if(kind==='lumen'){rect('#d0c2a9',11,19,12,6);rect('#ece0bd',12,20,9,2);rect('#baa882',9,28,14,9);rect('#7e7055',12,30,3,6);rect('#7a6854',8,8,18,3);rect('#a68d6c',10,5,13,4);}
  return c;
}

export function glowTexture() { const [c,g]=canvas(64); const grad=g.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'#ffeabbc0');grad.addColorStop(.15,'#ffd59165');grad.addColorStop(.45,'#e7b16e18');grad.addColorStop(1,'#e7b16e00');g.fillStyle=grad;g.fillRect(0,0,64,64);return texture(c); }
export function shadowTexture(){const[c,g]=canvas(64);const a=g.createRadialGradient(32,32,0,32,32,31);a.addColorStop(0,'#102c2c80');a.addColorStop(.5,'#132e2a55');a.addColorStop(1,'#102c2c00');g.fillStyle=a;g.fillRect(0,0,64,64);return texture(c);}
