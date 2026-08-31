# Ohmdal 3D — recursos, skills y prueba de producción

**Estado:** guía de producción para `explore/ohmdal-3D`  
**Objetivo inmediato:** llevar la Plaza de Ohmdal desde el spike funcional a una escena 3D web de calidad visual alta, sin convertir el harness en otro framework de agentes.

Para la adquisición concreta de genéricos de la Plaza, esta guía se complementa con:

- [`OHMDAL_PLAZA_ASSET_ACQUISITION.md`](OHMDAL_PLAZA_ASSET_ACQUISITION.md) — orden de descarga, selección, normalización e integración.
- [`OHMDAL_PLAZA_ASSET_CATALOG.json`](OHMDAL_PLAZA_ASSET_CATALOG.json) — catálogo machine-readable con IDs/URLs, comandos, batches, límites y destinos.

El catálogo curado manda sobre una búsqueda abierta de marketplaces: un agente sólo busca reemplazos cuando un candidato listado deja de existir, cambia de licencia o falla revisión visual/performance.

## 1. Regla de calidad

“AAA-like” acá significa **calidad percibida alta dentro de un presupuesto web**, no densidad bruta de un AAA de consola. La prioridad es:

1. composición, escala, landmarks y memoria espacial;
2. materiales PBR coherentes;
3. iluminación, exposición y sombras;
4. hero assets propios;
5. detalle secundario, decals y ambientación;
6. audio espacial y feedback;
7. rendimiento medido en desktop y mobile.

No vestir una geometría que todavía no funciona como espacio jugable. `blockout → playtest → art pass → lighting → effects → optimize → verify`.

## 2. Estado del harness validado

La arquitectura actual es correcta y deliberadamente mínima:

```text
ChatGPT web      diseño / investigación / specs
      ↓
Codex            única autoridad técnica e integrador
 ├─ PlayCanvas   skills oficiales + MCP cuando el Editor aporta estado vivo
 ├─ Blender      UI/CLI; MCP oficial sólo con gate de seguridad
 └─ terminal     mmx, git, npm, Vite, tests, herramientas glTF

Gemini            peer multimodal/contextual sobre el mismo repo
MiniMax           worker por `mmx`; nunca autoaprueba su salida
```

Mantener este esquema. No instalar un router general de modelos, un master router de game-dev, otro orquestador ni un MCP para una herramienta que ya funciona bien por CLI.

### Estado técnico observado

- PlayCanvas está presente como `playcanvas` 2.21.x.
- El spike está en `src/experiences/ohmdal-playcanvas/` y reutiliza sistemas de `ohmdal-plaza`.
- Los 12 skills de `playcanvas/skills` están versionados bajo `.agents/skills/` y registrados en `skills-lock.json`.
- Los únicos skills locales son `ohmdal-development` y `roxana-minimax`.
- `AGENTS.md`, `GEMINI.md` y `docs/80-production/AI_TOOLING.md` mantienen roles claros y minimizan contexto.
- El spike sigue siendo EXPERIMENTAL/PROPOSED; PlayCanvas todavía no es una migración global consumada.

### Gate mecánico — PASS

El bloqueo de build observado al inicio de esta exploración quedó corregido: `triggerInteraction()` obtiene ahora la posición del jugador en su propio scope antes de medir proximidad. La rama fue validada en GitHub Actions contra `main`: `npm ci`, `npm run verify`, el build TypeScript/Vite, toda la batería de tests —incluido `playcanvas-ohmdal.test.ts`— y `npm run 3d:validate-manifests` pasaron. Los logs estáticos de errores anteriores fueron retirados para no competir con evidencia reproducible.

`.github/workflows/validate.yml` mantiene este gate para ramas `explore/**` y PRs y syntax-checkea además los helpers de adquisición 3D. Los `TODO(guion)` siguen siendo warnings no bloqueantes por contrato; una vulnerabilidad de dependencia o actualización de Action se trata como deuda separada, nunca con upgrades incidentales para “poner verde” el hito.

## 3. Fuentes gratuitas de assets

Esta sección enumera proveedores. **Los assets concretos que el agente debe adquirir para la Plaza están fijados en el catálogo y la guía de adquisición enlazados al inicio.**

### Poly Haven — primera opción para materiales, HDRI y modelos realistas

