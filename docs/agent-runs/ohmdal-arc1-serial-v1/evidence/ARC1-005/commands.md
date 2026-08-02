# `ARC1-005` — comandos y salidas

Base `b49b617`, rama `codex/ohmdal-arc1-control-plane`, 2026-08-02.

## Cálculo de recorrido — `ARC1-005-A`

Importa `levelData.ts` y `navigation.ts` con `node --experimental-strip-types` y calcula distancias,
tiempos, hash canónico y validación de navegación. Salida completa en `route-timing.json`.

```text
totals.distanceM            38.05
totals.walkSeconds          19.03
totals.scriptedWaitSeconds   4.50
totals.routeFloorSeconds    23.53
gf02PacingProbe.walkSeconds  7.77   (R0_PORTAL_SPAWN → R3_TALLER_THRESHOLD, 15,54 m)
canonicalRouteHash          be242e48
navigationValidationIssues  []      lista vacía = gate de navegación plana PASS
```

Contra el objetivo de 25–35 min de doc. 10 línea 8:

```text
routeFloorShareOfTargetMinPct  1.1
routeFloorShareOfTargetMaxPct  1.6
secondsCarriedByCausalScenes   1476.47 … 2076.47   (24,6 … 34,6 min)
```

## Verificación de fichas — `ARC1-005-B`

Importa `cards.ts`, `types.ts`, `circuitModel.ts` y `diagnosisModel.ts`, mide integridad, recalcula
el solver y hace búsqueda exhaustiva de órdenes válidos. Salida completa en `cards-audit.json`.

```text
canonicalFieldCount        30
cardCount                   6
allCardsPassV2Contract   true      30/30 campos, orden canónico, sin vacíos, -v2, V2 CANON-EDU
orphanCards                []      ninguna ficha sin escena asignada

network.closed   Req 250 Ω · I 20,00 mA · nodos 5 / 3 / 0 / 0 V · P 0,040 y 0,060 W
network.open     Req ∞ · I 0 · nodos 5 / 5 / 5 / 0 V · caída 5,00 V sobre la apertura
network.passiveOhms   V_PLUS-N1 100 · N1-N2 150 · V_PLUS-REF 250 · N2-REF open ∞
puertaSolverIdenticalToLumen  true

validOrders.transitionsEvaluated   976 065 035
validOrders.totalValidOrders            88 044   (≤12 acciones)
validOrders.continuityFirst    83 836 órdenes, mínimo 9 acciones
validOrders.voltageFirst        4 208 órdenes, mínimo 10 acciones
validOrders.meetsAtLeastTwoOrders  true
```

## Verificación cruzada de citas

Las 15 referencias `archivo:línea` del inventario y del documento de contenido se comprobaron una
por una contra la fuente. **15/15 coinciden.** Una salió corrida en el primer borrador —el rango de
tickets de doc. 16 decía 58-77 y debía decir 61-76— y se corrigió dentro de la misma ronda.

## Gates mecánicos

```text
npm run build                  PASS   ✓ built in 5.83s
npm test                       PASS   ℹ tests 4 · ℹ pass 4 · ℹ fail 0
npm run 3d:validate-manifests  PASS   5 manifests OK
git diff --check               PASS   sin errores de whitespace
```

Las cuatro suites de `tests/ohmdal-hd2d-*` corren dentro de `npm test` y pasan, incluida
`ohmdal-hd2d-education-cards.test.ts`, que es el test que ya exigía 30 campos y estado `V2
CANON-EDU` a las seis fichas.

## `not-run` declarados

| Qué | Motivo |
|---|---|
| `npm run verify` | WSL sin distribución; sustituido por build + test + manifests + `diff --check` |
| Duración jugada real | Exige playtest; `ARC1-030` |
| Tiempo de diálogo, interacción y diagnóstico | El harness no lo modela; `ARC1-030` |
| Capturas | El ticket no produce cambio visible |
| Auditoría independiente V2 | **Heredada**, no repetida; ver `CONTENT_V2.md` §3.2 |
