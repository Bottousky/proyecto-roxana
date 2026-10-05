// Ficha de cada banco leída del propio modelo, y qué ve el jugador ante intentos equivocados.
// Para cada banco: comprensión buscada, pista observable, acción, encargo, solución canónica y
// una batería de errores plausibles (quitar cada cable de la solución, cada mando en sus extremos,
// un atajo de + a −, invertir un receptor polarizado), con lo que el banco dice en cada caso.
// Uso: node scripts/puzzle-sheet.mjs [--md]   (sale con 1 si un error no da ninguna señal distinta)
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const game = resolve(import.meta.dirname, '../src/game');
const source = (await readFile(resolve(game, 'puzzles.js'), 'utf8')).replace("import './puzzles.css';", '')
  .replace(/'\.\/([a-z-]+)\.js'/g, (_, name) => JSON.stringify(pathToFileURL(resolve(game, `${name}.js`)).href));
const { PUZZLES, initialPuzzleSnapshot, evaluatePuzzle, observePuzzle, BENCH_GUIDANCE } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const { PUZZLE_STORY } = await import(pathToFileURL(resolve(game, 'content.js')).href);

const md = process.argv.includes('--md');
const same = (a, b) => a.length === b.length && a.every((w, i) => w.label === b[i].label && w.text === b[i].text);
const say = list => list.map(o => `${o.label}: ${o.text}`).join(' / ');
const pair = ([a, b]) => [a, b].sort().join('↔');
let silent = 0;
const out = [];

for (const [id, p] of Object.entries(PUZZLES)) {
  const solved = initialPuzzleSnapshot(id); p.solve(solved); solved.sourceOn = true; solved.tripped = false;
  const good = evaluatePuzzle(id, solved), goodSays = observePuzzle(id, solved, good);
  const start = { ...initialPuzzleSnapshot(id), sourceOn: true, tripped: false };
  const variants = [['estado inicial', start]];
  const initialPairs = new Set(p.initialWires.map(pair));
  for (const w of solved.wires) if (!initialPairs.has(pair(w)) || !p.sealed?.some(s => pair(s) === pair(w))) {
    if (p.sealed?.some(s => pair(s) === pair(w))) continue;
    const s = structuredClone(solved); s.wires = s.wires.filter(x => pair(x) !== pair(w)); variants.push([`sin el cable ${pair(w)}`, s]);
  }
  for (const k of p.knobs ?? []) for (const v of [k.min, k.max]) if (v !== solved.values[k.key]) { const s = structuredClone(solved); s.values[k.key] = v; variants.push([`${k.label} en ${v} ${k.unit || ''}`.trim(), s]); }
  if (p.cables) { const s = structuredClone(solved); s.wires.push(['positive', 'negative']); variants.push(['atajo de Fuente + a Retorno −', s]); }
  for (const c of p.components.filter(c => ['coil', 'motor', 'orb', 'lens'].includes(c.kind))) {
    const s = structuredClone(solved); s.wires = s.wires.map(w => w.map(n => n === c.a ? c.b : n === c.b ? c.a : n)); variants.push([`${c.label} al revés`, s]);
  }
  const rows = variants.map(([label, s]) => {
    const r = evaluatePuzzle(id, s), says = observePuzzle(id, s, r);
    const informative = !r.solved ? !same(says, goodSays) : true;
    if (!informative) silent++;
    return { label, solved: r.solved, trips: r.overloaded, says: say(says), informative };
  });
  out.push({ id, title: p.title, understanding: p.lesson, clue: p.observation, brief: p.brief, proof: p.proof?.request || null, firstHint: BENCH_GUIDANCE[id]?.hints?.[0], consequence: PUZZLE_STORY[id]?.complete || null, solvedSays: say(goodSays), solvedOk: good.solved, rows });
}

if (md) {
  for (const b of out) {
    console.log(`### ${b.title} (\`${b.id}\`)\n`);
    console.log(`- **Comprensión buscada:** ${b.understanding}\n- **Pista observable:** ${b.clue}\n- **Acción posible:** ${b.brief}${b.proof ? `\n- **Comprobación pedida:** ${b.proof}` : ''}\n- **Primera ayuda:** ${b.firstHint}\n- **Descubrimiento (solución):** ${b.solvedSays}\n- **Consecuencia:** diálogo \`${b.consequence}\` y restauración en el mundo.\n`);
    console.log('| Intento equivocado | ¿Resuelve? | Lo que dice el banco |\n|---|---|---|');
    for (const r of b.rows) console.log(`| ${r.label} | ${r.solved ? 'sí' : r.trips ? 'no · protección' : 'no'}${r.informative ? '' : ' · **sin señal distinta**'} | ${r.says.replace(/\|/g, '/')} |`);
    console.log('');
  }
} else {
  for (const b of out) {
    console.log(`\n== ${b.id}: solución ${b.solvedOk ? 'válida' : 'INVÁLIDA'} · ${b.solvedSays}`);
    for (const r of b.rows) console.log(`  ${r.solved ? 'RESUELVE' : r.trips ? 'protección' : 'no      '} ${r.informative ? ' ' : '!'} ${r.label}: ${r.says}`);
  }
}
console.error(`${out.length} bancos; intentos sin señal distinta de la solución: ${silent}`);
if (silent || out.some(b => !b.solvedOk)) process.exitCode = 1;