- Biblioteca: https://polyhaven.com/
- Licencia: https://polyhaven.com/license
- **Licencia:** CC0; uso comercial permitido, sin atribución obligatoria.
- Úsalo para piedra erosionada, madera, metal, suelo, rocas, props naturales y HDRI/IBL.
- El repo incluye `scripts/3d/fetch-polyhaven.mjs` / `npm run 3d:fetch-polyhaven`, que resuelve los IDs curados mediante la API pública, permite `--dry-run`, verifica MD5 cuando el API lo entrega y deja fuentes/procedencia en staging ignorado por Git.
- Para Ohmdal es la fuente más importante para elevar materiales e iluminación por encima del aspecto de prototipo.

### ambientCG — segunda biblioteca PBR

- Biblioteca: https://ambientcg.com/
- **Licencia:** CC0.
- Útil para ampliar variedad de piedra, suciedad, madera, metal, plaster, decals/materiales y HDRI cuando Poly Haven no cubra una necesidad. No usarlo para ampliar la paleta por capricho si el set curado de Poly Haven ya resuelve la escena.

### Kenney — blockout y modularidad CC0

- Prototype Kit: https://kenney.nl/assets/prototype-kit
- Castle Kit: https://kenney.nl/assets/castle-kit
- Fantasy Town Kit: https://kenney.nl/assets/fantasy-town-kit
- Modular Buildings: https://kenney.nl/assets/modular-buildings
- **Licencia:** CC0 en los packs enlazados.
- Usar principalmente para métricas, circulación, masa arquitectónica y piezas secundarias. No asumir que el look low-poly crudo es el arte final de Ohmdal.

### Quaternius — arquitectura, props, naturaleza, personajes base y animaciones CC0

- Catálogo: https://quaternius.com/
- FAQ/licencia: https://quaternius.com/faq.html
- Medieval Village MegaKit: https://quaternius.com/packs/medievalvillagemegakit.html
- Fantasy Props MegaKit: https://quaternius.com/packs/fantasypropsmegakit.html
- Stylized Nature MegaKit: https://quaternius.com/packs/stylizednaturemegakit.html
- Ultimate Modular Ruins: https://quaternius.com/packs/ultimatemodularruins.html
- Universal Base Characters: https://quaternius.com/packs/universalbasecharacters.html
- Universal Animation Library: https://quaternius.com/packs/universalanimationlibrary.html
- Universal Animation Library 2: https://quaternius.com/packs/universalanimationlibrary2.html
- Modular Character Outfits — Fantasy: https://quaternius.com/packs/modularcharacteroutfitsfantasy.html
- **Licencia:** CC0 en los packs enlazados; el sitio ofrece glTF/FBX/OBJ/Blend según pack.
- El repo incluye `scripts/3d/inventory-vendor-pack.mjs` / `npm run 3d:inventory-pack` para inventariar un pack descargado y filtrar nombres relevantes antes de importar nada.
- Usar como base genérica y adaptar cuando el asset vaya a sobrevivir al prototipo. No copiar un pack completo al runtime.

### Adobe Mixamo — animaciones y autorig humanoide

- FAQ/licencia: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
- **Costo:** gratis con Adobe ID, sin suscripción Creative Cloud.
- Adobe permite usar personajes y animaciones royalty-free en videojuegos y también impresión 3D.
- Auto-rig y biblioteca de animaciones: sólo humanoides bípedos.
- Útil como alternativa o complemento a Quaternius para locomoción/prototipos de NPC.

## 4. Skills y herramientas agentic

### A. PlayCanvas — activos por defecto

- Skills oficiales: https://github.com/playcanvas/skills
- Guía oficial: https://developer.playcanvas.com/user-manual/getting-started/use-playcanvas-skills/
- MCP Editor: https://developer.playcanvas.com/user-manual/editor/mcp-server/

Ya están presentes los skills relevantes:

`build-app`, `apply-conventions`, `find-examples`, `reuse-scripts`, `inspect-glb`, `calibrate-model`, `configure-animation`, `assemble-scene`, `light-scene`, `add-effects`, `build-hud`, `manage-game-state`.

**Regla:** no cargar los doce. Codex usa sólo el/los skills que cambian la operación actual.

Flujo típico de asset:

```text
asset curado
  → staging ignorado
  → Blender / normalización
  → GLB
  → inspect-glb
  → calibrate-model
  → assemble-scene
  → light-scene
  → browser QA
  → verify
```

