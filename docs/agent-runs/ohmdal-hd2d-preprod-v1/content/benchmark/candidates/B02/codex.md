## Metadatos de ejecución

- `taskId: B02`
- Commit congelado consultado: `9b1c6d6a51b9db3e32d6f5101e7fcd5a7a435ba0`.
- Rol: proponente read-only.
- Alcance: dos fichas candidatas V1; circuito e instrumento enteramente virtuales.
- Supuesto topológico común: `V+ → R1 100 Ω → N1 → R2 150 Ω → N2 → retorno seleccionable → REF`, con fuente virtual DC de `5,00 V`.
- La fuente mantiene `5,00 V` en los dos estados solicitados porque su límite de corriente, no cuantificado por las fuentes, es mayor que los `20,00 mA` nominales. No se extrapola su respuesta cuando el límite actúa.
- Las lecturas usan componentes ideales, conductores y retorno cerrado de `0 Ω`, impedancia de medición de tensión infinita, ausencia de fugas y temperatura constante.
- No se editaron archivos ni se ejecutaron tests, builds, simuladores o servicios.

## Ficha H1.2 de 30 campos

1. **Identificador y versión.** `H1.2-circuito-completo-continuidad`, candidata V1 pendiente de auditoría independiente.

2. **Nombre técnico.** Circuito DC serie completo, retorno abierto y continuidad desenergizada.

3. **Nivel de competencia.** F0 — Cultura de taller, compatible con circuito simple, medición, representación y documentación; no equivale a un año o acreditación escolar.

4. **Fuente curricular y bibliografía técnica.** Biblia educativa local, vertical slice, backlog H1 y ficha H1.1 congelada. Los valores y abstracciones adicionales se identifican como decisiones candidatas.

5. **Revisor/a y fecha.** Proponente B02, 2026-08-02. Revisión independiente posterior: pendiente.

6. **Prerequisitos.** Reconocer fuente, resistor, nodo, retorno y referencia; leer V, mA y Ω; distinguir inspección, hipótesis, medición e intervención.

7. **Objetivo observable.** El jugador predice y verifica si existe una trayectoria completa, diferencia una comprobación de continuidad desenergizada del comportamiento energizado bajo carga y explica la falla mediante valores asociados a nodos concretos.

8. **Modelo técnico.** Fuente virtual `Vs = 5,00 V DC`; `R1 = 100 Ω` entre `V+` y `N1`; `R2 = 150 Ω` entre `N1` y `N2`; retorno ideal seleccionable entre `N2` y `REF`. Cerrado, la red serie tiene `Req = 250 Ω`; abierto, `Req = ∞` para la trayectoria `V+–REF`.

9. **Variables y unidades.** `Vs` y tensiones nodales en V; corriente serie `I` en A o mA; resistencias en Ω; potencia en W; retorno `K ∈ {CERRADO, ABIERTO}`; alimentación `P ∈ {DESENERGIZADA_AISLADA, ENERGIZADA_LIMITADA}`.

10. **Supuestos y límites.** Resistores, cables, retorno cerrado y fuente son ideales en los estados pedidos. La fuente queda desconectada del puerto externo durante continuidad/resistencia. No se modelan tolerancias, temperatura, ruido, transitorios, fugas, capacitancias parásitas ni actuación del límite de corriente.

11. **Riesgos de seguridad.** El circuito no representa red, baterías de alta energía ni equipos reales. La continuidad virtual nunca se ejecuta energizada; ninguna acción del juego constituye una instrucción para usar instrumental físico.

12. **Fenómeno inicial.** Con los mismos dos resistores, el indicador bajo carga responde cuando el retorno está cerrado y deja de hacerlo cuando el retorno se abre, aunque algunos nodos continúan mostrando `5,00 V` respecto de `REF`.

13. **Pregunta de investigación.** ¿Qué combinación de continuidad desenergizada y tensiones energizadas permite distinguir una trayectoria completa de un retorno abierto?

14. **Hipótesis esperables.** El retorno abierto impide corriente; una lectura de `5,00 V` en `N2` no demuestra funcionamiento; una continuidad cerrada no demuestra por sí sola el comportamiento bajo carga; los resistores pueden conservar sus valores aunque el circuito completo esté abierto.

