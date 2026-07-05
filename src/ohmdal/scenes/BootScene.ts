// Carga de assets del slice y creación de animaciones del héroe.
import Phaser from 'phaser';

const gen = (name: string) => new URL(`../../../assets/ohmdal/generated/${name}.png`, import.meta.url).href;

export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload(): void {
    // tileset: como imagen (para dibujar por frame) y como spritesheet
    this.load.spritesheet('tiles16', gen('tiles16'), { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('hero', gen('hero'), { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('npc_edda', gen('npc_edda'), { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('npc_lumen', gen('npc_lumen'), { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('npc_ohm', gen('npc_ohm'), { frameWidth: 16, frameHeight: 16 });
    for (const k of [
      'node', 'lamp', 'switch_on', 'switch_off', 'path_straight', 'path_corner', 'path_cross',
      'path_tee', 'door', 'portal', 'marker', 'spark', 'glow', 'journal_icon', 'sign',
      'crystal_conductor', 'crystal_insulator',
    ]) this.load.image(k, gen(k));
  }

  create(): void {
    const dirs: [string, number][] = [['down', 0], ['left', 1], ['right', 2], ['up', 3]];
    for (const [name, row] of dirs) {
      const base = row * 4;
      this.anims.create({
        key: `hero-walk-${name}`,
        frames: this.anims.generateFrameNumbers('hero', { frames: [base, base + 1, base + 2, base + 3] }),
        frameRate: 8, repeat: -1,
      });
      this.anims.create({ key: `hero-idle-${name}`, frames: [{ key: 'hero', frame: base }], frameRate: 1 });
    }
    this.scene.start('world');
  }
}
