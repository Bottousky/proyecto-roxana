# Arco I «La Luz» — backlog Jira serie

**Estado:** backlog canónico preparado; ejecución no autorizada

**Modo:** `STRICT-SERIAL`, WIP global = 1

**Bloqueo actual:** `ARC1-001` espera aceptación visual humana de `CAM-FIX-001`

**Fuente de control:** `docs/agent-runs/ohmdal-arc1-serial-v1/tasks.json`

## Regla inviolable

El Director no puede mover `ARC1-(N+1)` a `READY` ni iniciar exploración productiva de esa tarea
hasta que `ARC1-N` esté en `DONE`. Una tarea `DONE` exige artefacto integrado, gates automáticos,
evidencia y aprobación humana cuando sea visible. `TECH REVIEW`, `HUMAN REVIEW`, `CONDITIONAL`,
`not-run` o “implementado” no equivalen a `DONE`.

Los agentes sólo trabajan para el ticket activo. Un Story puede descomponerse en paquetes internos
de 30–90 minutos, también secuenciales; esos paquetes no autorizan anticipar el Story siguiente.

## Workflow Jira

`BACKLOG → READY → IN PROGRESS → TECH REVIEW → HUMAN REVIEW → DONE`

- `BLOCKED`: dependencia, entorno, seguridad o decisión externa impide avanzar.
- Sólo el Director cambia estados y registra commit/evidencia.
- Un fallo vuelve el mismo ticket a `IN PROGRESS`; no abre trabajo nuevo.
- Máximo dos rondas por ticket visible. Una tercera exige autorización del usuario.
- El usuario es aprobador final de cámara, composición, actuación, experiencia y cambios de alcance.
- H3, Meshy, generación paga y migración de `/jugar` permanecen prohibidos hasta autorización
  explícita en el control plane correspondiente.

## Definition of Done común

Todo ticket entrega:

1. criterios de aceptación satisfechos y trazados;
2. diff limitado al ownership del ticket;
3. build/tests relevantes y `git diff --check`;
4. manifests/licencias para assets;
5. captura desktop/mobile para cambios visibles;
6. métricas observadas para rendimiento, nunca estimadas como PASS;
7. actualización de `docs/3d/STATE.md` tras un bloque significativo;
8. commit acotado y decisión humana cuando corresponda.

## Backlog ordenado

La dependencia de cada fila es dura. `Prev.` significa el ticket inmediatamente anterior.

