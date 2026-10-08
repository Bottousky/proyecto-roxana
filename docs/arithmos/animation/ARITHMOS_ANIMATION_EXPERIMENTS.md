# ARITHMOS · Registro de experimentos

Formato: hipótesis · técnica · implementación · resultado · evidencia · defectos · conclusión · siguiente.
Evidencia en `artifacts/arithmos/animlab/cNN/` (sin versionar: carpetas de capturas, como el resto de `artifacts/`).

---

## E01 — TEST 01 · línea (ciclo 1, 2026-10-07)

**Hipótesis**: (1) el tiempo de dibujo pesa más que la textura en que un trazo "parezca dibujado"; (2) un depósito por estampas aditivo, con el mismo compuesto de diente, da textura más pareja que los segmentos del motor actual y permite acoplar textura y velocidad.

**Técnicas** (misma guía, mismo pizarrón, mismas duraciones por trazo):
- A. motor actual (`stroke` + `drawStroke`), progreso lineal (como `d.draw`);
- B. `animlab/core/deposit.js` (estampa elíptica áspera, orientación fija de la punta, aditivo) + `animlab/core/motion.js` (plan de mano: ley 2/3, aceleración acotada, levantadas de Fitts);
- C. SVG `stroke-dashoffset` con ease-in-out + `feTurbulence`/`feDisplacementMap` + máscara de grano.

**Implementación**: `animlab/tests/t01-line.js`; captura `scripts/animlab-capture.mjs 01 …`; gráfico `scripts/animlab-plot.mjs … A.v,B.v,C.v`.

**Resultado** (medido en el lienzo de presión, franja de 700 px de la línea larga):

| | pico medio | CV pico | autocorr. 2 px | ancho medio (px) | CV ancho | huecos |
|---|---|---|---|---|---|---|
| A (t01e) | 0.763 | 0.135 | 0.85 | 5.17 | 0.168 | 0 |
| B (t01c, densidad 0.36, sin crestas) | 0.888 | 0.093 | 0.72 | 5.13 | 0.104 | 0 |
| B (t01d, densidad 0.30, crestas 0.55) | 0.493 | 0.107 | 0.90 | 3.79 | 0.244 | 7 |
| **B (t01e, densidad 0.40, crestas 0.35)** | 0.740 | 0.101 | 0.91 | 4.84 | **0.097** | 0 |

Velocidad (speed.png de t01d): A rectangular (0→570 px/s en un cuadro); C triangular con pico 1717 px/s a mitad de la línea; B sube a ~620 px/s en ~0.1 s, crucera, frena; las marcas cortas en campana (pico ~730 px/s).

**Evidencia**: `c01/t01c/crop-0..2.png` (A, B, C a dpr 3), `c01/t01d/speed.png`, `c01/t01e/crop-1.png` (B final), `c01/t01*/sheet.png`.

**Defectos**:
- A: textura a cuentas visible a dpr 3 (huecos regulares del recorrido por cerdas).
- B t01d: crestas demasiado marcadas → línea rota, "chispeante" (peor; revertido a 0.35/0.40).
- B: la autocorrelación a 2 px es alta también (0.91), pero aquí no es periodicidad sino suavidad (variación lenta de presión); la métrica de 2 px **no distingue cuentas de suavidad** → se reemplaza por inspección de recorte + espectro en E02.
- C: grano uniforme en espacio de pantalla; sin presión, sin extremos.
- A 1× (captura completa) las diferencias de textura A/B son pequeñas; la diferencia de **tiempo** es la más visible (hipótesis 1 apoyada).

**Conclusión**: B + plan de mano supera a A en tiempo (N1 → N3 del quality bar) y empata o mejora levemente en textura (ancho más parejo, sin cuentas). C se descarta para el producto. El compuesto de diente del motor actual se conserva: es la base de la textura en A y B.

**Siguiente**: E02 círculo (curvatura → la ley 2/3 se ve; corrección y borrado; cruces que acumulan; rendimiento de B con muchos trazos).

---

## E02 — TEST 02 · círculo (ciclo 2, 2026-10-07)

**Hipótesis**: el modelo de gesto (trazo / tiza apoyada / espera / borrador, en orden temporal y buscable) alcanza para las seis variantes pedidas sin código especial por variante, y el depósito aditivo hace visibles la pausa y el repaso.

**Técnica**: `animlab/core/gesture.js` (compile/draw/hand) sobre `deposit.js` + `motion.js` (con `profile` para acelerar a propósito). Círculo antihorario desde arriba a la derecha, sobrepaso leve al cerrar.

**Resultado** (`c02/t02c`):
- Precisión: radio medio 95.0 ± 0.3 px (objetivo 95), desviación máx. 2.7–3.6 % (temblor y deriva intencionales); el círculo «e» malo llega a 13 % a propósito.
- Velocidad (`c02/t02a/speed.png`): lenta 260 px/s, rápida ~1150 px/s, pausa con frenada a 8 px/s, 0.55 s quieta y arranque; «acelerando» de ~200 a ~750 px/s; las pasadas del borrador en vaivén.
- Pausa: en el punto donde la tiza quedó apoyada se ve un óvalo más cargado (`t02c/crop-0`, abajo).
- Corrección (`t02c/crop-3` a t = 2.75 s y `crop-1` final): el borrador quita el tramo abultado dejando motas; el tramo rehecho se superpone al viejo y **carga más** (pico 0.92 vs 0.76 en un tramo no tocado); quedan restos del trazo malo fuera de la curva corregida, como en un pizarrón real.
- Costo: 300 trazos completos (≈ 94 000 estampas) en 298 ms → ≈ 1 ms por trazo terminado. **Requisito de integración**: los trazos terminados se cachean como bitmap (como hace hoy `Drawing`); sólo los que se están dibujando se estampan por cuadro.

**Defecto encontrado y corregido**: `destination-out` en el lienzo de presión hacía *reaparecer* la tiza borrada como banda blanca lisa (`t02a/crop-5`): la subida a WebGL des-premultiplica el color de los píxeles semitransparentes. El borrado correcto mezcla hacia negro (presión 0) con `source-over`. Calibración exacta del borrador: alpha por estampa = 1 − (1 − fuerza)^(1/N), con N = estampas superpuestas.

**Defectos abiertos**: el borrado deja motas pero no la **neblina** de polvo que deja un borrador real (E07); los segundos de borrado no producen sonido (E10).

**Conclusión**: el modelo de gesto sirve como primitiva única para dibujar, pausar, corregir y borrar con tiempo buscable. Nivel estimado: Timing N3, Textura N3–N4 (acumula, carga en la pausa), Continuidad N2 (nada aparece sin trazo; el borrado todavía no tiene borrador visible).

**Siguiente**: E03 escritura matemática con glifos de un trazo y transformación con identidad por símbolo.

---

## E03 — TEST 03 · escritura y transformación de una ecuación (ciclo 3, 2026-10-07)

**Hipótesis**: (1) glifos de un solo trazo escritos con el plan de mano se leen tan bien como la fuente actual y se ven *escritos*; (2) una transformación con **identidad por símbolo** (lo que se conserva se desliza, lo nuevo se escribe, lo cancelado se tacha y se borra, el «=» fijo) se entiende como operación, mientras que el fundido cruzado del motor actual se ve como "cambio de diapositiva".

**Técnica**: `animlab/core/glyphs.js` (0–9, x, y, +, −, =, (, ), /, · en orden de escritura escolar; partes suaves y con esquinas encadenadas sin levantar, p. ej. la cúspide del 3), `layoutAround` (el «=» como pivote), `animlab/tests/t03-equation.js` (fila A: `chalkText` + `reveal` + fundidos, como hoy; fila B: glifos + deslizamientos con mínimo jerk y arco + tachado + borrador por grupo en lienzo aparte + rastro de polvo).

**Resultado** (`c03/t03c`, `c03/t03d`, hoja `c03/glyphs-a`):
- Legibilidad: los glifos se leen a 36, 60 y 90 px (`glyphs-a/final.png`). La «x» va a altura x (0.6) y las cifras a 1.0, como en un cuaderno.
- Ritmo de escritura (`t03c/hand-write.png`): «x − 3 = 5» en 2.9 s; ~50 % del tiempo en el aire; micro-pausa visible antes del «=». Picos de ~600 px/s en trazos de 80 px.
- Transformación: la secuencia es causal y legible en la hoja de contactos (`t03c/sheet.png`): «x − 3» se corre a la izquierda (el «=» y el «5» quietos) → «+ 3» amarillo a la izquierda → el mismo gesto a la derecha → tachado de «−3» y «+3» → «8» escrito debajo de «5 + 3» (la correspondencia se ve) → se borran los cancelados y la suma → «x» y «8» se acomodan junto al «=»; el 8 crece mientras sube.
- La fila A (motor actual) muestra en `t03c/sheet.png` t = 5.33 la superposición fantasma de dos ecuaciones a la vez (fundido cruzado) y el cambio de largo del renglón con el «=» moviéndose de lugar.
- Rastro de polvo de lo que se desliza (`t03d/crop-0`, `crop-2`): visible, tenue, se asienta.

