# Proyecto Roxana

Proyecto Roxana es un **ecosistema educativo jugable para web**. El jugador llega al Instituto Roxana y aprende distintas disciplinas interviniendo mundos cuyas reglas hacen visible el conocimiento antes de formalizarlo.

La promesa común es:

> **observar → experimentar → predecir → comprender → formalizar → reutilizar**

Los mundos no tienen obligación de compartir motor, cámara, género ni lenguaje visual. Comparten protagonista, Instituto, Bitácora, progreso, narrativa y filosofía pedagógica.

## Fuente de verdad

Empezar siempre por:

1. [`docs/START_HERE.md`](docs/START_HERE.md) — norte de producto actual.
2. [`ROADMAP.md`](ROADMAP.md) — qué se construye y en qué orden.
3. [`AGENTS.md`](AGENTS.md) — reglas operativas para cualquier agente.
4. [`docs/80-production/agentic/README.md`](docs/80-production/agentic/README.md) — harness de producción con IA.
5. `docs/20-worlds/<mundo>/AGENTS.md` — reglas y fuentes de autoridad del mundo afectado.

La documentación histórica sigue siendo material de referencia, pero **no gobierna cuando contradice una fuente vigente de mayor autoridad**. Ver [`docs/00-governance/ROXANA_CANON_POLICY_v1.md`](docs/00-governance/ROXANA_CANON_POLICY_v1.md).

## Los cinco espacios

| Scope | Verbo / función | Dirección actual |
|---|---|---|
| **Instituto** | unir / recordar / transformar | Three.js axonométrico + DOM; debe demostrar que funciona como hogar, no como menú 3D |
| **Ohmdal** | **CONECTAR** | Three.js HD-2D / 2.5D; producción principal actual |
| **Physica** | **EXPERIMENTAR** | Babylon.js + modelos analíticos TS; 2.5D por defecto, 3D sólo cuando mejora comprensión |
| **Bitland** | **PROGRAMAR** | máquina-ciudad dentro de un microcontrolador; simulation core TS + DOM; PixiJS vs Phaser 4 por spikes separados |
| **Arithmos** | **TRANSFORMAR** | transformation core TS; vistas Three.js / PixiJS-SVG / DOM según representación |

Las decisiones todavía experimentales viven en [`docs/80-production/agentic/ENGINE_MATRIX.md`](docs/80-production/agentic/ENGINE_MATRIX.md).

## Estado del producto

- **Ohmdal**: existe un Arco I greybox completo en `/jugar` que se conserva como baseline de contenido/regresión. La dirección de producción es el runtime HD-2D en Three.js; el baseline Phaser no define la presentación final.
- **Physica**: tiene un Hito 1 Babylon jugable y modelos analíticos separados del renderer. No obliga a los otros mundos a usar Babylon.
- **Bitland**: GDD en estado `PROPOSED`; antes de elegir renderer se ejecutarán spikes aislados PixiJS y Phaser 4 sobre el mismo simulation core.
- **Arithmos**: GDD en estado `PROPOSED`; se validarán por separado representación espacial Three.js y representación diagramática PixiJS/SVG.
- **Instituto**: conviven implementaciones históricas/prototipos; la hipótesis Three.js debe probar sus funciones de meta-juego antes de quedar cerrada.

## Desarrollo local

```bash
npm install
npm run dev
```

Servidor local por defecto: `http://localhost:5173`.

Verificación base:

```bash
npm run build
npm test
npm run verify
```

**Mechanical PASS no implica DONE.** Toda milestone jugable debe abrirse y recorrerse en el runtime real según [`docs/80-production/agentic/WORKFLOW.md`](docs/80-production/agentic/WORKFLOW.md).

## Stack web actual

- Vite + TypeScript.
- Three.js para Instituto/Ohmdal y representaciones espaciales donde corresponda.
- Babylon.js para Physica.
- Phaser 4 conserva el baseline Ohmdal y es candidato experimental para Bitland.
- PixiJS es candidato experimental para Bitland/Arithmos; no se agrega al producto hasta que un spike lo justifique.
- DOM/CSS para Bitácora, texto, accesibilidad e interfaces complejas.
- Playwright + hooks deterministas para QA de gameplay.
- Blender → GLB como pipeline 3D vigente; Vibe3D/vibe-model se evalúa sólo por spike para assets hard-surface de Three.js.
- Desktop + mobile/touch son targets de primera clase.

Las versiones reales están en `package.json`; no se actualizan engines como efecto lateral de una tarea.

## Producción con IA

El sistema propuesto es específico para juegos:

```text
Manuel — objetivo
  ↓
GPT-5.6 Sol — Director / Loop Owner
  ↓ Task + Learning Contract
MiniMax M3 / MiniMax Code — Builder
  ↓
build + tests + verify
  ↓
GPT-5.6 Luna — Player Agent blind-first
  ├─ FAIL → DeepSeek V4 Flash — reparación acotada → replay
  └─ PASS
      ↓
GLM — adversarial read-only review
      ↓
GPT-5.6 Sol — DONE / REPAIR / ESCALATE
      ↓
Manuel — integración material
```

Objetivo normal: **1–3 repair loops**. Hard cap: **5**. No se usa un loop abierto del tipo “seguir hasta AAA”.

Ver:

- [`docs/80-production/agentic/MODEL_ROUTING.md`](docs/80-production/agentic/MODEL_ROUTING.md)
- [`docs/80-production/agentic/SPIKE_POLICY.md`](docs/80-production/agentic/SPIKE_POLICY.md)
- [`docs/80-production/agentic/GAME_DEV_AI_TOOLING.md`](docs/80-production/agentic/GAME_DEV_AI_TOOLING.md)

## Estructura documental

```text
docs/
├── 00-governance/        # pilares, canon, lenguaje, arquitectura documental
├── 10-global/            # Instituto, Bitácora, campañas, UI/UX
├── 20-worlds/            # GDD modular y producción por mundo
├── 30-integration/       # cruces interdisciplinarios
├── 80-production/
│   ├── agentic/          # harness, routing, DoD, tooling, spikes
│   └── spikes/           # specs comparativas aisladas
├── ohmdal-biblia/        # fuente histórica absorbida progresivamente por docs v1
├── arco1/                # dirección visual viva de Ohmdal
├── 3d/                   # pipeline y contratos 3D
└── sessions/             # proceso/historial; no autoridad de producto
```

Para localizar autoridad documental, usar [`docs/README.md`](docs/README.md).