| Key | Epic | Story / resultado verificable | Owner | Est. | Dependencia |
|---|---|---|---|---:|---|
| ARC1-001 | Gate 0 | Aprobar visualmente cámara corregida en 1440×900, 900×900 y 390×844 | Director | 0,5 d | — |
| ARC1-002 | Control | Crear contrato H3 con base fija, presupuesto, ownership y `executionAuthorized` explícito | Director | 0,5 d | ARC1-001 DONE |
| ARC1-003 | Control | Congelar golden frames, identidad Ohmdal y lista legal de referencias | Director | 0,5 d | Prev. |
| ARC1-004 | Control | Congelar color script tarde→crepúsculo y shot deck del slice | Arquitectura | 1 d | Prev. |
| ARC1-005 | Control | Congelar inventario de escenas, beats, duración y fichas V2 del slice | Director | 1 d | Prev. |
| ARC1-006 | Control | Fijar presupuesto por escena: JS, texturas, audio, memoria, draw calls y tiempo | Director | 0,5 d | Prev. |
| ARC1-007 | Slice | Montar laboratorio Three.js mediante `RuntimeHost` sin tocar `/jugar` | Director | 1 d | Prev. |
| ARC1-008 | Slice | Probar ciclo mount/pause/resume/destroy y ausencia de fugas | Director | 1 d | Prev. |
| ARC1-009 | Slice | Implementar acciones comunes, teclado, táctil y reasignación base | Director | 1 d | Prev. |
| ARC1-010 | Slice | Construir overworld mínimo y transición a Cuenca | Arquitectura | 1 d | Prev. |
| ARC1-011 | Slice | Cerrar escala, recorrido y blockout Portal–Plaza | Arquitectura | 1 d | Prev. |
| ARC1-012 | Slice | Cerrar cámaras y oclusión Portal–Plaza desktop/mobile | Arquitectura | 1 d | Prev. |
| ARC1-013 | Slice | Integrar estudiante 4-dir con pivote, sombra y atlas mínimo | Asset Forge | 1 d | Prev. |
| ARC1-014 | Slice | Integrar Ohm sprite con estados accesibles y contacto | Asset Forge | 1 d | Prev. |
| ARC1-015 | Slice | Implementar llegada, encuentro con Edda y activación de Ohm | Director | 1 d | Prev. |
| ARC1-016 | Slice | Cerrar blockout, cámara y navegación del Taller | Arquitectura | 1 d | Prev. |
| ARC1-017 | Slice | Integrar Edda y Lumen con acciones mínimas de escena | Asset Forge | 1 d | Prev. |
| ARC1-018 | Slice | Implementar modelo V2 del diagnóstico de Lumen y tests | Director | 1 d | Prev. |
| ARC1-019 | Slice | Integrar medición diegética, órdenes válidos y error recuperable | Director | 1,5 d | Prev. |
| ARC1-020 | Slice | Cerrar blockout/cámara de Puerta–Manantial | Arquitectura | 1 d | Prev. |
| ARC1-021 | Slice | Implementar transferencia Lumen→Puerta y protección | Director | 1,5 d | Prev. |
| ARC1-022 | Slice | Implementar Bitácora: vivencia, evidencia, formalización y URL opcional | Director | 1 d | Prev. |
| ARC1-023 | Slice | Implementar tres estados del mundo y transformación causal | Arquitectura | 1,5 d | Prev. |
| ARC1-024 | Slice | Aplicar kit de materiales, luz, DOF moderado, agua y VFX | Arquitectura | 2 d | Prev. |
| ARC1-025 | Slice | Integrar audio original, ambiente, buses, subtítulos y VO parcial | Director | 1,5 d | Prev. |
| ARC1-026 | Slice | Implementar texto/contraste/color/reduced motion/partículas/tiempo accesible | Director | 1 d | Prev. |
| ARC1-027 | Slice | Implementar PWA, descarga, guardado local y recuperación offline | Director | 2 d | Prev. |
| ARC1-028 | Slice | Optimizar calidad adaptativa y medir desktop/mobile/Android físico | Arquitectura | 1,5 d | Prev. |
| ARC1-029 | Slice | QA Chrome, Edge, Firefox, Safari; teclado/táctil; consola y save | Evaluador | 1,5 d | Prev. |
| ARC1-030 | Slice | Playtest mixto 13–18/adultos y promover contenidos V2→V3 | Director | 2 d | Prev. |
| ARC1-031 | Slice | Evaluación visual/funcional/educativa integrada, ronda 1 | Evaluador | 1 d | Prev. |
| ARC1-032 | Slice | Corregir exclusivamente bloqueos P0/P1 de ronda 1 | Owner indicado | 1–2 d | Prev. |
| ARC1-033 | Slice | Evaluación final, aceptación humana y veredicto avanzar/descartar | Evaluador | 1 d | Prev. |
| ARC1-034 | ADR | Registrar ADR del runtime ganador y migración gradual | Director | 1 d | Prev. |
| ARC1-035 | Preprod | Congelar kit productivo, coste real/minuto y plantilla regional | Director | 1 d | Prev. |
| ARC1-036 | Cuenca | Cerrar escenas, fichas V2, habitantes y rutas de Cuenca | Director | 1,5 d | Prev. |
| ARC1-037 | Cuenca | Producir blockout, cámaras, navegación y landmarks | Arquitectura | 2 d | Prev. |
| ARC1-038 | Cuenca | Integrar sistemas U1, fallas, transferencia y Bitácora | Director | 2 d | Prev. |
| ARC1-039 | Cuenca | Producir assets, materiales, luz, VFX y audio de Cuenca | Director* | 3 d | Prev. |
| ARC1-040 | Cuenca | QA, rendimiento, accesibilidad, V3 y aceptación humana | Evaluador | 2 d | Prev. |
| ARC1-041 | Castillo | Cerrar escenas, fichas V2, habitantes y rutas del Castillo | Director | 1,5 d | Prev. |
| ARC1-042 | Castillo | Producir blockout, cámaras, navegación y red legible | Arquitectura | 2 d | Prev. |
| ARC1-043 | Castillo | Integrar serie/paralelo, distribución, fallas y Bitácora | Director | 3 d | Prev. |
| ARC1-044 | Castillo | Producir assets, materiales, estados, VFX y audio | Director* | 3 d | Prev. |
| ARC1-045 | Castillo | QA, rendimiento, accesibilidad, V3 y aceptación humana | Evaluador | 2 d | Prev. |
| ARC1-046 | Forja/Terrazas | Cerrar escenas, fichas V2, habitantes y rutas | Director | 2 d | Prev. |
| ARC1-047 | Forja/Terrazas | Producir blockout, cámaras, navegación y landmarks | Arquitectura | 3 d | Prev. |
| ARC1-048 | Forja/Terrazas | Integrar potencia/Joule/KVL/divisores, fallas y Bitácora | Director | 4 d | Prev. |
| ARC1-049 | Forja/Terrazas | Producir assets, materiales, calor/agua, VFX y audio | Director* | 4 d | Prev. |
| ARC1-050 | Forja/Terrazas | QA, rendimiento, accesibilidad, V3 y aceptación humana | Evaluador | 2 d | Prev. |
| ARC1-051 | Faro/Lago | Cerrar escenas, fichas V2, habitantes y rutas | Director | 2 d | Prev. |
| ARC1-052 | Faro/Lago | Producir blockout, cámaras, navegación y landmarks | Arquitectura | 3 d | Prev. |
| ARC1-053 | Faro/Lago | Integrar capacitor/tiempo, diagnóstico, fallas y Bitácora | Director | 3 d | Prev. |
| ARC1-054 | Faro/Lago | Producir assets, materiales, agua/luz, VFX y audio | Director* | 4 d | Prev. |
| ARC1-055 | Faro/Lago | QA, rendimiento, accesibilidad, V3 y aceptación humana | Evaluador | 2 d | Prev. |
| ARC1-056 | Cierre | Implementar noche de Ohmdal, epílogo y arcos de personajes | Director | 3 d | Prev. |
| ARC1-057 | Cierre | Integrar campaña, save/migraciones, backtracking y continuidad | Director | 3 d | Prev. |
| ARC1-058 | Cierre | Completar guía docente y enlaces opcionales de La Escuela | Director | 2 d | Prev. |
| ARC1-059 | Release | Auditoría curricular V4, seguridad, privacidad y legal | Director | 2 d | Prev. |
| ARC1-060 | Release | QA completo PWA/navegadores/Android/accesibilidad/performance | Evaluador | 3 d | Prev. |
| ARC1-061 | Release | Corrección final limitada a blockers de release | Owner indicado | 2–4 d | Prev. |
| ARC1-062 | Release | Aceptación humana, tag de release y postmortem de La Luz | Director | 1 d | Prev. |

\* El Director es accountable de estas Stories multidisciplinares y crea paquetes internos
ordenados con un único rol/ownership cada vez. Si requieren globs solapados, el ticket queda
`BLOCKED` hasta redefinir ownership. La aprobación humana es un gate, no un segundo owner.

## Criterios específicos por clase

- **Escena/guion:** competencia V2, objetivo, entrada/salida, agencia local, duración y estados.
- **Arquitectura:** metros, maniquí 1,72 m, ruta, cámaras, oclusión, colisión y presupuesto.
- **Personaje/asset:** manifest, origen/derechos, silueta, pivote, frente, estados y descarte.
- **Sistema educativo:** modelo puro, topologías/valores, errores, tests y transferencia.
- **Visual:** golden frame, desktop/mobile, causalidad, 4/5 en cinco gates y 3/5 mobile.
- **Release:** mismo contenido en todos los tiers; mediciones reales; ningún `not-run` crítico.

## Estado inicial

- `ARC1-001`: `HUMAN REVIEW`.
- `ARC1-002`–`ARC1-062`: `BLOCKED` por dependencia.
- Ningún ticket está `IN PROGRESS`.
- `executionAuthorized=false`: este backlog organiza; no inicia H3.
