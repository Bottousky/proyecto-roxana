import * as pc from 'playcanvas';

export interface VfxTuningParameters {
  conductorPulse: {
    duration: number;
    speed: number;
    width: number;
    color: [number, number, number];
    mobileScale: number;
  };
  terminalArcBurst: {
    duration: number;
    particleCount: number;
    spread: number;
    color: [number, number, number];
    maxIntensity: number;
  };
  contactSnap: {
    duration: number;
    sparkCount: number;
    snapDistance: number;
    color: [number, number, number];
  };
  heatRamp: {
    heatUpRate: number;
    coolDownRate: number;
    maxEmission: [number, number, number];
    filamentIntensity: number;
  };
  waterMist: {
    particleCount: number;
    lifetime: number;
    riseSpeed: number;
    spread: number;
    mobileCount: number;
  };
  dustWake: {
    duration: number;
    particleCount: number;
    expandSpeed: number;
    fadeSpeed: number;
  };
  generatorSpinUp: {
    spinUpRate: number;
    spinDownRate: number;
    maxRpm: number;
    excitationThreshold: number;
  };
  protectionTrip: {
    tripDuration: number;
    flashDuration: number;
    pinDropY: number;
    arcCount: number;
  };
}

export const OHMDAL_VFX_TUNING: VfxTuningParameters = {
  conductorPulse: {
    duration: 0.85,
    speed: 12.0,
    width: 0.18,
    color: [0.3, 0.75, 1.0],
    mobileScale: 0.65,
  },
  terminalArcBurst: {
    duration: 0.28,
    particleCount: 6,
    spread: 0.14,
    color: [0.45, 0.85, 1.0],
    maxIntensity: 3.2,
  },
  contactSnap: {
    duration: 0.22,
    sparkCount: 4,
    snapDistance: 0.09,
    color: [1.0, 0.88, 0.45],
  },
  heatRamp: {
    heatUpRate: 0.8,
    coolDownRate: 0.5,
    maxEmission: [1.0, 0.38, 0.08],
    filamentIntensity: 2.8,
  },
  waterMist: {
    particleCount: 14,
    lifetime: 1.4,
    riseSpeed: 0.65,
    spread: 0.8,
    mobileCount: 6,
  },
  dustWake: {
    duration: 0.65,
    particleCount: 5,
    expandSpeed: 0.42,
    fadeSpeed: 1.6,
  },
  generatorSpinUp: {
    spinUpRate: 45.0,
    spinDownRate: 25.0,
    maxRpm: 150.0,
    excitationThreshold: 0.7,
  },
  protectionTrip: {
    tripDuration: 0.4,
    flashDuration: 0.18,
    pinDropY: -0.22,
    arcCount: 5,
  },
};

export interface OhmdalVfxDependencies {
  app?: pc.Application;
  vfxRoot: pc.Entity;
  reducedMotion: () => boolean;
  paused: () => boolean;
  isMobile?: () => boolean;
}

interface ActivePulse {
  entity: pc.Entity;
  start: pc.Vec3;
  end: pc.Vec3;
  duration: number;
  elapsed: number;
}

interface ActiveArcBurst {
  particles: pc.Entity[];
  light: pc.Entity | null;
  duration: number;
  elapsed: number;
}

interface ActiveDustPuff {
  particles: pc.Entity[];
  duration: number;
  elapsed: number;
}

interface ActiveMistEmitter {
  zone: string;
  position: pc.Vec3;
  particles: { entity: pc.Entity; offset: pc.Vec3; seed: number; lifetime: number; age: number }[];
  active: boolean;
}

export class OhmdalVfxSystem {
  private root: pc.Entity;
  private reducedMotion: () => boolean;
  private paused: () => boolean;
  private isMobile: () => boolean;

  private pulses: ActivePulse[] = [];
  private arcBursts: ActiveArcBurst[] = [];
  private dustPuffs: ActiveDustPuff[] = [];
  private mistEmitters: Map<string, ActiveMistEmitter> = new Map();

