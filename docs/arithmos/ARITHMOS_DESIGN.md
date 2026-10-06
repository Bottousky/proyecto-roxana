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
| 1 | ¿Están todos? | A: correspondencia uno a uno, cardinalidad, más/menos, conservación, contar, número vs numeral | jugable, revisado (1.ª ronda) |
| 2 | Demasiados para marcar | A: agrupación, unidad, valor posicional, cero; B: suma con canje, resta como comparación | jugable |
| 3 | Menos que nada | B: signo, negativos, opuestos, orden, distancia, valor absoluto, suma y resta de enteros | jugable |
| 4 | Veces | B: multiplicación como grupos y escala, división como reparto y medida, propiedades | implementado, en prueba |
| 5 | Partes de algo | C: fracciones, equivalencia, decimales, %, razón, proporción, unidades; inconmensurables, reales; exacto vs aproximado | pendiente |
| 6 | Lo que no se ve | D: patrón, generalización, incógnita/variable/parámetro; expresión, identidad, ecuación; **"pasa sumando"**; desigualdades; sistemas | pendiente |
| 7 | Crecer | E: potencias, raíces, notación científica, polinomios, factorización, cuadráticas, expresiones racionales, sucesiones, logaritmos | pendiente |
| 8 | Formas | F: ángulos, congruencia, semejanza, Pitágoras (alcance de la prueba), perímetro, área, volumen, escala, coordenadas | pendiente |
| 9 | Depende | G: relación vs función, dominio, imagen, tablas, gráficos, expresiones | pendiente |
| 10 | Vueltas y flechas | H: trigonometría, radianes, periodicidad, vectores, complejos como rotación, sistemas y matrices | pendiente |
| 11 | Lo que pasa a veces | I: estadística, dispersión, lectura crítica de gráficos, conteo, probabilidad, correlación vs causa | pendiente |
| 12 | Anticipar | J: familias de funciones, parámetros, composición, inversa, tasa de cambio, límite/derivada/acumulación en su nivel | pendiente |

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

Representaciones: (1) **palitos y deudas**: una deuda se dibuja como un atado punteado (hueco), punteado
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

## Capítulo 4 — Veces (implementado, en prueba)

Lugar: las Terrazas, una ladera en cuatro escalones; una familia por escalón (Peldaño, Rampa,
Cornisa, Balcón: sombrero y cabeza propia). Al pie, la pizarra de Mara y una piedra con un signo
casi borrado ("4 × 3") que nadie entiende; cuando se entiende, se vuelve nítido (lo comprendido
resiste). Pregunta de entrada (gancho del cap. 3): cuatro familias deben tres atados cada una.

| # | Escena | Idea | Decisión | Consecuencia |
|---|---|---|---|---|
| 4.1 | Lo que deben las Terrazas | Grupos iguales | Anticipar el total (Punto escribe 4 + 3 = 7); bajar las deudas de a una familia | Cada familia es una fila; al lado, 3, 6, 9, 12; 4 × 3 = 12 y 4 × (−3) = −12; el signo de la piedra se aclara |
| 4.2 | Dar vuelta | Conmutativa | ¿Girar cambia el total?; girar; ¿hay que contar 9 × 4 de las dos maneras? | Tres filas de cuatro: 12; 4 × 3 = 3 × 4; si se quiere contar dos veces, Mara lo frena |
| 4.3 | Estirar la línea (momento) | Escala; ×1; ×(−1) como media vuelta | Anticipar −3 × 2; aplicar × 2, × (−1) dos veces | −6: más lejos del cero pero menor (Punto corrige "× 2 → más"); × 1 no mueve; dos medias vueltas: (−1) × (−1) = 1 |
| 4.4 | Repartir | División como reparto | Anticipar; repartir de a uno, por vueltas; qué hacer con los 2 que sobran | Dar dos veces a la misma familia provoca protesta; 14 = 4 × 3 + 2; partirlos queda como pregunta (cap. 5) |
| 4.5 | Medir | División como medida | Anticipar bolsas de 3; llenar; bolsas de 4 | 4 bolsas; 12 ÷ 3 = 4 porque 4 × 3 = 12; 3 bolsas de 4 |
| 4.6 | Entre nadie | División por cero | Repartir entre cero familias; llenar bolsas de cero; qué número por 0 da 6 | Punto no tiene a quién dar; el montón no baja; todo por 0 da 0: 6 ÷ 0 no tiene respuesta |
| 4.7 | Partir el rectángulo (momento) | Distributiva | ¿Cambia el total según dónde se corte?; cortar en dos lugares; 4 × 13 | 20 las dos veces; 4 × 5 = 4 × c + 4 × (5 − c); 4 × 13 = 40 + 12; gancho: los 2 atados que sobraron, entre 4 |

