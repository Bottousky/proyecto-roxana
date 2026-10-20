// Congela una copia del juego tal como está ahora y la sirve con Vite en otro puerto, para que
// una partida automatizada larga no mezcle dos revisiones si se sigue editando mientras corre.
// Uso: node scripts/serve-snapshot.mjs [puerto=4192]   →   GAME_URL=http://127.0.0.1:4192/ node scripts/playthrough.mjs
import { cpSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.argv[2] || 4192);
const target = resolve(root, 'output', `snapshot-${port}`);
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const entry of ['index.html', 'vite.config.js', 'package.json', 'src', 'public', 'scripts']) cpSync(resolve(root, entry), resolve(target, entry), { recursive: true });
symlinkSync(resolve(root, 'node_modules'), resolve(target, 'node_modules'), 'dir');
const revision = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
const dirty = execSync('git status --porcelain -- .', { cwd: root }).toString().trim() ? '+cambios' : '';
writeFileSync(resolve(target, 'REVISION.txt'), `${revision}${dirty}\n${new Date().toISOString()}\n`);
console.log(`Copia ${revision}${dirty} en ${target}: http://127.0.0.1:${port}/`);
spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: target, stdio: 'inherit' });
