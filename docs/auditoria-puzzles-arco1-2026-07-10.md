# Auditoría de puzzles — Arco I contra el canon (guia-puzzles.md §3)

Fecha: 10 de julio de 2026. Auditor: Orquestador (Fable 5).
Alcance: los 17 puzzles jugables del Arco I + integración con la Bitácora.
Pendiente de validación del Director antes de implementar cualquier rediseño.

---

## 1. Resultado global

El sistema puzzle + Bitácora está **sano en su núcleo**. Lo que el Director pidió
como valor central del juego ya existe en los mejores puzzles (Castillo, Escalera,
Forja completa) y en la Bitácora entera. Los hallazgos son de **nivelación**: llevar
los puzzles flojos al estándar de los mejores, no rediseñar el sistema.

**Fortalezas verificadas (checklist §3, ítems que pasan en todo el arco):**

- **Modelos condicionales con múltiples soluciones** (ítem canon + CLAUDE.md §5):
  Puerta 3 pares, Reloj 3 combos, Faro 3+ combos, Reparto 3 pares, Canal Largo
  varios, Cadena (empuje × lámparas), Forja combinatoria completa. ✓
- **Bitácora ejemplar** (ítem 11): dos capas, la formal gateada por flags de
  comprensión (`learnedSeriesParallel`, `learnedPower`, `learnedKVL`,
  `learnedCapacitor`); huecos que se completan al vivir el error
  (`burnedSomething`, `burnedTrunkFuse`, `burnedChannelDemo`); preguntas de
  transferencia al mundo real en casi todas las entradas. Nunca anticipa. ✓
- **El error informa sin castigar** (ítem 7): fusible ritual con repuestos,
  demo del fusible gordo, canal que se corta y se repara. El humo completa
  la Bitácora — el error es contenido, no castigo. ✓
- **Vocabulario spoiler gateado** (CLAUDE.md §5): «serie», «paralelo», «nodo»,
  «Kirchhoff», «capacitor» solo aparecen tras el flag de formalización. ✓
- **Consecuencia visible** (ítem 12): cada `solved*` enciende efectos de sala
  (glow/pulse/water/beam) y reacciones de PNJ. ✓
- **Interacción diegética** (R7): los puzzles se abren desde lámparas, canales,
  murales, el reloj, la lente — sin «bancos» genéricos. ✓
- **Identidad mecánica del mundo** (ítem 15): río/piedras/canales/estanques
  forman una gramática coherente que escala de U1 a U5. ✓

**Patrón oro confirmado:** Cadena (`chain.ts`) — 5 fases con predicción
comprometida antes de cada revelación (predecir río → medir → predecir quita →
quitar → restaurar). Escalera (`ladder.ts`) — página de predicción numérica
(«PREDICHO Y MEDIDO: IGUALES»). Ese es el listón.

---

## 2. Hallazgos priorizados

### A1 · ALTA — «Los escalones» (U4, steps) es un tour guiado, no un puzzle

`stepsModel.ts`: `isStepsSolved` = haber medido todo (manantial + 4 piedras +
5 tramos + vuelta completa). **No hay nada roto que arreglar, nada que decidir,
ninguna configuración posible.** Canon §2: «no ser una cinemática interactiva
donde el jugador solo confirma pasos». Es el único puzzle del arco que falla
el ítem 1 (problema del mundo) y el 3 (observar→probar→corregir).

**Propuesta de rediseño (calcar patrón Cadena):**
1. Problema del mundo: la compuerta alta reparte mal — un bancal recibe casi
   todo el empuje y otro casi nada (estado inicial con piedras desordenadas).
2. Predicción comprometida: «¿dónde cae más empuje?» (3 opciones) antes de medir.
3. Medición: la actual (se conserva — es buena).
4. Reparación: reordenar/cambiar las 4 piedras para que las caídas queden en la
   proporción que pide la Guardiana (condición, no solución fija: p. ej.
   «la piedra amarilla debe cobrar el doble que la roja» — múltiples órdenes valen
   porque en serie el orden no cambia las caídas: ESA es la segunda revelación).
5. La vuelta sigue cerrando en 16 en toda configuración → KVL vivida, no contada.

Nivel: **Estándar** (calca `chain.ts` + `stepsModel.ts` existente). Ejecutor: sonnet.

### A2 · ALTA — «El canal tibio» (U3, warmth) revela sin pedir compromiso

Observación pura + un toggle (duplicar el yunque). El salto de dos niveles de
calor (tibio→rojo sin pasar por caliente) es LA revelación de Joule (I²) y hoy
se regala. Falla el ítem 4 (predecir→observar).

