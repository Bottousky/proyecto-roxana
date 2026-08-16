// World lighting.
// - DirectionalLight: one "moon" key light from NW, casts soft shadows.
// - AmbientLight: low cool ambient to keep subjects readable in dormant state.
// - HemisphereLight: warm-from-ground / cool-from-sky for color separation.
// - PointLight per electrical node: off when dormant, on when energized.
// The lighting controller can be globally dimmed/brightened for state changes.

import * as THREE from "three";

export interface LightingController {
  group: THREE.Group;
  directional: THREE.DirectionalLight;
  ambient: THREE.HemisphereLight;
  addPointLight: (position: THREE.Vector3, color: number, intensity: number) => THREE.PointLight;
  setState: (state: "dormant" | "awakening" | "powered_basic" | "powered_full", dt: number) => void;
}

export function createLighting(scene: THREE.Scene): LightingController {
  const group = new THREE.Group();
  group.name = "lighting";

  // Hemisphere gives soft fill; sky cool, ground warm.
  const ambient = new THREE.HemisphereLight(0x7a8ab0, 0x6a4a30, 1.0);
  group.add(ambient);

  // Directional "moon" from NW. Shadows enabled; PCF soft.
  const directional = new THREE.DirectionalLight(0xeae0d0, 1.6);
  directional.position.set(-18, 28, 8);
  directional.target.position.set(0, 0, 0);
  directional.castShadow = true;
  directional.shadow.mapSize.set(2048, 2048);
  directional.shadow.camera.near = 1;
  directional.shadow.camera.far = 80;
  directional.shadow.camera.left = -40;
  directional.shadow.camera.right = 40;
  directional.shadow.camera.top = 40;
  directional.shadow.camera.bottom = -40;
  directional.shadow.bias = -0.0005;
  directional.shadow.normalBias = 0.05;
  directional.shadow.radius = 4;
  group.add(directional);
  group.add(directional.target);

  scene.add(group);

  const pointLights: { light: THREE.PointLight; baseIntensity: number; baseColor: THREE.Color }[] = [];

  const addPointLight: LightingController["addPointLight"] = (position, color, intensity) => {
    const light = new THREE.PointLight(color, 0, 12, 1.7);
    light.position.copy(position);
    light.castShadow = false; // point-light shadows are expensive; lamps get emissive instead.
    group.add(light);
    pointLights.push({ light, baseIntensity: intensity, baseColor: new THREE.Color(color) });
    return light;
  };

  let stateT = 0;
  const setState: LightingController["setState"] = (state, dt) => {
    stateT = Math.min(1, stateT + dt * 0.5);
    let ambientTarget = 0.85;
    let dirTarget = 1.2;
    let humTarget = 0;
    switch (state) {
      case "dormant":
        ambientTarget = 0.85;
        dirTarget = 1.2;
        humTarget = 0;
        break;
      case "awakening":
        ambientTarget = 1.0;
        dirTarget = 1.4;
        humTarget = 0.5;
        break;
      case "powered_basic":
        ambientTarget = 1.15;
        dirTarget = 1.6;
        humTarget = 0.85;
        break;
      case "powered_full":
        ambientTarget = 1.25;
        dirTarget = 1.7;
        humTarget = 1.0;
        break;
    }
    ambient.intensity = THREE.MathUtils.lerp(ambient.intensity, ambientTarget, 0.05);
    directional.intensity = THREE.MathUtils.lerp(directional.intensity, dirTarget, 0.05);
    // Modulate point lights: scale their baseIntensity by a state factor.
    const pointFactor = humTarget;
    for (const { light, baseIntensity } of pointLights) {
      const target = baseIntensity * pointFactor;
      light.intensity = THREE.MathUtils.lerp(light.intensity, target, 0.08);
    }
    void stateT;
  };

  return { group, directional, ambient, addPointLight, setState };
}
