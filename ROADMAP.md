# Roadmap

> **Norte:** el Instituto Roxana como hogar que recuerda y cambia, con cinco campañas
> independientes (Prólogo + Ohmdal + Physica + Bitland + Arithmos) unidas por interludios
> transversales. Verbo nuclear por mundo: CONECTAR / EXPERIMENTAR / PROGRAMAR / TRANSFORMAR.
>
> Este roadmap refleja el estado del proyecto contra los **GDD v1** ratificados el
> 2026-08-14 (autoridad nivel ≤3). Lo que dice un GDD v1 gana sobre este roadmap; si el
> roadmap contradice un GDD v1, se corrige el roadmap. Ver `docs/00-governance/ROXANA_CANON_POLICY_v1.md`.

Un hito = algo que se puede abrir en el navegador y jugar. Se hace uno por vez.

---

## 1. Decisiones tomadas (de los GDD v1)

Estas decisiones vienen de `docs/10-global/` y `docs/20-worlds/` (autoridad nivel 2–3).
No se reabren sin ADR firmado por Manuel.

### El Instituto no es un menú, es un espacio con ocho funciones
([`ROXANA_INSTITUTE_BIBLE_v1.md`](docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md) §3)

Hogar · Misterio · Archivo · Mapa de progreso · Espacio transformable · Lugar de
retorno de personajes y artefactos · Cruce entre disciplinas · Preparación para nuevos
mundos. La cámara y el motor son **decisión de producción**, no de diseño (P12):
conviven hoy el hub 2D (`src/experiences/instituto/EscuelaHubScene.ts`) y el hall 3D
(`src/landing/school3d.ts`); un ADR futuro puede consolidarlos.

### Las cinco campañas son independientes
([`ROXANA_CAMPAIGN_STRUCTURE_v1.md`](docs/10-global/ROXANA_CAMPAIGN_STRUCTURE_v1.md) §2)

El Prólogo y los cuatro Mundos Aplicados viven en un **árbol con interludios**:
no se juega una campaña tras otra de forma forzada; el jugador alterna para evitar
fatiga de género y la integración se gana al final, no se impone al inicio (P15).

### Cada mundo tiene su North Star y su verbo nuclear

| Mundo | Verbo | North Star | Autoridad |
|---|---|---|---|
| Ohmdal | CONECTAR | Mirar una instalación de Ohmdal, formar un modelo de cómo circula y se controla la energía, intervenir y observar al mundo reaccionar. | [`docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md`](docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md) §1 |
| Physica | EXPERIMENTAR | Antes de escribir una ecuación, el jugador debe haber sentido la relación con su cuerpo, un objeto o una máquina. | [`docs/20-worlds/physica/vision/physica-vision_v1.md`](docs/20-worlds/physica/vision/physica-vision_v1.md) §1 |
| Bitland | PROGRAMAR | El jugador no responde qué hace un algoritmo: escribe o ensambla comportamiento y observa cómo el mundo lo ejecuta. | [`docs/20-worlds/bitland/vision/bitland-vision_v1.md`](docs/20-worlds/bitland/vision/bitland-vision_v1.md) §1 |
| Arithmos | TRANSFORMAR | Los números no son respuestas escritas sobre puertas: son propiedades transformables de objetos, espacios y relaciones. | [`docs/20-worlds/arithmos/vision/arithmos-vision_v1.md`](docs/20-worlds/arithmos/vision/arithmos-vision_v1.md) §1 |

### La Bitácora es un sistema con tres capas y un ciclo de estados
([`ROXANA_BITACORA_SYSTEM_v1.md`](docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md))

Tres capas por entrada: **huella vivida**, **puente**, **formalización**. La entrada
pasa por `OBSERVED → HYPOTHESIZED → FORMALIZED`. La Bitácora es la misma para los
cinco espacios; las entradas producidas en Ohmdal se leen, dibujan y traducen
localmente; la capa de formalización global se somete a GQ-1.

