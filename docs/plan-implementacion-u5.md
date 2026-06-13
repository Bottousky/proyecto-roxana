# Proyecto Roxana — Plan de implementación: Unidad 5 (greybox)
# Hitos para ejecutores según `estandar-implementacion.md` — cierre del Arco I

**Versión:** 1.0 · **Guion fuente:** `unidad-5-faro.md` (v0.2 — diálogos finales, copiar TEXTUAL)
**Base:** todo lo construido en U1–U4. Patrones: puzzles con modelo puro (`*Model.ts` + tests), piedras/ohmProbe/ohmArms/gauges en `common.ts`, la **página de predicción** en `src/ui/prediction.ts` (U4), salas como datos en `rooms.ts`, `showEnd(opts)`, `setAmbience`, entradas en `entries.ts`.
**Reglas:** las de siempre + la matemática de `unidad-5-faro.md` §A.3 es canon (producto puro, enteros): contradicción ⇒ frenar y reportar.
**Novedad técnica (§A.6):** el banco con **tick de simulación** (reloj que anima el Estanque, la aguja que decae, el latido). Crear el tick reutilizable y limpiarlo al cerrar el banco (sin fugas de timers).

| Hito | Contenido | Ruteo sugerido |
|---|---|---|
| L0 | flags + proyector módulo 5 | mecánico (medium) |
| L1 | las salas del Faro + NPCs + ambience | estándar (medium) |
| L2 | **Estanque + tick de simulación** (common.ts) + Puzzle 1: la chispa que se queda | delicado (high) |
| L3 | Puzzle 2: el río que se duerme | high |
| L4 | Puzzle 3: el Reloj | high |
| L5 | Puzzle 4: el latido (evento mayor) | high |
| L6 | Bitácora + **la noche de Ohmdal** (cierre del Arco I) + gancho Arco II | estándar+ (high — es el tráiler) |

### L0 — Flags U5 + módulo cinco (medium)
`src/state.ts`: agregar los 13 flags de `unidad-5-faro.md` §7. `rooms.ts` (aula): con `unit4Completed && !playedUnit5Intro`, el proyector reproduce el módulo cinco (guion §1, textual) y setea `playedUnit5Intro`; re-interacción: «Tenga paciencia. El tiempo es parte del circuito.». No romper estados U1–U4.
**Aceptación:** secuencia una vez; saves U4 compatibles; build verde.

### L1 — Las salas del Faro (medium)
`rooms.ts`: puerta «Camino al Faro» en la plaza (visible `unit4Completed`; baja al lago, del lado de las Terrazas). Salas greybox: `lighthouse_hall` (sala de máquina muerta, lente lustrada, el Farero), `lighthouse_bench` (el taller del Farero), `clock_tower` (la torre del Reloj parado), `lighthouse_lantern` (la cima, la lente sobre el lago negro). Gating en orden: bench abre con `solvedStoredSpark`, clock_tower con `solvedSleepingRiver`, lantern con `solvedClock`. Diálogo de presentación del Farero (guion §2, textual, hasta «…todavía no sabían su nombre.») la primera vez → `metFarero`. NPCs por flags (el Farero; la Consejera aparece en el hall; Edda, Lumen, Ohm acompañan). Cada banco: placeholder `// TODO(L2..L5)`. `audio.ts`: ambience `lighthouse` (lago, trueno lejano, faro) en el onEnter de las 4 salas.
**Aceptación:** flujo caminable; NPCs por flags; ambience suena.

### L2 — Estanque + tick de simulación + Puzzle 1: la chispa que se queda (high)
`src/puzzles/common.ts` (extensión RETROCOMPATIBLE — crea el patrón del tick para L3–L5):
- **Estanque** reutilizable: pieza con nivel visible (0–100%) que se llena/vacía; `tankSVG()/setTankLevel(scope, pct)`.
- **Tick de simulación** reutilizable: un helper que corre un callback por frame (`requestAnimationFrame`) con delta de tiempo, y se **cancela limpio al cerrar el banco** (el bench debe exponer un hook de cleanup o el helper devuelve un `stop()`). Sin fugas: si el banco se cierra a mitad de un llenado, el timer muere.
Nuevo `src/puzzles/storedspark.ts` + `storedsparkModel.ts` + `tests/l2-storedspark.test.ts`:
- Banco (guion §2): fuente, canal con llave, Estanque, lámpara. Acciones: cargar (abrir la llave → el estanque se llena por tiempo real, la lámpara apenas brilla), cortar el camino (cerrar la llave), observar.
- Experiencias del guion §2 con diálogos TEXTUALES: (1) cargar y cortar → la lámpara sigue brillando ~3s mientras el estanque se vacía (recrea la anomalía de la U2) + Edda «Ahí está. EXACTAMENTE eso...» + Ohm «Camino: cortado. Chispa: presente...»; (2) medir el canal mientras se carga → río fuerte al principio, muere al llenarse + Ohm «El estanque no es una pared. Es una pared que primero deja pasar, y después se acuerda.»; (3) la Consejera anota la anomalía (textual, «Registro fuera de término... Que conste.») → `consejeraNotedAnomaly`.
- Resuelto al vivir la anomalía → `solvedStoredSpark`, `notifyNewEntry('La chispa que se queda')`, práctica.
- Tests del modelo: el estanque se carga/descarga; el río del canal decae al llenarse; la descarga sin camino dura un tiempo finito.

