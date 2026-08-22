# Ohmdal 3D — stack agentic y política de proveedores

**Rama:** `explore/ohmdal-3D`  
**Actualizado:** 2026-08-22  
**Objetivo:** producir assets y escenas 3D con agentes sin atar el runtime a un proveedor generativo ni convertir el repo en un multi-harness.

## Decisión

```text
ChatGPT web          diseño / investigación / decisiones
       ↓
     CODEX            único integrador técnico
       │
       ├─ PlayCanvas  runtime de Ohmdal + skills oficiales
       ├─ Blender     DCC/master canónico; MCP oficial sólo con gate
       ├─ Meshy       hero assets por REST / MCP / skill cuando haya crédito aprobado
       ├─ Tripo       A/B o fallback por CLI/API; no dependencia permanente
       ├─ Three.js    biblioteca de técnicas, QA y authoring; NO runtime de Ohmdal
       └─ terminal    git, npm, Playwright, glTF tools, mmx
```

**Contrato de portabilidad:** el producto de authoring debe terminar como `GLB/glTF + manifiesto + procedencia`, independientemente de que el origen sea Meshy, Tripo, Blender, Three.js procedural o un pack CC0. PlayCanvas consume el resultado; no conoce al proveedor.

## 1. Runtime vs authoring

- **PlayCanvas Engine v2 + TypeScript** sigue siendo el target del spike de Ohmdal.
- **Blender** es el master DCC para escala, pivots, jerarquía, materiales, cleanup, colisiones, sockets, LOD/variantes y export.
- **Three.js** se aprovecha como ecosistema de conocimiento y tooling: técnicas de materiales, agua, vegetación, arquitectura procedural, cámaras, shaders y QA. Una referencia Three se traduce a PlayCanvas o se bakea/exporta; no introduce `three` dentro del runtime de Ohmdal.
- `img2threejs` queda como **watchlist/authoring experimental**. Puede entrar cuando su salida estructurada/GLB aporte valor comprobable. No bloquea producción ni define el formato canonical.

## 2. Assets genéricos — prioridad cero de costo

Antes de generar con IA:

1. **Poly Haven** — CC0, PBR/HDRI/modelos: https://polyhaven.com/
2. **ambientCG** — CC0, PBR/HDRI: https://ambientcg.com/
3. **Quaternius** — CC0, modular/props/nature/personajes/animación: https://quaternius.com/
4. **Kenney** — CC0, blockout/modular: https://kenney.nl/assets
5. **Mixamo** — rig/animación humanoide cuando aplique: https://www.mixamo.com/

La Plaza tiene su lista ejecutable en `OHMDAL_PLAZA_ASSET_CATALOG.json`; no abrir marketplaces si el catálogo resuelve la necesidad.

## 3. Meshy — proveedor generativo primario si Pro está activo

### Por qué encaja

Meshy tiene integración oficial para agentes y API y cubre en la misma cuenta:

- text → 3D;
- image → 3D;
- multi-image → 3D;
- preview → refine/textura;
- remesh / smart topology;
- retexture;
- rig humanoide;
- animación;
- generación/edición de imagen;
- export game/print y utilidades de impresión 3D.

Fuentes oficiales:

- AI integration / MCP / skill: https://docs.meshy.ai/en/api/ai
- Text to 3D: https://docs.meshy.ai/en/api/text-to-3d
- Image to 3D: https://docs.meshy.ai/en/api/image-to-3d
- Multi-image to 3D: https://docs.meshy.ai/en/api/multi-image-to-3d
- API pricing: https://docs.meshy.ai/en/api/pricing
- MCP server: https://github.com/meshy-dev/meshy-mcp-server
- Agent skill: https://github.com/meshy-dev/meshy-3d-agent

### Ruta preferida

Para un hero asset con diseño aprobado:

```text
concept / vistas
  → Meshy preview o image/multi-image-to-3D
  → revisar silueta antes de textura cara
  → refine / smart topology / retexture si aporta valor
  → descargar GLB inmediatamente
  → Blender cleanup/canonical
  → inspect-glb + calibrate-model
  → PlayCanvas
  → visual harness
```

**No usar `text-to-3D` como sustituto de dirección artística** para piezas identitarias. Para Ohm, Galvanoscopio, Puerta Ω o maquinaria pedagógica se prefiere concept aprobado + image/multi-image.

### MCP vs skill/API

- Si Codex necesita tool-calling conversacional y tareas encadenadas: **MCP oficial**.
- Si sólo necesita un workflow reproducible generate → poll → download: **skill/API**.
- No crear wrapper/MCP propio mientras estas rutas oficiales cubran el caso.
- Nunca commitear `MESHY_API_KEY`.
- Registrar `taskId`, modelo, parámetros, créditos consumidos, outputs y ruta canonical.

