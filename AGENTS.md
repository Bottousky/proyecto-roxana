# AGENTS.md — Proyecto Roxana

Manual operativo breve para trabajar en este repositorio. Lore, diseño y
currícula viven en `docs/`; este archivo no los duplica.

## Autoridad

`governance → global → world → content → production → tarea → evidencia`

- `docs/00-governance/ROXANA_CANON_POLICY_v1.md` resuelve contradicciones.
- `docs/START_HERE.md` define el producto y `ROADMAP.md` ordena el trabajo.
- El `AGENTS.md` del mundo afectado agrega reglas locales.
- Código, tests y prototipos aportan evidencia; nunca ascienden una idea a canon.
- Decisiones de diseño, guion, engine, dependencia o canon material se integran
  con Manuel.

## Modelo operativo

```text
Human
  → ChatGPT web: diseño, investigación, planificación y decisiones
  → Codex / Sol High: único master harness técnico; implementa, integra y valida
      ├─ Luna Max: worker mecánico en scopes cerrados
      ├─ Gemini/Antigravity: peer read-only de contexto y fresh-eyes
      ├─ MiniMax M3: worker experimental proposal-only por GMI durante el trial
      ├─ PlayCanvas / Blender: tooling de runtime y DCC según necesidad
      └─ terminal: git, npm, Vite, tests, scripts y validadores
```

- Codex/Sol es la única autoridad técnica y el único integrador.
- Luna y MiniMax nunca editan simultáneamente el mismo scope; Sol asigna un dueño
  por sub-tarea, verifica el resultado y recién entonces integra.
- Gemini es peer de contexto amplio, multimodal y fresh-eyes. No integra código ni
  aprueba su propio trabajo.
- MiniMax M3 por GMI es una **lane temporal de evaluación** hasta 2026-09-06:
  devuelve propuestas/patches a `agent-work/reports/minimax-gmi/`; no obtiene
  acceso directo al filesystem desde el runner repo-native.
- No agregar routers de modelos, subagent frameworks, colas, daemons ni MCPs
  caseros para capacidades que ya tienen CLI/API oficial suficiente.

Detalles de herramientas: `docs/80-production/AI_TOOLING.md`.

## Contexto mínimo

Leer sólo lo que exige la tarea:

```text
AGENTS.md raíz
  → AGENTS.md del mundo
  → authority docs directamente relevantes
  → spec/tarea
  → archivos afectados
```

No cargar el repo completo ni recovery histórico. Por default usar como máximo
una skill directamente relevante.

**Delegar a Gemini antes de expandir contexto en Codex** cuando la tarea exige
leer muchas fuentes, reconciliar documentación extensa, revisar múltiples
capturas/GLBs o hacer crítica visual independiente.

**Dar a MiniMax contexto explícito y acotado**, no un dump del repo. Durante el
trial usar `npm run agent:minimax:gmi -- --task ... --context ... --out ...`.
Sol consume el informe y verifica los puntos load-bearing.

## Direcciones técnicas

| Scope | Verbo / función | Dirección actual |
|---|---|---|
| Instituto | unir / recordar / transformar | Three.js axonométrico + DOM — hipótesis fuerte |
| Ohmdal | **CONECTAR** | **PlayCanvas Engine v2 + TypeScript + Vite — runtime canónico** |
| Physica | **EXPERIMENTAR** | Babylon + analítica TS; 2.5D por defecto |
| Bitland | **PROGRAMAR** | core TS + DOM; renderer se decide por spikes |
| Arithmos | **TRANSFORMAR** | core TS; representación se decide por evidencia |

P12 manda: los mundos comparten producto, no engine, cámara o género.

## Reglas duras

1. No inventar narrativa. Si falta: `TODO(guion)` + placeholder neutro + reporte.
2. Formalizar sólo después de evidencia suficiente del jugador.
3. Validar condiciones y admitir varias soluciones cuando corresponda.
4. Mantener el core pedagógico puro/testeable; el renderer no es su verdad.
5. Usar español neutro/tuteo en texto visible.
6. No hacer upgrades incidentales de dependencia o engine.
7. No romper baselines ni debilitar tests/acceptance para obtener PASS.
8. Desktop y mobile/touch son targets de primera clase cuando aplica.
9. Verificar licencia y procedencia antes de copiar material externo.
10. Compilar o mostrar una captura no equivale a terminar una experiencia.
11. Ningún worker o provider se auto-aprueba; Sol acepta con evidencia.
12. Ningún secreto, API key o token se commitea. Usar `.env.local`/entorno.

## Comandos y validación

```bash
npm run dev
npm run build
npm test
npm run verify
npm run smoke:play
npm run agent:gemini:check
npm run agent:minimax:gmi:check
```

Durante implementación, correr tests enfocados. El gate mecánico final normal es
`npm run verify`; si no existe, usar `npm run build` y `npm test`. Un cambio
player-facing además se abre y recorre en navegador; verificar consola y
touch/mobile cuando corresponda.

No declarar PASS si un check importante quedó sin ejecutar.

## Skills y herramientas

- `.agents/skills/`: skills oficiales de PlayCanvas y reglas locales compactas.
- `roxana-minimax`: MiniMax oficial por `mmx` cuando corresponda y lane GMI
  temporal para evaluación M3; nunca autoridad de integración.
- Gemini/Antigravity por `agy` y `scripts/agents/run-antigravity.mjs`; no Gemini API.
- Git, npm, Vite, TypeScript, Playwright y transformaciones glTF: terminal.
- MCP stateful: PlayCanvas Editor y Blender cuando aporten valor.
- Meshy/Tripo: proveedores 3D opcionales detrás de HUMAN_GATE económico; todo
  resultado termina en Blender canonicalization + GLB/manifiesto portable.

## Intercambio entre agentes

- Gemini tasks: `agent-work/tasks/gemini/`
- Gemini reports: `agent-work/reports/gemini/`
- MiniMax tasks: `agent-work/tasks/minimax/`
- MiniMax GMI reports: `agent-work/reports/minimax-gmi/`

Son carpetas de intercambio, no una cola ni un bus. Las tareas incluyen objetivo,
archivos/contexto, límites y formato. Sol integra sólo después de revisar.

## Escalación

Escalar a Manuel ante cambios materiales de experiencia, guion, currícula,
canon, engine/dependencias, dirección visual, gasto pago o integración de
milestone. Un fix técnico local dentro de una tarea clara se resuelve y verifica.
