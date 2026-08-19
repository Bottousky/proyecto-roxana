import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const p=await b.newPage({viewport:{width:960,height:540}});
await p.goto('http://localhost:5173/jugar/?from=portal&room=plaza',{waitUntil:'load'});
await p.waitForFunction(()=>window.__game?.scene?.getScene('explore')?.activeRoom?.id==='plaza',null,{timeout:25000});
for(let i=0;i<4;i++){await p.keyboard.press('Enter');await p.waitForTimeout(300);}
const read=()=>p.evaluate(()=>{const s=window.__game.scene.getScene('explore'); return {pl:{x:s.activeRoom.playerLocal.x,y:s.activeRoom.playerLocal.y},sp:{x:s.player.x,y:s.player.y},vel:{x:s.velX,y:s.velY},key:[s.keys.right.isDown,s.keys.d.isDown],map:s.mapOpen,lock:s.transitionLock.phase};});
console.log('start',await read()); await p.keyboard.down('d'); await p.waitForTimeout(1000); console.log('1s',await read()); await p.waitForTimeout(1000); console.log('2s',await read()); await p.keyboard.up('d'); await b.close();
