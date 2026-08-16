# Roadmap

> **Actualizado:** 16 de agosto de 2026.
>
> **Norte:** el Instituto Roxana como hogar que recuerda y cambia, con cinco campañas
> independientes (Prólogo + Ohmdal + Physica + Bitland + Arithmos) unidas por interludios
> transversales. Verbo nuclear por mundo: CONECTAR / EXPERIMENTAR / PROGRAMAR / TRANSFORMAR.
>
> Los GDD v1 y governance tienen mayor autoridad que este roadmap. Las decisiones de
> engine/renderer todavía experimentales viven en
> `docs/80-production/agentic/ENGINE_MATRIX.md` y no se promueven a canon por accidente.

Un hito de producción = algo que se puede abrir en el navegador y jugar/verificar al terminar.
Los **spikes** son la excepción explícita: existen para retirar una incertidumbre antes de abrir
una campaña y se ejecutan con la política de `docs/80-production/agentic/SPIKE_POLICY.md`.

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

**Estado:** foco principal de producción.

- `/jugar`: Phaser top-down greybox, Arco I completo como baseline de contenido/regresión.
- HD-2D: dirección de producción en `src/hd2d-ohmdal/`.
- Three.js es el renderer de la dirección HD-2D actual.
- `/jugar` no recibe la nueva dirección visual por inercia y se conserva hasta que exista
  paridad suficiente.

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

Objetivo: probar que narrativa, aprendizaje auténtico y presentación HD-2D funcionan juntos.

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

Compilar no cuenta como aprobación. El Player Agent debe recorrerlo como usuario.

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

## 4. Hitos de Ohmdal

### H1 — HD-2D fuera del laboratorio · ✅ hecho

La dirección HD-2D existe en el repo y demostró el lenguaje visual básico. El árbol activo de
world building nuevo es `src/hd2d-ohmdal/`.

### H2 — Plaza real HD-2D · ← foco actual

Construir terreno/arquitectura/navegación/contenido de la Plaza del Arco I con Edda, Ohm,
campana y lámparas.

Orden de producción:

`greybox navegable → kit modular → materiales/luz → assets identitarios → hero assets → polish`.

No gastar arte hero antes de que navegación, escala, cámara y affordances estén aprobadas.

### H3 — Despertar de Ohm HD-2D

Primer puzzle que demuestra que HD-2D **se juega**, no sólo se camina:

`predecir → intervenir → observar consecuencia → explicar`.

### H4 — Instituto recuerda la partida

Al salir de Ohmdal, el Instituto cambia de estado de forma visible y demuestra la promesa de
meta-juego.

### H5 — Pase de arte sobre blockout aprobado

Aplicar dirección `docs/arco1/` sobre geometría/escenas ya aprobadas. Antes de producir grandes
familias hard-surface, resolver `OHM-ASSET-A/B` si el pipeline sigue siendo una duda material.

### H6 — La Calzada / resto del vertical slice HD-2D

Llevar Taller, diagnóstico, Puerta y cierre del slice al runtime HD-2D, conservando modelos
pedagógicos renderer-neutral.

### H7 — Resto del Arco I HD-2D

Castillo, Forja, Terrazas, Faro y Epílogo siguiendo el patrón de producción probado por H2–H6.

### H8 — Slice global de integración

Instituto + Bitácora + Ohmdal + al menos otro mundo/lectura interdisciplinaria suficiente para
validar que el ecosistema funciona como una unidad.

### H9+ — Apertura de campañas

Después de validar el patrón de producción de Ohmdal, el roadmap puede elevar la siguiente
campaña a `in-progress`. Los spikes Bitland/Arithmos pueden ocurrir antes porque sólo resuelven
incertidumbres y no comprometen producción de campaña.

---

## 5. Baselines que no se borran por accidente

- `/jugar` — Ohmdal Phaser greybox, referencia de contenido/regresión.
- `/ohmdal` / runtime HD-2D — dirección de producción nueva.
- `/physica` — Hito 1 Babylon.
- shell/RuntimeHost, estado y Bitácora compartidos.
- prototipos históricos sólo se eliminan cuando ya no aportan regresión/evidencia y la limpieza
  está explícitamente dentro de una tarea.

No se confunde “legacy” con “basura”: una base de regresión puede ser legacy visual y seguir
siendo útil. Pero ningún documento legacy gobierna una decisión nueva.

---

## 6. Grietas conocidas

- Instituto todavía tiene coexistencia 2D/3D y debe validar su función de hogar.
- varios puzzles del baseline Ohmdal siguen siendo modales y no representan el destino HD-2D.
- safe areas/mobile y navegación táctil deben formar parte de los gates de las escenas nuevas.
- la capa intermedia de la Bitácora no está completa en toda la implementación.
- Physica H1 no cierra por sí solo el diseño de todo su Arco I.
- Bitland/Arithmos todavía no tienen engine/renderer final; resolverlo por spikes, no por debate.

---

## 7. Aparcado vs investigación permitida

**Aparcado:**

- producción completa de Bitland;
- producción completa de Arithmos;
- Ciclos II y Proyectos Integradores todavía no activados.

**Permitido:**

- los spikes A/B explícitamente listados en `docs/80-production/spikes/`;
- benchmarks de modelos/harnesses que no cambien el producto;
- spikes de asset pipeline que retiren riesgo real de Ohmdal.

---

## 8. Forma de trabajo

La forma vigente está en `AGENTS.md` y `docs/80-production/agentic/WORKFLOW.md`.

```text
Manuel — objetivo
  ↓
GPT-5.6 Sol — Task + Learning Contract / Loop Owner
  ↓
MiniMax Code — Builder
  ↓
npm run build + npm test + npm run verify
  ↓
GPT-5.6 Luna — Player Agent blind-first
  ├─ FAIL → DeepSeek V4 Flash — repair → replay
  └─ PASS
      ↓
GLM — adversarial read-only review
      ↓
GPT-5.6 Sol — DONE / REPAIR / ESCALATE
      ↓
Manuel — integración material
```

Normal: 1–3 repair loops. Hard cap: 5.

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
