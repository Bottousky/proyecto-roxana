// Procedural textures for the greenfield world.
// We generate canvas-based textures so we don't depend on external image assets
// for the first pass. Each texture is repeated across InstancedMesh / large planes.

import * as THREE from "three";

export interface ProceduralTextures {
  plazaFloor: THREE.Texture;
  stoneWall: THREE.Texture;
  copperTrim: THREE.Texture;
  moss: THREE.Texture;
  water: THREE.Texture;
  cable: THREE.Texture;
  portalGlow: THREE.Texture;
}

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};

const setRepeat = (tex: THREE.Texture, repeat: [number, number]) => {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 4;
};

const seedRandom = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
};

// Plaza floor: large stone slabs with joints, slight color variation.
function createPlazaFloorTexture(): THREE.Texture {
  const size = 512;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const rng = seedRandom(1234);

  // Base: warm cool stone.
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#3a4654");
  grad.addColorStop(0.5, "#3a4654");
  grad.addColorStop(1, "#2f3a48");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Speckle noise for "weathered stone" feel.
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rng() - 0.5) * 18;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  // Slab joints: large grid of irregular rectangles.
  ctx.strokeStyle = "rgba(10, 14, 20, 0.6)";
  ctx.lineWidth = 2;
  const slabW = 64;
  const slabH = 64;
  for (let y = 0; y < size; y += slabH) {
    for (let x = 0; x < size; x += slabW) {
      const ox = (rng() - 0.5) * 6;
      const oy = (rng() - 0.5) * 6;
      ctx.strokeRect(x + ox + 1, y + oy + 1, slabW - 2, slabH - 2);
    }
  }
  // Faint copper traces: very subtle hints of electrical paths.
  ctx.strokeStyle = "rgba(168, 120, 80, 0.05)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      ctx.lineTo(x + (rng() - 0.5) * 80, y + (rng() - 0.5) * 80);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  setRepeat(tex, [4, 4]);
  return tex;
}

// Stone wall: vertical block pattern with chiseled highlights.
function createStoneWallTexture(): THREE.Texture {
  const size = 512;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const rng = seedRandom(7777);

  // Base
  ctx.fillStyle = "#2a3540";
  ctx.fillRect(0, 0, size, size);

  // Brick pattern (large blocks).
  const bw = 96;
  const bh = 64;
  for (let y = 0, row = 0; y < size; y += bh, row++) {
    const xOff = row % 2 === 0 ? 0 : bw / 2;
    for (let x = -xOff; x < size; x += bw) {
      const shade = Math.floor(40 + rng() * 30);
      const r = 0x3a + shade;
      const g = 0x46 + shade;
      const b = 0x54 + shade;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      const ox = (rng() - 0.5) * 2;
      const oy = (rng() - 0.5) * 2;
      ctx.fillRect(x + ox, y + oy, bw - 4, bh - 4);

      // Top highlight.
      ctx.fillStyle = "rgba(180, 190, 210, 0.10)";
      ctx.fillRect(x + ox, y + oy, bw - 4, 4);
      // Bottom shadow.
      ctx.fillStyle = "rgba(10, 14, 20, 0.4)";
      ctx.fillRect(x + ox, y + oy + bh - 8, bw - 4, 4);
    }
  }

  // Wear streaks (water marks).
  ctx.strokeStyle = "rgba(20, 26, 36, 0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const x = rng() * size;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (rng() - 0.5) * 8, size);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  setRepeat(tex, [2, 1]);
  return tex;
}

// Copper trim: warm patina with verdigris.
function createCopperTrimTexture(): THREE.Texture {
  const size = 256;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const rng = seedRandom(4242);

  ctx.fillStyle = "#7a5232";
  ctx.fillRect(0, 0, size, size);

  // Patina blotches.
  for (let i = 0; i < 40; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 4 + rng() * 18;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(80, 140, 110, 0.45)");
    grad.addColorStop(1, "rgba(80, 140, 110, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Scratches.
  ctx.strokeStyle = "rgba(232, 160, 80, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const x = rng() * size;
    const y = rng() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 30, y + (rng() - 0.5) * 30);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  setRepeat(tex, [4, 1]);
  return tex;
}

// Moss ground: tufts of green on dark soil.
function createMossTexture(): THREE.Texture {
  const size = 256;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const rng = seedRandom(9090);

  ctx.fillStyle = "#1a2018";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 1 + rng() * 3;
    ctx.fillStyle = `rgba(${40 + rng() * 40}, ${80 + rng() * 60}, ${40 + rng() * 30}, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  setRepeat(tex, [8, 8]);
  return tex;
}

// Water: animated blue surface with subtle noise.
function createWaterTexture(): THREE.Texture {
  const size = 256;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const rng = seedRandom(3131);

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#1a2530");
  grad.addColorStop(1, "#0e1620");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 80; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 2 + rng() * 6;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(122, 176, 200, 0.18)");
    g.addColorStop(1, "rgba(122, 176, 200, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  setRepeat(tex, [2, 2]);
  return tex;
}

// Cable: long thin strip with copper segments.
function createCableTexture(): THREE.Texture {
  const size = 64;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const rng = seedRandom(8181);

  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#7a5232" : "#a87850";
    ctx.fillRect(0, i * 8, size, 8);
  }
  for (let i = 0; i < 8; i++) {
    const x = rng() * size;
    ctx.fillStyle = "rgba(20, 14, 10, 0.5)";
    ctx.fillRect(x, i * 8, 2, 8);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  setRepeat(tex, [8, 1]);
  return tex;
}

// Portal glow: warm radial gradient.
function createPortalGlowTexture(): THREE.Texture {
  const size = 256;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "rgba(255, 244, 216, 0.95)");
  grad.addColorStop(0.3, "rgba(232, 160, 80, 0.7)");
  grad.addColorStop(0.7, "rgba(168, 120, 80, 0.3)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createProceduralTextures(): ProceduralTextures {
  return {
    plazaFloor: createPlazaFloorTexture(),
    stoneWall: createStoneWallTexture(),
    copperTrim: createCopperTrimTexture(),
    moss: createMossTexture(),
    water: createWaterTexture(),
    cable: createCableTexture(),
    portalGlow: createPortalGlowTexture(),
  };
}
