/**
 * Small, renderer-agnostic controls adapter for the Ohmdal PlayCanvas route.
 *
 * The runtime owns the player and camera state. This module only translates
 * browser input into look/direction callbacks and owns the browser-only bits
 * that are easy to get wrong: pointer cancellation, pointer-lock intent,
 * touch orientation gating, and an accessible compass.
 */

export type PlayerMoveKey = 'w' | 'a' | 's' | 'd' | 'q' | 'r';
export type PlayerLookSource = 'drag' | 'pointer-lock' | 'keyboard';

export interface PlayerLookState {
  yaw: number;
  pitch: number;
}

export interface PlayerLookInput extends PlayerLookState {
  deltaX: number;
  deltaY: number;
  deltaYaw: number;
  deltaPitch: number;
  pointerId: number | null;
  pointerType: string;
  source: PlayerLookSource;
}

export interface PlayerDirectionInput {
  active: boolean;
  button: HTMLElement;
  key: PlayerMoveKey;
  pointerId: number;
  pointerType: string;
}

export interface PointerLockRestoreOptions {
  element: HTMLElement;
  /** Override device detection in deterministic QA or an embedding runtime. */
  isTouchDevice?: () => boolean;
  onChange?: (locked: boolean) => void;
  onError?: (event: Event) => void;
}

export interface PointerLockRestoreHandle {
  readonly element: HTMLElement;
  isLocked(): boolean;
  /** Whether a previous mouse gesture still intends to keep pointer lock. */
  hasIntent(): boolean;
  /** Request pointer lock from a trusted mouse gesture. */
  requestFromGesture(event?: MouseEvent | PointerEvent): boolean;
  /** Re-request only when a previous lock intent was retained. */
  restoreFromGesture(event?: MouseEvent | PointerEvent): boolean;
  /** Explicitly forget the retained intent without calling exitPointerLock. */
  clearIntent(): void;
  dispose(): void;
}

export interface CompassOptions {
  mount: HTMLElement;
  initialHeading?: number;
  label?: string;
}

export interface CompassHandle {
  readonly element: HTMLElement;
  setHeading(heading: number): void;
  getHeading(): number;
  dispose(): void;
}

export interface OrientationGateOptions {
  mount: HTMLElement;
  message?: string;
  title?: string;
  /** Keep the gate limited to touch/coarse devices; desktop narrow windows pass. */
  isTouchDevice?: () => boolean;
  onChange?: (blocked: boolean) => void;
}

export interface OrientationGateHandle {
  readonly element: HTMLElement;
  isBlocked(): boolean;
  refresh(): boolean;
  dispose(): void;
}

export interface PlayerControlsOptions {
  /** Canvas or a transparent overlay covering the playable view. */
  lookSurface: HTMLElement;
  /** Existing buttons carrying data-move-key="w/a/s/d/q/r". */
  directionalButtons?: Iterable<HTMLElement> | HTMLElement;
  initialYaw?: number;
  initialPitch?: number;
  lookSensitivity?: number;
  minPitch?: number;
  maxPitch?: number;
  isEnabled?: () => boolean;
  isTouchDevice?: () => boolean;
  onLook?: (input: PlayerLookInput) => void;
  onDirection?: (input: PlayerDirectionInput) => void;
  pointerLock?: PointerLockRestoreOptions | false;
  compass?: CompassOptions | false;
  orientationGate?: OrientationGateOptions | false;
}

export interface PlayerControlsHandle {
  readonly pointerLock: PointerLockRestoreHandle | null;
  readonly compass: CompassHandle | null;
  readonly orientationGate: OrientationGateHandle | null;
  getLook(): PlayerLookState;
  setLook(state: Partial<PlayerLookState>): PlayerLookState;
  applyLookDelta(deltaX: number, deltaY: number, source?: PlayerLookSource, pointerId?: number | null, pointerType?: string): PlayerLookState;
  releaseAll(): void;
  dispose(): void;
}

export const PLAYER_MOVE_KEYS: readonly PlayerMoveKey[] = Object.freeze(['w', 'a', 's', 'd', 'q', 'r']);

