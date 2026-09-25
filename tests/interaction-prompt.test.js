import test from 'node:test';
import assert from 'node:assert/strict';
import {placeInteractionPrompt} from '../src/interaction-prompt.js';
import {buildCollisionWorld} from './helpers/world-fixture.js';

const rect=(point,size)=>({left:point.x-size.width/2,right:point.x+size.width/2,top:point.y-size.height,bottom:point.y});
const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;

test('the Terrazas prompt leaves the real northern threshold free through the return to the gameplay camera',()=>{
  const world=buildCollisionWorld('terraces',{flags:{awaken:true,irrigation:true},spawn:[3,-3]});
  const viewport={width:1280,height:720},size={width:192,height:80};
  world.canvas={getBoundingClientRect:()=>({left:0,top:0,...viewport})};
  world.camera.left=-12*viewport.width/viewport.height;world.camera.right=-world.camera.left;world.camera.top=12;world.camera.bottom=-12;
  world.cancelCinematic();
  const panel=world.area.objects.find(object=>object.id==='irrigation_panel'),exit=world.area.exits.find(object=>object.id==='terraces_to_lake');
  let originalCovered=false;
  try{
    for(const zoom of [.93,1.08,1.28]){
      world.camera.zoom=zoom;world.camera.updateProjectionMatrix();
      const object=world.getScreenPosition(panel),threshold=world.getScreenPosition({...exit,target:true});
      const anchor={x:object.x,y:object.y-32},blocked={left:threshold.x-30,right:threshold.x+30,top:threshold.y-24,bottom:threshold.y+24};
      originalCovered ||= overlap(rect(anchor,size),blocked);
      const placement=placeInteractionPrompt({anchor,size,viewport,blocked:[blocked]});
      assert.equal(overlap(rect(placement,size),blocked),false,`zoom ${zoom}: prompt covers the exit`);
      assert.equal(placement.y,anchor.y,'desktop collision should resolve laterally');
    }
    assert.ok(originalCovered,'the regression must reproduce the original overlap');
  }finally{world.dispose();}
});

test('a free prompt retains its anchor, and HUD obstacles choose the free side',()=>{
  const viewport={width:1280,height:720},size={width:192,height:80},anchor={x:580,y:350};
  assert.deepEqual(placeInteractionPrompt({anchor,size,viewport}),{...anchor,shifted:false});
  const blocked=[{left:520,right:590,top:270,bottom:320},{left:0,right:430,top:220,bottom:440}];
  const placement=placeInteractionPrompt({anchor,size,viewport,blocked});
  assert.ok(placement.x>anchor.x,'the left HUD must force the free right side');
  assert.equal(placement.y,anchor.y);
  assert.ok(blocked.every(block=>!overlap(rect(placement,size),block)));
});

test('a wide mobile prompt clears the exit vertically while remaining on screen',()=>{
  const viewport={width:360,height:640},size={width:320,height:80},anchor={x:180,y:330};
  const blocked=[{left:145,right:215,top:260,bottom:320}];
  const placement=placeInteractionPrompt({anchor,size,viewport,blocked}),bounds=rect(placement,size);
  assert.equal(overlap(bounds,blocked[0]),false);
  assert.ok(bounds.left>=10&&bounds.right<=350&&bounds.top>=10&&bounds.bottom<=515);
});
