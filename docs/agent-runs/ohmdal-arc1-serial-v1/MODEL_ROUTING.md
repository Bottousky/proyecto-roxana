# Routing de modelos

**Inventario observado:** `opencode models --verbose`, 2026-08-02, OpenCode 1.14.29.
**Regla:** disponibilidad no demuestra calidad; hacer smoke acotado antes del primer ticket real.

## Routing provisional gratuito

| Rol | Modelo | Razón observable | Permiso |
|---|---|---|---|
| `director-plan` | `opencode/nemotron-3-ultra-free` | razonamiento, tool calls y contexto publicado de 1M | read-only |
| `builder` | `opencode/north-mini-code-free` | variante explícitamente orientada a código, 256k | edit/terminal con aprobación |
| `reviewer` | `opencode/deepseek-v4-flash-free` | modelo distinto, razonamiento y 200k | read-only subtask |
| revisión visual auxiliar | `opencode/mimo-v2.5-free` | único gratuito observado con input de imagen | read-only; humano decide |

Kimi no aparece actualmente en `opencode models`; no se configura un ID inventado. Cuando OpenCode
Go esté activo, ejecutar `opencode models --refresh --verbose`, registrar el ID real y hacer un
smoke contra el mismo paquete antes de cambiar el routing.

## Uso de Codex y Claude

- Codex/GPT: dirección, arquitectura, educación, desbloqueos, briefs visuales e integración crítica.
- Claude Code autenticado: revisión o implementación acotada cuando se lo autorice y su CLI pase un
  smoke; una sesión colgada no se presenta como entrega.
- OpenCode gratuito: ejecución y review de un solo ticket; nunca un loop general del backlog.

## Smoke por modelo

1. confirmar que el ID aparece en `opencode models`;
2. usar un prompt read-only de 5–10 minutos sobre el ticket activo;
3. verificar lectura de reglas, JSON válido, tool calls y respeto de ownership;
4. registrar latencia, fallo y utilidad en evidencia;
5. no repetir más de una vez sin causa técnica distinta.

No usar reputación de internet como sustituto de evidencia local. No enrutar a modelos pagos ni a
OpenAI desde OpenCode cuando la intención sea conservar la cuota Codex.

## Fuentes oficiales

- [OpenCode Agents](https://opencode.ai/docs/agents/)
- [OpenCode Commands](https://opencode.ai/docs/commands/)
- [OpenCode CLI/models](https://opencode.ai/docs/cli/)
- [OpenCode project config](https://opencode.ai/docs/config/)
