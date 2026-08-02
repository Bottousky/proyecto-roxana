# Protocolo de ejecución por ticket

## Precondiciones

1. Abrir OpenCode en la raíz del repositorio.
2. Leer `AGENTS.md`, `STATE.md`, `tasks.json`, este protocolo, gates y ficha activa.
3. Ejecutar `git status --short --branch` y preservar cambios preexistentes.
4. Confirmar exactamente un ticket activo y WIP `1`.
5. Confirmar que el predecesor está `DONE` y que `executionAuthorized` cubre el cambio.
6. Confirmar ownership y archivos protegidos. Si algo falta, `BLOCKED`.

## Ciclo obligatorio

### A — Plan sin cambios

Ejecutar `/arc-plan ARC1-N`. El plan identifica estado real, diff mínimo, archivos permitidos,
riesgos, gates y decisiones humanas. No escribe ni explora el sucesor.

### B — Build acotado

Sólo con autorización vigente, ejecutar `/arc-build ARC1-N`. El builder implementa el mínimo,
mantiene el diff dentro de ownership y prueba después de cada bloque. Un fallo del mismo ticket se
corrige dentro de la ronda; uno de otro ticket sólo se registra.

### C — Review independiente

Ejecutar `/arc-review ARC1-N`. El reviewer no edita. Clasifica P0/P1/P2/sugerencia. Sólo P0/P1
bloquean; P2 no habilita ampliar alcance.

### D — Gate humano

Todo cambio visible produce evidencia desktop 1440×900 y mobile 390×844, consola y pasos de
reproducción. El usuario aprueba o rechaza cámara, composición, personaje, iluminación y UX. Cada
devolución consume una ronda. Máximo dos; una tercera requiere autorización explícita.

### E — Cierre

Ejecutar `/arc-close ARC1-N` únicamente tras gates completos. Actualizar estado, decisiones,
evidencia y manifests. Crear un commit acotado. Marcar el sucesor `READY`, pero detenerse sin
analizarlo ni implementarlo.

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
