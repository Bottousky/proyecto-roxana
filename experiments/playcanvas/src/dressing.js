// Utilería de cada lugar, piezas del kit de Blender (scripts/blender/props-kit.py).
// Cada cosa está donde su dueño la usa: la leña contra la casa de los Porteros, los sacos
// de harina junto a la Panadería, la carga del Mercado a su puerta, los cajones del Taller
// a los lados del portón. Coordenadas locales del lugar: [pieza, x, z, giro en grados].
// Nada se apoya en el eje de paso ni a menos de 1,4 m de algo con qué interactuar
// (tests/dressing.test.js lo comprueba contra los caminos reales).
export const DRESSING = {
  portal: [
    // Casa de los Porteros: leña en el patio, una maceta junto a la puerta, huerta al oeste.
    ['logs', -12.3, -3.4, 0], ['pot', -11.3, -4.6, 0], ['cabbages', -11.4, 2.6, 0],
    ['barrel', -7.2, -7.9, 0], ['basket_apples', -6.5, -8.5, 0],
    // Equipaje de quienes llegan por el Portal: baúles y sacos junto a la escalinata.
    ['crate', 5.2, -4.3, 12], ['crate_small', 5.9, -3.5, -20], ['sacks', 6.3, -5.0, 30],
  ],
  plaza: [
    // Panadería: harina a un lado del mostrador, pan del día al otro.
    ['sacks', -9.1, -7.7, 0], ['barrel', -8.3, -6.8, 0], ['basket', -1.9, -7.7, 0],
    // Casa de la Plaza: maceta junto a la puerta; un puesto de fruta frente a la fuente.
    ['pot_white', 6.1, -7.05, 0], ['stall', 4.6, -4.6, 0], ['pot', 13.4, -6.7, 0],
    // Taller de Lumen: cajones de piezas junto al porche, barriles contra el muro, leña al costado.
    ['crate', -16.4, 8.4, 8], ['crate_small', -16.0, 9.3, -15], ['barrel', -7.9, 6.6, 0], ['barrel', -7.85, 5.8, 0],
    ['logs', -18.1, 9.4, 90],
    // Mercado: cajones de fruta a los lados del mostrador, la carreta de reparto y sacos.
    ['crate_apples', 12.4, 8.4, 0], ['crate_pears', 17.8, 8.3, 0], ['cart', 16.3, 10.5, 0],
    ['sacks', 18.1, -1.6, 0], ['basket_apples', 11.8, 3.6, 0],
    // Fuente: un banco para mirar el agua.
    ['bench', 3.6, 0.8, -35],
  ],
  workshop: [
    // Lumen guarda repuestos en el rincón del este: cajones, un barril de aceite y sacos.
    ['crate', 10.4, 4.0, 6], ['crate_small', 10.5, 5.5, -12], ['barrel', 10.5, 7.1, 0], ['sacks', 9.6, 9.3, 90],
    // Leña junto al hogar y un barril de agua a la entrada.
    ['logs', -9.4, 5.9, 0], ['barrel', -8.6, 9.3, 0],
  ],
};

export const dressingOf = id => DRESSING[id] || [];

// Guirnaldas de banderines entre fachadas: [x, y, z] de cada extremo y la caída en el centro.
export const BUNTING = {
  plaza: [
    [[-2.7, 3.3, -8.1], [4.2, 3.5, -7.7], .7],
    [[-8.6, 3.1, 7.0], [12.3, 3.2, 5.6], 1.4],
    [[-8.6, 3.1, 1.0], [-2.7, 3.3, -8.1], .8],
  ],
};

// Huella en el suelo (media anchura en x y en z) de una pieza girada, con un margen fino.
export function footprint(kind, rotation, props) {
  const p = props[kind]; if (!p) return null;
  const a = rotation * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), ac = Math.abs(c), as = Math.abs(s);
  // Rotación del motor alrededor de Y: x' = x·cos + z·sin, z' = −x·sin + z·cos.
  const cx = p.cx || 0, cz = p.cz || 0;
  return { x: cx * c + cz * s, z: -cx * s + cz * c, w: (p.w * ac + p.d * as) / 2 + .05, d: (p.w * as + p.d * ac) / 2 + .05 };
}

export function dressingObstacles(id, props) {
  return dressingOf(id).flatMap(([kind, x, z, rotation]) => {
    const f = footprint(kind, rotation, props);
    return f ? [{ x: x + f.x, z: z + f.z, w: f.w, d: f.d, dressing: kind }] : [];
  });
}
