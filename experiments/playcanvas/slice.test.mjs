import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {findPath} from './src/navigation.js';import {isSegmentClear,isPositionClear,moveWithCollisions} from './src/collision.js';import {isSliceLand} from './src/rules.ts';
const data=JSON.parse(fs.readFileSync(new URL('./src/data/scene.json',import.meta.url))),outside=[...data.areas.plaza.obstacles,...data.areas.road.obstacles];
test('real exported obstacles permit the round trip and the workshop entrance',()=>{
  for(const [inside,from,to] of [[false,[0,10],[-13.25,8.1]],[false,[0,10],[6,-38]],[false,[6,-38],[3.5,-44]],[false,[3.5,-44],[0,8.5]],[true,[0,9.6],[-2.7,0]]]){
    const obstacles=inside?data.areas.workshop.obstacles:outside,options={radius:.34,cell:.6,isWalkable:(x,z)=>isSliceLand(inside,x,z)},path=findPath(from,to,[64,144],obstacles,options);
    assert.ok(path.length,`${from} → ${to}`);let start=from;for(const end of path){assert.ok(isSegmentClear(start,end,[64,144],obstacles,options));start=end;}
    assert.ok(Math.hypot(start[0]-to[0],start[1]-to[1])<.2);
  }
});
test('buildings and the canal remain unwalkable, including a fast sweep toward the workshop wall',()=>{
  const options={radius:.34,isWalkable:(x,z)=>isSliceLand(false,x,z)};
  assert.equal(isPositionClear([-13.25,3.8],[64,144],outside,options),false);
  assert.equal(isSliceLand(false,25.8,-45),false);
  const end=moveWithCollisions([-13.25,8.1],[0,-12],[64,144],outside,options);assert.ok(end[1]>7);
});
test('Ohm can find a path around the fountain instead of following through it',()=>{
  const options={radius:.25,cell:.6,isWalkable:(x,z)=>isSliceLand(false,x,z)},path=findPath([-2.5,-7],[0,8.4],[64,144],outside,options);assert.ok(path.length>1);
  let point=[-2.5,-7];for(const next of path){assert.ok(isSegmentClear(point,next,[64,144],outside,options));point=next;}
});
test('the experiment has independent saves and no runtime dependency on Three.js',()=>{
  const source=fs.readFileSync(new URL('./src/main.ts',import.meta.url),'utf8'),pkg=JSON.parse(fs.readFileSync(new URL('./package.json',import.meta.url)));
  assert.match(source,/ohmdal-playcanvas-slice-v1/);assert.ok(pkg.dependencies.playcanvas);assert.equal(pkg.dependencies.three,undefined);
  assert.ok(data.meshes.some(m=>m.owner?.includes('Taller de Lumen')),'the workshop retains a named scene entity');
});
