import type { DialogueNode } from '../../../ohmdal-plaza/types.ts';

/**
 * Production copy for the Arc I community beats.
 *
 * Narrative voice and scene intent follow the canonical character and script
 * bibles. Progression remains owned by the runtime; these nodes carry dialogue
 * only, while the first-class phase truth remains in firstClassPracticeModel.
 */
export const ARC1_COMMUNITY_DIALOGUES: Record<string, DialogueNode> = {
  castle_councillor_arrival: {
    id: 'castle_councillor_arrival',
    lines: [
      {
        who: 'Consejera',
        text: 'No volveré a abrir todos los sellos a la vez. Hay barrios al otro lado.',
        emotion: 'concerned',
      },
      {
        who: 'Consejera',
        text: 'Un tramo averiado no debería condenar también a los que siguen enteros.',
        emotion: 'neutral',
      },
      {
        who: 'Consejera',
        text: 'Encuentra dónde termina la falla. Yo me encargo de que el miedo no vuelva a cerrarlo todo.',
        emotion: 'neutral',
      },
    ],
  },

  castle_councillor_restored: {
    id: 'castle_councillor_restored',
    lines: [
      {
        who: 'Consejera',
        text: 'La red vuelve por ramas; si una falla, no tiene que caer toda la comunidad.',
        emotion: 'eureka',
      },
      {
        who: 'Consejera',
        text: 'Ahora sé qué rama puedo aislar sin apagar a todos.',
        emotion: 'neutral',
      },
      {
        who: 'Consejera',
        text: 'Voy a dejar la copia en el Castillo. Que el próximo turno no dependa de mi memoria.',
        emotion: 'neutral',
      },
    ],
  },

  forge_yesca_arrival: {
    id: 'forge_yesca_arrival',
    lines: [
      {
        who: 'Yesca',
        text: 'Cuando enciendo todo de golpe, salta la protección: se quedan fríos el horno y la bomba.',
        emotion: 'concerned',
      },
      {
        who: 'Yesca',
        text: 'Necesito calor suficiente y Vega necesita agua. ¿Hay sitio para los dos?',
        emotion: 'neutral',
      },
      {
        who: 'Yesca',
        text: 'Con que el horno haga su trabajo me alcanza. No necesito que arda como un sol.',
        emotion: 'curious',
      },
    ],
  },

  forge_yesca_restored: {
    id: 'forge_yesca_restored',
    lines: [
      {
        who: 'Yesca',
        text: 'La Forja trabaja y Vega no perdió el agua.',
        emotion: 'eureka',
      },
      {
        who: 'Yesca',
        text: 'La protección no nos quitó el turno; nos mostró cuánto podíamos pedir.',
        emotion: 'neutral',
      },
      {
        who: 'Yesca',
        text: 'Voy a marcar esta posición. Mañana alguien tendrá que relevarme.',
        emotion: 'neutral',
      },
    ],
  },

  terraces_vega_arrival: {
    id: 'terraces_vega_arrival',
    lines: [
      {
        who: 'Vega',
        text: 'El agua sube por niveles; si toco aquí, arriba lo sienten.',
        emotion: 'concerned',
      },
      {
        who: 'Vega',
        text: 'Llevo treinta años cuidando estos niveles. El de arriba siempre es el primero que me preocupa.',
        emotion: 'neutral',
      },
      {
        who: 'Vega',
        text: 'Mira hasta dónde llega el agua cuando cambia la bomba. Las marcas están para eso.',
        emotion: 'curious',
      },
    ],
  },

  terraces_vega_restored: {
    id: 'terraces_vega_restored',
    lines: [
      {
        who: 'Vega',
        text: 'El agua llegó al nivel que esperábamos; arriba también se nota.',
        emotion: 'eureka',
      },
      {
        who: 'Vega',
        text: 'Ya no tengo que elegir qué terraza dejamos esperando.',
        emotion: 'neutral',
      },
      {
        who: 'Vega',
        text: 'Dejemos el ajuste junto a las marcas. Quien venga mañana también tiene que entenderlo.',
        emotion: 'neutral',
      },
    ],
  },

  lighthouse_nereo_arrival: {
    id: 'lighthouse_nereo_arrival',
    lines: [
      {
        who: 'Nereo',
        text: 'El Faro recibe energía. Y, sin embargo, el Lago sigue esperando su luz.',
        emotion: 'concerned',
      },
      {
        who: 'Nereo',
        text: 'Cuarenta años recordando cada ajuste con las manos. Ven; comparemos lo que llega con lo que sale.',
        emotion: 'curious',
      },
      {
        who: 'Nereo',
        text: 'Quiero que mi memoria tenga compañía antes de mover nada.',
        emotion: 'neutral',
      },
    ],
  },

  lighthouse_nereo_restored: {
    id: 'lighthouse_nereo_restored',
    lines: [
      {
        who: 'Nereo',
        text: 'Ahí está. La luz vuelve a alcanzar el Lago.',
        emotion: 'eureka',
      },
      {
        who: 'Nereo',
        text: 'Los ajustes siguen siendo los mismos. La diferencia es que ahora alguien más puede entenderlos.',
        emotion: 'neutral',
      },
      {
        who: 'Nereo',
        text: 'Qué descanso... que el Faro pueda seguir cuando estas manos necesiten parar.',
        emotion: 'neutral',
      },
    ],
  },

  arc1_first_class: {
    id: 'arc1_first_class',
    lines: [
      {
        who: 'Edda',
        text: 'Lumen, antes de mover el puente: ¿qué te dice la aguja con el retorno abierto?',
        emotion: 'curious',
      },
      {
        who: 'Lumen',
        text: 'Lo anoto: el retorno estaba abierto. Edda, cierra el puente; después miramos de nuevo.',
        emotion: 'neutral',
      },
      {
        who: 'Edda',
        text: 'No volvió la luz. Volvió la pregunta.',
        emotion: 'eureka',
      },
    ],
  },
};
