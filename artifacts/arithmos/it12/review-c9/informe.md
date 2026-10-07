# Revisión independiente (matemática + narrativa/comprensión) — ciclo 9

Commits revisados: bc5bb47 (8.7), e493440 (8.8), 9c8b346 (10.3), 651e0bf (11.4 + guarda de botones), dcf36b5 (12.8).
Trabajo hecho sobre el código en HEAD (9c8b346), los diffs y las capturas de `it11/c87*`, `it11/c88*`, `it12/c103-*`, `it12/c114-*`, `it12/c12fin-*`. No se corrió el juego.

## Lo que se verificó y está bien (sin hallazgo)

- 11.4: los cocientes «a la vista» son exactos: 8/4 = 2; 14/10 = 1,4; 24/20 = 1,2; 54/50 = 1,08; 104/100 = 1,04. `ratio()` redondea a centésimos y `dec()` pone coma; no hay error de redondeo con estos valores. Las barras respetan el cociente (alto = H·(v − desde)/(104 − desde)); en la captura `c114-directa/004`, 240 contra 248 px ≈ 1,03.
- 11.4: el bucle no se traba: el 0 está siempre disponible, «así compara» con desde ≠ 0 vuelve al bucle con la corrección de Cornisa, y tocar el número ya elegido no hace nada.
- 10.3: sen 390° = sen 30° = 0,5; «sen(x + 360°) = sen x» es correcto; 2π ya se presentó en 10.1 (ch10/scenes-a.js:114).
- 8.8: el final de la sombra coincide con la marca correcta en las cinco horas (sombra hasta `fx + dir·(4 + 40·largo)`, marca k en `s0 + dir·40·k` con `s0 = fx + dir·4`; al mediodía, de fx − 20 a fx + 20 con la regla desde fx − 20). Las dos devoluciones («todavía hay sombra» / «ya no hay sombra») son correctas para cada lado.
- 8.7: las esquinas válidas son exactamente (3, −1) y (−1, 2); los tramos 4 + 3 y 3 + 4 se calculan bien; 4² + 3² = 25 → 5.
- main.js/ui.js: `camera.settling` sólo afecta la guarda de pruebas de superposición; no cambia nada que vea quien juega.

## Hallazgos

