// Merging static meshes by material (fewer draw calls): see mergeStatic.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Merges the static meshes under `root` into one mesh per material (and shadow flags): the
 * neighbourhood was ~270 draw calls, one or more per box. A façade's per-face texture repeat is
 * baked into its UVs so all the façades share their base material. `skip(o)` keeps a mesh (and
 * what is under it) as it is: animated parts, toggled ones, transparent water, instanced plants.
 */
export function mergeStatic(root, skip = () => false) {
  root.updateMatrixWorld(true);
  const toRoot = root.matrixWorld.clone().invert(); // (baked relative to `root`, which may be placed anywhere)
  const buckets = new Map(), victims = [];
  const visit = o => {
    if (skip(o) || (o.isMesh && !o.visible)) return; // (a hidden mesh stays hidden: merged, it would show)
    for (const c of [...o.children]) visit(c);
    if (!o.isMesh || o.isInstancedMesh || o.renderOrder !== 0) return;
    const mats = [o.material].flat();
    if (mats.some(m => m.transparent || m.isShaderMaterial)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(toRoot.clone().multiply(o.matrixWorld));
    // (a single material covers every group: cylinders carry groups for their caps)
    const groups = g.groups.length && mats.length > 1 ? g.groups : [{ start: 0, count: g.attributes.position.count, materialIndex: 0 }];
    for (const gr of groups) {
      const m = mats[gr.materialIndex ?? 0], base = m.userData.base || m;
      const sub = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'uv']) {
        const a = g.attributes[name], n = name === 'uv' ? 2 : 3;
        const arr = a ? a.array.slice(gr.start * n, (gr.start + gr.count) * n) : new Float32Array(gr.count * n);
        if (name === 'uv' && m.userData.base) for (let i = 0; i < arr.length; i += 2) { arr[i] *= m.map.repeat.x; arr[i + 1] *= m.map.repeat.y; }
        sub.setAttribute(name, new THREE.BufferAttribute(arr, n));
      }
      const key = `${base.uuid}|${o.castShadow ? 1 : 0}${o.receiveShadow ? 1 : 0}`;
      if (!buckets.has(key)) buckets.set(key, { mat: base, cast: o.castShadow, receive: o.receiveShadow, repeat: !!m.userData.base, geos: [] });
      buckets.get(key).geos.push(sub);
    }
    victims.push(o);
  };
  visit(root);
  for (const o of victims) { o.removeFromParent(); }
  for (const b of buckets.values()) {
    if (b.mat.map && b.repeat) { b.mat.map.wrapS = b.mat.map.wrapT = THREE.RepeatWrapping; b.mat.map.needsUpdate = true; } // (the façades' baked repeats)
    const m = new THREE.Mesh(mergeGeometries(b.geos), b.mat); m.castShadow = b.cast; m.receiveShadow = b.receive; root.add(m);
  }
  return { meshes: victims.length, merged: buckets.size };
}

