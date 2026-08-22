# Roadmap

> **Actualizado:** 22 de agosto de 2026.
>
> ⚠ **Cambio de dirección técnica vigente desde 2026-08-22.**
> Ohmdal apunta a **PlayCanvas Engine v2 + TypeScript** para web. El spike en
> `src/experiences/ohmdal-playcanvas/` es evidencia inicial, no una migración
> completa. Phaser `/jugar` y los prototipos Three.js se conservan como
> baselines hasta que una tarea específica defina y verifique la transición.
> El detalle topológico vigente sigue en
> `docs/20-worlds/ohmdal/room-based/RECOVERY_AUDIT.md`,
> `ARC1_ROOM_GRAPH.md`, `ARC1_SPATIAL_MAP.md` y las 11 fichas de macroárea en
> `docs/20-worlds/ohmdal/room-based/areas/` como insumo de contenido.
>
> **Norte:** el Instituto Roxana como hogar que recuerda y cambia, con cinco campañas
> independientes (Prólogo + Ohmdal + Physica + Bitland + Arithmos) unidas por interludios
> transversales. Verbo nuclear por mundo: CONECTAR / EXPERIMENTAR / PROGRAMAR / TRANSFORMAR.
>
> Los GDD v1 y governance tienen mayor autoridad que este roadmap. Un spike o
> runtime no promueve contenido a canon por accidente.

Un hito de producción = algo que se puede abrir en el navegador y jugar/verificar al terminar.
Los **spikes** son la excepción explícita: existen para retirar una incertidumbre
antes de abrir una campaña y deben compararse desde baselines equivalentes.

---

## 1. Decisiones de producto vigentes

### Instituto

No es un menú: debe funcionar como hogar, misterio, archivo, mapa de progreso, espacio
transformable, lugar de retorno, cruce entre disciplinas y preparación de nuevos mundos.

Three.js axonométrico + DOM es la hipótesis fuerte de producción, pero todavía debe demostrar
esas funciones en juego. El hub 2D y el hall 3D existentes son baselines/prototipos mientras
se resuelve la forma definitiva.

### Las campañas son independientes

El Prólogo y los cuatro Mundos Aplicados viven en un árbol con interludios. Roxana no obliga a
jugar los cuatro mundos con la misma cámara, género o engine.

### North Star por mundo

| Mundo | Verbo | North Star |
|---|---|---|
| Ohmdal | **CONECTAR** | mirar una instalación, formar un modelo de la energía, intervenir y observar al mundo reaccionar |
| Physica | **EXPERIMENTAR** | sentir una relación física antes de formalizarla |
| Bitland | **PROGRAMAR** | modificar comportamiento y observar cómo una máquina-ciudad lo ejecuta |
| Arithmos | **TRANSFORMAR** | manipular propiedades/representaciones conservando estructura matemática |

### Bitácora

La forma común es:

`huella vivida → hipótesis/puente → formalización → reutilización`.

El vocabulario técnico no anticipa la experiencia. En Ohmdal, por ejemplo, Empuje / Río /
Piedra / Camino / Freno / Chispa preceden a la capa formal cuando el contenido lo exige.

### Runtime web

- Vite + TypeScript como shell.
- runtimes bajo demanda cuando corresponda;
- simulación/core pedagógico separado del renderer;
- DOM/CSS para Bitácora, texto y accesibilidad;
- desktop + mobile/touch como targets de primera clase;
- no existe un engine global obligatorio.

---

## 2. Estado de las cinco campañas

### Campaña 1 — Prólogo / Instituto

**Estado:** en producción/prototipado.

Conviven piezas 2D y 3D. La decisión final se toma por evidencia de que el Instituto funciona
como lugar al que vale la pena volver, no por preferencia estética.

### Campaña 2 — Ohmdal Arco I "La Luz"

**Estado:** foco principal de producción. **Target técnico: PlayCanvas Engine v2
+ TypeScript.** La transición todavía no tiene un plan de migración aprobado.

- **Spike actual:** `src/experiences/ohmdal-playcanvas/`, ruta
  `/ohmdal-playcanvas`; es experimental y reutiliza sistemas del spike Plaza.
- **Baselines:** `/jugar` (Phaser) conserva contenido/regresiones y los árboles
  Three.js conservan evidencia visual/técnica. No reciben nuevas features por
  inercia ni se eliminan incidentalmente.
- **Topología ratificada:** 11 macroáreas (Plaza Cuenca, Taller, Calzada, Manantial,
  Castillo ext, Castillo int, Forja Patio, Forja Profunda, Terrazas, Lago, Faro). Ver
  `ARC1_ROOM_GRAPH.md` y `ARC1_SPATIAL_MAP.md`.
