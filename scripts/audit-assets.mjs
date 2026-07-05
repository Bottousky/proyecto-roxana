// Auditoría práctica de assets: recorre assets/ y produce
//   data/asset_manifest.json  y  docs/asset_audit.md
// Sin dependencias: lee dimensiones PNG del IHDR y clasifica por heurística.
//
// Correr:  node scripts/audit-assets.mjs
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, extname, basename, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ASSETS = resolve(ROOT, 'assets');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === '__MACOSX' || name.startsWith('._')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function pngSize(buf) {
  // firma(8) + len(4) + 'IHDR'(4) + w(4) h(4)
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), alpha: buf[25] === 6 || buf[25] === 4 };
}

function nearestLicense(file) {
  let dir = dirname(file);
  for (let i = 0; i < 6; i++) {
    for (const cand of ['LICENSE.txt', 'license.txt', 'LICENSE', 'README.txt', 'readme.txt', 'README.md']) {
      const p = join(dir, cand);
      if (existsSync(p)) return relative(ROOT, p).replace(/\\/g, '/');
    }
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

function classify(rel, name, size) {
  const n = name.toLowerCase();
  const p = rel.toLowerCase();
  let type = 'desconocido';
  if (/\.(wav|mp3|ogg)$/.test(n)) type = 'audio';
  else if (/portrait|retrato|face|dialog-portrait/.test(p)) type = 'retrato';
  else if (/tileset|tiles|_a\d|ground|walls|roofs|floor|interior/.test(p)) type = 'tileset';
  else if (/hero|player|npc|character|walk|idle|sheet/.test(p)) type = 'sprite';
  else if (/icon|ui|button|panel|interface|hud/.test(p)) type = 'ui';
  else if (/fx|spark|glow|particle/.test(p)) type = 'fx';
  else if (/map|background|world/.test(p)) type = 'fondo';
  else if (/prop|decor|tree|bush|object|node|lamp|switch|door|crystal|portal/.test(p)) type = 'prop';
  else if (size) type = 'tileset';

  const t16 = size && size.w % 16 === 0 && size.h % 16 === 0;
  const t32 = size && size.w % 32 === 0 && size.h % 32 === 0;

  let reco = 'revisar';
  if (p.includes('/generated/')) reco = 'usar';
  else if (p.includes('/tilesets/') || p.includes('/portraits/')) reco = 'usar';
  else if (/macosx|\.psd$|\.zip$/.test(p)) reco = 'descartar';
  else if (size && (t16 || t32)) reco = 'editar';

  return { type, t16: !!t16, t32: !!t32, reco };
}

const files = walk(ASSETS);
const manifest = [];
for (const f of files) {
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  const ext = extname(f).slice(1).toLowerCase();
  let size = null;
  if (ext === 'png') { try { size = pngSize(readFileSync(f)); } catch { /* ignora */ } }
  const cls = classify(rel, basename(f), size);
  manifest.push({
    path: rel,
    name: basename(f),
    format: ext,
    width: size?.w ?? null,
    height: size?.h ?? null,
    transparency: size?.alpha ?? null,
    type: cls.type,
    tile16: cls.t16,
    tile32: cls.t32,
    license: nearestLicense(f),
    reco: cls.reco,
  });
}

mkdirSync(resolve(ROOT, 'data'), { recursive: true });
writeFileSync(resolve(ROOT, 'data/asset_manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, assets: manifest }, null, 2));

// resumen markdown (agrupado por carpeta de primer nivel bajo assets/)
const byGroup = {};
for (const a of manifest) {
  const g = a.path.split('/').slice(0, 3).join('/');
  (byGroup[g] ??= []).push(a);
}
const tally = manifest.reduce((m, a) => ((m[a.type] = (m[a.type] || 0) + 1), m), {});
let md = `# Auditoría de assets — Ohmdal\n\n`;
md += `Generado por \`scripts/audit-assets.mjs\`. Total: **${manifest.length}** archivos.\n\n`;
md += `## Por tipo\n\n| Tipo | Cantidad |\n|---|---|\n`;
for (const [t, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) md += `| ${t} | ${n} |\n`;
md += `\n## Familia visual elegida para el slice\n\n`;
md += `**Principal:** assets generados proceduralmente (\`assets/ohmdal/generated/\`) en paleta electric-fantasy (teal/cobre) — coherentes, livianos, licencia propia.\n`;
md += `**Retratos de diálogo:** \`assets/ohmdal/portraits/*.png\` (arte original del proyecto).\n`;
md += `**Complemento disponible:** \`assets/ohmdal/FREE_PixelFlow_fantasy\` (16px, coherente GBA, licencia: uso comercial ok, sin reventa) y \`assets/ohmdal/tilesets/\` (curados). Ver licencias en \`assets/ohmdal/tilesets/licencias.md\`.\n\n`;
md += `## Grupos con más peso (top 15)\n\n| Carpeta | Archivos | 16px | 32px | Licencia cercana |\n|---|---|---|---|---|\n`;
for (const [g, arr] of Object.entries(byGroup).sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
  const lic = arr.find((a) => a.license)?.license ?? '—';
  md += `| ${g} | ${arr.length} | ${arr.filter((a) => a.tile16).length} | ${arr.filter((a) => a.tile32).length} | ${lic} |\n`;
}
md += `\n## Recomendaciones\n\n`;
const recos = manifest.reduce((m, a) => ((m[a.reco] = (m[a.reco] || 0) + 1), m), {});
for (const [r, n] of Object.entries(recos)) md += `- **${r}**: ${n}\n`;
md += `\n> Nota: heurística práctica, no licencia legal definitiva. Antes de publicar, verificar cada pack marcado "revisar"/"editar" contra su LICENSE. Descartar todo \`.psd\`/\`.zip\`/\`__MACOSX\` del build.\n`;

mkdirSync(resolve(ROOT, 'docs'), { recursive: true });
writeFileSync(resolve(ROOT, 'docs/asset_audit.md'), md);
console.log(`Auditados ${manifest.length} assets → data/asset_manifest.json + docs/asset_audit.md`);