| ID | Sev. | Archivo:línea | Problema | Arreglo propuesto |
|---|---|---|---|---|
| A1 | alta | src/ch10/scenes-a.js:335 y :341 | Choque de id: la raya punteada nueva se llama `'c10-per'`, y `studentWrites(d, g, 'c10-per', 'sen(x + 360°) = sen x', …)` usa el mismo id. `World.add` (engine/world.js:15) borra el objeto que ya tenía ese id, así que la raya desaparece justo cuando el estudiante escribe la fórmula que ella justificaba, y el rótulo «360° más» queda flotando solo sobre la ola. Le pasa a cualquier jugador. | En :341 cambiar el id a `'c10-perw'` (o renombrar la raya a `'c10-perlink'` en :335). |
| A2 | alta | src/ch10/scenes-b.js:396 | La Bitácora del cap. 10 distingue sólo `half`, `more` y un caso por defecto. Con las marcas nuevas `top`, `zero` y `neg`, el jugador lee «A los 390° dijiste que no se sabía todavía», que es falso sobre su propia respuesta. Ninguna ruta del bot pasa por esos casos. | Ver Anexo A2: un texto por respuesta. |
| M1 | media | src/ch10/scenes-a.js:312-326 | No se ven los candidatos. Las rayitas de 12 px (w 1.6, p 0.7) no se distinguen a 1600×900 (`c103-errores/003`: sólo se ven la raya vertical y «390°»). No hay rótulos 1 / 0,5 / 0 / −0,5, y los lugares tocables `rect` son invisibles salvo con el mouse encima (styles.css:48-51); en teléfono no hay ninguna señal. Además, «más arriba que 1» (1,2) y «1» están a 14 px de mundo (≈12 px en 844×390): con 30 px de holgura táctil, cuál de los dos queda es casi azar, y quien marca «1» un poco alto queda anotado como «más arriba que 1». Un toque en −1 se anota como «−0,5» en táctil, o no hace nada con el mouse, y después el juego dice «Marcaste… en −0,5». | Rayitas de ±12 px, `w: 2.4, p: 0.95`, con un rótulo chico a la derecha de cada una (`'1'`, `'0,5'`, `'0'`, `'−0,5'`, size 14, BLUE). Sacar «más arriba que 1» de la raya y hacerlo un botón de palabra como «no se sabe»: `wordSpot('c10-mmore', 'más arriba que 1', X + 95, py(1.3), …)` (el punto de la predicción puede seguir yendo a 1,2). Opcional: un candidato −1, para que la raya sea simétrica; lleva su propia devolución. |
| M2 | media | src/ch10/scenes-a.js:339 | `top` (1), `zero` (0) y `neg` (−0,5) reciben la misma frase genérica, que no dice qué tenía de razonable cada error ni por qué no vale (el máximo es a los 90°; a los 360° está en 0 pero faltan 30°; −0,5 es a los 330°, 30° *antes* de cerrar la vuelta). | Ver Anexo M2. |
| M3 | media | src/ch10/scenes-a.js:319 | La pregunta ya trae la respuesta: «Girada 390°, una vuelta y 30° más: ¿…?». Descomponer 390 = 360 + 30 es justo el paso que tiene que dar el jugador; la frase lo da antes de que marque. | Reemplazar por: «Girada 390°, ¿a qué altura va a quedar la manija? Marcalo en la raya.» Agregar un segundo nivel de pista en :322: `'390° es más que una vuelta entera. ¿Cuánto más?'`. La descomposición ya está en el pensamiento posterior. |
| M4 | media | src/ch10/scenes-a.js:335-337 | La raya «360° más» es horizontal, a 0,5, de 30° a 390°, y pasa por el punto de los 150° (también 0,5; se ve en `c103-errores/004`). Invita a pensar que «vuelve» a los 120° y a confundir «misma altura» con «se repite»: el período es 360° porque se repite todo (la altura y si sube o baja), no una altura sola. | Dibujar un arco por encima de la ola en vez de la horizontal, con el rótulo en la cima: `S(Array.from({length: 25}, (_, i) => { const t = i / 24; return [lerp(px(30), px(390), t), py(0.5 + 0.8 * Math.sin(Math.PI * t))]; }), …)`. O agregar después de :339: «A los 150° también está a 0,5, pero bajando. Subiendo, como a los 30°, recién a los 390°: ahí se repite todo.» |
| M5 | media | src/ch11/scenes-a.js:231, :234 | «a la vista: ×2» se dibuja con `draw(96, 0)` *antes* de la predicción (:244-248; `c114-errores/002`). La palabra «a la vista» ya avisa que el doble es aparente, y en 0 el rótulo pasa de amarillo a blanco, que marca cuál es la opción «buena». | Agregarle a `draw` un parámetro `showRatio`. La primera llamada va sin rótulo; el rótulo aparece recién en el bucle, en :275 (`draw(from, 0, true)`, y también una vez justo antes del bucle con desde 96). Mismo color en todos los casos: `ch: YELLOW`. |
| M6 | media | src/ch8/scenes-b.js:314-318, :331-338 | Si el jugador dobla en (−1, 2), su ele azul queda dibujada y encima aparecen los catetos fijos por (3, −1) y la diagonal: se ve un rectángulo con diagonal (dos triángulos), mientras la descripción dice «un triángulo con ángulo recto». La ruta «errores» de c87 elige (−1, 2). | Dibujar los catetos por el cruce elegido: en :332-333 usar `[px(cx), py(cy)]` en lugar de `[px(3), py(-1)]` y `w.remove('c8-lpath')` antes de :331. «4 por la acostada, 3 por la parada» vale para los dos cruces. |
| M7 | media | src/ch12/scenes-b.js:371-382, :410 | Si elige «volver», Punto deja la Ronda a la que se acaba de sumar (:355-357: «Punto se suma a la vuelta») y cruza a «todo lo de antes» con el estudiante, sin una línea que lo diga. Eso choca con el cierre de su arco (pertenecer, el nombre). Además el estudiante se va sin decirle nada a Mara, que lo acompañó doce capítulos. La Bitácora («Punto llegó antes») no dice que cruzó. | Que Punto llegue antes y se quede en el umbral, del lado de las Terrazas: en :382 hacer el fundido sólo del estudiante y devolver a Punto a la Ronda. Textos en el Anexo M7. Si la idea es que Punto cruce, hace falta decirlo en escena (el estudiante: «¿Venís?», y Punto que mira la Ronda y vuelve a mirar la puerta) y en la Bitácora. |
| M8 | media | src/ch11/scenes-a.js:269 | «A la vista, la de Punto es ×1,4 de la de Mara; la tiza es 104 ÷ 100 = 1,04»: «es ×1,4 de» no es castellano natural, y «la tiza es 1,04» es impreciso (la tiza son 104 trozos; 1,04 es cuántas veces la de Mara). Es la línea que corrige al jugador. | `` `Todavía no. A la vista, la barra de Punto es ${dec(ratio(from))} veces la de Mara; la tiza de Punto es 104 ÷ 100 = 1,04 veces la de Mara. Mirá dónde empieza el eje.` `` |
| B1 | baja | src/ch8/scenes-b.js:304, :296 | Hay una sola nota para 31 cruces, y mezcla dos causas. «Dobla una sola vez» no explica nada cuando el tramo desde lo de Peldaño ya es diagonal (por ejemplo (0, 0)). La pista tiene un solo nivel. | Ver Anexo B1: nota según el caso y segundo nivel de pista. |
| B2 | baja | src/ch8/scenes-b.js:294 | «primero de un lado y después del otro» es vago: «lado» puede leerse como «costado de la casa», y no queda dicha la regla que después se usa para corregir («dobla una sola vez»). | «Por las rectas, Peldaño camina en ele: derecho por una recta, dobla una sola vez y sigue derecho por otra. ¿Dónde dobla?» |
| B3 | baja | src/ch8/scenes-b.js:340 | «Sin medir no se sabe» no tiene devolución propia: sólo «7» la tiene. | Después de :340: `if (c === 'measure') await d.think('Se sabe sin regla: 4 y 3 con esquina recta son las patas del tirante de Balcón, y el tirante salió de la cuenta.');` |
| B4 | baja | src/ch8/scenes-b.js:269 | El rótulo «Peldaño» tapa el «0» y el «−1» de los ejes (`it11/c87c/004`), justo los números que hay que leer para encontrar (3, −1). | En `house`, para y < 0 poner el rótulo debajo: `py(y) + 26` en lugar de `py(y) - 18`. |
| B5 | baja | src/ch8/scenes-b.js:374-379, :395, :400 | Al mediodía el sol se dibuja justo encima de Cornisa (`tx = fx`) y la sombra mide 1, repartida a los dos lados de los pies: con el sol vertical no habría sombra. Además, la regla de las 12 empieza detrás de los pies (fx − 20), distinto de las otras horas; ahora que el jugador mide, se nota. | Correr el sol de las 12 (por ejemplo `tx = fx - 60`) y dibujar la sombra de 1 desde los pies hacia la derecha (`s0 = fx + 4`), dejando «(la más corta)» en la tabla. |
| B6 | baja | src/ch8/scenes-b.js:387 | `refresh = () => hoursHint() \|\| g.ui.setSpots(…)` depende de que `setHint` devuelva `undefined`. Si algún día devuelve algo, las horas no aparecen y la escena queda trabada. | `const refresh = () => { hoursHint(); g.ui.setSpots(…); };` |
| B7 | baja | src/ch10/scenes-a.js:340 | «tu sombra no se hace negativa ni sube y baja así» contradice 8.8 («el largo baja hasta el mediodía y después vuelve a subir»), y es la línea que sigue al dibujo nuevo. | «Cornisa, la ola se repite cada vuelta, cada 360° o 2π. Se parece a tu sombra en que vuelve, pero no es la misma regla: tu sombra nunca se hace negativa, y de noche no hay sombra que medir.» |
| B8 | baja | src/ch10/scenes-a.js:313 | La raya de los 390° cruza el rótulo «360°» del eje (px(390) cae sobre el «°»; `c103-errores/003`, `c103-tel/003`). | Partir la raya en dos tramos y dejar un hueco entre `gy + 8` y `gy + 32`. |
| B9 | baja | src/ch11/scenes-a.js:279 | Al elegir 0, el pensamiento «Desde cero, casi iguales: ×1,04, como la tiza» aparece antes de que el jugador toque «así compara»: el texto ya decidió por él. | Borrar :279. Antes de :282 agregar `await d.think('Desde cero, ×1,04: lo mismo que la tiza, 104 ÷ 100.');`. |
| B10 | baja | src/ch11/scenes-a.js:258, :261 | «así compara»: comparar es transitivo y la frase suena a traducción. | Botón «así sirve»; label «Así el dibujo sirve para comparar las cantidades»; pista «… Cuando el dibujo sirva para comparar, tocá «así sirve».» |
| B11 | baja | src/ch11/scenes-a.js:230-237 | En 844×390 (`c114-tel5/003`), «Mara: 100», «Punto: 104», «a la vista: ×2» y el número del eje quedan en ≈10 px, y para decidir hay que leerlos (A4 sigue pendiente). | Tamaño 20–22 para esos cuatro rótulos (hay lugar a la izquierda de los botones). |
| B12 | baja | src/ch12/scenes-b.js:366-369, :388 | En las opciones se repite «puerta… puerta». Además están en primera persona, cuando en 1.2 las acciones van en segunda («Acercarte», «Quedarte quieto y esperar»). La línea de «quedarse» repite casi igual la opción que se acaba de tocar. | Pregunta «¿Volvés o te quedás?»; opciones «Volver por la puerta y dejarla abierta.» / «Quedarte un rato más: todavía hay cosas que no entendés.»; en :388, «Me quedo un rato más. La puerta no se va.» |
| B13 | baja | src/ch12/scenes-b.js:365 | No retoma «…No hay vuelta. Por ahora.» (ch1/scenes.js:156), que es la promesa que esta puerta cumple. «Todo lo de antes» es vago. | «La puerta del primer día. Aquel día no había vuelta; ahora sí. Del otro lado está todo lo de antes.» Opcional, para que rime con 1.1: que la describa una «tiza que nadie sostiene» (:364). |
| B14 | baja | src/ch12/scenes-b.js:409-410 | La línea de la puerta queda en medio de las matemáticas de la Bitácora (antes de la caja, la derivada y la integral), aunque es lo último que pasa. | Mover el bloque `final-door` después de `final-predict` (:417-418). |
| B15 | baja | src/ch12/scenes-b.js:362, :376 | Cuando aparece la elección, el estudiante está fuera de cuadro a la izquierda (`c12fin-watch-errores2/006`; el plano empieza en x 14240 y el estudiante está cerca de la pizarra, ~13850). Si elige «volver», camina ~1.900 px a 200 px/s: unos 9 s de cinemática. | Antes del plano de la puerta, acercar al estudiante a la Ronda (`d.walk(s, dance.cx - dance.r - 50, …)`, como en «quedarse»), o abrir el plano desde 13800; caminar a 320 px/s. |
| B16 | baja | src/ch11/scenes-b.js:332 | La Bitácora del cap. 11 no usa la evidencia nueva `graph-axis` (cuándo dijo «así compara» y con qué eje) y para «mintió con los números» dice sólo «te pareció decir otra cosa». | Ver Anexo B16. |
| B17 | baja | scripts/playthrough.mjs:~832, :~751; it11/c87*/log.txt | La ruta «errores» de 10.3 sólo prueba «más arriba que 1» (por eso A2 no saltó), y la de 8.8 sólo la marca de más (nunca «todavía hay sombra»). Las evidencias de c87 muestran «Doblando en (-1, 2)» con guion: se capturaron antes de agregar `nm`; el código actual escribe «−1». | Rotar en «errores» las respuestas de 10.3 (`top`, `zero`, `neg`, `unknown`) y en 8.8 alternar `len − 1` y `len + 1`. Regenerar c87. |

