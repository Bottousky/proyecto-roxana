import { chromium } from 'playwright';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
const out='output/playwright';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.goto(process.env.LANDING_URL||'http://127.0.0.1:5186');
 await page.waitForFunction(()=>document.documentElement.dataset.scene==='ready');
 await page.waitForTimeout(1800);
 const metrics=await page.evaluate(()=>window.__roxanaSchool3D);
 await writeFile(`${out}/scene-metrics.json`,JSON.stringify(metrics,null,2));
 await page.screenshot({path:`${out}/desktop-final.png`});
 await page.screenshot({path:`${out}/full-page.png`,fullPage:true});
 await page.setViewportSize({width:1200,height:630});
 await page.waitForTimeout(900);
 await page.screenshot({path:`${out}/instituto-social.png`});
 await page.setViewportSize({width:1200,height:900});
 await page.addStyleTag({content:'.institute-header,.institute-welcome,.scene-toolbar,.campus-marker,#school3d-labels{visibility:hidden}.school-stage{inset:0!important}'});
 await page.waitForTimeout(900);
 await page.screenshot({path:`${out}/instituto-poster.png`});
 if(process.argv.includes('--promote')){
  await copyFile(`${out}/instituto-social.png`,'public/instituto-social.png');
  await copyFile(`${out}/instituto-poster.png`,'public/instituto-poster.png');
 }
 console.log(JSON.stringify({metrics,exported:['desktop-final.png','full-page.png','instituto-social.png','instituto-poster.png']},null,2));
}finally{await browser.close();}
