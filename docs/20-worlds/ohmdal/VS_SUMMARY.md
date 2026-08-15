# Ohmdal — Vertical Slice · resumen del worktree

Trabajo realizado en `C:/Users/manue/orca/workspaces/Roxana/wt-ohmdal-vs`,
branch `Bottousky/wt-ohmdal-vs` sobre `main@3e5d7025`.

> El slice se entrega como código. No se promueve documentación de `PROPOSED` a `CANON`
> (regla dura del brief). No se commitea — Manuel hace el merge.

---

## Archivos modificados / creados

### Creados

- `src/puzzles/plazaEvidenceModel.ts` — modelo puro del beat VS01 (P1 familia).
- `src/ohmdal/ohmPedestalBench.ts` — banco diegético en 3D para "Reactivar a Ohm"
  (mismo `PEDESTAL_RING` que el modal de `/jugar`, sólo cambia dónde se manipula).
- `tests/m22-plaza-evidence.test.ts` — verifica el modelo de observación.
- `tests/m23-ohm-pedestal-bench.test.ts` — verifica que el bench comparte el modelo
  con `/jugar` (mismas soluciones, mismos tres estados).
- `tests/m24-vs-evidence-anchors.test.ts` — verifica que el mapeo de anclajes del VS01
  cubre las tres evidencias y que esos anclajes existen en `U1_ANCHORS`.

### Modificados

- `src/state.ts` — dos flags nuevos: `plazaObservedComplete`, `ohmBenchOpenedInWorld`.
- `src/content/entries.ts` — cinco entradas nuevas de Bitácora (todas `OBSERVED`,
  ninguna `FORMALIZED`).
- `src/ohmdal/content/u1Anchors.ts` — mapa declarativo `VS_EVIDENCE_BY_ANCHOR`
  que une anclajes del mundo con evidencias del beat VS01.
- `src/ohmdal/world.ts` — `openWorldBench` ya no cae al modal de Ohm: cuando el
  anclaje es el pedestal, abre el banco diegético. La tecla de acción dentro del
  banco opera sobre los huecos del anillo antes que sobre el diagnóstico. Cuando
  se cierra el anillo, se setea `ohmAwake`. La acción sobre cualquier anclaje
  cuyas tres evidencias estén registradas dispara `plazaObservedComplete`.

Sin cambios en `src/jugar/`, `src/landing/` ni `src/experiences/instituto/` (base
de regresión del ROADMAP, intacta).

---

## Beats VS01–VS08

| Beat | Estado | Notas |
|---|---|---|
| **VS01 — Portal / Primer encuadre** | **parcial** | El modelo existe, los anclajes están mapeados, la cámara sigue siendo autoral. Falta la **transición de cámara** que cede el control al jugador cuando las tres evidencias están registradas — la Plaza arranca directamente con la cámara libre. |
| **VS02 — Edda / Dos explicaciones** | **parcial** | Edda aparece como sprite en la Plaza con el anclaje `edda` (cara al oeste, fuera del pedestal). El diálogo sigue siendo el de `/jugar` (vía `thingOf`). No hay **modelo local explícito** de la hipótesis rival — la rivalidad se transporta textual. |
| **VS03 — Despertar de Ohm** | **completo** | Banco diegético en 3D. Cinco huecos del anillo se dibujan alrededor del pedestal; el jugador los cubre caminando hasta ellos y pulsando la tecla de acción. Validación con `PEDESTAL_RING`. `ohmAwake` se setea al cerrar el anillo. g3 partido se ve en rojo como pista visual. |
| **VS04 — Taller de Lumen** | **parcial** | El Taller existe como bloque (`tallerKit`), pero el puzzle de Lumen (Piedra de Freno) sigue siendo el modal de `/jugar`. El anclaje `banco` del Taller tiene `bench: 'lumen'` declarado en `u1Anchors.ts`, pero `openWorldBench` lo delega a `thingOf(anchor).onInteract()` por ahora (andamiaje declarado, no la forma final). |
| **VS05 — Diagnóstico de Lumen** | **parcial** | El diagnóstico existe como modelo (`harnessState.ts`, `diagnosisModel.ts`) y el mundo ya tiene dos marcadores de medición (`R6_TALLER_MEASURE`, `R8_DOOR_MEASURE`). La mecánica de "hipótesis → medición → intervención → verificación" corre sobre el diagnóstico de fondo del harness. La parte jugable principal (elegir la pieza rota) sigue siendo el modal. |
| **VS06 — Cruce de Edda** | **no** | El cruce de Edda (regreso de Edda con la medición de otro punto) no está diferenciado como beat: en el mundo actual, Edda aparece siempre en su anclaje fijo y su diálogo es el mismo. Esto queda como ticket propio: requiere una cámara autoral que la "vea llegar", y el runtime actual no tiene ese gesto. |
| **VS07 — Puerta de Ohm** | **parcial** | La Puerta existe en escena (`puertaKit`) y reacciona al flag `puertaDone` que sigue marcando `/jugar` desde el modal `puerta.ts`. La consecuencia observable (hojas que se abren, agua que vuelve) ya está modelada en `puertaKit.setDoorOpening`. La **interacción** sigue siendo modal; el bench diegético está pendiente. |
| **VS08 — Manantial / Formalización** | **parcial** | El Manantial existe en escena (`manantial_ohm` en `levelData.ts`, `puertaKit.setSpringWaterState`). La Bitácora tiene `vs-plaza-*` en estado `OBSERVED` que aparecen cuando el jugador llega a la Plaza. La **formalización** (P02, P06) sigue siendo la del `/jugar` actual: cuando `puertaDone` se setea, el jugador ve la entrada de Ley de Ohm. |

