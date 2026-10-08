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