### El vocabulario técnico es spoiler
([`ohmdal-vision_v1.md`](docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md) §3 y
[`CLAUDE.md`](CLAUDE.md) §5)

`serie`, `paralelo`, `nodo`, `Kirchhoff`, `capacitor` y los términos formales de
los otros mundos solo aparecen en la capa de formalización de la Bitácora, gateada
por flags de comprensión. En Ohmdal el vocabulario diegético es Empuje / Río /
Piedra / Camino / Freno / Chispa. Lo mismo vale para Physica/Bitland/Arithmos.

### El runtime web es Vite + TypeScript + shell de runtimes bajo demanda
([`START_HERE.md`](docs/START_HERE.md))

`RuntimeHost` monta y desmonta runtimes por `import()` dinámico. Visitar Ohmdal no
descarga Bitland. **No se migra** a React, Next.js, R3F, Godot o PlayCanvas en esta
etapa; ninguna resuelve por sí misma continuidad artística, diseño de interacción o
producción de assets.

---

## 2. Estado de las cinco campañas

Lo que dice el código contra lo que dice el GDD v1. Si contradice, se corrige el
código, no el GDD (Canon Policy §2 regla 3).

### Campaña 1 — Prólogo / Instituto

- **Status:** en producción.
- **Runtime:** `topdown-phaser` (hub cenital) en `manifests.ts`. Convive con el hall
  3D de `src/landing/school3d.ts` (`src/landing/`).
- **GDD:** [`ohmdal-arc-01_v1.md`](docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md) §2.1 "Prólogo — La pregunta vuelve".
- **Capacidad que entrega:** inspección + continuidad + primera predicción.
- **Cierre observable:** Ohm despierto, Plaza legible, ruta trazada hacia la Calzada.

### Campaña 2 — Ohmdal Arco I "La Luz"

- **Status:** en producción. Slice greybox jugable en `/jugar` (baseline de regresión)
  + HD-2D sirviéndose desde `src/ohmdal/` en `/ohmdal`.
- **Runtime:** `topdown-phaser` (`/jugar`) ↔ `ohmdal-hd2d` (`/ohmdal`) por ADR. La
  conmutación vive en `src/shared/portalLink.ts` (un solo interruptor de migración).
- **GDD:** [`ohmdal-arc-01_v1.md`](docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md)
  — capítulos canónicos (no U1–U5, que eran los nombres heredados del slice).
- **Capítulos canónicos:**

  | # | Título | Centro técnico | Centro narrativo | Cierre observable |
  |---|---|---|---|---|
  | Prólogo | La pregunta vuelve | Circuito completo + primera medición | Llega el estudiante, despierta a Ohm, Edda parte por su cuenta | Ohm despierto; plaza legible |
  | 1 | La Calzada | Tensión, corriente, resistencia, continuidad | Lumen pasa de ritual a banco documentado | Calzada con luz y agua; primer esquema publicado |
  | 2 | El Castillo de la Red | Serie, paralelo, distribución, conservación | La Consejera pasa de sellar a medir y contener | Barrios aíslan fallas sin apagarse todos |
  | 3 | La Forja y las Terrazas | Potencia, energía, calor, materiales, seguridad | Yesca y Vega pasan de disputa a decisión documentada | Producción sin sobrecargar; esquema comunitario |
  | 4 | El Faro y el Lago | Lazos, divisores, equivalentes, RC sólo si V2 | Nereo pasa de memoria frágil a memoria validada | Faro comunica método; calibración validada |
  | Epílogo | La primera clase | Documentación y transferencia | Edda enseña a otra persona | Bitácora de egreso; horizonte abierto (Marea, Señal, Voz) |

- **Capacidad acumulada al cierre:** enseñar (P12) con todas las herramientas anteriores disponibles.
- **Baseline jugable:** `/jugar` (Phaser greybox, contenido U1–U5 según nomenclatura
  legacy) se preserva como red de seguridad hasta que el HD-2D alcance al menos los
  capítulos Prólogo + 1 en presentación y jugabilidad.

