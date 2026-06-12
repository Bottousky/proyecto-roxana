# Proyecto Roxana — Plan de implementación: Unidad 3 (greybox)
# Hitos para ejecutores según `estandar-implementacion.md`

**Versión:** 1.0 · **Guion fuente:** `unidad-3-forja.md` (v0.2 — diálogos finales, copiar TEXTUAL)
**Base:** todo lo construido en U1+U2. Patrones de referencia: puzzles con modelo puro (`src/puzzles/branchesModel.ts` + tests), `ohmProbe`/piedras/fusibles/gauges en `src/puzzles/common.ts`, salas como datos en `src/game/rooms.ts`, `showEnd(opts)`, `setAmbience`, entradas en `src/content/entries.ts`.
**Reglas:** las de siempre (`plan-implementacion-u2.md` §0) + la matemática de `unidad-3-forja.md` §A.3 es canon: contradicción ⇒ frenar y reportar.

| Hito | Contenido | Ruteo sugerido |
|---|---|---|
| F0 | flags + proyector módulo 3 | mecánico |
| F1 | las 4 salas de la Forja + NPCs + ambience | estándar |
| F2 | termómetro/grosores (common.ts) + Puzzle 1 | delicado (crea patrón) |
| F3 | Puzzle 2: enfermería | estándar |
| F4 | Puzzle 3: Canal Largo | estándar |
| F5 | Puzzle 4: la Forja completa (evento mayor) | estándar+ |
| F6 | Bitácora + cierre + gancho U4 | estándar |

### F0 — Flags U3 + módulo tres
`src/state.ts`: agregar los 10 flags de `unidad-3-forja.md` §8 a `Flags` y `DEFAULT_FLAGS`. `src/game/rooms.ts` (aula): con `unit2Completed && !playedUnit3Intro`, el proyector reproduce el módulo tres (guion §1, textual, incluida la silueta del fusible y la reacción) y setea `playedUnit3Intro`; re-interacción posterior: la línea «Abríguese…» del guion. No romper los estados U1/U2 del proyector.
**Aceptación:** secuencia una sola vez; saves U2 compatibles; build verde.

### F1 — Las salas de la Forja
`src/game/rooms.ts`: puerta «Camino a la Forja» en la plaza (visible `unit2Completed`; el camino sale cerca de donde Lumen tocó el cobre). Salas greybox: `forge_yard` (patio: martillos al fondo, la Forjadora, la Consejera), `forge_infirmary` (pared de fusibles con velitas, Lumen), `forge_longchannel` (el canal de doscientos pasos, el horno lejano), `forge_hall` (Martillo/Fuelle/Lumbre con placas, tablero de bus). Gating en orden: infirmary abre con `solvedWarmChannel`, longchannel con `solvedFuseInfirmary`, hall con `solvedLongChannel` (líneas de puerta: si el guion no las da, `// TODO(guion)` + placeholder). Diálogo de presentación del patio (guion §2, textual, hasta «Modo nuevo disponible…») la primera vez → `metForjadora`. Cada banco: placeholder `// TODO(F2..F5)`. `src/audio.ts`: ambience `forge` (variación del de castle con percusión grave) en el onEnter de las 4 salas.
**Aceptación:** flujo caminable completo; NPCs visibles por flags; ambience suena.

### F2 — Termómetro y grosores + Puzzle 1: el canal tibio
`src/puzzles/common.ts` (extensión, retrocompatible): **termómetro de canal** (widget reutilizable: dado un río y una tolerancia de grosor devuelve frío/tibio/caliente/al rojo según §A.3 y lo muestra — niveles con color y texto, sin números de temperatura) + **selector de grosor** (angosto 2 / medio 4 / ancho 8) + **canal que se corta** a la tercera insistencia al rojo (patrón del fusible: aviso, vibración, corte; reset diegético con comentarios). Nuevo `src/puzzles/warmth.ts` + `warmthModel.ts` + `tests/f2-warmth.test.ts`: las 4 experiencias del guion §2 (martillo al rojo / fuelle tibio / canal viejo frío / duplicar = salto de dos niveles), diálogos textuales, resuelto al vivir las 4. Integrar en `forge_yard` (resolver ⇒ `solvedWarmChannel`, `notifyNewEntry('El peaje')`, modo práctica).
**Aceptación:** tests del modelo (bandas del termómetro exactas, salto cuadrático); las 4 experiencias en cualquier orden.

