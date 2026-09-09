import { CHAPTERS } from './chapters.ts';
import { evaluate, initialBoard, matchesChapter } from './core.ts';
import type { SavedGame } from './types';

export const SAVE_KEY = 'roxana:arithmos:arc-one:v1';
export function freshSave(): SavedGame {
  return { version: 1, chapter: 0, boards: CHAPTERS.map(initialBoard), restored: [], journal: [], muted: false, reducedMotion: false };
}

function normalize(value: unknown): SavedGame {
  const result = freshSave();
  if (!value || typeof value !== 'object') return result;
  const input = value as Partial<SavedGame>;
  if (input.version !== 1) return result;
  result.muted = input.muted === true;
  result.reducedMotion = input.reducedMotion === true;
  if (Array.isArray(input.boards)) {
    CHAPTERS.forEach((chapter, index) => {
      const candidate = input.boards![index];
      if (candidate && matchesChapter(chapter, candidate)) {
        result.boards[index] = { pieces: candidate.pieces.map(p => ({ id: p.id, x: p.x, z: p.z, width: p.width, units: p.units.map(u => ({ id: u.id, matter: u.matter })) })), nextId: candidate.nextId };
      }
    });
  }
  // Claims cannot unlock a chapter: only a complete, geometrically valid state can.
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (!evaluate(CHAPTERS[i], result.boards[i]).solved) break;
    result.restored.push(CHAPTERS[i].id);
    result.journal.push(CHAPTERS[i].id);
  }
  const unlocked = Math.min(result.restored.length, CHAPTERS.length - 1);
  result.chapter = Number.isInteger(input.chapter) ? Math.max(0, Math.min(input.chapter!, unlocked)) : unlocked;
  return result;
}

export function readSave(storage?: Storage): SavedGame {
  try {
    const target = storage ?? globalThis.localStorage;
    const raw = target?.getItem(SAVE_KEY);
    return raw ? normalize(JSON.parse(raw)) : freshSave();
  } catch { return freshSave(); }
}

export function writeSave(save: SavedGame, storage?: Storage): boolean {
  try {
    const target = storage ?? globalThis.localStorage;
    if (!target) return false;
    const clean = normalize(save);
    target.setItem(SAVE_KEY, JSON.stringify(clean));
    return true;
  } catch { return false; }
}