### B. Meshy — acelerador opcional para hero assets

- Integración oficial IA/API: https://docs.meshy.ai/en/api/ai
- Skill pack: https://github.com/meshy-dev/meshy-3d-agent

Preferir **Agent Skill + API/CLI** antes que sumar otro MCP al harness, salvo que una tarea demuestre que MCP aporta valor. El pack soporta image/multi-image→3D, text→3D, retexture, remesh, rig, animation y print prep.

Instalación a evaluar sólo cuando exista una API key y un sprint de assets aprobado:

```bash
npx skills add meshy-dev/meshy-3d-agent
```

Nunca comprometer `MESHY_API_KEY`. Generar a staging, registrar prompt/procedencia/créditos y pasar todo asset por Blender/inspección antes de declararlo canonical.

**Usar Meshy en Ohmdal para:** estatua/figura de Ohm, Galvanoscopio, máquinas de Lumen, mecanismos singulares, relés/artefactos hero y personajes propios.  
**No usar Meshy para:** cada pared, escalón, adoquín, caja o banco genérico.

### C. Skills game-dev externos — cherry-pick, no instalar el router

Repositorio de referencia:

- https://github.com/gamedev-skills/awesome-gamedev-agent-skills
- Level Design: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/level-design/SKILL.md
- Create Game Assets: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/create-game-assets/SKILL.md
- Performance Optimization: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/performance-optimization/SKILL.md

Son skills portables y engine-neutral. **No instalar el master router**: contradice el harness canónico de Roxana. Si una prueba demuestra valor, copiar/instalar únicamente el skill concreto después de revisión.

El primer candidato para la Plaza es `level-design`: métricas → blockout → sightlines → playtest → dress. Después, `create-game-assets` y `performance-optimization` pueden evaluarse uno por uno.

### D. Blender MCP — oficial, pero con gate

- Blender Lab MCP oficial: https://www.blender.org/lab/mcp-server/

Requiere Blender 5.1+ y ejecuta Python generado por el LLM sin guardrails. Mantener la decisión actual: **no habilitarlo automáticamente**. Usarlo sólo en entorno aceptablemente aislado/sin datos sensibles y exclusivamente el servidor oficial.

## 5. Prueba controlada: Plaza de Ohmdal “AAA-like web”

### Fase 0 — baseline

- Gate mecánico: **PASS**. No volver a mezclar fixes del build con el art pass salvo regresión nueva.
- Capturar screenshots + FPS/frametime del spike actual en desktop y mobile antes de descargar/integrar el primer batch visual.
- No cambiar gameplay ni lore durante el art pass.

### Fase 1 — layout y escala

Skill candidato: `level-design` + `apply-conventions`.

- Mantener Portal, Plaza, Taller, Puerta de Ohm y los landmarks ya ratificados.
- Greybox con Kenney/Quaternius o primitivas.
- Validar rutas, anchos, escala humana, lectura del Faro/Castillo y sightlines.
- Ningún hero asset todavía.

**Gate:** la Plaza debe ser interesante de recorrer aun sin materiales.

### Fase 2 — kit modular + genéricos curados

Herramientas: catálogo de Plaza + Blender + `inspect-glb` + `calibrate-model`.

El primer batch reutiliza sólo las piezas seleccionadas de Quaternius/Kenney y luego las normaliza. El kit funcional objetivo sigue siendo pequeño:

- suelo/pavimento;
- muro recto / esquina;
- arco / puerta;
- escalera;
- columna/cornisa cuando la composición lo exija;
- canal/conductor de cobre propio;
- aislador cerámico propio/paramétrico;
- baranda;
- drenaje/agua;
- 8–16 props de vida cotidiana en clusters funcionales.

Kenney/Quaternius compran velocidad, proporción y densidad secundaria; **no pueden reemplazar la gramática propia de cobre + cerámica + infraestructura eléctrica**.

### Fase 3 — materiales e IBL

Fuente inicial: los IDs Poly Haven P0 definidos en `OHMDAL_PLAZA_ASSET_CATALOG.json`.

Paleta material canónica de la Plaza:

- piedra pálida erosionada;
- cobre oxidado sin glow gratuito;
- agua detenida;
- cerámica;
- madera de taller;
- vidrio/instrumentación.

