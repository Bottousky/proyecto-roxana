// Modelo de entrada puro: sabe qué tecla hace qué acción, qué está apretado,
// qué intención de movimiento resulta de eso, y si una reasignación de tecla
// es legal — sin tocar el DOM ni el laboratorio. Nadie lo importa todavía:
// cablearlo (lab.ts, eventos de teclado/pointer reales) es el paquete ARC1-009-B.
//
// El mapeo de ejes reproduce EXACTO el de manualIntent() en lab.ts (~186-190):
// x = up − down, z = right − left. Es la convención isométrica ya instalada,
// no se toca acá.

export type InputAction = 'up' | 'down' | 'left' | 'right' | 'action' | 'cancel';

const ACTIONS: readonly InputAction[] = ['up', 'down', 'left', 'right', 'action', 'cancel'];

// Los ocho bindings de movimiento son los de hoy (lab.ts:152-156, keyMap).
// `action` y `cancel` son acciones nuevas de este ticket: Space/Enter y Escape
// son la elección convencional de un juego web para ESTE PAQUETE (no es canon
// del guion) — a discutir en el review si hace falta otra cosa.
export const DEFAULT_BINDINGS: Readonly<Record<InputAction, readonly string[]>> = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  action: ['Space', 'Enter'],
  cancel: ['Escape'],
};

// Teclas que el navegador necesita para su propia navegación (accesibilidad,
// no comodidad): nunca se pueden reasignar a una acción del juego.
export const RESERVED_KEYS: readonly string[] = [
  'Tab',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
];

export interface RebindResult {
  ok: boolean;
  reason?: 'reserved-key' | 'duplicate-binding' | 'orphan-action';
  conflictsWith?: InputAction;
}

export interface InputModel {
  actionFor(code: string): InputAction | null;
  press(code: string): boolean;
  release(code: string): boolean;
  pressAction(action: InputAction): void;
  releaseAction(action: InputAction): void;
  isDown(action: InputAction): boolean;
  movementIntent(): { x: number; z: number };
  bindingsFor(action: InputAction): readonly string[];
  rebind(action: InputAction, code: string): RebindResult;
  unbind(action: InputAction, code: string): RebindResult;
  reset(): void;
  serialize(): string;
  releaseAll(): void;
}

function cloneDefaults(): Record<InputAction, readonly string[]> {
  const result = {} as Record<InputAction, readonly string[]>;
  for (const action of ACTIONS) result[action] = [...DEFAULT_BINDINGS[action]];
  return result;
}

