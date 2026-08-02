# Gates de aceptación

## Gates comunes para `DONE`

- objetivo y criterios del ticket satisfechos;
- diff dentro de ownership y sin cambios ajenos;
- `npm run build`, tests relevantes y `git diff --check` PASS;
- `npm run 3d:validate-manifests` cuando haya assets/manifests;
- cero P0/P1 abiertos en review independiente;
- evidencia reproducible almacenada;
- estado, decisiones y manifests actualizados;
- aprobación humana para todo cambio visible;
- commit acotado creado;
- ningún gate crítico `not-run` o `CONDITIONAL`.

## Visual y escena

| Criterio | Gate mínimo |
|---|---:|
| Composición/cámara | 4/5 |
| Escala humana | 4/5 |
| Silueta/arquitectura | 4/5 |
| Materiales | 4/5 |
| Iluminación | 4/5 |
| Interacción legible | 4/5 |
| Rendimiento mobile | 3/5 y piso medido 30 fps |
| Rendimiento desktop | 4/5 |
| Estabilidad/tests | 4/5 |

Evidencia mínima: 1440×900, 390×844, estado/cámara deterministas, consola, `renderer.info`, frame
time cuando corresponda, diferencias y decisión humana. Mobile no deforma el encuadre: recorta o
recompone según contrato.

## Educación

- ficha V2 antes de producir interacción final;
- modelo puro/determinista, valores, unidades, topología y estados inválidos;
- observación → hipótesis → medición → verificación → transferencia;
- error recuperable, sin cuestionario obligatorio ni metáfora que contradiga el modelo;
- V3 sólo después de playtest; V4 sólo tras auditoría curricular final.

## Assets

- referencia y derechos;
- escala, frente, pivote, collider y sockets;
- silueta antes de textura;
- captura en cámara real desktop/mobile;
- manifest, presupuesto, coste real, hashes y licencia;
- rendimiento medido; no aceptar una región como malla única.

## Estados que no cierran

`IMPLEMENTED`, `TECH_REVIEW`, `HUMAN_REVIEW`, `CONDITIONAL`, `not-run` y PASS de build aislado no
equivalen a `DONE`.
