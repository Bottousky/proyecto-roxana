/** Resistive DC network, solved with modified nodal analysis.
 * Currents are signed a→b; source current is positive when delivered to the network.
 * Sources are ideal. Leads are explicitly resistive; isolated islands have no voltage
 * relative to the source reference. Motors/lamps here are nominal DC load models.
 */
const EPS = 1e-10;

function linearSolve(matrix, rhs) {
  const a = matrix.map((row, i) => [...row, rhs[i]]);
  const n = rhs.length;
  for (let k = 0; k < n; k++) {
    let pivot = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[pivot][k])) pivot = i;
    if (Math.abs(a[pivot][k]) < EPS) return null;
    [a[k], a[pivot]] = [a[pivot], a[k]];
    const factor = a[k][k];
    for (let j = k; j <= n; j++) a[k][j] /= factor;
    for (let i = 0; i < n; i++) if (i !== k) {
      const q = a[i][k];
      if (Math.abs(q) < EPS) continue;
      for (let j = k; j <= n; j++) a[i][j] -= q * a[k][j];
    }
  }
  return a.map(row => row[n]);
}

function reachableFrom(node, edges) {
  const seen = new Set([node]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const edge of edges) {
      if (seen.has(edge.a) && !seen.has(edge.b)) { seen.add(edge.b); grew = true; }
      if (seen.has(edge.b) && !seen.has(edge.a)) { seen.add(edge.a); grew = true; }
    }
  }
  return seen;
}

export function solveDC({ nodes = [], resistors = [], sources = [], ground = sources[0]?.negative ?? nodes[0] }) {
  const active = resistors.filter(r => r.enabled !== false && Number.isFinite(r.resistance) && r.resistance >= 0)
    .map(r => ({ ...r, resistance: Math.max(0.0001, r.resistance) }));
  const sourceEdges = sources.map(s => ({ a: s.positive, b: s.negative }));
  const allNodes = [...new Set([...nodes, ground, ...active.flatMap(r => [r.a, r.b]), ...sources.flatMap(s => [s.positive, s.negative])])].filter(Boolean);
  const reachable = reachableFrom(ground, [...active, ...sourceEdges]);
  const unknowns = allNodes.filter(n => n !== ground && reachable.has(n));
  const includedSources = sources.filter(s => reachable.has(s.positive) && reachable.has(s.negative));
  const idx = new Map(unknowns.map((node, i) => [node, i]));
  const size = unknowns.length + includedSources.length;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const rhs = Array(size).fill(0);
  for (const r of active) {
    if (!reachable.has(r.a) || !reachable.has(r.b)) continue;
    const i = idx.get(r.a), j = idx.get(r.b), g = 1 / r.resistance;
    if (i !== undefined) matrix[i][i] += g;
    if (j !== undefined) matrix[j][j] += g;
    if (i !== undefined && j !== undefined) { matrix[i][j] -= g; matrix[j][i] -= g; }
  }
  includedSources.forEach((source, k) => {
    const row = unknowns.length + k;
    const p = idx.get(source.positive), m = idx.get(source.negative);
    if (p !== undefined) { matrix[p][row] += 1; matrix[row][p] += 1; }
    if (m !== undefined) { matrix[m][row] -= 1; matrix[row][m] -= 1; }
    rhs[row] = source.voltage;
  });
  const result = size ? linearSolve(matrix, rhs) : [];
  const valid = result !== null;
  const voltages = Object.fromEntries(allNodes.map(n => [n, n === ground ? 0 : reachable.has(n) && valid ? result[idx.get(n)] : null]));
  const branches = Object.fromEntries(resistors.map(r => {
    const va = voltages[r.a], vb = voltages[r.b];
    const enabled = r.enabled !== false && Number.isFinite(r.resistance) && r.resistance >= 0;
    const voltage = va !== null && vb !== null && va !== undefined && vb !== undefined ? va - vb : null;
    const current = enabled && voltage !== null ? voltage / Math.max(.0001, r.resistance) : 0;
    return [r.id, { voltage, current, power: enabled && voltage !== null ? voltage * current : 0, resistance: r.resistance, enabled }];
  }));
  const sourceCurrents = Object.fromEntries(includedSources.map((s, k) => [s.id, valid ? -result[unknowns.length + k] : 0]));
  return { valid, voltages, branches, sourceCurrents, floatingNodes: allNodes.filter(n => !reachable.has(n)) };
}

export function measureVoltage(solution, positive, negative) {
  const a = solution.voltages[positive], b = solution.voltages[negative];
  if (a === null || b === null || a === undefined || b === undefined) return null;
  return a - b;
}

/** An ohmmeter applies its own small test source. Disconnect external supplies first. */
export function measureResistance({ resistors = [], nodes = [] }, a, b) {
  if (!a || !b) return null;
  if (a === b) return 0;
  const edges = resistors.filter(r => r.enabled !== false && Number.isFinite(r.resistance));
  if (!reachableFrom(a, edges).has(b)) return Infinity;
  const solution = solveDC({ nodes, resistors: edges, sources: [{ id: 'meter', positive: a, negative: b, voltage: 1 }], ground: b });
  const current = solution.sourceCurrents.meter;
  return solution.valid && current > EPS ? 1 / current : Infinity;
}

export function checkOperatingRange(branch, { minVoltage = 0, maxVoltage = Infinity, minCurrent = 0, maxCurrent = Infinity, maxPower = Infinity } = {}) {
  return branch && branch.voltage !== null && branch.voltage >= minVoltage - EPS && branch.voltage <= maxVoltage + EPS && branch.current >= minCurrent - EPS && branch.current <= maxCurrent + EPS && branch.power <= maxPower + EPS;
}
