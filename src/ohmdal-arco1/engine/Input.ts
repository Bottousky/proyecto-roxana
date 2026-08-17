/**
 * Input — keyboard and touch.
 *
 * Movement is "intent-based": the player sets a direction (up, down,
 * left, right) and the engine integrates that into velocity. Diagonals
 * are normalized. Touch is supported via a virtual joystick (TODO for
 * later — for now keyboard is enough).
 */

export class Input {
  private moveX: number = 0;
  private moveY: number = 0;
  private listeners: { type: string; fn: (e: KeyboardEvent) => void }[] = [];
  private bound = false;
  private onInteract: () => void = () => {};
  private onCancel: () => void = () => {};

  constructor() {
    this.bind();
  }

  private bind(): void {
    if (this.bound) return;
    this.bound = true;
    const downHandler = (e: KeyboardEvent) => this.onKey(e, true);
    const upHandler = (e: KeyboardEvent) => this.onKey(e, false);
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    this.listeners.push(
      { type: 'keydown', fn: downHandler },
      { type: 'keyup', fn: upHandler },
    );
  }

  destroy(): void {
    for (const l of this.listeners) {
      window.removeEventListener(l.type, l.fn as EventListener);
    }
    this.bound = false;
  }

  setOnInteract(fn: () => void): void { this.onInteract = fn; }
  setOnCancel(fn: () => void): void { this.onCancel = fn; }

  setMove(dx: number, dy: number, pressed: boolean): void {
    if (pressed) {
      this.moveX = dx;
      this.moveY = dy;
    } else {
      // Only clear if matching; allows multiple keys
      if (this.moveX === dx) this.moveX = 0;
      if (this.moveY === dy) this.moveY = 0;
    }
  }

  getMoveX(): number { return this.moveX; }
  getMoveY(): number { return this.moveY; }

  private onKey(e: KeyboardEvent, pressed: boolean): void {
    const k = e.code;
    // Movement
    if (k === 'ArrowUp' || k === 'KeyW') { e.preventDefault(); this.setMove(0, -1, pressed); }
    if (k === 'ArrowDown' || k === 'KeyS') { e.preventDefault(); this.setMove(0, 1, pressed); }
    if (k === 'ArrowLeft' || k === 'KeyA') { e.preventDefault(); this.setMove(-1, 0, pressed); }
    if (k === 'ArrowRight' || k === 'KeyD') { e.preventDefault(); this.setMove(1, 0, pressed); }
    // Interact
    if (pressed && (k === 'KeyE' || k === 'Space' || k === 'Enter')) {
      e.preventDefault();
      this.onInteract();
    }
    if (pressed && k === 'Escape') {
      e.preventDefault();
      this.onCancel();
    }
  }
}
