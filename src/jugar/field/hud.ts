export interface FieldHudView {
  title: string;
  ohm: string;
  status: string;
  inventory?: string;
  needle?: { value: number; min: number; max: number; label: string };
  energizeLabel?: string;
  energizeEnabled?: boolean;
}

function ensureDock(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let dock = document.getElementById('field-dock');
  if (dock) return dock;
  dock = document.createElement('aside');
  dock.id = 'field-dock';
  dock.className = 'hidden';
  dock.setAttribute('aria-live', 'polite');
  dock.innerHTML = `
    <div class="field-dock-title"></div>
    <div class="field-dock-ohm"></div>
    <div class="field-dock-needle hidden">
      <div class="field-dock-needle-track"><div class="field-dock-needle-fill"></div></div>
      <div class="field-dock-needle-label"></div>
    </div>
    <div class="field-dock-inv"></div>
    <div class="field-dock-status"></div>
    <button type="button" id="field-dock-energize" class="hidden">Energizar</button>
  `;
  const host = document.getElementById('app') ?? document.body;
  host.append(dock);
  return dock;
}

export function hideFieldHud(): void {
  if (typeof document === 'undefined') return;
  const dock = document.getElementById('field-dock');
  if (!dock) return;
  dock.classList.add('hidden');
}

export function renderFieldHud(view: FieldHudView, onEnergize?: () => void): void {
  const dock = ensureDock();
  if (!dock) return;
  dock.classList.remove('hidden');
  dock.querySelector('.field-dock-title')!.textContent = view.title;
  dock.querySelector('.field-dock-ohm')!.textContent = view.ohm;
  dock.querySelector('.field-dock-status')!.textContent = view.status;
  const inv = dock.querySelector<HTMLElement>('.field-dock-inv')!;
  inv.textContent = view.inventory ?? '';
  inv.classList.toggle('hidden', !view.inventory);

  const needle = dock.querySelector<HTMLElement>('.field-dock-needle')!;
  if (!view.needle) {
    needle.classList.add('hidden');
  } else {
    needle.classList.remove('hidden');
    const span = view.needle.max - view.needle.min;
    const t = span === 0 ? 0 : (view.needle.value - view.needle.min) / span;
    const fill = needle.querySelector<HTMLElement>('.field-dock-needle-fill')!;
    fill.style.width = `${Math.max(0, Math.min(1, t)) * 100}%`;
    needle.querySelector('.field-dock-needle-label')!.textContent = view.needle.label;
  }

  const button = dock.querySelector<HTMLButtonElement>('#field-dock-energize')!;
  if (!view.energizeLabel) {
    button.classList.add('hidden');
    button.onclick = null;
  } else {
    button.classList.remove('hidden');
    button.textContent = view.energizeLabel;
    button.disabled = view.energizeEnabled === false;
    button.onclick = () => onEnergize?.();
  }
}
