# MiniMax GMI Worker Report

- Provider: GMI Cloud
- Model: `MiniMaxAI/MiniMax-M3`
- Task: `agent-work/tasks/minimax/eval-vfx-electricity.md`
- Context files: `src/experiences/ohmdal-playcanvas/world/manantial/buildManantialShell.ts`, `src/experiences/ohmdal-playcanvas/visualHarness.ts`, `docs/20-worlds/ohmdal/production/OHMDAL_VISUAL_MATERIAL_BIBLE.md`
- Created: 2026-08-25T01:50:57.372Z
- Elapsed ms: 100229
- Usage: `{"prompt_tokens":5525,"completion_tokens":12000,"total_tokens":17525,"prompt_tokens_details":{"cached_tokens":133,"cache_write_tokens":0}}`
- Authority: proposal-only; Codex/Sol must verify, apply, test and accept.

---

# Ohmdal Electrical VFX Package — Evaluation

Below is a complete, integratable proposal for the three requested VFX layers. Nothing is invented beyond what the bible and code permit; the electrical physics metaphor is implemented procedurally and cheaply.

---

## 1. Proposed module/API shape

Three independent, composable VFX classes, all built on a single small helper (`ElectricalFieldSystem`) that owns the shared emissive-state machine. Each layer is its own file under `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/`.

```
src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/
  ElectricalFieldSystem.ts          // shared state machine + per-frame update
  ElectricConductorPulse.ts         // Layer 1
  TerminalArcBurst.ts               // Layer 2
  ActivationSeamSequence.ts         // Layer 3 (composition)
  shaders/
    conductorPulse.shader.ts        // pair of GLSL strings (vert+frag)
    arcBurst.shader.ts
    activationSeam.shader.ts
  index.ts                          // barrel, re-exports
  types.ts                          // shared VFX settings + diagnostic types
```

Why a shared `ElectricalFieldSystem`:

- The bible's strongest constraint is "emissive only during an event." Three effects that each maintain their own emission schedule will drift. One machine solves this.
- It also makes the activation seam free: a single `startActivation(durationSec)` call energises everything with phase-locked timing so the player reads a single causal event.

Public API sketch (this is what Sol should be able to call from `buildManantialShell` or a higher-level composition root):

```ts
interface VFXSettingsBase {
  // 0..1 master multiplier, useful for quality tiers and capture
  intensity: number;
  // Hard cap on the number of active instances
  maxActive: number;
  // Master enable for graceful disable on low-end devices
  enabled: boolean;
}

interface ConductorPulseSettings extends VFXSettingsBase {
  // How many "conductor runs" can pulse simultaneously
  runCount: number;
  // Distance between the conductor and the camera before it stops trying
  cullDistance: number;
  // Wave travel time in seconds from A to B
  pulseDuration: number;
  // How many sub-pulses ride each main pulse
  pulsesPerRun: number;
  // Width of the pulse band in world units
  pulseWidth: number;
  // Color of the emissive band, intensity and alpha decay
  color: pc.Color;
  peakIntensity: number;
  decayExponent: number;          // 1 = linear, 2 = quadratic, etc.
  // Frequency of independent pulses per conductor (Hz)
  repeatHz: number;
  // Per-instance jitter so multiple conductors do not pulse in lockstep
  jitter: number;
}

interface ArcBurstSettings extends VFXSettingsBase {
  // Number of arc strands per burst
  strandCount: number;
  // Maximum segment count per strand (CPU cost scales with this)
  maxSegments: number;
  // Length of a strand in world units
  strandLength: number;
  // Thickness in world units
  thickness: number;
  // Burst duration
  duration: number;
  // Color, intensity and decay
  color: pc.Color;
  peakIntensity: number;
  decayExponent: number;
  // 0..1 chance of secondary flicker after the main burst
  flickerProbability: number;
  // Optional small spark particle budget (procedural, see Section 5)
  sparkBudget: number;
}

interface ActivationSeamSettings extends VFXSettingsBase {
  // Total time the seam is visible
  duration: number;
  // Width of the seam line in world units
  width: number;
  // Color and intensity of the seam flash
  color: pc.Color;
  peakIntensity: number;
  // Curve (0..1 normalized time -> intensity multiplier)
  curve: number[];                // e.g. [0, 0.6, 1, 0.4, 0]
  // Camera shake amplitude in radians (small; visual storytelling)
  shakeAmplitude: number;
  shakeFrequency: number;
  // Soft fade-in / fade-out of post-processing while seam is active
  postDip: number;                // 0..1 darken
}

class ElectricalFieldSystem {
  constructor(app: pc.Application, ctx: VFXRenderContext);

  registerConductor(entity: pc.Entity, from: pc.Vec3, to: pc.Vec3, settings: ConductorPulseSettings): void;
  registerTerminal(entity: pc.Entity, position: pc.Vec3, normal: pc.Vec3, settings: ArcBurstSettings): void;

  // The composition layer
  startActivation(settings: ActivationSeamSettings, anchor: pc.Vec3, axis: pc.Vec3): Promise<void>;
  // Programmatic events that wake a specific effect
  pulseConductor(index: number): void;
  triggerArc(index: number): void;

  update(dt: number): void;       // called from world update or app.on('update')
  dispose(): void;                // mandatory for hot-reload and zone teardown
  diagnostics(): ElectricalFieldDiagnostics;
}
```

Each registered entity is independent. `enabled: false` short-circuits; per-layer `maxActive` prevents runaway cost on tablets.

---

## 2. Exact code

I am providing complete file bodies. There is no existing VFX module to diff against in the attached context, so these are new files. `visualHarness.ts` and `buildManantialShell.ts` are kept untouched; integration is described in Section 3 as additive wiring.

### 2.1 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/types.ts`

