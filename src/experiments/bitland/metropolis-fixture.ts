/** Neutral P0 comparison data. No engine, DOM, clock or gameplay authority. */
export type CityTreatment = 'metro' | 'warm' | 'clean' | 'cinema';
export const cityPalettes = {
  metro: [0x080d23, 0x162041, 0x33f5e4, 0xfc409d, 0x8964ff, 0xffc54a],
  warm: [0x17232a, 0x33434a, 0xe0b680, 0xc9895c, 0x849f94, 0xffd078],
  clean: [0xcbdde1, 0x758caa, 0x145d67, 0x934178, 0x585ba7, 0xb45e10],
  cinema: [0x060b16, 0x141f31, 0x558b9e, 0x92647f, 0x485674, 0xe4bc74],
};
export const cityScale = 64;
export const cityLots: { x: number; y: number; w: number; h: number; id: number }[] = [];
let serial = 0;
for (let col = -2; col <= 5; col++) for (let row = -1; row <= 4; row++) {
  const x = col * 192 + 34, y = row * 192 + 34;
  if (x < 735 && x + 124 > 55 && y < 635 && y + 124 > 260) continue;
  if (x > 1070 || y > 960) continue;
  // A reserved bus corridor continues to the external actuator.
  if (x > 735 && y < 470 && y + 124 > 426) {
    cityLots.push({ x, y: 482, w: 124, h: 60, id: serial++ }); continue;
  }
  if (serial % 3 === 0) {
    cityLots.push({ x, y, w: 55, h: 124, id: serial++ });
    cityLots.push({ x: x + 70, y, w: 55, h: 124, id: serial++ });
  } else cityLots.push({ x, y, w: 124, h: 124, id: serial++ });
}
cityLots.push(
  { x: 97, y: 308, w: 140, h: 94, id: 60 },
  { x: 97, y: 513, w: 140, h: 91, id: 61 },
  { x: 350, y: 405, w: 177, h: 21, id: 62 },
  { x: 350, y: 470, w: 177, h: 21, id: 65 },
  { x: 535, y: 291, w: 92, h: 109, id: 63 },
  { x: 535, y: 510, w: 92, h: 109, id: 64 },
);
export function cityTrafficAt(id: number, presentationSeconds: number) {
  const lane = Math.floor(id / 2) % 8, vertical = id % 2 === 0;
  const direction = id % 4 < 2 ? 1 : -1;
  const distance = ((id * 173.31 + presentationSeconds * (26 + id % 5 * 4)) % 1560) - 420;
  const x = vertical ? (lane - 2) * 192 + direction * 9 : direction * distance + 300;
  const y = vertical ? direction * distance + 180 : (lane - 1) * 192 + direction * 9;
  return { x, y, rotation: vertical ? Math.PI / 2 * direction : direction === 1 ? 0 : Math.PI,
    visible: !(x > 60 && x < 750 && y > 265 && y < 635) && x > -440 && x < 1160 && y > -190 && y < 1060 };
}
