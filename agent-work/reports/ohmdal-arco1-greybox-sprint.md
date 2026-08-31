# Ohmdal Arco I — informe final de greybox

## Estado

`COMPLETE` — iteración 1. G0–G7 quedaron `passed`. No hubo `HUMAN_GATE`.

El hardening de `dec2d75` se consumió como baseline y no se rediseñó. El loop de
Plaza permaneció cerrado y su estado no fue modificado.

## Ruta realmente recorrida

```text
Portal / Plaza
→ Taller de Lumen
→ Manantial / central hidroeléctrica
→ Plaza restaurada
→ campana / apertura del Castillo
→ Castillo de la Red
→ Forja / Terrazas
→ Faro / Lago
→ retorno por espacios restaurados
→ pedestal de Ohm / cierre de Arco I
```

El playtester recorrió la ruta usando movimiento e interacciones player-facing.
No mutó directamente flags de progreso. El resultado final fue
`storyStep=arc1_complete`, `arcComplete=true`, `finalReturn=true`.

## Sistema jugable por región

- **G1 Manantial:** medición inicial, compuerta hidráulica, disparo deliberado de
  protección por falta de retorno, puente de reparación, energización y medición
  final. Agua, maquinaria y estado eléctrico están causalmente conectados.
- **G2 Plaza:** el retorno hace observable la restauración; la campana energizada
  activa el relé físico y abre la ruta al Castillo como estado derivado.
- **G3 Castillo:** red de distribución reconfigurable con ramas, demanda y
  protecciones. Acepta configuraciones paralela y mixta defendibles; incluye
  sobrecarga productiva, recuperación y documentación antes del cierre.
- **G4 Forja/Terrazas:** carga térmica de 5 A frente a irrigación de 3 A,
  conductor medio, protecciones coordinadas y medición. El trade-off de potencia
  y seguridad es sistémico y recuperable.
- **G5 Faro/Lago:** culminación DC permitida, calibración de tensión y dos
  sincronizaciones estables. Reutiliza la firma de red previa y deja un seam
  explícito para RC/transitorio futuro cuando ese contrato sea ratificado.
- **G6 retorno/cierre:** backtracking por zonas persistentes y cierre derivado de
  todos los capítulos. La prosa final faltante queda neutral como `TODO(guion)`.
- **G7 freeze:** Golden Path completo, assertions eléctricas, lifecycle de zonas,
  capturas desktop/mobile y diagnósticos de render/red.

Todas las manipulaciones son directas en mundo sobre el mismo modelo eléctrico;
no se agregó quiz ni minijuego UI desacoplado. Los prompts/HUD sólo comunican la
interacción y siguen disponibles para teclado y touch.

## Reparto e integración

- **Sol High:** arquitectura, modelo eléctrico/pedagógico, integración runtime,
  touch, correcciones de workers, lifecycle, Golden Path, pruebas, acceptance,
  commits y cierre.
- **Luna Max:** dos scopes disjuntos: modelo/tests de Arco I y construcción
  mecánica de las tres zonas tardías. Sol corrigió seams load-bearing antes de
  aceptar e integrar.
- **MiniMax M3 vía GMI:** tres tareas reales proposal-only. El scaffold de test de
  contrato de escena fue parcialmente reutilizable tras tres reparaciones de
  Sol y terminó en PASS. La propuesta VFX aportó knobs/budgets pero no justificó
  integración. La auditoría de runtime falló por lecturas incorrectas del código
  y no se integró. Resultado económico provisional: `WOULD_PAY=no` para los tres
  outputs a esta calidad; la evaluación sigue abierta hasta 2026-09-06.
- **Gemini 3.7 Flash High:** reviewer independiente read-only del modelo, runtime,
  tests, JSON y 15 capturas. Veredicto final `PASS`, blockers player-facing
  `none`.

## Evidencia mecánica

| Gate | Resultado |
|---|---|
| `npm run agent:minimax:gmi:check` | PASS — `MiniMaxAI/MiniMax-M3` |
| `npm run loop:ohmdal-arco1:validate` | PASS antes de ejecutar; PASS al cierre |
| `npx tsc --noEmit` | PASS |
| tests enfocados Arco I | PASS |
| `npm test` | PASS, suite completa |
| `npm run smoke:play` | PASS, canvas activo, 0 errores/warnings |
| `npm run playtest:ohmdal-golden-path` | PASS, 22 checkpoints |
| `git diff --check` | PASS |
| `npm run verify` | wrapper no ejecutable porque `bash` resolvió al stub WSL sin distribución |
| `C:\\Program Files\\Git\\bin\\bash.exe scripts/verificar-hito.sh` | PASS del gate exacto: build, tests, TODOs y lenguaje |

El verificador reportó 20 `TODO(guion)` en el repo; el único placeholder nuevo
de este milestone es el cierre neutral permitido. No se debilitó ningún test.

## Golden Path y presupuesto

- Artifact: `output/playwright/ohmdal-hardening/golden-path/golden-path-run.json`
- Resultado: PASS; 22 checkpoints; 0 console errors; 0 page errors.
- Red: 22.03 MB, estable durante el recorrido.
- Pico: 145 draw calls y 88,836 triángulos en Plaza + Manantial.
- Luces con sombra: siempre 1.
- Cuatro warnings informativos de SwiftShader `ReadPixels`; sin error funcional.

| Configuración relevante | Draw calls | Triángulos |
|---|---:|---:|
| Portal | 85 | 56,188 |
| Taller | 91 | 39,828 |
| Taller después de compuerta | 96 | 57,008 |
| Manantial | 145 | 88,836 |
| Plaza restaurada | 108 | 67,676 |
| Castillo | 39 | 7,224 |
| Forja/Terrazas | 59 | 9,532 |
| Faro/retorno | 33 | 6,704 |
| Plaza final | 123 | 70,564 |

Hay capturas mobile y desktop de Manantial, Plaza restaurada, Castillo,
Forja/Terrazas, Faro y cierre. El smoke móvil verificó interacción touch en cada
zona mayor.

## Deuda no bloqueante

- Arte final, materiales y contraste atmosférico de las zonas greybox tardías.
- Ajuste del solape entre toast e inventario en mobile angosto.
- VFX eléctricos más ricos una vez congelada la verdad jugable.
- Texto definitivo del epílogo y demás diálogo pendiente de guion.
- RC/transitorios/tiempo en Faro sólo después de ratificar ese contrato.
- Perfilado en hardware real; los datos actuales provienen de Chromium con
  SwiftShader y son evidencia reproducible, no un benchmark de GPU final.

## Integración y procedencia

- Milestone jugable: `b8bb412 feat(ohmdal): complete Arco I playable greybox`
- Revisión independiente:
  `agent-work/reports/gemini/ohmdal-arco1-greybox-final.md`
- Evaluación GMI: `agent-work/reports/minimax-gmi/EVALUATION.md`
- No se usó Meshy, Tripo ni proveedor generativo pago.
- No se cambió engine, dependencia mayor, canon ni currícula.
