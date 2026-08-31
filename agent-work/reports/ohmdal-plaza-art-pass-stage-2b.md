# Ohmdal Plaza Art Pass — Stage 2B Puerta Ω

**Fecha:** 2026-08-23  
**Rama:** `explore/ohmdal-3D`  
**Resultado:** **PASS**  
**Scope ejecutado:** Puerta Ω y mecanismo visible. No se avanzó Galvanoscopio, gameplay, puzzle, NPCs, naturaleza, edificios ni refactor de engine.

## 1. Preflight

- Rama confirmada: `explore/ohmdal-3D`.
- Baseline Stage 2A: `output/playwright/ohmdal-plaza/stage-2a/current/capture-manifest.json`.
- Blender: 5.2.0 LTS en `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`.
- Harness visual enfocado: 4/4 PASS.
- `npm run verify`: PASS antes y después de Stage 2B.
- Manifiestos de assets: PASS antes de producir.

## 2. Inventario y autoridad de referencias

### Canon y evidencia aprobada

- `docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`: Puerta como transferencia, diagnóstico verificable y apertura hacia el Manantial.
- `docs/ohmdal-biblia/07_NARRATIVE_AND_GAME_SCRIPT.md`: apertura sólo después de verificar; no introducir teoría nueva.
- `src/experiences/ohmdal-plaza/journal/bitacora.ts`: arco de piedra, emblema Ω y cerrojos solenoide retraídos por corriente nominal.
- Tarea Stage 2B: piedra pálida erosionada, cobre envejecido, cerámica/aisladores, metal secundario, mecanismo legible, cero emisión pasiva.

### Evidencia visual propuesta, no canon literal

- `assets/ohmdal/rooms/prop_puerta_de_ohm.png`.
- `assets/ohmdal/rooms/puerta_de_ohm+prop_de_puerta.png`.
- `assets/ohmdal/rooms/puerta_de_ohm+prop_abierta.png`.
- `assets/ohmdal/hero/door-of-ohm.png`.

Se tomaron sólo relaciones ya coincidentes con la autoridad: arco segmentado, hojas dobles, conductores laterales, metal/cobre y mecanismo expuesto.

### Placeholder reemplazado

- Bloque de primitivas `GatePylon*`, `GateLintel`, `MonumentalOmegaSymbol` y caja `SolenoidGate` en `playcanvasWorld.ts`.
- El collider y el estado de apertura existentes se conservaron como autoridad de gameplay.

### Referencia descartada

- `assets/ohmdal/hero/portal-omega.png`: el portal luminoso pasivo contradice la dirección mecánica, no emisiva, de Stage 2B.

No hizo falta inventar narrativa, glifos, runas ni tecnología nueva.

## 3. Producción Blender-first

### Archivos canónicos

- Script determinista: `scripts/3d/build_omega_gate.py`.
- Master: `assets/source/ohmdal/heroes/omega-gate/omega-gate.blend`.
- Runtime: `assets/runtime/ohmdal/plaza/heroes/omega-gate/omega-gate.glb`.
- Preview: `output/blender/omega-gate/candidate-01.png`.
- Procedencia: `assets/runtime/ohmdal/plaza/heroes/omega-gate/provenance.json`.
- Manifiesto: `assets/manifests/ohmdal-plaza-stage2b-omega-gate.json`.

No se usó IA generativa ni proveedor 3D; créditos consumidos: 0.

### Jerarquía exportada

```text
OmegaGate_Root
├─ ArchitecturalFrame
├─ DoorLeaves
│  ├─ DoorLeaf_LeftPivot
│  └─ DoorLeaf_RightPivot
├─ MechanicalAssembly
│  ├─ SolenoidPlunger_Left / Right
│  └─ LockBar_Left / Right
├─ ElectricalTerminals
├─ Insulators
└─ DecorativeDetail
```

Las hojas, émbolos y barras no se fusionaron. Sólo se consolidaron hermanos rígidos por material dentro de cada padre semántico. Los pivotes de hoja y los movimientos lineales futuros quedaron registrados en extras del GLB.

### Lenguaje material

- Piedra pálida erosionada y piedra de sombra para marco/reveal.
- Cobre envejecido con verdigris localizado.
- Hierro secundario de valor medio para separar hojas cerradas del interior oscuro.
- Cerámica pálida en aisladores.
- 0 texturas, 0 emisión, 0 vidrio decorativo y 0 glow pasivo.
- Las luces de estado existentes se redujeron a `intensity=0.25`, `range=2.4`: señal localizada, no baño de luz.

## 4. Inspección y calibración

`inspect-glb` sobre posiciones reales de vértices:

| Métrica | Resultado |
|---|---:|
| `boundsSource` | `vertices` |
| AABB | `[-4.89, 0, -1.205] .. [4.89, 7.36, 1.365]` |
| Dimensiones | `9.78 × 7.36 × 2.57 m` |
| Centro | `[0, 3.68, 0.08]` |
| Ground offset | `0` |
| Triángulos | `11,196` |
| Mesh nodes / draw calls máximas del asset | `19` |
| Materiales | `6` |
| Texturas | `0` |
| Tamaño | `756,972 bytes` |
| SHA-256 GLB | `D2D5C6126BFE94F1257253DD8F4690C3EB3EB501AB2E61A559D7C4F125CDAEE8` |

