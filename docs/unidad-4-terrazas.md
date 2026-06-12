# Proyecto Roxana — Ohmdal, Unidad 4
# “La vuelta completa”

**Versión:** 0.1 — propuesta de diseño (nivel medio de detalle; guion línea por línea antes del build)
**Alcance:** Unidad 4 completa: del acueducto moribundo (gancho de la U3) hasta el valle regado y el gancho al Faro (U5).
**Tema técnico:** ley de tensiones de Kirchhoff, divisor de tensión, divisor de corriente, resistencia equivalente, circuito escalera. La unidad «de maestría»: nada nuevo que tocar, todo nuevo que combinar — y la primera vez que el jugador **predice antes de probar**.
**Requisito narrativo:** Unidad 3 completada (`unit3Completed`, Forja en ritmo).
**Estado:** borrador para revisar con el autor. Nada implementado.

---

## A. Síntesis de la unidad (canon propuesto)

### A.1. Premisa

Las Terrazas: el acueducto de cobre que riega el valle por niveles, obra mayor de los Maestros. Cada terraza toma su parte del empuje y deja pasar el resto. Hace décadas que nadie sabe **repartirlo**: las terrazas altas ahogan sus cultivos y a la más baja no le llega casi nada. La guardiana de las Terrazas lo resume:

> **«Acá arriba sobra y allá abajo falta. Y si toco una sola piedra, cambia TODO el valle. Por eso no toco nada.»**

Esa frase es la unidad entera: en una red, **nada está solo**. Cada piedra le habla a todas las demás. La U4 enseña a leer esa conversación — y, por primera vez, a **anticiparla**: el evento mayor exige predecir en la Bitácora cuánto empuje llega al último escalón ANTES de abrir el agua.

Frases centrales:

> En toda vuelta completa, lo que sube baja. El empuje no desaparece: se reparte en escalones.

> Una red entera puede mirarse como una sola piedra.

### A.2. Léxico diegético de la Unidad 4

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| caída de tensión | el escalón («cada piedra le cobra un escalón al empuje») | Bitácora, tras el evento mayor |
| ley de tensiones de Kirchhoff (KVL) | la Regla de la Vuelta | Bitácora, tras el evento mayor |
| divisor de tensión | el reparto del empuje | Bitácora, tras el evento mayor |
| resistencia equivalente | la Piedra Única | Bitácora, tras el evento mayor |
| circuito escalera | la Escalera (es el acueducto: física, se camina) | es el escenario, no se convierte |

**Instrumento nuevo:** Ohm aprende a medir **entre dos puntos**: abre los brazos y reporta el escalón (la diferencia de empuje) entre sus dos manos. Hasta ahora medía el río parado en un tramo; ahora mide el empuje abrazando un trecho. (Diegéticamente hermoso: para medir empuje hay que abarcar, no pararse.)

### A.3. Diseño de puzzles — una variable nueva por puzzle

| Puzzle | Concepto | Manipulación | Feedback de fallo |
|---|---|---|---|
| Los escalones | el empuje cae por escalones; la vuelta completa suma cero | Ohm con brazos abiertos, tramo por tramo, alrededor de una vuelta | ninguno: medición pura (tutorial) |
| El reparto justo | divisor de tensión: cada piedra cobra su parte proporcional | elegir piedras en fila para dar a cada terraza su empuje objetivo | terraza ahogada o sedienta; las agujas lo muestran |
| La Piedra Única | equivalencia: una red se comporta como una sola piedra | reemplazar una maraña por la piedra que «engaña a Ohm» | Ohm detecta la diferencia: «Red distinta. Río distinto.» |
| La Escalera del valle (evento mayor) | escalera resistiva resuelta por etapas + **predicción** | calcular en la Bitácora, recién después abrir el agua | la predicción errada no castiga: la Bitácora anota «lo esperado vs. lo medido» |

**Aritmética canónica (a verificar en build — restricción dura: todos los empujes intermedios deben ser enteros):**

