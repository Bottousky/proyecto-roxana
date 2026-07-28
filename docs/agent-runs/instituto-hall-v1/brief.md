# Brief — instituto-hall-v1

**Estado:** draft contractual
**Autorización de ejecución:** no
**Director:** hilo principal de Codex
**Base propuesta:** `codex/setup-ecosistema-3d`; fijar `baseCommit` antes de crear worktrees

## Objetivo

Preparar un laboratorio aislado para validar el lenguaje visual del hall del Instituto mediante
un blockout navegable, modular y medible. El resultado debe permitir decidir composición,
escala, cámara, materiales base y viabilidad mobile antes de producir ambientes completos.

## Alcance propuesto

- Ruta de laboratorio aislada, sin reemplazar la experiencia estable.
- Arquitectura procedural modular del hall.
- Materiales e iluminación mínimos para validar el lenguaje.
- Inventario de assets con manifiestos; Meshy permanece deshabilitado.
- Integración única y revisión desktop/mobile con Playwright y `renderer.info`.
- Arquitectura y Asset Forge se ejecutan como tareas separadas de Codex App en modo Worktree;
  no como dos escritores dentro del mismo checkout.

## Fuera de alcance

- Reconstruir el Instituto completo.
- Declarar arte final al greybox o al prototipo preservado.
- Modificar Ohmdal, guardado, modelos pedagógicos o `RuntimeHost`.
- Cambiar el comportamiento estable de `/jugar`.
- Generar, texturizar o refinar assets pagos.
- Adoptar Agents SDK o automatización de lotes.

## Decisiones requeridas antes de autorizar

1. Confirmar la ruta propuesta `/labs/instituto-hall` y su gate.
2. Aprobar el contrato visual y el encuadre base.
3. Fijar el commit base común.
4. Confirmar que el primer pase no usa Meshy.

## Definition of Done del futuro hito

- Blockout modular legible con escala humana y navegación verificable.
- Archivo de integración modificado sólo por el Director.
- Build, tests, capturas 1440×900 y 390×844 sin errores de consola.
- Métricas desktop/mobile contrastadas con `docs/3d/BUDGETS.md`.
- Una revisión objetiva registrada y máximo dos rondas automáticas.
- Commits, deuda, riesgos y decisiones registrados en `final-report.md`.

Este archivo inicializa planificación; no autoriza producción visual.