Límites declarados: la multiplicación no "siempre agranda" (× 1, × −1, y luego fracciones); el
reflejo explica (−1)(−1) = 1 como media vuelta, sin regla mágica; el resto depende de lo que se
pregunta (atados enteros); 0 ÷ 0 tampoco tiene un resultado (en la Bitácora). Dato histórico:
Brahmagupta (628) operó con fortunas y deudas y sostuvo 0 ÷ 0 = 0 (fuentes.md §8, certeza alta).

## Capítulo 5 — Partes de algo (diseño, no implementado)

Pregunta de entrada (gancho del cap. 4): sobraron 2 atados de la cosecha y son 4 familias.
Idea central: **una fracción es una medida hecha con partes iguales de una unidad elegida; el mismo
número tiene muchos nombres (2/4 = 1/2 = 0,5 = 50 %); entre dos números siempre hay lugar en la
recta; y hay medidas que ninguna partición alcanza exactamente.**

Representaciones: (1) la **barra de tiza nueva** (unidad continua, no se desata) que se parte
con cortes en partes iguales; el atado sirve primero para ver que "medio" depende de la unidad; (2) la **recta** de los caps. 3–4, ahora con el segmento de 0 a 1 subdividido; (3) el
**depósito** del cap. 2 con un cuarto nuevo a la derecha de los sueltos: el de los décimos.

| # | Escena | Idea | Decisión | Consecuencia |
|---|---|---|---|---|
| 5.1 | Medio atado | Fracción de una unidad agrupada; la unidad importa | Repartir los 2 atados que sobraron entre 4 (desatar, partir cada uno por la mitad, o dárselos a dos); ¿qué es más, medio atado o medio montón de seis? | Desatar da 5 palitos a cada una; partir por la mitad, medio atado: lo mismo con dos nombres (1/2 atado = 5 palitos); medio montón son 3 atados: "medio" no dice cuánto sin decir de qué |
| 5.2 | Barras enteras | Partes iguales; n/d como "n partes de las que entran d en la unidad" | 3 barras de tiza nueva (no se desatan) entre 4 familias: en cuántas partes cortar cada barra; Punto corta a ojo | Las partes desparejas provocan protesta; cortando en 2 sobran mitades; en 4, 12 cuartos: 3 cada una = 3/4 de barra |
| 5.3 | Dos de cuatro | Equivalencia | ¿Quién tiene más: 2 cuartos o 1 mitad de la misma barra? ¿Cuántos sextos son medio? | Superpuestos coinciden: 2/4 = 1/2 = 3/6; mismo número, otro nombre |
| 5.4 | Entre el 0 y el 1 | Fracción como punto de la recta; densidad | Ubicar 1/2, 3/4 y 5/4; buscar un número entre 1/2 y 3/4 | El segmento unidad se subdivide; 5/4 queda pasando el 1; entre dos marcas siempre cabe otra (5/8) |
| 5.5 | Más partes, más chicas | Comparar | Punto: "1/4 > 1/3 porque 4 > 3"; comparar 2/3 y 3/4 | Las piezas lado a lado lo contradicen; doceavos: 8/12 < 9/12 |
| 5.6 | Sumar pedazos | Suma con partición común | Punto suma arriba y abajo: 1/2 + 1/3 = 2/5 | 2/5 es menos que 1/2 solo: absurdo visible; sextos: 3/6 + 2/6 = 5/6 |
| 5.7 | El cuarto de los décimos | Decimales como valor posicional | En el depósito, una barra partida en diez va a un cuarto nuevo, a la derecha, después de una coma | 2,5 = 2 + 5/10 = 2 + 1/2; 2,05 frente a 2,5 (el cero vuelve a guardar un lugar) |
| 5.8 | De cada cien | Porcentaje | ¿Qué es más: el 50 % de 80 o el 80 % de 50? | Las dos dan 40; % = "de cada cien" = centésimos |
| 5.9 | Lo que no entra justo | Exacto vs aproximado; inconmensurables (adelanto) | Medir la diagonal de la huerta cuadrada con partes del lado | Ninguna partición probada coincide; 1,4 → 1,41 → 1,414 se acercan sin llegar; se declara que la prueba de que ninguna sirve llega en el cap. 8 |

