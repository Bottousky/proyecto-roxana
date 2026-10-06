// Valor posicional como depósito de cuartos: cuarto 0 = sueltos, cuarto 1 = atados de B,
// cuarto 2 = atados de atados... Un cuarto guarda a lo sumo B − 1. Con B se ata y se pasa.

/** Agrega `n` sueltos y canjea. Devuelve {rooms, carries}: cada canje es {from, to}. */
export function addLoose(rooms, n, base = 10) {
  const r = [...rooms];
  r[0] = (r[0] || 0) + n;
  return normalize(r, base);
}

export function normalize(rooms, base = 10) {
  const r = rooms.map(v => v || 0);
  const carries = [];
  for (let i = 0; i < r.length; i++) {
    while (r[i] >= base) {
      r[i] -= base;
      r[i + 1] = (r[i + 1] || 0) + 1;
      carries.push({from: i, to: i + 1});
    }
  }
  return {rooms: trim(r), carries};
}

function trim(r) {
  const out = [...r];
  while (out.length > 1 && !out[out.length - 1]) out.pop();
  return out.length ? out : [0];
}

export function value(rooms, base = 10) {
  return rooms.reduce((acc, v, i) => acc + (v || 0) * base ** i, 0);
}

/** Escribe el numeral: un dígito por cuarto, desde el más alto con algo. Los cuartos vacíos del medio llevan 0. */
export function toNumeral(rooms) {
  const r = trim(rooms);
  return r.map(v => String(v)).reverse().join('');
}

export function fromNumeral(text) {
  if (!/^\d+$/.test(text)) throw new Error(`No es un numeral: ${text}`);
  return trim([...text].reverse().map(Number));
}

/** Lo que pasa si alguien saltea los ceros: "302" se lee "32". */
export function dropZeros(text) {
  const t = text.replace(/0/g, '');
  return t || '0';
}

/**
 * Comparar emparejando: atado con atado, suelto con suelto, de los cuartos altos a los bajos.
 * Si en un cuarto del lado menor sobran y del lado mayor no alcanzan, se desata uno del cuarto
 * de arriba (pedir prestado). Devuelve la diferencia y los pasos, o null si a < b.
 */
export function differenceByPairing(a, b, base = 10) {
  const A = [...a], B = [...b];
  const n = Math.max(A.length, B.length);
  for (let i = 0; i < n; i++) { A[i] ||= 0; B[i] ||= 0; }
  if (value(A, base) < value(B, base)) return null;
  const steps = [];
  for (let i = 0; i < n; i++) {
    while (A[i] < B[i]) {
      // desatar uno del cuarto de arriba más cercano que tenga
      let j = i + 1;
      while (A[j] === 0) j++;
      for (let k = j; k > i; k--) {
        A[k] -= 1;
        A[k - 1] += base;
        steps.push({untie: k});
      }
    }
    steps.push({pair: i, count: B[i]});
    A[i] -= B[i];
  }
  return {rooms: trim(A), steps};
}