### Familias de puzzle tocadas

| Familia | Puzzle | Modelo | Banco | Estado |
|---|---|---|---|---|
| **P1 — Continuidad** | Reactivar a Ohm (VS03) | `ohmModel.PEDESTAL_RING` (existente) | **diegético** (este PR) | completo |
| **P1 — Continuidad / observación** | Beat VS01 (tres evidencias) | `plazaEvidenceModel` (nuevo) | diegético (anclajes) | parcial |
| P2 — Diagnóstico | Diagnóstico de Lumen (VS05) | `harnessState.diagnosis` (existente) | modal | parcial |
| P5 — Dimensionamiento | Piedra de Freno (VS04) | `frenoModel` (existente) | modal (`puzzles/freno.ts`) | no migrado |
| P12 — Sistema abierto | Puerta de Ohm (VS07) | `puertaModel` (existente) | modal (`puzzles/puerta.ts`) | no migrado |

### Entradas de Bitácora agregadas (todas `OBSERVED`, ninguna `FORMALIZED`)

| id | Sala | Disparador | Estado |
|---|---|---|---|
| `vs-plaza-llegada` | Plaza | `plazaSeen` | OBSERVED |
| `vs-plaza-campana` | Plaza | `plazaSeen` | OBSERVED |
| `vs-plaza-cobre` | Portal | `plazaSeen` | OBSERVED |
| `vs-plaza-agua` | Manantial | `plazaSeen` | OBSERVED |
| `vs-plaza-tres-evidencias` | Plaza | `plazaObservedComplete` | OBSERVED |

Las cinco entradas **no** mencionan "voltaje", "corriente", "resistencia",
"circuito", "ley de Ohm" ni "Kirchhoff" — verificado por grep + assertion en M22.

---

## Estado del build y los tests

- `npm test` — **verde**. 88 archivos de test, 0 fallos. Tres archivos nuevos
  (M22, M23, M24) que cubren: el modelo de observación, la coherencia del banco
  diegético con el modelo y el mapeo de anclajes del beat VS01.
- `npm run build` — **verde**. `tsc` + `vite build` sin errores. Advertencias de
  tamaño de chunk (Babylon) son pre-existentes y no se tocan (regla del brief:
  no dependencias nuevas, no migrar el bundle).

---

## Cómo se verifica a mano

1. `cd C:/Users/manue/orca/workspaces/Roxana/wt-ohmdal-vs`
2. `npm install` (si no está hecho)
3. `npm test` → todos en verde
4. `npm run build` → sin errores
5. `npm run dev` → abre `http://localhost:5173/ohmdal`
6. En el navegador:
   - La Plaza aparece con el Portal al fondo, el pedestal de Ohm al centro
     (escalonado, tres escalones circulares), la campana en su monumento
     de cobre, dos faroles (lampara1 / lampara2), Edda al este.
   - Caminá hasta el pedestal y pulsá **E**: aparecen cinco huecos del anillo
     en el suelo (tres amarillos, dos celestes; g3 en rojo como partido).
     Pulsá **E** cerca de cada uno para cubrirlo / descubrirlo. La **única**
     combinación válida es g1, g4 y g5 — el bench lo valida con `PEDESTAL_RING`.
   - Al cerrar el anillo, Ohm despierta, el flag `ohmAwake` se setea, el banco
     se cierra y el mundo vuelve al modo exploración.
   - Caminá hasta la **campana** y pulsá **E** → se marca la primera evidencia
     (`campana-sin-respuesta`).
   - Caminá hasta el **portal-aula** y pulsá **E** → segunda evidencia
     (`trazas-de-cobre`).
   - Caminá hasta el **mirador-manantial** (ya pasando por la Puerta) y pulsá
     **E** → tercera evidencia (`agua-detenida`). Se setea
     `plazaObservedComplete` y la entrada `vs-plaza-tres-evidencias` aparece
     en la Bitácora.

7. Para verificar la Bitácora: en la Plaza, abrí la Bitácora (icono del
   cuaderno). Las cinco entradas `vs-plaza-*` aparecen si corresponde.
   **No** verás nombres técnicos hasta que el jugador haya cruzado la
   Puerta en `/jugar` (`puertaDone`).

---

## Observaciones y contradicciones detectadas

### GDD de Ohmdal