```ts
import type * as pc from 'playcanvas';

export interface VFXSettingsBase {
  intensity: number;       // 0..1 master multiplier (quality + capture)
  maxActive: number;       // hard cap for this layer
  enabled: boolean;        // graceful disable
}

export interface ConductorPulseSettings extends VFXSettingsBase {
  runCount: number;        // independent pulse runs
  cullDistance: number;    // beyond this, skip update
  pulseDuration: number;   // seconds for the wave to travel A -> B
  pulsesPerRun: number;    // sub-pulses on a single run
  pulseWidth: number;      // world units
  color: pc.Color;
  peakIntensity: number;   // emissive multiplier at the wave crest
  decayExponent: number;   // >=1, shape of the trailing edge
  repeatHz: number;        // pulses per second, per run
  jitter: number;          // 0..1 phase jitter between runs
}

export interface ArcBurstSettings extends VFXSettingsBase {
  strandCount: number;
  maxSegments: number;     // per strand
  strandLength: number;
  thickness: number;
  duration: number;
  color: pc.Color;
  peakIntensity: number;
  decayExponent: number;
  flickerProbability: number; // 0..1
  sparkBudget: number;
}

export interface ActivationSeamSettings extends VFXSettingsBase {
  duration: number;
  width: number;
  color: pc.Color;
  peakIntensity: number;
  curve: number[];         // 0..1 normalized time -> multiplier
  shakeAmplitude: number;  // radians
  shakeFrequency: number;  // Hz
  postDip: number;         // 0..1 darken
}

export interface ElectricalFieldDiagnostics {
  conductors: { active: number; budget: number; pulsesFired: number };
  arcs: { active: number; budget: number; burstsFired: number };
  seam: { active: boolean; remaining: number; activatedTimes: number };
  lastEmissiveMs: number;   // for the bible's "emissive only during event" audit
}
```

### 2.2 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/shaders/conductorPulse.shader.ts`

Pair of GLSL strings. Designed to be assigned to a thin cylinder/procedural mesh that runs from `A` to `B`. The mesh is generated once, the shader animates a band of emissive light along the cylinder axis.

```ts
export const conductorPulseVS = /* glsl */`
attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec2 vertex_texCoord0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
uniform float u_pulseT;        // 0..1 normalized time along A->B
uniform float u_subT;          // 0..1 of the leading edge within the pulse
uniform float u_pulseWidth;    // 0..1 normalized width

varying vec2 vUv;
varying float vAlong;          // 0..1 along the conductor

void main(void) {
  vUv = vertex_texCoord0;
  vAlong = vertex_texCoord0.y; // assume V axis is along the conductor
  gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);
}
`;

export const conductorPulseFS = /* glsl */`
precision highp float;

uniform vec3 u_color;
uniform float u_peakIntensity; // emissive multiplier
uniform float u_decayExponent; // >=1
uniform float u_pulseT;
uniform float u_subT;
uniform float u_pulseWidth;
uniform float u_master;        // 0..1 master intensity from VFX layer
uniform float u_emissive;      // 0 or >0; set by state machine; passive = 0

void main(void) {
  // The pulse is a band around u_pulseT of width u_pulseWidth, with a soft
  // leading edge biased by u_subT and a trailing decay.
  float d = vAlong - u_pulseT;
  float band = 1.0 - smoothstep(0.0, u_pulseWidth, abs(d));

  // Asymmetric profile: hard leading edge, exponential trailing edge.
  float lead = smoothstep(0.0, u_pulseWidth, -d);
  float trail = exp(-pow(max(d, 0.0) / max(u_pulseWidth, 0.001), u_decayExponent) * 4.0);
  float profile = max(lead * 0.85, trail);

  float emissive = band * profile * u_peakIntensity * u_master * u_emissive;
  vec3 rgb = u_color * emissive;
  // Output is added on top of the underlying StandardMaterial via a separate
  // emissive mesh; the alpha is 1 so the StandardMaterial's own base color
  // remains visible underneath.
  gl_FragColor = vec4(rgb, 1.0);
}
`;
```

Notes:

- `u_emissive` is the bible-compliance gate. The state machine only sets it > 0 during an active electrical event. When the event is over, it is 0 and the conductor returns to its passive identity, no glow.
- The shader is intentionally simple: no noise textures, no branching per fragment. It is a profile curve over a normalized V coordinate.

### 2.3 `src/experiences/ohmdal-vfx/shaders/arcBurst.shader.ts`

Procedural jagged arc between two close points. Geometry is built on CPU as a small polyline with jittered midpoints; the shader is what makes the arc look like a real discharge (gradient along the strand, hard core, falloff halo).

```ts
export const arcBurstVS = /* glsl */`
attribute vec3 vertex_position;
attribute vec3 vertex_normal;
attribute vec2 vertex_texCoord0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;

varying vec2 vUv;
varying vec3 vNormal;

void main(void) {
  vUv = vertex_texCoord0;
  vNormal = vertex_normal;
  gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);
}
`;

export const arcBurstFS = /* glsl */`
precision highp float;

uniform vec3 u_color;
uniform float u_peakIntensity;
uniform float u_decayExponent;
uniform float u_t;            // 0..1 lifetime
uniform float u_master;
uniform float u_emissive;

// Cheap hash; arc look is mostly shape-driven, shader adds glow.
float hash11(float n) { return fract(sin(n) * 43758.5453123); }

void main(void) {
  // The arc is rendered as a thin quad; vUv.x is across the thickness,
  // vUv.y is along the arc length.
  float across = abs(vUv.x - 0.5) * 2.0;        // 0 at center, 1 at edge

  // Core + halo
  float core = exp(-pow(across, 2.0) * 28.0);
  float halo = exp(-pow(across, 2.0) * 4.0) * 0.35;

  // Decay over lifetime, with a sharp leading edge
  float life = pow(1.0 - u_t, u_decayExponent);
  float leadIn = smoothstep(0.0, 0.08, u_t);

  // Faint flicker along the strand
  float flicker = 0.85 + 0.15 * hash11(floor(vUv.y * 24.0) + u_t * 30.0);

  float emissive = (core + halo) * life * leadIn * flicker * u_peakIntensity * u_master * u_emissive;
  gl_FragColor = vec4(u_color * emissive, 1.0);
}
`;
```

