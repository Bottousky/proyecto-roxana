import type { Action, Board, Cell, Chapter, Evaluation, Piece, TransformResult, Zone } from './types';

export function cells(board: Board): Cell[] {
  return board.pieces.flatMap(p => p.units.map((u, index) => ({ ...u, pieceId: p.id, index, x: p.x + index % p.width, z: p.z + Math.floor(index / p.width) })));
}

export function initialBoard(chapter: Chapter): Board {
  return { pieces: chapter.seeds.map(p => ({ ...p, units: p.units.map(u => ({ ...u })) })), nextId: 1 };
}

/** Validate geometry and identity before either simulation or persistence trusts it. */
export function boardIssue(board: Board): string {
  if (!board || !Array.isArray(board.pieces) || board.pieces.length > 400 || !Number.isSafeInteger(board.nextId) || board.nextId < 1) return 'La estructura no se puede recuperar.';
  const pieces = new Set<string>(), units = new Set<string>(), occupied = new Set<string>();
  for (const p of board.pieces) {
    if (!p || typeof p.id !== 'string' || !p.id || pieces.has(p.id) || !Array.isArray(p.units) || !p.units.length || p.units.length > 400 || !Number.isInteger(p.width) || p.width < 1 || p.width > p.units.length || !Number.isInteger(p.x) || !Number.isInteger(p.z)) return 'La estructura de una pieza está incompleta.';
    pieces.add(p.id);
    for (let i = 0; i < p.units.length; i++) {
      const u = p.units[i];
      if (!u || typeof u.id !== 'string' || !u.id || units.has(u.id) || !['amber', 'teal'].includes(u.matter)) return 'Una unidad perdió su identidad.';
      units.add(u.id);
      const x = p.x + i % p.width, z = p.z + Math.floor(i / p.width);
      if (x < -12 || x > 12 || z < -7 || z > 8) return 'La pieza sobresale del embarcadero. Acércala al centro antes de darle esa forma.';
      const key = `${x},${z}`;
      if (occupied.has(key)) return 'Dos piezas ocuparían el mismo lugar. Deja espacio entre ellas.';
      occupied.add(key);
    }
  }
  return '';
}

export function matchesChapter(chapter: Chapter, board: Board): boolean {
  if (boardIssue(board)) return false;
  const expected = new Map(chapter.seeds.flatMap(p => p.units.map(u => [u.id, u.matter] as const)));
  const actual = cells(board);
  return actual.length === expected.size && actual.every(u => expected.get(u.id) === u.matter);
}

function freePosition(piece: Piece, other: Piece[], x: number, z: number): Piece | null {
  const positions: { x: number; z: number }[] = [];
  for (let rz = -7; rz <= 8; rz++) for (let rx = -12; rx <= 12; rx++) positions.push({ x: rx, z: rz });
  positions.sort((a, b) => (Math.abs(a.x - x) + Math.abs(a.z - z)) - (Math.abs(b.x - x) + Math.abs(b.z - z)) || a.z - b.z || a.x - b.x);
  for (const pos of positions) {
    const candidate = { ...piece, ...pos };
    if (!boardIssue({ pieces: [...other, candidate], nextId: 1 })) return candidate;
  }
  return null;
}

export function transform(board: Board, action: Action): TransformResult {
  const fail = (reason: string): TransformResult => ({ board, changed: false, reason });
  const issue = boardIssue(board);
  if (issue) return fail(issue);
  const next: Board = { pieces: board.pieces.map(p => ({ ...p, units: p.units.map(u => ({ ...u })) })), nextId: board.nextId };
  if (action.type === 'join') {
    const ids = [...new Set(action.ids)];
    if (ids.length < 2 || ids.some(id => !next.pieces.some(p => p.id === id))) return fail('Elige al menos dos piezas para reunirlas.');
    const selected = ids.map(id => next.pieces.find(p => p.id === id)!);
    const other = next.pieces.filter(p => !ids.includes(p.id));
    const first = selected[0];
    const units = selected.flatMap(p => p.units);
    // Prefer the first piece's row length; compact only if that shape cannot fit anywhere.
    const widths = [first.width, ...Array.from({ length: units.length }, (_, i) => i + 1).filter(w => w !== first.width)];
    let joined: Piece | null = null;
    for (const width of widths) {
      joined = freePosition({ ...first, units, width }, other, first.x, first.z);
      if (joined) break;
    }
    if (!joined) return fail('No hay espacio para reunir esas piezas. Separa las que las rodean.');
    next.pieces = [...other, joined];
  } else {
    const index = next.pieces.findIndex(p => p.id === action.id);
    if (index < 0) return fail('Selecciona una pieza del embarcadero.');
    const p = next.pieces[index];
    if (action.type === 'move') {
      if (!Number.isInteger(action.x) || !Number.isInteger(action.z)) return fail('Las piezas descansan sobre huellas enteras.');
      if (p.x === action.x && p.z === action.z) return fail('La pieza ya está ahí.');
      p.x = action.x; p.z = action.z;
    } else if (action.type === 'reshape') {
      if (!Number.isInteger(action.width) || action.width < 1 || action.width > p.units.length) return fail('Cada fila necesita al menos una unidad y no puede tener más que la pieza.');
      if (p.width === action.width) return fail('La pieza ya tiene esa forma.');
      p.width = action.width;
    } else if (action.type === 'rotate') {
      if (p.units.length % p.width !== 0) return fail('La última fila está incompleta. Cambia su ancho antes de girar el rectángulo.');
      const oldWidth = p.width, oldDepth = p.units.length / oldWidth;
      const rotated = p.units.slice();
      p.units.forEach((u, i) => { rotated[(i % oldWidth) * oldDepth + oldDepth - 1 - Math.floor(i / oldWidth)] = u; });
      p.units = rotated; p.width = oldDepth;
      if (p.units.length === 1) return fail('Esta unidad se ve igual al girar.');
    } else if (action.type === 'split') {
      if (!Number.isInteger(action.at) || action.at < 1 || action.at >= p.units.length) return fail('El corte necesita dejar materia a ambos lados.');
      let id: string;
      do { id = `fold-${next.nextId++}`; } while (next.pieces.some(piece => piece.id === id));
      const remainder = p.units.slice(action.at);
      p.units = p.units.slice(0, action.at); p.width = Math.min(p.width, p.units.length);
      const second = freePosition({ id, units: remainder, width: Math.min(board.pieces[index].width, remainder.length), x: p.x, z: p.z }, next.pieces, p.x + p.width + 1, p.z);
      if (!second) return fail('El corte conserva toda la materia, pero falta espacio para apoyarla.');
      next.pieces.push(second);
    }
  }
  const invalid = boardIssue(next);
  if (invalid) return fail(invalid);
  return { board: next, changed: true, reason: action.type === 'split' ? 'Dos piezas; la misma materia.' : action.type === 'join' ? 'Las piezas se reúnen sin perder una unidad.' : 'La materia sigue completa.' };
}