### L3 — Puzzle 2: el río que se duerme (high)
`src/puzzles/sleepingriver.ts` + modelo + tests. Banco (guion §3): fuente, freno elegible, Estanque elegible (1/2/4), Ohm con la **aguja del río animada en tiempo real** (usa el tick de L2). Botón «Llenar». Matemática §A.3: tiempo de llenado ∝ estanque × freno; la aguja arranca fuerte y decae sola; estanque grande + freno grande tarda más; estanque lleno → río cero. Diálogos textuales (Edda «¡está RESPIRANDO!», Ohm «Tiempo de llenado: estanque por freno...», el Farero). Vivir las experiencias → `solvedSleepingRiver`, `notifyNewEntry('El río que se duerme')`.
**Aceptación:** tests: el tiempo de llenado es proporcional a estanque×freno (orden relativo entre configs); la aguja decae monótona a cero; río cero al llenarse.

### L4 — Puzzle 3: el Reloj (high)
`src/puzzles/clock.ts` + modelo + tests. Banco (guion §4): Estanque con **umbral de volcado** (al llenarse vuelca de golpe y reinicia: un tic), Estanque (1/2/4) y freno (1/2/4/8) elegibles, péndulo que avanza con cada volcado, referencia de tic objetivo (ritmo 4). Tick de simulación. Matemática §A.3: ritmo = estanque × freno; tres soluciones para ritmo 4 (1×4, 2×2, 4×1); ritmo<4 adelanta, ritmo>4 atrasa. Diálogos textuales (el Farero comentando rápido/lento, Ohm «Otro estanque. El mismo tiempo.», el tic justo que oye toda la plaza). Validación por condiciones: ritmo=4. Resolver → `solvedClock`, `clockRestored`, `notifyNewEntry('El tic')`.
**Aceptación:** tests: ritmo = estanque×freno; las tres soluciones de ritmo 4 válidas; adelanta/atrasa correcto; el volcado reinicia el nivel.

### L5 — Puzzle 4: el latido (evento mayor) (high)
`src/puzzles/lighthouse.ts` + modelo + tests. Banco (guion §5): dos caminos sobre el Estanque — **canal de carga** (llenar despacio: freno grande) y **camino de volcado** (descargar de golpe: casi sin freno) — Estanque (1/2/4), frenos por camino, la lente que destella con cada volcado, referencia de latido objetivo (ritmo 8). Tick de simulación. **Asimetría** (lección): llenar despacio / volcar de golpe. Matemática §A.3: ritmo de carga = estanque × freno_carga = 8 (soluciones 4×2, 2×4, 1×8); volcado breve (freno_descarga chico). Diálogos textuales (el Farero con el oído, «Ese. Ese es. …Cuarenta años afinando el oído para esta noche.» y se le llenan los ojos; **el beat de Ohm**: su pecho parpadea al ritmo del Faro, Edda lo ve, «Dato registrado. Sin explicación disponible. …Todavía.»). Resolver → `solvedLighthouse`, `lighthouseRestored`, `learnedCapacitor`, openBitacora a 'el-arco-del-rio' (entrada en L6; id queda). NO dispara aún la noche de Ohmdal (eso es L6, tras la entrada formal).
**Aceptación:** tests: ritmo de carga 8 (tres soluciones); volcado breve requerido; latido demasiado rápido/lento detectado.

### L6 — Bitácora, la noche de Ohmdal y gancho al Arco II (high — es el tráiler)
`src/content/entries.ts`: las 4 entradas del guion §6 (ids `la-chispa-que-se-queda`, `el-rio-que-se-duerme`, `el-tic`, `el-arco-del-rio`), dos capas, formal con `learnedCapacitor`. La entrada mayor `el-arco-del-rio` lista las cinco reglas del arco.
`rooms.ts` + nuevo `src/ui/nightofohmdal.ts` (o dentro de end.ts): **la noche de Ohmdal** — secuencia contemplativa de cierre del Arco I (guion §5 «Resolución»): una pantalla compuesta con los cinco lugares iluminados (greybox: cinco zonas con su luz + etiqueta de la regla que las encendió) + audio en capas + los diálogos finales TEXTUALES (Edda «Cinco lugares. Cinco lecciones…», Lumen dona los fusibles, la Consejera cierra el inventario, Ohm «red de Ohmdal completa… Promesa de la primera lección: cumplida»). Después: el ojo de cristal (gancho Arco II, textual) → `arcOneCompleted`, `sawCrystalEye`, `unit5Completed`. Pantalla de cierre del **arco** (`showEnd` con peso especial): título «Fin del Arco I — “El Río” · Ohmdal, cinco unidades», el ojo de cristal como semilla, Continuar → hall.
**Aceptación:** E2E desde save U4-completa hasta `arcOneCompleted`; grep de «capacitor|RC|carga|descarga» fuera de capa formal = 0; la noche de Ohmdal renderiza los cinco lugares; la pantalla de cierre dice «Arco I».

---

## Después de la U5 (fuera de alcance de este plan)

Con `arcOneCompleted`, Ohmdal v1 está **completo y vendible** (circuitos de DC, 5 unidades). Próximo según la hoja de ruta del autor (jun 2026): pulir el **prólogo**, y luego armar la **web de acceso** (Claude Design). El Arco II (semiconductores) y el Empalme quedan plantados por el ojo de cristal, sin urgencia.
