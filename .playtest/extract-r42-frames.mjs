import { readFileSync } from 'node:fs';
const r=JSON.parse(readFileSync('.playtest/r42-natural-runtime.json','utf8'));
const pick=(trace)=>({
 preRequest: trace.find(f=>f?.phase==='trigger'&&f.inside&&f.transitionRequestCount===0),
 requestFrame: trace.find(f=>f?.phase==='trigger'&&f.inside&&f.transitionRequestCount>0),
 settledAfter: trace.find(f=>f?.activeRoom==='taller'&&f?.phase==='after'),
});
console.log(JSON.stringify({pathA:pick(r.pathA.fullTrace),keyboardForward:pick(r.keyboard.forward.fullTrace),pass:r.pass,requestDelta:r.keyboard.requestCountDelta,onEnterTaller:r.keyboard.onEnterTallerTotal,onEnterPlaza:r.keyboard.onEnterPlazaTotal,lock:r.keyboard.noStuckLock},null,2));
