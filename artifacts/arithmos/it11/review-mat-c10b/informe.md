# Revisión matemática: arreglos del cap. 10 (1505c8c) y escena nueva 7.3b «Juntar factores»

Revisé el código en `HEAD` 6e9b3f4 (ch7 y ch10 no cambiaron después de 1505c8c y c274270), las capturas
pedidas y las cuentas una por una. Los números de línea son de ese `HEAD`.

**Veredicto corto.** Los arreglos del cap. 10 están bien hechos y casi todos resuelven lo que se pidió: la cuerda
y el arco (hexágono), la prueba de sen 30°, el costado y alto² + costado² = 1 con 1,0069, la rampa de 60°, la casa
de Rampa en (3, 2), 3 + i e i · (3 + i), «en la recta» en el cap. 9, la tabla de las paralelas y la Bitácora
sin atribuir de más. Quedan **dos errores nuevos de lo que se ve o se lee**: una frase falsa sobre la ventana de
Cornisa (A1) y la barra de la tabla, que la tiza dibuja como «/» y convierte la matriz en fracciones (A2). La escena
7.3b es correcta en todas sus cuentas, y sus opciones incorrectas son errores típicos contestados en sus propios
términos. Le falta decir qué es una potencia con otra base que no sea 2 antes de usar 4⁵, 4³ y 8² (M2).

---

## ALTA

### A1. 10.4: «La ventana tenía cuatro lados» es falso: la ventana de Cornisa es una ele de seis lados

- **Dónde:** `ch10/scenes-a.js:346`. Contraste: `ch8/scenes-a.js:304` (`L` tiene seis vértices),
  `:318` («Mi ventana tiene esta forma de ele») y `:444`.
- **Qué:** la frase que reconcilia la semejanza de las rampas con el cap. 8 da una razón falsa. La ventana tenía
  seis lados (una ele: 28 × 42 de un lado y 63 × 63 del contorno). El argumento funciona igual con «más de tres
  lados», pero tal como está dice algo que no pasó.
- **Por qué importa:** es la línea que responde la objeción del cap. 8, y el jugador que la recuerda tiene la ele
  en la memoria. Una afirmación falsa sobre lo que se vio contradice el pedido de coherencia con los capítulos
  anteriores y debilita el «en un triángulo sí» que viene después.
- **Cómo comprobar:** cambiar por «La ventana era una ele, con seis lados: con más de tres lados, los ángulos no
  alcanzan». `grep -n "cuatro lados" src/ch10` no tiene que encontrar nada.

### A2. 10.7: la barra de la tabla se dibuja como «/»: en la pizarra se lee «1 1/7», «1 −1/1», «1 1/3»

- **Dónde:** `ch10/scenes-b.js:268-271` (`'1    1 | 7'`, `'1  −1 | 1'`, `'1  1 | 7'`, `'1  1 | 3'`). Captura
  `it11/c10m2-errores/023-snap-c10.pistas.png`: recortada y ampliada, el separador es una raya inclinada igual a la
  de las fracciones.
- **Qué:** la fuente de tiza dibuja `|` inclinado. Lo que queda en la pizarra es «1 1/7» (parece «uno y un
  séptimo»), «1 −1/1» y «1 1/3». En los caps. 5 y 7 las fracciones se escribieron así, en la misma pizarra
  (`ch5/scenes-b.js:136`: «2/3 = 8/12»; `ch7/scenes-b.js:139`: «2⁻¹ = 1/2»).
- **Por qué importa:** es la única forma visible de la matriz, y su lectura («la izquierda es igual en las dos
  filas y el número no», `:274`) depende de separar coeficientes de resultado. Con «/» el número de la derecha se
  lee como denominador. El lector de pantalla dice «|», pero la pantalla dice otra cosa.
- **Cómo comprobar:** dibujar el separador como trazo (una `Drawing` vertical entre columnas) o encabezar las
  columnas («a  b | suman») con una raya que la fuente dibuje derecha. Comprobarlo con una captura nueva y un
  recorte de la tabla: no debe parecer una fracción.

---

## MEDIA

### M1. Lugar contra flecha: tras separarlos en 10.5, la pizarra y 10.6 los vuelven a juntar sin decir por qué

- **Dónde:** `ch10/scenes-b.js:112` («La casa, en cambio, es un lugar»), `:113` (pizarra
  «(4, −1) + (−1, 3) = (4 + (−1), −1 + 3) = (3, 2)»), `:190` («al número que **está** un rayo arriba del cero le
  decimos i»), `:194` («La flecha (3, 1) es el número 3 + i») y Bitácora `:369` («un lugar no es una flecha … La
  flecha (3, 1) es el número 3 + i»).
