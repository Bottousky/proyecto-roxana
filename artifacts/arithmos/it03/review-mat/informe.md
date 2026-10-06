# Arithmos: revisión matemática independiente, caps. 1 (2.ª pasada), 2 y 3

Fecha: 2026-10-06. Árbol revisado: `364b177` y el árbol de trabajo actual.
Método: lectura de código, textos y Bitácoras. Película y log de `artifacts/arithmos/it03/watch-directa/` (caps. 1–2, ruta directa). `node --test tests/`: 40/40 pasan. No abrí el navegador ni corrí Playwright. **No hay imágenes grabadas del cap. 3.**

Rutas abreviadas: `ch1` = `experiments/arithmos/src/ch1/scenes.js`; `ch2` = `.../ch2/scenes.js`; `ch3a`/`ch3b` = `.../ch3/scenes-a.js` / `scenes-b.js`.

---

## Severidad ALTA

### A1. Cap. 2: el primer numeral de Punto se ve "4 1" (error matemático, visual)
- **Dónde:** `ch2:436-454`. Los sueltos de la bolsa de 14 quedan en el montón (`pilePos`, x 6140–6560, `ch2:72-75`). El atado salta a `FRAME.x-120 = 6600` (`ch2:544`, `placeBundle` en `ch2:467`). Punto escribe el "1" bajo el atado (x≈6590) y el "4" en el promedio de los sueltos (x≈6340). El "4" queda a la izquierda del "1".
- **Evidencia:** cuadro `film/01238.jpg` ("¡Escribiste!"). Se ve un 4 amarillo a la izquierda y un 1 amarillo a la derecha, tapado por Mara. En `01207.jpg` ("Treinta y siete") se repite el problema: los 7 sueltos quedan a la izquierda, sobre el trineo; los 3 atados a la derecha, bajo Mara; el "37" más a la derecha todavía.
- **Por qué importa:** es el instante en que se presenta el valor posicional. En pantalla, de izquierda a derecha, se lee 41, y el texto dice "El 1 no cuenta palitos: cuenta atados". Además los sueltos se confunden con los trazos del trineo.
- **Cómo comprobar:** después de atar, ordenar atados a la izquierda y sueltos a la derecha. Escribir cada cifra bajo su grupo y verificar en una película que se lee "14" y "37". También conviene una prueba que compare la x del "1" con la del "4".

### A2. Cap. 3: unidades y saldos incoherentes con el cap. 2 (error matemático, de cantidades)
- **Dónde:** `ch3/common.js:74-80`. La ficha "que se tiene" es `item(w, 1)`, o sea **un atado de diez**, y la deuda es un atado punteado. La línea cuenta en atados (Recta +3, Oval +1, Curva −1, Espiral −4: `ch3a:263-268`). Pero el registro de Mara sigue en palitos y con valor posicional: Recta "52", Oval "302" (`ch3a:45-47`, `204-206`). Al lado se anota Curva "−3" por "tres atados".
- **Contradicciones concretas:**
  - Por la lección del cap. 2, un "3" solo en esa columna cuenta sueltos; tres atados se escriben 30. Es el mismo error de los Oval (32 en vez de 302).
  - Oval es 302 en el registro y +1 en la línea.
  - Recta es 52 en el registro, regala 2 atados y después "tiene cuatro y me debe uno" (+3).
  - Curva tenía 37 en el cap. 2 (`ch2:974`), o sea 3 atados y 7 sueltos, y en `ch2:1265` / `ch3a:57` dice "no tengo ninguno".
  - El diseño pedía "palito hueco" (`ARITHMOS_DESIGN.md`, cap. 3); se implementó un atado hueco.
- **Por qué importa:** el capítulo de los enteros contradice el valor posicional recién construido, en el mismo registro donde se corrigió el cero.
- **Cómo comprobar:** usar el palito como unidad (deudas de palitos) o declarar la unidad en el registro ("en atados"). Sacar del registro del cap. 3 los números del cap. 2, o hacerlos coherentes con la línea. Prueba: cada saldo de la línea coincide con su fila del registro.

