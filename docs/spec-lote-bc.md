# Spec Lote B+C — predicción ligera y legibilidad (3 puzzles)

**Para el ejecutor (Codex).** Tres cambios SOLO DE VISTA (no toques modelos ni tests ni
rooms.ts). NO commitees. Español neutro (tuteo). Imports `.ts`. Patrón compartido ya en el
repo: el panel de predicción `.bench-predict` / `.bench-predict-q` / `.bench-predict-row` /
`.bench-predict-btn` (ver `src/puzzles/chain.ts`), y la legibilidad por estado del
Repartidor (`src/puzzles/distributor.ts`: "conforme / pide más / le sobra"). Tras terminar,
`npm run build` debe pasar. Reportá qué tocaste por archivo.

---

## B. `clock` — predicción de apertura

**Problema:** el jugador ajusta con feedback instantáneo (bueno), pero nunca se compromete con
una expectativa antes (falta el "ajá" de predecir→observar).

**Arreglo (vista `clock.ts`):**
- Al abrir, ANTES de poder tocar los controles (estanque/freno deshabilitados), mostrar un
  panel `.bench-predict` con la pregunta:
  `<b>Ohm:</b> «Antes de tocar nada: si agrandás el Estanque, ¿el tic se vuelve más rápido o más lento?»`
  Botones: `Más rápido` (key `rapido`) · `Más lento` (key `lento`). La verdad es **lento**
  (más estanque = período mayor = el tic tarda más).
- Al elegir, ocultar el panel, habilitar los controles, y mostrar en el status:
  - si eligió `lento`: `<b>Farero:</b> «Bien pensado: más Estanque, más lento el tic. Ahora buscá el tic justo (ritmo 4).»`
  - si eligió `rapido`: `<b>Farero:</b> «Al revés de lo que parece: más Estanque tarda más en llenarse, así que más lento. Comprobalo: buscá el tic justo (ritmo 4).»`
- El resto del puzzle queda igual (feedback instantáneo, victoria con ritmo 4). La predicción
  es estado local de la vista; NO toques `clockModel.ts`.

## C1. `singlestone` — ríos a la vista (sin caja negra)

**Problema:** los ríos de la red (izquierda) y de la piedra candidata (derecha) sólo se ven al
apretar "Pedirle a Ohm que mida" → comparar a ciegas, ensayo-error. Y el contador es confuso.

**Arreglo (vista `singlestone.ts`; el modelo ya expone lo necesario):**
- Mostrar AMBOS ríos EN VIVO, siempre, actualizados en cada cambio de red o de piedra (no sólo
  al medir). Calculalos en la vista con lo que el modelo ya exporta:
  - río de la red = `SINGLE_STONE_PUSH / equivalentResistance(network)`
  - río de la piedra = `SINGLE_STONE_PUSH / SINGLE_STONE_VALUES[candidateStone]`
  Mostralos en los readouts `[data-reading="left"]` y `[data-reading="right"]` (que hoy dicen
  "Río: —" hasta medir). Que dejen de decir "—": muestren el río real al instante.
- Así el jugador VE cuándo los dos ríos coinciden antes de confirmar. Mantené el botón
  "Pedirle a Ohm que mida" como confirmación (ya no es a ciegas): al apretarlo, si los ríos son
  iguales registra la equivalencia (igual que hoy), si no, Ohm dice que los distingue (igual
  que hoy, mostrando los dos ríos).
- Arreglá el contador confuso: donde dice `Redes que Ohm no distinguió: N de 2`, poné
  `Equivalencias encontradas: N de 2`.
- No cambies la condición de victoria (2 equivalencias) ni `singlestoneModel.ts`.

## C2. `lighthouse` — condiciones legibles (la "brevedad" deja de ser opaca)

**Problema:** el ritmo objetivo (8) se entiende, pero por qué la descarga es "breve" o "se
arrastra" es opaco (la duración del volcado nunca se muestra), y los 3 parámetros no tienen guía.

**Arreglo (vista `lighthouse.ts`; el modelo ya expone `rhythm`, `dischargePeriodMs`, `timing`,
`briefDischarge` vía `lighthouseReading`):**
- Mostrar DOS condiciones legibles, en vivo, al estilo del Repartidor (estado en palabra):
  1. Ritmo de carga: el valor `rhythm` y el objetivo 8, con estado `rápido` (rhythm<8) /
     `justo` (=8) / `lento` (>8). Texto sugerido: `Ritmo de carga: <rhythm> · objetivo 8 · <estado>`.
  2. Volcado: la DURACIÓN real en segundos (`dischargePeriodMs / 1000`, p.ej. "0.2 s") con
     estado `de golpe` (si `briefDischarge`) / `se arrastra` (si no). Texto sugerido:
     `Volcado: <X.X> s · <de golpe | se arrastra>`.
  Poné estos dos readouts visibles cerca de la referencia/controles (podés reemplazar o
  complementar el `.lighthouse-actual-label` actual). El de "volcado" hace deducible por qué
  un freno de volcado alto "se arrastra".
- El estado `justo`/`de golpe` puede colorearse verde como en el Repartidor (clase `.ok`).
- No cambies la mecánica, la victoria, las animaciones ni `lighthouseModel.ts`.

---

## Verificación
- `npm run build` (tsc + vite) sin errores.
- No tocaste modelos → los tests existentes siguen pasando.
