# ARITHMOS ANIMATION LAB · Estado

**Última actualización**: 2026-10-07, ciclo 7.
**Loop**: `/loop 1m` (cron de sesión). Rama `claude/arithmos-graphic-adventure-065e68`, worktree `arithmos-graphic-adventure-065e68`. Sólo commits locales.

## Cómo retomar
1. Leer este archivo, luego `ARITHMOS_ANIMATION_EXPERIMENTS.md` (último experimento) y `ARITHMOS_ANIMATION_QUALITY_BAR.md`.
2. Laboratorio: `cd experiments/arithmos && npm start` → `http://127.0.0.1:4195/animlab/?test=01&play=1`.
3. Captura: `node scripts/animlab-capture.mjs <test> ../../artifacts/arithmos/animlab/cNN/<nombre> --frames=9 '--crop=x,y,w,h;…'` (siempre carpeta nueva).
4. Curvas: `node scripts/animlab-plot.mjs <probes.json> <png> A.v,B.v`.

## Documentos
`docs/arithmos/animation/`: RESEARCH (incluye la auditoría del motor actual), TECHNIQUE_MATRIX, QUALITY_BAR, VISUAL_LANGUAGE, PIPELINE, EXPERIMENTS, STATE. Enlaces simbólicos en `docs/arithmos/ARITHMOS_ANIMATION_*.md` para los cinco que lee el loop.

## Hecho
- Auditoría del motor actual (RESEARCH §0): el render (presión + compuesto de diente WebGL) es bueno; el tiempo (progreso lineal), el texto (barrido) y la actuación (pose a pose sin superposición) están por debajo del quality bar.
- Laboratorio determinista `experiments/arithmos/animlab/` con tiempo buscable, sondas y métricas sobre el lienzo de presión.
- E01 línea: tres técnicas comparadas; gana B (depósito + plan de mano) en tiempo; textura empata o mejora levemente.
- E02 círculo: `animlab/core/gesture.js` (trazo / tiza apoyada / espera / borrador) cubre lenta, rápida, pausa, aceleración, corrección y borrado; el repaso acumula; ≈ 1 ms por trazo terminado (hay que cachear al integrar). Lección técnica: nunca `destination-out` en el lienzo de presión.
- E03 ecuación: glifos de un trazo (`animlab/core/glyphs.js`) + identidad por símbolo con el «=» como pivote; «x − 3 = 5 → x − 3 + 3 = 5 + 3 → x = 8» causal y legible; el motor actual (fuente + barrido + fundido) muestra fantasmas superpuestos. Recalibradas las levantadas.
- E05 Punto: `animlab/core/blob.js` (segundo orden buscable, deformación de área constante, salto, división con cuello, fusión con la línea). Anticipa, sobrepasa ~6 % y se asienta; 1 → 2 → 4 → 8 → recta.
- R1 (revisión independiente de E03/E05): ninguna llega al mínimo de producción; disposición punto por punto en EXPERIMENTS.
- E09 figura: `animlab/core/actor.js` — pies plantados (0.015 px de deslizamiento), cadera con arranque/frenada, follow-through medido; anticipación mal guionada y siluetas débiles.
- P1 pulido: resueltos los hallazgos aceptados de R1 (deformación ≤ 25 %, borde de Punto en el diente, rastro con forma de glifo, subrayado que une 5 + 3 con el 8, anticipación de señalar). Pendiente: poses con siluetas claras.
- E07 borrado: `animlab/core/eraser.js` — borrador visible con plan de mano, huella de fieltro, neblina sólo donde había tiza (ilegible), polvo que cae.

## Decisión provisional (se confirma tras E03, E05 y E09)
**B. Reconstrucción parcial**: conservar renderer WebGL, mundo, director y escenas; reemplazar progresivamente (1) el tiempo de dibujo por el plan de mano, (2) el texto por escritura con glifos de un trazo, (3) la actuación por sistemas de segundo orden con superposición. Sin reescribir capítulos hasta que la vertical slice alcance el quality bar.

## Siguiente (en orden)
1. E08 cámara (lead, reencuadre por mínimo jerk con duración según escala/distancia, temblor por trauma).
2. Mano visible que escribe (falta en E03).
3. Poses nuevas con siluetas (brazos separados, línea de acción).
4. E07 borrado (borrador visible + neblina), E08 cámara, E04 cambio de representación, E06 función.
5. E10 microescena → base de la vertical slice.

## Abierto / humano
- Audio: nada certificado (nadie escuchó).
- Teléfono real: rendimiento de B sin medir.
