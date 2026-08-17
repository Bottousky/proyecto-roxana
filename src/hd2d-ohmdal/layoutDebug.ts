// Layout debug layer — development-only review instruments for validating the
// Cuenca spatial layout against arc1-layout.json.
//
// This is NOT the gameplay camera and NOT game art. It draws the layout
// document's primitives (zones, landmarks, buildings, paths, sightlines,
// interaction radii, negative space, world bounds) as wireframe overlays so a
// human or VLM reviewer can check that runtime placement matches the JSON.
//
// Toggles (URL params):
//   ?layoutTop=1          top-down (cenital) review camera
//   ?layoutDebug=1        wireframe overlay of zones/buildings/bounds
//   ?layoutLabels=1       text labels for ids and [x,y,z]
//   ?layoutElectrical=1   electrical node/cable overlay
//
// The overlay is derived from layoutData.ts (arc1-layout.json) — it never
// invents coordinates.

import * as THREE from "three";
import {
  CUENCA,
  centerToRect,
} from "./world/layoutData.ts";
import { NODES, CABLES, REGIONS, WORLD_BOUNDS } from "./world/topology.ts";

export interface LayoutDebugOptions {
  top: boolean;
  overlay: boolean;
  labels: boolean;
  electrical: boolean;
}

export interface LayoutDebug {
  /** Wireframe + label group added to the scene. */
  group: THREE.Group;
  /** Orthographic-style top camera controller; returns a cleanup. */
  enableTop: () => void;
  disableTop: () => void;
  isTop: () => boolean;
  /** Toggle individual overlays at runtime. */
  setOverlay: (on: boolean) => void;
  setLabels: (on: boolean) => void;
  setElectrical: (on: boolean) => void;
}

const LABEL_COLORS = {
  zone: 0x71859b,
  landmark: 0xf0bd74,
  building: 0xd0a66f,
  path: 0xc38b45,
  anchor: 0x8ce2b9,
  sightline: 0x6ec4d8,
  negative: 0x8f9baa,
  electrical: 0xffd28a,
};

export function readLayoutDebugParams(): LayoutDebugOptions {
  const p = new URLSearchParams(window.location.search);
  return {
    top: p.get("layoutTop") === "1",
    overlay: p.get("layoutDebug") === "1",
    labels: p.get("layoutLabels") === "1",
    electrical: p.get("layoutElectrical") === "1",
  };
}

