# Proyecto Roxana — Ohmdal: ruta de contenidos completa
# El mundo de Electrónica, de la Ley de Ohm a la fuente switching

**Versión:** 0.1 — propuesta de ruta para revisar con el autor
**Alcance:** todas las unidades de Ohmdal (presentes y futuras), su orden pedagógico, el punto de corte de la v1, y dónde entra la robótica.
**Referencia curricular:** electrónica de escuela técnica secundaria (ciclo básico + ciclo superior).
**Estado:** borrador.

---

## 1. El principio rector

Ohmdal se construye en **tres arcos**, cada uno con su propia promesa narrativa que abre y cierra. Esto permite cortar entre arcos sin dejar tramas mutiladas: cada arco deja a Ohmdal «completo» a su escala, con la puerta del siguiente plantada en el mundo, no en texto.

| Arco | Promesa | Pregunta del arco | Contenido técnico |
|---|---|---|---|
| **I — El Río** | Restaurar la red eléctrica del reino | ¿Cómo se mueve y reparte la corriente? | DC: Ohm, serie/paralelo, Kirchhoff, potencia, redes, capacitor |
| **II — La Señal** | Despertar las máquinas que deciden | ¿Cómo una corriente chica gobierna a una grande? | Semiconductores: diodo, transistor, op-amp, fuente switching |
| **El Empalme** *(mundo compartido con Programación — no es un arco de Ohmdal)* | Restaurar la conexión entre mundos y sus criaturas | ¿Cómo una máquina percibe, decide y actúa? | Robótica: sensores, lógica, sigue-líneas, sumo, fútbol |

La progresión emocional acompaña: el Arco I enciende el **reino**, el Arco II le devuelve el **pulso** (señal, control), y el Empalme le devuelve la **vida** (los autómatas — y la historia de Ohm, que es de ahí: la reserva narrativa plantada desde la U1 se gasta recién acá). Ver §4: la robótica vive en un **mundo propio entre Ohmdal y el mundo de Programación**, no dentro de Ohmdal.

---

## 2. Arco I — El Río (corriente continua)

### U1 — «La corriente no es magia» ✅ construida (greybox)

- **Conceptos:** circuito cerrado, tensión, corriente, resistencia, I=V/R, código de colores.
- **Escenario:** la plaza, el taller de Lumen, la Puerta de Ohm.
- **Gancho saliente:** la campana de dos cables.

### U2 — «El río se reparte» ✅ construida (greybox, jun 2026) (`unidad-2-caminos.md`)

- **Conceptos:** serie, paralelo, nodos/ramas, ley de corrientes de Kirchhoff como intuición («la Regla del Cruce»).
- **Escenario:** el Castillo sellado por el Consejo (galería en cadena, ramales, el Repartidor).
- **Ganchos salientes:** la forja restaurada entibia sus cables (→U3); «la chispa que se queda» (→U5).

### U3 — «El precio del río» (potencia y energía) ✅ construida (greybox, jun 2026) (`unidad-3-forja.md`)

- **Conceptos:** P = V·I, efecto Joule (el calor como gasto real — ahora sí algo «se gasta», y distinguirlo del río es LA finura pedagógica del arco), dimensionar cables y fusibles, energía = potencia × tiempo.
- **Escenario propuesto:** **la Forja de Ohmdal** (ya nombrada en U2 como el distrito hambriento). La forja funciona pero sus canales entibian, los fusibles «justos» mueren jóvenes, y el Consejo —ahora aliado— pregunta cuánto cuesta de verdad mantener el reino encendido.
- **Misconcepciones atacadas:** «la corriente se gasta» (refinada: el río no se gasta, lo que se entrega es *empuje por caudal*: trabajo); «un cable es un cable» (no: el cable cobra peaje en calor según cuánto río lleva); «más grande siempre aguanta más».
- **Evento mayor:** dimensionar la red de la Forja: elegir grosores de canal y fusibles para cada máquina según su potencia. La aguja nueva es un **termómetro**.
- **Gancho saliente:** las Terrazas del valle, donde el empuje «baja por escalones» (→U4).

