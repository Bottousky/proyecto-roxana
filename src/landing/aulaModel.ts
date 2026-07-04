import type { SchoolState } from './schoolModel.ts';

export type PizarronMarca = '✓' | '·';

export interface PizarronLinea {
  texto: string;
  marca: PizarronMarca;
}

export interface PizarronViewModel {
  titulo: string;
  lineas: PizarronLinea[] | null;
  vacio?: string;
  pie?: string;
}

// Títulos canon: encabezados de docs/unidad-1..5 (ver docs/guion-instituto.md §1.3).
const UNIDADES_ELECTRONICA = [
  'La corriente no es magia',
  'El río se reparte',
  'El precio del río',
  'La vuelta completa',
  'La chispa que se queda',
] as const;

export function pizarronViewModel(school: SchoolState): PizarronViewModel {
  const titulo = 'Plan del curso — Electrónica';

  if (school.aulas.electronica === 'off') {
    return {
      titulo,
      lineas: null,
      vacio: 'El curso espera a su primer estudiante.',
    };
  }

  return {
    titulo,
    lineas: UNIDADES_ELECTRONICA.map((texto, index) => ({
      texto,
      marca: index < school.electronica.unidadesCompletadas ? '✓' : '·',
    })),
    pie: school.electronica.arcoCompleto ? 'Curso completado. El pueblo se enciende solo.' : undefined,
  };
}