const MOVE_KEY_SET = new Set<PlayerMoveKey>(PLAYER_MOVE_KEYS);
const DEFAULT_LOOK_SENSITIVITY = 0.15;
const DEFAULT_MIN_PITCH = -80;
const DEFAULT_MAX_PITCH = 80;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeHeading(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function isPointerEvent(event: Event): event is PointerEvent {
  return 'pointerId' in event && 'pointerType' in event;
}

function pointerTypeOf(event: Event): string {
  if (isPointerEvent(event)) return event.pointerType || 'mouse';
  return 'mouse';
}

function isMouseGesture(event: MouseEvent | PointerEvent | undefined): boolean {
  if (!event || !isPointerEvent(event)) return true;
  return event.pointerType === '' || event.pointerType === 'mouse';
}

function elementsFrom(value: Iterable<HTMLElement> | HTMLElement | undefined): HTMLElement[] {
  if (!value) return [];
  if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) return [value];
  return Array.from(value as Iterable<HTMLElement>);
}

/** True when the browser advertises touch points or a coarse primary pointer. */
export function detectTouchDevice(): boolean {
  const touchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0;
  const coarse = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;
  return touchPoints > 0 || coarse;
}

function isPortraitViewport(): boolean {
  if (typeof window === 'undefined') return false;
  const orientation = typeof window.matchMedia === 'function'
    ? window.matchMedia('(orientation: portrait)').matches
    : false;
  return orientation || window.innerHeight > window.innerWidth;
}

function cardinalForHeading(heading: number): string {
  // The authored Plaza calls +Z north (Omega/Manantial), and -X west
  // (Lumen's workshop). Engine forward -Z is therefore south in this world.
  const labels = ['Sur', 'Oeste', 'Norte', 'Este'] as const;
  return labels[Math.round(normalizeHeading(heading) / 90) % labels.length] ?? 'Norte';
}

function degreesLabel(heading: number): string {
  return `${Math.round(normalizeHeading(heading + 180)).toString().padStart(3, '0')}°`;
}

/**
 * Mounts a small visual compass whose accessible label always includes the
 * current cardinal heading and degrees. It has no GPS dependency: the caller
 * supplies the PlayCanvas yaw through setHeading().
 */
export function createCompass(options: CompassOptions): CompassHandle {
  const element = document.createElement('div');
  element.className = 'ohmdal-compass';
  element.tabIndex = 0;
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', options.label ?? 'Rumbo');
  element.title = options.label ?? 'Rumbo';

  const dial = document.createElement('div');
  dial.className = 'ohmdal-compass__dial';
  dial.setAttribute('aria-hidden', 'true');
  dial.innerHTML = [
    '<span class="ohmdal-compass__cardinal ohmdal-compass__cardinal--north">N</span>',
    '<span class="ohmdal-compass__cardinal ohmdal-compass__cardinal--east">E</span>',
    '<span class="ohmdal-compass__cardinal ohmdal-compass__cardinal--south">S</span>',
    '<span class="ohmdal-compass__cardinal ohmdal-compass__cardinal--west">O</span>',
    '<span class="ohmdal-compass__needle"></span>',
  ].join('');
  const readout = document.createElement('span');
  readout.className = 'ohmdal-compass__readout';
  readout.setAttribute('aria-hidden', 'true');
  element.append(dial, readout);
  options.mount.appendChild(element);

  let heading = normalizeHeading(finiteOr(options.initialHeading, 0));
  const update = (nextHeading: number): void => {
    heading = normalizeHeading(finiteOr(nextHeading, heading));
    const cardinal = cardinalForHeading(heading);
    const degrees = degreesLabel(heading);
    dial.style.transform = `rotate(${-normalizeHeading(heading + 180)}deg)`;
    readout.textContent = `${cardinal} · ${degrees}`;
    element.dataset.heading = degrees;
    element.setAttribute('aria-label', `${options.label ?? 'Rumbo'}: ${cardinal}, ${degrees}`);
  };
  update(heading);

  return {
    element,
    setHeading(nextHeading) {
      update(nextHeading);
    },
    getHeading() {
      return heading;
    },
    dispose() {
      element.remove();
    },
  };
}

/**
 * Shows a safe-area-aware rotate-device gate only for touch/coarse portrait
 * viewports. Narrow desktop windows remain playable.
 */