### A3. Cap. 3: "Me pidieron prestado y ahora debo tres" invierte la deuda y contradice el modelo (error matemático)
- **Dónde:** `ch3b:81-83`. Curva pasa de −1 a −3.
- **Por qué:** "me pidieron prestado" significa que a Curva le deben, no que ella debe. Incluso leído como "pedí prestado", en el modelo del propio juego recibir dos atados prestados agrega dos pares cero (un atado y una deuda cada uno), así que **el saldo no cambia**. Es justo lo que enseñan 3.2 y 3.5 ("juntos valen cero").
- **Relacionado:** en 3.5, "Ya pagué dos. Debo uno" (`ch3b:132`). Pasa de −3 a −1 pagando con atados que no tiene.
- **Cómo comprobar:** que cada cambio de saldo en la historia corresponda a una operación del modelo (recibir, pagar, regalar, perdonar). Por ejemplo, "Gasté dos que no tenía; ahora debo tres", y en la mesa aparecen 2 deudas.

### A4. Cap. 1, gradas: "Alcanzan justo" puede ser correcto y el juego acusa un error de conteo (respuesta injusta e incorrecta; regresión de M15)
- **Dónde:** `ch1:1458-1460` ("¿Habrá lugar para todos?", "¿Y para mí?"), el estudiante parado en la punta de la fila (`ch1:1417`, `LINE_X0-70`; cuadro `014-c1.gradas-eleccion.png`), la pregunta "Así, en fila, ¿alcanzan los asientos?" (`ch1:1484`) y la devolución en `ch1:1628`.
- **Por qué:**
  - Son 13 en fila, más el estudiante, que acaba de preguntar por sí mismo y se ve como el primero de la fila: 14 para 14 asientos. "Justo" es correcto en esa lectura, y al final efectivamente se sientan 14 sin que sobre nada.
  - Con "justo" + "Los conté", el juego dice "Se me escapó alguien, o conté a uno dos veces", que es falso.
  - La versión it02 decía "La Ronda y Punto… Se pusieron en fila para subir" y preguntaba "¿para toda la fila?" (`it02/watch-justo/log.txt:47-49`). La reescritura `f3974ca` lo quitó, y hoy nadie dice quién está en la fila (sólo un comentario en `ch1:1382`).
- **Cómo comprobar:** que la pregunta nombre la colección ("¿alcanzan para la Ronda y Punto?") o que el estudiante se aparte de la fila. Y que la devolución a "justo + conté" contemple contarse a uno mismo.

### A5. Cap. 2, "¿Cuántos más?": callejón sin salida silencioso y camino válido rechazado (error de modelo y bloqueo)
- **Dónde:** `ch2:1026-1053`.
  - Tocar dos veces un atado de Recta lo desata (`1029-1039`). En los demás capítulos ese gesto deselecciona.
  - Un atado no se puede emparejar con diez sueltos ("Un atado son diez: no se empareja con uno solo", `1048-1053`).
  - Los atados de Curva no se pueden desatar.
- **Reproducir:** desatar 3 o más atados de Recta antes de emparejar los atados. A Curva le queda un atado sin pareja posible y "ya no queda nada de Curva" (`1023`) nunca aparece. No hay mensaje; sólo se sale con "Repetir esta escena".
- **Por qué:** comparar un atado con diez sueltos es matemáticamente válido. El juego lo prohíbe con una frase que además es engañosa: nadie propuso emparejar el atado "con uno solo".
- **Cómo comprobar:** permitir emparejar un atado con diez sueltos, o desatar de cualquiera de los dos lados, y que deshacer un emparejamiento no desate. Una prueba de ruta: desatar 5 y luego terminar.

---

## Severidad MEDIA

### M-a. Cap. 2 confunde número con cifra justo después del cap. 1 (error de lenguaje matemático)
- **Dónde:**
  - "un número por cuarto" (`ch2:617`).
  - "Para que cada número tenga su lugar" (`ch2:1261`).
  - "los números quedan juntos" (`ch2:729`).
  - "Son sus primeros números" (`ch2:447`).
  - En la Bitácora: "así los demás números no se corren" (`ch2:1298`) y "mantuvo cada número en su lugar" (`ch2:1283`).
- **Por qué:** el cap. 1 termina distinguiendo número y numeral ("14" nombra un número). En ningún momento se dice "cifra" ni "dígito"; el código sí (`ch2:703`).
- **Cómo comprobar:** usar "cifra" o "dígito" en esas seis líneas.

