// Post-procesado del diorama. La iluminación viene horneada en los vertex
// colors del GLB, así que aquí no se simula luz: sólo se hace el acabado
// fotográfico (bloom en lo emisivo, grado de color, viñeta y antialias).

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

/** Grado de color en espacio lineal: saturación, contraste, temperatura y viñeta. */
const GradeShader = {
  name: 'RoxanaGradeShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uSaturation: { value: 1.08 },
    uContrast: { value: 1.07 },
    uTint: { value: new THREE.Color(1.0, 0.985, 0.95) },
    uVignette: { value: 0.65 },
    uLift: { value: 0.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uSaturation;
    uniform float uContrast;
    uniform vec3 uTint;
    uniform float uVignette;
    uniform float uLift;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, uSaturation);
      color = (color - 0.5) * uContrast + 0.5;
      color *= uTint;
      color += uLift;

      // Viñeta suave, más marcada en las esquinas que en los bordes.
      vec2 centered = vUv - 0.5;
      float falloff = dot(centered, centered);
      color *= clamp(1.0 - falloff * uVignette, 0.0, 1.0);

      gl_FragColor = vec4(max(color, 0.0), texel.a);
    }
  `,
};

export interface PostFxOptions {
  /** En móvil se apagan bloom y SMAA para sostener los 60 fps. */
  compact: boolean;
  width: number;
  height: number;
}

export interface PostFx {
  composer: EffectComposer;
  bloom: UnrealBloomPass | null;
  setSize(width: number, height: number): void;
  dispose(): void;
}

export function createPostFx(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: PostFxOptions,
): PostFx {
  const composer = new EffectComposer(renderer);
  composer.setSize(options.width, options.height);
  composer.addPass(new RenderPass(scene, camera));

  let bloom: UnrealBloomPass | null = null;
  if (!options.compact) {
    // El bake deja lámparas, pantallas y el portal cerca de 1.0; el umbral alto
    // hace que sólo florezcan esos, no las paredes claras.
    bloom = new UnrealBloomPass(new THREE.Vector2(options.width, options.height), 0.52, 0.62, 0.78);
    composer.addPass(bloom);
  }

  composer.addPass(new ShaderPass(GradeShader));
  composer.addPass(new OutputPass());
  if (!options.compact) composer.addPass(new SMAAPass());

  return {
    composer,
    bloom,
    setSize(width, height) {
      composer.setSize(width, height);
      bloom?.setSize(width, height);
    },
    dispose() {
      composer.dispose();
    },
  };
}
