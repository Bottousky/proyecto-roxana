# Arithmos: revisión matemática independiente, cap. 4 «Veces» y correcciones de la 2.ª ronda (caps. 1–3)

Fecha: 2026-10-06. Árbol revisado: `1cc023f` (el autor siguió trabajando durante la revisión; no hay cambios sin commitear en `ch2`, `ch3` ni `ch4`).

**Método**
- Lectura de código, textos y Bitácoras.
- Logs y capturas PNG de `artifacts/arithmos/it04/`, todos generados por un bot automático (no hay personas).
- `node --test experiments/arithmos/tests/`: 48 de 48 pasan.
- No abrí el navegador ni corrí scripts.

**Vigencia de las capturas**
- `c4-directa/` y `c4-errores/` son anteriores a `1cc023f`.
- `c4-directa/018`, `027` y `032` muestran todavía los carteles +2, +4 y −6 de 4.3 sobre las familias en 4.4–4.7. Hoy `clearSigns` los borra; `c4-errores/019` ya no los tiene.
- `c4-directa2/004` muestra a Peldaño sin atados y 5 sobrantes bajo «sobran 2». Lo corrigió `1cc023f` (`o.owner == null`, ch4/scenes-b.js:84), y `c4-repartir/007` lo confirma.

**Rutas abreviadas**
- `a4` = `experiments/arithmos/src/ch4/scenes-a.js`
- `b4` = `.../ch4/scenes-b.js`
- `a3` / `b3` = `.../ch3/scenes-a.js` / `scenes-b.js`

---

## Severidad ALTA

### A-1. 4.4 Repartir: «otra vuelta, a todas» rompe la regla de las vueltas y deja una cuenta falsa en pantalla
- **Dónde:**
  - El botón aparece con `Math.min(...given) >= 1 && 14 - total() >= 4` (b4:104), aunque las partes estén desparejas.
  - `round()` (b4:122–130) da uno a cada familia sin chequear la vuelta y termina con `14 - total() < 4` sin pedir que las partes sean iguales. `pick()` sí lo pide (b4:119).
  - Después, el texto se arma con `share(14, 4)` y no con lo que pasó en pantalla: «Cada familia tiene tres. Quedan dos atados» (b4:143) y «sobran 2» (b4:168).
- **Cómo reproducirlo:**
  1. Dar un atado a cada familia.
  2. Tocar a Peldaño: queda (2,1,1,1). La protesta no salta porque Peldaño no supera el mínimo.
  3. Tocar «otra vuelta» dos veces: queda (4,3,3,3), con 1 atado en el montón.
  4. Partiendo de (2,2,1,1) se llega a (4,4,3,3) y el montón queda vacío.
- **Qué pasa entonces:**
  - Peldaño recibe el tercero antes de que otras tengan el segundo, sin protesta.
  - El juego dice «tres cada una, quedan dos» con 4,3,3,3 y un solo sobrante.
  - Con «Dárselos a dos familias», `hop(d, left[1], …)` recibe `undefined` (b4:149) y la partida termina en error. La guarda nueva de b4:164 sólo escribe en consola.
- **Por qué importa:** es el momento que presenta 14 = 4 × 3 + 2 y el resto. La pantalla contradice la cuenta y el texto afirma algo falso. Además se llega por una ruta normal: mezclar toques sueltos con el botón.
- **Cómo comprobar la corrección:**
  - Mostrar «otra vuelta» sólo si `min === max`, o hacer que dé sólo a las que van atrás.
  - Exigir que las partes sean iguales también en `round()`.
  - Escribir el aviso y «sobran N» a partir de `given` y `pile().length`.
  - Agregar una prueba de ruta: (1,1,1,1), luego Peldaño, luego «otra vuelta». El botón no debe aparecer, o el resultado debe ser 3,3,3,3 con 2 sobrantes.

---

## Severidad MEDIA

### M-1. 4.2 Dar vuelta: el «giro» no es un giro, los atados se reacomodan
- **Dónde:** el destino de cada deuda es `gridPos(3, 4, floor(i/4), i % 4)` (a4:258), es decir, un relleno fila por fila. En el último 40 % del tween se mezcla con la rotación (a4:249–265). Lo mismo pasa al restaurar (a4:211).
- **Qué se ve:** después de girar 90°, la familia de la fila 0 está en la columna derecha y viaja unas 190 u hasta el borde izquierdo de la fila de arriba. Los atados se cruzan, y cada fila final mezcla familias (AAAB / BBCC / CDDD).
- **Por qué importa:** el argumento de 4 × 3 = 3 × 4 es que el rectángulo es el mismo, visto de costado. Si se reacomoda, lo que se muestra es un reagrupamiento. También es válido, pero no es lo que dicen el texto («Girar no saca ni pone ninguna», «es el mismo rectángulo, girado») ni la Bitácora. Quien eligió «Más» ve que los movieron.
- **Cómo comprobar:** que el destino sea el de una rotación rígida: fila = j, columna = 3 − r (giro horario, como el tween). Así cada familia queda en una columna. Lo mismo en el setup. En una película cuadro a cuadro, ningún atado debería cruzarse con otro. La huerta de 9 × 4 (a4:322) ya gira bien.

