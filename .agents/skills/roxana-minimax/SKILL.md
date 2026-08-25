---
name: roxana-minimax
description: Delegar producción de Roxana a MiniMax con staging, contexto acotado, procedencia y revisión obligatoria de Codex/Sol.
---

# Roxana + MiniMax

MiniMax es **worker**, nunca integrador ni reviewer final.

## Ruta normal

Cuando haya plan MiniMax activo, preferir el CLI oficial `mmx` por terminal para
texto, imagen, speech, music o vision. No crear MCP ni provider framework propio.

## Ruta temporal GMI — 2026-08-24 → 2026-09-06

Durante la evaluación gratis de GMI Cloud, MiniMax M3 puede usarse mediante:

```bash
npm run agent:minimax:gmi:check
npm run agent:minimax:gmi -- \
  --task <task.md> \
  --context <archivo-relevante> \
  --out agent-work/reports/minimax-gmi/<report>.md
```

La key vive en `.env.local`, jamás en Git. El runner GMI es deliberadamente
**proposal-only**: M3 no tiene shell/filesystem; devuelve material concreto para
que Sol lo revise, aplique, testee e integre.

## Método de trabajo

1. Definir objetivo, inputs, límites y acceptance criteria.
2. Adjuntar sólo contexto relevante; no volcar el repo completo.
3. Para VFX/technical-art descomponer el efecto en capas reutilizables y exponer
   parámetros; dar módulos existentes como referencia cuando sea útil.
4. Para código pedir diffs/archivos concretos y tests esperados; M3 no puede
   afirmar que los ejecutó.
5. Si se usa `mmx` con media, generar primero en staging (`minimax-output/`) y
   conservar prompt, modelo/proveedor y procedencia.
6. No permitir que M3 y Luna editen el mismo scope en paralelo. Sol asigna dueño.
7. Codex/Sol revisa hechos, licencia, calidad, integración y tests.
8. No usar video ni lotes costosos como prueba de instalación.

## Evaluación

Registrar por tarea: first-pass applicability, correcciones de Sol, tests,
tiempo, score visual/técnico, reutilización y si el output habría justificado
pagar. La decisión final del trial es `BUY / DON'T BUY`, no entusiasmo subjetivo.

Detalles: `docs/80-production/AI_TOOLING.md` y
`agent-work/tasks/minimax-gmi-evaluation.md`.