- **Qué:** la suma de flechas da la flecha (3, 2), con los mismos números que el lugar donde está la casa
  (necesariamente, porque se sale del cero). Nadie dice que la flecha (3, 2) es la que va derecho del pozo a la
  casa. En 10.6, i es un lugar («está un rayo arriba del cero») y 3 + i es una flecha. La Bitácora pone en el mismo
  párrafo «un lugar no es una flecha» y «la flecha (3, 1) es el número 3 + i».
- **Por qué importa:** M9 pedía separar punto de flecha. Ahora están separados en el diálogo, pero el jugador
  atento ve «= (3, 2)» junto a la casa en (3, 2) y queda con la pregunta «¿es flecha o lugar?». Es la confusión
  entre objeto y notación que §13 pide buscar.
- **Cómo comprobar:** una línea en 10.5 después de la pizarra: «La suma es la flecha (3, 2): la que va derecho del
  pozo a la casa. Desde el cero, la flecha que llega a un lugar se anota con los mismos números que el lugar; desde
  otro punto, no». En la Bitácora, «un lugar no es una flecha, aunque desde el cero se anoten igual». En `:190`,
  «a la flecha (0, 1), uno arriba del cero, le decimos i».

### M2. 7.3b: potencias con otra base (4⁵, 4³, 8²) sin definir; la regla se enuncia para «potencias del mismo número»

- **Dónde:** `ch7/scenes-b.js:88-89` (7.3 define sólo la base 2: «se multiplica por dos tantas veces…»);
  `:228` (opción «4⁵»), `:234` («4⁵ sería 1024»), `:235` («multiplicar potencias del mismo número…»), `:326`
  (pizarra «64 = 2⁶ = 4³ = 8²») y Bitácora `:864`.
- **Qué:**
  - 4⁵ es la primera potencia con otra base del juego (7.1 sólo escribe √9 y √2; 10⁶ llega en 7.4). La respuesta
    «4⁵ sería 1024» es cierta, pero el jugador no tiene con qué comprobarla.
  - 4³ y 8² se escriben en la pizarra justo después de decir «4 · 4 · 4» y «8 · 8», así que se entienden por
    contexto. Pero la definición de 7.3 («empezar en 1 y multiplicar por **dos**») no se extiende nunca.
  - La regla se dice para cualquier base («del mismo número»). La razón (contar factores) no depende de la base y
    vale en general, pero el juego no dice que eso es lo que la hace general.
- **Por qué importa:** el contrato pide entender antes de abreviar y coherencia con 7.3. La abreviatura bⁿ con
  b ≠ 2 se usa sin desplegarse una vez.
- **Cómo comprobar:** antes de la primera pregunta, una línea del estudiante: «Con otro número abajo es igual: 4³ es
  empezar en 1 y multiplicar por 4 tres veces, 1 · 4 · 4 · 4». Después de `:235`, agregar «con cualquier número
  abajo: se cuentan factores iguales». Hacer `grep` de `pw(4` y `pw(8` y comprobar que la primera aparición viene
  después de esa línea.

---

## BAJA

- **B1. 10.4, «cualquier inclinación» con una tabla de tres filas.** `ch10/scenes-a.js:365`: «con la tabla de la
  rueda sabés cuánto sube una rampa de cualquier inclinación». La tabla tiene 30°, 60° y 90°. Lo que sirve para
  cualquier ángulo es la rueda: girarla y leer el alto. Comprobar: «con la rueda (girás hasta ese ángulo y leés el
  alto) sabés…».
- **B2. 10.4, «sen 60° es 0,87».** `:353`. La escena cuidó el «≈» en cos 30° (`:224`) y en la pizarra de `:364`.
  En la opción dice «es». Comprobar: «sen 60° es casi 0,87».
- **B3. 10.2, la rama «No se puede saber» oye «no un tercio».** `:195`: la misma respuesta para `third` y
  `unknown`. Contestarle a lo que eligió, por ejemplo: «Se podía saber: lo dice el triángulo de lados iguales». La
  Bitácora (`ch10/scenes-b.js:347`) ya lo hace bien.
- **B4. 10.2, «suman 120°» sin decir por qué.** `:209`. Falta «porque las tres esquinas suman 180°», que el
  cap. 8 dejó escrito (`ch8/scenes-a.js:293`). Comprobar: el renglón dice 180 − 60 = 120.
- **B5. 10.2, dos «manijas».** `:151-155` dejan dibujados el alto y la raya de la manija real, que está en 90°;
  `:213-221` dibujan el costado y el alto de la marca de 30° con el mismo amarillo. «Del centro al pie de la
  manija» (`:221`) se refiere a la marca blanca, no al punto amarillo (captura `c10m2-errores/007`). Comprobar:
  decir «de la marca de los 30°», o borrar las rayas de los 90° antes del triángulo.
