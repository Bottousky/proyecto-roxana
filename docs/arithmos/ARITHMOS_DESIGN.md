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
| 1.1 | La puerta | Umbral; volverse dibujo | Cruzar la puerta trazada | El estudiante se dibuja trazo a trazo, se mira las manos |
| 1.2 | Alguien | Conocer a Punto; timidez y curiosidad | Acercarse o quedarse quieto | Si se acerca, Punto se esconde; si espera, se acerca, lo rodea y toca la tiza |
| 1.3 | La Ronda | Lo que Punto quiere; amenaza de la Marea | Contar (falla porque giran y Punto no conoce las palabras) o anotar: tocar cada punto deja su marca | Cada toque traza una línea punto→marca; uno ya anotado no se repite |
| 1.4 | La Marea | Pérdida | (cinemática, rejugable) | Todo se borra salvo la piedra con marcas |
| 1.5 | ¿Están todos? | Angustia de Punto; vuelven revueltos | Emparejar marcas con puntos; deshacer; comprobar | Comprobar recorre cada par; doble = inválido; sobras de ambos lados = no se sabe; sobra una marca |
| 1.6 | Quién | Las marcas dicen cuántos, no quién | Interpretar la marca sola | Sólo "falta uno" se sostiene con la evidencia; Punto sabe quién |
| 1.7 | La búsqueda | Buscar al más chico | Tres lugares en cualquier orden; repasarlo con tiza | Lino vuelve a encenderse |
| 1.8 | Todos | Reencuentro | Unir la última marca | Recorrido con 12 notas; la Ronda baila (rejugable) |
| 1.9 | Las gradas | Transferencia; Punto se equivoca | Predecir (y justificar), sentar a cada uno donde quiera, interpretar el asiento libre, decidir si apretarlos cambia algo | La fila larga no tenía más: sobra un asiento (para vos); juntos o separados son los mismos |
| 1.10 | El nombre | Revelación número/numeral; evolución de Punto | Contar las marcas de Punto (una palabra por marca); explicarle qué es "14" | Punto marca una vez por cada visita; la última palabra dice cuántos; "14" y "catorce" nombran el número; Punto pregunta qué hace un 1 en el nombre de catorce (rejugable) |

Errores con consecuencia comprensible: emparejar un punto con dos marcas o una marca con dos
puntos (se detecta al comprobar y se explica), comprobar antes de terminar, predecir mal en las
gradas (se comprueba sin castigo), leer mal el asiento libre, creer que apretar la fila cambia
cuántos son, contar dos veces una marca, leer la marca sobrante como error de anotación.

Ayudas graduadas (opcionales, botón "?"): 1) reformular la pregunta, 2) señalar el rasgo
relevante, 3) demostrar un paso. Usar ayuda se registra como evidencia, no castiga.

## Capítulo 2 — Demasiados para marcar (diseño, no implementado)

Pregunta de entrada: Punto rodeó el "1" de "14": ¿por qué un 1 si no hay uno solo de nada?
Idea central: **en un numeral, el lugar dice el tamaño del grupo; el cero guarda un lugar
vacío; "me llevo uno" es atar diez y pasarlos al cuarto de al lado.** Las marcas de
conteo no escalan; agrupar sí. Restar también es emparejar, y emparejar atados es emparejar
diez a la vez.

Personaje nuevo: **Mara**, atadora del depósito. Ata palitos de a diez "porque así se hizo
siempre". La Marea le borró los ceros del registro y ella cree que "el cero no es nada, se
puede saltear". Su comunidad cree tener 32 de algo que en realidad son 302.

