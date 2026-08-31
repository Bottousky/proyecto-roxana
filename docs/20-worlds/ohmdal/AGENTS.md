# AGENTS.md — Ohmdal

> **Verbo nuclear:** CONECTAR  
> **Disciplina:** electricidad/electrónica  
> **Runtime:** PlayCanvas Engine v2 + TypeScript + Vite

Especializa el `AGENTS.md` raíz. Leer ambos y sólo las fuentes directamente relevantes.

## Autoridad mínima

- `vision/ohmdal-vision_v1.md`
- `gameplay/ohmdal-core-gameplay_v1.md`
- `gameplay/ohmdal-electrical-system_v1.md`
- `gameplay/ohmdal-puzzle-grammar_v1.md`
- `content/ohmdal-arc-01_v1.md`
- `content/ohmdal-vertical-slice_v1.md`
- `../../00-governance/ROXANA_CANON_POLICY_v1.md`

## Estado técnico

- runtime canónico: `src/experiences/ohmdal-playcanvas/`
- Blender = DCC master.
- hardening técnico: `dec2d75`.
- Arco I greybox completo: `b8bb412`; loop cerrado en `74abaad`.
- authored pass activo: `agent-work/loops/ohmdal-arco1-authored-pass/`.
- A0–A3 ya están aceptados; A4 Castillo está en implementación/candidato.
- Three.js es cantera técnica/R&D, no runtime paralelo.

## Reglas de juego

### Hacer

- Mostrar electricidad como luz, calor, sonido, movimiento, continuidad y conducta del mundo.
- Sostener `predicción → intervención → observación → explicación → transferencia`.
- Validar condiciones y aceptar varias soluciones cuando el modelo lo permite.
- Diseñar desktop y touch/mobile como targets reales.
- Priorizar interacción world-first; close-up diegético sólo cuando precisión/densidad lo exige y sobre el mismo modelo eléctrico.
- Preservar greybox/topología validada durante authored pass.
- Aplicar `production/OHMDAL_SCENIC_RENDERING_POLICY.md` para fondos, horizonte, scenic shell y proxies entre zonas.
- Aplicar `production/OHMDAL_NAVIGATION_COLLISION_CONTRACT.md` para colliders, spawn/facing y puertas.

### No hacer

- quizzes/fórmulas como llaves;
- trial-and-error que sólo “se pone verde”;
- minijuegos de circuito desacoplados del mundo;
- paredes visibles atravesables por falta de collider;
- spawns orientados hacia la puerta que se acaba de cruzar;
- fondos planos 2D como sustituto del mundo cercano en cámara FPS libre;
- copper/neón emissive permanente;
- inventar lore/diálogo;
- reabrir greybox o Plaza sin regresión demostrada;
- updates incidentales de PlayCanvas/Vite/dependencias.

## Routing actual

- **ChatGPT web / GPT-5.6 Sol:** autoridad técnica/de diseño, specs y acceptance. No necesita una segunda sesión Sol en Codex por defecto.
- **Gemini 3.7 Flash High / Antigravity:** builder general preferido para authored scene work y trabajo repo-heavy en branch/worktree aislado. Puede editar y testear; no puede auto-aprobarse.
- **Gemini reviewer:** sesión separada read-only para fresh-eyes/captures.
- **Codex Luna Max:** worker mecánico para colliders, spawn anchors, tests, manifests, wiring y cleanup.
- **Codex Terra:** fallback intermedio.
- **Codex Sol:** break-glass local-tool reasoning solamente.
- **MiniMax M3 / GMI Cloud / OpenCode:** specialist experimental tool-enabled para technical-art/VFX/recombinación acotada. Sólo worktree/branch aislado, sin tocar el mismo scope load-bearing que Gemini/Luna y sin auto-integrarse. `run-gmi-minimax.mjs` queda como fallback proposal-only.
- **Meshy/Tripo:** opcionales detrás de HUMAN_GATE económico y siempre canonicalizados en Blender.

Un worker puede commitear e integrar cambios mecánicos explícitos, pero nunca declarar aceptación material de su propio stage. Cuando el builder es Gemini, cualquier review Gemini debe ser una sesión distinta y read-only; la aceptación definitiva vuelve a ChatGPT/Sol/Manuel según corresponda.

## Authored pass

- A0 capture readiness: PASS.
- A1 references: PASS.
- A2 Plaza/Taller: PASS.
- A3 Manantial/Central: PASS; FAST ya verificó NVIDIA GTX 1660 Ti / D3D11 / `softwareRendered=false`.
- A4 Castillo: activo.
- **A4B Navigation + Scenic Shell:** obligatorio antes de A5 para resolver colisiones/spawns/enclosure/fondos detectados en playtest humano.
- A5 Forja/Terrazas.
- A6 Faro/Lago/return.
- A7 VFX/audio/ambient.
- A8 full authored Golden Path/freeze.

## Ownership para ahorrar cuota

- Gemini termina el authored candidate del stage actual.
- Luna toma A4B y otros paquetes mecánicos una vez congelado el commit authored anterior.
- M3/OpenCode sólo trabaja en módulos experimentales o technical-art disjunto mientras otro builder toca runtime load-bearing.
- Sol web revisa evidence packs/commits; Codex Sol sólo si falla esta división.

## Validación

```bash
npm run loop:ohmdal-arco1:validate
npm run loop:ohmdal-arco1-authored:validate
npm run playtest:ohmdal-golden-path
npm run build
npm test
npm run smoke:play
```

Además, todo stage player-facing debe aportar capturas, renderer diagnostics, cero errores funcionales y pruebas específicas de navegación/collision cuando corresponda.

Runbook: `../../80-production/QUOTA_AWARE_EXECUTION.md`.
