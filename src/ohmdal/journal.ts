// Bitácora del slice: entradas desde JSON, desbloqueo por conocimiento, modal DOM.
import journalData from './data/journal.json';
import { slice, saveSlice } from './save.ts';
import { toast } from './dialog.ts';

interface JEntry { title: string; fecha: string; lore: string; tecnica: string; }
const DATA = journalData as Record<string, JEntry>;

function el(id: string): HTMLElement { return document.getElementById(id)!; }

let onNotify: (() => void) | null = null;
export function setJournalNotifier(cb: () => void): void { onNotify = cb; }

/** Desbloquea una entrada; idempotente. Devuelve true si era nueva. */
export function unlockEntry(id: string): boolean {
  if (!DATA[id] || slice.journal.includes(id)) return false;
  slice.journal.push(id);
  saveSlice();
  toast(`✒ Nueva entrada en la Bitácora: «${DATA[id].title}»`);
  markDot(true);
  onNotify?.();
  return true;
}

export function hasEntry(id: string): boolean { return slice.journal.includes(id); }

function markDot(on: boolean): void {
  el('oj-journal-dot').classList.toggle('hidden', !on);
}

export function isJournalOpen(): boolean {
  return !el('oj-journal').classList.contains('hidden');
}

export function openJournal(): void {
  markDot(false);
  const body = el('oj-journal-body');
  if (slice.journal.length === 0) {
    body.innerHTML = `<p class="oj-empty">La Bitácora está en blanco. Se escribe sola cuando entendés algo.</p>`;
  } else {
    body.innerHTML = slice.journal
      .map((id) => DATA[id])
      .filter(Boolean)
      .map(
        (e) => `
        <article class="oj-entry">
          <h3>${e.title}</h3>
          <p class="oj-fecha">${e.fecha}</p>
          <p class="oj-lore">${e.lore}</p>
          <div class="oj-tecnica"><span class="oj-tecnica-tag">El nombre verdadero</span><p>${e.tecnica}</p></div>
        </article>`,
      )
      .join('');
  }
  el('oj-journal').classList.remove('hidden');
}

export function closeJournal(): void {
  el('oj-journal').classList.add('hidden');
}

export function toggleJournal(): void {
  if (isJournalOpen()) closeJournal();
  else openJournal();
}
