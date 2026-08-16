# CLAUDE.md — compatibility shim

Este archivo existe sólo para harnesses que buscan automáticamente `CLAUDE.md`.

**No es un manual operativo independiente y no tiene autoridad propia.**

Leer, en este orden:

1. [`AGENTS.md`](AGENTS.md) — manual operativo vigente del repo.
2. [`docs/START_HERE.md`](docs/START_HERE.md) — norte de producto.
3. [`ROADMAP.md`](ROADMAP.md) — orden de producción.
4. `docs/20-worlds/<scope>/AGENTS.md` — reglas/fuentes del mundo afectado.
5. [`docs/80-production/agentic/README.md`](docs/80-production/agentic/README.md) — harness de producción con IA.

Si una instrucción histórica atribuida a este archivo contradice `AGENTS.md` o la política de canon, **ignorar la instrucción histórica**.

## Comandos base

```bash
npm run build
npm test
npm run verify
```

Mechanical PASS no significa DONE: una milestone jugable se abre, se juega y se revisa según [`docs/80-production/agentic/WORKFLOW.md`](docs/80-production/agentic/WORKFLOW.md).

## Regla de compatibilidad

Un harness puede usar este archivo para descubrir el repositorio, pero debe operar bajo los mismos contratos que Codex, MiniMax Code u OpenCode. La aplicación/harness no cambia qué significa DONE.
