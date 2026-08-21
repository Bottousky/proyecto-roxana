# Local Harness Setup — opt-in y efímero

Este documento se lee sólo para routing, diagnóstico de harness o cambios de
capacidad. No es canon de producto y no se inyecta a cada tarea.

## Fuente local de verdad

Ejecutar desde PowerShell 7:

```powershell
./scripts/roxana-harness-doctor.ps1
```

El doctor detecta sin fallar si faltan:

- `codex`
- `agy` (Google Antigravity)
- `pi`
- `cx-minimax` (MiniMax Code vía perfil local, si existe)
- `mmx` (media MiniMax)
- `opencode`

La detección confirma comando/versión, no login, cuota ni derecho efectivo de
uso. Nunca imprime keys.

## Harnesses separados

- **OpenAI/Codex:** default operativo. Terra es la preferencia single-agent;
  Sol se reserva para dirección/arquitectura/review material.
- **Google/Antigravity:** candidate nativo. Usar `agy --version`; no exigir el
  consumer Gemini CLI anterior. Sólo usar modelos enumerados por la instalación
  local si su help expone discovery.
- **MiniMax Code:** Builder challenger temporal. El repo no depende de la
  suscripción.
- **MiniMax media (`mmx`):** ruta preferida actual para imagen/voz/música/video;
  generación e integración siguen siendo gates distintos.
- **Pi:** candidate minimal, no default hasta instalar y benchmarkear.
- **OpenCode Go:** optional; sus modelos/IDs se consultan localmente.

Antigravity y MiniMax Code no son Codex subagents. Ejecutarlos desde su harness
nativo y comparar con el mismo baseline/contrato/acceptance/budget.

## Codex custom agents

Los roles viven en `.codex/agents/*.toml`. Sus valores de modelo/effort son
preferencias configuradas, no prueba de routing. Para un child fresco el parent
usa `fork_turns="none"`, request explícito y luego audita el rollout con:

```powershell
./scripts/codex-subagent-audit.ps1
```

`turn_context` observado es autoridad. Ante mismatch, cortar fan-out.

## Cambio de capacidad

Actualizar sólo este setup efímero y `MODEL_ROUTING.md` si un benchmark cambia
un rol durable. No hardcodear cuotas, tokens privados ni nombres de modelo que el
harness local no devuelva.
