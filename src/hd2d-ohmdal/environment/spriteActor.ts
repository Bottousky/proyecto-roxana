// SpriteActor: a 2D sprite plane rendered inside the 3D world.
// Y-billboard (rotates only on the Y axis so the sprite stays vertical and
// always faces the camera horizontally, which preserves the silhouette).
// A contact-shadow disc sits beneath the sprite for grounding.
//
// The sprite atlas is treated as a grid of (totalCols x totalRows) cells.
// Callers specify which cell to show via setCell(col, row). The "direction"
// abstraction is just a convention: for 4-direction atlases where each row is
// a direction, setCell(frame, direction) is the natural call.

import * as THREE from "three";

export class SpriteActor {
  readonly group: THREE.Group;
  readonly mesh: THREE.Mesh;
  readonly material: THREE.MeshBasicMaterial;
  private contactShadow: THREE.Mesh;
  private frameDuration: number;
  private frameTimer = 0;
  private frameIndex = 0;
  private cellX = 0;
  private cellY = 0;
  readonly totalCols: number;
  readonly totalRows: number;
  private baseHeight: number;
  private baseWidth: number;
  // Animation state.
  private playing: "idle" | "walk" | "wave" = "idle";
  private animFrames = 1; // how many columns to cycle through during walk anim
  private animStartCol = 0; // which column the animation starts at
  private _camera: THREE.Camera | null = null;

  constructor(opts: {
    texture: THREE.Texture;
    frameWidth: number;
    frameHeight: number;
    cols: number; // total columns in the atlas
    rows: number; // total rows in the atlas
    pixelArt?: boolean;
    baseHeight?: number;
  }) {
    const {
      texture,
      frameWidth,
      frameHeight,
      cols,
      rows,
      pixelArt = true,
      baseHeight = 1.7,
    } = opts;
    this.totalCols = cols;
    this.totalRows = rows;
    this.frameDuration = 0.16; // ~6 fps pixel-art cycle
    this.baseHeight = baseHeight;
    this.baseWidth = (frameWidth / frameHeight) * baseHeight;

    this.material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: pixelArt ? 0.4 : 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    if (pixelArt) {
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
    this.material.map = texture;

    const geometry = new THREE.PlaneGeometry(this.baseWidth, baseHeight);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = baseHeight / 2;
    this.mesh.renderOrder = 5;

    // Contact shadow: a flat dark disc directly under the feet.
    const shadowGeom = new THREE.CircleGeometry(this.baseWidth * 0.45, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.contactShadow = new THREE.Mesh(shadowGeom, shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = 0.02;
    this.contactShadow.renderOrder = 4;

    this.group = new THREE.Group();
    this.group.add(this.contactShadow);
    this.group.add(this.mesh);

    this.setCell(0, 0);
  }

  setPosition(x: number, y: number) {
    this.group.position.set(x, 0, y);
  }

  // Set the current atlas cell. The atlas is treated as a grid of (totalCols
  // x totalRows) cells, with row 0 at the BOTTOM of the texture and row
  // (totalRows-1) at the TOP. (We map that to UV space where V increases
  // upward.)
  setCell(col: number, row: number) {
    this.cellX = Math.max(0, Math.min(this.totalCols - 1, col));
    this.cellY = Math.max(0, Math.min(this.totalRows - 1, row));
    const map = this.material.map as THREE.Texture;
    map.offset.set(this.cellX / this.totalCols, 1 - (this.cellY + 1) / this.totalRows);
    map.repeat.set(1 / this.totalCols, 1 / this.totalRows);
    map.needsUpdate = true;
  }

  // Set the cell directly. Convenience for callers that think in
  // (direction, frame) terms where direction is the row.
  setDirectionRow(row: number, frame: number) {
    this.setCell(frame, row);
  }

  setDirectionFromVector(dx: number, dy: number) {
    // 4 directions: 0=down (toward camera, -Z), 1=up (+Z), 2=left, 3=right.
    // For 4-direction atlases where each row is a direction, this is what
    // the world wants.
    let dir = 0;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 3 : 2;
    } else {
      dir = dy < 0 ? 0 : 1;
    }
    // Don't reset the walk animation when only the direction changed.
    this.setCell(this.cellX, dir);
  }

  setAnimation(startCol: number, numFrames: number, frameDuration: number = 0.16) {
    this.animStartCol = startCol;
    this.animFrames = Math.max(1, numFrames);
    this.frameDuration = frameDuration;
    this.frameTimer = 0;
    this.frameIndex = 0;
  }

  setPlaying(p: "idle" | "walk" | "wave") {
    this.playing = p;
  }

  update(_dt: number) {
    if (this.playing === "walk" && this.animFrames > 1) {
      this.frameTimer += _dt;
      if (this.frameTimer >= this.frameDuration) {
        this.frameTimer = 0;
        this.frameIndex = (this.frameIndex + 1) % this.animFrames;
      }
      this.setCell(this.animStartCol + this.frameIndex, this.cellY);
    }

    // Subtle bob during walk.
    if (this.playing === "walk") {
      const t = performance.now() * 0.012;
      this.mesh.position.y = this.baseHeight / 2 + Math.abs(Math.sin(t)) * 0.05;
    } else {
      this.mesh.position.y = this.baseHeight / 2;
    }

    // Y-billboard: rotate the sprite's mesh (not the group, so contact shadow stays on ground).
    if (this.group.parent) {
      const cam = this._camera;
      if (cam) {
        const dx = cam.position.x - this.group.position.x;
        const dz = cam.position.z - this.group.position.z;
        const yaw = Math.atan2(dx, dz);
        this.mesh.rotation.set(0, yaw, 0);
      }
    }
  }

  bindCamera(camera: THREE.Camera) {
    this._camera = camera;
  }

  get position(): { x: number; y: number } {
    return { x: this.group.position.x, y: this.group.position.z };
  }

  setHeight(meters: number) {
    const w = (this.baseWidth / this.baseHeight) * meters;
    this.mesh.scale.set(w / this.baseWidth, meters / this.baseHeight, 1);
  }

  setVisible(v: boolean) {
    this.group.visible = v;
  }

  dispose() {
    this.material.dispose();
    if (Array.isArray(this.contactShadow.material)) {
      this.contactShadow.material.forEach((m) => m.dispose());
    } else {
      this.contactShadow.material.dispose();
    }
    this.mesh.geometry.dispose();
    (this.contactShadow as THREE.Mesh).geometry.dispose();
  }
}

export const spriteTexture = (s: SpriteActor): THREE.Texture => s.material.map as THREE.Texture;
