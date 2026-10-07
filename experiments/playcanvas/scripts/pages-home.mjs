// Prepares the home for GitHub Pages, where the campus is the site's root and the game is ohmdal.html. Builds only
// the two home pages with the site's base path and links (src/escuela/links.js), renames the campus to index.html
// and leaves at escuela.html a page that sends old links to the root, keeping query and hash. It touches neither git
// nor the published game: publishing (README, «Producción») copies this folder over the gh-pages tree.
// Uso: node scripts/pages-home.mjs <carpeta>   (PAGES_BASE, por defecto /proyecto-roxana/)
import {execFileSync} from 'node:child_process';
import {renameSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const out=resolve(process.argv[2]||'dist-pages-home'),root=fileURLToPath(new URL('..',import.meta.url));
execFileSync(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'build',`--base=${process.env.PAGES_BASE||'/proyecto-roxana/'}`,'--outDir',out,'--emptyOutDir'],
  {cwd:root,stdio:'inherit',env:{...process.env,HOME_ONLY:'1',VITE_PLAY_URL:'./ohmdal.html',VITE_CAMPUS_URL:'./'}});
renameSync(`${out}/escuela.html`,`${out}/index.html`);
writeFileSync(`${out}/escuela.html`,`<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Instituto Roxana</title><meta name="robots" content="noindex"><link rel="canonical" href="./">
<script>location.replace('./'+location.search+location.hash);</script><meta http-equiv="refresh" content="0; url=./">
</head><body><p>El Instituto Roxana está en <a href="./">la página principal</a>.</p></body></html>
`);
console.log(`Home lista para Pages en ${out}: index.html (campus 3D), escuela-clasica.html, escuela.html (redirección).`);