  // Materials
  private pulseMaterial: pc.StandardMaterial;
  private arcMaterial: pc.StandardMaterial;
  private mistMaterial: pc.StandardMaterial;
  private dustMaterial: pc.StandardMaterial;

  constructor({ vfxRoot, reducedMotion, paused, isMobile }: OhmdalVfxDependencies) {
    this.root = vfxRoot;
    this.reducedMotion = reducedMotion;
    this.paused = paused;
    this.isMobile = isMobile ?? (() => false);

    // Create shared PBR/emissive materials for VFX layers
    this.pulseMaterial = new pc.StandardMaterial();
    this.pulseMaterial.name = 'vfx-conductor-pulse-mat';
    this.pulseMaterial.diffuse = new pc.Color(0.2, 0.6, 1.0);
    this.pulseMaterial.emissive = new pc.Color(0.3, 0.75, 1.0);
    this.pulseMaterial.emissiveIntensity = 2.4;
    this.pulseMaterial.blendType = pc.BLEND_ADDITIVE;
    this.pulseMaterial.cull = pc.CULLFACE_NONE;
    this.pulseMaterial.update();

    this.arcMaterial = new pc.StandardMaterial();
    this.arcMaterial.name = 'vfx-terminal-arc-mat';
    this.arcMaterial.diffuse = new pc.Color(0.4, 0.8, 1.0);
    this.arcMaterial.emissive = new pc.Color(0.5, 0.9, 1.0);
    this.arcMaterial.emissiveIntensity = 3.5;
    this.arcMaterial.blendType = pc.BLEND_ADDITIVE;
    this.arcMaterial.cull = pc.CULLFACE_NONE;
    this.arcMaterial.update();

    this.mistMaterial = new pc.StandardMaterial();
    this.mistMaterial.name = 'vfx-water-mist-mat';
    this.mistMaterial.diffuse = new pc.Color(0.7, 0.82, 0.92);
    this.mistMaterial.opacity = 0.28;
    this.mistMaterial.blendType = pc.BLEND_NORMAL;
    this.mistMaterial.cull = pc.CULLFACE_NONE;
    this.mistMaterial.update();

    this.dustMaterial = new pc.StandardMaterial();
    this.dustMaterial.name = 'vfx-dust-wake-mat';
    this.dustMaterial.diffuse = new pc.Color(0.65, 0.6, 0.52);
    this.dustMaterial.opacity = 0.35;
    this.dustMaterial.blendType = pc.BLEND_NORMAL;
    this.dustMaterial.cull = pc.CULLFACE_NONE;
    this.dustMaterial.update();
  }

  public triggerConductorPulse(start: [number, number, number], end: [number, number, number], duration = OHMDAL_VFX_TUNING.conductorPulse.duration): void {
    if (this.reducedMotion()) return;
    const startVec = new pc.Vec3(...start);
    const endVec = new pc.Vec3(...end);
    const pulseEntity = new pc.Entity('ConductorPulseNode');
    pulseEntity.addComponent('render', {
      type: 'sphere',
      material: this.pulseMaterial,
      castShadows: false,
    });
    const scale = this.isMobile() ? OHMDAL_VFX_TUNING.conductorPulse.mobileScale : 1.0;
    const width = OHMDAL_VFX_TUNING.conductorPulse.width * scale;
    pulseEntity.setLocalScale(width, width, width);
    pulseEntity.setPosition(startVec);
    this.root.addChild(pulseEntity);

    this.pulses.push({
      entity: pulseEntity,
      start: startVec,
      end: endVec,
      duration,
      elapsed: 0,
    });
  }

