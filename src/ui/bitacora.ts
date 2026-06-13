import { el, pushUI, popUI, uiOpen } from './overlay';
import { toast } from './dialog';
import { getEntries } from '../content/entries';
import { state, resetSave } from '../state';
import { sfxUIOpen, sfxUIClose } from '../audio';

let isOpen = false;
const openedEntries = new Set<string>();

/** Muestra el botón del HUD (cuando el jugador obtiene la Bitácora). */
export function showBitacoraButton(): void {
  el('bitacora-btn').classList.remove('hidden');
}

/** Aviso de entrada nueva: toast + punto rojo en el botón. Nunca interrumpe. */
export function notifyNewEntry(title: string): void {
  showBitacoraButton();
  el('bitacora-dot').classList.remove('hidden');
  toast(`✒ La Bitácora se escribió sola: «${title}»`);
}

export function openBitacora(entryId?: string): void {
  if (isOpen) return;
  isOpen = true;
  if (entryId) openedEntries.add(entryId);
  pushUI();
  sfxUIOpen();
  el('bitacora-dot').classList.add('hidden');

  const host = el('bitacora');
  host.classList.remove('hidden');
  host.innerHTML = '';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'bita-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeBitacora);
  host.appendChild(closeBtn);

  const book = document.createElement('div');
  book.className = 'bita-book';
  host.appendChild(book);

  const index = document.createElement('div');
  index.className = 'bita-index';
  index.innerHTML = '<h3>Bitácora</h3>';
  book.appendChild(index);

  const content = document.createElement('div');
  content.className = 'bita-content';
  book.appendChild(content);

  const entries = getEntries();
  let current = entryId ?? entries[entries.length - 1]?.id;

  const renderEntry = () => {
    const entry = entries.find((e) => e.id === current);
    if (!entry) {
      content.innerHTML = '<p style="font-style:italic">Páginas en blanco.</p>';
      return;
    }
    content.innerHTML = `
      <h2>${entry.title}</h2>
      <div class="fecha">${entry.fecha}</div>
      <div class="bita-viv"><span class="viv-tag">Lo que viví</span>${entry.vivencial}</div>
      ${entry.formal
        ? `<div class="bita-formal"><span class="formal-tag">Lo que entiendo ahora</span>${entry.formal}</div>`
        : ''}`;
    content.scrollTop = 0;
    index.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.id === current);
    });
  };

  for (const entry of entries) {
    const btn = document.createElement('button');
    btn.textContent = entry.title;
    btn.dataset.id = entry.id;
    btn.addEventListener('click', () => {
      current = entry.id;
      renderEntry();
    });
    index.appendChild(btn);
  }

  const blank = document.createElement('div');
  blank.className = 'blank-note';
  blank.textContent =
    entries.length === 0
      ? 'Todas las páginas están en blanco. Por ahora.'
      : 'El resto de las páginas espera en blanco.';
  index.appendChild(blank);

  const footer = document.createElement('div');
  footer.className = 'bita-footer';
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reiniciar demo';
  resetBtn.addEventListener('click', () => {
    if (confirm('¿Borrar el progreso y empezar de nuevo?')) {
      resetSave();
      location.reload();
    }
  });
  footer.appendChild(resetBtn);
  index.appendChild(footer);

  renderEntry();
}

export function wasBitacoraEntryOpened(entryId: string): boolean {
  return openedEntries.has(entryId);
}

export function closeBitacora(): void {
  if (!isOpen) return;
  isOpen = false;
  sfxUIClose();
  el('bitacora').classList.add('hidden');
  el('bitacora').innerHTML = '';
  popUI();
}

export function initBitacora(): void {
  el('bitacora-btn').addEventListener('click', () => {
    if (!state.flags.hasBitacora) return;
    if (!isOpen) openBitacora();
  });
  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'Escape' && isOpen) closeBitacora();
    // B abre/cierra la Bitácora sin mouse (no se abre sobre diálogos o bancos)
    if (ev.code === 'KeyB' && state.flags.hasBitacora) {
      if (isOpen) closeBitacora();
      else if (!uiOpen()) openBitacora();
    }
  });
}
