# `ARC1-005` — trazabilidad del congelamiento

Qué se congeló, con qué número y de dónde salió cada número. Base `b49b617`, 2026-08-02.

## Condiciones del ticket, una por una

| Condición para `DONE` | Estado | Dónde se comprueba |
|---|---|---|
| Los dos documentos existen y son consistentes | PASS | `SCENE_INVENTORY.md`, `CONTENT_V2.md` |
| Cada número citado tiene archivo y línea, y coincide | PASS | 15/15 verificadas; ver `commands.md` |
| Medido y objetivo están distinguidos explícitamente | PASS | `SCENE_INVENTORY.md` §4.1 vs §4.3 |
| La suma de envolventes coincide con doc. 10 | PASS | 25,0 y 35,0 exactos; §4.3 |
| Estado de las fichas verificado programáticamente | PASS | `cards-audit.json`, `allCardsPassV2Contract: true` |
| Todo beat sin ficha declarado con motivo | PASS | `CONTENT_V2.md` §6 |
| Huecos registrados y no corregidos | PASS | `OI-002`, `OI-003` |
| Desviación de review registrada | PASS | `telemetry.json`, seis records |
| Build, tests, manifests y `diff --check` PASS | PASS | `commands.md` |
| Diff dentro del ownership | PASS | ver abajo |
| `ownership.json` rotado a `ARC1-006` | PASS | `ownership.json` v8 |
| `ARC1-006` pasa a `READY` | PASS | `tasks.json` |

## Número por número

| Número | Valor | Origen |
|---|---:|---|
| Distancia total del recorrido | 38,05 m | calculado de `levelData.ts:106-117` |
| Caminata total | 19,03 s | ídem, a 2 m/s de `navigation.ts:15` |
| Esperas guionadas | 4,50 s | `navigation.ts:39-48` (1,5 + 1 + 2) |
| Piso de recorrido | 23,53 s | suma de los dos anteriores |
| Cuota del objetivo | 1,1 %–1,6 % | contra 25–35 min de doc. 10 línea 8 |
| Ritmo Portal → umbral del Taller | 15,54 m, 7,77 s | pedido por `GOLDEN_FRAMES.md` GF-02 |
| Hash canónico de ruta | `be242e48` | `canonicalRouteHash()` |
| Errores de navegación | 0 | `validateNavigation()` devuelve `[]` |
| Escenas | 5 | derivadas: zona + anclaje de cámara + acto causal |
| Actos causales | 3 | E2, E3, E4 |
| Golden frames repartidos | 8 de 8 | 2 + 0 + 3 + 2 + 1 |
| Escenas sin golden frame | 1 (E2) | `OI-002` |
| Envolvente total | 25,0–35,0 min | verificada por suma en §4.3 |
| Cuota de E3 | 44 % / 43 % | 11 de 25 y 15 de 35 |
| Campos canónicos por ficha | 30 | `types.ts:1-32`, doc. 02 líneas 129-162 |
| Fichas | 6 | `cards.ts`, `EDUCATION_CARDS` |
| Fichas que pasan el contrato V2 | 6 de 6 | `cards-audit.json` |
| Fichas huérfanas | 0 | `orphanCards: []` |
| `Vs`, `R1`, `R2` | 5 V, 100 Ω, 150 Ω | `circuitModel.ts:4-6` |
| `Req`, `I` cerrado | 250 Ω, 20,00 mA | recalculado |
| Nodos cerrado / abierto | 5·3·0·0 / 5·5·5·0 V | recalculado |
| Potencias | 0,040 W, 0,060 W | recalculado |
| Solver Puerta ≡ Lumen | true | comparación por igualdad |
| Umbral de continuidad | 300 Ω inclusive | `instrumentModel.ts:25-31` |
| Órdenes válidos ≤12 acciones | 88 044 | búsqueda exhaustiva |
| Mínimo continuidad / tensión | 9 / 10 acciones | ídem |

Ningún valor de esta tabla fue estimado.

## Lo que NO se congeló, y dónde vive

| Qué | Dónde |
|---|---|
| Presupuesto técnico por escena | `ARC1-006` |
| Ritmo y duración reales | `ARC1-030` |
| Escala del blockout | `ARC1-011`; si cambia, se vuelve a medir §4.1 |
| Duración del overworld mínimo | `ARC1-010`, sin asignar |
| Promoción a V3 / V4 | `ARC1-030` / `ARC1-059` |
| Guion y diálogos | sin ticket propio todavía |
| Anclaje, encuadre y fenómeno de E2 | `OI-002`, `OI-003` → `ARC1-011`, `ARC1-015` |

## Diff del ticket

```text
docs/agent-runs/ohmdal-arc1-serial-v1/SCENE_INVENTORY.md          nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/CONTENT_V2.md               nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/tickets/ARC1-005.md         nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/packets/ARC1-005/ARC1-005-A.md  nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/packets/ARC1-005/ARC1-005-B.md  nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-005/*         nuevo
docs/agent-runs/ohmdal-arc1-serial-v1/OPEN_ISSUES.md              +2 filas
docs/agent-runs/ohmdal-arc1-serial-v1/telemetry.json              +6 records
docs/agent-runs/ohmdal-arc1-serial-v1/ownership.json              v6 → v8
docs/agent-runs/ohmdal-arc1-serial-v1/tasks.json                  ARC1-005 DONE, ARC1-006 READY
docs/agent-runs/ohmdal-arc1-serial-v1/DECISIONS.md                +CP-019
docs/agent-runs/ohmdal-arc1-serial-v1/STATE.md                    actualizado
```

Sin cambios en `src/**`, `assets/**`, `tests/**`, `package*.json`, `docs/ohmdal-biblia/**`,
`docs/agent-runs/ohmdal-hd2d-preprod-v1/**` ni `docs/agent-runs/ohmdal-arco1/**`.

`ownership.json` salta de v6 a v8: v7 fue el contrato de trabajo de `ARC1-005` —el que abría
`SCENE_INVENTORY.md` y `CONTENT_V2.md` a escritura— y v8 es la rotación de cierre a `ARC1-006`.
Sólo v8 se commitea, igual que v5 no se commiteó en `ARC1-004`.

## Desviación declarada

Las seis fases de los dos paquetes corrieron en la misma sesión y con la misma ruta (`claude`),
contra `PACKETS.md` §«Frontera de sesión». Mismo criterio aceptado en `CP-018`. Está en
`telemetry.json`. **No hubo review independiente y no se presenta como tal.**

Distinto y más importante: la **auditoría independiente V2** de las seis fichas —el paso H1.7 de
doc. 11— tampoco se repitió acá. Se hereda del run de preproducción, donde sí la ejecutó un segundo
agente con dos rondas correctivas y veredicto PASS el 2026-08-02. `ARC1-005` verificó los
artefactos y recalculó los modelos; no revalidó las fuentes curriculares.
