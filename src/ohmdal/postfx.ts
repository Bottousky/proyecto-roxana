// Acabado fotografico de Ohmdal. Es la mitad del look HD-2D: sin esto el mundo se ve como
// geometria limpia y correcta, nunca como una escena pintada.
//
// Dos efectos, en este orden y por esta razon:
//
//   1. BLOOM sobre lo emisivo — las velas, el conducto de la Puerta, las chispas. En el remake
//      de DQ III cada fuente de luz sangra sobre lo que la rodea; es lo que separa una llama
//      de un cuadrado naranja.
//   2. GRADO DE COLOR y viñeta — saturacion, contraste y temperatura. Cierra la imagen.
//
// El tilt-shift se eliminó del pipeline (RC1-feedback): la banda nítida a 42% de la pantalla
// y el radio de 8 px dejaban la mitad superior e inferior del cuadro ilegibles. La maqueta se
// lee por la cámara casi ortográfica y el pixel art, no por un desenfoque que el jugador no
// pidió. Si se quiere recuperar el efecto, se hace como un modo opt-in, no por defecto.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

/** Grado de color en espacio lineal: saturacion, contraste, temperatura, tono partido y viñeta. */
const GradeShader = {
  name: 'OhmdalGradeShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uSaturation: { value: 1.22 },
    uContrast: { value: 1.12 },
    uTint: { value: new THREE.Color(1.0, 0.985, 0.955) },
    /**
     * Tono partido: sombras al frio, altas al calido. Es lo que hace que una escena de tarde
     * tenga dos temperaturas y no una — el sol de un lado, el cielo del otro— y separa el
     * material iluminado del que esta a la sombra sin tocar la luz de la escena.
     */
    uShadowTint: { value: new THREE.Color(0.80, 0.90, 1.10) },
    uHighlightTint: { value: new THREE.Color(1.08, 1.01, 0.90) },
    uSplitAmount: { value: 0.22 },
    uVignette: { value: 0.85 },
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
    uniform vec3 uShadowTint;
    uniform vec3 uHighlightTint;
    uniform float uSplitAmount;
    uniform float uVignette;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, uSaturation);
      color = (color - 0.5) * uContrast + 0.5;
      color *= uTint;

      // Tono partido sobre la luminancia ya graduada: la mezcla es suave en el medio para que
      // no aparezca un escalon donde el material pasa de sombra a luz.
      float split = smoothstep(0.15, 0.85, dot(color, vec3(0.2126, 0.7152, 0.0722)));
      vec3 splitTint = mix(uShadowTint, uHighlightTint, split);
      color = mix(color, color * splitTint, uSplitAmount);

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
  /** En movil se apagan bloom y SMAA. */
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
  snapshot(): { readonly passes: number; readonly bloom: boolean };
  /**
   * Mando de ajuste para la consola del navegador. Los numeros de este archivo son decisiones
   * de imagen y se aprueban mirando, no leyendo: poder moverlos en caliente es la diferencia
   * entre converger en una sesion y converger en diez recompilaciones.
   */
  tune(values: Partial<Record<'bloomStrength' | 'bloomRadius' | 'bloomThreshold' | 'saturation' | 'contrast' | 'split' | 'vignette', number>>): void;
  dispose(): void;
}

export function createOhmdalPostFx(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: OhmdalPostFxOptions,
): OhmdalPostFx {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Umbral 0.60: sigue sangrando lo que emite luz y no cualquier superficie clara, pero deja
  // entrar la coronacion iluminada por el sol y el filo del agua, que es donde el remake pone
  // la mitad de su brillo. Con 0.72 solo entraban la llama y el conducto, y el resto del cuadro
  // quedaba mate.
  let bloom: UnrealBloomPass | null = null;
  if (!options.mobile) {
    bloom = new UnrealBloomPass(new THREE.Vector2(options.width, options.height), 0.85, 0.8, 0.6);
    composer.addPass(bloom);
  }

  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);

  composer.addPass(new OutputPass());

  let smaa: SMAAPass | null = null;
  if (!options.mobile) {
    smaa = new SMAAPass();
    composer.addPass(smaa);
  }

  /**
   * Todo el redimensionado pasa por acá, incluido el primero.
   *
   * `EffectComposer` captura el pixel ratio del renderer **al construirse** y no lo vuelve a
   * mirar. Si no se lo actualizamos, arma sus render targets en pixeles CSS mientras el canvas
   * dibuja en pixeles fisicos, y en una pantalla con dpr 2 el mundo entero termina renderizado
   * en un cuarto del canvas con el resto en negro.
   *
   * `composer.setSize` ya propaga el tamano efectivo —CSS x ratio— a cada pasada, bloom y SMAA
   * incluidos, asi que redimensionarlas a mano seria pisar el valor correcto con el equivocado.
   */
  function syncSize(width: number, height: number, mobile: boolean): void {
    void mobile;
    const ratio = renderer.getPixelRatio();
    composer.setPixelRatio(ratio);
    composer.setSize(width, height);
  }

  syncSize(options.width, options.height, options.mobile);

  return {
    composer,
    render(): void {
      composer.render();
    },
    setSize(width, height, mobile): void {
      syncSize(width, height, mobile);
    },
    setCamera(nextCamera): void {
      renderPass.camera = nextCamera;
    },
    snapshot() {
      return { passes: composer.passes.length, bloom: bloom !== null };
    },
    tune(values): void {
      if (values.bloomStrength !== undefined && bloom) bloom.strength = values.bloomStrength;
      if (values.bloomRadius !== undefined && bloom) bloom.radius = values.bloomRadius;
      if (values.bloomThreshold !== undefined && bloom) bloom.threshold = values.bloomThreshold;
      if (values.saturation !== undefined) grade.uniforms.uSaturation.value = values.saturation;
      if (values.contrast !== undefined) grade.uniforms.uContrast.value = values.contrast;
      if (values.split !== undefined) grade.uniforms.uSplitAmount.value = values.split;
      if (values.vignette !== undefined) grade.uniforms.uVignette.value = values.vignette;
    },
    dispose(): void {
      bloom?.dispose();
      smaa?.dispose();
      grade.dispose();
      composer.dispose();
    },
  };
}
