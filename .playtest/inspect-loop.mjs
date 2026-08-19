import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:960,height:540}});
await p.goto('http://localhost:5173/jugar/?from=portal&room=plaza',{waitUntil:'load'});
await p.waitForFunction(()=>window.__game?.scene?.getScene('explore')?.activeRoom?.id==='plaza',null,{timeout:25000});
const snap=()=>p.evaluate(()=>{const g=window.__game, s=g.scene.getScene('explore'); return {loop:{running:g.loop.running,sleeping:g.loop.sleeping,actualFps:g.loop.actualFps},sys:{status:s.sys.status,active:s.sys.isActive(),visible:s.sys.isVisible(),settingsStatus:s.sys.settings.status},ui:document.querySelector('#dialog').className};});
console.log('open',await snap());
for(let i=0;i<4;i++){await p.keyboard.press('Enter');await p.waitForTimeout(300);} console.log('closed-ish',await snap());
await p.waitForTimeout(800); console.log('later',await snap());
await b.close();
