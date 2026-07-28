import * as THREE from 'three';

export const SCHOOL_PATTERN_MOTIFS = [
  'formula',
  'triangle',
  'ohm',
  'bits',
  'axes',
  'sum',
  'resistor',
  'function',
  'roxana',
  'wave',
] as const;

type MotifName = typeof SCHOOL_PATTERN_MOTIFS[number];

type PatternLayer = {
  texture: THREE.CanvasTexture;
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  opacity: number;
  origin: THREE.Vector2;
  repeat: THREE.Vector2;
  speed: THREE.Vector2;
};

export interface SchoolBackdrop {
  readonly root: THREE.Group;
  readonly layers: number;
  setCompact(compact: boolean): void;
  update(elapsed: number): void;
  dispose(): void;
}

const TILE_WIDTH = 1200;
const TILE_HEIGHT = 240;
const CELL_WIDTH = TILE_WIDTH / SCHOOL_PATTERN_MOTIFS.length;
const COLORS: Record<MotifName, string> = {
  formula: '#7f6334',
  triangle: '#675183',
  ohm: '#3f7465',
  bits: '#396c82',
  axes: '#66517d',
  sum: '#896b38',
  resistor: '#467765',
  function: '#3d6d86',
  roxana: '#814d4a',
  wave: '#526397',
};

function setupStroke(
  context: CanvasRenderingContext2D,
  motif: MotifName,
  width = 3,
): void {
  context.strokeStyle = COLORS[motif];
  context.fillStyle = COLORS[motif];
  context.lineWidth = width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

function drawFormula(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'formula');
  context.font = '600 24px "IBM Plex Mono", Consolas, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('V=I·R', 0, 0);
}

function drawTriangle(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'triangle');
  context.beginPath();
  context.moveTo(0, -25);
  context.lineTo(27, 22);
  context.lineTo(-27, 22);
  context.closePath();
  context.stroke();
  context.beginPath();
  context.arc(0, 4, 5, 0, Math.PI * 2);
  context.stroke();
}

function drawOhm(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'ohm');
  context.font = '500 42px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Ω', 0, 1);
}

function drawBits(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'bits');
  context.font = '600 19px "IBM Plex Mono", Consolas, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('1010', 0, -8);
  context.fillText('0110', 0, 14);
}

function drawAxes(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'axes', 2.5);
  context.beginPath();
  context.moveTo(-28, 18);
  context.lineTo(29, 18);
  context.moveTo(-20, 28);
  context.lineTo(-20, -28);
  context.stroke();
  context.beginPath();
  context.moveTo(-15, 11);
  context.quadraticCurveTo(-1, -26, 25, -9);
  context.stroke();
  context.beginPath();
  context.moveTo(29, 18);
  context.lineTo(23, 14);
  context.moveTo(29, 18);
  context.lineTo(23, 22);
  context.moveTo(-20, -28);
  context.lineTo(-24, -21);
  context.moveTo(-20, -28);
  context.lineTo(-16, -21);
  context.stroke();
}

function drawSum(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'sum');
  context.font = '500 35px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Σn', 0, 0);
}

function drawResistor(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'resistor', 3);
  context.beginPath();
  context.moveTo(-38, 0);
  context.lineTo(-27, 0);
  context.lineTo(-20, -13);
  context.lineTo(-8, 13);
  context.lineTo(4, -13);
  context.lineTo(16, 13);
  context.lineTo(25, 0);
  context.lineTo(38, 0);
  context.stroke();
  context.beginPath();
  context.arc(-41, 0, 3, 0, Math.PI * 2);
  context.arc(41, 0, 3, 0, Math.PI * 2);
  context.fill();
}

function drawFunction(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'function');
  context.font = 'italic 600 27px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('f(x)', 0, 0);
}

function drawSeal(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'roxana', 2.5);
  context.beginPath();
  context.arc(0, 0, 29, 0, Math.PI * 2);
  context.arc(0, 0, 22, 0, Math.PI * 2);
  context.stroke();
  context.font = '600 27px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('R', 0, 1);
}