### F3 — Puzzle 2: la enfermería
`src/puzzles/infirmary.ts` + modelo + tests. Tres máquinas (ríos 1/2/4, canales angosto/medio/ancho), fusibles 1/2/4/8, botón «Arrancar la Forja» (pico = río+1). Reglas y diálogos del guion §3, textual: fusible ≤ pico muere joven; demo guiada del fusible gordo (falla simulada en A: el canal muere antes — `burnedChannelDemo`); correctos 2/4/8 ⇒ ritmo estable ⇒ `solvedFuseInfirmary`, `notifyNewEntry('El mártir y el margen')`.
**Aceptación:** tests (joven/gordo/correcto por máquina); la demo no castiga ni bloquea.

### F4 — Puzzle 3: el Canal Largo
`src/puzzles/longchannel.ts` + modelo + tests. Cristal 4/8/16, **fila de piedras** (se suman, U2), canal angosto (tolera 2) con termómetro en 3 puntos, placa ENTREGA 16. Caminos del guion §4: A (4+marrón: entrega ✓ pero al rojo; tercera insistencia corta el canal; la Forjadora reempalma con sus 3 comentarios textuales), B (16+gris+gris: frío) y C (8+amarilla: tibio) válidos; si el jugador encuentra B y C, línea de Ohm «Misma entrega. Peaje distinto…». Resolver (B o C) ⇒ secuencia de la Forjadora (frase central de la unidad, textual) ⇒ `solvedLongChannel`, `notifyNewEntry('La Entrega')`.
**Aceptación:** tests: A entrega correcta pero inválida por canal; B y C válidas; entrega = empuje × río verificada.

### F5 — Puzzle 4: la Forja completa (evento mayor)
`src/puzzles/forge.ts` + modelo + tests. Bus 8/16; por máquina (Martillo 32 / Fuelle 16 / Lumbre 8): fila de piedras, **grosor con stock compartido** (1 ancho, 2 medios, 2 angostos: asignar un canal lo quita del stock), fusible; pico río+1; Tronco ≤ 8. **Validación por condiciones** (§5 del guion): entregas exactas + canales ≤ caliente en pico + fusibles según regla de la enfermería + Tronco ok. Canónica: Empuje 8, roja/amarilla/gris, ancho/medio/angosto, fusibles 8/4/2. Con Empuje 16 NO hay solución (Lumbre pediría río ½) — test que lo verifique iterando. Resolución: la Forja canta (sfx de compás: martillo+fuelle+lumbre con primitivos de audio.ts) + diálogos finales textuales (Forjadora, el inventario de jornales de la Consejera con sus números 32/16/8/56/9, «Anotado.» de Ohm) + Bitácora arde (openBitacora a la entrada formal) ⇒ `solvedForgeNetwork`, `forgeRestored`, `learnedPower`. Post-resolución: salas de la Forja cálidas (floor/wall por flag) y ambience con el compás.
**Aceptación:** tests (canónica válida, ≥1 alternativa por margen válida, Empuje 16 inválido en todas las combinaciones, stock respetado); fallos = información.

### F6 — Bitácora, cierre y gancho a las Terrazas
`src/content/entries.ts`: las 4 entradas del guion §7 (ids `el-peaje`, `martir-margen`, `la-entrega`, `el-jornal`), dos capas, formal con `learnedPower`, bloque condicional `burnedChannelDemo`. `rooms.ts`: cierre §6 textual (Edda/Forjadora/Ohm sobre las Terrazas) ⇒ `unit3Completed` + `showEnd` («Fin de la Unidad 3 — “El precio del río”», resumen con jornales y canales cortados sí/no, teaser Terrazas, Continuar → hall).
**Aceptación:** E2E desde save U2-completa hasta `unit3Completed`; checklist §3 del plan U2 adaptada (grep de «potencia|Joule|energía|vatio» fuera de capa formal = 0).
