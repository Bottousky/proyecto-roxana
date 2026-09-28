// Hornea la oclusión ambiental con Blender (Cycles) tras exportar el mundo.
// Usa BLENDER si está definido; si no, la instalación por defecto de Windows.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const candidates = [process.env.BLENDER, 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe', 'blender'].filter(Boolean);
const blender = candidates.find(p => p === 'blender' || existsSync(p));
const script = fileURLToPath(new URL('./blender/bake-ao.py', import.meta.url));
const run = spawnSync(blender, ['-b', '--factory-startup', '--python', script], { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });
for (const line of (run.stdout || '').split('\n')) if (/objetos|horneando|oclusión|Cycles en|Error|Traceback/.test(line)) console.log(line.trim());
process.exit(run.status ?? 1);
