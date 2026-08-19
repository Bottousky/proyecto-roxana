# AI Development Workflow — Proyecto Roxana

> Documenta el flujo operativo para trabajar en este repo bajo Codex CLI con el setup multi-model actual. Convive con `AGENTS.md` raíz (autoridad de producto) y con `docs/80-production/agentic/` (workflow histórico y model routing detallado).

## 1. Harness

- **Codex CLI 0.147+** es el harness. Arranca con `codex` (provider default) o con un profile (`cx-minimax`, etc.).
- **MiniMax M3** es el provider utilizable hoy (MiniMax Direct via `https://api.minimax.io/v1`, wire `responses`).
- **OpenAI / Codex** queda reservado para Codex Desktop; no se usa en CLI por cuota actual.
- **OpenCode Go** está dormido por cuota. Los profiles (`cx-deepseek`, `cx-flash`, `cx-kimi`, `cx-kimi-code`, `cx-glm`, `cx-mimo`, `cx-minimax-go`) están configurados y se reactivan sin reconfigurar.

## 2. Roles

| Rol | Implementación | Lectura / escritura | Notas |
|---|---|---|---|
| Director | `main agent` (Codex) | ambos | Conversa con Manuel, fija contrato, decide DONE / REPAIR / ESCALATE. |
| Explorador | `.codex/agents/game-explorer.md` | read-only | Mapea, identifica archivos y riesgos, devuelve handoff compacto. |
| Implementador | `.codex/agents/game-worker.md` | escritura acotada | Implementa un contrato; no crece scope. |
| Player agent | `.codex/agents/browser-playtester.md` | read-only + browser | Juega el build con Playwright; produce evidencia. |
| Reviewer | `.codex/agents/game-reviewer.md` | read-only | Adversarial; intenta probar que la milestone no debería entrar. |

Los subagents heredan modelo del padre (no se hardcodean a `MiniMax-M3` salvo necesidad técnica). Hoy: `cx-minimax` ⇒ todos MiniMax; `codex` (cuando vuelva la cuota) ⇒ OpenAI; `cx-deepseek` (cuando vuelva Go) ⇒ DeepSeek.

## 3. Skills

En `C:\YO\Proyectos\Roxana\.agents\skills\`:

- `roxana-canon` — localizar docs canónicas, no inventar lore.
- `game-director` — intención → experiencia → requisito → criterios.
- `ohmdal-room-engine` — derivado del runtime real; previene reintroducir autoridades paralelas.
- `educational-puzzle-design` — pedagogía por interacción.
- `browser-game-playtest` — cuándo aplica y qué evidencia producir.
- `minimax-media-production` — `mmx` como herramienta, no como autoridad.

Skill global adicional instalada en `~/.agents/skills/mmx-cli/`: la oficial de mmx-cli.

## 4. Browser QA

Playwright 1.62.1 + chromium 1237 ya están instalados. El smoke test es:

```powershell
cd C:\YO\Proyectos\Roxana
npm run smoke:play
```

Levanta Vite en un puerto libre, navega a `/jugar`, espera el canvas o el title screen, captura screenshot, captura errores de consola, y cierra. Screenshot queda en `.playtest/smoke-<timestamp>.png`. Salida `0` = PASS, `1` = FAIL.

**Política**: el smoke test no modifica gameplay. Solo verifica que la infra browser puede arrancar el juego, abrir una ruta, esperar carga, comprobar errores fatales, capturar screenshot, y cerrar.

Cuando un cambio toca navegación, cámara, transiciones, room graph, spawn, puertas, interacción, puzzles, UI mayor, o estado, se invoca el subagent `browser-playtester` (no solo el smoke) para producir evidencia estructurada.

## 5. Autoridad documental

```
AGENTS.md raíz                  (estado, prioridades, modelo de studio)
  -> docs/00-governance/        (CANON, ADRs, canon policy)
    -> docs/10-global/          (UI global, narrativa global, etc.)
      -> docs/20-worlds/<w>/    (específico por mundo, ADRs locales)
        -> docs/80-production/  (workflow, model routing, tooling)
          -> código + tests
