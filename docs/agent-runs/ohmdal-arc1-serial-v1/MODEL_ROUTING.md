# Routing de modelos

**Decisión vigente:** `CP-022`, actualizada por `CP-023`, 2026-08-03.
**Inventario observado:** `opencode models`, 2026-08-03, OpenCode 1.14.29 — 18 modelos
`opencode-go/*`, 7 `opencode/*` gratuitos, 22 `openai/*`.
**Regla:** disponibilidad no demuestra calidad (`CP-007`); smoke acotado antes del primer ticket real.

La versión ejecutable de este documento es `automation/routing.json`. El inventario nunca se escribe
a mano: lo genera `node automation/scripts/providers.mjs --write`.

## Cuál manda ante contradicción

Hasta `CP-023` este archivo decía «manda este archivo y se corrige el otro», sin distinguir qué tipo
de afirmación estaba en juego. El resultado fue previsible: `TASK-003` cerró el smoke de `vision` el
2026-08-03, `routing.json` pasó a v2.2 y este documento siguió afirmando que ninguna ruta tenía
smoke. **La regla de precedencia le daba la razón al documento equivocado.**

La precedencia ahora se parte según el tipo de afirmación:

| Tipo de afirmación | Manda | Por qué |
|---|---|---|
| **Criterio** — qué rol usa qué clase de modelo, qué se reserva para qué, qué está prohibido | este archivo | es una decisión, y las decisiones se escriben |
| **Hecho observado** — qué modelos existen, qué smoke pasó, qué capability está verificada | `routing.json` + `provider-health.json` | son medición, y una medición no se discute con prosa |

Un hecho observado sólo entra acá **copiado** de su archivo, con su fecha. Si divergen, se corrige
este documento, nunca la medición.

## Routing vigente

Estado de smoke copiado de `automation/routing.json` v2.2, 2026-08-03.

| Rol | Modelo | Razón observable | Permiso | Smoke |
|---|---|---|---|---|
| `orchestrator` | `opencode-go/gpt-5.6-luna` | clasifica el pedido y escribe la Task Spec; no implementa | read-only | `not-run` |
| `director-plan` | `opencode-go/glm-5.2` | razonamiento y tool calls; read-only por contrato | read-only | `not-run` |
| `builder` | `opencode-go/deepseek-v4-flash` | la tasa de quemado más baja de Go | edit/terminal con aprobación | `not-run` |
| `reviewer` | `opencode-go/glm-5.2` | modelo distinto del builder **por configuración** | read-only subtask | `not-run` |
| `reviewer-visual` | `opencode/mimo-v2.5-free` | **coste cero**; detecta layout y presencia igual que Luna | read-only | **`pass`** |
| `img2threejs` | `opencode-go/gpt-5.6-luna` | necesita leer imagen y escribir código en el mismo turno | edit con aprobación | **`pass`** |
| generación de imagen | **ninguno** | ver §«Arte» | — | — |

**Las dos rutas de visión tienen smoke; las cuatro de texto no.** `TASK-003` cerró `vision` el
2026-08-03 en tres passes (`automation/runs/TASK-003/smoke.md`) y bajó la revisión visual a coste
cero. `TASK-002` —la línea base de `glm-5.2` y `deepseek-v4-flash` como planner, builder y reviewer—
sigue en `automation/tasks/queue/` **sin correr**, y es lo único que separa al pipeline de tener
evidencia local de que funciona sin Claude.

### Gate duro de visión

Ningún veredicto de **escala, proporción o distancia** de un modelo de visión vale como evidencia,
con ningún modelo. `mimo` invirtió la dirección de un cambio de tamaño —6,3 % → 12,8 % del ancho— y
lo justificó con un razonamiento plausible; Luna llamó «más alto» a un panel que es más bajo, 75 →
66 px. Los dos aciertan layout, presencia y dirección del cambio; los dos fallan magnitudes. Una
magnitud se mide con `getBoundingClientRect()` o la mira un humano.

## Lo que cambió y por qué

Hasta `CP-021` el routing apuntaba a modelos gratuitos y a Claude. Ninguna de las dos cosas describe
ya el equipo: Go se contrató el 2026-08-03 y **la suscripción de Claude no se renueva**.

