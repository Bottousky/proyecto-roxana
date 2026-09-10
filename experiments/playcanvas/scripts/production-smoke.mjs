import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const out='output/production';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try {
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:4191/');
 await page.locator('#title-settings').click();
 await page.locator('#import-save').setInputFiles('output/playcanvas-playthrough/verified-save.json');
 await page.locator('#transition').waitFor({state:'hidden',timeout:90000});
 await page.locator('#hud').waitFor({state:'visible'});await page.waitForTimeout(1800);
 await page.screenshot({path:`${out}/faro.png`});
 for(const area of ['lake','plaza']){
  await page.locator('#map-button').click();
  await page.screenshot({path:`${out}/map-${area}.png`});
  await page.locator(`.map-destination[data-area="${area}"]`).click();
  await page.locator('#transition').waitFor({state:'hidden',timeout:90000});await page.waitForTimeout(1300);
  await page.keyboard.down('ArrowDown');await page.waitForTimeout(350);await page.keyboard.up('ArrowDown');
  await page.screenshot({path:`${out}/${area}.png`});
 }
 await page.locator('#journal-button').click();await page.screenshot({path:`${out}/journal.png`});await page.keyboard.press('Escape');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await page.screenshot({path:`${out}/mobile-hud.png`});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile document must not overflow');
 await page.locator('#map-button').click();await page.screenshot({path:`${out}/mobile-map.png`});
 await page.keyboard.press('Escape');await page.reload();await page.locator('#continue').waitFor({state:'visible'});
 assert.deepEqual(errors,[]);console.log('Production passed: imported finished Arc I, Faro, return to Lago and Plaza, map, journal, mobile layout and reload.');
 fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:true,errors,checkedAt:new Date().toISOString()},null,2));
} finally {await browser.close();}