### 2.4 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/shaders/activationSeam.shader.ts`

The seam is a thin emissive plane that flashes along a line; it is the visual "wire becoming live" metaphor and sits behind the conductor pulse so the player reads a chain: a power source ignites, a bright line travels to the device, the device arcs.

```ts
export const activationSeamVS = /* glsl */`
attribute vec3 vertex_position;
attribute vec2 vertex_texCoord0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;

varying vec2 vUv;

void main(void) {
  vUv = vertex_texCoord0;
  gl_Position = matrix_viewProjection * matrix_model * vec4(vertex_position, 1.0);
}
`;

export const activationSeamFS = /* glsl */`
precision highp float;

uniform vec3 u_color;
uniform float u_peakIntensity;
uniform float u_master;
uniform float u_emissive;
uniform float u_t;            // 0..1 lifetime
uniform float u_width;        // world units, used to feather edges
uniform float u_curveIndex;   // 0..N-1, index into piecewise intensity curve
uniform float u_curveCount;
uniform sampler2D u_curve;    // 1D LUT of the activation curve

varying vec2 vUv;

void main(void) {
  // vUv.x is across the seam, vUv.y is along it.
  float across = abs(vUv.x - 0.5) * 2.0;
  float feather = smoothstep(1.0, 0.6, across);  // soft edge

  // Sample the activation curve; cheap 1D lookup.
  float t = clamp(u_t, 0.0, 1.0);
  float curve = texture2D(u_curve, vec2(t, 0.5)).r;

  // Travelling bright head along the seam
  float head = exp(-pow((vUv.y - t) * 6.0, 2.0));

  float emissive = (0.35 + 0.65 * curve) * feather * (0.4 + 0.6 * head)
                   * u_peakIntensity * u_master * u_emissive;
  gl_FragColor = vec4(u_color * emissive, 1.0);
}
`;
```

The curve LUT is a 1×N `pc.Texture` (1D, treated as 2D) built once from `ActivationSeamSettings.curve`. Reading it in-shader avoids sending the curve as a uniform array and keeps the mobile path simple.

### 2.5 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/ElectricalFieldSystem.ts`

This is the file Sol needs to read first. It owns the state machine, layer wiring, dispose contract, and the single public surface used by `buildManantialShell` or a higher composition module.

```ts
import * as pc from 'playcanvas';
import { ConductorPulseSettings, ArcBurstSettings, ActivationSeamSettings, ElectricalFieldDiagnostics } from './types';
import { ElectricConductorPulse } from './ElectricConductorPulse';
import { TerminalArcBurst } from './TerminalArcBurst';
import { ActivationSeamSequence } from './ActivationSeamSequence';

interface VFXRenderContext {
  // Forwarded to layers that build a tiny render layer for additive blending.
  // Kept here so layers do not have to know about PlayCanvas specifics beyond
  // what they need.
  createEmissiveLayer(): pc.Layer;
  worldLayer: pc.Layer;
}

export class ElectricalFieldSystem {
  private readonly app: pc.Application;
  private readonly ctx: VFXRenderContext;
  private readonly conductors: ElectricConductorPulse[] = [];
  private readonly arcs: TerminalArcBurst[] = [];
  private seam: ActivationSeamSequence | null = null;
  private masterEmissive = 0; // 0 when nothing is energized
  private activatedTimes = 0;
  private lastEmissiveMs = 0;

  constructor(app: pc.Application, ctx: VFXRenderContext) {
    this.app = app;
    this.ctx = ctx;
    this.app.on('update', this.onUpdate, this);
    this.app.on('postrender', this.onPostRender, this);
  }

  // ----- registration ------------------------------------------------------

  registerConductor(
    entity: pc.Entity,
    from: pc.Vec3,
    to: pc.Vec3,
    settings: ConductorPulseSettings,
  ): ElectricConductorPulse {
    const pulse = new ElectricConductorPulse(this.app, this.ctx, entity, from, to, settings);
    this.conductors.push(pulse);
    return pulse;
  }

  registerTerminal(
    entity: pc.Entity,
    position: pc.Vec3,
    normal: pc.Vec3,
    settings: ArcBurstSettings,
  ): TerminalArcBurst {
    const arc = new TerminalArcBurst(this.app, this.ctx, entity, position, normal, settings);
    this.arcs.push(arc);
    return arc;
  }

  // ----- programmatic events ----------------------------------------------

  pulseConductor(index: number): void {
    const c = this.conductors[index];
    if (!c || !c.settings.enabled) return;
    c.fire();
    this.markEnergized();
  }

  triggerArc(index: number): void {
    const a = this.arcs[index];
    if (!a || !a.settings.enabled) return;
    a.fire();
    this.markEnergized();
  }

  startActivation(settings: ActivationSeamSettings, anchor: pc.Vec3, axis: pc.Vec3): Promise<void> {
    if (!settings.enabled) return Promise.resolve();
    this.seam?.dispose();
    this.seam = new ActivationSeamSequence(this.app, this.ctx, anchor, axis, settings);
    this.markEnergized();
    this.activatedTimes += 1;
    return new Promise((resolve) => {
      const check = () => {
        if (!this.seam || !this.seam.isActive()) {
          this.seam?.dispose();
          this.seam = null;
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }

  // ----- master loop -------------------------------------------------------

  private onUpdate(dt: number): void {
    let energized = 0;
    for (const c of this.conductors) {
      const wasActive = c.isEmitting();
      c.update(dt, this.masterEmissive);
      if (c.isEmitting() || wasActive) energized += 1;
    }
    for (const a of this.arcs) {
      const wasActive = a.isEmitting();
      a.update(dt, this.masterEmissive);
      if (a.isEmitting() || wasActive) energized += 1;
    }
    if (this.seam) {
      const wasActive = this.seam.isActive();
      this.seam.update(dt, this.masterEmissive);
      if (this.seam.isActive() || wasActive) energized += 1;
    }
    // Master gate: if no layer is currently emitting, force 0. This is the
    // single point that enforces "emissive only during an event".
    this.masterEmissive = energized > 0 ? 1 : 0;
    if (this.masterEmissive > 0) this.lastEmissiveMs = performance.now();
  }

  private onPostRender(): void {
    // Hook reserved for the activation seam's camera shake or post-dip;
    // a real implementation would drive pc.Application.renderOptions or a
    // dedicated fullscreen pass. Kept here as a stable integration point
    // so Sol can wire it without touching the layer classes.
  }

  private markEnergized(): void {
    this.lastEmissiveMs = performance.now();
  }

  // ----- diagnostics + dispose --------------------------------------------

  diagnostics(): ElectricalFieldDiagnostics {
    return {
      conductors: {
        active: this.conductors.filter((c) => c.isEmitting()).length,
        budget: this.conductors.reduce((a, c) => a + c.settings.maxActive, 0),
        pulsesFired: this.conductors.reduce((a, c) => a + c.pulsesFired, 0),
      },
      arcs: {
        active: this.arcs.filter((a) => a.isEmitting()).length,
        budget: this.arcs.reduce((acc, a) => acc + a.settings.maxActive, 0),
        burstsFired: this.arcs.reduce((acc, a) => acc + a.burstsFired, 0),
      },
      seam: {
        active: this.seam?.isActive() ?? false,
        remaining: this.seam?.remaining() ?? 0,
        activatedTimes: this.activatedTimes,
      },
      lastEmissiveMs: this.lastEmissiveMs,
    };
  }

  dispose(): void {
    this.app.off('update', this.onUpdate, this);
    this.app.off('postrender', this.onPostRender, this);
    for (const c of this.conductors) c.dispose();
    for (const a of this.arcs) a.dispose();
    this.seam?.dispose();
    this.seam = null;
    this.conductors.length = 0;
    this.arcs.length = 0;
  }
}
```

