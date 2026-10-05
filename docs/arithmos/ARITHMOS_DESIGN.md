# Arithmos — diseño vigente

Estado: **PROPUESTA de esta misión** (no canon ratificado). Gobierna la implementación
en `experiments/arithmos/`. El contrato está en [ARITHMOS_MASTER.md](ARITHMOS_MASTER.md).

## Diferencias con el material anterior

| Antes | Ahora | Motivo |
|---|---|---|
| `docs/20-worlds/arithmos/*` y `src/experiences/arithmos/*` (recuperables en `b4bd652`): puzzle 3D isométrico, verbo TRANSFORMAR, barquero Briz, ballena-ciudad, seis restauraciones de cantidad/razón | Aventura gráfica 2D de tiza sobre pizarrón verde, verbo COMPRENDER, acompañante Punto | El contrato maestro reemplaza género, ritmo y estética incompatibles |
| Stack Three.js + TypeScript del harness retirado | HTML + módulos ES + Canvas 2D + un compuesto WebGL; sin motor ni build | Decisión propia (Manuel pidió no heredar decisiones técnicas del repo) |
| — | Se conservan: el canon de `LORE.md` (Arithmos = reconocer equivalencias entre representaciones; su fractura es pérdida de esa capacidad), la Bitácora, el Instituto, y la entrada que ya muestra la escuela: "La tiza traza una puerta. Quien la cruza se vuelve parte del dibujo." | Preservar el canon de Roxana |
| Ideas que siguen valiendo del intento anterior | Aceptar cualquier configuración válida, no una secuencia prevista; "cambia la forma, se conserva una propiedad" | Compatible con el contrato |

## Premisa del mundo (propuesta)

Arithmos es un mundo dibujado en el pizarrón del Taller de Matemática. Sus habitantes son
dibujos: existen mientras sus trazos signifiquen algo para alguien. Durante años se
escribió cada vez más rápido: "pasa restando", "se tacha", "se baja". Las abreviaturas
sobrevivieron a lo que abreviaban. **Lo que nadie entiende, el borrador se lo lleva.**
La Marea —la pasada del borrador— no es una villana: es lo que le pasa a un pizarrón
sin nadie que piense en él. Lo comprendido resiste: queda tenue, pero legible.

El Instituto comparte la responsabilidad (cuarenta años sin docente en ese taller), igual
que en Ohmdal; no hay conspiración.

Pregunta dramática (propuesta creativa, no canon): **¿qué puede cambiar sin dejar de ser lo mismo?**
Responde a la vez la matemática (una cantidad reordenada, una ecuación transformada, una
función reescrita) y el acompañante (Punto cambia y sigue siendo Punto).

## Personajes

**Estudiante (vos).** Figura de palitos con una tiza en la mano. Es el único que puede
*trazar*: marcar, unir, escribir. Habla poco, piensa en voz baja (texto en cursiva, sin
rótulo). Actuación: anticipación antes de cada gesto, peso al agacharse, mirada dirigida
(dos puntos en la cabeza), pausas.

**Punto.** Una marca de tiza amarilla con un anillo tenue (rasgo permanente en todos sus
estados). Curioso, impaciente, tímido al principio, valiente cuando alguien depende de él.
No es el cero ni "vale" nada: es alguien. Se equivoca de verdad (cree que la fila más
larga tiene más; cuenta los signos de un numeral como si fueran cosas).

Evolución: cambia lo que percibe y cómo se expresa, no su tamaño.

| Estado | Percibe | Se expresa | Se relaciona |
|---|---|---|---|
| Punto (cap. 1) | individuos: "este", "ese" | movimiento, ritmo, sonido | huye o se acerca |
| Punto que marca (fin cap. 1) | colecciones: "tantos como" | deja marcas propias | registra para otros |
| Punto que escribe (cap. 2+) | grupos y posiciones | numerales y palabras cortas en tiza, letra que mejora | discute |
| Trazo (cap. 3+) | dirección, distancia, sentido | deja estela, señala hacia | acompaña recorridos |
| Plano / curva (caps. 7–11) | dependencias, cambio | dibuja relaciones | anticipa con el jugador |

El anillo amarillo y el ritmo de su "voz" (tres notas ascendentes) lo identifican siempre.

**La Ronda.** Doce puntos blancos que bailan en círculo; la familia de Punto. Cada uno
tiene un rasgo mínimo (tamaño, ritmo de parpadeo). Lino es el más chico.

## Recorrido (propuesta; dependencia conceptual, no cronología histórica)