function drawWave(context: CanvasRenderingContext2D): void {
  setupStroke(context, 'wave', 2.8);
  context.beginPath();
  for (let x = -38; x <= 38; x += 2) {
    const y = Math.sin((x / 76) * Math.PI * 2) * 17;
    if (x === -38) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
}

const DRAW_MOTIF: Record<MotifName, (context: CanvasRenderingContext2D) => void> = {
  formula: drawFormula,
  triangle: drawTriangle,
  ohm: drawOhm,
  bits: drawBits,
  axes: drawAxes,
  sum: drawSum,
  resistor: drawResistor,
  function: drawFunction,
  roxana: drawSeal,
  wave: drawWave,
};

function drawRow(
  context: CanvasRenderingContext2D,
  y: number,
  offset: number,
  motifOffset: number,
): void {
  for (let index = -1; index <= SCHOOL_PATTERN_MOTIFS.length; index += 1) {
    const motif = SCHOOL_PATTERN_MOTIFS[
      (index + motifOffset + SCHOOL_PATTERN_MOTIFS.length) % SCHOOL_PATTERN_MOTIFS.length
    ];
    context.save();
    context.translate(index * CELL_WIDTH + CELL_WIDTH / 2 + offset, y);
    context.rotate(((index + motifOffset) % 3 - 1) * .045);
    DRAW_MOTIF[motif](context);
    context.restore();
  }
}

function createPatternTexture(motifOffset: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_WIDTH;
  canvas.height = TILE_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo crear el patrón de la escuela');

  context.clearRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
  drawRow(context, 58, 0, motifOffset);
  drawRow(context, 178, CELL_WIDTH / 2, motifOffset + 5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = `RX_school_pattern_${motifOffset}`;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function createSchoolBackdrop(
  camera: THREE.Camera,
  reducedMotion: boolean,
): SchoolBackdrop {
  const root = new THREE.Group();
  root.name = 'RX_school_pattern_backdrop';
  root.position.z = -190;
  camera.add(root);

  const baseGeometry = new THREE.PlaneGeometry(340, 230);
  const baseMaterial = new THREE.MeshBasicMaterial({
    color: 0x010204,
    depthTest: true,
    depthWrite: true,
    fog: false,
    toneMapped: false,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.name = 'RX_school_pattern_base';
  base.renderOrder = -100;
  root.add(base);

  const layerSpecs = [
    { repeat: [13.5, 38] as const, opacity: .18, offset: [.11, .07] as const, speed: [.00075, -.00018] as const },
    { repeat: [10.5, 30] as const, opacity: .46, offset: [.02, .18] as const, speed: [-.00105, .00022] as const },
    { repeat: [8, 23] as const, opacity: .16, offset: [.28, .32] as const, speed: [.00135, .00016] as const },
  ];

  const layers = layerSpecs.map((spec, index): PatternLayer => {
    const texture = createPatternTexture(index * 2);
    texture.repeat.set(spec.repeat[0], spec.repeat[1]);
    texture.offset.set(spec.offset[0], spec.offset[1]);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: spec.opacity,
      depthTest: true,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(340, 230), material);
    mesh.name = `RX_school_pattern_layer_${index + 1}`;
    mesh.position.z = .12 + index * .08;
    mesh.renderOrder = -99 + index;
    root.add(mesh);
    return {
      texture,
      material,
      mesh,
      opacity: spec.opacity,
      origin: new THREE.Vector2(spec.offset[0], spec.offset[1]),
      repeat: new THREE.Vector2(spec.repeat[0], spec.repeat[1]),
      speed: new THREE.Vector2(spec.speed[0], spec.speed[1]),
    };
  });

  return {
    root,
    layers: layers.length,
    setCompact(compact: boolean): void {
      const density = compact ? .54 : 1;
      layers.forEach((layer) => {
        layer.texture.repeat.copy(layer.repeat).multiplyScalar(density);
        layer.material.opacity = Math.min(.74, layer.opacity * (compact ? 1.65 : 1));
      });
    },
    update(elapsed: number): void {
      if (reducedMotion) return;
      layers.forEach((layer) => {
        layer.texture.offset.set(
          layer.origin.x + elapsed * layer.speed.x,
          layer.origin.y + elapsed * layer.speed.y,
        );
      });
    },
    dispose(): void {
      baseGeometry.dispose();
      baseMaterial.dispose();
      layers.forEach((layer) => {
        layer.mesh.geometry.dispose();
        layer.material.dispose();
        layer.texture.dispose();
      });
      root.removeFromParent();
    },
  };
}
