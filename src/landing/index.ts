import { initSchoolApp } from './schoolApp.ts';
import { InstituteAmbience } from './ambience.ts';
import {
  defaultPreferences,
  readPreferences,
  savePreferences,
  systemReducedMotion,
  type VisitPreferences,
} from './preferences.ts';

const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);
const html = document.documentElement;
let preferences = readPreferences();
// Sound always waits for an explicit gesture in the current visit.
preferences.sound = false;
const ambience = new InstituteAmbience();
const announce = (message: string) => {
  const el = $('#landing-announcement');
  if (el) el.textContent = message;
};

function applyPreferences(persist = false): void {
  html.dataset.motion = preferences.motion ? 'reduced' : 'full';
  html.dataset.labels = String(preferences.labels);
  html.dataset.quality = preferences.quality;
  html.dataset.sound = String(preferences.sound);
  const quality = $<HTMLSelectElement>('#setting-quality');
  if (quality) quality.value = preferences.quality;
  for (const key of ['motion', 'labels', 'sound'] as const) {
    const input = $<HTMLInputElement>(`#setting-${key}`);
    if (input) input.checked = preferences[key];
  }
  const sound = $('#sound-toggle');
  sound?.setAttribute('aria-pressed', String(preferences.sound));
  sound?.setAttribute(
    'aria-label',
    preferences.sound ? 'Silenciar sonido ambiente' : 'Activar sonido ambiente',
  );
  sound?.setAttribute(
    'title',
    preferences.sound ? 'Silenciar ambiente' : 'Activar ambiente',
  );
  window.dispatchEvent(
    new CustomEvent<VisitPreferences>('roxana:preferences', {
      detail: { ...preferences },
    }),
  );
  if (persist) {
    const saved = savePreferences(preferences);
    const status = $('#settings-status');
    if (status)
      status.textContent = saved
        ? 'Ajustes guardados en este navegador.'
        : 'Ajustes aplicados a esta visita. El navegador no permite guardarlos.';
  }
}
applyPreferences();

async function setSound(enabled: boolean): Promise<void> {
  const active = await ambience.setEnabled(enabled);
  preferences.sound = active;
  applyPreferences(true);
  announce(
    enabled && !active
      ? 'El navegador no pudo activar el sonido.'
      : active
        ? 'Sonido ambiente activado.'
        : 'Sonido ambiente silenciado.',
  );
}

$('#sound-toggle')?.addEventListener('click', () => {
  void setSound(!preferences.sound);
});
$('#settings-form')?.addEventListener('submit', (event) =>
  event.preventDefault(),
);
$('#settings-form')?.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement | HTMLSelectElement;
  if (input.id === 'setting-sound') {
    void setSound((input as HTMLInputElement).checked);
    return;
  }
  if (input.id === 'setting-quality')
    preferences.quality = input.value as VisitPreferences['quality'];
  if (input.id === 'setting-motion')
    preferences.motion = (input as HTMLInputElement).checked;
  if (input.id === 'setting-labels')
    preferences.labels = (input as HTMLInputElement).checked;
  applyPreferences(true);
});
$('#settings-form')?.addEventListener('reset', (event) => {
  event.preventDefault();
  preferences = defaultPreferences(systemReducedMotion());
  void ambience.setEnabled(false);
  applyPreferences(true);
});
window
  .matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', (event) => {
    preferences.motion = event.matches;
    applyPreferences();
  });

function openDialog(id: string): void {
  const dialog = $<HTMLDialogElement>(`#${id}`);
  if (!dialog) return;
  if (id === 'settings-dialog') applyPreferences();
  document
    .querySelectorAll<HTMLDialogElement>('dialog[open]')
    .forEach((other) => other.close());
  dialog.showModal();
  html.classList.add('modal-open');
  window.dispatchEvent(new CustomEvent('roxana:dialog', { detail: true }));
}

document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => {
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [
      ...dialog.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]',
      ),
    ].filter(
      (element) =>
        element.getClientRects().length > 0 && !element.closest('[inert]'),
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (!first || !last) return;
    if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === dialog)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog
    .querySelectorAll('[data-close-dialog]')
    .forEach((button) =>
      button.addEventListener('click', () => dialog.close()),
    );
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  dialog.addEventListener('close', () => {
    const open = !!document.querySelector('dialog[open]');
    html.classList.toggle('modal-open', open);
    window.dispatchEvent(new CustomEvent('roxana:dialog', { detail: open }));
  });
});
window.addEventListener('roxana:open-dialog', (event) =>
  openDialog((event as CustomEvent<string>).detail),
);

document.addEventListener('click', (event) => {
  const target = (event.target as Element).closest<HTMLElement>(
    '[data-close-dialog], [data-open-dialog]',
  );
  if (target?.hasAttribute('data-close-dialog'))
    target.closest<HTMLDialogElement>('dialog')?.close();
  if (target?.dataset.openDialog) openDialog(target.dataset.openDialog);
});
$('#search-school')?.addEventListener('click', () =>
  openDialog('search-dialog'),
);
$('#retry-scene')?.addEventListener('click', () => location.reload());
initSchoolApp();

// Preserve canonical classroom deep links and the graphical unit projector.
let aulasReady = false;
async function initLegacyClassroom(): Promise<void> {
  if (!location.hash.startsWith('#aula/') || aulasReady) return;
  aulasReady = true;
  const grid = document.createElement('div');
  grid.id = 'aulas-grid';
  grid.hidden = true;
  document.body.append(grid);
  const { initAulas } = await import('./aulas.ts');
  initAulas();
}
window.addEventListener('hashchange', () => {
  void initLegacyClassroom();
});
void initLegacyClassroom();

// Critical text and links are usable while the scene downloads.
async function startScene(): Promise<void> {
  const roomToggle = $<HTMLButtonElement>('#school3d-rooms-toggle');
  if (roomToggle) roomToggle.disabled = true;
  try {
    const { initSchool3D } = await import('./school3d.ts');
    await initSchool3D();
  } catch {
    $('#school3d-loading')?.classList.add('is-ready');
    const fallback = $('#school3d-fallback');
    if (fallback) fallback.hidden = false;
    html.dataset.scene = 'failed';
  } finally {
    if (roomToggle) roomToggle.disabled = false;
    if (html.dataset.scene === 'failed')
      window.dispatchEvent(new CustomEvent('roxana:scene-unavailable'));
  }
}
void startScene();
document.addEventListener('visibilitychange', () =>
  ambience.setVisible(!document.hidden),
);
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) ambience.dispose();
});
