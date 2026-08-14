---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 9 — Gramática de puzzles; sección 4 — Microgéneros)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
  - ./bitland-programming-language-gameplay_v1.md
  - ./bitland-automation-system_v1.md
open_questions:
  - BL-PG-Q1 — ¿Una familia combina con otra o son disjuntas? (afecta cómo se mide "combinación de conceptos" como fuente de dificultad)
  - BL-PG-Q2 — ¿Cuántas soluciones distintas debe aceptar un puzzle B12 para considerar que la "optimización" es genuina y no un reto cosmético?
  - BL-PG-Q3 — ¿B7 (Debugging) se califica por familia de bug o por tipo de sistema? (afecta cómo se reusan puzzles B7 en distintos barrios)
  - BL-PG-Q4 — ¿B10 (Sincronización) exige agentes concurrentes (Etapa 6) o se puede vivir con uno solo esperando eventos?
  - BL-PG-Q5 — ¿B11 (Routing) cubre redes de paquetes puras o también flujo de personas (peatones) por motivos narrativos?
---

# BITLAND — PUZZLE GRAMMAR · v1

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Define las
> **12 familias de puzzle** de Bitland (B1–B12), sus variables de
> dificultad, sus criterios de validación y sus condiciones de aparición.
>
> **Cobertura.** Esta v1 cubre las 12 familias. La campaña puede no
> utilizarlas todas; las primeras 8 son la base, las últimas 4 son
> expansión.
>
> **Validación por condiciones, no por solución fija.** Por P07, cada
> familia acepta ≥2 soluciones válidas, salvo que la dimensión del
> problema lo impida materialmente (B7 Debugging incluido: el bug a
> encontrar es único, la *estrategia* de búsqueda no).

---

## 1. Cómo se usa este documento

Cada familia se documenta con:

1. **Concepto.** Qué idea de programación/sistemas se trabaja.
2. **Forma jugable.** Cómo se presenta al jugador.
3. **Condición de éxito.** Lo que el sistema verifica.
4. **Variables de dificultad.** Ejes por los que se sube la dificultad
   (de DL-§4, lenguaje de dificultad).
5. **Combinaciones naturales.** Con qué otras familias se combina
   cuando aparece en arco avanzado.
6. **Errores de diseño prohibidos.** Lo que un puzzle de esta familia
   no debe hacer.
7. **Ejemplo ilustrativo.** NO definitivo. Sirve para fijar la forma.

Las familias no se numeran en orden de aparición. B1 es la más
introductoria; B12 es la más exigente. Una campaña puede saltarse una
familia entera si la curva lo justifica, pero debe declararlo.

---

## 2. Variables de dificultad (resumen operativo)

Ejes válidos para subir la dificultad, derivados de DL-§4:

| Eje | Cómo se aplica en Bitland |
|---|---|
| **Cantidad de variables** | Más agentes, más paquetes, más calles, más eventos. |
| **Distancia causa–efecto** | Más pasos entre la acción del jugador y la consecuencia. |
| **Necesidad de anticipación** | El resultado depende de leer el estado futuro, no del actual. |
| **Simultaneidad** | Varios sistemas interactúan a la vez. |
| **Restricciones** | Energía limitada, memoria limitada, tiempo de clock limitado, permisos. |
| **Información incompleta pero inferible** | El jugador no ve una variable, pero puede inferirla por la traza. |
| **Combinación de conceptos** | Un puzzle exige dos o más ideas a la vez. |
| **Varias soluciones válidas** | El jugador tiene libertad real, no se evalúa por sintaxis. |
| **Optimización** | El objetivo es "funciona mejor", no sólo "funciona". |

Ejes **prohibidos**: esconder información no inferible, reinicio opaco,
memorización sin lectura de estado, castigo por ensayo razonable.

---

## 3. B1 — Secuencia

### Concepto

Ordenar acciones simples para producir un resultado. Es la entrada al
lenguaje: el jugador aprende que *el orden importa*.

### Forma jugable

- Una cinta vacía al lado de un agente.
- El jugador arrastra tarjetas: `MOVE`, `TURN`, `PICK`, `DROP`,
  `WAIT`, `ACTIVATE`.
- El agente ejecuta la cinta una vez.

### Condición de éxito

- El agente llega a un estado final (entregó un paquete, activó un
  dispositivo, salió de una calle).
