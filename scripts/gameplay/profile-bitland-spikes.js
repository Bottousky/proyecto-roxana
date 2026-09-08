// Playwright CLI snippet. Uses production previews on 4313/4314, never alters sim privately.
async (page) => {
  const results=[];
  for(const [candidate,port] of [['pixi',4313],['phaser',4314]]) {
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.setViewportSize({width:1440,height:960});
    await page.waitForFunction(()=>Boolean(window.bitlandEvidence));
    await page.getByRole('button',{name:'◎ Abrir courier'}).click();
    await page.getByRole('combobox',{name:'Instrucción 3',exact:true}).selectOption('sense');
    await page.getByRole('combobox',{name:'Al terminar'}).selectOption('pending');
    await page.getByRole('checkbox',{name:'Llegadas periódicas'}).check();
    await page.getByRole('button',{name:'↺ Probar desde el muelle'}).click();
    await page.getByRole('button',{name:'Cerrar programa'}).click();
    const load=await page.evaluate(()=>{const nav=performance.getEntriesByType('navigation')[0];return {domContentLoadedMs:nav.domContentLoadedEventEnd,interactiveMs:performance.getEntriesByName('bitland-interactive')[0]?.startTime??null};});
    const cdp=await page.context().newCDPSession(page);
    const samples=[];
    for(const rate of [1,4]) {
      await cdp.send('Emulation.setCPUThrottlingRate',{rate});
      await page.getByRole('button',{name:'▶ Ejecutar',exact:true}).click();
      const sample=await page.evaluate(async()=>{const times=[];let previous;
        await new Promise(resolve=>{const collect=t=>{if(previous!==undefined)times.push(t-previous);previous=t;if(times.length<180)requestAnimationFrame(collect);else resolve();};requestAnimationFrame(collect);});
        times.sort((a,b)=>a-b);return {p50:times[90],p95:times[171],worst:times.at(-1),ticks:window.bitlandEvidence.snapshot().tick};});
      await page.getByRole('button',{name:'Ⅱ Pausar',exact:true}).click();
      samples.push({cpuThrottle:rate,...sample});
    }
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await cdp.detach();
    results.push({candidate,load,samples});
  }
  return results;
}
