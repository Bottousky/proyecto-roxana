/**
 * World — owns the tilemap, NPC paths, and interactable positions.
 *
 * The world renders in multiple layers: floor (tilemap), cables
 * (electrical graph overlay), props back, NPCs, player, props front,
 * foreground (occlusion). Each layer has its own render method called
 * by Game.render.
 *
 * NPC paths are simple waypoint cycles. NPCs walk to the next
 * waypoint and pause briefly.
 */

import type { WorldTopology, NPCDef, InteractableDef } from '../data/types.ts';
import type { Camera } from './Camera.ts';
import type { ElectricalGraph } from './ElectricalGraph.ts';
import { Tile } from '../data/types.ts';

export type SpriteProvider = (name: string) => HTMLImageElement | undefined;

export class World {
  public topology: WorldTopology;
  public npcs: NPCDef[];
  public interactables: InteractableDef[];
  public electrical: ElectricalGraph | null = null;
  private spriteProvider: SpriteProvider = () => undefined;

  // Per-NPC runtime state
  private npcPositions: Map<string, { x: number; y: number; targetIdx: number; wait: number; facing: number }> = new Map();
  private npcSpeeds: Map<string, number> = new Map();

  constructor(topology: WorldTopology, _tileImages: any) {
    this.topology = topology;
    this.npcs = topology.npcs;
    this.interactables = topology.interactables;
    for (const npc of this.npcs) {
      this.npcPositions.set(npc.id, { x: npc.x, y: npc.y, targetIdx: 0, wait: 0, facing: 0 });
      this.npcSpeeds.set(npc.id, 1.0); // tiles per second
    }
  }

  setSpriteProvider(provider: SpriteProvider): void {
    this.spriteProvider = provider;
  }

  setElectrical(electrical: ElectricalGraph): void {
    this.electrical = electrical;
  }

  isEnergizedNode(nodeId: string | undefined): boolean {
    if (!nodeId || !this.electrical) return false;
    return this.electrical.isEnergizedNode(nodeId);
  }

