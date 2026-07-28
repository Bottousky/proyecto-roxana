import {
  SCHOOL_GRID,
  VOXEL_ROOMS,
  gridToIso,
  isoToGrid,
  zoneAtCell,
  type VoxelRoom,
  type VoxelZoneId,
} from './voxelSchoolModel.ts';

interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
  zoneId: VoxelZoneId;
}

interface CameraState { offsetX: number; offsetY: number; zoom: number; }

const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;
const VOXEL_HEIGHT = 12;
const WALL = '#494451';
const WALL_DARK = '#34313b';
const WOOD = '#74533c';
const PAPER = '#d9c69d';

function shade(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const value = Number.parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255].map((channel) => {
    const next = amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(next)));
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function addBox(voxels: Voxel[], room: VoxelRoom, x: number, y: number, z: number, width: number, depth: number, height: number, color: string): void {
  for (let dx = 0; dx < width; dx += 1) for (let dy = 0; dy < depth; dy += 1) for (let dz = 0; dz < height; dz += 1) {
    voxels.push({ x: x + dx, y: y + dy, z: z + dz, color, zoneId: room.id });
  }
}

function addPerson(voxels: Voxel[], room: VoxelRoom, x: number, y: number, color: string): void {
  addBox(voxels, room, x, y, 1, 1, 1, 2, color);
  addBox(voxels, room, x, y, 3, 1, 1, 1, '#c99166');
}

function addRoomProps(voxels: Voxel[], room: VoxelRoom): void {
  const x = room.x;
  const y = room.y;
  const w = room.width;
  const d = room.depth;

  if (room.kind === 'hall') {
    addBox(voxels, room, x + 5, y + 3, 1, 2, 2, 1, '#5b5564');
    addBox(voxels, room, x + 5, y + 3, 2, 2, 2, 2, '#8b7866');
    addBox(voxels, room, x + 5, y + 3, 4, 2, 2, 1, '#c29b57');
    addBox(voxels, room, x + 2, y + 5, 1, 3, 1, 1, WOOD);
    addBox(voxels, room, x + 7, y + 1, 1, 3, 1, 1, WOOD);
  } else if (room.kind === 'classroom') {
    addBox(voxels, room, x + 1, y, 2, Math.max(2, w - 2), 1, 1, shade(room.accent, -0.32));
    for (let row = 0; row < 2; row += 1) {
      addBox(voxels, room, x + 1, y + 2 + row * 2, 1, Math.max(1, w - 2), 1, 1, WOOD);
    }
    if (room.id === 'electronica') {
      addBox(voxels, room, x + w - 2, y + 1, 1, 1, 1, 3, '#47b9ad');
      addBox(voxels, room, x + w - 2, y + 1, 4, 1, 1, 1, '#ffd34d');
    }
  } else if (room.kind === 'library') {
    for (let row = 1; row < d - 1; row += 2) addBox(voxels, room, x + 1, y + row, 1, w - 2, 1, 3, '#654736');
    addBox(voxels, room, x + w - 2, y + d - 2, 1, 1, 1, 1, PAPER);
  } else if (room.kind === 'theater') {
    for (let row = 1; row < 5; row += 1) addBox(voxels, room, x + 1, y + row, 1, w - 2, 1, Math.min(3, row), shade(room.accent, -0.45));
    addBox(voxels, room, x + 3, y, 2, w - 6, 1, 3, '#d5c9b8');
  } else if (room.kind === 'achievements') {
    addBox(voxels, room, x + 1, y + 1, 1, w - 2, 1, 3, '#705b3e');
    for (let col = 1; col < w - 1; col += 2) addBox(voxels, room, x + col, y + 1, 4, 1, 1, 1, '#efc45b');
    addBox(voxels, room, x + 1, y + d - 2, 1, w - 2, 1, 2, '#574a3b');
  } else if (room.kind === 'office') {
    addBox(voxels, room, x + 1, y + 2, 1, w - 2, 2, 1, WOOD);
    addBox(voxels, room, x + 1, y, 1, 1, d - 2, 3, '#5e4639');
    addBox(voxels, room, x + 2, y + 2, 2, 1, 1, 1, PAPER);
  } else if (room.kind === 'reception') {
    addBox(voxels, room, x + 1, y + 2, 1, w - 2, 1, 2, WOOD);
    addPerson(voxels, room, x + 2, y + 1, '#56617a');
    addBox(voxels, room, x + w - 2, y + 2, 3, 1, 1, 1, PAPER);
  } else if (room.kind === 'shop') {
    addBox(voxels, room, x + 2, y + 2, 1, w - 4, 2, 2, '#72523b');
    for (let col = 3; col < w - 2; col += 2) addBox(voxels, room, x + col, y + 2, 3, 1, 1, 1, room.accent);
  }
}

