import {readFileSync} from 'node:fs';const r=JSON.parse(readFileSync('.playtest/r42-natural-runtime.json','utf8'));
for(const [name,tr] of [['A',r.pathA.fullTrace],['K',r.keyboard.forward.fullTrace]]){
 const idx=tr.findIndex(f=>f?.phase==='before'&&f.inside&&f.transitionRequestCount>0);
 console.log(name,JSON.stringify(tr.slice(Math.max(0,idx-8),idx+1),null,2));
}
