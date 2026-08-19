/**
 * CameraDirector — capa explícita entre el área activa y la cámara
 * de Phaser. Hasta el commit 2, el runtime componía los bounds a
 * mano con `cameras.main.setBounds(minX, minY, maxX-minX, maxY-minY)`
 * y dejaba que Phaser hiciera el resto. Ese acoplamiento hacía
 * imposible razonar sobre áreas más grandes que el viewport sin
 * tocar la lógica de follow.
 *
 * Reglas del director:
 *
 *  1. Recibe un `areaRect` en coordenadas WORLD y un `viewportSize`
 *     (típicamente 960×540). El área activa puede ser:
 *       a) un único chunk → su rect es `(ox, oy, width, height)`;
 *       b) la unión de varios chunks → `unionAreaBounds(chunks)`.
 *
 *  2. Si `area.w <= viewport.w` el centro X de la cámara se fija en
 *     `area.x + area.w/2 - viewport.w/2`. Análogamente para Y. La
 *     cámara queda centrada sobre el área y el jugador se mueve
 *     dentro del rect visible. Esto replica el comportamiento del
 *     commit 1 cuando un área mide exactamente el viewport.
 *
 *  3. Si `area.w > viewport.w` el centro X de la cámara se clampa
 *     a `[area.x + viewport.w/2, area.x + area.w - viewport.w/2]`.
 *     Análogamente para Y. La cámara sigue al jugador pero no
 *     puede asomarse fuera del área en ninguno de los cuatro
 *     bordes.
 *
 *  4. La función es pura: no toca el motor. `ExplorationScene`
 *     llama a `clampCenter()` (o `desiredCenter()`) y aplica el
 *     resultado a `cameras.main`. Esto permite probar el director
 *     con áreas ficticias (1920×1080) sin necesitar Phaser.
 */

import type { Point, Rect } from './spatial.ts';

export interface ViewportSize {
  width: number;
  height: number;
}

/** Centro cámara clampado al área activa. Devuelve coordenadas
 *  WORLD: la posición que debe tener la cámara para que el área
 *  se vea correctamente. La convención es la misma que usa Phaser
 *  (`cameras.main.scrollX`/`scrollY`): esquina superior izquierda
 *  del viewport. */
export function clampCenter(
  target: Point,
  area: Rect,
  viewport: ViewportSize,
): Point {
  if (viewport.width <= 0 || viewport.height <= 0) {
    throw new Error('CameraDirector: viewport inválido');
  }
  if (area.w <= 0 || area.h <= 0) {
    throw new Error('CameraDirector: área inválida');
  }
  const desiredX = target.x - viewport.width / 2;
  const desiredY = target.y - viewport.height / 2;
  return {
    x: clamp(desiredX, area.x, area.x + area.w - viewport.width),
    y: clamp(desiredY, area.y, area.y + area.h - viewport.height),
  };
}

/** Versión especializada: el `target` es el centro deseado (no la
 *  esquina). Útil cuando el código de la escena prefiere razonar
 *  en centros (Phaser expone `cameras.main.midPoint`). */
export function clampCenterPoint(
  targetCenter: Point,
  area: Rect,
  viewport: ViewportSize,
): Point {
  const corner = clampCenter(
    { x: targetCenter.x, y: targetCenter.y },
    area,
    viewport,
  );
  return { x: corner.x + viewport.width / 2, y: corner.y + viewport.height / 2 };
}

/** Bounds Phaser-compatible. Equivalente a
 *  `cameras.main.setBounds(area.x, area.y, area.w, area.h)` cuando
 *  el área es ≥ viewport, y un rect "centrado" cuando el área es
 *  más chica que el viewport (Phaser acepta `setBounds` con
 *  valores menores que el viewport, pero conviene ser explícitos
 *  para los tests). */
export function cameraBounds(area: Rect, viewport: ViewportSize): Rect {
  if (area.w <= viewport.width) {
    return {
      x: area.x + (area.w - viewport.width) / 2,
      y: area.y + (area.h - viewport.height) / 2,
      w: viewport.width,
      h: viewport.height,
    };
  }
  return { x: area.x, y: area.y, w: area.w, h: area.h };
}

/** Indica si el área activa es más chica que el viewport. En ese
 *  caso la cámara se queda centrada y no sigue al jugador. */
export function isAreaSmallerThanViewport(area: Rect, viewport: ViewportSize): boolean {
  return area.w <= viewport.width && area.h <= viewport.height;
}

/** Indica si el centro de cámara deseado está tocando alguno de
 *  los cuatro bordes del área. Útil para depuración, tests y
 *  futuros gizmos de UI (dead-zones, etc.). */
export function isAtBorder(cameraCenter: Point, area: Rect, viewport: ViewportSize, epsilon = 0.5): {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
} {
  const minX = area.x + viewport.width / 2;
  const maxX = area.x + area.w - viewport.width / 2;
  const minY = area.y + viewport.height / 2;
  const maxY = area.y + area.h - viewport.height / 2;
  return {
    left: Math.abs(cameraCenter.x - minX) <= epsilon,
    right: Math.abs(cameraCenter.x - maxX) <= epsilon,
    top: Math.abs(cameraCenter.y - minY) <= epsilon,
    bottom: Math.abs(cameraCenter.y - maxY) <= epsilon,
  };
}

/** Aplica `cameraBounds` a una `Phaser.Cameras.Scene2D.Camera`
 *  (cualquier objeto con `setBounds(x, y, w, h)`). Se importa
 *  suelto para que el motor no se meta en este módulo ni en sus
 *  tests. */
export function applyToPhaserCamera(
  camera: { setBounds: (x: number, y: number, w: number, h: number) => void },
  area: Rect,
  viewport: ViewportSize,
): void {
  const b = cameraBounds(area, viewport);
  camera.setBounds(b.x, b.y, b.w, b.h);
}

function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    // El área es más chica que el viewport en este eje: el "rango
    // válido" para el corner se reduce a un punto. Devolvemos el
    // centro de ese punto para mantener la cámara centrada.
    return (min + max) / 2;
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