### U4 — «La vuelta completa» (Kirchhoff de tensiones, divisores, escalera) ✅ construida (greybox, jun 2026) (`unidad-4-terrazas.md`)

- **Conceptos:** ley de tensiones de Kirchhoff («la Regla de la Vuelta»: en toda vuelta cerrada, las subidas y bajadas de empuje se cancelan), divisor de tensión, divisor de corriente, **circuito escalera** (red resistiva resuelta por etapas), resistencia equivalente (ver una red entera «como una sola piedra»).
- **Escenario propuesto:** **las Terrazas** — el acueducto de cobre que riega el valle por niveles. Cada terraza toma su parte del empuje; la red completa es una escalera física que se camina.
- **Por qué acá:** cierra la teoría de redes resistivas con las dos leyes de Kirchhoff ya formalizadas (la del cruce venía intuida desde U2). Es la unidad «de maestría»: nada nuevo que tocar, todo nuevo que combinar.
- **Evento mayor:** restaurar el riego del valle: una escalera de N etapas donde hay que predecir (¡por primera vez predecir antes de probar!) cuánto empuje llega al último escalón. La Bitácora estrena la página de cálculo: el jugador ya no solo registra — anticipa.
- **Gancho saliente:** en la terraza más baja, el viejo Faro del lago, apagado, con un mecanismo que «parpadeaba» (→U5).

### U5 — «La chispa que se queda» (capacitor, tiempo) — **cierre del Arco I** ✅ construida (greybox, jun 2026) (`unidad-5-faro.md`)

- **Conceptos:** el capacitor como almacén de carga, carga/descarga, la curva RC como *tiempo* (cualitativa: llenar/vaciar un estanque por un canal angosto), el destello periódico.
- **Escenario propuesto:** **el Faro del lago** (y el Reloj de Ohmdal). Paga la anomalía registrada en U2: aquello que brilló sin camino. La chispa puede *guardarse*, y un almacén que se llena despacio y se vuelca de golpe es un corazón que late: el Faro parpadea, el Reloj vuelve a marcar.
- **Misconcepción atacada:** «sin camino no pasa nada, nunca» (cierto para resistencias; el capacitor introduce la memoria).
- **Evento mayor:** calibrar el destello del Faro — elegir estanque (capacidad) y canal (freno) para el ritmo correcto. R y C como perillas del tiempo.
- **Cierre del arco:** con el Faro y el Reloj andando, la red de Ohmdal está **completa y viva en el tiempo**: plaza, castillo, forja, terrazas, faro. Gran restauración visible — el mapa entero encendido de noche.
- **Gancho saliente (hacia el Arco II, plantado pero no urgente):** en lo alto del Faro hay un ojo de cristal que *reacciona a la luz* moviendo una aguja, y nadie sabe cómo un rayo de luz puede empujar un río. (Fotosensor → semiconductores: la materia que decide.)

> **Nota de orden:** potencia (U3) va antes que escalera (U4) porque continúa la experiencia física de U2 (fusibles, calor, el Tronco que «paga») y porque la escalera gana muchísimo siendo la unidad de maestría con TODA la teoría resistiva disponible. El capacitor (U5) cierra el arco porque introduce el tiempo, que es el puente natural hacia señal y conmutación.

---

## 3. Arco II — La Señal (semiconductores)

La pregunta que lo abre: **¿cómo una corriente chiquita puede gobernar a una grande?** Hasta acá el jugador movió el río con las manos (piedras, cristales). El Arco II es la transición de *mover energía* a *mover información*.

### U6 — «El camino de una sola mano» (diodo)

- **Conceptos:** el diodo como válvula de un solo sentido, caída fija, polaridad; rectificación elemental; el LED como diodo que avisa.
- **Escenario propuesto:** las esclusas del lago — compuertas que dejan pasar el río en un solo sentido.
- **Por qué primero:** es el semiconductor mínimo; sin válvula no hay transistor que se entienda ni switching que se arme.

### U7 — «El susurro y el trueno» (transistor)

