# Sistema de corridas multiagente

## Hito activo

- [`ohmdal-hd2d-preprod-v1/`](ohmdal-hd2d-preprod-v1/final-report.md): H1+H2 cerrados de forma
  condicional; `CAM-FIX-001` espera aprobación visual humana.
- [`ohmdal-arc1-serial-v1/`](ohmdal-arc1-serial-v1/status.md): backlog serie preparado con WIP 1
  y `executionAuthorized: false`. No autoriza H3, migrar `/jugar`, Meshy ni producción masiva.

Los contratos son independientes de la interfaz de orquestación. OpenCode puede dirigirlos si
respeta el mismo `baseCommit`, los worktrees/ramas por rol, el ownership exclusivo y la secuencia
de integración descrita en el runbook del hito. No se incorpora Agents SDK.

## Decisión vigente

Proyecto Roxana usa la orquestación nativa de Codex App, subagentes, perfiles de proyecto,
worktrees, `AGENTS.md`, skills y contratos versionados. La Fase 1 no incorpora un orquestador
propio ni dependencias del Agents SDK.

El hilo principal es el Director/integrador. Puede coordinar hasta tres agentes ejecutores
simultáneos cuando el usuario autoriza el hito y las tareas son independientes.

Un subagente no implica un worktree separado. Para Arquitectura y Asset Forge trabajando en
paralelo con escritura, abrir una tarea de Codex App por rol en modo Worktree. Usar subagentes
del mismo hilo principalmente para exploración, pruebas, revisión o tareas sin necesidad de
aislamiento Git.

## Roles

| Rol | Responsabilidad | Escritura |
|---|---|---|
| Director/integrador | brief, decisiones, ownership, integración y cierre | contratos y archivo de integración |
| Arquitectura procedural | espacio, escala, navegación, materiales e iluminación | módulos de arquitectura asignados |
| Asset Forge | referencias, manifiestos y assets runtime | frontera de assets asignada |
| Evaluador | QA visual, funcional, responsive y rendimiento | sólo revisión y métricas |

Los perfiles viven en `.codex/agents/`. Materiales e iluminación permanecen con Arquitectura
hasta que la complejidad justifique otro rol.

## Contratos obligatorios

Cada directorio `docs/agent-runs/<hito>/` contiene:

- `brief.md`: objetivo, alcance, exclusiones, base y Definition of Done;
- `visual-contract.md`: cámara, composición, escala, referencias y gates;
- `tasks.json`: autorización, commit base, ramas, dependencias, duración y rondas;
- `ownership.json`: globs exclusivos por rol y política de colisión;
- `asset-manifest.json`: inventario del hito y autorización Meshy;
- `status.md`: estado operativo y bloqueos;
- `review-round-01.md`: veredicto por criterio;
- `performance.json`: métricas observadas, nunca estimadas como hechos;
- `final-report.md`: integración, evidencia, riesgos y cierre.

Copiar `_template/` para un hito nuevo. No marcar `executionAuthorized: true` hasta que el
Director y el usuario aprueben brief, contrato visual, ownership y presupuesto.

### Workflow serie

Un hito puede declarar `workflow.mode: strict-serial`. En ese modo `globalWipLimit` es uno, sólo
el Director cambia estados y una tarea sucesora permanece bloqueada hasta que la anterior esté
`DONE`. `CONDITIONAL`, `HUMAN_REVIEW`, `implemented` y `not-run` no equivalen a `DONE`. Los
paquetes internos de 30–90 minutos atienden únicamente el ticket activo.

## Protocolo

1. El Director fija un `baseCommit` común y completa los contratos.
2. Para cada trabajador write-heavy, abre una tarea de Codex App en modo Worktree desde ese
   commit y crea allí la rama `codex/<hito>-<rol>`.
3. Lanza sólo tareas sin dependencias mutuas, hasta tres ejecutores simultáneos. No cuenta un
   subagente como worktree aislado.
4. Cada trabajador modifica exclusivamente su frontera y entrega commit, evidencia y riesgos.
5. Ante solapamiento, ambos agentes paran; el Director reasigna antes de continuar.
6. El Director integra commits secuencialmente en su rama.
7. Un único Evaluador revisa el estado integrado y no corrige implementación.
8. El Director abre como máximo dos rondas automáticas. La tercera requiere aprobación.
9. El hito cierra sólo cuando `final-report.md` referencia commits, tests, capturas y métricas.

Una rama sólo puede estar checkout en un worktree a la vez. No compartir un worktree entre
roles, no abrir la misma rama también en Local y no crear ramas desde commits base distintos.

## Presupuestos fijos

- máximo tres agentes ejecutores simultáneos, sin contar el Director;
- máximo un Evaluador;
- máximo dos rondas automáticas;
- tareas de 30 a 90 minutos con condición de cierre;
- gasto Meshy deshabilitado por defecto;
- una tercera ronda, una frontera compartida o un gasto Meshy requieren decisión humana.

## Evolución deliberada

Fase 2 se habilita después de dos o tres hitos cerrados con la misma estructura. Recién entonces
se evaluarán implementaciones para:

```text
npm run agent:hito:init
npm run visual:capture
npm run visual:compare
npm run assets:validate
npm run performance:audit
npm run agent:hito:report
```

Fase 3 requiere un ADR y evidencia de repetición: al menos tres hitos cerrados, un mismo grafo
reutilizado dos veces, necesidad real de lotes no atendidos y presupuesto/telemetría definidos.
Sólo entonces se evalúa Agents SDK con Planner → workers → Integrator → Evaluator.

## Base oficial consultada

- [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents.md)
- [Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees.md)
- [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md.md)
- [Skills](https://developers.openai.com/plugins/concepts/skills.md)
- [Use Codex with the Agents SDK](https://learn.chatgpt.com/docs/mcp-server.md)

Verificado el 2026-07-28. Reiniciar Codex o abrir una tarea nueva después de cambiar
`.codex/config.toml`, `.codex/agents/` o `AGENTS.md`.