  public triggerTerminalArc(pos: [number, number, number], intensityMultiplier = 1.0): void {
    if (this.reducedMotion()) return;
    const count = Math.min(OHMDAL_VFX_TUNING.terminalArcBurst.particleCount, this.isMobile() ? 3 : 6);
    const particles: pc.Entity[] = [];
    const origin = new pc.Vec3(...pos);

    for (let i = 0; i < count; i += 1) {
      const p = new pc.Entity(`TerminalArcSpark_${i}`);
      p.addComponent('render', {
        type: 'box',
        material: this.arcMaterial,
        castShadows: false,
      });
      p.setLocalScale(0.04, 0.04, 0.04);
      p.setPosition(origin);
      this.root.addChild(p);
      particles.push(p);
    }

    let light: pc.Entity | null = null;
    if (!this.isMobile()) {
      light = new pc.Entity('TerminalArcLight');
      light.addComponent('light', {
        type: 'point',
        color: new pc.Color(0.4, 0.85, 1.0),
        range: 1.8,
        intensity: OHMDAL_VFX_TUNING.terminalArcBurst.maxIntensity * intensityMultiplier,
        castShadows: false,
      });
      light.setPosition(origin);
      this.root.addChild(light);
    }

    this.arcBursts.push({
      particles,
      light,
      duration: OHMDAL_VFX_TUNING.terminalArcBurst.duration,
      elapsed: 0,
    });
  }

  public triggerContactSnap(pos: [number, number, number]): void {
    this.triggerTerminalArc(pos, 0.7);
    this.triggerDustWake(pos, 0.4);
  }

  public triggerDustWake(pos: [number, number, number], scale = 1.0): void {
    if (this.reducedMotion()) return;
    const count = Math.min(OHMDAL_VFX_TUNING.dustWake.particleCount, this.isMobile() ? 2 : 4);
    const particles: pc.Entity[] = [];
    const origin = new pc.Vec3(...pos);

    for (let i = 0; i < count; i += 1) {
      const p = new pc.Entity(`DustPuff_${i}`);
      p.addComponent('render', {
        type: 'sphere',
        material: this.dustMaterial,
        castShadows: false,
      });
      const s = (0.12 + Math.random() * 0.1) * scale;
      p.setLocalScale(s, s, s);
      p.setPosition(origin.x + (Math.random() - 0.5) * 0.2, origin.y + Math.random() * 0.1, origin.z + (Math.random() - 0.5) * 0.2);
      this.root.addChild(p);
      particles.push(p);
    }

    this.dustPuffs.push({
      particles,
      duration: OHMDAL_VFX_TUNING.dustWake.duration,
      elapsed: 0,
    });
  }

  public setWaterMist(zone: string, active: boolean, position: [number, number, number]): void {
    let emitter = this.mistEmitters.get(zone);
    if (!emitter) {
      const posVec = new pc.Vec3(...position);
      const count = this.isMobile() ? OHMDAL_VFX_TUNING.waterMist.mobileCount : OHMDAL_VFX_TUNING.waterMist.particleCount;
      const particles = [];
      for (let i = 0; i < count; i += 1) {
        const p = new pc.Entity(`MistQuad_${zone}_${i}`);
        p.addComponent('render', {
          type: 'sphere',
          material: this.mistMaterial,
          castShadows: false,
        });
        p.setLocalScale(0.35, 0.35, 0.35);
        p.setPosition(posVec);
        p.enabled = false;
        this.root.addChild(p);
        particles.push({
          entity: p,
          offset: new pc.Vec3((Math.random() - 0.5) * 1.2, Math.random() * 0.5, (Math.random() - 0.5) * 1.2),
          seed: Math.random(),
          lifetime: OHMDAL_VFX_TUNING.waterMist.lifetime * (0.7 + Math.random() * 0.6),
          age: Math.random() * OHMDAL_VFX_TUNING.waterMist.lifetime,
        });
      }
      emitter = { zone, position: posVec, particles, active: false };
      this.mistEmitters.set(zone, emitter);
    }

    emitter.active = active;
    for (const p of emitter.particles) {
      p.entity.enabled = active && !this.reducedMotion();
    }
  }

