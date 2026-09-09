import type { Chapter, Matter, Piece, Zone } from './types';

const seed = (id: string, count: number, width: number, x: number, z: number, matter: Matter = 'amber'): Piece => ({ id, width, x, z, units: Array.from({ length: count }, (_, i) => ({ id: `${id}-${i}`, matter })) });
const zone = (id: string, x: number, z: number, width: number, depth: number, label: string, role: Zone['role']): Zone => ({ id, x, z, width, depth, label, role });

export const CHAPTERS: Chapter[] = [
  {
    id: 'landing', title: 'El puerto de las formas', subtitle: 'I · Una llegada improbable', place: 'Umbral de Arithmos', rule: 'cover',
    objective: 'Devuelve el paso a la pasarela hundida.',
    arrival: 'Briz sacude su pequeño remo. «Llegas justo a tiempo. Mi barco cabe en un bolsillo; mi orgullo todavía no.» Al otro lado, una ciudad duerme sobre el lomo de una ballena.',
    restored: 'La pasarela levanta su espalda. Briz cruza de puntillas: «Excelente. Un puente con ambiciones horizontales.»',
    hints: ['La sombra de la pasarela tiene un contorno distinto al de la materia.', 'Prueba a desplegar la pieza. Mira qué cambia y qué sigue ahí.', 'Una forma puede dejar huecos aunque conserve toda su materia.'],
    journal: 'Desplegaste seis unidades en filas distintas sin crear ni perder ninguna. La cantidad se conserva: 2 × 3 = 3 × 2 = 6. Cambiar la forma permitió ocupar otra superficie.', concept: 'Cantidad · conservación · equivalencia',
    palette: { sky: '#152e45', water: '#163e50', stone: '#ded4b9', accent: '#ffc77e' },
    zones: [zone('bridge', -1, -2, 3, 2, 'Pasarela', 'bridge')], seeds: [seed('landing-cloth', 6, 2, -1, 3)],
  },
  {
    id: 'twins', title: 'Las dos orillas', subtitle: 'II · Un equipaje, dos destinos', place: 'Dársenas gemelas', rule: 'cover',
    objective: 'Reconstruye los dos descansos del canal con la misma materia.',
    arrival: '«Antes llevaba pasajeros», dice Briz. «Ahora llevo orillas. Pagan peor, pero no se marean.» Dos muelles se buscan sobre el agua.',
    restored: 'Ambas orillas encajan. Una fila de barcas de papel sale de debajo del muelle. Briz les hace una reverencia demasiado larga.',
    hints: ['Hay agua entre las dos huellas. Una sola pieza no puede estar en ambos lugares sin dejar materia en el canal.', 'Puedes separar la materia y dar a cada parte otra forma.', 'Si un corte no te ayuda, reúne las partes o deshazlo. Ninguna unidad se gasta.'],
    journal: 'Una colección se convirtió en partes que juntas conservan el total. En estos muelles, 12 = 6 + 6. Descomponer cambia la agrupación; recomponer demuestra que no cambió la cantidad.', concept: 'Descomposición · recomposición',
    palette: { sky: '#213d58', water: '#235369', stone: '#ddd9c6', accent: '#efc380' },
    zones: [zone('left-dock', -6, -2, 3, 2, 'Orilla de casa', 'bed'), zone('right-dock', 3, -2, 3, 2, 'Orilla del viaje', 'bed')], seeds: [seed('twins-cloth', 12, 4, -2, 3)],
  },
  {
    id: 'balance', title: 'Lo que pesa una despedida', subtitle: 'III · La esclusa suspendida', place: 'Esclusa de los equipajes', rule: 'balance',
    objective: 'Deja toda la carga en las bandejas y devuelve la horizontal a la esclusa.',
    arrival: 'La esclusa se inclina. Briz mira su maleta plegada: «Llevo tres mudas, dos tormentas y una despedida. La despedida ocupa menos desde que la doblé.»',
    restored: 'La esclusa encuentra la calma y el canal sube hasta el cielo. «Mismo equipaje, mejor horizonte», concede Briz.',
    hints: ['La bandeja que baja lleva más materia, aunque su carga parezca más estrecha.', 'Puedes organizar cada lado de otra manera. La esclusa siente lo que contiene.', 'Observa el movimiento después de trasladar una parte de la carga.'],
    journal: 'Dos formas diferentes pueden tener la misma cantidad. La esclusa equilibró 8 unidades con 8: 16 = 8 + 8. Su lectura dependía del peso total, no del ancho, del contorno ni del número de piezas.', concept: 'Equivalencia · cantidad frente a forma',
    palette: { sky: '#363953', water: '#334e67', stone: '#d7cfcd', accent: '#ffc98b' },
    zones: [zone('west-pan', -7, -3, 4, 3, 'Bandeja del oeste', 'pan'), zone('east-pan', 3, -3, 4, 3, 'Bandeja del este', 'pan')], seeds: [seed('balance-cargo', 16, 4, -2, 3)],
  },
  {
    id: 'sails', title: 'El bosque que aprendió a navegar', subtitle: 'IV · La llamada del viento', place: 'Arboleda de mástiles', rule: 'sails',
    objective: 'Viste los tres mástiles con igual carga y paños de filas completas.',
    arrival: 'Los árboles tienen quillas donde deberían tener raíces. «No están perdidos», dice Briz. «Llevan años esperando un viento de su talla.»',
    restored: 'Los paños atrapan el mismo aliento. El bosque despliega sus velas y navega alrededor de la ballena dormida. Briz ha perdido el sombrero; por una vez, no lo reclama.',
    hints: ['Cada mástil tira de su propia carga. El viento se escapa por las filas incompletas.', 'La misma materia puede formar un paño estrecho o uno ancho.', 'No necesitas copiar una silueta. Busca paños completos que compartan la carga.'],
    journal: 'Las velas aceptaron rectángulos distintos de igual área. Cuatro unidades pueden formar 1 × 4, 2 × 2 o 4 × 1. Esas parejas son factores de 4. En tres mástiles, 12 = 3 × 4; el área se conserva aunque cambie la proporción del contorno.', concept: 'Factores · área · representación útil',
    palette: { sky: '#684b66', water: '#41546e', stone: '#e4d7c4', accent: '#ffce8b' },
    zones: [zone('sail-west', -8, -4, 4, 4, 'Mástil de poniente', 'sail'), zone('sail-heart', -2, -4, 4, 4, 'Mástil del corazón', 'sail'), zone('sail-east', 4, -4, 4, 4, 'Mástil de levante', 'sail')], seeds: [seed('sail-cloth', 12, 4, -2, 3)],
  },
  {
    id: 'gardens', title: 'La sed de los jardines', subtitle: 'V · Dos colores de lluvia', place: 'Jardines de la memoria', rule: 'ratio', minPerZone: 6,
    objective: 'Despierta ambos jardines con su mezcla de luz y agua; usa toda la materia.',
    arrival: 'Briz abre un sobre vacío. «Guardé aquí el olor de mi casa. Supongo que también se marchó.» Bajo las terrazas, raíces de ámbar buscan corrientes azules.',
    restored: 'Los jardines florecen a escalas distintas, con el mismo pulso. Briz cierra los ojos. «Ah. Ahí estaba.» De la ciudad llega el primer canto de la ballena.',
    hints: ['Mira los pequeños brotes junto a cada jardín: luz y agua crecen enlazadas.', 'Un jardín puede ser mayor que el otro sin cambiar la relación entre sus colores.', 'Si uno se apaga, observa cuál de sus dos materias ha quedado sin compañía.'],
    journal: 'Los jardines conservaron una relación al cambiar de tamaño: por cada unidad de ámbar, dos de agua. La razón 1:2 admite 2:4, 3:6 y 4:8. Igual proporción no significa igual cantidad total.', concept: 'Razón · escala · proporción',
    palette: { sky: '#485064', water: '#32686c', stone: '#e2ddc2', accent: '#f1c979' },
    zones: [zone('garden-west', -6, -3, 4, 3, 'Jardín de casa', 'basin'), zone('garden-east', 2, -3, 4, 3, 'Jardín del viaje', 'basin')], seeds: [seed('garden-light', 6, 3, -5, 4), seed('garden-water', 12, 4, 2, 3, 'teal')],
  },
  {
    id: 'flight', title: 'Una ciudad cabe en el cielo', subtitle: 'VI · El primer vuelo', place: 'Lomo de la ballena-ciudad', rule: 'flight', minPerZone: 6,
    objective: 'Completa las tres alas con plumas de ambas materias y estabiliza los extremos para despertar el vuelo.',
    arrival: 'La ballena abre un ojo. Lo que en los jardines era luz y agua aquí tiene barbas y raquis. Briz guarda el remo. «Si pregunta quién conduce, no me has visto.»',
    restored: 'La ballena despliega sus alas y la ciudad se desprende del mar. Los muelles, los jardines y el bosque navegan juntos. Briz extiende una esquina de su barco: «Te guardé sitio.»',
    hints: ['Estas plumas son otra forma de la materia que ya conoces. Observa cómo se acompañan sus colores.', 'La ballena siente tanto la mezcla de cada ala como el peso de sus extremos.', 'Las alas exteriores necesitan acompañarse. El ala del centro puede llevar otra cantidad.'],
    journal: 'Transferiste dos relaciones a una materia nueva: cada ala mantuvo ámbar:azul = 1:2 y las alas exteriores tuvieron igual carga. Por ejemplo, los totales 6–12–6 y 9–6–9 cumplen ambas condiciones con 24 plumas. La apariencia cambió; la estructura siguió siendo útil.', concept: 'Transferencia · proporción y equilibrio',
    palette: { sky: '#79658a', water: '#4c6983', stone: '#efe1cd', accent: '#ffe0a3' },
    zones: [zone('wing-west', -9, -4, 4, 3, 'Ala de poniente', 'wing'), zone('wing-heart', -3, -4, 4, 3, 'Ala del corazón', 'wing'), zone('wing-east', 3, -4, 4, 3, 'Ala de levante', 'wing')], seeds: [seed('flight-light', 8, 4, -7, 4), seed('flight-water', 16, 4, 2, 3, 'teal')],
  },
];
