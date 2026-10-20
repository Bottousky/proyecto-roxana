// Canales de geometry.bin.gz. El exportador escribe todo en coma flotante (índices en 32 bits);
// scripts/pack-geometry.mjs, último paso de `npm run export:world`, guarda normales en Int8 y
// colores en Uint8 (normalizados, cuatro componentes) e índices en 16 bits donde alcanzan.
// Cada canal declara su tipo; uno sin tipo es el formato del exportador.
const TYPES = { f32: Float32Array, i8: Int8Array, u8: Uint8Array, u16: Uint16Array, u32: Uint32Array };

export function channelType(mesh, key) { return mesh[key].type || (key === 'indices' ? 'u32' : 'f32'); }

/** Vista tipada de un canal de una malla sobre el binario descomprimido. */
export function channel(buffer, mesh, key) {
  const c = mesh[key];
  return new TYPES[channelType(mesh, key)](buffer, c.offset, c.length);
}