## 4. Tripo — A/B y fallback fuerte, no dependencia base

Tripo V3 es útil cuando convenga alguno de estos puntos:

- `text/image/multiview → model`;
- generación con `model_seed` reproducible;
- P Series para low-poly/topología limpia;
- segmentación de malla;
- completion/repair;
- decimate/retopology;
- rig-check, rig y retarget;
- procesamiento por lotes.

Fuentes:

- API: https://developers.tripo3d.ai/en/
- CLI: https://developers.tripo3d.ai/en/docs/cli

El CLI oficial puede ser usado por Codex desde terminal y soporta `tripo make`, presets `game-mobile`, `game-pc`, `print`, batch resumible y `tripo mcp`.

**Regla de costo:** Tripo webapp y Tripo API tienen billing/créditos separados. No adoptar un plan web esperando que financie automáticamente generación agentic. Usar Tripo cuando una prueba A/B demuestre mejor geometría, segmentación, rig o costo total para un asset concreto.

## 5. Meshy vs Tripo — regla práctica

No elegir por marca; ejecutar el mismo brief cuando el asset sea importante.

| Caso | Default |
|---|---|
| Hero prop de Ohmdal con Meshy Pro activo | Meshy |
| Multi-view de pieza mecánica/arquitectónica | Meshy primero; Tripo A/B si falla |
| Necesidad fuerte de segmentación editable | Tripo A/B |
| Batch low-poly reproducible | Tripo CLI puede ser mejor candidato |
| Asset genérico ya disponible CC0 | ninguno |
| Pieza mecánica con tolerancias reales | CAD/FreeCAD/OpenSCAD, no IA 3D |
| Figura/prop imprimible no mecánico | Meshy/Tripo → Blender → STL/3MF |

## 6. Three.js como cantera de técnicas

No instalar routers/directores Three.js en Roxana. Usar repos externos como referencias on-demand:

- `scottstts/Threejs-Awesome-Graphics-Agent-Skills`
  - procedural materials;
  - architecture;
  - vegetation;
  - water optics;
  - exposure/color grading;
  - visual validation.
- `majidmanzarpour/threejs-game-skills`
  - visual scorecard;
  - technical-art budgets;
  - deterministic visual harness;
  - Playwright/canvas inspection;
  - Tripo workflow ideas.

Regla: **extraer mecanismo, no dependencia**. Si una receta habla de TSL/Three, traducir la intención y la matemática a PlayCanvas o bakearla a un asset.

## 7. Visual feedback loop — obligatorio para calidad premium

```text
acquire / generate
      ↓
normalize
      ↓
integrate
      ↓
MULTI-VIEW VISUAL HARNESS
      ↓
metrics + screenshots + console
      ↓
scorecard / critic
      ↓
fix
      └───────────────↺
```

Contrato común: `docs/3d/VISUAL_HARNESS.md`.

Un agente no puede autoaprobar una escena porque compiló. Para claims `premium/AAA-like` debe existir evidencia desktop/mobile, vistas canónicas, baseline sin post, renderer diagnostics y revisión adversarial/fresh-eyes.

## 8. Customuse — observar, no depender

Customuse es interesante como grafo multi-provider (Meshy/Tripo/Hunyuan + retopo/materiales/export), pero no entra al baseline actual:

- agrega otra suscripción;
- la API/custom integration es una capa de mayor costo/Enterprise;
- Blender + providers directos ya cubren el loop actual.

Reevaluar sólo si Roxana empieza a producir assets en volumen suficiente para que un grafo multi-provider repetible ahorre más tiempo que su costo.

## 9. Orden de decisión para cualquier asset Roxana

```text
¿Existe CC0 usable?
  sí → adquirir + adaptar
  no  ↓
¿es identitario/hero?
  no → Blender/procedural simple
  sí ↓
¿hay concept aprobado?
  no → generar/aprobar vistas primero
  sí ↓
Meshy primary → Blender → GLB → QA
  │
  └─ falla calidad/estructura → Tripo A/B
```

## 10. Definition of Done de un asset agentic

No está terminado hasta tener:

- fuente/brief y derechos claros;
- proveedor/modelo/parámetros/task ID;
- créditos/costo registrados si aplica;
- master o fuente preservable;
- GLB runtime normalizado;
- escala, pivote, frente y bounds correctos;
- triángulos/materiales/texturas dentro de budget;
- screenshot en cámara real;
- desktop + mobile cuando visible en ambos;
- manifiesto/procedencia;
- `npm run verify` verde para cambios versionados.