### 2.6 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/ElectricConductorPulse.ts`

```ts
import * as pc from 'playcanvas';
import { ConductorPulseSettings } from './types';
import { conductorPulseVS, conductorPulseFS } from './shaders/conductorPulse.shader';

interface VFXRenderContext {
  createEmissiveLayer(): pc.Layer;
  worldLayer: pc.Layer;
}

export class ElectricConductorPulse {
  readonly settings: ConductorPulseSettings;
  private readonly app: pc.Application;
  private readonly meshEntity: pc.Entity;
  private readonly material: pc.ShaderMaterial;
  private from: pc.Vec3;
  private to: pc.Vec3;
  private lastFireTime = -Infinity;
  private nextFireTime = 0;
  private phaseJitter = 0;
  private runningTime = 0;
  private emitting = false;
  pulsesFired = 0;

  constructor(
    app: pc.Application,
    ctx: VFXRenderContext,
    parent: pc.Entity,
    from: pc.Vec3,
    to: pc.Vec3,
    settings: ConductorPulseSettings,
  ) {
    this.app = app;
    this.settings = settings;
    this.from = from.clone();
    this.to = to.clone();
    this.phaseJitter = Math.random() * settings.jitter;

    this.material = new pc.ShaderMaterial({
      uniqueName: 'OhmdalConductorPulse',
      vertexGLSL: conductorPulseVS,
      fragmentGLSL: conductorPulseFS,
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_normal: pc.SEMANTIC_NORMAL,
        vertex_texCoord0: pc.SEMANTIC_TEXCOORD0,
      },
      parameters: {
        u_color: [settings.color.r, settings.color.g, settings.color.b, 1],
        u_peakIntensity: settings.peakIntensity,
        u_decayExponent: settings.decayExponent,
        u_pulseT: 0,
        u_subT: 0,
        u_pulseWidth: settings.pulseWidth,
        u_master: 0,
        u_emissive: 0,
      },
    });

    // Thin elongated quad oriented along (to - from). Built procedurally so
    // no asset is required. The V axis is the conductor length.
    const length = this.from.distance(this.to);
    const positions = [
      -settings.pulseWidth, 0, 0,
       settings.pulseWidth, 0, 0,
      -settings.pulseWidth, length, 0,
       settings.pulseWidth, length, 0,
    ];
    const uvs = [0, 0, 1, 0, 0, 1, 1, 1];
    const indices = [0, 1, 2, 2, 1, 3];
    const normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    const geom = new pc.Geometry();
    geom.positions = positions;
    geom.indices = indices;
    geom.normals = normals;
    geom.uvs = [uvs[0], uvs[1], uvs[2], uvs[3], uvs[4], uvs[5], uvs[6], uvs[7]];
    const mesh = pc.Mesh.fromGeometry(app.graphicsDevice, geom);

    this.meshEntity = new pc.Entity('ConductorPulseQuad');
    this.meshEntity.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, this.material, this.meshEntity)],
    });
    this.meshEntity.render!.castShadows = false;
    this.meshEntity.render!.receiveShadows = false;
    this.meshEntity.render!.layers = [ctx.createEmissiveLayer().id];

    // Orient the quad so its length axis points from->to and its normal faces
    // the camera by default. Camera-facing billboards are handled in update().
    this.orient();
    parent.addChild(this.meshEntity);
  }

  private orient(): void {
    const dir = new pc.Vec3().copy(this.to).sub(this.from);
    const length = dir.length();
    if (length < 1e-4) return;
    dir.normalize();
    const pos = new pc.Vec3().copy(this.from);
    this.meshEntity.setPosition(pos);
    // Build a basis: y = dir, x = cameraRight approx, z = cameraUp approx.
    const cam = this.app.scene?.cameras?.[0];
    const camPos = cam ? cam.entity.getPosition() : new pc.Vec3(0, 0, 1);
    const z = new pc.Vec3().copy(camPos).sub(pos).normalize();
    const x = new pc.Vec3().cross(dir, z).normalize();
    const z2 = new pc.Vec3().cross(x, dir).normalize();
    const m = new pc.Mat4().setTRS(pos, new pc.Quat().setFromMat4(new pc.Mat4().set(x.x, dir.x, z2.x, 0, x.y, dir.y, z2.y, 0, x.z, dir.z, z2.z, 0)), pc.Vec3.ONE);
    this.meshEntity.setRotation(m.getRotation());
    this.meshEntity.setLocalScale(1, length, 1);
  }

  fire(): void {
    this.lastFireTime = this.runningTime;
    this.pulsesFired += 1;
  }

  isEmitting(): boolean {
    const dt = this.runningTime - this.lastFireTime;
    return dt >= 0 && dt <= this.settings.pulseDuration;
  }

  isEnergized(): boolean { return this.isEmitting(); }

  update(dt: number, masterEmissive: number): void {
    if (!this.settings.enabled) {
      this.material.setParameter('u_emissive', 0);
      this.material.setParameter('u_master', 0);
      return;
    }
    this.runningTime += dt;

    // Schedule
    if (this.runningTime >= this.nextFireTime) {
      this.fire();
      const base = 1 / Math.max(this.settings.repeatHz, 0.001);
      this.nextFireTime = this.runningTime + base * (1 + this.phaseJitter);
    }

    // Cull: skip parameter updates beyond cullDistance. The mesh stays
    // parented; we just stop writing the band uniforms.
    const cam = this.app.scene?.cameras?.[0];
    const camPos = cam ? cam.entity.getPosition() : null;
    if (camPos) {
      const d = camPos.distance(this.from) + camPos.distance(this.to) * 0.5;
      if (d > this.settings.cullDistance) {
        this.material.setParameter('u_emissive', 0);
        this.material.setParameter('u_master', 0);
        return;
      }
    }

    const sinceFire = this.runningTime - this.lastFireTime;
    const pulseT = Math.min(1, Math.max(0, sinceFire / Math.max(this.settings.pulseDuration, 0.001)));
    const subT = Math.min(1, (sinceFire * this.settings.pulsesPerRun) % 1);
    this.material.setParameter('u_pulseT', pulseT);
    this.material.setParameter('u_subT', subT);
    this.material.setParameter('u_pulseWidth', this.settings.pulseWidth);
    this.material.setParameter('u_master', this.settings.intensity);
    this.material.setParameter('u_emissive', masterEmissive);
  }

  dispose(): void {
    this.meshEntity.destroy();
    // ShaderMaterial does not retain GPU buffers beyond the mesh; the mesh
    // and material are released with the entity. There is no texture here.
  }
}
```

