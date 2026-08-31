# Ohmdal Plaza — ART PASS 01

**Rama:** `explore/ohmdal-3D`  
**Modo:** tarea ejecutable para Codex  
**Objetivo:** convertir la Plaza PlayCanvas actual de spike primitivo a un primer vertical slice visual premium-web verificable, sin cambiar gameplay, canon ni puzzles.

## 0. Reglas de alcance

Permitido:

- layout/scale corrections que no cambien rutas narrativas;
- materiales, módulos, props, vegetación periférica, lighting, IBL, decals, audio ambiental no narrativo;
- reemplazo progresivo de primitivas por GLB;
- visual harness y diagnostics necesarios para medir el pass.

No permitido:

- reescribir diálogos/lore;
- cambiar el circuito pedagógico;
- agregar nuevas zonas del arco;
- migrar engine;
- instalar routers/directores Three.js;
- upgrades incidentales de dependencias;
- generar decenas de hero assets antes de aprobar 3 ejemplos.

## 1. Fuentes obligatorias

Leer inicialmente sólo:

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `.agents/skills/ohmdal-development/SKILL.md`
4. `.agents/skills/ohmdal-graphics-quality/SKILL.md`
5. este archivo

Después ejecutar el context audit Gemini de la sección 2. Codex debe usar el
`CODEX MINIMAL READING SET` resultante para elegir el resto de fuentes, en lugar
de cargar por defecto todo el corpus de Ohmdal.

No cargar documentación histórica HD-2D/room-based salvo contradicción concreta.

## 2. PRE-FLIGHT

Ejecutar:

```bash
git branch --show-current
npm run verify
npm run 3d:validate-manifests
npm run agent:gemini:check
```

Debe estar en `explore/ohmdal-3D` y verde antes de art pass. Si `agy` no está
instalado o autenticado, reportar el único paso humano necesario; no sustituirlo
por Gemini API.

### 2.1 Context distillation con Gemini / Antigravity

Si `npm run agent:gemini:check` pasa, ejecutar:

```bash
npm run agent:gemini -- \
  --task agent-work/tasks/gemini/ohmdal-plaza-context-audit.md \
  --out agent-work/reports/gemini/ohmdal-plaza-context-audit.md \
  --model gemini-3.1-pro-high \
  --effort high
```

Antes de fijar el slug, confirmar que aparece en `agy models`; si cambió, usar el
Gemini Pro/High más fuerte listado y registrar el slug real. No usar
`--dangerously-skip-permissions`.

Codex debe leer el informe, verificar los puntos load-bearing y consumir su
`CODEX MINIMAL READING SET`; no releer todo el árbol sólo por costumbre.

Crear reporte local/artefacto de corrida con:

- commit inicial;
- browser/OS;
- viewport desktop/mobile;
- estado Antigravity `PASS|BLOCKED` y modelo usado;
- estado de `MESHY_API_KEY=SET|MISSING` sin mostrar valor;
- estado de Blender/PlayCanvas tooling requerido;
- fuentes externas usadas.

## 3. P0 — baseline visual antes de tocar arte

Abrir `/ohmdal-playcanvas` y capturar:

- `portal-arrival`;
- `workshop-approach`;
- `ohm-landmark`;
- `omega-gate`;
- `plaza-wide` QA;
- `active-play-desktop`;
- `active-play-mobile`;
- `no-post` cuando el hook exista.

Registrar:

- draw calls;
- triangles;
- textures/materials si están expuestos;
- fps/frametime si la medición no está en software renderer;
- renderer/vendor/software-rendered;
- errores consola/page.

Si el visual harness todavía no existe, implementarlo primero siguiendo `docs/3d/VISUAL_HARNESS.md`. No avanzar a polish premium sin vistas reproducibles.

## 4. P1 — geometría y lectura espacial

El spike actual usa muchas primitivas; no intentar ocultarlo con post.

Preservar como landmarks:

- Portal al sur;
- Ohm/pedestal central;
- Taller de Lumen al oeste;
- Puerta Ω al norte;
- lectura de conducción/retorno integrada al suelo/arquitectura.

