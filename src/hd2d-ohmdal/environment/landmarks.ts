// Distant landmarks — silhouettes outside the playable area that suggest
// the rest of Ohmdal exists. These are intentionally unlit, fog-tinted
// planes that anchor the world in a larger geography (Castillo de la Red
// to the west, Forja to the east, Faro to the south, mountains and
// future-Arcos spires around the horizon).
//
// Landmarks are placed by world.ts based on LANDMARKS in topology.ts,
// using bearing + distance from the Plaza center.

import * as THREE from "three";
import type { LandmarkDef } from "../world/topology.ts";

const PLAZA_CENTER = { x: 0, z: -3 };

export interface LandmarksEntities {
  group: THREE.Group;
  /** Update animated elements (smoke, lighthouse beam). Called every frame. */
  update: (t: number) => void;
}

export function buildLandmarks(): LandmarksEntities {
  const group = new THREE.Group();
  group.name = "landmarks";

  // Mutable list of (mesh, baseY, drift) for smoke puffs.
  const smokePuffs: { mesh: THREE.Mesh; speed: number; phase: number; baseY: number }[] = [];
  // Mutable list of (lighthouse, phase) for the beam flash.
  const lighthouseBeams: { beam: THREE.Mesh; halo: THREE.Mesh; phase: number; baseIntensity: number }[] = [];

  for (const lm of importLandmarks()) {
    const rad = (lm.bearing * Math.PI) / 180;
    const x = PLAZA_CENTER.x + Math.sin(rad) * lm.distance;
    const z = PLAZA_CENTER.z - Math.cos(rad) * lm.distance;
    const silhouette = buildSilhouette(lm, smokePuffs, lighthouseBeams);
    silhouette.position.set(x, 0, z);
    group.add(silhouette);
  }

  const update = (_t: number) => {
    // Smoke puffs rise and fade.
    for (const puff of smokePuffs) {
      puff.phase = (puff.phase + 0.012) % 1;
      const m = puff.mesh;
      const y = puff.baseY + puff.phase * 6;
      m.position.y = y;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 * (1 - puff.phase) + 0.05;
      const scale = 0.6 + puff.phase * 1.8;
      m.scale.set(scale, scale, scale);
    }
    // Lighthouse beams: periodic flash.
    for (const lb of lighthouseBeams) {
      lb.phase = (lb.phase + 0.008) % 1;
      // The beam brightens twice per cycle (two flashes per rotation).
      const flash = Math.max(
        Math.cos(lb.phase * Math.PI * 4),
        0,
      );
      (lb.halo.material as THREE.MeshBasicMaterial).opacity = 0.18 + 0.5 * flash;
      (lb.beam.material as THREE.MeshBasicMaterial).opacity = 0.6 + 0.4 * flash;
    }
  };

  return { group, update };
}

// Re-imported lazily to keep this module independent of circular wiring.
import { LANDMARKS } from "../world/topology.ts";
function importLandmarks() {
  return LANDMARKS;
}