## Anexos (texto y código exactos)

### A2 — ch10/scenes-b.js:396

```js
const PP = {
  half: 'A los 390° marcaste 0,5, la altura de los 30°: la ola se repite cada vuelta.',
  more: 'A los 390° marcaste más arriba que 1; la manija nunca sube más que el rayo. 390° es una vuelta y 30°: la altura de los 30°, 0,5.',
  top: 'A los 390° marcaste 1, lo más alto; eso pasa a los 90° (y a los 450°). 390° es una vuelta y 30°: 0,5.',
  zero: 'A los 390° marcaste 0, como al cerrar la vuelta; 30° más la suben como al principio: 0,5.',
  neg: 'A los 390° marcaste −0,5, la altura de los 330°, 30° antes de cerrar la vuelta; 390° es 30° después: 0,5.',
  unknown: 'A los 390° dijiste que no se sabía todavía; una vuelta entera deja la manija donde estaba: la altura de los 30°.',
};
if (pp) seen.push(PP[pp.answer] || PP.unknown);
```

### M2 — ch10/scenes-a.js:339

```js
const T390 = {
  half: '390 es una vuelta y 30 más: misma altura que a los 30°.',
  unknown: 'No estaba puesta, pero se podía saber: una vuelta entera, 360°, deja la manija donde estaba. 390° son una vuelta y 30°: medio rayo, como a los 30°.',
  more: 'Seguir girando no la sube más que el rayo: 390° es una vuelta entera, 360°, y 30° más. La manija está donde estaba a los 30°: medio rayo.',
  top: '1 es lo más alto, y pasa a los 90°: a los 390° todavía le faltan 60° para eso. 390° es una vuelta entera, 360°, y 30° más: la manija está donde estaba a los 30°, a medio rayo.',
  zero: 'A los 360° la manija vuelve a 0, donde empezó. Pero 390° son 30° más: la suben lo mismo que los primeros 30°, medio rayo, 0,5.',
  neg: '−0,5 es la altura a los 330°, 30° antes de cerrar la vuelta. 390° son 30° después de la vuelta entera: la manija está arriba, como a los 30°, a 0,5.',
};
await d.think(T390[c]);
```

