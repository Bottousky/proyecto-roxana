import Phaser from "phaser";
import {
  components,
  places,
  routes,
  ambientAt,
} from "../../src/experiments/bitland/simulation.ts";
import type { State } from "../../src/experiments/bitland/simulation.ts";
type Theme = "warm" | "clean" | "cinema";
const colors = {
  warm: [0x194844, 0x10312f, 0xbd8c50, 0xf6e8c8, 0x345051, 0xffc76c],
  clean: [0xcee1da, 0x8caea6, 0x668d88, 0xfff9e7, 0x4c7380, 0xb35725],
  cinema: [0x102731, 0x09141e, 0x45636b, 0xcce9ec, 0x243744, 0xffc36f],
};
export function startScene(
  host: HTMLElement,
  read: () => State,
  onInspect: () => void,
) {
  let scene: Board | undefined,
    theme: Theme = "warm",
    reduce = false,
    zoom = false,
    systemView = false;
  const intervals: number[] = [];
  class Board extends Phaser.Scene {
    root!: Phaser.GameObjects.Container;
    fixed!: Phaser.GameObjects.Graphics;
    moving!: Phaser.GameObjects.Graphics;
    labels: Phaser.GameObjects.Text[] = [];
    lastState!: State;
    oldState!: State;
    lastTick = 0;
    lastFrame = 0;
    create() {
      scene = this;
      this.root = this.add.container(0, 0);
      this.fixed = this.add.graphics();
      this.moving = this.add.graphics();
      this.root.add([this.fixed, this.moving]);
      this.build();
      this.fit();
      this.scale.on("resize", () => this.fit());
      this.input.on("pointerup", () => onInspect());
      performance.mark("bitland-interactive");
    }
    p(x: number, y: number, z = 0) {
      return new Phaser.Math.Vector2((x - y) * 34, (x + y) * 18 - z * 34);
    }
    face(
      g: Phaser.GameObjects.Graphics,
      points: Phaser.Math.Vector2[],
      color: number,
      alpha = 1,
    ) {
      g.fillStyle(color, alpha);
      g.fillPoints(points, true);
    }
    path(
      g: Phaser.GameObjects.Graphics,
      points: Phaser.Math.Vector2[],
      color: number,
      width: number,
      alpha = 1,
    ) {
      g.lineStyle(width, color, alpha);
      g.strokePoints(points, false);
    }
    block(
      g: Phaser.GameObjects.Graphics,
      x: number,
      y: number,
      w: number,
      d: number,
      h: number,
      color: number,
    ) {
      const a = this.p(x, y, h),
        b = this.p(x + w, y, h),
        c = this.p(x + w, y + d, h),
        e = this.p(x, y + d, h);
      this.face(
        g,
        [e, c, this.p(x + w, y + d), this.p(x, y + d)],
        Phaser.Display.Color.IntegerToColor(color).darken(35).color,
      );
      this.face(
        g,
        [b, c, this.p(x + w, y + d), this.p(x + w, y)],
        Phaser.Display.Color.IntegerToColor(color).darken(50).color,
      );
      this.face(g, [a, b, c, e], color);
    }
    text(value: string, x: number, y: number, size: number, color: number) {
      const t = this.add
        .text(x, y, value, {
          fontFamily: "Arial",
          fontSize: size,
          color: "#" + color.toString(16).padStart(6, "0"),
        })
        .setOrigin(0.5);
      this.labels.push(t);
      this.root.add(t);
    }
    build() {
      this.labels.forEach((t) => t.destroy());
      this.labels = [];
      const g = this.fixed;
      g.clear();
      const [board, edge, copper, white, top] = colors[theme];
      this.face(
        g,
        [this.p(0, 1), this.p(14, 1), this.p(14, 14), this.p(0, 14)],
        0x102322,
        0.14,
      );
      this.block(g, 0, 0, 13, 13, 0.26, board);
      this.path(
        g,
        [
          this.p(0, 0, 0.27),
          this.p(13, 0, 0.27),
          this.p(13, 13, 0.27),
          this.p(0, 13, 0.27),
          this.p(0, 0, 0.27),
        ],
        copper,
        2,
        0.65,
      );
      for (let row = 0; row < 10; row++) {
        const y = 0.7 + 1.25 * row;
        this.path(
          g,
          [this.p(0.65, y, 0.28), this.p(12.35, y, 0.28)],
          copper,
          1.4,
          0.23,
        );
        for (let x = 0.7; x < 13; x += 1.5) {
          const p = this.p(x, y, 0.28);
          g.fillStyle(white, 0.25);
          g.fillCircle(p.x, p.y, 1);
        }
      }
      for (const [x, y] of [
        [0.5, 0.5],
        [12.5, 0.5],
        [12.5, 12.5],
        [0.5, 12.5],
      ]) {
        const p = this.p(x, y, 0.29);
        g.fillStyle(copper);
        g.fillEllipse(p.x, p.y, 18, 10);
        g.fillStyle(edge);
        g.fillEllipse(p.x, p.y, 10, 6);
      }
      for (const path of routes) {
        const points = path.map((n) => this.p(...places[n], 0.3));
        this.path(g, points, edge, 25);
        this.path(g, points, copper, 16);
        this.path(g, points, white, 1, 0.38);
      }
      Object.entries(places).forEach(([name, xy]) => {
        const p = this.p(...xy, 0.31);
        g.fillStyle(copper);
        g.fillEllipse(p.x, p.y, 32, 16);
        g.fillStyle(board);
        g.fillEllipse(p.x, p.y, 18, 9);
        if (name === "home")
          this.text("BOOT YARD", p.x - 4, p.y + 31, 15, white);
        if (name === "gpio")
          this.text("GPIO / 07", p.x + 22, p.y + 25, 12, white);
      });
      for (const c of components) {
        this.face(
          g,
          [
            this.p(c.x + 0.2, c.y + 0.2),
            this.p(c.x + c.w + 0.35, c.y + 0.2),
            this.p(c.x + c.w + 0.35, c.y + c.d + 0.5),
            this.p(c.x + 0.2, c.y + c.d + 0.5),
          ],
          0x061817,
          0.3,
        );
        for (let pin = 0.25; pin < c.w; pin += 0.4)
          this.block(g, c.x + pin, c.y - 0.25, 0.16, c.d + 0.5, 0.13, copper);
        this.block(
          g,
          c.x,
          c.y,
          c.w,
          c.d,
          c.h,
          c.kind === "clock" ? white : top,
        );
        const p = this.p(c.x + c.w / 2, c.y + c.d / 2, c.h + 0.05);
        this.text(
          c.label,
          p.x,
          p.y,
          c.kind === "clock" ? 10 : 11,
          c.kind === "clock" ? edge : white,
        );
        const notch = this.p(c.x + 0.3, c.y + 0.3, c.h + 0.02);
        g.fillStyle(copper);
        g.fillCircle(notch.x, notch.y, 3);
      }
      this.path(
        g,
        [this.p(10, 7, 0.3), this.p(13, 7, 0.3), this.p(14.5, 7, 0.3)],
        copper,
        7,
      );
      for (let y = 6.2; y < 8; y += 0.4)
        this.block(g, 12.3, y, 0.7, 0.2, 0.5, copper);
      const led = this.p(14.6, 7, 0.25);
      g.fillStyle(0xaca590);
      g.fillEllipse(led.x, led.y, 48, 24);
      this.text("EXTERIOR", led.x + 5, led.y + 47, 11, 0x59665e);
      this.text("D07", led.x + 5, led.y + 31, 12, 0x354c48);
    }
    fit() {
      const w = this.scale.width,
        h = this.scale.height,
        k =
          Math.min(w / 1030, h / 630) *
          (w < 650 ? (systemView ? 1 : 1.9) : zoom ? 1.12 : 1);
      this.root.setScale(k).setPosition(w * 0.47, h * 0.51 - 245 * k);
    }
    update(time: number) {
      if (this.lastFrame && intervals.length < 2400)
        intervals.push(time - this.lastFrame);
      this.lastFrame = time;
      const s = read();
      if (s !== this.lastState) {
        this.oldState = this.lastState ?? s;
        this.lastState = s;
        this.lastTick = time;
      }
      const g = this.moving;
      g.clear();
      const [, edge, copper, white, , signal] = colors[theme];
      const k = reduce ? 1 : Math.min(1, (time - this.lastTick) / 380),
        blend = k * k * (3 - 2 * k);
      for (let id = 0; id < 120; id++) {
        const p = this.p(...ambientAt(id, s.tick + (reduce ? 0 : k)), 0.33);
        g.fillStyle(white, 0.17);
        g.fillCircle(p.x, p.y, 1.6);
      }
      const gate = this.p(6, 6, 0.36);
      this.path(
        g,
        s.gateOpen
          ? [
              new Phaser.Math.Vector2(gate.x - 18, gate.y - 20),
              new Phaser.Math.Vector2(gate.x - 18, gate.y - 45),
            ]
          : [
              new Phaser.Math.Vector2(gate.x - 18, gate.y - 20),
              new Phaser.Math.Vector2(gate.x + 18, gate.y - 3),
            ],
        s.gateOpen ? white : 0xe98560,
        s.gateOpen ? 5 : 7,
      );
      const a = places[this.oldState.position],
        b = places[s.position],
        x = a[0] + (b[0] - a[0]) * blend,
        y = a[1] + (b[1] - a[1]) * blend;
      const p = this.p(x, y, 0.35);
      g.fillStyle(edge, 0.55);
      g.fillEllipse(p.x, p.y, 32, 14);
      this.block(g, x - 0.25, y - 0.25, 0.5, 0.5, 0.7, white);
      const face = this.p(x, y, 0.8);
      g.fillStyle(edge);
      g.fillRoundedRect(face.x - 10, face.y - 7, 20, 8, 3);
      g.fillStyle(signal);
      g.fillCircle(face.x + 4, face.y - 3, 2);
      if (s.carrying !== null)
        this.block(g, x + 0.2, y + 0.2, 0.32, 0.32, 1.1, signal);
      for (let i = 0; i < Math.min(s.queue.length, 8); i++)
        this.block(
          g,
          1.35 + (i % 3) * 0.35,
          7.5 + Math.floor(i / 3) * 0.36,
          0.28,
          0.28,
          0.4,
          signal,
        );
      for (const packet of s.messages) {
        const progress = Math.max(0, Math.min(1, (s.tick - packet.born) / 3)),
          pt = this.p(10 + 4.6 * progress, 7, 0.45);
        g.fillStyle(signal, 0.15);
        g.fillCircle(pt.x, pt.y, 10);
        g.fillStyle(signal);
        g.fillCircle(pt.x, pt.y, 4);
      }
      const led = this.p(14.6, 7, 0.3);
      if (s.led && !reduce) {
        g.fillStyle(signal, 0.035);
        for (let r = 65; r >= 20; r -= 15)
          g.fillEllipse(led.x, led.y - 10, r * 2, r * 1.3);
      }
      g.fillStyle(s.led ? signal : 0x777969);
      g.fillRoundedRect(led.x - 14, led.y - 30, 28, 32, 13);
      g.fillStyle(white, s.led ? 0.8 : 0.2);
      g.fillEllipse(led.x - 5, led.y - 21, 8, 12);
      if (s.nullSeen) {
        const n = this.p(x - 1.1, y + 0.5, 0.48);
        g.lineStyle(4, white);
        g.strokeRoundedRect(n.x - 11, n.y - 19, 22, 31, 9);
        g.fillStyle(white);
        g.fillCircle(n.x - 4, n.y - 9, 1.6);
        g.fillCircle(n.x + 4, n.y - 9, 1.6);
      }
      const clock = this.p(2.5, 10.5, 0.7);
      g.fillStyle(signal);
      g.fillCircle(clock.x, clock.y, 3 + (s.tick % 2) * 2);
      if (s.fault) {
        g.lineStyle(3, 0xe98560);
        g.strokeEllipse(p.x, p.y + 3, 46, 24);
      }
    }
  }
  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent: host,
    transparent: true,
    antialias: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: host.clientWidth,
      height: host.clientHeight,
    },
    scene: Board,
    audio: { noAudio: true },
    banner: false,
  });
  const observer = new ResizeObserver(() =>
    game.scale.resize(host.clientWidth, host.clientHeight),
  );
  observer.observe(host);
  return {
    theme(t: Theme) {
      theme = t;
      scene?.build();
    },
    reduced(v: boolean) {
      reduce = v;
    },
    focus(v: boolean) {
      zoom = v;
      if (v) systemView = false;
      scene?.fit();
    },
    overview() {
      systemView = !systemView;
      zoom = false;
      scene?.fit();
      return systemView;
    },
    metrics() {
      const a = intervals.slice(10).sort((a, b) => a - b);
      return {
        frames: a.length,
        p50: a[Math.floor(a.length * 0.5)],
        p95: a[Math.floor(a.length * 0.95)],
        renderer: "Phaser 4.1.0",
        ambient: 120,
      };
    },
  };
}
