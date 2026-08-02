# Backlog operativo — Arco I «La Luz»

**Workflow:** `STRICT-SERIAL`
**WIP global:** 1
**Ejecución:** no autorizada
**Ticket activo:** `ARC1-001 — HUMAN_REVIEW`

## Autoridad

- `tasks.json` es la fuente machine-readable de keys, estados y dependencias.
- `tickets/ARC1-001.md` es la única especificación expandida.
- `docs/ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md` conserva el backlog narrativo completo.
- Un ticket futuro se expande sólo después de que su predecesor esté `DONE`.

## Epics

| Rango | Epic | Salida |
|---|---|---|
| ARC1-001–006 | Gate y control | cámara aprobada, contrato, golden frames, color script, escenas y presupuesto |
| ARC1-007–033 | Vertical slice | experiencia 25–35 min y veredicto humano |
| ARC1-034–035 | ADR/preproducción | runtime y kit productivo congelados |
| ARC1-036–040 | Cuenca | primera región completa |
| ARC1-041–045 | Castillo | serie/paralelo y distribución |
| ARC1-046–050 | Forja/Terrazas | potencia, Joule, KVL y divisores |
| ARC1-051–055 | Faro/Lago | capacitor, tiempo y cierre técnico |
| ARC1-056–062 | Cierre/release | epílogo, campaña integrada, guía docente y release |

## Regla de expansión

No crear 62 specs extensas. El Director expande sólo el ticket activo. Puede crear un skeleton del
siguiente para registrar un bloqueo, pero no investigar su solución, elegir assets ni tocar código.
