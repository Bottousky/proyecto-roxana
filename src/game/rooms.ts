import { state, setFlag, hooks } from '../state';
import { say, L, type Line } from '../ui/dialog';
import { showBitacoraButton, notifyNewEntry, openBitacora } from '../ui/bitacora';
import { abrirDespertar } from '../puzzles/despertar';
import { abrirFreno } from '../puzzles/freno';
import { abrirPuerta } from '../puzzles/puerta';
import { abrirBell } from '../puzzles/bell';
import { abrirChain } from '../puzzles/chain';
import { abrirBranches } from '../puzzles/branches';
import { abrirDistributor } from '../puzzles/distributor';
import { showEnd } from '../ui/end';
import { getEntries } from '../content/entries';
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
        L('Edda', '«Completé el camino», dice, tan tranquilo. No se lo cuentes a Lumen de golpe, que le da un soponcio.'),
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
        L('Maese Lumen', '«La piedra justa»… Donde otros ven magia, busca camino. Eso decían los Maestros. Nunca supe qué significaba.'),
        L('Maese Lumen', 'Si entiendes a las piedras… quizás puedas con la Puerta de Ohm. Al norte de la plaza. Nadie la abre desde la época de los Maestros.'),
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
      L('', 'Tiras de la cuerda. La campana de Ohmdal suena por primera vez en décadas: una nota limpia que recorre la plaza encendida.'),
      L('Maese Lumen', 'Los Maestros la tocaban al final de cada lección. Decían que el sonido «cerraba el circuito del día». Hasta hoy no le había encontrado la gracia.'),
      L('Edda', 'Oye. Mira. De la campana bajan DOS cables. Dos caminos. ¿Para qué querría alguien dos caminos para un mismo río?'),
      L('', '(Eso, Edda, es otra lección.)'),
    ],
    () => {
      setFlag('finished');
      const entradas = getEntries().length;
      const humo = state.flags.burnedSomething
        ? 'Cosas quemadas: sí. (Así se aprende.)'
        : 'Cosas quemadas: ninguna. (¿En serio nunca probaste qué pasaba?)';
      showEnd({
        title: 'Fin del vertical slice — Unidad 1: «La corriente no es magia»',
        note: `
          Entradas en la Bitácora: ${entradas} · ${humo}<br/><br/>
          La campana sonó. La plaza tiene luz. Y de la campana bajan dos cables…<br/>
          <em>Unidad 2: circuitos con más de un camino.</em>
        `,
        continueLabel: 'Continuar',
        onContinue: () => hooks.goto('aula', { x: 740, y: 420 }),
      });
    },
  );
}

function reproducirIntroUnidad2(): void {
  say(
    [
      L('Proyector', '*clac* MUNDOS APLICADOS. UNIDAD DOS.'),
      L('Proyector', 'El Castillo de Ohmdal: corazón de la red. De sus salas parten todos los ríos del reino.'),
      L('Proyector', 'Recuerde, estudiante: un reino no se enciende con un solo camino.'),
      L('', 'La imagen se corta. Sobre la lente, un lacre proyectado:'),
      L('', 'CLAUSURADO POR ORDEN DEL CONSEJO DE OHMDAL.'),
      L('', '«Conservación de chispa. Sin excepciones.»'),
      L('', '¿Un mundo de práctica… con zonas clausuradas por sus propios habitantes?'),
    ],
    () => {
      setFlag('playedUnit2Intro');
      hooks.refresh();
    },
  );
}

function abrirCampanaUnidad2(): void {
  say(
    [
      L('Edda', 'Volviste. Bien. No dormí pensando en esto.'),
      L('Edda', 'DOS cables. Misma campana. Los Maestros no ponían nada por adorno.'),
      L('Edda', '¿Para qué dos caminos para un mismo río?'),
      L('Ohm', 'Hipótesis disponible. Medición recomendada.'),
    ],
    () =>
      abrirBell(() => {
        setFlag('solvedBellPaths');
        notifyNewEntry('Dos caminos');
        hooks.refresh();
      }),
  );
}

