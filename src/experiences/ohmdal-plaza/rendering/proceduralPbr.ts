import * as THREE from 'three';

/**
 * Procedural PBR Texture & Material Generator for Ohmdal HD-2D
 * Generates rich micro-surface normals, roughness maps, ambient occlusion,
 * and realistic weathering (stone, copper verdigris, antique brass, glazed ceramic, wood).
 */

function createNoiseCanvas(width: number, height: number, generator: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  generator(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Procedural Weathered Stone (Cobblestone / Flagstone with moss and chisel marks)
 */
export function createStonePbrMaterial(): THREE.MeshStandardMaterial {
  // 1. Albedo & Moss Texture
  const map = createNoiseCanvas(512, 512, (ctx, w, h) => {
    // Base stone color
    ctx.fillStyle = '#8a7d6e';
    ctx.fillRect(0, 0, w, h);

    // Stone blocks pattern
    const tileSize = 64;
    for (let y = 0; y < h; y += tileSize) {
      for (let x = 0; x < w; x += tileSize) {
        const shade = 120 + Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${shade + 10}, ${shade}, ${shade - 15})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Mortar joint shadows
        ctx.fillStyle = '#3a322a';
        ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Moss spots in crevices
        if (Math.random() > 0.6) {
          ctx.fillStyle = 'rgba(74, 102, 56, 0.45)';
          ctx.beginPath();
          ctx.arc(x + 4, y + 4, 8 + Math.random() * 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  });

  // 2. Normal / Bump Map (chiseled stone relief)
  const bumpMap = createNoiseCanvas(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);

    const tileSize = 64;
    for (let y = 0; y < h; y += tileSize) {
      for (let x = 0; x < w; x += tileSize) {
        // Recessed joints
        ctx.fillStyle = '#202020';
        ctx.strokeRect(x, y, tileSize, tileSize);

        // Slight bevel on block edges
        const grad = ctx.createRadialGradient(x + 32, y + 32, 10, x + 32, y + 32, 32);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#606060');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
      }
    }
  });

  // 3. Roughness Map
  const roughnessMap = createNoiseCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d0d0d0'; // High roughness for matte stone
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i += 1) {
      ctx.fillStyle = Math.random() > 0.5 ? '#a0a0a0' : '#f0f0f0';
      ctx.fillRect(Math.random() * w, Math.random() * h, 4, 4);
    }
  });

  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.04,
    roughnessMap,
    roughness: 0.85,
    metalness: 0.05,
    envMapIntensity: 0.6,
  });
}

/**
 * Procedural Aged Copper with Verdigris Patina
 */
export function createCopperPbrMaterial(isLive = false): THREE.MeshStandardMaterial {
  const map = createNoiseCanvas(256, 256, (ctx, w, h) => {
    // Warm metallic copper base
    ctx.fillStyle = isLive ? '#d88644' : '#b06535';
    ctx.fillRect(0, 0, w, h);

    // Weathered verdigris green streaks on edges
    if (!isLive) {
      for (let i = 0; i < 60; i += 1) {
        ctx.fillStyle = 'rgba(78, 148, 128, 0.4)';
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 6 + Math.random() * 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const roughnessMap = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = isLive ? '#404040' : '#808080'; // Smoother when live/polished
    ctx.fillRect(0, 0, w, h);
  });

  return new THREE.MeshStandardMaterial({
    map,
    roughnessMap,
    roughness: isLive ? 0.32 : 0.55,
    metalness: isLive ? 0.88 : 0.72,
    emissive: isLive ? new THREE.Color(0xf59e42) : new THREE.Color(0x000000),
    emissiveIntensity: isLive ? 0.35 : 0.0,
  });
}

/**
 * Procedural Antique Brass / Bronze (for Bell and Ohm robot)
 */
export function createBrassPbrMaterial(): THREE.MeshStandardMaterial {
  const map = createNoiseCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c59242';
    ctx.fillRect(0, 0, w, h);

    // Subtle hammered metal surface
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(230, 180, 100, 0.25)' : 'rgba(140, 95, 35, 0.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return new THREE.MeshStandardMaterial({
    map,
    roughness: 0.38,
    metalness: 0.82,
  });
}

/**
 * Procedural Glazed Ceramic (Porcelain Insulators)
 */
export function createCeramicPbrMaterial(): THREE.MeshStandardMaterial {
  const map = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#e8e2d4';
    ctx.fillRect(0, 0, w, h);

    // Delicate crackle glaze
    ctx.strokeStyle = 'rgba(160, 150, 135, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i += 1) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }
  });

  return new THREE.MeshStandardMaterial({
    map,
    roughness: 0.16, // High glossy sheen
    metalness: 0.05,
  });
}

/**
 * Procedural Aged Oak Wood (Beams, stalls, gantries)
 */
export function createWoodPbrMaterial(): THREE.MeshStandardMaterial {
  const map = createNoiseCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#523826';
    ctx.fillRect(0, 0, w, h);

    // Wood grain lines
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? 'rgba(55, 36, 22, 0.5)' : 'rgba(98, 70, 48, 0.4)';
      ctx.fillRect(0, y, w, 2);
    }
  });

  return new THREE.MeshStandardMaterial({
    map,
    roughness: 0.74,
    metalness: 0.02,
  });
}
