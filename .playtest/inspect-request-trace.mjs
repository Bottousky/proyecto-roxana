import { readFileSync } from 'node:fs';
const r=JSON.parse(readFileSync('.playtest/r42-natural-runtime.json','utf8'));
for (const [name,tr] of [['A',r.pathA.fullTrace],['K',r.keyboard.forward.fullTrace]]) {
 const i=tr.findIndex(f=>f?.phase==='after'&&f.transitionRequestCount>0);
 console.log(name,'index',i); console.log(JSON.stringify(tr.slice(Math.max(0,i-6),i+3),null,2));
}
