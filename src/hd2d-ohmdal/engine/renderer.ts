// HD-2D renderer setup.
// Three.js WebGLRenderer with tone mapping, shadow maps, and pixel ratio cap.
// World is fog-tinted to communicate state (dormant vs awakened).

import * as THREE from "three";

export interface RendererBundle {
  three: THREE.WebGLRenderer;
  scene: THREE.Scene;
  viewport: { width: number; height: number };
  setSize: (w: number, h: number) => void;
  setFog: (color: number, near: number, far: number) => void;
  setToneExposure: (v: number) => void;
}

export function createRenderer(canvas: HTMLCanvasElement): RendererBundle {
  const three = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  three.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  three.outputColorSpace = THREE.SRGBColorSpace;
  three.toneMapping = THREE.ACESFilmicToneMapping;
  three.toneMappingExposure = 1.45;
  three.shadowMap.enabled = true;
  three.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  // Dormant sky: deep blue with warm horizon.
  scene.background = new THREE.Color(0x3a4a68);
  // Fog gives depth and softens distance. Color matches sky. H3: the
  // playable diorama spans ~100m, so the fog must start well past the
  // near-ground (60m) and only fully tint the far horizon (200m+); a
  // tighter range washes out the Plaza and dims the sprites.
  scene.fog = new THREE.Fog(0x3a4a68, 60, 200);

  const viewport = { width: window.innerWidth, height: window.innerHeight };

  const setSize = (w: number, h: number) => {
    three.setSize(w, h, false);
    viewport.width = w;
    viewport.height = h;
  };

  const setFog = (color: number, near: number, far: number) => {
    scene.fog = new THREE.Fog(color, near, far);
  };

  const setToneExposure = (v: number) => {
    three.toneMappingExposure = v;
  };

  return { three, scene, viewport, setSize, setFog, setToneExposure };
}