### M-2. 4.3 «Media vuelta»: lo que se ve no son dos medias vueltas que forman una entera
- **Dónde:** `y = GROUND − |r|·sen(ang)·0,55` (a4:383) y la frase «por arriba» (a4:376).
- **Qué se ve:**
  - Las familias positivas giran antihorario por arriba y Cornisa (negativa) gira horario, también por arriba. No es una rotación de la recta: dos puntos simétricos chocarían en la cima.
  - En la segunda vez (a4:459) cada familia **desanda el mismo arco**. «Dos medias vueltas: una vuelta entera» (a4:460, Bitácora b4:599) no es lo que ocurre en pantalla: es ida y vuelta.
  - La ecuación escrita es (−1) × (−1) = 1 (a4:462), pero nadie está en ±1 en ese momento (están en ±2, ±4 y ∓6). Lo que se vio es «× (−1) dos veces = × 1».
- **Por qué importa:** es la justificación «sin regla mágica» que pide el diseño. Además, el currículo prevé complejos como rotación (H3). Ahí ×(−1) tiene que ser un giro rígido de 180° (los negativos pasan por abajo), y luego × i, un cuarto de vuelta.
- **Cómo comprobar:**
  - Usar `r` con signo en lugar de `|r|`. Así los negativos pasan por debajo y la segunda media vuelta continúa en el mismo sentido: el recorrido cierra un círculo.
  - Escribir «× (−1) × (−1) = × 1» antes de (−1) × (−1) = 1, o hacer los giros con Peldaño en +1, antes del × 2: 1 → −1 → 1.
  - Si se prefiere el reflejo, que el texto diga «dar vuelta dos veces deja todo como estaba» y no «vuelta entera».

### M-3. Cap. 4: cantidades incoherentes a lo largo del capítulo
- **Saldos de 4.3 contra 4.1:**
  - 4.1 dice «cada una me debe tres atados» (a4:68): las cuatro estarían en −3.
  - En 4.3 Peldaño está en +1 y Rampa en +2 (a4:333), sin explicación. Se ve en `c4-directa/010`.
- **Pretexto del × 2:** «la cosecha se duplicó. Y las cuentas también: … lo que debía, ahora es el doble» (a4:399).
  - Es una causalidad falsa: una cosecha mayor no duplica deudas. Además presenta «duplicar todo» como algo natural.
  - Después, en 4.5, las Terrazas pagan 12 (b4:216) como si la deuda siguiera en 12.
  - Conviene un pretexto hipotético («¿y si…?») como el de × (−1) (a4:440).
- **4.5:** «Ayer: doce entre cuatro familias» (b4:260).
  - Se repartieron **14**, no 12.
  - No pasó ningún día entre 4.4 y 4.5.
  - Es justo la frase que une reparto y medida.
- **La huerta de Peldaño:** en 4.2 es «nueve filas de cuatro» (a4:302) y en 4.7 «cuatro filas de cinco» (b4:445).
- **4.6:** aparecen seis atados sin origen (b4:312). Los 12 ya están embolsados y 2 apartados.
- **Por qué importa:** el cap. 3 se rehizo justamente para que cada saldo saliera de una operación. Aquí vuelven números sin origen, y el jugador que sigue las cuentas encuentra contradicciones.
- **Cómo comprobar:** hacer una tabla de cantidades por escena (deuda 12 → cosecha 14 → reparto 3 + 3 + 3 + 3 + 2 → pago 12 → quedan 2) y que cada número en pantalla salga de ella.

### M-4. Cap. 3, caso nuevo «Oval tiene 2 y paga 5»: los pares cero se convierten en atados reales que cobra Mara
- **Dónde:** b3:285–306 («agregar pares que valen cero»; «Aparecen en la mesa tres atados y tres deudas») y b3:292 (cada atado pagado salta hasta Mara).
- **Qué se ve:** Mara recibe **5 atados físicos** (3 salen de la nada) y además Oval le debe 3. En la historia, cobra 8 por una cuenta de 5.
- **Por qué importa:** es el mismo defecto que M-i de la 2.ª ronda: el par cero sin origen. En 3.5 se resolvió porque allí es un asiento contable («anotadas dos veces»). Aquí, en cambio, el atado pasa de mano.
- **Cómo comprobar:** que los 3 atados del par salgan de Mara («te presto tres: me debés tres») y vuelvan a ella. La otra opción es que los atados pagados se tachen de la mesa en lugar de entregarse. Al final, Mara tiene que haber recibido neto 2 y tener 3 a cobrar.