### M-b. "El cero no cuenta nada" (error matemático, ambiguo)
- **Dónde:** `ch2:922` (estudiante) y `ch2:1298` (Bitácora: "El cero no cuenta nada: dice que en ese lugar no hay ningún grupo").
- **Por qué:** la frase se contradice: dice "ninguno", que es una cuenta. Además refuerza la idea de Mara ("el cero no era nada"). El diseño pedía conectar con el cero como cardinal de "ninguno", y el cap. 3 usa el 0 como número ("valen cero").
- **Cómo comprobar:** reemplazar por algo como "El 0 dice 'ninguno' en ese lugar".

### M-c. Cap. 1, conservación: regresión de M10
- **Dónde:** `ch1:1495-1516`.
- **Problema:** la reescritura `f3974ca` movió el apretado **antes** de sentar y cambió la pregunta "Juntos y apretados, ¿alcanzan los asientos?" por "Apretados, ¿cambia algo?". Las opciones son "Así entran más / Así entran menos / Son los mismos que antes".
- **Por qué:**
  - La correcta habla de identidad (no se fue nadie), no de cantidad. Alguien que no conserva la cantidad también la elige.
  - Su registro distinto la delata.
  - La predicción se hace sobre la fila larga y se verifica con la apretada, así que nunca se comprueba la fila larga.
  - La Bitácora (`ch1:2005`) dice "dijiste enseguida que seguía sobrando uno", respondiendo a una pregunta que ya no existe y antes de que sobrara nada.
- **Cómo comprobar:** apretar o separar **después** de ver el asiento libre y preguntar por la cantidad, con opciones del mismo registro.

### M-d. Cap. 1, "Hice una marca de más": la refutación es circular
- **Dónde:** `ch1:1081-1105`.
- **Por qué:** Punto recorre las marcas y el texto dice "ninguna tiene dos puntos" / "Nadie quedó con dos marcas. Las marcas están bien". Eso describe el emparejamiento actual, que es compatible con la hipótesis del jugador. Lo que la refuta es el registro previo: doce visitas, doce marcas, una por toque. La Bitácora (`ch1:2002`) sí apela al registro.
- **Cómo comprobar:** que la consecuencia muestre el registro (las uniones punto→marca de 1.3, o "eran doce y doce").

### M-e. Cap. 2, hileras de marcas: una respuesta correcta no se reconoce
- **Dónde:** `ch2:320-348`; Bitácora en `ch2:1280`.
- **Por qué:** ayer hay 34 marcas y hoy 37, así que "Hoy llegó más" es verdadero. El juego responde "No lo sé" y nunca revela 34. La Bitácora dice "Intentaste comparar… a ojo" aunque se pudo contar.
- **Cómo comprobar:** que después de atar los 37 se aten también las 34 de ayer (3 atados y 4 sueltos) y se cierre la pregunta.

### M-f. Cap. 2: el depósito cambia de contenido sin explicación (incoherencia de cantidades)
- **Dónde:**
  - El depósito "de todos" queda en 110 (`ch2:833`).
  - Acto seguido, el mismo edificio muestra "el lugar de los Oval" con 302 (`ch2:887`; cuadro `031-c2.cero-eleccion.png`).
  - Recta 52 y Curva 37 (`ch2:974`).
  - Luego 999 (`ch2:1110`).
  - "110" queda sin rótulo en el registro (cuadros `030`, `01562`).
- **Por qué:** con los números de la escena se puede hacer la cuenta, y no cierra (302 > 110 en el mismo depósito).
- **Cómo comprobar:** separar visualmente "depósito de todos" y "estante de una familia", o hacer que las cantidades sean consistentes.

### M-g. Cap. 2: los estantes de la comparación quedan adentro de los cuartos del depósito (metáfora visual que agrega una propiedad)
- **Dónde:** `ch2:949` (estantes en x 7500 y 8150, dentro del depósito que termina en 8350). Cuadro `film/01562.jpg`.
- **Por qué:** los 5 atados de Recta caen en el cuarto de "atados de atados" y los de Curva cruzan la pared entre atados y sueltos. Justo donde la posición significa valor, acá significa familia.
- **Cómo comprobar:** mover la comparación fuera del depósito.

