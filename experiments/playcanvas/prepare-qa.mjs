import fs from 'node:fs';
fs.mkdirSync(new URL('./scripts/',import.meta.url),{recursive:true});
fs.mkdirSync(new URL('./tests/',import.meta.url),{recursive:true});
for(const name of ['content','state','journal','cinematic-progress','cinematics','electrical']){
 const source=fs.readFileSync(new URL(`../../tests/${name}.test.js`,import.meta.url),'utf8').replaceAll('../src/','../src/game/').replaceAll('resolve(`src/','resolve(`src/game/');
 fs.writeFileSync(new URL(`./tests/${name}.test.js`,import.meta.url),source);
}
let text=fs.readFileSync(new URL('../../tests/playthrough.mjs',import.meta.url),'utf8').replaceAll('127.0.0.1:4173','127.0.0.1:4190').replace("resolve('output/playwright')","resolve('output/playcanvas-playthrough')");
text=text.replace(/const projected = world\.player\.position[\s\S]*?return \{ x, y, unobscured:/,'const projected = world.getScreenPosition({x:point[0],z:point[1],ground:true});\n    const rect = world.canvas.getBoundingClientRect();\n    const x = rect.left + projected.x, y = rect.top + projected.y;\n    return { x, y, unobscured:');
fs.writeFileSync(new URL('./scripts/playthrough.mjs',import.meta.url),text);
text=text.replace('const object = [...world.area.objects, ...world.area.exits].find(o => o.id === id);','const object = world.getInteractions().find(o => o.id === id);');
text=text.replace('return { object, bounds:', 'return { object, path: object ? world.planInteraction(object) : null, bounds:');
text=text.replace('document.elementFromPoint(x, y) === world.canvas','document.elementFromPoint(x, y) === world.canvas && !world.pickInteraction(x,y)');
text=text.replace('const goal = [geometry.object.x, geometry.object.z];','let goal = geometry.path?.at(-1) || [geometry.object.x, geometry.object.z];');
text=text.replace('let path = navigationPath(info.position, goal, geometry.bounds, geometry.obstacles);','let path = geometry.path?.length ? geometry.path : [goal];');
text=text.replace("if (info.nearby === id) { await page.keyboard.up('Shift'); return geometry.object; }", "if (info.nearby === id || await page.evaluate(id => {const w=window.__ohmdal.world;return w.canInteractWith(w.getInteractions().find(o=>o.id===id));},id)) { await page.keyboard.up('Shift'); return geometry.object; }");
text=text.replace("  await page.keyboard.press('e');\n  log('interact'", "  if((await inspect()).nearby===id) await page.keyboard.press('e');\n  else {const p=await page.evaluate(id=>{const w=window.__ohmdal.world,o=w.getInteractions().find(o=>o.id===id),p=w.getScreenPosition(o),r=w.canvas.getBoundingClientRect();return {x:p.x+r.left,y:p.y+r.top};},id);await page.mouse.click(p.x,p.y);}\n  log('interact'");
text=text.replace('path = navigationPath(info.position, goal, geometry.bounds, geometry.obstacles); waypoint = 0; lastProgress = Date.now();','const fresh = await worldGeometry(id); path = fresh.path?.length ? fresh.path : [goal]; goal = path.at(-1); waypoint = 0; lastProgress = Date.now();');
text=text.replace("  assert.equal((await inspect()).area, target, `The ${id} passage enters ${target}`);","  await page.waitForFunction(target => window.__ohmdal.state.area === target, target, {timeout:25000});\n  await settle({stable:1400});\n  assert.equal((await inspect()).area, target, `The ${id} passage enters ${target}`);");
text=text.replace("await page.locator('[data-action=\"switch\"][data-key=\"archive\"]').click();", "assert.equal((await inspect()).puzzle.state.switches.archive,false,'The archive was isolated in the courtyard');");
text=text.replace("  report.finishedAt = new Date().toISOString();", "  const saved=await page.evaluate(()=>localStorage.getItem('ohmdal.playcanvas.arc1.v1')).catch(()=>null);if(saved)await writeFile(resolve(output,'verified-save.json'),saved);\n  report.finishedAt = new Date().toISOString();");
fs.writeFileSync(new URL('./scripts/playthrough.mjs',import.meta.url),text);
