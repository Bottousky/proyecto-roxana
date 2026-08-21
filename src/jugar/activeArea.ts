/**
 * R6: `activeArea.ts` quedó como stub deprecado.
 *
 * La autoridad de gameplay es `activeRoom.ts` (ADR-002): un `ActiveRoom`
 * con `id`, `width/height` derivados y `playerLocal`. El antiguo modelo
 * `LoadedChunks` / `ChunkPlacement` / `ActiveAreaState` se basaba en
 * offsets `(ox, oy)` de un plano mundo continuo, extirpado en R5/R6.
 *
 * Migración de runtime a `activeRoom.ts`:
 *   - `ActiveAreaState` → `ActiveRoom`
 *   - `resolveActiveArea(loaded, id)` → `createActiveRoom(id, spawn?)`
 *   - `activeAreaCameraBounds(state, vp)` → `cameraBounds(activeRoomLocalBounds(room), vp)`
 *   - `activeAreaNavigationBounds(state)` → `activeRoomLocalBounds(room)`
 *
 * R7 puede retirar definitivamente este módulo cuando los tests históricos
 * que lo consumen se hayan migrado.
 */

export type { ActiveRoom } from './activeRoom.ts';
export {
  createActiveRoom,
  activeRoomLocalBounds,
} from './activeRoom.ts';