export function createInputModel(bindings?: Record<string, readonly string[]>): InputModel {
  const current: Record<InputAction, string[]> = {} as Record<InputAction, string[]>;
  for (const action of ACTIONS) {
    const provided = bindings?.[action];
    current[action] = provided ? [...provided] : [...DEFAULT_BINDINGS[action]];
  }

  // Índice inverso código -> acción. Se reconstruye entera en reset() (son pocas
  // entradas) y se actualiza incremental en rebind() (una sola tecla nueva).
  const codeToAction = new Map<string, InputAction>();
  const rebuildIndex = (): void => {
    codeToAction.clear();
    for (const action of ACTIONS) {
      for (const code of current[action]) codeToAction.set(code, action);
    }
  };
  rebuildIndex();

  // Dos fuentes de "apretado" que conviven sin privilegiarse: códigos de tecla
  // (vía press/release) y acciones directas (vía pressAction/releaseAction, el
  // camino táctil). isDown() las mira a ambas.
  const pressedCodes = new Set<string>();
  const pressedActionsDirect = new Set<InputAction>();

  const isDown = (action: InputAction): boolean => {
    if (pressedActionsDirect.has(action)) return true;
    for (const code of pressedCodes) {
      if (codeToAction.get(code) === action) return true;
    }
    return false;
  };

  return {
    actionFor(code: string): InputAction | null {
      return codeToAction.get(code) ?? null;
    },

    press(code: string): boolean {
      const action = codeToAction.get(code);
      if (action === undefined) return false;
      pressedCodes.add(code);
      return true;
    },

    release(code: string): boolean {
      const action = codeToAction.get(code);
      if (action === undefined) return false;
      pressedCodes.delete(code);
      return true;
    },

    pressAction(action: InputAction): void {
      pressedActionsDirect.add(action);
    },

    releaseAction(action: InputAction): void {
      pressedActionsDirect.delete(action);
    },

    isDown,

    movementIntent(): { x: number; z: number } {
      return {
        x: Number(isDown('up')) - Number(isDown('down')),
        z: Number(isDown('right')) - Number(isDown('left')),
      };
    },

    bindingsFor(action: InputAction): readonly string[] {
      return [...current[action]];
    },

    rebind(action: InputAction, code: string): RebindResult {
      if (RESERVED_KEYS.includes(code)) {
        return { ok: false, reason: 'reserved-key' };
      }
      const owner = codeToAction.get(code) ?? null;
      if (owner === action) {
        // La acción pedida ya tiene esta tecla: no-op exitoso, sin duplicarla.
        return { ok: true };
      }
      if (owner !== null) {
        if (current[owner].length === 1) {
          // Sería la última tecla de `owner`: moverla la dejaría inalcanzable
          // para quien no puede usar el mouse.
          return { ok: false, reason: 'orphan-action' };
        }
        // La tecla no se roba en silencio: se informa el conflicto y decide
        // el llamador (no la movemos nosotros).
        return { ok: false, reason: 'duplicate-binding', conflictsWith: owner };
      }
      // Tecla libre: se agrega a los bindings de `action` (aditivo, no reemplaza
      // las que ya tenía).
      current[action] = [...current[action], code];
      codeToAction.set(code, action);
      return { ok: true };
    },

    unbind(action: InputAction, code: string): RebindResult {
      if (RESERVED_KEYS.includes(code)) {
        return { ok: false, reason: 'reserved-key' };
      }
      const owner = codeToAction.get(code) ?? null;
      if (owner !== action) {
        if (owner === null) {
          // La tecla no está ligada a nadie: no hay nada que quitar. No-op exitoso.
          return { ok: true };
        }
        // La tecla es de otra acción: el llamador pidió quitársela a una que no es suya.
        return { ok: false, reason: 'duplicate-binding', conflictsWith: owner };
      }
      if (current[action].length === 1) {
        // Sería la última tecla: la acción quedaría inalcanzable para quien no puede usar el mouse.
        return { ok: false, reason: 'orphan-action' };
      }
      current[action] = current[action].filter((bound) => bound !== code);
      codeToAction.delete(code);
      return { ok: true };
    },

    reset(): void {
      for (const action of ACTIONS) current[action] = [...DEFAULT_BINDINGS[action]];
      rebuildIndex();
      pressedCodes.clear();
      pressedActionsDirect.clear();
    },

    serialize(): string {
      return JSON.stringify(current);
    },

    releaseAll(): void {
      pressedCodes.clear();
      pressedActionsDirect.clear();
    },
  };
}

export function parseBindings(raw: string | null): {
  bindings: Record<InputAction, readonly string[]>;
  fellBackToDefaults: boolean;
} {
  const fallback = (): { bindings: Record<InputAction, readonly string[]>; fellBackToDefaults: boolean } => ({
    bindings: cloneDefaults(),
    fellBackToDefaults: true,
  });

  if (raw === null || raw === '') return fallback();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback();
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return fallback();

  const record = parsed as Record<string, unknown>;
  const keys = Object.keys(record);
  const hasExactlyLasSeisAcciones =
    keys.length === ACTIONS.length &&
    ACTIONS.every((action) => Object.prototype.hasOwnProperty.call(record, action));
  if (!hasExactlyLasSeisAcciones) return fallback();

  const result = {} as Record<InputAction, readonly string[]>;
  for (const action of ACTIONS) {
    const value = record[action];
    if (!Array.isArray(value) || value.length === 0 || !value.every((code) => typeof code === 'string')) {
      return fallback();
    }
    result[action] = [...value] as readonly string[];
  }

  return { bindings: result, fellBackToDefaults: false };
}
