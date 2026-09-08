import Phaser from "phaser";
import { places, routes } from "../../src/experiments/bitland/simulation.ts";
import type { State } from "../../src/experiments/bitland/simulation.ts";
import {
  cityLots,
  cityPalettes,
  cityTrafficAt,
  cityScale,
} from "../../src/experiments/bitland/metropolis-fixture.ts";
import type { CityTreatment } from "../../src/experiments/bitland/metropolis-fixture.ts";

/** Independent Phaser scene. Only domain state and neutral fixture are shared. */
export function startScene(
  host: HTMLElement,
  read: () => State,
  onInspect: () => void,
) {
  let instance: Metro | undefined,
    theme: CityTreatment = "metro",
    reduce = false,
    detail = false,
    overview = false;
  let pan = { x: 0, y: 0 };
  const frames: number[] = [];
  class Metro extends Phaser.Scene {
    group!: Phaser.GameObjects.Container;
    architecture!: Phaser.GameObjects.Graphics;
    actors!: Phaser.GameObjects.Graphics;
    captions: Phaser.GameObjects.Text[] = [];
    fleet: Phaser.GameObjects.Container[] = [];
    observed?: State;
    previous?: State;
    changedAt = 0;
    clock = 0;
    create() {
      instance = this;
      this.group = this.add.container();
      this.architecture = this.add.graphics();
      this.actors = this.add.graphics();
      this.group.add([this.architecture, this.actors]);
      this.construct();
      this.resizeView();
      this.scale.on("resize", () => this.resizeView());
      let press: { x: number; y: number; px: number; py: number } | undefined;
      this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
        press = { x: p.x, y: p.y, px: pan.x, py: pan.y };
      });
      this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
        if (!press || !p.isDown) return;
        pan.x = Phaser.Math.Clamp(press.px + p.x - press.x, -700, 700);
        pan.y = Phaser.Math.Clamp(press.py + p.y - press.y, -650, 650);
        this.resizeView();
      });
      this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
        if (press && Math.hypot(p.x - press.x, p.y - press.y) < 8) onInspect();
        press = undefined;
      });
      performance.mark("bitland-interactive");
    }
    caption(s: string, x: number, y: number, size: number, color: number) {
      const t = this.add
        .text(x, y, s, {
          fontFamily: "Arial",
          fontSize: size,
          fontStyle: "bold",
          color: "#" + color.toString(16).padStart(6, "0"),
        })
        .setOrigin(0.5);
      this.captions.push(t);
      this.group.add(t);
    }
    route(
      g: Phaser.GameObjects.Graphics,
      points: number[][],
      width: number,
      color: number,
      alpha = 1,
    ) {
      g.lineStyle(width, color, alpha)
        .beginPath()
        .moveTo(points[0][0], points[0][1]);
      for (const p of points.slice(1)) g.lineTo(p[0], p[1]);
      g.strokePath();
    }
    construct() {
      this.captions.forEach((t) => t.destroy());
      this.captions = [];
      this.fleet.forEach((t) => t.destroy());
      this.fleet = [];
      const g = this.architecture;
      g.clear();
      const [substrate, roof, cyan, magenta, violet, amber] =
        cityPalettes[theme];
      g.fillStyle(0x0b142a).fillRect(-550, -300, 1850, 1500);
      g.fillStyle(0x1f2b47).fillRoundedRect(-485, -227, 1685, 1330, 35);
      g.lineStyle(5, 0x5c6481).strokeRoundedRect(-485, -227, 1685, 1330, 35);
      g.fillStyle(substrate).fillRoundedRect(-457, -200, 1630, 1270, 12);
      g.lineStyle(3, violet).strokeRoundedRect(-457, -200, 1630, 1270, 12);
      g.fillStyle(0x758299);
      for (let n = 0; n < 24; n++) {
        const y = -170 + n * 51;
        g.fillRect(-524, y, 64, 19).fillRect(1175, y, 65, 19);
      }
      for (let n = 0; n < 30; n++) {
        const x = -425 + n * 52;
        g.fillRect(x, -263, 18, 62).fillRect(x, 1071, 18, 62);
      }
      for (let n = -2; n <= 5; n++) {
        const axis = n * 192;
        g.fillStyle(0x0e1830)
          .fillRect(-445, axis - 20, 1605, 40)
          .fillRect(axis - 20, -190, 40, 1250);
        this.route(
          g,
          [
            [-445, axis - 24],
            [1160, axis - 24],
          ],
          2,
          cyan,
          0.35,
        );
        this.route(
          g,
          [
            [axis - 24, -190],
            [axis - 24, 1060],
          ],
          2,
          magenta,
          0.35,
        );
        g.fillStyle(0x91a1bf, 0.35);
        for (let d = -420; d < 1130; d += 40) {
          g.fillRect(d, axis - 1, 14, 2);
          if (d < 1040) g.fillRect(axis - 1, d, 2, 14);
        }
      }
      for (const { x, y, w, h, id } of cityLots) {
        const edge = [cyan, magenta, violet][id % 3];
        g.fillStyle(0x030614).fillRect(x + 7, y + 9, w, h);
        g.fillStyle(roof).fillRect(x, y, w, h);
        g.lineStyle(1, edge, 0.6).strokeRect(x, y, w, h);
        g.fillStyle(0x101a33).fillRect(x + 5, y + 5, w - 10, h - 10);
        for (let column = 12; column < w - 13; column += 19)
          for (let row = 25; row < h - 10; row += 24) {
            g.fillStyle(0x293b5b).fillRect(x + column, y + row, 12, 16);
            g.fillStyle(edge, 0.7).fillRect(x + column + 2, y + row + 2, 8, 3);
            g.fillStyle(0x0a1428).fillRect(x + column + 3, y + row + 9, 6, 4);
          }
        g.fillStyle(edge).fillRect(x + 7, y + 7, w * 0.48, 4);
        g.fillStyle(0x697d9c);
        for (let pin = 12; pin < w - 8; pin += 14)
          g.fillRect(x + pin, y - 5, 5, 5).fillRect(x + pin, y + h, 5, 5);
        this.caption(
          ["SRAM", "DMA", "CACHE", "ALU", "FLASH", "STACK"][id % 6] +
            " / " +
            id.toString().padStart(2, "0"),
          x + w / 2,
          y + 17,
          8,
          edge,
        );
      }
      for (const path of routes) {
        const points = path.map((key) => places[key].map((n) => n * cityScale));
        this.route(g, points, 42, 0x050a17);
        this.route(g, points, 30, 0x344263);
        this.route(g, points, 2, amber, 0.85);
      }
      const labels = {
        home: "MUELLE / ENTRADA",
        fork: "SENSOR",
        direct: "PASO CORTO",
        bypass: "RODEO",
        gpio: "GPIO 07",
      };
      for (const key of Object.keys(places) as (keyof typeof places)[]) {
        const [x, y] = places[key].map((n) => n * cityScale);
        g.fillStyle(0x121c32).fillCircle(x, y, 21);
        g.lineStyle(2, amber).strokeCircle(x, y, 21);
        g.fillStyle(amber).fillCircle(x, y, 5);
        this.caption(
          labels[key],
          x,
          y + (key === "direct" ? -32 : 35),
          9,
          0xffe6a3,
        );
      }
      this.route(
        g,
        [
          [640, 448],
          [1248, 448],
        ],
        34,
        0x111b30,
      );
      this.route(
        g,
        [
          [640, 448],
          [1248, 448],
        ],
        5,
        amber,
        0.6,
      );
      for (let x = 680; x < 1210; x += 29)
        this.route(
          g,
          [
            [x, 443],
            [x + 5, 448],
            [x, 453],
          ],
          1,
          amber,
        );
      g.fillStyle(0x29344c).fillRoundedRect(1240, 409, 88, 78, 12);
      g.lineStyle(2, 0x97a6bb).strokeRoundedRect(1240, 409, 88, 78, 12);
      this.caption("LED / EXTERIOR", 1284, 513, 10, amber);
      this.caption("MICROCONTROLADOR / BITLAND", 344, -170, 17, cyan);
      this.caption("MEMORIA PERSISTENTE", 862, 972, 12, violet);
      this.caption("BOOT YARD", 321, 216, 31, 0xdaf1ff);
      this.caption("DISTRITO 01 · RUTINAS HEREDADAS", 321, 247, 9, cyan);
      for (let i = 0; i < 120; i++) {
        const c = this.add.container(),
          mesh = this.add.graphics(),
          tint = [cyan, magenta, violet, amber][i % 4];
        mesh.fillStyle(tint, 0.12).fillRoundedRect(-10, -5, 20, 10, 3);
        mesh.fillStyle(tint).fillRoundedRect(-6, -3, 12, 6, 2);
        mesh.fillStyle(0xf0fbff).fillRect(2, -2, 3, 4);
        c.add(mesh);
        this.fleet.push(c);
        this.group.add(c);
      }
      this.group.bringToTop(this.actors);
    }
    resizeView() {
      const w = host.clientWidth,
        h = host.clientHeight;
      const zoom = overview
        ? Math.min(w / 1960, h / 1530)
        : w < 650
          ? Math.max(w / 1670, h / 1100) * 1.08
          : Math.min(w / 1920, h / 1080);
      const center = overview
        ? 395
        : w < 650
          ? 340
          : detail && w > 800
            ? 570
            : 430;
      this.group
        .setScale(zoom)
        .setPosition(w / 2 - center * zoom + pan.x, h / 2 - 445 * zoom + pan.y);
    }
    update(time: number, delta: number) {
      if (frames.length < 2400) frames.push(delta);
      if (!reduce && !document.hidden) this.clock += Math.min(delta, 50) / 1000;
      this.fleet.forEach((car, i) => {
        const at = cityTrafficAt(i, this.clock);
        car
          .setPosition(at.x, at.y)
          .setRotation(at.rotation)
          .setVisible(at.visible);
      });
      const s = read();
      if (this.observed !== s) {
        this.previous = this.observed ?? s;
        this.observed = s;
        this.changedAt = time;
      }
      const a = places[this.previous?.position ?? s.position],
        b = places[s.position];
      const t = reduce ? 1 : Math.min(1, (time - this.changedAt) / 380),
        smooth = t * t * (3 - 2 * t);
      const x = (a[0] + (b[0] - a[0]) * smooth) * cityScale,
        y = (a[1] + (b[1] - a[1]) * smooth) * cityScale;
      const g = this.actors;
      g.clear();
      const amber = cityPalettes[theme][5],
        cyan = cityPalettes[theme][2];
      g.fillStyle(amber, 0.08).fillCircle(x, y, 29);
      g.fillStyle(0x060a18);
      for (const dx of [-13, 9])
        for (const dy of [-12, 7]) g.fillRoundedRect(x + dx, y + dy, 5, 8, 2);
      g.fillStyle(0xf5f7ed).fillRoundedRect(x - 10, y - 16, 20, 32, 6);
      g.lineStyle(2, amber).strokeRoundedRect(x - 10, y - 16, 20, 32, 6);
      g.fillStyle(0x142839).fillRoundedRect(x - 7, y - 12, 14, 9, 3);
      g.fillStyle(cyan)
        .fillRect(x - 4, y - 9, 3, 3)
        .fillRect(x + 2, y - 9, 3, 3);
      if (s.carrying !== null) {
        g.fillStyle(amber).fillRect(x - 8, y + 1, 16, 11);
        g.lineStyle(1, 0xffffff).strokeRect(x - 8, y + 1, 16, 11);
      }
      g.fillStyle(amber);
      for (let i = 0; i < Math.min(8, s.queue.length); i++)
        g.fillRect(104 + (i % 3) * 15, 478 + Math.floor(i / 3) * 14, 11, 10);
      this.route(
        g,
        s.gateOpen
          ? [
              [365, 374],
              [365, 342],
            ]
          : [
              [366, 366],
              [402, 402],
            ],
        7,
        s.gateOpen ? cyan : 0xff536d,
      );
      if (!s.gateOpen) g.fillStyle(0xff536d).fillCircle(364, 362, 6);
      for (const packet of s.messages) {
        const p = Phaser.Math.Clamp((s.tick - packet.born) / 3, 0, 1),
          xx = 640 + 644 * p;
        g.fillStyle(amber, 0.15).fillCircle(xx, 448, 16);
        g.fillStyle(amber).fillRect(xx - 6, 442, 12, 12);
      }
      if (s.led) {
        g.fillStyle(amber, 0.1).fillCircle(1284, 448, 52);
        g.fillStyle(amber, 0.2).fillCircle(1284, 448, 32);
        this.route(
          g,
          [
            [646, 448],
            [1250, 448],
          ],
          3,
          amber,
          0.9,
        );
      }
      g.fillStyle(s.led ? amber : 0x526177).fillCircle(1284, 448, 21);
      g.lineStyle(2, 0xa0b6c7).strokeCircle(1284, 448, 21);
      g.fillStyle(0xffffff, s.led ? 0.9 : 0.15).fillCircle(1278, 441, 5);
      if (s.nullSeen) {
        const nx = x - 40,
          ny = y + 25;
        g.fillStyle(0x101329).fillCircle(nx, ny, 16);
        g.lineStyle(3, 0xe4dcff).strokeCircle(nx, ny, 16);
        this.route(
          g,
          [
            [nx - 13, ny + 14],
            [nx + 13, ny - 14],
          ],
          3,
          0xb38cff,
        );
        g.fillStyle(0xffffff)
          .fillCircle(nx - 5, ny - 3, 2)
          .fillCircle(nx + 5, ny - 3, 2);
      }
      if (s.fault) g.lineStyle(3, 0xff536d).strokeCircle(x, y, 24);
    }
  }
  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent: host,
    backgroundColor: "#070b1c",
    antialias: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: host.clientWidth,
      height: host.clientHeight,
    },
    scene: Metro,
    audio: { noAudio: true },
    banner: false,
  });
  new ResizeObserver(() =>
    game.scale.resize(host.clientWidth, host.clientHeight),
  ).observe(host);
  return {
    theme(value: CityTreatment) {
      theme = value;
      instance?.construct();
    },
    reduced(value: boolean) {
      reduce = value;
    },
    focus(value: boolean) {
      detail = value;
      if (value) {
        overview = false;
        pan = { x: 0, y: 0 };
      }
      instance?.resizeView();
    },
    overview() {
      overview = !overview;
      detail = false;
      pan = { x: 0, y: 0 };
      instance?.resizeView();
      return overview;
    },
    metrics() {
      const ordered = frames.slice(10).sort((a, b) => a - b);
      return {
        frames: ordered.length,
        p50: ordered[Math.floor(ordered.length * 0.5)],
        p95: ordered[Math.floor(ordered.length * 0.95)],
        renderer: "Phaser 4.1.0 / metropolis",
        ambient: 120,
      };
    },
  };
}