### M-h. Cap. 3: signo de número y operación de restar sin distinguir en el juego
- **Dónde:** `ch3a:109-124` (Punto "inventa" la rayita, "su primer signo"; Mara la lee "Menos tres"), `ch2:983` (el estudiante ya escribió "52 − 37 = 15" un día antes) y `ch3b:218` ("−1 − (−2) = +1", con paréntesis sin explicar).
- **Por qué:** la distinción sólo está en la Bitácora (`ch3b:366`). El diseño lo listaba como límite a declarar. El jugador nunca decide nada sobre la diferencia.
- **Cómo comprobar:** un momento donde el mismo trazo cumpla los dos papeles y el jugador elija la lectura (por ejemplo, Mara lee "5 − 3" como "5, menos tres deudas").

### M-i. Cap. 3: "perdonar dos a quien debe uno" saca un atado de la nada (metáfora estirada)
- **Dónde:** `ch3b:133-209`.
- **Por qué:**
  - En la vida real, perdonar más de lo que se debe deja el saldo en 0, no en +1.
  - El par cero aparece sin origen, así que en la historia Mara regala un atado sin decirlo.
  - Nunca se dice la equivalencia central: quitar una deuda es lo mismo que dar un atado, −(−2) = +2.
  - El modelo de fichas sí está bien (`integers.js`).
- **Cómo comprobar:** declarar el límite ("es como si Mara te prestara uno y te lo perdonara") o usar fichas en un registro. Agregar la pregunta "¿qué otra cosa haría lo mismo?" con la respuesta "darle dos atados".

### M-j. Cap. 3: el orden en la línea se acierta sin entender
- **Dónde:** `ch3a:274` (cada familia lleva su número encima) y `ch3a:330-370` (se ubica buscando el rótulo igual; si se equivoca, sólo dice "Acá dice −3. Yo tengo −4").
- **Por qué:**
  - El diseño 3.3 pedía que ubicar −5 a la derecha de −2 generara una contradicción con las deudas. No se implementó.
  - El orden se justifica por convención ("más a la izquierda, menos"; `ch3a:374-375`).
  - La pregunta previa está formulada con deudas ("debe 4"), así que el error clásico "−4 > −1" nunca aparece.
- **Cómo comprobar:** una línea sin rótulos intermedios o preguntas con numerales sueltos.

### M-k. Cap. 3: "debajo de cero" y "deber" sin puente; la resta que da negativo no se juega
- **Dónde:** el pozo (`ch3b:230-292`) no se conecta con las deudas; sólo hay un paréntesis en la Bitácora (`ch3b:361`). `removeHaves` (2 − 5 = −3, en `logic/integers.js:25`) está probada pero no se usa en ninguna escena.
- **Por qué:** el diseño exige declarar que son dos lecturas del mismo número. Y el cap. 6 ("pasa sumando") necesita que sumar y restar sean movimientos en ambos sentidos.

### M-l. Cap. 3: interacciones forzadas
- **Dónde:** los 7 pasos de −4 a +3 (`ch3b:47-74`) y la subida del pozo (`ch3b:268-286`).
- **Por qué:** se ofrece un solo botón, "la marca siguiente", así que no hay decisión posible. El jugador no puede cometer el error de contar marcas en vez de pasos (8 en vez de 7). La Bitácora dice "Contaste siete pasos" (`ch3b:349`).

---

## Severidad BAJA
1. **Mara olvida lo aprendido:** en `ch3a:59` dice "Lo que no hay no se escribe", contra "Un cuarto vacío también se escribe" (`ch2:939`). Reinstala la idea errónea corregida en el cap. 2.
2. **Bitácora del cap. 3 que atribuye de más** (`ch3b:345`):
   - Si se eligió "con palabras", dice "elegiste una marca nueva".
   - Si se probó sólo "0" y después la marca, dice que se probó también "3".