**Defectos encontrados y corregidos**:
- Escritura demasiado lenta (4.4 s): las levantadas de Fitts estaban sobredimensionadas (0.23 s a 40 px). Recalibrado `liftTime` (0.045 + 0.00025·d + 0.028·log₂(1 + d/6)): ~0.15 s a 40 px. *Las capturas de E01/E02 se hicieron con la calibración anterior.*
- El borrador dejaba motas nítidas en los giros del vaivén: ahora pasa ~w/3 más allá de la caja y con fuerza 0.965.

**Defectos abiertos**:
- No hay **mano visible**: la tiza escribe sola. Para N4 de continuidad hace falta quién escribe (la mano/figura o Punto) — E09/E10.
- El borrador tampoco se ve (E07).
- El rastro de polvo de un deslizamiento es una franja redondeada uniforme; podría seguir la forma del glifo (E07).
- Duración total 16 s: aceptable para enseñar, pero el ritmo de los tramos "leer" (0.6–0.7 s) no se probó con personas [H].

**Conclusión**: hipótesis (1) y (2) apoyadas. La identidad por símbolo es la diferencia cualitativa más grande hallada hasta ahora entre el motor actual y el objetivo. Nivel estimado de la fila B: Matemática N4 (correspondencia 5 + 3 → 8 visible, simetría del gesto en ambos miembros), Continuidad N3, Timing N3, Legibilidad N3. Fila A: Matemática N2, Continuidad N1.

**Siguiente**: E05 Punto (actuación: anticipación, asentamiento, segundo orden) y E09 figura; después E07 borrado con borrador visible y neblina.

---

## E05 — TEST 05 · Punto (ciclo 4, 2026-10-07)

**Hipótesis**: un punto puede actuar (intención, reacción, sorpresa) sólo con su trayectoria y su deformación, si (1) sigue objetivos con un sistema de segundo orden con respuesta inicial negativa (anticipa), sobrepaso ≤ 8 % y asentamiento; (2) se deforma conservando el área; (3) los cambios de estado (aparecer, dividirse, volverse línea) tienen causa visible.

**Técnicas**: A = `Dot` real de `world.js` con `zip` (ease-in-out 0.32 s), `hop` (seno), aparición y duplicados por fundido. B = `animlab/core/blob.js`: trayectoria integrada a 240 Hz con `SecondOrder` (f 1.7 Hz, ζ 0.66, r −0.45) y consultada en t; contorno áspero relleno con presión 0.68 (el diente da la textura); deformación por velocidad/frenado con área constante; salto guionado (agachada 0.1 s, despegue estirado, vuelo, aterrizaje aplastado y rebote amortiguado); división en dos fases (estrangulamiento lento 0.45 s con cuello, luego suelta); 1 → 2 → 4 → 8 en fila; una línea de tiza los atraviesa y cada punto se funde en ella al pasar la punta.

**Resultado** (`c04/t05a`, `t05b`, `t05d`):
- Trayectoria x (`t05a/x.png`): B retrocede ~20 px antes de salir (anticipación), sobrepasa ~9 % (ζ 0.62; subido a 0.66 → ~6 %) y se asienta en ~0.5 s; A es una rampa de ease de 0.32 s sin antes ni después.
- Salto (`t05b/y.png`): B reacciona 0.32 s después de que aparece la marca (percepción), se agacha, sube 70 px y rebota al aterrizar; A sube y baja en un seno de 40 px en el mismo instante en que aparece la marca.
- División (`t05d/split-stack.png`): óvalo → maní con cintura → cápsula → dos puntos; A: el segundo punto aparece por fundido encima del primero.
- 8 puntos → recta (`t05b/sheet.png` t = 9.9–11.5): cada punto se achica cuando la tiza pasa por él, en orden; al final queda sólo la línea. En A la línea crece lineal y los puntos se desvanecen todos a la vez.

**Defectos encontrados y corregidos**: relleno a 0.86 parecía papel recortado → 0.68; división instantánea (el resorte separaba en 0.08 s) → fase de estrangulamiento; cuello más ancho que las manchas deformadas (puntas) → ancho limitado por el aplastamiento; fusión con la línea calculada con avance lineal (los últimos puntos no se fundían) → instante de paso tomado del plan de la mano.

**Defectos abiertos**: no hay ojos ni "mirada": la atención de Punto se lee sólo por movimiento (suficiente según el lenguaje visual, a confirmar [H]); la respiración (±3 %) es apenas perceptible en capturas; el cuello podría estrangularse más.

**Conclusión**: B supera a A en todas las acciones pedidas; la actuación por trayectoria funciona. Nivel estimado: Actuación N3–N4 (anticipación y asentamiento medidos; superposición no aplica a un punto), Continuidad N3 (división y fusión con causa), Matemática N3 (2ⁿ y "la recta está hecha de puntos" se ven, sin texto).

**Siguiente**: E09 figura (superposición de cabeza/torso/brazos, pies plantados, mano que escribe) — la mano visible es lo que más falta en E03.

---

## Revisión independiente R1 (E03 y E05), 2026-10-07

Revisor con contexto fresco (sólo imágenes + QUALITY_BAR + VISUAL_LANGUAGE; sin código ni este registro). Veredicto: **ni B03 ni B05 alcanzan el mínimo de producción**; la mayoría de las dimensiones en N2–N3. Disposición de cada hallazgo:

| Hallazgo | Disposición |
|---|---|
| B03: el «8» aparece suelto bajo «5 + 3»; falta un gesto que relacione | **Aceptado** → subrayar/abrazar «5 + 3» con un trazo y escribir el 8 desde ahí; la mano visible lo hará causal (E10). |
| B03: el miembro derecho se borra por partes (el «5» se va, el «+3» queda flotando) | **Parcial**: el vaivén avanza de izquierda a derecha (es físico), pero sin borrador visible se lee como desaparición. → borrador visible (E07). |
| B03: óvalos semitransparentes detrás de glifos sin causa | **Aceptado**: el rastro de polvo es una franja redondeada que no tiene la forma de lo que se movió. → rastro con la forma del glifo arrastrado. |
| B03: velocidad en pico, sin rampa | **Rechazado con evidencia parcial**: en trazos de 30–80 px el perfil correcto es campana (mínimo jerk), no trapecio; la aceleración escala con el tamaño (16× la velocidad de crucero). Se corrige el texto del lenguaje visual (5000 px/s² era para líneas largas). Se muestreará a 240 Hz en el próximo gráfico. |
| B03: crucero oscila ±10 % en trazos largos | **Rechazado**: son curvas (el «3», el «5»): la ley 2/3 frena en la curvatura a propósito. |
| B03: glifos de grosor uniforme, "trazado técnico" | **Aceptado**: falta modulación por dirección (bajadas más cargadas que subidas) y el peso subió de 0.09 a 0.12 del alto después de la hoja revisada. |
| B05: el salto no tiene vuelo | **Rechazado (error de lectura)**: la curva usa y de pantalla (hacia abajo); el "hueco" es el vuelo de 70 px. → los gráficos de altura se dibujan ahora como altura sobre el suelo (positivo hacia arriba). |
| B05: estira ~2:1 al moverse | **Aceptado**: tope de deformación 0.42 → 0.25 (lenguaje visual: ≤ 25 %). |
| B05: bordes duros y huecos binarios en la textura del punto | **Aceptado**: relleno con presión uniforme + umbral del diente → bordes escalonados. → presión decreciente hacia el borde y variación interna. |
| B05: quedan cuentas tras la fusión | Ya corregido en t05b (el revisor vio t05a). |
| B05: los intervalos de duplicación no se aceleran | **Error de lectura** (1.6 s y 1.2 s ya se aceleran); se acentúa: 1.3 s y 0.9 s. |
| B05: la x escalona sin causa | **Rechazado**: el escalonamiento es la división (cada nivel reparte el grupo); en la hoja se ve la causa. |

Lección de proceso: los gráficos deben estar en unidades que no se puedan malinterpretar (altura positiva hacia arriba, una sola hoja por versión) y el revisor debe recibir sólo la versión vigente.

---

## E09 — TEST 09 · figura de palitos (ciclo 5, 2026-10-07)

**Hipótesis**: con el mismo dibujo y las mismas poses del motor, (1) un plan de pisadas con pies plantados, IK y cadera de péndulo invertido elimina el patinaje y da arranque/frenada; (2) canales de segundo orden con retrasos (mirada → cabeza → torso → brazos) dan superposición y follow-through medibles.

**Técnica**: `animlab/core/actor.js` (canales con f/ζ/retraso propios; pisadas: despega cuando la cadera pasa el punto medio de los pies, aterriza a ¼ de paso; cadera con perfil de aceleración acotada; mezcla de 0.3/0.35 s entre piernas de marcha y de pie); se dibuja con `Figure.render` del motor (mismos trazos y hervor), sustituyendo sólo `skeleton()`.