- **Cero nuevas dependencias/upgrades** dentro de la limpieza de harness.
- Los modelos de puzzles renderer-neutral (`src/puzzles/*Model.ts`) y los 70+ tests
  existentes se conservan tal cual.

Capítulos del GDD vigente:

| # | Título | Centro técnico | Cierre observable |
|---|---|---|---|
| Prólogo | La pregunta vuelve | circuito completo + primera medición | Ohm despierto; Plaza legible |
| 1 | La Calzada | tensión, corriente, resistencia, continuidad | Calzada con luz/agua; esquema publicado |
| 2 | El Castillo de la Red | serie, paralelo, distribución, conservación | barrios aíslan fallas |
| 3 | La Forja y las Terrazas | potencia, energía, calor, materiales, seguridad | producción sin sobrecarga |
| 4 | El Faro y el Lago | lazos, divisores, equivalentes, RC si corresponde | calibración validada |
| Epílogo | La primera clase | documentación y transferencia | Edda enseña a otra persona |

### Campaña 3 — Physica Arco I "Movimiento"

**Estado:** Hito 1 jugable; campaña no es el foco principal actual.

- Runtime: Babylon.js en `src/experiences/physica/`.
- Modelos analíticos TypeScript = verdad pedagógica.
- Havok = colisiones/física secundaria, no sustituto del modelo que se enseña.
- **Babylon es la decisión actual de Physica, no de todos los mundos.**
- 2.5D es default; 3D real sólo cuando una tercera dimensión compra aprendizaje material.

Si aparece una duda concreta 2.5D vs 3D, se crea `PHY-D-A/B` con el mismo fenómeno y Learning
Contract; no se reabre el engine entero.

### Campaña 4 — Bitland Arco I

**Estado:** GDD `PROPOSED`, campaña sin código de producción.

Fantasía vigente: **máquina-ciudad dentro de un microcontrolador**.

Antes de activar la campaña se resolverá el renderer con dos spikes separados sobre el mismo
`simulation-core` TypeScript:

- `BIT-R-A` — PixiJS Machine-City.
- `BIT-R-B` — Phaser 4 Machine-City.

La campaña sigue aparcada; **los spikes sí están autorizados** porque no constituyen desarrollo
del Arco I.

### Campaña 5 — Arithmos Arco I

**Estado:** GDD `PROPOSED`, campaña sin código de producción.

El cambio de representación forma parte de la fantasía. Antes de abrir la campaña se ejecutan:

- `ARI-R-A` — Three.js Spatial Equivalence.
- `ARI-R-B` — PixiJS/SVG Diagrammatic Equivalence.

No se exige un único ganador: los spikes pueden establecer una frontera híbrida por familia de
conceptos.

---

## 3. Vertical slices y experimentos

### Ohmdal — vertical slice canónico

Objetivo: probar que narrativa, aprendizaje auténtico y la dirección PlayCanvas
funcionan juntos antes de escalar la migración.

Beats:

| Beat | Título | Qué prueba |
|---|---|---|
| VS01 | Portal / Primer encuadre | diorama, anomalía, lectura inicial |
| VS02 | Edda / Dos explicaciones | pregunta y modelos sin exposición escolar |
| VS03 | Despertar de Ohm | circuito completo + predicción |
| VS04 | Taller de Lumen | experiencia práctica y conflicto de modelos |
| VS05 | Diagnóstico de Lumen | hipótesis → medición → intervención → verificación |
| VS06 | Cruce de Edda | autonomía / transferencia |
| VS07 | Puerta de Ohm | transferencia sin teoría nueva |
| VS08 | Manantial / Formalización | cierre emocional + Bitácora |

Compilar no cuenta como aprobación. Un playtest blind-first debe recorrerlo como usuario.

### Physica

Hito 1 ya existe en Babylon. Los próximos conceptos mantienen la regla 2.5D por defecto y sólo
abren un spike dimensional cuando el concepto lo justifica.

### Bitland

Specs:

- `docs/80-production/spikes/BIT-R-A-pixijs-machine-city.md`
- `docs/80-production/spikes/BIT-R-B-phaser-machine-city.md`

### Arithmos

Specs:

- `docs/80-production/spikes/ARI-R-A-three-spatial-equivalence.md`
- `docs/80-production/spikes/ARI-R-B-pixisvg-diagrammatic-equivalence.md`

### Ohmdal asset pipeline

Antes de escalar la producción masiva de hard-surface, ejecutar cuando corresponda:

- `OHM-ASSET-A`: pipeline actual Blender/GLB.
- `OHM-ASSET-B`: Vibe3D/vibe-model para el mismo asset no-hero.