- **Conceptos:** el transistor primero como **llave comandada** (un hilo de río abre la compuerta de un río grande), después como **amplificador** (la región intermedia: el grifo). Ganancia como idea, no como fórmula de polarización.
- **Escenario propuesto:** la Casa de las Compuertas — el distrito donde los Maestros «enseñaban a los ríos a obedecer ríos».
- **Probablemente la unidad más importante del juego entero** en términos técnicos: merece el espacio de dos eventos mayores (llave / grifo), como tuvo la U1.

### U8 — «La balanza que agranda» (amplificador operacional)

- **Conceptos:** el op-amp como **comparador** primero (¿cuál de los dos empujes es mayor? — respuesta a todo o nada) y como **amplificador con realimentación** después (la balanza que se corrige sola). Realimentación negativa como idea madre.
- **Escenario propuesto:** el Tribunal de los Empujes — una balanza monumental que decide y, domada con realimentación, mide.
- **Aplicación estrella (puente al Arco III):** el **sigue-líneas analógico**: dos ojos de cristal (los del Faro, U5), una balanza que compara, dos motores. Una criatura que sigue un camino dibujado **sin programa alguno**. Asombro garantizado y verdad técnica: percepción→decisión→acción puede ser pura electrónica.

### U9 — «El corazón que late» (fuente switching) — **cierre del Arco II**

- **Conceptos:** por qué la fuente lineal derrocha (¡potencia de U3!), la conmutación como solución: llave (U7) + válvula (U6) + almacén (U5) + el inductor («la chispa que empuja de vuelta», introducido aquí como pieza nueva del arco), PWM como dosificación por ritmo.
- **Escenario propuesto:** el Corazón Nuevo del Castillo — reemplazar el viejo derrochador del Repartidor por un corazón que late.
- **Por qué es el cierre perfecto:** la switching es la **síntesis literal de todo el juego hasta acá** — cada pieza aprendida aparece cumpliendo su rol en un solo mecanismo. Es el «examen final» que no parece examen.

---

## 4. El Empalme — mundo compartido de robótica (Electrónica × Programación)

La robótica **no es una unidad de Ohmdal ni del mundo de Programación: es un mundo propio, compartido entre los dos.** Un robot es electrónica + programa; forzarlo dentro de un solo mundo obligaría a enseñar la otra mitad con metáforas prestadas, rompiendo la regla de un sistema conceptual por mundo.

### 4.1. Dónde vive (y por qué ya estaba plantado)

El mapa antiguo del despacho de Roxana (prólogo, §14.3 de `prologo.md`) muestra las cuatro regiones **conectadas por líneas finas — y «algunas líneas están cortadas»**. Esas líneas son las conexiones entre Mundos Aplicados. **El Empalme** *(nombre tentativo — «empalme» es unión de conductores: diegético y literal a la vez)* es el mundo que vive **sobre la línea cortada entre Ohmdal y el mundo de Programación**. Restaurar mundos es la primera mitad del juego; restaurar las **conexiones entre mundos** es la tesis completa del Instituto: el conocimiento no vive en aulas separadas.

Del lado de la escuela, el acceso no es por un aula sino por el **Club de Robótica** — el espejo exacto de la cultura real de las técnicas: la robótica es extracurricular, interdisciplinaria, de después de hora. Otro espacio del Instituto que se restaura (y el primero que no es un aula: la escuela también tiene vida fuera del horario).

### 4.2. Requisitos y lenguaje

- **Dos llaves:** se entra con Ohmdal Arco II completo (transistor/op-amp: el cuerpo) y el mundo de Programación a nivel equivalente (secuencia, condicionales, bucles: la mente). Es el primer contenido del juego que **exige dos mundos**: misión de diseño, no limitación.
- **El lenguaje se gradúa:** quien llega al Empalme ya formalizó el léxico de ambos mundos, así que aquí se habla **en términos técnicos reales** sin violar la regla del spoiler. El Empalme suena a taller de verdad — esa madurez del lenguaje es parte de la recompensa.

