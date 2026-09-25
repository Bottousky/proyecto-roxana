import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const output=resolve('output/playwright');await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={startedAt:new Date().toISOString(),checks:[],errors:[]};
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(10000);
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('requestfailed',r=>report.errors.push(`${r.url()}: ${r.failure()?.errorText}`));
  const requests=[];page.on('request',r=>requests.push(r.url()));
  const response=await page.goto('http://127.0.0.1:4180/');assert.equal(response.status(),200);assert.equal(response.headers()['x-ohmdal'],'La Luz');
  await page.getByRole('button',{name:'Cruzar el Portal'}).waitFor();
  await page.screenshot({path:resolve(output,'production-title.png'),animations:'disabled'});
  assert.equal(await page.evaluate(()=>typeof window.__ohmdal),'undefined');
  await page.getByRole('button',{name:'Opciones',exact:true}).click();await page.getByLabel('Lectura instantánea',{exact:true}).check();await page.getByRole('button',{name:'Volver',exact:true}).click();
  await page.getByRole('button',{name:'Cruzar el Portal'}).click();await page.locator('#dialogue').waitFor({state:'visible'});
  await page.screenshot({path:resolve(output,'production-arrival.png'),animations:'disabled'});
  for(let i=0;i<8;i++){if(await page.locator('#dialogue').isVisible()){await page.keyboard.press('Enter');await page.waitForTimeout(90);}}
  await page.locator('#dialogue').waitFor({state:'hidden'});
  await page.keyboard.down('w');await page.waitForTimeout(800);await page.keyboard.up('w');
  await page.keyboard.press('Escape');await page.getByRole('heading',{name:'Tomá un respiro',exact:true}).waitFor();await page.keyboard.press('Escape');
  await page.keyboard.press('j');await page.getByRole('heading',{name:'La Bitácora',exact:true}).waitFor();await page.keyboard.press('Escape');
  await page.reload();await page.getByRole('button',{name:'Continuar el viaje',exact:true}).click();await page.locator('#hud').waitFor({state:'visible'});
  await page.screenshot({path:resolve(output,'production-world.png'),animations:'disabled'});
  assert.ok(requests.every(url=>url.startsWith('http://127.0.0.1:4180/')||url.startsWith('blob:')));
  assert.deepEqual(report.errors,[]);
  report.checks=['Local launcher server responds with the production build','Title, original assets, dialogue, keyboard exploration, pause and journal render','Reload resumes the saved journey','All requested assets are local','Development inspection surface is absent'];report.passed=true;
}catch(error){report.error=error.stack;report.passed=false;process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await writeFile(resolve(output,'production-report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}