| Cap. | Título de trabajo | Cobertura | Estado |
|---|---|---|---|
| 1 | ¿Están todos? | A: correspondencia uno a uno, cardinalidad, más/menos por correspondencia, conservación, registro, número vs numeral | en producción |
| 2 | Demasiados para marcar | A: agrupación, unidad, valor posicional, cero; B: suma/resta con significado | pendiente |
| 3 | La línea | B: recta, orden, distancia, negativos, opuestos, valor absoluto; multiplicación como grupos y escala; división como reparto y medida | pendiente |
| 4 | Partes de algo | C: fracciones, equivalencia, decimales, %, razón, proporción, unidades; inconmensurables, reales; exacto vs aproximado | pendiente |
| 5 | Lo que no se ve | D: patrón, generalización, incógnita/variable/parámetro; expresión, identidad, ecuación; **"pasa sumando"**; desigualdades; sistemas | pendiente |
| 6 | Crecer | E: potencias, raíces, notación científica, polinomios, factorización, cuadráticas, expresiones racionales, sucesiones, logaritmos | pendiente |
| 7 | Formas | F: ángulos, congruencia, semejanza, Pitágoras (alcance de la prueba), perímetro, área, volumen, escala, coordenadas | pendiente |
| 8 | Depende | G: relación vs función, dominio, imagen, tablas, gráficos, expresiones | pendiente |
| 9 | Vueltas y flechas | H: trigonometría, radianes, periodicidad, vectores, complejos como rotación, sistemas y matrices | pendiente |
| 10 | Lo que pasa a veces | I: estadística, dispersión, lectura crítica de gráficos, conteo, probabilidad, correlación vs causa | pendiente |
| 11 | Anticipar | J: familias de funciones, parámetros, composición, inversa, tasa de cambio, límite/derivada/acumulación en su nivel | pendiente |

## Capítulo 1 — ¿Están todos? (guion implementado)

Idea central: **dos colecciones tienen la misma cantidad si se pueden emparejar sin que
sobre nada; el número es lo que comparten todas las colecciones emparejables; un numeral
es su nombre, no una colección.** Conecta con la pregunta dramática: se puede cambiar el
orden, la forma, la distancia; lo que no cambia es el número.

| # | Escena | Propósito dramático | Decisión del jugador | Consecuencia perceptible |
|---|---|---|---|---|
| 1.1 | La puerta | Umbral; volverse dibujo | Cruzar la puerta trazada | El estudiante se dibuja a sí mismo trazo a trazo, se mira las manos |
| 1.2 | Alguien | Conocer a Punto; establecer timidez y curiosidad | Acercarse o quedarse quieto | Si se acerca, Punto se esconde y vuelve sólo si esperás; si esperás, se acerca y te rodea |
| 1.3 | La Ronda | Lo que Punto quiere; amenaza de la Marea | Anotar a la Ronda: tocar cada punto deja una marca en la piedra | Cada toque traza una línea punto→marca; un punto ya anotado lo dice; la marca queda |
| 1.4 | La Marea | Pérdida | (cinemática, rejugable) | Todo se borra salvo la piedra con marcas: lo comprendido resiste |
| 1.5 | ¿Están todos? | Angustia de Punto; los puntos vuelven revueltos y no se dejan contar | Intentar contar (falla con dignidad) o emparejar marcas con puntos; deshacer; comprobar | Comprobar recorre cada par; un punto con dos líneas se señala como inválido; sobra una marca: falta alguien |
| 1.6 | Quién | Las marcas dicen cuántos, no quién; Punto sabe quién | Interpretar la marca sobrante (falta uno / me equivoqué / sobra) y buscar en tres lugares | Lino aparece medio borrado en una mancha; el estudiante lo repasa con tiza |
| 1.7 | Todos | Reencuentro | Emparejar la última marca | La Ronda vuelve a bailar (rejugable) |
| 1.8 | Las gradas | Transferencia: estructura distinta; Punto se equivoca | Predecir si alcanzan los asientos (fila larga vs gradas compactas); comprobar emparejando | Sobra un asiento aunque la fila de asientos es más corta: es para vos |
| 1.9 | El nombre | Revelación número/numeral; evolución de Punto | Punto hace su primera marca; el estudiante escribe 14; intentar emparejar "14" con los puntos | Sólo hay dos signos: el numeral no es una colección, es un nombre; Punto pregunta cómo dos signos alcanzan para catorce → cap. 2 |

Errores con consecuencia comprensible: emparejar un punto con dos marcas (se detecta al
comprobar y se explica), predecir mal en las gradas (se comprueba sin castigo), leer la
marca sobrante como error de anotación (Punto muestra que alguien falta de verdad).

Ayudas graduadas (opcionales, botón "?"): 1) reformular la pregunta, 2) señalar el rasgo
relevante, 3) demostrar un paso. Usar ayuda se registra como evidencia, no castiga.

## Interfaz

Sin HUD permanente. Un ícono de tiza (≡) abre la pausa: continuar, volver a ver,
historial de diálogo, Bitácora, opciones (tamaño de texto, lectura limpia, velocidad y
avance automático, describir acciones, movimiento reducido, volúmenes), salir.
Los objetos interactivos son botones accesibles superpuestos al dibujo (teclado, táctil,
lector de pantalla). Ninguna información depende sólo del color (el amarillo de Punto se
acompaña del anillo; los pares se ven por líneas, no por color).