export function createOrientationGate(options: OrientationGateOptions): OrientationGateHandle {
  const element = document.createElement('section');
  element.className = 'ohmdal-orientation-gate';
  element.setAttribute('role', 'alert');
  element.setAttribute('aria-live', 'assertive');
  element.setAttribute('aria-hidden', 'true');

  const panel = document.createElement('div');
  panel.className = 'ohmdal-orientation-gate__panel';
  const icon = document.createElement('span');
  icon.className = 'ohmdal-orientation-gate__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '↻';
  const title = document.createElement('h2');
  title.className = 'ohmdal-orientation-gate__title';
  title.textContent = options.title ?? 'Gira el dispositivo';
  const message = document.createElement('p');
  message.className = 'ohmdal-orientation-gate__message';
  message.textContent = options.message ?? 'Coloca Ohmdal en horizontal para jugar.';
  panel.append(icon, title, message);
  element.appendChild(panel);
  options.mount.appendChild(element);

  const touchDevice = options.isTouchDevice ?? detectTouchDevice;
  let blocked = false;
  const refresh = (): boolean => {
    const next = touchDevice() && isPortraitViewport();
    if (next === blocked) return blocked;
    blocked = next;
    element.hidden = !blocked;
    element.setAttribute('aria-hidden', String(!blocked));
    element.dataset.blocked = String(blocked);
    options.onChange?.(blocked);
    return blocked;
  };

  const onViewportChange = (): void => {
    refresh();
  };
  window.addEventListener('resize', onViewportChange, { passive: true });
  window.addEventListener('orientationchange', onViewportChange, { passive: true });
  element.hidden = true;
  element.dataset.blocked = 'false';
  refresh();

  return {
    element,
    isBlocked() {
      return blocked;
    },
    refresh,
    dispose() {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
      element.remove();
    },
  };
}

/**
 * Pointer lock is intentionally gesture-driven. Browsers may reject an
 * automatic restore without user activation, so a lost lock retains intent
 * and the host calls restoreFromGesture() on the next mouse pointerdown.
 * Escape clears that intent. Touch/pen input never requests pointer lock.
 */