  /**
   * Tile collision query.
   */
  isSolid(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.topology.width || ty >= this.topology.height) return true;
    return this.topology.collision[ty * this.topology.width + tx] === 1;
  }

  findInteractable(id: string): InteractableDef | undefined {
    return this.interactables.find((i) => i.id === id);
  }

  findNPC(id: string): NPCDef | undefined {
    return this.npcs.find((n) => n.id === id);
  }

  updateNPCs(dt: number, _time: number): void {
    for (const npc of this.npcs) {
      if (!npc.path || npc.path.length === 0) continue;
      const pos = this.npcPositions.get(npc.id)!;
      const speed = this.npcSpeeds.get(npc.id) ?? 1.0;
      if (pos.wait > 0) {
        pos.wait -= dt;
        continue;
      }
      const target = npc.path[pos.targetIdx];
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.05) {
        pos.wait = 1.5 + Math.random() * 1.5;
        pos.targetIdx = (pos.targetIdx + 1) % npc.path.length;
        continue;
      }
      const move = Math.min(speed * dt, dist);
      pos.x += (dx / dist) * move;
      pos.y += (dy / dist) * move;
    }
  }

  /* ============================================================== */
  /* Render layers                                                   */
  /* ============================================================== */

  renderFloor(ctx: CanvasRenderingContext2D, cam: Camera): void {
    const vp = cam.getViewportInTiles();
    const cx = cam.getTransform().x;
    const cy = cam.getTransform().y;
    const startX = Math.max(0, Math.floor(cx - vp.w / 2 - 1));
    const startY = Math.max(0, Math.floor(cy - vp.h / 2 - 1));
    const endX = Math.min(this.topology.width, Math.ceil(cx + vp.w / 2 + 1));
    const endY = Math.min(this.topology.height, Math.ceil(cy + vp.h / 2 + 1));
    const tileSize = this.topology.tileSize;

    // Procedural rendering (AI tileset doesn't map cleanly to our enum)
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = this.topology.tiles[y * this.topology.width + x];
        this.drawTile(ctx, tile, x, y, tileSize);
      }
    }
  }

  private drawTile(ctx: CanvasRenderingContext2D, tile: number, x: number, y: number, _size: number): void {
    // Procedural tile rendering. Each tile type has a deterministic
    // visual based on its position.
    const px = x;
    const py = y;
    switch (tile) {
      case Tile.STONE_BASE:
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py, 1, 1);
        // Add a subtle noise
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = '#2a3540';
          ctx.fillRect(px + 0.25, py + 0.25, 0.5, 0.5);
        }
        break;
      case Tile.STONE_DARK:
        ctx.fillStyle = '#2a3540';
        ctx.fillRect(px, py, 1, 1);
        break;
      case Tile.STONE_LIGHT:
        ctx.fillStyle = '#525e6e';
        ctx.fillRect(px, py, 1, 1);
        break;
      case Tile.STONE_WARM:
        ctx.fillStyle = '#5a4a38';
        ctx.fillRect(px, py, 1, 1);
        break;
      case Tile.STONE_CRACK_1:
      case Tile.STONE_CRACK_2:
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#1a2230';
        ctx.fillRect(px + 0.3, py + 0.4, 0.05, 0.4);
        break;
      case Tile.PAVING_A:
        ctx.fillStyle = '#4a5664';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py, 1, 0.05);
        ctx.fillRect(px, py, 0.05, 1);
        break;
      case Tile.PAVING_C:
        ctx.fillStyle = '#525e6e';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py + 0.5, 1, 0.05);
        break;
      case Tile.PAVING_CENTER:
        ctx.fillStyle = '#5a6878';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px + 0.2, py + 0.2, 0.6, 0.05);
        ctx.fillRect(px + 0.2, py + 0.2, 0.05, 0.6);
        break;
      case Tile.PAVING_RING:
        ctx.fillStyle = '#4a5664';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#7a8a98';
        ctx.fillRect(px + 0.45, py + 0.45, 0.1, 0.1);
        break;
      case Tile.GRASS_DRY:
      case Tile.GRASS_DEAD:
        ctx.fillStyle = '#3a4530';
        ctx.fillRect(px, py, 1, 1);
        if ((x * 7 + y * 13) % 5 === 0) {
          ctx.fillStyle = '#2a3528';
          ctx.fillRect(px + 0.2, py + 0.2, 0.1, 0.1);
        }
        break;
      case Tile.GRASS_LIVING:
        ctx.fillStyle = '#5a7a48';
        ctx.fillRect(px, py, 1, 1);
        if ((x * 11 + y * 17) % 4 === 0) {
          ctx.fillStyle = '#7a9a58';
          ctx.fillRect(px + 0.3, py + 0.3, 0.1, 0.1);
        }
        break;
      case Tile.MOSS:
        ctx.fillStyle = '#2a3528';
        ctx.fillRect(px, py, 1, 1);
        break;
      case Tile.ROCK_SMALL:
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px + 0.2, py + 0.3, 0.6, 0.5);
        ctx.fillStyle = '#5a554a';
        ctx.fillRect(px + 0.2, py + 0.3, 0.6, 0.1);
        break;
      case Tile.ROCK_MED:
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px + 0.1, py + 0.2, 0.8, 0.7);
        ctx.fillStyle = '#5a554a';
        ctx.fillRect(px + 0.1, py + 0.2, 0.8, 0.15);
        ctx.fillStyle = '#252220';
        ctx.fillRect(px + 0.1, py + 0.7, 0.8, 0.2);
        break;
      case Tile.ROCK_LARGE:
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px, py + 0.1, 1, 0.9);
        ctx.fillStyle = '#5a554a';
        ctx.fillRect(px, py + 0.1, 1, 0.2);
        break;
      case Tile.WATER_DARK:
        ctx.fillStyle = '#1a2530';
        ctx.fillRect(px, py, 1, 1);
        // Subtle ripple
        if ((x + y) % 4 === 0) {
          ctx.fillStyle = '#2a3848';
          ctx.fillRect(px + 0.2, py + 0.3, 0.4, 0.05);
        }
        break;
      case Tile.WATER_LIVING:
        ctx.fillStyle = '#3a6a82';
        ctx.fillRect(px, py, 1, 1);
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = '#7ab0c8';
          ctx.fillRect(px + 0.2, py + 0.3, 0.4, 0.05);
        }
        break;
      case Tile.WATER_DEEP:
        ctx.fillStyle = '#0a1820';
        ctx.fillRect(px, py, 1, 1);
        break;
      case Tile.WATER_EDGE_N:
        ctx.fillStyle = '#1a2530';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px, py, 1, 0.3);
        break;
      case Tile.WATER_EDGE_E:
        ctx.fillStyle = '#1a2530';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px + 0.7, py, 0.3, 1);
        break;
      case Tile.WATER_EDGE_W:
        ctx.fillStyle = '#1a2530';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px, py, 0.3, 1);
        break;
      case Tile.WALL_N:
      case Tile.WALL_S:
      case Tile.WALL_E:
      case Tile.WALL_W:
        ctx.fillStyle = '#2a3540';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#525e6e';
        ctx.fillRect(px, py, 1, 0.1);
        break;
      case Tile.WALL_TALL:
        ctx.fillStyle = '#2a3540';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#525e6e';
        ctx.fillRect(px, py, 0.05, 1);
        break;
      case Tile.PILLAR:
      case Tile.COLUMN:
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px + 0.3, py, 0.4, 1);
        ctx.fillStyle = '#5a554a';
        ctx.fillRect(px + 0.3, py, 0.4, 0.15);
        break;
      case Tile.COLUMN_TOP:
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px + 0.2, py, 0.6, 0.4);
        break;
      case Tile.TREE_TRUNK:
        ctx.fillStyle = '#3a2818';
        ctx.fillRect(px + 0.4, py, 0.2, 1);
        break;
      case Tile.TREE_TOP:
        ctx.fillStyle = '#3a4530';
        ctx.beginPath();
        ctx.arc(px + 0.5, py + 0.5, 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case Tile.MONOLITH:
        ctx.fillStyle = '#1a2230';
        ctx.fillRect(px + 0.2, py, 0.6, 1);
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px + 0.2, py, 0.6, 0.1);
        // Ω symbol
        ctx.fillStyle = '#3a2a1c';
        ctx.fillRect(px + 0.4, py + 0.4, 0.2, 0.05);
        ctx.fillRect(px + 0.4, py + 0.6, 0.2, 0.05);
        ctx.fillRect(px + 0.35, py + 0.45, 0.05, 0.15);
        ctx.fillRect(px + 0.6, py + 0.45, 0.05, 0.15);
        break;
      case Tile.MONOLITH_TOP:
        ctx.fillStyle = '#2a3540';
        ctx.fillRect(px + 0.15, py, 0.7, 1);
        ctx.fillStyle = '#525e6e';
        ctx.fillRect(px + 0.15, py, 0.7, 0.15);
        break;
      case Tile.ARCHWAY:
        ctx.fillStyle = '#1a2230';
        ctx.fillRect(px, py + 0.4, 1, 0.6);
        ctx.fillStyle = '#3a2a1c';
        ctx.beginPath();
        ctx.arc(px + 0.5, py + 0.4, 0.5, Math.PI, 0);
        ctx.fill();
        break;
      case Tile.ARCHWAY_TOP:
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py, 1, 0.4);
        ctx.fillStyle = '#1a2230';
        ctx.fillRect(px + 0.3, py + 0.1, 0.4, 0.2);
        break;
      case Tile.ARCHWAY_BOTTOM:
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py, 1, 0.5);
        break;
      case Tile.LANTERN_OFF:
        ctx.fillStyle = '#3a2a1c';
        ctx.fillRect(px + 0.3, py + 0.2, 0.4, 0.5);
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(px + 0.35, py + 0.3, 0.3, 0.3);
        break;
      case Tile.LANTERN_ON:
        ctx.fillStyle = '#3a2a1c';
        ctx.fillRect(px + 0.3, py + 0.2, 0.4, 0.5);
        ctx.fillStyle = '#ffd28a';
        ctx.fillRect(px + 0.35, py + 0.3, 0.3, 0.3);
        // Halo
        ctx.fillStyle = 'rgba(255, 210, 138, 0.3)';
        ctx.beginPath();
        ctx.arc(px + 0.5, py + 0.45, 0.6, 0, Math.PI * 2);
        ctx.fill();
        break;
      case Tile.BELL:
        ctx.fillStyle = '#3a2a1c';
        ctx.beginPath();
        ctx.arc(px + 0.5, py + 0.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(px + 0.48, py + 0.3, 0.04, 0.2);
        break;
      case Tile.GATE_CLOSED:
        ctx.fillStyle = '#3a2a1c';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(px + 0.1, py + 0.2, 0.8, 0.6);
        break;
      case Tile.DOOR_CLOSED:
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px, py, 1, 1);
        ctx.fillStyle = '#3a2818';
        ctx.fillRect(px + 0.1, py + 0.1, 0.8, 0.8);
        break;
      case Tile.PEDESTAL:
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(px + 0.2, py + 0.3, 0.6, 0.6);
        ctx.fillStyle = '#5a554a';
        ctx.fillRect(px + 0.2, py + 0.3, 0.6, 0.15);
        break;
      case Tile.WORKBENCH:
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(px, py + 0.4, 1, 0.5);
        ctx.fillStyle = '#3a2818';
        ctx.fillRect(px, py + 0.4, 1, 0.1);
        break;
      case Tile.ANVIL:
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px + 0.1, py + 0.4, 0.8, 0.5);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(px + 0.1, py + 0.4, 0.8, 0.1);
        break;
      default:
        // Default: stone
        ctx.fillStyle = '#3a4654';
        ctx.fillRect(px, py, 1, 1);
    }
  }

  renderCables(ctx: CanvasRenderingContext2D, electrical: ElectricalGraph, _cam: Camera): void {
    const edges = electrical.getAllEdges();
    for (const edge of edges) {
      const isBroken = electrical.isBroken(edge.id);
      const isEnergized = electrical.isEnergizedEdge(edge.id);
      const path = electrical.getEdgePath(edge.id);
      if (path.length < 2) continue;
      // Color: copper off / on / broken
      let color = '#3a2a1c';
      if (isBroken) color = '#5a3a1a';
      else if (isEnergized) color = '#e8a050';
      // Draw line segments
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x + 0.5, path[0].y + 0.5);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x + 0.5, path[i].y + 0.5);
      }
      ctx.stroke();
      // Draw break marker
      if (isBroken) {
        const path2 = electrical.getEdgePath(edge.id);
        // Find the break index (or middle if unknown)
        const breakIdx = (edge as any).breakIndex ?? Math.floor(path2.length / 2);
        const bp = path2[breakIdx];
        if (bp) {
          ctx.fillStyle = '#1a1208';
          ctx.fillRect(bp.x + 0.4, bp.y + 0.4, 0.2, 0.2);
        }
      }
    }
  }

  renderPropsBack(ctx: CanvasRenderingContext2D, _cam: Camera): void {
    // For now we render interactable "object" layer items here.
    for (const inter of this.interactables) {
      if (inter.layer === 'object') {
        this.renderInteractable(ctx, inter);
      }
    }
  }

  renderPropsFront(ctx: CanvasRenderingContext2D, _cam: Camera): void {
    for (const inter of this.interactables) {
      if (inter.layer === 'tall') {
        this.renderInteractable(ctx, inter);
      }
    }
  }

  renderForeground(_ctx: CanvasRenderingContext2D, _cam: Camera): void {
    // Reserved for foreground occlusion (tree branches, columns that
    // occlude the player when behind them).
  }

  renderNPCs(ctx: CanvasRenderingContext2D, _cam: Camera, time: number): void {
    for (const npc of this.npcs) {
      const pos = this.npcPositions.get(npc.id);
      if (!pos) continue;
      // Update facing based on movement
      const path = npc.path;
      if (path && path.length > 0 && pos.wait <= 0) {
        const target = path[pos.targetIdx];
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          pos.facing = dx > 0 ? 3 : 2; // right : left
        } else {
          pos.facing = dy > 0 ? 0 : 1; // down : up
        }
      }
      this.renderNPC(ctx, npc, pos.x, pos.y, time, pos.facing);
    }
  }

  private renderNPC(ctx: CanvasRenderingContext2D, npc: NPCDef, x: number, y: number, _time: number, facing: number = 0): void {
    // Try to use sprite first
    if (npc.id === 'ohm') {
      const sprite = this.spriteProvider('ohm');
      if (sprite && sprite.naturalWidth > 0) {
        const cellW = sprite.naturalWidth / 2; // 2 cols (idle, walking)
        const cellH = sprite.naturalHeight / 4; // 4 rows
        const w = 24 / 16;
        const h = 32 / 16;
        const px = x - w / 2;
        const py = y - h / 2;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.45, w * 0.35, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(sprite, facing * cellW, 0, cellW, cellH, px, py, w, h);
        return;
      }
    } else if (npc.id === 'edda' || npc.id === 'lumen' || npc.id === 'habitante_1' || npc.id === 'habitante_2' || npc.id === 'habitante_3') {
      const sprite = this.spriteProvider('npcs');
      if (sprite && sprite.naturalWidth > 0) {
        // The npcs.png has 3 characters x 4 directions x 2 frames = 24 cells
        // Layout: rows = characters, cols = direction x frame
        // Character index: edda=0, lumen=1, habit_1=2 (aprendiz), habit_2=3 (regadora), habit_3=4 (anciano)
        const charMap: Record<string, number> = {
          edda: 0, lumen: 1, habitante_1: 2, npc_apprentice: 2,
          habit_2: 3, npc_regadora: 3, habit_3: 4, npc_anciano: 4,
        };
        const charIdx = charMap[npc.id] ?? 0;
        // Total cells: 24. Layout depends on image dimensions.
        // We assume 8 cols (4 dirs x 2 frames) x 3 rows.
        const totalCols = 8;
        const col = facing * 2; // idle frame (0 or 2)
        const cellW = sprite.naturalWidth / totalCols;
        // If sprite has 3 rows, charIdx > 2 won't work. Use modulo.
        const safeRow = charIdx % 3;
        const actualCellH = sprite.naturalHeight / 3;
        const w = 24 / 16;
        const h = 32 / 16;
        const px = x - w / 2;
        const py = y - h / 2;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + h * 0.45, w * 0.35, h * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(sprite, col * cellW, safeRow * actualCellH, cellW, actualCellH, px, py, w, h);
        return;
      }
    }
    // Fallback to procedural
    // Procedural NPC rendering with simple silhouettes.
    const w = 0.9;
    const h = 1.4;
    const px = x - w / 2;
    const py = y - h / 2;
    const colors: Record<string, { body: string; hair: string; detail: string }> = {
      edda: { body: '#3a4a28', hair: '#2a1a08', detail: '#5a3a1a' },
      lumen: { body: '#5a4a3a', hair: '#7a7a7a', detail: '#3a2818' },
      ohm: { body: '#3a2a1c', hair: '#1a1208', detail: '#7a5232' },
      npc_apprentice: { body: '#3a4654', hair: '#5a3a1a', detail: '#525e6e' },
      npc_regadora: { body: '#5a4a38', hair: '#3a2818', detail: '#7a5232' },
      npc_anciano: { body: '#4a3a28', hair: '#7a7a7a', detail: '#5a3a1a' },
    };
    const c = colors[npc.id] ?? { body: '#5a4a3a', hair: '#2a1a08', detail: '#3a2818' };
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + h / 2, w * 0.35, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    if (npc.id === 'ohm') {
      // Special: Ohm has a copper body
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(px + 0.1, py + 0.4, w - 0.2, h - 0.5);
      // Head
      ctx.fillStyle = '#5a3a1a';
      ctx.beginPath();
      ctx.arc(x, py + 0.25, 0.25, 0, Math.PI * 2);
      ctx.fill();
      // Eyes (lens)
      const isAwake = this.isEnergizedNode('node_ohm');
      ctx.fillStyle = isAwake ? '#7ac8e8' : '#1a1208';
      ctx.fillRect(px + 0.32, py + 0.22, 0.08, 0.08);
      ctx.fillRect(px + 0.5, py + 0.22, 0.08, 0.08);
      // Ω on chest
      ctx.fillStyle = '#1a1208';
      ctx.fillRect(x - 0.1, py + 0.5, 0.2, 0.04);
      ctx.fillRect(x - 0.1, py + 0.65, 0.2, 0.04);
      return;
    }
    // Body
    ctx.fillStyle = c.body;
    ctx.fillRect(px + 0.25, py + 0.4, 0.4, 0.7);
    // Head
    ctx.fillStyle = c.hair;
    ctx.fillRect(px + 0.3, py + 0.15, 0.3, 0.3);
    ctx.fillStyle = '#d4b8a0';
    ctx.fillRect(px + 0.3, py + 0.3, 0.3, 0.15);
    // Eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(px + 0.36, py + 0.34, 0.05, 0.05);
    ctx.fillRect(px + 0.5, py + 0.34, 0.05, 0.05);
    // Detail
    ctx.fillStyle = c.detail;
    ctx.fillRect(px + 0.4, py + 0.55, 0.1, 0.2);
  }

  private renderInteractable(ctx: CanvasRenderingContext2D, inter: InteractableDef): void {
    // Each interactable renders as a small decoration. The energy
    // state is read from the engine.
    const x = inter.x;
    const y = inter.y;
    switch (inter.type) {
      case 'lamp': {
        // Lamps sit on tiles, render a small lantern
        const isOn = this.isEnergizedNode(inter.node);
        ctx.fillStyle = '#3a2a1c';
        ctx.fillRect(x + 0.35, y + 0.1, 0.3, 0.5);
        ctx.fillStyle = isOn ? '#ffd28a' : '#1a1208';
        ctx.fillRect(x + 0.4, y + 0.2, 0.2, 0.2);
        if (isOn) {
          ctx.fillStyle = 'rgba(255, 210, 138, 0.3)';
          ctx.beginPath();
          ctx.arc(x + 0.5, y + 0.3, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'fountain': {
        const isOn = this.isEnergizedNode(inter.node);
        ctx.fillStyle = '#5a554a';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isOn ? '#3a6a82' : '#1a2530';
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, 0.7, 0, Math.PI * 2);
        ctx.fill();
        if (isOn) {
          // Center jet
          ctx.fillStyle = '#7ab0c8';
          ctx.fillRect(x + 0.95, y + 0.5, 0.1, 0.5);
        }
        break;
      }
      case 'monolith': {
        ctx.fillStyle = '#1a2230';
        ctx.fillRect(x + 0.3, y - 0.5, 0.4, 1.5);
        ctx.fillStyle = '#3a2a1c';
        ctx.fillRect(x + 0.45, y - 0.1, 0.1, 0.5);
        break;
      }
      case 'gate': {
        const isOpen = this.isEnergizedNode(inter.node);
        if (isOpen) {
          ctx.fillStyle = '#3a2a1c';
          ctx.fillRect(x + 0.1, y, 0.8, 0.1);
          ctx.fillRect(x + 0.1, y + 0.9, 0.8, 0.1);
        } else {
          ctx.fillStyle = '#3a2a1c';
          ctx.fillRect(x + 0.1, y, 0.8, 1);
        }
        break;
      }
      case 'workbench': {
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(x, y + 0.3, 1, 0.5);
        ctx.fillStyle = '#3a2818';
        ctx.fillRect(x, y + 0.3, 1, 0.1);
        // Tool
        ctx.fillStyle = '#7a5232';
        ctx.fillRect(x + 0.2, y + 0.1, 0.1, 0.3);
        break;
      }
      case 'device': {
        if (inter.id === 'ohm_pedestal') {
          ctx.fillStyle = '#3a3530';
          ctx.fillRect(x + 0.2, y + 0.4, 0.6, 0.5);
          // Ohm himself is rendered as an NPC
        }
        break;
      }
      case 'bell': {
        ctx.fillStyle = '#3a2a1c';
        ctx.beginPath();
        ctx.arc(x + 0.5, y + 0.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }
}
