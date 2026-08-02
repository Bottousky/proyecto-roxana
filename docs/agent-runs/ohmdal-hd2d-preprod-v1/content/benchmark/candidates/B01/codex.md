## Metadatos de ejecución

- `taskId: B01`
- Supuestos: propuesta candidata V1, no implementada ni auditada independientemente; circuito enteramente simulado, DC aislado de 5 V y limitado por diseño; sin transferencia a equipos, instalaciones o fuentes reales.
- Archivos consultados:
  - `AGENTS.md`
  - `docs/agent-runs/ohmdal-hd2d-preprod-v1/content/benchmark/prompts/B01.md`
  - `docs/agent-runs/ohmdal-hd2d-preprod-v1/brief.md`
  - `docs/agent-runs/ohmdal-hd2d-preprod-v1/tasks.json`
  - `docs/ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md`
  - `docs/ohmdal-biblia/10_VERTICAL_SLICE.md`
  - `docs/ohmdal-biblia/11_PRODUCTION_BACKLOG.md`
- No se editaron archivos ni se ejecutaron tests, builds o generación de assets.

## Ficha de 30 campos

1. **Identificador y versión.** `H1.1-seguridad-baja-tension-ficticia-lumen`, candidata V1 pendiente de auditoría independiente.

2. **Nombre técnico.** Seguridad operativa y secuencia de diagnóstico en un circuito DC aislado y simulado de 5 V.

3. **Nivel de competencia.** F0 — Cultura de taller; compatible con contenidos de seguridad, medición, montaje y documentación citados para Taller de 1.º a 3.º, sin equivalencia escolar.

4. **Fuente curricular y bibliografía técnica.** Biblia educativa local, correspondencias institucionales enlazadas allí, brief del hito y contrato del vertical slice. La ficha no usa estas fuentes para afirmar procedimientos aplicables fuera del simulador.

5. **Revisor/a y fecha.** Proponente B01, 2026-08-02. Revisión independiente V2: pendiente.

6. **Prerequisitos.** Reconocer que el sistema es ficticio y simulado; distinguir fuente, retorno/referencia, punto de prueba e indicador; leer unidades de tensión en voltios.

7. **Objetivo observable.** Antes de registrar una lectura, el jugador desenergiza el modelo, inspecciona conexiones y señales, declara magnitud, referencia y rango, realiza una medición simulada sin modificar el circuito, y documenta evidencia, hipótesis y resultado.

8. **Modelo técnico.** Fuente virtual nominal de 5,00 V DC, aislada y limitada por diseño, con nodos virtuales `V+` y `REF`. El simulador sólo permite cambiar conexiones o componentes bajo estado desenergizado. La lectura de tensión se ejecuta en modo de medición protegido: el modelo queda bloqueado para intervención y devuelve una lectura determinista entre dos nodos virtuales.

9. **Variables y unidades.** Tensión simulada `Vmed` en V; tensión nominal `Vnom = 5,00 V`; rango seleccionado `R` en V; referencia `REF`; polaridad de puntas; estado de alimentación `S ∈ {DESENERGIZADO, MEDICION_PROTEGIDA}`; estado de inspección `I ∈ {PENDIENTE, COMPLETA}`; registro `D ∈ {AUSENTE, COMPLETO}`.

10. **Supuestos y límites.** Todo valor representa el modelo interno, no una medición física. Sólo se modela DC virtual de 5 V y puntos de prueba definidos por la escena. No modela red domiciliaria, tensión alterna, baterías de alta energía, corriente de falla, apertura de equipos, reparación de dispositivos reales ni seguridad de personas.

11. **Riesgos de seguridad.** El riesgo pedagógico principal es convertir una secuencia segura ficticia en receta para intervenir equipos reales. Se mitiga con etiquetas persistentes de “simulación aislada de 5 V”, bloqueo de modificaciones durante medición y prohibición explícita de transferir el procedimiento a sistemas reales. Nunca se recompensa intervenir conexiones en estado de medición protegida.

