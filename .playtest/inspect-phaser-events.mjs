import { chromium } from 'playwright';
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:960,height:540}});await p.goto('http://localhost:5173/jugar/?from=portal&room=plaza',{waitUntil:'load'});await p.waitForFunction(()=>window.__game?.scene?.getScene('explore')?.activeRoom?.id==='plaza',null,{timeout:25000});console.log(await p.evaluate(()=>{const s=window.__game.scene.getScene('explore');return {sysKeys:Object.keys(s.sys).filter(k=>/update|event|pre\\/step|render/i.test(k)),events:Object.keys(s.events._events||{}).filter(k=>/update|step|render/i.test(k)),sceneEvents:Object.keys(s.scene.events._events||{}).filter(k=>/update|step|render/i.test(k))};}));await b.close();


