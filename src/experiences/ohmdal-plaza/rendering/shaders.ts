import * as THREE from 'three';

/**
 * HD-2D Tilt-Shift & Filmic Color Grading Post-Processing Shader
 */
export const TiltShiftShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    focusY: { value: 0.5 },
    focusWidth: { value: 0.28 },
    blurStrength: { value: 3.5 },
    vignetteStrength: { value: 0.38 },
    colorWarmth: { value: 0.12 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float focusY;
    uniform float focusWidth;
    uniform float blurStrength;
    uniform float vignetteStrength;
    uniform float colorWarmth;
    uniform vec2 resolution;
    varying vec2 vUv;

    void main() {
      // Calculate distance from horizontal focal plane
      float dist = abs(vUv.y - focusY);
      float blur = smoothstep(focusWidth * 0.5, focusWidth * 1.5, dist) * blurStrength;

      vec4 sum = vec4(0.0);
      vec2 texelSize = 1.0 / resolution;

      // 9-tap Poisson disk blur for cinematic diorama look
      vec2 offsets[9];
      offsets[0] = vec2( 0.0,  0.0);
      offsets[1] = vec2(-0.7, -0.7);
      offsets[2] = vec2( 0.7, -0.7);
      offsets[3] = vec2(-0.7,  0.7);
      offsets[4] = vec2( 0.7,  0.7);
      offsets[5] = vec2( 0.0, -1.0);
      offsets[6] = vec2( 0.0,  1.0);
      offsets[7] = vec2(-1.0,  0.0);
      offsets[8] = vec2( 1.0,  0.0);

      float totalWeight = 0.0;
      for (int i = 0; i < 9; i++) {
        float w = (i == 0) ? 2.0 : 1.0;
        vec2 sampleUv = vUv + offsets[i] * texelSize * blur;
        sum += texture2D(tDiffuse, sampleUv) * w;
        totalWeight += w;
      }
      vec4 color = sum / totalWeight;

      // Filmic Warmth (Golden hour dusk tone)
      color.r += colorWarmth * 0.14;
      color.g += colorWarmth * 0.06;
      color.b -= colorWarmth * 0.08;

      // Soft Vignette
      vec2 centered = (vUv - 0.5) * 2.0;
      float vig = 1.0 - dot(centered, centered) * vignetteStrength;
      color.rgb *= clamp(vig, 0.2, 1.0);

      gl_FragColor = color;
    }
  `,
};

/**
 * Creates an animated caustic water shader material for the Plaza fountain
 */
export function createWaterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(0x1a485a) },
      shallowColor: { value: new THREE.Color(0x3ea2b8) },
      flowActive: { value: 0.0 }, // 0 = stagnant, 1 = active flowing
    },
    vertexShader: `
      uniform float time;
      uniform float flowActive;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normal;
        vec3 pos = position;

        // Subtle gentle waves
        float wave1 = sin(pos.x * 3.0 + time * (1.2 + flowActive * 2.0)) * 0.04;
        float wave2 = cos(pos.z * 4.0 + time * (1.5 + flowActive * 2.5)) * 0.03;
        pos.y += (wave1 + wave2) * (0.4 + flowActive * 0.6);

        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 baseColor;
      uniform vec3 shallowColor;
      uniform float flowActive;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        // Procedural caustics pattern
        float c1 = sin(vUv.x * 24.0 + time * 1.5) * cos(vUv.y * 24.0 + time * 1.2);
        float c2 = cos(vUv.x * 32.0 - time * 1.8) * sin(vUv.y * 32.0 + time * 1.6);
        float caustic = pow(abs(c1 + c2) * 0.5, 3.0) * (0.35 + flowActive * 0.45);

        vec3 col = mix(baseColor, shallowColor, 0.4 + caustic + flowActive * 0.2);
        gl_FragColor = vec4(col, 0.85);
      }
    `,
    transparent: true,
  });
}
