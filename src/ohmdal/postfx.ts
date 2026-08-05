// Acabado fotografico de Ohmdal. Es la mitad del look HD-2D: sin esto el mundo se ve como
// geometria limpia y correcta, nunca como una maqueta iluminada.
//
// Tres efectos, en este orden y por esta razon:
//
//   1. BLOOM sobre lo emisivo — las velas, el conducto de la Puerta, las chispas. En el remake
//      de DQ III cada fuente de luz sangra sobre lo que la rodea; es lo que separa una llama
//      de un cuadrado naranja.
//   2. TILT-SHIFT — una franja nitida horizontal y desenfoque creciente arriba y abajo. Es LA
//      firma del estilo: enganya al ojo para que lea el mundo como una maqueta fotografiada
//      de cerca. Mirando las referencias, los arboles del primer plano y el fondo lejano estan
//      los dos borrosos, y los personajes nitidos en el medio.
//   3. GRADO DE COLOR y viñeta — saturacion, contraste y temperatura. Cierra la imagen.
//
// No es profundidad de campo real: no lee el depth buffer, desenfoca segun la posicion
// VERTICAL en pantalla. Eso es exactamente lo que hace el efecto miniatura, y cuesta una
// fraccion de un bokeh con depth.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

/**
 * Desenfoque separable en una direccion, con la intensidad dictada por la distancia vertical
 * a la banda enfocada. Se instancia dos veces (horizontal y vertical): dos pasadas de 9 taps
 * dan el mismo resultado que una de 81 y cuestan 18.
 */
const TiltShiftShader = {
  name: 'OhmdalTiltShiftShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    /** (1,0) para la pasada horizontal, (0,1) para la vertical. */
    uDirection: { value: new THREE.Vector2(1, 0) },
    uTexelSize: { value: new THREE.Vector2(1 / 1280, 1 / 720) },
    /** Centro de la banda nitida, en coordenadas de pantalla (0 abajo, 1 arriba). */
    uFocusCenter: { value: 0.42 },
    /** Media altura de la banda totalmente nitida. */
    uFocusHeight: { value: 0.16 },
    /** Cuanto tarda en llegar al desenfoque maximo saliendo de la banda. */
    uFalloff: { value: 0.30 },
    /** Radio maximo del desenfoque, en pixeles. */
    uStrength: { value: 3.2 },
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
    uniform vec2 uDirection;
    uniform vec2 uTexelSize;
    uniform float uFocusCenter;
    uniform float uFocusHeight;
    uniform float uFalloff;
    uniform float uStrength;
    varying vec2 vUv;

    // Gaussiana de 9 taps. Pesos simetricos, ya normalizados a suma 1.
    const float W0 = 0.2270270270;
    const float W1 = 0.1945945946;
    const float W2 = 0.1216216216;
    const float W3 = 0.0540540541;
    const float W4 = 0.0162162162;

    void main() {
      float distanceFromBand = abs(vUv.y - uFocusCenter);
      float blurAmount = smoothstep(uFocusHeight, uFocusHeight + uFalloff, distanceFromBand);
      float radius = blurAmount * uStrength;

      // Dentro de la banda no se toca el pixel: evita el lavado sutil que da muestrear
      // ocho vecinos con radio casi cero, justo donde esta el personaje.
      if (radius < 0.01) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      vec2 step1 = uDirection * uTexelSize * radius;
      vec2 step2 = step1 * 2.0;
      vec2 step3 = step1 * 3.0;
      vec2 step4 = step1 * 4.0;

      vec4 sum = texture2D(tDiffuse, vUv) * W0;
      sum += texture2D(tDiffuse, vUv + step1) * W1;
      sum += texture2D(tDiffuse, vUv - step1) * W1;
      sum += texture2D(tDiffuse, vUv + step2) * W2;
      sum += texture2D(tDiffuse, vUv - step2) * W2;
      sum += texture2D(tDiffuse, vUv + step3) * W3;
      sum += texture2D(tDiffuse, vUv - step3) * W3;
      sum += texture2D(tDiffuse, vUv + step4) * W4;
      sum += texture2D(tDiffuse, vUv - step4) * W4;

      gl_FragColor = sum;
    }
  `,
};

/** Grado de color en espacio lineal: saturacion, contraste, temperatura y viñeta. */
const GradeShader = {
  name: 'OhmdalGradeShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uSaturation: { value: 1.14 },
    uContrast: { value: 1.09 },
    uTint: { value: new THREE.Color(1.0, 0.985, 0.955) },
    uVignette: { value: 0.55 },
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
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, uSaturation);
      color = (color - 0.5) * uContrast + 0.5;
      color *= uTint;

      // Viñeta suave, mas marcada en las esquinas que en los bordes.
      vec2 centered = vUv - 0.5;
      float falloff = dot(centered, centered);
      color *= clamp(1.0 - falloff * uVignette, 0.0, 1.0);

      gl_FragColor = vec4(max(color, 0.0), texel.a);
    }
  `,
};

