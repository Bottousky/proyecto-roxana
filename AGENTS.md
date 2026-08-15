# AGENTS.md — Proyecto Roxana

**Manual operativo del estudio.** Lo lee cualquier agente que entre al repositorio.
Define cómo se trabaja, qué se respeta y de dónde se saca la verdad. **No** contiene
lore ni diseño de producto; eso vive en [`docs/`](docs/) y en los `AGENTS.md` por mundo.

> Este archivo es la capa de gobierno. El [`CLAUDE.md`](CLAUDE.md) y el [`ROADMAP.md`](ROADMAP.md)
> siguen vigentes como contrato de trabajo y como plan de hitos. Si contradicen, gana `CLAUDE.md`.

---

## 1. Identidad

Proyecto Roxana es una **experiencia educativa basada en mundos** donde el conocimiento
constituye las reglas manipulables del gameplay. El jugador experimenta antes de recibir
formalización académica.

Los cuatro mundos del producto, cada uno con su verbo y su gramática:

| Mundo | Verbo | Disciplina |
|---|---|---|
| **Ohmdal** | **CONECTAR** | Electrónica (corriente continua) |
| **Physica** | **EXPERIMENTAR** | Física (cinemática, dinámica) |
| **Bitland** | **PROGRAMAR** | Programación |
| **Arithmos** | **TRANSFORMAR** | Matemática |

El Instituto Roxana es el hogar compartido: donde el jugador vuelve, lo que cambia
con sus acciones, y la cámara que recuerda su paso.

---

## 2. Estados de autoridad documental

Todo documento de autoridad declara **uno** de los siguientes estados (definidos en
[`docs/00-governance/ROXANA_CANON_POLICY_v1.md`](docs/00-governance/ROXANA_CANON_POLICY_v1.md)):

| Estado | Significado |
|---|---|
| `CANON` | Regla ratificada. Sobrevive hasta nueva decisión explícita. |
| `PROPOSED` | Candidato activo. Default para todo lo nuevo. |
| `LEGACY` | Referencia histórica sin autoridad actual. |
| `EXPERIMENTAL` | Hipótesis atada a un prototipo. No se eleva sin validación. |
| `REJECTED` | Descartado conscientemente. Permanece registrado. |

Niveles numéricos (`authority_level` 0–7): menor número = mayor autoridad. Jerarquía en
[`docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md`](docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md).

**Si dos documentos contradicen:** mayor `authority_level` → ratificación más reciente
→ código nunca convierte una idea en canon (se corrige el código o se eleva por ADR).

---

## 3. Reglas duras del estudio

Las rompe un agente que se respete, no se parchean:

1. **El texto del juego no se inventa.** Se copia textual del guion. Si falta una línea:
   `// TODO(guion)` + placeholder neutro + reportar.
2. **El vocabulario técnico es spoiler.** `serie`, `paralelo`, `nodo`, `Kirchhoff`,
   `capacitor` solo aparecen en la capa formal de la Bitácora, gateada por flags de
   formalización. Lo mismo vale para los términos formales de Physica/Bitland/Arithmos.
3. **Validación por condiciones, no por solución fija.** Todo puzzle acepta ≥2 soluciones.
   Ver [`docs/guia-puzzles.md`](docs/guia-puzzles.md) (CANON).
4. **Modelo puro testeable por puzzle.** `src/puzzles/xModel.ts` + `tests/mX-x.test.ts`.
   Imports con extensión `.ts`. Los tests corren con `node --experimental-strip-types`.
5. **Español neutro (tuteo).** Sin voseo, sin "vos". El gate lo verifica.
6. **Sin dependencias nuevas** sin pedirlo antes.
7. **No romper lo jugable.** El Arco I de Ohmdal y la landing funcionan hoy: son la base
   de regresión. Cualquier cambio que los rompa se revierte, no se parchea.
8. **Nunca commitear sin aprobación de Manuel.**

---

## 4. Política de carga de contexto (Context-on-Demand)

No leas los 200 archivos. Para una tarea concreta:

```text
Objetivo
  ↓
Identifica el mundo (ohmdal / physica / bitland / arithmos / instituto / global)
  ↓
Lee AGENTS.md raíz (este) + AGENTS.md del scope más cercano
  ↓
Lee el documento de autoridad nivel ≤2 que aplique
  ↓
Lee el task spec / brief
  ↓
Trabaja con código + assets requeridos
```

Jerarquía de herencia para agentes:

```text
AGENTS.md raíz            ← reglas del estudio
  +
<scope>/AGENTS.md         ← reglas locales del scope (ej: 20-worlds/ohmdal/AGENTS.md)
  +
docs/<nivel>/...          ← autoridad documental (00-governance → 10-global → 20-worlds → 30-integration)
  +
task spec / brief         ← qué producir
```

---

## 5. Por mundo, qué agente usar

