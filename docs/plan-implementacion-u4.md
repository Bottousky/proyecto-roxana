# Proyecto Roxana — Plan de implementación: Unidad 4 (greybox)
# Hitos para ejecutores según `estandar-implementacion.md`

**Versión:** 1.0 · **Guion fuente:** `unidad-4-terrazas.md` (v0.2 — diálogos finales, copiar TEXTUAL)
**Base:** todo lo construido en U1+U2+U3. Patrones: puzzles con modelo puro (`src/puzzles/*Model.ts` + tests), `ohmProbe`/piedras/gauges en `common.ts`, salas como datos en `rooms.ts`, `showEnd(opts)`, `setAmbience`, entradas en `entries.ts`.
**Reglas:** las de siempre + la matemática de `unidad-4-terrazas.md` §A.3 es canon (verificada): contradicción ⇒ frenar y reportar.

| Hito | Contenido | Ruteo sugerido |
|---|---|---|
| T0 | flags + proyector módulo 4 | mecánico |
| T1 | las salas de las Terrazas + NPCs + ambience | estándar |
| T2 | **modo brazos de Ohm** (common.ts) + Puzzle 1: los escalones | delicado (crea patrón) |
| T3 | Puzzle 2: el reparto justo | estándar |
| T4 | Puzzle 3: la Piedra Única | estándar |
| T5 | **página de predicción** (Bitácora) + Puzzle 4: la Escalera | delicado (crea patrón) |
| T6 | Bitácora + cierre + gancho U5 | estándar |

### T0 — Flags U4 + módulo cuatro
`src/state.ts`: agregar los 11 flags de `unidad-4-terrazas.md` §8. `rooms.ts` (aula): con `unit3Completed && !playedUnit4Intro`, el proyector reproduce el módulo cuatro (guion §1, textual) y setea `playedUnit4Intro`; re-interacción: «Mida dos veces. Toque una.». No romper estados U1/U2/U3.
**Aceptación:** secuencia una vez; saves U3 compatibles; build verde.

### T1 — Las salas de las Terrazas
`rooms.ts`: puerta «Camino a las Terrazas» en la plaza (visible `unit3Completed`; baja del lado de la Forja). Salas greybox: `terraces_top` (ladera escalonada, la Guardiana junto a la compuerta), `terraces_mid` (dos terrazas: alta encharcada, baja reseca), `terraces_mural` (el muro grabado maraña = piedra), `terraces_aqueduct` (el acueducto de tres niveles bajando al lago). Gating en orden: mid abre con `solvedVoltageSteps`, mural con `solvedFairSplit`, aqueduct con `solvedSingleStone`. Diálogo de presentación del canal alto (guion §2, textual, hasta el modo brazos de Ohm) la primera vez → `metGuardiana`. NPCs por flags (Guardiana presente; Edda y Lumen acompañan; Ohm). Cada banco: placeholder `// TODO(T2..T5)`. `audio.ts`: ambience `terraces` (variación serena, con agua) en el onEnter de las 4 salas.
**Aceptación:** flujo caminable; NPCs visibles por flags; ambience suena.

### T2 — Modo brazos de Ohm + Puzzle 1: los escalones
`src/puzzles/common.ts` (extensión RETROCOMPATIBLE — crea patrón para U5): **modo brazos** reutilizable — `ohmArms(puntos, getEmpuje)`: el jugador elige dos puntos y Ohm reporta el escalón (diferencia de empuje) entre ellos, al estilo `ohmProbe` pero entre pares. Nuevo `src/puzzles/steps.ts` + `stepsModel.ts` + `tests/t2-steps.test.ts`:
- Banco (guion §2): vuelta completa, manantial Empuje 16 → fila marrón+marrón+roja+amarilla → tierra. Modo brazos (abrazar manantial / cada piedra / la vuelta entera) + modo río parado.
- Matemática §A.3: río 2; escalones 2,2,4,8; suma de la vuelta = 0; río igual en toda la fila.
- Las 4 experiencias del guion §2 con diálogos textuales (la cuenta de Edda «Dos, dos, cuatro, ocho… son dieciséis», el «empuje y río NUNCA fueron la misma cosa», la deuda cero, el cierre de la Guardiana).
- Resuelto al vivir las 4 → `solvedVoltageSteps`, `notifyNewEntry('Los escalones')`, práctica.
- Tests: escalones exactos, suma=0, río constante, conversión empuje/río.

