import type { LibraryWorld } from './library.ts';

export type ActivityWorld = Exclude<LibraryWorld, 'roxana'>;
export interface ActivityChoice {
  id: string;
  label: string;
  outcome: string;
}
export interface ActivityVisualValue {
  label: string;
  value: number;
  unit?: string;
}
export interface ActivityVisual {
  kind: 'circuit' | 'track' | 'motion' | 'tokens';
  initial: ActivityVisualValue[];
  target: string;
  /** Resulting values indexed by the operation's choice id. */
  results: Record<string, ActivityVisualValue[]>;
}
export interface ActivityChallenge {
  id: string;
  prompt: string;
  choices: ActivityChoice[];
  correctChoiceId: string;
  explanation: string;
  visual?: ActivityVisual;
}
export interface WorldActivity {
  id: string;
  world: ActivityWorld;
  title: string;
  description: string;
  challenges: ActivityChallenge[];
}

/** Institute practice benches, never presented as the worlds' full campaigns.
 * Choices are operations; outcome is observable feedback even on an unsuccessful
 * attempt. The UI should allow retrying and show the resulting state.
 */
export const WORLD_ACTIVITIES: readonly WorldActivity[] = [
  {
    id: 'ohmdal-circuito',
    world: 'ohmdal',
    title: 'Banco de circuitos',
    description:
      'Una práctica del Instituto: recorré conexiones y observá cómo cambia una carga ideal. No sustituye la aventura de Ohmdal.',
    challenges: [
      {
        id: 'retorno',
        prompt:
          'La fuente está conectada a una resistencia. El extremo restante de la resistencia está suelto. Completá el camino para que circule corriente por la carga.',
        correctChoiceId: 'cerrar',
        choices: [
          {
            id: 'cerrar',
            label: 'Conectar el extremo suelto al otro terminal de la fuente',
            outcome:
              'La trayectoria fuente → resistencia → fuente queda completa. Circula corriente por la carga.',
          },
          {
            id: 'abrir',
            label: 'Desconectar también el primer extremo de la resistencia',
            outcome:
              'La resistencia queda aislada. No hay corriente por la carga.',
          },
          {
            id: 'mismo',
            label: 'Unir ambos extremos de la resistencia al mismo terminal',
            outcome:
              'Ambos extremos de la resistencia quedan en el mismo nodo: su tensión es cero y no circula corriente por ella.',
          },
        ],
        explanation:
          'Una carga necesita una diferencia de potencial y una trayectoria completa. Volver al mismo nodo de partida sin incluir los dos terminales de la fuente no aplica tensión a la resistencia.',
      },
      {
        id: 'regular',
        prompt:
          'Una fuente ideal de 6 V alimenta una resistencia de 12 Ω: circulan 0,5 A. Conservá la fuente y reducí la corriente a la mitad.',
        correctChoiceId: '24',
        choices: [
          {
            id: '6',
            label: 'Sustituir la resistencia por 6 Ω',
            outcome: 'La corriente sube a 1 A: se duplicó.',
          },
          {
            id: '24',
            label: 'Sustituir la resistencia por 24 Ω',
            outcome: 'La corriente baja a 0,25 A: es la mitad de la inicial.',
          },
          {
            id: '12',
            label: 'Mantener la resistencia de 12 Ω',
            outcome: 'La corriente sigue en 0,5 A.',
          },
        ],
        explanation:
          'En este modelo resistivo, I = V / R. Manteniendo 6 V, duplicar la resistencia reduce la corriente a la mitad. Esto describe resistencias ideales, no todos los dispositivos.',
      },
    ],
  },
  {
    id: 'bitland-secuencia',
    world: 'bitland',
    title: 'El recorrido de una instrucción',
    description:
      'Laboratorio breve del Instituto. Ejecutá programas de un carro de práctica y leé sus trazas; la campaña de Bitland sigue en preparación.',
    challenges: [
      {
        id: 'entrega',
        prompt:
          'Carro en 0, caja en 1, destino en 3. AVANZAR suma una posición. RECOGER exige estar junto a la caja. ENTREGAR exige llevarla hasta 3. Ejecutá un recorrido completo.',
        correctChoiceId: 'recoger-a-tiempo',
        choices: [
          {
            id: 'recoger-antes',
            label: 'RECOGER → AVANZAR → AVANZAR → AVANZAR → ENTREGAR',
            outcome:
              'Paso 1: no hay caja en 0. El carro llega vacío a 3 y no puede entregar.',
          },
          {
            id: 'recoger-a-tiempo',
            label: 'AVANZAR → RECOGER → AVANZAR → AVANZAR → ENTREGAR',
            outcome:
              'Posición 1 → caja recogida → posición 2 → posición 3 → caja entregada.',
          },
          {
            id: 'recoger-tarde',
            label: 'AVANZAR → AVANZAR → RECOGER → AVANZAR → ENTREGAR',
            outcome:
              'Paso 3: el carro está en 2, pero la caja quedó en 1. Llega vacío al destino.',
          },
        ],
        explanation:
          'Cada instrucción recibe el estado de la anterior. RECOGER sólo puede cumplir su función cuando posición del carro y posición de la caja coinciden.',
      },
      {
        id: 'transferencia',
        prompt:
          'El carro ya tiene la caja, está en 1 y el destino ahora es 4. Compará estos programas: avanzar suma una posición y no se puede entregar fuera del destino.',
        correctChoiceId: 'hasta',
        choices: [
          {
            id: 'dos',
            label: 'REPETIR 2 VECES AVANZAR → ENTREGAR',
            outcome:
              'El carro termina en 3. La entrega no ocurre porque el destino es 4.',
          },
          {
            id: 'hasta',
            label: 'MIENTRAS posición < 4: AVANZAR → luego ENTREGAR',
            outcome:
              'La traza pasa por 2, 3 y 4. La condición se vuelve falsa en 4 y la entrega se completa.',
          },
          {
            id: 'esperar',
            label: 'MIENTRAS posición < 4: ESPERAR → luego ENTREGAR',
            outcome:
              'El carro sigue en 1. Esperar no cambia la condición: el bucle no alcanza la entrega.',
          },
        ],
        explanation:
          'Una condición permite adaptar la cantidad de pasos al estado. El cuerpo del bucle tiene que cambiar lo necesario para llegar a una condición de salida; esperar indefinidamente no acerca el carro.',
      },
    ],
  },
  {
    id: 'physica-movimiento',
    world: 'physica',
    title: 'Mesa de movimiento',
    description:
      'Experimentos ideales del Instituto para comparar predicción y resultado antes de visitar el prototipo de Physica.',
    challenges: [
      {
        id: 'acelerar',
        prompt:
          'Un carro de 2 kg se mueve a velocidad constante. No hay rozamiento. Aplicá una fuerza neta que aumente su velocidad hacia la derecha a razón de 2 m/s cada segundo.',
        correctChoiceId: 'derecha4',
        choices: [
          {
            id: 'derecha4',
            label: 'Aplicar 4 N netos hacia la derecha',
            outcome:
              'La aceleración es 2 m/s² hacia la derecha. Cada segundo, la velocidad cambia 2 m/s en ese sentido.',
          },
          {
            id: 'cero',
            label: 'Mantener fuerza neta cero',
            outcome: 'La velocidad permanece constante: no hay aceleración.',
          },
          {
            id: 'izquierda4',
            label: 'Aplicar 4 N netos hacia la izquierda',
            outcome:
              'La aceleración es 2 m/s² hacia la izquierda, opuesta al cambio solicitado.',
          },
        ],
        explanation:
          'La aceleración responde a la fuerza neta: a = F / m. Con 2 kg, 4 N producen 2 m/s². Sin fuerza neta se conserva la velocidad; no se impone reposo.',
      },
      {
        id: 'alcance',
        prompt:
          'Una pelota sale horizontalmente de una mesa. Modelo: gravedad uniforme, misma altura, sin aire. Cambiá su lanzamiento para duplicar la distancia horizontal antes de tocar el suelo.',
        correctChoiceId: 'doblar',
        choices: [
          {
            id: 'doblar',
            label: 'Duplicar su velocidad horizontal inicial',
            outcome:
              'Cae durante el mismo tiempo y avanza el doble horizontalmente.',
          },
          {
            id: 'masa',
            label: 'Duplicar su masa, manteniendo el lanzamiento',
            outcome:
              'En este modelo ideal, conserva el mismo tiempo de caída y el mismo alcance.',
          },
          {
            id: 'mitad',
            label: 'Reducir a la mitad su velocidad horizontal inicial',
            outcome:
              'El tiempo de caída no cambia, pero el alcance queda reducido a la mitad.',
          },
        ],
        explanation:
          'Con la misma altura y velocidad vertical inicial, la caída tarda lo mismo. Sin aire, la componente horizontal conserva su velocidad: distancia horizontal = velocidad horizontal × tiempo.',
      },
    ],
  },
  {
    id: 'arithmos-proporciones',
    world: 'arithmos',
    title: 'La mesa de las equivalencias',
    description:
      'Transformá cantidades en una práctica del Instituto. Observá qué se conserva; esta mesa no representa la campaña completa de Arithmos.',
    challenges: [
      {
        id: 'mezcla',
        prompt:
          'Un paquete tiene 2 fichas azules y 3 doradas. Prepará un paquete con el doble de fichas y la misma proporción azul:dorado.',
        correctChoiceId: 'doblar-ambas',
        choices: [
          {
            id: 'sumar-dos',
            label: 'Agregar 2 fichas de cada color',
            outcome:
              'Quedan 4 azules y 5 doradas: razón 4:5 y 9 fichas en total. Cambió la proporción.',
          },
          {
            id: 'doblar-ambas',
            label: 'Duplicar las dos cantidades',
            outcome:
              'Quedan 4 azules y 6 doradas: razón 2:3 y 10 fichas en total. Se conserva la proporción.',
          },
          {
            id: 'doblar-azul',
            label: 'Duplicar sólo las fichas azules',
            outcome:
              'Quedan 4 azules y 3 doradas: razón 4:3. Aumentó la parte azul de la mezcla.',
          },
        ],
        explanation:
          'Para conservar una razón se multiplican ambas cantidades por el mismo factor. Duplicar dos y tres da cuatro y seis: dos paquetes idénticos al original.',
      },
      {
        id: 'reagrupar',
        prompt:
          'Tenés 12 piezas en 3 grupos de 4. Reorganizalas en 6 grupos iguales, conservando todas las piezas sin agregar ni quitar.',
        correctChoiceId: 'dos',
        choices: [
          {
            id: 'cuatro',
            label: 'Formar 6 grupos de 4',
            outcome:
              'Hacen falta 24 piezas. La organización exige 12 piezas más de las disponibles.',
          },
          {
            id: 'uno',
            label: 'Formar 6 grupos de 1',
            outcome: 'Usás 6 piezas y quedan otras 6 fuera de los grupos.',
          },
          {
            id: 'dos',
            label: 'Formar 6 grupos de 2',
            outcome:
              'Cada grupo original se divide en dos parejas. Las 12 piezas quedan distribuidas en 6 grupos.',
          },
        ],
        explanation:
          'Cambian la cantidad de grupos y las piezas por grupo, pero se conserva el total: 3 × 4 = 6 × 2 = 12. Esa cantidad conservada es el invariante de la transformación.',
      },
    ],
  },
];

