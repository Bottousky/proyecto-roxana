// Playwright CLI: run-code --filename scripts/gameplay/playtest-bitland-spikes.js
// The CLI supplies page. Run against each candidate URL; no private state mutations.
async (page) => {
  const candidate = /:(4312|4314)/.test(page.url()) ? "phaser" : "pixi";
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const assert = (test, message) => {
    if (!test) throw Error(message);
  };
  const snapshot = () => page.evaluate(() => window.bitlandEvidence.snapshot());
  const step = async (count) => {
    for (let i = 0; i < count; i++)
      await page.getByRole("button", { name: "Un paso →" }).click();
  };
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.getByRole("button", { name: "◎ Abrir courier" }).click();
  // Plausible inherited failure: fixed direct path with closed input.
  await page
    .getByRole("button", { name: "Paso corto: abierto", exact: true })
    .click();
  await step(3);
  let s = await snapshot();
  assert(s.fault?.includes("cerrado"), "Closed gate must block direct path");
  assert(
    s.position === "fork" && s.carrying === 1,
    "Failed attempt must retain the packet",
  );
  await page.getByText("Ver qué ejecutó", { exact: true }).click();
  assert(
    (await page.getByRole("list").first().innerText()).includes("cerrado"),
    "Trace must explain barrier",
  );
  await page.screenshot({
    path: `output/playwright/bitland/${candidate}-failure.png`,
  });
  // Repair via actual editor and preserve the failure trace.
  await page
    .getByRole("combobox", { name: "Instrucción 3", exact: true })
    .selectOption("sense");
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(3);
  s = await snapshot();
  assert(s.position === "bypass", "False branch must use bypass");
  assert(
    s.trace.at(-1).reads.gateOpen === false,
    "Branch read must be factual",
  );
  const before = JSON.stringify(s);
  await step(1);
  await page.getByRole("button", { name: "Retroceder un pulso" }).click();
  assert(
    JSON.stringify(await snapshot()) === before,
    "Rewind must restore exact state and trace",
  );
  await step(5);
  s = await snapshot();
  assert(s.delivered.length === 1 && s.led, "Packet must reach external LED");
  await page.getByRole("button", { name: "Cerrar programa" }).click();
  // Same state and viewport for all treatments: no renderer preference encoded in the test.
  for (const treatment of ["warm", "clean", "cinema", "metro"]) {
    await page.getByRole("button", { name: "Ajustes", exact: true }).click();
    await page
      .getByRole("combobox", { name: "Tratamiento visual" })
      .selectOption(treatment);
    await page.getByRole("button", { name: "Ajustes", exact: true }).click();
    await page.screenshot({
      path: `output/playwright/bitland/${candidate}-${treatment}.png`,
    });
  }
  // Transfer input: the same condition now selects the other route.
  await page
    .getByRole("button", { name: "Paso corto: cerrado", exact: true })
    .click();
  await page.getByRole("button", { name: "◎ Abrir courier" }).click();
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(3);
  s = await snapshot();
  assert(
    s.position === "direct" && s.trace.at(-1).reads.gateOpen === true,
    "True branch transfer",
  );
  // Outcome-based alternative: bypass works for both inputs, extra wait is legal.
  await page
    .getByRole("combobox", { name: "Instrucción 3", exact: true })
    .selectOption("bypass");
  await page.getByRole("button", { name: "+ Espera", exact: true }).click();
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(9);
  s = await snapshot();
  assert(s.delivered.length === 1 && !s.fault, "Alternate solution rejected");
  await page.getByRole("button", { name: "↶ Deshacer" }).click();
  assert(
    (await page.getByRole("combobox", { name: /Instrucción/ }).count()) === 6,
    "Undo must restore structure",
  );
  await page
    .getByRole("combobox", { name: "Instrucción 3", exact: true })
    .selectOption("sense");
  await page
    .getByRole("combobox", { name: "Al terminar" })
    .selectOption("pending");
  await page
    .getByRole("combobox", { name: "Paquetes", exact: true })
    .selectOption("3");
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(24);
  s = await snapshot();
  assert(
    s.delivered.length === 3 && s.halted && !s.fault,
    "Batch loop must terminate",
  );
  // Empty input is normal for a guarded routine.
  await page
    .getByRole("combobox", { name: "Paquetes", exact: true })
    .selectOption("0");
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(2);
  s = await snapshot();
  assert(
    s.halted && !s.fault && s.delivered.length === 0,
    "Empty batch must terminate safely",
  );
  // Inherited infinite routine produces repeated trace; change actual guard to terminate.
  for (let i = 6; i > 1; i--)
    await page
      .getByRole("button", { name: `Quitar instrucción ${i}`, exact: true })
      .click();
  await page
    .getByRole("combobox", { name: "Instrucción 1", exact: true })
    .selectOption("wait");
  await page
    .getByRole("combobox", { name: "Al terminar" })
    .selectOption("forever");
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(8);
  s = await snapshot();
  assert(!s.halted && s.cycles === 4, "Infinite routine must actually repeat");
  await page
    .getByRole("combobox", { name: "Al terminar" })
    .selectOption("pending");
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await step(2);
  assert(
    (await snapshot()).halted,
    "Changed guard must terminate inherited routine",
  );
  // Fresh inherited sequence, now set up ongoing automation through the editor.
  await page.reload();
  await page.getByRole("button", { name: "◎ Abrir courier" }).click();
  await page
    .getByRole("combobox", { name: "Instrucción 3", exact: true })
    .selectOption("sense");
  await page
    .getByRole("combobox", { name: "Al terminar" })
    .selectOption("pending");
  await page.getByRole("checkbox", { name: "Llegadas periódicas" }).check();
  await page.getByRole("button", { name: "↺ Probar desde el muelle" }).click();
  await page.getByRole("button", { name: "Cerrar programa" }).click();
  await step(65);
  s = await snapshot();
  assert(
    s.delivered.length >= 4 && !s.halted && !s.fault,
    "Automation must continue with panel closed",
  );
  // Running, pause, keyboard; cadence cannot change interpreter semantics.
  await page.getByRole("button", { name: "▶ Ejecutar", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Ⅱ Pausar", exact: true }).click();
  const stopped = (await snapshot()).tick;
  const metrics = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    await new Promise((resolve) => {
      function frame(now) {
        samples.push(now - last);
        last = now;
        if (samples.length < 181) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    samples.shift();
    samples.sort((a, b) => a - b);
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return {
      p50: samples[90],
      p95: samples[171],
      frames: 180,
      dpr: devicePixelRatio,
      viewport: [innerWidth, innerHeight],
      hardwareConcurrency: navigator.hardwareConcurrency,
      gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unavailable",
    };
  });
  assert((await snapshot()).tick === stopped, "Pause must freeze semantics");
  // Tablet/mobile context with real touch events, same objective, no drag.
  const touch = await page
    .context()
    .browser()
    .newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
    });
  const mobile = await touch.newPage();
  await mobile.goto(page.url());
  await mobile.getByRole("button", { name: "◎ Abrir courier" }).tap();
  await mobile
    .getByRole("combobox", { name: "Instrucción 3", exact: true })
    .selectOption("sense");
  await mobile.getByRole("button", { name: "↺ Probar desde el muelle" }).tap();
  await mobile.getByRole("button", { name: "Cerrar programa" }).tap();
  await mobile
    .getByRole("button", { name: "Paso corto: abierto", exact: true })
    .tap();
  for (let i = 0; i < 8; i++)
    await mobile.getByRole("button", { name: "Un paso →" }).tap();
  const m = await mobile.evaluate(() => window.bitlandEvidence.snapshot());
  assert(m.delivered.length === 1 && m.led, "Touch path must light LED");
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert(!overflow, "Mobile horizontal overflow");
  await mobile.screenshot({
    path: `output/playwright/bitland/${candidate}-touch.png`,
  });
  await mobile.getByRole("button", { name: "Ajustes", exact: true }).tap();
  await mobile
    .getByRole("combobox", { name: "Tamaño de texto" })
    .selectOption({ label: "Muy grande" });
  await mobile
    .getByRole("checkbox", { name: "Alto contraste", exact: true })
    .check();
  await mobile.getByRole("button", { name: "Ajustes", exact: true }).tap();
  await mobile.getByRole("button", { name: "◎ Abrir courier" }).tap();
  await mobile.screenshot({
    path: `output/playwright/bitland/${candidate}-accessible.png`,
  });
  assert(errors.length === 0, `Browser errors: ${errors.join("; ")}`);
  await touch.close();
  return {
    candidate,
    passed: true,
    desktop: { ...metrics, steps: s.tick, deliveries: s.delivered.length },
    touch: {
      width: 390,
      height: 844,
      deliveries: m.delivered.length,
      overflow,
    },
    errors,
  };
}

