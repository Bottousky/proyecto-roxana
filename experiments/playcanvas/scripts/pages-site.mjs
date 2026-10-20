// The whole published site in one build: the Instituto Roxana campus at the root and the Ohmdal game
// at ohmdal.html, from the same commit, so the home and the game never drift apart. Builds the three
// pages with the site's base path and links (src/escuela/links.js), renames the game to ohmdal.html
// and the campus to index.html, and leaves at escuela.html a page that sends old links to the root,
// keeping query and hash. It touches neither git nor gh-pages: publishing copies this folder over the
// gh-pages tree (README, «Producción»).
// Uso: node scripts/pages-site.mjs <carpeta>   (PAGES_BASE, por defecto /proyecto-roxana/)
import {execFileSync} from 'node:child_process';
import {renameSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const out=resolve(process.argv[2]||'dist-pages'),root=fileURLToPath(new URL('..',import.meta.url));
execFileSync(process.execPath,[fileURLToPath(new URL('../node_modules/vite/bin/vite.js',import.meta.url)),'build',`--base=${process.env.PAGES_BASE||'/proyecto-roxana/'}`,'--outDir',out,'--emptyOutDir'],
  {cwd:root,stdio:'inherit',env:{...process.env,VITE_PLAY_URL:'./ohmdal.html',VITE_CAMPUS_URL:'./'}});
renameSync(`${out}/index.html`,`${out}/ohmdal.html`);
renameSync(`${out}/escuela.html`,`${out}/index.html`);
writeFileSync(`${out}/escuela.html`,`<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Instituto Roxana</title><meta name="robots" content="noindex"><link rel="canonical" href="./">
<script>location.replace('./'+location.search+location.hash);</script><meta http-equiv="refresh" content="0; url=./">
</head><body><p>El Instituto Roxana está en <a href="./">la página principal</a>.</p></body></html>
`);
writeFileSync(`${out}/.nojekyll`,'');
console.log(`Sitio listo para Pages en ${out}: index.html (campus 3D), escuela-clasica.html, ohmdal.html (el juego), escuela.html (redirección).`);
