# Proyecto Roxana — Plan de implementación: Unidad 2 (greybox)
# Documento de handoff para un agente de código (GPT Codex u otro)

**Versión:** 0.1
**Objetivo:** construir el greybox jugable de la Unidad 2 «El río se reparte» sobre el motor existente de la U1, siguiendo el guion de `unidad-2-caminos.md`.
**División de trabajo:** Claude diseña y escribe guion/specs (este doc); el agente de código implementa hito por hito; el autor prueba y dirige.

---

## 0. Cómo usar este documento con el agente de código

1. **Contexto mínimo por sesión:** darle siempre `README.md`, este plan, y `docs/unidad-2-caminos.md`. Con eso puede trabajar cualquier hito sin ver el resto de los docs.
2. **Un hito por tarea.** Los hitos M0–M8 están ordenados por dependencia: no pedir M3 sin M0 hecho. Cada hito cabe en una sesión corta.
3. **Commit por hito,** mensaje en español, y `npm run build` (corre `tsc` + Vite) debe pasar antes de cada commit.
4. **El texto del juego NUNCA lo inventa el agente.** Todos los diálogos, carteles y entradas de Bitácora se copian **textuales** de `unidad-2-caminos.md`. Si una línea necesaria no existe en el doc, dejar `// TODO(guion): falta línea para X` y reportarlo — no improvisar. El texto es español neutro latinoamericano (tuteo); cualquier voseo es un bug.
5. Al final de este doc hay una **plantilla de prompt** lista para pegar.

### Reglas de diseño inviolables (el código las respeta o el PR se rechaza)

- **El vocabulario técnico es spoiler:** «serie», «paralelo», «nodo», «Kirchhoff» no aparecen en NINGÚN texto visible antes de resolver el Repartidor (solo en la capa formal de la Bitácora, gateada por `learnedSeriesParallel`). En código (ids, variables) sí se usan términos técnicos.
- **El error es información, nunca castigo:** quemar el fusible del Tronco no resta nada, dispara diálogo y completa Bitácora (`burnedTrunkFuse`). Siempre hay reset diegético (los fusibles de Lumen).
- **Múltiples soluciones válidas:** el Repartidor acepta toda configuración que cumpla las condiciones numéricas, no una solución hardcodeada.
- **Reuso de piezas:** los componentes de banco de la U2 reutilizan el lenguaje visual de `puzzles/common.ts` (piedras con código de colores real: marrón=1, roja=2, amarilla=4, gris=8; cristales 4/8/16; agujas). No introducir piezas nuevas no especificadas.
- **Los bancos quedan en modo práctica** después de resueltos (patrón U1).

---

## 1. Arquitectura existente (mapa para el agente)

| Módulo | Qué es | Qué tocar para la U2 |
|---|---|---|
| `src/state.ts` | flags + save en localStorage; `setFlag()`, `hooks.refresh()/goto()` | agregar flags U2 (ver M0) |
| `src/game/rooms.ts` | TODAS las salas como datos (`RoomDef`: `doors`, `things`, `onEnter`) + diálogos y gating | salas nuevas del Castillo, estados U2 de salas viejas |
| `src/game/ExplorationScene.ts` | escena Phaser: render de RoomDef, movimiento, colisión, interacción | idealmente NO tocar (las salas son datos) |
| `src/ui/dialog.ts` | `say([L('Nombre','texto'),...], onDone)` | usar tal cual |
| `src/ui/bench.ts` | `openBench(titulo, sub, build)` + `benchActions()`; el puzzle arma DOM/SVG en `handle.root` | usar tal cual |
| `src/puzzles/common.ts` | widget de Ohm, piedras, medidor de aguja | extender con piezas U2 (ver M2) |
| `src/puzzles/despertar|freno|puerta.ts` | los 3 puzzles U1 — **el patrón a imitar**: `abrirX(onSolved)` abre banco, valida, cierra | nuevos: `bell.ts`, `chain.ts`, `branches.ts`, `distributor.ts`, `timbre.ts` |
| `src/content/entries.ts` | Bitácora: `getEntries()` devuelve entradas según flags; dos capas (vivencial/formal), la formal se completa sola con flags posteriores | 4 entradas U2 (ver M7) |
| `src/ui/bitacora.ts` | el libro + `notifyNewEntry(titulo)` | usar tal cual |
| `src/ui/end.ts` | pantalla de cierre del slice U1 | reemplazar por cierre de unidad reutilizable (M0) |
| `src/audio.ts` | WebAudio procedural: `setAmbience(zona)` + `sfx*()` | ambience «castillo» + 2–3 sfx (M8) |

