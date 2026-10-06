// Chequeo rápido de escenas: dentro de cada setup/play, s (estudiante), p (Punto) y m (Mara)
// tienen que estar declarados antes de usarse. No reemplaza jugar; atrapa olvidos baratos.
//   node scripts/lint-scenes.mjs
import {readFile} from 'node:fs/promises';
import {readdirSync} from 'node:fs';

const files = readdirSync('src', {recursive: true}).filter(f => /^ch\d+\/.*\.js$/.test(f)).map(f => `src/${f}`);
let problems = 0;
for (const file of files) {
  const src = await readFile(file, 'utf8');
  // cuerpos de "async play(" y "setup(" hasta el cierre de la llave balanceada
  const re = /(async play\(|setup\(g[^)]*\)\s*\{)/g;
  let m;
  while ((m = re.exec(src))) {
    let i = src.indexOf('{', m.index);
    let depth = 0, j = i;
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}' && --depth === 0) break;
    }
    const body = src.slice(i, j);
    const line = src.slice(0, m.index).split('\n').length;
    for (const v of ['s', 'p', 'm']) {
      const uses = new RegExp(`(^|[^.\\w$])${v}\\.(\\w+)`, 'm').test(body);
      const declared = new RegExp(`(const|let)\\s+(\\{[^}]*\\b${v}\\b[^}]*\\}|${v})\\s*(=|of\\b)|\\(\\s*${v}\\s*\\)\\s*=>|\\b${v}\\s*=>|[,(]\\s*${v}\\s*[,)]\\s*=>`).test(body);
      if (uses && !declared) {
        problems++;
        console.log(`${file}:${line}: usa "${v}." sin declararlo en ese bloque`);
      }
    }
  }
}
console.log(problems ? `${problems} problema(s)` : 'sin problemas');
process.exit(problems ? 1 : 0);