Esto decide **pipeline de una familia de assets**, no reabre Three.js ni reemplaza Blender para
personajes/orgánicos/hero assets.

---

## 4. Hitos históricos de Ohmdal — LEGACY

> Esta sección registra el plan Phaser de 2026-08-17 y ya no define el foco
> actual. Se conserva por trazabilidad y como inventario de requisitos. El
> próximo plan de hitos debe mapear esos requisitos al target PlayCanvas sin
> borrar baselines ni iniciar una migración masiva por accidente.

### H1 — Phaser greybox pre-existente · ✅ hecho

El runtime Phaser top-down de `/jugar` existe y demuestra el contenido del Arco I como greybox
a 960×540. Sirve como baseline de regresión y como insumo del refactor multi-área. **No es
más el destino de la producción** (ver `ADR-001`).

### H2 — Cimientos multi-área en `src/jugar/` · LEGACY

Refactor arquitectónico mínimo para soportar áreas mayores al viewport sin perder el
contenido existente:

- `AreaDef` con `width`/`height` por sala (default 960×540 → no rompe nada).
- `CameraDirector` con dead zones, encuadre autoral, modo cinemática.
- `TransitionDirector` con doorway / fade / cinematic.
- `WorldState` por región con 3 estados canónicos (DETERIORATED / INTERVENTION /
  UNDERSTOOD) y migración desde flags sueltos.
- `RenderMode` (`GREYBOX` / `PAINTED`) con toggle.
- Cinematic infra (`Cinema` API con commit / lock / play / load / restore / skip /
  fallback) + portar `playAwakening` como primer hook.
- Debug tools: hitboxes (existente), world map (existente), region state, landmarks,
  camera, render mode, cinematic hooks.
- Tests de critical path Portal→Faro, cámara bounds, world state, render mode,
  cinematic skip.

Orden de producción:

`AreaDef + CameraDirector → TransitionDirector + WorldState → RenderMode + greybox →
Cinematic + debug → tests → recorrido Portal→Faro jugable`.

No gastar assets nuevos en esta fase; el éxito es **espacial**, no visual.

### H3 — Plaza multi-área greybox + Despertar de Ohm

Primer área grande del Arco I en GREYBOX con cámara móvil y world state:

- `area-plaza-cuenca` (1920×1080) navegable a pie con cámara con dead zones.
- Puzzle `despertar` + cinemática `cinema.awakening` (reencarna `playAwakening`).
- Conexión con `area-taller` (fade), `area-calzada` (cinemática monumental cuando se
  desbloquea), `area-castillo-ext` (reja), `area-forja-patio` (arco), `area-terrazas`
  (arco).
- Transición de región `cuenca`: DETERIORATED → INTERVENTION → UNDERSTOOD con lecturas
  observables.

### H4 — Cuenca completa (Calzada + Manantial) + Instituto recuerda

Cap 1 entero: Taller, Calzada, Manantial. Cierre emocional con la Bitácora (formalización
`ley-de-ohm`). Al salir de Ohmdal, el Instituto cambia de estado (meta-juego).

### H5 — Castillo de la Red (ext + int) · serie/paralelo

Cap 2 entero: `area-castillo-ext` + `area-castillo-int` con puzzles `chain`, `branches`,
`distributor`. Cierre observable: `castleRestored`; barrios aíslan fallas.

### H6 — Forja (Patio + Profunda) y Terrazas

Cap 3 entero: `area-forja-patio` + `area-forja-profunda` + `area-terrazas`. Puzzles
`timbre`, `warmth`, `infirmary`, `longchannel`, `forge`, `steps`, `fairsplit`,
`singlestone`, `ladder`. Cierre: `forgeRestored` + `valleyRestored`.

### H7 — Lago y Faro (clímax del Arco) + Epílogo

Cap 4 + Epílogo: `area-lago` + `area-faro`. Puzzles `storedspark`, `sleepingriver`,
`clock`, `lighthouse`. Cierre observable: `lighthouseRestored`; Edda enseña a otra
persona; el protagonista ya no es indispensable. Cinemáticas
`cinema.faro-reveal`, `cinema.faro-closing`, `cinema.instituto-return`.

### H8 — Pase de arte sobre blockout aprobado

Aplicar dirección visual `docs/arco1/` sobre las 11 macroáreas greybox ya aprobadas.
GREYBOX deja de ser default; el render mode default pasa a `PAINTED`. Antes de producir
grandes familias hard-surface, resolver `OHM-ASSET-A/B` si el pipeline sigue siendo
una duda material.

### H9 — Slice global de integración