- **B6. Bitácora 10, el hexágono para todos.** `ch10/scenes-b.js:367`: «Derecho, de punta a punta, el rayo entra
  seis veces justo». Es cierto, pero sólo lo vio quien eligió «Seis justos» (`ch10/scenes-a.js:102-108`).
  Comprobar: dibujar el hexágono en las tres ramas, o sacar la frase del cuerpo y dejarla en `seen`.
- **B7. Bitácora 10, rama `none` de i.** `:357`: «Dijiste que ningún número daba media vuelta». El jugador dijo que
  ninguno *multiplicado dos veces* la daba; −1 sí da media vuelta. Comprobar: «…ningún número, multiplicado dos
  veces, daba media vuelta».
- **B8. 10.6, número y operación.** `:197`: «2i es un cuarto de vuelta y el doble de largo». Es «multiplicar por
  2i». La abbr ya se corrigió en este sentido. Además, en `:190` «un rayo arriba del cero» usa como unidad el rayo
  de la rueda en un mapa de cuadros. Comprobar: «multiplicar por 2i es…» y «uno arriba del cero».
- **B9. 10.7, criterio de paralelas sólo con la izquierda igual.** `:274` y Bitácora `:370`. Es suficiente, no
  necesario. Justo después aparece «la segunda fila es la primera por 2» (`:276`). Con «suman 7» y «el doble suma
  10» (1 1 | 7 y 2 2 | 10) la izquierda no es igual y las rectas son paralelas. Comprobar: «si la izquierda de una
  fila es la de la otra por un mismo número y el de la derecha no, paralelas; si también el de la derecha, la misma
  recta».
- **B10. 10.5, «paralelogramo» con cualquier par.** `:114`. Con dos flechas en la misma dirección ((1, 0) y (2, 0))
  las rutas son un segmento: el destino es el mismo, pero el paralelogramo queda aplastado. Basta con «si no van en
  la misma dirección».
- **B11. 12.7, lugar equivocado.** `ch12/scenes-b.js:183`: «como Recta y Cuña en la línea de la ladera». Recta (+4)
  y Cuña (−4) se compararon en la línea del suelo del depósito, en el cap. 3 (`ch3/scenes-a.js:366`,
  `ch3/scenes-b.js:99`). La ladera es del cap. 4 (`ch4/common.js:20`). Además, el cap. 3 escribió
  «|−4| = |+4| = 4» con barritas (`ch3/scenes-b.js:117`). Poner «|x|» en el título de la V (`:172`) ataría el
  gráfico a esa notación, que hoy sólo aparece en la Bitácora (`:302`). Comprobar: «en la línea del depósito».
- **B12. 7.3b, «se juntan los factores» y los exponentes 0 y −1.** `ch7/scenes-b.js:235`, `:251` y Bitácora `:864`.
  En la Bitácora, las dos reglas van justo después de «2⁰ = 1, 2⁻¹ = 1/2». Las reglas son verdaderas también con
  esos exponentes (2³ · 2⁻¹ = 2²; (2⁻¹)² = 2⁻²), pero «juntar factores» sólo explica exponentes que cuentan
  multiplicaciones. Comprobar: «con exponentes que cuentan factores» o un renglón: «2³ · 2⁻¹: tres por dos y una
  dividida por dos, 2²».
- **B13. 7.3b, el despliegue no llega al lector de pantalla.** `unfold` (`:151-169`) no llama a `d.describe`. Quien
  no ve la pizarra oye «2³ · 2² =» y «= 2⁵ = 32», pero no los cinco dos, que son la evidencia de la escena.
  Comprobar: un `d.describe('En la pizarra: (2 · 2 · 2) · (2 · 2), cinco dos contados')` al final de `unfold`.
- **B14. Bitácora 7, rama `4` de `pow-product`.** `:839`: «multiplicaste también los dos de abajo». El «también»
  se lee como «además de multiplicar los exponentes», y lo que hizo el jugador fue multiplicar abajo y sumar
  arriba. Comprobar: «sumaste arriba y multiplicaste los dos de abajo: 4⁵; el 2 no cambia…».
- **B15. «Nombre:» al principio de las líneas del estudiante.** Quedan 9 en `ch7/scenes-b.js` y 8 en `ch10`, por
  ejemplo «Mara: multiplicar potencias…» (`:235`) y «Rampa: con la tabla de la rueda…» (`ch10/scenes-a.js:365`).
  6e9b3f4 cambió ese formato en otros capítulos porque se leía como si hablara el personaje. Acá eso le atribuye la
  afirmación matemática al personaje equivocado.