Calibración única registrada en `omegaGateTuning.ts`: `scale=1`, `y=0`, `yaw=180`, compensación Z por centro `0.08`, hojas cerradas Y `2.6` y abiertas Y `5.4`.

`npm run 3d:validate-glb`: 0 errores, 0 warnings, 19 infos, 0 hints.

## 5. Integración PlayCanvas

- El GLB se carga con el loader `container` ya existente; no se agregó dependencia ni loader Three.js.
- El marco queda bajo un root semántico en `(0, 0, 11.5)`.
- `DoorLeaves` se desprende de la instancia estática y se conecta al wrapper `SolenoidGate` ya usado por el circuito.
- La geometría arquitectónica rígida entra al batch estático; `MechanicalAssembly` y las hojas quedan fuera para conservar partes reactivas utilizables.
- El collider, interacción, bloqueo y teleport existentes no cambiaron.
- En `restored-plaza`, las hojas GLB reales suben de Y `2.6` a `5.4` y dejan un paso de 2.8 m. No se agregó animación de solenoides ni puzzle.

## 6. Comparación visual Stage 2A → Stage 2B

Capturas finales: `output/playwright/ohmdal-plaza/stage-2b/current/`.

| Vista | Calls 2A → 2B | Tris 2A → 2B | Resultado visual |
|---|---:|---:|---|
| portal-arrival | 140 → 154 | 67,468 → 88,096 | destino norte inequívoco; desaparece el hueco negro |
| ohm-landmark | 132 → 146 | 66,628 → 87,256 | el arco enmarca a Ohm; los filetes centrales se desplazaron para evitar tangentes desde su cabeza |
| omega-gate | 100 → 117 | 40,396 → 61,460 | hojas, bobinas, émbolos, barras, bornes, aisladores y conductores legibles |
| active-play-mobile | 105 → 119 | 58,444 → 79,072 | Ohm conserva el foco inmediato y la Puerta sigue siendo destino completo |
| no-post | 135 → 149 | 66,736 → 87,364 | materiales y jerarquía siguen legibles sin post |

Rango final de las ocho vistas: 117–157 draw calls y 56,636–88,580 triángulos visibles. La transferencia fría sube de 24.97 MB a 25.69 MB (+0.72 MB), coherente con el GLB de 0.757 MB. Permanecen 32 materiales y 29 texturas de escena.

El renderer automatizado es SwiftShader; FPS se registra sólo como información y no como benchmark de GPU física.

## 7. QA y revisión adversarial

### Gate de aceptación

- [x] Placeholder norte reemplazado de forma inequívoca.
- [x] Destino norte legible desde Portal.
- [x] Profundidad y cierre material sustituyen el vacío negro.
- [x] Ohm permanece como foco inmediato en desktop y mobile.
- [x] Mecanismo interpretable como sistema electromecánico, no ornamento steampunk/fantasy.
- [x] Hojas, pivotes, émbolos y barras útiles para reacción futura.
- [x] Cobre sin emisión; verdigris localizado; no runas, neón ni glow pasivo.
- [x] No Galvanoscopio, gameplay, puzzle, engine o infraestructura de agentes añadidos.
- [x] No falla automática nueva.

### Scorecard adversarial

| Criterio | Nota / 5 | Evidencia |
|---|---:|---|
| Destino norte y profundidad | 5.0 | portal-arrival, no-post |
| Identidad Ohmdal | 4.5 | piedra/cobre/cerámica/conductores sin ornamento ajeno |
| Lectura del mecanismo | 4.5 | omega-gate y jerarquía GLB |
| Composición con Ohm | 4.5 | ohm-landmark y mobile después de corrección de filetes |
| Preparación técnica futura | 5.0 | pivotes y partes lineales separadas, sin batch dinámico |
| Mobile/touch | 4.5 | captura nativa 390×844 y smoke touch PASS |
| Presupuesto | 4.0 | +14–17 calls y +20.6–21.1k tris visibles; dentro del incremento explícito del asset, sin texturas nuevas |

Resultado: **PASS**. La Puerta cumple Stage 2B sin reclamar finalización de la experiencia completa.

## 8. Validación final

- `npm run verify`: PASS; build limpio y todos los tests, incluido `m26-omega-gate-stage2b.test.ts`.
- `npm run 3d:validate-manifests`: PASS.
- `npm run 3d:validate-glb -- .../omega-gate.glb`: PASS, 0 errores/warnings.
- Browser desktop: ocho capturas finales, 0 page errors.
- Touch/mobile: 390×844, `hasTouch=true`, `isMobile=true`, Bitácora abre, 0 console/page errors.
- Consola general: cuatro warnings esperados de SwiftShader `ReadPixels` al capturar; ningún error de aplicación.
- Estado abierto forzado: 0 page errors y hojas GLB visibles en posición abierta.
- Los 19 `TODO(guion)` preexistentes siguen registrados por `verify`; no bloquean este stage y no fueron modificados.

## 9. Decisión y siguiente paso

**Stage 2B: PASS.**

**NEXT elegido: A — Galvanoscopio.**

No se avanzó ese trabajo en esta rama/tarea.