- **Los escalones (tutorial):** Empuje 16 sobre una fila marrón+marrón+roja+amarilla (1+1+2+4 = 8) → río 2 → escalones de 2, 2, 4 y 8. La vuelta: +16 −2 −2 −4 −8 = 0. Ohm, abrazando la fuente: «Subida: dieciséis.» Abrazando las piedras, una por una: «Escalón: dos… dos… cuatro… ocho.» Edda hace la cuenta en voz alta y se queda callada un segundo: la vuelta cierra **exacta**.
- **El reparto justo:** dos terrazas en fila con Empuje 12 (o el cristal que se canonice); objetivo: terraza alta 8, terraza baja 4 → piedras en proporción 2:1 (roja+marrón, río 4). Variante segunda: mismo objetivo con otra pareja proporcional (amarilla+roja, río 2) — **el reparto depende de la proporción, no del tamaño**: dos soluciones válidas, y la diferencia entre ellas es cuánto río paga el Tronco (puente a U3: la solución de piedras grandes paga menos peaje). Maestría = todas las unidades anteriores hablando a la vez.
- **La Piedra Única:** se presenta una red chica ya conocida (dos ramas en paralelo de la U2, p. ej. roja ∥ roja) y un engaste con una sola piedra al lado. Desafío: ¿qué piedra única hace que Ohm, parado en la fuente, **no pueda distinguir** una red de la otra? (roja ∥ roja = marrón: 2∥2 = 1.) Después una serie+paralelo simple (marrón + (roja ∥ roja) = 1+1 = roja). El asombro es conceptual: la red entera «se esconde» dentro de una piedra. Es la herramienta que vuelve resoluble la Escalera.
- **La Escalera del valle (evento mayor):** acueducto de 3 etapas; cada etapa = un tramo de canal (piedra en serie) + una terraza que bebe (rama en derivación). El jugador la resuelve **desde abajo hacia arriba** plegando con la Piedra Única (última terraza → equivalente → sumar el tramo → equivalente con la anterior → …), anota en la **página de predicción** de la Bitácora cuánto empuje llega a la terraza más baja, y recién entonces abre el agua. Los valores exactos de piedras se fijan en build con la restricción de enteros y al menos dos configuraciones válidas; objetivo canónico propuesto: «a la última terraza debe llegar un cuarto del empuje del manantial».

**Regla de reuso:** cero piezas nuevas de banco. La única novedad es el **modo brazos de Ohm** y la **página de predicción** de la Bitácora. La unidad es topología + método.

### A.4. Misconcepciones reales que la unidad ataca

| Misconcepción documentada | Dónde se desmiente jugando |
|---|---|
| «La tensión se gasta como la corriente» (confunden V con I) | Ohm con brazos abiertos: el empuje SÍ cae por escalones — y el río sigue siendo el mismo en toda la fila (U2 reusada como contraste) |
| «La fuente da siempre la misma corriente» | la Piedra Única: cambiar la red cambia el río de la fuente; la fuente fija el empuje, no el río |
| «Cada componente es independiente» | tocar una piedra de la Escalera mueve TODAS las agujas del valle |
| «No se puede saber sin probar» | la página de predicción: el jugador calcula, después mide, y la vuelta cierra exacta |

### A.5. Personajes

- **La guardiana de las Terrazas** *(personaje nuevo — propuesta de nombre: **Maesa Vega**; habitante de Ohmdal, puede llevar nombre como Edda y Lumen)* — vieja, precisa, paralizada por respeto: sabe que todo está conectado (¡su intuición es correcta!) y por eso no toca nada. Su arco es del miedo reverencial al cálculo: no «animarse», sino **saber antes de tocar**. Es la encarnación de la misconcepción meta de la unidad: la red como misterio intocable.
- **Edda** — su arco de enseñar culmina: la página de predicción es idea SUYA («si de verdad lo entendimos, tendríamos que poder decirlo antes de verlo»). Edda inventa, diegéticamente, el examen honesto: predecir no para aprobar, sino para saber si entendiste.
- **Maese Lumen** — beat de comedia y de cierre de arco: intenta predecir con su vieja liturgia («el río preferirá el camino consagrado») y falla; predice con la cuenta y acierta. Su frase: «La cuenta le gana al rezo. Otra vez. Empiezo a tomármelo personal.»
- **Ohm** — modo brazos. Y un (1) beat mudo: en la terraza más baja, frente al lago, se queda mirando el Faro apagado un segundo de más. No dice nada. (Plantado para U5/Empalme; la reserva no se gasta.)
- **La Consejera** — opcional en esta unidad (cameo): trae el inventario de jornales de la U3 y pregunta cuánto costará regar el valle. Si aparece, una escena, no más.

