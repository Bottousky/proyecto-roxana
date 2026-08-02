# Fichas educativas H1 — paquete V1 para auditoría independiente

**Estado del paquete:** `V1-ready-for-independent-audit`

Este paquete entrega seis fichas completas como datos TypeScript puros en
[`cards.ts`](../../../../../src/labs/ohmdal-hd2d-preprod/education/cards.ts). Cada ficha usa
exactamente los 30 campos de la
[Biblia educativa canónica](../../../../ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md#ficha-obligatoria-por-contenido),
en el mismo orden. Los tests rechazan campos faltantes, adicionales o vacíos.

| Ficha | Identificador | Modelo ejecutable |
|---|---|---|
| Seguridad | `H1.1-seguridad-virtual-v1` | estados protegidos en `diagnosisModel.ts` |
| Circuito/continuidad | `H1.2-circuito-continuidad-v1` | `circuitModel.ts` |
| Instrumento | `H1.3-instrumento-ohm-v1` | `instrumentModel.ts` |
| Diagnóstico Lumen | `H1.4-diagnostico-lumen-v1` | `diagnosisModel.ts` |
| Transferencia Puerta | `H1.5-puerta-transferencia-v1` | mapeo `PUERTA_NODE_LABELS` |
| Bitácora | `H1.6-bitacora-evidencia-v1` | `bitacoraModel.ts` |

## Contrato técnico común

La única red autorizada es enteramente virtual:

```text
V_PLUS -- R1 100 ohm -- N1 -- R2 150 ohm -- N2 -- retorno -- REF
Vs = 5,00 V DC; retorno = closed | open
```

Con retorno cerrado, `Req=250 ohm`, `I=20,00 mA`, los nodos respecto de `REF` son
`[5,00; 3,00; 0,00; 0,00] V` y las potencias son `0,040 W` y `0,060 W`. Con retorno abierto,
`I=0` y los nodos son `[5,00; 5,00; 5,00; 0,00] V`; la tensión de `5,00 V` en `N2` no demuestra
corriente ni funcionamiento bajo carga.

La Puerta conserva exactamente ese solver y sólo cambia los rótulos a `marca_este`,
`bisagra_alta`, `bisagra_baja` y `marca_oeste`. No introduce fórmula, componente o práctica.

## Correcciones del benchmark incorporadas

- Las fuentes de esta nota resuelven desde su ubicación real; no se conservaron los enlaces rotos
  de B01.
- El caso de mismo nodo exige inspección completa, hipótesis, configuración, estado energizado
  bloqueado y rango válido antes de devolver `0,00 V`; no omite precondiciones.
- La ficha de circuito dice “calculé `20,00 mA`”. El modelo no ofrece medición de corriente.
- Se distinguen `OUT_OF_RANGE`, `OPEN_PATH`, `INCOMPLETE_CONFIGURATION`, `UNDEFINED_POINT`,
  `MODE_INCOMPATIBLE_WITH_STATE` y `STATE_NOT_MEASURABLE`.

La reproducción local de esos hallazgos y la identidad de los tres insumos congelados están en
[`source-audit.md`](source-audit.md). B01/B02 se usaron como borradores, no como autoridad;
prevalecen la Biblia y el contrato del
[vertical slice](../../../../ohmdal-biblia/10_VERTICAL_SLICE.md).

## Seguridad y no transferencia

El instrumento es un panel abstracto: no imita bornes, categorías, fusibles ni procedimientos de
un multímetro. `R` y `CONTINUITY` se bloquean energizados. Toda intervención requiere
`deenergized_isolated`, ninguna acción describe una práctica física y el paquete no cubre red,
AC, baterías de alta energía, equipos reales, cortos o sobrecargas.

## Condición para promoción

DIR-EDU-001 sólo auto-reproduce cálculos y tests. Un segundo agente debe volver a ejecutar los
tests, verificar fuentes y seguridad y registrar su propia reproducción. Hasta entonces las seis
fichas son V1, no V2 y no `CANON-EDU`.
