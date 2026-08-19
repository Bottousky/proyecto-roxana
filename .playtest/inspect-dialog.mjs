import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:960,height:540}});
await page.goto('http://localhost:5173/jugar/?from=portal&room=plaza',{waitUntil:'load'});
await page.waitForFunction(()=>window.__game?.scene?.getScene('explore')?.activeRoom?.id==='plaza',null,{timeout:25000});
console.log(await page.evaluate(()=>({text:document.querySelector('#dialog-text')?.textContent, copy:document.querySelector('#dialog-copy')?.textContent, hidden:document.querySelector('#dialog')?.className, ariaHidden:document.querySelector('#dialog')?.getAttribute('aria-hidden')})));
await browser.close();