function abrirInspeccionCastillo(): void {
  if (f().metConsejera) {
    say(L('Consejera', 'Inspección supervisada. Yo entro con ustedes. Yo anoto TODO.'));
    return;
  }
  say(
    [
      L('Consejera', 'Alto. Este recinto está clausurado por conservación de chispa. El Consejo no cierra puertas: conserva aperturas futuras.'),
      L('Edda', 'Medimos la campana. El río no se gasta: se reparte. Tenemos los números.'),
      L('Consejera', 'Los números del Consejo dicen que la chispa disminuye desde hace cuarenta años.'),
      L('Lumen', 'Los míos también lo decían, Consejera. Resultó que yo medía mi miedo, no el río. …Y mis fusibles murieron más dignamente desde entonces.'),
      L('Ohm', 'Solicitud: inspección. Probabilidad de desastre: moderada.'),
      L('Consejera', '«Moderada.» Al menos el calderito es honesto. Inspección supervisada. Yo entro con ustedes. Yo anoto TODO.'),
    ],
    () => {
      setFlag('metConsejera');
      setFlag('enteredCastle');
      hooks.refresh();
    },
  );
}

function reconocerCastillo(): void {
  if (!f().enteredCastle || f().ohmRecognizedCastle) return;
  say(
    [
      L('Ohm', 'Registro antiguo encontrado. Este lugar. Origen: este lugar.'),
      L('Edda', '¿Ohm…?'),
      L('Ohm', 'Continuar.'),
    ],
    () => setFlag('ohmRecognizedCastle'),
  );
}

function abrirCadenaGaleria(): void {
  say(
    [
      L('Consejera', 'La Galería en régimen de austeridad: una sola línea. Sin derroches. Antes había seis lámparas. Las reduje yo misma a cuatro para ahorrar chispa.'),
      L('Edda', '¿Y brillan más desde entonces?'),
      L('Consejera', '…Brillan distinto.'),
      L('Ohm', 'Distinto: sí. Más: no.'),
    ],
    () =>
      abrirChain(() => {
        setFlag('solvedGalleryChain');
        notifyNewEntry('La Cadena');
        hooks.refresh();
      }),
  );
}

let branchesIntroSeen = false;

function presentarSalaRamales(): void {
  if (branchesIntroSeen || f().solvedBranches) return;
  branchesIntroSeen = true;
  say([
    L('Lumen', 'El Fusible del Tronco. El mártir más grande de Ohmdal. Cuando este se inmola, Consejera, no hay ritual que lo consuele.'),
    L('Consejera', 'Por eso las bocas están selladas. Tres talleres abiertos vaciarían el Tronco.'),
    L('Edda', '¿Vaciarlo? El río no es un balde… …¿O sí? Ohm: ¿es un balde?'),
    L('Ohm', 'Balde: no. Contable: sí.'),
  ]);
}

function abrirBancoRamales(): void {
  abrirBranches({
    practica: f().solvedBranches,
    onBurnedFuse: () => setFlag('burnedTrunkFuse'),
    onSolved: () => {
      setFlag('solvedBranches');
      notifyNewEntry('Los Ramales');
      hooks.refresh();
    },
  });
}

let distributorIntroSeen = false;

function presentarCorazonCastillo(): void {
  if (distributorIntroSeen || f().solvedDistributor) return;
  distributorIntroSeen = true;
  say([
    L('Lumen', 'El Repartidor. Mi maestro decía que aquí los Maestros «le enseñaban al río a contar».'),
    L('Consejera', 'El Consejo lo selló primero. Dijimos: si el corazón no gasta, el cuerpo conserva.'),
    L('Edda', 'Y el cuerpo se apagó entero. Qué manera de conservar.'),
  ]);
}

