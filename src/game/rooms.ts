import { state, setFlag, hooks } from '../state';
import { say, L, type Line } from '../ui/dialog';
import { showBitacoraButton, notifyNewEntry, openBitacora } from '../ui/bitacora';
import { abrirDespertar } from '../puzzles/despertar';
import { abrirFreno } from '../puzzles/freno';
import { abrirPuerta } from '../puzzles/puerta';
import { showEnd } from '../ui/end';
import { sfxBell, sfxPortal } from '../audio';

export interface ThingDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: 'rect' | 'circle';
  label: string;
  prompt: string;
  color: number | (() => number);
  visible?: () => boolean;
  /** sala hacia la que camina al irse (o desde la que llega) cuando `visible` cambia en un refresh */
  walksTo?: string;
  solid?: boolean;
  emoji?: string;
  onInteract: () => void;
}

export interface DoorDef {
  x: number;
  y: number;
  w: number;
  h: number;
  to: string;
  spawn: { x: number; y: number };
  label: string;
  color?: number;
  /** si devuelve líneas, la puerta está trabada y se muestran */
  locked?: () => Line[] | null;
}

export interface RoomDef {
  id: string;
  name: string;
  floor: () => number;
  wall: () => number;
  doors: DoorDef[];
  things: ThingDef[];
  onEnter?: () => void;
}

const f = () => state.flags;

/* ---------- secuencias reutilizadas ---------- */

function pickupBitacora(): void {
  say(
    [
      L('', 'Sobre el escritorio de Dirección hay un solo objeto, como esperando: un cuaderno grueso, encuadernado en cuero gastado.'),
      L('', 'La tapa dice: «Bitácora de Mundos Aplicados». Adentro, todas las páginas están en blanco.'),
      L('', '…No. Una se está escribiendo sola, ahora mismo, con una letra que no es la tuya. Todavía.'),
    ],
    () => {
      setFlag('hasBitacora');
      showBitacoraButton();
      notifyNewEntry('El hall del Instituto');
      hooks.refresh();
    },
  );
}

function despertarOhm(): void {
  abrirDespertar(() => {
    setFlag('ohmAwake');
    say(
      [
        L('Edda', '¡¿Lo DESPERTASTE?! ¿Qué ritual usaste? ¿El de los tres golpes? ¿El del incienso doble?'),
        L('', '—Ningún ritual. Solo… completé el camino.'),
        L('Edda', '«Completé el camino», dice, así nomás. No se lo cuentes a Lumen de una, que le agarra un soponcio.'),
        L('Edda', 'El taller de Lumen está al este. Si Ohm despertó, va a querer conocerte. O exorcizarte. Cincuenta y cincuenta.'),
      ],
      () => {
        notifyNewEntry('El camino completo');
        hooks.refresh();
      },
    );
  });
}

function resolverFreno(): void {
  abrirFreno(() => {
    setFlag('frenoDone');
    say(
      [
        L('Maese Lumen', '«La piedra justa»… Donde otros ven magia, buscá camino. Eso decían los Maestros. Nunca supe qué significaba.'),
        L('Maese Lumen', 'Si entendés a las piedras… quizás puedas con la Puerta de Ohm. Al norte de la plaza. Nadie la abre desde la época de los Maestros.'),
        L('Edda', 'Voy con ustedes. Si explota, quiero verlo de cerca.'),
        L('Maese Lumen', 'Adelántense. Yo junto los fusibles de repuesto. …Mejor llevo seis.'),
      ],
      () => {
        notifyNewEntry('La Piedra de Freno');
        hooks.refresh();
      },
    );
  });
}

function resolverPuerta(): void {
  abrirPuerta(() => {
    setFlag('puertaDone');
    say(
      [
        L('Maese Lumen', 'Se abrió… La Puerta pedía el caudal justo: ni hambrienta ni ahogada. Empuje y freno, medidos el uno contra el otro.'),
        L('Edda', 'Empuje sobre freno. Es… ¿es una CUENTA? ¿Todo este tiempo era una cuenta?'),
        L('', 'La Bitácora arde tibia en tu bolsillo. Se está escribiendo sola otra vez — y esta vez, a fuego.'),
      ],
      () => {
        notifyNewEntry('La Ley de Ohm');
        openBitacora('ley-de-ohm');
        hooks.refresh();
      },
    );
  });
}

