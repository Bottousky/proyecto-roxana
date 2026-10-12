# Arithmos · Auditoría del juego (en curso, 2026-10-12)

Pedido: «y en cuanto al propio juego? como está auditalo, mejoralo». **Estado: a medias, traspasado a local.** No se editó código del juego todavía en esta auditoría.

## Qué hay hecho
1. **Auditoría matemática** (abajo, completa): 12 capítulos, Bitácoras e historial de revisiones. Las cuentas de la pizarra están bien; fallan frases de diálogo/opciones y ramas de Bitácora.
   Verificados en el código (las líneas existen y dicen eso): ALTA 1 (`ch3/scenes-b.js:44`), ALTA 2–3 (`ch9/scenes-b.js:164–166`; `INS = [-1, 0, 2, 3, 5]` y «ya probé» a los 3–4 intentos, `:65–90`), ALTA 4–5 (`ch11/scenes-a.js:98, :144, :149`), ALTA 6 (`ch8/scenes-a.js:527`). El resto (MEDIA/BAJA) falta comprobar uno por uno antes de corregir.
2. **Corrida completa del bot, ruta directa, 1600×900** (`artifacts/arithmos/animlab/c32/full-directa.out`, `full-directa/summary.json`, `log.txt`, `state.json`; las capturas PNG no se versionan):
   - **Se trabó en `c4.grupos`** a los 1598 s: Bitácora con 3 capítulos, fotos c1–c3.
   - `[spot fuera de cuadro] grp2 (1550, 336)` y `grp3 (1838, 262)`: el spot de la «Familia Balcón: tres deudas» queda en x = 1838 con un lienzo de 1600 → el bot no lo puede tocar («Element is outside of the viewport»). **Prioridad 1**: ver si es real (cámara de `c4.grupos` no encuadra el tercer grupo) o del entorno (20 fps por WebGL de software, como el aviso de r10 en c1). Probar `?seg=c4.grupos` en local con Chrome real.
   - fps 20 en todo (SwiftShader del contenedor; no es dato del juego).

## Qué falta (en orden)
1. `c4.grupos`: diagnosticar el spot fuera de cuadro (arriba) y relanzar `node scripts/playthrough.mjs ../../artifacts/arithmos/animlab/c32/full-directa` hasta el cap. 12; después la ruta `--route=errores` y teléfono `--size=844x390 --touch`.
2. Aplicar ALTA 1–6 con los textos propuestos (ALTA 2: armar la lista desde los cuadrados de `tried`, sin repetir, ordenados).
3. Comprobar en el código y aplicar MEDIA y BAJA. Ojo: dos «Corregido» del historial no están en el código (rev-mat-11 B1 «casi 0,87»; rama `unknown` de la Bitácora del cap. 9).
4. Auditorías de UX/accesibilidad y de código: los agentes fallaron por el límite de uso; hacerlas de nuevo.
5. `npm test`, `npm run check`, `lint-scenes`, bots; anotar en `ARITHMOS_REVIEW.md` y poner al día `ARITHMOS_STATE.md` (dice «Sin push» y fecha 2026-10-07).
6. Pendientes viejos: letras sobre la cama de sonido [H], PDF en Safari [H], peso de los PDF, hoja de cierre de la Bitácora, «Fin. Tu Bitácora queda guardada» (`ch12/chapter.js:13`), toasts que se pisan, spot r10 a pocos fps, post de rossaxbt sin leer.

---

## Auditoría matemática de Arithmos (12 capítulos, Bitácoras e historial de revisiones)

Leí completos los archivos de escenas y las 12 Bitácoras, revisé la lógica de `src/logic/` y recalculé con Node los valores aleatorios con semilla fija (baldes y dados). `npm test` pasa 123 de 123. No edité nada. Las rutas son relativas a `experiments/arithmos/src/`.

### ALTA (falso o engañoso para el alumno)

1. **`ch3/scenes-b.js:44`**: Cuña dice «Recta, si me prestás lo que nos separa, quedamos parejos.»
   - Cuña está en −4 y Recta en +3. Si Recta le presta 7, Cuña queda en +3 y Recta en −4: se intercambian, no quedan parejos. Para quedar iguales harían falta 3,5. Nadie lo corrige.
   - Texto nuevo: «Recta, ¿cuánto más que nosotros tenés? Eso es lo que me falta para tener lo mismo que vos.»