export function createPointerLockRestore(options: PointerLockRestoreOptions): PointerLockRestoreHandle {
  const touchDevice = options.isTouchDevice ?? detectTouchDevice;
  let locked = typeof document !== 'undefined' && document.pointerLockElement === options.element;
  let intent = locked;

  const onPointerLockChange = (): void => {
    locked = document.pointerLockElement === options.element;
    if (locked) intent = true;
    options.onChange?.(locked);
  };
  const onPointerLockError = (event: Event): void => {
    options.onError?.(event);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') intent = false;
  };

  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('pointerlockerror', onPointerLockError);
  window.addEventListener('keydown', onKeyDown);

  const request = (event?: MouseEvent | PointerEvent, restoring = false): boolean => {
    if (!isMouseGesture(event) || touchDevice()) return false;
    if (restoring && !intent) return false;
    intent = true;
    if (document.pointerLockElement === options.element) {
      locked = true;
      return true;
    }

    try {
      const requestResult = options.element.requestPointerLock?.();
      if (requestResult && typeof (requestResult as Promise<void>).catch === 'function') {
        void (requestResult as Promise<void>).catch(() => {
          // Keep intent: the next trusted gesture can retry after a browser reject.
        });
      }
    } catch {
      // Keep intent: the next trusted gesture can retry after a synchronous reject.
    }
    return true;
  };

  return {
    element: options.element,
    isLocked() {
      return locked;
    },
    hasIntent() {
      return intent;
    },
    requestFromGesture(event) {
      return request(event);
    },
    restoreFromGesture(event) {
      return request(event, true);
    },
    clearIntent() {
      intent = false;
    },
    dispose() {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}

function rightHalf(surface: HTMLElement, clientX: number): boolean {
  const rect = surface.getBoundingClientRect();
  return rect.width > 0 && clientX >= rect.left + rect.width * 0.5;
}

function isPrimaryPointer(event: PointerEvent): boolean {
  // Every touch/pen contact may own a movement button. Only mouse buttons
  // need the primary-pointer guard, so a second finger can move while the
  // first finger is dragging the look surface.
  return event.pointerType !== 'mouse' && event.pointerType !== '' ? true : event.isPrimary;
}

function isTouchLikePointer(event: PointerEvent): boolean {
  return event.pointerType === 'touch' || event.pointerType === 'pen';
}

function eventTime(): number {
  if (typeof performance !== 'undefined' && Number.isFinite(performance.now())) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Installs touch-safe drag look and multi-pointer directional buttons. The
 * callbacks are deliberately small so the PlayCanvas runtime can keep yaw,
 * pitch, movement and gameplay state as its own source of truth.
 */
export function createPlayerControls(options: PlayerControlsOptions): PlayerControlsHandle {
  const sensitivity = finiteOr(options.lookSensitivity, DEFAULT_LOOK_SENSITIVITY);
  const minPitch = finiteOr(options.minPitch, DEFAULT_MIN_PITCH);
  const maxPitch = Math.max(minPitch, finiteOr(options.maxPitch, DEFAULT_MAX_PITCH));
  const canInteract = options.isEnabled ?? (() => true);
  const onLook = options.onLook ?? (() => undefined);
  const onDirection = options.onDirection ?? (() => undefined);
  const pointerLock = options.pointerLock === false || options.pointerLock === undefined
    ? null
    : createPointerLockRestore(options.pointerLock);
  const compass = options.compass === false || options.compass === undefined
    ? null
    : createCompass(options.compass);
  let releaseAllInput: () => void = () => undefined;
  const orientationGateOptions = options.orientationGate;
  const orientationGate = orientationGateOptions === false || orientationGateOptions === undefined
    ? null
    : createOrientationGate({
      ...orientationGateOptions,
      onChange(blocked) {
        if (blocked) releaseAllInput();
        orientationGateOptions.onChange?.(blocked);
      },
    });

  let lookState: PlayerLookState = {
    yaw: normalizeHeading(finiteOr(options.initialYaw, 180)),
    pitch: clamp(finiteOr(options.initialPitch, 0), minPitch, maxPitch),
  };

  const activeLookPointers = new Map<number, { lastX: number; lastY: number; pointerType: string }>();
  const activeDirectionPointers = new Map<number, { button: HTMLElement; key: PlayerMoveKey; pointerType: string }>();
  const activeTouchPointers = new Set<number>();
  let suppressTouchClickUntil = 0;
  const previousTouchAction = options.lookSurface.style.touchAction;
  const previousUserSelect = options.lookSurface.style.userSelect;
  options.lookSurface.style.touchAction = 'none';
  options.lookSurface.style.userSelect = 'none';

  const isBlocked = (): boolean => orientationGate?.isBlocked() ?? false;

  const setLook = (state: Partial<PlayerLookState>): PlayerLookState => {
    lookState = {
      yaw: state.yaw === undefined ? lookState.yaw : normalizeHeading(finiteOr(state.yaw, lookState.yaw)),
      pitch: state.pitch === undefined ? lookState.pitch : clamp(finiteOr(state.pitch, lookState.pitch), minPitch, maxPitch),
    };
    compass?.setHeading(lookState.yaw);
    return { ...lookState };
  };

  const applyLookDelta = (
    deltaX: number,
    deltaY: number,
    source: PlayerLookSource = 'drag',
    pointerId: number | null = null,
    pointerType = source === 'pointer-lock' ? 'mouse' : 'touch',
  ): PlayerLookState => {
    if (!canInteract() || isBlocked() || (!Number.isFinite(deltaX) && !Number.isFinite(deltaY))) return { ...lookState };
    const x = Number.isFinite(deltaX) ? deltaX : 0;
    const y = Number.isFinite(deltaY) ? deltaY : 0;
    const deltaYaw = -x * sensitivity;
    const deltaPitch = -y * sensitivity;
    const next = setLook({ yaw: lookState.yaw + deltaYaw, pitch: lookState.pitch + deltaPitch });
    onLook({
      ...next,
      deltaX: x,
      deltaY: y,
      deltaYaw,
      deltaPitch,
      pointerId,
      pointerType,
      source,
    });
    return next;
  };

  const applyYawDelta = (
    deltaYaw: number,
    source: PlayerLookSource = 'keyboard',
    pointerType = 'keyboard',
  ): PlayerLookState => {
    if (!canInteract() || isBlocked() || !Number.isFinite(deltaYaw)) return { ...lookState };
    const next = setLook({ yaw: lookState.yaw + deltaYaw });
    onLook({
      ...next,
      deltaX: 0,
      deltaY: 0,
      deltaYaw,
      deltaPitch: 0,
      pointerId: null,
      pointerType,
      source,
    });
    return next;
  };

  const releaseLookPointer = (pointerId: number): void => {
    const state = activeLookPointers.get(pointerId);
    if (!state) return;
    activeLookPointers.delete(pointerId);
    try {
      if (options.lookSurface.hasPointerCapture(pointerId)) options.lookSurface.releasePointerCapture(pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const releaseDirectionPointer = (pointerId: number): void => {
    const state = activeDirectionPointers.get(pointerId);
    if (!state) return;
    activeDirectionPointers.delete(pointerId);
    try {
      if (state.button.hasPointerCapture(pointerId)) state.button.releasePointerCapture(pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
    onDirection({
      active: false,
      button: state.button,
      key: state.key,
      pointerId,
      pointerType: state.pointerType,
    });
  };

  const releaseAll = (): void => {
    for (const pointerId of [...activeLookPointers.keys()]) releaseLookPointer(pointerId);
    for (const pointerId of [...activeDirectionPointers.keys()]) releaseDirectionPointer(pointerId);
    if (activeTouchPointers.size > 0) {
      activeTouchPointers.clear();
      suppressTouchClickUntil = eventTime() + 700;
    }
  };
  releaseAllInput = releaseAll;

  const onLookPointerDown = (event: PointerEvent): void => {
    const touchLike = isTouchLikePointer(event);
    if (touchLike) {
      activeTouchPointers.add(event.pointerId);
      suppressTouchClickUntil = eventTime() + 700;
    }
    if (!isPrimaryPointer(event) || event.button !== 0 || !canInteract() || isBlocked()) return;
    if (!rightHalf(options.lookSurface, event.clientX)) return;
    // Keep one look finger authoritative while allowing other fingers to hold
    // directional buttons at the same time.
    if (touchLike && activeLookPointers.size > 0 && !activeLookPointers.has(event.pointerId)) return;
    event.preventDefault();
    releaseLookPointer(event.pointerId);
    try {
      options.lookSurface.setPointerCapture(event.pointerId);
    } catch {
      // Some test doubles and older WebViews do not expose pointer capture.
    }
    activeLookPointers.set(event.pointerId, {
      lastX: event.clientX,
      lastY: event.clientY,
      pointerType: pointerTypeOf(event),
    });
    if (event.pointerType === 'mouse') pointerLock?.requestFromGesture(event);
  };

  const onLookPointerMove = (event: PointerEvent): void => {
    const state = activeLookPointers.get(event.pointerId);
    if (!state || pointerLock?.isLocked()) return;
    event.preventDefault();
    const deltaX = event.clientX - state.lastX;
    const deltaY = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    applyLookDelta(deltaX, deltaY, 'drag', event.pointerId, state.pointerType);
  };

  const onLookPointerEnd = (event: PointerEvent): void => {
    releaseLookPointer(event.pointerId);
  };

  const onSurfacePointerEnd = (event: PointerEvent): void => {
    if (!isTouchLikePointer(event)) return;
    if (!activeTouchPointers.delete(event.pointerId)) return;
    suppressTouchClickUntil = eventTime() + 700;
  };

  const onTouchCompatibilityClick = (event: MouseEvent): void => {
    if (activeTouchPointers.size === 0 && eventTime() > suppressTouchClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onPointerLockMouseMove = (event: MouseEvent): void => {
    if (!pointerLock?.isLocked() || !canInteract() || isBlocked()) return;
    applyLookDelta(event.movementX, event.movementY, 'pointer-lock', null, 'mouse');
  };

  const onKeyboardTurn = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if ((key !== 'q' && key !== 'r') || event.ctrlKey || event.metaKey || event.altKey) return;
    // Keep the browser shortcuts above intact, while preventing the runtime's
    // legacy q/r path from applying a second turn or turning during a modal.
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!canInteract() || isBlocked()) return;
    applyYawDelta(key === 'q' ? 7 : -7, 'keyboard', 'keyboard');
  };

  options.lookSurface.addEventListener('pointerdown', onLookPointerDown);
  options.lookSurface.addEventListener('pointermove', onLookPointerMove);
  options.lookSurface.addEventListener('pointerup', onLookPointerEnd);
  options.lookSurface.addEventListener('pointercancel', onLookPointerEnd);
  options.lookSurface.addEventListener('lostpointercapture', onLookPointerEnd);
  options.lookSurface.addEventListener('click', onTouchCompatibilityClick, true);
  const onLookContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };
  options.lookSurface.addEventListener('contextmenu', onLookContextMenu);
  document.addEventListener('mousemove', onPointerLockMouseMove);
  window.addEventListener('pointerup', onSurfacePointerEnd, true);
  window.addEventListener('pointercancel', onSurfacePointerEnd, true);
  // Capture before the runtime's legacy bubble listener so q/r can only
  // update the camera through this adapter once per gesture.
  window.addEventListener('keydown', onKeyboardTurn, true);

  const cleanups: Array<() => void> = [];
  const buttons = elementsFrom(options.directionalButtons);
  for (const button of buttons) {
    const keyValue = button.dataset.moveKey?.toLowerCase();
    if (!keyValue || !MOVE_KEY_SET.has(keyValue as PlayerMoveKey)) continue;
    const key = keyValue as PlayerMoveKey;
    const onButtonDown = (event: PointerEvent): void => {
      if (!isPrimaryPointer(event) || event.button !== 0 || !canInteract() || isBlocked()) return;
      event.preventDefault();
      releaseDirectionPointer(event.pointerId);
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // See the matching look-surface guard above.
      }
      const pointerType = pointerTypeOf(event);
      activeDirectionPointers.set(event.pointerId, { button, key, pointerType });
      onDirection({ active: true, button, key, pointerId: event.pointerId, pointerType });
    };
    const onButtonEnd = (event: PointerEvent): void => {
      releaseDirectionPointer(event.pointerId);
    };
    const onButtonContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
    };
    button.addEventListener('pointerdown', onButtonDown);
    button.addEventListener('pointerup', onButtonEnd);
    button.addEventListener('pointercancel', onButtonEnd);
    button.addEventListener('lostpointercapture', onButtonEnd);
    button.addEventListener('contextmenu', onButtonContextMenu);
    cleanups.push(() => {
      button.removeEventListener('pointerdown', onButtonDown);
      button.removeEventListener('pointerup', onButtonEnd);
      button.removeEventListener('pointercancel', onButtonEnd);
      button.removeEventListener('lostpointercapture', onButtonEnd);
      button.removeEventListener('contextmenu', onButtonContextMenu);
    });
  }

  const onWindowBlur = (): void => releaseAll();
  const onVisibilityChange = (): void => {
    if (document.visibilityState !== 'visible') releaseAll();
  };
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return {
    pointerLock,
    compass,
    orientationGate,
    getLook() {
      return { ...lookState };
    },
    setLook,
    applyLookDelta,
    releaseAll,
    dispose() {
      releaseAll();
      options.lookSurface.removeEventListener('pointerdown', onLookPointerDown);
      options.lookSurface.removeEventListener('pointermove', onLookPointerMove);
      options.lookSurface.removeEventListener('pointerup', onLookPointerEnd);
      options.lookSurface.removeEventListener('pointercancel', onLookPointerEnd);
      options.lookSurface.removeEventListener('lostpointercapture', onLookPointerEnd);
      options.lookSurface.removeEventListener('click', onTouchCompatibilityClick, true);
      options.lookSurface.removeEventListener('contextmenu', onLookContextMenu);
      document.removeEventListener('mousemove', onPointerLockMouseMove);
      window.removeEventListener('pointerup', onSurfacePointerEnd, true);
      window.removeEventListener('pointercancel', onSurfacePointerEnd, true);
      window.removeEventListener('keydown', onKeyboardTurn, true);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      for (const cleanup of cleanups) cleanup();
      options.lookSurface.style.touchAction = previousTouchAction;
      options.lookSurface.style.userSelect = previousUserSelect;
      pointerLock?.dispose();
      compass?.dispose();
      orientationGate?.dispose();
    },
  };
}
