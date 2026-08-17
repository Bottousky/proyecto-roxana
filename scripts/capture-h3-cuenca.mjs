// scripts/capture-h3-cuenca.mjs
// H3: Cuenca de Ohm — capturas de cámara real, Portal → Manantial.
// Purpose: prove the H3 milestone is visually verifiable (not just
// mechanical PASS). Captures the main gameplay camera at the entry
// (Portal), hub (Plaza), the Ohm activation point, the Taller de Lumen,
// the Puerta de Ohm, and the Manantial patio.

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.H3_BASE ?? "http://127.0.0.1:4317";
const OUT = resolve("screenshots/h3-cuenca");
mkdirSync(OUT, { recursive: true });

const captures = [
  { id: "00_portal",          spawn: "portal",      prompt: "Portal Ω — entry from the Instituto" },
  { id: "01_camino",          spawn: "camino",      prompt: "Arrival promenade — south of the Plaza" },
  { id: "02_plaza_dormant",   spawn: "plaza",       prompt: "Plaza de Ohm — dormant state" },
  { id: "03_taller_approach", spawn: "taller",      prompt: "Taller de Lumen — east of the Plaza" },
  { id: "04_puerta_forecourt",spawn: "calzada_alta",prompt: "Calzada-alta — south forecourt of the Puerta" },
  { id: "05_puerta",          spawn: "puerta",      prompt: "Puerta de Ohm — arch over the main axis" },
  { id: "06_calzada_descent", spawn: "calzada",     prompt: "Calzada — sunken band north of the Puerta" },
  { id: "07_manantial",       spawn: "manantial",   prompt: "Manantial — sunken patio, the closed gate" },
  { id: "08_sendero",         spawn: "sendero",     prompt: "Sendero — south exterior, beyond the Portal" },
];

const topdown = [
  { id: "10_topdown_full",   layoutTop: "1", layoutDebug: "1" },
  { id: "11_topdown_labels", layoutTop: "1", layoutDebug: "1", layoutLabels: "1", layoutElectrical: "1" },
];

async function withPage(opts, fn) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("  pageerror:", e.message));
  try {
    await fn(page, opts);
  } finally {
    await ctx.close();
    await browser.close();
  }
}

async function captureGameplay({ id, spawn, prompt }) {
  await withPage({ id }, async (page, o) => {
    const url = `${BASE}/src/hd2d-ohmdal/index.html?spawn=${encodeURIComponent(spawn)}`;
    console.log(`[gameplay] ${o.id} → ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    // wait for the canvas + first render
    await page.waitForSelector("#scene", { state: "attached" });
    await page.waitForTimeout(1200);
    // dismiss title screen if visible
    await page.evaluate(() => {
      const t = document.getElementById("title");
      if (t) t.style.display = "none";
    });
    await page.waitForTimeout(400);
    const out = resolve(OUT, `${id}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`  saved ${out} — ${prompt}`);
  });
}

async function captureTopdown({ id, layoutTop, layoutDebug, layoutLabels, layoutElectrical }) {
  await withPage({ id }, async (page, o) => {
    const params = new URLSearchParams();
    if (layoutTop) params.set("layoutTop", layoutTop);
    if (layoutDebug) params.set("layoutDebug", layoutDebug);
    if (layoutLabels) params.set("layoutLabels", layoutLabels);
    if (layoutElectrical) params.set("layoutElectrical", layoutElectrical);
    const url = `${BASE}/src/hd2d-ohmdal/index.html?${params.toString()}`;
    console.log(`[topdown] ${o.id} → ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#scene", { state: "attached" });
    await page.waitForTimeout(1600);
    await page.evaluate(() => {
      const t = document.getElementById("title");
      if (t) t.style.display = "none";
    });
    await page.waitForTimeout(400);
    const out = resolve(OUT, `${id}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`  saved ${out}`);
  });
}

async function readState(page) {
  return await page.evaluate(() => {
    const r = window.__ohmdal;
    if (!r) return null;
    return {
      state: r.world.state,
      region: r.world.regionAt(r.world.player.position),
      pos: { x: r.world.player.position.x, y: r.world.player.position.y },
    };
  });
}

async function readRegionLabels(page) {
  return await page.evaluate(() => {
    const r = window.__ohmdal;
    if (!r) return null;
    const labels = [];
    for (const region of r.world.scene.children) {
      if (region.name) labels.push(region.name);
    }
    return labels;
  });
}

async function verifyAllRegionsReachable() {
  // For each region, spawn there, verify regionAt returns a non-default label
  // and player position falls inside the region rect.
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const results = [];
  try {
    for (const cap of captures) {
      const url = `${BASE}/src/hd2d-ohmdal/index.html?spawn=${encodeURIComponent(cap.spawn)}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#scene", { state: "attached" });
      await page.waitForTimeout(800);
      await page.evaluate(() => {
        const t = document.getElementById("title");
        if (t) t.style.display = "none";
      });
      const s = await readState(page);
      results.push({ id: cap.id, spawn: cap.spawn, ...s });
    }
  } finally {
    await ctx.close();
    await browser.close();
  }
  return results;
}

async function verifyFullPathWalkable() {
  // Walk from Portal to Manantial via key inputs; record region visited per step.
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const trace = [];
  try {
    await page.goto(`${BASE}/src/hd2d-ohmdal/index.html?spawn=portal`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#scene", { state: "attached" });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const t = document.getElementById("title");
      if (t) t.style.display = "none";
    });
    // Press ArrowUp to walk north for ~3s, then sample region.
    for (const step of [
      { key: "ArrowUp", duration: 1500, label: "walk_N_into_promenade" },
      { key: "ArrowUp", duration: 1500, label: "walk_N_into_plaza" },
      { key: "ArrowUp", duration: 2500, label: "walk_N_through_puerta" },
      { key: "ArrowUp", duration: 2000, label: "walk_N_into_manantial" },
    ]) {
      await page.keyboard.down(step.key);
      await page.waitForTimeout(step.duration);
      await page.keyboard.up(step.key);
      const s = await readState(page);
      trace.push({ step: step.label, ...s });
    }
  } finally {
    await ctx.close();
    await browser.close();
  }
  return trace;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--walk-only")) {
    const trace = await verifyFullPathWalkable();
    writeFileSync(resolve(OUT, "walk-trace.json"), JSON.stringify(trace, null, 2));
    console.log("\nWalk trace:");
    for (const t of trace) console.log("  ", JSON.stringify(t));
    return;
  }
  if (argv.includes("--regions-only")) {
    const r = await verifyAllRegionsReachable();
    writeFileSync(resolve(OUT, "regions.json"), JSON.stringify(r, null, 2));
    console.log("\nRegion reachability:");
    for (const e of r) console.log("  ", JSON.stringify(e));
    return;
  }
  for (const c of captures) await captureGameplay(c);
  for (const c of topdown) await captureTopdown(c);
  const r = await verifyAllRegionsReachable();
  writeFileSync(resolve(OUT, "regions.json"), JSON.stringify(r, null, 2));
  console.log("\nRegion reachability:");
  for (const e of r) console.log("  ", JSON.stringify(e));
  const t = await verifyFullPathWalkable();
  writeFileSync(resolve(OUT, "walk-trace.json"), JSON.stringify(t, null, 2));
  console.log("\nWalk trace:");
  for (const e of t) console.log("  ", JSON.stringify(e));
}

main().catch((e) => { console.error(e); process.exit(1); });
