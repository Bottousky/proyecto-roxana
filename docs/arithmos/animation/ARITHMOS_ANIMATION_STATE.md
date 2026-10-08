# ARITHMOS ANIMATION LAB · Estado

**Última actualización**: 2026-10-07, ciclo 10.
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
- E08 cámara: `animlab/core/camera2.js` — van Wijk–Nuij con duración por costo; paneo pico 1.35 vs 3.85 pantallas/s; llega antes de la acción; trauma.
- E10 microescena «¿Cuántos son?» (17 s): personaje + Punto + tiza + cámara + sonido + cambio de representación (7 puntos → marcas → 5 + 2 = 7). Base de la vertical slice. WAV en `artifacts/arithmos/animlab/c09/t10e/score.wav` (sin escuchar).
- E11 poses con silueta (`animlab/core/poses.js`): cada pose trae su orientación; aplicado a E10 (`c10/t10h`): sorpresa de frente, eureka, paso atrás para mirar lo hecho.

## Decisión (con evidencia de E01–E10): **B. Reconstrucción parcial**
- **Se conserva**: el compuesto WebGL de presión + diente (`renderer.js`) — es la base de la textura en todas las técnicas ganadoras; el modelo de mundo/escenas, el director asincrónico, la UI, el guardado y el contenido de los 12 capítulos.
- **Se reemplaza, módulo por módulo** (cada uno ya probado en el laboratorio con comparación A/B):
  1. tiempo de dibujo: `d.draw` lineal → plan de mano (`animlab/core/motion.js`, `deposit.js`) — E01, E02;
  2. texto: fuente + barrido → glifos de un trazo + identidad por símbolo (`glyphs.js`) — E03;
  3. Punto: `Dot` + `zip/hop` → `blob.js` (segundo orden, área constante) — E05;
  4. figura: mezcla de poses → `actor.js` (canales superpuestos, pisadas, IK) — E09; **requiere poses nuevas**;
  5. borrado: fundido → `eraser.js` — E07;
  6. cámara: `Camera.go` → `camera2.js` — E08;
  7. sonido de tiza: envolvente fija → partitura desde la línea de tiempo (`score.js`) — E10.
- **Por qué no rebuild**: ningún experimento encontró un límite en la arquitectura de render ni en el mundo; los límites estaban en tiempo y actuación, y son reemplazables detrás de las mismas APIs (`Drawing`, `Label`, `Dot`, `Figure`, `Camera`, `d.draw`). Un rebuild tiraría 12 capítulos de contenido verificado sin ganancia visual medible.
- **Por qué no continuar tal cual**: E03 (fundido con fantasmas), E07 (fundido), E08 (3.85 pantallas/s), E09 (patinaje) muestran defectos de nivel 1 del quality bar que el motor actual no puede corregir con parámetros.
- **Condición para migrar al juego**: que la vertical slice (basada en E10) pase una revisión independiente en nivel ≥ 4 en Timing, Actuación y Matemática; recién entonces se adapta `src/engine` (adaptadores para no reescribir escenas) y se migra un capítulo piloto.

## Siguiente (en orden)
1. **Revisión independiente R2 de E10** (sólo imágenes de t10e + WAV no aplica: el revisor no escucha).
2. ~~Poses nuevas~~ (hecho en E11; pendiente: hombros para encogerse).
3. **Vertical slice** = E10 + poses nuevas + correcciones de R2 + una transformación con deslizamiento y un borrado (E03/E07) + composición final legible. Nivel objetivo 4 en todo.
4. Rendimiento: medir tiza + polvo por cuadro de la vertical slice en escritorio (HUD) y dejar listo el pedido de prueba en teléfono [H].
5. Después: adaptadores en `src/engine` y capítulo piloto (sólo con la slice aprobada).

## Abierto / humano
- Audio: nada certificado (nadie escuchó).
- Teléfono real: rendimiento de B sin medir.
