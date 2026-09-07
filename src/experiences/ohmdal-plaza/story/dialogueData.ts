import type { DialogueNode } from '../types.ts';

export const DIALOGUE_DATABASE: Record<string, DialogueNode> = {
  intro_portal_edda: {
    id: 'intro_portal_edda',
    lines: [
      {
        who: 'Edda',
        text: '¡Alguien cruzó el portal! ¡Desde que nací no vi cruzarlo a nadie, a nadie!',
        emotion: 'eureka',
      },
      {
        who: 'Estudiante',
        text: 'Eh... hola. El portal del Instituto vibraba con fuerza... pero aquí todo parece en silencio.',
        emotion: 'curious',
      },
      {
        who: 'Edda',
        text: '¡Sabía que los sahumerios estaban funcionando! Mira el pedestal en el centro de la plaza: allí descansa Ohm, la antigua reliquia de medición.',
        emotion: 'eureka',
      },
      {
        who: 'Edda',
        text: 'Lleva años dormido. La gente del pueblo dice que hace falta rezarle al Espíritu del Rayo... Lumen nos pidió que no lo tocáramos. ¿Qué le habrá pasado?',
        emotion: 'curious',
      },
    ],
    onComplete: 'unlock_rumor_portal',
  },

  ohm_dormant_inspect: {
    id: 'ohm_dormant_inspect',
    lines: [
      {
        who: 'Estudiante',
        text: 'Parece una máquina de latón y cobre. Tiene unos contactos en la base, y el filamento del centro está frío.',
        emotion: 'curious',
      },
      {
        who: 'Estudiante',
        text: 'Hay una conexión de entrada que quedó separada. La fuente zumba, pero aquí dentro no se enciende nada. ¿Será ese el corte?',
        emotion: 'curious',
      },
    ],
  },

  ohm_awakening_event: {
    id: 'ohm_awakening_event',
    lines: [
      {
        who: 'Ohm',
        text: '⚡ [PULSO DE ARRANQUE] ...La energía vuelve a mis conexiones... Mi núcleo responde.',
        emotion: 'eureka',
      },
      {
        who: 'Ohm',
        text: 'Percibo mis sensores. El camino de ida responde, pero el camino de regreso todavía está abierto.',
        emotion: 'neutral',
      },
      {
        who: 'Ohm',
        text: 'Saludos, Estudiante. Mi nombre es Ohm. Unidad de diagnóstico y medición electromagnética del Instituto.',
        emotion: 'neutral',
      },
    ],
    onComplete: 'complete_ohm_awakening',
  },

  edda_surprised_awakening: {
    id: 'edda_surprised_awakening',
    lines: [
      {
        who: 'Edda',
        text: '¡¿Lo despertaste?! ¡Por todos los esquemas, está emitiendo luz y zumbando! Yo iba a probar con otro sahumerio...',
        emotion: 'eureka',
      },
      {
        who: 'Estudiante',
        text: 'Había un contacto separado. Lo uní y la luz volvió.',
        emotion: 'neutral',
      },
      {
        who: 'Edda',
        text: '¡El camino volvió a responder! ¡Tenemos que contárselo a Lumen!',
        emotion: 'eureka',
      },
      {
        who: 'Edda',
        text: 'Lumen es el maestro del taller, al oeste de la plaza. Entra a su taller por la puerta arqueada. ¡No se lo cuentes de golpe o le va a dar un síncope!',
        emotion: 'neutral',
      },
    ],
    onComplete: 'unlock_rumor_taller',
  },

  lumen_workshop_interior: {
    id: 'lumen_workshop_interior',
    lines: [
      {
        who: 'Lumen',
        text: '¡¿Qué ven mis ojos gastados?! ¡¿Esa reliquia de latón está CAMINANDO y emitiendo zumbidos?!',
        emotion: 'concerned',
      },
      {
        who: 'Ohm',
        text: 'Afirmativo, Maestro Lumen. Unidad Ohm plenamente operativa. Los servicios de la red comunitaria siguen sin responder.',
        emotion: 'neutral',
      },
      {
        who: 'Lumen',
        text: 'Llevo cuarenta años manteniendo el ritual de las tres campanadas... Cuando se quemaron las lámparas en la gran tormenta, la Consejera mandó a retirar la barra puente del retorno.',
        emotion: 'neutral',
      },
      {
        who: 'Estudiante',
        text: 'Lumen, la barra puente quedó retirada y el camino de vuelta está cortado. ¿Puede ser por eso que la red no responde?',
        emotion: 'eureka',
      },
      {
        who: 'Lumen',
        text: 'Creíamos que la chispa se «acumulaba» en el aire... Toma esta Barra Puente de Cobre macizo y mi Cepillo de Alambre de cerdas duras.',
        emotion: 'neutral',
      },
      {
        who: 'Lumen',
        text: 'Sal a la Plaza. Instala la barra puente en la brecha del suelo, limpia el moho verde del contacto norte y haz sonar la campana para enclavar el relé.',
        emotion: 'neutral',
      },
      {
        who: 'Lumen',
        text: 'Si la red vuelve a responder, la Gran Puerta con el símbolo de Ohm al norte se abrirá y podremos llegar al Manantial en la montaña.',
        emotion: 'eureka',
      },
    ],
    onComplete: 'grant_jumper_item',
  },

  mural_inspect_dialog: {
    id: 'mural_inspect_dialog',
    lines: [
      {
        who: 'Estudiante',
        text: 'Este bajorrelieve antiguo no es un texto religioso... ¡Es un esquema de circuito eléctrico unifilar!',
        emotion: 'eureka',
      },
      {
        who: 'Ohm',
        text: 'Identificando símbolos normalizados: Fuente DC 24V en serie con carga inductiva (Bomba de agua) y lazo de retorno cerrado a tierra común.',
        emotion: 'neutral',
      },
      {
        who: 'Estudiante',
        text: 'El grabado dice: «La luz no habita en la piedra ni en el rezo; la luz es camino que vuelve al origen».',
        emotion: 'eureka',
      },
    ],
    onComplete: 'unlock_rumor_mural',
  },

  circuit_solved_dialog: {
    id: 'circuit_solved_dialog',
    lines: [
      {
        who: 'Ohm',
        text: '¡Continuidad restablecida! Resistencia total del lazo: 8.45 ohmios. Corriente de régimen: 2.84 amperios.',
        emotion: 'eureka',
      },
      {
        who: 'Edda',
        text: '¡Miren la fuente de la plaza! ¡El agua comenzó a brotar y las luces de los postes se encendieron!',
        emotion: 'eureka',
      },
      {
        who: 'Lumen',
        text: '¡Y escuchen ese crujido al norte! ¡Los solenoides de la Gran Puerta de Ohm se retrajeron!',
        emotion: 'eureka',
      },
      {
        who: 'Edda',
        text: '¡El camino hacia el sendero de la montaña está despejado! Vayamos a ver de dónde proviene toda esta fuerza.',
        emotion: 'eureka',
      },
    ],
    onComplete: 'complete_plaza_restoration',
  },

  manantial_overlook_dialog: {
    id: 'manantial_overlook_dialog',
    lines: [
      {
        who: 'Estudiante',
        text: '¡Es impresionante! Miren esa inmensa cascada cayendo desde la cima de la montaña hacia las turbinas del Manantial.',
        emotion: 'eureka',
      },
      {
        who: 'Edda',
        text: 'Toda el agua que alimenta la Cuenca cae desde esa altura. Siempre creímos que el Manantial era un templo sagrado.',
        emotion: 'neutral',
      },
      {
        who: 'Ohm',
        text: 'Análisis físico: La altura h de la montaña acumula energía potencial gravitatoria (E_p = m·g·h). Al descender por los conductos, la presión del agua hace rotar las turbinas magnéticas.',
        emotion: 'neutral',
      },
      {
        who: 'Estudiante',
        text: '¡Es el paralelismo perfecto! La diferencia de altura del agua genera la presión hidráulica... exactamente igual que la diferencia de potencial eléctrico (voltaje) impulsa la corriente por los cables.',
        emotion: 'eureka',
      },
      {
        who: 'Edda',
        text: '¡El Manantial no es un templo místico, es una Central Hidroeléctrica milenaria! ¡Nuestra energía nace del río en la montaña!',
        emotion: 'eureka',
      },
    ],
    onComplete: 'unlock_rumor_manantial',
  },
};
