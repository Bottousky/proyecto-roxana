# Ohmdal 3D — stack agentic y política de proveedores

**Rama:** `explore/ohmdal-3D`  
**Actualizado:** 2026-08-23  
**Objetivo:** producir assets y escenas 3D con agentes sin atar el runtime a un proveedor generativo ni convertir el repo en un multi-harness.

## Decisión

```text
ChatGPT web          diseño / investigación / decisiones
       ↓
     CODEX            único integrador técnico
       │
       ├─ agy/Gemini  contexto amplio + multimodal + fresh-eyes; NO API
       ├─ PlayCanvas  runtime de Ohmdal + skills oficiales
       ├─ Blender     DCC/master canónico
       ├─ Meshy       candidate generator cuando agrega valor
       ├─ Tripo       A/B/fallback
       ├─ Three.js    técnicas, QA y authoring; NO runtime de Ohmdal
       └─ terminal    git, npm, Playwright, glTF tools, mmx
```

Gemini no es segunda autoridad: Codex consume sus informes. Los proveedores 3D
no definen diseño ni runtime. El contrato final sigue siendo
`GLB/glTF + manifiesto + procedencia`.

## 1. Runtime vs authoring

- **PlayCanvas Engine v2 + TypeScript** es el target del spike de Ohmdal.
- **Blender** es el master DCC para escala, pivots, jerarquía, materiales, cleanup,
  colisiones, sockets, LOD/variantes y export.
- **Three.js** se usa como ecosistema de conocimiento/tooling; una técnica se
  traduce a PlayCanvas o se bakea/exporta.
- `img2threejs` es authoring experimental/watchlist. No define el formato canonical.

## 2. HERO_REFERENCE_GATE — referencia antes que proveedor

Antes de modelar o generar cualquier asset identitario, aplicar:

`docs/3d/HERO_REFERENCE_GATE.md`

Cada hero necesita un `hero-reference.json` validado:

```bash
npm run 3d:validate-hero-ref -- path/to/hero-reference.json
```

Modos:

- `reconstruct`: existe turnaround/concept fuerte; preservar silueta/proporción/paleta.
- `adapt`: referencia fuerte + libertad técnica acotada para partes ocultas/funcionales.
- `design-approved`: referencia insuficiente; primero concept pack aprobado por humano.

**Ohm es el golden path:**

```text
ohmdal/characters/ohm-turnaround-v2.png
+ specs
→ hero-reference.json
→ build_ohm_hero.py
→ Blender determinista
→ preview
→ GLB canonical
→ Visual Harness
```

Stage 2A obtuvo alta fidelidad con 0 créditos generativos. La lección es:
**la referencia manda; la herramienta sólo ejecuta**.

## 3. Gemini / Antigravity

Usar Gemini donde su contexto/multimodalidad evita gasto innecesario de Codex:

- reconciliar muchas fuentes;
- generar `CODEX MINIMAL READING SET`;
- revisar screenshots/mapas/renders/variantes;
- fresh-eyes visual review;
- detectar contradicciones/stale docs.

Ruta:

```text
agent-work/tasks/gemini/*.md
→ npm run agent:gemini ...
→ Antigravity CLI / login Google
→ agent-work/reports/gemini/*.md
→ Codex verifica e implementa
```

Sin Gemini API y sin permisos de implementación para esta lane.

## 4. Assets genéricos — costo cero primero

Antes de generar con IA:

1. Poly Haven — CC0 PBR/HDRI/modelos: https://polyhaven.com/
2. ambientCG — CC0 PBR/HDRI: https://ambientcg.com/
3. Quaternius — CC0 modular/props/nature/personajes/animación: https://quaternius.com/
4. Kenney — CC0 blockout/modular: https://kenney.nl/assets
5. Mixamo — rig/animación humanoide cuando aplique: https://www.mixamo.com/

La Plaza usa `OHMDAL_PLAZA_ASSET_CATALOG.json`; no abrir marketplaces si el
catálogo ya resuelve la necesidad.