**Resultado** (`c05/t09a`, `t09b`, `t09c`):
- Pies (`t09a/feet.png`): escalera perfecta — cada pie quieto mientras apoya (deslizamiento máx. 0.015 px por tick de 1/120 s), vuelo suave; la cadera acelera y frena (4.7 s, 14 pisadas). A desliza los pies continuamente (piernas senoidales sobre una cadera a velocidad constante).
- Mano/cabeza (`t09c/hand-head.png`): al señalar, la mano de B sube, se pasa ~10 px y se asienta (follow-through); A llega con un ease de 0.45 s sin sobrepaso.
- Recortes (`t09b/walk.png`, `act1.png`, `act2.png`): la caminata de B se lee como caminar (rodillas, paso cruzado); "¡ya sé!" (brazo arriba) y "uy" (mano a la cabeza) se leen.

**Defectos** (abiertos):
1. La **anticipación** de señalar está mal guionada: el recogido sube la mano en vez de bajarla (`hand-head.png` 6.0 s). Debe bajar/atrasar la mano 80–140 ms antes.
2. La sorpresa casi no mueve la cabeza (alto de cabeza plano): falta el respingo (cabeza y torso atrás, 100 ms, antes que los brazos).
3. Las poses del motor en perfil esconden un brazo detrás del otro: siluetas débiles. Un ¾ (facing ≈ 0.6) y poses con brazos separados del torso darían siluetas legibles.
4. Paso corto (30·k) y balanceo de brazos chico frente a A: la caminata de B es correcta pero tímida.
5. No hay transición de mirada visible en capturas (los ojos son 2 puntos): la "mirada lidera" no se puede verificar en imagen fija; sólo por sonda.

**Conclusión**: (1) apoyada sin reservas — es un salto de N1 a N3–N4 en locomoción. (2) apoyada en lo medible (sobrepaso y retraso), pero la actuación todavía no alcanza N4 porque el guion de anticipación y las siluetas son débiles. Nivel estimado B: Actuación N3, Timing N3, Continuidad N3.

**Siguiente**: ciclo de pulido de R1 + E09 (lista en STATE), después E07 borrador visible y E10 microescena con mano visible.

---

## P1 — pulido por R1 y E09 (ciclo 6, 2026-10-07)

Cambios (evidencia en `c06/`):
- **Punto**: tope de deformación 0.25 (antes 0.42 → 2:1); relleno con presión decreciente hacia el borde (gradiente 1.08 → 1 → 0.55) que deshace el borde en el diente (`c06/punto-cmp.png`: arriba antes, medio después); divisiones a 1.3 s y 0.9 s (se aceleran); sonda de altura positiva hacia arriba (`c06/t05e/h.png`).
- **Ecuación**: rastro de polvo con la forma del glifo arrastrado (repetido tenue a lo largo del camino) en lugar de franjas ovaladas (`c06/eq-cmp.png`, fila 1 antes / fila 2 después); **subrayado de «5 + 3»** y el 8 escrito debajo del subrayado (fila 3); bajadas 14 % más cargadas que las subidas en los glifos.
- **Figura**: anticipación corregida (la mano baja y va atrás antes de subir: muesca visible a 6.1 s en `c06/t09d/hand.png`); respingo de cabeza en la sorpresa (headX a 7.4 s); ¾ de perfil al detenerse; paso 36·k y más balanceo.

**Resultado**: los hallazgos aceptados de R1 están resueltos salvo los que dependen de piezas nuevas (borrador y mano visibles). En la figura, el ¾ no alcanzó: las poses del motor dejan los brazos pegados al torso (`c06/t09d/act.png`, cuadros 1–2) — **la debilidad es de diseño de poses, no de tiempo**.

**Siguiente**: E07 borrador visible + neblina; E10 microescena con la mano que escribe (base de la vertical slice); un ciclo de poses con siluetas claras (brazos separados del torso, línea de acción).

---

## E07 — TEST 07 · borrado (ciclo 7, 2026-10-07)

**Hipótesis**: un borrado se cree cuando (1) se ve qué borra (un borrador con forma que se mueve como una mano: frena en los giros, se inclina con retraso, entra y sale del pizarrón); (2) lo borrado se transforma en polvo **donde había tiza** (neblina corrida en la dirección de la pasada), no en un fundido uniforme; (3) quedan marcas del fieltro y cae polvo.

**Técnicas**: A = fundido de presión 0.8 s + fantasma de los trazos en la capa de polvo (lo que hace `Drawing.fade`/`dust` hoy). B = `animlab/core/eraser.js`: vaivén vertical con esquinas redondeadas y plan de velocidad (frena en los giros); huella rectangular de bordes blandos orientada como el borrador; neblina = (contenido ensanchado y desenfocado) ∩ (zona barrida), corrida ±13 px en la dirección de la pasada; bandas de fieltro muy tenues; partículas con gravedad emitidas donde había tiza; el borrador dibujado con tiza (contorno, lomo, fieltro rayado), aplastado al apretar.

**Resultado** (`c07/t07a`, `t07b`, comparación `c07/cmp.png`):
- B: el borrador entra desde arriba, barre en vaivén y sale; durante la pasada se ve lo que todavía no borró a la derecha (`t07b/crop-0`), y a la izquierda una neblina corrida en vertical donde estaban «3 + 4 = 7» y la recta, ilegible pero presente.
- A: todo se apaga junto, sin causa, y queda un fantasma nítido con la forma exacta de cada trazo.

**Defectos encontrados y corregidos (t07a → t07b)**: la neblina dejaba leer «3 + 4 = 7» (alpha 0.16 → 0.085, corrimiento 5 → 9 px por copia); las estrías finas dibujaban el zigzag como un trazo (→ bandas anchas de alpha ≤ 0.025); quedaba la punta del 7 en el triángulo sin cubrir entre dos giros (el vaivén ahora se pasa 38 px de la caja y el paso bajó a 54 px).

**Defectos abiertos**: nadie sostiene el borrador (en la escena, la mano o Punto); el borrado no suena [H]; el costo de `eraserDust` (dos lienzos auxiliares por cuadro) no se midió en teléfono.

**Conclusión**: B convierte el borrado de un fundido (N1 de continuidad) en una acción con causa y consecuencia (N3–N4). La neblina proporcional a lo borrado es un detalle que sólo existe en un pizarrón: candidato a nivel 5 de textura si un humano lo confirma.

**Siguiente**: E10 microescena: la mano (o Punto) que escribe y borra, con cámara y sonido → base de la vertical slice. Antes, E08 cámara (es parte de E10).

---

## E08 — TEST 08 · cámara (ciclo 8, 2026-10-07)

**Hipótesis**: sobre un pizarrón enorme, (1) el camino de zoom y paneo de van Wijk–Nuij con duración por costo perceptual mantiene la velocidad percibida acotada aun en viajes largos, donde un ease de duración fija la dispara; (2) "llegar antes" (la cámara quieta cuando empieza la acción) evita mover el encuadre mientras se dibuja.

**Técnicas**: A = `Camera.go` del motor (ease-in-out cúbico 1.6 s, zoom logarítmico, centro lineal) + temblor senoidal. B = `animlab/core/camera2.js`: `zoomPath` (van Wijk y Nuij 2003, ρ = √2, igual que `d3.interpolateZoom`), duración 0.35 + 0.75·S (0.6–3 s), perfil de mínimo jerk, `arrive` para llegar antes, temblor por trauma² con ruido coherente (sin rotación).

**Resultado** (`c08/pan.png`, `zoom.png`, `w.png`, hojas `t08A`, `t08B`):
- Pico de paneo en el viaje largo (ecuación → gráfica, 2 900 px de mundo a ancho 1 300): **A 3.85 pantallas/s, B 1.35** (2.8× menos). B se aleja a mitad de camino (`t08B/sheet.png` t = 4.83) y vuelve a acercarse; A cruza a zoom fijo.
- Duraciones de B por costo: 1.28 s (S 1.25), 1.98 s (S 2.18), 0.6 s (reencuadre, S 0.22), 1.22 s (S 1.16). A: 1.6 s para todo.
- Reencuadre: B termina a t = 7.0, justo cuando la tiza empieza el círculo; A recién arranca a t = 7.0 y se mueve durante todo el dibujo (`pan.png`, pico de A entre 7 y 8.6 s).
- Pico de zoom: A 4.09 log2/s, B 3.41.

**Defectos abiertos**: el temblor no se puede juzgar en imágenes fijas (sólo por sonda; [H] en movimiento); el viaje largo de B tarda 2 s, que puede sentirse lento si se repite seguido (para cortes de escena convendrá un corte, no un viaje).

**Conclusión**: hipótesis (1) y (2) apoyadas con números. B pasa a ser la cámara del laboratorio.

**Siguiente**: E10 microescena (personaje + tiza + matemática + cámara + sonido + transformación, 20–40 s).

---

## E10 — TEST 10 + TEST 04 · microescena «¿Cuántos son?» (ciclo 9, 2026-10-07)

**Hipótesis**: los módulos probados por separado (depósito + plan de mano, glifos, actor, blob, cámara) se combinan en una escena de ~17 s que se lee como fragmento de juego terminado, con un cambio de representación real: cantidad concreta (7 puntos) → correspondencia (un salto de Punto ↔ una marca) → agrupación (atado de cinco) → números bajo cada grupo → expresión «5 + 2 = 7». El sonido sale de la misma línea de tiempo.