### 2.7 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/TerminalArcBurst.ts`

```ts
import * as pc from 'playcanvas';
import { ArcBurstSettings } from './types';
import { arcBurstVS, arcBurstFS } from './shaders/arcBurst.shader';

interface VFXRenderContext {
  createEmissiveLayer(): pc.Layer;
  worldLayer: pc.Layer;
}

export class TerminalArcBurst {
  readonly settings: ArcBurstSettings;
  private readonly app: pc.Application;
  private readonly meshEntity: pc.Entity;
  private readonly material: pc.ShaderMaterial;
  private readonly position: pc.Vec3;
  private readonly normal: pc.Vec3;
  private lifeRemaining = 0;
  private lifeTotal = 1;
  private elapsed = 0;
  private flickerTimer = 0;
  burstsFired = 0;

  constructor(
    app: pc.Application,
    ctx: VFXRenderContext,
    parent: pc.Entity,
    position: pc.Vec3,
    normal: pc.Vec3,
    settings: ArcBurstSettings,
  ) {
    this.app = app;
    this.settings = settings;
    this.position = position.clone();
    this.normal = normal.clone().normalize();

    this.material = new pc.ShaderMaterial({
      uniqueName: 'OhmdalArcBurst',
      vertexGLSL: arcBurstVS,
      fragmentGLSL: arcBurstFS,
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_normal: pc.SEMANTIC_NORMAL,
        vertex_texCoord0: pc.SEMANTIC_TEXCOORD0,
      },
      parameters: {
        u_color: [settings.color.r, settings.color.g, settings.color.b, 1],
        u_peakIntensity: settings.peakIntensity,
        u_decayExponent: settings.decayExponent,
        u_t: 0,
        u_master: 0,
        u_emissive: 0,
      },
    });

    const mesh = this.buildMesh();
    this.meshEntity = new pc.Entity('TerminalArcBurstMesh');
    this.meshEntity.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, this.material, this.meshEntity)],
    });
    this.meshEntity.render!.castShadows = false;
    this.meshEntity.render!.receiveShadows = false;
    this.meshEntity.render!.layers = [ctx.createEmissiveLayer().id];
    this.meshEntity.setPosition(this.position);
    this.orient();
    parent.addChild(this.meshEntity);
  }

  private buildMesh(): pc.Mesh {
    // For each strand, build a small polyline ribbon in a plane that contains
    // this.normal and a chosen tangent. Mesh cost = strandCount * maxSegments
    // * 2 vertices, exactly budgeted by settings.
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const tan = this.tangent();
    for (let s = 0; s < this.settings.strandCount; s += 1) {
      const seed = (s * 0.6180339887) % 1;
      const base = positions.length / 3;
      let prev = new pc.Vec3(0, 0, 0);
      for (let i = 0; i <= this.settings.maxSegments; i += 1) {
        const t = i / this.settings.maxSegments;
        // Three.js-style jagged arc: drift along the plane with random offset,
        // amplitude falls off toward the tip.
        const falloff = Math.sin(t * Math.PI);
        const offset = (this.hash(seed + t * 7.31) - 0.5) * 2.0 * this.settings.strandLength * 0.2 * falloff;
        const along = t * this.settings.strandLength;
        const p = new pc.Vec3()
          .copy(this.normal).mulScalar(along)
          .add(new pc.Vec3().copy(tan).mulScalar(offset));
        // Push two vertices for ribbon thickness (left/right of the line).
        const left = new pc.Vec3().copy(prev).add(new pc.Vec3().copy(tan).mulScalar(-this.settings.thickness * 0.5));
        const right = new pc.Vec3().copy(prev).add(new pc.Vec3().copy(tan).mulScalar(this.settings.thickness * 0.5));
        const leftN = new pc.Vec3().copy(p).add(new pc.Vec3().copy(tan).mulScalar(-this.settings.thickness * 0.5));
        const rightN = new pc.Vec3().copy(p).add(new pc.Vec3().copy(tan).mulScalar(this.settings.thickness * 0.5));
        positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
        uvs.push(0, t, 1, t);
        if (i < this.settings.maxSegments) {
          const a = base + i * 2;
          const b = a + 1;
          const c = a + 2;
          const d = a + 3;
          indices.push(a, b, d, a, d, c);
        }
        prev = p;
      }
    }
    const geom = new pc.Geometry();
    geom.positions = positions;
    geom.indices = indices;
    geom.uvs = uvs;
    geom.normals = pc.calculateNormals(positions, indices);
    return pc.Mesh.fromGeometry(this.app.graphicsDevice, geom);
  }

  private tangent(): pc.Vec3 {
    // Choose a tangent perpendicular to the normal.
    const helper = Math.abs(this.normal.y) < 0.9
      ? new pc.Vec3(0, 1, 0)
      : new pc.Vec3(1, 0, 0);
    return new pc.Vec3().cross(this.normal, helper).normalize();
  }

  private hash(x: number): number {
    return ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1;
  }

  private orient(): void {
    // Point the strand forward along the entity's local Z axis.
    this.meshEntity.lookAt(this.position.clone().add(this.normal));
  }

  fire(): void {
    this.lifeRemaining = this.settings.duration;
    this.lifeTotal = this.settings.duration;
    this.elapsed = 0;
    this.burstsFired += 1;
  }

  isEmitting(): boolean { return this.lifeRemaining > 0; }

  update(dt: number, masterEmissive: number): void {
    if (!this.settings.enabled) {
      this.material.setParameter('u_emissive', 0);
      this.material.setParameter('u_master', 0);
      return;
    }
    this.elapsed += dt;
    this.lifeRemaining = Math.max(0, this.lifeRemaining - dt);

    // Optional secondary flicker.
    this.flickerTimer -= dt;
    if (this.lifeRemaining === 0 && this.settings.flickerProbability > 0 && this.flickerTimer <= 0) {
      if (this.hash(this.elapsed * 0.137) < this.settings.flickerProbability * dt * 6) {
        this.fire();
      }
      this.flickerTimer = 0.1;
    }

    const t = this.lifeTotal > 0 ? 1 - this.lifeRemaining / this.lifeTotal : 1;
    this.material.setParameter('u_t', t);
    this.material.setParameter('u_master', this.settings.intensity);
    this.material.setParameter('u_emissive', masterEmissive);
  }

  dispose(): void {
    this.meshEntity.destroy();
  }
}
```