### T3 — Puzzle 2: el reparto justo
`src/puzzles/fairsplit.ts` + modelo + tests. Banco (guion §3): dos terrazas en fila, Empuje 12, una piedra por terraza, aguja de empuje recibido (alta zona verde 8, baja zona verde 4), Ohm modo brazos. Comportamiento §A.3: piedras iguales = mitad/mitad (no cumple); solución A (roja+marrón, río 4) y B (amarilla+roja, río 2) cumplen 8/4. Diálogos textuales (la equivalencia de Ohm, las dos soluciones, la Guardiana tocando una piedra). Validación por condiciones: alta=8 y baja=4. Resolver → `solvedFairSplit`, `notifyNewEntry('El reparto del empuje')`.
**Aceptación:** tests: A y B válidas, iguales inválida, divisor exacto; ≥2 soluciones.

### T4 — Puzzle 3: la Piedra Única
`src/puzzles/singlestone.ts` + modelo + tests. Banco (guion §4): red armable a la izquierda (paralelo de dos, o serie+paralelo), engaste de una piedra a la derecha, Ohm parado en el manantial mide el río de cada lado. Equivalencias §A.3: roja∥roja=marrón, amarilla∥amarilla=roja, gris∥gris=amarilla, marrón+(roja∥roja)=roja, roja+(amarilla∥amarilla)=amarilla. Resuelto al encontrar ≥2 equivalencias correctas (Ohm «no distingo»). Diálogos textuales (Edda/Ohm «una red es una piedra que todavía no terminaste de mirar», la Guardiana). → `solvedSingleStone`, `notifyNewEntry('La Piedra Única')`.
**Aceptación:** tests: el cálculo de equivalente (serie suma, dos iguales en paralelo = mitad) exacto para los 5 casos; Ohm distingue/no-distingue correctamente.

### T5 — Página de predicción + Puzzle 4: la Escalera (evento mayor)
`src/ui/bitacora.ts` (o donde viva la Bitácora): **página de predicción** reutilizable — input numérico del jugador + comparación con lo medido + sello «PREDICHO Y MEDIDO: IGUALES». Diseñarla para que U5 la reuse. Nuevo `src/puzzles/ladder.ts` + `ladderModel.ts` + tests. Banco (guion §5): el acueducto manantial(16)→tramo roja→terraza1(amarilla)→tramo roja→terraza2(roja); herramienta de plegado por etapas con la Piedra Única (muestra cada equivalente); la página de predicción (input «empuje al fondo»); botón «Abrir el agua» habilitado solo con predicción cargada.
- Matemática §A.3 VERIFICADA: plegado terraza2=roja → rama=amarilla → terraza1: amarilla∥amarilla=roja → total amarilla → río 4 → terraza1=8, terraza2=**4**. Predicción correcta 4.
- Predicción exacta → `predictionExact` + sello IGUALES; errada → no castiga, muestra esperado/medido, re-predice (`predictionAttempted`).
- Segunda solución (tramos amarilla, t1 gris, t2 amarilla) válida; banco acepta toda config que dé t1=8, t2=4.
- Diálogos textuales del guion §5 (Edda inventa la predicción, el plegado, la resolución con la Guardiana/Ohm/Lumen, el mosaico). Resolver → `solvedLadder`, `valleyRestored`, `learnedKVL`, openBitacora a la entrada formal, salas de Terrazas «regadas» (floor/wall por `valleyRestored`).
**Aceptación:** tests: plegado da terraza2=4 (un cuarto); predicción 4 correcta, otra incorrecta; segunda solución válida; Empuje distinto mantiene proporción.

### T6 — Bitácora, cierre y gancho al Faro
`src/content/entries.ts`: las 4 entradas del guion §7 (ids `los-escalones`, `reparto-empuje`, `la-piedra-unica`, `la-escalera`), dos capas, formal con `learnedKVL`. `rooms.ts`: cierre §6 textual (Edda/Guardiana/Ohm; el beat mudo de Ohm ante el Faro, su pecho parpadea una vez) → `unit4Completed` + `showEnd` («Fin de la Unidad 4 — “La vuelta completa”», resumen con predicción exacta sí/no y entradas, teaser del Faro que late, Continuar → hall).
**Aceptación:** E2E desde save U3-completa hasta `unit4Completed`; grep de «Kirchhoff|tensión|divisor|equivalente|caída de tensión» fuera de capa formal = 0.
