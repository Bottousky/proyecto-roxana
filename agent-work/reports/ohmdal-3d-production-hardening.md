# Ohmdal 3D — Production Hardening Final

**Estado:** PASS

**Rama:** `explore/ohmdal-3D`
**Baseline preservada:** `325e11afac8944efef16411c88628974ff9e8d38`

## Canonicalización PlayCanvas

Completa. PlayCanvas Engine v2 + TypeScript + Vite queda como runtime canónico
de Ohmdal; Blender es el DCC master. Three.js conserva únicamente valor de I+D
histórica. Los criterios para reabrir la decisión son medibles y requieren una
decisión humana material.

## Límites de mundo y runtime

- La autoría interior del Taller vive en
  `world/workshop/buildWorkshopInterior.ts`.
- El shell escénico ya aceptado al norte de Plaza vive en
  `world/manantial/buildManantialShell.ts`; esto no agrega producción del
  Manantial.
- `systems/zones/zoneLifecycle.ts` concentra carga y activación deterministas.
- `playcanvasWorld.ts` conserva composición, orden y batching; el runtime
  orquesta progresión y zonas.

## Carga y activación de zonas

Al Portal, sólo Plaza está loaded/active. Taller se carga y activa al cruzar su
puerta, y se desactiva al volver. El seam del futuro payload de Manantial queda
sin carga pesada; se precarga al abrir Omega y sólo se activa al cruzar la puerta.
La evidencia está en el test unitario de lifecycle, los diagnósticos de las ocho
capturas y los checkpoints del Golden Path.

## Blender Gauntlet

El protocolo reusable exige reference pack aprobado, Blender-first determinista,
master reproducible, previews front/three-quarter/side/back, GLB canónico,
procedencia, review independiente y hasta tres iteraciones. El fixture
`agent-work/gauntlets/galvanoscope.json` pasa con cuatro vistas, GLB válido,
iteración 1/3 y cero créditos pagos.

## Gameplay playtester

**PASS.** Recorrió mediante teclado e interacción real:

Portal → despertar de Ohm → entrada al Taller → herramientas de Lumen → regreso
a Plaza → medición en `retorno_sur` → limpieza del óxido → instalación del
puente → activación del relé de campana/apertura de Omega → cruce legítimo a
`inside_manantial`.

El test no muta `storyStep`, no teletransporta salvo mediante las puertas del
runtime y usa snapshots exclusivamente read-only. La corrección local del solver
asegura que Omega requiere el tercer paso ya definido: el relé de campana.

## Performance y diagnósticos

- Transferencia final: 21.80 MB; gate 25 MB.
- Draw calls de las ocho vistas: 99–147; gate 160.
- Triángulos: 57k–90k aproximadamente; gate 100k.
- Una sola luz activa con sombras en desktop y mobile.
- Diagnósticos ahora incluyen loaded/active zones y conteos de sombras.
- Cero page errors; cuatro warnings permitidos de `ReadPixels` bajo SwiftShader.
- FPS de SwiftShader es informativo y no se presenta como benchmark GPU.

## Plaza before / after

Se compararon las ocho vistas de
`output/playwright/ohmdal-plaza/stage-5/iter-1-after/` contra
`output/playwright/ohmdal-hardening/final/`. Portal, Taller, Ohm, Omega, Plaza
wide, active desktop, active mobile y no-post preservan composición, materiales,
HUD y lectura. Sol y Gemini no detectaron regresiones críticas. El loop canónico
de Plaza permanece sin cambios en `status: complete`.

## Review Gemini

Gemini 3.7 Flash High, effort high, revisó en Antigravity read-only los contratos,
el código load-bearing, manifests, Golden Path y los ocho pares before/after.
Dictamen: **PASS**, 15/15 criterios, cero HUMAN_GATE. El runner repo-native falló
con `agy exited 1`; se usó el fallback permitido del mismo CLI `agy`, modelo y
sandbox, sin Gemini API, Vertex, AI Studio ni escalación a Pro. Conversación:
`ad3eda51-d8c0-4e22-9c12-451ec1fe6de2`.

## Routing

Luna Max realizó únicamente trabajo mecánico acotado: extracción literal y
rewiring de Taller/shell, y scaffold/automatización repetitiva del playtester.
Sol High definió arquitectura, lifecycle, contratos visuales, truthfulness del
test, corrección del solver, integración, revisión visual y aceptación final.
Gemini actuó sólo como reviewer independiente read-only.

## Validación

- Suite canónica de `verify`: PASS mediante Git Bash; el alias `bash` de Windows
  apunta a WSL sin distribución instalada, por eso se ejecutó directamente el
  mismo `scripts/verificar-hito.sh` con Git Bash.
- `smoke:play`: PASS.
- `loop:ohmdal-plaza:validate`: PASS, estado `complete` preservado.
- `3d:validate-manifests`: PASS.
- `3d:validate-blender-gauntlet`: PASS.
- Validadores GLB finales de Ohm, Omega y Galvanoscopio: 0 errores, 0 warnings.
- `agent:gemini:check`: PASS; modelo exacto disponible.
- Golden Path: PASS.

## HUMAN_GATE y readiness

No queda ningún HUMAN_GATE para esta tarea. No se usaron proveedores pagos ni se
inició producción del Manantial. El repo queda listo para **crear**, en una tarea
separada, el bounded loop `ohmdal-manantial`; no corresponde activarlo aquí.