function tocarCampana(): void {
  sfxBell();
  say(
    [
      L('', 'Tirás de la cuerda. La campana de Ohmdal suena por primera vez en décadas: una nota limpia que recorre la plaza encendida.'),
      L('Maese Lumen', 'Los Maestros la tocaban al final de cada lección. Decían que el sonido «cerraba el circuito del día». Recién hoy le encuentro la gracia.'),
      L('Edda', 'Ey. Mirá. De la campana bajan DOS cables. Dos caminos. ¿Para qué querría alguien dos caminos para un mismo río?'),
      L('', '(Eso, Edda, es otra lección.)'),
    ],
    () => {
      setFlag('finished');
      showEnd();
    },
  );
}

/* ---------- las salas ---------- */

export const ROOMS: Record<string, RoomDef> = {
  /* ============ INSTITUTO ROXANA ============ */

  hall: {
    id: 'hall',
    name: 'Instituto Roxana — Hall principal',
    floor: () => 0x1f1b26,
    wall: () => 0x2c2836,
    doors: [
      {
        x: 0, y: 225, w: 26, h: 100,
        to: 'despacho', spawn: { x: 860, y: 270 },
        label: 'Dirección',
      },
      {
        x: 934, y: 225, w: 26, h: 100,
        to: 'aula', spawn: { x: 95, y: 270 },
        label: 'Aula de Electrónica',
        locked: () =>
          f().hasBitacora
            ? null
            : [
                L('', 'La puerta del Aula de Electrónica está cerrada con llave.'),
                L('Preceptor', 'Dirección primero. La puerta de la izquierda.'),
              ],
      },
    ],
    things: [
      {
        id: 'preceptor', x: 500, y: 300, w: 36, h: 36, shape: 'circle',
        label: 'Preceptor', prompt: 'Hablar con el preceptor', color: 0x6a7a8a, solid: true, emoji: '📋',
        onInteract: () => {
          const fl = f();
          if (!fl.talkedPreceptor) {
            say(
              [
                L('Preceptor', '¿El nuevo? Llegás tarde. O temprano. Acá ya nadie lleva mucho la cuenta.'),
                L('Preceptor', 'Antes del aula tenés que pasar por Dirección. La puerta de la izquierda. Está abierta; siempre está abierta. No sé por qué la seguimos llamando Dirección.'),
                L('Preceptor', 'Y una cosa: si algo zumba, no lo toques. …Todavía.'),
              ],
              () => setFlag('talkedPreceptor'),
            );
          } else if (!fl.hasBitacora) {
            say(L('Preceptor', 'Dirección. Izquierda. Zumbidos, no.'));
          } else if (!fl.sawProjector) {
            say([
              L('Preceptor', '¿Eso es… una Bitácora? Hacía años que no veía una de esas.'),
              L('Preceptor', 'El Aula de Electrónica es la puerta de la derecha. Andá: el aula sabe qué hacer. …Es una forma de decir. Creo.'),
            ]);
          } else {
            say(L('Preceptor', '¿Todavía por acá? El aula. La derecha. Saludame a… bah. Vos andá.'));
          }
        },
      },
      {
        id: 'vitrina', x: 230, y: 115, w: 170, h: 50,
        label: 'Vitrina de trofeos', prompt: 'Mirar la vitrina', color: 0x3a3548, solid: true, emoji: '🏆',
        onInteract: () =>
          say(L('', 'Trofeos bajo el polvo: «Feria Técnica Nacional — 1er premio». El más nuevo tiene veinte años.')),
      },
      {
        id: 'cartel', x: 690, y: 115, w: 170, h: 42,
        label: 'Cuadro de honor', prompt: 'Leer el cuadro de honor', color: 0x3a3548, solid: true, emoji: '📜',
        onInteract: () =>
          say(L('', 'Un cuadro de honor con los nombres borrados por el sol. Alguien, hace poco, escribió con el dedo en el polvo: «¿hola?»')),
      },
    ],
    onEnter: () => {
      if (!f().introSeen) {
        say(
          [
            L('', 'El Instituto Roxana. Nadie te acompañó hasta la puerta; «queda lejos», dijeron. La verdad es que nadie elige venir acá. Vos tampoco.'),
            L('', 'El hall es enorme y huele a cera vieja. Los pasos hacen eco. Junto a la escalera hay un hombre de guardapolvo gris.'),
          ],
          () => setFlag('introSeen'),
        );
      }
    },
  },

  despacho: {
    id: 'despacho',
    name: 'Dirección — Despacho de Roxana',
    floor: () => 0x231d28,
    wall: () => 0x312839,
    doors: [
      { x: 934, y: 225, w: 26, h: 100, to: 'hall', spawn: { x: 95, y: 270 }, label: 'Hall' },
    ],
    things: [
      {
        id: 'escritorio', x: 450, y: 280, w: 150, h: 70,
        label: 'Escritorio', prompt: 'Examinar el escritorio', color: 0x4a3c30, solid: true, emoji: '📖',
        onInteract: () => {
          if (!f().hasBitacora) pickupBitacora();
          else say(L('', 'El escritorio de Roxana. El polvo dibuja el contorno de cosas que ya no están. Solo queda el hueco donde esperaba la Bitácora.'));
        },
      },
      {
        id: 'retrato', x: 450, y: 105, w: 130, h: 64,
        label: 'Retrato', prompt: 'Mirar el retrato', color: 0x52443a, solid: true, emoji: '🖼️',
        onInteract: () => {
          setFlag('vioRetrato');
          say([
            L('', 'Un retrato enorme: «Prof.ª Roxana — Fundadora». Abajo, una placa de bronce: «El conocimiento no se enseña. Se reconstruye.»'),
            L('', 'Sus ojos parecen seguirte. No con amenaza: con expectativa.'),
          ]);
        },
      },
    ],
  },

  aula: {
    id: 'aula',
    name: 'Aula de Electrónica',
    floor: () => 0x1d2026,
    wall: () => 0x2a2f38,
    doors: [
      { x: 0, y: 225, w: 26, h: 100, to: 'hall', spawn: { x: 860, y: 270 }, label: 'Hall' },
    ],
    things: [
      {
        id: 'pizarron', x: 480, y: 100, w: 280, h: 54,
        label: 'Pizarrón', prompt: 'Leer el pizarrón', color: 0x24352c, solid: true, emoji: '✏️',
        onInteract: () =>
          say(L('', 'En el pizarrón, escrito hace mucho y nunca borrado del todo: «Donde otros ven magia, …». El resto se perdió.')),
      },
      {
        id: 'proyector', x: 330, y: 330, w: 90, h: 60,
        label: 'Proyector', prompt: 'Encender el proyector', color: 0x4a4a55, solid: true, emoji: '📽️',
        onInteract: () => {
          if (f().sawProjector) {
            say(L('Proyector', '*clac* …Que tenga una buena clase. *clac*'));
            return;
          }
          say(
            [
              L('Proyector', '*clac* INSTITUTO ROXANA PRESENTA: MUNDOS APLICADOS. UNIDAD UNO.'),
              L('Proyector', 'El Mundo Aplicado «Ohmdal» fue construido por este Instituto con un único propósito: que la electricidad se aprenda caminándola.'),
              L('Proyector', 'Recuerde, estudiante: el mundo responde a su comprensión. La incomprensión también deja huella.'),
              L('Proyector', 'Último mantenimiento: hace 34 años. Que tenga una buena clase. *clac*'),
              L('', '…¿Construyeron un mundo entero para enseñar? ¿Y después lo olvidaron?'),
            ],
            () => {
              setFlag('sawProjector');
              hooks.refresh();
            },
          );
        },
      },
      {
        id: 'portal', x: 740, y: 330, w: 80, h: 100,
        label: 'Portal', prompt: 'Cruzar el portal', color: 0x2e8b8b, solid: false, emoji: '✨',
        visible: () => f().sawProjector,
        onInteract: () =>
          say(
            [L('', 'El marco del portal zumba, suave, como invitando. Del otro lado se adivina una plaza en penumbra.')],
            () => {
              sfxPortal();
              hooks.goto('plaza', { x: 480, y: 430 });
            },
          ),
      },
    ],
  },

  /* ============ OHMDAL ============ */

  plaza: {
    id: 'plaza',
    name: 'Ohmdal — La plaza',
    floor: () => (f().puertaDone ? 0x262033 : f().ohmAwake ? 0x1a1926 : 0x15141f),
    wall: () => (f().puertaDone ? 0x3c3144 : 0x2e2a3c),
    doors: [
      {
        x: 435, y: 514, w: 90, h: 26,
        to: 'aula', spawn: { x: 740, y: 420 },
        label: 'Portal de regreso', color: 0x2e8b8b,
      },
      {
        x: 934, y: 245, w: 26, h: 100,
        to: 'taller', spawn: { x: 95, y: 300 },
        label: 'Taller de Lumen',
        locked: () =>
          f().ohmAwake
            ? null
            : [
                L('', 'La puerta del taller está trabada. Adentro, algo zumba… con desgano.'),
                L('Edda', 'Lumen no abre desde que el guardián se durmió. Dice que sin Ohm despierto el taller «perdió el alma». Dramático, el hombre.'),
              ],
      },
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'puerta', spawn: { x: 480, y: 430 },
        label: 'Arco norte',
        locked: () =>
          f().frenoDone
            ? null
            : [
                L('', 'El arco norte. Más allá se adivina la Puerta de Ohm, y el aire pincha la piel.'),
                L('', 'Edda dijo que esa cosa escupe rayos cuando se ofende. Mejor entender las piedras primero: el taller de Lumen queda al este.'),
              ],
      },
    ],
    things: [
      {
        id: 'pedestal', x: 480, y: 200, w: 56, h: 56, shape: 'circle',
        label: 'Ohm', prompt: 'Acercarse al pedestal', solid: true, emoji: '⚡',
        color: () => (f().ohmAwake ? 0xc9a437 : 0x4a4a4f),
        onInteract: () => {
          const fl = f();
          if (!fl.ohmAwake) despertarOhm();
          else if (fl.puertaDone) say(L('', 'Ohm brilla firme y parejo, como una lámpara con opiniones. La plaza entera parece respirar de nuevo.'));
          else say(L('', 'Ohm zumba bajito y te sigue con los ojos. De cerca, el zumbido parece una canción.'));
        },
      },
      {
        id: 'edda', x: 640, y: 330, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        // Edda acompaña la historia: tras despertar a Ohm se va al taller,
        // después a la Puerta, y vuelve a la plaza cuando todo se enciende
        visible: () => !f().ohmAwake || f().puertaDone,
        walksTo: 'taller',
        onInteract: () => {
          const fl = f();
          if (!fl.ohmAwake) {
            say([
              L('Edda', 'Eso del pedestal es Ohm, el guardián de la plaza. Lleva años dormido. Maese Lumen dice que los espíritus están ofendidos.'),
              L('Edda', 'Yo digo que algo se cortó. Pero a mí nadie me da bola.'),
              L('Edda', 'La fuente del pedestal todavía zumba, ¿sabés? Tiene fuerza. Lo que no tiene es… no sé. Andá a mirarlo vos.'),
            ]);
          } else if (!fl.frenoDone) {
            say(L('Edda', 'El taller de Lumen, al este. Dale. Quiero ver su cara cuando le cuentes lo de Ohm.'));
          } else if (!fl.puertaDone) {
            say([
              L('Edda', '¿Viste la cara de Lumen con la lámpara? Valió la pena tanto humo.'),
              L('Edda', 'La Puerta de Ohm está pasando el arco norte. Siempre me dio miedo. Hoy me da curiosidad. Es raro.'),
            ]);
          } else {
            say([
              L('Edda', 'Empuje sobre freno… No voy a dormir esta noche, pensando cuántas otras «magias» son cuentas.'),
              L('Edda', '¿Todas? ¿Ninguna? …¿La campana también?'),
            ]);
          }
        },
      },
      {
        id: 'lumen-plaza', x: 700, y: 200, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().puertaDone,
        walksTo: 'puerta',
        onInteract: () =>
          say(
            f().finished
              ? [
                  L('Maese Lumen', 'La campana suena distinto cuando uno sabe POR QUÉ suena. Mejor. Suena mejor.'),
                ]
              : [
                  L('Maese Lumen', 'Empuje sobre freno. Toda una vida custodiando una cuenta. …Una cuenta hermosa, eso sí.'),
                  L('Maese Lumen', 'Mirá la plaza. Mirá las lámparas. Andá a tocar la campana, forastero: te lo ganaste.'),
                ],
          ),
      },
      {
        id: 'lampara1', x: 220, y: 170, w: 26, h: 26, shape: 'circle',
        label: '', prompt: 'Mirar la lámpara', solid: true, emoji: '💡',
        color: () => (f().puertaDone ? 0xffd34d : f().ohmAwake ? 0x6e6448 : 0x3a3744),
        onInteract: () =>
          say(
            L('', f().puertaDone
              ? 'La lámpara arde con luz tibia y constante. Cuesta creer que estuvo muerta.'
              : f().ohmAwake
                ? 'La lámpara parpadea, tímida, desde que Ohm despertó. Como si recordara cómo se hacía.'
                : 'Una lámpara de la plaza. Fría, muda, apagada hace años.'),
          ),
      },
      {
        id: 'lampara2', x: 760, y: 170, w: 26, h: 26, shape: 'circle',
        label: '', prompt: 'Mirar la lámpara', solid: true, emoji: '💡',
        color: () => (f().puertaDone ? 0xffd34d : f().ohmAwake ? 0x6e6448 : 0x3a3744),
        onInteract: () =>
          say(L('', f().puertaDone ? 'Luz firme. La plaza tiene sombras de nuevo — de las buenas.' : 'Otra lámpara muerta. O dormida. Empieza a parecer que hay una diferencia.')),
      },
      {
        id: 'campana', x: 790, y: 110, w: 54, h: 66,
        label: 'Campana', prompt: 'La campana de Ohmdal', solid: true, emoji: '🔔',
        color: () => (f().puertaDone ? 0xb08d2a : 0x4f4a42),
        onInteract: () => {
          if (f().finished) say(L('', 'La campana todavía vibra, contenta. Los dos cables siguen ahí, esperando su lección.'));
          else if (f().puertaDone) tocarCampana();
          else say(L('', 'La campana de Ohmdal cuelga muda sobre la plaza apagada. La cuerda está al alcance, pero algo dice que todavía no.'));
        },
      },
    ],
    onEnter: () => {
      if (!f().plazaSeen) {
        say(
          [
            L('', 'La plaza está apagada. No oscura: apagada. Como si alguien hubiera bajado una palanca hace mucho y nadie recordara dónde.'),
            L('Edda', '¡Eh! ¿Y vos de dónde saliste? Nadie cruza el Arco desde antes de que yo naciera.'),
            L('Edda', 'Da igual. Si venís a robar reliquias, llegaste tarde: ya no funcionan.'),
          ],
          () => setFlag('plazaSeen'),
        );
      }
    },
  },

  taller: {
    id: 'taller',
    name: 'Ohmdal — Taller de Maese Lumen',
    floor: () => 0x241f1d,
    wall: () => 0x383028,
    doors: [
      { x: 0, y: 245, w: 26, h: 100, to: 'plaza', spawn: { x: 860, y: 300 }, label: 'Plaza' },
    ],
    things: [
      {
        id: 'lumen', x: 620, y: 220, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        // tras el puzzle del freno se adelanta a la Puerta (y después, a la plaza)
        visible: () => !f().frenoDone,
        walksTo: 'plaza',
        onInteract: () => {
          const fl = f();
          if (!fl.metLumen) {
            say(
              [
                L('Maese Lumen', '¡Atrás, espectro! …Oh. Carne y hueso. Disculpá: con esta túnica uno termina esperando fantasmas en todos lados.'),
                L('Maese Lumen', 'Así que vos sos quien despertó al guardián. Sin incienso. Sin cántico. Sin los tres golpes sagrados.'),
                L('Edda', 'Te dije mil veces que los golpes no hacían nada.'),
                L('Maese Lumen', '¡Los golpes mantienen la TRADICIÓN, Edda!'),
                L('Maese Lumen', '…Pero el forastero despertó a Ohm, y eso no lo logró ninguna tradición en treinta años. Vení. Mirá esto.'),
                L('Maese Lumen', 'La Lámpara Eterna del taller. Lleva una piedra rajada, y cada vez que bajo la palanca escupe chispas como dragón resfriado.'),
                L('Maese Lumen', 'Si tenés el don, el banco es tuyo. Yo miro desde acá. Por la tradición. Y por las cejas.'),
              ],
              () => setFlag('metLumen'),
            );
          } else {
            say(L('Maese Lumen', 'El banco es tuyo, forastero. Yo miro desde acá, con las cejas a salvo.'));
          }
        },
      },
      {
        id: 'edda-taller', x: 700, y: 310, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => !f().frenoDone,
        walksTo: 'plaza',
        onInteract: () =>
          say(
            !f().metLumen
              ? [L('Edda', 'Ese es Maese Lumen. Dejá que te grite lo del espectro primero; después es un pan de dios.')]
              : [L('Edda', 'Dale, el banco. Quiero ver la cara de Lumen cuando la lámpara funcione de verdad.')],
          ),
      },
      {
        id: 'banco', x: 400, y: 330, w: 170, h: 70,
        label: 'Banco de trabajo', prompt: 'Usar el banco de trabajo', color: 0x4a3c30, solid: true, emoji: '⚡',
        onInteract: () => {
          const fl = f();
          if (!fl.metLumen) say(L('', 'Mejor hablar primero con el dueño del taller. La túnica impone.'));
          else if (fl.frenoDone) abrirFreno(() => {}, true); // modo práctica: la Bitácora invita a volver
          else resolverFreno();
        },
      },
      {
        id: 'estantes', x: 360, y: 105, w: 280, h: 44,
        label: 'Estantes', prompt: 'Curiosear los estantes', color: 0x3c332a, solid: true, emoji: '🔬',
        onInteract: () =>
          say(L('', 'Frascos con etiquetas a mano: «Chispa embotellada (vacío)», «Silencio de tormenta», «NO ABRIR: ya está abierto».')),
      },
    ],
  },

  puerta: {
    id: 'puerta',
    name: 'Ohmdal — La Puerta de Ohm',
    floor: () => 0x191722,
    wall: () => 0x2b2638,
    doors: [
      { x: 420, y: 514, w: 120, h: 26, to: 'plaza', spawn: { x: 480, y: 80 }, label: 'Plaza' },
    ],
    things: [
      {
        id: 'lapuerta', x: 480, y: 190, w: 180, h: 150,
        label: 'La Puerta de Ohm', prompt: 'Examinar la Puerta', solid: true, emoji: '⚡',
        color: () => (f().puertaDone ? 0x8a7c50 : 0x3a3340),
        onInteract: () => {
          if (f().puertaDone) abrirPuerta(() => {}, true); // modo práctica
          else resolverPuerta();
        },
      },
      {
        id: 'edda-puerta', x: 330, y: 390, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => !f().puertaDone,
        walksTo: 'plaza',
        onInteract: () =>
          say([
            L('Edda', 'Mirala bien: el ojo de aguja. Dicen que mide el río que la cruza.'),
            L('Edda', 'Si la aguja se pasa de largo, agachate. Consejo de amiga.'),
          ]),
      },
      {
        id: 'lumen-puerta', x: 630, y: 390, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => !f().puertaDone,
        walksTo: 'plaza',
        onInteract: () =>
          say([
            L('Maese Lumen', '«Ni hambrienta ni ahogada», decían los Maestros de la Puerta. Toda mi vida creí que hablaban de cortesía en la mesa.'),
            L('Maese Lumen', 'Traje seis fusibles. Por si las dudas. Las dudas somos nosotros.'),
          ]),
      },
    ],
    onEnter: () => {
      if (!f().puertaIntro) {
        say(
          [
            L('', 'La Puerta de Ohm. Dos hojas de metal oscuro, un ojo de aguja, y el símbolo Ω grabado en el centro.'),
            L('Edda', 'Vinimos a mirar. Si explota, yo no estuve acá.'),
            L('Maese Lumen', 'Si se abre, yo SÍ estuve acá.'),
          ],
          () => setFlag('puertaIntro'),
        );
      }
    },
  },
};