12. **Fenómeno inicial.** Lumen posee un circuito aparentemente detenido y un procedimiento heredado basado en sustituir piezas. Se observan un indicador apagado, conexiones visibles y un esquema incompleto; no se presenta una pieza como culpable antes de inspeccionar.

13. **Pregunta de investigación.** ¿Qué evidencia debe registrarse antes de intervenir el modelo, y qué lectura simulada permite contrastar una hipótesis sobre el tramo señalado?

14. **Hipótesis esperables.** Existe una interrupción o conexión incompatible; la referencia elegida puede impedir interpretar una tensión; un rango insuficiente no prueba ausencia de tensión; reemplazar una pieza sin evidencia no identifica la causa.

15. **Instrumentos disponibles.** Esquema diegético, inspección visual de nodos y conectores, bitácora, y medidor virtual con selección de tensión DC, referencia, polaridad y rangos `±0,50 V`, `±5,00 V` y `±20,00 V`.

16. **Interacciones permitidas.** Desenergizar; inspeccionar; registrar hipótesis; seleccionar tensión DC, referencia, polaridad y rango; solicitar una lectura simulada; documentar resultado; modificar o sustituir elementos sólo después de volver a `DESENERGIZADO`.

17. **Consecuencias físicas simuladas.** Una medición válida devuelve el valor algebraico determinista entre los dos nodos seleccionados. Rango insuficiente devuelve `FUERA_DE_RANGO`; referencia inválida devuelve `REFERENCIA_NO_DEFINIDA`; cualquier intento de modificar el modelo durante medición protegida se bloquea sin alterar la topología.

18. **Errores productivos.** Elegir el rango `±0,50 V` ante 5,00 V; invertir puntas y obtener polaridad negativa; elegir un nodo sin referencia; intentar sustituir una pieza antes de inspeccionar; documentar “funciona/no funciona” sin punto, referencia, rango ni unidad.

19. **Pistas basadas en evidencia.** El esquema resalta que una tensión siempre compara dos nodos; el historial muestra si falta referencia, rango o inspección; el medidor explica `FUERA_DE_RANGO` como incapacidad del rango elegido, no como tensión nula; Lumen puede señalar una observación física, nunca la solución.

20. **Criterios de dominio.** Completa la secuencia `DESENERGIZAR → INSPECCIONAR → HIPÓTESIS → CONFIGURAR_MEDICIÓN → MEDIR → DESENERGIZAR → DOCUMENTAR`; selecciona referencia y un rango admisible; interpreta signo y estado de rango; justifica la siguiente acción con evidencia, no por sustitución ciega.

21. **Transferencia.** En la Puerta de Ohm, el jugador debe aplicar el mismo orden de aislar, inspeccionar, elegir referencia/rango, medir, verificar y documentar en otra disposición visual. La transferencia conserva el modelo ficticio de baja tensión y no añade prácticas de instalaciones reales.

22. **Metáfora diegética.** Las trazas de cobre y luces de Lumen son “rutas de señal”: antes de restaurar una ruta, el taller pide conocer desde dónde se observa y qué cambió.

23. **Límite explícito de la metáfora.** Las rutas luminosas no son electricidad real ni la luz prueba seguridad. La metáfora sirve para localizar evidencia; la interpretación válida procede de nodos, referencia, rango, unidad y registro del simulador.

24. **Vocabulario local y formal.** Local: ruta, retorno, marca de lectura, piedra/carcasa, registro de taller. Formal: tensión DC, voltio (V), referencia, polaridad, nodo, punto de prueba, rango, desenergizado, inspección y documentación.

25. **Entrada de Bitácora inicial.** “Lumen conoce piezas que antes encendían la luz, pero aún no sé qué tramo cambió. Antes de mover algo, voy a dejar el modelo sin energía, mirar sus uniones y anotar desde qué punto compararé la lectura.”

26. **Entrada de Bitácora revisada.** “En esta simulación aislada de 5 V medí `V+` respecto de `REF` con tensión DC y rango `±5,00 V`: `+5,00 V`. La lectura sólo vale para esos nodos, esa referencia y ese rango. No cambié conexiones durante la medición; después desenergicé el modelo y dejé registrado qué evidencia apoya mi hipótesis.”

