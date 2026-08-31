# Informe Final de Revisión Independiente: Hardening de Producción Ohmdal 3D

**Destinatario:** Codex (Sol High)

**Origen:** Gemini 3.7 Flash High (peer multimodal/fresh-eyes)

**Carácter:** Independiente, read-only, no modificatorio

**Conversación Antigravity:** `ad3eda51-d8c0-4e22-9c12-451ec1fe6de2`

**Baseline:** Plaza Stage 5 (`325e11a`) en `output/playwright/ohmdal-plaza/stage-5/iter-1-after/`
**Estado revisado:** `output/playwright/ohmdal-hardening/final/`

## VERDICT

**PASS**

## EXECUTIVE SUMMARY

El hardening técnico completó los objetivos de arquitectura, desacoplamiento,
trazabilidad de assets, anti-cheating de gameplay y gobernanza de rendimiento
sin alterar el slice vertical aceptado de la Plaza.

La inspección de las ocho capturas canónicas pareadas no encontró regresiones
visuales o funcionales críticas. La extracción de Taller y del shell escénico
del Manantial, junto con el lifecycle de zonas, aísla el futuro desarrollo sin
cargar assets pesados del Manantial en la llegada al Portal. El Golden Path usa
movimiento e interacción reales, sin mutar el estado narrativo ni teletransportar
fuera de puertas legítimas. Se cumplen transferencia (21.80 MB), geometría,
draw calls y la política mobile de una sola luz con sombras.

## H1–H8

| Paquete | Estado | Evidencia load-bearing |
| --- | --- | --- |
| H1 — Canonical PlayCanvas Runtime | PASS | `OHMDAL_3D_RUNTIME_DECISION.md` ratifica PlayCanvas Engine v2 + TypeScript + Vite, Blender como DCC y Three.js sólo como I+D histórica. |
| H2 — Production World Boundaries | PASS | Taller y shell del Manantial extraídos a módulos dedicados sin cambiar composición ni batching. |
| H3 — Zone Lifecycle | PASS | `OhmdalZoneLifecycle` determinista y cubierto por tests; Plaza inmediata, Taller bajo demanda y Manantial progresivo. |
| H4 — Visual / Material Bible | PASS | Contrato normativo de materiales, humedad, iluminación, sombras y fallos prohibidos. |
| H5 — Blender Gauntlet | PASS | Protocolo, validador y fixture Galvanoscopio: cuatro vistas, procedencia, bounds y cero créditos pagos. |
| H6 — Gameplay Gauntlet | PASS | Playtester de Golden Path completo por input real, con snapshots read-only. |
| H7 — Performance Diagnostics | PASS | Diagnósticos de zonas, transferencia, geometría, draw calls, luces y sombras integrados al harness existente. |
| H8 — Verification / Freeze | PASS | Validadores verdes; Plaza permanece `complete`; no se inició producción del Manantial. |

## VISUAL COMPARISON

Gemini inspeccionó los ocho pares before/after:

1. `portal-arrival`: silueta, atmósfera, Omega, Ohm, campana, Taller y
   Galvanoscopio preservados.
2. `workshop-approach`: fachada, vigas, transformador y acceso sin cambio tras
   la extracción modular.
3. `ohm-landmark`: aisladores, filamento pasivo, adoquín y bisel húmedo
   preservados.
4. `omega-gate`: solenoides, bobinas, aisladores y mampostería sin regresión.
5. `plaza-wide`: continuidad de Plaza, fondo montañoso y faldones preservada.
6. `active-play-desktop`: HUD y prompt de proximidad correctos.
7. `active-play-mobile`: encuadre vertical, controles y prompt sin solapamiento.
8. `no-post`: lectura PBR e iluminación sólida sin depender del postproceso.

## GAMEPLAY PATH

Ruta observada en `golden-path-run.json`:

1. Portal: consume `intro_portal_edda`; sólo Plaza loaded/active.
2. Ohm: desplazamiento al pedestal, despertar y diálogos legítimos.
3. Taller: entrada por `workshop_exterior_door`; zona Taller activa.
4. Herramientas: Lumen entrega puente y cepillo.
5. Plaza: salida por `workshop_exit_door`; Taller inactivo.
6. Galvanoscopio: acoplamiento a `retorno_sur` y medición verificable.
7. Óxido: resistencia baja de 2400 Ω a 0.05 Ω.
8. Puente: cierre de `b_brecha_retorno`.
9. Campana/Omega: el relé completa las tres ramas, abre Omega y precarga el
   payload futuro del Manantial sin activarlo.
10. Cruce: entrada legítima por `puerta_ohm`; Plaza y Manantial activos.

No hay mutaciones directas de `storyStep`, teletransportes ilegítimos ni modales
bloqueantes.

## PERFORMANCE

- Transferencia: 21.80 MB, bajo el presupuesto de 25 MB.
- Draw calls finales en las ocho vistas: 99–147, bajo el techo de 160.
- Geometría: menos de 90k triángulos en la evidencia canónica, bajo 100k.
- Sombras: exactamente una luz activa con sombras, incluso en mobile.
- Zonas: sólo Plaza está cargada al Portal; el futuro payload del Manantial no
  es eager-loaded.
- FPS bajo SwiftShader queda explícitamente como diagnóstico informativo, no
  benchmark de GPU.

## BLOCKERS / HUMAN_GATE

No se detectaron bloqueos, regresiones críticas ni HUMAN_GATEs.

Do not fix de esta etapa: no producir interior del Manantial, no alterar el
batching aceptado de Plaza, no reabrir su loop `complete` y no usar Meshy/Tripo
sin un nuevo HUMAN_GATE económico.

## ACCEPTANCE CRITERIA

1. Baseline `325e11a` sin regresión crítica: PASS
2. Ocho vistas Stage 5 reproducibles: PASS
3. Loop Plaza preservado en `complete`: PASS
4. Runtime PlayCanvas documentado: PASS
5. Límites de autoría separados: PASS
6. Lifecycle determinista y testeado: PASS
7. Sin eager-load pesado del Manantial: PASS
8. Visual/Material Bible creada: PASS
9. Blender Gauntlet reusable: PASS
10. Gameplay Gauntlet verídico: PASS
11. Diagnósticos de zonas y sombras: PASS
12. Validadores y tests verdes: PASS
13. Review Gemini Flash High read-only: PASS
14. Cambios listos para freeze técnico de Sol: PASS
15. Sin auto-inicio del Manantial: PASS

## RECOMMENDATIONS

El repositorio está listo para crear un futuro bounded loop `ohmdal-manantial`,
sin iniciarlo dentro de este hardening.

**PASS**
