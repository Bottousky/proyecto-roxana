import test from 'node:test';
import assert from 'node:assert/strict';
import {AREAS} from '../src/content.js';
import {AREA_LAYOUTS} from '../src/world-layout.js';
import {inhabitantPlan} from '../src/world-inhabitants.js';
import {layoutPersonLabels,renderLocalMap} from '../src/world-map.js';

const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
function projection(id){
  const [width,depth]=AREA_LAYOUTS[id].bounds,scale=Math.min(472/width,420/depth);
  return {project:(x,z)=>[Number((280+x*scale).toFixed(3)),Number((254+z*scale).toFixed(3))],bounds:{x:280-width*scale/2,y:254-depth*scale/2,w:width*scale,h:depth*scale}};
}
function verify(id,people,state){
  const {project,bounds}=projection(id),labels=layoutPersonLabels(people,project,bounds);
  for(let i=0;i<labels.length;i++){
    const label=labels[i],person=people.find(person=>person.id===label.id);
    assert.deepEqual([label.x,label.y],project(person.x,person.z),'label placement must not move a person');
    assert.ok(label.rect.left>=bounds.x&&label.rect.right<=bounds.x+bounds.w&&label.rect.top>=bounds.y&&label.rect.bottom<=bounds.y+bounds.h);
    for(const other of labels.slice(i+1))assert.equal(overlaps(label.rect,other.rect),false,`${label.label} overlaps ${other.label}`);
  }
  const svg=renderLocalMap(AREAS[id],AREA_LAYOUTS[id],[0,10],state,people);
  for(const label of labels){
    const marker=svg.match(new RegExp(`data-map-object="${label.id}" transform="translate\\(([^)]+)\\)"[^]*?</g>`));
    assert.ok(marker);assert.equal(marker[1],`${label.x} ${label.y}`,'rendered dot retains its real projected position');
    if(label.displaced)assert.match(marker[0],/class="local-person-leader"/,'displaced names must have a guide to their dot');
  }
  assert.equal((svg.match(/data-map-exit=/g)||[]).length,AREAS[id].exits.length);
  assert.match(svg,/Norte arriba/);
  return labels;
}

test('Faro epilogue names stay separate while Edda, Lumen and Tala gather at the lantern',()=>{
  const state={flags:{beacon_lens:true,epilogue_shared:true},secrets:[]};
  const people=AREAS.lighthouse.objects.filter(person=>person.kind==='npc'&&inhabitantPlan('lighthouse',person,state).present).map(person=>{
    const [x,z]=inhabitantPlan('lighthouse',person,state).stops[0];return {...person,x,z};
  });
  const labels=verify('lighthouse',people,state);
  assert.ok(labels.some(label=>label.displaced),'the authored close group needs label separation');
  assert.deepEqual(labels.map(label=>label.id).sort(),['edda_tower','lumen_epilogue','nereo_tower','tala_epilogue']);
});

test('a live Plaza gathering gets distinct names without changing the supplied resident positions',()=>{
  const state={flags:{beacon_lens:true,epilogue_shared:true},secrets:[]};
  const people=AREAS.plaza.objects.filter(person=>person.kind==='npc').map((person,index)=>({...person,x:-4+index*.45,z:3+index*.4}));
  const original=structuredClone(people);verify('plaza',people,state);assert.deepEqual(people,original);
});

test('a solitary resident keeps the original label directly above their dot',()=>{
  const {project,bounds}=projection('plaza'),[label]=layoutPersonLabels([{id:'solo',label:'Edda',x:0,z:0}],project,bounds);
  assert.equal(label.displaced,false);assert.equal(label.labelX,label.x);assert.equal(label.labelY,label.y-13);
});

test('Faro names leave the player dot and Vos readable when standing beside the epilogue group',()=>{
  const state={flags:{beacon_lens:true,epilogue_shared:true},secrets:[]};
  const people=AREAS.lighthouse.objects.filter(person=>person.kind==='npc'&&inhabitantPlan('lighthouse',person,state).present).map(person=>{
    const [x,z]=inhabitantPlan('lighthouse',person,state).stops[0];return {...person,x,z};
  });
  const {project}=projection('lighthouse');
  for(const position of [[-2.5,-9.5],[-6.5,-10.5],[-3,-13.5]]){
    const [px,py]=project(...position),svg=renderLocalMap(AREAS.lighthouse,AREA_LAYOUTS.lighthouse,position,state,people);
    const playerDot={left:px-13,right:px+13,top:py-13,bottom:py+13};
    const playerLabel={left:px-16,right:px+16,top:py+11,bottom:py+28};
    assert.ok(svg.includes(`data-world-x="${position[0]}" data-world-z="${position[1]}" transform="translate(${px} ${py})"`),'player position remains exact');
    for(const person of people){
      const [x,y]=project(person.x,person.z),marker=svg.match(new RegExp(`data-map-object="${person.id}" transform="translate\\(([^)]+)\\)"[^]*?</g>`));
      assert.equal(marker[1],`${x} ${y}`,'resident position remains exact');
      const text=marker[0].match(/<text data-map-person-label="[^"]+" x="([^"]+)" y="([^"]+)"/);
      const labelX=x+Number(text[1]),labelY=y+Number(text[2]),halfWidth=([...person.label].length*16*.72+6)/2;
      const rect={left:labelX-halfWidth,right:labelX+halfWidth,top:labelY-18,bottom:labelY+4};
      assert.equal(overlaps(rect,playerDot),false,`${person.label} covers the player's point at ${position}`);
      assert.equal(overlaps(rect,playerLabel),false,`${person.label} covers Vos at ${position}`);
    }
  }
});