**Técnica**: `animlab/tests/t10-scene.js`; `animlab/core/score.js` (partitura determinista: rasgueo con envolvente = velocidad real de la punta, golpecito al apoyar, pasos desde el plan de pisadas, notas de conteo en escala que sube; render fuera de línea a WAV); brazo que escribe por IK hasta la punta de la tiza (con aire entre trazos y vuelta al costado en pausas largas); la Ronda reacciona al aterrizaje de Punto.

**Resultado** (`c09/t10e`):
- Guion (s): entra 0.5 → la cámara llega al plano medio 3.7 → Punto aparece 4.0 (el alumno se sorprende) → cuenta 5.1–8.6 (saltos de 0.50 a 0.29 s: el conteo agarra ritmo) → «5», «+», «2» 9.7 → se inclina y escribe «= 7» 10.9–11.9 → comprende 12.4 → la cámara abre 13.3.
- Correspondencia visible en `t10e/sheet.png`: cada aterrizaje deja un anillo amarillo en el punto y una marca nueva; la 5.ª cruza las cuatro; «5» queda bajo el atado y «2» bajo el par (`t10e/moments.png`).
- Sonido (`t10e/score.wav`, 17 s): RMS medio con la tiza apoyada 0.021 vs 0.0019 sin contacto (11×); correlación entre velocidad de la punta y RMS 0.70 (el resto es energía de notas y pasos). **No escuchado: sin certificar [H].**
- Alcance del brazo: la punta queda dentro del alcance salvo un instante del «7» (11 px de más, `reachOver`).

**Defectos encontrados y corregidos** (t10a → t10e): las marcas tapaban la cabeza y el paso al costado tapaba lo escrito (→ escritura a la derecha de la cabeza, a escala de mano, ≈ 8 % del alto; inclinarse en vez de pasar por delante); el «+» no cabía entre 5 y 2 (→ par más separado); con la inclinación grande la cabeza pisaba las marcas (→ inclinación 0.26 y ecuación más compacta).

**Defectos abiertos**:
1. «5+2=7» quedó apretado (separaciones de operadores menores que las del lenguaje visual) para que entre en el alcance.
2. Un instante con la punta 11 px fuera del alcance (se nota como mano que no toca la tiza si se mira cuadro a cuadro).
3. El brazo cruza por delante de las marcas al ir al «7».
4. La comprensión del alumno (pose `open`) es débil como actuación: poses del motor (ver E09).
5. El plano final (ancho 1500) deja la escritura chica.
6. No hay borrado ni transformación con deslizamiento en esta escena (están probados en E03/E07, no integrados).

**Conclusión**: la combinación funciona y la escena es causal de punta a punta (nada aparece sin mano, salto o tiza). Es la base de la vertical slice, no la vertical slice: faltan poses fuertes, un respiro en la composición final y una revisión independiente.

---

## E11 — poses con silueta (ciclo 10, 2026-10-07)

**Hipótesis**: las poses del motor fallan en silueta porque el esqueleto es de perfil: a ¾ el brazo de atrás se pega al torso. Si cada pose trae la orientación que necesita (perfil para acciones hacia adelante, frente para emociones), las siluetas se leen sin cambiar el esqueleto.

**Técnica**: `animlab/core/poses.js` (`POSES2`, con `face`), `actor.js` usa la orientación de la pose si el guion no la fija y admite caminar hacia atrás (`walk.back`); hoja `animlab/tests/t09p-poses.js`.

**Resultado** (`c10/poses-a` → `poses-b` → `poses-c`): a ¾ (poses-a) casi todas las poses nuevas se parecían a las viejas; con su orientación (poses-b/c) se leen sorpresa (de frente, brazos arriba y afuera), pensar (mano al mentón), "uy" (mano a la cabeza), eureka (índice arriba), abrirse (brazos abiertos de frente). El encogimiento de hombros todavía es débil (el esqueleto no tiene hombros que suban).

**Aplicado a E10** (`c10/t10f` → `t10h`): el alumno se vuelve hacia nosotros cuando aparece Punto; eureka al terminar; **da dos pasos atrás para mirar lo que escribió** y recién ahí se abre (`t10h/final.png`): el brazo ya no tapa las marcas y el plano final relaciona puntos, marcas y cuenta.

**Conclusión**: la orientación por pose es la palanca de silueta más barata. Pendiente: hombros (para encogerse) y manos con forma (puño, índice) si un revisor lo pide.

---

## Revisión independiente R2 (E10 versión t10e) y disposición — ciclo 11, 2026-10-07

Veredicto R2: **No** (Actuación, Textura, Legibilidad, Continuidad en N2; Matemática N3). R2 vio la versión anterior a E11 (poses). Disposición:

| Hallazgo R2 | Disposición → evidencia |
|---|---|
| 1. No hay momento de comprensión | Resuelto en E11 + aquí: eureka con cabeza arriba y mirada a la Ronda, paso atrás, brazos abiertos (`c11/t10j/sheet.png` 12.98–14.84). |
| 2. Punto ↔ marca sólo temporal | **Resuelto**: un hilo celeste (relación, según el lenguaje visual) sale de cada punto contado y llega a su marca antes de que se escriba; el abanico final es el diagrama de la correspondencia uno a uno (`t10j/sheet.png` 7.42 →). |
| 3. Zoom sin causa | **Resuelto**: no hay zoom de entrada; el plano medio es fijo; sólo se abre al final, con el paso atrás. |
| 4. Nadie entra | **Resuelto**: el plano abre sobre la Ronda y el alumno entra desde fuera de cuadro (t = 0.9–2.8). |
| 5. Anillos amarillos tipo interfaz | **Resuelto**: celestes, imperfectos (radio ±2 px, sobrepaso, temblor). |
| 6. Punto pisa el anillo al posarse | **Resuelto**: se posa 36 px arriba del punto. |
| 7. Pizarrón sin historia | **Parcial**: rastro de polvo de los saltos de Punto (alpha 0.07, se asienta en 1.5 s). La acumulación en el cruce de la 5.ª marca existe (depósito aditivo) pero no se nota a escala de plano. |
| 8. «+» chico | **Resuelto**: 1.1× la cifra (el glifo «+» ocupa ~50 % del alto). |
| (Textura) fondo degradado plano | **Rechazado**: el pizarrón tiene diente y manchas (compuesto WebGL); a escala de hoja de contactos no se ve. Sin cambio. |

## VS1 — vertical slice candidata (ciclo 11)
`animlab/?test=10&play=1` (clic para sonido). Evidencia `c11/t10j`. Pendiente: revisión R3 sobre esta versión.

## E12 — rendimiento y VS1.1 (ciclo 11, 2026-10-07)

**Rendimiento** (VS1, Chrome de escritorio con GPU, 120 instantes buscados): sin caché, tiza 4.9 ms (p95 6.3) y cuadro 10 ms; con `drawDepositCached` (un trazo terminado se estampa una vez en un bitmap a la escala de la vista y se compone con 'lighter') **tiza 0.8 ms (p95 2.2–2.5) y cuadro ~1 ms** en 1600×900@1, @2 y 844×390@3. Regresión de píxeles con/sin caché (`scripts/animlab-diff.mjs`): |Δ| medio 0.29–0.35 / 255, 0.27–0.33 % de píxeles con |Δ| > 16 (bordes del umbral del diente); visualmente idéntico (`c11/cache-cmp.png`). Teléfono real: sin medir [H].

**VS1.1** (`c11/t10l`): los hilos celestes salen hacia arriba de cada punto y bajan sobre su marca pasando por encima de la Ronda: ya no atraviesan otros anillos ni cruzan el atado (`t10l/final.png`). El plano final es el diagrama de la correspondencia uno a uno.

---

## Revisión R3 (VS1, `c11/t10j`) y VS2 — ciclo 12, 2026-10-07

R3: **No**, pero sube: Timing N3, Actuación N3, Continuidad N3, Matemática N3; Textura y Legibilidad N2. Lista mínima y disposición (evidencia en `c12/`):

| R3 | Disposición |
|---|---|
| 1. Los hilos convergen en un extremo: no se sabe qué marca es de qué punto | Marcas cada 13 px (17 px en pantalla) y cada hilo baja sobre su propia marca desde arriba (`c12/t10o/sheet.png` 11.46–18.15). |
| 2. Sin acento en el quinto | +0.4 s de quietud tras el quinto aterrizaje; par separado 64 px del atado. |
| 3. Punto: anticipación 0.07 s y sin reposo | Agachada 0.12 s; reposo ≥ 0.32 s entre saltos (`c12/punto-h.png`: mesetas entre saltos y muesca de agachada antes de cada uno). |
| 4. El brazo de eureka cruza la cara | Eureka de perfil con el brazo adelante; **queda**: al subir, el brazo barre por encima de la ecuación (`c12/phone` t = 14.33). |
| 5. Paso atrás débil, cola muerta | Dos pasos atrás (170 px a 190 px/s) con anticipación; cola final ≤ 1 s. |
| 6. El rastro del salto se confunde con el hilo | Rastro de polvo ancho (30 px), desenfocado, alpha 0.05. |
| 7. Fragmentos antes de entrar | Entra desde 690 (fuera de cuadro): t = 0 y 0.95 vacíos de alumno. |
| 8. Hilos finos; falta 844×390 | Hilos de 3 px a presión 0.6; captura a 844×390@3 (`c12/phone/sheet.png`): «5+2=7», marcas e hilos legibles. |

