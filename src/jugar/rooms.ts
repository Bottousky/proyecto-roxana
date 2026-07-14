import { state, setFlag, hooks } from '../state';
import { say, L, type Line } from '../ui/dialog';
import {
  showBitacoraButton,
  notifyNewEntry,
  openBitacora,
  wasBitacoraEntryOpened,
} from '../ui/bitacora';
import { abrirDespertar } from '../puzzles/despertar';
import { abrirFreno } from '../puzzles/freno';
import { abrirPuerta } from '../puzzles/puerta';
import { abrirBell } from '../puzzles/bell';
import { abrirChain } from '../puzzles/chain';
import { abrirBranches } from '../puzzles/branches';
import { abrirDistributor } from '../puzzles/distributor';
import { abrirTimbre } from '../puzzles/timbre';
import { abrirWarmth } from '../puzzles/warmth';
import { abrirInfirmary } from '../puzzles/infirmary';
import { abrirLongChannel } from '../puzzles/longchannel';
import { abrirForge } from '../puzzles/forge';
import { abrirSteps } from '../puzzles/steps';
import { abrirFairSplit } from '../puzzles/fairsplit';
import { abrirSingleStone } from '../puzzles/singlestone';
import { abrirLadder } from '../puzzles/ladder';
import { abrirStoredSpark } from '../puzzles/storedspark';
import { abrirSleepingRiver } from '../puzzles/sleepingriver';
import { abrirClock } from '../puzzles/clock';
import { abrirLighthouse } from '../puzzles/lighthouse';
import { showEnd } from '../ui/end';
import { showArcPanorama } from '../ui/arcPanorama';
import { confirmExitOhmdal } from '../ui/confirmExitOhmdal';
import { getEntries } from '../content/entries';
import { sfxBell, sfxPortal, setAmbience } from '../audio';
import { syncOhmCompanionButton } from '../ui/ohmCompanion.ts';
import { portalExitUrl } from '../shared/portalLink.ts';

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
  /** textura pixel (clave cargada en la escena) que reemplaza el prop procedural */
  sprite?: string;
  /** escala del sprite respecto a su tamaño nativo (default 1) */
  spriteScale?: number;
  /** el prop ya está pintado en el fondo de sala: no se dibuja cuerpo (sí interactúa/ilumina) */
  baked?: boolean;
  /** decorado/obstáculo sin hotspot ni prompt */
  interactive?: boolean;
  /** encaja el lienzo transparente del sprite en w×h */
  spriteFit?: 'bounds';
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
  visible?: () => boolean;
  /** Si devuelve líneas, la puerta está trabada y se muestran. `true` la traba en silencio. */
  locked?: () => Line[] | true | null;
}

export interface RoomDef {
  id: string;
  name: string;
  floor: () => number;
  wall: () => number;
  /** sala cerrada con fondo pintado: clave de textura que llena el chunk 960×540.
   *  Desactiva el pase procedural y el mundo continuo; las puertas son transición. */
  background?: string;
  /** colisión manual (muros/props horneados) para salas con `background` */
  collision?: { x: number; y: number; w: number; h: number }[];
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
    syncOhmCompanionButton();
    say(
      [
        L('Edda', '¡¿Lo DESPERTASTE?! ¿Qué ritual usaste? ¿El de los tres golpes? ¿El del incienso doble?'),
        L('', '—Ningún ritual. Solo… completé el camino.'),
        L('Edda', '«Completé el camino», dice, tan tranquilo. No se lo cuentes a Lumen de golpe, que le da un soponcio.'),
        L('Edda', 'Ohm, vienes con nosotros. Nada de volver a dormir apenas me doy vuelta.'),
        L('Ohm', 'Compañía aceptada. Orientación disponible cuando sea requerida.'),
        L('', 'Ohm se acomoda en el comunicador de tu Bitácora. Desde ahora puedes consultarlo con O o desde su retrato en el HUD.'),
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
    // La sala debe contar el resultado antes que los personajes: al aparecer
    // el diálogo de victoria, las hojas ya están visualmente abiertas.
    hooks.refresh();
    say(
      [
        L('', 'Las hojas se apartan. Del otro lado no hay una sala: una calzada de cobre sube hacia el manantial y el río de chispa corre por ella hasta la plaza.'),
        L('Maese Lumen', 'Se abrió… La Puerta regulaba el caudal del pueblo: ni hambrienta ni ahogada. Empuje y freno, medidos el uno contra el otro.'),
        L('Edda', 'Empuje sobre freno. Es… ¿es una CUENTA? ¿Todo este tiempo era una cuenta?'),
        L('', 'Las lámparas despiertan una tras otra a tus espaldas. La Bitácora arde tibia en tu bolsillo, escribiéndose a fuego.'),
      ],
      () => {
        notifyNewEntry('La Ley de Ohm');
        openBitacora('ley-de-ohm');
      },
    );
  });
}

function tocarCampana(): void {
  sfxBell();
  // El mundo cambia antes del diálogo: la plaza se ilumina mientras la nota
  // todavía está sonando, igual que la Puerta al resolverse.
  setFlag('finished');
  hooks.refresh();
  say(
    [
      L('', 'Tiras de la cuerda. La campana de Ohmdal suena por primera vez en décadas: una nota limpia que recorre la plaza encendida.'),
      L('Maese Lumen', 'Los Maestros la tocaban al final de cada lección. Decían que el sonido «cerraba el circuito del día». Hasta hoy no le había encontrado la gracia.'),
      L('Edda', 'Oye. Mira. De la campana bajan DOS cables. Dos caminos. ¿Para qué querría alguien dos caminos para un mismo río?'),
      L('Ohm', 'La nota cruzó el portal. Respuesta detectada en el Instituto.'),
      L('', 'Desde el otro lado llega un sonido pequeño y conocido: el proyector acaba de encenderse. *clac*'),
    ],
    // El Instituto ya no se representa dentro de Phaser. La continuación
    // vuelve al aula gráfica de la web, que reproduce allí la introducción U2.
    () => { window.location.href = portalExitUrl(); },
  );
}

