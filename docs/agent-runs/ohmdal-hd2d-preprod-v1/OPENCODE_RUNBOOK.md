# Runbook de OpenCode — Ohmdal HD-2D preproducción v1

## Contrato de arranque

OpenCode actúa como Director/orquestador, no como permiso para ampliar alcance. Antes de abrir
agentes debe leer, en este orden:

1. `AGENTS.md` y `docs/agent-runs/AGENTS.md`.
2. `docs/ohmdal-biblia/00_MASTER_INDEX.md`.
3. `brief.md`, `visual-contract.md`, `tasks.json`, `ownership.json` y `asset-manifest.json` de
   este hito.
4. `.agents/skills/roxana-3d-director/SKILL.md` y sus referencias.

En la rama de control se puede iniciar el perfil `roxana-director` y ejecutar
`/ohmdal-hd2d-start`. Los perfiles del proyecto viven en `.opencode/agents/`. El commit base de
ejecución contiene esos perfiles; Arquitectura y Asset Forge se abren únicamente dentro de sus
worktrees respectivos.

La rama `codex/ohmdal-hd2d-biblia` es el control plane. Todos los ejecutores parten exactamente
del `baseCommit` publicado en su `tasks.json` vigente.

Desde un worktree que no contenga los contratos, OpenCode puede leer la versión del control plane
con `git show codex/ohmdal-hd2d-biblia:docs/agent-runs/ohmdal-hd2d-preprod-v1/<archivo>`.

## Worktrees

Crear cada rama una sola vez desde el commit común publicado por el control plane. Ajustar
únicamente las rutas de destino al entorno local:

```powershell
$taskJson = git show codex/ohmdal-hd2d-biblia:docs/agent-runs/ohmdal-hd2d-preprod-v1/tasks.json
$hitoBase = ($taskJson | ConvertFrom-Json).baseCommit
git worktree add "C:\YO\Worktrees\roxana-hd2d-director" -b codex/ohmdal-hd2d-preprod-v1-director $hitoBase
git worktree add "C:\YO\Worktrees\roxana-hd2d-arquitectura" -b codex/ohmdal-hd2d-preprod-v1-arquitectura $hitoBase
git worktree add "C:\YO\Worktrees\roxana-hd2d-assets" -b codex/ohmdal-hd2d-preprod-v1-assets $hitoBase
```

El Evaluador se crea sólo después de integrar:

```powershell
git worktree add "C:\YO\Worktrees\roxana-hd2d-evaluacion" -b codex/ohmdal-hd2d-preprod-v1-evaluacion <commit-integrado>
```

No abrir la misma rama en otro checkout ni compartir un worktree entre agentes.

## Abrir las sesiones de OpenCode

En terminales independientes:

```powershell
Set-Location -LiteralPath "C:\YO\Worktrees\roxana-hd2d-director"
opencode --agent roxana-director
```

```powershell
Set-Location -LiteralPath "C:\YO\Worktrees\roxana-hd2d-arquitectura"
opencode --agent ohmdal-architecture
```

```powershell
Set-Location -LiteralPath "C:\YO\Worktrees\roxana-hd2d-assets"
opencode --agent ohmdal-asset-forge
```

En el Director, ejecutar `/ohmdal-hd2d-start`. No usar `--auto` como sustituto de los permisos:
las reglas `deny` permanecen obligatorias y las acciones `ask` conservan supervisión humana.

## Orden de ejecución

1. Director ejecuta DIR-001 y registra baseline.
2. Arquitectura y Asset Forge pueden ejecutarse en paralelo.
3. Director ejecuta DIR-EDU-001 en su frontera mientras los dos trabajadores avanzan.
4. Cada trabajador entrega un único commit acotado, comandos, evidencia y riesgos.
5. Director integra primero Arquitectura y luego Asset Forge, o documenta el orden contrario.
6. Director ejecuta DIR-INT-001 y fija el commit integrado.
7. Abrir un único Evaluador desde ese commit.
8. Director emite el veredicto; máximo una corrección adicional automática.

## Prompt del Director

```text
Actuá como Director/integrador de ohmdal-hd2d-preprod-v1. Leé todos los contratos desde la rama
codex/ohmdal-hd2d-biblia y verificá `executionAuthorized` y el `baseCommit` publicado.
Ejecutá sólo DIR-001 y DIR-EDU-001 antes de integrar. Respetá ownership.json, mantené /jugar
read-only, no autorices H3, Meshy ni generación paga. Detenete ante solapamiento, seguridad o
contradicción real. Entregá un commit acotado con tests y riesgos.
```

## Prompt de Arquitectura

```text
Actuá como Arquitectura procedural para ARCH-001 de ohmdal-hd2d-preprod-v1. Leé AGENTS.md,
roxana-3d-director, brief.md, visual-contract.md, tasks.json y ownership.json desde el control
plane. Modificá exclusivamente los globs architecture. Construí blockout, navegación, cámara,
materiales e iluminación base en metros con maniquí de 1,72 m. No edites integración, assets,
contratos ni /jugar. Cerrá con un commit, capturas de blockout disponibles y métricas observables.
```

## Prompt de Asset Forge

```text
Actuá como Asset Forge para ASSET-001 de ohmdal-hd2d-preprod-v1. Leé todos los contratos y
asset-manifest.json desde el control plane. Modificá sólo los globs asset_forge. Registrá fuentes
y derechos; producí únicamente prototipos originales mínimos para A/B 4/8 y Ohm. No descargues
ni extraigas assets de Dragon Quest. Meshy y generación paga están prohibidos. Entregá manifests
válidos, un commit acotado y una recomendación basada en cámara/presupuesto, no gusto aislado.
```

## Prompt del Evaluador

```text
Actuá como único Evaluador de ohmdal-hd2d-preprod-v1 sobre el commit integrado indicado por el
Director. Leé contratos y gates; tratá src, tests, assets y configuración como read-only. Escribí
sólo review-round-01.md y performance.json. Capturá desktop/mobile, revisá consola, renderer.info,
disposal y tests. Emití PASS, CONDITIONAL o FAIL por gate. No corrijas implementación ni abras
otra ronda.
```

## Condiciones de freno

- Un agente necesita un glob de otro rol.
- Falta una referencia necesaria o sus derechos son inciertos.
- Una ficha educativa representa seguridad real sin fuente suficiente.
- Se propone tocar `/jugar`, guardado o modelos estables.
- Se intenta iniciar H3, Meshy, un hero asset o una tercera ronda.
- El baseline deja de ser reproducible.

Ante cualquiera de estos casos, OpenCode detiene la tarea afectada y devuelve la decisión al
Director; no reasigna silenciosamente ownership.
