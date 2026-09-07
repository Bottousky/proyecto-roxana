# Herramientas de desarrollo

Usa la herramienta que resuelva el trabajo actual con el menor contexto necesario.
Terminal, Git, TypeScript, Playwright y Blender cubren el flujo normal de Ohmdal.
PlayCanvas es su runtime; las skills se consultan sólo para la operación relevante.

Puedes delegar implementación o revisión independiente con responsabilidades
separadas. No hace falta un contrato nuevo por cada ajuste ni un proveedor fijo
para cada rol. Las instrucciones del usuario y `AGENTS.md` definen el alcance.

Los runners en `scripts/agents/` se conservan para uso explícito. El orquestador
histórico está desactivado: no despacha automáticamente las etapas A/B retiradas.
`npm run agent:gemini:check` y `npm run agent:minimax:gmi:check` comprueban sus
herramientas; no ejecutan una revisión del juego.

Verifica disponibilidad y coste antes de utilizar servicios externos. No asumas
vigentes cuotas, promociones ni nombres de modelos documentados en el pasado.
No publiques credenciales. Conserva procedencia de medios junto a los assets.
