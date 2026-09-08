import { Application, Container, Graphics, Text } from "pixi.js";
import {
  places,
  routes,
  components,
  ambientAt,
} from "../../src/experiments/bitland/simulation.ts";
import type { State } from "../../src/experiments/bitland/simulation.ts";
export type Treatment = "warm" | "clean" | "cinema";
const palettes = {
  warm: {
    board: 0x194844,
    edge: 0x10312f,
    copper: 0xbd8c50,
    ink: 0x122728,
    top: 0x345051,
    white: 0xf6e8c8,
    signal: 0xffc76c,
  },
  clean: {
    board: 0xcee1da,
    edge: 0x8caea6,
    copper: 0x668d88,
    ink: 0x274753,
    top: 0x4c7380,
    white: 0xfff9e7,
    signal: 0xb35725,
  },
  cinema: {
    board: 0x102731,
    edge: 0x09141e,
    copper: 0x45636b,
    ink: 0x09141e,
    top: 0x243744,
    white: 0xcce9ec,
    signal: 0xffc36f,
  },
};
export async function createWorld(host: HTMLElement, inspect: () => void) {
  const app = new Application();
  await app.init({
    resizeTo: host,
    antialias: true,
    backgroundAlpha: 0,
    resolution: Math.min(devicePixelRatio, 2),
    autoDensity: true,
  });
  host.appendChild(app.canvas);
  app.canvas.setAttribute("aria-hidden", "true");
  const stage = new Container(),
    architecture = new Container(),
    dynamic = new Graphics();
  stage.addChild(architecture, dynamic);
  app.stage.addChild(stage);
  let treatment: Treatment = "warm",
    scale = 1,
    reduced = false,
    focus = false,
    systemView = false;
  let state: State,
    previous: State,
    changed = performance.now(),
    now = performance.now();
  const frameTimes: number[] = [];
  const iso = (x: number, y: number, z = 0): [number, number] => [
    (x - y) * 34,
    (x + y) * 18 - z * 34,
  ];
  const poly = (g: Graphics, pts: number[][], color: number, alpha = 1) =>
    g.poly(pts.flat()).fill({ color, alpha });
  function line(
    g: Graphics,
    pts: number[][],
    color: number,
    width: number,
    alpha = 1,
  ) {
    g.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach((p) => g.lineTo(p[0], p[1]));
    g.stroke({ color, width, alpha, cap: "round", join: "round" });
  }
  function box(
    g: Graphics,
    x: number,
    y: number,
    w: number,
    d: number,
    h: number,
    top: number,
    left: number,
    right: number,
  ) {
    const a = iso(x, y, h),
      b = iso(x + w, y, h),
      c = iso(x + w, y + d, h),
      e = iso(x, y + d, h);
    poly(g, [e, c, iso(x + w, y + d), iso(x, y + d)], left);
    poly(g, [b, c, iso(x + w, y + d), iso(x + w, y)], right);
    poly(g, [a, b, c, e], top);
  }
  function label(
    text: string,
    x: number,
    y: number,
    size = 11,
    color = 0xe6dabb,
  ) {
    const t = new Text({
      text,
      style: {
        fontFamily: "Arial",
        fontSize: size,
        fill: color,
        letterSpacing: 1.5,
      },
    });
    t.position.set(x, y);
    t.anchor.set(0.5);
    architecture.addChild(t);
  }
  function rebuild() {
    architecture.removeChildren().forEach((c) => c.destroy());
    const g = new Graphics();
    architecture.addChild(g);
    const p = palettes[treatment];
    poly(
      g,
      [
        [-445, 273],
        [0, 513],
        [445, 273],
        [0, 38],
      ],
      0x102322,
      0.14,
    );
    box(g, 0, 0, 13, 13, 0.26, p.board, p.edge, 0x0d2529);
    line(
      g,
      [
        iso(0, 0, 0.27),
        iso(13, 0, 0.27),
        iso(13, 13, 0.27),
        iso(0, 13, 0.27),
        iso(0, 0, 0.27),
      ],
      p.copper,
      2,
      0.65,
    );
    for (let row = 0; row < 10; row++) {
      const y = 0.7 + row * 1.25;
      line(g, [iso(0.65, y, 0.28), iso(12.35, y, 0.28)], p.copper, 1.4, 0.23);
      for (let x = 0.7; x < 13; x += 1.5) {
        const q = iso(x, y, 0.28);
        g.circle(...q, 1).fill({ color: p.white, alpha: 0.25 });
      }
    }
    for (const [x, y] of [
      [0.5, 0.5],
      [12.5, 0.5],
      [12.5, 12.5],
      [0.5, 12.5],
    ]) {
      const q = iso(x, y, 0.29);
      g.ellipse(...q, 9, 5)
        .fill(p.copper)
        .ellipse(...q, 5, 3)
        .fill(p.edge);
    }
    for (const r of routes) {
      const coords = r.map((n) => iso(...places[n], 0.3));
      line(g, coords, p.edge, 25);
      line(g, coords, p.copper, 16);
      line(g, coords, p.white, 1, 0.38);
    }
    for (const [name, xy] of Object.entries(places)) {
      const q = iso(...xy, 0.31);
      g.ellipse(...q, 16, 8)
        .fill(p.copper)
        .ellipse(...q, 9, 4.5)
        .fill(p.board);
      if (name === "home") label("BOOT YARD", q[0] - 4, q[1] + 31, 15, p.white);
      if (name === "gpio")
        label("GPIO / 07", q[0] + 22, q[1] + 25, 12, p.white);
    }
    for (const c of components) {
      const shadow = [
        iso(c.x + 0.2, c.y + 0.2),
        iso(c.x + c.w + 0.35, c.y + 0.2),
        iso(c.x + c.w + 0.35, c.y + c.d + 0.5),
        iso(c.x + 0.2, c.y + c.d + 0.5),
      ];
      poly(g, shadow, 0x061817, 0.3);
      for (let i = 0.25; i < c.w; i += 0.4) {
        box(
          g,
          c.x + i,
          c.y - 0.25,
          0.16,
          c.d + 0.5,
          0.13,
          p.copper,
          p.edge,
          p.edge,
        );
      }
      box(
        g,
        c.x,
        c.y,
        c.w,
        c.d,
        c.h,
        c.kind === "clock" ? p.white : p.top,
        p.ink,
        p.edge,
      );
      const at = iso(c.x + c.w / 2, c.y + c.d / 2, c.h + 0.05);
      label(
        c.label,
        at[0],
        at[1],
        c.kind === "clock" ? 10 : 11,
        c.kind === "clock" ? p.ink : p.white,
      );
      const notch = iso(c.x + 0.3, c.y + 0.3, c.h + 0.02);
      g.circle(...notch, 3).fill(p.copper);
    }
    // Through-hole connector is physically on the PCB edge; LED is beyond it.
    line(g, [iso(10, 7, 0.3), iso(13, 7, 0.3), iso(14.5, 7, 0.3)], p.copper, 7);
    for (let y = 6.2; y < 8; y += 0.4)
      box(g, 12.3, y, 0.7, 0.2, 0.5, p.copper, p.ink, p.edge);
    const led = iso(14.6, 7, 0.25);
    g.ellipse(...led, 24, 12).fill(0xaca590);
    label("EXTERIOR", led[0] + 5, led[1] + 47, 11, 0x59665e);
    label("D07", led[0] + 5, led[1] + 31, 12, 0x354c48);
    const clk = iso(2.6, 10.6, 0.6);
    label("CLOCK", clk[0], clk[1] + 31, 9, p.white);
  }
  rebuild();
  stage.eventMode = "static";
  stage.cursor = "pointer";
  stage.on("pointertap", inspect);
  const fit = () => {
    const width = host.clientWidth,
      height = host.clientHeight;
    scale =
      Math.min(width / 1030, height / 630) *
      (width < 650 ? (systemView ? 1 : 1.9) : focus ? 1.12 : 1);
    stage.scale.set(scale);
    stage.position.set(width * 0.47, height * 0.51 - 245 * scale);
  };
  new ResizeObserver(fit).observe(host);
  fit();
  app.ticker.add(() => {
    const stamp = performance.now();
    if (frameTimes.length < 2400) frameTimes.push(stamp - now);
    now = stamp;
    if (!state) return;
    const p = palettes[treatment];
    dynamic.clear();
    const elapsed = reduced ? 1 : Math.min(1, (stamp - changed) / 380),
      t = elapsed * elapsed * (3 - 2 * elapsed);
    for (let id = 0; id < 120; id++) {
      const [x, y] = ambientAt(id, state.tick + (reduced ? 0 : elapsed));
      const at = iso(x, y, 0.33);
      dynamic.circle(...at, 1.6).fill({ color: p.white, alpha: 0.17 });
    }
    // Barrier represents the actual input; no fabricated inspector state.
    const barrier = iso(6, 6, 0.36);
    if (!state.gateOpen) {
      line(
        dynamic,
        [
          [barrier[0] - 18, barrier[1] - 20],
          [barrier[0] + 18, barrier[1] - 3],
        ],
        0xe98560,
        7,
      );
    } else {
      line(
        dynamic,
        [
          [barrier[0] - 18, barrier[1] - 20],
          [barrier[0] - 18, barrier[1] - 45],
        ],
        p.white,
        5,
      );
    }
    const from = places[previous?.position ?? state.position],
      to = places[state.position];
    const x = from[0] + (to[0] - from[0]) * t,
      y = from[1] + (to[1] - from[1]) * t;
    const base = iso(x, y, 0.35);
    dynamic.ellipse(...base, 16, 7).fill({ color: 0x071f22, alpha: 0.55 });
    box(
      dynamic,
      x - 0.25,
      y - 0.25,
      0.5,
      0.5,
      0.7,
      p.white,
      0xb2a78b,
      0xd3c4a4,
    );
    const head = iso(x, y, 0.8);
    dynamic.roundRect(head[0] - 10, head[1] - 7, 20, 8, 3).fill(p.ink);
    dynamic.circle(head[0] + 4, head[1] - 3, 2).fill(p.signal);
    if (state.carrying !== null)
      box(
        dynamic,
        x + 0.2,
        y + 0.2,
        0.32,
        0.32,
        1.1,
        p.signal,
        p.copper,
        0x8a6236,
      );
    for (let i = 0; i < Math.min(state.queue.length, 8); i++)
      box(
        dynamic,
        1.35 + (i % 3) * 0.35,
        7.5 + Math.floor(i / 3) * 0.36,
        0.28,
        0.28,
        0.4,
        p.signal,
        p.copper,
        p.edge,
      );
    for (const packet of state.messages) {
      const progress = Math.max(0, Math.min(1, (state.tick - packet.born) / 3));
      const at = iso(10 + 4.6 * progress, 7, 0.45);
      dynamic
        .circle(...at, 10)
        .fill({ color: p.signal, alpha: 0.15 })
        .circle(...at, 4)
        .fill(p.signal);
    }
    const led = iso(14.6, 7, 0.3);
    if (state.led && !reduced)
      for (let r = 65; r >= 20; r -= 15)
        dynamic
          .ellipse(led[0], led[1] - 10, r, r * 0.65)
          .fill({ color: p.signal, alpha: 0.035 });
    dynamic
      .roundRect(led[0] - 14, led[1] - 30, 28, 32, 13)
      .fill(state.led ? p.signal : 0x777969);
    dynamic
      .ellipse(led[0] - 5, led[1] - 21, 4, 6)
      .fill({ color: p.white, alpha: state.led ? 0.8 : 0.2 });
    if (state.nullSeen) {
      const n = iso(x - 1.1, y + 0.5, 0.48);
      dynamic
        .ellipse(n[0], n[1] + 15, 12, 5)
        .fill({ color: p.ink, alpha: 0.4 });
      dynamic
        .roundRect(n[0] - 11, n[1] - 19, 22, 31, 9)
        .stroke({ color: p.white, width: 4 });
      dynamic
        .circle(n[0] - 4, n[1] - 9, 1.6)
        .fill(p.white)
        .circle(n[0] + 4, n[1] - 9, 1.6)
        .fill(p.white);
    }
    const pulse = iso(2.5, 10.5, 0.7);
    dynamic.circle(...pulse, 3 + (state.tick % 2) * 2).fill(p.signal);
    if (state.fault)
      dynamic
        .ellipse(base[0], base[1] + 3, 23, 12)
        .stroke({ color: 0xe98560, width: 3 });
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
    reduced(value: boolean) {
      reduced = value;
    },
    focus(value: boolean) {
      focus = value;
      if (value) systemView = false;
      fit();
    },
    overview() {
      systemView = !systemView;
      focus = false;
      fit();
      return systemView;
    },
    metrics() {
      const sorted = frameTimes.slice(10).sort((a, b) => a - b);
      return {
        frames: sorted.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        renderer: "PixiJS 8.20.1",
        ambient: 120,
      };
    },
  };
}