| # | Escena | Idea | Decisión | Consecuencia |
|---|---|---|---|---|
| 2.1 | A la mañana | Punto ya marca: marca todo (incluida tu cabeza) | — (respiro, humor) | Punto vuelve a rodear el "1" |
| 2.2 | La bandada | Las marcas no escalan | Intentar comparar dos hileras de marcas larguísimas | Imposible de un vistazo: hace falta agrupar |
| 2.3 | Mara | Procedimiento sin explicación | Preguntar o mirar | Mara ata de a diez sin saber por qué |
| 2.4 | Atados | Agrupar; la unidad puede ser un atado | Rodear grupos (Punto prueba de a cinco: válido para contar, no para el registro de Mara) | 3 atados y 7 sueltos = 37; el "1" de "14" es un atado |
| 2.5 | El depósito | Valor posicional; canje | Guardar entregas con "a lo sumo 9 por cuarto" | Diez sueltos se atan y pasan: "me llevo uno" tiene cuerpo |
| 2.6 | El cero que falta | Cero como lugar vacío | Escribir lo que hay (3 · vacío · 2): "32", "3 2", "302" | Punto carga cada escritura en el depósito: sólo "302" coincide; el cero resiste a la Marea |
| 2.7 | ¿Cuántos más? | Resta como comparación por emparejamiento | Emparejar atado con atado, suelto con suelto; desatar cuando no alcanza | La sobra es la diferencia; "pedir prestado" = desatar |
| 2.8 | Más cuartos | Transferencia: generalizar la regla | Guardar una entrega que llena el cuarto de los cien | Hace falta inventar un cuarto nuevo |
| 2.9 | Lo que vale el lugar | Cierre; Punto escribe su primer numeral | Explicarle a Mara con atados | Mara corrige su registro; gancho: "le debo tres atados al vecino" → cap. 3 |

Límites a declarar: diez es una convención (otras culturas agruparon de otra manera —ver
fuentes: sexagesimal babilónico, vigesimal maya—, sin presentar el orden del juego como
historia); el cero como número (cardinal de "ninguno") se conecta con el capítulo 1.

## Capítulo 3 — Menos que nada (diseño, en producción)

Ajuste del recorrido: el bloque B se divide. Cap. 3 = negativos, orden, distancia, |x|, suma y
resta como movimiento; cap. 4 = multiplicación y división (grupos, escala, reparto, medida,
propiedades). Los capítulos siguientes corren un lugar (fracciones 5, ecuaciones 6…).

Pregunta de entrada: Curva le debe tres atados a Mara y no tiene ninguno. ¿Cómo se anota
"menos que nada"? Idea central: **un número con signo dice cuánto y hacia qué lado; tener y
deber se anulan de a pares; en la recta, el orden es "más a la derecha", y la distancia no tiene
signo.**

Representaciones: (1) **palitos y deudas**: una deuda se dibuja como un palito hueco, punteado
(no sólo de otro color); un palito y una deuda juntos se borran: valen cero. (2) **La línea**: una
recta en el suelo con el 0 en la puerta del depósito; cada familia se para en su saldo.

| # | Escena | Idea | Decisión | Consecuencia |
|---|---|---|---|---|
| 3.1 | Lo que se debe | Hace falta un signo | Cómo anotar la deuda: "0", "3", una palabra, una marca nueva | "0" borra la deuda; "3" la convierte en tener; Punto propone una rayita delante: −3 (su primer signo) |
| 3.2 | Pares que se anulan | Suma de enteros como emparejar | Juntar lo que tiene y lo que debe Curva; emparejar palito con deuda | Cada par se borra; lo que sobra es el saldo (−1, +2…); emparejar dos palitos no anula nada |
| 3.3 | La línea | Orden con negativos | Ubicar a cada familia en la línea según su saldo; responder quién tiene menos | Si se ubica −5 a la derecha de −2, Mara compara las deudas y la contradicción se ve |
| 3.4 | Lejos y cerca | Distancia y valor absoluto | Contar pasos entre dos familias; cuánto le falta a cada una para llegar a 0 | La distancia de +4 a −3 son 7 pasos; −3 y +3 quedan igual de lejos del 0 |
| 3.5 | Perdonar una deuda | Restar un negativo | Mara perdona dos deudas a quien no tiene deudas sueltas: hay que agregar pares cero primero | Quitar deudas mueve hacia la derecha: −1 − (−2) = +1 |
| 3.6 | El pozo | Transferencia vertical | Punto cae a un pozo (−3) y sube 5 | La misma línea, parada: termina en +2 |
| 3.7 | Hacia | Cierre; Punto se vuelve trazo | Punto deja estela al moverse: tiene dirección | Bitácora; gancho al cap. 4: "¿y si todos deben lo mismo, tres veces?" |