| Tarea | Mundo | Sub-agent recomendado |
|---|---|---|
| Diseñar puzzle eléctrico (modelo + vista + Bitácora) | Ohmdal | `worker-gameplay` + revisión de `visual-review` |
| Modelar circuito de Ohmdal, validar ≥2 soluciones | Ohmdal | `worker-gameplay` (modelo puro + tests) |
| Pintar/animar sprites Ohmdal, dioramas HD-2D | Ohmdal | `worker-world` + `m3-visual` |
| Auditar puzzle existente contra `guia-puzzles.md` | Ohmdal | `m3-qa` (QA) |
| Cinematografía de Ohmdal (encuadres, cámara) | Ohmdal | `m3-visual` |
| Modelar física analítica (MRUV, tiro parabólico, vectores) | Physica | `m3-gameplay` (modelos) + `worker-qa` (tests) |
| Implementar escena Babylon de Physica | Physica | `worker-world` |
| Auditar puzzle físico contra `guia-puzzles.md` | Physica | `m3-qa` |
| Diseñar puzzle de Bitland (lenguaje como jugable) | Bitland | `worker-gameplay` (modelo puro + tests) |
| Auditar puzzle Bitland | Bitland | `m3-qa` |
| Diseñar puzzle Arithmos (transformación de estructura) | Arithmos | `worker-gameplay` (modelo puro + tests) |
| Auditar puzzle Arithmos | Arithmos | `m3-qa` |
| Auditoría visual transversal | Cualquiera | `visual-review` (abre el navegador) |
| Investigación documental amplia (leer mucho, proponer poco) | Cualquiera | `explore` |
| Tarea multi-paso no especializada | Cualquiera | `general` |

> Los sub-agents especializados (`m3-*` / `worker-*`) están optimizados para Physica
> pero sus patrones aplican a Ohmdal/Bitland/Arithmos porque comparten la disciplina
> "modelo puro testeable + vista + feedback observable".

---

## 6. Fuentes de verdad — dónde mirar primero

### Norte de producto

- [`docs/START_HERE.md`](docs/START_HERE.md) — promesa, loop, mundos, Bitácora, arquitectura.
- [`ROADMAP.md`](ROADMAP.md) — qué se está construyendo y en qué orden.
- [`CLAUDE.md`](CLAUDE.md) — reglas duras de trabajo (este archivo las resume).

### Autoridad de gobierno (no se contradice sin ADR)

- [`docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md`](docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md)
- [`docs/00-governance/ROXANA_CANON_POLICY_v1.md`](docs/00-governance/ROXANA_CANON_POLICY_v1.md)
- [`docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md`](docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md)
- [`docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md`](docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md)
- [`docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`](docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md)

### Autoridad global (biblia del producto)

- [`docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md`](docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md) — el Instituto como espacio.
- [`docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md`](docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md) — el sistema pedagógico común.
- [`docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md`](docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md) — la historia que une todo.
- [`docs/10-global/ROXANA_GLOBAL_UI_UX_v1.md`](docs/10-global/ROXANA_GLOBAL_UI_UX_v1.md) — UI/UX transversal.

### Por mundo (autoridad local)

- [`docs/20-worlds/ohmdal/AGENTS.md`](docs/20-worlds/ohmdal/AGENTS.md) — único mundo en producción real.
- [`docs/20-worlds/physica/AGENTS.md`](docs/20-worlds/physica/AGENTS.md) — Hito 1 hecho, Arco I pendiente.
- [`docs/20-worlds/bitland/AGENTS.md`](docs/20-worlds/bitland/AGENTS.md) — PROPOSED, sin código todavía.
- [`docs/20-worlds/arithmos/AGENTS.md`](docs/20-worlds/arithmos/AGENTS.md) — PROPOSED, sin código todavía.

### Canon de puzzles (transversal)

- [`docs/guia-puzzles.md`](docs/guia-puzzles.md) — **CANON**. Lee antes de crear o auditar cualquier puzzle.

---

## 7. Forma de trabajo (recordatorio)

Un hito = algo que se puede abrir en el navegador y jugar. Se hace uno por vez.

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm test         # todos los tests de tests/
npm run verify   # build + tests + gate de dialecto y spoilers (requiere bash)
```

Ciclo:

1. Implementar.
2. `npm run build` y `npm test` en verde.
3. Verlo funcionando en el navegador.
4. Proponer el commit a Manuel y esperar su ok.

Si algo de esto se saltea, está mal.

---

## 8. Cuándo parar y preguntar a Manuel

- Decisiones de diseño (qué dice un personaje, cómo se siente un puzzle, qué va en pantalla).
- Adopción de dependencias o librerías nuevas.
- Cambios de arquitectura (motor, runtime, bundler).
- Cambios a docs `CANON` o nivel 0–1.
- Cualquier commit.

Lo técnico se resuelve y se sigue.