  public update(dt: number): void {
    if (this.paused()) return;
    const safeDt = Math.min(0.1, Math.max(0, dt));

    // 1. Update Conductor Pulses
    for (let i = this.pulses.length - 1; i >= 0; i -= 1) {
      const pulse = this.pulses[i]!;
      pulse.elapsed += safeDt;
      const progress = Math.min(1.0, pulse.elapsed / pulse.duration);
      const eased = progress * (2 - progress);
      const currentPos = new pc.Vec3().lerp(pulse.start, pulse.end, eased);
      pulse.entity.setPosition(currentPos);
      if (progress >= 1.0) {
        pulse.entity.destroy();
        this.pulses.splice(i, 1);
      }
    }

    // 2. Update Arc Bursts
    for (let i = this.arcBursts.length - 1; i >= 0; i -= 1) {
      const burst = this.arcBursts[i]!;
      burst.elapsed += safeDt;
      const progress = Math.min(1.0, burst.elapsed / burst.duration);
      const spread = OHMDAL_VFX_TUNING.terminalArcBurst.spread * (1 - progress);

      for (let j = 0; j < burst.particles.length; j += 1) {
        const p = burst.particles[j]!;
        p.translate((Math.random() - 0.5) * spread, (Math.random() * 0.5) * spread, (Math.random() - 0.5) * spread);
        const s = Math.max(0.005, 0.04 * (1 - progress));
        p.setLocalScale(s, s, s);
      }

      if (burst.light?.light) {
        burst.light.light.intensity = OHMDAL_VFX_TUNING.terminalArcBurst.maxIntensity * (1 - progress);
      }

      if (progress >= 1.0) {
        for (const p of burst.particles) p.destroy();
        burst.light?.destroy();
        this.arcBursts.splice(i, 1);
      }
    }

    // 3. Update Dust Puffs
    for (let i = this.dustPuffs.length - 1; i >= 0; i -= 1) {
      const puff = this.dustPuffs[i]!;
      puff.elapsed += safeDt;
      const progress = Math.min(1.0, puff.elapsed / puff.duration);
      const scaleInc = (1 + progress * 0.8);

      for (let j = 0; j < puff.particles.length; j += 1) {
        const p = puff.particles[j]!;
        p.translate(0, safeDt * 0.15, 0);
        p.setLocalScale(0.15 * scaleInc * (1 - progress * 0.5), 0.15 * scaleInc * (1 - progress * 0.5), 0.15 * scaleInc * (1 - progress * 0.5));
      }

      if (progress >= 1.0) {
        for (const p of puff.particles) p.destroy();
        this.dustPuffs.splice(i, 1);
      }
    }

    // 4. Update Water Mist Emitters
    if (!this.reducedMotion()) {
      for (const emitter of this.mistEmitters.values()) {
        if (!emitter.active) continue;
        for (const p of emitter.particles) {
          p.age += safeDt;
          if (p.age >= p.lifetime) p.age = 0;
          const lifeProgress = p.age / p.lifetime;
          const currentY = emitter.position.y + p.offset.y + lifeProgress * OHMDAL_VFX_TUNING.waterMist.riseSpeed;
          p.entity.setPosition(emitter.position.x + p.offset.x * (1 + lifeProgress * 0.4), currentY, emitter.position.z + p.offset.z * (1 + lifeProgress * 0.4));
          const mistScale = 0.28 + lifeProgress * 0.32;
          p.entity.setLocalScale(mistScale, mistScale, mistScale);
        }
      }
    }
  }

  public dispose(): void {
    for (const pulse of this.pulses) pulse.entity.destroy();
    this.pulses = [];

    for (const burst of this.arcBursts) {
      for (const p of burst.particles) p.destroy();
      burst.light?.destroy();
    }
    this.arcBursts = [];

    for (const puff of this.dustPuffs) {
      for (const p of puff.particles) p.destroy();
    }
    this.dustPuffs = [];

    for (const emitter of this.mistEmitters.values()) {
      for (const p of emitter.particles) p.entity.destroy();
    }
    this.mistEmitters.clear();
  }
}