**Además**: el conteo se arma desde los toques del jugador (`build(taps)`), con «ya está» si se toca un punto ya contado (sin marca nueva); modo automático = toques guionados (`?taps=0,1,2,2,…` para probar repeticiones).

---

## E13 — escribir palabras (ciclo 13, 2026-10-07)

**Hipótesis**: para palabras en el mundo (306 `Label` en el juego, muchas con texto: «esta mañana», «la tabla de ayer»), unas minúsculas de un trazo escritas con el plan de mano superan a la fuente Kalam revelada, aun letra por letra.

**Técnicas** (misma duración): A Kalam + barrido rectangular (motor); B Kalam revelada letra por letra con ritmo de mano (barrido corto por letra, pausas entre letras y palabras); C minúsculas de imprenta escolar de un trazo (`glyphs.js`: a e m n ñ o p s t u, con repaso del palo en m/n/u y la «a» de un piso que arranca arriba a la derecha), peso 0.13 del alto de cifra, interletra apretada.

**Resultado** (`c13/words-b/cmp.png` final, `mid.png` a t = 2.5 s):
- Final: las tres se leen; Kalam (A/B) es cursiva y más "diseñada"; C es recta, coherente con las cifras de E03.
- **A mitad de escritura**: B muestra la «t» cortada por un rectángulo vertical (se ve que es un barrido); C muestra el palo de la «t» dibujándose. Sólo C cumple «nada aparece sin ser dibujado».

**Conclusión**: C para todo texto que se ve escribir; la fuente queda sólo para la lectura limpia (capa de accesibilidad) y la interfaz. **Trabajo pendiente**: alfabeto completo (a–z, mayúsculas usadas, á é í ó ú ü ñ, ¿ ? ¡ ! , . : → ×) ≈ 60 signos, diseñados y revisados en hoja como `c13/words-b`. Es diseño, no mecánica: lo hace la sesión principal, con revisión independiente de la hoja.

---

## Revisión R4 (VS2.1) y VS3/VS4 — ciclo 13, 2026-10-07

R4: **No** (Actuación y Legibilidad N2; Timing, Textura, Continuidad, Matemática N3). Disposición:

| R4 | Disposición |
|---|---|
| Correspondencia no trazable a 1×; 5 + 2 no se separa | Cámara se acerca al aparecer Punto (plano 1020 de ancho durante el conteo y la escritura): marcas 23 px CSS en 844×390. **Además** (VS4): llave que une los grupos y «7» debajo. |
| La mirada no lidera antes de comprender | Mira lo escrito (cabeza abajo), después la Ronda (cabeza arriba, la mirada se mueve antes por su canal más rápido), micro-encogida, eureka. |
| Sin señal para tocar | Mientras espera, Punto se inclina y da un saltito hacia el próximo punto sin contar cada 1.8 s (`c13/strip-wait`). |
| La negación no se ve | Vaivén de 15 px durante 0.8 s y **repaso del anillo** de ese punto (`c13/interactive3/2-ya-contado.png`). |
| Blanco de toque diminuto | Radio ≥ 26 px CSS (≥ 52 px de diámetro) además del radio de mundo. |
| Punto parece un octavo punto al final | Vuelve al alumno y se posa sobre su cabeza (en el hombro lo tapaba la cabeza). |
| Recorte dpr 3 de las marcas | **Hecho y reveló un defecto nuevo** (`c13/tally-dpr3`): al inclinarse para «= 7», la cabeza tapaba el atado. → **VS4**: sin inclinación; la llave y el «7» quedan al alcance (`reachOver` 0) y debajo (`c14/t10t/m.png`). |
| Final sin salida / repetir | Pendiente (no es parte de la escena; lo resuelve el juego). |

Medidas en 844×390: cifra 23 px CSS (plano medio), 16 px (final); «+» 8.6 px en el final (por debajo de 12 px: defecto abierto menor).

## E13b — alfabeto de un trazo (ciclo 13)
Conteo de signos en los `Label` literales del juego (162 textos): faltaban 14 minúsculas (d r l i c b q z j f h w v g), tildes, puntuación (: . , ? ¿), operadores (× → ÷ ° > ↑ ↓ ← √ ≈ %) y algunas mayúsculas (C P B A E R M S U O G D N Q). Diseñadas ahora: las 27 minúsculas, á é í ó ú, . , : ? ¿ - × →. Hoja `c14/alphabet-a/final.png`: se leen a 80, 60, 48 y 40 px, también en frases reales del juego («la tabla de ayer», «¿están todos?», «entra: 2 → se traba»); a 28 px el trazo afina (peso mínimo 3 px). **Pendiente**: mayúsculas usadas, ÷ ° > ↑ ↓ ← √ ≈ % y revisión independiente de la hoja.
- **E13c**: mayúsculas de imprenta usadas (A B C D E F G H I L M N O P Q R S T U V) y ÷ ° < > ↑ ↓ ← √ ≈ % | * ! ¡ (`c14/alphabet-b/final.png`): legibles a 56 y 40 px; frases «Mara · Punto · ¡Bien! · 100 ÷ 4 · 30° · √2 ≈ 1,4». Cobertura: todos los signos de los `Label` literales del juego.

## Revisión R5 (VS4) — ciclo 13
**No**, pero cerca: Timing N4 (provisional: pide gráfico de velocidad), Actuación N3, Textura N3, Legibilidad N3 (excepción: «+» 8.6 px en 844×390), Continuidad N3, Matemática N3. Lista para aprobar: (a) superposición visible en eureka y paso atrás; (b) piernas separadas al retroceder; (c) **agrupación 5|2 del lado de la Ronda**; (d) hilos distinguibles; (e) «+» ≥ 12 px en teléfono; (f) polvo en el cruce de la quinta marca; (g) mismo final en modo automático e interactivo (la captura interactiva era anterior a la llave).

## VS5 — correcciones de R5 (ciclo 13)
(a) superposición medida (`c15/eureka.png`: cabeza → torso → mano, la mano ~60 ms tarde y con sobrepaso); (b) paso atrás de ¾ y poses `lookUp`/`lookDown` con silueta (la del motor era un "chupetín" en perfil: `c15/interactive-end/stack.png`); (c) **lazos de Punto alrededor de los 5 y de los 2 en la Ronda**, sincronizados con la escritura de «5» y «2» (`c15/t10v/final.png`); si el jugador contó salteado y los grupos se entremezclan, hilos de cuentas en vez de lazos anidados (`c15/salteado.png`, arriba) — se lee peor que los lazos: limitación conocida; (d) hilos en abanico, más tenues que los lazos (jerarquía grupo > correspondencia); (e) «+» 1.3× y plano final más cerrado; (f) polvo en los cuatro cruces de la quinta marca; (g) misma escena en automático e interactivo (`c15/interactive.png`). Arreglos de herramientas: `animlab-capture` separaba mal `--q=taps=…`; `animlab-plot` arranca el eje en el primer dato.

## Revisión R6 (VS5) y VS6 — ciclo 14, 2026-10-07
R6: **No** (Timing N3, Actuación N3–N4 en el límite, Legibilidad N3 en orden / N2 salteado, Matemática N3). Lista mínima y disposición (`c16/`):
(a) quietud ≥ 0.35 s antes del «7» → 0.44 s medidos (`quieto.png`: Punto se detiene a 16.53, la tiza toca a 16.97);
(b) un gesto que una los siete → **lazo grande de Punto alrededor de toda la Ronda, sincronizado con la llave** (la unión dibujada en las dos representaciones a la vez: `finals.png` arriba);
(c) superposición → retraso de torso 0.08→0.11 s y brazo 0.10→0.14 s respecto de la cabeza (`eureka.png`: mano ~110 ms detrás);
(d) conteo salteado → contorno orgánico por grupo (`blob.groupContour`: unión de discos + cápsulas del árbol mínimo, marching squares + Chaikin) en lugar de hilos de cuentas (`finals.png` abajo).
La escena dura ahora 22 s.

## E15 — la figura con depósito (ciclo 14)
**Hallazgo** (recortes dpr 3 de VS6, `c16/textura.png`): la figura se dibujaba con el trazo del motor (segmentos, `lighten`) y lo escrito con depósito: dos texturas en la misma escena — la figura más manchada, con cuentas.
**Técnica**: `actor.drawFigureDeposit` (mismas guías que `Figure.strokes`, depositadas sin plan de velocidad; temblor según el hervor de 8 cuadros/s; peso 5.6·k).
**Resultado** (`c16/fig-cmp2.png`: arriba motor, abajo depósito): mismo peso visual, núcleo lleno y bordes ásperos, sin cuentas; coherente con la escritura. Costo: cuadro ~1.1 ms (p95 2.8–3.1) en los tres tamaños, sin cambio medible. `?figura=motor` conserva la versión anterior para comparar.
**Conclusión**: la figura pasa a depósito. Para la migración: `Figure.render` también se adapta (no sólo `Drawing`).

