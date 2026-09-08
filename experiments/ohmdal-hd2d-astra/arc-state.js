export const REGIONS = ['plaza', 'calzada', 'castillo', 'forja', 'terrazas', 'faro'];
export function initialArc() {
  return {
    region: 'plaza', visited: ['plaza'], complete: false,
    calzada: { on: false, repaired: false, probe: 0, observed: false, verified: false },
    castillo: { on: false, parallel: false, branches: [true, true, true], tripped: false, verified: false },
    forja: { on: false, coil: 0, pump: true, tripped: false, verified: false },
    terrazas: { on: false, cable: 0, reversed: true, verified: false },
    faro: { on: false, coil: 0, focus: 25, tripped: false, verified: false },
  };
}
export function machineReading(arc, region) {
  const s = arc[region];
  if (!s) return { running: false, ready: false, voltage: 0, current: 0, power: 0 };
  let voltage = 0, current = 0, power = 0, ready = false, reason = '', details = {};
  if (region === 'calzada') {
    voltage = s.on && s.repaired ? 12 : 0; current = voltage / 12;
    ready = current >= 1;
    details = { probeVoltage: s.on && !s.repaired && s.probe === 1 ? 12 : 0, source: s.on ? 12 : 0 };
    reason = !s.on ? 'La palanca está abierta.' : !s.repaired ? 'La rueda gira. La bomba no responde.' : 'El agua vuelve al canal de la plaza.';
  }
  if (region === 'castillo') {
    const enabled = s.on && !s.tripped;
    const fault = s.parallel && s.branches[2];
    const seriesCurrent = enabled && !s.parallel && s.branches.every(Boolean) ? 12 / 37 : 0;
    const currents = s.branches.map((closed, i) => enabled && s.parallel && closed ? 12 / [12, 24, 1][i] : seriesCurrent);
    current = s.parallel ? currents.reduce((a,b)=>a+b,0) : seriesCurrent;
    voltage = enabled ? 12 : 0;
    ready = enabled && s.parallel && s.branches[0] && s.branches[1] && !s.branches[2];
    details = { currents, overload: enabled && fault && current > 2, capacity: 2 };
    reason = s.tripped ? 'La protección abrió la entrada. La avería todavía tiene un camino.' : !s.on ? 'Entrada abierta. Podés reorganizar los puentes.' : !s.parallel ? 'En este recorrido comparten la tensión. La bomba no alcanza su fuerza de trabajo.' : ready ? 'La bomba y el taller funcionan. La rama dañada queda aislada.' : 'Compará qué ramas reciben corriente.';
  }
  if (region === 'forja') {
    const enabled = s.on && !s.tripped; const resistance = [3,6,12][s.coil];
    voltage = enabled ? 12 : 0; const heat = voltage * voltage / resistance; const water = enabled && s.pump ? 24 : 0;
    power = heat + water; current = power / 12;
    ready = enabled && heat >= 24 && heat <= 36 && water === 24 && power <= 60;
    details = { resistance, heat, water, capacity: 60, overload: enabled && power > 60 };
    reason = s.tripped ? 'La protección abrió: los dos oficios pedían más de lo disponible.' : !s.on ? 'Elegí una espiral y cerrá la entrada para comparar.' : !s.pump ? 'La forja recibe energía; las terrazas se quedan sin agua.' : heat < 24 ? 'El agua sube, pero la pieza de Yesca no alcanza su calor de trabajo.' : ready ? 'Calor de trabajo y agua al mismo tiempo. Todavía queda margen.' : 'La espiral pide demasiado para compartir la fuente.';
  }
  if (region === 'terrazas') {
    const resistance = [Infinity, 2, .5][s.cable]; current = s.on ? 12 / (6 + resistance) : 0; voltage = current * 6;
    ready = voltage >= 10 && !s.reversed;
    details = { resistance, lineLoss: current * (Number.isFinite(resistance) ? resistance : 0), direction: s.reversed ? -1 : 1 };
    reason = !s.on ? 'La bomba está detenida.' : !Number.isFinite(resistance) ? 'La cuerda sostiene, pero no conduce.' : s.reversed ? 'El motor gira: está devolviendo agua al depósito de abajo.' : voltage < 10 ? 'La rueda intenta subir agua, pero pierde fuerza en el cable largo.' : 'El depósito alto recibe agua. Las hileras se riegan juntas.';
  }
  if (region === 'faro') {
    const enabled = s.on && !s.tripped, ballast = [0,3,6,12][s.coil];
    current = enabled ? 24 / (6 + ballast) : 0; voltage = current * 6;
    const aligned = Math.abs(s.focus - 62) <= 4;
    ready = voltage >= 11 && voltage <= 13 && aligned;
    details = { ballast, aligned, overload: enabled && voltage > 15, lampPower: voltage * current };
    reason = s.tripped ? 'La protección de la lámpara abrió. Llegaba demasiada tensión.' : !s.on ? 'La lente conserva las marcas de Nereo.' : voltage < 11 ? 'El filamento apenas responde: el haz no alcanza la otra orilla.' : !aligned ? 'La lámpara está estable. Las dos marcas de la lente todavía no coinciden.' : 'Un haz definido cruza el lago. La alimentación se mantiene estable.';
  }
  if (region !== 'forja') power = voltage * current;
  return { voltage, current, power, ready: !!ready, running: current > 0, reason, ...details };
}
export function arcAction(arc, region, action, value) {
  const next = structuredClone(arc), s = next[region];
  if (!s || typeof s !== 'object' || !('verified' in s)) return next;
  if (action === 'power') s.on = !s.on;
  if (action === 'probe' && region === 'calzada' && Number.isInteger(value) && value >= 0 && value < 3) { s.probe = value; s.observed = true; }
  if (action === 'repair' && region === 'calzada' && !s.on && s.probe === 1 && s.observed) s.repaired = true;
  if (action === 'topology' && region === 'castillo' && !s.on) s.parallel = !s.parallel;
  if (action === 'branch' && region === 'castillo' && Number.isInteger(value) && value >= 0 && value < 3) s.branches[value] = !s.branches[value];
  if (action === 'coil' && ['forja','faro'].includes(region) && !s.on && Number.isInteger(value) && value >= 0 && value < (region === 'faro' ? 4 : 3)) s.coil = value;
  if (action === 'pump' && region === 'forja') s.pump = !s.pump;
  if (action === 'cable' && region === 'terrazas' && !s.on && Number.isInteger(value) && value >= 0 && value < 3) s.cable = value;
  if (action === 'polarity' && region === 'terrazas' && !s.on) s.reversed = !s.reversed;
  if (action === 'focus' && region === 'faro' && Number.isFinite(value)) s.focus = Math.max(0,Math.min(100,Math.round(value)));
  if (action === 'reset' && 'tripped' in s) s.tripped = false;
  if (machineReading(next,region).overload) { s.tripped = true; s.on = false; }
  if (action === 'verify' && machineReading(next,region).ready) s.verified = true;
  return next;
}
export function accessible(arc, region, crossed = true) {
  if (region === 'plaza') return true;
  const i = REGIONS.indexOf(region);
  if (i < 0 || !crossed) return false;
  return i === 1 || !!arc[REGIONS[i-1]]?.verified;
}
export function journeyReady(arc){return REGIONS.slice(1).every(region=>arc[region].verified&&machineReading(arc,region).ready);}
export function restoreArc(raw, crossed = false) {
  const arc = initialArc();
  if (!raw || typeof raw !== 'object') return arc;
  for (const region of REGIONS.slice(1)) {
    const source = raw[region]; if (!source || typeof source !== 'object') continue;
    for (const [key, value] of Object.entries(arc[region])) {
      if (typeof value === 'boolean' && typeof source[key] === 'boolean') arc[region][key] = source[key];
      if (typeof value === 'number' && Number.isFinite(source[key])) arc[region][key] = Math.round(source[key]);
    }
  }
  arc.calzada.probe = Math.max(0,Math.min(2,arc.calzada.probe));
  for (const region of ['forja','faro']) arc[region].coil = Math.max(0,Math.min(region === 'faro' ? 3 : 2,arc[region].coil));
  arc.terrazas.cable = Math.max(0,Math.min(2,arc.terrazas.cable));arc.faro.focus = Math.max(0,Math.min(100,arc.faro.focus));
  if (Array.isArray(raw.castillo?.branches) && raw.castillo.branches.length === 3 && raw.castillo.branches.every(v=>typeof v==='boolean')) arc.castillo.branches = [...raw.castillo.branches];
  // Progress and location must form a contiguous journey; corrupt saves cannot skip chapters.
  for (const region of REGIONS.slice(1)) if (!accessible(arc,region,crossed)) arc[region].verified = false;
  arc.region = accessible(arc,raw.region,crossed) ? raw.region : 'plaza';
  arc.visited = REGIONS.filter(region=>region === 'plaza' || (raw.visited?.includes?.(region) && accessible(arc,region,crossed)));
  if (!arc.visited.includes(arc.region)) arc.visited.push(arc.region);
  arc.complete = raw.complete === true && arc.faro.verified;
  return arc;
}
