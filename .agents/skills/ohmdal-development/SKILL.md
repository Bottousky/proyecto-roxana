---
name: ohmdal-development
description: Implementar o revisar Ohmdal con PlayCanvas Engine v2 y TypeScript respetando canon, core pedagógico y baselines existentes.
---

# Desarrollo de Ohmdal

Leer `AGENTS.md`, `docs/20-worlds/ohmdal/AGENTS.md` y sólo las fuentes directas
de la tarea.

- Verbo nuclear: **CONECTAR**. Electricidad debe producir conducta observable
  antes de formalización.
- Target técnico: PlayCanvas Engine v2 + TypeScript + Vite + glTF/GLB.
- `src/experiences/ohmdal-playcanvas/` es un spike experimental, no un runtime de
  producción ya aprobado.
- `/jugar` y los runtimes históricos son baselines de evidencia/regresión: no
  borrarlos ni migrarlos incidentalmente.
- Mantener simulación y validación pedagógica fuera del renderer.
- No inventar diálogo/lore; usar `TODO(guion)` y reportar.
- No actualizar PlayCanvas, Vite ni otras dependencias como efecto lateral.

Si una tarea exige reconciliar muchas fuentes o revisar un set visual grande,
usar primero el peer Gemini/Antigravity definido en `AGENTS.md` y consumir su
informe compacto. No gastar contexto de Codex cargando todo Ohmdal si el task
packet ya ofrece `agent-work/tasks/gemini/` para destilarlo.

Cargar sólo la skill oficial de PlayCanvas que corresponda a la operación
concreta. Usar el MCP del Editor sólo si la tarea requiere su estado vivo; para
Engine code-first usar terminal.

Durante implementación correr tests enfocados. Cerrar con `npm run verify` y,
si el cambio es player-facing, recorrer la ruta real en desktop y touch/mobile.