Errores con consecuencia: partes desiguales llamadas "mitad"; comparar fracciones por el
denominador solo; sumar numeradores y denominadores; leer 2,05 como 2,5; creer que un porcentaje
"es" una cantidad sin referencia. Límites a declarar: la razón y la proporción como relación entre
cantidades (C3) se tratan con funciones (cap. 9); los reales y su completitud, sólo como idea de
"medidas sin partición exacta"; π no se trata acá.

Historia (fuentes.md): verificar antes de usar fracciones egipcias o babilónicas; no afirmar
orígenes únicos.

## Capítulo 6 — Lo que no se ve (diseño, en producción)

Pregunta de entrada (gancho del cap. 5): la diagonal existe pero no se sabe escribir; antes, algo
más simple: Mara tiene una caja cerrada con atados adentro y no sabe cuántos. Idea central: **una
incógnita es un número que no se ve; una ecuación son dos miembros que dependen de ella; resolver
es encontrar dónde coinciden; transformar los dos miembros a la vez con algo que se puede deshacer
no cambia las soluciones.**

Representación: la **recta con dos marcadores**, uno por miembro. Punto se sienta sobre la recta
y hace de x: el jugador lo cambia de marca y los dos marcadores se mueven según sus expresiones.
Cuando coinciden, una raya amarilla los une. Las transformaciones son palabras para aplicar a los
dos miembros o a uno solo.

| # | Escena | Idea | Decisión | Consecuencia |
|---|---|---|---|---|
| 6.1 | La caja cerrada | Incógnita; ecuación como dos miembros | Mover a Punto (x) hasta que "lo de la caja menos 3" coincida con 5 | Los marcadores se mueven con x; coinciden sólo en x = 8 |
| 6.2 | Lo mismo a los dos lados | "Pasa sumando" como transformación de ambos miembros | Elegir qué aplicar: +3 a los dos, +3 sólo a la izquierda, −3 a los dos | +3 a los dos corre los dos marcadores: siguen coincidiendo en 8 y la izquierda queda x; a uno solo, se separan; "pasa sumando" queda como abreviatura de los dos pasos |
| 6.3 | El que despeja de memoria | Transformación inválida detectada por sustitución | Un habitante escribe x + 3 = 5 → x = 5 + 3; el jugador sustituye 8 en la original | 8 + 3 = 11, no 5: el "pasa" con el signo equivocado cambió la ecuación |
| 6.4 | Por cero | ×0 no se puede deshacer | Alguien "simplifica" multiplicando todo por 0 | 0 = 0: cualquier x coincide; soluciones falsas; no hay vuelta |
| 6.5 | Al cuadrado | Elevar al cuadrado puede agregar soluciones | x = 3 al cuadrado: ¿cuántas x cumplen x² = 9? | −3 también; hay que verificar en la original |
| 6.6 | Dividir por lo que puede ser cero | Perder soluciones | x² = x; dividir por x | Queda x = 1 y se perdió x = 0 |
| 6.7 | Al revés | Desigualdad por un negativo | −2x < 6: dividir por −2 con o sin dar vuelta | Sin dar vuelta, los valores que cumplen no coinciden (se ve en la recta) |
| 6.8 | Dos pasos | Orden de deshacer; incógnita a la derecha | 2x + 1 = 7 (¿qué se deshace primero?); 3 = x / 4 | Varios caminos válidos; se evalúa que cada paso conserve las soluciones |