27. **Accesibilidad y representación alternativa.** Cada estado usa texto además de color o brillo; los nodos tienen nombre, posición en esquema y descripción accesible; la lectura se expresa con signo, unidad y estado verbal; la secuencia puede completarse por teclado o táctil; el historial permite revisar evidencia sin depender de memoria visual.

28. **Telemetría pedagógica permitida.** Local y opt-in: secuencia de estados, magnitud/rango/referencia elegidos, estado de lectura, revisión de hipótesis y completitud estructurada de la Bitácora. Se excluyen nombres, texto libre, identificadores escolares y envío por defecto.

29. **Prueba determinista del modelo.** Ejecutar casos de estado y de lectura con topología virtual fija `V(V+) - V(REF) = +5,00 V`; verificar bloqueos, polaridad, rangos, transición obligatoria a desenergizado y registro estructurado.

30. **Estado de validación.** V1 candidata técnica-documental. No es `CANON-EDU`, no es V2 y requiere reproducción independiente de fuentes, estados y tests.

## Invariantes y estados inválidos

| Invariante | Estado inválido | Resultado obligatorio |
|---|---|---|
| La topología sólo puede cambiar desenergizada | Intentar conectar, desconectar, sustituir o reajustar en `MEDICION_PROTEGIDA` | Bloqueo; topología y registro previos permanecen intactos |
| La inspección precede a la medición | Solicitar medición con `I = PENDIENTE` | `INSPECCION_REQUERIDA` |
| La medición exige magnitud DC, referencia y dos nodos definidos | Falta magnitud, `REF`, nodo o polaridad | `CONFIGURACION_INCOMPLETA` o `REFERENCIA_NO_DEFINIDA` |
| El rango debe contener el valor absoluto de la lectura | `|Vmed| > R` | `FUERA_DE_RANGO`, sin inferir cero ni falla de circuito |
| El límite del rango es inclusivo | `|Vmed| = R` | Lectura válida con marca `EN_LIMITE_DE_RANGO` |
| La medición no autoriza intervención | Pretender usar una lectura para habilitar modificación inmediata | Retorno obligatorio a `DESENERGIZADO` |
| La evidencia debe ser trazable | Documentar sin nodos, referencia, rango, unidad o resultado | `REGISTRO_INCOMPLETO` |
| El alcance es sólo ficticio | Seleccionar red, AC, batería de alta energía, equipo real o procedimiento físico | `FUERA_DE_ALCANCE` y texto de no transferencia |

## Tests deterministas propuestos

| Caso | Entrada | Resultado esperado |
|---|---|---|
| T01 — secuencia válida | `DESENERGIZADO`, inspección completa, tensión DC, puntas `V+`/`REF`, rango `±5,00 V` | Lectura `+5,00 V`, estado `EN_LIMITE_DE_RANGO`; se bloquean modificaciones hasta desenergizar |
| T02 — rango superior | Igual a T01, rango `±20,00 V` | Lectura `+5,00 V`, estado `VALIDA` |
| T03 — límite inferior | Igual a T01, rango `±0,50 V` | `FUERA_DE_RANGO`; nunca `0,00 V` |
| T04 — polaridad invertida | Igual a T01, puntas `REF`/`V+`, rango `±5,00 V` | Lectura `-5,00 V`, estado `EN_LIMITE_DE_RANGO` |
| T05 — mismo nodo | `REF` respecto de `REF`, rango `±0,50 V` | Lectura `0,00 V`, estado `VALIDA` |
| T06 — falta referencia | Inspección completa, punto `V+`, referencia ausente | `REFERENCIA_NO_DEFINIDA`; no se genera lectura |
| T07 — falta inspección | `DESENERGIZADO`, `I = PENDIENTE`, configuración completa | `INSPECCION_REQUERIDA`; no se genera lectura |
| T08 — modificación protegida | Tras una lectura válida, acción `sustituirComponente` sin transición de salida | `MODIFICACION_BLOQUEADA`; hash de topología sin cambios |
| T09 — salida de medición | Tras T01, acción `desenergizar` y luego `sustituirComponente` | Estado `DESENERGIZADO`; la acción queda habilitada por modelo, sin afirmar seguridad física real |
| T10 — documentación mínima | Resultado de T01 con campos `nodoA`, `nodoB`, `REF`, `R`, valor, unidad e hipótesis | Registro aceptado; si falta cualquiera, `REGISTRO_INCOMPLETO` |
| T11 — alcance prohibido | Entrada con fuente `AC`, `red`, `batería_alta_energia` o `equipo_real` | `FUERA_DE_ALCANCE`; sin simulación ni recomendación procedimental |

