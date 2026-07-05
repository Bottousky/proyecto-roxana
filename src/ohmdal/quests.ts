// Objetivo actual (sistema de misiones diegético mínimo) + HUD.
import { slice, saveSlice } from './save.ts';
import { getObjectiveText } from './content.ts';

function el(id: string): HTMLElement { return document.getElementById(id)!; }

export function refreshObjective(): void {
  const text = getObjectiveText(slice.objective);
  el('oj-objective').textContent = text ? `◆ ${text}` : '';
}

/** Cambia el objetivo si es distinto (evita spam de guardado). */
export function setObjective(id: string): void {
  if (slice.objective === id) return;
  slice.objective = id;
  saveSlice();
  refreshObjective();
}