export function createLayoutDebug(scene: THREE.Scene, opts: LayoutDebugOptions): LayoutDebug {
  const group = new THREE.Group();
  group.name = "layout-debug";
  scene.add(group);

  let topOn = false;

  const setVisible = (obj: THREE.Object3D, on: boolean) => {
    obj.visible = on;
    obj.traverse((o) => { o.visible = on; });
  };

  // ---------- Wireframe overlay ----------
  const overlayGroup = new THREE.Group();
  overlayGroup.name = "layout-debug-overlay";
  group.add(overlayGroup);

  const labelGroup = new THREE.Group();
  labelGroup.name = "layout-debug-labels";
  group.add(labelGroup);

  const drawRect = (rect: { x: number; z: number; width: number; depth: number }, y: number, color: number) => {
    const g = new THREE.BoxGeometry(rect.width, 0.06, rect.depth);
    const edges = new THREE.EdgesGeometry(g);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }),
    );
    line.position.set(rect.x + rect.width / 2, y, rect.z + rect.depth / 2);
    overlayGroup.add(line);
  };

  const makeLabel = (id: string, pos: THREE.Vector3, color: number, detail: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "28px monospace";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = "#f5f7fa";
    ctx.fillText(id, 12, 40);
    if (detail) {
      ctx.fillStyle = "#aeb8c5";
      ctx.font = "20px monospace";
      ctx.fillText(detail, 12, 72);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    sprite.position.copy(pos);
    sprite.scale.set(8, 1.5, 1);
    sprite.name = `label_${id}`;
    labelGroup.add(sprite);
    void color;
  };

  // Grid + axes (always part of the debug group, sized to the diorama).
  const boundsRect = (() => {
    const minX = WORLD_BOUNDS.minX, maxX = WORLD_BOUNDS.maxX;
    const minZ = WORLD_BOUNDS.minZ, maxZ = WORLD_BOUNDS.maxZ;
    const size = Math.max(maxX - minX, maxZ - minZ);
    return { minX, maxX, minZ, maxZ, size };
  })();
  const grid = new THREE.GridHelper(boundsRect.size, 24, 0x7a8698, 0x3a4654);
  grid.position.set((boundsRect.minX + boundsRect.maxX) / 2, 0.01, (boundsRect.minZ + boundsRect.maxZ) / 2);
  overlayGroup.add(grid);
  const axes = new THREE.AxesHelper(6);
  axes.position.set(0, 0.02, 0);
  overlayGroup.add(axes);

  // ---------- Draw layout primitives from the JSON ----------
  for (const zone of CUENCA.zones) {
    const r = centerToRect(zone.center, zone.size);
    drawRect(r, 0.02, LABEL_COLORS.zone);
    if (opts.labels) {
      makeLabel(zone.id, new THREE.Vector3(r.x + r.width / 2, 0.3, r.z + r.depth / 2), LABEL_COLORS.zone, `[${zone.center.x}, ${zone.center.z}] ${r.width}×${r.depth}m`);
    }
  }

  for (const lm of CUENCA.landmarks) {
    const r = centerToRect(lm.position, lm.footprint);
    drawRect(r, 0.04, LABEL_COLORS.landmark);
    if (opts.labels) {
      makeLabel(`landmark: ${lm.id}`, new THREE.Vector3(r.x + r.width / 2, 0.4, r.z + r.depth / 2), LABEL_COLORS.landmark, `[${lm.position.x}, ${lm.position.z}]`);
    }
  }

  for (const b of CUENCA.buildings) {
    const r = centerToRect(b.center, b.size);
    drawRect(r, 0.03, LABEL_COLORS.building);
    if (b.entrance && opts.labels) {
      const e = b.entrance.position;
      makeLabel(`entrance: ${b.entrance.facingY}°`, new THREE.Vector3(e.x, 0.5, e.z), LABEL_COLORS.building, `[${e.x}, ${e.z}]`);
    }
  }

  for (const p of CUENCA.paths) {
    const a = new THREE.Vector3(p.from.x, 0.05, p.from.z);
    const bv = new THREE.Vector3(p.to.x, 0.05, p.to.z);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, bv]),
      new THREE.LineBasicMaterial({ color: LABEL_COLORS.path, transparent: true, opacity: 0.7 }),
    );
    overlayGroup.add(line);
    if (opts.labels) {
      const mid = a.clone().add(bv).multiplyScalar(0.5);
      makeLabel(`path: ${p.id} (≥${p.minClearWidth}m)`, mid, LABEL_COLORS.path, "");
    }
  }

  for (const a of CUENCA.interactionAnchors) {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(a.stagingRadius - 0.05, a.stagingRadius, 32),
      new THREE.MeshBasicMaterial({ color: LABEL_COLORS.anchor, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
    );
    r.rotation.x = -Math.PI / 2;
    r.position.set(a.position.x, 0.06, a.position.z);
    overlayGroup.add(r);
    if (opts.labels) {
      makeLabel(`action: ${a.id} (r=${a.stagingRadius}m)`, new THREE.Vector3(a.position.x, 0.4, a.position.z), LABEL_COLORS.anchor, `[${a.position.x}, ${a.position.z}]`);
    }
  }

  for (const s of CUENCA.protectedSightlines) {
    const pts = [s.from, s.through, s.to].filter(Boolean).map((pt) => new THREE.Vector3(pt!.x, 0.07, pt!.z));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: LABEL_COLORS.sightline, transparent: true, opacity: 0.8 }),
    );
    overlayGroup.add(line);
    if (opts.labels) {
      makeLabel(`sightline: ${s.id}`, pts[Math.floor(pts.length / 2)], LABEL_COLORS.sightline, "");
    }
  }

  for (const n of CUENCA.reservedNegativeSpace) {
    const r = centerToRect(n.center, n.size);
    drawRect(r, 0.01, LABEL_COLORS.negative);
    if (opts.labels) {
      makeLabel(`negative: ${n.id}`, new THREE.Vector3(r.x + r.width / 2, 0.3, r.z + r.depth / 2), LABEL_COLORS.negative, `${r.width}×${r.depth}m`);
    }
  }

  // ---------- Electrical overlay ----------
  const electricalGroup = new THREE.Group();
  electricalGroup.name = "layout-debug-electrical";
  group.add(electricalGroup);
  for (const node of NODES) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 8),
      new THREE.MeshBasicMaterial({ color: LABEL_COLORS.electrical }),
    );
    dot.position.set(node.position.x, node.position.y, node.position.z);
    electricalGroup.add(dot);
    if (opts.labels) {
      makeLabel(`node: ${node.id}`, new THREE.Vector3(node.position.x, node.position.y + 0.8, node.position.z), LABEL_COLORS.electrical, `[${node.position.x}, ${node.position.z}]`);
    }
  }
  for (const cable of CABLES) {
    const a = new THREE.Vector3(cable.from.x, 0.05, cable.from.z);
    const bv = new THREE.Vector3(cable.to.x, 0.05, cable.to.z);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, bv]),
      new THREE.LineBasicMaterial({
        color: cable.state === "broken" ? 0xff6040 : LABEL_COLORS.electrical,
        transparent: true,
        opacity: 0.9,
      }),
    );
    electricalGroup.add(line);
  }

  // ---------- Runtime region rects (what the game actually built) ----------
  const runtimeGroup = new THREE.Group();
  runtimeGroup.name = "layout-debug-runtime";
  group.add(runtimeGroup);
  for (const r of REGIONS) {
    const g = new THREE.BoxGeometry(r.width, 0.05, r.depth);
    const edges = new THREE.EdgesGeometry(g);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x4fd0c0, transparent: true, opacity: 0.6 }),
    );
    line.position.set(r.x + r.width / 2, 0.08, r.z + r.depth / 2);
    runtimeGroup.add(line);
  }

  // Initial visibility.
  setVisible(overlayGroup, opts.overlay);
  setVisible(labelGroup, opts.labels);
  setVisible(electricalGroup, opts.electrical);
  setVisible(runtimeGroup, opts.overlay);

  const enableTop = () => { topOn = true; };
  const disableTop = () => { topOn = false; };
  const isTop = () => topOn;

  return {
    group,
    enableTop,
    disableTop,
    isTop,
    setOverlay: (on) => {
      setVisible(overlayGroup, on);
      setVisible(runtimeGroup, on);
    },
    setLabels: (on) => setVisible(labelGroup, on),
    setElectrical: (on) => setVisible(electricalGroup, on),
  };
}
