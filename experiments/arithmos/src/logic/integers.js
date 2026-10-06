// Enteros como palitos (tener) y deudas. Un palito y una deuda juntos valen cero.

/** Juntar: se emparejan palitos con deudas y se borran de a pares. */
export function combine(haves, debts) {
  const pairs = Math.min(haves, debts);
  return {pairs, haves: haves - pairs, debts: debts - pairs, value: haves - debts};
}

export const valueOf = ({haves, debts}) => haves - debts;

/**
 * Quitar `n` deudas. Si no hay tantas, primero se agregan pares cero (un palito y una deuda),
 * que no cambian el valor; después se quitan las deudas. Quitar deudas sube el valor.
 */
export function removeDebts(state, n) {
  let {haves, debts} = state;
  const added = Math.max(0, n - debts);
  haves += added;
  debts += added;
  debts -= n;
  return {haves, debts, added, value: haves - debts};
}

/** Quitar `n` palitos (con pares cero si hacen falta). */
export function removeHaves(state, n) {
  let {haves, debts} = state;
  const added = Math.max(0, n - haves);
  haves += added;
  debts += added;
  haves -= n;
  return {haves, debts, added, value: haves - debts};
}

/** En la línea, más a la derecha es más. */
export const less = (a, b) => a < b;
export const distance = (a, b) => Math.abs(a - b);
export const abs = a => Math.abs(a);
export const opposite = a => -a;

/** Escritura con signo; el cero no lleva signo. */
export function signed(n) {
  if (n === 0) return '0';
  return n > 0 ? `+${n}` : `−${-n}`;
}
