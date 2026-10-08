# ARITHMOS ANIMATION LAB · Estado

**Última actualización**: 2026-10-07, ciclo 1.
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

## Decisión provisional (se confirma tras E03, E05 y E09)
**B. Reconstrucción parcial**: conservar renderer WebGL, mundo, director y escenas; reemplazar progresivamente (1) el tiempo de dibujo por el plan de mano, (2) el texto por escritura con glifos de un trazo, (3) la actuación por sistemas de segundo orden con superposición. Sin reescribir capítulos hasta que la vertical slice alcance el quality bar.

## Siguiente (en orden)
1. E02 círculo: lento/rápido/pausa/aceleración/corrección/borrado; cruce que acumula; rendimiento de B con 200 trazos.
2. E03 escritura: `animlab/core/glyphs.js` (0–9, x, y, +, −, =, (, ), /) de un trazo; «x − 3 = 5» → «x − 3 + 3 = 5 + 3» → «x = 8» con identidad por símbolo (VISUAL_LANGUAGE §5).
3. E05 Punto (segundo orden, anticipación, asentamiento), E09 figura (superposición, pies plantados).
4. E07 borrado, E08 cámara, E04 cambio de representación, E06 función.
5. E10 microescena → base de la vertical slice.

## Abierto / humano
- Audio: nada certificado (nadie escuchó).
- Teléfono real: rendimiento de B sin medir.
