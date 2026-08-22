import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface PostPipeline {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  setSize(width: number, height: number): void;
  render(): void;
}

export function createPostProcessingPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
): PostPipeline {
  const composer = new EffectComposer(renderer);

  // 1. Base Scene Render Pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. Optimized Half-Resolution Unreal Bloom Pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(Math.floor(width / 2), Math.floor(height / 2)),
    0.45, // Balanced subtle bloom
    0.3,  // Radius
    0.82, // High Threshold (only glowing filaments trigger bloom)
  );
  composer.addPass(bloomPass);

  return {
    composer,
    bloomPass,
    setSize(w: number, h: number) {
      composer.setSize(w, h);
      bloomPass.resolution.set(Math.floor(w / 2), Math.floor(h / 2));
    },
    render() {
      composer.render();
    },
  };
}