### Campaña 3 — Physica Arco I "Movimiento"

- **Status:** **en producción**, no aparacado. Hito 1 hecho el 2026-08-05.
- **Runtime:** `platformer-babylon` en `src/experiences/physica/`. M1 (Three.js) se
  conserva accesible en dev con `?engine=three` (base de regresión).
- **Decisión de motor (Director, 2026-08-05):** Babylon.js para los mundos. **No se
  usa Havok** para la física pedagógica: la analítica de forma cerrada (MRUV, tiro
  parabólico, vectores) es autoritativa; Havok maneja colisiones, rigid bodies
  pasivos y pushable props. Ver
  [`docs/20-worlds/physica/production/arquitectura.md`](docs/20-worlds/physica/production/arquitectura.md).
- **GDD:** [`physica-arc-01_v1.md`](docs/20-worlds/physica/content/physica-arc-01_v1.md) —
  6 capítulos canónicos sobre E2–E7 (escenas del slice):

  | # | Título | Escena(s) | Familias | Idea ganada | Cierre observable |
  |---|---|---|---|---|---|
  | 0 | La caída imposible | E2 | F1, F2 | "Dos cuerpos del mismo lugar obedecen direcciones distintas" | Cascada se estabiliza cuando el jugador delimita la región |
  | 1 | Llegar antes | E2, E4 | F1, F2 | "Predecir requiere comparar dos casos, no aplicar una fórmula" | Una plataforma anterior se ancla como atajo curado |
  | 2 | Lo que cambia | E4, E6 | F1, F5 | "Misma distancia, distinta pendiente, distinta trayectoria" | Se abre un nuevo camino entre dos regiones |
  | 3 | Peso no es destino | E3 | F3, F4 | "La masa cambia la dinámica, no el destino" | INSTRUMENTO queda como compañero permanente |
  | 4 | Superficies | E6, E3 | F5, F8 | "La fricción es una propiedad legible del sistema" | Una rampa se vuelve utilizable |
  | 5 | Estación cinética | E7 | F6, F7, F9, F10 | "Las consecuencias se propagan" | Estación se activa parcialmente; Bitácora del arco se cierra |

  E8 (Metrópoli) queda como epílogo opcional, no obligatorio.

### Campaña 4 — Bitland Arco I

- **Status:** PROPOSED en diseño, **sin código**. El runtime es un `placeholderRuntime`
  con `status: 'planned'` en `manifests.ts`. Ver
  [`docs/20-worlds/bitland/AGENTS.md`](docs/20-worlds/bitland/AGENTS.md) §7.
- **GDD v1:** vision, world-metaphor, programming-language-gameplay, automation-system,
  puzzle-grammar, mechanics-progression, narrative-bible, arc-01, vertical-slice,
  prototype-evaluation. Todo `PROPOSED`.

### Campaña 5 — Arithmos Arco I

- **Status:** PROPOSED en diseño, **sin código**. Igual que Bitland.
- **GDD v1:** vision, world-rules, representation-system, transformation-system,
  puzzle-grammar, mechanics-progression, narrative-bible, arc-01, vertical-slice,
  prototype-evaluation. Todo `PROPOSED`.

---

## 3. Vertical slices

### Ohmdal — slice canónico
[`docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`](docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md)

**Objetivo:** probar en 20–30 minutos que Ohmdal puede unir narrativa, aprendizaje
auténtico y presentación HD-2D en web. **No** intenta demostrar el juego completo;
debe invalidar temprano una dirección que no funcione.

**Beats canónicos:** 8 (VS01–VS08). Los seis primeros cierran el slice jugable; VS07
y VS08 cierran la transferencia (Puerta de Ohm) y la formalización (Manantial).

