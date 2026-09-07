import type { DialogueNode } from '../../../ohmdal-plaza/types.ts';

/**
 * Production copy for the Arc I community beats.
 *
 * Progression remains owned by the runtime. These nodes deliberately carry
 * dialogue only; the line-level source map lives in
 * agent-work/reports/workers/ohmdal-community-c1-c4-20260906.md.
 */
export const ARC1_COMMUNITY_DIALOGUES: Record<string, DialogueNode> = {
  castle_councillor_arrival: {
    id: 'castle_councillor_arrival',
    lines: [
      {
        who: 'Consejera',
        text: 'Hay barrios esperando y un tramo que todavía no responde.',
        emotion: 'concerned',
      },
      {
        who: 'Consejera',
        text: 'Antes de abrir un sello, mide las ramas y muéstrame qué cambia.',
        emotion: 'neutral',
      },
      {
        who: 'Consejera',
        text: 'La evidencia queda escrita; después decidimos qué carga priorizar.',
        emotion: 'neutral',
      },
    ],
  },

  castle_councillor_restored: {
    id: 'castle_councillor_restored',
    lines: [
      {
        who: 'Consejera',
        text: 'Los barrios vuelven a recibir suministro y las lecturas quedan a la vista.',
        emotion: 'eureka',
      },
      {
        who: 'Consejera',
        text: 'El sello se abre con la evidencia a la vista.',
        emotion: 'neutral',
      },
      {
        who: 'Consejera',
        text: 'La red queda documentada; podemos mantener el servicio sin apagar a toda la comunidad.',
        emotion: 'neutral',
      },
    ],
  },

  forge_yesca_arrival: {
    id: 'forge_yesca_arrival',
    lines: [
      {
        who: 'Yesca',
        text: 'La Forja tiene que producir y las Terrazas tienen que seguir regando.',
        emotion: 'concerned',
      },
      {
        who: 'Yesca',
        text: 'Mira el calor y la respuesta de la red antes de cambiar la carga.',
        emotion: 'neutral',
      },
      {
        who: 'Yesca',
        text: 'Dime qué esperas que pase; una predicción puede evitar un accidente.',
        emotion: 'curious',
      },
    ],
  },

  forge_yesca_restored: {
    id: 'forge_yesca_restored',
    lines: [
      {
        who: 'Yesca',
        text: 'La Forja sigue trabajando y el riego vuelve a alcanzar sus niveles.',
        emotion: 'eureka',
      },
      {
        who: 'Yesca',
        text: 'La red ya no se sobrecarga cuando la carga entra.',
        emotion: 'neutral',
      },
      {
        who: 'Yesca',
        text: 'El esquema queda para el próximo turno.',
        emotion: 'neutral',
      },
    ],
  },

  terraces_vega_arrival: {
    id: 'terraces_vega_arrival',
    lines: [
      {
        who: 'Vega',
        text: 'El agua se reparte por niveles; aquí cada cambio se siente más arriba.',
        emotion: 'concerned',
      },
      {
        who: 'Vega',
        text: 'No muevo una pieza hasta saber qué va a cambiar.',
        emotion: 'neutral',
      },
      {
        who: 'Vega',
        text: 'Muéstrame la lectura y deja un esquema para el siguiente turno.',
        emotion: 'curious',
      },
    ],
  },

  terraces_vega_restored: {
    id: 'terraces_vega_restored',
    lines: [
      {
        who: 'Vega',
        text: 'El agua alcanza niveles que habían quedado abandonados.',
        emotion: 'eureka',
      },
      {
        who: 'Vega',
        text: 'La lectura quedó verificada y el esquema queda para el siguiente turno.',
        emotion: 'neutral',
      },
      {
        who: 'Vega',
        text: 'Ahora sé antes de tocar.',
        emotion: 'neutral',
      },
    ],
  },

  lighthouse_nereo_arrival: {
    id: 'lighthouse_nereo_arrival',
    lines: [
      {
        who: 'Nereo',
        text: 'La alimentación llega, pero la salida todavía no comunica con el Lago.',
        emotion: 'concerned',
      },
      {
        who: 'Nereo',
        text: 'Conservo el patrón en el cuerpo. Mira la salida antes de cambiarla.',
        emotion: 'curious',
      },
      {
        who: 'Nereo',
        text: 'Registra la alimentación, la salida y la calibración.',
        emotion: 'neutral',
      },
    ],
  },

  lighthouse_nereo_restored: {
    id: 'lighthouse_nereo_restored',
    lines: [
      {
        who: 'Nereo',
        text: 'La alimentación se mantiene y la salida llega al Lago.',
        emotion: 'eureka',
      },
      {
        who: 'Nereo',
        text: 'El registro conserva la calibración sin borrar la variación.',
        emotion: 'neutral',
      },
      {
        who: 'Nereo',
        text: 'Ahora el Faro comunica un método, no sólo una señal.',
        emotion: 'neutral',
      },
    ],
  },

  arc1_first_class: {
    id: 'arc1_first_class',
    lines: [
      {
        who: 'Edda',
        text: 'Lumen, mira qué cambia antes de tocar.',
        emotion: 'curious',
      },
      {
        who: 'Lumen',
        text: 'Lo dejo registrado: observación primero, procedimiento después.',
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
