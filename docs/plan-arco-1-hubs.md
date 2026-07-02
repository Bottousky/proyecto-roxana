# Proyecto Roxana — Plan maestro: Arco I completo como RPG narrativo de investigación por hubs

**Versión:** 0.1 (2026-07-01)
**Decisión del Director:** la rama `feature/top-down` se considera terminada cuando el Arco I
funcione completo bajo el approach **«RPG narrativo de investigación / aventura por hubs»**,
con la **Bitácora como sistema central** (no accesorio), al estilo del códex de CrossCode.
**Rol de este doc:** fuente de verdad del plan. Cada hito se implementa con el pipeline de
`CLAUDE.md` (Orquestador especifica y audita; ejecutores implementan; el Director valida y
aprueba commits).

> **Actualización de visión (2026-07-01):** este plan sigue siendo la fuente táctica para
> Ohmdal y el Arco I. La arquitectura multilenguaje y la futura escuela 3D/2.5D se definen en
> `docs/vision-mundos-multilenguaje.md`. Nada de Ohmdal se descarta.

---

## 1. Research: cómo se hacen estos juegos (y qué tomamos de cada uno)

### 1.1 CrossCode (Radical Fish) — el referente estructural

Fuente: [Architecture of CrossCode #1](https://www.radicalfishgames.com/?p=277),
[Encyclopedia — CrossCode Wiki](https://crosscode.fandom.com/wiki/Encyclopedia).

- **Todo el contenido es data, no código.** Mapas, entidades, comportamientos y diálogos viven
  en JSON cargado on-demand; una única entidad configurable reemplaza N clases. Su `main.js`
  tiene 290 líneas. **Estado nuestro: ya cumplimos** — `rooms.ts` es datos, `world.ts` es datos,
  la escena es genérica. Regla a sostener: *si un hito nuevo requiere tocar la escena, la spec
  está mal planteada.*
- **Gameplay primero, narrativa después.** CrossCode construyó sistemas y mapa antes de fijar
  la historia. Nuestro equivalente: greybox U1–U5 ya jugable → ahora capa narrativa/hub encima.
- **El códex (Encyclopedia) se desbloquea explorando y hablando**, no por menú: cada entrada es
  recompensa de una acción del jugador. Nuestra Bitácora ya funciona así (flags de comprensión);
  hay que escalarla a secciones.

### 1.2 Outer Wilds — el referente del «mapa de conexiones»

Fuente: [Ship Log / Computer — Outer Wilds Wiki](https://outerwilds.fandom.com/wiki/Computer),
[Interactive Ship Log](https://outerwilds.ventures/).

- **La progresión es por conocimiento, no por ítems.** La única «llave» del juego es *entender*.
  Para un juego educativo esto es oro puro: en Roxana ya es canon («comprender devuelve luz»),
  y el mapa de conexiones lo hace visible.
- **El Ship Log tiene dos vistas:** *Map Mode* (entradas por lugar) y *Rumor Mode* (grafo de
  nodos conectados por lo que el jugador sabe, con huecos visibles «hay más aquí»). Los huecos
  y signos de pregunta **dirigen la exploración sin quest markers**.
- Traducción a Roxana: la sección **«Mapa de conexiones»** de la Bitácora 2.0 es un grafo
  Preguntas ↔ Evidencias ↔ Conceptos ↔ Personajes. Las **«Preguntas pendientes»** son nuestro
  sistema de misiones diegético (no hay quest log; hay preguntas que la protagonista se hace).

### 1.3 Hub & spoke — la estructura espacial

Fuente: [Video Game Layouts](https://soundand.design/layouts-913b8384c257),
[Hub & Spoke Adventure Design](https://thewelshdm.wordpress.com/2025/11/26/hub-spoke-adventure-design/),
[Exploring the Design of Hub Worlds](https://tracedressen.wordpress.com/2019/02/21/home-sweet-home/).

- Regla de oro: **los espacios menores siempre están más cerca del hub que de otros espacios
  menores** — el jugador pasa por el hub para ir a otra rama, y eso reorienta y da sensación de
  hogar. El Instituto debe ser eso: se vuelve SIEMPRE a la escuela entre mundos/unidades.
- El hub debe **cambiar con el progreso** (BotW towns, Deltarune's town): la escuela se
  enciende, los estudiantes vuelven, el cartel de honores se restaura. El hub ES el medidor de
  progreso emocional.
- Los mundos (Ohmdal hoy; Física/Matemática/Programación mañana) son **spokes con puerta en el
  hub** (las aulas). Dentro de cada mundo, sub-estructura igual: la plaza de Ohmdal es el
  mini-hub del mundo, con el mundo continuo alrededor (ya construido).

### 1.4 Integración intrínseca — el referente pedagógico

Fuente: [Intrinsic Integration in Learning Games](https://files.eric.ed.gov/fulltext/ED612086.pdf),
[DragonBox 12+](https://charming-etn.eu/2020/02/11/dragon-box-12-an-example-how-educational-games-can-be-fun/),
[Zachtronics](https://www.analyticsinsight.net/gaming/fun-challenge-and-education-games-from-zachtronics).

- **Integración intrínseca:** meta del juego = meta de aprendizaje (DragonBox: avanzar ES saber
  despejar). Roxana ya lo cumple por canon (`guia-puzzles.md`); el plan no agrega «minijuegos
  educativos» pegados — agrega *contexto de investigación* alrededor de los puzzles existentes.
- **Zachtronics: separar «pasar» de «dominar».** Sus puzzles aceptan soluciones mediocres y
  premian optimizar. Traducción: el **modo práctica** de los bancos (ya existe) se convierte en
  el sistema de **maestría**: pasar la unidad = entender; dominar = resolver variantes en
  práctica. Nunca bloquear historia por maestría.

### 1.5 Tooling de diálogo (referencia futura, no urgente)

Fuente: [How Night in the Woods Uses Yarn Spinner](https://secretlab.games/blog/2017/11/14/how-night-in-the-woods-uses-yarn-spinner).
NITW corre TODO su gameplay por el sistema de diálogo (data + comandos). Nuestro `say()/L()`
embebido en `rooms.ts` alcanza para el Arco I; si el Arco II multiplica personajes reactivos,
evaluar extraer diálogos a data con condiciones (mismo espíritu CrossCode). **No ahora.**

---

## 2. Pilares del Arco I (contra qué se audita todo hito)

1. **La escuela es el hogar.** Se empieza y se termina cada sesión de juego pudiendo volver al
   Instituto; el Instituto refleja el progreso.
2. **Investigar es jugar.** El jugador avanza porque entiende; la Bitácora registra, conecta y
   pregunta. Ninguna «misión» explícita: preguntas pendientes.
3. **Ohmdal es un lugar, no un pasillo de niveles.** Mundo continuo, coherencia espacial,
   NPCs con rutina mínima, zonas que se encienden.
4. **El error es información** y **el vocabulario técnico es spoiler** (canon existente, sigue).
5. **Todo por episodios:** el Arco I debe cerrar satisfactorio por sí solo (Prólogo + Ohmdal
   completo + epílogo que siembra Arco II), sin deuda estructural que impida crecer.

---

## 3. Estado actual vs. objetivo (gap analysis)

**Ya construido (no se rehace):** 23 salas greybox jugables (U1–U5), 17 puzzles con modelo puro
y tests, Bitácora v1 (22 entradas, dos capas), audio procedural por zona, prólogo + cinemática,
landing, guardado localStorage, **capa visual procedural** (visuals.ts) y **mundo continuo
piloto** (world.ts: plaza–puerta–manantial–castillo).

| # | Brecha | Hoy | Objetivo |
|---|---|---|---|
| G1 | Mundo continuo | 4 chunks piloto | Ohmdal exterior completo + Instituto continuo |
| G2 | Instituto como hub | 3 salas de paso | Hub vivo: biblioteca, estudiantes, progreso visible |
| G3 | Bitácora | lista plana de entradas | Sistema central con secciones + mapa de conexiones + preguntas |
| G4 | Progresión | flags lineales por unidad | + maestría por concepto (práctica) y preguntas pendientes |
| G5 | Misterio Roxana | mencionada en prólogo | hilo de investigación con notas desbloqueables (siembra, no resolución) |
| G6 | Arte | plaza/puerta con pase visual | pase por zona (forja/terrazas/faro/castillo/instituto) + bancos + retratos |
| G7 | Cierre | pantalla de fin U5 | epílogo del Arco: escuela encendida + gancho Arco II |

---

## 4. Arquitectura técnica del plan

Lecciones CrossCode aplicadas — **tres módulos de datos nuevos, cero refactors del motor:**

- `src/jugar/world.ts` (existe) — layouts de mundos continuos. Se extiende con datos.
- `src/content/codex.ts` (nuevo) — el modelo de la Bitácora 2.0:
  ```ts
  interface CodexNode {
    id: string;
    section: 'diario'|'roxana'|'ohmdal'|'conceptos'|'personajes'|'maquinas'|'preguntas';
    title: string;
    vivencial: string;          // voz del protagonista (canon actual)
    formal?: string;            // capa formal gateada (canon actual)
    unlockedBy: FlagName[];     // flags de comprensión, nunca de trama
    completedBy?: FlagName[];   // la entrada «se termina de escribir» después
    links: string[];            // aristas del mapa de conexiones (ids de otros nodos)
    answersQuestion?: string;   // id de pregunta que esta entrada responde
  }
  ```
  Las 22 entradas actuales migran como nodos de sección `ohmdal`/`conceptos` sin reescribir texto.
- `src/content/preguntas.ts` (nuevo) — preguntas pendientes (el «quest system» diegético):
  `{ id, texto, aparece: flags, seResponde: flags, respuesta: texto }`. La UI las muestra
  abiertas/respondidas; responder una pregunta = momento de recompensa (sfx + notificación).

La UI de Bitácora sigue siendo DOM (canon), con pestañas por sección y una vista de grafo
(SVG simple, layout fijo autorado a mano — NO force-directed: el grafo del Arco I tiene ~30
nodos, se acomoda a mano como el Rumor Mode de Outer Wilds, que también es curado).

---

## 5. Fases e hitos

Formato: **M# — nombre [ejecutor sugerido]**. Cada hito: spec autocontenida del Orquestador,
verificación `bash scripts/verificar-hito.sh` + jugada en preview, commit aprobado por Director.
Orden = dependencia. Los textos de juego los escribe el Orquestador en la spec (canon), nunca
el ejecutor.

### FASE A — Mundo continuo completo (cierra G1)

- **A1 — Castillo continuo [hecho, 2026-07-01]**: ~~extender `WORLDS` con `forge_yard`,
  `terraces_top` y `lighthouse_hall`~~ **descartado tras el análisis geométrico:** las 3 puertas
  de Forja/Terrazas/Faro salen del mismo tramo del muro oeste de la plaza (bandas de y distintas
  dentro de una sola franja 0–540), así que no pueden ser 3 chunks "al oeste" sin superponerse
  entre sí. Quedan como caminos con puerta de transición (ya vestidos como tales: color y label
  de camino, no de puerta genérica) — son capítulos/regiones separadas (Forja=U3, Terrazas=U4,
  Faro=U5), coherente con hub & spoke (§1.3): no todo spoke necesita fusión literal de chunks.
  **En su lugar** se extendió el mundo `ohmdal` con el interior completo del Castillo como
  corredor vertical continuo: `castle_gate → castle_gallery → castle_branches → castle_heart`,
  con las mismas puertas x:420/w:120 alineadas que ya usaba `puerta→manantial`. La Puerta
  monumental (`puerta-castillo`) se realineó a la muralla como se hizo con `lapuerta`. Ambience
  `castle` agregado a `moodOf`. El playtest continuo plaza→puerta→galería→ramales→corazón
  detectó y corrigió un cuello de colisión junto al Tronco de Ramales. Build, 27 tests y cruce
  final verificados; test de regresión: `m0-continuous-world.test.ts`.
- **A2 — Instituto continuo [en pausa por decisión de dirección, 2026-07-01]**: no invertir
  todavía en unir hall + pasillo + aula + despacho bajo el runtime top-down. Las salas actuales
  siguen jugables como fallback. Primero se implementa la frontera de experiencias y luego un
  spike de una sola estancia compara 3D real, 2.5D y fondos renderizados. Criterio invariable:
  el portal del aula sigue siendo transición a Ohmdal y el shell/Bitácora es compartido.
- **A3 — Minimapa de zona [haiku]**: esquema fijo por mundo (rects de chunks + punto del
  jugador) en DOM, tecla M. Datos derivados de `world.ts`, cero autoría extra.

### FASE B — Instituto hub vivo (cierra G2)

- **B1 — Biblioteca [sonnet]**: sala nueva del hub (chunk del mundo instituto). Contenido:
  estanterías interactivas (3–4 textos de ambientación), el «Archivo de la Bitácora» (acceso
  alternativo a la Bitácora) y la primera Nota de Roxana (ver F1). Spec con texto canon.
- **B2 — Estudiantes y rutina [sonnet]**: 3 estudiantes NPC en el hub cuyos diálogos cambian
  por unidad completada (`estudiantesHablados` ya existe en flags). Aparecen de a uno al
  completar U2/U3/U4 («la escuela se repuebla»). Texto canon en spec.
- **B3 — El hub refleja progreso [haiku]**: cosas del hall con estados por flags — cartel de
  honores, vitrina, lámparas del hall (patrón `color: () => flags ? … : …` existente).
  Al completar el Arco: hall encendido completo.

### FASE C — Bitácora 2.0, el sistema central (cierra G3, G4)

- **C1 — Modelo codex [haiku]**: `codex.ts` + migración mecánica de las 22 entradas actuales
  (`entries.ts` queda como shim para no romper tests). Sin UI nueva.
- **C2 — UI por secciones [sonnet]**: pestañas (Diario / Roxana / Ohmdal / Conceptos /
  Personajes / Máquinas / Preguntas). Reusa el libro DOM actual. Fichas de personaje
  (Edda, Lumen, Ohm, Consejera, Guardiana, Forjadora, Farero, Preceptor) — texto canon.
- **C3 — Preguntas pendientes [sonnet]**: `preguntas.ts` + UI (abiertas/respondidas) +
  notificación al responder. ~12 preguntas del Arco I (canon en spec; ejemplos: «¿Por qué se
  apagó Ohmdal?», «¿Qué mide el ojo de la Puerta?», «¿Quién era Roxana?» — esta última queda
  abierta al final del Arco a propósito).
- **C4 — Mapa de conexiones [sonnet, delicado]**: vista grafo SVG de nodos descubiertos +
  aristas + huecos «???» (à la Rumor Mode). Layout autorado en data. Criterio: un nodo no
  descubierto conectado a uno descubierto se ve como «???».
- **C5 — Maestría [sonnet]**: por concepto (corriente, resistencia, serie, paralelo, potencia,
  KVL, capacitor): estados *vivido → nombrado → dominado*. «Dominado» = resolver la variante
  de práctica del banco correspondiente (los bancos ya quedan en modo práctica). Se muestra en
  la sección Conceptos. Nunca bloquea historia.

### FASE D — Ohmdal como lugar (refuerza G1/G2 dentro del mundo)

- **D1 — Ciudadanos de Ohmdal [sonnet]**: 3–4 NPCs menores en plaza/terrazas/faro con diálogo
  por estado del mundo (apagado/encendido). Ya existen `ciudadano-*` en plaza: extender patrón.
- **D2 — Puerta del Castillo monumental [haiku]**: aplicar a `puerta-castillo` el mismo
  tratamiento de alineación a muralla que `lapuerta` (pendiente anotado del pase visual).
- **D3 — Rutinas por progreso [haiku]**: NPCs que cambian de chunk según flags (patrón
  `walksTo` existente; solo datos).

### FASE E — Pase de arte por zona (cierra G6)

Sobre `visuals.ts`, iterando el estilo validado. Un hito por zona, cada uno = paleta + 1–2
elementos distintivos procedurales + verificación en preview:

- **E1 — Forja [sonnet]**: tonos ámbar/cobre; brasas flotantes (partículas), resplandor de
  fragua pulsante.
- **E2 — Terrazas [sonnet]**: verdes/teal; agua en canales (rasgos de suelo ya soportados),
  reflejos animados.
- **E3 — Faro + Torre del Reloj [sonnet]**: azules fríos; haz del faro rotando cuando se
  restaura, lluvia sutil opcional.
- **E4 — Castillo interior [sonnet]**: violetas profundos; mosaicos del corazón.
- **E5 — Instituto [sonnet]**: crema/nogal; pisos de mosaico escolar, ventanas con luz diurna.
- **E6 — Bancos close-up [sonnet, delicado]**: pase visual de `bench.ts`/`common.ts` al mismo
  lenguaje (sombras, glow en piezas activas, estados error/humo/resuelto legibles).
- **E7 — Retratos de diálogo [sonnet]**: busto procedural del rig del personaje junto al
  nombre en el diálogo DOM (reusa `CHAR_LOOKS`; canvas 2D chico).

### FASE F — El misterio de Roxana (cierra G5)

- **F1 — Notas de Roxana [Orquestador escribe, haiku implementa]**: 4 notas desbloqueables
  (biblioteca B1, despacho, castillo corazón, faro linterna). Cada una alimenta la sección
  Roxana + el mapa de conexiones. En el Arco I el misterio SE SIEMBRA, no se resuelve.
- **F2 — Epílogo del Arco [Orquestador + sonnet]**: al completar U5, secuencia de vuelta al
  Instituto (hall encendido, estudiantes, preceptor), última pregunta abierta en Bitácora y
  cartel de «Continuará: [siguiente mundo]». Reemplaza el `showEnd` actual.

### FASE G — Cierre de producción

- **G1 — Save versioning [haiku]**: migración de saves viejos (merge con defaults ya existe;
  agregar version key + test).
- **G2 — Pase mobile [sonnet]**: joystick + Bitácora 2.0 + mapa en 360×640; tap-to-move en
  mundo continuo.
- **G3 — Audio [sonnet]**: ambience de biblioteca/pasillo; sting de «pregunta respondida» y
  «concepto dominado».
- **G4 — Playtest guiado + auditoría narrativa completa [Director + Orquestador]**: partida
  completa de cero, sin spawn-trucos. Checklist: cada pregunta se responde, cada entrada se
  desbloquea, ninguna softlock de flags.

**Orden recomendado:** A → C1–C3 → B → D → C4–C5 → E → F → G. (La Bitácora básica antes que el
hub vivo, porque B2/B3 y D ya escriben sobre sus secciones.)

---

## 6. Definition of Done de la rama `feature/top-down`

1. Prólogo → U1–U5 → epílogo jugable de corrido, sin greybox visible en salas del Arco I.
2. Instituto y Ohmdal exterior como mundos continuos con cámara.
3. Bitácora 2.0 con las 7 secciones pobladas, ≥12 preguntas (todas respondibles menos las
   sembradas para Arco II), mapa de conexiones navegable.
4. Maestría visible para los 7 conceptos del arco.
5. `verificar-hito.sh` verde; jugable en desktop y mobile; save retrocompatible.
6. El Director jugó la partida completa y aprobó la auditoría narrativa.

## 7. Riesgos

- **Scope creep (el riesgo que el propio Director señaló):** este plan NO agrega mundos, NO
  agrega puzzles nuevos, NO agrega combate. Todo hito construye sobre contenido existente.
  Regla: cualquier idea nueva va a `docs/backlog-arco-2.md`, no al plan.
- **El grafo de conexiones puede volverse un juguete costoso:** por eso C4 es un SVG curado a
  mano de ~30 nodos, no un motor de grafos. Si en playtest no aporta, se degrada a lista de
  vínculos por entrada (barato).
- **Texto canon como cuello de botella:** todas las specs con texto (B1, B2, C2, C3, D1, F1,
  F2) las escribe el Orquestador por adelantado en lotes, para no frenar ejecutores.
- **Deriva visual entre zonas:** E1–E7 comparten `visuals.ts`; cada hito nuevo solo agrega
  funciones, no toca las existentes; auditoría visual en preview obligatoria por zona.
