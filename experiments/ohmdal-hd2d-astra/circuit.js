import { initialArc, restoreArc } from './arc-state.js';
// The electrical state is independent of rendering, input, and dialogue.
export const SAVE_KEY = 'ohmdal-astra-hd2d-v1';
export function initialState() {
  return { version: 1, started: false, inspected: false, talkedEdda: false, talkedLumen: false, hasStrap: false, returnRepaired: false, switchClosed: false, awakened: false, verified: false, crossed: false, player: [-6, 7], arc: initialArc() };
}
export function electricalState(state) {
  const sourceVoltage = 6;
  const loadResistance = 12;
  const closed = state.returnRepaired && state.switchClosed;
  return { closed, companionPowered: closed || state.crossed, current: closed ? sourceVoltage / loadResistance : 0, sourceVoltage, loadVoltage: closed ? sourceVoltage : 0, fault: !state.returnRepaired ? 'return-open' : !state.switchClosed ? 'switch-open' : null };
}
export function transition(state, action) {
  const next = { ...state, player: [...state.player] };
  if (action === 'start') next.started = true;
  if (action === 'inspect') next.inspected = true;
  if (action === 'edda') next.talkedEdda = true;
  if (action === 'lumen') { next.talkedLumen = true; next.hasStrap = true; }
  if (action === 'repair' && next.hasStrap) { next.returnRepaired = true; next.hasStrap = false; }
  if (action === 'switch') next.switchClosed = !next.switchClosed;
  if (electricalState(next).closed) next.awakened = true;
  if (action === 'verify' && next.awakened && electricalState(next).closed) next.verified = true;
  if (action === 'cross' && next.verified && electricalState(next).closed) next.crossed = true;
  return next;
}
export function readSave(raw) {
  const base = initialState();
  try {
    const saved = JSON.parse(raw);
    if (saved?.version !== 1) return base;
    for (const key of Object.keys(base)) if (typeof base[key] === 'boolean' && typeof saved[key] === 'boolean') base[key] = saved[key];
    if (Array.isArray(saved.player) && saved.player.length === 2 && saved.player.every(v => Number.isFinite(v) && Math.abs(v) < 40)) base.player = [...saved.player];
    if (base.returnRepaired) base.hasStrap = false;
    if (base.crossed && !base.verified) base.crossed = false;
    if (base.verified && !base.awakened) base.verified = false;
    base.arc = restoreArc(saved.arc,base.crossed);
    return base;
  } catch { return base; }
}
