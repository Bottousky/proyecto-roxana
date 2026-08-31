# Roxana — BOUNDED_AGENT_LOOP

**Estado:** contrato cross-Roxana para trabajo autónomo acotado.

## Objetivo

Permitir que Codex avance varias iteraciones sin pedir aprobación humana en cada microcambio, manteniendo control de costo, canon, calidad y regresiones.

El loop NO es un daemon, scheduler, router automático ni framework multi-agent. El mecanismo sigue siendo:

```text
archivo + terminal + git + herramientas oficiales
```

## Roles

- **Codex / Sol High**: conductor técnico. Decide qué cambiar, integra, valida y decide avance de stage.
- **Codex worker / Luna Max**: ejecuta cambios mecánicos ya especificados: imports, manifests, wiring repetitivo, colocación de módulos, ajustes simples, tests y cleanup.
- **Gemini 3.7 Flash High / Antigravity CLI**: reviewer read-only y context distiller. No implementa ni modifica el repo.
- **Humano**: sólo interviene en `HUMAN_GATE`.

No instalar `sol-advisor`, routers o directors adicionales para ejecutar este contrato.

## Ciclo

```text
STATE
  ↓
GEMINI FLASH REVIEW
  ↓
SOL HIGH PLAN
  ↓
partition fixes
  ├─ LUNA MAX → ejecución mecánica
  └─ SOL HIGH → cambios de criterio/diseño/arquitectura
  ↓
BUILD + TEST + VALIDATE
  ↓
VISUAL HARNESS / evidence
  ↓
GEMINI FLASH REVIEW
  ↓
SOL HIGH compares evidence
  ├─ improve + stage gate PASS → next stage
  ├─ improve + not pass → next iteration
  └─ no improve/regression → rework or HUMAN_GATE
```

## Límites duros por stage

- máximo **3 iteraciones**;
- máximo **5 fixes** por iteración;
- máximo **1 cambio estructural importante** por iteración;
- máximo **2 workers Luna** simultáneos y sólo sobre archivos/disjuntos claros;
- ningún worker puede aprobar su propio trabajo;
- sin gasto de proveedor pago automático;
- sin cambio de engine, canon, narrativa o dependencia grande;
- sin borrar baselines para fabricar un PASS.

## Routing

### Gemini

Default del loop: **`gemini-3.7-flash-high` + effort `high`** por Antigravity CLI.

Si ese slug deja de existir, usar el equivalente **Gemini Flash High** que muestre `agy models`. No escalar automáticamente a Pro. Registrar el slug real en cada informe.

Gemini revisa evidencia completa y devuelve problemas priorizados. No ve sólo la mejor captura.

### Sol High

Usar para:

- composición;
- dirección visual;
- arquitectura;
- decisiones de material/lighting con trade-offs;
- particionar el trabajo;
- aceptar o rechazar una iteración.

### Luna Max

Usar sólo cuando el brief ya está suficientemente cerrado. Ejemplos:

- integrar N piezas ya elegidas;
- repetir módulos/instancing;
- manifests/provenance;
- ajustar valores concretos;
- wiring de assets;
- tests y warnings concretos;
- cleanup mecánico.

Si el harness actual no permite seleccionar Luna para un subagente, NO crear wrappers propios: Sol continúa sólo el trabajo imprescindible y reporta el fallback de routing.

## Estado

Cada loop tiene un `state.json` versionado. Estados válidos:

- `ready`
- `reviewing`
- `planning`
- `implementing`
- `validating`
- `capturing`
- `stage_pass`
- `stage_partial`
- `human_gate`
- `complete`

Actualizar el estado al cerrar cada iteración o gate. No hace falta commitear cada transición efímera; sí el cierre de iteración/stage.

## HUMAN_GATE

Detenerse y pedir intervención humana sólo si ocurre alguno de estos casos:

1. **canon/diseño**: referencias fuertes se contradicen o falta autorización para diseñar un hero;
2. **dinero**: Meshy/Tripo/otro proveedor pago requiere créditos o API key no previamente autorizada;
3. **arquitectura**: cambiar engine, dependencia grande, schema core o sistema pedagógico;
4. **seguridad/permisos**: login, secreto, permisos peligrosos o herramienta no autorizada;
5. **estancamiento**: 3 iteraciones sin alcanzar el gate o sin mejora verificable;
6. **regresión**: performance, mobile, tests o accesibilidad empeoran de forma material y no puede resolverse dentro del stage;
7. **hero gate**: `HERO_REFERENCE_GATE` no puede pasar sin nueva referencia/concept humano.

## Advance gate

Un stage puede avanzar sin aprobación humana cuando:

- sus criterios de aceptación propios pasan;
- no hay automatic failures nuevos;
- `npm run verify` pasa;
- validadores específicos pasan;
- evidencia visual desktop/mobile existe cuando aplica;
- Gemini Flash no detecta una regresión crítica load-bearing;
- Sol High confirma que el stage resolvió su objetivo y actualiza `state.json`.

No exigir que toda la experiencia sea `premium` para avanzar un stage intermedio.

## Cost control

- Gemini absorbe contexto largo/review fuera de Codex.
- Sol decide; no hace por defecto trabajo repetitivo.
- Luna ejecuta lotes pequeños y verificables.
- máximo 5 fixes evita que una iteración se convierta en un refactor abierto.
- no lanzar agentes adicionales si dos workers disjuntos no alcanzan.

## Hero assets

Si el siguiente stage contiene un asset identitario, antes de producción debe pasar:

`docs/3d/HERO_REFERENCE_GATE.md`

Un loop nunca puede usar text-to-3D libre para saltarse un reference gate.

## Definition of Done del loop

El loop termina en `complete` o `human_gate` y deja:

- `state.json` actualizado;
- informes Gemini por iteración;
- decisiones/fixes aplicados;
- capturas y métricas comparables;
- validación final;
- lista compacta de trabajo restante;
- commit/push del último estado verificable.
