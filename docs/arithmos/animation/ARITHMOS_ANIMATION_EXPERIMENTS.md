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
