import { readFileSync } from 'node:fs';
const r=JSON.parse(readFileSync('.playtest/r42-natural-runtime.json','utf8'));
const pick=(trace)=>({
 preRequest: trace.find(f=>f?.phase==='before'&&f.inside&&f.transitionRequestCount===0),
 requestFrame: trace.find(f=>f?.phase==='before'&&f.inside&&f.transitionRequestCount>0),
 firstAfter: trace.find(f=>f?.phase==='after'&&f.transitionRequestCount>0),
});
const f=(s)=>({t:s.t,room:s.room,local:s.local,cooldown:+s.cooldown.toFixed(1),lock:s.lock,armed:s.armed,request:s.requestCount,fade:s.fade,onEnter:s.onEnter});
const out={
 pass:r.pass,
 pathA:{method:r.pathA.method,before:f(r.pathA.before),result:f(r.pathA.result),delta:r.pathA.delta,frames:pick(r.pathA.decisiveFrames),fade:r.pathA.fade.samples.map(s=>({t:s.t,cooldown:+s.cooldown.toFixed(1),armed:s.armed,request:s.requestCount,fade:s.fade}))},
 keyboardForward:{method:r.keyboard.forward.method,start:f(r.keyboard.forward.start),move:{start:f(r.keyboard.forward.east.start),end:f(r.keyboard.forward.east.end)},result:f(r.keyboard.forward.result),frames:pick(r.keyboard.forward.decisiveFrames),fade:r.keyboard.forward.fade.samples.map(s=>({t:s.t,cooldown:+s.cooldown.toFixed(1),armed:s.armed,request:s.requestCount,fade:s.fade}))},
 keyboardReturn:{start:f(r.keyboard.return.start),move:{start:f(r.keyboard.return.south.start),end:f(r.keyboard.return.south.end)},result:f(r.keyboard.return.result),final:f(r.keyboard.return.final),fade:r.keyboard.return.fade.samples.map(s=>({t:s.t,cooldown:+s.cooldown.toFixed(1),armed:s.armed,request:s.requestCount,fade:s.fade}))},
 counts:r.keyboard.requestCountDelta,
 onEnter:{taller:r.keyboard.onEnterTallerTotal,plaza:r.keyboard.onEnterPlazaTotal},
 noStuckLock:r.keyboard.noStuckLock,
 consoleErrors:r.consoleErrors,
};
console.log(JSON.stringify(out,null,2));