---

## Severidad BAJA
1. **La Bitácora del cap. 4 atribuye de más.**
   - «Calculaste 4 × 13 partiendo en 4 × 10 y 4 × 3» (b4:589): el jugador eligió 52 en una lista **antes** de ver la partición, que hizo Punto.
   - «darle un segundo atado» (b4:577): puede haber sido el tercero.
   - «viste que alcanzaba contar una sola vez»: fue una predicción.
   - Mejor: «Elegiste 52; partido en 4 × 10 y 4 × 3 se comprueba».
2. **4.4: la pregunta no dice «sin partir atados»** (b4:79). Si se puede partir, a cada una le tocan tres y medio y no sobra nada. El límite recién se declara después de «Partirlos» (b4:158).
   - Es correcto que «Tres cada una» sin resto se trate como acierto parcial («Tres, sí…»).
   - Sugerencia: «… en atados enteros, ¿cuánto le toca a cada una?».
3. **4.6, primera pregunta** (b4:323–345).
   - En lógica estricta, con cero familias «a cada una le tocan cero» (o seis) es verdadero por vacuidad. El criterio decisivo es que los seis no salen nunca del montón (0 × q ≠ 6).
   - La devolución a «cero» debería anclarse ahí: «…y los seis siguen en el montón».
   - El tratamiento de «infinitas» es correcto: infinitas bolsas de cero guardan cero (b4:383), y «No es cero ni infinito» (b4:404) vale en los reales.
   - Para el cap. de funciones conviene declarar de dónde viene la intuición de «infinito»: 6 ÷ x crece sin tope cerca de 0, con signos opuestos a cada lado.
4. **`logic/times.js:26–30`.**
   - `measure` no valida como `share`: con `size < 0` el bucle `while (left >= size)` no termina.
   - La razón «una bolsa de cero no se llena nunca» es inexacta: una bolsa de cero ya está llena; lo que no termina es el montón.
   - Hoy no se usa en escenas.
5. **Bitácora:** «por 2, todo se aleja el doble» (b4:599) es ambiguo. Mejor: «queda al doble de distancia del cero».
6. **Interacciones de un solo botón en el cap. 4:** bajar deudas (4.1), tocar «× 2» o «× (−1)» (4.3), llenar bolsas (4.5) y bolsas de cero (4.6). No admiten error, y la decisión queda sólo en la predicción previa. Es aceptable, pero repite el patrón de M-l.
7. **Cap. 3: Espiral (−4) no tiene fila en «Cuentas (en atados)» ni origen en la historia** (a3:287).
   - La disposición de A2 en `ARITHMOS_REVIEW.md` («cada saldo de la línea coincide con su fila») no se cumple para Espiral.
   - El vínculo con los 52, 302 y 37 del cap. 2 queda implícito («hoja nueva», «ya no me queda ninguno», «guardados»).
8. **Cap. 3:** Curva afirma «te debo tres» (a3:65) y en 3.5 resulta que dos estaban duplicadas en el registro de Mara (b3:138). Es menor, pero Curva confirmó un número falso.
9. **Documentación:**
   - `ARITHMOS_CURRICULUM.md` deja B4–B5 «pendiente» y no tiene la ficha §5 del cap. 4.
   - `ARITHMOS_DESIGN.md:142` sigue diciendo «palito hueco».
10. **Dato histórico, correcto:** Brahmagupta (628), «fortunas» y «deudas», 0 ÷ 0 = 0 (b4:604). Está respaldado por `fuentes.md` §8, con certeza alta. Opcional: su regla «deuda × deuda = fortuna» conecta con 4.3.

**Lo que está bien en el cap. 4**
- 4 × (−3) = −12 con paréntesis.
- «× 2 → más lejos del 0» (correcto).
- «Multiplicar no siempre agranda» (correcto: × 1, y (−3) × 2 < −3).
- 14 = 4 × 3 + 2, y «14 ÷ 4 → 3 cada una; sobran 2» sin un «=» falso.
- 12 ÷ 3 = 4 porque 4 × 3 = 12, con la convención «grupos × tamaño» coherente en todo el capítulo.
- Las tres preguntas de división por cero.
- La distributiva con dos cortes y 4 × 13 = 40 + 12.
- Las devoluciones a 43, 17 y 412.

---

## Estado de las correcciones de la 2.ª ronda