Errores con consecuencia: anotar la deuda como 0 o como 3; emparejar palito con palito; creer
que −5 es más que −2; restar una deuda que no está sin agregar pares. Límites a declarar: "debajo
de cero" y "deber" son dos lecturas del mismo número, no dos números distintos; el signo menos
también significa "restar" (se distinguen en la notación con paréntesis).

Historia (fuentes.md, certeza alta): los signos "+" y "−" aparecen impresos en Widmann (1489)
marcando exceso y faltante en problemas de comercio, no como operaciones; Brahmagupta (628)
da reglas con "fortunas" y "deudas". Mencionarlo sólo en la Bitácora, como dato, no como origen.

## Capítulo 6 (ecuaciones) — núcleo de "pasa sumando" (diseño conceptual, no implementado)

Representación elegida (requiere el cap. 3: recta con negativos): **una ecuación son dos
marcadores sobre la misma recta**, uno por miembro, que dependen de una x desconocida.
Resolver es buscar dónde coinciden. Una transformación se aplica a **los dos marcadores a la
vez**: "+3" los corre 3 hacia la derecha; si coincidían, siguen coincidiendo.

- x − 3 = 5 → aplicar "+3" a ambos miembros: x − 3 + 3 = 5 + 3 → el miembro izquierdo se
  **simplifica** porque x − 3 + 3 = x para toda x (se ve: ir 3 a la izquierda y volver 3 no
  mueve) → x = 8. "Pasa sumando" queda como abreviatura de esos dos pasos, desplegable.
- Aplicar algo a un solo miembro separa los marcadores: transformación inválida a la vista.
- Caminos alternativos válidos: restar 5 a ambos (x − 8 = 0), luego sumar 8. Se evalúa la
  equivalencia, no una secuencia de clics.
- **Por qué se conservan las soluciones:** cada paso se puede deshacer (sumar 3 se deshace
  restando 3). Dicho con el cap. 1: la transformación es **uno a uno** sobre la recta; si dos
  valores distintos no pueden ir a parar al mismo lugar, no aparecen ni se pierden soluciones.
- **Cuándo no:** multiplicar por 0 aplasta toda la recta en un punto (todo "coincide": aparecen
  soluciones falsas; no se puede deshacer). Elevar al cuadrado dobla la recta (−a y a caen
  juntos): puede introducir soluciones; hay que verificar. Dividir por una expresión que puede
  valer 0 no está definido en esos valores: puede perder soluciones (x² = x ÷ x → x = 1 pierde
  x = 0). Multiplicar una desigualdad por un negativo refleja la recta: el orden se invierte.
- Detección de transformaciones inválidas: un habitante "despeja" de memoria ("el 3 pasa
  restando", "pasa dividiendo" un término que sumaba); el jugador lo comprueba sustituyendo un
  valor en la ecuación original y en la transformada.
- Transferencia con otra estructura: 2x + 1 = 7 (dos pasos, orden de deshacer), 3 = x/4 (la
  incógnita a la derecha), y una desigualdad −2x < 6.
- Ancla histórica (fuentes.md, certeza alta): al-Khwārizmī, *al-jabr* = restituir lo restado
  sumándolo en ambos miembros; *al-muqābala* = cancelar términos iguales a ambos lados.
  Presentarlo como dato documentado, no como origen único.

## Interfaz

Sin HUD permanente. Un ícono de tiza (≡) abre la pausa: continuar, volver a ver,
historial de diálogo, Bitácora, opciones (tamaño de texto, lectura limpia, velocidad y
avance automático, describir acciones, movimiento reducido, volúmenes), salir.
Los objetos interactivos son botones accesibles superpuestos al dibujo (teclado, táctil,
lector de pantalla). Ninguna información depende sólo del color (el amarillo de Punto se
acompaña del anillo; los pares se ven por líneas, no por color).