15. **Instrumentos disponibles.** Esquema con nodos nombrados, selector virtual del retorno, visualización de estado de alimentación, medidor virtual de tensión DC, resistencia y continuidad, y Bitácora estructurada.

16. **Interacciones permitidas.** Desenergizar y aislar; inspeccionar; formular hipótesis; configurar una medición; medir continuidad o resistencia sólo desenergizado; energizar con topología bloqueada; medir tensión; volver a desenergizar; seleccionar el estado del retorno; documentar.

17. **Consecuencias físicas simuladas.** Retorno cerrado: `I = 20,00 mA`, `V(N1)=3,00 V` y `V(N2)=0,00 V`. Retorno abierto: `I=0`, no hay caídas en `R1` o `R2`, y `V+`, `N1` y `N2` quedan a `5,00 V` respecto de `REF`.

18. **Errores productivos.** Inferir corriente sólo porque un nodo tiene tensión; llamar “continuidad” a una medición energizada; interpretar retorno abierto como resistor defectuoso; afirmar que continuidad garantiza funcionamiento bajo carga; intervenir sin desenergizar.

19. **Pistas basadas en evidencia.** Comparar `V(N1)-V(REF)` y `V(N2)-V(REF)`; observar que una caída sólo aparece con corriente; contrastar `N2–REF` desenergizado; pedir que cada conclusión cite estado, nodos, magnitud y unidad.

20. **Criterios de dominio.** Calcula `Req` e `I`; predice los cuatro potenciales nodales en ambos estados; distingue continuidad de funcionamiento bajo carga; identifica el retorno abierto sin sustitución ciega; interviene únicamente desenergizado.

21. **Transferencia.** Reconocer el mismo principio con otra disposición gráfica y otro orden válido de mediciones, sin introducir nuevas fuentes, componentes o prácticas reales.

22. **Metáfora diegética.** La ruta luminosa de Lumen puede representar una trayectoria cuyo regreso debe estar completo para sostener una respuesta.

23. **Límite explícito de la metáfora.** La luz no es carga eléctrica, la carga no se consume en los resistores y una ruta visual encendida no prueba seguridad ni reproduce un circuito físico.

24. **Vocabulario local y formal.** Local: ruta, regreso, marca, piedra, registro. Formal: trayectoria cerrada, retorno, circuito abierto, nodo, referencia, corriente, caída de tensión, resistencia equivalente y continuidad.

25. **Entrada de Bitácora inicial.** “El brillo desapareció, pero eso no identifica la pieza. Voy a aislar la fuente virtual, comprobar qué trayecto está abierto y después comparar tensiones bajo carga.”

26. **Entrada de Bitácora revisada.** “Con retorno cerrado medí `20,00 mA` calculados y `N1=3,00 V`, `N2=0,00 V` respecto de `REF`. Con retorno abierto no circuló corriente y `N2` quedó a `5,00 V`: había tensión respecto de la referencia, pero no funcionamiento bajo carga.”

27. **Accesibilidad y representación alternativa.** Nodos, retorno y alimentación tienen etiquetas textuales; apertura/cierre no depende de color; corriente y tensiones se ofrecen como tabla y descripción; navegación completa por teclado y táctil; orden de foco estable.

28. **Telemetría pedagógica permitida.** Local y opt-in: hipótesis codificada, orden de magnitudes consultadas, estado del retorno, predicciones, estados de error y completitud del registro. Se excluyen texto libre, nombres e identificadores escolares.

29. **Prueba determinista del modelo.** Reproducir ambos estados con las ecuaciones `I=Vs/(R1+R2)`, `V(N1)=Vs-I·R1` y `V(N2)=V(N1)-I·R2` cuando el retorno está cerrado; imponer `I=0` cuando está abierto; verificar topología, nodos y bloqueo de intervención energizada.

30. **Estado de validación.** Candidata V1 técnica-documental; no implementada, no auditada independientemente, no V2 y no `CANON-EDU`.

## Ficha H1.3 de 30 campos

1. **Identificador y versión.** `H1.3-instrumento-virtual-ohm`, candidata V1 pendiente de auditoría independiente.

2. **Nombre técnico.** Selección de magnitud, referencia, puntas, rango y estado seguro en el instrumento virtual de Ohm.

