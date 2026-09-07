# Proyecto Roxana — trabajo en el repositorio

Construimos aventuras en las que se aprende actuando sobre el mundo. La prioridad
actual es completar y pulir Ohmdal Arco I, desde la llegada hasta el faro.

- Lee este archivo, el AGENTS del mundo y los archivos necesarios para el cambio.
  No recorras informes históricos ni toda la documentación por rutina.
- Las instrucciones actuales de Manuel definen el alcance. Mantén coherencia con
  el canon y los modelos pedagógicos; las tareas antiguas no limitan un encargo
  nuevo. Resuelve decisiones reversibles dentro del encargo.
- Ohmdal usa PlayCanvas Engine v2, TypeScript y Vite. Mantén el dominio eléctrico
  puro y testeable. No actualices dependencias incidentalmente ni elimines otros
  mundos o baselines al editar Ohmdal.
- Una mejora debe poder jugarse. Verifica el comportamiento en navegador y touch
  cuando corresponda; una captura o un build por sí solos no prueban calidad.
- Ejecuta `npm run build`, `npm test` y los recorridos pertinentes. `npm run verify`
  reúne build, tests y checks de contenido. No debilites checks para pasar.
- Puedes delegar partes independientes y pedir revisión fresca. Evita dos
  implementadores sobre los mismos archivos y conserva el trabajo ajeno.
  Una revisión independiente no puede ser la autoaprobación del implementador.
- Verifica licencias antes de incorporar assets. No publiques secretos ni generes
  gastos sin autorización. No uses force-push ni descartes trabajo único.
- Documenta sólo lo necesario para continuar: actualiza una fuente existente.
  No crees un task, informe o protocolo por cada iteración. Evidencia generada y
  capturas van en `output/`, fuera de Git.

Entradas: [proyecto](README.md), [Ohmdal](docs/20-worlds/ohmdal/AGENTS.md),
[puzzles](docs/guia-puzzles.md). Lore y currícula viven en `docs/`;
el historial de decisiones y trabajos retirados se consulta en Git.
