import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:960,height:540}});
await p.goto('http://localhost:5173/jugar/?from=portal&room=plaza',{waitUntil:'load'}); await p.waitForFunction(()=>window.__game?.scene?.getScene('explore')?.activeRoom?.id==='plaza',null,{timeout:25000});
console.log(await p.evaluate(()=>{const s=window.__game.scene.getScene('explore'); const d=Object.getOwnPropertyDescriptor(s,'update'); return {own:!!d, ownType:typeof s.update, sameProto:Object.getPrototypeOf(s).update===s.update, source:d?.value?.toString().slice(0,200), name:Object.getOwnPropertyNames(s).filter(x=>x==='update'||x.includes('update'))};}));
await b.close();