3. **Nivel de competencia.** F0 — Cultura de taller, compatible con magnitudes e instrumentación básica; no equivale a práctica certificada con multímetro.

4. **Fuente curricular y bibliografía técnica.** Biblia educativa local, contrato del vertical slice, backlog H1 y ficha H1.1 congelada. Los rangos y resoluciones son decisiones candidatas del simulador.

5. **Revisor/a y fecha.** Proponente B02, 2026-08-02. Revisión independiente posterior: pendiente.

6. **Prerequisitos.** Identificar nodos y referencia; distinguir V, Ω y continuidad; reconocer estado energizado/desenergizado; interpretar signo y comparación inclusiva.

7. **Objetivo observable.** El jugador configura magnitud, dos puntas, referencia y rango; interpreta signo, límite, error de visualización y estados inválidos; y usa la lectura como evidencia sin habilitar una intervención energizada.

8. **Modelo técnico.** Instrumento exclusivamente virtual con modos `V_DC`, `R` y `CONTINUIDAD`. En `V_DC`, devuelve `V(puntaA)-V(puntaB)`. En `R` y continuidad, consulta la red pasiva con la fuente virtual aislada y exige estado desenergizado.

9. **Variables y unidades.** Valor ideal `x`, valor mostrado `x_d`, error `e=x_d-x`, resolución `q`; rangos de tensión `±0,50 V`, `±5,00 V`, `±20,00 V`; resistencia `0–200 Ω` y `0–2000 Ω`; continuidad candidata `0–300 Ω`, todos con límite inclusivo.

10. **Supuestos y límites.** El solver es ideal y no agrega error aleatorio. Se propone `qV=0,01 V` y `qR=1 Ω`; el redondeo al valor más cercano cumple `|e|≤q/2`. Los valores del circuito coinciden exactamente con esas resoluciones.

11. **Riesgos de seguridad.** La interfaz no imita puertos, categorías, fusibles ni procedimientos de un multímetro real. Resistencia y continuidad energizadas se bloquean. La experiencia no se transfiere a red, baterías de alta energía o equipos físicos.

12. **Fenómeno inicial.** La misma topología puede producir una lectura válida, negativa, fuera de rango o inválida según magnitud, referencia, puntas, rango y alimentación seleccionados.

13. **Pregunta de investigación.** ¿Qué configuración convierte una consulta al modelo en evidencia interpretable y qué errores impiden extraer una conclusión?

14. **Hipótesis esperables.** Invertir puntas cambia el signo de tensión; ampliar el rango resuelve un desborde sin cambiar el circuito; un rango insuficiente no equivale a cero; resistencia y continuidad requieren aislamiento; varios órdenes de configuración pueden ser correctos.

15. **Instrumentos disponibles.** Panel virtual de magnitud, selector de punta A, selector de punta B/referencia, rango, estado de alimentación, lectura con signo y unidad, historial estructurado y esquema de nodos.

16. **Interacciones permitidas.** Seleccionar magnitud, puntas y rango en cualquier orden; inspeccionar y registrar hipótesis antes de solicitar lectura; medir `V_DC` con el circuito energizado y bloqueado; medir `R` o continuidad desenergizado y aislado; salir, desenergizar y recién entonces intervenir.

17. **Consecuencias físicas simuladas.** `V_DC` conserva polaridad algebraica; `R` ignora polaridad; continuidad devuelve `TRAYECTORIA_CERRADA` si `R≤300 Ω` y `TRAYECTORIA_ABIERTA` para apertura ideal. El umbral es una regla didáctica del simulador, no una norma de instrumentos reales.

18. **Errores productivos.** Magnitud ausente o incompatible; punta o referencia indefinida; nodo inexistente; rango insuficiente; confundir signo negativo con falla; usar `FUERA_DE_RANGO` como cero; medir modo pasivo energizado; intentar intervenir tras medir tensión sin desenergizar.

19. **Pistas basadas en evidencia.** Mostrar la expresión `puntaA − puntaB`; nombrar el campo ausente; conservar la lectura esperada fuera de la interfaz de respuesta; explicar que el límite se incluye; contrastar estado de energía y magnitud sin revelar la hipótesis correcta.