Instituto + Bitácora + Ohmdal + al menos otro mundo/lectura interdisciplinaria suficiente
para validar que el ecosistema funciona como una unidad.

### H10+ — Apertura de campañas

Después de validar el patrón de producción de Ohmdal, el roadmap puede elevar la siguiente
campaña a `in-progress`. Los spikes Bitland/Arithmos pueden ocurrir antes porque sólo
resuelven incertidumbres y no comprometen producción de campaña. Reactivar el árbol
HD-2D (`src/hd2d-ohmdal/`) requiere un ADR nuevo (ver `ADR-001` §8).

---

## 5. Baselines que no se borran por accidente

> **Actualizado por `ADR-001` (2026-08-17).**

- `/jugar` (Phaser 4) — **dirección de producción vigente** del Arco I, evolucionado a
  multi-área. Conserva todo el contenido existente (20 salas, puzzles, assets pintados,
  Bitácora). No se borra; se refactoriza.
- `src/hd2d-ohmdal/` (Three.js) — **rama experimental** (ver `ADR-001` §2.3). No se
  borra del repo, pero no recibe features nuevas sin un ADR.
- `src/ohmdal-arco1/` (HD-2D early spike) — se mantiene como experimental; ver
  `ADR-001` §5 open questions.
- `/physica` — Hito 1 Babylon (sin cambios).
- shell/RuntimeHost, estado y Bitácora compartidos.
- prototipos históricos sólo se eliminan cuando ya no aportan regresión/evidencia y la
  limpieza está explícitamente dentro de una tarea.

No se confunde “legacy” con “basura”: una base de regresión puede ser legacy visual y
seguir siendo útil. Pero ningún documento legacy gobierna una decisión nueva. Los
documentos `LEGACY` del refactor Ohmdal están listados en `ADR-001` §2.3.

---

## 6. Grietas conocidas

- Instituto todavía tiene coexistencia 2D/3D y debe validar su función de hogar.
- varios puzzles del baseline Ohmdal siguen siendo modales y se evalúan caso por caso
  durante el refactor multi-área.
- safe areas/mobile y navegación táctil deben formar parte de los gates de las escenas nuevas.
- la capa intermedia de la Bitácora no está completa en toda la implementación.
- Physica H1 no cierra por sí solo el diseño de todo su Arco I.
- Bitland/Arithmos todavía no tienen engine/renderer final; resolverlo por spikes, no por debate.
- **El refactor multi-área en `src/jugar/` está en H2 con la base arquitectónica pendiente**
  (ver `RECOVERY_AUDIT.md` §13). El `package.json` no se toca, pero el árbol
  `src/jugar/` se reorganiza (AreaDef, CameraDirector, TransitionDirector, WorldState,
  RenderMode, Cinema).
- El árbol `src/hd2d-ohmdal/` queda congelado salvo spike autorizado; cualquier
  desbloqueo requiere un ADR nuevo (ver `ADR-001` §8).
- Los docs `arcol-rebuild/02-world-topology.md` y `03-hd2d-greybox-build.md` pasan a
  `LEGACY`; son referencia conceptual, no plan de producción.

---

## 7. Aparcado vs investigación permitida

**Aparcado:**

- producción completa de Bitland;
- producción completa de Arithmos;
- Ciclos II y Proyectos Integradores todavía no activados.

**Permitido:**

- los spikes A/B explícitamente listados en `docs/80-production/spikes/`;
- spikes de asset pipeline que retiren riesgo real de Ohmdal.

---

## 8. Forma de trabajo

La forma vigente está en `AGENTS.md` y `docs/80-production/AI_TOOLING.md`.

```text
Manuel / ChatGPT web — objetivo, diseño y decisiones
  ↓ spec
Codex — implementación, integración y validación
  ├─ PlayCanvas / Blender cuando su estado vivo lo justifica
  ├─ mmx por terminal para producción delegada
  └─ Gemini como peer multimodal/contextual
  ↓ evidencia
Manuel — decisiones materiales e integración de milestone
```

Una tarea player-facing requiere gate mecánico y recorrido real; la reparación
se basa en evidencia reproducible, no en retries abiertos.

Un defecto que sobrevive a dos reparaciones informadas hace revisar spec/representación antes de
seguir parcheando.

---

## 9. Human gate

Escalar/ratificar con Manuel cuando cambia:

- diseño/experiencia;
- guion;
- dependencia/engine/runtime/bundler;
- canon/autoridad documental;
- ganador de un spike;
- dirección visual material;
- integración/merge de una milestone de producto.

Los fixes técnicos locales dentro de un Task Contract claro pueden resolverse en la rama y
volver al loop sin crear una ceremonia adicional.