function inside(c: Cell, zone: Zone): boolean {
  return c.x >= zone.x && c.x < zone.x + zone.width && c.z >= zone.z && c.z < zone.z + zone.depth;
}

export function evaluate(chapter: Chapter, board: Board): Evaluation {
  const valid = matchesChapter(chapter, board);
  const all = valid ? cells(board) : [];
  const total = chapter.seeds.reduce((sum, p) => sum + p.units.length, 0);
  const readings = chapter.zones.map(zone => {
    const here = all.filter(c => inside(c, zone));
    const amber = here.filter(c => c.matter === 'amber').length, teal = here.length - amber;
    return { id: zone.id, count: here.length, amber, teal, satisfied: false, fill: here.length / (zone.width * zone.depth), imbalance: 0 };
  });
  const outside = valid ? all.filter(c => !chapter.zones.some(z => inside(c, z))).length : total;
  readings.forEach((r, i) => {
    if (chapter.rule === 'cover') r.satisfied = r.count === chapter.zones[i].width * chapter.zones[i].depth;
    if (chapter.rule === 'balance' || chapter.rule === 'sails') {
      r.imbalance = r.count - total / readings.length;
      r.satisfied = r.imbalance === 0;
      if (chapter.rule === 'sails') {
        const inZone = all.filter(c => inside(c, chapter.zones[i]));
        // Wind reads the complete cloth's footprint, independently of its seams.
        // Unique, non-overlapping cells fill a rectangle iff its bounding area
        // equals their count. Separate rectangular scraps must not pass this.
        const width = inZone.length ? Math.max(...inZone.map(c => c.x)) - Math.min(...inZone.map(c => c.x)) + 1 : 0;
        const depth = inZone.length ? Math.max(...inZone.map(c => c.z)) - Math.min(...inZone.map(c => c.z)) + 1 : 0;
        r.satisfied &&= inZone.length > 0 && width * depth === inZone.length;
      }
    }
    if (chapter.rule === 'ratio' || chapter.rule === 'flight') {
      r.imbalance = r.teal - 2 * r.amber;
      r.satisfied = r.count >= (chapter.minPerZone ?? 6) && r.amber > 0 && r.imbalance === 0;
    }
  });
  const balancedWings = chapter.rule !== 'flight' || readings[0].count === readings[readings.length - 1].count;
  if (!balancedWings) { readings[0].satisfied = false; readings[readings.length - 1].satisfied = false; }
  const solved = valid && outside === 0 && balancedWings && readings.every(r => r.satisfied);
  let message = 'Las huellas todavía esperan materia.';
  if (!valid) message = 'La materia de este lugar está incompleta. Reinicia el encuentro para recuperarla.';
  else if (solved) message = chapter.restored;
  else if (outside) message = `${outside === 1 ? 'Queda una unidad' : `Quedan ${outside} unidades`} fuera de las huellas. La materia que queda suelta todavía no participa.`;
  else if (!balancedWings) message = 'Las alas exteriores llevan cargas distintas: la ciudad se inclina hacia la más pesada.';
  else if (chapter.rule === 'ratio' || chapter.rule === 'flight') message = readings.some(r => r.count < (chapter.minPerZone ?? 6)) ? 'Una huella tiene muy poca materia para despertar. Puedes redistribuir sin cambiar la mezcla.' : 'La mezcla cambia entre las huellas. Observa qué materia sobra en cada una.';
  else if (chapter.rule === 'sails') message = readings.some(r => r.imbalance !== 0) ? 'El viento tira más de unas velas que de otras. Compara lo que lleva cada mástil.' : 'El viento se escapa por una fila incompleta. Busca un contorno sin huecos.';
  else if (chapter.rule === 'balance') message = 'Una bandeja baja más que la otra. La silueta puede cambiar; el peso depende de lo que contiene.';
  else message = 'La materia está cerca, pero quedan huecos en la pasarela.';
  return { solved, zones: readings, outside, message };
}
