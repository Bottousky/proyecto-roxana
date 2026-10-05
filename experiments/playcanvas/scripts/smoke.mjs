import {chromium} from 'playwright';
import { chromePath, gpuArgs } from './chrome.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:chromePath}),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('requestfailed',r=>console.log('REQUEST',r.url(),r.failure()));
page.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.message);});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});page.on('response',r=>{if(r.status()>=400){errors.push(r.status()+' '+r.url());console.log(r.status(),r.url());}});
await page.goto('http://127.0.0.1:4190/');await page.locator('#new-game').click();await page.waitForFunction(()=>window.__ohmdal?.mode==='dialogue',{},{timeout:60000});
await page.waitForTimeout(3000);console.log(JSON.stringify({errors,area:await page.evaluate(()=>window.__ohmdal.state.area)}));fs.mkdirSync('output/smoke',{recursive:true});await page.screenshot({path:'output/smoke/portal.png'});await browser.close();
