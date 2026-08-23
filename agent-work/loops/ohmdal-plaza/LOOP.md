# Ohmdal Plaza — bounded autonomous loop

**Runtime:** PlayCanvas Engine v2  
**Authority:** Codex  
**Reviewer:** Gemini 3.7 Flash High via Antigravity CLI  
**Decision model:** Sol High  
**Mechanical worker:** Luna Max  
**State:** `agent-work/loops/ohmdal-plaza/state.json`

Leer primero `docs/80-production/BOUNDED_AGENT_LOOP.md`. Este archivo instancia ese contrato para la Plaza.

## Objetivo del loop

Llevar la Plaza desde Stage 2B aprobado hasta un vertical slice visual coherente, sin pedir aprobación humana por cada microiteración.

No cambiar gameplay, puzzle, lore, engine o arquitectura general del harness.

## Stage queue

### `stage-2c-environment`

Objetivo: corregir el gap entre Ohm/Puerta Ω y el entorno.

Prioridades:

1. reemplazar primitivas visibles de foreground/background;
2. mejorar masas y siluetas arquitectónicas;
3. corregir repetición/escala/materiales;
4. ajustar IBL, key/fill, exposición, sombras de contacto y profundidad;
5. mantener lectura `no-post` y mobile.

**No producir Galvanoscopio todavía.**

Gate:

- no primitive/blockout dominante en vistas canónicas;
- arquitectura no lee como asset flip medieval genérico;
- materiales mantienen gramática Ohmdal;
- landmarks Ohm/Puerta Ω siguen dominando correctamente;
- no-post mejora respecto de Stage 2B;
- sin regresión material de budget/mobile.

### `stage-3-galvanoscope`

Objetivo: reemplazar el viewmodel/placeholder por un Galvanoscopio final coherente.

Antes de modelar:

1. buscar todas las refs existentes;
2. crear `assets/references/hero-packs/galvanoscope/hero-reference.json`;
3. pasar `npm run 3d:validate-hero-ref -- ...`;
4. si falla por falta de autoridad visual → `HUMAN_GATE`.

Elegir Blender/Meshy/Tripo según `HERO_REFERENCE_GATE`; no asumir IA generativa.

Gate:

- diseño fiel a referencias aprobadas;
- tamaño/posición de viewmodel no tapa landmarks;
- partes funcionales/pivots preservados si aplica;
- desktop/mobile y visual harness pasan;
- no dependencia de glow para identidad.

### `stage-4-world-coherence`

Objetivo: Portal + Taller + background/montañas + clusters de props coherentes.

Gate:

- Portal, Taller y background ya no exponen construcción por bloques/conos;
- clusters funcionales, no scatter;
- foreground no invade UI/interacción;
- continuidad material y de escala;
- cold transfer y draw calls siguen dentro de budget.

### `stage-5-final-plaza-polish`

Objetivo: coherencia final de la Plaza, no agregar sistemas nuevos.

Trabajos válidos:

- ajustes finos de materiales/lighting;
- contact shadows;
- decals/microdetail cuando aportan escala;
- framing desktop/mobile;
- optimización KTX2/Meshopt/dedupe si los assets ya justifican el costo;
- corregir automatic failures restantes.

Gate final:

- Visual Harness completo;
- Gemini 3.7 Flash High fresh-eyes;
- ningún automatic failure crítico;
- todas las categorías del scorecard >= 2/3;
- promedio >= 2.4/3;
- `npm run verify` PASS;
- manifests/GLB validators PASS;
- no claim de hardware FPS si renderer es SwiftShader.

Al pasar, `state.status = complete` y detenerse. No iniciar Manantial/Faro automáticamente.

## Iteración estándar

Para cada iteración:

### 1. Preflight

```bash
git branch --show-current
npm run loop:ohmdal-plaza:validate
npm run verify
npm run 3d:validate-manifests
npm run agent:gemini:check
```

Debe ser `explore/ohmdal-3D`.

### 2. Captura de evidencia actual

Ejecutar Visual Harness/captura canónica y registrar path exacto.

### 3. Gemini review

Usar **Gemini 3.7 Flash High**:

```bash
npm run agent:gemini -- \
  --task agent-work/tasks/gemini/ohmdal-plaza-loop-review.md \
  --out agent-work/reports/gemini/ohmdal-plaza-loop-<stage>-iter-<n>.md \
  --model gemini-3.7-flash-high \
  --effort high
```

Si el slug no existe, usar el equivalente Flash High de `agy models`. No escalar a Pro automáticamente.

### 4. Sol plan

Sol High consume el informe y selecciona **máximo 5 fixes**.

Clasificar cada fix:

- `SOL`: necesita criterio visual/arquitectónico;
- `LUNA`: mecánico y suficientemente especificado;
- `SKIP`: bajo impacto o fuera de stage.

Máximo 1 fix estructural por iteración.

### 5. Luna execution

Delegar a Luna Max sólo briefs cerrados y de archivos disjuntos. Máximo 2 workers.

Ejemplos válidos:

- integrar módulos ya elegidos;
- ajustar manifests/provenance;
- repetir/instanciar piezas;
- reemplazar valores concretos;
- tests/cleanup.

No delegar a Luna decisiones abiertas de composición, diseño de hero o cambios de canon.

### 6. Sol execution

Sol implementa sólo los fixes que requieren criterio o integración compleja.

### 7. Validate

```bash
npm run verify
npm run 3d:validate-manifests
npm run loop:ohmdal-plaza:validate
```

Y cualquier validator GLB/hero específico del stage.

### 8. Capture again

Recapturar las ocho vistas + diagnostics. Comparar contra la iteración anterior, no sólo contra Stage 1.

### 9. Gemini review again

Ejecutar el mismo task con un report path nuevo.

### 10. Sol decision

- `PASS`: actualizar stage y pasar al siguiente automáticamente;
- `CONTINUE`: incrementar iteración y repetir;
- `HUMAN_GATE`: detenerse con causa exacta;
- `PARTIAL`: usar sólo al llegar a maxIterations sin gate completo.

## Reglas de autonomía

No pedir permiso entre iteraciones ni entre stages si todos los gates permiten avanzar.

Detenerse únicamente por los `HUMAN_GATE` del contrato cross-Roxana, incluyendo:

- falta de reference pack para Galvanoscopio;
- necesidad de créditos Meshy/Tripo no autorizados;
- contradicción de canon;
- cambio de engine/dependencia grande;
- 3 iteraciones sin resolver el stage;
- regresión material que no puede corregirse dentro del stage.

## Output al detenerse

Entregar sólo:

- loop status;
- stage/iteration final;
- Gemini reports usados;
- fixes hechos por Sol vs Luna;
- before/after artifact paths;
- validación;
- HUMAN_GATE o razón de completion;
- siguiente acción recomendada.
