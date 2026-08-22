import * as THREE from 'three';

/**
 * Physical Water Optics Material
 * Incorporates Fresnel reflectance, depth-based optical absorption,
 * and animated multi-octave caustic waves.
 */
export function createPhysicalWaterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFlowActive: { value: 0.0 }, // 0 = stagnant, 1 = active pump
      uDeepColor: { value: new THREE.Color(0x0e2634) },
      uShallowColor: { value: new THREE.Color(0x3296a8) },
      uSunColor: { value: new THREE.Color(0xffe6b0) },
      uSunDirection: { value: new THREE.Vector3(-0.5, 0.8, 0.3).normalize() },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uFlowActive;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vec3 pos = position;

        // Multi-octave wave displacement
        float speed = 1.2 + uFlowActive * 2.2;
        float w1 = sin(pos.x * 4.5 + uTime * speed) * 0.035;
        float w2 = cos(pos.y * 5.0 + uTime * speed * 1.3) * 0.025;
        float w3 = sin((pos.x + pos.y) * 8.0 + uTime * speed * 1.8) * 0.015;
        pos.z += (w1 + w2 + w3) * (0.4 + uFlowActive * 0.6);

        vNormal = normalize(normalMatrix * vec3(w1 * 2.0, w2 * 2.0, 1.0));
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uFlowActive;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uSunColor;
      uniform vec3 uSunDirection;

      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;

      void main() {
        // 1. Radial Depth Gradient (Shallow stone edge to deep center)
        float distFromCenter = length(vUv - 0.5) * 2.0;
        vec3 waterColor = mix(uDeepColor, uShallowColor, smoothstep(0.1, 0.95, distFromCenter));

        // 2. Procedural Caustics
        float speed = 1.0 + uFlowActive * 1.8;
        float c1 = sin(vUv.x * 30.0 + uTime * speed) * cos(vUv.y * 30.0 + uTime * speed * 0.8);
        float c2 = cos(vUv.x * 45.0 - uTime * speed * 1.2) * sin(vUv.y * 45.0 + uTime * speed * 1.4);
        float caustic = pow(clamp((c1 + c2) * 0.5 + 0.5, 0.0, 1.0), 4.0) * (0.35 + uFlowActive * 0.65);
        waterColor += uSunColor * caustic * 0.45;

        // 3. Fresnel Reflectance (Schlick's approximation: R(theta) = R0 + (1-R0)*(1-cosTheta)^5)
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float cosTheta = clamp(dot(viewDir, vNormal), 0.0, 1.0);
        float R0 = 0.02; // Water index of refraction reflection at normal incidence
        float fresnel = R0 + (1.0 - R0) * pow(1.0 - cosTheta, 5.0);

        // Sky reflection color (sunset golden warmth)
        vec3 skyReflection = mix(vec3(0.9, 0.75, 0.55), vec3(0.4, 0.6, 0.8), cosTheta);
        vec3 finalColor = mix(waterColor, skyReflection, fresnel * 0.65);

        // 4. Specular Sunlight Glint
        vec3 halfVector = normalize(uSunDirection + viewDir);
        float spec = pow(max(dot(vNormal, halfVector), 0.0), 32.0);
        finalColor += uSunColor * spec * (0.5 + uFlowActive * 0.5);

        // 5. Soft Shoreline Edge Foam
        float foam = smoothstep(0.85, 0.98, distFromCenter) * (0.2 + sin(uTime * 4.0) * 0.08);
        finalColor = mix(finalColor, vec3(0.95, 0.98, 1.0), foam);

        gl_FragColor = vec4(finalColor, 0.88);
      }
    `,
    transparent: true,
  });
}