Convenciones: TypeScript estricto, sin dependencias nuevas, todo el texto visible en español neutro, ids/flags en inglés camelCase (patrón existente: `puertaDone` mezcla — seguir el estilo del archivo donde se trabaje).

---

## 2. Hitos

### M0 — Flags U2 + el final de la U1 deja de ser final

**Archivos:** `src/state.ts`, `src/ui/end.ts`, `src/game/rooms.ts` (mínimo).

- Agregar a `Flags` (y `DEFAULT_FLAGS`): `playedUnit2Intro`, `solvedBellPaths`, `metConsejera`, `enteredCastle`, `ohmRecognizedCastle`, `solvedGalleryChain`, `solvedBranches`, `burnedTrunkFuse`, `solvedDistributor`, `castleRestored`, `learnedSeriesParallel`, `fixedSchoolBell`, `sawStoredSpark`, `unit2Completed`. (El merge de `load()` con `DEFAULT_FLAGS` ya hace compatible cualquier save viejo — verificarlo con un save de U1 terminada.)
- `end.ts`: la pantalla de cierre de la U1 gana un botón «Continuar» que devuelve al Instituto (`hooks.goto`) en lugar de terminar. Reutilizable: `showEnd(opts)` parametrizada por unidad.
- **Aceptación:** un save con `finished=true` puede volver a caminar por el Instituto; build verde.

### M1 — El Aula, módulo dos

**Archivos:** `rooms.ts`.

- Estado U2 del aula (con `finished`): una lámpara del aula encendida, pizarrón con la frase completa, panel del portal estable (cambios de `color`/`label` por flag — patrón ya usado en U1).
- Interactuar con el proyector con `finished && !playedUnit2Intro` reproduce la secuencia del proyector + lacre del Consejo (texto de `unidad-2-caminos.md` §2) y setea `playedUnit2Intro`.
- **Aceptación:** la secuencia se ve una sola vez; el portal lleva a la plaza de Ohmdal.

### M2 — Piezas de banco U2 + Puzzle 1: la campana de dos cables

**Archivos:** `src/puzzles/common.ts` (extensión), nuevo `src/puzzles/bell.ts`, `rooms.ts`.

Piezas nuevas en `common.ts` (SVG/DOM, estilo existente):
- **Llave de tramo:** interruptor abrir/cerrar por tramo.
- **Punto de medición «llamar a Ohm»:** botón por tramo; al activarlo, Ohm «se para ahí» (uno a la vez) y reporta el río del tramo como texto de estado (`bench.setStatus`). Es LA mecánica de la unidad (ley de nudos vivida) — hacerla componente reutilizable: `ohmProbe(tramos, getRio)`.
- **Fusible con tolerancia visible** (zona verde + umbral; al excederse 3 veces, «se inmola»).

`bell.ts` — `abrirBell(onSolved)`: topología fija fuente→Tronco→cruce→dos tramos gemelos→campana. Estados según §3 del guion: ambos cerrados (½ y ½, Tronco entero), uno abierto (0 y entero, campana suena), ambos abiertos (silencio). Los diálogos de Edda/Ohm por estado, textuales del doc. Se considera resuelto cuando el jugador pasó por los tres estados y vuelve a cerrar ambos.
- **Aceptación:** mediciones correctas en los tres estados; `solvedBellPaths`; `notifyNewEntry('Dos caminos')`; modo práctica después.

### M3 — La puerta del Castillo y la Consejera + salas del Castillo (greybox)

**Archivos:** `rooms.ts`.