### M7 — ch12/scenes-b.js, rama «volver» (:371-382) y Bitácora (:410)

```js
// antes de la caminata
await d.say('student', 'Mara, vuelvo por la puerta del primer día. La dejo abierta.');
await d.say('Mara', 'Andá. Lo que entendiste, la Marea no lo borra.');
// … Punto se adelanta y llega primero (como ahora) …
await d.say('student', 'Punto, llegaste antes, como siempre. Quedate con la Ronda: paso y la dejo abierta, por si quiero volver a entrar.');
d.describe('El estudiante cruza la puerta. Punto se queda en el umbral, del lado de las Terrazas, y la luz queda prendida.');
await d.fadeTo(s, 0, 1).catch(() => {});
await zip(d, p, dance.cx + dance.r + 24, dance.cy - 20, 0.9).catch(() => {});
rondaDance(w, {speed: 0.5, ...dance, ids: [...RONDA_IDS, 'punto']});
```

Bitácora: `'Al final volviste por la puerta del primer día y la dejaste abierta; Punto llegó antes y se quedó con la Ronda.'`

### B1 — ch8/scenes-b.js:296 y :304

```js
g.setHint(() => [
  'Tocá el cruce donde dobla el camino en ele entre lo de Peldaño y lo de Rampa.',
  'El cruce tiene que estar en una recta que pase por lo de Peldaño y en otra que pase por lo de Rampa.',
]);
// …
const n = v => String(v).replace('-', '−'), at = `(${n(x)}, ${n(y)})`;
const fromP = x === -1 || y === -1, toR = x === 3 || y === 2;
g.note(fromP ? `Hasta ${at} vas derecho, pero de ahí a lo de Rampa no: tendrías que doblar otra vez.`
  : toR ? `De ${at} a lo de Rampa vas derecho, pero desde lo de Peldaño hasta ahí no se llega por una sola recta.`
  : `Ni desde lo de Peldaño hasta ${at} ni de ahí a lo de Rampa se va derecho por una recta.`);
```