| Beat | Título | Min | Qué prueba |
|---|---|---|---|
| VS01 | Portal / Primer encuadre | 2–3 | Estudiante, diorama, anomalía sin exposición |
| VS02 | Edda / Dos explicaciones | 3–4 | Validar la pregunta y modelo local sin ridiculizarlo |
| VS03 | Despertar de Ohm | 4–5 | Circuito completo + predicción + indicador |
| VS04 | Taller de Lumen | 4–5 | Experiencia práctica y conflicto de modelos |
| VS05 | Diagnóstico de Lumen | 8–10 | Hipótesis → medición → intervención → verificación → esquema |
| VS06 | Cruce de Edda | 2 | Autonomía y transferencia observable |
| VS07 | Puerta de Ohm | 5–6 | Transferencia sin teoría nueva |
| VS08 | Manantial / Formalización | 4–5 | Cierre emocional, mundo y Bitácora |

**Veredicto al cierre (3 opciones):** avanzar / corregir una segunda y última ronda /
descartar la dirección. Compilar no cuenta como aprobación.

### Physica — slice operativo
[`docs/20-worlds/physica/production/spec-vertical-slice.md`](docs/20-worlds/physica/production/spec-vertical-slice.md)

Ya implementado para el Hito 1 (cascada ascendente jugable, 8 escenas QA E2–E8). El
spec debe pasar a `CANON` por ADR tras ratificar el veredicto del Hito 1.

### Global — slice de integración
[`docs/10-global/ROXANA_GLOBAL_VERTICAL_SLICE_CRITERIA_v1.md`](docs/10-global/ROXANA_GLOBAL_VERTICAL_SLICE_CRITERIA_v1.md)

**Objetivo:** probar la **integración** (Instituto + Bitácora + metaprogresión + al
menos dos mundos + un cruce interdisciplinario), no los verbos aislados. **No** es
un slice de mundo.

**7 capacidades observables obligatorias:**

1. El Instituto es un espacio jugable (no un menú).
2. La Bitácora es un sistema, no un codex (transición `OBSERVED → HYPOTHESIZED → FORMALIZED`).
3. La metaprogresión no es XP (transformación observable del Instituto).
4. Cruce interdisciplinario es un desafío, no un nivel compartido (ver
   [`docs/30-integration/roxana-cross-world-challenges_v1.md`](docs/30-integration/roxana-cross-world-challenges_v1.md) §3).
5. La estructura de campaña permite alternar.
6. La pregunta global se sostiene (hilo del Instituto).
7. El slice pasa las 12 preguntas críticas del
   [`ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`](docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md).

El slice global **no** necesita implementar las cinco campañas por completo; puede
cruzar mundos como **lectura**, no como campaña (VS-Q1).

---

## 4. Hitos

Un hito = algo jugable en el navegador. El estado real se valida con la última
sesión de navegador y con los tests en verde.

### H1 — HD-2D fuera del laboratorio · ✅ hecho
El prototipo del laboratorio vive en `src/ohmdal/`, se sirve en `/ohmdal`, lo monta
`RuntimeHost` como cualquier otro mundo, y se llega desde el aula de Electrónica por
la puerta «Ver el Ohmdal nuevo · en obra». Cámara frontal, acabado fotográfico
(bloom, tilt-shift, grado de color).

Dejó medido: **474 triángulos y cero texturas**. La brecha con *DQ III HD-2D* es
arte, no configuración.

### H2 — La Plaza real, en HD-2D · ← **acá estamos**
Reemplazar el blockout de prueba por la Plaza real del Arco I con su contenido:
Edda, Ohm, la campana, las lámparas. Corresponde a los beats **VS01 + VS02** del
slice canónico. El contenido ya está escrito en `src/jugar/rooms.ts`.

**Pipeline:** Blender → GLB con vertex colors horneadas, validadores
`npm run 3d:validate-glb` y `npm run 3d:report-budget`. Contrato en
[`docs/arco1/ASSET_PIPELINE.md`](docs/arco1/ASSET_PIPELINE.md).

**Resultado:** los dos primeros beats del slice jugables con el look que querés y
los personajes en escena. Cuando esté, `portalGateUrl()` en
`src/shared/portalLink.ts` pasa a apuntar a `/ohmdal` y toda la plataforma cambia
de mundo. Es el único interruptor de la migración: lo usan las tres vías de
entrada. Si no convence, se vuelve atrás cambiando la misma línea.

