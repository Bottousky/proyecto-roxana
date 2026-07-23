// Modelo puro del hub escolar: parsea el mapa Tiled (assets/hub/escuela.json) sin
// depender de Phaser ni del DOM. Testeable en aislamiento (tests/i3-hub-zonas.test.ts).

export type ZonaTipo = 'overlay' | 'mundo' | 'dialogo' | 'bloqueado';

export interface ZonaRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Zona {
  nombre: string;
  tipo: ZonaTipo;
  target: string;
  trigger: 'enter' | 'interact';
  rect: ZonaRect;
}

const ZONA_TIPOS: readonly ZonaTipo[] = ['overlay', 'mundo', 'dialogo', 'bloqueado'];
const TRIGGERS: readonly ('enter' | 'interact')[] = ['enter', 'interact'];

interface TiledProperty {
  name: string;
  type?: string;
  value: unknown;
}

interface TiledObject {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: TiledProperty[];
}

interface TiledObjectLayer {
  type: 'objectgroup';
  name: string;
  objects: TiledObject[];
}

interface TiledTileLayer {
  type: 'tilelayer';
  name: string;
  width: number;
  height: number;
  data: number[];
}

type TiledLayer = TiledObjectLayer | TiledTileLayer;

interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

function asTiledMap(map: unknown): TiledMap {
  if (!map || typeof map !== 'object') throw new Error('Mapa Tiled inválido: no es un objeto');
  return map as TiledMap;
}

function findObjectLayer(m: TiledMap, name: string): TiledObjectLayer | undefined {
  return m.layers.find((l): l is TiledObjectLayer => l.type === 'objectgroup' && l.name === name);
}

function findTileLayer(m: TiledMap, name: string): TiledTileLayer | undefined {
  return m.layers.find((l): l is TiledTileLayer => l.type === 'tilelayer' && l.name === name);
}

function propValue(obj: TiledObject, name: string): unknown {
  return obj.properties?.find((p) => p.name === name)?.value;
}

function objRect(obj: TiledObject): ZonaRect {
  return { x: obj.x, y: obj.y, w: obj.width, h: obj.height };
}

/** Lee la capa de objetos `zonas`: separa el spawn del resto de las zonas interactivas. */
export function parseZonas(map: unknown): { spawn: { x: number; y: number }; zonas: Zona[] } {
  const m = asTiledMap(map);
  const layer = findObjectLayer(m, 'zonas');
  if (!layer) throw new Error('Falta el objectgroup "zonas" en el mapa');

  let spawn: { x: number; y: number } | null = null;
  const zonas: Zona[] = [];

  for (const obj of layer.objects) {
    const tipoRaw = propValue(obj, 'tipo');
    if (tipoRaw === 'spawn') {
      const rect = objRect(obj);
      spawn = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
      continue;
    }
    const tipo = tipoRaw as ZonaTipo;
    if (!ZONA_TIPOS.includes(tipo)) {
      throw new Error(`Zona "${obj.name}": tipo inválido (${String(tipoRaw)})`);
    }
    const target = propValue(obj, 'target');
    if (typeof target !== 'string' || target.trim() === '') {
      throw new Error(`Zona "${obj.name}": falta target`);
    }
    const trigger = propValue(obj, 'trigger') as 'enter' | 'interact';
    if (!TRIGGERS.includes(trigger)) {
      throw new Error(`Zona "${obj.name}": trigger inválido (${String(trigger)})`);
    }
    zonas.push({ nombre: obj.name, tipo, target, trigger, rect: objRect(obj) });
  }

  if (!spawn) throw new Error('Falta la zona de tipo "spawn" en el mapa');
  return { spawn, zonas };
}

/** Zona (si la hay) que contiene el punto (x, y) en píxeles de mundo. */
export function zonaEn(zonas: Zona[], x: number, y: number): Zona | null {
  for (const z of zonas) {
    const { rect } = z;
    if (x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h) return z;
  }
  return null;
}

/** Rects sólidos (en píxeles) de la capa `muros`: fusiona corridas horizontales por fila. */
export function muroRects(map: unknown): ZonaRect[] {
  const m = asTiledMap(map);
  const layer = findTileLayer(m, 'muros');
  if (!layer) throw new Error('Falta el tilelayer "muros" en el mapa');
  const { width, height, data } = layer;
  const tw = m.tilewidth;
  const th = m.tileheight;
  const rects: ZonaRect[] = [];

  for (let y = 0; y < height; y++) {
    let runStart = -1;
    for (let x = 0; x <= width; x++) {
      const solid = x < width && (data[y * width + x] ?? 0) !== 0;
      if (solid && runStart === -1) {
        runStart = x;
      } else if (!solid && runStart !== -1) {
        rects.push({ x: runStart * tw, y: y * th, w: (x - runStart) * tw, h: th });
        runStart = -1;
      }
    }
  }
  return rects;
}

/** Rects sólidos (en píxeles) de la capa `decoracion` con la property `solida === true`. */
export function decoracionSolida(map: unknown): ZonaRect[] {
  const m = asTiledMap(map);
  const layer = findObjectLayer(m, 'decoracion');
  if (!layer) throw new Error('Falta el objectgroup "decoracion" en el mapa');
  const rects: ZonaRect[] = [];
  for (const obj of layer.objects) {
    if (propValue(obj, 'solida') === true) rects.push(objRect(obj));
  }
  return rects;
}