## Revisión R7 (VS6) y VS7 — ciclo 14
R7: **No** (N3 en todo; eureka N4). Lista y disposición (`c17/`): (1) Punto arrancaba y frenaba en seco en los lazos → anticipación 0.14 s, aceleración 2500 px/s², asentamiento (`punto.png`); (2) tiza > 5000 px/s² → 5000 (`tiza.png`); (3) piernas fuera de cuadro en el plano medio → plano 1100 de ancho con el suelo dentro (`t10z/sheet.png`); (4) **el hilo nace de la marca** recién escrita y sube al punto; (5) el plano final arranca con el paso atrás; (6) quietud antes del 7: 0.6 s. Además: al retroceder, balanceo de brazos al 25 % (el brazo barría «5+2»). Texturas a dpr 3: `textura.png` (escritura, lazos, figura con depósito).

## Revisión R8 (VS7) y VS8 — ciclo 15
R8 midió sobre las sondas: **No** — la tiza pasaba de 0 a crucero en un cuadro (8 400–11 300 px/s² a 60 Hz). Hallazgos y disposición (`c18/`):
1. **Error del modelo de movimiento** (afecta a todos los tests): (a) la media móvil se aplicaba después de los límites de arranque/frenada y subía la velocidad junto a los extremos (salto de **92 000 px/s²** en la 1.ª muestra de una marca, medido sobre el plan); (b) las frenadas por curvatura (ley 2/3) no respetaban la aceleración máxima. Corrección en `motion.planStroke`: suavizar y **después** limitar aceleración con pasadas hacia adelante y hacia atrás (planificador de movimiento). Además, en la escena, aceleración ∝ velocidad (rampa ≥ 0.12 s). Resultado: **máx. 5000 px/s² en todos los trazos** (métrica `chalkAccelMax` sobre el plan), rampas visibles (`tiza.png`).
2. Conteo salteado: **los puntos se juntan** (5 y 2) antes de los lazos; anillos e hilos los acompañan (los hilos se rehacen con la posición viva del punto); los lazos ya no se cruzan (`finals.png` abajo, `salteado-junta/sheet.png`).
3. Hilos al 45 % después de la unión.
4. Lazos de Punto sin frenadas en V (suavizado amplio del plan).
5. Eventos «empieza el 7» / «termina el 7»; 404 del favicon del laboratorio resuelto.

## Revisión R9 (VS8) y VS9 — ciclo 16
R9: **N3 en todas las dimensiones** (mínimo de producción alcanzado); falta N4 en Timing, Actuación y Matemática. Disposición (`c19/`):
(a) saltos que se aceleran 12 % cada uno: vuelo medido 0.383 → 0.142 s, **3.º/1.º = 0.71**; (b) comprensión sin vaivén (micro-encogida chica), con contramovimiento antes de levantar la cabeza; superposición medida en ESTA corrida (`eureka.png`); (c) **mirada**: los ojos van a cada punto antes de que llegue Punto y bajan a la marca; (d) **de los lazos al 7**: Punto sigue de largo desde el lazo grande dibujando un hilo hasta la punta de la llave y espera ahí el 7; (e) sondas a 240 Hz (`--hz`), velocidad de contacto interpolada (redondear al índice hacía saltar la sonda: 15 → 72 px/s "instantáneo"); hilos al 20 % tras la unión; evento «escribe 5 y 2» en el primer trazo del 5.

## E16 — pies plantados (ciclo 16)
**Hallazgo** (sonda de pies del esqueleto a 240 Hz): el pie "apoyado" saltaba 16.2 px (= 6·k) al terminar una caminata hacia atrás y 9–13 px al empezar a caminar; además, al cambiar de pose u orientación los pies se deslizaban (el esqueleto 2D los recoloca).
**Técnica** (`actor.js`): pies plantados de pie (bloqueo de pie: el pie apoyado no se mueve; si la pose lo pide > 8·k más allá, pasito de 0.22 s de a un pie); piernas por IK hasta el pie plantado; las mezclas hacia/desde la marcha parten y llegan a pies quietos; cada caminata arranca con las pisadas reales (el de atrás primero; se intercambian los nombres si hace falta) y termina donde la dejó el plan.
**Resultado**: deslizamiento máx. **0.42 px por 1/240 s** con el pie apoyado (antes 16.2), ninguna muestra > 0.5 px (`c19/pies-entra.png`, `pies-atras.png`).

## Revisión R10 (VS9) y VS10 — ciclo 17
R10: **No** — bloqueaban (a) un salto de Punto de 58 px en una muestra (19.62 s) y (b) el hilo del lazo al 7 cruzaba el «2» y la llave. Disposición (`c20/t10a`):
(a) causa: tras el salto hacia la cabeza, Punto quedaba fijo en el punto de aterrizaje mientras el alumno retrocedía y al pasar a "posado" saltaba a la cabeza → ahora sigue a la cabeza también mientras se asienta; mayor paso fuera del conteo 4.8 px por 1/240 s (continuo).
(b) el lazo grande arranca y cierra del lado que mira a la llave; el hilo entra a la llave por su extremo derecho curvándose por debajo: no cruza glifos (`c20/t10a/final.png`).
(c) "las marcas van 0.6–1.1 s detrás" → **rechazado con sondas**: cada marca empieza 0.09–0.10 s después del aterrizaje (aterrizajes 5.60, 6.37, 7.08, 7.73, 8.35, 9.34, 9.92; inicios 5.70, 6.46, 7.17, 7.83, 8.45, 9.43, 10.01).
Pendiente: revisión R11 de VS10; desglosar en la tabla «5», «+», «2»; captura interactiva final esperando el fin de la escena.

## Revisión R11 (VS10) y VS11 — ciclo 18
Evidencia de R11: `c21/` (primera corrida de `scripts/animlab-evidence-t10.sh`). R11: **No** — Timing N2, Actuación N3, Textura N3 (prov.), Legibilidad N3, Continuidad N3, Matemática N4 (prov.). Disposición, verificada con sondas antes de cambiar nada (`c22/vs11`):
- (A) **Aceptado.** Los saltos de Punto arrancaban a velocidad plena y frenaban en seco; el estiramiento pasaba 78 → 100 % en un cuadro. Ahora el salto tiene cuatro fases: agachada 0.12 s → impulso 0.07 s (acelera mientras libera el estiramiento) → vuelo → frenada en el aire hasta 55 % y aterrizaje que sigue de largo y vuelve (x·e^(−τ/τ0), velocidad continua, sobrepaso ≤ 8 %, termina exacto a los 0.3 s). Los saltos que aterrizan para trazar (`brake`) frenan del todo en el aire. **Máx. cambio de vx por cuadro de 60 Hz / pico: 0.24–0.32** (antes 0.77–0.95).
- (B) **Aceptado.** Confirmado: la cabeza quedaba fija 5.8–10.4 s (sólo los ojos, ±3 px). Ahora mirada + cabeza van a cada punto en la agachada (~0.1 s antes del despegue) y bajan a la marca al escribir: inclinación −0.15…+0.29 rad (`mirada.png`).
- (C) **Aceptado.** Quietud antes de unir 0.31 → **0.53 s**.
- (D) **Parcial.** El nacimiento de Punto era un crecimiento lineal 35 → 100 % con alfa (escala-fundido). Ahora nace de un toque: mota 12 % → se hincha con sobrepaso a 109 % → 100 % en 0.3 s (sonda `size`). "Que salga de la mano": **rechazado** — Punto nace del pizarrón (es la Ronda la que lo trae), no del alumno.
- (E) **Aceptado.** La comprensión espera 0.15 s más tras el paso atrás.
- (F) **Aceptado.** La cámara queda quieta en 4.83 s; el primer despegue es a 5.22 s (0.39 s).
- (G) **Decisión documentada.** No hay «=»: la llave bajo «5+2» con el 7 es la notación de unión (la llave *es* el gesto de juntar, el mismo que el lazo grande en la Ronda). El «=» llega con las ecuaciones del capítulo; aquí sumaría un signo sin gesto.
- (H) **Aceptado, y la causa era mía.** (1) Al separar los eventos de la tabla, la pose `write` del guion quedó apuntando a un evento que ya no existía ('escribe 5 y 2') → t = NaN → la pose se perdía desde 11 s (también en `c21`): el actor ahora **rechaza eventos sin tiempo válido**. (2) En pausas largas entre trazos (> 1.4 s, mientras Punto traza los lazos) el brazo volvía a la pose de escribir, en alto, y cruzaba las marcas: ahora la mano baja y descansa debajo de lo escrito con la tiza lista (`c22/brazo3`).
- Evidencia faltante: final interactivo **recapturado** esperando el fin real (`interactive/3-final.png`, `ended: true`); ventana del nacimiento en la sonda `size`; `mirada.png` como sonda de la cabeza.
**Encontrado además al medir** (no lo vio R11): (i) al terminar cada caminata el peso de la marcha caía 0.4 → 0 en una muestra y torso/brazos saltaban (3.5–4.8 px en la cabeza; es el "4.82 px" que en VS10 di por continuo — **error de lectura mío**: era un salto aislado); (ii) la orientación suavizada saltaba si dos cambios caían en 0.18 s (0.08 rad en una muestra) → ahora dos promedios móviles de 0.09 s; (iii) aplastamientos en escalón al terminar trazos (1.06 → 0.82) y en el rebote final (0.82 ↔ 1.1); (iv) el hilo a la llave empezaba 0.04 s antes de terminar el lazo (2.75 px) → ahora sigue de largo sin agacharse. La evidencia mide ahora **saltos de posición aislados** (0) en vez de "mayor paso", que confundía movimiento rápido con discontinuidad.