function buildVoxels(): Voxel[] {
  const voxels: Voxel[] = [];
  for (const room of VOXEL_ROOMS) {
    for (let dx = 0; dx < room.width; dx += 1) for (let dy = 0; dy < room.depth; dy += 1) {
      const checker = (dx + dy) % 2 === 0 ? room.floor : shade(room.floor, 0.045);
      voxels.push({ x: room.x + dx, y: room.y + dy, z: 0, color: checker, zoneId: room.id });
    }
    for (let dx = 0; dx < room.width; dx += 1) for (let z = 1; z <= 3; z += 1) {
      voxels.push({ x: room.x + dx, y: room.y, z, color: z === 1 ? WALL_DARK : WALL, zoneId: room.id });
    }
    for (let dy = 1; dy < room.depth; dy += 1) for (let z = 1; z <= 3; z += 1) {
      voxels.push({ x: room.x, y: room.y + dy, z, color: z === 1 ? WALL_DARK : WALL, zoneId: room.id });
    }
    addRoomProps(voxels, room);
  }
  return voxels.sort((a, b) => (a.x + a.y - (b.x + b.y)) || (a.z - b.z) || (a.x - b.x));
}

export class VoxelSchoolRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly voxels = buildVoxels();
  private readonly camera: CameraState = { offsetX: 0, offsetY: 0, zoom: 1 };
  private selected: VoxelZoneId = 'hall';
  private hovered: VoxelZoneId | null = null;
  private dragStart: { x: number; y: number; offsetX: number; offsetY: number } | null = null;
  private didDrag = false;
  private resizeObserver: ResizeObserver;
  private onSelect: (room: VoxelRoom) => void;

  constructor(private readonly canvas: HTMLCanvasElement, onSelect: (room: VoxelRoom) => void) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D no disponible');
    this.context = context;
    this.onSelect = onSelect;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.bindEvents();
    this.resize();
  }

  select(id: VoxelZoneId, notify = false): void {
    this.selected = id;
    this.draw();
    if (notify) {
      const room = VOXEL_ROOMS.find((candidate) => candidate.id === id);
      if (room) this.onSelect(room);
    }
  }

  destroy(): void { this.resizeObserver.disconnect(); }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.canvas.setPointerCapture(event.pointerId);
      this.dragStart = { x: event.clientX, y: event.clientY, offsetX: this.camera.offsetX, offsetY: this.camera.offsetY };
      this.didDrag = false;
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (this.dragStart) {
        const dx = event.clientX - this.dragStart.x;
        const dy = event.clientY - this.dragStart.y;
        if (Math.abs(dx) + Math.abs(dy) > 5) this.didDrag = true;
        this.camera.offsetX = this.dragStart.offsetX + dx;
        this.camera.offsetY = this.dragStart.offsetY + dy;
        this.canvas.classList.toggle('is-dragging', this.didDrag);
        this.draw();
        return;
      }
      const room = this.roomFromPointer(event);
      const next = room?.id ?? null;
      if (next !== this.hovered) { this.hovered = next; this.draw(); }
    });
    const release = (event: PointerEvent) => {
      const room = !this.didDrag ? this.roomFromPointer(event) : null;
      this.dragStart = null;
      this.canvas.classList.remove('is-dragging');
      if (room) this.select(room.id, true);
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', () => { this.dragStart = null; this.canvas.classList.remove('is-dragging'); });
    this.canvas.addEventListener('pointerleave', () => { if (!this.dragStart) { this.hovered = null; this.draw(); } });
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const beforeX = (px - this.camera.offsetX) / this.camera.zoom;
      const beforeY = (py - this.camera.offsetY) / this.camera.zoom;
      this.camera.zoom = Math.max(0.58, Math.min(1.85, this.camera.zoom * (event.deltaY < 0 ? 1.1 : 0.9)));
      this.camera.offsetX = px - beforeX * this.camera.zoom;
      this.camera.offsetY = py - beforeY * this.camera.zoom;
      this.draw();
    }, { passive: false });
  }

  private roomFromPointer(event: PointerEvent): VoxelRoom | null {
    const rect = this.canvas.getBoundingClientRect();
    const worldX = (event.clientX - rect.left - this.camera.offsetX) / this.camera.zoom;
    const worldY = (event.clientY - rect.top - this.camera.offsetY) / this.camera.zoom;
    const cell = isoToGrid(worldX, worldY, TILE_WIDTH, TILE_HEIGHT);
    return zoneAtCell(Math.floor(cell.x), Math.floor(cell.y));
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const center = gridToIso(SCHOOL_GRID.width / 2, SCHOOL_GRID.depth / 2, 0, TILE_WIDTH, TILE_HEIGHT, VOXEL_HEIGHT);
    const compact = window.innerWidth <= 820;
    this.camera.zoom = compact
      ? Math.max(0.46, Math.min(0.92, rect.width / 760))
      : Math.max(0.68, Math.min(1.28, rect.width / 680));
    this.camera.offsetX = rect.width / 2 - center.x * this.camera.zoom;
    this.camera.offsetY = rect.height * 0.5 - center.y * this.camera.zoom;
    this.draw();
  }

  private drawCube(voxel: Voxel, highlighted: boolean): void {
    const ctx = this.context;
    const point = gridToIso(voxel.x, voxel.y, voxel.z, TILE_WIDTH, TILE_HEIGHT, VOXEL_HEIGHT);
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;
    const lift = VOXEL_HEIGHT;
    const base = highlighted ? shade(voxel.color, 0.16) : voxel.color;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x + halfW, point.y + halfH);
    ctx.lineTo(point.x, point.y + TILE_HEIGHT);
    ctx.lineTo(point.x - halfW, point.y + halfH);
    ctx.closePath();
    ctx.fillStyle = shade(base, 0.14);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point.x + halfW, point.y + halfH);
    ctx.lineTo(point.x + halfW, point.y + halfH + lift);
    ctx.lineTo(point.x, point.y + TILE_HEIGHT + lift);
    ctx.lineTo(point.x, point.y + TILE_HEIGHT);
    ctx.closePath();
    ctx.fillStyle = shade(base, -0.08);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point.x - halfW, point.y + halfH);
    ctx.lineTo(point.x, point.y + TILE_HEIGHT);
    ctx.lineTo(point.x, point.y + TILE_HEIGHT + lift);
    ctx.lineTo(point.x - halfW, point.y + halfH + lift);
    ctx.closePath();
    ctx.fillStyle = shade(base, -0.22);
    ctx.fill();
  }

  private draw(): void {
    const ctx = this.context;
    const rect = this.canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, '#17141d');
    gradient.addColorStop(1, '#0d0c11');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.save();
    ctx.translate(this.camera.offsetX, this.camera.offsetY);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.shadowColor = 'rgba(0,0,0,.3)';
    ctx.shadowBlur = 8 / this.camera.zoom;
    ctx.shadowOffsetY = 8 / this.camera.zoom;
    for (const voxel of this.voxels) {
      this.drawCube(voxel, voxel.zoneId === this.selected || voxel.zoneId === this.hovered);
    }
    ctx.shadowColor = 'transparent';
    for (const room of VOXEL_ROOMS) {
      const center = gridToIso(room.x + room.width / 2, room.y + room.depth / 2, 5, TILE_WIDTH, TILE_HEIGHT, VOXEL_HEIGHT);
      const active = room.id === this.selected || room.id === this.hovered;
      const screenFontSize = active ? (window.innerWidth <= 520 ? 9 : 12) : (window.innerWidth <= 520 ? 7.5 : 10);
      const fontSize = screenFontSize / this.camera.zoom;
      const labelHeight = 21 / this.camera.zoom;
      ctx.font = `${active ? 700 : 600} ${fontSize}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const width = ctx.measureText(room.shortTitle.toUpperCase()).width + 14 / this.camera.zoom;
      ctx.fillStyle = active ? 'rgba(255,211,77,.94)' : 'rgba(14,13,18,.82)';
      ctx.fillRect(center.x - width / 2, center.y - labelHeight / 2, width, labelHeight);
      ctx.fillStyle = active ? '#1a1408' : '#e8e2d4';
      ctx.fillText(room.shortTitle.toUpperCase(), center.x, center.y + 1 / this.camera.zoom);
    }
    ctx.restore();
  }
}