3. **Bitácora del cap. 1** (`ch1:2003`): la predicción "no" se registra como "no alcanzan: la fila es mucho más larga" aunque el jugador dijo "Los conté". La clave `pair` quedó vieja y "Todavía no sé" no se registra. En `ch1:1627`, "no" + "Los conté" recibe "Mirábamos el largo".
4. **"El 14 nombra a los catorce"** (`ch1:1908`): el artículo vuelve a ligar el numeral a la colección. Basta "nombra a catorce", que es lo que decía la resolución de M5.
5. **"siete atados" sin antecedente** (`ch2:367`): el 37 todavía no se conoce y Punto sólo ató tres grupos de cinco.
6. **2.7, opción "dejar los diez":** el texto (`ch2:1174`) dice que Punto escribe "10" en una caja, pero `loadModel('1000', [0,0,10])` pone una cifra por caja con dos cruces. El texto y la imagen no coinciden.
7. **2.4, "espacio en blanco":** en 110 el cuarto vacío es el de los sueltos, así que el espacio queda al final y es invisible desde el principio. "Los números quedan juntos" (`ch2:729`) no describe lo que pasa.
8. **"cada número dice cuánto y para qué lado"** (`ch3b:331`): el 0 no tiene lado.
9. **El "+" de los positivos** aparece en opciones y rótulos (`ch3a:225`) sin presentarse.
10. **Texto fantasma "|−4| = 4"** (`ch3/common.js:39`) antes de introducir el valor absoluto. Lo mismo con "10 = 1 0" (`ch2/common.js:132`).
11. **Comentarios desalineados:** `logic/placevalue.js:52` dice "de los cuartos altos a los bajos" pero el bucle recorre de bajo a alto (función sin uso en escenas). `ch3/common.js:15` dice "a la izquierda" y calcula a la derecha.
12. **Documentación:**
    - `ARITHMOS_CURRICULUM.md` marca A4, A5 y B1–B5 "pendiente" y no tiene el contrato §5 de los caps. 2 y 3.
    - En el diseño del cap. 3 dice "palito hueco".
13. **Historia:** la Bitácora (`ch3b:367`) dice que + y − aparecen impresos en 1489 (Widmann) para exceso y faltante. Está respaldado por `fuentes.md` §9 (certeza alta). No encontré otras afirmaciones históricas en los caps. 1–3.

---

## A) Capítulo 1: disposición de M1–M18

| # | Estado | Comprobación |
|---|---|---|
| M1 | corregido | Fila de 720 u contra gradas de 316 u; se pide "¿Cómo lo sabés?". Hay un problema nuevo de ambigüedad: ver A4 |
| M2 | corregido | "Catorce marcas. Catorce palabras. Catorce de nosotros." |
| M3 | corregido | 14 visitas, con el estudiante y Punto (`presentOrder`); columna por columna (cuadro 00899) |
| M4 | corregido | El jugador cuenta y luego aparece "14". La interfaz impide equivocarse al contar |
| M5 | parcial | "nombra a **los** catorce" (baja 4) |
| M6 | corregido | "uno a uno", "colecciones que se terminan" |
| M7 | corregido | "lo que no cambia entre todas las colecciones…" |
| M8 | parcial | Existe "justo"; la devolución a "justo + conté" es injusta (A4; baja 3) |
| M9 | corregido | Misma velocidad (0.22) y el texto reconoce que contar sirve |
| M10 | parcial (regresión) | La conservación quedó antes de sentar, con opción de identidad (M-c); Punto sienta a 10 de 13 |
| M11 | corregido | Lino a la derecha, fuera de la fila (cuadro 00605) |
| M12 | corregido | `director.say` desactiva el salto |
| M13 | corregido | "¿qué hace un 1 ahí, si somos catorce?" |
| M14 | parcial | Nuevas atribuciones de más (M-c, baja 3) |
| M15 | **no** (regresión) | La línea que decía quién estaba en la fila se borró en `f3974ca`; hoy no se dice (A4) |
| M16 | corregido | Dos momentos desplegables; el cartel "Fin del capítulo 1" ya no cae sobre el 14 (cuadros 00955 y 00963) |
| M17 | parcial | Numeración 1.1–1.10 correcta; el currículo sigue listando "hay que emparejar" como predicción (hoy es "Todavía no sé") |
| M18 | corregido | "Alguien anotó acá, hace mucho." |

Problemas que introdujo la reescritura: A4, M-c, M-d y bajas 3–4.

## Qué no pude verificar
- **Cap. 3 en pantalla:** no hay película ni capturas. No vi la legibilidad del signo "−", de la deuda punteada, de la línea, del pozo ni de las barras |·|. Todo el cap. 3 se revisó sólo por código.
- **Comportamiento real:** no jugué, así que no confirmé en ejecución el callejón sin salida A5. Se deduce del código.
- **Rutas sin grabar:** la película sólo recorre la ruta directa, así que no vi las consecuencias de las respuestas equivocadas de los caps. 1 y 2.
- **Audio, táctil y rendimiento:** no evaluados.
- **Comprensión:** no hubo jugadores; esto no certifica que nadie entienda nada.