### H3 — El despertar de Ohm en HD-2D
Corresponde al beat **VS03** del slice. Cierra la primera intervención del jugador
en el HD-2D: circuito completo + predicción del indicador antes de energizar. Diseño
vivo en [`docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md`](docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md)
§3 (modo Lectura de red) y §4 (modo Intervención).

**Resultado:** el slice demuestra que **se juega**, no sólo se camina, en HD-2D.

### H4 — El Instituto recuerda la partida
Al salir de Ohmdal, el Instituto muestra que estuviste: el aula de Electrónica
cambia de estado según los flags de la partida. Cumple la **función 3.5**
(transformación del Instituto) de la biblia del Instituto y la **jerarquía de
recompensas tipo 1** del Design Language.

**Resultado:** la promesa del producto —«la escuela demuestra que recuerda lo que
hice»— funciona por primera vez.

### H5 — Arte real sobre el blockout
Reemplazar la geometría de prueba siguiendo la dirección congelada en
[`docs/arco1/`](docs/arco1/) — identidad, color script, encuadres, presupuestos por
escena. No toca la lógica de puzzles ni el contenido.

**Resultado:** la Plaza deja de parecer un prototipo.

### H6 — El capítulo 1 "La Calzada" en HD-2D
Llevar al renderer HD-2D el contenido de `src/jugar/` correspondiente a la Calzada
(Lumen, el diagnóstico de Lumen, los esquemas). Corresponde a los beats **VS04 +
VS05**. Cuando este capítulo esté jugable con el look y los puzzles diegéticos, el
slice de Ohmdal queda **completo**.

**Resultado:** el vertical slice de Ohmdal pasa el veredicto "avanzar" del
[`ohmdal-vertical-slice_v1.md`](docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md) §5
(los gates narrativo, educativo, visual, funcional/técnico y legal/productivo).

### H7 — El resto del Arco I en HD-2D
Taller, Puerta, Castillo, Forja, Terrazas, Faro, Epílogo. Sala por sala, con el
patrón que dejaron H2–H6. Cuando el último cruce, `/jugar` se retira.

**Resultado:** la Campaña 2 (Ohmdal Arco I "La Luz") está **completa en HD-2D**;
los criterios de cierre de `ohmdal-arc-01_v1.md` §5 se cumplen.

### H8 — Slice global de integración
Cruzar Instituto + Bitácora + Ohmdal HD-2D + al menos un cruce interdisciplinario
(uno de los cuatro tipos en
[`roxana-cross-world-challenges_v1.md`](docs/30-integration/roxana-cross-world-challenges_v1.md)
§3.1). Validar las 7 capacidades observables del slice global.

**Resultado:** la promesa "el Instituto como hogar que une mundos" se valida con
evidencia de prototipo, no sólo de diseño.

### H9+ — Apertura de las otras campañas y Proyectos Integradores
Pendientes de **ADR** que cierre el trabajo de Ohmdal como `CANON` y eleve la
siguiente campaña a `in-progress`. La prioridad la define
[`ROXANA_CAMPAIGN_STRUCTURE_v1.md`](docs/10-global/ROXANA_CAMPAIGN_STRUCTURE_v1.md)
§3.2 — tras el primer arco de Ohmdal, el jugador elige; el sistema no obliga.

---

## 5. Qué funciona hoy (verificado)

- **`/`** — landing 3D con GLB Blender + Three.js (hall, estatua de Roxana, escala
  horneada en vertex colors, sin luces en tiempo real). Sin errores de consola.
- **`/jugar`** — Ohmdal Arco I completo en Phaser topdown greybox (23 salas U1–U5
  con nombres legacy, narrativa, lógica, estado, modelos puros y tests). **Es
  baseline de regresión**, no la presentación aprobada.
- **`/ohmdal`** — HD-2D runtime nuevo (`src/ohmdal/`, H1 hecho). Cámara frontal,
  acabado fotográfico, primera plaza jugable.