function buildSilhouette(
  lm: LandmarkDef,
  smokePuffs: { mesh: THREE.Mesh; speed: number; phase: number; baseY: number }[],
  lighthouseBeams: { beam: THREE.Mesh; halo: THREE.Mesh; phase: number }[],
): THREE.Group {
  const grp = new THREE.Group();
  grp.name = lm.id;
  const baseColor = new THREE.Color(lm.color);

  switch (lm.kind) {
    case "mountains": {
      // A wavy ridgeline: 5 peaks using cone/dome shapes.
      const peaks = 5;
      for (let i = 0; i < peaks; i++) {
        const t = (i + 0.5) / peaks;
        const peakHeight = lm.height * (0.55 + 0.45 * Math.sin(t * Math.PI));
        const geom = new THREE.ConeGeometry(lm.width / (peaks * 0.85), peakHeight, 8);
        const mat = new THREE.MeshBasicMaterial({
          color: baseColor.clone().multiplyScalar(1 - i * 0.06),
          transparent: true,
          opacity: 0.92 - i * 0.04,
          depthWrite: false,
        });
        const m = new THREE.Mesh(geom, mat);
        m.position.set(-lm.width / 2 + t * lm.width, peakHeight / 2, 0);
        grp.add(m);
      }
      // Ground band beneath.
      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(lm.width, 4),
        new THREE.MeshBasicMaterial({ color: baseColor.clone().multiplyScalar(0.6), depthWrite: false }),
      );
      band.position.y = 1;
      grp.add(band);
      break;
    }
    case "tower": {
      // A tall, square keep with crenellations.
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(lm.width, lm.height, lm.width * 0.7),
        new THREE.MeshBasicMaterial({ color: baseColor, depthWrite: false }),
      );
      base.position.y = lm.height / 2;
      grp.add(base);
      // Crenellated top.
      for (let i = 0; i < 4; i++) {
        const c = new THREE.Mesh(
          new THREE.BoxGeometry(lm.width * 0.18, 2, lm.width * 0.18),
          new THREE.MeshBasicMaterial({ color: baseColor, depthWrite: false }),
        );
        const x = ((i % 2) * 2 - 1) * (lm.width * 0.4);
        const z = (i < 2 ? -1 : 1) * (lm.width * 0.32);
        c.position.set(x, lm.height + 1, z);
        grp.add(c);
      }
      // Side wall extensions (suggest a fortress).
      const wallL = new THREE.Mesh(
        new THREE.BoxGeometry(6, lm.height * 0.6, 1.2),
        new THREE.MeshBasicMaterial({ color: baseColor.clone().multiplyScalar(0.85), depthWrite: false }),
      );
      wallL.position.set(-lm.width / 2 - 3, lm.height * 0.3, 0);
      grp.add(wallL);
      const wallR = wallL.clone();
      wallR.position.x = lm.width / 2 + 3;
      grp.add(wallR);
      // A small pennant on top of the keep.
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 4, 6),
        new THREE.MeshBasicMaterial({ color: 0x4a3a28, depthWrite: false }),
      );
      pole.position.set(0, lm.height + 4, 0);
      grp.add(pole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1.2),
        new THREE.MeshBasicMaterial({ color: 0x8a3a2a, depthWrite: false, side: THREE.DoubleSide }),
      );
      flag.position.set(1.1, lm.height + 4.5, 0);
      grp.add(flag);
      break;
    }
    case "smoke": {
      // A short industrial silhouette with a tall chimney + animated smoke.
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(lm.width, lm.height * 0.5, lm.width * 0.8),
        new THREE.MeshBasicMaterial({ color: baseColor, depthWrite: false }),
      );
      base.position.y = lm.height * 0.25;
      grp.add(base);
      // A second smaller building attached.
      const building2 = new THREE.Mesh(
        new THREE.BoxGeometry(lm.width * 0.6, lm.height * 0.4, lm.width * 0.6),
        new THREE.MeshBasicMaterial({ color: baseColor.clone().multiplyScalar(0.85), depthWrite: false }),
      );
      building2.position.set(-lm.width * 0.4, lm.height * 0.2, lm.width * 0.2);
      grp.add(building2);
      // Tall chimney.
      const chim = new THREE.Mesh(
        new THREE.BoxGeometry(lm.width * 0.22, lm.height * 0.85, lm.width * 0.22),
        new THREE.MeshBasicMaterial({ color: baseColor.clone().multiplyScalar(1.15), depthWrite: false }),
      );
      chim.position.set(lm.width * 0.2, lm.height * 0.5 + lm.height * 0.425, 0);
      grp.add(chim);
      // Animated smoke puffs above the chimney.
      for (let i = 0; i < 5; i++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(0.9, 10, 8),
          new THREE.MeshBasicMaterial({
            color: 0x4a4a52,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
          }),
        );
        const baseY = lm.height + 1 + i * 0.3;
        puff.position.set(lm.width * 0.2, baseY, 0);
        grp.add(puff);
        smokePuffs.push({
          mesh: puff,
          speed: 0.012 + i * 0.002,
          phase: (i * 0.2) % 1,
          baseY,
        });
      }
      break;
    }
    case "lighthouse": {
      // A cylindrical lighthouse with a periodic beam.
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(lm.width * 0.5, lm.width * 0.7, lm.height * 0.75, 12),
        new THREE.MeshBasicMaterial({ color: baseColor, depthWrite: false }),
      );
      base.position.y = lm.height * 0.375;
      grp.add(base);
      // Mid-section bands.
      for (let i = 0; i < 3; i++) {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(lm.width * 0.55, lm.width * 0.55, 0.3, 12),
          new THREE.MeshBasicMaterial({ color: 0x8a3a2a, depthWrite: false }),
        );
        band.position.y = lm.height * 0.2 + i * lm.height * 0.2;
        grp.add(band);
      }
      // Top section.
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(lm.width * 0.3, lm.width * 0.5, lm.height * 0.2, 12),
        new THREE.MeshBasicMaterial({ color: 0x6a5a4a, depthWrite: false }),
      );
      top.position.y = lm.height * 0.85;
      grp.add(top);
      // Beacon (the light source).
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0.95, depthWrite: false }),
      );
      beacon.position.y = lm.height * 0.97;
      grp.add(beacon);
      // Halo around the beacon.
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.18, depthWrite: false }),
      );
      halo.position.y = lm.height * 0.97;
      grp.add(halo);
      // The light beam (a long cone pointing in one direction).
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(2.0, 14, 8, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xffe0a0,
          transparent: true,
          opacity: 0.6,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      beam.position.set(7, lm.height * 0.97, 0);
      beam.rotation.z = -Math.PI / 2;
      grp.add(beam);
      lighthouseBeams.push({
        beam,
        halo,
        phase: (lm.bearing * 0.07) % 1,
      });
      break;
    }
    case "spires": {
      // A cluster of 3 tall, thin spires.
      for (let i = 0; i < 3; i++) {
        const h = lm.height * (0.6 + 0.4 * (1 - Math.abs(i - 1) * 0.5));
        const sp = new THREE.Mesh(
          new THREE.ConeGeometry(0.9, h, 6),
          new THREE.MeshBasicMaterial({ color: baseColor, depthWrite: false }),
        );
        sp.position.set((i - 1) * 1.6, h / 2, 0);
        grp.add(sp);
      }
      // Base.
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(lm.width, 4, lm.width * 0.6),
        new THREE.MeshBasicMaterial({ color: baseColor.clone().multiplyScalar(0.85), depthWrite: false }),
      );
      base.position.y = 2;
      grp.add(base);
      break;
    }
  }
  return grp;
}

