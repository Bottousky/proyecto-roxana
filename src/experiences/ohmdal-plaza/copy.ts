/** Líneas canónicas del slice. Todo lo demás es observación o TODO(guion). */
export const COPY = {
  eddaRelato1: 'La Plaza no tiene fuerza.',
  eddaRelato2: 'La fuerza está, pero no vuelve.',
  eddaCanon: 'No te pregunté qué creés. Te pregunté qué viste.',
  /** TODO(guion): línea de salida de Edda y destino que puede mencionar. */
  eddaSale: null as string | null,
  ohmDespierta:
    'Trayectoria completa. Conciencia… también. Orden de causalidad: pendiente.',
  ohmBilateral: 'Decisión bilateral registrada.',
  ohmContinuidad: 'Continuidad.',
  ohmInsuficiente: 'Dato insuficiente.',
  /** TODO(guion): línea final del slice, si hiciera falta una. */
  cierre: null as string | null,
} as const;

export const OBSERVACIONES: Record<string, string> = {
  portal: 'El Portal se apagó. No vuelve a abrir.',
  agua: 'El agua está quieta.',
  campana: 'La campana no responde.',
  indicador: 'Esta luz aún responde, pero no se sostiene.',
  retorno: 'El cobre se interrumpe aquí.',
  reparacion: 'Hay una reparación distinta a las otras.',
  ohm_inerte: 'Está inerte. Cerca del mecanismo, no dentro de él.',
};

export const SUBTITULOS = {
  portal: 'El Portal se cierra.',
  campana: 'Un golpe sordo. La campana no responde.',
  agua: 'El agua no se mueve.',
  intento: 'Un destello breve. Luego, el mismo silencio.',
  despertar: 'Luz estable, un latido y movimiento.',
};
