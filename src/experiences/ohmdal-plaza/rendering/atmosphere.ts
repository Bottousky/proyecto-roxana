import * as THREE from 'three';

/**
 * Volumetric Light Shafts (God Rays) and Atmospheric Lighting Engine
 */
export function createAtmosphereSystem(scene: THREE.Scene): {
  godRays: THREE.Mesh[];
  dustParticles: THREE.Points;
  update(time: number, delta: number): void;
} {
  // 1. Volumetric God Rays (Light Shafts)
  const godRays: THREE.Mesh[] = [];
  const rayMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffd084) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        // Soft gradient along the shaft length and edges
        float lengthFade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
        float edgeFade = sin(vUv.x * 3.14159);
        float dustNoise = sin(vUv.x * 20.0 + uTime * 0.4) * cos(vUv.y * 15.0 - uTime * 0.3) * 0.15;

        float alpha = lengthFade * edgeFade * (0.18 + dustNoise);
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.35));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const createRay = (x: number, y: number, z: number, length: number, width: number, rotZ: number, rotX: number) => {
    const geo = new THREE.CylinderGeometry(width * 0.3, width, length, 12, 1, true);
    const mesh = new THREE.Mesh(geo, rayMat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rotX, 0, rotZ);
    scene.add(mesh);
    godRays.push(mesh);
  };

  // Main sunset light beams pouring through the archways
  createRay(-2.5, 7.5, -6.0, 16.0, 3.8, -0.38, 0.45);
  createRay(3.2, 8.0, -4.0, 18.0, 4.2, -0.38, 0.45);
  createRay(-5.0, 6.0, 1.0, 14.0, 3.2, -0.38, 0.45);

  // 2. Floating Golden Dust Motes & Sun Flecks
  const dustCount = 120;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);

  for (let i = 0; i < dustCount; i += 1) {
    dustPos[i * 3 + 0] = (Math.random() - 0.5) * 28;
    dustPos[i * 3 + 1] = Math.random() * 6.5 + 0.3;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
    dustSizes[i] = Math.random() * 0.18 + 0.08;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));

  const dustMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffe896) },
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 pos = position;
        pos.y += sin(uTime * 0.8 + pos.x * 0.5) * 0.2;
        pos.x += cos(uTime * 0.6 + pos.z * 0.5) * 0.15;

        vAlpha = 0.5 + sin(uTime * 2.0 + pos.y * 3.0) * 0.35;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        // Soft circular glow point
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float intensity = pow(1.0 - dist * 2.0, 2.0) * vAlpha;
        gl_FragColor = vec4(uColor, intensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  return {
    godRays,
    dustParticles,
    update(time: number, delta: number) {
      rayMat.uniforms.uTime.value = time;
      dustMat.uniforms.uTime.value = time;

      // Drift dust slowly downward and loop
      const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;
      for (let i = 0; i < dustCount; i += 1) {
        array[i * 3 + 1] -= delta * 0.22;
        if (array[i * 3 + 1] < 0.2) {
          array[i * 3 + 1] = 6.5;
        }
      }
      posAttr.needsUpdate = true;
    },
  };
}
