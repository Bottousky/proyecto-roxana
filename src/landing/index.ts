import { readSchoolState } from './schoolModel.ts';
import { portalGateUrl } from '../shared/portalLink.ts';
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

function renderProgress(): void {
  const school = readSchoolState();
  const {
    unidadesCompletadas: completed,
    totalUnidades: total,
    arcoCompleto,
  } = school.electronica;
  const started = school.aulas.electronica !== 'off';
  const content = $('#progress-content');
  if (content) {
    content.replaceChildren();
    const lead = document.createElement('p');
    lead.textContent = arcoCompleto
      ? 'La luz volvió a Ohmdal. Tu recorrido sigue en la memoria del Instituto.'
      : started
        ? 'El Instituto conserva lo que descubriste en Ohmdal.'
        : 'Tu Bitácora todavía tiene sus páginas en blanco. La primera aventura te espera en Ohmdal.';
    const count = document.createElement('p');
    count.className = 'progress-count';
    count.textContent = `${completed} / ${total} unidades recuperadas`;
    const progress = document.createElement('progress');
    progress.max = total;
    progress.value = completed;
    progress.setAttribute('aria-label', 'Unidades recuperadas en Ohmdal');
    const note = document.createElement('p');
    note.className = 'notice';
    note.textContent =
      'Este recorrido corresponde al guardado de Ohmdal del portal escolar en este navegador. Las versiones experimentales tienen partidas independientes.';
    content.append(lead, count, progress, note);
  }
  const action = $<HTMLAnchorElement>('#progress-play');
  if (action) {
    action.href = started ? '/jugar' : portalGateUrl();
    action.textContent = started
      ? 'Continuar mi recorrido →'
      : 'Entrar a Ohmdal →';
  }
}

function openDialog(id: string): void {
  const dialog = $<HTMLDialogElement>(`#${id}`);
  if (!dialog) return;
  if (id === 'progress-dialog') renderProgress();
  if (id === 'settings-dialog') applyPreferences();
  document
    .querySelectorAll<HTMLDialogElement>('dialog[open]')
    .forEach((other) => other.close());
  closeMenu(false);
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
document
  .querySelectorAll<HTMLElement>('[data-open-dialog]')
  .forEach((button) =>
    button.addEventListener('click', () =>
      openDialog(button.dataset.openDialog!),
    ),
  );
window.addEventListener('roxana:open-dialog', (event) =>
  openDialog((event as CustomEvent<string>).detail),
);

const worlds: Record<
  string,
  { title: string; category: string; description: string }
> = {
  bitland: {
    title: 'Bitland',
    category: 'PROGRAMACIÓN / EN EL HORIZONTE',
    description:
      'Un mundo para descubrir cómo una secuencia, una condición o una repetición pueden transformar lo que ocurre. El aula de Programación todavía espera su primer viaje.',
  },
  arithmos: {
    title: 'Arithmos',
    category: 'MATEMÁTICA / EN EL HORIZONTE',
    description:
      'Patrones, proporciones y estructuras: el lenguaje que conecta lo que parece distinto. El aula de Matemática conserva la puerta a este mundo todavía por despertar.',
  },
};
document.querySelectorAll<HTMLElement>('[data-world]').forEach((button) =>
  button.addEventListener('click', () => {
    const world = worlds[button.dataset.world!];
    if (!world) return;
    const title = $('#world-title'),
      category = $('#world-category'),
      description = $('#world-description');
    if (title) title.textContent = world.title;
    if (category) category.textContent = world.category;
    if (description) description.textContent = world.description;
    openDialog('world-dialog');
  }),
);

function selectRoom(id: string): void {
  $('#school-experience')?.scrollIntoView({
    behavior: preferences.motion ? 'instant' : 'smooth',
    block: 'start',
  });
  if (location.hash === `#sala/${id}`)
    window.dispatchEvent(new CustomEvent('roxana:select-room', { detail: id }));
  else location.hash = `sala/${id}`;
}
$('#explore-institute')?.addEventListener('click', () => selectRoom('hall'));
document
  .querySelectorAll<HTMLElement>('[data-select-room]')
  .forEach((button) =>
    button.addEventListener('click', () =>
      selectRoom(button.dataset.selectRoom!),
    ),
  );

const menuToggle = $('.menu-toggle');
const menu = $('#site-nav');
const mobileMenu = window.matchMedia('(max-width: 900px)');
function closeMenu(restoreFocus = false): void {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menú');
  menu?.classList.remove('is-open');
  if (menu) menu.inert = mobileMenu.matches;
  if (restoreFocus) menuToggle?.focus();
}
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menu?.classList.toggle('is-open', open);
  if (menu) menu.inert = !open && mobileMenu.matches;
});
mobileMenu.addEventListener('change', () => closeMenu());
closeMenu();
menu
  ?.querySelectorAll('a')
  .forEach((a) => a.addEventListener('click', () => closeMenu()));
document.addEventListener('click', (event) => {
  if (!(event.target as Element).closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (
    event.key === 'Escape' &&
    menuToggle?.getAttribute('aria-expanded') === 'true'
  ) {
    event.preventDefault();
    closeMenu(true);
  }
});

const year = $('#year');
if (year) year.textContent = String(new Date().getFullYear());
document.querySelectorAll<HTMLAnchorElement>('[data-play]').forEach((link) => {
  link.href = portalGateUrl();
});
$('#retry-scene')?.addEventListener('click', () => location.reload());

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
  }
}
void startScene();
document.addEventListener('visibilitychange', () =>
  ambience.setVisible(!document.hidden),
);
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) ambience.dispose();
});

const sections = document.querySelectorAll<HTMLElement>('main section[id]');
const navObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      menu?.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
        if (link.hash === `#${entry.target.id}`)
          link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  },
  { rootMargin: '-15% 0px -55% 0px' },
);
sections.forEach((section) => navObserver.observe(section));