2. **`ch9/scenes-b.js:166`**: el estudiante dice «Con los números que probamos salió 0, 1, 4 o 9».
   - Es fijo, pero «ya probé» aparece a los 4 intentos. Si el jugador probó −2, −1, 1 y 2, salió 4, 1, 1, 4: nunca 0 ni 9.
   - Arreglo: armar la lista desde `tried` (los cuadrados sin repetir, ordenados) y decir «Con los que probamos salió …».
3. **`ch9/scenes-b.js:164`**: el pensamiento dice «No hay número de la recta que falte probar.»
   - Leído al pie de la letra es falso: no se probó 2,5, por ejemplo.
   - Texto nuevo: «…cero por cero, cero. Todo número de la recta es de una de esas tres clases: ninguno da −4.»
4. **`ch11/scenes-a.js:144` y `:149`**: «El del medio: 4, como la mayoría.» y «Cuatro, como casi todas.»
   - Sólo 2 de las 5 familias tienen 4.
   - Opción nueva: «El del medio: 4, cerca de lo que tienen casi todas.»
   - Pensamiento nuevo: «Cuatro: casi todas tienen entre 3 y 5. El promedio se lo lleva la Ronda.»
5. **`ch11/scenes-a.js:98`** (rama `exact`): «a veces da justo y a veces un poco más o un poco menos, siempre cerca.»
   - Con las semillas fijas, la primera tanda da 70 % con 10 baldes, 73 % con 30, 63 % con 300 y 64 % con 1000; nunca da 2/3 justo.
   - La otra tanda da 90 % con 10 baldes, así que «siempre cerca» también es falso.
   - Texto nuevo: «No se queda clavado en dos tercios: con pocos baldes salta lejos; con muchos, queda un poco arriba o un poco abajo, cerca.»
6. **`ch8/scenes-a.js:527`**: Cornisa dice «el ancho tiene los mismos ángulos, todos rectos».
   - La ele tiene seis ángulos: cinco de 90° y uno de 270°.
   - Texto nuevo: «Y el ancho tiene los mismos ángulos que mi ventana, pero no todos sus lados se multiplicaron por lo mismo…»

### MEDIA (atribución falsa, ambigüedad o inconsistencia)

7. **`ch11/scenes-b.js:391`** (confirmado): la opción `both` cae en «elegiste el del medio, 4».
   - Agregar una rama: «Para una familia común elegiste dar los dos números y avisar que la Ronda tiene muchísimos: el del medio, 4, y el aviso.»
8. **`ch11/scenes-b.js:393`** (confirmado): la opción `same` cae en «pensaste en el otro».
   - Para `B`: «…pensaste en B, que a veces hace 9; con el mismo promedio, a veces hace 1.»
   - Para `same`: «Para tener por lo menos 4 dijiste que daba lo mismo por el promedio; B a veces hace 1, y A, en estos cinco días, nunca bajó de 4.»
9. **`ch10/scenes-b.js:424`** (confirmado): la Bitácora dice «rectas paralelas» / «las rectas son paralelas», pero la escena dice «filas» (líneas 297, 298 y 314).
   - Texto nuevo: «…no hay par: las dos filas de pares son paralelas.» Aplicarlo en las tres ramas.
10. **`ch12/scenes-b.js:489`**: la opción `neg` («El doble menos uno») cae en «probaste otro orden»; no es un orden, es otra operación.
    - Para `swap`: «…probaste la mitad primero…».
    - Para `neg`: «…probaste "el doble menos uno"; con 5 da 9, no 2: se deshace con menos uno y la mitad.»
11. **`ch9/scenes-b.js:355`**: la Bitácora dice «Con 10 dijiste 13, sumando lo mismo que entre renglones».
    - Sumar lo mismo que entre renglones (+2 por cada +1) da justamente 21. El 13 es «10 + 3».
    - Texto nuevo: «Con 10 dijiste 13, como si la máquina le sumara siempre 3; con 1 daría 4, no 3: la regla da 21.»
    - Cambiar también la opción en `ch9/scenes-a.js:255` a «13: le suma 3, como al 2.»