## Revisión R12 (VS11) y VS12 — ciclo 19
R12: **No** — Timing 3, Actuación 3, Textura 2 (sin medir), Legibilidad 2, Continuidad 2, Matemática 3. Disposición (`c23/vs12d`):
1. "Rastros de conteo que no se asientan (VL §1)" → **la regla no aplica**: son hilos de correspondencia celestes (VL §3), no el rastro de polvo de un objeto que se desliza. **Pero la legibilidad sí**: siete arcos superpuestos no dejaban ver qué marca iba a qué punto. Ahora, al cerrarse cada lazo, **los hilos de su grupo se juntan en uno** (cada hilo desliza sus dos extremos, escalonados 0.06 s, en 0.7 s): del atado de marcas al lazo. Siete hilos → dos (5 y 2) → más el de la unión al 7. Es el paso de contar de a uno a ver grupos, dibujado. El de 2 pasa por arriba del lazo de 5 y baja al de 2 (sin cruzar el lazo de 5; un solo cruce entre los dos hilos, cerca de las marcas, inevitable porque el atado de 5 está a la izquierda y el lazo de 2 a la derecha). También responde a Matemática ("un gesto que una el 5 y el 2 con sus lazos").
2. Fundido de los hilos tras la unión → **aceptado** (VL §8): eliminado. Ya no hay ninguna opacidad animada en la escena. Entre hilos se compone con 'lighten' (dos hilos que convergen no suman tiza).
3. Pausas de lectura < 0.35 s → **aceptado**: 0.4 s de espera tras cada aterrizaje; la mano llega antes y espera quieta 0.4 s; la pose de escribir se toma antes de la pausa. **Medido a 60 Hz (Punto < 5 px/s, sin tiza, mano < 20 px/s): 0.37 s antes del 5, del lazo de 2 y de la unión; 0.35 s antes del 7.**
4. Aterrizaje vertical sin oscilación → **aceptado**: el centro de Punto baja r·(1 − aplastamiento) con la base apoyada (también al agacharse y al asentarse tras un trazo), con el aplastamiento creciendo al ritmo de la caída (velocidad vertical casi continua: −306 → −290 → −180 → −80 → 0 px/s) y un rebote chico; hundimiento 3.6 px y vuelta en ~0.15 s. Los aterrizajes suaves (para trazar) casi no aplastan: queda quieto para leer.
5. Estiramiento fijo 1.06 durante el trazo y escalón 106 → 85 → **aceptado**: el estiramiento sigue a la velocidad; la agachada parte del aplastamiento que haya.
6. "El paso atrás no tiene causa visible" → **no se cambia**: retrocede para ver lo que escribió (mira hacia abajo, a «5+2 / 7»), y la comprensión llega después, al levantar la vista a la Ronda; mirar la Ronda ya al retroceder le quitaría el momento. Queda para la prueba con personas [H].
7. Nacimiento: sobrepaso 9.5 → ~6 %. Escalones de aceleración al tocar y levantar la tiza: la mano llega moviéndose (v0 15 px/s, v1 30 px/s) — es el contacto, no un error del plan.
Evidencia faltante resuelta: **textura medida sobre la presión** (cuadro final; autocorrelación del grano a 2 px tras quitar la tendencia: llave −0.12, 7 −0.08 → grano sin patrón; CV de ancho 0.17–0.19); **sonda de la mano corregida** (medía la mano de la pose, no la que escribe); eventos de los hilos que se juntan. Sigue faltando: anclaje de la textura con cámara en movimiento (dos cuadros), y la causa ficcional de que los puntos se junten en el conteo salteado.
Además: el centro de Punto saltaba 1.2 px cuando una agachada empezaba durante el asentamiento de un trazo → el asentamiento también baja el centro; 0 saltos aislados (umbral 0.6 px).

## Revisión R13 (VS12) y VS13 — ciclo 20
R13: **No, pero N3 en todas las dimensiones** (mínimo de producción). Falta N4 en Timing, Actuación y Matemática. Disposición (`c24/vs13`):
1. La comprensión caía sobre pasos (R13: Punto y el alumno en movimiento hasta 21.56; tres pasitos 21.45–22.05) → **aceptado**. El momento sale ahora del fin real de la caminata (`planWalk`, exportado del actor) + 0.35 s de mezcla + 0.25 s para el pasito de acomodarse + **0.4 s quieto** + 0.62 s de contramovimiento. El alumno se acomoda de frente a lo escrito al terminar el paso (no en la reacción); `stepK` 14·k (pasito sólo si la pose lo pide a más de 14·k); en «¡ya está!» las piernas no cambian. **Medido: 0.43 s quieto (Punto, cabeza, pies) antes de la reacción; ningún paso entre 22.08 y 23.45 s.**
   **Encontrado al revisar la tira** (nadie lo había visto: la pose dura 1 s y ningún cuadro de las hojas caía ahí): en «¡ya está!» el brazo subía vertical **atravesando la cabeza**. Ahora sube hacia adelante y arriba, hacia la Ronda y lo escrito (`c24/strip-comprende5`).
2. Saltos 5–7 con pico/media 2.1–2.6 (perfil triangular) → **aceptado**: el impulso y la frenada ocupan a lo sumo 35 % del vuelo cada uno (queda crucero) y los saltos rápidos son más bajos (altura ∝ vuelo^1.5, como con gravedad). **Medido: pico/media de la rapidez en vuelo 1.20–1.66**; Δvx por cuadro de 60 Hz / pico 0.24–0.34.
3. Impacto vertical al aterrizar marcado por el aplastamiento → no es defecto (R13 lo dice).
4. Sobrepaso del salto 7 en el límite (8 %) → tope bajado a 6 %.
Evidencia faltante: (a) polvo de Punto entre 19.5 y 21.9 s → **no aplica**: Punto va posado en la cabeza del alumno, no se desliza sobre el pizarrón; (b) fusión de hilos → recortes a dpr 2 en `hilos-recortes.png` (−0.05, +0.3, +0.6, +1.0 s; la fusión completa dura 0.7 s + 0.06 s por hilo); (c) **pico/media por trazo de tiza: 1.26–1.89** (mediana 1.73, 14 trazos); (e) **altura de las cifras en 844×390: 26.1 px CSS al escribir, 23.5 en el plano final**.
Pies: deslizamiento máx. 0.51 px por 1/240 s (al despegar el pie al empezar el paso atrás).

## Revisión R14 (VS13) y VS14 — ciclo 21
R14: **N3 en todo; N4 en Timing (condicionado a fijar la lectura de «3.ª marca») y en Matemática; Actuación N3** porque la mirada no se veía (ojos centrados y simétricos en los cuadros). Disposición (`c25/vs14`):
1. Mirada [C] → **aceptado, y era real**: los ojos se corrían 3·k en una cabeza de ~13·k: siempre parecían centrados. Ahora hasta 5·k (horizontal) y 4.5·k (vertical), dentro de la cabeza (si no, el ojo de afuera se pegaba al contorno). `mirada-caras.png`: mira arriba a la derecha al punto en la agachada del salto, baja a la marca al escribir, arriba a la Ronda antes de comprender; sonda `mirada` en `probes.json`.
2. «3.ª marca»: el QUALITY_BAR ahora dice cuál es el gesto repetido (el vuelo de cada conteo; aclaración R14) — 0.70.
3. Pausa de 0.98 s entre la 5.ª y la 6.ª marca → **diseño, ahora en la tabla**: «cierra el atado de cinco (pausa de 0.4 s)»; el atado de cinco es la idea que prepara 5 + 2. Desplazamiento de Punto tras el 7.º conteo → evento «Punto va al primer grupo».
4. Hilos a plena presión durante el conteo (7.7–13.3 s) → **no se cambia**: son las correspondencias que se están construyendo (el foco del conteo); bajarles la presión sería el fundido que prohíbe VL §8. Al cerrarse cada lazo se juntan (ya en VS12).
5. Paso atrás + zoom + Punto volviendo a la cabeza en el mismo instante → **aceptado**: el zoom empieza 0.35 s después (tras el primer paso y con Punto ya posado).