- Estado U2 de la plaza: Edda junto a la campana (con `playedUnit2Intro && !solvedBellPaths`), acceso al camino del Castillo.
- Sala `castle_gate`: puerta monumental con `locked()` → con `solvedBellPaths`, secuencia de la Consejera (§4 del guion, textual) que termina en `metConsejera` + `enteredCastle`; al cruzar, beat de Ohm (`ohmRecognizedCastle`).
- Salas greybox `castle_gallery`, `castle_branches`, `castle_heart` encadenadas, con NPCs (Consejera acompaña: `visible` por flags) y puertas gateadas en orden galería→ramales→corazón.
- **Aceptación:** flujo completo caminable; la Consejera aparece en cada sala; gating en orden.

### M4 — Puzzle 2: la Cadena

**Archivos:** nuevo `src/puzzles/chain.ts`, `rooms.ts`.

Fila de lámparas (freno fijo c/u) con enchufes para agregar/quitar, `ohmProbe` en cada tramo de la fila, aguja de brillo. Cuatro experiencias del §5 (medir-igual-en-todos-lados, quitar-una-mata-todas, agregar-atenúa, resolver con la cantidad justa) con sus diálogos textuales, en cualquier orden.
- **Aceptación:** río idéntico en todo punto de la fila; brillo = f(cantidad de lámparas); `solvedGalleryChain` al dejar la fila en su configuración objetivo.

### M5 — Puzzle 3: los Ramales

**Archivos:** nuevo `src/puzzles/branches.ts`, `rooms.ts`.

Cruce con tres ramas conectables, engaste de piedra por rama, lámpara de taller por rama, aguja de Tronco con tolerancia 8 y fusible mayor. Comportamiento por §6: cada rama según SU piedra (río = empuje/piedra), conectar una rama no altera las otras, Tronco = suma; tres marrones → fusible se inmola (diálogo + `burnedTrunkFuse`, reset con fusibles de Lumen). Resuelto cuando las tres ramas dan caudal razonable (cada lámpara en su zona) con Tronco ≤ 8.
- **Aceptación:** matemática exacta con enteros; el fusible quemado NO bloquea progreso; `solvedBranches`.

### M6 — Puzzle 4: el Repartidor (evento mayor)

**Archivos:** nuevo `src/puzzles/distributor.ts`, `rooms.ts`.

Lo de M5 más: cristal de Empuje elegible (4/8/16), tres distritos con zona verde PROPIA (forja: río 4 / campanario: 2 / biblioteca: 1 — con margen razonable, definir zona = valor exacto ±0 en greybox), aguja de Tronco (tolerancia 8), `ohmProbe` sobre TODA la red (Ohm caminante). **Validación por condiciones, no por solución:** toda combinación con los tres distritos en verde y Tronco ≤ 8 gana (canónica: Empuje 8 → roja/amarilla/gris, Tronco 7). Feedback de fallo por distrito (§7: forja tose, campanario desafina, biblioteca aplaude la penumbra). Resolución: secuencia de encendido del Castillo + diálogos finales (Consejera rompe el sello) + `solvedDistributor`, `castleRestored`, `learnedSeriesParallel`.
- **Aceptación:** al menos dos soluciones distintas verificadas a mano; con Empuje 16 existe configuración válida e inválida; Bitácora arde y abre la entrada formal.

### M7 — Las 4 entradas de Bitácora U2

**Archivos:** `src/content/entries.ts`.

Entradas «Dos caminos», «La Cadena», «Los Ramales» (vivenciales al resolver cada puzzle; formal completada por `learnedSeriesParallel`) y «La Regla del Cruce» (formal mayor). Contenido textual del §9 del guion, formato HTML de las entradas existentes (incluye los bloques «Error común» y preguntas ✎). La sección de error común de «Los Ramales» se completa solo si `burnedTrunkFuse` (patrón U1 con `burnedSomething`).
- **Aceptación:** las tres primeras nacen incompletas (con su `blank` invitando) y se completan tras el Repartidor.

### M8 — Cierre: ciudadanos, el timbre del Instituto, ganchos y audio