### A.6. Estado de implementación

Sin construir. Patrón U1/U2: salas top-down + banco + Bitácora. Lo nuevo: modo brazos de Ohm (medición entre dos puntos en la vista de banco), página de predicción en la Bitácora (input numérico del jugador + comparación con lo medido), y el mapa de las Terrazas (2–3 salas en pendiente + el evento mayor). 4 puzzles, 4 entradas de Bitácora.

---

## 1. Resumen narrativo

La Forjadora presentó el problema en el cierre de la U3: el acueducto que riega el valle no se reparte desde que se fueron los Maestros. En las Terrazas espera Maesa Vega, que conoce cada canal de memoria y no ha movido una piedra en treinta años: «si toco acá, cambia allá, y nadie me sabe decir cuánto».

Primer acto (los escalones): Ohm estrena los brazos. Caminando una vuelta completa del canal alto, el empuje sube en el manantial y baja escalón a escalón hasta volver a cero, **exacto**. La vuelta cierra. Vega, que lo vio mil veces, lo entiende por primera vez: el acueducto no es un misterio — es una cuenta que siempre cerró sola.

Segundo acto (el reparto justo): dos terrazas, dos necesidades. El reparto es proporción de piedras, no tamaño — y hay dos soluciones válidas que difieren en el peaje (U3 viva). Vega elige la de piedras grandes «porque el valle paga menos», y al elegir por una razón medible, toca una piedra por primera vez en treinta años.

Tercer acto (la Piedra Única): el truco de los Maestros, grabado en un mural del acueducto: una maraña y una piedra sola con el signo «=». Toda red puede esconderse en una piedra. Ohm no distingue una de otra — y si Ohm no distingue, el río tampoco.

Evento mayor (la Escalera): el acueducto completo, tres etapas, el valle entero esperando. Edda propone lo nunca hecho: decir el número ANTES de abrir el agua. El jugador pliega la Escalera desde abajo con la Piedra Única, anota su predicción en la Bitácora, y abre el manantial. Si acertó: el valle se riega y la Bitácora estampa «PREDICHO Y MEDIDO: IGUALES». Si no: nada se rompe — se mide, se compara, se entiende dónde se torció la cuenta, y se vuelve a predecir. **El error es información, también en el papel.**

Cierre: el valle verde encendido al atardecer (la restauración más serena del juego: no luces — riego). Vega ya no custodia el acueducto: lo **opera**. Gancho a la U5: en la terraza más baja, junto al lago, el viejo **Faro** apagado. Vega: «Parpadeaba, ¿saben? No alumbraba fijo como una lámpara: latía. Nadie supo nunca con qué corazón.»

---

## 2. Estructura de niveles (resumen — guion fino antes del build)

| Nivel | Mapa | Función | Duración |
|---|---|---|---|
| 0 | Aula de Electrónica (reuso) | proyector módulo 4: «LA VUELTA COMPLETA. Lo que sube, baja.» | 2 min |
| 1 | Canal alto de las Terrazas | Vega; **Puzzle 1: los escalones** (Ohm estrena brazos) | 5–6 min |
| 2 | Terrazas medias | **Puzzle 2: el reparto justo** | 6–7 min |
| 3 | El mural de los Maestros | **Puzzle 3: la Piedra Única** | 5–7 min |
| 4 | El acueducto completo | **Puzzle 4 (evento mayor): la Escalera** con página de predicción | 9–12 min |
| 5 | Cierre: el valle regado | atardecer, Vega operadora, gancho del Faro | 3–4 min |