### 4.3. Progresión (cada criatura suma una capa)

1. **El sigue-líneas** — percepción y reacción. Versión analógica ya construida en U8 de Ohmdal; acá se le da *programa*: umbrales, calibración, decisiones. Mismo cuerpo, mente nueva — la comparación analógico/programado ES la lección.
2. **El robot sumo** — estados y estrategia: buscar, embestir, no caerse. Máquina de estados vivida (sin llamarla así hasta la Bitácora).
3. **El fútbol de autómatas** — cooperación y roles: varios agentes, una pelota, posiciones. Cierre festivo: un torneo con público de los DOS mundos — ciudadanos de Ohmdal y habitantes del mundo de Programación encontrándose por primera vez en una tribuna. (Exhibición perfecta del producto: el torneo de robots como evento escolar real es 100% cultura de escuela técnica.)

### 4.4. El peso narrativo

**La historia de Ohm se cuenta acá:** Ohm es hijo del Empalme — un autómata es medición (Ohmdal) más instrucciones (Programación), y por eso Ohm siempre fue distinto de todo lo demás que el jugador vio en Ohmdal. Quién lo construyó, qué vio cuando los mundos se desconectaron, por qué quedó dormido en la plaza. El contenido técnico más integrador lleva el peso narrativo más grande. No gastar antes.

También es el lugar natural para los reencuentros entre personajes de mundos distintos (Edda quiere cruzar al aula desde la U1: su arco puede pagar acá).

---

## 5. ¿Hasta dónde llega Ohmdal? ¿Dónde cortar?

**Techo del mundo:** la fuente switching + los autómatas son un techo correcto para secundaria técnica. Lo que queda afuera de Ohmdal a propósito: AC de potencia/trifásica, electrónica digital profunda (compuertas, micros — eso vive mejor en el mundo Programación), RF. Si algún día hacen falta, son arcos nuevos, no parches.

### Recomendación de corte para la v1: **fin del Arco I (U5)**

Razones, en orden de peso:

1. **Cierre narrativo honesto.** La promesa de la U1 es «la luz que vuelve». Con U5, la red entera de Ohmdal está encendida y el reino marca su propio tiempo: la promesa está CUMPLIDA, no interrumpida. El ojo de cristal del Faro deja plantado el Arco II como *secuela deseable*, no como trama mutilada. Cortar en U9 también cerraría bien — pero cortar en U3, U4, U6, U7 u U8 dejaría arcos abiertos.

2. **Cierre pedagógico vendible (B2B).** Arco I = circuitos de corriente continua completos = ciclo básico de técnica / física de secundaria general. «Ohmdal v1: circuitos eléctricos, 5 unidades» es un producto que una escuela entiende y compra. El Arco II es de ciclo superior: otro comprador, otro precio, otra versión.

3. **Riesgo de producción.** La escuela tiene cuatro puertas (Matemática, Física, Electrónica, Programación). Con 5 unidades de Ohmdal y tres puertas eternamente cerradas, el mundo se siente angosto justo cuando el jugador más confía en él. Después del corte conviene abrir la U1 de **Programación** (que además es prerequisito del Arco III) y/o Matemática. Validar el patrón multi-mundo antes de profundizar uno solo.

4. **El Empalme lo exige.** Los robots necesitan el mundo Programación vivo. La ruta natural es: Ohmdal I (5u) → Programación I (2–3u) → Ohmdal II (4u) → el Empalme como mundo compartido. La alternancia mantiene fresco cada mundo y los ganchos cruzados (el ojo de cristal, la línea cortada del mapa) tiran del jugador de un mundo al otro.

### La ruta completa, en una línea de tiempo

```
v1  ── Ohmdal Arco I ──────────── U1 ✅  U2 ✅  U3 ✅  U4 ✅  U5 ✅   ← ✅ ARCO I COMPLETO (greybox v1)
v2  ── Programación Arco I ────── P1  P2  (P3)
v3  ── Ohmdal Arco II ─────────── U6  U7  U8  U9
v4  ── El Empalme (mundo compartido) ── sigue-líneas · sumo · fútbol + historia de Ohm
        (en paralelo: Matemática/Física abren sus U1 cuando la producción lo permita)
```