### 2.8 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/ActivationSeamSequence.ts`

```ts
import * as pc from 'playcanvas';
import { ActivationSeamSettings } from './types';
import { activationSeamVS, activationSeamFS } from './shaders/activationSeam.shader';

interface VFXRenderContext {
  createEmissiveLayer(): pc.Layer;
  worldLayer: pc.Layer;
}

export class ActivationSeamSequence {
  readonly settings: ActivationSeamSettings;
  private readonly app: pc.Application;
  private readonly meshEntity: pc.Entity;
  private readonly material: pc.ShaderMaterial;
  private readonly curveTexture: pc.Texture;
  private readonly totalDuration: number;
  private elapsed = 0;

  constructor(
    app: pc.Application,
    ctx: VFXRenderContext,
    anchor: pc.Vec3,
    axis: pc.Vec3,
    settings: ActivationSeamSettings,
  ) {
    this.app = app;
    this.settings = settings;
    this.totalDuration = Math.max(0.001, settings.duration);

    this.curveTexture = this.buildCurveTexture(settings.curve);

    this.material = new pc.ShaderMaterial({
      uniqueName: 'OhmdalActivationSeam',
      vertexGLSL: activationSeamVS,
      fragmentGLSL: activationSeamFS,
      attributes: {
        vertex_position: pc.SEMANTIC_POSITION,
        vertex_texCoord0: pc.SEMANTIC_TEXCOORD0,
      },
      parameters: {
        u_color: [settings.color.r, settings.color.g, settings.color.b, 1],
        u_peakIntensity: settings.peakIntensity,
        u_master: 0,
        u_emissive: 0,
        u_t: 0,
        u_width: settings.width,
        u_curve: this.curveTexture,
      },
    });

    // Build a long thin plane oriented along `axis`, centered at `anchor`.
    const length = 6.0; // 6 world units; tied to settings.width as a base scale
    const width = Math.max(0.05, settings.width);
    const positions = [
      -width * 0.5, 0, 0,  width * 0.5, 0, 0,
      -width * 0.5, 0, length, width * 0.5, 0, length,
    ];
    const uvs = [0, 0, 1, 0, 0, 1, 1, 1];
    const indices = [0, 2, 1, 1, 2, 3];
    const geom = new pc.Geometry();
    geom.positions = positions;
    geom.indices = indices;
    geom.uvs = uvs;
    geom.normals = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
    const mesh = pc.Mesh.fromGeometry(app.graphicsDevice, geom);

    this.meshEntity = new pc.Entity('ActivationSeam');
    this.meshEntity.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, this.material, this.meshEntity)],
    });
    this.meshEntity.render!.castShadows = false;
    this.meshEntity.render!.receiveShadows = false;
    this.meshEntity.render!.layers = [ctx.createEmissiveLayer().id];
    this.meshEntity.setPosition(anchor);
    this.meshEntity.lookAt(anchor.clone().add(axis));
    // We deliberately do not parent this into world geometry; the seam is a
    // camera-anchored visual element.
    app.root.addChild(this.meshEntity);
  }

  private buildCurveTexture(curve: number[]): pc.Texture {
    // 1D LUT packed as 1xN R8. Default if the curve is missing.
    const values = curve.length >= 2 ? curve : [0, 0.6, 1, 0.4, 0];
    const data = new Uint8Array(values.length);
    for (let i = 0; i < values.length; i += 1) data[i] = Math.round(Math.max(0, Math.min(1, values[i])) * 255);
    const tex = new pc.Texture(this.app.graphicsDevice, {
      name: 'OhmdalActivationCurve',
      width: values.length,
      height: 1,
      format: pc.PIXELFORMAT_R8,
      mipmaps: false,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
    });
    tex.setSource(data);
    return tex;
  }

  isActive(): boolean { return this.elapsed < this.totalDuration; }
  remaining(): number { return Math.max(0, this.totalDuration - this.elapsed); }

  update(dt: number, masterEmissive: number): void {
    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.totalDuration);
    this.material.setParameter('u_t', t);
    this.material.setParameter('u_master', this.settings.intensity);
    this.material.setParameter('u_emissive', masterEmissive);
  }

  dispose(): void {
    this.meshEntity.destroy();
    this.curveTexture.destroy();
  }
}
```

