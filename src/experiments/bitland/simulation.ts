/** Bitland P0. Logical time only: no DOM, engine, wall clock or random source. */
export type Place = 'home' | 'fork' | 'direct' | 'bypass' | 'gpio';
export type Op = 'pick' | 'fork' | 'direct' | 'bypass' | 'sense' | 'gpio' | 'drop' | 'home' | 'wait';
export type Mode = 'once' | 'three' | 'pending' | 'forever';
export type Trace = { tick: number; process: string; instruction: string; pc: number | null;
  reads: Record<string, string | number | boolean | null>;
  writes: Record<string, string | number | boolean | null>;
  result: 'ok' | 'error' | 'branch' | 'waiting'; detail: string };
export type Packet = { id: number; born: number; due: number };
export type State = { tick: number; pc: number; position: Place; carrying: number | null;
  queue: number[]; nextId: number; delivered: number[]; messages: Packet[];
  gateOpen: boolean; autoInput: boolean; ledUntil: number; led: boolean;
  cycles: number; halted: boolean; fault: string | null; program: Op[]; mode: Mode;
  lastPc: number | null; trace: Trace[]; nullSeen: boolean };
export const inherited: Op[] = ['pick', 'fork', 'direct', 'gpio', 'drop', 'home'];
export const operationNames: Record<Op, string> = {
  pick: 'Recoger', fork: 'Ir al cruce', direct: 'Tomar paso corto', bypass: 'Tomar rodeo',
  sense: 'Si paso libre: corto; si no: rodeo', gpio: 'Ir al puerto', drop: 'Entregar',
  home: 'Volver al muelle', wait: 'Esperar un pulso',
};
export function initial(program: Op[] = inherited, gateOpen = true, count = 1, mode: Mode = 'once'): State {
  if (!Number.isInteger(count) || count < 0 || count > 32) throw Error('Invalid input count');
  return { tick: 0, pc: 0, position: 'home', carrying: null, queue: Array.from({length: count}, (_, i) => i + 1),
    nextId: count + 1, delivered: [], messages: [], gateOpen, autoInput: false, ledUntil: 0, led: false,
    cycles: 0, halted: false, fault: null, program: [...program], mode, lastPc: null, trace: [], nullSeen: false };
}
const clone = <T>(value: T): T => structuredClone(value);
function record(s: State, row: Omit<Trace, 'tick'>) {
  s.trace.push({tick: s.tick, ...row});
  if (s.trace.length > 128) s.trace.shift();
}
/** One logical tick: input, FIFO peripheral delivery, then one interpreter action. */
export function tick(previous: State): State {
  const s = clone(previous); s.tick++; s.lastPc = null;
  if (s.autoInput && s.tick % 14 === 0 && s.queue.length < 8) {
    const id = s.nextId++; s.queue.push(id);
    record(s, {process: 'entrada', pc: null, instruction: 'arrival', reads: {}, writes: {packet: id}, result: 'ok', detail: `Llegó paquete ${id} al muelle.`});
  }
  while (s.messages.length && s.messages[0].due <= s.tick) {
    const packet = s.messages.shift()!;
    s.delivered.push(packet.id); s.ledUntil = s.tick + 5;
    record(s, {process: 'GPIO → LED', pc: null, instruction: 'receive', reads: {packet: packet.id}, writes: {led: true}, result: 'ok', detail: `El LED recibió paquete ${packet.id}.`});
  }
  s.led = s.tick < s.ledUntil;
  if (s.halted || s.fault) return s;
  if (s.pc === 0 && s.mode === 'pending' && !s.queue.length && s.carrying === null) {
    s.halted = !s.autoInput;
    record(s, {process: 'courier', pc: null, instruction: 'loop', reads: {pending: 0}, writes: {repeat: false},
      result: s.autoInput ? 'waiting' : 'branch', detail: s.autoInput ? 'Espera entrada en el muelle.' : 'No quedan paquetes. La repetición terminó antes de recoger.'});
    return s;
  }
  if (s.pc >= s.program.length) {
    s.cycles++;
    const again = s.mode === 'forever' || (s.mode === 'three' && s.cycles < 3) || (s.mode === 'pending' && s.queue.length > 0);
    const waiting = s.mode === 'pending' && s.autoInput && !again;
    record(s, {process: 'courier', pc: null, instruction: 'loop', reads: {mode: s.mode, pending: s.queue.length, cycles: s.cycles},
      writes: {repeat: again}, result: waiting ? 'waiting' : 'branch', detail: again ? 'La condición sigue verdadera. Vuelve al principio.' : waiting ? 'Sin paquetes. Espera la próxima entrada.' : 'La condición de repetición terminó.'});
    if (waiting) { s.cycles--; return s; }
    if (again) s.pc = 0;
    else s.halted = true;
    return s;
  }
  const op = s.program[s.pc];
  const row: Omit<Trace, 'tick'> = {process: 'courier', instruction: op, pc: s.pc,
    reads: {position: s.position, carrying: s.carrying}, writes: {}, result: 'ok', detail: ''};
  s.lastPc = s.pc; s.nullSeen = true;
  const fail = (detail: string) => { s.fault = detail; row.result = 'error'; row.detail = detail; };
  const move = (destination: Place, allowed: Place[]) => {
    if (!allowed.includes(s.position)) fail(`Desde ${s.position} no hay conexión a ${destination}.`);
    else { s.position = destination; row.writes.position = destination; row.detail = `Recorrió la pista hasta ${destination}.`; }
  };
  switch (op) {
    case 'pick':
      row.reads.pending = s.queue.length;
      if (s.position !== 'home') fail('Intentó recoger lejos del muelle.');
      else if (s.carrying !== null) fail('Ya lleva un paquete; no puede duplicar la carga.');
      else if (!s.queue.length) fail('Intentó recoger. El muelle estaba vacío.');
      else { s.carrying = s.queue.shift()!; row.writes.carrying = s.carrying; row.writes.pending = s.queue.length; row.detail = `Recogió paquete ${s.carrying}.`; }
      break;
    case 'fork': move('fork', ['home']); break;
    case 'direct':
      row.reads.gateOpen = s.gateOpen;
      if (!s.gateOpen) fail('El paso corto está cerrado. La barrera detuvo al courier.');
      else move('direct', ['fork']); break;
    case 'bypass': move('bypass', ['fork']); break;
    case 'sense':
      row.reads.gateOpen = s.gateOpen;
      move(s.gateOpen ? 'direct' : 'bypass', ['fork']);
      if (!s.fault) { row.result = 'branch'; row.detail = `Leyó paso libre = ${s.gateOpen ? 'sí' : 'no'}; tomó ${s.gateOpen ? 'paso corto' : 'rodeo'}.`; }
      break;
    case 'gpio': move('gpio', ['direct', 'bypass']); break;
    case 'home': move('home', ['gpio']); break;
    case 'drop':
      if (s.position !== 'gpio') fail('Intentó entregar sin llegar al puerto GPIO.');
      else if (s.carrying === null) fail('Intentó entregar con las manos vacías.');
      else { const id = s.carrying; s.messages.push({id, born: s.tick, due: s.tick + 3});
        s.carrying = null; row.writes = {message: id, carrying: null, due: s.tick + 3}; row.detail = `Paquete ${id} entró al bus; llegará al LED en 3 pulsos.`; }
      break;
    case 'wait': row.detail = 'Esperó un pulso. El mundo siguió ejecutando.'; break;
    default: fail('Instrucción desconocida.');
  }
  if (!s.fault) s.pc++;
  record(s, row);
  return s;
}
export function setInput(previous: State, gateOpen: boolean, autoInput = previous.autoInput): State {
  const s = clone(previous); s.gateOpen = gateOpen; s.autoInput = autoInput;
  record(s, {process: 'sensor', instruction: 'input', pc: null, reads: {gateOpen: previous.gateOpen},
    writes: {gateOpen, autoInput}, result: 'ok', detail: `Sensor externo: paso ${gateOpen ? 'abierto' : 'cerrado'}.`});
  return s;
}
export function validate(s: State, expected: number) {
  const all = [...s.queue, ...(s.carrying === null ? [] : [s.carrying]), ...s.messages.map(p => p.id), ...s.delivered];
  return { conserved: all.length === s.nextId - 1 && new Set(all).size === all.length,
    delivered: s.delivered.length >= expected, safe: !s.fault, terminated: s.halted };
}
export class Machine {
  state: State;
  history: State[] = [];
  constructor(state = initial()) { this.state = clone(state); }
  apply(next: State) { this.history.push(clone(this.state)); if (this.history.length > 64) this.history.shift(); this.state = clone(next); }
  step() { this.apply(tick(this.state)); }
  rewind() { const prior = this.history.pop(); if (prior) this.state = prior; }
}
/** Same spatial fixture for A/B. Units are model units, not engine pixels. */
export const places: Record<Place, [number, number]> = {home: [2, 7], fork: [5, 7], direct: [7, 5], bypass: [7, 9], gpio: [10, 7]};
export const routes: Place[][] = [['home', 'fork'], ['fork', 'direct', 'gpio'], ['fork', 'bypass', 'gpio'], ['gpio', 'home']];
export const components = [
  {x: 2, y: 2, w: 3, d: 2, h: 0.8, kind: 'ram', label: 'FLASH / 01'},
  {x: 7, y: 1.4, w: 2.8, d: 2, h: 1.1, kind: 'cpu', label: 'SCHEDULER'},
  {x: 1.2, y: 10, w: 2.8, d: 1.2, h: 0.5, kind: 'clock', label: 'XTAL · 16'},
  {x: 5.3, y: 11, w: 2.4, d: 1.4, h: 0.75, kind: 'ram', label: 'MEMORY'},
  {x: 10, y: 2.2, w: 1.3, d: 1.3, h: 1, kind: 'capacitor', label: 'C02'},
];
/** These presentation-only fixtures never carry gameplay packets or affect validators. */
export function ambientAt(id: number, time: number): [number, number] {
  const row = id % 10, offset = ((id * 17 + time * (1 + id % 3)) % 100) / 100;
  return [0.7 + offset * 11.6, 0.7 + row * 1.25];
}
