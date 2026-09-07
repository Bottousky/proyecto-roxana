export interface ContactTargetLabelContext {
  nearestInteractable: string | null;
  currentRegion: string;
  currentMode: string;
  dialogueOpen: boolean;
  loading: boolean;
  modalOpen: boolean;
  probeActive: boolean;
  residueVisible: boolean;
  pointInFront: boolean;
}

export interface ContactTargetLabelProjectionInput {
  screenX: number;
  screenY: number;
  viewportWidth: number;
  viewportHeight: number;
  labelWidth: number;
  labelHeight: number;
  margin?: number;
}

export interface ContactTargetLabelProjection {
  left: number;
  top: number;
}

export interface ContactTargetLabelUpdate {
  visible: boolean;
  text?: string;
  left?: number;
  top?: number;
}

export interface ContactTargetLabelHandle {
  setText(text: string): void;
  measure(): { width: number; height: number };
  update(update: ContactTargetLabelUpdate): void;
  dispose(): void;
}

/** The world cue is only eligible while the existing moho interactable wins. */
export function shouldShowContactTargetLabel(context: ContactTargetLabelContext): boolean {
  return context.nearestInteractable === 'moho_oxido'
    && context.currentRegion === 'plaza'
    && context.currentMode === 'explore'
    && !context.dialogueOpen
    && !context.loading
    && !context.modalOpen
    && !context.probeActive
    && context.residueVisible
    && context.pointInFront;
}

export function getContactTargetLabelText(hasBrush: boolean): string {
  return hasBrush
    ? 'Limpiar contacto sulfatado · cepillo de alambre'
    : 'Contacto sulfatado · necesita cepillo de alambre';
}

/**
 * Returns a CSS position only when the complete label can fit in the canvas.
 * `screenX/screenY` use the CSS-pixel coordinates returned by the PlayCanvas
 * camera component, while `top` is the contact point's lower edge because the
 * label is translated upward in CSS.
 */
export function projectContactTargetLabel({
  screenX,
  screenY,
  viewportWidth,
  viewportHeight,
  labelWidth,
  labelHeight,
  margin = 12,
}: ContactTargetLabelProjectionInput): ContactTargetLabelProjection | null {
  if (![screenX, screenY, viewportWidth, viewportHeight, labelWidth, labelHeight, margin].every(Number.isFinite)) return null;
  if (viewportWidth <= 0 || viewportHeight <= 0 || labelWidth < 0 || labelHeight < 0 || margin < 0) return null;

  const halfWidth = labelWidth / 2;
  if (screenX < margin + halfWidth || screenX > viewportWidth - margin - halfWidth) return null;
  if (screenY < margin + labelHeight || screenY > viewportHeight - margin) return null;
  return { left: screenX, top: screenY };
}

/** Mounts a pointer-free label in the same CSS viewport as the game canvas. */
export function createContactTargetLabel(host: HTMLElement): ContactTargetLabelHandle {
  const element = document.createElement('div');
  element.id = 'ohmdal-contact-target-label';
  element.className = 'ohmdal-contact-target-label';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-hidden', 'true');
  host.appendChild(element);

  let disposed = false;
  return {
    setText(text: string): void {
      if (disposed || element.textContent === text) return;
      element.textContent = text;
    },
    measure(): { width: number; height: number } {
      if (disposed) return { width: 0, height: 0 };
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    },
    update({ visible, left, top }: ContactTargetLabelUpdate): void {
      if (disposed) return;
      const isVisible = visible && Number.isFinite(left) && Number.isFinite(top);
      element.classList.toggle('is-visible', isVisible);
      element.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      if (isVisible) {
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
      }
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      element.remove();
    },
  };
}
