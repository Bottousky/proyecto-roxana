// Puente entre datos JSON y el diálogo del slice.
import dialogues from './data/dialogues.json';
import quests from './data/quests.json';
import { L, type Line } from './dialog.ts';

export function getDialogue(id: string): Line[] {
  const raw = (dialogues as Record<string, string[][]>)[id];
  if (!raw) return [L('', `[falta diálogo: ${id}]`)];
  return raw.map((pair) => L(pair[0] ?? '', pair[1] ?? ''));
}

export function getObjectiveText(id: string): string {
  return (quests as Record<string, string>)[id] ?? '';
}
