// Input: keyboard + click on the canvas. Maps a logical "input state" that
// the world reads each tick.

export interface InputState {
  move: { x: number; y: number }; // unit vector (or 0,0)
  interact: boolean; // single-frame trigger
  open: boolean; // single-frame trigger
  cancel: boolean; // single-frame trigger
  pointer: { x: number; y: number; ndcX: number; ndcY: number };
  consume: () => void;
  attach: (canvas: HTMLCanvasElement) => void;
}

export function createInput(): InputState {
  const keys = new Set<string>();
  const move = { x: 0, y: 0 };
  let interact = false;
  let open = false;
  let cancel = false;
  const pointer = { x: 0, y: 0, ndcX: 0, ndcY: 0 };

  const refreshMove = () => {
    let x = 0;
    let y = 0;
    if (keys.has("KeyW") || keys.has("ArrowUp")) y += 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) y -= 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
    const len = Math.hypot(x, y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    move.x = x;
    move.y = y;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    keys.add(e.code);
    refreshMove();
    if (e.code === "KeyE" || e.code === "Space") {
      interact = true;
      e.preventDefault();
    }
    if (e.code === "KeyJ" || e.code === "Tab") {
      open = true;
      e.preventDefault();
    }
    if (e.code === "Escape" || e.code === "KeyX") {
      cancel = true;
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    keys.delete(e.code);
    refreshMove();
  };

  let attached: HTMLCanvasElement | null = null;
  const onPointerMove = (e: PointerEvent) => {
    if (!attached) return;
    const rect = attached.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.ndcX = (pointer.x / rect.width) * 2 - 1;
    pointer.ndcY = -((pointer.y / rect.height) * 2 - 1);
  };
  const onPointerDown = (e: PointerEvent) => {
    if (!attached) return;
    if (e.button === 0) {
      // Left click is also "interact" as a fallback when no keyboard.
      interact = true;
    }
  };

  const attach = (canvas: HTMLCanvasElement) => {
    attached = canvas;
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", () => {
    keys.clear();
    refreshMove();
  });

  const consume = () => {
    interact = false;
    open = false;
    cancel = false;
  };

  return { move, interact, open, cancel, pointer, consume, attach };
}
