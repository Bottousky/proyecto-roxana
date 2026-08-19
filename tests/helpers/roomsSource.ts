/**
 * roomsSource.ts — helper de tests para leer la topología REAL de rooms.ts
 * sin importar el módulo (que arrastra UI/DOM y assets `?url`, no
 * importables en Node sin shims).
 *
 * Extrae, por room, las doors reales (`to` + `spawn`) directamente del
 * fuente. Si una door deja de tener `spawn` en la misma línea o el formato
 * cambia, este parser falla (no silencia).
 *
 * Es el mismo patrón de `m0` / `_legacy_r1-grafo-de-salas`.
 */

import { readFileSync } from 'node:fs';

export interface ParsedDoor {
  to: string;
  spawn: { x: number; y: number };
}

export interface ParsedRoomSource {
  id: string;
  doors: ParsedDoor[];
}

export function parseRoomsSource(): Record<string, ParsedRoomSource> {
  const src = readFileSync(new URL('../../src/jugar/rooms.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const body = src.slice(src.indexOf('export const ROOMS'));
  if (!body) throw new Error('rooms.ts no exporta ROOMS');

  const result: Record<string, ParsedRoomSource> = {};
  const roomRe = /^ {2}([a-z_0-9]+): \{$/gm;
  let m: RegExpExecArray | null;
  while ((m = roomRe.exec(body)) !== null) {
    const id = m[1];
    const openIdx = m.index + m[0].length;
    let depth = 1;
    let closeIdx = -1;
    const lines = body.slice(openIdx).split('\n');
    let consumed = 0;
    for (const line of lines) {
      if (/\{/.test(line)) depth += (line.match(/\{/g) ?? []).length;
      if (/\}/.test(line)) depth -= (line.match(/\}/g) ?? []).length;
      consumed += line.length + 1;
      if (depth <= 0) { closeIdx = openIdx + consumed - 1; break; }
    }
    if (closeIdx < 0) throw new Error(`roomsSource: no se pudo cerrar el bloque de «${id}»`);
    const block = body.slice(m.index, closeIdx);

    const doors: ParsedDoor[] = [];
    const doorRe = /to:\s*'([^']+)'\s*,\s*spawn:\s*\{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+)\s*\}/g;
    let dm: RegExpExecArray | null;
    while ((dm = doorRe.exec(block)) !== null) {
      doors.push({ to: dm[1], spawn: { x: Number(dm[2]), y: Number(dm[3]) } });
    }
    const rawTos = (block.match(/\bto:\s*'[a-z_0-9]+'/g) ?? []).length;
    if (doors.length !== rawTos) {
      throw new Error(
        `roomsSource: en «${id}» se parsearon ${doors.length} doors con spawn pero hay ${rawTos} "to:" — el parser está desactualizado respecto a rooms.ts`,
      );
    }
    result[id] = { id, doors };
  }
  return result;
}

/** Nombres de todas las rooms declaradas en rooms.ts. */
export function parsedRoomIds(): string[] {
  return Object.keys(parseRoomsSource());
}
