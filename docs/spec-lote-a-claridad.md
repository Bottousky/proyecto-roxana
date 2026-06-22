# Spec Lote A — arreglos de claridad de presentación (4 puzzles)

**Para el ejecutor (Codex).** Cuatro arreglos chicos e independientes, uno por archivo.
NO rediseñes la mecánica: solo hacés VISIBLE la condición/tolerancia y agregás feedback de
dirección (si la última acción acercó o alejó). NO inventes números: **leé el modelo de cada
puzzle y usá los valores reales**. NO commitees. Español neutro (tuteo). Imports `.ts`.
Patrón de referencia ya en el repo: la "cuenta del Cruce" y la legibilidad por distrito de
`src/puzzles/branches.ts` y `src/puzzles/distributor.ts` (respuesta/estado visible primero).

Tras terminar, corré `npm run build` y los tests existentes que toquen estos puzzles; ambos
deben pasar. Reportá en pocas líneas qué tocaste.

---

## A1. `storedspark` — mostrar el % de carga

**Problema:** el puzzle gana cuando la carga del Estanque supera un umbral (en el modelo,
`level >= 95`), pero ese nivel nunca se muestra → el umbral se siente mágico y el jugador
no sabe cuánto es "bastante".

**Arreglo (solo vista `storedspark.ts`):**
- Mostrar EN VIVO el nivel de carga como porcentaje entero mientras se carga, p.ej. en un
  label o en el status: `Carga del Estanque: N%` (N = `Math.round(level)`).
- Cuando el nivel cruza el umbral de "cargado suficiente" (el mismo que usa el modelo para
  permitir observar), el feedback debe avisarlo, textual:
  `El Estanque está casi lleno. Cortá el camino y observá la lámpara.`
- Si se corta el camino con carga insuficiente, el mensaje existente de "poca chispa" debe
  convivir con el % visible.

## A2. `longchannel` — tolerancia visible + feedback de dirección

**Problema:** lidera con números tipo planilla; la tolerancia del canal nunca se muestra en
la UI (hay que adivinarla); y cuando la entrega no da, no dice si te pasaste o quedaste corto.

**Arreglo (vista `longchannel.ts`; leé `longchannelModel.ts` para los valores):**
- Mostrar la tolerancia del canal angosto en el subtítulo o en el status inicial, con el
  valor REAL del modelo, p.ej.: `El canal angosto tolera Río <TOL>.` (reemplazá <TOL> por la
  tolerancia real).
- El horno pide ENTREGA 16 (valor real del modelo; usá la constante). Cuando la entrega ≠ 16,
  dar feedback de DIRECCIÓN:
  - entrega < 16 → `La entrega quedó corta (<X> de 16). Subí el Empuje, o aflojá el freno.`
  - entrega > 16 → `Te pasaste (<X> de 16). Bajá el Empuje, o sumá freno.`
  (donde <X> = entrega actual). Mantené el feedback existente del canal al rojo / fusible.

## A3. `infirmary` — tolerancia del canal visible

**Problema:** elegir el fusible correcto de cada máquina se siente a tanteo porque la
tolerancia/pico esperado del canal no se ve.

**Arreglo (vista `infirmary.ts`; leé `infirmaryModel.ts` para los valores):**
- Para cada máquina, mostrar su tolerancia o pico esperado con el valor REAL del modelo, en un
  label legible junto a la máquina, p.ej.: `tolera hasta Río <TOL>` o `pico esperado ~Río <PICO>`.
  Elegí la formulación que corresponda a lo que el modelo realmente compara para decidir el
  fusible correcto (si compara contra una tolerancia, mostrá la tolerancia; si contra un pico,
  el pico).
- Objetivo: que el jugador pueda razonar "este canal llega a Río X → el fusible justo es X",
  en vez de adivinar. NO cambies qué fusible es correcto; solo hacelo deducible.

## A4. `fairsplit` — Río en vivo al elegir

**Problema:** el reparto proporcional se adivina; la regla queda oculta y huele a ensayo-error.

**Arreglo (vista `fairsplit.ts`; leé `fairsplitModel.ts`):**
- Mostrar EN VIVO el Río de cada terraza a medida que el jugador elige piedras (no solo al
  medir con los brazos de Ohm ni solo al final). Si ya hay un readout, reforzá que se actualice
  con cada elección y que se vea junto al objetivo (la marca justa de cada terraza).
- Si es barato, agregá una línea de feedback de dirección respecto del objetivo de cada
  terraza ("le falta / le sobra"), al estilo de la legibilidad por distrito del Repartidor
  (`distributor.ts`: estados "conforme / pide más / le sobra").

---

## Verificación
- `npm run build` (tsc + vite) sin errores.
- Los tests de estos modelos no cambian (no tocás modelos): deben seguir pasando.