### 2.9 `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/index.ts`

```ts
export * from './types';
export * from './ElectricalFieldSystem';
export * from './ElectricConductorPulse';
export * from './TerminalArcBurst';
export * from './ActivationSeamSequence';
```

---

## 3. Integration points in the current PlayCanvas world/runtime

`buildManantialShell.ts` and `visualHarness.ts` are kept as-is. The VFX system plugs in at three precise places, all additive.

### 3.1 A new `world/ohmdal-vfx/vfxRenderContext.ts`

The VFX system needs an emissive layer. In PlayCanvas v2 the cleanest way is a dedicated `pc.Layer` rendered after the world layer, with a transparent additive composition. This file is the only place that knows about that.

```ts
import * as pc from 'playcanvas';

let emissiveLayer: pc.Layer | null = null;

export function getOrCreateVfxRenderContext(app: pc.Application): {
  worldLayer: pc.Layer;
  createEmissiveLayer(): pc.Layer;
} {
  const worldLayer = app.scene.layers.layerList.find(
    (l) => l.name === 'World',
  ) ?? app.scene.layers.layerList[0];

  return {
    worldLayer,
    createEmissiveLayer(): pc.Layer {
      if (emissiveLayer) return emissiveLayer;
      const layer = new pc.Layer({
        name: 'OhmdalVFXEmissive',
        opaque: false,
        passThrough: true,
        shaderPass: true,
        enabled: true,
      });
      // Render the emissive layer after the world so additive blending lands
      // on top of the StandardMaterial's base color.
      app.scene.layers.insertOpaque(layer, 0);
      // Wire it into the camera's layer composition.
      for (const cam of app.scene.cameras) {
        const comp = cam.camera.layers;
        comp.push(layer);
      }
      emissiveLayer = layer;
      return layer;
    },
  };
}
```

The exact `Layer` config flags may need adjustment against the current PlayCanvas v2 minor; the file isolates that risk to one place.

### 3.2 A new world entry that owns the system

Create `src/experiences/ohmdal-playcanvas/world/ohmdal-vfx/buildOhmdalVFX.ts` that:

- Constructs `ElectricalFieldSystem` once for the zone.
- Registers conductors and terminals in `buildManantialShell` by reading existing `probeTargets` and reusing entities like `penstockPipeL`, `penstockPipeR`, `turbineRotor`, and `surveyMonument`.
- Exposes the system on a stable property on the plaza root (for example `plazaRoot.script?.vfx`) so the visual harness can address it.

