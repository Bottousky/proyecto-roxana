import * as THREE from 'three';

/**
 * Herramientas de malla para tallar la estatua como una superficie continua.
 *
 * Apilar primitivas (elipsoides, cilindros, cajas) se ve como lo que es: pedazos
 * pegados, con costuras donde un volumen entra en otro. La referencia es una
 * talla facetada, o sea UNA superficie. Estas funciones generan esa superficie
 * a partir de secciones transversales y la rompen en facetas al final.
 */

export type LoftRing = {
  y: number;
  halfWidth: number;
  halfDepth: number;
  /** 0 = elipse pura · 1 = casi rectángulo redondeado. Da planos de talla. */
  squareness?: number;
  offsetX?: number;
  offsetZ?: number;
};

function superExponent(squareness = 0): number {
  return 2 / (2 + 3 * Math.max(0, Math.min(1, squareness)));
}

function ringPoint(ring: LoftRing, angle: number, target: THREE.Vector3): THREE.Vector3 {
  const exponent = superExponent(ring.squareness);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return target.set(
    (ring.offsetX ?? 0) + ring.halfWidth * Math.sign(cos) * Math.abs(cos) ** exponent,
    ring.y,
    (ring.offsetZ ?? 0) + ring.halfDepth * Math.sign(sin) * Math.abs(sin) ** exponent,
  );
}

/** Superficie de revolución generalizada: secciones apiladas y unidas con quads. */
export function buildLoft(rings: LoftRing[], segments = 18): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const scratch = new THREE.Vector3();
  const minY = Math.min(...rings.map((ring) => ring.y));
  const height = Math.max(1e-6, Math.max(...rings.map((ring) => ring.y)) - minY);

  for (const ring of rings) {
    for (let index = 0; index < segments; index += 1) {
      ringPoint(ring, (index / segments) * Math.PI * 2, scratch);
      positions.push(scratch.x, scratch.y, scratch.z);
      uvs.push(index / segments, (ring.y - minY) / height);
    }
  }

  for (let row = 0; row < rings.length - 1; row += 1) {
    for (let index = 0; index < segments; index += 1) {
      const next = (index + 1) % segments;
      const a = row * segments + index;
      const b = row * segments + next;
      const c = (row + 1) * segments + next;
      const d = (row + 1) * segments + index;
      indices.push(a, d, c, a, c, b);
    }
  }

  // Tapas: abanico desde el centro de la primera y la última sección.
  const first = rings[0];
  const last = rings[rings.length - 1];
  const bottomCenter = positions.length / 3;
  positions.push(first.offsetX ?? 0, first.y, first.offsetZ ?? 0);
  uvs.push(.5, 0);
  for (let index = 0; index < segments; index += 1) {
    indices.push(bottomCenter, (index + 1) % segments, index);
  }
  const topCenter = positions.length / 3;
  positions.push(last.offsetX ?? 0, last.y, last.offsetZ ?? 0);
  uvs.push(.5, 1);
  const topRow = (rings.length - 1) * segments;
  for (let index = 0; index < segments; index += 1) {
    indices.push(topCenter, topRow + index, topRow + (index + 1) % segments);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

export type TubeSample = {
  point: THREE.Vector3;
  radiusX: number;
  radiusZ?: number;
  squareness?: number;
};

/**
 * Tubo de sección variable a lo largo de un camino, con transporte paralelo del
 * marco para que no se retuerza. Los brazos salen de acá: un miembro que se
 * afina con codo real, no cilindros apilados.
 */
export function buildTube(samples: TubeSample[], segments = 10): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const tangents = samples.map((_, index) => {
    const previous = samples[Math.max(0, index - 1)].point;
    const next = samples[Math.min(samples.length - 1, index + 1)].point;
    const tangent = next.clone().sub(previous);
    if (tangent.lengthSq() < 1e-10) tangent.set(0, -1, 0);
    return tangent.normalize();
  });

  let right = new THREE.Vector3(1, 0, 0);
  if (Math.abs(tangents[0].dot(right)) > .9) right.set(0, 0, 1);
  right.sub(tangents[0].clone().multiplyScalar(right.dot(tangents[0]))).normalize();

  for (let index = 0; index < samples.length; index += 1) {
    const tangent = tangents[index];
    // Transporte paralelo: reproyectar el marco anterior sobre el plano nuevo.
    right = right.clone().sub(tangent.clone().multiplyScalar(right.dot(tangent)));
    if (right.lengthSq() < 1e-8) {
      right = new THREE.Vector3(1, 0, 0).sub(tangent.clone().multiplyScalar(tangent.x));
    }
    right.normalize();
    const up = new THREE.Vector3().crossVectors(tangent, right).normalize();

    const sample = samples[index];
    const radiusZ = sample.radiusZ ?? sample.radiusX;
    const exponent = superExponent(sample.squareness ?? .25);
    for (let step = 0; step < segments; step += 1) {
      const angle = (step / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = sample.radiusX * Math.sign(cos) * Math.abs(cos) ** exponent;
      const y = radiusZ * Math.sign(sin) * Math.abs(sin) ** exponent;
      positions.push(
        sample.point.x + right.x * x + up.x * y,
        sample.point.y + right.y * x + up.y * y,
        sample.point.z + right.z * x + up.z * y,
      );
      uvs.push(step / segments, index / Math.max(1, samples.length - 1));
    }
  }

  for (let row = 0; row < samples.length - 1; row += 1) {
    for (let step = 0; step < segments; step += 1) {
      const next = (step + 1) % segments;
      const a = row * segments + step;
      const b = row * segments + next;
      const c = (row + 1) * segments + next;
      const d = (row + 1) * segments + step;
      indices.push(a, d, c, a, c, b);
    }
  }

  const capStart = positions.length / 3;
  positions.push(samples[0].point.x, samples[0].point.y, samples[0].point.z);
  uvs.push(.5, 0);
  for (let step = 0; step < segments; step += 1) {
    indices.push(capStart, (step + 1) % segments, step);
  }
  const capEnd = positions.length / 3;
  const tail = samples[samples.length - 1].point;
  positions.push(tail.x, tail.y, tail.z);
  uvs.push(.5, 1);
  const tailRow = (samples.length - 1) * segments;
  for (let step = 0; step < segments; step += 1) {
    indices.push(capEnd, tailRow + step, tailRow + (step + 1) % segments);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function hash(x: number, y: number, z: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Desordena levemente los vértices y desindexa la malla para que cada triángulo
 * tenga su propia normal. Es lo que convierte una superficie lisa en piedra
 * tallada: sin esto, un loft se lee como plástico torneado.
 */
export function facet(
  geometry: THREE.BufferGeometry,
  amount: number,
  options: { scaleByRadius?: boolean; reference?: number } = {},
): THREE.BufferGeometry {
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const reference = options.reference ?? .45;
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    // Una amplitud fija pica igual una falda de radio 0.45 que una cabeza de
    // radio 0.15, y en la cabeza eso es un 8%: deforma la cara y deja asomar los
    // detalles que van justo bajo la superficie. El picado sigue al tamaño local.
    const local = options.scaleByRadius
      ? Math.min(1, Math.max(.22, Math.hypot(x, z) / reference))
      : 1;
    const scaled = amount * local;
    position.setXYZ(
      index,
      x + (hash(x, y, z) - .5) * scaled,
      y + (hash(y, z, x) - .5) * scaled * .6,
      z + (hash(z, x, y) - .5) * scaled,
    );
  }
  position.needsUpdate = true;
  const flat = geometry.toNonIndexed();
  flat.computeVertexNormals();
  geometry.dispose();
  return flat;
}