20. **Criterios de dominio.** Obtiene y documenta lecturas válidas en ambos sentidos; selecciona el menor rango que contiene el valor; reconoce límite inclusivo, error de cuantización y apertura; diferencia configuración inválida de resultado físico; desenergiza antes de intervenir.

21. **Transferencia.** Resolver la Puerta con una secuencia distinta pero válida —por ejemplo continuidad antes de tensiones o tensiones nodales antes de caída por componente— manteniendo los mismos requisitos de configuración y seguridad.

22. **Metáfora diegética.** Ohm orienta dos marcas de observación y traduce la diferencia entre ellas a un registro legible.

23. **Límite explícito de la metáfora.** Ohm no “siente” electricidad ni sustituye un instrumento real; su respuesta procede de un solver determinista y sólo describe nodos virtuales.

24. **Vocabulario local y formal.** Local: marcas, orientación, alcance, ruta cerrada, registro. Formal: magnitud, punta A, referencia/punta B, polaridad, rango, resolución, error de cuantización, límite inclusivo y estado inválido.

25. **Entrada de Bitácora inicial.** “Antes de pedir un número debo decir qué magnitud busco, entre qué puntos, con qué orientación y qué rango puede contenerla.”

26. **Entrada de Bitácora revisada.** “Medí `N1` respecto de `REF` en tensión DC y rango `±5,00 V`: `+3,00 V`. Al invertir las puntas obtuve `−3,00 V`; cambió la orientación de la comparación, no el circuito.”

27. **Accesibilidad y representación alternativa.** Cada selector tiene nombre y valor textual; signo y unidad se anuncian juntos; los errores no dependen de color o sonido; el orden de configuración es flexible; existe resumen antes de medir y foco recuperable tras el resultado.

28. **Telemetría pedagógica permitida.** Local y opt-in: magnitud, nodos, rango, código de resultado, número de reconfiguraciones, orden de mediciones y retorno seguro a desenergizado. No se registra texto libre ni identidad.

29. **Prueba determinista del modelo.** Validar función algebraica de tensión, simetría de resistencia, clasificación de continuidad, redondeo, límites inclusivos, rangos insuficientes, configuración incompleta, modos incompatibles con energía y transiciones de la máquina de estados.

30. **Estado de validación.** Candidata V1 técnica-documental; el instrumento y sus rangos no están implementados ni auditados, no son V2 ni `CANON-EDU`.

## Tabla de valores ideales

Convención: todos los potenciales se expresan respecto de `REF=0,00 V`; corriente positiva desde `V+` hacia `REF`. Para continuidad/resistencia, la fuente queda aislada y la red no está energizada.

| Magnitud ideal | Retorno sano | Retorno abierto |
|---|---:|---:|
| Resistencia de la trayectoria externa `V+–REF` | `250 Ω` | `∞` |
| Corriente serie `I` | `20,00 mA` | `0,00 mA` |
| `V(V+)` | `5,00 V` | `5,00 V` |
| `V(N1)` | `3,00 V` | `5,00 V` |
| `V(N2)` | `0,00 V` | `5,00 V` |
| `V(REF)` | `0,00 V` | `0,00 V` |
| Caída `V+−N1` en `R1` | `2,00 V` | `0,00 V` |
| Caída `N1−N2` en `R2` | `3,00 V` | `0,00 V` |
| Caída `N2−REF` en el retorno | `0,00 V` | `5,00 V` |
| Potencia en `R1` | `0,040 W` | `0 W` |
| Potencia en `R2` | `0,060 W` | `0 W` |
| Resistencia aislada `V+–N1` | `100 Ω` | `100 Ω` |
| Resistencia aislada `N1–N2` | `150 Ω` | `150 Ω` |
| Resistencia aislada `N2–REF` | `0 Ω` | `∞` |
| Continuidad virtual `V+–REF`, umbral inclusivo `300 Ω` | `TRAYECTORIA_CERRADA` | `TRAYECTORIA_ABIERTA` |

Cálculo sano: `Req=100 Ω+150 Ω=250 Ω`; `I=5,00 V/250 Ω=0,020 A`; `VR1=0,020 A·100 Ω=2,00 V`; `VR2=0,020 A·150 Ω=3,00 V`.