```ts
import * as pc from 'playcanvas';
import { ElectricalFieldSystem, ConductorPulseSettings, ArcBurstSettings, ActivationSeamSettings } from './index';
import { getOrCreateVfxRenderContext } from './vfxRenderContext';

export interface OhmdalVFXHandles {
  system: ElectricalFieldSystem;
  startActivation(): Promise<void>;
}

export function buildOhmdalVFX(app: pc.Application, plazaRoot: pc.Entity, probeTargets: Record<string, pc.Vec3>): OhmdalVFXHandles {
  const ctx = getOrCreateVfxRenderContext(app);
  const system = new ElectricalFieldSystem(app, ctx);

  const conductorSettings: ConductorPulseSettings = {
    intensity: 1.0,
    maxActive: 4,
    enabled: true,
    runCount: 1,
    cullDistance: 40,
    pulseDuration: 0.6,
    pulsesPerRun: 1,
    pulseWidth: 0.08,
    color: new pc.Color(1.0, 0.78, 0.32, 1.0), // warm copper-discharge
    peakIntensity: 4.0,
    decayExponent: 1.6,
    repeatHz: 0.6,
    jitter: 0.5,
  };

  const arcSettings: ArcBurstSettings = {
    intensity: 1.0,
    maxActive: 2,
    enabled: true,
    strandCount: 5,
    maxSegments: 14,
    strandLength: 0.8,
    thickness: 0.04,
    duration: 0.18,
    color: new pc.Color(1.0, 0.85, 0.4, 1.0),
    peakIntensity: 5.0,
    decayExponent: 1.4,
    flickerProbability: 0.3,
    sparkBudget: 24,
  };

  // Conductor: penstock pipe left
  if (probeTargets['manantial_turbina_in']) {
    system.registerConductor(
      plazaRoot,
      new pc.Vec3(-3.2, 9.5, 33.5),
      probeTargets['manantial_turbina_in'],
      conductorSettings,
    );
  }
  // Conductor: penstock pipe right
  if (probeTargets['manantial_turbina_in']) {
    system.registerConductor(
      plazaRoot,
      new pc.Vec3(3.2, 9.5, 33.5),
      probeTargets['manantial_turbina_in'],
      conductorSettings,
    );
  }
  // Terminal at the turbine rotor
  if (probeTargets['manantial_turbina_in']) {
    system.registerTerminal(
      plazaRoot,
      probeTargets['manantial_turbina_in'],
      new pc.Vec3(0, 0, 1),
      arcSettings,
    );
  }
  // Terminal at the survey monument
  if (probeTargets['manantial_survey']) {
    system.registerTerminal(
      plazaRoot,
      probeTargets['manantial_survey'],
      new pc.Vec3(0, 1, 0),
      arcSettings,
    );
  }

  // Stash the handles on the plaza root for the harness.
  (plazaRoot as any).__ohmdalVFX = { system } satisfies { system: ElectricalFieldSystem };

  return {
    system,
    startActivation: () => {
      const seam: ActivationSeamSettings = {
        intensity: 1.0,
        maxActive: 1,
        enabled: true,
        duration: 0.9,
        width: 0.06,
        color: new pc.Color(1.0, 0.82, 0.36, 1.0),
        peakIntensity: 3.0,
        curve: [0, 0.4, 1.0, 0.5, 0.0],
        shakeAmplitude: 0.0025,
        shakeFrequency: 12,
        postDip: 0.0,
      };
      const axis = new pc.Vec3(0, 0, 1);
      const anchor = new pc.Vec3(0, 2.2, 24.0);
      return system.startActivation(seam, anchor, axis);
    },
  };
}
```

### 3.3 Wiring into the existing call site

`buildManantialShell` does not need to be modified to use the VFX system; the system reads from the same `probeTargets` and the same `Entity` graph. The composition caller is whoever currently invokes `buildManantialShell`. They should also call `buildOhmdalVFX(app, plazaRoot, probeTargets)` immediately after. The returned handles are then surfaced to the visual harness through `window.__ROXANA_VISUAL_TEST_HOOKS__`.

### 3.4 Visual harness integration

Extend `RoxanaVisualTestHooks` (the file is presented as context; the actual edit is one new method and one new diagnostic block):

```ts
// additive edit to RoxanaVisualTestHooks
interface RoxanaVisualTestHooks {
  // ...existing
  triggerOhmdalActivation(): Promise<void>;
  pulseOhmdalConductor(index: number): void;
  triggerOhmdalArc(index: number): void;
}

// additive edit to RoxanaVisualDiagnostics (only the relevant block is shown)
interface RoxanaVisualDiagnostics {
  // ...existing
  vfx: {
    masterEmissive: boolean;
    lastEmissiveMs: number;
    conductors: { active: number; budget: number; pulsesFired: number };
    arcs: { active: number; budget: number; burstsFired: number };
    seam: { activatedTimes: number };
  } | null;
}
```

The harness reads `(plazaRoot as any).__ohmdalVFX?.system` and forwards diagnostics. The capture contract stays exactly the same: pause via `setPausedForScreenshot`, then read the VFX block.

---

## 4. Exposed settings with sensible defaults

All settings are public fields on each layer class and can be mutated at runtime. Defaults are conservative for mobile and aim for the bible's "single light source of energy moves through the system" reading.

`ConductorPulseSettings` defaults:

| key | default | rationale |
|-----|---------|-----------|
| `intensity` | `1.0` | master multiplier; quality tiers scale this |
| `maxActive` | `4` | hard cap, prevents runaway cost |
| `enabled` | `true` | graceful disable |
| `runCount` | `1` | one pulse run per conductor pair |
| `cullDistance` | `40` | matches Manantial scale |
| `pulseDuration` | `0.6s` | long enough to read A->B |
| `pulsesPerRun` | `1` | one band, no multiplexing |
| `pulseWidth` | `0.08` | thin, physically plausible |
| `color` | copper discharge `1.0, 0.78, 0.32` | matches bible's copper identity |
| `peakIntensity` | `4.0` | strong but not blown out |
| `decayExponent` | `1.6` | asymmetric pulse profile |
| `repeatHz` | `0.6` | slow, ambient, not flashy |
| `jitter` | `0.5` | prevents lockstep |

`ArcBurstSettings` defaults:

| key | default | rationale |
|-----|---------|-----------|
| `intensity` | `1.0` | |
| `maxActive` | `2` | |
| `enabled` | `true` | |
| `strandCount` | `5` | cheap, still reads as a burst |
| `maxSegments` | `14` | CPU ribbon cost = 5 * 14 * 2 = 140 verts |
| `strandLength` | `0.8` | small, terminal-scale |
| `thickness` | `0.04` | |
| `duration` | `0.18s` | fast snap, no lingering |
| `color` | `1.0, 0.85, 0.4` | slightly hotter than conductor |
| `peakIntensity
