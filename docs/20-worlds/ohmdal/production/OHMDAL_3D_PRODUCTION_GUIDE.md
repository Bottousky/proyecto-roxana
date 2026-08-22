# Ohmdal 3D — recursos, skills y prueba de producción

**Estado:** guía de producción para `explore/ohmdal-3D`  
**Objetivo inmediato:** llevar la Plaza de Ohmdal desde el spike funcional a una escena 3D web de calidad visual alta, sin convertir el harness en otro framework de agentes.

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

### P0 antes del art pass

El repo no debe considerarse mecánicamente limpio hasta resolver el build global y volver a ejecutar el gate. Hay evidencia desincronizada: `docs/80-production/AI_TOOLING.md` registra referencias a `camPos` fuera de scope en `playcanvasRuntime.ts`, mientras `tsc-out.txt` conserva errores históricos de `src/jugar/ExplorationScene.ts`. Ejecutar `npm run build`/`npm run verify` en el worktree real y tomar **esa corrida actual** como verdad; actualizar/eliminar logs estáticos obsoletos después.

## 3. Fuentes gratuitas de assets

### Poly Haven — primera opción para materiales, HDRI y modelos realistas

- Biblioteca: https://polyhaven.com/
- Licencia: https://polyhaven.com/license
- **Licencia:** CC0; uso comercial permitido, sin atribución obligatoria.
- Úsalo para piedra erosionada, madera, metal, suelo, rocas, props naturales y HDRI/IBL.
- Para Ohmdal es la fuente más importante para elevar materiales e iluminación por encima del aspecto de prototipo.

### ambientCG — segunda biblioteca PBR

- Biblioteca: https://ambientcg.com/
- **Licencia:** CC0.
- Útil para ampliar variedad de piedra, suciedad, madera, metal, plaster, decals/materiales y HDRI cuando Poly Haven no cubra una necesidad.

### Kenney — blockout y modularidad CC0

- Prototype Kit: https://kenney.nl/assets/prototype-kit
- Castle Kit: https://kenney.nl/assets/castle-kit
- Fantasy Town Kit: https://kenney.nl/assets/fantasy-town-kit
- Modular Buildings: https://kenney.nl/assets/modular-buildings
- **Licencia:** CC0 en los packs enlazados.
- Usar principalmente para métricas, circulación, masa arquitectónica y piezas secundarias. No asumir que el look low-poly crudo es el arte final de Ohmdal.

### Quaternius — props, personajes base y animaciones CC0

- Catálogo: https://quaternius.com/
- FAQ/licencia: https://quaternius.com/faq.html
- Universal Base Characters: https://quaternius.com/packs/universalbasecharacters.html
- Universal Animation Library: https://quaternius.com/packs/universalanimationlibrary.html
- Universal Animation Library 2: https://quaternius.com/packs/universalanimationlibrary2.html
- Modular Character Outfits — Fantasy: https://quaternius.com/packs/modularcharacteroutfitsfantasy.html
- Ultimate RPG Pack: https://quaternius.com/packs/ultimaterpg.html
- Sci-Fi Essentials: https://quaternius.com/packs/scifiessentialskit.html
- **Licencia:** CC0; el sitio ofrece glTF/FBX/Blend según pack.
- Usar como base de NPCs/animación y para props genéricos. Retexturizar/retrabajar cuando el asset vaya a sobrevivir al prototipo.

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
GLB → inspect-glb → calibrate-model → assemble-scene → light-scene → verify
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

- Resolver el build/gate mecánico actual.
- Capturar screenshots + FPS/frametime del spike actual en desktop y mobile.
- No cambiar gameplay ni lore durante el art pass.

### Fase 1 — layout y escala

Skill candidato: `level-design` + `apply-conventions`.

- Mantener Portal, Plaza, Taller, Puerta de Ohm y los landmarks ya ratificados.
- Greybox con Kenney/Quaternius o primitivas.
- Validar rutas, anchos, escala humana, lectura del Faro/Castillo y sightlines.
- Ningún hero asset todavía.

**Gate:** la Plaza debe ser interesante de recorrer aun sin materiales.

### Fase 2 — kit modular de Ohmdal

Herramientas: Blender + `inspect-glb` + `calibrate-model`.

Crear un kit pequeño y reusable:

- suelo/pavimento;
- muro recto / esquina;
- arco / puerta;
- escalera;
- columna;
- cornisa;
- canal/conductor de cobre;
- aislador cerámico;
- baranda;
- drenaje/agua.

Kenney/Quaternius sirven como base de proporción o placeholder; el kit final debe respetar la materialidad propia de Ohmdal.

### Fase 3 — materiales e IBL

Fuentes: Poly Haven + ambientCG.

Paleta material canónica de la Plaza:

- piedra pálida erosionada;
- cobre oxidado sin glow gratuito;
- agua detenida;
- cerámica;
- madera de taller;
- vidrio/instrumentación.

Aplicar PBR correcto, UV coherente, texel density razonable y variación macro/micro. Evitar 4K por defecto; reservar resoluciones altas para assets que realmente las justifican y medir transferencia/memoria.

### Fase 4 — hero assets

Herramientas: GPT Image/MiniMax para concept → Meshy multi-image/image→3D cuando aporte valor → Blender → GLB.

Prioridad inicial:

1. Ohm / pedestal o estatua;
2. Galvanoscopio de Lumen;
3. Gran Puerta Ω;
4. mecanismo/relé visible de la Plaza;
5. uno o dos elementos arquitectónicos únicos que no puedan confundirse con un pack genérico.

No generar 40 assets antes de aprobar 3–5 ejemplos.

### Fase 5 — ensamblado e iluminación

Skills: `assemble-scene` → `light-scene` → `add-effects`.

- Jerarquías limpias y pivots previsibles.
- Lightmaps/baked lighting donde convenga.
- Sol/cielo/IBL coherentes.
- Sombras priorizadas por impacto visual.
- Reflection/IBL y exposición consistentes.
- Fog/partículas/post effects sólo si ayudan a profundidad y lectura.
- Nada de emissive/neón como sustituto de dirección artística.

### Fase 6 — vida y sonido

- Ambiente posicional: agua, metal, viento, madera, relés, electricidad distante.
- NPCs provisionales con Quaternius/Mixamo hasta que existan modelos propios.
- MiniMax por `mmx` para voces/audio/música únicamente cuando el brief esté aprobado.

### Fase 7 — optimización web

Skill candidato: `performance-optimization` + PlayCanvas `inspect-glb`.

- Medir antes de optimizar.
- Reducir draw calls mediante instancing/batching cuando sea medible.
- LOD donde haya ganancia real.
- Meshopt/compresión glTF cuando aplique.
- KTX2/Basis para texturas donde el pipeline lo soporte.
- Evitar materiales únicos innecesarios y texturas enormes invisibles en pantalla.
- Target de trabajo: 60 FPS desktop de gama media y >=30 FPS mobile; ajustar presupuesto desde medición real, no por dogma.

### Fase 8 — prueba del harness

Una tarea completa debe demostrar el circuito:

```text
ChatGPT web
  ↓ spec cerrada
Codex
  ↓ skills concretos
asset/layout/material/lighting
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