const PRACTICE_VISUALS: Record<string, ActivityVisual> = {
  retorno: {
    kind: 'circuit',
    initial: [{ label: 'Camino completo', value: 0 }],
    target: 'Conectar fuente, carga y retorno.',
    results: {
      cerrar: [{ label: 'Camino completo', value: 1 }],
      abrir: [{ label: 'Camino completo', value: 0 }],
      mismo: [{ label: 'Tensión en la carga', value: 0, unit: 'V' }],
    },
  },
  regular: {
    kind: 'circuit',
    initial: [
      { label: 'Resistencia', value: 12, unit: 'Ω' },
      { label: 'Corriente', value: 0.5, unit: 'A' },
    ],
    target: 'Corriente: 0,25 A, conservando 6 V.',
    results: {
      '6': [
        { label: 'Resistencia', value: 6, unit: 'Ω' },
        { label: 'Corriente', value: 1, unit: 'A' },
      ],
      '24': [
        { label: 'Resistencia', value: 24, unit: 'Ω' },
        { label: 'Corriente', value: 0.25, unit: 'A' },
      ],
      '12': [
        { label: 'Resistencia', value: 12, unit: 'Ω' },
        { label: 'Corriente', value: 0.5, unit: 'A' },
      ],
    },
  },
  entrega: {
    kind: 'track',
    initial: [
      { label: 'Carro', value: 0 },
      { label: 'Caja', value: 1 },
      { label: 'Destino', value: 3 },
    ],
    target: 'Entregar la caja en la posición 3.',
    results: {
      'recoger-antes': [
        { label: 'Carro', value: 3 },
        { label: 'Caja', value: 1 },
        { label: 'Entregas', value: 0 },
      ],
      'recoger-a-tiempo': [
        { label: 'Carro', value: 3 },
        { label: 'Caja', value: 3 },
        { label: 'Entregas', value: 1 },
      ],
      'recoger-tarde': [
        { label: 'Carro', value: 3 },
        { label: 'Caja', value: 1 },
        { label: 'Entregas', value: 0 },
      ],
    },
  },
  transferencia: {
    kind: 'track',
    initial: [
      { label: 'Carro con caja', value: 1 },
      { label: 'Destino', value: 4 },
    ],
    target: 'Llegar al nuevo destino y entregar.',
    results: {
      dos: [
        { label: 'Carro con caja', value: 3 },
        { label: 'Entregas', value: 0 },
      ],
      hasta: [
        { label: 'Carro', value: 4 },
        { label: 'Caja entregada', value: 4 },
        { label: 'Entregas', value: 1 },
      ],
      esperar: [
        { label: 'Carro con caja', value: 1 },
        { label: 'Entregas', value: 0 },
      ],
    },
  },
  acelerar: {
    kind: 'motion',
    initial: [
      { label: 'Masa', value: 2, unit: 'kg' },
      { label: 'Aceleración hacia la derecha', value: 0, unit: 'm/s²' },
    ],
    target: 'Aceleración hacia la derecha: 2 m/s².',
    results: {
      derecha4: [
        { label: 'Fuerza hacia la derecha', value: 4, unit: 'N' },
        { label: 'Aceleración hacia la derecha', value: 2, unit: 'm/s²' },
      ],
      cero: [
        { label: 'Fuerza neta', value: 0, unit: 'N' },
        { label: 'Aceleración', value: 0, unit: 'm/s²' },
      ],
      izquierda4: [
        { label: 'Fuerza hacia la derecha', value: -4, unit: 'N' },
        { label: 'Aceleración hacia la derecha', value: -2, unit: 'm/s²' },
      ],
    },
  },
  alcance: {
    kind: 'motion',
    initial: [{ label: 'Alcance relativo', value: 1, unit: '×' }],
    target: 'Duplicar el alcance original.',
    results: {
      doblar: [{ label: 'Alcance relativo', value: 2, unit: '×' }],
      masa: [{ label: 'Alcance relativo', value: 1, unit: '×' }],
      mitad: [{ label: 'Alcance relativo', value: 0.5, unit: '×' }],
    },
  },
  mezcla: {
    kind: 'tokens',
    initial: [
      { label: 'Azules', value: 2 },
      { label: 'Doradas', value: 3 },
    ],
    target: '10 fichas con razón azul:dorado = 2:3.',
    results: {
      'sumar-dos': [
        { label: 'Azules', value: 4 },
        { label: 'Doradas', value: 5 },
      ],
      'doblar-ambas': [
        { label: 'Azules', value: 4 },
        { label: 'Doradas', value: 6 },
      ],
      'doblar-azul': [
        { label: 'Azules', value: 4 },
        { label: 'Doradas', value: 3 },
      ],
    },
  },
  reagrupar: {
    kind: 'tokens',
    initial: [
      { label: 'Grupos', value: 3 },
      { label: 'Piezas por grupo', value: 4 },
      { label: 'Total', value: 12 },
    ],
    target: '6 grupos iguales que usen exactamente 12 piezas.',
    results: {
      cuatro: [
        { label: 'Grupos', value: 6 },
        { label: 'Piezas por grupo', value: 4 },
        { label: 'Total requerido', value: 24 },
      ],
      uno: [
        { label: 'Grupos', value: 6 },
        { label: 'Piezas por grupo', value: 1 },
        { label: 'Piezas sin agrupar', value: 6 },
      ],
      dos: [
        { label: 'Grupos', value: 6 },
        { label: 'Piezas por grupo', value: 2 },
        { label: 'Total', value: 12 },
      ],
    },
  },
};

for (const activity of WORLD_ACTIVITIES) {
  for (const challenge of activity.challenges)
    challenge.visual = PRACTICE_VISUALS[challenge.id];
}

export function getWorldActivity(id: string): WorldActivity | undefined {
  return WORLD_ACTIVITIES.find(
    (activity) => activity.id === id || activity.world === id,
  );
}

export function checkActivityAnswer(
  activityId: string,
  challengeId: string,
  choiceId: string,
): { correct: boolean; explanation: string; outcome: string } | null {
  const challenge = getWorldActivity(activityId)?.challenges.find(
    (item) => item.id === challengeId,
  );
  const choice = challenge?.choices.find((item) => item.id === choiceId);
  if (!challenge || !choice) return null;
  return {
    correct: choiceId === challenge.correctChoiceId,
    explanation: challenge.explanation,
    outcome: choice.outcome,
  };
}
