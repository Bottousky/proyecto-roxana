# AGENTS.md — Proyecto Roxana

Manual operativo breve. Lore, diseño y currícula viven en `docs/`; este archivo define autoridad y ejecución.

## Autoridad

`governance → global → world → content → production → tarea → evidencia`

- `docs/00-governance/ROXANA_CANON_POLICY_v1.md` resuelve contradicciones.
- El `AGENTS.md` del mundo afectado agrega reglas locales.
- Código, tests y prototipos aportan evidencia; nunca ascienden una idea a canon.
- Decisiones materiales de producto, canon, currícula, engine, gasto y dirección visual final se escalan a Manuel.

## Modelo operativo

```text
Human / Manuel + ChatGPT web / GPT-5.6 Sol
  dirección · contratos · decisiones materiales
                    ↓
                  repo
                    ↓
      Mavis / Antigravity orchestrator
   monitor · dispatch · review gates · integration
                    ↓
┌────────────────────┬─────────────────────┬───────────────────┐
│ Gemini/Antigravity │ MiniMax M3/OpenCode │ Codex Luna/Terra  │
│ builder general    │ specialist/TA       │ worker mecánico   │
└────────────────────┴─────────────────────┴───────────────────┘
                    ↓
     commits + tests + captures + reports
                    ↓
          fresh independent review
                    ↓
 Mavis integrates if mechanically unambiguous
 or HUMAN_GATE when material judgment is required
```

**GPT-5.6 Sol en ChatGPT web** sigue siendo la autoridad técnica/de diseño para contratos y decisiones materiales. No hace falta repetir ese análisis en una sesión Codex Sol.

**Mavis** es el supervisor operacional model-driven definido en `docs/80-production/MAVIS_ORCHESTRATOR.md`: observa workers por evidencia Git, despacha tareas, pide reviews frescos, ejecuta gates y puede integrar mecánicamente candidates inequívocamente verdes. Mavis no inventa dirección ni sustituye HUMAN_GATE.

**Codex Sol es break-glass**, no builder por defecto: usar sólo cuando un problema requiere razonamiento fuerte pegado al shell/local state y no puede resolverse de forma económica con un worker.

Un worker puede implementar, correr tests, hacer commits e incluso ejecutar una integración mecánica explícitamente especificada. **Ningún worker se auto-aprueba.**

## Workers

- **Gemini / Antigravity builder:** implementación general, context-heavy repo work, authored scene work, refactors medianos, Playwright/captures. Usar workspace-write en un worktree/branch aislado. Si Gemini implementa, la revisión Gemini posterior debe ser una sesión separada read-only; no cuenta como auto-aprobación.
- **Codex Luna Max:** wiring, manifests, layouts repetitivos, colliders, fixtures, tests, capture plumbing, cleanup y cambios cerrados. Preferirlo a Sol para trabajo mecánico.
- **Codex Terra:** fallback intermedio si Luna no alcanza y no se justifica Sol.
- **MiniMax M3 vía GMI Cloud + OpenCode:** lane experimental tool-enabled para technical art, VFX/shaders, procedural code y recombinación acotada. Sólo en branch/worktree aislado, sin auto-merge ni auto-accept. El runner repo-native `run-gmi-minimax.mjs` queda como fallback proposal-only.
- **Gemini reviewer:** fresh-eyes read-only en sesión distinta de cualquier builder Gemini.
- **Mavis / Gemini Flash Medium:** orchestrator operacional; no debe transformarse en otro builder general ni revisar el propio trabajo de una sesión builder.

No agregar buses, daemons, routers de providers ni frameworks de agentes. El control plane sigue siendo liviano: `task.md + git + tests + captures + report + Mavis`.

## Contexto mínimo

Leer sólo:

```text
AGENTS raíz
→ AGENTS del mundo
→ task/loop activo
→ authority docs directamente relevantes
→ archivos afectados
```

No cargar recovery histórico ni el repo completo salvo necesidad concreta. Dar a MiniMax un task cerrado y archivos explícitos; usar canonical shots/reference packs para evitar redescubrir dirección.

## Direcciones técnicas

| Scope | Verbo / función | Dirección actual |
|---|---|---|
| Instituto | unir / recordar / transformar | Three.js axonométrico + DOM — hipótesis fuerte |
| Ohmdal | **CONECTAR** | **PlayCanvas Engine v2 + TypeScript + Vite — runtime canónico** |
| Physica | **EXPERIMENTAR** | Babylon + analítica TS; 2.5D por defecto |
| Bitland | **PROGRAMAR** | core TS + DOM; renderer se decide por spikes |
| Arithmos | **TRANSFORMAR** | core TS; representación se decide por evidencia |

## Reglas duras

1. No inventar narrativa: `TODO(guion)` + placeholder neutro + reporte.
2. Mantener core pedagógico puro/testeable; el renderer no es la verdad del dominio.
3. No romper baselines ni debilitar tests/acceptance para obtener PASS.
4. Desktop y mobile/touch son targets de primera clase cuando aplica.
5. No upgrades incidentales de engine/dependencias.
6. Verificar licencia/procedencia antes de copiar material externo.
7. Ningún worker/provider aprueba su propio trabajo.
8. Ningún secreto/API key/token se commitea; usar `.env.local`/credential store local.
9. Ningún gasto pago automático sin HUMAN_GATE/autorización previa.
10. No ejecutar dos builders sobre los mismos archivos load-bearing al mismo tiempo.
11. Mavis no force-pushea, no hace hard reset destructivo y no limpia trabajo humano no commiteado.

## Validación

```bash
npm run build
npm test
npm run verify
npm run smoke:play
npm run agent:gemini:check
npm run agent:minimax:gmi:check
npm run orchestrator:status
```

Un cambio player-facing se recorre además en navegador y se verifica en touch/mobile cuando corresponda. Compilar o mostrar una captura no equivale a terminar una experiencia.

## Intercambio entre agentes

- tasks Gemini: `agent-work/tasks/gemini/`
- tasks workers cross-provider: `agent-work/tasks/workers/`
- tasks orchestrator: `agent-work/tasks/orchestrator/`
- config orchestrator: `agent-work/orchestrator/`
- reports Gemini: `agent-work/reports/gemini/`
- tasks MiniMax: `agent-work/tasks/minimax/`
- reports MiniMax GMI: `agent-work/reports/minimax-gmi/`

Orquestación: `docs/80-production/MAVIS_ORCHESTRATOR.md`.
Runbook de cuota y dispatch: `docs/80-production/QUOTA_AWARE_EXECUTION.md`.
Detalle de herramientas: `docs/80-production/AI_TOOLING.md`.
