import test from 'node:test';
import assert from 'node:assert/strict';
import {findPath} from '../src/navigation.js';
function assertClear(start,path,obstacles){let a=start;for(const b of path){for(let t=0;t<=1;t+=.01){const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;assert.ok(!obstacles.some(o=>Math.abs(x-o.x)<o.w+.34&&Math.abs(z-o.z)<o.d+.34),'route crosses an obstacle');}a=b;}}
test('click-to-walk routes around a building through real open space',()=>{const obstacles=[{x:0,z:0,w:2,d:3}],start=[-6,0],goal=[6,0];const path=findPath(start,goal,[20,20],obstacles);assert.ok(path.length>1);assert.deepEqual(path.at(-1),goal);assertClear(start,path,obstacles);});
test('direct unobstructed walking remains direct',()=>assert.deepEqual(findPath([0,0],[5,5],[20,20],[]),[[5,5]]));
test('clicking inside a mechanism approaches an accessible edge',()=>{const obstacles=[{x:0,z:0,w:1,d:1}],start=[-5,0];const path=findPath(start,[0,0],[15,15],obstacles);assert.ok(path.length);assertClear(start,path,obstacles);assert.ok(Math.hypot(...path.at(-1))<2.85);});
test('a sealed wall produces no illegal route or diagonal corner cutting',()=>{assert.deepEqual(findPath([-3,0],[3,0],[12,12],[{x:0,z:0,w:.5,d:6}]),[]);});

test('an off-grid start cannot attach to a navigation cell through a thin wall',()=>{
  const obstacles=[{x:.15,z:0,w:.01,d:5}],start=[.13,0];
  // The closest grid center is x=.2, on the far side. A legal cell must also
  // have a collision-free segment from the actor's actual off-grid position.
  assert.deepEqual(findPath(start,[2,0],[8,8],obstacles,{radius:0}),[]);
});

test('a valid off-grid start keeps a safe first segment while routing around a narrow obstacle',()=>{
  const obstacles=[{x:.15,z:0,w:.01,d:1.5}],start=[.13,0],goal=[2,0];
  const path=findPath(start,goal,[8,8],obstacles,{radius:0});
  assert.ok(path.length>1);
  assert.deepEqual(path.at(-1),goal);
  let from=start;
  for(const to of path){
    const steps=Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])/.002);
    for(let i=0;i<=steps;i++){
      const t=steps?i/steps:0,x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;
      assert.ok(!(Math.abs(x-.15)<.01&&Math.abs(z)<1.5),'A smoothed segment cuts through the thin wall');
    }
    from=to;
  }
});

test('a click inside a wall approaches the nearest reachable edge rather than a disconnected grid cell',()=>{
  const obstacles=[{x:0,z:0,w:.1,d:6}],start=[-3,0];
  const path=findPath(start,[.05,0],[12,12],obstacles,{radius:.34});
  assert.ok(path.length,'An edge on the starting side can be approached');
  assertClear(start,path,obstacles);
  assert.ok(path.at(-1)[0]<-.44);
  assert.ok(Math.hypot(path.at(-1)[0]-.05,path.at(-1)[1])<.8);
});

test('pathfinding does not teleport an embedded or out-of-bounds start to a safe grid cell',()=>{
  const wall=[{x:0,z:0,w:.5,d:6}];
  assert.deepEqual(findPath([0,0],[3,0],[12,12],wall),[]);
  assert.deepEqual(findPath([-9,0],[-3,0],[12,12],wall),[]);
});
