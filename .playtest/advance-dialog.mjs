import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:960,height:540}});
await p.goto('http://localhost:5173/jugar/?from=portal&room=plaza',{waitUntil:'load'});
await p.waitForFunction(()=>window.__game?.scene?.getScene('explore')?.activeRoom?.id==='plaza',null,{timeout:25000});
console.log('initial', await p.evaluate(()=>({hidden:document.querySelector('#dialog').classList.contains('hidden'), text:document.querySelector('#dialog-text').textContent})));
for(let i=0;i<8;i++){ await p.keyboard.press('Enter'); await p.waitForTimeout(300); console.log(i+1, await p.evaluate(()=>({hidden:document.querySelector('#dialog').classList.contains('hidden'), text:document.querySelector('#dialog-text').textContent, active:document.activeElement?.tagName}))); }
await p.waitForTimeout(800);
const s=p.evaluate(()=>{const s=window.__game.scene.getScene('explore'); return {map:s.mapOpen, transitioning:s.transitioning, t:s.updateTickCount, ui:document.querySelector('#dialog').className};}); console.log('final',await s);
await b.close();