**Propuesta mínima:** antes de permitir duplicar el yunque, pregunta de Ohm:
«Si duplico el río, ¿el calor…?» → «sube igual / sube el doble / sube más que
el doble». Reusar `bench-predict` de chain. Una pantalla, tres botones.
Nivel: **Mecánico/Estándar**. Ejecutor: codex o haiku con spec cerrada.

### A3 · MEDIA — U3 sin momento de predicción (enfermería y Canal Largo)

Mecánicamente buenos (margen del fusible; entrega exacta con canal frío), pero
ninguno pide compromiso antes de la revelación:

- **Enfermería:** al primer «arrancar la Forja» con fusibles puestos, predecir
  «¿cuál fusible no sobrevive el arranque?» (o «¿aguantan todos?»).
- **Canal Largo:** antes del primer intento con empuje 16, predecir
  «¿el canal queda frío, tibio o al rojo?».

Micro-predicciones de un click, reusa `bench-predict`. Nivel: **Mecánico**.

### A4 · MEDIA — «El río que se duerme» (U5, sleepingriver): ordenar antes de probar

Ya se elige estanque y freno; falta comprometerse: «con estanque grande y canal
angosto, ¿tarda más o menos que recién?». Una pregunta al segundo intento.
`storedspark` queda como está: es una anomalía-descubrimiento, la observación
ES el puzzle. Nivel: **Mecánico**.

### A5 · MEDIA — Timbre (M8): una sola piedra válida en el camino B

`CORRECT_STONE = 'roja'` — única. La condición real es «río exacto 2 con empuje 4»,
pero la UI solo permite una piedra → una solución. Contradice la regla ≥2 soluciones.

**Propuesta:** camino B con hasta dos engastes en fila → `marrón+marrón` (R=2)
también suena. De paso aplica «frenos en fila se suman» (Cadena) en el mini-banco
de transferencia — exactamente lo que un puzzle de aplicación debe reusar (ítem 18).
Nivel: **Estándar chico** (modelo + test + UI).

### A6 · BAJA — Excepciones conscientes (documentar, no tocar)

- **Enfermería:** fusible correcto único por máquina — justificado: «elegir el
  margen» ES la lección; el sobredimensionado tiene su demo del canal cortado.
- **Freno (U1):** única piedra estable — introductorio; la Puerta enseña la
  relación con 3 pares inmediatamente después.
- Anotar ambas como excepciones justificadas en `guia-puzzles.md` §1 (capas)
  para que futuras auditorías no las reabran.

---

## 3. Plan de hitos propuesto (espera aprobación del Director)

| Hito | Contenido | Nivel | Ejecutor sugerido |
|---|---|---|---|
| P1 | Rediseño «Los escalones» (A1): fases predicción + reparación por proporción | Estándar | sonnet |
| P2 | Micro-predicciones U3/U5 (A2, A3, A4): warmth, infirmary, longchannel, sleepingriver | Mecánico ×4 | codex / haiku |
| P3 | Timbre con dos engastes en B (A5) | Estándar chico | codex |
| P4 | Nota de excepciones en guia-puzzles.md (A6) | Doc | Orquestador |

Textos de predicción y líneas nuevas de PNJ: los escribe el Orquestador en cada
spec (regla CLAUDE.md §5 — el ejecutor no inventa texto).

---

## 4. Ediciones de imagen pendientes (NO ejecutar — registro)

1. **Plaza, umbral sur:** separar visualmente el portal al Instituto (centro,
   x≈420–540) del arco a las Terrazas (sureste, x≈580–690, aparece tras U3).
   La data de escena ya los separa (`roomScenesData.ts`); falta el arco pintado.
   Mientras tanto el acceso a Terrazas se señala solo con label.
2. **Restauración integral Plaza → Taller → Puerta/Manantial** (pedida por el
   Director en la sesión del 10/7): una sola edición final por escena, reuniendo
   todos los elementos y bloqueando el resto como invariante; los efectos
   luminosos siguen en Phaser.
3. Si P1 (escalones) cambia la puesta en escena de la compuerta alta, revisar si
   `terraces_top` necesita retoque del prop pintado (probablemente no: la
   interacción es DOM).

---

## 5. Estado de verificación de esta auditoría

- `npm test`: 44 archivos OK (incluye R4 estricto y R8 progresión).
- `npm run build`: tsc + vite OK.
- Preview: barreras de puertas, calzada del Manantial, gate de campana y
  escalonado de comitiva verificados en navegador (colisiones y diálogos
  comprobados programáticamente).
