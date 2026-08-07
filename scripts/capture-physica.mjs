import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const url =
  process.argv[2] ??
  "http://127.0.0.1:5173/physica/";

const output = path.resolve(
  process.argv[3] ??
  "docs/physica/screenshots/physica-latest.png"
);

fs.mkdirSync(path.dirname(output), { recursive: true });

let browser;

const launchOptions = {
  headless: process.env.PHYSICA_HEADED !== "1",
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-angle=swiftshader"
  ]
};

try {
  browser = await chromium.launch(launchOptions);
} catch {
  console.warn(
    "Chromium de Playwright falló. Intentando Chrome instalado..."
  );

  browser = await chromium.launch({
    ...launchOptions,
    channel: "chrome"
  });
}

const context = await browser.newContext({
  viewport: {
    width: 1280,
    height: 720
  },
  deviceScaleFactor: 1
});

const page = await context.newPage();

page.on("console", message => {
  console.log(
    `[browser:${message.type()}] ${message.text()}`
  );
});

page.on("pageerror", error => {
  console.error(`[page-error] ${error.message}`);
});

page.on("requestfailed", request => {
  console.error(
    `[request-failed] ${request.method()} ${request.url()} :: ` +
    `${request.failure()?.errorText ?? "unknown error"}`
  );
});

try {
  console.log(`Abriendo: ${url}`);

  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  if (!response) {
    throw new Error(
      `No hubo respuesta navegando a ${url}`
    );
  }

  if (!response.ok()) {
    throw new Error(
      `La página respondió HTTP ${response.status()} en ${url}`
    );
  }

  await page.waitForSelector("canvas", {
    state: "visible",
    timeout: 60000
  });

  await page.waitForFunction(() => {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      return false;
    }

    const rect = canvas.getBoundingClientRect();

    return (
      canvas.width > 100 &&
      canvas.height > 100 &&
      rect.width > 100 &&
      rect.height > 100
    );
  }, undefined, {
    timeout: 60000
  });

  // Tiempo para Babylon, Havok, shaders y assets.
  await page.waitForTimeout(10000);

  const canvas = page.locator("canvas").first();

  await canvas.screenshot({
    path: output,
    animations: "disabled"
  });

  const size = fs.statSync(output).size;

  if (size < 10000) {
    throw new Error(
      `La captura existe pero pesa ${size} bytes. ` +
      "Podría estar vacía o incompleta."
    );
  }

  console.log(`Captura creada: ${output}`);
  console.log(`Tamaño: ${size} bytes`);
} finally {
  await browser.close();
}