## Revisión R15 (VS14) y VS15 — ciclo 22
R15: **N4 en Timing, Matemática y Legibilidad**; Actuación N3 (faltan dos anticipaciones); Textura N3 provisional (toque y levantada sin medir). Disposición (`c26/vs15b`):
1. «¡Ya está!» sin contramovimiento del brazo → **aceptado**: en la micro-encogida el brazo baja antes de subir; **medido: la mano baja 3.5 px en ~0.1 s y recién después sube** (handH 179 → 175.5 → 369).
2. Punto posado subía 55 px con la cabeza sin reaccionar → **aceptado**: posado, se aplasta cuando la cabeza acelera hacia arriba y se estira cuando frena (inercia del que va encima; aceleración del apoyo promediada en ±60 ms). Medido: 100 → 102 (la cabeza baja) → 87 (empieza a subir) → 110 (frena arriba) → 100.
3. Nacimiento de Punto → decisión de diseño; tira densa en `strip-nace` (mota → crece con sobrepaso).
4. «comprende» no coincidía con un inicio de movimiento → la tabla separa «contramovimiento (baja la cabeza)», «levanta la vista a la Ronda» y «comprende» («¡ya está!», el brazo sube ~0.14 s después).
**Toque y levantada (Textura N3)**: al medirlos apareció un **error del depósito**: el toque (+18 %) se aplicaba antes del tope de la cantidad por estampa y el tope se lo comía (mediana +0 %). Ahora toque y levantada se aplican después del tope (el cuerpo del trazo no cambia). **Medido: por trazo, toque 1.14 y últimos 3 px 0.42 del tramo medio (11 trazos); en la presión dibujada de la llave, primeros 5 px 1.19 y final 0.28** (VL §2: +10–18 %, cae al 35 %). La dependencia del depósito con la velocidad (N4) no se puede medir en la cantidad (el cuerpo del trazo está topado): queda sin certificar.

## Revisión R16 (VS15) — ciclo 23: **aprobada**
R16: **Sí — N3 en las seis dimensiones y N4 en Timing, Actuación y Matemática** (Timing 4, Actuación 4, Textura 3, Legibilidad 3, Continuidad 3, Matemática 4). Sonido y Rendimiento quedan sin certificar [H]/[dispositivo]. Lo que la separa de N5 (según R16): contraste error/comprensión, polvo residual o borrado, ritmo que cambia con el estado de ánimo, predicción del cuadro siguiente [H].
**Benchmark congelado: `c26/vs15b`** (commit 948a9c75; etiqueta local `arithmos-animlab-benchmark-vs15`).
Pendientes no bloqueantes de R16 (para una pasada de pulido con su propia revisión, sin tocar el benchmark):
- D1 «Punto vuela 15.8 → 18.4 s sin motivo visible» → es el lazo grande que Punto traza (y el hilo a la llave); **falta evidencia**: tira densa del lazo grande y sonda de contacto de Punto (el lazo no aparece en `contact`, que es la tiza del alumno).
- D2 «bajar la presión de los lazos chicos tras la unión» → **rechazado** (fundido, VL §8).
- D3 el pie izquierdo se corre 3.5 px al despegar (19.77–19.81, alza 0.02–0.23): fijar el pie hasta que se levante de verdad.
- D4 la mano sube 174 → 341 en 0.33 s (pico ~3800 px/s) al terminar el 7, sin gesto legible: el brazo que escribe se suelta hacia la pose; bajarlo con el paso atrás.
- D5 la mirada satura en su tope en 22.4–22.7 s: aceptado como decisión o reescalar.
- E1–E4: cuadros 15.80/16.00/16.20 (llave), definir la métrica de quietud antes de comprender en el QUALITY_BAR, una sola definición de vuelo (la del plan, sin agachada), pausa del 7 en el límite (0.35 s).

## M1 — adaptador de cámara (`?anim=2`) — ciclo 23
**Qué**: `src/engine/camera-path.js` (van Wijk–Nuij + `travelTime` + mínimo jerk; el laboratorio lo importa de ahí: una sola copia). `Camera.go` con `pathMode` (lo enciende `?anim=2` en `main.js`, `game.anim = 2`): el viaje sigue el camino óptimo de zoom/paneo con perfil de mínimo jerk; la proporción del plano cambia pareja (log); la duración sale del costo perceptual y `dur` es un **tope** (la escena sigue esperando `sec` en `d.shot`, así que sus tiempos no cambian; la cámara llega antes si puede). Cortes, `finish()` y saltar, iguales.
**Pruebas**: `tests/camera.test.mjs` — sin bandera el camino de siempre; con bandera plano final exacto, sin llegar tarde, arranque/llegada en reposo, sin saltos de velocidad, se abre al cruzar lejos; cortes y finish iguales. 106/106 pruebas.
**A/B en escenas reales** (`scripts/cam-ab.mjs`, tiempo del juego): c1.ronda, c1.vuelven, c1.marea. Con la bandera los viajes duran **0.5–1.0 s** (antes 1.2–2.8 s, la duración pedida entera), la rapidez pico queda en **≤ 0.82 anchos de plano por segundo** (antes ≤ 0.97) y el cambio máximo de rapidez entre cuadros es 7–9 % del pico en ambos (los dos suaves). La cámara llega antes de la acción (VL §7). El único pico (24 anchos/s) es el corte de c1.marea a c1.vuelven, igual en ambos.
**Regresión**: el bot del capítulo 1 termina igual con y sin bandera (mismas evidencias, 0 errores, fps mín. 46.7 / mediana 60).
**Abierto [H]**: si los reencuadres chicos de ~0.5 s se sienten bruscos frente a los 1.7 s de antes (el lenguaje visual pide duración por costo; el mínimo es 0.6 s de viaje).

## M2 — trazos de tiza del juego como depósito con plan de mano (`?anim=2`) — ciclo 24
**Qué**: `motion.js` y `deposit.js` pasan del laboratorio a `src/engine/` (el laboratorio los re-exporta: una sola copia; la slice da **el mismo cuadro final, píxel a píxel, que el benchmark** con las mismas opciones de captura — con otras opciones difería 0.4 % por la caché de mapas de bits armada a otra escala de cámara: comparar siempre con las mismas opciones). `src/engine/anim.js` (nivel de animación que fija `Game`). `stroke()` guarda guía, semilla y presión. `Drawing` con nivel 2: cada trazo se rehace como depósito con plan de mano (ancho ×1.75, presión ×1.12, temblor 0.45), `progress` es la fracción del **tiempo** del plan (trazos + levantadas de Fitts), `tip()` sigue la punta del plan, caché igual que siempre. `d.draw` con nivel 2: dura lo que dura el plan, con `sec` como tope (si el plan es más largo, se acelera).
**A/B** (`c28/`, c1.puerta): mismo ritmo de escena; el trazo viejo era grueso y "a cuentas" (bordes con halos), el depósito es una línea de tiza con núcleo lleno y bordes ásperos, y las líneas finas de los paneles quedan quebradas como en el original. Calibración del ancho con recorte dpr 2 (1.3 → 1.75: con 1.3 medía ~60 % del viejo).
**Regresión**: bot del capítulo 1 con la bandera sin errores, mismas evidencias, fps igual (mín. 46.7 / mediana 60; ese bot salta las animaciones).
**Sonido** (después): `chalkStart(sec, strength, env)` acepta una envolvente; `Drawing.soundEnvelope(sec)` la arma del plan (silencio en cada levantada, nivel 0.35–1 según la velocidad de la punta, golpe programado al empezar cada trazo: `tap(…, delay)`), en lugar de las levantadas simuladas a ritmo fijo. Pruebas en `tests/drawing-anim2.test.mjs` (duración del plan, la punta recorre los trazos en orden, silencio entre trazos y un golpe por trazo; sin bandera, igual que siempre). Calidad del sonido: [H].
**Pendiente**: revisión independiente de un capítulo con la bandera.

## M3 — `Label` con glifos de un trazo y plan de mano (`?anim=2`) — ciclo 25
**Qué**: `glyphs.js` pasa al motor (re-exportado en el laboratorio). `Label` con nivel 2: si todos los signos del texto tienen glifo, se escribe con glifos de un trazo (altura de mayúscula 0.72 × el tamaño de la fuente, ancho 0.16·S, ×1.4 en negrita, kerning de mano como en E13) y `reveal` es la fracción del tiempo de escritura; si falta algún glifo, queda la fuente de siempre. `d.draw(label, s, {key: 'reveal'})` usa la duración del plan con `s` como tope y el rasgueo con la envolvente del plan (`planKey`). 195 textos literales de `Label` en el juego; signos sin glifo: W, ≠, comillas (y lo que venga de plantillas).
**Encontrado**: en trazos cortos la levantada fija de 14 px se comía el trazo (el palito de la «t» casi sin tiza) → `depositStroke(..., {liftFrac})`: la levantada ocupa a lo sumo esa fracción del largo (los Label usan 0.3; el laboratorio no cambia: **la slice sigue idéntica píxel a píxel al benchmark**).
**A/B** (`c29/`, título «¿Están todos?» de c1.vuelven): la fuente se revelaba con un barrido; con la bandera se escribe letra a letra. Peso calibrado con recorte dpr 2 (0.13·S → 0.16·S, negrita ×1.25 → ×1.4).
**Regresión**: bot del capítulo 1 con la bandera: 0 errores, mismas evidencias, fps mín. 46.7 (una corrida simultánea con otro navegador dio 30.1: era contención, no la bandera).
**Abierto**: el título sigue con `d.fadeTo` al salir (un fundido de tiza, VL §8): es el borrado, que migra en un paso aparte.