(Ningún cruce equivocado cumple `fromP` y `toR` a la vez: esos son justamente (3, −1) y (−1, 2).)

### B16 — ch11/scenes-b.js:332

```js
const ga = ev.filter(e => e.kind === 'graph-axis');
const early = ga.filter(e => e.from !== 0).map(e => e.from);
if (gp) seen.push(gp.answer === 'check' ? 'Miraste dónde empezaba el eje del gráfico de Punto.' : gp.answer === 'lie' ? 'Pensaste que Punto había mentido; los números eran ciertos, 104 y 100: engañaba el dibujo.' : 'El gráfico de Punto te pareció decir el doble; era el dibujo, que empezaba en 96.');
if (early.length) seen.push(`Dijiste que el dibujo comparaba con el eje en ${early.join(' y en ')}; recién desde 0 se ve ×1,04, como la tiza.`);
```

## Veredicto

Las cuentas nuevas están bien: los cocientes de 11.4, sen 390° = 0,5, las marcas de la regla de 8.8 y los tramos 4 + 3 de 8.7. Ninguna interacción nueva deja al jugador trabado. Lo que no está a la altura es 10.3. Tiene dos errores seguros y baratos de arreglar: el id repetido, que borra la raya «360° más» apenas se escribe la fórmula, y la Bitácora, que les dice «dijiste que no se sabía» a quienes marcaron 1, 0 o −0,5. Además, la predicción todavía no hace pensar al jugador: los candidatos no se ven, «1» y «más arriba que 1» no se pueden separar con el dedo, Cornisa regala «una vuelta y 30° más», tres errores reciben la misma respuesta y la raya horizontal sugiere un período de 120°. En 11.4, el rótulo «a la vista: ×2» antes de predecir y el «como la tiza» antes de «así compara» le sacan la decisión al jugador. En 8.7 aparece el rectángulo de dos eles cuando se dobla en (−1, 2). El final de 12.8 rima bien con 1.1 («No hay vuelta. Por ahora.»), pero que Punto cruce en silencio dejando la Ronda, y que el estudiante se vaya sin despedirse de Mara, debilita el cierre. Recomiendo corregir A1, A2 y M1–M8 antes de dar el ciclo por cerrado; las bajas pueden ir al backlog.