export interface OhmdalPostFxOptions {
  readonly width: number;
  readonly height: number;
  /** En movil se apagan bloom y SMAA. El tilt-shift se conserva: es barato y es el estilo. */
  readonly mobile: boolean;
}

export interface OhmdalPostFx {
  readonly composer: EffectComposer;
  render(): void;
  setSize(width: number, height: number, mobile: boolean): void;
  /**
   * Reapunta la primera pasada. Hace falta porque cambiar de perfil de viewport reconstruye
   * el controlador de camara entero, y el composer se quedaria renderizando la camara muerta.
   */
  setCamera(camera: THREE.Camera): void;
  /** Diagnostico para tests y para la consola del navegador. */
  snapshot(): { readonly passes: number; readonly bloom: boolean; readonly tiltShift: boolean };
  dispose(): void;
}

export function createOhmdalPostFx(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: OhmdalPostFxOptions,
): OhmdalPostFx {
  const composer = new EffectComposer(renderer);
  composer.setSize(options.width, options.height);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Umbral alto (0.72): sangra lo que de verdad emite luz, no cualquier superficie clara.
  let bloom: UnrealBloomPass | null = null;
  if (!options.mobile) {
    bloom = new UnrealBloomPass(new THREE.Vector2(options.width, options.height), 0.58, 0.68, 0.72);
    composer.addPass(bloom);
  }

  const horizontalBlur = new ShaderPass(TiltShiftShader);
  horizontalBlur.uniforms.uDirection.value = new THREE.Vector2(1, 0);
  composer.addPass(horizontalBlur);

  const verticalBlur = new ShaderPass(TiltShiftShader);
  verticalBlur.uniforms.uDirection.value = new THREE.Vector2(0, 1);
  composer.addPass(verticalBlur);

  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  composer.addPass(new OutputPass());

  let smaa: SMAAPass | null = null;
  if (!options.mobile) {
    smaa = new SMAAPass();
    composer.addPass(smaa);
  }

  function applyTexelSize(width: number, height: number): void {
    const texel = new THREE.Vector2(1 / Math.max(width, 1), 1 / Math.max(height, 1));
    horizontalBlur.uniforms.uTexelSize.value = texel.clone();
    verticalBlur.uniforms.uTexelSize.value = texel.clone();
  }

  applyTexelSize(options.width, options.height);

  return {
    composer,
    render(): void {
      composer.render();
    },
    setSize(width, height, mobile): void {
      composer.setSize(width, height);
      bloom?.setSize(width, height);
      smaa?.setSize(width, height);
      applyTexelSize(width, height);
      // En pantallas angostas la banda nitida se estrecha con el encuadre: si no, el
      // desenfoque se comeria los pies del personaje, que el contrato de encuadres protege.
      const focusHeight = mobile ? 0.22 : 0.16;
      horizontalBlur.uniforms.uFocusHeight.value = focusHeight;
      verticalBlur.uniforms.uFocusHeight.value = focusHeight;
    },
    setCamera(nextCamera): void {
      renderPass.camera = nextCamera;
    },
    snapshot() {
      return { passes: composer.passes.length, bloom: bloom !== null, tiltShift: true };
    },
    dispose(): void {
      bloom?.dispose();
      smaa?.dispose();
      horizontalBlur.dispose();
      verticalBlur.dispose();
      grade.dispose();
      composer.dispose();
    },
  };
}