**Beats de diálogo clave** (a desarrollar):

- Vega, presentación: «Treinta años sin mover una piedra. No por miedo. Por respeto. …Bueno. Un poco por miedo.»
- Ohm, primera vuelta cerrada: «Subidas: dieciséis. Bajadas: dieciséis. Deuda de la vuelta: cero. Siempre cero.»
- Edda, inventando la predicción: «Medir después es mirar. Decirlo antes — eso es entender. Quiero que lo digamos antes.»
- Lumen, tras acertar su predicción: «La cuenta le gana al rezo. Otra vez. Empiezo a tomármelo personal.»
- Vega, cierre: «Toqué una piedra y el valle no se murió. Se ordenó. Los Maestros no eran magos: eran prolijos.»

---

## 3. Entradas de Bitácora de la Unidad 4

1. **«Los escalones»** — vivencial: el empuje cae piedra a piedra; la vuelta completa siempre cierra en cero. Formal: **la Regla de la Vuelta** (ley de tensiones de Kirchhoff). Nota al pie: *«El mismo apellido de la regla del cruce. Kirchhoff tenía dos reglas y ningún apuro.»*
2. **«El reparto del empuje»** — vivencial: las dos terrazas, la proporción 2:1, las dos soluciones (y cuál pagaba menos peaje). Formal: **divisor de tensión** — cada piedra cobra empuje en proporción a su freno. **Error común:** creer que la piedra grande «aguanta» y la chica «sufre»: ninguna sufre — cobran proporcional.
3. **«La Piedra Única»** — vivencial: la red que Ohm no pudo distinguir de una piedra. Formal: **resistencia equivalente**; en fila se suman, en ramales se achican (dicho con los casos vividos, no con la fórmula de paralelo). ✎ *Si toda red puede ser una sola piedra… ¿qué piedra es tu casa entera vista desde el medidor de la entrada?*
4. **«La Escalera»** (formal, tras el evento mayor) — la entrada mayor: el método de plegado etapa por etapa, el dibujo de la Escalera del valle, y la **página de predicción** estrenada: lo esperado, lo medido, y la palabra IGUALES. Cierre: *«Hoy la Bitácora dejó de ser un diario. Ahora también es un mapa de lo que va a pasar.»*

---

## 4. Flags de la unidad

```txt
playedUnit4Intro
metVega
solvedVoltageSteps
solvedFairSplit
solvedSingleStone
predictionAttempted     (hizo al menos una predicción, acertada o no)
predictionExact         (la primera predicción fue exacta — para sabor, no para gate)
solvedLadder
valleyRestored
learnedKVL
unit4Completed
```

---

## 5. Criterios de aceptación

El jugador puede decir, sin clase previa:

- «El empuje baja por escalones; en toda vuelta completa, lo que sube baja.»
- «En una fila, cada piedra cobra empuje según su proporción.»
- «Una red entera se puede mirar como una sola piedra, y el río no nota la diferencia.»
- «Puedo decir cuánto va a marcar la aguja ANTES de conectar — y verificarlo.»

Y recién después leer: *eso se llama ley de tensiones de Kirchhoff, divisor de tensión y resistencia equivalente.*

---

## 6. Notas de coherencia y pendientes

1. **Nombre de Vega** (propuesta: Maesa Vega) — misma decisión pendiente que la Forjadora (U3 §6.1): los habitantes de Ohmdal sí llevan nombre.
2. **La aritmética de la Escalera** es la deuda técnica de diseño más delicada del arco: fijar valores en build con enteros en TODOS los nodos y dos configuraciones válidas. Si no se logra con las piedras 1/2/4/8, considerar permitir filas de piedras como valores compuestos (ya canónico desde U3).
3. **La página de predicción** es una pieza de UI nueva de la Bitácora — diseñarla reutilizable: U5 y el Arco II la van a querer.
4. **El modo brazos de Ohm** debe nacer acá y quedar disponible en todos los bancos futuros (y en modo práctica de los viejos).
5. **El cameo de la Consejera** es opcional: decidir según ritmo (la unidad ya tiene personaje nuevo).
