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

Para cualquier asset identitario/hero:

1. buscar primero referencias existentes en el repo;
2. leer `docs/3d/HERO_REFERENCE_GATE.md`;
3. crear/aprobar `hero-reference.json` usando el template de
   `assets/references/hero-packs/_template/`;
4. validar con `npm run 3d:validate-hero-ref -- <archivo>`;
5. recién después modelar/generar;
6. tratar `assets/references/hero-packs/ohm/hero-reference.json` +
   `scripts/3d/build_ohm_hero.py` como golden path de reconstrucción fiel.

Si existe turnaround aprobado, el objetivo es **reconstruir**, no rediseñar. Una
herramienta generativa puede producir candidates, pero no desplaza la referencia
primaria ni evita Blender/canonicalización.

Cargar sólo la skill oficial de PlayCanvas que corresponda a la operación
concreta. Usar el MCP del Editor sólo si la tarea requiere su estado vivo; para
Engine code-first usar terminal.

Durante implementación correr tests enfocados. Cerrar con `npm run verify` y,
si el cambio es player-facing, recorrer la ruta real en desktop y touch/mobile.