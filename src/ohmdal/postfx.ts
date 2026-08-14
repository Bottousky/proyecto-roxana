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
    uFalloff: { value: 0.26 },
    /**
     * Radio maximo del desenfoque, en pixeles.
     *
     * Estaba en 3,2 y a esa escala el efecto no existia: con nueve muestras repartidas en tres
     * pixeles el borde superior del cuadro sale igual de nitido que el personaje, y sin ese
     * contraste no hay efecto maqueta. 8 es el punto donde el fondo se ablanda de verdad y el
     * primer plano todavia no se lee como un error de foco.
     *
     * Es tambien el numero que mas hay que mirar jugando, no en captura: la revision de Horii
     * bajo la profundidad de campo del remake justamente porque molestaba en movimiento. Si
     * incomoda, se baja aca y en ningun otro lado.
     */
    uStrength: { value: 8 },
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
  /**
   * Mando de ajuste para la consola del navegador. Los numeros de este archivo son decisiones
   * de imagen y se aprueban mirando, no leyendo: poder moverlos en caliente es la diferencia
   * entre converger en una sesion y converger en diez recompilaciones.
   */
  tune(values: Partial<Record<'tiltStrength' | 'tiltCenter' | 'tiltHeight' | 'tiltFalloff' | 'bloomStrength' | 'bloomRadius' | 'bloomThreshold' | 'saturation' | 'contrast' | 'split' | 'vignette', number>>): void;
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
   * El tamano de texel del tilt-shift tambien va en pixeles reales: es un radio de muestreo.
   */
  function syncSize(width: number, height: number, mobile: boolean): void {
    const ratio = renderer.getPixelRatio();
    composer.setPixelRatio(ratio);
    composer.setSize(width, height);
    applyTexelSize(width * ratio, height * ratio);
    // En pantallas angostas la banda nitida se estrecha con el encuadre: si no, el
    // desenfoque se comeria los pies del personaje, que el contrato de encuadres protege.
    const focusHeight = mobile ? 0.22 : 0.16;
    horizontalBlur.uniforms.uFocusHeight.value = focusHeight;
    verticalBlur.uniforms.uFocusHeight.value = focusHeight;
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
      return { passes: composer.passes.length, bloom: bloom !== null, tiltShift: true };
    },
    tune(values): void {
      const both = (name: string, value: number): void => {
        horizontalBlur.uniforms[name].value = value;
        verticalBlur.uniforms[name].value = value;
      };
      if (values.tiltStrength !== undefined) both('uStrength', values.tiltStrength);
      if (values.tiltCenter !== undefined) both('uFocusCenter', values.tiltCenter);
      if (values.tiltHeight !== undefined) both('uFocusHeight', values.tiltHeight);
      if (values.tiltFalloff !== undefined) both('uFalloff', values.tiltFalloff);
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
      horizontalBlur.dispose();
      verticalBlur.dispose();
      grade.dispose();
      composer.dispose();
    },
  };
}
