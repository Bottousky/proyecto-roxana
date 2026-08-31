import { hooks } from '../../state.ts';
import { hideFieldHud, renderFieldHud, type FieldHudView } from './hud.ts';

export type FieldKind = 'ohm' | 'freno' | 'puerta' | 'distributor' | 'forge' | 'lighthouse';

export interface FieldController {
  readonly kind: FieldKind;
  readonly roomId: string;
  active(): boolean;
  hud(): FieldHudView;
  interact(thingId: string): void;
  energize?(): void;
  colorOf(thingId: string): number | undefined;
  promptOf?(thingId: string): string | undefined;
}

let controller: FieldController | null = null;

export function currentField(): FieldController | null {
  return controller;
}

export function installField(next: FieldController): FieldController {
  controller = next;
  paintField(false);
  return next;
}

export function clearField(): void {
  controller = null;
  hideFieldHud();
}

export function paintField(refreshRoom = false): void {
  if (!controller || !controller.active()) {
    hideFieldHud();
    return;
  }
  renderFieldHud(controller.hud(), () => {
    controller?.energize?.();
    afterFieldAction();
  });
  if (refreshRoom) hooks.refresh?.();
}

export function afterFieldAction(): void {
  if (!controller || !controller.active()) {
    hideFieldHud();
    hooks.refresh?.();
    return;
  }
  paintField(true);
}

export function pokeField(thingId: string): void {
  if (!controller) return;
  controller.interact(thingId);
  afterFieldAction();
}

export function fieldColor(thingId: string, fallback: number): number {
  return controller?.colorOf(thingId) ?? fallback;
}

export function fieldPrompt(thingId: string, fallback: string): string {
  return controller?.promptOf?.(thingId) ?? fallback;
}