12. **`ch12/scenes-b.js:305`**: la descripción dice «cruza la raya del 30 entre la noche 4 y la 5» antes de que Mara pida marcar esa noche. Le da la respuesta al lector de pantalla.
    - Texto nuevo: «La curva que duplica pasa por los cuatro puntos y sigue subiendo hacia la raya del 30.»
13. **`ch9/scenes-a.js:73`**: la descripción dice «A la sombra 2 llegan dos flechas, de las 10 y de las 14» justo antes de preguntar «¿Qué hora es?» con la sombra 2.
    - Texto nuevo: «De cada hora sale una sola flecha, a la sombra que tenía a esa hora.»
14. **`ch10/scenes-a.js:244` y `:459`**: «va el costado: 0,87 a los 30°» y «A 60°, la manija sube 0,87 de rayo» presentan el valor como exacto (es 0,866…).
    - El historial (rev-mat-11, B1) dice que se corrigió a «casi 0,87», pero `grep` no lo encuentra en ningún archivo: es una regresión.
    - Arreglo: «casi 0,87» en las dos líneas.
15. **`ch9/scenes-b.js:370`**: la rama `unknown` dice «Dijiste que mañana no se podía saber».
    - El historial (rev-c8b, B1–B7) dice que la Bitácora ya dice «el día 2»; la corrección quedó a medias.
    - Texto nuevo: «Dijiste que el día 2 no se podía saber; repitió la ve: a las 10, 2.»
16. **`ch4/scenes-b.js:266-267`**: «Recién repartimos: cada familia, tres» y «Las dos se contestan con 4 × 3 = 12».
    - El reparto fue de 14, con 2 que sobraron (14 = 4 × 3 + 2).
    - Texto nuevo: «Recién repartimos catorce: tres cada una y sobraron dos. Ahora medimos doce en bolsas de tres: cuatro bolsas.»

### BAJA (estilo, plurales, ramas fusionadas)

17. **`ch3/scenes-b.js:534`**: con la respuesta `1` sale «Anticipaste 1 pasos». Usar `ps.answer === '1' ? 'un paso' : …`.
18. **`ch12/scenes-a.js:113` y `:122-127`**: `b` y `a` no tienen tope, así que el rótulo puede mostrar «y = 10 · x + -1» (guion ASCII).
    - Formatear con el signo: `${b < 0 ? '−' : '+'} ${Math.abs(b)}`, y usar «−» en `a`.
19. **`ch7/scenes-a.js:239`**: el día 0 la descripción dice «Mara lleva 1 escalones». Usar `escalón`/`escalones` según el número.
20. **`ch7/scenes-b.js:592`**: puede decir «Lugares libres: 1 parados». Concordar el plural.
21. **`ch11/scenes-b.js:401`**: las respuestas `12` y `same` caen en una misma rama: «Pensaste en el 12 o en que todas salen igual». Separarlas.
22. **`ch3/scenes-b.js:540`**: las respuestas `take` y `debts` se fusionan («como quitar atados o sumar deudas»). Separarlas.
23. **`ch5/scenes-b.js:512`**: «Creíste que 2,05 era lo mismo o más». Separar `same` y `more`.
24. **`ch7/scenes-b.js:1059`**: las respuestas `2` y `more` se fusionan («era 2 o más»). Separarlas.
25. **`ch5/scenes-b.js:504`**: «volviste a partir lo que sobraba»; esa partición la hace el juego solo. Texto nuevo: «…y lo que sobró se volvió a partir…».
26. **`ch2/scenes.js:1459`**: «desataste … cuando no quedaba pareja», pero el código deja desatar en cualquier momento. Texto nuevo: «…desataste N atados…» (sin «cuando no quedaba pareja»).
27. **`ch11/scenes-b.js:396-397`**: si se toca «así sirve» dos veces con el eje en el mismo lugar, sale «con el eje en 96 y en 96». Quitar repetidos con un `Set`.
28. **`ch10/scenes-a.js:409`** (rama `4`): «No se suma: se multiplica.» Con la regla bien aplicada, sumar también da 3 (cada 2 tablones más, sube 1). El error es sumarle el largo al alto.
    - Texto nuevo: «Sumar 2 al alto porque el largo creció 2 no sirve: alto ÷ largo es siempre 1/2…».