## 5. Cómo elegir authoring para un hero

Después del Hero Reference Gate:

```text
¿Es mecánico/arquitectónico/simple y controlable?
  sí → Blender determinista/procedural primero
  no ↓
¿Es orgánico/escultórico o costoso manualmente?
  sí → Meshy primary candidate
       ↓
     compare contra reference pack
       ↓
     Blender canonicalization
       │
       └─ falla → Tripo A/B
```

Esto reemplaza la regla vieja “hero = Meshy por defecto”. Ohm demostró que
Blender directo puede ser más fiel y barato cuando el turnaround es fuerte.

## 6. Meshy

Meshy sigue siendo el proveedor generativo primario cuando agrega valor:

- text/image/multi-image → 3D;
- preview/refine;
- remesh/retexture;
- rig/animation;
- export game/print.

Fuentes oficiales:

- https://docs.meshy.ai/en/api/ai
- https://docs.meshy.ai/en/api/text-to-3d
- https://docs.meshy.ai/en/api/image-to-3d
- https://docs.meshy.ai/en/api/multi-image-to-3d
- https://docs.meshy.ai/en/api/pricing
- https://github.com/meshy-dev/meshy-mcp-server
- https://github.com/meshy-dev/meshy-3d-agent

Para `reconstruct`, preferir image/multiview; text-to-3D sólo explora forma y no
puede desplazar la referencia aprobada. Revisar silueta antes de refine/textura
cara. Descargar GLB y pasar por Blender antes de runtime.

## 7. Tripo

Tripo es A/B/fallback cuando aporta mejor:

- multiview → model;
- segmentación;
- low-poly/topología;
- rig/retarget;
- batch reproducible.

Fuentes:

- https://developers.tripo3d.ai/en/
- https://developers.tripo3d.ai/en/docs/cli

Webapp y API tienen billing separado; no asumir créditos compartidos.

## 8. Three.js como cantera

Referencias on-demand, no dependencias runtime:

- https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills
  - materials, architecture, vegetation, water, exposure, visual validation.
- https://github.com/majidmanzarpour/threejs-game-skills
  - scorecard, budgets, deterministic visual harness, browser/canvas QA.
- `img2threejs`
  - experimentar sólo cuando su salida estructurada aporte más que Blender/proveedor.

Regla: **extraer mecanismo, no dependencia**.

## 9. Visual feedback loop

```text
reference gate
      ↓
author / generate
      ↓
normalize in Blender
      ↓
reference preview comparison
      ↓
integrate
      ↓
MULTI-VIEW VISUAL HARNESS
      ↓
metrics + screenshots
      ↓
Gemini fresh-eyes
      ↓
Codex fix
      └──────────────↺
```

Contrato: `docs/3d/VISUAL_HARNESS.md`.

## 10. Decision tree para cualquier asset

```text
¿Existe CC0 usable y no es identitario?
  sí → adquirir + adaptar
  no ↓
¿es hero/identitario?
  no → Blender/procedural simple
  sí ↓
HERO_REFERENCE_GATE
  │
  ├─ FAIL → producir/aprobar referencias; STOP modelado final
  └─ PASS
       ↓
¿Blender directo reproduce la forma con precisión razonable?
  sí → Blender
  no → Meshy candidate → Blender
          └─ falla → Tripo A/B
```

## 11. Definition of Done hero

No está terminado hasta tener:

- `hero-reference.json` aprobado y validado;
- fuente/brief/derechos claros;
- ruta de producción registrada;
- proveedor/modelo/task ID/créditos si aplica;
- master o script reproducible;
- preview comparado contra referencia;
- GLB canonical normalizado;
- escala/pivot/frente/bounds correctos;
- partes móviles preservadas;
- tris/materiales/texturas dentro de budget;
- screenshot en cámara real;
- desktop/mobile cuando aplica;
- manifiesto/procedencia;
- Visual Harness/fresh-eyes cuando sea entrega importante;
- `npm run verify` verde.