## Fuentes y trazabilidad

| Fuente identificable | Afirmación que respalda |
|---|---|
| [`docs/agent-runs/ohmdal-hd2d-preprod-v1/content/benchmark/prompts/B01.md`](docs/agent-runs/ohmdal-hd2d-preprod-v1/content/benchmark/prompts/B01.md) | El encargo fija un circuito ficticio, aislado y simulado de 5 V; exige desenergizar, inspeccionar, seleccionar referencia/rango, medir y documentar, sin normalizar trabajo energizado ni transferirlo a sistemas reales. |
| [`docs/ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md`](docs/ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md) | Define los 30 campos canónicos, la doctrina de intervención segura, medición, explicación y documentación; exige `compatible con` y prohíbe afirmar equivalencia escolar; establece V1/V2 y telemetría local, opt-in y sin texto libre. |
| [`docs/ohmdal-biblia/10_VERTICAL_SLICE.md`](docs/ohmdal-biblia/10_VERTICAL_SLICE.md) | Describe el orden del puzzle de Lumen: inspeccionar, formular hipótesis, elegir magnitud/referencia/puntos, medir, intervenir, verificar y documentar; también indica que un rango incorrecto no debe provocar pérdida. |
| [`docs/ohmdal-biblia/11_PRODUCTION_BACKLOG.md`](docs/ohmdal-biblia/11_PRODUCTION_BACKLOG.md) | Define H1.1 como ficha de seguridad de baja tensión ficticia y exige fuentes, límites y prácticas no transferibles a red real. |
| [`docs/agent-runs/ohmdal-hd2d-preprod-v1/brief.md`](docs/agent-runs/ohmdal-hd2d-preprod-v1/brief.md) | Delimita H1 como trabajo documental autorizado, excluye H3 y confirma que el propósito es reducir incertidumbres educativas antes del slice. |
| [`docs/agent-runs/ohmdal-hd2d-preprod-v1/tasks.json`](docs/agent-runs/ohmdal-hd2d-preprod-v1/tasks.json) | Identifica el candidato Codex de seguridad como salida estructurada, read-only, con fuentes y límites trazables. |

## Alertas V2

Un segundo agente puede reproducir la propuesta si usa la topología fija declarada, los rangos virtuales propuestos, los once casos deterministas y las seis fuentes locales listadas.

Debe escalarse una incertidumbre concreta: las fuentes consultadas justifican el alcance pedagógico y la no transferencia, pero no especifican la interfaz definitiva del instrumento virtual, la topología de la falla de Lumen ni una convención previa para rangos discretos. Los rangos `±0,50 V`, `±5,00 V` y `±20,00 V` son decisiones candidatas de este documento, no contenido canónico ni reproducción de un multímetro real. La auditoría V2 debe confirmar que esa abstracción no introduce confusión sobre instrumental físico.

## Autoauditoría e integración

- Alcance: limitado a H1.1 y al modelo didáctico simulado; no propone cambios a `/src/jugar/**`, guardado, H3, Meshy, assets ni dependencias.
- Coherencia: la propuesta mantiene modificación sólo desenergizada y convierte la medición en un estado protegido, evitando que una lectura se represente como autorización para intervenir un circuito energizado.
- Pendiente técnico: definir en H1.2–H1.4 la topología concreta, valores de componentes y la relación entre esta máquina de estados y el diagnóstico de Lumen.
- Estimación de integración: 30–45 minutos para convertir esta ficha en datos/modelo puro y tests deterministas aislados; 30 minutos adicionales para auditoría V2 independiente. Estas son estimaciones, no mediciones.