Cálculo abierto: `Req=∞`, por lo que `I=0`; sin corriente, las caídas en ambos resistores son cero y `N1=N2=V+=5,00 V`. Los `5,00 V` entre `N2` y `REF` quedan aplicados sobre la apertura.

No puede inferirse de estos valores la respuesta de la fuente cuando actúa su límite, la seguridad de un sistema físico, tolerancias reales, corriente disponible, comportamiento transitorio, aislamiento efectivo, estado de componentes reales ni equivalencia entre continuidad y funcionamiento bajo carga.

## Tests deterministas

| ID | Clase | Precondición y acción | Resultado esperado |
|---|---|---|---|
| T01 | Topología | Fuente aislada, retorno cerrado; resolver camino `V+–REF` | Camino único `R1→R2→retorno`; `Req=250 Ω` |
| T02 | Topología | Fuente aislada, retorno abierto; resolver camino `V+–REF` | Sin camino cerrado; `Req=∞` |
| T03 | Topología | En ambos retornos, consultar `V+–N1` y `N1–N2` | `100 Ω` y `150 Ω`; la falla no altera los resistores |
| T04 | Tensión | Energizado, retorno cerrado | `I=20,00 mA`; nodos `[5,00;3,00;0,00;0,00] V` |
| T05 | Tensión | Energizado, retorno abierto | `I=0`; nodos `[5,00;5,00;5,00;0,00] V` |
| T06 | Tensión | Retorno sano, puntas `N1/REF`, rango `±5,00 V` | `+3,00 V`, `VALIDA` |
| T07 | Polaridad | Igual a T06, puntas `REF/N1` | `−3,00 V`, `VALIDA` |
| T08 | Límite inclusivo | Retorno abierto, puntas `N2/REF`, rango `±5,00 V` | `+5,00 V`, `EN_LIMITE_DE_RANGO` |
| T09 | Fuera de rango | Igual a T08, rango `±0,50 V` | `FUERA_DE_RANGO`; no devuelve `0,00 V` |
| T10 | Mismo nodo | Energizado, puntas `N1/N1`, rango `±0,50 V` | `0,00 V`, `VALIDA` |
| T11 | Resistencia inclusiva | Red pasiva de prueba `200 Ω`, rango `0–200 Ω` | `200 Ω`, `EN_LIMITE_DE_RANGO` |
| T12 | Resistencia insuficiente | Retorno sano, `V+–REF`, rango `0–200 Ω` | `FUERA_DE_RANGO`; no se clasifica como apertura |
| T13 | Resistencia válida | Igual a T12, rango `0–2000 Ω` | `250 Ω`, `VALIDA` |
| T14 | Continuidad sana | Desenergizado y aislado, `V+–REF`, `0–300 Ω` | `TRAYECTORIA_CERRADA`, valor asociado `250 Ω` |
| T15 | Continuidad abierta | Desenergizado y aislado, retorno abierto, `V+–REF` | `TRAYECTORIA_ABIERTA`; resistencia ideal `∞` |
| T16 | Magnitud insegura | Energizado, solicitar `R` o `CONTINUIDAD` | `MAGNITUD_INCOMPATIBLE_CON_ESTADO`; sin lectura |
| T17 | Tensión sin energía | Desenergizado, solicitar `V_DC` de funcionamiento | `ESTADO_NO_MEDIBLE`; no se informa cero |
| T18 | Configuración incompleta | Falta magnitud, punta, referencia o rango | `CONFIGURACION_INCOMPLETA`; sin lectura |
| T19 | Nodo inválido | Una punta referencia un nodo fuera del esquema | `PUNTO_NO_DEFINIDO`; sin lectura |
| T20 | Orden válido A | Desenergizar → inspeccionar → hipótesis → continuidad → energizar → tensión → desenergizar → intervenir | Secuencia aceptada; intervención habilitada sólo al final |
| T21 | Orden válido B | Desenergizar → configurar tensión → inspeccionar → hipótesis → energizar → medir → desenergizar → continuidad → intervenir | Secuencia aceptada; mismo diagnóstico posible |
| T22 | Intervención energizada | Desde `ENERGIZADO_BLOQUEADO` o `MEDICION_TENSION_PROTEGIDA`, cambiar retorno | `INTERVENCION_BLOQUEADA`; hash topológico sin cambios |
| T23 | Intervención durante modo pasivo | Desde `MEDICION_PASIVA_PROTEGIDA`, cambiar retorno | `INTERVENCION_BLOQUEADA`; primero debe cerrarse la medición |
| T24 | Intervención segura del modelo | Volver a `DESENERGIZADO_AISLADO`, cerrar medición y seleccionar retorno | Cambio permitido en el simulador; no implica seguridad física real |
| T25 | Registro | Guardar magnitud, puntas, referencia, rango, estado, valor, unidad e hipótesis | Registro aceptado; ausencia de cualquier campo produce `REGISTRO_INCOMPLETO` |
| T26 | No transferencia | Seleccionar red, AC, batería de alta energía, instrumento o equipo real | `FUERA_DE_ALCANCE`; sin procedimiento operativo |