- El sistema verifica **estado final**, no la cantidad de tarjetas.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Una acción extra (PICK extra, MOVE redundante). |
| Distancia causa–efecto | Pasos entre `PICK` y `DROP`. |
| Restricciones | Pasos totales limitados (parsimonia) o energía limitada. |
| Varias soluciones | Cualquier permutación que llegue al estado final vale. |

### Combinaciones naturales

- B2 (Generalización): la misma secuencia debe funcionar con un input
  distinto.
- B4 (Repetición): el jugador descubre que repetir manualmente es
  absurdo.

### Prohibido

- Exigir el "orden canónico" como único válido.
- Que la cinta exceda la capacidad del panel sin que el jugador lo sepa.

### Ejemplo ilustrativo

Una cinta vacía al lado de un repartidor detenido frente a un
mostrador. El jugador debe: `MOVE(N) → PICK(paquete) → MOVE(E) →
DROP(mostrador_B)`. Una cinta con todas las tarjetas en el orden
correcto *y* una al final que no afecta el resultado es válida.

---

## 4. B2 — Generalización

### Concepto

La misma solución debe funcionar con **inputs distintos**. El jugador
aprende que un programa robusto no se rompe cuando cambian los datos.

### Forma jugable

- El mismo agente o programa se prueba con 2 a N configuraciones de
  entrada distintas (paquetes diferentes, posiciones distintas, eventos
  distintos).
- El jugador ve un resumen: "probado 4/5 inputs" o "falló en input 3".

### Condición de éxito

- El programa pasa **todos** los inputs diseñados.
- Si pasa N–1 inputs, es un estado intermedio; el puzzle no está
  cerrado.
- No se exige un mínimo de tarjetas, ni una forma particular.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más tipos de input, más casos de borde. |
| Distancia causa–efecto | El input que rompe el programa es el último en aparecer. |
| Información incompleta | El jugador debe *inferir* qué inputs probará el verificador. |
| Combinación de conceptos | El programa general exige usar B3 (condición). |
| Varias soluciones | Múltiples formas de generalizar (ej. más IF vs. loop). |

### Combinaciones naturales

- B3 (Condición): la generalización usualmente requiere condición.
- B5 (Memoria): cuando los inputs cambian de orden, la memoria ayuda.

### Prohibido

- Hacer la generalización obligatoria cuando el jugador aún no tiene
  IF/memoria.
- Que el "input distinto" sea un caso degenerado (paquete fantasma).

### Ejemplo ilustrativo

Un agente que debe llevar paquetes a tres mostradores distintos, en
posiciones variables. Sin IF, el jugador hace una cinta larga con
secuencias distintas. La pista visual: "tu programa sólo sirvió para 2
de 3 paquetes". Aparece la necesidad de condición.

---

## 5. B3 — Condición

### Concepto

Responder a un **estado variable** del mundo. La condición bifurca la
secuencia.

### Forma jugable

- Aparece la tarjeta `IF`.
- El jugador elige un *sensor* (FRENTE_LIBRE, LLEVA_PAQUETE, etc.) y
  un *cuerpo*.
- El agente evalúa la condición y toma una rama.

### Condición de éxito

