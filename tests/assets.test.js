import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../src/world.js';
const actors=['player','edda','lumen','nereo','vega','consejera','yesca','marin','tala'];
const urls=['/assets/materials.webp','/assets/art-polish/meadow.webp','/assets/art-polish/workshop-rug.webp','/assets/art-polish/kingdom-banner.webp','/assets/trees.webp','/assets/art-polish/portraits-main.webp','/assets/art-polish/portraits-north.webp','/assets/art-polish/portraits-village.webp','/assets/art-polish/waterside-plants.webp','/assets/ohm.webp','/assets/art-polish/portrait-ohm.webp',...actors.map(name=>`/assets/actors/${name}.webp`)];
test('missing artwork reports every critical atlas, including dialogue portraits',async()=>{
  const original=globalThis.Image;const requested=[];
  globalThis.Image=class{set src(url){requested.push(url);queueMicrotask(()=>this.onerror?.());}};
  try{const world=Object.create(World.prototype);const loading=world.loadArtAssets();assert.equal(world.loadArtAssets(),loading);const result=await loading;assert.equal(result.ok,false);assert.deepEqual(result.missing,urls);assert.deepEqual(requested,urls);assert.throws(()=>world.loadArea({id:'portal'}),/Required artwork is not ready/);}
  finally{if(original)globalThis.Image=original;else delete globalThis.Image;}
});
test('retry loads only failed art and retains successful atlases',async()=>{
  const original=globalThis.Image;const requested=[];let available=false;
  globalThis.Image=class{set src(url){requested.push(url);queueMicrotask(()=>available?this.onload?.():this.onerror?.());}};
  try{
    const world=Object.create(World.prototype);world._loadedArtAssets=new Set(urls.filter(url=>url!=='/assets/art-polish/portraits-north.webp'));
    assert.deepEqual(await world.loadArtAssets(),{ok:false,missing:['/assets/art-polish/portraits-north.webp']});
    available=true;assert.deepEqual(await world.loadArtAssets(),{ok:true,missing:[]});
    assert.deepEqual(requested,['/assets/art-polish/portraits-north.webp','/assets/art-polish/portraits-north.webp']);assert.equal(world._loadedArtAssets.size,urls.length);
  }finally{if(original)globalThis.Image=original;else delete globalThis.Image;}
});

test('individual human atlases cover fractional cells and survive repeated load calls',async()=>{
  const originalImage=globalThis.Image,originalDocument=globalThis.document,requested=[],sourceCrops=[];
  globalThis.Image=class{width=1402;height=1122;set src(url){requested.push(url);queueMicrotask(()=>this.onload?.());}};
  globalThis.document={createElement(){const canvas={width:0,height:0};canvas.getContext=()=>({
    drawImage(...args){if(args[0] instanceof globalThis.Image)sourceCrops.push(args.slice(1,5));},putImageData(){},
    getImageData(){const data=new Uint8ClampedArray(canvas.width*canvas.height*4);for(let y=8;y<canvas.height-8;y++)for(let x=20;x<canvas.width-20;x++){const i=(y*canvas.width+x)*4;data[i]=80;data[i+1]=110;data[i+2]=120;data[i+3]=255;}return{data};}
  });return canvas;}};
  try{
    const world=Object.create(World.prototype);world._loadedArtAssets=new Set(urls.filter(url=>url!=='/assets/actors/player.webp'));
    const previous=[[{existing:true}]];world.atlasFrames={edda:previous};
    assert.deepEqual(await world.loadArtAssets(),{ok:true,missing:[]});
    assert.equal(world.atlasFrames.player.length,4);world.atlasFrames.player.forEach(row=>assert.equal(row.length,5));assert.equal(world.atlasFrames.edda,previous);
    assert.equal(sourceCrops.length,20);assert.equal(sourceCrops[19][0]+sourceCrops[19][2],1402);assert.equal(sourceCrops[19][1]+sourceCrops[19][3],1122);
    const loaded=world.assetsReady;assert.equal(world.loadArtAssets(),loaded);await loaded;assert.deepEqual(requested,['/assets/actors/player.webp']);
    world.atlasFrames.player.flat().forEach(texture=>texture.dispose());
  }finally{if(originalImage)globalThis.Image=originalImage;else delete globalThis.Image;if(originalDocument)globalThis.document=originalDocument;else delete globalThis.document;}
});

test('disposing a World releases every direction and pose exactly once',()=>{
  const world=Object.create(World.prototype),counts=[];
  world.clearArea=()=>{};world.sharedGeometries=new Set();world.textures={};world.atlasFrames={};world.composer={dispose(){}};world.renderer={dispose(){}};
  for(const name of actors)world.atlasFrames[name]=Array.from({length:4},()=>Array.from({length:5},()=>{const entry={count:0};counts.push(entry);return{dispose(){entry.count++;}};}));
  world.dispose();assert.equal(counts.length,180);assert.ok(counts.every(entry=>entry.count===1));
});
