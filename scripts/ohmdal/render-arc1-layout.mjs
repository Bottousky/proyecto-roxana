#!/usr/bin/env node

/**
 * Deterministic top-down renderer for Ohmdal Arc I layout data.
 *
 * Usage:
 *   node scripts/ohmdal/render-arc1-layout.mjs
 *   node scripts/ohmdal/render-arc1-layout.mjs overworld
 *   node scripts/ohmdal/render-arc1-layout.mjs cuenca_de_ohm
 *   node scripts/ohmdal/render-arc1-layout.mjs castillo_de_la_red path/to/output.svg
 *
 * The SVG is REVIEW EVIDENCE ONLY. arc1-layout.json remains the source of truth.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const layoutPath = path.join(
  repoRoot,
  'docs',
  '20-worlds',
  'ohmdal',
  'world',
  'layout',
  'arc1-layout.json',
);

const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
const target = process.argv[2] ?? 'overworld';
const defaultOut = path.join(
  repoRoot,
  'docs',
  '20-worlds',
  'ohmdal',
  'world',
  'layout',
  'generated',
  `${target}.svg`,
);
const outPath = path.resolve(process.argv[3] ?? defaultOut);

const W = 1600;
const H = 1100;
const PAD = 110;

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function boundsFromCenter(center, size) {
  const [x, , z] = center;
  const [w, d] = size;
  return { minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 };
}

function growBounds(b, p) {
  b.minX = Math.min(b.minX, p.x);
  b.maxX = Math.max(b.maxX, p.x);
  b.minZ = Math.min(b.minZ, p.z);
  b.maxZ = Math.max(b.maxZ, p.z);
}

function makeProjector(bounds) {
  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanZ = Math.max(1, bounds.maxZ - bounds.minZ);
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanZ);
  const usedW = spanX * scale;
  const usedH = spanZ * scale;
  const left = (W - usedW) / 2;
  const top = (H - usedH) / 2;
  return {
    scale,
    x: (x) => left + (x - bounds.minX) * scale,
    y: (z) => top + (z - bounds.minZ) * scale,
    w: (n) => n * scale,
  };
}

function svgHeader(title, subtitle) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#111720"/>
  <text x="64" y="58" fill="#f0f3f7" font-family="monospace" font-size="30" font-weight="700">${esc(title)}</text>
  <text x="64" y="88" fill="#9da9b8" font-family="monospace" font-size="16">${esc(subtitle)}</text>
  <text x="${W - 120}" y="58" text-anchor="middle" fill="#f0f3f7" font-family="monospace" font-size="18">N</text>
  <path d="M ${W - 120} 92 L ${W - 120} 68 M ${W - 120} 68 L ${W - 128} 80 M ${W - 120} 68 L ${W - 112} 80" stroke="#f0f3f7" stroke-width="3" fill="none"/>
`;
}

function svgFooter() {
  return `  <text x="64" y="${H - 38}" fill="#7f8b99" font-family="monospace" font-size="14">Generated from arc1-layout.json — do not hand-edit this SVG.</text>\n</svg>\n`;
}

function gridSvg(p, bounds, step) {
  const parts = [];
  const startX = Math.floor(bounds.minX / step) * step;
  const endX = Math.ceil(bounds.maxX / step) * step;
  const startZ = Math.floor(bounds.minZ / step) * step;
  const endZ = Math.ceil(bounds.maxZ / step) * step;

  for (let x = startX; x <= endX; x += step) {
    const sx = p.x(x);
    parts.push(`<line x1="${sx}" y1="${p.y(bounds.minZ)}" x2="${sx}" y2="${p.y(bounds.maxZ)}" stroke="#263241" stroke-width="1"/>`);
    parts.push(`<text x="${sx + 4}" y="${p.y(bounds.maxZ) + 18}" fill="#667383" font-family="monospace" font-size="12">x=${x}</text>`);
  }
  for (let z = startZ; z <= endZ; z += step) {
    const sy = p.y(z);
    parts.push(`<line x1="${p.x(bounds.minX)}" y1="${sy}" x2="${p.x(bounds.maxX)}" y2="${sy}" stroke="#263241" stroke-width="1"/>`);
    parts.push(`<text x="${p.x(bounds.minX) - 8}" y="${sy + 4}" text-anchor="end" fill="#667383" font-family="monospace" font-size="12">z=${z}</text>`);
  }

  if (bounds.minX <= 0 && bounds.maxX >= 0) {
    parts.push(`<line x1="${p.x(0)}" y1="${p.y(bounds.minZ)}" x2="${p.x(0)}" y2="${p.y(bounds.maxZ)}" stroke="#9ba8b8" stroke-width="2"/>`);
  }
  if (bounds.minZ <= 0 && bounds.maxZ >= 0) {
    parts.push(`<line x1="${p.x(bounds.minX)}" y1="${p.y(0)}" x2="${p.x(bounds.maxX)}" y2="${p.y(0)}" stroke="#9ba8b8" stroke-width="2"/>`);
  }
  return parts.join('\n');
}

function rectSvg(p, center, size, { fill, stroke, dash = '', opacity = 1, radius = 5 } = {}) {
  const [x, , z] = center;
  const [w, d] = size;
  return `<rect x="${p.x(x - w / 2)}" y="${p.y(z - d / 2)}" width="${p.w(w)}" height="${p.w(d)}" rx="${radius}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
}

function labelSvg(p, pos, label, secondary = '') {
  const [x, , z] = pos;
  return `<g>
    <text x="${p.x(x)}" y="${p.y(z) - 5}" text-anchor="middle" fill="#f5f7fa" font-family="monospace" font-size="14" font-weight="700">${esc(label)}</text>
    ${secondary ? `<text x="${p.x(x)}" y="${p.y(z) + 13}" text-anchor="middle" fill="#aeb8c5" font-family="monospace" font-size="11">${esc(secondary)}</text>` : ''}
  </g>`;
}

function renderOverworld() {
  const territories = layout.overworld.macroterritories;
  let bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const t of territories) {
    const b = boundsFromCenter(t.position, t.footprint);
    growBounds(bounds, { x: b.minX - 15, z: b.minZ - 15 });
    growBounds(bounds, { x: b.maxX + 15, z: b.maxZ + 15 });
  }
  const p = makeProjector(bounds);
  const out = [svgHeader('OHMDAL ARC I — OVERWORLD', 'Symbolic atlas space. Positions express composition and direction, not meters or walk time.')];
  out.push(gridSvg(p, bounds, 20));

  for (const link of layout.overworld.links) {
    const a = territories.find((t) => t.id === link.from);
    const b = territories.find((t) => t.id === link.to);
    if (!a || !b) continue;
    out.push(`<line x1="${p.x(a.position[0])}" y1="${p.y(a.position[2])}" x2="${p.x(b.position[0])}" y2="${p.y(b.position[2])}" stroke="#b7844a" stroke-width="7" stroke-linecap="round" stroke-opacity="0.75"/>`);
  }

  for (const t of territories) {
    out.push(rectSvg(p, t.position, t.footprint, { fill: '#243448', stroke: '#cf995a', opacity: 0.95, radius: 16 }));
    out.push(labelSvg(p, t.position, t.label.toUpperCase(), `${t.position[0]}, ${t.position[2]} · ${t.arc1Chapters.join(' + ')}`));
  }

  out.push(svgFooter());
  return out.join('\n');
}

function renderDiorama(id) {
  const d = layout.dioramas[id];
  if (!d) {
    const available = Object.keys(layout.dioramas).join(', ');
    throw new Error(`Unknown diorama '${id}'. Available: ${available}`);
  }

  let bounds = boundsFromCenter(d.bounds.center, d.bounds.size);
  const margin = 5;
  bounds = { minX: bounds.minX - margin, maxX: bounds.maxX + margin, minZ: bounds.minZ - margin, maxZ: bounds.maxZ + margin };
  const p = makeProjector(bounds);
  const out = [svgHeader(`OHMDAL ARC I — ${id.toUpperCase()}`, `Metric diorama space · 1 unit = 1 m · origin=${d.origin}`)];
  out.push(gridSvg(p, bounds, 10));

  for (const neg of d.reservedNegativeSpace ?? []) {
    out.push(rectSvg(p, neg.center, neg.size, { fill: '#1d2834', stroke: '#8f9baa', dash: '9 7', opacity: 0.4, radius: 8 }));
    out.push(labelSvg(p, neg.center, `NEGATIVE SPACE: ${neg.id}`));
  }

  for (const z of d.zones ?? []) {
    out.push(rectSvg(p, z.center, z.size, { fill: '#2f4054', stroke: '#71859b', opacity: 0.45, radius: 8 }));
    out.push(labelSvg(p, z.center, z.id, `${z.center[0]}, ${z.center[2]} · ${z.size[0]}×${z.size[1]}m`));
  }

  for (const pathDef of d.paths ?? []) {
    out.push(`<line x1="${p.x(pathDef.from[0])}" y1="${p.y(pathDef.from[2])}" x2="${p.x(pathDef.to[0])}" y2="${p.y(pathDef.to[2])}" stroke="#c38b45" stroke-width="${Math.max(3, p.w(pathDef.minClearWidth))}" stroke-linecap="round" stroke-opacity="0.42"/>`);
    const mx = (pathDef.from[0] + pathDef.to[0]) / 2;
    const mz = (pathDef.from[2] + pathDef.to[2]) / 2;
    out.push(labelSvg(p, [mx, 0, mz], pathDef.id, `clear ≥ ${pathDef.minClearWidth}m`));
  }

  for (const s of d.protectedSightlines ?? []) {
    const points = [s.from, s.through, s.to].filter(Boolean);
    if (points.length < 2) continue;
    out.push(`<polyline points="${points.map((pt) => `${p.x(pt[0])},${p.y(pt[2])}`).join(' ')}" fill="none" stroke="#6ec4d8" stroke-width="3" stroke-dasharray="8 7" stroke-opacity="0.85"/>`);
  }

  for (const b of d.buildings ?? []) {
    out.push(rectSvg(p, b.center, b.size, { fill: '#392e2a', stroke: '#d0a66f', opacity: 0.95, radius: 3 }));
    out.push(labelSvg(p, b.center, `BUILDING: ${b.id}`, `${b.center[0]}, ${b.center[2]} · ${b.size[0]}×${b.size[1]}m`));
    if (b.entrance) {
      out.push(`<circle cx="${p.x(b.entrance.position[0])}" cy="${p.y(b.entrance.position[2])}" r="6" fill="#f4d18b" stroke="#111720" stroke-width="2"/>`);
    }
  }

  for (const l of d.landmarks ?? []) {
    out.push(rectSvg(p, l.position, l.footprint, { fill: '#634126', stroke: '#f0bd74', opacity: 0.95, radius: 4 }));
    out.push(labelSvg(p, l.position, `LANDMARK: ${l.id}`, `${l.position[0]}, ${l.position[2]}`));
  }

  for (const a of d.interactionAnchors ?? []) {
    out.push(`<circle cx="${p.x(a.position[0])}" cy="${p.y(a.position[2])}" r="${p.w(a.stagingRadius)}" fill="#67b896" fill-opacity="0.08" stroke="#67b896" stroke-width="2" stroke-dasharray="6 5"/>`);
    out.push(`<circle cx="${p.x(a.position[0])}" cy="${p.y(a.position[2])}" r="5" fill="#8ce2b9"/>`);
    out.push(labelSvg(p, a.position, `ACTION: ${a.id}`, `r=${a.stagingRadius}m`));
  }

  for (const e of d.entrances ?? []) {
    out.push(`<circle cx="${p.x(e.position[0])}" cy="${p.y(e.position[2])}" r="8" fill="#77a8ff" stroke="#dce9ff" stroke-width="2"/>`);
    out.push(labelSvg(p, e.position, `IN: ${e.id}`));
  }
  for (const e of d.exits ?? []) {
    out.push(`<circle cx="${p.x(e.position[0])}" cy="${p.y(e.position[2])}" r="8" fill="#b487e8" stroke="#f0e0ff" stroke-width="2"/>`);
  }

  out.push(svgFooter());
  return out.join('\n');
}

const svg = target === 'overworld' ? renderOverworld() : renderDiorama(target);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg, 'utf8');
console.log(`Wrote ${path.relative(repoRoot, outPath)}`);
