# Proyecto Roxana

Proyecto Roxana es un ecosistema educativo jugable para web. El jugador llega
al Instituto Roxana y aprende interviniendo mundos cuyas reglas hacen visible el
conocimiento antes de formalizarlo.

> **observar → experimentar → predecir → comprender → formalizar → reutilizar**

Los mundos comparten producto, protagonista, Instituto, Bitácora y filosofía
pedagógica; no están obligados a compartir motor, cámara, género o arte.

## Fuente de verdad

1. [`docs/START_HERE.md`](docs/START_HERE.md) — norte de producto.
2. [`ROADMAP.md`](ROADMAP.md) — orden de trabajo.
3. [`AGENTS.md`](AGENTS.md) — operación técnica del repo.
4. `docs/20-worlds/<mundo>/AGENTS.md` — reglas del mundo afectado.
5. [`docs/80-production/AI_TOOLING.md`](docs/80-production/AI_TOOLING.md) — herramientas de IA.

Ante contradicciones, aplicar
[`docs/00-governance/ROXANA_CANON_POLICY_v1.md`](docs/00-governance/ROXANA_CANON_POLICY_v1.md).

## Direcciones actuales

| Scope | Verbo / función | Dirección técnica |
|---|---|---|
| Instituto | unir / recordar / transformar | Three.js axonométrico + DOM |
| Ohmdal | **CONECTAR** | PlayCanvas Engine v2 + TypeScript; transición en preparación |
| Physica | **EXPERIMENTAR** | Babylon.js + modelos analíticos TypeScript |
| Bitland | **PROGRAMAR** | simulation core TS + DOM; renderer por spikes |
| Arithmos | **TRANSFORMAR** | transformation core TS; representación por evidencia |

Ohmdal conserva `/jugar` y otros prototipos como baselines. El spike actual de
PlayCanvas vive en `src/experiences/ohmdal-playcanvas/`; todavía no representa
una migración completa ni autoriza borrar los runtimes anteriores.

## Desarrollo local

```bash
npm install
npm run dev
```

Servidor por defecto: `http://localhost:5173`.

Gate mecánico normal:

```bash
npm run verify
```

Para aislar fallos o cuando `verify` no esté disponible:

```bash
npm run build
npm test
```

Un cambio player-facing también debe abrirse y recorrerse en el navegador; un
build verde o una captura no demuestran que la experiencia esté terminada.

## Harness técnico

```text
ChatGPT web → specs/decisiones
                     ↓
                  Codex
        ┌────────────┼────────────┐
 PlayCanvas MCP  Blender MCP   terminal
                                  ├─ mmx
                                  ├─ git
                                  └─ npm/build/tools

Gemini ↔ mismo repo mediante agent-work/
```

Codex es el único master harness técnico. MiniMax trabaja por CLI `mmx` y no
aprueba su propia salida. Gemini es un peer multimodal/contextual. No hay router
automático, cola ni framework de orquestación.

## Estructura documental

```text
docs/
├── 00-governance/   canon, pilares y autoridad
├── 10-global/       Instituto, Bitácora y sistemas comunes
├── 20-worlds/       GDD y producción por mundo
├── 30-integration/  cruces interdisciplinarios
├── 80-production/   tooling mínimo, contratos y spikes
├── 3d/              pipeline y QA 3D
├── arco1/           dirección visual viva de Ohmdal
└── sessions/        historial de diseño; no autoridad vigente
```

Mapa completo: [`docs/README.md`](docs/README.md).
