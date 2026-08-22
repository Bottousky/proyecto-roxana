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
  → Codex: único master harness técnico; implementa, integra y valida
      ├─ PlayCanvas MCP: estado semántico del Editor cuando haga falta
      ├─ Blender MCP: estado semántico de Blender cuando sea seguro
      ├─ Meshy oficial: MCP/skill/API sólo en sprint 3D aprobado
      └─ terminal:
          ├─ agy: Gemini/Antigravity como peer de contexto/critica, sin API key
          ├─ mmx: MiniMax como worker
          ├─ tripo opcional
          └─ git, npm, Vite, tests y scripts
```

- Codex es la única autoridad técnica y el único integrador. Puede delegar una
  producción a `mmx`, un análisis a Gemini/Antigravity o un asset a un proveedor
  3D, pero verifica el resultado antes de actuar.
- ChatGPT web entrega specs o decisiones; no necesita integración local.
- Gemini es peer de **contexto amplio, multimodal y fresh-eyes review**. No
  redefine arquitectura, no integra código y no aprueba su propio trabajo.
- No agregar routers de modelos, subagent frameworks, colas, daemons, adapters
  de harness ni MCPs caseros para herramientas que ya tienen ruta oficial/CLI.

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

No cargar el repo completo, recovery histórico ni catálogos de skills. Por
default usar como máximo una skill directamente relevante; las skills oficiales
de PlayCanvas se cargan por necesidad concreta, no como bundle.

**Delegar a Gemini antes de expandir contexto en Codex** cuando la tarea exige
leer muchas fuentes, reconciliar documentación extensa, revisar múltiples
capturas/GLBs o hacer una crítica visual independiente. Usar
`npm run agent:gemini -- --task ... --out ...`; Codex consume después el informe
compacto y verifica sólo los puntos load-bearing.

No delegar a Gemini fixes locales, edición rutinaria, integración final ni tareas
que Codex puede resolver leyendo pocos archivos directamente.

## Direcciones técnicas

| Scope | Verbo / función | Dirección actual |
|---|---|---|
| Instituto | unir / recordar / transformar | Three.js axonométrico + DOM — hipótesis fuerte |
| Ohmdal | **CONECTAR** | **PlayCanvas Engine v2 + TypeScript** — target web; transición aún no cerrada |
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

## Comandos y validación

```bash
npm run dev
npm run build
npm test
npm run verify
npm run smoke:play
npm run agent:gemini:check
```

Durante implementación, correr tests enfocados. El gate mecánico final normal es
`npm run verify`; si no existe, usar `npm run build` y `npm test`. No apilar los
tres comandos salvo para aislar un fallo. Un cambio player-facing además se abre
y recorre en el navegador; verificar consola y touch/mobile cuando corresponda.

No declarar PASS si un check importante quedó sin ejecutar.

## Skills y herramientas

- `.agents/skills/`: skills oficiales de PlayCanvas y tres reglas locales
  compactas (`ohmdal-development`, `ohmdal-graphics-quality`, `roxana-minimax`).
- `mmx-cli` y `web-perf`: skills oficiales instaladas globalmente en este host.
- Gemini/Antigravity se usa por `agy` y el runner repo-native
  `scripts/agents/run-antigravity.mjs`; **no Gemini API key**.
- Git, npm, Vite, TypeScript, Playwright y transformaciones glTF: terminal.
- MCP stateful: PlayCanvas Editor y Blender. Meshy MCP oficial es opcional para
  un sprint de assets aprobado; no crear MCP propio para MiniMax, Tripo o Meshy.
- Proveedores 3D deben terminar en GLB/manifiesto portable; nunca se convierten
  en dependencia del runtime.

## Intercambio con Gemini

- Tareas: `agent-work/tasks/gemini/`
- Informes: `agent-work/reports/gemini/`

Son carpetas de intercambio, no una cola. Una tarea debe incluir objetivo,
archivos permitidos, fuentes y formato de salida. El runner invoca Antigravity
en modo headless con el login local, captura su respuesta y persiste el informe.
Debe rechazar una corrida si el peer modificó el worktree. Codex revisa e integra.

## Escalación

Escalar a Manuel ante cambios materiales de experiencia, guion, currícula,
canon, engine/dependencias, dirección visual, ganador de spike o integración de
milestone. Un fix técnico local dentro de una tarea clara se resuelve y verifica.