- **`/physica`** — Physica Hito 1 (cascada ascendente en Babylon.js, E2 jugable,
  INSTRUMENTO pendiente).
- **El shell de runtimes** — `RuntimeHost` monta y desmonta mundos; `loaders.ts`
  los carga con `import()` dinámico.
- **La Bitácora** — dos capas implementadas (huella vivida, formalización). El
  puente, las transiciones `OBSERVED → HYPOTHESIZED → FORMALIZED` y la cámara
  completa de Bitácora están en el GDD v1; algunos pedazos siguen siendo PROPOSED.
- **El portal Instituto ↔ Ohmdal** — `portalGateUrl()` y `portalExitUrl()` con
  transición visual y sonido.
- **88 archivos de test** y `npm run build` en verde (a 2026-08-14).
- **Cinco `AGENTS.md`** por mundo + `AGENTS.md` raíz.

---

## 6. Grietas conocidas

Cosas rotas o a medias que encontramos y no bloquean, pero conviene no olvidar:

- **`EscuelaHubScene.ts` no es código muerto, es coexistencia.** El hub 2D de
  Phaser no está "descartado" (como decía el ROADMAP anterior); el bible v1 lo
  declara como decisión de producción, no de diseño. Un ADR futuro puede
  consolidarlo con el hall 3D de `src/landing/`. No tocar sin ADR.
- **Dos de los tres bancos de A1.U1 siguen siendo modales a pantalla completa.** El
  de la Puerta ya vive en el mundo; `ohm` y `lumen` no.
- **Safe areas en mobile 390×844:** 48,0 % de franja libre contra 60,1 % que pide el
  contrato de encuadres (`docs/arco1/SHOT_DECK.md`).
- **El Puente de la Bitácora** (capa intermedia huella → formalización) está en el
  GDD pero no implementado del todo. Es deuda viva del H4 (Instituto recuerda).
- **El INSTRUMENTO de Physica** está en el GDD v3 como personaje de medición; el
  H1 todavía no lo entrega. Aparece en el cap. 3 de Physica.
- **Metrópoli (Physica cap. opcional)** existe en escena (`E8`) pero no en el camino
  crítico del Arco I.

---

## 7. Aparcado

- **Bitland** (campaña 4): PROPOSED en diseño, sin código. El runtime es un
  `placeholderRuntime` con `status: 'planned'`. No se trabaja sobre Bitland hasta
  que un ADR cierre el trabajo de Ohmdal como `CANON` y eleve Bitland a
  `in-progress` con un primer hito concreto.
- **Arithmos** (campaña 5): igual que Bitland.
- **Ciclos II de cada mundo** y **Proyectos Integradores** (Tipo 3 / Tipo 4): viven
  en el GDD de campañas y en el doc de cruces, pero su implementación se decide
  tras cerrar el Ciclo I de Ohmdal.

---

## 8. Forma de trabajo

Un hito por vez, y un hito es algo que se puede abrir en el navegador y jugar cuando
termina.

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm test         # los 88 archivos de tests/
npm run verify   # build + tests + gate de dialecto y spoilers (requiere bash)
```

Ciclo:

1. Implementar.
2. `npm run build` y `npm test` en verde.
3. Verlo funcionando en el navegador.
4. Proponer el commit a Manuel y esperar su ok.

Si algo de esto se saltea, está mal. Reglas duras en
[`CLAUDE.md`](CLAUDE.md) y [`AGENTS.md`](AGENTS.md).

---

## 9. Cómo parar y preguntar a Manuel

- Decisiones de diseño (qué dice un personaje, cómo se siente un puzzle, qué va en
  pantalla).
- Adopción de dependencias o librerías nuevas.
- Cambios de arquitectura (motor, runtime, bundler).
- Cambios a docs `CANON` o nivel 0–1.
- Promover cualquier doc PROPOSED a CANON.
- Cualquier commit.

Lo técnico se resuelve y se sigue.