function reproducirIntroUnidad2(activacionAutomatica = false): void {
  say(
    [
      ...(activacionAutomatica
        ? [L('', 'Apenas cruzas el portal, la nota de la campana vibra en los vidrios del aula. El proyector responde solo: *clac*.')]
        : []),
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

function reproducirIntroUnidad3(activacionAutomatica = false): void {
  say(
    [
      ...(activacionAutomatica
        ? [L('', 'Al entrar al aula, la Bitácora vibra sobre tu costado. El proyector reconoce una nueva entrada y se enciende solo: *clac*.')]
        : []),
      L('Proyector', '*clac* MUNDOS APLICADOS. UNIDAD TRES.'),
      L('Proyector', 'La Forja de Ohmdal: donde el río trabaja.'),
      L('Proyector', 'Recuerde, estudiante: nada que trabaja, trabaja gratis.'),
      L('', 'La imagen tiembla y se corta. Sobre la lente, un instante, la silueta de un fusible fundido.'),
      L('', '(¿Eso fue una lección… o un aviso?)'),
    ],
    () => {
      setFlag('playedUnit3Intro');
      hooks.refresh();
    },
  );
}

function reproducirIntroUnidad4(activacionAutomatica = false): void {
  say(
    [
      ...(activacionAutomatica
        ? [L('', 'Al entrar al aula, la Bitácora vibra sobre tu costado. El proyector reconoce una nueva entrada y se enciende solo: *clac*.')]
        : []),
      L('Proyector', '*clac* MUNDOS APLICADOS. UNIDAD CUATRO.'),
      L('Proyector', 'Las Terrazas de Ohmdal: el agua que baja pensando.'),
      L('Proyector', 'Recuerde, estudiante: lo que sube, baja. Y lo que baja, se reparte.'),
      L('', 'La imagen se aclara un instante en un acueducto de cobre escalonado, y se apaga.'),
      L('', '(Agua que piensa. En esta escuela ya nada me sorprende.)'),
    ],
    () => {
      setFlag('playedUnit4Intro');
      hooks.refresh();
    },
  );
}

function reproducirIntroUnidad5(activacionAutomatica = false): void {
  say(
    [
      ...(activacionAutomatica
        ? [L('', 'Al entrar al aula, la Bitácora vibra sobre tu costado. El proyector reconoce una nueva entrada y se enciende solo: *clac*.')]
        : []),
      L('Proyector', '*clac* MUNDOS APLICADOS. UNIDAD CINCO.'),
      L('Proyector', 'El Faro de Ohmdal: la luz que recuerda.'),
      L('Proyector', 'Recuerde, estudiante: lo que sube y baja… a veces se queda un rato.'),
      L('', 'La imagen muestra un destello que late —una vez, dos— y se apaga.'),
      L('', '(¿Se queda? Aprendimos que sin camino no se queda nada. …¿O sí?)'),
    ],
    () => {
      setFlag('playedUnit5Intro');
      hooks.refresh();
    },
  );
}

function presentarFarero(): void {
  if (f().metFarero) {
    say(L('Farero', 'El Faro no necesita más brillo. Necesita recordar su latido.'));
    return;
  }
  say(
    [
      L('Farero', '¿Vienen por la luz? La luz es lo de menos. Este faro no alumbraba: avisaba.'),
      L('Farero', 'Y para avisar hay que latir. La-aaa-tido. La-aaa-tido. Yo me acuerdo. El ritmo lo tengo acá. (se toca la sien)'),
      L('Edda', 'Nosotros vimos algo imposible, hace tiempo. Una chispa que brilló sin camino. Lo anotamos y no lo entendimos.'),
      L('Farero', 'Ah. Entonces ya conocen al Estanque. Solo que todavía no sabían su nombre.'),
    ],
    () => {
      setFlag('metFarero');
      hooks.refresh();
    },
  );
}

function abrirBancoStoredSpark(): void {
  if (!f().metFarero) {
    say(L('', 'La máquina está cuidada, pero no sabés qué espera de vos. El Farero conoce su pulso.'));
    return;
  }
  abrirStoredSpark({
    practica: f().solvedStoredSpark,
    onAnomalyNoted: () => setFlag('consejeraNotedAnomaly'),
    onSolved: () => {
      setFlag('solvedStoredSpark');
      notifyNewEntry('La chispa que se queda');
      hooks.refresh();
    },
  });
}

function abrirBancoSleepingRiver(): void {
  abrirSleepingRiver(
    () => {
      setFlag('solvedSleepingRiver');
      notifyNewEntry('El río que se duerme');
      hooks.refresh();
    },
    f().solvedSleepingRiver,
  );
}

function abrirBancoClock(): void {
  abrirClock(
    () => {
      setFlag('solvedClock');
      setFlag('clockRestored');
      notifyNewEntry('El tic');
      hooks.refresh();
    },
    f().solvedClock,
  );
}

function abrirBancoLighthouse(): void {
  abrirLighthouse(
    () => {
      setFlag('solvedLighthouse');
      setFlag('lighthouseRestored');
      setFlag('learnedCapacitor');
      openBitacora('el-arco-del-rio');
      hooks.refresh();
    },
    f().solvedLighthouse,
  );
}

function hablarFareroLinterna(): void {
  if (f().solvedLighthouse) {
    say(L('Farero', 'Cuarenta años. Y sí: era exactamente ese latido.'));
    return;
  }
  say([
    L('Farero', 'No tengo planos. Tengo el oído. Mi padre me lo pasó, y a él el suyo.'),
    L('Farero', 'Ustedes ármenlo. Yo les digo cuándo. Cierro los ojos y escucho. Cuando el latido sea EL latido, lo van a saber porque se me van a llenar los ojos. No lo puedo evitar.'),
  ]);
}

function cerrarArcoUno(): void {
  const fl = f();
  if (
    fl.arcOneCompleted ||
    !fl.finished ||
    !fl.unit2Completed ||
    !fl.unit3Completed ||
    !fl.unit4Completed ||
    !fl.lighthouseRestored ||
    !fl.learnedCapacitor
  ) return;
  setAmbience('ohmdal-on');
  showArcPanorama(() => {
    say(
      [
        L('', 'La cámara se aleja. Ohmdal entero aparece encendido bajo la noche.'),
        L('', 'En la plaza, la campana responde a la Ley de Ohm: empuje y freno en la medida justa.'),
        L('', 'El Castillo sostiene sus tres distritos con la Regla del Cruce: el río no se gasta, se reparte.'),
        L('', 'La Forja trabaja en ritmo con la Entrega: empuje por río, trabajo que llega y peaje que se paga.'),
        L('', 'Las Terrazas brillan regadas por la Regla de la Vuelta: todo lo que sube, baja.'),
        L('', 'El Reloj marca y el Faro late por la Chispa que se queda: lo guardado espera y vuelve.'),
        L('Edda', 'Cinco lugares. Cinco lecciones. Y la chispa que «se estaba acabando» encendió todo, sin gastarse.'),
        L('Edda', '…Quiero estar del otro lado, alguna vez. Quiero que alguien me lo pregunte a MÍ. Con las manos, como hiciste vos.'),
        L('Maese Lumen', 'Yo cuidé esto cuarenta años sin entenderlo. Ustedes lo entendieron en cinco lunas.'),
        L('Maese Lumen', '…Gracias por no decírmelo en voz alta. Mis mártires van al museo de la Forja. Que aprendan los jóvenes lo que era el miedo.'),
        L('Consejera', 'Inventario final del Consejo: la chispa no disminuyó en cuarenta años. La estábamos guardando para nadie. Caso cerrado.'),
        L('Ohm', 'Registro: red de Ohmdal completa. Estado: viva en el tiempo. Promesa de la primera lección: cumplida.'),
        L('', 'En lo alto del Faro, el Farero muestra un ojo de cristal. Cuando la luz lo toca, mueve una aguja sin que nadie lo haya conectado a nada.'),
        L('Edda', '¿Y a ESE quién lo empuja? Un rayo de luz… ¿empujando un río?'),
        L('Farero', 'Eso, jóvenes, es de otra noche. La materia que decide. Yo ya tengo bastante con mi latido.'),
      ],
      () => {
        if (!wasBitacoraEntryOpened('el-arco-del-rio')) {
          notifyNewEntry('El Arco del Río');
        }
        setFlag('arcOneCompleted');
        setFlag('sawCrystalEye');
        setFlag('unit5Completed');
        const entradas = getEntries().length;
        showEnd({
          title: 'Fin del Arco I — «El Río» · Ohmdal, cinco unidades',
          variant: 'arc',
          note: `
          Entradas en la Bitácora: ${entradas}<br/><br/>
          <strong>Unidad 1 · La plaza:</strong> la Ley de Ohm encendió la campana.<br/>
          <strong>Unidad 2 · El Castillo:</strong> la Regla del Cruce sostuvo sus tres distritos.<br/>
          <strong>Unidad 3 · La Forja:</strong> la Entrega devolvió el ritmo al trabajo.<br/>
          <strong>Unidad 4 · Las Terrazas:</strong> la Regla de la Vuelta regó el valle.<br/>
          <strong>Unidad 5 · El Reloj y el Faro:</strong> la Chispa que se queda les devolvió el tiempo.<br/><br/>
          <em>Semilla de otra historia: un ojo de cristal que responde a la luz.</em>
          `,
          continueLabel: 'Continuar',
          onContinue: () => hooks.goto('hall', { x: 480, y: 300 }),
        });
      },
    );
  });
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

/* ---------- M8: gancho capacitor (castle_heart) ---------- */

function cortarTroncoParaActa(): void {
  // Secuencia: se corta el Tronco... el mecanismo sigue brillando 3 s
  say(
    [
      L('', 'La Consejera toma nota. «Para el acta: corte del Tronco principal.»'),
      L('', 'Se corta el Tronco. El Repartidor queda sin camino.'),
      L('', '…Un mecanismo auxiliar del tablero sigue brillando. Tres segundos. Solo. Sin camino.'),
      L('Edda', '…El camino estaba cortado. ¿De DÓNDE salió ese río?'),
      L('Ohm', 'Dato no contable. Repetición recomendada.'),
      L('Consejera', '(reabriendo el libro de inventario) No pienso anotar eso.'),
    ],
    () => {
      setFlag('sawStoredSpark');
      notifyNewEntry('Anomalía: la chispa que se queda');
      hooks.refresh();
      checkUnit2Complete();
    },
  );
}

/* ---------- M8: cierre de unidad ---------- */

function checkUnit2Complete(): void {
  if (f().fixedSchoolBell && f().sawStoredSpark && !f().unit2Completed) {
    setFlag('unit2Completed');
    const entradas = getEntries().length;
    const martir = f().burnedTrunkFuse
      ? 'El Mártir cayó en cumplimiento del deber.'
      : 'El Fusible mayor sigue intacto. ¿Nadie tuvo curiosidad?';
    showEnd({
      title: 'Fin de la Unidad 2 — «El río se reparte»',
      note: `
        Entradas en la Bitácora: ${entradas} · ${martir}<br/><br/>
        …Y algo brilló sin camino. La Bitácora lo registró.
      `,
      continueLabel: 'Regresar al Instituto',
      onContinue: () => hooks.goto('aula', { x: 740, y: 420 }),
    });
  }
}

/* ---------- M8: timbre del Instituto ---------- */

function abrirBancoTimbre(): void {
  abrirTimbre({
    practica: f().fixedSchoolBell,
    onSolved: () => {
      setFlag('fixedSchoolBell');
      say(
        [
          L('', 'El preceptor se asoma al pasillo. Mira el parlante un rato largo, como a un fantasma educado.'),
          L('Preceptor', 'Veinte años sin sonar.'),
          L('Preceptor', '…Voy a tener que volver a llegar puntual.'),
        ],
        () => {
          hooks.refresh();
          checkUnit2Complete();
        },
      );
    },
  });
}

/* ---------- F1: salas de la Forja ---------- */

function hablarForjadoraPatio(): void {
  if (f().metForjadora) {
    say(L('Yesca', '¿Y? El canal sigue tibio y yo sigo pagando carbón. El banco está ahí.'));
    return;
  }
  say(
    [
      L('Yesca', '¿Tú eres quien anda encendiendo cosas? Bien. Tenemos que hablar.'),
      L('Yesca', 'Tercer fusible de la semana. Y los canales entibian como sopa. Esto antes no pasaba.'),
      L('Consejera', 'Antes no pasaba NADA, Yesca. Esa era exactamente la política.'),
      L('Yesca', '…Touché.'),
      L('Yesca', 'Mira: yo no entiendo de ríos ni de cuentas. Entiendo de carbón. Y desde que la Forja despertó, el carbón vuela. Algo se está yendo a alguna parte.'),
      L('Consejera', 'Eso vine a preguntar. Medimos el río: no se gasta. Lo demostraron ustedes. Entonces, ¿qué es lo que falta cada mañana?'),
      L('Edda', '…Esa es buena pregunta. Ohm: ¿tienes algo para el calor?'),
      L('Ohm', 'Modo nuevo disponible: termómetro. Apoyo la mano. Reporto el peaje.'),
    ],
    () => {
      setFlag('metForjadora');
      hooks.refresh();
    },
  );
}

function abrirBancoWarmth(): void {
  if (!f().metForjadora) {
    say(L('', 'El canal está tibio, pero todavía falta entender qué problema está intentando mostrar Yesca.'));
    return;
  }
  abrirWarmth(
    () => {
      setFlag('solvedWarmChannel');
      notifyNewEntry('El peaje');
      hooks.refresh();
    },
    f().solvedWarmChannel,
  );
}

let infirmaryIntroSeen = false;

function presentarEnfermeria(): void {
  if (infirmaryIntroSeen || f().solvedFuseInfirmary) return;
  infirmaryIntroSeen = true;
  say([
    L('Lumen', 'Mi enfermería. Bueno… mi cementerio, técnicamente. Cada uno de estos murió por la Forja.'),
    L('Lumen', 'Este murió joven. Este no murió nunca — y dejó morir al canal. Empiezo a sospechar, estudiante, que la santidad era una cuestión de calibre.'),
    L('Yesca', 'Yo necesito que dejen de morirse, Lumen. O al menos que se mueran con sentido.'),
    L('Ohm', 'Corrección: morirse con sentido es la función. Fusible = el que muere a propósito, para que no muera otra cosa.'),
    L('Edda', '…Eso es lo más bonito que dijiste nunca, Ohm.'),
    L('Ohm', 'Registro: poesía accidental. No se repetirá.'),
  ]);
}

function abrirBancoInfirmary(): void {
  abrirInfirmary({
    practica: f().solvedFuseInfirmary,
    onBurnedChannel: () => setFlag('burnedChannelDemo'),
    onSolved: () => {
      setFlag('solvedFuseInfirmary');
      notifyNewEntry('El mártir y el margen');
      hooks.refresh();
    },
  });
}

let longChannelIntroSeen = false;

function presentarCanalLargo(): void {
  if (longChannelIntroSeen || f().solvedLongChannel) return;
  longChannelIntroSeen = true;
  say([
    L('Yesca', 'Mi horno. El bueno. Lleva años frío porque cada vez que lo alimentamos, el canal se pone al rojo a mitad de camino.'),
    L('Yesca', 'No se puede cambiar el canal. Pasa por abajo de media Forja. O lo alimentas con ESE cable, o no hay horno.'),
    L('Edda', 'Río suficiente para el horno, por un canal que no aguanta río… Suena a trampa.'),
    L('Ohm', 'Reformulación: entrega suficiente. La entrega viaja de más de una manera.'),
  ]);
}

function hablarForjadoraCanalLargo(): void {
  if (!longChannelIntroSeen && !f().solvedLongChannel) {
    presentarCanalLargo();
    return;
  }
  say(L('Yesca', 'El horno sigue esperando al final del canal.'));
}

function abrirBancoLongChannel(): void {
  abrirLongChannel({
    practica: f().solvedLongChannel,
    onSolved: () => {
      setFlag('solvedLongChannel');
      notifyNewEntry('La Entrega');
      hooks.refresh();
    },
  });
}

let forgeIntroSeen = false;

function presentarForjaCompleta(): void {
  if (forgeIntroSeen || f().solvedForgeNetwork) return;
  forgeIntroSeen = true;
  say([
    L('Yesca', 'Todo junto, una vez. Como cuando era niña.'),
    L('Yesca', 'Tres máquinas, un solo tronco, y el cobre que hay: un canal ancho, dos medios, dos angostos. Ni uno más. Repártelo bien.'),
    L('Consejera', 'Y yo anoto la entrega de cada una. Por hora.'),
    L('Consejera', 'Inventario de jornales. Este sí.'),
  ]);
}

function hablarForjadoraNave(): void {
  if (!forgeIntroSeen && !f().solvedForgeNetwork) {
    presentarForjaCompleta();
    return;
  }
  if (f().forgeRestored) {
    say(L('Yesca', 'Ese compás. ESE.'));
    return;
  }
  say(L('Yesca', 'Tres máquinas, un tronco, el cobre que hay. Cuando estés listo: el tablero.'));
}

function abrirBancoForge(): void {
  abrirForge({
    practica: f().solvedForgeNetwork,
    onSolved: () => {
      setFlag('solvedForgeNetwork');
      setFlag('forgeRestored');
      setFlag('learnedPower');
      notifyNewEntry('El Jornal');
      hooks.refresh();
      openBitacora('el-jornal');
    },
  });
}

/* ---------- F6: cierre de la Unidad 3 ---------- */

function checkUnit3Complete(): void {
  if (!f().learnedPower || f().unit3Completed) return;
  setFlag('unit3Completed');
  const entradas = getEntries().length;
  const canales = f().burnedChannelDemo
    ? 'Canales cortados: sí. (Yesca ya casi no te lo cobra.)'
    : 'Canales cortados: ninguno.';
  showEnd({
    title: 'Fin de la Unidad 3 — «El precio del río»',
    note: `
      Entradas en la Bitácora: ${entradas} · 56 jornales por hora, anotados.<br/>
      ${canales}<br/><br/>
      <em>Las Terrazas esperan: el empuje que baja por escalones.</em>
    `,
    continueLabel: 'Regresar al Instituto',
    onContinue: () => hooks.goto('aula', { x: 740, y: 420 }),
  });
}

function verElValle(): void {
  say(
    [
      L('Edda', '¿Ves el valle, allá abajo? Las Terrazas. El acueducto de cobre de los Maestros.'),
      L('Edda', 'Riega por niveles. O regaba.'),
      L('Yesca', 'Mi hierro va a las Terrazas desde siempre. La guardiana es de fiar — pero está paralizada: dice que el empuje «baja por escalones» y que la terraza más baja casi no recibe.'),
      L('Yesca', 'Treinta años sin tocar una piedra. Por miedo a que tocar una mueva todas. …Y lo peor es que tiene razón: mueve todas.'),
      L('Ohm', 'Dato: correcto. Conclusión: incompleta. Lo que mueve todas… se puede contar todo.'),
      L('Edda', '(sonríe) Eso suena a próxima lección.'),
    ],
    () => checkUnit3Complete(),
  );
}

/* ---------- T1: salas de las Terrazas ---------- */

function hablarGuardianaCanalAlto(): void {
  if (f().metGuardiana) {
    say(L('Guardiana', 'Todo está atado a todo. El banco muestra el canal alto, cuando estén listos.'));
    return;
  }
  say(
    [
      L('Guardiana', 'No te acerques a las piedras. …Perdón. Es la costumbre.'),
      L('Guardiana', 'Treinta años acá. Conozco cada canal de memoria. Y no muevo ninguno.'),
      L('Edda', '¿Por qué no?'),
      L('Guardiana', 'Porque si toco esta —y señala una cualquiera— cambia aquella, y la del fondo, y el riego entero. Todo está atado a todo.'),
      L('Guardiana', 'No es miedo. Es respeto. …Bueno. Un poco de miedo.'),
      L('Ohm', 'Observación correcta. Conclusión incompleta. Para leer una red atada: brazos.'),
    ],
    () => {
      setFlag('metGuardiana');
      hooks.refresh();
    },
  );
}

function abrirBancoEscalones(): void {
  if (!f().metGuardiana) {
    say(L('', 'Las compuertas forman una sola red. Antes de tocarlas, conviene escuchar a quien lleva treinta años cuidándolas.'));
    return;
  }
  abrirSteps(
    () => {
      setFlag('solvedVoltageSteps');
      notifyNewEntry('Los escalones');
      hooks.refresh();
    },
    f().solvedVoltageSteps,
  );
}

function abrirBancoReparto(): void {
  abrirFairSplit(
    () => {
      setFlag('solvedFairSplit');
      notifyNewEntry('El reparto del empuje');
      hooks.refresh();
    },
    f().solvedFairSplit,
  );
}

function abrirBancoPiedraUnica(): void {
  abrirSingleStone(
    () => {
      setFlag('solvedSingleStone');
      notifyNewEntry('La Piedra Única');
      hooks.refresh();
    },
    f().solvedSingleStone,
  );
}

function abrirBancoEscalera(): void {
  abrirLadder({
    practica: f().solvedLadder,
    onPredictionAttempted: () => setFlag('predictionAttempted'),
    onPredictionExact: () => setFlag('predictionExact'),
    onSolved: () => {
      setFlag('solvedLadder');
      setFlag('valleyRestored');
      setFlag('learnedKVL');
      openBitacora('la-escalera');
      hooks.refresh();
    },
  });
}

/* ---------- T6: cierre de la Unidad 4 ---------- */

function checkUnit4Complete(): void {
  if (!f().learnedKVL || f().unit4Completed) return;
  say(
    [
      L('Edda', '¿Y eso de ahí abajo? Esa torre, sobre el agua.'),
      L('Guardiana', 'El Faro. Lleva apagado desde que se fueron los Maestros. Parpadeaba, ¿saben?... latía. La-aaa-tido... la-aaa-tido. Nadie supo nunca con qué corazón.'),
      L('', 'Ohm se queda mirando el Faro un segundo de más, en silencio. Su pecho parpadea una vez.'),
      L('Ohm', 'Nada. Un dato viejo. Sigamos.'),
      L('Edda', '¿Ohm...?'),
    ],
    () => {
      setFlag('unit4Completed');
      const entradas = getEntries().length;
      const prediccion = f().predictionExact
        ? 'Primera predicción: exacta. (Dijiste el futuro y acertaste.)'
        : 'Primera predicción: fallada y corregida. (Así se aprende a leer.)';
      showEnd({
        title: 'Fin de la Unidad 4 — «La vuelta completa»',
        note: `
          Entradas en la Bitácora: ${entradas}<br/>
          ${prediccion}<br/><br/>
          <em>El Faro espera, sobre el lago. Dicen que latía.</em>
        `,
        continueLabel: 'Regresar al Instituto',
        onContinue: () => hooks.goto('aula', { x: 740, y: 420 }),
      });
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
        label: 'Taller de Electrónica',
        locked: () =>
          f().hasBitacora
            ? null
            : [
                L('', 'La puerta del Taller de Electrónica está cerrada con llave.'),
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
                L('Preceptor', 'Antes del taller tienes que pasar por Dirección. La puerta de la izquierda. Está abierta; siempre está abierta. No sé por qué la seguimos llamando Dirección.'),
                L('Preceptor', 'Y una cosa: si algo zumba, no lo toques. …Todavía.'),
              ],
              () => setFlag('talkedPreceptor'),
            );
          } else if (!fl.hasBitacora) {
            say(L('Preceptor', 'Dirección. Izquierda. Zumbidos, no.'));
          } else if (!fl.sawProjector) {
            say([
              L('Preceptor', '¿Eso es… una Bitácora? Hacía años que no veía una de esas.'),
              L('Preceptor', 'El Taller de Electrónica es la puerta de la derecha. Anda: el taller sabe qué hacer. …Es una forma de decir. Creo.'),
            ]);
          } else if (fl.fixedSchoolBell) {
            say([
              L('Preceptor', 'El timbre. Veinte años sin oírlo.'),
              L('Preceptor', '…Voy a tener que volver a llegar puntual.'),
            ]);
            checkUnit2Complete();
          } else {
            say(L('Preceptor', '¿Todavía por aquí? El aula. La derecha. Salúdame a… bah. Tú solo ve.'));
          }
        },
      },
      {
        id: 'timbre', x: 690, y: 310, w: 110, h: 60,
        label: 'Timbre del Instituto', prompt: 'Examinar el timbre',
        color: () => (f().fixedSchoolBell ? 0x8a7040 : 0x4a4250), solid: true, emoji: '🔔',
        visible: () => f().castleRestored,
        onInteract: () => {
          if (f().fixedSchoolBell) {
            say(L('', 'El timbre, vivo. Suena a horario ahora.'));
          } else {
            abrirBancoTimbre();
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
        id: 'retrato', x: 450, y: 70, w: 130, h: 54,
        label: 'Retrato', prompt: 'Mirar el retrato', color: 0x52443a, solid: false, emoji: '🖼️',
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
    name: 'Taller de Electrónica',
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
          if (fl.unit4Completed && !fl.playedUnit5Intro) {
            reproducirIntroUnidad5();
            return;
          }
          if (fl.unit4Completed) {
            say(L('Proyector', '*clac* Unidad cinco: en curso. Tenga paciencia. El tiempo es parte del circuito. *clac*'));
            return;
          }
          if (fl.unit3Completed && !fl.playedUnit4Intro) {
            reproducirIntroUnidad4();
            return;
          }
          if (fl.unit3Completed) {
            say(L('Proyector', '*clac* Unidad cuatro: en curso. Mida dos veces. Toque una. *clac*'));
            return;
          }
          if (fl.unit2Completed && !fl.playedUnit3Intro) {
            reproducirIntroUnidad3();
            return;
          }
          if (fl.unit2Completed) {
            say(L('Proyector', '*clac* Unidad tres: en curso. Abríguese. O no. Ya va a entender. *clac*'));
            return;
          }
          if (fl.finished && !fl.playedUnit2Intro) {
            reproducirIntroUnidad2();
            return;
          }
          if (fl.finished) {
            say(L('Proyector', '*clac* Unidad dos: en curso. Consulte su Bitácora. …Y no firme nada sin medirlo antes. *clac*'));
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
              L('Proyector', 'Último mantenimiento: hace cuarenta años. Que tenga una buena clase. *clac*'),
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
    onEnter: () => {
      if (f().unit4Completed && !f().playedUnit5Intro) {
        reproducirIntroUnidad5(true);
      } else if (f().unit3Completed && !f().playedUnit4Intro) {
        reproducirIntroUnidad4(true);
      } else if (f().unit2Completed && !f().playedUnit3Intro) {
        reproducirIntroUnidad3(true);
      } else if (f().finished && !f().playedUnit2Intro) {
        reproducirIntroUnidad2(true);
      }
    },
  },

  /* ============ OHMDAL ============ */

  plaza: {
    id: 'plaza',
    name: 'Ohmdal — La plaza',
    floor: () => (f().castleRestored ? 0x1e1b2e : f().puertaDone ? 0x262033 : f().ohmAwake ? 0x1a1926 : 0x15141f),
    wall: () => (f().castleRestored ? 0x3a2e44 : f().puertaDone ? 0x3c3144 : 0x2e2a3c),
    // Sala cerrada pintada (patio del castillo con arcos = transición). Ver
    // docs/grilla-mundo-ohmdal.md. Colisión: murallas con vanos en los 4 arcos,
    // el pozo central y el edificio del taller (este).
    background: 'room-plaza',
    collision: [
      // muralla norte (vano del arco central x430–535)
      { x: 0, y: 0, w: 430, h: 58 }, { x: 535, y: 0, w: 425, h: 58 },
      // muralla sur (vano del arco central)
      { x: 0, y: 486, w: 430, h: 54 }, { x: 535, y: 486, w: 425, h: 54 },
      // muralla oeste (vano del portón del castillo y150–335)
      { x: 0, y: 58, w: 42, h: 92 }, { x: 0, y: 335, w: 42, h: 151 },
      // edificio del taller al este (vano de la puerta y225–330)
      { x: 812, y: 58, w: 148, h: 167 }, { x: 812, y: 330, w: 148, h: 156 },
      // Campana monumental central. El portal suroeste ahora es una plataforma
      // circular al ras del piso y no bloquea la navegación.
      { x: 424, y: 112, w: 112, h: 188 },
      { x: 390, y: 178, w: 27, h: 118 },
      { x: 543, y: 178, w: 27, h: 118 },
    ],
    doors: [
      {
        x: 844, y: 246, w: 60, h: 72,
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
        // Zona alta del borde izquierdo (hasta cerca del tope): el label apunta
        // arriba-izquierda; sin esto quedaba una franja muerta de pared encima de
        // la puerta donde el jugador se atascaba sin cruzar ni ver el cordón.
        x: 38, y: 190, w: 72, h: 120,
        to: 'castle_gate', spawn: { x: 860, y: 270 },
        label: 'Camino al Castillo',
        color: 0x65536f,
        locked: () => {
          if (f().solvedBellPaths) return null;
          if (!f().playedUnit2Intro) {
            return [
              L('', 'El camino al Castillo está lacrado. Todavía no sabes qué evidencia necesita el Consejo.'),
              L('', 'El sello de cobre tiembla con el eco de la campana. Al sur, el portal responde con un breve destello.'),
            ];
          }
          return [
            L('', 'Un cordón lacrado del Consejo cruza el camino al Castillo: «PASO RESTRINGIDO POR CONSERVACIÓN DE CHISPA. Sin excepciones.»'),
            L('', 'Sin evidencia, nadie va a mover ese cordón. La campana de los dos cables espera en la plaza.'),
          ];
        },
      },
      {
        x: 0, y: 388, w: 34, h: 68,
        to: 'forge_yard', spawn: { x: 825, y: 410 },
        label: 'Camino a la Forja',
        color: 0x7a5438,
        visible: () => f().unit2Completed,
      },
      {
        x: 452, y: 504, w: 56, h: 30,
        to: 'terraces_top', spawn: { x: 480, y: 105 },
        label: 'Camino a las Terrazas',
        color: 0x58755f,
        visible: () => f().unit3Completed,
      },
    ],
    things: [
      {
        id: 'portal-aula', x: 180, y: 382, w: 96, h: 54,
        label: 'Portal al Instituto', prompt: 'Salir de Ohmdal', color: 0x45c7bd, solid: false,
        onInteract: confirmExitOhmdal,
      },
      {
        id: 'pedestal', x: 480, y: 342, w: 56, h: 56, shape: 'circle',
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
          !(f().playedUnit2Intro && !f().solvedBellPaths) &&
          !f().castleRestored,
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
        id: 'edda-campana', x: 620, y: 340, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().puertaDone && f().playedUnit2Intro && !f().solvedBellPaths,
        onInteract: abrirCampanaUnidad2,
      },
      {
        id: 'lumen-plaza', x: 660, y: 300, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().puertaDone && !(f().castleRestored && !f().heardForgeWarmth),
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
        id: 'lampara1', x: 290, y: 356, w: 26, h: 26, shape: 'circle',
        label: '', prompt: 'Mirar la lámpara', solid: false, emoji: '💡',
        baked: true,
        color: () => (f().puertaDone ? 0xffd34d : 0x3a3744),
        onInteract: () =>
          say(
            L('', f().puertaDone
              ? 'La lámpara arde con luz tibia y constante. Cuesta creer que estuvo muerta.'
              : f().ohmAwake
                ? 'Ohm despertó, pero este farol sigue frío. Su pequeño brillo no alimenta la ciudad.'
                : 'Una lámpara de la plaza. Fría, muda, apagada hace años.'),
          ),
      },
      {
        id: 'lampara2', x: 672, y: 344, w: 26, h: 26, shape: 'circle',
        label: '', prompt: 'Mirar la lámpara', solid: false, emoji: '💡',
        baked: true,
        color: () => (f().puertaDone ? 0xffd34d : 0x3a3744),
        onInteract: () =>
          say(L('', f().puertaDone ? 'Luz firme. La plaza tiene sombras de nuevo — de las buenas.' : 'Otra lámpara muerta. O dormida. Empieza a parecer que hay una diferencia.')),
      },
      {
        id: 'campana', x: 480, y: 225, w: 170, h: 180,
        label: 'Campana', prompt: 'La campana de Ohmdal', solid: false, emoji: '🔔',
        baked: true,
        color: () => (f().puertaDone ? 0xb08d2a : 0x4f4a42),
        onInteract: () => {
          const fl = f();
          if (fl.playedUnit2Intro) {
            if (fl.solvedBellPaths) abrirBell(() => {}, true);
            else abrirCampanaUnidad2();
          } else if (fl.finished) {
            say([
              L('', 'La campana todavía vibra, contenta. Los dos cables siguen ahí, esperando su lección.'),
              L('', 'La nota corre por el cobre hacia el portal. Desde el otro lado llega una respuesta apagada: *clac*.'),
            ]);
          } else if (fl.puertaDone) {
            // el cierre de U1 exige haber subido a ver qué regulaba la Puerta
            if (!fl.salasVisitadas.includes('manantial_ohm')) {
              say([
                L('Maese Lumen', '¿Tocar la campana ya? La Puerta no se abrió para mirarla desde abajo. Sube por la calzada: el manantial está ahí arriba, corriendo por primera vez en cuarenta años.'),
                L('Edda', 'Sí, arriba. Yo quiero ver el famoso río antes de que nadie toque nada.'),
              ]);
            } else tocarCampana();
          } else say(L('', 'La campana de Ohmdal cuelga muda sobre la plaza apagada. La cuerda está al alcance, pero algo dice que todavía no.'));
        },
      },
      /* M8: Castillo encendido visible al norte */
      {
        id: 'castillo-encendido', x: 130, y: 100, w: 120, h: 80,
        label: 'El Castillo encendido', prompt: 'Mirar el Castillo',
        // Es un punto de mirada, no un bloque de utilería: la Plaza no tiene
        // espacio para sumar otra silueta gigante sobre el acceso oeste.
        baked: true, color: 0xd4a035, solid: false, emoji: '🏰',
        visible: () => f().castleRestored,
        onInteract: () =>
          say(L('', 'El Castillo de Ohmdal arde en luz cálida al norte. Los canales de cobre brillan desde aquí.')),
      },
      /* M8: ciudadanos nocturnos post-Castillo */
      {
        id: 'ciudadano-1', x: 220, y: 280, w: 30, h: 30, shape: 'circle',
        label: 'Ciudadano', prompt: 'Escuchar al ciudadano',
        color: 0x6a7a8a, solid: true, emoji: '💬',
        visible: () => f().castleRestored,
        onInteract: () =>
          say(L('', '«El Castillo tiene luz. ¿Y la chispa no se acabó?»')),
      },
      {
        id: 'ciudadano-2', x: 300, y: 360, w: 30, h: 30, shape: 'circle',
        label: 'Ciudadano', prompt: 'Escuchar al ciudadano',
        color: 0x6a7a8a, solid: true, emoji: '💬',
        visible: () => f().castleRestored,
        onInteract: () =>
          say(L('', '«Mi abuela decía que ahí dentro el río sabía contar. Yo creía que era un cuento.»')),
      },
      {
        id: 'ciudadano-nino', x: 380, y: 290, w: 26, h: 26, shape: 'circle',
        label: 'Niño', prompt: 'Escuchar al niño',
        color: 0x8a9a6a, solid: true, emoji: '💬',
        visible: () => f().castleRestored,
        onInteract: () =>
          say(L('Niño', 'El robot contó los ríos. Yo conté con él. Dio justo.')),
      },
      /* M8: Edda nocturna con su beat post-Castillo */
      {
        id: 'edda-noche', x: 580, y: 200, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().castleRestored,
        onInteract: () =>
          say([
            L('Edda', 'Primero una puerta. Ahora un castillo. ¿Qué sigue, el reino entero?'),
            L('Edda', '…Quiero aprender a mostrárselo a los demás. Como hiciste conmigo: sin sermones. Con las manos.'),
          ]),
      },
      /* M8: Lumen — gancho U3 (forja tibia) */
      {
        id: 'lumen-forja', x: 195, y: 185, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().castleRestored && !f().heardForgeWarmth,
        onInteract: () =>
          say(
            [
              L('', '(Lumen apoya la mano en el cobre que va a la forja y la retira rápido.)'),
              L('Maese Lumen', 'Esto antes no pasaba. O pasaba y nadie tocaba los canales.'),
              L('Maese Lumen', 'El río no se gasta, de acuerdo. ¿Y entonces qué es lo que estoy sintiendo?'),
            ],
            () => setFlag('heardForgeWarmth'),
          ),
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
      } else if (f().frenoDone && !f().puertaDone && !f().eddaGateCall) {
        say(
          [
            L('', 'Apenas sales del Taller, una voz baja desde el arco norte.'),
            L('Edda', '¡Eh, por aquí! La Puerta de Ohm está al norte. Lumen ya llegó con sus seis fusibles y cara de funeral.'),
            L('Edda', 'Te espero junto al mecanismo. Trae la piedra: hoy esa puerta deja de ser un cuento.'),
          ],
          () => setFlag('eddaGateCall'),
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
        id: 'lumen', x: 560, y: 250, w: 38, h: 38, shape: 'circle',
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
        id: 'edda-taller', x: 540, y: 350, w: 34, h: 34, shape: 'circle',
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
        id: 'banco', x: 285, y: 280, w: 125, h: 145,
        label: 'Banco de trabajo', prompt: 'Usar el banco de trabajo', color: 0x4a3c30, solid: true, emoji: '⚡',
        onInteract: () => {
          const fl = f();
          if (!fl.metLumen) say(L('', 'Mejor hablar primero con el dueño del taller. La túnica impone.'));
          else if (fl.frenoDone) abrirFreno(() => {}, true); // modo práctica: la Bitácora invita a volver
          else resolverFreno();
        },
      },
      {
        id: 'estantes', x: 210, y: 135, w: 130, h: 90,
        label: 'Estantes', prompt: 'Curiosear los estantes', color: 0x3c332a, solid: true, emoji: '🔬',
        onInteract: () =>
          say(L('', 'Frascos con etiquetas a mano: «Chispa embotellada (vacío)», «Silencio de tormenta», «NO ABRIR: ya está abierto».')),
      },
      {
        id: 'estantes-derecha', x: 785, y: 135, w: 120, h: 90,
        label: 'Estantes de fusibles', prompt: 'Curiosear los trofeos de Lumen', color: 0x3c332a, solid: false, emoji: '🔬',
        onInteract: () =>
          say([
            L('', 'Una fila de fusibles quemados cuelga de cintas como medallas. Debajo: «Mártires del exceso de entusiasmo».'),
            L('Edda', 'Lumen les pone nombre. Ese de ahí es Sir Chispazo Tercero. Los otros dos no sobrevivieron al bautismo.'),
          ]),
      },
      {
        id: 'generador-taller', x: 715, y: 270, w: 145, h: 130,
        label: 'Máquina del taller', prompt: 'Escuchar la máquina', color: 0x4a3c30, solid: false,
        onInteract: () =>
          say(L('', f().frenoDone
            ? 'La máquina gira pareja. Por primera vez, el taller huele más a aceite que a cejas chamuscadas.'
            : 'La máquina carraspea detrás de la reja. Cada intento termina en un chasquido demasiado orgulloso.')),
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
      {
        x: 370, y: 0, w: 220, h: 26,
        to: 'manantial_ohm', spawn: { x: 480, y: 440 },
        label: 'Puerta de Ohm · Manantial', color: 0x8a7c50,
        // La presentación vive en la primera interacción con el mecanismo. El
        // límite físico no debe volver a interrumpir al jugador por proximidad.
        locked: () => (f().puertaDone ? null : true),
      },
    ],
    things: [
      {
        // a caballo del muro norte, con el ancho exacto del paso: la Puerta ES la muralla abierta.
        // Altura = banda del muro + fachada (¾) + pie mínimo, para coincidir con la línea de pared.
        id: 'lapuerta', x: 480, y: 20, w: 220, h: 84,
        label: 'La Puerta de Ohm', prompt: 'Usar el mecanismo de la Puerta', solid: false, emoji: '⚡',
        color: () => (f().puertaDone ? 0x8a7c50 : 0x3a3340),
        onInteract: () => {
          if (f().puertaDone) abrirPuerta(() => {}, true); // modo práctica
          else if (!f().puertaMecanismoIntro) {
            say(
              [
                L('', 'Las dos hojas de la Puerta cierran la calzada. El ojo de aguja espera una medida.'),
                L('Maese Lumen', 'El mecanismo está junto al umbral. «Ni hambrienta ni ahogada».'),
              ],
              () => {
                setFlag('puertaMecanismoIntro');
                resolverPuerta();
              },
            );
          } else resolverPuerta();
        },
      },
      {
        id: 'edda-puerta', x: 420, y: 385, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().frenoDone && !f().puertaDone,
        walksTo: 'plaza',
        onInteract: () =>
          say([
            L('Edda', 'Mírala bien: el ojo de aguja. Dicen que mide el río que la cruza.'),
            L('Edda', 'Si la aguja se pasa de largo, agáchate. Consejo de amiga.'),
          ]),
      },
      {
        id: 'lumen-puerta', x: 560, y: 385, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().frenoDone && !f().puertaDone,
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

  manantial_ohm: {
    id: 'manantial_ohm',
    name: 'Ohmdal — Calzada del Manantial',
    floor: () => (f().puertaDone ? 0x26313a : 0x171a22),
    wall: () => (f().puertaDone ? 0x46505a : 0x292d36),
    doors: [
      {
        x: 370, y: 514, w: 220, h: 26,
        to: 'puerta', spawn: { x: 480, y: 90 },
        label: 'Puerta de Ohm · Plaza', color: 0x8a7c50,
      },
    ],
    things: [
      {
        id: 'cauce-maestro', x: 480, y: 275, w: 115, h: 330,
        label: 'Río de chispa', prompt: 'Observar el cauce',
        color: 0xc99f45, solid: false, emoji: '⚡',
        onInteract: () =>
          say([
            L('', 'El cauce luminoso baja desde el manantial, atraviesa la Puerta abierta y se divide bajo las calles de Ohmdal.'),
            L('Ohm', 'Caudal estable: dos. Destinos activos: plaza, campana, alumbrado.'),
            L('Edda', 'Entonces la Puerta no guardaba un tesoro. Cuidaba que el pueblo recibiera lo justo.'),
            L('Edda', 'Y uno de esos caminos termina en la Campana. Volvamos a la plaza: si el río ya llega hasta ella, quiero oír qué hace.'),
          ]),
      },
      {
        id: 'hito-proporciones', x: 245, y: 185, w: 190, h: 115,
        label: 'Hito de los tres caudales', prompt: 'Leer las marcas del hito',
        color: 0x6f665b, solid: true,
        onInteract: () =>
          say([
            L('', 'Tres pares están tallados en la piedra: 4 sobre 2; 8 sobre 4; 16 sobre 8. Los tres desembocan en la misma marca: 2.'),
            L('Maese Lumen', 'Distinto empuje, distinto freno… el mismo río. Los Maestros dejaron la explicación del otro lado de la prueba. Muy propio de ellos.'),
          ]),
      },
      {
        id: 'mirador-manantial', x: 735, y: 170, w: 220, h: 120,
        label: 'Mirador del Manantial', prompt: 'Mirar más allá de Ohmdal',
        color: 0x3d5863, solid: false,
        onInteract: () =>
          say([
            L('', 'La calzada termina en un balcón sobre una grieta azul. Desde allí, conductos antiguos parten hacia montañas, terrazas y una luz remota junto al lago.'),
            L('Edda', 'La Puerta era un comienzo. Hay caminos por todo el mundo.'),
          ]),
      },
      {
        id: 'ohm-manantial', x: 600, y: 390, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        // detrás de una Puerta sellada no puede verse a nadie del otro lado
        visible: () => f().puertaDone,
        onInteract: () => say(L('Ohm', 'Origen visible. Siguiente destino recomendado: Campana de la plaza.')),
      },
      {
        id: 'edda-manantial', x: 545, y: 410, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().puertaDone && !f().playedUnit2Intro,
        onInteract: () => say(L('Edda', 'No era una puerta a un tesoro. Era una puerta para cuidar cuánto recibía todo el pueblo.')),
      },
      {
        id: 'lumen-manantial', x: 655, y: 420, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().puertaDone && !f().playedUnit2Intro,
        onInteract: () => say(L('Maese Lumen', 'Distinto empuje, distinto freno, el mismo río. Cuarenta años custodiando una proporción.')),
      },
    ],
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
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'forge_yard', spawn: { x: 480, y: 220 },
        label: 'Camino a la Forja',
        color: 0x7a5438,
        visible: () => f().unit2Completed,
      },
    ],
    things: [
      {
        // a caballo del muro norte, con el ancho exacto del paso (mismo tratamiento que
        // lapuerta): la Puerta monumental ES la muralla abierta, no un mueble en el piso
        id: 'puerta-castillo', x: 480, y: 20, w: 150, h: 84,
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
    onEnter: () => setAmbience('castle'),
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
          return [L('Consejera', 'Los Ramales siguen sellados. Primero la Galería: si el instrumento dice la verdad aquí, la dirá allá.')];
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
    onEnter: () => {
      setAmbience('castle');
      reconocerCastillo();
    },
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
          return [L('Consejera', 'El Corazón, todavía no. El Consejo selló de afuera hacia adentro; se abre al revés. …Y los Ramales aún no me convencen.')];
        },
      },
    ],
    things: [
      {
        // Deja un corredor legible frente al vano norte: con y=145/h=190 el
        // jugador sólo tenía ~1 px útil entre el Tronco y el borde del paso.
        id: 'tronco-ramales', x: 480, y: 175, w: 70, h: 150,
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
    onEnter: () => {
      setAmbience('castle');
      presentarSalaRamales();
    },
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
        onInteract: () => say(L('Ohm', 'Tablero maestro. Tres salidas, un río. Función: contar. …Función recordada.')),
      },
      /* M8: gancho capacitor — cortar el Tronco para el acta */
      {
        id: 'tronco-acta', x: 480, y: 120, w: 200, h: 60,
        label: 'Cortar el Tronco para el acta', prompt: 'Cortar el Tronco para el acta',
        color: () => (f().sawStoredSpark ? 0x4a4040 : 0xa08050), solid: false,
        visible: () => f().solvedDistributor && !f().sawStoredSpark,
        onInteract: cortarTroncoParaActa,
      },
    ],
    onEnter: () => {
      setAmbience('castle');
      presentarCorazonCastillo();
    },
  },

  /* ============ LA FORJA ============ */

  forge_yard: {
    id: 'forge_yard',
    name: 'La Forja — Patio',
    floor: () => (f().forgeRestored ? 0x4b3020 : 0x30251f),
    wall: () => (f().forgeRestored ? 0x7a4a2c : 0x51392c),
    doors: [
      {
        x: 0, y: 35, w: 26, h: 110,
        to: 'plaza', spawn: { x: 860, y: 90 },
        label: 'Plaza de Ohmdal',
      },
      {
        x: 934, y: 190, w: 26, h: 110,
        to: 'forge_infirmary', spawn: { x: 95, y: 245 },
        label: 'Enfermería de fusibles',
        locked: () => {
          if (f().solvedWarmChannel) return null;
          return [L('Yesca', 'Primero el canal tibio. En mi casa, los misterios se resuelven en orden.')];
        },
      },
      {
        x: 700, y: 26, w: 120, h: 26,
        to: 'castle_gate', spawn: { x: 480, y: 450 },
        label: 'Explanada del Castillo',
        color: 0x65536f,
      },
    ],
    things: [
      {
        id: 'martillos-patio', x: 480, y: 105, w: 470, h: 54,
        label: 'Martillos al fondo', prompt: 'Mirar los martillos',
        color: 0x6f5642, solid: true,
        onInteract: () => say(L('', 'Martillos que caen solos al fondo.')),
      },
      {
        id: 'canal-tibio-patio', x: 240, y: 245, w: 260, h: 30,
        label: 'Canal tibio', prompt: 'Examinar el canal',
        color: 0xa2673f, solid: true,
        onInteract: () => say(L('', 'Un canal de cobre cruza el patio de piedra. Tibio al tacto, como con fiebre baja. Antes, dicen, estaba siempre frío.')),
      },
      {
        id: 'banco-canal-tibio', x: 480, y: 390, w: 200, h: 76,
        label: 'Banco del canal tibio', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoWarmth,
      },
      {
        id: 'forjadora-patio', x: 335, y: 320, w: 40, h: 40, shape: 'circle',
        label: 'Yesca', prompt: 'Hablar con Yesca',
        color: 0x9b5438, solid: true, emoji: '💬',
        onInteract: hablarForjadoraPatio,
      },
      {
        id: 'consejera-patio', x: 660, y: 325, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera',
        color: 0x725d79, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () =>
          say(L('Consejera', 'Eso vine a preguntar. Medimos el río: no se gasta. Lo demostraron ustedes. Entonces, ¿qué es lo que falta cada mañana?')),
      },
      /* F6: Edda mirando el valle — gancho a las Terrazas */
      {
        id: 'edda-patio-forja', x: 660, y: 420, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => f().learnedPower
          ? verElValle()
          : say(L('Edda', 'El río no se gasta, pero el canal se calienta. Esta unidad empieza con una pregunta incómoda.')),
      },
      {
        id: 'lumen-patio-forja', x: 560, y: 430, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Maese Lumen', 'Los canales siempre estuvieron ahí. Lo nuevo es que por fin nos animamos a tocarlos.')),
      },
      {
        id: 'ohm-patio-forja', x: 490, y: 420, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm', color: 0xc9a437, solid: true,
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Ohm', 'Modo termómetro disponible. Trabajo detectado. Peaje pendiente de medir.')),
      },
      /* F6: alternativa sin Edda — «Mirar el valle» tras unit3Completed */
      {
        id: 'mirar-el-valle', x: 660, y: 420, w: 34, h: 34,
        label: 'El valle', prompt: 'Mirar el valle',
        color: 0x4a6a7a, solid: false, emoji: '🏔️',
        visible: () => f().unit3Completed,
        onInteract: () =>
          say(L('', 'El valle se abre abajo: las Terrazas, el acueducto de los Maestros. Las Terrazas esperan.')),
      },
      {
        id: 'barril-forja', x: 190, y: 430, w: 48, h: 58,
        label: '', prompt: '', color: 0xffffff, solid: true, interactive: false,
        sprite: 'prop_forge_barrel', spriteFit: 'bounds', onInteract: () => {},
      },
      {
        id: 'cajon-forja', x: 275, y: 450, w: 64, h: 52,
        label: '', prompt: '', color: 0xffffff, solid: true, interactive: false,
        sprite: 'prop_forge_crate', spriteFit: 'bounds', onInteract: () => {},
      },
    ],
    onEnter: () => setAmbience('forge'),
  },

  forge_infirmary: {
    id: 'forge_infirmary',
    name: 'La Forja — Enfermería de fusibles',
    floor: () => (f().forgeRestored ? 0x443027 : 0x2a2422),
    wall: () => (f().forgeRestored ? 0x6e4936 : 0x4b3932),
    doors: [
      {
        x: 0, y: 190, w: 26, h: 110,
        to: 'forge_yard', spawn: { x: 860, y: 245 },
        label: 'Patio de la Forja',
      },
      {
        x: 934, y: 190, w: 26, h: 110,
        to: 'forge_longchannel', spawn: { x: 95, y: 245 },
        label: 'Canal Largo',
        locked: () => {
          if (f().solvedFuseInfirmary) return null;
          return [L('Maese Lumen', 'El Canal Largo puede esperar. Los fusibles, no: aquí se muere gente de cobre todos los días.')];
        },
      },
    ],
    things: [
      {
        id: 'pared-fusibles', x: 480, y: 110, w: 600, h: 72,
        label: 'Pared de fusibles', prompt: 'Examinar la pared',
        color: 0x665244, solid: true,
        onInteract: () =>
          say(L('', 'Una pared entera de fusibles muertos, etiquetados con fecha y una velita.')),
      },
      {
        id: 'banco-enfermeria', x: 480, y: 370, w: 200, h: 76,
        label: 'Banco de la enfermería', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoInfirmary,
      },
      {
        id: 'lumen-enfermeria', x: 700, y: 330, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        onInteract: () => say(L('Maese Lumen', 'Elige calibres, estudiante. Mis mártires observan. Sin presión.')),
      },
      {
        id: 'forjadora-enfermeria', x: 625, y: 355, w: 40, h: 40, shape: 'circle',
        label: 'Yesca', prompt: 'Hablar con Yesca', color: 0x9b5438, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Yesca', 'Que se corte el fusible, no el canal. Si podemos elegir cuál pierde, elegimos bien.')),
      },
      {
        id: 'edda-enfermeria', x: 290, y: 360, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Edda', 'Un margen para trabajar y un límite para cortar. Es menos mártir y más guardia.')),
      },
      {
        id: 'ohm-enfermeria', x: 220, y: 410, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm', color: 0xc9a437, solid: true,
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Ohm', 'Fusible: límite deliberado. Canal: límite costoso. Orden de sacrificio recomendado.')),
      },
    ],
    onEnter: () => {
      setAmbience('forge');
      presentarEnfermeria();
    },
  },

  forge_longchannel: {
    id: 'forge_longchannel',
    name: 'La Forja — El Canal Largo',
    floor: () => (f().forgeRestored ? 0x493020 : 0x2d251f),
    wall: () => (f().forgeRestored ? 0x74472c : 0x49372b),
    doors: [
      {
        x: 0, y: 190, w: 26, h: 110,
        to: 'forge_infirmary', spawn: { x: 860, y: 245 },
        label: 'Enfermería de fusibles',
      },
      {
        x: 934, y: 190, w: 26, h: 110,
        to: 'forge_hall', spawn: { x: 95, y: 245 },
        label: 'Nave mayor',
        locked: () => {
          if (f().solvedLongChannel) return null;
          return [L('Yesca', 'La nave mayor, todavía no. Quien no puede alimentar un horno lejano no puede alimentar tres máquinas juntas.')];
        },
      },
    ],
    things: [
      {
        id: 'canal-doscientos-pasos', x: 455, y: 220, w: 720, h: 34,
        label: 'Canal de doscientos pasos', prompt: 'Examinar el canal',
        color: 0x8d5b36, solid: true,
        onInteract: () =>
          say(L('', 'Un canal angosto de doscientos pasos cruza el patio viejo hasta el horno lejano.')),
      },
      {
        id: 'horno-lejano', x: 825, y: 120, w: 105, h: 90,
        label: 'Horno lejano', prompt: 'Mirar el horno',
        color: 0x5c3a2c, solid: true,
        onInteract: () => say(L('', 'El horno lejano de Yesca lleva años frío.')),
      },
      {
        id: 'banco-canal-largo', x: 450, y: 385, w: 200, h: 76,
        label: 'Banco del Canal Largo', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoLongChannel,
      },
      {
        id: 'forjadora-canal-largo', x: 720, y: 370, w: 40, h: 40, shape: 'circle',
        label: 'Yesca', prompt: 'Hablar con Yesca',
        color: 0x9b5438, solid: true, emoji: '💬',
        onInteract: hablarForjadoraCanalLargo,
      },
      {
        id: 'edda-canal-largo', x: 635, y: 380, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Edda', 'El horno está lejos. No alcanza con que llegue río: tiene que llegar trabajo.')),
      },
      {
        id: 'ohm-canal-largo', x: 555, y: 390, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm', color: 0xc9a437, solid: true,
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Ohm', 'Canal fijo. Entrega variable. Más de una combinación disponible.')),
      },
    ],
    onEnter: () => {
      setAmbience('forge');
      presentarCanalLargo();
    },
  },

  forge_hall: {
    id: 'forge_hall',
    name: 'La Forja — Nave mayor',
    floor: () => (f().forgeRestored ? 0x51311f : 0x302720),
    wall: () => (f().forgeRestored ? 0x82482b : 0x543b2d),
    doors: [
      {
        x: 0, y: 190, w: 26, h: 110,
        to: 'forge_longchannel', spawn: { x: 860, y: 245 },
        label: 'Canal Largo',
      },
    ],
    things: [
      {
        id: 'martillo-forja', x: 210, y: 150, w: 180, h: 90,
        label: 'Martillo · ENTREGA 32', prompt: 'Examinar el Martillo',
        color: 0x70513b, solid: true,
        onInteract: () => say(L('', 'El Martillo mayor, quieto. Placa de bronce: ENTREGA 32. Hay polvo en toda la nave — en la placa, no: alguien la pule todas las mañanas.')),
      },
      {
        id: 'fuelle-forja', x: 480, y: 150, w: 180, h: 90,
        label: 'Fuelle · ENTREGA 16', prompt: 'Examinar el Fuelle',
        color: 0x665046, solid: true,
        onInteract: () => say(L('', 'El Fuelle, plegado como un animal dormido. Placa: ENTREGA 16.')),
      },
      {
        id: 'lumbre-forja', x: 750, y: 150, w: 180, h: 90,
        label: 'Lumbre · ENTREGA 8', prompt: 'Examinar la Lumbre',
        color: 0x704536, solid: true,
        onInteract: () => say(L('', 'La Lumbre, fría. Placa: ENTREGA 8. En el hollín hay marcas de manos chicas: aquí se calentaban los aprendices.')),
      },
      {
        id: 'tablero-bus', x: 480, y: 285, w: 260, h: 76,
        label: 'Tablero de bus', prompt: 'Examinar el tablero',
        color: 0x6b5944, solid: true,
        onInteract: () => say(L('', 'El tablero maestro de la Forja: dos engastes de cristal y décadas de hollín. Espera su Empuje.')),
      },
      {
        id: 'banco-forja-completa', x: 480, y: 405, w: 210, h: 76,
        label: 'Banco de la Forja', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoForge,
      },
      {
        id: 'forjadora-nave', x: 740, y: 390, w: 40, h: 40, shape: 'circle',
        label: 'Yesca', prompt: 'Hablar con Yesca',
        color: 0x9b5438, solid: true, emoji: '💬',
        onInteract: hablarForjadoraNave,
      },
      {
        id: 'consejera-nave', x: 790, y: 390, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera', color: 0x725d79, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Consejera', 'Entrega 32, 16 y 8. Esta vez el inventario describe trabajo, no miedo.')),
      },
      {
        id: 'edda-nave', x: 660, y: 425, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda', color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Edda', 'Tres máquinas, una red. Ya no estamos arreglando piezas: estamos leyendo un sistema.')),
      },
      {
        id: 'lumen-nave', x: 250, y: 420, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen', color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Maese Lumen', 'Toda la nave esperando una cuenta. Menos incienso del que calculaba.')),
      },
      {
        id: 'ohm-nave', x: 320, y: 430, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm', color: 0xc9a437, solid: true,
        visible: () => f().unit2Completed && !f().unit3Completed,
        onInteract: () => say(L('Ohm', 'Objetivos de entrega: 32, 16, 8. Red disponible.')),
      },
      {
        id: 'lingotes-forja', x: 170, y: 250, w: 86, h: 48,
        label: '', prompt: '', color: 0xffffff, solid: true, interactive: false,
        sprite: 'prop_forge_ingots', spriteFit: 'bounds', onInteract: () => {},
      },
    ],
    onEnter: () => {
      setAmbience('forge');
      presentarForjaCompleta();
    },
  },

  /* ============ LAS TERRAZAS ============ */

  terraces_top: {
    id: 'terraces_top',
    name: 'Las Terrazas — El canal alto',
    floor: () => (f().valleyRestored ? 0x3f6247 : 0x334638),
    wall: () => (f().valleyRestored ? 0x71845c : 0x5d684d),
    doors: [
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'plaza', spawn: { x: 480, y: 445 },
        label: 'Plaza de Ohmdal',
      },
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'terraces_mid', spawn: { x: 480, y: 95 },
        label: 'Terrazas medias',
        locked: () => {
          if (f().solvedVoltageSteps) return null;
          return [L('Guardiana', 'Antes de bajar, lean el canal alto. Si la primera cuenta no cierra, abajo solo van a multiplicar el error.')];
        },
      },
    ],
    things: [
      {
        id: 'ladera-escalonada', x: 250, y: 235, w: 330, h: 210,
        label: 'Ladera escalonada', prompt: 'Examinar la ladera',
        color: 0x6f704c, solid: true,
        onInteract: () =>
          say(L('', 'La ladera baja en escalones de cobre y tierra. Cada nivel recibe un canal más estrecho que el anterior.')),
      },
      {
        id: 'compuerta-alta', x: 650, y: 155, w: 150, h: 74,
        label: 'Compuerta del canal alto', prompt: 'Examinar la compuerta',
        color: 0x98714c, solid: true,
        onInteract: () => say(L('', 'Una compuerta de cobre inmóvil contiene el agua del manantial. Las piedras de control siguen en su sitio.')),
      },
      {
        id: 'banco-escalones', x: 520, y: 385, w: 210, h: 76,
        label: 'Banco de los escalones', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoEscalones,
      },
      {
        id: 'guardiana-alto', x: 735, y: 210, w: 40, h: 40, shape: 'circle',
        label: 'Guardiana', prompt: 'Hablar con la Guardiana',
        color: 0x657957, solid: true, emoji: '💬',
        visible: () => f().unit3Completed,
        onInteract: hablarGuardianaCanalAlto,
      },
      {
        id: 'edda-terrazas-alto', x: 760, y: 350, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().unit3Completed,
        onInteract: () => {
          if (f().learnedKVL && !f().unit4Completed) {
            checkUnit4Complete();
            return;
          }
          say(L('Edda', 'Si todo está atado, habrá que aprender a leer los nudos.'));
        },
      },
      {
        id: 'lumen-terrazas-alto', x: 830, y: 405, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().unit3Completed,
        onInteract: () => say(L('Maese Lumen', 'Treinta años sin tocar una piedra. Admito que conozco liturgias más breves.')),
      },
      {
        id: 'ohm-terrazas-alto', x: 690, y: 405, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().unit3Completed,
        onInteract: () => say(L('Ohm', 'Red atada. Método disponible: medir entre puntos. Brazos.')),
      },
    ],
    onEnter: () => setAmbience('terraces'),
  },

  terraces_mid: {
    id: 'terraces_mid',
    name: 'Las Terrazas — El reparto',
    floor: () => (f().valleyRestored ? 0x466947 : 0x394737),
    wall: () => (f().valleyRestored ? 0x7c8a60 : 0x687052),
    doors: [
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'terraces_top', spawn: { x: 480, y: 440 },
        label: 'Canal alto',
      },
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'terraces_mural', spawn: { x: 480, y: 95 },
        label: 'Mural de los Maestros',
        locked: () => {
          if (f().solvedFairSplit) return null;
          return [L('Guardiana', 'El mural puede esperar. Primero repartan el agua entre estas dos terrazas: una se ahoga y la otra se parte.')];
        },
      },
    ],
    things: [
      {
        id: 'terraza-alta-encharcada', x: 300, y: 165, w: 390, h: 115,
        label: 'Terraza alta encharcada', prompt: 'Examinar la terraza alta',
        color: 0x426d67, solid: true,
        onInteract: () => say(L('', 'La terraza alta está encharcada. El maíz asoma entre charcos inmóviles.')),
      },
      {
        id: 'terraza-baja-reseca', x: 660, y: 315, w: 390, h: 115,
        label: 'Terraza baja reseca', prompt: 'Examinar la terraza baja',
        color: 0x765a3d, solid: true,
        onInteract: () => say(L('', 'La terraza baja está reseca y agrietada. El canal llega hasta ella, pero apenas trae agua.')),
      },
      {
        id: 'banco-reparto', x: 260, y: 385, w: 210, h: 76,
        label: 'Banco del reparto', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoReparto,
      },
      {
        id: 'guardiana-medio', x: 735, y: 185, w: 40, h: 40, shape: 'circle',
        label: 'Guardiana', prompt: 'Hablar con la Guardiana',
        color: 0x657957, solid: true, emoji: '💬',
        visible: () => f().solvedVoltageSteps,
        onInteract: () => say(L('Guardiana', 'Arriba sobra. Abajo falta. La misma agua, mal repartida.')),
      },
      {
        id: 'edda-terrazas-medio', x: 805, y: 220, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().solvedVoltageSteps,
        onInteract: () => say(L('Edda', 'Podemos mostrarlo en chico antes de tocar el valle. Para eso está el banco.')),
      },
      {
        id: 'lumen-terrazas-medio', x: 125, y: 325, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().solvedVoltageSteps,
        onInteract: () => say(L('Maese Lumen', 'La abundancia arriba y la penitencia abajo. Muy tradicional. Muy mal regado.')),
      },
      {
        id: 'ohm-terrazas-medio', x: 160, y: 405, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedVoltageSteps,
        onInteract: () => say(L('Ohm', 'Objetivo visible: repartir. Medición entre niveles recomendada.')),
      },
    ],
    onEnter: () => setAmbience('terraces'),
  },

  terraces_mural: {
    id: 'terraces_mural',
    name: 'Las Terrazas — El mural de los Maestros',
    floor: () => (f().valleyRestored ? 0x405d43 : 0x353f35),
    wall: () => (f().valleyRestored ? 0x78876a : 0x66705b),
    doors: [
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'terraces_mid', spawn: { x: 480, y: 440 },
        label: 'Terrazas medias',
      },
      {
        x: 420, y: 514, w: 120, h: 26,
        to: 'terraces_aqueduct', spawn: { x: 480, y: 95 },
        label: 'Acueducto del valle',
        locked: () => {
          if (f().solvedSingleStone) return null;
          return [L('Guardiana', 'No bajen al acueducto entero hasta entender este muro. Una maraña puede ser una piedra; sin eso, el valle no se deja leer.')];
        },
      },
    ],
    things: [
      {
        id: 'mural-marana', x: 330, y: 160, w: 360, h: 175,
        label: 'Maraña de canales', prompt: 'Examinar la maraña grabada',
        color: 0x936f4d, solid: true,
        onInteract: () => say(L('', 'En el cobre hay una maraña de canales grabados: filas, cruces y ramales que se doblan unos dentro de otros.')),
      },
      {
        id: 'signo-mural', x: 550, y: 160, w: 64, h: 64,
        label: '=', prompt: 'Examinar el signo',
        color: 0xb49a68, solid: false,
        onInteract: () => say(L('', 'Entre la maraña y la piedra, los Maestros grabaron un signo igual.')),
      },
      {
        id: 'mural-piedra', x: 720, y: 160, w: 130, h: 130,
        label: 'Una sola piedra', prompt: 'Examinar la piedra grabada',
        color: 0xa5483f, solid: true,
        onInteract: () => say(L('', 'Al otro lado del signo hay una única piedra roja, lisa y deliberadamente sencilla.')),
      },
      {
        id: 'banco-piedra-unica', x: 480, y: 370, w: 220, h: 76,
        label: 'Banco de la Piedra Única', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoPiedraUnica,
      },
      {
        id: 'guardiana-mural', x: 780, y: 315, w: 40, h: 40, shape: 'circle',
        label: 'Guardiana', prompt: 'Hablar con la Guardiana',
        color: 0x657957, solid: true, emoji: '💬',
        visible: () => f().solvedFairSplit,
        onInteract: () => say(L('Guardiana', 'Una maraña… igual a una piedra. Llevo años mirando ese signo sin entender qué promete.')),
      },
      {
        id: 'edda-terrazas-mural', x: 830, y: 390, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().solvedFairSplit,
        onInteract: () => say(L('Edda', 'Si el signo dice la verdad, Ohm debería poder comprobarlo.')),
      },
      {
        id: 'lumen-terrazas-mural', x: 155, y: 345, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().solvedFairSplit,
        onInteract: () => say(L('Maese Lumen', 'Los Maestros también tallaban acertijos en paredes. Al menos estos no exigen incienso.')),
      },
      {
        id: 'ohm-terrazas-mural', x: 230, y: 410, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedFairSplit,
        onInteract: () => say(L('Ohm', 'Comparación disponible. Tráiganme una red.')),
      },
    ],
    onEnter: () => setAmbience('terraces'),
  },

  terraces_aqueduct: {
    id: 'terraces_aqueduct',
    name: 'Las Terrazas — El acueducto del valle',
    floor: () => (f().valleyRestored ? 0x3d6851 : 0x34483e),
    wall: () => (f().valleyRestored ? 0x718d70 : 0x5b705e),
    doors: [
      {
        x: 420, y: 0, w: 120, h: 26,
        to: 'terraces_mural', spawn: { x: 480, y: 440 },
        label: 'Mural de los Maestros',
      },
      {
        x: 934, y: 330, w: 26, h: 110,
        to: 'lighthouse_hall', spawn: { x: 95, y: 385 },
        label: 'Camino al Faro',
        color: 0x496978,
        visible: () => f().unit4Completed,
      },
    ],
    things: [
      {
        id: 'acueducto-nivel-alto', x: 250, y: 125, w: 310, h: 64,
        label: 'Nivel alto', prompt: 'Examinar el nivel alto',
        color: 0x99734e, solid: true,
        onInteract: () => say(L('', 'El acueducto nace alto, junto al manantial, y entrega su primer brazo al valle.')),
      },
      {
        id: 'acueducto-nivel-medio', x: 480, y: 245, w: 360, h: 64,
        label: 'Nivel medio', prompt: 'Examinar el nivel medio',
        color: 0x876a49, solid: true,
        onInteract: () => say(L('', 'El segundo nivel recibe lo que dejó pasar el primero. Las agujas de riego están clavadas en posiciones desiguales.')),
      },
      {
        id: 'acueducto-nivel-bajo', x: 705, y: 365, w: 330, h: 64,
        label: 'Nivel bajo y lago', prompt: 'Mirar hacia el lago',
        color: 0x3e6a70, solid: true,
        onInteract: () => say(L('', 'El último nivel termina junto al lago. Apenas un hilo alcanza la terraza del fondo.')),
      },
      {
        id: 'banco-escalera', x: 230, y: 390, w: 210, h: 76,
        label: 'Banco de la Escalera', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoEscalera,
      },
      {
        id: 'guardiana-acueducto', x: 775, y: 160, w: 40, h: 40, shape: 'circle',
        label: 'Guardiana', prompt: 'Hablar con la Guardiana',
        color: 0x657957, solid: true, emoji: '💬',
        visible: () => f().solvedSingleStone,
        onInteract: () => say(L('Guardiana', 'El valle completo. Tres niveles. Acá una piedra mueve todas las agujas.')),
      },
      {
        id: 'edda-terrazas-acueducto', x: 830, y: 220, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().solvedSingleStone,
        onInteract: () => {
          if (f().learnedKVL && !f().unit4Completed) {
            checkUnit4Complete();
            return;
          }
          say(L('Edda', 'No toquemos nada todavía. Primero hay que poder decir qué va a pasar.'));
        },
      },
      {
        id: 'lumen-terrazas-acueducto', x: 120, y: 285, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().solvedSingleStone,
        onInteract: () => say(L('Maese Lumen', 'Tres niveles y un lago. Mi liturgia para esto ocupa siete páginas. La cuenta, sospecho, menos.')),
      },
      {
        id: 'ohm-terrazas-acueducto', x: 155, y: 350, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedSingleStone,
        onInteract: () => say(L('Ohm', 'Red completa detectada. Recomendación: leer desde el fondo.')),
      },
    ],
    onEnter: () => setAmbience('terraces'),
  },

  /* ============ EL FARO ============ */

  lighthouse_hall: {
    id: 'lighthouse_hall',
    name: 'El Faro — Sala de la máquina',
    floor: () => 0x1b2730,
    wall: () => 0x304451,
    doors: [
      {
        x: 0, y: 330, w: 26, h: 110,
        to: 'terraces_aqueduct', spawn: { x: 860, y: 385 },
        label: 'Acueducto del valle',
      },
      {
        x: 934, y: 190, w: 26, h: 110,
        to: 'lighthouse_bench', spawn: { x: 95, y: 245 },
        label: 'Taller del Farero',
        locked: () =>
          f().solvedStoredSpark
            ? null
            : [L('Farero', 'Todavía no. Primero vean cómo una chispa se queda cuando el camino ya no está. Después hablamos de tiempo.')],
      },
    ],
    things: [
      {
        id: 'maquina-faro-muerta', x: 300, y: 205, w: 310, h: 180,
        label: 'Máquina del Faro', prompt: 'Examinar la máquina',
        color: 0x4b5960, solid: true,
        onInteract: () => say(L('', 'Bronce sin polvo, ruedas inmóviles y canales oscuros. La máquina está muerta, pero alguien la ha cuidado todos los días.')),
      },
      {
        id: 'lente-lustrada', x: 690, y: 145, w: 125, h: 125, shape: 'circle',
        label: 'Lente lustrada', prompt: 'Examinar la lente',
        color: 0x8aaeb8, solid: true,
        onInteract: () => say(L('', 'La lente está impecable. Devuelve la luz de la sala, aunque el Faro no produce ninguna propia.')),
      },
      {
        id: 'banco-chispa', x: 480, y: 395, w: 220, h: 76,
        label: 'Banco del Estanque', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoStoredSpark,
      },
      {
        id: 'farero-hall', x: 760, y: 320, w: 40, h: 40, shape: 'circle',
        label: 'Farero', prompt: 'Hablar con el Farero',
        color: 0x70818a, solid: true, emoji: '💬',
        visible: () => f().unit4Completed,
        onInteract: presentarFarero,
      },
      {
        id: 'consejera-faro', x: 815, y: 400, w: 38, h: 38, shape: 'circle',
        label: 'Consejera', prompt: 'Hablar con la Consejera',
        color: 0x725d79, solid: true, emoji: '💬',
        visible: () => f().unit4Completed,
        onInteract: () => say(L('Consejera', 'Vine a revisar un registro pendiente. Esta vez pienso anotar lo que ocurra, aunque llegue cuarenta años tarde.')),
      },
      {
        id: 'edda-faro-hall', x: 690, y: 385, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().unit4Completed,
        onInteract: () => say(L('Edda', 'La chispa sin camino. Sabía que esa pregunta no iba a dejarnos tranquilos.')),
      },
      {
        id: 'lumen-faro-hall', x: 150, y: 385, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().unit4Completed,
        onInteract: () => say(L('Maese Lumen', 'Una máquina lustrada durante décadas, sin encender una sola vez. Conozco esa clase de paciencia.')),
      },
      {
        id: 'ohm-faro-hall', x: 205, y: 435, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().unit4Completed,
        onInteract: () => say(L('Ohm', 'Máquina: inmóvil. Cuidado acumulado: cuarenta años. Pregunta acumulada: una.')),
      },
    ],
    onEnter: () => setAmbience('lighthouse'),
  },

  lighthouse_bench: {
    id: 'lighthouse_bench',
    name: 'El Faro — Taller del Farero',
    floor: () => 0x202b31,
    wall: () => 0x394a50,
    doors: [
      {
        x: 0, y: 190, w: 26, h: 110,
        to: 'lighthouse_hall', spawn: { x: 860, y: 245 },
        label: 'Sala de la máquina',
      },
      {
        x: 934, y: 190, w: 26, h: 110,
        to: 'clock_tower', spawn: { x: 95, y: 245 },
        label: 'Torre del Reloj',
        locked: () =>
          f().solvedSleepingRiver
            ? null
            : [L('Farero', 'El Reloj puede esperar. Primero aprendan a oír cómo el río se duerme mientras el Estanque se llena.')],
      },
    ],
    things: [
      {
        id: 'estantes-farero', x: 230, y: 155, w: 270, h: 90,
        label: 'Herramientas del Farero', prompt: 'Examinar las herramientas',
        color: 0x526168, solid: true,
        onInteract: () => say(L('', 'Calibres, llaves y piedras de freno ordenadas por tamaño. Ninguna tiene polvo.')),
      },
      {
        id: 'banco-rio-dormido', x: 480, y: 320, w: 250, h: 90,
        label: 'Banco del Farero', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoSleepingRiver,
      },
      {
        id: 'farero-taller', x: 735, y: 205, w: 40, h: 40, shape: 'circle',
        label: 'Farero', prompt: 'Hablar con el Farero',
        color: 0x70818a, solid: true, emoji: '💬',
        visible: () => f().solvedStoredSpark,
        onInteract: () => say(L('Farero', 'Mírenlo llenarse. No es magia. Es paciencia con forma de agua.')),
      },
      {
        id: 'edda-faro-taller', x: 785, y: 360, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().solvedStoredSpark,
        onInteract: () => say(L('Edda', 'Quiero ver la aguja moverse sola. Esta vez no pienso parpadear.')),
      },
      {
        id: 'lumen-faro-taller', x: 145, y: 350, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().solvedStoredSpark,
        onInteract: () => say(L('Maese Lumen', 'Piedras, canales y paciencia. Al fin una liturgia con piezas que puedo señalar.')),
      },
      {
        id: 'ohm-faro-taller', x: 205, y: 420, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedStoredSpark,
        onInteract: () => say(L('Ohm', 'Variable nueva detectada: espera. Medición recomendada.')),
      },
    ],
    onEnter: () => setAmbience('lighthouse'),
  },

  clock_tower: {
    id: 'clock_tower',
    name: 'Ohmdal — Torre del Reloj',
    floor: () => 0x24272d,
    wall: () => 0x47434a,
    doors: [
      {
        x: 0, y: 190, w: 26, h: 110,
        to: 'lighthouse_bench', spawn: { x: 860, y: 245 },
        label: 'Taller del Farero',
      },
      {
        x: 934, y: 190, w: 26, h: 110,
        to: 'lighthouse_lantern', spawn: { x: 95, y: 245 },
        label: 'Linterna del Faro',
        locked: () =>
          f().solvedClock
            ? null
            : [L('Farero', 'Arriba espera el latido grande. Antes devuélvanle a este pueblo un tic justo: ni apurado ni dormido.')],
      },
    ],
    things: [
      {
        id: 'reloj-parado', x: 480, y: 155, w: 330, h: 190,
        label: 'Reloj de Ohmdal', prompt: 'Examinar el Reloj',
        color: 0x6a604f, solid: true,
        onInteract: () => say(L('', 'El péndulo cuelga inmóvil. Los engranajes están completos; les falta algo que decida cuándo avanzar.')),
      },
      {
        id: 'banco-reloj', x: 480, y: 385, w: 230, h: 80,
        label: 'Banco del Reloj', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoClock,
      },
      {
        id: 'farero-reloj', x: 750, y: 260, w: 40, h: 40, shape: 'circle',
        label: 'Farero', prompt: 'Hablar con el Farero',
        color: 0x70818a, solid: true, emoji: '💬',
        visible: () => f().solvedSleepingRiver,
        onInteract: () => say(L('Farero', 'El Reloj y el Faro son hermanos. Uno cuenta; el otro avisa. Los dos necesitan un latido que no mienta.')),
      },
      {
        id: 'edda-reloj', x: 805, y: 390, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().solvedSleepingRiver,
        onInteract: () => say(L('Edda', 'Un estanque que cuenta el tiempo. Claro. A esta altura, claro que sí.')),
      },
      {
        id: 'lumen-reloj', x: 145, y: 335, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().solvedSleepingRiver,
        onInteract: () => say(L('Maese Lumen', 'Dábamos cuerda a este reloj todos los meses. Nunca se nos ocurrió preguntarle de dónde salía el tic.')),
      },
      {
        id: 'ohm-reloj', x: 205, y: 410, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedSleepingRiver,
        onInteract: () => say(L('Ohm', 'Reloj detenido. Tiempo disponible.')),
      },
    ],
    onEnter: () => setAmbience('lighthouse'),
  },

  lighthouse_lantern: {
    id: 'lighthouse_lantern',
    name: 'El Faro — La linterna',
    floor: () => 0x18242d,
    wall: () => 0x2b3e4a,
    doors: [
      {
        x: 0, y: 190, w: 26, h: 110,
        to: 'clock_tower', spawn: { x: 860, y: 245 },
        label: 'Torre del Reloj',
      },
      {
        x: 150, y: 514, w: 130, h: 26,
        to: 'plaza', spawn: { x: 330, y: 445 },
        label: 'Ferry de regreso a la Plaza',
        visible: () => f().lighthouseRestored,
      },
    ],
    things: [
      {
        id: 'lente-enorme', x: 480, y: 180, w: 300, h: 220, shape: 'circle',
        label: 'Lente del Faro', prompt: 'Examinar la lente',
        color: 0x7698a8, solid: true,
        onInteract: () => say(L('', 'La lente enorme domina la cima. Más allá del cristal, el lago negro parece no tener orilla.')),
      },
      {
        id: 'lago-negro', x: 165, y: 150, w: 180, h: 95,
        label: 'Ohmdal de noche', prompt: 'Mirar Ohmdal de noche',
        color: 0x142b3a, solid: false,
        onInteract: () => {
          if (f().learnedCapacitor && !f().arcOneCompleted) {
            cerrarArcoUno();
            return;
          }
          if (f().arcOneCompleted) {
            say(L('', 'Ohmdal sigue encendido. El Reloj marca y el Faro late sobre el lago.'));
            return;
          }
          say(L('', 'El agua absorbe la noche. Un trueno lejano tarda en llegar hasta la torre.'));
        },
      },
      {
        id: 'banco-latido', x: 480, y: 405, w: 250, h: 80,
        label: 'Banco del latido', prompt: 'Usar el banco',
        color: 0x4a3c30, solid: true,
        onInteract: abrirBancoLighthouse,
      },
      {
        id: 'farero-linterna', x: 745, y: 280, w: 40, h: 40, shape: 'circle',
        label: 'Farero', prompt: 'Hablar con el Farero',
        color: 0x70818a, solid: true, emoji: '💬',
        visible: () => f().solvedClock,
        onInteract: hablarFareroLinterna,
      },
      {
        id: 'edda-linterna', x: 805, y: 385, w: 34, h: 34, shape: 'circle',
        label: 'Edda', prompt: 'Hablar con Edda',
        color: 0xa85f78, solid: true, emoji: '💬',
        visible: () => f().solvedClock,
        onInteract: () => say(L('Edda', 'Desde acá se ve todo lo que encendimos. Falta que esto responda.')),
      },
      {
        id: 'lumen-linterna', x: 145, y: 335, w: 38, h: 38, shape: 'circle',
        label: 'Maese Lumen', prompt: 'Hablar con Maese Lumen',
        color: 0x7a6a3a, solid: true, emoji: '💬',
        visible: () => f().solvedClock,
        onInteract: () => say(L('Maese Lumen', 'Toda mi vida vi esta torre apagada. Preferiría estar mirando cuando deje de estarlo.')),
      },
      {
        id: 'ohm-linterna', x: 205, y: 410, w: 34, h: 34, shape: 'circle',
        label: 'Ohm', prompt: 'Consultar a Ohm',
        color: 0xc9a437, solid: true,
        visible: () => f().solvedClock,
        onInteract: () => say(L('Ohm', 'Lente preparada. Lago preparado. Ritmo: pendiente.')),
      },
    ],
    onEnter: () => setAmbience('lighthouse'),
  },
};
