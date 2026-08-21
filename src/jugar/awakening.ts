// Awake of Ohm en el runtime topdown (Phaser).
// Espejo del módulo de awakening del HD-2D, pensado para no romper el
// ritmo de exploración: el flash dura una fracción de segundo, la cámara
// se acerca, las chispas saltan del pedestal y la música cambia.
//
// Diseñado para no usar ni el bench ni el dialog: ocurre DESPUÉS de que
// el puzzle del anillo se cierra y ANTES de que Edda hable. Mientras
// corre, el dialog se silencia.

import Phaser from 'phaser';
import { W, H } from './ExplorationScene';
import { setAmbience, sfxAwakening, playMusicTrack, sfxSpark } from '../audio';
import { state } from '../state';
import { pushUI, popUI } from '../ui/overlay';

export interface AwakeningHandle {
  /** Promesa que resuelve cuando la secuencia terminó. */
  done: Promise<void>;
  /** Cancela por adelantado (ej. cambio de sala). */
  cancel: () => void;
}

export function playAwakening(scene: Phaser.Scene, pedestalX: number, pedestalY: number): AwakeningHandle {
  let cancelled = false;
  let settled = false;
  let resolveDone!: () => void;
  // Esta cinemática sólo posee el input mientras muestra sus visuales crudos.
  // No envuelve `say`: el diálogo administra su propio lock.
  pushUI();

  // Asegurar textura de chispa antes de crear sprites.
  ensureSparkTexture(scene);

  // Overlay de flash (rect blanco con blend ADD, alpha tween).
  const flash = scene.add.rectangle(W / 2, H / 2, W * 1.4, H * 1.4, 0xfff1c2)
    .setScrollFactor(0)
    .setDepth(10_000)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setAlpha(0);

  // Halo dorado alrededor del pedestal: pulse inicial grande.
  const halo = scene.add.image(pedestalX, pedestalY, 'vis-glow')
    .setBlendMode(Phaser.BlendModes.ADD)
    .setTint(0xffd97a)
    .setAlpha(0)
    .setScale(0.2)
    .setDepth(8999);

  // 60 chispas alrededor del pedestal. Cada una es un círculo radial.
  const sparks: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 28 + Math.random() * 84;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist * 0.6; // un poco más plano en Y
    const spark = scene.add.image(pedestalX + dx, pedestalY + dy, 'vis-spark')
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xfff1a0)
      .setScale(0.6 + Math.random() * 0.9)
      .setAlpha(0)
      .setDepth(9000);
    sparks.push(spark);
  }

  // Cámara: pequeño zoom-in (5%) y vuelta.
  const cam = scene.cameras.main;
  const startZoom = cam.zoom;
  const peakZoom = startZoom * 1.05;

  // Timeline de tweens.
  const timeline: Phaser.Tweens.Tween[] = [];
  const timers: Phaser.Time.TimerEvent[] = [];
  let skip: Phaser.GameObjects.Text | undefined;
  const done = new Promise<void>((resolve) => { resolveDone = resolve; });
  const restoreAndResolve = (): void => {
    if (settled) return;
    settled = true;
    for (const timer of timers) timer.remove(false);
    for (const tween of timeline) tween.stop();
    flash.destroy();
    halo.destroy();
    for (const spark of sparks) spark.destroy();
    skip?.destroy();
    cam.zoom = startZoom;
    scene.input.keyboard?.off('keydown-ESC', cancel);
    scene.input.off('pointerdown', cancel);
    popUI();
    resolveDone();
  };
  const cancel = (): void => {
    cancelled = true;
    restoreAndResolve();
  };
  // 0ms: chispa audible + flash on + música de "vivo" entrando
  timers.push(scene.time.delayedCall(0, () => {
    if (cancelled) return;
    sfxAwakening();
    void playMusicTrack('alive', 2400);
  }));
  // 30ms: flash sube a 0.45 (rápido)
  timeline.push(scene.tweens.add({
    targets: flash, alpha: 0.55, duration: 220, ease: 'Quad.easeOut',
  }));
  // halo: pulse grande
  timeline.push(scene.tweens.add({
    targets: halo, alpha: { from: 0, to: 0.9 }, scale: { from: 0.2, to: 4 }, duration: 360, ease: 'Quad.easeOut',
  }));
  timeline.push(scene.tweens.add({
    targets: halo, alpha: { from: 0.9, to: 0 }, scale: { from: 4, to: 8 }, duration: 800, delay: 360, ease: 'Sine.easeIn',
    onComplete: () => halo.destroy(),
  }));
  // 30-450ms: cámara acerca
  timeline.push(scene.tweens.add({
    targets: cam, zoom: peakZoom, duration: 380, ease: 'Sine.easeOut',
  }));
  // 120ms: chispas prenden
  timers.push(scene.time.delayedCall(120, () => {
    if (cancelled) return;
    for (const s of sparks) s.setAlpha(0.95);
    sfxSpark();
  }));
  // 220ms: chispas vuelan hacia afuera y se atenúan
  for (const s of sparks) {
    const angle = Math.atan2(s.y - pedestalY, s.x - pedestalX);
    const speed = 60 + Math.random() * 80;
    timeline.push(scene.tweens.add({
      targets: s,
      x: s.x + Math.cos(angle) * speed,
      y: s.y + Math.sin(angle) * speed * 0.6,
      alpha: 0,
      scale: s.scale * 0.2,
      duration: 800 + Math.random() * 400,
      delay: 200 + Math.random() * 220,
      ease: 'Quad.easeOut',
    }));
  }
  // 280ms: flash peak
  timeline.push(scene.tweens.add({
    targets: flash, alpha: 0.18, duration: 480, ease: 'Sine.easeInOut',
  }));
  // 580ms: cámara vuelve
  timeline.push(scene.tweens.add({
    targets: cam, zoom: startZoom, duration: 540, ease: 'Sine.easeInOut',
  }));
  // 620ms: ambience cambia a "ohmdal-on" (afloja la penumbra)
  timers.push(scene.time.delayedCall(620, () => {
    if (cancelled) return;
    setAmbience('ohmdal-on');
    state.flags.ohmAwakeEverSeen = true;
  }));
  // 900ms: flash desaparece
  timeline.push(scene.tweens.add({
    targets: flash, alpha: 0, duration: 380, ease: 'Sine.easeIn',
    onComplete: () => flash.destroy(),
  }));
  // 1500ms: limpiar chispas
  timers.push(scene.time.delayedCall(1500, () => {
    for (const s of sparks) s.destroy();
  }));

  // Escape y un toque durante la visual permiten omitirla sin abandonar la
  // escena con cámara o input bloqueados. El texto es visible también en touch.
  skip = scene.add.text(W - 26, H - 20, 'Omitir', { fontFamily: 'monospace', fontSize: '12px', color: '#fff1c2' })
    .setOrigin(1, 1).setScrollFactor(0).setDepth(10_001).setInteractive({ useHandCursor: true });
  skip.on('pointerdown', cancel);
  scene.input.keyboard?.once('keydown-ESC', cancel);
  timers.push(scene.time.delayedCall(140, () => scene.input.once('pointerdown', cancel)));

  // El último tween añadido es el flash, no la secuencia completa de 1500 ms.
  // La terminación normal se agenda explícitamente al final del beat; cancelar
  // u omitir sigue usando el mismo cleanup de inmediato.
  timers.push(scene.time.delayedCall(1600, restoreAndResolve));

  return { done, cancel };
}

function ensureSparkTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('vis-spark')) return;
  const tex = scene.textures.createCanvas('vis-spark', 24, 24)!;
  const ctx = tex.context;
  const g = ctx.createRadialGradient(12, 12, 1, 12, 12, 12);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,235,180,0.7)');
  g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 24, 24);
  tex.refresh();
}
