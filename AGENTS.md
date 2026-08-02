# Proyecto Roxana — Reglas para agentes

## Misión

Construir un juego narrativo educativo con un shell compartido y mundos que pueden usar
runtimes distintos. La tecnología sirve a la gramática pedagógica; no se impone una cámara
o motor único a todos los mundos.

## Base que no debe romperse

- Ohmdal y su Arco I son la base estable.
- Conservar TypeScript, Vite, Phaser, Three.js y el `RuntimeHost` existente.
- Phaser continúa para Ohmdal mientras no exista una migración aprobada por ADR.
- Three.js se usa para el Instituto y experiencias 3D/2.5D cargadas bajo demanda.
- En `/jugar`, sin `?school3d=1` el prólogo estable debe seguir funcionando.
- No cambiar el comportamiento estable ni ampliar el alcance del Instituto durante tareas de setup.
- No migrar a React, R3F, Next.js u otro motor sin ADR y pedido explícito.
- El material 3D actual es prototipo y evidencia de dirección; no declararlo arte final.
- No reescribir `src/jugar`, los modelos pedagógicos ni el guardado para resolver una tarea visual.

## Antes de modificar

1. Leer `README.md`, `package.json` y las instrucciones aplicables.
2. Leer `docs/plan-plataforma-cinco-juegos.md`.
3. Leer `docs/spec-p3-escuela-3d.md` para entender el greybox original.
4. Leer `docs/3d/STATE.md` y actualizarlo después de un bloque significativo.
5. Ejecutar el baseline relevante y separar fallos preexistentes de regresiones.

## Comandos mínimos

- Instalar: `npm install`
- Compilar: `npm run build`
- Tests: `npm test`
- Gate completo: `npm run verify`
- Manifiestos: `npm run 3d:validate-manifests`
- Índice de assets: `npm run 3d:asset-index`
- GLB genérico: `npm run 3d:validate-glb -- <archivo.glb>`
- Escuela existente: `npm run school:validate-gltf` y `npm run school:report`

`npm run verify` requiere Bash. En Windows sin una distribución WSL, registrar el bloqueo del
entorno y ejecutar como mínimo `npm run build` y `npm test`; no declarar que `verify` pasó.

## Producción 3D

1. Ejecutar primero la skill `roxana-3d-director`.
2. Usar procedural o `img2threejs` para arquitectura, hard-surface, módulos, mecanismos y
   piezas con pivotes o sockets.
3. Usar Meshy para assets orgánicos, escultóricos o hero irregulares.
4. Considerar sprite 2D para personajes con cámara controlada.
5. Usar CAD paramétrico para piezas físicas funcionales; Meshy sólo puede resolver la carcasa.
6. Componer escenas por módulos; nunca generar una academia completa como una malla única.
7. Reutilizar el loader GLB/Draco de `src/landing/school3d.ts` antes de agregar otro loader.
8. No importar un GLB al runtime sin manifiesto, escala, pivote, frente, collider, presupuesto,
   optimización y QA.

## Assets y trazabilidad

- Registrar cada asset en `assets/manifests/`.
- Separar referencias, fuentes y variantes runtime. `assets/school3d/` es una ruta heredada que
  se migra de forma gradual: no moverla en una tarea de setup porque el código estable la importa.
- No agregar modelos pesados de prueba.
- No versionar `dist`, `node_modules`, cachés, secretos ni salidas temporales.
- Una referencia debe registrar origen y derechos; un asset generado debe registrar prompt/spec,
  proveedor, fecha, coste y licencia.

## Créditos y secretos

- Nunca imprimir, versionar ni enviar `MESHY_API_KEY` al cliente Vite.
- Meshy sólo puede recibir la clave por variable de entorno.
- Consultar balance antes de un lote; sin credencial, dejar la prueba pendiente.
- Máximo tres previews por asset salvo autorización.
- Un hero asset requiere aprobación humana antes de texturizar o refinar.
- La impresión 3D no autoriza a tratar una malla decorativa como pieza mecánica segura.

## Calidad visual

- Compilar no equivale a terminar.
- Toda tarea visual debe renderizarse y compararse con una referencia.
- Usar metros, origen en el suelo y maniquí humano de 1,72 m.
- Validar forma y escala antes de textura; validar cámara real antes de aprobar.
- No ampliar alcance si composición, escala o silueta no pasan sus gates.
- Entregar captura desktop y mobile para cambios visibles.

## Rendimiento

- Cargar runtimes y zonas bajo demanda.
- Usar instancing para repetidos, colliders simples y materiales compartidos.
- Liberar recursos Three.js al desmontar.
- Medir con `renderer.info`; no afirmar rendimiento sin datos.
- No adoptar Draco, Meshopt, KTX2 o una segunda compresión por ritual: exigir comparación
  reproducible de peso, tiempo de carga y coste CPU/GPU.

