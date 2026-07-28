# Prompt de setup para Codex — Ecosistema 3D de Proyecto Roxana

Trabajá sobre el repositorio `Bottousky/proyecto-roxana`.

## Objetivo

Dejá preparado el ecosistema de producción 3D de Proyecto Roxana: reglas de agente, skills, MCP, manifiestos de assets, estructura source/runtime, validadores, documentación, QA visual y políticas de Meshy. Este trabajo es **setup**, no una reconstrucción artística del hall.

## Reglas críticas

- Antes de modificar, auditá `README.md`, `package.json`, `docs/plan-plataforma-cinco-juegos.md` y `docs/spec-p3-escuela-3d.md`.
- Conservá TypeScript + Vite + Phaser + Three.js y el `RuntimeHost`.
- No migres a React, R3F, Next.js ni otro motor.
- No reescribas Ohmdal.
- No alteres el comportamiento estable sin `?school3d=1`.
- El spike del Instituto actual es greybox deliberado; no lo declares arte final.
- Creá la rama `codex/setup-ecosistema-3d` desde `main`, salvo que exista trabajo sin integrar; en ese caso frená y reportá.
- Nunca expongas `MESHY_API_KEY`, nunca la insertes en código cliente y nunca la commitees.
- No consumas créditos Meshy salvo una consulta de balance; si no hay credencial, dejá la prueba pendiente y continuá con el resto.
- No agregues dependencias de producción sin justificar y registrar el motivo.

## Biblia

Usá como contrato el archivo `Proyecto_Roxana_Ecosistema_3D_Setup_Codex.md`. Implementá el setup que describe, adaptándolo al estado real del repositorio. Si la guía y el código difieren, preservá el código estable y documentá la diferencia.

## Fase 0 — Baseline

1. Ejecutá `git status`, versiones de herramientas, `npm install`, `npm run build`, `npm test` y `npm run verify`.
2. Guardá resultados y fallos preexistentes en `docs/3d/SETUP_REPORT.md`.
3. No arregles fallos no relacionados silenciosamente.

## Fase 1 — Instrucciones y skills

1. Creá `AGENTS.md` con las reglas del Apéndice A de la guía, ajustadas a comandos reales.
2. Creá `.agents/skills/roxana-3d-director` con `SKILL.md`, referencias y un validador mínimo.
3. Instalá o copiá de forma reproducible:
   - OpenAI `develop-web-game`;
   - `img2threejs`;
   - MengTo: `build-hybrid-game-assets`, `author-game-levels`, `build-game-camera-controls`, `optimize-threejs-games`, `test-playable-web-games`;
   - Meshy: `meshy-3d-generation` y `meshy-3d-printing`.
4. Registrá origen, commit, licencia y fecha en `docs/3d/TOOLCHAIN_LOCK.md`.
5. Verificá descubrimiento. Si Codex necesita reinicio, indicá el paso y seguí con archivos.

## Fase 2 — MCP y secretos

1. Creá `.codex/config.toml.example` con Playwright y Meshy.
2. Meshy debe usar `env_vars = ["MESHY_API_KEY"]`.
3. Creá `.env.example` sin valor y asegurá ignores correctos.
4. Verificá Playwright MCP con navegación local simple cuando el servidor esté activo.
5. Para Meshy, consultá balance sólo si la variable ya existe. No pidas ni copies el secreto en documentación o salida.

## Fase 3 — Contratos de assets

1. Creá `docs/3d`: `README`, `ECOSYSTEM`, `VISUAL_BIBLE`, `SCALE_BIBLE`, `BUDGETS`, `ASSET_PIPELINE`, `MESHY_POLICY`, `QA_PROTOCOL`, `STATE` y `SETUP_REPORT`.
2. Creá `assets/manifests/assets.schema.json` y un ejemplo de Estatua de Roxana.
3. Creá `scripts/3d/validate-asset-manifests.mjs` y fixtures válidos/inválidos.
4. Separá `assets/source`, `assets/references` y `assets/runtime` desktop/mobile.
5. No agregues modelos pesados de prueba.

## Fase 4 — Pipeline técnico mínimo

1. Auditá si ya existe loader GLB; reutilizá antes de duplicar.
2. Prepará scripts de validación/optimización como wrappers documentados. No adoptes compresión compleja sin una prueba reproducible.
3. Prepará un reporte de presupuesto capaz de leer `renderer.info` cuando haya una escena.
4. Dejá una ruta de laboratorio planificada o scaffoldeada sólo si puede hacerse sin tocar el runtime estable. No reconstruyas el hall en este hito.

## Fase 5 — Validación

1. Ejecutá build, tests y verify.
2. Validá un manifiesto correcto y uno incorrecto.
3. Revisá que no haya claves, builds, `node_modules` ni outputs generados versionados.
4. Entregá `docs/3d/SETUP_REPORT.md` con resumen, archivos, skills/MCP, comandos/resultados, decisiones, riesgos y próximos pasos para el Laboratorio visual del hall.

## Definition of done

No declares terminado por haber creado carpetas. Deben pasar build/tests/verify o quedar fallos preexistentes documentados; el schema debe validarse; las reglas deben ser visibles para Codex; los secretos deben quedar protegidos; y el reporte debe permitir que otro agente continúe sin esta conversación.

Al finalizar, presentalo como revisión de PR: resumen, diff por área, evidencia, pendientes y riesgos. **No empieces la producción visual del hall hasta recibir aprobación.**
