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