El motivo de fondo no es el precio. Los ocho records de [`telemetry.json`](telemetry.json) registran
`route: claude` en **todas** las fases de `ARC1-004` a `ARC1-007`. El 100 % del trabajo lo hizo el
proveedor que se va, así que ninguna otra ruta tiene evidencia de funcionar y la línea base de
duración nunca se tomó: `durationMin` es `null` en los ocho.

Efecto lateral que sí importa: **builder y reviewer ahora son modelos distintos por configuración.**
`ARC1-004`, `ARC1-005` y `ARC1-006` tuvieron que declarar a mano la desviación «no hubo review
independiente». Eso deja de depender de que alguien se acuerde.

## Pools y qué se reserva para qué

| Pool | Estado | Reservado para |
|---|---|---|
| `opencode-go` | activo desde 2026-08-03 | **todo** el trabajo agéntico del proyecto |
| `opencode` gratuito | activo | red de seguridad cuando Go agota la ventana de 5 h |
| `chatgpt-plan` | 7 % semanal hasta 2026-08-08 | **sólo `imagegen`** y desbloqueos que Go no resuelve |
| Claude | cuenta regresiva | auditoría y diagnóstico; **nunca builder** |

**En Go el modelo elegido es la tasa de quemado.** El límite es en dólares equivalentes, no en
requests. El volumen va a `deepseek-v4-flash`; los caros se reservan para fallos medidos, no
sospechados. `Use balance` debe quedar desactivado o el gasto deja de ser previsible.

**Cuidado con el prefijo.** `opencode-go/gpt-5.6-luna` no consume cuota de ChatGPT;
`openai/gpt-5.6-luna` sí. Mismo modelo, factura distinta. No enrutar a `openai/*` desde OpenCode
cuando la intención sea conservar la cuota de imagen: es el mismo pool que Codex, no una vía de
escape.

## Arte: `vision` no es `imagegen`

Son dos capabilities distintas y confundirlas cuesta un pipeline entero.

- **`vision`** — *leer* una imagen: comparar un screenshot contra una referencia, revisar un golden
  frame, verificar safe areas. La cubren `opencode/mimo-v2.5-free` —la más barata verificada—,
  `opencode-go/gpt-5.6-luna` y `opencode-go/mimo-v2.5-pro`. Es lo que `img2threejs` necesita en cada
  pass. **Verificada** el 2026-08-03 por `TASK-003`, con el gate duro de magnitudes de §«Routing
  vigente».
- **`imagegen`** — *crear* una imagen. **Ningún modelo de OpenCode la tiene**, tampoco Luna ni mimo.
  Vive sólo en Codex (`$imagegen` / `gpt-image-2`) o en ChatGPT a mano.

Por eso una tarea de arte 2D se parte en tres, y sólo la del medio depende de la cuota de ChatGPT:

```text
spec artística                agente de Go, barato
generación                    EL DIRECTOR, a mano     ← WAITING_PROVIDER hasta 2026-08-08
atlas / manifest / integración agente de Go, barato
```

Esto no es nuevo: [`ASSET_PIPELINE.md`](ASSET_PIPELINE.md) ya decía que un builder de OpenCode
*«puede procesar atlas, formatos, materiales e integración, pero no elige la identidad final ni
declara una imagen como geometría»*. Lo único que cambia es que ahora está en el routing en vez de
sobreentendido.

## Smoke por modelo

1. confirmar que el ID aparece en `opencode models`;
2. usar un prompt read-only de 5–10 minutos sobre un ticket ya cerrado, nunca sobre el activo;
3. verificar lectura de reglas, JSON válido, tool calls y respeto de ownership;
4. **cronometrar con reloj de pared** y registrar el resultado en `telemetry.json`;
5. no repetir más de una vez sin causa técnica distinta.

No usar reputación de internet como sustituto de evidencia local.

## Ownership

`ownership.json` v12 le asigna este archivo a `director/write` (`CP-023`). Hasta v11 no tenía dueño,
y el plan era dárselo «en la rotación de cierre de `ARC1-008`» — el mismo diferimiento que ya había
causado `OI-001`. Se corrigió en vez de repetirlo por tercera vez.

## Fuentes oficiales

- [OpenCode Agents](https://opencode.ai/docs/agents/)
- [OpenCode Commands](https://opencode.ai/docs/commands/)
- [OpenCode CLI/models](https://opencode.ai/docs/cli/)
- [OpenCode Go](https://opencode.ai/docs/go/)
- [OpenCode project config](https://opencode.ai/docs/config/)