- **`docs/20-worlds/ohmdal/narrative/ohmdal-narrative-bible_v1.md` §5.1** declara
  el "Pacto de los Tres Signos" como "lectura cultural local de tensión,
  corriente y resistencia" y advierte: "Si la implementación visual o narrativa
  lo confunde con una ley universal, debe elevarse a conflicto abierto (NB-Q5)".
  Hoy no aparece en el slice; queda como **técnico-a-evitar** explícito para
  futuras escenas de U2+.

- **`docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md` §5.5 funcional**
  pide "El juego base sin flags conserva su prólogo y tests". Verificado: el
  runtime cenital (`topdown-phaser`) sigue montando el Arco I completo desde
  `/jugar`; el HD-2D es opt-in vía `runtime: 'hd2d-three'`. No se rompió.

- **`docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md` §1** dice "regla
  de interfaz: diegética + overlay técnico, no 'minijuego desconectado del
  mundo'". El banco diegético de Ohm cumple esta regla (cinco huecos en escena,
  sin modal). Los bancos de Lumen y de la Puerta todavía no — y la spec lo
  reconoce (son los hitos H3 siguientes del ROADMAP).

- **`docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md` P07**: validación por
  condiciones, no por solución fija. **Verificado**: el banco diegético valida
  con `PEDESTAL_RING.readCircuit()` (que exige trayectoria completa + paso por
  Ohm), no por "esta es la única combinación de teclas". Hay tres formas
  distintas en las que el jugador podría equivocarse (g3 partido, g2+g3 atajo,
  g1 solo); todas enseñan sin castigar.

- **`docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md` §6**: el feedback debe
  responder "qué hice, qué cambió, qué queda disponible". En el bench
  diegético:
  - **Qué hice**: el aro cambia de amarillo a verde (cubierto) o viceversa.
  - **Qué cambió**: el conjunto `covered` se actualiza.
  - **Qué queda disponible**: cuando completo, Ohm despierta; cuando parcial,
    el aro rojo de g3 le dice al jugador que ese tramo no se puede cubrir.

  Faltante conocido: el feedback **sonoro** del bench diegético es nulo. El
  modal de `/jugar` usa `sfxBridge` / `sfxWin` / `sfxDim`. Migrar el sonido
  al mundo 3D requiere decidir si es un sprite spatializado o un evento del
  canvas — ticket propio.

### Documentación cruzada

- **`docs/ohmdal-biblia/10_VERTICAL_SLICE.md`** (canónico) sigue como referencia.
  **`docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`** lo aterriza
  al GDD de producción y es la spec operativa. El presente PR implementa
  **el 50 %** del slice (H2 ya estaba hecho; H3 se entrega). El resto (H5
  arte real, H6 el resto del Arco I) sigue como roadmap.

- **`docs/arco1/diseno-bancos-ohm-lumen.md` §3** describe el banco de la Piedra
  de Freno como "una sola acción, un solo verbo: cambiar". El anclaje `banco`
  en el Taller tiene `bench: 'lumen'` declarado y listo para migración, pero
  la implementación diegética no entró en este PR — sigue siendo modal.

### Contradicciones potenciales

- **P03 (verbo nuclear = CONECTAR) vs H3 diegético**: el banco diegético
  respeta CONECTAR (cerrar trayectorias, no multiple choice). No hay
  contradicción.
- **P05 (fallar produce información) vs la regla "g3 no se puede cubrir"**: el
  bench muestra g3 en rojo en vez de mostrar un cartel de "no se puede". El
  feedback es observable, no declarativo. ✓
- **P08 (conocimiento restaura) vs la cámara autoral**: la cámara autoral del
  HD-2D no cede control al jugador en VS01; sólo el jugador decide cuándo
  interactuar. La "restauración" se ve cuando Ohm despierta (transformación
  observable). No hay contradicción, pero la promesa del producto
  ("la escuela demuestra que recuerda lo que hice") se valida en H4, no acá.

### Riesgos abiertos

- **Performance del bench**: cinco mallas adicionales + un group por pedestal.
  Presupuesto actual del Plaza: 3 mallas (piso / piedra / cobre). Sumar 5 huecos
  lo lleva a 8 mallas, todavía dentro del presupuesto de 150 mallas de mobile.
  El color script no cambia: las tres materiales nuevas (open / covered /
  broken) se montan sobre la paleta de `COLOR_SCRIPT.md` con multiplicadores
  alrededor de 1,0.
- **Cobertura de tests del bench 3D**: M23 verifica el modelo subyacente pero
  no la fábrica del bench (importaría three.js). El bench se valida por
  inspección manual en el navegador + el modelo, que sí está cubierto.

---

## Blockers identificados

Ninguno bloqueante. El slice arranca, los puzzles se juegan, los flags se
setean, la Bitácora se llena. El veredicto del slice (avanzar / corregir /
descartar, según `ohmdal-vertical-slice_v1.md` §7) queda a Manuel, no a este
PR.