function abrirBancoDistributor(): void {
  abrirDistributor({
    practica: f().solvedDistributor,
    onBurnedFuse: () => setFlag('burnedTrunkFuse'),
    onSolved: () => {
      setFlag('solvedDistributor');
      setFlag('castleRestored');
      setFlag('learnedSeriesParallel');
      notifyNewEntry('La Regla del Cruce');
      openBitacora('regla-del-cruce');
      hooks.refresh();
    },
  });
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
                L('Preceptor', '¿El nuevo? Llegas tarde. O temprano. Aquí ya nadie lleva mucho la cuenta.'),
                L('Preceptor', 'Antes del aula tienes que pasar por Dirección. La puerta de la izquierda. Está abierta; siempre está abierta. No sé por qué la seguimos llamando Dirección.'),
                L('Preceptor', 'Y una cosa: si algo zumba, no lo toques. …Todavía.'),
              ],
              () => setFlag('talkedPreceptor'),
            );
          } else if (!fl.hasBitacora) {
            say(L('Preceptor', 'Dirección. Izquierda. Zumbidos, no.'));
          } else if (!fl.sawProjector) {
            say([
              L('Preceptor', '¿Eso es… una Bitácora? Hacía años que no veía una de esas.'),
              L('Preceptor', 'El Aula de Electrónica es la puerta de la derecha. Anda: el aula sabe qué hacer. …Es una forma de decir. Creo.'),
            ]);
          } else {
            say(L('Preceptor', '¿Todavía por aquí? El aula. La derecha. Salúdame a… bah. Tú solo ve.'));
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
            L('', 'El Instituto Roxana. Nadie te acompañó hasta la puerta; «queda lejos», dijeron. La verdad es que nadie elige venir aquí. Tú tampoco.'),
            L('', 'El hall es enorme y huele a cera vieja. Los pasos hacen eco. Junto a la escalera hay un hombre de bata gris.'),
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
        id: 'lampara-aula', x: 160, y: 105, w: 30, h: 30, shape: 'circle',
        label: 'Lámpara', prompt: 'Mirar la lámpara', color: 0xffd34d, solid: true, emoji: '💡',
        visible: () => f().finished,
        onInteract: () => say(L('', 'Una de las lámparas del aula ahora funciona.')),
      },
      {
        id: 'pizarron', x: 480, y: 100, w: 280, h: 54,
        label: 'Pizarrón', prompt: 'Leer el pizarrón', color: 0x24352c, solid: true, emoji: '✏️',
        onInteract: () =>
          say(
            L(
              '',
              f().finished
                ? '«Donde otros ven magia, busca camino»'
                : 'En el pizarrón, escrito hace mucho y nunca borrado del todo: «Donde otros ven magia, …». El resto se perdió.',
            ),
          ),
      },
      {
        id: 'proyector', x: 330, y: 330, w: 90, h: 60,
        label: 'Proyector', prompt: 'Encender el proyector', color: 0x4a4a55, solid: true, emoji: '📽️',
        onInteract: () => {
          const fl = f();
          if (fl.finished && !fl.playedUnit2Intro) {
            reproducirIntroUnidad2();
            return;
          }
          if (fl.finished) {
            // TODO(guion): falta la línea del proyector tras reproducir el módulo dos.
            say(L('', 'El proyector está apagado.'));
            return;
          }
          if (fl.sawProjector) {
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
        id: 'panel-portal', x: 740, y: 245, w: 100, h: 34,
        label: 'Panel V/I/R', prompt: 'Examinar el panel V/I/R', color: 0x4fd6c8, solid: true, emoji: '⚡',
        visible: () => f().finished,
        onInteract: () => say(L('', 'El panel V/I/R del portal brilla estable, no intermitente.')),
      },
      {
        id: 'portal', x: 740, y: 330, w: 80, h: 100,
        label: 'Portal', prompt: 'Cruzar el portal',
        color: () => (f().finished ? 0x45c7bd : 0x2e8b8b),
        solid: false, emoji: '✨',
        visible: () => f().sawProjector,
        onInteract: () => {
          if (f().finished) {
            sfxPortal();
            hooks.goto('plaza', { x: 480, y: 430 });
            return;
          }
          say(
            [L('', 'El marco del portal zumba, suave, como invitando. Del otro lado se adivina una plaza en penumbra.')],
            () => {
              sfxPortal();
              hooks.goto('plaza', { x: 480, y: 430 });
            },
          );
        },
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
      {
        x: 0, y: 75, w: 26, h: 110,
        to: 'castle_gate', spawn: { x: 860, y: 270 },
        label: 'Camino al Castillo',
        color: 0x65536f,
        locked: () => {
          if (f().solvedBellPaths) return null;
          // TODO(guion): falta una línea ambiente para el camino antes de resolver la campana.
          return [L('', 'El camino al Castillo sigue oculto entre la niebla.')];
        },
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
        visible: () =>
          (!f().ohmAwake || f().puertaDone) &&
          !(f().playedUnit2Intro && !f().solvedBellPaths),
        walksTo: 'taller',
        onInteract: () => {
          const fl = f();
          if (!fl.ohmAwake) {
            say([
              L('Edda', 'Eso del pedestal es Ohm, el guardián de la plaza. Lleva años dormido. Maese Lumen dice que los espíritus están ofendidos.'),
              L('Edda', 'Yo digo que algo se cortó. Pero a mí nadie me hace caso.'),
              L('Edda', 'La fuente del pedestal todavía zumba, ¿sabes? Tiene fuerza. Lo que no tiene es… no sé. Anda a verlo tú.'),
            ]);
          } else if (!fl.frenoDone) {
            say(L('Edda', 'El taller de Lumen, al este. Vamos. Quiero ver su cara cuando le cuentes lo de Ohm.'));
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
        id: 'edda-campana', x: 710, y: 115, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().playedUnit2Intro && !f().solvedBellPaths,
        onInteract: abrirCampanaUnidad2,
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
                  L('Maese Lumen', 'Mira la plaza. Mira las lámparas. Ve a tocar la campana, forastero: te lo ganaste.'),
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
          const fl = f();
          if (fl.playedUnit2Intro) {
            if (fl.solvedBellPaths) abrirBell(() => {}, true);
            else abrirCampanaUnidad2();
          } else if (fl.finished) {
            say(L('', 'La campana todavía vibra, contenta. Los dos cables siguen ahí, esperando su lección.'));
          } else if (fl.puertaDone) tocarCampana();
          else say(L('', 'La campana de Ohmdal cuelga muda sobre la plaza apagada. La cuerda está al alcance, pero algo dice que todavía no.'));
        },
      },
    ],
    onEnter: () => {
      if (!f().plazaSeen) {
        say(
          [
            L('', 'La plaza está apagada. No oscura: apagada. Como si alguien hubiera bajado una palanca hace mucho y nadie recordara dónde.'),
            L('Edda', '¡Eh! ¿Y tú de dónde saliste? Nadie cruza el Arco desde antes de que yo naciera.'),
            L('Edda', 'Da igual. Si vienes a robar reliquias, llegaste tarde: ya no funcionan.'),
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
                L('Maese Lumen', '¡Atrás, espectro! …Oh. Carne y hueso. Disculpa: con esta túnica uno termina esperando fantasmas en todos lados.'),
                L('Maese Lumen', 'Así que tú eres quien despertó al guardián. Sin incienso. Sin cántico. Sin los tres golpes sagrados.'),
                L('Edda', 'Te dije mil veces que los golpes no hacían nada.'),
                L('Maese Lumen', '¡Los golpes mantienen la TRADICIÓN, Edda!'),
                L('Maese Lumen', '…Pero el forastero despertó a Ohm, y eso no lo logró ninguna tradición en treinta años. Ven. Mira esto.'),
                L('Maese Lumen', 'La Lámpara Eterna del taller. Lleva una piedra rajada, y cada vez que bajo la palanca escupe chispas como dragón resfriado.'),
                L('Maese Lumen', 'Si tienes el don, el banco es tuyo. Yo miro desde aquí. Por la tradición. Y por las cejas.'),
              ],
              () => setFlag('metLumen'),
            );
          } else {
            say(L('Maese Lumen', 'El banco es tuyo, forastero. Yo miro desde aquí, con las cejas a salvo.'));
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
              ? [L('Edda', 'Ese es Maese Lumen. Deja que te grite lo del espectro primero; después es un pan de dios.')]
              : [L('Edda', 'Vamos, al banco. Quiero ver la cara de Lumen cuando la lámpara funcione de verdad.')],
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
            L('Edda', 'Mírala bien: el ojo de aguja. Dicen que mide el río que la cruza.'),
            L('Edda', 'Si la aguja se pasa de largo, agáchate. Consejo de amiga.'),
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
            L('Edda', 'Vinimos a mirar. Si explota, yo no estuve aquí.'),
            L('Maese Lumen', 'Si se abre, yo SÍ estuve aquí.'),
          ],
          () => setFlag('puertaIntro'),
        );
      }
    },
  },

  castle_gate: {
    id: 'castle_gate',
    name: 'Ohmdal — Puerta del Castillo',
    floor: () => (f().castleRestored ? 0x35271f : 0x201b25),
    wall: () => (f().castleRestored ? 0x5a4332 : 0x342b38),
    doors: [
      {
        x: 934, y: 220, w: 26, h: 110,
        to: 'plaza', spawn: { x: 95, y: 135 },
        label: 'Plaza de Ohmdal',
      },
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'castle_gallery', spawn: { x: 480, y: 440 },
        label: 'Umbral del Castillo',
        color: 0x765d45,
        locked: () =>
          f().metConsejera
            ? null
            : [L('Consejera', 'Este recinto está clausurado por conservación de chispa.')],
      },
    ],
    things: [
      {
        id: 'puerta-castillo', x: 480, y: 95, w: 230, h: 110,
        label: 'Puerta monumental', prompt: 'Examinar la puerta lacrada',
        color: () => (f().metConsejera ? 0x7a674f : 0x443842),
        solid: false,
        onInteract: abrirInspeccionCastillo,
      },
      {
        id: 'cartel-chispa', x: 190, y: 180, w: 190, h: 58,
        label: 'Cartel del Consejo', prompt: 'Leer el cartel',
        color: 0x665344, solid: true,
        onInteract: () => say(L('', '«La chispa que no se usa es chispa que se ahorra.»')),
      },
      {
        id: 'cartel-caminos', x: 770, y: 180, w: 190, h: 58,
        label: 'Cartel del Consejo', prompt: 'Leer el cartel',
        color: 0x665344, solid: true,
        onInteract: () => say(L('', '«Denuncie caminos abiertos sin permiso.»')),
      },
      {
        id: 'atril-consejo', x: 610, y: 345, w: 90, h: 62,
        label: 'Atril', prompt: 'Examinar el libro de inventario',
        color: 0x514334, solid: true,
        onInteract: () =>
          say(L('', 'La Consejera está junto a un atril con un libro de inventario.')),
      },
      {
        id: 'consejera-puerta', x: 505, y: 350, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera',
        color: 0x725d79, solid: true,
        visible: () => f().solvedBellPaths,
        onInteract: abrirInspeccionCastillo,
      },
      {
        id: 'edda-castle-gate', x: 365, y: 390, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true,
        visible: () => f().solvedBellPaths,
        onInteract: () => say(L('Edda', 'Medimos la campana. El río no se gasta: se reparte. Tenemos los números.')),
      },
      {
        id: 'lumen-castle-gate', x: 285, y: 335, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true,
        visible: () => f().solvedBellPaths,
        onInteract: () =>
          say(L('Lumen', 'Los míos también lo decían, Consejera. Resultó que yo medía mi miedo, no el río. …Y mis fusibles murieron más dignamente desde entonces.')),
      },
      {
        id: 'ohm-castle-gate', x: 735, y: 355, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedBellPaths,
        onInteract: () => say(L('Ohm', 'Solicitud: inspección. Probabilidad de desastre: moderada.')),
      },
    ],
  },

  castle_gallery: {
    id: 'castle_gallery',
    name: 'Castillo de Ohmdal — La Galería en Cadena',
    floor: () => (f().castleRestored ? 0x382d23 : 0x24212a),
    wall: () => (f().castleRestored ? 0x5b4735 : 0x393341),
    doors: [
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'castle_gate', spawn: { x: 480, y: 115 },
        label: 'Puerta del Castillo',
      },
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'castle_branches', spawn: { x: 480, y: 440 },
        label: 'Sala de los Ramales',
        locked: () => {
          if (f().solvedGalleryChain) return null;
          // TODO(guion): falta una línea de puerta para el gate de la Galería.
          return [L('', 'La puerta del fondo permanece sellada.')];
        },
      },
    ],
    things: [
      {
        id: 'lamparas-galeria', x: 480, y: 115, w: 520, h: 34,
        label: 'Lámparas en fila', prompt: 'Examinar las lámparas',
        color: 0x756c4a, solid: true,
        onInteract: () =>
          say(L('', 'Una sola línea de cobre recorre el techo con lámparas en fila: encendidas, pero tenues, todas exactamente igual de tenues.')),
      },
      {
        id: 'pedestales-galeria', x: 210, y: 280, w: 170, h: 58,
        label: 'Pedestales vacíos', prompt: 'Examinar los pedestales',
        color: 0x4c4652, solid: true,
        onInteract: () => say(L('', 'Pedestales vacíos donde antes hubo más lámparas.')),
      },
      {
        id: 'banco-cadena', x: 480, y: 330, w: 190, h: 76,
        label: 'Banco de la Cadena', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: () => {
          if (f().solvedGalleryChain) abrirChain(() => {}, true);
          else abrirCadenaGaleria();
        },
      },
      {
        id: 'consejera-galeria', x: 725, y: 335, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera',
        color: 0x725d79, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () =>
          say([
            L('Consejera', 'La Galería en régimen de austeridad: una sola línea. Sin derroches. Antes había seis lámparas. Las reduje yo misma a cuatro para ahorrar chispa.'),
            L('Edda', '¿Y brillan más desde entonces?'),
            L('Consejera', '…Brillan distinto.'),
            L('Ohm', 'Distinto: sí. Más: no.'),
          ]),
      },
      {
        id: 'edda-galeria', x: 800, y: 405, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () => say(L('Edda', '¿Y brillan más desde entonces?')),
      },
      {
        id: 'lumen-galeria', x: 650, y: 420, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () =>
          say(L('Lumen', '¡La fila entera muere por un soldado! En mis tiempos a eso lo llamábamos diseño solemne.')),
      },
      {
        id: 'ohm-galeria', x: 580, y: 395, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () => say(L('Ohm', 'Distinto: sí. Más: no.')),
      },
    ],
    onEnter: reconocerCastillo,
  },

  castle_branches: {
    id: 'castle_branches',
    name: 'Castillo de Ohmdal — Sala de los Ramales',
    floor: () => (f().castleRestored ? 0x34291f : 0x211f27),
    wall: () => (f().castleRestored ? 0x554333 : 0x34303b),
    doors: [
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'castle_gallery', spawn: { x: 480, y: 95 },
        label: 'Galería en Cadena',
      },
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'castle_heart', spawn: { x: 480, y: 440 },
        label: 'Corazón del Castillo',
        locked: () => {
          if (f().solvedBranches) return null;
          // TODO(guion): falta una línea de puerta para el gate de los Ramales.
          return [L('', 'La puerta del Corazón permanece sellada.')];
        },
      },
    ],
    things: [
      {
        id: 'tronco-ramales', x: 480, y: 145, w: 70, h: 190,
        label: 'Tronco', prompt: 'Examinar el Tronco',
        color: 0x8a6842, solid: true,
        onInteract: () =>
          say(L('', 'Un Tronco grueso baja de lo alto y se abre en brazos hacia tres bocas de taller selladas.')),
      },
      {
        id: 'bocas-ramales', x: 250, y: 235, w: 230, h: 64,
        label: 'Tres bocas selladas', prompt: 'Examinar las bocas de taller',
        color: 0x4d4248, solid: true,
        onInteract: () => say(L('', 'Tres bocas de taller selladas.')),
      },
      {
        id: 'fusible-mayor', x: 705, y: 180, w: 180, h: 70,
        label: 'Fusible mayor', prompt: 'Examinar la vitrina',
        color: 0x61584c, solid: true,
        onInteract: () =>
          say(L('', 'Sobre el Tronco, un fusible mayor del tamaño de un antebrazo, en una vitrina con honores.')),
      },
      {
        id: 'banco-ramales', x: 480, y: 360, w: 190, h: 76,
        label: 'Banco de los Ramales', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoRamales,
      },
      {
        id: 'consejera-ramales', x: 740, y: 350, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera',
        color: 0x725d79, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () =>
          say([
            L('Lumen', 'El Fusible del Tronco. El mártir más grande de Ohmdal. Cuando este se inmola, Consejera, no hay ritual que lo consuele.'),
            L('Consejera', 'Por eso las bocas están selladas. Tres talleres abiertos vaciarían el Tronco.'),
            L('Edda', '¿Vaciarlo? El río no es un balde… …¿O sí? Ohm: ¿es un balde?'),
            L('Ohm', 'Balde: no. Contable: sí.'),
          ]),
      },
      {
        id: 'edda-ramales', x: 815, y: 410, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () => say(L('Edda', '¿Vaciarlo? El río no es un balde… …¿O sí? Ohm: ¿es un balde?')),
      },
      {
        id: 'lumen-ramales', x: 660, y: 425, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () =>
          say(L('Lumen', 'El Fusible del Tronco. El mártir más grande de Ohmdal. Cuando este se inmola, Consejera, no hay ritual que lo consuele.')),
      },
      {
        id: 'ohm-ramales', x: 590, y: 405, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () => say(L('Ohm', 'Balde: no. Contable: sí.')),
      },
    ],
    onEnter: presentarSalaRamales,
  },

  castle_heart: {
    id: 'castle_heart',
    name: 'Castillo de Ohmdal — El Corazón',
    floor: () => (f().castleRestored ? 0x3b2b20 : 0x241f29),
    wall: () => (f().castleRestored ? 0x654936 : 0x3b303e),
    doors: [
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'castle_branches', spawn: { x: 480, y: 95 },
        label: 'Sala de los Ramales',
      },
    ],
    things: [
      {
        id: 'repartidor', x: 480, y: 205, w: 250, h: 130,
        label: 'El Repartidor', prompt: 'Examinar el tablero maestro',
        color: 0x766247, solid: true,
        onInteract: () =>
          say(L('', 'Un tablero maestro de cobre y piedra del que parten tres canales mayores, uno por distrito del Castillo: la forja, el campanario, la biblioteca.')),
      },
      {
        id: 'mosaico-corazon', x: 480, y: 390, w: 330, h: 72,
        label: 'Mosaico del Cruce', prompt: 'Examinar el mosaico',
        color: 0x4f5660, solid: false,
        onInteract: () =>
          say(
            L(
              '',
              f().castleRestored
                ? '«Lo que entra en el cruce, sale del cruce. Nada se pierde. Todo se reparte.»'
                : 'En el suelo, un mosaico: un río que entra a un cruce y sale en tres brazos, con la inscripción gastada que se revelará al final.',
            ),
          ),
      },
      {
        id: 'banco-repartidor', x: 180, y: 315, w: 190, h: 76,
        label: 'Banco del Repartidor', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoDistributor,
      },
      {
        id: 'consejera-corazon', x: 745, y: 330, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera',
        color: 0x725d79, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () =>
          say([
            L('Lumen', 'El Repartidor. Mi maestro decía que aquí los Maestros «le enseñaban al río a contar».'),
            L('Consejera', 'El Consejo lo selló primero. Dijimos: si el corazón no gasta, el cuerpo conserva.'),
            L('Edda', 'Y el cuerpo se apagó entero. Qué manera de conservar.'),
          ]),
      },
      {
        id: 'edda-corazon', x: 820, y: 405, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () => say(L('Edda', 'Y el cuerpo se apagó entero. Qué manera de conservar.')),
      },
      {
        id: 'lumen-corazon', x: 660, y: 420, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true,
        visible: () => f().enteredCastle,
        onInteract: () =>
          say(L('Lumen', 'El Repartidor. Mi maestro decía que aquí los Maestros «le enseñaban al río a contar».')),
      },
      {
        id: 'ohm-corazon', x: 585, y: 405, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().enteredCastle,
        // TODO(guion): la sección 7 no incluye una línea de presentación de Ohm.
        onInteract: () => say(L('', 'Ohm observa el Repartidor en silencio.')),
      },
    ],
    onEnter: presentarCorazonCastillo,
  },
};
