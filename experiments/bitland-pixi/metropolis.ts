import { Application, Container, Graphics, Rectangle, Text } from "pixi.js";
import { places, routes } from "../../src/experiments/bitland/simulation.ts";
import type { State } from "../../src/experiments/bitland/simulation.ts";

import {
  cityPalettes as schemes,
  cityScale as unit,
  cityLots,
  cityTrafficAt,
} from "../../src/experiments/bitland/metropolis-fixture.ts";
import type { CityTreatment as Treatment } from "../../src/experiments/bitland/metropolis-fixture.ts";
export type { CityTreatment as Treatment } from "../../src/experiments/bitland/metropolis-fixture.ts";
export async function createWorld(host: HTMLElement, inspect: () => void) {
  const app = new Application();
  await app.init({
    resizeTo: host,
    antialias: true,
    background: 0x070b1c,
    resolution: Math.min(devicePixelRatio, 2),
    autoDensity: true,
  });
  host.appendChild(app.canvas);
  app.canvas.setAttribute("aria-hidden", "true");
  const city = new Container(),
    fixed = new Container(),
    traffic = new Container(),
    actor = new Graphics();
  city.addChild(fixed, traffic, actor);
  app.stage.addChild(city);
  let state: State,
    previous: State,
    changed = performance.now(),
    treatment: Treatment = "metro";
  let reduced = false,
    overview = false,
    focused = false,
    panX = 0,
    panY = 0;
  let last = performance.now(),
    presentationTime = 0;
  const frameTimes: number[] = [];
  const cars: Graphics[] = [];
  const pt = (x: number, y: number): [number, number] => [x * unit, y * unit];
  function line(
    g: Graphics,
    points: number[][],
    color: number,
    width: number,
    alpha = 1,
  ) {
    g.moveTo(...(points[0] as [number, number]));
    for (const p of points.slice(1)) g.lineTo(...(p as [number, number]));
    g.stroke({ color, width, alpha, join: "round", cap: "round" });
  }
  function text(
    value: string,
    x: number,
    y: number,
    size = 12,
    color = 0xa1badc,
    rotation = 0,
  ) {
    const t = new Text({
      text: value,
      style: {
        fontFamily: "Arial",
        fontSize: size,
        fontWeight: "600",
        fill: color,
        letterSpacing: 2,
      },
    });
    t.anchor.set(0.5);
    t.position.set(x, y);
    t.rotation = rotation;
    fixed.addChild(t);
  }
  function rebuild() {
    fixed.removeChildren().forEach((c) => c.destroy());
    traffic.removeChildren().forEach((c) => c.destroy());
    cars.length = 0;
    const [ground, roof, cyan, pink, violet, gold] = schemes[treatment];
    const g = new Graphics();
    fixed.addChild(g);
    // The perimeter is the package boundary. The city IS the die: repeated
    // memory cells, instruction decoders and bus lanes give each district form.
    g.rect(-550, -300, 1850, 1500).fill(0x0b142a);
    g.roundRect(-485, -227, 1685, 1330, 35)
      .fill(0x1f2b47)
      .stroke({ color: 0x5c6481, width: 5 });
    g.roundRect(-457, -200, 1630, 1270, 12)
      .fill(ground)
      .stroke({ color: violet, width: 3 });
    for (let i = 0; i < 24; i++) {
      const y = -170 + i * 51;
      g.rect(-524, y, 64, 19)
        .fill(0x758299)
        .rect(1175, y, 65, 19)
        .fill(0x758299);
      g.rect(-520, y, 12, 19)
        .fill(0xc6d4e4)
        .rect(1224, y, 12, 19)
        .fill(0xc6d4e4);
    }
    for (let i = 0; i < 30; i++) {
      const x = -425 + i * 52;
      g.rect(x, -263, 18, 62)
        .fill(0x758299)
        .rect(x, 1071, 18, 62)
        .fill(0x758299);
    }
    // Main orthogonal buses: road markings are address lanes, not a PCB decal.
    for (let i = -2; i <= 5; i++) {
      const v = i * 192;
      g.rect(-445, v - 20, 1605, 40).fill(0x0e1830);
      g.rect(v - 20, -190, 40, 1250).fill(0x0e1830);
      line(
        g,
        [
          [-445, v - 24],
          [1160, v - 24],
        ],
        cyan,
        2,
        0.35,
      );
      line(
        g,
        [
          [v - 24, -190],
          [v - 24, 1060],
        ],
        pink,
        2,
        0.35,
      );
      for (let t = -420; t < 1130; t += 40) {
        g.rect(t, v - 1, 14, 2).fill({ color: 0x91a1bf, alpha: 0.35 });
        if (t < 1040)
          g.rect(v - 1, t, 2, 14).fill({ color: 0x91a1bf, alpha: 0.35 });
      }
    }
    function district(x: number, y: number, w: number, h: number, id: number) {
      const neon = [cyan, pink, violet][id % 3];
      g.rect(x + 7, y + 9, w, h).fill(0x030614);
      g.rect(x - 4, y - 4, w + 8, h + 8).fill({ color: neon, alpha: 0.07 });
      g.rect(x, y, w, h)
        .fill(roof)
        .stroke({ color: neon, width: 1, alpha: 0.6 });
      g.rect(x + 5, y + 5, w - 10, h - 10).fill(0x101a33);
      // Memory banks and silicon processing cells; their repeated geometry is
      // the architecture. Roof contacts replace arbitrary urban windows.
      for (let a = 12; a < w - 13; a += 19)
        for (let b = 25; b < h - 10; b += 24) {
          g.rect(x + a, y + b, 12, 16).fill(id % 3 === 0 ? 0x293b5b : 0x24304f);
          g.rect(x + a + 2, y + b + 2, 8, 3).fill({
            color: neon,
            alpha: (a + b + id) % 4 ? 0.7 : 0.16,
          });
          g.rect(x + a + 3, y + b + 9, 6, 4).fill(0x0a1428);
        }
      g.rect(x + 7, y + 7, w * 0.48, 4).fill(neon);
      for (let a = 12; a < w - 8; a += 14) {
        g.rect(x + a, y - 5, 5, 5).fill(0x697d9c);
        g.rect(x + a, y + h, 5, 5).fill(0x697d9c);
      }
      text(
        ["SRAM", "DMA", "CACHE", "ALU", "FLASH", "STACK"][id % 6] +
          " / " +
          String(id).padStart(2, "0"),
        x + w / 2,
        y + 17,
        8,
        neon,
      );
    }
    for (const lot of cityLots) district(lot.x, lot.y, lot.w, lot.h, lot.id);
    for (const r of routes) {
      const points = r.map((n) => pt(...places[n]));
      line(g, points, 0x050a17, 42);
      line(g, points, 0x344263, 30);
      line(g, points, gold, 2, 0.85);
    }
    for (const [name, xy] of Object.entries(places)) {
      const [x, y] = pt(...xy);
      g.circle(x, y, 21).fill(0x121c32).stroke({ color: gold, width: 2 });
      g.circle(x, y, 5).fill(gold);
      const names: Record<string, string> = {
        home: "MUELLE / ENTRADA",
        fork: "SENSOR",
        direct: "PASO CORTO",
        bypass: "RODEO",
        gpio: "GPIO 07",
      };
      text(names[name], x, y + (name === "direct" ? -32 : 35), 9, 0xffe6a3);
    }
    // The bus exits the die through a physical pin into a separate actuator.
    line(g, [pt(10, 7), pt(19.5, 7)], 0x111b30, 34);
    line(g, [pt(10, 7), pt(19.5, 7)], gold, 5, 0.6);
    for (let x = 680; x < 1210; x += 29) {
      line(
        g,
        [
          [x, 443],
          [x + 5, 448],
          [x, 453],
        ],
        gold,
        1,
        0.8,
      );
    }
    g.roundRect(1240, 409, 88, 78, 12)
      .fill(0x29344c)
      .stroke({ color: 0x97a6bb, width: 2 });
    text("LED / EXTERIOR", 1284, 513, 10, gold);
    text("MICROCONTROLADOR / BITLAND", 344, -170, 17, cyan);
    text("BUS DE DATOS / 08", -411, 417, 12, pink, -Math.PI / 2);
    text("MEMORIA PERSISTENTE", 862, 972, 12, violet);
    text("BOOT YARD", 321, 216, 31, 0xdaf1ff);
    text("DISTRITO 01 · RUTINAS HEREDADAS", 321, 247, 9, cyan);
    // Each traffic graphic is built once, then translated: no per-frame
    // tessellation of the dense city or its 120 ambient process vehicles.
    for (let i = 0; i < 120; i++) {
      const car = new Graphics(),
        c = [cyan, pink, violet, gold][i % 4];
      car.roundRect(-10, -5, 20, 10, 3).fill({ color: c, alpha: 0.12 });
      car.roundRect(-6, -3, 12, 6, 2).fill(c);
      car.rect(2, -2, 3, 4).fill(0xf0fbff);
      traffic.addChild(car);
      cars.push(car);
    }
  }
  function fit() {
    const w = host.clientWidth,
      h = host.clientHeight;
    const scale = overview
      ? Math.min(w / 1960, h / 1530)
      : w < 650
        ? Math.max(w / 1670, h / 1100) * 1.08
        : Math.min(w / 1920, h / 1080);
    city.scale.set(scale);
    const cx = overview ? 395 : w < 650 ? 340 : focused && w > 800 ? 570 : 430;
    city.position.set(
      w * 0.5 - cx * scale + panX,
      h * 0.5 - 445 * scale + panY,
    );
  }
  rebuild();
  new ResizeObserver(fit).observe(host);
  fit();
  // Drag to explore the chip. A stationary tap keeps the inspect affordance.
  app.stage.eventMode = "static";
  app.stage.hitArea = new Rectangle(-10000, -10000, 20000, 20000);
  let drag: { x: number; y: number; px: number; py: number } | undefined;
  app.stage.on("pointerdown", (e) => {
    drag = { x: e.global.x, y: e.global.y, px: panX, py: panY };
  });
  app.stage.on("pointermove", (e) => {
    if (!drag) return;
    panX = Math.max(-700, Math.min(700, drag.px + e.global.x - drag.x));
    panY = Math.max(-650, Math.min(650, drag.py + e.global.y - drag.y));
    fit();
  });
  app.stage.on("pointerup", (e) => {
    if (drag && Math.hypot(e.global.x - drag.x, e.global.y - drag.y) < 8)
      inspect();
    drag = undefined;
  });
  app.stage.on("pointerupoutside", () => {
    drag = undefined;
  });
  app.ticker.add(() => {
    const now = performance.now(),
      delta = Math.min(50, now - last);
    if (frameTimes.length < 2400) frameTimes.push(now - last);
    last = now;
    if (!state) return;
    if (!reduced && !document.hidden) presentationTime += delta / 1000;
    for (let i = 0; i < cars.length; i++) {
      const at = cityTrafficAt(i, presentationTime);
      cars[i].visible = at.visible;
      cars[i].position.set(at.x, at.y);
      cars[i].rotation = at.rotation;
    }
    const g = actor;
    g.clear();
    const gold = schemes[treatment][5],
      cyan = schemes[treatment][2];
    const progress = reduced ? 1 : Math.min(1, (now - changed) / 380),
      blend = progress * progress * (3 - 2 * progress);
    const from = places[previous?.position ?? state.position],
      to = places[state.position];
    const [x, y] = pt(
      from[0] + (to[0] - from[0]) * blend,
      from[1] + (to[1] - from[1]) * blend,
    );
    // Courier silhouette: white chassis, four dark runners, amber cargo.
    g.circle(x, y, 29).fill({ color: gold, alpha: 0.08 });
    for (const dx of [-13, 9])
      for (const dy of [-12, 7])
        g.roundRect(x + dx, y + dy, 5, 8, 2).fill(0x060a18);
    g.roundRect(x - 10, y - 16, 20, 32, 6)
      .fill(0xf5f7ed)
      .stroke({ color: gold, width: 2 });
    g.roundRect(x - 7, y - 12, 14, 9, 3).fill(0x142839);
    g.rect(x - 4, y - 9, 3, 3)
      .fill(cyan)
      .rect(x + 2, y - 9, 3, 3)
      .fill(cyan);
    if (state.carrying !== null)
      g.rect(x - 8, y + 1, 16, 11)
        .fill(gold)
        .stroke({ color: 0xffffff, width: 1 });
    for (let i = 0; i < Math.min(8, state.queue.length); i++)
      g.rect(104 + (i % 3) * 15, 478 + Math.floor(i / 3) * 14, 11, 10).fill(
        gold,
      );
    const [bx, by] = pt(6, 6);
    line(
      g,
      state.gateOpen
        ? [
            [bx - 19, by - 10],
            [bx - 19, by - 42],
          ]
        : [
            [bx - 18, by - 18],
            [bx + 18, by + 18],
          ],
      state.gateOpen ? cyan : 0xff536d,
      7,
    );
    if (!state.gateOpen) g.circle(bx - 20, by - 22, 6).fill(0xff536d);
    for (const packet of state.messages) {
      const p = Math.max(0, Math.min(1, (state.tick - packet.born) / 3));
      const xx = 640 + 644 * p;
      g.circle(xx, 448, 16)
        .fill({ color: gold, alpha: 0.15 })
        .rect(xx - 6, 442, 12, 12)
        .fill(gold);
    }
    if (state.led) {
      g.circle(1284, 448, 52).fill({ color: gold, alpha: 0.1 });
      g.circle(1284, 448, 32).fill({ color: gold, alpha: 0.2 });
      line(
        g,
        [
          [646, 448],
          [1250, 448],
        ],
        gold,
        3,
        0.9,
      );
    }
    g.circle(1284, 448, 21)
      .fill(state.led ? gold : 0x526177)
      .stroke({ color: 0xa0b6c7, width: 2 });
    g.circle(1278, 441, 5).fill({
      color: 0xffffff,
      alpha: state.led ? 0.9 : 0.15,
    });
    if (state.nullSeen) {
      const nx = x - 40,
        ny = y + 25;
      g.circle(nx, ny, 16).fill(0x101329).stroke({ color: 0xe4dcff, width: 3 });
      line(
        g,
        [
          [nx - 13, ny + 14],
          [nx + 13, ny - 14],
        ],
        0xb38cff,
        3,
      );
      g.circle(nx - 5, ny - 3, 2)
        .fill(0xffffff)
        .circle(nx + 5, ny - 3, 2)
        .fill(0xffffff);
    }
    if (state.fault) g.circle(x, y, 24).stroke({ color: 0xff536d, width: 3 });
  });
  return {
    update(s: State) {
      previous = state ?? s;
      state = s;
      changed = performance.now();
    },
    treatment(t: Treatment) {
      treatment = t;
      rebuild();
    },
    reduced(v: boolean) {
      reduced = v;
    },
    focus(v: boolean) {
      focused = v;
      if (v) {
        overview = false;
        panX = panY = 0;
      }
      fit();
    },
    overview() {
      overview = !overview;
      focused = false;
      panX = panY = 0;
      fit();
      return overview;
    },
    metrics() {
      const sorted = frameTimes.slice(10).sort((a, b) => a - b);
      return {
        frames: sorted.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        renderer: "PixiJS 8.20.1 / metropolis",
        ambient: 120,
      };
    },
  };
}