| # | Estado | Evidencia y comentario |
|---|---|---|
| A1 | resuelta | `c2c3-check/002`: «1 4» bajo el atado y los sueltos, en orden. `c2-snaps/004`: 3 atados a la izquierda, 7 sueltos a la derecha, 37. `c2-snaps/006` (anterior) todavía tapaba con Mara y Punto; el código actual los corre (ch2/scenes.js:392, 474) |
| A2 | parcial | Hoja «Cuentas (en atados)» con Recta 4 / Oval 4 / Curva −3, luego +3 / +2 / −1; coincide con la línea (`c2c3-check/013`, `018`). Espiral −4 sin fila ni origen (baja 7). `c2-snaps/020` (anterior) mostraba Oval 3 |
| A3 | resuelta | Cada cambio es una operación: Oval da 2; el préstamo de Recta ya está dentro de los 4; Mara paga 1 (b3:88); duplicadas (b3:138). El caso nuevo introduce M-4 |
| A4 | resuelta | La pregunta nombra «la Ronda y Punto»; el estudiante está aparte (`c1-errores/008`); «Sobró uno. ¿Me conté a mí? En la fila eran trece» |
| A5 | resuelta (código) | Tocar de nuevo deselecciona; «desatar» explícito de los dos lados; aviso sin pareja. Como el saldo se conserva, al vaciar a Curva siempre quedan 15. Los logs no ejercitan el callejón (`c2-errores` desata sólo 1) |
| M-a | resuelta | «cifra» en las seis líneas (grep) |
| M-b | resuelta | «Dice "ninguno" en ese cuarto» y la Bitácora correspondiente |
| M-c | resuelta | La pregunta va después del asiento libre, sobre la cantidad, con opciones del mismo registro; se vuelven a sentar (`c1-errores/013`, log 30–31). La Bitácora corresponde |
| M-d | resuelta (texto) | «Esta mañana pasaron doce y anoté doce…» (`c1-errores.log:5`). La hilera propia bajo el suelo (`8d97397`) **no tiene captura**: `c1-errores/004` es de la versión anterior |
| M-e | resuelta | `c2-snaps/005`: 3 lazos de diez, 4 sueltos, «34»; se reconoce «Hoy llegó más». Los lazos se tocan en los bordes (cosmético) |
| M-f | resuelta | Depósito propio de los Oval (`c2-snaps/012`) |
| M-g | resuelta | Estantes en 6450/7100, fuera del depósito (`c2-snaps/014`) |
| M-h | resuelta | Pregunta por la rayita suelta y explicación del paréntesis (`c3-perdon.log`) |
| M-i | resuelta | «Deudas anotadas dos veces»; «¿qué otra cosa…?» con «darle dos atados» en la línea; −1 − (−2) = −1 + 2 = +1 |
| M-k | resuelta, con un problema nuevo | Puente pozo–Espiral (b3:369); 2 − 5 = −3 jugado. Problema nuevo: M-4 |
| M-j | resuelta | Negativos sin rótulo hasta ubicar; quejas en términos de «llegar a cero»; pregunta con numerales (`c2c3-check/018`) |
| M-l | resuelta / parcial | Predicción 7/8/1 con consecuencia; pozo con elección de marca y vuelta a −4 (`c3-perdon.log`). El recorrido de pasos sigue siendo de un botón |
| bajas 1–11 | resueltas | Mara recuerda el 0; Bitácoras del cap. 3 y del cap. 1 corregidas; «nombra a catorce»; «siete atados» quitado; texto de «dejar los diez» (sin captura del momento); «un espacio no deja marca: 11»; el 0 «en el medio»; la cruz de Mara; textos fantasma reemplazados por dibujos; comentarios |
| baja 12 | parcial | Currículo al día en A4–B3, pero B4–B5 «pendiente» y «palito hueco» en el diseño (baja 9) |

Problemas nuevos en los caps. 1–3: M-4, baja 7 y baja 8.

---

## Qué no pude verificar
- **Navegador:** no jugué ni miré en navegador. Las animaciones de M-1 (reacomodo al girar) y M-2 (arcos de la media vuelta) se deducen del código; ninguna captura muestra un cuadro intermedio.
- **A-1:** se deduce del código. Ningún log recorre la ruta: `c4-directa` usa sólo «otra vuelta» desde (1,1,1,1), y `c4-errores` hace un solo intento desparejo.
- **Capturas recientes:** las de 4.1–4.3 son anteriores a `1cc023f` (encuadres viejos). La hilera de la mañana del cap. 1 y el «dejar los diez» del cap. 2 no tienen captura de la versión actual.
- **Clics del bot:** en `c3-perdon.log` el bot no pudo tocar los atados al pagar (`pm-h0`, `pm-zh*`, timeout), y en `c2c3-check.log` no pudo tocar «llenar». Las escenas terminaron, pero no vi la secuencia de pago jugada.
- **Audio, táctil, rendimiento y comprensión humana:** no evaluados. Las 48 pruebas validan la lógica, no el aprendizaje.