## Fuentes y trazabilidad

| Fuente | Uso trazable |
|---|---|
| [`AGENTS.md`](../../../../../../../AGENTS.md) | Impone preservación de la base estable, límites de seguridad, trazabilidad y prohibición de ampliar alcance. |
| [`B02.md`](../../prompts/B02.md) | Fija topología, valores, nodos, dos fichas de 30 campos, cálculos, estados inválidos, tests y exclusiones. |
| [`B01/codex.md`](../B01/codex.md) | Aporta como insumo congelado la secuencia segura, los rangos virtuales candidatos, la polaridad, el límite inclusivo y la no transferencia. |
| [`02_EDUCATIONAL_CONTENT_BIBLE.md`](../../../../../../ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md) | Define los 30 campos, doctrina pedagógica, niveles, Bitácora, telemetría, correspondencia responsable y escala de validación. |
| [`10_VERTICAL_SLICE.md`](../../../../../../ohmdal-biblia/10_VERTICAL_SLICE.md) | Exige inspección, hipótesis, magnitud, referencia, puntos, rango recuperable, intervención, verificación, documentación y varios órdenes de diagnóstico. |
| [`11_PRODUCTION_BACKLOG.md`](../../../../../../ohmdal-biblia/11_PRODUCTION_BACKLOG.md) | Delimita H1.2 y H1.3, reserva H1.4 para el diagnóstico completo y mantiene H3 bloqueado. |

## Alertas V2

- El valor exacto del límite de corriente de la fuente no está definido. La propuesta sólo prueba los estados sano y abierto, donde basta declarar `I_lim > 20,00 mA`; cualquier corto o sobrecarga exige una especificación nueva.
- El aislamiento de la fuente durante resistencia/continuidad, los rangos, las resoluciones y el umbral inclusivo virtual de `300 Ω` son decisiones candidatas, no propiedades de instrumental real ni contenido canónico.
- Debe comprobarse que mostrar `N2=5,00 V` con retorno abierto no refuerce la idea errónea de que presencia de tensión implica circulación de corriente o funcionamiento.
- La interfaz futura debe distinguir claramente `FUERA_DE_RANGO`, `TRAYECTORIA_ABIERTA`, `CONFIGURACION_INCOMPLETA` y `ESTADO_NO_MEDIBLE`.
- Una auditoría independiente deberá reproducir cálculos, signos, redondeo, topología y transiciones antes de cualquier promoción de estado.

## Autoauditoría e integración

- Se entregan dos fichas numeradas del 1 al 30, exactamente 30 campos cada una.
- Ambas permanecen como candidatas V1; no se las marca V2 ni `CANON-EDU`.
- Se declararon topología, supuestos, unidades, valores ideales, polaridad, error de cuantización, límites inclusivos y aquello que no puede inferirse.
- Los tests cubren topología, tensiones, resistencia, continuidad, rangos y máquina de estados, incluidos dos órdenes válidos.
- Toda intervención queda condicionada a `DESENERGIZADO_AISLADO` y fuera de un estado activo de medición.
- No se proponen cambios de código, H3, assets, dependencias, servicios ni prácticas con equipos reales.
- Integración futura estimada: 45–60 minutos para traducir las dos fichas a datos y funciones puras, más 30–45 minutos para reproducción independiente. Son estimaciones, no trabajo ejecutado.
