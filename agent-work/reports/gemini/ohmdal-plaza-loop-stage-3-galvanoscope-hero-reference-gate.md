# PLAZA LOOP REVIEW — Stage 3 HERO_REFERENCE_GATE

- Reviewer: Antigravity CLI
- Model: `gemini-3.7-flash-high`
- Effort: `high`
- Conversation: `cf046cd7-9a0e-4abe-9163-d13dc195a3ae`
- Routing note: the repo-native print runner exited 1, so the exact model ran read-only in interactive `plan+sandbox` mode; a no-tool print continuation in the same conversation supplied the persisted Markdown.

### VERDICT

`HUMAN_GATE`

No existe autoridad visual primaria suficiente para aprobar el Hero Reference Pack del Galvanoscopio (`rx_galvanoscope_hero_01`) ni para iniciar el modelado 3D final. `HERO_REFERENCE_GATE.md` y el stage `stage-3-galvanoscope` exigen detener el loop autónomo y solicitar un concept/turnaround primario aprobado.

### AUTOMATIC FAILURES

- Falta referencia visual primaria. `assets/references/hero-packs/galvanoscope/hero-reference.json` registra `primaryReference: ""` y `status: "blocked-missing-primary-reference"`.
- `docs/80-production/spikes/ohmdal-greenfield-explorable/refs/03-first-person-device.jpg` es mood externo genérico de ciencia ficción, no autoridad del Galvanoscopio.
- `assets/ohmdal/rooms/pilot-arco1/taller+props_lumen-v2.png` muestra el Taller y maquinaria general, no el instrumento aislado ni un turnaround.
- Los documentos establecen función pedagógica —voltímetro analógico y dos puntas—, no forma ni silueta 3D.
- Los viewmodels procedurales existentes son placeholders técnicos; no pueden promoverse a canon visual.

### STAGE GATE

| Criterio | Estado | Evidencia |
|---|---|---|
| Diseño fiel a referencias aprobadas / Hero Reference Gate | FAIL | `assets/references/hero-packs/galvanoscope/hero-reference.json` no tiene `primaryReference` y no está aprobado. |
| Tamaño/posición provisional no tapa landmarks | PASS provisional | El offset actual de `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts` preservó Ohm/Puerta Ω en Stage 2C; no aprueba la forma placeholder. |
| Partes funcionales/pivots preservados | PENDING | Aguja y dos puntas están declaradas, pero no existe candidate aprobado. |
| Desktop/mobile y visual harness | PASS baseline | `output/playwright/ohmdal-plaza/stage-2c/iter-3-after/` pasó sin errores. |
| Identidad no dependiente de glow | PENDING | Requiere referencia y candidate; el placeholder no tiene autoridad para aprobar este criterio. |

### TOP 5 FIXES

1. **problem:** falta concept/turnaround primario que defina silueta, proporciones, chasis, dial, puntas y agarre.
   **evidence:** `assets/references/hero-packs/galvanoscope/hero-reference.json`; `03-first-person-device.jpg` rechazado como autoridad.
   **expected_impact:** high
   **execution_class:** `SOL` — requiere decisión humana de diseño (`HUMAN_GATE`).
   **scope:** `assets/references/hero-packs/galvanoscope/`

2. **problem:** seleccionar el pipeline y validar el pack después de aprobar la referencia.
   **evidence:** `docs/3d/HERO_REFERENCE_GATE.md`.
   **expected_impact:** high
   **execution_class:** `SOL`
   **scope:** `hero-reference.json`, validator 3D.

3. **problem:** completar anclas físicas, proporciones y materiales a partir del concept aprobado.
   **evidence:** campos aún abiertos en el reference pack.
   **expected_impact:** medium
   **execution_class:** `LUNA` una vez que Sol especifique valores.
   **scope:** `hero-reference.json`.

4. **problem:** modelar el hero canonical siguiendo el golden path de Ohm.
   **evidence:** `docs/3d/HERO_REFERENCE_GATE.md`; `scripts/3d/build_ohm_hero.py`.
   **expected_impact:** high
   **execution_class:** `SOL`
   **scope:** authoring y `assets/runtime/ohmdal/plaza/heroes/galvanoscope/`.

5. **problem:** reemplazar las primitivas PlayCanvas con el GLB calibrado y vincular la aguja.
   **evidence:** `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`.
   **expected_impact:** high
   **execution_class:** `LUNA` una vez aprobado e integrado el candidate.
   **scope:** wiring del viewmodel PlayCanvas.

### DO NOT TOUCH

- Ohm/pedestal y Puerta Ω aprobados.
- Arquitectura y materiales de Stage 2C.
- Transform provisional del viewmodel mientras no exista el candidate.

### REGRESSIONS

`none`

El baseline aprobado de Stage 2C no fue modificado.

### MOBILE / PERFORMANCE RISKS

- SwiftShader (`softwareRendered: true`) hace que los tiempos de frame sean diagnósticos, no representativos de GPU física.
- El hero handheld debe respetar su presupuesto geométrico y no aumentar materialmente los 109 draw calls mobile del baseline.
- El candidate no debe ocluir los controles táctiles ni los landmarks centrales.

### NEXT CAPTURE

Después de aprobar la referencia y modelar: recapturar las ocho vistas canónicas, con foco adicional en `portal-arrival`, `ohm-landmark`, mobile portrait y `no-post` para demostrar ergonomía, no oclusión, lectura PBR y fidelidad reference/candidate.

### EVIDENCE INSPECTED

- `agent-work/tasks/gemini/ohmdal-plaza-loop-review.md`
- `agent-work/loops/ohmdal-plaza/LOOP.md`
- `agent-work/loops/ohmdal-plaza/state.json`
- `docs/3d/HERO_REFERENCE_GATE.md`
- `assets/references/hero-packs/galvanoscope/hero-reference.json`
- `assets/references/hero-packs/ohm/hero-reference.json`
- `docs/20-worlds/ohmdal/OHMDAL_OUTER_WILDS_VISION_v1.md`
- `docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md`
- `docs/80-production/spikes/ohmdal-greenfield-explorable/SPIKE_REPORT.md`
- `docs/80-production/spikes/ohmdal-greenfield-explorable/refs/03-first-person-device.jpg`
- `assets/ohmdal/rooms/pilot-arco1/taller+props_lumen-v2.png`
- `src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`
- `src/experiences/ohmdal-plaza/viewmodel/galvanoscopeViewmodel.ts`
- `agent-work/reports/gemini/ohmdal-plaza-loop-stage-2c-environment-iter-3-after.md`

### LOOP_DECISION

```json
{
  "verdict": "HUMAN_GATE",
  "stage": "stage-3-galvanoscope",
  "recommendedFixCount": 5,
  "solFixes": 3,
  "lunaFixes": 2,
  "criticalRegression": false,
  "humanGateReason": "Falta referencia visual primaria (concept/turnaround) aprobada para el Galvanoscopio de Lumen en assets/references/hero-packs/galvanoscope/hero-reference.json bajo el contrato HERO_REFERENCE_GATE.md. Se requiere que el humano proporcione o apruebe el concept antes de iniciar modelado 3D."
}
```
