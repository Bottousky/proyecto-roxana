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
Human / Manuel
      ↓
ChatGPT web / GPT-5.6 Sol
  diseño · arquitectura · specs · revisión · aceptación
      ↓
repo = contrato + evidencia
      ↓
┌───────────────────┬───────────────────┬───────────────────┐
│ Gemini/Antigravity│ MiniMax M3 / GMI  │ Codex Luna/Terra  │
│ builder general   │ specialist/TA     │ worker mecánico   │
└───────────────────┴───────────────────┴───────────────────┘
      ↓
commits + tests + captures + report
      ↓
ChatGPT web / Sol acepta, rechaza o emite fixes exactos
```

**GPT-5.6 Sol en ChatGPT web es la autoridad técnica/de diseño por defecto.** No hace falta abrir otra sesión Sol en Codex para repetir análisis ya formalizado en repo.

**Codex Sol es break-glass**, no builder por defecto: usar sólo cuando un problema requiere razonamiento fuerte pegado al shell/local state y no puede resolverse de forma económica con un worker.

Un worker puede implementar, correr tests, hacer commits e incluso ejecutar una integración mecánica explícitamente especificada. **Ningún worker se auto-aprueba.** La aceptación material corresponde a ChatGPT/Sol + Manuel cuando aplique.

## Workers

- **Gemini / Antigravity builder:** implementación general, context-heavy repo work, authored scene work, refactors medianos, Playwright/captures. Usar workspace-write en un worktree/branch aislado. Si Gemini implementa, la revisión Gemini posterior debe ser una sesión separada read-only; no cuenta como auto-aprobación.
- **Codex Luna Max:** wiring, manifests, layouts repetitivos, colliders, fixtures, tests, capture plumbing, cleanup y cambios cerrados. Preferirlo a Sol para trabajo mecánico.
- **Codex Terra:** fallback intermedio si Luna no alcanza y no se justifica Sol.
- **MiniMax M3 vía GMI:** durante el trial, specialist para technical art, VFX/shaders, procedural code y recombinación acotada. El runner repo-native actual es proposal-only; cualquier experimento con filesystem debe ocurrir sólo en branch/worktree aislado y jamás auto-integrarse.
- **Gemini reviewer:** fresh-eyes read-only en sesión distinta de cualquier builder Gemini.

No agregar routers, daemons, colas ni frameworks de agentes. El protocolo es `task.md + git + tests + captures + report`.

## Contexto mínimo

Leer sólo:

```text
AGENTS raíz
→ AGENTS del mundo
→ task/loop activo
→ authority docs directamente relevantes
→ archivos afectados
```

No cargar recovery histórico ni el repo completo salvo necesidad concreta. Dar a MiniMax archivos explícitos; usar canonical shots/reference packs para evitar redescubrir dirección.

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
8. Ningún secreto/API key/token se commitea; usar `.env.local`/entorno.
9. Ningún gasto pago automático sin HUMAN_GATE/autorización previa.

## Validación

```bash
npm run build
npm test
npm run verify
npm run smoke:play
npm run agent:gemini:check
npm run agent:minimax:gmi:check
```

Un cambio player-facing se recorre además en navegador y se verifica en touch/mobile cuando corresponda. Compilar o mostrar una captura no equivale a terminar una experiencia.

## Intercambio entre agentes

- tasks Gemini: `agent-work/tasks/gemini/`
- tasks workers cross-provider: `agent-work/tasks/workers/`
- reports Gemini: `agent-work/reports/gemini/`
- tasks MiniMax: `agent-work/tasks/minimax/`
- reports MiniMax GMI: `agent-work/reports/minimax-gmi/`

El detalle operativo vive en `docs/80-production/AI_TOOLING.md`.
