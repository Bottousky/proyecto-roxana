---
name: roxana-minimax
description: Delegar producción de Roxana a MiniMax mediante el CLI mmx, con staging, procedencia y revisión obligatoria de Codex.
---

# Roxana + MiniMax

Usar `mmx` directamente por terminal. No crear MCP, wrapper ni router.

1. Definir objetivo, entradas, límites, formato de salida y criterio de revisión.
2. Elegir `mmx text`, `image`, `speech`, `music` o `vision` según el artefacto.
3. Para agentes/CI usar `--non-interactive --quiet --output json` cuando aplique.
4. Escribir generaciones primero en `minimax-output/`, nunca sobre un asset final.
5. Conservar prompt, proveedor y procedencia para medios que sobrevivan.
6. Codex revisa hechos, licencia, calidad e integración; MiniMax no aprueba su
   propio trabajo.
7. No usar video ni lotes costosos como prueba de instalación.

Comandos y estado local: `docs/80-production/AI_TOOLING.md`.
