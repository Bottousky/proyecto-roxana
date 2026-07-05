// Constantes del slice de Ohmdal (mundo tile-based estilo GBA).
export const TILE = 16; // px por tile en el arte
export const ZOOM = 3; // cámara: 16px → 48px en pantalla
export const VIEW_W = 320; // ancho lógico (GBA-ish) antes del zoom
export const VIEW_H = 240;
export const PLAYER_SPEED = 78; // px/s en coordenadas de mundo
export const INTERACT_DIST = 22; // px para poder interactuar

// tiles sólidos (índices del strip tiles16): agua, muro, seto, vacío
export const SOLID_TILES = new Set<number>([4, 5, 8, 9]);

export const TEAL = 0x35e0d0;
export const TEAL_DIM = 0x2a5052;
export const COPPER = 0xd0a34a;
export const LAMP_ON = 0xffd34d;
export const OFF_GRAY = 0x4a4a52;