### Gate

Desde `portal-arrival` deben reconocerse al menos **Ohm + Taller + destino norte** por silueta/sightline sin HUD explicativo.

## 5. P2 — adquirir materiales P0 exactos

Primero dry-run:

```bash
npm run 3d:fetch-polyhaven -- cobblestone_floor_001 --resolution 2k --maps diff,nor_gl,rough --dry-run
npm run 3d:fetch-polyhaven -- mossy_cobblestone --resolution 2k --maps diff,nor_gl,rough,ao --dry-run
npm run 3d:fetch-polyhaven -- stone_tile_wall --resolution 2k --maps diff,nor_gl,rough,ao --dry-run
npm run 3d:fetch-polyhaven -- medieval_wood --resolution 2k --maps diff,nor_gl,rough,ao --dry-run
```

Si resuelven, descargar P0 y después completar:

```bash
npm run 3d:fetch-polyhaven -- stone_wall_05 --resolution 2k --maps diff,nor_gl,rough,ao
npm run 3d:fetch-polyhaven -- medieval_wall_01 --resolution 2k --maps diff,nor_gl,rough,ao
npm run 3d:fetch-polyhaven -- rusty_metal_04 --resolution 2k --maps diff,nor_gl,rough,metal
```

Runtime normal: 1K. No displacement por defecto.

## 6. P3 — arquitectura modular y props gratuitos

Descargar/usar sólo la versión gratuita/Standard cuando corresponda.

### Quaternius Medieval Village MegaKit

Staging:

```text
assets/source/vendor/quaternius/medieval-village-megakit/
```

Inventario:

```bash
npm run 3d:inventory-pack -- assets/source/vendor/quaternius/medieval-village-megakit --contains wall,floor,stair,roof,door,window,arch,vine
```

Seleccionar **máximo 12** piezas para el pass.

### Quaternius Fantasy Props MegaKit

```bash
npm run 3d:inventory-pack -- assets/source/vendor/quaternius/fantasy-props-megakit --contains barrel,crate,box,bench,stool,table,candle,lantern,hammer,tool,book,cart,market
```

Integrar **8–16 props** como clusters funcionales, nunca scatter aleatorio.

### Naturaleza

No abrir batch naturaleza hasta aprobar arquitectura/materiales. Después:

- 3 rocas;
- 2 familias planta/arbusto;
- 1 familia pasto;
- máximo 2 siluetas árbol periféricas.

## 7. P4 — gramática visual propia de Ohmdal

Vendor assets no pueden definir el primer plano.

Crear/adaptar un kit mínimo propio:

- conductor/canal de cobre;
- uniones/terminales visibles;
- aislador cerámico;
- abrazaderas/soportes;
- registros o cajas de conexión;
- drenaje/canal de agua;
- señal/placa sin texto inventado;
- material `roxana-ohmdal-copper-aged-v1`.

Cobre base: metálico cálido, verdín localizado rugoso/no-metálico, **sin emisión** salvo estado eléctrico real.

## 8. P5 — tres hero assets, no más

Orden inicial:

1. **Galvanoscopio de Lumen**;
2. **Ohm/pedestal**;
3. **mecanismo visible de Puerta Ω**.

### Meshy primary

Si `MESHY_API_KEY=SET` y el gasto fue aprobado:

- preferir concept/vistas → image/multi-image-to-3D;
- usar text-to-3D preview sólo para explorar forma;
- revisar silueta antes de refine/textura;
- registrar task IDs y créditos;
- descargar GLB inmediatamente;
- pasar por Blender antes de runtime.

MCP oficial si la tarea necesita tool-calling encadenado; skill/API si un flujo reproducible basta.

### Tripo A/B

Usar sólo si:

- Meshy falla forma/estructura;
- hace falta segmentación editable;
- el asset se beneficia de P Series/low-poly;
- hay una razón explícita de costo/calidad.

No usar créditos Tripo web asumiendo que cubren API; son billing separados.

### Gate de hero asset

Cada uno debe tener:

- silhouette legible en cámara real;
- materialidad Ohmdal;
- escala/pivot/orientación correctos;
- GLB inspeccionado;
- screenshot real;
- costo/procedencia registrado.

Si 1 de los 3 falla, corregir antes de generar el cuarto.

## 9. P6 — lighting y post

Usar PlayCanvas `light-scene`; `add-effects` sólo después.

Orden:

1. sky/IBL y exposición;
2. key direccional motivada;
3. contacto/sombras;
4. lectura interior/exterior del Taller;
5. materiales;
6. recién después fog/bloom/color grading.

El baseline `no-post` debe seguir leyendo bien.

No usar glow como lenguaje general de cobre/electricidad apagada.

## 10. P7 — técnicas Three.js como referencia, no runtime

Si el problema visual lo justifica, consultar on-demand:

### Scott

`https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills`

Útiles para Plaza:

- procedural architecture;
- procedural materials;
- vegetation;
- exposure/color grading;
- visual validation.

### Majid

`https://github.com/majidmanzarpour/threejs-game-skills`

Útiles para Plaza:

- visual scorecard;
- technical-art budgets;
- visual harness;
- canvas/browser inspection;
- external asset sourcing gates.

No instalar `threejs-game-director` ni `threejs-skill-router`.

## 11. P8 — QA / scorecard

Repetir todas las vistas canónicas. Comparar baseline vs current.

Aplicar `docs/3d/VISUAL_HARNESS.md`.

Automatic fail si:

- dominan cajas/primitivas;
- el hero principal sigue siendo primitives + glow;
- fog/bloom esconden geometría pobre;
- no existe captura player-facing desktop/mobile;
- hay errores de consola;
- no hay renderer diagnostics;
- se reporta SwiftShader FPS como GPU.

### 11.1 Fresh-eyes review obligatorio con Gemini

Después de generar el set **completo** de screenshots y métricas, ejecutar:

```bash
npm run agent:gemini -- \
  --task agent-work/tasks/gemini/ohmdal-plaza-visual-review.md \
  --out agent-work/reports/gemini/ohmdal-plaza-visual-review.md \
  --model gemini-3.1-pro-high \
  --effort high
```

Misma regla de modelo: confirmar slug con `agy models` y usar el Pro/High vigente
si cambió. El reviewer no debe ver sólo screenshots elegidas ni editar código.

Codex debe leer el informe, verificar las observaciones críticas contra las
capturas y resolver primero el `TOP 5 FIXES` de mayor impacto/costo. Si Gemini
marca automatic failure visible y Codex discrepa, documentar evidencia concreta;
no ignorarlo por intuición.

Fresh-eyes review es obligatorio antes de decir `premium`.

## 12. Budgets iniciales

Respetar `docs/3d/BUDGETS.md`.

Especialmente:

- mobile: <150 draw calls visibles, 150k–300k tris;
- desktop: <250 draw calls visibles, 400k–700k tris;
- textura común 512–1024;
- hero desktop 2048 sólo si la cámara lo justifica;
- 0–1 luces con sombra mobile / 1 principal desktop.

Los números son objetivos iniciales; medir y documentar tradeoffs.

## 13. Cierre

Ejecutar:

```bash
npm run build
npm test
npm run 3d:validate-manifests
npm run verify
```

No declarar terminado si el gate player-facing no se recorrió en navegador.

### Entrega requerida

```text
ART PASS 01: PASS / PARTIAL / FAIL

Baseline commit:
Final commit:

Gemini context audit:
- model:
- report:
- minimal reading set consumed:

Assets acquired:
Hero assets generated:
Provider/task/credits:

Visual scorecard:
- art direction:
- composition/sightlines:
- architecture/silhouette:
- hero landmarks:
- materials:
- lighting:
- ambient/VFX:
- UI/readability:
- performance evidence:

Renderer diagnostics:
Desktop:
Mobile:
Software-rendered?:

Automatic failures remaining:
Gemini fresh-eyes review:
- model:
- report:
- verdict:
- top fixes applied:

Files changed:
Validation:
Remaining blockers:
NEXT PASS:
```