```

Skills como `roxana-canon` operacionalizan esta jerarquía. **Ningún agent ni skill redefine el orden de autoridad.**

## 6. Multimedia

- `mmx` (mmx-cli 1.0.19) es la herramienta. Autenticado por OAuth o API key.
- Capacidades: `image`, `vision`, `speech`, `music`, `search`, `video` (este último sólo con confirmación humana explícita).
- Workflow: `brief → generación → selección → provenance/manifest → integración runtime → review`. Nunca se genera directo al destino final.
- Greybox antes de arte. La política está en `.agents/skills/minimax-media-production/SKILL.md`.

## 7. Workflow recomendado

### Tarea pequeña (cambio acotado, sin contrato)

```
main agent  ->  implement  ->  npm run build  ->  npm test  ->  smoke:play si toca runtime  ->  done
```

### Feature mediana (cambio con learning/acceptance, una milestone)

```
game-explorer (handoff)
  -> game-worker (implementa el contrato)
    -> npm run build + npm test
      -> browser-playtester (reproduce, evidencia)
        -> game-reviewer (PASS / PARTIAL / FAIL)
```

### Feature grande (cambio de arquitectura, multi-room, motor, etc.)

```
exploracion  ->  plan  ->  criterios de aceptacion  ->  unidades incrementales
  -> worker  ->  playtest  ->  review  ->  DONE/REPAIR/ESCALATE
```

Loop budget: 1–3 repair loops normal, 5 hard cap. Sobre el mismo contrato, al quinto ciclo sin PASS: `ESCALATE`.

## 8. Lo que NO hace este workflow

- No inventa lore, dialogue, curriculum, ni assets. `TODO(guion)` / `TODO(pedagogy)` para lo que falte.
- No debilita tests para obtener PASS.
- No reescribe `src/jugar/rooms.ts` ni `src/jugar/roomGraph.ts` sin ADR (ver `docs/20-worlds/ohmdal/AGENTS.md`).
- No cambia engine/dependency sin un ADR.
- No sube assets caros antes de aprobar el greybox.
- No declara DONE porque compila o porque hay un screenshot lindo.
- No reemplaza el WORKFLOW histórico en `docs/80-production/agentic/WORKFLOW.md`; este doc es la **vista operativa actual** de ese workflow bajo Codex CLI + MiniMax Direct.

## 9. Verificacion del setup

```powershell
cx-doctor
```

Salida esperada (con todo lo crítico OK, los proveedores opcionales en su estado real):

```
Codex              [OK]
Codex config       [OK]     providers: codex-router, opencode_go, minimax
MiniMax direct     [OK]     profile=minimax-direct model=MiniMax-M3 provider=minimax
MiniMax auth       [OK]     MINIMAX_API_KEY presente (len=...)
MiniMax API        [OK]     GET /v1/models respondio 200
mmx                [OK]     mmx 1.0.19
mmx auth           [OK]
mmx quota          [OK]
Roxana repo        [OK]
Roxana agents      [OK]     4/4 - game-explorer, game-worker, browser-playtester, game-reviewer
Roxana skills      [OK]     6/6 - roxana-canon, game-director, ohmdal-room-engine, educational-puzzle-design, browser-game-playtest, minimax-media-production
Playwright         [OK]     v1.62.1
LiteLLM            [OK|WARN] puerto 4000 reachable
OpenCode Go        [INFO]   cuota agotada (declarada por el usuario)
OpenAI             [INFO]   cuota agotada (declarada por el usuario)
```

## 10. Documentos relacionados

- `AGENTS.md` (raíz) — autoridad del proyecto.
- `docs/00-governance/ROXANA_CANON_POLICY_v1.md` — precedencia entre docs.
- `docs/20-worlds/ohmdal/AGENTS.md` — reglas de Ohmdal (verbo nuclear: CONECTAR).
- `docs/20-worlds/ohmdal/room-based/SPATIAL_CONTRACT.md` — contrato de rooms (no negociable).
- `docs/80-production/agentic/WORKFLOW.md` — workflow histórico completo.
- `docs/80-production/agentic/MODEL_ROUTING.md` — model routing histórico (Director / Builder / Player / Repair / Reviewer).
- `~/.codex/MULTI_MODEL_SETUP.md` — setup global del harness.
