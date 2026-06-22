# Auditoría global de puzzles contra `guia-puzzles.md`

**Versión:** 1.0 — jun 2026
**Método:** lectura+extracción delegada a 4 agentes baratos (haiku) en paralelo, una por
grupo de mundo; juicio final y priorización del Orquestador. Los 3 puzzles del Castillo
(Cadena/Ramales/Repartidor) quedan fuera: ya se rediseñaron y son la referencia de oro.
**Lente:** las directivas nuevas del Director (`docs/guia-puzzles.md`), sobre todo
predecir→observar→explicar, "respuesta visible primero", feedback de dirección
(acercó/alejó), deducible vs arbitrario, y ≥2 soluciones.

---

## Veredicto por puzzle

| Puzzle | Mundo | Veredicto | Hallazgo principal |
|---|---|---|---|
| despertar | U1 | ✅ CUMPLE | topología visible, error informa |
| puerta | U1 | ✅ CUMPLE | I=V/R con 3 soluciones, aguja primero |
| freno | U1 | 🟡 defendible | solución única (solo amarilla con Empuje fijo) — aceptable en un intro |
| bell | U2 | ✅ CUMPLE | mediciones cualitativas, topología visible |
| timbre | U2 | ✅ CUMPLE | aplicación real, estados sonoros claros |
| forge | U3 | ✅ CUMPLE | feedback narrativo por error, ≥2 soluciones |
| longchannel | U3 | 🟠 AJUSTE | **lidera con números (planilla); sin feedback de dirección; tolerancia oculta; equivalencia solo retrospectiva** |
| warmth | U3 | ✅ CUMPLE | demostración visual guiada (termómetro primero) |
| infirmary | U3 | 🟠 AJUSTE | **tolerancia del canal no visible → elegir fusible se siente algo a tanteo** |
| ladder | U4 | ✅ CUMPLE | usa la página de predicción de Edda |
| fairsplit | U4 | 🟠 AJUSTE | **sin predicción; la regla del reparto queda oculta; algo de ensayo-error** |
| singlestone | U4 | 🔴 TRABAJO | **caja negra: "medir" hasta acumular 2 coincidencias; sin cálculo visible; contador "2 de 2" confuso** |
| steps | U4 | ✅ CUMPLE | río constante visible, ≥ órdenes válidos |
| sleepingriver | U5 | ✅ CUMPLE | la aguja "respira" (patrón perceptual primero) |
| storedspark | U5 | 🟠 AJUSTE | **umbral mágico invisible (level≥95); falta mostrar % de carga** |
| clock | U5 | 🟡 AJUSTE | cambio instantáneo sin compromiso previo (predecir-observar débil) — pero el feedback inmediato es bueno |
| lighthouse | U5 | 🔴 TRABAJO | **regla de "brevedad" de descarga opaca; 3 parámetros sin guía; sin predecir-observar** |

✅ cumple (9) · 🟡 defendible/leve (2) · 🟠 ajuste menor (4) · 🔴 necesita trabajo (2)

---

## Juicio del Orquestador (sobre los hallazgos de haiku)

- **freno** (🟡): el agente lo marcó por solución única. Es defendible: es el intro de
  resistencia con Empuje fijo, y su lección es "la piedra rajada falla; el freno dosifica".
  Una respuesta clara en un intro no viola el espíritu de la guía. **Prioridad baja**; a lo
  sumo, abrir una segunda banda válida si es barato.
- **clock** (🟡): el agente propuso un botón "Probar ritmo". Discrepo: el feedback
  instantáneo (péndulo que cambia en vivo) es buena UX y no conviene romperlo. El arreglo
  correcto es una **predicción de apertura** ("¿estanque más grande = más rápido o más
  lento?") y después dejar la experimentación instantánea. Toque ligero.
- **singlestone** y **lighthouse** (🔴): son los dos que claramente piden trabajo. Antes de
  especificar el arreglo los **verifico yo jugando/leyendo** (haiku puede haber exagerado o
  malinterpretado la mecánica de equivalencia y la de descarga breve).
- Los 🟠 (longchannel, infirmary, fairsplit, storedspark) comparten un patrón común: **falta
  hacer visible la condición/tolerancia y el feedback de dirección**. Son arreglos de claridad
  acotados, mayormente de presentación (mostrar la tolerancia, mostrar el %/Río en vivo,
  decir si la última acción acercó o alejó).

---

## Plan de iteración propuesto (priorizado)

**Lote A — claridad de presentación (mecánico, delegable a Codex effort bajo):**
1. `storedspark`: mostrar el % de carga en vivo (el umbral deja de ser mágico).
2. `longchannel`: mostrar la tolerancia ("río máx 2") y feedback de dirección
   (subiste/bajaste la entrega; probá empuje mayor/menor); volver más visual el éxito.
3. `infirmary`: mostrar la tolerancia de cada canal para que elegir el fusible sea
   deducible, no a tanteo.
4. `fairsplit`: mostrar el Río en vivo al elegir piedra (y/o una predicción ligera) para
   que el reparto se entienda, no se adivine.

**Lote B — toque ligero de predicción (Orquestador especifica, Codex implementa):**
5. `clock`: una predicción de apertura (más grande = ¿más rápido o más lento?).

**Lote C — rediseño (Orquestador verifica primero, luego spec fino + Codex/Sonnet):**
6. `singlestone`: hacer visible el cálculo de equivalencia y/o pasar a predecir-primero;
   arreglar el contador confuso.
7. `lighthouse`: hacer visible la duración de la descarga (por qué es "breve"), guiar los
   3 parámetros, sumar predecir-observar.

**Sin tocar:** los 9 que cumplen + `freno` (defendible).

Ruteo: Lote A = Codex effort bajo (cambios de vista acotados). Lote B = Codex con spec.
Lote C = verificación + spec del Orquestador, implementación Codex/Sonnet, auditoría jugada.
