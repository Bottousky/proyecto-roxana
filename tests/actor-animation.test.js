import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTOR_ATLAS,actorDirection,advanceActor,idleActor,opaqueBounds,actorFrameLayout} from '../src/actor-animation.js';

test('human rest uses only column zero and actual movement enters a separate walk cycle',()=>{
  let actor=idleActor();assert.equal(actor.frame,0);
  const frames=new Set();for(let i=0;i<80;i++){actor=advanceActor(actor,.07,0,1/60);frames.add(actor.frame);assert.equal(actor.direction,1);}
  assert.deepEqual([...frames].sort(),[1,2,3,4]);
  actor=advanceActor(actor,0,0,1/60);assert.deepEqual(actor,idleActor(1));
  actor=advanceActor(actor,-.07,0,1/60);assert.equal(actor.direction,3);assert.equal(actor.frame,1);
});

test('turns preserve direction at rest, and diagonal hysteresis rejects tiny axis changes',()=>{
  assert.equal(actorDirection(.1,.099,0),0);assert.equal(actorDirection(.1,.099,1),1);
  assert.equal(actorDirection(.14,.1,0),1);assert.equal(actorDirection(.1,-.14,1),2);
  const walking=advanceActor(idleActor(),0,-.1,.016);
  assert.equal(advanceActor(walking,0,0,.016).direction,2);
});

test('pauses and blocked motion return to neutral; reduced motion keeps actual facing',()=>{
  const walking=advanceActor(idleActor(),.1,0,.016);
  assert.deepEqual(advanceActor(walking,0,0,.016),idleActor(1));
  assert.deepEqual(advanceActor(walking,-.1,0,.016,{paused:true}),idleActor(1));
  assert.deepEqual(advanceActor(walking,0,-.1,.016,{reducedMotion:true}),{...idleActor(2),moving:true});
});

test('click movement has no keyboard dependency, and wall sliding faces the axis actually traversed',()=>{
  const click=advanceActor(idleActor(),-.1,0,.016);assert.equal(click.direction,3);assert.ok(click.frame>0);
  const slide=advanceActor(click,0,.04,.016);assert.equal(slide.direction,0);assert.ok(slide.frame>0);
  assert.equal(advanceActor(slide,.000001,0,.016).frame,0);
});

test('all poses share one scale and one foot baseline without stretching individual frames',()=>{
  const bounds=[{width:120,height:220},{width:150,height:208},{width:110,height:225}];
  const {scale,placements}=actorFrameLayout(bounds);
  placements.forEach((p,i)=>{assert.ok(Math.abs(p.y+p.height-ACTOR_ATLAS.feet)<1e-9);assert.ok(Math.abs(p.width/bounds[i].width-scale)<1e-12);assert.ok(Math.abs(p.height/bounds[i].height-scale)<1e-12);});
});

test('pose bounds ignore keyed background and report missing art',()=>{
  const pixels=new Uint8ClampedArray(12*14*4);for(let y=3;y<=10;y++)for(let x=4;x<=8;x++)pixels[(y*12+x)*4+3]=255;
  assert.deepEqual(opaqueBounds(pixels,12,14),{x:4,y:3,width:5,height:8,anchorX:6.5});
  assert.throws(()=>opaqueBounds(new Uint8ClampedArray(16),2,2),/empty pose/);
});