---

## 6. Tabla resumen de Ohmdal

| # | Unidad | Concepto técnico | Escenario | Pieza nueva de banco |
|---|---|---|---|---|
| U1 | La corriente no es magia | Ohm, I=V/R, código de colores | Plaza, taller, Puerta | fuente, piedras, fusible, aguja |
| U2 | El río se reparte | serie, paralelo, nodos | El Castillo | cruces, llaves, fusible de Tronco |
| U3 | El precio del río | potencia, Joule, energía | La Forja | termómetro, grosores de canal |
| U4 | La vuelta completa | KVL, divisores, escalera, equivalente | Las Terrazas | etapas en cascada, página de predicción |
| U5 | La chispa que se queda | capacitor, RC, tiempo | El Faro y el Reloj | estanque (C), destello periódico |
| U6 | El camino de una sola mano | diodo, LED, rectificación | Las Esclusas | válvula, polaridad |
| U7 | El susurro y el trueno | transistor: llave y grifo | Casa de las Compuertas | compuerta comandada |
| U8 | La balanza que agranda | op-amp: comparador, realimentación | El Tribunal | balanza, ojos de cristal |
| U9 | El corazón que late | fuente switching, inductor, PWM | Corazón Nuevo | inductor, ritmo/PWM |
| — | El Empalme (mundo compartido) | robótica integradora | entre Ohmdal y Programación; acceso por el Club de Robótica | cuerpo de robot (dos llaves: Ohmdal II + Programación) |

---

## 7. Decisiones abiertas para el autor

1. **¿U3 y U4 se pueden permutar?** Sí sin romper nada, pero la recomendación es potencia→escalera (ver nota en §2).
2. **¿El inductor merece media unidad propia** entre U5 y U9, o alcanza con introducirlo dentro de la switching? (Propuesta actual: dentro de U9, como «la chispa que empuja de vuelta», para no estirar el Arco II.)
3. **¿Cuántas unidades tiene Programación I** antes de volver a Ohmdal? (Mínimo para el Arco III: secuencia/instrucciones + condicionales/bucles.)
4. **El torneo de fútbol de autómatas** como evento final ¿es single-player contra equipos del mundo, o admite compartir/comparar robots entre jugadores reales? (Implicancias de plataforma grandes; decidir tarde.)
5. **Nombres de escenarios** (Forja, Terrazas, Faro, Esclusas, Casa de las Compuertas, Tribunal, Corazón Nuevo) son propuestas — revisar sonoridad en conjunto. Ídem **«el Empalme»** para el mundo compartido: alternativas posibles (la Juntura, el Cruce de Mundos, el Taller del Puente), pero «empalme» tiene la doble lectura eléctrica/espacial.
6. **¿El Empalme abre de golpe o en fases?** Propuesta: el Club de Robótica de la escuela puede descubrirse antes (cerrado, con carteles del torneo viejo) como gancho largo; el mundo en sí abre recién con las dos llaves.
7. **Profundidad del mundo Programación antes del Empalme:** definir su ruta propia (mínimo: secuencia, condicionales, bucles; ideal: también funciones/descomposición) — documento futuro `programacion-ruta-contenidos.md`.
8. **¿Diagnóstico para saltear mundos requisito?** (planteo del autor, jun 2026): un jugador que ya sabe electrónica/programación, ¿puede llegar al Empalme sin jugar todo? Propuesta: **no construir un diagnóstico aparte** — la solución diegética es «**rendir libre**»: la Preceptoría permite presentarse directo al **evento mayor final** de cada mundo/arco (el Repartidor, la Forja completa, la Escalera…); si lo resuelve sin andamios, el arco queda validado con sus flags de comprensión. Reusa contenido existente (cero producción nueva), es honesto (el evento mayor ES el examen que no parece examen) y es ultra diegético en una escuela. Decisión: postergarlo a post-v1 — con un solo mundo terminado no hay nada que saltear todavía.
