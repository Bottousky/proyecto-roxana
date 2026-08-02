# Protocolo de ejecución por ticket

## Precondiciones

1. Abrir OpenCode en la raíz del repositorio.
2. Leer `AGENTS.md`, `STATE.md`, `tasks.json`, este protocolo, `PACKETS.md`, gates y ficha activa.
   No leer fichas ni paquetes de otros tickets.
3. Ejecutar `git status --short --branch` y preservar cambios preexistentes.
4. Confirmar exactamente un ticket activo y WIP `1`.
5. Confirmar que el predecesor está `DONE` y que `executionAuthorized` cubre el cambio.
6. Confirmar ownership y archivos protegidos. Si algo falta, `BLOCKED`.

## Ciclo obligatorio

El ciclo se ejecuta **por paquete**, no por ticket. Un ticket con varios paquetes recorre A–D una
vez por cada uno y llega a E una sola vez, al final. La definición, subdivisión y frontera de sesión
de los paquetes está en [`PACKETS.md`](PACKETS.md).

### A — Plan sin cambios

Ejecutar `/arc-plan ARC1-N`. El plan identifica estado real, diff mínimo, archivos permitidos,
riesgos, gates y decisiones humanas. No escribe ni explora el sucesor.

En su primera ejecución sobre un ticket, el plan además decide si el ticket se subdivide según los
cuatro criterios de `PACKETS.md`, y escribe el contrato del **paquete activo únicamente**. Del
siguiente sólo registra el título tentativo. Si el plan del paquete supera 10 pasos, el paquete es
demasiado grande: se vuelve a subdividir en vez de ejecutarlo.

### B — Build acotado

Sólo con autorización vigente, ejecutar `/arc-build ARC1-N`. El builder implementa el mínimo,
mantiene el diff dentro de ownership y prueba después de cada bloque. Un fallo del mismo ticket se
corrige dentro de la ronda; uno de otro ticket sólo se registra.

Una estrategia técnica por paquete. Si la primera no es viable, el builder se detiene y reporta: no
prueba la segunda en la misma sesión. En un paquete visual, si al primer tercio del tiempo no existe
nada observable, se detiene y explica el bloqueo.

Todo hallazgo ajeno al paquete se registra en [`OPEN_ISSUES.md`](OPEN_ISSUES.md) y **no se arregla**.
Si bloquea, el paquete termina en `BLOCKED`; no se improvisa una solución.

### C — Review independiente

Ejecutar `/arc-review ARC1-N`. El reviewer no edita. Clasifica P0/P1/P2/sugerencia. Sólo P0/P1
bloquean; P2 no habilita ampliar alcance.

### D — Gate humano

Todo cambio visible produce evidencia desktop 1440×900 y mobile 390×844, consola y pasos de
reproducción. El usuario aprueba o rechaza cámara, composición, personaje, iluminación y UX. Cada
devolución consume una ronda. Máximo **dos por paquete y cuatro por ticket**; excederlo requiere
autorización explícita. El builder no declara calidad visual: entrega capturas, no veredictos.

### E — Cierre

Ejecutar `/arc-close ARC1-N` únicamente tras gates completos de **todos** sus paquetes. Actualizar
estado, decisiones, evidencia y manifests. Crear un commit acotado — a nivel de ticket, nunca de
paquete. Marcar el sucesor `READY`, pero detenerse sin analizarlo ni implementarlo.

Cada fase de paquete emite su record en [`telemetry.json`](telemetry.json) al cerrarse: ruta,
`modelId` literal, duración medida, ronda, resultado. Lo no medido va en `null` y cuenta como
`not-run`; no se estima. Sin ese record, la fase no está cerrada.

## Salida obligatoria del builder

1. resumen;
2. archivos modificados;
3. aceptación criterio por criterio;
4. comandos y resultados;
5. tests automáticos;
6. verificaciones manuales pendientes;
7. evidencia y capturas;
8. métricas observadas;
9. riesgos/deuda;
10. `git diff --check`;
11. `git status`;
12. recomendación: `TECH_REVIEW`, `HUMAN_REVIEW`, `BLOCKED` o `DONE`.

## Git

- No borrar, resetear ni reescribir historia.
- No mezclar cambios ajenos ni incorporar archivos fuera del ticket.
- No commit antes de review/gate aplicable; no push automático.
- Rollback mediante commit correctivo o reversión explícitamente aprobada, nunca borrando trabajo
  preexistente para simplificar.