**Verificado sin hallazgos:**
- 7.3b: 2³ · 2² = 32, (2³)² = 64, 4⁵ = 1024, 8 + 4 = 12, 64 ÷ 3 = 21,3…, 21² = 441, 4 · 4 · 4 = 64,
  √64 = 8, 64 = 2⁶ = 4³ = 8². `factorsOfProduct`, `factorsOfPower` y `exactRoot(64, 3 | 2)` dan 5 y 6 factores y
  los lados 4 y 8. La capa de 8 por 8 de la rama `8` y el cubo de 4 × 4 × 4 coinciden con lo que se dice (capturas
  013 y 014).
- Las ramas `6`, `4`, `5`, `9`, `yes`, `8` y `21` contestan cada error en sus propios términos. La Bitácora de 7.3b
  atribuye sólo lo elegido, salvo B14.
- 7.3b es coherente con 7.1: √ es el lado de un cuadrado y la raíz cúbica, el lado de un cubo.
- Cap. 10: 2π − 6 ≈ 0,283 (menos de un tercio); la cuerda de 60° mide un rayo y el arco π/3 ≈ 1,047;
  0,25 + 0,7569 = 1,0069; 4 · sen 60° = 3,46; 4 · 0,87 = 3,48; (4, −1) + (−1, 3) = (3, 2), y es el único par de
  cartas que llega; i · (3 + i) = −1 + 3i, que es `quarter([3, 1])`; (−2i)² = −4; los ocho pares de a + b = 7.

---

## Estado de los hallazgos originales

| Hallazgo | Estado | Nota |
|---|---|---|
| M1 cuerda y arco; conteo | **Resuelto** | Hexágono azul y respuesta en la rama «6»; relleno automático numerado 1–6 (captura 004). Resto: B6 |
| M4 sen 30°: saltos y «la altura» | **Resuelto** | 30 + 30 = 60, esquinas iguales, «la manija está a medio rayo», marcas 30° y −30°. Resto: B4, B5 |
| M5 coseno y Pitágoras sólo nombrados | **Resuelto** | Costado dibujado y en la tabla; triángulo rectángulo; 1,0069 ≈ 1 por redondeo; signo a la izquierda. El coseno no se usa después (aceptable) |
| M7 qué largo y qué ángulo | **Resuelto** | Arco de 30°, escuadra, «largo de la tabla», describe y Bitácora. La superposición con la rueda (opcional) no está |
| M8 semejanza sólo por el ángulo; transferencia | **Parcial** | La rampa de 60° hace falta y está bien contestada. La razón de la semejanza dice algo falso (A1). Resto: B1, B2 |
| M9 casa mudada; punto y flecha | **Resuelto, con costura nueva** | Casa en (3, 2) como en el cap. 8, cartas distintas, suma por coordenadas, razón general. Queda M1 (lugar y flecha) y B10 |
| M10 i como número | **Resuelto** | Contra el reloj, (a, b) → (−b, a), 3 + i, i · (3 + i), 2i explicado, −2i. Resto: B8 |
| M11 «por sí mismo» en el cap. 9 | **Resuelto** | Opción, respuesta, diálogo, pizarra y Bitácora del cap. 9 (`ch9/scenes-b.js:158`, `:164`, `:166`, `:169`, `:327`, `:338`) dicen «de la recta»; 10.6 lo retoma |
| M12 matriz como nombre; misma recta | **Resuelto en el texto; parcial en pantalla** | Tabla azul, lectura, caso «el doble suma 14», «primer grado». En pantalla falla por A2. Resto: B9 |
| M14 Bitácora | **Resuelto** | Las 26 ramas atribuyen lo elegido (una con un matiz: B7); las abreviaturas llevan su condición. Resto: B6 |
| 12.7 M9 valor absoluto | **Resuelto** | V dibujada, −(−4) = 4, línea horizontal. Resto: B11 (lugar equivocado, barritas) |
| (sin pedir) A1, A2, A3 | Resueltos | Rama «Cuatro»; «Dos cuartos: media vuelta»; «Atados enteros: sólo los puntos» |
| (sin pedir) M2 radianes | Parcial | Se escribe 360° = 2π radianes; después sólo «cada 360° o 2π» |
| (sin pedir) M3 π | Resuelto | «3,14 es una aproximación, y π no es ninguna fracción» |
| (sin pedir) M6 los 390° | Resuelto | Se pregunta entre la primera vuelta y la segunda; las tres ramas tienen respuesta propia |
| (sin pedir) M13 baldes | Parcial | Sin período 3. Pero el balde 6 sale «a medias», y la rama «ya le toca» (`ch10/scenes-b.js:331`) sigue hablando de «que hayan salido llenas» |