Aplicar PBR correcto, UV coherente, texel density razonable y variación macro/micro. Partir de fuentes 2K para genéricos y promover normalmente 1K al runtime; reservar 2K para close-up/hero con evidencia de cámara. No embarcar displacement por defecto.

### Fase 4 — naturaleza y bordes

Sólo después de que arquitectura y materiales pasen revisión:

- 3 variantes de roca;
- 2 familias de arbusto/planta;
- una familia de pasto;
- máximo 2 siluetas de árbol para framing.

Reutilizar por instancing y bajar saturación de vegetación vendor. La Plaza central no se convierte en jardín: vegetación = humedad, abandono controlado y framing periférico.

### Fase 5 — hero assets

Herramientas: GPT Image/MiniMax para concept → Meshy multi-image/image→3D cuando aporte valor → Blender → GLB.

Prioridad inicial:

1. Ohm / pedestal o estatua;
2. Galvanoscopio de Lumen;
3. Gran Puerta Ω;
4. mecanismo/relé visible de la Plaza;
5. uno o dos elementos arquitectónicos únicos que no puedan confundirse con un pack genérico.

No generar 40 assets antes de aprobar 3–5 ejemplos. Ninguno de estos elementos se sustituye por un asset genérico sólo porque exista algo parecido en un pack.

### Fase 6 — ensamblado e iluminación

Skills: `assemble-scene` → `light-scene` → `add-effects`.

- Jerarquías limpias y pivots previsibles.
- Lightmaps/baked lighting donde convenga.
- Sol/cielo/IBL coherentes.
- Sombras priorizadas por impacto visual.
- Reflection/IBL y exposición consistentes.
- Fog/partículas/post effects sólo si ayudan a profundidad y lectura.
- Nada de emissive/neón como sustituto de dirección artística.

### Fase 7 — vida y sonido

- Ambiente posicional: agua, metal, viento, madera, relés, electricidad distante.
- NPCs provisionales con Quaternius/Mixamo hasta que existan modelos propios.
- MiniMax por `mmx` para voces/audio/música únicamente cuando el brief esté aprobado.

### Fase 8 — optimización web

Skill candidato: `performance-optimization` + PlayCanvas `inspect-glb`.

- Medir antes de optimizar.
- Reducir draw calls mediante instancing/batching cuando sea medible.
- LOD donde haya ganancia real.
- Aplicar la estrategia glTF fijada por los scripts del repo; no introducir otra compresión como efecto lateral.
- KTX2/Basis sólo cuando el pipeline se habilite con evidencia reproducible.
- Evitar materiales únicos innecesarios y texturas enormes invisibles en pantalla.
- Target de trabajo: 60 FPS desktop de gama media y >=30 FPS mobile; ajustar presupuesto desde medición real, no por dogma.

### Fase 9 — prueba del harness

Una tarea completa debe demostrar el circuito:

```text
ChatGPT web
  ↓ spec cerrada
Codex
  ↓ catálogo + skills concretos
acquire → normalize → asset/layout/material/lighting
  ↓
PlayCanvas
  ↓ browser verification
Gemini
  ↓ QA visual/multimodal opcional
Codex
  ↓ integra/corrige
```

MiniMax y Meshy son workers. Ninguno aprueba su propio output.

## 6. Criterio de aceptación de la Plaza

No declarar “AAA-like” porque haya modelos caros o PBR. La Plaza pasa cuando:

- se reconoce a Ohmdal sin depender de UI/texto;
- Portal, Taller, Puerta Ω y landmarks se leen espacialmente;
- materiales responden de forma coherente a la luz;
- existen suficientes detalles para eliminar aspecto de greybox sin producir ruido visual;
- los hero assets se sienten propios, no de asset store;
- la electricidad deja pistas visuales/físicas diegéticas;
- la escena conserva performance web y mobile aceptable;
- una captura y un recorrido real resisten comparación contra las referencias visuales aprobadas.

## 7. Política de licencias/procedencia

Para todo asset que sobreviva al prototipo conservar como mínimo:

```text
source_url
source/provider
license
original_asset_name
download_date
modifications
```

CC0 es preferido para genéricos. Para cualquier fuente con licencia por asset, verificar la licencia concreta **antes** de incorporarlo. Assets generados con proveedores pagos conservan además prompt/task ID/proveedor y condiciones de uso vigentes al momento de generación.
