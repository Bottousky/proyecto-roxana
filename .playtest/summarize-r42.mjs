import { readFileSync } from 'node:fs';
const r=JSON.parse(readFileSync('.playtest/r42-natural-runtime.json','utf8'));
const a=r.pathA,b=r.keyboard;
console.log(JSON.stringify({
 pass:r.pass,
 pathA:{before:a.before,result:a.result,delta:{ticks:a.result.ticks-a.before.ticks,request:a.requestCountDelta,onEnterTaller:a.onEnterTallerDelta},decisiveFrames:a.decisiveFrames,fade:a.fade.samples.map(s=>({t:s.t,ticks:s.ticks,room:s.room,request:s.requestCount,cooldown:s.cooldown,lock:s.lock,armed:s.armed,fade:s.fade,onEnter:s.onEnter}))},
 keyboardForward:{start:b.forward.start,east:{start:b.forward.east.start,end:b.forward.east.end,samples:b.forward.east.samples.map(s=>({t:s.t,room:s.room,local:s.local,cooldown:s.cooldown,lock:s.lock,armed:s.armed,request:s.requestCount}))},result:b.forward.result,fade:b.forward.fade.samples.map(s=>({t:s.t,room:s.room,cooldown:s.cooldown,lock:s.lock,armed:s.armed,request:s.requestCount,fade:s.fade})),decisiveFrames:b.forward.decisiveFrames},
 keyboardReturn:{start:b.return.start,south:{start:b.return.south.start,end:b.return.south.end,samples:b.return.south.samples.map(s=>({t:s.t,room:s.room,local:s.local,cooldown:s.cooldown,lock:s.lock,armed:s.armed,request:s.requestCount}))},result:b.return.result,final:b.return.final,fade:b.return.fade.samples.map(s=>({t:s.t,room:s.room,cooldown:s.cooldown,lock:s.lock,armed:s.armed,request:s.requestCount,fade:s.fade,onEnter:s.onEnter}))},
 counts:{requestDelta:b.requestCountDelta,onEnterTaller:b.onEnterTallerTotal,onEnterPlaza:b.onEnterPlazaTotal,noStuckLock:b.noStuckLock},
 consoleErrors:r.consoleErrors
},null,2));

