---
generated_by: antigravity-cli-interactive-fallback
task: agent-work/tasks/gemini/ohmdal-plaza-context-audit.md
model: gemini-3.7-flash-high
effort: high
generated_at: 2026-08-22
note: agy 1.1.18 print-mode sandbox denied read confirmations; analysis ran interactively sandboxed and this response was recovered headlessly without tool calls.
---

# Auditoría de Contexto y Brief Técnico — Ohmdal Plaza 3D (Art Pass 01)

**Evaluador:** Gemini (Read-Only Peer)  
**Destinatario:** Codex (Master Harness & Technical Authority)  
**Rama:** `explore/ohmdal-3D`  
**Tarea:** [`agent-work/tasks/gemini/ohmdal-plaza-context-audit.md`](file:///C:/YO/Proyectos/Roxana/agent-work/tasks/gemini/ohmdal-plaza-context-audit.md)

---

## 1. CODEX MINIMAL READING SET

Orden de lectura prioritario (exactamente 10 archivos). Codex **no** debe cargar la totalidad de `docs/20-worlds/ohmdal/` ni documentación histórica room-based:

1. [`AGENTS.md`](file:///C:/YO/Proyectos/Roxana/AGENTS.md) — Gobernanza raíz, modelo operativo y límites del harness.
2. [`docs/20-worlds/ohmdal/AGENTS.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/AGENTS.md) — Reglas locales de Ohmdal, target PlayCanvas v2 y tooling.
3. [`docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md) — Spec ejecutable de fases P0–P8, gates y entrega.
4. [`docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_CATALOG.json`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_CATALOG.json) — Catálogo machine-readable de materiales, packs, límites y destinos.
5. [`docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md) — Procedimiento paso a paso de descarga, staging e integración.
6. [`docs/3d/VISUAL_HARNESS.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/VISUAL_HARNESS.md) — Contrato de hooks deterministas, 8 vistas canónicas, métricas y scorecard.
7. [`docs/3d/BUDGETS.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/BUDGETS.md) — Presupuestos duros de draw calls (<150 mobile / <250 desktop), tris y texturas.
8. [`docs/3d/SCALE_BIBLE.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/SCALE_BIBLE.md) — Convención métrica, persona 1,72 m, origen al suelo, frente +Z, Y-up.
9. [`docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md) — Fantasía ("reino detenido, no destruido"), anti-pilares y no-glow.
10. [`docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md) — Alcance de los beats VS01–VS03 y límites espaciales del slice.

---

## 2. RESOLVED DECISIONS

Hechos y directivas firmes que Codex debe tratar como **resueltos sin reabrir debate**:

- **[Hecho] Runtime de Ohmdal:** PlayCanvas Engine v2 + TypeScript. Three.js es sólo cantera conceptual/técnica y QA; **prohibido** instalar routers o runtimes Three.js en Ohmdal.
- **[Hecho] Alcance del Art Pass 01:** Puramente visual/técnico sobre la Plaza actual (`src/experiences/ohmdal-playcanvas/` y `ohmdal-plaza/`). Cero cambios a lógica de circuitos, diálogos, lore o puzzles.
- **[Hecho] Adquisición cerrada de assets:** No hacer búsquedas abiertas en marketplaces. Ejecutar estrictamente `OHMDAL_PLAZA_ASSET_CATALOG.json` mediante los scripts del repositorio (`3d:fetch-polyhaven`, `3d:inventory-pack`).
- **[Hecho] Cuota de Hero Assets:** Máximo 3 piezas identitarias en este pase: Galvanoscopio, Pedestal/Ohm y Mecanismo Puerta Ω. Prohibido generar decenas de assets con IA antes de aprobar estos 3.
- **[Hecho] Presupuesto de texturas:** 1K para runtime genérico; 2K exclusivamente para hero/close-ups con justificación de cámara. Prohibido displacement maps en runtime.
- **[Hecho] Modelo de gobernanza del harness:** Codex es la única autoridad técnica integradora; Gemini es peer read-only (`npm run agent:gemini`); Blender es master DCC; proveedores generativos (Meshy/Tripo) son workers sin auto-aprobación.
- **[Hecho] Baseline y gates:** La prueba requiere el visual harness con 8 vistas obligatorias, corrida limpia de `npm run verify` + `npm run 3d:validate-manifests` y captura real desktop (1440×900) y mobile (390×844).

---

## 3. CONTRADICTIONS / STALE GUIDANCE

| Conflicto / Texto stale | Fuentes en contradicción | Autoridad recomendada / Resolución |
|---|---|---|
| **Cámara / Formato: Diorama HD-2D vs. Primera Persona 3D** | [`content/ohmdal-vertical-slice_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md) (§2 H1, H2) habla de diorama 3D + sprites 2D con encuadres autorales fijos. [`OHMDAL_OUTER_WILDS_VISION_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/OHMDAL_OUTER_WILDS_VISION_v1.md), [`3d/VISUAL_BIBLE.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/VISUAL_BIBLE.md) y [`playcanvasWorld.ts`](file:///C:/YO/Proyectos/Roxana/src/experiences/ohmdal-playcanvas/playcanvasWorld.ts) establecen 3D continuo en primera persona. | **Autoridad:** [`OHMDAL_PLAZA_ART_PASS_01.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md) + [`3d/VISUAL_BIBLE.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/VISUAL_BIBLE.md). La mención HD-2D en el vertical slice pertenece al hito histórico previo; la rama `explore/ohmdal-3D` trabaja en primera persona inmersiva. |
| **Emisivo / Glow en Cobre Pasivo** | En [`playcanvasWorld.ts`](file:///C:/YO/Proyectos/Roxana/src/experiences/ohmdal-playcanvas/playcanvasWorld.ts) `matCopperClean` tiene `emissiveIntensity = 0.3` por defecto. [`OHMDAL_PLAZA_ASSET_ACQUISITION.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md) (§1) y [`VISUAL_BIBLE.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/VISUAL_BIBLE.md) prohíben taxativamente el glow en cobre apagado. | **Autoridad:** [`OHMDAL_PLAZA_ASSET_ACQUISITION.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md) §1. El cobre es PBR metálico cálido con verdín localizado rugoso; cero emisión luminosa salvo cuando un circuito cerrado esté energizado. |
| **Menciones residuales de Phaser / Three.js como runtime** | [`content/ohmdal-vertical-slice_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md) y [`direccion-ambiental-arco1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/direccion-ambiental-arco1.md) mencionan "Phaser" y "Three.js". | **Autoridad:** [`AGENTS.md`](file:///C:/YO/Proyectos/Roxana/AGENTS.md) y [`docs/20-worlds/ohmdal/AGENTS.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/AGENTS.md). PlayCanvas v2 es el único runtime activo del spike. |
| **Ubicación y Daïs de Ohm en Layout** | [`layout.ts`](file:///C:/YO/Proyectos/Roxana/src/experiences/ohmdal-plaza/layout.ts) marca a Ohm como un `TODO(dirección)` provisorio junto a la fuente/campana en Z=-6.55. En [`playcanvasWorld.ts`](file:///C:/YO/Proyectos/Roxana/src/experiences/ohmdal-playcanvas/playcanvasWorld.ts), Ohm está en daïs central Z=-2.0. | **Autoridad:** [`OHMDAL_PLAZA_ART_PASS_01.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md) §4 P1. Ohm/pedestal actúa como landmark central entre el Portal (Sur) y la Puerta Ω (Norte). |

---

## 4. PLAZA INVARIANTS

### 4.1 Invariantes Espaciales y Composición
- **Puntos cardinales fijos:**
  - **Sur ($Z \approx -11$):** Portal del Instituto (punto de spawn y llegada).
  - **Centro ($Z \approx -2$):** Daïs y pedestal del autómata Ohm.
  - **Oeste ($X \approx -10, Z \approx -4$):** Taller de Lumen y Campana de Continuidad.
  - **Este ($X \approx +5.5, Z \approx +3.8$):** Fuente de Ohm y Muro de los 40 años.
  - **Norte ($Z \approx +11.5$):** Gran Puerta Ω y salida hacia el cañón/Manantial.
- **Gate de composición (`portal-arrival`):** Al pararse en el umbral del Portal, el jugador debe distinguir por silueta, iluminación y masa (sin UI ni texto) tres elementos: el **pedestal de Ohm**, el **Taller de Lumen** y el **umbral de la Puerta Ω**.
- **Circulación:** Ancho caminable despejado de mínimo 3–4 metros en la arteria principal Sur-Norte y la bifurcación al Taller.

### 4.2 Invariantes Pedagógicas y de Circuito
- **Topología física visible:** Los conductores de cobre van incrustados en la mampostería o el suelo con aisladores cerámicos claros.
- **Puntos de fallo diegéticos:** La brecha del riel de retorno (donde se coloca el jumper) y la junta sulfatada de óxido deben tener affordance geométrica y material clara, no ser simples tags invisibles.
- **Modelo precede al símbolo:** El jugador percibe la discontinuidad mecánica/física antes de medir con el Galvanoscopio.

### 4.3 Invariantes de Narrativa Ambiental
- **Estado: Apagado y detenido, NO destruido.** Ohmdal es una civilización intacta pero paralizada por ritualización y olvido. Cero escombros catastróficos o aspecto post-apocalíptico.
- **Paleta ambiental:** Piedra pálida erosionada (taupe), madera oscura de taller (umber), cobre oxidado con verdín localizado, agua estancada y cielo crepuscular/nocturno frío.

---

## 5. ASSET / ART RISKS

### 🔴 ALTO (Riesgos críticos de identidad y rendimiento)
1. **Síndrome "Generic Medieval Asset Flip":** Importar mallas de Quaternius/Kenney sin adaptar sus texturas al set taupe/umber de Ohmdal, haciendo que la Plaza parezca una aldea de fantasía genérica en lugar de una ciudad de infraestructura electromagnética.
2. **"Primitives + Glow" Failure:** Dejar las primitivas cúbicas/cilíndricas actuales tapadas por bloom y niebla volumétrica densa en lugar de reemplazar siluetas por mallas modeladas.
3. **Cobre como Neón Sci-Fi:** Mantener emissive shaders activos en cobre no alimentado, destruyendo la premisa de mundo sin energía.
4. **Desborde de Draw Calls en Mobile:** No unificar materiales o no usar instancing en props repetidos, superando el límite de 150 draw calls móviles.

### 🟡 MEDIO (Riesgos de composición y coherencia)
1. **"Jungle Plaza" (Exceso de Vegetación):** Tratar la Plaza urbana como un bosque; la vegetación debe limitarse a juntas húmedas, pie de muros y siluetas periféricas sin obstruir sightlines.
2. **Incoherencia de Escala y Pivotes:** Exportar GLBs sin calibrar (pivote fuera del suelo o escala $\neq 1.0$), provocando objetos flotantes.
3. **Dispersión aleatoria de props:** Esparcir cajas y barriles como ruido en vez de armar clusters funcionales (ej. área de descarga del taller).

### 🟢 BAJO (Pulido secundario)
1. Variación de texel density en acantilados distantes de fondo.
2. Ajuste fino de curvas de atenuación en fuentes de luz puntuales secundarias.

---

## 6. HUMAN DECISIONS REQUIRED

- **Decisión 1:** *Aprobación de créditos / API Key para Meshy (si aplica):* Si Codex va a generar mallas 3D para los hero assets mediante Meshy, Manuel debe validar la disponibilidad de `MESHY_API_KEY` y el consumo de créditos. Si no está disponible, Codex debe modelar los 3 hero assets de forma procedural/manual en Blender.
- **Bloqueos actuales para iniciar el Art Pass 01:** **NINGUNO (`none`)**. Codex tiene el catálogo CC0 listo, los scripts de adquisición operativos y la especificación completa para comenzar de inmediato.

---

## 7. IMPLEMENTATION BRIEF FOR CODEX (Max 700 words)

**Objetivo:** Elevar la Plaza de Ohmdal (`src/experiences/ohmdal-playcanvas/`) de greybox a Vertical Slice Visual Web Premium, respetando el contrato de `OHMDAL_PLAZA_ART_PASS_01.md` sin alterar gameplay, circuitos ni narrativa.

### Fase 1: Pre-flight & Visual Harness Baseline (P0)
1. Confirmar rama `explore/ohmdal-3D` y verificar que `npm run verify` y `npm run 3d:validate-manifests` estén en verde.
2. Comprobar que `window.__ROXANA_VISUAL_TEST_HOOKS__` expone los hooks canónicos (`setState`, `setCamera`, `setPostProcessing`, `getDiagnostics`).
3. Registrar métricas baseline y capturar las 8 vistas canónicas (`portal-arrival`, `workshop-approach`, `ohm-landmark`, `omega-gate`, `plaza-wide`, `active-play-desktop`, `active-play-mobile`, `no-post`).

### Fase 2: Adquisición de Materiales P0 (P2)
1. Ejecutar en terminal:
   ```bash
   npm run 3d:fetch-polyhaven -- cobblestone_floor_001 --resolution 2k --maps diff,nor_gl,rough
   npm run 3d:fetch-polyhaven -- mossy_cobblestone --resolution 2k --maps diff,nor_gl,rough,ao
   npm run 3d:fetch-polyhaven -- stone_tile_wall --resolution 2k --maps diff,nor_gl,rough,ao
   npm run 3d:fetch-polyhaven -- medieval_wood --resolution 2k --maps diff,nor_gl,rough,ao
   ```
2. Generar runtime textures a **1K** bajo `assets/runtime/ohmdal/plaza/materials/`.
3. Crear el material procedural/PBR compartido `roxana-ohmdal-copper-aged-v1` (metálico cálido, rugosidad alta en zonas con verdín, sin emisivo pasivo).

### Fase 3: Arquitectura Modular y Props CC0 (P3)
1. Descargar a staging `assets/source/vendor/quaternius/` los packs gratuitos: *Medieval Village MegaKit* y *Fantasy Props MegaKit*.
2. Ejecutar `npm run 3d:inventory-pack` y filtrar:
   - **Máximo 12 piezas de arquitectura:** Muro recto, esquina, arco de portal, escalón, contención, techo de taller.
   - **8 a 16 props funcionales:** Barriles, cajas de herramientas, banco de trabajo, candil no eléctrico.
3. Pasar cada pieza por Blender (escala en metros, pivote en base, frente +Z, limpieza de mallas internas).
4. Validar con `npm run 3d:validate-glb -- <archivo>` e integrar en `playcanvasWorld.ts` agrupando props por función (ej. frente al Taller de Lumen).

### Fase 4: Gramática de Infraestructura Eléctrica Propia (P4)
1. Reemplazar las cajas planas de trazas eléctricas por geometría con canaletas de cobre empotradas, aisladores cerámicos cilíndricos y abrazaderas de hierro.
2. Modelar físicamente la **brecha de retorno** (socket para jumper) y la **junta oxidada**.

### Fase 5: Los Tres Hero Assets (P5)
1. **Galvanoscopio:** Refinar el viewmodel en primera persona (caja de nogal, bisel de latón, aguja analógica, filamento).
2. **Ohm y Pedestal:** Sustituir cilindros por autómata artúrico/mecánico calibrado sobre daïs de piedra.
3. **Mecanismo Puerta Ω:** Reemplazar el arco primitivo por un portal con solenoide visible, cerrojos de latón y símbolo $\Omega$ integrado.

### Fase 6: Iluminación, Sombras y Post (P6)
1. Ajustar IBL y luz direccional del sol crepuscular (cálida, baja intensidad, sombras nítidas desde el Suroeste).
2. Luz de relleno celeste fría para sombras.
3. Una sola luz de linterna cálida en el Taller de Lumen.
4. Post-processing equilibrado: ACES tonemapping, bloom sutil exclusivo para filamentos/chispas activas, niebla de suelo ligera. La vista `no-post` debe sostenerse por geometría y PBR.

### Fase 7: QA, Scorecard y Fresh-Eyes Review (P8)
1. Recapturar las 8 vistas y comparar métricas (Triángulos: <300k mobile / <700k desktop; Draw calls: <150 mobile / <250 desktop).
2. Invocar el reviewer visual independiente:
   ```bash
   npm run agent:gemini -- --task agent-work/tasks/gemini/ohmdal-plaza-visual-review.md --out agent-work/reports/gemini/ohmdal-plaza-visual-review.md --model gemini-3.1-pro-high --effort high
   ```
3. Aplicar correcciones del informe y validar con `npm run verify`.

---

## 8. FILES INSPECTED

Listado completo de rutas de autoridad inspeccionadas para este informe:

- [`AGENTS.md`](file:///C:/YO/Proyectos/Roxana/AGENTS.md)
- [`GEMINI.md`](file:///C:/YO/Proyectos/Roxana/GEMINI.md)
- [`docs/00-governance/ROXANA_CANON_POLICY_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/00-governance/ROXANA_CANON_POLICY_v1.md)
- [`docs/20-worlds/ohmdal/AGENTS.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/AGENTS.md)
- [`docs/20-worlds/ohmdal/OHMDAL_OUTER_WILDS_VISION_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/OHMDAL_OUTER_WILDS_VISION_v1.md)
- [`docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md)
- [`docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md)
- [`docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/content/ohmdal-arc-01_v1.md)
- [`docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/content/ohmdal-vertical-slice_v1.md)
- [`docs/20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md)
- [`docs/20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_AGENTIC_3D_STACK.md)
- [`docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_ACQUISITION.md)
- [`docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_CATALOG.json`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ASSET_CATALOG.json)
- [`docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md)
- [`docs/20-worlds/ohmdal/production/direccion-ambiental-arco1.md`](file:///C:/YO/Proyectos/Roxana/docs/20-worlds/ohmdal/production/direccion-ambiental-arco1.md)
- [`docs/3d/README.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/README.md)
- [`docs/3d/VISUAL_BIBLE.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/VISUAL_BIBLE.md)
- [`docs/3d/SCALE_BIBLE.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/SCALE_BIBLE.md)
- [`docs/3d/BUDGETS.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/BUDGETS.md)
- [`docs/3d/VISUAL_HARNESS.md`](file:///C:/YO/Proyectos/Roxana/docs/3d/VISUAL_HARNESS.md)
- [`agent-work/tasks/gemini/ohmdal-plaza-context-audit.md`](file:///C:/YO/Proyectos/Roxana/agent-work/tasks/gemini/ohmdal-plaza-context-audit.md)
- [`src/experiences/ohmdal-plaza/layout.ts`](file:///C:/YO/Proyectos/Roxana/src/experiences/ohmdal-plaza/layout.ts)
- [`src/experiences/ohmdal-playcanvas/playcanvasWorld.ts`](file:///C:/YO/Proyectos/Roxana/src/experiences/ohmdal-playcanvas/playcanvasWorld.ts)