**Archivos:** `rooms.ts`, nuevo `src/puzzles/timbre.ts`, `src/audio.ts`, `src/ui/end.ts`.

- Plaza nocturna post-Castillo: diálogos ambientales de ciudadanos + beat de Edda (§8.1).
- **Gancho capacitor** (§8.3): en el corazón del Castillo, interacción «cortar el Tronco para el acta» → el mecanismo sigue brillando 3 segundos (animación CSS/JS simple) → diálogos + `sawStoredSpark` + entrada automática «Anomalía: la chispa que se queda».
- De regreso al Instituto: el timbre en el pasillo, `timbre.ts` = mini-banco de aplicación (dos caminos: uno cortado a reparar, una piedra equivocada a cambiar), SIN ayuda de NPCs. Al sonar: diálogo del preceptor + `fixedSchoolBell`; el timbre queda sonando como cambio permanente del hub (sfx).
- Audio: `setAmbience('castle')` (variación de la paleta existente), sfx: sello que se rompe, fusible mayor, acorde del Repartidor, timbre de escuela.
- Pantalla de cierre de unidad (end.ts reutilizable de M0) + `unit2Completed`.
- **Aceptación:** E2E completo desde save U1-terminada hasta `unit2Completed`; build verde.

---

## 3. Checklist E2E final (manual, el autor o el agente con preview)

1. Save nuevo → U1 completa → «Continuar» → aula con lámpara/pizarrón nuevos.
2. Proyector módulo 2 → plaza → campana (3 estados) → Bitácora «Dos caminos» incompleta.
3. Puerta del Castillo trabada sin `solvedBellPaths`; con evidencia, secuencia Consejera.
4. Galería → Ramales (quemar fusible a propósito: diálogo, reset, sin castigo) → Repartidor con DOS soluciones distintas.
5. Bitácora: 4 entradas completas tras el Repartidor; «errores comunes» refleja si quemé o no.
6. Cortar el Tronco → anomalía → plaza nocturna → timbre del Instituto → preceptor → cierre.
7. Recargar la página en cada paso: el save retoma bien. `npm run build` verde.
8. Vocabulario: grep de `serie|paralelo|nodo|Kirchhoff` en texto visible → solo capa formal gateada.

---

## 4. Qué queda FUERA del alcance del agente de código

- Escribir o «mejorar» texto del juego (guion = fuente de verdad).
- Decisiones de diseño no especificadas (si una spec es ambigua: TODO + preguntar, no resolver inventando).
- Tocar el balance numérico (piedras, tolerancias, objetivos) sin instrucción.
- Arte, música real, i18n (el voseo es-AR vive en el tag `texto-es-AR-v1`, no tocarlo).

## 5. Plantilla de prompt para el agente (pegar y completar)

```
Proyecto: juego educativo en Phaser 4 + TypeScript + Vite (web, sin backend).
Lee primero: README.md, docs/plan-implementacion-u2.md y docs/unidad-2-caminos.md.

Tarea: implementar el hito M_ del plan (docs/plan-implementacion-u2.md §2).
- Respetá las "Reglas de diseño inviolables" del plan (§0).
- Todo texto visible se copia TEXTUAL de docs/unidad-2-caminos.md (español
  neutro, tuteo). Si falta una línea: // TODO(guion) y reportalo.
- Seguí los patrones existentes: puzzles como src/puzzles/freno.ts,
  salas como datos en src/game/rooms.ts, entradas como src/content/entries.ts.
- Sin dependencias nuevas. npm run build tiene que pasar.
- Al terminar: lista de archivos tocados + cómo probar a mano el hito.
```

---

## 6. Después de la U2

El mismo patrón de plan sirve para U3–U5 (`unidad-3-forja.md`, `unidad-4-terrazas.md`, `unidad-5-faro.md`, ya diseñadas): cuando la U2 esté jugable y revisada, Claude baja el siguiente doc a hitos. Novedades técnicas a anticipar (no construir ahora): termómetro de canal (U3), modo brazos de Ohm + página de predicción en Bitácora (U4), tick de simulación en banco para piezas animadas por tiempo (U5).