- El agente pasa todos los inputs diseñados.
- El sistema *explica* por qué tomó la rama que tomó (P05).
- La rama no tomada puede quedar vacía (equivalente a "no hacer nada
  en este caso"); no es error.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más sensores disponibles, más estados que considerar. |
| Distancia causa–efecto | La condición se evalúa varios pasos antes de la decisión visible. |
| Anticipación | El jugador debe predecir cuándo el sensor será verdadero. |
| Combinación de conceptos | Condición anidada, condición con B5 memoria. |
| Varias soluciones | Distintas descomposiciones IF/ELSE. |

### Combinaciones naturales

- B4 (Repetición): `WHILE` requiere condición de salida.
- B5 (Memoria): condición sobre variable interna.
- B2 (Generalización): condición como herramienta de generalización.

### Prohibido

- IF obligatorio cuando el problema no lo requiere.
- Anidamiento arbitrariamente profundo que rompa la UI.

### Ejemplo ilustrativo

Una calle con un desvío. A veces hay un paquete a la derecha; a veces
no. Sin IF, el jugador no sabe qué rama tomar. Con `IF(FRENTE_LIBRE)
{ MOVE(E) } ELSE { TURN(N) }` el agente sortea el desvío.

---

## 6. B4 — Repetición

### Concepto

Eliminar trabajo redundante. Una tarea que se repite debe programarse
una vez.

### Forma jugable

- Aparece la tarjeta `REPEAT(n)` o `WHILE(cond)`.
- El jugador envuelve un grupo de tarjetas en un loop.
- El sistema muestra el contador de iteraciones en ejecución.

### Condición de éxito

- El agente completa la tarea el número de veces pedido (N entregas,
  N ciclos, N pasos).
- Una solución REPEAT vale lo mismo que una solución con N copias
  literales: la diferencia es pedagógica, no evaluativa.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Variaciones dentro del loop (distintas entregas). |
| Distancia causa–efecto | El contador que se incrementa no es visible desde fuera. |
| Anticipación | El jugador debe decidir de antemano N o la condición. |
| Restricciones | WHILE con energía limitada: el loop debe terminar. |
| Optimización | Mínimo de iteraciones o de tarjetas. |

### Combinaciones naturales

- B3 (Condición): `WHILE` requiere condición.
- B5 (Memoria): contador como variable.

### Prohibido

- Recompensar el WHILE "infinito" que termina por intervención externa.
- Penalizar REPEAT literal cuando el jugador aún no tiene memoria.

### Ejemplo ilustrativo

Un depósito con 12 paquetes y un mostrador al otro lado. Sin loop: 12
veces `PICK → MOVE → DROP → MOVE`. Aparece la incomodidad; aparece
`REPEAT(12)`.

---

## 7. B5 — Memoria

### Concepto

Recordar información entre eventos. El estado del agente se vuelve
persistente.

### Forma jugable

- Aparece una **repisa de variables** al lado del programa.
- El jugador crea una variable, le asigna valor, la usa como
  condición o como argumento.
- Una variable se ve como una caja con un valor.

### Condición de éxito

- El agente usa la variable cuando debe.
- El valor de la variable es el esperado al final.
- Más de una estrategia para gestionar la misma memoria es válida.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más variables en juego, distintos tipos. |
| Distancia causa–efecto | Una variable cambia en una rama y se lee en otra muy lejos. |
| Simultaneidad | Variables compartidas entre agentes (preludio a B9). |
| Combinación de conceptos | Memoria + condición + loop. |
| Varias soluciones | Distintas formas de codificar el mismo estado. |

### Combinaciones naturales

- B3 (Condición).
- B6 (Abstracción): variables como parámetros.
- B9 (Concurrencia): variables compartidas.

### Prohibido

- Variables globales visibles como "puntaje oculto".
- Variables sin tipo que acepten cualquier valor sin error legible.

### Ejemplo ilustrativo

Un repartidor que debe recordar cuántos paquetes lleva y no aceptar más
de 3. Variable `carga`. El jugador usa `IF(carga < 3) { PICK }` y
`INCR(carga)` después de cada PICK.

---

## 8. B6 — Abstracción

### Concepto

Crear una **función reutilizable**. El jugador nombra un comportamiento
y lo invoca desde varios lugares.

### Forma jugable

- Aparece un **pliego de subrutina**: una hoja que se pliega/despliega
  con su nombre.
- El jugador arrastra tarjetas al pliego, define parámetros.
- Una tarjeta `CALL nombre(...)` invoca desde otro lugar del programa.

### Condición de éxito

- La función se invoca al menos dos veces desde lugares distintos.
- La firma (parámetros) es coherente con su uso.
- No se exige un mínimo de instrucciones en la subrutina.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más parámetros, más invocaciones. |
| Distancia causa–efecto | Un cambio en la función altera varios sitios. |
| Anticipación | El jugador debe prever la generalización antes de codificar. |
| Combinación de conceptos | Función + memoria, función + condición. |
| Optimización | Reducir duplicación (DRY como objetivo, no como castigo). |

### Combinaciones naturales

- B5 (Memoria): variables como parámetros.
- B2 (Generalización): abstracción como herramienta de generalización.
- B9 (Concurrencia): misma función en varios agentes.

### Prohibido

- Exigir función cuando el problema es pequeño.
- Funciones recursivas con profundidad arbitraria sin protección.

### Ejemplo ilustrativo

Dos repartidores en esquinas opuestas. Ambos deben hacer la misma
secuencia. Aparece la duplicación; aparece la función `entregar_a(celda)`.

---

## 9. B7 — Debugging

### Concepto

Encontrar el error en un sistema existente. El bug es *legible*, no
*maligno*.

### Forma jugable

- El jugador recibe un sistema que "casi funciona": un agente, un
  servicio, un barrio.
- El sistema expone su programa y su traza.
- El jugador tiene herramientas: step, pause, rewind, inspección,
  breakpoint.

### Condición de éxito

- El bug desaparece y el sistema cumple su contrato observable.
- El jugador **demuestra** que entendió el bug (P04): el sistema le
  pide, después de corregir, *por qué* fallaba.
- El bug a encontrar es único; la *estrategia* para encontrarlo no.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más agentes, más anidamiento, más estado. |
| Distancia causa–efecto | El bug se manifiesta lejos del lugar donde está. |
| Anticipación | El jugador debe leer la traza y predecir antes de tocar. |
| Simultaneidad | Varios sistemas se interfieren. |
| Información incompleta | Parte del estado se oculta; debe inferirse. |
| Combinación de conceptos | Bug requiere entender B3+B4 o B5+B9, etc. |

### Combinaciones naturales

- B5 (Memoria): bug de inicialización.
- B9 (Concurrencia): race condition.
- B11 (Routing): ruta cíclica que satura.

### Prohibido

- Bugs sin pista inferible (P05).
- "Incorrecto" como único feedback.
- Reset opaco que borra contexto.

### Ejemplo ilustrativo

Un repartidor que entrega al mostrador equivocado. La traza muestra
que ejecuta `MOVE(N)` en el segundo paso cuando debería ser `MOVE(E)`.
El jugador identifica el bug y lo corrige. El sistema pregunta: *¿por
qué llegó al destino equivocado?*.

---

## 10. B8 — Automatización

### Concepto

Diseñar un **proceso continuo** que el jugador puede dejar correr.
Aparece el salto "di instrucciones" → "construí comportamiento".

### Forma jugable

- El jugador diseña una rutina + su criterio de continuidad.
- El sistema la activa (manual, automática local, automática global).
- El jugador puede monitorear y ajustar.

### Condición de éxito

- El proceso corre de forma estable durante al menos N ciclos.
- El sistema verifica **efecto acumulativo** (P08): paquetes
  entregados, cola vacía, calle habilitada, etc.
- Varias formas de automatizar son válidas.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más entradas, más eventos, más agentes. |
| Distancia causa–efecto | El efecto se ve varios ciclos después. |
| Anticipación | El jugador debe prever casos de borde. |
| Restricciones | Energía, memoria, permisos. |
| Combinación de conceptos | Automatización con B7 (depurar para que corra). |
| Optimización | Throughput, latencia, costo. |

### Combinaciones naturales

- B7 (Debugging): automatizar algo que ya casi corre.
- B9 (Concurrencia): automatizar una orquestación.
- B11 (Routing): automatizar un enrutador.

### Prohibido

- Automatizaciones que se rompen en silencio (sin traza).
- "Dejarlo correr" sin un criterio de éxito verificable.

### Ejemplo ilustrativo

Un servicio de despacho que activa un repartidor cada vez que llega un
pedido al buzón. El jugador diseña `ON(pedido) { SPAWN(repartidor);
CALL entregar() }`. El sistema mide pedidos entregados / pedidos
recibidos.

---

## 11. B9 — Concurrencia

### Concepto

Varios agentes interactúan en el mismo clock. La simultaneidad ya no
es opcional.

### Forma jugable

- El jugador programa **varios agentes a la vez**.
- El sistema muestra el tick actual y qué hace cada agente.
- Los efectos cruzados son visibles (uno espera a otro, uno choca con
  otro, uno se apodera de un recurso que el otro necesita).

### Condición de éxito

- Los agentes cumplen su rol sin generar deadlocks persistentes ni
  carreras catastróficas.
- El sistema verifica efecto global (P08): la calle se vacía, la
  cola decrece, etc.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más agentes en paralelo. |
| Simultaneidad | Toda la familia vive de esto. |
| Distancia causa–efecto | El bug de un agente sólo se ve cuando otro actúa. |
| Anticipación | El jugador debe predecir el intercalado. |
| Combinación de conceptos | Concurrencia + memoria + condición. |

### Combinaciones naturales

- B10 (Sincronización): la concurrencia introduce sincronización.
- B11 (Routing): enrutamiento bajo carga concurrente.
- B7 (Debugging): race conditions.

### Prohibido

- Paralelismo real sin clock visible (debe poder pausarse globalmente).
- Concurrencia sin affordance clara para "ver qué hizo cada uno".

### Ejemplo ilustrativo

Tres repartidores alimentando un depósito. Sin coordinación, dos
intentan `DROP` en la misma celda y uno queda esperando. Con `LOCK(celda)`,
la coordinación emerge.

---

## 12. B10 — Sincronización

### Concepto

Evitar carreras, esperas y conflictos. La sincronización es la
*higiene* de la concurrencia.

### Forma jugable

- Aparecen primitivas de lock/unlock, semáforos visuales, eventos.
- El jugador debe asegurar orden o exclusión mutua.
- El sistema muestra el estado del recurso (libre / tomado /
  esperado).

### Condición de éxito

- El sistema cumple invariantes observables:
  - **Safety:** nunca dos agentes modifican lo mismo a la vez.
  - **Liveness:** el sistema no queda bloqueado para siempre.
- El sistema verifica los invariantes por *traza*, no por string.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más recursos compartidos. |
| Distancia causa–efecto | El deadlock aparece varios ticks después. |
| Anticipación | El jugador debe prever quién bloqueará qué. |
| Combinación de conceptos | Sync + memoria + eventos. |
| Varias soluciones | Mutex, semáforo, message passing: todas válidas. |

### Combinaciones naturales

- B9 (Concurrencia).
- B7 (Debugging): deadlocks.
- B11 (Routing): evitar que dos paquetes tomen la misma calle.

### Prohibido

- Sync obligatoria cuando la concurrencia no lo exige.
- Deadlocks que sólo se rompen por reset.

### Ejemplo ilustrativo

Dos agentes deben pasar por un puente angosto uno a la vez. Sin
sync, chocan. Con `LOCK(puente)` y `UNLOCK(puente)`, el cruce es
ordenado y observable.

---

## 13. B11 — Routing

### Concepto

Mover datos/recursos por una red. Decidir por dónde pasa un paquete.

### Forma jugable

- El jugador configura reglas de una intersección o un enrutador.
- Las reglas pueden ser estáticas, dinámicas (por evento), o
  aprendidas.
- El sistema muestra el flujo: qué paquetes, por dónde, con qué
  latencia.

### Condición de éxito

- Los paquetes llegan a sus destinos correctos.
- La red no se satura (cumplir un throughput mínimo).
- El sistema verifica por traza y por métrica.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más destinos, más clases de paquete, más rutas. |
| Simultaneidad | Muchos paquetes a la vez. |
| Distancia causa–efecto | La decisión en un nodo afecta muchos paquetes. |
| Anticipación | El jugador debe prever picos de tráfico. |
| Combinación de conceptos | Routing + condición + memoria. |
| Optimización | Mínima latencia, mínima congestión, mínima energía. |

### Combinaciones naturales

- B9 (Concurrencia): paquetes concurrentes.
- B10 (Sincronización): paquetes que comparten nodo.
- B12 (Optimización): minimizar costo o latencia.

### Prohibido

- Routing obligatorio cuando el problema es uno a uno.
- Solución única cuando la topología admite varias.

### Ejemplo ilustrativo

Un enrutador con tres destinos y tres tipos de paquete. El jugador
debe decidir por qué calle va cada tipo, qué pasa cuando el destino
está lleno, y qué hacer con un paquete sin destino claro.

---

## 14. B12 — Optimización

### Concepto

Una solución correcta puede ser *mejor*: menos pasos, menos memoria,
más throughput, más robustez, más generalidad.

### Forma jugable

- El jugador ya pasó un puzzle B1–B11 con una solución válida.
- Ahora el sistema le pide: "funciona, pero puedes mejorarlo".
- Las métricas se exponen como **observables del mundo**: cola más
  corta, calle más libre, energía sobrante, robustez ante un input
  nuevo.

### Condición de éxito

- Mejora medible en al menos una métrica sin empeorar otras.
- El sistema no exige un valor absoluto: exige una *mejora*. Una
  solución con 12 pasos que baja a 10 pasa; bajar de 10 a 9 también.
- La métrica robusta (B12 robusto): el programa sigue funcionando con
  un input que el jugador *no vio durante la campaña*.

### Variables de dificultad

| Eje | Sub-eje de Bitland |
|---|---|
| Cantidad de variables | Más dimensiones a optimizar a la vez. |
| Distancia causa–efecto | El costo de la optimización se ve lejos. |
| Anticipación | El jugador debe imaginar el input futuro. |
| Restricciones | Combinar varias restricciones (energía + memoria). |
| Combinación de conceptos | Optimización + abstracción + routing. |
| Varias soluciones | Varias formas de mejorar. |

### Combinaciones naturales

- B6 (Abstracción): la abstracción casi siempre reduce duplicación.
- B11 (Routing): rutas más cortas o más balanceadas.
- B9 (Concurrencia): paralelización.

### Prohibido

- Optimización obligatoria para cerrar la campaña.
- Métricas arbitrarias sin lectura sistémica.
- Castigo por no optimizar (P13).

### Ejemplo ilustrativo

Una rutina de entrega con 14 instrucciones que entrega 5 paquetes.
El jugador descubre que con un loop y un condicional baja a 8
instrucciones. La cola se vacía más rápido, la energía consumida baja.

---

## 15. Cobertura y aparición por arco

| Familia | I (Instrucciones) | II (Decisión) | III (Estado) | IV (Abstracción) | V (Sistemas) | VI (Arquitectura) |
|---|---|---|---|---|---|---|
| B1 Secuencia | ● principal | ● | | | | |
| B2 Generalización | introducción | ● principal | ● | | | |
| B3 Condición | introducción | ● principal | ● | | | |
| B4 Repetición | ● | ● principal | ● | | | |
| B5 Memoria | | introducción | ● principal | ● | | |
| B6 Abstracción | | | introducción | ● principal | ● | |
| B7 Debugging | introducción | ● | ● | ● | ● | ● |
| B8 Automatización | final de arco | ● | ● | ● | ● | ● |
| B9 Concurrencia | | | | introducción | ● principal | ● |
| B10 Sincronización | | | | introducción | ● principal | ● |
| B11 Routing | | | | | ● | ● principal |
| B12 Optimización | | | | ● | ● | ● principal |

> **Nota.** "principal" = la familia es el corazón de la mayoría de
> puzzles del arco. "introducción" = aparece una vez como preparación.
> Símbolo solo = transferencia.

---

## 16. Validación por condiciones — tabla operativa

| Familia | Se verifica por... |
|---|---|
| B1 | Estado final alcanzado. |
| B2 | Pasa todos los inputs diseñados. |
| B3 | Pasa todos los inputs + explicación correcta de por qué. |
| B4 | N repeticiones efectivas; energía consumida ≤ presupuesto. |
| B5 | Estado final de variables + invariantes observables. |
| B6 | Función invocada ≥ 2 veces + firma coherente. |
| B7 | Bug corregido + explicación de la causa. |
| B8 | Efecto acumulativo observable en N ciclos. |
| B9 | Sin deadlocks persistentes + efecto global observable. |
| B10 | Invariantes de safety y liveness verificados en traza. |
| B11 | Paquetes correctos en destino + red no saturada. |
| B12 | Mejora medible en ≥ 1 métrica sin empeorar otras. |

> **Ninguna familia exige la solución canónica.** Por P07.

---

## 17. Lo que este documento NO es

- No prescribe puzzles concretos (esos viven en
  `bitland-arc-01_v1.md` y en futuros `bitland-arc-N_v*.md`).
- No prescribe la cámara ni la UI.
- No define la sintaxis del lenguaje (vive en
  `bitland-programming-language-gameplay_v1.md`).
- No cuenta historia. El "por qué" de los sistemas heredados vive en
  `bitland-narrative-bible_v1.md`.
- No es canon: es PROPOSED hasta ratificación.

---

## 18. Open questions del documento

Ver frontmatter. Resumen:

- **BL-PG-Q1.** Familias disjuntas o combinables.
- **BL-PG-Q2.** Umbral de "optimización genuina" en B12.
- **BL-PG-Q3.** Taxonomía de bugs en B7.
- **BL-PG-Q4.** B10 con un solo agente o sólo con varios.
- **BL-PG-Q5.** B11 con paquetes puros o también con personas.