Por qué se conservan las soluciones (dicho por el estudiante, no por Mara): cada paso se puede
deshacer; con el cap. 1: la transformación es uno a uno sobre la recta. Ancla histórica (fuentes.md,
certeza alta): al-Khwārizmī, *al-jabr* (restituir lo restado sumándolo en ambos miembros) y
*al-muqābala* (cancelar términos iguales a ambos lados). En la Bitácora, como dato.

## Capítulo 7 — Crecer (diseño, no implementado)

Pregunta de entrada (gancho del cap. 6): x · x = 2. Idea central: **multiplicar repetido crece
distinto que sumar repetido; cada crecimiento tiene una pregunta inversa (raíz, logaritmo); un
producto de sumas es un rectángulo partido; y "deshacer" un cuadrado tiene dos caminos.**

Representaciones: cuadrados y rectángulos de tiza con lados x y 1 (fichas de área: x², x, 1);
tablas que crecen día por día; la recta del cap. 6 para las raíces.

| # | Escena | Idea | Decisión | Consecuencia |
|---|---|---|---|---|
| 7.1 | El lado del cuadrado | Raíz como pregunta inversa del cuadrado | ¿Qué lado tiene un cuadrado de área 9? ¿y de área 2? | √9 = 3 (el lado es positivo; x² = 9 también tiene −3); √2 entre 1,41 y 1,42 |
| 7.2 | Sumar o duplicar | Crecimiento aditivo vs multiplicativo | Elegir el plan para redibujar la escalera antes que la Marea: +10 por día o ×2 por día | Al principio gana sumar; desde el día 6 (61 contra 64), duplicar; tabla día por día |
| 7.3 | Contar los factores | Potencias; exponente 0 y negativo por patrón | Seguir la tabla hacia atrás: 2³, 2², 2¹, … | Cada paso atrás divide por 2: 2⁰ = 1, 2⁻¹ = 1/2 (patrón, no regla) |
| 7.4 | Muy grande, muy chico | Notación científica | Escribir el polvo de tiza de la Marea | 3 · 10⁶ vs 3000000; comparar por el exponente; el error de contar ceros |
| 7.5 | Áreas con x | Polinomios como áreas | Armar (x + 2)(x + 3) con fichas | x² + 5x + 6: la distributiva del cap. 4, dos veces |
| 7.6 | Al revés | Factorizar como armar un rectángulo | Con x² + 5x + 6 en fichas, armar un rectángulo | (x + 2)(x + 3); con x² + 5x + 5 no cierra |
| 7.7 | Completar el cuadrado | Cuadráticas | x² + 2x = 8: completar el cuadrado con una ficha | (x + 1)² = 9 → x + 1 = 3 o −3 → x = 2 o −4 (cap. 6) |
| 7.8 | ¿Cuántas veces? | Logaritmo como pregunta inversa | ¿Cuántas duplicaciones para pasar 1000? | Entre 9 y 10 (2¹⁰ = 1024); log₂ 1000 ≈ 9,97 |
| 7.9 | Donde no se puede | Expresiones racionales: restricciones | 1 ÷ (x − 2): ¿dónde no está definida? | En x = 2 (cap. 4: no se divide por cero) |

Límites a declarar: √ indica el lado positivo; potencias con exponente fraccionario y logaritmos
de otras bases, sólo mencionados; la prueba de que √2 no es una fracción queda para el cap. 8.
Historia: pendiente de fuentes (no afirmar nada sobre Napier ni Arquímedes sin verificar).

## Interfaz

Sin HUD permanente. Un ícono de tiza (≡) abre la pausa: continuar, volver a ver,
historial de diálogo, Bitácora, opciones (tamaño de texto, lectura limpia, velocidad y
avance automático, describir acciones, movimiento reducido, volúmenes), salir.
Los objetos interactivos son botones accesibles superpuestos al dibujo (teclado, táctil,
lector de pantalla). Ninguna información depende sólo del color (el amarillo de Punto se
acompaña del anillo; los pares se ven por líneas, no por color).
