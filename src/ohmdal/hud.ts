// HUD mínimo DOM: objetivo actual, botón de Bitácora e indicador de interacción.
import { toggleJournal, closeJournal, isJournalOpen, setJournalNotifier } from './journal.ts';
import { refreshObjective } from './quests.ts';

function el(id: string): HTMLElement { return document.getElementById(id)!; }

export function initHud(): void {
  el('oj-journal-btn').addEventListener('click', () => toggleJournal());
  el('oj-journal-close').addEventListener('click', () => closeJournal());
  el('oj-journal').addEventListener('click', (e) => { if (e.target === el('oj-journal')) closeJournal(); });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyB' || e.code === 'KeyJ') { e.preventDefault(); toggleJournal(); }
    else if (e.code === 'Escape' && isJournalOpen()) closeJournal();
  });
  setJournalNotifier(() => {
    const b = el('oj-journal-btn');
    b.classList.add('pulse');
    window.setTimeout(() => b.classList.remove('pulse'), 1200);
  });
  refreshObjective();
}

export function showPrompt(text: string): void {
  const p = el('oj-prompt');
  p.textContent = text;
  p.classList.remove('hidden');
}
export function hidePrompt(): void {
  el('oj-prompt').classList.add('hidden');
}

export function isHudBlocking(): boolean {
  return isJournalOpen();
}