## Sistema multiagente

### Arco I Ohmdal — precedencia STRICT-SERIAL

Para `docs/agent-runs/ohmdal-arc1-serial-v1/` estas reglas prevalecen sobre cualquier permiso de
paralelismo general:

- Leer, en orden, `STATE.md`, `tasks.json`, `EXECUTION_PROTOCOL.md`, `ACCEPTANCE_GATES.md` y la
  ficha del único ticket activo.
- WIP global `1`. No comenzar, explorar productivamente ni modificar el ticket sucesor hasta que
  el activo esté `DONE`.
- Sólo el Director cambia estados. `IMPLEMENTED`, `TECH_REVIEW`, `HUMAN_REVIEW`, `CONDITIONAL` y
  `not-run` no son `DONE`.
- Trabajar únicamente dentro del ownership de la ficha activa. Ante solapamiento, cambio de canon,
  seguridad, coste o arquitectura: detenerse y marcar `BLOCKED`.
- No hacer commits desde el builder antes de review técnico y gate humano aplicable. No hacer push
  ni abrir el ticket siguiente automáticamente.
- Todo cambio visible exige captura 1440×900 y 390×844, consola limpia y aprobación humana.
- Máximo dos rondas por ticket visible; una tercera requiere autorización humana explícita.
- H3, `/jugar`, Meshy, generación paga y migración de runtime permanecen bloqueados salvo que el
  ticket activo y `tasks.json` los autoricen expresamente.
- Comandos reales: `npm run build`, `npm test`, `npm run 3d:validate-manifests` y
  `git diff --check`. `npm run verify` sólo se declara PASS si Bash/WSL realmente lo ejecuta.
- Assets: manifest obligatorio, origen/derechos, escala, pivote, frente, collider, presupuesto,
  cámara real y métricas. Nunca una región como malla única.
- Cierre: evidencia, review, decisión humana cuando corresponda, actualización de `tasks.json`,
  `STATE.md`, `DECISIONS.md` y commit acotado. Luego detenerse.

- El hilo principal ocupa el rol Director/integrador y conserva decisiones, contratos e
  integración final.
- Delegar sólo cuando el usuario autorice ejecutar un hito y
  `docs/agent-runs/<hito>/tasks.json` marque `executionAuthorized: true`.
- Usar como máximo tres agentes ejecutores simultáneos, sólo para tareas independientes.
- No asumir que un subagente obtiene un worktree propio. Para dos trabajadores que escriben en
  paralelo, usar tareas separadas de Codex App iniciadas en modo Worktree.
- Reservar subagentes del mismo hilo para exploración, pruebas, revisión o escrituras que no
  requieran aislamiento Git.
- Los cuatro roles disponibles son Director/integrador, Arquitectura procedural,
  Asset Forge y Evaluador visual/funcional/rendimiento.
- Materiales e iluminación pertenecen a Arquitectura hasta que un hito aprobado los separe.
- Crear una rama por rol con formato `codex/<hito>-<rol>` y un worktree aislado por rama.
- Todos los worktrees de un hito deben partir del mismo commit fijado en `tasks.json`.
- Cada agente modifica únicamente los globs asignados en `ownership.json`. Si dos agentes
  necesitan la misma frontera, detener ambos y devolver la decisión al Director.
- El Director integra commits de trabajadores de forma secuencial y resuelve conflictos; los
  trabajadores no editan el archivo de integración.
- Ejecutar un único Evaluador después de integrar. El Evaluador no corrige código: registra
  evidencia en `review-round-*.md` y `performance.json`.
- Permitir como máximo dos rondas automáticas de revisión. Una tercera ronda requiere aprobación
  explícita del usuario.
- Cada tarea delegada debe tener un entregable acotado y una estimación de 30 a 90 minutos. No
  abrir sesiones sin condición de cierre.
- Meshy exige presupuesto, balance y aprobación explícitos en `asset-manifest.json`; la
  disponibilidad de una credencial no constituye aprobación.
- Antes de delegar, leer `docs/agent-runs/README.md` y todos los contratos del hito activo.
- No usar Agents SDK para este flujo hasta cumplir los gates documentados y aprobar un ADR.

## Git

- Trabajar en ramas cortas `codex/<hito>`; en hitos multiagente usar
  `codex/<hito>-<rol>`.
- `main` debe quedar desplegable.
- No borrar trabajo ajeno, forzar ramas ni reescribir historia.
- Revisar secretos, builds y archivos grandes antes de agregar al índice.
- No agregar dependencias de producción sin justificar y registrar la decisión.

## Definition of done

Entregar resumen, archivos cambiados, comandos, resultados, capturas/métricas cuando
corresponda y pendientes explícitos. Si un gate falla, reportarlo; no declararlo aprobado.