29. **`ch5/scenes-b.js:451`**: rótulos sin simplificar, como «2/2 < diagonal < 3/2». Son verdaderos pero raros; escribir «1 = 2/2».
30. **`ch5/scenes-a.js:481`**: a quien eligió `in` («Entre el 0 y el 1») se le contesta «En una barra no entran cinco cuartos…», que es la respuesta a `none`. Agregar una respuesta propia: «Ya en cuatro saltos llega al 1; el quinto lo pasa.»
31. **`ch10/scenes-b.js:435`** (cuerpo): «la de la otra por un mismo número y el resultado no» es ambiguo. Texto nuevo: «…y el resultado no está multiplicado por ese número».
32. **`ch7/scenes-b.js:1106`**: «El signo √ indica el número positivo»; √0 = 0. Cambiar a «el que no es negativo».
33. **`ch12/scenes-a.js:255`**: la definición de polinomio («términos con x multiplicada por sí misma») es imprecisa.
    - Texto nuevo: «una suma de términos, cada uno un número por x multiplicada por sí misma algunas veces».

### Afirmaciones del historial (`ARITHMOS_REVIEW.md`) que verifiqué

Estas están en el código como dice el historial:
- 7.7 «no siempre es x + 1».
- 9.8 «si el sol sigue haciendo el mismo recorrido, unos 4».
- 10.1 «Cuatro, como los cuatro rayos dibujados».
- 10.3 una devolución por cada error (también −0,5 y −1), y la Bitácora con un texto por respuesta.
- 10.4 «una ele, con seis lados».
- 11.4 «104 ÷ 100 = 1,04 veces».
- 11.7 datos nuevos por viento.
- 12.2/12.8 noches contadas desde 0.
- 12.3 dominio de la caja «sólo de 0 a 3».
- 12.1 «se acerca tanto como se quiera».
- 7.6 cierre de Balcón y Bitácora con x(x + 5) y (x + 1)(x + 4).
- 4.x / 3.5 «me pagaste cinco: dos tuyos y tres que te presté».
- 6.8 «x ÷ 16».
- 9.7 «el día 6 … 64 contra 61».
- 10.8 baldes sin ciclo de tres.

Dos no se cumplen: «casi 0,87» (hallazgo 14) y «el día 2» en la Bitácora del cap. 9 (hallazgo 15).

Todas las igualdades escritas en la pizarra que revisé son correctas. Algunas: 52 − 37 = 15, 302, 205, −1 − (−2) = +1, 2 − 5 = −3, x² + 5x + 6, (x + 1)² = 9, log₂ 1000 ≈ 9,97, 2^9,5 ≈ 724, 0,5² + 0,87² = 1,0069, i · (3 + i) = −1 + 3i, sumas inferiores 6, 7,5, 8,25 y 8,7 con la superior 9,75, tasas de 3 a 4,01, x(6 − 2x)², promedio 10 y mediana 4, rangos 2 y 8, los 6/36 del 7. Las tiradas de dados con semilla fija dan 58 sietes y 6 doces.

### Juicio general

1. Las cuentas de la pizarra están bien en los 12 capítulos; lo que falla son frases en diálogos y opciones que, leídas al pie de la letra, son falsas o dependen de qué hizo el jugador.
2. Las Bitácoras mejoraron mucho, pero quedan ramas que juntan opciones distintas o explican el error con un razonamiento que no es el del jugador. Las peores son las del cap. 11, la del cap. 12 y la del 13 en el cap. 9.
3. Dos correcciones que el historial da por hechas (rev-mat-11 B1 «casi 0,87» y la rama `unknown` de la Bitácora del cap. 9, rev-c8b B1–B7) no están en el código: hace falta volver a comprobar en el código cada «Corregido» antes de cerrarlo.