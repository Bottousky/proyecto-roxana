/** Código internacional de colores usado para las cifras significativas de resistores. */
export const RESISTOR_DIGIT_COLORS = [
  { id: 'negro', label: 'Negro', digit: 0, color: '#171717', ink: '#f4efe4' },
  { id: 'marron', label: 'Marrón', digit: 1, color: '#7a4b2a', ink: '#fff7e8' },
  { id: 'rojo', label: 'Rojo', digit: 2, color: '#d63c32', ink: '#fff7ee' },
  { id: 'naranja', label: 'Naranja', digit: 3, color: '#e87924', ink: '#21160c' },
  { id: 'amarillo', label: 'Amarillo', digit: 4, color: '#e8c33a', ink: '#211b08' },
  { id: 'verde', label: 'Verde', digit: 5, color: '#3d9854', ink: '#f4fff5' },
  { id: 'azul', label: 'Azul', digit: 6, color: '#3978c5', ink: '#f5f8ff' },
  { id: 'violeta', label: 'Violeta', digit: 7, color: '#7650a5', ink: '#fff7ff' },
  { id: 'gris', label: 'Gris', digit: 8, color: '#929292', ink: '#171717' },
  { id: 'blanco', label: 'Blanco', digit: 9, color: '#eee9dc', ink: '#171717' },
] as const;

export type ResistorDigitColor = (typeof RESISTOR_DIGIT_COLORS)[number];
export type ResistorColorId = ResistorDigitColor['id'];
export type ResistorDigit = ResistorDigitColor['digit'];

export const RESISTOR_METALLIC_BANDS = [
  { id: 'oro', label: 'Oro', color: '#b58b18', multiplier: '×0,1', tolerance: '±5%' },
  { id: 'plata', label: 'Plata', color: '#b9bcc2', multiplier: '×0,01', tolerance: '±10%' },
] as const;

export function resistorColorByDigit(digit: ResistorDigit): ResistorDigitColor {
  return RESISTOR_DIGIT_COLORS[digit];
}
